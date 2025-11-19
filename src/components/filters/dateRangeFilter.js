"use client";
import { useFlexTable } from "../../context/flexTableContext";

export const DateRangeFilter = ({ name, label, fieldName, className = "" }) => {
  const { variables, addFilter } = useFlexTable();

  const toggleFilter = (filter) => {
    const existingFilter = variables?.filter?.[fieldName];
    const { startDate, endDate } = filter;

    addFilter(name, {
      [fieldName]: {
        gte:
          startDate !== undefined
            ? startDate
              ? new Date(startDate).toISOString()
              : undefined
            : existingFilter?.gte,
        lte:
          endDate !== undefined
            ? endDate
              ? new Date(endDate).toISOString()
              : undefined
            : existingFilter?.lte,
      },
    });
  };

  return (
    <div className="flextable-dateRangeFilter">
      {label && (
        <label htmlFor="dateFrom" className="flextable-dateRangeFilterLabel">
          {label}
        </label>
      )}

      <div className={`flextable-dateRangeFilterInputs ${className}`}>
        <input
          type="date"
          id="dateFrom"
          className="flextable-dateRangeFilterInput dateFrom"
          defaultValue={
            variables?.filters?.find((filter) => filter.name === fieldName)?.gte
          }
          onChange={(e) => toggleFilter({ startDate: e.target.value })}
        />
        <input
          type="date"
          id="dateTo"
          className="flextable-dateRangeFilterInput dateTo"
          defaultValue={
            variables?.filters?.find((filter) => filter.name === fieldName)?.lte
          }
          onChange={(e) => toggleFilter({ endDate: e.target.value })}
        />
      </div>
    </div>
  );
};
