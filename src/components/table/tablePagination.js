"use client";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { useFlexTable } from "../../context/flexTableContext.js";

export const TablePagination = ({
  className = "",
  pageSize,
  pageStart,
  pageEnd,
  totalCount,
  pageSizeOptions = [25, 50, 100, 200],
  hasPreviousPage = false,
  hasNextPage = false,
  onNext,
  onPrevious,
  onPageSizeChange,
  ...props
}) => {
  const { useTranslations } = useFlexTable();
  const t = useTranslations("FlexTables.pagination");
  return (
    <div
      className={`flex flex-row gap-2 whitespace-nowrap items-center ${className}`}
      {...props}
    >
      <span>{t("pageSize")}</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <span className="hidden md:block">
        {t("paginationText", { pageStart, pageEnd, totalCount })}
      </span>
      <button
        className="hover:cursor-pointer disabled:opacity-50"
        onClick={onPrevious}
        disabled={!hasPreviousPage}
      >
        <MdNavigateBefore size={30} />
      </button>
      <button
        className="hover:cursor-pointer disabled:opacity-50"
        onClick={onNext}
        disabled={!hasNextPage}
      >
        <MdNavigateNext size={30} />
      </button>
    </div>
  );
};
