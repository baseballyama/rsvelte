---
"@rsvelte/fmt": patch
---

fix(formatter): strip ASI guard from template expressions

`oxc_formatter` inserts a leading `;` before an expression statement whose
formatted text begins with `(`, `[`, `` ` ``, a template literal, or certain
other tokens, when `semicolons` is set to `"as-needed"` — a defensive ASI
(automatic semicolon insertion) guard so the line stays safe if concatenated
after a semicolon-less statement. Every embedded `{expr}` (mustache values,
attribute/directive values, block headers such as `{#if}`/`{#each}`) is
internally parsed and printed as a synthetic expression statement so it can
be run through `oxc_formatter`, so with `semi: false` that guard leaked into
the output: `onclick={() => doSomething()}` was formatted as the invalid
`onclick={;() => doSomething()}`.

Template expressions are never in statement position, so the guard is never
meaningful there — it is now stripped from the formatted text before
splicing it back into the template. Matches `oxfmt`/`prettier-plugin-svelte`,
which never emit the guard for embedded expressions.
