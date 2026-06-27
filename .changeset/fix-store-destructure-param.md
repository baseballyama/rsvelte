---
"@rsvelte/compiler": patch
---

fix(transform): don't wrap a store name used as a destructured arrow param

A store name inside an array/object destructuring arrow parameter
(`([$x, $y]) => …`) was wrapped to `$x()` (invalid in a binding position). The
function-parameter check now strips destructuring delimiters so the shadowing
local param is recognized and left bare.
