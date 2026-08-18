---
"@rsvelte/compiler": patch
---

Print the `;;` a removed non-dev `$inspect(...)` leaves as one statement. Upstream keeps the `ExpressionStatement` and replaces its expression with `b.empty`, so esrap emits `;;` on one line and a comment trailing the call stays on it; rsvelte modelled the pair as two empty statements on separate lines, which put a blank line in front of the comment and, on the client, dropped the second `;` entirely.
