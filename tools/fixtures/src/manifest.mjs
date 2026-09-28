import fs from 'node:fs';
import { manifestFile, SOURCES_FILE, OVERRIDES_FILE } from './paths.mjs';
import { writeIfChanged, stableStringify } from './fsutil.mjs';

export function loadSources() {
	return JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8'));
}

export function includedSources() {
	return loadSources().filter((s) => !s.excluded);
}

/** One JSON object per line, sorted by path. Each unit is `{ source, path, ... }`. */
export function readManifest(source) {
	let text;
	try {
		text = fs.readFileSync(manifestFile(source), 'utf8');
	} catch {
		return [];
	}
	return text
		.split('\n')
		.filter(Boolean)
		.map((line) => ({ source, ...JSON.parse(line) }));
}

export function writeManifest(source, units) {
	const lines = units
		.map(({ source: _s, ...rest }) => rest)
		.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
		.map((u) => stableStringify(u, ''));
	return writeIfChanged(manifestFile(source), lines.join('\n') + (lines.length ? '\n' : ''));
}

/**
 * fixtures/overrides.json, keyed by `<source>/<path>`: hand-written per-unit exceptions the importer
 * must not overwrite. `skip` maps a task id or `task/variant` to the reason it does not apply.
 */
export function loadOverrides() {
	try {
		return JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf8'));
	} catch {
		return {};
	}
}

export function allUnits(sourceIds) {
	const ids = sourceIds ?? includedSources().map((s) => s.id);
	const overrides = loadOverrides();
	return ids.flatMap((id) => readManifest(id)).map((u) => ({ ...u, overrides: overrides[`${u.source}/${u.path}`] ?? {} }));
}

export function applies(task, variantId, unit) {
	const skip = unit.overrides.skip ?? {};
	return task.appliesTo(unit) && !skip[task.id] && !skip[`${task.id}/${variantId}`];
}
