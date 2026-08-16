#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { refuseUnrepresentativeBaseline } from "../compat-corpus/baseline-guard.mjs";
import { normalizeExpected, normalizeResponse } from "./normalize.mjs";
import { LspProcess, parseCommand } from "./protocol.mjs";
import {
  CORPUS_REPOS,
  SUITES,
  corpusPopulation,
  findServerCaches,
  loadCases,
  removeNewServerCaches,
} from "./suites.mjs";
import { createCurrentArtifact, recordsFixtureControls } from "./artifacts.mjs";
import { diffJson } from "./diff.mjs";
import {
  aggregateCorpusDifferences,
  assertNonemptySuites,
  baselineRewriteReasons,
  compactCorpusObservation,
  selectKnownForScope,
  shardCorpusCases,
} from "./ratchet.mjs";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const BASELINE = path.join(ROOT, "compatibility/lsp-known-failures.json");
const REPORT = path.join(ROOT, "compatibility/lsp-report.json");
const args = process.argv.slice(2);
const argValue = (name) =>
  args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const UPDATE = args.includes("--update-baseline");
const UPDATE_POPULATION = args.includes("--update-population");
const WRITE_CURRENT = argValue("--write-current");
if (UPDATE)
  throw new Error(
    "direct --update-baseline is disabled; merge the complete fixture and eight corpus artifacts with merge-current.mjs --update-baseline",
  );
const SHOW = Number(argValue("--show") ?? 30);
const CONCURRENCY = Number(
  argValue("--concurrency") ?? process.env.LSP_CONCURRENCY ?? 32,
);
if (!Number.isInteger(CONCURRENCY) || CONCURRENCY < 1 || CONCURRENCY > 256) {
  throw new Error("--concurrency must be an integer from 1 through 256");
}
// A request that trips this deadline is compared as a transport error, so the
// deadline decides the key: at 2s the same shard measured 2304 and then 1645
// timeouts and 201 of 1380 entries moved; at 60s the whole 1.9M-request sweep
// had 12. Keep it far above the response distribution and treat any timeout as
// a failed run, not as an observation.
const REQUEST_TIMEOUT_MS = Number(argValue("--request-timeout-ms") ?? 180_000);
if (!Number.isInteger(REQUEST_TIMEOUT_MS) || REQUEST_TIMEOUT_MS < 1) {
  throw new Error("--request-timeout-ms must be a positive integer");
}
const shardValue = argValue("--shard");
let SHARD = null;
if (shardValue) {
  const match = /^(\d+)\/(\d+)$/.exec(shardValue);
  if (!match || Number(match[2]) < 1 || Number(match[1]) >= Number(match[2])) {
    throw new Error("--shard must be INDEX/COUNT with 0 <= INDEX < COUNT");
  }
  SHARD = { index: Number(match[1]), count: Number(match[2]) };
}
const selectedSuites = (
  argValue("--suites") ?? "fixtures,upstream-features,upstream-testfiles"
)
  .split(",")
  .filter(Boolean);
const selectedRepos = (argValue("--corpus-repos") ?? CORPUS_REPOS.join(","))
  .split(",")
  .filter(Boolean);

for (const suite of selectedSuites) {
  if (!SUITES.includes(suite))
    throw new Error(
      `unknown suite ${suite}; expected one of ${SUITES.join(", ")}`,
    );
}
for (const repo of selectedRepos) {
  if (!CORPUS_REPOS.includes(repo))
    throw new Error(
      `unknown corpus repo ${repo}; expected one of ${CORPUS_REPOS.join(", ")}`,
    );
}

if (UPDATE_POPULATION) {
  refuseUnrepresentativeBaseline(
    "lsp-population",
    [
      selectedSuites.length !== 1 || selectedSuites[0] !== "corpus"
        ? "--update-population requires exactly --suites corpus"
        : false,
      ...baselineRewriteReasons(
        SUITES,
        SUITES,
        selectedRepos,
        CORPUS_REPOS,
        SHARD
          ? [
              `--shard ${SHARD.index}/${SHARD.count} measured only part of the corpus files (FALSE-SHRINK)`,
            ]
          : [],
      ).slice(1),
    ],
    "--update-population",
  );
}

