"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormField } from "../../actions";

interface Props {
  open: boolean;
  onClose: () => void;
  fields: FormField[];
  categoryName: string;
}

export function FormPreview({ open, onClose, fields, categoryName }: Props) {
  const t = useTranslations("admin.intakeForms");

  // Local state so the preview inputs are interactive (better preview)
  const [values, setValues] = useState<Record<string, string | boolean>>({});

  function setValue(id: string, v: string | boolean) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t("preview.title")}</DialogTitle>
          <DialogDescription>
            {t("preview.description")}
            {" — "}
            <span className="font-medium text-slate-700">{categoryName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mr-1 pr-1">
          {fields.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              {t("preview.noFields")}
            </p>
          ) : (
            <form
              className="space-y-5 pt-2 pb-4"
              onSubmit={(e) => e.preventDefault()}
            >
              {fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    {field.label || t("field.untitled")}
                    {field.required && (
                      <span className="text-red-500 text-xs font-normal">
                        *{t("preview.requiredMark")}
                      </span>
                    )}
                  </Label>

                  {field.type === "text" && (
                    <Input
                      value={(values[field.id] as string) ?? ""}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      placeholder={field.label}
                    />
                  )}

                  {field.type === "textarea" && (
                    <Textarea
                      value={(values[field.id] as string) ?? ""}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      placeholder={field.label}
                      rows={3}
                      className="resize-none"
                    />
                  )}

                  {field.type === "select" && (
                    <Select
                      value={(values[field.id] as string) ?? ""}
                      onValueChange={(v) => setValue(field.id, v)}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("preview.selectPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((opt, i) => (
                          <SelectItem key={i} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {field.type === "checkbox" && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        type="checkbox"
                        id={`preview-${field.id}`}
                        checked={(values[field.id] as boolean) ?? false}
                        onChange={(e) => setValue(field.id, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                      />
                      <label
                        htmlFor={`preview-${field.id}`}
                        className="text-sm text-slate-600"
                      >
                        {field.label || t("field.untitled")}
                      </label>
                    </div>
                  )}

                  {field.type === "date" && (
                    <Input
                      type="date"
                      value={(values[field.id] as string) ?? ""}
                      onChange={(e) => setValue(field.id, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <Button
                type="submit"
                className="w-full mt-2"
                variant="outline"
                disabled
              >
                Submit (preview only)
              </Button>
            </form>
          )}
        </div>

        <div className="shrink-0 pt-3 border-t border-slate-100">
          <Button variant="outline" className="w-full" onClick={onClose}>
            {t("preview.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
