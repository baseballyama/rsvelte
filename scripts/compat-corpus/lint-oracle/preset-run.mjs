// Oracle runner for the DEFAULT-CONFIGURATION gate
// (`scripts/compat-corpus/lint-severity.mjs`).
//
// `run.mjs` is the oracle every other lint gate drives, and it enables an
// explicit rule universe at `"warn"`. That is the right configuration for
// comparing rules and it makes the default preset — and with it every finding's
// severity and the process exit code — a constant those gates cannot vary.
//
// This runner is the opposite: `eslint-plugin-svelte`'s `flat/recommended` is
// used VERBATIM, with no rules layer of any kind, so the report is what a user
// who wrote no rule configuration actually gets. The one layer added on top
// sets `languageOptions` only (the TS sub-parser so `lang="ts"` blocks parse,
// and the same collision-safe global environment `run.mjs` documents), which
// changes no rule's severity and enables none.
//
// It is a separate file rather than a flag on `run.mjs` because "the default
// preset" is a different oracle, not a different filter over the same one, and
// because the eight gates that share `run.mjs` must not move when this one does.
//
// Usage: node preset-run.mjs --stdin < NUL-separated-paths

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
const globals = {
	...globalsPkg.builtin,
	...asReadonly(ENV_GLOBALS.envApis),
	...asReadonly(ENV_GLOBALS.browserOnly)
};

const args = process.argv.slice(2);
const useStdin = args.includes('--stdin');
const files = args.filter((a) => a !== '--stdin');
const targets = (useStdin ? readFileSync(0, 'utf8').split('\0').filter(Boolean) : files).map((f) =>
	path.resolve(f)
);
if (targets.length === 0) {
	process.stderr.write('[lint-oracle-preset] no targets\n');
	process.exit(2);
}

// Flat-config `files` globs are matched relative to `cwd` and never match a path
// that resolves above it, so `cwd` must contain every target.
function commonAncestor(paths) {
	const split = paths.map((p) => path.dirname(p).split(path.sep));
	const out = [];
	for (let i = 0; i < split[0].length; i++) {
		const seg = split[0][i];
		if (split.every((s) => s[i] === seg)) out.push(seg);
		else break;
	}
	return out.join(path.sep) || path.sep;
}

const eslint = new ESLint({
	cwd: commonAncestor(targets),
	overrideConfigFile: true,
	overrideConfig: [
		...sveltePlugin.configs['flat/recommended'],
		{
			files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts', '**/*.js', '**/*.ts'],
			languageOptions: {
				globals,
				parserOptions: { parser: tsParser, svelteFeatures: { experimentalGenerics: true } }
			}
		}
	]
});

const SEVERITY = { 1: 'warn', 2: 'error' };

const out = [];
for (const file of targets) {
	let source;
	try {
		source = readFileSync(file, 'utf8');
	} catch {
		out.push({ file, messages: [], readError: true });
		continue;
	}
	let results;
	try {
		results = await eslint.lintText(source, { filePath: file, warnIgnored: false });
	} catch (err) {
		// A rule that THROWS takes the whole file's report with it, and ESLint
		// names the offending rule in the message. There is nothing to compare
		// for this file, so it is reported as its own class rather than as a
		// missing finding — and never as a reason to abort the run, since the
		// crash is a property of the oracle's default preset, which is exactly
		// what this gate exists to exercise.
		const message = String(err?.message ?? err);
		out.push({
			file,
			messages: [],
			crashed: [{ rule: /Rule: "([^"]+)"/.exec(message)?.[1] ?? null, message: message.split('\n')[0] }]
		});
		continue;
	}
	const r = results[0] ?? { messages: [], errorCount: 0 };
	const raw = r.messages || [];
	// A parse failure is reported as a fatal message rather than a throw; it
	// counts toward errorCount and therefore toward the exit code.
	const parseFatal = raw.filter((m) => m.fatal).map((m) => m.message.split('\n')[0]);
	out.push({
		file,
		messages: raw
			.filter((m) => m.ruleId && m.ruleId.startsWith('svelte/'))
			.map((m) => ({
				ruleId: m.ruleId,
				line: m.line,
				column: m.column,
				severity: SEVERITY[m.severity] ?? String(m.severity),
				message: m.message
			})),
		// Everything that drives the process exit code, not only the `svelte/*`
		// half the finding comparison looks at.
		errorCount: r.errorCount ?? 0,
		errorRules: [...new Set(raw.filter((m) => m.severity === 2).map((m) => m.ruleId ?? 'parse-error'))].sort(),
		crashed: [],
		parseFatal
	});
}
process.stdout.write(JSON.stringify(out));
