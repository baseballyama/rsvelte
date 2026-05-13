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

export interface BenchmarkResults extends BenchmarkTaskResults {
	generatedAt: string;
	commitSha: string;
	testFilesCount: number;
	parse: BenchmarkTaskResults;
	svelte2tsx?: BenchmarkTaskResults;
}
