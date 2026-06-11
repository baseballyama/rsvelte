# Corpus-compat: remaining work (burn-down playbook)

Status as of 2026-06-11 (branch `feat/corpus-burndown`, Svelte 5.56.2):

| metric | count |
|---|---|
| corpus entries (CSR + SSR both compiled & compared) | 6,409 |
| match (byte-identical after normalization) | 5,226 |
| error parity (official rejects, rsvelte rejects with the SAME code) | 890 |
| **known failures (baseline)** | **293** |
| error-presence / error-code mismatches | 0 |

**Burn-down landed (316 → 293, all verified against corpus + byte-exact
runtime/ssr/compiler fixture suites, no regressions):** `should_proxy`
identifier-binding resolution + SequenceExpression + drop prop-default branch;
comment-only `<script module>` dropped; `$props.id()` → defined STRING (server
eval); block-branch leading-whitespace loop-trim + each-`{:else}` comment-skip;
`TEMPLATE_USE_IMPORT_NODE` for static `<video>`/custom elements; load/error
`onload`/`onerror` capture for `use:` directives; known-global calls
(`Math.*`/`Number`/`String`/`BigInt`) skip `?? ""` in text interpolation.

**The remaining ~293 are dominated by the esrap-printer class** (positional
comment placement, layout/collapse on oxfmt-unparseable files, `template_effect`
memo split, template-literal width wrapping). These are NOT fixable by string
post-passes (see the ground rules below) — they need the Phase-3 esrap printer
port (`docs/phase3-ast-refactor-plan.md`, step 0). The handful of remaining
non-printer bugs (`{const}` DeclarationTag each-item `$.get` wrapping;
`@attach`+`$effect` component wrapper; snippet out-of-scope; context-aware
`?? ""` for assignment-exprs / bound dimensions; CSS parse edge cases) are deep,
text-based, and regression-prone (a `yScale(tick)`→`yScale()(tick)` attempt was
reverted after it broke `derived-unowned`/`derived-map` two different ways).

The remaining ids live in `compat/corpus/known-failures.json`. CI
(`corpus-compat.yml`) fails only on entries NOT in that baseline, so every
PR may only shrink the list, never grow it (ratchet).

## The loop (one cluster at a time)

Each iteration is self-contained and safe for an entry-level agent
(Sonnet-class). **The official compiler is always the oracle** — when in
doubt, run it and mirror it; never "improve" on its output.

```bash
# 0. one-time setup (after clone)
git submodule update --init --depth 1 submodules/svelte
(cd submodules/svelte && pnpm install --frozen-lockfile)
pnpm install
pnpm run corpus:sync           # init/update svelte + svelte.dev submodules

# 1. build + stage the NAPI binding (two commands — do NOT chain with `grep -c &&`)
cargo build --release --features napi --lib
cp target/release/librsvelte_core.dylib .corpus-cache/rsvelte.node   # .so on Linux

# 2. regenerate outputs + report, then pick the biggest cluster
pnpm run corpus:collect && pnpm run corpus:compile
node scripts/compat-corpus/verify.mjs --max-print 0   # exit 0 = no regressions
node scripts/compat-corpus/cluster.mjs                # grouped by diff signature
node scripts/compat-corpus/cluster.mjs --show 'JS server: E:$$renderer'  # ids in one cluster

# 3. inspect ONE entry end to end
node scripts/compat-corpus/one.mjs '<corpus-id>'                 # post-normalization diff
node scripts/compat-corpus/one.mjs '<corpus-id>' --raw           # raw diff
cat "compat/corpus/sources/<corpus-id>"                          # the input

# 4. find the upstream rule
#    grep the relevant helper/visitor under:
#      submodules/svelte/packages/svelte/src/compiler/phases/3-transform/{client,server}/
#      submodules/svelte/packages/svelte/src/compiler/phases/2-analyze/
#    and port the EXACT condition into the matching rsvelte module under
#      crates/rsvelte_core/src/compiler/phases/

# 5. validate — fixture suites are byte-exact and MUST stay green
CARGO_TARGET_DIR=/tmp/mywork RUST_TEST_THREADS=2 RAYON_NUM_THREADS=2 \
  RUST_MIN_STACK=33554432 cargo test --release --test runtime --test ssr --test compiler_fixtures
cargo fmt && cargo clippy --all-targets --all-features -- -D warnings

# 6. shrink the baseline and commit
pnpm run corpus:compile
node scripts/compat-corpus/verify.mjs --no-fmt --update-baseline
git add -A && git commit   # include baseline shrink in the same commit as the fix
```

Gotchas learned the hard way:

- `compileModule` parses **plain JS only** (upstream parity). `.svelte.ts`
  corpus modules are esbuild-stripped by `compile.mjs` before compiling —
  never re-add filename-based TS sniffing.
