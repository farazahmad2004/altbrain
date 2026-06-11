"use client";

import { useEffect, useState } from "react";
import { selectRelevantNotes, type SourceNote } from "@/lib/ai-context";
import {
  AI_ANSWER_STORAGE_KEY,
  AI_KEY_MODE_STORAGE_KEY,
  AI_QUESTION_STORAGE_KEY,
  USER_GEMINI_KEY_STORAGE_KEY,
  loadAiSession,
  saveAiSources,
} from "@/lib/ai-session";
import type { Note } from "@/types/note";

type ApiKeyMode = "configured" | "user";

type AiChatPanelProps = {
  notes: Note[];
  isOpen: boolean;
  onClose: () => void;
};

type ChatResponse = {
  answer?: string;
  error?: string;
};

export function AiChatPanel({ notes, isOpen, onClose }: AiChatPanelProps) {
  const savedSession = loadAiSession();
  const [question, setQuestion] = useState(savedSession.question);
  const [apiKeyMode, setApiKeyMode] = useState<ApiKeyMode>(
    savedSession.apiKeyMode
  );
  const [userApiKey, setUserApiKey] = useState(savedSession.userApiKey);
  const [answer, setAnswer] = useState(savedSession.answer);
  const [selectedSources, setSelectedSources] = useState<SourceNote[]>(
    savedSession.sourceIds.map((id, index) => ({
      id,
      title: savedSession.sourceTitles[index] ?? "Untitled Note",
      content: "",
    }))
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(AI_QUESTION_STORAGE_KEY, question);
  }, [question]);

  useEffect(() => {
    sessionStorage.setItem(AI_ANSWER_STORAGE_KEY, answer);
  }, [answer]);

  useEffect(() => {
    sessionStorage.setItem(AI_KEY_MODE_STORAGE_KEY, apiKeyMode);
  }, [apiKeyMode]);

  useEffect(() => {
    if (userApiKey.trim()) {
      sessionStorage.setItem(USER_GEMINI_KEY_STORAGE_KEY, userApiKey);
    } else {
      sessionStorage.removeItem(USER_GEMINI_KEY_STORAGE_KEY);
    }
  }, [userApiKey]);

  async function handleSubmit() {
    const trimmedQuestion = question.trim();
    setErrorMessage(null);

    if (!trimmedQuestion) {
      setErrorMessage("Ask a question first.");
      return;
    }

    if (notes.length === 0) {
      setErrorMessage("Create some notes first.");
      return;
    }

    if (apiKeyMode === "user" && !userApiKey.trim()) {
      setErrorMessage("Enter your Gemini API key first.");
      return;
    }

    const sources = selectRelevantNotes(trimmedQuestion, notes, 5);
    setSelectedSources(sources);
    saveAiSources(sources);
    setIsLoading(true);
    setAnswer("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          sources,
          apiKeyMode,
          userApiKey: apiKeyMode === "user" ? userApiKey.trim() : undefined,
        }),
      });

      const data = (await response.json()) as ChatResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "AltBrain could not answer right now.");
      }

      setAnswer(data.answer ?? "");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "AltBrain could not answer right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function clearAnswer() {
    setQuestion("");
    setAnswer("");
    setSelectedSources([]);
    setErrorMessage(null);
    sessionStorage.removeItem(AI_QUESTION_STORAGE_KEY);
    sessionStorage.removeItem(AI_ANSWER_STORAGE_KEY);
    saveAiSources([]);
  }

  return (
    <div
      className={`fixed inset-0 z-40 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-black/50 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close Ask AltBrain"
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full flex-col border-l border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl transition-transform sm:w-[460px] lg:w-[520px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-start justify-between border-b border-neutral-800 p-4">
          <div>
            <h2 className="text-lg font-semibold">Ask AltBrain</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Ask questions using your notes as context.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-800 hover:text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600"
          >
            Close
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-auto p-4">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What do my notes say about..."
            className="h-28 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm leading-6 text-neutral-100 outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
          />

          <div className="grid grid-cols-2 rounded-full border border-neutral-800 bg-neutral-900 p-1">
            <button
              type="button"
              onClick={() => setApiKeyMode("configured")}
              className={`cursor-pointer rounded-full px-3 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 ${
                apiKeyMode === "configured"
                  ? "bg-neutral-100 text-neutral-950"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
              }`}
            >
              Use AltBrain key
            </button>

            <button
              type="button"
              onClick={() => setApiKeyMode("user")}
              className={`cursor-pointer rounded-full px-3 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 ${
                apiKeyMode === "user"
                  ? "bg-neutral-100 text-neutral-950"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
              }`}
            >
              Use my Gemini API key
            </button>
          </div>

          {apiKeyMode === "user" && (
            <div>
              <input
                value={userApiKey}
                onChange={(event) => setUserApiKey(event.target.value)}
                type="password"
                placeholder="Gemini API key"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
              />
              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Your key is used only for this request/session and is not saved
                to AltBrain&apos;s database. Stored only in this browser
                session.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-lg border border-red-900/70 bg-red-950/50 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Thinking..." : "Ask"}
            </button>

            {(answer || selectedSources.length > 0 || question) && (
              <button
                type="button"
                onClick={clearAnswer}
                className="cursor-pointer rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-800 hover:text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600"
              >
                Clear
              </button>
            )}
          </div>

          {answer && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Answer
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-200">
                {answer}
              </p>
            </div>
          )}

          {selectedSources.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Sources
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSources.map((source) => (
                  <span
                    key={source.id}
                    className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-neutral-300"
                  >
                    {source.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
