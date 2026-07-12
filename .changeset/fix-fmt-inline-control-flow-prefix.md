---
"@rsvelte/fmt": patch
---

fix(formatter): preserve inline control-flow prefixes

Follow-up changeset for #1437 (by @mustafa0x, merged with `skip-changeset`).
The break-block prefix collector treated any prefix ending in `>` as a wrapped
block-display open-tag eligible to be reused as indentation, which misfired on
inline control-flow markup such as `{:else}<section …>` — the `>` there closes
inline content, not a wrapped open tag. Narrowed the guard to fire only when the
prefix (after trimming leading whitespace) is exactly `>`, so a genuine wrapped
open-tag continuation is still handled while inline `{:else}<el>` markup is left
intact and formatting stays idempotent.
