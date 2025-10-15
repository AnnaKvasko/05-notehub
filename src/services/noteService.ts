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
  const hasToken = Boolean(TOKEN && String(TOKEN).trim());

  console.log(
    "[API]",
    config.method?.toUpperCase(),
    config.url,
    "hasToken:",
    hasToken
  );

  if (hasToken) {
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
  if (search?.trim()) params.search = search.trim();

  console.log("[REQ]/notes params", params);

  try {
    const res = await api.get<unknown>("/notes", { params, signal });

    console.log("[RAW]/notes body:", res.data);
    console.log("[RAW]/notes headers:", res.headers);

    const unbox = (o: any) => o?.data ?? o?.payload ?? o?.result ?? o;
    const body: any = unbox(res.data);

    const itemsBody =
      body?.items ?? body?.results ?? body?.notes ?? body?.data ?? [];
    const totalBody =
      body?.total ?? body?.totalCount ?? body?.count ?? body?.meta?.total;
    const pageBody = body?.page ?? body?.currentPage ?? body?.meta?.page;
    const perPageBody =
      body?.perPage ?? body?.limit ?? body?.per_page ?? body?.meta?.perPage;

    const h: any = res.headers ?? {};
    const totalHdr = Number(
      h["x-total-count"] ?? h["x-total"] ?? h["x-total-items"]
    );
    const perPageHdr = Number(h["x-per-page"] ?? h["x-limit"]);
    const pageHdr = Number(h["x-page"] ?? h["x-current-page"]);

    const itemsArr = Array.isArray(itemsBody) ? itemsBody : [];
    const totalOut = Number(totalBody ?? totalHdr ?? itemsArr.length);
    const pageOut = Number(pageBody ?? pageHdr ?? page);
    const perPageOut = Number(perPageBody ?? perPageHdr ?? perPage);

    const normalized: PaginatedNotesResponse = {
      items: itemsArr as Note[],
      total: Number.isFinite(totalOut) ? totalOut : itemsArr.length,
      page: Number.isFinite(pageOut) ? pageOut : page,
      perPage: Number.isFinite(perPageOut) ? perPageOut : perPage,
    };

    console.log("[RES]/notes normalized", normalized);
    return normalized;
  } catch (e: any) {
    console.error(
      "[ERR]/notes",
      e?.response?.status ?? e?.code ?? "NO_STATUS",
      e?.response?.data ?? e?.message
    );
    const status = e?.response?.status;
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Request failed";
    throw new Error(`GET /notes failed: ${status ?? ""} ${msg}`);
  }
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
