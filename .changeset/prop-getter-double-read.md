---
"@rsvelte/compiler": patch
---

Stop reading a prop twice when an inline template arrow mutates it. `state.a = state.b` inside `onclick={() => { … }}` compiled to `state().a = state()().b`, which throws `state(...) is not a function` on the first click: the assignment converter read-transforms both sides so the mutation wrapper can be built, and the second transform pass then re-read every source-prop and store-subscription on the right. The read transforms now mark their getter callee opaque, which is what the setter callees already do, so a second pass is a no-op while a user-written `p()` is still read as one.
