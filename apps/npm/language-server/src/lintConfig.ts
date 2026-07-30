/**
 * Discovery of the `rsvelte-lint.json` governing a document.
 *
 * The linter runs as wasm and has no filesystem of its own, so the config file
 * the `rsvelte-lint` CLI would discover is located and read here, then handed
 * to `lint_with_config`. An ESLint config is deliberately *not* consulted:
 * importing it is opt-in on the CLI (`--config-from-eslint`), and a server that
 * read it on its own would report a different rule set in the editor than the
 * same project's CI does.
 */

import { basename, dirname, join } from "node:path";
import { readFileSync } from "node:fs";

/** Config file names, in the order a directory is probed. */
const CONFIG_NAMES = ["rsvelte-lint.json", ".rsvelte-lintrc.json"];

export interface ResolvedLintConfig {
  /**
   * Config document, or `""` when no config file governs the directory — and
   * when one does but is unusable, which leaves the linter on the recommended
   * preset rather than without diagnostics.
   */
  text: string;
  /** Path of the config file that was read, or `null` when there is none. */
  path: string | null;
}

const NO_CONFIG: ResolvedLintConfig = { text: "", path: null };

/**
 * Discovery walks to the filesystem root, so it is cached per starting
 * directory rather than redone on every keystroke.
 */
const cache = new Map<string, ResolvedLintConfig>();

/** Whether saving this path invalidates resolved configs. */
export function isLintConfigPath(path: string): boolean {
  return CONFIG_NAMES.includes(basename(path));
}

export function clearLintConfigCache(): void {
  cache.clear();
}

/**
 * The config governing documents in `dir`, discovered upward from it.
 * `onError` reports an unusable config, and fires only when the config is
 * actually resolved — not on every cache hit behind it.
 */
export function resolveLintConfig(
  dir: string,
  onError?: (message: string) => void,
): ResolvedLintConfig {
  const cached = cache.get(dir);
  if (cached) return cached;

  const found = discover(dir);
  cache.set(dir, found.config);
  if (found.error) onError?.(`${found.config.path}: ${found.error}`);
  return found.config;
}

interface Discovery {
  config: ResolvedLintConfig;
  error: string | null;
}

function discover(start: string): Discovery {
  let dir = start;
  for (;;) {
    for (const name of CONFIG_NAMES) {
      const found = read(join(dir, name));
      if (found) return found;
    }
    const parent = dirname(dir);
    if (parent === dir) return { config: NO_CONFIG, error: null };
    dir = parent;
  }
}

/**
 * `null` when the file does not exist. An unusable config is reported rather
 * than skipped, so the search stops at the file the CLI would also have used.
 */
function read(path: string): Discovery | null {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTDIR") return null;
    return { config: { text: "", path }, error: String(err) };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { config: { text: "", path }, error: String(err) };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {
      config: { text: "", path },
      error: "lint config must be a JSON object",
    };
  }
  return { config: { text, path }, error: null };
}
