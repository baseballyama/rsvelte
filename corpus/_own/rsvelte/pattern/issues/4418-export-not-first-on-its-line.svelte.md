# `4418-export-not-first-on-its-line.svelte`

**Issue:** [#4418](https://github.com/baseballyama/rsvelte/issues/4418)

An `export` that is not the first token on its line. The client instance-script pipeline reads a physical line as one statement, so `let a = 1; export let p = 1;` reaches the legacy prop lowering as one unit; the lowering asks whether the unit *starts* with `export`, answers no, and copies the line into the component function verbatim — where `export` is not JavaScript. `separate_same_line_top_level_statements` already cut **after** a top-level `export let`/`export var`, from the parser's own statement spans; the missing half is the same test on the statement that follows. The rows cross both directions (`export` second, `export` first) against the two shapes that separate an AST cut from a byte scan for the word: an `if (a) {}` whose brace ends the previous statement, and an `export let` spelled inside a **string literal**, which must declare no prop at all.
