"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Shared types ──────────────────────────────────────────────────────────────

export type FieldType = "text" | "textarea" | "select" | "checkbox" | "date";

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
};

export type CategoryListItem = {
  id: string;
  name: string;
  serviceCount: number;
  formId: string | null;
};

export type BuilderData = {
  categoryId: string;
  categoryName: string;
  serviceNames: string[];
  formId: string | null;
  fields: FormField[];
};

// ── Result types ──────────────────────────────────────────────────────────────

type Ok = { ok: true };
type Fail<E extends string> = { ok: false; error: E };

export type SaveResult = { ok: true; formId: string } | Fail<"failed">;
export type DeleteResult = Ok | Fail<"has_responses"> | Fail<"failed">;

// ── Helpers ───────────────────────────────────────────────────────────────────

function revalidate() {
  revalidatePath("/admin/intake-forms");
  revalidatePath("/fr/admin/intake-forms");
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function saveIntakeForm(
  categoryId: string,
  fields: FormField[]
): Promise<SaveResult> {
  try {
    const result = await prisma.intakeForm.upsert({
      where: { categoryId },
      create: {
        categoryId,
        fields: JSON.parse(JSON.stringify(fields)),
      },
      update: {
        fields: JSON.parse(JSON.stringify(fields)),
      },
      select: { id: true },
    });

    revalidate();
    return { ok: true, formId: result.id };
  } catch {
    return { ok: false, error: "failed" };
  }
}

export async function deleteIntakeForm(formId: string): Promise<DeleteResult> {
  try {
    const responseCount = await prisma.intakeFormResponse.count({
      where: { formId },
    });
    if (responseCount > 0) return { ok: false, error: "has_responses" };

    await prisma.intakeForm.delete({ where: { id: formId } });

    revalidate();
    return { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}
