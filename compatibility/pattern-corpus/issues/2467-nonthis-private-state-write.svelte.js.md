# `2467-nonthis-private-state-write.svelte.js`

**Issue:** [#2467](https://github.com/baseballyama/rsvelte/issues/2467)

A private `$state` field written through a **non-`this` receiver** (`const inst = this`) in a constructor: the logical compound (`??=`, which was in neither allowlist and produced the unparseable `$.get(inst.#n) ??= s`), the `, true` proxy flag on a plain object assignment (silent — that output always parsed), and the constructor-root read form. The first `.svelte.js` entries in this directory; both compilers see a module, not a component
