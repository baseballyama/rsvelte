//! Client-side transformation orchestrator (Phase 3.12).
//!
//! This module contains the main transformation functions that orchestrate
//! the entire client-side code generation process.
//!
//! # Architecture
//!
//! Corresponds to `svelte/packages/svelte/src/compiler/phases/3-transform/client/transform-client.js`.
//!
//! ## Main Functions
//!
//! - `client_component()` - Transforms a component for client-side execution
//! - `client_module()` - Transforms a module (no template, just script)
//!
//! ## Transformation Flow
//!
//! 1. **Setup State** - Initialize transformation state with analysis results
//! 2. **Walk Module** - Transform module-level code (imports, exports, declarations)
//! 3. **Walk Instance** - Transform instance-level code (component logic)
//! 4. **Walk Template** - Transform template nodes (HTML, expressions, blocks)
//! 5. **Build Component** - Assemble final component function with init/update/render
//! 6. **Generate Output** - Create ESTree Program with all necessary imports and exports
//!
//! ## Visitor Pattern
//!
//! Uses a zimmerframe-style visitor pattern where:
//! - Each visitor can transform nodes and update state
//! - State is passed through the walk
//! - Visitors can call `next()` to continue traversal or transform children
//!
//! # Implementation Status
//!
//! This is a skeleton implementation that provides the basic structure for Phase 3.12.
//! It lays the groundwork for integrating all Phase 3.6-3.11 visitors.
//!
//! ## Current Status
//!
//! - ✅ Main function signatures (`client_component`, `client_module`)
//! - ✅ State initialization structure
//! - ✅ Component function building
//! - ✅ Import/export generation
//! - ✅ Store subscription handling
//! - ⏸️ Module/instance AST walking (needs JS AST visitor implementation)
//! - ⏸️ Template AST walking (needs Root AST from Phase 1)
//! - ⏸️ Full visitor integration (awaiting Phase 3.6-3.11 completion)
//!
//! ## Next Steps
//!
//! 1. Integrate all implemented visitors from Phase 3.6-3.11
//! 2. Implement JS AST walkers for module/instance code
//! 3. Connect template transformation to Root AST
//! 4. Add reactive statement handling
//! 5. Add binding groups
//! 6. Complete HMR support
//! 7. Complete custom element support

