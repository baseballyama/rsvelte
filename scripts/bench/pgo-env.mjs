import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const PROFILE = join(REPO_ROOT, "pgo/rsvelte.profdata");

/**
 * The environment a `cargo` spawn needs to build the compiler the way the npm
 * package ships it — with `pgo/rsvelte.profdata` applied.
 *
 * It lives in its own module because there are **two** entry points that
 * benchmark `benchmark_runner` and they do not share code: `run-benchmark.mjs`
 * has `benchmarkRust`, and `run-performance.mjs` has its own `rustArm` that
 * spawns cargo directly. Wiring only the first is what made a whole report's
 * four compile surfaces measure a non-PGO binary while a two-sided probe on the
 * other entry point said the flag was set.
 *
 * Scoped to `benchmark_runner` because that is the extent of the profile's
 * training set: `-Cprofile-use` treats a function with no counters as never
 * executed, so handing the profile to the formatter, linter or checker would
 * make those *colder*, and none of their shipped binaries carries it either.
 *
 * A separate target directory keeps the flag out of every other build's
 * fingerprint, which would otherwise rebuild the world on each alternation.
 */
export function pgoEnv(binName = "benchmark_runner") {
  if (binName !== "benchmark_runner") return {};
  if (!existsSync(PROFILE)) return {};
  return {
    RUSTFLAGS: `${process.env.RUSTFLAGS ?? ""} -Cprofile-use=${PROFILE}`.trim(),
    CARGO_TARGET_DIR: process.env.CARGO_TARGET_DIR ?? join(REPO_ROOT, "target-pgo-use"),
  };
}
