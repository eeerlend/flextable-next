import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { SimpleTable } from "./mockTables/simpleTable";
import { FlexTableProvider } from "../dist/context/flexTableContext";
import { FlexTableSearch } from "../dist/components/flextable/flexTableSearch";
import { FlexTablePagination } from "../dist/components/flextable/flexTablePagination";
import { generatePersonData } from "./mockData/tableData";
import { mockUseTranslations } from "./mocks/useTranslations";

describe("Search (static)", () => {
  it("should render only first 10 results when batch size is 10", async () => {
    const data = generatePersonData(20);
    const mockQuery = vi.fn().mockReturnValue(data);

    await act(async () => {
      render(
        <FlexTableProvider
          useTranslations={mockUseTranslations}
          query={mockQuery}
          defaultBatchSize={10}
          variant="static"
        >
          <SimpleTable />
          <FlexTablePagination />
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
  it("should render only results that match the search query", async () => {
    const data = generatePersonData(20);
    const mockQuery = vi.fn().mockReturnValue(data);

    await act(async () => {
      render(
        <FlexTableProvider
          useTranslations={mockUseTranslations}
          query={mockQuery}
          defaultBatchSize={10}
          variant="static"
        >
          <SimpleTable />
          <FlexTableSearch fields={["name"]} placeholder="Search" />
        </FlexTableProvider>
      );
    });

    const searchInput = screen.getByPlaceholderText("Search");

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "11" } });
    });

    // Wait for initial page to load
    await waitFor(() => {
      expect(screen.queryByText("Name 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Name 11")).toBeInTheDocument();
    });
  });

  it("should render only results that almost match the search query (case insensitive)", async () => {
    const data = generatePersonData(20);
    const mockQuery = vi.fn().mockReturnValue(data);

    await act(async () => {
      render(
        <FlexTableProvider
          useTranslations={mockUseTranslations}
          query={mockQuery}
          defaultBatchSize={10}
          variant="static"
        >
          <SimpleTable />
          <FlexTableSearch
            fields={["name"]}
            placeholder="Search"
            debounceTime={0}
          />
        </FlexTableProvider>
      );
    });

    const searchInput = screen.getByPlaceholderText("Search");

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "name 11" } });
    });

    // Wait for initial page to load
    await waitFor(() => {
      expect(screen.queryByText("Name 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Name 11")).toBeInTheDocument();
    });
  });
});
