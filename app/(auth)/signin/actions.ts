"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

type SigninState = {
  message: string;
};

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getPasswordValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function signin(
  _state: SigninState,
  formData: FormData,
): Promise<SigninState> {
  const email = getStringValue(formData.get("email"));
  const password = getPasswordValue(formData.get("password"));

  if (!email || !password) {
    return { message: "Please enter your email and password." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (
        error.type === "CredentialsSignin" ||
        error.type === "CallbackRouteError"
      ) {
        return { message: "Invalid email or password." };
      }

      return { message: "Unable to sign in. Please try again." };
    }

    throw error;
  }

  return { message: "" };
}
