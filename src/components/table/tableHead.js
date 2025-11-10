import { TableRow } from "./tableRow";

export const TableHead = ({ children, className = "", ...props }) => {
  return (
    <div className={`table-header-group ${className}`} {...props}>
      <TableRow>{children}</TableRow>
    </div>
  );
};
