// Replays the fork's patches onto the latest oxlint release, and says whether they still apply and
// pass the tests of the hooks rsvelte uses. The patches are the commits between the release the
// pinned revision is built on and the pinned revision itself, so no branch name is trusted.
import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = path.resolve(import.meta.dirname, '../..');
const FORK = 'https://github.com/baseballyama/oxc';
const UPSTREAM = 'https://github.com/oxc-project/oxc';

/** The fork revision every oxc crate in `cargoToml` is pinned to. */
export function pinnedRevision(cargoToml: string): string {
	const revisions = new Set(
		[
			...cargoToml.matchAll(
				/git = "https:\/\/github\.com\/baseballyama\/oxc", rev = "([0-9a-f]{40})"/g,
			),
		].map((match) => match[1]!),
	);
	if (revisions.size !== 1)
		throw new Error(`expected one oxc revision in Cargo.toml, found ${revisions.size}`);
	return [...revisions][0]!;
}

/** The version of an `oxlint_vX.Y.Z` tag. */
const version = (tag: string) => /^oxlint_v(\d+)\.(\d+)\.(\d+)$/.exec(tag)?.slice(1).map(Number);

/** The newest `oxlint_vX.Y.Z` tag of `tags`, by version. */
export function latestRelease(tags: string[]): string | undefined {
	return tags
		.filter((tag) => version(tag))
		.toSorted((a, b) => {
			const [x, y] = [version(a)!, version(b)!];
			return x[0]! - y[0]! || x[1]! - y[1]! || x[2]! - y[2]!;
		})
		.at(-1);
}

/** The commands that test the fork's hooks, in the checkout of the rebased patches. */
export const TESTS: string[][] = [
	['cargo', 'test', '-p', 'oxc_linter', '--lib', 'host::'],
	['cargo', 'check', '-p', 'oxlint', '-p', 'oxfmt', '--no-default-features'],
];

type Outcome =
	| { kind: 'current'; release: string }
	| { kind: 'conflict'; release: string; commit: string; files: string[] }
	| { kind: 'failing'; release: string; command: string; output: string }
	| { kind: 'rebased'; release: string; head: string; pushed?: string };

/** The Markdown report of `outcome`, for a person who has to act on it. */
export function report(outcome: Outcome, pin: string, patches: number): string {
	const head = `The fork's ${patches} patches on top of \`${pin.slice(0, 10)}\``;
	switch (outcome.kind) {
		case 'current':
			return `${head} are already on ${outcome.release}, the latest oxlint release.`;
		case 'conflict':
			return [
				`${head} do not rebase onto ${outcome.release}.`,
				'',
				`\`${outcome.commit}\` conflicts in:`,
				'',
				...outcome.files.map((file) => `- \`${file}\``),
			].join('\n');
		case 'failing':
			return [
				`${head} rebase onto ${outcome.release}, but \`${outcome.command}\` fails:`,
				'',
				'```',
				outcome.output.trim().split('\n').slice(-40).join('\n'),
				'```',
			].join('\n');
		case 'rebased':
			return [
				`${head} rebase onto ${outcome.release} and pass the tests, as \`${outcome.head.slice(0, 10)}\`.`,
				outcome.pushed
					? `It is pushed as \`${outcome.pushed}\`: pin rsvelte's oxc crates to \`${outcome.head}\`.`
					: 'Run `node tools/oxc-fork/oxc-fork.ts rebase --push` to push it as a branch.',
			].join('\n');
	}
}

const git = (repository: string, ...args: string[]) =>
	execFileSync('git', ['-C', repository, ...args], { encoding: 'utf8' }).trim();

/** The name of a remote of `repository` that fetches `url`, added when it has none. */
function remote(repository: string, url: string): string {
	const names = git(repository, 'remote').split('\n').filter(Boolean);
	const existing = names.find(
		(name) => git(repository, 'remote', 'get-url', name).replace(/\.git$/, '') === url,
	);
	if (existing) return existing;
	const name = url.split('/').at(-2)!;
	git(repository, 'remote', 'add', name, url);
	return name;
}

export async function main(args: string[]): Promise<void> {
	const { values } = parseArgs({
		args,
		options: {
			repo: { type: 'string' },
			push: { type: 'boolean', default: false },
			'skip-tests': { type: 'boolean', default: false },
		},
	});
	const pin = pinnedRevision(readFileSync(path.join(ROOT, 'Cargo.toml'), 'utf8'));
	const repository = values.repo ?? mkdtempSync(path.join(os.tmpdir(), 'oxc-fork-'));
	if (!values.repo) git(repository, 'init', '--quiet');
	// Named remotes, so that a partial clone fetches the blobs a checkout reads.
	const fork = remote(repository, FORK);
	const upstream = remote(repository, UPSTREAM);
	git(repository, 'fetch', '--quiet', '--filter=blob:none', fork, pin);
	git(
		repository,
		'fetch',
		'--quiet',
		'--filter=blob:none',
		upstream,
		'refs/tags/oxlint_v*:refs/tags/oxlint_v*',
	);
	const release = latestRelease(git(repository, 'tag', '--list', 'oxlint_v*').split('\n'));
	if (!release) throw new Error('no oxlint release tag');
	const base = git(repository, 'merge-base', pin, release);
	const patches = Number(git(repository, 'rev-list', '--count', `${base}..${pin}`));
	const outcome = rebase(repository, {
		pin,
		release,
		base,
		push: values.push ? fork : undefined,
		test: !values['skip-tests'],
	});
	const text = report(outcome, pin, patches);
	console.log(text);
	if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
	if (process.env.GITHUB_OUTPUT)
		appendFileSync(process.env.GITHUB_OUTPUT, `outcome=${outcome.kind}\nrelease=${release}\n`);
	if (outcome.kind === 'conflict' || outcome.kind === 'failing') process.exitCode = 1;
}

function rebase(
	repository: string,
	run: { pin: string; release: string; base: string; push: string | undefined; test: boolean },
): Outcome {
	const { pin, release, base } = run;
	if (base === git(repository, 'rev-parse', `${release}^{commit}`))
		return { kind: 'current', release };
	const tree = mkdtempSync(path.join(os.tmpdir(), 'oxc-fork-rebase-'));
	git(repository, 'worktree', 'add', '--quiet', '--detach', tree, pin);
	try {
		const rebased = spawnSync('git', ['-C', tree, 'rebase', '--quiet', '--onto', release, base], {
			encoding: 'utf8',
		});
		if (rebased.status !== 0) {
			const commit = git(tree, 'log', '-1', '--format=%h %s', 'REBASE_HEAD');
			const files = git(tree, 'diff', '--name-only', '--diff-filter=U').split('\n').filter(Boolean);
			git(tree, 'rebase', '--abort');
			return { kind: 'conflict', release, commit, files };
		}
		if (run.test) {
			for (const command of TESTS) {
				const result = spawnSync(command[0]!, command.slice(1), { cwd: tree, encoding: 'utf8' });
				if (result.status !== 0)
					return {
						kind: 'failing',
						release,
						command: command.join(' '),
						output: `${result.stdout}${result.stderr}`,
					};
			}
		}
		const head = git(tree, 'rev-parse', 'HEAD');
		if (!run.push) return { kind: 'rebased', release, head };
		const branch = `rsvelte-pin-on-${release}`;
		git(tree, 'push', '--quiet', run.push, `HEAD:refs/heads/${branch}`);
		return { kind: 'rebased', release, head, pushed: branch };
	} finally {
		git(repository, 'worktree', 'remove', '--force', tree);
		rmSync(tree, { recursive: true, force: true });
	}
}
