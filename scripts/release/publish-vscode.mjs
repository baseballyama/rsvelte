#!/usr/bin/env node
// Publish the `rsvelte` extension to the VS Code Marketplace and Open VSX.
// The extension version follows `@rsvelte/language-server` (kept in lockstep by
// the changesets `fixed` group).
//
// The extension ships as one VSIX per platform (each carrying only its own
// native language server) plus a binary-free universal VSIX that both registries
// serve to every other platform, where the extension falls back to the bundled
// JS server. A single universal VSIX carrying all five unsigned native servers
// fails the Marketplace's virus check.
//
// Each registry is checked INDEPENDENTLY and published to only when it is behind
// the target version, so the script is idempotent and safe to run on every push
// to main. The Marketplace check is per (version, targetPlatform): one platform
// failing validation must not read as "published" for the rest, and must stay
// retryable on the next run.
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
import { decide } from './vscode-publish-decision.mjs';
import { VSCODE_TARGETS } from './vscode-targets.mjs';

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

// Exact versions: these CLIs are resolved fresh by `npx` on every run, so a
// floating range makes the publish decision depend on the day it ran.
const VSCE = '@vscode/vsce@3.9.2';
const OVSX = 'ovsx@0.10.12';

// The universal package carries no `--target`, so it needs a name of its own.
const UNIVERSAL = 'universal';
/** Every (version, targetPlatform) pair a complete publish produces. */
const PLATFORMS = [UNIVERSAL, ...VSCODE_TARGETS.map(({ target: t }) => t)];

/**
 * Marketplace state: the newest LIVE version, and which platforms of `target`
 * are live. `vsce show` reports only the newest version, so it cannot answer
 * the per-platform question; the gallery API can, and `ExcludeNonValidated`
 * makes "live" mean "passed validation" rather than "was uploaded".
 */
async function marketplaceState() {
  try {
    const r = await fetch(
      'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json;api-version=7.2-preview.1',
          'Content-Type': 'application/json',
        },
        // IncludeVersions (1) | ExcludeNonValidated (32)
        body: JSON.stringify({
          filters: [{ criteria: [{ filterType: 7, value: id }] }],
          flags: 33,
        }),
      },
    );
    if (!r.ok) return null;
    const extension = (await r.json())?.results?.[0]?.extensions?.[0];
    if (!extension) return { latest: null, live: new Set() };
    const versions = extension.versions ?? [];
    const live = new Set(
      versions
        .filter((v) => v.version === target)
        .map((v) => v.targetPlatform ?? UNIVERSAL),
    );
    return { latest: versions[0]?.version ?? null, live };
  } catch {
    return null;
  }
}

/**
 * Open VSX state, mirroring `marketplaceState`'s three answers: `null` when the
 * query itself failed, `{ latest: null }` when the extension is definitively not
 * published, `{ latest }` otherwise. A failed query must not read as "absent" —
 * that direction publishes.
 */
async function openvsxState() {
  try {
    const r = await fetch(
      `https://open-vsx.org/api/${extPkg.publisher}/${extPkg.name}`,
    );
    if (r.status === 404) return { latest: null };
    if (!r.ok) return null;
    return { latest: (await r.json())?.version ?? null };
  } catch {
    return null;
  }
}

const mp = await marketplaceState();
const ovsx = await openvsxState();
const ovsxPublished = ovsx?.latest ?? null;

const { missingMp, needMp, needOvsx, mpReason } = decide({
  target,
  mp,
  ovsx,
  hasOvsx,
  force,
  platforms: PLATFORMS,
});
const shouldPublish = needMp || needOvsx;

const MP_STATE = {
  'query-failed': '(query failed)',
  'name-reserved': '(none, but the name is reserved)',
  superseded: '(newer release is live)',
};

