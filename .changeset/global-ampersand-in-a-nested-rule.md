---
'@rsvelte/compiler': patch
---

fix(css): a bare `:global` opening a nested relative selector becomes `&`

Upstream removes the pseudo-class and then, when the rule has a parent, the
pseudo-class carries no arguments and the relative selector has no combinator,
writes an `&` where it stood. rsvelte deleted the text and wrote nothing, so
`.p { :global > .a { … } }` came out as `.p… { > .a { … } }` — CSS no browser
accepts — and `:global.a` lost the subject it was fused to.
