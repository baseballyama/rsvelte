---
'@rsvelte/compiler': patch
---

Judge a named export empty only after its declaration is stripped, so a type-only `export` is not a component export

Upstream's `ExportNamedDeclaration` visitor visits the declaration first and returns `b.empty` when
the visit emptied it. rsvelte judged the export **before** the visit, which was harmless only while
the parse conversion happened to pre-collapse a namespace into an empty statement. Once #3417 made
`export namespace N { … }` carry its body through parse — which it must, so the body can be
rejected when it holds a value — the export survived the strip, `process_legacy_exports` counted it,
and the component gained a `$$props` parameter the official compiler does not emit.

`$$props` is the component's calling signature, so this is an API difference rather than a byte
difference; the output parses and runs, and in dev mode both compilers emit `$$props` anyway, so
only a production target discriminates.

The specifier half of the same visitor is fixed with it: an export whose specifier list filters to
nothing — including one written with none, `export {}` — is empty, mirroring upstream's
`if (specifiers.length === 0) return b.empty`.

A dotted `namespace N.M { … }` is now nested as its desugaring `namespace N { namespace M { … } }`,
a shape upstream compiles, instead of having its body dropped at parse: the type-only body still
strips, and a value in it is rejected exactly as the un-dotted spelling is. The official compiler
crashes on the dotted form with an uncoded `TypeError`; that divergence is recorded in
`compatibility/deliberate-divergences.md` and reported in `upstream_issues/`.

Measured against `submodules/svelte` @ `20b341f10048` (`VERSION === '5.56.9'`) over 29 declaration
forms × 2 export spellings × 3 entry points × 2 targets × dev/prod.
