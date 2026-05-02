// Phase 2 — NextAuth handler (Credentials + Google + Prisma adapter)
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
