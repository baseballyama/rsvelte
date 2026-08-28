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

        // Upstream's `context.next()` visits the declaration identifier as well as
        // the body. Keep the same reference-list invariant as variable declarators:
        // the declaration itself occupies the first reference, so the unused-export
        // check can distinguish it from one real use.
        if let Some(id_ref) = id {
            super::script::walk_js_node_typed(arena.get_js_node(*id_ref), context)?;
        }

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

        emit_nested_class_warning(node, context);

        // Visit the class body - ClassBody visitor still uses Value,
        // so we walk it via walk_js_node_typed which will convert as needed
        let body_node = arena.get_js_node(*body);
        super::script::walk_js_node_typed(body_node, context)?;
    }

    Ok(())
}

/// Emit Svelte's nested-class performance warning.
///
/// Script traversal has a lexical `Scope` for every function. Template expressions use
/// the lightweight expression walker instead, where `function_depth` is relative to the
/// component scope. Add that implicit component depth so both paths implement upstream's
/// `scope.function_depth > allowed_depth` test.
pub(super) fn emit_nested_class_warning(node: &JsNode, context: &mut VisitorContext) {
    let allowed_depth = if context.ast_type == AstType::Module && !context.analysis.is_module_file {
        0
    } else {
        1
    };
    let mut scope_depth = if context.ast_type == AstType::Template {
        context.function_depth + 1
    } else {
        context.analysis.root.all_scopes[context.scope].function_depth
    };

    // Upstream walks a top-level legacy reactive statement twice: once while
    // collecting its dependencies with an implicit function depth, and once via
    // the unconditional `context.next()` at the end of LabeledStatement. Both
    // walks emit this warning. Keep the observable warning multiplicity without
    // repeating rsvelte's side-effecting statement walker.
    if context.in_reactive_declaration {
        scope_depth = scope_depth.max(allowed_depth + 1);
    }

    if scope_depth > allowed_depth {
        let count = if context.in_reactive_declaration {
            2
        } else {
            1
        };
        for _ in 0..count {
            let mut warning = warnings::perf_avoid_nested_class();
            warning.start = node.start();
            warning.end = node.end();
            context.emit_warning(warning);
        }
    }
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
    fn component_instance_script_warns_inside_a_function() {
        let warnings = component_warnings(
            "<script>\n\tconst value = (() => { class A {} return A; })();\n</script>\n",
        );
        assert_eq!(nested_class(&warnings).len(), 1);
    }

    #[test]
    fn component_template_expression_warns_inside_functions() {
        let warnings = component_warnings(
            "<script>let enabled = true;</script>\n<p>{(() => { class T {} return new T(); })()}</p>\n{#if enabled}<p>{(() => { class U {} return new U(); })()}</p>{/if}\n",
        );
        assert_eq!(nested_class(&warnings).len(), 2);
    }

    #[test]
    fn legacy_reactive_declaration_counts_as_nested_scope() {
        let warnings = component_warnings("<script>\n$: { class A {} }\n</script>\n");
        assert_eq!(nested_class(&warnings).len(), 2);
    }

    #[test]
    fn legacy_reactive_iife_counts_as_nested_scope() {
        let warnings = component_warnings(
            "<script>\nexport let v;\nlet k;\n$: k = (() => { class T extends /ab/.constructor { m() { return v; } } return new T().m(); })();\n</script>\n",
        );
        assert_eq!(nested_class(&warnings).len(), 2);
    }

    #[test]
    fn nested_legacy_label_only_warns_once_for_the_class() {
        let warnings =
            component_warnings("<script>\nfunction f() { $: { class A {} } }\n</script>\n");
        assert_eq!(nested_class(&warnings).len(), 1);
    }

    #[test]
    fn module_legacy_label_does_not_make_a_top_level_class_nested() {
        let warnings = component_warnings("<script module>\n$: { class A {} }\n</script>\n");
        assert!(nested_class(&warnings).is_empty());
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
