"use client";
import { RiLoader4Line } from "react-icons/ri";
import { useFlexTable } from "../../context/flexTableContext";
import { TableBody } from "../table/tableBody";

export const FlexTableBody = ({ children, loader, ...props }) => {
  const { isLoading, rows, error } = useFlexTable();

  const defaultLoader = () => (
    <div className="absolute top-10 flex flex-row items-center justify-center mx-auto w-full py-10">
      <RiLoader4Line className="animate-spin" size={30} />
    </div>
  );
  const Loader = loader || defaultLoader;

  if (error) {
    return (
      <TableBody className="relative" {...props}>
        Error: {error}
      </TableBody>
    );
  }

  // if initial load
  return isLoading && rows.length === 0 ? (
    <TableBody className="relative" {...props}>
      <Loader />
    </TableBody>
  ) : isLoading && rows.length > 0 ? (
    <TableBody className="relative" {...props}>
      <Loader />
      {children}
    </TableBody>
  ) : (
    <TableBody {...props}>{children}</TableBody>
  );
};
