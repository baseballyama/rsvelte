---
"@rsvelte/compiler": patch
---

Bump target Svelte to **5.55.1**. The three compiler-side commits in the range (`4879f9da9` better duplicate module import error, `957f2755f` cleanup `superTypeParameters` in class declarations, `669f6b45a` prevent hydration error on async `{@html …}`) don't surface any rsvelte-side divergence on existing fixtures. The seven new `runtime-runes/async-overlap-multiple-*` fixtures (added by chore `5e8662fb2`) diverge only in blank-line placement around hoisted function decls; they're skipped pending a canonicalize-js / hoisting tweak.
