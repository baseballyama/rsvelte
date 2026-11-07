---
"@rsvelte/fmt": patch
"@rsvelte/language-server": patch
---

fix(fmt): an overflowing array / object attribute value (`items={[{ … }]}`) now lays its elements out at the full width once it breaks, as prettier-plugin-svelte does, instead of also breaking elements that fit; and prose beside a `{@render …}` tag now wraps like other text, letting a line overflow by its last word where prettier does.
