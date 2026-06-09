"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FolderOpen, FilePlus, Pencil } from "lucide-react";
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
import type { CategoryListItem } from "../actions";

interface Props {
  categories: CategoryListItem[];
  locale: string;
}

export function CategoriesListClient({ categories, locale }: Props) {
  const t = useTranslations("admin.intakeForms");
  const base = locale === "fr" ? "/fr" : "";

  return (
    <div className="px-8 py-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">{t("subtitle")}</p>
      </div>

      {/* Table */}
      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-sm text-slate-500">{t("noCategories")}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50 border-slate-100">
                <TableHead className="pl-6 text-xs text-slate-500">
                  {t("tableCategory")}
                </TableHead>
                <TableHead className="text-xs text-slate-500 hidden sm:table-cell">
                  {t("tableServices")}
                </TableHead>
                <TableHead className="text-xs text-slate-500">
                  {t("tableStatus")}
                </TableHead>
                <TableHead className="text-xs text-slate-500 text-right pr-6">
                  {t("tableActions")}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {categories.map((cat) => (
                <TableRow
                  key={cat.id}
                  className="border-slate-100 hover:bg-slate-50"
                >
                  {/* Category name */}
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-medium text-slate-900 text-sm">
                        {cat.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Service count */}
                  <TableCell className="text-sm text-slate-500 hidden sm:table-cell">
                    {t("serviceCount", { count: cat.serviceCount })}
                  </TableCell>

                  {/* Form status */}
                  <TableCell>
                    {cat.formId ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] gap-1"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                        {t("hasForm")}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-slate-200 text-slate-400 text-[11px]"
                      >
                        {t("noForm")}
                      </Badge>
                    )}
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right pr-6">
                    <Button
                      asChild
                      size="sm"
                      variant={cat.formId ? "outline" : "default"}
                      className="gap-1.5"
                    >
                      <Link href={`${base}/admin/intake-forms/${cat.id}`}>
                        {cat.formId ? (
                          <>
                            <Pencil className="h-3.5 w-3.5" />
                            {t("editForm")}
                          </>
                        ) : (
                          <>
                            <FilePlus className="h-3.5 w-3.5" />
                            {t("createForm")}
                          </>
                        )}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
