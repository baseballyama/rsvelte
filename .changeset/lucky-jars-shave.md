---
'@rsvelte/compiler': patch
---

fix(client): a `style:` directive is reactive when any of its chunks is

The phase-3 scan that decides whether a `style:` directive needs
`$.template_effect` read only the first `ExpressionTag` of an interpolated
value, so `style:color="{s}{o.k}"` was judged by `{s}` alone. Upstream's
phase-2 `StyleDirective` visitor merges the metadata of every chunk.
