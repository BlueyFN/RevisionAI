"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Download, MessageSquarePlus, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";

import { ChatInput } from "@/components/chat-input";
import { CommandK, type CommandAction } from "@/components/command-k";
import { MessageList, type ChatMessage } from "@/components/message-list";
import { SessionList, type SessionSummary } from "@/components/session-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  createMessage,
  inferTitleFromMessages,
  trimContext,
  type SessionPayload
} from "@/lib/chat";

const STORAGE_KEY = "revisionai:sessions";

interface SessionState extends SessionPayload {}

function createInitialSession(): SessionState {
  const greeting = createMessage(
    "assistant",
    "Hello! I'm RevisionAI. Tell me what you're studying today and I'll help you stay organised."
  );
  const session: SessionState = {
    id: `session-${Date.now()}`,
    title: "Fresh session",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [greeting]
  };
  return session;
}

function loadStoredSessions(): SessionState[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as SessionState[];
    return parsed.map((session) => ({
      ...session,
      messages: session.messages ?? []
    }));
  } catch (error) {
    console.warn("Failed to parse session storage", error);
    return [];
  }
}

function persistSessions(sessions: SessionState[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export default function ChatPage() {
  const [sessions, setSessions] = React.useState<SessionState[]>([]);
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const [isTyping, setIsTyping] = React.useState(false);
  const [showSessionDialog, setShowSessionDialog] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => {
    const stored = loadStoredSessions();
    if (stored.length === 0) {
      const initial = createInitialSession();
      setSessions([initial]);
      setActiveSessionId(initial.id);
    } else {
      setSessions(stored);
      setActiveSessionId(stored[0]?.id ?? null);
    }
  }, []);

  React.useEffect(() => {
    if (sessions.length === 0) return;
    persistSessions(sessions);
  }, [sessions]);

  const activeSession = React.useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  const sessionSummaries: SessionSummary[] = React.useMemo(
    () =>
      sessions.map((session) => ({
        id: session.id,
        title: session.title,
        updatedAt: session.updatedAt,
        summary: session.systemNote ?? inferTitleFromMessages(session.messages)
      })),
    [sessions]
  );

  const updateSession = React.useCallback(
    (id: string, updater: (prev: SessionState) => SessionState) => {
      setSessions((prev) =>
        prev.map((session) => (session.id === id ? updater(session) : session))
      );
    },
    []
  );

  const handleSend = React.useCallback(
    async (content: string) => {
      if (!activeSession) return;
      const sessionId = activeSession.id;
      const userMessage = createMessage("user", content);
      const baseMessages = activeSession.messages;
      const { trimmed: trimmedAfterUser, note: updatedNote } = trimContext(
        [...baseMessages, userMessage],
        activeSession.systemNote
      );
      const nextNote = updatedNote ?? activeSession.systemNote;

      updateSession(sessionId, (session) => {
        const nextTitle =
          session.messages.length === 1 && session.title === "Fresh session"
            ? inferTitleFromMessages([userMessage])
            : session.title;
        return {
          ...session,
          title: nextTitle,
          messages: trimmedAfterUser,
          systemNote: nextNote,
          updatedAt: Date.now()
        };
      });

      setIsTyping(true);

      await new Promise((resolve) => setTimeout(resolve, 600));

      const reply = createMessage(
        "assistant",
        generateAssistantReply(content, nextNote)
      );

      updateSession(sessionId, (session) => {
        const { trimmed, note } = trimContext(
          [...session.messages, reply],
          session.systemNote
        );
        return {
          ...session,
          messages: trimmed,
          systemNote: note ?? session.systemNote,
          updatedAt: Date.now()
        };
      });

      setIsTyping(false);
    },
    [activeSession, updateSession]
  );

  const createNewSession = React.useCallback(() => {
    const session = createInitialSession();
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setShowSessionDialog(false);
  }, []);

  const clearSession = React.useCallback(
    (id: string) => {
      updateSession(id, (session) => ({
        ...session,
        messages: [
          createMessage(
            "assistant",
            "All caught up! Share your next topic and we'll continue from here."
          )
        ],
        systemNote: undefined,
        updatedAt: Date.now()
      }));
    },
    [updateSession]
  );

  const deleteSession = React.useCallback((id: string) => {
    setSessions((prev) => {
      const next = prev.filter((session) => session.id !== id);
      setActiveSessionId((prevId) => (prevId === id ? next[0]?.id ?? null : prevId));
      return next;
    });
  }, []);

  const renameSession = React.useCallback(
    (id: string, title: string) => {
      updateSession(id, (session) => ({
        ...session,
        title,
        updatedAt: Date.now()
      }));
    },
    [updateSession]
  );

  const exportSession = React.useCallback((session: SessionState) => {
    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${session.title.replace(/[^a-z0-9]+/gi, "-") || "session"}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);

  const handleCommand = React.useCallback(
    (command: string) => {
      switch (command) {
        case "new":
          createNewSession();
          return true;
        case "clear":
          if (activeSession) {
            clearSession(activeSession.id);
          }
          return true;
        case "export":
          if (activeSession) {
            exportSession(activeSession);
          }
          return true;
        default:
          return false;
      }
    },
    [activeSession, clearSession, createNewSession, exportSession]
  );

  const commandActions = React.useMemo<CommandAction[]>(
    () => [
      {
        id: "new",
        title: "New session",
        description: "Start a fresh conversation",
        shortcut: ["/new"],
        action: createNewSession,
        group: "Sessions",
        keywords: ["conversation", "fresh"]
      },
      {
        id: "clear",
        title: "Clear messages",
        description: "Empty the current session",
        shortcut: ["/clear"],
        action: () => activeSession && clearSession(activeSession.id),
        group: "Sessions",
        keywords: ["reset", "erase"]
      },
      {
        id: "export",
        title: "Export session",
        description: "Download the conversation as JSON",
        shortcut: ["/export"],
        action: () => activeSession && exportSession(activeSession),
        group: "Sessions",
        keywords: ["download", "json"]
      },
      {
        id: "theme",
        title: "Toggle theme",
        description: "Switch between light and dark",
        shortcut: ["T"],
        action: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
        group: "Preferences",
        keywords: ["mode", "appearance"]
      }
    ],
    [activeSession, clearSession, createNewSession, exportSession, resolvedTheme, setTheme]
  );

  const messageFeed: ChatMessage[] = activeSession?.messages ?? [];

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/30">
      <header className="flex items-center justify-between gap-4 border-b border-border/40 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          <Link href="/" className="text-foreground hover:text-primary">
            RevisionAI
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="md:hidden"
            onClick={() => setShowSessionDialog(true)}
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" /> Sessions
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="hidden w-full max-w-xs border-r border-border/40 bg-background/40 p-4 md:block">
          <SessionList
            sessions={sessionSummaries}
            activeId={activeSessionId}
            onCreate={createNewSession}
            onSelect={(id) => setActiveSessionId(id)}
            onRename={renameSession}
            onDelete={deleteSession}
          />
        </aside>
        <section className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground md:text-2xl">
                {activeSession?.title ?? "No session selected"}
              </h1>
              {activeSession?.systemNote ? (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Context note: {activeSession.systemNote}
                </p>
              ) : null}
            </div>
            {activeSession ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearSession(activeSession.id)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => exportSession(activeSession)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" /> Export
                </Button>
              </div>
            ) : null}
          </div>
          <Separator className="h-px w-full" />
          <div className="flex h-[calc(100vh-320px)] flex-1 flex-col gap-4 md:h-[calc(100vh-260px)]">
            <div className="flex-1 overflow-hidden rounded-2xl">
              <MessageList messages={messageFeed} isTyping={isTyping} />
              {messageFeed.length === 0 ? (
                <div className="pointer-events-none -mt-20 flex justify-center text-sm text-muted-foreground">
                  Start the conversation with a question or prompt.
                </div>
              ) : null}
            </div>
            <ChatInput onSend={handleSend} onCommand={handleCommand} disabled={!activeSession} />
          </div>
        </section>
      </div>
      <CommandK actions={commandActions} />
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sessions</DialogTitle>
          </DialogHeader>
          <SessionList
            sessions={sessionSummaries}
            activeId={activeSessionId}
            onCreate={createNewSession}
            onSelect={(id) => {
              setActiveSessionId(id);
              setShowSessionDialog(false);
            }}
            onRename={renameSession}
            onDelete={deleteSession}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}

function generateAssistantReply(prompt: string, note?: string) {
  const base = "Here's a quick reflection on what you shared:";
  const highlighted = prompt.length > 220 ? `${prompt.slice(0, 220)}…` : prompt;
  const context = note ? `\n\nI am also keeping this context in mind: ${note}` : "";
  return `${base}\n\n${highlighted}${context}`;
}
