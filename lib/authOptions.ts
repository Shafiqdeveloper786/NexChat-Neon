import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.hashedPassword || !user.emailVerified) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValid) return null;

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id    = user.id;
        token.name  = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id    = token.id    as string;
        session.user.name  = token.name  as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      // Skip credentials — their OTP flow handles emailVerified separately.
      if (account?.provider === "credentials") return;

      if (!user.id) {
        console.warn("[NEXCHAT] OAuth signIn: user.id is missing — cannot patch DB record");
        return;
      }

      try {
        await prisma.user.update({
          where: { id: user.id },
          data:  {
            // PrismaAdapter sometimes leaves this null for OAuth users;
            // always force-set it so the user is definitively "verified".
            emailVerified: new Date(),
            // Mark online immediately — client heartbeat fires after 30 s,
            // this ensures they appear in the People list right away.
            isOnline: true,
          },
        });
        console.log(`[NEXCHAT] OAuth user patched: id=${user.id} provider=${account?.provider}`);
      } catch (err) {
        console.error("[NEXCHAT] Failed to patch OAuth user:", err);
      }
    },
  },
};
