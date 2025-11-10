import { TableHead } from "../table/tableHead";

export const FlexTableHead = ({ children, className = "", ...props }) => {
  return (
    <TableHead className={` ${className}`} {...props}>
      {children}
    </TableHead>
  );
};
