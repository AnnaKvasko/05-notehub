// src/services/noteService.ts
import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type { Note, NoteTag } from "../types/note";

/** Базові налаштування */
const API_BASE =
  import.meta.env.VITE_NOTEHUB_API ?? "https://notehub-public.goit.study/api";
const TOKEN = import.meta.env.VITE_NOTEHUB_TOKEN;

/** Єдиний інстанс Axios */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

/** Інтерсептор: додаємо Bearer токен з env */
api.interceptors.request.use((config) => {
  if (TOKEN && String(TOKEN).trim()) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${String(TOKEN).trim()}`;
  }
  return config;
});

/* ===========================
 *        ІНТЕРФЕЙСИ
 * =========================== */

export interface FetchNotesParams {
  page: number; // 1-based
  perPage: number;
  search?: string;
}

export interface PaginatedNotesResponse {
  items: Note[];
  total: number;
  page: number;
  perPage: number;
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

export interface DeleteNoteParams {
  id: string;
}

/* ===========================
 *         ЗАПИТИ
 * =========================== */

/** Отримати пагінований список нотаток (із пошуком) */
export async function fetchNotes(
  { page, perPage, search }: FetchNotesParams,
  signal?: AbortSignal
): Promise<PaginatedNotesResponse> {
  const params: Record<string, string | number> = { page, perPage };
  if (search && search.trim()) params.search = search.trim();

  // ✅ ЯВНИЙ дженерик відповіді — без unknown/any і без ручної «нормалізації»
  const res: AxiosResponse<PaginatedNotesResponse> =
    await api.get<PaginatedNotesResponse>("/notes", { params, signal });

  return res.data;
}

/** Створити нотатку */
export async function createNote(
  body: CreateNoteParams,
  signal?: AbortSignal
): Promise<Note> {
  const res: AxiosResponse<Note> = await api.post<Note>("/notes", body, {
    signal,
  });
  return res.data;
}

/** Видалити нотатку */
export async function deleteNote(
  { id }: DeleteNoteParams,
  signal?: AbortSignal
): Promise<Note> {
  const res: AxiosResponse<Note> = await api.delete<Note>(`/notes/${id}`, {
    signal,
  });
  return res.data;
}
