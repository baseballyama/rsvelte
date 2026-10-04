import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const CACHE_EVENTS = ['Ir', 'I1mr', 'ILmr', 'Dr', 'D1mr', 'DLmr', 'Dw', 'D1mw', 'DLmw'] as const;
export type CacheEvent = typeof CACHE_EVENTS[number];
export type CacheCounts = Record<CacheEvent, number>;
export type Cache = { bytes: number; ways: number; line_bytes: number };
export type CacheModel = { i1: Cache; d1: Cache; ll: Cache };
export const DEFAULT_CACHE_MODEL: CacheModel = {
	i1: { bytes: 32 * 1024, ways: 8, line_bytes: 64 },
	d1: { bytes: 32 * 1024, ways: 8, line_bytes: 64 },
	ll: { bytes: 8 * 1024 * 1024, ways: 16, line_bytes: 64 }
};

export function validateModel(model: CacheModel): void {
	for (const name of ['i1', 'd1', 'll'] as const) {
		const cache = model[name];
		if (!cache) throw new Error(`missing ${name} cache`);
		for (const value of [cache.bytes, cache.ways, cache.line_bytes]) {
			if (!Number.isSafeInteger(value) || value < 1) throw new Error(`invalid ${name} cache size`);
		}
		const sets = cache.bytes / cache.ways / cache.line_bytes;
		if (!Number.isInteger(Math.log2(sets)) || !Number.isInteger(Math.log2(cache.line_bytes))) throw new Error(`${name} cache sets and line size must be powers of two`);
	}
}

export function cacheModelKey(model: CacheModel): string {
	validateModel(model);
	return (['i1', 'd1', 'll'] as const).map(name => {
		const cache = model[name];
		return `${name}:${cache.bytes},${cache.ways},${cache.line_bytes}`;
	}).join('/');
}

export function parseCachegrind(text: string): CacheCounts {
	const events = /^events:\s+(.+)$/m.exec(text)?.[1]?.trim().split(/\s+/);
	const values = /^summary:\s+(.+)$/m.exec(text)?.[1]?.trim().split(/\s+/);
	if (!events || !values || events.length !== values.length) throw new Error('missing or invalid Cachegrind summary');
	const result = {} as CacheCounts;
	for (const event of CACHE_EVENTS) {
		const index = events.indexOf(event);
		if (index === -1) throw new Error(`unmeasured Cachegrind event ${event}`);
		const token = values[index]!;
		const value = Number(token);
		if (!/^\d+$/.test(token) || !Number.isSafeInteger(value)) throw new Error(`invalid ${event} count`);
		result[event] = value;
	}
	if (result.Ir === 0) throw new Error('Cachegrind recorded no instructions');
	return result;
}

export function validateCounts(counts: CacheCounts): void {
	for (const event of CACHE_EVENTS) {
		if (typeof counts[event] !== 'number' || !Number.isFinite(counts[event]) || counts[event] < 0 || counts[event] > Number.MAX_SAFE_INTEGER) throw new Error(`invalid ${event} count`);
	}
}

export function runCachegrind(command: [string, ...string[]], output: string, model: CacheModel): CacheCounts {
	validateModel(model);
	fs.mkdirSync(path.dirname(output), { recursive: true });
	fs.rmSync(output, { force: true });
	const args = ['--tool=cachegrind', '--cache-sim=yes', '--branch-sim=no', `--cachegrind-out-file=${output}`];
	for (const [name, option] of [['i1', 'I1'], ['d1', 'D1'], ['ll', 'LL']] as const) {
		const cache = model[name];
		args.push(`--${option}=${cache.bytes},${cache.ways},${cache.line_bytes}`);
	}
	const run = spawnSync('valgrind', [...args, ...command], { encoding: 'utf8', maxBuffer: 1 << 28 });
	fs.writeFileSync(`${output}.stdout`, run.stdout ?? '');
	fs.writeFileSync(`${output}.stderr`, run.stderr ?? '');
	if (run.status !== 0) throw new Error(`Cachegrind exited ${run.status}: ${run.error?.message ?? run.stderr}`);
	return parseCachegrind(fs.readFileSync(output, 'utf8'));
}

export function compareCache(before: CacheCounts, after: CacheCounts, tolerance: number): { event: CacheEvent; before: number; after: number; moved: boolean }[] {
	validateCounts(before);
	validateCounts(after);
	if (!Number.isFinite(tolerance) || tolerance < 0 || tolerance >= 1) throw new Error('invalid cache tolerance');
	return CACHE_EVENTS.map(event => ({ event, before: before[event], after: after[event], moved: Math.abs(after[event] - before[event]) > before[event] * tolerance }));
}
