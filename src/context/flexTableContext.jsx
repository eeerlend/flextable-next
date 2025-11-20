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
import { handleStringFilterStatic } from "../lib/handleStringFilterStatic.js";
import { handleNumberFilterStatic } from "../lib/handleNumberFilterStatic.js";
import { handleDateFilterStatic } from "../lib/handleDateFilterStatic.js";

const FlexTableContext = createContext();

/**
 * @function FlexTableProvider
 * @description Provides the context for the FlexTable component
 * @param {Object} props
 * @param {number} [props.defaultBatchSize=25]
 * @param {React.ReactNode} props.children
 * @param {Object} [props.filterOperators]
 * @param {string} props.filterOperators.AND
 * @param {string} props.filterOperators.OR
 * @param {string} props.filterOperators.NOT
 * @param {Function} props.useTranslations
 * @param {string} [props.variant="async"]
 * @param {Function} props.query
 * @param {Object} [props.queryParams={}]
 * @returns {React.ReactNode}
 */
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
  queryParams = {},
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
  const [activeFilters, setActiveFilters] = useState({});
  const [activeSearch, setActiveSearch] = useState({});

  // Static data
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const populateFilter = useCallback(() => {
    // activeFilters is an object with the filter name as the key and the filter as the value
    const newFilter = { [filterOperators.AND]: [] };
    Object.values(activeFilters).forEach((filter) => {
      newFilter[filterOperators.AND].push(filter);
    });

    // apply search filter
    if (activeSearch) {
      newFilter[filterOperators.AND].push(activeSearch);
    }

    return newFilter;
  }, [activeFilters, activeSearch]);

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
    return similarity > 0.5;
  }, []);

  const detectType = useCallback((filter) => {
    if (filter?.equals) {
      return typeof filter?.equals === "string" ? "string" : "number";
    } else if (filter?.contains) {
      return typeof filter?.contains === "string" ? "string" : "number";
    } else if (
      filter?.before ||
      filter?.after ||
      filter?.lte ||
      filter?.gte ||
      filter?.lt ||
      filter?.gt
    ) {
      return "date";
    }
    return typeof filter === "string" ? "string" : "number";
  }, []);

  const applyDirectFilter = useCallback((item, inFilter, key) => {
    const keys = key.split(".");
    const value = keys.reduce((acc, key) => acc[key], item);
    const currentFilter = inFilter[key];
    switch (detectType(currentFilter)) {
      case "string":
        return handleStringFilterStatic(value, currentFilter);
      case "number":
        return handleNumberFilterStatic(value, currentFilter);
      case "date":
        return handleDateFilterStatic(value, currentFilter);
      default:
        return false;
    }
  }, []);

  const applyStaticFilter = useCallback(
    (data) => {
      let rows = data;

      if (activeFilters) {
        Object.values(activeFilters).forEach((filter) => {
          // handle or filters, and filters and direct filters
          if (!filter[filterOperators.AND] && !filter[filterOperators.OR]) {
            rows = rows.filter((item) => {
              return Object.keys(filter).some((key) => {
                return applyDirectFilter(item, filter, key);
              });
            });
          } else if (filter[filterOperators.OR]) {
            rows = rows.filter((item) => {
              return filter[filterOperators.OR].some((orFilter) => {
                return Object.keys(orFilter).some((key) => {
                  return applyDirectFilter(item, orFilter, key);
                });
              });
            });
          } else if (filter[filterOperators.AND]) {
            rows = rows.filter((item) => {
              return filter[filterOperators.AND].every((andFilter) => {
                return Object.keys(andFilter).every((key) => {
                  return applyDirectFilter(item, andFilter, key);
                });
              });
            });
          }
        });
      }

      // apply search filter
      if (activeSearch) {
        if (Object.keys(activeSearch).length > 0) {
          rows = rows.filter((item) => {
            return (
              activeSearch[filterOperators.OR] &&
              activeSearch[filterOperators.OR].some((orFilter) => {
                return Object.keys(orFilter).some((key) => {
                  const keys = key.split(".");
                  const value = keys.reduce((acc, key) => acc[key], item);
                  const searchString = orFilter[key]?.contains?.toLowerCase();
                  if (!searchString) return false;

                  return stringComparison(value, searchString);
                });
              })
            );
          });
        }
      }
      return rows;
    },
    [stringComparison, activeFilters, activeSearch]
  );

  const applyStaticSorting = useCallback((data, orderBy) => {
    if (orderBy && Object.keys(orderBy).length > 0) {
      const keyString = Object.keys(orderBy)[0];
      const keys = keyString.split(".");

      const direction = orderBy[keyString];
      return [...data].sort((a, b) => {
        const aValue = keys.reduce((acc, key) => acc?.[key], a);
        const bValue = keys.reduce((acc, key) => acc?.[key], b);

        // Handle null/undefined values - always put them last
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1; // a is null, put it after b
        if (bValue == null) return -1; // b is null, put it after a (a comes first)

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
    const data = await query({ ...variables, ...queryParams });

    const newAllData = data.nodes || data;
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
      const newFilteredData = applyStaticFilter(sortedData);
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
    activeFilters,
    activeSearch,
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
        ...queryParams,
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
  }, [query, variables, activeFilters, batchSize, populateFilter]);

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

  const setSearchFilter = useCallback((searchFilter) => {
    setActiveSearch(searchFilter);
    // setVariables((prevVariables) => ({
    //   ...prevVariables,
    //   filter: { ...prevVariables.filter, ...searchFilter },
    // }));
  }, []);

  const addFilter = useCallback((name, filter) => {
    setActiveFilters((prevActiveFilters) => ({
      ...prevActiveFilters,
      [name]: filter,
    }));
    // const newActiveFilterNames = [...activeFilterNames, name];
    // setActiveFilterNames(newActiveFilterNames);
    // setVariables((prevVariables) => {
    //   const newFilter = { ...prevVariables.filter, ...filter };
    //   return {
    //     ...prevVariables,
    //     filter: newFilter,
    //   };
    // });
  }, []);

  const removeFilter = useCallback(
    (name) => {
      setActiveFilters((prevActiveFilters) => {
        const newActiveFilters = { ...prevActiveFilters };
        delete newActiveFilters[name];
        return newActiveFilters;
      });
    },
    [activeFilters]
  );

  const isFilterActive = useCallback(
    (name) => {
      const filterNames = Object.keys(activeFilters);
      return filterNames.includes(name);
    },
    [activeFilters]
  );

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
        addFilter,
        removeFilter,
        isFilterActive,
        setSearchFilter,
      }}
    >
      {children}
    </FlexTableContext.Provider>
  );
};
/**
 * @function useFlexTable
 * @description Returns the context for the FlexTableProvider
 * @returns {FlexTableContext}
 */
export const useFlexTable = () => {
  const context = useContext(FlexTableContext);
  if (!context) {
    throw new Error("useFlexTable must be used within a FlexTableProvider");
  }
  return context;
};
