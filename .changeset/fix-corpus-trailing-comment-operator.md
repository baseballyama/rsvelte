---
"@rsvelte/compiler": patch
---

fix(compiler): don't treat a trailing line comment's text as a continuation operator

The text-based instance-script statement accumulator decides whether a statement
continues onto the next line by inspecting the last line's trailing character.
It ran this check on the raw line *including* a trailing `//` comment, so a
declaration whose comment happened to end in an operator-looking character —

```js
export let screenWidth = 768; // md+
export let menuProps = undefined;
```

(the comment ends in `+`) was misread as a dangling binary `+`, merging the next
`export let` into the same statement and emitting invalid JS. Comments are only
pre-stripped here when the legacy script carries a `$`-token, so this path must
be comment-robust on its own. Strip a trailing line comment (respecting string
literals) before the trailing-operator / trailing-comma checks. Clears
`svelte-ux/.../components/ResponsiveMenu.svelte` from the corpus baseline
(52 → 51).
