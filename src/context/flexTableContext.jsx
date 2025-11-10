"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  // Static data
  const [allData, setAllData] = useState([]);

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

  const fetchData = useCallback(async () => {
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
  }, [query, variables, batchSize]);

  const stringComparison = (value, searchString) => {
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
  };

  const applyStaticFilter = (data, filter) => {
    if (filter) {
      return data.filter((item) => {
        return filter.or.some((orFilter) => {
          return Object.keys(orFilter).some((key) => {
            const keys = key.split(".");
            const value = keys.reduce((acc, key) => acc[key], item);
            const searchString = orFilter[key]?.contains.toLowerCase();
            return stringComparison(value, searchString);
          });
        });
      });
    }
    return data;
  };

  const applyStaticSorting = (data, orderBy) => {
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
  };

  const handleStaticData = async () => {
    try {
      let newAllData;
      if (allData.length === 0) {
        newAllData = await fetchStaticData();
        setAllData(newAllData);
      } else {
        newAllData = allData;
      }

      setPageInfo({
        hasPreviousPage: currentSkip > 0,
        hasNextPage: currentSkip + batchSize < newAllData.length,
      });

      const sortedData = applyStaticSorting(newAllData, variables?.orderBy);
      const filteredData = applyStaticFilter(sortedData, variables?.filter);
      setRows(filteredData.slice(currentSkip, currentSkip + batchSize));

      setTotalCount(newAllData.length);
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
