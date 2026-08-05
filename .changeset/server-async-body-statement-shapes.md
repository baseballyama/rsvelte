---
"@rsvelte/compiler": patch
---

Fix the async server instance-body split for `do…while`, labeled, `debugger` and
bare-block statements, plus brace-less `if … else` chains. These shapes used to
produce a thunk array that the compiler could not parse back, which quietly
degraded the component to an un-split instance body. Such a rejection is now a
compile error in every build profile rather than silently wrong output.
