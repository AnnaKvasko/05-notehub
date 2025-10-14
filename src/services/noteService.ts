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
  if (TOKEN) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${TOKEN}`;
  }
  return config;
});

export interface FetchNotesParams {
  page: number;
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

export async function fetchNotes(
  { page, perPage, search }: FetchNotesParams,
  signal?: AbortSignal
): Promise<PaginatedNotesResponse> {
  const params: Record<string, unknown> = { page, perPage };
  if (search && search.trim()) params.search = search.trim();

  const res: AxiosResponse<PaginatedNotesResponse> = await api.get("/notes", {
    params,
    signal,
  });
  return res.data;
}

export async function createNote(
  body: CreateNoteParams,
  signal?: AbortSignal
): Promise<Note> {
  const res: AxiosResponse<Note> = await api.post("/notes", body, { signal });
  return res.data;
}

export async function deleteNote(
  { id }: DeleteNoteParams,
  signal?: AbortSignal
): Promise<Note> {
  const res: AxiosResponse<Note> = await api.delete(`/notes/${id}`, { signal });
  return res.data;
}
