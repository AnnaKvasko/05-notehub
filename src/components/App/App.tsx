import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import {
  fetchNotes,
  type PaginatedNotesResponse,
} from "../../services/noteService";
import NoteList from "../../components/NoteList/NoteList";
import SearchBox from "../../components/SearchBox/SearchBox";
import Loader from "../../components/Loader/Loader";
import QueryError from "../../components/QueryError/QueryError";
import Pagination from "../../components/Pagination/Pagination";
import Modal from "../../components/Modal/Modal";
import NoteForm from "../../components/NoteForm/NoteForm";
import css from "./App.module.css";

export default function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const perPage = 10;

  const queryKey = ["notes", page, debouncedSearch, perPage] as const;

  const { data, isLoading, isError, error, isFetching } =
    useQuery<PaginatedNotesResponse>({
      queryKey,
      queryFn: ({ signal }) =>
        fetchNotes({ page, perPage, search: debouncedSearch }, signal),
      placeholderData: keepPreviousData,
    });

  const items = Array.isArray(data?.items) ? data!.items : [];
  const effectivePerPage = Number.isFinite(data?.perPage)
    ? Number(data!.perPage)
    : perPage;
  const effectiveTotal = Number.isFinite(data?.total) ? Number(data!.total) : 0;
  const pages = Math.max(
    1,
    Math.ceil((effectiveTotal || 0) / (effectivePerPage || 1))
  );

  useEffect(() => {
    if (page > pages && pages > 0) setPage(1);
  }, [page, pages]);

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        {pages > 1 && (
          <Pagination
            pageCount={pages}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            className={css.topPagination}
          />
        )}

        <SearchBox
          className={css.input}
          value={search}
          onChange={(val) => {
            setPage(1);
            setSearch(val);
          }}
        />

        <button
          type="button"
          className={css.button}
          onClick={() => setIsModalOpen(true)}
        >
          Create note +
        </button>
      </header>

      {isLoading && <Loader />}
      {isError && <QueryError error={error} />}

      {isFetching && !isLoading && (
        <small className={css.softLoader}>Updating…</small>
      )}

      {items.length > 0 ? (
        <>
          <NoteList
            notes={items}
            page={page}
            search={debouncedSearch}
            perPage={perPage}
          />

          {pages > 1 && (
            <Pagination
              pageCount={pages}
              currentPage={page}
              onPageChange={(p) => setPage(p)}
              className={css.bottomPagination}
            />
          )}
        </>
      ) : (
        !isLoading &&
        !isError && (
          <p>
            No notes {debouncedSearch ? `for “${debouncedSearch}”` : "yet"}.
          </p>
        )
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 style={{ marginTop: 0 }}>Create note</h2>
        <NoteForm
          page={page}
          search={debouncedSearch}
          perPage={perPage}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
