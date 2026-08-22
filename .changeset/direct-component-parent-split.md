---
"@rsvelte/compiler": patch
---

Separate the two questions asked of a node's component-like parent. Upstream's `validate_slot_attribute` treats `Component`, `SvelteComponent`, `SvelteSelf` **and** `SvelteElement` as slot owners, while `SvelteFragment.js` accepts only `Component` and `SvelteComponent` as a `<svelte:fragment>` parent. rsvelte answered both from one boolean, so `<svelte:self>` rejected a legal `<b slot="named">` child and `<svelte:element>` accepted a `<svelte:fragment>` the official compiler rejects. The flag is now a three-valued `DirectComponentParent`, which cannot desync the way two parallel booleans would.
