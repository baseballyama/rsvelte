#!/usr/bin/env node
// A shrink-only ratchet is shrink-only in its KEY count, and several keys here carry a
// content hash (`[count=…,hash=…]`, `[official=…,rsvelte=…]`). A re-baseline that improves
// a divergence without eliminating it therefore retires one key and enrols another, so the
// key diff cannot tell "improved, still divergent" from "newly broken" — and a net shrink
// can contain a new defect. Diff the UNIT (the key with its trailing bracket stripped).
//
//   node scripts/ci/ratchet-unit-delta.mjs <ratchet.json> [base-ref]
//
// Exits 1 when a unit is genuinely new, so this can gate a re-baseline.
//
// Deliberately NOT wired into a workflow yet: `lsp-known-failures.json` carries 4
// genuinely-new units today, so a hard gate would block every PR before the entries
// it names are closed. Run it at each re-baseline and publish the four numbers; wire
// it as a required check once the ratchets it inspects are clean.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [, , file, baseRef = 'origin/main'] = process.argv;
if (!file) {
	console.error('usage: ratchet-unit-delta.mjs <ratchet.json> [base-ref]');
	process.exit(2);
}

// Two of the 64 ratchets hold OBJECTS, not strings, and `String(entry)` collapses
// every one of them to `[object Object]` — which reported scss's 315 entries and
// fmt-oracle-excluded's 29 as a single unit that can never be new. Free prose is
// dropped so a reworded justification is not a new unit; every other field is identity.
const PROSE = new Set(['reason', 'justification', 'note', 'comment']);
const identity = (entry) => {
	if (typeof entry !== 'object' || entry === null) return String(entry);
	return Object.keys(entry)
		.sort()
		.filter((k) => !PROSE.has(k))
		.map((k) => `${k}=${entry[k]}`)
		.join('|');
};
const keysOf = (text) => {
	const j = JSON.parse(text);
	return Array.isArray(j) ? j.map(identity) : Object.keys(j);
};
// Two ways a key carries its CONTENT rather than its identity, and both end it:
// the `[count=…,hash=…]` / `[official=…,rsvelte=…]` bracket, and the corpus
// aggregate's `|divergentRequestCount=<n>` — which is 21,792 of the LSP ratchet's
// 32,441 keys, so a rule that strips only the bracket reports two thirds of that
// file's churn as new units. `|phase=edit` is identity and must survive, which is
// why the count suffix is named rather than matched as any trailing `=<digits>`.
const unit = (k) => k.replace(/\[[^[\]]*\]$/, '').replace(/\|divergentRequestCount=\d+$/, '');

let base;
try {
	base = keysOf(execFileSync('git', ['show', `${baseRef}:${file}`], { maxBuffer: 1 << 30 }).toString());
} catch {
	console.error(`[ratchet-unit-delta] ${file} does not exist at ${baseRef} — nothing to compare`);
	process.exit(0);
}
const head = keysOf(fs.readFileSync(file, 'utf8'));

const kb = new Set(base);
const kh = new Set(head);
const ub = new Set(base.map(unit));
const uh = new Set(head.map(unit));

const removed = base.filter((k) => !kh.has(k));
const added = head.filter((k) => !kb.has(k));
const churnIn = added.filter((k) => ub.has(unit(k)));
const churnOut = removed.filter((k) => uh.has(unit(k)));
const newUnits = [...new Set(added.filter((k) => !ub.has(unit(k))).map(unit))];
const goneUnits = [...new Set(removed.filter((k) => !uh.has(unit(k))).map(unit))];

console.log(`${file}  (${baseRef} -> working tree)`);
console.log(`  keys    ${base.length} -> ${head.length}   (${head.length - base.length >= 0 ? '+' : ''}${head.length - base.length})`);
console.log(`  units   ${ub.size} -> ${uh.size}   (${uh.size - ub.size >= 0 ? '+' : ''}${uh.size - ub.size})`);
console.log(`  removed keys ${removed.length}, of which ${churnOut.length} are units still listed (content churn)`);
console.log(`  added   keys ${added.length}, of which ${churnIn.length} are units already listed (content churn)`);
console.log(`  units eliminated ${goneUnits.length}`);
console.log(`  units genuinely NEW ${newUnits.length}`);
for (const u of newUnits.slice(0, 20)) console.log(`    + ${u}`);
if (newUnits.length > 20) console.log(`    … ${newUnits.length - 20} more`);

process.exit(newUnits.length ? 1 : 0);
