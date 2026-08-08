---
'@rsvelte/compiler': patch
---

Wrap the whole prop setter call in `$$ownership_validator.mutation` when the
printer broke it across lines. A dev-mode legacy `export let` prop whose member
is assigned a multi-line value produced output that was not JavaScript.
