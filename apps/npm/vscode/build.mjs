// Bundle the VS Code extension client and stage the language-server bundle.
//
// The extension is CommonJS (VS Code loads `main` via require). The language
// server is shipped as a separate ESM `server.mjs` (+ vendored wasm) that the
// client spawns over stdio, so we just copy the language-server's built `dist`
// next to the extension bundle.

import { build } from "esbuild";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const distDir = join(root, "dist");
const serverDist = join(root, "..", "language-server", "dist");

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "extension.ts")],
  outfile: join(distDir, "extension.js"),
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  // The `vscode` module is provided by the host at runtime, never bundled.
  external: ["vscode"],
  sourcemap: false,
});

if (!existsSync(join(serverDist, "server.mjs"))) {
  throw new Error(
    "language-server bundle missing — run `pnpm run build:language-server` at the repo root before building the extension.",
  );
}
// Copy the runtime bits (server.mjs + vendor/) next to the extension bundle —
// not the test-only `lib/`.
cpSync(join(serverDist, "server.mjs"), join(distDir, "server.mjs"));
cpSync(join(serverDist, "vendor"), join(distDir, "vendor"), {
  recursive: true,
});

console.log("[build] extension bundled to dist/extension.js (+ server.mjs)");
