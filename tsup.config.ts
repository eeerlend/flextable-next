import { defineConfig } from "tsup";
import { readdir, stat, readFile, writeFile } from "fs/promises";
import { join } from "path";

// Add .js extensions to relative imports/exports (same as original build.js)
function addJsExtensions(content) {
  const relativeImportRegex =
    /(from\s+['"]|import\s+['"]|export\s+\*\s+from\s+['"])(\.\.?\/[^'"]+)(['"])/g;

  return content.replace(relativeImportRegex, (match, prefix, path, suffix) => {
    // Skip if already has an extension
    if (/\.[^./]+$/.test(path)) {
      return match;
    }
    // Add .js extension
    return `${prefix}${path}.js${suffix}`;
  });
}

// Post-build: ensure all relative imports have .js extensions
async function postBuild() {
  const distDir = join(process.cwd(), "dist");

  async function getAllJsFiles(dir, fileList = []) {
    const files = await readdir(dir);
    for (const file of files) {
      const filePath = join(dir, file);
      const fileStat = await stat(filePath);
      if (fileStat.isDirectory()) {
        await getAllJsFiles(filePath, fileList);
      } else if (file.endsWith(".js") && !file.endsWith(".map")) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  const jsFiles = await getAllJsFiles(distDir);

  for (const filePath of jsFiles) {
    const content = await readFile(filePath, "utf-8");
    const updatedContent = addJsExtensions(content);
    if (content !== updatedContent) {
      await writeFile(filePath, updatedContent, "utf-8");
    }
  }

  console.log(`✓ Post-processed ${jsFiles.length} files`);
}

export default defineConfig({
  entry: ["src/**/*.{js,jsx}"],
  format: ["esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  // Important for Next.js 16
  target: "es2020",
  platform: "browser",
  // Preserve file structure (like your current build)
  bundle: false,
  // Explicitly tell esbuild to treat .js files as JSX
  loader: {
    ".js": "jsx",
    ".jsx": "jsx",
  },
  esbuildOptions(options) {
    options.jsx = "automatic";
    options.jsxImportSource = "react";
    options.outExtension = {
      ".js": ".js",
    };
  },
  onSuccess: async () => {
    await postBuild();
  },
});
