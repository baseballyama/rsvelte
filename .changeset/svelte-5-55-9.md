---
"@rsvelte/compiler": minor
---

Bump target Svelte to **5.55.9** — the latest stable Svelte at the time of this catch-up.

The two compiler-side commits in the range:

- `a5df6616e` "fix: avoid unnecessary stringify in server attributes" inlines static string interpolations directly into the SSR HTML template push (`background-image: url('${$.stringify(x)}')` → `background-image: url('https://example.com/foo.jpg')` when `x` is a constant). rsvelte still emits the `$.stringify` form.
- `000c594e0` "fix: `{#await await ...}` and async dependencies fixes" refines the async-batching / await-merge codegen tracked since 5.54.1.

Eleven new fixtures across `runtime-runes`, `runtime-legacy`, `server-side-rendering`, and `snapshot` are skipped pending the follow-up ports for those two upstreams.
