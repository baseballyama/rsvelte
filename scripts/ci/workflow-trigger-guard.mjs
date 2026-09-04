#!/usr/bin/env node
// Fail when a workflow filters its `pull_request:` trigger by base branch
// without an allowlist entry explaining why.
//
// A `branches:` filter under `pull_request:` means the workflow does not run on
// a PR based on anything but the listed branch. On a stacked PR that is not a
// red check — it is an *absent* check, which at a glance is indistinguishable
// from one that passed. #2405 shipped a stacked PR reporting green with 27 of
// 35 checks missing for exactly this reason.
//
// The axis: a base-branch filter is correct exactly when the workflow measures
// against a `main` baseline, because such a run is meaningless off a different
// base. Everything else must run wherever the PR is based.
//
// This guard does NOT establish that an unfiltered workflow is *correct* off a
// non-main base — that depends on the workflow's own logic (`changeset.yml` is
// safe only because its gate diffs against `git merge-base HEAD origin/main`
// rather than the PR base; see #1799). It answers two questions: is every
// base-branch filter on the `pull_request` trigger deliberate and explained, and
// can any cancelling `concurrency:` group — workflow-level or job-level — be
// shared by two pushes to one branch?
//
// Exit codes: 0 = clean, 2 = violations found, 1 = internal/parse error.

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_WORKFLOW_DIR = join(HERE, '..', '..', '.github', 'workflows');

const EXIT_CLEAN = 0;
const EXIT_ERROR = 1;
const EXIT_VIOLATIONS = 2;

// Triggers that fire on a pull request and therefore contribute to its check
// set. `pull_request_target` is included on the same axis: nothing uses it
// today, and this is what stops the next one being added filtered.
const PR_TRIGGERS = ['pull_request', 'pull_request_target'];

// Keys that restrict a trigger to particular base branches.
const BRANCH_FILTER_KEYS = ['branches', 'branches-ignore'];

// A concurrency group must contain one of these to vary between two pushes to
// the same branch. `github.ref` does not: it is `refs/heads/main` for every
// merge, so a ref-keyed cancelling group makes each merge kill its predecessor.
const PER_PUSH_CONTEXTS = ['github.sha', 'github.run_id'];

// A cancelling group must also contain this to vary between two EVENTS at one
// commit. `github.head_ref || github.sha` does not: on `main` a `push` and a
// `schedule` both fall through to the same `github.sha`, so the nightly kills
// the merge's own run and the merge commit carries a `cancelled` verdict.
const EVENT_CONTEXT = 'github.event_name';

/**
 * Workflows permitted to filter their PR trigger by base branch, each with the
 * reason. The reason is the point of the list: without it the intent survives
 * only as an absence from whichever PR last touched the triggers.
 *
 * @type {Record<string, string>}
 */
export const ALLOWLIST = {
	'benchmark.yml':
		'Compares timings against a main baseline; a run off another base measures against the wrong reference.',
	'codspeed.yml':
		'Uploads to CodSpeed, which tracks the main branch as its baseline; a non-main base pollutes the series.',
	'coverage.yml':
		'Reports coverage as a delta against main; the delta is meaningless when the base is not main.',
};

/**
 * Jobs permitted a ref-keyed cancelling `concurrency:` of their own, keyed
 * `file.yml` -> job id -> reason.
 *
 * The exemption is not "it is a job rather than a workflow" — the mechanism is
 * identical one level down. It is that the job converges: it drives a single
 * mutable target (a pull request, a deployment) where the newest commit's run
 * subsumes every older one, so a superseded run destroys no verdict. A job that
 * *reports* on the commit it was started for can never qualify.
 *
 * @type {Record<string, Record<string, string>>}
 */
export const JOB_CONCURRENCY_ALLOWLIST = {
	'release.yml': {
		'version-pr':
			'Refreshes the single "Version Packages" PR from the tip of main; a newer push already contains the older push\'s changesets, so superseding is the intended behaviour.',
		'close-version-cycle':
			'Shares the version-PR group precisely so a publish commit supersedes an in-flight updater before it can reopen the PR from stale state.',
	},
	'deploy-docs.yml': {
		build:
			'Builds the single GitHub Pages site; only the newest main commit can be deployed, and a build break survives into the next push\'s run.',
	},
};

