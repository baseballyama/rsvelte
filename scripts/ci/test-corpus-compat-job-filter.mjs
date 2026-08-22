#!/usr/bin/env node
// Controls for corpus-compat-job-filter.mjs. A filter is only useful if it can
// say "no", and only safe if it says "yes" everywhere it cannot prove "no", so
// every case below pins one of those two directions on a synthetic workspace.

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	JOB_TARGETS,
	closure,
	decide,
	packageOf,
	parseWorkspace,
	readWorkspace,
} from './corpus-compat-job-filter.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');

function pkg(name, deps) {
	return {
		name,
		manifest_path: `${ROOT}/crates/${name}/Cargo.toml`,
		dependencies: deps.map((d) => ({ name: d })),
	};
}

const FAKE = parseWorkspace(
	{
		packages: [
			pkg('rsvelte_core', ['serde']),
			pkg('rsvelte_fmt', ['rsvelte_formatter']),
			pkg('rsvelte_formatter', ['rsvelte_core']),
			pkg('rsvelte_napi', ['rsvelte_core']),
			pkg('rsvelte_devtools', ['rsvelte_core']),
			pkg('rsvelte_preprocess', ['rsvelte_core']),
			pkg('rsvelte_lint', ['rsvelte_core']),
			pkg('rsvelte_check', ['rsvelte_core']),
			pkg('rsvelte_language_server', ['rsvelte_check', 'rsvelte_fmt']),
			pkg('rsvelte_bench', ['rsvelte_core']),
		],
	},
	ROOT,
);

const tests = {
	'closure follows transitive workspace deps'() {
		assert.deepEqual(
			[...closure(FAKE, ['rsvelte_language_server'])].sort(),
			[
				'rsvelte_check',
				'rsvelte_core',
				'rsvelte_fmt',
				'rsvelte_formatter',
				'rsvelte_language_server',
			],
		);
	},

	'a shared crate enables every job'() {
		const enabled = decide(FAKE, ['crates/rsvelte_core/src/lib.rs']);
		assert.equal(
			Object.values(enabled).every(Boolean),
			true,
			'rsvelte_core is in every closure',
		);
	},

	'a leaf crate enables only the jobs that build it'() {
		const enabled = decide(FAKE, ['crates/rsvelte_preprocess/src/lib.rs']);
		assert.equal(enabled['scss-parity'], true);
		assert.equal(enabled['fmt-parity'], false);
		assert.equal(enabled['lsp-corpus'], false);
	},

	'a crate no target links disables every job'() {
		const enabled = decide(FAKE, ['crates/rsvelte_bench/src/main.rs']);
		assert.equal(
			Object.values(enabled).some(Boolean),
			false,
			'rsvelte_bench is in no closure',
		);
	},

	'a non-crate path enables every job'() {
		for (const file of [
			'pnpm-lock.yaml',
			'compatibility/lsp-known-failures.json',
			'submodules/svelte',
			'.github/workflows/corpus-compat.yml',
			'scripts/compat-lsp/verify.mjs',
			'Cargo.lock',
		]) {
			const enabled = decide(FAKE, [file]);
			assert.equal(
				Object.values(enabled).every(Boolean),
				true,
				`${file} must not narrow the job set`,
			);
		}
	},

	'an empty change set enables every job'() {
		// Schedule and workflow_dispatch runs have no diff to read.
		assert.equal(Object.values(decide(FAKE, [])).every(Boolean), true);
	},

	'an unknown crate directory that a member depends on stays enabled'() {
		const workspace = parseWorkspace(
			{ packages: [pkg('rsvelte_core', ['outside_crate'])] },
			ROOT,
		);
		assert.equal(packageOf(workspace, 'crates/outside_crate/src/lib.rs'), null);
	},

	'an unknown crate directory nothing depends on is inert'() {
		const workspace = parseWorkspace(
			{ packages: [pkg('rsvelte_core', ['serde'])] },
			ROOT,
		);
		assert.equal(
			packageOf(workspace, 'crates/rsvelte_lint_types/src/lib.rs'),
			undefined,
		);
	},

	'the crates/ prefix alone does not name a package'() {
		assert.equal(packageOf(FAKE, 'crates/README.md'), null);
	},

	'every declared job target is a real workspace package'() {
		const workspace = readWorkspace(ROOT);
		for (const [job, targets] of Object.entries(JOB_TARGETS))
			for (const target of targets)
				assert.equal(
					workspace.deps.has(target),
					true,
					`${job} builds ${target}, which is not a workspace member`,
				);
	},

	'every gated job in the workflow has a filter entry, and vice versa'() {
		const workflow = readFileSync(
			join(ROOT, '.github/workflows/corpus-compat.yml'),
			'utf8',
		);
		const gated = new Set(
			[...workflow.matchAll(/needs\.changes\.outputs\.([a-z0-9-]+)/g)].map(
				(m) => m[1],
			),
		);
		for (const job of Object.keys(JOB_TARGETS))
			assert.equal(
				gated.has(job),
				true,
				`${job} has a filter entry but the workflow never reads it`,
			);
		for (const job of gated)
			assert.equal(
				Object.hasOwn(JOB_TARGETS, job),
				true,
				`the workflow gates on ${job}, which the filter never emits`,
			);
	},

	'the LSP corpus gate runs only on a schedule or a dispatch'() {
		const workflow = readFileSync(
			join(ROOT, '.github/workflows/corpus-compat.yml'),
			'utf8',
		);
		// The 950 job-minutes this job costs are the whole reason the account's
		// Actions queue could not drain. ~60 pull-request pushes and ~10 merges a
		// day both overrun the 20-job concurrency ceiling on their own.
		for (const job of ['lsp-corpus', 'lsp-current-merge']) {
			const block = workflow.slice(workflow.indexOf(`\n  ${job}:\n`));
			const head = block.slice(0, block.indexOf('\n    steps:'));
			assert.match(
				head,
				/github\.event_name == 'schedule'/,
				`${job} must not be scheduled by a push or a pull request`,
			);
			assert.match(
				head,
				/github\.event_name == 'workflow_dispatch'/,
				`${job} must stay reachable by hand from a branch`,
			);
		}
	},

	'the workflow still schedules the full population'() {
		const workflow = readFileSync(
			join(ROOT, '.github/workflows/corpus-compat.yml'),
			'utf8',
		);
		// Taking the gate off PRs only moves it; a run that never fires retires it.
		assert.match(workflow, /^\s{2}schedule:$/m, 'a nightly run must exist');
	},
};

let failed = 0;
for (const [name, run] of Object.entries(tests)) {
	try {
		run();
		console.log(`ok   ${name}`);
	} catch (error) {
		failed += 1;
		console.error(`FAIL ${name}\n     ${error.message}`);
	}
}
console.log(`\n${Object.keys(tests).length - failed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
