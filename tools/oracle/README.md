# Oracle

Runs the official tools (the oracles) over [`corpus/`](../../corpus/README.md) and writes their
output to each source's `expected/` packs, one worker per core. It also writes rsvelte's output
to `actual/`, and the expected output of the crates' upstream cases. The header of `oracle.ts`
lists every command with its options. `cargo test` compares the two outputs and keeps the parity
ledger; see [rsvelte_corpus](../../crates/language_independent/corpus/README.md).

```sh
F=tools/oracle/oracle.ts   # zsh: keep only the path in the variable
mise exec -- node $F regen       # write the official output to every source's expected/
mise exec -- node $F run-all     # write rsvelte's output to every source's actual/
mise exec -- node $F upgrade     # after changing an oracle's version in package.json
```

| Part         | What it holds                                                                       |
| ------------ | ----------------------------------------------------------------------------------- |
| `tasks/`     | One module per task: how its oracle runs and what it writes (`tasks.ts` lists them) |
| `behaviour/` | The behavior oracle: compiled components run in a DOM and in Chrome                 |
| `semantic/`  | The TypeScript projection's semantics, compared through TS 7 content mappers        |
