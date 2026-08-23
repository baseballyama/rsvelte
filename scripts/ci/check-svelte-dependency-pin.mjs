#!/usr/bin/env node
// `svelte` is this repository's oracle, not an ordinary dependency: every
// differential gate is "does rsvelte agree with THIS svelte". A range makes the
// installed version a function of the install DATE rather than of the commit,
// so two worktrees at the same commit can hold different oracles — measured at
// 40 checkouts on 5.56.9 and 29 on 5.56.10 out of 69, on one machine (#3589).
//
// The two oracle manifests under `scripts/compat-corpus/` already pin exactly
// and say why. This asserts the same of every workspace manifest, so the
// property is not maintained by memory.
//
// `peerDependencies` are exempt and must stay ranges: a published package that
// pinned its peer would be uninstallable beside any other svelte version.
//
// Exit codes: 0 = every declaration is exact, 1 = a range, 2 = no declaration
// found at all (which would mean this guard had silently stopped looking).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Manifests pnpm-workspace.yaml covers, plus the root. */
export function manifests(root = ROOT) {
	const found = [join(root, 'package.json')];
	const npm = join(root, 'apps', 'npm');
	if (existsSync(npm)) {
		for (const dir of readdirSync(npm).sort()) {
			const file = join(npm, dir, 'package.json');
			if (existsSync(file)) found.push(file);
		}
	}
	return found;
}

const EXACT = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

/** Every non-peer `svelte` declaration, with whether it is an exact version. */
export function declarations(files, root = ROOT) {
	const out = [];
	for (const file of files) {
		const pkg = JSON.parse(readFileSync(file, 'utf8'));
		for (const field of ['dependencies', 'devDependencies', 'optionalDependencies']) {
			const spec = pkg[field]?.svelte;
			if (spec === undefined) continue;
			out.push({ file: relative(root, file), field, spec, exact: EXACT.test(spec) });
		}
	}
	return out;
}

function main() {
	const found = declarations(manifests());
	if (found.length === 0) {
		console.error(
			'::error::No workspace manifest declares `svelte` outside peerDependencies. ' +
				'Either the layout moved or this guard stopped looking; a check that finds ' +
				'nothing must not report success.',
		);
		return 2;
	}

	const ranged = found.filter((d) => !d.exact);
	for (const d of found) {
		console.log(`  ${d.exact ? '✓' : '✗'} ${d.file}  ${d.field}.svelte = ${d.spec}`);
	}

	if (ranged.length > 0) {
		for (const d of ranged) {
			console.error(
				`::error::${d.file} declares ${d.field}.svelte as \`${d.spec}\`. svelte is the ` +
					'oracle every differential gate compares against, so its version must be a ' +
					'property of the commit, not of the install date. Pin it exactly and let ' +
					'Renovate move it.',
			);
		}
		return 1;
	}

	console.log(`svelte is pinned exactly in all ${found.length} declaration(s). ✓`);
	return 0;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
	process.exit(main());
}
