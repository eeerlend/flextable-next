import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { SimpleTable } from "./mockTables/simpleTable";
import { FlexTableProvider } from "../dist/context/flexTableContext";
import { FlexTablePagination } from "../dist/components/flextable/flexTablePagination";
import { generatePersonData } from "./mockData/tableData";
import { mockUseTranslations } from "./mocks/useTranslations";

describe("Pagination (static)", () => {
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
  it("should navigate to next page when next button is clicked", async () => {
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
    // Wait for initial page to load
    await waitFor(() => {
      expect(screen.getByText("Name 1")).toBeInTheDocument();
      expect(screen.queryByText("Name 11")).not.toBeInTheDocument();
    });

    const prevButton =
      screen
        .getAllByRole("button")
        .find((button) => button.disabled && button.querySelector("svg")) ||
      screen.getAllByRole("button")[0]; // Usually the second button is next

    expect(prevButton).toBeDisabled();

    // Find and click the next button
    // The button contains MdNavigateNext icon, so we can find it by its role or by querying buttons
    const nextButton =
      screen
        .getAllByRole("button")
        .find((button) => !button.disabled && button.querySelector("svg")) ||
      screen.getAllByRole("button")[0]; // Usually the second button is next

    // Verify it's enabled
    expect(nextButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(nextButton);
    });

    // Wait for next page results
    await waitFor(() => {
      expect(screen.getByText("Name 11")).toBeInTheDocument();
      expect(screen.getByText("email11@example.com")).toBeInTheDocument();
      expect(screen.getByText("Name 20")).toBeInTheDocument();
      expect(screen.getByText("email20@example.com")).toBeInTheDocument();
      // Previous page items should not be visible
      expect(screen.queryByText("Name 1")).not.toBeInTheDocument();
      expect(screen.queryByText("email1@example.com")).not.toBeInTheDocument();
    });
  });
});
