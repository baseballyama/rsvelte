# known-failures.{client,server,client-dev}.json — why each entry is accepted

The output-equality corpus compiles every source with both the official Svelte
compiler and rsvelte (CSR + SSR + CSR `dev: true`) and requires byte-identical output after
comparison-side normalization. The comparison is **AST-structural**
(`normalize.astEquivalent` via acorn): comment position, `${}` line-wrapping,
redundant parens, and quote style are already absorbed, so any entry here is a
**genuine structural (AST-distinct) divergence** in the generated code, not a
cosmetic one.

The ratchet (`corpus-compat.yml`) fails only on an `(id, target)` pair not in the
baseline — the lists may only shrink, never grow. Each accepted entry must be
justified in this file.

The JSON files are CI-enforced this way, but the header counts and (for
client-dev) the cluster-table residue below are hand-maintained prose and were
not checked anywhere, so a burn-down PR could update the JSON without keeping
this file's numbers in sync (#2062, drift from #2048). `corpus-compat.yml` now
runs `scripts/compat-corpus/known-failures-md-check.mjs` first, which fails
the job if a header count (or the client-dev "attributed to a cluster" /
"remaining" reconciliation, when that sentence is present) stops matching the
JSON array length.

The five skeleton seeds from #1924 are gone (#2017): #1973 (fixed by #1996),
#1974 (fixed by #1988), #1975 (fixed by #1993). All three divergences the
checked-in pattern corpus (#2019) surfaced are gone too: the two SSR
destructuring ones (#2033, #2034) were fixed by #2036, and the block-local
snippet render tag (#2031) by #2057.

## Client (`known-failures.client.json`, 0 entries)

Empty. The one entry this list ever held — #2031, a `{#snippet}` declared inside
an `{#if}` branch and `{@render}`ed as a sibling in that same branch, lowered
through the dynamic path (`$.comment()` anchor + `$.snippet(...)`) instead of
being called directly — was fixed by #2057: the scope builder gives each branch
its own scope, but the analysis visitor never entered it, so the render tag's
lexical lookup started above the branch and missed the snippet binding.

## Server (`known-failures.server.json`, 0 entries)

Empty. Its one entry was the SSR half of the same #2031 divergence (the extra
`<!---->` the dynamic form pushes), fixed by the same change.

The two SSR destructuring seeds this corpus also surfaced — #2033 (computed /
quoted key dropped in a destructured `$derived`) and #2034 (`$.to_array` arity
with a rest element) — were resolved by #2036, which mirrored #2010's client
destructuring fixes onto the server target.

## Client dev (`known-failures.client-dev.json`, 896 entries)

The `client-dev` target is the `client` target with `dev: true`. It is a
separate ratchet because `dev` gates 18 client codegen files plus the CSS
transform (`css/index.js:146` keeps empty rules in dev), so a dev-only
divergence is invisible to the two `dev: false` targets — #1981
(`<X.Y bind:…>`) was live in 524 corpus files and undetected for exactly that
reason. CSS is compared for this target too, and is clean: 0 css-mismatches.

The enrolment seed was 4566. The dev-cluster campaign (#2020, #2022–#2026,
#2029, #2030, #2039, #2040, and the #2021 series) took it to 896 with no
regression on `client` or `server`, both of which are empty.

### How the counts below are derived

The enrolment-era table attributed each entry by its **first differing line**.
That is a trap this campaign hit four times: a pure statement **reordering**
reports as the helper on the expected side being *absent*, so a positioning bug
reads as an unported feature. #2020, #2022 and #2023 were all filed as "not
emitted" and all turned out to be emitted in the right number and the wrong
place.

The table is now derived by **comparing how many times each helper appears** on
each side, which separates the two directions and cannot be fooled by order:

| Cluster | under-emits | over-emits | Upstream emitter (`phases/3-transform/client/`) | Issue |
|---|---:|---:|---|---|
| equality instrumentation | 311 | 0 | `visitors/BinaryExpression.js` | #2025 |
| `$.track_reactivity_loss(...)` | 261 | 2 | `visitors/AwaitExpression.js` | #2026 |
| ownership mutation validation | 106 | 2 | `transform-client.js`, `visitors/shared/{component,utils}.js` | #2027 |
| `console.*` wrapping | 68 | 73 | `visitors/CallExpression.js` | #2028 |
| `$.tag()` / `$.tag_proxy()` | 26 | 0 | `visitors/VariableDeclaration.js` | #2021 |

732 entries are attributed to a cluster; the remaining **164** show no
difference in any dev helper and are the formatting / long-tail residue tracked
in #2064 (JSDoc dropped, the legacy `bind:` `function get()/set()` shape,
`$.assign`, `$$css`).

### The equality and await rows are not the bugs their issues describe

#2025 and #2026 are both **merged**, so their clusters were expected to
disappear here. They did not, and splitting the remainder by component mode
says why:

| | legacy component | runes component | module script |
|---|---:|---:|---:|
| equality under-emits | **309** | 2 | 0 |
| `track_reactivity_loss` under-emits | **146** | 97 | 18 |

Both fixes ride the instance-script AST pass, and that pass sits under
`if analysis.runes` — so a **legacy (non-runes) component is never
instrumented at all**, for any of these helpers. Upstream instruments legacy
components exactly like runes ones. This single gate, not the per-helper logic,
is now the largest remaining cause on this target; it was recorded as a known
residual on #2084 and is worth its own issue rather than being re-litigated
per helper.

The `console.*` row is the one place where rsvelte also emits **more** than
upstream. Both directions come from the same root: upstream decides with
`scope.evaluate(arg).has_unknown`, a 273-line abstract interpreter over an
`UNKNOWN` / `STRING` / `FUNCTION` lattice, which rsvelte approximates with two
ad-hoc predicates that disagree with each other. See #2028.

**#1981 is confirmed absent.** The run contains zero
`$$ownership_validator.binding(` divergences, so the #1989 fix holds across the
whole corpus. The ownership row above is a *different* gap (mutation tracking,
not bindings) that only this lane could surface.

## Hard-cluster warnings for future work

Deep areas where past fixes caused wide regressions (mirror upstream exactly;
verify against the full corpus + byte-exact runtime/ssr/css suites before
landing):

- **scope.evaluate `is_defined` / `should_proxy` lattice** — widening it to drop a
  spurious `?? ''` or proxy regresses real props that need `?? ''`. svelte resolves
  via scope; a name-keyed approximation cannot represent per-site outcomes — use
  per-site (Semantic / scope-chain) resolution.
- **each-item reactivity wrapping** (function-depth `has_external_dependencies`
  check) — a prior attempt caused ~498 regressions.
- **`$derived` currying** (`yScale()(tick)`) — reverted twice; do not retry naively.
- **store/runes name-conflict resolution** — two independent sub-bugs that must land
  together and distinguish getter-vs-user-call by context.
- **CSS structural prune** (`is_structural_descendant_chain_unused`) bails on
  snippet-declared elements, `<selectedcontent>`, `:host`/`:root`/`:global`,
  functional pseudo-classes, and escaped identifiers — extend only with the
  matching upstream semantics.
