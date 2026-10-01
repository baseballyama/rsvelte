import { parity, performanceBaseline, performanceHistory as history } from 'virtual:rsvelte-source';
import type { PerformanceRecord } from '$lib/build/performance-history';

export type { PerformanceRecord };

export interface PerformancePhase {
	calls: number;
	allocations: number;
	alloc_bytes: number;
}

/** The shape of tools/performance/baseline.json (tools/performance/bin/performance.ts `Baseline`). */
export interface PerformanceBaseline {
	population: { documents: number; source_bytes: number; tasks: string[] };
	allocations: number;
	alloc_bytes: number;
	peak_live_growth_bytes: number;
	phases: Record<string, PerformancePhase>;
	instructions: Record<string, number>;
	load_instructions: Record<string, number>;
}

export { PLATFORM } from '$lib/build/performance-history';

export function baseline(): PerformanceBaseline {
	return performanceBaseline;
}

export function performanceHistory(): PerformanceRecord[] {
	return history;
}

export function paritySummary() {
	return parity;
}
