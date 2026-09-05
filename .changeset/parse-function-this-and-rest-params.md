---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

`parse()` gives a function declaration its `this` parameter and its rest parameter.

`FunctionDeclaration.params` was losing two independent things. TSESTree models a TypeScript
`this` parameter as an ordinary leading `params[0]`, which the declaration converter never
consulted; and a rest parameter lives in oxc's `FormalParameters::rest`, which the same
converter never emitted — so `function f(...a)` and `export function f(...a)` disagreed with
each other, the export form alone routing through the path that already handled it. A rest
parameter's type annotation belongs to the `RestElement` rather than to its `argument`, so
`JsNode::RestElement` carries it now; the wire format the `rsvelte.node` parse envelope
writes therefore gains a field, and its version moves with it.

One key counted both losses, which is why fixing one of them left it listed: a key fine
enough to separate them would have gone green on the first fix and the second cause would
have shipped as closed.

Six further ratchet keys retire with the two this change targets. The AST comparison pairs
array children strictly by index, so a `params` array one element short makes every sibling
after the hole pair against the wrong node — measured directly against the pre-fix binary,
`function f(this: any, a: string)` compares official's `TSAnyKeyword` against rsvelte's
`TSStringKeyword`, and a declaration with no `this` parameter shows no divergence at all.
