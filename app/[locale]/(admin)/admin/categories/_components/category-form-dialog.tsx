"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { createCategory, updateCategory } from "../actions";
import type { CategoryRow } from "../actions";

interface Props {
  open: boolean;
  onClose: () => void;
  category?: CategoryRow | null;
}

export function CategoryFormDialog({ open, onClose, category }: Props) {
  const t = useTranslations("admin.categories");

  const schema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, t("form.nameRequired"))
          .max(100, t("form.nameMaxLength")),
        description: z
          .string()
          .max(500, t("form.descriptionMaxLength"))
          .optional(),
        image: z
          .union([z.string().url(t("form.imageInvalid")), z.literal("")])
          .optional(),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", image: "" },
  });

  // Sync form values when dialog opens or edited category changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name ?? "",
        description: category?.description ?? "",
        image: category?.image ?? "",
      });
    }
  }, [open, category, form]);

  const isEditing = !!category;

  async function onSubmit(values: FormValues) {
    const result = isEditing
      ? await updateCategory(category!.id, values)
      : await createCategory(values);

    if (result.ok) {
      toast.success(isEditing ? t("edit.success") : t("create.success"));
      onClose();
    } else {
      toast.error(isEditing ? t("edit.error") : t("create.error"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("edit.title") : t("create.title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("edit.description") : t("create.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("form.namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("form.cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t("form.saving") : t("form.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
