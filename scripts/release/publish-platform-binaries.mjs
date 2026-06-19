#!/usr/bin/env node
// Publish the platform packages that ship an executable POSIX binary
// (`@rsvelte/svelte-check-*` and `@rsvelte/fmt-*`) via `npm publish` rather
// than `pnpm publish`.
//
// Why: `pnpm pack` (which `pnpm publish` uses) normalises file modes to 0644,
// dropping the execute bit even when the source file has +x set. The
// resulting tarball ships a non-executable binary and `pnpm dlx
// @rsvelte/<pkg>` fails with EACCES. `npm pack` preserves modes, so
// publishing these tarballs with npm yields a working install.
//
// This runs *before* `changeset publish`; changesets sees the already-
// published versions and skips them, while every other workspace package
// continues to publish through changesets/pnpm.
//
// The Windows platform packages ship a `.exe` and are excluded — Windows
// ignores POSIX mode bits, so pnpm's normalisation is harmless there.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");

const platformDirs = [
  "apps/npm/svelte-check-darwin-arm64",
  "apps/npm/svelte-check-darwin-x64",
  "apps/npm/svelte-check-linux-x64-gnu",
  "apps/npm/svelte-check-linux-arm64-gnu",
  "apps/npm/fmt-darwin-arm64",
  "apps/npm/fmt-darwin-x64",
  "apps/npm/fmt-linux-x64-gnu",
  "apps/npm/fmt-linux-arm64-gnu",
];

const dryRun = process.argv.includes("--dry-run");

function readPackageJson(dir) {
  const pkgPath = resolve(dir, "package.json");
  return JSON.parse(readFileSync(pkgPath, "utf8"));
}

function isAlreadyPublished(name, version) {
  const result = spawnSync("npm", ["view", `${name}@${version}`, "version"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status === 0 && result.stdout.trim() === version) {
    return true;
  }
  // `npm view` exits non-zero ("404 Not Found") for missing versions. Treat
  // any other failure as not-yet-published; the subsequent `npm publish`
  // will surface real registry errors.
  return false;
}

// Block until the registry reflects a just-published version.
//
// Why: `changeset publish` runs immediately after this script and takes its
// own `npm info` snapshot of every workspace package up front. If the registry
// hasn't propagated a version we published here, changeset's snapshot shows it
// as *not* published and it attempts a duplicate publish. npm answers that with
// an E403 ("cannot publish over the previously published version"), and under
// OIDC trusted publishing that error JSON carries no `summary` field — which
// crashes changesets 2.31.0's `isAlreadyPublishedError(json.error.summary)`
// (`undefined.includes(...)`), failing the whole release even though every
// package actually published. Polling until the version is visible closes the
// read-after-write gap so changeset reliably sees "already published" and skips
// it (the benign "is not being published" warning) instead of racing.
function waitUntilVisible(name, version, { timeoutMs = 90_000, intervalMs = 3_000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (isAlreadyPublished(name, version)) {
      return true;
    }
    if (Date.now() >= deadline) {
      // Don't fail the release: the publish itself succeeded, this is only
      // the propagation barrier. Worst case changeset races as before.
      console.warn(
        `[publish-platform] ${name}@${version} not visible after ${timeoutMs}ms — continuing anyway`,
      );
      return false;
    }
    // Synchronous sleep so the barrier stays in this sequential script.
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, intervalMs);
  }
}

let failures = 0;
for (const relDir of platformDirs) {
  const absDir = resolve(repoRoot, relDir);
  if (!existsSync(absDir)) {
    console.warn(`[publish-platform] skipping missing dir: ${relDir}`);
    continue;
  }
  const { name, version } = readPackageJson(absDir);
  if (isAlreadyPublished(name, version)) {
    console.log(`[publish-platform] ${name}@${version} already published — skipping`);
    continue;
  }
  console.log(`[publish-platform] publishing ${name}@${version}${dryRun ? " (dry-run)" : ""}`);
  // --provenance is required when publishing via npm OIDC trusted
  // publishing from CI; it links each tarball back to the workflow run
  // that produced it. Locally (where OIDC isn't available) npm will fail
  // fast, which is the correct behaviour — these packages are CI-only.
  const args = ["publish", "--access", "public", "--provenance"];
  if (dryRun) args.push("--dry-run");
  const result = spawnSync("npm", args, {
    cwd: absDir,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error(`[publish-platform] FAILED: ${name}@${version} (exit ${result.status})`);
    failures += 1;
    continue;
  }
  // Wait for registry propagation before the next package / `changeset
  // publish` so the duplicate-publish race can't crash changesets. Skipped
  // for dry runs, which never touch the registry.
  if (!dryRun) {
    console.log(`[publish-platform] waiting for ${name}@${version} to be visible on the registry`);
    waitUntilVisible(name, version);
  }
}

if (failures > 0) {
  console.error(`[publish-platform] ${failures} platform package(s) failed to publish`);
  process.exit(1);
}
