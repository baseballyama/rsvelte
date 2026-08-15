#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { performance } from "node:perf_hooks";
import { LspProcess } from "./lsp-client.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  const values = new Map();
  const flags = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) throw new Error(`unexpected argument: ${arg}`);
    if (["--smoke", "--allow-missing-tsgo", "--help"].includes(arg))
      flags.add(arg.slice(2));
    else values.set(arg.slice(2), argv[++index]);
  }
  return { values, flags };
}

function commandFromJson(value, label) {
  if (!value) return null;
  const parsed = JSON.parse(value);
  if (
    !Array.isArray(parsed) ||
    parsed.length === 0 ||
    parsed.some((part) => typeof part !== "string")
  ) {
    throw new Error(`${label} must be a non-empty JSON string array`);
  }
  return parsed;
}

function executable(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function discoverRsvelte(explicit) {
  const override = commandFromJson(
    explicit ?? process.env.RSVELTE_LSP_COMMAND,
    "rsvelte command",
  );
  if (override) return override;
  const binary =
    process.platform === "win32"
      ? "rsvelte-language-server.exe"
      : "rsvelte-language-server";
  for (const candidate of [
    resolve(repoRoot, "target/release", binary),
    resolve(repoRoot, "target/debug", binary),
  ]) {
    if (executable(candidate)) return [candidate, "--stdio"];
  }
  const launcher = resolve(
    repoRoot,
    "apps/npm/language-server/bin/rsvelte-language-server.mjs",
  );
  if (existsSync(launcher)) return [process.execPath, launcher, "--stdio"];
  throw new Error(
    "rsvelte language server not found; build it or pass --rsvelte-command-json",
  );
}

function discoverOfficial(explicit) {
  const override = commandFromJson(
    explicit ?? process.env.OFFICIAL_LSP_COMMAND,
    "official command",
  );
  if (override) return override;
  for (const helper of [
    resolve(repoRoot, "scripts/compat-lsp/run-official.mjs"),
    resolve(repoRoot, "scripts/compat-lsp/official-server.mjs"),
  ]) {
    if (existsSync(helper)) return [process.execPath, helper, "--stdio"];
  }
  const upstreamBin = resolve(
    repoRoot,
    "submodules/language-tools/packages/language-server/bin/server.js",
  );
  const upstreamDist = resolve(
    repoRoot,
    "submodules/language-tools/packages/language-server/dist/src/index.js",
  );
  if (existsSync(upstreamBin) && existsSync(upstreamDist)) {
    return [process.execPath, upstreamBin, "--stdio"];
  }
  const linked = resolve(repoRoot, "node_modules/.bin/svelteserver");
  if (executable(linked)) return [linked, "--stdio"];
  throw new Error(
    "official language server not found; build submodules/language-tools or pass --official-command-json",
  );
}

function discoverTsgo(explicit, allowMissing) {
  const override = explicit ?? process.env.TSGO_BIN;
  if (override) {
    const resolved = isAbsolute(override) ? override : resolve(override);
    if (!executable(resolved))
      throw new Error(`tsgo executable not found: ${resolved}`);
    return realpathSync(resolved);
  }
  const languageTools = resolve(repoRoot, "submodules/language-tools");
  for (const candidate of [
    resolve(languageTools, "node_modules/.bin/tsgo"),
    resolve(languageTools, "packages/language-server/node_modules/.bin/tsgo"),
  ]) {
    if (executable(candidate)) return realpathSync(candidate);
  }
  const pnpm = resolve(languageTools, "node_modules/.pnpm");
  if (existsSync(pnpm)) {
    for (const entry of readdirSync(pnpm).sort()) {
      if (!entry.startsWith("@typescript+native-preview")) continue;
      for (const relativePath of [
        "node_modules/@typescript/native-preview/bin/tsgo",
        "node_modules/@typescript/native-preview/lib/tsgo",
        "node_modules/@typescript/native-preview/lib/tsgo.exe",
      ]) {
        const candidate = resolve(pnpm, entry, relativePath);
        if (executable(candidate)) return realpathSync(candidate);
      }
    }
  }
  if (allowMissing) return null;
  throw new Error(
    "pinned tsgo not found; install submodules/language-tools, set TSGO_BIN, or pass --tsgo-bin",
  );
}

function gitRevision(directory) {
  try {
    const head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: directory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const status = execFileSync("git", ["status", "--porcelain"], {
      cwd: directory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return { head, dirty: status.length > 0 };
  } catch {
    return null;
  }
}

function walkSvelte(root, limit) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      if (files.length >= limit) return;
      if (
        [".git", ".svelte-kit", "node_modules", "target"].includes(entry.name)
      )
        continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile() && entry.name.endsWith(".svelte"))
        files.push(path);
    }
  };
  visit(root);
  return files;
}

