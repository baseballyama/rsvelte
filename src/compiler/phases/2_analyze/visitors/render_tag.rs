//! RenderTag visitor.
//!
//! Analyzes {@render} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/RenderTag.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::validate_opening_tag;
use crate::ast::template::{ExpressionMetadata, RenderTag, TemplateNode};
use crate::ast::typed_expr::JsNode;
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

    // Unwrap optional chaining if present
    let expr_node = tag.expression.as_node();
    let expression = unwrap_optional_node(&expr_node);

    // Get the callee from the call expression
    let callee = expression
        .callee()
        .ok_or_else(errors::render_tag_invalid_expression)?;

    // Check if the callee is an Identifier and look up its binding
    let binding = if callee.node_type() == Some("Identifier") {
        if let Some(name) = callee.name() {
            context
                .analysis
                .root
                .scope
                .declarations
                .get(name)
                .map(|&idx| &context.analysis.root.bindings[idx])
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
    let arguments = expression.call_arguments();
    for arg in arguments {
        if arg.node_type() == Some("SpreadElement") {
            return Err(errors::render_tag_invalid_spread_argument());
        }
    }

    // Check for invalid .bind(), .apply(), .call() usage
    if callee.node_type() == Some("MemberExpression")
        && let Some(property) = callee.property()
        && property.node_type() == Some("Identifier")
        && let Some(name) = property.name()
        && matches!(name, "bind" | "apply" | "call")
    {
        return Err(errors::render_tag_invalid_call_expression());
    }

    // Mark the subtree as dynamic (render tags inject dynamic content)
    mark_subtree_dynamic(&context.path);

    // Visit the callee expression and track its metadata
    // context.visit(callee, { ...context.state, expression: node.metadata.expression });
    // For now, we'll use walk_js_expression to populate the callee metadata
    let callee_value = callee.to_value();
    super::shared::utils::walk_js_expression(&callee_value, context, &mut tag.metadata.expression)?;

    // Visit each argument and track its metadata
    for arg in arguments {
        let mut arg_metadata = ExpressionMetadata::default();
        let arg_value = arg.to_value();
        super::shared::utils::walk_js_expression(&arg_value, context, &mut arg_metadata)?;
        tag.metadata.arguments.push(arg_metadata);
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

/// Unwrap optional chaining (ChainExpression) to get the inner JsNode.
///
/// Corresponds to `unwrap_optional` in Svelte's utils/ast.js.
fn unwrap_optional_node(node: &JsNode) -> &JsNode {
    if node.node_type() == Some("ChainExpression") {
        node.expression_node().unwrap_or(node)
    } else {
        node
    }
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

    // It's resolved if it's an import, prop, or bindable prop
    matches!(
        binding.declaration_kind,
        crate::compiler::phases::phase2_analyze::DeclarationKind::Import
    ) || matches!(
        binding.kind,
        BindingKind::Prop | BindingKind::RestProp | BindingKind::BindableProp
    )
    // TODO: Also check if binding.initial.type === 'SnippetBlock'
    // This requires tracking the initial node type, which we don't currently do
}

/// Get a string representation of a template node type.
fn node_type_string(node: &TemplateNode) -> String {
    match node {
        TemplateNode::Text(_) => "Text".to_string(),
        TemplateNode::Comment(_) => "Comment".to_string(),
        TemplateNode::ExpressionTag(_) => "ExpressionTag".to_string(),
        TemplateNode::HtmlTag(_) => "HtmlTag".to_string(),
        TemplateNode::ConstTag(_) => "ConstTag".to_string(),
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
