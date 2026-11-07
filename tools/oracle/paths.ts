import path from 'node:path';
import type { Task, UnitKey } from './types.ts';

export const ROOT = path.resolve(import.meta.dirname, '../..');
export const CORPUS = path.join(ROOT, 'corpus');
// Units live under corpus/<family>/ (svelte, vue, html, …); everything shared lives in _registry/.
const REGISTRY = path.join(CORPUS, '_registry');
export const SOURCES_FILE = path.join(REGISTRY, 'sources.json');
export const ORACLES_FILE = path.join(REGISTRY, 'oracles.json');
export const IMPORT_REPORT_FILE = path.join(REGISTRY, 'import-report.json');

// A path segment that collides with a reserved name gets a `~` prefix; so does one already starting
// with `~`, which keeps the mapping reversible. Only reserved children then match `actual/` etc.
const RESERVED = /^(expected|actual|cache|meta\.json|fixture\.toml|input\..*|~.*)$/;
const encodePath = (p: string): string =>
	p
		.split('/')
		.map((seg) => (RESERVED.test(seg) ? `~${seg}` : seg))
		.join('/');
export const decodePath = (p: string): string =>
	p
		.split('/')
		.map((seg) => (seg.startsWith('~') ? seg.slice(1) : seg))
		.join('/');

// One directory per unit, corpus/<family>/<source>/<original path>/, holding everything about it:
//   input<ext>   meta.json   fixture.toml   expected/<task>/<variant>.<ext>   actual/…   cache/…
export const sourceDir = (family: string, source: string): string =>
	path.join(CORPUS, family, source);
export const unitDir = (unit: UnitKey): string =>
	path.join(CORPUS, unit.family, unit.source, encodePath(unit.path));
export const inputFile = (unit: UnitKey, ext: string): string =>
	path.join(unitDir(unit), `input${ext}`);
export const metaFile = (unit: UnitKey): string => path.join(unitDir(unit), 'meta.json');
export const fixtureFile = (unit: UnitKey): string => path.join(unitDir(unit), 'fixture.toml');
export const licensesDir = (source: string): string => path.join(REGISTRY, 'licenses', source);

export const snapshotDir = (task: Task): string =>
	task.storage === 'cached' ? 'cache' : 'expected';
export const expectedFile = (task: Task, variant: string, unit: UnitKey, ext: string): string =>
	path.join(unitDir(unit), snapshotDir(task), task.id, `${variant}.${ext}`);

/** Forward-slash path of `p` relative to `base`, the form every key uses. */
export const rel = (base: string, p: string): string =>
	path.relative(base, p).split(path.sep).join('/');
