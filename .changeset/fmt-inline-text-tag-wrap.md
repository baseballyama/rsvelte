---
"@rsvelte/fmt": patch
---

fix(fmt): place the `>` correctly when a wrapped element has whitespace-sensitive inline content. When an element's open tag wraps to the multi-line shape, `render_multi_line` always emitted the closing `>` on its own line at the outer indent. For an element whose children are whitespace-sensitive inline content (e.g. text directly touching the tag, `>x</button>`), moving the `>` to its own line injects significant whitespace before the text — so prettier-plugin-svelte instead keeps the open `>` glued to the last attribute (`}}>x`) and breaks the *closing* tag's `>` onto its own line (`</button\n>`). rsvelte now mirrors that: `push_open_tag` reports whether it wrapped, and the open `>` hugs / close `>` breaks when the content is non-whitespace-adjacent to the tag. Block content (children on their own line, whitespace before/after) is unaffected. Closes #798.
