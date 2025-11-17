"use client";
export const FlexTableLane = ({ children, className = "", ...props }) => {
  return (
    <div className={`flextable-lane ${className}`} {...props}>
      {children}
    </div>
  );
};
