---
"@rsvelte/compiler": patch
---

Client transform no longer rescans the whole instance script once per reactive
variable. The two loops over the local reactive variables each asked the same two
questions per variable — whether it is declared as `const … = $state(…)` and
whether it is reassigned — and every answer walked the entire script, so the cost
grew as variables times script length. Both answers are now built in one pass and
read from an index. Output is unchanged.
