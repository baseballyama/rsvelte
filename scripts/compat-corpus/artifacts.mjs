/**
 * Corpus-artifact lifecycle, shared by compile.mjs / verify.mjs /
 * svelte2tsx-verify.mjs / clean.mjs.
 *
 * A full corpus run writes ~0.6 GiB of regenerable trees per checkout
 * (measured: sources 60 MiB, expected 254 MiB, actual 254 MiB for 14025 entries
 * × 3 targets), and N parallel agent worktrees each hold their own set. Nothing
 * used to delete them, so the rule here is: whoever produced a tree deletes it
 * once the last consumer is done with it.
 *
 * Retention rules (see `keepArtifacts`):
 *   - a FAILING run keeps its trees — that is when someone diffs
 *     expected/<id> against actual/<id> to attribute a cluster
 *   - CI always keeps them: the `Cluster failures` step reads both trees, and it
 *     runs on any earlier step's failure, not just verify's
 *   - `--keep-artifacts` / CORPUS_KEEP_ARTIFACTS=1 keep them unconditionally
 *   - `--clean-artifacts` deletes even after a failing run
 *
 * The ratchets (`compatibility/*known-failures*.json` and the paired `.md`) are
 * NOT regenerable from the corpus and are never touched here.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");
export const CORPUS = path.join(ROOT, "compatibility");

const MiB = 1024 * 1024;

/** Output trees written by compile.mjs and consumed by verify.mjs / cluster.mjs. */
export const OUTPUT_TREES = ["expected", "actual"];
/** Output trees written by svelte2tsx-compile.mjs, consumed by svelte2tsx-verify.mjs. */
export const S2T_TREES = ["expected-s2t", "actual-s2t"];

/** Everything `corpus:clean` reclaims; every entry is regenerable by re-running a script. */
export const RECLAIMABLE = [
  "sources",
  ...OUTPUT_TREES,
  ...S2T_TREES,
  "manifest.json",
  "report.json",
  "report-s2t.json",
  "cluster.txt",
  ".oxfmt-ignore-nothing",
];

/** `--all` additionally drops the fmt and lint stages (slower to rebuild). */
export const RECLAIMABLE_ALL = [
  ...RECLAIMABLE,
  "fmt",
  "fmt-report.json",
  "lint-sources",
  "lint-manifest.json",
  "lint-report.json",
  ".lint-rules.json",
  ".lint-rsvelte-lint.json",
  "check-report.json",
  "check-report.tsgo.json",
  "check-e2e-report.json",
];

/**
 * Measured on a full 3-target run: expected + actual = 508 MiB, i.e. ~170 MiB
 * per target across both trees. Rounded up, plus headroom for the in-place
 * oxfmt normalization pass verify.mjs runs over the same trees.
 */
export const BYTES_PER_TARGET = 180 * MiB;
export const DISK_HEADROOM = 512 * MiB;

/**
 * Floor for rewriting a ratchet from a run's results. `--update-baseline`
 * DELETES every baseline id it did not observe failing, so a run over a partial
 * corpus silently shrinks the ratchets to whatever it happened to measure. The
 * corpus is 33471 entries with every submodule present; anything far below that
 * is a partial checkout, not a fix. The number is a measurement of a tree, so it
 * moves when the corpus grows — left at the 12000 that fitted a 14025-entry
 * corpus, it would have accepted a run that measured barely a third of this one.
 *
 * Before adding a gate here: a ratio floor and an absolute floor answer
 * different questions, and truncation is visible only to the second. A ratio is
 * measured against the population the run was handed, so anything that shrinks
 * that population shrinks the numerator and denominator together and the check
 * still passes — `verify.mjs`'s >=99% coverage assertion and the shape matrix's
 * subset refusals both have that shape. This constant is the one absolute floor
 * in the pipeline, which is why it is the one that survives a truncated corpus.
 */
export const MIN_FULL_CORPUS_ENTRIES = 30000;

/**
 * Corpus generation stamp.
 *
 * Every number this pipeline reports rests on a precondition nothing checked:
 * that the inputs it started from are still the inputs it finished with. They
 * are shared, mutable, and regenerable, so a parallel `corpus:clean`, a disk
 * sweep or a plain `rm -rf` can replace or truncate them mid-run — and the
 * consuming run reports numbers off whatever survived. Ratio guards cannot see
 * this: 99% of a shrunken denominator still passes.
 *
 * `collect.mjs` stamps the generation it produced; consumers capture it at start
 * and re-assert it before they report. This is deliberately a check rather than
 * a lock: it fires whoever did the deleting, including something that never
 * heard of the corpus scripts.
 */
export const GENERATION_FILE = ".corpus-generation";

export function writeGeneration(corpusDir, { entries, sources }) {
  const generation = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    entries,
    sources,
  };
  fs.writeFileSync(
    path.join(corpusDir, GENERATION_FILE),
    JSON.stringify(generation, null, "\t") + "\n",
  );
  return generation;
}

