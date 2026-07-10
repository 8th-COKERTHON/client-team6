"use client";

import { useActionState } from "react";
import {
  AuthBottomAction,
  AuthContent,
  AuthTopBar,
  PasswordHiddenIcon,
} from "@/components/auth/auth-screen";
import { useFormReady } from "@/components/auth/use-form-ready";
import { ActionButton } from "@/components/ui/action-button";
import { AuthInput } from "../components/auth-input";
import { signup } from "./actions";

const initialState = {
  message: "",
};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);
  const { formRef, isReady, syncFormReady } = useFormReady();

  return (
    <form
      action={formAction}
      className="flex min-h-svh flex-col bg-[#12161b] text-white"
      onInput={syncFormReady}
      ref={formRef}
    >
      <AuthTopBar title="회원가입" />

      <AuthContent className="space-y-8">
        <AuthInput
          autoComplete="email"
          label="이메일"
          name="email"
          placeholder="이메일 주소를 입력해 주세요."
          required
          type="email"
        />
        <AuthInput
          autoComplete="new-password"
          label="비밀번호"
          name="password"
          placeholder="비밀번호를 입력해 주세요."
          required
          trailingIcon={<PasswordHiddenIcon />}
          type="password"
        />
        <AuthInput
          autoComplete="name"
          label="이름"
          name="name"
          placeholder="이름을 입력해 주세요."
          required
          type="text"
        />

        {state.message ? (
          <p className="text-sm text-[#ff0002]" role="alert">
            {state.message}
          </p>
        ) : null}
      </AuthContent>

      <AuthBottomAction>
        <ActionButton disabled={pending} isActive={isReady} type="submit">
          {pending ? "회원가입 중..." : "회원가입"}
        </ActionButton>
      </AuthBottomAction>
    </form>
  );
}
