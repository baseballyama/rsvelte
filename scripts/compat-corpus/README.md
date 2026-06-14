# compat-corpus — real-world output-equality pipeline

Verifies that rsvelte's CSR (client) and SSR (server) compile output is
**byte-identical** to the official Svelte compiler's, over every
`.svelte` / `.svelte.js` / `.svelte.ts` source — including code blocks inside
markdown — found in two upstream repositories:

| Source | Pin |
|---|---|
| [sveltejs/svelte](https://github.com/sveltejs/svelte) | `submodules/svelte` gitlink (same compiler version rsvelte mirrors) |
| [sveltejs/svelte.dev](https://github.com/sveltejs/svelte.dev) | `submodules/svelte.dev` gitlink (auto-bumped by `auto-update-submodules.yml`) |

Both compilers run with identical default options (`dev: false`,
`css: 'external'`). `.svelte.ts` modules are TS-stripped with esbuild
before compilation, mirroring the production pipeline (Vite runs esbuild
before vite-plugin-svelte's `compileModule`, which only parses plain JS). Outputs are normalized to absorb formatting-only
differences; anything that survives normalization is a real divergence and
fails verification. Files the official compiler rejects are *error-parity*
cases: rsvelte must reject them too (same error code).

Normalization is four layers, all in the comparison side — the compiler
itself never spends cycles on cosmetic output massaging (rsvelte targets
100x compile performance):

0. **AST structural equivalence** (`normalize.astEquivalent`, the fallback) —
   when the byte compare below still differs, both outputs are parsed with
   **acorn** (a real parser, never regex) and compared with
   `start`/`end`/`loc`/`range` dropped. Comments aren't attached to the AST,
   and line-wrapping (incl. inside template-literal `${}`) and redundant parens
   aren't represented, so esrap's positional-comment and wrapping cosmetics are
   absorbed. String-literal `raw` is dropped (quote style absorbed; numeric raw
   kept), and output acorn can't parse falls back to the byte compare — so
   genuinely different code always fails.

1. **template-hole flattening** (`normalize.mjs`, applied BEFORE oxfmt) —
   esrap wraps long expressions inside `` `${}` `` template-literal holes
   across lines; oxfmt preserves the multiline-ness of holes from its
   input, so it cannot absorb this on its own. Newlines inside holes are
   collapsed to a single space (static template text, nested template
   literals, and comments are untouched), after which oxfmt converges
   both sides to the identical single-line form.
2. **oxfmt** (`compat/corpus/.oxfmtrc.json`, `objectWrap: collapse`) —
   canonicalizes quotes, wrapping, indentation.
3. **blank-line stripping** (`normalize.mjs`) — the official compiler
   prints through esrap, which re-derives blank lines from its own layout
   rules, while rsvelte preserves source blank lines; oxfmt deliberately
   keeps single blank lines, so this class of diff is removed here.
   Blank lines inside template literals and block comments are real
   content and are preserved.

## Usage

```bash
# one-time / after pin changes
pnpm run corpus:sync        # init/update the svelte + svelte.dev submodules

# build + stage the rsvelte NAPI binding
cargo build --release --features napi --lib
cp target/release/librsvelte_core.dylib .corpus-cache/rsvelte.node   # .so on Linux

pnpm run corpus             # sync + collect + compile + verify
```

Pipeline stages (all idempotent, everything under `compat/corpus/` except
`sources.json` and `.oxfmtrc.json` is generated and gitignored):

1. `collect.mjs` — gathers sources into `compat/corpus/sources/` + `manifest.json`
2. `compile.mjs` — dual-compiles every entry for client + server into
   `compat/corpus/{expected,actual}/<id>/{client.js,server.js,client.css,error.json}`.
   Sharded across worker processes; a Rust panic is recorded as a `rust_panic`
   error for that entry instead of killing the run.
3. `verify.mjs` — oxfmt-normalizes both trees, byte-compares, writes `report.json`,
   exits non-zero on any mismatch.

Debugging helpers:

```bash
node scripts/compat-corpus/one.mjs <corpus-id>      # diff one entry (post-oxfmt; --raw for raw)
node scripts/compat-corpus/cluster.mjs              # group failures by diff signature
node scripts/compat-corpus/cluster.mjs --show 'JS client: E:…'   # list ids in a cluster
```

## Formatter parity (`fmt.mjs` / `fmt-verify.mjs`)

A second, independent track verifies that **rsvelte-fmt** formats every
`.svelte` component in the corpus byte-for-byte like the
**oxfmt(`svelte: true`)** oracle — `prettier-plugin-svelte` for the Svelte
structure plus the oxc engine for embedded JS/CSS, which is exactly
rsvelte-fmt's own layering, so a surviving diff isolates rsvelte's
Svelte-structure formatting (the JS/CSS layer is identical on both sides by
construction). Unlike the compile track this is a **hard byte gate** — a
formatter must match exactly, so there is no AST-equivalence fallback.

```bash
cargo build --release -p rsvelte_fmt           # the binary fmt.mjs drives
pnpm run corpus:fmt-parity                      # collect + fmt + fmt-verify
```

Stages:

1. `fmt.mjs` — builds two trees over the manifest's `component` entries:
   - `compat/corpus/fmt/oracle/<id>` — oxfmt(`svelte: true`). Depends only on
     the pins + oxfmt version + oracle config, so it is **cached** (`fmt/meta.json`)
     and skipped on re-runs unless those change or `--force` is passed. Entries
     oxfmt rejects (or whose embedded code it can't parse) are excluded — they
     aren't valid, formattable Svelte.
   - `compat/corpus/fmt/actual/<id>` — rsvelte-fmt (`--stdin`, column-aware
     `<style>` narrowing). Rebuilt every iteration; restrict to a subset with
     `--actual --only <ids-file>` for tight burn-down.
2. `fmt-verify.mjs` — byte-compares, writes `fmt-report.json`, ratchets against
   `compat/corpus/fmt-known-failures.json` (checked in; may only shrink). Exits
   non-zero only on a **regression** (a divergence not in the baseline).

Burn-down helpers:

```bash
node scripts/compat-corpus/fmt-one.mjs <corpus-id>          # live oracle vs rsvelte-fmt diff
node scripts/compat-corpus/fmt-cluster.mjs                  # group failures by diff signature
node scripts/compat-corpus/fmt-cluster.mjs --show '<sig>'   # list ids in a cluster
node scripts/compat-corpus/fmt-verify.mjs --update-baseline # shrink the ratchet after a fix
```

> **Baseline / environment note.** `oxfmt` (the oracle) decides which entries are
> formattable, and that decision can differ slightly across platforms — Linux CI
> currently *includes* ~13 loose-declaration-tag entries (`{const …}` / `{let …}`)
> that macOS `oxfmt` skips. The CI Linux environment is the source of truth, so the
> committed `fmt-known-failures.json` is the **CI** failure set. Do **not**
> `--update-baseline` from a macOS run and commit it — that would drop the
> CI-only entries and break the `fmt-parity` job. To shrink the ratchet after a
> fix, run `--update-baseline` and then re-add any CI-only ids (download the
> `corpus-fmt-report` artifact from the CI run), or update the baseline from a CI
> run.

## CI / automation

- `.github/workflows/corpus-compat.yml` — runs both tracks (`corpus` and
  `fmt-parity` jobs) on PRs/pushes touching the compiler, the pipeline, the
  oracle config, or either pin. Expected outputs are regenerated from the pinned
  upstreams on every run, so bumping a pin automatically refreshes the corpus
  *and* its expectations; the fmt oracle is cached by pin + oxfmt + config.
- svelte.dev bumps arrive via the existing `auto-update-submodules.yml`
  weekly PR (shared with the fmt parity corpus); the svelte side via
  `auto-update-svelte.yml`. Both trigger corpus-compat through its
  submodule path filters.
