import { auth } from "@/lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { sequence } from "@sveltejs/kit/hooks";
import { baseLogger } from "$lib/server/logger";
import type { Handle } from "@sveltejs/kit";

const logger: Handle = async ({ event, resolve }) => {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  event.locals.logger = baseLogger.child({
    requestId,
    method: event.request.method,
    url: event.url.pathname,
  });
  event.locals.requestId = requestId;

  const response = await resolve(event);

  const duration = Date.now() - start;
  event.locals.logger.info(
    { status: response.status, duration: `${duration}ms` },
    "Request completed",
  );

  return response;
};

const authHandle: Handle = ({ event, resolve }) =>
  svelteKitHandler({ event, resolve, auth, building });

const sessionHandle: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
    event.locals.logger = event.locals.logger.child({
      userId: session.user.id,
    });
  }

  return resolve(event);
};

export const handle = sequence(logger, authHandle, sessionHandle);
