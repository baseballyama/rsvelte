//! OnDirective visitor.
//!
//! Analyzes on: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/OnDirective.js`.

use super::VisitorContext;
use crate::ast::template::OnDirective;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an on directive.
pub fn visit(directive: &OnDirective, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Track that we use event directives (for detecting mixed syntax)
    // In Svelte 5 runes mode, mixing on: with onevent attributes is an error

    // Validate modifiers
    let valid_modifiers = [
        "preventDefault",
        "stopPropagation",
        "stopImmediatePropagation",
        "capture",
        "once",
        "passive",
        "nonpassive",
        "self",
        "trusted",
    ];

    for modifier in &directive.modifiers {
        if !valid_modifiers.contains(&modifier.as_str()) {
            return Err(AnalysisError::Validation(format!(
                "Invalid event modifier '{}'",
                modifier
            )));
        }
    }

    // Check for conflicting modifiers
    let has_passive = directive.modifiers.iter().any(|m| m == "passive");
    let has_nonpassive = directive.modifiers.iter().any(|m| m == "nonpassive");
    let has_prevent_default = directive.modifiers.iter().any(|m| m == "preventDefault");

    if has_passive && (has_nonpassive || has_prevent_default) {
        return Err(AnalysisError::Validation(
            "The 'passive' modifier cannot be used with 'nonpassive' or 'preventDefault'"
                .to_string(),
        ));
    }

    Ok(())
}
