"use client";

import React, { useState } from "react";
import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function FilterMultiSelect({
  label,
  options = [],
  value = [],
  onChange,
  className,
}) {
  const [open, setOpen] = useState(false);
  const allSelected = options.length > 0 && value.length === options.length;

  const toggle = (option) => {
    onChange(
      value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option]
    );
  };

  const toggleAll = () => onChange(allSelected ? [] : options);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={`Filter ${label}`}
          className={cn(
            value.length > 0 && "border-primary/50 text-primary",
            className
          )}
        >
          {label}
          {value.length > 0 && (
            <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold">
              {value.length}
            </span>
          )}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Filter {label}</DialogTitle>
          <DialogDescription>
            Pilih satu atau beberapa {label.toLowerCase()} untuk mempersempit data.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(24rem,60vh)] space-y-1 overflow-y-auto">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            Pilih Semua
          </label>
          <div className="my-1 h-px bg-border" />
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <Checkbox
                checked={value.includes(option)}
                onCheckedChange={() => toggle(option)}
              />
              {option}
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onChange([])}>
            Reset
          </Button>
          <DialogClose asChild>
            <Button type="button">Terapkan</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
