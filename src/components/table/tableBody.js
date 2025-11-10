export const TableBody = ({ children, className = "", ...props }) => {
  return (
    <div className={`table-row-group ${className}`} {...props}>
      {children}
    </div>
  );
};
