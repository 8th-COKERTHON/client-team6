"use client";

import { useActionState } from "react";
import {
  AuthContent,
  AuthTopBar,
  MobileHomeIndicator,
  PasswordHiddenIcon,
} from "@/components/auth/auth-screen";
import { useFormReady } from "@/components/auth/use-form-ready";
import { ActionButton } from "@/components/ui/action-button";
import { AuthInput } from "../components/auth-input";
import { signin } from "./actions";

const initialState = {
  message: "",
};

export default function SigninPage() {
  const [state, formAction, pending] = useActionState(signin, initialState);
  const { formRef, isReady, syncFormReady } = useFormReady();

  return (
    <form
      action={formAction}
      className="flex min-h-svh flex-col bg-[#12161b] text-white"
      onInput={syncFormReady}
      ref={formRef}
    >
      <AuthTopBar title="로그인" />

      <AuthContent>
        <div className="space-y-8">
          <AuthInput
            autoComplete="email"
            label="이메일"
            name="email"
            placeholder="이메일 주소를 입력해 주세요."
            required
            type="email"
          />
          <AuthInput
            autoComplete="current-password"
            label="비밀번호"
            name="password"
            placeholder="비밀번호를 입력해 주세요."
            required
            trailingIcon={<PasswordHiddenIcon />}
            type="password"
          />
          <ActionButton disabled={pending} isActive={isReady} type="submit">
            {pending ? "로그인 중..." : "로그인"}
          </ActionButton>
        </div>

        {state.message ? (
          <p className="mt-4 text-sm text-[#ff0002]" role="alert">
            {state.message}
          </p>
        ) : null}
      </AuthContent>

      <MobileHomeIndicator className="mt-auto" />
    </form>
  );
}
