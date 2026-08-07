---
"@rsvelte/compiler": patch
---

Serialize only the `$:` statements for the legacy reactive analysis passes

The three legacy passes (`check_reactive_declaration_cycles`,
`populate_legacy_dependencies`, `collect_reactive_statement_dependencies`) each
reached the instance script's top-level `LabeledStatement`s through
`instance.content.as_json()`, which materializes the entire script as
`serde_json::Value`. They now share one serialization of just those statements.

Interleaved paired runs: Huly plugins −20.0% (6/6), open-webui −15.1% (8/8),
carbon-components-svelte −12.3% (8/8); SMUI unchanged (+0.3%, 2/8).
