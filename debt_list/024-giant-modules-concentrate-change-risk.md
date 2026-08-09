# P2 — core compiler responsibilities are concentrated in multi-thousand-line modules

Category: readability / maintainability

Evidence: current line counts include `expression.rs` 12,243, server `transform_script.rs` 7,634, `css.rs` 7,476, client `mod.rs` 7,148, shared client `utils.rs` 7,021, `expression_converter.rs` 6,965, analysis `mod.rs` 6,341, and check `overlay.rs` 5,928.

Impact: unrelated algorithms share private state and review surface, increasing merge conflicts, making ownership/testing boundaries unclear, and encouraging more source-text utilities in generic modules.

Remediation: split by the corresponding upstream visitor/module boundary while preserving names and algorithms; move embedded tests beside the extracted unit and expose narrow typed interfaces.

Acceptance: each extraction is behavior-neutral under full compatibility gates, and production modules have a documented single responsibility rather than an arbitrary line target.