function positions(text) {
  const found = [];
  for (const [line, value] of text.split("\n").entries()) {
    for (const match of value.matchAll(/[A-Za-z_$][\w$-]*/g)) {
      found.push({
        line,
        character: match.index + Math.max(1, match[0].length - 1),
      });
    }
  }
  return found.length > 0 ? found : [{ line: 0, character: 0 }];
}

function percentile(sorted, fraction) {
  if (sorted.length === 0) return null;
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
}

function distribution(samples, errors = 0) {
  const sorted = [...samples].sort((a, b) => a - b);
  const value = (number) =>
    number === null ? null : Number(number.toFixed(3));
  return {
    count: sorted.length,
    errors,
    p50Ms: value(percentile(sorted, 0.5)),
    p95Ms: value(percentile(sorted, 0.95)),
    p99Ms: value(percentile(sorted, 0.99)),
    minMs: value(sorted[0] ?? null),
    maxMs: value(sorted.at(-1) ?? null),
  };
}

async function timedRequests(client, method, uri, points, iterations) {
  const samples = [];
  let errors = 0;
  for (let index = 0; index < iterations; index += 1) {
    const point = points[index % points.length];
    const started = performance.now();
    try {
      await client.request(method, { textDocument: { uri }, position: point });
    } catch {
      errors += 1;
    }
    samples.push(performance.now() - started);
  }
  return distribution(samples, errors);
}

