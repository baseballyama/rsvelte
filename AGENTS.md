# AGENTS.md

Guidelines for AI agents working on this project. `CLAUDE.md` is a symlink to this file.

This file is loaded into every session, so it stays short: what the project is, how to build
and test it, which gates exist, and the handful of rules that repeatedly cost us shipped bugs.
Long-form findings belong in `docs/`, `compatibility/GATES.md` and `compatibility/KNOWN-FAILURES.md`.
The pre-2026-09-06 version of this file (~500 KB of case histories) is archived at
[docs/archive/agents-md-2026-09-06.md](docs/archive/agents-md-2026-09-06.md); it is not loaded.

## What this project is

rsvelte is a Rust port of the **Svelte 5 toolchain**: the compiler and every developer tool
that sits on it. The compiler was the first port and is still the foundation, but the project's
scope is the whole ecosystem — each upstream JavaScript package has a Rust crate and a drop-in
npm package (or editor integration) that replaces it.

| Upstream | Rust crates | Ships as |
|---|---|---|
| `svelte/compiler` | `rsvelte_core` (phases), `rsvelte` (stable facade), `rsvelte_esrap` (printer), `rsvelte_napi`, `rsvelte_capi` | `@rsvelte/compiler`, `@rsvelte/capi`, wasm playground |
| `svelte2tsx` | `rsvelte_projection` | `@rsvelte/svelte2tsx` |
| `svelte-check` | `rsvelte_check` | `@rsvelte/svelte-check` (+ native platform packages) |
| — (new: TypeScript content-mapper protocol) | `rsvelte_content_mapper` — a process tsc/tsgo spawn to read `.svelte` directly, instead of `.tsx` shadows | standalone binary |
| `@sveltejs/vite-plugin-svelte` | `rsvelte_bindings_support` + `apps/npm/vite-plugin-svelte` (vendored fork) | `@rsvelte/vite-plugin-svelte`, `@rsvelte/vite-plugin-svelte-native` |
| `svelte-language-server`, `svelte-vscode` | `rsvelte_language_server` | `@rsvelte/language-server`, `apps/npm/vscode`, `apps/zed`, `editors/` (Neovim, Helix, Sublime, Emacs) |
| `eslint-plugin-svelte` (+ `svelte-eslint-parser`) | `rsvelte_lint`, `rsvelte_lint_types` (type-aware, own workspace), `rsvelte_lint_bindings` | `@rsvelte/lint`, `@rsvelte/oxlint-plugin` |
| `prettier-plugin-svelte` / `oxfmt` | `rsvelte_formatter`, `rsvelte_fmt` (CLI: `.svelte` here, other files to oxfmt), `rsvelte_fmt_wasm`, `tailwind_class_order` | `@rsvelte/fmt` (+ native platform packages) |
| `svelte-preprocess` family | `rsvelte_preprocess` (sass via `grass`, less, switch-case, …) | consumed by `rsvelte_lint`; `@rsvelte/vite-plugin-svelte`'s `preprocess` binding |
| — | `rsvelte_diagnostics` (shared records/renderers), `rsvelte_ast_equiv` (semantic JS comparison), `rsvelte_devtools`, `rsvelte_bench` | repository tooling |

Every non-compiler tool consumes `rsvelte_core` directly (its AST, scope analysis and
diagnostics) rather than shelling out to a compiler, which is what makes them fast — and is why
a change to a shared type in `rsvelte_core` is a change to every tool in the table.

## Project Goals

1. **Parity with upstream, tool by tool** — compiler output, `parse()` AST, svelte2tsx text and
   maps, svelte-check diagnostics, lint findings and fixes, formatted text and LSP responses
   are all compared byte-for-byte or field-for-field against the pinned upstream
   implementation (see *Compatibility gates*). Fixture suites are the floor; the real-world
   corpus and the generated corpora are the bar.
2. **Native performance** — the compiler targets 100x over the JS compiler via Rust and
   parallelism, and every other tool is expected to beat its upstream by a comparable margin;
   current numbers and targets are in [docs/perf-baseline.md](docs/perf-baseline.md).
3. **Drop-in replacement** — same package roles, CLI flags, `svelte.config.*` / `svelte.*`
   settings and editor protocols as the upstream tools, so a user swaps one dependency
   (Vite, svelte-check, ESLint, Prettier, the VS Code extension) and nothing else changes.
