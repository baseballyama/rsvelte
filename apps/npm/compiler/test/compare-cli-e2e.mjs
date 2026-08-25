import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(import.meta.dirname, '../../../..');
const cli = resolve(repoRoot, 'pkg/bin/rsvelte.mjs');
const fixtureDirectory = await mkdtemp(resolve(tmpdir(), 'rsvelte-compare-e2e-'));
const fixture = resolve(fixtureDirectory, 'App.svelte');
await writeFile(fixture, '<h1>Hello</h1>\n');

const result = spawnSync(process.execPath, [cli, 'compare', '--json', fixture], {
	cwd: repoRoot,
	encoding: 'utf8',
});

assert.equal(result.status, 0, result.stderr || result.stdout);
const report = JSON.parse(result.stdout);
assert.deepEqual(
	{ scanned: report.scanned, matched: report.matched, different: report.different },
	{ scanned: 1, matched: 1, different: 0 },
);
