---
"@rsvelte/compiler": patch
---

fix(transform): two invalid-JS emissions for store/prop reads in binding positions

- A store subscription used as an object-literal SHORTHAND (`{ $width, $height }`)
  was wrapped to the invalid method-shorthand `{ $width() }`. It now expands to
  `{ $width: $width() }`, matching the prop-read path.
- A prop name used as a destructuring binding inside a keyword-guarded reactive
  body (`$: if (cond) { const [x, y] = f(); … }` where `x`/`y` shadow props) was
  wrapped to the invalid `const [x(), y()] = …`. That branch now routes prop reads
  through the scope-aware AST wrapper, which never wraps binding positions or
  locally-shadowed reads.
