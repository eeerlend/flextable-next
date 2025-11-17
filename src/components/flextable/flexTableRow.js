import { TableRow } from "../table/tableRow";

export const FlexTableRow = ({ children, className = "", ...props }) => {
  return (
    <TableRow className={`flextable-table-row ${className}`} {...props}>
      {children}
    </TableRow>
  );
};