const officialCommand = parseCommand(process.env.OFFICIAL_LSP_COMMAND, [
  "node",
  path.join(
    ROOT,
    "submodules/language-tools/packages/language-server/bin/server.js",
  ),
  "--stdio",
]);
const rsvelteCommand = parseCommand(process.env.RSVELTE_LSP_COMMAND, [
  path.join(ROOT, "target/debug/rsvelte-language-server"),
]);

function resolveTsgo() {
  if (process.env.TSGO_BIN) return process.env.TSGO_BIN;
  const packageRoot = path.join(
    ROOT,
    "submodules/language-tools/packages/language-server/node_modules/@typescript/native-preview",
  );
  for (const candidate of [
    path.join(ROOT, "submodules/language-tools/node_modules/.bin/tsgo"),
    path.join(
      ROOT,
      "submodules/language-tools/packages/language-server/node_modules/.bin/tsgo",
    ),
    path.join(packageRoot, "lib/tsgo"),
    path.join(packageRoot, "bin/tsgo"),
    path.join(packageRoot, "bin/tsgo.js"),
  ]) {
    if (fs.existsSync(candidate)) return fs.realpathSync(candidate);
  }
  const scope = path.join(
    ROOT,
    "submodules/language-tools/packages/language-server/node_modules/@typescript",
  );
  if (fs.existsSync(scope)) {
    for (const entry of fs.readdirSync(scope)) {
      if (!entry.startsWith("native-preview-")) continue;
      for (const relative of [
        "lib/tsgo",
        "lib/tsgo.exe",
        "bin/tsgo",
        "bin/tsgo.exe",
      ]) {
        const candidate = path.join(scope, entry, relative);
        if (fs.existsSync(candidate)) return fs.realpathSync(candidate);
      }
    }
  }
  throw new Error(
    "pinned @typescript/native-preview tsgo was not found; build/install submodules/language-tools first",
  );
}

function requireExecutable(command, label) {
  if (command[0].includes(path.sep) && !fs.existsSync(command[0])) {
    throw new Error(`${label} executable not found at ${command[0]}`);
  }
}
requireExecutable(officialCommand, "official language server");
requireExecutable(rsvelteCommand, "rsvelte language server");
if (!process.env.OFFICIAL_LSP_COMMAND) {
  const builtServer = path.join(
    ROOT,
    "submodules/language-tools/packages/language-server/dist/src/server.js",
  );
  if (!fs.existsSync(builtServer)) {
    throw new Error(
      "official language server is not built; run `pnpm --dir submodules/language-tools --filter svelte-language-server build`",
    );
  }
}
// The shadow's TypeScript program reaches this directory for ambient `@types`, so
// an uninstalled workspace silently measures a smaller global scope: the same
// fixtures yield 4380 ratchet keys uninstalled and 4397 installed.
if (!fs.existsSync(path.join(ROOT, "node_modules"))) {
  throw new Error(
    "root workspace is not installed; run `pnpm install` first — the TypeScript global scope, and therefore the ratchet keys, depend on it",
  );
}

const population = loadCases(ROOT, selectedSuites, selectedRepos);
const cases = shardCorpusCases(population.cases, SHARD);
assertNonemptySuites(cases, selectedSuites);
const measuredPopulation = corpusPopulation(cases);
const universeIds = population.cases.map((entry) => entry.id);
const populationFile = path.join(
  ROOT,
  "scripts/compat-lsp/corpus-population.json",
);
if (selectedSuites.includes("corpus") && !UPDATE_POPULATION) {
  const floor = JSON.parse(fs.readFileSync(populationFile, "utf8"));
  if (!SHARD) {
    for (const repo of selectedRepos) {
      for (const field of ["files", "identifiers", "requests"]) {
        if (measuredPopulation[repo]?.[field] !== floor[repo]?.[field])
          throw new Error(
            `${repo} ${field} population is ${measuredPopulation[repo]?.[field]}, expected ${floor[repo]?.[field]}; use a full --update-population run after an intentional source bump`,
          );
      }
    }
  }
}

