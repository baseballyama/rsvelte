import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { cases } from "./cases.mjs";

export async function hashSources() {
  const sourceHashes = {};
  for (const file of [
    "ast.mjs",
    "graph.mjs",
    "build.mjs",
    "plugins.mjs",
    "native/src/main.rs",
  ]) {
    sourceHashes[file] = createHash("sha256")
      .update(await readFile(new URL(file, import.meta.url)))
      .digest("hex");
  }
  return sourceHashes;
}

export async function report(
  browserRoot,
  hydrationRoot,
  guardsRoot,
  destination,
) {
  const browser = JSON.parse(
    await readFile(join(browserRoot, "browser-results.json"), "utf8"),
  );
  const hydration = JSON.parse(
    await readFile(join(hydrationRoot, "hydration-results.json"), "utf8"),
  );
  const guards = JSON.parse(
    await readFile(join(guardsRoot, "results.json"), "utf8"),
  );
  assert.deepEqual(
    browser.map((row) => row.case),
    cases.map((row) => row.name),
  );
  assert.equal(hydration.length, 3);
  assert.equal(guards.length, 8);
  for (const row of browser) {
    for (const arm of [row.baseline, row.optimized]) {
      assert.equal(typeof arm.jsBytes, "number");
      assert([1, 2].includes(arm.builds));
      assert(Array.isArray(arm.runtime));
      for (const css of arm.css) assert.equal(typeof css.bytes, "number");
    }
    assert.deepEqual(row.baseline.runtime, row.optimized.runtime, row.case);
    assert.equal(row.optimized.removed > 0, row.expected === "remove");
  }
  for (const row of hydration) {
    assert.deepEqual(row.baseline.bodies, row.optimized.bodies);
    assert.deepEqual(row.baseline.hydrated, row.optimized.hydrated);
  }
  const versions = Object.fromEntries(
    await Promise.all(
      [
        "vite",
        "rolldown",
        "svelte",
        "@sveltejs/vite-plugin-svelte",
        "playwright",
      ].map(async (name) => {
        const value = JSON.parse(
          await readFile(
            new URL(`./node_modules/${name}/package.json`, import.meta.url),
            "utf8",
          ),
        ).version;
        assert.equal(typeof value, "string");
        return [name, value];
      }),
    ),
  );
  const sourceHashes = await hashSources();
  const primary = browser.find((row) => row.case === "primary");
  const bytes = (arm) => ({
    js: arm.jsBytes,
    css: arm.css.reduce((n, file) => n + file.bytes, 0),
  });
  const result = {
    status: "PASS within the documented closed-world contract",
    head: execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: new URL("../../../", import.meta.url),
      encoding: "utf8",
    }).trim(),
    sourceHashes,
    versions,
    node: process.version,
    chrome: JSON.parse(
      await readFile(join(browserRoot, "browser-meta.json"), "utf8"),
    ).version,
    browser: {
      cases: browser.length,
      removed: browser.filter((row) => row.optimized.removed > 0).length,
      kept: browser.filter((row) => row.optimized.removed === 0).length,
      builds: browser.reduce(
        (n, row) => n + row.baseline.builds + row.optimized.builds,
        0,
      ),
      runtimeExecutions: browser.reduce(
        (n, row) =>
          n + row.baseline.runtime.length + row.optimized.runtime.length,
        0,
      ),
    },
    hydration: {
      cases: hydration.length,
      comparisons: hydration.reduce(
        (n, row) => n + row.baseline.bodies.length,
        0,
      ),
    },
    guards: {
      cases: guards.length,
      revisionRejections: guards.filter((row) =>
        row.status.startsWith("rejected"),
      ).length,
    },
    primary: {
      baseline: bytes(primary.baseline),
      optimized: bytes(primary.optimized),
    },
    limitations: {
      nativeSvelteOptimization:
        "UNIMPLEMENTED; native executable checks the immutable IR contract only",
      latency: "UNMEASURED",
      corpus: "UNMEASURED",
      finalCssMaps: "UNMEASURED; compiler CSS maps are checked",
      keyframes: "Retained",
      dev: "Build adapter only; no optimizer runs in serve mode",
    },
  };
  await mkdir(destination, { recursive: true });
  await writeFile(
    join(destination, "summary.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
  for (const [name, rows] of [
    ["browser", browser],
    ["hydration", hydration],
    ["guards", guards],
  ]) {
    await writeFile(
      join(destination, name + ".json"),
      JSON.stringify(rows, null, 2) + "\n",
    );
  }
  console.log(JSON.stringify(result, null, 2));
}
if (import.meta.main) await report(...process.argv.slice(2));
