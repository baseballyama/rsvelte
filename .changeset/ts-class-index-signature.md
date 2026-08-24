---
'@rsvelte/compiler': patch
---

Erase a TypeScript class index signature instead of leaving it in the output

`class K { [k: string]: unknown }` reached the `client` JavaScript verbatim — TypeScript in a
`.js` artifact, which no parser accepts — and on `server` it was worse: the erased script is
re-parsed to classify its statements, that parse rejected the surviving TypeScript, and the whole
instance script was discarded, leaving output that parses and does nothing.

The eraser left it alone on purpose ("upstream passes these through verbatim"), which was the
wrong reading of upstream's behaviour: the official compiler does not print it either, it
**throws** a bare `TypeError: Cannot read properties of undefined (reading 'type')` from esrap's
`TSIndexSignature` printer, because `remove_typescript_nodes.js` deletes the signature's
`typeAnnotation` while `ClassBody` keeps the node. A crash is not an output to be byte-equal to.

An index signature is type-only and has no runtime representation, so it is now removed like an
interface and a type alias already were — measured over 8 spellings × 3 class hosts × 2 entry
points × 3 targets, taking 96 unparseable outputs, 96 TypeScript leaks and 48 silently-dropped
scripts to zero with the 198 control cells unchanged. Recorded in
`compatibility/deliberate-divergences.md` and reported in `upstream_issues/`.
