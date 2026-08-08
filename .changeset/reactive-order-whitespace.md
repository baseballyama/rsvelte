---
"@rsvelte/compiler": patch
---

Stop legacy `$:` statement order from depending on whitespace.

`$: {mid=seed*2}` and `$: { mid = seed * 2 }` are the same program, but they
compiled to different execution order. The scan that decides which variables a
reactive statement assigns — which feeds the topological sort — matched the
literal `" = "`, spaces included, so the unspaced form was credited with
assigning nothing, never got an ordering edge, and ran before the statement
whose value it produces. Anything reading `mid` then saw a stale value on first
run. Every compound operator was affected too, not just `=`.

The scan now finds the name and its operator separately, so any spacing (or
none) is recognised. Comparisons are still excluded, and the longest operator
wins, so `<=` stays a comparison while `<<=` assigns.
