# Formatter-parity corpus: remaining work (burn-down playbook)

The formatter-parity track (`scripts/compat-corpus/fmt.mjs` + `fmt-verify.mjs`,
wired into the `Formatter parity` CI job) formats every `.svelte` *component* in
the corpus — sveltejs/svelte + svelte.dev, real files plus ```svelte markdown
blocks — with both **rsvelte-fmt** and the **oxfmt(`svelte: true`) oracle**
(prettier-plugin-svelte for the Svelte structure + oxc for embedded JS/CSS, which
is rsvelte-fmt's exact layering), and requires **byte-identical** output. The
ratchet (`compat/corpus/fmt-known-failures.json`) may only shrink.

Status as of 2026-06-14 (branch `feat/corpus-fmt-parity`, Svelte 5.56.2,
svelte.dev@`49ee73732aef`, oxfmt 0.53.0):

| metric | count |
|---|---|
| components in the parity set (oracle-included) | 6,059 |
| byte-identical to the oracle | 5,897 |
| **known failures (baseline)** | **162** (from an initial 431) |

**Burn-down 431 → 162 (269 fixed, 0 regressions at every step).** Landed fixes:

- **Attribute single-mustache quote stripping** — `attr="{expr}"` → `attr={expr}`
  (then shorthand `{attr}` when the expression is the attribute name). A quoted
  single mustache parses to `AttributeValue::Sequence`; route it through the
  unquoted renderer. (`markup.rs`)
- **`svelteSortOrder`** — reorder top-level sections into the canonical order
  (options → module script → instance script → markup → styles), attaching
  leading comments to the section they precede and normalizing the single blank
  line between top-level units. Canonical files are left untouched; the re-parse
  is skipped (via the already-parsed root) when there is only one top-level unit.
  (`sort_order.rs`, `lib.rs`)
- **Component / block child boundary whitespace** — components (`<Button>`,
  `<Foo.Bar>`, `<svelte:*>`) and block elements drop child boundary whitespace
  (`<Button> hi </Button>` → `<Button>hi</Button>`); inline and unknown custom
  elements keep one edge space. The hug/block-break paths keep the inline
  predicate so a component with a wrapping open tag still hugs. (`collapse.rs`)
- **Mustache-sibling splitting + empty-block blank line** — in a broken fragment,
  whitespace between two mustache siblings becomes a newline (except before an
  inline element); an empty control-flow block body keeps one blank line.
  (`indent.rs`)
- **`<script>` / `<style>` open-tag attribute quoting** (`lang='ts'` →
  `lang="ts"`, `context=module` → `context="module"`). (`script.rs`)
- **`<textarea>` interior indentation**, **`style:name` shorthand**,
  **`<svelte:window/>` self-closing when empty**, **`<!-- prettier-ignore -->`**,
  and **`{#await expr}` empty-pending collapse**.

## Remaining 162, by class

- **16 — `tests/migrate/` (out of scope).** Svelte 4 → 5 migrator fixtures
  (Svelte 4 syntax: legacy slots, `<svelte:self>`, etc.). rsvelte is a Svelte 5
  compiler; per `AGENTS.md` the migrator is intentionally out of scope, so these
  are tracked, not fixed.
- **17 — rsvelte's parser correctly rejects the input.** Invalid Svelte 5 that
  prettier-plugin-svelte (a lenient formatter parser) reformats but rsvelte's
  compiler-grade parser rejects by design — e.g. `{@render f.apply(...)}`
  (`render_tag_invalid_call_expression`), snippet rest params, TS generic
  snippet headers rsvelte cannot yet parse. A formatter that refuses invalid
  input is correct behaviour, not a layout bug.
- **~129 — deep prettier HTML-layout quirks.** The hard cluster also noted for
  the svelte.dev formatter corpus: inline-element hug/keep-on-one-line vs break
  (`<label><input … /> text</label>` hug choice), long open-tag wrapping with
  child breaking, `<pre>` whitespace edge cases, nested destructuring-rest in
  `{#each … as […]}` patterns, and a few malformed-tag edges. These need the
  full prettier `fill`/`group` child-layout port and are the natural next
  burn-down target.

## How to burn down

```bash
cargo build --release -p rsvelte_fmt
node scripts/compat-corpus/fmt-cluster.mjs                 # rank remaining clusters
node scripts/compat-corpus/fmt-one.mjs <id>                # live oracle vs rsvelte-fmt diff
# fix in crates/rsvelte_formatter/src, then:
node scripts/compat-corpus/fmt.mjs --actual && node scripts/compat-corpus/fmt-verify.mjs
node scripts/compat-corpus/fmt-verify.mjs --update-baseline   # only after "no regressions"
```

Every fix must keep `fmt-verify` at **0 regressions**; mirror
prettier-plugin-svelte's actual behaviour (probe the oracle first) rather than
special-casing a fixture.
