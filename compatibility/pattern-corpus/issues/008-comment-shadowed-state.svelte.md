# `008-comment-shadowed-state.svelte`

**Issue:** [debt 008](../../debt_list/008-mutation-gate-has-behavioral-code-mismatches.md)

A comment containing `}` between a shadowed local `$state` declaration and its reads. The local binding must still win over the outer function of the same name, so reads and updates remain `$.get(multiplier)` / `$.update(multiplier)` rather than becoming plain values.
