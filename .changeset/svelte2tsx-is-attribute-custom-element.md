---
"@rsvelte/svelte2tsx": patch
"@rsvelte/compiler": patch
"@rsvelte/svelte-check": patch
---

An `is="x-y"` attribute makes an element a custom element, which keeps its attribute-name case

Upstream's `Element.isCustomElement()` has two conditions — a dash in the tag name,
and an `is=` attribute whose first value chunk is text containing a dash — and only
a custom element is exempt from the attribute-name lowercasing. rsvelte answered the
question with `tag.contains('-')` alone, so `<div is="x-y" defaultValue="1">` emitted
`"defaultvalue"` where official emits `"defaultValue"`, on every element host.

The tag was also being passed as `""` on two of the four hosts, which happened to be
harmless only because `title` and `svelte:element` contain no dash. Both now pass the
real tag and the caller answers the whole predicate.
