"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Sortable column header helper ─────────────────────────────────────────────

interface SortHeaderProps {
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc: boolean) => void;
  };
  label: string;
  className?: string;
}

export function SortHeader({ column, label, className }: SortHeaderProps) {
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={cn(
        "flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors",
        className
      )}
    >
      {label}
      {sorted === "asc" ? (
        <ChevronUp className="h-3 w-3 text-slate-700" />
      ) : sorted === "desc" ? (
        <ChevronDown className="h-3 w-3 text-slate-700" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}

// ── DataTable ─────────────────────────────────────────────────────────────────

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
  previousLabel?: string;
  nextLabel?: string;
}

export function DataTable<TData>({
  columns,
  data,
  pageSize = 20,
  onRowClick,
  emptyMessage = "No results.",
  previousLabel = "Previous",
  nextLabel = "Next",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const { pageIndex, pageSize: ps } = table.getState().pagination;
  const total = data.length;
  const from = total === 0 ? 0 : pageIndex * ps + 1;
  const to = Math.min((pageIndex + 1) * ps, total);

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent border-slate-100 bg-slate-50">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-slate-400"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "border-slate-100 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-slate-50"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {total === 0 ? "0" : `${from}–${to}`} / {total}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-3 text-xs"
          >
            {previousLabel}
          </Button>
          <span className="flex items-center px-2 text-xs font-medium">
            {pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 px-3 text-xs"
          >
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
