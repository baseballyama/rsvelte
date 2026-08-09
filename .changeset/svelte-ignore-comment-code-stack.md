---
'@rsvelte/compiler': patch
---

Let an enclosing `svelte-ignore` suppress the warnings raised about `svelte-ignore` comments themselves. `legacy_code` and `unknown_code` were pushed straight onto the analysis warning list, so they bypassed the ignore stack that every other warning consults — `<!-- svelte-ignore unknown_code -->` around a block containing `<!-- svelte-ignore zzz-yyy -->` still reported `unknown_code`, where the official compiler reports nothing. They now go through the same emission path as every other warning, and because that happens before the comment run's own codes are pushed, a comment still cannot ignore its own code — matching the official compiler in both directions.
