type EmptyStateProps = {
  onCreateNote: () => void;
};

export function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6 text-center">
      <div>
        <p className="mb-4 text-neutral-400">
          No notes yet. Create your first note to begin.
        </p>

        <button
          onClick={onCreateNote}
          className="rounded-lg bg-white px-4 py-2 font-medium text-neutral-950 hover:bg-neutral-200"
        >
          Create your first note
        </button>
      </div>
    </div>
  );
}
