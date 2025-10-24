"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  onCommand?: (command: string) => boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onCommand, disabled }: ChatInputProps) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = React.useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("/")) {
      const handled = onCommand?.(trimmed.slice(1).toLowerCase());
      if (handled) {
        setValue("");
        return;
      }
    }
    onSend(trimmed);
    setValue("");
  }, [value, onSend, onCommand]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [value]);

  return (
    <form
      className="relative flex flex-col gap-2 rounded-xl border border-border bg-card/70 p-3 shadow-lg"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask a question, send /new, /clear, /export or Shift+Enter for a new line"
        disabled={disabled}
        className={cn(
          "w-full resize-none border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0",
          "md:text-sm"
        )}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p className="hidden sm:block">
          Tip: Use <span className="font-semibold">Ctrl/Cmd + K</span> for commands.
        </p>
        <Button type="submit" size="sm" className="ml-auto gap-2" disabled={disabled || !value.trim()}>
          <Send className="h-4 w-4" /> Send
        </Button>
      </div>
    </form>
  );
}
