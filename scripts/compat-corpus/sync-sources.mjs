#!/usr/bin/env node
/**
 * Ensure `.corpus-cache/svelte.dev` is checked out at the SHA pinned in
 * `compat/corpus/sources.json`. Clones (blobless, single commit) on first
 * run; fetches the pinned SHA afterwards. Idempotent.
 *
 * Usage: node scripts/compat-corpus/sync-sources.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const sources = JSON.parse(fs.readFileSync(path.join(ROOT, 'compat/corpus/sources.json'), 'utf8'));

const { repo, sha } = sources['svelte.dev'];
const dir = path.join(ROOT, '.corpus-cache/svelte.dev');

function git(args, opts = {}) {
	return execFileSync('git', args, { stdio: ['ignore', 'pipe', 'inherit'], ...opts })
		.toString()
		.trim();
}

if (!fs.existsSync(path.join(dir, '.git'))) {
	fs.mkdirSync(dir, { recursive: true });
	git(['init', '-q'], { cwd: dir });
	git(['remote', 'add', 'origin', repo], { cwd: dir });
}

let head = null;
try {
	head = git(['rev-parse', 'HEAD'], { cwd: dir });
} catch {
	// empty repo
}

if (head === sha) {
	console.log(`[sync-sources] svelte.dev already at ${sha.slice(0, 12)}`);
} else {
	console.log(`[sync-sources] fetching svelte.dev @ ${sha.slice(0, 12)}…`);
	git(['fetch', '--filter=blob:none', '--depth', '1', 'origin', sha], { cwd: dir });
	git(['checkout', '-q', '--force', sha], { cwd: dir });
	console.log('[sync-sources] done');
}
