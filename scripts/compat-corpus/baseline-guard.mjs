/**
 * Shared refusal for baseline rewrites taken from an unrepresentative run.
 *
 * `--update-baseline` replaces a ratchet wholesale, so it is only sound when the
 * run measured the whole population the ratchet covers. Narrow the run along any
 * axis — a target subset, a family subset, a sampled slice — and the rewrite
 * silently deletes every entry that was not measured (FALSE-SHRINK), which reads
 * as a large clean improvement rather than as data loss. `--no-fmt` is the
 * mirror image: it counts formatting-only differences as failures and writes
 * entries the normal gate would never produce.
 *
 * Every corpus script re-derived this refusal set by hand, and the copies
 * drifted: the axes each script forgot were the axes it happened not to be
 * thinking about. Keeping the check in one place makes adding an axis one array
 * element at the call site instead of a fifth hand-written copy.
 */

/**
 * @param {string} tool  short name used in the message prefix
 * @param {(string|false|null|undefined)[]} reasons  one entry per axis; falsy
 *   means the axis was not narrowed. Each truthy entry states the flag and why
 *   the resulting baseline would be wrong.
 * @param {string} [flag]  the caller's rewrite flag, named in the fix hint.
 */
export function refuseUnrepresentativeBaseline(tool, reasons, flag = '--update-baseline') {
	const active = reasons.filter(Boolean);
	if (active.length === 0) return;
	console.error(`\n[${tool}] refusing to rewrite the baseline from this run:`);
	for (const reason of active) console.error(`  - ${reason}`);
	console.error(`  re-run over the full population, then ${flag}.`);
	process.exit(2);
}
