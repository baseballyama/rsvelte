//! Client-side code generation.
//!
//! Generates JavaScript code for browser execution using the visitor pattern.
//!
//! This module mirrors the official Svelte compiler structure at
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/`.

mod state;
pub mod transform_client;
pub mod transform_template;
pub mod types;
pub mod utils;
mod visitor;
pub mod visitors;

use std::rc::Rc;
use std::sync::LazyLock;

use regex::Regex;

use super::TransformError;
use super::js_ast::{
    builders::{self as b},
    generate,
    nodes::{
        JsBlockStatement, JsExportDefault, JsExportDefaultDeclaration, JsFunctionDeclaration,
        JsImportDeclaration, JsImportSpecifier, JsPattern, JsProgram, JsStatement,
    },
};
use crate::ast::template::Root;
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;

// Import new visitor system types
use types::{ComponentClientTransformState, ComponentContext, TransformOptions, TransformResult};

// Cached regular expressions for performance
static REGEX_STATE_DERIVED_VAR: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?:let|const)\s+(\w+)\s*=\s*\$(?:state|derived)\s*\(").unwrap());

/// Transform a component analysis into client-side JavaScript.
///
/// # Arguments
///
/// * `analysis` - The component analysis from Phase 2 (includes pre-extracted script content)
/// * `ast` - The parsed AST from Phase 1 (to avoid re-parsing)
/// * `_source` - The original source code (for backward compatibility)
/// * `options` - Compile options
pub fn transform_client(
    analysis: &ComponentAnalysis,
    ast: &Root,
    _source: &str,
    options: &CompileOptions,
) -> Result<String, TransformError> {
    transform_client_with_visitors(analysis, ast, options)
}

/// Transform using the visitor-based system.
///
/// This function implements the visitor pattern that mirrors the official Svelte compiler.
/// It uses `ComponentContext`, `ComponentClientTransformState`, and the fragment visitor.
///
/// # Architecture
///
/// The transformation follows these steps:
/// 1. Initialize `ComponentClientTransformState` with analysis data
/// 2. Create `ComponentContext` with the visitor dispatch function
/// 3. Call `fragment()` visitor to transform the template
/// 4. Build the final `JsProgram` with imports, component function, and exports
/// 5. Generate JavaScript string via `js_ast::generate()`
///
/// # Reference
///
/// Corresponds to `client_component()` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/transform-client.js`
#[inline(never)]
fn transform_client_with_visitors(
    analysis: &ComponentAnalysis,
    ast: &Root,
    options: &CompileOptions,
) -> Result<String, TransformError> {
    use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment;

    // Create initial node (anchor) for the transformation
    let initial_node = b::id("$$anchor");

    // Create transform options as Rc for efficient sharing
    let transform_options = Rc::new(TransformOptions {
        dev: options.dev,
        preserve_whitespace: options.preserve_whitespace,
        preserve_comments: options.preserve_comments,
        ..Default::default()
    });

    // Create the component client transform state
    let state = ComponentClientTransformState::new(
        &analysis.root.scope,
        &analysis.root,
        analysis,
        initial_node,
        Rc::clone(&transform_options),
    );

    // Create the component context with a dummy visit function
    // The actual visiting is done via ComponentContext::visit_node which dispatches
    // based on node type - the visit function pointer is not actually used
    let mut context = ComponentContext::new(state, |_, _, _| TransformResult::None);

    // Set up state transformers ($.get, $.set wrappers for $state variables)
    // This must be called before processing the template so that state variable
    // references in event handlers get properly transformed
    use crate::compiler::phases::phase3_transform::client::visitors::shared::declarations::add_state_transformers;
    add_state_transformers(&mut context);

    // Call the fragment visitor to transform the template
    // This is the root fragment of the component, so is_root_fragment=true
    let template_body = fragment(&ast.fragment, &mut context, true);

    // Collect results from state
    let hoisted_statements = std::mem::take(&mut context.state.hoisted);
    let module_level_snippets = std::mem::take(&mut context.state.module_level_snippets);
    let instance_level_snippets = std::mem::take(&mut context.state.instance_level_snippets);
    let events = std::mem::take(&mut context.state.events);

    // Collect store subscription bindings and generate setup code
    // Reference: transform-client.js lines 211-254
    let mut store_setup: Vec<JsStatement> = Vec::new();
    let mut needs_store_cleanup = false;

    for binding in &analysis.root.bindings {
        if matches!(binding.kind, BindingKind::StoreSub) {
            let store_sub_name = &binding.name; // e.g., "$store"
            let store_name = &store_sub_name[1..]; // e.g., "store"

            // First store_sub binding - add setup_stores call
            if store_setup.is_empty() {
                needs_store_cleanup = true;
                // const [$$stores, $$cleanup] = $.setup_stores();
                store_setup.push(JsStatement::Raw(
                    "const [$$stores, $$cleanup] = $.setup_stores();".to_string(),
                ));
            }

            // Generate: const $store = () => $.store_get(store, "$store", $$stores);
            let getter_code = format!(
                "const {} = () => $.store_get({}, \"{}\", $$stores);",
                store_sub_name, store_name, store_sub_name
            );
            // Insert getter BEFORE setup_stores (reverse order, will be unshifted)
            store_setup.insert(0, JsStatement::Raw(getter_code));
        }
    }

    // Determine if we need context injection ($.push/$.pop)
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

    let should_inject_context = options.dev
        || analysis.needs_context
        || !analysis.reactive_statements.is_empty()
        || reactive_export_count > 0
        || needs_store_cleanup; // Store subscriptions need context

    // Determine if we need $$props parameter
    let should_inject_props = should_inject_context
        || analysis.needs_props
        || analysis.uses_props
        || analysis.uses_rest_props
        || analysis.uses_slots
        || !analysis.slot_names.is_empty();

    // Build component function body
    // Pre-allocate for typical component body size
    let mut component_body: Vec<JsStatement> = Vec::with_capacity(32);

    // Add $.push at the start if injecting context
    if should_inject_context {
        let mut push_args = vec![
            b::id("$$props"),
            b::literal(super::js_ast::nodes::JsLiteral::Boolean(analysis.runes)),
        ];
        if options.dev {
            push_args.push(b::id(&analysis.name));
        }
        component_body.push(b::stmt(b::call(b::member_path("$.push"), push_args)));
    }

    // Add store setup (getters and setup_stores) right after $.push
    // Reference: transform-client.js line 379
    component_body.extend(store_setup);

    // Add CSS styles injection if needed
    if analysis.css.has_css && analysis.inject_styles {
        // $.append_styles($$anchor, $$css)
        component_body.push(b::stmt(b::call(
            b::member_path("$.append_styles"),
            vec![b::id("$$anchor"), b::id("$$css")],
        )));
    }

    // Add instance-level snippets
    component_body.extend(instance_level_snippets);

    // Add instance script content (transformed runes)
    // This includes $state, $derived, $effect, $props transformations
    if let Some(ref content) = analysis.instance_script_content {
        let transformed_script =
            transform_instance_script_for_visitors(&content.raw, analysis, options.dev);
        // Only add if there's actual content (not just whitespace)
        let trimmed = transformed_script.trim();
        if !trimmed.is_empty() {
            // Parse transformed script as raw JavaScript statement
            component_body.push(JsStatement::Raw(trimmed.to_string()));
        }
    }

    // Add $.init() for legacy (non-runes) components that need context
    // Reference: transform-client.js line 381-382
    // IMPORTANT: This must come AFTER instance script content, not before
    if !analysis.runes && analysis.needs_context {
        let init_args = if analysis.immutable {
            vec![b::literal(super::js_ast::nodes::JsLiteral::Boolean(true))]
        } else {
            vec![]
        };
        component_body.push(b::stmt(b::call(b::member_path("$.init"), init_args)));
    }

    // Generate $$exports object if there are reactive exports
    // Only include exports that need getter/setter (reactive exports)
    // Reference: transform-client.js lines 280-306
    if reactive_export_count > 0 {
        let reactive_exports: Vec<_> = analysis
            .exports
            .iter()
            .filter(|export| {
                if let Some(binding) = analysis
                    .root
                    .bindings
                    .iter()
                    .find(|b| b.name == export.name)
                {
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
                    false
                }
            })
            .collect();

        let mut exports_code = String::from("var $$exports = {\n");
        for (i, export) in reactive_exports.iter().enumerate() {
            let name = &export.name;
            // Getter: return propName()
            exports_code.push_str(&format!(
                "\tget {}() {{\n\t\treturn {}();\n\t}}",
                name, name
            ));
            exports_code.push_str(",\n");
            // Setter: propName($$value)
            exports_code.push_str(&format!(
                "\tset {}($$value) {{\n\t\t{}($$value);\n\t}}",
                name, name
            ));
            if i < reactive_exports.len() - 1 {
                exports_code.push_str(",\n");
            } else {
                exports_code.push('\n');
            }
        }
        exports_code.push_str("};");
        component_body.push(JsStatement::Raw(exports_code));
    }

    // Add template body statements
    component_body.extend(template_body.body);

    // Add $.pop at the end if injecting context
    // Reference: transform-client.js lines 433-454
    if should_inject_context {
        if reactive_export_count > 0 {
            if needs_store_cleanup {
                // var $$pop = $.pop($$exports);
                component_body.push(JsStatement::Raw(
                    "var $$pop = $.pop($$exports);".to_string(),
                ));
            } else {
                // return $.pop($$exports)
                component_body.push(JsStatement::Return(
                    super::js_ast::nodes::JsReturnStatement {
                        argument: Some(Box::new(b::call(
                            b::member_path("$.pop"),
                            vec![b::id("$$exports")],
                        ))),
                    },
                ));
            }
        } else {
            component_body.push(b::stmt(b::call(b::member_path("$.pop"), vec![])));
        }
    }

    // Add $$cleanup() at the very end if store subscriptions exist
    // Reference: transform-client.js lines 448-454
    if needs_store_cleanup {
        component_body.push(b::stmt(b::call(b::id("$$cleanup"), vec![])));

        if reactive_export_count > 0 {
            // return $$pop;
            component_body.push(JsStatement::Return(
                super::js_ast::nodes::JsReturnStatement {
                    argument: Some(Box::new(b::id("$$pop"))),
                },
            ));
        }
    }

    // Build component function parameters
    let params = if should_inject_props {
        vec![
            JsPattern::Identifier("$$anchor".to_string()),
            JsPattern::Identifier("$$props".to_string()),
        ]
    } else {
        vec![JsPattern::Identifier("$$anchor".to_string())]
    };

    // Create component function declaration
    let component_fn = JsFunctionDeclaration {
        id: Some(analysis.name.clone()),
        params,
        body: JsBlockStatement {
            body: component_body,
        },
        is_async: false,
        is_generator: false,
    };

    // Build program body
    // Pre-allocate for typical program structure
    let mut body: Vec<JsStatement> = Vec::with_capacity(16);

    // Add disclose-version import (always first)
    body.push(JsStatement::Import(JsImportDeclaration {
        specifiers: vec![],
        source: "svelte/internal/disclose-version".to_string(),
    }));

    // Add feature flag imports
    if !analysis.runes {
        body.push(JsStatement::Import(JsImportDeclaration {
            specifiers: vec![],
            source: "svelte/internal/flags/legacy".to_string(),
        }));
    }

    if options.experimental.r#async {
        body.push(JsStatement::Import(JsImportDeclaration {
            specifiers: vec![],
            source: "svelte/internal/flags/async".to_string(),
        }));
    }

    if analysis.tracing {
        body.push(JsStatement::Import(JsImportDeclaration {
            specifiers: vec![],
            source: "svelte/internal/flags/tracing".to_string(),
        }));
    }

    // Add svelte/internal/client import (namespace import as $)
    body.push(JsStatement::Import(JsImportDeclaration {
        specifiers: vec![JsImportSpecifier::Namespace("$".to_string())],
        source: "svelte/internal/client".to_string(),
    }));

    // Add module script content (imports and module-level declarations)
    // This comes from <script context="module"> and includes component imports
    if let Some(ref module_content) = analysis.module_script_content {
        let trimmed = module_content.raw.trim();
        if !trimmed.is_empty() {
            body.push(JsStatement::Raw(trimmed.to_string()));
        }
    }

    // Extract and add imports from instance script
    // These are hoisted to module level (after svelte imports)
    if let Some(ref instance_content) = analysis.instance_script_content {
        let (script_imports, _) = extract_imports(&instance_content.raw);
        for import_line in script_imports {
            body.push(JsStatement::Raw(import_line));
        }
    }

    // Add module-level snippets (before templates)
    body.extend(module_level_snippets);

    // Add hoisted statements (template declarations, etc.)
    body.extend(hoisted_statements);

    // Add CSS declaration if needed
    if analysis.css.has_css && analysis.inject_styles {
        let hash = b::string(analysis.css.hash.clone());
        // TODO: Generate actual CSS code
        let code = b::string("/* CSS code placeholder */".to_string());
        body.push(b::const_decl(
            "$$css",
            b::object(vec![
                super::js_ast::nodes::JsObjectMember::Property(super::js_ast::nodes::JsProperty {
                    key: super::js_ast::nodes::JsPropertyKey::Identifier("hash".to_string()),
                    value: Box::new(hash),
                    kind: super::js_ast::nodes::JsPropertyKind::Init,
                    shorthand: false,
                    computed: false,
                }),
                super::js_ast::nodes::JsObjectMember::Property(super::js_ast::nodes::JsProperty {
                    key: super::js_ast::nodes::JsPropertyKey::Identifier("code".to_string()),
                    value: Box::new(code),
                    kind: super::js_ast::nodes::JsPropertyKind::Init,
                    shorthand: false,
                    computed: false,
                }),
            ]),
        ));
    }

    // Export default component function
    body.push(JsStatement::ExportDefault(JsExportDefault {
        declaration: JsExportDefaultDeclaration::Function(component_fn),
    }));

    // Add event delegation if there are delegated events
    if !events.is_empty() {
        let event_literals: Vec<super::js_ast::nodes::JsExpr> =
            events.iter().map(|name| b::string(name.clone())).collect();
        body.push(b::stmt(b::call(
            b::member_path("$.delegate"),
            vec![b::array(event_literals)],
        )));
    }

    // Create the program
    let program = JsProgram { body };

    // Generate JavaScript code from the program
    generate(&program).map_err(TransformError::CodeGen)
}

