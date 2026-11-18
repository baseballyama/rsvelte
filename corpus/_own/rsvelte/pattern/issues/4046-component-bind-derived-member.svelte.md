# `4046-component-bind-derived-member.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

A component `bind:` whose target is a member of a `{@const}` derived. Upstream builds the setter by visiting a synthesized `expression = $$value`, so the derived root keeps its read transform; emitting the raw member instead writes through `obj.checked` and never reaches the signal.
