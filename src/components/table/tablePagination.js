"use client";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { useFlexTable } from "../../context/flexTableContext";

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
    <div className={`flextable-pagination`} {...props}>
      <span className="flextable-pagination-pageSize">{t("pageSize")}</span>
      <select
        className="flextable-pagination-pageSizeSelect"
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
      >
        {pageSizeOptions.map((size) => (
          <option
            className="flextable-pagination-pageSizeOption"
            key={size}
            value={size}
          >
            {size}
          </option>
        ))}
      </select>
      <span className="flextable-pagination-pageInfoText">
        {t("paginationText", { pageStart, pageEnd, totalCount })}
      </span>
      <button
        className="flextable-pagination-previousButton"
        onClick={onPrevious}
        disabled={!hasPreviousPage}
      >
        <MdNavigateBefore size={30} />
      </button>
      <button
        className="flextable-pagination-nextButton"
        onClick={onNext}
        disabled={!hasNextPage}
      >
        <MdNavigateNext size={30} />
      </button>
    </div>
  );
};
