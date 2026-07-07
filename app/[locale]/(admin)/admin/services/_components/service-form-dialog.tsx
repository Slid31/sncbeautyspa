"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { createService, updateService } from "../actions";
import type { ServiceRow, CategoryOption } from "../actions";

// ── Static schema for type inference (no translated messages needed) ──────────
// z.coerce.number() _output is `number`, so FormValues.price is `number`.
const _baseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().positive().max(10_000),
  duration: z.coerce.number().int().min(1).max(480),
  categoryId: z.string().min(1),
  image: z.union([z.string().url(), z.literal("")]).optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof _baseSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  service?: ServiceRow | null;
  categories: CategoryOption[];
}

export function ServiceFormDialog({ open, onClose, service, categories }: Props) {
  const t = useTranslations("admin.services");

  // Runtime schema with translated messages (same shape as _baseSchema)
  const schema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, t("form.nameRequired"))
          .max(100, t("form.nameMaxLength")),
        description: z
          .string()
          .max(1000, t("form.descriptionMaxLength"))
          .optional(),
        price: z.coerce
          .number({ message: t("form.priceRequired") })
          .positive(t("form.pricePositive"))
          .max(10_000, t("form.priceMax")),
        duration: z.coerce
          .number({ message: t("form.durationRequired") })
          .int()
          .min(1, t("form.durationMin"))
          .max(480, t("form.durationMax")),
        categoryId: z.string().min(1, t("form.categoryRequired")),
        image: z
          .union([z.string().url(t("form.imageInvalid")), z.literal("")])
          .optional(),
        isActive: z.boolean().default(true),
      }),
    [t]
  );

  // Cast needed: zodResolver types TFieldValues as z.input<T> (which includes
  // `unknown` for coerce fields), but FormValues uses the output type (number).
  // At runtime this is correct — zod coerces the raw string on validation.
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: "",
      description: "",
      price: "" as unknown as number,
      duration: "" as unknown as number,
      categoryId: "",
      image: "",
      isActive: true,
    },
  });

  // Sync when dialog opens or edited service changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: service?.name ?? "",
        description: service?.description ?? "",
        price: service ? parseFloat(service.price) : ("" as unknown as number),
        duration: service?.duration ?? ("" as unknown as number),
        categoryId: service?.categoryId ?? "",
        image: service?.image ?? "",
        isActive: service?.isActive ?? true,
      });
    }
  }, [open, service, form]);

  const isEditing = !!service;

  async function onSubmit(values: FormValues) {
    const result = isEditing
      ? await updateService(service!.id, values)
      : await createService(values);

    if (result.ok) {
      toast.success(isEditing ? t("edit.success") : t("create.success"));
      onClose();
    } else {
      toast.error(isEditing ? t("edit.error") : t("create.error"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {isEditing ? t("edit.title") : t("create.title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("edit.description") : t("create.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mr-1 pr-1">
          <Form {...form}>
            <form
              id="service-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-1 pb-2"
            >
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.namePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("form.descriptionPlaceholder")}
                        rows={3}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price + Duration side-by-side */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.price")}</FormLabel>
                      <FormControl>
                        {/* Spread then override value/onChange so the HTML input
                            sees a string (for proper empty-state display) while
                            zod coerces to number on validation. */}
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={t("form.pricePlaceholder")}
                          {...field}
                          value={
                            field.value === undefined || field.value === ("" as unknown as number)
                              ? ""
                              : (field.value as unknown as string)
                          }
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.duration")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          max="480"
                          placeholder={t("form.durationPlaceholder")}
                          {...field}
                          value={
                            field.value === undefined || field.value === ("" as unknown as number)
                              ? ""
                              : (field.value as unknown as string)
                          }
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.category")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("form.categoryPlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.image")}</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* isActive toggle */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium leading-none">
                        {t("form.isActive")}
                      </FormLabel>
                      <FormDescription className="text-xs text-slate-500">
                        {t("form.isActiveHint")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter className="gap-2 pt-3 shrink-0 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("form.cancel")}
          </Button>
          <Button
            type="submit"
            form="service-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? t("form.saving")
              : t("form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
