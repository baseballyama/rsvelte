export interface BenchmarkResult {
	durationMs: number;
	throughputFilesPerSec: number;
}

export interface BenchmarkTaskResults {
	javascript: BenchmarkResult;
	rustSingleThread: BenchmarkResult;
	rustMultiThread: BenchmarkResult;
	speedup: {
		singleThreadVsJs: number;
		multiThreadVsJs: number;
	};
}

export interface SvelteCheckBenchmarkTaskResults extends BenchmarkTaskResults {
	// The svelte-check task runs against a synthetic workspace rather
	// than the per-file corpus the other tasks share, so it carries its
	// own file count.
	filesCount: number;
}

export interface BenchmarkResults extends BenchmarkTaskResults {
	generatedAt: string;
	commitSha: string;
	testFilesCount: number;
	parse: BenchmarkTaskResults;
	svelte2tsx?: BenchmarkTaskResults;
	svelteCheck?: SvelteCheckBenchmarkTaskResults;
}
