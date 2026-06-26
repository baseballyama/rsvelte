---
"@rsvelte/svelte2tsx": patch
---

fix(svelte2tsx): bind a component child's legacy `let:` from its own slot_def (#1232)

A legacy `let:` directive on a *component* child of another component (`<Preview><State let:value let:set>…</State></Preview>`) binds from the child's OWN `$$slot_def.default` — its own `handle_component` already emits that destructure. rsvelte additionally treated the component child as a "default-slot-let child" of the enclosing component, so it gave the parent a spurious instance const and emitted a duplicate `$$_parent.$$slot_def.default` destructure that bound the child's `let:` props onto the parent instance, mistyping the slot props. Only non-component slot content (`<div let:x>` / `<svelte:fragment let:x>` / `<svelte:element let:x>`) forwards its `let:` bindings to the enclosing component's slot_def; `Component`/`SvelteComponent`/`SvelteSelf` children are now excluded from both the parent-instance trigger and the parent-side destructure emission, mirroring official svelte2tsx.
