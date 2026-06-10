export type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  userId?: string;
};

export type ViewMode = "editor" | "preview";
