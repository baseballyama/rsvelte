---
"@rsvelte/compiler": patch
---

Republish at the correct release version. The previous `0.7.6` publish never
reached npm: the wasm `pkg/` was stamped with the build crate's version
(`0.1.0`) instead of the release version, so `changeset publish` attempted
`@rsvelte/compiler@0.1.0`, hit npm's already-published guard (E403), and
crashed the Release run. This ships the same compiler at a correctly-versioned
package — there is no functional change to the compiler itself.
