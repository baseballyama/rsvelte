//! ClassDeclaration visitor.
//!
//! Analyzes class declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ClassDeclaration.js`.

use super::shared::utils::validate_identifier_name;
use super::{AstType, VisitorContext};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::{AnalysisError, warnings};

/// Visit a class declaration (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::ClassDeclaration { id, body, .. } = node {
        let arena = context.parse_arena;

        // Validate identifier name if using runes and the class has an id
        if context.analysis.runes
            && let Some(id_ref) = id
            && let JsNode::Identifier { name, .. } = arena.get_js_node(*id_ref)
            && let Some(binding_idx) = context
                .analysis
                .root
                .get_binding(name.as_str(), context.scope)
        {
            let binding = &context.analysis.root.bindings[binding_idx];
            validate_identifier_name(binding, None)?;
        }

        // Only a component's `<script module>` allows top-level module scope only;
        // upstream's `analyze_module` leaves `ast_type` null, so a standalone
        // `.svelte.(js|ts)` module gets the component depth instead.
        let allowed_depth =
            if context.ast_type == AstType::Module && !context.analysis.is_module_file {
                0
            } else {
                1
            };
        if context.function_depth > allowed_depth || context.in_reactive_declaration {
            let mut warning = warnings::perf_avoid_nested_class();
            warning.start = node.start();
            warning.end = node.end();
            context.emit_warning(warning);
        }

        // Visit the class body - ClassBody visitor still uses Value,
        // so we walk it via walk_js_node_typed which will convert as needed
        let body_node = arena.get_js_node(*body);
        super::script::walk_js_node_typed(body_node, context)?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::compiler::{CompileOptions, ModuleCompileOptions, compile, compile_module};

    fn module_warnings(source: &str) -> Vec<crate::compiler::Warning> {
        compile_module(
            source,
            ModuleCompileOptions {
                filename: Some("x.svelte.js".to_string()),
                ..Default::default()
            },
        )
        .expect("compile_module")
        .warnings
    }

    fn component_warnings(source: &str) -> Vec<crate::compiler::Warning> {
        compile(
            source,
            CompileOptions {
                filename: Some("Comp.svelte".to_string()),
                ..Default::default()
            },
        )
        .expect("compile")
        .warnings
    }

    fn nested_class(warnings: &[crate::compiler::Warning]) -> Vec<&crate::compiler::Warning> {
        warnings
            .iter()
            .filter(|w| w.code == "perf_avoid_nested_class")
            .collect()
    }

    #[test]
    fn standalone_module_allows_function_depth_1() {
        let warnings = module_warnings("describe('x', () => {\n\tclass A {}\n});\n");
        assert!(nested_class(&warnings).is_empty());
    }

    #[test]
    fn standalone_module_warns_at_function_depth_2() {
        let warnings = module_warnings(
            "describe('x', () => {\n\tit('y', () => {\n\t\tclass A {}\n\t});\n});\n",
        );
        assert_eq!(nested_class(&warnings).len(), 1);
    }

    #[test]
    fn component_script_module_warns_at_function_depth_1() {
        let warnings = component_warnings(
            "<script module>\n\tdescribe('x', () => {\n\t\tclass A {}\n\t});\n</script>\n",
        );
        assert_eq!(nested_class(&warnings).len(), 1);
    }

    #[test]
    fn component_instance_script_allows_the_component_scope() {
        let warnings = component_warnings("<script>\n\tclass A {}\n</script>\n");
        assert!(nested_class(&warnings).is_empty());
    }

    #[test]
    fn legacy_reactive_declaration_counts_as_nested_scope() {
        let warnings = component_warnings("<script>\n$: { class A {} }\n</script>\n");
        assert_eq!(nested_class(&warnings).len(), 1);
    }

    #[test]
    fn warning_carries_the_class_declaration_span() {
        let warnings = module_warnings(
            "describe('x', () => {\n\tit('y', () => {\n\t\tclass A {}\n\t});\n});\n",
        );
        let warning = nested_class(&warnings)[0];
        let start = warning.start.as_ref().expect("warning start");
        assert_eq!((start.line, start.column), (3, 2));
        assert!(warning.end.is_some());
    }
}
