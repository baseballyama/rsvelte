---
'@rsvelte/compiler': patch
---

A `{#snippet}` declared inside `<svelte:boundary>` is now emitted ahead of the server's
component-bindings settle loop, where upstream puts every snippet, instead of inside the
`$$render_inner` wrapper. The boundary visitor builds that declaration itself rather than through
the snippet visitor, so the name it must be recognised by was never recorded. Only a component
that also `bind:`s a child was affected.
