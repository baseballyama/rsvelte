---
"@rsvelte/compiler": patch
---

Drop a `$props.id()` declaration whatever trivia surrounds the call, and whatever line its initializer starts on. The declaration was matched as raw text, so a comment on either side of the call — or a line break before it — left the source declaration in place next to the hoisted `const`, emitting `const id` twice in one scope: output no JS parser accepts. The test compares both compilers on 12 trivia and layout spellings, each paired with the same declaration minus the trivia.
