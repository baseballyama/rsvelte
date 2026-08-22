---
'@rsvelte/compiler': patch
---

Report an assignment to a non-assignable target as acorn does — `Assigning to rvalue` at the target's start. It is the one parse failure acorn raises at the start of the offending region rather than where it stopped consuming tokens, so the shared point-error helper reported OXC's message at the target's end
