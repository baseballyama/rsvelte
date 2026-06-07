---
"@rsvelte/svelte-check": minor
---

rename the CLI bin from `svelte-check` to `rsvelte-check` (#716)

`@rsvelte/svelte-check` previously shipped its CLI under the bin name `svelte-check`, colliding with the official [`svelte-check`](https://www.npmjs.com/package/svelte-check) package. In a single `node_modules/.bin/` only one `svelte-check` entry can exist, so installing both produced a last-writer-wins shadow and made a safe side-by-side migration impossible.

The bin is now `rsvelte-check`, so both tools can coexist and be addressed unambiguously from npm scripts:

```jsonc
"type:check": "svelte-check --tsconfig ./tsconfig.json",  // official, authoritative
"type:check:fast": "rsvelte-check --workspace ."          // rsvelte, PR-time
```

The CLI arguments and behavior are unchanged. Also fixes the doubled `apps/apps/` in `repository.directory`.
