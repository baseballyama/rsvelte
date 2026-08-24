---
"@rsvelte/compiler": patch
---

Lower a rune call written inside grouping parentheses. `let v = ($state(1));`, `class K { f = ($state(1)); }`, `let { a = ($bindable(1)) } = $props();`, `const id = ($props.id());`, `($inspect(x));`, `($effect(…));` and `return ($state.snapshot(v));` all left the rune name in the generated module, which throws on import; `$props.id()` additionally emitted its `const` twice and the server module's statement removal left `();` behind, neither of which is JavaScript. acorn builds no `ParenthesizedExpression`, so upstream cannot tell these from the bare calls — the four phase-3 entry points now normalise the parentheses away before any lowering reads the source, so the two agree by construction rather than one decision point at a time.
