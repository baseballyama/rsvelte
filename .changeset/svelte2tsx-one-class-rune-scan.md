---
'@rsvelte/compiler': patch
---

svelte2tsx: decide runes mode with one class scan and one parameter scan

The class-body rune scan existed three times — the top-level `class` guard, the
shared `detect_rune_in_class_body`, and an inline `ClassExpression` arm — and each
copy was missing an arm another had, so a class declaration and a class expression
with the same body disagreed about whether the component is runes or legacy. That
decision selects `__sveltets_2_fn_component` versus
`__sveltets_2_isomorphic_component`, so every prop, event and slot type for the
file follows it.

There is now one scan. It reads the superclass expression, every member's computed
key, method bodies under the method's own parameter scope, parameter defaults,
field initializers, accessor properties and static blocks. The same unification
covers functions: a rune in a parameter default (`f(p = $state(0))`) and a rune in
an expression-bodied arrow (`() => $state(0)`) are now seen in every function form.
