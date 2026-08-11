/**
 * Provenance for the staged NAPI binding.
 *
 * The binary's `buildInfo()` export embeds its source commit at compile time.
 * Staging reads it before writing the sidecar stamp, so a stale target artifact
 * cannot be certified as the currently checked-out tree.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const BINDING_REL = '.corpus-cache/rsvelte.node';
const STAMP_REL = '.corpus-cache/rsvelte.node.provenance';

const git = (root, args) => {
	try {
		return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
	} catch {
		return null;
	}
};

/**
 * Copy the freshly built library into place and stamp it in the same step.
 * Stamping without copying would attest whatever happened to be there, so the
 * stamp would manufacture the confidence it exists to justify.
 */
export function stageBinding(root) {
	const candidates = ['librsvelte_napi.dylib', 'librsvelte_napi.so'].map((n) =>
		path.join(root, 'target/release', n)
	);
	const built = candidates.find((p) => fs.existsSync(p));
	if (!built) {
		throw new Error(
			`no built library under target/release — run \`cargo build --release -p rsvelte_napi --lib\` first\n  looked for: ${candidates.map((p) => path.relative(root, p)).join(', ')}`
		);
	}
	fs.mkdirSync(path.join(root, '.corpus-cache'), { recursive: true });
	const dest = path.join(root, BINDING_REL);
	// A failed attestation must not leave the prior binding's sidecar beside a
	// newly copied artifact.
	fs.rmSync(path.join(root, STAMP_REL), { force: true });
	// Overwriting a loaded dylib in place leaves macOS holding a stale signature
	// for the path and it SIGKILLs anything that loads it, so land a new inode.
	const tmp = `${dest}.staging`;
	fs.copyFileSync(built, tmp);
	fs.renameSync(tmp, dest);
	try {
		return writeBindingProvenance(root, dest);
	} catch (error) {
		fs.rmSync(dest, { force: true });
		throw error;
	}
}

/**
 * Stamping a binding that cannot load is the failure this whole module exists to
 * prevent, one level down: the attestation would outlive the thing it describes.
 */
function readBuildInfo(root, dest) {
	const probe = path.join(root, 'scripts/compat-corpus/binding-load-probe.mjs');
	try {
		return JSON.parse(execFileSync(process.execPath, [probe, dest], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
	} catch (e) {
		fs.rmSync(dest, { force: true });
		const signal = e?.signal ? ` (${e.signal})` : '';
		throw new Error(
			`the staged binding does not load${signal} — removed it rather than stamping it; nothing was written to ${STAMP_REL}`
		);
	}
}

export function writeBindingProvenance(root, bindingPath = path.join(root, BINDING_REL)) {
	const head = git(root, ['rev-parse', 'HEAD']);
	if (!head) throw new Error('cannot resolve HEAD to attest the binding');
	const buildInfo = readBuildInfo(root, bindingPath);
	if (!/^[0-9a-f]{40}$/i.test(buildInfo?.commit ?? '')) {
		throw new Error('the staged binding reports no git commit; rebuild it from a git checkout');
	}
	if (buildInfo.commit !== head) {
		throw new Error(
			`the staged binding was built from ${buildInfo.commit.slice(0, 8)}, not HEAD ${head.slice(0, 8)}; rebuild before staging`
		);
	}
	const stamp = { builtFromCommit: buildInfo.commit, dirty: buildInfo.dirty, stagedAt: new Date().toISOString() };
	fs.writeFileSync(path.join(root, STAMP_REL), JSON.stringify(stamp, null, '\t') + '\n');
	return stamp;
}

/**
 * @returns {{state: 'ok'|'unknown'|'stale'|'dirty'|'foreign', detail: string}}
 */
export function bindingProvenance(root) {
	const stampPath = path.join(root, STAMP_REL);
	if (!fs.existsSync(stampPath)) {
		return {
			state: 'unknown',
			detail: `no ${STAMP_REL} — the binding's source commit was never recorded, so nothing it measures can be attributed to a tree (mtime cannot substitute: a binding built before a fix and copied after it looks newer than the fix it lacks)`,
		};
	}
	let stamp;
	try {
		stamp = JSON.parse(fs.readFileSync(stampPath, 'utf8'));
	} catch {
		return { state: 'unknown', detail: `${STAMP_REL} is unreadable` };
	}
	const at = stamp.builtFromCommit;
	if (typeof at !== 'string' || at === '') {
		return { state: 'unknown', detail: `${STAMP_REL} records no builtFromCommit` };
	}
	if (stamp.dirty) {
		return { state: 'dirty', detail: `built from ${at.slice(0, 8)} with uncommitted changes` };
	}
	const known = git(root, ['rev-parse', '--verify', `${at}^{commit}`]);
	if (!known) {
		return { state: 'foreign', detail: `built from ${at.slice(0, 8)}, which is not a commit in this repository` };
	}
	const behind = git(root, ['rev-list', '--count', `${at}..HEAD`, '--', 'crates']);
	if (behind && behind !== '0') {
		return {
			state: 'stale',
			detail: `built from ${at.slice(0, 8)}, which is ${behind} commit(s) touching crates/ behind HEAD`,
		};
	}
	return { state: 'ok', detail: `built from ${at.slice(0, 8)}` };
}

/** A reason string when the binding cannot back a durable claim, else null. */
export function unattributedBindingReason(root) {
	const { state, detail } = bindingProvenance(root);
	if (state === 'ok') return null;
	return `the NAPI binding cannot be attributed: ${detail}; restage with \`node scripts/compat-corpus/binding.mjs --stage\``;
}

if (process.argv[1] && process.argv[1].endsWith('binding.mjs') && process.argv.includes('--stage')) {
	const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
	try {
		const stamp = stageBinding(root);
		console.log(
			`[binding] built from ${stamp.builtFromCommit.slice(0, 8)}${stamp.dirty ? ' (DIRTY)' : ''}`
		);
	} catch (e) {
		console.error(`[binding] ${e.message}`);
		process.exit(2);
	}
}
