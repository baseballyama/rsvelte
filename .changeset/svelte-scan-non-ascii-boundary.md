---
"@rsvelte/lint": patch
---

Classify word boundaries in the `<script>` source-scan rules by character, not by byte

`svelte_scan::is_ascii_ident_byte` answered "is this byte ASCII-alphanumeric, `_` or
`$`", which makes **every non-ASCII character a word boundary** — so `foo` inside
`naïvefoo` read as a standalone occurrence, and an identifier scan stopped at the
first byte of an accented letter. Four rules shared it:
`svelte/no-unused-props`, `svelte/require-event-prefix`,
`svelte/require-event-dispatcher-types` and the `$$Slots` / `$$Events` declaration
scan behind `svelte/experimental-require-slot-types` /
`svelte/experimental-require-strict-events`.

Observable effects, all fixed:

- `interface $$Eventsé {}` satisfied the `$$Events` requirement, and a mention of
  `éinterface $$Events` (inside a string) counted as a declaration.
- `import { écreateEventDispatcher } from 'svelte'` was treated as importing
  `createEventDispatcher`, so a call to the unrelated function was reported; the
  reverse, `import { createEventDispatcher as créer }`, truncated the alias to `cr`
  and the real untyped call went unreported.
- A type member named `ïnput: () => void` was invisible to `require-event-prefix`,
  and `interface Propsé` was accepted as the body of `Props`.
- `no-unused-props` reported `'gr'` instead of `'grëeting'`, and a whole-object
  declaration whose variable name contains a non-ASCII letter
  (`const prôps: Props = $props()`) **panicked** on a mid-character string slice.

Boundaries are now decided with `rsvelte_core::compiler::utils::is_js_ident_continue`
— ECMA-262 `IdentifierPartChar` — so accented letters, CJK and the zero-width
joiners are identifier glue while non-ASCII spaces (U+00A0, U+2000–U+200A, U+2028,
U+2029, U+202F, U+205F, U+3000, U+FEFF) remain boundaries. ASCII input is
unaffected: the two predicates agree on every ASCII byte. The CSS scanner
(`scss_selector.rs`) keeps its own `>= 0x80` test — that is CSS Syntax Level 3 §4.2,
a different specification.
