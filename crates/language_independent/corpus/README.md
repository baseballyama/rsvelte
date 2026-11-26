# The corpus comparison

This crate compares rsvelte with the official tools over [the corpus](../../../corpus/README.md).
The corpus test (`crates/hosts/command_line/tests/corpus.rs`) uses it, and so does the
command-line host wherever it loads corpus units or writes task files. The test reads and parses each unit once and runs every task on
it. It compares each output as soon as the output is final.

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

| Verdict         | Meaning                                                                      |
| --------------- | ---------------------------------------------------------------------------- |
| `match`         | every file agrees                                                            |
| `js-equivalent` | both raise a JavaScript syntax error, worded or placed differently           |
| `unexpected`    | rsvelte wrote a file the official tool did not, or accepted what it rejected |
| `missing`       | the official tool wrote a file rsvelte did not                               |
| `mismatch`      | a file differs                                                               |
| `unparseable`   | rsvelte's JavaScript does not parse                                          |
| `refused`       | rsvelte rejected a unit the official tool accepted                           |
| `panicked`      | a task panicked                                                              |

A unit takes the verdict of its worst file: the lowest row of the table that applies. The test
compares JavaScript as a syntax tree, so comments, layout and the spelling of literals do not
count. Each compile task also has a comments ledger (`svelte.compile.comments`,
`svelte.compileModule.comments`). Its key for a comment holds the comment's text, the tokens
next to it and the nearest word on each side. It also counts the earlier places that have the
same tokens and words around them, so a move between two identical places counts. It counts the
comments before it in the same place too, so two comments that swap count. Last, the key says
whether a line break comes after the comment, and for a line comment whether one comes before
it. Whether a block comment is on its own line or on the line before is layout, on purpose, so
a `JSDoc` comment laid out over other lines stays equal. A unit matches when both outputs hold the same keys. The verdict is `missing` when only the official output has keys that rsvelte's
lacks, `unexpected` when only rsvelte's has extra keys, and `mismatch` when both happen. The key
leaves out `@__PURE__` marks and the line that upstream writes above a module. Each unit that the
comments ledger does not compare still gets a line. The line says `official-rejected` when the
official compiler rejected the unit and `skipped` when `units.toml` skips it. It says `refused`,
`panicked` or `unparseable` for rsvelte's side. The test compares lint findings only for the rules rsvelte ran. JSON counts as values and everything else as bytes. When both tools reject a
unit, the compile errors must agree. A JavaScript syntax error (`js_parse_error`) is the exception,
since oxc words and places it. When only its words or its position differ, the verdict is
`js-equivalent`.

## The ledger

`corpus/_registry/parity/<task>/<variant>.txt` lists every unit that does not match. Its header
counts the matches. A verdict that moves in either direction fails the test until you record it.
That way a fix stays, and a regression shows. `UPDATE_EXPECT=1` refuses a filtered run, because
the count would then be wrong.
