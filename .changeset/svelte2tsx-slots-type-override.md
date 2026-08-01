---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): honor an instance-script `$$Slots` interface/type override.
Official `createRenderFunction.ts` builds the component export's `slots:`
reflection as `uses$$SlotsInterface ? '{} as unknown as $$Slots' : '{…computed…}'`,
so a component that declares its own `interface $$Slots` / `type $$Slots` is
type-checked against that declaration instead of the shape inferred from its
`<slot>` elements. rsvelte already threaded the flag into the
`__sveltets_2_createCreateSlot<$$Slots>()` binding but always emitted the
computed literal in the return statement, so consumers saw the inferred slot
props and any deliberate widening/narrowing in the declaration was lost.
