import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare, hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function getConfiguredAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    return null;
  }

  return {
    name: process.env.ADMIN_NAME?.trim() || "Admin User",
    email,
    password,
  };
}

async function resolveConfiguredAdmin(email: string, password: string) {
  const configuredAdmin = getConfiguredAdmin();

  if (!configuredAdmin || configuredAdmin.email.toLowerCase() !== email.toLowerCase() || configuredAdmin.password !== password) {
    return null;
  }

  const passwordHash = await hash(configuredAdmin.password, 10);
  const adminUser = await db.user.upsert({
    where: { email: configuredAdmin.email },
    update: {
      name: configuredAdmin.name,
      passwordHash,
      role: "ADMIN",
    },
    create: {
      name: configuredAdmin.name,
      email: configuredAdmin.email,
      passwordHash,
      role: "ADMIN",
    },
  });

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const configuredAdmin = await resolveConfiguredAdmin(parsed.data.email, parsed.data.password);
        if (configuredAdmin) {
          return configuredAdmin;
        }

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await compare(parsed.data.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as DefaultSession["user"] & { role?: string }).role ?? "USER";
        token.sub = user.id;
      }

      if (!token.sub) {
        return token;
      }

      const dbUser = await db.user.findUnique({
        where: { id: token.sub },
        select: { role: true, name: true, email: true },
      });

      if (dbUser) {
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.email = dbUser.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "USER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}
