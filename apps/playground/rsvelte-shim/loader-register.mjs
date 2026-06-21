// Bootstrap script for `node --import`. Registers the rsvelte resolution hook
// so all subsequent `import 'svelte/compiler'` calls (including the ones inside
// vite-plugin-svelte) resolve to the local rsvelte NAPI shim.

import { register } from "node:module";

register("./loader.mjs", import.meta.url);
