import adapter from "svelte-adapter-bun";
import path from "path";
import { sveltePreprocess } from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter({
      precompress: true,
      out: "build",
    }),
    alias: {
      "@/*": path.resolve("src/*"),
    },
  },
  onwarn: (warning, defaultHandler) => {
    if (warning.code === "css_unused_selector") return;
    defaultHandler(warning);
  },
  preprocess: sveltePreprocess({
    scss: {},
  }),
};

export default config;
