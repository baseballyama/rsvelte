# `4115-snippet-render-site-identity.svelte`

**Issue:** [#4115](https://github.com/baseballyama/rsvelte/issues/4115)

Three `{#snippet row()}` in three scopes, to which official gives three different verdicts: the top-level one is never rendered and its `<span>` is pruned, the one written inside `.wrap` is rendered there and keeps its `<b>`, and the one passed to `<Comp>` is scoped at the component's position. Both ports of "where is a snippet body rendered" keyed that map by the snippet's NAME, so all three shared one entry and each was handed the others' ancestors. The `.wrap` rule with no descendant is the control that stops "scope everything under `.wrap`" from passing.
