import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

type BackendLoginResponse = {
  success?: boolean;
  data?: {
    accessToken?: string;
    email?: string;
    expiresIn?: number;
    name?: string;
    onboardingCompleted?: boolean;
    onboardingCompletedAt?: string;
    refreshToken?: string;
    tokenType?: string;
  };
  message?: string;
};

type JwtPayload = Record<string, unknown>;

function getStringCredential(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function getBooleanValue(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function getNumberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getStringClaim(payload: JwtPayload | null, keys: string[]) {
  if (!payload) {
    return null;
  }

  for (const key of keys) {
    const value = getStringValue(payload[key]);

    if (value) {
      return value;
    }
  }

  return null;
}

function decodeJwtPayload(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "=",
    );
    const binary = atob(paddedBase64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(decoded) as unknown;

    return parsed && typeof parsed === "object"
      ? (parsed as JwtPayload)
      : null;
  } catch {
    return null;
  }
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

export const {
  handlers,
  signIn,
  signOut,
  auth,
  unstable_update: update,
} = NextAuth({
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

        const payload = decodeJwtPayload(data.data.accessToken);
        const responseEmail = getStringValue(data.data.email);
        const tokenEmail = getStringClaim(payload, ["email"]);
        const sessionEmail = responseEmail ?? tokenEmail ?? email;
        const responseName = getStringValue(data.data.name);
        const tokenName = getStringClaim(payload, [
          "name",
          "nickname",
          "preferred_username",
          "username",
        ]);
        const tokenId = getStringClaim(payload, ["sub", "id", "userId"]);
        const sessionName = responseName ?? tokenName;

        return {
          accessToken: data.data.accessToken,
          expiresIn: getNumberValue(data.data.expiresIn),
          id: tokenId ?? sessionEmail,
          email: sessionEmail,
          name: sessionName === sessionEmail ? null : sessionName,
          onboardingCompleted: getBooleanValue(data.data.onboardingCompleted),
          onboardingCompletedAt: getStringValue(data.data.onboardingCompletedAt),
          refreshToken: getStringValue(data.data.refreshToken),
          tokenType: getStringValue(data.data.tokenType),
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = user.accessToken ?? token.accessToken;
        token.sub = user.id ?? token.sub;
        token.email = user.email ?? token.email;
        token.expiresIn = user.expiresIn ?? token.expiresIn;
        token.name = user.name ?? token.name;
        token.onboardingCompleted =
          user.onboardingCompleted ?? token.onboardingCompleted;
        token.onboardingCompletedAt =
          user.onboardingCompletedAt ?? token.onboardingCompletedAt;
        token.refreshToken = user.refreshToken ?? token.refreshToken;
        token.tokenType = user.tokenType ?? token.tokenType;
      }

      if (trigger === "update") {
        const updatedUser = getUpdatedSessionUser(session);
        const onboardingCompleted = getBooleanValue(
          updatedUser?.onboardingCompleted,
        );
        const onboardingCompletedAt = getStringValue(
          updatedUser?.onboardingCompletedAt,
        );

        token.onboardingCompleted =
          onboardingCompleted ?? token.onboardingCompleted;
        token.onboardingCompletedAt =
          onboardingCompletedAt ?? token.onboardingCompletedAt;
      }

      return token;
    },
    session({ session, token }) {
      session.user = {
        ...session.user,
        accessToken: getStringValue(token.accessToken),
        expiresIn: getNumberValue(token.expiresIn),
        id: getStringValue(token.sub) ?? session.user?.id,
        email: getStringValue(token.email) ?? session.user?.email,
        name: getStringValue(token.name) ?? session.user?.name,
        onboardingCompleted: getBooleanValue(token.onboardingCompleted),
        onboardingCompletedAt: getStringValue(token.onboardingCompletedAt),
        refreshToken: getStringValue(token.refreshToken),
        tokenType: getStringValue(token.tokenType),
      };

      return session;
    },
  },
});

function getUpdatedSessionUser(session: unknown) {
  if (!session || typeof session !== "object" || !("user" in session)) {
    return null;
  }

  const { user } = session as {
    user?: {
      onboardingCompleted?: unknown;
      onboardingCompletedAt?: unknown;
    };
  };

  return user ?? null;
}
