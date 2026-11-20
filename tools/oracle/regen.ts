// Runs each task's oracle over every unit and rewrites the expected packs. After an oracle bump this
// is the whole upgrade: `git diff` over corpus/**/expected/ is then the upstream behaviour change.
// A job is a slice of one source's units for one task and variant; a pool of workers
// (./regen-worker.ts) runs them at once, and each source's pack is written when all are back.
import os from 'node:os';
import { Worker } from 'node:worker_threads';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { TASKS, taskById } from './tasks.ts';
import { allUnits, unitKey, writes } from './manifest.ts';
import path from 'node:path';
import { ORACLES_FILE, expectedPack } from './paths.ts';
import { readPack, writePack, type Entry } from './pack.ts';
import { writeIfChanged, stableStringify } from './files.ts';
import type { Job, JobResult } from './regen-worker.ts';

const require = createRequire(import.meta.url);
const packageVersion = (name: string): string => require(`${name}/package.json`).version;

export interface RegenOptions {
	taskIds?: string[];
	sourceIds?: string[];
	/** Unit keys or globs over them (`family/source/path`): only these units run, and the rest of each pack is kept. */
	paths?: string[];
	/** Workers; defaults to one per core. */
	jobs?: number;
}

/** Units per job: small enough that the largest source does not keep one worker busy alone. */
const SLICE = 400;

/**
 * The keys `paths` selects. A path that is a unit's key selects that unit alone, so `[slug]` and
 * `+page` need no escaping; any other path is a glob over the keys.
 */
export function select(paths: readonly string[], keys: readonly string[]): Set<string> {
	const known = new Set(keys);
	const chosen = new Set<string>();
	for (const p of paths)
		if (known.has(p)) chosen.add(p);
		else for (const k of keys) if (path.matchesGlob(k, p)) chosen.add(k);
	return chosen;
}

/** `file`'s entries with those of the units `selected` accepts replaced by `fresh`. */
export function mergePack(
	file: string,
	fresh: Entry[],
	selected: (path: string) => boolean,
): Entry[] {
	const kept = fs.existsSync(file) ? readPack(file).filter((e) => !selected(e.path)) : [];
	return [...kept, ...fresh];
}

/** Runs `jobs` on `workers` workers, largest first, so the last job to start is a short one. */
async function runPool(jobs: (Job & { size: number })[], workers: number): Promise<JobResult[]> {
	const queue = jobs.toSorted((a, b) => b.size - a.size);
	const results: JobResult[] = [];
	const worker = async (): Promise<void> => {
		const w = new Worker(new URL('./regen-worker.ts', import.meta.url));
		try {
			for (let job = queue.shift(); job; job = queue.shift()) {
				const { size: _, ...message } = job;
				// oxlint-disable-next-line no-await-in-loop -- one job at a time per worker
				const result = await new Promise<JobResult>((resolve, reject) => {
					w.once('message', resolve);
					w.once('error', reject);
					// oxlint-disable-next-line unicorn/require-post-message-target-origin -- a worker thread, not a window
					w.postMessage(message);
				});
				w.removeAllListeners('error');
				results.push(result);
			}
		} finally {
			await w.terminate();
		}
	};
	await Promise.all(Array.from({ length: Math.min(workers, jobs.length) }, worker));
	return results;
}

