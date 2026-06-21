# Task brief: Phase-3 AST → printer migration (corpus burn-down 42 → 0)

This document is the entry point for the next burn-down task. It assumes the
`feat(corpus): burn-down known failures 125 → 42` PR is merged. The goal is to
drive `compat/corpus/known-failures.json` from **42 → 0**, and the dominant
blocker is a single architectural change: replacing Phase-3's string-surgery
code generation with an AST-construction + printer pipeline.

Read this together with:

- [`docs/corpus-remaining-work.md`](./corpus-remaining-work.md) — the live
  burn-down playbook and per-cluster breakdown.
- [`docs/phase3-ast-refactor-plan.md`](./phase3-ast-refactor-plan.md) — the
  staged refactor plan.
- [`scripts/compat-corpus/README.md`](../scripts/compat-corpus/README.md) — the
  pipeline and comparison rules.

---

## 1. The core problem (why the remaining cluster is _not_ cosmetic)

The corpus comparison parses both outputs with **acorn** and compares the AST
with `start`/`end`/comments/line-wrapping dropped (`normalize.astEquivalent`).
**So if a difference were purely comment placement, it would already pass.** A
failure means the two outputs are genuinely _not_ AST-equivalent.

rsvelte's Phase-3 (`crates/rsvelte_core/src/compiler/phases/3_transform/`)
generates JS largely by **string manipulation** — splitting on `;`, locating
`=`, regex replacement, line-by-line rewriting. When the source contains
comments in awkward positions, those text operations mis-parse and produce
**structurally wrong** output. Concrete example (`migrate/jsdoc-with-comments`):

```js
// expected (official)
// one line comment
let one_line = $.prop($$props, "one_line", 8);

// rsvelte (broken — the comment was swallowed into the prop-name string literal)
let inline_commented; // this should stay a comment = $.prop($$props, 'inline_commented; // this should stay a comment', 0);
```

The prop's _name_ became `'inline_commented; // this should stay a comment'` and
its `$.prop(...)` initializer was lost. That is a real semantic divergence, not
a formatting nit. Several svelte.dev sources hit the same class of bug.

**The fix is not "handle comments better in the string surgery"** — each
fixture mixes several comment forms (JSDoc, trailing `//`, same-line multiline
leading/trailing), and making all of them robust in text form is equivalent to
re-implementing comment attachment. The official compiler builds a JS AST with
comments attached as node metadata and prints it with **esrap**. Porting that
architecture is the durable fix.

---

## 2. Scope of work — the remaining 42, by cluster

Run `node scripts/compat-corpus/cluster.mjs` for the live grouping. As of this
hand-off (41 js-mismatch + 1 error-mismatch):

| Cluster                                                                                                                                                       | Count | What it needs                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Comment-mangling** (svelte.dev `.svelte` / `.svelte.ts`)                                                                                                    | ~15   | **Phase-3 AST → esrap printer** (this task's main body)                                                                                     |
| **Constant folding** (declaration-tag-division, window-bindings, svg `$.stringify`)                                                                           | ~4    | Client **Evaluation port** deeper stages (fold `{const x = 5/2}` → `2.5`; `Math.round(y)` memoization)                                      |
| **`$derived`-returning-function currying** (`yScale()(tick)`)                                                                                                 | ~3    | ⚠️ Policy-blocked — see memory `feedback_has_call_semantics`; reverted twice. Do not touch without a new decision.                          |
| **Slot-forwarding / nested-destructure quirks** (rest-eachblock setter `$.get`, destructured-props-3 declaration merge, shadowed-forwarded-slot, slot-usages) | ~5    | Targeted codegen fixes (independent of the printer)                                                                                         |
| **store-vs-rune detection** (`$state()` on an imported store)                                                                                                 | 1     | Regression-prone; needs `uses_runes` exclusion + legacy `$state()()` call-wrap to land _together_                                           |
| **Official-compiler crash edge case** (migrate/svelte-component client)                                                                                       | 1     | Won't-fix: the _official_ compiler throws (esrap can't print a leaked `LetDirective`); rsvelte is correctly more capable. Leave documented. |

The printer migration clears the largest cluster and very likely several of the
"slot/destructure quirks" too (their string-surgery breakage shares the root
cause). The Evaluation-port and store/rune items are separate, smaller tracks.

---

## 3. Recommended approach (incremental, never red)

