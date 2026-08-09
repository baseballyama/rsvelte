# P2 — runes-mode `{@html}` opening-tag validation is skipped

Category: validation / Svelte compatibility

Evidence: the `HtmlTag` analysis visitor contains `TODO: Implement validate_opening_tag` and does nothing in runes mode (`crates/rsvelte_core/src/compiler/phases/2_analyze/visitors/html_tag.rs:23-29`).

Impact: syntax/placement shapes rejected or diagnosed by official Svelte may compile without the same error code and span.

Remediation: port upstream `validate_opening_tag`, passing source ranges through `VisitorContext`, and use the shared diagnostic constructors.

Acceptance: generated cases with delimiters, comments, whitespace/newlines, and adjacent tags have identical accept/reject results, codes, messages, and spans.
