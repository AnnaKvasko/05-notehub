import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note } from "../../types/note";
import { deleteNote } from "../../services/noteService";
import { useState } from "react";
import css from "./NoteList.module.css";

export interface NoteListProps {
  notes: Note[];
  page: number;
  search: string;
  perPage: number;
}

export default function NoteList({
  notes,
  page,
  search,
  perPage,
}: NoteListProps) {
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { mutate } = useMutation({
    mutationFn: (id: string) => deleteNote({ id }),
    onMutate: async (id) => {
      setDeletingId(id);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["notes", page, search, perPage] });
      setDeletingId(null);
    },
  });

  return (
    <ul className={css.list}>
      {notes.map((n) => (
        <li key={n.id} className={css.listItem}>
          <h2 className={css.title}> {n.title} </h2>
          <p className={css.content}>{n.content}</p>
          <div className={css.footer}>
            {n.tag && <span className={css.tag}>{n.tag}</span>}
            <button
              className={css.button}
              onClick={() => mutate(n.id)}
              disabled={deletingId === n.id}
            >
              {deletingId === n.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
