#!/usr/bin/env node
/**
 * Debug a single formatter-parity entry: print the oracle (oxfmt `svelte: true`)
 * vs rsvelte-fmt output and a unified-ish line diff. Operates live (re-runs both
 * formatters), so it reflects the current rsvelte-fmt binary without rebuilding
 * the whole corpus.
 *
 * Usage:
 *   node scripts/compat-corpus/fmt-one.mjs <corpus-id>
 *   node scripts/compat-corpus/fmt-one.mjs <corpus-id> --src   # also print the source
 *
 * Env: OXFMT_BIN, RSVELTE_FMT_BIN (same defaults as fmt.mjs).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SOURCES = path.join(ROOT, 'compat/corpus/sources');
const OXFMT_BIN = process.env.OXFMT_BIN || path.join(ROOT, 'node_modules/.bin/oxfmt');
const OXFMT_CONFIG = path.join(ROOT, 'scripts/fixtures/fmt-corpus.oxfmtrc.json');
const RSVELTE_FMT_BIN =
	process.env.RSVELTE_FMT_BIN || path.join(ROOT, 'target/release/rsvelte-fmt');

const id = process.argv[2];
if (!id || id.startsWith('--')) {
	console.error('usage: node scripts/compat-corpus/fmt-one.mjs <corpus-id> [--src]');
	process.exit(2);
}
const SHOW_SRC = process.argv.includes('--src');

const srcPath = path.join(SOURCES, id);
if (!fs.existsSync(srcPath)) {
	console.error(`source not found: ${path.relative(ROOT, srcPath)} (run collect.mjs)`);
	process.exit(2);
}
const source = fs.readFileSync(srcPath, 'utf8');
const name = path.basename(id).endsWith('.svelte') ? path.basename(id) : 'input.svelte';

function run(bin, argv) {
	try {
		return { ok: true, out: execFileSync(bin, argv, { input: source, maxBuffer: 64 * 1024 * 1024 }).toString() };
	} catch (e) {
		return { ok: false, out: (e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? '') };
	}
}

const oracle = run(OXFMT_BIN, ['-c', OXFMT_CONFIG, '--stdin-filepath', name]);
const actual = run(RSVELTE_FMT_BIN, ['--stdin', '--stdin-filepath', name, '-c', OXFMT_CONFIG, '--oxfmt-bin', OXFMT_BIN]);

if (SHOW_SRC) {
	console.log('───── source ─────');
	console.log(source);
}
console.log('───── oracle (oxfmt svelte:true) ─────');
console.log(oracle.out);
console.log('───── actual (rsvelte-fmt) ─────');
console.log(actual.out);

console.log('───── diff (oracle → actual) ─────');
const a = oracle.out.split('\n');
const b = actual.out.split('\n');
let diffs = 0;
for (let i = 0; i < Math.max(a.length, b.length); i++) {
	if (a[i] !== b[i]) {
		diffs++;
		console.log(`@${i + 1}`);
		console.log(`  - ${JSON.stringify(a[i] ?? '<EOF>')}`);
		console.log(`  + ${JSON.stringify(b[i] ?? '<EOF>')}`);
		if (diffs >= 40) {
			console.log('  … (truncated)');
			break;
		}
	}
}
console.log(diffs === 0 ? '✅ identical' : `❌ ${diffs} differing line(s)`);
process.exit(diffs === 0 ? 0 : 1);
