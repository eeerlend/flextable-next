import { build } from "esbuild";
import { readdir, stat, mkdir, copyFile } from "fs/promises";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, "src");
const distDir = join(__dirname, "dist");

// Recursively get all JS files from src
async function getAllJsFiles(dir, fileList = []) {
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      await getAllJsFiles(filePath, fileList);
    } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

async function buildPackage() {
  // Clean dist directory
  if (existsSync(distDir)) {
    const { rm } = await import("fs/promises");
    await rm(distDir, { recursive: true });
  }
  await mkdir(distDir, { recursive: true });

  // Get all JS files
  const jsFiles = await getAllJsFiles(srcDir);

  // Build each file with esbuild
  const buildPromises = jsFiles.map(async (filePath) => {
    const relativePath = relative(srcDir, filePath);
    const outputPath = join(distDir, relativePath);
    const outputDir = dirname(outputPath);

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Build with esbuild
    await build({
      entryPoints: [filePath],
      outfile: outputPath,
      format: "esm",
      bundle: false,
      platform: "browser",
      jsx: "automatic",
      jsxImportSource: "react",
      loader: {
        ".js": "jsx",
        ".jsx": "jsx",
      },
      target: "es2020",
      logLevel: "silent",
    });
  });

  await Promise.all(buildPromises);

  console.log(`✓ Built ${jsFiles.length} files to dist/`);
}

buildPackage().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
