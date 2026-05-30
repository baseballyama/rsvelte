#!/usr/bin/env node
// ecosystem-ci issue notifier.
//
// Two responsibilities, both driven by the `ecosystem-ci.yml` workflow:
//
//   1. Maintain ONE long-lived "history" issue (tagged `ecosystem-ci-history`).
//      Title is rewritten on every run to `[ecosystem-ci] last: <emoji> <ts>`
//      so the issue list shows the latest status at a glance. Body keeps the
//      last 60 runs as a markdown table; older entries fall off the bottom.
//
//   2. On failure (any non-pass target, or the matrix itself failing), open a
//      NEW issue tagged `ecosystem-ci-failure` linking to the workflow run.
//      One issue per failure — operators dedupe by closing.
//
// Triggered only for schedule + workflow_dispatch events. PR runs already
// get a summary comment on the PR (see `ecosystem-ci.yml::summary`), so we
// skip them to keep the history issue signal-to-noise high.
//
// Reads result JSONs from `compat/ecosystem-ci/results/` (downloaded by the
// `summary` job from per-target artifacts). Uses `gh` CLI for API calls so
// no Node `@octokit` dependency is needed; `GH_TOKEN` must be in env.
//
// Usage:
//   node scripts/ecosystem/ecosystem-ci-issues.mjs
//
// Required env (all provided by GitHub Actions):
//   GH_TOKEN
//   GITHUB_REPOSITORY            owner/repo
//   GITHUB_RUN_ID
//   GITHUB_RUN_NUMBER
//   GITHUB_SERVER_URL
//   GITHUB_WORKFLOW
//   GITHUB_EVENT_NAME            schedule | workflow_dispatch | pull_request
//   GITHUB_SHA
// Optional:
//   GITHUB_REF_NAME
//   MATRIX_RESULT                workflow-level result of the `run` job
//   DISPATCH_TARGET              workflow_dispatch input.target (if any)
//   DISPATCH_TAG                 workflow_dispatch input.tag (if any)

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const RESULTS_DIR = path.join(ROOT, 'compat', 'ecosystem-ci', 'results');

const HISTORY_LABEL = 'ecosystem-ci-history';
const FAILURE_LABEL = 'ecosystem-ci-failure';
const HISTORY_MAX_ROWS = 60;
const HISTORY_MARK_BEGIN = '<!-- ecosystem-ci-history v1 BEGIN -->';
const HISTORY_MARK_END = '<!-- ecosystem-ci-history v1 END -->';
const HISTORY_DATA_PREFIX = '<!-- DATA:';
const HISTORY_DATA_SUFFIX = ' -->';

function log(msg) {
	console.log(`[ecosystem-ci-issues] ${msg}`);
}

function gh(args, opts = {}) {
	const res = spawnSync('gh', args, { encoding: 'utf8', ...opts });
	if (res.status !== 0) {
		const cmd = ['gh', ...args].join(' ');
		throw new Error(
			`gh failed (${res.status}): ${cmd}\nstdout: ${res.stdout}\nstderr: ${res.stderr}`,
		);
	}
	return res.stdout ?? '';
}

function ghMaybe(args) {
	const res = spawnSync('gh', args, { encoding: 'utf8' });
	return { status: res.status ?? 1, stdout: res.stdout ?? '', stderr: res.stderr ?? '' };
}

function loadResults() {
	if (!fs.existsSync(RESULTS_DIR)) return [];
	return fs
		.readdirSync(RESULTS_DIR)
		.filter((f) => f.endsWith('.json'))
		.map((f) => {
			try {
				return JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, f), 'utf8'));
			} catch (e) {
				log(`failed to parse ${f}: ${e.message}`);
				return null;
			}
		})
		.filter(Boolean);
}

