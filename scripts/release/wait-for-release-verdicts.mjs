#!/usr/bin/env node

// A Changesets PR created with GITHUB_TOKEN normally has no PR verdict because
// GitHub suppresses recursively-triggered workflows. The merge commit does
// start the ordinary push workflows, so publishing can reuse those runs rather
// than compiling the repository a second time inside release.yml.

export const WORKFLOWS = [
	{ name: 'CI', required: true },
	{ name: 'Corpus Compat', required: false },
	{ name: 'Type-aware Lint', required: false },
	{ name: 'C ABI', required: false },
	{ name: 'crates.io packages', required: false },
];

const SUCCESS = new Set(['success']);
const ACTIVE = new Set(['queued', 'in_progress', 'pending', 'waiting', 'requested']);

function latestByName(runs) {
	const latest = new Map();
	for (const run of runs) {
		if (!WORKFLOWS.some((workflow) => workflow.name === run.name)) continue;
		const previous = latest.get(run.name);
		if (!previous || Date.parse(run.updated_at) > Date.parse(previous.updated_at)) {
			latest.set(run.name, run);
		}
	}
	return latest;
}

export function verdict(runs) {
	const latest = latestByName(runs);
	const missing = WORKFLOWS.filter(
		(workflow) => workflow.required && !latest.has(workflow.name),
	);
	if (missing.length > 0) {
		return {
			state: 'pending',
			message: `waiting for ${missing.map((workflow) => workflow.name).join(', ')}`,
		};
	}

	const observed = WORKFLOWS.filter((workflow) => latest.has(workflow.name)).map(
		(workflow) => latest.get(workflow.name),
	);
	const active = observed.filter((run) => ACTIVE.has(run.status));
	if (active.length > 0) {
		return {
			state: 'pending',
			message: `waiting for ${active.map((run) => `${run.name}=${run.status}`).join(', ')}`,
		};
	}

	const failed = observed.filter(
		(run) => run.status !== 'completed' || !SUCCESS.has(run.conclusion),
	);
	if (failed.length > 0) {
		return {
			state: 'failure',
			message: failed
				.map((run) => `${run.name}=${run.status}/${run.conclusion || 'none'} (${run.html_url})`)
				.join(', '),
		};
	}

	return {
		state: 'success',
		message: observed.map((run) => `${run.name}=success`).join(', '),
	};
}

async function listRuns(repository, sha, token) {
	const query = new URLSearchParams({ head_sha: sha, event: 'push', per_page: '100' });
	const response = await fetch(
		`https://api.github.com/repos/${repository}/actions/runs?${query}`,
		{
			headers: {
				Accept: 'application/vnd.github+json',
				Authorization: `Bearer ${token}`,
				'X-GitHub-Api-Version': '2022-11-28',
			},
		},
	);
	if (!response.ok) {
		throw new Error(`GitHub Actions API returned ${response.status}: ${await response.text()}`);
	}
	return (await response.json()).workflow_runs;
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function main() {
	const repository = process.env.GITHUB_REPOSITORY;
	const sha = process.env.GITHUB_SHA;
	const token = process.env.GH_TOKEN;
	if (!repository || !sha || !token) {
		throw new Error('GITHUB_REPOSITORY, GITHUB_SHA and GH_TOKEN are required');
	}

	const interval = Number(process.env.RELEASE_VERDICT_POLL_MS || 30_000);
	const deadline = Date.now() + Number(process.env.RELEASE_VERDICT_TIMEOUT_MS || 5_100_000);
	let consecutiveSuccesses = 0;

	while (Date.now() < deadline) {
		const result = verdict(await listRuns(repository, sha, token));
		console.log(`${new Date().toISOString()} ${result.state}: ${result.message}`);

		if (result.state === 'failure') {
			console.error(`::error::Release commit verification failed: ${result.message}`);
			return 1;
		}
		if (result.state === 'success') {
			consecutiveSuccesses += 1;
			// A second successful poll prevents a late-registered path-filtered
			// workflow from being mistaken for an absent (therefore irrelevant) one.
			if (consecutiveSuccesses >= 2) return 0;
		} else {
			consecutiveSuccesses = 0;
		}

		await delay(interval);
	}

	console.error('::error::Timed out waiting for release-commit workflow verdicts.');
	return 1;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
	main()
		.then((code) => process.exit(code))
		.catch((error) => {
			console.error(`::error::${error.stack || error.message}`);
			process.exit(1);
		});
}
