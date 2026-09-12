---
'@rsvelte/language-server': patch
---

fix(language-server): hover a `.svelte` import specifier

The overlay rewrites `'./Other.svelte'` to `'./Other.svelte.tsx'` so tsgo can
resolve it, and registered those four inserted bytes in the same
`generated_ranges` list as the `Ωignore` regions. `is_generated_range` is an
intersection test and `map_generated_range` bails on it, so every tsgo response
whose range covers the specifier — the hover, and any range-carrying feature
anchored there — was discarded before it was mapped, and the client saw `null`.

The two kinds are not the same thing: an `Ωignore` region is whole synthetic
text with no source, while a `.tsx` insertion is four synthetic bytes inside a
token the user wrote. The insertions move to their own list, consulted for a
*position* as before and not for a *range*; a range lying wholly inside an
insertion still returns `None`, because both its endpoints fail the position
check.
