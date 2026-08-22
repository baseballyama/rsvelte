---
"@rsvelte/compiler": patch
---

Reject a token that cannot start a selector inside a pseudo-class argument, so `:global(@keyframes s)`, `:global(%x)` and `:global(1x)` raise `css_expected_identifier` as upstream does. The sub-parser reading those arguments discarded every diagnostic except the nesting bound; it now hands them all back, and the namespace selectors that gap was hiding (`ns|el`, `*|el`) are implemented.
