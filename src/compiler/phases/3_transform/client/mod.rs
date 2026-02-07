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

use std::cell::Cell;
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

// Regex for sanitizing identifier names - replaces invalid identifier characters
// Pattern matches:
// - ^[^a-zA-Z_$] - character at start that is NOT a valid identifier start
// - [^a-zA-Z0-9_$] - any character that is NOT a valid identifier character
static REGEX_INVALID_IDENTIFIER_CHARS: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(^[^a-zA-Z_$]|[^a-zA-Z0-9_$])").unwrap());

// Thread-local counter for generating unique $$array variable names across multiple
// $derived destructuring patterns in the same component.
// This is reset at the start of each component transformation.
thread_local! {
    static DERIVED_ARRAY_COUNTER: Cell<usize> = const { Cell::new(0) };
    // Counter for looking up which $$array variable to use when processing nested patterns
    // This must stay in sync with DERIVED_ARRAY_COUNTER
    static ARRAY_LOOKUP_COUNTER: Cell<usize> = const { Cell::new(0) };
}

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
        experimental_async: options.experimental.r#async,
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

    // Visit the program to set up transforms for props, store subscriptions, etc.
    // This handles legacy mode props ($.prop() getters) and store subscriptions
    use crate::compiler::phases::phase3_transform::client::visitors::program::visit_program;
    visit_program(&mut context);

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

    // Collect store sub bindings and sort by name for consistent output
    let mut store_sub_bindings: Vec<&str> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| matches!(b.kind, BindingKind::StoreSub))
        .map(|b| b.name.as_str())
        .collect();
    store_sub_bindings.sort();

    for (getter_count, store_sub_name) in store_sub_bindings.into_iter().enumerate() {
        let store_name = &store_sub_name[1..]; // e.g., "store"

        // First store_sub binding - add setup_stores call at the end
        if store_setup.is_empty() {
            needs_store_cleanup = true;
            // const [$$stores, $$cleanup] = $.setup_stores();
            store_setup.push(JsStatement::Raw(
                "const [$$stores, $$cleanup] = $.setup_stores();".to_string(),
            ));
        }

        // Check if the store comes from a prop - if so, we need to call it as a function
        // e.g., count() instead of count
        let is_prop_store = analysis.root.bindings.iter().any(|b| {
            b.name == store_name && matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp)
        });

        // Generate: const $store = () => $.store_get(store, '$store', $$stores);
        // or: const $store = () => $.store_get(store(), '$store', $$stores); for prop stores
        let store_access = if is_prop_store {
            format!("{}()", store_name)
        } else {
            store_name.to_string()
        };
        let getter_code = format!(
            "const {} = () => $.store_get({}, '{}', $$stores);",
            store_sub_name, store_access, store_sub_name
        );
        // Insert getter BEFORE setup_stores (at position getter_count to maintain sorted order)
        store_setup.insert(getter_count, JsStatement::Raw(getter_code));
    }

    // Detect reactive statements ($:) in the instance script
    // Since analysis.reactive_statements is not populated yet, we scan the script directly
    let has_reactive_statements = if let Some(ref content) = analysis.instance_script_content {
        // Check for $: at the start of a line (with possible leading whitespace)
        content.raw.lines().any(|line| {
            let trimmed = line.trim();
            trimmed.starts_with("$:")
                && (trimmed.len() == 2 || !trimmed.chars().nth(2).unwrap_or(' ').is_alphanumeric())
        })
    } else {
        false
    };

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

    // Count bindable props that need $$exports when accessors is enabled
    // These are props created via `export let x` that become BindableProp
    // Reference: transform-client.js lines 280-306
    let bindable_prop_count = if analysis.accessors {
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::BindableProp))
            .count()
    } else {
        0
    };

    let should_inject_context = options.dev
        || analysis.needs_context
        || !analysis.reactive_statements.is_empty()
        || has_reactive_statements  // Reactive $: statements detected in script
        || !analysis.exports.is_empty()  // All exports (not just reactive) trigger context injection
        || reactive_export_count > 0
        || bindable_prop_count > 0;
    // Note: needs_store_cleanup does NOT require context injection ($.push/$.pop)
    // Store subscriptions are independent of the component context

    // Check if there are any prop bindings (Prop or BindableProp) that require $$props
    // This is needed for legacy mode where props are accessed via $.prop($$props, 'name', flags)
    let has_prop_bindings = analysis.root.bindings.iter().any(|b| {
        matches!(
            b.kind,
            BindingKind::Prop | BindingKind::BindableProp | BindingKind::RestProp
        )
    });

    // Determine if we need $$props parameter
    let should_inject_props = should_inject_context
        || analysis.needs_props
        || analysis.uses_props
        || analysis.uses_rest_props
        || analysis.uses_slots
        || !analysis.slot_names.is_empty()
        || has_prop_bindings; // Legacy mode props need $$props parameter

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

    // Add binding group declarations
    // Reference: transform-client.js lines 273-277
    // const group_binding_declarations = [];
    // for (const group of analysis.binding_groups.values()) {
    //     group_binding_declarations.push(b.const(group.name, b.array([])));
    // }
    for group_name in analysis.binding_groups.values() {
        component_body.push(b::const_decl(group_name, b::empty_array()));
    }

    // Add $props.id() declaration if needed
    // Reference: transform-client.js line 588
    if let Some(ref props_id_name) = analysis.props_id {
        // const id = $.props_id();
        component_body.push(b::const_decl(
            props_id_name,
            b::call(b::member_path("$.props_id"), vec![]),
        ));
    }

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

    // Add $.legacy_pre_effect_reset() after all reactive statements
    // Reference: transform-client.js - this is called after all legacy_pre_effect() calls
    if has_reactive_statements && !analysis.runes {
        component_body.push(JsStatement::Raw("$.legacy_pre_effect_reset();".to_string()));
    }

    // Generate $$exports object (component_returned_object) from analysis.exports
    // Reference: transform-client.js lines 280-378
    // In the official compiler, component_returned_object is built from ALL analysis.exports.
    // IMPORTANT: $$exports must come BEFORE $.init() - this matches the official compiler order.
    // For non-dev mode:
    //   - const/function exports (not let/var): simple init property { name } or { alias: name }
    //   - let/var exports: getter/setter pair (but these are BindableProp in legacy mode)
    //   - prop/bindable_prop: getter/setter pair
    //   - state/raw_state: getter/setter pair
    // For accessors mode, bindable props also get getter/setter.
    let component_returned_object_len = analysis.exports.len() + bindable_prop_count;
    let needs_exports = component_returned_object_len > 0;
    if needs_exports {
        let mut exports_parts: Vec<String> = Vec::new();

        // Process analysis.exports (const, function, class exports)
        for export in &analysis.exports {
            let name = &export.name;
            let alias = export.alias.as_deref().unwrap_or(name);

            // Find the binding
            let binding = analysis.root.bindings.iter().find(|b| b.name == *name);

            if let Some(binding) = binding {
                let is_identifier_expr = true; // build_getter returns identifier for simple refs

                if is_identifier_expr {
                    if matches!(
                        binding.declaration_kind,
                        crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Let
                            | crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Var
                    ) {
                        // let/var: getter + setter
                        exports_parts.push(format!(
                            "get {}() {{\n\t\treturn {};\n\t}},\n\tset {}($$value) {{\n\t\t{} = $$value;\n\t}}",
                            alias, name, alias, name
                        ));
                    } else if !options.dev {
                        // const/function/class in non-dev: simple init property
                        if alias == name {
                            exports_parts.push(name.clone());
                        } else {
                            exports_parts.push(format!("{}: {}", alias, name));
                        }
                    } else {
                        // dev mode: getter only
                        exports_parts
                            .push(format!("get {}() {{\n\t\treturn {};\n\t}}", alias, name));
                    }
                }

                // Handle prop/bindable_prop/state/raw_state (if they end up in exports)
                match binding.kind {
                    BindingKind::Prop | BindingKind::BindableProp => {
                        // These should use getter/setter with flush
                        // But in practice, export let becomes BindableProp and is NOT in analysis.exports
                        // This case handles export { x } where x is already a prop
                    }
                    BindingKind::State => {
                        // getter + $.set setter with proxy
                        if !exports_parts.last().is_some_and(|p| p.contains("get ")) {
                            // Replace last simple init with getter/setter
                            exports_parts.pop();
                            exports_parts.push(format!(
                                "get {}() {{\n\t\treturn $.get({});\n\t}},\n\tset {}($$value) {{\n\t\t$.set({}, $.proxy($$value));\n\t}}",
                                alias, name, alias, name
                            ));
                        }
                    }
                    BindingKind::RawState => {
                        exports_parts.pop();
                        exports_parts.push(format!(
                            "get {}() {{\n\t\treturn $.get({});\n\t}},\n\tset {}($$value) {{\n\t\t$.set({}, $$value);\n\t}}",
                            alias, name, alias, name
                        ));
                    }
                    _ => {}
                }
            } else {
                // No binding found - simple init
                if alias == name {
                    exports_parts.push(name.clone());
                } else {
                    exports_parts.push(format!("{}: {}", alias, name));
                }
            }
        }

        // Add bindable props with getter/setter when accessors is enabled
        if analysis.accessors {
            for binding in &analysis.root.bindings {
                if matches!(binding.kind, BindingKind::BindableProp)
                    && !analysis.exports.iter().any(|e| e.name == binding.name)
                {
                    let name = &binding.name;
                    let alias = binding.prop_alias.as_deref().unwrap_or(name);
                    exports_parts.push(format!(
                        "get {}() {{\n\t\treturn {}();\n\t}},\n\tset {}($$value) {{\n\t\t{}($$value);\n\t\t$.flush();\n\t}}",
                        alias, name, alias, name
                    ));
                }
            }
        }

        if !exports_parts.is_empty() {
            let exports_code = format!("var $$exports = {{ {} }};", exports_parts.join(", "));
            component_body.push(JsStatement::Raw(exports_code));
        }
    }

    // Add $.init() for legacy (non-runes) components that need context
    // Reference: transform-client.js line 381-382
    // IMPORTANT: This must come AFTER $$exports but BEFORE template body
    if !analysis.runes && analysis.needs_context {
        let init_args = if analysis.immutable {
            vec![b::literal(super::js_ast::nodes::JsLiteral::Boolean(true))]
        } else {
            vec![]
        };
        component_body.push(b::stmt(b::call(b::member_path("$.init"), init_args)));
    }

    // Add template body statements
    component_body.extend(template_body.body);

    // Bind static exports to props so that people can access them with bind:x
    // Reference: transform-client.js lines 406-416
    if !analysis.runes {
        for export in &analysis.exports {
            let alias = export.alias.as_deref().unwrap_or(&export.name);
            component_body.push(JsStatement::Raw(format!(
                "$.bind_prop($$props, '{}', {});",
                alias, export.name
            )));
        }
    }

    // Add $.pop at the end if injecting context
    // Reference: transform-client.js lines 433-454
    if should_inject_context {
        if needs_exports {
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

        if needs_exports {
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

    // Process module script content - extract imports separately from other content
    // This is needed because module_level_snippets must come after imports but before exports
    // Reference: transform-client.js line 513: body = [...imports, ...state.module_level_snippets, ...body];
    let module_script_non_imports: Option<String> =
        if let Some(ref module_content) = analysis.module_script_content {
            let (module_imports, rest) = extract_imports(&module_content.raw);
            // Add module script imports first
            for import_line in module_imports {
                body.push(JsStatement::Raw(import_line));
            }
            let rest_trimmed = rest.trim();
            if rest_trimmed.is_empty() {
                None
            } else {
                Some(rest_trimmed.to_string())
            }
        } else {
            None
        };

    // Extract and add imports from instance script
    // These are hoisted to module level (after svelte imports)
    if let Some(ref instance_content) = analysis.instance_script_content {
        let (script_imports, _) = extract_imports(&instance_content.raw);
        for import_line in script_imports {
            body.push(JsStatement::Raw(import_line));
        }
    }

    // Add module-level snippets (after imports, before module script exports)
    // This ensures `const foo = ...` comes before `export { foo }`
    body.extend(module_level_snippets);

    // Add module script non-import content (exports, declarations, etc.)
    // This comes after module_level_snippets so that `export { foo }` can reference `const foo`
    // Transform rune calls ($state, $derived, etc.) in module-level script
    if let Some(non_imports) = module_script_non_imports {
        let transformed = transform_module_script_runes(&non_imports);
        body.push(JsStatement::Raw(transformed));
    }

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

/// Transform rune calls in module-level script content.
/// Module-level $state() becomes $.proxy() for objects/arrays or is unwrapped for primitives.
/// Module-level $state variables are never reassigned (no $.state() wrapper needed).
fn transform_module_script_runes(script: &str) -> String {
    let mut result = script.to_string();

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

    // Transform $state(x) - module-level state is never reassigned
    // Objects/arrays -> $.proxy(x), primitives -> just x
    while let Some(pos) = result.find("$state(") {
        // Make sure this is not $state.something
        if pos + 7 < result.len() && result.as_bytes()[pos + 6] != b'(' {
            // This shouldn't happen since we already handled $state.snapshot/raw/frozen
            break;
        }
        let state_start = pos + 7; // after "$state("
        if let Some(content_end) = find_matching_paren(&result[state_start..]) {
            let content = result[state_start..state_start + content_end].to_string();
            let trimmed_content = content.trim();
            let is_object_or_array =
                trimmed_content.starts_with('{') || trimmed_content.starts_with('[');

            if is_object_or_array || expression_needs_proxy(trimmed_content) {
                // Wrap with $.proxy() for deep reactivity
                result = format!(
                    "{}$.proxy({}){}",
                    &result[..pos],
                    content,
                    &result[state_start + content_end + 1..]
                );
            } else if trimmed_content.is_empty() {
                // Empty $state() -> void 0
                result = format!(
                    "{}void 0{}",
                    &result[..pos],
                    &result[state_start + content_end + 1..]
                );
            } else {
                // Primitive - just extract the value
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    content,
                    &result[state_start + content_end + 1..]
                );
            }
        } else {
            break;
        }
    }

    // Transform $derived.by() to $.derived()
    if result.contains("$derived.by(") {
        result = result.replace("$derived.by(", "$.derived(");
    }

    // Transform $derived() to $.derived(() => expr)
    if result.contains("$derived(") {
        result = result.replace("$derived(", "$.derived(() => ");
    }

    result
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

    // Reset the $$array counters for this component
    // This ensures unique names across multiple $derived destructuring patterns
    DERIVED_ARRAY_COUNTER.with(|c| c.set(0));
    ARRAY_LOOKUP_COUNTER.with(|c| c.set(0));

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

    // DEBUG: Uncomment to print bindings info
    // eprintln!("[DEBUG] All bindings:");
    // for b in &analysis.root.bindings {
    //     eprintln!(
    //         "  - name: {}, kind: {:?}, reassigned: {}",
    //         b.name, b.kind, b.reassigned
    //     );
    // }
    // eprintln!("[DEBUG] state_vars: {:?}", state_vars);
    // eprintln!("[DEBUG] immutable: {}", analysis.immutable);

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

    // Collect exported names from analysis (needed for prop filtering below)
    let exported_names: Vec<String> = analysis.exports.iter().map(|e| e.name.clone()).collect();

    // Collect props that are "sources" (need $.prop() or $.rest_props() declarations)
    // In legacy mode (!runes), ALL props are sources for coarse-grained reactivity.
    // In runes mode, only props that are reassigned, mutated, have initial values, or accessors.
    // Reference: is_prop_source() in svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js
    let prop_source_vars: Vec<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| {
            let is_prop = matches!(
                b.kind,
                BindingKind::Prop | BindingKind::BindableProp | BindingKind::RestProp
            );
            is_prop
                && (!analysis.runes
                    || analysis.accessors
                    || b.reassigned
                    || b.initial.is_some()
                    || b.mutated)
        })
        .map(|b| b.name.clone())
        .collect();

    // Collect props that need assignment transformation ($.prop() getter/setter pattern)
    // This EXCLUDES RestProp bindings which use $.rest_props() and don't need
    // the getter/setter transformation.
    let prop_assignment_transform_vars: Vec<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| {
            // Only Prop and BindableProp need assignment transformation - NOT RestProp
            let is_prop = matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp);
            is_prop
                && (!analysis.runes
                    || analysis.accessors
                    || b.reassigned
                    || b.initial.is_some()
                    || b.mutated)
        })
        .map(|b| b.name.clone())
        .collect();

    // Collect read-only props (props that are not sources and not exported with defaults)
    // These should be accessed directly via $$props.propName
    // Only applicable in runes mode - in legacy mode all props are sources
    let read_only_props: Vec<String> = if analysis.runes {
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| {
                matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp)
                    && !analysis.accessors
                    && !b.reassigned
                    && b.initial.is_none()
                    && !b.mutated
                    && !exported_names.contains(&b.name)
            })
            .map(|b| b.name.clone())
            .collect()
    } else {
        Vec::new() // In legacy mode, no props are read-only
    };

    // Collect legacy state variables (in non-runes mode, State bindings are promoted
    // from Normal bindings that are updated and referenced in template)
    // These need $.mutable_source() wrapping
    let legacy_state_vars: Vec<(String, Option<String>)> = if !analysis.runes {
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::State))
            .map(|b| (b.name.clone(), b.initial.clone()))
            .collect()
    } else {
        Vec::new()
    };

    let mut result = String::new();

    // Track if we're inside a multi-line export block
    let mut in_export_block = false;

    // Accumulator for multi-line statements
    let mut accumulated_lines: Vec<String> = Vec::new();

    // Helper closure to process accumulated lines as a complete statement
    #[allow(clippy::too_many_arguments)]
    let process_accumulated = |accumulated: &[String],
                               result: &mut String,
                               state_vars: &[String],
                               non_reactive_state_vars: &[String],
                               proxy_vars: &[String],
                               raw_state_vars: &[String],
                               store_sub_vars: &[String],
                               prop_source_vars: &[String],
                               prop_assignment_transform_vars: &[String],
                               exported_names: &[String],
                               rest_prop_vars: &[String],
                               read_only_props: &[String],
                               legacy_state_vars: &[(String, Option<String>)],
                               analysis: &ComponentAnalysis,
                               dev: bool,
                               has_legacy_export_let: bool| {
        if accumulated.is_empty() {
            return;
        }

        // Join all accumulated lines into a single statement
        let statement = accumulated.join("\n");
        let first_line_trimmed = accumulated[0].trim();

        // Handle $: reactive statements in legacy (non-runes) mode
        // Transform `$: c = a + b;` to `$.legacy_pre_effect(() => (...deps), () => { c(a() + b()); })`
        if !analysis.runes && first_line_trimmed.starts_with("$:") {
            let transformed = transform_reactive_statement(
                &statement,
                state_vars,
                non_reactive_state_vars,
                proxy_vars,
                prop_assignment_transform_vars,
                analysis,
            );
            // Also apply state assignment transformations to the reactive statement body
            // This handles cases like: `$: selected ? component = Sub : component = banana`
            // where state variables are assigned inside conditional expressions
            let transformed = transform_state_assignments(
                &transformed,
                state_vars,
                non_reactive_state_vars,
                proxy_vars,
                raw_state_vars,
                analysis.runes,
            );
            result.push_str(&transformed);
            result.push('\n');
            return;
        }

        // Handle legacy export let declarations
        if has_legacy_export_let && first_line_trimmed.starts_with("export let ") {
            // Use the full statement for multi-line export declarations
            let transformed = transform_export_let(&statement, analysis);
            result.push_str(&transformed);
            result.push('\n');
            return;
        }

        // Strip `export` keyword from function/const/class declarations
        // In the compiled output, exports are exposed via $$exports object, not ES export syntax
        // Reference: The official compiler processes exports in ExportNamedDeclaration visitor
        // and outputs the declarations without the export keyword
        let statement = if first_line_trimmed.starts_with("export function ")
            || first_line_trimmed.starts_with("export const ")
            || first_line_trimmed.starts_with("export class ")
            || first_line_trimmed.starts_with("export var ")
            || first_line_trimmed.starts_with("export async function ")
        {
            // Remove the "export " prefix from the first line
            let mut lines: Vec<String> = accumulated.to_vec();
            if let Some(first) = lines.first_mut()
                && let Some(pos) = first.find("export ")
            {
                first.replace_range(pos..pos + 7, "");
            }
            lines.join("\n")
        } else {
            statement
        };
        let _first_line_trimmed = first_line_trimmed
            .strip_prefix("export ")
            .unwrap_or(first_line_trimmed);

        // Transform runes ($state, $derived, $effect, $props)
        let transformed = transform_client_runes_with_skip_and_state(
            &statement,
            non_reactive_state_vars,
            state_vars,
            non_reactive_state_vars,
            prop_source_vars,
            exported_names,
            proxy_vars,
            dev,
            analysis,
        );

        // Skip empty transformations (e.g., read-only $props() with no defaults)
        if transformed.trim().is_empty() {
            return;
        }

        // Transform state variable assignments to $.set()
        let transformed = transform_state_assignments(
            &transformed,
            state_vars,
            non_reactive_state_vars,
            proxy_vars,
            raw_state_vars,
            analysis.runes,
        );

        // Transform prop assignments to prop(prop() + value) syntax
        // This handles props declared with `export let` in legacy mode
        // Note: We use prop_assignment_transform_vars which excludes RestProp bindings
        // because rest_props use $.rest_props() which returns a plain object, not getter/setter
        let transformed = transform_prop_assignments(&transformed, prop_assignment_transform_vars);

        // Transform prop source variable reads to prop() calls
        // This handles runes-mode props declared via $props() that become $.prop() getters
        // e.g., `console.log(n)` where `n = $.prop(...)` becomes `console.log(n())`
        // Must come after transform_prop_assignments which handles assignments
        let transformed = if !prop_assignment_transform_vars.is_empty() {
            wrap_prop_source_reads(&transformed, prop_assignment_transform_vars)
        } else {
            transformed
        };

        // Transform store subscription assignments to $.store_set()
        let transformed = transform_store_assignments_client(&transformed, store_sub_vars);

        // Transform store subscription reads to $store()
        // e.g., `const answer = $foo` -> `const answer = $foo()`
        let transformed = transform_store_reads_client(&transformed, store_sub_vars);

        // Wrap state variable reads in $.get() for ALL statements including declarations.
        // This handles cases like:
        // - console.log('init ' + double) - where `double` is a $derived variable
        // - let foo = { get bar() { return bar } } - getter referencing state variable
        // The wrap function already handles skipping left-side-of-assignment cases,
        // so `let bar = ...` won't wrap `bar` on the left side.
        let transformed = wrap_state_vars_in_expr(
            &transformed,
            state_vars,
            non_reactive_state_vars,
            proxy_vars,
        );

        // Transform rest_prop member access to $$props (only in runes mode)
        let transformed = if analysis.runes && !rest_prop_vars.is_empty() {
            transform_rest_prop_member_access(&transformed, rest_prop_vars)
        } else {
            transformed
        };

        // Transform read-only props to $$props.propName (only in runes mode)
        let transformed = if analysis.runes && !read_only_props.is_empty() {
            transform_read_only_props(&transformed, read_only_props)
        } else {
            transformed
        };

        // Transform legacy state declarations to $.mutable_source() (only in non-runes mode)
        let transformed = if !analysis.runes && !legacy_state_vars.is_empty() {
            transform_legacy_state_declarations(&transformed, legacy_state_vars, analysis.immutable)
        } else {
            transformed
        };

        result.push_str(&transformed);
        result.push('\n');
    };

    // Process script lines
    // Collect lines into a Vec so we can peek at the next line for continuation detection
    let script_lines: Vec<&str> = script_rest.lines().collect();
    let mut line_idx = 0;
    while line_idx < script_lines.len() {
        let line = script_lines[line_idx];
        let trimmed = line.trim();

        // Skip empty lines (but preserve them if we're accumulating)
        if trimmed.is_empty() {
            if !accumulated_lines.is_empty() {
                accumulated_lines.push(line.to_string());
            }
            line_idx += 1;
            continue;
        }

        // Skip import statements (already extracted)
        if trimmed.starts_with("import ") {
            line_idx += 1;
            continue;
        }

        // Skip export { ... } statements (will be handled via $$exports object)
        if trimmed.starts_with("export {") {
            in_export_block = !trimmed.contains('}');
            line_idx += 1;
            continue;
        }
        if in_export_block {
            if trimmed.contains('}') {
                in_export_block = false;
            }
            line_idx += 1;
            continue;
        }

        // Skip $props.id() declarations - they will be added as const declarations in the component body
        if (trimmed.contains("= $props.id()") || trimmed.contains("= $.props_id()"))
            && (trimmed.starts_with("let ") || trimmed.starts_with("const "))
        {
            line_idx += 1;
            continue;
        }

        // Add line to accumulator
        accumulated_lines.push(line.to_string());

        // Check if we have a complete statement (balanced braces/parens)
        let combined = accumulated_lines.join("\n");
        if !is_incomplete_expression(&combined) {
            // Before processing, check if the next non-empty line starts with '.'
            // (method chaining continuation like `.fill(null).map(...)`)
            let mut next_continues = false;
            for future_line in script_lines.iter().skip(line_idx + 1) {
                let future_trimmed = future_line.trim();
                if future_trimmed.is_empty() {
                    continue;
                }
                if future_trimmed.starts_with('.') {
                    next_continues = true;
                }
                break;
            }

            if !next_continues {
                // Process the complete statement
                process_accumulated(
                    &accumulated_lines,
                    &mut result,
                    &state_vars,
                    &non_reactive_state_vars,
                    &proxy_vars,
                    &raw_state_vars,
                    &store_sub_vars,
                    &prop_source_vars,
                    &prop_assignment_transform_vars,
                    &exported_names,
                    &rest_prop_vars,
                    &read_only_props,
                    &legacy_state_vars,
                    analysis,
                    dev,
                    has_legacy_export_let,
                );
                accumulated_lines.clear();
            }
        }
        line_idx += 1;
    }

    // Process any remaining accumulated lines
    if !accumulated_lines.is_empty() {
        process_accumulated(
            &accumulated_lines,
            &mut result,
            &state_vars,
            &non_reactive_state_vars,
            &proxy_vars,
            &raw_state_vars,
            &store_sub_vars,
            &prop_source_vars,
            &prop_assignment_transform_vars,
            &exported_names,
            &rest_prop_vars,
            &read_only_props,
            &legacy_state_vars,
            analysis,
            dev,
            has_legacy_export_let,
        );
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
    analysis: &ComponentAnalysis,
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
            // Extract variable name by finding identifier after let/const keyword
            let decl_pattern = if result[..pos].contains("let ") {
                "let "
            } else {
                "const "
            };

            let var_name = if let Some(decl_pos) = result[..pos].rfind(decl_pattern) {
                let after_keyword = &result[decl_pos + decl_pattern.len()..pos];
                // Extract valid identifier characters only (before any '=' sign)
                let before_eq = if let Some(eq_pos) = after_keyword.find('=') {
                    &after_keyword[..eq_pos]
                } else {
                    after_keyword
                };
                before_eq
                    .trim()
                    .chars()
                    .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$')
                    .collect::<String>()
            } else {
                String::new()
            };

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
                        // Empty $state() should become "void 0" (not "undefined")
                        // to match the official Svelte compiler output
                        let extracted_value = if trimmed_content.is_empty() {
                            "void 0"
                        } else if trimmed_content == "undefined" {
                            // Explicit undefined should also become void 0
                            "void 0"
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
                } else if trimmed_content.is_empty() {
                    // Empty $state() - use void 0 explicitly
                    // Example: $state() -> $.state(void 0)
                    result = format!(
                        "{}$.state(void 0){}",
                        &result[..pos],
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

                // Check if the content is an object literal - if so, wrap in parentheses
                // to disambiguate from a block statement
                let wrapped_trimmed = wrapped_content.trim();
                let is_object_literal = wrapped_trimmed.starts_with('{');

                let new_derived = if contains_direct_await {
                    // For async derived: $.async_derived(async () => expr)
                    // The expression may have await calls that need to be preserved
                    if is_object_literal {
                        format!("$.async_derived(async () => ({}))", wrapped_content)
                    } else {
                        format!("$.async_derived(async () => {})", wrapped_content)
                    }
                } else if is_object_literal {
                    format!("$.derived(() => ({}))", wrapped_content)
                } else {
                    // Apply unthunk optimization: $.derived(() => name()) -> $.derived(name)
                    // This matches the official compiler's b.thunk() + unthunk() behavior
                    let derived_arg = unthunk_string(&wrapped_content);
                    format!("$.derived({})", derived_arg)
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

    // Transform $state.eager(x) to $.eager(() => x) - thunk wrapping
    if let Some(pos) = result.find("$state.eager(") {
        let eager_start = pos + 13; // after "$state.eager("
        if let Some(content_end) = find_matching_paren(&result[eager_start..]) {
            let content = &result[eager_start..eager_start + content_end];
            let wrapped_content =
                wrap_state_vars_in_expr(content, state_vars, non_reactive_vars, proxy_vars);
            result = format!(
                "{}$.eager(() => {}){}",
                &result[..pos],
                wrapped_content,
                &result[eager_start + content_end + 1..]
            );
        }
    }

    // Transform $effect.pending() to $.eager($.pending) - MUST be before $effect transformation
    if result.contains("$effect.pending()") {
        result = result.replace("$effect.pending()", "$.eager($.pending)");
    }

    // Transform $effect.pre(x) to $.user_pre_effect(x) - MUST be before $effect transformation
    if result.contains("$effect.pre(") {
        result = result.replace("$effect.pre(", "$.user_pre_effect(");
    }

    // Transform $effect.root(x) to $.effect_root(x)
    if result.contains("$effect.root(") {
        result = result.replace("$effect.root(", "$.effect_root(");
    }

    // Transform $effect.tracking() to $.effect_tracking()
    if result.contains("$effect.tracking()") {
        result = result.replace("$effect.tracking()", "$.effect_tracking()");
    }

    // Transform $effect(x) to $.user_effect(x)
    if result.contains("$effect(") {
        result = result.replace("$effect(", "$.user_effect(");
    }

    // Transform $props.id() to $.props_id()
    if result.contains("$props.id()") {
        result = result.replace("$props.id()", "$.props_id()");
    }

    // Transform $inspect.trace(...) - in non-dev mode, remove the entire statement
    // $inspect.trace() is used to log effect dependencies and should be stripped in production
    while let Some(pos) = result.find("$inspect.trace(") {
        if !dev {
            let trace_start = pos + 15; // after "$inspect.trace("
            if let Some(content_end) = find_matching_paren(&result[trace_start..]) {
                let mut end = trace_start + content_end + 1;
                // Also consume trailing semicolons and whitespace/newline
                while end < result.len()
                    && (result.as_bytes()[end] == b';'
                        || result.as_bytes()[end] == b' '
                        || result.as_bytes()[end] == b'\t'
                        || result.as_bytes()[end] == b'\n'
                        || result.as_bytes()[end] == b'\r')
                {
                    end += 1;
                }
                // Remove leading whitespace/tabs on the same line as $inspect.trace
                let mut start = pos;
                while start > 0
                    && (result.as_bytes()[start - 1] == b' '
                        || result.as_bytes()[start - 1] == b'\t')
                {
                    start -= 1;
                }
                result = format!("{}{}", &result[..start], &result[end..]);
            } else {
                break;
            }
        } else {
            break;
        }
        // In dev mode, $inspect.trace is kept (handled by effect generation)
    }

    // Transform $inspect(...) - in non-dev mode, remove the entire call
    // In dev mode, transform to $.inspect(() => [args], (...$$args) => console.log(...$$args), true)
    if let Some(pos) = result.find("$inspect(") {
        if dev {
            // Find the matching closing paren to get the arguments
            let inspect_start = pos + 9; // after "$inspect("
            if let Some(content_end) = find_matching_paren(&result[inspect_start..]) {
                let args_content = &result[inspect_start..inspect_start + content_end];

                // Check if this is $inspect().with() pattern
                let after_inspect = &result[inspect_start + content_end + 1..];
                if after_inspect.trim_start().starts_with(".with(") {
                    // $inspect(...).with(callback) pattern
                    let with_start_offset = after_inspect.find(".with(").unwrap();
                    let with_content_start =
                        inspect_start + content_end + 1 + with_start_offset + 6;
                    if let Some(with_end) = find_matching_paren(&result[with_content_start..]) {
                        let callback = &result[with_content_start..with_content_start + with_end];
                        let rest = &result[with_content_start + with_end + 1..];

                        // Build: $.inspect(() => [args], (...$$args) => callback(...$$args))
                        // Note: No third argument for $inspect().with
                        result = format!(
                            "{}$.inspect(() => [{}], (...$$args) => {}(...$$args)){}",
                            &result[..pos],
                            args_content,
                            callback,
                            rest
                        );
                    }
                } else {
                    // Simple $inspect(...) pattern
                    // Build: $.inspect(() => [args], (...$$args) => console.log(...$$args), true)
                    result = format!(
                        "{}$.inspect(() => [{}], (...$$args) => console.log(...$$args), true){}",
                        &result[..pos],
                        args_content,
                        &result[inspect_start + content_end + 1..]
                    );
                }
            }
        } else {
            // In non-dev mode, remove the entire $inspect(...) call
            // Find matching closing paren
            let inspect_start = pos + 9; // after "$inspect("
            if let Some(content_end) = find_matching_paren(&result[inspect_start..]) {
                // Check for .with() chaining
                let after_inspect = &result[inspect_start + content_end + 1..];
                let total_end = if after_inspect.trim_start().starts_with(".with(") {
                    let with_start_offset = after_inspect.find(".with(").unwrap();
                    let with_content_start =
                        inspect_start + content_end + 1 + with_start_offset + 6;
                    if let Some(with_end) = find_matching_paren(&result[with_content_start..]) {
                        with_content_start + with_end + 1 - pos
                    } else {
                        inspect_start + content_end + 1 - pos
                    }
                } else {
                    inspect_start + content_end + 1 - pos
                };

                // Check if the $inspect call is a statement on its own
                let before = result[..pos].trim();
                let after = result[pos + total_end..].trim();

                // If the line is just the $inspect call, output empty statements (;;)
                // This matches the official Svelte compiler behavior in non-dev mode
                if before.is_empty() && (after.is_empty() || after == ";") {
                    return ";;".to_string();
                } else {
                    // Remove just the $inspect(...) part but keep other code on the line
                    result = format!("{}{}", &result[..pos], &result[pos + total_end..]);
                }
            }
        }
    }

    // Transform $props() destructuring to $.prop() calls (only for source props)
    if result.contains("$props()")
        && let Some(transformed) =
            transform_props_destructuring(&result, prop_source_vars, exported_names, analysis)
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

    // First pass: collect ONLY $$array helper declarations for nested array patterns
    // These must come first because other declarations depend on them
    for prop in &properties {
        let prop = prop.trim();
        if prop.is_empty() || prop.starts_with("...") {
            continue;
        }
        if let Some(colon_pos) = find_derived_property_colon(prop) {
            let key = prop[..colon_pos].trim();
            let value_pattern = prop[colon_pos + 1..].trim();
            let prop_access = format!("{}.{}", base_expr, key);
            if value_pattern.starts_with('[') || value_pattern.starts_with('{') {
                collect_array_helpers_only(value_pattern, &prop_access, declarations)?;
            }
        }
    }

    // Second pass: process all properties in source order
    for prop in &properties {
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
                // Process nested pattern elements (not the $$array helpers, already added)
                process_nested_pattern_elements(
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

/// Collect ONLY $$array helper declarations from nested patterns.
/// This is used in the first pass to ensure $$array declarations come before
/// the variable declarations that depend on them.
fn collect_array_helpers_only(
    pattern: &str,
    base_expr: &str,
    declarations: &mut Vec<String>,
) -> Option<()> {
    let pattern = pattern.trim();
    if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_derived_array_elements(inner);
        let element_count = elements.len();

        // Generate the $$array helper
        let global_counter = DERIVED_ARRAY_COUNTER.with(|c| {
            let current = c.get();
            c.set(current + 1);
            current
        });

        let array_var = if global_counter == 0 {
            "$$array".to_string()
        } else {
            format!("$$array_{}", global_counter)
        };

        declarations.push(format!(
            "{} = $.derived(() => $.to_array({}, {}))",
            array_var, base_expr, element_count
        ));

        // Recursively collect array helpers from nested patterns
        for (index, element) in elements.iter().enumerate() {
            let element = element.trim();
            if element.is_empty() || element.starts_with("...") {
                continue;
            }
            let element_access = format!("$.get({})[{}]", array_var, index);
            if element.starts_with('[') || element.starts_with('{') {
                collect_array_helpers_only(element, &element_access, declarations)?;
            }
        }
    } else if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_derived_object_properties(inner);

        // Recursively collect array helpers from nested patterns in object properties
        for prop in &properties {
            let prop = prop.trim();
            if prop.is_empty() || prop.starts_with("...") {
                continue;
            }
            if let Some(colon_pos) = find_derived_property_colon(prop) {
                let key = prop[..colon_pos].trim();
                let value_pattern = prop[colon_pos + 1..].trim();
                let prop_access = format!("{}.{}", base_expr, key);
                if value_pattern.starts_with('[') || value_pattern.starts_with('{') {
                    collect_array_helpers_only(value_pattern, &prop_access, declarations)?;
                }
            }
        }
    }
    Some(())
}

/// Process nested pattern elements (variables), assuming $$array helpers are already declared.
/// This handles the actual variable declarations in source order.
fn process_nested_pattern_elements(
    pattern: &str,
    base_expr: &str,
    declarations: &mut Vec<String>,
    _array_counter: &mut usize,
) -> Option<()> {
    let pattern = pattern.trim();
    if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_derived_array_elements(inner);

        // Get the array variable that was already created by collect_array_helpers_only
        // We need to track which $$array we're using - use a separate counter for lookups
        let array_var = get_current_array_var_for_base(base_expr);

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
                process_nested_pattern_elements(
                    element,
                    &element_access,
                    declarations,
                    _array_counter,
                )?;
            } else {
                declarations.push(format!("{} = $.derived(() => {})", element, element_access));
            }
        }
    } else if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_derived_object_properties(inner);

        for prop in &properties {
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
                    process_nested_pattern_elements(
                        value_pattern,
                        &prop_access,
                        declarations,
                        _array_counter,
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
    }
    Some(())
}

/// Helper to determine which $$array variable corresponds to a given base expression.
/// This is needed because we pre-generate $$array helpers in the first pass,
/// and need to reference the correct one in the second pass.
fn get_current_array_var_for_base(_base_expr: &str) -> String {
    // The $$array variables are generated in order during collect_array_helpers_only.
    // We use the module-level ARRAY_LOOKUP_COUNTER to track which $$array we're on.
    // This counter is reset at the start of each component transformation along with
    // DERIVED_ARRAY_COUNTER to ensure they stay in sync.
    let counter = ARRAY_LOOKUP_COUNTER.with(|c| {
        let current = c.get();
        c.set(current + 1);
        current
    });

    if counter == 0 {
        "$$array".to_string()
    } else {
        format!("$$array_{}", counter)
    }
}

fn process_derived_array_pattern(
    inner: &str,
    base_expr: &str,
    declarations: &mut Vec<String>,
    _array_counter: &mut usize,
) -> Option<()> {
    let elements = split_derived_array_elements(inner);
    let element_count = elements.len();

    // Use the global counter to generate a unique $$array variable name
    // This ensures unique names across multiple $derived destructuring patterns
    let global_counter = DERIVED_ARRAY_COUNTER.with(|c| {
        let current = c.get();
        c.set(current + 1);
        current
    });

    let array_var = if global_counter == 0 {
        "$$array".to_string()
    } else {
        format!("$$array_{}", global_counter)
    };

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
            // Pass a dummy counter for nested patterns - the global counter is used instead
            let mut nested_counter = 0;
            process_derived_destructuring_pattern(
                element,
                &element_access,
                declarations,
                &mut nested_counter,
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

/// Transform a `$:` reactive statement to `$.legacy_pre_effect()` call.
///
/// In legacy mode (Svelte 4), reactive statements like `$: c = a + b;` are transformed to:
/// ```javascript
/// $.legacy_pre_effect(() => ($.deep_read_state(a()), $.deep_read_state(b())), () => {
///     c(a() + b());
/// });
/// ```
///
/// The first thunk contains the dependencies (for tracking), wrapped in `$.deep_read_state()`.
/// The second thunk contains the body of the reactive statement.
///
/// Reference: `LabeledStatement.js` in `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/`
#[allow(clippy::too_many_arguments)]
fn transform_reactive_statement(
    statement: &str,
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    proxy_vars: &[String],
    prop_assignment_transform_vars: &[String],
    _analysis: &ComponentAnalysis,
) -> String {
    let trimmed = statement.trim();

    // Extract the body after `$:`
    // Handle both `$: body` and `$:\n body` formats
    let body = if let Some(stripped) = trimmed.strip_prefix("$:") {
        stripped.trim()
    } else {
        return statement.to_string();
    };

    // Remove trailing semicolon if present
    let body = body.trim_end_matches(';').trim();

    if body.is_empty() {
        return String::new();
    }

    // Collapse method chain continuations into a single line.
    // For multi-line reactive statements like:
    //   $: ids = new Array(count)
    //       .fill(null)
    //       .map((_, i) => 'id-' + i)
    // Join continuation lines (starting with '.') onto the previous line to ensure
    // the entire expression is treated as a single unit during assignment detection.
    let body_owned = {
        let mut collapsed = String::new();
        for line in body.lines() {
            let t = line.trim();
            if t.starts_with('.') && !collapsed.is_empty() {
                // Append chain continuation without newline
                collapsed.push_str(t);
            } else {
                if !collapsed.is_empty() {
                    collapsed.push('\n');
                }
                collapsed.push_str(line);
            }
        }
        collapsed
    };
    let body = body_owned.trim_end_matches(';').trim();

    // Collect dependencies from the body
    // Dependencies are prop variables that should be wrapped in $.deep_read_state()
    let mut dependencies: Vec<String> = Vec::new();

    // Props are dependencies that need tracking
    for prop_name in prop_assignment_transform_vars {
        // Check if this prop is referenced in the body (but not on the left side of assignment)
        if body_references_identifier(body, prop_name) {
            dependencies.push(prop_name.clone());
        }
    }

    // State vars are also dependencies
    for state_var in state_vars {
        if !non_reactive_state_vars.contains(state_var)
            && body_references_identifier(body, state_var)
        {
            dependencies.push(state_var.clone());
        }
    }

    // Transform the body - apply prop transformations
    // For `$: c = a + b;`, the body should become `c(a() + b());`
    // This involves:
    // 1. Transform prop reads to prop() calls
    // 2. Transform prop assignments to prop(value) calls
    let transformed_body;

    // First, check if this is an assignment statement: `c = expr`
    if let Some(eq_pos) = find_assignment_position(body) {
        let lhs = body[..eq_pos].trim();
        let rhs = body[eq_pos + 1..].trim();

        // If the LHS is a prop variable, transform to prop(value) call
        if prop_assignment_transform_vars.contains(&lhs.to_string()) {
            // Transform the RHS - wrap prop references in prop() calls
            let transformed_rhs = transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
            // Also wrap state vars in $.get() calls
            let transformed_rhs = wrap_state_vars_in_expr(
                &transformed_rhs,
                state_vars,
                non_reactive_state_vars,
                proxy_vars,
            );

            transformed_body = format!("{}({})", lhs, transformed_rhs);
        } else {
            // Regular assignment - still transform prop reads on RHS
            let transformed_rhs = transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
            let transformed_rhs = wrap_state_vars_in_expr(
                &transformed_rhs,
                state_vars,
                non_reactive_state_vars,
                proxy_vars,
            );
            transformed_body = format!("{} = {}", lhs, transformed_rhs);
        }
    } else {
        // Not a simple assignment - handle compound assignments (+=, -=, etc.),
        // update expressions (++/--), and reads.
        // First transform prop compound assignments (e.g., `count += 1` → `count(count() + 1)`)
        let temp = transform_prop_assignments(body, prop_assignment_transform_vars);
        // Transform prop update expressions like `x++` to `$.update_prop(x)`
        let temp = transform_prop_update_expressions(&temp, prop_assignment_transform_vars);
        // Also transform state update expressions
        let temp = transform_state_update_expressions(&temp, state_vars, non_reactive_state_vars);
        // Then transform reads
        let temp = transform_prop_reads_in_expr(&temp, prop_assignment_transform_vars);
        transformed_body =
            wrap_state_vars_in_expr(&temp, state_vars, non_reactive_state_vars, proxy_vars);
    }

    // Build the dependency thunk
    // Each dependency becomes $.deep_read_state(prop())
    let deps_expr = if dependencies.is_empty() {
        "".to_string()
    } else {
        dependencies
            .iter()
            .map(|dep| format!("$.deep_read_state({}())", dep))
            .collect::<Vec<_>>()
            .join(", ")
    };

    // Build the $.legacy_pre_effect() call
    // The dependency expression is always wrapped in parentheses to support:
    // 1. Multiple deps: () => (dep1, dep2) - sequence expression
    // 2. Single dep: () => (dep) - keeps consistent formatting with expected output
    let deps_thunk = if deps_expr.is_empty() {
        "() => {}".to_string()
    } else {
        format!("() => ({})", deps_expr)
    };

    // Debug: uncomment to trace
    // eprintln!("[DEBUG transform_reactive_statement] body: {}", body);
    // eprintln!("[DEBUG transform_reactive_statement] deps_expr: {}", deps_expr);
    // eprintln!("[DEBUG transform_reactive_statement] deps_thunk: {}", deps_thunk);
    // eprintln!("[DEBUG transform_reactive_statement] transformed_body: {}", transformed_body);

    format!(
        "$.legacy_pre_effect({}, () => {{\n\t{};\n}});",
        deps_thunk, transformed_body
    )
}

/// Transform update expressions (++ / --) for prop variables.
///
/// Converts `x++` to `$.update_prop(x)`, `++x` to `$.update_pre_prop(x)`,
/// `x--` to `$.update_prop(x, -1)`, and `--x` to `$.update_pre_prop(x, -1)`.
fn transform_prop_update_expressions(expr: &str, prop_vars: &[String]) -> String {
    let mut result = expr.to_string();
    for var in prop_vars {
        // Transform postfix x++ to $.update_prop(x)
        let post_inc = format!("{}++", var);
        result = replace_with_word_boundary(
            &result,
            &post_inc,
            &format!("$.update_prop({})", var),
            false,
        );
        // Transform postfix x-- to $.update_prop(x, -1)
        let post_dec = format!("{}--", var);
        result = replace_with_word_boundary(
            &result,
            &post_dec,
            &format!("$.update_prop({}, -1)", var),
            false,
        );
        // Transform prefix ++x to $.update_pre_prop(x)
        let pre_inc = format!("++{}", var);
        result = replace_with_word_boundary(
            &result,
            &pre_inc,
            &format!("$.update_pre_prop({})", var),
            true,
        );
        // Transform prefix --x to $.update_pre_prop(x, -1)
        let pre_dec = format!("--{}", var);
        result = replace_with_word_boundary(
            &result,
            &pre_dec,
            &format!("$.update_pre_prop({}, -1)", var),
            true,
        );
    }
    result
}

/// Transform update expressions (++ / --) for state variables.
///
/// Converts `x++` to `$.update(x)`, `++x` to `$.update_pre(x)`,
/// `x--` to `$.update(x, -1)`, and `--x` to `$.update_pre(x, -1)`.
///
/// Note: This is similar to the logic in `transform_state_assignments` but
/// specifically for use in reactive statement bodies before other transformations.
fn transform_state_update_expressions(
    expr: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> String {
    let mut result = expr.to_string();
    for var in state_vars {
        if non_reactive_vars.contains(var) {
            continue;
        }
        // Transform postfix x++ to $.update(x)
        let post_inc = format!("{}++", var);
        result =
            replace_with_word_boundary(&result, &post_inc, &format!("$.update({})", var), false);
        // Transform postfix x-- to $.update(x, -1)
        let post_dec = format!("{}--", var);
        result = replace_with_word_boundary(
            &result,
            &post_dec,
            &format!("$.update({}, -1)", var),
            false,
        );
        // Transform prefix ++x to $.update_pre(x)
        let pre_inc = format!("++{}", var);
        result =
            replace_with_word_boundary(&result, &pre_inc, &format!("$.update_pre({})", var), true);
        // Transform prefix --x to $.update_pre(x, -1)
        let pre_dec = format!("--{}", var);
        result = replace_with_word_boundary(
            &result,
            &pre_dec,
            &format!("$.update_pre({}, -1)", var),
            true,
        );
    }
    result
}

/// Check if a body references an identifier (not on left side of assignment).
fn body_references_identifier(body: &str, identifier: &str) -> bool {
    // Simple check - look for the identifier as a word boundary
    // This is not perfect but good enough for most cases
    let pattern = format!(r"\b{}\b", regex::escape(identifier));
    if let Ok(re) = regex::Regex::new(&pattern) {
        // Check if identifier appears in the body
        if re.is_match(body) {
            // Make sure it's not only on the left side of an assignment
            if let Some(eq_pos) = find_assignment_position(body) {
                let lhs = &body[..eq_pos];
                let rhs = &body[eq_pos + 1..];
                // Check RHS - if identifier is there, it's a dependency
                if re.is_match(rhs) {
                    return true;
                }
                // Check LHS but only if identifier is NOT the whole LHS
                if re.is_match(lhs) && lhs.trim() != identifier {
                    return true;
                }
                return false;
            }
            return true;
        }
    }
    false
}

/// Find the position of the assignment operator (=) that's not part of ==, ===, !=, !==
fn find_assignment_position(expr: &str) -> Option<usize> {
    let chars: Vec<char> = expr.chars().collect();
    let mut i = 0;
    let mut depth = 0;

    while i < chars.len() {
        let c = chars[i];
        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '=' if depth == 0 => {
                // Check it's not ==, ===, !=, !==, <=, >=, =>,
                // or compound assignment operators: +=, -=, *=, /=, %=, **=,
                // <<=, >>=, >>>=, &=, |=, ^=, &&=, ||=, ??=
                let prev = if i > 0 { Some(chars[i - 1]) } else { None };
                let next = chars.get(i + 1).copied();

                if prev != Some('=')
                    && prev != Some('!')
                    && prev != Some('<')
                    && prev != Some('>')
                    && prev != Some('+')
                    && prev != Some('-')
                    && prev != Some('*')
                    && prev != Some('/')
                    && prev != Some('%')
                    && prev != Some('&')
                    && prev != Some('|')
                    && prev != Some('^')
                    && prev != Some('?')
                    && next != Some('=')
                    && next != Some('>')
                {
                    return Some(i);
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Transform prop reads in an expression to prop() calls.
///
/// For example, `a + b` where `a` and `b` are props becomes `a() + b()`.
fn transform_prop_reads_in_expr(expr: &str, prop_vars: &[String]) -> String {
    let mut result = expr.to_string();

    for prop_name in prop_vars {
        // Use word boundary matching to replace identifier references
        // But avoid replacing function calls that already have ()
        // Note: Rust's regex crate doesn't support lookahead, so we use a different approach:
        // Match the identifier and check the context manually

        let mut new_result = String::with_capacity(result.len() * 2);
        let chars: Vec<char> = result.chars().collect();
        let mut i = 0;

        while i < chars.len() {
            // Check if we're at the start of the identifier
            let remaining = &result[result
                .char_indices()
                .nth(i)
                .map(|(idx, _)| idx)
                .unwrap_or(i)..];
            if remaining.starts_with(prop_name) {
                // Check character before (must be non-identifier char or start of string)
                let before_ok = if i == 0 {
                    true
                } else {
                    let prev_char = chars[i - 1];
                    !prev_char.is_alphanumeric() && prev_char != '_' && prev_char != '$'
                };

                // Check character after (must be non-identifier char)
                let after_idx = i + prop_name.len();
                let after_ok = if after_idx >= chars.len() {
                    true
                } else {
                    let next_char = chars[after_idx];
                    !next_char.is_alphanumeric() && next_char != '_' && next_char != '$'
                };

                // Check if it's NOT already followed by ()
                let is_already_call = if after_idx < chars.len() {
                    // Skip whitespace
                    let mut check_idx = after_idx;
                    while check_idx < chars.len() && chars[check_idx].is_whitespace() {
                        check_idx += 1;
                    }
                    check_idx < chars.len() && chars[check_idx] == '('
                } else {
                    false
                };

                // Check if this is a target of an update expression (++ or --)
                // e.g., x++ or ++x - these should not be wrapped with ()
                // as they need special $.update_prop() handling
                let is_update_target = {
                    // Check for postfix ++ or --
                    let has_postfix = after_idx + 1 < chars.len()
                        && ((chars[after_idx] == '+' && chars[after_idx + 1] == '+')
                            || (chars[after_idx] == '-' && chars[after_idx + 1] == '-'));
                    // Check for prefix ++ or --
                    let has_prefix = i >= 2
                        && ((chars[i - 2] == '+' && chars[i - 1] == '+')
                            || (chars[i - 2] == '-' && chars[i - 1] == '-'));
                    has_postfix || has_prefix
                };

                // Check if this is on the left side of an assignment
                let is_assignment_target = {
                    let mut k = after_idx;
                    while k < chars.len() && chars[k].is_whitespace() {
                        k += 1;
                    }
                    if k < chars.len() && chars[k] == '=' {
                        // Make sure it's not == or ===
                        !(k + 1 < chars.len() && chars[k + 1] == '=')
                    } else {
                        k + 1 < chars.len()
                            && chars[k + 1] == '='
                            && (chars[k] == '+'
                                || chars[k] == '-'
                                || chars[k] == '*'
                                || chars[k] == '/')
                    }
                };

                // Check if this identifier is inside a $.update_prop() or similar call
                // After transform_prop_update_expressions runs, we get $.update_prop(x)
                // and we must not convert x to x() inside that call
                let is_inside_update_call = {
                    let prefix_str = &result[..result
                        .char_indices()
                        .nth(i)
                        .map(|(idx, _)| idx)
                        .unwrap_or(i)];
                    prefix_str.ends_with("$.update_prop(")
                        || prefix_str.ends_with("$.update_pre_prop(")
                        || prefix_str.ends_with("$.update_prop(")
                        || prefix_str.ends_with("$.update_pre_prop(")
                };

                if before_ok
                    && after_ok
                    && !is_already_call
                    && !is_update_target
                    && !is_assignment_target
                    && !is_inside_update_call
                {
                    // Replace with prop_name()
                    new_result.push_str(prop_name);
                    new_result.push_str("()");
                    i += prop_name.len();
                    continue;
                }
            }

            // No match, just copy the character
            new_result.push(chars[i]);
            i += 1;
        }

        result = new_result;
    }

    result
}

/// Wrap prop source variable reads with `()` calls in a multi-line statement.
///
/// This uses the same sophisticated logic as `transform_state_in_expr` to correctly
/// handle string literals, comments, assignment targets, function parameters, etc.
/// but wraps with `var()` instead of `$.get(var)`.
///
/// For example:
/// - `console.log(n)` becomes `console.log(n())` where `n` is a prop source
/// - `let n = $.prop(...)` is NOT modified (declaration line)
/// - `n = 5` is NOT modified (already handled by transform_prop_assignments)
fn wrap_prop_source_reads(expr: &str, prop_vars: &[String]) -> String {
    // Skip lines that are prop declarations (contain $.prop()
    // These are generated by transform_props_destructuring and should not be modified
    if expr.contains("$.prop(") || expr.contains("$.prop_source(") {
        return expr.to_string();
    }

    let mut result = expr.to_string();

    for var in prop_vars {
        let mut new_result = String::new();
        let chars: Vec<char> = result.chars().collect();
        let var_chars: Vec<char> = var.chars().collect();
        let mut i = 0;

        // Track whether we're inside a string literal
        let mut in_string: Option<char> = None;
        let mut in_line_comment = false;
        let mut in_block_comment = false;
        // Track template literal nesting for ${} expressions
        let mut template_depth: Vec<usize> = Vec::new(); // stack of brace depths

        while i < chars.len() {
            let c = chars[i];

            // Handle line comment end
            if in_line_comment {
                new_result.push(c);
                if c == '\n' {
                    in_line_comment = false;
                }
                i += 1;
                continue;
            }

            // Handle block comment end
            if in_block_comment {
                new_result.push(c);
                if c == '*' && i + 1 < chars.len() && chars[i + 1] == '/' {
                    new_result.push('/');
                    i += 2;
                    in_block_comment = false;
                    continue;
                }
                i += 1;
                continue;
            }

            // Handle template literal ${} expressions
            if in_string == Some('`') {
                if c == '\\' && i + 1 < chars.len() {
                    new_result.push(c);
                    new_result.push(chars[i + 1]);
                    i += 2;
                    continue;
                }
                if c == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
                    // Enter template expression - code context
                    new_result.push('$');
                    new_result.push('{');
                    template_depth.push(1);
                    in_string = None; // temporarily exit string mode
                    i += 2;
                    continue;
                }
                if c == '`' {
                    in_string = None;
                    new_result.push(c);
                    i += 1;
                    continue;
                }
                // Inside template literal string part - copy as-is
                new_result.push(c);
                i += 1;
                continue;
            }

            // Track braces inside template expressions
            if !template_depth.is_empty() && in_string.is_none() {
                if c == '{' {
                    if let Some(depth) = template_depth.last_mut() {
                        *depth += 1;
                    }
                } else if c == '}'
                    && let Some(depth) = template_depth.last_mut()
                {
                    *depth -= 1;
                    if *depth == 0 {
                        // Exit template expression - back to template literal string
                        template_depth.pop();
                        in_string = Some('`');
                        new_result.push('}');
                        i += 1;
                        continue;
                    }
                }
            }

            // Handle string literal boundaries (non-template)
            if in_string.is_none() {
                // Check for comment start
                if c == '/' && i + 1 < chars.len() {
                    if chars[i + 1] == '/' {
                        in_line_comment = true;
                        new_result.push(c);
                        i += 1;
                        continue;
                    } else if chars[i + 1] == '*' {
                        in_block_comment = true;
                        new_result.push(c);
                        i += 1;
                        continue;
                    }
                }

                if c == '\'' || c == '"' {
                    in_string = Some(c);
                    new_result.push(c);
                    i += 1;
                    continue;
                }
                if c == '`' {
                    in_string = Some('`');
                    new_result.push(c);
                    i += 1;
                    continue;
                }
            } else {
                // Inside single/double quote string
                if Some(c) == in_string {
                    let escaped = if i > 0 && chars[i - 1] == '\\' {
                        let mut backslash_count = 0;
                        let mut j = i - 1;
                        loop {
                            if chars[j] == '\\' {
                                backslash_count += 1;
                            } else {
                                break;
                            }
                            if j == 0 {
                                break;
                            }
                            j -= 1;
                        }
                        backslash_count % 2 == 1
                    } else {
                        false
                    };
                    if !escaped {
                        in_string = None;
                    }
                }
                new_result.push(c);
                i += 1;
                continue;
            }

            // Skip replacements inside string literals
            if in_string.is_some() {
                new_result.push(c);
                i += 1;
                continue;
            }

            // Check for variable match
            if i + var_chars.len() <= chars.len() {
                let potential_match: String = chars[i..i + var_chars.len()].iter().collect();
                if potential_match == *var {
                    let before_ok = i == 0 || !is_identifier_char(chars[i - 1]);
                    let after_ok = i + var_chars.len() >= chars.len()
                        || !is_identifier_char(chars[i + var_chars.len()]);

                    if before_ok && after_ok {
                        // Check if preceded by dot (member access - skip)
                        let preceded_by_dot = i > 0
                            && chars[i - 1] == '.'
                            && !(i >= 3 && chars[i - 3..i].iter().collect::<String>() == "...");

                        // Check if already followed by ( (already a call)
                        let after_idx = i + var_chars.len();
                        let is_already_call = if after_idx < chars.len() {
                            let mut check_idx = after_idx;
                            while check_idx < chars.len() && chars[check_idx].is_whitespace() {
                                check_idx += 1;
                            }
                            check_idx < chars.len() && chars[check_idx] == '('
                        } else {
                            false
                        };

                        // Check if in function parameter position
                        let in_param_position =
                            is_in_function_param_position(&chars, i, i + var_chars.len());

                        // Check if on left side of assignment
                        let is_assignment_target =
                            is_on_left_side_of_assignment(&chars, i, var_chars.len());

                        // Check if is getter/setter name
                        let is_getter_setter_name = {
                            let after_idx2 = i + var_chars.len();
                            let mut k = after_idx2;
                            while k < chars.len() && chars[k].is_whitespace() {
                                k += 1;
                            }
                            let has_paren_after = k < chars.len() && chars[k] == '(';
                            let has_get_before = i >= 4 && {
                                let prefix: String = chars[i - 4..i].iter().collect();
                                prefix == "get "
                            };
                            let has_set_before = i >= 4 && {
                                let prefix: String = chars[i - 4..i].iter().collect();
                                prefix == "set "
                            };
                            has_paren_after && (has_get_before || has_set_before)
                        };

                        // Check if object property key
                        let is_property_key = {
                            let after_idx2 = i + var_chars.len();
                            let mut k = after_idx2;
                            while k < chars.len() && chars[k].is_whitespace() {
                                k += 1;
                            }
                            k < chars.len() && chars[k] == ':'
                        };

                        // Check if shorthand property
                        let is_shorthand_property =
                            is_shorthand_object_property(&chars, i, var_chars.len());

                        // Check if shadowed
                        let is_shadowed = is_shadowed_by_function_param(&chars, i, var);

                        if !preceded_by_dot
                            && !is_already_call
                            && !in_param_position
                            && !is_assignment_target
                            && !is_getter_setter_name
                            && !is_property_key
                            && !is_shadowed
                        {
                            if is_shorthand_property {
                                // Expand shorthand property: { answer } -> { answer: answer() }
                                new_result.push_str(var);
                                new_result.push_str(": ");
                                new_result.push_str(var);
                                new_result.push_str("()");
                            } else {
                                new_result.push_str(var);
                                new_result.push_str("()");
                            }
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

fn transform_export_let(line: &str, analysis: &ComponentAnalysis) -> String {
    let trimmed = line.trim();

    // Pattern: export let name = value; or export let name;
    if !trimmed.starts_with("export let ") {
        return line.to_string();
    }

    let rest = trimmed[11..].trim(); // After "export let "
    let rest = rest.trim_end_matches(';').trim();

    // Handle multiple declarators: export let a, b, c;
    // Split by comma, but be careful of commas inside default values
    let declarators = split_declarators(rest);

    let mut results = Vec::new();

    for decl in declarators {
        let decl = decl.trim();
        if decl.is_empty() {
            continue;
        }

        // Parse: name = value or just name
        if let Some(eq_pos) = decl.find('=') {
            let name = decl[..eq_pos].trim();
            let mut value = decl[eq_pos + 1..].trim();

            // Remove trailing line comment if present
            // Need to handle strings correctly - don't strip // inside strings
            if let Some(comment_pos) = find_line_comment_position(value) {
                value = value[..comment_pos].trim();
            }

            // Remove trailing semicolon from value (after comment removal)
            let value = value.trim_end_matches(';').trim();

            // Check if the value is a "simple expression" that can be passed directly
            // Non-simple expressions need to be wrapped in a thunk and use PROPS_IS_LAZY_INITIAL
            let is_simple = is_simple_expression_str(value);

            // Calculate flags: PROPS_IS_BINDABLE + PROPS_IS_UPDATED + PROPS_IS_LAZY_INITIAL
            let flags = calculate_prop_flags(name, analysis, !is_simple);

            if is_simple {
                results.push(format!(
                    "let {} = $.prop($$props, '{}', {}, {});",
                    name, name, flags, value
                ));
            } else {
                // Wrap non-simple values in a thunk: () => value
                // When value starts with '{', wrap in parens to prevent
                // OXC from parsing `() => {...}` as arrow with block body
                // instead of arrow returning object literal
                let thunk_value = if value.starts_with('{') {
                    format!("({})", value)
                } else {
                    value.to_string()
                };
                results.push(format!(
                    "let {} = $.prop($$props, '{}', {}, () => {});",
                    name, name, flags, thunk_value
                ));
            }
        } else {
            let name = decl;
            // Calculate flags: PROPS_IS_BINDABLE + PROPS_IS_UPDATED if the binding is updated
            let flags = calculate_prop_flags(name, analysis, false);

            results.push(format!(
                "let {} = $.prop($$props, '{}', {});",
                name, name, flags
            ));
        }
    }

    results.join("\n")
}

/// Calculate the prop flags for a given prop name.
///
/// Matches the official Svelte compiler's `get_prop_source()` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js`
///
/// Flags start at 0 and are built up based on binding and analysis state:
/// - PROPS_IS_IMMUTABLE (1): if analysis.immutable
/// - PROPS_IS_RUNES (2): if analysis.runes
/// - PROPS_IS_UPDATED (4): if accessors, or binding is updated (with immutable-aware logic)
/// - PROPS_IS_BINDABLE (8): only if binding.kind == BindableProp
/// - PROPS_IS_LAZY_INITIAL (16): if default value is non-simple
fn calculate_prop_flags(name: &str, analysis: &ComponentAnalysis, is_lazy_initial: bool) -> i32 {
    use crate::compiler::constants::{
        PROPS_IS_BINDABLE, PROPS_IS_IMMUTABLE, PROPS_IS_LAZY_INITIAL, PROPS_IS_RUNES,
        PROPS_IS_UPDATED,
    };
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    let mut flags = 0;

    // Look up the binding to check its kind and update status
    let binding = analysis
        .root
        .find_binding_any_scope(name)
        .and_then(|idx| analysis.root.bindings.get(idx));

    // PROPS_IS_BINDABLE: only if binding.kind == BindableProp
    if let Some(b) = binding
        && b.kind == BindingKind::BindableProp
    {
        flags |= PROPS_IS_BINDABLE;
    }

    // PROPS_IS_IMMUTABLE: if analysis.immutable
    if analysis.immutable {
        flags |= PROPS_IS_IMMUTABLE;
    }

    // PROPS_IS_RUNES: if analysis.runes
    if analysis.runes {
        flags |= PROPS_IS_RUNES;
    }

    // PROPS_IS_UPDATED: matches official logic:
    // if (accessors || (immutable ? (reassigned || (runes && mutated)) : updated))
    if analysis.accessors {
        flags |= PROPS_IS_UPDATED;
    } else if let Some(b) = binding {
        let is_updated = if analysis.immutable {
            b.reassigned || (analysis.runes && b.mutated)
        } else {
            b.is_updated()
        };
        if is_updated {
            flags |= PROPS_IS_UPDATED;
        }
    }

    // PROPS_IS_LAZY_INITIAL: if the default value needs to be wrapped in a thunk
    if is_lazy_initial {
        flags |= PROPS_IS_LAZY_INITIAL;
    }

    flags
}

/// Check if a value string represents a "simple expression" that can be passed directly.
///
/// Simple expressions don't need to be wrapped in a thunk (factory function).
/// This matches the official Svelte compiler's `is_simple_expression()` function.
///
/// Simple expressions include:
/// - Literals (numbers, strings, booleans, null, undefined)
/// - Identifiers (variable references)
/// - Arrow function expressions
/// - Function expressions
/// - Binary and logical expressions where both sides are simple
/// - Conditional expressions where all parts are simple
///
/// Non-simple expressions include:
/// - Array literals: [1, 2, 3]
/// - Object literals: { a: 1 }
/// - Call expressions: foo()
/// - Template literals with expressions: `${x}`
fn is_simple_expression_str(value: &str) -> bool {
    let trimmed = value.trim();

    // Empty is not simple
    if trimmed.is_empty() {
        return false;
    }

    // Array literals are NOT simple
    if trimmed.starts_with('[') {
        return false;
    }

    // Object literals are NOT simple
    if trimmed.starts_with('{') {
        return false;
    }

    // Call expressions are NOT simple (unless it's a no-arg function reference)
    // e.g., foo() is not simple, but foo is simple
    if trimmed.ends_with(')') && !trimmed.starts_with("function") && !trimmed.contains("=>") {
        // Check if it looks like a call expression
        // Find matching parens
        let mut depth = 0;
        for (i, c) in trimmed.char_indices().rev() {
            match c {
                ')' => depth += 1,
                '(' => {
                    depth -= 1;
                    if depth == 0 {
                        // Check if this is a call expression or a function definition
                        let before = &trimmed[..i];
                        // If there's a valid identifier before the paren, it's a call
                        if !before.is_empty()
                            && !before.ends_with("function")
                            && !before.contains("=>")
                        {
                            return false;
                        }
                        break;
                    }
                }
                _ => {}
            }
        }
    }

    // Template literals with expressions are NOT simple
    if trimmed.starts_with('`') && trimmed.contains("${") {
        return false;
    }

    // new expressions are NOT simple
    if trimmed.starts_with("new ") {
        return false;
    }

    // Everything else is considered simple:
    // - Numeric literals: 42, 3.14, -1
    // - String literals: "hello", 'world'
    // - Boolean literals: true, false
    // - null, undefined
    // - Identifiers: foo, bar
    // - Arrow functions: () => {}, x => x
    // - Function expressions: function() {}
    // - Simple template literals: `hello`
    // - Binary/logical expressions: a + b, a && b
    // - Conditional expressions: a ? b : c
    true
}

/// Split declarators by comma, handling nested braces, brackets, and parens.
///
/// For example: "a, b = {x: 1}, c" -> ["a", "b = {x: 1}", "c"]
fn split_declarators(s: &str) -> Vec<&str> {
    let mut result = Vec::new();
    let mut depth: usize = 0;
    let mut start = 0;

    for (i, c) in s.char_indices() {
        match c {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth = depth.saturating_sub(1),
            ',' if depth == 0 => {
                result.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }

    // Don't forget the last segment
    if start < s.len() {
        result.push(&s[start..]);
    }

    result
}

/// Find the position of a line comment (//) that is not inside a string.
fn find_line_comment_position(code: &str) -> Option<usize> {
    let mut in_string = false;
    let mut string_char = ' ';
    let mut chars = code.chars().peekable();
    let mut pos = 0;

    while let Some(c) = chars.next() {
        if in_string {
            if c == '\\' {
                // Skip escaped character
                chars.next();
                pos += 2;
                continue;
            }
            if c == string_char {
                in_string = false;
            }
        } else if c == '"' || c == '\'' || c == '`' {
            in_string = true;
            string_char = c;
        } else if c == '/' && chars.peek() == Some(&'/') {
            return Some(pos);
        }
        pos += c.len_utf8();
    }
    None
}

/// Transform $props() usage.
///
/// Only generates `$.prop()` declarations for props that are "sources" (reassigned or mutated)
/// or props that have default values or are exported.
/// Read-only props are accessed directly via `$$props.propName` without declarations.
///
/// Uses the same flag calculation as `get_prop_source()` from the official Svelte compiler:
/// - PROPS_IS_IMMUTABLE (1): if analysis.immutable
/// - PROPS_IS_RUNES (2): if analysis.runes
/// - PROPS_IS_UPDATED (4): if accessors, or binding is updated
/// - PROPS_IS_BINDABLE (8): only if binding.kind == BindableProp ($bindable() props)
/// - PROPS_IS_LAZY_INITIAL (16): if default value is non-simple
///
/// Multiple prop declarations are combined into a single `let` statement with
/// comma-separated declarators, matching the official compiler output format.
fn transform_props_destructuring(
    line: &str,
    prop_source_vars: &[String],
    exported_names: &[String],
    analysis: &ComponentAnalysis,
) -> Option<String> {
    let trimmed = line.trim();

    // Determine the original declaration keyword (let or const) to preserve it
    let decl_keyword = if trimmed.starts_with("let ") {
        "let"
    } else if trimmed.starts_with("const ") {
        "const"
    } else {
        return None;
    };

    // Check for identifier pattern: let/const props = $props()
    if !trimmed.contains('{') && trimmed.contains("= $props()") {
        // Pattern: let props = $props()
        let decl_start = if trimmed.starts_with("let ") { 4 } else { 6 };
        let eq_pos = trimmed.find('=')?;
        let var_name = trimmed[decl_start..eq_pos].trim();

        // Only generate declaration if this is a source prop
        if prop_source_vars.contains(&var_name.to_string()) {
            // Transform to: let props = $.rest_props($$props, ['$$slots', '$$events', '$$legacy'])
            return Some(format!(
                "{} {} = $.rest_props($$props, ['$$slots', '$$events', '$$legacy']);",
                decl_keyword, var_name
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

    // Parse each prop - collect declarators for combining into a single `let` statement
    let mut declarators: Vec<String> = Vec::new();

    for prop_part in split_declarators(props_str) {
        let prop_part = prop_part.trim();
        if prop_part.is_empty() {
            continue;
        }

        // Handle: name = default_value (always generate for props with defaults)
        if let Some(eq_pos) = prop_part.find('=') {
            let name = prop_part[..eq_pos].trim();
            let default_value = prop_part[eq_pos + 1..].trim();

            // Check if the default value is a simple expression
            let is_simple = is_simple_expression_str(default_value);

            // Calculate flags using the official logic
            let flags = calculate_prop_flags(name, analysis, !is_simple);

            if is_simple {
                declarators.push(format!(
                    "{} = $.prop($$props, '{}', {}, {})",
                    name, name, flags, default_value
                ));
            } else {
                // Wrap non-simple values in a thunk: () => value
                // When value starts with '{', wrap in parens to prevent
                // OXC from parsing `() => {...}` as arrow with block body
                let thunk_value = if default_value.starts_with('{') {
                    format!("({})", default_value)
                } else {
                    default_value.to_string()
                };
                declarators.push(format!(
                    "{} = $.prop($$props, '{}', {}, () => {})",
                    name, name, flags, thunk_value
                ));
            }
        } else {
            // No default value - only generate if this is a source prop or exported
            let is_exported = exported_names.contains(&prop_part.to_string());
            if prop_source_vars.contains(&prop_part.to_string()) || is_exported {
                // Calculate flags using the official logic (no lazy initial for props without defaults)
                let flags = calculate_prop_flags(prop_part, analysis, false);

                declarators.push(format!(
                    "{} = $.prop($$props, '{}', {})",
                    prop_part, prop_part, flags
                ));
            }
            // Read-only props without defaults are accessed directly via $$props.propName
        }
    }

    // Combine all declarators into a single `let` statement with comma separators
    if declarators.is_empty() {
        Some(String::new())
    } else if declarators.len() == 1 {
        Some(format!("{} {};\n", decl_keyword, declarators[0]))
    } else {
        // Multi-prop: combine with comma + newline + tab indent, matching official compiler
        let mut result = format!("{} {}", decl_keyword, declarators[0]);
        for decl in &declarators[1..] {
            result.push_str(",\n\t");
            result.push_str(decl);
        }
        result.push_str(";\n");
        Some(result)
    }
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

/// Transform read-only props to $$props.propName.
/// Read-only props are props that are not reassigned or mutated.
fn transform_read_only_props(line: &str, read_only_props: &[String]) -> String {
    let mut result = line.to_string();

    for prop_name in read_only_props {
        // Create a regex pattern that matches the prop name as a complete identifier
        // Rust regex doesn't support lookbehind, so we match with word boundaries
        // and handle the prefix check manually
        let pattern = format!(r"\b{}\b", regex::escape(prop_name));
        let re = match regex::Regex::new(&pattern) {
            Ok(r) => r,
            Err(_) => continue,
        };

        let mut new_result = String::new();
        let mut last_end = 0;

        for mat in re.find_iter(&result.clone()) {
            // Check if preceded by . (property access) or $ (dollar identifier)
            if mat.start() > 0 {
                let prev_char = result.chars().nth(mat.start() - 1);
                if prev_char == Some('.') || prev_char == Some('$') {
                    new_result.push_str(&result[last_end..mat.end()]);
                    last_end = mat.end();
                    continue;
                }
            }

            // Check if the match is inside a string literal (skip if so)
            // This prevents transforming 'prop' -> '$$props.prop' inside strings like $.prop($$props, 'prop', ...)
            if is_inside_string_literal(&result, mat.start()) {
                new_result.push_str(&result[last_end..mat.end()]);
                last_end = mat.end();
                continue;
            }

            // Check if this is a declaration (skip if so)
            let before = &result[..mat.start()];
            let trimmed_before = before.trim_end();

            // Skip if this is part of a let/const/var declaration
            if trimmed_before.ends_with("let")
                || trimmed_before.ends_with("const")
                || trimmed_before.ends_with("var")
                || trimmed_before.ends_with(',')
                || trimmed_before.ends_with('{')
            {
                new_result.push_str(&result[last_end..mat.end()]);
                last_end = mat.end();
                continue;
            }

            // Check if this is a destructuring pattern
            // Look for patterns like `{ prop }` or `{ prop, ... }`
            if is_in_destructuring_pattern(&result, mat.start()) {
                new_result.push_str(&result[last_end..mat.end()]);
                last_end = mat.end();
                continue;
            }

            // Replace with $$props.propName
            new_result.push_str(&result[last_end..mat.start()]);
            new_result.push_str("$$props.");
            new_result.push_str(prop_name);
            last_end = mat.end();
        }

        new_result.push_str(&result[last_end..]);
        result = new_result;
    }

    result
}

/// Check if a position is inside a destructuring pattern.
/// Destructuring patterns appear on the LEFT side of an assignment,
/// not the right side (which would be an object literal).
fn is_in_destructuring_pattern(code: &str, pos: usize) -> bool {
    let before = &code[..pos];

    // Count unmatched braces to see if we're inside { }
    let mut brace_depth = 0;
    let mut last_open_brace = None;

    for (i, c) in before.chars().enumerate() {
        match c {
            '{' => {
                brace_depth += 1;
                last_open_brace = Some(i);
            }
            '}' => brace_depth -= 1,
            _ => {}
        }
    }

    if brace_depth <= 0 {
        return false;
    }

    // If we're inside braces, check if they're part of a destructuring
    if let Some(open_idx) = last_open_brace {
        let before_brace = code[..open_idx].trim_end();

        // Destructuring patterns are on the LEFT side of assignment
        // So `= {` followed by content is NOT destructuring (it's an object literal on the right)
        // But `let {` or `const {` directly (no identifier between) IS destructuring

        // If it ends with `=`, check if there's an identifier before the `=`
        // `const foo = { ... }` is NOT destructuring
        // `const { ... } = foo` IS destructuring (but the `{` would be before `=`)
        if before_brace.ends_with('=') {
            // This is the right side of an assignment - NOT a destructuring pattern
            return false;
        }

        // Check for destructuring patterns: `let {`, `const {`, `var {`
        // These are cases where the brace immediately follows the keyword
        if before_brace.ends_with("let")
            || before_brace.ends_with("const")
            || before_brace.ends_with("var")
        {
            return true;
        }

        // Function parameter destructuring: `function({ prop })`
        if before_brace.ends_with('(') {
            return true;
        }

        // Nested destructuring: `{ outer: { inner } }`
        if before_brace.ends_with(':') || before_brace.ends_with(',') {
            // Check if we're in the left side of an assignment
            // by looking for `= ` after the last `{` at our current depth
            let after_brace = &code[open_idx..];
            if !after_brace.contains('=') || after_brace.find('=').map(|i| open_idx + i) > Some(pos)
            {
                // The `=` is after our position, so we're on the left side
                return true;
            }
        }
    }

    false
}

/// Check if a position is inside a string literal.
/// This prevents transforming identifiers inside quoted strings.
fn is_inside_string_literal(code: &str, pos: usize) -> bool {
    let before = &code[..pos];
    let mut in_string = false;
    let mut string_char = ' ';
    let mut chars = before.chars().peekable();

    while let Some(c) = chars.next() {
        if in_string {
            if c == '\\' {
                // Skip escaped character
                chars.next();
                continue;
            }
            if c == string_char {
                in_string = false;
            }
        } else if c == '"' || c == '\'' || c == '`' {
            in_string = true;
            string_char = c;
        }
    }

    in_string
}

// ============================================================================
// State Variable Transformation Functions
// ============================================================================

/// Transform state variable assignments to $.set() calls.
fn transform_state_assignments(
    line: &str,
    state_vars: &[String],
    _non_reactive_vars: &[String],
    _proxy_vars: &[String],
    raw_state_vars: &[String],
    is_runes: bool,
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

                    // Skip if preceded by an identifier character (not a word boundary)
                    // This prevents matching "reactive" inside "nonreactive"
                    if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                        continue;
                    }

                    let after = &result[pos + pattern.len()..];
                    // Find the expression (until ; or end, respecting nested braces)
                    let expr_end = find_statement_end_client(after);
                    let expr = after[..expr_end].trim();
                    // Don't wrap here - let the later wrap_state_vars_in_expr call handle it
                    // so it can properly detect function parameter shadowing
                    let replacement =
                        format!("$.set({}, $.get({}) {} ({}))", var, var, op_char, expr);
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern.len() + expr_end..]
                    );
                }
            }
        }

        // Transform logical assignment operators: varname ??= expr to $.set(varname, $.get(varname) ?? (expr))
        // These operators have two-character prefixes before the '='
        for (op, op_without_eq) in &[("??=", "??"), ("&&=", "&&"), ("||=", "||")] {
            let pattern = format!("{} {}", var, op);
            if let Some(pos) = result.find(&pattern) {
                // Skip if this is a member expression (e.g., this.count ??=, obj.prop ??=)
                let before = &result[..pos];
                if before.ends_with('.') {
                    continue;
                }

                // Skip if preceded by an identifier character (not a word boundary)
                // This prevents matching "reactive" inside "nonreactive"
                if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                    continue;
                }

                let after = &result[pos + pattern.len()..];
                // Find the expression (until ; or end, respecting nested braces)
                let expr_end = find_statement_end_client(after);
                let expr = after[..expr_end].trim();
                // Don't wrap here - let the later wrap_state_vars_in_expr call handle it
                // so it can properly detect function parameter shadowing
                let replacement = format!(
                    "$.set({}, $.get({}) {} ({}))",
                    var, var, op_without_eq, expr
                );
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[pos + pattern.len() + expr_end..]
                );
            }
        }

        // Transform simple assignment: varname = expr to $.set(varname, expr)
        // But not if it's a declaration (let/const/var varname = ...)
        // Use a loop to handle multiple assignments of the same variable in one statement
        let assignment_pattern = format!("{} = ", var);
        let mut search_start = 0;
        while !result.contains(&format!("let {} = ", var))
            && !result.contains(&format!("const {} = ", var))
            && !result.contains(&format!("var {} = ", var))
        {
            // Find the next assignment position starting from search_start
            if let Some(relative_pos) = result[search_start..].find(&assignment_pattern) {
                let pos = search_start + relative_pos;

                // Check that it's not part of a comparison (==, ===)
                let before = &result[..pos];
                // Skip if preceded by dot (property access like foo.count = ...)
                // Also skip if already wrapped with $.set
                if before.ends_with('=') || before.ends_with('!') || before.ends_with('.') {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }

                // Skip if preceded by an identifier character (not a word boundary)
                // This prevents matching "reactive" inside "nonreactive"
                if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }

                // Skip if this is already wrapped with $.set
                if before.ends_with(&format!("$.set({}, ", var))
                    || before.ends_with(&format!("$.set({},", var))
                {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }

                let after = &result[pos + assignment_pattern.len()..];
                // Find the expression (until ; or end of line, respecting nested braces)
                // If this assignment is inside a ternary expression, also stop at `:`
                let before_for_ternary = &result[..pos];
                let in_ternary = is_inside_ternary_expression(before_for_ternary);
                let expr_end = find_assignment_expr_end(after, in_ternary);
                let expr = after[..expr_end].trim();

                // Debug output
                if std::env::var("DEBUG_STATE_ASSIGNMENT").is_ok() {
                    eprintln!(
                        "[DEBUG] Checking assignment for var '{}': expr = '{}'",
                        var, expr
                    );
                    eprintln!("[DEBUG] is_incomplete = {}", is_incomplete_expression(expr));
                }

                // Skip incomplete expressions (e.g., multi-line arrow functions
                // where only the first line is processed)
                if is_incomplete_expression(expr) {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }

                // Check it's not already wrapped
                if !expr.starts_with("$.") {
                    // DON'T wrap state variables here - let the later wrap_state_vars_in_expr
                    // call handle it, since that call has the full statement context and can
                    // properly detect function parameter shadowing.
                    // The later call in process_accumulated will handle $.get() wrapping
                    // after we've created the $.set() call.

                    // Check if the value needs proxying (could be an object/array)
                    // $state.raw() variables never need proxy wrapping
                    // Proxy flag is only added in runes mode
                    let is_raw_state = raw_state_vars.contains(var);
                    let needs_proxy =
                        is_runes && !is_raw_state && expression_needs_proxy(expr.trim());

                    let replacement = if needs_proxy {
                        format!("$.set({}, {}, true)", var, expr)
                    } else {
                        format!("$.set({}, {})", var, expr)
                    };

                    let new_result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + assignment_pattern.len() + expr_end..]
                    );
                    // Update search_start to continue after this replacement
                    search_start = pos + replacement.len();
                    result = new_result;
                } else {
                    search_start = pos + assignment_pattern.len();
                }
            } else {
                // No more assignments found
                break;
            }
        }
    }

    result
}

/// Transform prop assignments to getter/setter function call syntax.
///
/// Props in legacy mode are declared with $.prop() which returns a getter/setter function.
/// So `x = value` becomes `x(value)`, and `x += 1` becomes `x(x() + 1)`.
///
/// This handles:
/// - Simple assignment: `x = value` → `x(value)`
/// - Compound assignment: `x += value` → `x(x() + value)`
/// - Update expressions: `x++` → `x(x() + 1)`, `++x` → `x(x() + 1)`
fn transform_prop_assignments(line: &str, prop_vars: &[String]) -> String {
    if prop_vars.is_empty() {
        return line.to_string();
    }

    // Skip lines that are prop declarations (contain $.prop() or $.rest_props())
    // These are generated by transform_props_destructuring and should not be modified.
    // In multi-declarator statements like `let foo = $.prop(...),\n\tbar = $.prop(...)`,
    // the subsequent declarators don't have `let` before them, so the simple assignment
    // transform would incorrectly convert `bar = $.prop(...)` to `bar($.prop(...))`.
    if line.contains("$.prop(") || line.contains("$.rest_props(") {
        return line.to_string();
    }

    let mut result = line.to_string();

    for var in prop_vars {
        // Transform ++varname to varname(varname() + 1) (returns new value, but we don't track that)
        let pre_inc_pattern = format!("++{}", var);
        result = replace_with_word_boundary(
            &result,
            &pre_inc_pattern,
            &format!("{}({}() + 1)", var, var),
            true,
        );

        // Transform --varname to varname(varname() - 1)
        let pre_dec_pattern = format!("--{}", var);
        result = replace_with_word_boundary(
            &result,
            &pre_dec_pattern,
            &format!("{}({}() - 1)", var, var),
            true,
        );

        // Transform varname++ to varname(varname() + 1)
        let post_inc_pattern = format!("{}++", var);
        result = replace_with_word_boundary(
            &result,
            &post_inc_pattern,
            &format!("{}({}() + 1)", var, var),
            false,
        );

        // Transform varname-- to varname(varname() - 1)
        let post_dec_pattern = format!("{}--", var);
        result = replace_with_word_boundary(
            &result,
            &post_dec_pattern,
            &format!("{}({}() - 1)", var, var),
            false,
        );

        // Transform compound assignments: varname += expr to varname(varname() + (expr))
        for op in &["+=", "-=", "*=", "/=", "%=", "**="] {
            let pattern = format!("{} {}", var, op);
            if result.contains(&pattern) {
                let op_char = &op[..op.len() - 1]; // Remove the '='
                if let Some(pos) = result.find(&pattern) {
                    // Skip if this is a member expression (e.g., this.x +=, obj.x +=)
                    let before = &result[..pos];
                    if before.ends_with('.') {
                        continue;
                    }

                    // Skip if preceded by an identifier character (not a word boundary)
                    if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                        continue;
                    }

                    let after = &result[pos + pattern.len()..];
                    // Find the expression (until ; or end, respecting nested braces)
                    let expr_end = find_statement_end_client(after);
                    let expr = after[..expr_end].trim();
                    let replacement = format!("{}({}() {} ({}))", var, var, op_char, expr);
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern.len() + expr_end..]
                    );
                }
            }
        }

        // Transform logical assignment operators: varname ??= expr to varname(varname() ?? (expr))
        for (op, op_without_eq) in &[("??=", "??"), ("&&=", "&&"), ("||=", "||")] {
            let pattern = format!("{} {}", var, op);
            if let Some(pos) = result.find(&pattern) {
                let before = &result[..pos];
                if before.ends_with('.') {
                    continue;
                }

                if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                    continue;
                }

                let after = &result[pos + pattern.len()..];
                let expr_end = find_statement_end_client(after);
                let expr = after[..expr_end].trim();
                let replacement = format!("{}({}() {} ({}))", var, var, op_without_eq, expr);
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[pos + pattern.len() + expr_end..]
                );
            }
        }

        // Transform simple assignment: varname = expr to varname(expr)
        // But not if it's a declaration (let/const/var varname = ...)
        let assignment_pattern = format!("{} = ", var);
        let mut search_start = 0;
        while !result.contains(&format!("let {} = ", var))
            && !result.contains(&format!("const {} = ", var))
            && !result.contains(&format!("var {} = ", var))
        {
            if let Some(relative_pos) = result[search_start..].find(&assignment_pattern) {
                let pos = search_start + relative_pos;

                // Check that it's not part of a comparison (==, ===)
                let before = &result[..pos];
                if before.ends_with('=') || before.ends_with('!') || before.ends_with('.') {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }

                // Skip if preceded by an identifier character
                if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }

                let after = &result[pos + assignment_pattern.len()..];
                let expr_end = find_statement_end_client(after);
                let expr = &after[..expr_end];
                let replacement = format!("{}({})", var, expr.trim());

                let new_result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[pos + assignment_pattern.len() + expr_end..]
                );
                search_start = pos + replacement.len();
                result = new_result;
            } else {
                break;
            }
        }

        // Transform member mutations: varname.prop = value to varname(varname().prop = value, true)
        // This is needed for bindable props in legacy mode
        // Pattern: varname.something = value (but not varname.something.deeper = value which is handled by the above)
        let member_pattern = format!("{}.", var);
        let mut member_search_start = 0;

        while let Some(relative_pos) = result[member_search_start..].find(&member_pattern) {
            let pos = member_search_start + relative_pos;

            // Check that this is a word boundary (not part of another identifier)
            let before = &result[..pos];
            if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                member_search_start = pos + member_pattern.len();
                continue;
            }

            // Find the assignment in this member expression
            let after_member = &result[pos + member_pattern.len()..];

            // Find the property name and equals sign
            // Example: "parentElement = node.parentElement"
            // We need to find where the property ends and where = is
            let mut prop_end = 0;
            let mut eq_pos = None;
            let after_member_chars: Vec<char> = after_member.chars().collect();
            let mut scan_depth = 0i32;
            for (i, c) in after_member.char_indices() {
                // Track nesting depth to avoid matching = inside parens/brackets
                match c {
                    '(' | '[' | '{' => {
                        scan_depth += 1;
                        continue;
                    }
                    ')' | ']' | '}' => {
                        scan_depth -= 1;
                        continue;
                    }
                    ';' | '\n' if scan_depth == 0 => {
                        // Reached end of statement without finding assignment
                        break;
                    }
                    _ => {}
                }
                // Only look for assignment at depth 0
                if c == '=' && scan_depth == 0 {
                    // Check it's not ==, ===, =>, !=, !==, <=, >=,
                    // or compound: +=, -=, *=, /=, %=, **=, &=, |=, ^=, &&=, ||=, ??=
                    let char_idx = after_member[..i].chars().count();
                    let prev = if char_idx > 0 {
                        after_member_chars.get(char_idx - 1).copied()
                    } else {
                        None
                    };
                    let next = after_member_chars.get(char_idx + 1).copied();
                    // Skip ==, ===
                    if prev == Some('=') || next == Some('=') {
                        continue;
                    }
                    // Skip => (arrow function)
                    if next == Some('>') {
                        continue;
                    }
                    // Skip !=, !==, <=, >=
                    if matches!(prev, Some('!') | Some('<') | Some('>')) {
                        continue;
                    }
                    // Skip compound assignments: +=, -=, *=, /=, %=, &=, |=, ^=, ?=
                    if matches!(
                        prev,
                        Some('+')
                            | Some('-')
                            | Some('*')
                            | Some('/')
                            | Some('%')
                            | Some('&')
                            | Some('|')
                            | Some('^')
                            | Some('?')
                    ) {
                        continue;
                    }
                    eq_pos = Some(i);
                    // Find where the property name ends (scan backwards from =)
                    let before_eq = after_member[..i].trim_end();
                    prop_end = before_eq.len();
                    break;
                }
            }

            // If we found an assignment
            if let Some(eq_idx) = eq_pos {
                // Check if this is already wrapped
                if before.ends_with(&format!("{}({}().", var, var)) {
                    member_search_start = pos + member_pattern.len();
                    continue;
                }

                let prop_name = after_member[..prop_end].trim();
                let after_eq_raw = &after_member[eq_idx + 1..];
                let leading_whitespace = after_eq_raw.len() - after_eq_raw.trim_start().len();
                let after_eq = after_eq_raw.trim_start();

                // Find the value expression end
                let value_end = find_statement_end_client(after_eq);
                let value = after_eq[..value_end].trim();

                // Wrap with prop(prop().prop = value, true)
                let replacement = format!("{}({}().{} = {}, true)", var, var, prop_name, value);

                // Calculate the original content length:
                // member_pattern.len() + eq_idx + 1 (for '=') + leading_whitespace + value_end
                let original_len =
                    member_pattern.len() + eq_idx + 1 + leading_whitespace + value_end;

                let new_result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[pos + original_len..]
                );
                member_search_start = pos + replacement.len();
                result = new_result;
            } else {
                member_search_start = pos + member_pattern.len();
            }
        }
    }

    result
}

/// Transform legacy state declarations to $.mutable_source() calls.
///
/// In legacy (non-runes) mode, variables that are:
/// 1. Declared with `let` (not `const`)
/// 2. Updated (reassigned or mutated) somewhere in the code
/// 3. Referenced in the template
///
/// Need to be wrapped in $.mutable_source() for reactivity.
///
/// Transforms:
/// - `let state = 'foo'` → `let state = $.mutable_source('foo')`
/// - `let count = 0` → `let count = $.mutable_source(0)`
fn transform_legacy_state_declarations(
    line: &str,
    legacy_state_vars: &[(String, Option<String>)],
    immutable: bool,
) -> String {
    if legacy_state_vars.is_empty() {
        return line.to_string();
    }

    let mut result = line.to_string();

    for (var, _initial) in legacy_state_vars {
        // First, try to match `let varname = value` pattern
        let pattern_with_init = format!("let {} = ", var);
        if let Some(pos) = result.find(&pattern_with_init) {
            // Skip if already wrapped
            if result[pos + pattern_with_init.len()..].starts_with("$.mutable_source(")
                || result[pos + pattern_with_init.len()..].starts_with("$.prop(")
            {
                continue;
            }

            // Find the value expression
            let after = &result[pos + pattern_with_init.len()..];
            let expr_end = find_statement_end_client(after);
            let expr = after[..expr_end].trim();

            // Remove trailing semicolon from expr
            let expr = expr.trim_end_matches(';').trim();

            // Build the replacement
            let replacement = if immutable {
                format!("let {} = $.mutable_source({}, true)", var, expr)
            } else {
                format!("let {} = $.mutable_source({})", var, expr)
            };

            // Replace the declaration
            result = format!(
                "{}{}{}",
                &result[..pos],
                replacement,
                &result[pos + pattern_with_init.len() + expr_end..]
            );
            continue;
        }

        // Then, try to match `let varname;` pattern (declaration without initializer)
        // This handles cases like `let container;` which should become `let container = $.mutable_source();`
        let pattern_no_init = format!("let {};", var);
        if let Some(pos) = result.find(&pattern_no_init) {
            // Build the replacement - no initial value, so pass nothing to $.mutable_source()
            let replacement = if immutable {
                format!("let {} = $.mutable_source(undefined, true);", var)
            } else {
                format!("let {} = $.mutable_source();", var)
            };

            // Replace the declaration
            result = format!(
                "{}{}{}",
                &result[..pos],
                replacement,
                &result[pos + pattern_no_init.len()..]
            );
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

        // Transform member expression mutations: $store.prop.value++ or $store[0].value++
        // These need $.store_mutate(store, $.untrack($store).prop.value++, $.untrack($store))
        result = transform_store_member_mutations(&result, store_sub, store_name);
    }

    result
}

/// Transform store subscription reads to $store() calls.
///
/// In the client runtime, store subscriptions like $count are getter functions.
/// So `const answer = $foo` must become `const answer = $foo()`.
///
/// This is similar to `transform_prop_reads_in_expr` but for store subscriptions.
fn transform_store_reads_client(line: &str, store_sub_vars: &[String]) -> String {
    if store_sub_vars.is_empty() {
        return line.to_string();
    }

    let mut result = line.to_string();

    for store_sub in store_sub_vars {
        // Use word boundary matching to replace identifier references
        // But avoid replacing function calls that already have ()
        let mut new_result = String::with_capacity(result.len() * 2);
        let chars: Vec<char> = result.chars().collect();
        let mut i = 0;

        while i < chars.len() {
            // Check if we're at the start of the identifier
            let remaining = &result[result
                .char_indices()
                .nth(i)
                .map(|(idx, _)| idx)
                .unwrap_or(i)..];
            if remaining.starts_with(store_sub) {
                // Check character before (must be non-identifier char or start of string)
                let before_ok = if i == 0 {
                    true
                } else {
                    let prev_char = chars[i - 1];
                    !prev_char.is_alphanumeric() && prev_char != '_' && prev_char != '$'
                };

                // Check character after (must be non-identifier char)
                let after_idx = i + store_sub.len();
                let after_ok = if after_idx >= chars.len() {
                    true
                } else {
                    let next_char = chars[after_idx];
                    !next_char.is_alphanumeric() && next_char != '_' && next_char != '$'
                };

                // Check if it's NOT already followed by ()
                let is_already_call = if after_idx < chars.len() {
                    // Skip whitespace
                    let mut check_idx = after_idx;
                    while check_idx < chars.len() && chars[check_idx].is_whitespace() {
                        check_idx += 1;
                    }
                    check_idx < chars.len() && chars[check_idx] == '('
                } else {
                    false
                };

                // Check if this is inside $.untrack() - don't transform there
                // $.untrack expects a getter function, so $store should remain $store
                let is_inside_untrack = {
                    // Look back for "$.untrack(" pattern
                    let prefix = &new_result;
                    let untrack_pattern = "$.untrack(";
                    if prefix.ends_with(untrack_pattern) {
                        true
                    } else {
                        // Also check for whitespace before the identifier
                        prefix.trim_end().ends_with(untrack_pattern)
                    }
                };

                if before_ok && after_ok && !is_already_call {
                    if is_inside_untrack {
                        // Inside $.untrack(), keep as $store (don't add parentheses)
                        new_result.push_str(store_sub);
                        i += store_sub.len();
                        continue;
                    } else {
                        // Replace with store_sub()
                        new_result.push_str(store_sub);
                        new_result.push_str("()");
                        i += store_sub.len();
                        continue;
                    }
                }
            }

            // No match, just copy the character
            new_result.push(chars[i]);
            i += 1;
        }

        result = new_result;
    }

    result
}

/// Transform store member expression mutations.
///
/// Handles patterns like:
/// - `$store.prop++` -> `$.store_mutate(store, $.untrack($store).prop++, $.untrack($store))`
/// - `$store[0].value++` -> `$.store_mutate(store, $.untrack($store)[0].value++, $.untrack($store))`
/// - `$store.items[0] = x` -> `$.store_mutate(store, $.untrack($store).items[0] = x, $.untrack($store))`
fn transform_store_member_mutations(line: &str, store_sub: &str, store_name: &str) -> String {
    let mut result = line.to_string();

    // Skip if already transformed (contains $.store_mutate for this store)
    if result.contains(&format!("$.store_mutate({},", store_name)) {
        return result;
    }

    // Pattern for member access: $store. or $store[
    let member_patterns = [format!("{}.", store_sub), format!("{}[", store_sub)];

    for member_pattern in &member_patterns {
        // Keep transforming as long as we find patterns
        while let Some(pos) = find_store_member_mutation(&result, member_pattern) {
            // Find the full mutation expression
            if let Some((mutation_start, mutation_end, is_update)) =
                extract_store_mutation(&result, pos, store_sub, member_pattern.len())
            {
                let mutation_expr = &result[mutation_start..mutation_end];

                // Replace $store occurrences with $.untrack($store) in the mutation expression
                let untracked_expr = mutation_expr.replacen(
                    store_sub,
                    &format!("$.untrack({})", store_sub),
                    1, // Only replace the first occurrence (the root store access)
                );

                // Build the $.store_mutate call
                let replacement = format!(
                    "$.store_mutate({}, {}, $.untrack({}))",
                    store_name, untracked_expr, store_sub
                );

                result = format!(
                    "{}{}{}",
                    &result[..mutation_start],
                    replacement,
                    &result[mutation_end..]
                );

                // Remove trailing semicolon if it was an update expression statement
                // (since $.store_mutate already includes the full statement)
                if is_update && result[mutation_start + replacement.len()..].starts_with(';') {
                    // Keep the semicolon, it's part of the statement
                }
            } else {
                // Couldn't extract mutation - break to avoid infinite loop
                break;
            }
        }
    }

    result
}

/// Find a store member mutation pattern that needs transformation.
///
/// Returns the position where the mutation starts, or None if not found.
fn find_store_member_mutation(line: &str, pattern: &str) -> Option<usize> {
    let mut search_start = 0;
    while let Some(pos) = line[search_start..].find(pattern) {
        let abs_pos = search_start + pos;

        // Skip if this is inside a $.untrack() or $.store_mutate() call
        let before = &line[..abs_pos];
        if before.ends_with("$.untrack(") || before.ends_with("$.store_mutate(") {
            search_start = abs_pos + 1;
            continue;
        }

        // Skip if this is already transformed (inside a $.store_mutate call)
        if is_inside_store_mutate(line, abs_pos) {
            search_start = abs_pos + 1;
            continue;
        }

        // Check if this is followed by an assignment or update operation
        // by examining what comes after the member expression
        let after = &line[abs_pos..];
        if is_mutation_expression(after, pattern) {
            return Some(abs_pos);
        }

        search_start = abs_pos + 1;
    }

    None
}

/// Check if a position is inside an existing $.store_mutate() call.
fn is_inside_store_mutate(line: &str, pos: usize) -> bool {
    // Find the nearest $.store_mutate( before this position
    let before = &line[..pos];
    if let Some(mutate_pos) = before.rfind("$.store_mutate(") {
        // Check if we're inside the parentheses
        let after_mutate = &line[mutate_pos + 15..]; // after "$.store_mutate("
        let mut depth = 1;
        for (i, c) in after_mutate.char_indices() {
            match c {
                '(' => depth += 1,
                ')' => {
                    depth -= 1;
                    if depth == 0 {
                        // Found the closing paren
                        return mutate_pos + 15 + i > pos;
                    }
                }
                _ => {}
            }
        }
    }
    false
}

/// Check if the expression starting at the given pattern is a mutation (assignment or update).
fn is_mutation_expression(text: &str, pattern: &str) -> bool {
    // Skip the pattern itself
    let after_pattern = &text[pattern.len()..];

    // Find what comes after the member chain
    // If pattern ends with '[', we're already inside a bracket, so start with depth=1
    let mut depth = if pattern.ends_with('[') { 1 } else { 0 };
    let chars: Vec<char> = after_pattern.chars().collect();
    let mut i = 0;

    // Skip through the rest of the member expression
    while i < chars.len() {
        let c = chars[i];
        match c {
            '[' => {
                depth += 1;
                i += 1;
            }
            ']' => {
                depth -= 1;
                i += 1;
            }
            '.' if depth == 0 => {
                // Continue with next property access
                i += 1;
                // Skip the property name
                while i < chars.len()
                    && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$')
                {
                    i += 1;
                }
            }
            '(' if depth == 0 => {
                // This is a function call, not a mutation
                return false;
            }
            '+' | '-' | '=' | '*' | '/' | '%' | '&' | '|' | '^' | '!' | '?' if depth == 0 => {
                // This could be an assignment or update operator
                // Check for ++ or --
                if c == '+' && i + 1 < chars.len() && chars[i + 1] == '+' {
                    return true;
                }
                if c == '-' && i + 1 < chars.len() && chars[i + 1] == '-' {
                    return true;
                }
                // Check for assignment operators
                if i + 1 < chars.len() && chars[i + 1] == '=' {
                    return true;
                }
                if c == '=' && (i == 0 || chars[i - 1] != '=' && chars[i - 1] != '!') {
                    return true;
                }
                // Not a mutation
                return false;
            }
            ' ' | '\t' if depth == 0 => {
                // Whitespace - continue to find the operator
                i += 1;
            }
            _ if depth == 0 && !c.is_alphanumeric() && c != '_' && c != '$' => {
                // End of member expression without finding mutation
                return false;
            }
            _ => {
                i += 1;
            }
        }
    }

    false
}

/// Extract the full mutation expression boundaries.
///
/// Returns (start, end, is_update) where:
/// - start: position where the mutation starts
/// - end: position after the mutation ends
/// - is_update: true if this is an update expression (++ or --)
fn extract_store_mutation(
    line: &str,
    start: usize,
    _store_sub: &str,
    _pattern_len: usize,
) -> Option<(usize, usize, bool)> {
    let after_start = &line[start..];
    let chars: Vec<char> = after_start.chars().collect();
    let mut i = 0;
    let mut depth = 0;

    // First, traverse the member expression
    while i < chars.len() {
        let c = chars[i];
        match c {
            '[' => {
                depth += 1;
                i += 1;
            }
            ']' => {
                depth -= 1;
                i += 1;
            }
            '.' if depth == 0 => {
                i += 1;
                // Skip the property name
                while i < chars.len()
                    && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$')
                {
                    i += 1;
                }
            }
            ' ' | '\t' if depth == 0 => {
                i += 1;
            }
            '+' if depth == 0 && i + 1 < chars.len() && chars[i + 1] == '+' => {
                // Postfix ++
                return Some((start, start + i + 2, true));
            }
            '-' if depth == 0 && i + 1 < chars.len() && chars[i + 1] == '-' => {
                // Postfix --
                return Some((start, start + i + 2, true));
            }
            '=' if depth == 0 => {
                // Assignment - find the end of the RHS expression
                // Skip whitespace after =
                let mut j = i + 1;
                while j < chars.len() && (chars[j] == ' ' || chars[j] == '\t') {
                    j += 1;
                }

                // Find the end of the assignment expression
                let rhs_end = find_expression_end(&after_start[j..]);
                return Some((start, start + j + rhs_end, false));
            }
            _ if depth == 0
                && (c == '+' || c == '-' || c == '*' || c == '/' || c == '%' || c == '?')
                && i + 1 < chars.len()
                && chars[i + 1] == '=' =>
            {
                // Compound assignment (+=, -=, etc.)
                // Find the end of the RHS expression
                let mut j = i + 2;
                while j < chars.len() && (chars[j] == ' ' || chars[j] == '\t') {
                    j += 1;
                }

                let rhs_end = find_expression_end(&after_start[j..]);
                return Some((start, start + j + rhs_end, false));
            }
            _ if depth == 0 && !c.is_alphanumeric() && c != '_' && c != '$' && c != '(' => {
                // End of member expression without finding mutation
                return None;
            }
            _ => {
                i += 1;
            }
        }
    }

    None
}

/// Find the end of an expression (until ; or newline at depth 0).
fn find_expression_end(s: &str) -> usize {
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
                } else {
                    return i;
                }
            }
            ';' | '\n' if depth == 0 => return i,
            _ => {}
        }
    }

    s.len()
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
                } else {
                    // At depth 0, a closing brace/bracket/paren ends the statement
                    // (it belongs to the enclosing function/block, not our expression)
                    return i;
                }
            }
            ';' if depth == 0 => return i,
            // Newline at depth 0 ends the statement (JavaScript ASI)
            '\n' if depth == 0 => return i,
            _ => {}
        }
    }

    s.len()
}

