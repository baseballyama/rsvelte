import path from 'node:path';

export const ROOT = path.resolve(import.meta.dirname, '../..');
export const CORPUS = path.join(ROOT, 'corpus');
// Sources live under corpus/<family>/ (svelte, vue, html, …); everything shared lives in _registry/.
const REGISTRY = path.join(CORPUS, '_registry');
export const SOURCES_FILE = path.join(REGISTRY, 'sources.json');
export const ORACLES_FILE = path.join(REGISTRY, 'oracles.json');
export const IMPORT_REPORT_FILE = path.join(REGISTRY, 'import-report.json');
/** The hand-written part of units (types.ts `FixtureToml`), one table per unit key. */
export const UNITS_FILE = path.join(REGISTRY, 'units.toml');
/** The project configuration both type checkers read for every source. */
export const TSCONFIG_FILE = path.join(REGISTRY, 'tsconfig.json');

// One directory per source, corpus/<family>/<source>/, holding a pack (./pack.ts) of its inputs
// and one of the official output per task and variant:
//   inputs.pack   expected/<task>/<variant>.pack   actual/<task>/<variant>.pack (git-ignored)
export const sourceDir = (family: string, source: string): string =>
	path.join(CORPUS, family, source);
export const inputsPack = (family: string, source: string): string =>
	path.join(sourceDir(family, source), 'inputs.pack');
export const expectedPack = (
	family: string,
	source: string,
	task: string,
	variant: string,
): string => path.join(sourceDir(family, source), 'expected', task, `${variant}.pack`);
export const licensesDir = (source: string): string => path.join(REGISTRY, 'licenses', source);

/** Forward-slash path of `p` relative to `base`, the form every key uses. */
export const rel = (base: string, p: string): string =>
	path.relative(base, p).split(path.sep).join('/');
