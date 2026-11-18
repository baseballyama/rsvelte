# `2608-destructured-param-binding.svelte`

**Issue:** [#2608](https://github.com/baseballyama/rsvelte/issues/2608)

A prop name occupying a **binding slot of a destructuring parameter** inside a legacy `$:` statement. The client prop-read rewriter asked only "is this a shorthand object-literal property?", so `({ id }) =>` became `({ id: id() }) =>` and `([id, n]) =>` became `([id(), n]) =>` — binding patterns no parser accepts. The `shifted` line pins the other side: the same name one bracket later, in the arrow's **body**, is a read and keeps its `id()`. The reads that sit *inside* the parameter list (a default value, a computed key) belong to the `param-pattern` matrix family instead — they trip an unrelated dependency-list divergence that this file must not import
