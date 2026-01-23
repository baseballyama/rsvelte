//! ExportDefaultDeclaration visitor.
//!
//! Analyzes export default declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExportDefaultDeclaration.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::errors;
use serde_json::Value;

/// Visit an export default declaration.
///
/// In Svelte component scripts (both instance and module scripts),
/// default exports are not allowed.
pub fn visit(_node: &Value, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In Svelte component scripts, default exports are not allowed
    // This applies to both <script> and <script module> contexts
    Err(errors::module_illegal_default_export())
}
