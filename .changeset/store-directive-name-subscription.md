---
"@rsvelte/compiler": patch
---

Subscribe a store written as a directive name for every directive kind official svelte2tsx subscribes for, instead of skipping `use:` / `transition:` / `in:` / `out:` / `animate:`. Only the bare form subscribes: `use:$store.action` names a property of a store the projection never declares, and official writes no subscription for it
