//! Client-specific utilities.
//!
//! This module contains utility functions specific to client-side
//! code generation.
//!
//! Corresponds to `svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js`.

use crate::compiler::phases::phase2_analyze::scope::Binding;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
use std::collections::HashSet;

/// Collect all variable names that are initialized with $state().
pub fn collect_state_var_names(script_content: &str) -> HashSet<String> {
    let mut state_vars = HashSet::new();

    for line in script_content.lines() {
        let trimmed = line.trim();

        // Match patterns like: let x = $state(...) or const x = $state(...)
        if let Some(rest) = trimmed.strip_prefix("let ") {
            if let Some(name) = extract_state_var_name(rest) {
                state_vars.insert(name);
            }
        } else if let Some(rest) = trimmed.strip_prefix("const ")
            && let Some(name) = extract_state_var_name(rest)
        {
            state_vars.insert(name);
        }
    }

    state_vars
}

/// Extract variable name if initialized with $state().
fn extract_state_var_name(decl: &str) -> Option<String> {
    let parts: Vec<&str> = decl.splitn(2, '=').collect();
    if parts.len() != 2 {
        return None;
    }

    let name = parts[0].trim();
    let value = parts[1].trim();

    if value.starts_with("$state(") {
        Some(name.to_string())
    } else {
        None
    }
}

/// Check if an expression contains state variable references.
pub fn contains_state_reference(expr: &str, state_vars: &HashSet<String>) -> bool {
    // Simple check - look for any state variable name in the expression
    // A more sophisticated implementation would parse the expression
    for var in state_vars {
        if expr.contains(var.as_str()) {
            return true;
        }
    }
    false
}

/// Transform a state variable reference to use $.get().
/// e.g., "count" -> "$.get(count)"
pub fn transform_state_read(var_name: &str) -> String {
    format!("$.get({})", var_name)
}

/// Transform a state variable assignment to use $.set().
/// e.g., "count = 5" -> "$.set(count, 5)"
pub fn transform_state_write(var_name: &str, value: &str) -> String {
    format!("$.set({}, {})", var_name, value)
}

/// Check if a binding is a state source that needs reactive tracking.
///
/// A binding is a state source if it's a `$state` or `$state.raw` binding,
/// and either:
/// - The component is not in immutable mode, OR
/// - The binding has been reassigned, OR
/// - The component uses accessors mode
///
/// This matches the official Svelte compiler's implementation:
/// `(!analysis.immutable || binding.reassigned || analysis.accessors)`
///
/// # Arguments
///
/// * `binding` - The binding to check
/// * `analysis` - The component analysis
///
/// # Returns
///
/// `true` if the binding needs reactive tracking as a state source
pub fn is_state_source(binding: &Binding, analysis: &ComponentAnalysis) -> bool {
    // RawState ($state.raw) always needs $.get() because its purpose is to track
    // value changes at the top level (without deep reactivity).
    if matches!(binding.kind, BindingKind::RawState) {
        return true;
    }
    // Match the official Svelte compiler's is_state_source implementation:
    // (binding.kind === 'state' || binding.kind === 'raw_state') &&
    // (!analysis.immutable || binding.reassigned || analysis.accessors)
    //
    // Note: We do NOT check binding.mutated here. Mutation (like counter.count += 1)
    // doesn't require $.get() wrapping - only reassignment (counter = newValue) does.
    // Proxy objects handle deep reactivity internally.
    matches!(binding.kind, BindingKind::State)
        && (!analysis.immutable || binding.reassigned || analysis.accessors)
}

/// Check if a prop binding is a "prop source" that needs to be tracked via `$.prop()`.
///
/// A prop binding is a prop source if it's a `Prop` or `BindableProp` and either:
/// - NOT in runes mode, OR
/// - The component uses accessors mode, OR
/// - The binding has been reassigned, OR
/// - The binding has an initial value (default), OR
/// - The binding has been updated/mutated
///
/// When a prop is a "prop source", it uses `$.prop()` and is accessed by its direct name.
/// When a prop is NOT a prop source, it should be accessed via `$$props.propName`.
///
/// This matches the official Svelte compiler's `is_prop_source` implementation.
///
/// # Arguments
///
/// * `binding` - The binding to check
/// * `analysis` - The component analysis
///
/// # Returns
///
/// `true` if the prop binding should use `$.prop()` and be accessed by name
pub fn is_prop_source(binding: &Binding, analysis: &ComponentAnalysis) -> bool {
    matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp)
        && (!analysis.runes
            || analysis.accessors
            || binding.reassigned
            || binding.initial.is_some()
            || binding.mutated)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_collect_state_var_names() {
        let script = r#"
            let count = $state(0);
            const name = $state("test");
            let normal = 42;
        "#;
        let vars = collect_state_var_names(script);
        assert!(vars.contains("count"));
        assert!(vars.contains("name"));
        assert!(!vars.contains("normal"));
    }

    #[test]
    fn test_contains_state_reference() {
        let mut state_vars = HashSet::new();
        state_vars.insert("count".to_string());

        assert!(contains_state_reference("count + 1", &state_vars));
        assert!(!contains_state_reference("x + 1", &state_vars));
    }
}
