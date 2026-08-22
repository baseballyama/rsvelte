---
"@rsvelte/compiler": patch
---

Keep the comments a `$derived` / `$derived.by` call holds around its argument. A comment before the call's `(` now rides with the ones after it into the synthesized thunk's parameter parens, and a comment after the argument lands where esrap flushes it — inside the call when no thunk was synthesized, past the statement's `;` when one was.
