---
'@rsvelte/compiler': patch
---

Keep a comment written between a method's `)` and its body. esrap runs a parameter list's comment window until the body starts, and in the acorn AST a method is a `FunctionExpression`, so upstream reaches methods, getters, setters and object-literal methods through that same rule. rsvelte routed them through a helper that ended the window at the `)` instead, which put such a comment outside every window and dropped it from the output on all four targets. The three bodied sites now share one expression; the five bodyless TS signature callers keep the paren-ending default, which is the only place it is correct.
