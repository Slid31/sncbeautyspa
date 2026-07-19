"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, ImageOff, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "./category-form-dialog";
import { DeleteDialog } from "./delete-dialog";
import { reorderCategories } from "../actions";
import type { CategoryRow } from "../actions";

interface Props {
  categories: CategoryRow[];
}

export function CategoriesClient({ categories: initial }: Props) {
  const t = useTranslations("admin.categories");

  const [items, setItems] = useState<CategoryRow[]>(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(cat: CategoryRow) {
    setEditing(cat);
    setFormOpen(true);
  }
  function openDelete(cat: CategoryRow) {
    setDeleting(cat);
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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    setSaving(true);
    await reorderCategories(reordered.map((c) => c.id));
    setSaving(false);
  }

  return (
    <>
      {/* ── Page header ── */}
      <div className="flex items-center justify-between px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t("serviceCount", { count: items.length })}
            {saving && (
              <span className="ml-2 text-pink-500 text-xs">Sauvegarde…</span>
            )}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("newCategory")}
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="px-8 pb-8">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-sm text-slate-500">{t("noCategories")}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4" />
              {t("newCategory")}
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100 bg-slate-50">
                  <TableHead className="w-10 pl-4" />
                  <TableHead className="w-10 text-xs text-slate-500 text-center">#</TableHead>
                  <TableHead className="w-20 text-xs text-slate-500">
                    {t("tableImage")}
                  </TableHead>
                  <TableHead className="text-xs text-slate-500">
                    {t("tableName")}
                  </TableHead>
                  <TableHead className="text-xs text-slate-500 hidden md:table-cell">
                    {t("tableDescription")}
                  </TableHead>
                  <TableHead className="text-xs text-slate-500">
                    {t("tableServices")}
                  </TableHead>
                  <TableHead className="text-xs text-slate-500 hidden lg:table-cell">
                    {t("tableCreated")}
                  </TableHead>
                  <TableHead className="text-xs text-slate-500 text-right pr-4">
                    {t("tableActions")}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {items.map((cat, index) => (
                      <SortableRow
                        key={cat.id}
                        cat={cat}
                        index={index}
                        onEdit={openEdit}
                        onDelete={openDelete}
                      />
                    ))}
                  </TableBody>
                </SortableContext>
              </DndContext>
            </Table>
          </div>
        )}
      </div>

      {/* ── Dialogs ── */}
      <CategoryFormDialog
        open={formOpen}
        onClose={closeForm}
        category={editing}
      />
      <DeleteDialog
        open={deleteOpen}
        onClose={closeDelete}
        category={deleting}
      />
    </>
  );
}

// ── Sortable row ──────────────────────────────────────────────────────────────

function SortableRow({
  cat,
  index,
  onEdit,
  onDelete,
}: {
  cat: CategoryRow;
  index: number;
  onEdit: (c: CategoryRow) => void;
  onDelete: (c: CategoryRow) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="border-slate-100 hover:bg-slate-50"
    >
      {/* Drag handle */}
      <TableCell className="pl-4 w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 focus:outline-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>

      {/* Order number */}
      <TableCell className="text-center">
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
          {index + 1}
        </span>
      </TableCell>

      {/* Image */}
      <TableCell className="pl-4">
        <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
          {cat.image ? (
            <img
              src={cat.image}
              alt={cat.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <ImageOff className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </TableCell>

      {/* Name */}
      <TableCell className="font-medium text-slate-900 text-sm">
        {cat.name}
      </TableCell>

      {/* Description */}
      <TableCell className="text-sm text-slate-500 hidden md:table-cell max-w-xs">
        <span className="line-clamp-2">{cat.description ?? "—"}</span>
      </TableCell>

      {/* Service count */}
      <TableCell>
        <Badge
          variant="outline"
          className={
            cat.serviceCount > 0
              ? "border-pink-200 bg-pink-50 text-pink-700"
              : "border-slate-200 text-slate-500"
          }
        >
          {cat.serviceCount}
        </Badge>
      </TableCell>

      {/* Created date */}
      <TableCell className="text-sm text-slate-500 hidden lg:table-cell whitespace-nowrap">
        {new Intl.DateTimeFormat("en-CA").format(new Date(cat.createdAt))}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right pr-4">
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-500 hover:text-slate-900"
            onClick={() => onEdit(cat)}
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-500 hover:text-red-600"
            onClick={() => onDelete(cat)}
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
