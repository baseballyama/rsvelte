/**
 * The rule universe shared by the two places that compare rsvelte-lint against
 * the real eslint-plugin-svelte: the parity corpus (`lint-verify.mjs`) and the
 * `lint` benchmark task (`scripts/bench/run-benchmark.mjs`).
 *
 * Both need the *same* answer to "which rules do both linters run?" — a
 * benchmark that timed a different rule set than the parity gate compares would
 * be measuring two different workloads.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ORACLE_DIR = path.join(__dirname, 'lint-oracle');

// The source repos the CI lint-parity job collects, and therefore the exact
// population `lint-known-failures.json` describes. Shared so the collector, the
// workflow and the ratchet-rewrite guard cannot disagree about it: a rewrite
// from any other repo set produces a ratchet CI can never reproduce.
export const CI_REPOS = [
	'eslint-plugin-svelte',
	'svelte-eslint-parser',
	'bits-ui',
	'flowbite-svelte',
	'melt-ui',
	'shadcn-svelte',
	'skeleton'
];

// Rules excluded from the parity universe, each for a structural reason that
// makes a finding-level comparison meaningless on this corpus (NOT a place to
// hide real divergences — those go in known-failures.json and must shrink).
export const EXCLUDE = new Set([
	// ── Type-aware: need the TypeScript checker (tsgo) to match upstream. The
	//    type-aware path is covered separately by `rsvelte_lint_types`.
	'svelte/no-unused-props',
	'svelte/no-navigation-without-resolve',
	// `require-event-prefix` resolves component event names from TS types; the
	//    corpus oracle has only the TS *parser* (no type checker), so it returns
	//    `{}` and stays silent even on its own invalid fixtures. rsvelte's
	//    syntactic port recovers them, so a finding-level comparison here is
	//    meaningless (the rule IS exercised by the exact-fixture oracle test).
	'svelte/require-event-prefix',
	// ── Option-required: schema rejects an empty option list, so the rule is a
	//    no-op without a per-project allowlist. rsvelte defaults it off too.
	'svelte/no-restricted-html-elements',
	// ── `indent`: a stylistic whitespace rule only partially ported (template
	//    level; the JS/TS-AST script indentation the fixture oracle skips). Full
	//    real-world parity is a tracked follow-up — see lint-corpus README. It
	//    dominates (~84%) the raw divergence count and would drown the gate.
	'svelte/indent',
	// ── Compiler/CSS-parser meta-rules: these run the Svelte compiler / CSS
	//    parser and surface its warnings (a11y, unused-selector, CSS parse
	//    errors). Their parity is governed by the compiler's own extensive test
	//    suites (validator/snapshot/CSS fixtures — all at 100%) and the fixture
	//    oracle, not the lint port. Comparing them here just re-surfaces
	//    compiler-level differences already tracked elsewhere.
	'svelte/valid-compile',
	'svelte/valid-style-parse',
	// `no-conflicting-module-names` resolves same-directory sibling files. The
	// oracle receives isolated corpus copies, while rsvelte receives source paths.
	'svelte/no-conflicting-module-names'
]);

/**
 * Intersect the rules rsvelte implements with the rules the pinned
 * eslint-plugin-svelte exposes, minus `EXCLUDE`.
 *
 * `bin` is any binary that answers `--list-rules` (the `rsvelte-lint` CLI, or
 * the benchmark runner, which mirrors the flag for exactly this reason).
 */
export function ruleUniverse(bin) {
	const listed = execFileSync(bin, ['--list-rules'], { encoding: 'utf8', maxBuffer: 1 << 24 });
	const rsvelte = new Set(
		listed
			.split('\n')
			.map((l) => l.match(/^(svelte\/[a-z0-9-]+)/))
			.filter(Boolean)
			.map((m) => m[1])
	);
	const pluginList = JSON.parse(
		execFileSync(
			'node',
			[
				'-e',
				'import("eslint-plugin-svelte").then(m=>process.stdout.write(JSON.stringify(Object.keys(m.default.rules).map(n=>"svelte/"+n))))'
			],
			{ cwd: ORACLE_DIR, encoding: 'utf8' }
		)
	);
	const plugin = new Set(pluginList);
	return [...rsvelte].filter((id) => plugin.has(id) && !EXCLUDE.has(id)).sort();
}

/** True when the oracle package's dependencies are installed. */
export function oracleInstalled() {
	return fs.existsSync(path.join(ORACLE_DIR, 'node_modules', 'eslint-plugin-svelte'));
}
