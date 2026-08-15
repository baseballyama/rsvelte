import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { arch, cpus, loadavg, platform, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import * as acorn from "./competitor-oracle/node_modules/acorn/dist/acorn.mjs";
import { print } from "./competitor-oracle/node_modules/esrap/src/index.js";
import ts from "./competitor-oracle/node_modules/esrap/src/languages/ts/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const corpusDir = join(root, "benches/printer-corpus");
const manifest = JSON.parse(readFileSync(join(corpusDir, "manifest.json"), "utf8"));
const warmups = Number(process.env.PRINTER_BENCHMARK_WARMUPS ?? process.env.REPORT_WARMUPS ?? 1);
const runs = Number(process.env.PRINTER_BENCHMARK_RUNS ?? process.env.REPORT_RUNS ?? 5);
const batch = Number(process.env.PRINTER_BENCHMARK_BATCH ?? 100);
const rustRunner =
  process.env.PRINTER_BENCHMARK_RUNNER ?? join(root, "target/release/printer_benchmark_runner");
const esrapCargo = readFileSync(join(root, "crates/rsvelte_esrap/Cargo.toml"), "utf8");
const rsvelteEsrapVersion = esrapCargo.match(/^version\s*=\s*"([^"]+)"/m)?.[1] ?? "unknown";

if (
  !Number.isInteger(warmups) ||
  warmups < 0 ||
  !Number.isInteger(runs) ||
  runs < 1 ||
  !Number.isInteger(batch) ||
  batch < 1
) {
  throw new Error("printer benchmark warmups, runs, and batch must be non-negative integers");
}

const entries = manifest.files.map((entry) => {
  const path = join(corpusDir, entry.path);
  const source = readFileSync(path, "utf8");
  const digest = createHash("sha256").update(source).digest("hex");
  if (digest !== entry.sha256) {
    throw new Error(`printer corpus digest mismatch for ${entry.path}`);
  }
  return { ...entry, path, source };
});
const aggregate = createHash("sha256")
  .update(
    entries
      .map(({ sha256, path }) => `${sha256}  benches/printer-corpus/${path.split("/").at(-1)}\n`)
      .join(""),
  )
  .digest("hex");
if (aggregate !== manifest.workloadSha256) {
  throw new Error("printer corpus workload digest mismatch");
}

const plainEntries = entries.filter(({ path }) => !path.endsWith("12-comments-common.js"));
const commentEntries = entries.filter(({ path }) => path.endsWith("12-comments-common.js"));
const temp = mkdtempSync(join(tmpdir(), "rsvelte-printer-bench-"));

try {
  const plainList = writeList("plain", plainEntries);
  const commentList = writeList("comments", commentEntries);
  const codeRust = runRust(plainList, "code");
  const mapRust = runRust(plainList, "source-map");
  const commentRust = runRust(commentList, "code", batch * 100);

  const cases = [
    makeCase(
      "parsed-no-map",
      "Parsed JavaScript, code only",
      plainEntries,
      runJavascript(plainEntries, false, false, batch),
      codeRust,
    ),
    makeCase(
      "decoded-map",
      "Parsed JavaScript, decoded source map",
      plainEntries,
      runJavascript(plainEntries, true, false, batch),
      mapRust,
    ),
    makeCase(
      "comments-common",
      "Statement-level comments, code only",
      commentEntries,
      runJavascript(commentEntries, false, true, batch * 100),
      commentRust,
    ),
  ];

  process.stdout.write(
    `${JSON.stringify({
      schemaVersion: 1,
      measurementKind: "native-wall",
      generatedAt: new Date().toISOString(),
      workloadHash: `sha256:${manifest.workloadSha256}`,
      versions: {
        rsvelteEsrap: rsvelteEsrapVersion,
        oxcCodegen: "0.144.0",
        javascriptEsrap: "2.3.2",
      },
      runner: {
        label: process.env.BENCHMARK_RUNNER_LABEL ?? "local",
        platform: platform(),
        arch: arch(),
        cpus: cpus().length,
        cpuModel: cpus()[0]?.model?.trim() ?? "unknown",
        node: process.versions.node,
        loadAvg1min: loadavg()[0],
      },
      warmups,
      runs,
      batch,
      cases,
    })}\n`,
  );
} finally {
  rmSync(temp, { recursive: true, force: true });
}

