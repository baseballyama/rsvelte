---
"@rsvelte/compiler": patch
---

fix(transform): fold scope hash into a quote-preserving class literal; explicit `slot="default"` → children

- A static `class={"draggable"}` (a quote-preserving string literal) now folds the
  scope hash into the string (`$.set_class(el, 1, "draggable svelte-HASH")`) instead
  of passing it as a separate argument — the fold only recognized the canonical
  `String` literal, not the `RawString` variant.
- An explicit `<Comp><x slot="default" /></Comp>` is now emitted on the server as the
  `children` snippet prop (with `$$slots.default: true`), matching upstream's
  `slot_name === 'default'` handling, instead of a `$$slots.default` function.
