---
'@rsvelte/compiler': patch
---

Route a declaration tag on the keyword boundary upstream uses

`{var}`, `{var.x}`, `{var(1)}` and `{var;}` all compiled. Upstream decides
whether a `{…}` is a declaration tag with three sticky regexes:

```js
const regex_supported_declaration = /(?:let|const)\b/y;
const regex_unsupported_declaration = /(?:var|interface|enum)\b/y;
const regex_maybe_type_declaration = /type\b/y;
```

rsvelte had the same three keyword sets and required **whitespace** after the
keyword instead of a boundary, with a comment asserting that the two "reach the
same result for every real-world tag without a statement parse". A grid over the
byte that follows the keyword falsified it.

The interesting part is that one boundary rule is not enough, and **which rule
applies is decided by where upstream stops.** The unsupported set throws from
the regex match itself, so its boundary really is the regex word class
`[A-Za-z0-9_]` — `$` is outside it, so `{var$x}` is rejected even though `var$x`
is a legal identifier, and byte parity means reproducing that rather than
picking a side (`upstream_issues/svelte-declaration-tag-dollar-identifier.md`).
The supported and `type` regexes are only a shape hint, **confirmed by
`parse_statement_at`** — which reads `let$x` as one identifier and hands the
`ExpressionStatement` back to the expression-tag reader — so their boundary is
the identifier class.

That asymmetry is not a detail. The obvious single rule — spell both boundaries
as the regex word class — was the first version of this fix, and a build of it
leaves `{let$x = 1}` **accepted by both compilers and meaning two different
things**: an assignment to a global on one side, a declaration of `$x` on the
other. No verdict comparison can see that, only the emitted code, which is why
the grid compares `js.code` on every accepted pair.

The same "confirmed by parsing" property is the whole of the `type` half.
rsvelte reached `declaration_tag_invalid_type` from a structural shape test, so
`{type a = 1}` in a plain `<script>` — where a type alias is not JavaScript at
all — reported the Svelte error where official reports `js_parse_error`. The
parse now runs first, and a shape that parses as JavaScript goes back to the
expression-tag reader the way upstream's `ExpressionStatement` branch does.

Grid — 14 leading words × 6 following bytes (`}`, ` a = 1`, `.x`, `(1)`, `$x`,
`;`): **16 of 84 cells diverging → 0**. The near-miss controls (`variable`,
`constant`, `letter`, `enumerate`, `typed`, `interfaces`) move nothing in either
direction, which is what a boundary change is most likely to break.

Routing `{let}` and `{const}` into the reader also makes their `js_parse_error`
**positions** observable, which is the "fixing a start divergence adds rows"
coupling in the other direction. The reserved-word position grid — 30 words × 2
shapes × 3 slots — goes **2 of 183 diverging → 0**, and the pair needs two rules,
not one: `let` is not reserved in sloppy mode, so acorn rejects a bare one for
being a declaration it cannot finish and reports at the keyword, while `const`
is reserved, consumed, and fails at the `}` after it. The word × shape grid
moves **11 → 5** on the same build, and the 5 left are #3694 (`super`, `await`)
and #3707 (`arguments`).

One neighbouring divergence the same grid framing exposes is **not** fixed here:
a single declarator with no initializer (`{let x}`) is still rejected, tracked as
#3705 with its own 78-cell grid. The multi-declarator path already handles it,
so it is the single-declarator early return alone.
