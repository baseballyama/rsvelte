---
'@rsvelte/compiler': patch
---

Erase a TypeScript overload signature on a class member, and stop the server from silently dropping a whole instance script

A bodiless class member — a TypeScript overload signature — reached the output as a member
with no body, which no JavaScript parser accepts. On `server` it was worse than a parse
error: `transform_script` re-parses the **erased** script to classify its statements, and a
rejection there returned an empty body, so the entire instance script (imports, the class,
and every neighbouring declaration) vanished while the output still parsed and threw
`ReferenceError` at render time — a shape no gate can observe, because the output is valid
JavaScript. A bodiless member is now erased the way an `abstract` one already was, and a
classification-parse failure aborts the compile through the same `reparse_failure` channel
the async instance-body reparse already used.

The official compiler leaves the signature in place and emits invalid JavaScript for every
one of these shapes — a method, two signatures, `static`, `constructor`, a private name, a
getter, and a class expression — while agreeing with rsvelte on the two neighbouring
controls (an `abstract` method and a `function` overload, both dropped). That divergence is
recorded in `compatibility/deliberate-divergences.md` and reported in `upstream_issues/`.
