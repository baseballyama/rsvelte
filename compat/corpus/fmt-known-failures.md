# fmt-known-failures.json — why entries are accepted

The formatter-parity corpus formats every `.svelte` component with both
`rsvelte-fmt` and the `oxfmt(svelte:true)` oracle (prettier-plugin-svelte for the
Svelte structure + oxc for embedded JS/CSS — rsvelte-fmt's exact layering) and
requires **byte-identical** output. The ratchet may only shrink.

**Current baseline: 74 entries**, concentrated in real-world corpus repos
(layercake, svelte-ux, layerchart, svelte-form-builder, cmsaasstarter,
svelte-maplibre, and a long tail). Oracle-bug / invalid-input / migrate cases are
NOT here — those are permanently excluded in `fmt-oracle-excluded.json` (see
`fmt-oracle-excluded.md`). Every entry here is a real prettier HTML-layout /
embedded-JS reflow gap that needs the faithful prettier `printChildren` / `fill` /
`group` Doc-IR layout port, not a point patch. The two dominant clusters have
**opposing** failure modes, so a blanket width or break-eagerness change trades one
for the other (verified net-negative — see below).

## Cluster A — oracle wraps, rsvelte stays too compact (under-break, ~49)

The oracle breaks a long open tag / text run / embedded expression onto more lines
than rsvelte:

- Long open-tag → break before child (`<pre><code class="language-bash">` + text).
- Prose text `fill` — a long mixed text run word-wrapped at print width by the
  oracle, kept on one long line by rsvelte.
- Attribute string-value wrapping (long `message="…"` / `class="… {ternary} …"`).
- Close-tag placement after a wrapped child (`</div></a` vs `</div></a>`).

## Cluster B — rsvelte over-breaks (over-break, ~39)

The mirror image; two root causes:

- **Inline element kept on one line.** A text+`<a>`+text run overflowing 80 cols is
  kept whole by the oracle (breaking an inline `<a>` open tag would change
  whitespace-significant rendering); rsvelte breaks it into the ugly
  `<a …\n  >…</a\n> …` form.
- **Embedded `{expr}` width over-break.** An attribute-embedded expression is
  formatted at too narrow a width, so oxc breaks a call/ternary the oracle keeps
  compact. `format_attribute_value_expression`'s available-width accounting is the
  suspect. This subset is the most self-contained future fix (validate against the
  full corpus — A and B share the width machinery).

## Cluster C — embedded-JS paren / disambiguation differences (~7)

oxc's `NeedsParentheses` adds parens the oracle omits, because rsvelte formats the
embedded `{expr}` through a statement wrapper (`(expr);`):

- `object-paren` — `attr={{ … }[k]}` → `attr={({ … })[k]}` (leading object literal
  parenthesised to avoid block-parsing in statement position).
- `other-content` — a paren kept around an arrow body / assignment expression.
- `tsx-generic-comma` — `<T>(…) =>` emitted as `<T,>(…) =>`; `.svelte` scripts are
  TS not TSX, so the oracle drops the disambiguating comma (oxc-version-alignment).

Fixing C needs an `oxc_formatter` expression-position API (or an oxc bump);
string-surgery paren-stripping is forbidden by project rule.

## Cluster D — indent-only niches (~6)

Heterogeneous, each its own small root cause: method-chain continuation indent
inside `{expr}`; `{#if}`/text indent inside whitespace-sensitive `<pre>` (tab vs
2 spaces); SVG child / self-close depth.

## Proven net-negative (do not re-attempt without a different mechanism)

- **Global fill "break-after-overflow"** (dropping `pair_fits`) — fixed 4 prose
  cases but caused 48 new failures; oxfmt's fill is context-dependent and not
  hand-characterizable.
- **Const-initializer wrapper to drop Cluster-C `object-paren` parens** — fixed 4
  files but regressed ~50 (the wrapper's `+20` width compensation also inflates
  continuation-line budgets, collapsing multi-line objects the oracle breaks).
- **Directive-value arrow width tightening** and **`<pre>` body verbatim** — each
  net-zero / regression-prone.

## Cross-platform baseline rule (critical)

The committed baseline is the **Linux CI** failure set. Shrink it only from a Linux
`corpus-compat.yml` run (macOS `--update-baseline` drops loose-declaration-tag
entries Linux includes and breaks CI): read the Formatter-parity job log for the
"N known failures now PASS" count and per-id NOTICEs, then remove exactly the
confirmed-fixed ids.
