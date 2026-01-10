//! Compiler warning definitions.
//!
//! This module provides warning functions for non-fatal issues detected during the analyze phase.
//! Each function corresponds to a specific warning code in the Svelte compiler.
//!
//! Corresponds to Svelte's `warnings.js`.

/// Warning type for analysis phase.
#[derive(Debug)]
pub struct AnalysisWarning {
    /// The warning code
    pub code: String,
    /// The warning message
    pub message: String,
}

impl AnalysisWarning {
    /// Create a new warning with a code and message.
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
        }
    }
}

/// Create a warning with a specific code and message.
fn warning(code: &str, message: impl Into<String>) -> AnalysisWarning {
    AnalysisWarning::new(code, message)
}

// Component creation warnings

/// Creating a component with `new ComponentName({ target: ... })` is deprecated.
/// Use `mount(ComponentName, { target: ... })` instead.
pub fn legacy_component_creation() -> AnalysisWarning {
    warning(
        "legacy_component_creation",
        "Creating a component with `new ComponentName({ target: ... })` is deprecated. Use `mount(ComponentName, { target: ... })` instead",
    )
}

/// State referenced locally - may not be reactive
pub fn state_referenced_locally(name: &str, context_type: &str) -> AnalysisWarning {
    let message = if context_type == "derived" {
        "State referenced in its own scope will never update. Did you mean to reference it inside a closure?".to_string()
    } else {
        format!(
            "State `{}` referenced in its own scope will never update. Did you mean to reference it inside a closure?",
            name
        )
    };

    warning("state_referenced_locally", message)
}

/// Reactive declaration references module script dependency
pub fn reactive_declaration_module_script_dependency() -> AnalysisWarning {
    warning(
        "reactive_declaration_module_script_dependency",
        "Reactive declarations in instance script should not reference variables from module script that are reassigned. This can lead to unexpected behavior.",
    )
}
