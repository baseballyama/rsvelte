---
'@rsvelte/cli': patch
---

`rsvelte typecheck` reports every file of the TypeScript program that svelte-check reports. This includes a file outside `include` that the project imports, such as a component of a workspace package linked into `node_modules`. It honors `skipLibCheck` as svelte-check does and prints a file outside the current directory with `../` as `tsc` does.
