"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { AlertTriangle } from "lucide-react";
import { deleteCategory } from "../actions";
import type { CategoryRow } from "../actions";

interface Props {
  open: boolean;
  onClose: () => void;
  category: CategoryRow | null;
}

export function DeleteDialog({ open, onClose, category }: Props) {
  const t = useTranslations("admin.categories");
  const [loading, setLoading] = useState(false);

  if (!category) return null;

  const hasServices = category.serviceCount > 0;

  async function handleDelete() {
    if (!category) return;
    setLoading(true);

    const result = await deleteCategory(category.id);
    setLoading(false);

    if (result.ok) {
      toast.success(t("delete.success"));
      onClose();
    } else if (result.error === "has_appointments") {
      toast.error(t("delete.hasAppointments"));
      onClose();
    } else {
      toast.error(t("delete.error"));
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {hasServices ? (
                <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    {t("delete.warningServices", {
                      name: category.name,
                      count: category.serviceCount,
                    })}
                  </span>
                </div>
              ) : (
                <p>
                  {t("delete.description", { name: category.name })}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("delete.cancel")}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading || hasServices}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50"
          >
            {loading ? "…" : t("delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
