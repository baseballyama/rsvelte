---
"@rsvelte/compiler": patch
---

Count `<svelte:boundary>` as a parent during analysis. A snippet inside a top-level boundary reported `can_hoist`, so SSR emitted its function ahead of the whole template and reversed it against a sibling boundary's same-named snippet; the same counters back the `<svelte:*>` placement rule, so a meta element inside a boundary was accepted where official rejects it.
