# warning-message-known-failures.\<target\>.json — why entries are accepted

`scripts/compat-corpus/verify.mjs` compares each corpus entry's compiler warnings
against the official compiler in three dimensions, as a cascade — each reached only
when the one above it already agrees:

| dimension | ratchet | what a failure means |
|---|---|---|
| code | `warning-known-failures.<target>.json` | rsvelte warns where upstream does not, or is silent where it warns |
| position | `warning-position-known-failures.<target>.json` | codes agree, `(line, column)` does not |
| **message** | **`warning-message-known-failures.<target>.json`** | **code and position both agree, the prose differs** |

The three are separate because they have different causes and different fixes. Folded
together, the much larger position backlog would hide every semantic regression.

> **Not to be confused with `validator-message-known-failures.json`.** That is a
> different gate over a different population: the 332 `packages/svelte/tests/validator`
> fixtures, checked by `crates/rsvelte_core/tests/validator.rs`. This file gates the
> ~14k-entry real-world corpus. The names are one word apart and the two are unrelated
> — an entry in one says nothing about the other, and their counts are not comparable
> because the populations have different warning mixes.

## Why the message dimension needs its own gate

Until this file existed, the corpus never recorded `message` at all —
`compile.mjs`'s `normalizeWarnings` projected each warning to `(code, line, column)`
and the text was gone before anything reached disk. So the message was not "compared
loosely": it was **absent from both sides of every comparison**, at any corpus size.

That is invisible by construction rather than by sampling, which is the same shape as
the missing warning oracle behind #2281. Widening the comparison in `verify.mjs`
alone would not have fixed it — it would have compared a field neither side carried
and scored every entry as a match.

The dimension is not redundant with the other two. Measured on the real compilers,
`<svg><text><a xlink:href=''>x</a></text></svg>`:

```
codes    MATCH
position MATCH
message  DIFFER
  official: a11y_invalid_attribute: '' is not a valid xlink:href attribute
  rsvelte:  a11y_invalid_attribute: '' is not a valid href attribute
```

Both existing ratchets score that entry green. The message names an attribute that is
not on the element. Negative control, `<a href="">x</a>`: all three MATCH.

## What this gate cannot see

Measured, not estimated. Reproduce with `node scripts/compat-corpus/collect.mjs &&
node scripts/compat-corpus/compile.mjs && node scripts/compat-corpus/verify.mjs --no-fmt`:

```
manifest entries                14131
entries emitting >=1 warning     1191   (8.4% of corpus)
entries reaching the message      592   <-- this gate's real denominator
warnings recorded               15282
distinct warning codes seen         74   (of 89 in VALID_WARNING_CODES)
```

- **The denominator is 592, not 14,131.** Only 8.4% of corpus entries emit any warning,
  and of those, **just under half never reach the message comparison at all**: 70 are
  consumed by the code dimension and 529 by the position dimension (70 + 529 + 592 =
  1191 exactly). The cascade stops at the first divergence, so an entry already listed
  in the code or position ratchet is invisible here. **This gate's reach is coupled to
  the position backlog rather than independent of it** — burning that down widens this
  one, and no one should read "1 divergence" as "1 divergence among 14,131 entries".
- **Entries either compiler rejects** are skipped (the `expErr`/`actErr` guard in
  `verify.mjs`) — error parity covers those separately.
- **15 of the 89 ignorable codes never fire on this corpus.** Only three of those are
  compile-time diagnostics at all: `a11y_incorrect_aria_attribute_type_idlist` and
  `options_deprecated_accessors` have real emission sites that no corpus entry reaches,
  and `a11y_incorrect_aria_attribute_type_id` is declared without one — upstream
  declares it without a call site too (`packages/svelte/src/compiler/warnings.js:251`),
  so that is parity, not a gap. The other twelve are runtime warnings whose only
  compiler-side mentions are `svelte-ignore` lookups (`await_reactivity_loss`,
  `binding_property_non_reactive`, `hydration_*`, `ownership_*`,
  `state_snapshot_uncloneable`) or codes declared for `svelte-ignore` with no site at
  all (`await_waterfall`, `options_removed_*`, `options_renamed_ssr_dom`). They cannot
  appear in `result.warnings`, so no gate over compiler output can watch them.
- **The docs link is stripped** (`https://svelte.dev/e/<code>`, matching
  `crates/rsvelte_core/tests/validator.rs:202`). Both compilers emit it identically, so
  stripping changes no verdict at the point in the cascade where messages are compared
  — codes already agree by then. It is stripped so a code-level defect cannot leak into
  this ratchet, and so the two gates share one definition of "message".

## Current baseline: `warning-message-known-failures.<target>.json`, 2 entries per target

Empty because the corpus says so, not because the gate was scoped until it was. The
first full run found **exactly one** message divergence in 14,131 entries, on all three
targets — `svelte/packages/svelte/tests/validator/samples/a11y-anchor-in-svg-is-valid`:

```
expected: a11y_invalid_attribute: '#' is not a valid xlink:href attribute
actual:   a11y_invalid_attribute: '#' is not a valid href attribute
```

That is #2413, fixed by #2451, which lands before this. Re-measured against a build
carrying that fix, the count is **0** with the denominator unchanged at 592 — so the
entry became a match rather than dropping out of comparison.

The first entry is
`svelte/packages/svelte/tests/migrate/samples/self-closing-elements/input.svelte`.
All four targets agree on the warning code and position, but rsvelte renders the
element name as `table` where upstream preserves the namespace form `f:table` in
the self-closing-tag warning. This is a message-only compiler parity defect, so it
belongs in this ratchet rather than in the code or position ones.

The second arrived with the wave-2 enrolment (#3130):
`open-webui/src/lib/components/common/Tags.svelte`. Upstream's
`a11y_role_has_required_aria_props` lists **every** missing attribute for the role
(`"aria-controls" and "aria-expanded"`); rsvelte lists only the first. The code and
the position agree, so this ratchet is the only one that can see it — and the
defect is in how the list is built, not in which attribute is detected, which makes
it one fix for every role with more than one required prop.

Every entry added later must carry a justification here naming the divergence and,
where known, the issue tracking it.
