import { supabase, assertSupabaseConfig } from "@/lib/supabase";
import type { Note } from "@/types/note";

type NoteRow = {
  id: string;
  title: string;
  content: string;
  updated_at: string;
  created_at: string;
  user_id: string;
};

function mapRowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

function mapNoteToInsert(note: Note, userId: string): NoteRow {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    updated_at: note.updatedAt,
    created_at: note.updatedAt,
    user_id: userId,
  };
}

export async function fetchNotes(userId: string): Promise<Note[]> {
  assertSupabaseConfig();

  const { data, error } = await supabase
    .from("notes")
    .select("id, title, content, updated_at, created_at, user_id")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToNote);
}

export async function createNoteInDb(
  note: Note,
  userId: string
): Promise<Note> {
  assertSupabaseConfig();

  const { data, error } = await supabase
    .from("notes")
    .insert(mapNoteToInsert(note, userId))
    .select("id, title, content, updated_at, created_at, user_id")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToNote(data);
}

export async function updateNoteInDb(note: Note): Promise<void> {
  assertSupabaseConfig();

  const { error } = await supabase
    .from("notes")
    .update({
      title: note.title,
      content: note.content,
      updated_at: note.updatedAt,
    })
    .eq("id", note.id);

  if (error) {
    throw error;
  }
}

export async function deleteNoteFromDb(noteId: string): Promise<void> {
  assertSupabaseConfig();

  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    throw error;
  }
}