// ============================================================================
// Script Transformation Functions
// ============================================================================

/// Extract import statements from script content.
/// Returns (imports, rest_of_script).
fn extract_imports(script: &str) -> (Vec<String>, String) {
    let mut imports = Vec::new();
    let mut rest = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("import ") {
            imports.push(line.to_string());
        } else {
            rest.push(line.to_string());
        }
    }

    (imports, rest.join("\n"))
}

/// Extract local reactive variable names from script content.
/// These are variables declared with $state() or $derived() inside functions
/// (like inside $effect callbacks) that aren't tracked in analysis.root.bindings.
fn extract_local_reactive_vars(script: &str) -> Vec<String> {
    let mut vars = Vec::new();

    // Pattern: let/const varname = $state(...) or let/const varname = $derived(...)
    // Uses cached regex for performance
    for cap in REGEX_STATE_DERIVED_VAR.captures_iter(script) {
        if let Some(name) = cap.get(1) {
            vars.push(name.as_str().to_string());
        }
    }

    vars
}

/// Extract variable names that are initialized with $state() containing an object or array.
/// These variables will be transformed to $.proxy() and should NOT have $.get() wrapping
/// when accessing their properties.
fn extract_proxy_vars(script: &str) -> Vec<String> {
    let mut proxy_vars = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();

        // Look for patterns like: let/const varname = $state({ ... }) or $state([ ... ])
        if let Some(state_pos) = trimmed.find("$state(") {
            // Check if this is a declaration
            if trimmed.starts_with("let ") || trimmed.starts_with("const ") {
                // Extract variable name (before the = sign)
                if let Some(eq_pos) = trimmed.find('=') {
                    let decl_part = trimmed[..eq_pos].trim();
                    let var_name = decl_part.split_whitespace().last().unwrap_or("").trim();

                    // Check if the $state() argument starts with { or [
                    let state_start = state_pos + 7; // after "$state("
                    if state_start < trimmed.len() {
                        let after_state = trimmed[state_start..].trim();
                        if after_state.starts_with('{') || after_state.starts_with('[') {
                            proxy_vars.push(var_name.to_string());
                        }
                    }
                }
            }
        }
    }

    proxy_vars
}

