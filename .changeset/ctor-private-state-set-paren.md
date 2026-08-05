---
"@rsvelte/compiler": patch
---

Class-field lowering no longer reads a `}`, `)` or `;` that appears inside a
comment or a literal as code. Two failure modes are fixed.

**Unparseable output.** A `#private` `$state` field assigned from an
object/array literal that contains a `//` line comment closed the injected
`$.set(` at the comment's offset — `$.set(this.#x, {\na: s,)// c` — and
Vite/Rolldown rejected the module with `Parse failure: Unexpected token`. The
scanner that locates the end of the assigned value treated a `//` at *any*
bracket depth as the statement's trailing comment, and four sibling scans in the
method paths took the first `;` anywhere at all, including inside a comment, a
string or a nested function body.

**Silent content loss.** On the server target the class body's closing brace was
found with a bare character loop, so a `}` written inside a comment (`// returns
{ ok, err }`) closed the class early and *every member after it was dropped from
the output* — no error, no warning, just a class missing its methods. The client
member scan had the same defect one level down and split a method in two at such
a comment.

A fifth site: the server treated a class member as a block only when its line
had a `(`, so a `static { … }` initialization block was never recognised and its
body was emitted line by line as class fields — each with a `;` appended,
comment lines included.

All of these scanners now share `shared::js_scan::skip_opaque`, which steps over
strings, template literals, regex literals and both comment forms in one place;
a regex such as `{ a: /[});]+/g }` was mis-parsed on every target even with no
comment involved.

Class lowering also printed its synthesized members at a hard-coded one-level
indentation, which assumed the class sat one tab deep inside a component
`<script>`. A top-level `class` in a `.svelte.js` module came out with its
fields, accessors, constructor and closing brace one tab too deep. Synthesized
members now follow the class's own source indentation, and a grouped multi-line
constructor statement keeps the relative indentation of its continuation lines
instead of being flattened to column 0.
