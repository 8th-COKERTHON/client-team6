"use client";

import Link from "next/link";
import { useActionState } from "react";
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
      className="space-y-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
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

      <button
        className="h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Signing up..." : "Sign up"}
      </button>

      {state.message ? (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}

      <p className="text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link className="font-medium text-zinc-950" href="/signin">
          Sign in
        </Link>
      </p>
    </form>
  );
}
