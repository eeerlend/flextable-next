"use client";
import Select from "react-select";
import { useFlexTable } from "../../context/flexTableContext";
import { useState } from "react";

export const StringFilterMany = ({
  name,
  label,
  fieldName,
  options,
  formatOptionLabel,
}) => {
  const { addFilter, isFilterActive } = useFlexTable();
  const [selectedOptions, setSelectedOptions] = useState([]);

  const isActive = isFilterActive(name);

  const handleChange = (selected) => {
    setSelectedOptions(selected);

    const selectedValues = selected.map((option) => option.value);
    addFilter(name, {
      [fieldName]:
        selectedValues && selectedValues.length > 0
          ? {
              in: selectedValues,
            }
          : undefined,
    });
  };

  return (
    <div
      className={`flextable-stringFilterMany ${
        isActive ? "flextable-stringFilterMany-active" : ""
      }`}
    >
      {label && (
        <label htmlFor="enumFilter" className="flextable-stringFilterManyLabel">
          {label}
        </label>
      )}
      <Select
        instanceId={"manyselect-" + fieldName}
        className="flextable-stringFilterManySelect"
        classNamePrefix="select"
        isDisabled={false}
        isLoading={false}
        isClearable={true}
        isRtl={false}
        isSearchable={true}
        name={fieldName}
        options={options}
        onChange={handleChange}
        value={selectedOptions}
        isMulti={true}
        formatOptionLabel={formatOptionLabel}
      />
    </div>
  );
};