use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Transform a component analysis into a client-side ESTree program.
///
/// This is the main entry point for client-side code generation.
/// It orchestrates the transformation of module, instance, and template code,
/// and assembles them into a complete component function.
///
/// # Arguments
///
/// * `analysis` - The component analysis from Phase 2
/// * `options` - Compile options
///
/// # Returns
///
/// An ESTree Program ready for code generation, or an error if transformation fails.
///
/// # Reference
///
/// Corresponds to `client_component()` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/transform-client.js`.
#[allow(unused_variables)]
pub fn client_component(
    analysis: &ComponentAnalysis,
    options: &CompileOptions,
) -> Result<JsProgram, TransformError> {
    // Determine if we need to inject context ($.push/$.pop)
    // Reference: transform-client.js lines 280-306, 366-370
    // Only count exports that need getter/setter (reactive exports)
    // This includes: $state, $derived, prop, bindable_prop, or let/var declarations
    // Snippets and other non-reactive exports should NOT be counted
    let reactive_export_count = analysis
        .exports
        .iter()
        .filter(|export| {
            // Find the binding for this export
            if let Some(binding) = analysis
                .root
                .bindings
                .iter()
                .find(|b| b.name == export.name)
            {
                // Check if the binding is reactive (needs getter/setter in $$exports)
                matches!(
                    binding.kind,
                    BindingKind::State
                        | BindingKind::RawState
                        | BindingKind::Derived
                        | BindingKind::Prop
                        | BindingKind::BindableProp
                ) || matches!(
                    binding.declaration_kind,
                    crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Let
                        | crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Var
                )
            } else {
                // No binding found - this could be a module-level export (like a snippet)
                // These don't need context injection
                false
            }
        })
        .count();

    let should_inject_context = analysis.needs_context
        || !analysis.reactive_statements.is_empty()
        || reactive_export_count > 0;

    // Determine if we need $$props parameter
    // Reference: transform-client.js lines 393-399
    let should_inject_props = should_inject_context
        || analysis.needs_props
        || analysis.uses_props
        || analysis.uses_rest_props
        || analysis.uses_slots
        || !analysis.slot_names.is_empty();

    // =========================================================================
    // Build store subscription setup
    // Reference: transform-client.js lines 212-255
    // =========================================================================
    let store_bindings = collect_store_bindings(analysis);
    let needs_store_cleanup = !store_bindings.is_empty();

    // Build component function body
    let mut component_body = vec![];

    // Add $.push at the start if injecting context
    if should_inject_context {
        // $.push($$props, runes)
        // Reference: transform-client.js lines 434
        component_body.push(b::stmt(b::call(
            b::member_path("$.push"),
            vec![b::id("$$props"), b::boolean(analysis.runes)],
        )));
    }

    // Add store setup: const [$$stores, $$cleanup] = $.setup_stores()
    // This must be added after $.push but before store getter definitions
    if needs_store_cleanup {
        component_body.push(build_store_init());
    }

    // Add store getter functions: const $store = () => $.store_get(store, '$store', $$stores)
    for store_name in &store_bindings {
        component_body.push(build_store_getter(store_name));
    }

    // Add $.pop at the end if injecting context
    // Note: store cleanup ($$cleanup()) must come AFTER $.pop() if there are exports,
    // otherwise just call $.pop() directly
    if should_inject_context {
        if reactive_export_count > 0 && needs_store_cleanup {
            // var $$pop = $.pop($$exports)
            // Then later return $$pop after cleanup
            component_body.push(b::stmt(b::call(b::member_path("$.pop"), vec![])));
        } else {
            // $.pop()
            component_body.push(b::stmt(b::call(b::member_path("$.pop"), vec![])));
        }
    }

    // Add store cleanup: $$cleanup()
    // Reference: transform-client.js lines 448-454
    // The cleanup function should run as the very last thing
    if needs_store_cleanup {
        component_body.push(b::stmt(b::call(b::id("$$cleanup"), vec![])));
    }

    // Build component function parameters
    let params = if should_inject_props {
        vec![
            JsPattern::Identifier("$$anchor".into()),
            JsPattern::Identifier("$$props".into()),
        ]
    } else {
        vec![JsPattern::Identifier("$$anchor".into())]
    };

    // Create component function
    let component_fn = JsFunctionDeclaration {
        id: Some(analysis.name.clone().into()),
        params: params.into(),
        body: JsBlockStatement {
            body: component_body,
        },
        is_async: false,
        is_generator: false,
    };

    // Build program body
    let mut body = vec![];

    // Add feature flags
    if !analysis.runes {
        body.push(JsStatement::Import(JsImportDeclaration {
            specifiers: vec![],
            source: "svelte/internal/flags/legacy".into(),
        }));
    }

    if options.experimental.r#async {
        body.push(JsStatement::Import(JsImportDeclaration {
            specifiers: vec![],
            source: "svelte/internal/flags/async".into(),
        }));
    }

    // Add svelte/internal/client import
    body.push(JsStatement::Import(JsImportDeclaration {
        specifiers: vec![JsImportSpecifier::Namespace("$".into())],
        source: "svelte/internal/client".into(),
    }));

    // Export default component function
    body.push(JsStatement::ExportDefault(JsExportDefault {
        declaration: JsExportDefaultDeclaration::Function(component_fn),
    }));

    Ok(JsProgram { body })
}

/// Collect all store subscription bindings from the analysis.
///
/// Returns a list of store subscription names (e.g., `["$count", "$user"]`).
fn collect_store_bindings(analysis: &ComponentAnalysis) -> Vec<String> {
    let mut store_bindings = Vec::new();

    // Bindings are stored in the root scope
    for binding in &analysis.root.bindings {
        if binding.kind == BindingKind::StoreSub {
            store_bindings.push(binding.name.clone());
        }
    }

    store_bindings
}

/// Build the store initialization statement.
///
/// Generates: `const [$$stores, $$cleanup] = $.setup_stores()`
///
/// Reference: transform-client.js lines 232-235
fn build_store_init() -> JsStatement {
    // const [$$stores, $$cleanup] = $.setup_stores()
    b::var_decl_pattern(
        JsVariableKind::Const,
        b::array_pattern(vec![
            Some(b::id_pattern("$$stores")),
            Some(b::id_pattern("$$cleanup")),
        ]),
        Some(b::call(b::member_path("$.setup_stores"), vec![])),
    )
}

