"use server";

import { redirect } from "next/navigation";

type SignupState = {
  message: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
};

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getPasswordValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function getSignupUrl() {
  if (process.env.AUTH_BACKEND_SIGNUP_URL) {
    return process.env.AUTH_BACKEND_SIGNUP_URL;
  }

  if (process.env.AUTH_BACKEND_URL) {
    return new URL("/api/v1/auth/signup", process.env.AUTH_BACKEND_URL).toString();
  }

  return null;
}

export async function signup(
  _state: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = getStringValue(formData.get("email"));
  const name = getStringValue(formData.get("name"));
  const password = getPasswordValue(formData.get("password"));
  const signupUrl = getSignupUrl();

  if (!email || !name || !password) {
    return { message: "Please fill in all fields." };
  }

  if (password.length < 8 || password.length > 72) {
    return { message: "Password must be between 8 and 72 characters." };
  }

  if (name.length > 50) {
    return { message: "Name must be 50 characters or fewer." };
  }

  if (!signupUrl) {
    return { message: "Backend URL is not configured." };
  }

  try {
    const response = await fetch(signupUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name, password }),
    });
    const data = (await response.json().catch(() => ({}))) as ApiResponse;

    if (!response.ok || data.success === false) {
      return {
        message: data.message || "Failed to create account.",
      };
    }
  } catch {
    return { message: "Failed to connect to the backend." };
  }

  redirect("/signin");
}
