---
"@rsvelte/compiler": patch
---

Dev-mode client output now wraps member assignments used in value position with `$.assign(object, "prop", operator, rhs, location)`, the stale-assignment-value warning helper. Template expressions and other typed `JsNode` conversions never reached the JSON assignment converter where this wrap lived, so `key.foo = resolve` inside e.g. `new Promise((r) => (key.foo = r))` shipped unwrapped. The location string now also uses the `rootDir`-relative compile filename instead of its basename, matching upstream's `locate_node`.
