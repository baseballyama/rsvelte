#!/usr/bin/env node
// Publish the `rsvelte-vscode` extension to the VS Code Marketplace (and, best
// effort, Open VSX). The extension version follows `@rsvelte/language-server`
// (kept in lockstep by the changesets `fixed` group). Idempotent: it skips when
// the target version is already on the Marketplace, so it is safe to run on
// every push to main.
//
// Usage:
//   node scripts/release/publish-vscode.mjs --check   # decide only (writes GITHUB_OUTPUT)
//   node scripts/release/publish-vscode.mjs           # package + publish
//
// Env:
//   VSCE_PAT              required to publish (Azure DevOps PAT, Marketplace > Manage)
//   OVSX_PAT             optional → also publish to Open VSX
//   VSCODE_PUBLISH_FORCE  "true" bypasses the already-published guard

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

/** Latest version on the Marketplace, or null if not published / query failed. */
function marketplaceVersion() {
  try {
    const out = execFileSync(
      'npx',
      ['--yes', '@vscode/vsce@^3', 'show', id, '--json'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    const j = JSON.parse(out);
    return j?.versions?.[0]?.version ?? null;
  } catch {
    return null;
  }
}

const published = marketplaceVersion();
const shouldPublish =
  force || published === null || cmp(target, published) > 0;

console.log(`extension:           ${id}`);
console.log(`target version:      ${target} (follows @rsvelte/language-server)`);
console.log(`marketplace version: ${published ?? '(none)'}`);
console.log(`should publish:      ${shouldPublish}${force ? ' (forced)' : ''}`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `version=${target}\npublished=${published ?? ''}\nshould_publish=${shouldPublish}\n`,
  );
}

if (checkOnly) process.exit(0);

if (!shouldPublish) {
  console.log('Marketplace is already up to date — nothing to publish.');
  process.exit(0);
}

if (!process.env.VSCE_PAT) {
  console.error('VSCE_PAT is not set — cannot publish.');
  process.exit(1);
}

// Pin the extension version to the language-server version for this publish.
if (extPkg.version !== target) {
  extPkg.version = target;
  writeFileSync(extPkgPath, `${JSON.stringify(extPkg, null, 2)}\n`);
  console.log(`set extension version → ${target}`);
}

const vsix = resolve(extDir, `${extPkg.name}-${target}.vsix`);

// `vsce package` runs `vscode:prepublish` (build.mjs), which needs the
// language-server bundle to already exist (built by the workflow).
execFileSync(
  'npx',
  ['--yes', '@vscode/vsce@^3', 'package', '--no-dependencies', '-o', vsix],
  { cwd: extDir, stdio: 'inherit' },
);

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

if (process.env.OVSX_PAT) {
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
} else {
  console.log('OVSX_PAT not set — skipping Open VSX.');
}