/// Check if a position is inside a ternary expression by looking at the "before" string.
/// Returns true if there's an unmatched `?` that would indicate we're in a ternary branch.
/// This function looks at the current block context (since the last `{`) to properly handle
/// ternaries inside arrow function bodies.
fn is_inside_ternary_expression(before: &str) -> bool {
    // Find the start of the current block context by looking for the last unmatched `{`
    // We need to track depth to find where the current block starts
    let chars: Vec<char> = before.chars().collect();

    // First, find the position of the last block start (unmatched `{`)
    let mut block_start = 0;
    let mut temp_depth = 0;
    let mut temp_in_string = false;
    let mut temp_string_char = ' ';

    for (i, &c) in chars.iter().enumerate() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !temp_in_string {
                temp_in_string = true;
                temp_string_char = c;
            } else if c == temp_string_char {
                temp_in_string = false;
            }
            continue;
        }

        if temp_in_string {
            continue;
        }

        match c {
            '{' => {
                temp_depth += 1;
                // Remember this as a potential block start
                block_start = i + 1;
            }
            '}' => {
                if temp_depth > 0 {
                    temp_depth -= 1;
                }
            }
            _ => {}
        }
    }

    // Now analyze the portion from block_start to the end
    let context = if block_start > 0 && block_start < before.len() {
        &before[block_start..]
    } else {
        before
    };

    // Check for unmatched ternary `?` in the context
    let context_chars: Vec<char> = context.chars().collect();
    let mut paren_depth = 0;
    let mut ternary_depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &c) in context_chars.iter().enumerate() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || context_chars[i - 1] != '\\') {
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
            '(' | '[' => paren_depth += 1,
            ')' | ']' => {
                if paren_depth > 0 {
                    paren_depth -= 1;
                }
            }
            // Only count ? as ternary when at paren depth 0
            '?' if paren_depth == 0 => {
                // Check it's not optional chaining (?.)
                if i + 1 < context_chars.len() && context_chars[i + 1] != '.' {
                    ternary_depth += 1;
                }
            }
            ':' if paren_depth == 0 && ternary_depth > 0 => {
                ternary_depth -= 1;
            }
            _ => {}
        }
    }

    ternary_depth > 0
}

