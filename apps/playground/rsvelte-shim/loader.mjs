// Node ESM resolution hook that redirects every `svelte/compiler` import to the
// local rsvelte NAPI shim. Vite's `resolve.alias` only affects modules that
// Vite resolves for the build graph — it does NOT intercept plain `import`
// statements that `vite-plugin-svelte` (a Node-side plugin) executes against
// `svelte/compiler` itself. A Node module hook does.

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const shimUrl = pathToFileURL(join(here, "compiler.mjs")).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "svelte/compiler") {
    return { url: shimUrl, format: "module", shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
