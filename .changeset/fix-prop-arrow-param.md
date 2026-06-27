---
"@rsvelte/compiler": patch
---

fix(transform): don't wrap a prop name used as an arrow-function param

A prop used as an arrow-function parameter binding (`(nodeId) => …`,
`options => …`) was rewritten to the invalid `(nodeId()) => …`. The text
prop-read wrapper now skips arrow-parameter binding positions (mirroring the AST
version's param guard).
