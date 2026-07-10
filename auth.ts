import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

type BackendLoginResponse = {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
  };
};

function getStringCredential(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getLoginUrl() {
  if (process.env.AUTH_BACKEND_LOGIN_URL) {
    return process.env.AUTH_BACKEND_LOGIN_URL;
  }

  if (process.env.AUTH_BACKEND_URL) {
    return new URL("/auth/login", process.env.AUTH_BACKEND_URL).toString();
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
        const user = data.user;

        if (!user?.id) {
          return null;
        }

        return {
          id: user.id,
          email: user.email ?? email,
          name: user.name ?? null,
        };
      },
    }),
  ],
});
