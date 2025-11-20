export const handleNumberFilterStatic = (value, currentFilter) => {
  if (currentFilter?.equals !== undefined) {
    return value === currentFilter.equals;
  } else if (currentFilter?.contains !== undefined) {
    return value.toString().includes(currentFilter.contains);
  } else if (currentFilter?.gte !== undefined) {
    return value >= currentFilter.gte;
  } else if (currentFilter?.lte !== undefined) {
    return value <= currentFilter.lte;
  } else if (currentFilter?.gt !== undefined) {
    return value > currentFilter.gt;
  } else if (currentFilter?.lt !== undefined) {
    return value < currentFilter.lt;
  }
  return false;
};