const initializationOptions = {
  isTrusted: !selectedSuites.includes("corpus"),
  configuration: {
    svelte: { plugin: {} },
    typescript: {
      suggest: { autoImports: false },
      inlayHints: {
        enumMemberValues: { enabled: true },
        functionLikeReturnTypes: { enabled: true },
        parameterNames: {
          enabled: "all",
          suppressWhenArgumentMatchesName: false,
        },
        parameterTypes: { enabled: true },
        propertyDeclarationTypes: { enabled: true },
        variableTypes: { enabled: true, suppressWhenTypeMatchesName: false },
      },
    },
    javascript: { suggest: { autoImports: false } },
  },
};
const capabilities = {
  workspace: {
    applyEdit: true,
    configuration: true,
    workspaceFolders: true,
    diagnostics: { refreshSupport: false },
  },
  textDocument: {
    codeAction: {
      codeActionLiteralSupport: {
        codeActionKind: { valueSet: ["quickfix", "refactor"] },
      },
    },
    completion: { completionItem: { snippetSupport: true } },
    definition: { linkSupport: true },
    diagnostic: {},
    foldingRange: { lineFoldingOnly: true },
    inlayHint: {},
  },
};

function configurationForSection(section) {
  if (!section) return initializationOptions.configuration;
  return (
    section
      .split(".")
      .reduce(
        (value, key) => value?.[key],
        initializationOptions.configuration,
      ) ?? null
  );
}

let initializedWorkspaceFolders = [];
function clientRequest(message) {
  switch (message.method) {
    case "workspace/configuration":
      return (message.params?.items ?? []).map((item) =>
        configurationForSection(item.section),
      );
    case "workspace/workspaceFolders":
      return initializedWorkspaceFolders;
    case "workspace/applyEdit":
      return { applied: true };
    default:
      return null;
  }
}

function keyFor(kind, entry, request) {
  const position = request.suffix ? `|${request.suffix}` : "";
  return `${kind}:${entry.id}|${request.method}${position}`;
}

const current = [];
const counts = {
  total: population.skipped.length,
  compared: 0,
  divergent: 0,
  divergentFields: 0,
  transportTimeouts: 0,
  skipped: population.skipped.length,
  differential: 0,
  expected: 0,
};
const methodCounts = new Map();
let nextId = 0;
let official;
let rsvelte;
let cacheRoots = [];
let cachesBefore = new Set();
let completedRequests = 0;
let progressStarted = 0;
let lastProgressAt = 0;

function record(kind, entry, request, left, right, corpusObservations) {
  counts.total++;
  counts[kind]++;
  counts.compared++;
  methodCounts.set(request.method, (methodCounts.get(request.method) ?? 0) + 1);
  const differences = diffJson(request.method, left, right);
  if (differences.length) {
    counts.divergent++;
    counts.divergentFields += differences.length;
    if (entry.suite === "corpus") {
      corpusObservations.push(
        compactCorpusObservation(request.method, request.suffix, differences),
      );
    } else {
      for (const difference of differences)
        current.push(`${keyFor(kind, entry, request)}|${difference}`);
    }
  }
}

async function requestBoth(
  method,
  params,
  workspace,
  { timeoutMs, fatal = false } = {},
) {
  const id = ++nextId;
  const message = { jsonrpc: "2.0", id, method, params };
  official.send(message);
  rsvelte.send(message);
  const settled = await Promise.allSettled([
    official.response(id, clientRequest, timeoutMs),
    rsvelte.response(id, clientRequest, timeoutMs),
  ]);
  const failures = settled.filter((result) => result.status === "rejected");
  if (
    failures.length &&
    (fatal ||
      failures.some(
        (failure) => !failure.reason?.message?.includes("produced no response"),
      ))
  ) {
    const error = failures[0].reason;
    const uri = params?.textDocument?.uri ?? params?.uri ?? "<no-uri>";
    const position = params?.position
      ? `${params.position.line}:${params.position.character}`
      : "<no-position>";
    throw new Error(`${method} ${uri} ${position} failed: ${error.message}`, {
      cause: error,
    });
  }
  const processes = [official, rsvelte];
  const messages = settled.map((result, index) => {
    if (result.status === "fulfilled") return result.value;
    counts.transportTimeouts++;
    processes[index].send({
      jsonrpc: "2.0",
      method: "$/cancelRequest",
      params: { id },
    });
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32098, message: "LSP parity harness timeout" },
    };
  });
  return [
    normalizeResponse(method, messages[0], workspace),
    normalizeResponse(method, messages[1], workspace),
  ];
}

