import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type { Note } from "../types/note";

const API_BASE =
  import.meta.env.VITE_NOTEHUB_API ?? "https://notehub-public.goit.study/api";
const TOKEN = import.meta.env.VITE_NOTEHUB_TOKEN;

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (TOKEN) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${TOKEN}`;
  } else {
    console.warn("VITE_NOTEHUB_TOKEN is missing");
  }
  return config;
});

export interface FetchNotesParams {
  page: number;
  limit?: number;
  q?: string;
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
}

export interface DeleteNoteParams {
  id: string;
}

export async function fetchNotes({
  page,
  limit = 10,
  q,
}: FetchNotesParams): Promise<PaginatedNotesResponse> {
  const res: AxiosResponse<PaginatedNotesResponse> = await api.get("/notes", {
    params: { page, limit, q },
  });
  return res.data;
}

export async function createNote(body: CreateNoteParams): Promise<Note> {
  const res: AxiosResponse<Note> = await api.post("/notes", body);
  return res.data; 
}

export async function deleteNote({ id }: DeleteNoteParams): Promise<Note> {
  const res: AxiosResponse<Note> = await api.delete(`/notes/${id}`);
  return res.data; 
}
