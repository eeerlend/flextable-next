import { Table } from "../table/table";

export const FlexTable = ({ children, className = "", compact = false }) => {
  const compactClass = compact ? "compact" : "";
  return (
    <Table className={`relative ${className} ${compactClass}`}>
      {children}
    </Table>
  );
};
