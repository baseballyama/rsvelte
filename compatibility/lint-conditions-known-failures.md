# lint-conditions-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-conditions.mjs` compares, per rule id, **whether the
rule runs at all** in each Svelte mode: upstream's `meta.conditions` reduced to
the pair (runs-in-runes, runs-in-legacy), against rsvelte's declared
`RuleConditions { runes_only, legacy_only }`.

A wrong flag here is invisible to every finding-level gate unless the corpus
happens to contain a file in the mode the flag wrongly excludes — and for a rule
whose patterns are all one mode, that never happens. Three wrong flags were found
by hand before this gate existed (`no-inspect`, `prefer-derived-over-derived-by`,
`experimental-require-slot-types`), each of which made rsvelte run a rule ESLint
would have skipped. **`lint-conditions-known-failures.json` holds 3 entries and is
expected to stay at the ones below.**

Key format: `gate|<id>|<both sides spelled out>`, or `svelte-3-4-only|<id>`.

## How upstream's side is derived, and the trap in deriving it

`shouldRun` is an OR over condition objects, and an object with no `runes` key
constrains nothing on that axis. The reduction must therefore union **only the
objects reachable at Svelte 5** — rsvelte is a Svelte 5 compiler, and upstream's
own `getSvelteVersion()` reads the `svelte` package the *plugin* resolves, which
is 5 here (measured: see `compatibility/gate-coverage.md` 32c).

Unioning across all objects instead reports six correctly-gated rules as wrong,
because rules like `no-extra-reactive-curlies` carry
`[{svelteVersions:['3/4']}, {runes:[false,'undetermined'], svelteVersions:['5']}]`
and the first object — unreachable here — contributes "runs in runes mode". The
first draft of this comparison did exactly that and produced a 10-row diff of
which 6 rows were artefacts of the reduction. A comparison that cannot tell a
real mismatch from its own arithmetic is worse than no comparison, so the
`svelteVersions` filter is the load-bearing line of `upstreamGate`.

## `svelte-3-4-only` — 2 entries

`svelte/experimental-require-strict-events` and
`svelte/require-event-dispatcher-types` carry exactly `[{svelteVersions:['3/4']}]`,
so **no** condition object is satisfiable at Svelte 5 and upstream never runs
them here, in any runes mode. rsvelte's `RuleConditions` has no axis for the
Svelte version — it is a Svelte 5 compiler, so the axis is a constant — and
therefore cannot express "never".

Both are already handled, in the only two places it matters:

- They default to `off` (`compatibility/lint-preset-known-failures.md` records
  `require-event-dispatcher-types` and the reasoning), so a user on defaults sees
  nothing from either.
- `scripts/compat-corpus/lint-universe.mjs` excludes both from the parity
  universe, with this exact reason cited, so the finding-level gates never force
  them to `"warn"` and never compare them.

They are listed here rather than silently skipped because those two mitigations
are the *only* thing standing between the current state and a user-visible
over-report: enabling either rule explicitly makes rsvelte report where ESLint is
silent. If the exclusion is ever lifted, this entry is what fails.

## `gate|svelte/no-at-const-tags` — 1 entry, and it is a genuine behavioural difference

Upstream declares `conditions: [{svelteVersions:['5']}]` — no runes axis at all —
but enforces the gate in the rule **body** instead
(`lib/rules/no-at-const-tags.js`):

```js
const runes = getSvelteContext(context)?.runes;
// Only report and fix in runes mode, since preserving reactivity requires
// `$derived(...)`, which is unavailable outside runes mode.
if (runes !== true) return {};
```

so the comparison reports a mismatch that is, on the runes/legacy axis, the
metadata being in a different place rather than saying a different thing.
rsvelte's `runes_only: true` reproduces the intent, and the entry exists only
because this gate reads `meta.conditions` and upstream's answer is not there.

**The two spellings look like they disagree about `'undetermined'`, and they do
not, because that value is unreachable.** `runes !== true` would exclude it while
`conditions: [{runes: [true, 'undetermined']}]` (no-inspect, no-unused-props,
prefer-derived-over-derived-by) admits it — but no file either linter parses ever
carries it:

- `svelte-eslint-parser/lib/parser/index.js:116` publishes a component's context
  as `runes: svelteParseContext.runes ?? hasRunesSymbol(resultScript.ast)`, and
  `hasRunesSymbol` returns a **boolean** (`svelte-parse-context.js:65`). So
  `isRunesAsParseContext` returning `undefined` — no compiler option, no
  `<svelte:options runes>` — resolves to a definite `true`/`false` here.
- `resolveSvelteParseContextForSvelteScript` gives a `.svelte.[jt]s` a definite
  `svelteVersion.gte(5)`.
- The plugin's `runes: svelteParseContext?.runes ?? 'undetermined'`
  (`utils/svelte-context.js:253`) fires only when `svelteParseContext` is absent
  altogether, i.e. the file was parsed by some parser other than
  svelte-eslint-parser.

So rsvelte's boolean pair is sufficient, and a third state would be
representation without a referent. The input that looks undetermined — no rune
identifier anywhere, no options attribute — is `false`, and both sides skip;
`compatibility/lint-adversarial/runes-mode/03-no-rune-symbol-anywhere.svelte` is
that input and both sides agree on it.

**This entry therefore has no behavioural consequence**, which is a stronger
claim than the usual "accepted" and worth re-testing rather than inheriting: it
holds only while `hasRunesSymbol` returns a boolean. If a future
svelte-eslint-parser lets `'undetermined'` reach a rule, the two spellings part
company and this entry becomes a real divergence.

## The SvelteKit axis is compared too, as a separate key class

`meta.conditions` also carries `svelteKitVersions` and `svelteKitFileTypes`, and
rsvelte enforces that half in `crates/rsvelte_lint/src/sveltekit.rs` against a
hard-coded `SVELTEKIT_ONLY` list rather than through `RuleConditions`. Comparing
it on the runes axis would report all five as ungated, so the gate derives
upstream's kit-gated set separately and diffs the two lists
(`kit-gate-missing` / `kit-gate-extra`). They currently agree, 5 for 5, which is
why no key of either class appears in the ratchet.

Deriving rather than transcribing matters here for the same reason as above:
`svelteKitFileType` is only computed once a version is known, so a rule
conditioned solely on `svelteKitFileTypes` still requires SvelteKit and belongs
in the set. Both keys count toward "kit-gated", and a rule is only counted when
**every** reachable condition object carries one — a rule with an alternative
ungated object would run without SvelteKit.

## What this gate cannot see

`svelteFileTypes` is the one condition axis still uncompared, and the fifth,
`svelteVersions`, is compared only as the reachability filter — a rule that
became Svelte-5-only would move a `svelte-3-4-only` key, but a rule whose
version set narrowed *within* 5 would not. Neither axis has ever carried a value
that separates rsvelte's behaviour from upstream's, which is a statement about
the current plugin and not a guarantee. See `compatibility/gate-coverage.md`
gate 34.
