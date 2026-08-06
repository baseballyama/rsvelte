#!/usr/bin/env node
// Decide whether an auto-update workflow may force-push over an existing PR
// branch, i.e. whether the remote branch still holds nothing but the single
// commit the bot itself wrote last time.
//
// The auto-update workflows regenerate their branch from scratch
// (`git checkout -B` + one commit) and force-push. When a human has pushed
// follow-up work to the open PR, that force-push destroys it. This guard is the
// pre-flight check: it inspects the *remote* branch and reports `safe` only for
// the exact shape the bot leaves behind.
//
// Detection: take `merge-base(origin/<base>, origin/<branch>)` and list every
// commit on the branch since it. Safe requires
//   - at most one such commit, and
//   - that commit is authored AND committed by a known bot identity.
//
// Why the merge-base count survives the rebase-onto-a-new-bot-commit case: when
// a human rebases their work onto the bot's freshly regenerated commit, the
// branch still contains bot-commit + N human commits since the merge-base with
// main, so the count is N+1 > 1. A detector that only looked at the branch tip's
// author, or that only compared the tip against the bot's previous commit, would
// see a plausible-looking branch and clobber. The author/committer check is the
// second, independent signal: it catches an amended or hand-rewritten single
// commit, which the count alone would pass.
//
// Everything unclear is blocked, never allowed: an unreadable merge-base (for
// example a shallow clone too shallow to find one) fails closed.
//
// Exit codes: 0 = safe to force-push, 3 = blocked, 1 = error.

import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const DEFAULT_BOT_EMAILS = [
	'41898282+github-actions[bot]@users.noreply.github.com',
	'github-actions[bot]@users.noreply.github.com',
];

const EXIT_SAFE = 0;
const EXIT_ERROR = 1;
const EXIT_BLOCKED = 3;

function parseArgs(argv) {
	const opts = {
		branch: '',
		base: 'main',
		remote: 'origin',
		repo: process.cwd(),
		botEmails: [],
		fetch: true,
		what: '',
		reportPr: false,
	};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		const next = () => {
			const v = argv[++i];
			if (v === undefined) {
				throw new Error(`missing value for ${arg}`);
			}
			return v;
		};
		switch (arg) {
			case '--branch':
				opts.branch = next();
				break;
			case '--base':
				opts.base = next();
				break;
			case '--remote':
				opts.remote = next();
				break;
			case '--repo':
				opts.repo = next();
				break;
			case '--bot-email':
				opts.botEmails.push(next());
				break;
			case '--what':
				opts.what = next();
				break;
			case '--no-fetch':
				opts.fetch = false;
				break;
			case '--report-pr':
				opts.reportPr = true;
				break;
			default:
				throw new Error(`unknown argument: ${arg}`);
		}
	}
	if (!opts.branch) {
		throw new Error('--branch is required');
	}
	if (opts.botEmails.length === 0) {
		opts.botEmails = [...DEFAULT_BOT_EMAILS];
	}
	return opts;
}

function git(repo, args) {
	const res = spawnSync('git', args, { cwd: repo, encoding: 'utf8' });
	return {
		ok: res.status === 0,
		stdout: (res.stdout ?? '').trim(),
		stderr: (res.stderr ?? '').trim(),
	};
}

function isShallow(repo) {
	return git(repo, ['rev-parse', '--is-shallow-repository']).stdout === 'true';
}

/**
 * @returns {{status: 'safe'|'blocked', reason: string, commits: Array<{sha: string, author: string, committer: string, subject: string}>}}
 */
