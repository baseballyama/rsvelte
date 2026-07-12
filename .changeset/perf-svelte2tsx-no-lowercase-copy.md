---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

perf(svelte2tsx): drop the two full-source `to_ascii_lowercase` copies

`blank_style_content` and the orphan-`<script>` scanner each allocated a
lowercased copy of the entire source just to case-insensitively find
`<style` / `<script` tag tokens. Replace both with an allocation-free
`find_ci` byte scan (`eq_ignore_ascii_case` on the tag-name window),
matching the approach the fallback `<style>` scanner already uses. Output
is byte-identical (same ASCII case folding, same match positions);
verified against the full svelte2tsx fixture suite.
