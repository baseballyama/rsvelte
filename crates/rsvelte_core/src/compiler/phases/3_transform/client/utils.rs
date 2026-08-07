//! Client-specific utilities.
//!
//! This module contains utility functions specific to client-side
//! code generation.
//!
//! Corresponds to `svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js`.

use crate::ast::template::TemplateNode;
use crate::compiler::phases::phase2_analyze::scope::Binding;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
use crate::compiler::utils::{is_js_ident_continue, is_js_ident_start};
use rustc_hash::FxHashSet;

/// Let the `{#snippet}` blocks a fragment declares shadow the inherited reads of
/// the same name, so identifiers inside that fragment resolve to the snippet.
///
/// Mirrors `get_transform` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js`,
/// which deletes every `normal`-kind declaration of the scope being entered from
/// the inherited transform map. In a template fragment those `normal`
/// declarations are exactly the snippet names (`scope.declare(node.expression,
/// 'normal', 'function', node)` in `scope.js`). `shadowed_prop_names` covers the
/// same ground for the non-source-prop shortcut in `expression_converter`, which
/// resolves `$$props.x` straight from the binding instead of the transform map.
pub fn shadow_snippet_declarations(
    nodes: &[TemplateNode<'_>],
    transform: &mut im::HashMap<
        String,
        crate::compiler::phases::phase3_transform::client::types::IdentifierTransform,
    >,
    transform_deep_read: &mut im::HashMap<String, ()>,
    shadowed_prop_names: &mut im::HashSet<String>,
) {
    for node in nodes {
        if let TemplateNode::SnippetBlock(snippet) = node
            && let Some(name) = snippet.expression.name()
        {
            transform.remove(name);
            transform_deep_read.remove(name);
            shadowed_prop_names.insert(name.to_string());
        }
    }
}

/// Check if `text` contains any identifier that appears in `vars`.
///
/// This scans the text once (O(text_len)), cutting it into identifier tokens by
/// the same start/continue rule the official parser uses, then checks each token
/// against the set. This is dramatically faster than the naive approach of
/// calling `text.contains(var)` for each variable (O(N * text_len)).
///
/// Note: This is a conservative approximation -- it extracts identifiers from ALL
/// positions including inside string literals and comments. This is acceptable because
/// it's used as a quick pre-filter: false positives just mean we do a bit more work
/// in the downstream transform, while false negatives would cause correctness bugs.
#[inline]
pub fn text_contains_any_identifier(text: &str, vars: &FxHashSet<&str>) -> bool {
    if vars.is_empty() {
        return false;
    }
    let mut i = 0;
    while let Some((start, end)) = next_identifier(text, i) {
        if vars.contains(&text[start..end]) {
            return true;
        }
        i = end;
    }
    false
}

/// Byte length of the identifier-start character at `i`, or `None`.
///
/// Non-ASCII is decoded rather than admitted wholesale: `\u{a0}` and `\u{3000}`
/// are JavaScript whitespace, so gluing them into a word hides the identifier
/// next to them, and a missed identifier here is a correctness bug.
#[inline]
fn ident_start_len(text: &str, i: usize) -> Option<usize> {
    let b = text.as_bytes()[i];
    if b.is_ascii() {
        return (b.is_ascii_alphabetic() || b == b'_' || b == b'$').then_some(1);
    }
    let c = text[i..].chars().next()?;
    is_js_ident_start(c).then(|| c.len_utf8())
}

/// Byte length of the identifier-continue character at `i`, or `None`.
#[inline]
fn ident_continue_len(text: &str, i: usize) -> Option<usize> {
    let b = text.as_bytes()[i];
    if b.is_ascii() {
        return (b.is_ascii_alphanumeric() || b == b'_' || b == b'$').then_some(1);
    }
    let c = text[i..].chars().next()?;
    is_js_ident_continue(c).then(|| c.len_utf8())
}

/// Byte range of the first identifier at or after `from`.
#[inline]
fn next_identifier(text: &str, from: usize) -> Option<(usize, usize)> {
    let len = text.len();
    let mut i = from;
    loop {
        if i >= len {
            return None;
        }
        match ident_start_len(text, i) {
            Some(n) => {
                let start = i;
                i += n;
                while i < len {
                    match ident_continue_len(text, i) {
                        Some(n) => i += n,
                        None => break,
                    }
                }
                return Some((start, i));
            }
            // Not a start character; step over it whole so `i` stays on a char
            // boundary and the next character is judged on its own.
            None => i += text[i..].chars().next().map_or(1, char::len_utf8),
        }
    }
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
    let mut set = FxHashSet::default();
    let mut i = 0;
    while let Some((start, end)) = next_identifier(text, i) {
        set.insert(&text[start..end]);
        i = end;
    }
    set
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
    fn text_scan_breaks_on_non_ascii_non_identifier_characters() {
        let mut vars = FxHashSet::default();
        vars.insert("count");

        // NBSP and IDEOGRAPHIC SPACE are JavaScript whitespace, not identifier
        // characters, so `count` stands alone in each of these.
        assert!(text_contains_any_identifier("let\u{00a0}count = 0", &vars));
        assert!(text_contains_any_identifier("let\u{3000}count = 0", &vars));
        // IDEOGRAPHIC COMMA and EM DASH are punctuation, not identifier characters.
        assert!(text_contains_any_identifier("a\u{3001}count", &vars));
        assert!(text_contains_any_identifier("a\u{2014}count", &vars));
        // An emoji is neither ID_Start nor ID_Continue.
        assert!(text_contains_any_identifier("\u{1f600}count", &vars));
    }

    #[test]
    fn text_scan_keeps_unicode_identifiers_whole() {
        let mut vars = FxHashSet::default();
        vars.insert("count");
        vars.insert("名前");
        vars.insert("々");

        // `名` is ID_Start and `々` is ID_Continue, so these are single
        // identifiers that do not mention `count`.
        assert!(!text_contains_any_identifier("count名 + 1", &vars));
        assert!(!text_contains_any_identifier("名count + 1", &vars));
        assert!(!text_contains_any_identifier("count々 + 1", &vars));
        // …and a Unicode identifier is found under its own name.
        assert!(text_contains_any_identifier("名前 + 1", &vars));
        assert!(text_contains_any_identifier("let x = 々;", &vars));

        // Hebrew: every byte of `שם` is a 0xD7-led pair. Decoding per byte as
        // Latin-1 would read the lead byte as `×`, which is not an identifier
        // character at all.
        let mut hebrew = FxHashSet::default();
        hebrew.insert("שם");
        assert!(text_contains_any_identifier("let שם = 1", &hebrew));
        assert!(!text_contains_any_identifier("let שםx = 1", &hebrew));
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

    #[test]
    fn retain_matching_identifiers_breaks_on_non_ascii_whitespace() {
        let mut vars = vec!["count".to_string(), "総額".to_string()];
        text_retain_matching_identifiers("let\u{00a0}count = 総額", &mut vars);
        assert_eq!(vars, vec!["count".to_string(), "総額".to_string()]);

        // `count名` is one identifier, so plain `count` is not mentioned.
        let mut glued = vec!["count".to_string()];
        text_retain_matching_identifiers("count名 = 1", &mut glued);
        assert!(glued.is_empty());
    }
}
