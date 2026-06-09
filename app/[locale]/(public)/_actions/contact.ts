"use server";

import { z } from "zod";
import { sendContactEmail } from "@/lib/email";

const schema = z.object({
  name:    z.string().min(1).max(100),
  email:   z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
});

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function submitContact(
  formData: z.infer<typeof schema>
): Promise<ContactResult> {
  const parsed = schema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  try {
    await sendContactEmail(parsed.data);
    return { ok: true };
  } catch (e) {
    console.error("[contact] submitContact error:", e);
    return { ok: false, error: "server_error" };
  }
}
