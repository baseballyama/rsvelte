---
'@rsvelte/compiler': patch
---

Register the store subscription for a `$`-prefixed store used as a directive's name. `transition:$store`, `in:`/`out:`, `animate:` and shorthand `style:$store` all read the store through the directive's NAME rather than its expression, and only `use:` collected it — so the other four emitted a reference to a `$store` that was never declared, and threw at runtime
