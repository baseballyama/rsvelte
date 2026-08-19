// Oracle autofix runner with the WHOLE rule universe enabled at once, which is
// the configuration a user actually runs. `fix.mjs` enables one rule, so it
// compares a rule's fixer in isolation; here ESLint's driver additionally has to
// schedule overlapping fixes from different rules across its passes.
//
// Usage:
//   node fix-all.mjs --rules-file rules.json --stdin < manifest   # NUL-separated paths
//
// Output: JSON `[{ file, output, fixedParses, fatal }]`, identical in shape to
// `fix.mjs` so both gates read one format.

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
let rulesFile = null;
let useStdin = false;
const files = [];
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--rules-file') rulesFile = args[++i];
	else if (args[i] === '--stdin') useStdin = true;
	else files.push(args[i]);
}
if (!rulesFile) {
	console.error('fix-all.mjs: --rules-file <json array of rule ids> is required');
	process.exit(2);
}
const rules = Object.fromEntries(JSON.parse(readFileSync(rulesFile, 'utf8')).map((id) => [id, 'warn']));

let targets = files;
if (useStdin) targets = readFileSync(0, 'utf8').split('\0').filter(Boolean);
targets = targets.map((f) => path.resolve(f));

// Same `cwd` anchoring as fix.mjs: a target above `cwd` is silently ignored,
// which reads exactly like "nothing to fix".
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
		// ESLint core deletes unused disable directives under `fix` on its own —
		// the driver's behaviour, not any svelte rule's.
		{ linterOptions: { reportUnusedDisableDirectives: 'off' } },
		...sveltePlugin.configs['flat/base'],
		{
			files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'],
			languageOptions: {
				globals: browserGlobals,
				parserOptions: { parser: tsParser, project: false, extraFileExtensions: ['.svelte'] }
			},
			rules
		}
	]
});

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
	const meta = r.messages.find((m) => m.ruleId === null);
	out.push({
		file: f,
		output: r.output ?? source,
		fixedParses: !(meta && r.output !== undefined),
		fatal: meta && r.output === undefined ? { message: meta.message } : null
	});
}
process.stdout.write(JSON.stringify(out));
