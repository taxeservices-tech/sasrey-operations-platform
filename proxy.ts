import { auth } from "@/auth";

export default auth((request) => {
  const isLoggedIn = !!request.auth?.user;
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith("/operations") ||
    pathname.startsWith("/dispatch");

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.nextUrl.origin);

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname
    );

    return Response.redirect(loginUrl);
  }

  return;
});

export const config = {
  matcher: [
    "/operations/:path*",
    "/dispatch/:path*",
  ],
};