function progress() {
  completedRequests++;
  const now = Date.now();
  if (completedRequests % 10_000 !== 0 && now - lastProgressAt < 15_000) return;
  lastProgressAt = now;
  const seconds = Math.max((now - progressStarted) / 1_000, 0.001);
  console.log(
    `[lsp-verify] progress ${completedRequests.toLocaleString()} requests, ${(completedRequests / seconds).toFixed(1)} requests/s, ${counts.divergentFields.toLocaleString()} divergent fields`,
  );
}

async function compareRequest(entry, request, corpusObservations) {
  const [officialResult, rsvelteResult] = await requestBoth(
    request.method,
    request.params,
    entry.root,
    entry.suite === "corpus" ? { timeoutMs: REQUEST_TIMEOUT_MS } : undefined,
  );
  if (
    entry.suite === "upstream-features" &&
    entry.id === "upstream-features/style-directive/input.svelte" &&
    request.method === "textDocument/diagnostic" &&
    !rsvelteResult?.items?.some((diagnostic) => diagnostic.source === "ts")
  ) {
    throw new Error(
      "upstream TypeScript-diagnostic positive control produced no rsvelte ts diagnostic",
    );
  }
  record(
    "differential",
    entry,
    request,
    officialResult,
    rsvelteResult,
    corpusObservations,
  );
  if (entry.expected?.method === request.method) {
    const expected = normalizeExpected(
      request.method,
      entry.expected.value,
      entry.root,
    );
    record(
      "expected",
      entry,
      request,
      expected,
      rsvelteResult,
      corpusObservations,
    );
  }
  progress();
}

async function compareRequestsBounded(entry, requests, corpusObservations) {
  const active = new Set();
  for (const request of requests) {
    let task;
    task = compareRequest(entry, request, corpusObservations).finally(() =>
      active.delete(task),
    );
    active.add(task);
    if (active.size >= CONCURRENCY) await Promise.race(active);
  }
  await Promise.all(active);
}

