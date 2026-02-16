import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia } from "lucia";
import prisma from "$lib/prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "cauldrun",
    attributes: {
      secure: process.env.NODE_ENV === "prodution",
      path: "/",
      sameSite: "lax",
    },
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttribute: {
      username: string;
      email: string;
      avatar_url: string | null;
    };
  }
}
