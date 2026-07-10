import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

type BackendTokenResponse = {
  accessToken?: string;
  expiresIn?: number;
  refreshToken?: string;
  tokenType?: string;
};

type BackendLoginResponse = {
  success?: boolean;
  data?: BackendTokenResponse & {
    email?: string;
    name?: string;
    onboardingCompleted?: boolean;
    onboardingCompletedAt?: string;
  };
  message?: string;
};

type BackendRefreshResponse = {
  success?: boolean;
  data?: BackendTokenResponse;
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

function getNumberClaim(payload: JwtPayload | null, keys: string[]) {
  if (!payload) {
    return null;
  }

  for (const key of keys) {
    const value = getNumberValue(payload[key]);

    if (value) {
      return value;
    }
  }

  return null;
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

function getAccessTokenExpiresAt(
  accessToken?: string | null,
  expiresIn?: number | null,
) {
  if (!accessToken) {
    return null;
  }

  const exp = getNumberClaim(decodeJwtPayload(accessToken), ["exp"]);

  if (exp) {
    return exp * 1000;
  }

  if (expiresIn) {
    return Date.now() + expiresIn * 1000;
  }

  return null;
}

function shouldRefreshAccessToken(expiresAt?: number | null) {
  if (!expiresAt) {
    return false;
  }

  return Date.now() >= expiresAt - TOKEN_REFRESH_BUFFER_MS;
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

function getRefreshUrl() {
  if (process.env.AUTH_BACKEND_URL) {
    return new URL("/api/v1/auth/refresh", process.env.AUTH_BACKEND_URL).toString();
  }

  return null;
}

async function refreshAccessToken(token: JWT) {
  const refreshToken = getStringValue(token.refreshToken);
  const refreshUrl = getRefreshUrl();

  if (!refreshToken || !refreshUrl) {
    return {
      ...token,
      refreshError: "RefreshAccessTokenError",
    };
  }

  try {
    const response = await fetch(refreshUrl, {
      body: JSON.stringify({ refreshToken }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const data = (await response
      .json()
      .catch(() => ({}))) as BackendRefreshResponse;
    const nextAccessToken = getStringValue(data.data?.accessToken);

    if (!response.ok || data.success === false || !nextAccessToken) {
      return {
        ...token,
        refreshError: "RefreshAccessTokenError",
      };
    }

    const nextExpiresIn = getNumberValue(data.data?.expiresIn);

    return {
      ...token,
      accessToken: nextAccessToken,
      accessTokenExpiresAt: getAccessTokenExpiresAt(
        nextAccessToken,
        nextExpiresIn,
      ),
      expiresIn: nextExpiresIn ?? token.expiresIn,
      refreshError: null,
      refreshToken: getStringValue(data.data?.refreshToken) ?? refreshToken,
      tokenType:
        getStringValue(data.data?.tokenType) ??
        getStringValue(token.tokenType) ??
        "Bearer",
    };
  } catch {
    return {
      ...token,
      refreshError: "RefreshAccessTokenError",
    };
  }
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
        const expiresIn = getNumberValue(data.data.expiresIn);

        return {
          accessToken: data.data.accessToken,
          accessTokenExpiresAt: getAccessTokenExpiresAt(
            data.data.accessToken,
            expiresIn,
          ),
          expiresIn,
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = user.accessToken ?? token.accessToken;
        token.accessTokenExpiresAt =
          user.accessTokenExpiresAt ?? token.accessTokenExpiresAt;
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
        token.refreshError = null;
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

      if (!getNumberValue(token.accessTokenExpiresAt)) {
        token.accessTokenExpiresAt =
          getAccessTokenExpiresAt(
            getStringValue(token.accessToken),
            getNumberValue(token.expiresIn),
          ) ?? token.accessTokenExpiresAt;
      }

      if (shouldRefreshAccessToken(getNumberValue(token.accessTokenExpiresAt))) {
        return refreshAccessToken(token);
      }

      return token;
    },
    session({ session, token }) {
      session.user = {
        ...session.user,
        accessToken: getStringValue(token.accessToken),
        accessTokenExpiresAt: getNumberValue(token.accessTokenExpiresAt),
        expiresIn: getNumberValue(token.expiresIn),
        id: getStringValue(token.sub) ?? session.user?.id,
        email: getStringValue(token.email) ?? session.user?.email,
        name: getStringValue(token.name) ?? session.user?.name,
        onboardingCompleted: getBooleanValue(token.onboardingCompleted),
        onboardingCompletedAt: getStringValue(token.onboardingCompletedAt),
        refreshError: getStringValue(token.refreshError),
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
