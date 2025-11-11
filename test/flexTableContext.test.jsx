import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { SimpleTable } from "./mockTables/simpleTable";
import { FlexTableProvider } from "../dist/context/flexTableContext";
import { mockUseTranslations } from "./mocks/useTranslations";

describe("FlexTableContext", () => {
  it("should throw error when query is not provided", () => {
    expect(() => {
      render(
        <FlexTableProvider useTranslations={mockUseTranslations}>
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
  it("should throw error when invalid variant is provided", () => {
    const mockQuery = vi.fn();

    expect(() => {
      render(
        <FlexTableProvider
          useTranslations={mockUseTranslations}
          query={mockQuery}
          variant="invalid"
        >
          <div>Test</div>
        </FlexTableProvider>
      );
    }).toThrow("The param 'variant' must be either 'async' or 'static'");
  });

  it("should not throw errors when a valid query function is provided", async () => {
    const mockQuery = vi.fn().mockReturnValue({
      nodes: [{ id: "1", name: "John Doe", email: "john.doe@example.com" }],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: false,
      },
      totalCount: 1,
    });

    await act(async () => {
      render(
        <FlexTableProvider
          useTranslations={mockUseTranslations}
          query={mockQuery}
          variant="async"
        >
          <SimpleTable />
        </FlexTableProvider>
      );
    });
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
  });
});
