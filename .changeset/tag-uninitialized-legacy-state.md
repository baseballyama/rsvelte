---
"@rsvelte/compiler": patch
---

Dev-mode client output now labels uninitialized legacy state declarations that
are not terminated by a semicolon (`let sub` followed by a newline, which is
what a TypeScript-annotation strip or a bare `bind:this` target leaves behind)
with `$.tag($.mutable_source(), "sub")`, matching the official compiler.
rsvelte's legacy state lowering tagged the `let x = init` and `let x;` shapes
but the no-semicolon branch built the `$.mutable_source()` call directly and
skipped the dev label.
