---
"@rsvelte/lint": patch
---

Stop `svelte/no-unused-vars` reporting a binding whose only use is next to a non-ASCII space

The rule's textual fallback — the one that keeps a name alive when Phase 2 records
no reference for it (JSDoc `@type`, TypeScript type positions, generics) — decided
word boundaries with a byte test that counted every byte `>= 0x80` as an identifier
byte. A non-breaking space next to the name therefore read as identifier glue, the
occurrence was discarded, and the binding was reported unused although it was used
(here with a literal U+00A0 between `{` and `Foo`):

```svelte
<script>
  import { Foo } from './x';
  /** @type {<NBSP>Foo} */
  let v = null;
</script>
```

The boundary test now asks whether the neighbouring *character* is an ECMA-262
`IdentifierPart` (`oxc_syntax::identifier::is_identifier_part`, the same rule the
compiler's classifiers use), so non-ASCII spaces (U+00A0, U+2000–U+200A, U+2028,
U+2029, U+202F, U+205F, U+3000, U+FEFF) are boundaries while accented letters, CJK
and the zero-width joiners stay glue. ASCII input is unaffected: the two predicates
agree on every ASCII byte.
