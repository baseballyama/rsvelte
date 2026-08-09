---
'@rsvelte/compiler': patch
---

Reject every decorator in a TypeScript `<script>` with `typescript_invalid_feature`, not only the ones on a class declaration. A decorator on a method, a field, a getter, a class expression or a constructor parameter was copied verbatim into the generated module, which is then not JavaScript and which no gate could observe — the ratchets score match/mismatch, and the corpus has no witness. The error's code, message and span now match the official compiler in all of those positions.
