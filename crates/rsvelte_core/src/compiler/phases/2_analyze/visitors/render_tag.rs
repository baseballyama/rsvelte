//! RenderTag visitor.
//!
//! Analyzes {@render} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/RenderTag.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::validate_opening_tag;
use crate::ast::template::{ExpressionMetadata, RenderTag, TemplateNode};
use crate::compiler::phases::phase2_analyze::{AnalysisError, BindingKind, errors};

/// Visit a render tag.
pub fn visit(tag: &mut RenderTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate the opening tag syntax
    validate_opening_tag(tag.start as usize, &context.analysis.source, '@')?;

    // Store the path to this node
    tag.metadata.path = context
        .path
        .iter()
        .map(|node| node_type_string(node))
        .collect();

    // Unwrap optional chaining if present (use JSON to avoid arena dependency)
    let expr_json = tag.expression.as_json();
    let expression_json =
        if expr_json.get("type").and_then(|t| t.as_str()) == Some("ChainExpression") {
            expr_json.get("expression").unwrap_or(expr_json)
        } else {
            expr_json
        };

    // Get the callee from the call expression
    let callee_json = expression_json
        .get("callee")
        .ok_or_else(errors::render_tag_invalid_expression)?;

    // Check if the callee is an Identifier and look up its binding via the
    // lexical scope chain starting at the current template scope.
    // Mirrors upstream's `context.state.scope.get(callee.name)` which walks the
    // scope chain from the render site's own scope, not the merged root scope.
    // Using root.scope.declarations (flat global map) would wrongly "find"
    // an out-of-scope inner snippet and mark it as non-dynamic.
    let callee_type = callee_json.get("type").and_then(|t| t.as_str());
    let callee_name = callee_json.get("name").and_then(|n| n.as_str());
    let binding = if callee_type == Some("Identifier") {
        if let Some(name) = callee_name {
            context
                .analysis
                .root
                .get_binding(name, context.scope)
                .filter(|&idx| {
                    // The scope builder merges all child-scope declarations into
                    // all_scopes[0] for backward compatibility.  A raw get_binding walk
                    // therefore finds bindings declared in *descendant* scopes (e.g. `y`
                    // declared inside snippet x's body) when the lookup starts from an
                    // ancestor scope (e.g. the enclosing <div>).  Filter those out:
                    // only accept a binding if its declared scope is an ancestor of (or
                    // equal to) the current render-site scope — mirroring upstream
                    // `scope.get(name)` which traverses `parent` links, never children.
                    let declared_scope = context.analysis.root.bindings[idx].scope_index;
                    context
                        .analysis
                        .root
                        .is_scope_ancestor_of(declared_scope, context.scope)
                })
                .map(|idx| &context.analysis.root.bindings[idx])
        } else {
            None
        }
    } else {
        None
    };

    // Determine if this render tag is dynamic
    // It's dynamic if:
    // - The callee is not a simple Identifier (e.g., MemberExpression like `state.value`)
    // - OR the binding is not a 'normal' variable (e.g., it's a prop, parameter, etc.)
    // In JavaScript: binding?.kind !== 'normal' - when binding is null, this returns true
    tag.metadata.dynamic = binding.is_none_or(|b| b.kind != BindingKind::Normal);

    // Determine if we can unambiguously resolve this to a specific snippet declaration
    // It's resolved if:
    // - No binding (external/import)
    // - Binding is an import
    // - Binding is a prop/rest_prop/bindable_prop
    // - Binding's initial value is a SnippetBlock
    let _resolved = is_resolved_snippet(binding);

    // If the callee is an identifier that unambiguously references a local snippet, track it
    if let Some(_binding) = binding {
        // Check if the binding's initial node is a SnippetBlock
        // For now, we'll track snippet indices separately
        // TODO: Link to actual snippet blocks when we have a proper index mapping
    }

    // Track this render tag in the analysis (for Phase 3)
    // In JavaScript: context.state.analysis.snippet_renderers.set(node, resolved);
    // For now, we'll just mark uses_render_tags
    context.analysis.uses_render_tags = true;

    // Render tags inject dynamic content that can create arbitrary sibling
    // relationships. Phase 2 control flow analysis doesn't track render tag
    // content, so mark this as an opaque boundary for sibling detection.
    context.analysis.css.has_opaque_elements = true;

    // Validate arguments - no spread elements allowed
    let arguments_json = expression_json.get("arguments").and_then(|a| a.as_array());
    if let Some(args) = arguments_json {
        for arg in args {
            if arg.get("type").and_then(|t| t.as_str()) == Some("SpreadElement") {
                return Err(errors::render_tag_invalid_spread_argument());
            }
        }
    }

    // Check for invalid .bind(), .apply(), .call() usage
    if callee_type == Some("MemberExpression")
        && let Some(property) = callee_json.get("property")
        && property.get("type").and_then(|t| t.as_str()) == Some("Identifier")
        && let Some(name) = property.get("name").and_then(|n| n.as_str())
        && matches!(name, "bind" | "apply" | "call")
    {
        return Err(errors::render_tag_invalid_call_expression());
    }

    // Mark the subtree as dynamic (render tags inject dynamic content)
    mark_subtree_dynamic(&context.path);

    // Visit the callee expression and track its metadata
    super::shared::utils::walk_js_expression(callee_json, context, &mut tag.metadata.expression)?;

    // Visit each argument and track its metadata
    if let Some(args) = arguments_json {
        for arg in args {
            let mut arg_metadata = ExpressionMetadata::default();
            super::shared::utils::walk_js_expression(arg, context, &mut arg_metadata)?;
            tag.metadata.arguments.push(arg_metadata);
        }
    }

    Ok(())
}

