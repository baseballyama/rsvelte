#!/usr/bin/env node
/**
 * Pinned `oxvelte` competitor for the `lint` benchmark task.
 *
 * Unlike every other competitor the report measures, oxvelte publishes no npm
 * package — the only distribution is `cargo install --git`. It is therefore
 * pinned by commit here rather than by a version range in
 * `competitor-oracle/package.json`, and installed into a gitignored prefix so
 * the benchmark never picks up whatever `oxvelte` happens to be on `$PATH`.
 *
 * Run directly (`node scripts/bench/oxvelte-oracle.mjs`) to install it; that is
 * what `pnpm run report:competitors:install` does.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const OXVELTE_REPOSITORY = "https://github.com/tolgaouz/oxvelte";
export const OXVELTE_REV = "7196779a744cee009abfc551e4c527bc98e26945";
export const OXVELTE_VERSION = "0.2.0";
export const OXVELTE_ROOT = join(REPO_ROOT, "scripts/bench/oxvelte-oracle");
export const OXVELTE_BIN = join(OXVELTE_ROOT, "bin/oxvelte");

export function oxvelteInstalled() {
  return existsSync(OXVELTE_BIN);
}

export function installOxvelte({ force = false } = {}) {
  if (!force && oxvelteInstalled()) {
    console.error(`[oxvelte-oracle] already installed at ${OXVELTE_BIN}`);
    return;
  }
  console.error(`[oxvelte-oracle] installing oxvelte@${OXVELTE_REV.slice(0, 7)}…`);
  const result = spawnSync(
    "cargo",
    [
      "install",
      "--git",
      OXVELTE_REPOSITORY,
      "--rev",
      OXVELTE_REV,
      "--root",
      OXVELTE_ROOT,
      // oxvelte commits its own Cargo.lock; honouring it is what makes the
      // pin reproducible rather than "whatever oxc resolved today".
      "--locked",
      "--force",
      "oxvelte",
    ],
    { cwd: REPO_ROOT, stdio: ["ignore", 2, "inherit"] },
  );
  if (result.status !== 0) {
    throw new Error(`cargo install oxvelte exited ${result.status}`);
  }
}

/**
 * Every rule the pinned oxvelte binary implements, as `svelte/<name>`.
 *
 * The benchmark needs this to answer "which rules can both sides run?", and
 * `oxvelte rules` is the only place that answers it — the binary has no
 * machine-readable rule listing, so the human table is parsed by its first
 * column.
 */
export function oxvelteRules(bin = OXVELTE_BIN) {
  const result = spawnSync(bin, ["rules"], { encoding: "utf8", maxBuffer: 1 << 22 });
  if (result.status !== 0) {
    throw new Error(`oxvelte rules exited ${result.status}`);
  }
  const rules = result.stdout
    .split("\n")
    .map((line) => line.match(/^(svelte\/[a-z0-9-]+)/))
    .filter(Boolean)
    .map((match) => match[1]);
  if (rules.length === 0) throw new Error("oxvelte rules listed nothing");
  return new Set(rules);
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  installOxvelte({ force: process.argv.includes("--force") });
}
