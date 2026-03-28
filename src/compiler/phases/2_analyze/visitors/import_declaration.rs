//! ImportDeclaration visitor.
//!
//! Analyzes import declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ImportDeclaration.js`.

use super::super::errors;
use super::VisitorContext;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit an import declaration.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Get the source (module path) of the import
    let source = node
        .get("source")
        .and_then(|s| s.get("value"))
        .and_then(|v| v.as_str())
        .unwrap_or("");

    // In runes mode, check for forbidden imports
    if context.analysis.runes {
        // Check for svelte/internal imports
        if source.starts_with("svelte/internal") {
            return Err(errors::import_svelte_internal_forbidden());
        }

        // Check for beforeUpdate/afterUpdate imports from 'svelte'
        if source == "svelte"
            && let Some(specifiers) = node.get("specifiers").and_then(|s| s.as_array())
        {
            for specifier in specifiers {
                if specifier.get("type").and_then(|t| t.as_str()) == Some("ImportSpecifier") {
                    let imported = specifier.get("imported");
                    if let Some(imported) = imported
                        && imported.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                        && let Some(name) = imported.get("name").and_then(|n| n.as_str())
                        && (name == "beforeUpdate" || name == "afterUpdate")
                    {
                        return Err(errors::runes_mode_invalid_import(name));
                    }
                }
            }
        }
    }

    // Validate imported names for dollar prefix
    if let Some(specifiers) = node.get("specifiers").and_then(|s| s.as_array()) {
        for specifier in specifiers {
            // Get the local name (the name used in the component)
            let local_name = specifier
                .get("local")
                .and_then(|l| l.get("name"))
                .and_then(|n| n.as_str());

            if let Some(name) = local_name {
                // Check for bare '$'
                if name == "$" {
                    return Err(errors::dollar_binding_invalid());
                }

                // Check for names starting with '$'
                if name.starts_with('$') {
                    return Err(errors::dollar_prefix_invalid());
                }
            }
        }
    }

    Ok(())
}

/// Visit an import declaration (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::ImportDeclaration {
        source, specifiers, ..
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
                return Err(errors::import_svelte_internal_forbidden());
            }

            if source_str == "svelte" {
                for specifier in arena.get_js_children(*specifiers) {
                    if let JsNode::ImportSpecifier { imported, .. } = specifier
                        && let JsNode::Identifier { name, .. } = arena.get_js_node(*imported)
                        && (name.as_str() == "beforeUpdate" || name.as_str() == "afterUpdate")
                    {
                        return Err(errors::runes_mode_invalid_import(name.as_str()));
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
                    if let JsNode::Identifier { name, .. } = local_node {
                        Some(name.as_str())
                    } else {
                        None
                    }
                }
                _ => None,
            };

            if let Some(name) = local_name {
                if name == "$" {
                    return Err(errors::dollar_binding_invalid());
                }
                if name.starts_with('$') {
                    return Err(errors::dollar_prefix_invalid());
                }
            }
        }
    }

    Ok(())
}
