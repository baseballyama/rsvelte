---
"@rsvelte/svelte2tsx": patch
---

Close the last five svelte2tsx output divergences

`preserveAttributeCase` was never honoured, so attributes on foreign-namespace
elements were lower-cased. `type $$ComponentProps` and module-level snippets were
emitted in the wrong order relative to `function $$render()`. Angle-bracket type
assertions in an instance script were rewritten to `as`, which upstream does only
outside `ts` mode — the module script still rewrites unconditionally.