/// Transform instance script content for the visitor-based code generation.
/// Handles $state, $derived, $effect, $props transformations.
fn transform_instance_script_for_visitors(
    script: &str,
    analysis: &ComponentAnalysis,
    dev: bool,
) -> String {
    if script.is_empty() {
        return String::new();
    }

    // First, transform class fields with $state and $derived
    let script = transform_class_fields_client(script);

    // Extract imports from script (they will be hoisted separately)
    let (_script_imports, script_rest) = extract_imports(&script);

    // Collect state variables from analysis for $.get() wrapping
    let mut state_vars: Vec<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| {
            matches!(
                b.kind,
                BindingKind::State | BindingKind::RawState | BindingKind::Derived
            )
        })
        .map(|b| b.name.clone())
        .collect();

    // Also scan for local $state and $derived declarations in the script
    // These are variables declared inside functions (like inside $effect callbacks)
    // that aren't tracked in analysis.root.bindings
    let local_reactive_vars = extract_local_reactive_vars(&script_rest);
    state_vars.extend(local_reactive_vars);

    // Collect proxy vars - variables initialized with $state({ ... }) or $state([ ... ])
    // These are converted to $.proxy() and don't need $.get() wrapping for property access
    let proxy_vars = extract_proxy_vars(&script_rest);

    // Collect rest_prop variable names (from `let props = $props()`)
    let rest_prop_vars: Vec<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| matches!(b.kind, BindingKind::RestProp))
        .map(|b| b.name.clone())
        .collect();

    // Collect non-reactive state vars (never reassigned - don't need $.get/$.set)
    // Note: We only consider BindingKind::State here, NOT RawState.
    // RawState ($state.raw) always needs $.get() because its purpose is to track
    // value changes without deep reactivity - it still needs reactivity at the top level.
    //
    // This matches the official Svelte compiler's is_state_source logic:
    // (!analysis.immutable || binding.reassigned || analysis.accessors)
    // We do NOT check b.mutated here - mutation doesn't require $.get() wrapping.
    let non_reactive_state_vars: Vec<String> = if analysis.immutable {
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| {
                matches!(b.kind, BindingKind::State) && !b.reassigned && !analysis.accessors
            })
            .map(|b| b.name.clone())
            .collect()
    } else {
        Vec::new()
    };

    // Collect $state.raw() variables - these never need proxy wrapping
    let raw_state_vars: Vec<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| matches!(b.kind, BindingKind::RawState))
        .map(|b| b.name.clone())
        .collect();

    // Collect store subscription variable names ($count, $store, etc.)
    let store_sub_vars: Vec<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| matches!(b.kind, BindingKind::StoreSub))
        .map(|b| b.name.clone())
        .collect();

    // Check for legacy mode (export let)
    let has_legacy_export_let = script_rest.lines().any(|line| {
        let trimmed = line.trim();
        trimmed.starts_with("export let ") || trimmed.starts_with("export let\t")
    });

    // Collect props that are "sources" (reassigned or mutated - need $.prop() declarations)
    // Read-only props should be accessed directly via $$props.propName
    let prop_source_vars: Vec<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| {
            matches!(
                b.kind,
                BindingKind::Prop | BindingKind::BindableProp | BindingKind::RestProp
            ) && (b.reassigned || b.mutated)
        })
        .map(|b| b.name.clone())
        .collect();

    // Collect exported names from analysis
    let exported_names: Vec<String> = analysis.exports.iter().map(|e| e.name.clone()).collect();

    let mut result = String::new();

    // Track if we're inside a multi-line export block
    let mut in_export_block = false;

    // Process script lines
    for line in script_rest.lines() {
        let trimmed = line.trim();

        // Skip empty lines
        if trimmed.is_empty() {
            continue;
        }

        // Skip import statements (already extracted)
        if trimmed.starts_with("import ") {
            continue;
        }

        // Skip export { ... } statements (will be handled via $$exports object)
        if trimmed.starts_with("export {") {
            in_export_block = !trimmed.contains('}');
            continue;
        }
        if in_export_block {
            if trimmed.contains('}') {
                in_export_block = false;
            }
            continue;
        }

        // Handle legacy export let declarations
        if has_legacy_export_let && trimmed.starts_with("export let ") {
            let transformed = transform_export_let(trimmed);
            result.push_str(&transformed);
            result.push('\n');
            continue;
        }

        // Transform runes ($state, $derived, $effect, $props)
        let transformed = transform_client_runes_with_skip_and_state(
            trimmed,
            &non_reactive_state_vars,
            &state_vars,
            &non_reactive_state_vars,
            &prop_source_vars,
            &exported_names,
            &proxy_vars,
            dev,
        );

        // Skip empty transformations (e.g., read-only $props() with no defaults)
        if transformed.trim().is_empty() {
            continue;
        }

        // Transform state variable assignments to $.set()
        let transformed = transform_state_assignments(
            &transformed,
            &state_vars,
            &non_reactive_state_vars,
            &proxy_vars,
            &raw_state_vars,
        );

        // Transform store subscription assignments to $.store_set()
        let transformed = transform_store_assignments_client(&transformed, &store_sub_vars);

        // Wrap state variable reads in $.get() for general expressions
        // This handles cases like: console.log('init ' + double)
        // where `double` is a $derived variable that needs to be read with $.get()
        // BUT only if this is NOT a declaration line (let/const/var) - those are already
        // handled by transform_client_runes_with_skip_and_state
        let transformed = if !transformed.trim_start().starts_with("let ")
            && !transformed.trim_start().starts_with("const ")
            && !transformed.trim_start().starts_with("var ")
        {
            wrap_state_vars_in_expr(
                &transformed,
                &state_vars,
                &non_reactive_state_vars,
                &proxy_vars,
            )
        } else {
            transformed
        };

        // Transform rest_prop member access to $$props (only in runes mode)
        let transformed = if analysis.runes && !rest_prop_vars.is_empty() {
            transform_rest_prop_member_access(&transformed, &rest_prop_vars)
        } else {
            transformed
        };

        result.push_str(&transformed);
        result.push('\n');
    }

    result
}

// ============================================================================
// Rune Transformation Functions
// ============================================================================

/// Transform runes for client-side usage with skip and state variable handling.
#[allow(clippy::too_many_arguments)]
fn transform_client_runes_with_skip_and_state(
    line: &str,
    skip_state_vars: &[String],
    state_vars: &[String],
    non_reactive_vars: &[String],
    prop_source_vars: &[String],
    exported_names: &[String],
    proxy_vars: &[String],
    dev: bool,
) -> String {
    let mut result = line.to_string();

    // Transform $state.snapshot(x) to $.snapshot(x)
    if result.contains("$state.snapshot(") {
        result = result.replace("$state.snapshot(", "$.snapshot(");
    }

    // Transform $state.raw(x) to $.state(x)
    if result.contains("$state.raw(") {
        result = result.replace("$state.raw(", "$.state(");
    }

    // Transform $state.frozen(x) to $.state(x)
    if result.contains("$state.frozen(") {
        result = result.replace("$state.frozen(", "$.state(");
    }

    // Transform $state(x) to $.state(x) for primitives or $.proxy(x) for objects
    if let Some(pos) = result.find("$state(") {
        // Check if this is a declaration
        if result[..pos].contains("let ") || result[..pos].contains("const ") {
            // Extract variable name
            let before_eq = result[..pos].trim();
            let before_equals = if let Some(eq_pos) = before_eq.rfind('=') {
                before_eq[..eq_pos].trim()
            } else {
                before_eq
            };
            let var_name = before_equals.split_whitespace().last().unwrap_or("").trim();

            // Check if we should skip this state variable
            let state_start = pos + 7; // after "$state("
            if let Some(content_end) = find_matching_paren(&result[state_start..]) {
                let content = &result[state_start..state_start + content_end];
                let trimmed_content = content.trim();
                let is_object_or_array =
                    trimmed_content.starts_with('{') || trimmed_content.starts_with('[');

                if skip_state_vars.contains(&var_name.to_string()) {
                    // Variable is not reassigned, so doesn't need $.state() wrapping
                    // But we still need $.proxy() if the value might return an object
                    let needs_proxy = is_object_or_array || expression_needs_proxy(trimmed_content);

                    if needs_proxy {
                        // Wrap with $.proxy() for deep reactivity
                        result = format!(
                            "{}$.proxy({}){}",
                            &result[..pos],
                            content,
                            &result[state_start + content_end + 1..]
                        );
                    } else {
                        // Primitives - just extract the value
                        let extracted_value = if trimmed_content.is_empty() {
                            "undefined"
                        } else {
                            content
                        };
                        result = format!(
                            "{}{}{}",
                            &result[..pos],
                            extracted_value,
                            &result[state_start + content_end + 1..]
                        );
                    }
                } else if is_object_or_array || expression_needs_proxy(trimmed_content) {
                    // Objects/arrays or function calls need $.proxy() for deep reactivity
                    // AND we need $.state() for the reactivity tracking (since variable is reassigned)
                    // Expected: $.state($.proxy([...]))
                    result = format!(
                        "{}$.state($.proxy({})){}",
                        &result[..pos],
                        content,
                        &result[state_start + content_end + 1..]
                    );
                } else {
                    // Primitives that ARE reassigned need $.state()
                    result = result.replacen("$state(", "$.state(", 1);
                }
            } else {
                // Fallback for unparseable content
                result = result.replacen("$state(", "$.state(", 1);
            }
        }
    }

    // Transform $derived.by() to $.derived() - must be processed BEFORE $derived()
    // $derived.by() already has a callback, so pass it directly
    // But we need to wrap state variable references inside the callback with $.get()
    if let Some(pos) = result.find("$derived.by(") {
        let derived_start = pos + 12; // after "$derived.by("
        if let Some(content_end) = find_matching_paren(&result[derived_start..]) {
            let content = &result[derived_start..derived_start + content_end];
            // Wrap state variables inside the callback with $.get()
            let wrapped_content =
                wrap_state_vars_in_expr(content, state_vars, non_reactive_vars, proxy_vars);
            let new_derived = format!("$.derived({})", wrapped_content);
            result = format!(
                "{}{}{}",
                &result[..pos],
                new_derived,
                &result[derived_start + content_end + 1..]
            );
        } else {
            result = result.replace("$derived.by(", "$.derived(");
        }
    }

    // Transform $derived(x) to $.derived(() => x) or $.async_derived() for async
    // Handle destructuring patterns specially
    if let Some(pos) = result.find("$derived(")
        && !result[..pos].ends_with("$") // Skip if already transformed to $.derived()
        && (result[..pos].contains("let ") || result[..pos].contains("const "))
    {
        // Check if this is a destructuring pattern
        let before_derived = result[..pos].trim();
        let has_destructuring = before_derived.contains('{') || before_derived.contains('[');

        if has_destructuring {
            // Handle destructuring pattern for $derived
            if let Some(transformed) =
                transform_derived_destructuring(&result, state_vars, non_reactive_vars, proxy_vars)
            {
                return transformed;
            }
        }

        // Find the content inside $derived(...)
        let derived_start = pos + 9; // after "$derived("
        if let Some(content_end) = find_matching_paren(&result[derived_start..]) {
            let content = &result[derived_start..derived_start + content_end];
            // Wrap in arrow function if not already a function
            let trimmed = content.trim();
            if !trimmed.starts_with("()") && !trimmed.starts_with("function") {
                // Check if the derived expression contains await (async derived)
                // Note: We need to check for await NOT inside an inner async function
                let contains_direct_await = contains_direct_await_in_expression(trimmed);

                // Wrap state variables inside the derived expression with $.get()
                let wrapped_content =
                    wrap_state_vars_in_expr(content, state_vars, non_reactive_vars, proxy_vars);

                let new_derived = if contains_direct_await {
                    // For async derived: $.async_derived(async () => expr)
                    // The expression may have await calls that need to be preserved
                    format!("$.async_derived(async () => {})", wrapped_content)
                } else {
                    format!("$.derived(() => {})", wrapped_content)
                };

                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    new_derived,
                    &result[derived_start + content_end + 1..]
                );
            } else {
                // The content is already a function - check if it's async
                // $derived(async () => { ... }) should become $.derived(() => async () => { ... })
                // Note: returns the async function, NOT invokes it
                if trimmed.starts_with("async ") {
                    // Wrap: $.derived(() => async () => {...})
                    let wrapped_content =
                        wrap_state_vars_in_expr(content, state_vars, non_reactive_vars, proxy_vars);
                    let new_derived = format!("$.derived(() => {})", wrapped_content);
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        new_derived,
                        &result[derived_start + content_end + 1..]
                    );
                } else {
                    result = result.replacen("$derived(", "$.derived(", 1);
                }
            }
        } else {
            result = result.replacen("$derived(", "$.derived(", 1);
        }
    }

    // Transform $effect(x) to $.user_effect(x)
    if result.contains("$effect(") {
        result = result.replace("$effect(", "$.user_effect(");
    }

    // Transform $inspect(...) - in non-dev mode, remove the entire call
    // In dev mode, transform to $.inspect(...)
    if let Some(pos) = result.find("$inspect(") {
        if dev {
            result = result.replacen("$inspect(", "$.inspect(", 1);
        } else {
            // In non-dev mode, remove the entire $inspect(...) call
            // Find matching closing paren
            let inspect_start = pos + 9; // after "$inspect("
            if let Some(content_end) = find_matching_paren(&result[inspect_start..]) {
                // Check if the $inspect call is a statement on its own
                let before = result[..pos].trim();
                let after = result[inspect_start + content_end + 1..].trim();

                // If the line is just the $inspect call, return empty or semicolon
                if before.is_empty() && (after.is_empty() || after == ";") {
                    return String::new(); // Will be filtered out as empty transformation
                } else {
                    // Remove just the $inspect(...) part but keep other code on the line
                    result = format!(
                        "{}{}",
                        &result[..pos],
                        &result[inspect_start + content_end + 1..]
                    );
                }
            }
        }
    }

    // Transform $props() destructuring to $.prop() calls (only for source props)
    if result.contains("$props()")
        && let Some(transformed) =
            transform_props_destructuring(&result, prop_source_vars, exported_names)
    {
        return transformed;
    }

    result
}

