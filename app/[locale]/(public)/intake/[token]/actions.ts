"use server";

import { prisma } from "@/lib/prisma";
import type { FormField } from "@/app/[locale]/(public)/book/actions";

export type IntakeFormData = {
  appointmentId: string;
  clientFirstName: string;
  appointmentDate: Date;
  forms: {
    formId: string;
    categoryName: string;
    fields: FormField[];
  }[];
};

export type TokenValidation =
  | { status: "valid"; data: IntakeFormData }
  | { status: "expired" }
  | { status: "completed" }
  | { status: "not_found" };

export async function validateIntakeToken(token: string): Promise<TokenValidation> {
  const appt = await prisma.appointment.findUnique({
    where: { intakeFormToken: token },
    select: {
      id: true,
      date: true,
      intakeFormTokenExpiresAt: true,
      intakeFormCompletedAt: true,
      client: { select: { firstName: true } },
      services: {
        select: {
          service: {
            select: {
              category: {
                select: {
                  name: true,
                  intakeForm: { select: { id: true, fields: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!appt) return { status: "not_found" };
  if (appt.intakeFormCompletedAt) return { status: "completed" };
  if (appt.intakeFormTokenExpiresAt && appt.intakeFormTokenExpiresAt < new Date()) {
    return { status: "expired" };
  }

  // Collect unique forms (one per category)
  const seen = new Set<string>();
  const forms: IntakeFormData["forms"] = [];
  for (const s of appt.services) {
    const form = s.service.category.intakeForm;
    if (!form || seen.has(form.id)) continue;
    seen.add(form.id);
    forms.push({
      formId: form.id,
      categoryName: s.service.category.name,
      fields: JSON.parse(JSON.stringify(form.fields)) as FormField[],
    });
  }

  return {
    status: "valid",
    data: {
      appointmentId: appt.id,
      clientFirstName: appt.client.firstName,
      appointmentDate: appt.date,
      forms,
    },
  };
}

export async function submitIntakeForm(
  token: string,
  responses: Record<string, Record<string, unknown>>
): Promise<{ ok: boolean; error?: string }> {
  const appt = await prisma.appointment.findUnique({
    where: { intakeFormToken: token },
    select: {
      id: true,
      date: true,
      intakeFormTokenExpiresAt: true,
      intakeFormCompletedAt: true,
      services: {
        select: {
          service: {
            select: {
              category: {
                select: { intakeForm: { select: { id: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!appt) return { ok: false, error: "not_found" };
  if (appt.intakeFormCompletedAt) return { ok: false, error: "already_completed" };
  if (appt.intakeFormTokenExpiresAt && appt.intakeFormTokenExpiresAt < new Date()) {
    return { ok: false, error: "expired" };
  }

  // Find first form ID for the record
  const firstFormId = appt.services
    .map((s) => s.service.category.intakeForm?.id)
    .find(Boolean);

  if (!firstFormId) return { ok: false, error: "no_forms" };

  await prisma.$transaction([
    prisma.intakeFormResponse.upsert({
      where: { appointmentId: appt.id },
      create: {
        appointmentId: appt.id,
        formId: firstFormId,
        responses: JSON.parse(JSON.stringify(responses)),
      },
      update: {
        responses: JSON.parse(JSON.stringify(responses)),
      },
    }),
    prisma.appointment.update({
      where: { id: appt.id },
      data: { intakeFormCompletedAt: new Date() },
    }),
  ]);

  return { ok: true };
}