- `verify.mjs` absorbs formatting in the **comparison layer** (oxfmt +
  `normalize.mjs` blank-line stripping). Do NOT add output post-passes to
  the compiler to chase layout — rsvelte targets 100x compile performance
  (see `docs/phase3-ast-refactor-plan.md` for the structural fix).
- A worker panic in `compile.mjs` is recorded as a `rust_panic` error for
  that entry and the run continues — grep `report.json` for `rust_panic`.
- Always use an isolated `CARGO_TARGET_DIR` when other agents/builds may
  share the tree; mixed rlib hashes cause bogus E0308 "two rustc_hash
  versions" errors. `cargo clean` fixes a poisoned shared target.
- `grep -c X | …` exits non-zero on zero matches — never chain `&& cp`
  after it (a stale staged binding silently invalidates your repro).

## Remaining clusters (2026-06-11 snapshot, 316 ids / 291 signatures)

Counts are diff-signature groups from `cluster.mjs`; one root cause often
spans several signatures. Re-run `cluster.mjs` for the live picture.

### 1. esrap positional-comment artifacts (~80–100 ids, biggest theme)
Upstream prints through esrap, which carries a **global comment stream
indexed by source position**: comments from REMOVED statements (`$effect`
bodies, event handlers, module-level docs) re-attach to the next emitted
node — sometimes mid-declaration (`var // comment\n  button = root();`),
sometimes inside synthesized call args (`console.log("…", /*moved*/ false)`).
Signatures: `E:$.init(); | A:// ...`, `E:var fragment = root(); |
A:/** @type … */`, `E:console.log( | A:console.log("…", …); // false`,
`E:// will console.log when … | A:$$renderer.push`, jsdoc/import shifts in
migrate samples.
Approach: extend the `lost_comments` / `flush_pending_comments_into_body`
machinery (`server/build.rs`, threaded from `visitors/element.rs`) to
client transforms, anchoring holes by source position against the blanked
script — or wait for the Phase-3 printer refactor, which makes this free
(the printer owns one comment stream, like esrap). Prefer the latter for
the gnarliest cases; they are cheap to verify afterwards.

### 2. legacy template-literal text effects (~20 ids)
`E:\`oh no! ${ | A:"…",` (12) + `const-tag-if-else-if` shape (3):
upstream emits one `$.set_text(text, \`…${expr}…\`)` template literal
where rsvelte emits concatenation or a different memo split.
Reference: client `Fragment`/text visitors building `b.template_literal`.

### 3. `$.template_effect` / `$.set_text` memo split (~10 ids)
`E:$.template_effect(() =>` (multiline arrow with memo destructure) vs
rsvelte single-line call. Content differs in HOW expressions are memoised
(`$0`, `$1` derived args). Reference: upstream `build_template_chunk` /
`Memoizer` in 3-transform/client.

### 4. `$.state($.proxy(...))` vs `$.state(...)` (~5 ids)
rsvelte proxies where upstream doesn't (`let left = $.state(total)`).
Upstream rule: `should_proxy` (3-transform/client/utils.js) — literal /
non-reassigned-binding analysis. Port the exact predicate.

### 5. server `$.stringify(uid)` vs bare `${uid}` (~5 ids)
`$props.id()` bindings interpolate bare upstream (evaluates to STRING);
rsvelte wraps in `$.stringify`. Same `scope.evaluate` machinery as the
client fix already landed in wave 4 (`is_expression_defined_json`) —
mirror it in the server attribute path.

### 6. comment-only components (~4 ids)
`<script>// module-level logic goes here</script>` only: upstream drops
the script entirely (no statements), rsvelte keeps the comment, shifting
everything. Check upstream's empty-program handling in 3-transform.

### 7. select/await/misc server push content (~25 ids)
`E:$$renderer.push("…") | A:$$renderer.push("…")` with differing template
content — sample each; several distinct small causes (await block
placeholders, attribute interpolation differences). Treat as N micro-fixes.

### 8. css-mismatch (6 ids)
`<style>` content after parse/print round-trips (`whitespace-after-style-tag`,
`css-pseudo-classes`, `preprocess/partial-names`, `print/style`,
ConsoleLine). Likely print/preprocess style-tag handling, not scoping.

### 9. number-literal `N,` clusters (~10 ids)
`compile-warnings.md/14.svelte` etc. — numeric spelling differences that
survived the wave-1 `restore_number_literals` (e.g. values appearing twice
with different spellings are skipped as ambiguous). Extend the value→raw
map to be occurrence-positional, or fix at the printer level.

## Definition of done

`compat/corpus/known-failures.json` is an empty array, `verify.mjs --strict`
exits 0, and the corpus-compat workflow stays green across a svelte.dev pin
bump (`auto-update-corpus.yml` PR) and a Svelte submodule bump.
