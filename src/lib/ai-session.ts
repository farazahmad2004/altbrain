import type { SourceNote } from "@/lib/ai-context";

export type SavedAiSession = {
  question: string;
  answer: string;
  apiKeyMode: "configured" | "user";
  sourceIds: string[];
  sourceTitles: string[];
  userApiKey: string;
};

export const AI_QUESTION_STORAGE_KEY = "altbrain-ai-question";
export const AI_ANSWER_STORAGE_KEY = "altbrain-ai-answer";
export const AI_KEY_MODE_STORAGE_KEY = "altbrain-ai-key-mode";
export const AI_SOURCE_IDS_STORAGE_KEY = "altbrain-ai-source-ids";
export const AI_SOURCE_TITLES_STORAGE_KEY = "altbrain-ai-source-titles";
export const USER_GEMINI_KEY_STORAGE_KEY = "altbrain-user-gemini-key";

function loadStringArray(key: string) {
  try {
    const parsedValue = JSON.parse(sessionStorage.getItem(key) ?? "[]");

    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function loadAiSession(): SavedAiSession {
  if (typeof window === "undefined") {
    return {
      question: "",
      answer: "",
      apiKeyMode: "configured",
      sourceIds: [],
      sourceTitles: [],
      userApiKey: "",
    };
  }

  const savedKeyMode = sessionStorage.getItem(AI_KEY_MODE_STORAGE_KEY);

  return {
    question: sessionStorage.getItem(AI_QUESTION_STORAGE_KEY) ?? "",
    answer: sessionStorage.getItem(AI_ANSWER_STORAGE_KEY) ?? "",
    apiKeyMode: savedKeyMode === "user" ? "user" : "configured",
    sourceIds: loadStringArray(AI_SOURCE_IDS_STORAGE_KEY),
    sourceTitles: loadStringArray(AI_SOURCE_TITLES_STORAGE_KEY),
    userApiKey: sessionStorage.getItem(USER_GEMINI_KEY_STORAGE_KEY) ?? "",
  };
}

export function saveAiSources(sources: SourceNote[]) {
  sessionStorage.setItem(
    AI_SOURCE_IDS_STORAGE_KEY,
    JSON.stringify(sources.map((source) => source.id))
  );
  sessionStorage.setItem(
    AI_SOURCE_TITLES_STORAGE_KEY,
    JSON.stringify(sources.map((source) => source.title))
  );
}

export function clearAiSession() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(AI_QUESTION_STORAGE_KEY);
  sessionStorage.removeItem(AI_ANSWER_STORAGE_KEY);
  sessionStorage.removeItem(AI_SOURCE_IDS_STORAGE_KEY);
  sessionStorage.removeItem(AI_SOURCE_TITLES_STORAGE_KEY);
  sessionStorage.removeItem(USER_GEMINI_KEY_STORAGE_KEY);
}
