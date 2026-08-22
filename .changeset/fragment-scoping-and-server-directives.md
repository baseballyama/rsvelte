---
"@rsvelte/compiler": patch
---

Scope `<svelte:fragment>` children, and keep a `class:` / `style:` directive on an element inside a boundary or a fragment in the server render. Both walks re-enumerate the containers they descend into where upstream iterates one flat `analysis.elements` list, and the two lists had drifted: none of the five CSS-scoping walks knew about `<svelte:fragment>`, so the component's own `<style>` did not reach anything inside one, and `synthesize_class_style_attributes` knew about neither it nor `<svelte:boundary>`, so the server target — which reads the synthesized attribute rather than the directive — emitted the element with no class at all.
