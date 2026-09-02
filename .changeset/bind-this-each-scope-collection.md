---
"@rsvelte/compiler": patch
---

`bind:this` decides which identifiers become callback parameters from the DECLARATION's scope, not from the loop variable's name

Upstream's `build_bind_this` compares each reference's binding scope against every
`EachBlock` owner's scope, so a `{@const}` written directly in an each block becomes a
parameter while the same name one `{#if}` deeper does not. rsvelte matched on the loop
variable's name, so a `{@const}` never qualified however it was declared. Upstream's two
exclusions — `is_state_source` and `binding.kind === 'derived'` — are ported with the
scope test, because the test alone over-collects declaration tags.

Two further divergences were in the same walk. It was a hand-written match over `JsExpr`
with a `_ => {}` arm, so a reference inside a `||`, a template literal, an object, a
`new`, an optional chain or a unary/update operator was silently not looked at. And
upstream marks a name seen *before* asking whether the occurrence is a reference, so an
identifier in a non-reference position burns the name for every later one: `els[{ k: k }.k]`
collects nothing while `els[{ kk: k }.kk]` collects `k`.
