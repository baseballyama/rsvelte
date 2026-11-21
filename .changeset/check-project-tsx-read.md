---
'@rsvelte/cli': patch
---

`rsvelte typecheck` now checks a component whose script only TypeScript reads, such as a plain `<script>` declaring `let { n }: { n: number } = $props()`, with its props and default export, as svelte-check does.
