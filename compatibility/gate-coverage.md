# Gate coverage — what each gate cannot see

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
[`two-ports-inventory.md`](two-ports-inventory.md): *how many times does rsvelte answer
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

## A named blind-spot class: the vacuous green

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

## A named blind-spot class: the one-directional verdict vocabulary

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

## Reading the corpus in one sentence

The collected corpus samples the *marginal* distribution of published Svelte code. That is
the axis that is saturated. The two axes that still find defects are **what we compare**
(fields, not files) and **how inputs are constructed** (generated products, not collected
samples) — see `AGENTS.md` § "Generated shape matrix" and issue #2281.

---

## Summary

| # | Gate | Unit compared | Sharpest blind spot | Ev. |
|---|------|---------------|---------------------|-----|
| 1 | Compiler output parity (`verify.mjs`) | per-entry × per-target JS text + CSS text | comments, on every entry and every target | [D] |
| 2 | Compiler warning codes | multiset of `code` per entry × target | warning **message text** (#2403); a rule family measured at **one** of its ~40 codes (2d) | [D] |
| 3 | Compiler warning positions | multiset of `code@line:col` | warning **end** span | [S] |
| 4 | Compiler **error** parity | `error.json` `code`, `message`, `start`, `end`, `frame` | `filename`; the NAPI entries the corpus does not call; a missing artifact scored `match` until the per-tree precondition | [D] |
| 5 | Generated shape matrix | per-case × target JS text + warning `code` multiset, or error `code` where official rejects | neither output is parsed — identical **non-JavaScript** scores `match`; CSS; warning **position**; error **message** and **position**; multi-directive and ancestry rules; whether a folded constant is the *right* value | [D] |
| 6 | svelte2tsx TSX text parity | per-component TSX text, oxfmt-normalized | `exportedNames` / `events`; TSX line+column layout; anything about an error both sides raise | [S] [D] |
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
| 20 | Corpus-seeded mutation fuzz | per-mutant × target JS text, normalized as gate 1 | the operator only **inserts comments** — a delimiter in a *string* is unreachable at any corpus size | [D] |
| 21 | Published-artifact glibc floor | max `GLIBC_*` version referenced by each Linux artifact | whether the binary actually **runs** anywhere; every non-glibc dependency | [D] |
| 22 | NAPI option boundary | per declared option key: baseline vs. one-key variant, through the raw addon | it never compares against **official** — a key wired to the wrong semantics stays green | [S] |
| 23 | Escaped-quote lookback shape | one line of Rust source, over every `.rs` under `crates/` + `apps/` | it matches a **spelling**; a scanner with *no* escape check at all produces no line to match | [D] |
| 24 | `await_waterfall` runtime parity | the `await_waterfall` warnings a **mounted** rsvelte-compiled component logs vs. official's, 3 cases | one warning code, one component shape; nothing else about the running component is observed | [D] |
| 25 | Differential output-preservation corpus hash | per `.svelte` source × client/server/client-dev/server-dev hash from base-core vs merge-ref-core | changes outside `crates/rsvelte_core`; every PR without the maintainer-applied `output-preserving` label | [S] |
| 26 | esrap generated-output corpus | parsed JS output × official/rsvelte tree × 4 targets; AST equivalence, comment kind/body sequence, code/map equality, map bounds/order | production synthetic AST spans and whether a mapping points at the corresponding source token | [S] |
| 27 | LSP differential parity | normalized JSON response field per request against the pinned official server and selected upstream snapshots | **every server notification**; incremental edit and resolve sequences; **inside a corpus `(file, method)`, everything but the divergent-request count** | [S] [D] |
| 39 | svelte2tsx option axis | full TSX text per (option variant x source) against the official tool, options carried in the fixture | option values outside its grid (`rewriteExternalImports`, `runes`, most `namespace` x `mode` products); `emitDts`; the map, `exportedNames` and `events` | [S] [D] |
| 38 | NAPI `cssHash` | the scope class the callback produces, and the callback's own argument list, against **official** | one component shape and one option set; only `css.code` / the class in `js.code`; nothing about the wasm or facade ports of the same option | [S] |
| 39 | Print fixture suite (`tests/print.rs`) | per-sample printed Svelte text vs upstream's `output.svelte` | it compares the text, not **which code produced it** — a source-text shortcut around the whole AST printer was invisible for 43 of 43 samples | [D] |
| 40 | Wasm compile-option boundary | six rejection outcomes against **official**, plus named callback/warning behaviours | most valid option values; error positions; interaction/order between two invalid keys; C ABI and NAPI ports | [S] |

Cross-cutting blind spots (**ratchet keys losing in both directions**, path filters, ratchet-doc
drift, vacuity floors, the **performance**
gates' population, and **an uninitialised corpus source shrinking every corpus gate silently**)
are in [§ Cross-cutting](#cross-cutting) at the end.

## 39. svelte2tsx option axis — `crates/rsvelte_projection/tests/svelte2tsx_option_axis.rs`

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

## 26. esrap generated-output corpus — `scripts/compat-corpus/esrap-verify.mjs`

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
server is additionally held to those same upstream snapshots as a run-level precondition (27h).

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
the field count and the digest are gone and the key is the request count alone; both sweeps then
reproduce the committed baseline with 0 new and 0 stale.

What that removes is real and is not recoverable from any other row: for a `(file, method)` already
listed, a newly wrong field in an already-divergent response, a divergence moving to a different
position, and a simultaneous fix-plus-regression are now all invisible. Only a change in **how many
requests** diverge in that file is observed. The fixture and upstream suites are unaffected — they
still key one normalized field each — so this is a corpus-population blind spot, not a gate-wide
one. The unmeasured question is whether a stable projection of a completion response exists that
would restore per-field sensitivity; nobody has looked, and n=2 sweeps bound the churn only from
below.

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

---

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

### Blind spot 1b — comment ordering, not position

`ast_equiv/src/lib.rs:234` compares comments as an ordered `Vec<String>`. A meaningful comment
that moves within the file with no other change is equivalent. **[S]**, and moot today
because 1a means no gate reaches this code path with `Meaningful`.

### Blind spot 1c — everything the compiler returns except `js.code`, `css.code`, `warnings`

`compile.mjs:106-110` builds the recorded result from exactly three fields. **Discarded:**
`result.js.map`, `result.css.map`, `result.metadata` (including the `runes` flag),
`result.ast`. **[S]** A `metadata.runes` regression produces zero corpus signal.

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


### Blind spot 6f — a BOM-induced offset shift is absorbed by the reformatter

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

**Note on exclusions:** `fmt-oracle-excluded.json` holds 22 entries, each with a written
justification (2 migrate, ~10 oracle-bug, 2 invalid-input, 4 oxc-vs-prettier layout, 1 platform
nondeterminism, 3 oxfmt-internal CSS disagreement). This is a *small, justified* set — noted
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
`:1011-1028`; staleness fatal at `:1061`. Ratchet: 74 entries.

### Blind spot 14a — segments rsvelte *adds* are never inspected

`parity()` iterates `theirs.lines` only (`:537`). **[S]** A segment rsvelte emits at a generated
position where the official map has none is never visited; `out_of_range` (`:463-501`) flags
only positions past end-of-line and `has_negative_segment` (`:507`) only negatives, so an extra
mapping to an in-range original position passes all three checks.

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

#3130 enrolled all four (and 63 more), taking the corpus from 37 corpus sources to 104 and
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
vary. It does **not** assert equality — see C8 for why. It asserts the recorded curation is
unchanged.

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
exclude the file's mode. Two of the 22 `default-on-here` entries are exactly such rules
(`no-goto-without-base`, `no-navigation-without-base`), so for a non-SvelteKit user the true
default-on set is smaller than 56 and this gate reports the larger number. Reading the table is
still the right unit for "did the curation change"; it is the wrong unit for "what does a user see".

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

`missing`/`extra` are scoped to the shared default-on set precisely so gate 33's 29-entry curation
does not reappear here as ~2,100 finding-level entries. The cost is that the **findings** of a rule
one side runs by default and the other does not are compared by no gate under default
configuration: gate 28 compares them with both sides forced to `"warn"`, and gate 33 compares only
that the membership difference is unchanged. A rule that behaves differently *because* of its
default severity or options would fall between the two. Unmeasured how large that class is.

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
`compatibility/parse-ast-known-failures.json`, 480 keys, justified per cluster in the paired
`.md`. Runs as a step in the `corpus` job (~50s over 28,208 compared pairs).

**Why it exists.** `parse()` is a documented export of `svelte/compiler`, distinct from
`compile()`, and nothing here compared its return value to official's. It is the
`result.warnings` hole one export over — invisible *by construction, at any corpus size*, not
for want of inputs: the pipeline had 14,331 components and never called the function.

**[D] The comparator manufactures nothing.** Running the gate's own `diffKeys` with the
**official** compiler on both sides of the same population produces **0 keys from 28,178
self-compared pairs**, so all 652 listed keys are attributable to rsvelte's side rather than to
the harness. Two failure directions were also driven: deleting `modern::Root#span` from the
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
does not descend into a key that is `#missing` or `#extra`. So the 141 `node-type` keys and the
75 `estree-fields` keys each hide an entire subtree that has never been compared: fixing one will
*add* keys as its children become reachable. This is the same one-directional coupling the
lint gates have between `start` and `end` — expected, not a regression.

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

Measured, not assumed. Over the 84 rule ids the two share, rsvelte's default preset
(`LintConfig::recommended()`, "every rule at its declared default severity") runs **56** and
eslint-plugin-svelte's `flat/recommended` runs **36**. The sets differ in both directions: 22 rules
run by default in rsvelte that upstream's recommended leaves off (`no-inline-styles`,
`no-unused-class-name`, `prefer-const`, `no-target-blank`, `block-lang`, `consistent-selector-style`,
`require-stores-init`, …), and **2 that upstream's recommended enables at `error` and rsvelte leaves
off** — `svelte/no-unused-props` and `svelte/require-event-dispatcher-types`, i.e. a user on defaults
gets *fewer* checks than eslint-plugin-svelte would give them.

Membership was not the whole of it, and that is the part worth carrying forward. Twenty-one further
rules ran by default on **both** sides at different severities — upstream `error`, rsvelte `warn` —
which decides the CLI's exit code in both tools. Those were fixed, not recorded; see gate 33.

This is not filed as a divergence because rsvelte's `recommended` is a documented preset of its own
(`apps/npm/lint/README.md`: "runs every rule at its declared default severity"), not a claimed port
of upstream's. The hazard was that the *name* is the same and nothing measured the gap, so a drift
in either direction was invisible.

**Gate 33 now measures it, and the way it does so is the point.** The obvious gate — assert the two
enabled sets are equal — would encode a product decision (which preset rsvelte's default should be)
as a correctness claim, and that decision belongs to a person. `lint-preset.mjs` instead ratchets
the *difference*, two-sided, one key per rule: the curation is whatever it is, but it cannot change,
and a rule cannot be ported or added, without the decision surfacing as a failing entry that needs a
written reason.

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
