//! Server-side svelte:boundary visitor.
//!
//! Mirrors the post-5.53 upstream
//! `svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/SvelteBoundary.js`
//! (commit 2661513cd, "feat: allow error boundaries to work on the server").

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::{Attribute, Fragment, SvelteElement, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_svelte_boundary(
        &mut self,
        boundary: &SvelteElement,
    ) -> Result<(), TransformError> {
        // Look for failed snippet/attribute.
        let failed_snippet = boundary.fragment.nodes.iter().find_map(|node| {
            if let TemplateNode::SnippetBlock(snippet) = node
                && snippet.expression.is_identifier("failed")
            {
                return Some(snippet);
            }
            None
        });
        let failed_attribute = boundary
            .attributes
            .iter()
            .find(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "failed"));

        // Look for pending attribute / snippet.
        let pending_attribute = boundary
            .attributes
            .iter()
            .find(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "pending"));
        let pending_snippet = boundary.fragment.nodes.iter().find_map(|node| {
            if let TemplateNode::SnippetBlock(snippet) = node
                && snippet.expression.is_identifier("pending")
            {
                return Some(snippet);
            }
            None
        });

        // Build the props expression used by `$$renderer.boundary({...}, ...)` when
        // we wrap (i.e. failed snippet/attribute present). Returns `None` if no
        // wrapping is needed (no failed branch — children render directly).
        let failed_props: Option<String> = if let Some(Attribute::Attribute(attr)) =
            failed_attribute
            && failed_snippet.is_none()
        {
            // failed_attribute is set and there's no failed_snippet to take
            // precedence. Build `{ failed: <expr> }` (or `{ failed }` for the
            // bare `{failed}` shorthand).
            let attr_expr = extract_attribute_expression(&attr.value, &self.source);
            match attr_expr {
                Some(expr) if expr == "failed" => Some("{ failed }".to_string()),
                Some(expr) => Some(format!("{{ failed: {} }}", expr)),
                None => Some("{ failed }".to_string()),
            }
        } else if failed_snippet.is_some() {
            // The snippet is named `failed`; it'll be hoisted by the normal
            // snippet flow. The props expression always uses shorthand.
            Some("{ failed }".to_string())
        } else {
            None
        };

        // Filter out failed/pending snippets from the children fragment.
        let children_nodes: Vec<TemplateNode> = boundary
            .fragment
            .nodes
            .iter()
            .filter(|node| {
                if let TemplateNode::SnippetBlock(snippet) = node {
                    let name = snippet.expression.identifier_name().unwrap_or("");
                    name != "failed" && name != "pending"
                } else {
                    true
                }
            })
            .cloned()
            .collect();

        let children_fragment = Fragment {
            nodes: children_nodes,
            ..boundary.fragment.clone()
        };

        // Process the failed snippet via the normal snippet pipeline so it
        // participates in hoisting (mirrors upstream
        // `context.visit(failed_snippet, context.state)`).
        //
        // For boundary-nested snippets, upstream relies on `path.length > 1`
        // forcing `can_hoist=false`. Our analyze phase tracks depth counters
        // and doesn't bump them for `<svelte:boundary>`, so the snippet would
        // get hoisted to module scope. As a server-transform-side workaround,
        // emit boundary-local `failed` snippets directly as a SnippetFunction
        // OutputPart in the parent scope (right before the boundary call).
        if let Some(snippet) = failed_snippet {
            self.generate_snippet_block(snippet)?;
            // Pull the just-added snippet out of the hoistable list and emit
            // it inline (component-scoped) instead, matching upstream.
            if let Some(idx) = self
                .snippets
                .iter()
                .rposition(|s| s.name == "failed" && s.can_hoist)
            {
                let snippet_def = self.snippets.remove(idx);
                self.output_parts.push(OutputPart::SnippetFunction {
                    name: snippet_def.name,
                    params: snippet_def.params,
                    body: snippet_def.body_parts,
                    dev: self.dev,
                });
            }
        }

        // When the boundary children move into a `$$renderer.boundary(...)`
        // callback (failed branch present), the children run in a new function
        // scope, so await expressions don't need the `$.save(...)` save dance.
        // Toggle `in_block_body` for the children-body generation only.
        let has_failed_wrap = failed_props.is_some();
        let prev_in_block_body = self.in_block_body;
        if has_failed_wrap {
            self.in_block_body = true;
        }

        // Three cases for the children body — pending snippet, pending attribute,
        // or no pending. Pending attribute special-cases the nullish-evaluable
        // expression to emit an if/else (matches upstream).
        let result: Result<(), TransformError> = if let Some(snippet) = pending_snippet {
            // children_body = [block_open_else, pending_body, block_close]
            let body = self.generate_fragment_body_parts(&snippet.body)?;
            self.output_parts.push(OutputPart::SvelteBoundary {
                body,
                is_pending: true,
                failed_props,
            });
            Ok(())
        } else if let Some(Attribute::Attribute(pending_attr)) = pending_attribute
            && let Some(expr) = extract_attribute_expression(&pending_attr.value, &self.source)
        {
            // Conservative: assume the attribute expression may evaluate to
            // null/undefined. Emit the if/else (mirrors upstream's
            // `is_pending_attr_nullish && !pending_snippet` branch). We don't
            // yet have a static "is_defined" oracle in rsvelte's scope
            // evaluation, so the if/else covers all observed fixtures
            // including `<svelte:boundary {pending}>` shorthand.
            //
            // For the always-defined case upstream just emits the pending
            // call inline with block_open_else markers; we emit the
            // equivalent unconditional if/else, which is still semantically
            // correct.
            let pending_body = vec![OutputPart::RawStatement(format!("{}($$renderer);\n", expr))];
            let main_body = self.generate_fragment_body_parts(&children_fragment)?;
            self.output_parts
                .push(OutputPart::SvelteBoundaryWithPending {
                    pending_expr: expr,
                    pending_body,
                    main_body,
                    failed_props,
                });
            Ok(())
        } else {
            // No pending — children render directly between block_open /
            // block_close.
            let body = self.generate_fragment_body_parts(&children_fragment)?;
            self.output_parts.push(OutputPart::SvelteBoundary {
                body,
                is_pending: false,
                failed_props,
            });
            Ok(())
        };

        self.in_block_body = prev_in_block_body;
        result
    }
}

/// Extract the JS expression source for an attribute value like `{expr}` or
/// `name={expr}`. Returns `None` for static / multi-part values.
fn extract_attribute_expression(
    value: &crate::ast::template::AttributeValue,
    source: &str,
) -> Option<String> {
    use crate::ast::template::{AttributeValue, AttributeValuePart};
    match value {
        AttributeValue::Sequence(parts) => {
            if parts.len() == 1
                && let AttributeValuePart::ExpressionTag(expr_tag) = &parts[0]
            {
                let start = expr_tag.expression.start().unwrap_or(0) as usize;
                let end = expr_tag.expression.end().unwrap_or(0) as usize;
                if end > start && end <= source.len() {
                    return Some(source[start..end].trim().to_string());
                }
            }
            None
        }
        AttributeValue::Expression(expr_tag) => {
            let start = expr_tag.expression.start().unwrap_or(0) as usize;
            let end = expr_tag.expression.end().unwrap_or(0) as usize;
            if end > start && end <= source.len() {
                Some(source[start..end].trim().to_string())
            } else {
                None
            }
        }
        _ => None,
    }
}
