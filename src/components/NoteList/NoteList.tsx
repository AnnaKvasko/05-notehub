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

  const listKey = ["notes", page, search, perPage] as const;

  const { mutate } = useMutation({
    mutationFn: (id: string) => deleteNote({ id }),

    onMutate: async (id) => {
      setDeletingId(id);
      await qc.cancelQueries({ queryKey: listKey });

      const prevPageData = qc.getQueryData<{
        items: Note[];
        total: number;
        page: number;
        perPage: number;
      }>(listKey);

      if (prevPageData) {
        const nextItems = prevPageData.items.filter((n) => n.id !== id);
        qc.setQueryData(listKey, {
          ...prevPageData,
          items: nextItems,
        });
      }

      return { prevPageData };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.prevPageData) qc.setQueryData(listKey, ctx.prevPageData);
      setDeletingId(null);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["notes"], exact: false });
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
            {n.tag && <span className={css.tag}>{n.tag}</span>}
            <button
              type="button"
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
