import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { SimpleTable } from "./mockTables/simpleTable";
import { FlexTableProvider } from "../dist/context/flexTableContext";
import { generatePersonData } from "./mockData/tableData";
import { mockUseTranslations } from "./mocks/useTranslations";

describe("Pagination (async)", () => {
  it("should render only first 10 results when batch size is 10", async () => {
    const mockQuery = vi.fn().mockReturnValue({
      nodes: generatePersonData(10),
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: true,
      },
      totalCount: 20,
    });

    await act(async () => {
      render(
        <FlexTableProvider
          useTranslations={mockUseTranslations}
          query={mockQuery}
          defaultBatchSize={10}
          variant="async"
        >
          <SimpleTable />
        </FlexTableProvider>
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Name 1")).toBeInTheDocument();
      expect(screen.getByText("email1@example.com")).toBeInTheDocument();
      expect(screen.getByText("Name 10")).toBeInTheDocument();
      expect(screen.getByText("email10@example.com")).toBeInTheDocument();
      expect(screen.queryByText("Name 11")).not.toBeInTheDocument();
      expect(screen.queryByText("email11@example.com")).not.toBeInTheDocument();
    });
  });
});
