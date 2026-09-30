// The performance history: every commit that changed tools/perf/baseline.json, oldest first, with
// what it recorded, read from git at build time. A baseline edited but not yet committed ends the
// list as a working-tree record, so the history always ends at the baseline being built.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const PLATFORM = 'arm64-linux';

export interface PerfRecord {
	/** A 10-character commit, or `null` for the working tree's uncommitted baseline. */
	sha: string | null;
	subject: string;
	allocs: number;
	alloc_bytes: number;
	peak_live_growth_bytes: number;
	instructions: number | null;
	load_instructions: number | null;
}

interface BaselineCounters {
	allocs: number;
	alloc_bytes: number;
	peak_live_growth_bytes: number;
	instructions?: Record<string, number>;
	load_instructions?: Record<string, number>;
}

const counters = (b: BaselineCounters) => ({
	allocs: b.allocs,
	alloc_bytes: b.alloc_bytes,
	peak_live_growth_bytes: b.peak_live_growth_bytes,
	instructions: b.instructions?.[PLATFORM] ?? null,
	load_instructions: b.load_instructions?.[PLATFORM] ?? null
});

/**
 * @throws when a shallow clone's boundary cuts the file's history, which would otherwise start
 * silently at the clone's depth: a boundary commit reads as adding every file.
 */
export function perfHistory(root: string): PerfRecord[] {
	const git = (...args: string[]) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 1 << 26 }).trim();
	const file = 'tools/perf/baseline.json';
	const shas = git('log', '--reverse', '--format=%H', '--', file).split('\n').filter(Boolean);
	const shallow = path.resolve(root, git('rev-parse', '--git-path', 'shallow'));
	const boundary = existsSync(shallow) ? readFileSync(shallow, 'utf8').split('\n') : [];
	if (shas.length === 0 || boundary.includes(shas[0]!)) {
		throw new Error(`the history of ${file} is cut by a shallow clone: fetch with depth 0`);
	}
	const records: PerfRecord[] = shas.map((sha) => ({
			sha: sha.slice(0, 10),
			subject: git('log', '-1', '--format=%s', sha),
			...counters(JSON.parse(git('show', `${sha}:${file}`)))
		}));
	const now = counters(JSON.parse(readFileSync(path.join(root, file), 'utf8')));
	const last = records.at(-1)!;
	if ((Object.keys(now) as (keyof typeof now)[]).some((k) => last[k] !== now[k])) {
		records.push({ sha: null, subject: '作業ツリーの未コミットの基準値', ...now });
	}
	return records;
}
