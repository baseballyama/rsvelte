// Runs each task's oracle over every unit and rewrites the expected snapshots. After an oracle bump
// this is the whole upgrade: `git diff` over fixtures/**/expected/ is then the upstream behaviour change.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { TASKS, taskById } from './tasks/index.ts';
import { allUnits, applies } from './manifest.ts';
import { expectedFile, inputFile, unitDir, snapshotDir, ORACLES_FILE } from './paths.ts';
import { writeIfChanged, stableStringify } from './fsutil.ts';
import { parseJs } from './canonical.ts';
import type { Task, Unit } from './types.ts';

const require = createRequire(import.meta.url);
export const packageVersion = (name: string): string => require(`${name}/package.json`).version;

/** Drops `<variant>.*` artifacts the oracle did not produce this time, so none linger. */
function removeStale(task: Task, variantId: string, unit: Unit, keep: Set<string>): void {
	const dir = path.join(unitDir(unit), snapshotDir(task), task.id);
	let names: string[];
	try {
		names = fs.readdirSync(dir);
	} catch {
		return;
	}
	for (const n of names) if (n.startsWith(`${variantId}.`) && !keep.has(n)) fs.rmSync(path.join(dir, n));
	if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
	const parent = path.dirname(dir);
	if (fs.readdirSync(parent).length === 0) fs.rmdirSync(parent);
}

export interface RegenOptions {
	taskIds?: string[];
	sourceIds?: string[];
}

export function regen({ taskIds, sourceIds }: RegenOptions): { unparseable: string[] } {
	const tasks = taskIds ? taskIds.map(taskById) : TASKS;
	const units = allUnits(sourceIds);
	const unparseable: string[] = [];

	for (const task of tasks) {
		for (const variant of task.variants) {
			const counts = { units: 0, error: 0 };
			for (const unit of units) {
				const keep = new Set<string>();
				if (applies(task, variant.id, unit)) {
					counts.units++;
					const artifacts = task.run(unit, fs.readFileSync(inputFile(unit, unit.ext), 'utf8'), variant);
					if (artifacts.error) counts.error++;
					for (const [name, art] of Object.entries(artifacts)) {
						if (art.compare === 'js-ast') {
							try {
								parseJs(art.text);
							} catch (e) {
								unparseable.push(`${task.id}/${variant.id} ${unit.family}/${unit.source}/${unit.path} (${name}): ${(e as Error).message}`);
							}
						}
						writeIfChanged(expectedFile(task, variant.id, unit, art.ext), art.text);
						keep.add(`${variant.id}.${art.ext}`);
					}
				}
				removeStale(task, variant.id, unit, keep);
			}
			console.log(`${task.id}/${variant.id}: ${stableStringify(counts, '')}`);
		}
	}

	const lock = fs.existsSync(ORACLES_FILE) ? JSON.parse(fs.readFileSync(ORACLES_FILE, 'utf8')) : {};
	for (const task of tasks) {
		lock[task.id] = {
			storage: task.storage,
			oracles: Object.fromEntries(task.oracles.map((p) => [p, packageVersion(p)])),
			canonicalizer: { acorn: packageVersion('acorn') }
		};
	}
	writeIfChanged(ORACLES_FILE, stableStringify(lock) + '\n');

	if (unparseable.length) {
		console.log(`oracle output the canonicalizer cannot parse: ${unparseable.length}`);
		for (const u of unparseable) console.log(`  ${u}`);
	}
	return { unparseable };
}