console.log(`extension:            ${id}`);
console.log(`target version:       ${target} (follows @rsvelte/language-server)`);
console.log(
  `marketplace version:  ${MP_STATE[mpReason] ?? mp?.latest ?? '(none)'}` +
    `  → publish: ${needMp}`,
);
console.log(
  `  live platforms:     ${[...(mp?.live ?? [])].sort().join(', ') || '(none)'}`,
);
console.log(`  missing:            ${missingMp.join(', ') || '(none)'}`);
console.log(
  `open vsx version:     ${ovsx === null ? '(query failed)' : (ovsxPublished ?? '(none)')}` +
    `  → publish: ${needOvsx}` +
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

/**
 * Package one platform. `vsce package` runs `vscode:prepublish` (build.mjs),
 * which needs the language-server bundle to already exist (built by the
 * workflow) and reads `RSVELTE_VSIX_TRIPLE` to pick the native server to embed.
 */
function pack(platform) {
  const suffix = platform === UNIVERSAL ? '' : `-${platform}`;
  const vsix = resolve(extDir, `${extPkg.name}-${target}${suffix}.vsix`);
  const triple =
    VSCODE_TARGETS.find(({ target: t }) => t === platform)?.triple ?? '';
  execFileSync(
    'npx',
    [
      '--yes',
      VSCE,
      'package',
      '--no-dependencies',
      ...(platform === UNIVERSAL ? [] : ['--target', platform]),
      '-o',
      vsix,
    ],
    {
      cwd: extDir,
      stdio: 'inherit',
      env: { ...process.env, RSVELTE_VSIX_TRIPLE: triple },
    },
  );
  return vsix;
}

// Open VSX takes the whole set; the Marketplace only what is missing there.
const mpPlatforms = force ? PLATFORMS : missingMp;
const wanted = needOvsx ? PLATFORMS : mpPlatforms;
const packaged = new Map(wanted.map((platform) => [platform, pack(platform)]));

// The two registries are independent: serialising them behind one throw left
// Open VSX unpublished whenever the Marketplace name was reserved.
let marketplaceError = null;

if (needMp) {
  for (const platform of mpPlatforms) {
    try {
      execFileSync(
        'npx',
        [
          '--yes',
          VSCE,
          'publish',
          '--no-dependencies',
          '--packagePath',
          packaged.get(platform),
          '-p',
          process.env.VSCE_PAT,
        ],
        { cwd: extDir, stdio: 'inherit' },
      );
    } catch (error) {
      // The gallery query above found NO live version, yet the Marketplace
      // rejects the name as taken: the two only agree if the extension is
      // unlisted (removed / unpublished) while its name stays reserved. No
      // amount of retrying moves that, so say what has to happen instead.
      if (mp && mp.latest === null) {
        console.error(
          `\nThe Marketplace gallery reports NO live version of ${id}, but the\n` +
            'publish was rejected. That pair means the extension is unlisted while its\n' +
            'name is still reserved — a publisher-account state, not a build problem.\n' +
            `Check https://marketplace.visualstudio.com/manage/publishers/${extPkg.publisher}\n` +
            'and either restore the extension or rename it in apps/npm/vscode/package.json.',
        );
      }
      marketplaceError = error;
      break;
    }
    console.log(`✓ published ${platform} to VS Code Marketplace`);
  }
} else if (mpReason === 'query-failed') {
  console.log('Marketplace state unknown (query failed) — skipping.');
} else if (mpReason === 'name-reserved') {
  console.log(
    `::warning::${id} is unlisted on the Marketplace while its name stays ` +
      'reserved, so no publish can succeed. Restore it at ' +
      `https://marketplace.visualstudio.com/manage/publishers/${extPkg.publisher} ` +
      'or rename it in apps/npm/vscode/package.json.',
  );
} else {
  console.log('Marketplace already up to date — skipping.');
}

if (needOvsx) {
  // Ensure the namespace exists (idempotent — ignore "already exists").
  try {
    execFileSync(
      'npx',
      ['--yes', OVSX, 'create-namespace', extPkg.publisher, '-p', process.env.OVSX_PAT],
      { cwd: extDir, stdio: 'inherit' },
    );
  } catch {
    /* namespace already exists, or not permitted — publish will report fatal errors */
  }
  for (const platform of PLATFORMS) {
    execFileSync(
      'npx',
      ['--yes', OVSX, 'publish', packaged.get(platform), '-p', process.env.OVSX_PAT],
      { cwd: extDir, stdio: 'inherit' },
    );
    console.log(`✓ published ${platform} to Open VSX`);
  }
} else if (!hasOvsx) {
  console.log('OVSX_PAT not set — skipping Open VSX.');
} else {
  console.log('Open VSX already up to date — skipping.');
}

if (marketplaceError) throw marketplaceError;
