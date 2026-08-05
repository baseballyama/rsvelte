---
"@rsvelte/compiler": patch
---

Stop constant-folding an equality comparison in dev mode. Upstream evaluates the *converted* expression, and in dev the `BinaryExpression` visitor has already rewritten `===` / `!==` / `==` / `!=` into a `$.strict_equals` / `$.equals` call, so `{1 === 1}` stays a call instead of folding to the literal `'true'`.
