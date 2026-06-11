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
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
        onAuthSuccess();
      } else {
        const result = await signUpWithEmail(email, password);

        if (!result.session) {
          setShowEmailConfirmation(true);
          return;
        }

        onAuthSuccess();
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  if (showEmailConfirmation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-neutral-100">
        <section className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900/70 p-6 text-center">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            We sent a confirmation link to your email. Confirm your account,
            then return here and log in.
          </p>

          <button
            type="button"
            onClick={() => {
              setShowEmailConfirmation(false);
              setMode("login");
              setPassword("");
              setErrorMessage(null);
            }}
            className="mt-6 w-full cursor-pointer rounded-full bg-white px-4 py-2 font-medium text-neutral-950 transition-colors hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
          >
            Back to login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-neutral-100">
      <section className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900/70 p-6">
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold">AltBrain</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Capture notes, connect ideas, and build your personal AI knowledge
            base.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-full border border-neutral-800 bg-neutral-950 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`cursor-pointer rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 ${
              mode === "login"
                ? "bg-neutral-100 text-neutral-950"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
            }}
            className={`cursor-pointer rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 ${
              mode === "signup"
                ? "bg-neutral-100 text-neutral-950"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
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
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
          />

          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Password"
            required
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
          />

          {errorMessage && (
            <div className="rounded-lg border border-red-900/70 bg-red-950/50 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer rounded-full bg-white px-4 py-2 font-medium text-neutral-950 transition-colors hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 disabled:cursor-not-allowed disabled:opacity-70"
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
