#!/usr/bin/env node
/**
 * Control for the corpus generation stamp (#2455).
 *
 * The hazard: corpus inputs are shared, mutable and regenerable, so a parallel
 * `corpus:clean`, a disk sweep or a plain `rm -rf` can delete or replace them
 * while a run is reading them — and the run reports numbers off whatever
 * survived. A ratio guard cannot see this: 99% of a shrunken denominator still
 * passes.
 *
 * This is a DISCRIMINATING control: the same corpus is asserted twice, once
 * untouched and once mutated, and the two must disagree. A guard that has only
 * ever been observed passing might be reading the wrong file entirely.
 *
 * Usage: node scripts/dev/test-corpus-generation-guard.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
	GENERATION_FILE,
	writeGeneration,
	readGeneration,
	assertGenerationUnchanged,
} from '../compat-corpus/artifacts.mjs';

let failed = false;
function check(name, fn) {
	try {
		fn();
		console.log(`[test-corpus-generation-guard] ok   ${name}`);
	} catch (e) {
		console.error(`[test-corpus-generation-guard] FAIL ${name}: ${e.message}`);
		failed = true;
	}
}

/** Asserts `fn` throws, and that the message names the expected change. */
function throwsWith(fn, needle) {
	let message = null;
	try {
		fn();
	} catch (e) {
		message = e.message;
	}
	if (message === null) throw new Error('expected a throw, got none');
	if (!message.includes(needle)) throw new Error(`message did not mention ${needle}: ${message}`);
	return message;
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-generation-'));

try {
	// Arm 1 — untouched corpus MUST pass. Without this arm a failing arm 2
	// cannot distinguish "the guard works" from "the guard always throws".
	check('untouched corpus passes', () => {
		const before = writeGeneration(dir, { entries: 14131, sources: 14131 });
		assertGenerationUnchanged(dir, before);
	});

	// Arm 2 — each way the corpus can change under a run MUST fail, and the
	// message must name which one, because a guard that asserts the wrong cause
	// sends the next reader hunting for the wrong thing.
	check('vanished corpus fails and says so', () => {
		const before = writeGeneration(dir, { entries: 14131, sources: 14131 });
		fs.rmSync(path.join(dir, GENERATION_FILE));
		throwsWith(() => assertGenerationUnchanged(dir, before), 'VANISHED');
	});

	check('re-collected corpus fails as REPLACED', () => {
		const before = writeGeneration(dir, { entries: 14131, sources: 14131 });
		writeGeneration(dir, { entries: 14131, sources: 14131 }); // a fresh collect
		throwsWith(() => assertGenerationUnchanged(dir, before), 'REPLACED');
	});

	check('truncated corpus fails as TRUNCATED', () => {
		const before = writeGeneration(dir, { entries: 14131, sources: 14131 });
		const g = readGeneration(dir);
		g.entries = 5166;
		fs.writeFileSync(path.join(dir, GENERATION_FILE), JSON.stringify(g));
		throwsWith(() => assertGenerationUnchanged(dir, before), 'TRUNCATED');
	});

	// A consumer that started before stamps existed must not be broken by them.
	check('absent baseline stamp is tolerated', () => {
		fs.rmSync(path.join(dir, GENERATION_FILE), { force: true });
		assertGenerationUnchanged(dir, null);
	});
} finally {
	fs.rmSync(dir, { recursive: true, force: true });
}

if (failed) process.exit(1);
console.log('[test-corpus-generation-guard] ✅ guard fires on every mutation and passes when untouched');
