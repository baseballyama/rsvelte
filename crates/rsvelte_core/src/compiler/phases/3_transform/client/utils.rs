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
        // SAFETY: `bytes` come from `text.as_bytes()`. The slice spans
        // `start..i`, a run that begins at an ASCII ident-start byte and
        // continues only over ASCII ident-continue bytes, so it is entirely
        // ASCII and therefore valid UTF-8 lying on char boundaries.
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

#[cfg(test)]
mod tests {
    use super::*;

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
