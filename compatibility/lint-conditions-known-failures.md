# lint-conditions-known-failures.json

`scripts/compat-corpus/lint-conditions.mjs` compares whether each rule can run
under Svelte 5. `lint-conditions-known-failures.json` has 0 entries. rsvelte and
eslint-plugin-svelte agree on the runes-mode pair, the Svelte-version
eligibility, and the SvelteKit-gated set for every shared rule.

The gate derives upstream's answer from `meta.conditions`; it does not maintain
a copied oracle list. `shouldRun` treats condition objects as alternatives, so
the reduction first removes objects whose `svelteVersions` does not admit `5`
and then unions the runes values of the reachable objects. Unioning every
object would incorrectly make a Svelte-3/4 alternative affect Svelte-5
behaviour.

## Svelte-version eligibility

Two upstream rules have no condition object reachable on Svelte 5:

- `svelte/experimental-require-strict-events`
- `svelte/require-event-dispatcher-types`

They are listed in `crates/rsvelte_lint/src/svelte_version.rs`. Both the native
and script rule engines consult that model, and the source-scan runner uses it
before invoking either legacy rule. Explicitly configuring either rule
therefore remains silent, matching upstream; default severity is no longer the
only protection against an over-report. The condition gate independently
derives the unreachable upstream set and diffs it against this Rust list with
`svelte-3-4-only-{missing,extra,unknown}` keys.

The finding-level lint universe includes both rules. That makes the ordinary
parity gates exercise the skip instead of hiding the difference with a manual
exclusion.

## Body-level runes checks

Upstream's `svelte/no-at-const-tags` declares no runes condition and performs
`runes === true` gating inside the rule body. rsvelte now mirrors that layout:
its `RuleConditions` has no runes restriction and `check_root` performs the
mode check. This avoids representing one effective condition twice and makes
the metadata comparison truthful without changing findings or fixes.

The apparent upstream third value, `'undetermined'`, is not reachable for a
file parsed by svelte-eslint-parser: an unspecified component mode is resolved
through `hasRunesSymbol` to a boolean. If that parser behaviour changes, a
body-level gate may need its own explicit comparison; the present gate cannot
discover arbitrary checks inside `create()`.

## SvelteKit and remaining blind spots

`svelteKitVersions` and `svelteKitFileTypes` are represented by
`crates/rsvelte_lint/src/sveltekit.rs`. The gate derives the upstream gated set
and compares both directions against `SVELTEKIT_ONLY`.

`svelteFileTypes` remains uncompared. `svelteVersions` is reduced to whether a
rule is reachable on Svelte 5, so narrower distinctions within Svelte 5 are not
represented. The rsvelte metadata side is also a guarded regex over Rust
source. See gate 34 in `compatibility/gate-coverage.md` for the evidence and
limits.
