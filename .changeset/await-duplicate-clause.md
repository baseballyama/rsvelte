---
"@rsvelte/compiler": patch
---

Reject a duplicate `{:then}` / `{:catch}` inside `{#await}` with `block_duplicate_clause`, as the official compiler does. rsvelte's continuation loop overwrote the clause it had already parsed, so `{#await p}a{:then v}b{:catch e}c{:catch f}d{/await}` compiled and the first `{:catch}` branch vanished from the output with no diagnostic. A clause named in the header counts too — `{#await p then v}` fills the `then` slot, so a later `{:then}` is a duplicate. The error is anchored at the `:` of the continuation marker, matching upstream's `parser.index - 1`.
