export interface CompatibilityReport {
  schemaVersion: number;
  kind: "rsvelte-compatibility-report";
  generatedAt: string;
  commit: ReportCommit;
  corpus: {
    name: string;
    configuredFiles: number;
    componentFiles: number;
    moduleFiles: number;
    sourceCount: number;
    truncated: boolean;
  };
  summary: {
    exact: number;
    total: number;
    percentage: number;
    outputMatches: number;
    errorParity: number;
    divergences: number;
    unparseable: number;
  };
  surfaces: CompatibilitySurface[];
  competitors: CompatibilityCompetitor[];
  unmeasuredCompetitors: { id: string; label: string; reason: string }[];
  methodology: string[];
}

export interface CompatibilitySurface {
  id: "parser" | "client" | "server" | "client-dev" | "server-dev" | "fmt" | "svelte2tsx" | "lint";
  label: string;
  status: "pass" | "differences" | "unmeasured";
  matched: number | null;
  total: number | null;
  differences: number;
  unit: "fixtures" | "files";
  note: string;
}

export interface CompatibilityCompetitor {
  id: string;
  label: string;
  version?: string;
  metric: "normalized-output-parity";
  measuredAt: string;
  surfaces: {
    id: "client" | "server" | "client-dev" | "server-dev";
    label: string;
    matched: number;
    compiled: number;
    total: number;
    status: "reference" | "ok" | "unranked" | "unsupported" | "unmeasured";
    referenceVersion?: string;
  }[];
  note: string;
}

export interface PerformanceReport {
  schemaVersion: number;
  kind: "rsvelte-performance-report";
  generatedAt: string;
  provenance: {
    benchmarkDesign: string;
    reproduceCommand?: string;
    competitorPackages: string[];
    competitorReferences: string[];
  };
  commit: ReportCommit;
  corpus: {
    name: string;
    configuredComponentFiles: number;
    measuredFiles: number;
    bytes: number;
    truncated: boolean;
    fileSetHash: string;
  };
  runner: {
    label: string;
    platform: string;
    arch: string;
    cpus: number;
    cpuModel: string;
    node: string;
    loadAvg1min: number;
    warmups: number;
    runs: number;
  };
  surfaces: PerformanceSurface[];
  toolTasks: PerformanceToolTask[];
  printerBenchmarks?: PrinterBenchmarks;
  benchmarkCoverage?: BenchmarkCoverage[];
  alternativeProducts?: AlternativeProduct[];
  unsupported: UnsupportedCompetitor[];
  methodology: string[];
}

export interface PrinterBenchmarks {
  schemaVersion: number;
  measurementKind: "native-wall";
  generatedAt: string;
  workloadHash: string;
  versions: {
    rsvelteEsrap: string;
    oxcCodegen: string;
    javascriptEsrap: string;
  };
  runner: {
    label: string;
    platform: string;
    arch: string;
    cpus: number;
    cpuModel: string;
    node: string;
    loadAvg1min: number;
  };
  warmups: number;
  runs: number;
  batch: number;
  cases: {
    id: "parsed-no-map" | "decoded-map" | "comments-common";
    label: string;
    comparability: string;
    files: number;
    bytes: number;
    variants: {
      id: "rsvelte-esrap" | "oxc-codegen" | "javascript-esrap";
      label: string;
      medianMs: number;
      cvPct: number;
      timesMs: number[];
      relativeToRsvelte: number;
      workGate: "parseable-output";
    }[];
  }[];
}

export interface PerformanceSurface {
  id: "client" | "server" | "client-dev" | "server-dev";
  generate: "client" | "server";
  dev: boolean;
  comparisonClasses: ComparisonClass[];
}

export interface PerformanceToolTask {
  id: "parser" | "svelte2tsx" | "fmt" | "lint" | "svelte-check-tsgo";
  label: string;
  dataset: "compatibility-corpus" | "svelte-test-fixtures" | "synthetic-workspace";
  files: number;
  excludedFiles: number;
  // Rules both linters run. Present on the `lint` task only.
  rulesCount?: number;
  reference: ToolPerformanceVariant;
  rsvelteSingle: ToolPerformanceVariant;
  rsvelteParallel: ToolPerformanceVariant;
  alternatives?: (ToolPerformanceVariant & {
    id: string;
    completedFiles: number;
    speedupVsRsvelteParallel: number;
    rulesCount?: number;
    comparable?: boolean;
    scope?: string;
    compatibility?: {
      matchedDiagnostics: number;
      expectedDiagnostics: number;
    };
  })[];
  note: string;
}

export interface AlternativeProduct {
  task: "fmt" | "lint" | "typecheck";
  label: string;
  status: "unmeasured" | "different-scope";
  note: string;
}

export interface BenchmarkCoverage {
  id: string;
  label: string;
  status: "measured" | "unmeasured" | "unsupported";
  detail: string;
}

export interface ToolPerformanceVariant {
  label: string;
  version?: string;
  threading?: "single" | "parallel";
  speedup?: number;
  durationMs: number;
  throughputFilesPerSec: number;
  minMs: number;
  maxMs: number;
  meanMs: number;
  stdDevMs: number;
  samples: number;
}

export interface ComparisonClass {
  id: string;
  files: number;
  excludedFiles: number;
  bytes: number;
  variants: PerformanceVariant[];
}

export interface PerformanceVariant {
  id: string;
  label: string;
  version: string;
  threading?: string;
  status: "reference" | "ok" | "unranked" | "unsupported";
  compiledFiles?: number;
  correctFiles?: number;
  benchmarkFiles?: number;
  benchmarkReferenceMedianMs?: number;
  attemptFiles?: number;
  attemptMedianMs?: number;
  attemptRatioVsRsvelte?: number;
  adapter?: string;
  failureExamples?: { id: string; code: string }[];
  exactOutputDivergences?: number;
  speedup?: number;
  medianMs?: number;
  minMs?: number;
  maxMs?: number;
  stddevMs?: number;
  cvPct?: number;
  throughputFilesPerSec?: number;
  rawMs?: number[];
}

export interface UnsupportedCompetitor {
  id: string;
  label: string;
  version?: string;
  reason: string;
}

interface ReportCommit {
  rsvelte: string;
  upstreamSvelte: string;
}
