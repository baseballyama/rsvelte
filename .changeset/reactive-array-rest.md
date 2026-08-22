---
"@rsvelte/compiler": patch
---

Declare the rest element of an array destructuring target in a legacy `$:` assignment. `$: [first, ...tail] = arr` emitted `let first;` and then assigned to an undeclared `tail`, which throws at render; the object-pattern forms were already collected.
