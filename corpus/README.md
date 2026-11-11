# corpus

Real files from permissively licensed projects, and the official tools' output for them. One
input file is one **unit**. Commands: [tools/oracle](../tools/oracle/README.md). The sources
whose names start with `rsvelte` hold this project's own cases, kept in [`_own/`](_own/README.md).

```
corpus/
├── _own/                     the files of the `rsvelte` sources, written for this project
├── _registry/
│   ├── sources.json          source repositories: URL, commit, license (written by hand)
│   ├── units.toml            the hand-written part of units: skips, behaviour (cross units)
│   ├── tsconfig.json         the project configuration of both type checkers
│   ├── oracles.json          versions of the official tools, and the rules the linter ran
│   ├── parity/<task>/<variant>.txt   the recorded verdicts
│   ├── import-report.json    files taken and skipped per source
│   └── licenses/
└── <family>/<source>/        one source, e.g. svelte/bits-ui/
    ├── inputs.pack           every unit's file, with its language and mode
    ├── expected/<task>/<variant>.pack   the official tools' output
    └── actual/               rsvelte's output, on request (ignored by git)
```

A pack is one text file that holds many: each entry is a line
`=== <length in bytes> <path>\t<attributes>` and then the file's bytes. A source is then a few
files for git and CI instead of thousands.

Never edit `expected/`. `cargo test -p rsvelte_command_line --test corpus` compares rsvelte with
it ([rsvelte_corpus](../crates/language_independent/corpus/README.md)). A task the official
output cannot be trusted on for a unit is skipped in `units.toml`:

```toml
["svelte/<source>/<path>".skip]
"svelte.compile/client" = "why this task does not apply"
```
