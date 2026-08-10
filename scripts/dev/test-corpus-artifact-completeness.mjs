#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assertCorpusSourcesPresent, missingCompiledArtifacts } from '../compat-corpus/artifacts.mjs';

let failed = false;
function check(name, fn) {
	try {
		fn();
		console.log(`[test-corpus-artifact-completeness] ok   ${name}`);
	} catch (e) {
		console.error(`[test-corpus-artifact-completeness] FAIL ${name}: ${e.message}`);
		failed = true;
	}
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-artifacts-'));
try {
	const manifest = [{ id: 'fixture.svelte' }];
	fs.mkdirSync(path.join(dir, 'sources'), { recursive: true });
	fs.writeFileSync(path.join(dir, 'sources', 'fixture.svelte'), '<h1 />');
	check('complete sources pass', () => assertCorpusSourcesPresent(dir, manifest));
	fs.rmSync(path.join(dir, 'sources', 'fixture.svelte'));
	check('missing sources fail before workers run', () => {
		try {
			assertCorpusSourcesPresent(dir, manifest);
			throw new Error('expected source preflight to throw');
		} catch (e) {
			if (!e.message.includes('missing 1/1 source artifact')) throw e;
		}
	});

	const output = path.join(dir, 'expected', 'fixture.svelte');
	fs.mkdirSync(output, { recursive: true });
	fs.writeFileSync(path.join(output, 'client.js'), 'export {};');
	fs.writeFileSync(path.join(output, 'error.json'), JSON.stringify({ server: { code: 'x' } }));
	fs.writeFileSync(path.join(output, 'warnings.json'), '{}');
	check('complete output and empty warnings pass', () => {
		if (missingCompiledArtifacts(path.join(dir, 'expected'), 'fixture.svelte', ['client', 'server']).length) {
			throw new Error('complete artifacts reported missing');
		}
	});
	fs.rmSync(path.join(output, 'warnings.json'));
	check('missing warning artifact is not mistaken for silence', () => {
		const missing = missingCompiledArtifacts(path.join(dir, 'expected'), 'fixture.svelte', ['client', 'server']);
		if (!missing.includes('warnings.json')) throw new Error(`missing warning file was not reported: ${missing}`);
	});
} finally {
	fs.rmSync(dir, { recursive: true, force: true });
}

if (failed) process.exit(1);
