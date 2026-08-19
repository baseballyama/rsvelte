// Oracle autofix runner: lint a set of sources with ONE rule of the real
// eslint-plugin-svelte enabled and `fix: true`, and print the fixed text per
// file. Paired with `run.mjs` (which compares reports); this is the comparison
// the report key cannot make — a rule can report at the right position and
// still write the wrong replacement.
//
// Usage:
//   node fix.mjs --rule svelte/html-quotes --stdin < manifest   # NUL-separated paths
//
// Output: JSON `[{ file, output, fatal }]`, where `output` is the source after
// ESLint's fix passes (unchanged text when the rule offers no fix).

import { ESLint } from 'eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import tsParser from '@typescript-eslint/parser';
import globalsPkg from 'globals';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertPreprocessorsAreResolvable } from './preconditions.mjs';

assertPreprocessorsAreResolvable();

const ORACLE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ENV_GLOBALS = JSON.parse(readFileSync(path.join(ORACLE_DIR, 'browser-globals.json'), 'utf8'));
const asReadonly = (names) => Object.fromEntries(names.map((name) => [name, 'readonly']));
const browserGlobals = {
	...globalsPkg.builtin,
	...asReadonly(ENV_GLOBALS.envApis),
	...asReadonly(ENV_GLOBALS.browserOnly)
};

const args = process.argv.slice(2);
let rule = null;
let useStdin = false;
const files = [];
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--rule') rule = args[++i];
	else if (args[i] === '--stdin') useStdin = true;
	else files.push(args[i]);
}
if (!rule) {
	console.error('fix.mjs: --rule <svelte/rule-id> is required');
	process.exit(2);
}

let targets = files;
if (useStdin) targets = readFileSync(0, 'utf8').split('\0').filter(Boolean);
targets = targets.map((f) => path.resolve(f));

// ESLint flat-config `files` globs are matched relative to `cwd` and a path
// resolving above it is silently *ignored* — one non-rule message and no fixes,
// which reads exactly like "the rule had nothing to fix". Same fix as run.mjs:
// anchor `cwd` at the longest common ancestor of the targets.
function commonAncestor(paths) {
	if (paths.length === 0) return process.cwd();
	const split = paths.map((p) => path.dirname(p).split(path.sep));
	const out = [];
	for (let i = 0; i < split[0].length; i++) {
		const seg = split[0][i];
		if (split.every((s) => s[i] === seg)) out.push(seg);
		else break;
	}
	return out.join(path.sep) || path.sep;
}
const cwd = commonAncestor(targets);

const eslint = new ESLint({
	cwd,
	fix: true,
	overrideConfigFile: true,
	overrideConfig: [
		// ESLint core reports — and under `fix` DELETES — unused disable
		// directives on its own. That is the driver's behaviour, not the svelte
		// plugin's, and it would show up as a `comment-directive` autofix
		// divergence for a rule the plugin does not even declare fixable.
		{ linterOptions: { reportUnusedDisableDirectives: 'off' } },
		...sveltePlugin.configs['flat/base'],
		{
			files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'],
			languageOptions: {
				globals: browserGlobals,
				parserOptions: { parser: tsParser, project: false, extraFileExtensions: ['.svelte'] }
			},
			rules: { [rule]: 'warn' }
		}
	]
});

// `lintText` with the real path, so extension-based parser/processor selection
// applies wherever the file lives (mirrors run.mjs).
const out = [];
for (const f of targets) {
	let source;
	try {
		source = readFileSync(f, 'utf8');
	} catch {
		out.push({ file: f, output: null, fatal: { message: 'unreadable' } });
		continue;
	}
	let results;
	try {
		results = await eslint.lintText(source, { filePath: f, warnIgnored: false });
	} catch (err) {
		out.push({ file: f, output: null, fatal: { message: String(err?.message ?? err) } });
		continue;
	}
	const r = results[0];
	if (!r) {
		out.push({ file: f, output: null, fatal: { message: 'no result' } });
		continue;
	}
	// A message with no `ruleId` is ESLint itself talking (parse error, ignored
	// file, invalid config), and every one of those yields "no fixes" while
	// looking like parity — so surface it rather than compare against it.
	//
	// But only when it left nothing to compare. ESLint re-lints its own fixed
	// text (up to 10 passes), so a rule whose fix produces source Svelte rejects
	// reports a parse error *about the fixed text* while still returning the
	// fixed text. That output is exactly what this gate exists to compare, and
	// `fixedParses` records the parse verdict beside it instead of discarding it.
	const meta = r.messages.find((m) => m.ruleId === null);
	out.push({
		file: f,
		output: r.output ?? source,
		fixedParses: !(meta && r.output !== undefined),
		fatal: meta && r.output === undefined ? { message: meta.message } : null
	});
}
process.stdout.write(JSON.stringify(out));