/// Transform `export let x = value` to `let x = $.prop($$props, 'x', 12, value)`.
/// Transform `$derived()` with destructuring patterns.
fn transform_derived_destructuring(
    line: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
    proxy_vars: &[String],
) -> Option<String> {
    let trimmed = line.trim();
    let decl_keyword = if trimmed.starts_with("let ") {
        "let"
    } else if trimmed.starts_with("const ") {
        "const"
    } else {
        return None;
    };
    let derived_pos = trimmed.find("$derived(")?;
    let pattern_start = decl_keyword.len() + 1;
    let eq_pos = trimmed[..derived_pos].rfind('=')?;
    let pattern = trimmed[pattern_start..eq_pos].trim();
    let source_start = derived_pos + 9;
    let source_end = find_matching_paren(&trimmed[source_start..])?;
    let source = trimmed[source_start..source_start + source_end].trim();
    let source_is_identifier = source
        .chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$');
    let mut declarations = Vec::new();
    let mut array_counter = 0;
    let wrapped_source = wrap_state_vars_in_expr(source, state_vars, non_reactive_vars, proxy_vars);
    let base_expr = if source_is_identifier {
        wrapped_source.clone()
    } else {
        declarations.push(format!("$$d = $.derived(() => {})", wrapped_source));
        "$.get($$d)".to_string()
    };
    process_derived_destructuring_pattern(
        pattern,
        &base_expr,
        &mut declarations,
        &mut array_counter,
    )?;
    if declarations.is_empty() {
        return None;
    }
    Some(format!("let {};", declarations.join(",\n\t")))
}

fn process_derived_destructuring_pattern(
    pattern: &str,
    base_expr: &str,
    declarations: &mut Vec<String>,
    array_counter: &mut usize,
) -> Option<()> {
    let pattern = pattern.trim();
    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        process_derived_object_pattern(inner, base_expr, declarations, array_counter)
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        process_derived_array_pattern(inner, base_expr, declarations, array_counter)
    } else {
        None
    }
}

fn process_derived_object_pattern(
    inner: &str,
    base_expr: &str,
    declarations: &mut Vec<String>,
    array_counter: &mut usize,
) -> Option<()> {
    let properties = split_derived_object_properties(inner);
    for prop in properties {
        let prop = prop.trim();
        if prop.is_empty() {
            continue;
        }
        if let Some(rest_name) = prop.strip_prefix("...") {
            let rest_name = rest_name.trim();
            declarations.push(format!(
                "{} = $.derived(() => {{ /* TODO: rest element */ }})",
                rest_name
            ));
            continue;
        }
        if let Some(colon_pos) = find_derived_property_colon(prop) {
            let key = prop[..colon_pos].trim();
            let value_pattern = prop[colon_pos + 1..].trim();
            let prop_access = format!("{}.{}", base_expr, key);
            if value_pattern.starts_with('[') || value_pattern.starts_with('{') {
                process_derived_destructuring_pattern(
                    value_pattern,
                    &prop_access,
                    declarations,
                    array_counter,
                )?;
            } else {
                declarations.push(format!(
                    "{} = $.derived(() => {})",
                    value_pattern, prop_access
                ));
            }
        } else {
            declarations.push(format!(
                "{} = $.derived(() => {}.{})",
                prop, base_expr, prop
            ));
        }
    }
    Some(())
}

fn process_derived_array_pattern(
    inner: &str,
    base_expr: &str,
    declarations: &mut Vec<String>,
    array_counter: &mut usize,
) -> Option<()> {
    let elements = split_derived_array_elements(inner);
    let element_count = elements.len();
    let array_var = if *array_counter == 0 {
        "$$array".to_string()
    } else {
        format!("$$array_{}", array_counter)
    };
    *array_counter += 1;
    declarations.push(format!(
        "{} = $.derived(() => $.to_array({}, {}))",
        array_var, base_expr, element_count
    ));
    for (index, element) in elements.iter().enumerate() {
        let element = element.trim();
        if element.is_empty() {
            continue;
        }
        if let Some(rest_name) = element.strip_prefix("...") {
            let rest_name = rest_name.trim();
            declarations.push(format!(
                "{} = $.derived(() => $.get({}).slice({}))",
                rest_name, array_var, index
            ));
            continue;
        }
        let element_access = format!("$.get({})[{}]", array_var, index);
        if element.starts_with('[') || element.starts_with('{') {
            process_derived_destructuring_pattern(
                element,
                &element_access,
                declarations,
                array_counter,
            )?;
        } else {
            declarations.push(format!("{} = $.derived(() => {})", element, element_access));
        }
    }
    Some(())
}

fn split_derived_object_properties(inner: &str) -> Vec<String> {
    let mut properties = Vec::new();
    let mut current = String::new();
    let mut depth = 0;
    for c in inner.chars() {
        match c {
            '{' | '[' | '(' => {
                depth += 1;
                current.push(c);
            }
            '}' | ']' | ')' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                if !current.trim().is_empty() {
                    properties.push(current.trim().to_string());
                }
                current = String::new();
            }
            _ => current.push(c),
        }
    }
    if !current.trim().is_empty() {
        properties.push(current.trim().to_string());
    }
    properties
}

fn split_derived_array_elements(inner: &str) -> Vec<String> {
    let mut elements = Vec::new();
    let mut current = String::new();
    let mut depth = 0;
    for c in inner.chars() {
        match c {
            '{' | '[' | '(' => {
                depth += 1;
                current.push(c);
            }
            '}' | ']' | ')' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                elements.push(current.clone());
                current = String::new();
            }
            _ => current.push(c),
        }
    }
    elements.push(current);
    elements
}

fn find_derived_property_colon(prop: &str) -> Option<usize> {
    let mut depth = 0;
    for (i, c) in prop.char_indices() {
        match c {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ':' if depth == 0 => return Some(i),
            _ => {}
        }
    }
    None
}

