---
'@rsvelte/fmt': patch
'@rsvelte/language-server': patch
---

An inline element whose body is only whitespace (`<i class="…"> </i>`) now moves its close tag to the next line when the one-line form is wider than `printWidth`, as prettier-plugin-svelte does, instead of always printing `> </i>`.
