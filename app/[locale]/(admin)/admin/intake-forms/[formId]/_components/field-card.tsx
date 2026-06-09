"use client";

import { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import {
  GripVertical,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { FormField, FieldType } from "../../actions";

// ── Type badge colour map ────────────────────────────────────────────────────

const TYPE_COLORS: Record<FieldType, string> = {
  text: "border-blue-200 bg-blue-50 text-blue-700",
  textarea: "border-violet-200 bg-violet-50 text-violet-700",
  select: "border-amber-200 bg-amber-50 text-amber-700",
  checkbox: "border-teal-200 bg-teal-50 text-teal-700",
  date: "border-rose-200 bg-rose-50 text-rose-700",
};

// ── Props ────────────────────────────────────────────────────────────────────

interface FieldCardProps {
  field: FormField;
  isEditing: boolean;
  onEdit: () => void;
  onDone: () => void;
  onUpdate: (patch: Partial<FormField>) => void;
  onDelete: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FieldCard({
  field,
  isEditing,
  onEdit,
  onDone,
  onUpdate,
  onDelete,
}: FieldCardProps) {
  const t = useTranslations("admin.intakeForms");
  const tf = useTranslations("admin.intakeForms.fieldTypes");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // ── Options helpers ──────────────────────────────────────────────────────

  function addOption() {
    onUpdate({ options: [...(field.options ?? []), ""] });
  }

  function updateOption(idx: number, value: string) {
    const next = [...(field.options ?? [])];
    next[idx] = value;
    onUpdate({ options: next });
  }

  function removeOption(idx: number) {
    const next = (field.options ?? []).filter((_, i) => i !== idx);
    onUpdate({ options: next });
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border bg-white transition-shadow",
        isDragging
          ? "border-pink-300 shadow-lg ring-1 ring-pink-200 opacity-75"
          : "border-slate-200 shadow-sm"
      )}
    >
      {isEditing ? (
        /* ── Expanded / editing view ────────────────────────────────────── */
        <div className="p-4 space-y-4">
          {/* Header row with drag handle and done/delete */}
          <div className="flex items-center gap-2">
            <button
              {...listeners}
              {...attributes}
              className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none"
              aria-label={t("field.dragHandle")}
            >
              <GripVertical className="h-5 w-5" />
            </button>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex-1">
              {tf(field.type)}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-400 hover:text-red-600"
              onClick={onDelete}
              aria-label={t("field.deleteField")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              {t("field.label")}
            </Label>
            <Input
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder={t("field.labelPlaceholder")}
              className="h-8 text-sm"
              autoFocus
            />
          </div>

          {/* Type + Required */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                {t("field.type")}
              </Label>
              <Select
                value={field.type}
                onValueChange={(v: FieldType) =>
                  onUpdate({
                    type: v,
                    options: v === "select" ? (field.options ?? [""]) : undefined,
                  })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    ["text", "textarea", "select", "checkbox", "date"] as FieldType[]
                  ).map((type) => (
                    <SelectItem key={type} value={type} className="text-sm">
                      {tf(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                {t("field.required")}
              </Label>
              <div className="flex items-center h-8 gap-2">
                <Switch
                  checked={field.required}
                  onCheckedChange={(v) => onUpdate({ required: v })}
                />
                <span className="text-xs text-slate-500">
                  {field.required
                    ? t("field.required")
                    : t("field.requiredHint").slice(0, 15) + "…"}
                </span>
              </div>
            </div>
          </div>

          {/* Options — only for "select" type */}
          {field.type === "select" && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                {t("field.options")}
              </Label>
              <div className="space-y-2">
                {(field.options ?? []).map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={t("field.optionPlaceholder")}
                      className="h-8 text-sm flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500"
                      onClick={() => removeOption(idx)}
                      disabled={(field.options ?? []).length <= 1}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-slate-500 hover:text-slate-800 gap-1 pl-0"
                  onClick={addOption}
                >
                  <Plus className="h-3 w-3" />
                  {t("field.addOption")}
                </Button>
              </div>
            </div>
          )}

          {/* Done button */}
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={onDone}
            >
              <Check className="h-3.5 w-3.5" />
              {t("field.done")}
            </Button>
          </div>
        </div>
      ) : (
        /* ── Collapsed view ─────────────────────────────────────────────── */
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Drag handle */}
          <button
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none shrink-0"
            aria-label={t("field.dragHandle")}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Type badge */}
          <Badge
            variant="outline"
            className={cn("text-[11px] font-medium shrink-0", TYPE_COLORS[field.type])}
          >
            {tf(field.type)}
          </Badge>

          {/* Label */}
          <span className="flex-1 text-sm text-slate-700 truncate min-w-0">
            {field.label || (
              <span className="text-slate-400 italic">{t("field.untitled")}</span>
            )}
          </span>

          {/* Required indicator */}
          {field.required && (
            <span className="text-xs text-red-500 font-medium shrink-0">*</span>
          )}

          {/* Actions */}
          <div className="flex gap-0.5 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-400 hover:text-slate-700"
              onClick={onEdit}
              aria-label={t("field.editField")}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-400 hover:text-red-600"
              onClick={onDelete}
              aria-label={t("field.deleteField")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
