---
"@rsvelte/fmt": patch
---

fix(fmt): break the whitespace body of a wrapping inline element (#1707)

An inline element with a whitespace-only body whose open tag wraps
(`<span class="…long…"> </span>`) was formatted by the non-port markup path with
the raw whitespace glued after the wrapped `>` (`…"`\n`> </span>`). That both
diverged from the prettier-plugin-svelte oracle and was non-idempotent — a
multi-space body collapsed to a single space on a re-format.

prettier prints such an element as `group([...openingTag, '>', line, '</tag>'])`,
so the whitespace body is a `line` that breaks once the wrapped open tag forces
the group open: the `>` glues to the last attribute line under `bracketSameLine`
(else dedents) and the close tag drops to its own line, absorbing the whitespace.
Output is now byte-identical to the oracle and idempotent for both
`bracketSameLine` values.

`<textarea>` is handled as the raw-text exception the oracle applies: `>` stays
glued (never dedented for this shape), `bracketSameLine: true` breaks the body,
and the default `false` glues the close tag and drops the whitespace body
(`…"></textarea>`). Source-empty inline elements (`<span></span>`, hug) and
block-display elements are left to their existing layout. Also aligns
`can_omit_softline_before_closing_tag` with prettier's `blockElements` (excluding
`script`/`style`) via `is_html_block_display_element`.
