"use client"; // a directive to declare a boundary that turns a server-side file into a Client Component

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteMetadata } from "@/components/NoteMetadata";
import { Sidebar } from "@/components/Sidebar";
import {
  createEmptyNote,
  createStarterNote,
  getDetectedPageLinks,
  getDetectedTags,
} from "@/lib/note-utils";
import { loadNotesFromStorage, saveNotesToStorage } from "@/lib/storage";
import type { Note, ViewMode } from "@/types/note";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>(() => [createStarterNote()]);
  const [activeNoteId, setActiveNoteId] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  const activeNote = notes.find((note) => note.id === activeNoteId);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredNotes = notes.filter((note) => {
    if (!normalizedSearchQuery) return true;

    return (
      note.title.toLowerCase().includes(normalizedSearchQuery) ||
      note.content.toLowerCase().includes(normalizedSearchQuery)
    );
  });
  const activeTags = activeNote ? getDetectedTags(activeNote.content) : [];
  const activePageLinks = activeNote
    ? getDetectedPageLinks(activeNote.content)
    : [];

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const storedData = loadNotesFromStorage();

    if (storedData.notes) {
      setNotes(storedData.notes);

      if (
        storedData.activeNoteId &&
        storedData.notes.some((note) => note.id === storedData.activeNoteId)
      ) {
        setActiveNoteId(storedData.activeNoteId);
      } else if (storedData.notes.length > 0) {
        setActiveNoteId(storedData.notes[0].id);
      } else {
        setActiveNoteId("");
      }
    }

    setHasLoadedStorage(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hasLoadedStorage) return;

    saveNotesToStorage(notes, activeNoteId);
  }, [notes, activeNoteId, hasLoadedStorage]);

  function createNote() {
    const newNote = createEmptyNote();

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
  }

  function updateActiveNote(field: "title" | "content", value: string) {
    if (!activeNote) return;

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeNote.id
          ? {
              ...note,
              [field]: value,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  }

  function deleteActiveNote() {
    if (!activeNote) return;

    const remainingNotes = notes.filter((note) => note.id !== activeNote.id);
    setNotes(remainingNotes);

    if (remainingNotes.length > 0) {
      setActiveNoteId(remainingNotes[0].id);
    } else {
      setActiveNoteId("");
    }
  }

  return (
    <AppShell>
      <Sidebar
        notes={notes}
        filteredNotes={filteredNotes}
        activeNoteId={activeNoteId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateNote={createNote}
        onSelectNote={setActiveNoteId}
      />

      <section className="flex flex-1 flex-col">
        {activeNote ? (
          <>
            <header className="border-b border-neutral-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <input
                    value={activeNote.title}
                    onChange={(event) =>
                      updateActiveNote("title", event.target.value)
                    }
                    className="w-full bg-transparent text-2xl font-semibold outline-none"
                  />

                  <NoteMetadata
                    tags={activeTags}
                    pageLinks={activePageLinks}
                  />
                </div>

                <button
                  onClick={deleteActiveNote}
                  className="rounded-lg border border-red-500 px-3 py-2 text-sm text-red-400 hover:bg-red-950"
                >
                  Delete
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 rounded-lg border border-neutral-800 p-1 md:hidden">
                <button
                  onClick={() => setViewMode("editor")}
                  className={`rounded-md px-3 py-2 text-sm ${
                    viewMode === "editor"
                      ? "bg-neutral-700 text-white"
                      : "text-neutral-400"
                  }`}
                >
                  Editor
                </button>

                <button
                  onClick={() => setViewMode("preview")}
                  className={`rounded-md px-3 py-2 text-sm ${
                    viewMode === "preview"
                      ? "bg-neutral-700 text-white"
                      : "text-neutral-400"
                  }`}
                >
                  Preview
                </button>
              </div>
            </header>

            <div className="grid flex-1 md:grid-cols-2">
              <NoteEditor
                note={activeNote}
                viewMode={viewMode}
                onContentChange={(content) =>
                  updateActiveNote("content", content)
                }
              />

              <MarkdownPreview
                content={activeNote.content}
                viewMode={viewMode}
              />
            </div>
          </>
        ) : (
          <EmptyState onCreateNote={createNote} />
        )}
      </section>
    </AppShell>
  );
}
