# `3620-regex-literal-store-name.svelte`

**Issue:** [#3620](https://github.com/baseballyama/rsvelte/issues/3620), [#3659](https://github.com/baseballyama/rsvelte/issues/3659)

A `$`-name spelled inside a **regex literal** beside an exported prop of the same name. Phase 2's `$`-reference collector tracked strings and comments but had no regex state, so the literal's body was scanned as code and `$mystore` counted as a reference; svelte2tsx had an independent raw scan with the same blind spot, whose false store declaration left an unmatched `/*Ωignore_startΩ*/` beside the prop widener. Carries the four lexical arms a `/` can end on (a plain literal, a `/` inside a character class, an escaped `\/`, and a literal reached after a division), because the decision is made from the preceding token and a file with one arm cannot tell a fix from a fix that only handles that arm. The exported prop makes the compiler and projection ports discriminate the same opaque region independently
