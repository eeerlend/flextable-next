import { TableHead } from "../table/tableHead";

export const FlexTableHead = ({ children, className = "", ...props }) => {
  return (
    <TableHead className={`flextable-head relative ${className}`} {...props}>
      {children}
    </TableHead>
  );
};
