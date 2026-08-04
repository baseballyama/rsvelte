---
"@rsvelte/compiler": patch
---

fix(compiler): wrap ownership-validated prop mutations that carry an extra
parenthesis. In dev-mode client output, a `prop(prop().member = value, true)`
mutation call can have its inner assignment wrapped in one extra pair of
parens when the compiler emits it as an expression result rather than a bare
statement (`prop((prop().member = value), true)`). The text-based ownership
mutation wrapper matched the unparenthesized shape only, so this variant
silently skipped the `$.create_ownership_validator(...).mutation(...)` wrap.
