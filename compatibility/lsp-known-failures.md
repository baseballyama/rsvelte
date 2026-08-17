# LSP differential known failures

`lsp-known-failures.json` contains 32679 entries. Fixture and upstream entries identify one normalized
structural field for which `rsvelte-language-server` differs from the pinned official
`svelte-language-server`, or from an upstream expected snapshot. A mismatched scalar key includes
both value digests; a missing/extra field includes the present-side digest. Unmatched semantic
array items are represented by their count and multiset digest.

Partition of `lsp-known-failures.json` by key kind: `21792 + 10479 + 408` — real-world corpus
aggregates, per-field divergences against the pinned official server, and per-field divergences
against an upstream expected snapshot. The three prefixes (`aggregate:corpus/`, `differential:`,
`expected:`) are disjoint by construction in `merge-current.mjs`, which rejects an artifact
carrying a key outside its suite's prefix.

Partition of `lsp-known-failures.json` by request phase: `16348 + 16331`

Opened-document keys and post-`didChange` keys. The edit phase re-runs the same request set, so the
two addends differ by exactly the 17 session-level positive controls, which run once per session
rather than once per unit; all 17 are `differential:` keys, and the corpus and upstream halves
double exactly. The opened addend is unchanged from the pre-edit-phase baseline: the merge that
introduced the second phase reported 16331 new entries and **0 stale**, so not one opened-phase key
moved.

Partition of `lsp-known-failures.json` entries under `aggregate:corpus/` by repository: `3696 + 7758 + 258 + 10080`

bits-ui, flowbite-svelte, melt-ui, shadcn-svelte, in that order. This is the count
that moves when a corpus submodule is bumped, and it is the reason the population floor is
committed separately: a repository dropping out shrinks its cluster to zero and would otherwise
read as a clean burndown.

The real-world corpus uses one compact entry per `(file, method)`, and its key records the divergent
request count and nothing else. It carried a raw divergent-field count and a digest over every
sorted `(position, value-aware diff pointers)` observation until two full sweeps of one revision
were compared: **664 of that revision's 16,348 keys moved between them** — 661 on the digest alone, 3 on the field
count — while the request count agreed on every one, and `textDocument/completion` owned 661 of the
664 against zero for `textDocument/definition`. A key that does not reproduce cannot ratchet, so
the two irreproducible components are out. Both sweeps reproduce the committed baseline exactly.

What that costs is stated rather than implied: within a `(file, method)` whose divergent-request
count does not move, another wrong field in a known response, a different diverging position, and a
fix/regression swap are all invisible here. Count growth and shrinkage still change the key
directly, and the fixture and upstream suites keep per-field keys, so the loss is confined to the
corpus aggregate.

Every unit is compared twice. The harness sends `didOpen`, runs the request set, then applies a
deterministic `didChange` script derived from the source and runs the **same** request set again.
The script inserts an `import` at the end of the first `<script>`, a rule at the end of the first
`<style>`, and an unclosed `{#if}` at EOF, then removes all three in reverse — every change an
incremental range on both legs, because a full-document undo would restore a server whose
incremental apply is broken. The final text is asserted byte-identical to the opened text, so the
second phase asks each server whether it returns to the answer it gave from scratch, at the same
positions, and a divergence there is a state-transition difference alone. Keys from the second phase
carry `|phase=edit`; the opened phase carries no segment, so its keys are the ones this ratchet has
always held and a baseline diff shows the edit phase as pure addition. The phase has to be in the
key: without it an opened-phase entry would suppress a post-edit divergence in the same
`(unit, method)`, which is the #2521 failure mode.

The ratchet is shrink-only and two-sided: a new entry and an entry that no longer reproduces both
fail verification. Baseline updates require one fixture/upstream artifact and sixteen
stable-hash corpus artifacts with `--write-current`; `merge-current.mjs` accepts only the complete,
disjoint union at one project, language-tools, corpus-source, and comparison-configuration revision.
It checks the union's file-universe hash and the committed per-repository file/identifier/request
population before `--update-baseline` may write. Missing, duplicate, subset, and mixed-revision
artifacts are rejected as false shrink. A normal merge compares the complete union with the
committed ratchet.

Fixture and pinned-upstream runs are trusted so their committed project configuration is observable.
Real-world corpus runs are deliberately untrusted: the gate must not execute arbitrary configuration
from collected repositories, and its result must not depend on installing four applications' package
graphs. Both servers receive the same trust bit; preprocess/config execution has dedicated fixtures.
After the project-ready positive control, corpus requests have a `--request-timeout-ms` deadline
(180 s). A timeout is cancelled and compared as a stable transport-error response, which means the
deadline is part of the measurement rather than a safety net around it: at the original two seconds
one shard measured 2,304 timeouts and then 1,645, moving 201 of its 1,380 entries — including 53
divergent-request counts. At 60 s the whole 1.9-million-request sweep had 12. Any timeout therefore
fails the run after the artifact is written, so a load-dependent key cannot be baselined; raise the
deadline instead.

`configurationId` in `scripts/compat-lsp/artifacts.mjs` is the artifact schema for the comparison
contract. Any change to request construction, normalization, semantic array identity, or diff-key
encoding must bump it so artifacts produced by different contracts cannot be merged.

Every run must happen in an **installed** workspace. The shadow's TypeScript program reaches the
repository root for ambient `@types`, so an uninstalled tree measures a smaller global scope: the
fixture suite yields 4380 keys without root `node_modules` and 4397 with it, and the completion-item
counts embedded in those keys move with it. This is not a preference — the two jobs that run this
comparison (`Language server` in `ci.yml` and `LSP fixture parity current` in `corpus-compat.yml`)
provisioned the tree differently at first, and only one of them could ever have satisfied the
resulting baseline. `verify.mjs` now refuses to run without it.

The population floor is `scripts/compat-lsp/corpus-population.json`. An intentional corpus
submodule bump must use an unsharded, all-suite, all-repository `--update-population` run; ordinary
population loss is an error. Shard-local reports retain their exact measured population and the
merge requires their sums to equal that manifest. It counts the **input** universe — files,
identifiers, and identifiers × 3 methods — not the compared request count, which is twice that
because every unit is requested in both phases; `report.json`'s `compared` is what carries the
latter.

Normalization removes only these non-parity fields and path-specific values:

- `initialize.result.serverInfo`
- `textDocument/diagnostic.resultId`
- the absolute workspace URI, replaced with `<workspaceUri>`
- the prefix through `/node_modules/`, replaced with `<node_modules>`

Object keys are sorted for stable serialization. Diagnostics, completion items, locations,
folding ranges, and inlay hints are matched by method-specific semantic identities before their
fields are diffed, so an ordering change does not renumber unrelated entries. Other arrays are
compared as multisets of exact values. All remaining response fields retain their original values.
