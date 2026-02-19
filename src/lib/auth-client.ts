import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";
import type { Auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>()],
});
