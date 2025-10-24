"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut
} from "@/components/ui/command";

export interface CommandAction {
  id: string;
  title: string;
  description?: string;
  shortcut?: string[];
  group?: string;
  keywords?: string[];
  action: () => void;
}

interface CommandKProps {
  actions: CommandAction[];
}

export function CommandK({ actions }: CommandKProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const grouped = React.useMemo(() => {
    const groups = new Map<string, CommandAction[]>();
    actions.forEach((action) => {
      const key = action.group ?? "Actions";
      const list = groups.get(key) ?? [];
      list.push(action);
      groups.set(key, list);
    });
    return Array.from(groups.entries());
  }, [actions]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search commands…" autoFocus={true} />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>
        {grouped.map(([group, groupActions]) => (
          <CommandGroup key={group} heading={group}>
            {groupActions.map((action) => (
              <CommandItem
                key={action.id}
                value={[action.title, ...(action.keywords ?? [])].join(" ")}
                onSelect={() => {
                  setOpen(false);
                  action.action();
                }}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{action.title}</span>
                  {action.description ? (
                    <span className="text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  ) : null}
                </div>
                {action.shortcut ? (
                  <CommandShortcut>{action.shortcut.join(" ")}</CommandShortcut>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
