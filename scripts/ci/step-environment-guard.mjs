#!/usr/bin/env node
// Fail when a step that runs `if: ${{ !cancelled() }}` could run without the
// environment it needs.
//
// `!cancelled()` exists here for a real reason: a failing step skips every
// unguarded step after it, and a skipped comparison reads exactly like a
// passing one. But *setup* is also "an unguarded step after it". So when a
// doc-count check at the head of the job fails, `pnpm install` and the cargo
// build are skipped and the comparison runs anyway — against no `node_modules`
// and no binding. What lands in the branch header is
// `Shape matrix parity: FAILURE`, caused by `Cannot find package 'acorn'`.
//
// Measured on #4140: two reviewers in a row read that red as a divergence
// verdict before the job log was readable. Fixing "a skipped comparison reads
// as a pass" had introduced "an environment failure reads as a divergence" —
// the same defect wearing the other sign.
//
// The rule: a guarded `run:` step in a job that has any earlier unguarded step
// which can fail must also require that step's outcome, so it is skipped when
// the environment is missing. The job is already red from the real cause, so
// nothing is silently swallowed.
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

const GUARDS = ['!cancelled()', 'always()'];

/**
 * A step that only checks out the repository cannot leave a *partial*
 * environment behind: if it fails there is no tree, and every later step fails
 * on its own. Requiring its outcome would be noise.
 */
const isCheckout = (step) => /actions\/checkout@/.test(step.uses ?? '');

/**
 * What counts as "the environment". The distinction matters: `!cancelled()`
 * exists so that a failing SIBLING CHECK does not skip the checks after it, and
 * requiring a sibling check's outcome would put that bug straight back. Only a
 * step that installs, builds, or fetches can leave a half-made environment for
 * the next step to fail inside.
 */
const SETUP_RUN = /\b(pnpm install|npm install|npm ci|yarn install|cargo build|cargo run|git submodule|collect\.mjs|pnpm run build|pnpm --filter|make )\b/;
const isSetup = (step) =>
	(step.uses !== null && !isCheckout(step)) || SETUP_RUN.test(step.run ?? '');

/**
 * Parse the workflow far enough to see jobs, steps, and the three keys this
 * guard reads. A YAML dependency would buy nothing: the shapes here are
 * two-space-indented block mappings, and the guard has to report line numbers.
 *
 * @param {string} text
 */
export function parseJobs(text) {
	const lines = text.split('\n');
	/** @type {{name: string, steps: any[]}[]} */
	const jobs = [];
	let job = null;
	let step = null;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const jobHeader = line.match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
		if (jobHeader) {
			job = { name: jobHeader[1], steps: [] };
			jobs.push(job);
			step = null;
			continue;
		}
		if (!job) continue;
		const stepHeader = line.match(/^ {6}- (name|uses|run|if|id): ?(.*)$/);
		if (stepHeader) {
			step = { line: i + 1, name: null, uses: null, run: null, if: null, id: null };
			step[stepHeader[1]] = stepHeader[2];
			job.steps.push(step);
			continue;
		}
		if (!step) continue;
		const key = line.match(/^ {8}(name|uses|run|if|id): ?(.*)$/);
		if (key) step[key[1]] = key[2];
	}
	return jobs;
}

/**
 * @param {{name: string, steps: any[]}[]} jobs
 * @param {string} file
 */
export function violations(jobs, file) {
	const out = [];
	for (const job of jobs) {
		// An unguarded step that is not a checkout is one whose failure leaves a
		// half-built environment behind.
		const fragile = job.steps.filter(
			(s) => !GUARDS.some((g) => (s.if ?? '').includes(g)) && isSetup(s),
		);
		if (!fragile.length) continue;
		for (const s of job.steps) {
			const guard = s.if ?? '';
			if (!GUARDS.some((g) => guard.includes(g))) continue;
			// Only a step that *does* something can be misread as a verdict. An
			// artifact upload guarded by `!cancelled()` is the intended shape:
			// its whole point is to run when the job is failing.
			if (s.run === null) continue;
			// Anything before this step that is still unguarded.
			const before = fragile.filter((f) => f.line < s.line);
			if (!before.length) continue;
			if (/steps\.[A-Za-z0-9_-]+\.outcome\s*==\s*'success'/.test(guard)) continue;
			out.push(
				`${file}:${s.line}  ${job.name}: \`${(s.name ?? s.run).slice(0, 60)}\` runs on ` +
					`${GUARDS.find((g) => guard.includes(g))} with ${before.length} unguarded setup step(s) before it ` +
					`(last: \`${(before.at(-1).name ?? before.at(-1).uses ?? '').slice(0, 50)}\`) and no ` +
					`\`steps.<id>.outcome == 'success'\` precondition — an environment failure would be ` +
					'reported under this step\'s name',
			);
		}
	}
	return out;
}

export function run(dir = DEFAULT_WORKFLOW_DIR) {
	const found = [];
	for (const f of readdirSync(dir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml')).sort()) {
		found.push(...violations(parseJobs(readFileSync(join(dir, f), 'utf8')), f));
	}
	return found;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	try {
		const found = run(process.argv[2] ?? DEFAULT_WORKFLOW_DIR);
		if (found.length) {
			for (const v of found) console.error(v);
			console.error(
				`\n[step-environment-guard] ${found.length} step(s) could report an environment ` +
					'failure under a comparison\'s name. Give the environment step an `id:` and add ' +
					"`&& steps.<id>.outcome == 'success'` to the guard.",
			);
			process.exit(EXIT_VIOLATIONS);
		}
		console.log('[step-environment-guard] every `!cancelled()` run step requires its environment. ✓');
		process.exit(EXIT_CLEAN);
	} catch (error) {
		console.error(`[step-environment-guard] ${error?.stack ?? error}`);
		process.exit(EXIT_ERROR);
	}
}
