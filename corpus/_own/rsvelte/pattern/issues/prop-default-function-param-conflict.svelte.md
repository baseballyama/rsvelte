# `prop-default-function-param-conflict.svelte`

**Issue:** corpus residue

Upstream's `scope.declare` seeds `root.conflicts` wherever the declaration sits, so a name generated for a prop must avoid the parameters of a function nested in another prop's **default expression** — a subtree the scope walk does not otherwise enter. Its `format` default is a `function` expression, which also reaches svelte2tsx's `$$ComponentProps` inference — upstream's callable arm is `ts.isArrowFunction` alone, so that prop is typed `any`, not `Function`.
