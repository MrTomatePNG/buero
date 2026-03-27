import { auth } from "@/lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { sequence } from "@sveltejs/kit/hooks";
import { baseLogger } from "$lib/server/logger";
import { error, redirect, type Handle } from "@sveltejs/kit";

// Inicializa os workers apenas se não estiver no processo de build
if (!building) {
  import("@/lib/server/workers").then(() => {
    baseLogger.info("Workers de mídia inicializados no hooks.server.ts");
  });
}

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

const authorizationHandle: Handle = async ({ event, resolve }) => {
  const isAudit = event.url.pathname.startsWith("/audit");

  if (isAudit) {
    if (!event.locals.user) {
      redirect(302, "/login");
    }
    if (event.locals.user.role !== "admin") {
      event.locals.logger.warn(
        { userId: event.locals.user.id },
        "Tentativa de acesso proibido a /audit",
      );
      error(403, "Acesso negado.");
    }
  }

  return resolve(event);
};

export const handle = sequence(
  logger,
  authHandle,
  sessionHandle,
  authorizationHandle,
);
