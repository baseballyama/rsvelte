/**
 * The compile targets the output-equality corpus compares, shared by
 * compile.mjs / verify.mjs / one.mjs / cluster.mjs so a target is added in one
 * place instead of four hardcoded `['client', 'server']` lists.
 *
 * Each descriptor drives:
 *   - key       output basename (`<key>.js`, `<key>.css`) and the target label
 *               used in report.json details / error.json keys
 *   - generate  the `generate` compile option
 *   - dev       the `dev` compile option
 *   - css       whether CSS output is compared for this target
 *   - baseline  the ratchet file (relative to compatibility/) for this target
 */
export const TARGETS = [
	{ key: 'client', generate: 'client', dev: false, css: true, baseline: 'known-failures.client.json' },
	{ key: 'server', generate: 'server', dev: false, css: false, baseline: 'known-failures.server.json' },
	// `dev: true` gates 18 client codegen files plus the CSS transform (empty
	// rules survive pruning in dev), so dev CSS is compared too.
	{ key: 'client-dev', generate: 'client', dev: true, css: true, baseline: 'known-failures.client-dev.json' },
];

export const TARGET_KEYS = TARGETS.map((t) => t.key);

/**
 * `--targets <key>[,<key>…]` narrows a run to a subset of TARGETS (iterating on
 * one target locally). Absent, every target runs.
 */
export function selectTargets(argv) {
	const i = argv.indexOf('--targets');
	const value = i !== -1 ? argv[i + 1] : null;
	if (!value || value.startsWith('--')) return TARGETS;
	const keys = value.split(',').map((s) => s.trim()).filter(Boolean);
	const unknown = keys.filter((k) => !TARGET_KEYS.includes(k));
	if (unknown.length) {
		console.error(`[corpus] unknown --targets ${unknown.join(', ')} (known: ${TARGET_KEYS.join(', ')})`);
		process.exit(2);
	}
	return TARGETS.filter((t) => keys.includes(t.key));
}
