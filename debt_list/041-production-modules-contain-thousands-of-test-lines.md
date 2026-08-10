# P3 — large production modules also contain thousands of lines of inline tests

Category: folder structure / readability / build hygiene

Evidence: `svelte_check/overlay.rs` begins its inline test module at line 3776 and ends at line 5928, adding more than 2,100 test lines to an already broad production module. `2_analyze/mod.rs` contains test-only blocks starting around lines 3360, 5897 and 6285 inside a 6,341-line root.

Impact: production navigation, ownership metrics and review diffs are polluted by a second responsibility; test helpers gain privileged access to every private detail, discouraging stable internal contracts and making module extraction harder.

Remediation: move substantial tests to sibling `tests/` modules organized by behavior, retain only tiny white-box tests where privacy is essential, and expose narrow `pub(super)` test seams rather than the entire module interior.

Acceptance: production roots contain implementation and orchestration only; test files mirror behavioral domains; no test module exceeds an agreed size without further decomposition; coverage is unchanged.
