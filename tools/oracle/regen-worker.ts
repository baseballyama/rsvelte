// One regen worker: runs a task's oracle over a slice of one source's units.
import { parentPort } from 'node:worker_threads';
import { taskById } from './tasks.ts';
import { allUnits, applies, unitKey, writes } from './manifest.ts';
import type { Entry } from './pack.ts';
import { parseJs } from './canonical.ts';
import { machineFailure } from './machine-failures.ts';
import type { Artifact } from './types.ts';

export interface Job {
	task: string;
	variant: string;
	family: string;
	source: string;
	/** The paths of the selected units, when not all of them run. */
	paths: string[] | undefined;
	/** The slice of the source's applicable units; a per-source task always takes all of them. */
	from: number;
	to: number;
}

/** Oracle JavaScript that does not parse. */
export interface Unparseable {
	key: string;
	/** `<task>/<variant>`. */
	task: string;
	ext: string;
	message: string;
}

export interface JobResult extends Job {
	units: number;
	errors: number;
	entries: Entry[];
	unparseable: Unparseable[];
}

/** An oracle that throws on a unit has refused it; the message is the expected output. */
const refusal = (e: unknown): Record<string, Artifact> => ({
	error: { text: `${(e as Error).message ?? String(e)}\n`, ext: 'error.txt', compare: 'text' },
});

async function run(job: Job): Promise<JobResult> {
	const task = taskById(job.task);
	const variant = task.variants.find((v) => v.id === job.variant)!;
	const all = allUnits([job.source], [job.family]);
	const chosen = job.paths && new Set(job.paths);
	const units = all
		.filter((u) => writes(task, variant.id, u))
		.filter((u) => !chosen || chosen.has(u.path))
		.slice(job.from, job.to);
	let results: Map<string, Record<string, Artifact>>;
	if (task.runSource && units.length) {
		results = await task.runSource(all, variant);
	} else {
		results = new Map();
		for (const unit of units) {
			try {
				// oxlint-disable-next-line no-await-in-loop -- behaviour traces share the one DOM in behaviour/client.ts
				results.set(unit.path, await task.run(unit, unit.src, variant));
			} catch (e) {
				results.set(unit.path, refusal(e));
			}
		}
	}
	const entries: Entry[] = [];
	const unparseable: Unparseable[] = [];
	let errors = 0;
	for (const unit of units) {
		const artifacts = results.get(unit.path);
		if (!artifacts) throw new Error(`${job.task}: no result for ${unitKey(unit)}`);
		if (artifacts.error) {
			const cause = machineFailure(artifacts.error.text);
			if (cause)
				throw new Error(
					`${job.task}/${job.variant} ${unitKey(unit)}: ${cause} on the oracle's machine; nothing is written: ${artifacts.error.text}`,
				);
			errors++;
		}
		// A unit kept only for a reader is never compared as code, so its code may not parse.
		const compared = applies(task, variant.id, unit);
		let skipped = false;
		for (const art of Object.values(artifacts)) {
			if (compared && (art.compare === 'js-ast' || art.compare === 'js-ast-parens')) {
				try {
					parseJs(art.text);
				} catch (e) {
					unparseable.push({
						key: unitKey(unit),
						task: `${job.task}/${job.variant}`,
						ext: art.ext,
						message: (e as Error).message,
					});
					skipped ||= task.unparseable !== undefined;
				}
			}
		}
		if (skipped) continue;
		for (const art of Object.values(artifacts))
			entries.push({ path: unit.path, attributes: [art.ext], body: art.text });
	}
	return { ...job, units: units.length, errors, entries, unparseable };
}

parentPort!.on('message', (job: Job) => {
	run(job).then(
		// oxlint-disable-next-line unicorn/require-post-message-target-origin -- a worker thread's port, not a window
		(result) => parentPort!.postMessage(result),
		(e: unknown) => {
			throw e;
		},
	);
});
