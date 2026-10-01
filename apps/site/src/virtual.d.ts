declare module 'virtual:rsvelte-source' {
	export const modules: import('$lib/build/source-plugin').HighlightedModule[];
	/** HEAD of the repository at build time. */
	export const rev: string;
	/** Whether crates/ matched `rev` exactly, so line links to it are valid. */
	export const clean: boolean;
	export const crates: import('$lib/build/source-plugin').CrateSize[];
	/** tools/performance/baseline.json at build time. */
	export const performanceBaseline: import('$lib/server/performance').PerformanceBaseline;
	/** Every committed tools/performance/baseline.json, oldest first, read from git at build time. */
	export const performanceHistory: import('$lib/build/performance-history').PerformanceRecord[];
	/** fixtures/_registry/parity.json at build time, counted per task and verdict. */
	export const parity: { units: number; rows: import('$lib/build/source-plugin').ParityRow[] };
}
