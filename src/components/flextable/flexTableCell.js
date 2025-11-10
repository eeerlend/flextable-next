import { TableCell } from "../table/tableCell";

export const FlexTableCell = ({ children, className = "", ...props }) => {
  return (
    <TableCell className={`${className}`} {...props}>
      {children}
    </TableCell>
  );
};