fn transform_export_let(line: &str) -> String {
    let trimmed = line.trim();

    // Pattern: export let name = value; or export let name;
    if !trimmed.starts_with("export let ") {
        return line.to_string();
    }

    let rest = trimmed[11..].trim(); // After "export let "
    let rest = rest.trim_end_matches(';').trim();

    // Parse: name = value or just name
    if let Some(eq_pos) = rest.find('=') {
        let name = rest[..eq_pos].trim();
        let value = rest[eq_pos + 1..].trim();
        format!("let {} = $.prop($$props, '{}', 12, {});", name, name, value)
    } else {
        let name = rest;
        format!("let {} = $.prop($$props, '{}', 12);", name, name)
    }
}

/// Transform $props() usage.
///
/// Only generates `$.prop()` declarations for props that are "sources" (reassigned or mutated)
/// or props that have default values or are exported.
/// Read-only props are accessed directly via `$$props.propName` without declarations.
///
/// Prop flags:
/// - 1 = READABLE
/// - 2 = HAS_DEFAULT
/// - 4 = SYNC_READABLE (for exported props)
/// - 8 = WRITABLE
fn transform_props_destructuring(
    line: &str,
    prop_source_vars: &[String],
    exported_names: &[String],
) -> Option<String> {
    let trimmed = line.trim();

    // Check for identifier pattern: let/const props = $props()
    if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
        && !trimmed.contains('{')
        && trimmed.contains("= $props()")
    {
        // Pattern: let props = $props()
        let decl_start = if trimmed.starts_with("let ") { 4 } else { 6 };
        let eq_pos = trimmed.find('=')?;
        let var_name = trimmed[decl_start..eq_pos].trim();

        // Only generate declaration if this is a source prop
        if prop_source_vars.contains(&var_name.to_string()) {
            // Transform to: let props = $.rest_props($$props, ['$$slots', '$$events', '$$legacy'])
            return Some(format!(
                "let {} = $.rest_props($$props, ['$$slots', '$$events', '$$legacy']);",
                var_name
            ));
        } else {
            // Read-only rest props - no declaration needed, accessed via $$props directly
            return Some(String::new());
        }
    }

    // Check for destructuring pattern: let { ... } = $props()
    if !trimmed.contains('{') || !trimmed.contains("= $props()") {
        return None;
    }

    // Extract the part between { and }
    let open_brace = trimmed.find('{')?;
    let close_brace = trimmed.rfind('}')?;
    let props_str = &trimmed[open_brace + 1..close_brace];

    // Parse each prop - only generate declarations for source props or props with defaults
    let mut result = String::new();
    for prop_part in props_str.split(',') {
        let prop_part = prop_part.trim();
        if prop_part.is_empty() {
            continue;
        }

        // Handle: name = default_value (always generate for props with defaults)
        if let Some(eq_pos) = prop_part.find('=') {
            let name = prop_part[..eq_pos].trim();
            let default_value = prop_part[eq_pos + 1..].trim();

            // Calculate flag:
            // - 1 (READABLE) + 2 (HAS_DEFAULT) = 3
            // - Add 4 (SYNC_READABLE) if exported = 7
            let is_exported = exported_names.contains(&name.to_string());
            let flag = if is_exported { 7 } else { 3 };

            result.push_str(&format!(
                "let {} = $.prop($$props, '{}', {}, {});\n",
                name, name, flag, default_value
            ));
        } else {
            // No default value - only generate if this is a source prop or exported
            let is_exported = exported_names.contains(&prop_part.to_string());
            if prop_source_vars.contains(&prop_part.to_string()) || is_exported {
                // Flag 8 = WRITABLE for props without default
                // Add 4 (SYNC_READABLE) if exported = 12
                let flag = if is_exported { 12 } else { 8 };
                result.push_str(&format!(
                    "let {} = $.prop($$props, '{}', {});\n",
                    prop_part, prop_part, flag
                ));
            }
            // Read-only props without defaults are accessed directly via $$props.propName
        }
    }

    Some(result)
}

/// Transform rest_prop member access to $$props.
fn transform_rest_prop_member_access(line: &str, rest_prop_vars: &[String]) -> String {
    let mut result = line.to_string();

    for var_name in rest_prop_vars {
        let pattern = format!(r"\b{}\.", var_name);
        let re = match regex::Regex::new(&pattern) {
            Ok(r) => r,
            Err(_) => continue,
        };

        let mut offset = 0;
        let mut new_result = String::new();

        for mat in re.find_iter(&result.clone()) {
            new_result.push_str(&result[offset..mat.start()]);
            let after_match = &result[mat.end()..];

            // Check if next char is [ (computed property access)
            if after_match.starts_with('[') {
                new_result.push_str(mat.as_str());
            } else {
                // Find the end of the property name
                let mut prop_end = 0;
                for (i, c) in after_match.chars().enumerate() {
                    if c.is_alphanumeric() || c == '_' || c == '$' {
                        prop_end = i + 1;
                    } else {
                        break;
                    }
                }

                let after_prop = &after_match[prop_end..].trim_start();
                let is_direct_assignment =
                    after_prop.starts_with('=') && !after_prop.starts_with("==");
                let has_deeper_access = after_prop.starts_with('.');

                if is_direct_assignment && !has_deeper_access {
                    new_result.push_str(mat.as_str());
                } else {
                    new_result.push_str("$$props.");
                }
            }

            offset = mat.end();
        }

        new_result.push_str(&result[offset..]);
        result = new_result;
    }

    result
}

// ============================================================================
// State Variable Transformation Functions
// ============================================================================

/// Transform state variable assignments to $.set() calls.
fn transform_state_assignments(
    line: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
    proxy_vars: &[String],
    raw_state_vars: &[String],
) -> String {
    let mut result = line.to_string();

    for var in state_vars {
        // Transform ++varname to $.update_pre(varname)
        let pre_inc_pattern = format!("++{}", var);
        result = replace_with_word_boundary(
            &result,
            &pre_inc_pattern,
            &format!("$.update_pre({})", var),
            true,
        );

        // Transform --varname to $.update_pre(varname, -1)
        let pre_dec_pattern = format!("--{}", var);
        result = replace_with_word_boundary(
            &result,
            &pre_dec_pattern,
            &format!("$.update_pre({}, -1)", var),
            true,
        );

        // Transform varname++ to $.update(varname)
        let post_inc_pattern = format!("{}++", var);
        result = replace_with_word_boundary(
            &result,
            &post_inc_pattern,
            &format!("$.update({})", var),
            false,
        );

        // Transform varname-- to $.update(varname, -1)
        let post_dec_pattern = format!("{}--", var);
        result = replace_with_word_boundary(
            &result,
            &post_dec_pattern,
            &format!("$.update({}, -1)", var),
            false,
        );

        // Transform compound assignments: varname += expr to $.set(varname, $.get(varname) + (expr))
        for op in &["+=", "-=", "*=", "/=", "%=", "**="] {
            let pattern = format!("{} {}", var, op);
            if result.contains(&pattern) {
                let op_char = &op[..op.len() - 1]; // Remove the '='
                if let Some(pos) = result.find(&pattern) {
                    // Skip if this is a member expression (e.g., this.count +=, obj.prop +=)
                    let before = &result[..pos];
                    if before.ends_with('.') {
                        continue;
                    }

                    let after = &result[pos + pattern.len()..];
                    // Find the expression (until ; or end)
                    let expr_end = after.find(';').unwrap_or(after.len());
                    let expr = after[..expr_end].trim();
                    // Wrap state variables in the expression with $.get()
                    let wrapped_expr =
                        wrap_state_vars_in_expr(expr, state_vars, non_reactive_vars, proxy_vars);
                    let replacement = format!(
                        "$.set({}, $.get({}) {} ({}))",
                        var, var, op_char, wrapped_expr
                    );
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern.len() + expr_end..]
                    );
                }
            }
        }

        // Transform simple assignment: varname = expr to $.set(varname, expr)
        // But not if it's a declaration (let/const/var varname = ...)
        let assignment_pattern = format!("{} = ", var);
        if result.contains(&assignment_pattern)
            && !result.contains(&format!("let {} = ", var))
            && !result.contains(&format!("const {} = ", var))
            && !result.contains(&format!("var {} = ", var))
            && !result.contains(&format!("$.set({}", var))
        {
            // Find the assignment position
            if let Some(pos) = result.find(&assignment_pattern) {
                // Check that it's not part of a comparison (==, ===)
                let before = &result[..pos];
                // Skip if preceded by dot (property access like foo.count = ...)
                if !before.ends_with('=') && !before.ends_with('!') && !before.ends_with('.') {
                    let after = &result[pos + assignment_pattern.len()..];
                    // Find the expression (until ; or end of line)
                    let expr_end = after.find(';').unwrap_or(after.len());
                    let expr = after[..expr_end].trim();

                    // Check it's not already wrapped
                    if !expr.starts_with("$.") {
                        // Wrap state variables in the expression with $.get()
                        let wrapped_expr = wrap_state_vars_in_expr(
                            expr,
                            state_vars,
                            non_reactive_vars,
                            proxy_vars,
                        );
                        // Check if the value needs proxying (could be an object/array)
                        // $state.raw() variables never need proxy wrapping
                        let is_raw_state = raw_state_vars.contains(var);
                        let needs_proxy = !is_raw_state && expression_needs_proxy(expr.trim());

                        let replacement = if needs_proxy {
                            format!("$.set({}, {}, true)", var, wrapped_expr)
                        } else {
                            format!("$.set({}, {})", var, wrapped_expr)
                        };

                        result = format!(
                            "{}{}{}",
                            &result[..pos],
                            replacement,
                            &result[pos + assignment_pattern.len() + expr_end..]
                        );
                    }
                }
            }
        }
    }

    result
}

