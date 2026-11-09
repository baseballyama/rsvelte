# The corpus comparison

This crate compares rsvelte with the official tools over [the corpus](../../../corpus/README.md).
One test uses it: `crates/hosts/command_line/tests/corpus.rs`. The test reads and parses each unit
once and runs every task on it. It compares each output as soon as the output is final.

```sh
cargo test -p rsvelte_command_line --test corpus                    # compare with the ledger
UPDATE_EXPECT=1 cargo test -p rsvelte_command_line --test corpus    # record the verdicts
CORPUS_FILTER=svelte/bits-ui/ cargo test -p rsvelte_command_line --test corpus
CORPUS_ACTUAL=1 cargo test -p rsvelte_command_line --test corpus    # write actual/ packs
CORPUS_MOVES=<file> cargo test -p rsvelte_command_line --test corpus
```

`CORPUS_MOVES` writes every move to the file. The run itself prints only the first moves per task.

## Verdicts

Each unit gets one verdict per task and variant. The test pairs each official file with the
rsvelte file of the same name. Two names differ: `warnings.json` pairs with rsvelte's diagnostics,
and `lint.txt` pairs with `lint.json`.

| Verdict       | Meaning                                                                      |
| ------------- | ---------------------------------------------------------------------------- |
| `match`       | every file agrees                                                            |
| `unexpected`  | rsvelte wrote a file the official tool did not, or accepted what it rejected |
| `missing`     | the official tool wrote a file rsvelte did not                               |
| `mismatch`    | a file differs                                                               |
| `unparseable` | rsvelte's JavaScript does not parse                                          |
| `refused`     | rsvelte rejected a unit the official tool accepted                           |
| `panicked`    | a task panicked                                                              |

A unit takes the verdict of its worst file: the lowest row of the table that applies. The test
compares JavaScript as a syntax tree, so comments, layout and the spelling of literals do not
count. It compares lint findings only for the rules rsvelte ran. JSON counts as values and
everything else as bytes. When both tools reject a unit, the compile errors must agree.

## The ledger

`corpus/_registry/parity/<task>/<variant>.txt` lists every unit that does not match. Its header
counts the matches. A verdict that moves in either direction fails the test until you record it.
That way a fix stays, and a regression shows. `UPDATE_EXPECT=1` refuses a filtered run, because
the count would then be wrong.
