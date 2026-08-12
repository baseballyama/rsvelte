import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const entryPath = fileURLToPath(import.meta.resolve("@verter/wasm"));
const packageDir = dirname(dirname(entryPath));
const wasmPath = join(packageDir, "wasm/verter_wasm_bg.wasm");
const nativeFetch = globalThis.fetch;

globalThis.fetch = async (input, init) => {
  if (String(input).endsWith("/dist/verter_wasm_bg.wasm")) {
    return new Response(await readFile(wasmPath), {
      headers: { "Content-Type": "application/wasm" },
    });
  }
  return nativeFetch(input, init);
};

let verter;
try {
  verter = await import(pathToFileURL(entryPath));
  await verter.initialize();
} finally {
  globalThis.fetch = nativeFetch;
}

export function createVerterCompiler({ dev }) {
  const host = new verter.VerterHost({ analysisLevel: "none", devMode: dev });

  return (source, options) => {
    if (options.generate !== "client") throw new Error("unsupported_generate_mode");
    const canonicalId = `/${options.filename}`;
    host.upsert({
      canonicalId,
      inputId: canonicalId,
      source,
      fileKind: "svelte",
    });
    try {
      const result = host.getVirtualFile({
        canonicalId,
        nodeKind: { kind: "main" },
        compileProfile: {
          filename: canonicalId,
          isProduction: !dev,
          ssr: false,
          requestedMode: "stateless",
        },
      });
      if (!result?.code || result.diagnostics?.hasErrors) throw new Error("compile_error");
      return { js: { code: result.code } };
    } finally {
      host.remove(canonicalId);
    }
  };
}
