// Oracle runner: lint a set of Svelte/JS/TS sources with the REAL
// eslint-plugin-svelte (pinned, see package.json) and emit a normalized JSON
// report. This is the ground truth the rsvelte native linter is compared
// against by scripts/compat-corpus/lint-verify.mjs.
//
// Usage:
//   node run.mjs --rules <rules.json> <file...>           # lint files, print JSON to stdout
//   node run.mjs --rules <rules.json> --stdin < manifest  # read NUL-separated paths from stdin
//
// `rules.json` is the rsvelte rule universe (array of "svelte/..." ids). Only
// those rules are enabled, at "warn", with their plugin default options — so
// the comparison is scoped to the rules rsvelte actually implements.

import { ESLint } from 'eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import tsParser from '@typescript-eslint/parser';
import globalsPkg from 'globals';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The lint environment's declared globals. eslint-plugin-svelte's `flat/base`
// declares none, but several rules locate their targets with eslint-utils'
// `ReferenceTracker`, which is *scope-based* — it only yields references to
// names that exist in the global scope. Without a realistic global environment
// those rules silently no-op (e.g. no-top-level-browser-globals never fires;
// infinite-reactive-loop can't see setTimeout; prefer-svelte-reactivity can't
// see `new URL`), making rsvelte's correct findings look like false positives.
//
// We declare a realistic, COLLISION-SAFE environment (see browser-globals.json):
//   - `globals.builtin`  — ES intrinsics (Date/Map/Set/Promise/…),
//   - `envApis`          — universal Web/Node APIs the rules track
//                          (URL, URLSearchParams, the setTimeout/… timer family),
//   - `browserOnly`      — the curated browser-only set for
//                          no-top-level-browser-globals (kept equal to rsvelte's
//                          BROWSER_GLOBALS).
// The full `globals.browser` set is intentionally avoided: it contains common
// identifiers (`name`/`event`/`length`/…) that rsvelte's name-based matcher
// cannot tell apart from local bindings.
const ORACLE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ENV_GLOBALS = JSON.parse(readFileSync(path.join(ORACLE_DIR, 'browser-globals.json'), 'utf8'));
const asReadonly = (names) => Object.fromEntries(names.map((name) => [name, 'readonly']));
const browserGlobals = {
	...globalsPkg.builtin,
	...asReadonly(ENV_GLOBALS.envApis),
	...asReadonly(ENV_GLOBALS.browserOnly)
};

const args = process.argv.slice(2);
let rulesPath = null;
let useStdin = false;
const files = [];
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--rules') rulesPath = args[++i];
	else if (args[i] === '--stdin') useStdin = true;
	else files.push(args[i]);
}

const ruleUniverse = rulesPath ? JSON.parse(readFileSync(rulesPath, 'utf8')) : null;

// Build the enabled-rule map. When a rule universe is supplied, enable exactly
// those rules; otherwise enable every rule the plugin exposes.
const allRuleIds = Object.keys(sveltePlugin.rules).map((n) => `svelte/${n}`);
const enabledIds = ruleUniverse ? ruleUniverse.filter((id) => allRuleIds.includes(id)) : allRuleIds;
const ruleConfig = {};
for (const id of enabledIds) ruleConfig[id] = 'warn';

let targets = files;
if (useStdin) {
	const data = readFileSync(0, 'utf8');
	targets = data.split('\0').filter(Boolean);
}
targets = targets.map((f) => path.resolve(f));

// ESLint flat-config `files` globs are matched relative to `cwd` and never
// match paths that resolve above it (`../…`). Set `cwd` to the longest common
// ancestor of every target so each absolute path stays inside and matches
// `**/*.svelte`.
function commonAncestor(paths) {
	if (paths.length === 0) return process.cwd();
	const split = paths.map((p) => path.dirname(p).split(path.sep));
	const first = split[0];
	const out = [];
	for (let i = 0; i < first.length; i++) {
		const seg = first[i];
		if (split.every((s) => s[i] === seg)) out.push(seg);
		else break;
	}
	return out.join(path.sep) || path.sep;
}
const cwd = commonAncestor(targets);

// Defensive: a rule whose schema rejects bare `"warn"` (e.g. an option-required
// allowlist rule) would invalidate the WHOLE config and make every file report
// a fatal config error. Probe each enabled rule alone and drop the offenders so
// one misconfigured rule can't sink the run.
const validIds = [];
for (const id of enabledIds) {
	try {
		const probe = new ESLint({
			cwd,
			overrideConfigFile: true,
			overrideConfig: [
				...sveltePlugin.configs['flat/base'],
				{ files: ['**/*.svelte'], languageOptions: { parserOptions: { parser: tsParser } }, rules: { [id]: 'warn' } }
			]
		});
		await probe.lintText('<div></div>', { filePath: 'probe.svelte' });
		validIds.push(id);
	} catch {
		process.stderr.write(`[lint-oracle] dropping rule ${id}: invalid with bare "warn" (option-required)\n`);
	}
}
for (const id of Object.keys(ruleConfig)) if (!validIds.includes(id)) delete ruleConfig[id];

const eslint = new ESLint({
	cwd,
	overrideConfigFile: true,
	// `flat/base` wires up the svelte parser + processor + the `svelte` plugin
	// for `**/*.svelte`; we then enable exactly the rsvelte rule universe at
	// "warn", and feed the svelte parser a TS sub-parser so `lang="ts"` blocks
	// parse (the typescript-eslint parser accepts plain JS too).
	overrideConfig: [
		...sveltePlugin.configs['flat/base'],
		{
			files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts', '**/*.js', '**/*.ts'],
			languageOptions: {
				globals: browserGlobals,
				parserOptions: {
					parser: tsParser,
					svelteFeatures: { experimentalGenerics: true }
				}
			},
			rules: ruleConfig
		}
	]
});

// Lint each file via `lintText` with its real path, so the config's
// extension-based processor/parser selection applies regardless of where the
// file lives (corpus sources sit under submodules/, outside the oracle cwd).
const out = [];
for (const f of targets) {
	let source;
	try {
		source = readFileSync(f, 'utf8');
	} catch {
		out.push({ file: f, messages: [], readError: true });
		continue;
	}
	let results;
	try {
		results = await eslint.lintText(source, { filePath: f, warnIgnored: false });
	} catch (err) {
		out.push({ file: f, messages: [], fatal: String(err && err.message ? err.message : err) });
		continue;
	}
	const r = results[0];
	if (!r) {
		out.push({ file: f, messages: [] });
		continue;
	}
	const messages = (r.messages || [])
		.filter((m) => m.ruleId && m.ruleId.startsWith('svelte/'))
		.map((m) => ({
			ruleId: m.ruleId,
			line: m.line,
			column: m.column,
			messageId: m.messageId ?? null,
			message: m.message
		}));
	const entry = { file: f, messages };
	const fatal = (r.messages || []).find((m) => m.fatal);
	if (fatal) entry.fatal = fatal.message;
	out.push(entry);
}
process.stdout.write(JSON.stringify(out));
