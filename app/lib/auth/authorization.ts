import { auth } from "@/auth";
import { NextResponse } from "next/server";

export type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "SALES"
  | "DISPATCHER"
  | "DRIVER";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      ),
    };
  }

  return {
    authorized: true as const,
    session,
  };
}

export async function requireRole(
  allowedRoles: UserRole[]
) {
  const result = await requireAuth();

  if (!result.authorized) {
    return result;
  }

  const role = result.session.user.role as UserRole;

  if (!allowedRoles.includes(role)) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          success: false,
          message: "You do not have permission to perform this action.",
        },
        { status: 403 }
      ),
    };
  }

  return result;
}