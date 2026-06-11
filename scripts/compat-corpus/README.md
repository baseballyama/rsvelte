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

## CI / automation

- `.github/workflows/corpus-compat.yml` — runs the pipeline on PRs/pushes
  touching the compiler, the pipeline, or either pin. Expected outputs are
  regenerated from the pinned upstreams on every run, so bumping a pin
  automatically refreshes the corpus *and* its expectations.
- svelte.dev bumps arrive via the existing `auto-update-submodules.yml`
  weekly PR (shared with the fmt parity corpus); the svelte side via
  `auto-update-svelte.yml`. Both trigger corpus-compat through its
  submodule path filters.
