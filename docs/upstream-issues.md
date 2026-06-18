# Upstream issues found during the lint-corpus burn-down

While driving the `rsvelte-lint` ↔ `eslint-plugin-svelte` output-parity corpus
to zero divergences, a small number of mismatches turned out to be
inconsistencies in **upstream** `eslint-plugin-svelte` / its pinned tooling,
not rsvelte defects. They are recorded here so they can be reported to
`sveltejs/eslint-plugin-svelte`.

Versions at time of writing: `eslint-plugin-svelte@3.19.0`,
`svelte-eslint-parser@1.8.0`, `svelte@5.56.3`, `globals@16.5`, `eslint@9`.

---

## U1 — `no-top-level-browser-globals`: bundled fixtures disagree with the runtime `globals` version on `localStorage` / `navigator` / `sessionStorage`

**Summary.** The rule computes its "browser globals" set as
`globals.browser ∖ globals.node` (`getBrowserGlobals()`). In `globals@16.5`,
`localStorage`, `navigator`, and `sessionStorage` are present in **`globals.node`**
(Node exposes them on recent versions), so `getBrowserGlobals()` **excludes**
them and the rule does **not** flag a bare top-level `localStorage.getItem(…)`.

However, the plugin's own fixture suite still asserts the opposite. For
example `tests/fixtures/rules/no-top-level-browser-globals/invalid/test03`
(and the `no-top-level-browser-globals.md` doc example) expect:

```
Unexpected top-level browser global variable "localStorage".
```

So the rule's **fixtures** were authored against an older `globals` where these
names were browser-only, while the rule's **runtime behaviour** (against the
currently-pinned `globals@16.5`) no longer flags them. The fixtures and the
live behaviour are internally inconsistent.

**Impact.** Any consumer pinning a `globals` version where `localStorage` is
node-available silently loses these reports, despite the documentation and the
test fixtures implying they are still flagged.

**Suggested fix (upstream).** Either (a) keep an explicit allow/deny list of
the "browser-only" names the rule cares about (so it is independent of the
`globals` package's node/browser partitioning drift), or (b) regenerate the
fixtures/expected output against the pinned `globals` so the suite matches the
runtime behaviour, and note the version dependency in the rule docs.

**rsvelte stance.** rsvelte keeps flagging `localStorage` / `navigator` /
`sessionStorage` — it matches the plugin's authoritative *fixtures*, which the
exact-fixture oracle test (`crates/rsvelte_lint/tests/eslint_plugin_oracle.rs`)
enforces at 100%. In the *corpus* comparison (run against the live
`globals@16.5` oracle) the two resulting reports are a documented
globals-version artifact, filtered via `VERSION_ARTIFACTS` in
`scripts/compat-corpus/lint-verify.mjs`. See
[lint-corpus-harness-findings.md](lint-corpus-harness-findings.md) H4.

<!-- Add further upstream issues below as they are found. -->
