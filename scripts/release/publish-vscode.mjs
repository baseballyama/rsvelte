#!/usr/bin/env node
// Publish the `rsvelte-vscode` extension to the VS Code Marketplace and Open VSX.
// The extension version follows `@rsvelte/language-server` (kept in lockstep by
// the changesets `fixed` group).
//
// Each registry is checked INDEPENDENTLY and published to only when it is behind
// the target version, so the script is idempotent and safe to run on every push
// to main. This also means Open VSX can be back-filled later (after OVSX_PAT is
// added) even though the Marketplace is already up to date.
//
// Usage:
//   node scripts/release/publish-vscode.mjs --check   # decide only (writes GITHUB_OUTPUT)
//   node scripts/release/publish-vscode.mjs           # package + publish where behind
//
// Env:
//   VSCE_PAT              required to publish to the Marketplace
//   OVSX_PAT              optional → also publish to Open VSX (skipped if unset)
//   VSCODE_PUBLISH_FORCE  "true" bypasses the per-registry up-to-date guard

import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const extDir = resolve(repoRoot, 'apps/npm/vscode');
const extPkgPath = resolve(extDir, 'package.json');
const lsPkgPath = resolve(repoRoot, 'apps/npm/language-server/package.json');

const checkOnly = process.argv.includes('--check');
const force = process.env.VSCODE_PUBLISH_FORCE === 'true';
const hasOvsx = Boolean(process.env.OVSX_PAT);

const extPkg = JSON.parse(readFileSync(extPkgPath, 'utf8'));
const target = JSON.parse(readFileSync(lsPkgPath, 'utf8')).version;
const id = `${extPkg.publisher}.${extPkg.name}`;

/** Numeric semver compare for simple `x.y.z` versions (no pre-release). */
function cmp(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

/** Latest version on the VS Code Marketplace, or null. */
function marketplaceVersion() {
  try {
    const out = execFileSync(
      'npx',
      ['--yes', '@vscode/vsce@^3', 'show', id, '--json'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    return JSON.parse(out)?.versions?.[0]?.version ?? null;
  } catch {
    return null;
  }
}

/** Latest version on Open VSX, or null (queried via the public API). */
async function openvsxVersion() {
  try {
    const r = await fetch(
      `https://open-vsx.org/api/${extPkg.publisher}/${extPkg.name}`,
    );
    if (!r.ok) return null;
    return (await r.json())?.version ?? null;
  } catch {
    return null;
  }
}

const mpPublished = marketplaceVersion();
const ovsxPublished = await openvsxVersion();

const needMp = force || mpPublished === null || cmp(target, mpPublished) > 0;
// Only consider Open VSX when a token is available to publish there.
const needOvsx =
  hasOvsx && (force || ovsxPublished === null || cmp(target, ovsxPublished) > 0);
const shouldPublish = needMp || needOvsx;

console.log(`extension:            ${id}`);
console.log(`target version:       ${target} (follows @rsvelte/language-server)`);
console.log(`marketplace version:  ${mpPublished ?? '(none)'}  → publish: ${needMp}`);
console.log(
  `open vsx version:     ${ovsxPublished ?? '(none)'}  → publish: ${needOvsx}` +
    (hasOvsx ? '' : ' (OVSX_PAT unset)'),
);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `version=${target}\nneed_marketplace=${needMp}\nneed_openvsx=${needOvsx}\nshould_publish=${shouldPublish}\n`,
  );
}

if (checkOnly) process.exit(0);

if (!shouldPublish) {
  console.log('Both registries are up to date — nothing to publish.');
  process.exit(0);
}

if (needMp && !process.env.VSCE_PAT) {
  console.error('VSCE_PAT is not set — cannot publish to the Marketplace.');
  process.exit(1);
}

// Pin the extension version to the language-server version for this publish.
if (extPkg.version !== target) {
  extPkg.version = target;
  writeFileSync(extPkgPath, `${JSON.stringify(extPkg, null, 2)}\n`);
  console.log(`set extension version → ${target}`);
}

const vsix = resolve(extDir, `${extPkg.name}-${target}.vsix`);

// Package once (shared by both registries). `vsce package` runs
// `vscode:prepublish` (build.mjs), which needs the language-server bundle to
// already exist (built by the workflow).
execFileSync(
  'npx',
  ['--yes', '@vscode/vsce@^3', 'package', '--no-dependencies', '-o', vsix],
  { cwd: extDir, stdio: 'inherit' },
);

if (needMp) {
  execFileSync(
    'npx',
    [
      '--yes',
      '@vscode/vsce@^3',
      'publish',
      '--no-dependencies',
      '--packagePath',
      vsix,
      '-p',
      process.env.VSCE_PAT,
    ],
    { cwd: extDir, stdio: 'inherit' },
  );
  console.log('✓ published to VS Code Marketplace');
} else {
  console.log('Marketplace already up to date — skipping.');
}

if (needOvsx) {
  // Ensure the namespace exists (idempotent — ignore "already exists").
  try {
    execFileSync(
      'npx',
      ['--yes', 'ovsx@^0', 'create-namespace', extPkg.publisher, '-p', process.env.OVSX_PAT],
      { cwd: extDir, stdio: 'inherit' },
    );
  } catch {
    /* namespace already exists, or not permitted — publish will report fatal errors */
  }
  try {
    execFileSync(
      'npx',
      ['--yes', 'ovsx@^0', 'publish', vsix, '-p', process.env.OVSX_PAT],
      { cwd: extDir, stdio: 'inherit' },
    );
    console.log('✓ published to Open VSX');
  } catch (e) {
    console.warn(`Open VSX publish failed (continuing): ${e?.message ?? e}`);
  }
} else if (!hasOvsx) {
  console.log('OVSX_PAT not set — skipping Open VSX.');
} else {
  console.log('Open VSX already up to date — skipping.');
}
