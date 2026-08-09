# P1 — parameter defaults and computed keys lose reactive dependencies

Category: Svelte compatibility / runtime correctness

Evidence: the generated-shape ratchet contains 60 `param-pattern` failures (`compatibility/matrix-known-failures.md:227-262`). Reads in a nested function's parameter default or computed key are omitted from `$.legacy_pre_effect` / `$.template_effect` dependencies even though those expressions execute in the enclosing scope.

Impact: reactive statements and markup effects fail to rerun when a referenced prop changes. The generated body can look correct while its scheduling dependency list is incomplete.

Remediation: mirror upstream `extract_all_identifiers` plus scope resolution, distinguishing binding positions from evaluated default/computed expressions.

Acceptance: all five recorded shapes clear on client and client-dev, with runtime assertions that changing the default/key dependency reruns the effect exactly once.
