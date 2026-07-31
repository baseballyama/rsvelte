---
"@rsvelte/compiler": patch
---

fix(compiler): label legacy state sources with `$.tag($.mutable_source(…), 'name')` in dev, so `$inspect.trace()` and devtools can name them
