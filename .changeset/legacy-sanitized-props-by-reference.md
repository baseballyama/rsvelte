---
'@rsvelte/compiler': patch
---

fix(client): the legacy `$$props` rename asks the AST which occurrences are references

Upstream renames from `Identifier.js`, which runs only where `is_reference` is
true. rsvelte's legacy port was an occurrence scan over the generated script, so
it could not tell a reference from a member property, an object key, a class
member name or a label, and it replaced a shorthand where upstream expands it.
Measured against the oracle, 8 of 12 non-string cells diverged, and one of them
changes runtime behaviour: `function f({ $$props })` came out destructuring the
wrong property.

The rename now reads the AST and leaves an `IdentifierName` or a
`LabelIdentifier` alone, which is the same set upstream's `is_reference` answers
`false` for. It still runs after generation, and it still needs the allow-list
that protects the builder-made `$.prop($$props, …)` calls: moving it to the
source — where upstream applies it — was measured and is wrong here, because
fourteen builder sites emit a bare `$$props` into the generated instance script
and every one of them means the sanitized object.
