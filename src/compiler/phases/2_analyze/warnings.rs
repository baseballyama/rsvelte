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

/// Reactive declaration is invalid placement (not at the top level of an instance script)
pub fn reactive_declaration_invalid_placement() -> AnalysisWarning {
    warning(
        "reactive_declaration_invalid_placement",
        "Reactive declarations are only valid at the top level of the instance script",
    )
}

// Performance warnings

/// Avoid 'new class' — instead, declare the class at the top level scope
pub fn perf_avoid_inline_class() -> AnalysisWarning {
    warning(
        "perf_avoid_inline_class",
        "Avoid 'new class' — instead, declare the class at the top level scope\nhttps://svelte.dev/e/perf_avoid_inline_class",
    )
}

/// Avoid declaring classes below the top level scope
pub fn perf_avoid_nested_class() -> AnalysisWarning {
    warning(
        "perf_avoid_nested_class",
        "Avoid declaring classes below the top level scope\nhttps://svelte.dev/e/perf_avoid_nested_class",
    )
}

// Security warnings

/// Bidirectional control character detected in code.
///
/// These Unicode characters can alter the visual direction of code
/// and could have unintended security consequences.
///
/// Corresponds to Svelte's `bidirectional_control_characters` warning.
pub fn bidirectional_control_characters() -> AnalysisWarning {
    warning(
        "bidirectional_control_characters",
        "A bidirectional control character was detected in your code. These characters can be used to alter the visual direction of your code and could have unintended consequences\nhttps://svelte.dev/e/bidirectional_control_characters",
    )
}

// Slot element warnings

/// Using `<slot>` to render parent content is deprecated. Use `{@render ...}` tags instead
pub fn slot_element_deprecated() -> AnalysisWarning {
    warning(
        "slot_element_deprecated",
        "Using `<slot>` to render parent content is deprecated. Use `{@render ...}` tags instead",
    )
}

/// `<svelte:self>` is deprecated — use self-imports (e.g. `import Component from './Component.svelte'`) instead
pub fn svelte_self_deprecated(name: &str, basename: &str) -> AnalysisWarning {
    warning(
        "svelte_self_deprecated",
        format!(
            "`<svelte:self>` is deprecated — use self-imports (e.g. `import {} from './{}'`) instead\nhttps://svelte.dev/e/svelte_self_deprecated",
            name, basename
        ),
    )
}

/// `<svelte:component>` is deprecated in runes mode — components are dynamic by default
pub fn svelte_component_deprecated() -> AnalysisWarning {
    warning(
        "svelte_component_deprecated",
        "`<svelte:component>` is deprecated in runes mode — components are dynamic by default",
    )
}
