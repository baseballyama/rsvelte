//! Regression note for the `bind:*` validation / component-binding cluster
//! (issue #468).
//!
//! - **H-044** component getter/setter binding helper names — already
//!   merged (PR #536).
//! - The cluster's other items (H-036, H-037, H-045, H-066..H-068, H-089,
//!   M-025..M-030, M-038) each need their own bind-validation /
//!   memoization / lowering change. They share the "centralise component-
//!   binding validation through the canonical bind-expression checks"
//!   refactor the issue itself recommends; deferred.

#[test]
fn bind_cluster_doc_pin() {
    // Doc-only pin — see module-level comment for cluster status.
}
