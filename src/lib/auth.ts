import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { BETTER_AUTH_BASE_URL } from "$env/static/private";

import prisma from "./prisma";
import { username } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: BETTER_AUTH_BASE_URL,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    fields: {
      name: "username",
    },
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  plugins: [sveltekitCookies(getRequestEvent), username()],
});
