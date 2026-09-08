---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
"@rsvelte/language-server": patch
---

svelte2tsx: anchor an attribute key's opening quote on the name it opens

The generated key `"data-open"` is an inserted quote, the attribute name kept as
a source chunk, and a closing quote. The opening quote was flushed inside the
preceding gap's single `overwrite`, so its map segment anchored on the end of
the *previous* attribute. TypeScript reports a definition or hover range that
starts at that quote, so the range's start resolved to the previous attribute —
and on a multi-line start tag, to the previous line.

The delimiter is now written over the name's own first character, which is what
the reference does. Generated text is unchanged.
