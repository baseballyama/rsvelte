//! Regression note for AST primitives cluster (#478).
//!
//! Per the prior triage, none of the findings here (M-001..M-008, M-015,
//! M-057) has a cleanly-reachable Svelte-divergence to fix safely in
//! isolation — each either matches upstream, is masked by downstream
//! handling, or shares a deeper refactor (codegen / parser internals)
//! tracked elsewhere. Deferred.

#[test]
fn ast_primitives_doc_pin() {}
