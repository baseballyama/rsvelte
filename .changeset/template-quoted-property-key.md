---
'@rsvelte/compiler': patch
---

Keep a template expression's object property key spelled as it was written

`<div class={cn({ "items-center": x })}></div>` emitted `{ 'items-center': x }`
on the client. esrap prints a literal from its `raw`, so the source's quote
spelling is part of the output; `convert_property_key` built the key as
`JsLiteral::String`, which carries no `raw`, and it is `JsLiteral::RawString` that
survives the trip to oxc. That converter is the client's alone — the server was
already right, the same client/server two-ports shape as the constant fold.

The code that was already there is the tell: the arm branched on
`raw.starts_with('"')` and then did the identical thing in both halves.

Grid — 13 literal slots × 2 quote spellings × 2 targets = 52 cells: **2 → 0**. The
two were the only *object property key in a template expression* slots; a key in
`<script>`, a value in either, a computed key and every single-quoted spelling
were 0 throughout. Single-quoted at 0 is what names the dropped `raw` rather than
the key position — both spellings reach the identical code, and only the one whose
`raw` differs from the re-quoted form can show it. The key's shape does not matter
either: `"a-b"`, `"ab"` and `"1"` all diverged, so this is not about when a key
needs quoting.

Whole-population control, raw byte (no oxfmt) over the 1,913 real components of
bits-ui and flowbite-svelte, 3,826 compared units: **76 → 73, 3 fixed, 0
introduced**, by set difference.

No gate here could see it: every corpus comparison normalizes with oxfmt, and
oxfmt rewrites single quotes to double.
