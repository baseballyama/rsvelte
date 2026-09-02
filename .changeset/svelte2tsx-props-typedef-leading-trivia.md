---
"@rsvelte/svelte2tsx": patch
"@rsvelte/compiler": patch
"@rsvelte/svelte-check": patch
---

The `$$ComponentProps` typedef is inserted before the declaration's leading comments

Upstream inserts `;type $$ComponentProps = …;` at `node.parent.pos`, and TypeScript's
`pos` spans the declaration's leading trivia — so the insertion lands before any
comment that precedes the `$props()` declaration. rsvelte walked back from the
`let`/`const` keyword, and two of the three branches that compute this offset stopped
at whitespace, appending the typedef onto a preceding `// …` line where the line
comment swallowed it. The output was not TypeScript.
