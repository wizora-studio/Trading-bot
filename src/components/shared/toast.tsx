"use client";

import { create } from "zustand";
import { Icon } from "@/components/ui/Icon";

interface Toast {
  id: number;
  text: string;
  kind: "success" | "info" | "error";
}

const useToasts = create<{ items: Toast[]; push: (t: Omit<Toast, "id">) => void; drop: (id: number) => void }>((set) => ({
  items: [],
  push: (t) => {
    const id = Date.now() + Math.random();
    set((s) => ({ items: [...s.items, { ...t, id }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((x) => x.id !== id) })), 4000);
  },
  drop: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
}));

/** Shows a short confirmation message ("Saved", "Import done"). */
export function toast(text: string, kind: Toast["kind"] = "success") {
  useToasts.getState().push({ text, kind });
}

export function Toaster() {
  const items = useToasts((s) => s.items);
  const drop = useToasts((s) => s.drop);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex flex-col items-center gap-2 md:bottom-6 md:items-end">
      {items.map((t) => (
        <div key={t.id} role="status" className={`pointer-events-auto flex max-w-sm items-center gap-2 rounded-s border px-4 py-3 shadow-2 ${t.kind === "error" ? "border-fg bg-fg text-bg" : "border-line bg-bg"}`}>
          <Icon name={t.kind === "error" ? "alert" : t.kind === "info" ? "info" : "check"} className={t.kind === "success" ? "text-blue" : ""} />
          <span className="text-sm">{t.text}</span>
          <button type="button" onClick={() => drop(t.id)} className="ml-2 opacity-70 hover:opacity-100" aria-label="Close">
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
