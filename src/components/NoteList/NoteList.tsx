import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note } from "../../types/note";
import type { NotesListResponse } from "../../services/noteService";
import { deleteNote } from "../../services/noteService";
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

  const listKey = ["notes", page, search, perPage] as const;

  const { mutate } = useMutation({
    mutationFn: (id: string) => deleteNote({ id }),

    onMutate: async (id) => {
      setDeletingId(id);
      await qc.cancelQueries({ queryKey: listKey });

      const prevData = qc.getQueryData<NotesListResponse>(listKey);

      if (prevData) {
        const nextNotes = prevData.notes.filter((n) => n.id !== id);

        const approxTotalBefore = prevData.totalPages * perPage;
        const approxTotalAfter = Math.max(0, approxTotalBefore - 1);
        const nextTotalPages = Math.max(
          1,
          Math.ceil(approxTotalAfter / perPage)
        );

        qc.setQueryData<NotesListResponse>(listKey, {
          ...prevData,
          notes: nextNotes,
          totalPages: nextTotalPages,
        });
      }

      return { prevData };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.prevData) {
        qc.setQueryData<NotesListResponse>(listKey, ctx.prevData);
      }
      setDeletingId(null);
    },

    onSuccess: () => {
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "notes",
      });
    },

    onSettled: () => setDeletingId(null),
  });

  return (
    <ul className={css.list}>
      {notes.map((n) => (
        <li key={n.id} className={css.listItem}>
          <h2 className={css.title}>{n.title}</h2>
          <p className={css.content}>{n.content}</p>

          <div className={css.footer}>
            <span className={css.tag}>{n.tag ?? "—"}</span>

            <button
              type="button"
              className={css.button}
              onClick={() => mutate(n.id)}
              disabled={deletingId === n.id}
              aria-busy={deletingId === n.id}
            >
              {deletingId === n.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
