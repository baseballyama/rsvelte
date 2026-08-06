#!/usr/bin/env node
// Self-test for scripts/ci/bot-branch-guard.mjs.
//
// Builds real git repositories (a bare "origin" plus a working clone) and
// replays the histories the auto-update workflows actually meet, including the
// one that destroyed 15 hand-written commits: a bot branch that a human rebased
// onto a freshly regenerated bot commit. Everything runs offline against local
// paths, so this is cheap enough to gate every PR.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const GUARD = join(HERE, 'bot-branch-guard.mjs');

const BOT_NAME = 'github-actions[bot]';
const BOT_EMAIL = '41898282+github-actions[bot]@users.noreply.github.com';
const HUMAN_NAME = 'A Human';
const HUMAN_EMAIL = 'human@example.com';

// The repo configures core.hooksPath globally; the throwaway fixtures must not inherit it.
const CLEAN_GIT_ENV = { GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null' };

function git(cwd, args, env = {}) {
	const res = spawnSync('git', ['-c', 'core.hooksPath=', ...args], {
		cwd,
		encoding: 'utf8',
		env: { ...process.env, ...CLEAN_GIT_ENV, ...env },
	});
	if (res.status !== 0) {
		throw new Error(`git ${args.join(' ')} failed in ${cwd}:\n${res.stderr}`);
	}
	return (res.stdout ?? '').trim();
}

function commit(repo, { file, message, author }) {
	writeFileSync(join(repo, file), `${message}\n`);
	git(repo, ['add', file]);
	const ident =
		author === 'bot'
			? { name: BOT_NAME, email: BOT_EMAIL }
			: { name: HUMAN_NAME, email: HUMAN_EMAIL };
	git(repo, ['commit', '-m', message], {
		GIT_AUTHOR_NAME: ident.name,
		GIT_AUTHOR_EMAIL: ident.email,
		GIT_COMMITTER_NAME: ident.name,
		GIT_COMMITTER_EMAIL: ident.email,
		GIT_AUTHOR_DATE: '2026-01-01T00:00:00Z',
		GIT_COMMITTER_DATE: '2026-01-01T00:00:00Z',
	});
}

/** Fresh origin+clone with a `main` holding one commit. */
function makeRepo() {
	const root = mkdtempSync(join(tmpdir(), 'bot-branch-guard-'));
	const origin = join(root, 'origin.git');
	const work = join(root, 'work');
	git(root, ['init', '--bare', '--initial-branch=main', origin]);
	git(root, ['clone', origin, work]);
	git(work, ['config', 'user.name', HUMAN_NAME]);
	git(work, ['config', 'user.email', HUMAN_EMAIL]);
	commit(work, { file: 'README.md', message: 'initial', author: 'human' });
	git(work, ['push', 'origin', 'main']);
	return { root, origin, work };
}

function runGuard(work, branch, extra = []) {
	const res = spawnSync(
		process.execPath,
		[GUARD, '--repo', work, '--branch', branch, '--base', 'main', ...extra],
		{
			cwd: work,
			encoding: 'utf8',
			env: { ...process.env, ...CLEAN_GIT_ENV, GITHUB_OUTPUT: '', GITHUB_STEP_SUMMARY: '' },
		},
	);
	return { code: res.status, out: `${res.stdout ?? ''}${res.stderr ?? ''}` };
}

const cases = [];
function test(name, fn) {
	cases.push({ name, fn });
}

test('remote branch does not exist yet', ({ work }) => {
	const r = runGuard(work, 'chore/update-oxfmt-0.62.0');
	assert(r.code === 0, `expected safe, got ${r.code}: ${r.out}`);
});

test('branch holds only the bot commit', ({ work }) => {
	git(work, ['checkout', '-B', 'bump']);
	commit(work, { file: 'v.txt', message: 'chore(deps): update oxfmt to 0.62.0', author: 'bot' });
	git(work, ['push', 'origin', 'bump']);
	const r = runGuard(work, 'bump');
	assert(r.code === 0, `expected safe, got ${r.code}: ${r.out}`);
});

test('branch is identical to main', ({ work }) => {
	git(work, ['checkout', '-B', 'bump', 'main']);
	git(work, ['push', 'origin', 'bump']);
	const r = runGuard(work, 'bump');
	assert(r.code === 0, `expected safe, got ${r.code}: ${r.out}`);
});

test('main advanced while the bot branch stayed put', ({ work }) => {
	git(work, ['checkout', '-B', 'bump', 'main']);
	commit(work, { file: 'v.txt', message: 'chore(deps): update oxfmt to 0.62.0', author: 'bot' });
	git(work, ['push', 'origin', 'bump']);
	git(work, ['checkout', 'main']);
	commit(work, { file: 'other.txt', message: 'unrelated main work', author: 'human' });
	git(work, ['push', 'origin', 'main']);
	const r = runGuard(work, 'bump');
	assert(r.code === 0, `expected safe (merge-base, not ancestry), got ${r.code}: ${r.out}`);
});

test('human pushed a commit on top of the bot commit', ({ work }) => {
	git(work, ['checkout', '-B', 'bump', 'main']);
	commit(work, { file: 'v.txt', message: 'chore(deps): update oxfmt to 0.62.0', author: 'bot' });
	commit(work, { file: 'fix.rs', message: 'fix(compiler): oxc 0.143 AST migration', author: 'human' });
	git(work, ['push', 'origin', 'bump']);
	const r = runGuard(work, 'bump');
	assert(r.code === 3, `expected blocked, got ${r.code}: ${r.out}`);
	assert(r.out.includes('2 commits'), `expected the count in the reason: ${r.out}`);
});

// The exact state the next cron run sees after a human rescued their work.
test('human work rebased onto a newly regenerated bot commit', ({ work }) => {
	git(work, ['checkout', '-B', 'bump', 'main']);
	commit(work, { file: 'v.txt', message: 'chore(deps): update oxfmt to 0.62.0', author: 'bot' });
	const oldBotCommit = git(work, ['rev-parse', 'HEAD']);
	for (let i = 1; i <= 15; i++) {
		commit(work, { file: `hand-${i}.rs`, message: `fix(compiler): burn-down step ${i}`, author: 'human' });
	}
	git(work, ['push', 'origin', 'bump']);

	// The bot regenerates its commit from main; the human rebases on top of it.
	git(work, ['checkout', '-B', 'regen', 'main']);
	commit(work, { file: 'v.txt', message: 'chore(deps): update oxfmt to 0.63.0', author: 'bot' });
	git(work, ['checkout', 'bump']);
	git(work, ['rebase', '--onto', 'regen', oldBotCommit, 'bump']);
	git(work, ['push', '--force', 'origin', 'bump']);
	assert(
		git(work, ['rev-list', '--count', `main..bump`]) === '16',
		'expected 16 commits on the rebased branch',
	);

	const r = runGuard(work, 'bump');
	assert(r.code === 3, `expected blocked after rebase, got ${r.code}: ${r.out}`);
});

test('single commit authored by the bot but amended by a human', ({ work }) => {
	git(work, ['checkout', '-B', 'bump', 'main']);
	commit(work, { file: 'v.txt', message: 'chore(deps): update oxfmt to 0.62.0', author: 'bot' });
	writeFileSync(join(work, 'v.txt'), 'hand-edited\n');
	git(work, ['add', 'v.txt']);
	git(work, ['commit', '--amend', '--no-edit'], {
		GIT_COMMITTER_NAME: HUMAN_NAME,
		GIT_COMMITTER_EMAIL: HUMAN_EMAIL,
	});
	git(work, ['push', '--force', 'origin', 'bump']);
	const r = runGuard(work, 'bump');
	assert(r.code === 3, `expected blocked on committer mismatch, got ${r.code}: ${r.out}`);
});

// actions/checkout defaults to fetch-depth: 1, so this is the shape CI actually runs in.
function shallowClone({ root, origin }) {
	const shallow = join(root, 'shallow');
	git(root, ['clone', '--depth=1', `file://${origin}`, shallow]);
	assert(
		git(shallow, ['rev-parse', '--is-shallow-repository']) === 'true',
		'expected a shallow clone',
	);
	return shallow;
}

test('shallow CI clone: bot-only branch is still recognised as safe', (repo) => {
	const { work } = repo;
	for (let i = 0; i < 5; i++) {
		commit(work, { file: `main-${i}.txt`, message: `main work ${i}`, author: 'human' });
	}
	git(work, ['push', 'origin', 'main']);
	git(work, ['checkout', '-B', 'bump', 'main']);
	commit(work, { file: 'v.txt', message: 'chore(deps): update oxfmt to 0.62.0', author: 'bot' });
	git(work, ['push', 'origin', 'bump']);
	const r = runGuard(shallowClone(repo), 'bump');
	assert(r.code === 0, `expected safe from a shallow clone, got ${r.code}: ${r.out}`);
});

test('shallow CI clone: downstream commits are still detected', (repo) => {
	const { work } = repo;
	for (let i = 0; i < 5; i++) {
		commit(work, { file: `main-${i}.txt`, message: `main work ${i}`, author: 'human' });
	}
	git(work, ['push', 'origin', 'main']);
	git(work, ['checkout', '-B', 'bump', 'main']);
	commit(work, { file: 'v.txt', message: 'chore(deps): update oxfmt to 0.62.0', author: 'bot' });
	commit(work, { file: 'fix.rs', message: 'fix(compiler): hand-written work', author: 'human' });
	git(work, ['push', 'origin', 'bump']);
	const r = runGuard(shallowClone(repo), 'bump');
	assert(r.code === 3, `expected blocked from a shallow clone, got ${r.code}: ${r.out}`);
});

test('single commit written entirely by a human', ({ work }) => {
	git(work, ['checkout', '-B', 'bump', 'main']);
	commit(work, { file: 'v.txt', message: 'chore(deps): update oxfmt to 0.62.0', author: 'human' });
	git(work, ['push', 'origin', 'bump']);
	const r = runGuard(work, 'bump');
	assert(r.code === 3, `expected blocked on author mismatch, got ${r.code}: ${r.out}`);
});

function assert(cond, msg) {
	if (!cond) {
		throw new Error(msg);
	}
}

let failed = 0;
for (const { name, fn } of cases) {
	const repo = makeRepo();
	try {
		fn(repo);
		console.log(`ok   ${name}`);
	} catch (err) {
		failed++;
		console.error(`FAIL ${name}\n     ${err.message}`);
	} finally {
		rmSync(repo.root, { recursive: true, force: true });
	}
}

if (failed > 0) {
	console.error(`\n${failed}/${cases.length} bot-branch-guard tests failed`);
	process.exit(1);
}
console.log(`\n${cases.length}/${cases.length} bot-branch-guard tests passed`);