export function readGeneration(corpusDir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(corpusDir, GENERATION_FILE), "utf8"));
  } catch {
    return null;
  }
}

/**
 * Throws when the corpus changed under a running consumer. Names WHICH file and
 * HOW it changed — vanished, replaced, or truncated — because a guard that
 * asserts one cause sends the next reader hunting for the wrong thing.
 */
export function assertGenerationUnchanged(corpusDir, before) {
  if (!before) return;
  const now = readGeneration(corpusDir);
  if (!now) {
    throw new Error(
      `${GENERATION_FILE} VANISHED — the corpus inputs were deleted while this run was using them`,
    );
  }
  if (now.id !== before.id) {
    throw new Error(
      `corpus was REPLACED mid-run — generation ${before.id} -> ${now.id} (something re-collected underneath this run)`,
    );
  }
  if (now.entries !== before.entries) {
    throw new Error(
      `corpus was TRUNCATED mid-run — manifest entries ${before.entries} -> ${now.entries}`,
    );
  }
  if (now.sources !== before.sources) {
    throw new Error(`corpus sources changed mid-run — ${before.sources} -> ${now.sources} files`);
  }
}

/** Assert-or-exit wrapper for the scripts, which report rather than throw. */
export function requireGenerationUnchanged(corpusDir, before, label) {
  try {
    assertGenerationUnchanged(corpusDir, before);
  } catch (e) {
    console.error(`\n[${label}] ${e.message}`);
    console.error(
      "  the numbers from this run describe a corpus that no longer exists — refusing to report them.",
    );
    console.error("  re-run: node scripts/compat-corpus/collect.mjs && …");
    process.exit(2);
  }
}

/** Ensure workers never reinterpret a deleted input as a compiler failure. */
export function assertCorpusSourcesPresent(corpusDir, manifest) {
  const missing = manifest
    .map(({ id }) => id)
    .filter(
      (id) =>
        !fs.statSync(path.join(corpusDir, "sources", id), { throwIfNoEntry: false })?.isFile(),
    );
  if (missing.length) {
    throw new Error(
      `missing ${missing.length}/${manifest.length} source artifact(s), first: ${missing.slice(0, 3).join(", ")}`,
    );
  }
}

/**
 * Every entry has a warning map, even when both compilers were silent. This
 * keeps a deleted artifact distinguishable from an empty warning set.
 */
export function missingCompiledArtifacts(tree, id, targetKeys) {
  const dir = path.join(tree, id);
  const missing = [];
  if (!fs.existsSync(path.join(dir, "warnings.json"))) missing.push("warnings.json");
  const errorPath = path.join(dir, "error.json");
  const errors = fs.existsSync(errorPath) ? JSON.parse(fs.readFileSync(errorPath, "utf8")) : {};
  for (const key of targetKeys) {
    if (!(key in errors) && !fs.existsSync(path.join(dir, `${key}.js`)))
      missing.push(`${key}.js or error.json`);
  }
  return missing;
}

export function keepArtifacts(argv, { failed }) {
  if (argv.includes("--clean-artifacts")) return false;
  if (argv.includes("--keep-artifacts")) return true;
  if (process.env.CORPUS_KEEP_ARTIFACTS) return true;
  if (process.env.CI) return true;
  return failed;
}

/** Delete `names` (relative to compatibility/) unless retention applies. */
export function cleanupArtifacts(names, argv, { failed, label }) {
  if (keepArtifacts(argv, { failed })) {
    if (failed) {
      console.log(
        `\n[${label}] artifacts kept for inspection — reclaim with: pnpm run corpus:clean`,
      );
    }
    return;
  }
  for (const name of names) fs.rmSync(path.join(CORPUS, name), { recursive: true, force: true });
  console.log(`\n[${label}] removed ${names.join(", ")} (keep them with --keep-artifacts)`);
}

export function freeBytes(dir) {
  try {
    const { bavail, bsize } = fs.statfsSync(dir);
    return Number(bavail) * Number(bsize);
  } catch {
    return null;
  }
}

const gib = (n) => `${(n / 1024 / 1024 / 1024).toFixed(2)} GiB`;

/**
 * Abort before a long run rather than hitting ENOSPC halfway through and leaving
 * a half-written tree that later scores as `match`.
 */
export function requireDiskSpace(required, label) {
  const free = freeBytes(CORPUS);
  if (free === null) return;
  if (free >= required) {
    console.log(`[${label}] disk: ${gib(free)} free, ~${gib(required)} needed`);
    return;
  }
  console.error(
    `[${label}] not enough free disk: ${gib(free)} free, ~${gib(required)} needed for this run`,
  );
  console.error("  reclaim every regenerable corpus tree (all worktrees): pnpm run corpus:clean");
  process.exit(3);
}
