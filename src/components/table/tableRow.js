export const TableRow = ({ children, className = "", ...props }) => {
  return (
    <div className={`flex flex-col md:table-row ${className}`} {...props}>
      {children}
    </div>
  );
};
