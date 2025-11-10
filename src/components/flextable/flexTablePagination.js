"use client";
import { useFlexTable } from "../../context/flexTableContext.js";
import { TablePagination } from "../table/tablePagination.js";

export const FlexTablePagination = ({ className = "" }) => {
  const {
    batchSize,
    setBatchSize,
    totalCount,
    pageInfo,
    variables,
    setVariables,
    currentSkip,
    setCurrentSkip,
    hasPreviousPage,
    hasNextPage,
  } = useFlexTable();

  const handlePageSizeChange = (newBatchSize) => {
    setBatchSize(newBatchSize);
    setVariables({ ...variables, first: newBatchSize });
    setCurrentSkip(0);
  };

  const handleNextPage = () => {
    // Track the current page size before navigating
    const currentPageSize = pageInfo?.count || batchSize;
    setCurrentSkip((prev) => prev + currentPageSize);
    setVariables({ ...variables, after: pageInfo?.endCursor });
  };

  const handlePreviousPage = () => {
    // Go back by the current page size
    const newSkip = Math.max(0, currentSkip - batchSize);
    setCurrentSkip(newSkip);
    setVariables({ ...variables, after: null, skip: newSkip });
  };

  // Page size
  return (
    <TablePagination
      className={className}
      pageStart={currentSkip}
      pageEnd={Math.min(currentSkip + batchSize, totalCount)}
      totalCount={totalCount}
      pageSize={batchSize}
      onNext={handleNextPage}
      onPrevious={handlePreviousPage}
      onPageSizeChange={handlePageSizeChange}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
    />
  );
};
