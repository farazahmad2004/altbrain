import type { Note } from "@/types/note";

export const NOTES_STORAGE_KEY = "altbrain-notes";
export const ACTIVE_NOTE_ID_STORAGE_KEY = "altbrain-active-note-id";

type StoredNotes = {
  notes: Note[] | null;
  activeNoteId: string | null;
};

export function loadNotesFromStorage(): StoredNotes {
  if (typeof window === "undefined") {
    return {
      notes: null,
      activeNoteId: null,
    };
  }

  const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
  const savedActiveNoteId = localStorage.getItem(ACTIVE_NOTE_ID_STORAGE_KEY);

  if (!savedNotes) {
    return {
      notes: null,
      activeNoteId: savedActiveNoteId,
    };
  }

  try {
    const parsedNotes = JSON.parse(savedNotes);

    if (!Array.isArray(parsedNotes)) {
      return {
        notes: null,
        activeNoteId: savedActiveNoteId,
      };
    }

    return {
      notes: parsedNotes as Note[],
      activeNoteId: savedActiveNoteId,
    };
  } catch {
    return {
      notes: null,
      activeNoteId: savedActiveNoteId,
    };
  }
}

export function saveNotesToStorage(notes: Note[], activeNoteId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  localStorage.setItem(ACTIVE_NOTE_ID_STORAGE_KEY, activeNoteId);
}
