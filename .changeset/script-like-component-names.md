---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
---

fix(svelte2tsx): reproduce upstream's case-sensitive script and style scan

`find_ci` folded ASCII case, so every scan that locates a verbatim `<script>` or
`<style>` block — the style blanker, the orphan-script scan and its fast path —
also matched a component named `<Script>`, `<SCRIPT>` or `<Style>`. Upstream's
`scriptRegex` and `styleRegex` (`htmlxparser.ts:33-36`) carry `g` and no `i`, so
those are component names there.

Both scans feed a rewrite, so the consequence was not only a wrong range.
`remove_orphan_scripts` blanks the matched source and, when the file has no
top-level `<script>`, injects the blanked body into `$$render()` as a statement:
`<Script><p>hello</p></Script>` alone in a file produced TSX no parser accepts.
`blank_style_tags` replaces its match with spaces, so a `<Style>` component's
children vanished from the projection while the output still compiled.

Measured against official svelte2tsx over five cells, three move to byte-equal
and two could not move (`<Style />` is self-closing, so the style blanker's
fallback never finds a `</style>`; the lowercase spelling is a script on both
sides).
