# Gates, ports, and deliberate divergences

This file is the consolidation of what used to be one Markdown file per ratchet.
Each former file is an anchored section below; the anchor is the former filename's
stem, which is what `known-failures-md-check.mjs` and `deliberate-divergences-check.mjs`
resolve. Do not rename an anchor — they are machine-facing.

| section | was |
|---|---|
| [`gate-coverage`](#gate-coverage) | `compatibility/gate-coverage.md` |
| [`two-ports-inventory`](#two-ports-inventory) | `compatibility/two-ports-inventory.md` |
| [`ast-equivalence`](#ast-equivalence) | `compatibility/ast-equivalence.md` |
| [`deliberate-divergences`](#deliberate-divergences) | `compatibility/deliberate-divergences.md` |
| [`README`](#README) | `compatibility/README.md` |

<a id="gate-coverage"></a>

## Gate coverage — what each gate cannot see

Every gate in this repo can be green while a real defect ships, because every gate has a
population it does not sample, a field it does not read, or a normalization step that erases
the divergence before the comparison happens. Those blind spots were undocumented and were
being rediscovered one shipped bug at a time. This file is the inventory.

It answers three questions per gate:

1. **What it compares** — the unit that actually gets diffed.
2. **What it structurally cannot observe**, and the specific flag / field / normalization
   step / population filter responsible.
3. **The evidence**, which is one of exactly three things:
   - **[D] discriminating case** — a concrete input for which the gate is green and a correct
     gate would be red. The strongest form, and the only one that separates "cannot see it"
     from "I did not find an example".
   - **[S] structural argument from code** — this flag is never passed / this field is never
     read / this population never contains X, with file and line.
   - **[U] unmeasured** — no evidence was gathered. A row marked `[U]` is a *question*, not a
     finding.

**One question this file does not ask** has its own inventory in
[`two-ports-inventory.md`](#two-ports-inventory): *how many times does rsvelte answer
one upstream decision, and does anything compare its own answers to each other?* Every
gate below compares rsvelte to upstream; none compares rsvelte to itself, so a second port
of one upstream function is exercised only on whatever inputs a real file happens to
supply. That is indexed by decision rather than by gate, which is why it is a separate
file — but the two share an evidence vocabulary, and a row there is a gap here.

**Do not fill a row with a plausible guess.** An unsupported blind-spot claim is worse than a
blank, because the next person reads the row as surveyed and never looks again. If you have
neither a discriminating case nor a code citation, write `[U]`.

**And a row that was true when written can go stale, which reads exactly the same.** Every row
here is an as-of statement about a tree, not a standing property of the gate: the hole it
describes may since have been filled by someone who never opened this file. §8a was an
instance — it claimed "there is no population floor anywhere in the file" while
`EXPECTED_COMPONENTS` had been in that file on `main` all along. A guessed row and a stale row
fail in the same direction and are indistinguishable on reading, so before *relying* on a row —
citing it to justify a decision, or leaving a gap unclosed because it is "already known" —
re-run its evidence rather than trusting it. A `[D]` row states an input; re-run it. An `[S]`
row states a file and line; re-read it. The correction costs minutes; the row's authority
costs whatever it deterred.

**And when you re-run it, check that the check does not share a dependency with what it
checks.** A verification step that resolves the same ref, reads the same field, or normalizes
the same way as the thing under test is not a verification step — it can manufacture the very
symptom it was meant to detect, or erase it. Several entries below are instances of the same
shape: a guard whose predicate is permissive in both quantifiers, a positive control whose
comparison key cannot separate the two cases, a gate whose normalizer deletes the field in
question.

---

### A named blind-spot class: the vacuous green

**A comparison whose empty result is indistinguishable from an unreachable population.** The
gate runs, finds nothing, and reports the same thing it would report if it could never have
found anything. Four gates in this file are instances, which is why the class gets a name rather
than four unrelated rows — cite it from a row instead of re-deriving it:

| instance | the reading that is wrong |
|---|---|
| §5b, warning codes on the matrix | "0 warning divergences" — **seven of the ten families emit 0 warnings of any code**, over 5244 accepted (case, target) pairs, so on those the comparison has no population at all |
| #2707, `verify.mjs` warning comparison | a wiped corpus tree makes an absent `warnings.json` read as "official emitted no warnings" rather than "there is no tree"; the ≥99%-coverage guard covers the output comparison only |
| #2579 | a baseline entry that "already PASSes" cannot be told from one the run never measured |
| #2704 | a normalizer that erases the divergence before the comparison sees it |

The defence is always the same two moves, and they are cheap: **print the denominator next to
the verdict**, and **ask what a positive instance would have looked like** before believing a
zero. §5b carries the denominator for exactly this reason.

A sibling failure mode, distinct enough to name separately: **a ratchet entry suppresses
everything its key cannot tell apart.** Not an empty population — a coarse key. §5b is the
worked example: under a flat `warning-mismatch` verdict, three cases listed for a missing a11y
warning silently absorbed a re-break of #2521 on the *same* cases, and the gate stayed green.
Putting the diverging code in the verdict fixed it. When you add a verdict, ask what two
different defects it maps onto the same string.

---

### A named blind-spot class: the one-directional verdict vocabulary

**A grid scored in the vocabulary of the issue that motivated it reports the opposite
direction as zero.** Not an empty population and not a coarse key — a *complete* verdict
set that omits a direction, so cells moving that way are counted as agreement or are never
constructed at all. It gets a name because it has now happened on both axes it can happen on:

| instance | the vocabulary | what it could not report |
|---|---|---|
| the `bind:` family (AGENTS.md § Generated shape matrix) | inputs chosen because official **rejects** them | an over-**rejection** — a TypeScript assertion, `bind:group={c as T}`, which CI caught from a corpus file instead |
| `param-default` | the same, until its legal rows were added | `async (p = { async m() { … } }) => p` **is** legal, so a check that scans the parameter subtree rejects real code |
| #3261 (§39) | the issue is titled "330 over-acceptances", so the grid scores accept-vs-reject | **18 over-rejections of 38**, measured on a tree whose own grid read 330 → 66 |
| #3261, one level down (s2tF, recorded in AGENTS.md) | `agree` / `over-accept` / `under-accept` | `both reject, different code` — 178 cells moved into a fourth verdict the three-value set cannot spell |

The defence is not "add more inputs". It is two questions asked **before** measuring:
**does my verdict set have a cell for the opposite direction**, and **does my population
contain an input that would land in it?** A grid that answers no to either reports a clean
number while the other direction moves freely underneath it — and the number *goes down*,
which reads as progress.

Corollary worth stating separately, because it is what makes this expensive: **the author of
the grid is the person least able to see it.** The vocabulary comes from the issue, the issue
is written from the defect that was noticed, and the defect that was noticed is the one whose
direction someone already had a name for. §39's 18 were found by running a *different* gate on
the same tree, not by extending the original grid.

---

### A named blind-spot class: the ported rule whose input never arrives

**A rule transcribed from upstream — comment and all — where the comment's premise is about
input the porting side does not produce.** The port compiles, its unit test passes, and the
rule fires zero times on every real input, so nothing anywhere goes red. It is not a coarse key
and not an empty population: the population is full and the *predicate* is unreachable.

The worked example is upstream's `.svelte` component hover. `TypeScriptPlugin` truncates a
declaration at `lastIndexOf('import')`, because the declaration it is handed comes from **tsc's
`displayParts`**, which spell an `__sveltets_2_IsomorphicComponent` alias with the word
`import` in it. rsvelte's declaration comes from **tsgo's rendering**, which contains no such
word — so `lastIndexOf` is always `None` and the ported rule is inert. The unit test written
alongside it passed because it fed the function a tsc-shaped string tsgo cannot produce: the
test proved the rule, and proved nothing about the product.

The defence is one question asked before writing the port: **what produces the input this
comment is describing, and is it the same thing on my side?** Then a second, which is what
turns the answer into a test: **construct the test input from the real producer**, not from the
upstream source's example. A test whose input the product cannot generate is a non-discriminating
test with a plausible shape, and it ships green.

A cheaper detector, when the port is already written: run it on the corpus and count how often
the branch is taken. A ported rule that fires **zero** times is either unreachable or untested —
both worth knowing before it is merged, and neither visible in a diff.

---

### A named blind-spot class: the environment failure wearing a verdict's name

**A comparison step guarded so that it cannot be silently skipped will instead run without
the environment it needs, and its failure is reported under the comparison's name.** The
guard is right; what it did not say is that *setup* is also "an unguarded step after the
failing one".

`corpus-compat.yml` opens `shape-matrix` with a doc-count check, then checks out the Svelte
submodule, installs, and builds the binding — all unguarded — and closes with two steps
carrying `if: ${{ !cancelled() }}`, whose comment reads *"A failing step skips every unguarded
step after it, and a skipped comparison reads exactly like a passing one. Run regardless."*
On #4140 the doc-count check failed, every setup step was skipped, and the two comparisons ran
anyway: `matrix/run.mjs` died on `Cannot find package 'acorn'` and the waterfall runtime gate
on `official compiler missing`. What reached the branch header was
**`Shape matrix parity (generated inputs): FAILURE`** — read by two people in succession as a
divergence verdict, on a job where the matrix had never run at all. Fixing *a skipped
comparison reads as a pass* had introduced *an environment failure reads as a divergence*:
the same defect with the sign reversed.

It is a class, not an instance. Counting, per job, the unguarded steps preceding the first
`!cancelled()` step: `corpus` 13, `fmt-parity` 12, `shape-matrix` 11, `lsp-corpus` 10,
`lsp-fixtures-current` 9, `lint-parity` 8, `lsp-benchmark` 9. Any of those failing — a doc
check, or a `pnpm install` that hit a network blip — produces a red parity verdict whose cause
is not parity.

The defence is a precondition rather than the removal of the guard, because the guard's own
reason still holds: a comparison runs on `!cancelled() && steps.<setup>.outcome == 'success'`,
so it is skipped exactly when its environment is absent — and the job is already red from the
real cause, so nothing is swallowed. `scripts/ci/step-environment-guard.mjs` enforces it, with
`test-step-environment-guard.mjs` as the control set: the rule has to reject the #4140 shape
**and** accept a sibling check guarded for the reason `!cancelled()` was written for, since a
rule that requires a sibling check's outcome puts the original bug straight back.

The generalisable question, asked of any `if:` on a CI step: **what else does this condition
let through, and under whose name does that arrive?**

---

### Reading the corpus in one sentence

The collected corpus samples the *marginal* distribution of published Svelte code. That is
the axis that is saturated. The two axes that still find defects are **what we compare**
(fields, not files) and **how inputs are constructed** (generated products, not collected
samples) — see `AGENTS.md` § "Generated shape matrix" and issue #2281.

---

### Summary

| # | Gate | Unit compared | Sharpest blind spot | Ev. |
|---|------|---------------|---------------------|-----|
| 1 | Compiler output parity (`verify.mjs`) | per-entry × per-target JS text, plus CSS text on the two **client** targets only (1i) | comments, on every entry and every target | [D] |
| 2 | Compiler warning codes | multiset of `code` per entry × target | warning **message text** (#2403); a rule family measured at **one** of its ~40 codes (2d) | [D] |
| 3 | Compiler warning positions | multiset of `code@line:col` | warning **end** span | [S] |
| 4 | Compiler **error** parity | `error.json` `code`, `message`, `start`, `end`, `frame` | `filename`; the NAPI entries the corpus does not call; a missing artifact scored `match` until the per-tree precondition | [D] |
| 5 | Generated shape matrix | per-case × target JS text + warning `code` multiset, or error `code` where official rejects | neither output is parsed — identical **non-JavaScript** scores `match`; CSS; warning **position**; error **message** and **position**; multi-directive and ancestry rules; whether a folded constant is the *right* value | [D] |
| 6 | svelte2tsx TSX text parity | per-component TSX text, oxfmt-normalized | `exportedNames` / `events`; TSX line+column layout; whitespace inside a statement; anything about an error both sides raise; how the port decided a token was code; whether an output it scores `match` is TypeScript at all (6j) | [S] [D] |
| 7 | svelte2tsx source map | structural invariants and corpus-wide mapped-line coverage on rsvelte's own map | relation between generated text and mapped original text; source index | [D] |
| 8 | css-prune sweep | `css.code` + `code@line:col` warnings of 1969 generated components | `js.code`; **every element in the grid is a plain `<div>`/`<p>` in one component** | [D] |
| 9 | Formatter parity (JS corpus) | whole-file bytes vs oxfmt oracle | ids whose oracle file is absent are skipped, uncounted | [D] |
| 10 | Formatter parity (Rust svelte.dev) | whole-file bytes vs generated fixture | exercises `--no-native-css`, not the shipped default | [S] |
| 11 | Lint output parity | set of `rule\tline:col\tmessage` | `.svelte.(js\|ts)` ungated on **both** sides; autofixes never compared | [D] |
| 12 | svelte-check Layer 1 (fixtures) | multiset of `SEVERITY file:line code` | column, message, `source`, file-walk counts, every flag but `--tsconfig` | [D] |
| 13 | svelte-check Layer 2 (e2e) | same key, 3 units in 2 repos | same fields; whether the oracle finds anything at all | [U] |
| 14 | Compiler source-map gate | 23 anchors + budgets + parity vs official | segments rsvelte **adds**; `sources`/`names`; `dev: true`; a **uniform shift** of every original line | [D] |
| 15 | `ast_gate_preconditions` | "rsvelte's own output parses" | compile **failures** are skipped — errors make it greener | [S] |
| 16 | Validator fixture suite | per-fixture ordered `(code, message, start, end)` warnings + error code/message/span; message text against a generated oracle | only 5 `_config.js` keys are read, and `options.json` not at all — a sample runs under options upstream never used | [S] |
| 17 | svelte2tsx fixture suite | per-fixture TSX text | text after the `export default class` cut is dropped from both sides | [S] |
| 18 | Compatibility report (`AGENTS.md` numbers) | pass/fail per fixture | it asserts nothing — a number moving cannot fail CI | [S] |
| 19 | Output parseability (`verify.mjs`) | rsvelte's `js.code` alone, parsed with acorn | says nothing about whether the output is *right*; no CSS, no maps | [S] |
| 20 | Corpus-seeded mutation fuzz | per-mutant × target JS text, normalized as gate 1 | the operator only **inserts comments** — a delimiter in a *string* is unreachable at any corpus size; and the `codeIdentity` reduction that decides which half is ratcheted deletes real code on **10.9%** of the corpus (20h) | [D] |
| 21 | Published-artifact glibc floor | max `GLIBC_*` version referenced by each Linux artifact | whether the binary actually **runs** anywhere; every non-glibc dependency | [D] |
| 22 | NAPI option boundary | per declared option key: baseline vs. one-key variant, through the raw addon | it never compares against **official** — a key wired to the wrong semantics stays green | [S] |
| 23 | Escaped-quote lookback shape | one line of Rust source, over every `.rs` under `crates/` + `apps/` | it matches a **spelling**; a scanner with *no* escape check at all produces no line to match | [D] |
| 24 | `await_waterfall` runtime parity | the `await_waterfall` warnings a **mounted** rsvelte-compiled component logs vs. official's, 3 cases | one warning code, one component shape; nothing else about the running component is observed | [D] |
| 25 | Differential output-preservation corpus hash | per `.svelte` source × client/server/client-dev/server-dev hash from base-core vs merge-ref-core | changes outside `crates/rsvelte_core`; every PR without the maintainer-applied `output-preserving` label | [S] |
| 26 | esrap generated-output corpus | parsed JS output × official/rsvelte tree × 4 targets; AST equivalence, comment kind/body sequence, code/map equality, map bounds/order | production synthetic AST spans and whether a mapping points at the corresponding source token | [S] |
| 27 | LSP differential parity | normalized JSON response field per request against the pinned official server and selected upstream snapshots | **every server notification**; incremental edit and resolve sequences; **the whole corpus half — its key carries no divergence and 3,632 of 3,637 files are already listed, so it cannot report a NEW (27o)**; the oracle-calibration floor is skipped on the corpus job, which enrols 66.7% of the entries, and that job never installs the repositories it measures | [S] [D] |
| 39 | svelte2tsx option axis | full TSX text per (option variant x source) against the official tool, options carried in the fixture | option values outside its grid (`rewriteExternalImports`, `runes`, most `namespace` x `mode` products); `emitDts`; the map, `exportedNames` and `events` | [S] [D] |
| 38 | NAPI `cssHash` | the scope class the callback produces, and the callback's own argument list, against **official** | one component shape and one option set; only `css.code` / the class in `js.code`; nothing about the wasm or facade ports of the same option | [S] |
| 39 | Print fixture suite (`tests/print.rs`) | per-sample printed Svelte text vs upstream's `output.svelte` | it compares the text, not **which code produced it** — a source-text shortcut around the whole AST printer was invisible for 43 of 43 samples | [D] |
| 40 | Wasm compile-option boundary | six rejection outcomes against **official**, plus named callback/warning behaviours | most valid option values; error positions; interaction/order between two invalid keys; C ABI and NAPI ports | [S] |

Cross-cutting blind spots (**ratchet keys losing in both directions**, path filters, ratchet-doc
drift, vacuity floors, the **performance**
gates' population, and **an uninitialised corpus source shrinking every corpus gate silently**)
are in [§ Cross-cutting](#cross-cutting) at the end.

### 39. svelte2tsx option axis — `crates/rsvelte_projection/tests/svelte2tsx_option_axis.rs`

**Unit.** One `(option variant, source)` cell: the full TSX text rsvelte produces for the JS
option object carried in `tests/data/svelte2tsx_option_axis.json`, compared byte-for-byte to
the `expected` field of the same case. Every expectation in that file is **generated by the
official `svelte2tsx`**, not written by hand. It exists because every other svelte2tsx gate
holds the option object fixed (blind spot 6d), so the option axis was unmeasured: a 22 x 12
exploratory grid found 124 of 264 cells diverging with the `gate-default` row at 0 of 12.

**Blind spot 39a — the grid is its author's product, and a stale fixture is not detectable
from inside.** The cases are a fixed list; an option value nobody wrote is not covered, and
regenerating against a newer `language-tools` is a manual step with no CI check that the
`expected` fields still match the pinned submodule. **Evidence [S]:** the test reads only the
committed JSON; nothing in the repo re-derives it. The vacuity guard asserts each of `mode`,
`typingsNamespace`, `emitJsDoc`, `noSvelteComponentTyped`, `version` and the no-`filename`
case is present, so a truncated fixture fails rather than passing on an empty population — it
does not assert the values are current.

**Blind spot 39b — only `code`.** `map`, `exportedNames` and `events` are not compared, so an
option that changes the map or the exported-name surface without changing the text is
invisible here. **Evidence [S]:** the test reads `result.code` and nothing else.

### 26. esrap generated-output corpus — `scripts/compat-corpus/esrap-verify.mjs`

**Unit.** Every available JavaScript output in both `expected/` and `actual/`, across
client, server, client-dev and server-dev, is parsed with OXC and printed by
`rsvelte_esrap` with and without mappings. The gate requires semantic AST equivalence,
identical code from the mapped and unmapped APIs, ordered comment kind/body preservation,
and ordered in-bounds mapping coordinates. Block bodies discard the common indentation of
their continuation lines, so layout-only re-indentation is not a content divergence while
relative indentation remains observable. It rejects fewer than 12,000 outputs in any
tree/target and records the measured population in `esrap-report.json`.

**What it caught that gate 1 could not [D].** The wave-2 enrolment brought in
`carbon-components-svelte/src/Slider/{Slider,RangeSlider}.svelte`, whose JSDoc holds a
```` ```svelte ```` fence. The client re-indenter read the backtick as a template-literal
delimiter and stopped indenting every line after it, so rsvelte's output disagreed with
official's *inside one comment* — half its lines carried the enclosing tab and half did not.
Gate 1 cannot see that at all (blind spot 1a: comments are compared under
`CommentPolicy::Ignore` on 100% of the corpus), and the formatter oracle re-aligns a JSDoc's
` * ` lines, so it is invisible there too. Here it is a first-class failure, because the
common-indentation rule above leaves *relative* indentation inside a comment observable.

**Blind spot 26a — reparsing erases production AST provenance.** The gate consumes compiler
text from `expected/` and `actual/` and constructs a fresh OXC `Program`; it never
passes rsvelte's synthetic phase-3 AST, its `loc_map`, or original synthesized spans to the
printer. A defect reachable only before compiler output is materialized is therefore outside
this population. **Evidence [S]:** `esrap-verify.mjs` passes only file paths to
`esrap_corpus`, whose `parse` function constructs every tested `Program` from file text.

**Blind spot 26b — mapping validity is structural, not semantic.** `validate_mappings`
checks generated ordering and source/generated bounds, but it does not resolve a mapping and
compare the generated token with the source token. A mapping can point to the wrong in-bounds
location and pass. **Evidence [S]:** those are the only predicates read from each `Mapping`
in `esrap_corpus.rs`.

## 25. Differential output-preservation corpus hash

**Unit.** For every collected `.svelte` source and each of the four compiler targets, the
`corpus_hash` rows from a binary built with the merge-ref harness plus base
`crates/rsvelte_core` are compared to a binary built from the same merge ref. The job is
`.github/workflows/differential-corpus.yml`; `scripts/dev/diff-corpus-hash.mjs` rejects equal
labels, target mismatches and file-count mismatches instead of treating them as a zero diff.

**Blind spot 25a — the opt-in population.** Only PRs carrying `output-preserving` run this job:
the job condition reads the PR label in `differential-corpus.yml`, and the workflow only
observes source in `crates/rsvelte_core` when it makes its base arm (`git archive "$BASE_SHA"
crates/rsvelte_core`). An output-preserving change in another crate, or a core change whose
author does not request the label, receives no differential measurement. This is intentional:
the ordinary four-target official parity gate covers every compiler change, while forcing a
second full sweep on every docs-only PR would worsen the branch-update queue it is meant to make
evidence robust against. **Evidence [S]:** the label condition and base archive command in
`differential-corpus.yml` are the respective filters.

---

## 27. LSP differential parity — `scripts/compat-lsp/verify.mjs`

**Unit.** The harness sends the same JSON-RPC request id and parameters to the pinned official
language server and rsvelte, normalizes the two results, and records every differing JSON field.
Completion items, diagnostics, locations, folding ranges and inlay hints are paired by a
method-specific semantic identity before their fields are diffed (`diff.mjs`). The committed
fixture population additionally compares rsvelte with the selected upstream expected snapshot.
The real-project population requests hover, definition and completion at every lexically matched
identifier position in the four pinned repositories. Every unit runs its request set twice — once
on the opened document and once after a deterministic round-trip edit (27b) — and the live official
server is additionally held to those same upstream snapshots as a run-level precondition (27h). A
run of one suite alone (`lsp:verify:fixtures`) does **not** compare against the whole ratchet:
`selectKnownForScope` (`ratchet.mjs:114-131`) filters the committed entries to the measured suites,
repositories and shard, so a `NEW` or `stale` reported within that scope is real rather than a
population artefact. What a partial run cannot do is **re-baseline**: `verify.mjs` refuses
`--update-baseline` outright (`:57-60`), and the baseline is merged from the complete
`CORPUS_SHARDS + 1` = 17 artifacts by `merge-current.mjs`, which rejects any other count
(`artifacts.mjs:104`). That refusal's message named "eight corpus artifacts" against a code path
requiring sixteen, so following it gathered half the set and was refused one layer down; it now
derives the count from `CORPUS_SHARDS` rather than restating it.

### Blind spot 27a — server notifications are discarded [S]

`LspProcess.#dispatch` in `protocol.mjs` returns for every message carrying `method`; it answers a
message with an `id`, but stores neither branch when the message has no `id`. Consequently
`textDocument/publishDiagnostics`, progress, log messages and refresh notifications are outside
the comparison even though both servers emit them during the measured session. Pull diagnostics
are compared separately, so this is specifically the push/notification surface.

### Blind spot 27b — closed for `didChange`; the other notification classes remain [D]

The case loop used to send `didOpen`, execute the case's requests, then send `didClose`, so **every
unit in the population — committed fixtures, the upstream suites, the 174 testfiles and the four
repositories — was opened once and never edited.** Both servers declare incremental sync and both
carry per-document state across edits, so a parity defect that only exists after the first edit was
unreachable by construction, at any corpus size, for the same reason warning parity was invisible
until `result.warnings` was captured (#2281). It is also the phase an editor spends almost no time
in: a user opens a file once and edits it for an hour.

Each unit now runs its request set twice. Between the two phases the harness applies a deterministic
edit script derived from the source (`edits.mjs`): an `import` inserted at the end of the first
`<script>` (which moves the TypeScript program, not just the text), a rule inserted at the end of
the first `<style>`, and an **unclosed** `{#if}` appended at EOF, then each of the three removed
again in reverse. Every change is an incremental range on both legs — a full-document replacement
for the undo would restore a server whose incremental apply is broken and hide exactly what the
phase exists to reach — and the final text is asserted byte-identical to the opened text, so the
re-run request set keeps its phase-1 positions and a phase-2 divergence is a state-transition
difference alone.

The phase is in the ratchet key: `|phase=edit`, absent for the opened phase, in both the per-field
fixture key and the corpus `(file, method)` aggregate. Without it an opened-phase entry would
suppress a post-edit divergence in the same `(unit, method)` — the #2521 failure mode, where a
ratchet entry suppressed everything its key could not tell apart.

**What it found is nothing, and the nothing is measured.** The first full sweep merged as 16331 new
and **0 stale** against a baseline written before the phase existed, and matching each edit key to
its opened twin by stripping the phase segment gives **0 edit keys with no opened twin** against 17
opened keys with no edit twin — the 17 being the session-level positive controls, which run once per
session rather than once per unit. So on this population no parity defect exists only after an edit,
and the 0 stale separately confirms no opened-phase key was rewritten by the new encoding. Read the
corpus half of that `0` against 27g: its key records a divergent request **count**, so an edit-phase
divergence at a different position inside an unchanged count is not distinguishable there. The
fixture and upstream halves keep per-field keys and carry the claim without that caveat.

What this does **not** reach, and stays here rather than being dropped from the sentence:

- **The other notification classes.** Configuration changes, watched-file notifications and
  workspace-folder changes are still never sent, and a completion / code-action / code-lens result
  is still never fed into its `*/resolve` round trip.
- **Full-document sync.** Both servers declare `TextDocumentSyncKind.Incremental` and only the
  incremental path is driven. The two may disagree only under full-document changes; that is a
  second phase, not a variant of this one.
- **Steady state only.** The edit script round-trips, so what is compared is whether each server
  returns to the answer it gave from scratch. Two servers that diverge *while* holding a
  genuinely different document — an edit that is not undone — are outside it.
- **One edit script for every unit.** It is uniform rather than per-unit, so a defect needing a
  shape none of the three probes produces is not reached.
- **The population floor still counts the input universe.** `corpus-population.json` records
  identifiers × 3 methods; the compared request count is now twice that, and only
  `report.json`'s `compared` carries it.

The robustness suite (`crates/rsvelte_language_server/tests/robustness.rs`) drives malformed
mid-edits and cancellation, but it is rsvelte-only — it asserts the server survives and cannot see
a state-transition difference from official — so it does not substitute for any of the above.

### Blind spot 27c — two response fields and machine paths are normalized away [S]

`normalizeResponse` deletes `initialize.serverInfo` and pull-diagnostic `resultId` before the
comparison. `replaceUris` rewrites the workspace prefix and the path prefix through
`node_modules`. Version/name regressions in `serverInfo`, result-id stability, and a difference
that exists only in the erased part of either absolute path therefore score equal by contract.

### Blind spot 27d — collected projects run without executing their configuration [S]

`verify.mjs` sets `initializationOptions.isTrusted` to false whenever the corpus suite is selected.
This makes the four-repository sweep reproducible without installing or executing arbitrary
`svelte.config.js` dependency graphs, but it also means a parity defect that requires one of those
projects' preprocessors, aliases or default-language settings is outside that population. Trusted
configuration and preprocess behavior is exercised by committed fixtures instead of the collected
repositories.

### Blind spot 27e — the per-request deadline decided the key, and had to stop [D]

`requestBoth` converts a request that outlives its deadline into a stable transport-error object
and cancels it. That object is then compared like a response, so **the deadline is part of the
measurement**: at the original two seconds, one shard measured 2,304 timeouts in one run and 1,645
in the next, and 201 of its 1,380 entries moved — 201 digests, 145 field counts and **53 divergent
request counts**, with no entry appearing or disappearing. A wall-clock race against a loaded
runner was being written into a shrink-only ratchet, so every later PR would have had to
re-baseline. The deadline is now `--request-timeout-ms` (180 s), far above the response
distribution — at 60 s the whole 1.9-million-request sweep produced 12 timeouts, against ~2,000
per shard at 2 s — and **any** timeout fails the run after the artifact is written rather than
being recorded as an observation. What remains outside the gate is a request that genuinely never
answers: it now stops the sweep instead of scoring, which is louder but still not a comparison.

### Blind spot 27f — the comparison is a property of the installed tree, not only of the sources [D]

The `.svelte.tsx` shadow's TypeScript program reaches the repository root for ambient `@types`, so
which symbols a template-position completion returns — and therefore the counts and digests this
gate writes into its keys — depends on whether the workspace has been installed. Measured on one
commit: the fixture suite yields **4380** ratchet keys with no root `node_modules` and **4397** with
it (`fixtures/completion-at` alone moves from `count=1088` to `count=1095`), a +17-field /
−2-request delta that reproduced exactly between the two CI jobs which ran this comparison in
differently-provisioned checkouts — so only one of them could ever have satisfied the baseline the
other wrote. Both jobs now install and `verify.mjs` refuses to run without it, which makes the
dependence declared rather than latent; the gate still compares one provisioning of the tree, and a
divergence that needs a different dependency graph is outside it.

### Blind spot 27g — inside a corpus `(file, method)`, only the request count is observed [D]

The corpus aggregate key was `divergentRequestCount` + raw field count + a digest over every sorted
`(position, diff pointers)` observation, which reads as full sensitivity. It is not reproducible.
Two complete sweeps of one revision, one language-tools revision and one corpus
(nine artifacts each — taken before `CORPUS_SHARDS` doubled to 16)
revision — measured after 27e removed the deadline race — disagree on **664 of 16,348 keys**: 661
differ in the digest alone and 3 in the field count, while `divergentRequestCount` agrees on all
664. The churn is not spread across methods: `textDocument/completion` owns 661 of the 664 (18.2%
of its 3,632 keys) against **0 of 3,632** for `textDocument/definition` and 3 for
`textDocument/hover`, so what varies is which completion items the two live servers return for the
same position, not the harness. A shrink-only ratchet cannot hold a key that a re-run rewrites, so
the field count and the digest are gone; both sweeps then reproduce the committed baseline with 0
new and 0 stale. **The request count went the same way afterwards** (`ratchet.mjs:47-55`: two runs
ten non-Rust commits apart moved one file's hover count 91 → 90 and 88 → 90, "sensitivity without
direction"), so the key today is `fileId|method|phase` and nothing else — see 27o, which is what
that leaves.

What that removes is real and is not recoverable from any other row: for a `(file, method)` already
listed, a newly wrong field in an already-divergent response, a divergence moving to a different
position, and a simultaneous fix-plus-regression are now all invisible. Only a change in **how many
requests** diverge in that file is observed. The fixture and upstream suites are unaffected — they
still key one normalized field each — so this is a corpus-population blind spot, not a gate-wide
one. The unmeasured question is whether a stable projection of a completion response exists that
would restore per-field sensitivity; nobody has looked, and n=2 sweeps bound the churn only from
below.

**The corollary for anyone shrinking this ratchet: a field that always co-occurs moves the key by
zero.** `isIncomplete` is the measured case. Over 40 completion requests on one corpus file
upstream answers `true` and rsvelte `false` — 40 of 40 — which reads as a one-line fix worth 40
entries. It is worth none: the number of requests whose *only* difference is `isIncomplete` is
**0**, because every one of those 40 also differs in the item set. A second sweep over 50 files
reproduces the shape at scale — `/isIncomplete:value-mismatch` is the fourth-largest of 22 cause
signatures at 404 occurrences, and never appears alone. Under a key that counts *requests*, only
the last divergence in a request is worth anything; a field's own frequency says nothing about
what fixing it buys.

The same 50-file sweep bounds the other direction of this row, and it is the more useful number:
the divergent requests behind the corpus keys fall into **22** distinct
`method | normalized-field-path : kind` signatures, saturating at 16 by the thirteenth file. The
aggregate key is coarse, but what it aggregates is not a long tail — 3,000 sampled requests, 1,447
divergent, 22 causes, of which the top five are all `textDocument/completion` and cover 72%.
Method matters more than file: completion diverges on **98.5%** of its sampled requests against
28.0% for hover and 18.2% for definition. Scope, because the count is a sample: `bits-ui` only,
50 of 617 files, 20 positions per file, and the claim is about the size of the signature *set*,
not about per-file counts.

**And a signature count is not a work estimate until it is turned into a coverage curve**, because
a request is fixed only when *every* signature it carries is. Recording the per-request signature
set over 25 files (1,500 requests, 723 divergent, 21 signatures) and closing them greedily:

| signatures closed | requests fully fixed | share |
|---:|---:|---:|
| 1 (`completion \| / : value-mismatch`) | 231 | 32% |
| 4 | 417 | 58% |
| 6 | 458 | 63% |
| 12 | 707 | 98% |
| 21 | 723 | 100% |

Five of the 21 clear **zero** requests on their own — they only ever co-occur — which is the
`isIncomplete` shape generalised. Read the curve, not the frequency table: the largest single
signature by occurrence (`completion | /items : missing-rsvelte`, 436) clears 8 requests when
closed in greedy order, while the largest by *coverage* clears 231.

**Both sweeps are measured on a population 27m shows is majority-degraded — and re-running one on
a clean population moved almost nothing, which is the part worth recording.** Their file selection
is an evenly-spaced sample of bits-ui's 617 components, so it inherits the repository's
composition: **34 of the 50** signature-sweep files and **14 of the 25** coverage-curve files are
ones upstream cannot project at all. That looked like a reason to distrust the shares. Repeating
the 50-file sweep over only the 217 projectable components says otherwise:

| | mixed (68% degraded) | projectable only |
|---|---:|---:|
| signatures | 22 | **21** |
| divergent / compared | 1447 / 3000 | **1455 / 2994** |
| completion | 985 / 1000 | 951 / 998 |
| hover | 280 / 1000 | 305 / 998 |
| definition | 182 / 1000 | 199 / 998 |

**"The population is degraded" and "the degradation moves this measurement" are two claims, and
only the first was measured when this paragraph was first written.** The second is now measured
and is small. What the degradation does move is the *direction* of a divergence, which the
signature key does record: `official == []` is 1 of 34 definition divergences on two projectable
files against **46 of 61** on four degraded ones.

The clean sweep's greedy curve is the one to plan against, because it concentrates where the mixed
one did not — **three signatures cover 71%**, all of them whole-result rather than per-field:

| signatures closed | requests fully fixed | share |
|---:|---:|---:|
| 1 (`completion \| / : value-mismatch`) | 624 | 43% |
| 2 (+ `hover \| / : value-mismatch`) | 863 | 59% |
| 3 (+ `definition \| / : missing-rsvelte`) | 1033 | 71% |
| 6 (+ `/items` both directions, `/items/@item/tags`) | 1267 | 87% |
| 21 | 1455 | 100% |

Two sub-causes of the third are already excluded by instrumenting the server over 90 requests on
one clean file: the `map_request` early return that answers `[]` without asking tsgo
(`server.rs:1980`) fired **0** times, and of 30 definition responses **21 were empty as tsgo sent
them** with **0** dropped by rsvelte's response mapping. Whether the remaining split is a shadow
position that points at the wrong token or a genuine tsgo/TypeScript disagreement is
**unmeasured**.

### Blind spot 27h — the oracle is calibrated against upstream's snapshots, and the floor is loose [D]

Every positive control this gate had was satisfied by an official server that answers *something*:
a non-error TS hover from each side, one `ts`-sourced rsvelte diagnostic, the declared rsvelte
capabilities. None of them separates a correctly configured official server from one started
against the wrong workspace root, an unresolved `node_modules` or a missing `tsconfig` — a degraded
oracle does not error, it answers differently, and those answers enrol into a shrink-only ratchet
as legitimate entries that then defend the degradation. The 125 upstream snapshots the gate already
loads were compared against rsvelte only, with `officialResult` in scope and unused at the call
site.

The live official server is now compared to the same snapshot, counted per snapshot suite, and a
run below **70%** aborts before the current artifact is written — one verdict per run, deliberately
not a second ratchet. Measured in CI on the pinned revision: **99/125 (79.2%)**, as
`typescript-diagnostics` 72/92, `typescript-folding-range` 13/15, `typescript-inlay-hints` 14/18.

What the floor's looseness buys, and what it costs, is the whole of this row. A live server over
stdio is not upstream's provider-level harness, so the shortfall is structural rather than a
defect, and it is not one cause:

- **`typescript-diagnostics` (72/92).** The pull-diagnostic response aggregates every plugin the
  server hosts, while the snapshot is the TypeScript provider's return value alone — on
  `$$props-valid` the live server adds three `source: "svelte"` `unused-export-let` warnings the
  snapshot cannot contain. The calibration therefore reads the `ts`/`js`-sourced items only, which
  moves this suite from 51/92 to 71/92 on the same tree and is what makes the floor worth having:
  it is the subset a misconfigured TypeScript backend would crater. The residual 20 are message
  text and item-membership differences that come from running every fixture in one server session,
  where upstream constructs one resolver per fixture directory.
- **`typescript-folding-range` (13/15).** Both misses are one extra whole-`<script>` fold
  contributed by the HTML folding provider, which upstream's provider-level test does not run —
  the same two misses, and the same explanation, that a from-scratch harness measured during
  #1767.
- **`typescript-inlay-hints` (14/18).** All four misses are the live server returning `null` where
  the provider returns hints, on `action`, `animation`, `reactive-block` and `snippet.v5`.

**This number is a property of the checkout as much as of the oracle, in a second way 27f does not
cover.** The same commit measures 94/125 in a worktree whose path contains a `+` and 99/125 in CI:
`pathToFileURL` leaves `+` unencoded where the server's `vscode-uri` writes `%2B`, so `replaceUris`
stops matching and four `typescript-inlay-hints` fixtures fail on their own URI alone. The
differential comparison is immune because both servers encode alike; only snapshot-vs-live sees it.
Read a local shortfall against that before reading it as the oracle.

So the floor is set 9 points under a number that three distinct causes already hold well below 100%,
and it cannot see a degradation that costs the oracle less than that margin. It is a precondition
on the run, not a measure of the oracle's quality. Two things it does not cover: the fixture and
corpus populations have no upstream snapshot at all, so **the oracle is calibrated on 125 of the
gate's units and on none of the other ~14,000**; and the calibration reads the pristine document
only — a post-edit phase (27b) is not calibrated, because upstream has no snapshot for one.

### Blind spot 27j — the oracle calibration does not run on the suite that produces two thirds of the ratchet [D]

27h describes a floor the run is held to. It is not held to it on the run that matters most.
`verify.mjs:426` opens `assertOracleCalibration` with
`if (!selectedSuites.includes("upstream-features")) return;`, and
`.github/workflows/corpus-compat.yml:890` invokes the real-world job as `--suites corpus`. The two
jobs are disjoint by construction — `lsp-fixtures-current` runs
`--suites fixtures,upstream-features,upstream-testfiles` (line 812) and no corpus repository, and
`lsp-corpus` runs the 16 corpus shards and no snapshot — so **every shard that measures a corpus
repository skips the calibration entirely**, silently, by an early return rather than by a reported
skip.

The denominator is the whole of why this is a row rather than a footnote. Of the 32,669 baseline
entries, **21,792 (66.7%) are corpus `aggregate:` keys**, against 8,771 `differential:fixtures`,
1,284 `differential:upstream-testfiles` and 822 from the two `upstream-features` populations. So
the population the floor guards is the third that is not enrolling most of the entries, and the
two thirds that are enrol with no check on the oracle at all. A degraded official server in a
corpus shard — the wrong workspace root, an unresolved `node_modules`, a `tsconfig` that did not
load — produces answers, those answers become `divergentRequestCount=<n>` keys, and a shrink-only
ratchet then defends them; the run that would have caught it is a different job.

This is the same failure the floor was added to close, one population over, and it inherits 27h's
own limits: the snapshots exist only for the 125 `upstream-features` units, so extending the
calibration to `--suites corpus` means running that suite alongside — which costs the fixture
job's runtime on every one of the 16 shards — rather than reading anything from the corpus itself.

**Unmeasured:** whether the corpus shards' official servers are in fact degraded. Nothing here
measures that; the claim is only that no instrument in the corpus job would report it.

**Closed.** `calibrationPreflight` drives the 125 snapshots against the official command whenever
`upstream-features` is not among the selected suites, so `--suites corpus` is now calibrated too;
the early return survives only as the guard that stops the suite being measured twice. The estimate
above — that it "costs the fixture job's runtime on every one of the 16 shards" — was wrong by an
order of magnitude: it is 502 requests against a shard's 8,760, and the shards run for an hour.

Two things it cost to make the number mean anything, both measured rather than reasoned. Sending
only the snapshot's own method reproduces **75/92** where the suite reproduces 88/92, because
upstream answers a pull diagnostic before its program has the document; the preflight sends the
case's whole request set. And running it in the measured run's own server *also* reproduces 75/92,
because the snapshots' `checkJs` and `tsconfig` settings come from workspace folders a fixtures- or
corpus-scoped run does not declare (`verify.mjs` adds them only when `upstream-features` is
selected) — and declaring them in the measured run would move the population this gate exists to
compare. The preflight therefore uses a second official process with the workspace an
`upstream-features` run would give it. Measured both ways on the same oracle: **115/125, and the
same ten misses** — the sets are equal, not only the counts. The `typescript-diagnostics` bucket
moves by ±1 between runs, so read the floor as a floor, not as a fingerprint.

**A second precondition covers what the snapshots cannot.** The 125 snapshots say the oracle
behaves like its own test suite; they say nothing about whether it can project the documents *this
run* is about to compare. `projection-preflight.mjs` runs the predicate 27m uses — `svelte2tsx`
with the `parse` and `version` the official server itself resolves — over the run's own case list,
prints `projects N/M`, and aborts above a **5%** ceiling before any request is sent. Measured on
bits-ui: **400/617 fail under 4.2.20 and 0/617 under 5.56.10**; on a 9-component shard the ablated
version check leaves 6/9 (66.7%) and the ceiling fires with the failing ids named. The ceiling is
asserted on the corpus only: the fixture and upstream suites are chosen inputs and include
documents written to be unparseable (45 of 154), so a ceiling there would measure the suite's
intent rather than the oracle's health.

**Which Svelte "the server itself resolves" is decided by the run, and both preconditions used to
measure the other arm.** `importPackage.ts:27-38` puts a document's own directory ahead of the
server's whenever `isTrusted`, and `verify.mjs` sends that false only for `corpus` — so on
`fixtures` / `upstream-*` the server loads the Svelte of the *worktree*, while the version line and
the projection preflight both resolved from beside the server script. The printed
`resolves svelte X from Y` therefore named a package a trusted run never loads, and read as
evidence that `pin-official-svelte.mjs` had taken effect. Measured: an A/B whose only variable was
that symlink (4.2.20 vs 5.56.10) over `fixtures,upstream-features,upstream-testfiles` produced
artifacts differing **only in `generatedAt`** — all 2138 keys and every count byte-identical —
while forcing `isTrusted: false` on `fixtures` alone moves **122 of 290 keys** (68 / 54 by
direction). Both preconditions now resolve per document through `svelteForDocument`, and the
version line reports the set. What it still cannot see: a run whose documents span workspaces
pinning different Svelte majors is reported, not rejected, below the 5.x floor.

### Blind spot 27l — the corpus repositories are never installed, so two thirds of the ratchet is measured on unresolved imports [D]

`verify.mjs:303-308` names the hazard in a comment — "a server started against the wrong
workspace root or an unresolved `node_modules` answers differently instead of failing, and those
answers would then be enrolled as legitimate ratchet entries defending the degradation" — and adds
the calibration floor as its defence. 27j records that the floor does not run on `--suites corpus`.
This row records that for that suite the named condition is not a risk but a **guarantee**.

`corpus-compat.yml:859` checks the four corpus repositories out with
`git submodule update --init --depth 1` and nothing installs them; the job installs the root
workspace and `submodules/language-tools` only (lines 869-875). `lsp-benchmark.yml:52-54` does run
`pnpm --dir submodules/bits-ui install`, so the contrast is inside this repository: the job that
measures *speed* on bits-ui installs it and the job that measures *parity* does not.

Measured on `navigation-menu.svelte` with the same servers and `initialize` parameters the gate
sends, `textDocument/diagnostic` returns:

```
official: 1  — ts/-1 46:2 Unexpected character '@'
rsvelte:  5  — ts/2307 1:37  Cannot find module 'svelte-toolbelt' …
                ts/2307 4:26  Cannot find module '$lib/internal/create-id.js' …
                ts/2307 5:22  Cannot find module '$lib/internal/noop.js' …
                ts/7006 27:4  Parameter 'v' implicitly has an 'any' type.
                ts/7006 38:4  Parameter 'v' implicitly has an 'any' type.
```

`svelte` itself resolves — TypeScript walks up to the checkout's own root `node_modules` — so the
population is not uniformly typeless; it is a mixture in which every bare specifier the corpus repo
declares for itself, and every `$lib/*` alias its own `tsconfig` would supply, is missing. What the
corpus units therefore compare is largely **how the two servers behave on symbols neither can
resolve**, which is a real comparison but not the one the gate's name implies. On six shard-0 files
the largest remaining hover class is 42 requests where upstream answers TypeScript's
unresolved-alias quick info — ` ```typescript\nimport boxWith\n``` ` — and tsgo answers nothing.

**Unmeasured:** how the composition moves once the repositories are installed. Nothing here says
the divergence count falls; it says the population changes, and a class that is 42 of 184 on this
tree is not evidence about a tree with `node_modules`. Installing them also changes the ratchet
keys, which is why this is a row rather than a patch.

### Blind spot 27m — the uninstalled corpus makes upstream parse Svelte 5 with Svelte 4, so on 40.6% of the ratchet the oracle never sees a template [D]

27l records that the corpus repositories are not installed and reads the consequence as
*unresolved imports*. The larger consequence is one step earlier, and 27l's own diagnostic dump
already contained the witness it did not name: `ts/-1 46:2 Unexpected character '@'`. Code `-1` is
`DocumentSnapshot.ts:284`, the `parserError` upstream sets when **`svelte2tsx` throws**, and
`Unexpected character '@'` is Svelte 4's parser refusing `{@render}`.

The chain is four citations. `service.ts:379` resolves the Svelte compiler with
`importSvelte(tsconfigPath || workspacePath)`; `importPackage.ts:60` falls back to the language
server's own dependency when the linted path has no `node_modules/svelte`; that dependency is
`svelte: ^4.2.19` in `language-tools/pnpm-lock.yaml`, resolved to **4.2.20**, and CI installs it
`--frozen-lockfile`; the resolved `parse`/`version` reach `svelte2tsx` through `service.ts:429` and
`DocumentSnapshot.ts:241`. When it throws, `DocumentSnapshot.ts:291` replaces the projection with
`text = scriptInfo.content` — **the instance script alone, no template** — and every completion for
that document is then built with `isIncomplete: true` (`CompletionProvider.ts:451`), or is
`CompletionList.create([], true)` where TypeScript has no entries (`:303`).

Measured over the whole aggregate population, classifying each key's file by the same predicate
`DocumentSnapshot` uses:

| repo | keys on a file upstream cannot project | / keys | divergent requests behind them | / requests |
|---|---:|---:|---:|---:|
| shadcn-svelte | 3,870 | 10,080 (38.4%) | 459,382 | 958,698 (47.9%) |
| flowbite-svelte | 2,436 | 7,758 (31.4%) | 370,690 | 761,648 (48.7%) |
| bits-ui | 2,400 | 3,696 (64.9%) | 267,346 | 416,918 (64.1%) |
| melt-ui | 150 | 258 (58.1%) | 25,810 | 46,812 (55.1%) |
| **total** | **8,856** | **21,792 (40.6%)** | **1,123,228** | **2,184,076 (51.4%)** |

No key had an unresolvable file. The positive control is the same `svelte2tsx` call with `parse`
from Svelte 5.56.10: **1,476 of the 3,637 corpus components throw under 4.2.20 and 0 throw under
5** — the files are fine, the oracle is not. On `label-demo.svelte` all 40 completion requests
reduce to this one cause: 22 where upstream returns a list and rsvelte returns `null`, 18 where
only `isIncomplete` differs.

This is not an upstream defect. svelte-language-server supports Svelte 3/4/5 and falls back
deliberately, expecting the user's project to carry its own compiler. It is a **gate setup**
defect: the oracle is configured the way no real project is.

**Unmeasured, and deliberately unsigned:** whether installing the repositories lowers the
divergence count. It replaces the population — the ratchet keys turn over completely and rsvelte's
real defects on those 1,476 files become visible for the first time. The remaining 12,936 keys, on
files upstream does project, are the part of the residue this row says nothing about.

**Closed by pinning the oracle's own Svelte, not by installing the corpus.** Installing the
repositories cannot fix this at all under the configuration the gate uses: `importPackage.ts:29-31`
pushes the linted project's directory onto the resolution paths only `if (isTrusted)`, and the
harness initializes with `isTrusted: false`, so a `node_modules/svelte` inside a corpus repository
is never consulted. `scripts/compat-lsp/pin-official-svelte.mjs` relinks
`language-server/node_modules/svelte` at the Svelte this repository's own lockfile pins, and
`verify.mjs` refuses to run against a major below 5, printing the version and the path it resolved.
Nothing is installed and no project code runs. Measured on `bits-ui` with the same predicate this
row uses: **400/617 files fail to project under 4.2.20 and 0/617 under 5.56.10**, and the aggregate
divergent-request count over the four repositories falls 3,906 → 2,324 (−40.5%). Read the second
number carefully: **no unit leaves the gate** — 40 of 54 are re-keyed to a lower
`divergentRequestCount`, so the numerator is requests, never units.

Two field-level consequences are worth keeping, because the aggregate count cannot express either.
`diff.mjs:16` buckets a completion item by `[label, kind, sortText, filterText]`, and
`HTMLPlugin.ts:239` sets `sortText` only when `document.isSvelte5`: under 4.2.20 the oracle omits it
on every legacy `on:` item, so those items **never pair** and not one of their other fields is
compared — shared labels at `<div on` go 14 → 29 when the oracle resolves 5. And Svelte 5's own
`*.svelte` ambient declaration names its default export `Comp` (`svelte/types/index.d.ts`), which
4.2.20's does not, so an auto-import rsvelte correctly offers reads as an extra item under the
degraded oracle.

### Blind spot 27i — a diagnostic's severity is unobservable, and lint findings are never paired at all [D]

`diff.mjs:19` keys a diagnostic on `digest([value.code, value.source, value.range?.start])`. The
string `severity` does not occur anywhere in `diff.mjs`, and no `/severity` key exists in the
baseline's 32,673 entries: **a rule that changes severity on both sides, or on one, moves nothing
here.** This is worth stating because severity is not cosmetic — it decides `rsvelte-lint`'s exit
code (gate 33), so the one field that makes a lint finding fail a build is invisible to the gate
that compares the servers emitting it.

`source` being *in* the key removes the lint population a second way. rsvelte tags its lint
diagnostics `source: "rsvelte"` (`code_actions.rs:476`), a string official never emits, so every
such finding hashes to an identity with no counterpart and is reported as
added/removed rather than compared field by field. Nothing about a paired lint finding — severity,
message, end position — is ever observed by this gate.

This row exists because a re-baseline was justified by the opposite claim. The 64-for-64 swap in
`54109fd99` attributes 48 entries to "the severity itself"; it cannot be, by the key above. The
entries are correct and the reasoning was not: **60 come from the parse-error span/message change
in `crates/rsvelte_lint/src/validator.rs`** — the identity moved off `{parse-error, svelte, 0:0}`
onto real positions — and **4 from the `no-dupe-on-directives` start-tag fix**. An unchanged entry
count with changed hashes says the identity moved, and says nothing about which field did it;
inverting the hashes is what answers that.

### Blind spot 27k — a net shrink is not "nothing was added": the key carries a content hash [D]

Every key ends in `[count=…,hash=…]` (or `[official=…,rsvelte=…]`), so **the same divergence
gets a different key whenever its content changes**. A re-baseline that improves a response
without eliminating the divergence therefore retires one key and enrols another, and a reader
diffing the JSON sees an addition that is indistinguishable from a regression.

Measured on the `20114f183` re-baseline (`origin/main` → that head), which CI accepted with all
17 artifacts green:

| | keys | units (key with the trailing `[…]` stripped) |
|---|---:|---:|
| main | 32,669 | 32,669 |
| head | 32,441 | 32,441 |
| removed | 486 | of which **254** are units still listed |
| added | 258 | of which **254** are units already listed |

So `-228` decomposes as **232 units eliminated and 4 units genuinely new** — and the 4 are one
defect (`textDocument/diagnostic` message, two files × two phases, one `official`/`rsvelte` hash
pair). **98% of the churn in that re-baseline is the same unit with different content**, which is
why the key-level diff cannot be read as a verdict.

Two consequences. **A shrink-only ratchet is shrink-only in its key count and says nothing about
its composition**: `--update-baseline` writes what it measures, so a newly-broken unit enrols
silently as long as more units left than arrived. And **the correct instrument is a set difference
over units, not over keys** — strip the trailing bracket, then diff. Every re-baseline of this
ratchet should publish the four numbers above, because a net shrink with a new unit inside it is
exactly what the gate is meant to catch and exactly what it reports as a pass.

This is the general form of the last paragraph of 27i, which observed that an unchanged entry
count with changed hashes says the identity moved. The same is true of a *changed* count: the
count is the sum of two movements and names neither.

### Blind spot 27n — the edit phase never asks a question of the document it broke [D]

`edits.mjs:14` inserts an **unclosed** `{#if __rsvelte_lsp_probe}` and says why: "Unclosed on
purpose: the repair path is only exercised if the intermediate document is one neither compiler
accepts." That intermediate document is never asked anything. `verify.mjs:744-765` sends every
change of `editChanges(text)` first and calls `compareRequestsBounded` only after the loop, and
the script's last change restores the source byte for byte — so both phases compare **the same
parseable document**, and the phase-2 key differs from its phase-1 twin only by server state.
The gate has no view of a mid-edit document's *answers*, which is the state a real editor is in
whenever completion matters.

**Evidence [D].** `ProjectionEngine::project` on five shapes, same options as the LSP overlay:

| source | result |
|---|---|
| `<p>{b.x}</p>` | Ok |
| `<p>{b.}</p>` | `Err(Parse { js_parse_error, span (57,57) })` |
| `<p class={b.}></p>` | `Err(Parse { js_parse_error, span (63,63) })` |
| `<p>{b</p>` | `Err(Parse { js_parse_error, span (58,58) })` |
| `b.` inside `<script>` | Ok |

So the failure is **template-position only** — a half-typed member expression in a `<script>`
body still projects — and upstream recovers from all five through acorn-typescript. Every
tsgo-backed answer in a document whose template is mid-edit is therefore dead here and live
upstream, and **the ratchet cannot hold a single entry for it**.

**Scope, because the next reader will reach for the wrong rule.** AGENTS.md's "do not loosen the
compiler parser to match `svelte-eslint-parser`" is about the **compiler**, whose population is
published code that compiles — 0 of 6,788 real-world sources reach that divergence. This row is
about the **projection's error recovery**, whose population is a document being typed, where a
half-written expression is the normal case rather than an adversarial one. The two rules point
opposite ways on the same-looking input, and only the population separates them.

### Blind spot 27o — the corpus half cannot report a NEW, because it is saturated and its key carries no divergence [D]

Two facts compose into one. The aggregate key is `aggregate:${fileId}|${method}${stage}`
(`ratchet.mjs:55`) — after 27g removed the digest, the field count and finally the request count,
it carries **nothing about the divergence**. And the corpus population is saturated: of 3,637
`.svelte` files across the four pinned repositories, **3,632 diverge**, and the five that do not
are **0 bytes**.

| repository | files | diverging | share |
|---|---|---|---|
| bits-ui | 617 | 616 | 99.8% |
| flowbite-svelte | 1,296 | 1,293 | 99.8% |
| melt-ui | 43 | 43 | 100.0% |
| shadcn-svelte | 1,681 | 1,680 | 99.9% |
| **total** | **3,637** | **3,632** | **99.9%** |

Read off the committed ratchet rather than from a sweep: its 21,630 `aggregate:` keys cover
exactly **3,632 distinct file ids**, 3,551 of them carrying 6 entries (three methods × two
phases) and 81 carrying 4. So **every non-empty corpus component already holds an entry for every
`(method, phase)` the harness sends**, and any new divergence anywhere in that population — of any
field, of any severity, in any response — is suppressed by a key that is already listed. The only
direction the corpus half can move is a `(file, method)` becoming *entirely* clean.

This is not an argument that the aggregate key is worthless: a per-identifier key was rejected
because it produces a six-figure file, this is the granularity that replaced it, and it is what
makes the shrink direction work at all. It is an argument about what a green run **means**. On
this half, green is not earned, it is guaranteed. The 2,116 `differential:` / `expected:` keys —
**8.9% of the ratchet** — are the only ones that carry a divergence pointer, and therefore the
only ones with live discriminating power.

**Evidence [D]:** the file counts and the key distribution above are measured; the suppression
follows from the key's own definition at `ratchet.mjs:55`.


### Blind spot 27p — a rejected request and an unchanged document are the same empty response [D]

`on_formatting` answers a params deserialization failure with `respond_no_edits`
(`server.rs:736-742`), and `worker.rs:659` states the same rule for the pass below it —
"Formatting is never an error to the client: a failure yields no edits". So four distinct
outcomes — the session has no formatter config, the formatter panicked, the formatter errored,
and the document was already formatted — all reach the client as `[]`. The ratchet key records
the response, so **it cannot say which of the four produced it**, and a malformed request is
indistinguishable from agreement about a document that needs no change.

That is not hypothetical here: the harness's own `textDocument/formatting` request omits
`options`, which `lsp-types` declares without `#[serde(default)]`
(`DocumentFormattingParams`, `formatting.rs:27-33`), because `suites.mjs:150-179` adds extra
params only for `completion` / `hover` / `linkedEditingRange` (position), `selectionRange`
(positions) and `codeAction` (range + context). Measured against the debug server on the ten
`plugin-format-*` fixture documents' text:

| request | response | stderr |
|---|---|---|
| `{textDocument}` — what the gate sends | `[]` | ``textDocument/formatting: missing field `options` `` |
| `{textDocument, options}` | one edit, `newText: "unformatted\n"` | — |

The twenty `differential:fixtures/plugin-format-*|textDocument/formatting` entries therefore
measure the harness, not the compiler, and their recorded payload confirms it: the entry's
`hash=f411dae2ecdd` is `digest(["item-" + digest(edit)])` over official's single edit, and
recomputing that chain from the *measured rsvelte* edit reproduces `f411dae2ecdd` exactly — so
the two edits are byte-identical and supplying `options` retires all twenty rather than
converting them.

**The key describes a measurement that was not performed.** A ratchet key carries a `|line:col|`
segment — `documentHighlight`'s read `|0:13|`, `|0:24|`, `|0:9|`, `|0:2|`, `|1:4|` — and that
segment is `request()`'s third argument, a **label**, not the `position` that went on the wire.
`suites.mjs` adds a real `position` for `completion` / `hover` / `linkedEditingRange` only, so
every `documentHighlight` unit states a position it never asked about. This is worse than the
formatting case: an empty response merely fails to distinguish four causes, whereas a key naming
a column actively misleads whoever reads it. `prepareRename` (4 cases) and `colorPresentation`
(3) are the same defect one step further — each declares a `params` object in the fixture
manifest that `suites.mjs` reads at three sites, all inside the `codeAction` branch, so those
declarations are never sent either. **Both hold zero ratchet entries, and that zero is not
coverage**: two servers that both return nothing agree, so an empty bucket here is a statement
about the population, not an observation about the mechanism.

**And the ten formatting fixtures cannot express the axis they were written for.** Their
document is `entry.source` verbatim, which for all ten is the eleven bytes `unformatted` — one
word. Upstream's ten tests differ only in `expected.engine` (`prettier-config`,
`prettier-plugin`, `prettier-fallback`, `prettier-options`, `user-prettier-v2`,
`user-prettier-module`, `builtin-prettier`), i.e. which Prettier resolution path is taken; but
every engine formats a single word to itself plus a newline, and the digest above shows official
and rsvelte producing byte-identical edits. So repairing `options` makes these ten *agree*, and
they will still measure nothing about Prettier-versus-native. Reaching a decision point is not
being able to tell two rules for it apart.

**Evidence [D]:** the two responses and the stderr line are one measured probe against
`target/debug/rsvelte-language-server`; the digest reconstruction is arithmetic over the
committed ratchet; the label-versus-parameter claim is read off `suites.mjs:150-192`. A rate
table over "does the harness supply this method's required params" was computed and is **not**
reported, because it does not discriminate — `formatting` and `documentHighlight` are 100% while
`colorPresentation` and `prepareRename` are 0% in the same group, and those two zeroes may be
empty denominators rather than agreement.

### Blind spot 27q — the cache cleanup spares exactly the caches that matter [D]

`rsvelte-language-server` digs an overlay cache at whatever project root it is pointed at
(`CACHE_DIRECTORY = ".rsvelte-language-server"`, `tsgo_overlay.rs:26`), and this gate points it at
fixtures inside the pinned `submodules/language-tools`. The harness does clean up: `verify.mjs`
snapshots the caches that exist before the run and, in a `finally`, deletes the ones that appeared
(`verify.mjs:1120-1135`, `removeNewServerCaches`). A completed run therefore leaves the submodule
byte-clean — measured, 5 created and 5 removed, `git status --porcelain` empty afterwards.

**The gap is that it deletes only the caches it created.** One that is already present when the run
starts is classified as pre-existing and spared — by every subsequent run, permanently. So a cache
that survives once, because a run was interrupted or aborted between creating it and reaching the
`finally`, is never collected again. That is not hypothetical: one checkout carried a `tsgo/` two
days older than the run that noticed it, while another was clean, and the difference was whether a
run had ever been killed part-way.

Keying cleanup to *what this run created* rather than to *what this directory should contain* makes
the leaked set *self-perpetuating*, and that generalizes past this cache. Its size scales with the
number of **aborted** runs, not with the number of runs — and an aborted run is likeliest exactly
when someone is changing something, so the moment that produces a survivor is the moment its
staleness matters most.

A survivor is not inert. `build` (`tsgo_overlay.rs:222-258`) calls `create_dir_all` on the shadow
directory and **never clears it**, rewriting a shadow per `.svelte` it finds — so a shadow whose
source is gone, renamed, or no longer discovered simply stays. And the generated tsconfig includes
that directory by **glob**, `"include": ["svelte/**/*", …]` (`write_tsconfig`,
`tsgo_overlay.rs:963-1001`), so whatever remains is in the next run's program. Nothing in the path,
the file names or the config records which binary produced them, and there is no `tsBuildInfoFile`
in this crate (grep returns none; positive control: `rootDirs` is present). **A measurement taken
after changing the binary can therefore read a projection the previous binary wrote** — the input
side of the rule that an artifact's name, path and branch never establish what it is.

Delete any surviving cache before measuring across a binary change, and treat "does the answer move
when it is deleted" as its own measurement.

**Evidence [D]:** the create-and-remove counts, the empty `git status` after a completed run, and
the globbed `include` are read from one run's own output; the spare-the-pre-existing rule from
`removeNewServerCaches`, and the never-cleared and not-binary-keyed properties from `build` and
`write_tsconfig`. **Unmeasured:** whether a stale shadow has ever actually changed a recorded
answer here, and whether the corpus suite writes the same cache — only the fixture suite was
observed. And a count of zero untracked directories proves nothing on its own: it is equally what a
checkout shows *before* a run reaches its first fixture, which is how this was first reported as
reproducing on one machine and not another.

### Blind spot 27r — `hash=` names two different quantities, and the field saying which is stripped [D]

Every key `diff.mjs` produces carries `hash=<12 hex>`, and whether that digest can be turned back
into a value depends on which of two branches wrote it.

| branch | what is hashed | preimageable |
|---|---|---|
| field (`diff.mjs:98-100`) | `digest(left[key])` — the value itself | yes |
| element (`diff.mjs:76-83`) | `digest(keys.sort())`, whose members are `item-${digest(value)}` (`:32`) | no — a digest of digests |

Measured both ways on one method. `…/resolveProvider:missing-rsvelte[hash=b5bea41b6c62]` came back in one
step as `digest(true)`, which is what establishes that official declares `resolveProvider: true`
and rsvelte omits it. The nine `textDocument/codeAction|:extra-rsvelte[count=1,hash=…]` entries
return nothing at any depth, so the nine actions behind them can only be had by running both
servers on the nine fixtures.

The suffix naming the branch does not reach the ratchet: `verify.mjs:462` strips
`-element` / `-field` deliberately, so that respelling the classifier's labels does not
staleify every committed entry at once. That is a defensible trade, and it leaves a ratchet
reader with no explicit statement of which quantity they hold. What survives is `count=`,
written only on the element branch — so **a key carrying `count=` has an unrecoverable hash and a
key without one is preimageable**, and that is the entire rule.

Read the ratio before concluding the hash is useless: **1,880 of 23,746 committed keys carry
`count=`, so 92.1% preimage.** The default should stay "try it"; what the rule buys is knowing
which 7.9% will not answer, rather than a reason to stop asking.

`diff.mjs:71-74` states the opposite: "The ratchet key keeps the suffix and drops the bracket,
so the kind survives and the amount does not." Both halves are inverted against `verify.mjs:462`
and against every committed key (`:extra-rsvelte[count=1,hash=…]` — no suffix, bracket present).
**A comment describing what a downstream stage does with a value is checked by nothing that reads
either file**, and this one is why a table of nine code-action titles was priced as arithmetic
rather than as a measurement.

**Evidence [D]:** the successful preimage of `b5bea41b6c62` and the structural impossibility for the
element branch are both read off `diff.mjs`; the stripped suffix from `verify.mjs:462`; the inversion
from comparing that line and the committed keys against `diff.mjs:71-74`. **Unmeasured:** whether any
other gate's keys carry the same two-meaning `hash=` — only this gate's were read.

### Blind spot 27s — a manifest records a prediction pointing the opposite way from the measurement beside it [D]

Two `textDocument/codeAction` fixtures in `upstream-fixture-manifest.json` (`code-action-anchor-add`,
`code-action-anchor-rel`) carry a `native_expected` listing **fewer** titles than `expected`, and a
`difference_reason` reading "rsvelte does not derive the noreferrer edit from the upstream
whole-element diagnostic range." That predicts rsvelte omits one of official's actions, which
would surface as `missing-rsvelte`.

The ratchet records the opposite. Both fixtures hold exactly two entries, both
`:extra-rsvelte[count=1]`, and no `missing-rsvelte` at all — rsvelte reproduces every one of
official's actions and adds one. The same holds for all nine codeAction fixtures across both
phases: 18 entries, every one `extra`, `count=1`.

**`native_expected`, `difference_reason` and `upstream_suite` are read by nothing under
`scripts/`** (0 hits; positive control: `upstream-fixture-manifest` itself hits `suites.mjs`). So the
prose is a hypothesis no gate evaluates.

It was **not** true and then overtaken. `git log -S` gives two commits touching those fields, and
the ratchet at each — including the commit that **introduced** them — already read `extra`, never
`missing`. The extra action's content did move over that span
(`hash=6d3d83633239 → e27600e1864d`); its **direction** never did. Read the scope exactly: within
the window version control can observe, the prediction was never true. It may have been written
against an uncommitted local measurement, which the history cannot settle.

This is one step past "reason is not attribution". There the prose fails to say *where* a
divergence is answered; here the prose asserts a *direction*, the direction is false, and the
field is unread, so nothing can register the contradiction — including the person who later
fixed the content while leaving the sentence.

The repair is to read the field, not to delete it: a unit whose `native_expected` declares fewer
titles than `expected` must carry a `missing-rsvelte` entry, which is mechanically checkable.
Deleting the prose removes the contradiction and also removes whatever would stop the next
person writing the same prediction.

**Evidence [D]:** the entry counts and directions are read from the committed ratchet at three
revisions via `git grep <rev>`; the unread-field claim is a grep with a stated positive control.
**Unmeasured:** what the extra action actually is in each of the nine fixtures — see 27r for why
that needs a run rather than a preimage. Two more were: `severity` and `diagnostic_source`, in
the same object — see 27t.

---

### Blind spot 27t — upstream's own test does not exercise the condition it names, and a faithful transcription inherits the hole [S]

`code_actions.rs:279-284` gates an ignore action on four conditions, one of which is
`diagnostic.severity != Some(DiagnosticSeverity::ERROR)`. Upstream's counterpart
(`getQuickfixes.ts:189-197`) opens with `code && …`, and the upstream test that names this
condition — `getCodeAction.test.ts:89`, `it('if diagnostic is error')` — sends
`severity: DiagnosticSeverity.Error` and **no `code`**. The first conjunct is already false, so
`[]` is returned before severity is read. The test passes whatever the severity rule is.

The fixtures suite transcribes that test faithfully, so **the severity guard is exercised by
nothing here**, and the transcription's own faithfulness is what reproduces the gap: a case that
sends `severity: error` *with* a code would discriminate, and it does not exist upstream to
transcribe. This is one level past a grid that holds one of the oracle's properties fixed — there
the grid's author chose the constant; here the oracle's coverage hole is copied exactly *because*
the copy is accurate.

It cannot be repaired inside this suite. `suites.mjs:145-148` builds the fixture cases from
`manifest.behavior_cases` alone, `upstream_fixture_manifest.rs:189` asserts that each suite's
behavior-case names equal the **multiset** of upstream's `it()` call-site names (` [...]` suffix
stripped), and `unit_coverage.unported_it_call_sites` is `0` — so there is no unported `it()` to
attach a case to, a new name breaks the assert, and a second ` [variant]` of an existing name
breaks it on the count. Reproducing that comparison independently, with the current tree as a
positive control, gives `EQUAL true` now, `false` for a new name and `false` for an extra
variant. The assert is working as designed: it is what makes this suite a transcription rather
than a mixture, and mixing rsvelte-authored cases in would also stop it detecting an unported
upstream test. The axis therefore needs a case list the multiset assert does not cover.

Two sibling fields of the same manifest object were **declared and read by nothing**:
`severity` (12 of the 14 codeAction entries declare it; the string does not occur anywhere in
`scripts/compat-lsp/**/*.mjs`) and `diagnostic_source` (12 declare it; the harness hardcoded
`source: "svelte"`). Both are read now. Reading `diagnostic_source` is a discriminating case —
it retires exactly the two `code-action-foreign` entries, with `cases`, `compared`, `skipped` and
all three oracle-calibration ratios identical across the two arms — while reading `severity`
moves nothing, for the reason above.

**Evidence [S]:** the condition order is read from `getQuickfixes.ts:189-197` and
`code_actions.rs:279-284`; the absent `code` from `getCodeAction.test.ts:89`; the closed
population from `upstream_fixture_manifest.rs:189` plus `unit_coverage.unported_it_call_sites`,
with the multiset comparison reproduced independently and controlled in both directions. The
`diagnostic_source` half is **[D]** (−2 entries, 0 new, denominators unmoved). **Unmeasured:**
whether the severity guard's four conditions agree with upstream's three on any input at all —
`is_compiler_code` has no upstream counterpart and is tracked separately — and whether the other
`textDocument/*` methods' manifest params carry further unread fields.

## 1. Compiler output parity — `scripts/compat-corpus/verify.mjs`

**Unit.** For each of ~14,025 manifest entries × 4 targets (`client`, `server`, `client-dev`, `server-dev`,
`targets.mjs:21-51`): the generated JS text, blank-line-stripped (`verify.mjs:289-290`),
template-hole-flattened and oxfmt-normalized (`verify.mjs:247-257`). Where bytes differ, the
verdict comes from the Rust comparator `ast_equiv_batch` (`verify.mjs:301-316`). CSS is
compared byte-exactly, and only for targets with `css: true` (`verify.mjs:367-374`).

### Blind spot 1a — comments, on 100% of the corpus

`verify.mjs:310` invokes the comparator with **empty argv**:

```js
const out = execFileSync(AST_EQUIV_BIN, [], { ... });
```

`ast_equiv_batch.rs:54-56` selects `CommentPolicy::Ignore` in the *absence* of `--comments`,
so the binary's effective default inverts the library default (`ast_equiv/src/lib.rs:42-43`,
`Meaningful`). Under `Ignore` the comment vector is empty (`lib.rs:161-173`) and annotation
printing is off (`lib.rs:186`), so `/* @__PURE__ */` stops being a code difference too.

Because `verify.mjs:292` byte-compares first and only defers *byte-different* pairs to the
comparator, a divergence living **only** in comments is byte-different, AST-equivalent, and
scored a pass — for every entry, on every target.

**Evidence [D].** `flowbite-svelte/src/lib/utils/singleselection.svelte.js` differs by hand
(official drops a `@type {symbol}` JSDoc, rsvelte keeps it) while `known-failures.client.json`
does not list it. Positive control: `command grep -rna -- "--comments"` across `scripts/`,
`.github/`, `package.json`, `crates/` returns two hits, both inside `ast_equiv_batch.rs`
itself. No caller passes it.

**Second, narrower cause.** `compile.mjs:76-83` `prepareSource` runs `.svelte.ts` entries
through `esbuild.transformSync({loader:'ts'})`, which drops every non-legal comment before
either compiler sees the file — 299 of 437 module entries (#2424). Verified locally:
`transformSync("// c\nexport let x = 1; /* b */\n//! legal\n")` returns
`"export let x = 1;\n//! legal\n"`. This is the *narrower* cause; fixing it alone buys zero
observability while 1a stands.

**Second discriminating case [D], from the wave-2 enrolment.** A multi-line JSDoc on an
instance-script statement comes out with the source's own inner indentation *and* the
enclosing tab — `\t\t   * @template` where official prints `\t * @template`. Upstream's
`onComment` dedents a block comment by its opener's line indentation; rsvelte's client path
reaches `rsvelte_esrap`'s port of that rule (`printer.rs: dedent_block_comment`) with the
statement text already trimmed at the front, so the opener sits at column 0, the computed
indentation is empty, and nothing is stripped. `carbon-components-svelte/src/Button/Button.svelte`
reproduces it and is not listed in `known-failures.client.json`. It is invisible to gate 1 for
the reason above, and to gate 20 (formatter parity) because the oxfmt oracle re-aligns a JSDoc's
` * ` lines on both sides. Unlike the fenced-backtick defect (gate 26), the indentation it
produces is *uniform*, so the round-trip gate cannot see it either — no gate here observes it
today.

**Third discriminating case [D], and the corollary that reads a ratchet.** A JSDoc cast around
a private field read — `return /** @type {number} */ (this.#x);` in an instance script — is
byte-different from official before #4096 (`return (/** @type {number} */ $.get(this.#x));`
against `return $.get(/** @type {number} */ this.#x);`) and comes back **`equivalent`** from
the comparator, so the gate scored it `match` on both arms. The class #4096 exists to fix was
never gate-visible, on any corpus size.

The corollary is what makes this worth re-reading: **an output ratchet cannot hold a
"comment placement" cluster**, because an entry that reaches it is by construction not
comment-only. Measured against a cluster of nine `known-failures.client{,-dev}.json` entries
grouped as `comment-attachment` (the key was "a comment appears within six lines of the first
differing line"): all 16 non-matching `(id, target)` cells come back **`code-differs`** with
comments ignored, and the nine mechanisms are an each-block item read through a signal instead
of a callback parameter, a lost `deep_read_state`/`untrack` wrapper, `$$props` where official
reads `$$sanitized_props`, a `$.prop` default emitted as a `19`-flagged thunk instead of a
`3`-flagged literal, an ownership-validator wrapping its argument instead of the call, a
double-applied store call and a missing `$.get` — **none of them a comment**. CSS was compared
too, on the same pairs and by the gate's own rule (raw bytes, no oxfmt): **0 of 18 cells
differ**, with six of the nine carrying non-empty CSS, so the attribution is not resting on an
empty comparison. `firstDiffLine` reports where a *line* first differs, so a comment that
shifts lines becomes the face of a divergence it did not cause.

**Tracked:** #2424, PR #2436. **Closing it** requires rsvelte preserving comments *plus*
`--comments` here — a compiler change, not a harness one. Note that even
`CommentPolicy::Meaningful` filters JSDoc `@type` as prose (`lib.rs:259-269`), so flipping the
flag does not close the flowbite case.

### Blind spot 1e — a redundant semicolon, on 100% of the corpus

`verify.mjs` normalizes both trees with oxfmt before comparing, and oxfmt deletes an
empty statement. So `export default class C { … }` vs `export default class C { … };` —
and `}` followed by a separately-printed `;` vs `};` — compare equal on every entry,
on every target.

**Evidence [D].** #3069: upstream prints a module's default-exported class through esrap's
expression path and terminates it with `;`; rsvelte did not, for any class, runes or not.
`compileModule('export default class Outer { n = 0; }')` differed raw on `client` and
`server`, and the corpus gate scored the same file `match`. What reported it is the
**mutation-fuzz** gate (#8 below), whose normalizer removes only comments, whitespace and
trailing commas — it listed 8 entries for this one cause, all of which passed once the
terminator landed.

The general form is worth stating separately from the instance: **the corpus gate's
normalizer is a strictly stronger eraser than the mutation gate's**, so any divergence
oxfmt absorbs is visible to the mutation gate alone — and the mutation gate only sees a
seed it has a mutant for. A shape that no corpus file contains is therefore invisible to
both, which is what the pattern corpus is for.

**A second [D], because the erased statement is sometimes the WHOLE divergence rather than a
terminator.** #3231: upstream removes a non-dev `$inspect(...)` by replacing the CALL with an
empty statement and keeping the `ExpressionStatement`, so it prints `;;`; rsvelte's
`.svelte.(js|ts)` module pipeline deleted the statement outright. Raw, that is a divergence on
every module carrying the rune — and oxfmt deletes both sides' empty statements, so gate #1
**and** gate #5 (which normalizes identically, by contract) score `match`. Gate #5 reaches the
shape by construction: `removed-statement-comment` crosses `$inspect` against 6 comment kinds ×
3 hosts and has 396 cases, and every non-dev module row of it was green throughout. The defect
was found by a hand-built `compileModule` grid comparing **raw** `js.code`. So the row is not
only "a redundant terminator is invisible": *any* statement whose entire printed form is `;` is
outside what these two gates compare, no matter how many cases sit on it.

### Blind spot 1g — intra-statement whitespace the source chose, on 100% of the corpus

Same mechanism as 1e, one level finer: oxfmt re-prints every statement, so the *spacing inside*
a statement is normalized on both sides before comparison. A divergence that consists only of
how many spaces separate two tokens is therefore invisible to gate #1 and, by contract, to
gate #5.

**Evidence [D].** `export *  from './m.js';` — two spaces between `*` and `from` — compiles to
**byte-different** output on all four targets: official reproduces the source's two spaces,
rsvelte prints one. Both spellings were run through oxfmt and both collapse to one space, so
the normalized texts are identical and every entry scores `match`. The single-space spelling is
byte-identical on all four targets, which is the control: the divergence is the whitespace and
nothing else.

Unlike 1e, the mutation gate does **not** pick this up either — its normalizer removes
whitespace too. And unlike a missing terminator, this class is unlikely to be reached by adding
corpus files, because published code is formatted: the two-space spelling occurs **0 times in
the 5,287 `.svelte` files under `submodules/`** (measured with a positive control on a file
that does carry it — the collected corpus was not present on the measuring machine, so that
denominator is the submodules, not the 34,795-entry manifest). It is recorded here rather than
fixed; the open question is whether official's spacing comes from esrap re-emitting the source
slice, in which case it belongs in `upstream_issues/` instead.

### Blind spot 1b — comment ordering, not position

`ast_equiv/src/lib.rs:234` compares comments as an ordered `Vec<String>`. A meaningful comment
that moves within the file with no other change is equivalent. **[S]**, and moot today
because 1a means no gate reaches this code path with `Meaningful`.

### Blind spot 1c — everything the compiler returns except `js.code`, `css.code`, `warnings`

`compile.mjs:106-110` builds the recorded result from exactly three fields. **Discarded:**
`result.js.map`, `result.css.map`, `result.metadata` (including the `runes` flag),
`result.ast`. **[S]** A `metadata.runes` regression produces zero corpus signal.

### Blind spot 1i — `css.code` is compared on two of the four targets — **[D]**

`scripts/compat-corpus/targets.mjs` declares `css: true` for `client` and `client-dev` and
`css: false` for `server` and `server-dev`, so a CSS divergence that reaches only a server target
is compared by nothing. The gate's own summary row says the unit is "JS text + CSS text"; on half
the targets it is JS text alone.

**Discriminating case.** The two-arm sweep for #4190 moved two units —
`appwrite-console/.../sortButton.svelte` on `client` and on `server` — and only the `client` one is
a comparison this gate can make. The `server` one is CSS (`css=DIFF` before, `css=EQ` after,
`js=EQ` throughout), so it moved from wrong to right entirely outside the ratchet's view.

This is not a claim about how large the hole is. Nobody has measured what fraction of corpus units
have CSS output that a server target would carry differently from a client one, and the sweep that
produced the case above ran over 5,636 files rather than the full manifest.

### Blind spot 1f — the report's line number is a position in NORMALIZED text, not in either output or the source

`verify.mjs:642` builds every `js-mismatch` detail with `firstDiffLine(expJs, actJs)`, and
`verify.mjs:566-567` defines those operands as
`stripBlankLines(readIf(<expected|actual>/<id>/<target>.js))` — files `oxfmtTree` has already
rewritten in place. `normalize.mjs:271-280` returns `i + 1` of the first differing line. So the
number in a divergence report addresses the **comparison-side normalized text**, which is not
either compiler's output and is not the `.svelte` source at all.

Three things follow, and only the first is obvious:

1. A report line cannot be mapped back to a source line. **[S]**
2. `firstDiffLine` stops at the FIRST differing line, so a report shows one hunk per
   `(id, target)` however many exist. A second cause in the same file is invisible until the
   first is fixed. **[S]**
3. **Where a hunk appears in the report is not evidence about codegen.** oxfmt's line breaking
   is a function of the whole file, so a change that moves a construct across the printer's
   width threshold renumbers every later line and can reorder which divergence is "first" with
   no change to what either compiler emitted. **[D]** — during the 2026-08-29 cluster-E work a
   SMUI JSDoc divergence was inferred to be a fresh regression from the report's first-diff
   ordering; rebuilding at the merge base produced identical line counts (416/357) and the same
   hunk, so it pre-existed. The ordering argument was invalid, not merely wrong on the facts.

**Point 2 is not theoretical, and it mis-assigns work.** On 2026-08-30 three of the 19 unlisted
failing ids were routed by the line the report printed, and all three were the wrong cause: the
`$.mutate` "over-generation" in `adventurelog/.../LodgingDetails.svelte` was actually a missing
`$.invalidate_inner_signals(() => { $t(); })` wrapper, and `$.event(` "line splitting" in two
`sparrow-app` files was a **symptom** of official printing six comments inside that call. Both
were found only by diffing the whole artifact. The reusable rule: **to attribute a divergence to
a commit, rebuild that commit and re-measure the file — never compare two reports' line numbers
or their hunk order.** A report answers "does this pair differ", and its coordinates answer
nothing else.

### Blind spot 1g — the normalizer strips an object key's quotes, on all four targets — **[D]**

Upstream decides whether a property key is written bare or quoted with
`regex_is_valid_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/` (`phases/patterns.js:17`,
reached through `b.key` in `utils/builders.js:697`), which is ASCII-only. oxfmt drops
quotes a key does not need, and it reads a non-ASCII identifier as one that does not
need them — so **both spellings normalize to the same text** and this gate cannot
report either direction of the divergence.

Discriminating case, run with the gate's own config
(`compatibility/.oxfmtrc.json`, `{"objectWrap": "collapse"}`):

```
in   const off = { plainKey: true, 'forciblyСollapsed': true };   ← official's output
in   const rsv = { plainKey: true, forciblyСollapsed: true };     ← rsvelte's output
out  const off = { plainKey: true, forciblyСollapsed: true };
out  const rsv = { plainKey: true, forciblyСollapsed: true };
```

(`С` is Cyrillic Es, U+0421.) A carrier is already in the collected corpus —
`huly/plugins/controlled-documents-resources/src/components/hierarchy/DocumentSpacePresenter.svelte`
diverges on `client` with no mutation applied, and is listed in none of the four
ratchets. So this is not a population gap that corpus growth closes: the input is
present and the comparison erases the difference. A regression here has to be held
by a Rust test asserting `compile()`'s raw output — a `pattern-corpus` repro goes
through the same normalizer and would be equally blind.


### Blind spot 1d — the compile-option surface is one point

`compile.mjs:99-100`: `{ generate, dev, filename }` plus `css: 'external'` for components.
Never passed anywhere in the corpus pipeline: `runes`, `namespace`, `accessors`,
`customElement`, `preserveWhitespace`, `preserveComments`, `hmr`, `discloseVersion`,
`sourcemap`, `modernAst`. **[S]** SSR `dev: true` is independently compared as
`server-dev` (`targets.mjs`), so server-only development instrumentation is no
longer outside this gate.

`experimental.async` is the one that has since been measured, and it was not merely
uncovered — it made a whole *source shape* unreachable. `$derived(await …)` is an
`experimental_async` compile error without it, so the corpus scored 0 occurrences of the
shape at 14k entries and would score 0 at 140k. #2540 shipped inside that hole:
`$.async_derived(thunk)` missing both dev arguments across every shape and every entry
point. The matrix now carries the option per case (`matrix/run.mjs`, `generate.mjs`'s
`async-derived` family) and the first run of that family recorded **253** divergences.
Discriminating case for the "what a gate does not look at is not what inputs it lacks"
rule: adding real-world repositories could not have found any of them.

**Closing it:** each additional option roughly multiplies compile time and the ~0.19 GiB/target
artifact cost. `preserveComments` is the cheapest and highest-value one (it would make 1a
observable without a compiler change). Cost: unknown until measured.

### Blind spot 1h — the population's sensitivity: a 900-cell regression reaches this gate as 4 entries **[D]**

Measured on #4079's first submission. Reviving `private_read_wrap_ast` for a bare class
member — without reviving the sibling `private_member_read_wrap_ast`, which is dead for the
same reason — regressed **900 of 8,640** cells of a generated private-read grid (declaration
rune x host x preceding statement x write form x read shape x target). The corpus reported
**4**, in two files, both on `client` and `client-dev` of the same two sources.

The 4 are not a sample of the 900. The shape needs a `this.#x[<expr>]` read *and* a standalone
`this.#x` read of the same field in the same class: the standalone read is what makes the AST
pass fire, and the AST pass skips a member-chain object on the premise that the sibling pass
took it. Published code holds that pairing rarely, so the corpus's own hit rate on this axis is
0.44% of what the product actually broke.

Two things follow. Sizing a regression from this gate's count understates it whenever the
defect needs two constructs *co-located*, which is the same argument recorded for #2254's
interaction shapes one level up — and the fix has to be pinned by a generated grid, because
re-breaking it would again cost only 4 corpus entries and those are two files away from being
removed from the corpus for unrelated reasons.

**Closing it:** not closable by corpus growth. `crates/rsvelte_core/tests/private_member_read_object_position.rs`
holds the witnesses instead.

### Blind spot 1i — CSS is compared on two of the four targets — **[D]**

`targets.mjs` sets `css: true` for `client` (`:46`) and `client-dev` (`:93`) and `css: false`
for `server` (`:61`) and `server-dev` (`:76`), so a `css.code` divergence can enrol at most two
ratchet entries however many targets reproduce it — and a divergence the `dev` flag suppresses
enrols exactly one.

**Discriminating case.** Before the `:global(.foo)` empty-check fix,
`appwrite-console/src/lib/components/sortButton.svelte` measured `css=DIFF js=EQ` on **both**
`client` and `server` (official 5.56.10 vs rsvelte, same source, `dev: false`), and
`known-failures.server.json` listed nothing. Read from the ratchet alone the defect looks
client-only; it reproduces on `server` too, and the same one-line fix repairs both.

Two things follow. The §1 summary table read "Normalized JavaScript and CSS for client, server,
and client-dev", wrong in both halves — CSS is not compared on `server`, and there are four output
targets, not three; it is corrected in the same change as this row. And an entry count is the
damage *within what the gate looks at*, never the extent of the defect: this one drops one entry
and repairs two targets, and no reading of the ratchet can say so — it took splitting `css` from
`js` and running both arms on both targets.

**Closing it:** flipping `css` to true on the two server targets. How many entries that enrols is
**unmeasured** — it needs a collected corpus and a full sweep, and no partial run can shrink the
resulting baseline.

---

## 2-3. Compiler warning parity — codes and positions

**Unit.** `compile.mjs:121-134` reduces each warning to `{code, line, column}` taken from
`w.start`. `verify.mjs:393` bags codes; `verify.mjs:394` keys positions as
`` `${code}@${line}:${column}` ``. Two independent shrink-only ratchets per target.

### Blind spot 2a — warning message text

`normalizeWarnings` (`compile.mjs:121-134`) never reads `w.message`. **[S]** The comment at
`compile.mjs:117-119` states this as a deliberate contract ("it is prose and upstream rewords
it"), but the consequence is that a warning whose message names the wrong attribute, the wrong
element, or the wrong suggested fix is invisible — e.g. #2413 (`a11y_invalid_attribute` names
`href` where the SVG attribute is `xlink:href`) and #2411 (`svelte_self_deprecated` suggests
the wrong-case path). Both are message-text defects on correct codes at correct positions.

**Tracked:** #2403. **Closing it:** record `w.message` in `warnings.json` and add a fourth
ratchet. The reason it was not done initially is that upstream rewords messages on minor
bumps, so the ratchet would churn — that cost is real but is a maintenance cost, not an
observability argument.

### Blind spot 2b — the warning `end` span

Only `w.start` is read (`compile.mjs:125-126`). **[S]** A warning with a correct start and a
wrong or absent end highlights the wrong range in an editor and is scored `match`.

### Blind spot 2c — warnings on entries either compiler rejects

`verify.mjs:418`: `if (expErr[target] || actErr[target]) continue;`. **[S]** Warnings emitted
alongside a compile error are never compared for that target.

### Blind spot 2d — a whole rule family can be measured at one code

The unit is per entry, so a class this gate *does* observe is still only observed on the
shapes the population happens to hold — and "the population holds the construct" is not the
same claim as "the population exercises the class". **[D]** Measured, not argued: **119** of
the 14,170 corpus entries contain `<svelte:element>`, but exactly **3** produce an a11y
warning whose span starts at one, and all three carry the **same** code
(`a11y_no_static_element_interactions`). Upstream's `check_element` can raise ~40, so this
gate saw 1 of them.

That is what #2523 was: `check_element` had no call site in `svelte_element.rs`, so **every**
element a11y rule was absent on `<svelte:element>` — and the ratchet recorded the defect as
three entries of one code, a shape indistinguishable from a single-rule bug. Growing the
corpus does not move this: `<svelte:element>` × an a11y-relevant attribute is an interaction,
and published code writes it almost never. The coverage is
`crates/rsvelte_core/tests/a11y_svelte_element_2523.rs`, which constructs one case per rule and
pairs each `!is_dynamic_element` row with the static element that does raise it.

### Blind spot 2e — the unit is one compile, so a per-process rule is unobservable

Every entry is compiled once per target and its warnings compared in isolation. **[D]** A
warning whose emission depends on *how many times the compiler has already run* therefore has
no observable here at any corpus size — the divergence **is** the second call.

Measured (#3239): upstream dedupes the compile-**option** deprecations through a module-level
`warned` Set in `validate-options.js`, so three `compile()` calls with `{ accessors: true }` in
one fresh process yield `[options_deprecated_accessors]`, `[]`, `[]`. rsvelte emits the warning
all three times. Two independent reasons this gate is blind to it: the unit above, and the fact
that **no corpus entry passes either option** — `targets.mjs` fixes the option set, so blind
spot 1d (the compile-option surface is one point) covers the same hole from the other side.

The divergence is **deliberate**, not a backlog item: reproducing a module-level `warned` Set
needs process-global mutable state, and under the parallel NAPI driver *which* file receives the
single warning would be nondeterministic — worse for a user than over-warning, since a warning
that lands on an arbitrary file is one a build log cannot be diffed against. It is pinned by
`compile_option_deprecations_repeat_on_every_call` in
`crates/rsvelte_core/tests/svelte_options_deprecations.rs` so that a later move to
once-per-process is a decision rather than a drift. Note the asymmetry the issue's title hides:
only the **option** path dedupes upstream. The `<svelte:options accessors />` *tag* path is
raised from `2-analyze/index.js` with no `warn_once` at all, so it warns on every compile in
both compilers — and that half this gate does see.

### Blind spot 2f — phase 2's `Identifier` visitor never enters a template expression's function body

The gate compares whatever `result.warnings` holds, so it can only see a warning that is
*raised*. **[D]** Instrumented on a component whose instance script and whose template each
contain a rune read inside a nested function: `2_analyze/visitors/identifier.rs` fires **3**
times on the instance script and **0** times on the template expression's arrow body. The
consequence is not one missing warning — it is that **every warning class the `Identifier`
visitor raises is unreachable in that position**, `state_referenced_locally` among them. The
warning gates cannot distinguish "no warning is due here" from "no visitor ran here", because
both produce an empty list and an empty list matches an empty list whenever upstream also
stays quiet.

This is recorded rather than fixed: the scope is phase 2's visitor dispatch, and it was found
while narrowing a repro during a re-baseline window. The repro
(`compatibility/pattern-corpus/issues/rune-local-in-a-template-function-is-not-a-plain-local.svelte`)
was narrowed to read its runes through a closure so it does not depend on this hole, which is
exactly why the hole needs its own row — the narrowing removed the only artifact that pointed
at it.

A second, smaller lesson from the same narrowing, worth a line because it cost a full
four-target run to diagnose: **a `//` comment written as a note inside a repro's handler is
compiler input.** Official prints `var // …` and swallows the rest of the line, so all four
targets diverged on a file whose only new content was an explanatory comment. Repro notes go in
an HTML comment or in the README row, never in a script-level `//`.

---

## 4. Compiler error parity

**Unit.** Two independent comparisons. The *output* verdict compares `code` only (both sides
error → same code, else `error-mismatch`; one side errors → `error-mismatch`). Separately,
`verify.mjs`'s "error parity" section compares the first message line, the `(line, column)` of
`start` and of `end`, and the rendered `frame`, for every `(id, target)` pair both sides reject
with the same code, on four ratchets of their own
(`error-message-known-failures.<target>.json`, `error-position-known-failures.<target>.json`,
`error-end-known-failures.<target>.json`, `error-frame-known-failures.<target>.json` — see
`compatibility/error-known-failures.md`).

Measured population: 14,179 entries, 948 rejected by both compilers, 2,843 `(id, target)` pairs
with two errors to compare. Divergences by field: `code` **0**, `message` **362 pairs / 121
ids**, `start` **678 pairs / 226 ids**, `end` **729 pairs / 243 ids**, `frame` **15 pairs / 5
ids before the fix in the same PR, 0 after**. The `code` column being saturated at 0 is why
every other column was worth adding: no amount of corpus growth could have moved a comparison
that already agreed everywhere.

### Blind spot 4a — CLOSED: `end` and `frame` are captured and ratcheted

`compile.mjs`'s `errorInfo` now records `endLine`/`endColumn`/`frame` beside `start`. Two
things about how they are gated, because neither is the obvious arrangement:

`end` gets **its own ratchet** rather than joining `start`. A ratchet entry suppresses
everything about its entry, so the fold would have hidden the **51 pairs / 17 ids that diverge
on `end` while `start` agrees** — the entries that point at the right place and underline the
wrong amount of code. **[D]**

`frame` is compared **only where both endpoints already agree**. Upstream derives it from
`start.line` and `end.column` (`submodules/svelte/…/utils/compile_diagnostic.js:72`), so an
unchained comparison would restate the two span comparisons instead of asking a new question;
chained, it sees only the renderer. Its population is **2,114 of the 2,843 pairs**, 2,112 of
them carrying a frame on both sides. It baselines at **0, saturated rather than unenrolled**:
the first run found 15 pairs / 5 ids diverging from one unclamped caret-column computation,
which the same PR fixed. **[D]**

### Blind spot 4d — a missing artifact scores `match`, not an abort

Every comparison in this section reads `expected/<id>/error.json` and `actual/<id>/error.json`
and `continue`s when either is absent, so an entry whose artifacts are gone falls through to
`errorCounts.match++`. A half-swept tree therefore reports **100% error parity** — and unlike
the warning gate's version of the same hole, which surfaces as an implausibly large failure
block, this one is a clean green that nobody investigates.

Measured on a real half-swept tree (`expected/` removed, `actual/` intact): **0 pairs compared,
14,179/14,179 entries scored `match`**, and the precondition at `verify.mjs:313` passed at
14,179/14,179 — it was `hasOutputs(EXPECTED,id) || hasOutputs(ACTUAL,id)` with `hasOutputs`
itself `TARGET_KEYS.some(...)`, permissive in both quantifiers. **[D]**

Now closed in three places: the precondition asserts coverage **per tree** and **per target**
(either `<target>.js` or that target's key in `error.json`, which is exactly what
`compile.mjs`'s `writeOutputs` establishes); the compared-pair count is printed beside the
verdicts and stored in `report.json` as `errorComparedPairs`; and `--update-error-baseline`
refuses at zero compared pairs. What remains **[U]** is the same question for the warning
comparison, where a missing `warnings.json` legitimately means "no warnings" and the per-target
invariant does not apply — tracked in #2707.

### Blind spot 4e — only four of the NAPI compile entries carry the shape

The corpus calls `compile` / `compileModule`; `#2558` gave those and `compileBoth` an official
`CompileError` object, and this PR added `compileWithCssHash` (the async entry, which cannot
take an `Env` — it builds the object in its return-value conversion, on the JS thread). Every
other entry still returns `napi::Error::from_reason(format!("{e:?}"))`: `compileEnvelope`,
`compileEnvelopeExternalSources` and their `ZeroCopy`/`Async`/`Buffers` siblings, plus the
batch entries, which encode the `Debug` string into the envelope. **[S]**
`apps/npm/vite-plugin-svelte-native/index.cjs:142,207` shows `compile()` and `compileAsync()`
without a `cssHash` routing to `compileEnvelopeExternalSources[Async]`, so the vendored plugin's
primary path is one of the uncovered ones. No gate reaches them: the corpus does not call them,
and `test-vps-shim.mjs` asserts the shape only on the two this PR covers.

### Blind spot 4b — a code-less error on either side degrades to error-parity

`verify.mjs` guards the output verdict with `e.code && a.code &&`. If either side's `code` is
`null`, no mismatch is recorded and the verdict falls through to `error-parity`.
`compile.mjs` leaves `code` `null` when the error object carries no `code` and the message
matches neither `svelte.dev/e/<code>` nor `code: "<code>"`.

Reachability is now measured rather than **[U]**: over the 2,843 both-reject pairs, a `null`
code occurs on **1** pair and on **0** pairs one-sidedly
(`svelte/packages/svelte/tests/migrate/samples/svelte-component/input.svelte`, where both
compilers raise an uncoded `Not implemented: LetDirective`). The guard has therefore never
degraded a real divergence in this corpus — and the message comparison covers that pair anyway,
since it treats two `null` codes as agreeing. **[D]**

### Blind spot 4f — the one-sided code-less error, which 4b measured at 0 and a constructed input produces — **[D]**

4b measures a `null` code on **1** both-reject pair and on **0** pairs one-sidedly, and reads as
closed on that basis. The one-sided direction is the one the corpus cannot reach rather than the
one that does not exist: `<script lang="ts">export = a;</script>` on `generate: 'server'` makes
rsvelte throw with `code: null` and a message naming a pass and a diagnostic count
(`server instance script classification parse rejected the erased source (1 diagnostics): …`)
while official does **not** reject at all — it emits output, which happens not to parse (#4196).
That is `error-presence` on the output ratchet, and every other error field is chained behind
`code`: `message`, `start`, `end` are compared only where both sides reject, and `frame` only
where both endpoints already agree. So a code-less error is the single shape this family of
gates cannot classify, and its one-sided form is invisible here for want of a carrier, not for
want of the shape — the three TypeScript statement forms that produce it occur in 0 of the
corpus sources checked out (a denominator of 20 of 104).

The general form is worth separating from the instance: **a gate that keys on a field cannot see
an error that has no such field**, and "reachability measured at 0" over a collected corpus is a
statement about the population. The detector is a constructed input, as for 39i.

### Blind spot 4c — entries only one side rejects have nothing to compare

The message/position comparisons skip any pair where one side compiles, or where the two codes
differ: the prose and span of two unrelated errors say nothing. Those pairs are
`error-mismatch` on the output ratchet, which sees the code and nothing else. **[S]**

---

## 5. Generated shape matrix — `scripts/compat-corpus/matrix/`

**Unit.** Generated cases × **up to** 3 targets each. Where both compilers accept, the unit is
`js.code` plus the multiset of warning **codes**, oxfmt-normalized identically to `verify.mjs`;
where both reject it is the error **code**, which the `invalid-bind` and `param-default` families
exist to exercise. A case may also carry `options`, merged over the per-target option set — the
`async-derived` family is the only user, and the only place in the repo where a compile **option**
is an axis rather than a constant (cf. blind spot 1d). "Up to" because a case may also decline a
target outright — blind spot 5m.

### Blind spot 5a — CLOSED: the module entry point is generated now

Originally: every case id hardcoded `.svelte`, so `compileModule` was never reached. Two
families now emit module cases — `comment-slot` through `COMMENT_MODULE_SEEDS`
(`generate.mjs:47-55`, `kind: 'module'`) and `param-default` through a `.svelte.js` twin of
every function form (`generate.mjs:112-116`) — and `run.mjs:124` dispatches on `kind`.
The entry point matters on its own: it is a different parse call in rsvelte, not a flag.

**Tracked:** #2425, closed. It was load-bearing while open: PR #2436 established that the matrix
is the *only* place a module comment divergence can be observed at all (cf. #2399).

### Blind spot 5b — CSS, and the warning **position**; codes are compared now

`run.mjs` still forces `css: 'external'`, and `result.css`, `result.metadata` and `result.js.map`
are never accessed. **[S]**

`result.warnings` is read: the two multisets of warning **codes** are compared, and each
diverging code becomes its own entry, `warning-missing:<code>` / `warning-extra:<code>`. The
code is in the **verdict** rather than only in the printed detail because the ratchet key is
`(id, verdict, target)` and nothing else: under a flat `warning-mismatch` verdict, a case listed
for one code absorbs a regression in every other code on the same case and target. That is
measured, not feared — re-breaking #2521 under the flat verdict left this gate **green**,
because the same three cases were already listed for a missing a11y warning. **[D]**

What the comparison drops is the warning's `start` — rsvelte can emit the
right code at the wrong line and column and the case scores as parity. **[S]** The collected gate
ratchets positions separately (`warning-position-known-failures.*`) and its backlog is an order
of magnitude larger than its code backlog; folding the two together here would bury a semantic
divergence under a positional one, which is the #2314 argument applied to a second gate.

Adding the comparison measured nothing on its own — an instance of *the vacuous green* above —
and the number is worth keeping because it
makes the usual "the baseline is empty, so we are fine" reading falsifiable. Measured per
family: **seven of the ten emit zero warnings of any code from either compiler**, over **5244**
accepted (case, target) pairs — `binding-position`, `comment-slot`, `literal-escape`,
`invalid-bind`, `param-default`, `each-collection`, `param-pattern`. An empty warning baseline
on those is *unreachability*, not saturation.

The three that do reach warnings all diverge, which is the other half of the same point.
`directive-element` and `bind-setter` supply 538 warned pairs over six codes
(`a11y_click_events_have_key_events`, `a11y_no_static_element_interactions`,
`event_directive_deprecated`, `svelte_component_deprecated`, `svelte_self_deprecated`,
`export_let_unused`); 24 diverge. `keyword-regex` — a family written for a *parser* question,
by another author, with no warning intent — supplies 60 over two codes and **18 diverge**. That
last one is the generalization argument: the comparison earns its place on populations nobody
built for it. **[D]**

Sharpest remaining form: `axes.mjs` generates a `// svelte-ignore a11y_…` comment kind against
the `comment-slot` seeds, and those seeds produce no a11y warning on either compiler — so the
gate injects svelte-ignore directives into a population where there is nothing to suppress, and
would score a broken suppression as `match`. **[S]**

The `async-derived` family narrows one corner of that and shows the rest is worse than "not
compared". Its `ignore` axis puts `svelte-ignore await_waterfall` on the declaration, and
whether it took effect **is** visible in `js.code` there, because upstream encodes the decision
as a dropped third argument to `$.async_derived`. But `await_waterfall` is a *runtime* warning:
it never enters `result.warnings` for either compiler, so gates 2-3 could not see it either.
Between them, an ignore directive for a runtime warning was observable by no gate in the repo —
which is how #2540's second half (`svelte-ignore await_waterfall` was a no-op) went unreported.
Gate 24 is the part that watches the suppression itself rather than its encoding.

Also unobservable here for the same reason the ignore rows mostly are: every `async-derived`
row that carries a comment is already a known failure for comment **reproduction** in the
hoisted `var` declaration, and a listed entry suppresses everything else about that entry. The
argument-list assertions therefore live in
`crates/rsvelte_core/tests/async_derived_dev_args_2540.rs`, not here.

### Blind spot 5c — template-markup positions, now partially covered

Every position in `axes.mjs`'s `POSITIONS` injects into a JS statement context inside the
instance `<script>` (or an inline handler body). The `literal-escape` family adds the first
markup axis — `EXPRESSION_SLOTS`, 14 slots: `{expr}`, an attribute value, `{@const}`, a handler
body, `{#if}` / `{#each}` / `{#await}` / `{#key}` heads, `{@html}`, `{@render}`, `class:` and
`style:` directives, a spread attribute, and an instance declaration.

It crosses those slots with **one** axis: how a string literal spells itself. The
`directive-element` family closes the directive half of what this row used to list as
unmeasured: `use:` / `transition:` / `animate:` / `in:` / `out:` / `on:` / `bind:` / `class:` /
`style:` / `let:` / `{@attach}` / spread now appear against 13 element kinds in both modes.
Still **unmeasured**: every other expression shape in the `EXPRESSION_SLOTS` positions — the
directive family varies the directive's *kind* and its *host*, never the shape of the expression
inside it (except for `bind-setter`, which varies the expression and fixes the directive).
**[S]** Comment insertion is likewise restricted to `<script>` bodies (`mutate.mjs:22-34`,
`:48`), a deliberate and documented exclusion (`mutate.mjs:9-13`) — so HTML comments `<!-- -->`
are never mutated.

`param-default` adds two markup slots of its own (`PARAM_TEMPLATE_FORMS`: an event-handler
attribute and an `{expr}` interpolation) for a different reason — rsvelte parses a template
expression with a *different function* than a script body, so the two are separate code paths
and not merely separate positions. #2547's first fix was green on every script path while
`{(async (p = await x) => p)}` still compiled.

What the escape axis is for is worth stating, because the class is easy to dismiss as cosmetic:
these divergences produce output that **parses and computes the right value** and differs only
in text. The parse gate cannot see them, a runtime test cannot see them, and the only gate that
can is a byte comparison — which is why the axis had to be generated rather than collected: a
formatted repro file is not one, since the fmt oracle rewrites the very quote style that
distinguishes the failing shape from the working one.

### Blind spot 5d — both-reject cases discard the message and the position

`run.mjs` now compares the two error **codes** and reports
`error-code-mismatch:<official>-vs-<rsvelte>` when they differ, so "both threw" no longer stands
in for "both diagnosed the same thing" and a listed pairing no longer absorbs a different one
(5t). What it
still drops is everything else the error carries: the message prose and `start`. **[S]** rsvelte
can reject a shape with the right code, the wrong wording and an offset pointing at the wrong
token, and the case scores as parity. The collected-corpus gate does ratchet both
(`error-message-known-failures.*`, `error-position-known-failures.*`); this one does not, so a
shape only the matrix generates is unmeasured on both fields.

Note what closing the code half required: it is worth nothing without inputs that reach it, and
before family `invalid-bind` (`generate.mjs:73`) the only both-reject cases here were valid
programs that happened to break. **A comparison and a population have to be added together** —
either alone measures nothing.

### Blind spot 5e — accept-where-official-rejects has one input per code elsewhere

Families `invalid-bind` (`axes.mjs` — 20 invalid and 11 valid target expressions × 8 `bind:`
slots) and `param-default` (2 illegal and 5 legal parameter initializers × 5 positions in the
list × 9 function forms + 3 template forms × 2 entry points) are the *generated* population of
programs official rejects. Both halves are needed: the
invalid rows report "rsvelte accepts what official rejects", the valid rows report the reverse,
and neither can see the other's direction — which is why the *verdict* has to carry the
direction too, and did not until 5t. The valid half exists because the first version of
this family had only the invalid one, and CI then caught an over-rejection
(`bind:group={c as T}`, a TypeScript assertion) from a **corpus file** rather than from the
gate — on the one slot that file happens to use. Everywhere else that question is
asked by the 145 `compiler-errors` fixtures, at **one input per code**, which makes a code with
a passing fixture read as covered. It is not: #2583 is `bind_invalid_expression` accepted on a
component while its fixture passed on an element. Three of the four accept-where-official-rejects
divergences known when this row was written sit on codes that have a passing fixture.

`param-default` is the same row for a *parser* rule rather than a validator, and it says
something the `bind:` family cannot: acorn enforces `checkYieldAwaitInDefaultParams` and OXC
implements no equivalent, so the divergence was not a missing port but a rule rsvelte never had.
Its legal rows are harder than `invalid-bind`'s, because the illegal and legal inputs differ only
in *whose* parameter list the keyword sits in —
`async (p = { async m() { return await 1; } }) => p` is legal, and a check that scans the
parameter subtree rejects it.

What remains **unmeasured**: every other error code, and every other acorn rule OXC does not
implement. These two families cross one validation and one parser rule with their slots. The
same drift is possible for any check written per call site rather than once — `{@render}`,
`use:`, `{#each … as}` patterns, `<svelte:element>` — and no gate here generates invalid inputs
for them.

### Blind spot 5t — CLOSED: one `error-mismatch` verdict folded the two directions into one key

Blind spot 5e above states that the invalid and the valid rows of `invalid-bind` /
`param-default` "report opposite directions, and neither can see the other's". That was true of
the **comparison** and false of the **ratchet**: `run.mjs` scored both as the single verdict
`error-mismatch` and put the direction in `detail`, which is printed and never keyed. The ratchet
id is `<case> [<verdict>] (<target>)`, so a listed over-rejection on a case covered a later
over-acceptance on the same case and target — and the population most exposed to it was the one
built to find accept-where-official-rejects. It is now `over-accept` (rsvelte compiles what
official refuses) and `over-reject` (the reverse), each ratcheted two-sided.

`error-code-mismatch` carried the same shape one step over: both compilers rejecting with
different codes produced one verdict whatever the codes were, so an entry recorded for
"official *X*, rsvelte *Y*" also absorbed a later degradation to *Z* on that case — which is the
regression 5d's own comparison exists to catch. The verdict is now
`error-code-mismatch:<official>-vs-<rsvelte>`.

**[D]**, by fault injection at the harness rather than at the compiler, because the claim is
about the key and not about any compiler behaviour: forcing rsvelte to reject one
`invalid-bind` case, baselining it, then forcing the *opposite* direction on that same case
leaves the pre-split gate reporting **0 new divergences** and the post-split gate reporting
**1 NEW `over-accept`**. Both arms were run; the numbers are in the PR that split the verdict.
The split cost **zero** baseline churn — the ratchet held 388 entries and none of them was an
`error-mismatch` or an `error-code-mismatch`, so nothing that was tolerated before is tolerated
now and nothing had to be re-justified.

What this does **not** close is 5d: a both-reject cell still compares nothing but the codes, so
the message prose and `start` remain unmeasured here. **[S]**

### Blind spot 5f — the `each-collection` family sees precedence, not evaluation

Family `each-collection` (`axes.mjs` — 20 collection expressions × 10 uses of the loop item)
puts the `{#each}` collection in the one slot where its own precedence decides the output: a
legacy **reassigned** item is read back as `collection[$$index]`, so `list ?? []` has to print
as `($.get(list) ?? [])[$$index]`. Both polarities are generated, because the failure modes are
opposite — a splice that carries no precedence drops the parentheses, and a fix that adds them
unconditionally moves every collection that never needed them.

What it structurally cannot observe: **whether the parenthesised expression evaluates the same
way**. The comparison is `js.code` text against official's, so this family inherits 5b and 5d
whole, and it can only ever report "rsvelte's bytes differ from official's" — never "rsvelte's
bytes are not JavaScript". `($.get(list) ?? [])[i] = v` and `$.get(list) ?? [][i] = v` are both
*text*; only the second is a syntax error, and the gate learns that solely because official
spells it the other way. #2609's own symptom was an esbuild parse failure in a user's build, a
signal no ratchet in this document produces. **[D]** — the family was added with #2609's fix and
89 of its cells were red before it.

It is also blind to the two axes it holds fixed: the item is always an **Identifier** context
(never a destructuring pattern, which takes a different transform), and the mode is always
**legacy**, because the reassigned-item read does not exist under runes. A runes-only variant of
this family would measure nothing, which is why the preamble is deliberately rune-free.
### Blind spot 5g — the `keyword-regex` family fixes one body per host and one host per body

Family `keyword-regex` (`axes.mjs` — 15 reserved words that cannot end an expression × 9 hosts,
plus 15 × 4 regex bodies on the legacy `$:` host, plus 10 division controls × 9 hosts) exists
because whether a `/` opens a regex literal is decided by the preceding **token** and every
hand-written scan in the client instance-script pipeline decided it from the preceding **byte**
(#2620). Its two polarities are regex-read-as-division and division-read-as-regex; a fix that
only widened one direction scores green on the other half.

What it does **not** generate is the product: `generate.mjs`'s `keywordRegexCases` crosses every
keyword with every host at **one** regex body (`delimiters`), and every regex body with every
keyword at **one** host (`legacy-reactive`). The two axes are not interchangeable, and the
measurement says so. Only `slash-in-class` (`/[//]/` — a character class holding two slashes, so
the body carries a `//` that a division reading exposes) discriminates the shared-helper defect
at all: restoring the previous-byte rule turns **24** comparisons red on it and **0** on
`delimiters`. Swapping the host cross to `slash-in-class` on the *fixed* tree turns **178**
comparisons red across five hosts — 30 on `legacy-prop-default`, 24 on `legacy-function`, 66 on
the two template-expression hosts (where rsvelte **rejects source official accepts**), 14 on
`runes-class-method`, 2 on `legacy-reactive-block`. Those are previous-byte scanners the shared
helper does not own, so this row's **[D]** evidence is that the host cross is deliberately run on
the body that does *not* move: `/[//]/` outside the legacy `$:` host is a live divergence, not a
gap in generation.

The same is true of spelling: every generated row puts exactly one space between the keyword and
the `/`, so `return/re/` — a different byte layout for the same token pair — is never
produced. **[S]**

This family carries the class alone: there is deliberately **no `pattern-corpus` repro** beside
it. Every shape that pins the defect puts a `/[//]/` in a legacy `$:` statement, and Gate 3's
comment mutant then inserts a `//` comment on the last `<script>` line, which a *different*
pre-existing scan splices inside the emitted `$.set(…)` — unparseable output on all four
candidate shapes tried (`typeof`, a `return` IIFE, a `case` test, and a legacy function, the last
of which does not even reach parity unmutated). A seed that lands red would enrol a
`mutation-known-failures` entry, and that entry suppresses every verdict about the seed —
including the one it was added to produce. **[D]**

The controls are ASCII-only, and the one that discriminates a **backwards** scan
(`comment-ending-in-keyword`) is a block comment on one line. A `//` comment whose text ends in a
keyword is the sharper input and is **not** generated here: rsvelte drops that comment from its
output (blind spot 1a), so the row would diverge for a reason unrelated to the slash and a
ratchet entry would then suppress the control it was added to be. That case is asserted directly
instead, in `js_scan.rs`'s `a_comment_ending_in_a_keyword_does_not_open_a_regex`.

Finally, the family reaches only the scanners that go through `shared::js_scan::skip_opaque`.
`shared/class_body.rs:54` keeps a **private copy** of `slash_starts_regex` with the same
previous-byte rule, and the Phase-1 scan that finds where a `{…}` template expression ends has a
rule of its own — `{typeof /[//]/.exec(v)}` is rejected with "`<p>` was left open". Nothing in
this family distinguishes which of those a case routes through; the 178-comparison measurement
above is the evidence that they exist, not a partition of them. **[D]**

### Blind spot 5h — `param-pattern` fixes the binding kind and the pattern's host

Family `param-pattern` (`axes.mjs` — 20 pattern shapes × 6 script contexts + 3 markup contexts)
crosses a *binding* slot of a destructuring parameter with the statement context the callback is
reached through. The context axis is the load-bearing one: only the legacy `$:` rows route the
expression through the client text rewriter, and #2608 was invisible in every other context, so
a shape axis on its own would have measured a path that never had the defect.

Two things it structurally cannot reach. The **binding kind is fixed** at one: every case
declares `export let id` (`PARAM_PATTERN_PREAMBLE`), so the name occupying the pattern slot is
always a legacy prop. A `$state` local, a `$derived`, a store auto-subscription, a `$props()`
member and an each-block item all have their own wrap routines and their own pattern slot, and
none of them is generated here — **unmeasured**. The **host of the pattern is fixed** too: it is
always a function parameter list passed to `rows.map(...)`. A `catch (…)` clause, a
`for (const { id } of …)` head, a `const { id } = …` declaration and a class method's parameters
are binding positions of the same kind that no row reaches. **[S]**

And the comparison is the one every gate in this document shares: the case scores on whether the
two texts are equal, not on whether rsvelte's text is JavaScript. It reports #2608 because
official's output differs, not because `({ id: id() }) =>` fails to parse — see 19a.
### Blind spot 5i — the directive families see the parent, not the ancestry or the sibling

Families `directive-element` (19 directive kinds × 13 element kinds × 2 modes) and `bind-setter`
(7 `bind:` expression shapes × 9 element kinds) enumerate the product of a directive and its
**immediate host**. That is the axis that finds a rule written per-parent instead of once:
upstream tests `context.path.at(-1)` inside the directive's own visitor, rsvelte handles the
attribute list in each element visitor, and #2497 is the drift (`event_directive_deprecated`
fired on `RegularElement`, not on `SvelteElement`). Mode is an axis because the deprecation
warnings are gated on `analysis.runes`, so a runes-only family cannot report an over-warn in
legacy mode and a legacy-only one cannot report the miss.

What the product does **not** vary: the ancestry above the host (only `each-keyed-element`
carries one, and it exists because `animate:` placement is a property of the ancestors rather
than the element), the number of directives on one host (`transition_duplicate`,
`transition_conflict`, `animation_duplicate` and `mixed_event_handler_syntaxes` are all
**two-attribute** rules and every generated case carries exactly one), and the directive's
*name* (`on:click`, `bind:value` and `use:action` are one spelling each, so
`bind_invalid_name`-shaped rules are sampled at one name per host). **[S]**

`bind-setter` is the counterpart product — expression shape against element kind, directive
fixed — and it exists because #2484 was reported against `<svelte:component>`, which **matched
official**, while the live divergences are on `<svelte:body>` and `<svelte:self>`. A cell that
names its element removes that class of misattribution; a hand-written repro cannot, because the
reporter chooses the element. **[D]**

### Blind spot 5j — option-as-axis is reusable, but an option that lands outside `js.code` is vacuous here

`async-derived` made a compile **option** an axis for the first time (`run.mjs:156`), and the
capability generalises to any option — the mechanics and the collision hazard are in
[scripts/compat-corpus/README.md](../scripts/compat-corpus/README.md#generated-shape-matrix-matrix).
What does **not** generalise is observability. `run.mjs` reads `result.js.code` and nothing else
off the result object (`:167,173`), plus the warning `code` multiset and the error `code`. An
option whose effect lands anywhere else produces identical output on both sides *by
construction*, so declaring it as an axis buys a green column that means nothing — the vacuous
green of § *A named blind-spot class*, one level up from an input that is merely absent.

The sharp case is #2697, which raises `compile.modernAst` and `parse.skipCssAst` as declared at
the NAPI boundary and accepted. The matrix reaches neither, **for two different reasons**, and
the distinction is the point: `modernAst` *is* expressible as an axis and would be vacuous —
official spends it entirely on `result.ast` (`compiler/index.js:58`,
`result.ast = to_public_ast(source, parsed, options.modernAst)`), so both sides emit identical
`js.code` whatever rsvelte does with it, and **an inert option and an option this gate cannot
see are the same verdict**. `skipCssAst` is not expressible at all — it is an option of `parse`
(`rsvelte_napi/src/lib.rs:219`), and this harness only ever calls `compile` / `compileModule`.
Reading "the matrix cannot gate #2697" without that split invites someone to add the axis and
read its green as evidence.

The rest of that class — `runes`, `namespace`, `accessors`, `customElement`,
`preserveWhitespace`, `preserveComments`, `hmr`, `discloseVersion`, further `experimental.*` —
does surface in `js.code` and is reachable. Cost is not the constraint: an option axis compiles
exactly like a shape axis. **[S]**

**[D]** #3384: the `compiler-option` family now declares 15 of them as an axis, so the
*reachable* half of this row is closed — see 5r for what the family itself cannot see, which is
not the same list. The vacuous half stands unchanged: `modernAst` is still expressible and still
inert here, and `skipCssAst` is still an option of a function this harness never calls.

### Blind spot 5k — comments are observable HERE and nowhere else, and only inside `<script>`

This gate compares oxfmt-normalized `js.code` **as text** (`run.mjs:260-262`, verdict
`js-mismatch`) with no AST fallback, so a divergence living only in comments is a failure here.
That makes §5 the only gate in this document that can observe one at all: gate 1 defers every
byte-different pair to `ast_equiv_batch` under `CommentPolicy::Ignore` (blind spot 1a), and
gate 20 buckets it as `comment-mismatch`, which is counted and **not ratcheted** (blind spot
20e). A `pattern-corpus` file for a dropped comment therefore gates nothing — it passes with or
without the fix — which is why #2567's repro is a Rust text assertion
(`crates/rsvelte_core/tests/server_removed_statement_comments_2567.rs`) rather than a corpus
entry.

The `removed-statement-comment` family (396 cases) is the generated half of that: statements the
server REMOVES (`$effect` / `$effect.pre` / `$effect.root` / `$inspect`) × comment slot
(leading / interior / trailing) × 6 comment kinds × host (`compileModule`, instance-script top
level, one function deep) × successor present or absent. The host axis is load-bearing rather
than decorative — the module path removes a source RANGE and the component path drops an
unreferenced comment region, so before #2567 the two ate *different* subsets of the same two
comments, and a repro on either alone reads as a complete fix.

What it still cannot see, measured rather than guessed: **the comment payload never leaves a
`<script>` body.** Every host here wraps a JS statement; no case puts a comment in a markup
slot, an attribute expression, or between two elements — the same restriction blind spot 5c
records for `POSITIONS` and `mutate.mjs`. And the family reaches only comments attached to a
statement the transform *removes*; a comment attached to one it keeps and *rewrites* is covered
by `comment-slot`, not here. **[S]**

### Blind spot 5l — CLOSED: the parse oracle runs here too, and the verdict carries the class

Originally: `run.mjs` compared bytes and nothing else, so "wrong text" and "text no JS parser
accepts" produced the same `js-mismatch` row and the same ratchet entry, and a case where **both**
compilers emitted invalid text scored `match` outright. It now runs the same acorn oracle
`verify.mjs` does (`parseable.mjs`) on both sides of every accepted pair: an official output the
oracle rejects fails the run as an oracle fault (no exclusion list — the cases are authored, so
the fix is to change the case), and an rsvelte output it rejects is its own
`output-unparseable` verdict.

The second half of the same fix is the **code / comment split**. A divergence that survives
`codeIdentity` normalization stays `js-mismatch`; one that does not is `comment-mismatch`. Both
are ratcheted two-sided, so nothing is tolerated that was not before — the split is about the
KEY, and it is the #2521 lesson applied to this gate. **[D]**: when the split was added every
comment carrier in the `opaque-keyword` family diverged on comment placement (#2990), so under
one flat verdict re-breaking #2986 would have reproduced an already-listed key on the very cases
written to catch it. Those entries have since cleared, which is the outcome the split was for;
the `comment-slot` family carries the same hazard on all of its entries.

Two limits remain. The oracle only runs where **both** compilers accepted, so a both-reject cell
is still compared on the error code alone (blind spot 5d), and a case that opts out of a target
(5m) opts out of the parse check on that target too. **[S]**

### Blind spot 5o — the `opaque-keyword` keyword axis is a sample of the raw-scan set

Family `opaque-keyword` (5 keywords × 5 carriers × 6 hosts × 2 entry points) exists because
#2986's `class ` was located by a raw byte scan, and a keyword hidden in a comment, a string, a
template or a regex is the population that separates such a scan from a lexical one. Its keyword
axis is **derived** from the transforms — the source-level tokens `memmem::find` is called with
under `phases/3_transform/{server,client,shared}` — but it is a *sample* of that set, not the set:
the grep behind it returns ~30 distinct literals and the family carries 5. A token that only some
other pass scans for raw is unreached here. **[S]**

Three defects the family found on its first run are its calibration, not a claim of coverage: a
`'$derived('` inside a string, template or comment stops the real `$derived` in the same module
from being lowered at all — the module then throws at import (#2987) — and a `/$derived(x)/`
**regex literal** is itself rewritten to `/$.derived(() => x)/` (#2988). Both outputs parse, so
the parse oracle above is blind to both; only output equality reports them. The third (#2990) is
the axis' one **non**-keyword finding: its `between-classes` host reproduced identically on all
five keyword rows, which is what identified the cause as the slot rather than the token — a
synthesized rune accessor parking esrap's comment cursor. A row that does not vary with the axis
it was generated along is evidence about the host, and reading it that way is what a per-cell
verdict makes possible.

### Blind spot 5m — a case may opt out of a target

`run.mjs` lets a generated case name the targets it is compared on, and `generate.mjs` uses it for
the 208 `private-field` comparisons where the official compiler's **server** output is not
JavaScript: with no valid oracle, equality scores reproducing garbage as a pass and anything else
as a failure. Those cells are therefore unmeasured **against official** on `server` **[D]** — they
are covered instead by the Rust grid above, which asserts what rsvelte emits and requires the
recorded set to shrink deliberately rather than silently. The hazard the field introduces is that
it can also hide a real divergence; only "official's output for this target does not parse"
justifies it, and nothing enforces that rule mechanically.

**And the opt-out is written per (declaration, container) pair, so it is exactly as wide as the
axis values its author enumerated.** `rune-statement-container` excluded
`state-let × switch-case-bare` on the client for #3420 — a lexical rune declared bare in a `case`
clause, which official lowers while leaving its references untransformed. The same defect applies
to `$derived`, and **the family had no `derived-let` row at all**, so that half was neither
excluded nor compared: it was invisible, not tolerated. **[D]** It surfaced only when a probe run
for an unrelated fix widened the declaration axis to seven values and found official returning the
`Derived` object itself. An exclusion is a statement about the cells that exist; the cells that do
not exist are a separate question, and the ratchet cannot ask it.

**A related discipline about the write-up rather than the gate.** An upstream defect recorded here
is usually summarised from the first shape that reproduced it, and that summary becomes the pin.
`grass`'s slash divergence was first written as "a nested rule whose compound selector carries
`:not()`", which is right about the reproducer and wrong about the rule twice over — the trigger is
the Sass `not` **keyword** followed by `(` (`:nots(`, `:xnot(`, `:is(` all agree), and the effect
leaks to every later slash list in the file, including a top-level rule after the block. Written
the narrow way, the pin passes on a build that fixes either half alone. **Do not write an upstream
bug's summary until the trigger has been narrowed from BOTH sides — one input that fires it and one
that removes each condition and does not.** A one-sided summary does not merely under-describe; as
a pin it manufactures green.

### Blind spot 5n — `constant-fold` compares text, so it cannot see what the folded code *does*

Family `constant-fold` (17 expression kinds × 15 `EXPRESSION_SLOTS`, plus 2 `const`
indirections × 5 slots) is the second expression axis against the markup slots, and the
first that asks whether the two compilers agree on **which expressions are constant**. It
straddles upstream's `scope.evaluate` boundaries deliberately — a member read on an array
literal vs on a string literal, `Math.PI` vs `[1, 2].length`, a template literal whose
interpolations are known vs one whose interpolation is `null`.

What it cannot see, structurally: **whether the folded value is correct**. The unit is
`js.code` text, so a fold that produces the wrong constant on *both* sides of a comparison
is out of reach by construction, and a fold that produces the right text for the wrong
reason is indistinguishable from one that does not. #2607 is that shape one axis over — a
known-const `'\\'` folded to two backslashes, valid JavaScript computing the wrong string —
and only a runtime test can catch it. **[S]**

The second gap is the **direction of a residue**: the family scores match/mismatch, so an
entry that diverges because rsvelte folds too much and one that diverges because it folds
too little are the same verdict. Both are in this family's history — #2662 and #2665 were
opposite directions of one evaluator — and the ratchet cannot tell them apart. The paired
`.md` has to say which. **[D]**

Third, the indirection axis stops at two levels (`const` → `const`). A fold that survives
two and stops at three is **unmeasured**; the depth guards in the folder
(`MAX_INITIAL_EVAL_DEPTH = 8`, `REACTIVE_INIT_DEPTH >= 8`) are above it and nothing here
reaches them. **[S]**

Fourth — closed by 5q below — every row of `FOLDABLE_EXPRESSIONS` is single-typed, so the
family could not tell two rules for the fold apart.

### Blind spot 5q — CLOSED: `constant-fold` picked expression KINDS, and every one was single-typed

Originally: `FOLDABLE_EXPRESSIONS` chose 17 rows to straddle the boundaries of upstream's
`scope.evaluate` switch, and reached the fold on every run of the gate. What it never varied is
the **type** of the folded operands: `'a' + 'b'` is two strings, `Math.max(1, 2)` two numbers,
`` `p${null}q` `` one interpolation, and `true ? 'a' : 'b'` a test that is itself known, so only
the branch-selection path runs and the branch-identity comparison never does. The family was
therefore green while the client fold carried a folded value as `Option<Option<String>>` — a
representation in which `null` and `undefined` are one value and `0` and `'0'` are one value —
and 12 folds printed the wrong text or the wrong reactivity (#3027).

**[D]** #3027: family `fold-value-type` crosses 8 operand values chosen so that each pair
**collides under stringification while differing as JS values** (`undefined`/`null`,
`0`/`'0'`, `true`/`'true'`, `''`/`0`) against 9 binary operators, 5 unary operators, and — with
an **unknown** test, which `conditional-constant` does not have — 3 ternary hosts. The pre-fix
binary reproduces `typeof '0'` → `number`, `typeof null` → `undefined`, `'0' + 0` → `2`,
`'0' === 0` → `true`, `'10' < '9'` → `false`, `null + ''` unfolded, and `n > 3 ? undefined :
null` judged constant.

The generalization is 5p's, one axis over: **reaching the decision is not being able to tell two
rules for it apart.** 5p's population agreed on every slot; this one agreed on every type,
because the author picked rows by which `case` of the upstream switch they land in — which is
how you enumerate a *dispatch*, not how you enumerate a *value domain*. When a fold family comes
back clean, ask which pair of inputs the fold's internal representation cannot distinguish.

What 5q still does **not** see: the binary/unary product runs in one slot (`interpolation`),
so a fold correct there and wrong in another slot is **unmeasured** — 5n's slot axis carries the
other half, and the two families cross only through the shared normalization, not by
construction. **[S]**

### Blind spot 5p — CLOSED: a `<script module>` seed with no body to revive the cursor

Originally: `comment-slot` did inject into `<script module>` (`mutate.mjs` matches every
`<script` open tag), so the entry point was *generated* — and still measured nothing about the
rule that decides which of its comments survive. The seed's whole body was `export const`,
`let`, and one function, and upstream's builder-made module `Program` starts with its comment
cursor dead, so **every** slot in it is dropped by both compilers. A rule that keeps a comment
iff it sits inside a function/class body span agrees on all of them: 6 line slots × 8 comment
kinds × 4 targets = 192 comparisons, of which the 168 outside the trailing `</script>` slot
scored green while the real rule — the last cursor event at or before the comment is a revive —
disagrees the moment a located body ends and a comment follows it.

**[D]** #3005: the seed now carries a rune class (whose synthesized accessors kill the cursor
again), a static block and a bare block, each with a slot **outside** the body it revived from.
Those three slots are the discriminating ones — the span rule drops all three, official keeps
all three — and the pre-fix binary reproduces them.

The lesson generalizes past this seed: "the family reaches entry point X" is not "the family can
tell two rules for X apart". Every row of the old seed was a case where the two rules **agree**,
so no input the generator could produce from it would have failed for this reason — a
non-discriminating population rather than a non-discriminating comparison, which is the axis
`--update-baseline` and corpus growth both leave untouched.

### Blind spot 5q — CLOSED: binding kind and its host were confounded, so "the same write, moved" was unenumerable

Originally: `binding-position` is `BINDINGS` × `POSITIONS`, and the host is baked into each
binding's `wrap` (`axes.mjs:25-105`) rather than being an axis. Five of its seven bindings —
`state-local`, `derived-local`, `prop-destructured`, `store-auto-sub`, `legacy-let-prop` — put
the body in a named function inside `<script>` and reach the template only through
`onclick={run}`; only the two each-block rows use an inline template arrow. The product
*binding × host* therefore has no cell in the family, and it is not a product the family can be
extended to cover: changing one binding's `wrap` moves that binding, it does not cross the axis.

The second half is `POSITIONS`. Its `assignment.right` row is `let z; z = %s; sink(z);` — the
left-hand side is a fresh local, so no row anywhere in the family puts a reactive read on the
right of an assignment whose **left** is a member expression on a reactive binding. That is the
only shape in which rsvelte pre-transforms a subtree and then walks it again.

**[D]** #3026: `const { state } = $props()` and `state.a = state.b` inside
`onclick={() => { … }}` emitted `state().a = state()().b` — output that parses, that no
existing corpus entry contains, and that throws `state(...) is not a function` on the first
click. Moved verbatim into a `<script>` function it is correct, so `binding-position`'s
`prop-destructured__assignment.right` cell — the nearest cell that exists — is green on both the
binding and the position while the defect ships. The `write-host` family (`generate.mjs`,
`WRITE_BINDINGS` × `WRITE_HOSTS` × `WRITE_SHAPES`, 330 cases / 1,320 comparisons) declares the
three independently: the tree before the fix diverges on **198** of the 1,320 comparisons, the
tree after on **8**. 176 of the 198 are this defect. The family's first run also found two
unrelated ones — a phase-2 `UpdateExpression` that never walked its argument (fixed in the same
PR; it cost the component its `$.push`/`$.pop` and produced a spurious `export_let_unused`), and
a `$bindable()` prop member update that upstream wraps as `p(p().a++, true)` and rsvelte leaves
bare, which is the remaining 8 and is listed in `matrix-known-failures.json`.

What `write-host` still does not vary, so it is not read as more than it is: one element
(`<button>`) and one event (`onclick`) carry every template host, the component host passes the
arrow through one prop name, and the write is always a member expression — a bare
`p = p + 1` reassignment is `binding-position`'s `assignment.right` row and is not repeated
here. **[S]**

**And the same confounding recurs one level down, in the hand-written shadow grids rather than in
this family.** The client's `reference_is_plain_local` veto — "does this write target resolve to
the component's binding or to a shadow" — was measured by ablation over a 24-cell grid crossing
the shadow's HOST (instance function, template handler, each-block handler) with the WRITE SHAPE
(`=`, `++`, `--`, member vs bare). Removing the veto moved **6** cells, and all six are prop
bindings: `$bindable()` and legacy `export let`. A `$state` shadowed by a local and an each item
shadowed by a local moved **0** cells in both directions, because `context.state.transform` only
carries an entry for a prop — so those rows reach the veto and cannot discriminate it. The
grid therefore measures the veto's reach for one binding kind and is **unmeasured** for the
others; crossing shadow × write shape with shadow × **binding kind** is what would size it. Same
lesson as this section's: the thing varied has to be crossed with the thing held fixed, not
merely adjacent to it. **[D]** for the prop rows, **unmeasured** for the rest.

### Blind spot 5r — every gate compares rsvelte to ONE pinned oracle, so a defect the oracle shares is invisible everywhere

The whole pipeline's question is "does rsvelte emit what `submodules/svelte` emits". Where the
pinned compiler is itself wrong, a faithful port scores `match` on every gate here, and the
divergence appears only at the submodule bump — in the PR least able to absorb it, since a bump
already moves output everywhere. The parse oracle (5l) is the one comparison that could see it,
and it **deliberately does not**: `run.mjs:268-270` checks `parseFailure(expected)` first and
routes an unparseable OFFICIAL output to `oracleRejections`, which aborts the run instead of
becoming a verdict. That is the right call for a generated corpus — the message is "fix the case
or widen the oracle" — but it means *upstream emits non-JavaScript* is a run-abort, never a row.

**[D]** #3621. `<my-element bar={await p}>` compiles, under `svelte@5.56.9`, to
`$.template_effect(() => $.set_custom_element_data(my_element, 'bar', await p))` — `await` in a
non-async arrow — because
`build_custom_element_attribute_update_assignment` (`3-transform/client/visitors/RegularElement.js:665`)
is the one attribute slot that passes no memoize callback to `build_attribute_value`, so the
default identity `memoize` applies and the slot bypasses `Memoizer` entirely. rsvelte's
`regular_element.rs:687-716` ports that verbatim, `|expr, _metadata| expr` and all, so the two
agree byte for byte and **every gate in this file is green on it**: the collected corpus never
sets `experimental.async` (5j), the matrix had no case in the cell, the runtime fixtures at
5.56.9 contain no custom element carrying an `await`, and the snapshot suite pins the un-memoized
call as *expected* output (`dynamic-attributes-casing`). The issue was written against the
5.56.10 bump branch and reported it as an rsvelte defect; it is one only relative to 5.56.10.

The same measurement found two more slots where the pinned compiler emits `await` inside a
non-async function — `autofocus={await …}` → `$.autofocus(input, await p)`, and an event
attribute `onclick={await …}` → `(await p)?.apply(this, $$args)` inside
`function (...$$args)`. Unlike the custom-element slot, **5.56.10 does not fix either**, so they
are still shared with the current upstream and still invisible to every gate (#3651).

What closes the general case is not another family: it is running the parse oracle on the
**official** side as a first-class result — an "upstream emits non-JavaScript" report, distinct
from both an abort and a ratchet entry — so a shape whose oracle is broken is *recorded* rather
than either silently agreed with or silently excluded. **Unmeasured:** how many such shapes
exist. Three are known, all found by hand-authoring inputs around one issue; nothing has swept
for them.

The `async-attribute-slot` family does two things about this. It cannot make the *shared* defect
visible today, so it calibrates against the future oracle instead: of the rows that match on the
pin, **8 move when the same cases are compiled against `svelte@5.56.10`** —
`custom-element/attribute` × `{call, async-iife, derived-await-read, script-await-read}` ×
`{client, client-dev}` — two of whose values contain no `await` at all, because the upstream fix
routes a plain **call** through the memoizer too. The bump PR therefore gets a red row rather
than a silent carry-over. The four cells whose *client* oracle is not JavaScript are narrowed to
the server targets by the mechanism 5m describes.

And the neighbourhood it had to cross to say that was not green at all: 200 cases / 792
comparisons reported **310** divergences on the first run — 96 of them output no JS parser
accepts — in an area where the collected corpus is structurally silent (5j) and every runtime
fixture passes. One fix (#3621, the client `style` attribute value, whose memoizer call
hardcoded `has_await: false`) clears 28; the remaining 282 are three named causes (#3648, #3649,
#3650), two of which the async axis did not find on its own: an `await` that is not the
last-evaluated expression is not pickled through `$.save`, and `<svelte:element class:x={f()}>`
emits an unbound `$0` **with no `await` anywhere in the input**. That last one is the host axis
paying for itself, the way `write-host`'s did. **[D]**

The `rune-statement-container` family makes the same boundary explicit for #3420. It crosses
`$state` / `$derived` declarations with a brace-less `SwitchCase`, a labeled statement, bare
`if` / `else`, `for` / `for-of` / `while` bodies, and braced controls, through both `compile`
and `compileModule`. The lexical brace-less case is compared on `server` and `server-dev`, but
not on the two client targets: official lowers its declaration to `$.state(1)` while leaving
`value += 1` and `return value` untransformed, so its client output computes `NaN`. Treating
those bytes as the oracle would make the gate reward a runtime regression. rsvelte's client
answer is instead pinned by `case_clause_state_3420.rs`, and the measurement and decision live
in `upstream_issues/3420-svelte-case-clause-state-references-untransformed.md`. **[D]**

### Blind spot 5s — CLOSED: no family varied the TAG NAME, so a generated identifier could be a keyword

Every family before this one fixed the element (`<button>`, `<div>`, `<b>`) and varied what was
*inside* it. A tag name is not decoration: it becomes a generated variable name, and
`Scope.unique` (`phases/scope.js:728-734`) refuses a reserved word for one — a fourth membership
test rsvelte's `Memoizer::generate_id` did not have.

**[D]** #3582: `<var>x</var>` — no runes, no expression, a standard HTML element — emitted
`var var = root();`, which no JS parser accepts, from a `compile()` that returned successfully.
SVG's `<switch>` is the second standard element in the list; the other 46 names are unknown
elements, which Svelte compiles happily, so being unknown is not what breaks it. Neither the
corpus (`<var>` is absent from the 12,523 collected components) nor the parse oracle
(which only runs on inputs someone supplied) could see it: the population had to be generated.

Family `tag-name` (`generate.mjs`, 48 reserved names + 7 controls × 8 hosts, 440 cases / 1,760
comparisons) declares the name and the host independently. The tree before the fix diverges on
**576** comparisons, **all 576 of them `output-unparseable`**; the tree after, on 0. Its
controls carry the two directions a name-only fix would get wrong: `async` / `of` / `get` /
`set` look like keywords and are not reserved, so they must keep the bare identifier, and
`my-tag` reaches `generate_id_slow`'s sanitizer instead of the fast path — the second allocator
the same omission sat in. The `svelte-element` host was already correct (its variable is named
from a different path), which is what separates "the tag name is not sanitized" from "any
element with this name breaks".

What it does not vary: the element's *content* is one of eight fixed shapes, so a name
interacting with a directive kind, a `{#snippet}` or a component slot is unreached; and the
axis is the reserved-word list alone — a tag name that is merely not a valid identifier
(`my-tag`) is one control row rather than an axis. **[S]**

**Closing 5b/5c:** the matrix costs ~25 s of CPU on ~10,200 comparisons (wall clock on a box
running other agents' builds is unusable — a paired A/B inverted once). `constant-fold` is the
first instalment of 5c's "second expression axis against `EXPRESSION_SLOTS`"; the directive
slots (`use:` / `transition:` / `animate:` / `in:` / `out:`) remain unreached by any family, and
the `.warnings` half of that recommendation is done.

---

### Blind spot 5r — the host axis is worth varying exactly where the rule is per-visitor

`directive-element` crosses directive kind x element kind because upstream applies a
per-directive rule from one `parent_type` test while rsvelte applies it from one arm per element
visitor, so the product drifts. What the family did not say is **which rules that reasoning
covers**, and the answer is not "all of them": it covers a rule decided in phase 2, and says
nothing about one decided in the parser.

**[D]** #3317/#3318 measured both on one harness, so the two are directly comparable:

| rule | where it is decided | hosts | divergences |
|---|---|---|---|
| `experimental_async` on an attribute expression | one arm per element visitor (phase 2) | 12 | **29 of 84 cells**, spread unevenly — `use:` 7 hosts, `{@attach}` 6, `transition:` 4, `in:` 4, `animate:` 3, `class:` 3, spread 2 |
| `{@debug}` argument-list shape | once, in the parser | 10 | **0** — all 17 argument shapes give an identical verdict on all 10 hosts, on both sides, and the pre-fix binary was uniformly *wrong* on all 10 |

Both numbers are needed. The second alone reads as "the host axis found nothing here"; together
they say the host axis is a **property of where the decision lives**, not of the construct being
tested. A parser-level rule has no per-host arm to drift along, so crossing it with hosts buys
coverage of the hosts' own attribute rules and nothing about the rule under test — and a family
that varies hosts for such a rule will be green for a reason unrelated to its motivating defect.

Two consequences for adding rows here. When a family's motivating defect is "one arm per
visitor", the host axis is the axis; when the rule is decided once upstream of the visitors, the
discriminating axis is whatever the single decision *reads* (for #3317, the argument list's
shape). And a uniform result across hosts is worth recording as a measurement rather than
discarded as a null: it is what distinguishes "this rule cannot drift" from "this rule did not
drift on the inputs I wrote".

What this row does **not** establish: rsvelte has phase-1, phase-2 and phase-3 copies of several
decisions, and only phase 2 has been measured this way. Whether a phase-3 per-visitor rule
drifts on the same axis is **unmeasured**. **[S]**

### Blind spot 5u — a construct that works as a SINK has no cell, so removing it scores as a repair [D]

Every cell is a source shape the author wrote, so what a cell can express is what that shape
*emits*. A construct whose whole effect is that some **other** code path stops firing has no
cell at all, and the grid then scores its removal as an improvement.

Measured on the dev event-handler anchor (`3_transform/client/visitors/attribute.rs`). It exists
so that upstream's builder-made `function click(e) {…}` wrapper — which the comment cursor never
reaches — does not let the handler's own anchor place the body's comments a second time. In
every grid cell its own copy lands somewhere visible (inside the wrapper's parameter list), so
the grid reads it as a redundant anchor rather than as a claim. Ablating it:

| instrument | verdict |
|---|---|
| 336-cell comment × host × target grid | 121 → 112: **9 repaired, 0 regressed** |
| every corpus `.svelte` on `client-dev`, byte-compared to official | **2 files LOST byte equality**, one of them `compatibility/pattern-corpus/issues/4046-dev-event-handler-comment.svelte` |

The two files are an expression-bodied arrow (`onclick={() => /* c */ v++}`), which has no
statement list and therefore no chunk, leaving the anchor the only thing that can place the
comment. The grid has no such cell because its slots all put the comment inside a **block** body.

This is the same shape as #2535's css-prune grid (green on all 1,955 rows while three real
`svelte.dev` components reproduced an over-prune), one level more specific: there the missing
axis value was an input shape, here it is the *direction* of the construct's effect. When a
change **deletes** a construct and the grid improves, the grid is the wrong instrument —
`scripts/dev/corpus-output-diff.mjs` is the one that can see it, and it reports byte-equality
movement per file with the denominator printed.

## 6. svelte2tsx TSX text parity

**Unit.** `expected-s2t/<id>/index.tsx` vs `actual-s2t/<id>/index.tsx`, both oxfmt-normalized
(`svelte2tsx-verify.mjs:124-130`) and blank-line-stripped (`:199-200`).

### Blind spot 6a — TSX line and column layout

The gate reformats both sides before comparing. **[S]** Every line and column in rsvelte's TSX
may differ from official's and the gate still reports `match`. This matters because the TSX is
what the language server position-maps into, and gate 7 validates rsvelte's map against
*rsvelte's own* line lengths — so no gate anywhere compares rsvelte's TSX positions to
official's. The header comment at `svelte2tsx-verify.mjs:9-13` claims token/comment parity is
part of the contract; the implementation runs a reformatter. Doc-vs-code gap.

### Blind spot 6b — `exportedNames` and `events`

`svelte2tsx-compile.mjs:116` returns `{ code, mappings }`. **[S]** The public result surface
(`apps/npm/svelte2tsx/index.d.ts:52-66`) also carries `exportedNames` and `events`, both
consumed by the language server, neither compared for any of the ~13.4k corpus components.
(Unit coverage exists in `crates/rsvelte_projection/tests/svelte2tsx_entry.rs`; corpus coverage
is zero.)

### Blind spot 6c — `kind: 'module'` entries are excluded

`svelte2tsx-compile.mjs:85-87` and `svelte2tsx-verify.mjs:79-81` both filter
`e.kind === 'component'`. **[S]** `.svelte.js` / `.svelte.ts` entries are outside this gate.

### Blind spot 6d — one option point

`svelte2tsx-compile.mjs:112`: `{ filename, isTsFile, mode: 'ts', namespace: 'html', version: '5' }`.
**[S]** `mode: 'dts'` (the `.d.ts` emit path), `namespace: 'svg'`, `namespace: 'mathml'`,
`accessors: true` and `version: '4'` are never exercised; `emitDts` is never called. Related:
#2438 (`namespace: 'foreign'` unreachable from the napi boundary).

Gate 39 (`svelte2tsx_option_axis.rs`) now covers part of this, and what it found is the
reason to read the row rather than the count: a 22-variant x 12-source grid against the
official tool reported **124 of 264 cells diverging** while the `gate-default` row — the
option set this gate passes — was **0 of 12**. Corpus size could never have reached any of
them (#3398, #3399). The remaining hole is the option values gate 39 does not enumerate:
`namespace`, `accessors` and `emitOnTemplateError` are measured but were already clean,
`rewriteExternalImports` and `runes` are not in its grid at all, and no gate calls
`emitDts` (the whole-package `.d.ts` driver) — only `svelte2tsx(mode: 'dts')` per file.

### Blind spot 6f — when both sides error, nothing about the error is compared

`svelte2tsx-verify.mjs:219-220`: `expErr && actErr` scores `error-parity` and returns; the
message, the position and the error kind are all dropped. **[D]** rsvelte prefixed its
message with the variant name where official does not — `<div><svelte:head>…</svelte:head></div>`
gave official `` `<svelte:head>` tags cannot be inside elements or blocks `` and rsvelte
`Template error: ` + the same sentence, and *under* that a second prefix, the error code
(`ParseError::SvelteError`'s `Display` is `"{code}: {message}"`), plus a missing docs link.
15 cells of a 288-cell content × container grid reproduced it and the gate reported every
one as parity. The population is not small: the corpus run that found this scored **155**
entries `error-parity`. Fixed in #3135 — both prefixes are gone and the message is assembled
the way the svelte compiler assembles it (`svelte2tsx/utils/error.rs`), pinned by
`crates/rsvelte_projection/tests/svelte2tsx_error_message_3135.rs` because **the gate still
compares nothing about an error but the fact that there is one**.

### Blind spot 6e — `oracle-invalid` accepts anything, unratcheted

`svelte2tsx-verify.mjs:147-150`, `:188-190`, `:205-206`, excluded from `failures` at `:215`.
Two triggers, both of which accept rsvelte's output *whatever it contains* (including the empty
string, which oxfmt parses). **[S]** There is no `oracle-invalid` baseline, so the count can
grow without bound and no step fails.


### Blind spot 6h — a BOM-induced offset shift is absorbed by the reformatter

The compiler's parser strips a leading BOM (upstream's `remove_bom`, at every public entry
point), so its offsets are relative to the stripped text, while `svelte2tsx()` slices the
**unstripped** `source` it was handed. **[D]** On
`"\u{feff}<script>\n\tlet b = 2;\n</script>\n\n<div>{b}</div>\n"` rsvelte emits
`async () => { ` where the BOM-free input gives `async () => {` — a one-character shift, which
this gate's oxfmt pass removes before comparing. ~100 corpus components (cnblocks
`src/routes/preview/veil/**`) carry a BOM and none of them appears in the ratchet, so the gate
reports parity on inputs where the two tools' internal offsets disagree.

Deliberately not "fixed" here: official svelte2tsx has the same shape (it calls a `parse` that
strips and then slices the original), so making rsvelte strip could move ~100 files *away* from
the oracle. It is recorded because the same mixing **was** a real defect one crate over —
`rsvelte_lint` shifted every column on the BOM's line by three and panicked slicing at byte 1
— and there the oracle (ESLint's `SourceCode`) does strip. The rule that separates the two
cases is what the oracle does, not what looks tidy.

### Blind spot 6g — whitespace inside a statement is below the gate's resolution

`svelte2tsx-verify.mjs:218-222` runs `oxfmtTree` on **both** trees before comparing, so the
comparison is over reformatted TSX and any divergence a reformatter absorbs is invisible.
**[D]** Measured in both directions on the corpus: a one-character fix to the widener glue
(`` `${kitType};${name} = …` `` — official emits no space after the `;`, rsvelte emitted one)
turned **90 components byte-equal on the raw output**, and the gate's post-normalization match
count moved **30 → 30**. Ninety real divergences, zero of them gate-visible, and 86 of the 90
were never ratchet entries at all — so neither the failure list nor the match count could have
named them. This is the class corpus growth cannot reach: it is not a missing input, it is a
normalization step applied to both sides.

The consequence for reading this gate: an entry leaving `svelte2tsx-known-failures.json` is
evidence about the normalized text, never about the bytes the language server actually
consumes. Gate 7 does not close it either — it validates rsvelte's map against *rsvelte's own*
line lengths (6a).

### Blind spot 6i — where the port decided a token was code, and the carrier that measured clean

**[D]** The unit is text, so nothing here asks *how* the port reached its answer. Upstream
answers "is this token code?" with a parser — `findNextVerbatimElement`'s regex opens with a
`(<!--[^]*?-->)` alternation arm and skips any match that starts with it, `ComponentEvents`
walks the TypeScript AST, and `Stores` is fed by the Svelte AST walk — while rsvelte answered
it from bytes at **51 call sites carrying 36 distinct literal needles**, plus two scans whose
pattern is constructed rather than literal (the dispatcher identifier, the `$` prefix).
Crossing the needle with the carrier that hides it — 39 tokens x {instance, instance-ts,
module, template-expression} x {`//`, `/* */`, JSDoc, `'…'`, `"…"`, `` `…` ``, `/…/`} plus two
HTML-comment hosts, 1166 cells after the 32 a wrapper cannot carry verbatim — reported **29
divergences** from official, and the fix took it to 8 with 0 regressed (#4114). The corpus
holds this class (10 of the 35 ratchet entries are it), but its key is a file, so the mechanism
is not in the ratchet — it took running both implementations on the listed sources to read it,
and two rows of the mechanism table were still symptoms until then. 29 of the 36 needles appear
verbatim inside a grid token; the 7 that do not are the four comment delimiters themselves
(`//`, `/*`, `*/`, `/**` — a carrier cannot host its own delimiter), an error-message match, an
attribute value (`infinity`), and `}),`, which is matched against the port's own generated text
rather than against source.

**The regex-literal carrier measured clean, and that is a measurement rather than a gap.** 132
of its cells run (the rest cannot be spelled inside `/…/`), and **both** arms — before and
after the fix — report **0 divergences** on all 132. It had read as unmeasured for a mechanical
reason worth keeping: the grid's first usability table was hand-written and rejected 56 of
those cells for a reason about regex *semantics* rather than about whether the cell compiles.
Replacing it with `new Function` admitted them, and they were clean on both arms.

**That clean measurement is true and it did not cover the carrier's other role, which is how
the fix for this blind spot shipped a regression.** Every cell of the grid binds carrier to
needle: one token is placed *inside* one carrier, and the question asked is whether the port
reads the hidden token as code. A carrier has a second role the grid holds fixed — it delimits
a **region**, and the region computation runs identically in all 1166 cells because no cell
varies the markup *around* the needle. `svelte2tsx/utils/lexical.rs`'s
`template_expression_ranges` paired `"` and `'` with no regex rule, so
`{@const m = t.match(/<file type="html" id="([^"]+)"/)}` desynchronized it: the expression's
range ran past its own `}` and swallowed the following attribute, whose **live** `$settings`
read was then dropped from the projection as if it were inside a string. **[D]** — named input
above, reproduced on `open-webui/…/Markdown/HTMLToken.svelte`, and the pair
`store-after-regex-with-quotes-in-const-tag` / `store-after-plain-call-in-const-tag`
(`comment_blind_scans.rs`) discriminates it: ablating the fix reddens only the former.

Two things generalize. The needle axis asks *is this token code*; the carrier axis, crossed
with **position relative to the region boundary** rather than with the needle, asks *where does
this region end* — and only the second reaches a range defect. And the local measurement that
missed it used the **ratchet** as its population: `svelte2tsx-known-failures.json` is the list
of entries that are already wrong, so it structurally excludes every entry a regression could
break. Re-measured over all 33,898 manifest components the fix moves 10 files, 9 toward
official and 0 away, and the broken intermediate scores 1 away — which is the positive control
for the wider population, not for the fix.


### Blind spot 6j — the mirror of `oracle-invalid` had no name, so it had no ratchet

`svelte2tsx-verify.mjs` asked one direction of one question: *is the ORACLE broken* — official's
TSX unparseable while rsvelte's parses (`oracle-invalid`, a pass, blind spot 6e above). The other
direction — **official parses and rsvelte's output is not TypeScript** — had no verdict, so it
fell to `ts-mismatch` and was ratcheted by id alongside ordinary text differences. **[D]**
Measured on `origin/main` (`c33096604`) by running both implementations on the 22 listed sources
with the options `svelte2tsx-compile.mjs` passes and applying the gate's own `oxfmtParses` to each
side's output: **3 of the 20 `ts-mismatch` entries were rsvelte emitting text no TS parser
accepts** — `ha-fusion/src/routes/+layout.svelte` and
`mathesar/…/new-column-cell/NewColumnCell.svelte` (`Expected function body`), and
`svelte-virtuallists/src/lib/VirtualListNew.svelte` (`Unexpected token`). The official side parses
on all 20. Because the ratchet key is the id, a newly unparseable output on any already-listed
component would have been suppressed.

The predicate's *name* is what hid it. `oracle-invalid` says which side it found broken and never
prompts the question "what is it called when the other side is". Two of the three turned out to be
one mechanism, so the class was also under-counted while it was unnamed: an element carrying
`slot=` inside a component went through a second attribute emitter, which wrote a `use:` action as
an entry *inside* the props object and a transition as `ensureTransition(f)(tag, {})` — inventory
row 28.

Closed by a separate `output-unparseable` verdict with its own shrink-only ratchet
(`compatibility/svelte2tsx-unparseable-known-failures.json`, 1 entry). A separate file rather than
a verdict-qualified key in the existing one, for the reason the compiler-error gates keep `start`
and `end` apart: an entry listed for one class suppresses everything its key cannot tell apart.
The extra cost is zero `oxfmtParses` spawns — the `oracle-invalid` test already computed both
sides' parseability and threw one of the two answers away.

**What it still cannot see is the same shape one level out.** The verdict is computed only where
the two texts already differ, so it is a property of the *ratcheted* population, not of the
corpus: an id whose output is unparseable on both sides, or unparseable while byte-equal to
official's, is scored `match` and never reaches the parse call. Gate 19 is the compiler's answer
to that question and svelte2tsx has no counterpart — **unmeasured** how many of the 33,898
components' TSX would fail `oxfmtParses` outside the ratchet.

---

## 7. svelte2tsx source map

**Unit.** `{ mappings, generatedLines }` from rsvelte's own map (`svelte2tsx-verify.mjs:98-101`).
This gate does **not** compare to official's map — that is deliberate and documented
(`sourcemap.mjs:6-18`, `svelte2tsx-verify.mjs:25-30`): the two maps are segmented too
differently to diff, so the gate asserts structural well-formedness and uses official only to
calibrate. Official's map serves as a *veto*: if it violates an invariant, the entry is
`map-oracle-invalid` and rsvelte's map is never examined (`:113-114`).

**The seven invariants** (`sourcemap.mjs:102-157`): decodable VLQ; no more mapping lines than
generated lines; generated columns sorted within a line; no 3+ "stalled copy run"; generated
column in bounds; original line in bounds; original column in bounds.

### Where this gate sits in the family, which is one rung below idempotency

The parity a diff would assert is not merely hard here, it is **empty**. Measured over the
13,464 corpus components for which both tools return a map
(`KNOWN-FAILURES.md#svelte2tsx-map-known-failures`): `mappings` byte-identical **0 of 13,464**,
decoded segment sets identical **0 of 13,464**, `originalPositionFor` identical at every
generated position **0 of a 245-component sample**, and per-generated-line sets of referenced
original lines identical **4 of the same 245**. A parity ratchet would therefore start at ~100%
of the corpus and gate nothing — that is the measurement behind "official is used only to
calibrate", not a preference.

So this is the second gate here whose subject is a **property of rsvelte's own output** rather
than a comparison, the other being transform idempotency. It is one rung weaker. Idempotency is
a *necessary* condition — a correct compiler is idempotent on that step, so a violation is a
defect. Well-formedness of a map is **not even that**: a map can satisfy all seven invariants
and point everywhere wrong (blind spot 7b measures exactly that, with two hand-written maps the
gate accepts). Read a green here as "nothing is structurally broken", never as "the map is
right".

### Blind spot 7a — closed: corpus-wide mapped-line coverage floor (#2453)

`mappedLineCoverage` counts non-empty generated lines carrying a source-bearing segment, and
`svelte2tsx-verify.mjs` rejects a corpus-wide ratio below 75%. **[D]** The pinned official
oracle calibrates the same population at 78.66%; a `"AAAA"` map against 1000 non-empty lines
therefore fails. Per-entry coverage cannot be used: valid official maps can have zero mapped
lines, so only the corpus aggregate distinguishes a truncation from a legitimate generated
wrapper.

### Blind spot 7b — no correctness invariant relates generated text to mapped original text

**[D]** `"AAAA,IAAA,IAAA"` (everything maps to original 0:0) returns `[]`. So does
`"AAEA,IADA,IACA"` (generated line 0 maps to original lines 2, 1, 2 — scrambled). Only
*generated*-column monotonicity is enforced (`:124-126`); original positions may be arbitrary.

### Blind spot 7c — the #2066 defect class is only partially caught

`copy-run-stalled` (`:127-134`) requires original columns to advance by *exactly* +1. **[D]**
`"AAAA,AAAI,AAAI"` — all generated columns zero, original columns 0/4/8 (token granularity) —
returns `[]`. A token-granular regression to zeroed generated columns passes.

### Blind spot 7d — the `source` index is decoded and then discarded

`sourcemap.mjs:121` destructures with a hole: `const [column, , originalLine, originalColumn]`.
`map.sources` itself is dropped at `svelte2tsx-compile.mjs:136`. **[D]** `"ASAA"` (source index
9 against 1 source) returns `[]`.

**Tracked:** #2453. **Closing 7a:** a coverage floor (fraction of generated lines carrying ≥1 segment, calibrated
against official on the same corpus) is a ~20-line addition to `sourcemap.mjs` and would catch
the sharpest case. Cost: low.

---

## 8. css-prune sweep — `scripts/compat-corpus/css-prune-sweep.mjs`

**Unit.** 1969 generated components; `css.code` after hash normalization plus the sorted
`code@line:col` of every warning, compared by `css-prune-verdict.mjs`;
`generate: 'client'`, `dev: false`, `css: 'external'`. Two products: families A/B/C/C3
(`css-prune-sweep.mjs`) vary the markup around a fixed set of sibling selectors; families D-H
(`css-prune-families.mjs`) vary the selector against a fixed set of arrangements.

### Blind spot 8a — an empty population exits 0 — CLOSED, and this row was stale

`EXPECTED_COMPONENTS` (`css-prune-sweep.mjs:52`, check at `:352`) pins the grid size
**exactly**, not as a floor, and runs before either compiler is imported. It was already
present on `origin/main` — `git show origin/main:scripts/compat-corpus/css-prune-sweep.mjs`
has it at the same lines — so this row described a hole that had been filled and nobody
re-read it. That is the failure mode the file warns about in reverse: a row can go stale as
easily as it can be guessed, and a stale row reads as surveyed.

Exactness rather than a floor is right here because the grid is a pure product of the axes in
two source files — its size is a property of the repository, not of a corpus on disk — so any
drift is a source edit that should be stated deliberately.

**[D] Verified locally** by deleting `SELECTORS_D`'s `& &` row (7 components) and running
`--check`:

```
EXIT=2
[css-prune-sweep] grid produced 1962 components, expected 1969
  the generator lost cases; a sweep over a shrunken grid passes by comparing less
```

### Blind spot 8e — every element in the grid is a plain `<div>`, `<p>` or `<span>`, in one component

Both products build their markup from a fixed vocabulary — `ROLE`
(`css-prune-sweep.mjs:83-91`) and `ARRANGE` / `MARKUP_H`
(`css-prune-families.mjs:33-41`, `:120-140`). **[S]** Nothing in the grid is a `<Component />`,
a `<slot>` receiving content from a parent, or an element in an imported component, so the
whole question of *which component's elements a selector is pruned against* is outside the
unit. Upstream's `prune()` iterates one component's `elements`, and every case here has exactly
one component, so a defect that mixed up element ownership across a component boundary would
score green on all 1969.

Related and narrower: the `<option>`/`<selectedcontent>` cloning path in `get_ancestor_elements`
/ `get_descendant_elements` has no row at all, and rsvelte's own
`structural_ancestry_is_lexical` bails out precisely when a `<selectedcontent>` is present — so
the guard is untested by this gate in both directions. The `selectedcontent` **CSS fixture**
covers one instance of it; the generated product does not reach it.

### Blind spot 8f — `dev: false` only

`compileCss` (`:379-384`) pins `dev: false`. **[S]** Pruning is target-independent (that is what
`--both` asserts, when it is passed), but `dev: true` changes empty-rule handling — rsvelte
threads a `dev` flag through `CssContext` for exactly that — and no row here exercises it.

### Blind spot 8b — `--both` cannot fail

`clientServerDiffs` is incremented (`:424`) and printed (`:485`); the exit path (`:495-517`)
reads only `divergedIds`. **[S]** And CI does not pass `--both` anyway
(`corpus-compat.yml:255`).

### Blind spot 8c — `warnings` discarded — CLOSED

`compileCss` returned `{ css }` only, so rsvelte could prune identically and omit the
`css_unused_selector` warning and still score green. It did: an outer rule whose enclosing
selector matched no ancestor pruned to a byte-identical `(empty)` stylesheet either way, so
the whole grid read 1430/1430 while 16 components diverged on warnings alone (#2474).

**[D] Verified locally** on the fixed compiler, by deleting one warning from the rsvelte side
of the comparison: with the `css.code`-only key the sweep still reported `matched: 1430,
diverged: 0`; with the warning key it reports `warning-mismatch`. The verdict now compares the
sorted `code@line:col` of every warning after the CSS compares equal, and
`scripts/dev/test-css-prune-sweep-warning-verdict.mjs` pins that (it fails on the previous
comparator, and also asserts the sweep still routes through it).

`js.code` is still discarded — the sweep is a phase-2 gate and the corpus pipeline compares JS
on real code, so this is deliberate rather than a gap. It is not free, though, and #2744 is
what it costs: **which elements receive the `.svelte-<hash>` scope class is only observable in
the generated JS/HTML**, so a rule that is correctly kept but whose matched element is never
scoped — an emitted rule that can never fire — is green here at any grid size. That defect was
caught by the corpus output-equality gate, on a committed repro, not by this one.

### Blind spot 8d — the `css.code` half is the only half that moves for a scoping bug

The key is `css.code` **plus** the warning multiset, and 8c fixed the direction where the CSS
agrees and the warnings do not. The opposite direction is live and currently occupied: the four
entries in `css-prune-known-failures.json` are `css.code`-only, with byte-identical
`css_unused_selector` sets on both sides (#2719 / #2720 / #2721). **[D]** Verified by the
ratchet itself — each of the four is reported `css-mismatch`, and re-running the comparator
against the warning key alone scores all four `match`.

That is not a hole in this gate (it does compare `css.code`). It is a fact about every gate
*named* for `css_unused_selector`: a selector-scoping defect — a missing `.svelte-<hash>`, a
`:where()` that should not be there — changes what ships and produces no warning at all.

**Tracked:** #2445 (8b).

---

## 9. Formatter parity — JS corpus (`fmt.mjs` + `fmt-verify.mjs`)

**Unit.** Whole-file byte equality against an oxfmt(`svelte: true`) oracle
(`fmt-verify.mjs:102`). No normalization — this is the one gate that compares raw bytes.
Population: manifest entries with `kind === 'component'` (`fmt.mjs:170`).

**The two sides deliberately do not share a CSS engine.** The oracle reaches
prettier-plugin-svelte's PostCSS path for an embedded `<style>`; rsvelte-fmt's default reaches
in-process `oxc_formatter_css`. **[D] #3628:** `.card >> .a` is accepted and respaced by
PostCSS but rejected and preserved by OXC, while both accept `.a || .b` and choose opposite
spacing. Both committed pattern files are ratcheted in `fmt-known-failures.json`. This is part
of the unit, not a blind spot: changing `fmt.mjs` to pass `--no-native-css` would stop the only
large-corpus comparison of the shipped default identified in 10a.

### Blind spot 9a — ids with no oracle file are skipped silently, and nothing counts

`fmt-verify.mjs:97`: `if (oracle === null) continue; // not part of the parity set`.
The only guard is `included.length < 1000` (`:69-76`), read from `meta.json` — **not** from the
number of comparisons actually performed. `matched` is printed (`:149`) and never asserted.

**[D]** CI restores the oracle from `actions/cache` (`corpus-compat.yml:317-323`, caching both
`compatibility/fmt/oracle` and `compatibility/fmt/meta.json`), and `fmt.mjs:184-191` declares
the oracle fresh on `fs.existsSync(ORACLE)` — existence of the *directory*, not of its
contents. A partially-restored oracle tree with an intact `meta.json` passes the `>= 1000`
guard, `continue`s past every id, and prints
`✅ all corpus components format identically to the oracle` having compared almost nothing.

### Blind spot 9b — `meta.skips` is unbounded

Files oxfmt rejects go to `meta.skips` (`fmt.mjs:229-241`) and never enter `included`.
`fmt-verify.mjs:137` records the count in the report and never checks it. **[S]** An oxfmt
upgrade that starts rejecting large swaths of the corpus stays green while `included >= 1000`.
Positive control that a ceiling is the house pattern where someone thought about it:
`crates/rsvelte_formatter/tests/svelte_dev_corpus.rs:337` (`MAX_UNPARSEABLE = 20`).

### Blind spot 9c — `kind: 'module'` excluded

`fmt.mjs:170`. **[S]** `.svelte.js` / `.svelte.ts` files are never formatted or compared here,
and neither are standalone `.css` / `.scss` / `.less` files.

### Blind spot 9d — the gate never asks whether rsvelte's own output is still a Svelte document

The unit is byte equality against the oracle (`fmt-verify.mjs:102`), so a mismatch is one
verdict whether the actual text differs by a two-space indent or is not parseable at all.
**[D]** Compiling both sides' formatted output with the official compiler across all 788 listed
entries (2026-08-31) finds **1** whose rsvelte-fmt output `compile()` rejects, against 0 for the
oracle: `sveltepress/…/icons/SystemDefault.svelte`, where rsvelte-fmt **duplicates a leading
HTML comment and truncates the copies**, dropping their `-->` and swallowing the rest of the
markup (`expected_token`). It had been sitting in `fmt-known-failures.json` as one ordinary
entry since the wave-2 enrolment. The same check over `fmt-oracle-excluded.json` finds 0. The
reduction and the three jointly-required ingredients are in `fmt-known-failures.md`.

The severity half of the same blind spot: of those 788, **674 are render-neutral** (the compiler
emits byte-identical JS *and* CSS from either form) and **114 change what the compiler emits**.
The gate cannot separate them, so 86% taste and 14% semantics ratchet under one key —
the *ratchet entry suppresses everything its key cannot tell apart* rule, one level up from
the matrix gate, which solved the same problem by splitting `output-unparseable` and
`comment-mismatch` out of `js-mismatch` (section 5). **Closing 9d:** run
`parseable.mjs`-style acceptance on the actual side and emit it as its own verdict. Cost:
one compile per failing entry, i.e. per ratchet entry, not per corpus component.

**Note on exclusions:** `fmt-oracle-excluded.json` holds 27 entries, each with a written
justification, partitioned by the JSON's own `class` field (15 oracle-bug, 7 engine-divergence,
3 invalid-input, 2 migrate). This is a *small, justified* set — noted
here so it is not mistaken for a blind spot. Its staleness check is `console.warn` only
(`fmt-verify.mjs:110-126`).

**Tracked:** #2447. **Closing 9a:** assert `matched + failures.length + excluded === included.length`. Cost: trivial.

---

## 10. Formatter parity — Rust svelte.dev corpus

**Unit.** `rsvelte_formatter::format(&input, &opts)` vs a generated `expected.svelte`
(`svelte_dev_corpus.rs:289-290`), over real `.svelte` files and ```svelte markdown fences from
`submodules/svelte.dev`.

### Blind spot 10a — it exercises the non-default CSS path

`svelte_dev_corpus.rs:100-106` identifies its style callback as the legacy `--no-native-css`
path and pipes each `<style>` body through an `oxfmt` subprocess (`:130-155`). **[S]** In shipped
`rsvelte-fmt` that function is reached **only** under `--no-native-css`
(`crates/rsvelte_fmt/src/options.rs:154-157`); the default is the in-process
`rsvelte_formatter::native_style_formatter`. Consequence: the default native CSS engine's parity
with the embedded PostCSS oracle is measured only by gate 9's whole-file compare, and
`crates/rsvelte_formatter/tests/css_native.rs` is 5 hand-written `assert_eq!`s against literal
strings, not a parity gate. #3628 corrected the stale comments but did not change this coverage
boundary.

### Blind spot 10b — `Err(_)` from `format` does not fail the test

`svelte_dev_corpus.rs:300-303` routes errors to `unparseable`, bounded only by
`MAX_UNPARSEABLE = 20` (`:337-343`). **[S]** A sample flipping from *formatted correctly* to
*unparseable* is a pass.

**Vacuity, for the record:** this gate has the best-defended skip conditions in the repo — every
early `return` is guarded by `assert!(!in_corpus_job())` (`:71-74`) and CI sets both required
env vars (`ci.yml:610,615`), plus `:262` asserts the sample list is non-empty. Use it as the
model when adding floors elsewhere.

---

## 11. Lint output parity — `lint-verify.mjs`

**Unit.** Per file, a **Set** of `` `${ruleId}\t${line}:${col}\t${message}` `` (`:90`). This is
the only gate in the repo that *does* compare message text.

### Blind spot 11a — `.svelte.js` / `.svelte.ts` were outside the gate on *both* sides — CLOSED (#2465 → #2448)

**Status: closed.** `lint-verify.mjs` compares modules as of #2448, after #2465 taught the CLI
to collect them. **[D]** The run states the population it graded:
`compared: 6578 component (oracle 73209 / rsvelte 73194 findings), 160 module (oracle 418 /
rsvelte 394 findings), 23 oracle-unparseable, 0 unmeasured of 6761`. Enrolling the surface added
**24 divergences** (80 → 104), 23 of them the one rule this row predicted — see the licence
paragraph below. A population with no module in it now exits 2 rather than reading as clean
(`lint-verify.mjs:300`), because a re-introduced filter is otherwise indistinguishable from a
passing run; `scripts/dev/test-lint-verify-population-floor.mjs` is the negative control.

**What the module half still does not see.** It is the same comparison key, so 11b/11d/11e apply
unchanged. Two module-specific limits on top: eslint-plugin-svelte's `flat/base` gives a module
no Svelte *template*, so only script-AST rules can fire on those 160 entries — the 418/394
findings are drawn from a smaller rule set than the component figure, and a template-rule
divergence is unreachable there by construction. And the corpus's module population is 160 of
6761 (2.4%), all from library code; `lint-collect.mjs` extracts markdown modules only for the
two curated doc repos, which 11f already excludes from CI.

The original finding, and the correction it needed, are kept below because the correction is the
transferable part.

**Correction (2026-08-07).** An earlier revision of this row said rsvelte-lint's module findings
"land in `byFile`" and that "both sides produce module findings; neither is compared". That was
wrong, and it is worth recording how: the claim was inherited from a sweep and shipped with an
`[S]` label without the citation being opened. `rsvelte-lint` **cannot lint a module at all** —
`collect_files` (`crates/rsvelte_lint/src/main.rs:65-82`) admits a path only when
`path.extension() == "svelte"`, both on the directory walk (`:71`) and on an explicit path
argument (`:75`), and `Path::extension()` returns `"js"` for `a.svelte.js` and `"ts"` for
`a.svelte.ts`. **[D]** Verified with a standalone `rustc` program over all four cases:
`a.svelte` → `Some("svelte")`, match; `a.svelte.js` → `Some("js")`, no match; `a.svelte.ts` →
`Some("ts")`, no match; `a.js` → `Some("js")`, no match (negative control).

So the surface is unguarded on both sides, and the two causes need fixing in order — see
`main.rs` gap below, then the gate filter. Removing `lint-verify.mjs:84` **alone** would not
measure rule parity; it would fill the ratchet with `-` (false-negative) entries reporting that
the rsvelte CLI linted none of those files.

The engine is not the limitation: `run_script_rules_module` (`crates/rsvelte_lint/src/engine.rs:332`)
is public and implemented, `engine.rs:124,132` dispatch `.svelte.js`/`.svelte.ts` to it, and
several rules implement the `ScriptRule` hook specifically to reach it (`no_store_async.rs:5`,
`require_stores_init.rs:4`). Only the CLI's file collection is missing.

**This blind spot is a feedback loop, not a gap.** `prefer_svelte_reactivity.rs:19-21` declined
to port a rule path upstream implements, stating the reason outright: *"The plugin additionally
flags exported instances in `*.svelte.js` / `*.svelte.ts` modules; those fixtures are
`.svelte.js` files (not collected by the component oracle) and that path is intentionally not
ported here."*

**[D] The prediction held on the numbers.** Of the 24 entries enrolment added, **23 are that
rule**, and the 24th is a second module-only path (`no-navigation-without-base`). The licensed
gap was not a fraction of the new backlog — it was almost all of it.

Read that carefully. The ungated surface did not merely *hide* divergence — it **licensed** it,
and the licence is written down in a place where nothing forces it into view. A gap leaks; a
loop widens. Every gate this document describes can do the same thing, because "the oracle does
not cover it" is always available as a reason to stop, and it is always locally reasonable.

That is the strongest argument here for maintaining the inventory, and it is stronger than any
single row: the cost of an unobserved surface is not bounded by the defects that have drifted
into it, because the surface also decides what gets built. **When you scope work by what the
gate checks, the gate stops being a measurement and becomes the specification.**

### Blind spot 11b — duplicate findings collapse

Both sides are `Set`s (`:105`, `:133`, `:153`). **[S]** If rsvelte-lint emits the same finding
twice at the same position — a shape `crates/rsvelte_lint/src/registry.rs:36-38` explicitly
warns about — the Set collapses it. Deliberate contrast: the svelte-check gates use *multisets*
specifically to avoid this (`check-verify.mjs:31-35`).

### Blind spot 11c — an oracle-fatal file drops rsvelte's findings for it, with no ceiling

`lint-verify.mjs:272-276`: `if (o.fatal) { oracleFatal++; continue; }`. **[S]** rsvelte can
emit 50 false positives in a file `svelte-eslint-parser` rejects and it is invisible; the count
is printed (`:289`) and never gated. Its neighbour *is* gated as of #2520: an entry the oracle
returned **no result for** used to take the same silent path through `o?.set ?? new Set()`,
which reads a missing measurement as "the oracle found nothing"; it now aborts (`:291-297`).
The two look identical in the output and are opposite verdicts — "the oracle read it and
rejected it" vs "the oracle never answered".

### Blind spot 11d — autofixes, suggestions and severity

The oracle projects each message to `{ruleId, line, column, messageId, message}`
(`lint-oracle/run.mjs:201-209`), discarding `fix`, `suggestions`, `severity`, `endLine`,
`endColumn`. rsvelte's SARIF `fixes` array and `level` are never read (`lint-verify.mjs:143-155`).
Severity is *pinned* to `warn` on both sides (`lint-oracle/run.mjs:72`, `lint-verify.mjs:118`).
**[S]** Compensating control: `crates/rsvelte_lint/tests/eslint_plugin_oracle.rs` compares
autofix output byte-for-byte on fixtures.

### Blind spot 11e — the rule universe is an intersection with no floor

`lint-universe.mjs:64-85`: `rsvelte-lint --list-rules` ∩ `eslint-plugin-svelte.rules` − 9
excluded. `lint-verify.mjs:167-168` prints `universe.length` and asserts nothing. **[S]**
Removing a rule from `crates/rsvelte_lint/src/registry.rs` drops it from the universe, filters
it out on *both* sides (`:110`, `:145`), and goes green — for any rule with no entry in the
104-entry ratchet. A rule rsvelte never implemented is invisible by construction. The rule axis
is also the one axis the `--update` floor added by #2520 does **not** cover: the floor counts
sources, so a rewrite taken from a run whose universe collapsed still passes it.

### Blind spot 11f — CI collects a narrower corpus than the script offers

`corpus-compat.yml:420` runs `lint-collect.mjs --ci`, whose repo list (`lint-universe.mjs:24`)
omits `svelte` and `svelte.dev`, which `lint-collect.mjs:43-44` does offer. **[S]** In CI the lint corpus contains no `.svelte`
file from the Svelte repo and no documentation snippet. `compatibility/pattern-corpus` — the 32
hand-written regression repros — is also not in that list.

**[D] The entry-count floor added by #2520 cannot police that list on its own**, because it is a
**lower** bound: the CI list yields 6761 entries and the floor is 6000, so dropping `melt-ui`
(84 files) leaves 6677 and clears it, and a *superset* run clears it by definition. The repo set
is what makes this axis exact — `--update` now requires it to equal `CI_REPOS`
(`lint-universe.mjs:24`), which `lint-collect.mjs --ci` and `corpus-compat.yml:420` both consume,
so the collector, the workflow and the rewrite guard cannot disagree about which population the
ratchet describes. Both directions are covered: a missing repo would delete its entries, an extra
repo would add entries that fail every later run as stale.

### Blind spot 11g — every `svelte_scan` source-scan rule is outside the universe

The four rules that resolve their facts by scanning `<script>` text through
`crates/rsvelte_lint/src/svelte_scan.rs` are *all* in `EXCLUDE`, each for a different structural
reason: `svelte/no-unused-props` (`lint-universe.mjs:26`, type-aware),
`svelte/require-event-prefix` (`:33`, the oracle has no checker),
`svelte/experimental-require-strict-events` (`:40`) and
`svelte/require-event-dispatcher-types` (`:41`, both Svelte 3/4-only). **[D]** The word-boundary
predicate they share can therefore be wrong in *both* directions with the ratchet at zero
entries and CI green: `is_ascii_ident_byte` classified every non-ASCII character as a boundary,
so `interface $$Eventsé {}` satisfied the `$$Events` requirement, an `as créer` alias truncated
to `cr` and its call went unreported, and a whole-object `const prôps: Props = $props()`
panicked on a mid-character slice (#2684). Because the rules are outside the universe rather
than listed as failures, "re-baseline the ratchet" is not a remedy for this family; the
compensating control is `crates/rsvelte_lint/tests/non_ascii_word_boundary.rs`, which drives all
four rules through `lint_source` in both directions (a non-ASCII letter is glue; a non-ASCII
space is a boundary).

---

## 12-13. svelte-check diagnostic parity (Layer 1 fixtures, Layer 2 e2e)

**Unit.** A multiset of `` `${severity} ${relpath}:${line} ${code}` `` (`check-diagnostics.mjs:18`,
`:63`). Layer 1 = 36 committed scenarios under `compatibility/check-fixtures/`
(`check-verify.mjs:149-156`); Layer 2 = 3 units in 2 real repos
(`check-e2e-verify.mjs:62-98`), sharing the same parsing module (`:49`).

### Blind spot 12a — column, message, `source`, and `end` are outside the key

`check-diagnostics.mjs:63` builds the key from `d.type`, `d.filename`, `d.start.line`,
`d.code`. `message` and `source` are captured into `detail` (`:65`) and written to the report
(`check-verify.mjs:239,247`) but never diffed. **[S]** The line-position part is deliberate and
documented (`check-verify.mjs:25-29`); the consequence is that the exact regression class of
scenario `svelte-import-diagnostic-line` (#2112, "pinned every import diagnostic to line 1") is
caught only because it moved the *line* — a column-only version is invisible.

### Blind spot 12b — the `COMPLETED … FILES` summary is discarded

`check-diagnostics.mjs:55` skips every non-`{` payload; `:62` drops every non-ERROR/WARNING
type. The summary line emitted by `crates/rsvelte_diagnostics/src/writers.rs:263-275` is never
parsed. **[S]** A scenario where rsvelte-check walks *fewer files* than official and the
missing files are clean compares equal. Given that the check gates exist for workspace and
file-discovery parity (`check-verify.mjs:14-17`), this is the sharpest blind spot in the family.

### Blind spot 12c — no positive-control assertion, and both ratchets are `[]`

`check-verify.mjs:240-242` logs counts and asserts nothing about them. **[S]** Any scenario
whose oracle diagnostic set is empty is green whether rsvelte-check ran correctly or produced
nothing at all. A *global* collapse would still be caught (scenarios that expect errors would
diverge), but per-scenario vacuity is not.

### Blind spot 13a — whether the Layer 2 units produce any oracle diagnostics at all

**[U]** `compatibility/check-e2e-report.json` is gitignored (`.gitignore:166`) and the
submodules are not installed in this worktree. If all three units are clean under official
svelte-check — plausible for a maintained starter and a library that runs `pnpm check` in its
own CI — then Layer 2 is structurally a "rsvelte-check must also find nothing" test: it catches
false positives and nothing else. **This is a question, not a finding.** Resolve it by reading
`check-e2e-report.json` from a CI artifact.

### Blind spot 12d — the CLI surface is one point

`check-verify.mjs:197-202` forwards only `--workspace`, `--tsconfig`, and per-scenario `args`.
Exactly one of 36 scenarios uses `args` (`ts7-native`: `["--tsgo"]`). **[D]** `--threshold`,
`--fail-on-warnings`, `--ignore`, `--compiler-warnings`, `--config`, `--watch` and the `human` /
`machine` / `github-actions` output formats are compared against the oracle nowhere.

`--config` is the discriminating case (#2650). It changes *where the compiler options come
from*, so it can move any diagnostic in any scenario, and it shipped classifying its argument by
asking whether the filename began with `vite.config` — false for precisely the non-standard names
the flag exists to accept. `--config vite.custom.config.js` therefore read the file as a Svelte
config, found no `compilerOptions`, and reported `experimental_async` on every top-level `await`
in a project that had enabled it. Two things kept that invisible: no scenario passes `--config`,
and the flag's own unit tests all went through *discovery* (`load_compiler_options(&dir)`), so the
explicit branch had **zero** tests across its three consumers — one of which (`kit_file.rs`)
carried a third copy of the same wrong predicate.

The lesson generalises past this gate: a flag that selects an input source is not one more
option to forward, it is a **second population**. Compare 5a, where the same shape (an entry
point nothing reached) hid a whole compiler path.

### Blind spot 12f — the `compilerOptions` surface is compared only at the keys a scenario sets

Six scenarios now set a `compilerOptions` key (`svelte-config-namespace-{foreign,html}`,
`svelte-config-accessors{,-off}`, `svelte-config-{un,}recognised-option`), each half of a pair
whose two projects are byte-identical apart from that one value. That is what makes 12d's
"essentially no explicit-config branch is exercised" one notch less true — but only for those
keys. The compiler accepts 32 options
(`crates/rsvelte_check/src/svelte_check/options_schema.rs`'s `COMPONENT_OPTIONS`, derived from
`validate-options.js` by `schema_matches_upstream`), and the rest are compared against the
oracle nowhere.

Three things this gate structurally cannot see, all **[S]** unless noted:

* **Deprecation and `warn_removed` warnings.** `accessors: true`, `immutable: true`,
  `hydratable`, `enableSourcemap`, `loopGuardTimeout` and `generate: 'dom'` produce *warnings*
  through the compiler's `warn_once`, whose `warned` set is module-global — so upstream emits
  each at most **once per svelte-check process**, on whichever component happened to compile
  first. rsvelte-check does not reproduce them at all. **[D]** Confirmed against the pinned
  oracle: two successive `compile(..., { accessors: true })` calls yield
  `options_deprecated_accessors` on the first and nothing on the second. This is also why the
  accessors pair keys off `customElement` rather than `accessors` — `accessors: true` would put
  a once-per-run warning inside the scenario and force a ratchet entry, which would then
  suppress every other divergence in it.
* **Anything the static config reader cannot evaluate.** The oracle imports the config, rsvelte
  parses it; `namespace: ns` or a spread is a legal value to one and unreadable to the other. A
  scenario written with a computed value would compare "no diagnostic" to "no diagnostic" for
  the wrong reason.
* **Which of `svelte.config.*`, the inline `svelte()` / `sveltekit()` plugin options, and
  `--config` supplied the value.** Every scenario uses `svelte.config.js`; the precedence rules
  in `config.rs` are covered by unit tests only, and `--config` by nothing (12d).

### Blind spot 12e — the tsc/tsgo equivalence claim is asserted, not measured

Both matrix legs ratchet against the same `check-known-failures.json` (`check-verify.mjs:88`),
justified at `:81-87` by "measured locally, tsc and tsgo produce IDENTICAL diagnostic sets".
**[S]** Nothing in the repo re-verifies that.

---

## 14. Compiler source-map gate — `crates/rsvelte_core/tests/sourcemaps_gate.rs`

**Unit.** 29 samples from the upstream sourcemaps suite: 23 hand-ported anchor assertions
(`:127-189`), out-of-range segment budgets, and `map-parity` against the official map. Floors at
`:1011-1028`; staleness fatal at `:1061`. Ratchet: 0 entries (2026-08-30).

### Blind spot 14a — segments rsvelte *adds* are never inspected

`parity()` iterates `theirs.lines` only (`:537`). **[D]** A segment rsvelte emits at a generated
position where the official map has none is never visited; `out_of_range` (`:463-501`) flags
only positions past end-of-line and `has_negative_segment` (`:507`) only negatives, so an extra
mapping to an in-range original position passes all three checks.

Demonstrated on 2026-08-30. `keyword_cursor` / `write_keyword` mapped builder-made nodes that
upstream skips on `node.loc`, so every synthesized `var root = $.from_html(…)` and every
synthesized `import` anchored its keyword at offset 0 of the `.svelte` file — **236** segments
over the 29 samples (1870 with this defect restored against 1634 without it, the two runs
differing in nothing else), all but 3 of them pointing at in-range positions inside the opening
`<script>` / `<style>` tag. The gate scored 768/770 throughout. They became visible only when a
*separate* fix stopped `Driver::push_mapping` from overwriting a mapping at a repeated generated
column: the spurious anchors then displaced official ones, and 12 of the 29 samples' client maps
turned `wrong`. Two lessons, one per direction —
a defect in this blind spot can be surfaced by fixing something else entirely, and a collapse rule
that keeps the last write is a repair that hides what it repaired.

### Blind spot 14b — `sources`, `sourcesContent`, `names`, `file`, `version`

`parity` compares `s[1..4]` only (`:548`); `names` is explicitly excluded (`:273`). **[S]**
Changing rsvelte's `sources` to `["wrong.svelte"]` leaves the source index at 0 and every check
passes.

### Blind spot 14c — `dev: true` maps

`compile_sample` (`:616-621`) never sets `dev`, and `EXPECTED_FIXTURE_COMPILE_OPTIONS` pins the
oracle to `{"dev":false}` (`:219`). **[S]** Positive control: `command grep -n "dev"` on this
file returns only line 219, while the same grep on `ast_gate_preconditions.rs` returns lines
66/80/83 — that file *does* cover client-dev.

### Blind spot 14d — CSS maps get one anchor

`measure()` loops `[Target::Client, Target::Server]` (`:724`) and `official()` returns `None`
for `Target::Css` (`:671`). **[S]** No out-of-range, negative, missing-map or parity check for
CSS maps; the whole surface is one anchor on one sample (`:138`).

### Blind spot 14e — the parity population can rotate under a fixed floor

`EXPECTED_IDENTICAL_OUTPUTS = 57` (`:1023`) is a floor on the *count*, and the "NO LONGER
MEASURED" branch (`:959-967`) fires only for pairs that have a budget entry. **[S]** A change
that breaks byte-identity for one unratcheted pair while fixing another keeps the count at 57
and reports nothing; the dropped pair silently stops being measured.

 ### Blind spot 14f — a uniform shift of every original line passes every check

The 29 samples all use `\n` line endings, and no check compares rsvelte's original line
*numbering rule* to official's. **[D]** #3412 proposed widening
`rsvelte_esrap::printer::line_starts` to the full ECMAScript LineTerminator set. That function is
the source-map original-coordinate table as well as the comment-placement one, by **two**
routes: the coordinate readers take `map_line_starts.unwrap_or(&self.line_starts)`
(`esrap/src/printer.rs:757`, `:810`, `:889`), and `print_with_map` never sets `map_line_starts`, so
there `line_starts` *is* the coordinate table — while `print_split` does set it, from the very same
`printer::line_starts` (`esrap/src/lib.rs:191`), with `3_transform/client/mod.rs:2554` passing the
**component source** as `map_source`. Both routes are therefore in range; enumerating only the
`print_split` one understates it. The change moves the original line of everything after a lone
`\r`, U+2028 or U+2029. Applying
only that function's body to an otherwise unchanged tree and running this gate: **3 passed, 1
ignored — green.**

The discriminating measurement is a decode of `mappings`, collecting the distinct original lines
any segment points at, for
`<script>\nlet aaa = 1;{T}let bbb = 2;\n</script>\n<p>{aaa}{bbb}</p>`:

| `{T}` | official | rsvelte | rsvelte with the widened table |
|---|---|---|---|
| `\n` | 1,2,3,4,5 | 1,2,3,4,5 | 1,2,3,4,5 |
| `\r\n` | 1,2,3,4,5 | 1,2,3,4,5 | 1,2,3,4,5 |
| `\r` | 1,2,3,4 | 1,2,3,4 | **1,2,3,4,5** |
| U+2028 | 1,2,3,4 | 1,2,3,4 | **1,2,3,4,5** |
| U+2029 | 1,2,3,4 | 1,2,3,4 | **1,2,3,4,5** |

Two rows agree on all three columns, so the table is a control rather than an assertion: official
counts **only `\n`** for original positions, even though esrap's *comment* placement reads acorn
`loc`, which advances on all four. The reason this gate cannot see it is structural rather than
sampling: `parity()` compares rsvelte's segment to official's at the same **generated** position
(`:537-548`), and a shift that moves both sides' notion of an original line identically for every
sample containing no exotic terminator leaves every anchor, budget and parity check satisfied —
while `map-parity` itself never runs on a sample that *does* contain one, because none exists.

 Recorded because the next person to touch a coordinate table will read this gate as the negative
 control for that change. It is not.
 
 ### Blind spot 14g — a pass that never fires reads exactly like a pass that became redundant

The gate is 29 samples, and it is the only evidence available when deciding whether a
source-map enrichment pass can be deleted (#3015 step 3). Measured by disabling one client
pass at a time: `collapsed_declaration` and `rune` cost **0 segments on `main` and 0 after
#3015's span work**. **[D]** That is a discriminating case in the negative direction — the
same reading is produced by "these samples contain no `$state`/`$derived`/`$props` lowering
whose position the pass would have supplied" and by "a span now supplies it", and nothing in
the gate separates them. Deleting a pass on a 0 therefore needs a population that fires it;
the passes deleted in #3015 (`default_function_wrapper` 84 → 0, `effect_callback` 8 → 0,
`template_element_runtime` 25 → 0, `legacy_prop_read` 16 → 0, `inline_script` 7 → 0,
`bind_value` 5 → 0, `component_bind` 5 → 0, and `verbatim_import` 4 → 0)
carry a *movement*, which is the reading a 0 cannot give.
The last row also exposed a second blind spot in that measurement: counting generated segment
positions alone reported 0 after the span landed even while the token fallback won the same
position with the wrong original `foo`. Its compile-level regression therefore pins both ends
of each carrier, not merely the presence of a generated segment.
Both passes now have independent populations before deletion. The `collapsed_declaration`
regression uses `let` and its name on separate source lines, verifies that both client and server
code generation collapse them, and pins the generated name to the original name. The `rune`
regression constructs all eight source/runtime pairs — including the two pairs each sharing
`$.state` and `$.derived` — and pins both generated endpoints to the corresponding rune endpoints.
The wrapper's original deletion still
left a comment-only fallback behind; its final regression therefore constructs a component with
an instance comment and checks all four brace-boundary segments, a population this aggregate
count does not identify.

The final `token` pass exposes a third outcome this gate cannot distinguish. After every named
client pass was replaced, a diagnostic found **32** generated positions owned only by token
matching, but all 32 were incomparable because the generated line/source pairing did not match
official byte-for-byte. A non-zero contribution is therefore not evidence that the contribution
belongs in the official map. Independently decoding the pinned official maps showed those
heuristic positions were absent or attached to a different generated token; the token pass was
deleted with no official segment attributed to it. This is **[D]** for the diagnostic's
incomparability and an independent-oracle result for the deletion, not a claim derived from the
aggregate segment count.

 There is no corpus-wide source-map gate to fall back on: `verify.mjs` compares generated
 code, and the svelte2tsx map gate (§ 12) covers a different artifact.

The component-bind pass illustrates why the discriminating test must survive a partial
deletion too: its generated-text search formerly supplied both `get`/`set` property-key
segments and a template-interpolation segment. The accessor keys now carry the complete raw
directive-name range as dedicated spanned property-key variants, and the pass no longer searches
for `get` or `set`; its remaining `${name() ?? …}` scan is a separate carrier and must not be
declared redundant from the accessor movement alone.

### Blind spot 14h — the unit is a segment, so a change that improves the map and breaks the *code* scores green

Every comparison here reads `map.mappings`; nothing in the file looks at the generated JS the
map describes. **[D]** #3015 kept `JsExpr::Spanned` on a member expression's *object*, which
measured **+18 client segments and passed all four tests** — while making the client lowering's
`while let JsExpr::Member` / `if let JsExpr::Identifier` chain walk in
`client/visitors/shared/component.rs` miss the root binding, so a `bind:` setter emitted
`bar.baz = $$value` instead of `bar(bar().baz = $$value, true)`. 49 runtime fixtures caught it;
this gate could not, because a correct segment pointing at wrong code is indistinguishable here
from a correct segment pointing at right code. Any IR change that both moves positions and
changes lowering must be run against `tests/runtime.rs`, not this gate alone.

There is no corpus-wide source-map gate to fall back on: `verify.mjs` compares generated
 code, and the svelte2tsx map gate (§ 12) covers a different artifact.

Related open work: #1781 (client maps are chunk-granular; 16% point outside the source range).

---

## 15. `crates/rsvelte_core/tests/ast_gate_preconditions.rs`

**Unit.** For every `.svelte` sample in 6 suites (`:19-26`) × 3 targets (`:64-68`),
`rsvelte_ast_equiv::canonicalize(&result.js.code)` must not error (`:93`) — i.e. rsvelte's own
output parses with OXC, 100%.

### Blind spot 15a — compile failures are skipped, so errors make the gate *greener*

`:90-92`: `let Ok(result) = compile(...) else { continue };`. The skip itself is deliberate and
justified in-code — *"these samples include deliberately invalid input, and validation is gated
elsewhere"* — so the blind spot is not the `continue`, it is that **nothing counts how many
samples survived it**. **[S]** The only floor is `files.len() > 1000` on *input discovery*
(`:57`); there is no per-target floor on samples actually canonicalized. Breaking `server`
codegen so `compile()` returns `Err` for 200 samples leaves `files.len()` unchanged, `continue`s
past all 200, and leaves `failures` empty.

The fix is therefore a counter, not a policy change: assert that the number of samples reaching
`canonicalize` per target stays near its measured value.

### Blind spot 15b — it parses the left side only

`compare_with` (`ast_equiv.rs:219`) can report `Unparseable{side: Right}`; this precondition
never evaluates the oracle's output. **[S]**

### Blind spot 15c — it cannot see the `CommentPolicy` problem (gate 1a)

`canonicalize` inspects only the `Err` branch. `CommentPolicy` affects the comment vector
(`lib.rs:161-173`) and the annotation flag (`:186`), neither of which influences whether
`Parser::parse` succeeds (`:152-159`). **[S]** Positive control:
`grep -n "CommentPolicy\|comments\|argv"` on this file returns no hits. Recorded because the
existence of an "AST gate precondition" test invites the assumption that the AST comparator is
under test here. It is not.

### Blind spot 15d — wrong population for the gate it serves

It covers the Svelte sample corpus; the gate that consumes the precondition (`verify.mjs`) runs
over 14,025 real-world entries. **[S]** `ast-equivalence.md:97-100` claims all 3888 flowbite
outputs parse; nothing asserts that.

---

## 16. Validator fixture suite — `crates/rsvelte_core/tests/validator.rs`

**Unit.** Two tests over the same 334 upstream samples.

`test_validator` compares, per fixture, the **ordered** warning array as
`(code, stripped message, start line:col, end line:col)` — `validator_warnings_match` in
`tests/common/mod.rs`, mirroring upstream's `assert.deepEqual` — plus the expected error's
code / message / span. Oracle: the sample's checked-in `warnings.json` / `errors.json`. Ratchet
`compatibility/validator-known-failures.json`, **0 entries**, against a 332-fixture floor
(`validator.rs:29`).

`validator_warning_messages_match_official` compares warning **message text** for every fixture
where the two sides already agree on codes and counts, against the *generated* oracle
(`fixtures/*/validator/<name>/warnings.json`) rather than the checked-in file — see
`compatibility/validator-message-known-failures.md` for why the oracle has to be "official run
on this input" and not "official's committed expectation". Ratchets
`validator-message-known-failures.json` (**0**) and `validator-message-not-comparable.json`
(**0**).

### Blind spot 16a — closed: two-sided, and "not failing" is three states, not two (#2452, #2579)

Both ratchets are two-sided, and both now separate the two ways an entry can stop failing.
`test_validator` distinguishes a listed id that **ran and passed** (stale, delete it) from one
that names **no runnable fixture** (unmeasured — deleting it buries whatever removed the
fixture). The message test distinguishes a listed id that was **compared and now matches**
from one that **no longer reaches the comparison**, and reports the latter as a regression
naming its cause. **[S]** Before this, a fixture whose codes or counts regressed left
`diverged` through the `continue` filters and was reported with the same wording as a fixed
message; #2579 records the instance on `main`.

The `NotComparable` taxonomy is the mechanism: three causes are structural (`OptedOut`,
`NoInput`, `BothRejected`) and six are rsvelte divergences (`NoOracle`, `Panicked`,
`RsvelteRejected`, `RsvelteAccepted`, `CountDiffers`, `CodesDiffer`) that must be declared in
`validator-message-not-comparable.json`. Raw counts — fixtures compared, **messages** compared,
and a per-cause histogram — are printed every run, because a rate cannot tell "no divergences"
from "no comparisons".

### Blind spot 16b — the two floors are floors, not equalities

`MIN_VALIDATOR_FIXTURES = 332`, `MIN_MESSAGE_COMPARISONS`, `MIN_MESSAGE_TEXTS`. **[S]** A floor
set below the measured value leaves headroom in which a fixture can silently stop being
compared without any entry appearing anywhere — which is precisely why `MIN_MESSAGE_TEXTS`
exists alongside `MIN_MESSAGE_COMPARISONS`: the latter counts *fixtures*, and a fixture where
both sides emit zero warnings reaches the comparison while comparing nothing, so the fixture
count can hold while every text comparison disappears.

### Blind spot 16c — `_config.js` is read by substring match, and only four keys are read

`parse_test_config` (`validator.rs`) greps the file for `skip`, `warningFilter`, `runes`,
`customElement` and `dev`. **[S]** Any other `compileOptions` key upstream adds is silently
dropped, and the fixture then runs — and passes — under options upstream never used. The same
applies to `options.json`, which upstream's `test.ts` spreads over `compileOptions` and this
harness ignores entirely; today exactly one sample has one (`error-mode-warn`) and it is
`skip: true`, so the hole is currently unreachable rather than absent. `dev` was in this
position until #2452/#2579: two samples (`each-block-multiple-children`, `non-empty-block-dev`)
set `dev: true` and ran in prod mode, both expecting `[]` warnings — a **vacuously** green pair.

### Blind spot 16d — `generate: client`, where upstream passes `generate: false`

Upstream's `test.ts` runs analysis only; this harness compiles for the client
(`GenerateMode::Client`). **[S]** Any diagnostic that upstream would report from analysis but
that rsvelte only reaches during a *server* transform is unobservable here — the fixture suite
never runs a validator sample through SSR codegen.

### Blind spot 16e — the input is not normalised the way upstream normalises it

Upstream strips trailing whitespace (`.replace(/\s+$/, '')`) and every `\r` before compiling;
`read_fixture_file` (`common/mod.rs:148`) only rewrites `\r\n` → `\n`. **[S]** A warning whose
span reaches the end of the file, or a sample containing a lone `\r`, is therefore compared
against a position upstream computed on a different string. No current fixture is in that
shape — this is **unmeasured** as a live defect and recorded as a harness divergence.

---

## 17. svelte2tsx fixture suite — `crates/rsvelte_projection/tests/svelte2tsx_fixtures.rs`

**Unit.** Per upstream fixture, TSX text. Ratchet:
`compatibility/svelte2tsx-fixtures-known-failures.json`, 5 entries.

### Blind spot 17a — closed: absolute floor (#2454) and two-sided ratchet (#2507)

`MIN_S2TSX_FIXTURES = 254` (`:30`, asserted at `:155`) is an absolute floor on the samples
actually compared, and both `regressions.is_empty()` (`:192`) and `fixed_known.is_empty()`
(`:210`) are fatal. **[S]** The erosion this recorded — an upstream layout change under
`packages/svelte2tsx/test/svelte2tsx/samples` leaving 1 readable sample instead of 254 —
now fails twice: below the floor, and on the 5 baseline names landing in `fixed_known`.
Measured when the staleness assert was added: 249 pass / 5 fail / 0 stale, so the ratchet
was truthful at 5 entries and needed no re-baseline.

### Blind spot 17b — vacuous skip on a missing submodule

`:68-81` returns early (= pass) when `submodules/language-tools` is absent, gated only by
`RSVELTE_REQUIRE_PREREQS`. **[S]** CI sets it (`ci.yml:300`) and checks the submodule out
(`ci.yml:187`), so this holds today — recorded as a dependency, not a live defect.

**For the record, the other fixture suites are not vacuous:** generated-fixture suites call
`ensure_fixtures_exist()` (panics, `common/mod.rs:59-78`) and `ensure_fixtures_fresh()` (panics
on manifest/HEAD SHA mismatch, `:124-137`); submodule-sourced suites reach
`assert!(self.found > 0)` (`:295-300`). The centralized skip lists total **8 entries**
(`common/mod.rs:383,403,406,414,728`), plus 3 outside `common/` (`css.rs:76`, `print.rs:141`,
`parser_fixtures.rs:120,132`), all audited by `crates/rsvelte_core/tests/audit_skipped.rs`.

### Blind spot 17c — the tail after the cut is dropped from both sides

`relaxed_compare_structural` (`tests/common/svelte2tsx.rs:122-141`) truncates **both** texts at
the last `\n\nexport default class` / `\nexport const ` / `\n/** @template ` /
`\nclass __sveltets_Render` / `\nconst ` and compares only what precedes it. **[S]** The
exported component class and the `__sveltets_Render` wrapper are therefore never compared.
What survives the cut is then run through a chain of normalizations (from `:143`), and one of
those stages has already hidden a real divergence: `strip_return_statement` deleted the whole
`return {…}`, so `$$slot_def["b"]` vs official's `'b'` matched — **[D]**, closed in #2145 by
re-verifying the return statement on its own (`:515`), which in turn concedes the fixture when
either side has no `return` statement (`:520-523`).

---

## 18. Compatibility report — `crates/rsvelte_devtools/tests/compatibility_report.rs`

This is the source of the Test Status table in `AGENTS.md` and `README.md`.

### Blind spot 18a — closed: warnings were compared by count (#2452)

The report used to score a validator sample on `actual_count == expected_warnings.len()` —
never the code, never the message, never the span, so emitting `a11y_missing_attribute` where
upstream emits `a11y_img_redundant_alt` on the same sample matched. That is how `Validator
333/333` could coexist with a 207-entry `validator-known-failures.json`: the two suites were
measuring different things.

It now calls the same `validator_warnings_match` that `tests/validator.rs` calls, on the same
ordered `(code, message, start, end)` tuple, and — like `test.ts` — passes **no `filename`**, so
diagnostics that interpolate it see the sentinel upstream saw. **[D]** The discriminating run
is in the PR that closed #2452: with the count comparison, mutating a warning's message text
left the report at `Validator 333/333`; with the shape comparison it drops.

### Blind spot 18b — the report asserts nothing; it is a *report*

`generate_compatibility_report` is `#[ignore]`d and writes JSON; the CI job runs it, uploads
the artifact and diffs it against `main` with `continue-on-error: true` (`ci.yml:884-886`).
**[S]** A number moving in the report cannot by itself fail CI — the enforcement lives in the
fixture suites and their ratchets. Treat the table in `AGENTS.md` as a published summary of
what those gates assert, never as the gate.

### Blind spot 18c — the number's population is the pinned submodule

`Validator 333/333` counts the samples upstream ships at the pinned commit, minus the one
`skip: true` sample. **[S]** A sample upstream deletes takes its coverage with it and the ratio
stays at 100%; only `MIN_VALIDATOR_FIXTURES` (a floor, see 16b) notices, and only in bulk.

---

## 19. Output parseability — `scripts/compat-corpus/verify.mjs` ("output parseability" section)

**Unit.** For each of ~14,025 manifest entries × 3 targets, the single file
`compatibility/actual/<id>/<target>.js` — rsvelte's generated module, **before** any
normalization — fed to `acorn.Parser.parse` with
`{ecmaVersion:'latest', sourceType:'module', allowHashBang:true}` (`parseable.mjs:31`). One bit
per module: parses, or does not. Ratchet `parse-known-failures.<target>.json`, currently 0
entries on every target. Official's module is parsed too, but only as the oracle's own control:
a rejection there exits 2 as a harness failure and can never become a ratchet entry.

**Why it exists.** Gates 1-4 all compare rsvelte's text to official's text, so *wrong text* and
*text that is not JavaScript* produce the same verdict and land in the same ratchet — and a
ratchet entry suppresses everything about its entry, not only the divergence it was filed for.
This gate is a different question with its own ratchet, so an entry listed in
`known-failures.<target>.json` for a text mismatch cannot absorb a later regression to
unparseable output. It also closes two blind spots recorded for gate 15: **15d** (wrong
population — 15 parses the Svelte fixture corpus, not the real-world one) and the oracle half of
**15b** (15 uses OXC, the parser rsvelte itself parses JavaScript with; this one uses acorn, a
separate implementation, so an OXC-only acceptance quirk is observable).

**Calibration.** Compiling 3,509 real-world components with the **official** compiler over all
three targets yields 10,464 modules; acorn under these options rejects 0 of them. Positive
control in the other direction: of the 30 components for which rsvelte emits output esbuild
rejects, acorn rejects 30. Both figures are measured, not estimated.

That calibration corpus was **not representative of this gate's population**, and the gate said
so on its first CI run: official's own client output for
`compiler-errors/samples/const-tag-snippet-invalid-reference-1` declares `foo` twice in one
scope, which acorn rejects as an early error. Those pairs are enumerated in
`parse-oracle-excluded.json` (2 entries, justified in the paired `.md`) and skipped on **both**
sides — where the reference does not parse there is no claim to make about rsvelte. The list is
shrink-only in both directions: an unlisted oracle rejection exits 2, and a listed pair whose
official output now parses also exits 2.

### Blind spot 19a — it says nothing about whether the output is correct

A module that parses can compute the wrong thing, and this gate scores it a pass. **[S]** The
verdict is the boolean return of one `Parser.parse` call (`parseable.mjs:39-47`); no property of
the AST is inspected and official's bytes are not consulted. This is not a weakness to close —
gate 1 is the correctness gate — but it is the reason a green row here is worth exactly one
claim.

**[D]** Two witnesses, both from the same sweep that motivated this gate, so the blind spot is
measured rather than argued. In each the *same* defect produced unparseable output in some files
and valid-but-wrong output in others; the gate sees only the first group.

- #2603. The dev prop-mutation mis-splice made 9 files unparseable and 6 files parseable and
  wrong. In `huly/…/EmployeeFilter.svelte` it emitted
  `$$ownership_validator.mutation(…, filter().modes = $.strict_equals(filter().modes, undefined), 42, 2) ? […] : filter().modes`
  — valid JS that assigns the **boolean** rather than the ternary's result. Only output
  comparison finds it.
- #2598. The escaped-backslash scanner emitted a bare `$:` labelled statement in
  `General.svelte`, which every JS parser accepts.

The practical consequence for triage: **the loudness of a failure is a property of the input,
not of the defect.** A cluster's unparseable members are the visible tail of a larger set, so
sizing a text-scanning defect by its parse-gate count understates it. Both PRs measured the
split — #2603 at 9 unparseable of 15 changed — rather than assuming the parseable remainder was
unaffected.

### Blind spot 19b — JS only; CSS, source maps and every other output field are outside it

**[S]** The gate reads `<target>.js` and nothing else (`verify.mjs`, "output parseability"
loop). `<target>.css` is never handed to a CSS parser, so a malformed stylesheet is invisible
here exactly as it is to gate 1's byte comparison when the entry is ratcheted. `js.map` is not
captured by `compile.mjs` at all (blind spot 1c), so there is nothing to validate.

### Blind spot 19c — the population is inherited from the corpus (CLOSED for these four inputs)

**[D]** This row used to read: *`corpus-sources.json` lists sveltejs/svelte, svelte.dev and 33
shipped libraries. The 30 real-world components that currently produce unparseable rsvelte
output are in huly, open-webui, carbon and SMUI — none of which is a corpus source. The ratchet
is therefore empty because the inputs are absent, not because the class is fixed. Enrolling
those repositories would change the number; nothing else in this gate's design would.*

#3176 enrolled all four (and 63 more), taking the corpus from 37 corpus sources to 104 and
from 14,780 entries to 34,007. The ratchet went from 0 to **12 entries across `client` and
`client-dev`** on the first run, `server` and `server-dev` stayed at 0, and the enrolment also
turned up two CSS-parser infinite loops, two UTF-8 char-boundary panics and a BOM that was being
emitted as template text. That is the prediction paid out — this is a **discriminating case for
the row, not for the gate**: the gate's design never changed.

What is *not* closed is the general form. The population is still whatever
`corpus-sources.json` happens to list, and the argument that a given defect class is absent is
still an argument about which repositories somebody enrolled. Read the closure as "these four
inputs are in now", never as "the population question is settled".

### Blind spot 19f — an excluded pair is checked on neither side

**[S]** A `parse-oracle-excluded.json` entry removes rsvelte's output from the gate as well as
official's, so rsvelte could emit anything at all for those 2 pairs and this gate would not
notice. That is deliberate (there is no reference), but it is a hole, which is why the list is
enumerated per `(id, target)` and shrink-only rather than a predicate. `scripts/dev/test-corpus-parse-gate.mjs`
pins it: the "listing the pair skips it on BOTH sides" case seeds an unparseable rsvelte output
alongside the excluded official one and asserts the run is green *and* that the pair is not
counted in the parsed population.

### Blind spot 19d — one parser, so a shared acceptance bug is unobservable

**[S]** The oracle is acorn alone. Any construct acorn accepts and a real-world engine (V8,
JavaScriptCore, esbuild's bundler) rejects passes. The 30-file control shows acorn and esbuild
agree on today's failures, which is evidence the two are not far apart — it is not evidence that
they never differ. Closing it would mean a second parser on the same text; cost is one more
parse of ~42,000 modules and was not measured.

### Blind spot 19e — `--targets` narrows it silently

**[S]** The gate iterates `TARGETS`, which `selectTargets` narrows from `--targets`. A run
scoped to one target parses one target's modules, exactly like every other comparison in
`verify.mjs`. The FALSE-SHRINK guard on `--update-parse-baseline` is
`requireFullCorpus(manifest.length, …)`, which counts *entries*, not entries × targets — so a
`--targets client --update-parse-baseline` run rewrites only the client ratchet (the loop is
over `TARGETS`), but nothing warns that the other two were not measured. Inherited from the
existing diagnostic families, not introduced here.

---

## 20. Corpus-seeded mutation fuzz — `scripts/compat-corpus/mutate-corpus.mjs`

**Unit.** Per mutant × target, official vs rsvelte `js.code`, normalized exactly as gate 1
normalizes. A mutant is a seed with **one comment inserted at a line boundary** inside a
`<script>` region (`:227`).

**This section was added after the fact.** `AGENTS.md` requires a gate's row *before* its ratchet
is first baselined; #2281 shipped this gate and `mutation-known-failures.json` without one, and
the omission stood until a defect went looking for it. Named here rather than silently filled,
because the next gate author will otherwise repeat it.

**Three populations appear below and they are routinely confused.** 14,138 = manifest entries,
the seed set. 12,166 = mutants actually generated (a seed with no insertion slot is skipped).
39,563 = *(entry, target)* pairs for which rsvelte emitted a module and gate 19 acorn-parsed it
(`verify.mjs:358-360`). Note that gate 19's unparseable counter is per **entry**, not per pair
(`verify.mjs:365`), so its headline number and that denominator are not in the same unit.

### Blind spot 20a — the operator inserts comments, so a bracket in a *string* is never moved

*Not closable by scale — the contrast with 20b is the point.*

**[D]** `:227` splices `COMMENT_KINDS[kindName]` into the source and changes nothing else. All
eight kinds (`matrix/axes.mjs:178-187`) are comments. The gate reaches a defect whose trigger is
a delimiter inside a **comment** and never one whose trigger is the same delimiter inside a
**string, template or regex literal**.

Discriminating case. `transform_class_fields_server` counted `(){}[]` byte by byte, so on the
server target a two-field class whose second `$derived.by` spans lines with `q: ")"` in it
dropped that field and every member after it, leaving `);` at statement position. Official is
correct and rsvelte's own *client* target is correct. Its comment-carrying twin (`// ) c` in the
same slot) **was** reported by this gate; the string form is unreachable by construction and was
found by hand while fixing the twin. Fixed by #2639.

What is measured about the corpus, and what is not: gate 19 reported **0 unparseable of 39,563**
on the `80abbe52` main run, with `parse-known-failures.{client,server,client-dev}.json` all `[]`.
So **nothing in the corpus triggers this defect at any target** — which is *not* the claim "the
shape is absent from the sources", a thing nobody has measured. The first also carries gate 19's
own hole: `parse-oracle-excluded.json` lists 2 pairs checked on **neither** side (19f).

The lesson this document exists for: **growing the corpus cannot close this, and neither can more
mutants.** Only an operator that edits existing tokens reaches the class. Related: #2637 makes
the same point on another axis — the fuzzer inserts comments, not operators, so a `$:` line
ending in `*` or `%` is outside it too.

### Blind spot 20b — one mutant per seed, at a hash-chosen slot

*Closable by scale — the opposite of 20a, which is why the two must not read as one item.*

**[S]** `PER_FILE` defaults to 1 (`:96`) and the slot is `slots[h % slots.length]` with
`h = fnv1a(id#n)` (`:216-217`). A seed with 40 insertion slots is sampled at one of them, fixed
for that id — it contributes 1/40 of its own surface. Two independent defects in one file are
never both observed, and which one is observed is decided by a hash. The full sweep's 12,166
mutants are 12,166 seeds sampled once, not a sweep over slots.

**`--per-file n` closes this and nothing else has to change**; cost is linear and the ratchet keys
already carry `__m<n>__` so they do not churn.

### Blind spot 20c — `already PASS` cannot distinguish *fixed* from *no longer produced*

**CLOSED.** The mutation baseline provenance file records a SHA-256 hash for every
baselined seed. A full run reports re-keyed seeds and seeds without comparable
provenance separately from unchanged seeds whose entries actually pass. The
mutation-baseline-provenance control exercises all three outcomes.

**[S]** The staleness check is `baseline.filter((id) => !ids.has(id))` (`:661`) — a baseline key
absent from this run's failures. `ids` is `` `${f.id} [${f.verdict}] (${f.target})` `` (`:588`).
An entry leaves that set for at least four reasons and the output calls all of them "already
PASS":

1. the defect was fixed;
2. the seed file no longer exists, so no mutant is generated (`:144` filters the manifest to
   sources present on disk) — a corpus-source removal or a submodule bump does this;
3. the seed's **content** moved. `n` and `kindName` derive from the seed id alone, but the
   **slot** is `slots[h % slots.length]` over the current line list, so an edit anywhere in the
   file relocates the comment while the key stays identical. The same id then denotes a
   different mutation, which may pass for reasons unrelated to any fix. The comment at
   `:220-223` states this trade deliberately — keying on the line would churn every entry in a
   seed on any edit — so the exposure is the accepted cost, not an oversight;
4. the **verdict class** changed. The verdict is in the key, so `code-mismatch` →
   `comment-mismatch` retires the entry as "already PASS" while the entry still diverges.

Consequence for re-baselining: an `already PASS` count is only evidence of fixes if the corpus
tree did not move. Two checks, and they cover different reasons.

*Reason 2* — `git log --oneline <since> -- submodules scripts/compat-corpus/corpus-sources.json`
returning nothing, with a non-empty commit count over the same range as the positive control.
This covers seeds vanishing because the tree moved; it does **not** cover a source absent from
the working copy (**C7**).

*Reason 4* — **measured `[D]` 0**, in the `code-mismatch ⇄ unparseable` direction. Method:
extract `id (target)` from the NEW-divergences and already-PASS lists with the verdict stripped
and intersect; an entry that merely changed class appears in both. Empty at `d1eedb3f` over
14,138 seeds. The instrument is shown to move by the same counter reporting 16 unparseable at
`d88546a7` and 10 at `39ba6489` on the same day, so this is not the vacuous kind of zero.

That covers only the two verdicts the baseline can represent. **Transitions into
`comment-mismatch` remain unmeasured**, because those ids are never recorded — `:555-557`
increments the counter and `continue`s before any `failures.push`, so no comment-mismatch key
exists to intersect against. Closing that half needs the id recorded alongside the count. The
first attempt at this cell proposed intersecting against that non-existent set, which would have
returned empty regardless of the truth — a vacuous zero is worse than a blank, because the blank
advertises itself.

### Blind spot 20d — insertion is line-boundary only, and `<script>` only

**[S]** `insertionSlots` (`matrix/mutate.mjs:41-61`) yields line boundaries inside `<script>`
ranges. A comment inside an expression (`f(/* c */ x)`), in a template-markup slot, or between
two tokens on one line is never generated. Same shape as blind spot 5c, from the same helper.

### Blind spot 20e — only the `code` class is ratcheted per id

**[S]** `:598` restricts the per-id regression check to `code-mismatch` and `unparseable`;
`comment-mismatch` is an aggregate count (`:695-696`). On the full sweep that is 13,242
divergences with no per-entry gate. Deliberate and documented (`AGENTS.md`; gate 5 ratchets
comment fidelity per id on generated seeds that do not move when a submodule bumps) — but a
comment regression on a *collected* seed is invisible here.

### Blind spot 20f — a PR samples by hash, so the run that adds a seed is the least likely to mutate it [D]

**PRs run `--seeds 1500`, main runs `--full`** (`corpus-compat.yml:267-272`), and the sample
was the 1500 lowest `fnv1a(id)` of ~14,100 eligible entries (`:145-152`). Nothing in that rank
knows an id is *new*, so a repro landing in the same PR had roughly a 1-in-9 chance of being
mutated — and the ratchet the PR was green against was measured without it.

**[D]** #2671. #2663 added `pattern/matrix/string-line-continuation/indented-continuation.svelte`
and was green; the mutant of that very seed turned main red on merge. Simulated over the real
shape (13,963 collected + 137 `pattern/` ids), the old rank picked **14 of 137** `pattern/`
entries; the mechanism is not "PRs sample less", it is that inclusion is a lottery uncorrelated
with novelty.

Now closed for `pattern/`: every eligible `pattern/` id is seeded unconditionally and the
hash-ranked sample fills the rest, so the sample goes 1500 → 1637 (+9%) and a PR that lands a
repro mutation-tests it. **Still open for the rest of the corpus** — a submodule bump that
introduces a new real-world file is the same lottery, and there is no cheap fix, because
"newly added" is a diff against the merge base rather than a property of the manifest.

### Blind spot 20g — `eligible` is drawn from a ratchet whose comparison ignores the one dimension this gate measures [D]

`eligible` is `manifest ∖ (union of the four output ratchets)` (`:145-152`), because a seed that
diverges *unmutated* cannot attribute a mutant. The intent is right; the source is not. Gate 1
falls back to `ast_equiv_batch` with **comments ignored** (`verify.mjs:588`, "The empty argv is
load-bearing"), so a component whose only divergence is a comment scores `match` there and is
**correctly** unlisted. This gate, however, splits `comment-mismatch` out as its own class. A
comment-divergent seed is therefore **guaranteed** to pass the eligibility filter and
**guaranteed** to be unattributable here — systematically, for the whole `comment-mismatch`
class, not marginally.

**[D]** Measured 2026-08-31 with the gate's own comparison and no comment inserted:
**116 match / 6 comment-mismatch over the 38 enrolled seeds**, the divergence coming from
**2 seeds** — `layerchart/…/layers/Canvas.svelte` (all four targets) and
`open-webui/…/NotebookView.svelte` (client, client-dev). So **6 of the 14 residual
`comment-mismatch` pairs are not attributable to the mutation at all**; no change to comment
handling can move them. Running gate 1's own `ast_equiv_batch` over those six pairs plus a third
file found the same way (`svelthree/…/AmbientLight.svelte`, client) returns **`equivalent` for
every one** — all three are comment-only, which is exactly why none is listed.

Two things follow. Reducing `Canvas.svelte` gives a 12-line hand-reproducible defect — a
template-expression function body containing only a comment loses the comment in client output,
across all seven template slots, with a body containing one statement as the passing control —
so the seeds are diverging for a real reason that **no output ratchet can express**. And the fix
for this blind spot is not "the output ratchet's population has a hole": it is that a filter must
be drawn from a comparison that sees what the gate compares. Run each seed **unmutated** once
under *this* gate's own comparison and exclude the ones that already diverge; cost is one extra
compile per seed.

**A note on how this row was nearly written wrong.** The first version claimed the population had
a hole, on the argument that "oxfmt does not delete comments, so the divergence cannot be a
normalization artifact". That argument is sound and rules out the *normalizer* — and says nothing
about the *comparator*, which is a different stage that ignores comments by design. Eliminating
one candidate is not confirming another.

### Blind spot 20h — the classifier that DEFINES the ratcheted class deletes real code on 10.9% of the corpus [D]

*Also gate 5, which computes its `comment-mismatch` verdict from the same function.*

Only `code-mismatch` is ratcheted here (`comment-mismatch` is ratcheted per id by gate 5
instead), so the `codeIdentity` call at `mutate-corpus.mjs:73` / `matrix/run.mjs:363` is not a
presentation detail — it decides which divergences this gate can fail on. It strips comments with
a plain regex (`normalize.mjs:300`):

```js
const COMMENT_RE = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g;
```

A `//` inside a string or template literal therefore starts a "comment" that runs to the end of
the line, on **both** sides, and whatever divergence sat after it is deleted before the
comparison. The commonest instance in generated Svelte output is
`xmlns="http://www.w3.org/2000/svg"` — every inline SVG.

Discriminating case, as a positive control on the function itself:

| input A | input B | `codeIdentity` |
|---|---|---|
| `var a = "x"; foo(1);` | `var a = "x"; foo(2);` | differ (correct) |
| `var a = "http://x"; foo(1);` | `var a = "http://x"; foo(2);` | **equal** — both reduce to `vara="http:` |
| `` var a = `<b href="http://x" class="svelte-1">`; `` | `` var a = `<b href="http://x">`; `` | **equal** |

Measured over the corpus on 2026-08-31, comparing `codeIdentity` against an acorn `onComment`
equivalent on the official compiler's client output: the regex discards non-comment code from
**3,429 of 31,546 compiled files (10.9%)**, **3,202,954 characters** in total. Output acorn could
not parse: **1**. So an exact stripper is available at essentially no coverage cost — this is a
defect, not a tradeoff.

It has already mislabelled real data. Sub-classifying the four output ratchets by cause put
**15 of 231 entries** in "comment fidelity" whose sole difference was a CSS scope class: for
`trakt-web/…/icons/MediaIcon.svelte` the only divergence is ` class="svelte-1rwg3wr"` on the
`<svg>`, and the `xmlns` earlier on that line caused both sides to be truncated to the same
prefix. With the exact stripper the comment count over all four ratchets is **0**.

The generalisable part is not the regex. Both gates here are careful about their *keys* — 5's
verdict split exists precisely so a comment entry cannot suppress a code regression — and that
care is spent through a **shared reduction** that no test pins. `codeIdentity` has a doc comment
asserting what it removes ("the comments, all whitespace, and the trailing comma oxfmt adds"),
which is the shape recorded for `two-ports-inventory.md`: a comment asserting fidelity reads as a
citation. Ask of a verdict-defining reduction what happens when its input contains the token it
keys on **as data**.

**Fixed on 2026-08-31, and the residue is not zero — nor is it one-directional.** `codeIdentity`
now takes its comment ranges from the same single-pass string/template scanner `stripBlankLines`
already used, which takes the population from **3,429 of 31,546 files to 27**. Read the 27 by
direction, because they do not all mean the same thing:

| | files | characters |
|---|---|---|
| before, reduction **shorter** than an acorn-exact stripper (real code deleted) | 3,429 | 3,202,954 |
| before, reduction **longer** (a real comment kept) | 0 | 0 |
| after, shorter | **21** | 2,942 |
| after, longer | **6** | 2,453 |

One cause, two directions: the scanner does not track regex literals, and whether a `/` opens one
or is division is decided by the **previous significant token**. So a `//` inside a regex character
class (`/[//]/`) still starts a comment (the 21), and a quote inside a regex (`/'/`) puts the
scanner in a string state that swallows a *real* comment later on that line (the 6). That is the
same ambiguity the `keyword-regex` matrix family exists for; closing it needs a tokenizer rather
than a state machine over delimiters. The measurement itself is the second lesson here — the
instrument summed the two directions signed, and reported **489** characters where the honest
answer is 2,942 and 2,453. A total over a signed quantity cannot distinguish "small" from
"cancelling", and the before-figure being one-directional was checked rather than assumed. `scripts/dev/test-code-identity-strings.mjs`
pins both halves: the string cases as a **discriminating** control (the retired regex and the
shipping reduction must disagree on the same pair), and the regex residue as an assertion that
fails if it is ever fixed without updating this row.

**The sibling reduction does NOT share the whole hole, and saying it does would be wrong.**
`stripBlankLines` (`normalize.mjs:129`) has always had the string/template states, so it never had
the `xmlns="http://…"` case; measured, the only input that moves it is a regex literal containing
a **backtick** (`` /`/ ``), which puts it in template state and makes it *keep* newlines. Its blast
radius differs too — the regex deletes code to the end of the line, this one only retains blank
lines, and the same rule runs on both sides of the comparison. Two reductions can share a
*cause* (neither tracks regex literals) and have entirely different *consequences*; the row has
to state which.

---

## 21. Published-artifact glibc floor — `scripts/release/check-glibc-floor.sh`

**Unit.** Per Linux artifact staged for publication, the highest `GLIBC_x.y` version its
dynamic symbols and `.gnu.version_r` entries reference, compared against a declared floor
(2.35, the glibc of the `ubuntu-22.04` image the release matrix now builds on).

**Why it exists.** Every gate in this file compares *what the compiler produced*. None of them
looks at the file that reaches npm. `ubuntu-latest` moved to Ubuntu 24.04, every published
`linux-*-gnu` artifact started requiring glibc 2.39, and the whole test suite stayed green
because nothing it runs is the shipped binary (#2675).

### Blind spot 21a — it reads symbols, not behaviour [D]

A binary whose highest reference is under the floor can still fail to start: a `dlopen`ed
library, a `GLIBC_PRIVATE` symbol, or a non-glibc shared object (`libgcc_s`, `libstdc++`)
whose own floor is higher are all invisible here. The discriminating case is the reverse
direction and is what the CI negative control asserts: with `GLIBC_FLOOR=2.0` the same
artifact must be rejected, which is the only evidence that a green run means anything.

### Blind spot 21b — the floor is a number in a workflow, not a tested claim [S]

Nothing checks that 2.35 is the glibc of the image named in `runs-on`. Pin and floor are two
independent edits, and lowering `runs-on` to an older image while leaving the floor at 2.35
would keep passing — the check only fails when the artifact needs *more* than the floor. What
it does close is the direction that actually broke: an image bump can no longer raise the
requirement silently.

## 22. NAPI option boundary — `scripts/dev/test-napi-compile-options.mjs`

**Unit.** Per option key declared at the napi boundary, two compiles of one source that differ
only in that key, run against the raw addon (`apps/npm/vite-plugin-svelte-native-<triple>/rsvelte.node`,
not the JS shim). Each key must (a) change the result and (b) produce a named marker. A second
half reconciles the covered set against the keys parsed out of `crates/rsvelte_napi/src/lib.rs`,
both directions, so a new field with no case fails and a case naming a deleted field fails.

**Why it exists.** `crates/rsvelte_napi/Cargo.toml:22-23` sets `test = false` (the `napi_*`
symbols only resolve when Node dlopens the addon), there is no `crates/rsvelte_napi/tests/`, and
before this gate nothing anywhere crossed the JS-object → `CompileOptions` mapping per key.
Deleting a field, or dropping its arm from `into_compile_options`, failed nothing. Denominator:
**39 of 41 declared keys** are crossed; the 2 exclusions are listed in the script's `UNCOVERED`
map with their reasons, and the reasons are themselves asserted to exist.

### 22a — it compares rsvelte against rsvelte, never against official [S]

Every marker is a string from rsvelte's own current output (`$.hmr(A)`, `$.from_tree(`,
`options_removed_hydratable`). That establishes the key *reaches* the compiler; it says nothing
about whether the resulting semantics match upstream Svelte. The gate that would catch wrong
semantics is corpus output parity — and blind spot **1d** records that `compile.mjs:99-100`
passes only `generate`, `dev`, `filename` and `css`. So for the other **22** compile keys, no
gate in this repo compares rsvelte's option behaviour to the official compiler's.

### 22b — the exhaustiveness half is keyed on *declared* fields, not on what a caller can pass [D]

`napiObjectStructs()` reads the `pub <field>:` lines of the four `#[napi(object)]` option
structs. An option a real caller passes that the boundary never declares is therefore not a
failure — it is not even a row. Discriminating case: `warningFilter` and `cssHash` are genuine
`svelte/compiler` options; the addon declared neither, and the shim resolved them in JS
(`apps/npm/vite-plugin-svelte-native/index.cjs`). The denominator printed 40 and never mentioned
them. This is the #2438 shape one level out: that bug was a *declared* field nothing read; this
blind spot is an *undeclared* option nothing accepts. **#3294 is the shipped instance**: a
function-valued `cssHash` was dropped at this boundary with no error, so the component got a
different scope class than the caller asked for, in `css.code` and in every `class` attribute of
`js.code`. `cssHash` is now declared (and rejected) here, which puts it in the denominator; the
option's *behaviour* is gate 38. `warningFilter` is still undeclared and still invisible to the
count.

### 22c — one entry point per surface, and per-entry-point consistency is not asserted [S]

All 26 compile cases call `napi.compile`. Eleven exports take a `NapiCompileOptions`
(`lib.rs:298,318,368,1692,1790,1799,1927,2010,2140,2152` plus the batch item), and they all
funnel through `options_to_compile`, so the *coercion* is shared — but an export that forgets to
call it, or a `CompileBatchInput` whose per-item options are dropped, is invisible here. #2547 is
the recorded instance of exactly this axis: the fix was complete on the script entry points and
absent on the template-expression one. Concretely already true at this boundary:
`NapiParseOptions::skip_css_ast` is declared for both `parse` and `parseEnvelope` and read only
by `parseEnvelope` (`lib.rs:218`); `napi_parse` never consults it. The gate covers the key on
`parseEnvelope` and asserts nothing about the asymmetry.

### 22d — one non-default value per key [S]

`namespace` is exercised at `svg` only, `fragments` at `tree` only, `compatibility.componentApi`
at `4` only, and so on. A coercion arm that maps two values to the same variant (the shape
`coerce_generate`'s five string arms could take) passes. Only `generate` is exercised twice, and
only because the `dom` spelling has a warning of its own.

### 22e — it does not read the option *rejection* surface [S]

The wrong-type messages produced by `coerce_bool` / `coerce_string` / `coerce_namespace` are
asserted in `scripts/dev/test-vps-shim.mjs:247-266`, through the shim, for 6 of the 40 keys. A
rejection assertion is not a substitute for a positive one and vice versa: `namespace: 2` still
throws the upstream message when `opts.namespace = …` is deleted, which is the whole reason this
gate exists.

### 22f — `sourcesContent` is covered on 4 entries, and only because it is asserted by name [S]

The only result field this boundary has been observed to lose. `test:vps-shim` covers it on the
five shim-wrapped entries (`test-vps-shim.mjs:53-106`), all of which externalize the source and
have the JS decoder restore it; this gate adds the two JSON entries (`compile`, `compileBoth`),
which build the map in Rust. Neither covers `compileBuffers`, `compileModuleBuffers`, the
`*ZeroCopy` entries, or `compileModule`'s map — and no assertion generalizes: each is a named
field on a named entry.

### 22g — this gate compares the legacy `result.ast` as a top-level KEY SET only [D]

`modernAst: true` is compared to official as a whole canonicalized tree; the **default** `ast` —
the Svelte-4 legacy tree, wired in #3295 — is compared here only as `Object.keys(ast).sort()`, so
`{css, html, instance, module, _comments}` agreeing is the entire verdict. The later public
`parse()` AST gate (§39) now compares the legacy tree recursively over the full corpus, but that
does not broaden this gate: if §39 is removed or filtered, this check cannot notice any value
below those root keys. Before §39 existed, a measurement over 400 `runtime-legacy` components
found **22 byte-identical to official and 378 divergent** in nine classes (`.raw`/`.data` on 199
files from upstream's in-place
`clean_nodes` mutation, expression `loc` coverage on 311 files, computed-key positions on 15,
`.modifiers`, `_comments`/`leadingComments`/`trailingComments`, `name_loc`, `importKind`, an
extra `attributes`) — every one of which this gate scores as a pass. The byte-exact pin is one
component in `crates/rsvelte_core/tests/compile_result_legacy_ast_3295.rs`; a differential over
the corpus is §39, not this gate. Official is round-tripped through JSON before its keys are read,
because upstream assigns `undefined` to absent blocks and `Object.keys` reports those.

---

## 23. Escaped-quote lookback shape — `crates/rsvelte_core/tests/escaped_quote_lookback_guard.rs`

**Unit.** One line of Rust source, from every `.rs` file under `crates/` and `apps/` (1,114
tracked files; the test asserts it walked at least 900, so a broken walk cannot report a clean
tree). A line is a violation when it spells `!= '\\'` or `!= b'\\'` outside a comment and is not
in the `ALLOWED` list. Verdict: the violation set must be empty.

**Why it exists.** This is not an output gate; it forbids a *shape*. 37 shipped scanners (plus 14
more in instruments and test helpers) decided "is this
quote escaped?" with a one-character lookback, which is a different question — `'\\'` closes its
string and the character before the quote is still a backslash. Every one of the ~22 gates above
compares outputs, so each instance is only visible when some corpus entry happens to contain a
string ending in `\\` **in the position that scanner reads**; #2598 shipped with a witness for
exactly one site, and the rest were invisible at any corpus size. The one shared
helper (`compiler::utils::is_escaped` / `is_escaped_char`) makes the correct predicate the only
convenient one, and this test makes the incorrect one non-compiling in review terms: the class
becomes unrepresentable rather than merely fixed.

**Discriminating.** Restoring any single site to the lookback spelling turns it red and names
the file and line. The paired `the_detector_fires_on_the_forbidden_shape` test is the control on
the detector itself, in both directions (it fires on both index spellings, and stays quiet on a
doc comment that quotes the shape and on a call to the helper).

### Blind spot 23a — it matches a *spelling*, not the predicate [S]

The detector is a substring test. A scanner that re-derives the same wrong answer differently —
`chars[i - 1] == '\\'` in the positive direction, a `prev` variable updated in a stream, a
hand-inlined backslash-counting loop, or a `match` on the preceding byte — passes. Two such
spellings existed in this repo before this PR and had to be found by reading rather than by the
needle: five copies of `if c == q && prev != '\\'` in `crates/rsvelte_projection/tests/` (a
streaming form with no index), and the byte-relative
`bytes[i] != b'\\'` in `1_parse/read/expression.rs` (correct indexing, different variable). Both
are now on the helper, so today's tree has no such site — but nothing stops the next one.

### Blind spot 23b — a scanner with *no* escape check at all is invisible [D]

The needle requires the comparison to be present. A quote-tracking loop that never asks about
escaping is a superset of this defect and produces no line for the detector to match.
Discriminating case, still open in this tree:
`3_transform/client/destructure_transforms.rs:894` decides `${` starts an interpolation with
`c == b'$' && bytes[i + 1] == b'{'` and no escape test at all, so `` `a\${b}` `` — where the
`$` *is* escaped — is read as a real interpolation. The sibling defect in
`client/expression_utils.rs` was fixed in #2598 with the quote; this copy was not, and this gate
cannot see it.

### Blind spot 23c — Rust only, and only two directories [S]

`collect_rs_files` walks `crates/` and `apps/`, filtering on the `.rs` extension. The same
question is asked in JavaScript in this repo — `scripts/compat-corpus/normalize.mjs` and the
corpus tooling all scan strings — and no gate inspects those. The directory list is also a
literal: a new top-level Rust directory is silently outside the population, and the
`MIN_FILES_SCANNED` floor is loose enough (900 vs 1,114) not to notice one.

### Blind spot 23d — `ALLOWED` is unbounded and unjustified by the harness [S]

An entry is a `(path, trimmed line)` pair with no required reason field and no shrink-only
ratchet, so silencing a real violation costs one line. There is one entry today
(`js_ast/codegen.rs`'s `b != b'\\'`, a character-class test rather than a lookback). Nothing
asserts the list is minimal, and nothing fails when a listed line disappears — the same
stale-entry hazard the two-sided corpus ratchets exist to prevent.

---

## 24. `await_waterfall` runtime parity — `scripts/compat-corpus/await-waterfall-runtime.mjs`

**Unit.** Three component sources, each compiled by BOTH compilers with
`{ generate: 'client', dev: true, experimental: { async: true } }`, written to disk inside
`submodules/svelte/packages/svelte` (so `svelte/internal/client` self-resolves), imported,
`mount`ed into a jsdom document, and left running long enough for the runtime's `setTimeout`
to fire. The compared value is the multiset of `await_waterfall` warnings `console.warn`
received, keyed by the derived's label. It is the only gate in the repo that **executes**
compiled output.

**Why it exists.** `await_waterfall` is raised by
`internal/client/reactivity/deriveds.js` and gated on `location !== undefined` — an argument
the compiler either passes or does not. Omitting it produces output that parses, formats,
matches nothing anyone diffed, and disarms the warning. A warning that can never fire is
invisible to a warning ratchet **by construction**: its baseline is `0` before and after, and
"the code never appears" is indistinguishable from "the code is correct". That is the
zero-needs-a-negative-control trap, and this script is its negative control. Note that no
sharpening of a *compile-time* warning key reaches it — gate 5's `warning-missing:<code>` and
gates 2-3 both read `result.warnings`, and a runtime warning never appears there at all.

**Both halves are asserted, and the order matters.** The oracle is checked first: if
official's output does not warn exactly `['a']` for the waterfall case and exactly `[]` for the
ignored case, the run fails as `HARNESS` and rsvelte's result is never compared. Without that,
"neither compiler warned" — precisely the state #2540 shipped in — would be a pass.

### 24a — one warning code, and it is the only runtime warning anything here executes [D]

`IGNORABLE_RUNTIME_WARNINGS` has 7 members (`await_reactivity_loss`,
`binding_property_non_reactive`, `hydration_attribute_changed`, `hydration_html_changed`,
`ownership_invalid_binding`, `ownership_invalid_mutation`, `state_snapshot_uncloneable`, plus
this one). Every one of them is compiler-*encoded* the same way — a `svelte-ignore` lookup that
changes generated arguments — and #2486 group D records that no gate over compiler output can
watch any of them. This script watches one. The other seven are **unmeasured**, and the reason
is cost, not principle: each needs its own runnable shape.

### 24b — it observes `console.warn` only, and only for the duration it waits [S]

The mount is given a fixed 200 ms before the assertion. A warning that arrives later, one
routed anywhere other than `console.warn`, and everything else the mounted component does —
rendered HTML, thrown errors, `unmount` behaviour, reactivity — are outside the key.
`document.body.innerHTML` is asserted by nothing.

### 24c — one component shape, so the *location string* is never compared [S]

The cases differ only in the ignore comment. The runtime prints the location into the warning
text and this script does not read it, so a location pointing at the wrong line, the wrong
file, or the wrong declaration would pass every case here. That field is compared by
`crates/rsvelte_core/tests/async_derived_dev_args_2540.rs` (exact column, against the official
compiler's own output) and by the `async-derived` matrix family — never by this gate.

### 24d — dev is enabled through `NODE_ENV`, and nothing asserts it took [S]

`esm-env` resolves `DEV` at module load from `process.env.NODE_ENV` (the `dev-fallback.js`
export condition). The script sets it before its first dynamic import. If a future Node,
bundler condition or `esm-env` release changed that resolution, `DEV` would be `false`, the
runtime's whole warning block would be dead, and every case would report `[]`. The oracle check
in gate 24 preamble catches exactly this — official would stop warning and the run would fail as
`HARNESS` rather than pass silently — which is the only reason this is [S] and not a hole.

### 24e — a missing jsdom or binding exits 2, and CI must be the thing that runs it [S]

Both are hard failures (`process.exit(2)`), not skips, so the vacuity floor that gate 8a
records does not apply. But the script is wired into exactly one job (`corpus-compat.yml`'s
`shape-matrix`), which is path-filtered on `crates/**` and `scripts/compat-corpus/**`; a change
to `submodules/svelte` alone reaches it (the submodule paths are listed), a change to the
runtime's warning gating inside a *newer pinned* submodule therefore does reach it, but nothing
else in the repo runs it.

---

## 28. Adversarial lint patterns — `scripts/compat-corpus/lint-adversarial.mjs`

**Unit.** Per pattern file, a **Set** of `` `${ruleId}\t${line}:${col}\t${message}` `` — the same
key as gate 11, over a **constructed** population (`compatibility/lint-adversarial/`, 1365 patterns
across 74 rules — every rule in the universe has a directory) instead of a collected one. Ratchet
`compatibility/lint-adversarial-known-failures.json`, justified per entry in the paired `.md`,
expected to stay at its five entries rather than to burn down.

**Why it exists.** Gate 11 samples the *marginal* distribution of published Svelte: it graded
73k findings and sat at 104 divergences, saturated enough to read as "the port is close". The
first run of this gate reported **330** on inputs written to separate two implementations of one
rule — the same lesson as the shape matrix one layer up (§ *Generated shape matrix*): corpus size
is not the axis, input construction is. The classes it found are not exotic; they are the ones a
port acquires by approximating an AST question with a text scan, and each was invisible to gate 11
only because published code does not contain the discriminating shape.

### Blind spot 28a — the author's axis is the coverage bound — **[S]**

Every pattern was written by reading one upstream rule and asking what a plausible port would get
wrong. That makes the generator's blind spot the author's blind spot, by construction — the same
hazard § *Generated shape matrix* records for the compiler families, where #2535's over-prune
shipped past 1,955 green rows because no row carried a two-compound parent. Concretely: rules
whose divergence needs *two* interacting features (an option **and** an exotic host, say) are
sampled only where an author happened to cross them. The complement remains gate 11's job.

One sub-axis of this *is* measured to saturation, and the measurement shows why the obvious form
of it does not discriminate — **[D]**. 29 of the 76 rules declare an options schema and 28 are
exercised with a non-default option, which counts reaching the option rather than covering its
values. Enumerating every enum and boolean value in those schemas leaves 43 unexercised; 40 are the
rule's own code default (no schema declares `default`, so it has to be read from the `??` / `||` at
the consumption site — reading it off the schema reports every default as a gap), covered by every
option-less pattern in the directory. `sort-attributes.alphabetical` is declared upstream and read
at zero sites, and rsvelte ignores it identically. That leaves exactly one:
`block-lang.enforceScriptPresent: true`, which inline configuration structurally cannot reach (the
arm needs no `<script>`, and ESLint reads inline config only from a JS comment) and which was
checked by hand instead — the same unreachability the gate-31 doc records for its `block-lang`
entry, seen from the other side.

### Blind spot 28b — no severity, and the fix/suggestion halves moved to gates 29 and 30 — **[S]**

Inherited from gate 11's key (11d): `--format sarif` carries `level`, and `lint-adversarial.mjs`
reads it nowhere (`:118-127`). Severity is degenerate on this gate — every rule in the universe is
configured `"warn"` on both sides — so what a severity comparison would measure is a rule's
*default* severity, which nothing here varies. Unmeasured, and cheap to fix only by adding a
population (a config that sets non-default severities), not by changing the key.

The other two thirds of this blind spot were closed rather than documented: **gate 29** compares
the text `--fix` produces and **gate 30** compares each suggestion's `{desc, resulting text}`.
Both were built after this row was first written, and gate 30 found 5 divergences at positions
where *this* gate's key already agreed — the class the row predicted.

### Blind spot 28c — the intersection of both skip lists is graded by nothing but the collected corpus — **[D]**

A fixture on `eslint_plugin_oracle.rs`'s SKIP list is not compared there; if no adversarial
pattern covers its shape either, the only gate left is gate 11 — and only when the corpus happens
to contain the file. This is not hypothetical: the store rewrite in this campaign silently lost
**six findings** on `require-store-reactive-access/invalid/properties01-input.svelte` (a computed
property key resolves through no oxc reference because its serialized start is the `[`), the
fixture gate stayed green because that path is skipped, and the adversarial corpus stayed green
because no pattern used that shape. Gate 11 caught it, as a *new* divergence on an upstream
fixture file that the corpus happens to collect. **Whenever a SKIP entry is added, ask which gate
now holds that shape.**

### Blind spot 28d — the oracle is an npm install, and it moved under the ratchet — **[D]**

`lint-oracle/package.json` declared floating ranges installed with `--no-package-lock`, so the
oracle's own behaviour drifted with whatever npm resolved that day. A
`no-unused-svelte-ignore` divergence appeared on three upstream fixtures with **no rsvelte
change** — proven by building the pre-campaign binary and observing byte-identical output from
both binaries on those files, which leaves the oracle as the only thing that moved. Every version
is now exact (eslint 9.39.5, eslint-plugin-svelte 3.23.0, svelte 5.56.9, svelte-eslint-parser
1.8.1, typescript 6.0.3, @typescript-eslint/parser 8.67.0). The eslint major is pinned for a
second reason: under ESLint 10, eslint-plugin-svelte 3.23.0's `no-reactive-functions` suggestion
calls `sourceCode.isSpaceBetweenTokens`, removed in that major, so **every positive report for
that rule throws and the file is scored unparseable instead of compared** — a whole rule's
positive population silently outside both lint gates. An oracle that is *installed* rather than
*pinned* is a measuring instrument with no calibration date.

### What it does see that gate 11 cannot — **[D]**

An oracle parse failure is a **hard error** here (`:170-176`), not a skipped file. Gate 11 counts
23 oracle-unparseable entries per run and moves on, which is correct for collected sources but
would let a constructed pattern silently measure nothing.

---

## 29. Adversarial lint autofix — `scripts/compat-corpus/lint-adversarial-fix.mjs`

**Unit.** Per (pattern, rule) pair, the **text** `--fix` produces, compared byte-for-byte between
the real ESLint and `rsvelte-lint`. Only the rule the pattern's directory names is enabled.
Ratchet `compatibility/lint-adversarial-fix-known-failures.json`, justified per entry in the
paired `.md`.

**Why it exists.** Gate 28's key is `(ruleId, line, column, message)`, which cannot see a fix at
all: a rule can report at exactly the right position with exactly the right text and then rewrite
the source differently, or write correct replacement text over the wrong range. Upstream's own
RuleTester fixtures do compare `*-output.svelte`, but only for the shapes upstream ships and only
for the fixtures `eslint_plugin_oracle.rs` does not skip — the same intersection gate 28c names.

### Blind spot 29a — one rule at a time, so the whole-config `--fix` is out of scope — **[D]**, now covered by gate 35

Fixes are computed per rule (`:137-140`) because ESLint resolves overlapping fixes across rules by
a driver policy — multi-pass, first-wins on overlap — that belongs to ESLint rather than to any
rule's port. That is the right scope for a *rule* comparison, and it left what users actually run —
74 rules editing one file at once — uncompared until **gate 35**
(`lint-adversarial-fix-all.mjs`) was built. Two populations, not one, turned out to sit in the gap:
the second pass (a rule handed text another rule's fix produced), and, more simply, **any rule
whose fixer touches a pattern filed under a different rule's directory** — this gate derives the
rule from the directory name, so it never runs `svelte/html-quotes` on a `comment-directive/`
pattern. That second population is where the defect was: rsvelte's `--fix` resolved disable
directives against a different line table than its own report path. See gate 35.

### Blind spot 29b — the two sides run different drivers, and the gate cannot separate a pass-count difference from a fix difference — **[S]**

`rsvelte_lint::fix_all` loops to `MAX_AUTOFIX_PASSES = 10`, mirroring ESLint's
`Linter.verifyAndFix`, which is what `eslint --fix` does and what this gate drives on the oracle
side. Upstream's recorded fixtures instead capture `SourceCodeFixer.applyFixes` — **one** pass. So
a difference visible only at pass ≥2 is visible here and nowhere else, and conversely a
single-pass difference that both sides converge away by pass 10 is invisible here while
`eslint_plugin_oracle.rs` would see it. The two gates are complements, not redundant.

### Blind spot 29c — the edit SET is not compared, only the text it converges to — **[S]**

Two different edit lists that produce the same final bytes are equal here. That is deliberate —
ESLint's ranges are UTF-16 code units and rsvelte's are UTF-8 byte offsets, so a coordinate
comparison would report a divergence on every non-ASCII file — but it means a fix that deletes and
reinserts a region is indistinguishable from one that leaves it alone, which matters to an editor
applying the fix incrementally and to anything that renders a diff.

### Blind spot 29d — a rule with no fixer contributes a compared pair that can never diverge — **[S]**

`compared` counts every (pattern, rule) pair, including the majority whose rule has no
`meta.fixable`. The discriminating population is the `changedO` / `changedR` counters the run
prints — read those, not `compared`, when sizing what this gate covers.

### What it does see that nothing else does — **[D]**

It is the only gate that compares a rule's **fix path against its own report path**. Both are
ports of the same upstream rule, and no other comparison puts them side by side:
`prefer-class-directive` reported through `js_whitespace` (JS semantics, U+FEFF is whitespace) and
trimmed through Rust's `str::trim*` (Unicode `White_Space`, U+FEFF is not), so a `class` value
padded with U+FEFF was reported at the identical position on both sides and rewritten
differently — invisible to every `(ruleId, line, column, message)` key by construction.

It is also the only gate that can observe **which compiler phase raises an error**, because the
autofix loop's continuation depends on whether a pass's output parses. `svelte_meta_invalid_placement`
is a parse error upstream and an analyze error in rsvelte, so ESLint's `verifyAndFix` halts after
pass 1 while rsvelte relints cleanly and fixes one level deeper. No finding-level comparison can
reach that: both sides report the same findings on the original source.

An oracle fix whose own output no longer parses is counted (`unparseableFix`) and still compared
byte-for-byte, so upstream's own broken fixes are reproduced deliberately rather than silently
"fixed" by rsvelte declining. And the oracle must run with `cwd` at the common ancestor of the
targets: ESLint silently **ignores** files outside `cwd` ("File ignored because outside of base
path"), which surfaces as one `ruleId: null` message and no `output` — indistinguishable from
"nothing to fix". That is why a `ruleId === null` message with no output is treated as fatal
rather than as a clean pass.

---

## 30. Adversarial lint suggestions — `scripts/compat-corpus/lint-adversarial-suggest.mjs`

**Unit.** Per finding position `(ruleId, line, column)`, the **ordered list** of
`{desc, text-after-applying-that-one-suggestion}`. Ratchet
`compatibility/lint-adversarial-suggest-known-failures.json`, justified per entry in the paired
`.md`. Measured population on the first run: 249 suggestion-bearing positions over 1068 patterns,
257 oracle suggestions against 240 from rsvelte.

**Why it exists.** A suggestion is an editor-offered code action that `--fix` never applies, so it
is outside every other comparison this project runs *by construction*: gates 11 and 28 key on
`(ruleId, line, column, message)`, and gate 29 compares what `--fix` produces, which by definition
excludes every suggestion. The rsvelte CLI did not even emit them — `render` dropped the
`fix`/`suggestions` payload at the `LintMessage` → `Diagnostic` boundary — so the axis had to be
built on both sides before anything could be compared. Its first run found **5 divergences at
positions where gate 28's key already agreed**, i.e. both linters report the same finding with the
same text at the same place and offer the user different code.

### Blind spot 30a — a suggestion is compared only where the FINDING agrees — **[S]**

The key starts with the finding's position, so when the two sides disagree about whether to report
at all, the suggestion comparison degenerates into restating that disagreement (23 of the first
run's 28 entries are exactly this). Those are gate 28's finding, counted twice. Read the
suggestion gate for the residue — positions in *both* sides' maps — and expect it to shrink as
gate 28's ratchet burns down.

### Blind spot 30b — text equality, so a suggestion at the wrong RANGE that lands the same bytes passes — **[S]**

Same trade as 29c and for the same coordinate reason. Additionally, only ONE suggestion is applied
per rendering; a suggestion whose edits conflict with a sibling's is never exercised, because
ESLint applies at most one suggestion at a time too.

### Blind spot 30c — `desc` is compared as a whole string, so a message-template regression and a wrong-target regression look the same — **[D]**

Both are real and they were seen together: on
`require-store-callbacks-use-set-param/12-ts-this-param.svelte` upstream says "Rename parameter
from this to `set`." and rsvelte said "Rename parameter from notSet to `set`." — one string
difference carrying a *mechanism* difference (whether a TypeScript `this` parameter occupies
`params[0]`). The gate reports one key either way; the diagnosis has to come from
`sugdump`-style inspection, not from the ratchet entry.

### Blind spot 30d — it inherits gate 28's population, so it inherits 28a — **[S]**

Every pattern was written to attack a *report*, not a suggestion. Only 12 of the 74 rules have
`meta.hasSuggestions` at all, and no pattern was written by asking "what would make this rule's
suggestion wrong". The 5 residual divergences were found on inputs aimed at something else, which
is evidence the axis is productive and equally evidence the population is not designed for it.

---

## 31. Lint end positions — `scripts/compat-corpus/lint-adversarial-end.mjs`

**Unit.** Per finding whose full `(ruleId, line, column, message)` key already matches on both
sides, the `(endLine, endColumn)` pair. Ratchet
`compatibility/lint-adversarial-end-known-failures.json`. First run: **670 divergences over 4611
compared findings across 20 rules**.

**Why it exists.** Gates 11 and 28 key on a finding's START. A rule that reports at the right
place with the right text and underlines the wrong region was invisible to every gate this
project owns — the same split the compiler-error gates already make, where `end` is ratcheted
apart from `start` because *an entry listed for one suppresses everything about that entry*.

### Blind spot 31a — it compares only where the start already agrees — **[S]**

A finding one side does not report has no counterpart to compare an end with, so it is skipped
rather than reported here. That keeps this ratchet from becoming a copy of gate 28's, and it
means the two gates are coupled in one direction: **fixing a start-side divergence ADDS rows
here**, as previously-unmatched findings become comparable. A count that grows after a gate-28 fix
is expected, not a regression — and a count that shrinks because a finding *stopped* being
reported is a gate-28 regression wearing this gate's clothes.

### Closed 31b — `null` is compared as a value, and lint output can represent it — **[D]**

ESLint omits `endLine`/`endColumn` entirely when a rule reports a bare position (`loc: {line,
column}`). `rsvelte_diagnostics::Range` still requires an end because svelte-check and the
language server need a concrete range; lint findings carry separate `omit_end` metadata, and the
SARIF / engine-JSON compatibility encoders omit the two fields when it is set. That closed the
12 residual `experimental-require-slot-types` / `block-lang` rows without weakening the shared
type. The gate continues comparing `null` rather than skipping it, so the representation stays
pinned.

### Blind spot 31c — no message-independent identity, so a message change hides an end change — **[S]**

The comparison key includes the message text. A change that alters a rule's message AND its
reported range moves the finding out of both sides' maps in the same step, so this gate reports
nothing while gate 28 reports one start divergence — one entry standing in for two defects.

---

## 32. Lint environment — `scripts/compat-corpus/lint-env.mjs`

**Unit.** Per `(project, file)`, the same finding set as gate 28, over mini-projects under
`compatibility/lint-env/` whose sources are **byte-identical** and whose `package.json` is the
only variable. Ratchet `compatibility/lint-env-known-failures.json`, expected to stay empty.

**Why it exists.** eslint-plugin-svelte resolves `@sveltejs/kit` **from the linted file's path**
and disables five rules when it finds none. Every other lint population shares one ancestry, and
`compatibility/lint-adversarial/package.json` declares `@sveltejs/kit` for the whole adversarial
corpus, so "is SvelteKit installed" was a constant no gate could vary — and rsvelte had no
notion of the condition at all, reporting all five rules in projects where ESLint reports none.
Measured: 3 rsvelte-only findings on a two-file project without the dependency, 0 with it, the
manifest being the only difference.

### Blind spot 32a — one environment dimension, chosen because it was the one that bit — **[S]**

Only the SvelteKit dependency is varied. Everything else a checkout provides is still constant:
the TypeScript version, the `svelte.config.js` (absent here), a monorepo's intermediate
manifests, `.npmrc` hoisting layouts, and a `node_modules/@sveltejs/kit` directory that exists
without being declared (upstream accepts either; the fixtures exercise only the declaration).

### Blind spot 32b — dependencies are declared, never installed — **[S]**

The manifests list `@sveltejs/kit` but no `node_modules` is committed, which exercises upstream's
`getPackageJsons` fallback and **not** its `getNodeModule` directory probe. The two are separate
code paths in both implementations; only one is measured.

### Blind spot 32c — `svelteVersions` is deliberately out of scope, and that is a claim, not a gap — **[D]**

Upstream's `getSvelteVersion()` takes no file path: it reads the `svelte` package the *plugin
itself* resolves, so it describes the linter's installation rather than the linted project.
Measured directly — three projects declaring svelte 4, svelte 5 and nothing at all produced
identical oracle findings, including for a rule conditioned `svelteVersions: ['5']`. rsvelte
answering "5" unconditionally is therefore faithful, and a fixture varying the project's svelte
version would measure nothing.

### What it does see that nothing else does — **[D]**

It has two guards against being green for the wrong reason: the run fails if the oracle produces
no findings at all, and it fails if **every project yields the same oracle finding count** — which
would mean the manifests separate no rule, so agreeing with upstream would prove nothing about the
environment. It also refuses to run when two projects' same-named sources differ, since a
population that varies the sources measures the sources.

---

## 33. Lint default preset — `scripts/compat-corpus/lint-preset.mjs`

Ratchet: `compatibility/lint-preset-known-failures.json`, justified per key in the paired `.md`.

**Unit compared:** the default severity (`off` / `warn` / `error`) with no user configuration, per
rule id, over the 84 ids `rsvelte-lint --list-rules` and `eslint-plugin-svelte`'s rule map share.
Upstream's default is `flat/recommended`; rsvelte's is each rule's declared `default_severity`.
Key is `<upstream sev>-><rsvelte sev>|<id>`, plus `not-ported|<id>` and `rsvelte-only|<id>`.

It exists for C8: every other lint gate writes an explicit all-rules-`"warn"` config on both sides,
which is correct for comparing rules and makes the default configuration a constant they cannot
vary. Shared defaults are expected to match and now do; the ratchet keeps one-sided rule membership
visible without pretending those ids have a severity on both sides.

### Severity in the key was worth 21 rules the membership key called equal — **[D]**

The first version keyed on membership alone (`default-on-here` / `default-off-here`) and reported
29 differences; keying on severity took it to **50**. The 21 additions were rules both sides run
by default, upstream at `error` and rsvelte at `warn` — and `crates/rsvelte_lint/src/main.rs` exits
non-zero on `DiagnosticSeverity::Error` exactly as ESLint does, so `rsvelte-lint` exited 0 where
`eslint` exits 1 on the same source. All 21 were fixed rather than listed: rsvelte agreed with
upstream on all 13 rules whose severity was not the blanket `warn` (11 `error`, 2 `warn`), and every
divergence ran the same direction, which is the shape of an incomplete transcription rather than a
policy. Same lesson as `warning-missing:<code>` in C0 — put the class in the key.

Note what this does *not* say about the other gates: they still compare no severity at all
(`lint-verify.mjs` and `lint-adversarial.mjs` force `"warn"` on both sides and key on
`(ruleId, line, column, message)`). What gate 33 pins is the **declared default**. A rule whose
severity is wrong only when the user writes an explicit config is still unobserved everywhere.

### Blind spot 33b — the preset is read through `--list-rules`, not through a lint run — **[D]**, now covered by gate 36

The gate parses the CLI's own table rather than linting a file with no config and observing which
rules fired. Those are different claims: the table is what `RuleMeta::default_severity` says, and
what actually runs is that *filtered by* `enabled_script_rules` — which additionally drops
SvelteKit-only rules (`crates/rsvelte_lint/src/sveltekit.rs`) and rules whose `RuleConditions`
exclude the file's mode. Reading the table is still the right unit for "does the declared preset
match"; it is the wrong unit for "what does a user see".

**Gate 36 is the run.** `lint-severity.mjs` drives both tools with no rule configuration over all
1,365 adversarial patterns and compares the findings *with severity in the key*, plus the process
exit code. What it measured: **0 severity divergences over 1,179 / 1,178 compared findings**, so
the 21 alignments recorded above hold through an actual run and not only in the table — and **64
patterns whose exit codes differ**, which is a class this gate structurally could not have. Read
gate 36 for what the run still cannot see; the limit that remains here is 33c.

### Blind spot 33c — no config *file* is exercised — **[S]**

`extends`, `files`/`ignores` globs, per-rule options and severity overrides are all resolved by
`LintConfig::from_json_str`, and none of that is on this path — the gate never writes a
`rsvelte-lint.json`. Config **resolution** parity (which file is found from which directory, how
`extends` layers, what an unknown preset name does) is compared by no gate in this document.
ESLint's own flat-config resolution has no rsvelte counterpart to compare against, which is a
reason it is hard, not a reason it is covered.

### What it does see that nothing else does — **[D]**

`not-ported` and `rsvelte-only` keys are structurally invisible to every other lint gate:
`scripts/compat-corpus/lint-universe.mjs` intersects the two rule lists before configuring
anything, so a rule only one side ships is never enabled during any comparison. Porting a new rule,
or upstream adding one, moves a key here and nowhere else.

Two guards against being green for the wrong reason: the run fails if the shared population is
empty, and it fails if **either** side's preset enables every shared rule — which would make
membership a constant and the comparison vacuous. A third guards the parse: a `--list-rules` line
whose bracket field does not contain exactly one of `off`/`warn`/`error` aborts the run, because a
silently unparsed line would drop that rule from the comparison and read as agreement.

---

## 34. Lint rule conditions — `scripts/compat-corpus/lint-conditions.mjs`

Ratchet: `compatibility/lint-conditions-known-failures.json`, justified per key in the paired `.md`.

**Unit compared:** whether a rule runs at all, per rule id, on two axes — the runes mode pair
(`runs-in-runes`, `runs-in-legacy`) reduced from upstream's `meta.conditions` against rsvelte's
`RuleMeta::conditions`, the Svelte-5-unreachable set against `SVELTE_3_4_ONLY` in
`crates/rsvelte_lint/src/svelte_version.rs`, and separately the SvelteKit-gated *set* against the
hard-coded `SVELTEKIT_ONLY` list in `crates/rsvelte_lint/src/sveltekit.rs`. Key classes:
`gate|<id>`, `svelte-3-4-only-{missing,extra,unknown}|<id>`, `kit-gate-missing|<id>`, and
`kit-gate-extra|<id>`.

Current: the ratchet is empty. The two Svelte-3/4-only rules and all five SvelteKit-only rules are
modelled explicitly rather than accepted as divergences.

It exists because **a wrong condition flag is unobservable to every finding-level gate unless the
corpus contains a file in the mode the flag wrongly excludes** — and for a rule whose patterns are
all one mode, that never happens. `RuleConditions` was declared on all 74 rules and consumed by
nothing until this branch; once consumed, three flags turned out to disagree with upstream
(`no-inspect`, `prefer-derived-over-derived-by`, `experimental-require-slot-types`), each making
rsvelte run a rule ESLint skips. All three were found by hand, one at a time, which is what this
gate replaces.

### The reduction is the load-bearing part, and its first draft was non-discriminating — **[D]**

`shouldRun` ORs over condition objects, and an object with no `runes` key constrains nothing on
that axis. Unioning across **all** objects reports six correctly-gated rules as wrong, because
rules like `no-extra-reactive-curlies` carry
`[{svelteVersions:['3/4']}, {runes:[false,'undetermined'], svelteVersions:['5']}]` and the first —
unreachable at Svelte 5 — contributes "runs in runes mode". Measured: the naive reduction produced
10 rows, of which 6 were artefacts of the arithmetic and 4 were real. `upstreamGate` filters to
objects whose `svelteVersions` admits `'5'` first. A comparison that cannot separate a real
mismatch from its own reduction is worse than none, because its rows read as surveyed.

### Blind spot 34a — the gate reads `meta.conditions`, and upstream does not always put it there — **[D]**

`no-at-const-tags` declares no `runes` condition and enforces `if (runes !== true) return {}` in the
rule **body** instead. rsvelte mirrors that placement, so its metadata now agrees, but any other rule
that hides a gate inside `create()` remains invisible to this comparison; nothing enumerates those
checks. This instance was found only by reading the source after the first gate run flagged the
previous duplicated `runes_only: true` representation.

The related worry that rsvelte's boolean pair cannot express upstream's tri-state was **checked and
retracted**: `'undetermined'` is unreachable for any file either linter parses, because
`svelte-eslint-parser` resolves an unspecified mode through `hasRunesSymbol`, which returns a
boolean (`parser/index.js:116`, `svelte-parse-context.js:65`), and the plugin's `?? 'undetermined'`
fires only when `svelteParseContext` is absent entirely. `runes !== true` and
`runes: [true,'undetermined']` therefore agree on every real input, and a third state would be
representation without a referent. Recorded because the argument is contingent on upstream's parser,
not on anything in this repository.

### Blind spot 34b — rsvelte's side is a regex over Rust source — **[S]**

`rsvelteConditions` parses `name:` and `runes_only:`/`legacy_only:` out of each
`crates/rsvelte_lint/src/rules/*.rs`, so a rule that builds its `RuleMeta` any other way — a macro,
a shared constant, a computed value — is read wrong or missed. Two guards, neither complete: a
module declaring a rule name without a readable flag pair aborts the run, and a rule the binary's
`--list-rules` reports but the parse missed aborts it too. Neither catches a flag pair the regex
reads from the *wrong* `RuleMeta` in a file declaring two rules.

### Blind spot 34c — two of the five condition axes are not compared — **[S]**

`svelteFileTypes` is uncompared outright. `svelteVersions` is used only as the reachability
filter, so a rule entering or leaving the Svelte-5-reachable set moves a version-gate key, but a narrowing
*within* 5 would not. Neither axis currently carries a value that separates rsvelte from upstream,
which is a statement about this plugin version and not a guarantee.

---

## 35. Whole-config lint autofix — `scripts/compat-corpus/lint-adversarial-fix-all.mjs`

**Unit.** Per pattern under `compatibility/lint-adversarial/`, the **text** `--fix` produces with
all 74 universe rules forced to `warn` on both sides, compared byte-for-byte. Ratchet
`compatibility/lint-adversarial-fix-all-known-failures.json`, justified per cluster in the paired
`.md`. Two verdicts share the key space: a bare `<id>` is a text divergence, `oracle-crash:<id>` is
a pattern ESLint threw on while fixing. First run: **1364 compared, 793 rewritten by the oracle,
792 by rsvelte, 20 divergences + 1 oracle crash**; 19 entries after the defect below was fixed.

**Why it exists.** It closes blind spot 29a, and the measurement is the argument: of the 21
non-parity units, **zero** were unattributable driver-policy noise. 16 reproduce gate 29's own
per-rule entries, 1 is the same deliberate cause reached through another rule's fix, 1 is the
fix-side face of a listed gate-28 report entry, 1 is an upstream crash, and 2 were a real rsvelte
defect no other gate could see. A gate whose ratchet is a sea of unattributable entries would have
been worse than a documented negative result; this population is not that.

**What it found — [D].** rsvelte's `--fix` and its report path filtered disable directives against
different line tables. `lint_source_messages` uses the line the finding is *reported* on, which for
the seven rules in `diagnostic.rs::uses_eslint_line_table` counts U+2028/U+2029; `fix_source_at`
and `lint_source_raw` used `LineIndex::line`, which never does. Both directions reproduced:
`comment-directive/22-u2028-next-line.svelte` was suppressed in the report and rewritten by
`--fix`, and `comment-directive/23-u2029-disable-line.svelte` was reported at 2:9 and not fixed.
Both reproduce with a **single** rule enabled (`svelte/html-quotes`) — they are not interactions,
they are a rule gate 29 never runs on those patterns. Fixed via `LintDiagnostic::report_line`.

It also found an upstream crash reachable only across rules: `svelte/no-useless-mustaches` rewrites
`href={``}` to `href=""`, and `svelte/no-navigation-without-base` then reads `node.value[0].type`
on an attribute whose `value` array is empty.

### Blind spot 35a — one configuration, and it is not a user's — **[S]**

Every rule is forced to `"warn"`, which is what makes rsvelte and ESLint comparable, but no user
runs all 74 at once: real configs are a preset plus overrides, and which rules are *absent* decides
which fix pairs can interact at all. The gate therefore samples one point in a 2^74 space — the
maximal one, chosen because it is the only point that needs no product decision to justify. A
divergence that appears only when a specific rule is *off* is invisible here.

### Blind spot 35b — it cannot tell a driver-policy difference from a rule defect on its own — **[D]**

The verdict is one bit per pattern. Attributing the 21 units above took a second instrument:
per-rule fix runs over the divergent files plus leave-one-out over the universe on both sides
(which is how `no-nested-style-tag/14` was pinned to the `html-self-closing` /
`html-closing-bracket-spacing` oscillation, and the oracle crash to `no-useless-mustaches`).
Neither instrument is in the gate. A future entry needs that work redone by hand, and an entry
filed without it is a guess.

### Blind spot 35c — a crash is a ratchet entry, so the pattern behind it is uncompared — **[S]**

`oracle-crash:<id>` suppresses everything about that pattern, exactly as an ordinary entry does for
its file: while ESLint throws, rsvelte's whole-config output on that pattern is graded by nothing.
The class is in the key so a crash cannot silently become a text divergence, but the file is out of
the comparison until upstream fixes the crash.

### Blind spot 35d — same population as gates 28-31, so it inherits 28a — **[S]**

Every pattern was written to attack one rule's *report*. None was written by asking "which two
rules' fixes would collide here", which is the question this gate exists to ask. Its two real finds
came from inputs aimed at something else — evidence the axis is productive and equally evidence the
population is not designed for it. Real-world sources are not in this gate at all: `lint-verify.mjs`
grades 6,788 of them for reports and never runs `--fix`.

### Blind spot 35e — text equality, so the edit SET and the pass COUNT are invisible — **[S]**

Inherited from 29b and 29c and for the same reasons: two different edit lists converging on the
same bytes are equal here, and a difference in how many passes each driver took is only visible
when it changes the final text. rsvelte's `fix_all` and ESLint's `verifyAndFix` both bound at 10
passes, and ESLint additionally reports a circular fix (`ESLintCircularFixesWarning`) — which is
what `no-nested-style-tag/14` triggers. Where the two sides' loops end on different phases of an
oscillation the gate sees a text divergence and says nothing about why.

---

## 36. Lint default configuration — `scripts/compat-corpus/lint-severity.mjs`

Ratchet: `compatibility/lint-severity-known-failures.json`, justified per cluster in the paired
`.md`.

**Unit compared.** Per pattern under `compatibility/lint-adversarial/`, with **no rule
configuration on either side** — `eslint-plugin-svelte`'s `flat/recommended` verbatim
(`lint-oracle/preset-run.mjs`) against `rsvelte-lint` with no `--config`:

1. `severity|<id>|<rule> <line>:<col>|<oracle>-><rsvelte>` — a finding both sides report at the
   same position and message, at different levels;
2. `missing|` / `extra|` — findings on the 33 rules **both** presets enable by default, minus
   `lint-universe.mjs`'s `EXCLUDE`;
3. `exit|<id>|<o>-><r>|<causes>` — the process exit code, with the error-severity rule ids /
   diagnostic codes of the exiting side in the key;
4. `oracle-crash|<id>|<rule>` — an upstream rule that threw.

The subject is run **one process per pattern**: an exit code is a property of a run, so a batched
run has no per-pattern answer to compare.

**Why it exists.** Gate 33 pins the two presets, but through `--list-rules` and upstream's exported
config object — the declared tables, never a run (33b, now closed). Gates 28–32 and 35 write an
all-rules-`"warn"` config on both sides, which is right for comparing rules and makes three things
constants none of them can vary: a finding's **severity**, the **exit code**, and whether an inline
`/* eslint … */` comment can still enable a preset-`off` rule.

**What it found — [D].** The severity axis is **0 over 1,179 / 1,178 compared findings**, which
confirms gate 33's 21 severity fixes end to end. The exit code is not: **64 patterns** disagree.
Fifty-nine are rsvelte exiting 1 on a Svelte **compiler** diagnostic that `svelte-eslint-parser` is
too permissive to see; compiling all 59 with `submodules/svelte` shows **55 the official compiler
also rejects** and **4 rsvelte over-rejects** — a `$`-prefixed class member name read as a store
reference (`class P { $abc() {} }`), and legacy mode failing to turn a rune-named `$` reference into
a store subscription (upstream's `runes_option === false ||` short-circuit at
`2-analyze/index.js:366`), both in
`crates/rsvelte_core/src/compiler/phases/2_analyze/store_subscriptions.rs`. Four more are upstream's
`no-navigation-without-resolve` reporting at `error` while rsvelte excludes the rule as type-aware —
**an `EXCLUDE` entry removes a rule from a finding comparison and cannot remove it from the exit
status**. And running upstream's default preset reached a rule no other gate enables, which
**throws** on `<a href="…" rel>`; ESLint's fatal message destroys the file's whole report
(`upstream_issues/eslint-plugin-svelte-no-navigation-without-resolve-empty-rel-crash.md`).

**Guards, each against a way of being green for nothing.** The run fails if no rule is default-on on
both sides, or if *every* shared rule is (the presets would no longer differ); if a
`rsvelte-lint.json` is discoverable from the repository root upward, since `rsvelte-lint` with no
`--config` would resolve it and the gate would measure a *configured* run; if either side's findings
are all one severity, because a constant measurand cannot distinguish divergence from agreement
(currently 402/1,035 oracle, 2,504/1,034 rsvelte, and forcing `--error svelte/no-at-debug-tags`
moves 76 keys); and if no pattern reports a rule both presets leave `off`, which is the only
evidence the inline-configuration axis is exercised at all.

### Blind spot 36a — the finding comparison excludes exactly the rules the presets disagree about — **[S]**

`missing`/`extra` are scoped to the shared default-on set precisely so gate 33's declared-table
differences do not reappear here as finding-level entries. The cost is that the **findings** of a
rule one side runs by default and the other does not are compared by no gate under default
configuration: gate 28 compares them with both sides forced to `"warn"`, and gate 33 compares only
the declared default. A rule that behaves differently *because* of its default severity or options
would fall between the two. The current shared population for that blind spot is the remaining
`error->off` entry; its size is otherwise unmeasured.

### Blind spot 36b — inline configuration is asserted to exist, not compared — **[D]**

The gate fails if no pattern reports a rule both presets leave `off`, which proves the axis is
live; it does not put those findings in the key. Measured by hand at the time of writing:
`button-has-type` 13/13, `prefer-class-directive` 6/6, `no-trailing-spaces` 9/9, `sort-attributes`
7 upstream / 6 here — and that one difference is the `order`-option entry already in
`lint-adversarial-known-failures.json`, not a failure to enable. So inline enable behaves
identically today, and a future regression in it would surface here only as the guard tripping to
zero, not as a divergence.

### Blind spot 36c — one population, one project manifest, one preset version — **[S]**

Same corpus as gates 28–31, so it inherits 28a: every pattern was written to attack one rule's
report, none to attack a default. `compatibility/lint-adversarial/package.json` declares
`@sveltejs/kit` for the whole tree, so the five SvelteKit-gated rules are default-on throughout and
their absence is never exercised (gate 32 varies that axis, but under an explicit rule config). And
upstream's `flat/recommended` is a hand-maintained list that moves on a plugin bump: a rule added to
or removed from it changes this gate's population without any rsvelte change.

### Blind spot 36d — exit codes are compared per file, and nobody lints one file — **[S]**

A real run lints a directory and gets one exit code for the whole tree, which is the OR of the
per-file answers. Both tools compute it that way, so the per-file comparison is strictly stronger —
but it also means the gate says nothing about `--max-warnings`, ESLint's `--max-warnings`
equivalent, or any other whole-run policy that can turn a warning-only run non-zero. Neither side's
CLI flag surface is compared by any gate in this document.

---

## 37. Transform idempotency — `scripts/compat-corpus/idempotency-verify.mjs`

**Unit.** One `(corpus component, client mode)` compile, 13,783 x 2 = 27,566 of them. Nothing is
compared against official. The gate asserts a **property of rsvelte's own transform**: with
`RSVELTE_ASSERT_TRANSFORM_IDEMPOTENT` set, every top-level `apply_transforms_to_expression`
re-applies itself to its own output and prints a marker when the two prints differ. Any marker
fails the run. Hard gate, no ratchet.

**Why it exists.** `try_transform_assignment` converts both sides of a member mutation and hands
the result back to the outer walk, so a read transform whose output the walk can transform again
is applied twice — #3026, where `state.a = state.b` in an inline template arrow emitted
`state().a = state()().b`. Output equality could not find it: the shape occurs **0 times in the
12,523 corpus components measured when #3026 was reported**, and the bad output parses, so the
corpus gate and the parse oracle were both green. The generated `write-host` family (§5q) does find it, but a generated family is
bounded by the axis values its author wrote; this gate is bounded by nothing the author chose,
because it asks the corpus a question about the compiler rather than about the input.

**[D] and positive control, one measurement.** This tree, and the same tree with the one line in
`b::getter_call` that marks the produced callee opaque removed — which un-seals all seven read
builders and is the state every one of them was in before #3026:

| tree | non-idempotent transforms | units carrying one |
|---|---|---|
| this tree, `b::getter_call` un-sealed | 37,352 | 7,888 of 27,566 (28.6%) |
| this tree | 0 | 0 |

Both compile the corpus to **0 output divergences**, and sealing the five builders #3026 did not
reach left all 37,596 `(file, target)` output hashes byte-identical — so this is a property
change, not an output change. The corpus carried the ingredients of #3026 in more than a quarter
of its units the whole time; only the re-walk path made one of them observable.

Two earlier measurements, on the pre-#3053 tree and its 27,548-unit corpus, split that total by
builder: the merge base scored 37,346, and the tree with #3026's own two builders sealed still
scored **9,274 across 2,530 units** — the five the report never reached. Built against that
merge base, the check also fires on #3026's own repro (`state().b` -> `state()().b`).

**[D] The gate's own vacuous green, found by running it against a binding that lacks it.**
Pointed at a `main` binding — a tree with five of the seven read builders still unsealed — the
first version reported `0 violations`, because a compiler with no check compiled in prints
nothing and silence was read as success. The compiler now announces
`RSVELTE_IDEMPOTENCY_ARMED` from **inside** the comparison and the script exits 2 without it,
so "the binding predates the check", "the variable was never read" and "the entry point was
never reached" all fail instead of passing. What remains is 28f.

### 37a — the server transform is not in the population [S]

`generate: 'server'` registers no identifier transforms, so the entry point never runs there. A
server-side double-application would be invisible to this gate. Both client modes are swept
because dev reaches codegen paths prod does not.

### 37b — only the top-level entry is checked, not `…_with_shadowed` [S]

The check sits in `apply_transforms_to_expression`. `apply_transforms_to_expression_with_shadowed`
is public and called directly (`each_block.rs`, `types.rs`), and those calls are unchecked — a
non-idempotent transform reachable only through a shadowed-scope walk would not be seen. Nesting
is suppressed by a thread-local so the check does not go quadratic, which means the outermost
call is the only one that reports.

### 37c — the comparison is a print from the fallback text printer [S]

`generate_expr` renders `Raw` and the nodes it does not support opaquely or truncated, so a
divergence inside one of those is erased before the comparison. Truncated prints are *skipped*
rather than reported (an unbalanced bracket count is the tell): measured on the first sweep, 12
of 1,153 unique divergent pairs were printer truncations and the other 1,141 were the real
class. The direction of this limit is one-sided — the printer can hide a divergence, never
invent one.

### 37d — idempotent is not correct [S]

A transform that produces the wrong expression *consistently* satisfies this gate. It answers
"can a second pass change this", nothing else; what the first pass should have produced is the
output gates' question. Read it as a necessary condition that no amount of corpus growth would
otherwise supply, not as a correctness proof.

### 37e — it runs in one job, on a corpus that must already be collected [S]

Wired into `corpus-compat.yml`'s `Compiler parity` job, after `collect.mjs` and before
`compile.mjs`. It refuses below 1,000 manifest components and refuses if the worker reports
fewer units than that, so a wiped `sources/` tree fails instead of passing vacuously — the
`vacuous green` class at the top of this file.

### 37f — the armed marker proves the check ran, not that it still compares [S]

A comparison that regressed to always-equal would emit the armed line and no violations, and
this script cannot tell that from a clean tree. The reporting rule — including the
truncated-print skip — is therefore factored into `idempotency_report` and pinned by a unit
test (`idempotency_report_tests`), which is where that failure mode is caught. The remaining
uncovered case is a break in the *re-application* itself (a second pass that silently becomes a
no-op for the wrong reason); nothing here would see it.

---

## 38. NAPI `cssHash` — `scripts/dev/test-napi-css-hash.mjs`

**Unit.** One component with one scoped selector, compiled through the raw addon for `client` and
`server` under five callback shapes, compared to the **official** compiler's `css.code` for the
same callback; plus the callback's own argument list, the rejection the synchronous entries raise,
and the two degenerate returns (a non-string, and a throw). Hard gate, no ratchet.

**Why it exists.** `cssHash` is the one compile option whose value is a *callback*, and that makes
it invisible to gate 22 twice over. It was not declared at the boundary, so the exhaustiveness half
had no row for it (22b); and gate 22's discrimination test is "do the two results differ", which is
exactly what a *dropped* option fails — but the drop was at the JS-object decode, before any
comparison, and the option never appeared in the denominator to be tested. #3294 is what that cost:
`compile()` returned a wrong scope class with no error, and `compileWithCssHash` invoked the
callback with three positional arguments (`name`, `filename`, `css`) where upstream passes one
object carrying `hash`, so the documented `({ hash, css }) => …` idiom threw, and every failure on
that entry was an **uncaught exception** rather than a rejected promise.

**[D] Positive control on the last of those.** napi's `ThreadsafeFunction::call_async` documents
that a JS throw is routed through `napi_fatal_exception`, which terminates the process;
`call_async_catch` is the one that returns `Err`. Built with `call_async`, this gate's throwing-
callback case kills the runner (the `try`/`catch` around the `await` never runs, and the awaited
promise settles as `oneshot canceled`); with `call_async_catch` it rejects with the callback's own
message. No other gate distinguishes the two, because `test-vps-shim.mjs` reaches this entry only
through an adapter that catches the throw in JavaScript first.

### 38a — one component, one option set [S]

Every case compiles the same `<p class="k">` + one rule, with `filename: 'Probe.svelte'` and
`css: 'external'`. A `cssHash` interaction with `customElement`, `dev`, a preprocessor map, or a
component with several scoped selectors is not in the population.

### 38b — only `css.code` and the class inside `js.code` are compared [S]

The scope class is extracted from official's `css.code` with a regex and looked for in rsvelte's
`js.code`; the rest of `js.code`, the maps and the warnings are not compared to official on this
gate. A `cssHash` that reached the stylesheet and not (say) the server's `$.attr_class` argument
list would pass, since `includes()` only needs one occurrence.

### 38c — the other two ports of the same option are not here [S]

`cssHash` is implemented three times: the napi bridge, the wasm bridge
(`crates/rsvelte_lint_bindings/src/compiler_wasm/mod.rs`, exercised by
`scripts/dev/test-wasm-compile-options.mjs`, whose rejection matrix compares against official), and the
`rsvelte` facade's `options.rs`, which no gate drives at all. This is the "two ports of one
function and no gate compares the ports" shape recorded for the constant fold: the wasm port
already passed the official argument shape while the napi port did not, and nothing would have
reported the disagreement.

### 38d — it needs a freshly built addon and says nothing when it cannot load one [S]

Like gate 22 it exits **2** when `apps/npm/vite-plugin-svelte-native-<triple>/rsvelte.node` is
absent, which CI treats as a failure but a local run can silently skip. A **stale** addon is worse:
it loads, and every assertion then measures a binary that predates the change under test.

---

## 39. Public `parse()` AST — `scripts/compat-corpus/parse-ast-verify.mjs`

**Unit.** One `(corpus entry, axis)` pair, over the 14,331 `.svelte` entries of the corpus
manifest. Axes: `modern` (`parse(src, { modern: true })`), `legacy` (`parse(src)` — the default
shape), and `loose` (seven inline sources). Both sides are compared after
`JSON.parse(JSON.stringify(...))`. Shrink-only ratchet
`compatibility/parse-ast-known-failures.json` — count the JSON, which is primary; this sentence
has carried 480 while the file held 301 — justified per cluster in the paired `.md`. Runs as a
step in the `corpus` job (~50s over 28,208 compared pairs).

**Why it exists.** `parse()` is a documented export of `svelte/compiler`, distinct from
`compile()`, and nothing here compared its return value to official's. It is the
`result.warnings` hole one export over — invisible *by construction, at any corpus size*, not
for want of inputs: the pipeline had 14,331 components and never called the function.

**[D] The comparator manufactures nothing.** Running the gate's own `diffKeys` with the
**official** compiler on both sides of the same population produces **0 keys from 28,178
self-compared pairs**, so every listed key is attributable to rsvelte's side rather than to
the harness (the run that produced this was the 652-key first baseline; the conclusion is about
the comparator, not about that number). Two failure directions were also driven: deleting
`modern::Root#span` from the
ratchet exits 1 with `NEW divergence (12,324 entries)`, and adding a key that no longer diverges
exits 1 with `listed key no longer diverges`; restoring the file returns exit 0 and a
byte-identical tree.

**[D] What the two suites nearest to it could not see.** `Parser Modern 27/27` and
`Parser Legacy 81/81` compare rsvelte's AST to upstream's checked-in `output.json`, which reads
as coverage of this API. Three things separate them from this gate, each with a citation:

- They call `rsvelte_core::parse` directly and choose `convert_to_legacy` from the fixture's
  directory (`parser_fixtures.rs:155-165`), so `parse()`'s own `modern` / `loose` handling —
  #3385 — is never exercised on either side.
- `normalize_json` → `remove_character_from_loc` (`parser_fixtures.rs:61-96`) deletes
  `loc.start.character` / `loc.end.character` from **both** sides before the assert. That field
  is 6 of this gate's keys and rsvelte gets it wrong in both directions (omits it on an
  `Identifier`, adds it on a comment).
- Upstream's own harness does `input.replace(/\s+$/, '')` before parsing
  (`tests/parser-modern/test.ts:14-17`), so every checked-in `output.json` records `Root.end` of
  a **trimmed** input. rsvelte's `load_fixture` does not trim, and its `Root.end` stops at the
  last non-whitespace byte — two different inputs producing the same number. `if-block`'s input
  is 18 bytes, its `output.json` says `"end": 17`, and both implementations produce 17 for
  different reasons. The fixture gate is green on #3386 by compensation, not by agreement.

### 39a — the ratchet key is a field, and two entries diverging in the same field are one key — **[S]**

The key is `<axis>::<NodeType>.<field>#<kind>`, so `Identifier#span` is one entry whether thousands of
components or one exhibit it, and *which* components exhibit it is not in the key. A change that
fixes the span on all but one component and breaks a new one is green. Entry counts are printed on
every run and are **not** ratcheted, deliberately: they track corpus size, so on a weekly
submodule bump a count-bearing ratchet would fail for a reason that is not a regression. The
alternatives were measured — per entry id is a five-figure file, per divergent-path-set is 472
classes over 4,468 files — and both are recorded in the script header.

### 39b — a divergence stops the walk, so what is behind it is uncompared — **[S]**

`diffKeys` does not descend past a `type` mismatch (two node types have no fields in common), and
does not descend into a key that is `#missing` or `#extra`. So every `node-type` key and every
`estree-fields` key hides an entire subtree that has never been compared: fixing one will
*add* keys as its children become reachable. This is the same one-directional coupling the
lint gates have between `start` and `end` — expected, not a regression. **Measured on the first
instance**: #4220's seven TypeScript type arms retired 16 keys and enrolled 2, from one
mechanism — and three of the sixteen were node types the fix never named, freed from under a
`.type#value` that had been masking them. The two counts this row carried (141 and 75) were the
first baseline's and had gone stale by a factor of ~2.5; read them live off
`parse-ast-known-failures.json`, whose values are the cluster labels.

### 39c — both-reject is not compared at all — **[S]**

229 entries per axis are rejected by both compilers and scored `both-reject`, with nothing
compared. rsvelte's NAPI `parse` surfaces `format!("{e:?}")` of the Rust error
(`crates/rsvelte_napi/src/lib.rs:226`), not a Svelte error `code`, so the two rejections have no
comparable field. `verify.mjs` ratchets error `code` / `message` / `start` / `end` / `frame` for
`compile()`; `parse()` has no equivalent, and 458 (entry, axis) pairs sit in that hole. Closing
it means giving the binding a structured error, not changing this gate's key.

### 39d — `start`, `end` and `loc` are merged into one `#span` key — **[S]**

A node whose `end` is wrong and a node whose `loc.start.column` is wrong produce the same key.
They are derived from the same offsets, and split by field they were 672 keys for the same
defects; `loc`'s *presence* is kept separate (`loc-presence`) because "no position at all" is a
different defect. What is lost: a fix that corrects `end` and leaves `loc` wrong shrinks nothing.

### 39e — the `loose` axis is seven hand-written sources — **[S]**

`LOOSE_SOURCES` is inline in the script. Its population is bounded by what its author thought of;
the two controls (`valid-control`, which both sides accept, and `stray-closing-tag`, which both
still reject) fix the two ends, but a recovery shape nobody wrote is not measured. It cannot be
grown from the corpus: published code compiles, so the population `loose` exists for is not
collectable.

### 39f — one filename, one `rootDir`, and `parseCss` is not here — **[S]**

Every call passes only `modern` / `loose`. Upstream's `parse()` also accepts `filename` and
`rootDir` (both documented as unused and slated for removal), and `svelte/compiler` exports
`parseCss` and `print`, neither of which any gate in this repo drives. `print` is the other half
of upstream's own parser suite (`test.ts` re-parses `print(ast).code` and asserts a fixpoint);
that round-trip is not reproduced here.

### 39g — it reads the NAPI binding, and the wasm `parse_svelte` is a second port — **[S]**

`napi_parse` and the wasm `parse_svelte` build their own `ParseOptions` independently, and they
already disagree: the NAPI one sets `capture_comments: true`
(`crates/rsvelte_napi/src/lib.rs:195-206`) and the wasm one takes `ParseOptions::default()`
(`crates/rsvelte_lint_bindings/src/compiler_wasm/mod.rs:87-89`), so the wasm AST carries no node
comments at all. Only the NAPI port is driven here. This is the "two ports of one function, and
no gate compares the ports" shape from `two-ports-inventory.md`, and the wasm one is what the
playground (`apps/playground/src/lib/compiler.ts`) and the published wasm build call.

### 39h — aligned comment ownership is strict, but missing structure is outside that assertion — **[S]**

The CI invocation adds `--comment-owners`, which joins a comment by its `(start, end)` range and
names its owner by `(type, start, end, leading-or-trailing)`. It requires **zero** movements when
the same comment and the expected owner node both exist on rsvelte's side. The owner index walks
the complete AST independently of `diffKeys`, so an unrelated ancestor mismatch cannot stop it.
This closes 39a and 39b for the #3702 class: moving a comment from one aligned node to another can
no longer hide behind an already-listed field-level key or a stopped field walk.

The assertion deliberately excludes three different classes and prints their counts separately:
a comment missing from rsvelte, a comment present only in rsvelte, and a difference whose expected
owner node does not exist in rsvelte's AST. Those remain visible to `diffKeys` and its shrink-only
ratchet, subject to 39a and 39b; treating them as owner movements would make a structural
node-presence defect look like comment traversal. The join also uses one `Map` entry per comment
range, so two independently represented comments with exactly the same range would collapse into
one observation.

### 39i — a node kind rsvelte's serializer drops has no corpus carrier, so this gate never sees it — **[D]**

The unit is a corpus entry, so a kind rsvelte omits from `parse()` is only observable where a
collected component contains one. Three catch-all arms in the program serialization each end
`_ => None` and drop whatever their explicit arms do not name:
`1_parse/read/expression.rs:9681` `convert_statement_for_program`,
`:12085` `convert_class_element_for_program`, `:5654` `convert_class_element_for_expr`. The
residues, computed as the scrutinee enum's variants (with `INHERIT` resolved) minus the handled
ones, are `TSImportEqualsDeclaration`, `TSExportAssignment`, `TSNamespaceExportDeclaration` and
`TSIndexSignature` once the kinds both compilers reject earlier (`with`, `accessor`) are removed.
Measured: official's AST carries all four and rsvelte's carries none, with `IfStatement` and a
class `static {}` present in both as controls (#4195).

None has a carrier in the corpus sources checked out here — class-body index signatures are 0 of
31 index signatures found (19 `interface`, 7 `type`, 1 a class field's type annotation), and the
three statement forms are TS module syntax a component does not use. That denominator is 20 of
the 104 sources, so this is "no witness in the population measured", not "no carrier". The
detector for this class is a unit test, the same argument
`crates/rsvelte_core/tests/import_export_parser_shapes.rs` already carries for two shapes no
corpus can hold.

**What generalizes past these four.** The blind spot is not the four kinds, it is that a dropped
kind is invisible to *every* gate at once: `compile()` may still be correct (it is, for
`TSIndexSignature`), so the output ratchets report nothing, while `rsvelte_lint` and svelte2tsx
consume rsvelte's AST without ever diffing it. An inventory of the 1,316 catch-all arms under
`crates/` found something worth recording about how to screen them — a syntactic filter that
discards an arm whose sibling heads are literals throws away **149 of the 590 it discards
(25%)** that are node-kind dispatches spelled as strings (`match node_type(e) { Some("Identifier")
… }`), which are exactly the JSON-walking lint rules. The screen's error is only visible in the
pile it rejects.

### 39j — the population floor counts pairs, so it cannot see which repositories produced them — **[D]**

`MIN_COMPONENTS = 10000` (`parse-ast-verify.mjs:109`) is a floor on *compared pairs*, which is the
right guard against the vacuous-green class it was written for and says nothing about source
coverage. Measured 2026-09-03 on a checkout with **7 of the 104 declared sources populated**:
`collect.mjs` writes **11,673 entries** and this gate runs to completion over them. The other two
floors in the pipeline are the same quantity at different thresholds — 1000 in `collect.mjs`,
30000 in `verify.mjs` and `svelte2tsx-verify.mjs` — so that same checkout clears two of the three,
and 30000 catching this one instance is an accident of where the threshold sits, not a property it
measures.

The direction that matters is the rewrite. A **verdict** from a narrowed population fails loudly
here, because a ratchet with 301 entries reports every unmeasured key as `listed key no longer
diverges`; `--update-baseline` **deletes** them instead. Nor is the shortfall silent — it is 97
`missing at submodules … skipping` warnings — but they sit above a plausible five-figure total
that is the one line anyone reads.

Closed by `unpopulatedCorpusSources` / `unpopulatedSourcesReason` in `baseline-guard.mjs`, wired
into the rewrite guards of this gate, `verify.mjs` (both manifest-based sites) and
`svelte2tsx-verify.mjs`, and printed by `collect.mjs` as `sources: N/104 populated` plus one
`EMPTY <path>` line per absent source. It throws rather than returning an empty list when either
input is missing, because "I could not measure the coverage" and "the coverage is complete" are
the same empty array.

**Only `lint-verify.mjs` already had this** (`lint-verify.mjs:216-227`), with a comment stating
the reason in the general form — "the entry-count floor is a lower bound, so it cannot see the
loss of one small repo". One gate held the lesson and three did not, which is the two-ports shape
with the comparison missing: nothing in the tree asked whether the sibling guards agreed.

Controls, both directions: a synthetic manifest built from 7 source ids reports 97 of 104 with the
paths named, the real tree reports 0, and a sandbox that declares one source its manifest does not
cover exits 2 with no ratchet rewritten while the identical run exits 0 once the declared set
matches again (`scripts/dev/test-corpus-verify-baseline-flags.mjs`).

---

## 40. Wasm compile-option boundary — `scripts/dev/test-wasm-compile-options.mjs`

**Unit.** Six invalid option objects are compiled by the wasm binding and the
workspace-pinned official `svelte/compiler`; the error `code` and first message line must
agree. Independent assertions cover the six legacy warning codes, truthy non-boolean `runes`,
the three parametric options, `warningFilter`, and `cssHash` callback arguments, fallback and
throws. Hard gate, no ratchet.

**Sharpest blind spots [S].** The rejection grid samples six of the declared keys and only one
invalid value per key. It does not compare error positions, two-invalid-key ordering, most
successful scalar values, or any C ABI/NAPI result. Callback parity is mostly property-based
rather than full output equality, and all cases compile one small component. The key list is
manually mirrored in the binding, so adding the same option to every list without a behavioural
case can still pass. The npm oracle version can briefly lead or lag the Svelte submodule pin.

---

## Cross-cutting

### C0. A ratchet key is a lossy encoding, and it loses in two directions

Every ratchet compares by a key, and the key is a spelling of the gate's state space. Any two
states it cannot spell apart become one verdict, and the transition between them is then
unobservable. This has now bitten in **both** directions, with a measured instance each — so
treat it as a property of ratchets, not as one gate's oversight:

- **Grow side — two failures share a symbol.** The corpus warning ratchet keyed
  `(id, verdict, target)` with a flat `warning-mismatch`, so two *different* missing warnings on
  one id were indistinguishable. **[D]** #2715's positive control (re-break #2521 so
  `event_directive_deprecated` stops firing) came back **green**, because 3 of 4 cases were
  already listed for a different missing warning; re-keyed to `warning-missing:<code>` the same
  revert yields **9** new ids. Bound on the history: any warning regression landing on an
  already-listed id was invisible until that re-key.
- **Shrink side — a failure stops producing a verdict.** The validator message ratchet folded
  "now matches" into the same outcome as "no longer compared" (gate 16a), and `verify.mjs`'s
  error loop `continue`s past a missing artifact into `errorCounts.match++`, so an absent tree
  scores 100% error parity (#2707). **[D]**

**The two fixes are not substitutes, and neither subsumes the other.** Refining the key only
separates entries that still emit one; an entry that leaves the population emits nothing, so
there is no key to refine. Adding a third state only helps entries that vanish; it says nothing
about two failures sharing a symbol while both are present. When adding a ratchet, ask both:
*can two different failures land on one key?* and *what happens to an entry that stops being
measured?*

### C8. Every lint gate configures all 74 rules explicitly, so none compares the DEFAULT rule set

`lint-verify.mjs`, `lint-adversarial.mjs` and every gate derived from them write a config that
enables the whole parity universe at `"warn"`, and the oracle is driven the same way. That is the
right choice for comparing *rules*, and it meant **no gate observed which rules a user gets when
they write no config at all** — the single largest behavioural difference between the two products
for someone switching. Gates 33 and 36 are the two halves of the answer; the rest of this entry is
what they found.

Measured, not assumed. Over the 84 rule ids the two share, the first measurement found rsvelte's
default preset (`LintConfig::recommended()`, "every rule at its declared default severity") running
**56** and eslint-plugin-svelte's `flat/recommended` running **36**. Twenty-two rules ran by default
only in rsvelte (`no-inline-styles`, `no-unused-class-name`, `prefer-const`, `no-target-blank`,
`block-lang`, `consistent-selector-style`, `require-stores-init`, …); those declared defaults now
match upstream at `off`. The declared shared sets initially enabled **35** and **36** rules. Fixing
the native `no-unused-props` path's `ignorePropertyPatterns` handling made it safe to declare
upstream's `error` default too, so the shared default tables now agree.
`svelte/require-event-dispatcher-types` also declares upstream's `error` default, while the
independently ratcheted Svelte-version eligibility model skips that Svelte-3/4-only rule on every
Svelte 5 input, including when explicitly configured.

Membership was not the whole of it, and that is the part worth carrying forward. Twenty-one further
rules ran by default on **both** sides at different severities — upstream `error`, rsvelte `warn` —
which decides the CLI's exit code in both tools. Those were fixed, not recorded; see gate 33.

**Gate 33 now measures it, and the way it does so is the point.** Shared defaults are compatibility
claims and are expected to agree. One-sided ids use separate `not-ported` / `rsvelte-only` keys, so
the gate does not invent a comparable severity where one product has no rule; it still makes every
addition, port or removal surface as a two-sided ratchet change requiring a written reason.

**Gate 36 closes the other half, and the half it closed was not the rule set.** Gate 33 compares two
declared tables; `lint-severity.mjs` runs both tools under those tables and compares what they
**emit** — findings with severity in the key, and the process **exit code**. The rule-set half came
back confirmed: 0 severity divergences over 1,179 / 1,178 compared findings, so nothing about the
declared alignment was wrong. The exit code was a different answer: **64 of 1,365 patterns disagree**
— 59 where rsvelte's default preset surfaces a Svelte **compiler** diagnostic ESLint's permissive
parser cannot see (4 of which are rsvelte over-rejections, now tracked as compiler defects), 4 where
a rule `lint-universe.mjs` excludes as type-aware still reports at `error` upstream, and 1 from a
listed report divergence. The generalizable part: **an `EXCLUDE` entry removes a rule from a finding
comparison and cannot remove it from the process's exit status**, so a gate that only compares
findings has no view of what a switching user's CI actually does. Running upstream's *default*
preset also reached a rule no other gate enables, which throws on `<a href="…" rel>` and destroys
the file's whole report — a configuration nobody had ever driven was holding a live crash.

C8 is therefore closed as an unmeasured blind spot and open as a recorded one — read gates 33 and 36
for what those recordings still cannot see.

### C9. Every lint gate reads SARIF, so the output a human reads was never compared — **[D]**

`lint-verify.mjs`, `lint-adversarial.mjs`, `lint-env.mjs` and the fix/suggest/end gates all drive
`rsvelte-lint --format sarif` and parse `region.startLine` / `startColumn`. The default output — the
text a person sees in a terminal, and the `github-actions` annotations CI renders — is read by
nothing.

Measured consequence: `Position::column` is stored **zero-based** (the SARIF writer's own comment
says so and adds 1; the LSP conversion passes it through while subtracting 1 from the line). The
`machine` writer adds 1 on both axes, deliberately matched to upstream svelte-check's
`${start.line + 1}:${start.character + 1}`. `write_human` and `write_github_actions` printed
`r.start.column` raw, so **every column in the default CLI output and every CI annotation was one
short**: `{@html x}` at the first column of line 4 printed `4:0` where ESLint prints `4:1`. The
`github-actions` unit test asserted the wrong value, which is how it survived — the test encoded
the behaviour rather than the convention.

The general shape is worth more than the fix. **A gate that reads a machine format cannot see a bug
in the format a human reads**, and the two are different code paths in every tool that offers both.
The question to ask of any output-comparing gate is not only "what field does the key drop" but
"which *serializer* does the oracle exercise". Here four writers shared one `Range` and only the two
the gates consume were right.

`writers.rs`'s `user_facing_writers_agree_on_one_based_columns` now pins `human`,
`github-actions` and `machine` to one convention in a single assertion, so the three cannot drift
apart again. It is a unit test rather than a ratchet because there is no oracle to ratchet
against — ESLint has no `github-actions` formatter to compare byte-for-byte, and the claim being
defended ("all user-facing writers agree") is internal.

### C10. Finding ORDER is dropped by every lint gate — measured, and clean — **[D]**

Every lint gate builds a `Set` of finding keys per file, so the sequence a tool actually emits is
not compared anywhere. That is a real hole in principle: the order is what a person reads in the
terminal, and ESLint's `SourceCodeFixer` resolves overlapping fixes first-wins in emission order.

Measured rather than left open. Over the 978 adversarial patterns with two or more findings,
comparing the full ordered sequence: **both sides emit findings in non-decreasing position order on
every file (0 violations each), and 0 files differ in the order of their POSITIONS.** 73 files
differ only in which rule comes first among findings sharing one `line:column`.

That residue is benign and deliberately not gated. ESLint sorts messages by line then column with a
stable sort, so a tie preserves rule-execution order — a property of rule registration that upstream
neither documents nor holds stable across versions. Its one behavioural consequence, fix precedence
among overlapping fixes from *different* rules, is already excluded by design: `lint-adversarial-fix.mjs`
enables one rule at a time, because cross-rule fix scheduling is a property of ESLint's driver rather
than of any rule's port (gate 29).

Recorded here so the axis is not re-opened as an unknown. What would change the answer: a rule that
reports out of position order (would show as a non-zero violation count on the rsvelte side), or a
future fix gate that enables rules together.

### C11. Cross-file state in a batch lint — measured, and clean — **[D]**

`rsvelte-lint` lints many files in one process, and several rules memoise per-directory or
per-source state (`sveltekit::available`'s cache, the scope/JSON caches). No gate isolates a file:
every lint gate passes the whole population in one invocation, so a rule leaking state from one
file into the next would be baked into both the baseline and the comparison.

Measured over the 1,355 adversarial patterns, two ways: the same batch with the file list
**reversed** (0 files differ), and 80 sampled files linted **alone** versus their batch result
(0 differ).

Both controls are order- or context-sensitive by construction, which bounds what they can see:
leakage that is deterministic and identical regardless of position — a counter that always lands
on the same value, a cache that is always warm by the time it matters — produces no difference in
either. What they do exclude is the realistic shape, where the leak depends on which file ran
first. Recorded so the axis is not re-opened as an unknown.

### C12. The lint oracle's answer depended on a sibling `node_modules` — **[D]**

Second instance of the property gate 27 records for the LSP oracle: **the measurement is a
property of the installed tree, not only of the sources.** `eslint-plugin-svelte` transpiles a
`<style lang="scss">` block before deciding whether its selectors are used, and finds the
preprocessor with `loadModule`, which resolves from `context.cwd` and then from the linted file's
directory — both of which walk up to the repository root, never to the isolated oracle package
(its third fallback, the plugin's own `__filename`, is dead under ESM, so declaring `sass` as an
oracle dependency does **not** fix this — measured).

The corpus jobs never ran `pnpm install`, so CI had no root `node_modules` and blanked SCSS blocks,
while a developer's checkout transpiled them. One `lint-adversarial` entry
(`no-unused-svelte-ignore/10-style-scss-css-ignore.svelte`) diverged locally and passed on CI, and
because the ratchet is two-sided that surfaced as a *stale entry* — the failure mode that reads
like "someone forgot to re-baseline" rather than like an environment difference. Both directions
are now pinned: the CI job installs the root dependencies, and all four oracle entry points abort
with the resolution path named if `sass` does not resolve from the repository root
(`lint-oracle/preconditions.mjs`). The guard was exercised on both arms — every gate passes with
the dependency present and every gate exits 1 with the message when it is removed.

Ask this of any oracle that shells out to a real toolchain: **what did the checkout provide that
the sources did not?**

### C1. Path filters — gates that do not run on some PRs

`ci.yml` is deliberately unfiltered (`:6-8`, with the reason in a comment), so every Rust
fixture gate runs on every PR. `corpus-compat.yml` **is** path-filtered (`push:` `:39-85`,
`pull_request:` `:87-133`, kept in sync by hand).

- **[S] `submodules/eslint-plugin-svelte` and `submodules/svelte-eslint-parser` are consumed by
  `lint-parity` (`corpus-compat.yml:356`, `:380`) but appear nowhere in either paths list.**
  Positive control: `command grep -n "eslint" .github/workflows/corpus-compat.yml` returns 6
  hits, all at `:343` or later — zero inside `:39-133`. A PR whose only change is advancing that
  gitlink runs no corpus gate at all, and `lint-known-failures.json` is never re-validated
  against the new upstream rule set.
- **[S]** Also absent from the list but reachable by the jobs: `scripts/fixtures/**` (except one
  oxfmtrc), `package.json` (which `test-fmt-corpus` reads for pins, `ci.yml:549-550`),
  `apps/**`, `.github/actions/**`.
- **[S]** `type-aware-lint.yml:17-33` filters to the lint crates but omits
  `submodules/typescript-go`, which it drives — mitigated only by its weekly `schedule:` (`:36`).
- **[S]** `coverage.yml:6-7` and `codspeed.yml:6-7` use `pull_request: branches: [main]`, so a
  stacked PR based on another feature branch skips them — the exact failure mode `ci.yml:6-7`
  documents and guards against. `capi.yml:26` carries the comment `# Unfiltered: see ci.yml.`
  immediately above a `paths:` filter (`:27-33`).

### C2. Ratchet documentation coverage is declared, but the reasons are prose

`known-failures-md-check.mjs` now enumerates every `*known-failures*`, `*excluded*` and
`*not-comparable*` JSON on disk and fails if it is absent from `RATCHETS`. For every declaration
it checks each count written beside the JSON filename, and `PARTITIONS` makes deletion or
mis-summing of a declared cluster partition fail. This closes the former filename/count drift
hole, including for the LSP ratchet.

**[S] The checker never interprets a justification.** An accurate total beside a paragraph that
explains none of its entries passes. A cluster assignment is exhaustive only when somebody first
declares that partition in `PARTITIONS`; a new document with no partition line has no per-entry
reason check. The remaining contract is therefore reviewable prose, not a machine-checked mapping
from every ratchet key to a cause.

### C3. Population floors — who has one

| Gate | Floor | Cite |
|---|---|---|
| corpus verify | manifest ≥ 1000; ≥99% compiled; ≥12000 to rebaseline | `verify.mjs:204,224`; `artifacts.mjs:79` |
| esrap generated-output corpus | ≥12000 JavaScript outputs and ≥1 comment-bearing output in each tree × target | `esrap-verify.mjs` population loop and per-population `esrap_corpus` invocation |
| svelte2tsx verify | manifest ≥ 1000 components; ≥12000 to rebaseline | `svelte2tsx-verify.mjs:85,237` |
| fmt verify | `included` ≥ 1000 — **but not the comparisons performed** | `fmt-verify.mjs:69`; gap at `:97` |
| lint verify | manifest ≥ 1000; ≥99% with a source on disk; ≥6000 **and** repo set == `CI_REPOS` to rebaseline; ≥1 module compared; 0 unmeasured | `lint-verify.mjs:39,44,47,218-236`; **no universe floor** — gap at `:239` |
| sourcemaps gate | 3 floors (samples, anchors, identical outputs) | `sourcemaps_gate.rs:1011-1028` |
| fmt Rust corpus | non-empty samples + `assert!(!in_corpus_job())` on every skip | `svelte_dev_corpus.rs:71-74,262` |
| ast gate preconditions | input files > 1000 — **no output floor** | `ast_gate_preconditions.rs:57`; gap at `:90` |
| svelte2tsx fixtures | `total_tested >= 254`, absolute | `svelte2tsx_fixtures.rs:30,155` |
| **css-prune sweep** | **none** | `css-prune-sweep.mjs:482` is a `console.log` |
| check / check-e2e | scenarios > 0; **no diagnostic floor**, ratchets are `[]` | `check-verify.mjs:179`; gap at `:240` |
| LSP differential | exact per-repository files, identifiers and requests; eight stable-hash shard union + one fixture artifact required to rebaseline | `corpus-population.json`; `artifacts.mjs`; `verify.mjs` postconditions |

### C7. An uninitialised corpus source shrinks the population silently, and no floor catches it

**[D]** `collect.mjs:168-178` walks `corpus-sources.json` and, for a source whose directory is
missing or empty, warns and `continue`s. Only `src.required` sources abort (`:171-174`) — and
**2 of 36 sources are required**, so 34 can each disappear from the measured population while
`collect.mjs` exits 0 and writes a manifest that looks complete.

Observed, not hypothetical: a sweep run with `runed` and `svelte-toolbelt` uninitialised
measured **14,035** entries instead of 14,138, and **10 baseline entries came from those two
sources**. `--update-baseline` deletes every baseline id it did not measure, so those ten would
have been dropped as fixed.

The floor does not help. `MIN_FULL_CORPUS_ENTRIES = 12000` (`artifacts.mjs:87`) guards against
*catastrophic* under-measurement; 14,035 clears it comfortably. A partial corpus is invisible to
a lower bound **by construction** — the only thing that surfaced it was comparing the local
manifest count against CI's.

This sits upstream of blind spot 20c's reason 2 and applies to every corpus-derived gate (1, 2-3,
4, 19, 20), not only the mutation fuzz. Closing it means asserting the *set* of collected
sources against `corpus-sources.json`, not the entry count — an entry count cannot distinguish a
missing source from a source that shrank.

### C4. Gate scripts that no workflow invokes

`git ls-files scripts/compat-corpus` lists 26 `.mjs` files; 15 are referenced by a workflow. The
other 11 are all libraries imported by an invoked gate (`normalize.mjs`, `targets.mjs`,
`artifacts.mjs`, `sourcemap.mjs`, `lint-universe.mjs`, `check-diagnostics.mjs`,
`matrix/{axes,generate,mutate}.mjs`, `lint-oracle/run.mjs`) or self-declared triage CLIs
(`one.mjs`, `fmt-one.mjs`, `fmt-cluster.mjs`, `svelte2tsx-cluster.mjs`, `clean.mjs`).
**There is no orphaned gate script.** The orphan risk in this repo is C1 and C2, not C4.

### C4a. A failing step skips the comparisons after it, and a skipped step reads as a passing one — **[D]**

Run `33356085475`: `Mutation fuzz parity` failed and the next step,
`Verify CSS-prune sweep (no new divergences)`, was reported `skipped` — so the css-prune
ratchet was not measured on that run at all, while the job view shows it as green-adjacent.
That is the [cancelled-run](#a-named-blind-spot-class-the-vacuous-green) hazard one level down:
`skipped` and `success` are both "not a failure".

Guards were added where they cannot misattribute — the `corpus` job's four unguarded
verification steps, `lint-parity`'s ten sequential ratchets, `shape-matrix`'s two, and the
three `ci.yml` jobs whose steps are pure `node scripts/…` checks. **Three `ci.yml` jobs are
deliberately left masked** and are the standing hole this row records: `language-server`
(12 checks interleaved with `Build rsvelte-check` and the extension bundle),
`test-fmt-corpus` (7, interleaved with the oracle corpus generation) and `vps-shim` (4,
after a native build). Guarding those trades a hidden failure for a misattributed one — a test
whose build was skipped fails for the wrong reason — so each needs the producer steps guarded
too, or a `steps.<id>.conclusion` predicate, which none of them has today.

**The control is stated rather than assumed**: on the next Corpus Compat run, if the mutation
fuzz fails again, `Verify CSS-prune sweep` must report something other than `skipped`. Until
that run, this row's fix is asserted, not measured.

### C4b. `comment-slot` cannot inject into a template expression — **[D]**

`matrix/mutate.mjs`'s `insertionSlots()` restricts every insertion to the byte ranges
`scriptRanges()` returns — a component's `<script>` bodies, or the whole file for a module.
A template line is in no range, so **the family has never once put a comment inside a template
expression**, and the shape is not reachable by adding seeds: the restriction is in the slot
scanner, not in the seed set.

Measured on the corpus at `4a07d06be` (32,620 components, client): 30,612 files agree
completely, **232 have their comments in the wrong place** and 698 differ in set; the server
loses comments in 389 files through one mechanism. The `comment-slot` family was green
throughout.

Two things this row is really about. **A multiset comparison and an order comparison are both
blind to placement**: a lone comment that moves leaves the sequence identical, so `order-only`
measured 4 while keying on the preceding code token measured 232 — the comparison key was the
whole finding. And **a seed added to a family with an inert scanner measures nothing while
printing a green verdict**: a run of 688 cases / 2,752 comparisons came back
`js-mismatch 0` on a staged binding that predated the fixes under test, and only
`ls -la` + `cmp` separated "green" from "never executed".

Extending `insertionSlots` to template regions is the fix and it is deferred, not rejected:
`matrix-known-failures.json` is at **0**, so exposing the class takes a shrink-only ratchet
above zero, which the DoD requires to be empty, attributed or deliberate. The order is fix the
class, then widen the scanner.

### C5. `compatibility/pattern-corpus` records history; it cannot surface a live bug

102 tracked files: ~32 hand-written `issues/<n>-<slug>.svelte` repros plus feature matrices. It
is a corpus *source* (`corpus-sources.json:37`, `required: true`), so it flows into the compiler,
svelte2tsx and formatter parity gates. It does **not** flow into the lint gate (C1 / blind spot
11f) or the shape matrix (which generates its own inputs). And by its own convention
(`pattern-corpus/README.md`, rule 6) "a repro lands with its fix, not before" — so an open
divergence is by policy absent.

### C6. Every performance gate measures a population where legacy `$:` is absent or a minority

The correctness gates above sample published *library* code. So do the performance gates, and
for performance that is the wrong population by a factor of 5.6 — or 4.0, depending on which
side carbon is counted on; see the note under the table.

**[D] Legacy `$:` density, by the two populations we own.** A file counts as legacy if any line's
first non-whitespace token is `$:` (`^[ \t]*\$:`, multiline). Stated because it is a heuristic:
it counts a `$:` nested inside a block, and misses one written after `{` on the same line.

| population | files | legacy files | bytes | **legacy bytes** |
|---|---|---|---|---|
| libraries — `submodules/`, 23 repos | 13,078 | 478 (3.65%) | 15,098,016 | **12.34%** |
| applications — huly/plugins | 2,123 | 1,252 (58.97%) | 7,124,519 | **74.87%** |
| applications — open-webui | 650 | 215 (33.08%) | 3,612,860 | **70.26%** |
| applications — carbon (`src/` only) | 287 | 173 (60.28%) | 941,662 | **87.90%** |
| applications — SMUI | 449 | **0 (0.00%)** | 951,109 | **0.00%** |
| **applications, aggregate** | **3,509** | **1,640 (46.74%)** | **12,630,150** | **68.89%** |

The carbon row is `src/` only. The repo holds **1,324** `.svelte` files — 525 under `tests/`,
425 under `docs/`, 291 under `src/`, 78 under `e2e/` — and scored whole it is 250/1,324
(18.9%) rather than 60.3%. The scope is deliberate (`tests/` and `docs/` are not field compile
volume) but it moves that row by 3.2x, so it is stated rather than left to be re-derived.

carbon is also a **component library** published to npm, counted on the application side
because its `src/` is hand-written Svelte rather than a shipped bundle. That placement is what
sets the ratio: moving it to the library population gives libraries 16.78% and applications
67.36%, i.e. **4.0x instead of 5.6x**. The finding survives the reclassification and the
headline number does not, so both are recorded.

Legacy files are 3.7x larger than the rest in the library corpus and 2.5x larger in the
application corpus, so **files and bytes disagree by ~3x and bytes is the closer weight** for
anything that scales with script content. Published libraries also frequently ship
pre-compiled, so application source is the better proxy for real compile volume.

The per-repo rows are **bimodal** — 0% or ≥33%, nothing in between. A corpus is not
"partly legacy"; each repo is one thing or the other, so an aggregate over a
library-weighted sample does not interpolate to an application.

**What this under-weights — and a stale number to stop repeating.** The bench corpus is widely
described as "8 of 9 runes", including in `benches/corpus/README.md`'s own distribution table,
which compares fixtures **01–09** against shipped code. That is out of date: fixtures 10 and 11
were added specifically to close that gap, and the corpus is now 11 files. Measured directly
(`command grep -lE '^[[:space:]]*\$:' benches/corpus/*.svelte`):

| corpus | legacy by files | legacy by bytes |
|---|---|---|
| bench fixtures (01–11) | 3/11 (27.3%) | 9,195 / 24,385 (**37.7%**) |
| libraries (`submodules/`) | 3.65% | **12.34%** |
| applications | 46.74% | **68.89%** |

So the timing gates are **under-weighted by ~1.8x against applications, not blind** — 05, 10
and 11 carry `$:`. The library corpus, at 5.6x under, is the badly-aimed one. Anyone reasoning
from "8 of 9 runes" will conclude the timing gates cannot see a legacy change at all; they can,
at roughly half the weight real application code would give it.

That makes such a change **falsifiable on CodSpeed rather than invisible to it**, which is the
stronger position: a legacy-path improvement should move the per-file IDs for `05-legacy-reactive`,
`10-legacy-typescript-props` and `11-store-heavy-legacy`, move `compile_both` by roughly the
legacy share, and move the eight runes fixtures by ~0. A uniform result across all eleven is
evidence *against* the change, not an artifact of the corpus.

The converse still holds for the library-weighted gates: **a regression in this path reads flat
on anything sampling `submodules/`**. The gate that sees it independently of corpus weighting is
the differential `to_value` counter added with #2622 (`2_analyze/mod.rs`,
`legacy_reactive_stays_typed`), which is deterministic and needs no quiet machine.

**Negative control, from two unrelated routes.** SMUI is 0.00% legacy by the source regex
above, and independently makes **0** `to_value` calls at the legacy-`$:` producer as counted by
the compiler instrumentation. Two mechanisms sharing no assumption agreeing on an exact zero is
what distinguishes this row from a heuristic that merely found no matches — the regex is
capable of returning a real zero, and did, on the one corpus where the compiler agrees.

**[D] The population difference is expensive — measured on a different path.** A sibling
investigation timed `process_accumulated` (`3_transform/profile.rs:115` — the part of the Phase-3
client line loop that transforms completed statements) across the same corpora:

| corpus | `process_accumulated` share |
|---|---|
| carbon | 30.2% |
| open-webui | 25.7% |
| huly/plugins | 22.5% |
| **applications, aggregate** | **22.8%** |
| **SMUI (negative control)** | **2.1%** |

SMUI sits with the runes libraries rather than with its fellow applications — a 10.9x split on
the same axis this row is about, from an instrument unrelated to the object counters above. This
is what establishes that sampling the library end is *costly*, not merely unrepresentative.

Two caveats, so the number is not over-read. `process_accumulated` spans **both** the rune and
the legacy `$:` statement transforms (`compile_profile.rs:276` takes its residual against
`st.runes` and `st.reactive_stmt`), so the SMUI/application split is *consistent with* the
legacy branch dominating it but does not prove the whole 22.8% is legacy. And it is a **Phase-3
script-text** path, not the Phase-2 JSON serialization the object counts above measure — the two
are adjacent consequences of the same source population, not the same work.

**What is *not* established here [U].** (a) The share of compile time attributable to the
Phase-2 legacy `$:` path specifically: two instruments tried and neither produced a defensible
number (`docs/phase3-ast-refactor-plan.md` § Findings 2026-08-08). (b) The legacy-vs-runes
decomposition of the 22.8% above, which `st.reactive_stmt` could settle directly. (c) Whether
four repositories represent application Svelte generally — the densities are 33-88%, so the
*direction* is not in doubt, but the aggregate is four samples.

---

## Predicates — cheap questions that find these without reading a gate end to end

Reading a gate line by line is how most rows here were produced, and it does not scale. These
two questions are mechanical, and each has already found real defects. Run them when you touch
this file; they are far cheaper than a full read and they convert `[S]` rows into `[D]` rows,
because a population you can empty is usually a population you can demonstrate.

### P0 — Is the verdict you are reading actually the check's verdict?

Apply this before the other two, because it invalidates them. Every gate in this file ultimately
reports a **verdict**, and a verdict can be corrupted by the plumbing carrying it while still
looking exactly like a pass. Four instances turned up in one day of work on this document, two
of which corrupted a verdict rather than merely truncating output:

| mode | what it looks like | the tell |
|---|---|---|
| **masked exit code** | `cmd \| tail -5` reports the *pipe's* status, not `cmd`'s — always 0 | read the command's own output for its failure text, or use `PIPESTATUS` / drop the pipe |
| **truncated output** | `\| head -8` shows a clean prefix of a failing run | a cap has no error condition, so "nothing bad in the first N" is not "nothing bad" — state the denominator |
| **`grep` dropping input** | the repo's `grep` wraps `ugrep -I`, which discards binary-looking stdin, so `git show <rev>:<f> \| grep <s>` finds nothing for strings that are present | use `command grep` when piping, and pair every negative claim with a positive control |
| **stale artifact** | a gate passes against a binary or tree built before the change | rebuild, or assert a freshness token (`ensure_fixtures_fresh`, `common/mod.rs:124-137`, is the model) |

Worked instance, from this document's own work: `cargo clippy … | tail -5` reported **exit 0**
while clippy had actually died on `signal: 15` (a disk-guard kill). The 0 was `tail`'s. It was
caught only by reading the full output file — and it happened inside the PR fixing a
silent-success bug. **A masked exit code and a passing check are indistinguishable at the point
of use**, which is the same property that makes every row in this document worth writing down.

### P1 — Does the guard count the same collection the comparison loop consumes?

Name the collection the floor measures and the collection the loop iterates, and check they are
the same object. Where they differ, the guard is satisfied by a population the comparison never
sees.

| gate | guard measures | loop consumes | same? |
|---|---|---|---|
| corpus `verify.mjs` | `manifest` ≥1000 (`:205`) **and** ≥99% with outputs (`:224`) | `manifest` (`:284`,`:318`) | **yes** — and `hasOutputs` explicitly bridges manifest→tree |
| `svelte2tsx-verify.mjs` | component `manifest` ≥1000 (`:86`) | `manifest` (`:102`,`:162`), plus a per-entry presence check (`:176`) | **yes** — an absent tree scores `missing`, not `match` |
| `check-verify.mjs` | scenarios > 0 (`:179`) | scenarios | **yes** (its blind spot is elsewhere: no diagnostic floor) |
| **`fmt-verify.mjs`** | `included.length` from `fmt/meta.json` (`:69`) | files read from `fmt/oracle/` (`:95`), `continue` when absent (`:97`) | **NO** → #2447 |
| **`css-prune-sweep.mjs`** | *nothing* (`:482` is a `console.log`) | generated `cases` | **NO** → #2445 |
| `lint-verify.mjs` | manifest ≥1000 (`:104`), ≥99% with a source (`:114`), ≥6000 to rewrite (`:219`) | the same `entries` array (`:264`), which also builds the oracle's file list (`:238`) | **yes, since #2520/#2448** — rsvelte is still pointed at the whole `SOURCES` dir (`:158`), so a finding on a file outside `entries` now aborts (`:199-206`) rather than being dropped |
| **`ast_gate_preconditions.rs`** | `files.len() > 1000` on *discovered inputs* (`:57`) | only successfully-**compiled** files (`continue` at `:90`) | **NO** → blind spot 15a; the difference is unmeasured |
| **`matrix/run.mjs`** | *nothing* — `cases.length` is printed at `:84`, never asserted | generated `cases` | **NO** — same shape as #2445 |
| `svelte2tsx_fixtures.rs` | `total_tested >= 254` (`:155`), derived from the loop itself | same | **yes** |

**4 of 9 fail** (5 when this predicate was first applied; `lint-verify.mjs` was fixed by
#2520/#2448), two of which (`matrix/run.mjs`, and the `lint-verify.mjs` framing) this predicate
found rather than a full read.

**Companion tell, and it *is* greppable: asymmetric handling of symmetric inputs.** In
`fmt-verify.mjs`, `oracle === null` is skipped silently (`:97`) and `actual === null` fails
loudly (`:98-101`) — two lines apart. Two sides of one comparison should fail the same way;
when they do not, one of them was written while thinking about a different question.

### P2 — Does the script accept a subset selector *and* a baseline-writing flag, and refuse the combination?

`--update-baseline` rewrites the ratchet from what the run measured, so combining it with a
selector deletes every entry outside the selection. Two greps, binary answer.

Denominator: **1087 tracked `.mjs`/`.rs` files scanned; 5 accept both.**

| script | selector | writer | refuses? |
|---|---|---|---|
| `check-verify.mjs` | `--scenario` | `--update` | **yes** — `:100` `if (UPDATE && ONLY) fail('--update cannot be combined with --scenario')` |
| `check-e2e-verify.mjs` | `--project` | `--update` | **yes** — `:115`, same shape |
| **`matrix/run.mjs`** | `--families`, `--targets` | `--update-baseline` | **PARTIAL — 2 of 3 axes.** Refuses `--no-fmt` (`:184`) and the `--families` subset (`:188-189`, naming FALSE-SHRINK explicitly). Does **not** refuse `--targets` |
| `verify.mjs` | `--targets` | `--update-baseline` | **scopes instead of refusing** — `UPDATE_SCOPE` (`:104-112`, `:182`) writes only the measured targets, plus `requireFullCorpus` (`:164-172`). A valid alternative |
| **`css-prune-sweep.mjs`** | `--filter` (`:52`, applied `:324`) | `--update-baseline` (`:57`, `:476`) | **NO** — the write is unguarded |

**[D] The predicate has a blind spot of its own, and #2520 is it.** `lint-verify.mjs` is not in
the table because it accepts no selector — argv reads are `--update` and `--show` and nothing
else. Its population is narrowed *outside the script*, by which repos `lint-collect.mjs` was
given (7 of the 9 it offers), and `--update` then rewrote from whatever that produced. **A grep
for "selector flag + writer flag" cannot see a gate whose selector is a separate command.** The
fix is therefore a floor on the measured population plus an exact repo-set check
(`lint-verify.mjs:218-236`), not a refused flag combination.

**Corrected count: 2 unguarded holes of 5, not 1.** An earlier revision of this table scored
`matrix/run.mjs` as guarded because it refuses *something*. It refuses `--families`; `--targets`
narrows the same population and is not refused. `ids` (`:180`) is built only from the selected
`TARGETS` (`:52`), and `:193` then writes the **whole** baseline from it — so
`--targets client --update-baseline` deletes every `server` and `client-dev` entry. **[D]**
Observed by another agent against a redirected output path: **350 entries → 50, 300 deleted
(86%), exit 0.**

### Why this one is the argument for a shared helper

Not the count — two of five is weak evidence on frequency. The mechanism is the evidence, and
`matrix/run.mjs` proves it inside a single file:

- the **write** path (`:182-196`) narrows on families only;
- the **compare** path (`:203-208`), fifteen lines below, narrows on
  `measuredFamilies.has(family) && measuredTargets.has(target)` — **both** axes;
- and the comment introducing it (`:200`) says *"Only entries in the families this run
  measured"*, naming one axis while the code beneath it handles two.

The author was not unaware that `--targets` narrows the measured set; they wrote
`measuredTargets` at `:202` and used it at `:207`. The knowledge was present in the file and did
not reach the guard fifteen lines up. Compare the population across the repo:
`mutate-corpus.mjs` refuses all four of its axes, `matrix/run.mjs` 2 of 3, `verify.mjs` 0 of 1
(it scopes instead). These are **incomplete copies of one rule, each missing the axis its author
happened not to be holding in mind** — which is a failure mode education cannot reach, because
the person already knows the rule. A structure that makes the write path consume the same
narrowing set the compare path uses can; a reminder cannot.

**The trap in the loose version of this check** — and it is the same shape as the
misclassification above. Grepping `refus|exit\(2\)` reports `css-prune-sweep.mjs` as guarded,
because those tokens occur elsewhere in the file; it also reports `matrix/run.mjs` as guarded,
because it genuinely refuses a *different* axis. The proxy answers *"does this file contain
refusal machinery"* when the question is *"does it refuse **this**"*. The predicate is only
meaningful when the refusal's **condition references the selector variable in question** — per
axis, not per file.

### P3 — Did the gate reach its comparison, or did it die before it?

A red check reads as a verdict about the thing the gate measures. It is only that if the gate got
as far as comparing something. A gate whose **setup** step fails — a build, a submodule checkout,
an install, an oracle launch — produces a red that carries no information about parity at all, and
that red is indistinguishable from a parity failure in the branch header, in `gh pr checks`, and
in the check's own name.

Measured instance (2026-08-31, on #3967's head `7980cdf40`): `SCSS parity (grass vs dart-sass)`
was red. The name says an SCSS divergence. The job actually died at the step
**`Build the grass side of the gate`** with

```
error[E0609]: no field `declaration` on type `&ArenaBox<'_, oxc_ast::ast::ExportNamedDeclaration<'_>>`
  --> crates/rsvelte_core/src/compiler/phases/1_parse/read/early_errors.rs:220:52
```

— **zero SCSS blocks were compared**, and the file that broke the gate has nothing to do with
SCSS. This is the sharp form of the row: the red was caused by a change the gate does not measure,
in a crate the gate only links.

The same property holds one level up, structurally, for every rollup job. `Tests` is a
conjunction: its `Verify all test jobs passed` step reads each shard's `result` and exits 1 unless
every one is `success`, so its conclusion names no conjunct — `AGENTS.md` already records the
cancellation form of this (a cancelled shard makes the rollup `FAILURE` while every shard under it
is `cancelled`). A red rollup and a red gate therefore need the same follow-up question, and it is
not "which gate is red".

The hazard is not that these gates failed closed; they did. It is that a red nobody can attribute
becomes "pre-existing" during triage, and a gate expected to be red stops being read. From that
point it defends nothing — and because a shrink-only ratchet is consulted only when its job runs,
its file keeps looking healthy for as long as the build stays broken.

Before treating a red as known, print the failing **step**, not the job:

```
gh api repos/:owner/:repo/actions/jobs/<job-id> \
  --jq '.steps[] | select(.conclusion=="failure") | .name'
```

If that step is upstream of the comparison, record "**contributed 0 comparisons**" rather than
"known failure". That is C7 (an uninitialised corpus source shrinks the population silently) asked
one level up: there the population goes to zero and the gate stays green; here the population goes
to zero and the gate stays red. **Both report a number that was never measured** — and only one of
them looks alarming, which is why this one survives longer.

Evidence: **[D]** for the SCSS instance — step name, error code and source location read off
`actions/jobs/98756280254`. **[D]** for the rollup's mechanism (its failing step is
`Verify all test jobs passed`, read off `actions/jobs/98757702663`), but **not** for masking on
that SHA: all seven of its inputs were red there, so it is cited as structure, not as an instance.
The triage claim is **[S]** — an argument from the mechanism, not a measurement of reviewer
behaviour.

## Every performance gate we own points at the runes end of the population

**This is a gate-coverage finding, not a perf finding.** The output-equality gates above are
scoped by *what they compare*; the performance gates are scoped by *what population they
compile*, and that scoping has never been written down. Measured 2026-08-08:

| population | legacy by files | legacy by bytes |
|---|---|---|
| CodSpeed benchmark fixtures | — | **8 of 9 are runes** |
| library corpus (`submodules/`, 23 repos) | 3.65% | **12.34%** |
| **application source** (huly / open-webui / carbon / SMUI) | **46.74%** | **68.89%** |

Per application repo: huly 74.9%, open-webui 70.3%, carbon 87.9%, SMUI 0.00%.

The cost of the instance-script text machinery is a property of that split, not a constant.
`process_accumulated` as a share of **total compile**, measured per repo:

| repo | population | `$:` stmts | process_accum | line_scan |
|---|---|---|---|---|
| shadcn-svelte / bits-ui / skeleton / layerchart | library, runes | 0 | **1.0–1.7%** | 0.8–1.3% |
| **SMUI** | application, **0.00% legacy** | **0** | **2.1%** | 1.7% |
| svelte-heroicons | library, `export let`-only | 1 | 12.1% | 1.8% |
| smelte / sveltestrap / svelte-ux | library, legacy | 97–196 | 16.1–26.6% | 0.8–1.4% |
| **huly** | application | 3312 | **22.5%** | 1.2% |
| **open-webui** | application | 577 | **25.7%** | 1.1% |
| **carbon** | application | 765 | **30.2%** | 1.5% |

**So the gates are aimed at the 1–2% end of a 1–30% range**, and the population that determines
real compile volume sits at the other end. A change that removes most of `process_accumulated`
would read as **flat on CodSpeed and nearly flat on the library corpus**, while being worth
~22–30% on application source. The reverse also holds: a regression confined to the legacy path
is invisible to every perf gate we run.

**SMUI is the load-bearing control here.** It is application source and it is 0.00% legacy by a
source-level marker; its `process_accum` is 2.1%, sitting with the runes libraries rather than
with the other three applications. Marker and timer agree, so the split above is tracking the
legacy/runes axis and not merely "applications are different from libraries".

**What is still unmeasured `[U]`:** whether the four application repos are representative of
application Svelte generally. They were chosen because prior work already cited them, which is a
selection this document cannot justify. Aggregating them gives **22.8%**, but huly alone is
**55.8% of that corpus's compile time**, so the aggregate is a statement about how the corpus was
assembled. (Excluding huly moves it only to 23.3%, so the aggregate is at least not fragile to
that one repo — but four repos is four repos.)

### The perf gates also compile with a different **option set** than shipping code

The population axis above is *which files*; this is *which `CompileOptions`*. Measured
2026-08-18: `benchmark_runner` sets `enable_sourcemap: false` (`crates/rsvelte_devtools/src/bin/benchmark_runner.rs:152,162`)
while `CompileOptions::default()` sets it **true** (`crates/rsvelte_core/src/compiler/mod.rs:322`),
which is what the NAPI/vite path gets. Everything gated on that flag is therefore compiled by
shipping users and by no benchmark we run.

**Discriminating case:** #3028 moved the client source map onto spans, which made
`copied_spans_for_normalized_code` run for every script instead of only a TypeScript one, and
put a 16-byte field on `JsBlockStatement` — a struct inside every statement and expression, so
`JsStatement` grew 192 → 208 bytes and `JsExpr` 184 → 200. Requested allocation bytes over
flowbite-svelte rose **2.47%** against `main`. CodSpeed's report on that same commit: *"Merging
this PR will not alter performance"*, 11 untouched benchmarks. Not a wrong measurement — a
measurement of a configuration in which the changed code does not execute.

**What is still unmeasured `[U]`:** the rest of the flag surface. `dev` is covered
(`--dev` exists), but `hmr`, `css`, `discloseVersion` and the `runes` override are set by
callers and pinned by the runner, and no one has enumerated which of them gate work.

## 41. Signal discipline — `scripts/compat-corpus/signal-discipline-verify.mjs`

**Unit.** One `(corpus entry, client mode)` compile, 34,728 x 2 of them. Like §37, nothing is
compared against official: the gate asserts a **property of the generated program**. Every
`$.set` / `$.get` / `$.mutate` / `$.update` / `$.update_pre` / `$.increment` must take a first
argument the same program did not declare as an ordinary value, and every `name(<assignment>,
true)` prop write must have a callee initialised from `$.prop` / `$.rest_props`. Violations are
printed, never panicked — release is `panic = "abort"`. Implemented in
`3_transform/client/signal_discipline.rs`, run by the `Signal discipline` step of
`corpus-compat.yml` (and `pnpm run corpus:signal-discipline`). Hard gate, no ratchet.

The harness refuses a verdict three ways, because each failure mode reads exactly like a pass:
without `RSVELTE_ASSERT_SIGNAL_DISCIPLINE` it exits 2 rather than sweeping a compiler that cannot
report; below 1000 manifest components it exits 2; and without the compiler's own
`RSVELTE_SIGNAL_DISCIPLINE_ARMED` line it exits 2, because a binding predating the check prints
nothing at all.

**Why it exists.** `two-ports-inventory.md` row 21: upstream resolves a write target once through
`scope.get`, and 32 of rsvelte's 44 `*_ast.rs` passes compare identifier *text* against a
`Vec<String>`, so each one answers the shadow question separately. Output equality only finds
such a pass where a collected file happens to carry the shape *and* the file diverges on nothing
else — and the live instance this gate found,
`sparrow-app/…/TeamSidePanel.svelte`, is a listed entry on all three output ratchets for two
unrelated divergences, so no output gate could have reported it.

**[D] and positive control.** Ablating the five shadow guards in
`{state_member_mutate,state_set_reactive,reactive_update,prop_member_mutate}_ast.rs` and
recompiling this row's two repros reports all six wrong writes; restoring them (and `touch`ing the
files, or cargo serves a stale binary) reports none. That control is not decoration — **the first
formulation of this property passed the ablation while reporting nothing**, because it skipped
every function parameter as unknown provenance and the defect's own container is a parameter.

| tree | violations |
|---|---|
| guards ablated, 2 repro files | 6 |
| `try_transform_assignment`'s bail ablated, 67,612 corpus units | 2 (1 unit, exit 1) |
| this tree, 67,612 corpus units | 0 (exit 0) |

The middle row is the harness's own positive control: restoring the guard and `touch`ing the file
(cargo will otherwise serve a stale binary and the green reads as a pass) returns the run to 0 with
the source byte-identical.

**What it cannot see `[S]`.**

- **The read side.** A read has no sink. In the same handler as the fixed write,
  `items.selected = data` emitted `items(items().selected = data(), true)` where official emits
  `data`, because the RHS is transformed eagerly with an empty `LocalScope`. That instance is
  fixed; the class is still structurally outside this gate, and it was found by reading the write
  fix rather than by running the gate.
- **Server output.** The check runs at the two `client/mod.rs` codegen return sites only, so the
  server's own ports of the same passes are ungated by it. That is a discriminating case, not an
  argument: `server/ast/read_wrap.rs` never collected a `catch` clause or a loop head into its
  shadow frame, so `catch (v) { v.n = 2 }` emitted `v().n = 2` and `for (let v = 0; v < 2; v++)`
  emitted `for (let v = 0; v() < 2; $.update_derived(v))` — a runtime helper called on a loop
  counter — while this gate was green on the identical sources, whose client output was correct.
- **A `const`, and a non-literal initialiser.** Both are excluded because upstream's own output
  contains them (`const st = 1` beside `$.set(st, …)` in a generated accessor; `let i = $$index_4`
  receiving a signal through a parameter). A defect that lands on either shape is invisible here.
- **A parameter of a function passed directly to a runtime helper**, for the same reason: an
  each-block item and index really are signals.
- **Everything a name-keyed pass gets wrong that is not a signal write.** The property is about
  two kinds of call, not about the 32 passes; a pass that mis-claims an identifier in a read, a
  declaration or a hoist produces no violation.

**What is unmeasured `[U]`.** Whether the two rules above are the only exclusions upstream's
output forces. They were derived from the 9 violations the first corpus run produced, which is a
sample of one tree's output, not an enumeration of the shapes upstream emits.

## 42. Deliberate-divergence pinning — `scripts/dev/deliberate-divergences-check.mjs`

**Unit.** One section of the `deliberate-divergences` anchor, 25 of them. The document was
consolidated into `compatibility/GATES.md`, so `locate()` falls back to that anchor and the
heading it parses is `### `; `compatibility/deliberate-divergences.md` no longer exists. The check is
that each names at least one repository path that (a) exists on disk and (b) is a test — under a
`tests/` directory, in `compatibility/pattern-corpus/`, or a `scripts/**/test-*.mjs` harness.
Run by `ci.yml`'s `Corpus verify baseline-flag contract` job and `pnpm run
test:deliberate-divergences`; it reads only the document and the filesystem, so it needs no
corpus, no submodules and no build. Hard gate, no ratchet.

**Why it exists.** A recorded deliberate divergence is a decision *not* to close a difference, and
`known-failures-md-check.mjs` (C2) never interprets a justification — so until this, a section
could describe behaviour nothing re-checks, and a later refactor would change the behaviour while
the document went on asserting the old one. Ratchet entries are attributed *to* this document, so
an unpinned section makes every entry attributed to it unverifiable too.

**[D] and positive control.** Replacing one section's `**Pinned by** …` citation with prose makes
the check exit 1 naming that section and its line; restoring it leaves `git diff` empty and the
check green at 11/11. Its first real run also found the boundary the checker itself had wrong: the
section pinned by `scripts/dev/test-lint-severity-exit-attribution.mjs` was reported as unpinned,
because the first pin predicate demanded a `tests/` directory. **A derived classifier needs its own
control** — the shape had to be read off the tree, not assumed.

**[S] What it does not look at.** Three things, all of them the same shape as C2's. It never runs
the pin, so a test that no longer exercises the divergence — or one whose assertion was weakened to
whatever the code now does — passes. It never checks that the pin is *about* the section: any
existing test path in the section's body satisfies it, including one cited as background. And it
has no view of the reverse direction, a divergence that is real and **not** recorded here at all;
that population is bounded only by the ratchets whose `.md` attributes entries to this document,
and today only 6 of 31 ratchet docs make any such attribution.

**A fourth, and it is not reachable from the gate's own code.** The three above fall out of
reading `test-deliberate-divergences.mjs`; this one only appears when a section's claim is put
beside the product. A recorded divergence asserts *we choose not to close this difference* — it
does not assert *we do not have this*. `settings.rs` reads `completions.emmet` and defaults it to
`true`, and **no code outside `settings.rs` reads that field**, so filing the emmet cluster as
deliberate and pinning it would freeze a contradiction: the product declares a feature on and
nothing implements it. The honest terminal states are the feature itself or an explicit decision
to make the setting truthful; until one of them, the entries stay listed and are described as
unimplemented. A blind-spot row whose evidence is only ever *structural argument from code* may
be reporting that its author never looked outside the gate — the reading that produced this one
was a positive-controlled count of readers, not an argument about the checker.

Measured on `origin/main` (`fd72d98f1`), 6 of the 15 non-empty ratchets carry no `Attribution
of …` table at all: `lsp-known-failures.json` 23,746, `fmt-known-failures.json` 549,
`parse-ast-known-failures.json` 301, `known-failures.client-dev.json` 40,
`known-failures.client.json` 26, `svelte2tsx-unparseable-known-failures.json` 1 — **24,663
unattributed against 423 attributed**. The ~20 ratchets absent from both columns are empty.
Read those `n` in the ratchet's own key units and not as defects: `lsp-known-failures.json`
alone carries two conversions, `aggregate:` at 5.96 entries per diverging file and
`differential:`/`expected:` at 1.87 per (unit, method, phase).

Those six numbers are a measurement of `fd72d98f1` and nothing re-derives them, so read the
live answer out of gate 43 below rather than out of this paragraph — it is the artifact that
owns the question, and `compatibility/attribution-pending.json` is the list in machine-readable
form. On `5dc32eac2` it is **five** ratchets and 24,606 entries (`lsp` 23,746, `fmt` 524,
`parse-ast` 301, `client-dev` 24, `client` 11); `svelte2tsx-unparseable-known-failures.json`
reached 0 and left the column, which is the terminal state this document keeps having to
describe in prose.

## 43. Attribution of ratchet entries — `scripts/ci/attribution-check.mjs`

**Unit.** One ratchet JSON, and inside it one row of the `Attribution of \`<file>\`:` table that
names it. Every ratchet with entries must carry exactly one block; the block's `n` column must sum
to the JSON's length; each row must cite either a path under `upstream_issues/` that exists on disk
or the literal `deliberate-divergences` (which gate 42 separately holds to naming a test). An empty
ratchet must carry no block, and a block naming a file that is not a ratchet fails. Two modes:
the default is the DoD and stays red while `compatibility/attribution-pending.json` is non-empty;
`--gate-known` — the one CI runs — drops **exactly one question**, "is this ratchet's attribution
finished yet", for the ratchets that file names: it exempts a missing block and a table that covers
only some of the entries, and nothing else. A table claiming MORE entries than the ratchet holds is
never exempt — that is the shape that shipped through #4191 — and a pending ratchet whose table
becomes complete must leave the list in the same change. Hard gate, no ratchet of its own. `pnpm run
check:attribution` / `check:attribution-known`, and 19 controls under `pnpm run
test:attribution-check`.

The partial exemption is not slack, it is the middle state made legal. The first cluster of a
23,746-entry ratchet is filed long before the last, and requiring a complete table before any row
could be written would make a partial table *worse* than no table — which is exactly backwards for
a document whose purpose is to record where each entry is answered.

**Why it exists, and why the pending list is not a fourth end state.** Three end states are
allowed for a listed entry — it is gone, it is attributed to a filed upstream report, or it is
attributed to a deliberate divergence — and an entry that is rsvelte's own unfixed defect has only
the first. The pending list records that a ratchet has not been *placed* in one of the three, which
is why the default mode keeps failing on it; measured on `5dc32eac2`, 24,606 entries across five
ratchets sit there, and the self-compare control inside gate 39 (`0 keys from 28,178 self-compared
pairs`) is what says 301 of them have no upstream target to name. Writing a table for those would
not satisfy the requirement, it would fabricate the target column.

**[D] and positive control.** The gate was written before it was wired, and in the interval a real
defect shipped: #4191 retired one `fmt-oracle-excluded.json` entry, deleted the prose bullet and
left the table's `n` at 4, so the table asserted 26 against a ratchet of 25. `known-failures-md-check`
(C2) is wired in three places and **does not read attribution tables at all**, so both doc checks
returned `EXIT=0` — correctly, about a different question. `--gate-known` reports that defect on
the current tree, which is the control that says exempting the pending list did not exempt the
thing the flag was built to catch. The self-test additionally pins both directions of the exemption:
the same tree passes with `--gate-known` + a pending entry and fails with either one removed.

**[S] What it does not look at.** It never opens the cited `upstream_issues/` report, so a citation
that exists but describes a different defect passes — the "a live but wrong citation never 404s"
shape, one level up from a path check. It cannot tell whether an `n` is apportioned to the right
cluster: only the sum is compared, so moving 10 entries between two rows of the same table is
invisible. It has no view of an entry that should be listed and is not, because its population is
the ratchets on disk. And `--gate-known`'s exemption is per **file**, not per entry, so a ratchet
on the pending list contributes nothing to any of the other checks either — a partial table for a
pending ratchet is neither required nor validated.

---

## Adding a gate, or a row here

When you add a gate, add its row **before** the ratchet is first baselined, and answer the
question this document exists to force:

> **What does this gate not look at?**

Not "what inputs does it not have" — that is corpus size, and it is the saturated axis. Ask
which *fields* of the compared objects the comparison key drops, which *normalization* runs
before the diff, and which *population filter* the unit passes through. Until #2281 the corpus
pipeline discarded `result.warnings` entirely, so that whole class was invisible by
construction, at any corpus size — which is how #2256 shipped while the corpus scored the very
entry that reproduces it as `MATCH`.

If you cannot answer with a discriminating case or a file:line citation, write `[U]` and say
what would resolve it.

**A fourth evidence form, and it fails differently from the other three.** A *positive-controlled
exhaustive search that came back empty* is not a **structural argument from code**: nothing was
derived, a range was swept and found bare. `completions.emmet` has no reader outside
`settings.rs`, shown against `settings.html.enable` (read from `server.rs`) as the control that
the search can find a reader when one exists. The two are refuted by different things — a
structural argument falls to an error in the reasoning, an empty search falls to an error in the
search's *range* — so labelling one as the other tells the next reader to re-check the wrong
half. Write it as its own form and name the range that was swept.

<a id="two-ports-inventory"></a>

## One upstream decision, N rsvelte implementations

A companion to [`gate-coverage.md`](#gate-coverage). That document is indexed by **gate** and
asks what each gate does not look at. This one is indexed by **decision** and asks a question no
gate here is shaped to ask:

> The official compiler answers this question in one function. How many times does rsvelte
> answer it, which inputs reach which answer, and **is there anything that compares the answers
> to each other?**

Every gate in this repository compares rsvelte to *upstream* on some population. None compares
rsvelte to *itself*. So when one upstream function is ported twice, the second port is only ever
exercised on whatever inputs a real file happens to supply, and a shape that separates the two
has to be published before anyone sees it. That is the mechanism behind #3027, and on
**2026-08-22 four more instances were reported on the same day by four different people working
in four different files** — #3403 (CSS matching), #3427 (CSS pruning across phases), #3472
(console-argument shape), #3569 (`has_call`'s writers). This file exists because that is a
recurring class and not a coincidence.

### How to read a row

Each row carries an **evidence grade**, and the grades are not interchangeable:

| grade | means | what it takes |
|---|---|---|
| **[S]** structural | two implementations of one decision exist | file:line citations for each |
| **[D]** demonstrated | the two provably answer differently | the differing code **and a named input** |
| **[M]** measured | both were run and compared on real inputs | a harness, a denominator, a result |

The letters extend [`gate-coverage.md`](#gate-coverage)'s vocabulary rather than
competing with it: **[S]** is its structural argument from code and **[D]** is its
discriminating case, one level down (the case discriminates two *ports* instead of a gate's
green from a correct gate's red). **[M]** has no counterpart there, because that file's rows
describe what a gate cannot see and this file's rows describe something nobody has run.

**"There are two ports" and "the two disagree" are separate claims** — the first is an argument
from code, the second needs an input. Do not soften an [S] into a [D] because a divergence looks
likely; write `未測定` for the divergence and leave the row at [S]. An unsupported claim here is
worse than a blank, because the next person reads the row as surveyed.

**No row below is [M], and that is the finding rather than an omission.** Nothing in this tree
runs two ports of one decision against each other and compares the results — with exactly one
exception, § *The one place this is already defended*, which is the template for closing a row.

Grading a row [D] from code alone is deliberate and it is weaker than it looks: it says the two
functions *would* answer differently on that input, not that the input is reachable through the
compiler's own routing. **Reachability is a separate question from correctness** — several rows
below name an input whose reachability is untested, and they say so.

### The one place this is already defended

`expression_has_reactive_state` (`3_transform/client/visitors/shared/utils.rs:5063`), its typed
front end `typed_has_reactive_state` (`:5486`) and the JSON walk `has_reactive_state_json`
(`:5654`) are three implementations of one decision — and a test runs two of them on the same
input and compares:

```rust
fn both_has_reactive_state(expr_src: &str) -> (bool, bool) { … }

#[test]
fn typed_reactive_state_front_end_agrees_with_the_json_walk() {
    // (expression, expected answer) — expectations are spelled out as well
    // as compared, so a front end that always says `false` can't pass by
    // agreeing with an equally broken oracle.
```

Two properties make it worth copying rather than admiring. It compares the **ports to each
other**, which no gate does. And it **also pins the expected answer independently**, so the test
cannot pass by having both ports be broken in the same direction — the failure mode that a
port-vs-port comparison has and an upstream-vs-rsvelte comparison does not. A differential test
whose oracle is the other implementation is only as good as its independent expectations.

### Inventory

| # | decision | ports | grade | closed? |
|---|---|---|---|---|
| [1](#1-which-estree-object-does-a-function-declaration-serialize-to--d) | Which ESTree object does a `function` declaration serialize to? | 4 | **[D]** | no |
| [2](#2-is-this-callee-a-rune-and-which-one--d) | Is this callee a rune, and which one? | 3 name tables (+ ≥7 lookup impls) | **[D]** | no |
| [3](#3-is-this-assignments-rhs-a-known-primitive--d) | Is this assignment's RHS a known primitive? | 3 | **[D]** | no |
| [4](#4-which-trailing-global-are-truncated-before-matching--d) | Which trailing `:global(...)` are truncated before matching? | 2 | **[D]** | no |
| [5](#5-is-this-fragment-standalone--d) | Is this fragment standalone? | 2 | **[D]** | no |
| [6](#6-is-this-byte-code-or-comment--string--template--regex--d) | Is this byte code, or comment / string / template / regex? | 3 predicates + ≥7 inline copies | **[D]** | one copy folded onto `find_matching_bracket` |
| [7](#7-does-this-element-match-this-selector--d-one-pair-closed) | Does this element match this selector? | 4 in phase 2 | **[D]** | #3403 fixed one pair |
| [8](#8-where-does-the-scoping-class-go-inside-a-compound--d-open-as-3402) | Where does the scoping class go inside a compound? | 2 | **[D]** | #3402 open |
| [9](#9-is-this-expressions-value-known--defined--d) | Is this expression's value known / defined? | ≥6 | **[D]** | no |
| [10](#10-which-line-and-column-is-byte-offset-n-on--d) | Which line and column is byte offset N on? | 4 tables | **[D]** | no |
| [11](#11-does-this-expression-contain-a-call--s) | Does this expression contain a call? | 4 | **[S]** | #3569 open |
| [12](#12-selector-unused-and-element-scoped-are-two-engines-over-two-element-models--s) | "Selector unused" vs "element scoped" | 2 engines, 2 element models | **[S]** | no |
| [13](#13-what-does-a-call-to-one-of-upstreams-globals-keypaths-evaluate-to--d-closed-by-degree-1) | What does a call to one of upstream's `globals` keypaths evaluate to? | 2 tables | **[D]** | closed by #3471 (degree 1) |
| [14](#14-what-options-does-the-public-parse-run-with--d) | What options does the public `parse()` run with? | 2 bindings | **[D]** | #3688 open |
| [15](#15-how-are-public-compile-options-validated--d) | How are public compile options validated? | 3 bindings | **[D]** | #3664 defended at degree 2 |
| [16](#16-what-is-the-read-form-of-a-name-inside-an-invalidate_inner_signals-body--d) | What is the read form of a name inside an `$.invalidate_inner_signals` body? | 2 | **[D]** | no |
| [17](#17-does-an-assignment-lhss-computed-index-get-its-sites-read-transform--d-closed) | Does an assignment LHS's computed index get its site's read transform? | 2 (+3 `untrack` rebuilders) | **[D]** | closed |
| [18](#18-does-a-mutation-of-a-legacy_indirect_bindings-root-get-the-invalidate-wrap-at-all--d-closed) | Does a mutation of a `legacy_indirect_bindings` root get the invalidate wrap at all? | 4 | **[D]** | closed |
| [19](#19-where-does-a-keywords-source-map-anchor-go--d-defended-at-degree-2) | Where does a keyword's source-map anchor go? | 2 | **[D]** | defended at degree 2 |
| [20](#20-what-does-a--reactive-statement-assign--d-closed) | What does a `$:` reactive statement assign? | 2 | **[D]** | closed |
| [21](#21-does-this-write-target-resolve-to-the-components-binding-or-to-a-shadow--d) | Does this write target resolve to the component's binding, or to a shadow? | 44 rewrite passes, 8 scope-aware | **[D]** | 4 ports closed at degree 1 |
| [28](#28-how-is-an-elements-attribute-list-rendered--d) | How is an element's attribute list rendered? | 2 emitters (+2 copies of `action_arguments`) | **[D]** | 1 defect open |
| [29](#29-is-a-name-inside-a-named-slots-body-reactive--d) | Is a name inside a named slot's body reactive? | 2 (phase 2 scope fork, phase 3 name lookup) | **[D]** | open |
| [30](#30-is-this-rule-a-global-block--d) | Is this rule a global block? | 4 predicates, 13 decision sites | **[D]** | 5 defects closed, 1 open |

**Rows 22–27 have bodies below and no line in this table** — measured 2026-09-02 by
enumerating the `#### <n>.` headings against the table's own `[n]` links. The index is the
stale half, not the inventory: read the bodies for the count.

---

#### 1. Which ESTree object does a `function` declaration serialize to? — [D]

**Upstream:** one `acorn.parse` (`phases/1-parse/acorn.js:25`). Position in the source cannot
change the shape of the node it produces.

**Ports.** `convert_function_declaration_as_node`
(`1_parse/read/expression.rs:8344`) has exactly two call sites, and only one of them is guarded:

- `:7502` — `convert_statement_for_program`, the path every `function` declaration inside a
  `<script>` takes. **Unguarded.**
- `:8508` — `convert_declaration_for_program_as_node`, the `export`ed path, guarded by
  `&& func_decl.params.rest.is_none()`, which falls through to the Value form
  `convert_declaration_for_program` (`:8578`) when a rest parameter is present.

**The disagreement is documented in the tree, by both sides.** The typed converter's own doc
comment says rest parameters are not emitted and that callers needing them must route through the
Value form; the guard that routes around it says the typed path "emits only `params.items`, so a
rest parameter would be dropped relative to the Value form — keep Raw in that case."

So `export function f(...a) {}` serializes with a `RestElement` in `params`
(`expression.rs:8622-8639`) and `function f(...a) {}` — the same source minus one keyword — does
not. Two further converters answer the same question: the expression-context arm (`:6202`, which
*does* emit the rest element) and the `export default` arm (`:7548`, which does not).

**Who reads it.** The serialized program is what `rsvelte_lint`'s JSON-walking rules and
svelte2tsx consume; codegen is unaffected. The blast radius is every rule that inspects a
function's parameters.

Closing this means one converter, not four — or, short of that, a test that serializes the same
body in all four positions and asserts the `params` arrays are equal.

#### 2. Is this callee a rune, and which one? — [D]

**Upstream:** one `RUNES` array and one `is_rune` in `src/utils.js:437`, with `get_rune`
(`phases/scope.js:1433`) applying one shadowing rule. **18 names.**

**Ports — three tables, and only one of them is upstream's:**

| table | file | missing relative to upstream |
|---|---|---|
| phase 2 | `2_analyze/visitors/shared/function.rs:84` `is_rune` | — (all 18 present) |
| phase 3 client | `3_transform/client/visitors/expression_converter.rs:2141` `RUNES` | `$props.id`, `$bindable`, `$inspect.trace` |
| server | `3_transform/server/evaluate.rs:642` `is_rune` | `$inspect().with`, `$inspect.trace` |

**The two phase-3 tables are not subsets of each other**: the client has `$inspect().with` and
not `$bindable`; the server has `$bindable` and not `$inspect().with`. Only `$inspect.trace` is
missing from both.

Both non-conforming tables carry a comment asserting the equality they break — the server's says
"The full rune list (mirrors `is_rune` in utils.js)", the client's "This function mirrors the
official Svelte compiler's `get_rune`". **A comment claiming fidelity is not evidence of it**,
and here it marks the opposite twice.

Named inputs: `let id = $props.id();` — phase 2 classifies the callee as a rune, the client's
`get_rune_from_call` returns `None`. `$inspect.trace()` — phase 2 says rune, client and server
both say not-a-rune. Whether either shape reaches both sites in one compile is `未測定`.

Above the tables there are at least seven implementations of the *lookup* itself
(`call_expression.rs:21` / `:217`, `shared/utils.rs:733` / `:1171`, `class_body.rs:86`,
`expression_converter.rs:2168` / `:6222`), differing in their shadowing rules —
`class_body.rs:86` has none at all. Those are `未測定`; the table divergence above is not.

#### 3. Is this assignment's RHS a known primitive? — [D]

**Upstream:** `Evaluation.is_primitive` (`phases/scope.js:242`), read once, at
`client/visitors/AssignmentExpression.js:180`.

**Ports — three, and one of them states the invariant the other two break:**

- `3_transform/client/assign_dev_ast.rs:56` `is_known_primitive` (oxc `Expression`) — has
  `ConditionalExpression`, `LogicalExpression` and `SequenceExpression` arms.
- `3_transform/client/visitors/expression_converter.rs:5129` `is_known_primitive_json` — has
  none of the three; falls to `_ => false`.
- same file `:5212` `is_known_primitive_jsnode` — likewise none.

The first one's doc comment reads:

> `scope.evaluate(right).is_primitive`, approximated by shape exactly as the template path's
> `is_known_primitive_json` does — **the two must agree or the same source would be wrapped on
> one path and not the other.**

They do not agree. On `obj.x = cond ? 1 : 2` the oxc path skips the dev-mode `$.assign` wrap and
both template paths emit it. **The invariant is written down, the violation is one `match` arm
away, and nothing runs the two functions on one input** — the whole class in a single row.

#### 4. Which trailing `:global(...)` are truncated before matching? — [D]

**Upstream:** `css-prune.js:209` `truncate`, one function, one caller
(`get_relative_selectors:172`), which is the single entry point for every matching call in
`prune()`. When every relative selector is global, `findLastIndex` returns `-1` and it returns
the **empty** array.

**Ports — two, with opposite behaviour in exactly that case:**

| | file | all-global input | global predicate |
|---|---|---|---|
| phase 2 | `2_analyze/css_scoping.rs:1184` `truncate_globals` | `&[]` — matches upstream | `is_relative_selector_global:1024` |
| phase 3 | `3_transform/css.rs:2704` `truncate_trailing_globals` | **the input unchanged** | `relative_selector_is_outer_global:2674` |

Both doc-comment themselves as ports of `truncate`; the phase-3 one says so and then documents
its own deviation ("if every selector is global, returns the input unchanged"). On
`:global(.a) :global(.b)` phase 2 truncates to nothing and its callers bail; phase 3 keeps both
relatives and goes on to match `.b` against local elements.

Neither port implements upstream's third behaviour, the `:root…:has()` `.map()` at
`css-prune.js:220-231`. And in `3_transform/css.rs` truncation is **not on the path at all** for
five of the deciders `is_complex_selector_unused_impl` calls — upstream funnels all of them
through `truncate`.

#### 5. Is this fragment standalone? — [D]

**Upstream:** `phases/3-transform/utils.js:126` `clean_nodes`, imported by all four visitors —
client `Fragment`, client `RegularElement`, server `Fragment`, server `RegularElement`.

**Ports.** rsvelte's `clean_node_list` (`3_transform/utils.rs:672`) is client-only: every
`clean_nodes` occurrence under `3_transform/server/` is a **comment referring to upstream**, not
a call. The server answers the same question in `3_transform/server/ast/mod.rs:636`
`is_standalone_fragment`, and it differs in two fields:

| | upstream / client | server |
|---|---|---|
| comments | dropped only when `!preserve_comments` (`utils.rs:706`) | `TemplateNode::Comment(_) => false`, **unconditional** (`mod.rs:655`) |
| `DebugTag` | hoisted (`utils.js:157`, `utils.rs:713`) | **absent from the hoist list**, so `_ => true` counts it as a meaningful sibling |

Named inputs: `{#if x}<!-- c --><Foo />{/if}` with `preserveComments: true` — client not
standalone, server standalone. `{#if x}{@debug y}<Foo />{/if}` — client standalone, server not.
Which output each produces for those inputs is `未測定`; the branch difference is not.

This is adjacent to #3376, where a `{@debug}` with no identifiers left a fragment static on the
client. `DebugTag` is a node two independent lists must both remember to name, and one of them
has already forgotten once.

#### 6. Is this byte code, or comment / string / template / regex? — [D]

**Upstream:** n/a. Upstream never re-scans raw text; this is a consequence of rsvelte's
text-rewriting pipeline and the reason AGENTS.md carries three separate rows about it.

**Ports.** `3_transform/shared/js_scan.rs:146` `skip_opaque` is one shared predicate with ~30
callers, `class_body::find_class_header` among them — that is a shared helper, **not** an
instance, and it is the shape the other copies should be folded into.

The instance is that **the phase-2 `$`-reference scanner does not use it**.
`2_analyze/store_subscriptions.rs:971` `collect_dollar_identifiers_pass` carries its own
`&[char]` state machine with `in_string`, `in_line_comment`, `in_block_comment`,
`template_stack` and `class_bodies` — and **no regex-literal branch at all**. Measured as a grep
carrying its own positive control in the same invocation: `js_scan.rs` names `regex` 20+ times,
`store_subscriptions.rs` names it **0** times.

Named input: `const r = /\$foo/;` — `js_scan` treats `$foo` as non-code, the store scanner
records it as a store reference. This is the shape of **#2988**, which was fixed by routing the
module rune loop through `js_scan::find_code`; the phase-2 scan answers the same question and
never received that fix. It has already been patched once for a *different* missing case (#3127,
class bodies), which is what an unshared predicate costs: each gap has to be found separately.

`store_subscriptions.rs:1236` `class_body_open` is a third answer to "where does a class body
start", independent of both `skip_opaque` and `find_class_header`, and
`3_transform/server/transform_store.rs` and `server/helpers.rs` carry at least eight more inline
`in_string` / `in_comment` machines. Their input ranges are `undetermined`.

**A fourth pair is worth recording for the opposite reason: the two copies AGREED, and both were
wrong.** `client/class_transforms.rs` splits a class body into member blocks line by line, and
until 2026-08-29 both `parse_section_members` (`is_plain_field`, which excluded a line beginning
`//` or `/*`) and `rejoin_class_members` (which refused to terminate a block on the same two
prefixes) asked "is this line comment text" **per line**. So the continuation lines of anything
spanning lines were members of their own on both, and the two failure modes are different
depending on what spans:

- a multi-line `/* … */` leaves its opening `/**` on the block above, that block is an
  unterminated comment, `private_class_assign_ast` cannot parse it, and every rewrite it owns is
  skipped in silence — on sveltekit's `query/instance.svelte.js` the `??=` lowering of a private
  `$state.raw` field, emitting `$.get(this.#promise) ??= this.#run()`, which no JS parser accepts;
- a multi-line **template literal** parses fine and changes *value*: the member blocks are
  re-emitted with esrap's margins, so a blank line lands inside the string
  (`` `a ${1} b⏎⏎c ${2} d` `` where the source has one line break).

Both are fixed by routing the two through one cross-line predicate,
`js_scan::line_starts_outside_opaque`, which is built on the same `skip_opaque` this row names as
the shape the copies should fold into — so `class_transforms.rs` is now a *user* of that
predicate rather than a further copy of it. Measured over the 589 corpus sources holding both
`class` and a rune (293 compiled by both compilers): the comment half moved 40 files from
divergent to byte-identical on client and 1 on client-dev, and took the population's unparseable
outputs from 1 to 0; folding onto the shared predicate then moved 2 more on client-dev, 0 on
client, and 0 either way in the other direction.

The reusable part is the grade this pair would have earned. It is **[S]**, never [D]: no input
separates the two, because they answered the same question the same wrong way — which is
precisely the failure mode § *The one place this is already defended* names for a port-vs-port
oracle. **A row at [S] whose two ports provably agree is not a closed row**; it is a row whose
divergence test cannot exist, and only an independently pinned expectation (here: the official
compiler's output) can grade it.

One defect this uncovered is **not** in this file's scope and is recorded so it is not
rediscovered here: once a chunk containing a multi-line template literal reaches the in-place AST
rewrite, the reprint **re-indents the template's interior lines**, which is another silent value
change. It reproduces on a binary built before any of today's fixes, so it is pre-existing and
belongs to the printer rather than to the member scan.

**A fifth instance, closed — and it names a THIRD shared predicate rather than a further copy.**
`svelte2tsx/utils/lexical.rs`'s `template_expression_ranges` was one of the inline machines this
row counts: it paired `"` and `'` as string delimiters, handled `//` and `/* */`, and had no
regex branch. Named input, reproduced on `open-webui/…/Markdown/HTMLToken.svelte`:

```svelte
{@const m = t.match(/<file type="html" id="([^"]+)"/)}
```

The odd `"` count desynchronizes the pairing, the expression's range runs past its own `}`, and
the markup after it is absorbed — so a **live** `$settings` read in the following attribute was
dropped from the projection as if it sat inside a string. It is the same shape as #2988, one
port over.

It is closed by routing through `phases/1_parse/utils/bracket.rs`'s `find_matching_bracket`,
which has stepped over comments, strings **and** regex literals since #2253. That is not
`skip_opaque`: it is a third shared predicate answering the same question with a different
return, and the fold went to it because this caller needs the matching bracket's *position*,
not the set of opaque runs. **The row does not close on this** — that two shared predicates
both answer "is this byte code" and nothing compares them to each other is exactly what this
file is indexed on, and it is now the residue here rather than the eight inline copies.

#### 7. Does this element match this selector? — [D], one pair closed

**Upstream:** `css-prune.js:243` `apply_selector` + `:291` `apply_combinator` + `:436`
`relative_selector_might_apply_to_node`. One implementation, called for every
`(element, selector)` pair.

**Ports — four, in `2_analyze/css_scoping.rs`, partitioned by *filters* rather than by design:**

1. `GMatcher::apply_selector` (`:3220`) — graph-based, faithful. Reached **only** by selectors
   passing `has_sibling_combinator || selector_contains_has || selector_contains_complex_not`
   (`:3629`). A plain `div .a` never reaches it.
2. `complex_selector_matches_element` (`:1699`) → `element_matches_simple_selectors` (`:1097`) —
   element-walking. Reached by everything **except** `:has()` (`:1461`).
3. `static_relative_might_apply` (`:3525`) — a simplified third copy for exactly-two-part sibling
   selectors.
4. `element_is_ancestor_in_matching_selector` (`:1870`) — a fourth, for the ancestor pass;
   upstream has no separate function, it marks ancestors inside `apply_selector`.

**The two filters are not complements**, so a selector with a sibling combinator runs through
both #1 and #2 and the results are OR-ed. And #2 returns `false` outright for `+`/`~` (`:1855`),
deferring to #1 — so #1's filter is load-bearing for #2's correctness.

**#3403 is the demonstrated divergence** and is fixed (PR #3581): #1 truncates globals and falls
back to "assume a match" for a multi-part `:is()` argument, while #2 tested the argument's last
compound. Ports 3 and 4 bottom out in #2 and inherited its answer. The remaining pairs are
`未測定`.

#### 8. Where does the scoping class go inside a compound? — [D], open as #3402

**Upstream:** `phases/3-transform/css/index.js:336-365` — **one** loop walking the compound
backwards, emitting the modifier once and `break`ing.

**Ports — two, in `3_transform/css.rs`:**

- `transform_complex_selector` (`:6696`) — iterates **forwards**, with a `*` arm at `:7166` that
  is **positionally unconditional**, plus a second modifier emission at `:7229` gated on the last
  non-pseudo index. Handles every compound **outside** a functional pseudo-class.
- `transform_is_not_complex_selector` (`:7636`), reached from
  `format_simple_selector_with_scope:7393` → `transform_is_not_args:7559` — its `*` arm at
  `:7805` **is** guarded by `Some(idx) == last_non_pseudo_idx`. Handles the `:is()` / `:where()`
  / `:has()` / `:not()` interior.

#3402 measures the consequence: `*.a` prints as `.svelte-X.a:where(.svelte-X)` (the modifier
twice) while `:is(*.a)` prints correctly. **The issue's own control list is the two-ports
signature** — "the identical compound inside `:is()` is handled correctly" means one of the two
ports is already right, and names which one.

#### 9. Is this expression's value known / defined? — [D]

**Upstream:** one `Scope#evaluate` returning one `Evaluation` object (`phases/scope.js:198`),
whose `is_known` / `is_defined` / `is_primitive` fields are read at a handful of sites.

**Ports.** #3027 already split this once — the client fold now goes through the server's
`EvalValue` — but the *neighbouring* predicates did not follow:

- `3_transform/server/evaluate.rs:37` `EvalValue` — a real abstract-value lattice, server only.
- `client/visitors/shared/utils.rs:6734` `is_expression_known_json` — a JSON walk with binding
  resolution.
- same file `:6656` `is_initial_value_literal_or_known` — answers by
  `memchr::memmem::find(s.as_bytes(), b"Literal")` over `binding.initial`, a string that may hold
  **either** serialized AST JSON **or** raw source text. So `let x = "a Literal string"` is
  "known", and any JSON containing a nested `Literal` anywhere — `f(1)` — is too, while
  `is_expression_known_json` reaches its call arm and says no.
- `client/visitors/title_element.rs:469` `is_known_defined_expr` — matches `Some("Literal")` and
  `Some("TemplateLiteral")` and nothing else, while `client/visitors/shared/utils.rs:4677`
  `is_expression_defined_json` resolves identifiers and unions conditional branches. On
  `{cond ? 'a' : 'b'}` the `<title>` path emits `?? ""` and the ordinary-text path does not;
  upstream answers both from one `evaluate` that handles `ConditionalExpression`
  (`scope.js:375`), so the `<title>` path is the deviant one.
- `client/visitors/regular_element.rs:2140` `is_value_known_defined` — a fifth, for
  `<option>` / `<select>`'s `node.__value`, with its own scope-root resolution and its own
  `JsExpr::Raw` string heuristic.
- `2_analyze/visitors/variable_declarator.rs:268` `is_expression_defined_typed` — a sixth, whose
  answer is frozen into `binding.initial_is_defined` at analyze time.

AGENTS.md already names three of these as "the next instalment" after #3027. The `<title>` and
`<option>` ports are not in that list.

The `globals` **table** underneath these predicates was a seventh port until #3471; it is
row [13](#13-what-does-a-call-to-one-of-upstreams-globals-keypaths-evaluate-to--d-closed-by-degree-1),
and it is the one instance in this file where the two ports were shown to render different text
from the same source.

**Two of these ports are closed as of 2026-08-29, and the divergence they carried ran in BOTH
directions — which is what makes the row worth re-reading rather than ticking off.** The
`?? ''` guard on a template hole, on `$.document.title` and on `option.value` is one upstream
decision, `scope.evaluate(value).is_defined`, read at three sites. rsvelte answered it with the
shared estree walk in some places and with `identifier_is_defined`, a hand-written table of
binding shapes, in others. The table admitted no function binding and no `$state` binding that is
never written, so `{fn}`, `{arrow}` and `<option value={n || 'a'}>` were guarded where upstream
leaves them bare; and `<title>` graded the **source** expression rather than the value it had
just built, so a legacy `$.untrack(…)` wrapper never made the chunk unknown and the guard was
omitted where upstream adds it. `identifier_is_defined` now delegates to `evaluate_binding_initial`
and `title_element` grades the built value, so both sites read the one walk; the walk itself
gained upstream's FUNCTION case, which no port had.

The measurement is the reason to state the directions separately. Over a 5,041-component
population (a deterministic 4,000-file sample of the 33,792 corpus components plus every one of
the 1,210 holding a `<title>`, `<option>` or `<select>`), the change moved **12 client outputs and
12 client-dev outputs and 0 server outputs**; graded against the official compiler, 11 of the 12
go divergent → byte-identical on each target and **none** move the other way, the twelfth
shrinking from 15 to 11 divergent lines with the residue in comment placement. A fix measured on
one direction's population would have scored a one-directional patch green.

**The `is_known` half of the same source-vs-built split closed on 2026-08-30, and its
population is disjoint from the `is_defined` one above.** `build_template_chunk` folds a chunk
whose evaluation is known, and upstream evaluates the value it BUILT
(`memoize(build_expression(...))`). In legacy mode `build_expression` wraps any chunk carrying a
call, a member expression or an assignment in `(deps…, $.untrack(() => value))`, and
`scope.evaluate` has no `SequenceExpression` case — so no such chunk is ever known, however
constant its **source** reads. rsvelte graded the source, so
`style="margin-bottom:{a.id === b ? '0px' : '0px'}"` folded to a constant and the write was
hoisted out of `$.template_effect`: the attribute freezes at its first-render value, the output
parses, and the client and the server agree with each other. `get_literal_value` now declines
where `build_expression` will wrap, which covers all three chunk builders
(`shared/utils.rs`, `shared/element.rs`, `title_element.rs`) in one place because they share it.

Two things worth keeping. The guard has to see the **repaired** metadata, not phase 2's raw
flags: rsvelte's directive paths drop `has_member_expression` / `has_assignment` and the sites
restore them before `build_expression` reads them, so a guard on the raw flags would let the
fold and the wrap disagree about one tree. And the measurement is small and one-directional —
over all 34,709 corpus sources × 3 targets (104,127 compiled units) exactly **6 (id, target)
pairs move, across 3 ids**, and every one moves toward official: `huly`'s `IconStarted.svelte`
goes divergent → byte-identical on client and client-dev, and the two `sparrow-app` files shrink
(53 → 25 and 101 → 87 diverging lines) with **100% of the residue in comment placement**, a
different defect. Zero server outputs move, which is the positive control for
`get_literal_value` being client-only.

Still open in this row: `is_expression_known_json`, `is_initial_value_literal_or_known` (the
`memmem::find(json, b"Literal")` one), `is_value_known_defined` and `is_expression_defined_typed`
— four `is_known` ports, untouched here, and `is_js_expr_defined` remains a structural second
walk over the built `JsExpr` whose leaves now call the shared one.

#### 10. Which line and column is byte offset N on? — [D]

**Upstream:** `state.js:57` — one `getLocator(source)` stored on `state.locator` and read
everywhere in the compiler. One table.

**Ports — four, in two crates:**

| | file | line terminators | column unit |
|---|---|---|---|
| T1 | `1_parse/mod.rs:197` `compute_line_offsets` | `\n` only | **bytes** |
| T2 | `rsvelte_lint/src/line_index.rs:50` | `\n`, `\r\n`, lone `\r` | **UTF-16** |
| T3 | `rsvelte_lint/src/line_index.rs:22` `js_line_starts` | T2 + U+2028 / U+2029 | UTF-16 |
| T4 | `rsvelte_lint/src/suppression.rs:215` `line_of` | `\n` only | n/a |

T2/T3 are the pair already reasoned about once: `LintDiagnostic::report_span` picks between them
per rule, with four upstream-measured verdicts pinned as a test. **T4 was not part of that.**
`runner.rs:295` filters a diagnostic whose line came from T2 or T3 against a suppression map
whose keys came from T4, and T4 does not split on a lone `\r`. Named input: a `\r`-delimited file
where an `eslint-disable-next-line` sits on T2's line 2 and T4's line 1 — the directive does not
suppress. `line_index.rs:203` tests T2 on exactly this shape; nothing compares it to T4.

T1 vs T2 is a **unit** difference rather than a terminator one, and the two meet in one output
array: `json_api.rs:120` emits byte columns for compiler warnings and `:141` emits UTF-16 columns
for native rules, into the same field. Any line with a non-ASCII character before the finding
gives two different columns for one offset.

Inside the parser, `get_line_column` (`read/expression.rs:6593`) and
`get_line_column_for_binding` (`:6605`) answer the same question about the same offset
differently by construction — the latter measures the column from the *previous* line's start
when that line is empty. Which one runs depends only on which `create_typed_loc*` the caller
picked.

#### 11. Does this expression contain a call? — [S]

Filed as **#3569**; recorded here so the inventory is complete rather than restated.
`ast/template.rs` `set_has_call` has three reachable phase-2 writers. When the issue was filed,
phase 3 re-derived the same bit in the generic element walker twice — `json_contains_call` and
`walk_metadata_flags` (the latter additionally counted a `SpreadElement`) — and in
`shared/utils.rs` `expression_has_call`.

Upstream computes it once in phase 2 into `node.metadata.expression.has_call`; phase 3 only reads
it. Whether the reachable copies disagree on an input: `未測定` — see #3569.

Three phase-2 writes listed when #3569 was opened were structurally unreachable and were removed:
the `SpreadElement` and `TaggedTemplateExpression` arms in the typed script walker, and the typed
`CallExpression` visitor. `VisitorContext.expression` starts as `None`; the only site that installs
`Some` is the `{#if}` visitor, and it walks its condition through `walk_js_expression_node`, not the
typed script walker. This is a static reachability result, not an ablation result: deleting those
three writes cannot change output while that single producer and consumer remain disjoint. The
remaining phase-2 writers are the reachable call, object-spread and top-level-spread arms in the
template-expression walker.

The migration slices now attach and consume that Phase 2 metadata for `AttachTag`,
`SpreadAttribute`, `StyleDirective`, the expressions inside a regular `style=` attribute, and
every generic attribute-value chunk, generic event attribute and component CSS custom property.
The old generic attribute
`walk_metadata_flags` / `json_contains_call` implementations and the tests that only compared
those unused walkers were then removed. The component CSS-property migration also removed the
last production caller and definition of the shared `expression_has_call` helper, so Phase 3 no
longer independently answers this question for generic attribute values. The shared text
template-chunk builder now also reads `has_call` from each expression tag's Phase 2 metadata,
rather than calculating a fourth answer while lowering text content. `shared/events.rs` still
asks the broader "contains any call" question for `OnDirective`, so the inventory row remains
open for that separate path.

#### 12. "Selector unused" and "element scoped" are two engines over two element models — [S]

**Upstream:** `css-prune.js:130` `prune()` sets `complex_selector.metadata.used` **and**
`element.metadata.scoped` from the **same** `apply_selector` call.
`3-transform/css/index.js` only *reads* `metadata.used`; it contains no matching logic.

**Ports.** rsvelte splits the two:

- `2_analyze/css_scoping.rs:1331` `mark_elements_scoped` produces `metadata.scoped`, over an
  `ElementInfo` / `SGraph` model.
- `3_transform/css.rs:1467` `is_complex_selector_unused_impl` produces the `used` bit at print
  time, over a *different* model (`CssDomElement` / `DomStructure`), through a cascade of ~10
  independent sub-deciders each with its own traversal.
- `2_analyze/css/prune.rs:11` `prune_css` is a **third**, name-set-only port whose result is
  discarded on the spot (`let _used = …`). #3574 proposes deleting it.

The structural claim is solid — two element models built by two passes and consumed by two
matcher families can only agree by coincidence, and each has a bail the other lacks. Whether they
**do** disagree on a real component is `未測定`, and it is the most expensive row here to measure,
because it needs both engines instrumented in one run. #3427 is the same shape one level over and
did produce a number, so it is measurable in principle.

---

#### 13. What does a call to one of upstream's `globals` keypaths evaluate to? — [D], closed by degree 1

**Upstream:** one `globals` table in `phases/scope.js:26` — 46 keypaths, each `[type, fn?]`.
`scope.evaluate`'s `CallExpression` arm calls `fn(...args)` when every argument is known and adds
the `NUMBER` / `STRING` marker otherwise. One table, one arm, one set of JS semantics.

**Ports — two, and they disagreed on a value both computed:**

- `3_transform/server/evaluate.rs:487` `eval_global_call` — all 46 keypaths, JS semantics
  (`Math.round` as `(n + 0.5).floor()`, which is JS's half-**up**), returning a typed `EvalValue`.
- `client/visitors/shared/utils.rs`, `get_literal_value_complex`'s `CallExpression` arm — a
  private list of **eight** `Math` names (`max`/`min`/`floor`/`ceil`/`round`/`abs`/`sqrt`/`pow`),
  no `String`, no `Number`, no `Number.*`, no `String.*`, no shadow guard, no `SpreadElement`
  guard — and `Math.round` as Rust's `f64::round`, which rounds half **away from zero**.

**The discriminating input is one line**, and it needs no state at all:

```svelte
<b>{Math.round(-0.5)}</b>
```

The client inlined `b.textContent = '-1'`; the server inlined `<b>0</b>`; official is `0` on both.
So a single source rendered a different number depending on which port read it, in output that
parses cleanly and has no reactivity symptom. `Math.round(-1.5)` is the second instance (`-2` vs
`-1`). No gate saw it: the corpus compares each target to *upstream* independently, so a
client-only wrong value is one entry's client column and nothing cross-checks it against the
server column of the same entry.

**Reachability is not in question here** — unlike several rows above, the input is an ordinary
template expression and the client fold is on its default path.

The second-order cost was larger than the wrong value: because the client's table was private, it
was also *small*, so `String(n)`, `Number(n)`, `Math.sign(n)` and 30 more names silently lost the
`textContent` fast path (#3471, 61 divergent cells of 124 measured).

**Closed at degree 1:** the client's arm was deleted and now calls the server's table through
`eval_known_global_call`. There is no second answer left to compare, which is why this row is
recorded rather than tracked. What it does **not** buy: the surrounding predicates in row 9 are
untouched, and nothing new compares any two of *them*.

#### 14. What options does the public `parse()` run with? — [D]

Filed as **#3688**; the divergence is one field today and the shape is why it is here.

**Upstream:** one answer, in `compiler/index.js` — `parse(source, { modern, loose } = {})` calls
`_parse(source, loose)` and `to_public_ast(source, ast, modern)`. There is no second construction
of the parse configuration anywhere in `svelte/compiler`.

**Ports.** rsvelte builds it independently in each binding:

- `crates/rsvelte_napi/src/lib.rs:201-217` sets `capture_comments: true`, with a comment
  asserting fidelity — *"The public AST API mirrors svelte/compiler `parse()`, which keeps
  `leadingComments`/`trailingComments` on nodes."*
- `crates/rsvelte_lint_bindings/src/compiler_wasm/mod.rs:87-89` takes `ParseOptions::default()`,
  which leaves `capture_comments` **false**, and accepts no options from its caller at all.

**The named input** is any component with a comment inside `<script>`: the NAPI AST carries the
node comments and the wasm AST does not. Graded **[D] from code** rather than **[M]** — the wasm
build was not executed, and a local `cargo` never builds the wasm features, which is part of why
this went unobserved.

**Nothing compares them.** The `parse()` AST parity gate (#3389) drives the NAPI port only; that
is gate-coverage **39g**. Corpus growth cannot reach the wasm port, because it is in no gate's
population. And the wasm build is what `@rsvelte/compiler` and the playground ship, so the port a
user installs is the unmeasured one.

#### 15. How are public compile options validated? — [D]

**Upstream:** `packages/svelte/src/compiler/validate-options.js` owns one ordered schema for
`compile` and `compileModule`, including parametric values, removed-option errors and process-wide
legacy warnings.

**Ports.** The NAPI conversion in `crates/rsvelte_napi/src/lib.rs`, the C ABI JSON conversion in
`crates/rsvelte_capi/src/lib.rs`, and the wasm conversion in
`crates/rsvelte_lint_bindings/src/compiler_wasm/mod.rs` each implement that schema. #3664 recorded
demonstrated disagreements on unknown keys, wrong scalar types, nested keys, aliases, removed
options and truthy `runes` values.

**Defended at degree 2.** `scripts/dev/test-wasm-compile-options.mjs` now compares representative
rejections directly with official Svelte and pins the warning and parametric cases independently;
the C ABI suite spells the same exact messages and behaviours as independent expectations. The
ports remain separate because their value domains differ (JS callbacks versus JSON and native
callbacks), so this closes the demonstrated cells rather than removing the row. A new option or
validator kind still has to be added to all three ports and their boundary gates.

#### 17. Does an assignment LHS's computed index get its site's read transform? — [D], closed

**Upstream** never asks. `Program.js:66-76`'s `replace()` rebuilds the member chain with
`property: n.property` untouched, because the `mutate` callback is handed a mutation the general
assignment transform has **already** visited — so by the time `replace()` sees it, the computed
key already reads `groupKey()`. The invariant is "the LHS is transformed before the store root is
swapped", and it lives in the call order, not in a function.

**Ports.** rsvelte does not have that ordering, so each assignment path has to re-decide it:

- `client/visitors/shared/utils.rs:1387` — has an `is_store_sub` arm calling
  `transform_computed_indices_only`, with a comment giving the exact expected output.
- `client/visitors/expression_converter.rs:5349` — had the `is_prop_binding` arm and **no**
  store-sub arm, falling through to `left.clone()`.

Three further functions rebuild the same `$.untrack($store)…` chain and each clones `property`
independently: `shared/component.rs::replace_store_with_untrack` (fixed separately), and
`replace_store_with_untracked` — which exists **twice**, in `shared/declarations.rs:458` and
`visitors/program.rs:401`, byte-identical apart from the doc comment and how the arena type is
spelled.

**Demonstrated**, on two different read forms in one file
(`pattern-corpus/issues/store-member-computed-key-in-event-handler.svelte`), against official
5.56.10:

| site | official | rsvelte, before |
|---|---|---|
| each-item key | `$.untrack($formData)[groupKey()] = e.detail` | `[groupKey]` |
| reassigned `let` key | `$.untrack($scrollTop)[$.get(lastHref)] = e.detail` | `[lastHref]` |

`client` and `client-dev` diverge; `server` and `server-dev` are byte-identical, which is what
localises it to the client assignment path rather than to the store lowering.

Found in the corpus as `appwrite-console/.../resource-form.svelte` and
`huly/packages/panel/src/components/Panel.svelte` — both were failing on `main` and neither was
in a ratchet, so **no gate was reporting them**; they surfaced only once the output ratchet's
unlisted set was enumerated.

**The reusable part** is that the two ports were not a copied table — one had been *fixed* and
the other had not, and nothing relates them. The comment at `utils.rs:1387` even spells out the
expected output, which reads as authority while the sibling path silently disagrees.

#### 16. What is the read form of a name inside an `$.invalidate_inner_signals` body? — [D]

**Upstream:** one `build_getter(node, state)` (`3-transform/client/utils.js:33`), called once per
indirect binding from `AssignmentExpression.js:145-182`. It reads `state.transform[name].read`,
so the answer is a property of the **site** the body is emitted at, not of the binding.

**Ports.**

- `client/mod.rs` `prop_invalidate_bodies` — precomputes one body **string** per binding from a
  `BindingKind` table (`Prop`/`BindableProp` that is a prop source and `StoreSub` → `name()`;
  `State`/`RawState`/`Derived`/`LegacyReactive` → `$.get(name)`; otherwise bare). Consumed by the
  instance-script text pipeline and by `legacy_state_member_mutate_ast` /
  `prop_member_mutate_ast`, which splice it as text.
- `client/visitors/expression_converter.rs` `wrap_with_legacy_invalidate` — a second copy of that
  same table, for the template AST path.

**Demonstrated.** The kind table has no site, and a name's read form is not a function of its
kind alone: in `adventurelog`'s `LocationVisits.svelte`, `visit` is an instance-script function
parameter *and* an each item, so official emits bare `visit;` in `handleGpxFileChange` and
`$.get(visit);` inside the each block — from the same `legacy_indirect_bindings` list. The AST
port answered `visit` at both, because the table cannot see the each scope. It now consults
`context.state.transform` first and falls back to the table; the string port still has only the
table.

Two things the divergence was hiding, both found in the same file and both fixed:
`prop_source_reads_ast` walked **into** the spliced body and wrapped the prop read a second time
(`trails()` → `trails()()`), because the body arrives already in final read form and nothing said
so; and the legacy-state arm of a component `bind:` setter
(`visitors/shared/component.rs`, the `$.mutate(root, …)` branch) never called
`wrap_with_legacy_invalidate` at all, so `<Comp bind:tz={activityForm.tz} />` dropped the
invalidation the element arm emits. `compatibility/pattern-corpus/legacy-invalidate-inner-signals-site.svelte`
carries all three shapes.

**Not closed.** The string port cannot be made site-aware without a printer, and the AST port
cannot be made to produce the text the per-line pipeline splices. Closing this at degree 1 means
retiring the text splice — the client instance-script pipeline AGENTS.md already names as the
correctness hazard.

#### 18. Does a mutation of a `legacy_indirect_bindings` root get the invalidate wrap at all? — [D], closed

**Upstream:** one test, `AssignmentExpression.js:165` — `if (binding.legacy_indirect_bindings.size
> 0)` wraps the mutation in `(mutation, $.invalidate_inner_signals(() => { … }))`. Row 16 asks what
goes *inside* that body; this row asks which rsvelte code paths ask the question at all.

**Ports.** Four, and they are reached by disjoint input shapes:

- `visitors/expression_converter.rs` `wrap_with_legacy_invalidate` — template AST path.
- `legacy_state_member_mutate_ast.rs:290,324` — instance-script state member mutation.
- `prop_member_mutate_ast.rs` — instance-script prop member mutation.
- `reactive_transforms.rs` — a `$:` body. This one had **no** wrap, on either of its two
  internal routes: the simple-assignment `format!` builders, and `state_member_mutate_ast.rs`,
  which is a second file with the same body as `legacy_state_member_mutate_ast.rs` and did not
  take the `invalidate_bodies` map.

**Demonstrated.** `<select bind:value={lodging.type}><option>{$t('hotel')}</option></select>` with
`$: lodging.tz = allDay ? null : 'x'`: official emits the sequence, rsvelte emitted
`$.mutate(lodging, $.get(lodging).tz = …)` alone. Reproduces on `adventurelog`'s
`LodgingDetails.svelte`, twice, at both of that file's `$:` routes.

**What made it hard to see is the shape of the first repro, not the defect.** The first minimal
file was a *prop* root mutated from a *function body* — a cell that reaches port 1, which already
wrapped. It went byte-identical on all four targets while the corpus file that motivated it still
diverged. Crossing the two axes (binding kind × the statement the write sits in) put the
discriminating cells on the table: the kind axis is flat, and every failing cell is a `$:`.
A repro going green is evidence about that repro, never about the cause.

**Closed at degree 1** for the `state_member_mutate_ast` route (it now takes the same map and
builds the same string as its twin) and by construction for the two `format!` builders, which call
one local helper. The two twin files remain — that is row 16's open half, not this one's.

#### 19. Where does a keyword's source-map anchor go? — [D], defended at degree 2

**Upstream:** one `write_source_keyword(context, line, column, keyword)`
(`esrap/src/languages/ts/index.js:113`) — `location(line, column)`, write the fragment,
`location(line, column + keyword.length)`. The fragment a declaration passes it is
`node.kind + ' '`, so the end anchor counts the separator, and esrap's `run()`
(`esrap/src/index.js:139-146`) pushes one segment per `Location` command with no collapse.

**Ports.**

- `rsvelte_esrap` `Printer::write_keyword` / `KeywordCursor::write` — the client map. Every
  `Location` reaches `Driver::push_mapping` (`command.rs`).
- `3_transform/mod.rs` `generate_token_mappings_inner` — the **server** map. `print_split` runs
  the printer with `emit_locations: false`, so the server's anchors come from a text token scan
  that matches generated tokens back against the source, not from esrap at all.

**Demonstrated.** On upstream's `sourcemaps/attached-sourcemap` fixture, whose `let` is alone on
its source line, the two ports were wrong in different ways at the same instant: the client
emitted no end anchor (a rsvelte-only guard dropped it once `column + keyword.len()` exceeded the
source line's length), and the server emitted one at `column + 3` (it anchored the token `let`,
not the fragment `let `). Two further defects in the client port were invisible until the first
was fixed — `push_mapping` **overwrote** a mapping when the generated position repeated, and
`keyword_cursor` / `write_keyword` mapped builder-made nodes that upstream skips on `node.loc`,
so every synthesized `var root = …` anchored at offset 0 of the `.svelte` file. All four are
fixed; the gate went 768/770 → **770/770** with out-of-range unchanged at 0.

**Defended at degree 2, not closed.** The server does not print through esrap, so there is no
single implementation to route both through. What the tree now has is four independently-failing
pins with expectations spelled out rather than read off the other port:
`crates/rsvelte_esrap/tests/keyword_anchor_fidelity.rs` (three tests, each failing only under its
own ablation) and `crates/rsvelte_core/tests/server_declaration_keyword_anchor.rs`. Nothing
compares the two maps to each other, and only one of the 29 sourcemaps samples has a source line
that separates the two rules — which is why this row was worth writing rather than the fix alone.

#### 20. What does a `$:` reactive statement assign? — [D], closed

**Upstream:** one visitor pair feeds one `order_reactive_statements`
(`phases/3-transform/client/visitors/shared/utils.js`). `AssignmentExpression.js` runs
`extract_identifiers(node.left)`, which keeps only `Identifier`s — so `$: o.x = 1` assigns
**nothing** — while `UpdateExpression.js` takes
`node.argument.type === 'MemberExpression' ? object(node.argument) : node.argument`, so
`$: o.x++` assigns **`o`**. The asymmetry is the whole decision, and the ordering DFS in
`order_reactive_statements` reads it.

**Ports.**

- `2_analyze/mod.rs` `CycleFacts::push_update_target` (`:1574`), feeding
  `order_reactive_statements` (`:3295`) — the client. It recurses through
  `JsNode::MemberExpression { object, .. }` to the root identifier, i.e. it has upstream's
  `object()`.
- `3_transform/server/ast/script.rs` `ReactiveScopedCollector::visit_update_expression`
  (`:4363`), feeding `topo_sort_reactive` (`:4189`) — the **server**. It matched
  `AssignmentTargetIdentifier` only, so a member-target update recorded no assignment at all.

**Demonstrated.** `compatibility/pattern-corpus/issues/reactive-member-assignment-cycle.svelte`
carries `$: data.count++`, `$: if (data.encrypt && size < 150) size = 150;` and
`$: data.size = size;`. Under the analyze port `data.count++` assigns `data`, so the DFS emits
the three in the order official does; under the server port it assigned nothing, the edge
disappeared and `data.count++` sank to last. **The client and client-dev outputs were
byte-identical to official throughout** — the same source, the same upstream rule, two answers,
and the divergence lived only on `server` / `server-dev`. That file has been on `main` since
#3958 and is in no ratchet: `Compiler parity` was red on `main`, so nothing scored it.

**Closed at degree 1 in spirit, not in code.** The server port now applies the same member-chain
root rule through a `update_target_root_name` helper that returns `None` for a chain rooted at a
call, mirroring `object()`. The two collectors still exist — the server walks oxc and the
analyzer walks `JsNode`, so there is no single function to route both through — and nothing
compares them to each other. The file above is the pin.
#### 21. Does this write target resolve to the component's binding, or to a shadow? — [D]

**Upstream:** every write lowering reaches its binding through **one** `context.state.scope.get(name)`
— `build_assignment` (`3-transform/client/visitors/AssignmentExpression.js:120`) and
`validate_mutation` (`.../shared/utils.js:402`) both do, and a name that resolves to a nested
declaration returns a binding whose `kind` is `normal`, so nothing is rewritten.

**Ports.** rsvelte answers it once per rewrite pass. Of the 44 `*_ast.rs` passes under
`3_transform/client/`, **8** consulted `oxc_semantic` and 36 compared the identifier's **text**
against a `Vec<String>` of binding names. Four of the text ones were binding-keyed write
lowerings (the count is 12 / 32 after fixing them):

- `prop_member_mutate_ast.rs` — `prop.x = v` → `prop(prop().x = v, true)`
- `state_member_mutate_ast.rs` — `state.x = v` → `$.mutate(state, $.get(state).x = v)`, the
  reactive-body twin of `legacy_state_member_mutate_ast.rs`, which has resolved through
  `find_state_var_symbols` since it was written and carries
  `skips_parameter_shadow_but_rewrites_captured_state` as a test
- `state_set_reactive_ast.rs` — `state = v` → `$.set(state, v)`
- `reactive_update_ast.rs` — `x++` → `$.update(x)` / `$.update_prop(x)`

**Demonstrated.** `huly`'s `FilterTypePopup.svelte` writes `filter.group` inside
`for (const filter of filters)` where `filter` is also a prop, and `musicat`'s `AnalyticsView.svelte`
writes `stats.totalPlays` inside `songs.reduce((stats, song) => …)` where `stats` is also legacy
reactive state. Official emits the plain write in both; rsvelte emitted the setter call. The
second is the one that names the *pair* rather than one port: the identical source inside a
plain instance function was already correct, because that path runs the scope-aware twin.

**What made the reactive ports get it wrong** is worth keeping: a `$:` body is handed to its
transforms **without** the component-level declarations, so the state variable is an *unresolved*
name there. `is_locally_shadowed` — "resolves to a declaration below the root scope" — is the
predicate that is right for both input shapes: unresolved (fragment) and root-scope (whole
script) both mean "the component's binding", and only a shadow is below the root.

**These four now route the decision through one primitive** (`scope_analysis::is_locally_shadowed`,
with `shadowed_reference_starts` for the in-place rewriters, which cannot hold a `Semantic`). That
is degree 1 for the *shadow* question and not for the row: the instance twin
`legacy_state_member_mutate_ast` still answers through `find_state_var_symbols` /
`is_state_var_reference_or_unresolved`, a second primitive with a second rule, and nothing compares
the two.

**Four of the remaining text-keyed passes were probed and are clean**: a `$`-prefixed parameter
shadowing a store (`function bump($count) { $count = 1; $count++; $count.x = 1 }`, reaching
`store_assign_ast` / `store_update_ast` / `store_member_mutate_ast`) and a parameter shadowing a
rest-props binding (`function read(rest) { return rest.foo }`, `rest_prop_member_access_ast`)
both compile byte-identical to official. `state_eager_ast` and `state_raw_frozen_ast` are keyed
on the rune **call**, not on a binding name, so they are not instances of this row at all — an
earlier draft of this row listed them and was wrong.

**The same probe found a live one, which is why the row stays open.** A function-local
`let n = $state(5)` that IS reassigned, shadowing a top-level `let n = $state(0)` that is NOT,
compiles to

```js
let n = 0;
function make() { let n = 5; $.set(n, 6); return n; }   // official: $.state(5) / $.get(n)
```

— `$.set` on a plain number, so the output is broken at run time rather than merely different.
**Its reachability is 0 on the collected corpus**: 5,521 of 34,709 sources declare a `$state`, 16
declare one name twice, 13 of those are `.svelte.(js|ts)` modules (which run the module pipeline,
where the escape hatch below already exists) and the 3 real components all compile byte-identical
on all four targets. Correctness and reachability are separate questions; this row records both.
The classification is a `Vec<String>` of non-reactive **names** (`client/mod.rs:7094`), so the
top-level binding's "never reassigned" answer reaches the inner declaration and its reads, while
the write goes through a pass that resolves correctly. The module pipeline already has the escape
hatch for exactly this — `ambiguous_state_names` (`client/mod.rs:5429`) re-asks
`binding.reassigned` per symbol whenever one name carries two `$state` bindings that disagree, and
`state_call_ast::is_non_reactive` consumes it — while the component pipeline neither computes it
nor reaches that lowering, which makes the `$state(…)` lowering itself a second pair.

**A battery of ten shadow probes then measured what the gate cannot.** One input per binding kind
— a store, a store subscription, a rest prop, `$state.raw`, `$state.snapshot`, an arrow parameter
over a `$state`, a `$derived`, an each item, a prop called as a function, a `$`-prefixed local —
each shadowing the component's binding inside a nested scope, compared to official on all four
targets. **Nine of ten were already correct; the tenth was live.** Upstream's `EachBlock`
`assign` / `mutate` transforms set `uses_index` on the owning block, forcing the `$$index`
callback parameter even where nothing reads it, and they reach the item through `scope.get`;
rsvelte looked the root up in `each_item_name_flags` by NAME, at two sites (the typed and the JSON
assignment paths), so a handler declaring `let row = …` over the item emitted a `$$index`
parameter official does not. That divergence is **client-only** — the server emits no such
parameter — so a probe run on one target would have scored it clean.

Two things the battery is worth for beyond the one defect. **The nine passes are now a measured
`[D]`, not an assumption**: `store_assign_ast`, `store_update_ast`, `store_member_mutate_ast` and
`store_unsub_wrap_ast` carry 37 `&[String]` parameters between them and answer correctly anyway,
because a `$`-prefixed name cannot be redeclared in Svelte and the plain store name is not what
they key on. And the flag site is **not** an `*_ast.rs` pass — it is in the expression converter —
so the "44 passes" denominator this row keeps quoting is not the population. Grep for the
question, not for the file naming convention.

**Crossing the entry point multiplied the yield.** A generated matrix — 6 binding kinds x 6 entry
points x 5 shadow shapes, 165 inputs x 4 targets — reported **72** divergences on its first run,
against 1 for the ten hand-written probes that varied only the binding kind. Three causes, and the
first is closed: the expression converter's shadow set held a bare `let` and a function parameter
and nothing else. Its registrar said so — *"destructuring patterns are ignored (they rarely shadow
a prop name and the code is cleaner without the extra complexity)"* — and a `catch` clause and a
`for…of` head bound nothing at all. **A comment recording a deliberate simplification is the same
hiding place as a comment asserting fidelity.** Closing it took 72 to 48, and the reusable part is
that all three constructs bind for their body only and must hide **both** the read transform and
`shadowed_prop_names`: the pre-existing `for…of` code removed the transform and not the second, so
a prop read inside the loop still became `$$props.v`.

The second is closed too, and it is the one with real-world reach.
`transform_legacy_state_declarations` finds `let <name> =` by text, and its caller hands it one
top-level instance statement at a time — so `function go() { let v = …; }` arrives as a single
input and the LOCAL declaration was lowered to `$.mutable_source`, allocating a signal per call.
Upstream promotes only a top-level `let`, so the rewrite is refused unless the match sits at the
statement's own brace depth. **Every other shadow fix in this batch moved 0 of 34,728 corpus
entries; this one moves 3**, and takes `musicat/src/lib/views/AlbumsView.svelte` from a listed
failure on `client` and `client-dev` to a 4-target match. Reachability is a property of the
defect, not of the class.

The third is the reason this row keeps a **server** paragraph, and it corrects a claim an earlier
draft made here. That draft called the 44 remaining divergences "one cause, outside phase 3";
**8 of them were phase 3**, in a port this row had not looked at. `server/ast/read_wrap.rs`
decides whether an identifier read is a derived / store binding from a `shadowed` stack, and its
own doc comment says the stack is populated "from function / arrow parameter patterns (the only
shadowing the store-cluster fixtures exercise)" — the second deliberate-simplification comment in
one row, and the second one to be load-bearing. A `catch` clause, a `for…of` / `for…in` head and a
`for (let …;;)` head bind names and none was collected, so `catch (v) { v.n = 2 }` emitted
`v().n = 2` and `for (let v = 0; v < 2; v++)` emitted
`for (let v = 0; v() < 2; $.update_derived(v))` — a runtime helper called on a loop counter. The
client had been fixed for the same five shapes one commit earlier and the server had not, which is
the row's own subject: **fixing one port is not fixing the question**, and only a probe that
compares all four targets separates the two. Blast radius 0 of 34,728 corpus entries on `server`
and `server-dev`, and the four hunks are independently necessary (ablated one at a time: 6 / 2 /
2 / 4 divergent lines).

**The predicate this row introduced then over-fired, and what caught it was a unit test rather
than any gate here.** `reference_is_plain_local` asks the `scope_root` bindings which one owns a
reference and whether its kind is `Normal` — and phase 2 records a **second, `Normal`** entry for a
rune declared inside a template expression's function body (the #3233 shape). So
`let counter = $state(1); counter = 2` in an event handler answered "plain local",
`try_transform_assignment` bailed, and the fallback emitted `$.set(counter, 2, true)` where
official emits `$.set(counter, 2)`. **The corpus could not see it**: the client hash sweep moved 0
of 34,728 entries across the whole series, and `template_function_rune_3233.rs` — a committed
repro from an earlier fix — is what went red. A property gate and a corpus are both populations;
a test written for the shape is not.

The discriminator is the scope chain: a component binding is declared at instance depth and a
local signal one function deeper, so the veto is `State` / `RawState` / `Derived` at
`function_depth >= 2`. **Restricting it to those three kinds is load-bearing** — the first
narrowing vetoed on any nested non-`Normal` binding, which is also true of an each item, and put
the `$$index` parameter back on the repro two rows above. A predicate fix needs the whole set of
repros the predicate serves re-run, not only the one that failed.

**A sweep of the shadow shapes the 165-probe matrix did NOT enumerate then found the same question
answered wrongly in THREE more places at once, and the count is the point: `const f = function v() { … }`
binds `v` inside its own body, and every implementation that had to know said otherwise.** `server/ast/read_wrap.rs` never put the
id in its frame; `client/ast_state_transform.rs` carries a comment saying named function
expressions "bind only in their own scope, so they are excluded" — correct about the *enclosing*
scope, and it then never declared the name in the function's own scope either; and the template
walker's `LocalScope` collected parameters and block declarations and not the id. So `typeof v`
came out `v()` on the server, `$.get(v)` in the instance script and `$$props.w` for a shadowed
prop, with the instance script and a template event handler being two separate ports of the client
half. Each hunk is independently necessary (2 / 4 / 2 divergent lines ablated one at a time) and
the blast radius is 0 of 34,728 corpus entries on all four targets. **A row that says "two ports" is a lower bound
until somebody counts**; the sweep that found this one also found `for (let v = 0; …)` above, and
neither shape was an axis value the generated family's author wrote.

Three things that sweep turned up are recorded rather than fixed. A named **class** expression is
the same shape and **upstream emits output no JS parser accepts** for it — `const C = class $.get(v) {`
on the client and `class v() {` on the server, both rejected by acorn — while rsvelte emits the
correct `class v {`; that is
[`upstream_issues/svelte-named-class-expression-shadowing-a-rune-emits-unparseable-output.md`](../upstream_issues/svelte-named-class-expression-shadowing-a-rune-emits-unparseable-output.md),
and no pattern-corpus file can carry it while byte equality is the goal. `function $y() {}` is
rejected by official with `dollar_prefix_invalid` and accepted here — the over-acceptance shape,
in phase 2. The opposite direction turned up too: upstream creates no scope for a class
`static {}` block, so `class C { static { const v = 2; … } }` beside a top-level `let v` is
rejected with `declaration_duplicate` while a method body, a function body and a plain block all
compile — legal JavaScript refused, which no collected corpus can hold either
([`upstream_issues/svelte-class-static-block-shares-the-instance-scope.md`](../upstream_issues/svelte-class-static-block-shares-the-instance-scope.md)). And a `$derived` name reused as a **destructured default parameter**
(`function go({ v } = { v: 0 })`) made the client emit
`function go(($$value) => { v = $$value.v; return $$value; })({ v: 0 }) { … }` — text no parser
accepts, with the component's own `$state` / `$derived` declarations left unlowered beside it.
`destructure_transforms.rs` finds a destructuring assignment by scanning for `} =` / `] =`, and
its one guard asks "is this inside ANOTHER pattern" — which a formal parameter list is not. What
separates the two spellings is the enclosing paren: a parameter list's `)` is followed by `=>` or
by the body's `{`, and a control-flow head is the one other paren that closes before a `{`. That
is fixed.

The next defect in the same scanner was `is_standalone`, and it is the sharpest statement of what
this row is about: upstream computes it as `context.path.at(-1).type.endsWith('Statement')` — a
**parent node type** — while rsvelte read the punctuation around the expression, which recognizes
an expression statement and nothing else. So every other statement whose child the assignment
actually is kept a trailing value: `if (({ v } = o))` came out `if (($.set(v, o.v, true), o))`
against official's `if (($.set(v, o.v, true)))`, and where the right-hand side is cached the IIFE
gained a `return $$value;` official does not emit. The population is not one shape — ten head
slots (`if` / `while` / `do…while` / `switch`, all three `for` slots, `return`, `throw`), three
keyword-introduced statement bodies (`else`, `case …:`, `default:`) and a redundant paren layer,
38 divergent comparisons over 33 probes. It is fixed by asking the same question from text, and
**three things about that translation are worth keeping**. A redundant paren layer is no node at
all — acorn drops it — so every layer has to be asked the question *innermost first*; peeling the
layers off before deciding strips the head's OWN parens and loses `if (({ a } = o))`, which the
first version did. The rule is not "a `)` follows": `if (1 && ({ a } = o))` closes on the same
`)`, so a head slot has to be delimited on **both** sides — by the head's own parentheses or by
the `;` between two `for` slots. And a `:` is a statement boundary in `case …:` / `default:` and
an expression's punctuation in a ternary or an object property, which is decided by scanning back
for the keyword at depth 0 rather than by the character. The one thing a text rule still cannot do
is name the node: `foo(({ a } = o))` and `if (({ a } = o))` differ only in the token before the
paren, so this stays an approximation of a parent-type test, not the test.

Underneath that scanner sits a plainer question the same row keeps asking — **which statements bind
a name** — and the two client registrars each knew a different half. `ast_state_transform.rs` had a
`visit_function` arm declaring a function declaration's id in the enclosing scope and **no class
hook at all**; the template walker's `register_block_local_vars` matched
`JsStatement::VariableDeclaration` and nothing else. So `class v {}` inside a function read
`typeof $.get(v)` on both paths and `function v() {}` inside an event handler did too. Both are
fixed. What sized the work honestly was refusing to price it off the three probes that reported
it: a grid of declaration kind (`function` / `class` / `let` / `const` / `var`) × where the
reference sits relative to the declaration × host (instance-script body / template handler /
prop-named binding) is **30 divergences over 96 comparisons**, against the 6 divergent lines the
original probes showed. The declaration-kind fix takes 12 of those; the residue is two further
causes, recorded rather than claimed. **Hoisting**: the instance-script port declares a name when
the walk reaches it, so `const r = typeof v; function v() {}` still reads the component binding —
upstream resolves against a scope that already holds every declaration of the block, and the same
is true of `let` and `var`, which is why the residue is 12 comparisons and not just the function
one. The template port already pre-scans its block, so this half is one port, not two. And **`var`
is function-scoped**: `{ var v = 2; } return typeof v;` binds `v` in the enclosing function, while
every registrar here treats a block's declarations as the block's — that one is 6 comparisons and
is the only member of this family that **also reproduces on the server**.

The hoisting half is fixed too, and the interesting part is what the repro found rather than what
the fix does. `ast_state_transform.rs` now registers a block's declarations in a pre-pass over the
statement list, through the same method the walk uses — a second copy of "which declarations
register no names" is exactly the shape this row exists to catch, so the `$props()` guard is
extracted from the rewrite that owns it and both callers read it. All four declaration kinds are
registered, not only the genuinely hoisted `function` / `var`: a read above a `let` or a `class` is
a TDZ error, but upstream still resolves it to the local, and byte equality is the goal. Ablated,
the variable half and the function/class half are 6 comparisons each. **And the repro's first draft
found a live defect in a third port that none of this touches**: rsvelte wraps `console.log(a)` in
`$.log_if_contains_state` for a handler-LOCAL `a`, where official wraps only an argument that
references a component binding — `const a = 1; console.log(a)` reproduces it with no shadowing
anywhere, and `console.log(v)` on the real `$derived` matches, so the divergence is
over-instrumentation of a local rather than a scope-resolution error. It is dev-mode only, it is
not in any probe set written for this row, and it is recorded here rather than fixed.

The `var` half closes the family, and it is the largest single instance this row has produced.
A `var` outlives its block, so `{ var v = 2; } typeof v` resolves to the local — and **all three**
phase-3 shadow registrars scoped it to the block. The server's `read_wrap.rs` carried the tell:
its `collect_block_decl_names` doc said collecting `let`/`const`/`var`/`function`/`class` "at every
block boundary is conservatively correct", which is false for exactly one of those five, because
the frame is *popped* when the block ends. **A comment asserting fidelity is where this class
hides** — the same shape as `assign_dev_ast.rs:56` and the server rune table. The grid put every
`var` site except a function's own top level wrong on client and server: a block, an `if`
consequent, a `for` init, a `for…of` head, a `try` block, a `case` arm, a `while` body, a doubly
nested block — **42 of 56 comparisons**, against the 6 the original probe showed. Ablated per port:
18 server, 18 instance-script, 8 template. The server and the instance-script pass walk the same
oxc AST and asked the same question, so they now share one `shared::hoisted_vars` walk instead of
a copy each; the template port reads the phase-3 IR and keeps its own, documented as the twin.

Two things it leaves. The negative control is load-bearing and is what stops the fix from being
"collect every `var` anywhere": a `var` inside a **nested function** must not leak out, so the walk
declines to enter a function or class body. And the residue names a **fourth** answer to this row's
question: `for (var v = 0; v < 1; v++)` in a template handler now reads `typeof v` correctly while
`v++` still lowers to `$.update(v)`, because that decision is made in `expression_converter.rs`
from `reference_is_plain_local` — a predicate driven by **phase 2's** scope data rather than by any
phase-3 registrar. Three registrars agreeing does not make the compiler agree with itself.

The `console.log` over-instrumentation noted above was then sized the same way, and it is **three**
sub-causes rather than one. Upstream wraps a dev `console.<method>` only when an argument is a
spread or `scope.evaluate(arg).has_unknown`, and its identifier case evaluates a binding's
initializer when `!binding.updated` — the test is whether the name is ever **written**, not whether
it is `const`. `console_wrap.rs` collected verdicts only from a `const` declaration, and its own
comment said so: "every other local binding (parameters, lets, duplicate const names) is UNKNOWN to
upstream's evaluator". That is fixed, with the reassignment controls — a `let` later assigned, a
`let` incremented, a `let` with no initializer — all still wrapping, which is what separates the
`!updated` rule from "treat every local as known".

The two that remain are recorded rather than claimed, and they are on either side of this row's own
axis. A **template** handler's locals are invisible to `args_need_wrap`, which evaluates against the
component scope with no local bindings at all — so `const a = 1; console.log(a)` in an event handler
is wrapped while the byte-identical script-path source is not; that is a second port of the same
predicate, and the script path is the one that already has the answer (`LocalConsts`). And a global
call is `NUMBER` to upstream's `globals` table (`Math.random()`, `Number('3')`) and UNKNOWN here —
the same gap #3539's residue records for the constant folder, reached through a different caller.
Measured together: 5 divergences over a 116-comparison grid of argument shape x host.

The globals half is now fixed, and it is the first change in this campaign whose blast radius is
**not zero** — which finally gave the corpus sweep the positive control every "0 of 34,728" above
was missing. It moves exactly one entry, `ha-fusion/src/lib/Main/ConditionalMedia.svelte`, and it
moves it *toward* official: `const remainingSeconds = Math.round(remaining / 1000)` is NUMBER
upstream, so the `console.debug` of it is not wrapped. (The file stays a listed client-dev failure
for an unrelated comment-placement reason; this removes one line of its divergence.)

Three things it cost. **A membership test that only ever feeds a fold cannot be checked by the
fold**: `is_global_keypath` matched any `Math.` prefix, so `Math.notAThing` was a global here and
UNKNOWN upstream — invisible for as long as the only consumer folded (both answer unknown) and
wrong the instant one reads the TYPE. It is now upstream's exact 46 keys. **The shadow test has to
be by scope, not by name**: `const Math = { … }` in one function silenced `Math.random()` in every
other, which is the same name-vs-scope hazard the lint campaign recorded one level down; the
reference-position set answers it exactly. And **phase 2 records function-locals in
`root.bindings`**, so the analysis-side name lookup had to be confined to the module and instance
scopes — the reference set already covers everything below them.

That leaves the template-handler half, and probing it showed the sub-cause is **not** in phase 3 at
all: for `onclick={() => { const a = 1; … }}`, phase 2 records `a` with `initial: None` — twice,
once in the arrow's own scope and once in the root FRAGMENT scope — so no phase-3 evaluator could
answer it correctly even with the right scope index. It is recorded here as phase 2's, alongside
the `reference_is_plain_local` residue above.

The 36 that remain are one cause, **in phase 2**, and every one is `client` or `client-dev`. A
write through a `catch` parameter or a `for…of` binding is recorded on the *component's* binding,
which shows up as a different `$.prop` flag word (24 vs 28, 19 vs 23), a `$$ownership_validator`
upstream does not emit, and a store declared as `$.mutable_source(writable(…))`; recorded here
rather than fixed.

The remaining ~28 text-keyed passes are **未測定**. Degree 3 is available here and is the right
shape for it: "no rewrite pass claims an identifier that resolves inside its own input" is a
property, not a comparison, so the corpus becomes the detector at whatever size it is.

**That gate now exists — `RSVELTE_ASSERT_SIGNAL_DISCIPLINE`
(`3_transform/client/signal_discipline.rs`) — and what it cost to make it discriminate is worth
more than the gate.** The first formulation asserted that no signal sink's first argument may
resolve to a symbol the same program declares as a plain value. It reported 9 violations on the
corpus, of which 4 components are byte-identical to official; narrowing it until the corpus
reported 0 took two rules — a `const` cannot be judged, because upstream emits `const st = 1`
beside a `$.set(st, …)` in the accessor generated for `export const st = $state(1)`, and an
initialiser that is an identifier cannot, because `let i = $$index_4` receives a signal. **A
property gate that reads 0 on the corpus is exactly what a property gate that sees nothing reads,
and this one saw nothing**: ablating the five shadow guards above and recompiling this row's own
repro produced `$.mutate(stats, …)` / `$.set(count, 1)` / `$.update(count)` with the gate armed
and silent, because `stats` and `count` are *parameters* of a user callback and the rule skipped
every parameter as unknown provenance. The defect's own container was inside the exclusion.

Two changes make it discriminate, and each is a distinction the first version collapsed. A
parameter is unjudgeable only when its function is **passed directly to a runtime helper** —
`$.each(…, ($$anchor, item, $$index) => …)` really does hand over signals — and that is not
answerable by nesting depth, because `$.set(s, xs.reduce((acc) => …))` puts a user callback inside
a runtime call's argument. And a prop write has its own sink: the generated shape is
`name(name().x = v, true)`, so that callee must be a `$.prop` / `$.rest_props` accessor. Ablated,
the gate now reports all six wrong writes across the two repros; restored, it is silent on all
three.

**Its first clean run found a live defect, in a file no output gate could have reported it from.**
`sparrow-app/…/TeamSidePanel.svelte` has `export let data` shadowed by a `let data = await …`
inside a template event handler, and rsvelte emitted `data(data().isNewInvite = false, true)`
where official emits `data.isNewInvite = false`. That id is already a listed entry on
`known-failures.{client,client-dev,server}.json` for two unrelated divergences (a scoping class
argument, a lost comment), so the output ratchet suppressed this one — the
"a ratchet entry suppresses everything its key cannot tell apart" rule, observed from the other
side. The fix is the same shadow question one entry point over: an event handler's body is
lowered by the expression converter, whose scope is the *template's*, so the name lookup reaches
the prop. It is **two** lowerings — `try_transform_assignment` and `try_transform_update` — and
fixing only the first left `data.count++` wrapped, which the gate then reported against the
repro written for the first half.

**The predicate is the part to copy carefully.** `reference_is_shadowed_non_prop` reads like the
right question and is not: it is true of a top-level `$state` too, because every kind but a prop
counts as "not a prop" there. Using it as the bail changed **736** corpus outputs, 724 of them
files that were passing, turning `$.set(layout, "…")` into `$.set(layout, "…", true)` across the
corpus. `reference_is_plain_local` — the reference uniquely belongs to a `BindingKind::Normal`
declaration — changes exactly **1**, the file the gate flagged, with 0 violations over 34,728
entries × client + client-dev.

What the gate cannot see is the **read** side, and that half had to be found by reading the fix
rather than by running it: in the same handler `items.selected = data` emitted
`items(items().selected = data(), true)` where official emits `data`, because the RHS is
transformed eagerly — before the outer walk that would have built a scope for it — with an empty
`LocalScope`. A read has no sink, so no signal-discipline violation exists to report.

**The position for a read cannot come from where the write's came from.** `JsExpr::Spanned` is
attached only when `enable_sourcemap` is true (`expression_converter.rs:156`), so keying a codegen
decision on it would make the generated program depend on whether a map was asked for — the same
option split that hides regressions from CodSpeed. An expression has many identifiers and the
converted `JsExpr` carries none of their positions, but its **source range** is on both paths, so
the bindings are asked which plain locals they declare inside it
(`plain_local_names_in_range`). Reachability of the read half is **0 of 34,728 corpus entries**:
correct, and it moves no real-world output.

**A name the scope builder never walks cannot shadow anything, and that is where this row's
question is decided.** Upstream's `create_scopes` walks a binding pattern's DEFAULT like any other
expression, so `let { search = async (input) => … } = …` opens a scope for the arrow and
`scope.declare` puts `input` into `root.conflicts`. rsvelte's `process_binding_pattern_typed`
read an `AssignmentPattern`'s `left` and dropped its `right` — so the default's declarations and
its reads reached nothing, and `$.delegated('input', …)` in dev generated `function input()`
where upstream deconflicts to `function input_1()`
(`svelte-material-ui/packages/autocomplete/src/Autocomplete.svelte`). The default has to be
walked AFTER the pattern rather than inside it, because the `$props()` arm applies `init_rune` to
the `self.bindings[first_new..]` slice and an arrow parameter declared mid-pattern would land
inside it.

Two things generalize. **A function parameter's default was already right, for the wrong reason**:
`input` reached `root.conflicts` through the unbound-global collector in `2_analyze/mod.rs`, which
scans the script for identifiers that resolve to no declaration — a coincidence that made
`function f(g = (input) => input)` and `let { g = (input) => input }` look like one covered case
when they are two, and the grid had to cross the two slots to tell them apart. And **the oxc twin
of this walk is dead code**: `process_binding_pattern` has the identical one-line omission, but
`process_program` is reached only when a script's content is not `Expression::Typed`, which
`resolve_lazy_expressions()` rules out. Measured rather than argued — 0 of 2000 corpus components
reach it, with the positive control (disabling the typed fast path makes the marker fire) showing
the instrument can report. The twin is left unfixed and recorded here rather than changed
unmeasured.

**This row's question has THREE ports in the client, not two, and the third had no
guard at all.** An `UpdateExpression` is lowered by `convert_update_expression` (the JSON
path), by the typed arm of `convert_js_node`, and by `try_transform_update`. The second and
third both refuse a name whose reference at that position belongs to a plain local
(`reference_is_plain_local`); the first went from `extract_identifier_name_from_json` straight
to `context.state.transform.get(&name)`. So `var v = 0; while (v < 1) { v++; }` inside a
template handler, in a component that also has `let v = $derived(base)`, emitted `$.update(v)`
against the component's signal. Ablating the added test takes a 16-cell grid from 4 to 6 and the
repro from 0 to 2 of 4.

**Finding the third port took a backtrace, and that is the reusable part.** Instrumenting the two
known call sites reported nothing, and so did every `format!("$.update(…)")` in the client — five
sites, all silent. The producer was found by putting a `Backtrace::force_capture()` in
`b::svelte_call` when its method is `update`. **Enumerating the sites that look like the
answer is not enumerating the sites that produce the output**; the output string is the only
key that cannot miss one.

The residue is a different cause and is recorded rather than claimed: for a `var` declared in a
`for` HEAD, phase 2 creates the local binding (kind `Normal`, the arrow's scope) but leaves its
reference list **empty**, and the component's `Derived` binding owns the handler's positions —
so a position-keyed test cannot separate them no matter which port asks it. Two of the 16 cells
stay red.

#### 22. How is an inline `$props()` type hoisted to `$$ComponentProps`? — [D]

**Upstream:** one branch of `handle$propsRune`
(`svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts`, the "Easy mode" arm). It takes
`node.initializer.typeArguments?.[0] || node.type` — so the **type-argument** form
`$props<{…}>()` and the **type-annotation** form `let {…}: {…} = $props()` are the *same*
`generic_arg` — and relocates it with `preprendStr` + `appendLeft` + **`this.str.move(...)`** +
`appendRight(surroundWithIgnoreComments('$$ComponentProps'))`. Because the type text is *moved*
rather than re-emitted, every character of the hoisted alias keeps its magic-string mapping.

**Ports.** Both in `rsvelte_projection` `svelte2tsx/script/props_rune.rs::apply_props_typedef`,
selected by which flag the same upstream `||` collapses:

- `HAS_TYPE_ARG` (`props_rune.rs:126-150`) mirrors upstream: `prepend_right` + `append_left` +
  `append_right`, and signals `props_type_arg_hoist` so `process_instance_script_tag.rs:321`
  performs the `move_range`.
- `TYPE_ANNOTATION | HOISTABLE_TYPE` (`props_rune.rs:154-176`) does **not** move anything. It
  `overwrite`s the annotation away at its original site and the alias is re-synthesized as fresh
  text by `format!` at `process_instance_script_tag.rs:177` / `:199` / `:356`.

**Demonstrated.** Two inputs that differ only in which spelling of the same type upstream's `||`
picks, both `is_ts_file: true`, counting map segments on the generated `$$ComponentProps` alias
line:

| input | generated alias line | segments | mapped columns |
|---|---|---|---|
| `let { a } = $props<{ a: number }>()` | `type $$ComponentProps = { a: number };…` | **15** | 35/59 |
| `let { a }: { a: number } = $props()` | `;type $$ComponentProps =  { a: number };…` | **0** | 0/61 |

The generated **text** matches upstream in both cases, which is why the svelte2tsx text gate is
green on them; the divergence is confined to the map. And the map gate cannot see it either — it
asserts rsvelte's map is *structurally well-formed*, not equal to official's, because the two are
segmented too differently to diff. So a diagnostic anywhere in an inline-annotated props type
resolves to the wrong source position, and nothing in the tree reports it.

**Not closed.** Degree 1 is available in principle — the annotation arm can take the
type-argument arm's `move_range` path — but it changes which chunk the `;` markers travel with,
which is exactly the ordering `process_instance_script_tag.rs:301-310` comments as load-bearing,
so it needs the corpus svelte2tsx text gate rather than a unit test alone.

#### 23. What compiler options and shim files does the shadow program get? — [D], **closed**

**Upstream:** two functions. `plugins/typescript/service.ts`'s `createLanguageService` forces
`target: ts.ScriptTarget.Latest` when the project declares none and raises anything below ES2015
to ES2015 (`:792-795`), and builds its no-project fallback with `include: []` "to not flood the
initial files" (`:874-878`). `svelte2tsx/src/helpers/files.ts`'s `get_global_types` (`:15-27`)
names the shim set: `svelte-shims-v4.d.ts` and `svelte-native-jsx.d.ts` always, the project's own
`svelte-html.d.ts` when the installed Svelte 4+ has one, and `svelte-jsx-v4.d.ts` **only as the
fallback for a package that does not**.

**Ports.** `rsvelte_language_server` `tsgo_overlay.rs::write_tsconfig` /
`materialize_support_files`, and `rsvelte_check` `svelte_check/overlay.rs`.

**What made this row worth keeping open is that the two ports were behind each other in opposite
directions.** The `target` and `include` rules were missing from both, and the language server was
given them first — deliberately, and recorded here as an asymmetry rather than left silent.
Measured on three mini-workspaces against the live official server, completion at a script-body
position:

| workspace | official has `Temporal`/`DisposableStack`/`AsyncDisposableStack`/`SuppressedError`/`svelteNative` | rsvelte LSP before | rsvelte LSP after |
|---|---|---|---|
| no `tsconfig.json` | all five | none | all five |
| `target: ES5` | `svelteNative` only | none | `svelteNative` only |
| `target: ESNext` | all five | four (no `svelteNative`) | all five |

The `include` rule is the largest of the three by effect: with no project config rsvelte pulled
every `.d.ts` in the repository into the program, so bits-ui's own `declare global`s
(`bitsEscapeLayers` and five siblings) were offered as completions at **55 of 285** sampled
script-body positions where official offers nothing.

Then the *shim* rule turned out to run the other way: `rsvelte_check` had
`get_global_types`'s `svelte-html.d.ts` condition and no `svelte-native-jsx.d.ts`, while the
language server had `svelte-native-jsx.d.ts` and shipped `svelte-jsx-v4.d.ts` unconditionally —
each port holding the half the other lacked. **A port being ahead on one rule is no evidence
about the next rule**, so an inventory row is closed by the whole function, not by the rule that
motivated it.

**Closed** by one `rsvelte_check::overlay::global_type_files` that both ports call, and one
`SHIM_FILES` they both materialize. The shim half measures **zero** on the LSP corpus: swapping
`svelte-jsx-v4.d.ts` for the project's `svelte-html.d.ts` left every completion label at 25
bits-ui components byte-identical, because both shims take their element vocabulary from the
installed `svelte/elements`. The positive control is an ablation — removing *both* from the
tsconfig's `files` takes an `<svg>` attribute position from 640 items to 0, and restoring them
returns 640 — so the file does reach the program and the null is about the two shims agreeing,
not about the change not landing. `check-known-failures.json` moves with this
(`rsvelte_check`'s shim set gains `svelte-native-jsx.d.ts`).


#### 24. May an element whose attribute value is indeterminate match a selector naming that value? — [D], one of six pairs closed

**Upstream:** `css-prune.js` `attribute_matches` — one function. A value it cannot enumerate at
compile time (an expression, a spread) returns `true`: the element may carry anything, so it
satisfies any selector naming that attribute.

**Ports — four, all in `3_transform/css.rs`, and they answer for different attributes:**

| # | port | `class` indeterminate | `id` indeterminate |
|---|---|---|---|
| 1 | `selector_matches_element` | per element (`has_spread \|\| dynamic_attribute_names`) | **had none** → fixed here, same rule |
| 2 | the element matcher inlined in `is_parent_chain_unused` | coarse: `ctx.has_dynamic_classes` gates the whole component | **had none at all** → fixed here, per element |
| 3 | `structural_element_matches_attribute` | per element, plus `has_class_directive` | per element — already correct |
| 4 | `is_simple_selector_unused` | coarse: `ctx.has_dynamic_classes` | coarse: `ctx.has_dynamic_ids` |

**The demonstrated divergence is the `id` column**, and the inputs are in
`pattern-corpus/issues/a-dynamic-id-matches-any-id-selector.svelte`. With `<div id={expr}>` in the
component, official keeps all four of `#absent + .b`, `#absent ~ .b`, `.host:has(#absent)` and
`#absent { .under { … } }`; before the fix rsvelte pruned every one, and the fourth as a whole
`(empty)` rule rather than the nested selector official drops. Ports 1 and 2 are why: a sibling,
a `:has()` argument and a `&` compound reach #1, and a parent prelude reaches #2.

**The controls are what make this a two-*ports* row rather than an id bug.** The same component
with `class={expr}` matched official *before* the fix — port 1 already had the class escape — so
the two attributes were being answered by one function under two different rules. And an absent
**static** id still prunes on all four shapes after the fix, which is what an over-wide escape
would have broken.

**What is closed:** ports 1 and 2 now agree with 3 on `id`.

**Port 4 was measured on 2026-08-31 and is a different kind of port from 1–3.** Its two callers
(`css.rs:1981`, `css.rs:2010`) are an early-out *screen*: a `true` declares the whole rule unused
without consulting the real matcher, while a `false` is non-binding and falls through to it. A
whole-component flag is therefore strictly more conservative than upstream's per-element rule at
the only step where it is consulted — it can make the screen keep more, never prune more. Seven
constructed inputs crossing {dynamic id, dynamic class, spread, static} × {simple `#absent`,
simple `.absent`, `span#absent`} all MATCH, and the probe has a moving control on the axis in
question: with a dynamic id in the component neither compiler warns, without one both emit
`css_unused_selector` at the same position.

**Probing what that does NOT close found the live one.** The screen prunes on
`!used_ids.contains(…)` / `!used_classes.contains(…)`, so the risk sits in how those two sets are
*built* — and there the two attributes are answered by different code. `class` goes through
`css::possible_class_names` (rsvelte's port of upstream's chunk expansion over
`get_possible_values`); `id` has a bespoke branch in `2_analyze/visitors/shared/element.rs:414-438`
that marks **any** expression indeterminate. Upstream runs one expansion for both, with `is_class`
controlling only whether array/object expressions are inspected.

Measured, three diverging shapes and four passing controls:

| `id` value | official | rsvelte |
|---|---|---|
| `id={c ? 'a' : 'b'}` | prunes `#zzz` | keeps it |
| `id={'a' \|\| 'b'}` | prunes `#zzz` | keeps it |
| `id={'a'}` | prunes `#zzz` | keeps it |
| ``id={`ab`}`` | keeps | keeps — upstream cannot enumerate it either |
| `id="a{x}"`, `id={x}` | keeps | keeps |
| the same four shapes spelled with `class` | — | **all four match**, including the three above |

It is an over-keep, so it costs CSS size and a missing `css_unused_selector`, not rendering. Fixed
in the same lane: `possible_class_names` is now `possible_attribute_values(value, is_class)` and
`id` calls it, with the whitespace split kept as `class`'s own step.

**The `class` column was then probed the same way and came back clean.** Seven shapes crossing
{`class={dyn}`, a spread, a `class:` directive, nothing} × {nested rule, descendant combinator,
the indeterminate element IS the ancestor} × {`class`, `id`}, each placing the indeterminate
element where a per-element rule and a whole-component flag must disagree — as a **non-ancestor**
of the subject. All seven MATCH, and the probe is strongly discriminating: its verdicts range over
`[]`, one warning, two warnings, and three different CSS bodies (`(empty)`, `(unused)`, kept with
a scoping hash). **What is not established is why**: port 2's coarse `has_dynamic_classes` does
not surface on any of these, and no measurement here says whether that is because the flag is
never binding for `class` or because these seven shapes miss the arm. Recorded as measured-clean,
not as explained.

#### 25. Does this reference warrant `state_referenced_locally`? — [D], both ports still live

**Upstream:** one branch, `2-analyze/visitors/Identifier.js:104-152`. Its three parts are the
depth equality `state.function_depth === binding.scope.function_depth`, a binding-kind arm (a
`$state` warns only when it is `reassigned` **or** its initial argument fails `should_proxy`), and
a read/write test on the parent node.

**Ports — two, and the second exists because the first is unreachable from where it is needed:**

| # | port | depth equality | kind arm | scope searched |
|---|---|---|---|---|
| 1 | `2_analyze/visitors/identifier.rs` | yes | full, incl. `should_proxy`-equivalent on `initial_node_type` | the reference's own binding |
| 2 | `2_analyze/visitors/declaration_tag.rs::warn_local_state_reads` | **none** | kind set only (`State \| RawState \| Derived`) | `analysis.root.scope.declarations` |

Port 2 carries a comment stating why it exists — "rsvelte's main Identifier visitor … does not run
on declaration tags" — which is true, and is exactly the shape this file warns about: a comment
asserting fidelity reads as a citation.

**Measured divergence (2026-08-31).** A `{let a = $state({ x: 1 })}` that is never reassigned,
read synchronously by `{let b = a}`: official is silent (`should_proxy` is true, so the read still
sees the proxy) and rsvelte warns. Same for `$state([1])`. Port 1 answers these correctly; port 2
has no `should_proxy` arm at all. Not reachable from any collected input — 0 of the 4,201
`submodules/svelte` units diverge — so only a constructed probe finds it.

**Sharing the kind arm was tried and reverted, and the reason is the reusable part.** Pointing
port 2 at port 1's rule fixed both cases and **broke three** that were correct: `{let a = $state(1)}`
read by `{let b = a}` stopped warning at the top level, inside `{#if}`, and in the file's own
control. `binding.initial_node_type` is not populated for a declaration-tag binding the way it is
for a script one, so the shared predicate's `should_proxy` arm answers `false` where port 2's
kind-only test answered `true`. **Two ports can disagree because they read different *inputs*, not
because they encode different rules** — and a shared predicate then silently inherits whichever
input is missing. Closing this row means populating `initial_node_type` for declaration tags
first, and the port-vs-port test has to spell its expectations independently (degree 2 below),
because port 2 as an oracle for port 1 passes on exactly the cases that are wrong.

**A third path emits it in neither direction, and this is a deliberate non-start.** Every template
expression other than a `bind:` goes through the lightweight walker
`shared/utils::walk_js_expression_node`, which never emits this warning at all. A template
expression can only warrant it for a binding declared *inside that expression* — an instance
binding is at a different `function_depth` — and every such slot was measured: an event handler
with an arrow block body, with `$derived`, with `$state.raw`, with a function expression; an
attribute-expression IIFE; a text-expression IIFE; a `use:` action argument; and the same inside a
snippet body and an each body. **Nine slots, one cause**, with the instance-script control
warning correctly on the identical source shape.

The blocker is named in the code: `shared/utils.rs:1517` states the walker "keeps no `js_path`",
which is also why rune-call validation there is narrowed to `function_depth == 0`. Upstream's
condition needs the parent node (to exclude an `AssignmentExpression` target and an
`UpdateExpression`) and walks `context.path` to choose the `closure` / `derived` message, so the
warning cannot be emitted from that walker as it stands. Closing it means either giving the walker
a `js_path` and extracting the decision into ONE function both callers use — degree 1, and the
only shape that does not add a third port — or routing template expressions through the Identifier
visitor. Either touches a hot path.

**Not started on purpose.** It is an *under*-warning: the generated code is correct, it occurs 0
times in the 4,201 `submodules/svelte` units, and no ratchet entry moves. Recorded here so the
next person inherits the boundary rather than re-deriving it.

**What is still unmeasured:** the depth equality. Port 2 has none, so every kind-eligible read in
a declaration-tag initializer warns regardless of where the binding lives; upstream realigns
`function_depth` to `state.scope.function_depth` for that visit specifically, which makes the
equality hold for a sibling declaration and not for anything shallower. No probe here separates
those, so the agreement on `Prop` / `RestProp` (which port 2 excludes and upstream admits) is
untested rather than correct.

#### 26. What ESTree object does the NAPI boundary hand a JS caller? — [D], **closed at degree 2**

**Upstream:** there is no counterpart. Official ships one `parse()`.

**Ports — two, and neither is a rewrite of the other.** `napi_parse` serializes the typed program
with `serde::Serialize` and returns a JSON **string**; `napi_parse_envelope` walks the same tree
with a hand-written binary writer (`rsvelte_bindings_support/src/napi_raw_parse.rs`) whose decoder
is a second hand-written walk in JavaScript
(`apps/npm/vite-plugin-svelte-native/parse-envelope.js`). Every node type is spelled three times:
a `Serialize` arm, a `write_*` arm, and a `readJs*` function. **No gate drives the envelope path
against the JSON path**, and the ~39 corpus gates all consume the JSON one.

**[D] — measured 2026-08-31.** Adding `attributes` to an import and the acorn-typescript omission
rule to the serializer left the decoder writing `attributes: []` where the JSON side omitted it:
3 of 8 constructed inputs disagreed between the two surfaces while the JSON side matched official
on all 8. The ablation is the control — restoring the rule takes it to 0/8, removing it again
returns exactly those 3.

Two things the measurement itself taught. **A `JSON.stringify` comparison of the two surfaces
reports 6 of 8 as divergent on an unmodified tree**, and every one of those six is key
**order** — the decoder assigns `value` before `name_loc` on a `<script>` tag's own `Attribute`
while the serializer emits it after. Order is invisible to a property access and to `parse()`'s
consumers, so a port-vs-port probe here has to compare structurally or it drowns its real signal
in noise it cannot act on. And the envelope carries a `VERSION` that both sides pin
(`napi_raw_parse.rs:74`, `parse-envelope.js:22`, plus `scripts/dev/test-parse-envelope-validation.mjs`):
a new node tag is additive for the writer and **fatal** for a decoder that does not know it, so
the version has to move with the tag or a stale decoder reads a byte it cannot dispatch.

**A tag can also be REMOVED, and that direction is not additive for either side.** Giving
`TSEnumDeclaration` its children moved it onto the generic `write_json_node` escape the other
retained TS declarations already use, so `JS_TS_ENUM_DECLARATION` is no longer written by anything.
A stale decoder paired with the new writer would in fact decode it correctly — the escape is
generic — which is exactly why the `VERSION` pin has to move anyway: the *shape* the JS side hands
its caller changed from a bare `{type,start,end,loc}` to the full declaration, and nothing but the
version distinguishes the two. **Read "additive for the writer" as a statement about dispatch, not
about the object a caller receives.**

**Closed at degree 2**: `crates/rsvelte_core/tests/import_export_parser_shapes.rs` pins the JSON
side against independently spelled expectations rather than against the envelope, so both ports
being broken the same way still fails.

**The envelope half is now pinned too, and where it went is the reusable part.** The obvious place
was a new gate; the working place was a job that already builds a binding —
`scripts/dev/test-vps-shim.mjs`, run from `ci.yml` right after `build:vps-native`. That file
already round-tripped the envelope, and its assertion was
`decodedAst?.type === parsedAst?.type` — **a port-vs-port comparison over one field**, which is
the shape this document warns about: both surfaces answer `Root` whatever else is wrong, and
adding a node tag to one port alone leaves it green. It now drives a `declare module 'x' { … }`
through **both** surfaces and checks four things about the `TSModuleDeclaration` on each — the
node type, the string `Literal` id and its offset, `declare` present with `global` absent, and a
`TSModuleBlock` body spanning the braces — against **offsets printed from official**, so the
oracle is neither port. Ablating `node.declare` from the JS decoder fails exactly one of the eight
cells (the envelope's) and leaves the JSON side green; a port-vs-port assertion would have passed
with both at `undefined`.

**What the pin still does not cover** is every other node type: eight cells over one construct is
degree 3 for `TSModuleDeclaration` and degree 2 everywhere else. The three-spellings-per-node
structure is unchanged, and a new tag still needs its `VERSION` bump by hand.


#### 27. Where in the DOM is a `{#snippet}` body rendered? — [D], two ports, answers now agree

**Upstream** answers once. `SnippetBlock.metadata.sites` is filled in a single pass over
`analysis.snippet_renderers` (`2-analyze/index.js:847`): a renderer whose callee resolves to a
local snippet is a site of **that block node** (`binding.initial`), a renderer that resolves to
nothing gets `node.metadata.snippets = analysis.snippets` and so is a site of **every** snippet,
and a renderer that resolves outside the component (a prop, an import) is a site of **none**.
`get_ancestor_elements` (`css-prune.js:845`) then reads that one set.

**rsvelte answers twice, and the two are not even subsets of each other.**

| | port A | port B |
|---|---|---|
| built by | `2_analyze/visitors/{render_tag,snippet_block,shared/component}.rs` | `css_scoping.rs:1432` `collect_render_site_ancestors`, its own template walk |
| read by | `3_transform/css.rs` `effective_parents` — pruning and scoping | `css_scoping.rs` `subtree_has_matching_subject` — ancestor scoping |
| a `{#snippet}` passed as an *attribute* (`<Comp foo={row} />`) | yes, since #4115's port-A fix | yes (`attribute_snippet_names:1415`) |
| an **unresolved** renderer is a site of every snippet | yes | yes, since #4115's port-B fix |
| resolves the callee through the scope chain | yes (`render_tag.rs:58`) | yes — port B now reads port A's `renderer_targets`, keyed by node |

**Discriminating input, and both answers are observable in ONE compile:**

```svelte
{#snippet row()}<span>x</span>{/snippet}
<div class="wrap">{@render row()}</div>
<style>.wrap span { color: red; }</style>
```

Port A says the selector is used, so the emitted CSS is byte-identical to official's. Port B says
this subtree holds no matching subject, so `.wrap` never receives its scope class. **One upstream
question, two answers, in the same output** — the CSS text and the template disagree about
whether that `<span>` is inside `.wrap`.

**Measured residue.** A 70-cell grid (snippet shape × render-site shape × `client`/`server`)
leaves **30 cells** diverging after port A was made faithful, and the *direction* splits: on 24
rsvelte scopes **fewer** elements than official (port B's `RenderTag` arm computes a name, tests
the map, and does nothing — `css_scoping.rs:2462`), and on 6 it scopes **more**, because port B
still keys by name and merges two same-named snippets in different scopes. That second half is
**the same defect port A was just fixed for**: fixing one port of a decision does not narrow the
other, and reporting the aggregate (`30 cells, all verdict JS`) hid the sign — the two directions
were only separated by counting scope classes on each side.

**The asymmetry runs both ways.** `attribute_snippet_names` (`css_scoping.rs:1415`) has no
counterpart anywhere else in the tree: until the port-A fix, port B was the **more** faithful of
the two on `<Comp foo={row} />`, and port A treated any non-literal attribute as making the
component unresolved. A second port is not reliably the degraded one, so "fix the port the bug
was reported against" is not a rule — read both before deciding which one moves.

**Why closing port B was not a transcription.** Upstream walks the tree while reading another
part of it; `propagate_ancestor_scoping` holds `&mut Fragment`, so Rust cannot take the immutable
borrow of a *different* snippet body from inside that walk. The port needs the decision lifted
into a prior immutable pass — the same shape as the graph pass forty lines above, which is the
row to compare it against rather than treating the extra pass as unique to this one. Port B's
mark collection is now a read-only walk into an `FxHashSet<(u32,u32)>` applied afterwards, and the
direct-match write is `|=` rather than `=`: a snippet body is walked once per render site and
`scoped` is the union over sites, so a second site that matches nothing was erasing the first
site's answer. Auditing every `metadata.` write in the file found `scoped` to be the only field
that walk sets, plus two monotone `= true` in `apply_scoping_marks`.

**The grid that drove the fix could not see the defect the fix introduced.** Its 70 cells were
built from the shapes port B got wrong, so every one of them was a cell that could only improve;
the residue read 68 match / 2 error-parity / 0 non-match while a corpus A/B moved a third file the
*wrong* way. `compatibility/pattern-corpus/issues/4115-snippet-cycle-ancestors.svelte` is that
shape, and it is the one file of the three #4115 repros that **matched on `main`**. A grid
assembled from failing cells has no cell left that can regress.

**The cause is one level below the port, and it took two attempts, because the recursion guard's
discipline is the semantics AND the complexity bound at once.** Upstream's `get_ancestor_elements`
adds a `SnippetBlock` to `seen` and never deletes it, so a snippet is expanded at most once per
resolution: that is what makes the answer a function of where the walk started rather than of the
snippet — hence unmemoisable — and it is also what keeps the walk linear. The first fix kept the
readable spelling, a `seen` unwound on the way out, and merely stopped caching the truncated
result. It is correct on every cell of the grid, on all three repros and on 121 release test
targets, and it **does not finish** on
`svelte.dev/apps/svelte.dev/src/routes/tutorial/[...slug]/+page.svelte`, which `main` compiles in
19 ms: a backtracking guard enumerates every acyclic path. **No output gate here can observe
that.** It is not a wrong answer, it is an answer that never arrives — the corpus sweep reports it
as a run that stops printing, and the only reason it was attributed at all is that the same sweep
had a completed predecessor to compare its rate against.

**Not [M].** Nothing compares the two ports to each other; the grid compares each to official, so
both ports failing the same way would score green. That is still true with the answers agreeing —
what closed here is a divergence, not the duplication. `is_resolved_snippet` was briefly a third
implementation of the neighbouring "does this callee resolve" question (`render_tag.rs` private,
`shared/snippets.rs` public); the two were read side by side, found to agree on all four
conditions in the same order, and merged into one — an inventory entry that was retired rather
than added.

**One more thing a reader of `css-prune.js` needs.** Its two neighbouring walkers treat
`SnippetBlock` **oppositely**: `get_ancestor_elements` (:845) `break`s the lexical path walk at
one and continues from the render sites, while `get_descendant_elements` (:907) has no
`SnippetBlock` case at all — the `_` catch-all calls `context.next()`, so it *does* descend into a
lexically nested snippet body, and only `RenderTag` is special-cased. A port that carries the
`break` intuition into the descending walker prunes real descendants; one that carries the
descending intuition upward invents ancestors.


### Adding a row, and closing one

**Finding a candidate.** Start from *one upstream function*, not from a rsvelte symbol. Grep the
Svelte submodule for a function with several importers, then find rsvelte's answer(s) and check
whether the callers split into independent paths. A rsvelte-side grep finds duplicated *names*;
it does not find the case where the second port was given a different name, which is the case
that hides.

**Two warnings that cost time here.**

A negative grep is not evidence. `grep` in this shell is a ugrep wrapper that skips gitignored
paths, and `cargo fmt` wraps comments across lines, so a multi-word literal needle encodes a
formatting assumption. **Put a positive control in the same invocation as the real needle** — a
different invocation cannot rule out that something changed in between.

A helper with many callers is **not** an instance. `js_scan::skip_opaque` (~30 callers) and
`clean_nodes` / `clean_nodes_refs` (two signatures over one body) were both checked and dropped.
The instance is two *separate* code paths each carrying their own logic.

**Closing a row** has three degrees, in increasing order of what it buys:

1. Make one port call the other. Removes the row.
2. Keep both and add a port-vs-port test with **independently spelled expectations** — the
   `typed_reactive_state_front_end_agrees_with_the_json_walk` shape. This is the only pattern in
   the tree today that defends the class.
3. Assert the property at runtime under an env flag and let the corpus find the violations, the
   way `RSVELTE_ASSERT_TRANSFORM_IDEMPOTENT` does. A property gate is bounded neither by a
   collected population nor by an author's axis values — which is why it found 37,352 violations
   in a corpus that scored 0 output divergences.

Degree 3 is worth reaching for whenever the decision is cheap to recompute, because it turns the
corpus you already have into a detector for this class **at whatever size it happens to be**.

<a id="ast-equivalence"></a>


#### 28. How is an element's attribute list rendered? — [D]

**Upstream:** one `Attribute.ts` (`packages/svelte2tsx/src/htmlxtojsx_v2/nodes/Attribute.ts`).
`handleAttribute` is called from the element handler and from the component handler alike, so
`numberOnlyAttributes`, the quoting rules and the shorthand rules are decided in one place
regardless of what the element is nested inside.

**Ports.** rsvelte has two, and they are not two spellings of one function — they emit different
*types*:

- `append_attribute_node_segments`
  (`template/attributes/attribute.rs:476`) builds `Seg`s, so it carries source positions into the
  map. This is the element path.
- `format_attribute_node` (`same file:37`) returns a `String`. Four call sites reach it
  (`attributes/mod.rs:336`, `nodes/inline_component.rs:932`, `nodes/slot_element.rs:297`,
  `nodes/component_slots.rs:848`), and the last of those is a **regular element** — one carrying
  `slot=` inside a component, which `component_slots.rs` renders itself instead of handing to
  `handle_regular_element`.

So the same `<button tabindex="0" use:a transition:t>` is rendered by one emitter at top level and
by the other when it carries `slot="x"`. **[D]** — four divergences from official, all on that
single condition, all measured on 2026-09-02:

| what the string emitter did | official |
|---|---|
| wrote a `use:` action as an entry inside the props object | `const $$action_0 = …` before the `createElement` |
| wrote a transition as `ensureTransition(f)(tag, {})` inside the props object | a call after the `createElement` |
| gave `$$action_N` no enclosing block | one block per element |
| emitted `tabindex="0"` as `` `0` `` | a bare number (`numberOnlyAttributes`) |

The first two produce text no TypeScript parser accepts, which is how the class was found (blind
spot 6j) rather than by anyone reading the two emitters. **The duplication is not closed.**
Routing named-slot elements through `build_directive_prefix_suffix` and porting
`needsNumberConversion` into `format_attribute_node` fixes these four; the second emitter, its
four call sites and every other rule `Attribute.ts` decides once remain two implementations with
nothing comparing them. `action_arguments` is a smaller instance inside the same file set — it was
duplicated in `nodes/element.rs` and `nodes/special_element.rs`, and only the first copy was
folded into `attributes/directive_suffix.rs:102`; `special_element.rs:396` still carries its own.

**What a closing test looks like.** Not a corpus run: the two emitters return different types, so
the comparable surface is their *text*. The template is § *The one place this is already
defended* — feed one attribute list to both and pin the expected string independently, so a pair
that is wrong in the same way cannot pass.

#### 29. Is a name inside a named slot's body reactive? — [D]

**Upstream:** one `Component` visitor in `phases/scope.js`, which builds a named slot's body scope
as `node.metadata.scopes[slot_name] = context.state.scope.child()` — a child of the **component's
own** scope, not of the `let:` scope. A `let:` name is therefore *global* inside a `slot="…"`
child, and the reactivity question about it is answered the same way as for any other free name.

**Ports.** rsvelte forks the scope the same way in phase 2
(`2_analyze/scope_builder.rs::visit_component_children:2925`), and then answers the reactivity
question again in phase 3: `expression_has_reactive_state`
(`3_transform/client/visitors/shared/utils.rs:4685`) → `identifier_has_reactive_state` (`:4814`),
whose positional narrowing `by_position` (`:4861-4868`) **filters `BindingKind::Let` out** and
whose surviving lookups are keyed by name (`context.state.transform.get(name)`, `:4883`). The
phase-2 answer is correct and the phase-3 lookup does not consult it.

**The exclusion carries a comment stating its reason** — "`let:` bindings are excluded: their
reactivity is decided by whether the directive's transform is installed … not by the binding
itself" — which is the shape this file warns about above: a comment asserting fidelity reads as a
citation. It is right about the `let:` directive's own scope and says nothing about a named slot's
body, where upstream has re-parented the scope out from under the directive.

**[D]** — named input:

```svelte
<M let:options={db}>
  <span slot="title">{db.name}</span>
</M>
```

official emits `span.textContent = db.name;`, rsvelte
`$.template_effect(() => $.set_text(text, db.name));`. Measured on a 9-case × 4-target grid:
**`EQ 32 | DIFF 4`** — `named-slot/text` and `named-slot/attr` on `client` and `client-dev` only.
**All four `server` cells are EQ**, which locates the defect in the client lowering rather than in
the shared analysis.

**One hypothesis is falsified, and it is recorded because it is the cheap wrong answer.** Routing
`is_pure_node`'s `find_binding_any_scope` through `get_binding` does **not** move this grid: the
two arms differ by binary hash and the grid stays `EQ 32 | DIFF 4`. It is also a no-op everywhere
else — **0 changed units over 139,252 (4 targets)**, measured by rsvelte-75 — so it was withdrawn
rather than shipped, even though it is the spelling that matches upstream. The grid alone could
not have said that: a change can leave one grid still and move a corpus, and the two questions
take two measurements.

**Unmeasured:** the blast radius of making the `let:` transform scope-aware. Two corpus entries
reproduce this, so nobody has priced the fix.

#### 30. Is this rule a global block? — [D]

**Upstream:** one flag. `is_global_block_selector` (`2-analyze/css/css-analyze.js:24-30`) is
`type === 'PseudoClassSelector' && name === 'global' && args === null`, and the `Rule` visitor
sets `node.metadata.is_global_block` when such a selector is **first in any compound** (`:222`).
Every consumer — `css-warn.js:44`, `css-prune.js:133`, the transform's `is_in_global_block(path)`
(`3-transform/css/index.js:390`) and `is_empty`'s own opening line (`:432`) — reads that one flag.

**Ports.** rsvelte splits it across four predicates, and **no two of them agree**:

|                                  | `:global` | `.x :global` | `:global(.a)` | `.x :global(.a)` |
|----------------------------------|-----------|--------------|---------------|------------------|
| `is_global_block`                | true      | **false**    | false         | false            |
| `selector_contains_global_block` | true      | true         | false         | false            |
| `is_global_selector_rule`        | true      | **false**    | **true**      | false            |
| `is_in_bare_global_block` (flag) | true      | true         | false         | false            |

Only `selector_contains_global_block` is equivalent to upstream's flag on accepted input. Thirteen
decision sites read one of the four; enumerated one by one against the upstream line each answers,
**four disagreed** — `collect_keyframe_names_from_node` (`is_global_block`, so a descendant-position
block hashed an `animation` reference whose `@keyframes` it left alone: output naming a keyframe
nothing defines), `is_rule_empty` (no counterpart for `is_empty`'s `children.length === 0`
short-circuit), the empty check's flag (`is_global_selector_rule`, so an unused child of
`:global(.foo)` counted toward its parent), and `transform_complex_selector` (returns the selector's
source verbatim, skipping `remove_global_pseudo_class` along with the modifier). Six agree, and two
have **no upstream counterpart** at all (the specificity-bump inputs) — those are recorded
separately rather than counted as agreeing.

**The variant matters, because it decides what a gate could have seen.** This inventory's older rows
are all *two ports that answer differently*; a port-vs-port comparison finds them. Three of these
four are a second kind — **a port that has no answer**, reached only through a branch the other
port's callers never take — and one is a third: **two sites answering one question with different
predicates**, where each is self-consistent and only upstream shows they are the same question.

**A defect of the second kind is spelled "called from m of n paths", not "missing".** Both of the
functions involved already existed and were already correct:

| function | paths that should reach it | actually reached from |
|---|---|---|
| `collect_global_pseudo_cuts` | 2 | the global-block body copy only, never the selector return |
| `transform_rule_preserving` | 2 | the minify branch only, never the non-minify one |
| `ScopeRoot::is_scope_ancestor_of` | 1 | nobody, with a doc comment explaining the hazard it exists for |

**`grep` does not find this shape**, because the question is not "does the rule exist" but "how many
paths should reach it" — which is answered on the upstream side, by counting where one upstream rule
is consulted, and then matched against the rsvelte call sites. The thirteen-site enumeration above is
that work; the fourth defect was **predicted from the table and witnessed afterwards**, not found
from a failing input.

**The fifth site was the same shape one level up, and it is closed.** The non-minify body copy
of a `:global { … }` block was a verbatim splice with deletion ranges, so it could express
`remove_global_pseudo_class` (a deletion) and not `/* (empty) … */` (an insertion): a nested
empty rule survived. The body now goes through the `Rule` / `Atrule` visitors the minify branch
already used — the "called from m of n paths" row above, repaired.

**Still open, and it is the same class with a different insertion.** Upstream prepends `&` to a
bare `:global` that has a parent rule and no combinator (`3-transform/css/index.js:292-296`,
whose own comment reads `div { :global.x { ... } } becomes div { &.x { ... } }`). rsvelte gets
that right for an ordinary parent and loses it when the parent is itself a `:global { }` block,
because the path there deletes the `:global` and inserts nothing. **The axis is the parent, not
the selector**: `div { :global.a }`, `.p { :global.a }` and `.p { :global .a }` are all
byte-equal, `:global { :global.a }` is not, and `:global.a` with no parent is rejected by both
compilers. Population: **6** of 32,651 corpus `.svelte` spell `:global` followed by a compound
character, **0** of them diverge on any of the four targets, with a constructed cell firing on
4/4 through the same instrument — latent, no witness, and the token scan is a superset of the
reachable set.

**How it was found is the part worth keeping.** A probe over `.a:global`, `:global.a`,
`.a :global`, `.a:global(.b)` and two more, each at top level and inside a `:global { }` block,
was first run with `accept/reject` as its key and reported 12/12 agreement. Two of those cells
are *accepted* and one of them is byte-different, so the verdict key collapsed a real divergence
into agreement — **a probe has a comparison key and drops fields exactly like a gate does**.
The same probe with the output in the key reports 11/12. Re-run on an arm built from the commit
before this row's first fix, all cells were byte-identical, so the divergence is pre-existing:
an argument that "these rejections are raised in analysis and so cannot move with a phase-3 arm"
is sound for the rejected cells and says nothing about the accepted ones, whose output phase 3
builds.

## AST equivalence — what the gates compare

rsvelte's output gates used to ask "are these bytes identical?". They now ask
"do these two programs mean the same thing?", which is the question that
actually matters and the one that lets the printer change without a corpus-wide
rewrite.

One implementation answers it: [`crates/rsvelte_ast_equiv`](../crates/rsvelte_ast_equiv/src/lib.rs).
Parse both sides with OXC, print both with one fixed set of codegen options,
compare the printed text, then compare the meaningful comments. Everything
below is the contract that implementation enforces; its unit tests are the
executable version of this document.

### Formatting — collapses

Whitespace, line breaks and indentation. Quote style. Optional semicolons.
Optional parentheses. Numeric literal spelling (`1e3` = `1000` = `0x3e8`).
String escape spelling (`'\x41'` = `'A'`). Property shorthand (`{ a }` =
`{ a: a }`). Trailing commas. Prose comments.

### Meaning — does not collapse

Everything else. The cases worth naming, because they are the ones a printer
change can get wrong while the output still looks right:

- **Grouping parens.** `(a || b) && c` is not `a || (b && c)`; `-(-x)` is not
  `--x`; `new (f())()` constructs a different thing than `new f()()`;
  `(a?.b)()` throws where `a?.b()` short-circuits.
- **Automatic semicolon insertion.** A newline after `return` ends the
  statement.
- **Template literal contents,** including the newlines and spaces inside them
  — those are DOM text.
- **The directive prologue.** `'use strict';` is a directive, `('use strict');`
  is an expression statement.
- **Labels,** `-0` versus `0`, BigInt versus Number, `void 0` versus
  `undefined`, `??` versus `||`, statement and property order.

### Deliberately conservative

Some differences are reported that a human would call equivalent:
`let a = 1, b = 2` versus two declarations, `export { a, b }` versus
`export { b, a }`, `catch {}` versus `catch (e) {}`. Accepting them would mean
teaching the comparator when a rewrite is safe, and every such rule is a place
where a real difference can hide. A false "different" costs one investigation;
a false "equivalent" ships a bug that no gate will ever catch again.

### Comments

Prose comments are formatting and are dropped. A comment that a downstream tool
acts on is not, and is compared as an ordered list:

- everything OXC itself classifies — JSDoc, legal (`@license` / `@preserve`),
  `#__PURE__`, `#__NO_SIDE_EFFECTS__`, webpack / vite / turbopack magic
  comments, coverage ignores;
- plus the toolchain directives OXC does not classify: `svelte-ignore`,
  `@component`, `@ts-*`, `eslint-disable` / `eslint-enable` / `eslint-env`,
  `prettier-ignore`, `# sourceMappingURL=`, `# sourceURL=`.

#### Known gap: rsvelte does not preserve them yet

Turning the comment comparison on for the fixture suites fails 14 samples, so
that suite runs with comments ignored (`CommentPolicy::Ignore`) and this is the
list of what has to close before it can stop:

| Direction | Samples |
| --- | --- |
| rsvelte drops a comment the official compiler keeps (server) | `effect-cleanup`, `event-attribute-capture`, `event-attribute-spread-capture`, `inspect-derived`, `action-context`, `action-void-element`, `async-boundary-nav-race`, `increment-and-decrement-strings`, `state-snapshot-uncloneable-ignored`, `directives-with-member-access`, `dynamic-component-in-if-initial-falsy`, `component-binding-onMount` |
| rsvelte drops a comment the official compiler keeps (client) | `binding-width-height-this-timing` |
| rsvelte keeps a comment the official compiler drops (client) | `class-state-constructor` |

The comments involved are the user's own `@type` / `@param` JSDoc,
`@ts-expect-error`, `@ts-ignore` and `svelte-ignore`, carried over from the
`<script>` block. Losing them changes what `svelte-check` and ESLint report on
the generated code, which is why they are in the meaningful set rather than
treated as prose. The corpus gate runs with comments ignored for the same
reason, and for one more: its ratchet only ever shrinks, so a comparison that
adds failures cannot be switched on first.

Annotations are part of that gap too, in the other direction — bits-ui's
`menubar.svelte.ts` compiles to a `/* @__PURE__ */` that the official compiler
drops and rsvelte keeps.

Known limit: the list is ordered but not anchored to a position in the code, so
a meaningful comment that moves without any other change is not detected. The
comments that are position-sensitive in practice (`#__PURE__` and friends) are
also printed inline by codegen under this policy, so they are covered by the
code comparison. `CommentPolicy::Ignore` therefore has to switch that printing
off as well: an annotation left in the printed text is a comment difference
reported as a code difference.

### Parse failure is a failure

A program that does not parse has no canonical form, so there is nothing to
compare. Every comparator in this repo reports that as its own outcome and
stops. None of them falls back to a text or regex comparison — that would
answer a different question while looking like an answer to this one, which is
how a gate silently stops gating. All 3888 outputs of the flowbite-svelte
corpus (1296 files × client / client-dev / server) parse today;
`crates/rsvelte_core/tests/ast_gate_preconditions.rs` keeps the Svelte sample
corpus at that same 100%.

### CSS stays byte-identical

Only JavaScript is compared as an AST. Generated CSS is still compared byte for
byte: it is emitted by a much simpler path, there is no printer rewrite planned
for it, and a CSS canonicalizer would be a second semantic model to maintain
and trust for no benefit.

### Where it is used

| Consumer | What it compares |
| --- | --- |
| `crates/rsvelte_core/tests/common/mod.rs` (`compare_js`) | fixture suites, rsvelte output vs the official compiler's stored output |
| `crates/rsvelte_devtools/src/bin/canonicalize_js.rs` | stdin canonicalizer for the verify-svelte-compat skill |
| `crates/rsvelte_devtools/src/bin/canonicalize_and_compare.rs` | two-file triage tool; layers its own lossy text normalizations on top and therefore ignores comments |

<a id="deliberate-divergences"></a>

## Deliberate divergences from the official compiler

Output must match the official compiler exactly, because upstream is the specification.
That rule does not extend to reproducing bytes that are **not valid JavaScript** or that change
the source program's runtime meaning: an unparseable module or a dropped semantic clause is a
defect a byte match cannot pay for. Where the two conflict, correctness wins.

This file is the whole list. It is prose, not a ratchet. Most entries are divergences **no
gate observes**, which is exactly why they need writing down: an unobserved surface plus a
locally plausible reason ("we should match upstream", normally correct) is how a future
contributor reintroduces a parse error while believing they are improving parity. Every
entry below is pinned by a test, so the choice is enforced and not merely described.

A few entries are the opposite: a gate **does** observe them and they sit in a shrink-only
ratchet. Listing one here says the ratchet entry is an accepted difference rather than a
burndown target — the ratchet still stops it from spreading, and the pin still stops the
justification from rotting into "we happen to differ". Each such entry names its ratchet.

Before adding an entry, run both compilers. "Deliberate" is a claim about which side is
wrong, and a record that asserts it without the outputs converts an open question into a
settled one.

---

### Attributes on a side-effect import

**Pinned by** `crates/rsvelte_esrap/src/printer.rs::side_effect_import_keeps_attributes` and
`crates/rsvelte_core/tests/import_attributes_clause_3352.rs`.
**Reported upstream** in `upstream_issues/3635-esrap-side-effect-import-drops-attributes.md`.

Official Svelte (through esrap 2.2.12) prints
`import './data.json' with { type: 'json' };` as `import './data.json';`. esrap's
specifier-less import branch returns after the source and semicolon, before the shared code that
prints import attributes. A declaration with a specifier keeps the clause.

rsvelte deliberately prints the clause on both forms. An import attribute controls module
loading; dropping it can make a valid JSON or CSS module import fail at runtime. This is therefore
not a byte-only layout difference that exact-output compatibility can safely reproduce.

The corpus output gate has no accepted component containing this shape. If one is added while
upstream still drops the clause, it must be recorded as this deliberate divergence rather than
"fixed" by deleting the attribute again. Remove this entry when upstream esrap prints the clause.

---

### Private rune field reached through a non-`this` receiver (client)

**Pinned by** `crates/rsvelte_core/tests/private_field_non_this_receiver_2483.rs`.

#### Input

`A.svelte.js`, `generate: 'client'` (`dev` makes no difference to any row):

```js
export class R {
	#n = $state(0);

	constructor(o) {
		const inst = this;
		inst.#n++;        // constructor root
		o.#n--;           // constructor root, receiver is a parameter
		console.log(inst.#n);
		(() => { inst.#n++; })();   // nested function inside the constructor
	}

	m(o) { o.#n++; }
	static s(o) { o.#n++; }
}
```

#### Both outputs, measured against `submodules/svelte` 5.56.8

| position | official | parses | rsvelte | parses |
|---|---|---|---|---|
| method body, `o.#n++` | `$.get(o.#n)++;` | **no** | `$.update(o.#n);` | yes |
| static method, `o.#n++` | `$.get(o.#n)++;` | **no** | `$.update(o.#n);` | yes |
| nested fn in constructor, `inst.#n++` | `$.get(inst.#n)++;` | **no** | `$.update(inst.#n);` | yes |
| constructor root, `inst.#n++` | `inst.#n.v++;` | yes | `$.update(inst.#n);` | yes |
| constructor root, `--inst.#n` | `--inst.#n.v;` | yes | `$.update_pre(inst.#n, -1);` | yes |
| constructor root, read `inst.#n` | `inst.#n.v` | yes | `inst.#n.v` | yes |
| method body, read `inst.#n` | `$.get(inst.#n)` | yes | `$.get(inst.#n)` | yes |
| any position, `this.#n++` | `$.update(this.#n);` | yes | `$.update(this.#n);` | yes |

**Only updates diverge.** Reads are parity in both positions — #2464 moved the
constructor-root read onto upstream's `.v` form for every receiver before this entry was
written, and the entry's first version had not seen it.

The parse column is acorn's verdict on the official output and `oxc_parser`'s on rsvelte's;
both reject the `$.get(...)++` rows with `Assigning to rvalue`, and V8 accepts the parse
only to throw `ReferenceError: Invalid left-hand side expression in postfix operation` when
the method runs. Vite/Rolldown reject the module outright.

#### Why upstream produces it

`submodules/svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/UpdateExpression.js:14-19`
gates the `$.update` form on `argument.object.type === 'ThisExpression'`. The visitor it
falls through to,
`.../visitors/MemberExpression.js:11-19`, does **not** check the receiver: it rewrites any
private-identifier member of a known state field to `this.#n.v` inside a constructor and to
`$.get(this.#n)` everywhere else. So the two visitors disagree about whether the receiver
matters, and outside a constructor root the disagreement puts a CallExpression in assignment
position.

Reported upstream as **sveltejs/svelte#18621** (open as of 2026-08-08).

#### Why rsvelte's form is the correct one

The unparseable rows need no argument beyond the parse column. The two constructor-root
update rows are the ones that need one, because upstream's output there is valid:

- `.v++` writes the source's value **without notifying**, and upstream's receiver check is
  purely syntactic — it does not establish that the receiver is the object under
  construction. `constructor(o) { o.#n--; }` where `o` is an already-live instance lowers to
  `o.#n.v--`, and no subscriber of `o` ever hears about it. `$.update(o.#n)` notifies.
  Upstream's own lowering of `this.#n++` in the same constructor is `$.update(this.#n)`, so
  the helper form is upstream's semantics, not ours.
The constructor-root **read** looks like the same argument one field over, and #2629 asked
whether it should follow. **It should not, and the reason is not that both forms parse.**

The behavioural half of the question is real, and was settled by running it rather than arguing
it. Compile

```js
export class Box {
	#n = $state(0);
	constructor(other) { if (other) globalThis.__seen.push(other.#n); }
	bump() { this.#n++; }
}
```

with official, construct a second `Box` from a live one inside a `$.render_effect`, and `bump()`:

| read form in the constructor | effect runs | values seen |
|---|---|---|
| upstream's `other.#n.v` | 1 | `[0]` |
| `$.get(other.#n)` | 2 | `[0, 1]` |

So `.v` really does drop the dependency, exactly as #2574 claimed. What does not carry over is
the *other* leg of the update argument. At a constructor root upstream lowers `this.#n++` to
`$.update(this.#n)` and `inst.#n++` to `inst.#n.v++` — two forms for one position, so rsvelte
picks the one upstream itself uses for the receiver that is not in doubt. For a **read** upstream
lowers every receiver to `.v`: there is no second form to prefer, and emitting `$.get` would be
rsvelte inventing a lowering upstream never produces at a constructor root. Under-tracking a
constructor-root read is upstream's semantics, not an inconsistency inside it, and the fix
belongs in `MemberExpression.js` — the same receiver check that closes the two update rows above.

Pinned by `private_field_constructor_grid_2573.rs::a_state_field_read_at_a_constructor_root_takes_upstreams_shortcut`.

#### What would make this entry disappear

Upstream extending the `ThisExpression` check in `UpdateExpression.js` to any receiver — the
fix #18621 asks for — makes official emit `$.update(o.#n)` too, and closes every row above
except the two constructor-root `.v` ones, which close if `MemberExpression.js` gains the
receiver check instead. Delete the entry, its in-code comments and its test when
`submodules/svelte` is bumped past that fix.

#### Why no gate sees it

- **Corpus gate**: `known-failures.{client,server,client-dev}.json` are all `[]`, so no
  corpus entry contains the shape — a divergence this loud could not be listed and silent.
- **Generated matrix**: `scripts/compat-corpus/matrix/axes.mjs` has one private-field seed,
  `class-private-state`, and it writes `this.#n = 1`. Neither axis family varies the
  receiver.
- **Fixture suites**: three samples do reach a private rune field through a non-`this`
  receiver — `private-identifiers-not-this` (`other.#value = value`),
  `class-private-fields-reassigned-this` (`instance.#count = 1`, `return instance.#count`)
  and `class-state-derived-private` (`return self.#doubled`). All four expressions are
  assignments or reads in a method/getter body, which are plain parity; **no fixture applies
  `++`/`--` to a non-`this` receiver** (grepped with a `this.#count++` positive control),
  and none reads one at a constructor root. They are `runtime-runes` samples besides, so
  they assert rendered output, not generated code.
- **`ast_gate_preconditions`**: it would go red on a "correction" toward upstream, but only
  for a fixture that contains the shape, and none does.

#### Where it is recorded in the code

Three sites lower an update through a non-`this` receiver, one comment each:
`private_class_assign_ast.rs` (`visit_update_expression` for the spliced collector,
`rewrite_update` for the in-place path — both reached from method bodies) and
`class_transforms.rs::transform_class_methods_non_this` (the constructor root).

---

### A `$`-prefixed local binding is not a store subscription (server)

#### Input

```svelte
<script>
	import { writable } from 'svelte/store';

	const viewport = writable({ distance: 0 });

	function update(fn) {
		fn({ distance: 1 });
	}

	update(($viewport) => {
		$viewport.distance = 42;
	});
</script>

<p>{$viewport.distance}</p>
```

#### Both outputs, measured against `submodules/svelte` 5.56.10

| target | official | rsvelte |
|---|---|---|
| `server` | `$.store_mutate($$store_subs ??= {}, '$viewport', viewport, $viewport.distance = 42);` | `$viewport.distance = 42;` |
| `client` | `$viewport.distance = 42;` | `$viewport.distance = 42;` |

**Upstream's own two targets disagree on this input**, which is what settles which side is wrong.

**The axis is the spelling, not "a parameter."** `is_store_name` reads `object.name[0] === '$'`
and nothing asks what `$viewport` is, so a plain `let` in a nested block gives byte-identical
server output. Four cells, same oracle, `dev: false`:

| cell | server | client |
|---|---|---|
| arrow param `$viewport`, real store `viewport` | `$.store_mutate(…)` | `$viewport.distance = 42;` |
| nested `let $viewport`, real store `viewport` | `$.store_mutate(…)` — identical | `$viewport.distance = 42;` |
| arrow param `$viewport`, `const viewport = { … }` (no store) | `$.store_mutate(…)` | `$viewport.distance = 42;` |
| arrow param `$viewport`, **nothing** named `viewport` | `$viewport.distance = 42;` | `$viewport.distance = 42;` |

Row 4 pins `if (!context.state.scope.get(name)) return null` as the only brake, and it is the cell
that is already correct on both sides — the one a widening fix would break. Nesting is a
precondition rather than an incidental: a top-level `let $viewport` is rejected by both targets
(*The `$` prefix is reserved…*), so this shape can only be written inside a callback.

#### Why upstream produces it

`3-transform/server/visitors/AssignmentExpression.js:75-79` decides "this is a store" from the
name's spelling plus the existence of a binding one character shorter, and never asks whether
`$viewport` itself resolves in the current scope:

```js
if (is_store_name(object.name)) {
	const name = object.name.slice(1);
	if (!context.state.scope.get(name)) return null;
```

The client resolves through the scope chain and finds the parameter.

#### Why rsvelte's form is the correct one

`internal/server/index.js:284` — `store_mutate` calls
`store_set(store, store_get(store_values, store_name, store))`. Reproducing upstream would
subscribe to `viewport` and re-set it every time an unrelated **local object** is mutated, and
register `$viewport` in `$$store_subs` for teardown to unsubscribe — for a store the source never
subscribed to in that scope.

Measured rather than argued, with the runtime pinned to the same tree as the compiler and
`node --conditions=development` / `--conditions=production` set explicitly. The two repro shapes
fail in **different** ways, so which one is written down decides what the next reader sees:

| repro | `store_mutate` | `var $$store_subs` | `svelte/server` `render()` |
|---|---|---|---|
| a real store `viewport` exists (param **or** nested `let`) | emitted | emitted | renders — and calls `subscribe`, **`set`**, `unsubscribe` on it |
| no store: `const viewport = { … }` | emitted | **not emitted** | **throws** `ReferenceError: $$store_subs is not defined`, dev and prod |
| control: nothing named `viewport` | not emitted | not emitted | renders `<!--[--><p>ok</p><!--]-->` |

The third row is the negative control — the harness renders — and it moves in both directions,
which is what says `--conditions` is doing work: under `--conditions=production` the same control
throws for a `dev: true` build and renders for `dev: false`.

Row 1's side effect is measured, not inferred. Substituting a store whose `subscribe`/`set` record
their calls, the server output produces

```
["subscribe", "set {\"distance\":0}", "unsubscribe"]
```

while the client output emits `$viewport.distance = 42;` and contains no `store_mutate` at all — so
upstream's server writes to a store the source never writes to. For a plain `writable` the value
round-trips unchanged, but `set` notifies every subscriber, and `threlte`'s `currentWritable` is
not a plain `writable`.

**What is not the mechanism:** calling `store_mutate` directly with a plain object as the `store`
argument throws `store_invalid_shape` (dev) / `store.subscribe is not a function` (prod). Neither
repro reaches that — where the object is plain the module dies at the `ReferenceError` first, and
where the call is reached the store is real. A probe that supplies `$$store_subs` itself measures a
path the compiler never emits.

It also contradicts the rule
`compatibility/pattern-corpus/README.md` states for `dollar-function-parameter.svelte`: a `$name`
parameter "must neither create a synthetic store subscription nor trigger
`store_invalid_scoped_subscription`".

Reported upstream in
[`upstream_issues/svelte-server-treats-a-dollar-parameter-as-a-store.md`](../upstream_issues/svelte-server-treats-a-dollar-parameter-as-a-store.md).

#### Where it occurs in published code

`threlte`, `packages/extras/src/lib/hooks/useViewport.svelte.ts` —
`viewport.update(($viewport) => { … $viewport.distance = distance })`, where `update`'s callback
receives the current value. Naming that parameter `$viewport` is idiomatic and legal.

#### Why no gate sees it

The output gates *do* see it — they report it as a `js-mismatch` on `server` and `server-dev`,
which is why the two ids are listed in `known-failures.server{,-dev}.json` rather than silently
diverging. What no gate sees is **which side is right**: every gate here compares rsvelte to
upstream and scores any difference as rsvelte's failure, so a listed entry looks identical
whether it is our defect or theirs. That judgement lives only in this file.

#### Where it is pinned

`crates/rsvelte_core/tests/dollar_parameter_is_not_a_store.rs` asserts the server output for the
input above, so a future "fix" toward upstream goes red.

---

### Private `$derived` field written on the server

**Pinned by** `crates/rsvelte_core/tests/private_field_constructor_grid_2573.rs`
(`reproduces_upstreams_invalid_server_output`).

On the server a private `$derived` field holds a **callable** — `#f = $.derived(() => …)`, read
as `this.#f()` and written as `this.#f(v)`. Upstream's server visitor wraps the read and then
leaves the surrounding write alone, so for two shapes it emits an assignment whose target is a
call expression:

| input (`#f = $derived(this.#s * 2)`) | official | parses | rsvelte | parses |
|---|---|---|---|---|
| `this.#f += 1` | `this.#f(this.#f() + 1);` | yes | same | yes |
| `this.#f = 5` | `this.#f(5);` | yes | same | yes |
| `this.#f++` | `this.#f()++;` | **no** | same | **no** |
| `inst.#f += 1` | `inst.#f() += 1;` | **no** | same | **no** |
| `inst.#f = 5` | `inst.#f() = 5;` | **no** | `inst.#f = 5;` | yes |

The first two rows were rsvelte defects and are fixed — the read-wrapping pass classified the
operator by the byte after `this.#f`, saw `+` rather than `=`, and wrapped the assignment
*target* into `this.#f() += 1`; a plain `=` outside a constructor was the quiet half, valid
JavaScript that overwrote the callable with a number so the next read threw.

The remaining rows are **not settled the way the client entry above is**: rsvelte reproduces
upstream's invalid output for the update and the non-`this` compound rows, which the rule at the
top of this file says it should not. They are left as they are here, and tracked separately,
because unwrapping them means choosing a server lowering upstream never emits for a receiver
that is not `this` — the same decision #2483 took for the client, and it deserves its own
measurement rather than being folded into a fix for the two rows above.

#### Why no gate sees it

- **Generated matrix**: it never parses either output (gate-coverage 5f), and for these cells it
  has no valid oracle at all, so `matrix/generate.mjs` compares them on the client targets only.
- **Corpus gate**: `pattern/issues/2573-ctor-private-derived-write.svelte.js` covers the two
  fixed rows on all three targets. Nothing in the collected corpus writes a private `$derived`
  field through any receiver — `known-failures.server.json` is `[]`.

---

### TypeScript class index signature

**Pinned by** `crates/rsvelte_core/tests/ts_index_signature_3422.rs`.
**Reported upstream** in `upstream_issues/3422-svelte-class-index-signature-crash.md`.

`class K { [k: string]: unknown }` makes the official compiler throw a bare
`TypeError: Cannot read properties of undefined (reading 'type')` — no `code`, no position, no
frame — from esrap's `TSIndexSignature` printer, because `remove_typescript_nodes.js` deletes the
signature's `typeAnnotation` while `ClassBody` keeps the node itself. rsvelte erases the member,
so rsvelte compiles what upstream cannot.

**This entry exists because the previous behaviour was a deliberate parity choice, and it shipped
two defects.** `2_analyze/types.rs` carried the comment *"Upstream passes these through verbatim
(a class index signature even makes it throw), so they are left exactly as written"* — locally
reasonable, and wrong, because "upstream throws" is not an output to be equal to.

#### What leaving it in cost, measured

A grid of 8 index-signature spellings + 11 TypeScript-only control members × 3 class hosts
(declaration, expression, one carrying a `$state` field) × 2 entry points (instance script,
`<script module>`) × 3 targets = **342 cells**:

| | before | after |
|---|---|---|
| rsvelte output rejected by acorn | 96 | **0** |
| TypeScript left in the `.js` output | 96 | **0** |
| instance/module script silently dropped (`server`) | 48 | **0** |
| control cells clean | 198 | 198 |

The 96 client/client-dev cells emitted `class K { [k: string]: unknown }` into a `.js` artifact.
The 48 `server` cells are the more dangerous half and are **not** what the report described: the
erased script is re-parsed to classify it, that parse rejected the surviving TypeScript, and the
whole instance script was discarded — output that parses and does nothing. (#3421 made that
failure loud; this change removes its cause.)

#### Why no gate sees it

- **Output-equality gates**: there is no official output at all for these inputs, so nothing to
  compare; a crash is not a `code` the error ratchets can key on either.
- **Output-parseability gate**: parses rsvelte's side only, and the `server` half parses fine
  while being empty.
- **Collected corpus**: a component with a class index signature cannot be built with the official
  compiler, so no published source can carry the shape.

---

### Dotted TypeScript namespace (`namespace N.M { … }`)

**Pinned by** `crates/rsvelte_core/tests/ts_export_type_only_declaration.rs`.
**Reported upstream** in `upstream_issues/3568-svelte-dotted-namespace-crash.md`.

A namespace whose name is dotted makes the official compiler throw a bare
`TypeError: node.body.body.map is not a function` — no `code`, no position, no frame — because
`remove_typescript_nodes.js` assumes a `TSModuleDeclaration`'s `body` is a `TSModuleBlock`, while
for the dotted spelling it is another `TSModuleDeclaration`. rsvelte compiles it.

#### What rsvelte does instead, and why that particular behaviour

`namespace N.M { … }` is the source spelling of `namespace N { namespace M { … } }`, and upstream
compiles the nested spelling correctly: the type-only body is stripped, and a value in it raises a
coded `typescript_invalid_feature` positioned on the inner `namespace M { … }`. rsvelte therefore
treats the dotted form **as its desugaring**, so both halves of upstream's own behaviour on the
nested form carry over:

| source (instance script or `<script module>`, `lang="ts"`) | official | rsvelte |
|---|---|---|
| `namespace N.M { type T = 1; }` | `TypeError` | stripped |
| `namespace N.M.O { type T = 1; }` | `TypeError` | stripped |
| `namespace N.M { }` | `TypeError` | stripped |
| `namespace N.M { let x = 1; }` | `TypeError` | `typescript_invalid_feature` |
| `namespace N { namespace M { let x = 1; } }` | `typescript_invalid_feature` | same |

Before this entry, the parse conversion dropped the dotted body without looking at it (the nested
declaration is not a `TSModuleBlock`), so the value case was accepted too — rsvelte was silently
more permissive than the desugaring it now follows.

The alternative — reproduce the crash — is available and was rejected: a raw exception carries no
code and no span, so there is nothing for the error ratchets to be equal to, and every consumer
that embeds the compiler (the language server, `rsvelte-check`, the Vite plugin) would surface an
uncoded panic instead of a diagnostic.

#### Why no gate sees it

- **Output-equality and error gates**: official produces neither output nor a coded error, so the
  comparison key is empty on one side.
- **Collected corpus**: a component with a dotted namespace cannot be built with the official
  compiler at all, so no published source carries the shape.
- **Output-parseability gate**: rsvelte's output is valid JavaScript either way — the divergence is
  whether the input is accepted, which that gate does not ask.

---

### Module `$inspect(…).with(fn)` in a declarator initializer

**Pinned by** `crates/rsvelte_core/tests/module_inspect_slot_3611.rs`
(`an_inspect_with_declarator_keeps_its_binding_and_value`).
**Reported upstream** in `upstream_issues/svelte-inspect-with-in-a-declarator.md`.

Official omits `'$inspect().with'` from the rune allow-list used by both client and server
`VariableDeclaration` visitors. The outer call therefore bypasses the inspect visitor and falls
through to a state-shaped declarator path:

| target | official | rsvelte |
|---|---|---|
| client prod/dev | drops the declarator, leaving later `t` reads free | keeps `const t = undefined` in prod and the `$.inspect(...)` result in dev |
| server prod/dev | emits `const t = fn`, binding the inspector instead of the rune result | keeps `const t = undefined` in prod and the inspector call result in dev |

Both official outputs parse, so this is not covered by the invalid-JavaScript exception alone.
They are nevertheless runtime-wrong: the client turns a declared local into a `ReferenceError`,
and the server changes the value from the callback's return value (or `undefined` in prod) to the
callback function itself. rsvelte keeps the semantics of the same rune in every other expression
slot. Exported declarators follow the same decision.

No collected corpus source binds an inspect rune's result, and the #3611 generated slot grid
compares official output rather than evaluating the later reference. Remove this entry and change
the eight pinned expectations to byte parity when upstream includes `'$inspect().with'` in both
declarator allow-lists.

---

### CSS custom-property block values

**Pinned by** `crates/rsvelte_core/tests/css_custom_property_block_3052.rs`.
**Reported upstream** in `upstream_issues/3052-svelte-css-custom-property-brace-block.md`.

CSS custom properties accept the `<declaration-value>` grammar, including balanced `{}` and `[]`
blocks. The official compiler instead parses their values with the ordinary declaration-value
scanner and raises `css_expected_identifier` at the first `{`. Browsers and general CSS parsers
accept the value.

rsvelte preserves balanced custom-property blocks and the declarations following them. It does
not extend that grammar to ordinary properties, which keep the existing rejection. This is an
intentional error-presence divergence: rejecting valid CSS changes the component's available
styles, so it is not a byte-only parity choice.

---

### Awaited `autofocus` and event attributes (client)

**Pinned by** `crates/rsvelte_core/tests/async_autofocus_event_3651.rs`.
**Reported upstream** in
`upstream_issues/3651-svelte-async-autofocus-and-event-output-is-unparseable.md`.

With `experimental.async: true`, official Svelte 5.56.10 emits
`$.autofocus(input, await p)` and puts `(await p)?.apply(...)` inside a plain
event-handler function. Both are syntax errors because neither containing function
is async. rsvelte routes only the awaited cases through a local `Memoizer`, so the
await remains inside an async value thunk and the runtime call receives `$0`, the
resolved result. Synchronous output is unchanged.

The ordinary parity gates cannot observe the correction: both compilers previously
agreed, while the matrix treats unparseable official output as an oracle rejection and
aborts rather than producing a keyed divergence. Gate-coverage 5r records that blind
spot. Remove this entry and converge on upstream when its two visitors adopt an async
memoization path.

---

### A linter reports the compiler's own errors (`rsvelte-lint` exit code)

**Ratchet** `compatibility/lint-severity-known-failures.json`, the 57 `exit|…|0->1|…` entries.
**Pinned by** `scripts/dev/test-lint-severity-exit-attribution.mjs`, run in CI by the
`Corpus verify baseline-flag contract` job.

#### Input

Any source the Svelte compiler rejects. The listed patterns carry 21 distinct compiler codes;
the largest are `slot_element_invalid_name` (13), `dollar_prefix_invalid` (7),
`parse-error` (5), `state_invalid_placement` (4), `legacy_export_invalid` (4) and
`animation_invalid_placement` (4). One of the smallest is the whole subject of a rule:

```svelte
<slot name={dynamic} />
```

#### Both outputs, measured against `submodules/svelte` 5.56.10 and eslint-plugin-svelte 3.23.0

- `svelte.compile` **throws** `slot_element_invalid_name` — measured for all 57 patterns by the
  pin above, 57 of 57, with two valid patterns as the accepting control.
- `eslint` with `flat/recommended` reports the rule's findings and **exits 0**:
  `svelte-eslint-parser` is deliberately more permissive than the compiler, so it builds a tree
  where the compiler refuses to.
- `rsvelte-lint` merges the compiler's diagnostics into its report and **exits 1**, exactly as it
  does for any rule configured at `error`.

#### Why upstream produces it

ESLint's contract is a *parser* plus rules, and `svelte-eslint-parser` is a separate project from
the compiler. A file the compiler rejects is, to ESLint, a file that parsed — so there is nothing
to report and nothing to exit non-zero about.

#### Why rsvelte's form is the correct one

`rsvelte-lint` is a Svelte-specific linter with the compiler *inside* it, so "this file does not
compile" is information it has and ESLint does not. Exiting 0 on a file that cannot build would
make the linter's own verdict misleading in the one case where it matters most. It is a product
decision, not a parity defect — and the pin is what separates the two: if a future change made
rsvelte reject something the official compiler accepts, that entry becomes an over-rejection and
the check goes red naming the file.

#### Why no gate saw the difference between those two readings

Every other lint gate configures an explicit rule universe and compares **findings**, so a
compiler diagnostic — which is not a `svelte/…` rule id — is outside the compared population.
The exit code is not a finding, and until gate 36 nothing compared it. Four entries that *were*
rsvelte over-rejections hid in this same bucket until then (#3127, #3128); they are fixed and no
longer listed. The count has since moved the other way — `prefer-const/22-decorated-class-method`
and `23-redeclared-let` are new entries whose sources the official compiler also rejects
(`typescript_invalid_feature` at 5:1 and `js_parse_error` at 5:5, both targets), which is why
the pin reads 57 and not 55.

---

### The default lint preset carries three rules upstream does not, and drops two

**Ratchet** `compatibility/lint-preset-known-failures.json`, all 5 entries.
**Pinned by** `crates/rsvelte_lint/tests/comment_directive.rs` (9 tests),
`crates/rsvelte_lint/src/rules/no_undef.rs` (6), `no_unused_vars.rs` (23) and
`no_companion_module.rs` (5), plus `pnpm run test:type-aware-lint` (9).

#### Input

Any project linted with no configuration at all. The gate compares
`eslint-plugin-svelte`'s `flat/recommended` against `rsvelte-lint`'s `recommended`.

#### Both outputs, measured by `scripts/compat-corpus/lint-preset.mjs`

Every rule both sides ship now agrees on its default severity — the 21 that did not were
an incomplete transcription and were fixed, not listed. What remains is membership:

| entry | upstream | rsvelte |
|---|---|---|
| `svelte/system` | a rule id | not a rule — the same behaviour is `suppression.rs` |
| `svelte/@typescript-eslint/no-unnecessary-condition` | a rule id | absent from the native registry |
| `svelte/no-undef` | not shipped | shipped |
| `svelte/no-unused-vars` | not shipped | shipped |
| `svelte/no-companion-module-shadow` | not shipped | shipped |

#### Why upstream produces it

`eslint-plugin-svelte` runs *inside* ESLint. Comment directives are ESLint's own job, so the
plugin models them as an internal rule id; the core `no-undef` / `no-unused-vars` come from
ESLint itself with the plugin's parser feeding them; and a type-aware wrapper can assume
`typescript-eslint` is present.

#### Why rsvelte's form is the correct one

`rsvelte-lint` is a single binary with no ESLint underneath it. It must carry the core checks
or leave them unavailable, and it implements directives as a mechanism rather than a rule
because there is no rule pipeline to hang them on. The type-aware wrapper's counterpart lives
in the out-of-workspace `rsvelte_lint_types` crate, which needs a running `tsgo` — a scope
boundary, not a missing feature.

#### Why no gate sees it

`scripts/compat-corpus/lint-universe.mjs` **intersects** the two rule lists before any
finding-level comparison, so a rule only one side ships is never enabled during a comparison.
All five are invisible to the other eight lint gates by construction, which is why this gate
keys on membership at all. The first version keyed on membership *alone* and reported 29
differences; adding severity to the key took it to 50 and surfaced the 21 real ones.

---

### A `$props()` line comment keeps the separator slot the compiler reads

**Ratchet** `compatibility/fmt-oracle-excluded.json`, the three
`pattern/issues/3515-props-*-line-comment.svelte` entries.
**Pinned by** `compatibility/pattern-corpus/issues/3515-props-default-line-comment.svelte`,
`compatibility/pattern-corpus/issues/3515-props-plain-line-comment.svelte` and
`compatibility/pattern-corpus/issues/3515-props-rest-line-comment.svelte`, which the
compiler's own output-equality gate compiles on all four targets.

#### Input

```svelte
<script>
	let { a } =
		// why the default is what it is
		$props();
</script>
```

#### Both outputs

- `oxfmt(svelte: true)` — prettier for the Svelte structure — keeps the comment as a **leading
  separator** of the initializer and inserts a blank line before it.
- `rsvelte-fmt` — oxc for the embedded JS — attaches the same comment **after** the initializer
  expression.

Both are valid JavaScript and both round-trip. They differ in which slot the comment occupies.

#### Why rsvelte's form is the correct one here

The slot is not cosmetic: #3515 is a compiler defect whose repro depends on the comment sitting
between the declarator and its `$props()` initializer. Moving it to prettier's slot makes the
three repros stop reproducing what they exist to reproduce, so matching the oracle here would
cost a compiler gate to buy a formatter gate. The formatter follows oxc for embedded JavaScript
by design (see the section below); this is one instance of that decision, not a separate one.

---

### The formatter's JavaScript engine is oxc, not prettier

**Ratchet** `compatibility/fmt-oracle-excluded.json`, the four `flowbite-svelte/…` entries.
**Pinned by** `crates/rsvelte_formatter/tests/expression.rs` and
`crates/rsvelte_formatter/tests/css_native.rs`, which assert oxc's own line-breaking and CSS
output rather than prettier's.

#### Input

Long expressions in Svelte positions — a ternary inside a `class=` attribute, an IIFE whose
arrow takes one parameter, a template literal's `${}` inside `<script>`, and an `{#if}` header
holding `unique && value.some(…)` beside a member chain.

#### Both outputs, measured by `scripts/compat-corpus/fmt.mjs`

Four different break points, all valid, none reachable from the other by changing the print
width: the oracle breaks a ternary's **condition** at `===`, the arrow's **parameter list**, and
**only** the inner member chain in the `{#if}` header; `oxc_formatter` breaks the nested
conditions, the IIFE's **call argument**, and the `&&` / call-args respectively.

#### Why rsvelte's form is the correct one

`rsvelte-fmt` formats embedded JavaScript with `oxc_formatter` on purpose — it is the same
engine `oxfmt` uses for standalone JavaScript, and the whole point of the port is not to carry
prettier. Reproducing prettier's break priorities would mean re-implementing prettier's
`Doc` algebra inside the oxc printer for the Svelte path only, and the two would then disagree
with each other on the same JavaScript depending on whether it sat in a `.js` file or a
`<script>` block — which is the defect shape the oracle itself already has (`oxfmt x.css` and
`oxfmt --svelte` print the same custom property differently).

#### Why no gate sees it

The formatter-parity gate compares against `oxfmt(svelte: true)`, whose JavaScript comes from
prettier; the svelte.dev formatter gate is a hard gate with no tolerance and would fail on any
of these, which is why they are excluded rather than listed. Nothing in the tree compares
`rsvelte-fmt`'s JavaScript against `oxfmt`'s **standalone** JavaScript, where the two agree —
that comparison would show the divergence is the oracle's inconsistency and not rsvelte's.

---

### The formatter declines an input its own parser rejects

**Ratchet** `compatibility/fmt-oracle-excluded.json`, the four `invalid-input` entries and the
two `migrate` entries.
**Pinned by** `compatibility/pattern-corpus/adversarial/css/rejected-global-keyframes-selector.svelte`
and `crates/rsvelte_formatter/tests/style_block.rs`.

#### Input

Four inputs no compiler accepts — a snippet parameter written `c?: number = 5` (TS1015),
snippet rest parameters (`snippet_invalid_rest_parameter`), `h1:nth-of-type(+12)` and
`:global(@keyframes shared)` (`css_expected_identifier`, #3120) — and two Svelte 4→5 **migrator
outputs**, which use `let:` directives and `slot=` attributes.

#### Both outputs

`prettier-plugin-svelte` formats all six: it validates nothing beyond its own parse. `rsvelte-fmt`
reports the parse error, or falls back to emitting the block verbatim where the CSS parser is the
one that refuses.

#### Why rsvelte's form is the correct one

A formatter that rewrites a file its own compiler cannot compile is a formatter that can silently
change the meaning of code nobody can check. Falling back to the source is the conservative
answer. The migrator outputs are a scope statement rather than a behaviour: this repository is a
Svelte 5 compiler port and `Migrate 0/76` is recorded as out of scope, so a Svelte 4 construct is
not an input `rsvelte-fmt` is required to format.

#### Why no gate sees it

The parity gate's unit is (source, oracle output); an input the subject declines has no output to
compare, so the pair can only be excluded or scored as a failure. Excluding it is what keeps the
gate's remaining population meaningful — and the exclusion list is shrink-only in both
directions, so an entry that starts formatting fails the run.
### A formatter difference the compiler cannot see

**Ratchet** `compatibility/fmt-oracle-excluded.json`, five `oracle-bug` entries:
`await-then-destruct-array-nested-rest`, `block-expression-assign`,
`whitespace-after-script-tag`, `whitespace-after-style-tag`, `textarea-end-tag`.
**Pinned by** `crates/rsvelte_formatter/tests/render_neutral_divergences.rs`.

#### Input

An array pattern with elisions (`...[,, c, ...{ length }]`), an assignment used as a
`{@const}` body (`{@const y = h = 0}`), a `<script>` and a `<style>` whose close tag carries
whitespace and newlines before `>` (`</script     \n\n>`), and a `<textarea>` whose close tag is
split the same way.

#### Both outputs

| entry | `oxfmt(svelte: true)` | `rsvelte-fmt` |
|---|---|---|
| elisions | `...[, , c, ...{ length }]` | `...[,, c, ...{ length }]` |
| `{@const}` | `{@const x = h = 0}` | `{@const x = (h = 0)}` |
| `</script   >` | rewritten to `</script>` | preserved verbatim |
| `</style   >` | rewritten to `</style>` | preserved verbatim |
| `</textarea` split | the tail is deleted | the element is closed |

#### Why rsvelte's form is the correct one

It is not a claim about which text reads better: **each pair compiles to byte-identical output**.
Both texts of all five were run through
`submodules/svelte/packages/svelte/src/compiler/index.js` for `generate: 'client'` and
`'server'`, and `js.code` and `css.code` are equal on every one of the four comparisons. The
divergence is therefore invisible to every consumer of the file, and rsvelte's side of it is the
one its own engines produce — `oxc_formatter` for the JavaScript, and the source text for a close
tag it has no reason to rewrite.

The recorded justifications for all five claimed a *semantic* loss (a dropped nested rest, an
unclosed paren, a discarded `<script>` body). Re-measured on 2026-08-31, none of them reproduces:
the bodies survive, the patterns survive, and the outputs agree. A sixth entry filed the same way,
`textarea-content`, now matches the oracle byte-for-byte and has been removed from the list
outright.

#### Why no gate sees it

The formatter-parity gate's unit is (source, oracle text) and its verdict is byte equality, so it
cannot ask whether two texts mean the same program — the one question that separates these five
from a real defect. Nothing in the tree compiles both sides of a formatter divergence; the
measurement above had to be written for this row.

---

### The formatter's CSS engine is oxc, not prettier's PostCSS

**Ratchet** `compatibility/fmt-oracle-excluded.json`, three `oracle-bug` entries: `css-vars`,
`svelte.dev .../docs/[topic]/[...path]/+layout.svelte`, and
`pattern/adversarial/css/css-custom-property-values`.
**Pinned by** `crates/rsvelte_formatter/tests/css_native.rs`.

#### Input

One declaration block carrying an empty custom-property value (`--bar:   !important`), a bracket
value (`--arr: [1, 2]`), a selector-shaped value (`--sel: a > b ~ c`), and a nested `calc()` with
a parenthesized subtraction group.

#### Both outputs, measured on the same bytes

| | `--bar` | `--arr` | `--sel` | nested `calc()` group |
|---|---|---|---|---|
| `oxfmt x.css` | `--bar: !important;` | `[1 , 2]` | `a > b ~ c` | kept inline |
| `rsvelte-fmt x.css` | `--bar: !important;` | `[1 , 2]` | `a > b ~ c` | kept inline |
| `oxfmt(svelte: true)` | `--bar:    !important;` | `[1, 2]` | `a > b ~c` | broken onto its own lines |

#### Why rsvelte's form is the correct one

`rsvelte-fmt` reproduces **oxfmt's own standalone CSS output byte-for-byte**, on all four. The
oracle is the same tool answering differently, because its Svelte path prints embedded CSS through
prettier's PostCSS printer while its `.css` path uses the oxc engine — the engine `rsvelte-fmt`
also uses, on purpose. Parity against the Svelte path is therefore undefined: matching it would
put `rsvelte-fmt` in disagreement with `oxfmt` on the same CSS depending only on whether it sat in
a `.css` file or a `<style>` block, which is the defect the oracle already has. `a > b ~c` is also
a token-stream change in a value that may be substituted, so the Svelte path is the side that
moves meaning.

#### Why no gate sees it

The parity gate compares against exactly one of the oracle's two answers and has no notion of the
other, so a divergence caused by the oracle's own inconsistency is indistinguishable from an
rsvelte defect. The comparison that separates them — `rsvelte-fmt` against `oxfmt <file>.css` —
exists nowhere in the tree; the table above had to be measured for this row.

---

### SCSS serialisation from the `grass` backend

**Pinned by** `crates/rsvelte_preprocess/tests/grass_serialisation.rs`.
**Not reported upstream**, because these are not defects on either side: dart-sass and `grass`
both emit valid CSS with the same computed effect.

`rsvelte_preprocess` compiles SCSS with the Rust `grass` crate rather than by shelling out to
dart-sass, which is what makes the preprocessor usable from a Rust host at all. The two
serialise the same stylesheet differently in four ways:

- a computed colour prints in the legacy shortest form (`#e9e9e9`) where dart-sass ≥ 1.79
  prints the space its channels were computed in (`rgb(91.3333333333%, …)`);
- a `/* … */` following a declaration moves to its own line;
- a wrapped selector list inside `@media` keeps the block indentation only on its first line;
- whitespace and quote style differ in a handful of places.

**155 of the 315 units in `scss-known-failures.json` are exactly this**, and the number is
measured rather than eyeballed: both outputs are flattened to an ordered list of
`(selector chain, property, value)` with colours folded to one `rgba()` spelling, and the two
lists are equal. The remaining 160 are not covered by this entry — 59 change the cascade and 99
are inputs `grass` rejects, each attributed to a report under `upstream_issues/`.

They stay **listed in the ratchet rather than normalised away**. The gate exists to catch a
divergence in colour *arithmetic*, and a normaliser that folded every colour spelling would
fold that too — which is the same argument as `sourcemap-known-failures.md`'s: a rule that
repairs a class of output cannot then be used as evidence about that class. Listing them costs
155 lines that never move; normalising them would cost the gate its subject.

The pin records dart-sass's output beside each assertion, so a `grass` release that converges
turns the test red and this entry gets deleted rather than quietly becoming false. It also
carries the two non-neutral classes, for the same reason.

---

### `abstract` on a class property (and therefore in the `parse()` AST)

**Pinned by** `crates/rsvelte_core/tests/parse_abstract_class_member.rs`
(`an_abstract_property_is_still_dropped`).
**Reported upstream** in `upstream_issues/3082-svelte-abstract-property-not-erased.md`.

#### Input

`A.svelte`, `generate: 'server'` (the target makes no difference):

```svelte
<script lang="ts">
	abstract class B {
		abstract kind: string;
	}
	const b = 1;
</script>

<p>{b}</p>
```

#### Output

Official (`submodules/svelte/packages/svelte/src/compiler/index.js`) erases the accessibility
modifier and the type annotation but leaves the `abstract` keyword, so the class body carries two
adjacent identifiers:

```js
	class B {
		abstract kind;
	}
```

rsvelte erases the member:

```js
	class B {}
```

`acorn.parse(…, { ecmaVersion: 'latest', sourceType: 'module' })` on the two outputs:

```
official: acorn REJECTS — Unexpected token (5:11)
rsvelte: acorn ACCEPTS
```

#### Why the divergence extends to `parse()`

Official keeps the abstract `PropertyDefinition` in the AST, which is where the un-erased keyword
comes from. rsvelte drops it at parse, so `parse()` diverges too — its `ClassBody.body` is one
member shorter. Matching the AST alone would leave the erased output diverging on purpose while
the tree agreed, which is the state hardest to explain to the next reader; the two halves are one
decision. An abstract **method** is a different case and rsvelte does match it: official drops
that member from the compiled output, so emitting it in the AST costs nothing downstream.

No gate observes either half. There is no abstract property in any of the 33,776 `.svelte` files
of the collected corpus (measured — `ClassBody.body[]#length` went stale on the run that emitted
abstract methods), and the one real-world carrier,
`bits-ui/packages/bits-ui/src/lib/bits/accordion/accordion.svelte.ts:97`
(`abstract readonly isMulti: boolean;`), is a `.svelte.ts` module that `scripts/compat-corpus/compile.mjs`
strips with esbuild before either compiler sees it. So the shape reaches no population, on either
gate, today.

Delete this entry when upstream erases the keyword.

---

### Completion `kind` for a `const`, and the `kindModifiers` filter it disables (language server)

**Pinned by** `scripts/compat-lsp/tsgo-completion-kind.test.mjs`, which asserts the shape of
**tsgo's own** response, not rsvelte's — the entry has to be removed when tsgo changes, and a
test on rsvelte's output would keep passing after that.
**Reported upstream** in
`upstream_issues/tsgo-lsp-completion-item-omits-the-typescript-kind.md`.

Official `svelte-language-server` reads completions from the TypeScript API and maps
`ScriptElementKind` to an LSP kind in `plugins/typescript/utils.ts`
(`scriptElementKindToCompletionItemKind`): `const` becomes `CompletionItemKind.Constant`,
`let`/`var` become `Variable`. rsvelte's TypeScript features instead proxy a child `tsgo`
LSP server, whose items carry neither `ScriptElementKind` nor `kindModifiers`.

Measured directly on both backends at the same position of the same `.ts` file
(`tsgo` 7.0.0-dev.20260703.1, `typescript` 6.0.3, 1071 items each):

| declaration | TypeScript API | `tsgo --lsp` |
|---|---|---|
| `const aConst = 1` | `kind: "const"`, `kindModifiers: ""` | `kind: 6` (Variable) |
| `let aLet = 2` | `kind: "let"` | `kind: 6` |
| `var aVar = 3` | `kind: "var"` | `kind: 6` |
| `declare const aDeclared` | `kind: "const"`, `kindModifiers: "declare"` | `kind: 6`, no `kindModifiers` |
| `function aFunction() {}` | `kind: "function"` | `kind: 3` (Function) |
| `class AClass {}` | `kind: "class"` | `kind: 7` (Class) |

Three `ScriptElementKind`s collapse into one LSP kind, and `kindModifiers` is absent from all
1071 items. The `function`/`class`/`enum` rows are the positive control: tsgo does emit kinds,
so the collapse is a lost distinction rather than a degraded response.

Through the two servers on `fixtures/completion-script-null`
(`<script>co¦nst a = true</script><p>test</p>`), this surfaces as exactly three items —
`a`, `name` and `CompletionScriptNull` — where official answers `Constant` and rsvelte answers
`Variable` while every other compared field, `sortText` included, is equal.

The second half is the deliberate one. `CompletionProvider.ts`'s `isNoSvelte2tsxCompletion`
drops an item whose `kindModifiers` is `declare` and whose label is in its `svelteTypes` list;
`tsgo_completion.rs`'s port leaves that arm unported, because without `kindModifiers` the
condition degrades to a bare name match and would drop a user's own `SvelteStore`. Losing a
correct completion is worse than keeping a spurious one, so the narrower filter is kept.

Neither half is reachable by porting: rsvelte proxies tsgo rather than porting upstream's
`typescript-plugin` (tsgo has no plugin API), so the information does not exist on this side.
The LSP gate does observe the divergence, but not as a kind divergence — `diff.mjs`'s
`identity()` digests `kind` into the pairing key, so a differing kind is reported as an
unpaired extra plus an unpaired missing, which reads like two absent items.

Do **not** widen this entry to the five other kind divergences in the same suite
(`Variable -> Property` on `navigation`/`orientation`/`top`, `Keyword -> Property` on
`var`/`continue`). Those are in `css-smoke-completion-interpolation` and
`html-smoke-completions`, where rsvelte's own HTML/CSS completions fall through to `Property`;
they are rsvelte-side defects and are not covered here.

Remove this entry when `tsgo --lsp` carries the TypeScript kind — the pinned test fails at that
point, and both halves become ordinary parity work.

---

### A `@typedef` strip whose offset lands inside the comment (svelte2tsx)

**Pinned by** `crates/rsvelte_projection/tests/svelte2tsx_typedef_tag_offset.rs`, whose other
test asserts the two rows rsvelte *does* reproduce.
**Reported upstream** in
`upstream_issues/svelte2tsx-getlastleadingdoc-mixes-absolute-and-relative-offsets.md`.

`getLastLeadingDoc` (`utils/tsAst.ts:143-160`) removes a declarator's `@typedef` tags before the
JSDoc is copied onto the prop. The tag span comes from `ts.getAllJSDocTagsOfKind`, whose `pos` /
`end` are **SourceFile-absolute**, and it is sliced out of `node.getFullText()`, which is
**node-relative** — so the removal is shifted by `node.pos`, and what that shift hits depends on
what precedes the comment:

| statement ahead of the comment | shifted slice occurs in it? | official |
|---|---|---|
| none (`node.pos == 0`) | — | the tag is removed, as intended |
| long | no | `replace` no-ops and the tag survives |
| short | yes | **the wrong text is deleted** |

Measured on one comment with only the preceding statement varied:

```
row 1  {\n/**\n * \n * @slot {{ a: 1 }}\n */a: a}
row 2  {\n/**\n * @typedef {import('./X.svelte').T} T\n * @slot {{ a: 1 }}\n */a: a}
row 3  {\n/**\n * @typedef {i{ a: 1 }}\n */a: a}
```

rsvelte reproduces rows 1 and 2 — it strips the tags exactly when the comment is the script's
first token, which is upstream's `node.pos == 0` condition spelled as the condition rather than as
its symptom. Row 3 it does not: the emitted comment would be truncated in the middle of
`import('./X.svelte')` and would lose the `@slot` tag that followed, which is a JSDoc block whose
type expression no longer parses. A byte match cannot pay for that.

This is a divergence the **corpus svelte2tsx gate can observe**, and it does not sit in
`svelte2tsx-known-failures.json`: 172 of the 33,901 collected components mention `@typedef` and
**0 of them reach row 3**, so there is no entry to list. That is the reason this section exists —
the divergence is real, no ratchet holds it, and the only thing standing between it and a future
"let us match upstream here" is the pinned test.

Remove this entry when upstream subtracts `node.pos`
(`nodeText.substring(tag.pos - node.pos, tag.end - node.pos)`); rows 2 and 3 both collapse into
row 1 at that point and the pinned test fails.

### The completion trigger characters include a space

**Pinned by** `crates/rsvelte_language_server/tests/protocol.rs` (the `triggerCharacters`
assertion, which lists `" "`) and `scripts/compat-lsp/capability-hashes.test.mjs`.
**Ratchet.** `lsp-known-failures.json`, the
`/capabilities/completionProvider/triggerCharacters:extra-rsvelte` entry.

Upstream excludes whitespace from `completionProvider.triggerCharacters` and says why
(`server.ts:299-301`): *"No whitespace because it makes for weird/too many completions of other
completion providers"*. rsvelte includes `" "`.

That comment is upstream's own product judgement, not an assessment of rsvelte, and the two
servers do not have the same thing to trade away. rsvelte answers a completion request at a
position immediately after the space in a start tag with the element's HTML attributes —
`completions_with_strict_mode("<div ", 5, …)` returns `class`, pinned in
`crates/rsvelte_language_server/src/completions.rs`. A character absent from this list never
reaches the server at all, so dropping `" "` would not merely align the advertisement, it would
make that behaviour unreachable from a real client while the code answering it stayed.

Remove this entry if rsvelte stops serving attribute completions at a bare space, or if upstream
starts.

### Two `source.fixAll` code-action kinds upstream does not have

**Pinned by** `crates/rsvelte_language_server/tests/protocol.rs` (the `codeActionKinds`
assertion) and `scripts/compat-lsp/capability-hashes.test.mjs`.
**Ratchet.** `lsp-known-failures.json`, the
`/capabilities/codeActionProvider/codeActionKinds:extra-rsvelte` entry.

Under the differential gate's client capabilities upstream advertises six kinds; rsvelte
advertises those six plus `source.fixAll` and `source.fixAll.rsvelte`. Both are served —
`FIX_ALL_KIND` is `crates/rsvelte_language_server/src/code_actions.rs` and the tsgo-backed
`source.fixAll` is handled in `textDocument/codeAction`.

This is the direction a capability difference is allowed to run: the advertisement is wider than
upstream's because the implementation is. Narrowing it to match would hide working behaviour.

### `workspace.workspaceFolders` is advertised

**Pinned by** `crates/rsvelte_language_server/tests/protocol.rs` (the
`capabilities["workspace"]["workspaceFolders"]` assertion).
**Ratchet.** `lsp-known-failures.json`, the `/capabilities/workspace:extra-rsvelte` entry.

Upstream's `initialize` result carries no `workspace` key at all. rsvelte advertises
`workspaceFolders` with `supported` and `changeNotifications`, and acts on both: the server tracks
workspace roots and picks an overlay per document by longest matching root.

The entry is `extra-rsvelte` for the whole `workspace` object, so it is one field rather than a
set difference. As with the code-action kinds, the advertisement is truthful and matching upstream
would mean withdrawing a capability that works.

### `positionEncoding` is stated rather than defaulted

**Pinned by** `crates/rsvelte_language_server/tests/protocol.rs` (the `positionEncoding`
assertion).
**Ratchet.** `lsp-known-failures.json`, the `/capabilities/positionEncoding:extra-rsvelte` entry.

Upstream omits `positionEncoding`; rsvelte sends `"utf-16"`. The LSP default when the field is
absent **is** `utf-16`, so the two servers agree on the encoding and differ only on whether they
say so. The gate compares fields, and an absent field and a field holding the default are not the
same field, so it reports one.

Stating it is deliberate: the tsgo child is negotiated separately to UTF-8 and every internal
mapping is byte-based, so the editor-facing encoding is a value this server has an opinion about
rather than one it inherits. There is no behavioural difference to close.

### `diagnosticProvider.identifier` is advertised

**Pinned by** `crates/rsvelte_language_server/tests/protocol.rs` — the `identifier` assertion and,
in the same test, the comparison of the pulled diagnostics against a direct lint of the same
source.
**Ratchet.** `lsp-known-failures.json`, the
`/capabilities/diagnosticProvider/identifier:extra-rsvelte` entry.

Upstream advertises `diagnosticProvider` without an `identifier`; rsvelte sets it to
`rsvelte-language-server`. The field is optional in the protocol and lets a client scope
`previousResultId` per provider, which matters here because the server owns `.ts`/`.js` documents
alongside `.svelte` ones rather than running beside another provider.

The pin is deliberately two assertions and not one. Advertising a string nothing backs is the
failure mode this document already records for `completions.emmet` — a declared capability with
no implementation — so the entry that fixes the advertisement in place is paired with the one
that shows diagnostics are actually answered.


<a id="README"></a>

## Compatibility system

This directory is the evidence base for rsvelte compatibility. It contains three different kinds of data that must not be treated as interchangeable.

### 1. Shrink-only baselines

Tracked `*known-failures*.json` files are CI ratchets. Their paired Markdown files justify every remaining class of divergence. They are machine-facing paths used by JavaScript, Rust tests, and GitHub Actions, so their root-level names are intentionally stable.

| Area             | Baselines                                    | What is compared                                                        |
| ---------------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| Compiler output  | `known-failures.*`                           | Normalized JavaScript on all four targets; CSS on the two client ones   |
| Diagnostics      | `warning-*`, `error-*`, `validator-*`        | Codes, messages, positions, end positions, and frames as separate gates |
| Output validity  | `parse-*`, `sourcemap-*`                     | Emitted JavaScript parseability and source-map invariants               |
| Ecosystem        | `fmt-*`, `lint-*`, `svelte2tsx-*`, `check-*` | Formatter, linter, TSX projection, and project diagnostics              |
| Generated gates  | `matrix-*`, `mutation-*`, `css-prune-*`      | Cross-product cases and corpus-seeded mutations                         |
| Internal rollout | `dual-run-*`                                 | Implementation-to-implementation checks during refactors                |

See [gate-coverage.md](#gate-coverage) for the blind spots of every gate and [known-failures.md](#known-failures) for compiler-output residue.

### 2. Stable fixtures

- `pattern-corpus/` contains minimized real defect shapes that moving upstream repositories cannot preserve.
- `check-fixtures/` contains complete projects for svelte-check diagnostic parity.

These are tracked inputs. They are not generated reports.

### 3. Generated artifacts

`sources/`, `expected/`, `actual/`, `manifest.json`, and `report.json` are reproducible working data and are gitignored. A passing verifier removes large output trees; a failing verifier keeps them for diagnosis.

The public website does not read the ratchets directly. The reporting scripts convert them into versioned, reviewable artifacts:

- `apps/playground/static/compatibility-report.json`
- `apps/playground/static/performance-report.json`

Generate and preview them with:

```bash
pnpm report:compatibility
pnpm report:competitors:install
pnpm report:performance
pnpm dev:docs
```

The performance report uses the collected real-world component files byte-for-byte. It forms a separate accepted-file set for each pinned Svelte version class, reports warmed medians and variation, and never substitutes an unrelated workload for a missing compiler API.

### Safety rules

- Rebase or merge `main` before updating a baseline.
- Never update a baseline from a target subset, formatting-disabled run, or incomplete corpus.
- Do not infer coverage from a green gate; consult `gate-coverage.md` for what its comparison omits.
- Do not move baseline paths without updating the JavaScript path contracts, Rust gates, CI artifact paths, documentation, and cleanup allowlists together.
