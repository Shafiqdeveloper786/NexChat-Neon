import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      // token is null  → user is not signed in → deny access → redirect to /login
      authorized: ({ token }) => !!token,
    },
    // Explicitly set the sign-in page so NextAuth redirects correctly on both
    // localhost and the Vercel production domain (NEXTAUTH_URL controls the host).
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/conversations/:path*", "/profile/:path*", "/dashboard/:path*"],
};
