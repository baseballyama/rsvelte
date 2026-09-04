# `oxc_formatter_css` does not round-trip CSS the Svelte compiler accepts

- **Upstream**: [oxc-project/oxc](https://github.com/oxc-project/oxc), `oxc_formatter_css`
- **Observed at**: rev `0389c4010ef8298728f3e47fff8e2a9106d10045` (the rev this repo pins), reproduced with the published `oxfmt` 0.64.0
- **rsvelte issue**: —
- **Severity**: one symptom leaves a `<style>` block unformatted; two rewrite tokens no other tool in the chain rewrites. No output is made invalid.

## The predicate that makes these one family

The official Svelte compiler defines the input language a Svelte formatter is fed.
Every symptom below is CSS that **the compiler accepts and emits byte-for-byte
unchanged**, and that `oxc_formatter_css` does not round-trip: it either refuses the
file or rewrites the token.

That predicate is what separates these from invalid input, so it is tested per
symptom rather than once for the family. One negative control is shared by all
three: `.card ?? .a` is rejected by the compiler (`css_expected_identifier`) **and**
by `oxfmt`, so it is genuinely outside the language and is not reported here.

Measured with `submodules/svelte/packages/svelte/src/compiler/index.js` (VERSION
5.56.10) — the source path the gates use, not the npm build, which disagrees with it
on other inputs.

## Symptom 1 — a repeated combinator is rejected, and the whole block goes unformatted

```css
.card >> .a { color : red; }      /* EXIT=2, file byte-unchanged */
.card > .a  { color : red; }      /* EXIT=0, rewritten to `color: red;`   <- positive control */
.card ?? .a { color : red; }      /* EXIT=2, DIFFERENT message            <- negative control */
```

```
>>   x Syntax error: simple selector is expected      col 8
??   x Syntax error: expect token `{`, but found `?`  col 7
```

The positive control is what makes the two `EXIT=2`s readable: `>` on the same input
is accepted *and reformatted*, so the failure is the combinator, not the file or the
loose `color :` spacing.

**Compiler**: accepts, and scopes both sides —
`.card.svelte-lnb7it >> .a:where(.svelte-lnb7it) { color: red; }`.

`>>` was in a Selectors Level 4 draft as the descendant combinator and was withdrawn,
so a strict CSS parser rejecting it is defensible. It is still inside the Svelte
toolchain's input language, which is the language this formatter is fed.

**Blast radius**: one rejected selector voids formatting for the **whole** `<style>`
block. In the carrier, `.card > .a` sits in the same block and is left unformatted
beside `.card >> .a`. rsvelte replaces the first leading whitespace character of each line with one indent
unit and leaves the rest of that line's indentation alone, so interior tabs and
`color : green` spacing survive — a partial pass-through, not a verbatim one, and the
rsvelte-side half of this carrier's divergence. Two visible symptoms, one cause.

Two cells differing only in the combinator isolate it:

| cell | rsvelte vs the oracle |
|---|---|
| `.card > .a`, tabs, `color : green` | **EQ** — rsvelte normalizes tabs and `color : ` |
| `.card >> .a`, otherwise identical | **DIFF** — neither normalization happens |

## Symptom 2 — an invalid hex token is lowercased

```css
color: #E7E7E7;    /* valid   -> #e7e7e7   both engines agree            */
color: #ABC;       /* valid   -> #abc      both engines agree            */
color: #E7E7E7l;   /* INVALID -> oxc lowercases; prettier/PostCSS does not */
color: #ABCDE;     /* INVALID -> oxc lowercases; prettier/PostCSS does not */
```

The valid rows are the positive control and they matter: without them this reads as
"the two engines disagree about hex case", which is **false** and was the first
reading taken here. They agree on every well-formed hex token, in a plain `<style>`
and under `lang="css"`, `lang="postcss"` and `lang="scss"` alike (4/4 identical).
The axis is the token's *validity*, not its case.

**Compiler**: accepts and emits `color: #E7E7E7l;` and `color: #ABCDE;` unchanged.

## Symptom 3 — a trailing comma before `;` is dropped

```scss
box-shadow:
  inset $cream 0.25em 0 0 0,
  //inset darken($cream,25%) .3em 0 0 0,
  inset $cream -0.25em 0 0 0,
;
```

oxc drops the trailing comma and closes the declaration
(`inset $cream -0.25em 0 0 0;`, comment on the next line). prettier keeps the comma
and emits `;//inset darken(...)` — the `;` moved in front of the comment.

**Compiler**: accepts and emits the value list, the trailing comma and the lone `;`
unchanged.

Both printers are doing something defensible with malformed SCSS. The point is not
which is nicer; it is that oxc's result does not round-trip and prettier's does.

## The direction, stated because it decides the classification

For symptoms 2 and 3, **`oxc_formatter_css` is the only tool in the chain that
changes these bytes.** The Svelte compiler passes them through; the
`prettier-plugin-svelte` oracle passes them through; rsvelte-fmt, which delegates to
oxc in process, rewrites them.

That is why this is not filed as a *deliberate divergence between two defensible
engines*. It is a rewrite of text nothing else rewrites, and the entries stay
workable rather than pinned.

## Reach

Measured over all 524 sources in `compatibility/fmt-known-failures.json`, with live
positive controls (261 entries have a `<style>`/CSS body; 62 carry a 6-digit hex):

| symptom | entries | carrier |
|---|---|---|
| repeated combinator | 1 | `pattern/issues/3404-repeated-combinators.svelte` |
| invalid hex token | 1 | `primo/src/lib/builder/views/editor/Layout/BlockToolbar.svelte` |
| trailing comma before `;` | 1 | `musicat/src/lib/library/CassetteLoading.svelte` |

**3 of 524.** An earlier note in this campaign put the combinator count at 3 on its
own; that figure was never derived, and re-measuring gives 1.

## The rsvelte-side terminal, per symptom

An upstream attribution is the one classification whose consequence is that nobody
measures it again, so what would close each of these **here** is written down rather
than left implicit. None of it is scheduled; what is recorded is that no entry is
inert.

- **Symptom 1** — a parse failure currently voids the entire `<style>` block, and what
  rsvelte does with the block it has given up on **is an rsvelte defect**, independent of
  whether oxc ever accepts `>>`. The fallback does not pass the body through verbatim: the
  measured rule is that **the first leading whitespace character of each line is replaced by
  one indent unit and the rest of that line's indentation survives**, which is one rule
  covering both a tab-indented source (the carrier) and a space-indented one. So the carrier
  shows two divergences from one cause. Voiding only the unparseable **rule** would leave the
  carrier's other three rules formatted; this is an rsvelte-side scope change and does not
  need upstream.
- **Symptoms 2 and 3** — these are rewrites, so the rsvelte-side options are narrower:
  either oxc stops normalizing tokens it did not parse as the construct it is
  normalizing, or rsvelte-fmt declines to accept a CSS result that does not round-trip
  its input. The second is a real check rsvelte could add (format, re-parse, compare)
  and is the fallback if oxc declines the first.

## Expiry

Re-measure whenever the pinned oxc rev or the `oxfmt` version moves. The check is the
three repros above, each with its positive control:

- symptom 1 is spent when `.card >> .a` returns `EXIT=0` **and** a rewritten file;
- symptoms 2 and 3 are spent when `#E7E7E7l`, `#ABCDE` and the trailing comma survive
  a format unchanged.

A spent symptom retires its ratchet entry; it does not get re-attributed to a
successor report.
