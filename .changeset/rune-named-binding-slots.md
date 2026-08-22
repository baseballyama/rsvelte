---
'@rsvelte/compiler': patch
---

Stop counting a `$`-prefixed name as a rune use when the slot only binds or labels it. A statement label (`$state: for (;;) break $state;`) and a `catch ($state)` parameter both declare rather than read, and counting them flipped the component into runes mode — which turned a working Svelte 4 component into `legacy_export_invalid`. The same two slots also decide store subscriptions from a separate scan, where `catch ($count)` now shadows the store for its own block and a label is not a read
