#!/usr/bin/env node
/**
 * Normalize both output trees with oxfmt (formatting-only differences are
 * explicitly tolerated by the corpus contract), then require byte-identical
 * outputs between the official Svelte compiler (expected/) and rsvelte
 * (actual/) for every corpus entry and target (client = CSR, server = SSR,
 * client-dev = CSR with `dev: true`).
 *
 * Verdicts per entry:
 *   - match           js (post-oxfmt) and css byte-identical for every target
 *   - error-parity    official compiler rejected; rsvelte rejected too
 *   - js-mismatch / css-mismatch / error-mismatch (rsvelte errs where official
 *     compiles, or vice versa)
 *   - js-unparseable  one side's output does not parse, so there is no
 *     comparison to make (see compatibility/ast-equivalence.md)
 *
 * Compiler WARNINGS and the detail of a compiler ERROR are gated separately, on
 * their own ratchets, and never touch the output verdicts above — see "warning
 * parity" and "error parity" further down.
 *
 * Writes compatibility/report.json.
 *
 * Ratchet baselines (checked in), one per target (see targets.mjs) so every
 * target is tracked independently:
 *   - compatibility/known-failures.client.json      (CSR / client target)
 *   - compatibility/known-failures.server.json      (SSR / server target)
 *   - compatibility/known-failures.client-dev.json  (CSR with `dev: true`)
 * Each lists the entry ids whose output diverges for that target. Verification
 * exits non-zero when a (id, target) pair NOT in its baseline fails (a
 * regression) AND when a baseline still lists a pair that now passes (a stale
 * ratchet) — known failures are tolerated and burned down over time (see
 * compatibility/known-failures.md for the root-cause writeup of each entry).
 * Both are fixed with --update-baseline, which rewrites the files from current
 * results; `--update-baseline <target>` rewrites only that target's file.
 *
 * --from-report <path> skips normalization/comparison entirely and derives the
 * baselines from an existing report.json (e.g. downloaded from a CI run), so a
 * new target's baseline can be bootstrapped without a local full run.
 *
 * A passing run deletes expected/ and actual/ (see artifacts.mjs); a failing run
 * keeps them so the divergence can be inspected. --keep-artifacts always keeps,
 * --clean-artifacts always deletes.
 *
 * ---- warning parity --------------------------------------------------------
 *
 * `compile.mjs` records every compiler warning as (code, line, column) in
 * `warnings.json` next to the output. Two independent comparisons run here:
 *
 *   - warning-code-mismatch      the multiset of warning CODES differs. A
 *                                semantic bug: rsvelte warns where upstream
 *                                does not, or stays silent where it warns.
 *                                Ratchet: warning-known-failures.<target>.json
 *   - warning-position-mismatch  the codes agree but a (line, column) does
 *                                not — usually because rsvelte attaches no
 *                                span at that emission site, so an editor has
 *                                nowhere to put the squiggle.
 *                                Ratchet: warning-position-known-failures.<target>.json
 *
 * They are separate because they have different causes and different fixes;
 * folded together, the much larger position backlog would hide every semantic
 * regression. Both are shrink-only, like the output ratchets, and neither can
 * ever change an output ratchet — a warning divergence is not an output
 * divergence.
 *
 * Warning comparison needs no normalization, so it is meaningful under
 * `--no-fmt`. `--update-warning-baseline` rewrites ONLY the warning ratchets,
 * so a `--no-fmt` run (which inflates JS failures) can seed them without
 * corrupting the output baselines.
 *
 * ---- error parity ----------------------------------------------------------
 *
 * The output verdicts see an error only as "did both sides reject, with the
 * same `code`". `compile.mjs` also records each error's first message line, its
 * `start` and `end` (line, column) and its rendered `frame`, which this file
 * compares for every entry BOTH compilers reject with the same code:
 *
 *   - error-message-mismatch   the codes agree but the prose does not. Not
 *                              tolerated as "upstream rewords things": both
 *                              sides run on the same input in the same process
 *                              at the same version, so a difference is rsvelte's
 *                              (the argument settled for warnings in #2403).
 *                              Ratchet: error-message-known-failures.<target>.json
 *   - error-position-mismatch  the codes agree but `start` does not — usually
 *                              because rsvelte attaches no span at that raising
 *                              site, so an editor has nowhere to put the
 *                              squiggle.
 *                              Ratchet: error-position-known-failures.<target>.json
 *   - error-end-mismatch       the codes agree but `end` does not, so the
 *                              highlight has the wrong LENGTH where `start` is
 *                              already right. Its own ratchet, not folded into
 *                              the one above: an entry listed there would
 *                              otherwise suppress its `end` divergence too.
 *                              Ratchet: error-end-known-failures.<target>.json
 *   - error-frame-mismatch     both endpoints agree but the rendered code frame
 *                              does not. Upstream derives the frame from
 *                              `start.line` and `end.column`, so an unchained
 *                              comparison would restate the two above; gated on
 *                              both agreeing, this only sees the RENDERER (line
 *                              window, tab expansion, caret column).
 *                              Ratchet: error-frame-known-failures.<target>.json
 *
 * Split for the same reason the warning ratchets are: wrong prose is a semantic
 * bug fixed one string at a time, a wrong span is one systemic cause, and folded
 * together the larger span backlog would hide every semantic regression. Message,
 * `start` and `end` are compared independently of each other, so fixing one
 * cannot surface a failure of another that was previously masked.
 *
 * ---- output parseability ---------------------------------------------------
 *
 * Every comparison above is "rsvelte's text vs official's text", so *wrong text*
 * and *text that is not JavaScript* produce the same row and the same ratchet
 * entry. This one asks a question with no reference to official's bytes:
 *
 *   - output-unparseable   the module rsvelte emitted does not parse.
 *                          Ratchet: parse-known-failures.<target>.json
 *
 * Three things make it see what the output ratchet cannot:
 *   1. Its oracle is acorn, a different implementation from the OXC parser
 *      rsvelte itself uses (and that `ast_equiv_batch` re-uses).
 *   2. It runs BEFORE normalization — the claim is about what the compiler
 *      emitted, not about what survived a formatter.
 *   3. Its population is every entry rsvelte compiled, including the ones where
 *      OFFICIAL rejected the input and there is therefore nothing to diff.
 *
 * Official's output is parsed too, but never ratcheted: acorn rejecting the
 * reference compiler means the oracle is misconfigured, so that exits 2 with a
 * distinct message rather than blaming rsvelte.
 *
 * ---- update flags ----------------------------------------------------------
 *
 * The update flags compose: passing several rewrites each ratchet family in one
 * run (the families are disjoint). Every run that asks for a rewrite prints up
 * front which families it will write, and a run that writes nothing is never
 * reported as a successful rewrite.
 *
 * Usage: node scripts/compat-corpus/verify.mjs [--no-fmt] [--max-print <n>] [--update-baseline [<target>]] [--update-warning-baseline] [--update-error-baseline] [--update-parse-baseline] [--from-report <path>] [--targets <keys>] [--strict|--report-only] [--keep-artifacts|--clean-artifacts]
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  flattenTemplateHoles,
  stripBlankLines,
  readIf,
  firstDiffLine,
  oxfmtTree,
} from "./normalize.mjs";
import { parseFailure } from "./parseable.mjs";
import { REPORT_TARGET_KEYS as ALL_TARGET_KEYS, selectTargets } from "./targets.mjs";
import {
  MIN_FULL_CORPUS_ENTRIES,
  OUTPUT_TREES,
  cleanupArtifacts,
  readGeneration,
  requireGenerationUnchanged,
  missingCompiledArtifacts,
} from "./artifacts.mjs";
import { refuseUnrepresentativeBaseline } from "./baseline-guard.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CORPUS = path.join(ROOT, "compatibility");
const EXPECTED = path.join(CORPUS, "expected");
const ACTUAL = path.join(CORPUS, "actual");

const args = process.argv.slice(2);
const NO_FMT = args.includes("--no-fmt");
// Without the flag the lookup lands on args[0], which is another flag: fall back.
const MAX_PRINT = args.includes("--max-print")
  ? Number(args[args.indexOf("--max-print") + 1]) || 20
  : 20;
const UPDATE_BASELINE = args.includes("--update-baseline");
const UPDATE_WARNING_BASELINE = args.includes("--update-warning-baseline");
const UPDATE_MESSAGE_BASELINE = args.includes("--update-message-baseline");
const UPDATE_ERROR_BASELINE = args.includes("--update-error-baseline");
const UPDATE_PARSE_BASELINE = args.includes("--update-parse-baseline");
const STRICT = args.includes("--strict"); // ignore the baseline: any failure fails
const REPORT_ONLY = args.includes("--report-only");
const TARGETS = selectTargets(args);
const TARGET_KEYS = TARGETS.map((t) => t.key);

// `--update-baseline <target>` limits the rewrite to one target; bare
// `--update-baseline` rewrites every target's baseline (the historical
// behaviour).
const UPDATE_SCOPE = (() => {
  const next = args[args.indexOf("--update-baseline") + 1];
  if (!UPDATE_BASELINE || !next || next.startsWith("--")) return null;
  if (!TARGET_KEYS.includes(next)) {
    console.error(
      `[verify] unknown --update-baseline target "${next}" (known: ${TARGET_KEYS.join(", ")})`,
    );
    process.exit(2);
  }
  return next;
})();

const FROM_REPORT = (() => {
  const i = args.indexOf("--from-report");
  return i !== -1 && args[i + 1] ? path.resolve(process.cwd(), args[i + 1]) : null;
})();

// State an update run's intent before doing any work: the failure mode this
// guards against is a rewrite that silently writes nothing and still exits 0.
const UPDATE_FAMILIES = [
  UPDATE_BASELINE && "output",
  UPDATE_WARNING_BASELINE && "warning",
  UPDATE_MESSAGE_BASELINE && "warning message",
  UPDATE_ERROR_BASELINE && "error",
  UPDATE_PARSE_BASELINE && "parse",
].filter(Boolean);
if (REPORT_ONLY && (STRICT || UPDATE_FAMILIES.length)) {
  console.error("[verify] --report-only cannot update ratchets or run in --strict mode");
  process.exit(2);
}
if (UPDATE_FAMILIES.length) {
  console.log(
    `[verify] rewriting ${UPDATE_FAMILIES.join(" + ")} ratchets for ${TARGET_KEYS.join(", ")}`,
  );
}

// Target subsets are safe here because every target ratchets to its own file,
// so a narrowed run rewrites only the files it measured. --no-fmt is not, but
// only for the output family: warning comparison needs no oxfmt normalization,
// so --update-warning-baseline is specified to run under it.
if (UPDATE_BASELINE) {
  refuseUnrepresentativeBaseline("verify", [
    NO_FMT &&
      "--no-fmt counts formatting-only differences as failures, which the corpus gate tolerates by contract",
  ]);
}

// --from-report reconstructs only the output ratchets, so pairing it with a
// diagnostic flag would write half of what was asked for.
if (
  FROM_REPORT &&
  (UPDATE_WARNING_BASELINE ||
    UPDATE_MESSAGE_BASELINE ||
    UPDATE_ERROR_BASELINE ||
    UPDATE_PARSE_BASELINE)
) {
  console.error(
    "[verify] --from-report cannot rewrite diagnostic ratchets (it derives output failures only)",
  );
  console.error("  fix: drop the diagnostic update flags, then re-run a full verify with it");
  process.exit(2);
}

// --baseline-client <path> / --baseline-server <path> select alternate ratchet
// files (defaults come from targets.mjs). The corpus is a single unified set,
// so these are rarely needed — kept for ad-hoc scoped runs.
function baselinePath(target) {
  const i = args.indexOf(`--baseline-${target.key}`);
  return path.resolve(CORPUS, i !== -1 ? args[i + 1] : target.baseline);
}

// Partition failures by target so every target ratchets independently. Every
// failure detail carries a target (css mismatches are client-only), so an entry
// that diverges on two targets lands in both sets.
function partitionFailures(failures) {
  const byTarget = new Map(TARGET_KEYS.map((key) => [key, new Set()]));
  for (const f of failures) {
    for (const d of f.details) {
      const set = byTarget.get(d.target);
      if (set) set.add(f.id);
      // Silently skip targets deselected via --targets; warn only for a
      // target no descriptor declares (a stale report, or a typo that would
      // otherwise drop failures on the floor).
      else if (!ALL_TARGET_KEYS.includes(d.target))
        console.warn(`[verify] ignoring failure detail for unknown target "${d.target}" (${f.id})`);
    }
  }
  return byTarget;
}

// `--update-baseline` DELETES every baseline id this run did not observe
// failing, so a run over a partial corpus silently shrinks the ratchets to
// whatever it happened to measure. Refuse unless the run saw the whole corpus.
function requireFullCorpus(measured, what) {
  if (measured >= MIN_FULL_CORPUS_ENTRIES) return;
  console.error(
    `[verify] refusing to rewrite baselines from ${measured} ${what} (expected >= ${MIN_FULL_CORPUS_ENTRIES})`,
  );
  console.error("  a partial corpus would delete every baseline entry it did not measure");
  console.error(
    "  fix: git submodule update --init --depth 1 … && node scripts/compat-corpus/collect.mjs",
  );
  process.exit(2);
}

// Which ratchet families this run actually wrote, checked against
// UPDATE_FAMILIES in finish() so a rewrite that reaches no write cannot exit 0.
const WRITTEN = new Set();

function writeBaselines(byTarget) {
  WRITTEN.add("output");
  console.log();
  for (const target of TARGETS) {
    if (UPDATE_SCOPE && target.key !== UPDATE_SCOPE) continue;
    const ids = byTarget.get(target.key);
    const p = baselinePath(target);
    fs.writeFileSync(p, JSON.stringify([...ids].sort(), null, "\t") + "\n");
    console.log(
      `[verify] baseline updated: ${ids.size} known failures -> ${path.relative(ROOT, p)}`,
    );
  }
}

if (FROM_REPORT) {
  const report = JSON.parse(fs.readFileSync(FROM_REPORT, "utf8"));
  console.log(
    `[verify] deriving baselines from ${path.relative(ROOT, FROM_REPORT)} (${report.failures.length} failures)`,
  );
  requireFullCorpus(report.total ?? 0, "entries in the report");
  writeBaselines(partitionFailures(report.failures));
  process.exit(0);
}

// ---- inputs ----------------------------------------------------------------

const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS, "manifest.json"), "utf8"));
// Captured before comparison, re-asserted before any verdict or baseline write.
const generation = readGeneration(CORPUS);

// A near-empty manifest (partial checkout, failed collect) would make the
// comparison below pass vacuously instead of catching a real regression.
const MIN_MANIFEST_ENTRIES = 1000;
if (manifest.length < MIN_MANIFEST_ENTRIES) {
  console.error(
    `[verify] only ${manifest.length} entries in manifest.json (expected >= ${MIN_MANIFEST_ENTRIES}); run \`node scripts/compat-corpus/collect.mjs\` first`,
  );
  process.exit(2);
}

// compile.mjs writes EXACTLY ONE of `<target>.js` / an `error.json` entry per
// (id, target) on each side, so anything less means the tree was never compiled
// (or was cleaned away underneath a running verify). Comparing against an absent
// tree reads that side as "no output, no error" and scores every entry `match` —
// a green run that measured nothing, and one that `--update-*-baseline` would
// then write out as an empty ratchet.
// Checked per tree, not against the union: a wiped `expected/` beside an intact
// `actual/` passes a union check, and the error comparison then sees no official
// error to compare against and scores parity everywhere. The 1% slack is for the
// crashed-worker case, where `recordPanic` writes only the rsvelte side.
for (const [label, tree] of [
  ["expected", EXPECTED],
  ["actual", ACTUAL],
]) {
  const incomplete = manifest
    .map(({ id }) => [id, missingCompiledArtifacts(tree, id, TARGET_KEYS)])
    .filter(([, missing]) => missing.length);
  const compiled = manifest.length - incomplete.length;
  if (compiled < manifest.length * 0.99) {
    console.error(
      `[verify] only ${compiled}/${manifest.length} manifest entries have ${label}/ output for every target (${TARGET_KEYS.join(", ")})`,
    );
    console.error(`  first incomplete entry: ${incomplete[0][0]} (${incomplete[0][1].join(", ")})`);
    console.error(
      "  run: node scripts/compat-corpus/compile.mjs   (outputs are deleted after a green verify)",
    );
    process.exit(2);
  }
}

// ---- output parseability ---------------------------------------------------
//
// Deliberately BEFORE normalization: `flattenTreeTemplateHoles` rewrites the
// files in place and oxfmt reprints them, so a gate that ran afterwards would be
// asserting something about the formatter's input, not about what the compiler
// emitted. This is also why it is meaningful under `--no-fmt`.
//
// Official's side is parsed first, as the oracle's own control. Every gate here
// compares rsvelte to official; this one does not, so nothing else would notice
// a parser configuration that rejects legal output. An unexpected rejection on
// the official side is a harness failure (exit 2), never a ratchet entry.
//
// A handful of official outputs genuinely do not parse — acorn enforces early
// errors such as a duplicate lexical declaration, and the deliberately-invalid
// inputs under `compiler-errors/samples` can drive official into emitting one.
// Where the REFERENCE does not parse there is no claim to make about rsvelte, so
// those (id, target) pairs are skipped on both sides. They are enumerated in
// `parse-oracle-excluded.json` rather than absorbed silently, and that list is
// shrink-only in both directions like every other ratchet here.

const PARSE_ORACLE_EXCLUDED_FILE = path.join(CORPUS, "parse-oracle-excluded.json");
const parseOracleExcluded = new Set(JSON.parse(readIf(PARSE_ORACLE_EXCLUDED_FILE) ?? "[]"));
const oracleKey = (id, target) => `${id} [${target}]`;

const parseCounts = { match: 0, "output-unparseable": 0 };
const parseFailures = [];
const oracleRejections = [];
const oracleExcludedSeen = new Set();
let parsedModules = 0;
let oracleModules = 0;

for (const { id } of manifest) {
  const details = [];
  for (const targetDef of TARGETS) {
    const target = targetDef.key;
    const expJs = readIf(path.join(EXPECTED, id, `${target}.js`));
    if (expJs != null) {
      const why = parseFailure(expJs);
      if (why) {
        const key = oracleKey(id, target);
        if (parseOracleExcluded.has(key)) oracleExcludedSeen.add(key);
        else oracleRejections.push({ id, target, why });
        continue;
      }
      oracleModules++;
    }
    // Present whenever rsvelte compiled — including entries official
    // rejected, where the output comparison has nothing to diff and so never
    // looks at this text at all.
    const actJs = readIf(path.join(ACTUAL, id, `${target}.js`));
    if (actJs == null) continue;
    parsedModules++;
    const why = parseFailure(actJs);
    if (why) details.push({ target, kind: "output-parse", expected: "parses", actual: why });
  }
  if (details.length) {
    parseCounts["output-unparseable"]++;
    parseFailures.push({ id, verdict: "output-unparseable", details });
  } else {
    parseCounts.match++;
  }
}

if (oracleRejections.length) {
  console.error(
    `\n[verify] ❌ the parse oracle rejected ${oracleRejections.length} OFFICIAL output(s) that are not on the exclusion list`,
  );
  for (const { id, target, why } of oracleRejections.slice(0, MAX_PRINT)) {
    console.error(`  - ${oracleKey(id, target)}: ${why}`);
  }
  console.error("  Decide which it is before listing anything:");
  console.error(
    "    - acorn rejects legal output  -> widen OPTIONS in scripts/compat-corpus/parseable.mjs",
  );
  console.error(
    "    - official really emits it    -> add the key above to compatibility/parse-oracle-excluded.json",
  );
  console.error("                                     and justify it in the paired .md");
  process.exit(2);
}

// Shrink-only in the other direction too: an excluded pair whose official output
// now parses must come off the list, or the exclusion silently keeps covering an
// rsvelte output nobody is checking any more.
// Scoped to the selected targets: a `--targets client` run never looks at the
// server pairs and must not report them as stale.
const staleExclusions = [...parseOracleExcluded].filter(
  (key) => TARGET_KEYS.some((t) => key.endsWith(` [${t}]`)) && !oracleExcludedSeen.has(key),
);
if (staleExclusions.length) {
  console.error(
    `\n[verify] ❌ ${staleExclusions.length} parse-oracle exclusion(s) no longer needed — official's output parses now`,
  );
  for (const key of staleExclusions.slice(0, MAX_PRINT)) console.error(`  - ${key}`);
  console.error("  fix: delete them from compatibility/parse-oracle-excluded.json");
  process.exit(2);
}

// A gate whose population is "modules rsvelte produced" gets GREENER the more
// the compiler refuses to compile — the failure mode recorded for
// `ast_gate_preconditions.rs` in compatibility/gate-coverage.md § 15a, where the
// only floor was on input discovery. The denominator here is official's module
// count, which no rsvelte change can move, so the two cannot shrink together.
const PARSE_POPULATION_FLOOR = 0.9;
if (parsedModules < oracleModules * PARSE_POPULATION_FLOOR) {
  console.error(
    `\n[verify] ❌ rsvelte produced only ${parsedModules} modules where official produced ${oracleModules}` +
      ` — the parse gate's population collapsed, so its verdict means nothing`,
  );
  console.error(
    "  this is a compile regression, not a parse regression: check the error-parity results above",
  );
  process.exit(2);
}

console.log(
  `[verify] parsed ${parsedModules}/${oracleModules} rsvelte/official module(s) with acorn:` +
    ` ${parseCounts["output-unparseable"]} entry/entries unparseable`,
);

// ---- oxfmt normalization ---------------------------------------------------

function flattenTreeTemplateHoles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) flattenTreeTemplateHoles(p);
    else if (entry.name.endsWith(".js")) {
      const src = fs.readFileSync(p, "utf8");
      const flat = flattenTemplateHoles(src);
      if (flat !== src) fs.writeFileSync(p, flat);
    }
  }
}

if (!NO_FMT) {
  for (const tree of [EXPECTED, ACTUAL]) {
    // esrap wraps long expressions inside `${}` template holes; oxfmt
    // preserves hole multiline-ness from its input, so flatten holes
    // BEFORE formatting to make both trees converge (see normalize.mjs).
    console.log(`[verify] flatten template holes ${path.relative(ROOT, tree)}…`);
    flattenTreeTemplateHoles(tree);
    console.log(`[verify] oxfmt ${path.relative(ROOT, tree)}…`);
    oxfmtTree(tree, { config: path.join(CORPUS, ".oxfmtrc.json"), label: "verify" });
  }
}

// ---- comparison --------------------------------------------------------------

const counts = {
  match: 0,
  "error-parity": 0,
  "js-mismatch": 0,
  "js-unparseable": 0,
  "css-mismatch": 0,
  "error-mismatch": 0,
};
const failures = [];

// ---- AST equivalence -------------------------------------------------------
//
// Byte comparison first (cheap). Where the bytes differ, the verdict comes from
// the shared Rust comparator (crates/rsvelte_ast_equiv) rather than a second
// definition of "equivalent" written here: same question, one answer. Output
// that does not parse is its own verdict — never quietly demoted to a text
// diff.
//
// NOT COVERED — comment parity. `ast_equiv_batch` applies
// `CommentPolicy::Ignore` unless `--comments` is passed, and the call below
// passes no arguments. A divergence that lives ONLY in comments is therefore
// byte-different, AST-equivalent, and scored a pass — for every entry and every
// target, not some subset. Nothing in this corpus gates comments.
//
// Flipping the flag would not close that on its own: under
// `CommentPolicy::Meaningful` only directive-like comments count
// (`is_meaningful_comment` matches `@ts-`, `svelte-ignore`, `@component`, …),
// so JSDoc type tags such as `@type` are still filtered as prose. The gate is
// blind to them under either policy. The path forward is rsvelte preserving
// comments plus `--comments` here — see compatibility/ast-equivalence.md.
//
// Preservation is necessary but NOT sufficient. Official drops the comment in
// 80 of 192 generated module positions and keeps it in the other 112 — the
// choice is position-dependent, not per-comment-kind (#2399). Parity therefore
// requires reproducing official's position rule; a blanket-preserve rsvelte
// would diverge on those 80.
//
// A second, narrower cause compounds this for modules: `.svelte.ts` entries
// reach both compilers TS-stripped, and esbuild drops all comments on the way
// (see compile.mjs's `prepareSource`).

const AST_EQUIV_BIN = path.join(ROOT, "target/release/ast_equiv_batch");
const jsKey = (id, target) => `${id}\0${target}`;
const jsByteEqual = new Map();
const astCandidates = new Map();

for (const { id } of manifest) {
  for (const targetDef of TARGETS) {
    const target = targetDef.key;
    const left = path.join(EXPECTED, id, `${target}.js`);
    const right = path.join(ACTUAL, id, `${target}.js`);
    const expJs = stripBlankLines(readIf(left) ?? "");
    const actJs = stripBlankLines(readIf(right) ?? "");
    const key = jsKey(id, target);
    if (expJs === actJs) {
      jsByteEqual.set(key, true);
    } else {
      jsByteEqual.set(key, false);
      astCandidates.set(key, { left, right, expJs, actJs });
    }
  }
}

const astVerdicts = (() => {
  if (astCandidates.size === 0) return new Map();
  if (!fs.existsSync(AST_EQUIV_BIN)) {
    console.error(`[verify] missing ${AST_EQUIV_BIN} — build it first:`);
    console.error("  cargo build --release --bin ast_equiv_batch");
    process.exit(2);
  }
  console.log(`[verify] AST comparison for ${astCandidates.size} byte-different output(s)…`);
  const pairs = [...astCandidates].map(([key, { left, right }]) => ({ id: key, left, right }));
  // The empty argv is load-bearing: no `--comments` means comments are ignored.
  const out = execFileSync(AST_EQUIV_BIN, [], {
    input: JSON.stringify(pairs),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 256,
  });
  return new Map(JSON.parse(out).map((v) => [v.id, v]));
})();

for (const { id } of manifest) {
  const expDir = path.join(EXPECTED, id);
  const actDir = path.join(ACTUAL, id);
  const expErr = JSON.parse(readIf(path.join(expDir, "error.json")) ?? "{}");
  const actErr = JSON.parse(readIf(path.join(actDir, "error.json")) ?? "{}");

  let verdict = "match";
  const details = [];

  for (const targetDef of TARGETS) {
    const target = targetDef.key;
    const e = expErr[target];
    const a = actErr[target];
    if (e && a) {
      if (e.code && a.code && e.code !== a.code) {
        verdict = "error-mismatch";
        details.push({ target, kind: "error-code", expected: e.code, actual: a.code });
      } else if (verdict === "match") {
        verdict = "error-parity";
      }
      continue;
    }
    if (e || a) {
      verdict = "error-mismatch";
      details.push({
        target,
        kind: "error-presence",
        expected: e ? `error: ${e.code ?? e.message}` : "compiles",
        actual: a ? `error: ${a.code ?? a.message}` : "compiles",
      });
      continue;
    }
    const key = jsKey(id, target);
    if (!jsByteEqual.get(key)) {
      const ast = astVerdicts.get(key);
      const { expJs, actJs } = astCandidates.get(key);
      if (ast.verdict === "unparseable") {
        verdict = "js-unparseable";
        details.push({
          target,
          kind: "js-unparseable",
          expected: "parses",
          actual: `${ast.side} side: ${ast.message}`,
        });
      } else if (ast.verdict !== "equivalent") {
        verdict = "js-mismatch";
        details.push({ target, kind: "js", reason: ast.verdict, ...firstDiffLine(expJs, actJs) });
      }
    }
    if (targetDef.css) {
      const expCss = readIf(path.join(expDir, `${target}.css`));
      const actCss = readIf(path.join(actDir, `${target}.css`));
      if ((expCss ?? "") !== (actCss ?? "")) {
        if (verdict === "match") verdict = "css-mismatch";
        details.push({ target, kind: "css", ...firstDiffLine(expCss ?? "", actCss ?? "") });
      }
    }
  }

  counts[verdict]++;
  if (verdict !== "match" && verdict !== "error-parity") {
    failures.push({ id, verdict, details });
  }
}

// ---- warning parity --------------------------------------------------------
//
// Independent of everything above: its own comparison, its own failure list and
// its own ratchets. A warning divergence must never move an output ratchet, and
// an output divergence must never move a warning ratchet.

const warningCounts = {
  match: 0,
  "warning-code-mismatch": 0,
  "warning-position-mismatch": 0,
  "warning-message-mismatch": 0,
};
const warningFailures = [];

const readWarnings = (dir) => JSON.parse(readIf(path.join(dir, "warnings.json")) ?? "{}");
const codeBag = (list) => list.map((w) => w.code).sort();
const posKey = (w) => `${w.code}@${w.line ?? "?"}:${w.column ?? "?"}`;
const msgKey = (w) => `${w.code}: ${w.message}`;
let warningsSeen = 0;
let warningsWithMessage = 0;
const countMessageCoverage = (list) => {
  for (const w of list) {
    warningsSeen++;
    if (typeof w.message === "string") warningsWithMessage++;
  }
};
// Multiset difference a \ b, so a code emitted twice on one side and once on
// the other is still a divergence.
const bagDiff = (a, b) => {
  const rest = [...b];
  return a.filter((x) => {
    const i = rest.indexOf(x);
    if (i === -1) return true;
    rest.splice(i, 1);
    return false;
  });
};

for (const { id } of manifest) {
  const expWarn = readWarnings(path.join(EXPECTED, id));
  const actWarn = readWarnings(path.join(ACTUAL, id));
  // An entry either compiler rejects has no warnings to compare; error parity
  // already covers it.
  const expErr = JSON.parse(readIf(path.join(EXPECTED, id, "error.json")) ?? "{}");
  const actErr = JSON.parse(readIf(path.join(ACTUAL, id, "error.json")) ?? "{}");

  const details = [];
  for (const targetDef of TARGETS) {
    const target = targetDef.key;
    if (expErr[target] || actErr[target]) continue;
    const e = expWarn[target] ?? [];
    const a = actWarn[target] ?? [];
    countMessageCoverage(e);
    countMessageCoverage(a);

    const extra = bagDiff(codeBag(a), codeBag(e));
    const missing = bagDiff(codeBag(e), codeBag(a));
    if (extra.length || missing.length) {
      details.push({
        target,
        kind: "warning-code",
        expected: missing.length ? `missing: ${missing.join(", ")}` : "(none missing)",
        actual: extra.length ? `extra: ${extra.join(", ")}` : "(none extra)",
      });
      continue;
    }

    const ePos = e.map(posKey).sort();
    const aPos = a.map(posKey).sort();
    if (String(ePos) !== String(aPos)) {
      const i = ePos.findIndex((x, k) => x !== aPos[k]);
      details.push({ target, kind: "warning-position", expected: ePos[i], actual: aPos[i] });
      continue;
    }

    const eMsg = e.map(msgKey).sort();
    const aMsg = a.map(msgKey).sort();
    if (String(eMsg) !== String(aMsg)) {
      const i = eMsg.findIndex((x, k) => x !== aMsg[k]);
      details.push({ target, kind: "warning-message", expected: eMsg[i], actual: aMsg[i] });
    }
  }

  if (!details.length) {
    warningCounts.match++;
    continue;
  }
  const verdict = details.some((d) => d.kind === "warning-code")
    ? "warning-code-mismatch"
    : details.some((d) => d.kind === "warning-position")
      ? "warning-position-mismatch"
      : "warning-message-mismatch";
  warningCounts[verdict]++;
  warningFailures.push({ id, verdict, details });
}

if (warningsSeen > 0 && warningsWithMessage < warningsSeen) {
  console.error(
    `[verify] ${warningsSeen - warningsWithMessage}/${warningsSeen} recorded warnings carry no \`message\`.`,
  );
  console.error("  run: node scripts/compat-corpus/compile.mjs");
  process.exit(2);
}

// Ratchets are partitioned by detail kind so a position divergence never lands
// in the semantic baseline (and vice versa).
function partitionDetails(failureList, kind) {
  const byTarget = new Map(TARGET_KEYS.map((key) => [key, new Set()]));
  for (const f of failureList) {
    for (const d of f.details) {
      if (d.kind !== kind) continue;
      const set = byTarget.get(d.target);
      if (set) set.add(f.id);
    }
  }
  return byTarget;
}

const WARNING_RATCHETS = [
  { kind: "warning-code", label: "warning codes", file: (t) => t.warningBaseline },
  { kind: "warning-position", label: "warning positions", file: (t) => t.warningPositionBaseline },
  { kind: "warning-message", label: "warning messages", file: (t) => t.warningMessageBaseline },
];

// ---- error parity ----------------------------------------------------------
//
// Independent of the output verdicts above, exactly like warning parity. The
// output ratchet already covers "one side rejects" and "the codes differ"; what
// it cannot see is a right-coded error carrying the wrong prose or pointing at
// the wrong place, which is what these two comparisons add.
//
// Message and position are compared INDEPENDENTLY (not chained the way warning
// positions are gated behind matching codes): there is exactly one error per
// entry and target, so there is no pairing problem to solve, and chaining would
// make a message fix surface a brand-new position regression on the PR that
// fixes it.

const errorCounts = {
  match: 0,
  "error-message-mismatch": 0,
  "error-position-mismatch": 0,
  "error-end-mismatch": 0,
  "error-frame-mismatch": 0,
};
const errorFailures = [];
// The size of the population these four comparisons actually inspect. Reported
// beside the verdicts and asserted before a rewrite: every one of them scores
// `match` when there is nothing to compare, so the counts alone cannot tell
// "rsvelte agrees everywhere" from "no error survived to be compared".
let errorComparedPairs = 0;
const errorPosKey = (e) => `${e.line ?? "?"}:${e.column ?? "?"}`;
const errorEndKey = (e) => `${e.endLine ?? "?"}:${e.endColumn ?? "?"}`;
// A frame quotes five source lines and the divergence is usually the caret row,
// so printing the head of it says nothing; report the first line that differs.
function frameDiff(expected, actual) {
  if (expected == null || actual == null) {
    return {
      expected: expected == null ? "(no frame)" : "frame",
      actual: actual == null ? "(no frame)" : "frame",
    };
  }
  const e = expected.split("\n");
  const a = actual.split("\n");
  const i =
    Math.max(e.length, a.length) &&
    [...Array(Math.max(e.length, a.length)).keys()].find((n) => e[n] !== a[n]);
  return {
    expected: `line ${i + 1}: ${JSON.stringify(e[i] ?? null)}`,
    actual: `line ${i + 1}: ${JSON.stringify(a[i] ?? null)}`,
  };
}

for (const { id } of manifest) {
  const expErr = JSON.parse(readIf(path.join(EXPECTED, id, "error.json")) ?? "{}");
  const actErr = JSON.parse(readIf(path.join(ACTUAL, id, "error.json")) ?? "{}");

  const details = [];
  for (const targetDef of TARGETS) {
    const target = targetDef.key;
    const e = expErr[target];
    const a = actErr[target];
    // Only both-reject entries have two errors to compare. A one-sided
    // rejection, or two different codes, is an output failure already; the
    // message and span of two unrelated errors say nothing.
    if (!e || !a || e.code !== a.code) continue;
    errorComparedPairs++;

    if (e.message !== a.message) {
      details.push({ target, kind: "error-message", expected: e.message, actual: a.message });
    }
    const startAgrees = errorPosKey(e) === errorPosKey(a);
    const endAgrees = errorEndKey(e) === errorEndKey(a);
    if (!startAgrees) {
      details.push({
        target,
        kind: "error-position",
        expected: errorPosKey(e),
        actual: errorPosKey(a),
      });
    }
    if (!endAgrees) {
      details.push({
        target,
        kind: "error-end",
        expected: errorEndKey(e),
        actual: errorEndKey(a),
      });
    }
    // Upstream derives `frame` from `start.line` and `end.column` alone, so
    // comparing it while either endpoint diverges would restate the two
    // comparisons above. Gated on both agreeing, it can only report a defect
    // in the renderer itself (line window, tab expansion, caret placement).
    if (startAgrees && endAgrees && (e.frame ?? null) !== (a.frame ?? null)) {
      details.push({ target, kind: "error-frame", ...frameDiff(e.frame ?? null, a.frame ?? null) });
    }
  }

  if (!details.length) {
    errorCounts.match++;
    continue;
  }
  const verdict = ["message", "position", "end", "frame"]
    .map((k) => `error-${k}`)
    .find((kind) => details.some((d) => d.kind === kind));
  errorCounts[`${verdict}-mismatch`]++;
  errorFailures.push({ id, verdict: `${verdict}-mismatch`, details });
}

const ERROR_RATCHETS = [
  { kind: "error-message", label: "error messages", file: (t) => t.errorMessageBaseline },
  { kind: "error-position", label: "error positions", file: (t) => t.errorPositionBaseline },
  { kind: "error-end", label: "error end positions", file: (t) => t.errorEndBaseline },
  { kind: "error-frame", label: "error frames", file: (t) => t.errorFrameBaseline },
];

const PARSE_RATCHETS = [
  { kind: "output-parse", label: "output parseability", file: (t) => t.parseBaseline },
];

// Before any verdict is written or any ratchet rewritten: the corpus these
// results describe must still be the corpus on disk.
requireGenerationUnchanged(CORPUS, generation, "verify");

const report = {
  generatedAt: new Date().toISOString(),
  total: manifest.length,
  counts,
  failures,
  warningCounts,
  warningFailures,
  errorCounts,
  errorComparedPairs,
  errorFailures,
  parseCounts,
  parseFailures,
  parsedModules,
};
fs.writeFileSync(path.join(CORPUS, "report.json"), JSON.stringify(report, null, "\t") + "\n");

console.log("\n[verify] results:");
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(16)} ${v}`);
console.log("\n[verify] warning parity:");
for (const [k, v] of Object.entries(warningCounts)) console.log(`  ${k.padEnd(26)} ${v}`);
console.log(
  `\n[verify] error parity (${errorComparedPairs} both-reject (id, target) pairs compared):`,
);
for (const [k, v] of Object.entries(errorCounts)) console.log(`  ${k.padEnd(26)} ${v}`);
console.log("\n[verify] output parseability:");
for (const [k, v] of Object.entries(parseCounts)) console.log(`  ${k.padEnd(26)} ${v}`);
console.log(`  report: ${path.relative(ROOT, path.join(CORPUS, "report.json"))}`);

if (REPORT_ONLY) finish(0);

// ---- diagnostic ratchets ---------------------------------------------------
//
// Warnings and errors ratchet the same way and must not bleed into each other,
// so one loop runs both families off their descriptors below.

const DIAGNOSTIC_FAMILIES = [
  {
    family: "warning",
    noun: "warning",
    flag: "--update-warning-baseline",
    update: UPDATE_WARNING_BASELINE,
    ratchets: WARNING_RATCHETS.filter((r) => r.kind !== "warning-message"),
    failures: warningFailures,
  },
  {
    family: "warning message",
    noun: "warning message",
    flag: "--update-message-baseline",
    update: UPDATE_MESSAGE_BASELINE,
    ratchets: WARNING_RATCHETS.filter((r) => r.kind === "warning-message"),
    failures: warningFailures,
  },
  {
    family: "error",
    noun: "error",
    flag: "--update-error-baseline",
    update: UPDATE_ERROR_BASELINE,
    ratchets: ERROR_RATCHETS,
    failures: errorFailures,
    population: errorComparedPairs,
    populationLabel: "both-reject (id, target) pairs",
  },
  {
    family: "parse",
    noun: "output-parseability",
    flag: "--update-parse-baseline",
    update: UPDATE_PARSE_BASELINE,
    ratchets: PARSE_RATCHETS,
    failures: parseFailures,
  },
];

const diagnosticRegressions = [];
let diagnosticFixed = 0;

for (const spec of DIAGNOSTIC_FAMILIES) {
  const regressions = [];
  const failById = new Map(spec.failures.map((f) => [f.id, f]));
  let fixed = 0;

  // An empty population reports zero failures, so the rewrite would enrol an
  // empty ratchet and make zero the bar from then on. Narrowed-to-nothing is
  // the same class as the flag-derived narrowings the shared guard refuses,
  // except this one is only knowable after the comparison has run.
  if (spec.update) {
    refuseUnrepresentativeBaseline(
      "verify",
      [
        spec.population === 0 &&
          `the ${spec.noun} comparison measured 0 ${spec.populationLabel}, so every entry scored parity — the artifacts are missing or stale`,
      ],
      spec.flag,
    );
  }

  // `--update-baseline` alone is about the OUTPUT ratchets; leave these alone
  // so an output burn-down cannot silently absorb a diagnostic regression. Ask
  // for both and both are rewritten.
  const skip = UPDATE_BASELINE && !spec.update;
  for (const ratchet of skip ? [] : spec.ratchets) {
    const byTarget = partitionDetails(spec.failures, ratchet.kind);
    for (const target of TARGETS) {
      const p = path.resolve(CORPUS, ratchet.file(target));
      const ids = byTarget.get(target.key);

      if (spec.update) {
        // Same FALSE-SHRINK trap as the output baselines: this rewrite drops
        // every id the run did not measure.
        requireFullCorpus(manifest.length, "corpus entries");
        fs.writeFileSync(p, JSON.stringify([...ids].sort(), null, "\t") + "\n");
        WRITTEN.add(spec.family);
        console.log(
          `[verify] ${ratchet.label} baseline: ${ids.size} known -> ${path.relative(ROOT, p)}`,
        );
        continue;
      }

      const baseline = new Set(
        !STRICT && fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : [],
      );
      for (const id of ids) {
        if (!baseline.has(id)) regressions.push({ id, target: target.key, kind: ratchet.kind });
      }
      fixed += [...baseline].filter((id) => !ids.has(id)).length;
    }
  }

  // Two-sided, like the output ratchets: a listed entry that already passes
  // fails the run, so the PR that fixes entries re-baselines in the same PR.
  if (fixed) {
    console.log(
      `\n[verify] ❌ ${fixed} ${spec.noun} baseline entries already PASS — the ratchet is stale.`,
    );
    console.log(`  node scripts/compat-corpus/verify.mjs --no-fmt ${spec.flag}`);
  }

  if (regressions.length) {
    console.log(
      `\n[verify] ❌ ${regressions.length} NEW ${spec.noun} failures (not in baseline); first ${Math.min(MAX_PRINT, regressions.length)}:`,
    );
    for (const { id, target, kind } of regressions.slice(0, MAX_PRINT)) {
      const f = failById.get(id);
      console.log(`  - ${id} [${f.verdict}] (${target})`);
      for (const d of f.details.filter((d) => d.target === target && d.kind === kind)) {
        console.log(`      expected: ${d.expected}`);
        console.log(`      actual:   ${d.actual}`);
      }
    }
  }

  diagnosticRegressions.push(...regressions);
  diagnosticFixed += fixed;
}

// Hand off to the output rewrite below when that was asked for too.
if (!UPDATE_BASELINE && DIAGNOSTIC_FAMILIES.some((s) => s.update)) finish(0);

const failById = new Map(failures.map((f) => [f.id, f]));
const failsByTarget = partitionFailures(failures);

// Only compile.mjs and cluster.mjs read these trees; nothing downstream does,
// so a green run deletes them here instead of leaving ~0.5 GiB per checkout for
// the operator to remember.
function finish(code) {
  const missed = code === 0 ? UPDATE_FAMILIES.filter((f) => !WRITTEN.has(f)) : [];
  if (missed.length) {
    console.error(
      `\n[verify] ❌ asked to rewrite ${missed.join(" + ")} ratchets but wrote none of them`,
    );
    code = 2;
  }
  cleanupArtifacts(OUTPUT_TREES, args, { failed: code !== 0, label: "verify" });
  process.exit(code);
}

if (UPDATE_BASELINE) {
  requireFullCorpus(manifest.length, "corpus entries");
  writeBaselines(failsByTarget);
  finish(0);
}

const loadBaseline = (p) =>
  new Set(!STRICT && fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : []);
const baselines = new Map(TARGETS.map((t) => [t.key, loadBaseline(baselinePath(t))]));

// A regression is a (id, target) pair failing while absent from that target's
// baseline.
const regressions = [];
for (const key of TARGET_KEYS) {
  for (const id of failsByTarget.get(key)) {
    if (!baselines.get(key).has(id)) regressions.push({ id, target: key });
  }
}

const fixedByTarget = TARGET_KEYS.map((key) => [
  key,
  [...baselines.get(key)].filter((id) => !failsByTarget.get(key).has(id)),
]);
const fixedKnown = fixedByTarget.reduce((n, [, ids]) => n + ids.length, 0);

// A ratchet that still lists passing entries is stale, and staleness is fatal:
// a large "now PASS" delta on the next PR is indistinguishable from noise, so a
// real regression can hide inside it.
if (fixedKnown) {
  const breakdown = fixedByTarget.map(([key, ids]) => `${key} ${ids.length}`).join(", ");
  console.log(
    `\n[verify] ❌ ${fixedKnown} baseline entries already PASS (${breakdown}) — the ratchet is stale.`,
  );
  let shown = 0;
  for (const [key, ids] of fixedByTarget) {
    for (const id of ids) {
      if (shown++ >= MAX_PRINT) break;
      console.log(`  - ${id} (${key})`);
    }
  }
  if (fixedKnown > MAX_PRINT) console.log(`  … and ${fixedKnown - MAX_PRINT} more`);
  // A target-scoped run only measured those targets, so the suggested rewrite
  // must stay scoped too — otherwise it would empty the unmeasured baselines.
  const scope =
    TARGET_KEYS.length === ALL_TARGET_KEYS.length ? "" : ` --targets ${TARGET_KEYS.join(",")}`;
  console.log(`\n  fix: node scripts/compat-corpus/verify.mjs --no-fmt${scope} --update-baseline`);
}

if (regressions.length) {
  console.log(
    `\n[verify] ❌ ${regressions.length} NEW failures (not in baseline); first ${Math.min(MAX_PRINT, regressions.length)}:`,
  );
  for (const { id, target } of regressions.slice(0, MAX_PRINT)) {
    const f = failById.get(id);
    console.log(`  - ${id} [${f.verdict}] (${target})`);
    for (const d of f.details.filter((d) => d.target === target).slice(0, 2)) {
      console.log(`      ${d.target}/${d.kind} line ${d.line ?? ""}`);
      if (d.expected !== undefined) console.log(`        expected: ${d.expected}`);
      if (d.actual !== undefined) console.log(`        actual:   ${d.actual}`);
    }
  }
}

// Every gate reports before any of them exits, so one run shows every
// regression rather than hiding the diagnostic ones behind an output failure.
if (regressions.length || fixedKnown || diagnosticRegressions.length || diagnosticFixed) finish(1);

if (failures.length) {
  const breakdown = TARGET_KEYS.map((key) => `${key} ${failsByTarget.get(key).size}`).join(", ");
  console.log(
    `\n[verify] ✅ no regressions (${breakdown} known failures remain — see compatibility/known-failures.md)`,
  );
} else {
  console.log("\n[verify] ✅ all corpus outputs identical after normalization");
}

if (warningFailures.length) {
  console.log(
    `[verify] ✅ no warning regressions (${warningFailures.length} known warning failures remain — see compatibility/warning-known-failures.md)`,
  );
} else {
  console.log("[verify] ✅ all corpus warnings identical");
}

if (errorFailures.length) {
  console.log(
    `[verify] ✅ no error regressions (${errorFailures.length} known error failures remain — see compatibility/error-known-failures.md)`,
  );
} else {
  console.log("[verify] ✅ all corpus compile errors identical");
}

if (parseFailures.length) {
  console.log(
    `[verify] ✅ no output-parseability regressions (${parseFailures.length} known unparseable entries remain — see compatibility/parse-known-failures.md)`,
  );
} else {
  console.log(`[verify] ✅ all ${parsedModules} generated modules parse`);
}

finish(0);
