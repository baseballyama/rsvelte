# lint-preset-known-failures.json — why each recorded difference is accepted

`scripts/compat-corpus/lint-preset.mjs` compares **what a user gets when they
write no configuration at all**: the default severity (`off` / `warn` / `error`)
that `eslint-plugin-svelte`'s `flat/recommended` and `rsvelte-lint`'s
`recommended` preset give each of the 84 rule ids the two share.

Every other lint gate this project runs sets all 74 shared rules to `"warn"`
explicitly on both sides. That is the right key for asking "does this rule
behave the same", and it makes the default configuration a **constant those
gates cannot vary** — so a rule that runs out of the box on one side and not the
other, or at a different severity, is invisible to all of them no matter how
large the corpus grows.

Unlike the other ratchets here, `lint-preset-known-failures.json` (29 entries) is
**not a burndown backlog and is not expected to reach zero.** rsvelte curates its `recommended`
preset deliberately differently (below). What the gate buys is that the curation
is *recorded*: a rule's default cannot change, and a rule cannot be ported or
added, without the decision appearing here as a failing two-sided ratchet.

Key format: `<upstream severity>-><rsvelte severity>|<rule id>`, plus two
membership classes `not-ported|<id>` and `rsvelte-only|<id>`.

## Severity is in the key, and putting it there is what found the largest class

The first version of this gate keyed on membership alone — `default-on-here` /
`default-off-here` — and reported **29** differences. Adding severity to the key
took it to **50**: twenty-one rules that both sides run by default, which
upstream defaults to `error` and rsvelte defaulted to `warn`.

That is not cosmetic. `crates/rsvelte_lint/src/main.rs` exits non-zero when any
finding has `DiagnosticSeverity::Error`, exactly as ESLint does — so on those 21
rules `rsvelte-lint` exited **0** on code where `eslint` with `flat/recommended`
exits **1**, and a CI pipeline that swapped one for the other went green on the
same source. A membership-only key reported all 21 as agreeing, which is the
`warning-missing:<code>` lesson again: a ratchet entry suppresses everything its
key cannot tell apart, so put the class in the key.

**All 21 were fixed rather than listed**, because the evidence says they were an
incomplete transcription and not a curation choice. rsvelte and upstream agreed
on the severity of every rule where rsvelte's value was not the blanket `warn` —
all 11 of rsvelte's `error` rules are `error` upstream, and both of upstream's
two `warn` rules are `warn` here, 13 for 13 — while the divergence ran one way in
all 21 cases, always rsvelte weakening. A deliberate policy does not have that
shape. `apps/npm/lint/README.md`'s "a handful … default to `error`" describes the
old set; the alignment makes it 32.

## `error->off` — the two that could have been bugs

These are the direction that matters most, because a rule upstream defaults to
`error` and rsvelte disables entirely makes rsvelte report **less** than the tool
it replaces, and exit 0 where it would exit 1. Both were checked individually
rather than accepted as a class.

### `svelte/no-unused-props`

