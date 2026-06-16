#!/usr/bin/env node
/**
 * Shallow-clone (or fast-forward) every ecosystem-ci target into
 * compat/ecosystem-ci/checkout/<name>/ so collect.mjs can fold their shipped
 * `.svelte` / `.svelte.(js|ts)` sources into the output-equality corpus.
 *
 * The target list is the SAME `compat/ecosystem-ci/targets/*.json` the
 * ecosystem-ci runner uses — so the corpus and the integration runner stay in
 * lock-step on which production projects we verify. Unlike ecosystem-ci this
 * does NOT install deps or run builds: the corpus only reads source files, so a
 * shallow clone is all that is needed (fast, no node_modules).
 *
 * `disabled` targets are still cloned — `disabled` only suppresses the
 * ecosystem-ci build/swap (a known runtime regression), not source collection,
 * and their components are perfectly valid corpus inputs.
 *
 * Usage: node scripts/compat-corpus/sync-ecosystem.mjs [--only <name,name>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const TARGETS_DIR = path.join(ROOT, 'compat/ecosystem-ci/targets');
const CHECKOUT_DIR = path.join(ROOT, 'compat/ecosystem-ci/checkout');

const args = process.argv.slice(2);
const onlyArg = args.indexOf('--only') !== -1 ? args[args.indexOf('--only') + 1] : null;
const only = onlyArg ? new Set(onlyArg.split(',').map((s) => s.trim())) : null;

function log(msg) {
	console.error(`[sync-ecosystem] ${msg}`);
}

function run(cmd, cmdArgs, opts = {}) {
	return spawnSync(cmd, cmdArgs, { stdio: 'inherit', ...opts });
}

if (!fs.existsSync(TARGETS_DIR)) {
	log(`no targets directory at ${TARGETS_DIR}`);
	process.exit(1);
}

fs.mkdirSync(CHECKOUT_DIR, { recursive: true });

const targets = fs
	.readdirSync(TARGETS_DIR)
	.filter((f) => f.endsWith('.json'))
	.map((f) => JSON.parse(fs.readFileSync(path.join(TARGETS_DIR, f), 'utf8')))
	.filter((t) => !only || only.has(t.name));

if (!targets.length) {
	log('no matching targets');
	process.exit(1);
}

let cloned = 0;
let updated = 0;
for (const t of targets) {
	const dest = path.join(CHECKOUT_DIR, t.name);
	if (!fs.existsSync(dest)) {
		log(`cloning ${t.repo} (branch ${t.branch}) -> ${path.relative(ROOT, dest)}`);
		const r = run('git', ['clone', '--depth', '1', '--branch', t.branch, t.repo, dest]);
		if (r.status !== 0) {
			log(`clone failed: ${t.name}`);
			process.exit(1);
		}
		cloned++;
	} else {
		log(`updating ${path.relative(ROOT, dest)} (branch ${t.branch})`);
		const fetch = run('git', ['fetch', '--depth', '1', 'origin', t.branch], { cwd: dest });
		if (fetch.status !== 0) {
			log(`fetch failed: ${t.name} (keeping existing checkout)`);
			continue;
		}
		run('git', ['reset', '--hard', `origin/${t.branch}`], { cwd: dest });
		updated++;
	}
}

log(`done: ${cloned} cloned, ${updated} updated (${targets.length} targets total)`);
