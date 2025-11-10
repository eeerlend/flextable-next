"use client";
export const FlexTableLane = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`flex items-center justify-end gap-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
