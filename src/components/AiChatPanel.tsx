"use client";

import { useEffect, useState } from "react";
import { selectRelevantNotes, type SourceNote } from "@/lib/ai-context";
import type { Note } from "@/types/note";

type ApiKeyMode = "configured" | "user";

type AiChatPanelProps = {
  notes: Note[];
};

type ChatResponse = {
  answer?: string;
  error?: string;
};

const USER_GEMINI_KEY_STORAGE_KEY = "altbrain-user-gemini-key";

export function AiChatPanel({ notes }: AiChatPanelProps) {
  const [question, setQuestion] = useState("");
  const [apiKeyMode, setApiKeyMode] = useState<ApiKeyMode>("configured");
  const [userApiKey, setUserApiKey] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return sessionStorage.getItem(USER_GEMINI_KEY_STORAGE_KEY) ?? "";
  });
  const [answer, setAnswer] = useState("");
  const [selectedSources, setSelectedSources] = useState<SourceNote[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <section className="border-t border-neutral-800 bg-neutral-950 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-neutral-100">
          Ask AltBrain
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          Ask a question using your notes as context.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What do my notes say about..."
            className="h-24 w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm leading-6 text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-600"
          />

          {answer && (
            <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Answer
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-200">
                {answer}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 rounded-lg border border-neutral-800 p-1">
            <button
              type="button"
              onClick={() => setApiKeyMode("configured")}
              className={`rounded-md px-3 py-2 text-xs ${
                apiKeyMode === "configured"
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-400"
              }`}
            >
              Use AltBrain key
            </button>

            <button
              type="button"
              onClick={() => setApiKeyMode("user")}
              className={`rounded-md px-3 py-2 text-xs ${
                apiKeyMode === "user"
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-400"
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
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-600"
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
              className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Thinking..." : "Ask"}
            </button>

            {(answer || selectedSources.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setAnswer("");
                  setSelectedSources([]);
                  setErrorMessage(null);
                }}
                className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
              >
                Clear
              </button>
            )}
          </div>

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
      </div>
    </section>
  );
}