4. **OXC integration** — built on `oxc_parser` / `oxc_formatter` / oxlint so that native JS
   tooling ([oxc](https://oxc.rs/), Rolldown, tsgo) gains Svelte support without starting a
   JavaScript compiler.

## Architecture

The compiler core mirrors the official implementation at
`submodules/svelte/packages/svelte/src/compiler/`:

```
crates/rsvelte_core/src/compiler/phases/
├── 1_parse/     # Parsing (Svelte syntax → AST)
├── 2_analyze/   # Analysis (scope tree, bindings)
└── 3_transform/ # Code generation (AST → JS/CSS)
```

Upstream reference implementations are pinned as submodules; each port mirrors its
reference's structure, naming and algorithms:

| Port | Reference |
|---|---|
| compiler | `submodules/svelte/packages/svelte/src/compiler/` |
| svelte2tsx, svelte-check, language server, VS Code extension | `submodules/language-tools/packages/{svelte2tsx,svelte-check,language-server,svelte-vscode}/` |
| type checking backend (svelte-check CLI, LSP server mode) | `submodules/typescript-go/` (tsgo) |
| linter | `submodules/eslint-plugin-svelte/`, `submodules/svelte-eslint-parser/` |
| preprocessors | `submodules/svelte-preprocess*`, `submodules/svelte-switch-case/` |
| formatter | `oxfmt` with `prettier-plugin-svelte` semantics (oracle installed by `pnpm run generate-fmt-corpus`) |

The other ~100 submodules are corpus sources (`scripts/compat-corpus/corpus-sources.json`),
not references.

**Key design decisions**

- Memory-efficient layout (u32 positions, compact_str); thread-safe parser with rayon
- Direct AST passing between phases; retained Phase-1 programs are immutable; every tool
  reads the same AST and scope analysis
- No backward compatibility for internal APIs (refactor freely); the public surfaces are the
  npm packages, the C ABI and `rsvelte`'s facade
- Phase-3 output is AST-based: server SSR is pure AST; client CSR goes `js_ast::to_oxc` →
  `rsvelte_esrap`, with the text printer kept only as a fallback for comment-bearing or
  unsupported programs
- TypeScript features (svelte-check, the language server) run a child tsgo over an in-memory
  `.svelte` → `.tsx` overlay; HTML/CSS language features are native (vendored MDN data)

**The client instance-script pipeline still decides where statements end by scanning
characters, and that is a correctness hazard, not a cleanup.** Every unparseable-output defect
found in the corpus was a scanner assuming input it did not get (semicolon-free source, an
arrow body on the next line, a backtick inside a JSDoc comment, `'\\'`). Rules that follow:

- Prefer an AST query over a byte scan. Where a scan is unavoidable it must read **code bytes
  only** (`3_transform/shared/js_scan.rs`: `find_code`, `skip_opaque`, `code_bytes`;
  `class_body::find_class_header`) — never `memmem` over raw source, which also matches
  comments, strings, regex literals and template literals.
- The same shape may be correct in a component `<script>` and wrong in `compileModule`
  (`.svelte.(js|ts)`), or right on the client and wrong on the server. Test the entry point the
  defect was reported on **and** its siblings.
- `has_loc` means "may carry comments", not "is a mappable position"; `Printer::map_position`
  is the mapping lookup. A span belongs on the identifier, not on a wrapper built around it.
- Source-map, allocation and phase-timing findings are in
  [docs/phase3-ast-refactor-plan.md](docs/phase3-ast-refactor-plan.md) and
  [docs/perf-baseline.md](docs/perf-baseline.md). Read them before opening a perf brief;
  the headline is ~1.2 heap allocations per source byte, dominated by `serde_json::Value`
  object keys, with `script_text` the one bucket that scales superlinearly.

## Implementation Principles

**CRITICAL**: every port follows the upstream implementation of the tool it replaces.

1. **Reference Implementation** - Read the reference in the table above before implementing;
   use the same algorithm, structure and naming
2. **Exact Output** - Output must match the upstream tool exactly, verified by its fixture
   suite and its corpus gate
3. **Test-Driven** - Verify against the upstream test suite first, then the gates
4. **One core** - Tools consume `rsvelte_core`'s AST and analysis; do not re-parse or
   re-scan source text in a tool when the core already answers the question

Port a guard **with its conditions, their order and their arguments** — upstream's
`build_bind_this` pushes to `seen` before testing `is_reference`, and that order is the
semantics. Enumerate cases from the oracle's own list (its `switch`, its `raise` sites, its
grammar), never from the shapes a bug report happened to bring.

**One upstream function often has two or more ports here (client/server, typed/JSON, text/AST,
CLI/LSP), and no gate compares the ports to each other.** The inventory is
[`compatibility/GATES.md#two-ports-inventory`](compatibility/GATES.md#two-ports-inventory).
A comment saying "mirrors `X` in upstream" is where this class hides. A port-vs-port test whose
expected value is read off the other port passes when both are wrong; generate the expected
value from the oracle.

### Code Comments

Keep comments to the minimum WHY. Do not narrate WHAT the code does, do not record change
history / PR / issue numbers, and do not add section banners. One line, only where the code
cannot express the constraint itself.

## Development Workflow

### Setup

```bash
git submodule update --init --recursive
git config core.hooksPath .githooks
pnpm install
pnpm run generate-fixtures  # Required before running tests
```

### Build & Test

```bash
cargo build
cargo test --release                                 # Full runs: release only (see disk note)
RUST_MIN_STACK=33554432 cargo test --test <suite>    # Debug runs need the stack CI sets
cargo test --test parser_fixtures -- --nocapture     # One suite
pnpm run compatibility-report                        # Compatibility report JSON
pnpm run test-and-update                             # Refresh report + docs
node scripts/diff/compare-parsers.mjs                # Diff a parse against official
```

- **Disk runs out before time does.** A debug test binary is ~140 MB and `rsvelte_core`
  builds one per `crates/rsvelte_core/tests/*.rs`, so a full debug build costs that rate
  times `ls crates/rsvelte_core/tests/*.rs | wc -l` — 716 on `main` at `a760be550`, i.e. ~98 GB
  of `target/debug/deps` against ~0.5 GB for the whole release profile. Carry the rate, not
  the product: this bullet read "~590 targets, ~83 GB" until 2026-09-09, and 83 GB **was**
  589 x 140 MB, so rounding the count made it look like a soft approximation while it
  silently carried the total 22% low. Read
  `df -g /System/Volumes/Data` before invoking cargo and do not start a build under ~20 GiB
  free (ENOSPC leaves partial artifacts and the *next* run fails for an unrelated-looking
  reason). Scope debug runs with `--test <name>` / `-p <crate> --lib`; reclaim with
  `find target/debug/deps -maxdepth 1 -type f -mmin +360 -delete`.
- Pre-commit hooks run `cargo fmt` and `cargo clippy` and inherit no `CARGO_TARGET_DIR`, so a
  plain `git commit` builds 1.4 GB into the worktree's own `target/`. Prefix the commit
  (`CARGO_TARGET_DIR=… git commit …`) rather than reaching for `--no-verify`. `git rebase`
  runs no hooks: after resolving a conflict by hand, run fmt + clippy yourself.
- **The denominator of a test run is what you passed cargo.** `--test a --test b` does not run
  the lib; `-p rsvelte_core` does not build `rsvelte_bindings_support`, which matches `JsNode`
  exhaustively. When a change touches a type another crate names, run `--workspace`. And a
  misspelled target aborts the **whole** invocation — `error: no test target named X` runs
  none of the others, so a nine-suite run and a zero-suite run print the same nothing.
  Read the `Running tests/` lines as the denominator, not the exit code; the needle is
  `Running tests/`, because cargo indents that line and `^Running` matches nothing.
- `cargo fmt && cargo clippy --workspace --all-targets --all-features -- -D warnings` before every commit.

### Worktrees and the shared machine

Several agents share this `.git` (20+ linked worktrees) and this machine.

- **Prefix every Bash call with `cd <worktree> &&`** — the shell cwd resets between calls, and
  a `cargo` run from the wrong cwd compiles someone else's tree with no error. Build as
  `cd <worktree> && CARGO_TARGET_DIR=<worktree>/target cargo …` and read the build's own
  `Compiling <crate> (<path>)` line to learn which tree it read (`cargo check` prints
  `Checking`, so take the needle from the command you actually ran).
- A branch can be checked out in one worktree only; use `git checkout --detach <sha>` for
  measurement arms, and `|| exit` after any checkout — a failed checkout does not stop the next
  line, and the run then measures whatever tree was already there.
- A linked worktree initializes **no** submodules. `git -C submodules/x rev-parse HEAD` then
  returns the **superproject's** HEAD without error; `git submodule update --init --force
  --recursive` fixes it. An absent submodule shows up only as a smaller denominator.
- `FETCH_HEAD` and `origin/main` are shared, moving names. Resolve once
  (`MAIN=$(git rev-parse origin/main)`) and use the SHA. `git ls-remote origin main` is a
  pattern that also matches `changeset-release/main`; spell `refs/heads/main`. In zsh, brace
  `"${sha}:path"` — `$sha:path` applies a modifier (`:A`, `:r`, `:s`) even inside quotes.
- `git diff origin/main..HEAD` showing files you never touched means your base is stale;
  `git merge-base --is-ancestor origin/main HEAD` is the check.
- **`rsvelte-fmt`, `cargo fmt`, `prettier --write` and `sed -i` write in place.** Never point one
  at a stored measurement arm, and run directory forms as `( cd <dir> && rsvelte-fmt . )` — a
  bare `.` once rewrote 2,809 tracked files plus three submodules.
- Before a measurement window, read the actual top of `ps -Ao %cpu=,comm= | sort -rn`, not a
  count of `cargo`/`rustc` (Spotlight's `mds_stores` peaks right after a build; hooks run as
  `rustfmt` / `clippy-driver`). Between agents, announcing start and finish *is* the instrument.

### Docker (optional)

`Dockerfile` + `docker-compose.yml` provide Rust nightly + Node 22 + pnpm:
`docker compose up -d`, `docker compose exec dev bash`. VS Code Dev Containers also works.

## Compatibility gates (`compatibility/`, `scripts/compat-corpus/`, `scripts/compat-lsp/`)

Every gate compares rsvelte to the **official** toolchain on a population and ratchets the
divergences through a shrink-only JSON in `compatibility/`, with per-entry justification in
[compatibility/KNOWN-FAILURES.md](compatibility/KNOWN-FAILURES.md). What each gate structurally
cannot see is inventoried in
[compatibility/GATES.md#gate-coverage](compatibility/GATES.md#gate-coverage).

| Gate | Script | Ratchet(s) |
|---|---|---|
| Corpus output equality, 4 targets (client, server, client-dev, server-dev) | `verify.mjs` (`pnpm run corpus`) | `known-failures.<target>.json` |
| Compiler warnings (codes / positions / messages) and errors (message / position / end / frame) | same run | `warning-*`, `error-*-known-failures.<target>.json` |
| Public `parse()` AST, 3 axes (modern / legacy / loose) | `parse-ast-verify.mjs` | `parse-ast-known-failures.json` |
| Generated shape matrix (axis families in `matrix/axes.mjs`) | `pnpm run corpus:matrix` | `matrix-known-failures.json` |
| Corpus-seeded mutation fuzz | `pnpm run corpus:mutate` | `mutation-known-failures.json` |
| Transform idempotency (property, no oracle) | `idempotency-verify.mjs` | — |
| CSS prune, SCSS backend (`grass` vs dart-sass) | `css-prune-*.mjs`, `scss-verify.mjs` | `css-prune-*`, `scss-known-failures.json` |
| Formatter parity (oxfmt oracle) | `fmt.mjs` (`pnpm run corpus:fmt`) | `fmt-known-failures.json`, `fmt-oracle-excluded.json` |
| svelte2tsx text and source-map structure | `svelte2tsx-verify.mjs` | `svelte2tsx-*-known-failures.json` |
| svelte-check diagnostics (fixture projects, real repos) | `check-verify.mjs`, `check-e2e-verify.mjs` | `check-*-known-failures.json` |
| Lint: real-world corpus, adversarial (`compatibility/lint-adversarial/`), fix / suggest / end / env / preset / conditions / severity | `lint-*.mjs` (`pnpm run lint-*`) | `lint-*-known-failures.json` |
| LSP differential (JSON-RPC field level) | `scripts/compat-lsp/verify.mjs` (`pnpm run lsp:verify`) | `lsp-known-failures.json` + `lsp-mechanisms.json` |
| Source-map correctness (Rust test) | `crates/rsvelte_core/tests/sourcemaps_gate.rs` | `sourcemap-known-failures.json` |

Rules that apply to all of them:

- **Ratchets are two-sided.** A new failure and a listed entry that now passes both fail CI, so
  the PR that fixes entries re-baselines in the same PR. A baseline measures a **tree**; rebase
  onto `main` *before* `--update-baseline`, never after. The updaters refuse partial
  populations (`--no-fmt`, `--families`, small corpora, unpopulated sources) because
  `--update-baseline` deletes every id it did not measure.
- **A ratchet entry suppresses everything its key cannot tell apart.** Put the class in the key
  (`warning-missing:<code>`, verdict + target), and read a key that survives a fix as a
  measurement: it is counting a second cause.
- **The oracle is the source tree**, `OFFICIAL_COMPILER_REL` in `scripts/compat-corpus/oracle.mjs`.
  The npm `svelte/compiler`, the submodule source and the submodule's built `compiler/` disagree
  on output while reporting the same `VERSION`; a probe that imports `svelte/compiler` is
  measuring a different compiler. `.svelte.(js|ts)` goes through `compileModule`, not `compile`.
- **Corpus size is saturated; the axes that still find defects are what we compare and how
  inputs are constructed.** Interaction bugs occur 0 times in 30k real files — the matrix and
  the adversarial corpora exist for those. A generated family carries its author's blind spot,
  so when one comes back clean, ask which axis value you held fixed.
- Reachability is per **entry point**: a file `compile()` rejects is still fully compared by
  `parse()`, svelte2tsx and the linter. "No corpus can hold this" is a claim about the collector.
- Corpus artifacts are ~0.6 GB per checkout and self-clean after a passing run;
  `pnpm run corpus:clean` reclaims every worktree. `verify.mjs` refuses to compare an absent
  tree (an absent artifact would score `match`).
- Attribution: every ratchet entry needs a target (`pnpm run check:attribution`,
  `check:lsp-mechanisms`). `deliberate-divergences` in GATES.md is for behaviour rsvelte
  **implements** differently on purpose — point at the implementing code; a feature that is
  simply unbuilt stays listed as unimplemented. An attribution to "upstream" is the one nobody
  re-measures, so measure both arms before writing it, and file the report under
  `upstream_issues/` (`check-upstream-issues` gates the index).
- Counts in prose rot; `known-failures-md-check.mjs` gates the declared count and partition
  lines of `KNOWN-FAILURES.md` and nothing else. Count the JSON, not the paragraph.

### CI

- `scripts/ci/corpus-compat-job-filter.mjs` derives each Corpus Compat job's blast radius from
  `cargo metadata`; any non-crate path enables everything (skipping a gate reads exactly like
  passing it). `lsp-corpus` (~1,300 job-minutes) runs on schedule and dispatch only, re-admitted
  on a PR that touches `scripts/compat-lsp/**` or its ratchet.
- The account has a **20 concurrent job** ceiling; ask about capacity by summing
  `runs/<id>/jobs` across runs of every status, never by counting runs. Keep in-flight PRs few.
- Reading check state: group `statusCheckRollup` by name and take the newest `startedAt` (a
  superseded run keeps its old FAILURE); a cancelled shard makes its rollup FAILURE with no log;
  `absent` is not green; a settle predicate must require `total > 25 && received == total &&
  completed == total && state == OPEN` — an empty set satisfies "nothing failed", and a stacked
  PR is silently closed when its parent merges. A job whose runner vanished has **no log**;
  `gh run rerun <id> --failed`.
- Concurrency groups that may cancel are declared in `workflow-trigger-guard.mjs`'s allowlist
  (`pnpm run check:workflow-triggers`); do not re-derive that set by hand.

## Measurement discipline

Each rule below has cost this project a shipped bug or a retracted report; the case histories
are in the archived file.

- **Never read a verdict through a truncating or discarding stage.** `| tail`, `| head`,
  `2>/dev/null`, `|| echo 0`, `; echo EXIT=$?` and `head` closing a pipe before a buffered
  process flushes all turn a failure into a green. Write to a file, then read the file; a
  pipeline's status is its last stage's. In code the same shape is a conservative
  `unwrap_or`/`unwrap_or_default` on a computed boundary: a wrong argument then reads as
  "the change is inert" rather than as a broken instrument.
  A cap applied for **display** becomes a population the moment anything downstream reads the
  printed list, and what makes a job log unusable rather than merely lossy is a cap with **no
  residue marker**: `verify.mjs` caps both its NEW list and its stale list at `SHOW = 30` and
  prints no "and N more" in either direction (#4484), so a re-baseline sourced from a job log is
  silently a re-baseline of the first 30.
- **A fabricated value does not have to be a number, and a non-numeric one defeats every check
  people write.** The recorded fabrications are numeric — `|| echo 0`, a rejected timestamp, an
  empty `comm`, a paging window's short count — so the defences are range checks, denominators
  and "does this look plausible". A hash sweep over 33,623 live components reported `js.map MOVED = 0`
  on every file because the NAPI `compile` returns `js.map` as an **object** and the harness
  hashed `String(map)`: `"[object Object]"`, one constant, for every input. It hashes cleanly, it
  is identical in both arms, and it is **stable across reruns** — reproducibility normally argues
  *for* a result. The sibling field in the same record (`js.code`, a string) was measured
  correctly throughout, so the table read as a well-formed half-zero. Nothing inside the run can
  see it: the defence is a two-sided control run **before** the result is believed — here four
  files, three whose maps must move and one that must not, which named the instrument in one
  command (`MAP-MOVED x3 / map-same x1` only after the fix). Check the runtime **type** of every
  value a sweep hashes, not just its name.
- **A negative result needs a positive control, and a control must bypass a stage the
  measurement passed through.** `grep` here is a `ugrep --ignore-files` wrapper (`command
  grep`); quote every glob-shaped argument (`--include='*.svelte'`); a NUL byte makes
  `grep`/`diff` report `Binary file`; `find /tmp` does not descend the symlink. Then inject
  the defect the check exists to catch, require red, restore, require `git diff` empty.
- **Report `mechanism | carrier | population | result`.** Print `UNMEASURED` where there is no
  carrier (a blank and a zero are the same pixel); count live units, not compared units (two
  arms that both threw hash equal); state the tree (`git rev-parse HEAD`) beside any census.
- **Arm identity.** A file name, `buildInfo()`, a path, a flag and the branch you think you are
  on are labels. Identify an arm by a discriminating probe whose fingerprint comes from the
  change's own diff, probe for what it should contain **and** lack, `sha256` both artifacts
  (equal hashes mean one arm measured twice), and settle provenance with
  `git merge-base --is-ancestor`. A staged input can be corrupt: `diff -q` it against the source.
  A probe separates your arm from the alternative you handed it and from no other: when the
  question is "did commit X make my change dead", a cell **X and your change both satisfy**
  answers yes either way, and an arm built from a worktree whose working copy still held the
  change then reads as the base. Prefer building the base from a pristine checkout of the
  merge base, or believe CI over a local arm — CI's tree is one nobody in this session made.
  **The oracle is an arm too, and its identity is a submodule pin.** Corpus sources have to be
  read from a checkout whose submodules are populated, and `submodules/svelte` comes along with
  that choice: a rule about where to read *inputs* silently decides where the *oracle* came
  from. Measured — a checkout parked thirteen commits back pins `56a036f4c` / `5.56.10` where
  the branch pins `7bc0a70fe` / `5.57.0`, the two disagree on **48 of 214** moved units, and a
  sweep's improvement count moved 136 → 169 (the regression count was 0 under both, which is
  the only reason the verdict survived). `VERSION` *does* separate them on this axis, unlike
  the npm/source/built one, so print it and `git ls-tree <the branch you are measuring>
  submodules/svelte` beside any official column. What surfaced it was an impossible combination
  rather than a suspicion: a byte divergence on a manifest entry while its ratchet is empty.
- **A re-baseline is a measurement, not an argument.** A PR carrying a behaviour change *and* a
  ratchet re-baseline has two reasons its gate output can move, and the re-baseline's scope
  argument is about the diff rather than about the measurement — correctly-reasoned scope beside
  a sibling change that moved a key outside it produces a red everyone attributes to the
  re-baseline. Check the committed value against `origin/main`'s on every key you did not intend
  to move. A re-baseline from a local run also needs the arm's own tree asserted
  (`git merge-base --is-ancestor <fix> <arm's HEAD>`): an artifact's `projectRevision` is a
  property of the directory the harness ran in, not of the binary it invoked, and its siblings
  fail identically, so they do not corroborate each other. Record the arm at run time — the
  build artifact is deleted, so afterwards there is nothing left to attribute.
- **Ratios pair arms in time** (official and rsvelte back to back inside each round, ABBA), one
  statistic on both sides; read a profile's call counts before its timings; a shortfall smaller
  than the deciding arm's within-run drift is not a shortfall. Nothing commits on an unmeasured
  estimate.
- **A sweep has two stages.** Hash every unit under both arms (`MOVED = n`, printed beside
  `rows / distinct keys` and the arm probe), then compare only the moved set to the oracle and
  print `match -> MISMATCH` on its own line. A zero has two kinds — "none found" and "my
  instrument cannot express this shape" — and a mechanism counter ("did it fire") sits below both.
- **A probe's SITE decides which question it can answer.** "The grid did not move" and "the port
  was never reached" are the same observation, and so is a third: reached, anchored, and
  **rejected**. A counter at the entry is satisfied by arrival, so it separates only reached from
  not-reached; one at the decision separates accepted from rejected; only one that also prints
  *the state the decision reads* says why. Measured on #4480/#4489, where the anchor was produced
  and refused: what named the cause was the **interleaving of two log lines**, one order for the
  cells that work and the other for the cell that does not. An ordering of two events is an
  observable no grid over outputs can carry, and the three states want three different fixes
  (wire it / fix the anchor / fix the buffer model).
- **A number written as a literal is a claim.** Derive expected values from the oracle (compile
  the input, paste the output), never by inference from neighbouring cells or from your own
  tree's other code path; probe a *direction* before printing it; write rules against the
  artifact ("every entry outside the table") rather than counts that go stale.
- **An instrument can answer correctly in a vocabulary that cannot express the phenomenon**,
  and a control drawn in the same vocabulary passes. Three instances on one day, every one keyed
  on something that cannot represent a *move*. An occurrence **count** over comments scored
  `let p = /* c */ $props()` as agreeing while the comment had changed sides of the statement, so
  the cell carrying the defect entered the issue as a passing control and the issue's title named
  the symptom the mechanism produces second. A residue split into two buckets by "does the first
  differing line carry the marker on one side or on both" reported 23 + 16 mechanisms, where a
  comment that moved by a line has it on one side **by construction** — the classifier's own shape
  became the finding instead of the single family underneath. And `comm -12` returns an **empty set
  with no error** when its input is not in *its own* locale's collating order: `<(… | LC_ALL=C
  sort)` sets the locale for `sort` alone, so the explicit prefix on one stage is worse than none
  on either, and the empty intersection reads as "these branches share no file, proceed" against a
  trial merge that conflicts. None of the three was caught by a control or by re-reading the
  command; all three were caught by **printing the underlying values** — the two file lists side by
  side, all sixteen residue units, the whole output plus every comment-bearing line. That is one
  level below stating the denominator: the denominator says which population, the raw values say
  whether the key can see the thing at all.
- **Grids.** List what every cell holds constant and ask which of those the oracle branches
  on; the cell that kills a hypothesis is usually the one that passes; re-key a grid (widest
  key the assertion can carry) before adding rows; a control's name is a claim — grep the
  cell's input for it; pin a control to the property, not to the instrument's current answer.
  The **direction** of a divergence is one of the constants, and the one nobody lists: a grid
  whose diverging cells all run one way reports a correlation that is a property of the cells
  (measured — "divergence ⟺ a bare block in the output", exact on 5 cells, false on 16, where
  the extra cells diverge the other two ways). And a cell diverges *because of* the thing you
  varied only if the same cell with it removed is byte-equal; run that background arm before
  attributing, because the largest number in a grid is the likeliest to be two mechanisms added
  together.
- **One symptom, several writers — a grid cannot see them, because writers are not an
  input.** Four cells of one defect (a script-trailing comment kept, moved, or dropped before
  the first template statement) turned out to be one root with **four different writers**: a
  declarator's own flush, the block's end flush, `reset_comment_index`'s discard, and
  `flush_trailing_comments` refusing an unlocated `next`. Widening the grid could not have shown
  that — a grid varies inputs, and which function writes the byte is not one. Two mechanisms
  were published off output shape first and both were wrong while citing real code that was not
  on the path (a source map proved the "synthesized span" reason false; instrumentation proved
  the "flushed before the first identifier carrying a source loc" reason false, the leading
  flush having never fired in any cell). What named all four was **one filtered backtrace at the
  write site**, printed beside a per-statement probe of the guard's own inputs. And the cell that
  *agreed* was the expensive one: it agreed through a **different writer**, so it was
  load-bearing evidence for an account it had nothing to do with — a stronger form of "a cell can
  be EQ for a reason unrelated to what it is named", because here the reason was the account.
- **A citation degrades per hop, and what survives the hop is what makes the claim more
  interesting.** The recorded form of this needs a recaller — a person or a file holding a stale
  figure and handing it on. It needs neither. Measured twice on one day, both single-hop, both
  through a session summary: `corpus-compat.yml`'s two `verify.mjs` invocations carried as
  `:812`/`:890` when the file says `:879`/`:959`, and upstream's `isGeneratedVariableTypeHint`
  ending `startsWith('$$')` carried as `startsWith('$')`. The second is the shape to keep,
  because the degradation is not random: single-`$` suppresses every rune declaration a user
  writes where double-`$` suppresses only `$$props`/`$$slots`/`$$restProps`, so the corrupted
  form describes a *larger, more consequential* filter and would have read as the more important
  finding. A line number degrades to a nearby line number and nobody notices; a predicate
  degrades toward the version that would matter more. Both were cited in good faith from notes
  written off the source, so the rule is not "cite carefully" — it is that **a claim's Nth hop is
  not evidence at any N > 0**, and neither survived one `sed -n` against the file it named.

- **A checker's coverage is its SECTION, not its file, and the boundary is invisible from a
  green run.** Measured by injection on `compatibility/GATES.md`, a file two checkers both read:
  a bogus entry placed *inside* `deliberate-divergences-check.mjs`'s own section is caught (rc=1,
  naming the missing pin), and a bogus `#### 99.` heading appended at end of file leaves both it
  and `known-failures-md-check.mjs` at rc=0. So neither "the checkers are blind to this file" nor
  "the checkers cover this file" is true; coverage stops at a heading the output never mentions.
  A green run after you edit some other part of the file reads as coverage and is not — the
  same asymmetry as a wrong `deliberate` classification, where the failure that leaves no evidence
  beats the one that leaves wrong evidence. Inject **at the place you are about to cite the
  checker for**, not at the end of the file: the first injection here was at EOF, and the two
  results together are the finding, where either alone is a wrong sentence.
- **A count can be UNSCOPED, which is a third failure alongside stale and fabricated — and both
  numbers are true.** Two people gave the number of filters one upstream provider applies as
  **six** and **nine**, each confidently, neither stale and neither invented. Read off
  `InlayHintProvider.ts`: `:69-74` is six conjuncts filtering on *shadow* offsets, `:86-88` is
  three more filtering on *original-document* positions. "One of six" and "one of nine" are both
  true sentences about the same commit, and they say different things about how much of an issue
  a PR closed. A stale number is caught by re-deriving it and a fabricated one by asking for its
  derivation; an unscoped one survives both, because every derivation of it is correct. The
  defence is the same as for a population: say what the count is over, in the sentence that
  carries it. Writing **no** number is the safe fallback when you cannot — which is what happened
  here, and it was right for a reason neither party had.
- **A development link closes an issue on merge regardless of what the PR body claims.** A PR
  landing one of the several defects an issue enumerates auto-closed it; the issue reads
  `state=OPEN stateReason=REOPENED` today only because someone noticed. The consequence is a
  wrong `deliberate` classification's — a closed entry produces no further observation — but with
  no reasoning anyone can review, because none was written: the linkage fires on merge and does
  not consult the PR's own account of its scope. After a merge, read what closed and ask whether
  the PR covers it. That is arithmetic rather than judgement, and it is the only check there is.
- **Ask which artifact owns a question before hand-deriving it** (`attribution-check.mjs`,
  the trigger-guard allowlist, `lint-verify.mjs`'s repo-set guard). Two readings of one
  document are one measurement; what actually fires these rules is the same quantity produced
  twice by independent derivations.
- **Ported guards, ports and catch-alls.** A `_ => true` conservative default converts a missing
  arm into a silent byte divergence; a `!== 'leadingComments'` is an enumeration of one; a
  count in a comment ("both sibling branches") is a claim to re-derive. When a fix stops an
  over-rejection, ask what the rejection was hiding.
- **A port can be present and ineffective, and `grep` answers only the first question.** Two
  successive mechanism claims about one defect (#4517) were published and retracted within an hour,
  both derived by reading code rather than running it: first *"the oracle discards pending comments
  at a synthesized offset, so the discard is the defect"* — esrap has the identical discard and
  still emits the comment — then *"what upstream has that we lack is `component_block.loc =
  instance.loc`"* — `JsProgram::component_brace_span` is that port. An env-gated `#[track_caller]`
  trace on **both** compilers ended it: our port works (the cursor resyncs `1/1 → 0/1`), and the
  flush is *attempted* at the same source offset upstream uses and rejected, because under split
  coordinates a source offset sits below `loc_base`. Presence is a grep; effectiveness is a run.
  Once a mechanism claim has been retracted once, the next one is not publishable until the side
  you have not run has been run.
- **An ablation that reproduces the reported cell byte for byte can still be a superset.** Deleting
  `component_block.loc = instance.loc` from the oracle reproduced #4517's output exactly — and over
  the issue's 11-cell grid it broke **10** cells where rsvelte fails **5**. The byte-exact
  reproduction is what makes the attribution feel settled; the five cells we get right are what say
  it is too broad, and they are only visible if the ablation is run over the whole grid rather than
  over the case that motivated it. The same comment also said "4", from memory of the grid rather
  than from the grid — a literal is a claim inside a correction too, and a correction is the
  document most likely to be trusted.
- **Take a needle from the artifact, not from what a thing is called or from memory of its
  wording.** Both signs, one day apart: `String(napi_map)` is `"[object Object]"`, so a
  33,623-file sweep reported `js.map MOVED = 0` — a fabricated value reading as a result; and a
  grep for `maximum is 19` against a landed fix that says `is **194** (193 .ts plus …)` returned
  zero — a real result reading as a fabrication, in the flattering direction nobody re-checks. A
  third the same day was written from what the thing *looks like* rather than from what the
  language says it is: `indexOf('//') > 0` matched `://` in a template literal, so 29 of 61
  "trailing comment" carriers were URLs. A positive control only assigns the zero; it does not
  prevent it.
- **An error bucket in a control is a population, and it has to be opened rather than tallied.**
  `ABSENT-BOTH` was computed from official's count alone, so every case where official drops and
  we keep was filed under a name asserting neither side has it. `STRIP-THREW` held all 14
  real-world block-comment cells, because the comment-free control cut to end-of-line and left a
  `/*` unterminated — "the control died here" and "these agree" are the same pixel in a summary.
  A bucket's name is a claim about a conjunction; check that the key reads every conjunct.
- **Correct action, wrong reason — and both signs are needed for the rule to read as one.** A
  false premise (*"this predicate never admitted block comments"*) prompted a run that found a real
  defect, so the premise was about to be confirmed by its own success; thirty minutes later a true
  observation (*"this arm has a real-world population"*) nearly licensed a false conclusion
  (*"…and does not diverge on it"*), because all 12 carriers sat on a row where agreement is
  **forced**. The wrong reason survives when the action succeeds, and the wrong conclusion survives
  when the observation is accurate. Related, and about the reader rather than the artifact: the
  same four-cell table was over-read twice in one session by one person, with a correction in
  between — being corrected on an artifact does not fix how you read it.
- **An experiment designed against a remembered classification tests the memory, not the
  mechanism.** A prototype's residue had been written up as *"5 of 7 regression files are
  duplications (official 1 / off 1 / on 2), 2 are relocations"*, and the next arm — a high-water
  clamp that stops a comment being written twice — was built and pre-registered against exactly
  that split, with the artifact named on both halves of the falsification condition. It retired
  **0 of 12** regressions and cost **6 of 40** fixes: same regression set, fix set a proper
  subset, strictly worse than not having it. Counting comment tokens per arm says why in one
  command and no build — official / off / on are equal on all seven files (26/26/26, 6/6/6,
  8/8/8, …), so nothing was ever written twice and the clamp had nothing to clamp. The rule this
  file already carries about a recalled number is weaker than this case needs: **a
  classification is a word, so nothing about it looks like a quantity to check**, and a
  pre-registration inherits the word without ever naming the observation under it. Before an
  experiment is designed against a prior characterisation, re-derive the characterisation, and
  prefer a derivation that is a *count* — a count has an instrument and a word does not. The
  same re-derivation then retired the *next* design too: three of the seven relocations land
  beside a component call, which is a node upstream locates, so the "restrict to spans that
  mirror an upstream `loc`" fix would not have moved them either.

## Working with Subagents

Use the `Agent` tool for substantial work — feature implementation, multi-file refactors, broad
code exploration, or anything likely to consume meaningful context.

- `Explore` — codebase exploration and search across many files
- `Plan` — design implementation strategy before non-trivial work
- `general-purpose` — multi-step implementation and research
- For trivial single-file edits, work directly without spawning a subagent.

## Commit Guidelines

- Commit frequently, one logical change per commit; push immediately after committing
- Run `cargo fmt && cargo clippy --all-targets --all-features -- -D warnings` before committing
- Releases are automated via Changesets Release PRs. A changeset must name **every** consumer
  `scripts/release/check-core-consumer-changesets.mjs` lists (e.g. `@rsvelte/svelte-check` ships
  `rsvelte_projection`), not only the package whose directory you edited.
- After a publish, `scripts/release/comment-released-versions.mjs` comments `package@version`
  on every PR whose changeset shipped (mapping from CHANGELOGs, so PRs without a changeset are
  skipped). Preview: `node scripts/release/comment-released-versions.mjs --base <prev-release>^ --dry-run`
- A **brand-new** platform package cannot be published by CI (npm OIDC needs an existing name):
  `pnpm run bootstrap-platform-packages -- --run <ci-run-id> --yes`, attach the trusted
  publisher on npmjs.com, re-run the release. A release is two publish events (Marketplace /
  Open VSX via `Publish VS Code Extension`, npm via `Release`); read each registry, not a
  workflow's colour.

## Maintaining This File

- Add a rule here only when it is short, general and has already cost a shipped bug or a
  retracted measurement. Case histories, numbers and per-gate detail go to `docs/` or
  `compatibility/GATES.md`, with a one-line pointer here if needed.
- Prefer a grep or a script name over its answer; prefer a rule over a count. Any number
  written here is unchecked by any gate and will go stale.
- Remove outdated information; keep the whole file readable in one sitting.

## Test Status

<!-- svelte-target-version -->Source: `pnpm run compatibility-report` (Svelte **v5.57.0**).<!-- /svelte-target-version --> Re-run `pnpm run test-and-update`
to refresh. Runtime skip lists and fixture compile options are shared constants in
`crates/rsvelte_core/tests/common/mod.rs`; `tests/audit_skipped.rs` re-checks every skipped
fixture after a Svelte bump.

| Suite | Pass/Total |
|-------|------------|
| Parser Modern | 28/28 |
| Parser Legacy | 83/83 |
| Compiler Errors | 146/146 |
| Compiler Snapshot | 30/30 |
| CSS | 183/183 |
| Validator | 334/334 (full `(code, message, start, end)` shape) |
| SSR | 104/104 |
| Hydration | 81/81 |
| Runtime Legacy | 1207/1207 |
| Runtime Runes | 1046/1046 |
| Runtime Browser | 35/35 |
| Print | 50/50 |
| Preprocess | 19/19 |
| Sourcemaps | 29/29 (output equality; map correctness is `sourcemaps_gate.rs`) |
| svelte2tsx | 256/256 |
| Migrate | 0/76 (out of scope) |

All in-scope fixtures pass. The 76 `migrate` fixtures (Svelte 4 → 5 migrator) are
intentionally out of scope; do not start migrate work without an explicit scope change.

- **Source-map gate**: `crates/rsvelte_core/tests/sourcemaps_gate.rs` ports the upstream
  `_config.js` anchors plus two structural budgets; the ratchet is empty. Regenerate with
  `UPDATE_SOURCEMAP_RATCHET=1 cargo test -p rsvelte_core --test sourcemaps_gate -- --ignored sourcemap_gate_measure`.
  The server map is built by a text token scan in `3_transform/mod.rs`, not by esrap — a
  second port of the client's mapping.
- **Formatter parity (svelte.dev)**: `crates/rsvelte_formatter/tests/svelte_dev_corpus.rs` and
  `crates/rsvelte_fmt/tests/svelte_dev_markdown.rs` assert byte equality with an
  `oxfmt(svelte: true)` oracle (`pnpm run generate-fmt-corpus`, needs a runnable `oxfmt`).
  Hard gate, no tolerance. `rsvelte-fmt` formats CSS in-process via `oxc_formatter_css`, which
  is not the oracle's PostCSS path; `--no-native-css` restores the `oxfmt` subprocess.

## Ecosystem Status

| Wave | Scope | Status |
|---|---|---|
| 1 | svelte2tsx | ✅ 253/253, wired into the compatibility report |
| 2 | svelte-check | ✅ v1.0 — walker + overlay + tsgo + incremental cache + watch + parallel compile + hires source maps + SvelteKit kit-file augmentation; reads diagnostic-relevant `compilerOptions` from `svelte.config.*` and `vite.config.*` |
| 3 | vite-plugin-svelte | 🟢 v1.0 — Rust NAPI bindings (`hmr_diff` / `resolve_id` / `preprocess`) + `@rsvelte/vite-plugin-svelte` shim at `apps/npm/vite-plugin-svelte`; supports Vite 6/7/8 |
| 4 | svelte-language-server | ✅ M5 — native Svelte/HTML/CSS/TypeScript features, preprocess-aware projections, upstream-compatible VS Code distribution, five native platform packages, plus Neovim, Zed, Sublime, Helix and Emacs setup |

- `rsvelte-check` timing (`RSVELTE_CHECK_TIMING=1`): the walk/compile/overlay/typecheck split
  depends on project size — typecheck dominates at 100–500 components, the syscall-bound
  overlay dominates at 5,000. `--incremental` is the largest lever (5–7x warm) and stays off
  by default because upstream calls the mode lossy.
- `rsvelte_lint` ships as [`@rsvelte/lint`](apps/npm/lint). Its report path and fix path are
  separate implementations; the module surface (`.svelte.(js|ts)`) is a separate code path
  with almost no corpus population; all gates drive the CLI, so `json_api.rs` (wasm / NAPI)
  is gated by unit tests only; `extends: ["none"]` is a gate-only configuration that also
  disables the parse-error diagnostic. The Svelte parser here is the compiler's and is
  deliberately stricter than `svelte-eslint-parser` — do not loosen it.
- Type-aware lint (`crates/rsvelte_lint_types`) is its own Cargo workspace depending on
  `submodules/corsa-bind`; the root `cargo test` / `fmt` / `clippy` never build it. Run
  `pnpm run test:type-aware-lint` (installs the pinned `@typescript/native-preview` from
  `scripts/dev/type-aware-lint/package.json`). Its lockfile drifts on every in-repo version
  bump; `pnpm run check:lint-types-lock` runs on every PR and `pnpm run fix:lint-types-lock` repairs it.

## Quick Reference

1. Find the tool's reference in the *Architecture* table (compiler: `submodules/svelte/packages/svelte/src/compiler/phases/{phase}/`)
2. Implement in the mirroring Rust module (compiler: `crates/rsvelte_core/src/compiler/phases/`)
3. Run tests: `cargo test --release` (or a scoped debug run with `RUST_MIN_STACK`)
4. Land a repro under `compatibility/pattern-corpus/` for any corpus-found defect
5. `pnpm run test-and-update` refreshes README.md and the compatibility report
   (default path `fixtures/{svelte-short-commit}/compatibility-report.json`, generated, not checked in;
   override with `node scripts/dev/update-docs.mjs --report <path>`)
