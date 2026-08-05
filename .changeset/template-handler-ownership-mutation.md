---
"@rsvelte/compiler": patch
---

Dev-mode client output now applies ownership validation to prop mutations written inside template expressions, e.g. `<button onclick={() => { listEl.style.overflow = "hidden"; }}>`. Event-handler bodies and other template expressions are converted through the typed `JsNode` path, which never reached the JSON assignment converter where `$$ownership_validator.mutation(...)` was applied — so those mutations shipped unvalidated and the `$.create_ownership_validator($$props)` preamble was dropped along with them. Assignments and update expressions (`obj.count++`) in that path are now wrapped, honouring `svelte-ignore ownership_invalid_mutation`.
