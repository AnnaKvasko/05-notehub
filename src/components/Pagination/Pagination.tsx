import ReactPaginate from "react-paginate";
import css from "./Pagination.module.css";

export interface PaginationProps {
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  pageCount,
  currentPage,
  onPageChange,
  className,
}: PaginationProps) {
  return (
    <nav className={className} aria-label="Pagination">
      <ReactPaginate
        containerClassName={css.pagination}
        activeClassName={css.active}
        disabledClassName={css.disabled ?? ""}
        previousLabel="‹ Prev"
        nextLabel="Next ›"
        breakLabel="…"
        pageCount={Math.max(1, pageCount)}
        pageRangeDisplayed={3}
        marginPagesDisplayed={1}
        forcePage={Math.max(0, currentPage - 1)}
        onPageChange={(e) => onPageChange(e.selected + 1)}
        renderOnZeroPageCount={null}
      />
    </nav>
  );
}
