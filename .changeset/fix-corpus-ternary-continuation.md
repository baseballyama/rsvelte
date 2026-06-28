---
"@rsvelte/compiler": patch
---

fix(compiler): treat a line ending in `?` as a statement continuation

The text-based instance-script accumulator decides a multi-line statement is
complete when a line looks balanced and isn't followed by an obvious
continuation. A line ending in a bare ternary `?` was not recognised as a
continuation, so a legacy `$:` (or `$derived`) assignment whose `?` and
consequent were separated by a `// comment` —

```js
$: isSelectedStart =
  selected instanceof Object
    ? // @ts-expect-error
      isSame(date, selected.from ?? selected.to)
    : false;
```

— was split after the (comment-stripped) `?` line, orphaning
`isSame(…) : false;` as bogus top-level statements and emitting invalid JS.

Add `?` to the trailing-operator continuation set (a superset of the existing
`??` case). Valid JS never ends a statement with a bare `?`, so this only
rescues the dangling-ternary case. Clears
`svelte-ux/.../components/DateButton.svelte` from the corpus baseline (53 → 52).
