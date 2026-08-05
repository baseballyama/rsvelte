---
"@rsvelte/compiler": patch
---

Resolve a dev console argument against the generated program's own `const` declarations. The script text passes only had the component analysis, which carries no binding for a name declared inside a nested function, so `const m = \`…\`; console.log(m)` in a `.svelte.(js|ts)` module was wrapped in `$.log_if_contains_state` even though upstream's `scope.evaluate` resolves `m` to a string and emits the plain call.