// Aggregate per-target results into one verdict. Order: regression beats
// other failures so the summary reports the worst observable outcome.
function classify(results, matrixResult) {
	const counts = {
		total: results.length,
		pass: 0,
		regression: 0,
		baselineFailure: 0,
		swapFailure: 0,
		installFailure: 0,
		other: 0,
	};
	for (const r of results) {
		switch (r.result) {
			case 'pass':
				counts.pass++;
				break;
			case 'regression':
				counts.regression++;
				break;
			case 'baseline-failure':
				counts.baselineFailure++;
				break;
			case 'swap-failure':
				counts.swapFailure++;
				break;
			case 'rsvelte-install-failure':
				counts.installFailure++;
				break;
			default:
				counts.other++;
		}
	}
	// If the matrix workflow reports failure but no result files arrived
	// (artifact upload skipped, runner crashed, etc.), treat as failure.
	const matrixFailure = matrixResult === 'failure' || matrixResult === 'cancelled';
	const anyTargetFailed =
		counts.regression +
			counts.baselineFailure +
			counts.swapFailure +
			counts.installFailure +
			counts.other >
		0;
	const ok = !matrixFailure && counts.total > 0 && !anyTargetFailed;
	return { counts, ok, matrixFailure, anyTargetFailed };
}

function fmtTimestamp(d) {
	// 2026-05-30 12:00 UTC — short enough for issue titles, sortable.
	const pad = (n) => String(n).padStart(2, '0');
	return (
		`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
		`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
	);
}

function describeTrigger(eventName, dispatchTarget, dispatchTag) {
	if (eventName === 'schedule') return 'schedule';
	if (eventName === 'workflow_dispatch') {
		if (dispatchTarget) return `dispatch (target=${dispatchTarget})`;
		if (dispatchTag) return `dispatch (tag=${dispatchTag})`;
		return 'dispatch';
	}
	return eventName;
}

function statusEmoji(ok, hasResults) {
	if (!hasResults) return '⚠️';
	return ok ? '✅' : '❌';
}

// History issue body uses a fenced data block so we can round-trip prior
// rows without re-fetching artifacts from old runs. The visible markdown
// table is generated from the same data.
function renderHistoryBody(entries, nowIso) {
	const rows = entries.slice(0, HISTORY_MAX_ROWS);
	const data = Buffer.from(JSON.stringify(rows)).toString('base64');

	const table = [
		'| When (UTC) | Trigger | Result | Pass/Total | Workflow run |',
		'|---|---|---|---|---|',
		...rows.map((r) => {
			const runLink = r.runUrl ? `[#${r.runNumber ?? '?'}](${r.runUrl})` : '-';
			const passTotal =
				r.counts && typeof r.counts.total === 'number'
					? `${r.counts.pass}/${r.counts.total}`
					: '-';
			return `| ${r.when ?? '-'} | ${r.trigger ?? '-'} | ${r.emoji ?? '-'} ${r.label ?? ''} | ${passTotal} | ${runLink} |`;
		}),
	].join('\n');

	return [
		HISTORY_MARK_BEGIN,
		`${HISTORY_DATA_PREFIX}${data}${HISTORY_DATA_SUFFIX}`,
		'',
		`_Last updated: ${nowIso}_`,
		'',
		`Tracking the most recent ${HISTORY_MAX_ROWS} runs of \`ecosystem-ci\`. ` +
			'Updated automatically by `scripts/ecosystem/ecosystem-ci-issues.mjs`. ' +
			'Do not edit this issue by hand — edits inside the data block are overwritten.',
		'',
		table,
		'',
		HISTORY_MARK_END,
	].join('\n');
}

function parseHistoryBody(body) {
	if (!body) return [];
	const begin = body.indexOf(HISTORY_MARK_BEGIN);
	const end = body.indexOf(HISTORY_MARK_END);
	if (begin < 0 || end < 0) return [];
	const block = body.slice(begin, end);
	const dataStart = block.indexOf(HISTORY_DATA_PREFIX);
	if (dataStart < 0) return [];
	const dataEnd = block.indexOf(HISTORY_DATA_SUFFIX, dataStart);
	if (dataEnd < 0) return [];
	const b64 = block.slice(dataStart + HISTORY_DATA_PREFIX.length, dataEnd).trim();
	try {
		const decoded = Buffer.from(b64, 'base64').toString('utf8');
		const parsed = JSON.parse(decoded);
		return Array.isArray(parsed) ? parsed : [];
	} catch (e) {
		log(`history: failed to decode prior data (${e.message}), starting fresh`);
		return [];
	}
}

