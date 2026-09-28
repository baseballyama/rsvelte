// Compares what an implementation wrote to each unit's actual/<task>/<variant>.<ext> against
// expected = snapshot + adjustments.
import fs from 'node:fs';
import path from 'node:path';
import { taskById } from './tasks/index.ts';
import { allUnits, applies } from './manifest.ts';
import { expectedFile, actualFile } from './paths.ts';
import { parseJs, firstDiff, same } from './canonical.ts';
import { expectedTree } from './adjust.ts';

export type Verdict = 'match' | 'mismatch' | 'missing' | 'unexpected' | 'unparseable';
export interface Row {
	key: string;
	ext: string;
	verdict: Verdict;
	detail?: string;
}

/** Every `<variant>.<ext>` either side has, so a task's artifacts need no list here. */
function artifactExts(task: ReturnType<typeof taskById>, variantId: string, unit: Parameters<typeof expectedFile>[2]): string[] {
	const exts = new Set<string>();
	for (const file of [expectedFile(task, variantId, unit, 'x'), actualFile(task, variantId, unit, 'x')]) {
		const dir = path.dirname(file);
		if (!fs.existsSync(dir)) continue;
		for (const name of fs.readdirSync(dir)) {
			if (name.startsWith(`${variantId}.`)) exts.add(name.slice(variantId.length + 1));
		}
	}
	return [...exts].sort();
}

export interface CompareOptions {
	taskId: string;
	variantId: string;
	sourceIds?: string[];
	families?: string[];
}

export function compare({ taskId, variantId, sourceIds, families }: CompareOptions) {
	const task = taskById(taskId);
	const units = allUnits(sourceIds, families).filter((u) => applies(task, variantId, u));
	const rows: Row[] = [];
	for (const unit of units) {
		const key = `${unit.family}/${unit.source}/${unit.path}`;
		const expectsError = fs.existsSync(expectedFile(task, variantId, unit, 'error.json'));
		const exts = expectsError ? ['error.json'] : artifactExts(task, variantId, unit);
		for (const ext of exts) {
			const expFile = expectedFile(task, variantId, unit, ext);
			const actFile = actualFile(task, variantId, unit, ext);
			const hasExp = fs.existsSync(expFile);
			const hasAct = fs.existsSync(actFile);
			if (!hasExp && !hasAct) continue;
			if (!hasAct) {
				rows.push({ key, ext, verdict: 'missing' });
				continue;
			}
			if (!hasExp) {
				rows.push({ key, ext, verdict: 'unexpected' });
				continue;
			}
			const act = fs.readFileSync(actFile, 'utf8');
			if (ext === 'js') {
				const { tree, statuses } = expectedTree(unit, task, variantId, 'js');
				const stale = statuses.filter((s) => s.status === 'stale').length;
				let actual;
				try {
					actual = parseJs(act);
				} catch (e) {
					rows.push({ key, ext, verdict: 'unparseable', detail: (e as Error).message });
					continue;
				}
				const d = firstDiff(tree, actual);
				const detail = [d !== null && `first diff at ${d || '<root>'}`, stale && `${stale} stale adjustment(s)`].filter(Boolean).join('; ');
				rows.push({ key, ext, verdict: d === null ? 'match' : 'mismatch', ...(detail && { detail }) });
			} else if (ext.endsWith('.json')) {
				rows.push({ key, ext, verdict: same(JSON.parse(fs.readFileSync(expFile, 'utf8')), JSON.parse(act)) ? 'match' : 'mismatch' });
			} else {
				rows.push({ key, ext, verdict: fs.readFileSync(expFile, 'utf8') === act ? 'match' : 'mismatch' });
			}
		}
	}
	const counts: Partial<Record<Verdict, number>> = {};
	for (const r of rows) counts[r.verdict] = (counts[r.verdict] ?? 0) + 1;
	return { units: units.length, rows, counts };
}
