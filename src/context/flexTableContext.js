"use client";
import { createContext, useContext, useEffect, useState } from "react";

const FlexTableContext = createContext();

export const FlexTableProvider = ({
  defaultBatchSize = 25,
  children,
  filterOperators = {
    AND: "and",
    OR: "or",
    NOT: "not",
  },
  useTranslations,
  variant = "async",
  query,
}) => {
  if (!query || typeof query !== "function") {
    throw new Error("The param 'query' must be a function");
  }

  if (!useTranslations || typeof useTranslations !== "function") {
    throw new Error("The param 'useTranslations' must be a valid function");
  }

  if (!variant || !["async", "static"].includes(variant)) {
    throw new Error("The param 'variant' must be either 'async' or 'sync'");
  }

  const [rows, setRows] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [error, setError] = useState(null);
  const [variables, setVariables] = useState({});
  const [batchSize, setBatchSize] = useState(defaultBatchSize);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const populateFilter = () => {
    let newFilter = variables?.filter || {};
    if (newFilter && Object.keys(newFilter).length > 0) {
      if (
        newFilter[filterOperators.AND] &&
        Array.isArray(newFilter[filterOperators.AND])
      ) {
        newFilter[filterOperators.AND].push(...newFilter[filterOperators.AND]);
      } else {
        newFilter = newFilter;
      }
    }
    return newFilter;
  };

  const fetchData = async () => {
    try {
      const newFilter = populateFilter();

      const data = await query({
        ...variables,
        filter: newFilter,
        first: variables?.first || batchSize,
      });

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

  const fetchStaticData = async () => {
    setIsLoading(true);
    const data = await query();

    const newAllData = data || [];
    return newAllData;
  };

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

  const handleStaticData = async () => {
    try {
      let newAllData;
      if (allData.length === 0) {
        newAllData = await fetchStaticData();
        setAllData(newAllData);
      } else {
        newAllData = allData;
      }

      setRows(newAllData);
      setTotalCount(newAllData.length);
    } catch (error) {
      console.log("error", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (variant === "async") {
      fetchData();
    } else {
      handleStaticData();
    }
  }, [query, variables, variant]);

  return (
    <FlexTableContext.Provider
      value={{
        batchSize,
        setBatchSize,
        error,
        filterOperators,
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
        useTranslations,
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
