import { stringSimilarity } from "string-similarity-js";

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
  return similarity > 0.5;
};

export const handleStringFilterStatic = (value, currentFilter) => {
  if (currentFilter?.equals) {
    return value === currentFilter.equals;
  } else if (currentFilter?.contains) {
    const searchString = currentFilter?.contains?.toLowerCase();
    if (!searchString) return false;
    return stringComparison(value, searchString);
  }
};
