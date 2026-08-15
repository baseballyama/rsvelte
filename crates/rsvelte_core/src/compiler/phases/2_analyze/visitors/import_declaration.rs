//! ImportDeclaration visitor.
//!
//! Analyzes import declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ImportDeclaration.js`.

use super::super::errors;
use super::VisitorContext;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an import declaration (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::ImportDeclaration {
        start,
        end,
        source,
        specifiers,
        ..
    } = node
    {
        let arena = context.parse_arena;

        // Get the source string
        let source_str = match arena.get_js_node(*source) {
            JsNode::Literal {
                value: crate::ast::typed_expr::LiteralValue::String(s),
                ..
            } => s.as_str(),
            _ => "",
        };

        // In runes mode, check for forbidden imports
        if context.analysis.runes {
            if source_str.starts_with("svelte/internal") {
                return Err(errors::import_svelte_internal_forbidden().at(*start, *end));
            }

            if source_str == "svelte" {
                for specifier in arena.get_js_children(*specifiers) {
                    if let JsNode::ImportSpecifier {
                        start,
                        end,
                        imported,
                        ..
                    } = specifier
                        && let JsNode::Identifier { name, .. } = arena.get_js_node(*imported)
                        && (name.as_str() == "beforeUpdate" || name.as_str() == "afterUpdate")
                    {
                        return Err(
                            errors::runes_mode_invalid_import(name.as_str()).at(*start, *end)
                        );
                    }
                }
            }
        }

        // Validate imported names for dollar prefix
        for specifier in arena.get_js_children(*specifiers) {
            let local_name = match specifier {
                JsNode::ImportSpecifier { local, .. }
                | JsNode::ImportDefaultSpecifier { local, .. }
                | JsNode::ImportNamespaceSpecifier { local, .. } => {
                    let local_node = arena.get_js_node(*local);
                    if let JsNode::Identifier {
                        name, start, end, ..
                    } = local_node
                    {
                        Some((name.as_str(), *start, *end))
                    } else {
                        None
                    }
                }
                _ => None,
            };

            if let Some((name, start, end)) = local_name {
                if name == "$" {
                    return Err(errors::dollar_binding_invalid().at(start, end));
                }
                if name.starts_with('$') {
                    return Err(errors::dollar_prefix_invalid().at(start, end));
                }
            }
        }
    }

    Ok(())
}
