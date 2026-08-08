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
// rather than the PR base; see #1799). It answers one question: is every
// base-branch filter on the `pull_request` trigger deliberate and explained?
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

	// Top-level only. A job-level `concurrency:` is scoped to that job and is how
	// release.yml legitimately serialises its publish step.
	let concurrency = null;
	const concIndex = lines.findIndex((l) => indentOf(l) === 0 && keyOf(l) === 'concurrency');
	if (concIndex !== -1) {
		concurrency = { group: '', cancels: false };
		for (const child of directChildren(lines, concIndex + 1, 0)) {
			const value = inlineValueOf(child.line);
			if (child.key === 'group') concurrency.group = value;
			if (child.key === 'cancel-in-progress') concurrency.cancels = value === 'true';
		}
	}

	return { triggers, pushes, concurrency };
}

/**
 * @returns {{violations: Array<{file: string, message: string}>, checked: number}}
 */
export function checkWorkflows(dir, allowlist = ALLOWLIST) {
	const files = readdirSync(dir)
		.filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
		.sort();
	if (files.length === 0) {
		throw new Error(`no workflow files found in ${dir}`);
	}

	const violations = [];
	const filtered = new Set();

	for (const file of files) {
		const source = readFileSync(join(dir, file), 'utf8');
		const { triggers, pushes, concurrency } = analyzeWorkflow(source, { name: file });

		if (
			pushes &&
			concurrency?.cancels &&
			!PER_PUSH_CONTEXTS.some((ctx) => concurrency.group.includes(ctx))
		) {
			violations.push({
				file,
				message:
					`\`concurrency.group\` is \`${concurrency.group}\` with \`cancel-in-progress: true\`, ` +
					`but this workflow runs on \`push\`. Every push to a branch shares one \`github.ref\`, ` +
					`so each merge cancels its predecessor and the branch carries no verdict — which reads ` +
					`exactly like a green one (#2435/#2593). Key the group by ` +
					`\`\${{ github.head_ref || github.sha }}\` so pushes cannot collide, or set ` +
					`\`cancel-in-progress: false\`.`,
			});
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
		console.log(
			`workflow-trigger-guard: ${result.checked} workflows checked, ` +
				`${Object.keys(ALLOWLIST).length} allowlisted base-branch filters, no violations.`,
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
