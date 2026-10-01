// Compares what an implementation wrote to each unit's actual/<task>/<variant>.<ext> against
// expected = snapshot + adjustments.
import fs from 'node:fs';
import path from 'node:path';
import { taskById } from './tasks/index.ts';
import { allUnits, applies } from './manifest.ts';
import { expectedFile, actualFile } from './paths.ts';
import { parseJs, firstDiff, same } from './canonical.ts';
import { expectedTree } from './adjust.ts';
import type { Task, Unit } from './types.ts';

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

interface LintFile {
	rules: string[];
	findings: { rule: string | null }[];
}

/**
 * The oracle runs every rule; an implementation runs the rules it has and says which. It matches
 * when its findings are the oracle's findings from those rules (plus the rule-less ones: a fatal
 * parse error, an unused disable directive). A rule the oracle did not run is a mismatch.
 */
function compareLint(exp: LintFile, act: LintFile): { verdict: Verdict; detail?: string } {
	const extra = act.rules.filter((r) => !exp.rules.includes(r));
	if (extra.length > 0) return { verdict: 'mismatch', detail: `not run by the oracle: ${extra.join(', ')}` };
	const ran = new Set(act.rules);
	const want = exp.findings.filter((f) => f.rule === null || ran.has(f.rule));
	return { verdict: JSON.stringify(want) === JSON.stringify(act.findings) ? 'match' : 'mismatch' };
}

export interface CompareOptions {
	taskId: string;
	variantId: string;
	sourceIds?: string[];
	families?: string[];
}

/**
 * A task that observes the implementation's `<variant>.js` (Task.observe): the observation is
 * written to actual/ beside it for inspection and compared with the expected artifact. A unit
 * with diagnostics and no `.js` is a refusal, reported as the generic comparison reports one.
 */
async function observeRows(task: Task, variantId: string, unit: Unit, key: string): Promise<Row[]> {
	const observe = task.observe!;
	const variant = task.variants.find((v) => v.id === variantId)!;
	const expFile = expectedFile(task, variantId, unit, observe.ext);
	const jsFile = actualFile(task, variantId, unit, 'js');
	const diagnostics = fs.existsSync(actualFile(task, variantId, unit, 'diagnostics.json'));
	const rows: Row[] = diagnostics ? [{ key, ext: 'diagnostics.json', verdict: 'unexpected' }] : [];
	const hasExp = fs.existsSync(expFile);
	if (!fs.existsSync(jsFile)) {
		if (hasExp) rows.push({ key, ext: observe.ext, verdict: 'missing' });
		return rows;
	}
	if (!hasExp) return [...rows, { key, ext: 'js', verdict: 'unexpected' }];
	try {
		parseJs(fs.readFileSync(jsFile, 'utf8'));
	} catch (e) {
		return [...rows, { key, ext: 'js', verdict: 'unparseable', detail: (e as Error).message }];
	}
	const observed = await observe.derive(unit, variant, jsFile);
	fs.writeFileSync(actualFile(task, variantId, unit, observe.ext), observed.text);
	const d = observed.diff(fs.readFileSync(expFile, 'utf8'));
	return [...rows, { key, ext: observe.ext, verdict: d === null ? 'match' : 'mismatch', ...(d !== null && { detail: d }) }];
}

export async function compare({ taskId, variantId, sourceIds, families }: CompareOptions) {
	const task = taskById(taskId);
	const units = allUnits(sourceIds, families).filter((u) => applies(task, variantId, u));
	const rows: Row[] = [];
	for (const unit of units) {
		const key = `${unit.family}/${unit.source}/${unit.path}`;
		if (task.observe) {
			rows.push(...(await observeRows(task, variantId, unit, key)));
			continue;
		}
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
			} else if (ext === 'lint.json') {
				rows.push({ key, ext, ...compareLint(JSON.parse(fs.readFileSync(expFile, 'utf8')), JSON.parse(act)) });
			} else if (ext.endsWith('json')) {
				const { tree, statuses } = expectedTree(unit, task, variantId, ext);
				const stale = statuses.filter((s) => s.status === 'stale').length;
				const detail = stale ? `${stale} stale adjustment(s)` : undefined;
				rows.push({ key, ext, verdict: same(tree, JSON.parse(act)) ? 'match' : 'mismatch', ...(detail && { detail }) });
			} else {
				rows.push({ key, ext, verdict: fs.readFileSync(expFile, 'utf8') === act ? 'match' : 'mismatch' });
			}
		}
	}
	const counts: Partial<Record<Verdict, number>> = {};
	for (const r of rows) counts[r.verdict] = (counts[r.verdict] ?? 0) + 1;
	return { units: units.length, rows, counts };
}
