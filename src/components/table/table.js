export const Table = ({ children, className = "", ...props }) => {
  return (
    <div className={`table table-auto w-full ${className}`} {...props}>
      {children}
    </div>
  );
};
