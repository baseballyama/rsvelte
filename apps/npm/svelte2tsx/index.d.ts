export interface Svelte2TsxOptions {
  filename?: string;
  isTsFile?: boolean;
  mode?: "ts" | "dts";
  accessors?: boolean;
  namespace?: "html" | "svg" | "mathml";
  version?: "4" | "5";
}

export interface Svelte2TsxResult {
  code: string;
  map: string | null;
  exportedNames: {
    props: string[];
    all: string[];
  };
  events: Record<string, unknown>;
}

export function svelte2tsx(source: string, options?: Svelte2TsxOptions): Promise<Svelte2TsxResult>;

export default svelte2tsx;
