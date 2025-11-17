import Select from "react-select";
import { useFlexTable } from "../../context/flexTableContext";

export const StringFilter = ({ label, fieldName, options }) => {
  const { variables, addFilter } = useFlexTable();

  const isActive = variables?.filter?.[fieldName]?.equals !== undefined;

  const change = (value) => {
    if (value === "") {
      addFilter({
        [fieldName]: { equals: "" },
      });
    } else {
      addFilter({
        [fieldName]: {
          equals: value && value !== "null" ? value : undefined,
        },
      });
    }
  };

  const handleChange = (selected) => {
    if (selected?.value === "") {
      addFilter({
        [fieldName]: { equals: "" },
      });
    } else {
      addFilter({
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
      />
    </div>
  );
};
