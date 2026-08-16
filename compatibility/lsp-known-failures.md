# LSP differential known failures

`lsp-known-failures.json` contains 0 entries. Fixture and upstream entries identify one normalized
structural field for which `rsvelte-language-server` differs from the pinned official
`svelte-language-server`, or from an upstream expected snapshot. A mismatched scalar key includes
both value digests; a missing/extra field includes the present-side digest. Unmatched semantic
array items are represented by their count and multiset digest.

The real-world corpus uses one compact entry per `(file, method)`. Its key records the divergent
request count, raw divergent-field count, and a digest over every sorted
`(position, value-aware diff pointers)` observation. This retains exact regression sensitivity
without committing one repeated path prefix per identifier: another wrong field in a known
response, a different position with the same count, and a fix/regression swap all change the
digest; count growth and shrinkage change the key directly.

The ratchet is shrink-only and two-sided: a new entry and an entry that no longer reproduces both
fail verification. Baseline updates require one fixture/upstream artifact and eight
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
After the project-ready positive control, corpus requests have a two-second deadline. A timeout is
cancelled and compared as a stable transport-error response instead of aborting or silently shrinking
the rest of the population.

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
merge requires their sums to equal that manifest.

Normalization removes only these non-parity fields and path-specific values:

- `initialize.result.serverInfo`
- `textDocument/diagnostic.resultId`
- the absolute workspace URI, replaced with `<workspaceUri>`
- the prefix through `/node_modules/`, replaced with `<node_modules>`

Object keys are sorted for stable serialization. Diagnostics, completion items, locations,
folding ranges, and inlay hints are matched by method-specific semantic identities before their
fields are diffed, so an ordering change does not renumber unrelated entries. Other arrays are
compared as multisets of exact values. All remaining response fields retain their original values.
