# Svelte's client LetDirective crashes on a `let:` value that is not an object/array literal

The official Svelte compiler (v5.56.9) kills `compile()` with a raw `TypeError` — no error
code, no position, no frame — when a `let:` directive's value is a destructuring default:

```svelte
<C><b slot="a" let:total={t = 0}>{t}</b></C>
```

```
TypeError: Cannot read properties of undefined (reading 'map')
    at ArrayExpression|ArrayPattern (svelte/compiler/index.js)
```

`<C let:v={w = 1}>{w}</C>` and `let:row={{ a, ...r } = {}}` fail the same way. Only
`generate: 'client'` crashes; `generate: 'server'` compiles the same component and emits the
correct pattern (`{ total: t = 0 }`), so the two targets disagree about whether the input is
legal at all.

The cause is `phases/3-transform/client/visitors/LetDirective.js`: the non-`Identifier`
branch is a two-way choice between `ObjectExpression` and *everything else*, and the else
arm reads `node.expression.elements` —

```js
/** @type {Expression} */ (node.expression).type === 'ObjectExpression'
	? b.object_pattern(node.expression.properties)
	: b.array_pattern(node.expression.elements)
```

An `AssignmentExpression` has neither `properties` nor `elements`, so `elements` is
`undefined` and esrap's array-pattern printer throws on `.map`. Parsing already accepted the
directive, and Phase 2 already registered its bindings, so this is a codegen-only crash on a
program the rest of the pipeline treats as valid.

A second, quieter consequence of the same two-way choice: when the pattern *is* an array with
a default (`let:row={[h = 1, ...t]}`), the emitted derived compiles but returns `{}` and the
slot body's `h` / `t` stay unbound — `extract_identifiers_from_destructuring` binds nothing
for an array rest or a default, while the server target binds them correctly. That divergence
is not a crash and is reproduced byte-for-byte by rsvelte on purpose.

rsvelte compiles the crashing shapes on both targets (see
[#3123](https://github.com/baseballyama/rsvelte/issues/3123) for the rsvelte-side fixes), so
this is an error-presence divergence: the corpus candidates exercising the top-level default
are held out of `compatibility/pattern-corpus` until upstream decides the behavior.

Desired upstream behavior: handle the assignment (and any other reinterpretable) shape in the
client visitor the way the server visitor already does, or reject it in Phase 2 with a coded
diagnostic instead of throwing out of the printer.
