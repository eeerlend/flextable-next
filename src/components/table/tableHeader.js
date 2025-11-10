export const TableHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={`table-cell ${className}`} {...props}>
      {children}
    </div>
  );
};
