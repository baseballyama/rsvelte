---
"@rsvelte/compiler": patch
---

A comment left pending at the end of a `<script>` now reaches the first component call in dev output. The dev target wraps the call in `$.add_svelte_meta(() => …)`, and the wrapper was built without the source offset its non-dev sibling already carried, so the comment fell through to the end of the function body.
