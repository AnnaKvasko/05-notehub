import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note } from "../../types/note";
import { deleteNote } from "../../services/noteService";
import { useState } from "react";
import css from "./NoteList.module.css";

export interface NoteListProps {
  notes: Note[];

  page?: number;
  q?: string;
}

export default function NoteList({ notes, page, q }: NoteListProps) {
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { mutate } = useMutation<Note, Error, string>({
    mutationFn: (id) => deleteNote({ id }),

    onMutate: async (id) => {
      setDeletingId(id);
      const key = ["notes", page, q].filter(Boolean);
      await qc.cancelQueries({ queryKey: key });

      const prev = qc.getQueryData<Note[]>(key);
      if (prev) {
        qc.setQueryData<Note[]>(
          key,
          prev.filter((n) => n.id !== id)
        );
      }
      return { key, prev };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key!, ctx.prev);
    },

    onSettled: () => {
      const key = ["notes", page, q].filter(Boolean);
      qc.invalidateQueries({ queryKey: key });
      setDeletingId(null);
    },
  });

  return (
    <ul className={css.list}>
      {notes.map((n) => (
        <li key={n.id} className={css.listItem}>
          <h2 className={css.title}>{n.title}</h2>
          <p className={css.content}>{n.content}</p>
          <div className={css.footer}>
            {n.tag?.name && <span className={css.tag}>{n.tag.name}</span>}
            <button
              className={css.button}
              aria-label={`Delete note ${n.title}`}
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
