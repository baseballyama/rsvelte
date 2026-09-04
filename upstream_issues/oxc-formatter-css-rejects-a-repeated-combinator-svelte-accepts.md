# `oxc_formatter_css` rejects `>>`, which the Svelte compiler accepts and scopes

- **Upstream**: [oxc-project/oxc](https://github.com/oxc-project/oxc), `oxc_formatter_css`
- **Observed at**: rev `0389c4010ef8298728f3e47fff8e2a9106d10045` (the rev this repo pins), reproduced with the published `oxfmt` 0.64.0
- **rsvelte issue**: —
- **Severity**: the `<style>` block is passed through unformatted; no output is corrupted

## Repro

No rsvelte code is involved — standalone `oxfmt` on three `.css` files that differ
only in the combinator:

```css
.card >> .a { color : red; }      /* EXIT=2, file byte-unchanged */
.card > .a  { color : red; }      /* EXIT=0, rewritten to `color: red;`  <- positive control */
.card ?? .a { color : red; }      /* EXIT=2, DIFFERENT message           <- negative control */
```

```
>>   x Syntax error: simple selector is expected        .card >> .a
                                                               ^ col 8
??   x Syntax error: expect token `{`, but found `?`    .card ?? .a
                                                              ^ col 7
```

The positive control is what makes the two `EXIT=2`s readable: `>` on the same
input is accepted *and reformatted*, so the failure is the combinator and not the
file, the config, or the loose `color :` spacing.

## Why this is not invalid input

`>>` is not in any shipped CSS selector grammar — it appeared in a Selectors
Level 4 draft as the descendant combinator and was withdrawn — so a strict CSS
parser rejecting it is defensible on its own terms. **That is not the language
this formatter has to accept.** The official Svelte compiler
(`submodules/svelte/packages/svelte/src/compiler/index.js`, VERSION 5.56.10)
accepts `>>`, emits it, and scopes *both* sides of it:

```
ACCEPT  .card >> .a   ->  .card.svelte-lnb7it >> .a:where(.svelte-lnb7it) { color: red; }
ACCEPT  .card > .a    ->  .card.svelte-11pfxx > .a:where(.svelte-11pfxx) { color: red; }
REJECT  .card ?? .a   ->  css_expected_identifier
```

So `>>` is inside the input language of the Svelte toolchain and `??` is outside
it. A Svelte formatter is fed whatever the Svelte compiler accepts, which means
this cannot be routed to `fmt-oracle-excluded.json` as invalid input — the
oracle's own path (PostCSS) formats the block, and only rsvelte's does not.

## Effect in rsvelte

One rejected selector disables formatting for the **whole** `<style>` block, not
just the offending rule. On the one carrier, `.card > .a` sits in the same block
and is left unformatted alongside `.card >> .a`.

Two symptoms with one cause, which is why they should not be filed as two entries:

```
source    \t.card >> .a {   \t\tcolor: green;
oracle      .card>>.a {         color: green;      (4-space body, no space around >>)
rsvelte     .card >> .a {     \tcolor: green;      (source spacing and inner tab survive)
```

rsvelte re-indents the block's **outer** level (the leading `\t` becomes `  `) and
then passes the CSS body through byte-for-byte, so the interior tabs and the
`color : green` spacing survive. It is a partial pass-through, not a verbatim one.

Two cells differing only in the combinator isolate it:

| cell | rsvelte vs oracle |
|---|---|
| `.card > .a` with tabs and `color : green` | **EQ** — rsvelte normalizes tabs to spaces and `color : ` to `color: ` |
| `.card >> .a`, otherwise identical | **DIFF** — neither normalization happens |

## Reach

**1** entry of the 524 in `compatibility/fmt-known-failures.json`
(`pattern/issues/3404-repeated-combinators.svelte`), measured over all 524 sources
with a positive control (36 of the 524 carry a plain `>` in a `<style>` block).
A `>>` in a standalone `.css`/`.scss` corpus entry: 0.

An earlier note in this campaign put the carrier count at 3. That figure was never
derived; re-measured here it is 1.

## The rsvelte-side terminal

This is filed upstream, and an upstream attribution is the one classification whose
consequence is that nobody measures it again — so the two things that would close it
here are written down rather than left implicit:

1. **If oxc accepts `>>`**, this closes with no rsvelte change; the entry retires on
   the next `oxfmt` / oxc bump.
2. **If oxc declines it** (defensible — see above), the rsvelte-side fix is not a
   fallback but a *scope* change: a parse failure currently voids the entire
   `<style>` block, and voiding only the unparseable **rule** would leave the other
   three rules in this carrier formatted. That is an rsvelte change and does not
   need upstream.

Neither is scheduled. What is recorded is that the entry is not inert.

## Expiry

Re-measure when `oxc_formatter_css` changes its selector grammar, and specifically
whenever the pinned oxc rev or `oxfmt` version moves. The check is the three-cell
repro above: if `.card >> .a` returns `EXIT=0` and a rewritten file, this report is
spent and the ratchet entry should be retired rather than re-attributed.
