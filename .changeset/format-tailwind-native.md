---
'@rsvelte/cli': minor
---

`format` sorts Tailwind CSS classes with `sortTailwindcss`, as oxfmt does, in each file other than a Svelte file. It runs the `prettier-plugin-tailwindcss` installed in the file's project with `node`, and reports an error for each file whose classes it cannot sort.
