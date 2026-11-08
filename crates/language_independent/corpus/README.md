# rsvelte_corpus

Compares rsvelte with the official tools over [the corpus](../../../corpus/README.md).
`crates/hosts/command_line/tests/corpus.rs` is the one test that uses it: each unit is read and
parsed once, every task runs on it, and each output is compared as soon as it is final.

```sh
cargo test -p rsvelte_command_line --test corpus                    # compare with the ledger
UPDATE_EXPECT=1 cargo test -p rsvelte_command_line --test corpus    # record the verdicts
CORPUS_FILTER=svelte/bits-ui/ cargo test -p rsvelte_command_line --test corpus
CORPUS_ACTUAL=1 cargo test -p rsvelte_command_line --test corpus    # write actual/ packs
CORPUS_MOVES=<file> cargo test -p rsvelte_command_line --test corpus
```

`CORPUS_MOVES` writes every move to the file; the run prints only the first ones per task.

## Verdicts

Each unit gets one verdict per task and variant. The official files are paired with rsvelte's by
name; `warnings.json` is paired with rsvelte's diagnostics and `lint.txt` with `lint.json`.

| Verdict       | Meaning                                                                      |
| ------------- | ---------------------------------------------------------------------------- |
| `match`       | every file agrees                                                            |
| `unexpected`  | rsvelte wrote a file the official tool did not, or accepted what it rejected |
| `missing`     | the official tool wrote a file rsvelte did not                               |
| `mismatch`    | a file differs                                                               |
| `unparseable` | rsvelte's JavaScript does not parse                                          |
| `refused`     | rsvelte rejected a unit the official tool accepted                           |
| `panicked`    | a task panicked                                                              |

A unit's verdict is that of its worst file: the lowest row of the table that applies. JavaScript
is compared as a syntax tree (comments, layout and the spelling of literals are ignored), lint
findings only for the rules rsvelte ran, JSON as values, and the rest as bytes. When both tools
reject a unit, the compile error must be the same.

## The ledger

`corpus/_registry/parity/<task>/<variant>.txt` lists every unit that does not match, under a
header that counts the matches. A verdict that moves in either direction fails the test until it
is recorded, so a fix is kept and a regression is seen. `UPDATE_EXPECT=1` refuses a filtered run,
since the count would be wrong.
