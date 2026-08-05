---
"@rsvelte/compiler": patch
---

Keep the comments leading a `$:` statement when another statement follows it. The reactive statement is replaced by a synthesized `$.legacy_pre_effect(...)` call, but esrap still prints its leading comments as trivia of the next surviving statement — they only vanish when nothing follows.
