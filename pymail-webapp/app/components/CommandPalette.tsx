"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface Command {
  id: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  run: () => void;
}

/** Event other components can dispatch to open the palette (e.g. a header hint). */
export const OPEN_COMMAND_PALETTE = "pymail:open-command-palette";

export function CommandPalette({ commands }: { commands: Command[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuery("");
        setActive(0);
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => {
      setQuery("");
      setActive(0);
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_PALETTE, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_PALETTE, onOpen);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? commands.filter((c) => c.label.toLowerCase().includes(q))
      : commands;
  }, [commands, query]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  const run = (c: Command) => {
    if (c.disabled) return;
    setOpen(false);
    c.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = filtered[active];
      if (c) run(c);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-black/60 p-4 pt-[14vh] backdrop-blur-sm duration-150 animate-in fade-in"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-popover shadow-2xl duration-150 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#e5c07b]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#98c379]/70" />
          <span className="ml-2 text-xs text-muted-foreground">~/command</span>
        </div>

        <div className="flex items-center gap-2 border-b border-border px-4">
          <span className="text-primary">›</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Type a command…"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No matching command.
            </div>
          ) : (
            filtered.map((c, i) => (
              <button
                key={c.id}
                type="button"
                disabled={c.disabled}
                onMouseEnter={() => setActive(i)}
                onClick={() => run(c)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  i === active ? "bg-accent/15 text-foreground" : "text-muted-foreground"
                }`}
              >
                <span>{c.label}</span>
                {c.hint && (
                  <span className="text-xs text-muted-foreground">{c.hint}</span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>↑↓ navigate · ↵ run · esc close</span>
          <span>⌘K</span>
        </div>
      </div>
    </div>
  );
}
