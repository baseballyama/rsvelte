---
"@rsvelte/compiler": patch
---

Dev-mode client output now wraps prop mutations that flow through a `bind:`
directive onto a member expression (e.g. `bind:value={object.prop}`) with the
ownership validator, matching the official compiler. Upstream achieves this by
synthesizing a real `AssignmentExpression` for the bind and routing it through
the generic assignment visitor, which calls `validate_mutation`; rsvelte's
`bind:` lowering builds the prop-mutation call directly and never went through
that visitor, so the `$$ownership_validator.mutation(...)` wrap — and the
`$$ownership_validator` preamble declaration it depends on — was silently
skipped for this path.
