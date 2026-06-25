// Bundle the language server with esbuild and stage the vendored lint wasm.
//
// The wasm glue (`vendor/rsvelte_lint.js`) is loaded at runtime via a
// computed path (see src/lint.ts), so esbuild leaves that require external —
// we just copy `vendor/` next to the bundle so `dist/vendor/*` resolves.

import { build } from "esbuild";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const distDir = join(root, "dist");
const vendorSrc = join(root, "vendor");
const vendorDest = join(distDir, "vendor");

// esbuild bundles CJS deps (vscode-languageserver) into ESM output via a
// `__require` shim that can't resolve node builtins on its own. Providing a
// real `require` (via createRequire) at the top of the bundle lets the shim
// fall through to it — the standard fix for "Dynamic require of X" in ESM bundles.
const REQUIRE_SHIM =
  "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);";

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

await build({
  entryPoints: [join(root, "src", "server.ts")],
  // `.mjs` so Node always loads it as ESM — including when the bundle is
  // embedded inside the (CommonJS) VS Code extension package and spawned as a
  // standalone `node server.mjs` process.
  outfile: join(distDir, "server.mjs"),
  bundle: true,
  platform: "node",
  // ESM so `import.meta.url` resolves to the bundle path at runtime (used to
  // locate the vendored wasm). package.json has "type": "module".
  format: "esm",
  target: "node18",
  sourcemap: false,
  // Vendored wasm is required at runtime via a computed path, not bundled.
  external: [],
  banner: {
    js: `#!/usr/bin/env node\n${REQUIRE_SHIM}`,
  },
});

// Also emit the pure helper modules as standalone ESM libs so node:test can
// import them directly (not part of the published `files`).
await build({
  entryPoints: [
    join(root, "src", "diagnostics.ts"),
    join(root, "src", "format.ts"),
  ],
  outdir: join(distDir, "lib"),
  outExtension: { ".js": ".mjs" },
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  banner: { js: REQUIRE_SHIM },
});

if (!existsSync(join(vendorSrc, "rsvelte_lint.js"))) {
  console.warn(
    "[build] vendor/rsvelte_lint.js missing — run `pnpm run build:wasm:lint-node` at the repo root first. Linting will be disabled at runtime.",
  );
} else {
  mkdirSync(vendorDest, { recursive: true });
  // The wasm-pack `nodejs` glue is CommonJS (`exports.x = …`). This package is
  // `"type": "module"`, so it must carry a `.cjs` extension to load via require.
  cpSync(
    join(vendorSrc, "rsvelte_lint.js"),
    join(vendorDest, "rsvelte_lint.cjs"),
  );
  cpSync(
    join(vendorSrc, "rsvelte_lint_bg.wasm"),
    join(vendorDest, "rsvelte_lint_bg.wasm"),
  );
  console.log("[build] staged vendor/ lint wasm into dist/vendor/");
}

console.log("[build] language server bundled to dist/server.mjs");
