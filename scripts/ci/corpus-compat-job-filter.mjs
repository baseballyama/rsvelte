#!/usr/bin/env node
// Decide which Corpus Compat jobs a change set can possibly affect.
//
// Every job in corpus-compat.yml builds a named set of cargo packages, so a
// change confined to `crates/<c>` can only affect the jobs whose build targets
// transitively depend on `<c>`. The dependency graph is read from
// `cargo metadata --no-deps` rather than transcribed here: a hand-written table
// rots silently, and a job wrongly filtered out reports as *absent*, which at a
// glance is indistinguishable from one that passed (#2405).
//
// The rule is deliberately one-sided. Only a path under `crates/<c>/` can
// narrow the job set; every other path — scripts, ratchets, submodules,
// lockfiles, the workflow itself — enables every job. Under-approximating the
// blast radius costs a skipped gate, over-approximating costs runner minutes.
//
// Exit codes: 0 = decided, 1 = internal/parse error.

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');

/**
 * Job id -> the cargo packages that job builds, copied from the `cargo build`
 * invocations in `.github/workflows/corpus-compat.yml`. Package names only;
 * the transitive closure is computed, never listed.
 *
 * @type {Record<string, string[]>}
 */
export const JOB_TARGETS = {
	corpus: ['rsvelte_napi', 'rsvelte_devtools'],
	'fmt-parity': ['rsvelte_fmt'],
	'scss-parity': ['rsvelte_preprocess'],
	'lint-parity': ['rsvelte_lint'],
	'check-parity': ['rsvelte_check'],
	'check-e2e-parity': ['rsvelte_check'],
	'shape-matrix': ['rsvelte_napi'],
	'lsp-fixtures-current': ['rsvelte_language_server'],
	'lsp-corpus': ['rsvelte_language_server'],
};

/**
 * @typedef {object} Workspace
 * @property {Map<string, string[]>} deps package name -> intra-workspace deps
 * @property {Map<string, string>} dirToPackage `crates/<dir>` -> package name
 * @property {Set<string>} referenced every dependency name any member declares
 */

/**
 * @param {string} [root]
 * @returns {Workspace}
 */
export function readWorkspace(root = ROOT) {
	const raw = execFileSync(
		'cargo',
		['metadata', '--no-deps', '--format-version', '1'],
		{ cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
	);
	return parseWorkspace(JSON.parse(raw), root);
}

/**
 * @param {any} metadata output of `cargo metadata --no-deps`
 * @param {string} root
 * @returns {Workspace}
 */
export function parseWorkspace(metadata, root) {
	const members = new Set(metadata.packages.map((p) => p.name));
	const deps = new Map();
	const dirToPackage = new Map();
	const referenced = new Set();
	for (const pkg of metadata.packages) {
		const names = new Set();
		for (const dep of pkg.dependencies ?? []) {
			referenced.add(dep.name);
			if (members.has(dep.name)) names.add(dep.name);
		}
		deps.set(pkg.name, [...names].sort());
		const dir = relative(root, dirname(pkg.manifest_path)).split(sep).join('/');
		dirToPackage.set(dir, pkg.name);
	}
	return { deps, dirToPackage, referenced };
}

/**
 * @param {Workspace} workspace
 * @param {string[]} targets
 * @returns {Set<string>} the targets plus every workspace crate they depend on
 */
export function closure(workspace, targets) {
	const seen = new Set();
	const stack = [...targets];
	while (stack.length > 0) {
		const name = /** @type {string} */ (stack.pop());
		if (seen.has(name)) continue;
		seen.add(name);
		stack.push(...(workspace.deps.get(name) ?? []));
	}
	return seen;
}

/**
 * The package a changed path belongs to, or `null` when the path is not a
 * crate source file at all (so it must enable every job).
 *
 * `undefined` means "provably inert": a crate directory that declares its own
 * `[workspace]`, such as `crates/rsvelte_lint_types`, which no corpus-compat
 * binary can link. Anything else unrecognized returns `null` and enables
 * everything — a directory name is not a package name, so failing to match one
 * says nothing about whether some member depends on it.
 *
 * @param {Workspace} workspace
 * @param {string} file
 * @param {string} [root]
 * @returns {string | null | undefined}
 */
export function packageOf(workspace, file, root = ROOT) {
	if (!file.startsWith('crates/')) return null;
	const segments = file.split('/');
	if (segments.length < 3) return null;
	const dir = `${segments[0]}/${segments[1]}`;
	const pkg = workspace.dirToPackage.get(dir);
	if (pkg) return pkg;
	const manifest = join(root, dir, 'Cargo.toml');
	if (!existsSync(manifest)) return null;
	return /^\s*\[workspace\]/m.test(readFileSync(manifest, 'utf8'))
		? undefined
		: null;
}

/**
 * @param {Workspace} workspace
 * @param {string[]} changedFiles
 * @returns {Record<string, boolean>} job id -> whether it must run
 */
export function decide(workspace, changedFiles, root = ROOT) {
	const closures = new Map(
		Object.entries(JOB_TARGETS).map(([job, targets]) => [
			job,
			closure(workspace, targets),
		]),
	);
	// No file list at all (a schedule or dispatch run) means "assume everything".
	const enabled = Object.fromEntries(
		Object.keys(JOB_TARGETS).map((job) => [job, changedFiles.length === 0]),
	);
	// The PR that shrinks the LSP ratchet is the one that most needs the
	// full-population verdict, and the event-name guard on `lsp-corpus` would
	// otherwise let it merge having never been measured. This output re-admits
	// exactly that PR. It costs 950 job-minutes when it fires and fires on 0 of
	// the 77 open PRs, because nothing else touches these two paths.
	enabled['lsp-ratchet'] = changedFiles.some(
		(file) =>
			file.startsWith('scripts/compat-lsp/') ||
			(file.startsWith('compatibility/lsp-known-failures') &&
				file.endsWith('.json')),
	);
	for (const file of changedFiles) {
		const pkg = packageOf(workspace, file, root);
		if (pkg === undefined) continue; // provably inert for every job
		for (const job of Object.keys(JOB_TARGETS)) {
			if (pkg === null || /** @type {Set<string>} */ (closures.get(job)).has(pkg))
				enabled[job] = true;
		}
	}
	return enabled;
}

/**
 * @param {string[]} argv
 * @returns {string | undefined}
 */
function argValue(argv, name) {
	const index = argv.indexOf(name);
	return index === -1 ? undefined : argv[index + 1];
}

function main() {
	const argv = process.argv.slice(2);
	const listPath = argValue(argv, '--changed-files');
	const changedFiles =
		listPath && existsSync(listPath)
			? readFileSync(listPath, 'utf8')
					.split('\n')
					.map((line) => line.trim())
					.filter(Boolean)
			: [];
	const enabled = decide(readWorkspace(), changedFiles);
	const lines = Object.entries(enabled).map(([job, on]) => `${job}=${on}`);
	for (const line of lines) console.log(line);
	if (process.env.GITHUB_OUTPUT)
		appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url)))
	main();
