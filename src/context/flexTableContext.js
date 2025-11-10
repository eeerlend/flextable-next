"use client";
import { createContext, useContext, useEffect, useState } from "react";

const FlexTableContext = createContext();

export const FlexTableProvider = ({
  query,
  children,
  defaultVariables = {},
  defaultBatchSize = 25,
  baseFilter = {},
  baseOrderBy = {},
}) => {
  if (!query || typeof query !== "function") {
    throw new Error("The param 'query' must be a function");
  }

  const [rows, setRows] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variables, setVariables] = useState(defaultVariables);
  const [batchSize, setBatchSize] = useState(defaultBatchSize);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const fetchData = async () => {
    try {
      const filter = { AND: [] };
      // Add baseFilter - if it's already an AND array, spread it; otherwise wrap it
      if (baseFilter && Object.keys(baseFilter).length > 0) {
        if (baseFilter.AND && Array.isArray(baseFilter.AND)) {
          filter.AND.push(...baseFilter.AND);
        } else {
          filter.AND.push(baseFilter);
        }
      }
      // Add variables filter if it exists
      if (variables?.filter) {
        if (variables.filter.AND && Array.isArray(variables.filter.AND)) {
          filter.AND.push(...variables.filter.AND);
        } else {
          filter.AND.push(variables.filter);
        }
      }

      // Build the full variables object with pagination params and merged filter
      const queryVariables = {
        ...variables,
        filter: filter.AND.length > 0 ? filter : undefined,
        first: variables?.first || batchSize,
      };

      // problem if orderBy is {createdAt: undefined} because it will be removed from the query
      if (!queryVariables.orderBy) {
        queryVariables.orderBy = baseOrderBy;
      }

      const data = await query(queryVariables);

      setRows(data?.nodes || []);
      setPageInfo(data?.pageInfo || {});
      setTotalCount(data?.totalCount || 0);

      // Update currentSkip based on pagination method
      if (variables?.after) {
        // Cursor-based forward pagination: increment by the count of items on previous page
        // We need to track this, but we don't know the previous count here
        // So we'll handle it in the pagination component
      } else {
        // Skip-based pagination: use the skip value
        setCurrentSkip(variables?.skip || 0);
      }
    } catch (error) {
      console.log("error", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [query, variables]);

  const onAddRow = (newRow) => {
    setRows((prevRows) => [newRow, ...prevRows]);
    setTotalCount((prevTotal) => prevTotal + 1);
  };

  const onEditRow = (editedRow) => {
    setRows((prevRows) =>
      prevRows.map((row) => (editedRow.id === row.id ? editedRow : row))
    );
  };

  const onDeleteRow = (deletedRowId) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== deletedRowId));
    setTotalCount((prevTotal) => prevTotal - 1);
  };

  useEffect(() => {
    setHasPreviousPage(pageInfo?.hasPreviousPage || currentSkip > 0);
    setHasNextPage(pageInfo?.hasNextPage);
  }, [pageInfo, currentSkip]);

  return (
    <FlexTableContext.Provider
      value={{
        batchSize,
        setBatchSize,
        error,
        isLoading,
        pageInfo,
        rows,
        setVariables,
        totalCount,
        variables,
        currentSkip,
        setCurrentSkip,
        onAddRow,
        onEditRow,
        onDeleteRow,
        hasNextPage,
        hasPreviousPage,
      }}
    >
      {children}
    </FlexTableContext.Provider>
  );
};

export const useFlexTable = () => {
  const context = useContext(FlexTableContext);
  if (!context) {
    throw new Error("useFlexTable must be used within a FlexTableProvider");
  }
  return context;
};