/** Strip a trailing `# comment` that is not inside quotes. */
function stripComment(line) {
	let quote = null;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (quote) {
			if (ch === quote) quote = null;
		} else if (ch === '"' || ch === "'") {
			quote = ch;
		} else if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))) {
			return line.slice(0, i);
		}
	}
	return line;
}

function indentOf(line) {
	return line.length - line.trimStart().length;
}

function isBlank(line) {
	return line.trim() === '' || line.trimStart().startsWith('#');
}

/** `foo:` / `"on":` / `- name: x` → the key, else null. Block mappings only. */
function keyOf(line) {
	const m = /^\s*(?:"([^"]+)"|'([^']+)'|([^\s:#][^:#]*?))\s*:(?:\s|$)/.exec(stripComment(line));
	if (!m) return null;
	return (m[1] ?? m[2] ?? m[3]).trim();
}

/** Value text after `key:` on the same line, comment-stripped. */
function inlineValueOf(line) {
	const stripped = stripComment(line);
	const idx = stripped.indexOf(':');
	return idx === -1 ? '' : stripped.slice(idx + 1).trim();
}

/**
 * Direct children of the block that starts after `startIndex`, whose parent key
 * sits at `parentIndent`. Returns `[{ key, line, index }]`.
 */
function directChildren(lines, startIndex, parentIndent) {
	const children = [];
	let childIndent = null;
	for (let i = startIndex; i < lines.length; i++) {
		const line = lines[i];
		if (isBlank(line)) continue;
		const indent = indentOf(line);
		if (indent <= parentIndent) break;
		if (childIndent === null) childIndent = indent;
		if (indent > childIndent) continue;
		const key = keyOf(line);
		if (key !== null) children.push({ key, line, index: i });
	}
	return children;
}

/** Read the `group:` / `cancel-in-progress:` under a `concurrency:` at `index`. */
function readConcurrency(lines, index) {
	const block = { group: '', cancels: false };
	for (const child of directChildren(lines, index + 1, indentOf(lines[index]))) {
		const value = inlineValueOf(child.line);
		if (child.key === 'group') block.group = value;
		if (child.key === 'cancel-in-progress') block.cancels = value === 'true';
	}
	return block;
}

/**
 * Parse one workflow's PR-trigger branch filters.
 *
 * @returns {{triggers: Array<{trigger: string, filters: string[]}>}}
 * @throws when the `on:` block cannot be located — unparseable fails closed
 *   rather than reporting "no filter found".
 */
export function analyzeWorkflow(source, { name = '<source>' } = {}) {
	const lines = source.split('\n');

	if (lines.some((l) => /^\t/.test(l))) {
		throw new Error(`${name}: tab indentation is not valid workflow YAML`);
	}

	const onIndex = lines.findIndex((l) => indentOf(l) === 0 && keyOf(l) === 'on');
	if (onIndex === -1) {
		throw new Error(`${name}: no top-level \`on:\` trigger block found`);
	}

	// `on: [push, pull_request]` or `on: push` — no room for a branch filter.
	if (inlineValueOf(lines[onIndex]) !== '') {
		return { triggers: [] };
	}

	// Every trigger under `on:`, not only the PR ones. The per-push rule below
	// asks whether one event can collide with itself; this list is what says
	// whether two DIFFERENT events can, which no amount of per-push keying fixes.
	const nonPrTriggers = directChildren(lines, onIndex + 1, 0)
		.map((c) => c.key)
		.filter((k) => !PR_TRIGGERS.includes(k));

	const triggers = [];
	for (const trigger of directChildren(lines, onIndex + 1, 0)) {
		if (!PR_TRIGGERS.includes(trigger.key)) continue;
		// `pull_request:` with nothing nested (ci.yml's shape) has no filter.
		if (inlineValueOf(trigger.line) !== '') {
			triggers.push({ trigger: trigger.key, filters: [] });
			continue;
		}
		const filters = directChildren(lines, trigger.index + 1, indentOf(trigger.line))
			.map((c) => c.key)
			.filter((k) => BRANCH_FILTER_KEYS.includes(k));
		triggers.push({ trigger: trigger.key, filters });
	}

	const pushes = directChildren(lines, onIndex + 1, 0).some((c) => c.key === 'push');

	const concIndex = lines.findIndex((l) => indentOf(l) === 0 && keyOf(l) === 'concurrency');
	const concurrency = concIndex === -1 ? null : readConcurrency(lines, concIndex);

	// Job-level groups are the same mechanism one level down, so they are read
	// separately rather than folded into the workflow-level one.
	const jobs = [];
	const jobsIndex = lines.findIndex((l) => indentOf(l) === 0 && keyOf(l) === 'jobs');
	if (jobsIndex !== -1) {
		for (const job of directChildren(lines, jobsIndex + 1, 0)) {
			const child = directChildren(lines, job.index + 1, indentOf(job.line)).find(
				(c) => c.key === 'concurrency',
			);
			if (child) jobs.push({ id: job.key, concurrency: readConcurrency(lines, child.index) });
		}
	}

	return { triggers, nonPrTriggers, pushes, concurrency, jobs };
}

