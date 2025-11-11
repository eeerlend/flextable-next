import { vi } from "vitest";

export const mockUseTranslations = vi.fn(() => (tKey) => {
  return tKey || "a translation";
});
