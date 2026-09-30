import { parity, perfBaseline, perfHistory as history } from 'virtual:rsvelte-source';
import type { PerfRecord } from '$lib/build/perf-history';

export type { PerfRecord };

export interface PerfPhase {
	calls: number;
	allocs: number;
	alloc_bytes: number;
}

/** The shape of tools/perf/baseline.json (tools/perf/bin/perf.ts `Baseline`). */
export interface PerfBaseline {
	population: { documents: number; source_bytes: number; tasks: string[] };
	allocs: number;
	alloc_bytes: number;
	peak_live_growth_bytes: number;
	phases: Record<string, PerfPhase>;
	instructions: Record<string, number>;
	load_instructions: Record<string, number>;
}

export { PLATFORM } from '$lib/build/perf-history';

export function baseline(): PerfBaseline {
	return perfBaseline;
}

export function perfHistory(): PerfRecord[] {
	return history;
}

export function paritySummary() {
	return parity;
}
