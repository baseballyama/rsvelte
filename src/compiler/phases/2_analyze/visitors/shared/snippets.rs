//! Snippet utilities.
//!
//! Functions for working with snippets.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/snippets.js`.

use super::super::super::{AnalysisError, Binding, BindingKind, DeclarationKind};
use super::super::VisitorContext;
use crate::ast::template::SnippetBlock;

/// Validate a snippet definition and register the snippet name in the
/// analysis so that downstream checks (e.g. `snippet_invalid_export`) can
/// recognise it.
///
/// Same-name "duplicate" detection is intentionally not done here: the
/// official compiler's `SnippetBlock.js` does not reject sibling snippets
/// with the same name (the conflict it does raise — `snippet_conflict` —
/// applies only to a `children` snippet alongside other component
/// content, and is handled at the component level). Re-declaration in
/// the surrounding scope is rejected by `declare_binding` already.
pub fn validate_snippet(
    snippet: &SnippetBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    if let Some(name) = get_snippet_name(snippet) {
        context.analysis.template.snippets.insert(name);
    }

    Ok(())
}

/// Get the name of a snippet from its expression.
pub fn get_snippet_name(snippet: &SnippetBlock) -> Option<String> {
    // The snippet name is in the expression field (always an Identifier)
    snippet.expression.identifier_name().map(String::from)
}

/// Returns `true` if a binding unambiguously resolves to a specific
/// snippet declaration, or is external to the current component.
///
/// Corresponds to `is_resolved_snippet` in snippets.js.
///
/// # Arguments
///
/// * `binding` - The binding to check (can be None)
///
/// # Returns
///
/// Returns `true` if:
/// - The binding is None (external to component)
/// - The binding is an import
/// - The binding is a prop, rest_prop, or bindable_prop
/// - The binding's initial value is a SnippetBlock
pub fn is_resolved_snippet(binding: Option<&Binding>) -> bool {
    match binding {
        None => true, // External to component
        Some(binding) => {
            // Check if it's an import
            if binding.declaration_kind == DeclarationKind::Import {
                return true;
            }

            // Check if it's a prop type
            if matches!(
                binding.kind,
                BindingKind::Prop | BindingKind::RestProp | BindingKind::BindableProp
            ) {
                return true;
            }

            // Check if the initial value is a snippet block. The scope builder
            // sets `initial_node_type = "SnippetBlock"` when declaring the
            // binding for `{#snippet name(...)}`, mirroring the official
            // compiler's `binding.initial.type === 'SnippetBlock'` check.
            binding.initial_node_type.as_deref() == Some("SnippetBlock")
        }
    }
}