async function typescriptPositiveControl(client, uri, timeoutMs) {
  const deadline = performance.now() + timeoutMs;
  let lastError = null;
  while (performance.now() < deadline) {
    try {
      const hover = await client.request(
        "textDocument/hover",
        {
          textDocument: { uri },
          position: { line: 1, character: 8 },
        },
        Math.min(2_000, timeoutMs),
      );
      const completion = await client.request(
        "textDocument/completion",
        {
          textDocument: { uri },
          position: { line: 2, character: 15 },
        },
        Math.min(2_000, timeoutMs),
      );
      if (hover !== null && completion !== null) {
        return { hover: true, completion: true };
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
  throw new Error(
    `TypeScript positive control did not return hover and completion${lastError ? `: ${lastError.message}` : ""}`,
  );
}

async function benchmarkServer(label, command, fixture, options) {
  const result = { label, command, status: "failed" };
  const started = performance.now();
  const client = new LspProcess(command, {
    cwd: fixture.root,
    timeoutMs: options.timeoutMs,
    env:
      label === "rsvelte"
        ? {
            RSVELTE_PREPROCESS_NODE: process.execPath,
            ...(options.tsgoBin ? { TSGO_BIN: options.tsgoBin } : {}),
          }
        : {},
  });
  try {
    await client.started();
    const initialize = await client.request("initialize", {
      processId: process.pid,
      rootUri: pathToFileURL(fixture.root).href,
      workspaceFolders: [
        { uri: pathToFileURL(fixture.root).href, name: basename(fixture.root) },
      ],
      capabilities: {
        workspace: { configuration: true, workspaceFolders: true },
        textDocument: {
          completion: { completionItem: { snippetSupport: true } },
          hover: { contentFormat: ["markdown", "plaintext"] },
          publishDiagnostics: { relatedInformation: true },
        },
      },
    });
    result.coldStartMs = Number((performance.now() - started).toFixed(3));
    result.serverInfo = initialize?.serverInfo ?? null;
    client.notify("initialized", {});

    const uri = pathToFileURL(fixture.files[0].path).href;
    const firstDiagnostics = client.waitNotification(
      (message) =>
        message.method === "textDocument/publishDiagnostics" &&
        message.params?.uri === uri,
      options.timeoutMs,
    );
    const diagnosticsStarted = performance.now();
    for (const file of fixture.files) {
      client.notify("textDocument/didOpen", {
        textDocument: {
          uri: pathToFileURL(file.path).href,
          languageId: "svelte",
          version: 1,
          text: file.text,
        },
      });
    }
    try {
      const published = await firstDiagnostics;
      result.firstDiagnosticsMs = Number(
        (performance.now() - diagnosticsStarted).toFixed(3),
      );
      result.firstDiagnosticCount = published.params?.diagnostics?.length ?? 0;
    } catch (error) {
      result.firstDiagnosticsMs = null;
      result.firstDiagnosticsError = error.message;
      throw new Error(`first diagnostics failed: ${error.message}`);
    }

    client.notify("textDocument/didChange", {
      textDocument: { uri, version: 2 },
      contentChanges: [
        {
          text: `<script lang="ts">\nconst benchmarkValue: string = "ready";\nbenchmarkValue.\n</script>\n`,
        },
      ],
    });
    result.typescriptPositiveControl = await typescriptPositiveControl(
      client,
      uri,
      options.timeoutMs,
    );
    client.notify("textDocument/didChange", {
      textDocument: { uri, version: 3 },
      contentChanges: [{ text: fixture.files[0].text }],
    });

    const points = positions(fixture.files[0].text);
    for (let index = 0; index < options.warmup; index += 1) {
      const position = points[index % points.length];
      await client
        .request("textDocument/hover", { textDocument: { uri }, position })
        .catch(() => null);
      await client
        .request("textDocument/completion", { textDocument: { uri }, position })
        .catch(() => null);
    }
    result.hover = await timedRequests(
      client,
      "textDocument/hover",
      uri,
      points,
      options.iterations,
    );
    result.completion = await timedRequests(
      client,
      "textDocument/completion",
      uri,
      points,
      options.iterations,
    );
    result.memory = await client.memory();
    result.status = "ok";
  } catch (error) {
    result.error = error.stack ?? error.message;
  } finally {
    const exit = await client.close();
    result.exit = exit;
    if (client.stderr.trim()) result.stderrTail = client.stderr.trim();
  }
  return result;
}

function ratio(value, baseline) {
  return typeof value === "number" &&
    typeof baseline === "number" &&
    baseline !== 0
    ? Number((value / baseline).toFixed(3))
    : null;
}

function comparison(rsvelte, official) {
  return {
    coldStart: ratio(rsvelte.coldStartMs, official.coldStartMs),
    firstDiagnostics: ratio(
      rsvelte.firstDiagnosticsMs,
      official.firstDiagnosticsMs,
    ),
    hoverP50: ratio(rsvelte.hover?.p50Ms, official.hover?.p50Ms),
    hoverP95: ratio(rsvelte.hover?.p95Ms, official.hover?.p95Ms),
    hoverP99: ratio(rsvelte.hover?.p99Ms, official.hover?.p99Ms),
    completionP50: ratio(rsvelte.completion?.p50Ms, official.completion?.p50Ms),
    completionP95: ratio(rsvelte.completion?.p95Ms, official.completion?.p95Ms),
    completionP99: ratio(rsvelte.completion?.p99Ms, official.completion?.p99Ms),
    peakRss: ratio(rsvelte.memory?.peakRssKb, official.memory?.peakRssKb),
  };
}

function fixture(values, smoke) {
  let temporary = null;
  const project = values.get("project");
  let root;
  if (project) {
    root = resolve(project);
  } else {
    temporary = mkdtempSync(join(tmpdir(), "rsvelte-lsp-bench-"));
    root = temporary;
    writeFileSync(
      join(root, "App.svelte"),
      `<script lang="ts">\nlet count: number = 0;\n</script>\n<button title="count" on:click={() => count += 1}>{count}</button>\n<style>button { color: red; }</style>\n`,
    );
    writeFileSync(
      join(root, "package.json"),
      '{"private":true,"type":"module"}\n',
    );
  }
  if (!statSync(root).isDirectory())
    throw new Error(`benchmark project is not a directory: ${root}`);
  const limit = Number(values.get("max-files") ?? (smoke ? 1 : 100));
  const paths = walkSvelte(root, limit);
  if (paths.length === 0)
    throw new Error(`no .svelte files found under ${root}`);
  const files = paths.map((path) => ({
    path,
    text: readFileSync(path, "utf8"),
  }));
  return { root, files, temporary };
}

function sourceManifest(fixtureRoot, files) {
  return files.map(({ path, text }) => ({
    path: relative(fixtureRoot, path),
    bytes: Buffer.byteLength(text),
    sha256: createHash("sha256").update(text).digest("hex"),
  }));
}

export async function main(argv = process.argv.slice(2)) {
  const { values, flags } = parseArgs(argv);
  if (flags.has("help")) {
    console.log(
      `Usage: node scripts/bench-lsp/run.mjs [options]\n\n` +
        `  --project PATH                 Svelte/SvelteKit project (default: generated fixture)\n` +
        `  --official-command-json JSON   command argv array\n` +
        `  --rsvelte-command-json JSON     command argv array\n` +
        `  --official-command JSON        alias for --official-command-json\n` +
        `  --rsvelte-command JSON          alias for --rsvelte-command-json\n` +
        `  --iterations N                  measured hover/completion requests (default: 50)\n` +
        `  --warmup N                      warmup requests per method (default: 5)\n` +
        `  --max-files N                   files opened for memory measurement (default: 100)\n` +
        `  --timeout-ms N                  per-operation deadline (default: 30000)\n` +
        `  --tsgo-bin PATH                 explicit tsgo for rsvelte TypeScript features\n` +
        `  --output PATH                   JSON output (default: lsp-benchmark.json)\n` +
        `  --smoke                         3 requests, 1 file, 10s deadlines`,
    );
    return null;
  }
  const smoke = flags.has("smoke");
  const options = {
    iterations: Number(values.get("iterations") ?? (smoke ? 3 : 50)),
    warmup: Number(values.get("warmup") ?? (smoke ? 1 : 5)),
    timeoutMs: Number(values.get("timeout-ms") ?? (smoke ? 10_000 : 30_000)),
  };
  for (const [name, value] of Object.entries(options)) {
    if (!Number.isInteger(value) || value <= 0)
      throw new Error(`${name} must be a positive integer`);
  }
  const input = fixture(values, smoke);
  const officialCommand = discoverOfficial(
    values.get("official-command-json") ?? values.get("official-command"),
  );
  const rsvelteCommand = discoverRsvelte(
    values.get("rsvelte-command-json") ?? values.get("rsvelte-command"),
  );
  options.tsgoBin = discoverTsgo(
    values.get("tsgo-bin"),
    flags.has("allow-missing-tsgo"),
  );
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    host: {
      platform: process.platform,
      arch: process.arch,
      node: process.version,
    },
    config: {
      ...options,
      project: isAbsolute(input.root) ? input.root : resolve(input.root),
    },
    revision: {
      harness: gitRevision(repoRoot),
      project: gitRevision(input.root),
    },
    sources: sourceManifest(input.root, input.files),
    servers: {},
  };
  try {
    report.servers.official = await benchmarkServer(
      "official",
      officialCommand,
      input,
      options,
    );
    report.servers.rsvelte = await benchmarkServer(
      "rsvelte",
      rsvelteCommand,
      input,
      options,
    );
    report.rsvelteOverOfficial = comparison(
      report.servers.rsvelte,
      report.servers.official,
    );
    const output = resolve(values.get("output") ?? "lsp-benchmark.json");
    writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`wrote ${output}`);
    if (
      report.servers.official.status !== "ok" ||
      report.servers.rsvelte.status !== "ok"
    ) {
      process.exitCode = 1;
    }
    return report;
  } finally {
    if (input.temporary)
      rmSync(input.temporary, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
