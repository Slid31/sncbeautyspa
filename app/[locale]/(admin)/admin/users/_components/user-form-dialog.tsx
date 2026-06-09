"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createUser, updateUser, type UserRow } from "../actions";

// ── Schema ─────────────────────────────────────────────────────────────────────

const _base = z.object({
  name:     z.string().min(1).max(100),
  email:    z.string().min(1).email(),
  password: z.string(),
  role:     z.enum(["ADMIN", "STAFF"]),
});
type FormValues = z.infer<typeof _base>;

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  user?: UserRow | null;
}

export function UserFormDialog({ open, onClose, user }: Props) {
  const t  = useTranslations("admin.users");
  const tf = useTranslations("admin.users.form");
  const isEditing = !!user;
  const [showPassword, setShowPassword] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name:  z.string().min(1, tf("nameRequired")).max(100),
        email: z.string().min(1, tf("emailRequired")).email(tf("emailInvalid")),
        password: isEditing
          ? z.string().refine(
              (v) => v.length === 0 || v.length >= 8,
              tf("passwordMin")
            )
          : z.string().min(1, tf("passwordRequired")).min(8, tf("passwordMin")),
        role: z.enum(["ADMIN", "STAFF"]),
      }),
    [tf, isEditing]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: "", email: "", password: "", role: "STAFF" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name:     user?.name  ?? "",
        email:    user?.email ?? "",
        password: "",
        role:     (user?.role ?? "STAFF") as "ADMIN" | "STAFF",
      });
      setShowPassword(false);
    }
  }, [open, user, form]);

  async function onSubmit(values: FormValues) {
    const result = isEditing
      ? await updateUser(user!.id, {
          name:     values.name,
          email:    values.email,
          role:     values.role,
          password: values.password || undefined,
        })
      : await createUser({
          name:     values.name,
          email:    values.email,
          password: values.password,
          role:     values.role,
        });

    if (result.ok) {
      toast.success(isEditing ? t("edit.success") : t("create.success"));
      onClose();
    } else {
      const msg =
        result.error === "email_taken"
          ? tf("emailInvalid")
          : isEditing
          ? t("edit.error")
          : t("create.error");
      toast.error(msg);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? tf("editTitle") : tf("createTitle")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="user-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={tf("namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={tf("emailPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={tf("passwordPlaceholder")}
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword
                          ? <EyeOff className="h-4 w-4" />
                          : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  {isEditing && (
                    <FormDescription className="text-xs text-slate-500">
                      {t("newPasswordHint")}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("role")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STAFF">{t("roleStaff")}</SelectItem>
                      <SelectItem value="ADMIN">{t("roleAdmin")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>{tf("cancel")}</Button>
          <Button
            type="submit"
            form="user-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? tf("saving") : tf("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
