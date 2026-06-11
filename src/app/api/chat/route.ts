import { NextResponse } from "next/server";
import type { SourceNote } from "@/lib/ai-context";

const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type ApiKeyMode = "configured" | "user";

type ChatRequestBody = {
  question?: unknown;
  sources?: unknown;
  apiKeyMode?: unknown;
  userApiKey?: unknown;
};

type GeminiTextPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiTextPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

function isSourceNote(value: unknown): value is SourceNote {
  if (!value || typeof value !== "object") {
    return false;
  }

  const source = value as Record<string, unknown>;

  return (
    typeof source.id === "string" &&
    typeof source.title === "string" &&
    typeof source.content === "string"
  );
}

function getApiKey(apiKeyMode: ApiKeyMode, userApiKey?: unknown) {
  if (apiKeyMode === "configured") {
    return process.env.GEMINI_API_KEY;
  }

  return typeof userApiKey === "string" ? userApiKey.trim() : "";
}

function buildPrompt(question: string, sources: SourceNote[]) {
  const noteContext = sources
    .map(
      (source, index) => `Source ${index + 1}: ${source.title}
${source.content}`
    )
    .join("\n\n---\n\n");

  return `You are AltBrain's AI assistant. Answer using only the provided user notes.
If the notes do not contain enough information, say that clearly.
Cite source note titles naturally in the answer.

User question:
${question}

User notes:
${noteContext}`;
}

function readGeminiAnswer(data: GeminiResponse) {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const answer = parts
    .map((part) => part.text)
    .filter((text): text is string => Boolean(text))
    .join("\n")
    .trim();

  return answer || "The model did not return an answer.";
}

export async function POST(request: Request) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const question =
    typeof body.question === "string" ? body.question.trim() : "";
  const apiKeyMode = body.apiKeyMode;

  if (!question) {
    return NextResponse.json(
      { error: "Please enter a question." },
      { status: 400 }
    );
  }

  if (apiKeyMode !== "configured" && apiKeyMode !== "user") {
    return NextResponse.json(
      { error: "Please choose a valid Gemini key mode." },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.sources) || !body.sources.every(isSourceNote)) {
    return NextResponse.json(
      { error: "Please provide valid note sources." },
      { status: 400 }
    );
  }

  const apiKey = getApiKey(apiKeyMode, body.userApiKey);

  if (!apiKey) {
    const message =
      apiKeyMode === "configured"
        ? "AltBrain does not have a configured Gemini API key yet."
        : "Please enter your Gemini API key.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: buildPrompt(question, body.sources),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200,
        },
      }),
    });

    const data = (await response.json()) as GeminiResponse;

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error?.message ??
            "Gemini could not answer right now. Please try again.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      answer: readGeminiAnswer(data),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach Gemini. Please try again." },
      { status: 500 }
    );
  }
}
