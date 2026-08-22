---
"@rsvelte/compiler": patch
---

A template read is now decided from `scope.evaluate` rather than from the lowered declaration form. A `{@const}` bound to a function keeps its `template_effect`; a `{@const}` reading an enclosing `{@const}` through a pure global folds; a never-written or bare `$state` under `customElement` keeps its `$.state(…)` declaration while its read folds; and a `$derived` over a literal folds even when the literal is stored as source text rather than as an expression node. A name assigned after a top-level `await` keeps its effect regardless, because it holds nothing at first render.
