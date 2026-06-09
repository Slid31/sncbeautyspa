"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  ChevronLeft,
  Plus,
  Eye,
  Save,
  Trash2,
  LayoutList,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldCard } from "./field-card";
import { FormPreview } from "./form-preview";
import { saveIntakeForm, deleteIntakeForm } from "../../actions";
import type { FormField, BuilderData } from "../../actions";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeField(): FormField {
  return {
    id: crypto.randomUUID(),
    type: "text",
    label: "",
    required: false,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  data: BuilderData;
  locale: string;
}

export function FormBuilder({ data, locale }: Props) {
  const t = useTranslations("admin.intakeForms");
  const base = locale === "fr" ? "/fr" : "";

  const [fields, setFields] = useState<FormField[]>(data.fields);
  const [formId, setFormId] = useState<string | null>(data.formId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);

  // ── DnD setup ──────────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setDirty(true);
  }

  // ── Field operations ───────────────────────────────────────────────────────

  const addField = useCallback(() => {
    const newField = makeField();
    setFields((prev) => [...prev, newField]);
    setEditingId(newField.id);
    setDirty(true);
  }, []);

  const updateField = useCallback(
    (id: string, patch: Partial<FormField>) => {
      setFields((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
      );
      setDirty(true);
    },
    []
  );

  const removeField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setEditingId((prev) => (prev === id ? null : prev));
    setDirty(true);
  }, []);

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    const result = await saveIntakeForm(data.categoryId, fields);
    setSaving(false);

    if (result.ok) {
      setFormId(result.formId);
      setDirty(false);
      toast.success(t("builder.saved"));
    } else {
      toast.error(t("builder.saveError"));
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!formId) return;
    setDeleting(true);
    const result = await deleteIntakeForm(formId);
    setDeleting(false);
    setDeleteOpen(false);

    if (result.ok) {
      setFormId(null);
      setFields([]);
      setDirty(false);
      toast.success(t("builder.deleteSuccess"));
    } else if (result.error === "has_responses") {
      toast.error(t("builder.hasResponses"));
    } else {
      toast.error(t("builder.deleteError"));
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Page header ── */}
      <div className="border-b border-slate-200 bg-white px-8 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Left: back + title */}
          <div className="flex flex-col gap-1">
            <Link
              href={`${base}/admin/intake-forms`}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {t("builder.backToList")}
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              <LayoutList className="h-5 w-5 text-slate-400 shrink-0" />
              <h1 className="text-lg font-semibold text-slate-900">
                {t("builder.forCategory", { name: data.categoryName })}
              </h1>
              {data.serviceNames.map((name) => (
                <Badge
                  key={name}
                  variant="outline"
                  className="text-[11px] border-slate-200 text-slate-500"
                >
                  {name}
                </Badge>
              ))}
              {dirty && (
                <Badge
                  variant="outline"
                  className="text-[11px] border-amber-200 bg-amber-50 text-amber-700"
                >
                  {t("builder.unsavedChanges")}
                </Badge>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="h-3.5 w-3.5" />
              {t("builder.preview")}
            </Button>

            {formId && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("builder.deleteForm")}
              </Button>
            )}

            <Button
              size="sm"
              className="gap-1.5"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? t("builder.saving") : t("builder.save")}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Builder body ── */}
      <div className="flex-1 px-8 py-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {fields.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
              <p className="text-sm text-slate-500">{t("builder.noFields")}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-1.5"
                onClick={addField}
              >
                <Plus className="h-4 w-4" />
                {t("builder.addField")}
              </Button>
            </div>
          )}

          {/* DnD sortable list */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  isEditing={editingId === field.id}
                  onEdit={() => setEditingId(field.id)}
                  onDone={() => setEditingId(null)}
                  onUpdate={(patch) => updateField(field.id, patch)}
                  onDelete={() => removeField(field.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add field button (always shown when fields exist) */}
          {fields.length > 0 && (
            <Button
              variant="outline"
              className="w-full gap-2 border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400"
              onClick={addField}
            >
              <Plus className="h-4 w-4" />
              {t("builder.addField")}
            </Button>
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}
      <FormPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fields={fields}
        categoryName={data.categoryName}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("builder.deleteFormTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("builder.deleteFormDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("delete.cancel", { ns: "common" })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "…" : t("builder.deleteForm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
