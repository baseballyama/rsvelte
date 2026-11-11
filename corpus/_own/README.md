# rsvelte's own units

Cases written for this project, not taken from another repository. Each one pins a defect that
was fixed, or a shape no real project in the corpus happens to use. They are units like any
other: the official tools give the expected output, and `cargo test` keeps their verdicts in the
parity ledger. A case the official compiler rejects stays a unit: the rejection is its expected
result.

| Directory               | Source                    | What it holds                                  |
| ----------------------- | ------------------------- | ---------------------------------------------- |
| `rsvelte/pattern/`      | `rsvelte`                 | compiler, formatter and svelte2tsx repros      |
| `rsvelte/lint/`         | `rsvelte`                 | lint cases, one directory per rule             |
| `rsvelte/lint-env/`     | `rsvelte`                 | lint cases whose `package.json` varies         |
| `rsvelte/check/`        | `rsvelte`                 | type check projects                            |
| `rsvelte/crates/`       | `rsvelte`                 | files the crates' tests read                   |
| `rsvelte/lsp/`          | `rsvelte`                 | language server probes                         |
| `main-tests/core-1/` …  | `rsvelte-tests-core-1` …  | inputs of the compiler's tests                 |
| `main-tests/formatter/` | `rsvelte-tests-formatter` | inputs of the formatter's tests                |
| `main-tests/other/`     | `rsvelte-tests`           | inputs of the other crates' tests              |
| `held/`                 | none                      | inputs that wait for a fix                     |

`rsvelte/` came from the files of `main` at 41abfd8a6c; `issues/<file>.md` beside a repro says
why it exists. `main-tests/` holds every component and module the tests of `main` at the same
commit passed to the compiler, the formatter, the linter or svelte2tsx, one directory per test.
The type checker sees each source as one project, so `main-tests/` is split into sources small
enough for svelte-check.

`held/` keeps inputs that no source reads yet, by why: rsvelte panics on them (`panic/`), prints
a projection that is not TypeScript (`invalid-projection/`) or overflows its stack
(`stack-overflow/`), or the official svelte-check overflows its stack (`official-stack-overflow/`).
Each of the first three stops the corpus test or the performance ratchet for everyone, so the
input waits here. When its fix lands, move it back to the source its directory names.

In `check/`, only components and rune modules are units; the corpus does not read the
`tsconfig.json`, `svelte.config.js` and `.ts` files beside them.

## Adding a case

Put the file in the directory under `rsvelte/` of the tool whose bug it pins, then:

```sh
F=tools/oracle/oracle.ts
mise exec -- node $F import --source rsvelte
mise exec -- node $F regen --source rsvelte
UPDATE_EXPECT=1 cargo test -p rsvelte_command_line --test corpus
```

A file with the same content as a unit of another source is dropped as a duplicate.
