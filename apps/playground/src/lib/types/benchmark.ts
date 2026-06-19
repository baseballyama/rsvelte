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

export interface RunnerInfo {
  // Free-form label that names the host. In CI this is the GitHub-hosted
  // runner label (e.g. "ubuntu-22.04-arm-16-cores"); locally it's "local".
  label: string;
  os: string; // process.platform — "linux" / "darwin" / "win32"
  arch: string; // process.arch — "x64" / "arm64" / …
  cpus: number;
  cpuModel: string;
}

export interface BenchmarkResults extends BenchmarkTaskResults {
  generatedAt: string;
  commitSha: string;
  // Optional — older JSON files don't have this field.
  runner?: RunnerInfo;
  testFilesCount: number;
  parse: BenchmarkTaskResults;
  svelte2tsx?: BenchmarkTaskResults;
  // rsvelte_formatter vs prettier-plugin-svelte. Optional — older JSON
  // snapshots predate the fmt task.
  fmt?: BenchmarkTaskResults;
  svelteCheck?: SvelteCheckBenchmarkTaskResults;
}