/// Alias for visit function.
pub fn visit_render_tag(
    tag: &mut RenderTag,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(tag, context)
}

/// Check if a binding unambiguously resolves to a specific snippet declaration,
/// or is external to the current component.
///
/// Corresponds to `is_resolved_snippet` in Svelte's visitors/shared/snippets.js.
fn is_resolved_snippet(binding: Option<&crate::compiler::phases::phase2_analyze::Binding>) -> bool {
    if binding.is_none() {
        return true; // No binding = external/global
    }

    let binding = binding.unwrap();

    // It's resolved if it's an import, prop, bindable prop, or directly bound
    // to a `{#snippet ...}` block in the same component.
    matches!(
        binding.declaration_kind,
        crate::compiler::phases::phase2_analyze::DeclarationKind::Import
    ) || matches!(
        binding.kind,
        BindingKind::Prop | BindingKind::RestProp | BindingKind::BindableProp
    ) || binding.initial_node_type.as_deref() == Some("SnippetBlock")
}

/// Get a string representation of a template node type.
fn node_type_string(node: &TemplateNode) -> String {
    match node {
        TemplateNode::Text(_) => "Text".to_string(),
        TemplateNode::Comment(_) => "Comment".to_string(),
        TemplateNode::ExpressionTag(_) => "ExpressionTag".to_string(),
        TemplateNode::HtmlTag(_) => "HtmlTag".to_string(),
        TemplateNode::ConstTag(_) => "ConstTag".to_string(),
        TemplateNode::DeclarationTag(_) => "DeclarationTag".to_string(),
        TemplateNode::DebugTag(_) => "DebugTag".to_string(),
        TemplateNode::RenderTag(_) => "RenderTag".to_string(),
        TemplateNode::AttachTag(_) => "AttachTag".to_string(),
        TemplateNode::IfBlock(_) => "IfBlock".to_string(),
        TemplateNode::EachBlock(_) => "EachBlock".to_string(),
        TemplateNode::AwaitBlock(_) => "AwaitBlock".to_string(),
        TemplateNode::KeyBlock(_) => "KeyBlock".to_string(),
        TemplateNode::SnippetBlock(_) => "SnippetBlock".to_string(),
        TemplateNode::RegularElement(e) => format!("RegularElement({})", e.name),
        TemplateNode::Component(c) => format!("Component({})", c.name),
        TemplateNode::SvelteElement(_) => "SvelteElement".to_string(),
        TemplateNode::SvelteComponent(_) => "SvelteComponent".to_string(),
        TemplateNode::SvelteSelf(_) => "SvelteSelf".to_string(),
        TemplateNode::SvelteFragment(_) => "SvelteFragment".to_string(),
        TemplateNode::SvelteHead(_) => "SvelteHead".to_string(),
        TemplateNode::SvelteBody(_) => "SvelteBody".to_string(),
        TemplateNode::SvelteWindow(_) => "SvelteWindow".to_string(),
        TemplateNode::SvelteDocument(_) => "SvelteDocument".to_string(),
        TemplateNode::SvelteBoundary(_) => "SvelteBoundary".to_string(),
        TemplateNode::SlotElement(_) => "SlotElement".to_string(),
        TemplateNode::TitleElement(_) => "TitleElement".to_string(),
        TemplateNode::SvelteOptions(_) => "SvelteOptions".to_string(),
    }
}
