import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	appType: "custom",
	plugins: [sveltekit()],
	build: {
		sourcemap: false,
		reportCompressedSize: false,
	}
});