The plan in `docs/phase3-ast-refactor-plan.md` is staged. The guiding principle:
**never break the green baseline.** Build the AST/printer path _alongside_ the
existing string surgery, gated so it only takes over cases it fully handles and
falls back otherwise. Suggested sequence:

1. **Inventory the existing AST surface.** There is already a `js_ast` module
   and a parser-AST `print/` module (used by the 43/43 `print` test suite).
   Decide whether to extend `print/` into a general JS printer or port `esrap`
   fresh. Match esrap's comment-attachment model (leading/trailing/dangling
   comments on nodes).
2. **Pick one self-contained codegen surface first** — e.g. the instance-script
   `export let` / prop-declaration lowering, which is where the comment
   corruption above originates. Build its output as an AST with comments, print
   it, and gate it behind a feature/flag with string-surgery fallback.
3. **Expand surface by surface**, re-running the full verification (below) after
   each, watching the failure count strictly decrease and the byte-exact suites
   stay green.
4. Once the printer covers the instance/module script + template expression
   output, the comment cluster collapses; then remove the corresponding
   string-surgery code.

Parallel smaller tracks (can be done independently, by anyone): the
slot/destructure quirks and the store/rune detection.

---

## 4. Verification methodology (do this after every change)

All four must stay green; the corpus baseline may only shrink.

```bash
# 1. Build + stage the NAPI binding
CARGO_TARGET_DIR=$PWD/target cargo build --release --features napi --lib
cp target/release/librsvelte_core.dylib .corpus-cache/rsvelte.node   # .so on Linux

# 2. Debug a single entry while iterating
node scripts/compat-corpus/one.mjs <corpus-id> [--target client|server] [--raw]
node scripts/compat-corpus/cluster.mjs            # group remaining failures

# 3. Full corpus (must show no regressions; count must not rise)
node scripts/compat-corpus/compile.mjs
node scripts/compat-corpus/verify.mjs             # CI runs exactly this
# when an entry newly passes, shrink the baseline:
node scripts/compat-corpus/verify.mjs --no-fmt --update-baseline

# 4. Byte-exact suites (must stay 100% green)
rm -rf /tmp/corpus-test-target   # if stale-target linker errors appear
CARGO_TARGET_DIR=/tmp/corpus-test-target RUST_TEST_THREADS=2 RAYON_NUM_THREADS=2 \
  RUST_MIN_STACK=33554432 cargo test --release \
  --test runtime --test ssr --test compiler_fixtures --test css \
  --test validator --test compiler_errors
```

Notes learned this session:

- `verify.mjs` reports counts by verdict; the **total** known-failures is
  `js-mismatch + css-mismatch + error-mismatch`. Don't read js-mismatch alone.
- `verify.mjs --no-fmt --update-baseline` is the canonical baseline writer; it
  can differ from the fmt'd count by entries whose only residual diff is one
  acorn can't parse — keep an eye on `error-mismatch`.
- Clean-target byte-exact runs are slow (~10–15 min); the corpus (6,409 entries)
  is the faster and more comprehensive _output-equality_ gate. Use byte-exact
  suites to catch _runtime-semantic_ regressions.

---

## 5. Hard constraints (do not violate)

- **Never add output post-passes** to the compiler to chase layout. Formatting
  is absorbed only in the comparison layer (`scripts/compat-corpus/normalize.mjs`,
  oxfmt, blank-line strip). The compiler targets 100x throughput.
- **Do not re-add filename-based TS sniffing** for `.svelte.ts` modules.
- The CI ratchet: `compat/corpus/known-failures.json` may only shrink.
- Follow the official compiler exactly
  (`submodules/svelte/packages/svelte/src/compiler/`); mirror its algorithms and
  structure (see `AGENTS.md`).
- `$derived`-returning-function currying is policy-blocked (reverted twice).

---

## 6. Branch / PR workflow gotcha (important)

The long-running `feat/corpus-burndown` branch is **squash-merged** to `main`
each wave, then _continued_. That leaves the branch's individual commits
conflicting with main's squash commit on the next PR (this happened with #980 vs
#979). After each squash-merge, **rebase or reset the branch onto `origin/main`
before continuing**, or be ready to `git merge origin/main -X ours` (safe only
after confirming the branch's known-failures set is a strict subset of main's —
verify with the set-diff script used in #980). Always re-run the corpus verify
after such a merge.
