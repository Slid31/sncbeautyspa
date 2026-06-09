import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/session";
import { getUsers } from "./actions";
import { UsersClient } from "./_components/users-client";

export default async function AdminUsersPage() {
  await requireAdmin();

  const [users, t] = await Promise.all([getUsers(), getTranslations("admin.users")]);

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">{t("subtitle")}</p>
      </div>

      <UsersClient users={users} />
    </div>
  );
}
