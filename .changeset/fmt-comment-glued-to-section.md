---
"@rsvelte/fmt": patch
---

fmt: don't insert a blank line between a comment and the `<style>` / `<script>`
it leads. The section-reorder pass treated a markup gap that ended with a
comment glued to the next section (e.g. `</div>\n<!-- … -->\n<style>`) as one
markup unit, then joined it to the section with a blank line — pushing the
comment away from the tag it documents. The trailing comment run is now split
off and attached to the section as its leading comment, so the blank line falls
before the comment (matching prettier-plugin-svelte / oxfmt). UTF-8 safe for
multi-byte markup text.
