// One regen worker: runs a task's oracle over a slice of one source's units.
import { parentPort } from 'node:worker_threads';
import { taskById } from './tasks.ts';
import { allUnits, applies, unitKey } from './manifest.ts';
import type { Entry } from './pack.ts';
import { parseJs } from './canonical.ts';
import type { Artifact } from './types.ts';

export interface Job {
	task: string;
	variant: string;
	family: string;
	source: string;
	/** The slice of the source's applicable units; a per-source task always takes all of them. */
	from: number;
	to: number;
}

export interface JobResult extends Job {
	units: number;
	errors: number;
	entries: Entry[];
	unparseable: string[];
}

/** An oracle that throws on a unit has refused it; the message is the expected output. */
const refusal = (e: unknown): Record<string, Artifact> => ({
	error: { text: `${(e as Error).message ?? String(e)}\n`, ext: 'error.txt', compare: 'text' },
});

async function run(job: Job): Promise<JobResult> {
	const task = taskById(job.task);
	const variant = task.variants.find((v) => v.id === job.variant)!;
	const all = allUnits([job.source], [job.family]);
	const units = all.filter((u) => applies(task, variant.id, u)).slice(job.from, job.to);
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
	const unparseable: string[] = [];
	let errors = 0;
	for (const unit of units) {
		const artifacts = results.get(unit.path);
		if (!artifacts) throw new Error(`${job.task}: no result for ${unitKey(unit)}`);
		if (artifacts.error) errors++;
		for (const art of Object.values(artifacts)) {
			if (art.compare === 'js-ast') {
				try {
					parseJs(art.text);
				} catch (e) {
					unparseable.push(
						`${job.task}/${job.variant} ${unitKey(unit)} (${art.ext}): ${(e as Error).message}`,
					);
				}
			}
			entries.push({ path: unit.path, attributes: [art.ext], body: art.text });
		}
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
