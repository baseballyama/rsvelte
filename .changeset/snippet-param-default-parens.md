---
'@rsvelte/compiler': patch
---

Keep a snippet parameter default's source parentheses on both targets. Upstream parses the parameter list with `preserveParens: true` and never calls `remove_parens` there, so a `ParenthesizedExpression` survives into `node.parameters` and is spread verbatim: esrap prints one pair per node, and `is_simple_expression` — which has no arm for a paren node — takes the lazy `$.fallback(v, () => d, true)` arm however simple the contents are. rsvelte unwrapped every paren at conversion, so `p = (obj.a)` lost its brackets on both targets, `p = obj.a ? (obj.a ? 1 : 2) : 3` lost the inner pair on the server, and `p = (obj.a, obj.a)` lost the outer pair the sequence's own brackets sit inside. The same surviving node is read a second time in phase 2: `is_safe_identifier` walks a member chain by `node.object` and stops at a paren, so `(obj.a).b` as a snippet parameter default also sets `needs_context` and the component gains `$.push`/`$.init`/`$.pop`.
