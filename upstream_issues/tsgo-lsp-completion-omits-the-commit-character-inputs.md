# tsgo's LSP completion response carries neither commit characters nor `isNewIdentifierLocation`

`svelte-language-server` decides a completion item's `commitCharacters` from two things the
TypeScript API returns and the LSP response does not:

```ts
// packages/language-server/src/plugins/typescript/features/CompletionProvider.ts:790-812
const isNewIdentifierLocation = response.isNewIdentifierLocation;
let defaultCommitCharacters = response.defaultCommitCharacters
    ? Array.from(response.defaultCommitCharacters)
    : undefined;
if (!isNewIdentifierLocation) {
    if (defaultCommitCharacters) defaultCommitCharacters.push('(');
    else defaultCommitCharacters = ['.', ',', ';', '('];
}
```

```ts
// :814-846
const commitCharacters = entry.commitCharacters;
const skipCommitCharacters =
    entry.kind === ts.ScriptElementKind.warning || entry.kind === ts.ScriptElementKind.string;
if (commitCharacters) {
    if (!options.isNewIdentifierLocation && !skipCommitCharacters)
        return commitCharacters.concat('(');
    return commitCharacters;
}
return skipCommitCharacters ? [] : undefined;
```

A consumer proxying `tsgo --lsp` has access to none of `response.isNewIdentifierLocation`,
`response.defaultCommitCharacters` or `entry.commitCharacters`, so it cannot reproduce any branch
of this rule: it must either always append `(` or never.

## Measured

One position, one project, three servers, same request:

```
tsgo --lsp   top-level keys ["isIncomplete","items"]   1070 items
             union of item keys ["data","kind","label","sortText","tags"]
             items carrying commitCharacters: 0/1070

rsvelte      union of item keys ["commitCharacters","data","kind","label","preselect","sortText"]
             items carrying commitCharacters: 1056/1056   (synthesized fallback)

official     union of item keys ["commitCharacters","data","kind","label","preselect","sortText"]
             items carrying commitCharacters: 1063/1063
```

There is no `itemDefaults` on the list and no `commitCharacters` on any item, so the information
is absent at both levels the LSP offers for it — this is not a per-item omission that
`completionItem/resolve` could repair, because commit characters are consumed when the list is
first shown.

## Consequence

On the four real-world projects the rsvelte LSP differential gate compares, the two labels this
produces are **52%–98% of all divergent response fields**:

| project | commit-character fields | all divergent fields | share |
|---|---|---|---|
| melt-ui | 1,986,836 | 2,029,602 | 97.9% |
| bits-ui | 1,007,674 | 1,046,868 | 96.3% |
| flowbite-svelte | 1,178,362 | 2,283,496 | 51.6% |
| shadcn-svelte | 1,412,710 | 1,849,336 | 76.4% |

The two shapes are `official ['.', ',', ';']` against `rsvelte ['.', ',', ';', '(']`, and
`official` omitting the field where `rsvelte` sends the fallback set — the two branches of
`isNewIdentifierLocation` exactly.

A consumer therefore has to pick one of two errors and be wrong on one population either way:
always appending `(` is wrong wherever `isNewIdentifierLocation` is true, and never appending it is
wrong wherever it is false. Choosing whichever constant makes a particular corpus quieter would be
fitting a constant to one population and carrying it to another, so the divergence is left standing
rather than tuned away.

Sibling of `tsgo-lsp-completion-item-omits-the-typescript-kind.md`: the same response drops the
`ScriptElementKind` distinction, and the same rule file consumes it.
