/**
 * Document formatting by shelling out to the workspace's native `rsvelte-fmt`.
 *
 * The native CLI (`@rsvelte/fmt`) formats `.svelte` in-process and dispatches
 * embedded JS/TS/CSS (and `.json`/`.md`/…) to oxfmt, so it is the only path
 * that produces a *complete* format. We resolve the binary from the consumer's
 * `node_modules/.bin` (or an explicit override) and pipe the document through
 * `--stdin --stdin-filepath <path>`. If it can't be resolved or fails, we
 * return `null` and the server simply yields no edits — formatting is never an
 * error.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/** Windows uses a `.cmd` shim in `node_modules/.bin`; POSIX a shebang script. */
const BIN_NAMES =
  process.platform === "win32"
    ? ["rsvelte-fmt.cmd", "rsvelte-fmt.CMD", "rsvelte-fmt"]
    : ["rsvelte-fmt"];

/**
 * Resolve the `rsvelte-fmt` executable.
 *
 * Order: explicit `override` → walk up from `startDir` looking for
 * `node_modules/.bin/rsvelte-fmt`. Returns `null` when nothing is found.
 */
export function resolveRsvelteFmt(
  startDir: string,
  override?: string,
): string | null {
  if (override && override.trim().length > 0) {
    return existsSync(override) ? override : null;
  }
  let dir = startDir;
  // Walk to the filesystem root.
  for (;;) {
    for (const name of BIN_NAMES) {
      const candidate = join(dir, "node_modules", ".bin", name);
      if (existsSync(candidate)) return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Format `text` for `filePath` using `binPath`. Resolves to the formatted
 * string, or `null` on any failure (non-zero exit, spawn error, empty output).
 */
export function formatWithRsvelteFmt(
  binPath: string,
  text: string,
  filePath: string,
): Promise<string | null> {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(binPath, ["--stdin", "--stdin-filepath", filePath], {
        // `.cmd` shims on Windows need a shell to launch.
        shell: process.platform === "win32",
      });
    } catch {
      resolve(null);
      return;
    }

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => (stderr += chunk));

    child.on("error", () => resolve(null));
    child.on("close", (code) => {
      if (code !== 0) {
        resolve(null);
        return;
      }
      // A formatter that produced nothing is a failure, not "format to empty".
      resolve(stdout.length > 0 ? stdout : null);
    });

    child.stdin.on("error", () => resolve(null));
    child.stdin.end(text, "utf8");
  });
}
