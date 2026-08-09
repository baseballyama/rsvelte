# P1 — semantics-preserving comments still change generated behavior

Category: compiler correctness / robustness

Evidence: the mutation ratchet has 36 code mismatches (`compatibility/mutation-known-failures.md:136-173`). At least eight first differences are behavioral: three missing `$.get` reads, three leaked `$$DOUBLE_SEMI$$` markers, two surviving `$props()` destructures, plus a dropped `$.snapshot` argument and extra legacy prologues in the classified set.

Impact: inserting a comment can remove reactivity, ship internal sentinels, or leave compile-time runes in runtime output. First-difference classification may hide further semantic changes later in the same artifact.

Remediation: trace each behavioral class to a transform, replace delimiter scans/sentinels with typed nodes, and compare the full normalized AST rather than only the first textual difference during triage.

Acceptance: behavioral classes reach zero under a full mutation run; add minimized runtime tests for each root cause before reducing cosmetic residue.
