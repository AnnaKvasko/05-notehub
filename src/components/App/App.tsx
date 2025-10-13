import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchNotes } from "./services/noteService";
import NoteList from "./components/NoteList/NoteList";
import type { Note } from "./types/note";
import css from "./App.module.css";

export default function App() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  const { data, isLoading, isError, error } = useQuery<Note[]>({
    queryKey: ["notes", page, q],
    queryFn: async () => {
      const res = await fetchNotes({ page, limit: 10, q });
      return res.items;
    },
    keepPreviousData: true,
  });

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <input
          placeholder="Search…"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />

        <div>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span style={{ margin: "0 8px" }}>Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>

        <button>+ New note</button>
      </header>

      {isLoading && <p>Loading notes…</p>}
      {isError && (
        <p style={{ color: "crimson" }}>
          {error instanceof Error ? error.message : "Failed to load notes"}
        </p>
      )}

      {data && data.length > 0 && <NoteList notes={data} page={page} q={q} />}
    </div>
  );
}
