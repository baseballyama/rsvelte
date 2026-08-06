---
"@rsvelte/compiler": patch
---

chore(compiler): fail loudly on an impossible bracket-offset miss

No behavioural change: the discarded branch is unreachable for any `&str`
input, so this only replaces a silent `.ok()` discard with a panic that
names the offset.
