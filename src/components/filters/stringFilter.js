import Select from "react-select";
import { useFlexTable } from "../../context/flexTableContext";

export const StringFilter = ({
  name,
  label,
  fieldName,
  options,
  formatOptionLabel,
}) => {
  const { addFilter, isFilterActive } = useFlexTable();
  const isActive = isFilterActive(name);

  const handleChange = (selected) => {
    if (selected?.value === "") {
      addFilter(name, {
        [fieldName]: { equals: "" },
      });
    } else {
      addFilter(name, {
        [fieldName]: {
          equals:
            selected && selected?.value !== "null" ? selected.value : undefined,
        },
      });
    }
  };

  return (
    <div
      className={`flextable-stringFilter ${
        isActive ? "flextable-stringFilter-active" : ""
      }`}
    >
      {label && (
        <label htmlFor="enumFilter" className="flextable-stringFilterLabel">
          {label}
        </label>
      )}
      <Select
        instanceId={"select-" + fieldName}
        className="flextable-stringFilterSelect"
        classNamePrefix="select"
        isDisabled={false}
        isLoading={false}
        isClearable={true}
        isRtl={false}
        isSearchable={true}
        name={fieldName}
        options={options}
        onChange={handleChange}
        formatOptionLabel={formatOptionLabel}
      />
    </div>
  );
};
