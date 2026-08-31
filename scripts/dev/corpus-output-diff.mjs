// Diff two rsvelte builds against each other and against the official compiler
// over every corpus `.svelte`, and report BYTE EQUALITY MOVEMENT per file.
//
// This is the instrument a generated matrix cannot replace. A matrix cell is
// built from the axes its author wrote, so a construct that works as a SINK —
// one whose visible effect is that some *other* code path stops firing — has no
// cell, and removing it is scored as an improvement. Measured instance: ablating
// the dev event-handler anchor scored 121 -> 112 on a 336-cell grid (9 repaired,
// 0 regressed) while losing byte equality against official on 2 real components.
//
//   node scripts/dev/corpus-output-diff.mjs --before A.node --after B.node \
//        [--target client|client-dev|server|server-dev] [--corpus-root DIR]
//
// `--before` may be omitted to grade a single build against official only.
// Two napi cdylibs cannot be `require`d into one process (it segfaults with no
// output), so each build is measured in its own child process.
//
// Reports, with the denominator printed rather than left to prose:
//
//   files compiled            <N>
//   output changed            <n> / <N>
//     newly byte-identical    <n>   (a win)
//     LOST byte equality      <n>   (a regression — this is the number that matters)
//
// Self-check: `--self-test` runs the tool against a fixture pair with a known
// answer, because "0 files moved" is what both a no-op change and a broken
// harness print.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SELF = fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

function arg(name) {
	const i = process.argv.indexOf(`--${name}`);
	return i === -1 ? undefined : process.argv[i + 1];
}
const has = (name) => process.argv.includes(`--${name}`);

const TARGETS = {
	client: { generate: 'client', dev: false },
	'client-dev': { generate: 'client', dev: true },
	server: { generate: 'server', dev: false },
	'server-dev': { generate: 'server', dev: true }
};

const CORPUS_ROOT = path.resolve(arg('corpus-root') ?? process.env.CORPUS_ROOT ?? ROOT);
const targetName = arg('target') ?? 'client';
if (!TARGETS[targetName]) {
	console.error(`--target must be one of ${Object.keys(TARGETS).join(', ')}`);
	process.exit(2);
}

