---
"@rsvelte/compiler": patch
---

fix(analyze): include component-tag references in `<select bind:value>` indirect bindings

A legacy `<select bind:value={foo}>` invalidates every other binding referenced
within the select whenever `foo` mutates (emitted as a `$.invalidate_inner_signals`
body). The official compiler builds this list from the select scope's
`references` map, in which **component-tag** references (`<SelectOptions/>`) are
inserted *immediately* during scope creation — ahead of the *deferred* plain
identifier references.

rsvelte's scope-builder never recorded component-tag name references, so a
component used inside the select (e.g. `<SelectOptions bind:field/>`) was missing
from the invalidate body, and the surviving identifiers were emitted in pure
source order rather than components-first.

The `<select>` indirect-binding population now collects component-tag references
across the select subtree separately and emits them ahead of the identifier
group, matching the official `references` insertion order.

Fixes the corpus entry `svelte-form-builder/src/lib/Components/Select.svelte`.
