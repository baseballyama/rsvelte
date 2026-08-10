# P1 — client instance-script lowering falls back to a hand-written JavaScript scanner

Category: correctness / performance / architecture

Evidence: `transform_instance_script_for_visitors` (`client/mod.rs:4584`) eventually splits generated script into lines, tracks delimiter depth and string state manually, and reconstructs statements (`client/mod.rs:6271-6556`). When the typed statement transform cannot handle a statement, line 6243 explicitly falls back to this legacy scanner. The gate analysis records real failures from scanner splices: #2603 produced 9 unparseable and 6 parseable-but-wrong files, #2598 emitted a valid but semantically wrong naked `$:`, and 30 currently unparseable components live outside the regular corpus (`compatibility/gate-coverage.md:1316-1355`).

Impact: JavaScript grammar, ASI, comments, template literals, regexes, nested arrows and TypeScript syntax are being approximated after a parser has already produced a correct AST. The same loop repeatedly inspects and rebuilds text, is the dominant scalable performance bucket, and can produce valid-but-wrong output that a parseability gate cannot see.

Remediation: make the retained OXC AST the sole input to instance-script visitors, transform each statement once, and emit typed output. Turn every known huly/open-webui/carbon/SMUI witness into a permanent output-equality and parse-validity fixture before deleting the scanner.

Acceptance: all 30 known unparseable components and the 15 #2603 changed outputs match official behavior; arrow bodies, ASI, escapes, multiline `else`, comments and printer-newline cases are covered; the text fallback counter is zero across every corpus target and the line scanner is removed.
