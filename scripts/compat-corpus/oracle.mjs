/**
 * Precondition check for the differential oracle.
 *
 * Every sweep here compares rsvelte against the official compiler imported from
 * `submodules/svelte`. That import needs the submodule's own `node_modules`,
 * which the repo's root `pnpm install` does not provide — and when it is absent
 * the workers die on `Cannot find package 'zimmerframe'` before they reach a
 * single comparison.
 *
 * The failure is invisible because it arrives wearing a verdict's clothes. The
 * mutation sweep runs each seed in a child process precisely so a compiler panic
 * cannot take the run down; the parent sees the dead child, records
 * `compiler-crash`, and resumes. A dead ORACLE is indistinguishable from a dead
 * compiler under test, so a full sweep in that state reports every seed as an
 * rsvelte crash — 14,138 confident findings, none of them real.
 *
 * So probe the oracle once, on an input it must handle, before the sweep starts.
 * Same shape as `verify.mjs` asserting that most manifest entries have compiled
 * output before it compares them: a gate that cannot see its own preconditions
 * reports the absence of measurement as a measurement.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const OFFICIAL_COMPILER_REL = 'submodules/svelte/packages/svelte/src/compiler/index.js';

/**
 * Throws when the official compiler cannot compile a known-good component and
 * module. `label` names the calling gate in the message.
 */
export function assertOracleCompiles(root, label) {
	const entry = path.join(root, OFFICIAL_COMPILER_REL);
	if (!fs.existsSync(entry)) {
		throw new Error(
			`[${label}] official compiler missing at ${OFFICIAL_COMPILER_REL}\n` +
				'  run: git submodule update --init submodules/svelte'
		);
	}
	const probe = path.join(root, 'scripts/compat-corpus/oracle-load-probe.mjs');
	try {
		execFileSync(process.execPath, [probe, entry], { stdio: ['ignore', 'ignore', 'pipe'] });
	} catch (e) {
		const stderr = (e?.stderr?.toString() ?? '').trim();
		const lines = stderr.split('\n').filter((l) => l.trim());
		// Node leads with the internal source frame that threw (`throw new
		// ERR_MODULE_NOT_FOUND(...)`), which names nothing the reader can act on.
		// The diagnosis is the thrown message itself.
		const diagnosis = lines.find((l) => /\w*Error[:\s[]/.test(l) && !/^\s*(throw|\^)/.test(l));
		const first = diagnosis ?? lines[0] ?? String(e?.message ?? e);
		const signal = e?.signal ? ` (${e.signal})` : '';
		throw new Error(
			`[${label}] the official compiler does not run${signal} — every comparison would be scored against a dead oracle.\n` +
				`  ${first}\n` +
				'  most often its dependencies are missing; the repo-root install does not cover the submodule:\n' +
				'    (cd submodules/svelte && pnpm install --frozen-lockfile)'
		);
	}
}
