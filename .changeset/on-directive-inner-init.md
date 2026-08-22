---
"@rsvelte/compiler": patch
---

Emit the `$.derived` an `on:` directive on `<svelte:element>` declares inside the `$.element(...)` callback. A handler that is not a function expression is wrapped in a derived, and rsvelte hoisted that declaration beside the callback instead of into it, so the derived was created once for the component rather than once per element instantiation. Upstream visits the directive with the inner context, so its init statements belong to the element body.
