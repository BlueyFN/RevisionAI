"use client";

import * as React from "react";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatDateTime, summarizeText } from "@/lib/utils";

export interface SessionSummary {
  id: string;
  title: string;
  updatedAt: number;
  summary?: string;
}

interface SessionListProps {
  sessions: SessionSummary[];
  activeId: string | null;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function SessionList({
  sessions,
  activeId,
  onCreate,
  onSelect,
  onRename,
  onDelete
}: SessionListProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editingId) {
      inputRef.current?.focus();
    }
  }, [editingId]);

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">Sessions</h2>
        <Button size="sm" className="gap-2" onClick={onCreate}>
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>
      <ScrollArea className="h-full min-h-[200px] rounded-xl border border-border/60">
        <div className="flex flex-col divide-y divide-border/40">
          {sessions.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              Create your first study session to get started.
            </p>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeId;
              const isEditing = session.id === editingId;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelect(session.id)}
                  className={cn(
                    "group flex flex-col items-start gap-2 bg-transparent p-4 text-left transition-colors hover:bg-secondary/60",
                    {
                      "bg-secondary/80": isActive
                    }
                  )}
                >
                  <div className="flex w-full items-center gap-2">
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        defaultValue={session.title}
                        onBlur={(event) => {
                          const next = event.target.value.trim() || "Untitled";
                          onRename(session.id, next);
                          setEditingId(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.currentTarget.blur();
                          }
                        }}
                      />
                    ) : (
                      <p className="flex-1 text-sm font-medium">{session.title}</p>
                    )}
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingId(session.id);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(session.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {session.summary ? summarizeText(session.summary, 120) : "No summary yet"}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Updated {formatDateTime(session.updatedAt)}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
