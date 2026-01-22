//! ExpressionStatement visitor.
//!
//! Analyzes expression statements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExpressionStatement.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::{
    AnalysisError, BindingKind, DeclarationKind, warnings,
};
use serde_json::Value;

/// Visit an expression statement.
///
/// This visitor detects legacy component creation patterns:
/// `new Component({ target: ... })` where Component is imported from a .svelte file.
/// This pattern is deprecated in favor of `mount(Component, { target: ... })`.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Warn on `new Component({ target: ... })` if imported from a `.svelte` file
    if let Some(expression) = node.get("expression") {
        // Check if this is a NewExpression
        if expression.get("type").and_then(|t| t.as_str()) == Some("NewExpression") {
            // Check the callee is an Identifier
            if let Some(callee) = expression.get("callee")
                && callee.get("type").and_then(|t| t.as_str()) == Some("Identifier")
            {
                // Check arguments length is 1
                if let Some(arguments) = expression.get("arguments")
                    && let Some(args_array) = arguments.as_array()
                    && args_array.len() == 1
                {
                    // Check the argument is an ObjectExpression
                    if let Some(arg) = args_array.first()
                        && arg.get("type").and_then(|t| t.as_str()) == Some("ObjectExpression")
                    {
                        // Check if properties contain a property with key "target"
                        let has_target_property = arg
                            .get("properties")
                            .and_then(|p| p.as_array())
                            .map(|props| {
                                props.iter().any(|p| {
                                    p.get("type").and_then(|t| t.as_str()) == Some("Property")
                                        && p.get("key")
                                            .and_then(|k| k.get("type"))
                                            .and_then(|t| t.as_str())
                                            == Some("Identifier")
                                        && p.get("key")
                                            .and_then(|k| k.get("name"))
                                            .and_then(|n| n.as_str())
                                            == Some("target")
                                })
                            })
                            .unwrap_or(false);

                        if has_target_property
                            && let Some(callee_name) = callee.get("name").and_then(|n| n.as_str())
                            && let Some(&binding_idx) =
                                context.analysis.root.scope.declarations.get(callee_name)
                        {
                            let binding = &context.analysis.root.bindings[binding_idx];

                            // Check if it's a normal import binding
                            if binding.kind == BindingKind::Normal
                                && binding.declaration_kind == DeclarationKind::Import
                            {
                                // Check if initial value exists (should be the ImportDeclaration JSON)
                                if let Some(ref initial_str) = binding.initial {
                                    // Parse the initial value as JSON to check the import source
                                    if let Ok(initial_json) =
                                        serde_json::from_str::<Value>(initial_str)
                                    {
                                        // Check if source ends with .svelte
                                        let is_svelte_import = initial_json
                                            .get("source")
                                            .and_then(|s| s.get("value"))
                                            .and_then(|v| v.as_str())
                                            .is_some_and(|src| src.ends_with(".svelte"));

                                        if is_svelte_import {
                                            // Check if it's a default import
                                            let is_default_import = initial_json
                                                .get("specifiers")
                                                .and_then(|s| s.as_array())
                                                .is_some_and(|specs| {
                                                    specs.iter().any(|spec| {
                                                        spec.get("type").and_then(|t| t.as_str())
                                                            == Some("ImportDefaultSpecifier")
                                                            && spec
                                                                .get("local")
                                                                .and_then(|l| l.get("name"))
                                                                .and_then(|n| n.as_str())
                                                                == Some(callee_name)
                                                    })
                                                });

                                            if is_default_import {
                                                // Emit the warning
                                                context
                                                    .analysis
                                                    .warnings
                                                    .push(warnings::legacy_component_creation());
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(())
}
