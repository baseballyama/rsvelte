# TypeScript projection tests

The crate fixture test reads the compiler's input population through `Fixtures::inputs_from`.
Own TS, source-map and unsupported-diagnostic snapshots detect regressions. An independent
parser rejects invalid emitted TS on every applicable case, including external inputs.
These checks do not compare type semantics with svelte2tsx.

## Semantic harness

The runnable harness is `tools/fixtures/bin/projection-semantics.ts`. It runs the real Rust
projection and svelte2tsx, then asks native TS 7.1 for types at mapped identifiers and expressions.
One native project contains both original `.svelte` files as separate modules. The shared Rust
content mapper serves both saved projections. Native TypeScript loads their ASTs and span maps.
Both virtual files use TypeScript syntax. The oracle runs with `isTsFile: true`, including
JavaScript inputs, so inferred props become TS annotations. Its JavaScript output uses JSDoc,
which native TypeScript ignores in a `.ts` virtual file. The report records this oracle option.
Both use the same compiler options,
Svelte types and element declarations. The JS oracle uses its own generator dependencies;
neither side uses the TS 6 checker.

```sh
cargo build --offline -p rsvelte_typescript_content_mapper -p rsvelte_svelte_typescript_projection --bins --example semantic
mise exec -- node tools/fixtures/bin/projection-semantics.ts --report /tmp/projection-semantics.json
mise exec -- node --test tools/fixtures/test/projection-semantics.test.ts tools/fixtures/test/content-mapper.test.ts
```

Svelte inputs default to the compiler's complete `tests/fixtures` population. `--inputs` selects a
different fixture root, `--filter` selects relative paths, and `--limit` selects a positive
number of units. `--projector` selects the standalone Rust executable. The report counts all
inputs, exclusions, unit verdicts and query verdicts. It records source and tool hashes,
versions, options, declaration hashes and phase times. A mismatch exits with status 1;
a run with no matching query exits with status 2.

The historical [template coverage summary](../tools/fixtures/reports/typescript-projection/template-coverage-7.1-summary.json)
includes the identity and population before public contract support. Complete rows are in `template-coverage-7.1.json.gz` beside it.
The earlier `summary.json` and `semantic.json.gz` retain the TS 7.0.2 measurement.
The older `content-mapper-7.1` report mapped diagnostic positions twice. Its unit verdicts
are invalid; its type-query records are historical evidence.

The library APIs are `SemanticChecker.compare`, `projections` and `comparePopulation`.
The checker process is reused, while each unit gets a new snapshot. Type and symbol requests
are batched. Mapper options include each pair's hash so changes to a projection invalidate
the native transform cache, including defect controls with unchanged source text.
Comparisons inspect properties, optional and readonly flags, signatures, generic
constraints and defaults, arrays, tuples, unions and recursive graphs, plus bidirectional
assignability. Printed types only explain results; they are not the equality test.

The native API uses `runExternalCode: true`. Its decoded source files retain `originalText`,
`contentMapper`, and `spanMap`. Type queries use that native span map. Native diagnostic
positions already refer to original text. Diagnostics with a virtual-location notice remain
`UNMEASURED`; they must not be mapped as original positions.
`RSVELTE_TYPESCRIPT_CONTENT_MAPPER` can select a different precomputed mapper executable.
The report hashes the mapper binary as well as the projector and harness.

Queries that cannot be mapped, error types, missing dependencies, native API failures,
unsupported type kinds, ambiguous union shapes and graphs above the declared limits are
`UNMEASURED`. Nominal brands
from separate generated declarations need a source-identity adapter and remain unmeasured.
Unmappable diagnostics also prevent a complete match. Required-property deletion, callback
type changes and `any` replacement are defect controls in the tests.

The harness measures source-visible types, diagnostics, and public component contracts.
Contracts compare real props, instance exports, and bindable-key types. The adapter accepts
Svelte's `Component` and the oracle's isomorphic wrapper, so legacy constructor details do
not select equivalence. Missing default exports are mismatches. Oracle wrappers that do not
expose bindable keys and other unsupported contract shapes remain `UNMEASURED`.
The report counts public contract verdicts separately; an unmeasured contract prevents a
complete unit match.

## Contract coverage

Pin the exact `typescript-7` version: its native `unstable` API can change. Production projection
remains Rust-only. Compare observations by original source span and semantic role. Generated
helper names and TS formatting do not select observations.

| Check | Coverage |
|---|---|
| Source type queries | Identifiers, literals, calls, members, callbacks and other supported expressions |
| Source diagnostics | Rejected source observations; codes and messages are evidence, not equality keys |
| Public component types | Required/optional props, instance exports and bindable keys |
| Consumer integration | Separate original Svelte files imported through native content mapping; accepted and rejected props and callbacks |
| Unsupported contracts | Generic components, snippets and other unsupported shapes remain unmeasured |

Consumer integration tests include required props, wrong prop types, callback types, defaults,
exports and bindable keys. The [shared type information service](type-information.md) also
checks that typecheck and typed lint queries use one native Program. A finite set of
observations gives evidence, not proof of every possible type use. Both projections
can share a bug, so handwritten structural assertions also cover `any`, `unknown`, `never`,
readonly fields, generic defaults, union order and recursion.

Do not infer performance from the choice of checker. Use measured phase costs and the
performance tools for CPU, allocation and cache measurements. These phase times include
native IPC and do not isolate checker CPU cycles.

Confirmed oracle bugs and intended semantic differences need narrow per-observation
adjustments with reasons. The harness currently applies no adjustments and accepts no
whole-unit difference baseline. Exact source-map ranges remain a separate test.
