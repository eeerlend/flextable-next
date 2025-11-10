"use client";
import { useEffect, useState } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { useFlexTable } from "../../context/flexTableContext";
import { TableHeader } from "../table/tableHeader";

export const FlexTableHeader = ({
  children,
  className = "",
  sortField = null,
}) => {
  const { variables, setVariables } = useFlexTable();
  const [isSorted, setIsSorted] = useState(false);
  const [sortOrder, setSortOrder] = useState(null);

  const handleSort = () => {
    if (sortOrder === "asc") {
      setVariables({
        ...variables,
        orderBy: { [sortField]: "desc" },
      });
      setSortOrder("desc");
      setIsSorted(true);
    } else if (sortOrder === "desc") {
      setVariables({
        ...variables,
        orderBy: { [sortField]: undefined },
      });
      setSortOrder(undefined);
      setIsSorted(false);
    } else {
      setVariables({
        ...variables,
        orderBy: { [sortField]: "asc" },
      });
      setSortOrder("asc");
      setIsSorted(true);
    }
  };

  useEffect(() => {
    if (variables?.orderBy && variables?.orderBy[sortField]) {
      setIsSorted(true);
      setSortOrder(variables?.orderBy[sortField]);
    } else {
      setIsSorted(false);
      setSortOrder(null);
    }
  }, [variables?.orderBy, sortField]);

  return (
    <TableHeader className={className}>
      <div
        className={`flex flex-row items-center justify-between gap-2 py-2 cursor-pointer whitespace-nowrap ${
          isSorted ? "text-brand" : "text-muted hover:text-brand"
        }`}
        onClick={sortField ? handleSort : null}
      >
        {children}{" "}
        {sortField && isSorted ? (
          sortOrder === "asc" ? (
            <FaSortDown className="text-brand" />
          ) : sortOrder === "desc" ? (
            <FaSortUp className="text-brand" />
          ) : (
            <FaSort className="text-muted" />
          )
        ) : sortField ? (
          <FaSort className="text-muted" />
        ) : null}
      </div>
    </TableHeader>
  );
};
