# Warning-parity known failures

Companion to `known-failures.md`, for the **warning** half of the corpus gate.

`scripts/compat-corpus/compile.mjs` records every compiler warning as
`(code, line, column)` in `warnings.json` beside the output; `verify.mjs`
compares them and ratchets two failure modes independently. Both ratchets are
shrink-only: an entry not listed here that diverges fails CI.

Regenerate after a change that moves warnings:

```
node scripts/compat-corpus/verify.mjs --no-fmt --update-warning-baseline
```

`--update-warning-baseline` touches **only** these files, never the output
ratchets — warning comparison needs no oxfmt normalization, so it is valid under
`--no-fmt`, which the output comparison is not.

## Why this gate exists

It did not exist until #2281, and its absence was measured, not assumed. The
corpus compiled every entry with both compilers and then **discarded
`result.warnings`**, so a warning divergence scored `MATCH` no matter how large
the corpus grew.

The proof was a corpus entry, not a constructed one:
`layerchart/docs/src/routes/+layout.svelte` carries a `// svelte-ignore
state_referenced_locally` before an object-literal property. rsvelte did not
honour it (#2256) and emitted a warning upstream does not — and the gate
reported that entry as passing. Adding this comparison turns the entire existing
corpus into a warning-parity gate at essentially zero marginal cost, since both
compilers already run on every entry.

## Why the three per-target files are currently identical

`warning-known-failures.client.json`, `.server.json` and `.client-dev.json` hold
the same 71 entries; the three position files hold the same 627. That is not a
bug in the partitioning — almost every warning is produced in Phase 1/2 (parse
and analyze), before the target is consulted, so a divergence shows up on all
three targets at once. Only target-specific codes (`node_invalid_placement_ssr`
and friends) can ever differ, and none of those diverge today.

The split is kept anyway: it costs nothing in code, matches the output ratchets,
and stays sensitive to an entry that starts diverging on a second target while
already listed for the first. Expect all six files to move together in a
burn-down PR.

## Warning codes (`warning-known-failures.<target>.json`, 71 entries each)

The multiset of warning **codes** differs: rsvelte warns where upstream does
not, or stays silent where upstream warns. This is a semantic bug — a user sees
noise they cannot suppress, or misses a diagnostic they should have seen.

Treat every entry here as a real defect awaiting a root cause. Clusters
identified so far:

- **`attribute_quoted` over-warning on namespaced SVG child components** —
  rsvelte emits the warning for attributes the official compiler does not
  consider quoted-redundant.
- **`component_name_lowercase` over-warning** — rsvelte flags lowercase names
  that upstream accepts (seen across `svelte-maplibre` example routes).
- **`svelte_self_deprecated` / `reactive_declaration_module_script_dependency`
  over-warning** — concentrated in the Svelte migrate fixtures, which are out of
  scope for codegen but still compile here.
- **`perf_avoid_nested_class` over-warning in a standalone module** (#2348) —
  the one entry the `runed` / `svelte-toolbelt` enrolment added
  (`on-click-outside.test.svelte.ts`). `analyze_module` passes `ast_type: null`,
  not `'module'`, so upstream's `allowed_depth` is 1 for a standalone
  `.svelte.(js|ts)` and only depth ≥ 2 warns; rsvelte uses 0 and warns one level
  early. A component's `<script module>` really does use 0, so the two cases
  have to stay distinguishable.

## Warning positions (`warning-position-known-failures.<target>.json`, 627 entries each)

The codes agree but a `(line, column)` does not. Almost all of these are one
systemic cause: **rsvelte emits the warning with no span at all**, so `start` is
`undefined` where upstream reports a real position. An editor or CLI that places
a squiggle from `warning.start` gets nothing.

Split from the code ratchet on purpose: this backlog is far larger, and folded
together it would hide every semantic regression above. Codes seen with missing
positions include `event_directive_deprecated`,
`element_invalid_self_closing_tag`, `a11y_role_supports_aria_props`,
`export_let_unused`, `non_reactive_update` and `perf_avoid_nested_class`
(#2349 — the one entry the `runed` / `svelte-toolbelt` enrolment added,
`is-document-visible.test.svelte.ts`).

Burning this down is mostly mechanical — attach the span already available at
each emission site — so the count should fall in large steps rather than one
entry at a time.
