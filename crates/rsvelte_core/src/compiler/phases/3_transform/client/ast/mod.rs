//! Client CSR transform, rebuilt on oxc AST (no generated-text round trip).
//!
//! This module is the client counterpart of the finished `3_transform/server/ast`
//! pipeline. It is added alongside the existing text-based client transform so
//! the port can proceed while `main` stays green: nothing calls into it unless
//! `RSVELTE_CLIENT_AST` is set, and until a visitor is ported
//! [`transform_client_ast`] returns `None` so the caller falls back.
//!
//! See `docs/ast-refactor-handoff.md` §00 for the milestone plan and the
//! constraints that shape it — in particular that read-wrapping has to happen in
//! a single pass over the raw expression AST, so M1 lands as one switch rather
//! than incremental routing.

use std::sync::LazyLock;

use super::super::super::phase2_analyze::types::ComponentAnalysis;
use super::super::js_ast::codegen::CodegenResult;
use crate::CompileOptions;
use crate::ast::Root;

pub(crate) mod oracle;

/// Route the client transform through this module instead of the text pipeline.
pub(crate) static CLIENT_AST: LazyLock<bool> =
    LazyLock::new(|| std::env::var_os("RSVELTE_CLIENT_AST").is_some());

/// Transform a component with the AST pipeline.
///
/// Returns `None` when the component uses a construct this module cannot emit
/// yet, which asks the caller to fall back to the text pipeline. Every visitor
/// ported in M1/M2 narrows that set; the [`oracle`] harness measures how far
/// along that is by compiling the corpus both ways and diffing the output.
pub(crate) fn transform_client_ast(
    _analysis: &ComponentAnalysis,
    _ast: &Root,
    _source: &str,
    _options: &CompileOptions,
) -> Option<CodegenResult> {
    // M0: no visitor is ported yet, so every component falls back. M1 replaces
    // this with the script pipeline written against `server/ast/script.rs`.
    None
}
