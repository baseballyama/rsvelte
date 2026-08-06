/**
 * Corpus-artifact lifecycle, shared by compile.mjs / verify.mjs /
 * svelte2tsx-verify.mjs / clean.mjs.
 *
 * A full corpus run writes ~0.6 GiB of regenerable trees per checkout
 * (measured: sources 60 MiB, expected 254 MiB, actual 254 MiB for 14025 entries
 * × 3 targets), and N parallel agent worktrees each hold their own set. Nothing
 * used to delete them, so the rule here is: whoever produced a tree deletes it
 * once the last consumer is done with it.
 *
 * Retention rules (see `keepArtifacts`):
 *   - a FAILING run keeps its trees — that is when someone diffs
 *     expected/<id> against actual/<id> to attribute a cluster
 *   - CI always keeps them: the `Cluster failures` step reads both trees, and it
 *     runs on any earlier step's failure, not just verify's
 *   - `--keep-artifacts` / CORPUS_KEEP_ARTIFACTS=1 keep them unconditionally
 *   - `--clean-artifacts` deletes even after a failing run
 *
 * The ratchets (`compatibility/*known-failures*.json` and the paired `.md`) are
 * NOT regenerable from the corpus and are never touched here.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');
export const CORPUS = path.join(ROOT, 'compatibility');

const MiB = 1024 * 1024;

/** Output trees written by compile.mjs and consumed by verify.mjs / cluster.mjs. */
export const OUTPUT_TREES = ['expected', 'actual'];
/** Output trees written by svelte2tsx-compile.mjs, consumed by svelte2tsx-verify.mjs. */
export const S2T_TREES = ['expected-s2t', 'actual-s2t'];

/** Everything `corpus:clean` reclaims; every entry is regenerable by re-running a script. */
export const RECLAIMABLE = [
	'sources',
	...OUTPUT_TREES,
	...S2T_TREES,
	'manifest.json',
	'report.json',
	'report-s2t.json',
	'cluster.txt',
	'.oxfmt-ignore-nothing',
];

/** `--all` additionally drops the fmt and lint stages (slower to rebuild). */
export const RECLAIMABLE_ALL = [
	...RECLAIMABLE,
	'fmt',
	'fmt-report.json',
	'lint-sources',
	'lint-manifest.json',
	'.lint-rules.json',
	'.lint-rsvelte-lint.json',
	'check-report.json',
	'check-report.tsgo.json',
	'check-e2e-report.json',
];

/**
 * Measured on a full 3-target run: expected + actual = 508 MiB, i.e. ~170 MiB
 * per target across both trees. Rounded up, plus headroom for the in-place
 * oxfmt normalization pass verify.mjs runs over the same trees.
 */
export const BYTES_PER_TARGET = 180 * MiB;
export const DISK_HEADROOM = 512 * MiB;

/**
 * Floor for rewriting a ratchet from a run's results. `--update-baseline`
 * DELETES every baseline id it did not observe failing, so a run over a partial
 * corpus silently shrinks the ratchets to whatever it happened to measure. The
 * corpus is 14025 entries with every submodule present; anything far below that
 * is a partial checkout, not a fix.
 */
export const MIN_FULL_CORPUS_ENTRIES = 12000;

export function keepArtifacts(argv, { failed }) {
	if (argv.includes('--clean-artifacts')) return false;
	if (argv.includes('--keep-artifacts')) return true;
	if (process.env.CORPUS_KEEP_ARTIFACTS) return true;
	if (process.env.CI) return true;
	return failed;
}

/** Delete `names` (relative to compatibility/) unless retention applies. */
export function cleanupArtifacts(names, argv, { failed, label }) {
	if (keepArtifacts(argv, { failed })) {
		if (failed) {
			console.log(
				`\n[${label}] artifacts kept for inspection — reclaim with: pnpm run corpus:clean`
			);
		}
		return;
	}
	for (const name of names) fs.rmSync(path.join(CORPUS, name), { recursive: true, force: true });
	console.log(`\n[${label}] removed ${names.join(', ')} (keep them with --keep-artifacts)`);
}

export function freeBytes(dir) {
	try {
		const { bavail, bsize } = fs.statfsSync(dir);
		return Number(bavail) * Number(bsize);
	} catch {
		return null;
	}
}

const gib = (n) => `${(n / 1024 / 1024 / 1024).toFixed(2)} GiB`;

/**
 * Abort before a long run rather than hitting ENOSPC halfway through and leaving
 * a half-written tree that later scores as `match`.
 */
export function requireDiskSpace(required, label) {
	const free = freeBytes(CORPUS);
	if (free === null) return;
	if (free >= required) {
		console.log(`[${label}] disk: ${gib(free)} free, ~${gib(required)} needed`);
		return;
	}
	console.error(
		`[${label}] not enough free disk: ${gib(free)} free, ~${gib(required)} needed for this run`
	);
	console.error('  reclaim every regenerable corpus tree (all worktrees): pnpm run corpus:clean');
	process.exit(3);
}
