---
"@rsvelte/compiler": patch
---

Decide `$props`-vs-store from the shadowing binding rather than from the script's text. rsvelte scanned the whole instance script for `$props(` and, finding one, declared `$props` a rune — so a `const props = { x: 1 }` beside the usual `let { v } = $props()` compiled as a rune where official makes it a store subscription, warns `store_rune_conflict`, and puts the component in legacy mode. The scan existed because `Prop` binding kinds are assigned after this pass; destructured bindings now carry `init_rune`, so upstream's per-binding rule (`get_rune(declaration.initial)`, with `store_name != "props"` keeping `let { state } = $props()` a store subscription) is available where it is needed. The rest of #3597 — the other runes create the store subscription but leave `analysis.runes` true — is unchanged.
