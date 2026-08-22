---
"@rsvelte/compiler": patch
---

Match an attribute selector whose expected value is `""` the way upstream does, in both directions. A **valueless** attribute is `true`, not `""` (`css-prune.js`: `if (attribute.value === true) return operator === null`), so `a[data-flag=""]` against `<a data-flag>` is unused — rsvelte kept the rule and shipped dead CSS with no `css_unused_selector`. And `[f~=""]` DOES match an empty value, because upstream implements `~=` as `value.split(/\s/).includes(expected)` and `"".split(/\s/)` is `[""]`; rsvelte used `split_whitespace`, which yields nothing, and deleted a rule official ships. A 72-cell grid of 8 attribute spellings against 9 selectors goes from 8 divergences to 0.
