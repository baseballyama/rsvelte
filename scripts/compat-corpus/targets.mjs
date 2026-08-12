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
 *   - warningBaseline / warningPositionBaseline / warningMessageBaseline
 *               the three warning-parity ratchets (see verify.mjs). Warnings are
 *               gated separately from output so a warning divergence can never
 *               move an output ratchet, and the two warning failure modes get
 *               independent burn-downs: a wrong *set of codes* is a semantic
 *               bug, a wrong *position* is one systemic cause (emission sites
 *               that attach no span) and would otherwise bury the semantic one;
 *               message text is ratcheted independently too.
 *   - errorMessageBaseline / errorPositionBaseline / errorEndBaseline /
 *     errorFrameBaseline
 *               the same split, for the detail of a compile error the output
 *               verdict cannot see: it compares the error `code` and nothing
 *               else, so a right-coded error with the wrong prose or the wrong
 *               span scores as parity. `start` and `end` are separate because
 *               they have separate causes — a missing span attachment vs. a
 *               span that stops one character in — and an entry listed for one
 *               would otherwise suppress the other. `frame` is compared only
 *               where both endpoints agree, so it isolates the renderer.
 *   - parseBaseline
 *               the output-parseability ratchet (see verify.mjs). Separate from
 *               `baseline` because the output verdict is a comparison against
 *               official's text: an entry already listed there for a text
 *               mismatch would suppress a later regression to output that is
 *               not JavaScript at all.
 */
export const TARGETS = [
	{
		key: 'client',
		generate: 'client',
		dev: false,
		css: true,
		baseline: 'known-failures.client.json',
		warningBaseline: 'warning-known-failures.client.json',
		warningPositionBaseline: 'warning-position-known-failures.client.json',
		warningMessageBaseline: 'warning-message-known-failures.client.json',
		errorMessageBaseline: 'error-message-known-failures.client.json',
		errorPositionBaseline: 'error-position-known-failures.client.json',
		errorEndBaseline: 'error-end-known-failures.client.json',
		errorFrameBaseline: 'error-frame-known-failures.client.json',
		parseBaseline: 'parse-known-failures.client.json',
	},
	{
		key: 'server',
		generate: 'server',
		dev: false,
		css: false,
		baseline: 'known-failures.server.json',
		warningBaseline: 'warning-known-failures.server.json',
		warningPositionBaseline: 'warning-position-known-failures.server.json',
		warningMessageBaseline: 'warning-message-known-failures.server.json',
		errorMessageBaseline: 'error-message-known-failures.server.json',
		errorPositionBaseline: 'error-position-known-failures.server.json',
		errorEndBaseline: 'error-end-known-failures.server.json',
		errorFrameBaseline: 'error-frame-known-failures.server.json',
		parseBaseline: 'parse-known-failures.server.json',
	},
	{
		key: 'server-dev',
		generate: 'server',
		dev: true,
		css: false,
		baseline: 'known-failures.server-dev.json',
		warningBaseline: 'warning-known-failures.server-dev.json',
		warningPositionBaseline: 'warning-position-known-failures.server-dev.json',
		warningMessageBaseline: 'warning-message-known-failures.server-dev.json',
		errorMessageBaseline: 'error-message-known-failures.server-dev.json',
		errorPositionBaseline: 'error-position-known-failures.server-dev.json',
		errorEndBaseline: 'error-end-known-failures.server-dev.json',
		errorFrameBaseline: 'error-frame-known-failures.server-dev.json',
		parseBaseline: 'parse-known-failures.server-dev.json',
	},
	// `dev: true` gates 18 client codegen files plus the CSS transform (empty
	// rules survive pruning in dev), so dev CSS is compared too.
	{
		key: 'client-dev',
		generate: 'client',
		dev: true,
		css: true,
		baseline: 'known-failures.client-dev.json',
		warningBaseline: 'warning-known-failures.client-dev.json',
		warningPositionBaseline: 'warning-position-known-failures.client-dev.json',
		warningMessageBaseline: 'warning-message-known-failures.client-dev.json',
		errorMessageBaseline: 'error-message-known-failures.client-dev.json',
		errorPositionBaseline: 'error-position-known-failures.client-dev.json',
		errorEndBaseline: 'error-end-known-failures.client-dev.json',
		errorFrameBaseline: 'error-frame-known-failures.client-dev.json',
		parseBaseline: 'parse-known-failures.client-dev.json',
	},
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
