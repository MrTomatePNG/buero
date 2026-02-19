import { auth } from "@/lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";

const logger: Handle = async ({ event, resolve }) => {
  const start = Date.now();
  const requestMethod = event.request.method;
  const requestUrl = event.url.pathname;

  const response = await resolve(event);

  const duration = Date.now() - start;
  console.log(
    `[${requestMethod}] ${requestUrl} (${response.status}) - ${duration}ms`,
  );

  return response;
};

const authHandle: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

export const handle = sequence(logger, authHandle);
