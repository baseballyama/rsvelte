export interface BenchmarkResult {
	name: string;
	filesCount: number;
	durationMs: number;
	throughputFilesPerSec: number;
}

export interface BenchmarkResults {
	generatedAt: string;
	commitSha: string;
	testFilesCount: number;
	javascript: BenchmarkResult;
	rustSingleThread: BenchmarkResult;
	rustMultiThread: BenchmarkResult;
	speedup: {
		singleThreadVsJs: number;
		multiThreadVsJs: number;
	};
}
