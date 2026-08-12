# compat-corpus — real-world output-equality pipeline

Verifies that rsvelte's CSR (client), SSR (server), dev-mode CSR
(client-dev), and dev-mode SSR (server-dev) compile output is
**byte-identical** to the official Svelte compiler's, over every
`.svelte` / `.svelte.js` / `.svelte.ts` source — including code blocks inside
markdown — found in the corpus source repositories.

The corpus is a **single flat set** of source repositories, all git submodules
listed in [`corpus-sources.json`](./corpus-sources.json). There is no separate
"ecosystem" track — svelte's own fixtures, the curated svelte.dev docs, and the
shipped source of real-world component libraries are all compiled and verified
the same way. **To grow the corpus, [add a repository](#adding-a-repository-to-the-corpus).**

The rationale for each baseline / exclusion entry (why a known failure is
accepted, why an id is excluded) lives in a same-named `.md` beside each JSON
in [`compatibility/`](../../compatibility/).

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
| [svecosystem/runed](https://github.com/svecosystem/runed) | `submodules/runed` | Rune utilities — almost pure `.svelte.(js|ts)` |
| [huntabyte/svelte-toolbelt](https://github.com/huntabyte/svelte-toolbelt) | `submodules/svelte-toolbelt` | Rune/DOM utilities — almost pure `.svelte.(js|ts)` |
| [CriticalMoments/CMSaasStarter](https://github.com/CriticalMoments/CMSaasStarter) | `submodules/cmsaasstarter` | SvelteKit SaaS starter (awesome-svelte) |
| [skeletonlabs/skeleton](https://github.com/skeletonlabs/skeleton) | `submodules/skeleton` | UI library + docs/playground monorepo (also the svelte-check e2e gate) |
| — (in-repo) | `compatibility/pattern-corpus` | hand-written patterns: one minimal repro per fixed divergence + the feature matrices around them ([README](../../compatibility/pattern-corpus/README.md)) |

Every source but the last is **pinned by its submodule gitlink** and bumped by
`auto-update-submodules.yml` (weekly PR per submodule; svelte itself goes through
`auto-update-svelte.yml`). `skeleton` is the one exception: it also feeds the
line-number-keyed svelte-check e2e ratchet, so it is deliberately excluded from
the weekly bump (see `compatibility/check-e2e-known-failures.md`). For the
real-world projects only their **shipped**
`.svelte` / `.svelte.(js|ts)` files are collected — their markdown docs are
skipped (they carry non-Svelte doc tooling and truncated pseudo-code the official
compiler itself rejects, which is noise, not a compatibility gap). Each source is
collected under its `id` prefix (`bits-ui/…`, `svelte.dev/…`, …).

`compatibility/pattern-corpus` (`pattern/…`) is the one source that is **not** an
upstream pin: the pinned repositories only cover shapes somebody happened to
write, so a divergence in a shape none of them uses is invisible however many
repositories are added. That source is where such a shape is written down —
see [Adding a pattern file](#adding-a-pattern-file).

Both compilers run with identical default options (`dev: false`,
`css: 'external'`). `.svelte.ts` modules are TS-stripped before compilation,
mirroring the production pipeline: a bundler strips the types *before*
vite-plugin-svelte's `compileModule` sees the module, because `compileModule`
itself only parses plain JS and rejects raw TS with a parse error (unlike
`compile`, which strips `<script lang="ts">` via `remove_typescript_nodes`).
The bundler's stripper differs by version — Vite ≤7 uses esbuild, while **Vite 8
strips with oxc (rolldown); esbuild there is an optional peer and any esbuild
options are converted to oxc config**. The corpus strips with **esbuild** as the
representative stripper (it is the installed, synchronous, zero-extra-dep choice
and matches Vite ≤7). The exact stripper feeds the *same* source to both
compilers, so every verdict still reflects a genuine official-vs-rsvelte
difference — but note that switching strippers is not output-neutral: different
strippers emit different (yet semantically equal) code shapes, so they exercise
different compiler paths and surface a different subset of divergences. Outputs
are normalized to absorb formatting-only differences; anything that survives
normalization is a real divergence and fails verification. Files the official
compiler rejects are *error-parity* cases: rsvelte must reject them too (same
error code).

Normalization is four layers, all in the comparison side — the compiler
itself never spends cycles on cosmetic output massaging (rsvelte targets
100x compile performance):

0. **AST equivalence** (`crates/rsvelte_ast_equiv`, via the batched
   `ast_equiv_batch` binary) — when the byte compare below still differs, both
   outputs are parsed with **OXC** (a real parser, never regex) and printed with
   one fixed set of codegen options. Formatting collapses (whitespace, quotes,
   optional parens and semicolons, literal spelling, line wrapping including
   inside template-literal `${}`); everything else is a difference. Output that
   does not parse is its own verdict — `js-unparseable`, never demoted to a text
   diff. This is the same comparator the fixture suites and the devtools use, so
   "equivalent" means one thing repo-wide; see
   [compatibility/ast-equivalence.md](../../compatibility/ast-equivalence.md).

1. **template-hole flattening** (`normalize.mjs`, applied BEFORE oxfmt) —
   esrap wraps long expressions inside `` `${}` `` template-literal holes
   across lines; oxfmt preserves the multiline-ness of holes from its
   input, so it cannot absorb this on its own. Newlines inside holes are
   collapsed to a single space (static template text, nested template
   literals, and comments are untouched), after which oxfmt converges
   both sides to the identical single-line form.
2. **oxfmt** (`compatibility/.oxfmtrc.json`, `objectWrap: collapse`) —
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

# the oracle needs its OWN dependencies — the repo-root install does not cover
# the submodule, and without them every worker dies before it compares anything
(cd submodules/svelte && pnpm install --frozen-lockfile)

# build + stage the rsvelte NAPI binding
cargo build --release -p rsvelte_napi --lib
node scripts/compat-corpus/binding.mjs --stage
# This reads the commit embedded in the addon and refuses a target artifact that
# was built from a different checkout before writing its provenance sidecar.

pnpm run corpus             # sync + collect + compile + verify
```

Pipeline stages (all idempotent, everything under `compatibility/` except
`sources.json` and `.oxfmtrc.json` is generated and gitignored):

1. `collect.mjs` — gathers sources into `compatibility/sources/` + `manifest.json`
2. `compile.mjs` — compiles every entry for all three targets into
   `compatibility/{expected,actual}/<id>/{client.js,server.js,client-dev.js,client.css,client-dev.css,error.json}`.
   Sharded across worker processes; a Rust panic is recorded as a `rust_panic`
   error for that entry instead of killing the run.
3. `verify.mjs` — oxfmt-normalizes both trees, byte-compares, writes `report.json`,
   and ratchets each target independently against
   `compatibility/known-failures.client.json` (CSR),
   `compatibility/known-failures.server.json` (SSR) and
   `compatibility/known-failures.client-dev.json` (CSR with `dev: true`) — all
   checked in, all may only shrink. Exits non-zero on a **regression** (a
   `(id, target)` pair that diverges but is absent from that target's baseline)
   **and on a stale ratchet** (a baseline entry that already passes) — a PR that
   fixes entries must re-baseline in the same PR, so a later PR never absorbs a
   backlog of "now PASS" entries that a real regression could hide inside.
   `--update-baseline` rewrites every baseline from the current run;
   `--update-baseline <target>` rewrites only that target's file. Every sibling
   ratchet below (fmt, svelte2tsx + its map, lint, check, check-e2e, and the
   Rust `sourcemaps_gate`) enforces the same two-sided rule.

`verify.mjs` also gates compiler **warnings**, on separate ratchets that no
output flag can touch. `compile.mjs` records each warning as `(code, line,
column)` in `warnings.json`; `verify.mjs` compares them in two independent
dimensions:

| Verdict | Meaning | Ratchet |
|---|---|---|
| `warning-code-mismatch` | the multiset of warning codes differs — rsvelte warns where upstream does not, or is silent where it warns | `warning-known-failures.<target>.json` |
| `warning-position-mismatch` | codes agree, a `(line, column)` does not — usually rsvelte attaching no span at that emission site | `warning-position-known-failures.<target>.json` |

It gates compiler **errors** the same way. The output verdict above sees only
whether both sides rejected an entry with the same `code` — which is saturated
at **0 divergences over 2,843 both-reject pairs**, so no amount of corpus growth
could move it. `compile.mjs` therefore also records each error's first message
line, its `start` and `end` `(line, column)` and its rendered `frame`, compared
here for every pair both sides reject with the same code:

| Verdict | Meaning | Ratchet |
|---|---|---|
| `error-message-mismatch` | codes agree, the prose does not — 121 entries | `error-message-known-failures.<target>.json` |
| `error-position-mismatch` | codes agree, `start` does not — 226 entries, 174 of them rsvelte reporting no span at all | `error-position-known-failures.<target>.json` |
| `error-end-mismatch` | codes agree, `end` does not, so the highlight has the wrong length — 243 entries, 17 of which `start` agrees on | `error-end-known-failures.<target>.json` |
| `error-frame-mismatch` | both endpoints agree, the rendered frame does not — 0 entries over a population of 2,114 pairs | `error-frame-known-failures.<target>.json` |

`end` is ratcheted apart from `start` because an entry listed for one suppresses
everything about that entry, and 17 ids diverge on `end` while `start` agrees.
`frame` is the one comparison that *is* chained — upstream derives it from
`start.line` and `end.column`, so comparing it where an endpoint already diverges
would restate that divergence rather than ask a new question; chained, it sees
only the renderer.

All four score `match` when there is nothing to compare, so `verify.mjs` prints
the compared-pair count beside the verdicts, records it in `report.json` as
`errorComparedPairs`, and refuses `--update-error-baseline` at zero. The
precondition that the trees are complete is checked **per tree and per target**
for the same reason: a wiped `expected/` beside an intact `actual/` passes a
union check and then scores 100% parity having compared nothing.

Finally it gates whether the output **is JavaScript at all**. Every comparison
above is rsvelte's text against official's text, so "wrong text" and "text no
parser accepts" produce the same row and the same ratchet entry — and a ratchet
entry suppresses everything about its entry. This one asks a question with no
reference to official's bytes:

| Verdict | Meaning | Ratchet |
|---|---|---|
| `output-unparseable` | the module rsvelte emitted does not parse | `parse-known-failures.<target>.json` |

Three things separate it from the output verdict above. Its oracle is **acorn**,
not the OXC parser rsvelte itself uses (and that `ast_equiv_batch` re-uses), so an
OXC-only acceptance quirk is observable. It runs **before** normalization, so the
claim is about what the compiler emitted rather than what survived oxfmt. And its
population is **every entry rsvelte compiled**, including the ones official
rejected, where there is nothing to diff and the byte comparison never looks at
rsvelte's text. Official's output is parsed too, purely as the oracle's control: a
rejection there exits `2` and is never ratcheted — either acorn is too strict, or
official really does emit that, in which case the `(id, target)` pair goes on
`parse-oracle-excluded.json` (shrink-only both ways) and is skipped on **both**
sides, because where the reference does not parse there is nothing to hold
rsvelte to. The gate also refuses to run if rsvelte produced fewer than 90% as
many modules as official did, so it cannot go green by the compiler refusing to
compile. See
[compatibility/parse-known-failures.md](../../compatibility/parse-known-failures.md)
for the oracle's calibration figures and why the baseline is 0.

Warning, error and parseability comparison need no normalization, so they are
meaningful under `--no-fmt`; `--update-warning-baseline` / `--update-error-baseline`
/ `--update-parse-baseline` rewrite only their own ratchets, so a `--no-fmt` run
(which inflates JS failures) can seed them safely. The four update flags
**compose**: passing all of them rewrites all four families in one run, each run
announces which families it will write, and a rewrite run that reaches no write
exits `2` instead of reporting success
(`scripts/dev/test-corpus-verify-baseline-flags.mjs` and
`scripts/dev/test-corpus-parse-gate.mjs` guard this).
`--from-report` derives output failures only, so it rejects the diagnostic flags
rather than ignoring them. See
[compatibility/warning-known-failures.md](../../compatibility/warning-known-failures.md)
— including why the warning gate did not exist until #2281, and the corpus entry
that proved it was needed — and
[compatibility/error-known-failures.md](../../compatibility/error-known-failures.md).

The compared targets (their `generate` / `dev` options, whether CSS is compared,
and which baseline file they ratchet against) are declared once in
`targets.mjs`; `compile.mjs` / `verify.mjs` / `one.mjs` / `cluster.mjs` all
iterate that list, so adding a target is a one-line change plus its baseline.

| Target | `generate` | `dev` | CSS compared | Baseline |
|---|---|---|---|---|
| `client` | `client` | `false` | yes | `known-failures.client.json` |
| `server` | `server` | `false` | no | `known-failures.server.json` |
| `client-dev` | `client` | `true` | yes | `known-failures.client-dev.json` |
| `server-dev` | `server` | `true` | no | `known-failures.server-dev.json` |

`dev` is not a cosmetic flag: it gates 18 client codegen files and the CSS
transform (empty rules survive pruning in dev), so `client-dev` compares CSS
too. `server-dev` has no CSS output, but SSR dev lowering is separately compared.
A `dev`-only divergence is invisible to the two `dev: false` targets —
which is why #1981 stayed undetected across 524 corpus files.

`compile.mjs --targets <keys>` / `verify.mjs --targets <keys>` (comma-separated)
narrow a run to a subset of targets while iterating locally — e.g.
`pnpm run corpus:compile:dev && pnpm run corpus:verify:dev`. An unfiltered
`compile.mjs` always wipes `expected/` + `actual/` first, so a target-scoped
compile leaves ONLY those targets on disk; re-run the unscoped compile before an
unscoped verify.

`verify.mjs --from-report <path>` skips normalization and comparison and derives
the baselines from an existing `report.json` — e.g. one downloaded from a CI
run, so a new target's baseline can be bootstrapped without a local full run.
The failing `corpus` job also uploads `compatibility/cluster.txt` (the
`cluster.mjs` grouping, computed on the runner because the `expected/` /
`actual/` trees it reads are not uploaded), which is what turns that report into
per-cluster justifications.

Debugging helpers:

```bash
node scripts/compat-corpus/one.mjs <corpus-id>      # diff one entry (post-oxfmt; --raw for raw)
node scripts/compat-corpus/cluster.mjs              # group failures by diff signature
node scripts/compat-corpus/cluster.mjs --show 'JS client: E:…'   # list ids in a cluster
```

### Disk: who deletes the artifacts

A full run writes ~0.57 GiB of regenerable trees per checkout — measured with
`du -sk` on a 3-target run: `sources/` 60 MiB, `expected/` 254 MiB, `actual/`
254 MiB (the apparent bytes are ~40% lower; ~42k tiny files plus 21k directories
round up to 4 KiB blocks). N parallel agent worktrees each hold their own set,
which is how the machine runs out of disk. The rules, all implemented in
`artifacts.mjs`:

- **`verify.mjs` deletes `expected/` + `actual/` after a passing run.** Nothing
  downstream reads them (`svelte2tsx-compile.mjs` and `fmt.mjs` read `sources/`,
  which is kept), so the producer cleans up instead of the operator remembering.
  `svelte2tsx-verify.mjs` does the same for `expected-s2t/` + `actual-s2t/`.
- **A failing run keeps them** — that is when someone diffs `expected/<id>`
  against `actual/<id>` to attribute a cluster. `--keep-artifacts` (or
  `CORPUS_KEEP_ARTIFACTS=1`) keeps them unconditionally, `--clean-artifacts`
  deletes even after a failure.
- **CI keeps them unconditionally** (`CI` is set): the `Cluster failures` step
  reads both trees and runs on *any* earlier step's failure, not only verify's.
- **`compile.mjs` refuses to start** when free disk is below
  `180 MiB × targets + 512 MiB`. ENOSPC halfway through leaves a half-written
  tree, and a half-written tree scores as `match` for every entry it never
  reached.
- **`pnpm run corpus:clean`** reclaims every regenerable artifact in this
  checkout *and* in every `.claude/worktrees/*` sibling (`--here` for this
  checkout only, `--dry-run` to preview, `--all` to also drop the slower-to-
  rebuild fmt/lint/check stages). It works from an explicit allowlist, so the
  checked-in `*known-failures*.json` ratchets and their `.md` files are never
  touched — those are not regenerable from the corpus.

### Guards against a vacuously green run

Deleting the trees makes one pre-existing hazard sharper: `verify.mjs` reads a
missing output as `""` on both sides, so a verify against an absent tree scores
every entry `match` — and `--update-baseline` *deletes* every baseline id it did
not observe failing, silently emptying the ratchets. Two assertions close it:

- `verify.mjs` requires ≥99% of manifest entries to have compiled output on at
  least one side before it compares anything (the union, because a crashed
  worker leaves only the rsvelte-side `error.json`). A cleaned or partial tree
  aborts with exit 2 instead of passing.
- `--update-baseline` (and `--from-report`) refuse to rewrite a ratchet from
  fewer than 12000 corpus entries — the corpus is 14025 with every submodule
  present, so anything far below that is a partial checkout, not a fix.
  `svelte2tsx-verify.mjs --update-baseline` enforces the same floor.

### What this corpus does not gate: comments

**Comment parity is not gated by this corpus, for any entry or any target.**
Say it explicitly because the gate looks like it covers comments and does not.

`verify.mjs` byte-compares first and sends only the byte-different pairs to
`ast_equiv_batch`, which applies `CommentPolicy::Ignore` unless `--comments` is
passed — and the call site passes no arguments. So a divergence that lives only
in comments is byte-different, AST-equivalent, and scored a **pass**. That holds
for all ~14025 entries, components and modules alike, on `client`, `server` and
`client-dev`.

This is why `flowbite-svelte/src/lib/utils/singleselection.svelte.js` diverges on
a top-level `@type {symbol}` JSDoc while `known-failures.client.json` is `[]`:
the ratchet is empty because the comparator never reported a failure, not
because the file agrees.

Two things follow that are easy to get wrong:

- **Flipping `--comments` would not close it on its own.** Under
  `CommentPolicy::Meaningful` only directive-like comments count —
  `is_meaningful_comment` matches `@ts-`, `svelte-ignore`, `@component`,
  `eslint-disable`, `prettier-ignore`, `# sourceMappingURL=` — so JSDoc type
  tags like `@type` are still filtered as prose. The real prerequisite is
  rsvelte preserving comments at all; see `compatibility/ast-equivalence.md`.
- **Preserving them is necessary but not sufficient.** Official itself drops
  the comment in 80 of 192 generated module positions and keeps it in the other
  112, position-dependent rather than per-comment-kind (#2399). Parity means
  reproducing that rule, so a blanket-preserve rsvelte would diverge on the 80.
- **The esbuild TS-stripping in `compile.mjs` is the narrower second cause,
  not the binding one.** `.svelte.ts` entries reach both compilers stripped of
  comments (299 of 437 module entries, 52 of which carry real top-level
  comments), but even the 138 `.svelte.js` modules and every component are
  ungated by the comparator above. A comment-preserving stripper alone would
  buy zero observability.

Until rsvelte preserves comments, the [generated shape matrix](#generated-shape-matrix-matrix)
is the only place comment behaviour can be observed at all.

## Generated shape matrix (`matrix/`)

Everything above compares **collected** inputs. This track compares **generated**
ones (#2281 Gate 2):

```bash
pnpm run corpus:matrix                 # ~5 s, ~2,000 comparisons
pnpm run corpus:matrix -- --no-fmt     # skip oxfmt (faster; inflates the count)
pnpm run corpus:matrix:update          # re-baseline after a fix
```

Needs only `submodules/svelte` and `.corpus-cache/rsvelte.node` — no corpus
submodules, no `collect.mjs` — so it runs as its own CI job on every PR.

**Why generated.** A found corpus samples the marginal distribution of published
code. Every bug in the #2253/#2254/#2255/#2256 batch was an *interaction*:

| shape | occurrences in 14,026 collected files |
|---|---|
| #2254 — `{#each … as X}` item as a `switch` discriminant | 0 |
| #2253 — `#private` `$state` assigned from a literal containing a `//` comment | 0 |
| #2256 — `svelte-ignore` before an object-literal property | 6 |

`client` and `server` were at 0 known failures — saturated — when all four were
reported. A 329-case matrix found 21 divergences in seconds.

**Axes** live in `matrix/axes.mjs`, one object per axis:

- `BINDINGS` × `POSITIONS` → family `binding-position` (7 × 47). Adding one
  position adds 7 cases × 3 targets.
- `COMMENT_SEEDS` × line boundaries × `COMMENT_KINDS` → family `comment-slot`.
  Insertion is restricted to `<script>` regions, where a JS comment is inert.
- `INVALID_BIND_TARGETS` × `BIND_SLOTS` and `VALID_BIND_TARGETS` × `BIND_SLOTS`
  → family `invalid-bind` ((20 + 11) × 8). The odd one out: the invalid half is
  programs the official compiler **rejects**, so the question is not "same
  output" but "same error code". The valid half carries the counterpart signal
  — a validation that rejects too much — which the invalid rows structurally
  cannot report.

`matrix/mutate.mjs` holds the mutation itself and is shared with the
corpus-seeded fuzz (Gate 3).

**Why an invalid-input family.** Every other input here is a valid program,
which is also all the collected corpus can hold — published code compiles. So
"rsvelte accepts what official rejects" was gated only by the 145
`compiler-errors` fixtures, at **one input per code**, and a code with a passing
fixture reads as covered. #2583 is what that misses: `bind_invalid_expression`
had a passing fixture while `<Comp bind:value={o.x = obj} />` compiled into a
getter/setter around an assignment, because upstream runs `object(…)` once for
both slots and rsvelte had the check on the element path only. The element ×
component axis is what turns one input into a product.

For this family the verdict that matters is the one `error-parity` used to
swallow: both compilers rejecting says nothing if rsvelte rejected for an
unrelated reason. `run.mjs` now compares the two error codes and reports
`error-code-mismatch` when they differ — for every family, not just this one.

**An axis can be a compile OPTION, not just a source shape.** A case may carry
`options`, merged over the per-target set (`run.mjs`: `Object.assign(options,
testCase.options ?? {})`); the `async-derived` family is the first user and
`experimental.async` the first option. This generalises — every other harness
here compiles with a fixed `{ generate, dev, filename }`, so a defect that exists
only under a flag is unreachable for them at any corpus size — but it costs
nothing extra per case and has three mechanics and one hard limit:

- **The option is not in the ratchet key.** The key is
  `` `${id} [${verdict}] (${target})` `` (`run.mjs:274`) and `id` is *also* the
  artifact path (`TREE/<id>`), so two cases differing only in options must encode
  the option in the id or they collide in the baseline **and** overwrite each
  other's output files.
- **The merge is shallow.** A case's `experimental` replaces the target's whole
  `experimental` object rather than merging into it. Latent today (no target sets
  a nested option) and cheap to trip over later.
- **A case can override the fixed options,** including `css: 'external'` set at
  `:152` — that is deliberate, but note `result.css` is never compared, so
  `css: 'injected'` is observable only through what it moves into `js.code`.
- **Limit: an option whose effect lands outside `js.code`, the warning `code`
  multiset, or the error `code` is a VACUOUS axis here** — it runs, costs time,
  and is structurally incapable of reporting anything. `run.mjs` reads
  `result.js.code` and nothing else off the result object; `map`, `ast` and
  `metadata` are never touched. `compile.modernAst` is the example: official
  spends it entirely on `result.ast` (`result.ast = to_public_ast(source, parsed,
  options.modernAst)`, `compiler/index.js:58`), so both sides would emit
  identical `js.code` whatever rsvelte did with it. And `parse.skipCssAst` is not
  expressible as an axis **at all** — it is an option of `parse`, and this
  harness only ever calls `compile` / `compileModule`. Those are the two options
  #2697 raises, and the matrix reaches neither, for two different reasons.

  Everything that surfaces in `js.code` *is* reachable: `runes`, `namespace`,
  `accessors`, `customElement`, `preserveWhitespace`, `preserveComments`, `hmr`,
  `discloseVersion`, further `experimental.*`.

**Normalization is identical to `verify.mjs`** (flatten template holes → oxfmt →
strip blank lines). That is a requirement, not a convenience: a divergence this
gate reports must be one the corpus gate would also report, or the two gates
disagree about what "identical output" means.

`--update-baseline` refuses to run under `--no-fmt` (counts formatting-only
differences the corpus tolerates by contract) or under a `--families` subset
(would delete every baseline entry the run did not measure).

## Mutation fuzz (`mutate-corpus.mjs`)

Gate 2 generates inputs from declared axes with hand-picked seeds. This is the
same mutation applied to the **real corpus entries** (#2281 Gate 3) — they stop
being the test set and become a seed set:

```bash
pnpm run corpus:mutate                 # deterministic sample (600 seeds)
pnpm run corpus:mutate -- --seeds 1500 # what CI runs on a PR
pnpm run corpus:mutate:full            # every eligible seed (what main runs)
pnpm run corpus:mutate:update          # re-baseline (requires --full)
```

Needs `collect.mjs` to have run (`sources/` + `manifest.json`), which is why it
lives in the `corpus` CI job — `verify.mjs` only reclaims `expected/`+`actual/`.

**Only the code class is ratcheted.** A divergent mutant is:

| verdict | ratcheted | meaning |
|---|---|---|
| `code-mismatch` | yes | difference survives normalizing comments, whitespace and trailing commas away |
| `compiler-crash` | yes | rsvelte aborted the process |
| `error-mismatch` | yes | exactly one compiler rejected the mutant |
| `comment-mismatch` | no | comment dropped/duplicated/relocated, or a line broke differently |

The full sweep yields 213 code and 13,242 comment divergences. Ratcheting per id
without the split would be a 13,000-entry file churning on every submodule bump;
comment fidelity is ratcheted per id by Gate 2 instead, on generated seeds that
do not move when a submodule bumps.

**Design properties that make the ratchet stable**

- The mutant a seed contributes comes from **that seed's own hash**, not its
  index, so adding a corpus entry does not reshuffle everyone else's mutants.
- The `__L<line>__<kind>` tag goes **before** the extension, so the compiler
  still sees a `.svelte` / `.svelte.js` / `.svelte.ts` filename. Appending it
  produced 9 spurious `error-mismatch` entries that vanished once fixed.
- Seeds already in `known-failures.<target>.json` are excluded — they diverge
  before anything is inserted.
- Compilation runs in **child processes** (like `compile.mjs`): a panic aborts
  the process, and the worker's `IDX <i>` lets the parent name the crashing
  seed, record it, and resume. Without this one bad mutant kills the sweep.

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
   - `compatibility/fmt/oracle/<id>` — oxfmt(`svelte: true`). Depends only on
     the pins + oxfmt version + oracle config, so it is **cached** (`fmt/meta.json`)
     and skipped on re-runs unless those change or `--force` is passed. Entries
     oxfmt rejects (or whose embedded code it can't parse) are excluded — they
     aren't valid, formattable Svelte.
   - `compatibility/fmt/actual/<id>` — rsvelte-fmt (`--stdin`, column-aware
     `<style>` narrowing). Rebuilt every iteration; restrict to a subset with
     `--actual --only <ids-file>` for tight burn-down.
2. `fmt-verify.mjs` — byte-compares, writes `fmt-report.json`, ratchets against
   `compatibility/fmt-known-failures.json` (checked in; may only shrink). Exits
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
   `compatibility/{expected-s2t,actual-s2t}/<id>/index.tsx` (or `error.json`
   on rejection), plus the returned source map as `map.json`. Worker-sharded; an
   rsvelte panic is recorded as an error for that entry instead of killing the
   run.
2. `svelte2tsx-verify.mjs` — oxfmt-normalizes both trees, byte-compares, writes
   `report-s2t.json`, and ratchets against
   `compatibility/svelte2tsx-known-failures.json` (checked in; may only shrink).
3. `svelte2tsx-cluster.mjs` — groups failures by diff signature for burn-down.

The same verify run applies a **second, independent gate on the source map**,
ratcheted shrink-only through `compatibility/svelte2tsx-map-known-failures.json`.
The TSX gate cannot see the map, which is how rsvelte shipped `mappings` whose
generated columns were all zero (issue #2066) while the TSX stayed byte-perfect.

The two maps are *not* diffed against each other. magic-string segments its
output differently (extra chunk-boundary segments, no trailing empty generated
lines), so the maps disagree entry-for-entry — byte parity holds for 0 of the
13,464 corpus components where both tools return a map, decoded-set parity for 0
of the same 13,464, and even `originalPositionFor` agreement at every generated
position for 0 of a 245-component sample.

The gate therefore asserts something weaker but checkable: that **rsvelte's own
map is structurally well-formed** against the text it describes, per the
invariants in `sourcemap.mjs`. Official's map is used only to *calibrate* those
invariants — a rule magic-string itself violates is too strict and does not
belong there, and an entry where official *does* violate one is skipped as
`map-oracle-invalid` rather than blamed on rsvelte. An entry where official emits
a map but rsvelte emits none fails as `map-missing`.

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
  is cached by a combined hash of all source SHAs + the `pattern` source's file
  contents + oxfmt + config.
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
the lint-relevant upstream repos plus the same real-world component libraries
the compile corpus pins:

| Source | Pin | Role |
|---|---|---|
| [sveltejs/eslint-plugin-svelte](https://github.com/sveltejs/eslint-plugin-svelte) | `submodules/eslint-plugin-svelte` gitlink | rule fixtures / docs |
| [sveltejs/svelte-eslint-parser](https://github.com/sveltejs/svelte-eslint-parser) | `submodules/svelte-eslint-parser` gitlink | parser fixtures |
| [huntabyte/bits-ui](https://github.com/huntabyte/bits-ui) | `submodules/bits-ui` gitlink | real-world |
| [themesberg/flowbite-svelte](https://github.com/themesberg/flowbite-svelte) | `submodules/flowbite-svelte` gitlink | real-world |
| [melt-ui/melt-ui](https://github.com/melt-ui/melt-ui) | `submodules/melt-ui` gitlink | real-world |
| [huntabyte/shadcn-svelte](https://github.com/huntabyte/shadcn-svelte) | `submodules/shadcn-svelte` gitlink | real-world |
| [skeletonlabs/skeleton](https://github.com/skeletonlabs/skeleton) | `submodules/skeleton` gitlink | real-world |

The two eslint repos' rule/parser fixtures, docs snippets and demo components
exercise exactly the surface the linter must match; the real-world libraries add
production-source breadth. Markdown code-block extraction runs only for the
eslint repos (`markdown: true` in `lint-collect.mjs`) — real-world docs carry
pseudo-code the parser rejects, matching the compile corpus's `markdown: false`.
(The fixture-level oracle in `crates/rsvelte_lint/tests/eslint_plugin_oracle.rs`
asserts *exact* parity against each fixture's expected `*-errors.yaml`; this
corpus track is the *real-world* complement — every source linted by both
engines, diffed.)

### How it works

```bash
pnpm run lint-corpus:sync             # init the eslint + real-world (bits-ui/flowbite/melt/shadcn/skeleton) submodules
pnpm run lint-corpus:oracle-install   # install the pinned real eslint-plugin-svelte (oracle)
cargo build --profile dist-lint --bin rsvelte-lint   # `panic = "unwind"` → per-file panic isolation holds
pnpm run lint-corpus:collect          # gather .svelte / .svelte.(js|ts) sources -> compatibility/lint-sources/
pnpm run lint-corpus:verify           # diff oracle vs rsvelte-lint, ratchet lint-known-failures.json
# or, all of the above:
pnpm run lint-corpus                   # sync + install + collect + verify
pnpm run lint-corpus:update            # re-baseline lint-known-failures.json after a fix
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
- **Population** — every `.svelte`, `.svelte.js` and `.svelte.ts` entry in
  `lint-manifest.json`. `--ci` collects exactly the repos the ratchet describes
  (`CI_REPOS` in `lint-universe.mjs`), and `--update` refuses to rewrite from any
  other repo set, from fewer than 6000 sources, or from a manifest whose sources
  are not on disk — a rewrite deletes every entry it did not reproduce.
- **Ratchet** — every finding present on exactly one side is a *divergence*,
  recorded in `compatibility/lint-known-failures.json` (tracked). The set may
  only **shrink**: a NEW divergence fails CI; fixed ones are pruned with
  `--update`. See [compatibility/lint-known-failures.md](../../compatibility/lint-known-failures.md)
  for the burn-down playbook and the root-cause clusters.

The `lint-parity` job in `.github/workflows/corpus-compat.yml` runs this track
on PRs/pushes touching the linter, the pipeline, or either pin.

## svelte-check diagnostic parity (official `svelte-check`)

A fourth track verifies that `rsvelte-check` reports the **same diagnostics** as
the official `svelte-check` on a set of committed mini-projects. Its unit is a
**type-checked project**, not a file: module resolution, workspace layout,
`tsconfig` `paths` and the `.d.ts` environment only exist at project scope, and
every other track discards them by construction (`collect.mjs` flat-extracts
sources by extension and compares text). That blind spot is what let the
false-positive cluster #1883–#1889 ship — see #1897.

```bash
pnpm run check-corpus:oracle-install   # install the pinned real svelte-check (oracle)
cargo build --release -p rsvelte_check
pnpm run check-corpus:verify           # diff oracle vs rsvelte-check, ratchet check-known-failures.json
# or, all of the above:
pnpm run test:svelte-check
pnpm run check-corpus:update           # re-baseline check-known-failures.json after a fix

# rsvelte-check's *other* backend (rsvelte-check --tsgo). The oracle stays
# tsc-based in both cases — only rsvelte-check's own compiler switches:
pnpm run check-corpus:tsgo-install
pnpm run test:svelte-check:tsgo
```

- **Oracle** (`check-oracle/`) — an isolated package pinning `svelte-check`,
  `svelte`, `typescript` and `@sveltejs/kit` at **exact** versions. Its
  `node_modules` is symlinked into each materialised fixture and also supplies
  the `tsc` that `rsvelte-check` runs (`TSGO_BIN`) by default, so both sides
  type-check against byte-identical dependencies.
- **tsgo backend** (`check-tsgo/`) — a separate isolated package pinning
  `@typescript/native-preview` at an **exact** version, used only when
  `check-verify.mjs --rsvelte-backend tsgo` points rsvelte-check's `TSGO_BIN`
  at it instead of the oracle's `tsc`. Kept out of `check-oracle/` on purpose:
  that directory is the ground-truth environment (never swapped), this one is
  just the other backend under test.
- **Scenarios** (`compatibility/check-fixtures/<name>/`) — `scenario.json`
  (workspace, `--tsconfig`, extra `node_modules` symlinks) plus a `project/`
  tree. Each encodes one real-world shape: single package, pnpm sibling via a
  `node_modules` symlink, sibling via a `paths` alias only, an external package
  aliasing itself, a plain `.ts` importing an aliased `.svelte`, the SvelteKit
  hooks declaration-form matrix, post-shim-snapshot `svelte/elements` tags, and
  a no-`--tsconfig` run. `basic` is the positive control: it must stay green.
- **Normalization** — a diagnostic collapses to
  `<SEVERITY> <relpath>:<line> <code>`. Column and message text are dropped on
  purpose (rsvelte maps positions through its own source map, and TypeScript
  wording is version-sensitive); severity, file, line and code are what a user
  acts on. Because that key is lossy, the two sides are compared as **multisets**
  — one line can carry several diagnostics with the same code, and set semantics
  would let a known divergence mask a new one.
- **Ratchet** — every surplus diagnostic on one side is a *divergence*, recorded
  in `compatibility/check-known-failures.json` (tracked), shrink-only, with an
  ` xN` suffix when the surplus is larger than one. Justifications live in
  [compatibility/check-known-failures.md](../../compatibility/check-known-failures.md).

The `check-parity` job in `.github/workflows/corpus-compat.yml` runs this track
as a `backend: [tsc, tsgo]` matrix (see [check-known-failures.md](../../compatibility/check-known-failures.md#backend-matrix-tsc-vs-tsgo));
it needs no submodules.

### Layer 2 — real-project e2e parity (`check-e2e-verify.mjs`)

The scenarios above are mini-projects somebody wrote down. Layer 2 runs the same
comparison over **real repositories**, pinned as submodules and installed with
their own lockfiles: real `tsconfig` chains, real `svelte.config.js`, real
`node_modules`, and — for the monorepo — real cross-package resolution. That is
the shape all five reports in #1883–#1889 came from; every one was found by
pointing the checker at somebody's actual repository, never by a fixture.

```bash
pnpm run test:svelte-check-e2e              # submodules + build + oracle + verify
pnpm run check-e2e-corpus:verify            # verify only (deps already installed)
node scripts/compat-corpus/check-e2e-verify.mjs --skip-install   # reuse an installed tree
node scripts/compat-corpus/check-e2e-verify.mjs --update         # re-baseline
```

- **Units** — one directory with its own `tsconfig.json`, i.e. the granularity at
  which these repositories run `svelte-check` themselves. Currently
  `cmsaasstarter/app` (single-package SvelteKit app, npm),
  `skeleton/playground` (SvelteKit app inside a pnpm workspace, importing two
  sibling workspace packages) and `skeleton/library` (the 300-component package
  those siblings resolve to). The list lives in `PROJECTS` at the top of
  `check-e2e-verify.mjs`.
- **Invocation** — both checkers run from the unit directory with
  `--tsconfig ./tsconfig.json` and **no** `--workspace`, i.e. exactly what the
  project's own `check` script runs. SvelteKit units get `svelte-kit sync` first
  so both sides read the same generated `.svelte-kit/`.
- **What is shared, what is not** — the projects keep their own `svelte` /
  `@sveltejs/kit` (their types are half of what is being checked); the *checker*
  is shared. Official `svelte-check` runs from the pinned oracle, and
  `rsvelte-check` is pointed at that same oracle `tsc` via `TSGO_BIN`, so both
  sides type-check the project's real dependency tree with one identical
  compiler.
- **Normalization and ratchet** — identical to Layer 1 (the parser, the key and
  the multiset diff are shared in `check-diagnostics.mjs`), with the entry
  prefixed `<project>/<unit>` instead of `<scenario>`. Baseline:
  `compatibility/check-e2e-known-failures.json`, justified per cluster in
  [check-e2e-known-failures.md](../../compatibility/check-e2e-known-failures.md).

The `check-e2e-parity` job in `.github/workflows/corpus-compat.yml` runs this
track. Adding a unit means adding a submodule + a `PROJECTS` entry + the
submodule to that job's checkout step, then `--update` to seed its divergences.

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
   `known-failures.{client,server,client-dev}.json` / `svelte2tsx-known-failures.json` /
   `fmt-known-failures.json`. Like every ratchet they may only **shrink** — a new
   divergence on a later run fails CI. Regenerate baselines on Linux (CI is the
   source of truth — see the formatter-parity environment note above).

The corpus only ever **reads** source files — it never installs deps or runs a
project's build, so a shallow submodule is all that is needed.

## Adding a pattern file

[`compatibility/pattern-corpus/`](../../compatibility/pattern-corpus/) is a
checked-in corpus source for shapes the pinned repositories do not contain: one
minimal repro per fixed divergence under `issues/`, and the axes around it under
`matrix/<axis>/`. Files there are collected, compiled and ratcheted exactly like
submodule sources (ids `pattern/issues/…`, `pattern/matrix/…`), and — since the
manifest is shared — they also flow through the fmt and svelte2tsx gates.

1. **Write the file.** `issues/<issue-number>-<slug>.svelte` for a repro,
   `matrix/<axis>/<slug>.svelte` for an axis point. Self-contained (imports need
   not resolve), accepted by the **official** compiler, one behaviour per file,
   minimal, and **formatted** — it is a formatter case too, so an unformatted
   file just adds noise to the fmt gate.

2. **Do not put provenance in an HTML comment.** Removed comments are themselves
   a whitespace-sensitive compiler input, so a `<!-- issue N -->` line changes
   what the file tests. Record it in the table in
   [`compatibility/pattern-corpus/README.md`](../../compatibility/pattern-corpus/README.md)
   instead — that table is the only provenance record.

3. **Land it with the fix.** A repro for a still-open divergence would have to be
   seeded into `known-failures.*`; add it in the fix PR (or right after it
   merges) so it lands green.

4. **Check it.**

   ```bash
   pnpm run corpus:collect
   node scripts/compat-corpus/compile.mjs --filter pattern/
   node scripts/compat-corpus/verify.mjs
   node scripts/compat-corpus/one.mjs pattern/issues/<file>.svelte   # diff one entry
   ```

No submodule, `.gitmodules`, CI path-filter or auto-update entry is involved —
`compatibility/**` is already a trigger path for `corpus-compat.yml`.
