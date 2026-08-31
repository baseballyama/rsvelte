# A nested `:not(` selector makes `grass` divide every later slash in the file

`grid-row: 2/5` is a slash-separated list in modern Sass, not a division: dart-sass 1.103.1
emits it unchanged. `grass` 0.13.4 emits it unchanged too — until a rule **nested inside
another rule** carries a `:not(` selector. From that point on, every slash-separated number
list in the stylesheet is evaluated as division. `grid-row: 0.4` is not a valid value, so the
browser drops the declaration.

## Reproduction

```scss
.p { .q:not(.r) { grid-row: 2/5; } }   /* dart-sass: 2/5 — grass: 0.4 */
```

**The leak is not confined to the rule that triggered it.** Each of these also prints `0.4`
where dart-sass prints `2/5`:

```scss
.p { .q:not(.r) { color: red; grid-row: 2/5; } }      /* later in the same rule   */
.p { .q:not(.r) { color: red; } .s { grid-row: 2/5; } }   /* a sibling rule       */
.p { .q:not(.r) { color: red; } grid-row: 2/5; }      /* back out in the parent   */
.p { .q:not(.r) { .t { grid-row: 2/5; } } }           /* deeper inside            */
.p { .q:not(.r) { color: red; } }
.s { grid-row: 2/5; }                                  /* a later TOP-LEVEL rule  */
```

## What the trigger actually is

It is the Sass **`not` keyword followed by `(`**, reached through the declaration/style-rule
ambiguity that only exists inside a nested block. Every one of these keeps the list, on both
compilers:

```scss
.p { .q:nots(.r) { grid-row: 2/5; } }   /* not a keyword          */
.p { .q:xnot(.r) { grid-row: 2/5; } }   /* not a keyword          */
.p { .q:not      { grid-row: 2/5; } }   /* keyword, but no `(`    */
.p { .q:is(.r)   { grid-row: 2/5; } }   /* :is / :where / :has /  */
.p { .q:and(.r)  { grid-row: 2/5; } }   /* :nth-child / :hover /  */
.p { .q:or(.r)   { grid-row: 2/5; } }   /* [attr] — all fine      */
.q:not(.r) { color: red; }
.s { grid-row: 2/5; }                    /* :not at TOP level: fine */
```

A top-level `:not(` does not trigger it, which is consistent with the mechanism: at the top
level a declaration is illegal, so the parser goes straight to the selector path. Inside a
nested block it must first try to parse `q: not (.r) { …` as a declaration, and `not` is a
Sass operator, so that attempt reaches the parenthesised-expression path. The attempt fails at
the `{` and the cursor is rewound — but `ValueParser::allow_slash` / `ContextFlags::IN_PARENS`
are not, and `allows_slash: false` on the resulting `BinaryOpExpr` is what drops `as_slash`
(`parse/value.rs:532-551`, `evaluate/visitor.rs:2856-2864`).

Measured with dart-sass 1.103.1 and `grass` 0.13.4 through
`crates/rsvelte_preprocess/tests/grass_serialisation.rs`.

Two neighbouring cases agree on both sides and are **not** part of this report, though each
looks like it should be: `$n: 2; a { grid-row: $n/5; }` divides on both (dart-sass with a
`slash-div` deprecation warning), and `calc(2/5)` folds to `0.4` on both. A report reduced to
"grass divides a slash" would be describing those.

## Where it shows up

1 of the 2 `content-differs` units in the `scss-known-failures` ratchet
(`musicat/src/App.svelte`). It is the only entry in that ratchet whose divergence produces CSS
a browser rejects. The ratchet count understates the mechanism: the leak corrupts every
*later* slash list in the file, and a stylesheet simply does not contain many.
