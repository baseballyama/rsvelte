# `4046-single-expression-title-prop-conditional.svelte`

**Issue:** corpus residue

A `<title>` whose fragment is exactly one expression tag takes a different branch of the TitleElement port than the multiline form. Upstream asks `scope.evaluate(value).is_defined` of the BUILT value in both branches; a legacy prop read builds to a `SequenceExpression`, for which upstream's `evaluate` has no case, so `?? ''` survives even though both arms of the source conditional are string literals. Asking the question of the source expression instead drops it.