/** True when two pushes to one branch would share this cancelling group. */
function collidesAcrossPushes(concurrency) {
	return (
		concurrency?.cancels === true &&
		!PER_PUSH_CONTEXTS.some((ctx) => concurrency.group.includes(ctx))
	);
}

/**
 * True when two DIFFERENT events at one commit would share this cancelling
 * group. Only a workflow with two or more non-`pull_request` triggers can reach
 * it: a `pull_request` keys on `github.head_ref`, which no other event sets.
 */
function collidesAcrossEvents(concurrency, nonPrTriggers) {
	return (
		concurrency?.cancels === true &&
		(nonPrTriggers ?? []).length > 1 &&
		!concurrency.group.includes(EVENT_CONTEXT)
	);
}

const EVENT_EXPLANATION =
	'`github.head_ref` is empty for every event but a pull request, so `${{ github.head_ref || ' +
	'github.sha }}` resolves to the same commit for a `push`, a `schedule` and a ' +
	'`workflow_dispatch` on one ref — one group, and the later event cancels the earlier run. ' +
	'Measured 2026-09-04: the nightly `Corpus Compat` firing at 20:33:28Z cancelled the merge\'s ' +
	'own run at 20:33:47Z, leaving `main` with a `cancelled` verdict that reads exactly like a ' +
	'red one. Add `${{ github.event_name }}` to the group, or set `cancel-in-progress: false`.';

const VERDICT_EXPLANATION =
	'Every push to a branch shares one `github.ref`, so each merge cancels its predecessor and the ' +
	'branch carries no verdict — which reads exactly like a green one (#2435/#2593). Key the group ' +
	'by `${{ github.head_ref || github.sha }}` so pushes cannot collide, or set ' +
	'`cancel-in-progress: false`.';

/**
 * @returns {{violations: Array<{file: string, message: string}>, checked: number}}
 */
