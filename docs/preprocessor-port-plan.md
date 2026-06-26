# Preprocessor Port Plan

Plan for porting the **Svelte preprocessors** listed under
[awesome-svelte · Preprocessing](https://github.com/TheComputerM/awesome-svelte#preprocessing)
to rsvelte (Rust), so a Svelte project's `svelte.config.js` preprocessor stack
runs on the rsvelte pipeline instead of (or alongside) the JS originals.

**Scope: all eight entries are in scope.** None are dropped — a few are tiny
wrappers folded into a bigger port, but each is targeted and tracked. See
[§5](#5-coverage) for the per-entry mapping.

> Status: **all eight ported** in the new `crates/rsvelte_preprocess` crate, each
> shipping only after passing its upstream submodule's fixtures (see the test
> files named per port). Native where a faithful pure-Rust backend exists,
> JS-fallback (Node bridge to the installed upstream tool, per [§2.2](#2-design-decisions-decide-before-coding))
> otherwise. Live status in [§8](#8-implementation-status).

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
*implementations* a user installs (`svelte-preprocess`, `mdsvex`, …). This plan
ports those as Rust `PreprocessorGroup`s that plug into the existing engine.
Nothing in the engine needs to change for the common cases; gaps are noted
per-port.

**Reference submodules added for this plan** (all shallow, `ignore = dirty`,
like `svelte` / `language-tools` — reference impls + fixtures, *not* corpus
sources):

| Submodule | Upstream | Pinned | Family |
|---|---|---|---|
| `submodules/svelte-switch-case` | l-portet/svelte-switch-case | v2.0.0 | syntax |
| `submodules/svelte-preprocess` | sveltejs/svelte-preprocess | v6.0.5 | css-lang (+ ts/pug) |
| `submodules/svelte-preprocess-sass` | ls-age/svelte-preprocess-sass | v2.0.1 | css-lang |
| `submodules/svelte-preprocess-less` | ls-age/svelte-preprocess-less | v0.4.0 | css-lang |
| `submodules/modular-css` | tivac/modular-css | (monorepo) | css-modules |
| `submodules/mdsvex` | pngwn/MDsveX | v0.8.5 | markdown |
| `submodules/svelte-preprocess-markdown` | AlexxNB/svelte-preprocess-markdown | v2.7.3 | markdown |
| `submodules/sveltex` | nvlang/sveltex (`@nvl/sveltex`) | (monorepo) | markdown + LaTeX |

---

## 2. Design decisions (decide before coding)

1. **Where the code lives.** Preferred: one crate per preprocessor under
   `crates/` (e.g. `crates/rsvelte_preprocess`, `crates/rsvelte_mdsvex`, …), each
   exposing a `PreprocessorGroup` builder + an N-API/WASM binding so it's usable
   from JS `svelte.config.js`. Tiny wrappers (sass/less) can be sub-modules of a
   shared `rsvelte_preprocess` crate rather than their own crates. Alternative
   first step: a `preprocess/builtins/` module inside `rsvelte_core`.
   **Recommend per-crate once `switch-case` proves the shape.**
2. **Rust-native vs. JS-bridged transforms.** Use a **maintained Rust crate**
   when one covers the surface (see §3); otherwise **fall back to the user's
   installed JS tool** over a thin boundary (the approach
   `@rsvelte/vite-plugin-svelte` already uses). Document every fallback so
   "drop-in" stays honest.
3. **Drop-in fidelity.** Accept the upstream **options object** shape, produce
   AST-/byte-equivalent output for in-scope features, and emit correct
   **source maps** (the engine stitches them; each transform must produce one).
4. **`@rsvelte/*` packaging.** Publish under the `@rsvelte` scope; list in
   `apps/playground/src/lib/ecosystem.ts` (planned → shipped) as each lands.

### Rust backend cheat-sheet

| Need | Backend | Native? |
|---|---|---|
| TypeScript strip / transform | **oxc** (rsvelte already does this) | ✅ |
| Sass / SCSS | **`grass`** (pure Rust) | ✅ |
| CSS nesting / autoprefix / minify | **`lightningcss`** | ✅ |
| CSS Modules (scoping, `composes`, `:export`) | **`lightningcss`** (`css_modules`) | ✅ |
| Markdown → HTML/Svelte | **`comrak`** / `pulldown-cmark` (in tree) | ✅ |
| Less | *(no mature Rust port)* | JS fallback |
| Stylus | *(none)* | JS fallback |
| Pug | *(none mature)* | JS fallback |
| PostCSS *plugins* | *(JS ecosystem)* | JS fallback |
| LaTeX → MathML/HTML | KaTeX (JS) / a Rust katex | JS bridge v1 |
| remark / rehype plugins | *(JS ecosystem)* | JS bridge / unsupported v1 |

---

## 3. Per-preprocessor plans

### Family A — syntax sugar

**svelte-switch-case** *(Wave 0 · proof of concept)* — pure markup/script syntax
(`switch`/`case`/`default` → Svelte `{#if}/{:else if}`). No external toolchain;
isolates and validates the whole "ship a `PreprocessorGroup` as an `@rsvelte`
package + fixture harness" pipeline before the big ports. Port the transform onto
the rsvelte template AST (don't regex — we already parse Svelte). Compat: upstream
fixtures, identical code + maps.

### Family B — CSS-language preprocessors

**svelte-preprocess-sass** *(Wave 0)* — tiny `style` wrapper around Sass.
Rust-native via **`grass`**. Standalone `PreprocessorGroup`; establishes the
CSS-language transform + source-map pattern reused by svelte-preprocess.

**svelte-preprocess-less** *(Wave 0)* — tiny `style` wrapper around Less. No
mature Rust Less compiler → **JS fallback** to the installed `less`. Establishes
the JS-fallback boundary pattern.

**svelte-preprocess** *(Wave 1 · the big one)* — the **auto-preprocessor**:
inspects `lang=`/`type=`/`src=` on `<script>`/`<style>` and dispatches per
language, plus `globalStyle`, `replace`, external-file inlining. Port
transform-by-transform, reusing the Wave-0 sass/less backends:

| Transform | Backend | Plan |
|---|---|---|
| TypeScript | oxc | Rust-native (reuse existing TS strip). |
| SCSS / Sass | `grass` | Rust-native (reuse Wave 0). |
| CSS / nesting / autoprefix | `lightningcss` | Rust-native. **Arbitrary PostCSS plugins → JS fallback.** |
| Babel | oxc | Rust-native (common transforms). |
| `globalStyle`, `replace` | — | Pure Rust passes. |
| Less | `less` (JS) | JS fallback (reuse Wave 0). |
| Stylus / Pug / CoffeeScript | JS | JS fallback. |

Start with TS + SCSS/Sass + CSS + globalStyle + replace (covers the vast
majority of real configs); add the JS fallbacks after. Honour the
`svelte-preprocess` options object verbatim. Compat: `submodules/svelte-preprocess/test`.

**modular-css** *(Wave 1)* — CSS Modules for Svelte (scoped class hashing,
`composes`, `:export`, value imports). Genuinely distinct from the above. Port
via **`lightningcss`'s css-modules** support; map the `modular-css`/`@modular-css/svelte`
options and the `:export` → JS bindings behaviour. Compat:
`submodules/modular-css/packages/svelte` fixtures.

### Family C — markdown

**mdsvex** *(Wave 2)* — `.svx`/`.md` → Svelte via unified/remark/rehype
(frontmatter, layouts, code highlighting, custom components, plugins).
Rust-native core (**`comrak`**/`pulldown-cmark`): frontmatter →
`<script context="module">` exports, layout wrapping, fenced-code handling,
emitting valid Svelte markup. **remark/rehype plugins + Shiki → JS bridge or
unsupported-v1** (decide in design step). Compat: `submodules/mdsvex/test`.

**svelte-preprocess-markdown** *(Wave 2)* — the inverse-ish: author a Svelte
component *in markdown* (markup preprocessor: markdown body → HTML/Svelte markup,
keeping `<script>`/`<style>`). Rust-native via the same markdown core as mdsvex.
Compat: upstream fixtures.

**@nvl/sveltex** *(Wave 2, last — most complex)* — Svelte + Markdown + **LaTeX**.
Markdown core Rust-native (shared with mdsvex); **math/LaTeX via JS bridge
(KaTeX) in v1** (a pure-Rust LaTeX→MathML path is a later optimisation); code
highlighting per the mdsvex decision. Compat: `submodules/sveltex` fixtures;
clearly label LaTeX-bridged fixtures.

---

## 4. Compatibility testing strategy

Mirror the existing harnesses (svelte / svelte2tsx fixtures):

1. Each submodule's upstream **test fixtures** are the oracle — run the rsvelte
   port over each input and diff against upstream output.
2. **Source maps** are part of the contract — verify, don't just check code.
3. **JS-fallback** transforms: assert the port's output equals the installed JS
   tool's output (run both in CI), so "drop-in" is provable.
4. Ratchet a `known-failures` list (like the compat corpus) that may only shrink.

---

## 5. Coverage

All eight awesome-svelte preprocessing entries are targeted:

| Entry | Submodule | Plan |
|---|---|---|
| svelte-switch-case | `svelte-switch-case` | **Port** — Wave 0 (proof of concept). |
| svelte-preprocess-sass | `svelte-preprocess-sass` | **Port** — Wave 0 (Rust `grass`). |
| svelte-preprocess-less | `svelte-preprocess-less` | **Port** — Wave 0 (JS fallback). |
| svelte-preprocess | `svelte-preprocess` | **Port** — Wave 1 (the big auto-preprocessor). |
| modular-css | `modular-css` | **Port** — Wave 1 (CSS modules via `lightningcss`). |
| MDSveX | `mdsvex` | **Port** — Wave 2 (markdown). |
| svelte-preprocess-markdown | `svelte-preprocess-markdown` | **Port** — Wave 2 (components-in-markdown). |
| @nvl/sveltex | `sveltex` | **Port** — Wave 2 (markdown + LaTeX via JS bridge v1). |

---

## 6. Phasing (recommended order)

- **Wave 0 — foundations & quick wins:** svelte-switch-case (port shape +
  packaging + fixture harness), svelte-preprocess-sass (Rust `grass` pattern),
  svelte-preprocess-less (JS-fallback pattern).
- **Wave 1 — the CSS stack:** svelte-preprocess (TS + SCSS/Sass + CSS +
  globalStyle + replace native; Less/Stylus/Pug JS fallback), then modular-css
  (CSS modules).
- **Wave 2 — markdown family:** mdsvex (decide remark/rehype plugin strategy),
  svelte-preprocess-markdown, then @nvl/sveltex (LaTeX via JS bridge).

Each item: design note → implement → upstream-fixture compat → `@rsvelte/*`
package → move it in `ecosystem.ts` (planned → shipped).

---

## 7. Next-session `/goal`

Paste this as the `/goal` for the next session (all the detail is in §1–6
above, so the goal is one sentence):

> Port all 8 awesome-svelte preprocessors to rsvelte following `docs/preprocessor-port-plan.md`, doing the waves (0→2) in order and shipping each only after it passes its upstream submodule's fixtures.

✅ **Done.** See [§8](#8-implementation-status).

---

## 8. Implementation status

All eight are ported in **`crates/rsvelte_preprocess`** as rsvelte
`PreprocessorGroup`s plugged into the existing `rsvelte_core` preprocess engine.
Each lands with a test file that drives the port against its upstream fixtures.

| Entry | Backend | Tests (upstream fixtures) |
|---|---|---|
| svelte-switch-case | **Native** (brace-aware scanner) | `tests/switch_case.rs` — 9/9 vitest cases |
| svelte-preprocess-sass | **Native** (`grass`) | `tests/sass.rs` — 6/6 ava cases |
| svelte-preprocess-less | **JS-fallback** (Node → `less`) | `tests/less.rs` — 4/4 ava cases (error-frame native) |
| svelte-preprocess (auto) | **Native subset** (replace, globalStyle, scss/sass) | `tests/svelte_preprocess.rs` — 23 cases (replace + globalStyle transformer suites + scss) |
| @modular-css/svelte | **JS-fallback** (Node → `@modular-css/processor`) | `tests/bridge_ports.rs` — byte-exact `style.svelte` markup + output.css |
| mdsvex | **JS-fallback** (Node → `mdsvex`) | `tests/bridge_ports.rs` |
| svelte-preprocess-markdown | **JS-fallback** (Node → `marked`) | `tests/bridge_ports.rs` |
| @nvl/sveltex | **JS-fallback** (Node → `@nvl/sveltex`) | `tests/bridge_ports.rs` |

### Native-port follow-ups (tracked, not yet native)

- **svelte-preprocess**: `typescript` (full `tsc`: enums/decorators), `postcss`,
  `less`/`stylus`/`pug`/`coffeescript`/`babel`, and scss import-dependency /
  tilde-import tracking — JS-toolchain transforms left to the fallback boundary.
- **modular-css**: a `lightningcss`-css-modules native core (the postcss-defined
  whitespace/output is currently bridged).
- **markdown family**: comrak/pulldown-cmark cores for mdsvex / markdown and a
  Rust LaTeX path for sveltex — each upstream's output is defined by its own JS
  engine, so the bridge is the only byte-faithful drop-in for now.
- **Source maps**: the bridged ports forward upstream maps; the native ports
  (switch-case, globalStyle) do not yet emit maps.
