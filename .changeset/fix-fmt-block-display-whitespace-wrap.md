---
"@rsvelte/fmt": patch
---

fix(fmt): oracle-match a wrapping empty/whitespace block-display element (#1721)

A block-display element with a whitespace-only (or truly empty) body whose open
tag wraps (`<div class="…long…"> </div>`) diverged from the
prettier-plugin-svelte oracle under `bracketSameLine: true`: rsvelte dedented the
`>` onto its own line and glued the close tag (`…"`\n`></div>`), whereas the
oracle glues the `>` to the last attribute line and drops `</div>` to its own
line (`…">`\n`</div>`). The default (`bracketSameLine: false`) already matched
(`…"`\n`></div>`).

Under `bracketSameLine`, a block-display element's wrapped open `>` now glues to
the last attribute (like the inline whitespace-body case fixed in #1707), and the
collapse pass keeps the resulting break instead of re-gluing it. Folding this into
#1707 was previously deferred because the collapse pass stripped an empty block
body's inserted newline, making the `true` case non-idempotent; `try_collapse` now
preserves the break whenever the wrapped open tag glued its `>`, so output is
byte-identical to the oracle and idempotent for both `bracketSameLine` values.

The `try_collapse` change is not limited to block-display elements — it applies to
every non-whitespace-sensitive empty body (Components, `<slot>`, `svelte:*`), so
the same-shape divergence for a top-level Component or `<slot>` with a whitespace-
only body and a wrapping open tag (where `main` failed to break the close tag onto
its own line) is fixed too. This moves those cases toward the oracle, not away.
