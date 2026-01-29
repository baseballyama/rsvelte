//! ExportNamedDeclaration visitor.
//!
//! Analyzes export named declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExportNamedDeclaration.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::errors;
use crate::compiler::phases::phase2_analyze::types::Export;
use serde_json::Value;

/// Visit an export named declaration.
///
/// Checks for `export { x as default }` pattern which is not allowed in components.
/// Also tracks exported bindings.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for `export { ... as default }` pattern
    // This is always an error in Svelte component scripts
    if let Some(specifiers) = node.get("specifiers").and_then(|s| s.as_array()) {
        for specifier in specifiers {
            // Check if exported name is "default"
            if let Some(exported) = specifier.get("exported") {
                let is_default =
                    if exported.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
                        exported.get("name").and_then(|n| n.as_str()) == Some("default")
                    } else {
                        // Literal (for string exports)
                        exported.get("value").and_then(|v| v.as_str()) == Some("default")
                    };

                if is_default {
                    return Err(errors::module_illegal_default_export());
                }
            }

            // Track the exported binding - only for instance script
            // Module script exports are handled differently (they're emitted directly)
            if context.ast_type == super::AstType::Instance {
                if let Some(local) = specifier.get("local") {
                    let local_name = local.get("name").and_then(|n| n.as_str()).unwrap_or("");
                    let exported_name = specifier
                        .get("exported")
                        .and_then(|e| e.get("name"))
                        .and_then(|n| n.as_str())
                        .unwrap_or(local_name);

                    if !local_name.is_empty() {
                        let export = Export {
                            name: local_name.to_string(),
                            alias: if exported_name != local_name {
                                Some(exported_name.to_string())
                            } else {
                                None
                            },
                        };
                        context.analysis.exports.push(export);
                    }
                }
            }
        }
    }

    // In runes mode, handle export declarations - only for instance script
    if context.analysis.runes
        && context.ast_type == super::AstType::Instance
        && let Some(declaration) = node.get("declaration")
    {
        let decl_type = declaration.get("type").and_then(|t| t.as_str());

        match decl_type {
            // export function foo() { ... }
            Some("FunctionDeclaration") => {
                if let Some(id) = declaration.get("id")
                    && let Some(name) = id.get("name").and_then(|n| n.as_str())
                {
                    context.analysis.exports.push(Export {
                        name: name.to_string(),
                        alias: None,
                    });
                }
            }
            // export class Foo { ... }
            Some("ClassDeclaration") => {
                if let Some(id) = declaration.get("id")
                    && let Some(name) = id.get("name").and_then(|n| n.as_str())
                {
                    context.analysis.exports.push(Export {
                        name: name.to_string(),
                        alias: None,
                    });
                }
            }
            // export const x = ...; or export let x = ...;
            Some("VariableDeclaration") => {
                let kind = declaration.get("kind").and_then(|k| k.as_str());
                // Only export const in runes mode
                if kind == Some("const")
                    && let Some(declarators) =
                        declaration.get("declarations").and_then(|d| d.as_array())
                {
                    for declarator in declarators {
                        // Extract identifiers from the pattern
                        extract_identifiers_and_add_exports(declarator.get("id"), context);
                    }
                }
                // export let is forbidden in runes mode (error is thrown elsewhere)
            }
            _ => {}
        }
    }

    Ok(())
}

/// Extract identifiers from a pattern (Identifier, ObjectPattern, ArrayPattern)
/// and add them to exports.
fn extract_identifiers_and_add_exports(pattern: Option<&Value>, context: &mut VisitorContext) {
    let pattern = match pattern {
        Some(p) => p,
        None => return,
    };

    let pattern_type = pattern.get("type").and_then(|t| t.as_str());

    match pattern_type {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                context.analysis.exports.push(Export {
                    name: name.to_string(),
                    alias: None,
                });
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for prop in properties {
                    let prop_type = prop.get("type").and_then(|t| t.as_str());
                    if prop_type == Some("Property") {
                        extract_identifiers_and_add_exports(prop.get("value"), context);
                    } else if prop_type == Some("RestElement") {
                        extract_identifiers_and_add_exports(prop.get("argument"), context);
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        extract_identifiers_and_add_exports(Some(elem), context);
                    }
                }
            }
        }
        Some("RestElement") => {
            extract_identifiers_and_add_exports(pattern.get("argument"), context);
        }
        Some("AssignmentPattern") => {
            extract_identifiers_and_add_exports(pattern.get("left"), context);
        }
        _ => {}
    }
}