/// Transform store subscription assignments to $.store_set() calls.
/// For client-side rendering, transforms:
/// - `$count = value` → `$.store_set(count, value)`
/// - `$count += 1` → `$.store_set(count, $count() + 1)`
/// - `$count++` → `$.store_set(count, $count() + 1)`
fn transform_store_assignments_client(line: &str, store_sub_vars: &[String]) -> String {
    if store_sub_vars.is_empty() {
        return line.to_string();
    }

    let mut result = line.to_string();

    for store_sub in store_sub_vars {
        // store_sub is like "$count", store_name is "count"
        let store_name = &store_sub[1..];

        // Transform prefix increment: ++$count
        let pre_inc_pattern = format!("++{}", store_sub);
        if result.contains(&pre_inc_pattern) {
            let replacement = format!("$.store_set({}, {}() + 1)", store_name, store_sub);
            result = result.replace(&pre_inc_pattern, &replacement);
        }

        // Transform prefix decrement: --$count
        let pre_dec_pattern = format!("--{}", store_sub);
        if result.contains(&pre_dec_pattern) {
            let replacement = format!("$.store_set({}, {}() - 1)", store_name, store_sub);
            result = result.replace(&pre_dec_pattern, &replacement);
        }

        // Transform postfix increment: $count++
        let post_inc_pattern = format!("{}++", store_sub);
        if result.contains(&post_inc_pattern) {
            let replacement = format!("$.store_set({}, {}() + 1)", store_name, store_sub);
            result = result.replace(&post_inc_pattern, &replacement);
        }

        // Transform postfix decrement: $count--
        let post_dec_pattern = format!("{}--", store_sub);
        if result.contains(&post_dec_pattern) {
            let replacement = format!("$.store_set({}, {}() - 1)", store_name, store_sub);
            result = result.replace(&post_dec_pattern, &replacement);
        }

        // Transform compound assignments: $count += expr
        for op in &["+=", "-=", "*=", "/=", "%=", "??=", "&&=", "||="] {
            let pattern = format!("{} {}", store_sub, op);
            if let Some(pos) = result.find(&pattern) {
                let op_char = &op[..op.len() - 1]; // Remove the '='
                let after = &result[pos + pattern.len()..];
                // Find the expression (until ; or end)
                let expr_end = find_statement_end_client(after);
                let expr = after[..expr_end].trim();
                let replacement = format!(
                    "$.store_set({}, {}() {} {})",
                    store_name, store_sub, op_char, expr
                );
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[pos + pattern.len() + expr_end..]
                );
            }
        }

        // Transform simple assignment: $count = expr
        let assignment_pattern = format!("{} = ", store_sub);
        if !result.contains(&format!("$.store_set({}", store_name))
            && let Some(pos) = result.find(&assignment_pattern)
        {
            // Check that it's not part of a comparison (==, ===)
            let before = &result[..pos];
            if !before.ends_with('=') && !before.ends_with('!') {
                let after = &result[pos + assignment_pattern.len()..];
                // Find the expression (until ; or end of line)
                let expr_end = find_statement_end_client(after);
                let expr = after[..expr_end].trim();
                let replacement = format!("$.store_set({}, {})", store_name, expr);
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[pos + assignment_pattern.len() + expr_end..]
                );
            }
        }
    }

    result
}

/// Find the end of a statement value for client-side transformations.
fn find_statement_end_client(s: &str) -> usize {
    let mut depth = 0;
    let chars: Vec<char> = s.chars().collect();
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &c) in chars.iter().enumerate() {
        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => {
                if depth > 0 {
                    depth -= 1;
                }
            }
            ';' if depth == 0 => return i,
            _ => {}
        }
    }

    s.len()
}

/// Wrap state variable references with $.get() in an expression.
fn wrap_state_vars_in_expr(
    expr: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
    proxy_vars: &[String],
) -> String {
    transform_state_in_expr(expr, state_vars, non_reactive_vars, proxy_vars)
}

/// Check if a variable at position `var_end_idx` is in a function parameter position.
/// This detects patterns like:
/// - `name(param)` - method shorthand
/// - `function name(param)` - function declaration
/// - `(param) =>` - arrow function
/// - `(param1, param2)` - multiple parameters
fn is_in_function_param_position(chars: &[char], var_start_idx: usize, var_end_idx: usize) -> bool {
    // Find the opening parenthesis before this variable
    let mut paren_depth = 0;
    let mut found_open_paren = false;
    let mut open_paren_idx = 0;

    // Scan backwards to find the opening paren
    let mut j = var_start_idx;
    while j > 0 {
        j -= 1;
        let c = chars[j];
        if c == ')' {
            paren_depth += 1;
        } else if c == '(' {
            if paren_depth == 0 {
                found_open_paren = true;
                open_paren_idx = j;
                break;
            }
            paren_depth -= 1;
        }
    }

    if !found_open_paren {
        return false;
    }

    // Check what's before the opening paren - should be an identifier (function/method name)
    // or nothing (for arrow functions)
    let mut before_paren_idx = open_paren_idx;
    while before_paren_idx > 0 && chars[before_paren_idx - 1].is_whitespace() {
        before_paren_idx -= 1;
    }

    // Check if it's preceded by "function " keyword
    if before_paren_idx >= 8 {
        let prefix: String = chars[before_paren_idx - 8..before_paren_idx]
            .iter()
            .collect();
        if prefix == "function" {
            return true;
        }
    }

    // Check what comes after the closing paren
    // For function params, it should be `) {` or `) =>` or `, param` pattern
    let mut k = var_end_idx;

    // Skip whitespace
    while k < chars.len() && chars[k].is_whitespace() {
        k += 1;
    }

    if k >= chars.len() {
        return false;
    }

    // Check if next char is `)` followed by ` {` or ` =>`
    // Or if it's `,` (part of parameter list)
    // Or if it's `=` (default parameter value)
    let next_char = chars[k];

    if next_char == '=' {
        // Default parameter like `param = default`
        // But not for arrow function body `param => body`
        // Check if it's `=>` vs just `=`
        if k + 1 < chars.len() && chars[k + 1] == '>' {
            // It's `param =>` - this is the whole param for arrow function
            // But we need to check if we're at the param, not the body
            return true;
        }
        // It's `param = default`, likely a default parameter
        // Need to check if we're inside param parens
        // For now, trust context
        return true;
    }

    if next_char == ')' {
        // Skip the closing paren and whitespace
        k += 1;
        while k < chars.len() && chars[k].is_whitespace() {
            k += 1;
        }

        if k >= chars.len() {
            return false;
        }

        // Check for `{` (function body) or `=>` (arrow function)
        if chars[k] == '{' {
            return true;
        }
        if k + 1 < chars.len() && chars[k] == '=' && chars[k + 1] == '>' {
            return true;
        }
    }

    if next_char == ',' {
        // This could be a parameter in a list
        // Need to verify there's a closing `) {` or `) =>` eventually
        let mut depth = 1;
        let mut m = k + 1;
        while m < chars.len() && depth > 0 {
            if chars[m] == '(' {
                depth += 1;
            } else if chars[m] == ')' {
                depth -= 1;
                if depth == 0 {
                    // Found closing paren, check what follows
                    m += 1;
                    while m < chars.len() && chars[m].is_whitespace() {
                        m += 1;
                    }
                    if m < chars.len() && chars[m] == '{' {
                        return true;
                    }
                    if m + 1 < chars.len() && chars[m] == '=' && chars[m + 1] == '>' {
                        return true;
                    }
                }
            }
            m += 1;
        }
    }

    false
}

