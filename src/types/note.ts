export interface NoteTag {
  id: string;
  name: string;
  color?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tag?: NoteTag | null;
  createdAt?: string;
  updatedAt?: string;
}
