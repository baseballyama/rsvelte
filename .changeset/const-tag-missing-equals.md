---
'@rsvelte/compiler': patch
---

Report a `{@const …}` with no `=` as the missing token upstream raises. `{@const c}` compiled, dropped the declaration and left the body referencing a name no module declares, so the branch threw `ReferenceError` when it rendered — output that parses, which is why only equality could see it. The body is now read as a pattern followed by `=`, as upstream does, so the position lands where the pattern ends and a non-pattern body (`{@const 1}`, `{@const let}`) carries its own error code
