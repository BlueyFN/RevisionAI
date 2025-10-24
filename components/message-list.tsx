"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn, formatDateTime } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export type ChatRole = "user" | "assistant" | "system" | "note";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const scrollParent = el.closest("[data-scroll-area]") as HTMLElement | null;
    window.requestAnimationFrame(() => {
      if (scrollParent) {
        scrollParent.scrollTop = scrollParent.scrollHeight;
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [messages.length, isTyping]);

  return (
    <ScrollArea
      ref={scrollRef}
      data-scroll-area
      className="h-full w-full rounded-lg border border-border bg-card/40"
    >
      <div className="flex flex-col gap-4 p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping ? <TypingIndicator /> : null}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const showMeta = message.role !== "note";
  return (
    <div
      className={cn("flex w-full", {
        "justify-end": isUser,
        "justify-start": !isUser
      })}
    >
      <div
        className={cn(
          "max-w-[90%] space-y-2 rounded-xl border border-border/60 p-4 text-sm shadow-sm transition-colors sm:max-w-[70%]",
          {
            "bg-primary text-primary-foreground": isUser,
            "bg-card/80": !isUser && message.role !== "note",
            "bg-muted/70 text-muted-foreground": message.role === "note"
          }
        )}
      >
        {showMeta ? (
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
            <span className={cn({ "text-primary-foreground/80": isUser })}>
              {formatRole(message.role)}
            </span>
            <span className={cn({ "text-primary-foreground/70": isUser })}>
              {formatDateTime(message.createdAt)}
            </span>
          </div>
        ) : null}
        <Markdown>{message.content}</Markdown>
      </div>
    </div>
  );
}

function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        pre({ node, ...props }) {
          return (
            <div className="group relative overflow-hidden rounded-md border border-border/60 bg-background/80">
              <pre className="overflow-auto p-4 text-sm" {...props} />
            </div>
          );
        },
        code({ node, inline, className, children: codeChildren, ...props }) {
          const language = /language-(\w+)/.exec(className || "")?.[1];
          const code = String(codeChildren).replace(/\n$/, "");

          if (inline) {
            return (
              <code
                className={cn(
                  "rounded bg-muted px-1.5 py-0.5 font-mono text-xs",
                  className
                )}
                {...props}
              >
                {code}
              </code>
            );
          }

          return (
            <div className="group relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => void navigator.clipboard.writeText(code)}
                title="Copy code"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <pre
                className={cn(
                  "overflow-x-auto rounded-md bg-background/90 p-4 font-mono text-xs",
                  className
                )}
                data-language={language}
                {...props}
              >
                <code>{code}</code>
              </pre>
            </div>
          );
        },
        a({ className, ...props }) {
          return (
            <a
              className={cn(
                "font-medium text-primary underline underline-offset-4 hover:text-primary/80",
                className
              )}
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          );
        }
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      Assistant is typing…
    </div>
  );
}

function formatRole(role: ChatRole) {
  switch (role) {
    case "assistant":
      return "Assistant";
    case "user":
      return "You";
    case "system":
      return "System";
    case "note":
      return "Context";
    default:
      return role;
  }
}
