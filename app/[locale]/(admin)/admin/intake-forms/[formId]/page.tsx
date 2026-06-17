import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { FormBuilder } from "./_components/form-builder";
import type { FormField, BuilderData } from "../actions";

type Props = {
  params: Promise<{ locale: string; formId: string }>;
};

export default async function IntakeFormBuilderPage({ params }: Props) {
  const [{ formId: categoryId }] = await Promise.all([
    params,
    requireAuth(),
  ]);

  const category = await prisma.serviceCategory.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      name: true,
      services: { select: { name: true }, orderBy: { name: "asc" } },
      intakeForm: { select: { id: true, fields: true } },
    },
  });

  if (!category) notFound();

  const rawFields = category.intakeForm?.fields;
  const fields: FormField[] = Array.isArray(rawFields)
    ? (rawFields as unknown as FormField[])
    : [];

  const data: BuilderData = {
    categoryId: category.id,
    categoryName: category.name,
    serviceNames: category.services.map((s) => s.name),
    formId: category.intakeForm?.id ?? null,
    fields,
  };

  return <FormBuilder data={data} />;
}
