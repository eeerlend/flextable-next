import { Table } from "../table/table";

export const FlexTable = ({
  children,
  className = "",
  compact = false,
  ...props
}) => {
  const compactClass = compact ? "compact" : "";
  return (
    <Table className={`relative ${className} ${compactClass}`} {...props}>
      {children}
    </Table>
  );
};
