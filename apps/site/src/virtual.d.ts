declare module 'virtual:rsvelte-source' {
	export const modules: import('$lib/build/source-plugin').HighlightedModule[];
	/** HEAD of the repository at build time. */
	export const rev: string;
	/** Whether crates/ matched `rev` exactly, so line links to it are valid. */
	export const clean: boolean;
	export const crates: import('$lib/build/source-plugin').CrateSize[];
	/** tools/perf/baseline.json at build time. */
	export const perfBaseline: import('$lib/server/perf').PerfBaseline;
	/** Every committed tools/perf/baseline.json, oldest first, read from git at build time. */
	export const perfHistory: import('$lib/build/perf-history').PerfRecord[];
	/** fixtures/_registry/parity.json at build time, counted per task and verdict. */
	export const parity: { units: number; rows: import('$lib/build/source-plugin').ParityRow[] };
}
