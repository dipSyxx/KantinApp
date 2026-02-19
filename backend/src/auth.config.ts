import type { NextAuthConfig } from "next-auth";

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const SESSION_UPDATE_AGE_SECONDS = 24 * 60 * 60;

const authConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.JWT_SECRET,
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const tokenId = typeof token.id === "string" ? token.id : token.sub;
        if (tokenId) {
          session.user.id = tokenId;
        }

        if (typeof token.role === "string") {
          session.user.role = token.role;
        }
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
