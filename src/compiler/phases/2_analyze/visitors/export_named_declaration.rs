//! ExportNamedDeclaration visitor.
//!
//! Analyzes export named declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExportNamedDeclaration.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::errors;
use serde_json::Value;

/// Visit an export named declaration.
///
/// Checks for `export { x as default }` pattern which is not allowed in components.
pub fn visit(node: &Value, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for `export { ... as default }` pattern
    // This is always an error in Svelte component scripts
    if let Some(specifiers) = node.get("specifiers").and_then(|s| s.as_array()) {
        for specifier in specifiers {
            // Check if exported name is "default"
            if let Some(exported) = specifier.get("exported") {
                let is_default =
                    if exported.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
                        exported.get("name").and_then(|n| n.as_str()) == Some("default")
                    } else {
                        // Literal (for string exports)
                        exported.get("value").and_then(|v| v.as_str()) == Some("default")
                    };

                if is_default {
                    return Err(errors::module_illegal_default_export());
                }
            }
        }
    }

    // TODO: In legacy mode, exports become props
    // TODO: Track exported bindings
    // TODO: Check for export let in runes mode
    // TODO: Check for derived state exports
    // TODO: Check for reassigned state exports

    Ok(())
}
