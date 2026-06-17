"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitIntakeForm } from "../actions";
import type { IntakeFormData } from "../actions";
import type { FormField } from "@/app/[locale]/(public)/book/actions";

interface Props {
  token: string;
  data: IntakeFormData;
  copy: {
    submitButton: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    requiredField: string;
    sectionPrefix: string;
  };
}

export function IntakeFormClient({ token, data, copy }: Props) {
  const [answers, setAnswers] = useState<Record<string, Record<string, unknown>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setAnswer(formId: string, label: string, value: unknown) {
    setAnswers((prev) => ({
      ...prev,
      [formId]: { ...(prev[formId] ?? {}), [label]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required fields
    for (const form of data.forms) {
      for (const field of form.fields) {
        if (!field.required) continue;
        const val = answers[form.formId]?.[field.label];
        if (val === undefined || val === "" || val === false) {
          const el = document.getElementById(`field-${form.formId}-${field.id}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
    }

    setSubmitting(true);
    setError(null);
    const result = await submitIntakeForm(token, answers);
    setSubmitting(false);

    if (result.ok) {
      setSubmitted(true);
    } else {
      setError(result.error ?? "error");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="text-4xl">✅</div>
        <h2 className="text-xl font-semibold text-slate-900">{copy.successTitle}</h2>
        <p className="text-slate-500">{copy.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {data.forms.map((form) => (
        <div key={form.formId} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
          <p className="text-sm font-medium text-pink-700 border-b border-pink-100 pb-2">
            {copy.sectionPrefix}: {form.categoryName}
          </p>
          {form.fields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              formId={form.formId}
              value={answers[form.formId]?.[field.label]}
              onChange={(val) => setAnswer(form.formId, field.label, val)}
            />
          ))}
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full py-3"
      >
        {submitting ? copy.submitting : copy.submitButton}
      </Button>
    </form>
  );
}

function FieldRenderer({
  field,
  formId,
  value,
  onChange,
}: {
  field: FormField;
  formId: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `field-${formId}-${field.id}`;
  const str = (value as string) ?? "";
  const bool = (value as boolean) ?? false;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-pink-600 text-xs">*</span>}
      </Label>

      {field.type === "text" && (
        <Input id={id} value={str} onChange={(e) => onChange(e.target.value)} required={field.required} />
      )}
      {field.type === "textarea" && (
        <Textarea id={id} value={str} onChange={(e) => onChange(e.target.value)} rows={3} required={field.required} />
      )}
      {field.type === "select" && (
        <select
          id={id}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={cn(
            "w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          )}
        >
          <option value="">—</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
      {field.type === "checkbox" && (
        <div className="flex items-center gap-2 mt-1">
          <input
            id={id}
            type="checkbox"
            checked={bool}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
          />
          <span className="text-sm text-slate-600">{field.label}</span>
        </div>
      )}
      {field.type === "date" && (
        <Input id={id} type="date" value={str} onChange={(e) => onChange(e.target.value)} required={field.required} />
      )}
    </div>
  );
}
