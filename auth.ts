import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

type BackendLoginResponse = {
  success?: boolean;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
  };
  message?: string;
};

function getStringCredential(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getLoginUrl() {
  if (process.env.AUTH_BACKEND_LOGIN_URL) {
    return process.env.AUTH_BACKEND_LOGIN_URL;
  }

  if (process.env.AUTH_BACKEND_URL) {
    return new URL("/api/v1/auth/login", process.env.AUTH_BACKEND_URL).toString();
  }

  return null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = getStringCredential(credentials?.email);
        const password = getStringCredential(credentials?.password);
        const loginUrl = getLoginUrl();

        if (!email || !password || !loginUrl) {
          return null;
        }

        const response = await fetch(loginUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as BackendLoginResponse;

        if (data.success === false || !data.data?.accessToken) {
          return null;
        }

        return {
          id: email,
          email,
          name: null,
        };
      },
    }),
  ],
});