/// Transform state variable references to $.get() calls.
/// All state variables (including those initialized with objects/arrays) need $.get() wrapping
/// when reading their values, including when accessing properties.
fn transform_state_in_expr(
    expr: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
    _proxy_vars: &[String],
) -> String {
    // Filter out non-reactive state vars - they don't need $.get() wrapping
    let effective_state_vars: Vec<&String> = state_vars
        .iter()
        .filter(|v| !non_reactive_vars.contains(v))
        .collect();

    let mut result = expr.to_string();

    for var in effective_state_vars {
        let mut new_result = String::new();
        let chars: Vec<char> = result.chars().collect();
        let var_chars: Vec<char> = var.chars().collect();
        let mut i = 0;

        while i < chars.len() {
            if i + var_chars.len() <= chars.len() {
                let potential_match: String = chars[i..i + var_chars.len()].iter().collect();
                if potential_match == *var {
                    let before_ok = i == 0 || !is_identifier_char(chars[i - 1]);
                    let after_ok = i + var_chars.len() >= chars.len()
                        || !is_identifier_char(chars[i + var_chars.len()]);

                    if before_ok && after_ok {
                        // Check if preceded by dot, but NOT if it's a spread operator (...)
                        let preceded_by_dot = i > 0
                            && chars[i - 1] == '.'
                            && !(i >= 3 && chars[i - 3..i].iter().collect::<String>() == "...");
                        let already_wrapped = if i >= 6 {
                            let prefix: String = chars[i - 6..i].iter().collect();
                            prefix == "$.get("
                        } else {
                            false
                        };
                        let in_set_first_arg = if i >= 6 {
                            let prefix: String = chars[i - 6..i].iter().collect();
                            prefix == "$.set("
                        } else {
                            false
                        };
                        let in_update_arg = if i >= 9 {
                            let prefix: String = chars[i - 9..i].iter().collect();
                            prefix == "$.update("
                        } else {
                            false
                        };
                        let in_update_pre_arg = if i >= 13 {
                            let prefix: String = chars[i - 13..i].iter().collect();
                            prefix == "$.update_pre("
                        } else {
                            false
                        };

                        // Check if this variable is in a function parameter position
                        let in_param_position =
                            is_in_function_param_position(&chars, i, i + var_chars.len());

                        if !already_wrapped
                            && !preceded_by_dot
                            && !in_set_first_arg
                            && !in_update_arg
                            && !in_update_pre_arg
                            && !in_param_position
                        {
                            new_result.push_str(&format!("$.get({})", var));
                            i += var_chars.len();
                            continue;
                        }
                    }
                }
            }
            new_result.push(chars[i]);
            i += 1;
        }

        result = new_result;
    }

    result
}

/// Replace a pattern with a replacement, respecting word boundaries.
/// This function handles increment/decrement operators for state variables.
/// It avoids matching property accesses like `foo.count++` when `count` is a state var,
/// or `++foo.count` when `foo` is a state var.
fn replace_with_word_boundary(
    input: &str,
    pattern: &str,
    replacement: &str,
    check_before: bool,
) -> String {
    let mut result = String::new();
    let chars: Vec<char> = input.chars().collect();
    let pattern_chars: Vec<char> = pattern.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        if i + pattern_chars.len() <= chars.len() {
            let potential_match: String = chars[i..i + pattern_chars.len()].iter().collect();
            if potential_match == pattern {
                // Always check that we're not preceded by a dot (property access)
                // e.g., don't match `count++` in `foo.count++` since `count` is a property, not the state variable
                let preceded_by_dot = i > 0 && chars[i - 1] == '.';

                // Also check that we're not followed by a dot (property access)
                // e.g., don't match `++foo` in `++foo.count` since we're incrementing foo.count, not foo
                let followed_by_dot =
                    i + pattern_chars.len() < chars.len() && chars[i + pattern_chars.len()] == '.';

                let before_ok = !preceded_by_dot
                    && (!check_before
                        || i == 0
                        || !is_identifier_char(chars[i - 1])
                        || chars[i] == '+');
                let after_ok = !followed_by_dot
                    && (i + pattern_chars.len() >= chars.len()
                        || !is_identifier_char(chars[i + pattern_chars.len()]));

                if before_ok && after_ok {
                    result.push_str(replacement);
                    i += pattern_chars.len();
                    continue;
                }
            }
        }
        result.push(chars[i]);
        i += 1;
    }

    result
}

// ============================================================================
// Utility Functions
// ============================================================================

