---
'@rsvelte/cli': patch
---

A rest prop member that an assignment writes directly, such as the setter of `bind:checked={rest.c}`, now stays `rest.c` as Svelte compiles it instead of becoming `$$props.c`.
