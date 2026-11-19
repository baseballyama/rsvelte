---
'@rsvelte/cli': patch
---

`rsvelte typecheck` no longer reports a false "has no default export" at an import of a component whose script only TypeScript reads, such as a plain `<script>` with TypeScript syntax.
