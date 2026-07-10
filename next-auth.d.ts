import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      accessToken?: string | null;
      expiresIn?: number | null;
      id?: string | null;
      onboardingCompleted?: boolean | null;
      onboardingCompletedAt?: string | null;
      refreshToken?: string | null;
      tokenType?: string | null;
    };
  }

  interface User {
    accessToken?: string | null;
    expiresIn?: number | null;
    onboardingCompleted?: boolean | null;
    onboardingCompletedAt?: string | null;
    refreshToken?: string | null;
    tokenType?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string | null;
    expiresIn?: number | null;
    onboardingCompleted?: boolean | null;
    onboardingCompletedAt?: string | null;
    refreshToken?: string | null;
    tokenType?: string | null;
  }
}
