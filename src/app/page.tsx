"use client"; // a directive to declare a boundary that turns a server-side file into a Client Component

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Backlinks } from "@/components/Backlinks";
import { EmptyState } from "@/components/EmptyState";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteMetadata } from "@/components/NoteMetadata";
import { Sidebar } from "@/components/Sidebar";
import {
  createDailyNote,
  createEmptyNote,
  createNoteWithTitle,
  createStarterNotes,
  findNoteByTitle,
  getAllTags,
  getBacklinks,
  getDetectedPageLinks,
  getDetectedTags,
  getTodayTitle,
  noteHasTag,
} from "@/lib/note-utils";
import { loadNotesFromStorage, saveNotesToStorage } from "@/lib/storage";
import type { Note, ViewMode } from "@/types/note";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>(() => createStarterNotes());
  const [activeNoteId, setActiveNoteId] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  const activeNote = notes.find((note) => note.id === activeNoteId);
  const sortedNotes = [...notes].sort(
    (firstNote, secondNote) =>
      new Date(secondNote.updatedAt).getTime() -
      new Date(firstNote.updatedAt).getTime()
  );
  const allTags = getAllTags(notes);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredNotes = sortedNotes.filter((note) => {
    const matchesSearch =
      !normalizedSearchQuery ||
      note.title.toLowerCase().includes(normalizedSearchQuery) ||
      note.content.toLowerCase().includes(normalizedSearchQuery);
    const matchesTag = !activeTag || noteHasTag(note, activeTag);

    return matchesSearch && matchesTag;
  });
  const activeBacklinks = activeNote ? getBacklinks(notes, activeNote) : [];
  const activeTags = activeNote ? getDetectedTags(activeNote.content) : [];
  const activePageLinks = activeNote
    ? getDetectedPageLinks(activeNote.content)
    : [];

  const openOrCreatePageLink = useCallback((pageTitle: string) => {
    const existingNote = findNoteByTitle(notes, pageTitle);

    if (existingNote) {
      setActiveNoteId(existingNote.id);
      return;
    }

    const newNote = createNoteWithTitle(pageTitle);

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
  }, [notes]);

  const openDailyNote = useCallback(() => {
    const todayTitle = getTodayTitle();
    const existingNote = findNoteByTitle(notes, todayTitle);

    if (existingNote) {
      setActiveNoteId(existingNote.id);
      return;
    }

    const newNote = createDailyNote(todayTitle);

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
  }, [notes]);

  const createNote = useCallback(() => {
    const newNote = createEmptyNote();

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
  }, []);

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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isShortcut = event.altKey && !event.ctrlKey && !event.metaKey;
      const key = event.key.toLowerCase();

      if (!isShortcut) return;

      if (key === "n") {
        event.preventDefault();
        createNote();
      }

      if (key === "d") {
        event.preventDefault();
        openDailyNote();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [createNote, openDailyNote]);

  return (
    <AppShell>
      <Sidebar
        notes={notes}
        filteredNotes={filteredNotes}
        activeNoteId={activeNoteId}
        searchQuery={searchQuery}
        tags={allTags}
        activeTag={activeTag}
        onSearchChange={setSearchQuery}
        onCreateNote={createNote}
        onOpenDailyNote={openDailyNote}
        onSelectNote={setActiveNoteId}
        onSelectTag={setActiveTag}
        onClearTag={() => setActiveTag(null)}
      />

      <section className="flex flex-1 flex-col">
        {activeNote ? (
          <>
            <header className="border-b border-neutral-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <input
                    value={activeNote.title}
                    spellCheck={false}
                    onChange={(event) =>
                      updateActiveNote("title", event.target.value)
                    }
                    className="w-full bg-transparent text-2xl font-semibold outline-none"
                  />

                  <NoteMetadata
                    tags={activeTags}
                    pageLinks={activePageLinks}
                    onOpenPageLink={openOrCreatePageLink}
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
                onOpenPageLink={openOrCreatePageLink}
              />
            </div>

            <Backlinks
              backlinks={activeBacklinks}
              onSelectNote={setActiveNoteId}
            />
          </>
        ) : (
          <EmptyState onCreateNote={createNote} />
        )}
      </section>
    </AppShell>
  );
}
