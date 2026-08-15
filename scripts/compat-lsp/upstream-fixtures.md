# Upstream language-server fixtures

`upstream-fixture-manifest.json` is the adapter contract between the pinned
`submodules/language-tools` tests and rsvelte's LSP parity harness. It records
discovery rules and counts instead of copying 300+ upstream fixture files.

The Rust inventory test resolves the manifest against the submodule and fails
when a fixture is added, removed, loses its expected JSON, or changes category.
The differential harness can consume the same roots directly. Snapshot expected
selection follows upstream's TypeScript-Go precedence for Svelte 5.

The Svelte, HTML, and CSS suites keep their assertions inline in TypeScript. The
manifest maps all 168 static `it(...)` call sites to executable behavior cases,
and the Rust adapter runs those inputs through native providers. Of those cases,
109 match and 59 record a known difference; none are skipped or unported. The
inventory checks the call-site-name multiset for each of the 11 upstream suites,
and parameterized call sites store every sample in the case.

Known differences are recorded with both official and native expectations:
selection ranges include an extra opening-element range and an empty style
range; the combined providers return CSS results in two Svelte-only cases; one
malformed HTML fold is absent; CSS diagnostics use `css_unknown_property`
instead of `unknownProperties`; and some upstream HTML/CSS language-service
features are intentionally represented by the smaller native providers. Each
such case includes the official expectation, asserted native expectation, and a
reason in the manifest.

The two exclusions mirror explicit skips in upstream's TypeScript-Go diagnostics
runner. Each exclusion has a fixture path, reason, and source location so an
unexplained skip cannot enter the fixture population.
