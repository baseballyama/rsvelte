# P1 — special elements bypass shared directive validation and lowering

Category: Svelte compatibility / validation / code generation

Evidence: 422 measured `directive-element` failures are all on `<svelte:*>` hosts (`compatibility/matrix-known-failures.md:264-311`). They include 114 invalid boundary attributes, 102 invalid fragment attributes, 60 invalid self directives, missing a11y warnings, wrong error codes, and missing transition/animation output. Ordinary elements and components pass the same matrix.

Impact: rsvelte accepts programs official Svelte rejects, reports different diagnostics, or silently omits runtime behavior depending on the special-element visitor.

Remediation: centralize upstream-equivalent per-directive predicates and invoke them consistently from every special-element visitor; then share lowering paths where semantics are identical.

Acceptance: the complete 19-directive × 13-host × 2-mode matrix reaches zero rsvelte-owned failures on all three targets.
