"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { AuthInput } from "../components/auth-input";
import { signup } from "./actions";

const initialState = {
  message: "",
};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-lg border border-[#292e38] bg-[#171c23] p-6 shadow-sm"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Create account
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
        label="Name"
        name="name"
        type="text"
        autoComplete="name"
        required
      />
      <AuthInput
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
      />

      <ActionButton disabled={pending} type="submit">
        {pending ? "Signing up..." : "Sign up"}
      </ActionButton>

      {state.message ? (
        <p className="text-sm text-[#ff0002]" role="alert">
          {state.message}
        </p>
      ) : null}

      <p className="text-center text-sm text-[#b1b9c5]">
        Already have an account?{" "}
        <Link className="font-medium text-white" href="/signin">
          Sign in
        </Link>
      </p>
    </form>
  );
}
