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
      className="space-y-5 rounded-lg border border-[#292e38] bg-[#171c23] p-6 shadow-sm"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
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
        <p className="text-sm text-[#ff0002]" role="alert">
          {state.message}
        </p>
      ) : null}

      <p className="text-center text-sm text-[#b1b9c5]">
        Need an account?{" "}
        <Link className="font-medium text-white" href="/signup">
          Sign up
        </Link>
      </p>
    </form>
  );
}
