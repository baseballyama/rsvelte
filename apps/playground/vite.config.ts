import { sveltekit } from "@sveltejs/kit/vite";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// Route `svelte/compiler` to the local rsvelte NAPI shim so vite-plugin-svelte
// compiles every .svelte / .svelte.{js,ts} in this site via rsvelte instead of
// the upstream JS compiler. The shim re-exports the four APIs vite-plugin-svelte
// actually uses (compile, compileModule, preprocess, VERSION).
const rsvelteCompilerShim = fileURLToPath(new URL("./rsvelte-shim/compiler.mjs", import.meta.url));

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: [{ find: /^svelte\/compiler$/, replacement: rsvelteCompilerShim }],
  },
  server: {
    port: 5234,
    fs: {
      // `pkg/` (the wasm build) lives at the repo root, two levels above
      // this app, so the dev server needs to serve from there.
      allow: ["../.."],
    },
  },
  optimizeDeps: {
    exclude: ["rsvelte_core"],
  },
});