export function inspectBranch(opts) {
	const { repo, remote, base, branch } = opts;
	const botEmails = new Set(opts.botEmails.map((e) => e.toLowerCase()));

	if (opts.fetch) {
		// --depth only when already shallow: passing it to a full clone would
		// shallowify the checkout the caller is about to push from.
		const depth = isShallow(repo) ? ['--depth=200'] : [];
		git(repo, [
			'fetch',
			'--no-tags',
			'--quiet',
			...depth,
			remote,
			`+refs/heads/${base}:refs/remotes/${remote}/${base}`,
		]);
		git(repo, [
			'fetch',
			'--no-tags',
			'--quiet',
			...depth,
			remote,
			`+refs/heads/${branch}:refs/remotes/${remote}/${branch}`,
		]);
	}

	const branchRef = `refs/remotes/${remote}/${branch}`;
	const baseRef = `refs/remotes/${remote}/${base}`;

	const branchTip = git(repo, ['rev-parse', '--verify', '--quiet', `${branchRef}^{commit}`]);
	if (!branchTip.ok || !branchTip.stdout) {
		return {
			status: 'safe',
			reason: `remote branch ${remote}/${branch} does not exist yet`,
			commits: [],
		};
	}

	const baseTip = git(repo, ['rev-parse', '--verify', '--quiet', `${baseRef}^{commit}`]);
	if (!baseTip.ok || !baseTip.stdout) {
		return {
			status: 'blocked',
			reason: `could not resolve ${remote}/${base}; refusing to force-push without a comparison point`,
			commits: [],
		};
	}

	let mergeBase = git(repo, ['merge-base', baseTip.stdout, branchTip.stdout]);
	if ((!mergeBase.ok || !mergeBase.stdout) && opts.fetch && isShallow(repo)) {
		// A skipped bump is cheap, but silently skipping every bump because the
		// CI clone is too shallow to answer is not — pay for the full history once.
		git(repo, ['fetch', '--no-tags', '--quiet', '--unshallow', remote]);
		mergeBase = git(repo, ['merge-base', baseTip.stdout, branchTip.stdout]);
	}
	if (!mergeBase.ok || !mergeBase.stdout) {
		return {
			status: 'blocked',
			reason: `no merge-base between ${remote}/${base} and ${remote}/${branch}; refusing to force-push`,
			commits: [],
		};
	}

	const log = git(repo, [
		'log',
		'--format=%H %ae %ce %s',
		`${mergeBase.stdout}..${branchTip.stdout}`,
	]);
	if (!log.ok) {
		return {
			status: 'blocked',
			reason: `git log failed: ${log.stderr}`,
			commits: [],
		};
	}

	const commits = log.stdout
		? log.stdout.split('\n').map((line) => {
				const [sha, author, committer, ...rest] = line.split(' ');
				const subject = rest.join(' ');
				return { sha, author, committer, subject: subject ?? '' };
			})
		: [];

	if (commits.length === 0) {
		return {
			status: 'safe',
			reason: `${remote}/${branch} carries no commits beyond ${base}`,
			commits,
		};
	}

	if (commits.length > 1) {
		return {
			status: 'blocked',
			reason: `${remote}/${branch} carries ${commits.length} commits since its merge-base with ${base}; the bot only ever writes one`,
			commits,
		};
	}

	const [only] = commits;
	const authorIsBot = botEmails.has((only.author ?? '').toLowerCase());
	const committerIsBot = botEmails.has((only.committer ?? '').toLowerCase());
	if (!authorIsBot || !committerIsBot) {
		return {
			status: 'blocked',
			reason: `${remote}/${branch} tip ${only.sha.slice(0, 12)} was authored by ${only.author} and committed by ${only.committer}, not the bot`,
			commits,
		};
	}

	return {
		status: 'safe',
		reason: `${remote}/${branch} holds only the bot's own commit ${only.sha.slice(0, 12)}`,
		commits,
	};
}

function renderReport(opts, result) {
	const lines = [];
	lines.push(`### Auto-update branch left untouched`);
	lines.push('');
	lines.push(
		`A newer ${opts.what || 'upstream version'} is available, but \`${opts.branch}\` was **not** force-pushed:`,
	);
	lines.push('');
	lines.push(`> ${result.reason}`);
	lines.push('');
	if (result.commits.length > 0) {
		lines.push('Commits on the branch since its merge-base with `' + opts.base + '`:');
		lines.push('');
		for (const c of result.commits) {
			lines.push(`- \`${c.sha.slice(0, 12)}\` ${c.subject} — ${c.author}`);
		}
		lines.push('');
	}
	lines.push(
		'Rebase or merge the downstream work yourself, or close the PR and delete the branch to let the workflow regenerate it.',
	);
	return lines.join('\n');
}

function gh(args) {
	const res = spawnSync('gh', args, { encoding: 'utf8' });
	return {
		ok: res.status === 0,
		stdout: (res.stdout ?? '').trim(),
		stderr: (res.stderr ?? '').trim(),
	};
}

function postPrComment(opts, body) {
	const marker = `<!-- auto-update-guard:${opts.branch}:${opts.what} -->`;
	const list = gh(['pr', 'list', '--head', opts.branch, '--state', 'open', '--json', 'number']);
	if (!list.ok) {
		console.error(`could not list PRs for ${opts.branch}: ${list.stderr}`);
		return;
	}
	let number;
	try {
		number = JSON.parse(list.stdout || '[]')[0]?.number;
	} catch {
		number = undefined;
	}
	if (!number) {
		return;
	}
	const existing = gh(['pr', 'view', String(number), '--json', 'comments']);
	if (existing.ok) {
		try {
			const comments = JSON.parse(existing.stdout || '{}').comments ?? [];
			// One comment per (branch, version): the cron re-runs daily.
			if (comments.some((c) => (c.body ?? '').includes(marker))) {
				console.log(`PR #${number} already carries the guard notice; not commenting again.`);
				return;
			}
		} catch {
			/* fall through and comment */
		}
	}
	const res = gh(['pr', 'comment', String(number), '--body', `${marker}\n${body}`]);
	if (res.ok) {
		console.log(`Commented on PR #${number}.`);
	} else {
		console.error(`could not comment on PR #${number}: ${res.stderr}`);
	}
}

function main() {
	let opts;
	try {
		opts = parseArgs(process.argv.slice(2));
	} catch (err) {
		console.error(`bot-branch-guard: ${err.message}`);
		return EXIT_ERROR;
	}

	const result = inspectBranch(opts);
	console.log(`status=${result.status}: ${result.reason}`);
	for (const c of result.commits) {
		console.log(`  ${c.sha.slice(0, 12)} ${c.subject} (author=${c.author} committer=${c.committer})`);
	}

	if (process.env.GITHUB_OUTPUT) {
		appendFileSync(process.env.GITHUB_OUTPUT, `status=${result.status}\n`);
	}

	if (result.status === 'safe') {
		return EXIT_SAFE;
	}

	const report = renderReport(opts, result);
	if (process.env.GITHUB_STEP_SUMMARY) {
		appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
	}
	if (opts.reportPr) {
		postPrComment(opts, report);
	}
	return EXIT_BLOCKED;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
	process.exit(main());
}
