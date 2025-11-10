export const TableCell = ({ children, className = "", ...props }) => {
  return (
    <div className={`table-cell align-middle ${className}`} {...props}>
      {children}
    </div>
  );
};
