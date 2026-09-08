# `3026-template-arrow-prop-member-assign.svelte`

**Issue:** [#3026](https://github.com/baseballyama/rsvelte/issues/3026)

`state.a = state.b` inside an **inline template arrow**. `try_transform_assignment` read-transforms both sides so the mutation wrapper can be built, and the outer `apply_transforms_to_expression` pass then walked the same subtree again — the left survives on a shape guard, the right does not, so every right-hand read became `state()().b` and the handler threw `x(...) is not a function` on first click. The same statement in a named `<script>` function is correct, which is why no repro of the reported shape existed
