#!/usr/bin/env node
/**
 * Reclaim every regenerable corpus artifact, in this checkout AND in every
 * sibling agent worktree under `.claude/worktrees/` — N parallel worktrees each
 * holding a full set is how the dev machine actually runs out of disk.
 *
 * The checked-in ratchets (`compatibility/*known-failures*.json` and the paired
 * `.md` files) are never regenerable from the corpus, so they are never touched:
 * this script only removes names on the explicit allowlist in artifacts.mjs.
 *
 * Usage: node scripts/compat-corpus/clean.mjs [--all] [--here] [--dry-run]
 *   --all      also drop the fmt / lint / check stages (slower to rebuild)
 *   --here     this checkout only — a sibling worktree may be mid-run
 *   --dry-run  report what would be freed without deleting
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, RECLAIMABLE, RECLAIMABLE_ALL } from './artifacts.mjs';

const args = process.argv.slice(2);
const ALL = args.includes('--all');
const DRY_RUN = args.includes('--dry-run');
const NAMES = ALL ? RECLAIMABLE_ALL : RECLAIMABLE;

// A typo that put a ratchet on the allowlist would delete an unrecoverable file.
for (const name of NAMES) {
	if (name.includes('known-failures') || name.endsWith('.md')) {
		console.error(`[corpus-clean] refusing to delete tracked ratchet "${name}"`);
		process.exit(2);
	}
}

/** This checkout, the main checkout, and every agent worktree beside it. */
function checkouts() {
	const roots = new Set([ROOT]);
	if (args.includes('--here')) return [...roots];
	let main = null;
	try {
		const commonDir = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
			cwd: ROOT,
			encoding: 'utf8',
		}).trim();
		main = path.dirname(commonDir);
		roots.add(main);
	} catch {
		main = ROOT;
	}
	const worktrees = path.join(main, '.claude/worktrees');
	if (fs.existsSync(worktrees)) {
		for (const entry of fs.readdirSync(worktrees, { withFileTypes: true })) {
			if (entry.isDirectory()) roots.add(path.join(worktrees, entry.name));
		}
	}
	return [...roots].sort();
}

// Sizes are apparent bytes, so they under-report the real cost of ~42k tiny
// files; entries may also vanish mid-walk when a parallel worktree is running.
function bytesOf(target) {
	const stat = fs.lstatSync(target, { throwIfNoEntry: false });
	if (!stat) return null;
	if (!stat.isDirectory()) return stat.size;
	let total = 0;
	let entries = [];
	try {
		entries = fs.readdirSync(target, { withFileTypes: true });
	} catch {
		return total;
	}
	for (const entry of entries) total += bytesOf(path.join(target, entry.name)) ?? 0;
	return total;
}

let freed = 0;
for (const root of checkouts()) {
	const corpus = path.join(root, 'compatibility');
	if (!fs.existsSync(corpus)) continue;
	const hits = [];
	for (const name of NAMES) {
		const target = path.join(corpus, name);
		const size = bytesOf(target);
		if (size === null) continue;
		hits.push([name, size]);
		freed += size;
		if (!DRY_RUN) fs.rmSync(target, { recursive: true, force: true });
	}
	if (hits.length) {
		const mib = (hits.reduce((n, [, s]) => n + s, 0) / 1024 / 1024).toFixed(1);
		console.log(`[corpus-clean] ${root}: ${hits.length} artifact(s), ${mib} MiB`);
		for (const [name, size] of hits) console.log(`    ${name} (${(size / 1024 / 1024).toFixed(1)} MiB)`);
	}
}

const verb = DRY_RUN ? 'would free' : 'freed';
console.log(`[corpus-clean] ${verb} ${(freed / 1024 / 1024 / 1024).toFixed(2)} GiB`);
if (!ALL) console.log('[corpus-clean] (--all also drops the fmt / lint / check stages)');