/// Build a store getter function.
///
/// Generates: `const $store = () => $.store_get(store, '$store', $$stores)`
///
/// # Arguments
///
/// * `store_sub_name` - The store subscription name (e.g., "$count")
///
/// Reference: transform-client.js lines 238-253
fn build_store_getter(store_sub_name: &str) -> JsStatement {
    // Extract the underlying store name: "$count" -> "count"
    let store_name = store_sub_name.strip_prefix('$').unwrap_or(store_sub_name);

    // Build: $.store_get(store, '$store', $$stores)
    let store_get = b::call(
        b::member_path("$.store_get"),
        vec![
            b::id(store_name),         // The store reference
            b::string(store_sub_name), // The subscription name for debugging
            b::id("$$stores"),         // The stores context
        ],
    );

    // Build: const $store = () => $.store_get(...)
    // We wrap in a thunk (arrow function) for lazy evaluation
    b::const_decl(store_sub_name, b::thunk(store_get))
}

/// Transform a module (no template, just script) for client-side execution.
///
/// Used for `.js` or `.ts` files that import Svelte runes but don't have a template.
///
/// # Arguments
///
/// * `analysis` - The module analysis from Phase 2
/// * `options` - Compile options
///
/// # Returns
///
/// An ESTree Program, or an error if transformation fails.
///
/// # Reference
///
/// Corresponds to `client_module()` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/transform-client.js`.
#[allow(unused_variables)]
pub fn client_module(
    analysis: &ComponentAnalysis,
    options: &CompileOptions,
) -> Result<JsProgram, TransformError> {
    let mut body = vec![];

    // Add svelte/internal/client import
    body.push(JsStatement::Import(JsImportDeclaration {
        specifiers: vec![JsImportSpecifier::Namespace("$".into())],
        source: "svelte/internal/client".into(),
    }));

    if analysis.tracing {
        body.push(JsStatement::Import(JsImportDeclaration {
            specifiers: vec![],
            source: "svelte/internal/flags/tracing".into(),
        }));
    }

    Ok(JsProgram { body })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::phases::phase3_transform::js_ast::codegen::generate;

    #[test]
    fn test_build_store_init() {
        let stmt = build_store_init();
        let code = generate_raw_statement(&stmt);

        assert!(code.contains("$$stores"));
        assert!(code.contains("$$cleanup"));
        assert!(code.contains("$.setup_stores()"));
    }

    #[test]
    fn test_build_store_getter() {
        let stmt = build_store_getter("$count");
        let code = generate_raw_statement(&stmt);

        assert!(code.contains("$count"));
        assert!(code.contains("$.store_get"));
        assert!(code.contains("count"));
        assert!(code.contains("$$stores"));
    }

    #[test]
    fn test_build_store_getter_extracts_name() {
        // Test that the store name is correctly extracted from $name
        let stmt = build_store_getter("$user");
        let code = generate_raw_statement(&stmt);

        // Should reference the underlying 'user' store
        assert!(code.contains("user"));
        // Should define the $user getter
        assert!(code.contains("$user"));
    }

    /// Helper to generate JS code from a statement for testing
    fn generate_raw_statement(stmt: &JsStatement) -> String {
        let program = JsProgram {
            body: vec![stmt.clone()],
        };
        generate(&program).unwrap()
    }

    #[test]
    fn test_collect_store_bindings_empty() {
        let options = crate::compiler::CompileOptions::default();
        let analysis =
            crate::compiler::phases::phase2_analyze::ComponentAnalysis::new("", &options);
        let store_bindings = collect_store_bindings(&analysis);
        assert!(store_bindings.is_empty());
    }

    #[test]
    fn test_store_init_and_getters_combined() {
        // Test that store init and getters can be generated together
        let init = build_store_init();
        let getter1 = build_store_getter("$count");
        let getter2 = build_store_getter("$user");

        let program = JsProgram {
            body: vec![init, getter1, getter2],
        };
        let code = generate(&program).unwrap();

        // Should contain all the necessary pieces
        assert!(code.contains("$.setup_stores()"));
        assert!(code.contains("$count"));
        assert!(code.contains("$user"));
        assert!(code.contains("$.store_get"));
    }
}
