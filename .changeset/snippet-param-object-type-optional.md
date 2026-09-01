---
'@rsvelte/compiler': patch
---

A `{#snippet}` whose parameter carries an object type with an optional member (`b: { t?: string }`)
keeps its parameters. The type-annotation stripper searched for `?:` anywhere in the parameter's
source, so the member's marker ended the parameter's name, the list failed to re-parse, and every
parameter was dropped — the snippet body could no longer see its arguments at run time.
