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
    ├── fixture.toml          [skip], [behaviour] (cross units); written by hand
    ├── expected/<task>/<variant>.*   the official tool's output
    ├── actual/               rsvelte's output, on request (ignored by git)
    └── cache/                expected output too large to commit (ignored by git)
```

Never edit `expected/`. `cargo test` compares rsvelte with it and records each unit's verdict in
`_registry/parity.json` ([crates/test_harness](../crates/test_harness/README.md)). A task that does
not apply to a unit is skipped:

```toml
[skip]
"svelte.compile/client" = "why this task does not apply"
```

A path segment named like a unit file (`expected`, `input.svelte`, …) or starting with `~` is
stored with a `~` in front.