function writeList(name, selected) {
  const path = join(temp, `${name}.txt`);
  writeFileSync(path, `${selected.map((entry) => entry.path).join("\n")}\n`);
  return path;
}

function runRust(files, mode, caseBatch = batch) {
  const result = spawnSync(
    rustRunner,
    [
      "--files",
      files,
      "--warmup",
      String(warmups),
      "--iterations",
      String(runs),
      "--batch",
      String(caseBatch),
      "--mode",
      mode,
    ],
    { cwd: root, encoding: "utf8", maxBuffer: 1 << 24 },
  );
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    throw new Error(`Rust printer benchmark exited ${result.status}`);
  }
  return JSON.parse(result.stdout);
}

function runJavascript(selected, sourceMap, commentsEnabled, caseBatch) {
  const parsed = selected.map(({ source }) => {
    const comments = [];
    const program = acorn.parse(source, {
      ecmaVersion: "latest",
      sourceType: "module",
      locations: sourceMap || commentsEnabled,
      onComment: comments,
    });
    return { comments, program, source };
  });
  const visitors = parsed.map(({ comments }) => ts({ comments }));
  const run = () => {
    let emitted = 0;
    for (let index = 0; index < parsed.length; index += 1) {
      const { program, source } = parsed[index];
      const output = print(program, visitors[index], {
        sourceMapContent: sourceMap ? source : undefined,
        sourceMapEncodeMappings: sourceMap ? false : undefined,
        sourceMapSource: sourceMap ? "input.js" : undefined,
      });
      emitted += output.code.length;
      if (sourceMap) emitted += output.map.mappings.length;
    }
    return emitted;
  };
  for (let index = 0; index < warmups; index += 1) {
    for (let sample = 0; sample < caseBatch; sample += 1) run();
  }
  const timesMs = [];
  for (let index = 0; index < runs; index += 1) {
    const start = performance.now();
    let emitted = 0;
    for (let sample = 0; sample < caseBatch; sample += 1) emitted += run();
    timesMs.push((performance.now() - start) / caseBatch);
    if (emitted === 0) throw new Error("JavaScript esrap emitted no output");
  }
  for (let index = 0; index < parsed.length; index += 1) {
    const output = print(parsed[index].program, visitors[index], {
      sourceMapContent: sourceMap ? parsed[index].source : undefined,
      sourceMapEncodeMappings: sourceMap ? false : undefined,
      sourceMapSource: sourceMap ? "input.js" : undefined,
    });
    const outputComments = [];
    acorn.parse(output.code, {
      ecmaVersion: "latest",
      sourceType: "module",
      onComment: outputComments,
    });
    const expectedComments = parsed[index].comments.map(({ type, value }) => ({ type, value }));
    const actualComments = outputComments.map(({ type, value }) => ({ type, value }));
    if (JSON.stringify(actualComments) !== JSON.stringify(expectedComments)) {
      throw new Error("JavaScript esrap changed the benchmark comments");
    }
  }
  return { timesMs };
}

function makeCase(id, label, selected, javascript, rust) {
  const variants = [
    variant("rsvelte-esrap", "rsvelte/esrap", rust.rsvelteEsrap.timesMs),
    variant("oxc-codegen", "oxc_codegen", rust.oxcCodegen.timesMs),
    variant("javascript-esrap", "esrap", javascript.timesMs),
  ];
  const baseline = variants[0].medianMs;
  for (const item of variants) item.relativeToRsvelte = item.medianMs / baseline;
  return {
    id,
    label,
    comparability: "same-source-retained-parser-specific-ast",
    files: selected.length,
    bytes: selected.reduce((sum, entry) => sum + Buffer.byteLength(entry.source), 0),
    variants,
  };
}

function variant(id, label, timesMs) {
  const medianMs = median(timesMs);
  const mean = timesMs.reduce((sum, value) => sum + value, 0) / timesMs.length;
  const variance = timesMs.reduce((sum, value) => sum + (value - mean) ** 2, 0) / timesMs.length;
  return {
    id,
    label,
    medianMs,
    cvPct: mean === 0 ? 0 : (Math.sqrt(variance) / mean) * 100,
    timesMs,
    workGate: "parseable-output",
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}
