import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Protect all app routes except auth pages and API
  matcher: ["/conversations/:path*", "/profile/:path*", "/dashboard/:path*"],
};