function ensureLabel(repo, name, color, description) {
	// gh label create exits non-zero if the label exists; we treat that as fine.
	const res = ghMaybe([
		'label',
		'create',
		name,
		'--repo',
		repo,
		'--color',
		color,
		'--description',
		description,
	]);
	if (res.status !== 0 && !/already exists/i.test(res.stderr)) {
		log(`warn: label create '${name}' returned ${res.status}: ${res.stderr.trim()}`);
	}
}

function findHistoryIssue(repo) {
	// Pull the most recently updated open or closed issue with our label.
	// We prefer open so a manual close doesn't permanently divert updates
	// to a new issue — if the operator wants a fresh history, they can
	// remove the label.
	const stdout = gh([
		'issue',
		'list',
		'--repo',
		repo,
		'--label',
		HISTORY_LABEL,
		'--state',
		'all',
		'--limit',
		'5',
		'--json',
		'number,state,title,body,updatedAt',
	]);
	const issues = JSON.parse(stdout || '[]');
	if (issues.length === 0) return null;
	const open = issues.find((i) => i.state === 'OPEN');
	return open ?? issues[0];
}

async function upsertHistoryIssue(repo, entry) {
	ensureLabel(
		repo,
		HISTORY_LABEL,
		'ededed',
		'ecosystem-ci execution history (single rolling issue)',
	);

	const existing = findHistoryIssue(repo);
	const prior = existing ? parseHistoryBody(existing.body ?? '') : [];
	const entries = [entry, ...prior].slice(0, HISTORY_MAX_ROWS);

	const title = `[ecosystem-ci] last: ${entry.emoji} ${entry.when}`;
	const body = renderHistoryBody(entries, new Date().toISOString());

	if (!existing) {
		log('history: creating new issue');
		const out = gh([
			'issue',
			'create',
			'--repo',
			repo,
			'--title',
			title,
			'--body',
			body,
			'--label',
			HISTORY_LABEL,
		]);
		log(`history: created -> ${out.trim()}`);
		return;
	}

	log(`history: updating issue #${existing.number}`);
	if (existing.state === 'CLOSED') {
		ghMaybe(['issue', 'reopen', String(existing.number), '--repo', repo]);
	}
	gh([
		'issue',
		'edit',
		String(existing.number),
		'--repo',
		repo,
		'--title',
		title,
		'--body',
		body,
	]);
	log(`history: updated #${existing.number}`);
}

function renderFailureBody(ctx, results, summary) {
	const { runUrl, runNumber, workflow, eventName, trigger, sha, refName } = ctx;
	const lines = [];
	lines.push(`**Workflow run:** [${workflow} #${runNumber}](${runUrl})`);
	lines.push(`**Trigger:** ${trigger} (event: \`${eventName}\`)`);
	if (refName) lines.push(`**Ref:** \`${refName}\``);
	if (sha) lines.push(`**Commit:** \`${sha}\``);
	lines.push('');
	lines.push(
		`**Result:** ${summary.counts.pass}/${summary.counts.total} targets passed.`,
	);
	if (summary.matrixFailure) {
		lines.push('');
		lines.push(
			'> ⚠️ The workflow-level matrix reported failure (e.g. a runner crashed ' +
				'or artifacts were missing). The breakdown below is best-effort from ' +
				'whatever result JSONs were uploaded.',
		);
	}
	lines.push('');
	lines.push('### Per-target results');
	lines.push('');
	if (results.length === 0) {
		lines.push('_No per-target result JSONs were uploaded._');
	} else {
		lines.push('| Target | Result | Target SHA | rsvelte SHA |');
		lines.push('|---|---|---|---|');
		const sorted = [...results].sort((a, b) => {
			const score = (r) => (r.result === 'pass' ? 1 : 0);
			return score(a) - score(b) || a.name.localeCompare(b.name);
		});
		for (const r of sorted) {
			const emoji = r.result === 'pass' ? '✅' : '❌';
			lines.push(
				`| ${r.name} | ${emoji} ${r.result ?? '?'} | \`${(r.targetSha ?? '').slice(0, 8)}\` | \`${(r.rsvelteSha ?? '').slice(0, 8)}\` |`,
			);
		}
	}
	lines.push('');
	lines.push('### Debugging');
	lines.push('');
	lines.push(
		'- Open the workflow run linked above and download the `logs-<target>` artifact for each failing target.',
	);
	lines.push(
		'- Result JSONs are uploaded as `result-<target>` artifacts and aggregate at the bottom of the `summary` job log.',
	);
	lines.push(
		`- Rolling history of every run lives in the [\`${HISTORY_LABEL}\`](../labels/${HISTORY_LABEL}) issue.`,
	);
	lines.push('');
	lines.push(
		'_This issue was opened automatically by `scripts/ecosystem/ecosystem-ci-issues.mjs`. ' +
			'Close it once the failure is triaged._',
	);
	return lines.join('\n');
}