/// Check if a character can be part of a JavaScript identifier.
fn is_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// Find the position of the matching closing parenthesis.
fn find_matching_paren(s: &str) -> Option<usize> {
    let mut depth = 1;
    for (i, c) in s.char_indices() {
        match c {
            '(' => depth += 1,
            ')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

/// Determine if an expression needs proxying (could return an object/array).
///
/// Returns `true` for:
/// - Object literals `{}`
/// - Array literals `[]`
/// - `new` expressions
/// - Function calls (could return objects)
///
/// Returns `false` for:
/// - Primitives (numbers, strings, booleans, null, undefined)
/// - Arithmetic/binary operations
/// - Unary operations
/// - Identifier references
fn expression_needs_proxy(expr: &str) -> bool {
    let trimmed = expr.trim();

    // Object literal
    if trimmed.starts_with('{') {
        return true;
    }

    // Array literal
    if trimmed.starts_with('[') {
        return true;
    }

    // new expression
    if trimmed.starts_with("new ") {
        return true;
    }

    // Check for function call pattern: identifier followed by (
    // But not operators like !, -, etc.
    // Also check for method calls like foo.bar()
    if contains_function_call(trimmed) {
        return true;
    }

    false
}

/// Check if an expression contains a function call.
fn contains_function_call(expr: &str) -> bool {
    let chars: Vec<char> = expr.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];

        // Track string literals
        if !in_string && (c == '"' || c == '\'' || c == '`') {
            in_string = true;
            string_char = c;
            i += 1;
            continue;
        }
        if in_string && c == string_char && (i == 0 || chars[i - 1] != '\\') {
            in_string = false;
            i += 1;
            continue;
        }
        if in_string {
            i += 1;
            continue;
        }

        // Look for identifier followed by (
        // Skip operators like !foo or ++foo
        if c == '(' && i > 0 {
            let prev = chars[i - 1];
            // Previous char should be an identifier char or )
            if prev.is_alphanumeric() || prev == '_' || prev == '$' || prev == ')' || prev == ']' {
                // Check it's not a keyword followed by (
                // like if(, while(, for(, etc.
                let mut start = i - 1;
                while start > 0
                    && (chars[start - 1].is_alphanumeric()
                        || chars[start - 1] == '_'
                        || chars[start - 1] == '$'
                        || chars[start - 1] == '.')
                {
                    start -= 1;
                }
                let ident: String = chars[start..i].iter().collect();
                let ident_last = ident.split('.').next_back().unwrap_or(&ident);

                // Keywords that are NOT function calls
                let keywords = ["if", "while", "for", "switch", "catch", "with"];
                if !keywords.contains(&ident_last) {
                    return true;
                }
            }
        }

        i += 1;
    }

    false
}

/// Check if an expression contains a direct `await` keyword (not inside a nested async function).
///
/// This is used to detect async derived patterns like `$derived(await expr)`.
/// We need to be careful not to match `await` that's inside a nested async function.
///
/// Examples:
/// - `await 1` → true
/// - `foo(await 1)` → true
/// - `async () => { return await 1; }` → false (await is inside async function)
fn contains_direct_await_in_expression(expr: &str) -> bool {
    let chars: Vec<char> = expr.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    // Track nested function depth (async functions)
    // We only count await at depth 0
    let mut async_fn_depth = 0;

    while i < chars.len() {
        let c = chars[i];

        // Handle string literals
        if !in_string && (c == '"' || c == '\'' || c == '`') {
            in_string = true;
            string_char = c;
            i += 1;
            continue;
        }
        if in_string && c == string_char && (i == 0 || chars[i - 1] != '\\') {
            in_string = false;
            i += 1;
            continue;
        }
        if in_string {
            i += 1;
            continue;
        }

        // Check for 'async' keyword followed by function definition
        if i + 5 <= chars.len() {
            let word: String = chars[i..i + 5].iter().collect();
            if word == "async" {
                // Check if this is followed by function or arrow syntax
                let rest: String = chars[i + 5..].iter().collect();
                let rest_trimmed = rest.trim_start();
                if rest_trimmed.starts_with("(")
                    || rest_trimmed.starts_with("function")
                    || chars[i + 5..]
                        .iter()
                        .collect::<String>()
                        .trim_start()
                        .starts_with("=>")
                {
                    // We found an async function, track depth when we see '{'
                    // For now, just note we're in async context
                }
            }
        }

        // Check for 'await' keyword at top level
        if i + 5 <= chars.len() && async_fn_depth == 0 {
            let word: String = chars[i..i + 5].iter().collect();
            if word == "await" {
                // Make sure it's a word boundary
                let before_ok = i == 0 || !is_identifier_char(chars[i - 1]);
                let after_ok = i + 5 >= chars.len() || !is_identifier_char(chars[i + 5]);
                if before_ok && after_ok {
                    return true;
                }
            }
        }

        // Track nested async arrow functions: async () => or async x =>
        // Simplified: just check for 'async' followed by ')' and then '=>'
        // This is a heuristic - we check for `async` followed by arrow function patterns

        // Track braces for nested scopes
        if c == '{' {
            // Check if this brace follows an arrow function context
            // Look back for '=>'
            let before: String = chars[..i].iter().collect();
            if before.trim_end().ends_with("=>") {
                // Check if async was before the params
                let before_trimmed = before.trim_end();
                // Find the '('
                if let Some(paren_pos) = before_trimmed.rfind('(') {
                    let before_paren = &before_trimmed[..paren_pos];
                    if before_paren.trim_end().ends_with("async") {
                        async_fn_depth += 1;
                    }
                } else {
                    // Single param arrow: async x =>
                    // Look for 'async' before the identifier
                    if let Some(async_pos) = before_trimmed.rfind("async") {
                        let between = &before_trimmed[async_pos + 5..];
                        // Should be: "async x =>" pattern
                        if between
                            .trim()
                            .chars()
                            .all(|c| is_identifier_char(c) || c == ' ')
                        {
                            async_fn_depth += 1;
                        }
                    }
                }
            }
        } else if c == '}' && async_fn_depth > 0 {
            async_fn_depth -= 1;
        }

        i += 1;
    }

    false
}

// ============================================================================
// Class State Field Transformation
// ============================================================================

/// Represents a class field with $state or $derived rune.
#[derive(Debug, Clone)]
struct ClassStateField {
    /// Field name (without # prefix)
    name: String,
    /// Whether this is a private field (starts with #)
    is_private: bool,
    /// The rune type: "$state" or "$derived"
    rune_type: String,
    /// The initial value/expression
    value: String,
    /// The deconflicted private backing field name (without # prefix)
    /// For private fields, this is the same as name.
    /// For public fields, this may have _ prefix if it conflicts with existing private fields.
    private_backing_name: String,
}

/// Transform class fields with $state and $derived runes for client-side.
fn transform_class_fields_client(script: &str) -> String {
    // Check if script contains a class with $state or $derived fields
    if !script.contains("class ") || (!script.contains("$state") && !script.contains("$derived")) {
        return script.to_string();
    }

    // Find the class body
    let Some(class_pos) = script.find("class ") else {
        return script.to_string();
    };

    // Find the opening brace of the class
    let after_class = &script[class_pos..];
    let Some(brace_pos) = after_class.find('{') else {
        return script.to_string();
    };

    let class_header = &after_class[..brace_pos + 1];

    // Find matching closing brace
    let class_body_start = class_pos + brace_pos + 1;
    let mut brace_depth = 1;
    let mut class_body_end = class_body_start;

    for (i, c) in script[class_body_start..].char_indices() {
        match c {
            '{' => brace_depth += 1,
            '}' => {
                brace_depth -= 1;
                if brace_depth == 0 {
                    class_body_end = class_body_start + i;
                    break;
                }
            }
            _ => {}
        }
    }

    let class_body = &script[class_body_start..class_body_end];

    // Parse class fields with $state and $derived
    let mut fields: Vec<ClassStateField> = Vec::new();
    let mut constructor_content = String::new();
    let mut constructor_start = None;

    // Find constructor first
    if let Some(ctor_pos) = class_body.find("constructor(") {
        let after_ctor = &class_body[ctor_pos..];
        if let Some(brace_pos) = after_ctor.find('{') {
            let ctor_body_start = ctor_pos + brace_pos + 1;
            let mut depth = 1;
            let mut ctor_body_end = ctor_body_start;

            for (i, c) in class_body[ctor_body_start..].char_indices() {
                match c {
                    '{' => depth += 1,
                    '}' => {
                        depth -= 1;
                        if depth == 0 {
                            ctor_body_end = ctor_body_start + i;
                            break;
                        }
                    }
                    _ => {}
                }
            }

            constructor_start = Some(ctor_pos);
            constructor_content = class_body[ctor_body_start..ctor_body_end].to_string();
        }
    }

    // Parse field definitions (before constructor)
    let fields_section = if let Some(ctor_start) = constructor_start {
        &class_body[..ctor_start]
    } else {
        class_body
    };

    // Collect existing private identifiers to avoid conflicts
    // This includes #name fields and private methods
    let mut existing_private_ids: Vec<String> = Vec::new();
    for line in class_body.lines() {
        let trimmed = line.trim();
        // Match private field definitions: #name = ... or #name;
        if trimmed.starts_with('#')
            && let Some(end) = trimmed
                .find('=')
                .or_else(|| trimmed.find(';'))
                .or_else(|| trimmed.find('('))
        {
            let name = trimmed[1..end].trim();
            if !name.is_empty() && !existing_private_ids.contains(&name.to_string()) {
                existing_private_ids.push(name.to_string());
            }
        }
    }

    // Parse each line for field definitions
    for line in fields_section.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        // Check for $state field: name = $state(...) or #name = $state(...)
        if trimmed.contains("= $state(") || trimmed.contains("=$state(") {
            if let Some(field) = parse_state_field(trimmed, "$state") {
                fields.push(field);
            }
        }
        // Check for $derived field: name = $derived(...) or #name = $derived(...)
        else if (trimmed.contains("= $derived(") || trimmed.contains("=$derived("))
            && let Some(field) = parse_state_field(trimmed, "$derived")
        {
            fields.push(field);
        }
    }

    if fields.is_empty() {
        return script.to_string();
    }

    // Deconflict private backing names for public fields
    // If a public field "count" exists and there's already a "#count" private field,
    // rename the backing field to "#_count" (prepend _ until unique)
    for field in &mut fields {
        if !field.is_private {
            let mut deconflicted = field.name.clone();
            while existing_private_ids.contains(&deconflicted) {
                deconflicted = format!("_{}", deconflicted);
            }
            existing_private_ids.push(deconflicted.clone());
            field.private_backing_name = deconflicted;
        }
    }

    // Build transformed class body
    let mut new_class_body = String::new();

    for field in &fields {
        // Use the deconflicted private backing name (may have _ prefix for public fields)
        let private_name = format!("#{}", field.private_backing_name);

        if field.rune_type == "$state" {
            // Transform $state: #name = $.state(value)
            new_class_body.push_str(&format!(
                "\t\t{} = $.state({});\n",
                private_name, field.value
            ));

            // Add getter/setter only for public fields
            if !field.is_private {
                new_class_body.push('\n');
                new_class_body.push_str(&format!(
                    "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                    field.name, private_name
                ));
                new_class_body.push('\n');
                new_class_body.push_str(&format!(
                    "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value, true);\n\t\t}}\n",
                    field.name, private_name
                ));
            }
        } else if field.rune_type == "$derived" {
            // Transform $derived: #name = $.derived(() => (value))
            let wrapped_value = format!("() => ({})", field.value);
            new_class_body.push_str(&format!(
                "\t\t{} = $.derived({});\n",
                private_name, wrapped_value
            ));

            // Add getter/setter only for public fields
            if !field.is_private {
                new_class_body.push('\n');
                new_class_body.push_str(&format!(
                    "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                    field.name, private_name
                ));
                new_class_body.push('\n');
                new_class_body.push_str(&format!(
                    "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}\n",
                    field.name, private_name
                ));
            }
        }
    }

    // Add constructor with transformed assignments
    if constructor_start.is_some() {
        new_class_body.push('\n');
        new_class_body.push_str("\t\tconstructor() {\n");

        // Transform constructor content
        for line in constructor_content.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }

            let transformed_line = transform_constructor_assignment(trimmed, &fields);
            new_class_body.push_str(&format!("\t\t\t{}\n", transformed_line));
        }

        new_class_body.push_str("\t\t}\n");
    }

    // Build the final result
    let before_class = &script[..class_pos];
    let after_class_body = &script[class_body_end + 1..]; // Skip closing brace

    format!(
        "{}{}\n{}\t}}{}",
        before_class, class_header, new_class_body, after_class_body
    )
}

/// Parse a state field definition.
fn parse_state_field(line: &str, rune_type: &str) -> Option<ClassStateField> {
    let trimmed = line.trim().trim_end_matches(';');

    // Check if starts with # (private field)
    let is_private = trimmed.starts_with('#');

    // Find the field name
    let name_end = trimmed.find('=').or_else(|| trimmed.find(" ="))?;
    let name = trimmed[..name_end]
        .trim()
        .trim_start_matches('#')
        .to_string();

    // Find the rune call
    let rune_pattern = format!("{}(", rune_type);
    let rune_start = trimmed.find(&rune_pattern)?;
    let value_start = rune_start + rune_pattern.len();

    // Find matching closing paren
    let after_paren = &trimmed[value_start..];
    let value_end = find_matching_paren(after_paren)?;
    let value = after_paren[..value_end].to_string();

    Some(ClassStateField {
        name: name.clone(),
        is_private,
        rune_type: rune_type.to_string(),
        value,
        private_backing_name: name, // Will be deconflicted later if needed
    })
}

/// Transform constructor assignments for private state fields.
fn transform_constructor_assignment(line: &str, fields: &[ClassStateField]) -> String {
    let trimmed = line.trim();

    // Check for private field assignment: this.#name = value
    if trimmed.starts_with("this.#") && trimmed.contains('=') {
        for field in fields {
            if field.is_private {
                let pattern = format!("this.#{} =", field.name);
                let pattern_nospace = format!("this.#{}=", field.name);

                if trimmed.starts_with(&pattern) || trimmed.starts_with(&pattern_nospace) {
                    let eq_pos = trimmed.find('=').unwrap();
                    let value = trimmed[eq_pos + 1..].trim().trim_end_matches(';');
                    // Use private_backing_name for the output
                    return format!("$.set(this.#{}, {});", field.private_backing_name, value);
                }
            }
        }
    }

    trimmed.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_matching_paren() {
        assert_eq!(find_matching_paren("abc)"), Some(3));
        assert_eq!(find_matching_paren("(a))"), Some(3));
        assert_eq!(find_matching_paren("((a)))"), Some(5));
        assert_eq!(find_matching_paren("abc"), None);
    }
}