/// Find the end of an assignment expression.
/// This is similar to find_statement_end_client but also stops at `:` when inside a ternary expression.
fn find_assignment_expr_end(s: &str, in_ternary: bool) -> usize {
    let mut depth = 0;
    let chars: Vec<char> = s.chars().collect();
    let mut in_string = false;
    let mut string_char = ' ';
    let mut nested_ternary_depth = 0;

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
                } else {
                    // At depth 0, a closing brace/bracket/paren ends the expression
                    return i;
                }
            }
            ';' if depth == 0 => return i,
            '\n' if depth == 0 => return i,
            // Stop at ',' at depth 0 (e.g., inside object literal: {id: eid = expr, name: ...})
            ',' if depth == 0 => return i,
            // Track nested ternaries
            '?' if depth == 0 => {
                // Check it's not optional chaining (?.)
                if i + 1 < chars.len() && chars[i + 1] != '.' {
                    nested_ternary_depth += 1;
                }
            }
            // Stop at `:` when in a ternary and not in a nested ternary
            ':' if depth == 0 && in_ternary && nested_ternary_depth == 0 => {
                return i;
            }
            ':' if depth == 0 && nested_ternary_depth > 0 => {
                nested_ternary_depth -= 1;
            }
            _ => {}
        }
    }

    s.len()
}

