# prettier-plugin-svelte lets a text run containing an inline element exceed `printWidth`, and re-formatting its own output is not a fixed point

`prettier-plugin-svelte` 4.1.1 on `prettier` 3.9.6, `printWidth: 80`,
`tabWidth: 2`, `useTabs: false`. Reproduces through `oxfmt` 0.64.0 with
`svelte: true` as well, which is where it was found — that path uses this plugin
for Svelte structure.

## 1. `printWidth` is exceeded whenever a text run holds an inline element

One line of markup, no `<script>`, no wrapper:

```svelte
<b>x</b> word0 word1 word2 word3 word4 word5 word6 word7 word8 word9 word0 word1 word2 word3 word4 word5 word6 word7 word8 word9 word0 word1 word2 word3 word4 word5 word6 word7 word8 word9 word0 word1 word2 word3 word4 word5 word6 word7 word8 word9
```

`parser: "svelte"` (widths in the left column):

```
 86 | <b>x</b> word0 word1 word2 word3 word4 word5 word6 word7 word8 word9 word0 word1 word2
 83 | word3 word4 word5 word6 word7 word8 word9 word0 word1 word2 word3 word4 word5 word6
 77 | word7 word8 word9 word0 word1 word2 word3 word4 word5 word6 word7 word8 word9
```

Prettier's own `parser: "html"` on the identical bytes and the identical options
never crosses 80:

```
 80 | <b>x</b> word0 word1 word2 word3 word4 word5 word6 word7 word8 word9 word0 word1
 77 | word2 word3 word4 word5 word6 word7 word8 word9 word0 word1 word2 word3 word4
 77 | word5 word6 word7 word8 word9 word0 word1 word2 word3 word4 word5 word6 word7
 11 | word8 word9
```

So the fill algorithm is not the cause; the widths the Svelte printer hands it
are.

**The overflow is local to the element.** Moving the same `<b>x</b>` through a
40-word run, and printing each output line's width:

| where the element sits | output line widths |
|---|---|
| absent | 77, 77, 77, 5 |
| first | **86, 83**, 77 |
| middle | 77, **86, 83**, 77 |
| last | 77, 77, 77, 14 |

The line carrying the element overflows and so does the one after it; the run
then recovers. With the element on the final (short) line nothing overflows,
which is why this is easy to miss.

The undercount is not simply the element's markup: at one-character words the
first line lands at 82 for `<b>x</b>` (8 printed columns), `<strong>x</strong>`
(18), `<b class="a b c">x</b>` (22), `<i>x</i><i>y</i>` (16) and `<br />` (6)
alike, while plain text of any length stays at or under 80. It is also not a
constant, since the same `<b>x</b>` overshoots by 2 at one-character words and
by 6 at five-character words.

## 2. Formatting the plugin's own output changes it — and breaks `printWidth`

173 bytes:

```svelte
<div>
<b>2.</b> The <b>Score</b> column can be filtered by a <b>number range</b> (two a hyphen). When the look range (including the hyphen) and will always fail.<br>
</div>
```

pass 1 — every line within 80:

```
  5 | <div>
 76 |   <b>2.</b> The <b>Score</b> column can be filtered by a <b>number range</b>
 76 |   (two a hyphen). When the look range (including the hyphen) and will always
 13 |   fail.<br />
  6 | </div>
```

pass 2, formatting that output again — 85 columns, and the `<br />` is split
across a line boundary:

```
  5 | <div>
 76 |   <b>2.</b> The <b>Score</b> column can be filtered by a <b>number range</b>
 85 |   (two a hyphen). When the look range (including the hyphen) and will always fail.<br
  4 |   />
  6 | </div>
```

pass 3 equals pass 2, so it is a single non-idempotent step rather than an
oscillation.

## What is load-bearing

Against the real-world source this was reduced from, with each ingredient
removed in turn (`idem` = pass 1 equals pass 2, `over80` = lines wider than 80):

| input | idem | over80 pass 1 | over80 pass 2 |
|---|---|---|---|
| two nested `{#if}` | **no** | 0 | 5 |
| one `{#if}` | **no** | 0 | 4 |
| a `<div>` wrapper instead | **no** | 0 | 4 |
| no wrapper, bare prose | yes | 0 | 0 |
| no trailing `<br>` | yes | **5** | 5 |
| no `<b>` in the prose | yes | 0 | 0 |

It needs an indented wrapper (a block or a plain element — it is not
block-specific) and an inline element in the prose. The trailing `<br>` decides
only *which* symptom appears: with it, pass 1 is clean and pass 2 overflows;
without it, pass 1 already overflows and is stable. Both are the same
mis-measurement in section 1 — `<br>` is rewritten to `<br />` on pass 1, which
changes the run's length by two columns and moves the overflow from pass 1 into
pass 2.

## Why it matters downstream

rsvelte's formatter is required to reproduce this plugin's output byte for byte
(through `oxfmt --svelte`), so the over-width lines are not themselves a
divergence for us. The non-idempotency is: a formatter with no fixed point on a
given input cannot be matched by any implementation that has one.

Measured rather than assumed — 8 ids in the corpus fmt gate have a
non-idempotent oracle, and **2 of them are this defect**
(`powertable/app/src/routes/examples/+layout.svelte`, which the reduction above
came from, and `svelte-confetti/src/routes/+page.svelte`). Both are the only two
whose over-width line count *grows* between the passes (20 → 27 and 35 → 43); on
the other six it is unchanged, and their first divergence is in embedded JS
(a function signature), in CSS/SCSS (`grid-template-columns`, `grid-template-rows`,
a `//` comment inside a value list) or in an attribute list. Those six are
separate defects and are not reduced here.
