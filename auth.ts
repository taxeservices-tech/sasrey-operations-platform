import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import db from "@/app/lib/auth/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();

        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const user = db
          .prepare(
            `
              SELECT
                id,
                name,
                email,
                password_hash,
                role,
                active
              FROM users
              WHERE email = ?
              LIMIT 1
            `
          )
          .get(email) as
          | {
              id: string;
              name: string;
              email: string;
              password_hash: string;
              role: string;
              active: number;
            }
          | undefined;

        if (!user || user.active !== 1) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.password_hash
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = String(token.role ?? "");
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
