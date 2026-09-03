# Svelte reports a comment twice at every TypeScript speculation point (`@sveltejs/acorn-typescript` 1.0.10)

Svelte 5.56.10 (`submodules/svelte` @ `56a036f4ce87`) resolves
`@sveltejs/acorn-typescript` to **1.0.10**, whose `tsLookAhead` does not suppress `onComment`
while it speculates. Every comment sitting at a TypeScript disambiguation point is therefore
delivered to `onComment` **twice**, and `parse()` returns it twice in the comment lists.

Upstream fixed this in **1.0.13**. The ask here is a dependency bump, not a code change in
Svelte.

## Which version, from the lock and not the range

`packages/svelte/package.json:175` declares `"@sveltejs/acorn-typescript": "^1.0.10"`, a range
that **permits** 1.0.13 — on its own it is not evidence. The resolution is `pnpm-lock.yaml:79`:

```
version: 1.0.10(acorn@8.16.0)
```

## Mechanism

1.0.10 saves and restores lexer state but never sets `isLookahead`, unlike the `lookahead(number)`
method defined immediately below it:

```js
tsLookAhead(f) {
  const state = this.getCurLookaheadState();
  const res = f();
  this.setLookaheadState(state);
  return res;
}
```

`onComment` fires during the speculative pass, the state rewinds, and the real parse fires it
again. 1.0.13 replaces the body with a rollback scope:

```js
tsLookAhead(f) {
  const frame = this.beginParseEffectScope();
  try { return f(); } finally { this.parseEffects.rollback(frame); }
}
```

## The domain is three call sites, and both branches of each decision duplicate

`tsLookAhead` has exactly three call sites, identical in 1.0.10 and 1.0.13:

| site | disambiguates |
|---|---|
| `tsIsUnambiguouslyStartOfFunctionType` | function type vs parenthesized type, after `(` |
| `tsIsStartOfMappedType` | mapped type vs type literal, after `{` |
| `tsIsUnambiguouslyIndexSignature` | index signature, after `[` |

**Reaching a site is sufficient; the outcome is irrelevant.** `let g: (/*c*/ number)`, which
decides it is *not* a function type, duplicates exactly as much as the function type does. That
is what closes the enumeration: the axis is the speculation point, not the construct.

## Measured at the acorn layer, on both versions

`acorn.Parser.extend(tsPlugin()).parse(src, { onComment: () => n++ })`:

| cell | 1.0.10 | 1.0.13 |
|---|---|---|
| `let f: (/*c*/ a: number) => void;` | **2** | 1 |
| `let g: (/*c*/ number);` | **2** | 1 |
| `type M = { /*c*/ [K in "a"]: 1 };` | **2** | 1 |
| `type L = { /*c*/ a: 1 };` | **2** | 1 |
| `interface I { [/*c*/ k: string]: 1 }` | **2** | 1 |
| `let a = /*c*/ 1;` (negative control) | 1 | 1 |
| `/*c*/ let a = 1;` (negative control) | 1 | 1 |

Both negative controls fire once on **both** versions, which is what says 1.0.13 fixes the
duplication rather than suppressing comments in general.

## The `parse()` face

Comment lists in the returned AST, `{ modern: true }`, for
`let f: (/*c*/ a: number) => void;`:

```
official   comments[26..31, 26..31]   leadingComments[26..31, 26..31]
rsvelte    comments[26..31]
```

Official's duplication is the subject of this report. rsvelte's own divergence in the same cell —
that the comment is missing from `leadingComments` at all — is a **separate rsvelte defect**,
tracked as #4244, and is not claimed here.

## Scope: this report covers the `parse()` face only

On the `compile()` face the same input produces official emitting the comment text **twice** in
generated JS and rsvelte emitting it **zero** times. That `2 → 0` superimposes two mechanisms —
this one, and rsvelte's own erasure of a comment inside a stripped TypeScript type annotation
(#4244). Only the `parse()` face isolates upstream's duplication, so only it is reported here.

## Residual assumption

The acorn-layer measurement above drives `acorn.Parser.extend(tsPlugin())` directly. That is the
same construction `phases/1-parse/read/script.js` uses, but the two were not shown to be
identical in their option set; the claim that Svelte's own `parse()` inherits this behaviour rests
on the observed doubled spans in its output, not on the acorn-layer count alone.

## Not decided here

Whether rsvelte should reproduce the duplication for byte equality — the road
`3_transform/client/dead_comments.rs` took for #2990 — is **not decided**.
