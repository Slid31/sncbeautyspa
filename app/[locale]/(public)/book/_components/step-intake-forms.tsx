"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ServiceOption, FormField } from "../actions";

interface Props {
  services: ServiceOption[];
  answers: Record<string, Record<string, unknown>>;
  onChange: (answers: Record<string, Record<string, unknown>>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepIntakeForms({ services, answers, onChange, onBack, onNext }: Props) {
  const t = useTranslations("booking");

  // One form per category — deduplicate by intakeFormId
  const seen = new Set<string>();
  const servicesWithForms = services.filter((s) => {
    if (!s.intakeFormId || !s.intakeFormFields) return false;
    if (seen.has(s.intakeFormId)) return false;
    seen.add(s.intakeFormId);
    return true;
  });

  function setAnswer(formId: string, label: string, value: unknown) {
    onChange({
      ...answers,
      [formId]: {
        ...(answers[formId] ?? {}),
        [label]: value,
      },
    });
  }

  // Validate all required fields before proceeding
  function handleNext() {
    for (const svc of servicesWithForms) {
      const fields = svc.intakeFormFields!;
      for (const field of fields) {
        if (!field.required) continue;
        const val = answers[svc.intakeFormId!]?.[field.label];
        if (val === undefined || val === "" || val === false) {
          // Scroll to first unfilled required field (best-effort)
          const el = document.getElementById(`field-${svc.intakeFormId}-${field.id}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
    }
    onNext();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{t("intakeTitle")}</h2>
        <p className="text-sm text-slate-500 mt-1">{t("intakeSubtitle")}</p>
      </div>

      {servicesWithForms.map((svc) => (
        <FormSection
          key={svc.id}
          service={svc}
          answers={answers[svc.intakeFormId!] ?? {}}
          onSet={(label, value) => setAnswer(svc.intakeFormId!, label, value)}
          labelPrefix={t("intakeFor", { serviceName: svc.categoryName })}
        />
      ))}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 sm:flex-none rounded-full px-6"
        >
          {t("back")}
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 sm:flex-none bg-pink-600 hover:bg-pink-700 text-white rounded-full px-8"
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
}

// ── Per-service form section ───────────────────────────────────────────────────

function FormSection({
  service,
  answers,
  onSet,
  labelPrefix,
}: {
  service: ServiceOption;
  answers: Record<string, unknown>;
  onSet: (label: string, value: unknown) => void;
  labelPrefix: string;
}) {
  const t = useTranslations("booking");
  const fields = service.intakeFormFields!;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
      <p className="text-sm font-medium text-pink-700 border-b border-pink-100 pb-2">
        {labelPrefix}
      </p>

      {fields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={answers[field.label]}
          onChange={(val) => onSet(field.label, val)}
          requiredMsg={t("requiredField")}
          formId={service.intakeFormId!}
        />
      ))}
    </div>
  );
}

// ── Individual field renderer ──────────────────────────────────────────────────

function FieldRenderer({
  field,
  value,
  onChange,
  requiredMsg,
  formId,
}: {
  field: FormField;
  value: unknown;
  onChange: (v: unknown) => void;
  requiredMsg: string;
  formId: string;
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
        <Input
          id={id}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      )}

      {field.type === "textarea" && (
        <Textarea
          id={id}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          required={field.required}
        />
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
            <option key={opt} value={opt}>
              {opt}
            </option>
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
        <Input
          id={id}
          type="date"
          value={str}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      )}
    </div>
  );
}
