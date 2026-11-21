// The commit a workload's arm measured, so its report names the tree it ran.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

/**
 * The `HEAD` of the checkout at `directory`. Throws unless `directory` is the top of its own
 * checkout: an uninitialised submodule answers `rev-parse` with the superproject's `HEAD`.
 */
export function revision(directory: string): string {
	const git = spawnSync('git', ['-C', directory, 'rev-parse', '--show-toplevel', 'HEAD'], {
		encoding: 'utf8',
	});
	if (git.error) throw git.error;
	if (git.status !== 0) throw new Error(`git rev-parse in ${directory}: ${git.stderr.trim()}`);
	const [top = '', hash = ''] = git.stdout.trim().split('\n');
	if (fs.realpathSync(top) !== fs.realpathSync(directory))
		throw new Error(`${directory} is not a checkout of its own: its top is ${top}`);
	if (!/^[a-f0-9]{40}$/.test(hash)) throw new Error(`git rev-parse in ${directory} gave ${hash}`);
	return hash;
}

/** `revision(directory)`, or null where `directory` is not the top of a checkout of its own. */
export function revisionOrNull(directory: string): string | null {
	try {
		return revision(directory);
	} catch {
		return null;
	}
}
