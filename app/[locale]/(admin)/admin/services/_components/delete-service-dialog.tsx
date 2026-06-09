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
import { deleteService } from "../actions";
import type { ServiceRow } from "../actions";

interface Props {
  open: boolean;
  onClose: () => void;
  service: ServiceRow | null;
}

export function DeleteServiceDialog({ open, onClose, service }: Props) {
  const t = useTranslations("admin.services");
  const [loading, setLoading] = useState(false);

  if (!service) return null;

  const hasAppointments = service.appointmentCount > 0;

  async function handleDelete() {
    if (!service) return;
    setLoading(true);

    const result = await deleteService(service.id);
    setLoading(false);

    if (result.ok) {
      toast.success(t("delete.success"));
      onClose();
    } else if (result.error === "has_appointments") {
      // TypeScript narrows to HasAppointments here because the other Fail branch
      // only allows "failed" | "invalid_data" — disjoint from "has_appointments".
      toast.error(
        t("delete.hasAppointments", {
          name: service.name,
          count: result.appointmentCount,
        })
      );
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
              <p>{t("delete.description", { name: service.name })}</p>

              {hasAppointments && (
                <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    {t("delete.hasAppointments", {
                      name: service.name,
                      count: service.appointmentCount,
                    })}
                  </span>
                </div>
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
            disabled={loading || hasAppointments}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50"
          >
            {loading ? "…" : t("delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