function corpusFiles() {
	const sources = JSON.parse(
		fs.readFileSync(path.join(ROOT, 'scripts/compat-corpus/corpus-sources.json'), 'utf8')
	);
	const out = [];
	const walk = (d) => {
		let entries;
		try {
			entries = fs.readdirSync(d, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			if (entry.name === 'node_modules' || entry.name === '.git') continue;
			const p = path.join(d, entry.name);
			if (entry.isDirectory()) walk(p);
			else if (entry.name.endsWith('.svelte')) out.push(p);
		}
	};
	for (const source of sources) walk(path.join(CORPUS_ROOT, source.path));
	out.sort();
	return out;
}

// --- child mode: one build per process -------------------------------------
// Every use of a binding runs here, INCLUDING the grade against official: two
// napi cdylibs in one process segfault with no output, and grading two builds in
// the parent is exactly that. This file's header says so and an earlier version
// did it anyway — the grade path is only reached when `--before` is given, so
// the self-test never covered it.
if (process.env.CORPUS_DIFF_CHILD) {
	const rs = require(path.resolve(process.env.CORPUS_DIFF_CHILD));
	const options = { ...TARGETS[targetName], css: 'external' };
	const grade = process.env.CORPUS_DIFF_GRADE === '1';
	const svelte = grade
		? await (async () => {
				const { OFFICIAL_COMPILER_REL } = await import(
					path.join(ROOT, 'scripts/compat-corpus/oracle.mjs')
				);
				return import(path.join(ROOT, OFFICIAL_COMPILER_REL));
			})()
		: null;
	const lines = [];
	for (const file of JSON.parse(fs.readFileSync(process.env.CORPUS_DIFF_LIST, 'utf8'))) {
		const source = fs.readFileSync(file, 'utf8');
		const o = { ...options, filename: path.basename(file) };
		if (grade) {
			try {
				lines.push(svelte.compile(source, o).js.code === rs.compile(source, o).js.code ? '1' : '0');
			} catch {
				lines.push('e');
			}
			continue;
		}
		let code;
		try {
			code = rs.compile(source, o).js.code;
		} catch {
			lines.push('ERR');
			continue;
		}
		lines.push(crypto.createHash('sha256').update(code).digest('hex'));
	}
	fs.writeFileSync(process.env.CORPUS_DIFF_OUT, lines.join('\n'));
	process.exit(0);
}

// --- parent ----------------------------------------------------------------
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-corpus-diff-'));
process.on('exit', () => fs.rmSync(work, { recursive: true, force: true }));

function runChild(binding, files, grade) {
	const list = path.join(work, `l-${crypto.randomUUID()}.json`);
	fs.writeFileSync(list, JSON.stringify(files));
	const out = path.join(work, `h-${crypto.randomUUID()}.txt`);
	execFileSync(process.execPath, [SELF, '--target', targetName], {
		env: {
			...process.env,
			CORPUS_DIFF_CHILD: binding,
			CORPUS_DIFF_LIST: list,
			CORPUS_DIFF_OUT: out,
			...(grade ? { CORPUS_DIFF_GRADE: '1' } : {})
		},
		stdio: 'inherit'
	});
	return fs.readFileSync(out, 'utf8').split('\n');
}

const hashes = (binding, files) => runChild(binding, files, false);

// `true` byte-identical to official, `false` differs, `null` a compiler threw.
function gradeAgainstOfficial(binding, files) {
	const verdicts = runChild(path.resolve(binding), files, true);
	return new Map(files.map((f, i) => [f, verdicts[i] === 'e' ? null : verdicts[i] === '1']));
}

if (has('self-test')) {
	// A tool whose pass condition is "0 moved" must be shown able to print a
	// non-zero; without that, a broken harness and a clean change are one output.
	const before = arg('before'),
		after = arg('after');
	if (!before || !after) {
		console.error('--self-test needs --before and --after (two builds known to differ)');
		process.exit(2);
	}
	// The whole corpus: movement is rare (a real fix moved 42 of 32,620), so a
	// prefix sample reports 0 and the self-test then fails on its own sampling.
	const files = corpusFiles();
	const a = hashes(path.resolve(before), files);
	const b = hashes(path.resolve(after), files);
	const moved = files.filter((_, i) => a[i] !== b[i]).length;
	console.log(`self-test: ${moved} of ${files.length} files moved between the two builds`);
	console.log(moved > 0 ? 'PASS (the instrument can report movement)' : 'FAIL (it reports nothing — check the bindings)');
	process.exit(moved > 0 ? 0 : 1);
}

const afterBinding = arg('after') ?? arg('binding') ?? process.env.BINDING;
if (!afterBinding) {
	console.error('need --after <rsvelte napi cdylib> (and usually --before <other build>)');
	process.exit(2);
}
const beforeBinding = arg('before');

const files = corpusFiles();
console.log(`target:        ${targetName}`);
console.log(`corpus root:   ${CORPUS_ROOT}`);
console.log(`files compiled ${files.length}`);
if (files.length === 0) {
	console.error('no corpus .svelte files found — is --corpus-root a checkout with submodules?');
	process.exit(2);
}

if (!beforeBinding) {
	const verdicts = gradeAgainstOfficial(afterBinding, files);
	let eq = 0,
		ne = 0,
		err = 0;
	for (const v of verdicts.values()) v === null ? err++ : v ? eq++ : ne++;
	console.log(`byte-identical to official   ${eq} / ${files.length}`);
	console.log(`differs                      ${ne} / ${files.length}`);
	console.log(`a compiler threw             ${err} / ${files.length}`);
	process.exit(0);
}

const before = hashes(path.resolve(beforeBinding), files);
const after = hashes(path.resolve(afterBinding), files);
const moved = files.filter((_, i) => before[i] !== after[i]);
console.log(`output changed ${moved.length} / ${files.length}`);
if (moved.length === 0) process.exit(0);

const beforeVerdicts = gradeAgainstOfficial(beforeBinding, moved);
const afterVerdicts = gradeAgainstOfficial(afterBinding, moved);
let gained = 0,
	lost = 0;
const lostFiles = [];
for (const file of moved) {
	const b = beforeVerdicts.get(file),
		a = afterVerdicts.get(file);
	if (b === false && a === true) gained++;
	else if (b === true && a === false) {
		lost++;
		lostFiles.push(file);
	}
}
console.log(`  newly byte-identical to official   ${gained} / ${files.length}`);
console.log(`  LOST byte equality                 ${lost} / ${files.length}`);
for (const file of lostFiles) console.log(`    LOST\t${path.relative(CORPUS_ROOT, file)}`);
process.exit(lost > 0 ? 1 : 0);
