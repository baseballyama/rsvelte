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

## svelte2tsx parity (same corpus, TSX output)

The same collected sources also drive a **svelte2tsx** output-equality check:
every *component* entry (`kind === 'component'`; `.svelte.(js|ts)` modules are
out of scope — svelte2tsx only converts components) is converted to TSX with
**both** the official `svelte2tsx` (built from the `submodules/language-tools`
gitlink) and rsvelte's port (the `svelte2tsx` NAPI export), and the two must be
byte-identical after oxfmt normalization.

Both sides receive the identical options — `{ filename: <id>, isTsFile, mode:
'ts', namespace: 'html', version: '5' }`, where `isTsFile` is detected from a
`<script lang="ts">` tag so the two tools agree on TS-vs-JSDoc cast style.

**Crucially**, official svelte2tsx parses with whatever `svelte/compiler` it
resolves at runtime, so the build step pins its `svelte` dev-dep to the exact
version `submodules/svelte` provides (the one rsvelte mirrors) — otherwise the
default v4 dev-dependency rejects Svelte-5 syntax (`{@render}`, `{#each …}`
without `as`, `<script module>`) and every Svelte-5 component is spuriously an
error-mismatch. `svelte2tsx-compile.mjs` asserts the resolved svelte major
matches the submodule before running and fails loudly otherwise.

Unlike the compiler check there is **no AST-structural fallback**: svelte2tsx
embeds functional comments — `///<reference>` directives and `/*Ωignore_*Ω*/`
markers the language server relies on — so comment and exact-token parity is
part of the contract. Normalization is just oxfmt + blank-line stripping.

Pipeline stages (mirroring the compiler ones):

1. `svelte2tsx-compile.mjs` — converts every component into
   `compat/corpus/{expected-s2t,actual-s2t}/<id>/index.tsx` (or `error.json`
   on rejection). Worker-sharded; an rsvelte panic is recorded as an error for
   that entry instead of killing the run.
2. `svelte2tsx-verify.mjs` — oxfmt-normalizes both trees, byte-compares, writes
   `report-s2t.json`, and ratchets against
   `compat/corpus/svelte2tsx-known-failures.json` (checked in; may only shrink).
3. `svelte2tsx-cluster.mjs` — groups failures by diff signature for burn-down.

```bash
# build the official svelte2tsx oracle once (after corpus:sync)
(cd submodules/language-tools && pnpm install --frozen-lockfile --ignore-scripts && pnpm --filter svelte2tsx build)

pnpm run corpus:s2t:compile && pnpm run corpus:s2t:verify
node scripts/compat-corpus/svelte2tsx-cluster.mjs            # size the burn-down
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