export function checkWorkflows(
	dir,
	allowlist = ALLOWLIST,
	jobAllowlist = JOB_CONCURRENCY_ALLOWLIST,
) {
	const files = readdirSync(dir)
		.filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
		.sort();
	if (files.length === 0) {
		throw new Error(`no workflow files found in ${dir}`);
	}

	const violations = [];
	const filtered = new Set();
	const collidingJobs = new Map();

	for (const file of files) {
		const source = readFileSync(join(dir, file), 'utf8');
		const { triggers, nonPrTriggers, pushes, concurrency, jobs } = analyzeWorkflow(source, {
			name: file,
		});

		if (collidesAcrossEvents(concurrency, nonPrTriggers)) {
			violations.push({
				file,
				message:
					`\`concurrency.group\` is \`${concurrency.group}\` with \`cancel-in-progress: true\`, ` +
					`but this workflow runs on \`${(nonPrTriggers ?? []).join('`, `')}\`. ${EVENT_EXPLANATION}`,
			});
		}

		if (pushes && collidesAcrossPushes(concurrency)) {
			violations.push({
				file,
				message:
					`\`concurrency.group\` is \`${concurrency.group}\` with \`cancel-in-progress: true\`, ` +
					`but this workflow runs on \`push\`. ${VERDICT_EXPLANATION}`,
			});
		}

		if (pushes) {
			const colliding = jobs.filter((j) => collidesAcrossPushes(j.concurrency));
			if (colliding.length > 0) collidingJobs.set(file, new Set(colliding.map((j) => j.id)));
			for (const job of colliding) {
				if (Object.hasOwn(jobAllowlist[file] ?? {}, job.id)) continue;
				violations.push({
					file,
					message:
						`job \`${job.id}\` sets its own \`concurrency.group\` \`${job.concurrency.group}\` ` +
						`with \`cancel-in-progress: true\`, and this workflow runs on \`push\`. ` +
						`${VERDICT_EXPLANATION} If the job converges instead of reporting — it drives one ` +
						`pull request or one deployment, so the newest run subsumes the older — add it to ` +
						`JOB_CONCURRENCY_ALLOWLIST in scripts/ci/workflow-trigger-guard.mjs with that reason.`,
				});
			}
		}

		for (const { trigger, filters } of triggers) {
			if (filters.length === 0) continue;
			filtered.add(file);
			if (Object.hasOwn(allowlist, file)) continue;
			violations.push({
				file,
				message:
					`\`${trigger}:\` is filtered by \`${filters.join('`/`')}:\`, so this workflow does ` +
					`not run on a PR based on any other branch — its checks go missing rather than red. ` +
					`Remove the filter, or add "${file}" to ALLOWLIST in ${'scripts/ci/workflow-trigger-guard.mjs'} ` +
					`with the main-baseline reason it needs one.`,
			});
		}
	}

	// The record must not outlive the thing it records: an entry for a workflow
	// that no longer filters (or no longer exists) is stale, and a stale reason
	// is what this guard exists to prevent.
	for (const file of Object.keys(allowlist)) {
		if (!files.includes(file)) {
			violations.push({
				file,
				message: `allowlisted but no such workflow exists; remove the stale ALLOWLIST entry.`,
			});
		} else if (!filtered.has(file)) {
			violations.push({
				file,
				message:
					`allowlisted as needing a base-branch filter, but its PR trigger has none. ` +
					`Remove the stale ALLOWLIST entry.`,
			});
		}
	}

	for (const [file, entries] of Object.entries(jobAllowlist)) {
		if (!files.includes(file)) {
			violations.push({
				file,
				message: `has JOB_CONCURRENCY_ALLOWLIST entries but no such workflow exists; remove them.`,
			});
			continue;
		}
		for (const id of Object.keys(entries)) {
			if (collidingJobs.get(file)?.has(id)) continue;
			violations.push({
				file,
				message:
					`job \`${id}\` is allowlisted for a cancelling ref-keyed \`concurrency:\` it no longer ` +
					`has. Remove the stale JOB_CONCURRENCY_ALLOWLIST entry.`,
			});
		}
	}

	return { violations, checked: files.length };
}

function main(argv) {
	const dirArg = argv.indexOf('--dir');
	const dir = dirArg === -1 ? DEFAULT_WORKFLOW_DIR : argv[dirArg + 1];
	if (!dir) {
		console.error('workflow-trigger-guard: --dir requires a value');
		return EXIT_ERROR;
	}

	let result;
	try {
		result = checkWorkflows(dir);
	} catch (err) {
		console.error(`workflow-trigger-guard: ${err.message}`);
		return EXIT_ERROR;
	}

	if (result.violations.length === 0) {
		const jobEntries = Object.values(JOB_CONCURRENCY_ALLOWLIST).reduce(
			(n, jobs) => n + Object.keys(jobs).length,
			0,
		);
		console.log(
			`workflow-trigger-guard: ${result.checked} workflows checked, ` +
				`${Object.keys(ALLOWLIST).length} allowlisted base-branch filters, ` +
				`${jobEntries} allowlisted converging job groups, no violations.`,
		);
		return EXIT_CLEAN;
	}

	console.error(`workflow-trigger-guard: ${result.violations.length} violation(s)\n`);
	for (const v of result.violations) {
		console.error(`  .github/workflows/${v.file}`);
		console.error(`    ${v.message}\n`);
	}
	return EXIT_VIOLATIONS;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
	process.exit(main(process.argv.slice(2)));
}
