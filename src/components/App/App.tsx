import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { fetchNotes } from "../../services/noteService";
import type { PaginatedNotesResponse } from "../../services/noteService";
import NoteList from "../../components/NoteList/NoteList";
import SearchBox from "../../components/SearchBox/SearchBox";
import Loader from "../../components/Loader/Loader";
import QueryError from "../../components/QueryError/QueryError";
import Pagination from "../../components/Pagination/Pagination";
import css from "./App.module.css";

export default function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const perPage = 12;

  const [debouncedSearch] = useDebounce(search, 400);

  const { data, isLoading, isError, error } = useQuery<PaginatedNotesResponse>({
    queryKey: ["notes", page, debouncedSearch, perPage],
    queryFn: ({ signal }) =>
      fetchNotes({ page, perPage, search: debouncedSearch }, signal),
    placeholderData: keepPreviousData,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (data?.perPage ?? perPage)));

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox
          className={css.input}
          value={search}
          onChange={(val) => {
            setPage(1);
            setSearch(val);
          }}
        />

        {pages > 1 && (
          <Pagination
            pageCount={pages}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
          />
        )}

        <button className={css.button}>Create note +</button>
      </header>
      {isLoading && <Loader />} {isError && <QueryError error={error} />}
      {items.length > 0 && (
        <NoteList
          notes={items}
          page={page}
          search={debouncedSearch}
          perPage={perPage}
        />
      )}
    </div>
  );
}
