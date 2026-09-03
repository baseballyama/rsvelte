# `tsgo --lsp` renders seven things in `textDocument/hover` differently from `tsc`'s quick info

`rsvelte-language-server` proxies a child `tsgo --lsp` for TypeScript features, while the official
`svelte-language-server` calls the bundled `typescript` package's `LanguageService` directly. The
two are meant to answer the same question, and for hover they mostly do — but seven renderings
differ, and every one of them reaches a user as a different hover card for identical source.

The seven are reported together because they are one component (the quick-info renderer) and one
input file reproduces all of them. The count is deliberately not in the filename: it has already
moved twice.

## Reproduction

`src/probe.ts`, checked with `{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true}`:

```ts
export const inlineUnion: "value" | "highlighted" = "value";
export const inlineUnion2: "Movies & TV" | "Anime & Manga" | "Games" | "Music" = "Games";

export const singleQuoted: () => ReturnType<import('svelte').Snippet> = () => {
  throw new Error("probe");
};

export function outer() {
  function classes(list: string): string[] {
    return list.split(" ");
  }
  return classes;
}

/**
 * @default false
 */
export const flagged = false;

export const fromSet = Array.from(new Set<number>());

import { helper } from "./other";
export const usedHelper = helper;

declare function merged(): any;
declare namespace merged {
  export function id(): string;
}
export const usedMerged = merged;
```

`src/other.ts`:

```ts
export type Helper = { readonly tag: "helper" };
export const helper: Helper = { tag: "helper" };
```

`tsc` side: `ts.createLanguageService(...).getQuickInfoAtPosition(file, offset)`, then
`ts.displayPartsToString(info.displayParts)` and `info.tags`, with `typescript@6.0.3` — the copy
`submodules/language-tools/packages/language-server` resolves.

`tsgo` side: `tsgo --lsp -stdio`, `initialize` + `didOpen` + `textDocument/hover` at the identical
position, reading `contents.value`.

## The seven differences

| position | `tsc` 6.0.3 | `tsgo --lsp` |
|---|---|---|
| `inlineUnion` | `const inlineUnion: "value" \| "highlighted"` | `const inlineUnion: "highlighted" \| "value"` |
| `inlineUnion2` | `const inlineUnion2: "Movies & TV" \| "Anime & Manga" \| "Games" \| "Music"` | `const inlineUnion2: "Anime & Manga" \| "Games" \| "Movies & TV" \| "Music"` |
| `singleQuoted` | `const singleQuoted: () => ReturnType<import("svelte").Snippet>` | `const singleQuoted: () => ReturnType<import('svelte').Snippet>` |
| `classes` (its use on the `return` line) | `(local function) classes(list: string): string[]` | `function classes(list: string): string[]` |
| `flagged` | `const flagged: false` **plus** `tags = [{name: "default", text: "false"}]` | `const flagged: false` **plus** the literal text `*@default* — false` appended to the hover body |
| `from` in `Array.from(…)` | `(method) ArrayConstructor.from<number>(iterable: Iterable<number> \| ArrayLike<number>): number[] (+3 overloads)` | `(method) ArrayConstructor.from<number>(iterable: ArrayLike<number> \| Iterable<number>): number[]` |
| `helper` in `= helper;` | `(alias) const helper: Helper` **plus** a second line `import helper` | `(alias) const helper: Helper`, with no second line |
| `merged` in `= merged;` | `namespace merged` **then** `function merged(): any` | `function merged(): any` **then** `namespace merged` |

1. **Union members are sorted.** `tsc` prints a union in declaration order; `tsgo` prints it
   alphabetically. Both examples above are ordinary string-literal unions with no `keyof`, no
   intersection and no conditional type.
2. **A dynamic import's module specifier keeps the source's quote spelling.** `tsc` normalizes to
   `"`; `tsgo` echoes whatever the source wrote. The same declaration written with `"` renders
   identically on both sides, which is why this only appears in sources that use `'`.
3. **The `(local function)` modifier is dropped.** `tsc` marks a function declared inside another
   function's body; `tsgo` renders it as a plain `function`.
4. **JSDoc tags are inlined into the hover body rather than returned separately.** This one is
   arguably a protocol-shape choice rather than a defect, but it means a client cannot render tags
   its own way, and the resulting markdown differs (`*@default* — false` versus a `tags` array).
5. **The overload count is dropped.** `tsc` appends `(+3 overloads)` to a call signature it
   selected out of an overload set; `tsgo` prints the selected signature alone, so the hover
   gives the reader no sign that other signatures exist.
6. **The `import <name>` origin line is dropped.** For an aliased import `tsc` prints the
   declaration and then a second line naming the import it came through; `tsgo` prints the
   declaration only. Both agree on the `(alias)` prefix, so the two halves of that answer are
   split between the two implementations.
7. **A merged symbol's declarations are listed in the opposite order.** `tsc` prints the
   `namespace` line first and the `function` line second; `tsgo` prints them the other way round.
   The two lines themselves are identical, so this is order alone — and it reaches a hover for
   every Svelte rune, because `svelte/types/index.d.ts` declares `$props`, `$state` and their
   siblings as a function plus a namespace.

The `from` row also reproduces difference 1 on a union that is **not** a string-literal union
(`Iterable<number> | ArrayLike<number>` against `ArrayLike<number> | Iterable<number>`), which
the original probe could not show — see *What does NOT differ* below for what still needs an
inline union.

## What does NOT differ

Two renderings that a plausible reading of the symptom would attribute here, and which this probe
shows are **not** tsgo/tsc differences — recorded so they are not attributed to this report:

- `(property) type: "boolean"` for `const literal = { type: "boolean" } as const;` — **identical**
  on both sides.
- `const bindings: Bindings` for a union behind a type alias — **identical** on both sides; the
  alias is not expanded by either, so the sorting difference above needs an *inline* union to be
  visible at all.

## Where rsvelte stands

These are `rsvelte-language-server` hover divergences against the official server in
`compatibility/lsp-known-failures.json`. rsvelte cannot fix them without re-rendering tsgo's
quick-info text, which would mean re-implementing the renderer it delegates to. The entries stay
listed and attributed here.

The first probe written for the quote-style row used `"` in the source and reproduced nothing on
either side, which is a fact about the probe rather than about the renderer — the row is only
reachable from a source that spells the specifier with `'`.
