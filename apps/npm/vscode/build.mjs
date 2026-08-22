// Bundle the VS Code extension client and stage the language-server bundle.
//
// The extension is CommonJS (VS Code loads `main` via require). The language
// server is shipped as a separate ESM `server.mjs` (+ vendored wasm) that the
// client spawns over stdio, so we just copy the language-server's built `dist`
// next to the extension bundle.
//
// `RSVELTE_VSIX_TRIPLE` selects which staged native server this build embeds —
// one per platform-specific VSIX. Unset builds the universal fallback, which
// carries no native binary at all and starts `dist/server.mjs` instead.

import { build } from "esbuild";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const distDir = join(root, "dist");
const serverDist = join(root, "..", "language-server", "dist");
const nativeDir = join(root, "native");

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

const triple = process.env.RSVELTE_VSIX_TRIPLE?.trim();
if (triple) {
  const source = join(nativeDir, triple);
  if (!existsSync(source)) {
    throw new Error(
      `RSVELTE_VSIX_TRIPLE=${triple} but ${source} is missing — run \`pnpm run stage-vscode-language-server\` first.`,
    );
  }
  cpSync(source, join(distDir, "bin", triple), { recursive: true });
}

console.log(
  `[build] extension bundled to dist/extension.js (native server: ${triple ?? "none — universal"})`,
);
