---
'@rsvelte/compiler': patch
---

Parse a keyword-headed template expression with the real parser

`{import.meta.url}` was parsed by the template-expression fast path as an
ordinary member chain headed by an identifier named `import`. Every downstream
"is this pure" port then answered from the leftmost node — an unbound identifier
is a global, and globals are assumed safe — so the read came out **static**
where official emits `$.template_effect` on the client and wraps the server body
in `$$renderer.component`. `import.meta.env.MODE` is the ordinary Vite spelling,
so this is not an exotic shape.

The axis is the **leading token**, not `import.meta`: the fast path scans an
identifier and then dots, so every construct whose first token is a reserved word
that changes the node type is the same defect. That domain is closed, so the
word list that hands an expression to the real parser is now the whole reserved
set rather than the 13 strict-mode words it held — measured, `{class}`,
`{super.x}`, `{typeof}` and 29 more compiled where official raises
`js_parse_error`, and `{this.x}` produced an `Identifier` named `this` instead
of a `ThisExpression`, which made the read static. `true` / `false` / `null`
stay on the fast path: it builds them as literals, which is what they are.

That closes an **over-acceptance**, which is invisible to any comparison of
accepted programs: `{new.target}` is illegal outside a function and official
rejects it, while rsvelte spelled it `new` + `.target` and compiled it.

Handing these to the real parser then exposed the other half. `MetaProperty`,
`ImportExpression` and `ThisExpression` are node types the client's reactivity
walk had never met, and its fallback calls an unknown node reactive — so
`{import.meta}`, `{import('./x')}` and `{this}` became `$.template_effect` where
official leaves them static. Upstream has no analysis visitor for any of the
three, so all three are static, and only an `ImportExpression`'s operands can be
reactive; the arms are now written down rather than left to the fallback. A
MEMBER of one is still dynamic, which is the `MemberExpression` rule doing its
job — its leftmost object is then not an `Identifier`.

A keyword is legal as a PROPERTY name, so a word after `.` is exempt from the
gate: `props.class` is ordinary Svelte and stays on the fast path.

Grids — 11 expressions × 8 hosts × 3 targets: **72 of 264 diverging → 3**, and
44 reserved words × 3 shapes: **67 of 147 → 11**. Every remaining cell is a
different cause with its own issue, and each is named by which control moves
with it: `{@const c = new.target}` (#3691 — that slot swallows *every* parse
error into an empty identifier, whatever produced it), `{var}` / `{enum}` /
`{interface}` / `{arguments}` (#3692 — a Svelte-level error, not a JS one), and
`{super.x}` / `{await}` (#3694 — the real parser accepts these too, so the gate
cannot be what fixes them).
