export const handleDateFilterStatic = (value, filter) => {
  if (filter?.gte) {
    return value >= filter.gte;
  } else if (filter?.lte) {
    return value <= filter.lte;
  } else if (filter?.gt) {
    return value > filter.gt;
  } else if (filter?.lt) {
    return value < filter.lt;
  } else if (filter?.before) {
    return value < filter.before;
  } else if (filter?.after) {
    return value > filter.after;
  }
  return false;
};
