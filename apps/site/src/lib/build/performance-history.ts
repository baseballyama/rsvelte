// The performance history: every commit that changed tools/performance/baseline.json, oldest first, with
// what it recorded, read from git at build time. A baseline edited but not yet committed ends the
// list as a working-tree record, so the history always ends at the baseline being built.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const PLATFORM = 'arm64-linux';

export interface PerformanceRecord {
	/** A 10-character commit, or `null` for the working tree's uncommitted baseline. */
	sha: string | null;
	subject: string;
	allocations: number;
	alloc_bytes: number;
	peak_live_growth_bytes: number;
	instructions: number | null;
	load_instructions: number | null;
	/** The instructions count every this-th file; records with different samples do not compare. */
	instruction_sample: number;
}

interface BaselineCounters {
	'allocs': number;
	alloc_bytes: number;
	peak_live_growth_bytes: number;
	instructions?: Record<string, number>;
	load_instructions?: Record<string, number>;
	instruction_sample?: { every: number };
}

const counters = (b: BaselineCounters) => ({
	allocations: b['allocs'],
	alloc_bytes: b.alloc_bytes,
	peak_live_growth_bytes: b.peak_live_growth_bytes,
	instructions: b.instructions?.[PLATFORM] ?? null,
	load_instructions: b.load_instructions?.[PLATFORM] ?? null,
	instruction_sample: b.instruction_sample?.every ?? 1,
});

/**
 * @throws when a shallow clone's boundary cuts the file's history, which would otherwise start
 * silently at the clone's depth: a boundary commit reads as adding every file.
 */
export function performanceHistory(root: string): PerformanceRecord[] {
	const git = (...args: string[]) =>
		execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 1 << 26 }).trim();
	const file = 'tools/performance/baseline.json';
	const historicalFile = 'tools/perf/baseline.json';
	// One process for the commits and one for every file version: each git process is slow on a busy machine.
	const commits = git('log', '--reverse', '--format=%H%x09%s', '--', file, historicalFile)
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			const tab = line.indexOf('\t');
			return { sha: line.slice(0, tab), subject: line.slice(tab + 1) };
		});
	const shallow = path.resolve(root, git('rev-parse', '--git-path', 'shallow'));
	const boundary = existsSync(shallow) ? readFileSync(shallow, 'utf8').split('\n') : [];
	if (commits.length === 0 || boundary.includes(commits[0]!.sha)) {
		throw new Error(`the history of ${file} is cut by a shallow clone: fetch with depth 0`);
	}
	const blobs = readBlobs(
		root,
		commits.flatMap(({ sha }) => [`${sha}:${file}`, `${sha}:${historicalFile}`]),
	);
	const records: PerformanceRecord[] = commits.map(({ sha, subject }) => {
		const recorded = blobs.get(`${sha}:${file}`) ?? blobs.get(`${sha}:${historicalFile}`);
		if (recorded === undefined) throw new Error(`Missing baseline at ${sha}`);
		return Object.assign(counters(JSON.parse(recorded)), { sha: sha.slice(0, 10), subject });
	});
	const now = counters(JSON.parse(readFileSync(path.join(root, file), 'utf8')));
	const last = records.at(-1)!;
	if ((Object.keys(now) as (keyof typeof now)[]).some((k) => last[k] !== now[k])) {
		records.push({ sha: null, subject: '作業ツリーの未コミットの基準値', ...now });
	}
	return records;
}

/** The contents of `<commit>:<path>` objects that exist, read through one `git cat-file --batch`. */
function readBlobs(root: string, objects: string[]): Map<string, string> {
	const output = execFileSync('git', ['-C', root, 'cat-file', '--batch'], {
		input: objects.join('\n') + '\n',
		maxBuffer: 1 << 26,
	});
	const blobs = new Map<string, string>();
	let at = 0;
	for (const object of objects) {
		const headerEnd = output.indexOf(10, at);
		const header = output.subarray(at, headerEnd).toString('utf8');
		at = headerEnd + 1;
		if (header.endsWith(' missing')) continue;
		const size = Number(header.split(' ')[2]);
		if (!Number.isInteger(size)) throw new Error(`Unexpected git cat-file header: ${header}`);
		blobs.set(object, output.subarray(at, at + size).toString('utf8'));
		// The content is followed by one newline.
		at += size + 1;
	}
	return blobs;
}
