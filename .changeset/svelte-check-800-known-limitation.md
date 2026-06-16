---
"@rsvelte/svelte-check": patch
---

docs: document the same-name `Foo.svelte.ts`/`.js` companion limitation (#800) in the README. A companion module sharing a component's base name shadows `./Foo.svelte` resolution under tsgo-based svelte-check (standard TS relative resolution — `tsc` and `tsgo` behave identically; official svelte-check only avoids it via a TS language-server plugin tsgo doesn't support). The new "Known limitations" section explains the cause and workaround, and points at the opt-in `svelte/no-companion-module-shadow` lint rule.
