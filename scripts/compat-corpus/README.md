# compat-corpus — real-world output-equality pipeline

Verifies that rsvelte's CSR (client) and SSR (server) compile output is
**byte-identical** to the official Svelte compiler's, over every
`.svelte` / `.svelte.js` / `.svelte.ts` source — including code blocks inside
markdown — found in the corpus source repositories.

The corpus is a **single flat set** of source repositories, all git submodules
listed in [`corpus-sources.json`](./corpus-sources.json). There is no separate
"ecosystem" track — svelte's own fixtures, the curated svelte.dev docs, and the
shipped source of real-world component libraries are all compiled and verified
the same way. **To grow the corpus, [add a repository](#adding-a-repository-to-the-corpus).**

| Source | Submodule | Role |
|---|---|---|
| [sveltejs/svelte](https://github.com/sveltejs/svelte) | `submodules/svelte` | svelte's own fixtures + the compiler/version pin rsvelte mirrors |
| [sveltejs/svelte.dev](https://github.com/sveltejs/svelte.dev) | `submodules/svelte.dev` | curated docs (markdown code blocks) |
| [huntabyte/bits-ui](https://github.com/huntabyte/bits-ui) | `submodules/bits-ui` | headless UI library (real-world) |
| [themesberg/flowbite-svelte](https://github.com/themesberg/flowbite-svelte) | `submodules/flowbite-svelte` | UI library (real-world) |
| [melt-ui/next-gen](https://github.com/melt-ui/next-gen) | `submodules/melt-ui` | headless/runes UI library (real-world) |
| [huntabyte/shadcn-svelte](https://github.com/huntabyte/shadcn-svelte) | `submodules/shadcn-svelte` | SvelteKit component app (real-world) |
| [sveltestrap/sveltestrap](https://github.com/sveltestrap/sveltestrap) | `submodules/sveltestrap` | Bootstrap UI library (awesome-svelte) |
| [illright/attractions](https://github.com/illright/attractions) | `submodules/attractions` | UI kit (awesome-svelte) |
| [techniq/svelte-ux](https://github.com/techniq/svelte-ux) | `submodules/svelte-ux` | UI component library (awesome-svelte) |
| [matyunya/smelte](https://github.com/matyunya/smelte) | `submodules/smelte` | Material UI library (awesome-svelte) |
| [svar-widgets/core](https://github.com/svar-widgets/core) | `submodules/svar-core` | SVAR widgets core (awesome-svelte) |
| [dasDaniel/svelte-table](https://github.com/dasDaniel/svelte-table) | `submodules/svelte-table` | Data table (awesome-svelte) |
| [muonw/powertable](https://github.com/muonw/powertable) | `submodules/powertable` | Data table (awesome-svelte) |
| [jjagielka/svelte-pivottable](https://github.com/jjagielka/svelte-pivottable) | `submodules/svelte-pivottable` | Pivot table (awesome-svelte) |
| [zerodevx/svelte-toast](https://github.com/zerodevx/svelte-toast) | `submodules/svelte-toast` | Toast notifications (awesome-svelte) |
| [wobsoriano/svelte-sonner](https://github.com/wobsoriano/svelte-sonner) | `submodules/svelte-sonner` | Toast notifications (awesome-svelte) |
| [beyonk-adventures/svelte-notifications](https://github.com/beyonk-adventures/svelte-notifications) | `submodules/svelte-notifications` | Notifications (awesome-svelte) |
| [Cweili/svelte-fa](https://github.com/Cweili/svelte-fa) | `submodules/svelte-fa` | FontAwesome icons (awesome-svelte) |
| [krowten/svelte-heroicons](https://github.com/krowten/svelte-heroicons) | `submodules/svelte-heroicons` | Heroicons (awesome-svelte) |
| [6eDesign/svelte-calendar](https://github.com/6eDesign/svelte-calendar) | `submodules/svelte-calendar` | Calendar (awesome-svelte) |
| [probablykasper/date-picker-svelte](https://github.com/probablykasper/date-picker-svelte) | `submodules/date-picker-svelte` | Date picker (awesome-svelte) |
| [dimfeld/svelte-maplibre](https://github.com/dimfeld/svelte-maplibre) | `submodules/svelte-maplibre` | MapLibre bindings (awesome-svelte) |
| [mhkeller/layercake](https://github.com/mhkeller/layercake) | `submodules/layercake` | Charting framework (awesome-svelte) |
| [techniq/layerchart](https://github.com/techniq/layerchart) | `submodules/layerchart` | Charting library (awesome-svelte) |
| [orefalo/svelte-splitpanes](https://github.com/orefalo/svelte-splitpanes) | `submodules/svelte-splitpanes` | Split panes (awesome-svelte) |
| [efstajas/svelte-stepper](https://github.com/efstajas/svelte-stepper) | `submodules/svelte-stepper` | Stepper (awesome-svelte) |
| [arabdevelop/svelte-formly](https://github.com/arabdevelop/svelte-formly) | `submodules/svelte-formly` | Form builder (awesome-svelte) |
| [pragmatic-engineering/svelte-form-builder-community](https://github.com/pragmatic-engineering/svelte-form-builder-community) | `submodules/svelte-form-builder` | Form builder (awesome-svelte) |
| [HosseinShabani/svelte-checkbox](https://github.com/HosseinShabani/svelte-checkbox) | `submodules/svelte-checkbox` | Checkbox (awesome-svelte) |
| [beyonk-adventures/svelte-toggle](https://github.com/beyonk-adventures/svelte-toggle) | `submodules/svelte-toggle` | Toggle (awesome-svelte) |
| [vatro/svelthree](https://github.com/vatro/svelthree) | `submodules/svelthree` | Three.js components (awesome-svelte) |
| [CriticalMoments/CMSaasStarter](https://github.com/CriticalMoments/CMSaasStarter) | `submodules/cmsaasstarter` | SvelteKit SaaS starter (awesome-svelte) |

Every source is **pinned by its submodule gitlink** and bumped by
`auto-update-submodules.yml` (weekly PR per submodule; svelte itself goes through
`auto-update-svelte.yml`). For the real-world projects only their **shipped**
`.svelte` / `.svelte.(js|ts)` files are collected — their markdown docs are
skipped (they carry non-Svelte doc tooling and truncated pseudo-code the official
compiler itself rejects, which is noise, not a compatibility gap). Each source is
collected under its `id` prefix (`bits-ui/…`, `svelte.dev/…`, …).

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
pnpm run corpus:sync        # init/update every corpus source submodule

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

- `.github/workflows/corpus-compat.yml` — runs the `corpus` (compiler +
  svelte2tsx), `fmt-parity`, and `lint-parity` jobs on PRs/pushes touching the
  compiler, the pipeline, the oracle config, or any source submodule. Every
  source submodule (svelte, svelte.dev, and the real-world projects) is
  shallow-initialised, so the whole unified corpus runs on each PR. Expected
  outputs are regenerated from the pinned submodules on every run, so bumping a
  pin automatically refreshes the corpus *and* its expectations; the fmt oracle
  is cached by a combined hash of all source SHAs + oxfmt + config.
- Source bumps arrive via `auto-update-submodules.yml` (weekly PR per submodule —
  svelte.dev and each real-world project) and `auto-update-svelte.yml` (the
  compiler). Both trigger corpus-compat through its submodule path filters, which
  is how upstream projects are tracked over time. A real-world project bump can
  introduce new divergences, so its PR may be red until the corpus baselines are
  re-triaged (`--update-baseline`).

There is no separate scheduled "ecosystem" workflow — the corpus *is* the
ecosystem coverage, and the weekly submodule bumps are what keep it current.

## Lint parity (eslint-plugin-svelte)

A third track verifies that the native `rsvelte-lint` produces the **same
findings** as the real `eslint-plugin-svelte`, over every `.svelte` source in
the two lint-relevant upstream repos:

| Source | Pin |
|---|---|
| [sveltejs/eslint-plugin-svelte](https://github.com/sveltejs/eslint-plugin-svelte) | `submodules/eslint-plugin-svelte` gitlink |
| [sveltejs/svelte-eslint-parser](https://github.com/sveltejs/svelte-eslint-parser) | `submodules/svelte-eslint-parser` gitlink |

Both repos' rule fixtures, parser fixtures, docs snippets and demo components
exercise exactly the surface the linter must match. (The fixture-level oracle
in `crates/rsvelte_lint/tests/eslint_plugin_oracle.rs` asserts *exact* parity
against each fixture's expected `*-errors.yaml`; this corpus track is the
*real-world* complement — every source linted by both engines, diffed.)

### How it works

```bash
pnpm run lint-corpus:sync             # init eslint-plugin-svelte + svelte-eslint-parser submodules
pnpm run lint-corpus:oracle-install   # install the pinned real eslint-plugin-svelte (oracle)
cargo build --release --bin rsvelte-lint
pnpm run lint-corpus:collect          # gather .svelte sources -> compat/lint-corpus/sources/
pnpm run lint-corpus:verify           # diff oracle vs rsvelte-lint, ratchet known-failures.json
# or, all of the above:
pnpm run lint-corpus                   # sync + install + collect + verify
pnpm run lint-corpus:update            # re-baseline known-failures.json after a fix
```

- **Oracle** (`lint-oracle/`) — an isolated package pinning the same
  `eslint-plugin-svelte` version as the submodule. `run.mjs` lints each source
  with the real plugin (svelte parser + TS sub-parser) and emits normalized
  JSON findings. This is the ground truth — what users actually run.
- **Rule universe** — only the rules **both** engines implement are compared
  (`rsvelte --list-rules` ∩ plugin rules), at `"warn"`, with each rule's plugin
  default options. A small `EXCLUDE` set (in `lint-verify.mjs`) drops rules that
  can't be finding-compared on this corpus: type-aware rules (need tsgo),
  option-required rules, Svelte-3/4-only rules (the corpus declares Svelte 5),
  the `valid-compile` / `valid-style-parse` compiler/CSS meta-rules (governed by
  the compiler's own 100%-passing test suites), and `indent` (a stylistic rule
  only partially ported; ~84% of the raw divergence count).
- **SvelteKit / Svelte version detection** — `lint-collect.mjs` writes a
  synthetic `package.json` (`@sveltejs/kit ^2`, `svelte ^5`) at the corpus root
  so the oracle's version detection treats every source as a Svelte 5 +
  SvelteKit 2 project — matching `rsvelte-lint`, which fires the
  SvelteKit-conditional rules unconditionally.
- **Ratchet** — every finding present on exactly one side is a *divergence*,
  recorded in `compat/lint-corpus/known-failures.json` (tracked). The set may
  only **shrink**: a NEW divergence fails CI; fixed ones are pruned with
  `--update`. See [docs/lint-corpus-remaining-work.md](../../docs/lint-corpus-remaining-work.md)
  for the burn-down playbook and the root-cause clusters.

The `lint-parity` job in `.github/workflows/corpus-compat.yml` runs this track
on PRs/pushes touching the linter, the pipeline, or either pin.

## Adding a repository to the corpus

The corpus grows by adding source repositories. Real-world component libraries
(bits-ui, flowbite-svelte, …) sit in the **same** corpus as svelte/svelte.dev and
ratchet against the **same** baselines — there is no separate track to wire up.
Adding one surfaces divergences that only appear on production code (namespaced
components, `$props.id()`, `{@const}`-in-snippet, long `{@render}` wrapping, …).

To add a repository:

1. **Add it as a submodule** (pins it; bumped weekly by `auto-update-submodules.yml`):

   ```bash
   git submodule add -b main --depth 1 https://github.com/owner/repo submodules/repo
   ```

   Mirror the existing block in `.gitmodules` (`ignore = dirty`, `shallow = true`,
   `branch = …`).

2. **List it in [`corpus-sources.json`](./corpus-sources.json)** — one entry:

   ```json
   { "path": "submodules/repo", "id": "repo", "markdown": false }
   ```

   `markdown: true` only for repos whose docs are curated to compile (svelte,
   svelte.dev); real-world projects use `false` so only their shipped
   `.svelte` / `.svelte.(js|ts)` files are collected (project doc markdown carries
   non-Svelte tooling and pseudo-code the official compiler rejects — noise).

3. **Wire it into CI** — add `submodules/repo` to the submodule-init steps and the
   push/PR path filters in `.github/workflows/corpus-compat.yml`, and add a matrix
   entry in `.github/workflows/auto-update-submodules.yml`.

4. **Generate the baselines** — run the corpus and ratchet in the new divergences:

   ```bash
   pnpm run corpus:sync && pnpm run corpus:collect
   pnpm run corpus:compile && node scripts/compat-corpus/verify.mjs --update-baseline
   pnpm run corpus:s2t:compile && node scripts/compat-corpus/svelte2tsx-verify.mjs --update-baseline
   pnpm run corpus:fmt && node scripts/compat-corpus/fmt-verify.mjs --update-baseline
   ```

   The new entries appear under the `repo/…` id prefix in the unified
   `known-failures.json` / `svelte2tsx-known-failures.json` /
   `fmt-known-failures.json`. Like every ratchet they may only **shrink** — a new
   divergence on a later run fails CI. Regenerate baselines on Linux (CI is the
   source of truth — see the formatter-parity environment note above).

The corpus only ever **reads** source files — it never installs deps or runs a
project's build, so a shallow submodule is all that is needed.
