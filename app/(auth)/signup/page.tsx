import Link from "next/link";
import { AuthInput } from "../components/auth-input";

export default function SignupPage() {
  return (
    <form className="space-y-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
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
        className="h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        type="submit"
      >
        Sign up
      </button>

      <p className="text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link className="font-medium text-zinc-950" href="/signin">
          Sign in
        </Link>
      </p>
    </form>
  );
}
