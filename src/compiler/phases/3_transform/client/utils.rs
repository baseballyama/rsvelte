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
    let borrowed: FxHashSet<&str> = state_vars.iter().map(|s| s.as_str()).collect();
    text_contains_any_identifier(expr, &borrowed)
}

/// Check if `text` contains any identifier that appears in `vars`.
///
/// This scans the text once (O(text_len)) extracting JavaScript identifiers by
/// byte-scanning for word boundaries, then checks each extracted identifier against
/// the set. This is dramatically faster than the naive approach of calling
/// `text.contains(var)` for each variable (O(N * text_len)).
///
/// Note: This is a conservative approximation -- it extracts identifiers from ALL
/// positions including inside string literals and comments. This is acceptable because
/// it's used as a quick pre-filter: false positives just mean we do a bit more work
/// in the downstream transform, while false negatives would cause correctness bugs.
#[inline]
pub fn text_contains_any_identifier(text: &str, vars: &FxHashSet<&str>) -> bool {
    if vars.is_empty() || text.is_empty() {
        return false;
    }
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    while i < len {
        let b = bytes[i];
        // Fast skip for non-identifier-start bytes (common case: operators, whitespace, punctuation)
        if !is_ident_start_byte(b) {
            i += 1;
            continue;
        }
        let start = i;
        i += 1;
        while i < len && is_ident_continue_byte(bytes[i]) {
            i += 1;
        }
        // SAFETY: identifier chars are always valid ASCII subset, so valid UTF-8
        let word = unsafe { std::str::from_utf8_unchecked(&bytes[start..i]) };
        if vars.contains(word) {
            return true;
        }
    }
    false
}

/// Retain only those strings in `vars` whose name appears as an identifier in `text`.
///
/// Like `text_contains_any_identifier`, this is O(text_len + N) rather than O(N * text_len).
pub fn text_retain_matching_identifiers(text: &str, vars: &mut Vec<String>) {
    if vars.is_empty() || text.is_empty() {
        return;
    }
    // Build a set of all identifiers present in the text
    let ids = extract_identifiers(text);
    vars.retain(|v| ids.contains(v.as_str()));
}

/// Extract all unique identifiers from text into a FxHashSet.
fn extract_identifiers(text: &str) -> FxHashSet<&str> {
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut set = FxHashSet::default();
    let mut i = 0;
    while i < len {
        let b = bytes[i];
        if !is_ident_start_byte(b) {
            i += 1;
            continue;
        }
        let start = i;
        i += 1;
        while i < len && is_ident_continue_byte(bytes[i]) {
            i += 1;
        }
        let word = unsafe { std::str::from_utf8_unchecked(&bytes[start..i]) };
        set.insert(word);
    }
    set
}

/// Check if a byte can start a JavaScript identifier (a-z, A-Z, _, $).
/// We only check ASCII since JS variable names in Svelte components are
/// overwhelmingly ASCII. Non-ASCII identifier starts (e.g. Unicode letters)
/// would be missed but this is a pre-filter so false negatives at boundaries
/// are acceptable (the downstream transform handles them correctly).
#[inline(always)]
fn is_ident_start_byte(b: u8) -> bool {
    b.is_ascii_alphabetic() || b == b'_' || b == b'$'
}

/// Check if a byte can continue a JavaScript identifier (a-z, A-Z, 0-9, _, $).
#[inline(always)]
fn is_ident_continue_byte(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
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
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr {
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;
    use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

    // Check if there's a transform registered for this identifier
    if let Some(t) = transform.get(name)
        && let Some(read_fn) = t.read
    {
        // Apply the transform
        return read_fn(arena, JsExpr::Identifier(name.into()));
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

    #[test]
    fn test_text_contains_any_identifier() {
        let mut vars = FxHashSet::default();
        vars.insert("count");
        vars.insert("name");

        assert!(text_contains_any_identifier("count + 1", &vars));
        assert!(text_contains_any_identifier("let x = name;", &vars));
        assert!(!text_contains_any_identifier("x + 1", &vars));
        // Should NOT match substrings - "counter" contains "count" as substring but not as identifier
        assert!(!text_contains_any_identifier("counter + 1", &vars));
        assert!(!text_contains_any_identifier("", &vars));
        assert!(!text_contains_any_identifier("abc", &FxHashSet::default()));
    }

    #[test]
    fn test_text_retain_matching_identifiers() {
        let mut vars = vec![
            "count".to_string(),
            "name".to_string(),
            "unused".to_string(),
        ];
        text_retain_matching_identifiers("count + name + 1", &mut vars);
        assert_eq!(vars, vec!["count".to_string(), "name".to_string()]);

        let mut vars2 = vec!["foo".to_string()];
        text_retain_matching_identifiers("bar + baz", &mut vars2);
        assert!(vars2.is_empty());
    }
}
