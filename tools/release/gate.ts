// Fails a pull request that changes what a release ships but adds no changeset, since the release
// pull request takes its version and changelog from the changesets alone.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = path.resolve(import.meta.dirname, '../..');

/** Whether `file` goes into the programs or the npm package of a release. */
export function ships(file: string): boolean {
	if (file === 'apps/cli/launcher.js' || file === 'apps/cli/README.md') return true;
	if (/^apps\/eslint-plugin\/[^/]+$/.test(file))
		return !/\.test\.ts$|\/(package|tsconfig)\.json$/.test(file);
	if (!file.startsWith('crates/') || file.endsWith('.md')) return false;
	const segments = file.split('/');
	if (segments.at(-1) === 'tests.rs') return false;
	return !segments.some((s) => ['tests', 'fixtures', 'benches', 'examples'].includes(s));
}

/** Whether `file` is a changeset that a pull request adds. */
export const isChangeset = (file: string) =>
	/^\.changeset\/[^/]+\.md$/.test(file) && file !== '.changeset/README.md';

/** The files that ship, when none of `added` is a changeset; empty when the pull request passes. */
export function missing(changed: string[], added: string[]): string[] {
	return added.some(isChangeset) ? [] : changed.filter(ships);
}

const diff = (base: string, filter: string) =>
	execFileSync(
		'git',
		['-C', ROOT, 'diff', '--name-only', `--diff-filter=${filter}`, `${base}...HEAD`],
		{
			encoding: 'utf8',
		},
	)
		.split('\n')
		.filter(Boolean);

export async function main(args: string[]): Promise<void> {
	const { values } = parseArgs({ args, options: { base: { type: 'string' } } });
	if (!values.base) throw new Error('gate needs --base');
	const files = missing(diff(values.base, 'ACDMR'), diff(values.base, 'A'));
	if (!files.length) return;
	console.error(
		[
			`This pull request changes ${files.length} file(s) that a release ships, such as ${files[0]}, but adds no changeset.`,
			"Add .changeset/<name>.md with the front matter `'@rsvelte/cli': patch` (or minor) and one sentence for the changelog.",
			'If users cannot notice the change, add an empty one with `pnpm changeset --empty`, or the label skip-changeset.',
		].join('\n'),
	);
	process.exitCode = 1;
}
