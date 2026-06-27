---
"@rsvelte/compiler": patch
---

fix(transform): five codegen fixes (esrap method shorthand, slot memo index, reactive dep order/membership, import-in-template)

- esrap prints a property whose value is a `FunctionExpression` as method shorthand
  (`"k"() {}`) regardless of key kind, matching esrap — a string-keyed function
  property no longer prints as `"k": function`.
- The slot-prop memo reference index no longer double-counts, so the getter `$.get($N)`
  matches its `$N` declaration.
- Legacy `$:` dependency ordering scans a string-literal-blanked copy of the body, so a
  literal word (`` `width: ${x}` ``) no longer text-matches before the real read and
  misorders deps.
- A bare `ident;` read statement is no longer misclassified as an assignment target, so
  its dependency is kept (was dropped, producing `() => {}` / missing deps).
- The line-based import extractor tracks cross-line string/template/comment state, so an
  `import …` line inside a backtick template literal is not mis-hoisted as a real import.
