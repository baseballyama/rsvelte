# corpus

Real files from permissively licensed projects, and the official tools' output for them. One
input file is one **unit**. Commands: [tools/oracle](../tools/oracle/README.md). The sources
whose names start with `rsvelte` hold this project's own cases, kept in [`_own/`](_own/README.md).

```
corpus/
├── _own/                     the files of the `rsvelte` sources, written for this project
├── _registry/
│   ├── sources.json          source repositories: URL, commit, license (written by hand)
│   ├── units.toml            the hand-written part of units: skips, and the behaviour tasks' props
│   │                         and steps (no corpus unit uses them today)
│   ├── unparseable.txt       skips regen writes where a task's oracle JavaScript does not parse
│   ├── readers.toml          tasks that compare one file of another task's output
│   ├── tsconfig.json         the project configuration of both type checkers
│   ├── oracles.json          versions of the official tools, and the rules the linter ran
│   ├── parity/<task>/<variant>.txt   the recorded verdicts
│   ├── import-report.json    files taken and skipped per source
│   └── licenses/
└── <family>/<source>/        one source, e.g. svelte/bits-ui/
    ├── inputs.pack           every unit's file, with its language and mode
    ├── expected/<task>/<variant>.pack   the official tools' output
    └── actual/               rsvelte's output, on request (ignored by git): packs
                              <task>/<variant>.pack from CORPUS_ACTUAL=1 cargo test --test corpus,
                              loose <unit path>/<task>/ files from oracle run-all
```

The corpus holds only the `svelte` family today. The `vue` and `cross` languages in
[languages.ts](../tools/oracle/languages.ts) admit files from no registered source, so the
`vue.*`, `svue.*` and `vuelte.*` tasks measure no corpus unit.

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

A skip names one task. `svelte.compile.warnings` reads the `warnings.json` of the
`svelte.compile/client` pack (`readers.toml`), so it keeps comparing a unit skipped for the
client until `units.toml` skips `svelte.compile.warnings` as well. A pack holds a unit's entries
while any task that reads the pack applies. After adding a skip, run
`oracle regen --task <task> --path <unit key>`. The corpus test fails on an entry that no reader
of its pack applies to.

Oracle JavaScript that does not parse fails the regen, unless the task sets `unparseable`
(`types.ts`): regen then writes no entry for the unit and skips it in `unparseable.txt` with the
task's reason, the parser's message and a tag. ts.compile does, since `transpileModule` writes
what it can of a file it reports errors for. Every regen rewrites the lines of the units and tasks
it ran.

No task compares a legacy component, since Svelte 4 legacy mode is a non-goal: one in legacy
mode that uses syntax runes mode rejects (`export let`, `$:`, `$$props`, `$$restProps` or
`runes={false}`).
