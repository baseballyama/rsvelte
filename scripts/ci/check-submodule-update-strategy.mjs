#!/usr/bin/env node
// Cargo initialises the submodules of a git dependency recursively and has no
// option not to, so one corpus repository with a private or SSH-only nested
// submodule makes `rsvelte_core` unusable as a git dependency — a failure only
// downstream consumers see, which is why it stood from July to #4580. Marking
// every entry `update = none` is what Cargo honours.
//
// The invariant has two halves and each is silent on its own:
//
//   1. every `.gitmodules` entry carries `update = none`. `git submodule add`
//      does not write it, so the next corpus repository reintroduces the bug.
//   2. every `git submodule update --init` in the tree passes `--checkout`,
//      which overrides that strategy. Without it the command registers the
//      submodule, checks nothing out, and exits 0 — so a job or a contributor
//      following the instruction gets an empty directory and no error.
//
// Exit codes: 0 = both halves hold, 1 = a violation, 2 = the scan found nothing
// to check (a guard that finds nothing must not report success).

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** `.gitmodules` entries as `{ name, path, update }`. */
export function entries(text) {
	const out = [];
	for (const line of text.split('\n')) {
		const section = line.match(/^\s*\[submodule "(.+)"\]\s*$/);
		if (section) {
			out.push({ name: section[1], path: undefined, update: undefined });
			continue;
		}
		const setting = line.match(/^\s*(path|update)\s*=\s*(.+?)\s*$/);
		if (setting && out.length > 0) out[out.length - 1][setting[1]] = setting[2];
	}
	return out;
}

const ARGV_FORM = /['"]submodule['"]\s*,\s*['"]update['"]/;

/**
 * Does this line invoke `git submodule update --init` without `--checkout`?
 * `--merge` / `--rebase` / `--remote --merge` override the strategy the same
 * way `--checkout` does, but none of them appear with `--init` here; keeping
 * the rule to `--init` leaves a false positive fixable by joining the command
 * onto one line, which is the safe direction.
 *
 * `--checkout` is matched anywhere in the line, punctuation included: prose
 * writes it as `` `--checkout` `` and a word-boundary-after-whitespace rule
 * reads that as absent — which is how this very file first failed the check.
 *
 * The argv form (`['submodule', 'update', '--init', …]` passed to a spawn)
 * is a call site too: #4580 missed one in check-lint-types-lock.mjs, and the
 * release job's version PR then failed on an empty submodules/corsa-bind.
 */
export function isUnguardedCall(text) {
	return (
		(/git submodule update\b/.test(text) || ARGV_FORM.test(text)) &&
		/(^|[\s`'"])--init\b/.test(text) &&
		!/--checkout\b/.test(text)
	);
}

/** `git grep -n` output lines as `{ file, line, text }`. */
export function parseGrep(stdout) {
	const out = [];
	for (const line of stdout.split('\n')) {
		if (line === '') continue;
		const m = line.match(/^([^:]+):(\d+):(.*)$/s);
		if (m) out.push({ file: m[1], line: Number(m[2]), text: m[3] });
	}
	return out;
}

/**
 * Files where the command appears as data rather than as an instruction, and
 * so cannot carry the flag: this guard's own error strings and its controls'
 * fixtures. Neither runs a submodule command. Everything else is in scope.
 */
export const SELF = [
	'scripts/ci/check-submodule-update-strategy.mjs',
	'scripts/ci/test-check-submodule-update-strategy.mjs',
];

/**
 * Every tracked line mentioning the command. `docs/archive/` is excluded: it is
 * a frozen copy of an old AGENTS.md that is not loaded and must not be edited.
 */
function callSites(root = ROOT) {
	let stdout = '';
	try {
		stdout = execFileSync(
			'git',
			[
				'grep',
				'-n',
				'-E',
				`git submodule update|['"]submodule['"][[:space:]]*,[[:space:]]*['"]update['"]`,
				'--',
				'.',
				':!docs/archive',
			],
			{ cwd: root, encoding: 'utf8' },
		);
	} catch (err) {
		// git grep exits 1 with no output when nothing matches; anything else is real.
		if (err.status !== 1) throw err;
		stdout = err.stdout ?? '';
	}
	return parseGrep(stdout);
}

function main() {
	const text = readFileSync(join(ROOT, '.gitmodules'), 'utf8');
	const declared = entries(text);

	// The same count derived by git's own parser: a hand-rolled reader that
	// stopped seeing sections would otherwise report an empty file as clean.
	const byGit = execFileSync('git', ['config', '-f', '.gitmodules', '--get-regexp', '\\.path$'], {
		cwd: ROOT,
		encoding: 'utf8',
	})
		.split('\n')
		.filter((l) => l !== '').length;

	if (declared.length === 0 || byGit === 0) {
		console.error('::error::.gitmodules declares no submodule — this guard stopped looking.');
		return 2;
	}
	if (declared.length !== byGit) {
		console.error(
			`::error::.gitmodules parsed as ${declared.length} entries here and ${byGit} by ` +
				'`git config`. The reader below is wrong, so its verdict means nothing.',
		);
		return 2;
	}

	let failed = false;

	const missing = declared.filter((e) => e.update !== 'none');
	for (const e of missing) {
		console.error(
			`::error file=.gitmodules::[submodule "${e.name}"] (${e.path}) has no ` +
				'`update = none`. Cargo fetches a git dependency\'s submodules recursively, so ' +
				'this entry is cloned by every downstream consumer and fails the checkout outright ' +
				'if its own nested submodules are private or SSH-only. Add `update = none` and use ' +
				'`git submodule update --init --checkout` to check it out here.',
		);
		failed = true;
	}

	const sites = callSites();
	if (sites.length === 0) {
		console.error(
			'::error::No tracked line mentions `git submodule update` — the scan found nothing, ' +
				'which is not the same as finding nothing wrong.',
		);
		return 2;
	}

	const unguarded = sites.filter((s) => !SELF.includes(s.file) && isUnguardedCall(s.text));
	for (const s of unguarded) {
		console.error(
			`::error file=${s.file},line=${s.line}::\`git submodule update --init\` without ` +
				'`--checkout`. Every entry in `.gitmodules` is `update = none`, so this checks ' +
				'nothing out and still exits 0. Add `--checkout` (on the same line).',
		);
		failed = true;
	}

	const scanned = sites.filter((s) => !SELF.includes(s.file));
	console.log(
		`.gitmodules: ${declared.length - missing.length}/${declared.length} entries are ` +
			`\`update = none\`; call sites: ${scanned.length - unguarded.length}/${scanned.length} ` +
			`pass \`--checkout\` or need none (${sites.length - scanned.length} lines in ` +
			'this guard and its controls quote the command as data).',
	);
	return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
	process.exit(main());
}
