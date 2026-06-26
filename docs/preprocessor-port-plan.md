# Preprocessor Port Plan

Plan for porting the **major Svelte preprocessors** to rsvelte (Rust), so a
Svelte project's common `svelte.config.js` preprocessor stack runs on the
rsvelte pipeline instead of (or alongside) the JS originals.

Scope picked from the
[awesome-svelte · Preprocessing](https://github.com/TheComputerM/awesome-svelte#preprocessing)
list. The full list and the in/out-of-scope call for each entry are in
[§5](#5-awesome-svelte-coverage).

> Status: **planning only.** No preprocessor code is ported yet. This document
> + the three reference submodules below are the starting point. The
> next-session `/goal` text is in [§7](#7-next-session-goal).

---

## 1. Why / what we're building on

rsvelte already has the **preprocess *engine*** — the `svelte.preprocess()`
equivalent that *runs* preprocessors — in
`crates/rsvelte_core/src/compiler/preprocess/` (19/19 fixtures green). It mirrors
upstream's public surface:

- `PreprocessorGroup { name, markup?, script?, style? }`
  (`preprocess/types.rs`) — the markup/script/style hooks.
- `Processed { code, map, dependencies, … }` return shape + the
  `MappedCode` / `decode_sourcemap` machinery for stitching source maps across
  passes (`preprocess/{mod,decode_sourcemap,replace_in_code}.rs`).

What's **missing** is the preprocessors themselves — the `PreprocessorGroup`
*implementations* that a user installs (`svelte-preprocess`, `mdsvex`, …). This
plan ports those implementations as Rust `PreprocessorGroup`s that plug into the
existing engine. Nothing in the engine needs to change for the common cases;
gaps are noted per-port below.

**Reference submodules added with this plan** (shallow, `ignore = dirty`):

| Submodule | Upstream | Pinned | Role |
|---|---|---|---|
| `submodules/svelte-preprocess` | sveltejs/svelte-preprocess | v6.0.5 | reference impl + fixtures |
| `submodules/mdsvex` | pngwn/MDsveX | v0.8.5 | reference impl + fixtures |
| `submodules/svelte-switch-case` | l-portet/svelte-switch-case | v2.0.0 | reference impl + fixtures |

---

## 2. Design decisions (decide before coding)

1. **Where the code lives.** Preferred: one crate per preprocessor under
   `crates/` (e.g. `crates/rsvelte_preprocess`, `crates/rsvelte_mdsvex`,
   `crates/rsvelte_switch_case`), each exposing a `PreprocessorGroup` builder +
   an N-API/WASM binding so it can be consumed from JS `svelte.config.js`. This
   keeps `rsvelte_core` lean and lets a project adopt one preprocessor without
   the others. Alternative (simpler first step): a `preprocess/builtins/` module
   inside `rsvelte_core`. **Recommend per-crate once `switch-case` proves the
   shape.**
2. **Rust-native vs. JS-bridged transforms.** Some transforms have mature Rust
   backends (TypeScript strip, Sass, CSS); others are deeply tied to the JS
   ecosystem (PostCSS *plugins*, remark/rehype). The rule:
   - **Rust-native** when a maintained crate covers the surface (see §3 table).
   - **JS fallback** (call the user's installed JS tool over a thin boundary)
     when it doesn't — same approach `@rsvelte/vite-plugin-svelte` already uses
     for arbitrary preprocessors. Document every fallback so "drop-in" stays
     honest.
3. **Drop-in fidelity.** Each port must accept the upstream **options object**
   shape and produce byte-/AST-equivalent output for the in-scope features, with
   correct **source maps** (the engine already stitches them; each transform
   must emit one). Compat is measured against the upstream test suite (§4).
4. **`@rsvelte/*` packaging.** Publish under the `@rsvelte` scope mirroring the
   shipped tools, listed in `apps/playground/src/lib/ecosystem.ts` once usable.

---

## 3. Per-preprocessor plans

### 3a. svelte-switch-case  ·  *Wave 0 (proof of concept)*

The smallest port — pure **markup/script syntax sugar** (`switch` / `case` /
`default` → Svelte `{#if}/{:else if}` blocks). No external language toolchains,
so it isolates and validates the whole "ship a `PreprocessorGroup` as an
`@rsvelte` package" pipeline end-to-end before tackling the big ones.

- Read `submodules/svelte-switch-case/src` for the exact transform + option
  shape; port the transform onto the rsvelte template AST (we already parse
  Svelte — reuse it rather than regex).
- Compat: port the upstream test fixtures; require identical output + maps.
- Deliverable: `@rsvelte/svelte-switch-case` (or a `builtins` module) + fixtures
  wired into the preprocess test suite.

### 3b. svelte-preprocess  ·  *Wave 1 (the big one)*

`svelte-preprocess` is an **auto-preprocessor**: it inspects `lang=`/`type=`
attributes on `<script>` / `<style>` (and `src=`) and dispatches to a
per-language transform, plus `globalStyle`, `replace`, and external-file
inlining. Port it transform-by-transform, Rust-native first:

| Transform | Rust-native backend | Plan |
|---|---|---|
| TypeScript | **oxc** (rsvelte already strips TS via `remove_typescript_nodes`) | Rust-native. Reuse the existing TS-strip path; emit map. |
| SCSS / Sass | **`grass`** (pure-Rust Sass) | Rust-native. Map options (`includePaths`, `outputStyle`). |
| CSS / PostCSS-lite | **`lightningcss`** | Rust-native for nesting / autoprefix / minify. **Arbitrary PostCSS *plugins* → JS fallback** (cannot run JS plugins in Rust). |
| Babel | **oxc** transform | Rust-native (oxc covers the common transforms). |
| `globalStyle`, `replace` | n/a | Pure Rust string/AST passes. |
| Less | *(no mature Rust port)* | **JS fallback** to installed `less`. |
| Stylus | *(none)* | **JS fallback**. |
| Pug | *(none mature)* | **JS fallback** (or out of scope v1). |
| CoffeeScript | *(niche)* | Out of scope v1. |

- Start with **TypeScript + SCSS/Sass + CSS + globalStyle + replace** (covers the
  overwhelming majority of real configs), then add JS fallbacks for the rest.
- Honour the `svelte-preprocess` options object verbatim (`scss`, `postcss`,
  `typescript`, `globalStyle`, `replace`, `sourceMap`, per-lang options).
- Compat: drive `submodules/svelte-preprocess/test` fixtures; require parity for
  in-scope transforms; assert JS-fallback transforms match the installed tool.

### 3c. mdsvex  ·  *Wave 2 (markdown)*

`mdsvex` turns `.svx` / `.md` into Svelte components via the **unified /
remark / rehype** pipeline (frontmatter, layouts, code highlighting, custom
components, remark/rehype plugins).

- **Rust-native core:** markdown → Svelte using **`comrak`** (GFM, frontmatter)
  or `pulldown-cmark` (already in the dep tree). Cover: frontmatter →
  `<script context="module">` exports, layout wrapping, fenced-code handling,
  and emitting valid Svelte markup the rsvelte compiler then consumes.
- **Out of initial scope / JS bridge:** arbitrary **remark/rehype plugins** and
  JS highlighters (Shiki) are a JS ecosystem — expose a plugin hook that bridges
  to JS, or document them as unsupported in v1. Pick one in the design step.
- Compat: `submodules/mdsvex/test` fixtures for the core; clearly label
  plugin-dependent fixtures as bridged/unsupported.

---

## 4. Compatibility testing strategy

Mirror the existing harnesses (svelte / svelte2tsx fixtures):

1. Each submodule's upstream **test fixtures** become the oracle. Add a
   `crates/rsvelte_core/tests/`-style suite (or per-crate tests) that runs the
   rsvelte port over each fixture input and diffs against the upstream output.
2. **Source maps** are part of the contract — verify, don't just check code.
3. **JS-fallback** transforms: assert the port's output equals the installed JS
   tool's output (run both in CI), so "drop-in" is provable.
4. Ratchet a `known-failures` list (like the compat corpus) that may only shrink.

---

## 5. awesome-svelte coverage

| Entry | Decision |
|---|---|
| **svelte-preprocess** | **Port** (Wave 1). The standard stack. |
| **MDsveX** | **Port** (Wave 2). The standard markdown preprocessor. |
| **svelte-switch-case** | **Port** (Wave 0). Tiny; proof of concept. |
| svelte-preprocess-less | Covered by svelte-preprocess (Less via JS fallback). Skip standalone. |
| svelte-preprocess-sass | Covered by svelte-preprocess (Sass via `grass`). Skip standalone. |
| modular-css (svelte) | Niche CSS-modules pipeline; out of scope v1 (revisit). |
| svelte-preprocess-markdown | Niche; mdsvex covers the use case. Out of scope. |
| @nvl/sveltex | Niche (Svelte+MD+LaTeX); out of scope v1. |

---

## 6. Phasing (recommended order)

- **Wave 0 — svelte-switch-case.** Stand up the port shape + packaging + fixture
  harness end-to-end on the smallest target.
- **Wave 1 — svelte-preprocess.** TS + SCSS/Sass + CSS + globalStyle + replace
  Rust-native; then Less/Stylus/Pug JS fallbacks.
- **Wave 2 — mdsvex.** Rust-native core; decide remark/rehype plugin strategy.

Each wave: design note → implement → upstream-fixture compat → `@rsvelte/*`
package → add to `ecosystem.ts` (move from *planned* → *shipped*).

---

## 7. Next-session `/goal`

Paste this as the `/goal` for the next session:

> Port the major Svelte preprocessors to rsvelte per `docs/preprocessor-port-plan.md`.
> Work strictly in phases (Wave 0 → 1 → 2) and do not advance a wave until the
> previous one's upstream-fixture compatibility suite is green.
>
> **Wave 0 — svelte-switch-case** (`submodules/svelte-switch-case`, v2.0.0):
> port its switch/case→`{#if}` transform onto the rsvelte template AST as a
> `PreprocessorGroup` (decide crate vs. `preprocess/builtins` per plan §2),
> port the upstream test fixtures into a Rust compat suite, and require identical
> code + source maps. Ship it (package or module) and move svelte-switch-case to
> the `ecosystem.ts` inventory.
>
> **Wave 1 — svelte-preprocess** (`submodules/svelte-preprocess`, v6.0.5):
> implement the auto-preprocess dispatch + Rust-native TypeScript (oxc),
> SCSS/Sass (`grass`), CSS (`lightningcss`), `globalStyle` and `replace`, with
> correct source maps and the upstream options shape; add JS fallbacks for
> Less/Stylus/Pug. Drive `submodules/svelte-preprocess/test` as the compat oracle.
>
> **Wave 2 — mdsvex** (`submodules/mdsvex`, v0.8.5): Rust-native markdown→Svelte
> core (comrak/pulldown-cmark) — frontmatter, layouts, fenced code — and decide
> the remark/rehype plugin strategy (JS bridge vs. unsupported-in-v1). Drive
> `submodules/mdsvex/test`.
>
> Keep `cargo test`/nextest 100% green throughout, commit per wave, push, and
> open a PR per wave. Update `apps/playground/src/lib/ecosystem.ts` (planned →
> shipped) as each lands. Before starting, re-read the plan doc and confirm the
> §2 design decisions (per-crate vs. builtins; Rust-native vs. JS-fallback
> boundary).
