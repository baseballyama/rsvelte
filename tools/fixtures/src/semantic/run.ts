import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createInterface } from 'node:readline';
import { performance } from 'node:perf_hooks';
import { version as typescriptVersion } from 'typescript-7';
import { VERSION as svelteVersion } from 'svelte/compiler';
import { COMPILER_OPTIONS, ORACLE_OPTIONS, SemanticChecker, type Projection, type UnitResult } from './checker.ts';
import { MAX_TYPE_PAIRS } from './types.ts';

const require = createRequire(import.meta.url);
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');

export async function* projections(binary: string, inputs: string): AsyncGenerator<Projection> {
	const child = spawn(binary, [inputs], { stdio: ['ignore', 'pipe', 'inherit'] });
	const completion = new Promise<void>((resolve, reject) => {
		child.once('error', reject);
		child.once('close', (code, signal) => code === 0 ? resolve() : reject(new Error(`projector failed: code=${code}, signal=${signal}`)));
	});
	// Register the rejection before reading stdout; a spawn error can precede the first line.
	void completion.catch(() => {});
	const lines = createInterface({ input: child.stdout });
	try {
		for await (const line of lines) {
			const value: unknown = JSON.parse(line);
			if (!value || typeof value !== 'object') throw new Error('projector record must be an object');
			const record = value as Record<string, unknown>;
			if (typeof record.input !== 'string' || !['projected', 'unsupported', 'parse-error'].includes(String(record.status))) throw new Error('invalid projector record');
			if (record.status === 'projected' && (typeof record.code !== 'string' || !Array.isArray(record.mappings))) throw new Error('projector omitted code or span mappings');
			if (record.detail !== undefined && typeof record.detail !== 'string') throw new Error('projector detail must be a string');
			yield record as unknown as Projection;
		}
		await completion;
	} finally {
		lines.close();
		if (child.exitCode === null) child.kill();
		await completion;
	}
}

export interface SemanticOptions {
	inputs: string;
	projector: string;
	tools: string;
	filter?: string;
	limit?: number;
	onProgress?: (selected: number, input: string) => void;
}

export async function comparePopulation(options: SemanticOptions) {
	const inputs = fs.realpathSync(options.inputs), binary = fs.realpathSync(options.projector);
	const tools = fs.realpathSync(options.tools);
	const projectorHash = hash(fs.readFileSync(binary));
	const harnessHashes = Object.fromEntries(['checker.ts', 'observations.ts', 'run.ts', 'types.ts', 'mappings.ts'].map((name) =>
		[name, hash(fs.readFileSync(path.join(tools, 'src/semantic', name)))]));
	for (const name of ['index.ts', 'coordinates.ts']) harnessHashes[`type-information/${name}`] = hash(fs.readFileSync(path.resolve(tools, '../type-information/src', name)));
	const repository = path.resolve(tools, '../..');
	const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repository, encoding: 'utf8' });
	if (revision.status !== 0) throw new Error(`git identity failed: ${revision.stderr}`);
	if (options.limit !== undefined && (!Number.isSafeInteger(options.limit) || options.limit < 1)) throw new Error('limit must be a positive integer');
	const started = performance.now();
	const checker = new SemanticChecker(tools);
	const mapperHash = hash(fs.readFileSync(checker.mapperBinary));
	const rows: (UnitResult & { sourceHash: string; projectionHash?: string })[] = [];
	let population = 0;
	try {
		for await (const projection of projections(binary, inputs)) {
			population++;
			if (options.filter && !path.relative(inputs, projection.input).includes(options.filter)) continue;
			if (options.limit !== undefined && rows.length >= options.limit) continue;
			const source = fs.readFileSync(projection.input, 'utf8');
			const result = checker.compare(projection, source);
			rows.push({ ...result, sourceHash: hash(source), ...(projection.code === undefined ? {} : { projectionHash: hash(projection.code) }) });
			options.onProgress?.(rows.length, projection.input);
		}
	} finally {
		checker.close();
	}
	if (!rows.length) throw new Error('the selected input population is empty');
	const units = { match: 0, mismatch: 0, UNMEASURED: 0, unsupported: 0 };
	const queries = { match: 0, mismatch: 0, UNMEASURED: 0 };
	const publicContracts = { match: 0, mismatch: 0, UNMEASURED: 0 };
	for (const row of rows) {
		units[row.verdict]++;
		publicContracts[row.publicContract]++;
		for (const query of row.queries) queries[query.verdict]++;
	}
	return {
		gitHead: revision.stdout.trim(), projectorHash, harnessHashes,
		mapperHash,
		versions: { typescript: typescriptVersion, svelte: svelteVersion, svelte2tsx: require('svelte2tsx/package.json').version as string },
		compilerOptions: COMPILER_OPTIONS,
		oracleOptions: ORACLE_OPTIONS,
		maxTypePairs: MAX_TYPE_PAIRS,
		declarationHashes: Object.fromEntries([
			path.resolve(tools, '../../crates/languages/svelte/typescript_projection/vendor/svelte-jsx-v4.d.ts'),
			path.resolve(tools, '../../crates/languages/svelte/typescript_projection/projection.d.ts'),
			path.join(tools, 'node_modules/svelte2tsx/svelte-shims-v4.d.ts')
		].map((file) => [path.basename(file), hash(fs.readFileSync(file))])),
		inputs, filter: options.filter ?? null, limit: options.limit ?? null,
		population, selected: rows.length, excluded: population - rows.length, units, queries,
		publicContracts,
		milliseconds: { ...checker.milliseconds, total: performance.now() - started }, rows
	};
}
