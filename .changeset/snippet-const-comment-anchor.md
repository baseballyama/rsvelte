---
"@rsvelte/compiler": patch
---

A comment left pending at the end of a `<script>` is no longer dropped when a `{#snippet}` is declared ahead of the instance statements. The snippet's `const` was built from a bare name, so no node in that chunk offered a source offset and the comment was lost rather than moved.
