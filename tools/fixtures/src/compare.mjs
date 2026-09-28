// Compares a candidate implementation's output tree (`<dir>/<source>/<path>.<ext>`, the same layout
// as fixtures/expected/<task>/<variant>) against expected = snapshot + adjustments.
import fs from 'node:fs';
import path from 'node:path';
import { taskById } from './tasks/index.mjs';
import { allUnits, applies } from './manifest.mjs';
import { expectedFile } from './paths.mjs';
import { parseJs, firstDiff, same } from './canonical.mjs';
import { expectedTree } from './adjust.mjs';

const exists = (f) => fs.existsSync(f);

export function compare({ taskId, variantId, candidate, sourceIds }) {
	const task = taskById(taskId);
	const units = allUnits(sourceIds).filter((u) => applies(task, variantId, u));
	const rows = [];
	for (const unit of units) {
		const key = `${unit.source}/${unit.path}`;
		const expectsError = exists(expectedFile(task, variantId, unit, 'error.json'));
		const artifactExts = expectsError ? ['error.json'] : ['js', 'css', 'warnings.json'];
		for (const ext of artifactExts) {
			const expFile = expectedFile(task, variantId, unit, ext);
			const candFile = path.join(candidate, unit.source, `${unit.path}.${ext}`);
			const hasExp = exists(expFile);
			const hasCand = exists(candFile);
			if (!hasExp && !hasCand) continue;
			if (!hasCand) {
				rows.push({ key, ext, verdict: 'missing' });
				continue;
			}
			if (!hasExp) {
				rows.push({ key, ext, verdict: 'unexpected' });
				continue;
			}
			const cand = fs.readFileSync(candFile, 'utf8');
			if (ext === 'js') {
				const { tree, statuses } = expectedTree(unit, task, variantId, 'js');
				const bad = statuses.filter((s) => s.status === 'stale');
				let actual;
				try {
					actual = parseJs(cand);
				} catch (e) {
					rows.push({ key, ext, verdict: 'unparseable', detail: e.message });
					continue;
				}
				const d = firstDiff(tree, actual);
				rows.push({
					key,
					ext,
					verdict: d === null ? 'match' : 'mismatch',
					detail: [d !== null && `first diff at ${d || '<root>'}`, bad.length && `${bad.length} stale adjustment(s)`]
						.filter(Boolean)
						.join('; ')
				});
			} else if (ext.endsWith('.json')) {
				const ok = same(JSON.parse(fs.readFileSync(expFile, 'utf8')), JSON.parse(cand));
				rows.push({ key, ext, verdict: ok ? 'match' : 'mismatch' });
			} else {
				rows.push({ key, ext, verdict: fs.readFileSync(expFile, 'utf8') === cand ? 'match' : 'mismatch' });
			}
		}
	}
	const counts = {};
	for (const r of rows) counts[r.verdict] = (counts[r.verdict] ?? 0) + 1;
	return { units: units.length, rows, counts };
}
