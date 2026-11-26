---
'@rsvelte/cli': patch
---

`svelte/no-unused-svelte-ignore` no longer reports the words of a note after the codes, such as `-- reason`, which Svelte reads as prose in runes mode. A Svelte code there is still reported, since Svelte does not read it.
