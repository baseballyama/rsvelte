# `3074-paren-wrapped-nested-class.svelte`

**Issue:** [#3074](https://github.com/baseballyama/rsvelte/issues/3074)

A class expression in **parentheses** in a field initializer (`inner = new (class { deep = $state(1); })()`) came out as `#inner = $.state(1)` — the class and the real initializer gone, the field reactive. Two causes: the member splitter jumped a `(`/`[` region whole, so a class body inside one never got the one-member-per-line shape; and the field parser accepted a rune found anywhere on the line rather than at the head of the initializer. Written across lines the same source was already correct
