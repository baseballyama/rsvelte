//! Regression note for the CSS parser/scoping cluster (issue #466).
//!
//! - **H-021** CSS selector-list split not bracket/string-aware — already
//!   merged (PR #532).
//! - **H-023** CSS scoping traversal missing `<svelte:boundary>` — already
//!   merged (PR #532).
//! - **H-020** CSS emission re-extracts `<style>` from raw source instead of
//!   using the parsed `StyleSheet`, **H-022** keyframe-reference rewriting
//!   scans raw text and can mutate strings / custom properties / comments,
//!   **M-018** attribute-selector matching does not CSS-unescape, and
//!   **M-019** nested at-rules inside style-rule blocks are stored as empty
//!   blocks — all share the move from text-based CSS scanning to driving the
//!   pipeline off the parsed CSS AST that the issue itself suggests;
//!   deferred to a coordinated CSS-AST pass.

#[test]
fn css_cluster_doc_pin() {
    // Doc-only pin — see module-level comment for cluster status.
}