Kept `off` because rsvelte's **native** path over-reports on shapes upstream's
own fixtures cover. `crates/rsvelte_lint/tests/eslint_plugin_oracle.rs` skips 13
`no-unused-props/invalid/*` fixtures for want of a type checker — that direction
is only an under-report and would be harmless as a default — but it also skips
`no-unused-props/valid/ignore-property-patterns-custom` and
`valid/custom-config-combination`, which are recorded there as "valid fixtures
that would produce false positives without custom options". A default-on rule
that reports on code upstream accepts is the failure mode users cannot ignore,
so the conservative default stands until the type-aware path
(`no_unused_props::diagnostics_typed`, covered end-to-end against a real `tsgo`
by `rsvelte_lint_types`'s `type_aware_e2e` tests) is what the CLI uses.

**This entry should disappear** when that happens. The ratchet is two-sided, so
it will fail rather than rot.

### `svelte/require-event-dispatcher-types`

`createEventDispatcher` is a Svelte 3/4 API, and rsvelte is a Svelte 5 compiler
port; the rule is dead weight on the code rsvelte is built for. Separately, its
type-argument detection is a source scan whose documented divergence is that it
cannot tell a `<` opening type arguments from a `<` comparison
(`crates/rsvelte_lint/src/rules/require_event_dispatcher_types.rs`, module
docs). Neither reason alone would be decisive; together they are enough to keep
a rule about a removed API off by default rather than shipping its scan
ambiguity to every user.

Note this is **not** the reason upstream's own condition machinery would give:
the rule carries no `svelteVersions` condition upstream, so ESLint runs it on
Svelte 5 code too. The divergence is rsvelte's choice, which is why it is
recorded here rather than modelled in `RuleConditions`.

## `off->warn` — one reason, 22 entries

rsvelte's `recommended` is defined as *"every rule runs at its declared default
severity"* (`LintConfig::recommended`, `crates/rsvelte_lint/src/config.rs`), with
formatting rules — owned by the sibling `@rsvelte/fmt` — and opinionated opt-in
rules such as `button-has-type`, `no-restricted-html-elements` and
`sort-attributes` declared `off`. Upstream's `flat/recommended` is a
hand-maintained list instead. Two different curation *mechanisms* cannot be
expected to agree entry by entry, and this row set is the measured size of that
disagreement rather than 22 independent decisions. It is documented for users in
[`apps/npm/lint/README.md`](../apps/npm/lint/README.md#rule-coverage).

Note the severity these land on: `warn`, never `error`. A rule rsvelte runs and
upstream does not still cannot change the exit code, so this class costs a
switching user extra output and never a broken build. That asymmetry is why it
is acceptable as a class while `error->off` above needed rules checked one by
one.

Listing them individually rather than as one aggregate key is deliberate. Under
a single `preset-differs` key, flipping any one of these 22 — or porting a 23rd
rule straight to `warn` — would reproduce an already-listed key and pass.

`svelte/no-goto-without-base` and `svelte/no-navigation-without-base` are in
this set and are worth reading twice: they are two of the five rules
`crates/rsvelte_lint/src/sveltekit.rs` disables outside a SvelteKit project, so
being default-on costs a non-SvelteKit user nothing. `svelte/prefer-const` and
`svelte/no-unused-class-name` are the two with the widest reach, and both are
compared finding-for-finding by `lint-adversarial.mjs` and `lint-verify.mjs`.

## `not-ported` — 2 entries

- `svelte/system` is upstream's internal rule that implements comment
  directives (`<!-- eslint-disable-next-line -->` and friends). rsvelte
  implements the same behaviour in `crates/rsvelte_lint/src/suppression.rs`,
  which is not a rule and so has no id to compare. Suppression parity is
  covered by the finding-level gates, where a mis-parsed directive shows up as
  a missing or extra finding.
- `svelte/@typescript-eslint/no-unnecessary-condition` is upstream's Svelte-aware
  wrapper around a `typescript-eslint` rule and needs a type checker. rsvelte's
  type-aware backend lives in the out-of-workspace `rsvelte_lint_types` crate;
  the wrapper has no native counterpart.

## `rsvelte-only` — 3 entries

`svelte/no-undef`, `svelte/no-unused-vars` and `svelte/no-companion-module-shadow`
have no upstream counterpart. The first two are Svelte-aware ports of ESLint
**core** rules, which `eslint-plugin-svelte` deliberately does not ship (users
get them from ESLint itself, where the plugin's parser feeds them); rsvelte-lint
is a single binary with no ESLint underneath it, so it must carry them or leave
the checks unavailable. `no-companion-module-shadow` is rsvelte-only outright.

None of the three can produce a finding-level divergence in the other gates:
`scripts/compat-corpus/lint-universe.mjs` intersects the two rule lists, so a
rule only one side has is never enabled during a comparison. That is precisely
why they need a key here — they are, by construction, invisible everywhere else.

## What this gate still cannot see

It reads `--list-rules`, which prints `RuleMeta::default_severity` — not what a
lint run actually enables, which is that filtered by `enabled_script_rules`
(SvelteKit availability, `RuleConditions` mode gating). And it never writes a
config file, so `extends` layering, `files`/`ignores` globs and per-rule options
are all off this path. Both limits are recorded as `compatibility/gate-coverage.md`
blind spots 33b and 33c.
