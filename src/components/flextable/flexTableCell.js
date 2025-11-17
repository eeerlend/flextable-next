import { TableCell } from "../table/tableCell";

export const FlexTableCell = ({ children, className = "", ...props }) => {
  return (
    <TableCell className={`flextable-cell ${className}`} {...props}>
      {children}
    </TableCell>
  );
};
