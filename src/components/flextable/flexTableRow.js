import { TableRow } from "../table/tableRow";

export const FlexTableRow = ({ children, className = "", ...props }) => {
  return (
    <TableRow className={`${className}`} {...props}>
      {children}
    </TableRow>
  );
};
