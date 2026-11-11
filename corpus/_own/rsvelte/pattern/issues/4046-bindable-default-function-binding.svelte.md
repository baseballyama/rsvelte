# `4046-bindable-default-function-binding.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

A `$bindable()` default that is a bare identifier, crossed with what its binding holds. Upstream `should_proxy` recurses into a resolvable binding's initial and answers on that node type, so a function-valued initial is NOT proxied and stays a simple expression (`11, fn_initial`); rsvelte skipped the recursion whenever the initial was a function and proxied it (`31, () => $.proxy(fn_initial)`), changing both the flag word and the argument. The object and `undefined` rows are the controls that must not move.
