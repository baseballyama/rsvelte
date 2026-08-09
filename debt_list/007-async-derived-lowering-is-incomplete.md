# P1 — experimental async-derived lowering has multiple semantic failures

Category: Svelte compatibility / invalid output

Evidence: the async-derived matrix holds 253 failures across seven measured causes (`compatibility/matrix-known-failures.md:333-395`). Module lowering is inverted or absent (154); inline block comments can create invalid JavaScript (14); non-final awaits lose `$.save` (13); `$derived.by(async ...)` is suspended incorrectly (13); other failures cover hoists, comments, and server async splitting.

Impact: enabling `experimental.async` can change scheduling, generate unparsable code, miscompile modules, or introduce awaits that official Svelte does not perform.

Remediation: converge module and instance paths on the official AST lowering and eliminate the text-splice hoist path; fix semantic causes before comment-fidelity residue.

Acceptance: the async-derived matrix and its runtime warning/ignore test reach zero, and every generated artifact parses before comparison.
