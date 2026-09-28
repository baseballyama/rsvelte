import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const FIXTURES = path.join(ROOT, 'fixtures');
export const SOURCES_FILE = path.join(FIXTURES, 'sources.json');
export const ORACLES_FILE = path.join(FIXTURES, 'oracles.json');
export const OVERRIDES_FILE = path.join(FIXTURES, 'overrides.json');
export const IMPORT_REPORT_FILE = path.join(FIXTURES, 'import-report.json');

export const inputsDir = (source) => path.join(FIXTURES, 'inputs', source);
export const inputFile = (unit) => path.join(FIXTURES, 'inputs', unit.source, unit.path);
export const manifestFile = (source) => path.join(FIXTURES, 'manifest', `${source}.jsonl`);
export const licensesDir = (source) => path.join(FIXTURES, 'licenses', source);
// Committed snapshots live in fixtures/expected; `cached` tasks regenerate into the ignored .cache.
const expectedRoot = (storage) => (storage === 'cached' ? path.join(FIXTURES, '.cache', 'expected') : path.join(FIXTURES, 'expected'));
export const expectedDir = (task, variant, source) =>
	path.join(expectedRoot(task.storage), task.id, variant, ...(source ? [source] : []));
export const expectedFile = (task, variant, unit, ext) =>
	path.join(expectedRoot(task.storage), task.id, variant, unit.source, `${unit.path}.${ext}`);
export const adjustFile = (unit) => path.join(FIXTURES, 'adjust', unit.source, `${unit.path}.toml`);

/** Forward-slash path of `p` relative to `base`, the form every manifest and key uses. */
export const rel = (base, p) => path.relative(base, p).split(path.sep).join('/');
