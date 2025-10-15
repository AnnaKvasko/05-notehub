import ReactPaginate from "react-paginate";
import css from "./Pagination.module.css";

export interface PaginationProps {
  pageCount: number; // загальна кількість сторінок (1+)
  currentPage: number; // 1-based
  onPageChange: (page: number) => void; // 1-based
  className?: string; // додатковий клас на <nav>
}

export default function Pagination({
  pageCount,
  currentPage,
  onPageChange,
  className,
}: PaginationProps) {
  // якщо треба ховати при одній сторінці — розкоментуй:
  // if (pageCount <= 1) return null;

  return (
    <nav className={className} aria-label="Pagination">
      <ReactPaginate
        containerClassName={css.pagination} // твій UL .pagination з CSS
        activeClassName={css.active} // .active для LI
        disabledClassName={css.disabled ?? ""} // додай у CSS при потребі
        previousLabel="‹ Prev"
        nextLabel="Next ›"
        breakLabel="…"
        pageCount={Math.max(1, pageCount)}
        pageRangeDisplayed={3}
        marginPagesDisplayed={1}
        forcePage={Math.max(0, currentPage - 1)} // lib = 0-based
        onPageChange={(e) => onPageChange(e.selected + 1)}
        renderOnZeroPageCount={null}
      />
    </nav>
  );
}
