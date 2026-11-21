---
'@rsvelte/cli': minor
---

`format` sorts the Tailwind CSS classes of a Svelte file with `sortTailwindcss`, as oxfmt does with prettier-plugin-svelte. It sorts `class` and the attributes `sortTailwindcss` names, the functions it names in the scripts, and `@apply`. It runs the `prettier-plugin-tailwindcss` installed in the file's project with `node`.
