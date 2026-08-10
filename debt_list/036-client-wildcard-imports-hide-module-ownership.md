# P2 — wildcard imports hide ownership inside the client transform root

Category: readability / architecture

Evidence: `client/mod.rs:73-80` glob-imports eight broad modules (`destructure_transforms`, `expression_utils`, `formatting`, `props_transforms`, `reactive_transforms`, `rune_transforms`, `state_transforms`, `store_transforms`). The same pattern appears in the bespoke JS AST facade. Symbols used by the 7,000-line root therefore do not reveal their owner at the call site and collisions are resolved by global convention.

Impact: moving or renaming a helper has non-local effects, dependency review is manual, and generic names such as `rewritten`, `build_*` or `transform_*` are impossible to trace without tooling. Tests importing `super::*` reward an accidentally broad internal API.

Remediation: use qualified module calls or narrow imports, expose intentional per-domain facades, and make tests import the exact contract they exercise.

Acceptance: production transform roots contain no module globs; public(crate) surfaces are explicit; dependency tooling can derive ownership without name-resolution inference.
