---
"@rsvelte/compiler": patch
---

fix(transform): don't wrap explicit object-property keys as prop reads

An explicit (non-shorthand) object-property key that happened to share a name
with a `$props()` binding was being rewritten as a prop read in the client
transform. Only shorthand properties and value positions are reads, so explicit
keys are now left untouched, matching the official compiler's output.
