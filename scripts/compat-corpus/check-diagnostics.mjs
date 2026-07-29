/**
 * Shared diagnostic plumbing for the two svelte-check parity gates:
 * `check-verify.mjs` (Layer 1 — committed scenario fixtures) and
 * `check-e2e-verify.mjs` (Layer 2 — real project trees with installed deps).
 *
 * Both gates compare the SAME thing — the diagnostic set official
 * `svelte-check` and `rsvelte-check` report for one type-checked project — so
 * they must normalize and diff it identically. See the header of
 * `check-verify.mjs` for why the key is `<SEVERITY> <relpath>:<line> <code>`
 * and why the two sides are compared as multisets rather than sets.
 */

import path from 'node:path';
import { execFileSync } from 'node:child_process';

const rel = (p) => p.split(path.sep).join('/');

export const key = (severity, file, line, code) => `${severity} ${rel(file)}:${line} ${code}`;

const bump = (counts, k) => counts.set(k, (counts.get(k) ?? 0) + 1);

/** `TS2322` / `2322` / 2322 -> `2322`; Svelte codes stay as written. */
export function normalizeCode(code) {
	if (code === undefined || code === null || code === '') return '?';
	return String(code).replace(/^TS(?=\d)/, '');
}

/** Run a checker and return its stdout, tolerating the non-zero exit it uses to signal errors. */
export function runCapture(program, argv, cwd, env) {
	try {
		return execFileSync(program, argv, {
			cwd,
			encoding: 'utf8',
			maxBuffer: 1 << 28,
			env: { ...process.env, ...env }
		});
	} catch (err) {
		// Both CLIs exit non-zero as soon as they report an error; stdout is on err.
		if (err.stdout === undefined) throw err;
		return err.stdout;
	}
}

/**
 * `--output machine-verbose`: one `<epoch-ms> <payload>` line per event, where
 * a diagnostic payload is the JSON object built by `MachineFriendlyWriter`.
 * START / COMPLETED lines are not JSON objects and are skipped. Both checkers
 * emit this same shape, so a single parser covers both sides.
 */
export function parseMachineVerbose(stdout) {
	const counts = new Map();
	const detail = [];
	for (const line of stdout.split('\n')) {
		const payload = line.slice(line.indexOf(' ') + 1).trim();
		if (!payload.startsWith('{')) continue;
		let d;
		try {
			d = JSON.parse(payload);
		} catch {
			continue;
		}
		if (d.type !== 'ERROR' && d.type !== 'WARNING') continue;
		const k = key(d.type, d.filename, d.start.line + 1, normalizeCode(d.code));
		bump(counts, k);
		detail.push({ key: k, message: d.message, source: d.source });
	}
	return { counts, detail };
}

/**
 * Multiset difference: one entry per key whose multiplicity differs, tagged with
 * the side that has the surplus and how large it is.
 */
export function diffCounts(unit, oracle, rsvelte) {
	const out = [];
	for (const k of new Set([...oracle.keys(), ...rsvelte.keys()])) {
		const delta = (rsvelte.get(k) ?? 0) - (oracle.get(k) ?? 0);
		if (delta === 0) continue;
		const n = Math.abs(delta);
		out.push(`${unit}|${delta > 0 ? '+' : '-'}${k}${n > 1 ? ` x${n}` : ''}`);
	}
	return out;
}
