---
'@rsvelte/compiler': patch
---

A removed `$effect` leaves the `;` upstream leaves: esrap drops an `EmptyStatement` only from a body sequence, so a switch case consequent and an unbraced `if` / `else` / `for` / `while` / `do` / label body keep it
