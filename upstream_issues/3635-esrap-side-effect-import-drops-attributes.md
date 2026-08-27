# esrap drops attributes from a side-effect import

With esrap 2.2.12, an `ImportDeclaration` with no specifiers loses its import-attributes
clause:

```js
import './data.json' with { type: 'json' };
```

is printed as:

```js
import './data.json';
```

The `ImportDeclaration` visitor returns immediately after writing the source and semicolon
when `node.specifiers.length === 0`. The general path writes `node.attributes`, but the early
path never reaches it. Imports with any specifier keep the same clause.

This is not a formatting-only difference. Hosts that require a JSON import attribute reject
the emitted module, even though the source declaration supplied it. CSS module attributes
have the same failure mode.

rsvelte therefore does not reproduce this early return: `rsvelte_esrap` prints the existing
`with_clause` for both side-effect and specifier-bearing imports. The choice is pinned by the
printer test and by all compiler targets in
`crates/rsvelte_core/tests/import_attributes_clause_3352.rs`.

Local anchor: [#3635](https://github.com/baseballyama/rsvelte/issues/3635).

Desired upstream behavior: print the import-attributes clause before returning from the
specifier-less import branch.
