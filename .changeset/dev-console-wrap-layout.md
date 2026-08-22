---
"@rsvelte/compiler": patch
---

Decide the dev-mode `console.METHOD(...)` wrap by upstream's rule in the text fallback too. The instance-script pipeline splits on source lines, so a declaration sharing a line with the head of a multi-line statement yields fragments that are not standalone programs; oxc rejects those, and the fallback then chose by argument spelling (`!all_args_are_literals`) rather than by `scope.evaluate(arg).has_unknown`. An identifier that folds to a known value, a binary expression, an arrow and a `!x` were all wrapped, so moving two statements onto one line changed the emitted code.
