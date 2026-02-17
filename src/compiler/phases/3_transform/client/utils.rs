//! Client-specific utilities.
//!
//! This module contains utility functions specific to client-side
//! code generation.
//!
//! Corresponds to `svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js`.

use crate::compiler::phases::phase2_analyze::scope::Binding;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
use rustc_hash::FxHashSet;

/// Collect all variable names that are initialized with $state().
pub fn collect_state_var_names(script_content: &str) -> FxHashSet<String> {
    let mut state_vars = FxHashSet::default();

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
pub fn contains_state_reference(expr: &str, state_vars: &FxHashSet<String>) -> bool {
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
    // Match the official Svelte compiler's is_state_source implementation exactly:
    // (binding.kind === 'state' || binding.kind === 'raw_state') &&
    // (!analysis.immutable || binding.reassigned || analysis.accessors)
    //
    // In runes mode (immutable=true), non-reassigned state/raw_state bindings
    // are NOT state sources - they don't need $.state() wrapping or $.get()/$.set().
    // For regular $state(), the value is wrapped in $.proxy() which handles deep reactivity.
    // For $state.raw(), the raw value is used directly with no reactivity tracking.
    matches!(binding.kind, BindingKind::State | BindingKind::RawState)
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

/// Build a getter expression for a binding.
///
/// This function creates an expression to access a binding value, applying any
/// necessary transforms (e.g., wrapping in `$.get()` for state sources).
///
/// Corresponds to `build_getter` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js`.
///
/// # Arguments
///
/// * `name` - The binding name
/// * `transform` - Optional transform map to check for read transforms
///
/// # Returns
///
/// Returns an expression that reads the binding's current value.
///
/// # Example
///
/// For a state source:
/// ```javascript
/// // Input: count (state source)
/// // Output: $.get(count)
/// ```
///
/// For a prop that's not a prop source:
/// ```javascript
/// // Input: value (prop)
/// // Output: $$props.value
/// ```
///
/// For a simple binding:
/// ```javascript
/// // Input: constant
/// // Output: constant
/// ```
pub fn build_getter(
    name: &str,
    transform: &std::collections::HashMap<
        String,
        crate::compiler::phases::phase3_transform::client::types::IdentifierTransform,
    >,
) -> crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr {
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;
    use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

    // Check if there's a transform registered for this identifier
    if let Some(t) = transform.get(name)
        && let Some(read_fn) = t.read
    {
        // Apply the transform
        return read_fn(JsExpr::Identifier(name.to_string()));
    }

    // No transform - return the identifier as-is
    b::id(name)
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
        let mut state_vars = FxHashSet::default();
        state_vars.insert("count".to_string());

        assert!(contains_state_reference("count + 1", &state_vars));
        assert!(!contains_state_reference("x + 1", &state_vars));
    }
}
