//! RenderTag visitor.
//!
//! Analyzes {@render} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/RenderTag.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::snippets::is_resolved_snippet;
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

    let arena = context.parse_arena;

    // Unwrap optional chaining if present
    let expr_node = tag.expression.as_node_ref();
    let expression_node = match expr_node {
        JsNode::ChainExpression { expression, .. } => arena.get_js_node(*expression),
        _ => expr_node,
    };

    // Get the callee from the call expression
    let (callee_id, arguments_range) = match expression_node {
        JsNode::CallExpression {
            callee, arguments, ..
        }
        | JsNode::NewExpression {
            callee, arguments, ..
        } => (*callee, *arguments),
        _ => return Err(errors::render_tag_invalid_expression()),
    };
    let callee_node = arena.get_js_node(callee_id);
    let arguments = arena.get_js_children(arguments_range);

    // Check if the callee is an Identifier and look up its binding via the
    // lexical scope chain starting at the current template scope.
    // Mirrors upstream's `context.state.scope.get(callee.name)` which walks the
    // scope chain from the render site's own scope, not the merged root scope.
    // Using root.scope.declarations (flat global map) would wrongly "find"
    // an out-of-scope inner snippet and mark it as non-dynamic.
    let callee_name = match callee_node {
        JsNode::Identifier { name, .. } => Some(name.as_str()),
        _ => None,
    };
    let binding = callee_name.and_then(|name| {
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
    });

    // Determine if this render tag is dynamic
    // It's dynamic if:
    // - The callee is not a simple Identifier (e.g., MemberExpression like `state.value`)
    // - OR the binding is not a 'normal' variable (e.g., it's a prop, parameter, etc.)
    // In JavaScript: binding?.kind !== 'normal' - when binding is null, this returns true
    tag.metadata.dynamic = binding.is_none_or(|b| b.kind != BindingKind::Normal);

    let resolved = callee_name.is_some() && is_resolved_snippet(binding);

    // Track this render tag in the analysis (for Phase 3)
    // In JavaScript: context.state.analysis.snippet_renderers.set(node, resolved);
    // For now, we'll just mark uses_render_tags
    context.analysis.uses_render_tags = true;

    // Render tags inject dynamic content that can create arbitrary sibling
    // relationships. Phase 2 control flow analysis doesn't track render tag
    // content, so mark this as an opaque boundary for sibling detection.
    context.analysis.css.has_opaque_elements = true;

    // Upstream adds this site to `binding.initial`'s sites when the callee
    // resolves to a local snippet, to EVERY snippet when it resolves to nothing,
    // and to none at all when it resolves outside the component (a prop or an
    // import) — `2-analyze/index.js:847`.
    let site = crate::compiler::phases::phase2_analyze::types::CssRenderSite {
        parent_idx: context.current_parent_idx(),
        snippet_start: context.current_snippet_key(),
    };
    let snippet_key = binding.and_then(|b| {
        if b.initial_node_type.as_deref() == Some("SnippetBlock") {
            b.declaration_start
        } else {
            None
        }
    });
    let dom = &mut context.analysis.css.dom_structure;
    if let Some(key) = snippet_key {
        dom.snippet_render_sites.entry(key).or_default().push(site);
    } else if !resolved {
        dom.unresolved_render_sites.push(site);
    }

    // Validate arguments - no spread elements allowed
    for arg in arguments {
        if let JsNode::SpreadElement { start, end, .. } = arg {
            return Err(errors::render_tag_invalid_spread_argument().at(*start, *end));
        }
    }

    // Check for invalid .bind(), .apply(), .call() usage
    if let JsNode::MemberExpression { property, .. } = callee_node
        && let JsNode::Identifier { name, .. } = arena.get_js_node(*property)
        && matches!(name.as_str(), "bind" | "apply" | "call")
    {
        return Err(errors::render_tag_invalid_call_expression().at(tag.start, tag.end));
    }

    // Mark the subtree as dynamic (render tags inject dynamic content)
    mark_subtree_dynamic(&context.path);

    // Visit the callee expression and track its metadata
    super::shared::utils::walk_js_expression_node(
        callee_node,
        context,
        &mut tag.metadata.expression,
    )?;

    // Visit each argument and track its metadata
    for arg in arguments {
        let mut arg_metadata = ExpressionMetadata::default();
        super::shared::utils::walk_js_expression_node(arg, context, &mut arg_metadata)?;
        tag.metadata.arguments.push(arg_metadata);
    }

    Ok(())
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
