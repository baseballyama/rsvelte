/**
 * Loader for the bundled rsvelte_lint wasm module.
 *
 * The wasm is built for the `nodejs` target (`wasm-pack ... --target nodejs`)
 * and vendored next to the bundled server at `dist/vendor/rsvelte_lint.js`
 * (which `readFileSync`s its sibling `rsvelte_lint_bg.wasm`). We load it lazily
 * via a runtime-computed path so esbuild leaves the `require` external instead
 * of trying to inline the wasm glue.
 */

import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface LintModule {
  lint(source: string, filename: string): string;
  lint_version(): string;
}

const nodeRequire = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));

let mod: LintModule | null = null;
let loadFailed = false;

/** Lazily load (and memoize) the wasm module. Returns `null` if unavailable. */
function load(): LintModule | null {
  if (mod) return mod;
  if (loadFailed) return null;
  try {
    // Non-literal path → esbuild keeps this require external; resolved at
    // runtime against the vendored wasm sitting beside the bundle.
    const vendorPath = join(here, "vendor", "rsvelte_lint.cjs");
    mod = nodeRequire(vendorPath) as LintModule;
    return mod;
  } catch {
    loadFailed = true;
    return null;
  }
}

/** Run the linter, returning its raw JSON string. `null` if wasm is missing. */
export function runLint(source: string, filename: string): string | null {
  const m = load();
  if (!m) return null;
  try {
    return m.lint(source, filename);
  } catch {
    return null;
  }
}

/** The rsvelte_lint crate version, or `null` if the wasm failed to load. */
export function lintVersion(): string | null {
  const m = load();
  if (!m) return null;
  try {
    return m.lint_version();
  } catch {
    return null;
  }
}
