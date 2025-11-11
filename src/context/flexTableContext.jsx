"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { stringSimilarity } from "string-similarity-js";

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
    throw new Error("The param 'variant' must be either 'async' or 'static'");
  }

  const [rows, setRows] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variables, setVariables] = useState({});
  const [batchSize, setBatchSize] = useState(defaultBatchSize);
  const [currentSkip, setCurrentSkip] = useState(0);
  // Static data
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const populateFilter = useCallback(() => {
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
  }, [variables?.filter, filterOperators.AND]);

  const stringComparison = useCallback((value, searchString) => {
    if (
      value === null ||
      value === undefined ||
      searchString === null ||
      searchString === undefined
    ) {
      return false;
    }
    if (String(value).toLowerCase().includes(searchString.toLowerCase())) {
      return true;
    }
    const similarity = stringSimilarity(value, searchString);
    return similarity > 0.6;
  }, []);

  const applyStaticFilter = useCallback(
    (data, filter) => {
      if (filter) {
        if (
          filter &&
          filter[filterOperators.OR] &&
          Array.isArray(filter[filterOperators.OR])
        ) {
          return data.filter((item) => {
            return filter[filterOperators.OR].some((orFilter) => {
              return Object.keys(orFilter).some((key) => {
                const keys = key.split(".");
                const value = keys.reduce((acc, key) => acc[key], item);
                const searchString = orFilter[key]?.contains?.toLowerCase();
                if (!searchString) return false;
                return stringComparison(value, searchString);
              });
            });
          });
        }
      }
      return data;
    },
    [stringComparison]
  );

  const applyStaticSorting = useCallback((data, orderBy) => {
    if (orderBy && Object.keys(orderBy).length > 0) {
      const keyString = Object.keys(orderBy)[0];
      const keys = keyString.split(".");

      const direction = orderBy[keyString];
      return [...data].sort((a, b) => {
        const aValue = keys.reduce((acc, key) => acc[key], a);
        const bValue = keys.reduce((acc, key) => acc[key], b);
        return direction === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : bValue > aValue
          ? 1
          : -1;
      });
    }
    return data;
  }, []);

  const fetchStaticData = useCallback(async () => {
    setIsLoading(true);
    const data = await query();

    const newAllData = data || [];
    return newAllData;
  }, [query]);

  const applyStaticPagination = useCallback(
    (data, currentSkip, batchSize) => {
      return data.slice(currentSkip, currentSkip + batchSize);
    },
    [currentSkip, batchSize]
  );

  const handleStaticData = useCallback(async () => {
    try {
      let newAllData;
      if (allData.length === 0) {
        newAllData = await fetchStaticData();
        setAllData(newAllData);
      } else {
        newAllData = allData;
      }

      const sortedData = applyStaticSorting(newAllData, variables?.orderBy);
      const newFilteredData = applyStaticFilter(sortedData, variables?.filter);

      setPageInfo({
        hasPreviousPage: currentSkip > 0,
        hasNextPage: currentSkip + batchSize < newFilteredData.length,
      });

      setRows(applyStaticPagination(newFilteredData, currentSkip, batchSize));

      setFilteredData(newFilteredData);
      setTotalCount(newFilteredData.length);
    } catch (error) {
      console.log("error", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    allData,
    currentSkip,
    batchSize,
    variables?.orderBy,
    variables?.filter,
    fetchStaticData,
    applyStaticSorting,
    applyStaticFilter,
    applyStaticPagination,
  ]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
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
  }, [query, variables, batchSize, populateFilter]);

  const onAddRow = useCallback((newRow) => {
    setRows((prevRows) => [newRow, ...prevRows]);
    setTotalCount((prevTotal) => prevTotal + 1);
  }, []);

  const onEditRow = useCallback((editedRow) => {
    setRows((prevRows) =>
      prevRows.map((row) => (editedRow.id === row.id ? editedRow : row))
    );
  }, []);

  const onDeleteRow = useCallback((deletedRowId) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== deletedRowId));
    setTotalCount((prevTotal) => prevTotal - 1);
  }, []);

  // Compute pagination based on variant
  const computedHasPreviousPage = useMemo(() => {
    if (variant === "static") {
      // For static, calculate based on filteredData and currentSkip
      return currentSkip > 0;
    }
    // For async, use pageInfo or currentSkip
    return pageInfo?.hasPreviousPage || currentSkip > 0;
  }, [variant, pageInfo?.hasPreviousPage, currentSkip]);

  const computedHasNextPage = useMemo(() => {
    if (variant === "static") {
      // For static, calculate based on filteredData length, currentSkip, and batchSize
      return currentSkip + batchSize < filteredData.length;
    }
    // For async, use pageInfo
    return pageInfo?.hasNextPage || false;
  }, [
    variant,
    pageInfo?.hasNextPage,
    currentSkip,
    batchSize,
    filteredData.length,
  ]);

  // useEffect(() => {
  //   // Update state values for both variants
  //   setHasPreviousPage(computedHasPreviousPage);
  //   setHasNextPage(computedHasNextPage);
  // }, [computedHasPreviousPage, computedHasNextPage]);

  useEffect(() => {
    if (variant === "async") {
      fetchData();
    } else {
      handleStaticData();
    }
  }, [query, variables, variant, fetchData, handleStaticData]);

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
        hasNextPage: computedHasNextPage,
        hasPreviousPage: computedHasPreviousPage,
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
