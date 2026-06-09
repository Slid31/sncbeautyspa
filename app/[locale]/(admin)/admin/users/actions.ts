"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ── Types ──────────────────────────────────────────────────────────────────────

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  createdAt: string;
};

export type MutationResult =
  | { ok: true }
  | { ok: false; error: string };

// ── getUsers ──────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<UserRow[]> {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role as UserRow["role"],
    createdAt: r.createdAt.toISOString(),
  }));
}

// ── createUser ────────────────────────────────────────────────────────────────

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "STAFF";
};

export async function createUser(input: CreateUserInput): Promise<MutationResult> {
  try {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) return { ok: false, error: "email_taken" };

    const hashed = await bcrypt.hash(input.password, 12);
    await prisma.user.create({
      data: { name: input.name, email: input.email, password: hashed, role: input.role },
    });

    revalidatePath("/admin/users");
    revalidatePath("/fr/admin/users");
    return { ok: true };
  } catch {
    return { ok: false, error: "server_error" };
  }
}

// ── updateUser ────────────────────────────────────────────────────────────────

export type UpdateUserInput = {
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  password?: string; // blank = keep existing
};

export async function updateUser(id: string, input: UpdateUserInput): Promise<MutationResult> {
  try {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing && existing.id !== id) return { ok: false, error: "email_taken" };

    const data: Record<string, unknown> = {
      name: input.name,
      email: input.email,
      role: input.role,
    };

    if (input.password && input.password.trim().length > 0) {
      data.password = await bcrypt.hash(input.password, 12);
    }

    await prisma.user.update({ where: { id }, data });

    revalidatePath("/admin/users");
    revalidatePath("/fr/admin/users");
    return { ok: true };
  } catch {
    return { ok: false, error: "server_error" };
  }
}

// ── deleteUser ────────────────────────────────────────────────────────────────

export async function deleteUser(id: string): Promise<MutationResult> {
  try {
    const session = await auth();
    if (session?.user?.id === id) {
      return { ok: false, error: "cannot_delete_self" };
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin/users");
    revalidatePath("/fr/admin/users");
    return { ok: true };
  } catch {
    return { ok: false, error: "server_error" };
  }
}
