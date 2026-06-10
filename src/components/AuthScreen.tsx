"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { signInWithEmail, signUpWithEmail } from "@/lib/auth-api";

type AuthMode = "login" | "signup";

type AuthScreenProps = {
  onAuthSuccess: () => void;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Authentication failed. Please try again.";
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }

      onAuthSuccess();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-neutral-100">
      <section className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">AltBrain</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Markdown-first knowledge, synced to your account.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-lg border border-neutral-800 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-md px-3 py-2 text-sm ${
              mode === "login"
                ? "bg-neutral-700 text-white"
                : "text-neutral-400"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-md px-3 py-2 text-sm ${
              mode === "signup"
                ? "bg-neutral-700 text-white"
                : "text-neutral-400"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-500"
          />

          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Password"
            required
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-500"
          />

          {errorMessage && (
            <div className="rounded-lg border border-red-900/70 bg-red-950/50 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-white px-4 py-2 font-medium text-neutral-950 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
