# oracle

Runs the oracles over the corpus in [`corpus/`](../../corpus/README.md), compares rsvelte's
output with theirs, and copies cases into the crates' `tests/fixtures/`. The header of
`oracle.ts` lists every command with its options.

```sh
F=tools/oracle/oracle.ts   # zsh: keep only the path in the variable
mise exec -- node $F run-all     # write rsvelte's output to every unit's actual/
mise exec -- node $F check       # the parity ratchet
mise exec -- node $F upgrade     # after changing an oracle's version in package.json
```

| Part         | What it holds                                                                       |
| ------------ | ----------------------------------------------------------------------------------- |
| `tasks/`     | One module per task: how its oracle runs and what it writes (`tasks.ts` lists them) |
| `behaviour/` | The behaviour oracle: compiled components run in a DOM and in Chrome                |
| `semantic/`  | The TypeScript projection's semantics, compared through TS 7 content mappers        |
