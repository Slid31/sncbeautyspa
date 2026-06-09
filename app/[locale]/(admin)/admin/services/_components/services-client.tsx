"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceFormDialog } from "./service-form-dialog";
import { DeleteServiceDialog } from "./delete-service-dialog";
import type { ServiceRow, CategoryOption } from "../actions";

interface Props {
  services: ServiceRow[];
  categories: CategoryOption[];
}

type Group = { category: CategoryOption; services: ServiceRow[] };

export function ServicesClient({ services, categories }: Props) {
  const t = useTranslations("admin.services");

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<ServiceRow | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(s: ServiceRow) {
    setEditing(s);
    setFormOpen(true);
  }

  function openDelete(s: ServiceRow) {
    setDeleting(s);
    setDeleteOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function closeDelete() {
    setDeleteOpen(false);
    setDeleting(null);
  }

  // ── Filtering + grouping ──────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (categoryFilter !== "all" && s.categoryId !== categoryFilter)
        return false;
      if (statusFilter === "active" && !s.isActive) return false;
      if (statusFilter === "inactive" && s.isActive) return false;
      return true;
    });
  }, [services, categoryFilter, statusFilter]);

  const groups = useMemo<Group[]>(() => {
    // Preserve category order from server, hide empty groups after filtering
    const map = new Map<string, ServiceRow[]>();
    for (const s of filtered) {
      const arr = map.get(s.categoryId) ?? [];
      arr.push(s);
      map.set(s.categoryId, arr);
    }

    // Order: categories that have services, in the server-provided category order
    const result: Group[] = [];
    for (const cat of categories) {
      const svcs = map.get(cat.id);
      if (svcs?.length) result.push({ category: cat, services: svcs });
    }

    // Catch any services whose category isn't in the categories list (shouldn't happen)
    const knownCatIds = new Set(categories.map((c) => c.id));
    const orphans = filtered.filter((s) => !knownCatIds.has(s.categoryId));
    if (orphans.length) {
      result.push({
        category: { id: "__uncategorized__", name: t("uncategorized") },
        services: orphans,
      });
    }

    return result;
  }, [filtered, categories, t]);

  const isEmpty = services.length === 0;
  const noResults = !isEmpty && groups.length === 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t("serviceCount", { count: services.length })}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          {t("newService")}
        </Button>
      </div>

      {/* ── Filters ── */}
      {!isEmpty && (
        <div className="flex flex-wrap gap-3 px-8 pb-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue placeholder={t("filterCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filterCategory")}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder={t("filterStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filterStatus")}</SelectItem>
              <SelectItem value="active">{t("filterActive")}</SelectItem>
              <SelectItem value="inactive">{t("filterInactive")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── Content area ── */}
      <div className="px-8 pb-8 space-y-6">
        {/* Empty state */}
        {isEmpty && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-sm text-slate-500">{t("noServices")}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4" />
              {t("newService")}
            </Button>
          </div>
        )}

        {/* No results after filtering */}
        {noResults && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
            <p className="text-sm text-slate-500">{t("noResults")}</p>
          </div>
        )}

        {/* Grouped tables */}
        {groups.map(({ category, services: groupSvcs }) => (
          <section key={category.id}>
            {/* Group header */}
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-sm font-semibold text-slate-700">
                {category.name}
              </h2>
              <span className="text-xs text-slate-400">
                ({groupSvcs.length})
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100 bg-slate-50">
                    <TableHead className="w-14 pl-4 text-xs text-slate-500">
                      {t("tableImage")}
                    </TableHead>
                    <TableHead className="text-xs text-slate-500">
                      {t("tableName")}
                    </TableHead>
                    <TableHead className="text-xs text-slate-500 w-28">
                      {t("tablePrice")}
                    </TableHead>
                    <TableHead className="text-xs text-slate-500 w-28 hidden sm:table-cell">
                      {t("tableDuration")}
                    </TableHead>
                    <TableHead className="text-xs text-slate-500 w-24">
                      {t("tableStatus")}
                    </TableHead>
                    <TableHead className="text-xs text-slate-500 text-right pr-4 w-24">
                      {t("tableActions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {groupSvcs.map((svc) => (
                    <TableRow
                      key={svc.id}
                      className="border-slate-100 hover:bg-slate-50"
                    >
                      {/* Image */}
                      <TableCell className="pl-4">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          {svc.image ? (
                            <img
                              src={svc.image}
                              alt={svc.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageOff className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </TableCell>

                      {/* Name + description */}
                      <TableCell>
                        <p className="font-medium text-slate-900 text-sm">
                          {svc.name}
                        </p>
                        {svc.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
                            {svc.description}
                          </p>
                        )}
                      </TableCell>

                      {/* Price */}
                      <TableCell className="text-sm font-medium text-slate-800">
                        ${parseFloat(svc.price).toFixed(2)}
                      </TableCell>

                      {/* Duration */}
                      <TableCell className="text-sm text-slate-600 hidden sm:table-cell">
                        {t("durationUnit", { count: svc.duration })}
                      </TableCell>

                      {/* Status badge */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            svc.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 text-slate-500 bg-slate-50"
                          }
                        >
                          {svc.isActive ? t("active") : t("inactive")}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-500 hover:text-slate-900"
                            onClick={() => openEdit(svc)}
                            aria-label="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => openDelete(svc)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        ))}
      </div>

      {/* ── Dialogs ── */}
      <ServiceFormDialog
        open={formOpen}
        onClose={closeForm}
        service={editing}
        categories={categories}
      />
      <DeleteServiceDialog
        open={deleteOpen}
        onClose={closeDelete}
        service={deleting}
      />
    </>
  );
}
