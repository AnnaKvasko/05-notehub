import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type { Note, NoteTag } from "../types/note";

const API_BASE =
  import.meta.env.VITE_NOTEHUB_API ?? "https://notehub-public.goit.study/api";
const TOKEN = import.meta.env.VITE_NOTEHUB_TOKEN;

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (TOKEN && String(TOKEN).trim()) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${String(TOKEN).trim()}`;
  }
  return config;
});

export interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
}

export interface NotesListResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

export interface DeleteNoteParams {
  id: string;
}

export async function fetchNotes(
  { page, perPage, search }: FetchNotesParams,
  signal?: AbortSignal
): Promise<NotesListResponse> {
  const params: Record<string, string | number> = { page, perPage };
  if (search && search.trim()) params.search = search.trim();

  const res: AxiosResponse<NotesListResponse> =
    await api.get<NotesListResponse>("/notes", { params, signal });
  return res.data;
}

export async function createNote(
  body: CreateNoteParams,
  signal?: AbortSignal
): Promise<Note> {
  const res: AxiosResponse<Note> = await api.post<Note>("/notes", body, {
    signal,
  });
  return res.data;
}

export async function deleteNote(
  { id }: DeleteNoteParams,
  signal?: AbortSignal
): Promise<Note> {
  const res: AxiosResponse<Note> = await api.delete<Note>(`/notes/${id}`, {
    signal,
  });
  return res.data;
}
