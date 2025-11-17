import { useFlexTable } from "../../context/flexTableContext";

export const CustomFilter = ({
  fieldName,
  filterQuery = {},
  children,
  ...props
}) => {
  const { variables, addFilter } = useFlexTable();
  const isActive =
    JSON.stringify(variables?.filter?.[fieldName]) ===
    JSON.stringify(filterQuery);

  const handleClick = () => {
    if (isActive) {
      addFilter({ [fieldName]: undefined });
    } else {
      addFilter({ [fieldName]: filterQuery });
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
