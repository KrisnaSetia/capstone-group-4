// utils/auth.ts
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

export interface AuthUser {
  userId: number;
  email: string;
  username: string;
  roles: number; // 0 = psikolog, 1 = mahasiswa
}

// Role constants
export const ROLES = {
  PSIKOLOG: 0,
  MAHASISWA: 1,
  ADMIN: 2,
} as const;

export const ROLE_NAMES: Record<number, string> = {
  [ROLES.PSIKOLOG]: "Psikolog",
  [ROLES.MAHASISWA]: "Mahasiswa",
  [ROLES.ADMIN]: "Admin",
};

export function getUserRoleName(roles: number): string {
  return ROLE_NAMES[roles] ?? "Tidak diketahui";
}

// Function untuk verify token dari cookie (server-side)
export function verifyToken(token: string): AuthUser | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not found");

    const decoded = jwt.verify(token, secret) as AuthUser;
    return decoded;
  } catch (error) {
    if ((error as Error).name === "TokenExpiredError") {
      console.warn("JWT expired");
    } else {
      console.error("JWT verify failed:", (error as Error).message);
    }
    return null;
  }
}

// Function untuk get user dari request (API routes)
export function getUserFromRequest(req: NextApiRequest): AuthUser | null {
  const token = req.cookies.token;
  if (!token) return null;
  return verifyToken(token);
}

// Function untuk cek apakah user memiliki akses ke resource tertentu
export function hasAccessToResource(
  user: AuthUser,
  resourceUserId: number,
  resourceType: "mahasiswa" | "psikolog" | "admin"
): boolean {
  if (resourceType === "mahasiswa" && user.roles !== ROLES.MAHASISWA) return false;
  if (resourceType === "psikolog" && user.roles !== ROLES.PSIKOLOG) return false;
  if (resourceType === "admin" && user.roles !== ROLES.ADMIN) return false;
  return user.userId === resourceUserId;
}

// Function untuk validasi akses di API routes
export function validateApiAccess(
  req: NextApiRequest,
  resourceUserId: number,
  resourceType: "mahasiswa" | "psikolog" | "admin"
): {
  isValid: boolean;
  user: AuthUser | null;
  error: string | null;
} {
  const user = getUserFromRequest(req);

  if (!user) {
    return { isValid: false, user: null, error: "Authentication required" };
  }

  if (!hasAccessToResource(user, resourceUserId, resourceType)) {
    return { isValid: false, user, error: "Access denied" };
  }

  return { isValid: true, user, error: null };
}

// SSR auth wrapper
export function withAuthSSR(
  getServerSidePropsFunc?: (
    context: GetServerSidePropsContext
  ) => Promise<GetServerSidePropsResult<Record<string, unknown>>>,
  allowedRoles?: number[]
) {
  return async (context: GetServerSidePropsContext) => {
    const { req } = context;
    const token = req.cookies.token;

    if (!token) {
      return {
        redirect: {
          destination: "/auth//signin",
          permanent: false,
        },
      };
    }

    const user = verifyToken(token);
    if (!user) {
      return {
        redirect: {
          destination: "/auth//signin",
          permanent: false,
        },
      };
    }

    if (allowedRoles && !allowedRoles.includes(user.roles)) {
      return {
        redirect: {
          destination: "/unauthorized",
          permanent: false,
        },
      };
    }

    let additionalProps: Record<string, unknown> = {};
    if (getServerSidePropsFunc) {
      const result = await getServerSidePropsFunc(context);
      if ("props" in result) {
        additionalProps = result.props as Record<string, unknown>;
      }
      if ("redirect" in result || "notFound" in result) {
        return result;
      }
    }

    return {
      props: {
        user,
        ...additionalProps,
      },
    };
  };
}

// API route auth wrapper
export function withAuthApi(
  handler: (req: NextApiRequest & { user: AuthUser }, res: NextApiResponse) => void | Promise<void>,
  allowedRoles?: number[]
) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const user = getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (allowedRoles && !allowedRoles.includes(user.roles)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    (req as NextApiRequest & { user: AuthUser }).user = user;
    return handler(req as NextApiRequest & { user: AuthUser }, res);
  };
}

// Client-side
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return document.cookie.includes("token=");
}

export function logout(): void {
  if (typeof window !== "undefined") {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/auth//signin";
  }
}

export function getRedirectUrl(roles: number): string {
  if (roles === ROLES.MAHASISWA) return "/mahasiswa/beranda";
  if (roles === ROLES.PSIKOLOG) return "/psikolog/beranda";
  if (roles === ROLES.ADMIN) return "/admin/beranda";
  return "/auth//signin";
}