async function main() {
  const positiveRoot = path.join(ROOT, "scripts/compat-lsp/positive");
  const workspaceRoots = new Set([positiveRoot]);
  if (selectedSuites.includes("fixtures"))
    workspaceRoots.add(path.join(ROOT, "compatibility/lsp-fixtures"));
  if (selectedSuites.includes("upstream-features")) {
    const featuresRoot = path.join(
      ROOT,
      "submodules/language-tools/packages/language-server/test/plugins/typescript/features",
    );
    workspaceRoots.add(featuresRoot);
    workspaceRoots.add(
      path.join(featuresRoot, "diagnostics/fixtures/style-directive"),
    );
  }
  if (selectedSuites.includes("upstream-testfiles")) {
    workspaceRoots.add(
      path.join(
        ROOT,
        "submodules/language-tools/packages/language-server/test/plugins/typescript/testfiles",
      ),
    );
  }
  if (selectedSuites.includes("corpus")) {
    for (const repo of selectedRepos)
      workspaceRoots.add(path.join(ROOT, "submodules", repo));
  }
  cacheRoots = [
    ...new Set([...workspaceRoots, ...cases.map((entry) => entry.root)]),
  ];
  cachesBefore = findServerCaches(cacheRoots);
  official = new LspProcess("official language server", officialCommand, {
    cwd: ROOT,
  });
  rsvelte = new LspProcess("rsvelte language server", rsvelteCommand, {
    cwd: ROOT,
    env: { TSGO_BIN: resolveTsgo() },
  });
  const rootUri = pathToFileURL(positiveRoot).href;
  const initializeParams = {
    processId: process.pid,
    rootUri,
    workspaceFolders: [...workspaceRoots].map((workspace) => ({
      name: path.basename(workspace),
      uri: pathToFileURL(workspace).href,
    })),
    capabilities,
    initializationOptions,
  };
  initializedWorkspaceFolders = initializeParams.workspaceFolders;
  const initializeEntry = { id: "fixtures/capabilities", suite: "fixtures" };
  const initializeRequest = { method: "initialize", suffix: "" };
  const [officialInitialize, rsvelteInitialize] = await requestBoth(
    "initialize",
    initializeParams,
    ROOT,
    { fatal: true },
  );
  if (recordsFixtureControls(selectedSuites)) {
    record(
      "differential",
      initializeEntry,
      initializeRequest,
      officialInitialize,
      rsvelteInitialize,
    );
  }
  for (const capability of [
    "hoverProvider",
    "definitionProvider",
    "completionProvider",
  ]) {
    if (!rsvelteInitialize?.capabilities?.[capability]) {
      throw new Error(
        `rsvelte initialize response lacks the ${capability} positive-control capability`,
      );
    }
  }
  const initialized = { jsonrpc: "2.0", method: "initialized", params: {} };
  official.send(initialized);
  rsvelte.send(initialized);
  progressStarted = Date.now();
  lastProgressAt = progressStarted;

  const positiveFile = path.join(positiveRoot, "Probe.svelte");
  const positiveText = fs.readFileSync(positiveFile, "utf8");
  const positiveUri = pathToFileURL(positiveFile).href;
  const positiveOpen = {
    jsonrpc: "2.0",
    method: "textDocument/didOpen",
    params: {
      textDocument: {
        uri: positiveUri,
        languageId: "svelte",
        version: 1,
        text: positiveText,
      },
    },
  };
  official.send(positiveOpen);
  rsvelte.send(positiveOpen);
  const positiveRequest = {
    method: "textDocument/hover",
    params: {
      textDocument: { uri: positiveUri },
      position: { line: 2, character: 4 },
    },
    suffix: "2:4",
  };
  const [officialPositive, rsveltePositive] = await requestBoth(
    positiveRequest.method,
    positiveRequest.params,
    ROOT,
    {
      timeoutMs: selectedSuites.includes("corpus") ? 600_000 : undefined,
      fatal: true,
    },
  );
  if (rsveltePositive === null || rsveltePositive?.error) {
    throw new Error(
      `TS hover positive control returned no rsvelte result; TSGO_BIN is not serving TypeScript requests\n${rsvelte.stderr}`,
    );
  }
  if (officialPositive === null || officialPositive?.error) {
    throw new Error(
      "TS hover positive control returned no official result; the oracle is not serving TypeScript requests",
    );
  }
  if (recordsFixtureControls(selectedSuites)) {
    record(
      "differential",
      { id: "fixtures/ts-backend-positive", suite: "fixtures" },
      positiveRequest,
      officialPositive,
      rsveltePositive,
    );
  }
  const positiveClose = {
    jsonrpc: "2.0",
    method: "textDocument/didClose",
    params: { textDocument: { uri: positiveUri } },
  };
  official.send(positiveClose);
  rsvelte.send(positiveClose);

  for (const entry of cases) {
    const text = entry.text ?? entry.loadText();
    const open = {
      jsonrpc: "2.0",
      method: "textDocument/didOpen",
      params: {
        textDocument: {
          uri: entry.uri,
          languageId: "svelte",
          version: 1,
          text,
        },
      },
    };
    official.send(open);
    rsvelte.send(open);
    const requests =
      typeof entry.requests === "function"
        ? entry.requests(entry.uri, text)
        : entry.requests;
    const corpusObservations = [];
    await compareRequestsBounded(entry, requests, corpusObservations);
    if (entry.suite === "corpus")
      current.push(...aggregateCorpusDifferences(entry.id, corpusObservations));
    const close = {
      jsonrpc: "2.0",
      method: "textDocument/didClose",
      params: { textDocument: { uri: entry.uri } },
    };
    official.send(close);
    rsvelte.send(close);
  }

  current.sort();
  if (counts.compared === 0) throw new Error("zero LSP comparisons completed");
  for (const method of population.metadata.expectedMethods) {
    if ((methodCounts.get(method) ?? 0) === 0)
      throw new Error(`zero comparisons completed for ${method}`);
  }

  fs.writeFileSync(
    REPORT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        suites: selectedSuites,
        corpusRepos: selectedSuites.includes("corpus") ? selectedRepos : [],
        shard: SHARD,
        cases: cases.length,
        concurrency: CONCURRENCY,
        transportRequests: completedRequests,
        ...counts,
        methods: Object.fromEntries([...methodCounts].sort()),
        skips: population.skipped,
        population: population.metadata,
      },
      null,
      "\t",
    ) + "\n",
  );
  console.log(
    `[lsp-verify] ${cases.length} cases; ${counts.compared}/${counts.total} compared, ${counts.divergent} divergent requests / ${counts.divergentFields} divergent fields, ${counts.skipped} skipped`,
  );

  if (WRITE_CURRENT) {
    const artifact = createCurrentArtifact({
      root: ROOT,
      suites: selectedSuites,
      repos: selectedSuites.includes("corpus") ? selectedRepos : [],
      shard: SHARD,
      universeIds,
      measuredIds: cases.map((entry) => entry.id),
      population: measuredPopulation,
      current,
      counts,
    });
    fs.mkdirSync(path.dirname(path.resolve(WRITE_CURRENT)), {
      recursive: true,
    });
    fs.writeFileSync(
      path.resolve(WRITE_CURRENT),
      JSON.stringify(artifact, null, "\t") + "\n",
    );
  }

  // Written above on purpose: the artifact is the only record of how far off the
  // deadline was, and it is what says whether raising it again would help.
  if (counts.transportTimeouts) {
    throw new Error(
      `${counts.transportTimeouts} request(s) exceeded the ${REQUEST_TIMEOUT_MS}ms deadline. A timeout is compared as a transport error, so it changes this run's keys and the next run would disagree; raise --request-timeout-ms rather than baselining the result`,
    );
  }

  const known = fs.existsSync(BASELINE)
    ? JSON.parse(fs.readFileSync(BASELINE, "utf8"))
    : [];
  const currentSet = new Set(current);
  const knownSet = new Set(known);
  const selectedKnown = selectKnownForScope(
    known,
    selectedSuites,
    selectedRepos,
    SHARD,
  );
  const added = current.filter((entry) => !knownSet.has(entry));
  const removed = selectedKnown.filter((entry) => !currentSet.has(entry));
  const report = JSON.parse(fs.readFileSync(REPORT, "utf8"));
  report.ratchet = { current, added, removed };
  fs.writeFileSync(REPORT, JSON.stringify(report, null, "\t") + "\n");

  if (UPDATE_POPULATION) {
    fs.writeFileSync(
      populationFile,
      JSON.stringify(measuredPopulation, null, "\t") + "\n",
    );
    console.log("[lsp-verify] updated the full corpus population manifest");
  }
  if (added.length) {
    console.error(`\n[lsp-verify] ${added.length} NEW divergence(s):`);
    for (const entry of added.slice(0, SHOW)) console.error(`  ${entry}`);
  }
  if (removed.length) {
    console.error(
      `\n[lsp-verify] ${removed.length} stale ratchet entry/entries:`,
    );
    for (const entry of removed.slice(0, SHOW)) console.error(`  ${entry}`);
  }
  if (added.length || removed.length) process.exitCode = 1;
  else
    console.log(
      `[lsp-verify] no regressions (${selectedKnown.length} known divergences in measured scope)`,
    );
}

try {
  await main();
} finally {
  await Promise.allSettled([
    official?.shutdown(++nextId, clientRequest),
    rsvelte?.shutdown(++nextId, clientRequest),
  ]);
  if (cacheRoots.length) {
    const removed = removeNewServerCaches(
      cachesBefore,
      findServerCaches(cacheRoots),
    );
    if (removed.length)
      console.log(
        `[lsp-verify] removed ${removed.length} server cache director${removed.length === 1 ? "y" : "ies"}`,
      );
  }
}
