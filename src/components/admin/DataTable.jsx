"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "cn";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PER_PAGE_OPTIONS = [10, 20, 50];

export default function DataTable({
  columns,
  rows = [],
  emptyMessage = "Tidak ada data.",
  getRowId = (row, index) => index,
  className,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryPage = Number(searchParams.get("page"));
  const queryPerPage = Number(searchParams.get("perPage"));

  const perPage = PER_PAGE_OPTIONS.includes(queryPerPage) ? queryPerPage : 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  // The URL is the only source of truth, so an out-of-range ?page= clamps here
  // instead of being rewritten from an effect.
  const page = Math.min(
    Number.isFinite(queryPage) && queryPage > 0 ? queryPage : 1,
    totalPages
  );

  function writeParams({ page: nextPage, perPage: nextPerPage }) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage && nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");
    if (nextPerPage && nextPerPage !== 10) params.set("perPage", String(nextPerPage));
    else params.delete("perPage");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const goToPage = (next) => {
    writeParams({ page: Math.min(Math.max(1, next), totalPages), perPage });
  };

  const changePerPage = (next) => {
    writeParams({ page: 1, perPage: next });
  };

  const visibleRows = useMemo(
    () => rows.slice((page - 1) * perPage, page * perPage),
    [rows, page, perPage]
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/10 bg-card shadow-xs",
        className
      )}
    >
      <Table data-slot="table-container">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "whitespace-nowrap text-xs font-medium",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  column.headerClassName
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            visibleRows.map((row, index) => (
              <TableRow key={getRowId(row, (page - 1) * perPage + index)}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-xs",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      column.cellClassName
                    )}
                  >
                    {column.cell ? column.cell(row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 border-t border-white/10 px-3 py-3 text-xs text-muted-foreground select-none">
        <div className="flex items-center gap-2">
          <label htmlFor="per-page">Per halaman</label>
          <select
            id="per-page"
            value={perPage}
            onChange={(event) => changePerPage(Number(event.target.value))}
            className="cursor-pointer appearance-none rounded-md border border-input bg-input/30 px-2 py-1 text-foreground outline-none transition-colors focus-visible:border-ring"
          >
            {PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="tabular-nums">
          Page {page} / {totalPages}
        </div>

        <div className="flex items-center gap-1">
          <PageButton
            icon={ChevronsLeft}
            label="Halaman pertama"
            disabled={page <= 1}
            onClick={() => goToPage(1)}
          />
          <PageButton
            icon={ChevronLeft}
            label="Sebelumnya"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          />
          <PageButton
            icon={ChevronRight}
            label="Berikutnya"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          />
          <PageButton
            icon={ChevronsRight}
            label="Halaman terakhir"
            disabled={page >= totalPages}
            onClick={() => goToPage(totalPages)}
          />
        </div>
      </div>
    </div>
  );
}

function PageButton({ icon: Icon, label, disabled, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-md p-1 transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="size-3.5" />
    </button>
  );
}
