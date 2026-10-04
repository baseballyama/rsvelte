import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type Counters = {
	cycles: number; instructions: number; user_time_ns: number; system_time_ns: number;
	child_time_ns: number; lifetime_max_phys_footprint_bytes: number; rusage_flavor: 4 | 6; performance_levels: number;
	p_cycles: number | null; p_instructions: number | null;
};

const REQUIRED = ['cycles', 'instructions', 'user_time_ns', 'system_time_ns', 'child_time_ns', 'lifetime_max_phys_footprint_bytes', 'performance_levels'] as const;
const OPTIONAL = ['p_cycles', 'p_instructions'] as const;
const count = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;

export function parseCounters(text: string): Counters {
	const record: Record<string, unknown> = JSON.parse(text);
	for (const key of REQUIRED) if (!count(record[key])) throw new Error(`invalid ${key} counter`);
	// null is UNMEASURED; a missing key is a broken collector, not an old host.
	for (const key of OPTIONAL) if (record[key] !== null && !count(record[key])) throw new Error(`invalid ${key} counter`);
	if (record.rusage_flavor !== 4 && record.rusage_flavor !== 6) throw new Error('invalid rusage_flavor');
	const counters = record as Counters;
	if (counters.cycles === 0 || counters.instructions === 0) throw new Error('hardware counters did not increase');
	if (counters.lifetime_max_phys_footprint_bytes === 0) throw new Error('memory footprint was not recorded');
	if (counters.p_cycles !== null && counters.p_cycles > counters.cycles) throw new Error('P-core cycles exceed all cycles');
	if (counters.p_instructions !== null && counters.p_instructions > counters.instructions) throw new Error('P-core instructions exceed all instructions');
	// A reaped child ran outside these counters, so the sample would describe the wrong process.
	if (counters.child_time_ns > 0) throw new Error('the arm ran child processes; the counters cover only the process the runner started');
	return counters;
}

export function median(values: number[]): number {
	const sorted = values.toSorted((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	if (!sorted.length) throw new Error('no samples');
	return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

export function summarizeArm(counters: Counters[], rounds: number) {
	const cycles = counters.map(sample => sample.cycles / rounds);
	const measuredP = counters.every(sample => sample.p_cycles !== null && sample.p_instructions !== null);
	return {
		samples: counters.length,
		median_cycles_per_round: median(cycles), min_cycles_per_round: Math.min(...cycles), max_cycles_per_round: Math.max(...cycles),
		median_instructions_per_round: median(counters.map(sample => sample.instructions / rounds)),
		median_p_cycles_per_round: measuredP ? median(counters.map(sample => sample.p_cycles! / rounds)) : null,
		median_p_instructions_per_round: measuredP ? median(counters.map(sample => sample.p_instructions! / rounds)) : null,
		median_p_cycle_share: measuredP ? median(counters.map(sample => sample.p_cycles! / sample.cycles)) : null,
		max_lifetime_max_phys_footprint_bytes: Math.max(...counters.map(sample => sample.lifetime_max_phys_footprint_bytes)),
		unmeasured: measuredP ? [] : ['p_cycles', 'p_instructions']
	};
}

/** The file the kernel will run, found before any sample so a bad name costs nothing. */
export function resolveExecutable(command: string, searchPath = process.env.PATH ?? ''): string {
	const candidates = command.includes('/') ? [path.resolve(command)] : searchPath.split(path.delimiter).filter(Boolean).map(directory => path.join(directory, command));
	for (const candidate of candidates) {
		try {
			fs.accessSync(candidate, fs.constants.X_OK);
			if (fs.statSync(candidate).isFile()) return candidate;
		} catch {
			// Not executable here; try the next PATH entry, as the shell does.
		}
	}
	throw new Error(`executable not found: ${command}`);
}

export function checkLoad(limit: number, allowBusy: boolean): number {
	const load = os.loadavg()[0]!;
	if (load > limit && !allowBusy) throw new Error(`1-minute load ${load.toFixed(2)} is above ${limit}; wait for an idle machine or pass --allow-busy`);
	return load;
}

export function hostRecord(load: number, limit: number, allowBusy: boolean) {
	const cpus = os.cpus();
	return { platform: process.platform, release: os.release(), arch: process.arch, cpu: cpus[0]?.model ?? 'UNMEASURED', logical_cpus: os.availableParallelism(), memory_bytes: os.totalmem(), node: process.version, start_load_1m: load, load_limit: limit, allow_busy: allowBusy };
}
