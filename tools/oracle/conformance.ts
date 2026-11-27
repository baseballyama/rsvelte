// Rune modules made from the conformance tests of a language's own suite, so the corpus reads
// syntax no component happens to use: `node conformance.ts <suite> <checkout at its commit>`.
// A test that must fail to parse is left out, and so is one that only sloppy mode runs, as a
// module is strict.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { CORPUS } from './paths.ts';

/** The tests taken from each directory, spread over its sorted files. */
const PER_DIRECTORY = 8;
/** A larger test is mostly generated repetition. */
const MAX_BYTES = 8192;

interface Suite {
	commit: string;
	/** The directory of the tests, in the checkout. */
	tests: string;
	/** The test files, a glob under `tests`. */
	glob: string;
	license: string;
	/** The notice the license asks a copy to keep, if any. */
	notice?: string;
	/** The extension a copy takes in place of the test's own. */
	extension: string;
	admitted(text: string, file: string): boolean;
}

/** The test262 front matter's flags, and whether it expects an error. */
export function admittedByTest262(text: string, file: string): boolean {
	if (file.includes('_FIXTURE')) return false;
	const meta = /\/\*---([\s\S]*?)---\*\//.exec(text)?.[1];
	if (meta === undefined || /^negative:/m.test(meta)) return false;
	const flags = /^flags:\s*\[([^\]]*)\]/m.exec(meta)?.[1] ?? '';
	return !/\b(noStrict|raw|CanBlockIsFalse|CanBlockIsTrue)\b/.test(flags);
}

/** A one-file TypeScript test that TypeScript emits alone without an error. */
export function admittedByTypescript(text: string, file: string): boolean {
	if (file.endsWith('.d.ts') || /^\s*\/\/\s*@filename\s*:/im.test(text)) return false;
	try {
		const { diagnostics } = ts.transpileModule(text, {
			fileName: file,
			reportDiagnostics: true,
			compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
		});
		return diagnostics?.length === 0;
	} catch {
		// TypeScript throws on a few tests it cannot emit alone; the oracle could not strip them.
		return false;
	}
}

const SUITES: Record<string, Suite> = {
	test262: {
		commit: '4db99ac4dc8924279ae07ed3246385924e878519',
		tests: 'test/language',
		glob: '**/*.js',
		license: 'LICENSE',
		extension: '.svelte.js',
		admitted: admittedByTest262,
	},
	typescript: {
		commit: 'eebb8dc407b2301905a3c12a84a244beb4ba6898',
		tests: 'tsc/testdata/tests/cases/conformance',
		glob: '**/*.ts',
		license: 'LICENSE.txt',
		notice: 'NOTICE.txt',
		extension: '.svelte.ts',
		admitted: admittedByTypescript,
	},
};

/** The tests to copy, by their path under the suite's `tests`. */
function chosen(root: string, suite: Suite): string[] {
	const byDirectory = new Map<string, string[]>();
	const dir = path.join(root, suite.tests);
	for (const file of fs.globSync(suite.glob, { cwd: dir }).toSorted()) {
		const text = fs.readFileSync(path.join(dir, file), 'utf8');
		if (Buffer.byteLength(text) > MAX_BYTES || !suite.admitted(text, file)) continue;
		const parent = path.dirname(file);
		byDirectory.set(parent, [...(byDirectory.get(parent) ?? []), file]);
	}
	const out: string[] = [];
	for (const tests of byDirectory.values()) {
		const step = Math.max(1, Math.floor(tests.length / PER_DIRECTORY));
		for (let i = 0, n = 0; i < tests.length && n < PER_DIRECTORY; i += step, n++) {
			out.push(tests[i]!);
		}
	}
	return out;
}

if (import.meta.main) {
	const [name, root] = process.argv.slice(2);
	const suite = name === undefined ? undefined : SUITES[name];
	if (!suite || !root)
		throw new Error(`usage: node conformance.ts <${Object.keys(SUITES).join('|')}> <checkout>`);
	const head = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
	if (head !== suite.commit) throw new Error(`the checkout is at ${head}, not ${suite.commit}`);
	const out = path.join(CORPUS, '_own', name!);
	fs.rmSync(out, { recursive: true, force: true });
	const tests = chosen(root, suite);
	for (const file of tests) {
		const to = path.join(out, file.replace(/\.[jt]s$/, suite.extension));
		fs.mkdirSync(path.dirname(to), { recursive: true });
		fs.copyFileSync(path.join(root, suite.tests, file), to);
	}
	fs.copyFileSync(path.join(root, suite.license), path.join(out, 'LICENSE'));
	if (suite.notice) fs.copyFileSync(path.join(root, suite.notice), path.join(out, 'NOTICE'));
	console.log(`${tests.length} tests`);
}
