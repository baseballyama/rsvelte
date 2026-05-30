//! Regression note for the print round-trip cluster (issue #467).
//!
//! - **H-052** pending-only `{#await}` blocks printed an invalid dangling
//!   `{:{/await}` — already merged (PR #533).
//! - **M-037** optional computed member expressions printed as invalid JS in
//!   the ESTree fallback (`obj?.[key]`) — already merged (PR #533).
//! - **H-049 / H-050 / H-051 / M-035 / M-036 / L-006** all share the
//!   source-preserving `print()` refactor the issue itself recommends —
//!   retain the original source for any node that has a span, respect
//!   `preserveWhitespace`, escape attribute text, decide on the sourcemap
//!   API. Coordinated work, deferred.

#[test]
fn print_cluster_doc_pin() {
    // Doc-only pin — see module-level comment for cluster status.
}
