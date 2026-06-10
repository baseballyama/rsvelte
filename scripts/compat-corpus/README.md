# compat-corpus — real-world output-equality pipeline

Verifies that rsvelte's CSR (client) and SSR (server) compile output is
**byte-identical** to the official Svelte compiler's, over every
`.svelte` / `.svelte.js` / `.svelte.ts` source — including code blocks inside
markdown — found in two upstream repositories:

| Source | Pin |
|---|---|
| [sveltejs/svelte](https://github.com/sveltejs/svelte) | `submodules/svelte` gitlink (same compiler version rsvelte mirrors) |
| [sveltejs/svelte.dev](https://github.com/sveltejs/svelte.dev) | `compat/corpus/sources.json` |

Both compilers run with identical default options (`dev: false`,
`css: 'external'`). Outputs are normalized to absorb formatting-only
differences; anything that survives normalization is a real divergence and
fails verification. Files the official compiler rejects are *error-parity*
cases: rsvelte must reject them too (same error code).

Normalization is two layers, both in the comparison side — the compiler
itself never spends cycles on cosmetic output massaging (rsvelte targets
100x compile performance):

1. **oxfmt** (`compat/corpus/.oxfmtrc.json`, `objectWrap: collapse`) —
   canonicalizes quotes, wrapping, indentation.
2. **blank-line stripping** (`normalize.mjs`) — the official compiler
   prints through esrap, which re-derives blank lines from its own layout
   rules, while rsvelte preserves source blank lines; oxfmt deliberately
   keeps single blank lines, so this class of diff is removed here.
   Blank lines inside template literals and block comments are real
   content and are preserved.

## Usage

```bash
# one-time / after pin changes
pnpm run corpus:sync        # checkout svelte.dev at the pinned SHA (.corpus-cache/)

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
- `.github/workflows/auto-update-corpus.yml` — weekly PR advancing the
  svelte.dev pin. (The svelte side is covered by `auto-update-svelte.yml`,
  which bumps the submodule gitlink.)
