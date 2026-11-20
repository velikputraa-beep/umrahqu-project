"use client";

import React, { Suspense, useState } from "react";
import { cn } from "cn";
import { ChevronDown, Download, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/admin/DataTable";
import DateRangeButton from "@/components/admin/DateRangeButton";

export default function ListPage({
  title,
  search,
  filters,
  dateRange,
  actions,
  columns,
  rows = [],
  emptyMessage = "Tidak ada data.",
  tableClassName,
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {search && (
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={search.placeholder}
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              aria-label={search.placeholder}
              className="pl-8"
            />
          </div>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {filters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={showFilters}
              aria-label="Toggle Filter"
              onClick={() => setShowFilters((open) => !open)}
            >
              <SlidersHorizontal className="size-3.5 opacity-70" />
              Filter
              <ChevronDown
                className={cn(
                  "size-3.5 opacity-60 transition-transform",
                  showFilters && "rotate-180"
                )}
              />
            </Button>
          )}

          <ExportCsvButton title={title} columns={columns} rows={rows} />

          {dateRange && (
            <DateRangeButton
              from={dateRange.from}
              to={dateRange.to}
              onChange={dateRange.onChange}
            />
          )}
        </div>
      </div>

      {filters && showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-card p-3">
          {filters}
        </div>
      )}

      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl border border-white/10 bg-card" />}>
        <DataTable
          columns={columns}
          rows={rows}
          emptyMessage={emptyMessage}
          className={tableClassName}
        />
      </Suspense>
    </div>
  );
}

function ExportCsvButton({ title, columns, rows }) {
  const exportRows = () => {
    const cell = (row, column) => {
      if (column.csv) return column.csv(row);
      const value = row[column.key];
      return value === null || value === undefined ? "" : String(value);
    };
    const escape = (value) => `"${value.replace(/"/g, '""')}"`;
    const lines = [
      columns.map((column) => escape(column.header)).join(","),
      ...rows.map((row) => columns.map((column) => escape(cell(row, column))).join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button type="button" size="sm" onClick={exportRows}>
      <Download className="size-3.5" />
      Export CSV
    </Button>
  );
}