/// Check if an expression is incomplete (e.g., unbalanced brackets).
/// This is used to skip transformations on multi-line statements that are
/// processed line by line.
fn is_incomplete_expression(expr: &str) -> bool {
    let mut paren_depth = 0;
    let mut bracket_depth = 0;
    let mut brace_depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut in_block_comment = false;
    let chars: Vec<char> = expr.chars().collect();

    let mut i = 0;
    while i < chars.len() {
        let c = chars[i];

        // Handle block comment start/end
        if !in_string {
            if !in_block_comment && c == '/' && i + 1 < chars.len() && chars[i + 1] == '*' {
                in_block_comment = true;
                i += 2;
                continue;
            }
            if in_block_comment && c == '*' && i + 1 < chars.len() && chars[i + 1] == '/' {
                in_block_comment = false;
                i += 2;
                continue;
            }
        }

        if in_block_comment {
            i += 1;
            continue;
        }

        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            i += 1;
            continue;
        }

        if in_string {
            i += 1;
            continue;
        }

        match c {
            '(' => paren_depth += 1,
            ')' => paren_depth -= 1,
            '[' => bracket_depth += 1,
            ']' => bracket_depth -= 1,
            '{' => brace_depth += 1,
            '}' => brace_depth -= 1,
            _ => {}
        }
        i += 1;
    }

    // If any depth is non-zero, or we're still inside a block comment, the expression is incomplete
    paren_depth != 0 || bracket_depth != 0 || brace_depth != 0 || in_block_comment
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

    // Check if it's preceded by a control flow keyword (if, while, for, switch, with, catch)
    // These are NOT function parameter positions, even though they have (...) { pattern
    let control_flow_keywords = ["if", "while", "for", "switch", "with", "catch"];
    for keyword in control_flow_keywords {
        let kw_len = keyword.len();
        if before_paren_idx >= kw_len {
            let prefix: String = chars[before_paren_idx - kw_len..before_paren_idx]
                .iter()
                .collect();
            if prefix == keyword {
                // Make sure it's a standalone keyword (not part of a larger identifier)
                let is_standalone = before_paren_idx == kw_len
                    || !is_identifier_char(chars[before_paren_idx - kw_len - 1]);
                if is_standalone {
                    return false;
                }
            }
        }
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

/// Check if a variable at the given position is shadowed by a function parameter.
/// This detects when an inner function/method has a parameter with the same name,
/// which shadows the outer variable within that function's scope.
///
/// For example, in:
/// ```js
/// let count = $state(0);
/// function action(_, count) {
///     update(count) {
///         console.log(count);  // <- this `count` refers to update's parameter
///     }
/// }
/// ```
/// The `count` inside `update` is shadowed by `update`'s parameter.
fn is_shadowed_by_function_param(chars: &[char], var_start: usize, var_name: &str) -> bool {
    // Strategy: scan backwards from var_start to find the nearest enclosing function scope.
    // If we find a function with this variable as a parameter, it's shadowed.
    // We need to track brace depth to understand scope nesting.

    let var_len = var_name.len();

    // Track brace depth as we scan backwards
    let mut brace_depth = 0;
    let mut i = var_start;

    while i > 0 {
        i -= 1;
        let c = chars[i];

        if c == '}' {
            brace_depth += 1;
        } else if c == '{' {
            if brace_depth > 0 {
                brace_depth -= 1;
            } else {
                // Found an opening brace at our scope level
                // Check if this is a function body with our variable as a parameter
                // Look backwards to find the closing paren of the parameter list

                // Skip whitespace before the {
                let mut j = i;
                while j > 0 && chars[j - 1].is_whitespace() {
                    j -= 1;
                }

                // Check for `)` which would indicate a function parameter list
                if j > 0 && chars[j - 1] == ')' {
                    let close_paren_idx = j - 1; // Save the `)` position
                    j -= 1; // Move past the )

                    // Now find the matching (
                    let mut paren_depth = 0;
                    let mut open_paren_idx = None;
                    while j > 0 {
                        j -= 1;
                        if chars[j] == ')' {
                            paren_depth += 1;
                        } else if chars[j] == '(' {
                            if paren_depth == 0 {
                                open_paren_idx = Some(j);
                                break;
                            }
                            paren_depth -= 1;
                        }
                    }

                    if let Some(open_idx) = open_paren_idx {
                        // Check if this is a function declaration/expression
                        // by looking for `function`, method shorthand, or arrow function pattern

                        // First, check if our variable is in the parameter list
                        // Extract text between ( and ) - not including the parens themselves
                        let param_text: String = chars[open_idx + 1..close_paren_idx]
                            .iter()
                            .collect::<String>();

                        // Check if var_name appears as a standalone identifier in the parameter list
                        // We need to handle patterns like: (_, count), (count), (count = default)
                        let param_chars: Vec<char> = param_text.chars().collect();
                        let mut k = 0;
                        while k < param_chars.len() {
                            // Skip whitespace
                            while k < param_chars.len() && param_chars[k].is_whitespace() {
                                k += 1;
                            }

                            if k + var_len <= param_chars.len() {
                                let potential_match: String =
                                    param_chars[k..k + var_len].iter().collect();
                                if potential_match == var_name {
                                    // Check boundaries
                                    let before_ok =
                                        k == 0 || !is_identifier_char(param_chars[k - 1]);
                                    let after_ok = k + var_len >= param_chars.len()
                                        || !is_identifier_char(param_chars[k + var_len]);

                                    if before_ok && after_ok {
                                        // Found the variable in the parameter list!
                                        // Now verify this is actually a function definition

                                        // Check what's before the opening paren
                                        let mut m = open_idx;
                                        while m > 0 && chars[m - 1].is_whitespace() {
                                            m -= 1;
                                        }

                                        // Check for control flow keywords (if, while, for, switch, with, catch)
                                        // These are NOT function definitions
                                        let control_flow_keywords =
                                            ["if", "while", "for", "switch", "with", "catch"];
                                        let mut is_control_flow = false;
                                        for keyword in control_flow_keywords {
                                            let kw_len = keyword.len();
                                            if m >= kw_len {
                                                let prefix: String =
                                                    chars[m - kw_len..m].iter().collect();
                                                if prefix == keyword {
                                                    // Make sure it's a standalone keyword
                                                    let is_standalone = m == kw_len
                                                        || !is_identifier_char(
                                                            chars[m - kw_len - 1],
                                                        );
                                                    if is_standalone {
                                                        is_control_flow = true;
                                                        break;
                                                    }
                                                }
                                            }
                                        }

                                        if is_control_flow {
                                            // This is a control flow statement, not a function
                                            // Continue scanning backwards for more scopes
                                            // Don't return true here
                                        } else {
                                            // Check for function keyword or identifier (method name)
                                            if m > 0 {
                                                // Check for "function" keyword
                                                if m >= 8 {
                                                    let prefix: String =
                                                        chars[m - 8..m].iter().collect();
                                                    if prefix == "function" {
                                                        return true;
                                                    }
                                                }

                                                // Check for identifier (method name or arrow function)
                                                // m is now pointing after the last non-whitespace char before (
                                                // For "update(foo)", m would be at 'e'+1, so chars[m-1] = 'e'
                                                if is_identifier_char(chars[m - 1]) {
                                                    // Could be a method definition like `update(count) {`
                                                    return true;
                                                }
                                            }

                                            // Check for arrow function pattern: (params) => {
                                            // If the ( is not preceded by any identifier or function keyword,
                                            // and there's => between ) and {, it could be an arrow function
                                            // However, we should only return true if we can confirm it's a function
                                            // Just having () doesn't make it a function - it could be grouping

                                            // Check if there's => between ) and {
                                            let between_paren_and_brace: String =
                                                chars[close_paren_idx + 1..i].iter().collect();
                                            if between_paren_and_brace.trim().starts_with("=>") {
                                                // It's an arrow function
                                                return true;
                                            }
                                        }
                                    }
                                }
                            }
                            k += 1;
                        }
                    }
                }
            }
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

        // Track whether we're inside a string literal
        let mut in_string: Option<char> = None; // None or Some('\'') or Some('"') or Some('`')
        // Track whether we're inside a comment
        let mut in_line_comment = false;
        let mut in_block_comment = false;

        while i < chars.len() {
            let c = chars[i];

            // Handle line comment end (newline)
            if in_line_comment {
                new_result.push(c);
                if c == '\n' {
                    in_line_comment = false;
                }
                i += 1;
                continue;
            }

            // Handle block comment end (*/)
            if in_block_comment {
                new_result.push(c);
                if c == '*' && i + 1 < chars.len() && chars[i + 1] == '/' {
                    new_result.push('/');
                    i += 2;
                    in_block_comment = false;
                    continue;
                }
                i += 1;
                continue;
            }

            // Handle string literal boundaries
            if in_string.is_none() {
                // Check for comment start (only outside strings)
                if c == '/' && i + 1 < chars.len() {
                    if chars[i + 1] == '/' {
                        // Line comment
                        in_line_comment = true;
                        new_result.push(c);
                        i += 1;
                        continue;
                    } else if chars[i + 1] == '*' {
                        // Block comment (including JSDoc)
                        in_block_comment = true;
                        new_result.push(c);
                        i += 1;
                        continue;
                    }
                }

                if c == '\'' || c == '"' || c == '`' {
                    in_string = Some(c);
                    new_result.push(c);
                    i += 1;
                    continue;
                }
            } else if Some(c) == in_string {
                // Check for escape sequence
                let escaped = if i > 0 && chars[i - 1] == '\\' {
                    // Count consecutive backslashes
                    let mut backslash_count = 0;
                    let mut j = i - 1;
                    while j > 0 && chars[j] == '\\' {
                        backslash_count += 1;
                        if j == 0 {
                            break;
                        }
                        j -= 1;
                    }
                    // If odd number of backslashes, the quote is escaped
                    backslash_count % 2 == 1
                } else {
                    false
                };

                if !escaped {
                    in_string = None;
                }
                new_result.push(c);
                i += 1;
                continue;
            }

            // Skip replacements inside string literals
            if in_string.is_some() {
                new_result.push(c);
                i += 1;
                continue;
            }

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

                        // Check if this variable is on the left side of an assignment
                        let is_assignment_target =
                            is_on_left_side_of_assignment(&chars, i, var_chars.len());

                        // Check if this is a getter/setter method name (e.g., `get bar()` or `set bar(v)`)
                        // These are preceded by "get " or "set " and followed by "(" (with optional whitespace)
                        let is_getter_setter_name = {
                            let after_idx = i + var_chars.len();
                            // Skip whitespace after the variable to find the next non-whitespace char
                            let mut k = after_idx;
                            while k < chars.len() && chars[k].is_whitespace() {
                                k += 1;
                            }
                            let has_paren_after = k < chars.len() && chars[k] == '(';
                            let has_get_before = i >= 4 && {
                                let prefix: String = chars[i - 4..i].iter().collect();
                                prefix == "get "
                            };
                            let has_set_before = i >= 4 && {
                                let prefix: String = chars[i - 4..i].iter().collect();
                                prefix == "set "
                            };
                            has_paren_after && (has_get_before || has_set_before)
                        };

                        // Check if this is an object property key (e.g., `{ foo: value }`)
                        // Property keys before `:` should not be wrapped
                        let is_property_key = {
                            let after_idx = i + var_chars.len();
                            // Skip whitespace after the variable
                            let mut k = after_idx;
                            while k < chars.len() && chars[k].is_whitespace() {
                                k += 1;
                            }
                            k < chars.len() && chars[k] == ':'
                        };

                        // Check if this is a shorthand property in an object literal (e.g., `{ foo, bar }`)
                        // Shorthand properties are followed by `,` or `}` inside an object
                        let is_shorthand_property =
                            is_shorthand_object_property(&chars, i, var_chars.len());

                        // Check if this variable is shadowed by a function parameter in an inner scope
                        let is_shadowed = is_shadowed_by_function_param(&chars, i, var);

                        // Check if this variable is the target of an update expression (++ or --)
                        // e.g., x++ or ++x or x-- or --x
                        // These should not be wrapped in $.get() as that would produce
                        // invalid JS like $.get(x)++
                        let is_update_target = {
                            let after_idx = i + var_chars.len();
                            // Check for postfix ++ or --
                            let has_postfix_update = after_idx + 1 < chars.len()
                                && ((chars[after_idx] == '+' && chars[after_idx + 1] == '+')
                                    || (chars[after_idx] == '-' && chars[after_idx + 1] == '-'));
                            // Check for prefix ++ or --
                            let has_prefix_update = i >= 2
                                && ((chars[i - 2] == '+' && chars[i - 1] == '+')
                                    || (chars[i - 2] == '-' && chars[i - 1] == '-'));
                            has_postfix_update || has_prefix_update
                        };

                        if !already_wrapped
                            && !preceded_by_dot
                            && !in_set_first_arg
                            && !in_update_arg
                            && !in_update_pre_arg
                            && !in_param_position
                            && !is_assignment_target
                            && !is_getter_setter_name
                            && !is_property_key
                            && !is_shadowed
                            && !is_update_target
                        {
                            if is_shorthand_property {
                                // Expand shorthand property: { foo } -> { foo: $.get(foo) }
                                new_result.push_str(&format!("{}: $.get({})", var, var));
                            } else {
                                new_result.push_str(&format!("$.get({})", var));
                            }
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

/// Check if a variable at the given position is a shorthand property in an object literal.
/// This detects patterns like:
/// - `{ foo, bar }` - shorthand properties
/// - `{ foo }` - single shorthand property
///
/// The variable should NOT be wrapped with $.get() if it's a shorthand property name,
/// because `{ $.get(foo) }` is invalid JavaScript.
fn is_shorthand_object_property(chars: &[char], var_start: usize, var_len: usize) -> bool {
    let var_end = var_start + var_len;

    // Skip whitespace after the variable
    let mut k = var_end;
    while k < chars.len() && chars[k].is_whitespace() {
        k += 1;
    }

    if k >= chars.len() {
        return false;
    }

    // Check what comes after: `,` or `}` (and NOT `:`)
    let next_char = chars[k];
    if next_char != ',' && next_char != '}' {
        return false;
    }

    // Now we need to verify this is inside an object literal
    // by checking what's before the variable
    // We need to find a matching `{` that's not a block statement
    // This is tricky, but we can use a simple heuristic:
    // - Preceded by `{` or `,` (possibly with whitespace)
    // - And we should verify the context looks like an object literal

    let mut j = var_start;
    // Skip whitespace before the variable
    while j > 0 && chars[j - 1].is_whitespace() {
        j -= 1;
    }

    if j == 0 {
        return false;
    }

    let prev_char = chars[j - 1];

    // Check if preceded by `{` or `,` which suggests object literal context
    if prev_char == '{' || prev_char == ',' {
        // Further check: the `{` should be preceded by something that suggests
        // an object literal, not a block statement
        // Object literals are preceded by: = : ( [ , return ? : || && ?? !
        // Block statements are preceded by: ) else do etc.

        if prev_char == '{' {
            // Check what's before the `{`
            let mut m = j - 1;
            while m > 0 && chars[m - 1].is_whitespace() {
                m -= 1;
            }

            if m == 0 {
                // `{` at the start could be a block, not an object
                return false;
            }

            let before_brace = chars[m - 1];

            // These suggest object literal context
            if before_brace == '='
                || before_brace == ':'
                || before_brace == '('
                || before_brace == '['
                || before_brace == ','
                || before_brace == '?'
                || before_brace == '|'
                || before_brace == '&'
                || before_brace == '!'
                || before_brace == 'n'
            {
                // 'n' could be the end of 'return'
                return true;
            }

            // Check for 'return ' before
            if m >= 6 {
                let prefix: String = chars[m - 6..m].iter().collect();
                if prefix == "return" {
                    return true;
                }
            }

            return false;
        }

        // If preceded by `,`, we're inside an object or array - assume object
        return true;
    }

    false
}

/// Check if a destructuring pattern starting at position `open_pos` (with the given
/// open/close bracket chars) is followed by an assignment operator `=`.
///
/// This handles patterns like:
/// - `({ x } = obj)` - object destructuring assignment
/// - `([x] = arr)` - array destructuring assignment
/// - `({ d, e, g: [f.w, f.v] } = ...)` - nested destructuring assignment
///
/// Starting from `open_pos` (the opening `{` or `[`), we scan forward to find the
/// matching closing bracket, then check if `=` follows (not `==` or `===`).
fn is_destructuring_assignment_at(
    chars: &[char],
    open_pos: usize,
    open_char: char,
    close_char: char,
) -> bool {
    let mut depth = 1;
    let mut k = open_pos + 1;
    let mut in_string: Option<char> = None;

    // Find the matching closing bracket/brace
    while k < chars.len() && depth > 0 {
        let c = chars[k];

        // Handle string literals
        if in_string.is_none() && (c == '\'' || c == '"' || c == '`') {
            in_string = Some(c);
            k += 1;
            continue;
        }
        if let Some(quote) = in_string {
            if c == quote {
                // Check for escape
                let mut backslashes = 0;
                let mut m = k;
                while m > 0 && chars[m - 1] == '\\' {
                    backslashes += 1;
                    m -= 1;
                }
                if backslashes % 2 == 0 {
                    in_string = None;
                }
            }
            k += 1;
            continue;
        }

        if c == open_char {
            depth += 1;
        } else if c == close_char {
            depth -= 1;
        }
        k += 1;
    }

    if depth != 0 {
        return false; // Unmatched brackets
    }

    // k is now right after the closing bracket/brace
    // Skip whitespace
    while k < chars.len() && chars[k].is_whitespace() {
        k += 1;
    }

    if k >= chars.len() {
        return false;
    }

    // Check for `=` but not `==` or `===`
    if chars[k] == '=' {
        if k + 1 < chars.len() && chars[k + 1] == '=' {
            return false; // It's == or ===
        }
        return true;
    }

    false
}

/// Check if a variable at the given position is on the left side of an assignment
/// or is a variable declaration.
/// This detects patterns like:
/// - `varname = expr` - simple assignment
/// - `varname += expr` - compound assignment
/// - `let varname;` - declaration without initializer
/// - `let varname = expr` - declaration with initializer
/// - `({ varname } = obj)` - object destructuring assignment
/// - `([varname] = arr)` - array destructuring assignment
///
/// The variable should NOT be wrapped with $.get() if it's an assignment target
/// or a declaration.
fn is_on_left_side_of_assignment(chars: &[char], var_start: usize, var_len: usize) -> bool {
    // Check if preceded by `let `, `const `, or `var ` (variable declaration)
    // This handles cases like `let container;` or `let container = expr`
    // The keyword includes the trailing space, so "let " has length 4.
    // For input like "let container;", var_start is at 'c' (position 4),
    // so we check chars[0..4] which should equal "let ".
    let is_declaration = {
        // Check for declaration keywords directly before the variable
        // No need to skip whitespace - the keyword pattern includes the space
        let check_keyword = |keyword: &str| -> bool {
            let kw_len = keyword.len();
            if var_start >= kw_len {
                let prefix: String = chars[var_start - kw_len..var_start].iter().collect();
                if prefix == keyword {
                    // Make sure it's a standalone keyword (not part of a larger identifier)
                    // i.e., either at start of string or preceded by non-identifier char
                    var_start == kw_len
                        || (var_start > kw_len
                            && !is_identifier_char(chars[var_start - kw_len - 1]))
                } else {
                    false
                }
            } else {
                false
            }
        };

        check_keyword("let ") || check_keyword("const ") || check_keyword("var ")
    };

    if is_declaration {
        return true;
    }

    // Check if the variable is inside a destructuring pattern in a declaration or assignment.
    // Declaration: `let { a } = ...` or `let [a, b] = ...` or `const { x: { y: a } } = ...`
    // Assignment: `({ x } = obj)` or `([x] = arr)` or `({ d, e } = expr)`
    // We walk backwards tracking brace/bracket depth to find the opening `{` or `[`,
    // then check if it's preceded by a declaration keyword (declaration case),
    // or if the matching closing bracket/brace is followed by `=` (assignment case).
    let is_in_destructuring_pattern = {
        let mut j = var_start;
        let mut brace_depth = 0;
        let mut bracket_depth = 0;
        let mut in_string: Option<char> = None;
        let mut found = false;

        // Walk backwards from the variable position
        while j > 0 {
            j -= 1;
            let c = chars[j];

            // Handle string boundaries (walking backwards)
            if in_string.is_none() && (c == '\'' || c == '"' || c == '`') {
                // Check if this quote is escaped
                let mut backslashes = 0;
                let mut k = j;
                while k > 0 && chars[k - 1] == '\\' {
                    backslashes += 1;
                    k -= 1;
                }
                if backslashes % 2 == 0 {
                    in_string = Some(c);
                }
                continue;
            } else if in_string == Some(c) {
                // Check if this quote is escaped
                let mut backslashes = 0;
                let mut k = j;
                while k > 0 && chars[k - 1] == '\\' {
                    backslashes += 1;
                    k -= 1;
                }
                if backslashes % 2 == 0 {
                    in_string = None;
                }
                continue;
            }

            // Skip if inside a string
            if in_string.is_some() {
                continue;
            }

            match c {
                '}' => brace_depth += 1,
                '{' => {
                    if brace_depth > 0 {
                        brace_depth -= 1;
                    } else {
                        // Found the opening brace at our depth level
                        // Check if it's preceded by a declaration keyword
                        let mut k = j;
                        // Skip whitespace before the brace
                        while k > 0 && chars[k - 1].is_whitespace() {
                            k -= 1;
                        }
                        // Check for declaration keywords (without trailing space since we've
                        // already skipped the whitespace between keyword and brace)
                        if k >= 3 {
                            let prefix: String = chars[k - 3..k].iter().collect();
                            if prefix == "let" || prefix == "var" {
                                // Make sure it's a standalone keyword
                                if k == 3 || !is_identifier_char(chars[k - 4]) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if k >= 5 {
                            let prefix: String = chars[k - 5..k].iter().collect();
                            if prefix == "const" {
                                // Make sure it's a standalone keyword
                                if k == 5 || !is_identifier_char(chars[k - 6]) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        // Not a declaration - check if this is a destructuring assignment
                        // Find the matching closing `}` and check if `=` follows
                        if is_destructuring_assignment_at(chars, j, '{', '}') {
                            found = true;
                        }
                        break;
                    }
                }
                ']' => bracket_depth += 1,
                '[' => {
                    if bracket_depth > 0 {
                        bracket_depth -= 1;
                    } else {
                        // Found the opening bracket at our depth level
                        // Check if it's preceded by a declaration keyword
                        let mut k = j;
                        // Skip whitespace before the bracket
                        while k > 0 && chars[k - 1].is_whitespace() {
                            k -= 1;
                        }
                        // Check for declaration keywords (without trailing space since we've
                        // already skipped the whitespace between keyword and bracket)
                        if k >= 3 {
                            let prefix: String = chars[k - 3..k].iter().collect();
                            if prefix == "let" || prefix == "var" {
                                // Make sure it's a standalone keyword
                                if k == 3 || !is_identifier_char(chars[k - 4]) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if k >= 5 {
                            let prefix: String = chars[k - 5..k].iter().collect();
                            if prefix == "const" {
                                // Make sure it's a standalone keyword
                                if k == 5 || !is_identifier_char(chars[k - 6]) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        // Not a declaration - check if this is a destructuring assignment
                        // Find the matching closing `]` and check if `=` follows
                        if is_destructuring_assignment_at(chars, j, '[', ']') {
                            found = true;
                        }
                        break;
                    }
                }
                // Stop at statement boundaries if we're not inside a destructuring
                ';' | '\n' if brace_depth == 0 && bracket_depth == 0 => break,
                _ => {}
            }
        }
        found
    };

    if is_in_destructuring_pattern {
        return true;
    }

    let var_end = var_start + var_len;

    // Skip whitespace after the variable
    let mut k = var_end;
    while k < chars.len() && chars[k].is_whitespace() {
        k += 1;
    }

    if k >= chars.len() {
        return false;
    }

    // Check for assignment operator: = += -= *= /= %= **= etc.
    let next_char = chars[k];

    if next_char == '=' {
        // Could be = or == or ===
        // For assignment, we only have = not followed by =
        if k + 1 < chars.len() && chars[k + 1] == '=' {
            // It's == or ===, not an assignment
            return false;
        }
        // It's a simple assignment
        return true;
    }

    // Check for compound assignments: += -= *= /= %= **=
    if k + 1 < chars.len()
        && chars[k + 1] == '='
        && (next_char == '+' || next_char == '-' || next_char == '*' || next_char == '/')
    {
        // Make sure it's not !== or similar
        if k + 2 < chars.len() && chars[k + 2] == '=' {
            return false;
        }
        return true;
    }

    // Check for **=
    if k + 2 < chars.len() && chars[k] == '*' && chars[k + 1] == '*' && chars[k + 2] == '=' {
        return true;
    }

    // Check for %= ||= &&= ??=
    if k + 1 < chars.len()
        && chars[k + 1] == '='
        && (next_char == '%' || next_char == '|' || next_char == '&' || next_char == '?')
    {
        // Check for ||= &&= ??= (two char operators)
        if (next_char == '|' || next_char == '&' || next_char == '?')
            && k + 2 < chars.len()
            && chars[k + 2] == '='
        {
            // It's ||= or &&= or ??=
            return chars[k] == chars[k + 1]; // e.g., || or && or ??
        }
        // It's %= or similar
        return true;
    }

    false
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
/// - Top-level function calls (could return objects)
///
/// Returns `false` for:
/// - Primitives (numbers, strings, booleans, null, undefined)
/// - Arithmetic/binary operations
/// - Unary operations
/// - Identifier references
/// - Arrow functions and function expressions (even if they contain objects inside)
fn expression_needs_proxy(expr: &str) -> bool {
    let trimmed = expr.trim();

    // Arrow functions and function expressions don't need proxy wrapping
    // They're functions themselves, not objects/arrays
    // Check for patterns like:
    // - `(x) => ...` or `x => ...` (arrow function)
    // - `function(...)` (function expression)
    // - `async (x) => ...` or `async function(...)` (async variants)
    if is_function_expression(trimmed) {
        return false;
    }

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

    // Check for top-level function call pattern: identifier followed by (
    // But not operators like !, -, etc.
    // Also check for method calls like foo.bar()
    // NOTE: Only check the TOP-LEVEL expression, not nested function calls
    if is_top_level_function_call(trimmed) {
        return true;
    }

    // Identifiers (except primitives like undefined, null, true, false)
    // could be objects/arrays passed as arguments, so they need proxy
    if is_simple_identifier(trimmed)
        && !matches!(
            trimmed,
            "undefined" | "null" | "true" | "false" | "NaN" | "Infinity"
        )
    {
        return true;
    }

    // Member expressions (foo.bar, foo.bar.baz) could return objects/arrays
    // They need proxy because the returned value type is unknown
    if is_member_expression(trimmed) {
        return true;
    }

    // Ternary/conditional expressions (a ? b : c) need proxy if either branch
    // could produce a proxyable value. In the official Svelte compiler,
    // ConditionalExpression is not in the list of types that return false from
    // should_proxy, so it always returns true.
    // Check for ternary expressions by looking for '?' at the top level
    if contains_top_level_ternary(trimmed) {
        return true;
    }

    // Logical expressions with || or ?? could produce proxyable values
    // e.g., `expr || { default: true }` or `expr ?? { fallback: 1 }`
    if contains_top_level_logical_with_proxyable(trimmed) {
        return true;
    }

    false
}

/// Check if an expression is a simple identifier (not a complex expression)
fn is_simple_identifier(expr: &str) -> bool {
    if expr.is_empty() {
        return false;
    }
    let first_char = expr.chars().next().unwrap();
    // Must start with letter, underscore, or $
    if !first_char.is_alphabetic() && first_char != '_' && first_char != '$' {
        return false;
    }
    // All chars must be alphanumeric, underscore, or $
    expr.chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Check if an expression is a member expression (e.g., foo.bar, foo.bar.baz)
/// but not a function call (foo.bar()).
fn is_member_expression(expr: &str) -> bool {
    let trimmed = expr.trim();
    if trimmed.is_empty() {
        return false;
    }

    // Must start with an identifier character
    let first_char = trimmed.chars().next().unwrap();
    if !first_char.is_alphabetic() && first_char != '_' && first_char != '$' {
        return false;
    }

    // Check if it contains at least one dot and all parts are valid identifiers
    // Also ensure it doesn't end with () which would make it a function call
    if !trimmed.contains('.') {
        return false;
    }

    // If it ends with ), it's likely a function call, not a pure member expression
    if trimmed.ends_with(')') {
        return false;
    }

    // Check that all parts separated by . are valid identifiers
    for part in trimmed.split('.') {
        let part = part.trim();
        if part.is_empty() {
            return false;
        }
        let first = part.chars().next().unwrap();
        if !first.is_alphabetic() && first != '_' && first != '$' {
            return false;
        }
        if !part
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        {
            return false;
        }
    }

    true
}

/// Check if an expression contains a top-level ternary operator (? :).
/// This handles expressions like `$.get(post) ? null : { title: 'hello world' }`.
/// "Top-level" means not nested inside parentheses, brackets, or braces.
fn contains_top_level_ternary(expr: &str) -> bool {
    let mut depth = 0;
    let bytes = expr.as_bytes();
    let mut in_string = false;
    let mut string_char = b'\0';

    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i];

        if in_string {
            if c == string_char && (i == 0 || bytes[i - 1] != b'\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }

        match c {
            b'\'' | b'"' | b'`' => {
                in_string = true;
                string_char = c;
            }
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => {
                if depth > 0 {
                    depth -= 1;
                }
            }
            b'?' if depth == 0 => {
                // Make sure it's not ?. (optional chaining) or ?? (nullish coalescing)
                if i + 1 < bytes.len() && (bytes[i + 1] == b'.' || bytes[i + 1] == b'?') {
                    i += 2;
                    continue;
                }
                return true;
            }
            _ => {}
        }
        i += 1;
    }
    false
}

/// Check if an expression contains a top-level logical operator (|| or ??)
/// followed by a proxyable value (object literal, array literal, etc.).
/// For example: `expr || { default: true }` or `expr ?? [1, 2, 3]`.
fn contains_top_level_logical_with_proxyable(expr: &str) -> bool {
    let mut depth = 0;
    let bytes = expr.as_bytes();
    let mut in_string = false;
    let mut string_char = b'\0';

    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i];

        if in_string {
            if c == string_char && (i == 0 || bytes[i - 1] != b'\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }

        match c {
            b'\'' | b'"' | b'`' => {
                in_string = true;
                string_char = c;
            }
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => {
                if depth > 0 {
                    depth -= 1;
                }
            }
            b'|' if depth == 0 && i + 1 < bytes.len() && bytes[i + 1] == b'|' => {
                // Found ||, check if the right side is proxyable
                let rest = expr[i + 2..].trim();
                if rest.starts_with('{') || rest.starts_with('[') || rest.starts_with("new ") {
                    return true;
                }
                i += 2;
                continue;
            }
            b'?' if depth == 0 && i + 1 < bytes.len() && bytes[i + 1] == b'?' => {
                // Found ??, check if right side is proxyable
                let rest = expr[i + 2..].trim();
                if rest.starts_with('{') || rest.starts_with('[') || rest.starts_with("new ") {
                    return true;
                }
                i += 2;
                continue;
            }
            _ => {}
        }
        i += 1;
    }
    false
}

/// Check if an expression is a function expression (arrow function or function keyword).
fn is_function_expression(expr: &str) -> bool {
    let trimmed = expr.trim();

    // Check for async prefix
    let without_async = trimmed
        .strip_prefix("async ")
        .map(|s| s.trim())
        .unwrap_or(trimmed);

    // Check for function keyword
    if let Some(after_fn) = without_async.strip_prefix("function") {
        // Could be `function(` or `function name(`
        if after_fn.starts_with('(') || after_fn.starts_with(' ') || after_fn.starts_with('*') {
            return true;
        }
    }

    // Check for arrow function patterns:
    // - `(x) => ...` - starts with (
    // - `x => ...` - starts with identifier followed by =>
    // - `() => ...` - empty params
    if let Some(inner) = without_async.strip_prefix('(') {
        // Could be `(x) => ...` or just a parenthesized expression
        // Look for `) =>` pattern
        if let Some(paren_end) = find_matching_paren(inner) {
            let after_paren = inner[paren_end + 1..].trim_start();
            if after_paren.starts_with("=>") {
                return true;
            }
        }
    }

    // Check for `identifier =>` pattern (single param arrow function without parens)
    // e.g., `name => {...}` or `x => x + 1`
    let mut chars = without_async.chars().peekable();
    let mut ident = String::new();

    // Collect identifier chars
    while let Some(&c) = chars.peek() {
        if c.is_alphanumeric() || c == '_' || c == '$' {
            ident.push(c);
            chars.next();
        } else {
            break;
        }
    }

    if !ident.is_empty() {
        // Skip whitespace after identifier
        while let Some(&c) = chars.peek() {
            if c.is_whitespace() {
                chars.next();
            } else {
                break;
            }
        }
        // Check for =>
        let remaining: String = chars.collect();
        if remaining.starts_with("=>") {
            return true;
        }
    }

    false
}

/// Check if an expression is a top-level function call.
/// This only checks if the expression starts with a function call pattern,
/// not if it contains function calls nested inside.
fn is_top_level_function_call(expr: &str) -> bool {
    let trimmed = expr.trim();

    // Skip arrow functions and function expressions
    if is_function_expression(trimmed) {
        return false;
    }

    // Look for pattern: identifier(...) or identifier.method(...)
    let chars: Vec<char> = trimmed.chars().collect();
    let mut i = 0;

    // Must start with identifier or (
    if chars.is_empty() {
        return false;
    }

    let first = chars[0];

    // If starts with ( it could be an IIFE: (function(){})() or (() => {})()
    // For simplicity, skip these for now
    if first == '(' {
        return false;
    }

    // Skip if starts with operators or non-identifier chars
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }

    // Collect the identifier path (could include dots for method calls)
    while i < chars.len() {
        let c = chars[i];
        if c.is_alphanumeric() || c == '_' || c == '$' || c == '.' {
            i += 1;
        } else {
            break;
        }
    }

    // After identifier, should be (
    if i < chars.len() && chars[i] == '(' {
        // Check it's not a keyword
        let ident: String = chars[..i].iter().collect();
        let last_part = ident.split('.').next_back().unwrap_or(&ident);
        let keywords = [
            "if", "while", "for", "switch", "catch", "with", "function", "async",
        ];
        if keywords.contains(&last_part) {
            return false;
        }
        return true;
    }

    false
}

/// Check if an expression contains a function call.
#[allow(dead_code)]
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
    let mut constructor_params = String::new();
    let mut constructor_start = None;

    // Track the end position of the constructor (after the closing brace)
    let mut constructor_end: Option<usize> = None;

    // Find constructor first
    if let Some(ctor_pos) = class_body.find("constructor(") {
        let after_ctor = &class_body[ctor_pos..];
        // Extract constructor parameters
        if let Some(paren_start) = after_ctor.find('(') {
            let params_start = paren_start + 1;
            let mut depth = 1;
            let mut params_end = params_start;
            for (i, c) in after_ctor[params_start..].char_indices() {
                match c {
                    '(' => depth += 1,
                    ')' => {
                        depth -= 1;
                        if depth == 0 {
                            params_end = params_start + i;
                            break;
                        }
                    }
                    _ => {}
                }
            }
            constructor_params = after_ctor[params_start..params_end].to_string();
        }

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
            // The constructor ends at the closing brace (position ctor_body_end + 1 to include the brace)
            constructor_end = Some(ctor_body_end + 1);
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
    // Also track non-rune fields that need to be preserved
    let mut non_rune_fields: Vec<String> = Vec::new();

    for line in fields_section.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        // Check for $state.raw field first (must check before $state to avoid false match)
        // $state.raw() should NOT get $.proxy() wrapping
        if trimmed.contains("= $state.raw(") || trimmed.contains("=$state.raw(") {
            if let Some(field) = parse_state_field(trimmed, "$state.raw") {
                fields.push(field);
            }
        }
        // Check for $state.frozen field (similar to $state.raw)
        else if trimmed.contains("= $state.frozen(") || trimmed.contains("=$state.frozen(") {
            if let Some(field) = parse_state_field(trimmed, "$state.frozen") {
                fields.push(field);
            }
        }
        // Check for $state field: name = $state(...) or #name = $state(...)
        else if trimmed.contains("= $state(") || trimmed.contains("=$state(") {
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
        // Preserve non-rune class members (private fields, regular fields, etc.)
        else {
            non_rune_fields.push(line.to_string());
        }
    }

    if fields.is_empty() {
        return script.to_string();
    }

    // Deconflict private backing names for public fields
    // If a public field "count" exists and there's already a "#count" private field,
    // rename the backing field to "#_count" (prepend _ until unique)
    // Note: We start from the already-sanitized private_backing_name, not field.name
    for field in &mut fields {
        if !field.is_private {
            // Start with the already-sanitized name (handles numeric names like "0" -> "_")
            let mut deconflicted = field.private_backing_name.clone();
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
            // Transform $state: #name = $.state(value) or $.state($.proxy(value)) for objects/arrays
            // Check if the value needs $.proxy() wrapping
            let value_trimmed = field.value.trim();
            let needs_proxy = !value_trimmed.is_empty() && expression_needs_proxy(value_trimmed);

            let wrapped_value = if needs_proxy {
                format!("$.proxy({})", field.value)
            } else {
                field.value.clone()
            };

            new_class_body.push_str(&format!(
                "\t\t{} = $.state({});\n",
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
                    "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value, true);\n\t\t}}\n",
                    field.name, private_name
                ));
            }
        } else if field.rune_type == "$state.raw" || field.rune_type == "$state.frozen" {
            // Transform $state.raw/$state.frozen: #name = $.state(value) - NO $.proxy() wrapping
            // These runes explicitly opt out of deep reactivity
            new_class_body.push_str(&format!(
                "\t\t{} = $.state({});\n",
                private_name, field.value
            ));

            // Add getter/setter only for public fields
            // Note: setter should NOT have the third argument (true) for raw state
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

    // Add non-rune fields (private fields, regular fields without $state/$derived)
    // These need to be preserved in their original form
    for field_line in &non_rune_fields {
        new_class_body.push_str(field_line);
        if !field_line.ends_with('\n') {
            new_class_body.push('\n');
        }
    }

    // Add constructor with transformed assignments
    if constructor_start.is_some() {
        new_class_body.push('\n');
        new_class_body.push_str(&format!("\t\tconstructor({}) {{\n", constructor_params));

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

    // Add methods and other class members that come after the constructor
    // (e.g., inc(), get a(), get b(), get c())
    if let Some(ctor_end) = constructor_end {
        let rest_of_class = &class_body[ctor_end..];
        let transformed_rest = transform_class_methods(rest_of_class, &fields);
        if !transformed_rest.trim().is_empty() {
            new_class_body.push_str(&transformed_rest);
        }
    } else if constructor_start.is_none() && !fields.is_empty() {
        // No constructor, but we have fields - there may be methods after the fields
        // Find where the fields end and include the rest
        let last_field_line = fields_section.rfind('\n').map(|p| p + 1).unwrap_or(0);
        if last_field_line < class_body.len() {
            let rest_of_class = &class_body[fields_section.len()..];
            let transformed_rest = transform_class_methods(rest_of_class, &fields);
            if !transformed_rest.trim().is_empty() {
                new_class_body.push_str(&transformed_rest);
            }
        }
    }

    // Build the final result
    let before_class = &script[..class_pos];
    let after_class_body = &script[class_body_end + 1..]; // Skip closing brace

    format!(
        "{}{}\n{}\t}}{}",
        before_class, class_header, new_class_body, after_class_body
    )
}

/// Sanitize a name to be a valid JavaScript identifier.
/// Replaces invalid identifier characters with underscores.
/// For example, "0" becomes "_", "1foo" becomes "_foo".
fn sanitize_identifier(name: &str) -> String {
    REGEX_INVALID_IDENTIFIER_CHARS
        .replace_all(name, "_")
        .to_string()
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

    // Sanitize the private backing name to ensure it's a valid identifier
    // This handles cases like numeric property names (0, 1) which become (_)
    let private_backing_name = sanitize_identifier(&name);

    Some(ClassStateField {
        name: name.clone(),
        is_private,
        rune_type: rune_type.to_string(),
        value,
        private_backing_name, // Sanitized to be a valid identifier
    })
}

/// Transform class methods to use $.get() for state field accesses.
///
/// For private state fields (those initialized with $state or $derived),
/// we need to wrap accesses with $.get() and mutations with $.get().
fn transform_class_methods(content: &str, fields: &[ClassStateField]) -> String {
    if content.trim().is_empty() || fields.is_empty() {
        return content.to_string();
    }

    let mut result = content.to_string();

    // Transform accesses to private state fields
    // this.#name -> $.get(this.#name) when reading
    // this.#name.prop -> $.get(this.#name).prop when accessing properties
    for field in fields {
        if field.is_private {
            let private_name = format!("this.#{}", field.private_backing_name);

            // Don't transform if it's on the left side of an assignment
            // We need to handle this more carefully - for mutations like this.#a.val += 1,
            // we want $.get(this.#a).val += 1

            // Replace property access patterns: this.#name. -> $.get(this.#name).
            // But NOT this.#name = (direct assignment)
            let property_access_pattern = format!("{}.", private_name);
            let getter_wrapped = format!("$.get({}).", private_name);

            // Replace optional chaining patterns: this.#name?. -> $.get(this.#name)?.
            let optional_access_pattern = format!("{}?.", private_name);
            let optional_getter_wrapped = format!("$.get({})?.?.", private_name);

            result = result.replace(&property_access_pattern, &getter_wrapped);
            result = result.replace(&optional_access_pattern, &optional_getter_wrapped);

            // Handle cases where this.#name is used in a return statement without property access
            // return this.#name -> return $.get(this.#name)
            let return_pattern = format!("return {};", private_name);
            let return_wrapped = format!("return $.get({});", private_name);
            result = result.replace(&return_pattern, &return_wrapped);

            // Handle optional access in return: return this.#name?. -> return $.get(this.#name)?.
            let return_optional_pattern = format!("return {}?.", private_name);
            let return_optional_wrapped = format!("return $.get({})?.", private_name);
            result = result.replace(&return_optional_pattern, &return_optional_wrapped);
        }
    }

    // Clean up any double wrapping that might have occurred
    result = result.replace("$.get($.get(", "$.get(");
    // Fix optional chaining that got double-wrapped
    result = result.replace("?.?.", "?.");

    result
}

/// Transform constructor assignments for private state fields and rune calls.
fn transform_constructor_assignment(line: &str, fields: &[ClassStateField]) -> String {
    let mut result = line.trim().to_string();

    // Transform $effect.pre -> $.user_pre_effect
    if result.contains("$effect.pre(") {
        result = result.replace("$effect.pre(", "$.user_pre_effect(");
    }

    // Transform $effect -> $.user_effect
    if result.contains("$effect(") {
        result = result.replace("$effect(", "$.user_effect(");
    }

    // Check for private field assignment: this.#name = value
    if result.starts_with("this.#") && result.contains('=') {
        for field in fields {
            if field.is_private {
                // Handle logical assignment operators: ||=, &&=, ??=
                // this.#a ||= {val: 0} -> $.set(this.#a, this.#a.v || { val: 0 }, true);
                let logical_ops = [("||=", "||"), ("&&=", "&&"), ("??=", "??")];
                for (assign_op, binary_op) in logical_ops {
                    let pattern = format!("this.#{} {}", field.name, assign_op);
                    let pattern_nospace = format!("this.#{}{}", field.name, assign_op);

                    if result.starts_with(&pattern) || result.starts_with(&pattern_nospace) {
                        let op_pos = result.find(assign_op).unwrap();
                        let value = result[op_pos + assign_op.len()..]
                            .trim()
                            .trim_end_matches(';');
                        // Use .v to access the value directly for logical operators
                        return format!(
                            "$.set(this.#{}, this.#{}.v {} {}, true);",
                            field.private_backing_name,
                            field.private_backing_name,
                            binary_op,
                            value
                        );
                    }
                }

                // Handle regular assignment: this.#name = value
                let pattern = format!("this.#{} =", field.name);
                let pattern_nospace = format!("this.#{}=", field.name);

                if result.starts_with(&pattern) || result.starts_with(&pattern_nospace) {
                    let eq_pos = result.find('=').unwrap();
                    let value = result[eq_pos + 1..].trim().trim_end_matches(';');
                    // Use private_backing_name for the output
                    // Add proxy flag (true) for $state fields when value could be an object
                    // This matches the official compiler's should_proxy() logic
                    let needs_proxy = field.rune_type == "$state" && expression_needs_proxy(value);
                    if needs_proxy {
                        return format!(
                            "$.set(this.#{}, {}, true);",
                            field.private_backing_name, value
                        );
                    } else {
                        return format!("$.set(this.#{}, {});", field.private_backing_name, value);
                    }
                }

                // Handle member access on private state field: this.#name.prop = value
                // -> this.#name.v.prop = value (in constructor, we use .v for direct access)
                // Reference: MemberExpression.js - in constructor for $state fields, use .v
                let member_pattern = format!("this.#{}.", field.name);
                if result.contains(&member_pattern)
                    && (field.rune_type == "$state" || field.rune_type == "$state.raw")
                {
                    let with_v = format!("this.#{}.v.", field.private_backing_name);
                    result = result.replace(&member_pattern, &with_v);
                    return result;
                }
            }
        }
    }

    result
}

/// Apply the unthunk optimization to a string expression.
///
/// Matches the behavior of Svelte's `unthunk()` in builders.js:
/// - `identifier()` (call with no args to an identifier) -> `identifier`
///   (the wrapping `() =>` will be added by the caller)
/// - Otherwise, returns `() => expr`
///
/// This is used to optimize `$.derived(() => doubled())` to `$.derived(doubled)`.
fn unthunk_string(expr: &str) -> String {
    let trimmed = expr.trim();

    // Check if the expression is a simple call: identifier() or identifier.method()
    // Pattern: the expr ends with "()" and the part before "()" is a valid identifier
    if let Some(callee) = trimmed.strip_suffix("()") {
        let is_simple_identifier = !callee.is_empty()
            && callee
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$' || c == '.');
        if is_simple_identifier {
            return callee.to_string();
        }
    }

    // No optimization possible, wrap in arrow
    format!("() => {}", expr)
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

    #[test]
    fn test_derived_object_literal_wrapped_in_parens() {
        // Test that object literals in $derived() are wrapped in parentheses
        let input = "let count = $derived({ value: 1 });";
        let options = crate::compiler::CompileOptions::default();
        let analysis =
            crate::compiler::phases::phase2_analyze::types::ComponentAnalysis::new("", &options);
        let result = transform_client_runes_with_skip_and_state(
            input,
            &[],   // skip_state_vars
            &[],   // state_vars
            &[],   // non_reactive_vars
            &[],   // prop_source_vars
            &[],   // exported_names
            &[],   // proxy_vars
            false, // dev
            &analysis,
        );
        println!("Input:  {}", input);
        println!("Result: {}", result);
        assert!(
            result.contains("$.derived(() => ({"),
            "Object literal should be wrapped in parentheses: {}",
            result
        );
    }

    #[test]
    fn test_transform_prop_reads_in_expr() {
        // Test that prop reads are transformed to prop() calls
        let prop_vars = vec!["a".to_string(), "b".to_string()];

        // Simple expression
        let result = transform_prop_reads_in_expr("a + b", &prop_vars);
        println!("Input: 'a + b'");
        println!("Result: '{}'", result);
        assert_eq!(
            result, "a() + b()",
            "Should transform 'a + b' to 'a() + b()'"
        );

        // Don't double-transform
        let result2 = transform_prop_reads_in_expr("a() + b()", &prop_vars);
        println!("Input: 'a() + b()'");
        println!("Result: '{}'", result2);
        assert_eq!(result2, "a() + b()", "Should not double-transform");

        // Multiplication
        let prop_vars2 = vec!["c".to_string()];
        let result3 = transform_prop_reads_in_expr("c * c", &prop_vars2);
        println!("Input: 'c * c'");
        println!("Result: '{}'", result3);
        assert_eq!(
            result3, "c() * c()",
            "Should transform 'c * c' to 'c() * c()'"
        );
    }
}

#[test]
fn test_derived_object_literal_double_wrap() {
    // Test that the double wrapping preserves parentheses
    let input = "let count = $derived({ value: 1 });";

    let options = crate::compiler::CompileOptions::default();
    let analysis =
        crate::compiler::phases::phase2_analyze::types::ComponentAnalysis::new("", &options);

    // First transform
    let result1 = transform_client_runes_with_skip_and_state(
        input,
        &[],   // skip_state_vars
        &[],   // state_vars
        &[],   // non_reactive_vars
        &[],   // prop_source_vars
        &[],   // exported_names
        &[],   // proxy_vars
        false, // dev
        &analysis,
    );
    println!("After first transform: {}", result1);

    // Second wrap (simulating what happens in the actual code)
    // Note: "count" is a state variable after $derived transformation
    let result2 = wrap_state_vars_in_expr(
        &result1,
        &["count".to_string()], // state_vars
        &[],                    // non_reactive_vars
        &[],                    // proxy_vars
    );
    println!("After second wrap: {}", result2);

    assert!(
        result2.contains("$.derived(() => ({"),
        "Object literal should still be wrapped in parentheses: {}",
        result2
    );
}

#[test]
fn test_mutation_wrap_state_vars() {
    // Test the mutation case: $.set(pending, pending.filter(...), true)
    // The second `pending` should be wrapped with $.get()
    let input = "$.set(pending, pending.filter((p) => p !== id), true)";
    let state_vars = vec!["pending".to_string()];

    let result = wrap_state_vars_in_expr(input, &state_vars, &[], &[]);

    // The expected output is:
    // $.set(pending, $.get(pending).filter((p) => p !== id), true)
    // First `pending` after $.set( should NOT be wrapped (it's the target)
    // Second `pending` should be wrapped with $.get()
    assert!(
        result.contains("$.get(pending).filter"),
        "Second pending should be wrapped with $.get(): {}",
        result
    );
    assert!(
        result.starts_with("$.set(pending,"),
        "First pending should NOT be wrapped: {}",
        result
    );
}

#[test]
fn test_mutation_wrap_state_vars_in_context() {
    // Test with nested function context - state vars inside arrow function body
    // should still be wrapped even when inside if statement conditions.
    // This tests the fix for is_shadowed_by_function_param incorrectly detecting
    // variables inside if() conditions as shadowed parameters.
    let input = r#"const togglePending = () => {
    if ($.get(pending).includes(id)) {
        $.set(pending, pending.filter((p) => p !== id), true);
    } else {
        $.set(pending, [...$.get(pending), id], true);
    }
};"#;
    let state_vars = vec!["pending".to_string()];

    let result = wrap_state_vars_in_expr(input, &state_vars, &[], &[]);

    // Both $.set second args should have $.get(pending)
    assert!(
        result.contains("$.set(pending, $.get(pending).filter"),
        "Second pending in filter should be wrapped with $.get(): {}",
        result
    );
}
