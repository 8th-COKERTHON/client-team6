"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { AuthInput } from "../components/auth-input";
import { signin } from "./actions";

const initialState = {
  message: "",
};

export default function SigninPage() {
  const [state, formAction, pending] = useActionState(signin, initialState);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Sign in
        </h1>
      </div>

      <AuthInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <AuthInput
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      <ActionButton disabled={pending} type="submit">
        {pending ? "Signing in..." : "Sign in"}
      </ActionButton>

      {state.message ? (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}

      <p className="text-center text-sm text-zinc-600">
        Need an account?{" "}
        <Link className="font-medium text-zinc-950" href="/signup">
          Sign up
        </Link>
      </p>
    </form>
  );
}
