import type { ParseResultWasm, CompileResultWasm } from "../../../../pkg/rsvelte_lint";

let wasmModule: typeof import("../../../../pkg/rsvelte_lint") | null = null;
let initPromise: Promise<void> | null = null;

export async function initCompiler(): Promise<void> {
  if (wasmModule) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const wasm = await import("../../../../pkg/rsvelte_lint");
    await wasm.default();
    wasmModule = wasm;
  })();

  return initPromise;
}

export function getVersion(): string {
  if (!wasmModule) throw new Error("WASM not initialized");
  return wasmModule.version();
}

export function parse(source: string): ParseResultWasm {
  if (!wasmModule) throw new Error("WASM not initialized");
  return wasmModule.parse_svelte(source);
}

export function compileClient(source: string, name: string): CompileResultWasm {
  if (!wasmModule) throw new Error("WASM not initialized");
  return wasmModule.compile_client(source, name);
}

export function compileServer(source: string, name: string): CompileResultWasm {
  if (!wasmModule) throw new Error("WASM not initialized");
  return wasmModule.compile_server(source, name);
}

export interface Svelte2TsxResult {
  success: boolean;
  code?: string;
  map?: string | null;
  exportedNames?: { props: string[]; all: string[] };
  error?: string;
}

export interface Svelte2TsxOptions {
  filename?: string;
  isTsFile?: boolean;
  mode?: "ts" | "dts";
}

/**
 * Convert a `.svelte` component to its TSX shadow file. The wasm boundary is a
 * JSON string in / JSON string out (see `rsvelte_core::wasm::svelte2tsx`).
 */
export function svelte2tsx(source: string, options: Svelte2TsxOptions = {}): Svelte2TsxResult {
  if (!wasmModule) throw new Error("WASM not initialized");
  const raw = wasmModule.svelte2tsx(source, JSON.stringify(options));
  try {
    return JSON.parse(raw) as Svelte2TsxResult;
  } catch {
    return { success: false, error: raw };
  }
}

/** A single lint finding, as emitted by `rsvelte_lint::wasm::lint`. */
export interface LintDiagnostic {
  severity: "error" | "warning";
  /** 1-indexed line. */
  line: number;
  /** 0-indexed (UTF-16) column. */
  column: number;
  endLine: number;
  endColumn: number;
  /** Rule id or compiler code, e.g. `svelte/no-at-html-tags` or `a11y_missing_attribute`. */
  code: string;
  message: string;
}

export function lint(source: string, filename = "Component.svelte"): LintDiagnostic[] {
  if (!wasmModule) throw new Error("WASM not initialized");
  try {
    return JSON.parse(wasmModule.lint(source, filename)) as LintDiagnostic[];
  } catch {
    return [];
  }
}

export type CompileMode = "client" | "server";
export type OutputTab = "result" | "js" | "css" | "ast";

export interface CompileStats {
  compileTime: number;
  outputSize: number;
}
