---
"@rsvelte/fmt": patch
---

Decide open-tag attribute wrapping by visual (East Asian) width, matching `oxfmt` / prettier.

`visual_width` counted bare `chars()`, so CJK-heavy tags were under-measured: fullwidth text (Japanese, fullwidth punctuation, …) is two display columns each but counted as one, so a tag that exceeded `printWidth` on screen stayed on a single line instead of wrapping. Width is now measured with `unicode-width`, so an attribute list whose visual width crosses `printWidth` wraps one-per-line as `oxfmt` does.

On a 1,115-file Svelte corpus this brings oxfmt-divergent files from 208 to 179. (The remaining attribute diffs are expression wrapping *inside* attribute values, which is `oxc_formatter`-driven and tracked in #761.)
