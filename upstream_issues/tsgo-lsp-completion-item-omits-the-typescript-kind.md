# tsgo's LSP collapses `const`/`let`/`var` into one `CompletionItemKind`, and the initial item carries nothing to recover it

`tsgo --lsp` maps every variable-like completion entry to `CompletionItemKind.Variable` (6). The
TypeScript API it is a port of distinguishes three `ScriptElementKind`s for the same entries, and
an editor that maps `const` to `Constant` cannot reproduce that over the LSP: the distinction is
absent from the initial `textDocument/completion` response, and reappears only inside a
`completionItem/resolve` `detail` string.

Measured on `tsgo` **7.0.0-dev.20260703.1** and `typescript` **6.0.3**, same input, same position.

## Input

`main.ts`, completion requested at the end (after the bare `a`):

```ts
const aConst = true;
let aLet = 1;
var aVar = 2;
a
```

## The TypeScript API distinguishes them

`ts.createLanguageService(...).getCompletionsAtPosition(file, position, {})`:

```
aConst  ScriptElementKind="const"  kindModifiers=""
aLet    ScriptElementKind="let"    kindModifiers=""
aVar    ScriptElementKind="var"    kindModifiers=""
```

`ScriptElementKind.constElement` / `letElement` / `variableElement` are three distinct values, and
consumers key on them. `svelte-language-server` does exactly that
(`packages/language-server/src/plugins/typescript/utils.ts`, `scriptElementKindToCompletionItemKind`):

```ts
case ts.ScriptElementKind.constElement:
    return CompletionItemKind.Constant;
case ts.ScriptElementKind.letElement:
case ts.ScriptElementKind.variableElement:
case ts.ScriptElementKind.localVariableElement:
case ts.ScriptElementKind.alias:
    return CompletionItemKind.Variable;
```

## tsgo's LSP does not

`textDocument/completion` at the same position, `tsgo --lsp -stdio`:

```
aConst  kind=6  data={"fileName":"/tmp/main.ts","position":140,"name":"aConst"}
aLet    kind=6  data={"fileName":"/tmp/main.ts","position":140,"name":"aLet"}
aVar    kind=6  data={"fileName":"/tmp/main.ts","position":140,"name":"aVar"}
```

`6` is `CompletionItemKind.Variable`. All three entries are identical in kind.

## The initial item carries no other discriminator

This is the complete item as returned — there is no `detail`, no `labelDetails`, and `data` holds
only the resolve coordinates:

```json
{"label":"aConst","kind":6,"sortText":"11","data":{"fileName":"/tmp/main.ts","position":140,"name":"aConst"}}
```

`completionItem/resolve` on that item does surface it, but only as prose inside `detail`:

```json
{"label":"aConst","kind":6,"detail":"const aConst: true","sortText":"11","data":{...}}
```

So the only route from the LSP to the API's answer is to resolve every item and parse the leading
keyword out of `detail` — which defeats the purpose of `completionItem/resolve` being lazy (1,058
items for a single Svelte completion in the case that prompted this report) and depends on the
wording of a human-readable string.

## Why it matters

`tsgo`'s LSP is presented as a drop-in for editors that previously drove `tsserver` or the JS API.
An editor integration that maps `constElement -> Constant` — VS Code's own TypeScript extension and
`svelte-language-server` both do — silently changes behaviour when the backend is swapped, and the
information needed to keep it is not in the payload.

## Suggested fix

Map `ScriptElementKind.constElement` to `CompletionItemKind.Constant` in the LSP conversion, as the
API-level kind already distinguishes it. Failing that, carrying the `ScriptElementKind` (or
`kindModifiers`, which is likewise dropped) through `data` would let a client reconstruct it without
a resolve round-trip.

## How it was reached

`rsvelte`'s language server proxies a child `tsgo --lsp` for TypeScript features and is compared
field-by-field against `svelte-language-server`, which calls the JS API directly. Three completion
items in one fixture diverge on `kind` only — `Constant` upstream, `Variable` here — out of 3,564
label-paired items across the fixture suite. `kindModifiers` is dropped by the same boundary and is
already worked around in `crates/rsvelte_language_server/src/tsgo_completion.rs:118-121`.
