---
"@rsvelte/compiler": patch
---

Rule a reactive variable out with one scan before rewriting the statement body

`extract_reactive_statement_deps` asks `body_references_identifier` and
`is_assigned_anywhere_in_body` once per (`$:` statement × reactive variable)
pair, and each answer copied and rescanned the whole statement body three
times — or formatted and searched twenty patterns. Almost every pair is a miss,
and a name absent from the raw body is absent from every stripped derivative of
it, because the strips only blank or delete bytes. One substring scan now
settles those. The three strips also borrow instead of copying when they have
nothing to strip.

On carbon-components-svelte, whose components are legacy (173 of 287 files
carry a `$:` line), this was 48.7% of total compile time; the corpus this had
been profiled against carries no `$:` at all. Compiling the 287 components
drops from 366-380 ms to 268-279 ms.
