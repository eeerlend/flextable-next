import { Table } from "../table/table";

export const FlexTable = ({
  children,
  className = "",
  compact = false,
  ...props
}) => {
  const compactClass = compact ? "compact" : "";
  return (
    <Table
      className={`flextable-table relative ${className} ${compactClass}`}
      {...props}
    >
      {children}
    </Table>
  );
};
