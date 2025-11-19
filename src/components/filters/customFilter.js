import { useFlexTable } from "../../context/flexTableContext";

export const CustomFilter = ({ name, query = {}, children, ...props }) => {
  const { addFilter, removeFilter, isFilterActive } = useFlexTable();
  const isActive = isFilterActive(name);

  const handleClick = () => {
    if (isActive) {
      removeFilter(name, query);
    } else {
      addFilter(name, query);
    }
  };

  return (
    <div
      type="button"
      className={`flextable-customFilter ${
        isActive ? "flextable-customFilter-active" : ""
      }`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};
