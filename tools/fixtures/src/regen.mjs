// Runs each task's oracle over the manifest and rewrites the expected snapshots. After an oracle
// bump this is the whole upgrade: `git diff fixtures/expected` is then the upstream behaviour change.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { TASKS, taskById } from './tasks/index.mjs';
import { allUnits, applies } from './manifest.mjs';
import { expectedDir, expectedFile, inputFile, ORACLES_FILE } from './paths.mjs';
import { writeIfChanged, stableStringify } from './fsutil.mjs';
import { parseJs } from './canonical.mjs';

const require = createRequire(import.meta.url);
export const packageVersion = (name) => require(`${name}/package.json`).version;

export function regen({ taskIds, sourceIds }) {
	const tasks = taskIds ? taskIds.map(taskById) : TASKS;
	const units = allUnits(sourceIds);
	const summary = {};
	const unparseable = [];

	for (const task of tasks) {
		for (const variant of task.variants) {
			const applicable = units.filter((u) => applies(task, variant.id, u));
			const counts = { units: applicable.length, error: 0 };
			if (sourceIds) for (const s of sourceIds) fs.rmSync(expectedDir(task, variant.id, s), { recursive: true, force: true });
			else fs.rmSync(expectedDir(task, variant.id), { recursive: true, force: true });

			for (const unit of applicable) {
				const src = fs.readFileSync(inputFile(unit), 'utf8');
				const artifacts = task.run(unit, src, variant);
				if (artifacts.error) counts.error++;
				for (const [name, art] of Object.entries(artifacts)) {
					if (art.compare === 'js-ast') {
						try {
							parseJs(art.text);
						} catch (e) {
							unparseable.push(`${task.id}/${variant.id}/${unit.source}/${unit.path} (${name}): ${e.message}`);
						}
					}
					writeIfChanged(expectedFile(task, variant.id, unit, art.ext), art.text);
				}
			}
			summary[`${task.id}/${variant.id}`] = counts;
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
	return { summary, unparseable };
}
