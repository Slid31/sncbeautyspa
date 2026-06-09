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
import { deleteUser, type UserRow } from "../actions";

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserRow | null;
}

export function DeleteUserDialog({ open, onClose, user }: Props) {
  const t = useTranslations("admin.users");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!user) return;
    setLoading(true);
    const result = await deleteUser(user.id);
    setLoading(false);

    if (result.ok) {
      toast.success(t("delete.success"));
      onClose();
    } else {
      const msg =
        result.error === "cannot_delete_self"
          ? t("delete.selfError")
          : t("delete.error");
      toast.error(msg);
      onClose();
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete.description", { name: user?.name ?? "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t("delete.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? t("delete.deleting") : t("delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
