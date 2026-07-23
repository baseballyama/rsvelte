---
"@rsvelte/compiler": patch
---

fix(analyze): hand the raw digest to `cssHash` callbacks via `CssHashInput.hash`

`CssHashInput.hash` now carries the unprefixed raw digest, matching upstream's
default `cssHash` (`svelte-${hash(...)}`) where the `hash` argument is the raw
digest and the `svelte-` prefix is applied by the default implementation itself.
The prefix is now materialized only where the default hash is produced. The wasm
`cssHash` bridge no longer recomputes its own raw hash and instead trusts the
shared field. No compiler output changes.
