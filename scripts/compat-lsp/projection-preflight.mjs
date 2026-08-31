// Can the official server project the documents this run is about to compare?
//
// `DocumentSnapshot.ts:241` hands `svelte2tsx` the `parse` and `version` of the
// Svelte the server resolved; when it throws, `:291` replaces the projection
// with the instance script alone — no template — and every completion for that
// document is built with `isIncomplete: true`. The response is well formed, so
// the divergence it produces enrols into a shrink-only ratchet as a legitimate
// entry. This is the same predicate `gate-coverage.md` 27m measures with.
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

/// Fraction of `.svelte` cases the official server cannot project.
///
/// `serverScript` locates the `svelte2tsx` the server would call — upstream
/// requires that one statically, from beside itself. The `svelte` it calls it
/// with is resolved PER DOCUMENT, because `importPackage.ts:27-38` puts the
/// document's own directory ahead of the server's whenever the run is trusted;
/// resolving it once from the server would measure the fallback arm, which a
/// trusted run never reads. `versions` therefore reports a set, not a scalar.
export function projectionFailures(serverScript, cases, trusted) {
  const require = createRequire(path.resolve(serverScript));
  const { svelte2tsx } = require(require.resolve("svelte2tsx"));
  const resolved = new Map();
  const svelteFor = (directory) => {
    const key = trusted ? directory : "";
    if (!resolved.has(key)) {
      const paths = [];
      if (trusted) paths.push(directory);
      paths.push(path.dirname(path.resolve(serverScript)));
      let manifest;
      try {
        manifest = require.resolve("svelte/package.json", { paths });
      } catch {
        resolved.set(key, null);
        return null;
      }
      resolved.set(key, {
        compiler: require(path.join(path.dirname(manifest), "compiler")),
        version: JSON.parse(fs.readFileSync(manifest, "utf8")).version,
      });
    }
    return resolved.get(key);
  };
  const failures = [];
  const versions = new Set();
  let total = 0;
  for (const entry of cases) {
    const file = entry.file ?? entry.path;
    if (!file || !file.endsWith(".svelte")) continue;
    let text;
    try {
      text = entry.text ?? fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const svelte = svelteFor(path.dirname(file));
    if (!svelte) continue;
    total++;
    versions.add(svelte.version);
    try {
      svelte2tsx(text, {
        filename: file,
        isTsFile: true,
        mode: "ts",
        parse: svelte.compiler.parse,
        version: svelte.version,
      });
    } catch {
      failures.push(entry.id ?? file);
    }
  }
  return { failures, total, versions: [...versions].sort() };
}
