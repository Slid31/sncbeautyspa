"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, SortHeader } from "@/components/ui/data-table";
import { UserFormDialog } from "./user-form-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import type { UserRow } from "../actions";

interface Props {
  users: UserRow[];
}

export function UsersClient({ users }: Props) {
  const t = useTranslations("admin.users");
  const router = useRouter();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const openCreate = useCallback(() => {
    setEditTarget(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((user: UserRow) => {
    setEditTarget(user);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((user: UserRow) => {
    setDeleteTarget(user);
    setDeleteOpen(true);
  }, []);

  function handleClose() {
    setFormOpen(false);
    setDeleteOpen(false);
    setEditTarget(null);
    setDeleteTarget(null);
    router.refresh();
  }

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortHeader column={column} label={t("name")} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <SortHeader column={column} label={t("email")} />
      ),
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <SortHeader column={column} label={t("role")} />
      ),
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge
            variant="outline"
            className={
              role === "ADMIN"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-slate-50 text-slate-600"
            }
          >
            {role === "ADMIN" ? t("roleAdmin") : t("roleStaff")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortHeader column={column} label={t("createdAt")} />
      ),
      cell: ({ row }) => (
        <span className="text-slate-500 text-sm">
          {new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "short", day: "numeric" }).format(new Date(row.original.createdAt))}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t("actions")}</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
            onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">{t("edit.button")}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
            onClick={(e) => { e.stopPropagation(); openDelete(row.original); }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("delete.button")}</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {t("count", { count: users.length })}
        </p>
        <Button onClick={openCreate} className="gap-2">
          <UserPlus className="h-4 w-4" />
          {t("create.button")}
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          pageSize={20}
          emptyMessage={t("empty")}
          previousLabel={t("previous")}
          nextLabel={t("next")}
        />
      </div>

      <UserFormDialog
        open={formOpen}
        onClose={handleClose}
        user={editTarget}
      />

      <DeleteUserDialog
        open={deleteOpen}
        onClose={handleClose}
        user={deleteTarget}
      />
    </>
  );
}
