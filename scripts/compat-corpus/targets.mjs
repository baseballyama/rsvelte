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
];

export const TARGET_KEYS = TARGETS.map((t) => t.key);
