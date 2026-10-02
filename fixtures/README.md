# fixtures

Test inputs copied from real projects, and the output of the official tools for them (the expected
result). One input file is one **unit**, and each unit has its own directory.
Design: [docs/fixtures.md](../docs/fixtures.md).

Hand-written tests do not go here. They live in each crate's `tests/fixtures/` and compare
rsvelte's output with its own snapshots: see [crates/fixture_test/README.md](../crates/fixture_test/README.md).

```
fixtures/
├── _registry/                  data shared by all languages
└── <family>/<source>/<path>/   one unit, e.g. svelte/bits-ui/src/lib/button.svelte/
```

`<family>` is a language family (`svelte`, `vue`, and `cross` for components compiled for
the other runtime), `<source>` is the repository the file came from, and `<path>` is the file's
path in that repository.

## Files

| File | Purpose | Written by | In git |
|---|---|---|---|
| `_registry/sources.json` | Source repositories: URL, commit, license. Unused ones stay listed with the reason. | a person | yes |
| `_registry/oracles.json` | Versions of the official tools that made `expected/`. | `regen` | yes |
| `_registry/import-report.json` | Per source: files taken, and files skipped per reason. | `import` | yes |
| `_registry/licenses/` | License files of the sources. | `import` | yes |
| `<unit>/input.*` | The copied input. | `import` | yes |
| `<unit>/meta.json` | Language, hash, and mode of the input. | `import` | yes |
| `<unit>/fixture.toml` | Manual notes: `[skip]`, `[[adjust]]` (below) and, for `cross` units, `[behaviour]` (props and user steps). `import` never changes it. | a person | yes |
| `<unit>/expected/<task>/<variant>.*` | Output of the official tool: `.js`, `.css`, `.warnings.json`, `.error.json`, or for `cross` units `.trace.json` (what the official build renders after each step). | `regen` | yes |
| `<unit>/actual/<task>/<variant>.*` | rsvelte's output, same names as `expected/`. | rsvelte tests | no |
| `<unit>/cache/<task>/<variant>.*` | Expected output too large to commit. | `regen` | no |

JavaScript is compared as a syntax tree, so positions, quote style and comments do not matter
(rules: `tools/fixtures/src/canonical.ts`).

## `fixture.toml`

```toml
[skip]
"svelte.compile/client" = "why this task does not apply"

[[adjust]]                  # accept a harmless difference in the expected output
task = "svelte.compile"
variant = "client"
at = "body.5.declaration.body.body.0.declarations.0.init.arguments.0"   # printed by `compare`
expect = "void 0"           # what the official tool has there
replace = "undefined"       # what we accept instead
reason = "same value"
```

After an update of the official tool, `adjust` reports entries that no longer fit.

## Reserved names

If a part of `<path>` is `expected`, `actual`, `cache`, `meta.json`, `fixture.toml`, `input.*`, or
starts with `~`, it is stored with a `~` in front. Example: `foo/input.svelte` is stored as
`foo/~input.svelte/`.

## Commands

Node 26 runs the TypeScript directly (version pinned in `mise.toml`).

```sh
(cd tools/fixtures && pnpm install)
F=tools/fixtures/bin/fixtures.ts
mise exec -- node $F compare --task svelte.compile --variant client   # actual/ vs expected/
mise exec -- node $F adjust                                           # check [[adjust]] entries
mise exec -- node $F upgrade      # after changing a tool version in tools/fixtures/package.json
mise exec -- node $F import --from <dir with the source checkouts>
```

## Licenses

Only permissively licensed sources are copied. Copyright stays with each source; see
`_registry/licenses/` and `_registry/sources.json`.