async function createFailureIssue(repo, ctx, results, summary) {
	ensureLabel(
		repo,
		FAILURE_LABEL,
		'd73a4a',
		'ecosystem-ci failure notification (one issue per failed run)',
	);
	const title = `[ecosystem-ci] failure: run #${ctx.runNumber} (${ctx.when})`;
	const body = renderFailureBody(ctx, results, summary);
	const out = gh([
		'issue',
		'create',
		'--repo',
		repo,
		'--title',
		title,
		'--body',
		body,
		'--label',
		FAILURE_LABEL,
	]);
	log(`failure: created -> ${out.trim()}`);
}

async function main() {
	const repo = process.env.GITHUB_REPOSITORY;
	const eventName = process.env.GITHUB_EVENT_NAME;
	if (!repo) {
		console.error('GITHUB_REPOSITORY not set');
		process.exit(2);
	}
	if (eventName === 'pull_request') {
		log('skipping: pull_request runs notify via PR comment, not issues');
		return 0;
	}
	if (eventName !== 'schedule' && eventName !== 'workflow_dispatch') {
		log(`skipping: unsupported event ${eventName}`);
		return 0;
	}
	if (!process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) {
		console.error('GH_TOKEN / GITHUB_TOKEN not set');
		process.exit(2);
	}

	const results = loadResults();
	const matrixResult = process.env.MATRIX_RESULT ?? '';
	const summary = classify(results, matrixResult);

	const serverUrl = process.env.GITHUB_SERVER_URL ?? 'https://github.com';
	const runId = process.env.GITHUB_RUN_ID ?? '';
	const runNumber = process.env.GITHUB_RUN_NUMBER ?? '';
	const runUrl = runId ? `${serverUrl}/${repo}/actions/runs/${runId}` : '';
	const now = new Date();
	const when = fmtTimestamp(now);
	const trigger = describeTrigger(
		eventName,
		process.env.DISPATCH_TARGET ?? '',
		process.env.DISPATCH_TAG ?? '',
	);
	const emoji = statusEmoji(summary.ok, results.length > 0);
	const resultLabel = summary.ok
		? `pass (${summary.counts.pass}/${summary.counts.total})`
		: summary.matrixFailure && results.length === 0
			? 'matrix failure'
			: `fail (${summary.counts.pass}/${summary.counts.total})`;

	const ctx = {
		when,
		runUrl,
		runNumber,
		workflow: process.env.GITHUB_WORKFLOW ?? 'ecosystem-ci',
		eventName,
		trigger,
		sha: process.env.GITHUB_SHA ?? '',
		refName: process.env.GITHUB_REF_NAME ?? '',
	};

	const historyEntry = {
		when,
		trigger,
		emoji,
		label: resultLabel,
		runNumber,
		runUrl,
		counts: summary.counts,
		event: eventName,
	};

	await upsertHistoryIssue(repo, historyEntry);

	if (!summary.ok) {
		await createFailureIssue(repo, ctx, results, summary);
	} else {
		log('all targets pass — no failure issue created');
	}
	return 0;
}

main().then(
	(code) => process.exit(code ?? 0),
	(e) => {
		console.error(e?.stack ?? e);
		process.exit(1);
	},
);
