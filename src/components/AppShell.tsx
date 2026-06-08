import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 md:flex-row">
      {children}
    </main>
  );
}
