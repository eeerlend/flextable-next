import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { SimpleTable } from "./mockTables/simpleTable";
import { FlexTableProvider } from "../dist/context/flexTableContext";
import { mockUseTranslations } from "./mocks/useTranslations";

describe("SimpleTable (async)", () => {
  it("should throw error when query is not provided", () => {
    expect(() => {
      render(
        <FlexTableProvider useTranslations={mockUseTranslations}>
          <div>Test</div>
        </FlexTableProvider>
      );
    }).toThrow("The param 'query' must be a function");
  });
  it("should not throw error when valid parameters are provided", () => {
    const mockQuery = vi.fn();

    expect(async () => {
      await act(async () => {
        render(
          <FlexTableProvider
            useTranslations={mockUseTranslations}
            query={mockQuery}
          >
            <SimpleTable />
          </FlexTableProvider>
        );
      });
    }).not.toThrow();
  });

  it("should render table with data when query is successful", async () => {
    const mockQuery = vi.fn().mockReturnValue({
      nodes: [
        { id: "1", name: "John Doe", email: "john.doe@example.com" },
        { id: "2", name: "Jane Doe", email: "jane.doe@example.com" },
      ],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: false,
      },
      totalCount: 2,
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
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("jane.doe@example.com")).toBeInTheDocument();
    });
  });
});
