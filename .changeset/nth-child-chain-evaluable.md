---
"@rsvelte/compiler": patch
---

Keep evaluating a descendant chain past a pseudo-class that takes arguments. `:nth-child(2)`, `:first-child` and every other argument-taking pseudo-class outside the handful upstream special-cases made the whole selector unevaluable, so `.b > :nth-child(2)` survived with no element child of `.b` at all. Upstream breaks out of its switch for these — they constrain nothing and do not stop the rest of the chain from being tested. `:has(...)` stays unevaluable, because it can reject on its own and this walker does not look downwards.