export async function regen({
	taskIds,
	sourceIds,
	paths,
	jobs,
}: RegenOptions): Promise<{ unparseable: string[] }> {
	const tasks = taskIds ? taskIds.map(taskById) : TASKS;
	const every = allUnits(sourceIds);
	const chosen = paths && select(paths, every.map(unitKey));
	const units = chosen ? every.filter((u) => chosen.has(unitKey(u))) : every;
	if (paths && !units.length) throw new Error(`no unit matches ${paths.join(' ')}`);
	const sources = new Map<string, { family: string; source: string }>();
	const chosenPaths = new Map<string, string[]>();
	for (const u of units) {
		const key = `${u.family}/${u.source}`;
		sources.set(key, { family: u.family, source: u.source });
		let list = chosenPaths.get(key);
		if (!list) chosenPaths.set(key, (list = []));
		list.push(u.path);
	}

	const work: (Job & { size: number })[] = [];
	for (const task of tasks)
		for (const variant of task.variants) {
			const sizes = new Map<string, number>();
			for (const u of units)
				if (writes(task, variant.id, u))
					sizes.set(`${u.family}/${u.source}`, (sizes.get(`${u.family}/${u.source}`) ?? 0) + 1);
			for (const [key, s] of sources) {
				const size = sizes.get(key) ?? 0;
				const slice = task.runSource ? Math.max(size, 1) : SLICE;
				// A source with no unit still gets a job, which removes its stale pack.
				for (let from = 0; from < Math.max(size, 1); from += slice)
					work.push({
						task: task.id,
						variant: variant.id,
						...s,
						paths: chosen && chosenPaths.get(key),
						from,
						to: from + slice,
						size: Math.min(slice, size - from),
					});
			}
		}
	const started = performance.now();
	const results = await runPool(work, jobs ?? os.availableParallelism());

	const unparseable = results.flatMap((r) => r.unparseable);
	const packs = Map.groupBy(results, (r) => expectedPack(r.family, r.source, r.task, r.variant));
	const written = new Map<string, number>();
	for (const [file, parts] of packs) {
		const fresh = parts.flatMap((r) => r.entries);
		const { family, source } = parts[0]!;
		const entries = chosen
			? mergePack(file, fresh, (p) => chosen!.has(`${family}/${source}/${p}`))
			: fresh;
		if (writePack(file, entries)) {
			const key = `${parts[0]!.task}/${parts[0]!.variant}`;
			written.set(key, (written.get(key) ?? 0) + 1);
		}
	}
	for (const task of tasks)
		for (const variant of task.variants) {
			const mine = results.filter((r) => r.task === task.id && r.variant === variant.id);
			const sum = (f: (r: JobResult) => number) => mine.reduce((n, r) => n + f(r), 0);
			console.log(
				`${task.id}/${variant.id}: ${sum((r) => r.units)} units, ${sum((r) => r.errors)} oracle errors, ${written.get(`${task.id}/${variant.id}`) ?? 0} packs written`,
			);
		}
	console.log(`${results.length} jobs in ${((performance.now() - started) / 1000).toFixed(1)} s`);

	const lock = fs.existsSync(ORACLES_FILE) ? JSON.parse(fs.readFileSync(ORACLES_FILE, 'utf8')) : {};
	for (const task of tasks) {
		lock[task.id] = {
			oracles: Object.fromEntries(task.oracles.map((p) => [p, packageVersion(p)])),
			canonicalizer: { acorn: packageVersion('acorn') },
			...task.lock,
		};
	}
	writeIfChanged(ORACLES_FILE, stableStringify(lock) + '\n');

	if (unparseable.length) {
		console.log(`oracle output the canonicalizer cannot parse: ${unparseable.length}`);
		for (const u of unparseable) console.log(`  ${u}`);
	}
	return { unparseable };
}

/** `oracle regen [--task id,...] [--source id,...] [--path key-or-glob]... [--jobs n]` */
export async function main(args: string[]): Promise<void> {
	const { values } = parseArgs({
		args,
		options: {
			task: { type: 'string' },
			source: { type: 'string' },
			path: { type: 'string', multiple: true },
			jobs: { type: 'string' },
		},
	});
	const { unparseable } = await regen({
		taskIds: values.task?.split(','),
		sourceIds: values.source?.split(','),
		paths: values.path,
		jobs: values.jobs === undefined ? undefined : Number(values.jobs),
	});
	if (unparseable.length) process.exitCode = 1;
}
