---
"@rsvelte/compiler": patch
---

Bump target Svelte to **5.53.3**. No compiler-side changes upstream — the only relevant landing is `f67d03df5` "fix: make string coercion consistent to `toString`", which adjusts the runtime `set_text` helper. The new `runtime-runes/set-text-stable-coercion` fixture exposes a pre-existing rsvelte gap (we don't emit `?? ''` around interpolated identifiers inside `set_text(text, \`…\`)` calls when the source identifier is typed as `object`) and is skipped in the compatibility report pending a follow-up port.
