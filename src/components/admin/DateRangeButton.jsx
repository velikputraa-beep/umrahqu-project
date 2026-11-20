"use client";

import React, { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const toInputValue = (d) =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`
    : "";
const fromInputValue = (v) => (v ? startOfDay(new Date(`${v}T00:00:00`)) : null);

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date) {
  return addDays(startOfDay(date), -date.getDay());
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export const DATE_PRESETS = [
  {
    label: "Hari ini",
    range: () => [startOfDay(new Date()), startOfDay(new Date())],
  },
  {
    label: "Minggu ini",
    range: () => [startOfWeek(new Date()), startOfDay(new Date())],
  },
  {
    label: "Minggu lalu",
    range: () => {
      const thisWeekStart = startOfWeek(new Date());
      return [addDays(thisWeekStart, -7), addDays(thisWeekStart, -1)];
    },
  },
  {
    label: "Bulan ini",
    range: () => [
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      startOfDay(new Date()),
    ],
  },
  {
    label: "Bulan lalu",
    range: () => {
      const now = new Date();
      return [addMonths(now, -1), addDays(new Date(now.getFullYear(), now.getMonth(), 1), -1)];
    },
  },
  {
    label: "30 hari terakhir",
    range: () => [addDays(startOfDay(new Date()), -29), startOfDay(new Date())],
  },
  {
    label: "Tahun ini",
    range: () => [new Date(new Date().getFullYear(), 0, 1), startOfDay(new Date())],
  },
  {
    label: "Tahun lalu",
    range: () => {
      const year = new Date().getFullYear();
      return [new Date(year - 1, 0, 1), new Date(year - 1, 11, 31)];
    },
  },
  { label: "Semua", range: () => [null, null] },
];

const formatLabel = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function formatDateRange(from, to) {
  if (!from && !to) return "Semua";
  if (from && to) return `${formatLabel(from)} - ${formatLabel(to)}`;
  return formatLabel(from || to);
}

export default function DateRangeButton({ from, to, onChange, className }) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(toInputValue(from));
  const [draftTo, setDraftTo] = useState(toInputValue(to));

  const openChange = (next) => {
    if (next) {
      setDraftFrom(toInputValue(from));
      setDraftTo(toInputValue(to));
    }
    setOpen(next);
  };

  const applyPreset = (preset) => {
    const [nextFrom, nextTo] = preset.range();
    setDraftFrom(toInputValue(nextFrom));
    setDraftTo(toInputValue(nextTo));
    onChange(nextFrom, nextTo);
    setOpen(false);
  };

  const applyCustom = () => {
    onChange(fromInputValue(draftFrom), fromInputValue(draftTo));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Pilih rentang tanggal"
          className={className}
        >
          <CalendarDays className="size-3.5 opacity-70" />
          {formatDateRange(from, to)}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rentang Tanggal</DialogTitle>
          <DialogDescription>
            Gunakan preset cepat atau tentukan tanggal sendiri.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1.5">
          {DATE_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="date-range-from">Dari</Label>
            <Input
              id="date-range-from"
              type="date"
              value={draftFrom}
              onChange={(e) => setDraftFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date-range-to">Sampai</Label>
            <Input
              id="date-range-to"
              type="date"
              value={draftTo}
              onChange={(e) => setDraftTo(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Batal
            </Button>
          </DialogClose>
          <Button type="button" onClick={applyCustom}>
            Terapkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
