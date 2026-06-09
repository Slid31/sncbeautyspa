"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientInfo } from "../actions";

interface Props {
  initial: ClientInfo;
  onBack: () => void;
  onNext: (client: ClientInfo) => void;
}

export function StepClientInfo({ initial, onBack, onNext }: Props) {
  const t = useTranslations("booking");

  const schema = z.object({
    firstName: z.string().min(1, { message: t("firstNameRequired") }),
    lastName: z.string().min(1, { message: t("lastNameRequired") }),
    email: z
      .string()
      .min(1, { message: t("emailRequired") })
      .email({ message: t("emailInvalid") }),
    phone: z.string().min(1, { message: t("phoneRequired") }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientInfo>({
    resolver: zodResolver(schema) as never,
    defaultValues: initial,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">{t("yourDetails")}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">{t("firstName")}</Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            {...register("firstName")}
            className={errors.firstName ? "border-red-400" : ""}
          />
          {errors.firstName && (
            <p className="text-xs text-red-500">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName">{t("lastName")}</Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            {...register("lastName")}
            className={errors.lastName ? "border-red-400" : ""}
          />
          {errors.lastName && (
            <p className="text-xs text-red-500">{errors.lastName.message}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={errors.email ? "border-red-400" : ""}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            {...register("phone")}
            className={errors.phone ? "border-red-400" : ""}
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>

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
          type="submit"
          className="flex-1 sm:flex-none bg-pink-600 hover:bg-pink-700 text-white rounded-full px-8"
        >
          {t("next")}
        </Button>
      </div>
    </form>
  );
}
