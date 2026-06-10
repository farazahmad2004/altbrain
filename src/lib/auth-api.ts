import type { Session, User } from "@supabase/supabase-js";
import { supabase, assertSupabaseConfig } from "@/lib/supabase";

export async function getCurrentUser(): Promise<User | null> {
  assertSupabaseConfig();

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (error.message.toLowerCase().includes("session")) {
      return null;
    }

    throw error;
  }

  return data.user;
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null }> {
  assertSupabaseConfig();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<User | null> {
  assertSupabaseConfig();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signOut(): Promise<void> {
  assertSupabaseConfig();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
