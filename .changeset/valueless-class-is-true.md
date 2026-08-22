---
"@rsvelte/compiler": patch
---

Keep a valueless `class` attribute distinct from an empty one. Upstream's value is the boolean `true`: the scoping join treats it as empty, while the "is this class empty?" gate treats it as present, so `<div class>` renders `class=""` and a scoped one renders the hash. Collapsing it to `""` up front lost both halves in three separate copies of the rule — the client root-element branch, the client static-subtree serializer used by nested elements, and the server literal branch.
