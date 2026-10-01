// Regenerates src/lib/data/emit/*.json from the real pipeline: each file holds a component, the
// JavaScript rsvelte generated for it and the emitter's raw mappings. Run from apps/site:
// `node scripts/generate-data.mjs`. The files are committed so the site builds without cargo.

import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const out = path.resolve(import.meta.dirname, '../src/lib/data/emit');
mkdirSync(out, { recursive: true });

const rev = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const dirty = execFileSync('git', ['-C', root, 'status', '--porcelain', '--', 'crates'], { encoding: 'utf8' }).trim();
if (dirty) throw new Error(`crates/ has uncommitted changes; the data would name a revision it did not come from:\n${dirty}`);

const samples = [
	{ name: 'counter', fixture: 'fixtures/svelte/rsvelte/minimal/counter.svelte/input.svelte', file: 'Counter.svelte' }
];
const tmp = mkdtempSync(path.join(tmpdir(), 'rsvelte-site-'));
for (const s of samples) {
	const input = path.join(tmp, s.file);
	copyFileSync(path.join(root, s.fixture), input);
	for (const target of ['client', 'server']) {
		const json = execFileSync(
			'cargo',
			['run', '-q', '--release', '-p', 'rsvelte_svelte', '--example', 'export_site_source_maps', '--', input, target],
			{ cwd: root, encoding: 'utf8' }
		);
		const data = { ...JSON.parse(json), fixture: s.fixture, file: s.file, target, rev };
		writeFileSync(path.join(out, `${s.name}-${target}.json`), JSON.stringify(data, null, '\t') + '\n');
		console.log(`${s.name}-${target}: ${data.mappings.length} mappings, ${data.out.length} chars`);
	}
}
