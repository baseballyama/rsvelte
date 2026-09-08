# `4046-dev-event-handler-comment.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

A comment in an event handler's arrow body. Dev replaces the arrow with a `loc`-less `b.function(…)`, so the comment flushes at the element identifier printed before it instead of inside the rewritten update; production, where the arrow survives, is the control.
