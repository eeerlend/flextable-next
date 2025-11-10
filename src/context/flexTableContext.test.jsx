import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlexTableProvider, useFlexTable } from "./flexTableContext";

describe("FlexTableContext", () => {
  it("should throw error when query is not provided", () => {
    expect(() => {
      render(
        <FlexTableProvider useTranslations={() => ({ t: () => "" })}>
          <div>Test</div>
        </FlexTableProvider>
      );
    }).toThrow("The param 'query' must be a function");
  });
  it("should throw error when useTranslations is not provided", () => {
    const mockQuery = vi.fn();
    expect(() => {
      render(
        <FlexTableProvider query={mockQuery}>
          <div>Test</div>
        </FlexTableProvider>
      );
    }).toThrow("The param 'useTranslations' must be a valid function");
  });
});
