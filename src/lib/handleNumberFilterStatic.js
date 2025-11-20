export const handleNumberFilterStatic = (value, currentFilter) => {
  if (currentFilter?.equals) {
    return value === currentFilter.equals;
  } else if (currentFilter?.contains) {
    return value.toString().includes(currentFilter.contains);
  }
  return false;
};
