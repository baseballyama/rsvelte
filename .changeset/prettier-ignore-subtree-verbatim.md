---
"@rsvelte/fmt": patch
---

fix(fmt): the collapse pass no longer touches an element ignored by `<!-- prettier-ignore -->` — 7 of its recursive sweeps (and the prose-run filler) were missing the ignore guard, so a nested element (e.g. an `<a>` inside an ignored `<p>`) could still have its open tag re-broken by a later pass
