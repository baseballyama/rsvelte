# corpus

Real files from permissively licensed projects, and the official tools' output for them. One
input file is one **unit**. Commands: [tools/oracle](../tools/oracle/README.md).

```
corpus/
├── _registry/
│   ├── sources.json          source repositories: URL, commit, license (written by hand)
│   ├── oracles.json          versions of the official tools that wrote expected/
│   ├── import-report.json    files taken and skipped per source
│   └── licenses/
└── <family>/<source>/<path>/ one unit, e.g. svelte/bits-ui/src/lib/button.svelte/
    ├── input.*               the copied file
    ├── meta.json             language, hash, mode
    ├── fixture.toml          [skip], [[adjust]], [behaviour] (cross units); written by hand
    ├── expected/<task>/<variant>.*   the official tool's output
    ├── actual/               rsvelte's output (ignored by git)
    └── cache/                expected output too large to commit (ignored by git)
```

Never edit `expected/`. When rsvelte's output means the same thing, add an adjustment:

```toml
[skip]
"svelte.compile/client" = "why this task does not apply"

[[adjust]]
task = "svelte.compile"
variant = "client"
at = "body.5.declaration.body.body.0.declarations.0.init.arguments.0" # printed by `compare`
expect = "void 0"     # the official output
replace = "undefined" # what we accept
reason = "same value"
```

A path segment named like a unit file (`expected`, `input.svelte`, …) or starting with `~` is
stored with a `~` in front.
