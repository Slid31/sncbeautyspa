"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

type State = { error: string } | null;

export async function loginAction(_prevState: State, formData: FormData): Promise<State> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Invalid form data." };
  }

  if (!email.trim() || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirectTo: "/admin",
    });
  } catch (error) {
    // signIn throws NEXT_REDIRECT on success — re-throw so Next.js handles it
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        case "CallbackRouteError":
          return { error: "Authentication failed. Please try again." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }

  return null;
}
