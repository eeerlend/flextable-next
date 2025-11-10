"use client";
export const FlexTableWrapper = ({ children, className = "", ...props }) => {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};
