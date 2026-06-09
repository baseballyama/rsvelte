---
"@rsvelte/fmt": patch
---

fix(fmt): locate the `<script>` opening-tag terminator with a quote-aware scan so a `>` inside an attribute value no longer corrupts body extraction. A `<script lang="ts" generics="T extends Record<string, unknown>">` has a literal `>` inside the `generics` attribute value; the naive `block.find('>')` in `body_span` matched that one first and started the body slice mid-attribute, so oxc parsed garbage and reported a spurious `Unexpected token` — leaving the whole file unformatted. `find_open_tag_end` now skips any `>` that appears inside single- or double-quoted attribute values, terminating the open tag at the real unquoted `>`. Closes #946.
