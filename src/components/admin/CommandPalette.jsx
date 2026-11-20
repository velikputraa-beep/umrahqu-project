"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { adminMenu } from "@/data/admin-menu";

function flattenMenu(items, group, acc) {
  for (const item of items) {
    const nextGroup = item.submenu ? item.title : group;
    if (item.url) acc.push({ title: item.title, url: item.url, group: nextGroup ?? "Menu" });
    if (item.submenu) flattenMenu(item.submenu, nextGroup, acc);
  }
  return acc;
}

const ENTRIES = flattenMenu(adminMenu, null, []);

export default function CommandPalette({ open, onOpenChange }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return ENTRIES;
    return ENTRIES.filter(
      (entry) =>
        entry.title.toLowerCase().includes(term) ||
        entry.group.toLowerCase().includes(term) ||
        entry.url.toLowerCase().includes(term)
    );
  }, [query]);

  const changeQuery = (value) => {
    setQuery(value);
    setActive(0);
  };

  const changeOpen = (next) => {
    if (!next) changeQuery("");
    onOpenChange(next);
  };

  const goTo = (entry) => {
    if (!entry) return;
    changeOpen(false);
    router.push(entry.url);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      goTo(results[active]);
    } else if (event.key === "Escape") {
      changeOpen(false);
    }
  };

  const grouped = results.reduce((acc, entry) => {
    (acc[entry.group] ??= []).push(entry);
    return acc;
  }, {});

  let flatIndex = -1;

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-xl"
        onKeyDown={onKeyDown}
      >
        <DialogTitle className="sr-only">Cari halaman</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Cari halaman atau ketik URL..."
            aria-label="Cari halaman"
            className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Tidak ada halaman yang cocok.
            </p>
          )}
          {Object.entries(grouped).map(([group, entries]) => (
            <div key={group} className="mb-1 last:mb-0">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </p>
              {entries.map((entry) => {
                flatIndex += 1;
                const index = flatIndex;
                return (
                  <button
                    key={entry.url}
                    type="button"
                    onClick={() => goTo(entry)}
                    onMouseMove={() => setActive(index)}
                    data-active={index === active}
                    className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm text-muted-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground"
                  >
                    <span className="truncate">{entry.title}</span>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                      {entry.url}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
          <CornerDownLeft className="size-3" />
          untuk membuka
        </div>
      </DialogContent>
    </Dialog>
  );
}
