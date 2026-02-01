//! StyleDirective visitor.
//!
//! Analyzes style: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/StyleDirective.js`.

use super::super::errors;
use super::VisitorContext;
use crate::ast::template::StyleDirective;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a style directive.
pub fn visit(
    directive: &StyleDirective,
    _context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // style: directives set individual CSS properties

    // Validate modifiers - only "important" is allowed
    for modifier in &directive.modifiers {
        if modifier.as_str() != "important" {
            return Err(errors::style_directive_invalid_modifier());
        }
    }

    // Analyze the expression if present
    // (The expression is optional - if absent, the directive uses a variable with the same name)

    Ok(())
}
