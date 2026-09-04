#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { refuseUnrepresentativeBaseline } from "../compat-corpus/baseline-guard.mjs";
import { svelteForDocument } from "./pin-official-svelte.mjs";
import { projectionFailures } from "./projection-preflight.mjs";
import { resolveTsgo } from "./tsgo.mjs";
import {
  calibrationView,
  normalizeExpected,
  normalizeResponse,
} from "./normalize.mjs";
import { LspProcess, parseCommand } from "./protocol.mjs";
import {
  CORPUS_REPOS,
  SUITES,
  corpusPopulation,
  findServerCaches,
  loadCases,
  removeNewServerCaches,
} from "./suites.mjs";
import {
  CORPUS_SHARDS,
  createCurrentArtifact,
  recordsFixtureControls,
} from "./artifacts.mjs";
import { EDIT_PHASES, OPEN_PHASE, editChanges } from "./edits.mjs";
import { diffJson } from "./diff.mjs";
import { MECHANISMS, classifyDivergence } from "./mechanism.mjs";
import {
  aggregateCorpusMechanisms,
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
const knownBaseline = fs.existsSync(BASELINE)
  ? JSON.parse(fs.readFileSync(BASELINE, "utf8"))
  : [];
const knownBaselineSet = new Set(knownBaseline);
const args = process.argv.slice(2);
const argValue = (name) =>
  args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const UPDATE = args.includes("--update-baseline");
const UPDATE_POPULATION = args.includes("--update-population");
const WRITE_CURRENT = argValue("--write-current");
if (UPDATE)
  throw new Error(
    `direct --update-baseline is disabled; merge the complete fixture artifact and ${CORPUS_SHARDS} corpus artifacts with merge-current.mjs --update-baseline`,
  );
const SHOW = Number(argValue("--show") ?? 30);
// One label per divergence, so the histogram sums to the divergent-field count
// and a classifier that stops discriminating shows up as `unclassified` growth.
const mechanismCounts = new Map();
let corpusDivergentFields = 0;
function countMechanism(method, mechanism) {
  const key = `${method}|${mechanism}`;
  mechanismCounts.set(key, (mechanismCounts.get(key) ?? 0) + 1);
}
function reportMechanisms() {
  const total = [...mechanismCounts.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return;
  // The labels must PARTITION the divergences: a classifier that drops or
  // double-counts one reads as a mechanism that shrank.
  if (total !== corpusDivergentFields) {
    throw new Error(
      `mechanism labels do not partition the corpus divergences: ${total} labelled, ${corpusDivergentFields} measured`,
    );
  }
  const unclassified = [...mechanismCounts]
    .filter(([key]) => key.endsWith("|unclassified"))
    .reduce((a, [, value]) => a + value, 0);
  console.log(
    `[lsp-verify] corpus divergence mechanisms: ${total} labelled, ${unclassified} unclassified (${((100 * unclassified) / total).toFixed(1)}%), vocabulary ${MECHANISMS.length}`,
  );
  for (const [key, value] of [...mechanismCounts].sort(
    (left, right) => right[1] - left[1],
  )) {
    console.log(
      `[lsp-verify]   ${String(value).padStart(7)}  ${((100 * value) / total).toFixed(1).padStart(5)}%  ${key}`,
    );
  }
}
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

function requireExecutable(command, label) {
  if (command[0].includes(path.sep) && !fs.existsSync(command[0])) {
    throw new Error(`${label} executable not found at ${command[0]}`);
  }
}
// Read by `initializationOptions` below and by the two preconditions, which
// must agree: it decides whether the server resolves `svelte` from a document's
// own workspace or from beside itself, and a precondition measuring the other
// arm reports a version this run never loads.
const TRUSTED = !selectedSuites.includes("corpus");
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

// A run is allowed a residue: `svelte2tsx` legitimately refuses a handful of
// real components. What it is not allowed is a systematically wrong parser —
// under Svelte 4 the rate on bits-ui is 64.8%, which is why no meaningful
// ceiling could exist before the oracle was pinned.
const PROJECTION_FAILURE_CEILING = 0.05;

// A document the official server cannot project is compared anyway: `svelte2tsx`
// throws, `DocumentSnapshot.ts:291` keeps the instance script alone, and the
// answer that produces is well formed enough to enrol into a shrink-only
// ratchet. Asserted before any request is sent, so a degraded oracle costs no
// measurement, and therefore before the current artifact exists at all.
{
  const script = officialCommand.find((argument) => argument.endsWith(".js"));
  // Resolved per document, because `TRUSTED` decides which arm the server reads.
  // Reported as a set: a trusted run over several workspaces can legitimately
  // load more than one Svelte, and collapsing that to a scalar hides it.
  const roots = new Set(
    cases
      .map((entry) => entry.file ?? entry.path)
      .filter((file) => file?.endsWith(".svelte"))
      .map((file) => path.dirname(file)),
  );
  const loaded = new Map();
  for (const root of roots) {
    const resolved = script
      ? svelteForDocument(script, root, TRUSTED)
      : { version: null, path: null };
    if (resolved.version) loaded.set(resolved.version, resolved.path);
  }
  for (const [version, from] of [...loaded].sort())
    console.log(
      `[lsp-verify] official server resolves svelte ${version} from ${from}${TRUSTED ? "" : " (untrusted run: the server's own fallback)"}`,
    );
  const stale = [...loaded].filter(([version]) => Number(version.split(".")[0]) < 5);
  if (stale.length) {
    throw new Error(
      `the official server resolves svelte ${stale.map(([version]) => version).join(", ")} for this run's documents; run \`node scripts/compat-lsp/pin-official-svelte.mjs\` so it projects with the Svelte 5 parser this repository pins`,
    );
  }
  const { failures, total, versions } = script
    ? projectionFailures(script, cases, TRUSTED)
    : { failures: [], total: 0, versions: [] };
  if (total) {
    const rate = failures.length / total;
    console.log(
      `[lsp-verify] official server projects ${total - failures.length}/${total} of this run's components with svelte ${versions.join(", ") || "(none)"} (${failures.length} fail, ${(rate * 100).toFixed(1)}%)`,
    );
    // Asserted on the corpus only. The fixture and upstream suites are chosen
    // inputs and include documents written to be unparseable — 45 of 154 —
    // so a ceiling there would measure the suite's intent, not the oracle's
    // health. The rate is printed for every run either way.
    if (
      selectedSuites.includes("corpus") &&
      rate > PROJECTION_FAILURE_CEILING
    ) {
      throw new Error(
        `the official server fails to project ${failures.length}/${total} (${(rate * 100).toFixed(1)}%) of this run's components, above the ${(PROJECTION_FAILURE_CEILING * 100).toFixed(0)}% ceiling; it would answer those documents from the instance script alone, so every divergence they produce is against a reference that never saw a template. First: ${failures.slice(0, 3).join(", ")}`,
      );
    }
  }
}
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
  isTrusted: TRUSTED,
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

// The opened phase leaves no phase segment, so its keys are the ones this gate
// has always written and a baseline diff shows the edit phase as pure addition.
function keyFor(kind, entry, request, phase) {
  const position = request.suffix ? `|${request.suffix}` : "";
  const stage = phase === OPEN_PHASE ? "" : `|phase=${phase}`;
  return `${kind}:${entry.id}|${request.method}${position}${stage}`;
}

// Every other positive control here is satisfied by an official server that
// answers *something*; a server started against the wrong workspace root or an
// unresolved `node_modules` answers differently instead of failing, and those
// answers would then be enrolled as legitimate ratchet entries defending the
// degradation. Upstream's own snapshots are the only oracle-side assertion the
// harness has, so the live official server is held to them.
const ORACLE_REPRODUCTION_FLOOR = 0.7;
const oracleCalibration = new Map();

const current = [];
// Beside the ratchet, never inside its key. An entry carries a SET of
// mechanisms, so a label in the key would multiply the entry, and picking one
// label per entry would need a precedence rule the data cannot supply.
const mechanismsById = new Map();
const recordMechanisms = (id, mechanisms) => {
  const seen = mechanismsById.get(id) ?? new Set();
  for (const mechanism of mechanisms) seen.add(mechanism);
  mechanismsById.set(id, seen);
};
const newDiagnosticDetails = new Map();
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
const phaseRequests = new Map();
let nextId = 0;
let official;
let rsvelte;
let cacheRoots = [];
let cachesBefore = new Set();
let completedRequests = 0;
let progressStarted = 0;
let lastProgressAt = 0;

// One read per file: the completion classifier needs the region a request sits
// in, and re-reading per request would be 72k reads.
const sourceTexts = new WeakMap();
function sourceOf(entry) {
  if (!sourceTexts.has(entry))
    sourceTexts.set(entry, entry.text ?? entry.loadText());
  return sourceTexts.get(entry);
}

// `initialize` and the ts-backend control are synthesized at their call sites as
// an id and a suite alone, so they carry no source at all. A predicate rather
// than a `catch`, which would merge them with a genuine `loadText` failure.
const isDocumentEntry = (entry) =>
  typeof entry.text === "string" || typeof entry.loadText === "function";

const contextOf = (entry, request) => ({
  text: isDocumentEntry(entry) ? sourceOf(entry) : undefined,
  position: request.params?.position,
});

function record(
  kind,
  entry,
  request,
  left,
  right,
  corpusObservations,
  phase = OPEN_PHASE,
) {
  counts.total++;
  counts[kind]++;
  counts.compared++;
  methodCounts.set(request.method, (methodCounts.get(request.method) ?? 0) + 1);
  const differences = diffJson(request.method, left, right);
  if (differences.length) {
    counts.divergent++;
    counts.divergentFields += differences.length;
    const context = contextOf(entry, request);
    if (entry.suite === "corpus") {
      const mechanisms = new Set();
      corpusDivergentFields += differences.length;
      for (const difference of differences) {
        const mechanism = classifyDivergence(
          request.method,
          left,
          right,
          difference,
          context,
        );
        countMechanism(request.method, mechanism);
        mechanisms.add(mechanism);
      }
      corpusObservations.push(
        compactCorpusObservation(request.method, request.suffix, differences, [
          ...mechanisms,
        ].sort()),
      );
    } else {
      const requestKey = keyFor(kind, entry, request, phase);
      for (const difference of differences) {
        // The classifier reads the `-element` / `-field` suffix and it must not
        // reach the key: a respelling makes every committed entry stale at once,
        // so it lands with its re-baseline rather than on its own.
        const key = `${requestKey}|${difference.replace(/-rsvelte-(?:element|field)/, "-rsvelte")}`;
        current.push(key);
        const label = classifyDivergence(request.method, left, right, difference, context);
        recordMechanisms(key, [label]);
        // Keep the normalized diagnostic values for a newly observed fixture
        // key, so CI says which diagnostic appeared. Corpus responses are
        // intentionally excluded: they can contain project text and are
        // aggregated before ratcheting anyway.
        if (
          request.method === "textDocument/diagnostic" &&
          !knownBaselineSet.has(key)
        ) {
          newDiagnosticDetails.set(key, {
            official: left?.items ?? left,
            rsvelte: right?.items ?? right,
          });
        }
      }
    }
  }
}

function calibrateOracle(entry, method, expected, officialResult) {
  const suite = entry.expected.suite;
  const bucket = oracleCalibration.get(suite) ?? {
    total: 0,
    reproduced: 0,
    misses: [],
  };
  bucket.total++;
  const differences = diffJson(
    method,
    expected,
    calibrationView(expected, officialResult),
  );
  if (differences.length) {
    // The diff labels a side "rsvelte"; neither side is rsvelte here, so only
    // the pointers are kept.
    bucket.misses.push({
      id: entry.id,
      pointers: differences.map((value) => value.slice(0, value.indexOf(":"))),
    });
  } else {
    bucket.reproduced++;
  }
  oracleCalibration.set(suite, bucket);
}

function oracleCalibrationReport() {
  const suites = [...oracleCalibration].sort(([left], [right]) =>
    left.localeCompare(right),
  );
  const total = suites.reduce((sum, [, bucket]) => sum + bucket.total, 0);
  const reproduced = suites.reduce(
    (sum, [, bucket]) => sum + bucket.reproduced,
    0,
  );
  return {
    floor: ORACLE_REPRODUCTION_FLOOR,
    total,
    reproduced,
    suites: Object.fromEntries(suites),
  };
}

/// Drive upstream's own snapshots against the official server alone.
///
/// Calibration used to be a by-product of running `upstream-features`, so the
/// suite that produces two thirds of the ratchet — `corpus` — never asked
/// whether its oracle was sane.
///
/// It runs in a SECOND official process with the workspace an `upstream-features`
/// run would give it. Reusing the measured run's process reproduces 75/92 where
/// that suite reproduces 88/92, because the snapshots' `checkJs` and `tsconfig`
/// settings come from workspace folders a fixtures- or corpus-scoped run does not
/// declare — and adding them to the measured run would move the population this
/// gate exists to compare. A preflight that measures a different number than the
/// suite it stands in for is not a calibration.
async function calibrationPreflight() {
  if (selectedSuites.includes("upstream-features")) return;
  const { cases: snapshots } = loadCases(ROOT, ["upstream-features"], []);
  const featuresRoot = path.join(
    ROOT,
    "submodules/language-tools/packages/language-server/test/plugins/typescript/features",
  );
  const roots = [
    featuresRoot,
    path.join(featuresRoot, "diagnostics/fixtures/style-directive"),
  ];
  const server = new LspProcess("oracle calibration", officialCommand, {
    cwd: ROOT,
  });
  // `clientRequest` answers `workspace/workspaceFolders` from one module-level
  // value, so the measured run's folders would be handed to this server.
  const measuredWorkspaceFolders = initializedWorkspaceFolders;
  let id = 0;
  initializedWorkspaceFolders = roots.map((workspace) => ({
    name: path.basename(workspace),
    uri: pathToFileURL(workspace).href,
  }));
  const request = async (method, params, timeoutMs) => {
    const messageId = ++id;
    server.send({ jsonrpc: "2.0", id: messageId, method, params });
    return await server.response(messageId, clientRequest, timeoutMs);
  };
  try {
    await request("initialize", {
      processId: process.pid,
      rootUri: pathToFileURL(featuresRoot).href,
      workspaceFolders: initializedWorkspaceFolders,
      capabilities,
      initializationOptions,
    });
    server.send({ jsonrpc: "2.0", method: "initialized", params: {} });
    for (const entry of snapshots) {
      if (!entry.expected) continue;
      const text = entry.text ?? entry.loadText();
      server.send({
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
      });
      const requests =
        typeof entry.requests === "function"
          ? entry.requests(entry.uri, text)
          : entry.requests;
      for (const each of requests) {
        let message;
        try {
          message = await request(each.method, each.params, REQUEST_TIMEOUT_MS);
        } catch {
          continue;
        }
        if (entry.expected.method !== each.method) continue;
        calibrateOracle(
          entry,
          each.method,
          normalizeExpected(each.method, entry.expected.value, entry.root),
          normalizeResponse(each.method, message, entry.root),
        );
      }
      server.send({
        jsonrpc: "2.0",
        method: "textDocument/didClose",
        params: { textDocument: { uri: entry.uri } },
      });
    }
  } finally {
    initializedWorkspaceFolders = measuredWorkspaceFolders;
    server.child.kill();
  }
}

function assertOracleCalibration(calibration) {
  if (!calibration.total) {
    throw new Error(
      "no upstream expected snapshot was compared against the official server; the run measured divergence against an uncalibrated oracle",
    );
  }
  for (const [suite, bucket] of Object.entries(calibration.suites)) {
    console.log(
      `[lsp-verify] oracle calibration ${suite}: ${bucket.reproduced}/${bucket.total} upstream snapshots reproduced`,
    );
  }
  const rate = calibration.reproduced / calibration.total;
  if (rate < ORACLE_REPRODUCTION_FLOOR) {
    throw new Error(
      `the official server reproduced ${calibration.reproduced}/${calibration.total} (${(rate * 100).toFixed(1)}%) of upstream's own expected snapshots, below the ${(ORACLE_REPRODUCTION_FLOOR * 100).toFixed(0)}% floor; the oracle is not behaving as its own test suite says, so every divergence this run measured is against an unknown reference`,
    );
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

async function compareRequest(entry, request, corpusObservations, phase) {
  phaseRequests.set(phase, (phaseRequests.get(phase) ?? 0) + 1);
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
    phase,
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
      phase,
    );
    // Upstream has no snapshot for an edited document, so only the pristine
    // phase can be calibrated against one.
    if (phase === OPEN_PHASE)
      calibrateOracle(entry, request.method, expected, officialResult);
  }
  progress();
}

async function compareRequestsBounded(
  entry,
  requests,
  corpusObservations,
  phase,
) {
  const active = new Set();
  for (const request of requests) {
    let task;
    task = compareRequest(entry, request, corpusObservations, phase).finally(
      () => active.delete(task),
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
    env: { TSGO_BIN: resolveTsgo(ROOT) },
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

  await calibrationPreflight();

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
    // Re-derived per phase: the corpus request set is a generator, and iterating
    // one twice compares an empty second phase without failing.
    const requestsFor = () =>
      typeof entry.requests === "function"
        ? entry.requests(entry.uri, text)
        : entry.requests;
    let version = 1;
    for (const phase of [OPEN_PHASE, ...EDIT_PHASES]) {
      if (phase !== OPEN_PHASE) {
        for (const change of editChanges(text)) {
          const notification = {
            jsonrpc: "2.0",
            method: "textDocument/didChange",
            params: {
              textDocument: { uri: entry.uri, version: ++version },
              contentChanges: [change],
            },
          };
          official.send(notification);
          rsvelte.send(notification);
        }
      }
      const corpusObservations = [];
      await compareRequestsBounded(
        entry,
        requestsFor(),
        corpusObservations,
        phase,
      );
      if (entry.suite === "corpus")
        for (const aggregate of aggregateCorpusMechanisms(
          entry.id,
          corpusObservations,
          phase,
        )) {
          current.push(aggregate.id);
          recordMechanisms(aggregate.id, aggregate.mechanisms);
        }
    }
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
  // Each phase re-runs the *same* request set, so an unequal count means one
  // phase silently measured a different population and its keys are not
  // comparable to the other's.
  const phaseSizes = new Set(phaseRequests.values());
  if (phaseRequests.size !== 1 + EDIT_PHASES.length || phaseSizes.size !== 1) {
    throw new Error(
      `each phase must compare the same request set, measured ${[
        ...phaseRequests,
      ]
        .map(([phase, count]) => `${phase}=${count}`)
        .join(", ")}`,
    );
  }
  for (const method of population.metadata.expectedMethods) {
    if ((methodCounts.get(method) ?? 0) === 0)
      throw new Error(`zero comparisons completed for ${method}`);
  }

  const calibration = oracleCalibrationReport();
  fs.writeFileSync(
    REPORT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        suites: selectedSuites,
        oracleCalibration: calibration,
        corpusRepos: selectedSuites.includes("corpus") ? selectedRepos : [],
        shard: SHARD,
        cases: cases.length,
        concurrency: CONCURRENCY,
        transportRequests: completedRequests,
        phaseRequests: Object.fromEntries([...phaseRequests].sort()),
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

  reportMechanisms();

  // Before the artifact, not after: a run measured against a degraded oracle
  // must leave nothing that `merge-current.mjs` could accept.
  assertOracleCalibration(calibration);

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
      mechanisms: Object.fromEntries(
        [...mechanismsById].map(([id, labels]) => [id, [...labels]]),
      ),
      diagnosticDetails: Object.fromEntries(newDiagnosticDetails),
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

  const known = knownBaseline;
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
    for (const entry of added.slice(0, SHOW)) {
      const details = newDiagnosticDetails.get(entry);
      if (!details) continue;
      console.error(
        `\n[lsp-verify] normalized diagnostics for ${entry}:\n${JSON.stringify(details, null, 2)}`,
      );
    }
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
