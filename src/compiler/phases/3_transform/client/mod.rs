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

use std::cell::{Cell, RefCell};
use std::rc::Rc;
use std::sync::LazyLock;

use rustc_hash::FxHashSet;

use regex::Regex;

use super::TransformError;
use super::js_ast::{
    builders::{self as b},
    codegen::{CodegenResult, generate_with_sourcemap},
    nodes::{
        JsBlockStatement, JsExportDefault, JsExportDefaultDeclaration, JsExpr,
        JsFunctionDeclaration, JsImportDeclaration, JsImportSpecifier, JsObjectMember, JsPattern,
        JsProgram, JsPropertyKey, JsStatement, JsVariableKind,
    },
};
use crate::ast::template::Root;
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::scope::{BindingKind, DeclarationKind};

// Import new visitor system types
use types::{ComponentClientTransformState, ComponentContext, TransformOptions, TransformResult};

// Cached regular expression for $$props replacement
static REGEX_DOLLAR_PROPS: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\$\$props\b").unwrap());

// Cached regular expressions for performance
static REGEX_STATE_DERIVED_VAR: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(let|const|var)\s+(\w+)\s*=\s*\$(?:state|derived)(?:\.by)?\s*\(").unwrap()
});

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
    // Counter for generating unique tmp variable names for $state/$state.raw destructuring.
    // Generates tmp, tmp_1, tmp_2, etc.
    static STATE_TMP_COUNTER: Cell<usize> = const { Cell::new(0) };
    // Var-declared state/derived vars that need $.safe_get() instead of $.get()
    // var declarations are hoisted, so they can be read before initialization.
    // $.safe_get() handles this by returning undefined if not yet initialized.
    // Reference: declarations.js line 26
    static VAR_STATE_VARS: RefCell<Vec<String>> = const { RefCell::new(Vec::new()) };
}

// Thread-local cache for dynamically-constructed regex patterns to avoid recompilation
thread_local! {
    static REGEX_CACHE: RefCell<rustc_hash::FxHashMap<String, Regex>> = RefCell::new(rustc_hash::FxHashMap::default());
}

fn get_or_compile_regex(pattern: &str) -> Option<Regex> {
    REGEX_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        if let Some(re) = cache.get(pattern) {
            return Some(re.clone());
        }
        match Regex::new(pattern) {
            Ok(re) => {
                cache.insert(pattern.to_string(), re.clone());
                Some(re)
            }
            Err(_) => None,
        }
    })
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
    source: &str,
    options: &CompileOptions,
) -> Result<CodegenResult, TransformError> {
    transform_client_with_visitors(analysis, ast, source, options)
}

/// Transform a module (.svelte.js/.svelte.ts) into client-side JavaScript.
///
/// Unlike `transform_client`, this does NOT generate a component function wrapper.
/// It only transforms the module source body (rune replacements) and prepends
/// the `import * as $ from 'svelte/internal/client'` import.
///
/// Corresponds to `client_module()` in the official Svelte compiler.
pub fn transform_client_module(
    analysis: &ComponentAnalysis,
    source: &str,
    options: &CompileOptions,
) -> Result<String, TransformError> {
    use super::js_ast::codegen::generate;

    let mut body: Vec<JsStatement> = Vec::new();

    // Leading comment: /* filename generated by Svelte vX */
    let basename = options
        .filename
        .as_ref()
        .and_then(|f| f.rsplit('/').next().or_else(|| f.rsplit('\\').next()))
        .unwrap_or("input.svelte.js");
    body.push(JsStatement::Raw(
        format!(
            "/* {} generated by Svelte v{} */",
            basename,
            option_env!("SVELTE_VERSION").unwrap_or("VERSION")
        )
        .into(),
    ));

    // import * as $ from 'svelte/internal/client'
    body.push(JsStatement::Import(
        super::js_ast::nodes::JsImportDeclaration {
            specifiers: vec![super::js_ast::nodes::JsImportSpecifier::Namespace(
                "$".into(),
            )],
            source: "svelte/internal/client".into(),
        },
    ));

    // Add tracing flag import if needed
    if analysis.tracing {
        body.push(JsStatement::Import(
            super::js_ast::nodes::JsImportDeclaration {
                specifiers: vec![],
                source: "svelte/internal/flags/tracing".into(),
            },
        ));
    }

    // Transform the module source (rune replacements, class fields, etc.)
    let class_transformed = transform_class_fields_client(source);
    let transformed = transform_module_script_runes(&class_transformed, analysis);

    // Transform destructured assignments where LHS contains state variables (client only).
    // e.g., `[a, b] = array;` where `a` and `b` are $state() variables becomes:
    //   ((array) => { var $$array = $.to_array(array, 2); $.set(a, $$array[0], true); $.set(b, $$array[1], true); })(array);
    let reactive_state_vars: Vec<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| {
            matches!(
                b.kind,
                super::super::phase2_analyze::BindingKind::State
                    | super::super::phase2_analyze::BindingKind::RawState
            ) && b.reassigned
        })
        .map(|b| b.name.clone())
        .collect();
    let transformed = transform_destructured_state_assignments(&transformed, &reactive_state_vars);

    // The transformed source includes everything (imports + body).
    // We need to split imports from body to avoid duplicate svelte import.
    let (script_imports, script_rest) = extract_imports(&transformed);

    // Add non-svelte imports
    for import_line in &script_imports {
        let trimmed = import_line.trim();
        // Skip svelte internal imports since we already added them
        if !trimmed.contains("svelte/internal/") {
            body.push(JsStatement::Raw(trimmed.into()));
        }
    }

    // Add the rest of the module body
    {
        let rest_trimmed = script_rest.trim();
        if !rest_trimmed.is_empty() {
            body.push(JsStatement::Raw(rest_trimmed.into()));
        }
    }

    let program = super::js_ast::nodes::JsProgram { body };
    generate(&program).map_err(TransformError::CodeGen)
}

/// Transform module source code for module compilation (shared between client and server).
/// Applies class field transforms and rune transforms, returns the transformed source.
pub(crate) fn transform_module_source_for_module(
    source: &str,
    analysis: &ComponentAnalysis,
) -> String {
    let class_transformed = transform_class_fields_client(source);
    transform_module_script_runes(&class_transformed, analysis)
}

/// Extract imports from a string, returning (imports, rest).
/// This is a convenience wrapper for use from the server module.
pub(crate) fn extract_imports_str(script: &str) -> (Vec<String>, Option<String>) {
    let (imports, rest) = extract_imports(script);
    let rest_trimmed = rest.trim();
    if rest_trimmed.is_empty() {
        (imports, None)
    } else {
        (imports, Some(rest_trimmed.to_string()))
    }
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
    source: &str,
    options: &CompileOptions,
) -> Result<CodegenResult, TransformError> {
    use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment;

    // Create initial node (anchor) for the transformation
    let initial_node = b::id("$$anchor");

    // Create transform options as Rc for efficient sharing
    let transform_options = Rc::new(TransformOptions {
        dev: options.dev,
        fragments: match options.fragments {
            crate::compiler::FragmentMode::Html => types::FragmentsMode::Html,
            crate::compiler::FragmentMode::Tree => types::FragmentsMode::Tree,
        },
        preserve_whitespace: options.preserve_whitespace,
        preserve_comments: options.preserve_comments,
        experimental_async: options.experimental.r#async,
        hmr: options.hmr,
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
    // NOTE: visit_program calls add_state_transformers again internally, so any
    // transform removals must happen AFTER this call.
    use crate::compiler::phases::phase3_transform::client::visitors::program::visit_program;
    visit_program(&mut context);

    // Remove transforms for variables that have shadowed $state declarations.
    // Due to a known analysis bug where inner-scope $state() declarations overwrite
    // the BindingKind of same-named outer-scope bindings (via scope conflation),
    // add_state_transformers may incorrectly register $.get()/$.set() transforms
    // for outer variables that are NOT actually $state. We detect this by checking
    // if a variable name has both a top-level non-$state declaration and an inner-scope
    // $state declaration in the instance script.
    // This MUST be done after visit_program() since it calls add_state_transformers again.
    if let Some(ref script_content) = analysis.instance_script_content {
        let shadowed_names = extract_shadowed_state_names(&script_content.raw);
        for name in &shadowed_names {
            context.state.transform.remove(name);
        }
    }

    // Pre-compute blocker map for async components.
    // This must happen BEFORE template generation so that template visitors
    // (if_block, each_block, etc.) can determine which expressions need $.async() wrapping.
    //
    // We compute it from the TRANSFORMED script (after rune transforms like $derived -> $.async_derived)
    // because the raw script may have `await` inside `$derived({...})` braces, which the
    // text-based blocker_map scanner would miss (it only looks at top-level awaits).
    //
    // Note: reactive_import_names is always empty for async components (async requires runes mode),
    // so we can safely pass an empty slice here before reactive_import_names is computed.
    let pre_transformed_script =
        if options.experimental.r#async && analysis.instance_script_content.is_some() {
            let raw = &analysis.instance_script_content.as_ref().unwrap().raw;
            let transformed = transform_instance_script_for_visitors(
                raw,
                analysis,
                options.dev,
                &[], // empty: async requires runes mode, so no reactive imports
            );
            // Use transform_async_body to get the correct thunk-level blocker_map,
            // then enrich it with transitive function dependency resolution.
            //
            // transform_async_body gives correct thunk indices but only maps variables
            // that are directly assigned in async thunks. We also need to map function
            // names (and other identifiers) that transitively reference blocked variables
            // through their function bodies.
            if let Some(async_result) =
                super::shared::async_body::transform_async_body(transformed.trim(), "$.run")
            {
                let mut blocker_map = async_result.blocker_map.clone();

                // Enrich with transitive function dependencies:
                // Scan function/const declarations for references to blocked variables.
                // If a function body references a blocked variable, add the function name
                // to the blocker_map with the same thunk index.
                super::shared::async_body::enrich_blocker_map_with_transitive_deps(
                    &transformed,
                    &mut blocker_map,
                );

                if !blocker_map.is_empty() {
                    *context.state.blocker_map.borrow_mut() = blocker_map;
                }
            } else {
                // Fallback: use compute_blocker_map if transform_async_body returns None
                let pre_blocker_map = super::shared::async_body::compute_blocker_map(&transformed);
                if !pre_blocker_map.is_empty() {
                    *context.state.blocker_map.borrow_mut() = pre_blocker_map;
                }
            }
            Some(transformed)
        } else {
            None
        };

    // Call the fragment visitor to transform the template
    // This is the root fragment of the component, so is_root_fragment=true
    let template_body = fragment(&ast.fragment, &mut context, true);

    // Collect results from state
    let hoisted_statements = std::mem::take(&mut context.state.hoisted);
    let module_level_snippets = std::mem::take(&mut context.state.module_level_snippets);
    let instance_level_snippets = std::mem::take(&mut context.state.instance_level_snippets);
    let events = std::mem::take(&mut context.state.events);
    let legacy_reactive_imports = std::mem::take(&mut context.state.legacy_reactive_imports);

    // Build binding lookup index for O(1) access by name
    // This replaces multiple O(n) linear scans through analysis.root.bindings.
    // Prefer instance-scope bindings over inner-scope bindings to avoid
    // shadowing issues (e.g., a local `const foo` inside an IIFE should not
    // shadow the instance-level `let foo` in the binding map).
    let binding_by_name: rustc_hash::FxHashMap<
        &str,
        &crate::compiler::phases::phase2_analyze::scope::Binding,
    > = {
        let instance_scope_index = analysis.root.instance_scope_index;
        let mut map: rustc_hash::FxHashMap<
            &str,
            &crate::compiler::phases::phase2_analyze::scope::Binding,
        > = rustc_hash::FxHashMap::default();
        for b in &analysis.root.bindings {
            if let Some(existing) = map.get(b.name.as_str()) {
                // Prefer instance-scope bindings over inner-scope ones
                if b.scope_index == instance_scope_index
                    && existing.scope_index != instance_scope_index
                {
                    map.insert(b.name.as_str(), b);
                }
            } else {
                map.insert(b.name.as_str(), b);
            }
        }
        map
    };

    // Collect reactive import names for legacy mode.
    // In legacy mode, mutated imports in the instance scope are wrapped with $.reactive_import()
    // and all references in the instance body use $$_import_X() instead of $.get(X).
    // Module-level imports (in <script module>) are NOT wrapped.
    // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Program.js L18-41
    let reactive_import_names: Vec<String> =
        if !analysis.runes && analysis.instance_script_content.is_some() {
            let instance_scope_index = analysis.root.instance_scope_index;
            analysis
                .root
                .bindings
                .iter()
                .filter(|b| {
                    b.declaration_kind == DeclarationKind::Import
                        && b.mutated
                        && b.scope_index == instance_scope_index
                })
                .map(|b| b.name.clone())
                .collect()
        } else {
            Vec::new()
        };

    // Collect store subscription bindings and generate setup code
    // Reference: transform-client.js lines 211-254
    let mut store_getters: Vec<JsStatement> = Vec::new();
    let mut needs_store_cleanup = false;

    // Collect store sub bindings in declaration order (matching official compiler behavior).
    // The official compiler iterates scope.declarations (a Map with insertion order).
    // Our bindings are already in insertion order from detect_store_subscriptions().
    let store_sub_bindings: Vec<&str> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| matches!(b.kind, BindingKind::StoreSub))
        .map(|b| b.name.as_str())
        .collect();

    for store_sub_name in &store_sub_bindings {
        let store_name = &store_sub_name[1..]; // e.g., "store"

        if store_getters.is_empty() {
            needs_store_cleanup = true;
        }

        // Check if the store comes from a prop
        let store_binding = binding_by_name.get(store_name);
        let is_prop_store = store_binding
            .is_some_and(|b| matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp));

        // For prop stores, check if it's a prop source (reassigned, mutated, has initial, etc.)
        // Source props use function call syntax: store()
        // Non-source props use member access: $$props.store
        let is_source_prop =
            is_prop_store && store_binding.is_some_and(|b| utils::is_prop_source(b, analysis));

        // Check if the store is a derived or state variable - if so, wrap with $.get()
        // e.g., $.get(store) instead of store
        // LegacyReactive bindings (from `$: z = expr`) are also state variables
        // that need $.get() wrapping.
        let is_derived_or_state = store_binding.is_some_and(|b| {
            matches!(
                b.kind,
                BindingKind::State
                    | BindingKind::RawState
                    | BindingKind::Derived
                    | BindingKind::LegacyReactive
            )
        });

        // Check if the store is a reactive import (mutated instance import in legacy mode)
        let is_reactive_import = reactive_import_names.iter().any(|n| n == store_name);

        // Generate: const $store = () => $.store_get(store, '$store', $$stores);
        // or: const $store = () => $.store_get(store(), '$store', $$stores); for source prop stores
        // or: const $store = () => $.store_get($$props.store, '$store', $$stores); for non-source prop stores
        // or: const $store = () => $.store_get($.get(store), '$store', $$stores); for derived/state stores
        // or: const $store = () => $.store_get($$_import_store(), '$store', $$stores); for reactive imports
        let store_access = if is_source_prop {
            b::call(b::id(store_name), vec![])
        } else if is_prop_store {
            // Non-source prop: access via $$props.store or $$props['alias']
            // prop_alias is always set for $props() destructuring, but it only differs
            // from the local name when there's a rename (e.g., `{ foo: bar }`)
            let prop_alias = store_binding.and_then(|b| b.prop_alias.as_deref());
            let actual_alias = prop_alias.filter(|alias| *alias != store_name);
            if let Some(alias) = actual_alias {
                // $$props['alias'] for renamed props
                use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
                JsExpr::Member(JsMemberExpression {
                    object: Box::new(b::id("$$props")),
                    property: JsMemberProperty::Expression(Box::new(b::string(alias))),
                    computed: true,
                    optional: false,
                })
            } else {
                // $$props.store for non-aliased props
                b::member_path(&format!("$$props.{}", store_name))
            }
        } else if is_reactive_import {
            b::call(b::id(format!("$$_import_{}", store_name)), vec![])
        } else if is_derived_or_state {
            b::call(b::member_path("$.get"), vec![b::id(store_name)])
        } else {
            b::id(store_name)
        };
        // In dev mode, add $.validate_store() call before $.store_get()
        let store_get_expr = if options.dev {
            // Build: ($.validate_store(store_access, 'store_name'), $.store_get(store_access, '$store', $$stores))
            // We need to clone store_access for the validate call
            let store_access_clone = store_access.clone();
            b::sequence(vec![
                b::call(
                    b::member_path("$.validate_store"),
                    vec![store_access_clone, b::string(store_name)],
                ),
                b::call(
                    b::member_path("$.store_get"),
                    vec![store_access, b::string(*store_sub_name), b::id("$$stores")],
                ),
            ])
        } else {
            b::call(
                b::member_path("$.store_get"),
                vec![store_access, b::string(*store_sub_name), b::id("$$stores")],
            )
        };
        store_getters.push(b::const_decl(*store_sub_name, b::thunk(store_get_expr)));
    }

    // Build store_setup: getters first, then setup_stores call
    let mut store_setup: Vec<JsStatement> = Vec::with_capacity(store_getters.len() + 1);
    store_setup.append(&mut store_getters);
    if needs_store_cleanup {
        // const [$$stores, $$cleanup] = $.setup_stores();
        store_setup.push(b::var_decl_pattern(
            JsVariableKind::Const,
            b::array_pattern(vec![
                Some(b::id_pattern("$$stores")),
                Some(b::id_pattern("$$cleanup")),
            ]),
            Some(b::call(b::member_path("$.setup_stores"), vec![])),
        ));
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
            if let Some(binding) = binding_by_name.get(export.name.as_str()) {
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

    // Check if there are any prop bindings (Prop or BindableProp) that require $$props
    // This is needed for legacy mode where props are accessed via $.prop($$props, 'name', flags)
    let has_prop_bindings = binding_by_name.values().any(|b| {
        matches!(
            b.kind,
            BindingKind::Prop | BindingKind::BindableProp | BindingKind::RestProp
        )
    });

    let is_legacy_component_api =
        options.compatibility.component_api == crate::compiler::ComponentApi::V4;
    let should_inject_context = options.dev
        || analysis.needs_context
        || !analysis.reactive_statements.is_empty()
        || has_reactive_statements  // Reactive $: statements detected in script
        || !analysis.exports.is_empty()  // All exports (not just reactive) trigger context injection
        || reactive_export_count > 0
        || bindable_prop_count > 0
        || is_legacy_component_api; // componentApi: 4 needs $.push/$.pop
    // Note: needs_store_cleanup does NOT require context injection ($.push/$.pop)
    // Store subscriptions are independent of the component context

    // Determine if we need $$props parameter
    // Note: needs_props_from_events is set during template transformation (line 169)
    // when an on: directive without expression (event forwarding) is encountered.
    // This mirrors the official compiler's OnDirective.js which sets needs_props
    // in the client transform, not the analyze phase.
    let needs_props_from_events = context.state.needs_props_from_events.get();
    let should_inject_props = should_inject_context
        || analysis.needs_props
        || needs_props_from_events
        || analysis.uses_props
        || analysis.uses_rest_props
        || analysis.uses_slots
        || !analysis.slot_names.is_empty()
        || has_prop_bindings  // Legacy mode props need $$props parameter
        || is_legacy_component_api; // componentApi: 4 needs $$props for $set/$on

    // Build component function body
    // Pre-allocate for typical component body size
    let mut component_body: Vec<JsStatement> = Vec::with_capacity(32);

    // Add legacy $$sanitized_props / $$restProps / $$slots declarations at the top.
    // These must come BEFORE $.push().
    // Reference: transform-client.js lines 458-497
    if !analysis.runes {
        // $$sanitized_props: when uses_props or uses_rest_props
        if analysis.uses_props || analysis.uses_rest_props {
            let mut to_remove = vec![
                b::string("children"),
                b::string("$$slots"),
                b::string("$$events"),
                b::string("$$legacy"),
            ];
            if analysis.custom_element.is_some() {
                to_remove.push(b::string("$$host"));
            }
            component_body.push(b::const_decl(
                "$$sanitized_props",
                b::call(
                    b::member_path("$.legacy_rest_props"),
                    vec![b::id("$$props"), b::array(to_remove)],
                ),
            ));
        }

        // $$restProps: when uses_rest_props
        if analysis.uses_rest_props {
            // Collect named props to exclude
            let mut named_props: Vec<JsExpr> = Vec::new();

            // Add export names (aliases take precedence)
            for export in &analysis.exports {
                let name = export.alias.as_deref().unwrap_or(&export.name);
                named_props.push(b::string(name));
            }

            // Add bindable prop names/aliases
            for binding in &analysis.root.bindings {
                if matches!(binding.kind, BindingKind::BindableProp) {
                    let name = binding.prop_alias.as_deref().unwrap_or(&binding.name);
                    named_props.push(b::string(name));
                }
            }

            component_body.push(b::const_decl(
                "$$restProps",
                b::call(
                    b::member_path("$.legacy_rest_props"),
                    vec![b::id("$$sanitized_props"), b::array(named_props)],
                ),
            ));
        }
    }

    // $$slots: when uses_slots (applies in both runes and legacy mode)
    if analysis.uses_slots {
        component_body.push(b::const_decl(
            "$$slots",
            b::call(b::member_path("$.sanitize_slots"), vec![b::id("$$props")]),
        ));
    }

    // Add componentApi: 4 new.target check at the very start
    // Reference: transform-client.js lines 569-582
    if options.compatibility.component_api == crate::compiler::ComponentApi::V4 {
        // if (new.target) return $$_createClassComponent({ component: ComponentName, ...$$anchor });
        component_body.push(JsStatement::If(super::js_ast::nodes::JsIfStatement {
            test: Box::new(b::id("new.target")),
            consequent: Box::new(JsStatement::Return(
                super::js_ast::nodes::JsReturnStatement {
                    argument: Some(Box::new(b::call(
                        b::id("$$_createClassComponent"),
                        vec![b::object(vec![
                            b::prop("component", b::id(&analysis.name)),
                            b::spread(b::id("$$anchor")),
                        ])],
                    ))),
                },
            )),
            alternate: None,
        }));
    }

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

    // Add legacy_reactive declarations: const name = $.mutable_source()
    // Reference: transform-client.js lines 217-228, 362
    // In legacy mode, $: reactive statement LHS variables get a const declaration
    // with $.mutable_source() so they can be read/written reactively via $.get()/$.set()
    if !analysis.runes {
        for binding in &analysis.root.bindings {
            if matches!(binding.kind, BindingKind::LegacyReactive) {
                let args = if analysis.immutable {
                    vec![
                        b::id("undefined"),
                        b::literal(super::js_ast::nodes::JsLiteral::Boolean(true)),
                    ]
                } else {
                    vec![]
                };
                component_body.push(b::const_decl(
                    &*binding.name,
                    b::call(b::member_path("$.mutable_source"), args),
                ));
            }
        }
    }

    // Add binding group declarations
    // Reference: transform-client.js lines 273-277
    // const group_binding_declarations = [];
    // for (const group of analysis.binding_groups.values()) {
    //     group_binding_declarations.push(b.const(group.name, b.array([])));
    // }
    {
        let mut group_names: Vec<&String> = analysis.binding_groups.values().collect();
        group_names.sort(); // Sort to ensure deterministic output order
        for group_name in group_names {
            component_body.push(b::const_decl(group_name, b::empty_array()));
        }
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
        // Reuse the pre-computed transformed script if available (from async blocker_map computation),
        // otherwise compute it now.
        let mut transformed_script = if let Some(pre) = pre_transformed_script {
            pre
        } else {
            transform_instance_script_for_visitors(
                &content.raw,
                analysis,
                options.dev,
                &reactive_import_names,
            )
        };

        // Post-process reactive imports: replace $.get(X)/$.mutate(X,...) with $$_import_X()
        for name in &reactive_import_names {
            let import_id = format!("$$_import_{}", name);
            transformed_script =
                replace_state_with_reactive_import(&transformed_script, name, &import_id);
        }

        // In legacy mode, replace $$props references with $$sanitized_props
        // This mirrors the official compiler's transform: read: (node) => ({ ...node, name: '$$sanitized_props' })
        // IMPORTANT: Do NOT replace $$props inside $.prop() or $.bind_prop() calls -
        // those must always reference the original $$props object. These calls are
        // generated by our transform and always use $$props directly.
        if !analysis.runes && (analysis.uses_props || analysis.uses_rest_props) {
            let re = &*REGEX_DOLLAR_PROPS;
            // Process line-by-line, skipping lines that contain $.prop( or $.bind_prop(
            // which are internal transform-generated calls that must use $$props
            let lines: Vec<&str> = transformed_script.lines().collect();
            let mut result_lines: Vec<String> = Vec::with_capacity(lines.len());
            for line in lines {
                if line.contains("$.prop(")
                    || line.contains("$.bind_prop(")
                    || line.contains("$.legacy_rest_props(")
                {
                    result_lines.push(line.to_string());
                } else {
                    // In regex replacement, $$ is a literal $, so we need $$$$ for two literal $ chars
                    result_lines.push(re.replace_all(line, "$$$$sanitized_props").to_string());
                }
            }
            transformed_script = result_lines.join("\n");
        }

        // If the text-based transform added ownership validation, set the flag
        // so that the $$ownership_validator declaration is emitted.
        if transformed_script.contains("$$ownership_validator.mutation") {
            context.state.needs_mutation_validation.set(true);
        }

        // Only add if there's actual content (not just whitespace)
        // Instance script content goes inside the component function body,
        // which is at indent level 1 (one tab). The codegen's emit_statement
        // adds indent to the first line, but subsequent lines of Raw content
        // need explicit indentation. We always use 1 because instance script
        // content is always emitted at the function body level.
        let script_indent = 1usize;
        let trimmed = transformed_script.trim();
        if !trimmed.is_empty() {
            // Apply async body transformation if experimental.async is enabled
            // This splits the instance script at the first top-level `await`
            if options.experimental.r#async {
                if let Some(async_result) =
                    super::shared::async_body::transform_async_body(trimmed, "$.run")
                {
                    let cleaned_output = strip_async_noop_placeholders(async_result.output.trim());
                    let normalized = normalize_js_with_oxc(cleaned_output.trim(), script_indent);
                    component_body.push(JsStatement::Raw(normalized.into()));
                    // Store the blocker_map for use during template generation
                    if !async_result.blocker_map.is_empty() {
                        *context.state.blocker_map.borrow_mut() = async_result.blocker_map;
                    }
                } else {
                    // No top-level await: strip any async noop placeholders
                    let cleaned = strip_async_noop_placeholders(trimmed);
                    if !cleaned.trim().is_empty() {
                        let normalized = normalize_js_with_oxc(cleaned.trim(), script_indent);
                        component_body.push(JsStatement::Raw(normalized.into()));
                    }
                }
            } else {
                // Normalize raw JavaScript formatting using OXC to match
                // the official Svelte compiler's esrap output (consistent spacing,
                // semicolons, etc.)
                let normalized = normalize_js_with_oxc(trimmed, script_indent);
                component_body.push(JsStatement::Raw(normalized.into()));
            }
        }
    }

    // Add $.legacy_pre_effect_reset() after all reactive statements
    // Reference: transform-client.js - this is called after all legacy_pre_effect() calls
    if has_reactive_statements && !analysis.runes {
        component_body.push(b::stmt(b::call(
            b::member_path("$.legacy_pre_effect_reset"),
            vec![],
        )));
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
    let needs_exports = component_returned_object_len > 0 || is_legacy_component_api || options.dev;
    if needs_exports {
        let mut exports_members: Vec<JsObjectMember> = Vec::new();

        // Process analysis.exports (const, function, class exports)
        for export in &analysis.exports {
            let name = &export.name;
            let alias = export.alias.as_deref().unwrap_or(name);

            // Find the binding
            let binding = binding_by_name.get(name.as_str()).copied();

            if let Some(binding) = binding {
                let is_identifier_expr = true; // build_getter returns identifier for simple refs

                if is_identifier_expr {
                    if matches!(
                        binding.declaration_kind,
                        crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Let
                            | crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Var
                    ) {
                        // let/var: getter + setter
                        exports_members.push(b::getter(
                            alias,
                            vec![JsStatement::Return(
                                super::js_ast::nodes::JsReturnStatement {
                                    argument: Some(Box::new(b::id(name))),
                                },
                            )],
                        ));
                        exports_members.push(b::setter(
                            alias,
                            "$$value",
                            vec![b::stmt(b::assign(b::id(name), b::id("$$value")))],
                        ));
                    } else if !options.dev {
                        // const/function/class in non-dev: simple init property
                        if alias == name {
                            exports_members.push(b::prop_shorthand(name));
                        } else {
                            exports_members.push(b::prop(alias, b::id(name)));
                        }
                    } else {
                        // dev mode: getter only
                        exports_members.push(b::getter(
                            alias,
                            vec![JsStatement::Return(
                                super::js_ast::nodes::JsReturnStatement {
                                    argument: Some(Box::new(b::id(name))),
                                },
                            )],
                        ));
                    }
                }

                // Handle prop/bindable_prop/state/raw_state (if they end up in exports)
                match binding.kind {
                    BindingKind::Prop | BindingKind::BindableProp => {
                        // When a prop is a "source" (has $.prop() declaration), its getter/setter
                        // must use function call syntax: name() for get, name(value) for set.
                        // Replace the plain getter/setter that was generated above.
                        let is_prop_source = analysis.accessors
                            || binding.reassigned
                            || binding.initial.is_some()
                            || binding.mutated;
                        if is_prop_source {
                            // Remove previously added members for this alias
                            // (could be 1 shorthand/prop, 1 getter, or getter+setter pair)
                            while exports_members.last().is_some_and(|m| match m {
                                JsObjectMember::Property(p) => match &p.key {
                                    JsPropertyKey::Identifier(k) => k == alias,
                                    _ => false,
                                },
                                _ => false,
                            }) {
                                exports_members.pop();
                            }
                            exports_members.push(b::getter(
                                alias,
                                vec![JsStatement::Return(
                                    super::js_ast::nodes::JsReturnStatement {
                                        argument: Some(Box::new(b::call(b::id(name), vec![]))),
                                    },
                                )],
                            ));
                            exports_members.push(b::setter(
                                alias,
                                "$$value",
                                vec![b::stmt(b::call(b::id(name), vec![b::id("$$value")]))],
                            ));
                        }
                    }
                    BindingKind::State => {
                        // Remove previously added members for this alias
                        while exports_members.last().is_some_and(|m| match m {
                            JsObjectMember::Property(p) => match &p.key {
                                JsPropertyKey::Identifier(k) => k == alias,
                                _ => false,
                            },
                            _ => false,
                        }) {
                            exports_members.pop();
                        }
                        exports_members.push(b::getter(
                            alias,
                            vec![JsStatement::Return(
                                super::js_ast::nodes::JsReturnStatement {
                                    argument: Some(Box::new(b::call(
                                        b::member_path("$.get"),
                                        vec![b::id(name)],
                                    ))),
                                },
                            )],
                        ));
                        exports_members.push(b::setter(
                            alias,
                            "$$value",
                            vec![b::stmt(b::call(
                                b::member_path("$.set"),
                                vec![
                                    b::id(name),
                                    b::call(b::member_path("$.proxy"), vec![b::id("$$value")]),
                                ],
                            ))],
                        ));
                    }
                    BindingKind::RawState => {
                        // Remove previously added members for this alias
                        while exports_members.last().is_some_and(|m| match m {
                            JsObjectMember::Property(p) => match &p.key {
                                JsPropertyKey::Identifier(k) => k == alias,
                                _ => false,
                            },
                            _ => false,
                        }) {
                            exports_members.pop();
                        }
                        exports_members.push(b::getter(
                            alias,
                            vec![JsStatement::Return(
                                super::js_ast::nodes::JsReturnStatement {
                                    argument: Some(Box::new(b::call(
                                        b::member_path("$.get"),
                                        vec![b::id(name)],
                                    ))),
                                },
                            )],
                        ));
                        exports_members.push(b::setter(
                            alias,
                            "$$value",
                            vec![b::stmt(b::call(
                                b::member_path("$.set"),
                                vec![b::id(name), b::id("$$value")],
                            ))],
                        ));
                    }
                    BindingKind::Derived => {
                        // Remove previously added members for this alias
                        while exports_members.last().is_some_and(|m| match m {
                            JsObjectMember::Property(p) => match &p.key {
                                JsPropertyKey::Identifier(k) => k == alias,
                                _ => false,
                            },
                            _ => false,
                        }) {
                            exports_members.pop();
                        }
                        exports_members.push(b::getter(
                            alias,
                            vec![JsStatement::Return(
                                super::js_ast::nodes::JsReturnStatement {
                                    argument: Some(Box::new(b::call(
                                        b::member_path("$.get"),
                                        vec![b::id(name)],
                                    ))),
                                },
                            )],
                        ));
                    }
                    _ => {}
                }
            } else if alias == name {
                exports_members.push(b::prop_shorthand(name));
            } else {
                exports_members.push(b::prop(alias, b::id(name)));
            }
        }

        // Add bindable props with getter/setter when accessors is enabled
        if analysis.accessors {
            for binding in &analysis.root.bindings {
                let binding_prop_name = binding.prop_alias.as_deref().unwrap_or(&binding.name);
                if matches!(binding.kind, BindingKind::BindableProp)
                    && !analysis.exports.iter().any(|e| {
                        let export_alias = e.alias.as_deref().unwrap_or(&e.name);
                        e.name == binding.name || export_alias == binding_prop_name
                    })
                {
                    let name = &binding.name;
                    let alias = binding.prop_alias.as_deref().unwrap_or(name);
                    exports_members.push(b::getter(
                        alias,
                        vec![JsStatement::Return(
                            super::js_ast::nodes::JsReturnStatement {
                                argument: Some(Box::new(b::call(b::id(name), vec![]))),
                            },
                        )],
                    ));
                    exports_members.push(b::setter(
                        alias,
                        "$$value",
                        vec![
                            b::stmt(b::call(b::id(name), vec![b::id("$$value")])),
                            b::stmt(b::call(b::member_path("$.flush"), vec![])),
                        ],
                    ));
                }
            }
        }

        // Add legacy API compatibility members
        // Reference: transform-client.js lines 338-356
        if options.compatibility.component_api == crate::compiler::ComponentApi::V4 {
            // $set: $.update_legacy_props
            exports_members.push(b::prop("$set", b::member_path("$.update_legacy_props")));
            // $on: ($$event_name, $$event_cb) => $.add_legacy_event_listener($$props, $$event_name, $$event_cb)
            exports_members.push(b::prop(
                "$on",
                b::arrow(
                    vec![
                        JsPattern::Identifier("$$event_name".into()),
                        JsPattern::Identifier("$$event_cb".into()),
                    ],
                    b::call(
                        b::member_path("$.add_legacy_event_listener"),
                        vec![b::id("$$props"), b::id("$$event_name"), b::id("$$event_cb")],
                    ),
                ),
            ));
        } else if options.dev {
            exports_members.push(b::spread(b::call(b::member_path("$.legacy_api"), vec![])));
        }

        if !exports_members.is_empty() {
            component_body.push(b::var_decl("$$exports", Some(b::object(exports_members))));
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

    // Add $$ownership_validator declaration if needed
    // Reference: transform-client.js lines 389-393
    // The official compiler uses unshift to put this at the start of the body,
    // after $.push (which is also unshifted later, so push ends up first)
    if context.state.needs_mutation_validation.get() {
        // var $$ownership_validator = $.create_ownership_validator($$props)
        let ownership_decl = b::var_decl(
            "$$ownership_validator",
            Some(b::call(
                b::member_path("$.create_ownership_validator"),
                vec![b::id("$$props")],
            )),
        );
        // Insert after $.push (position 0 is push when should_inject_context)
        // In the official compiler, this is unshifted before push is unshifted,
        // so it ends up right after push
        let insert_pos = if should_inject_context { 1 } else { 0 };
        component_body.insert(insert_pos, ownership_decl);
    }

    // Bind static exports to props so that people can access them with bind:x
    // Reference: transform-client.js lines 406-416
    // The official compiler uses build_getter() to apply transforms (e.g., $.get() for state vars)
    if !analysis.runes {
        for export in &analysis.exports {
            let alias = export.alias.as_deref().unwrap_or(&export.name);
            // Apply the read transform if one exists (e.g., $.get() for state variables)
            let getter_expr = if let Some(transform) = context.state.transform.get(&export.name) {
                if let Some(read_fn) = transform.read {
                    read_fn(JsExpr::Identifier(export.name.clone().into()))
                } else {
                    b::id(&export.name)
                }
            } else {
                b::id(&export.name)
            };
            component_body.push(b::stmt(b::call(
                b::member_path("$.bind_prop"),
                vec![b::id("$$props"), b::string(alias), getter_expr],
            )));
        }
    }

    // Add $.pop at the end if injecting context
    // Reference: transform-client.js lines 433-454
    if should_inject_context {
        if needs_exports {
            if needs_store_cleanup {
                // var $$pop = $.pop($$exports);
                component_body.push(b::var_decl(
                    "$$pop",
                    Some(b::call(b::member_path("$.pop"), vec![b::id("$$exports")])),
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
            JsPattern::Identifier("$$anchor".into()),
            JsPattern::Identifier("$$props".into()),
        ]
    } else {
        vec![JsPattern::Identifier("$$anchor".into())]
    };

    // Create component function declaration
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
    // Pre-allocate for typical program structure
    let mut body: Vec<JsStatement> = Vec::with_capacity(16);

    // Add componentApi: 4 import (must come first)
    // Reference: transform-client.js line 570
    if options.compatibility.component_api == crate::compiler::ComponentApi::V4 {
        body.push(JsStatement::Import(JsImportDeclaration {
            specifiers: vec![JsImportSpecifier::Named {
                imported: "createClassComponent".into(),
                local: "$$_createClassComponent".into(),
            }],
            source: "svelte/legacy".into(),
        }));
    }

    // Add disclose-version import (always first)
    body.push(JsStatement::Import(JsImportDeclaration {
        specifiers: vec![],
        source: "svelte/internal/disclose-version".into(),
    }));

    // Add feature flag imports
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

    if analysis.tracing {
        body.push(JsStatement::Import(JsImportDeclaration {
            specifiers: vec![],
            source: "svelte/internal/flags/tracing".into(),
        }));
    }

    // Add svelte/internal/client import (namespace import as $)
    body.push(JsStatement::Import(JsImportDeclaration {
        specifiers: vec![JsImportSpecifier::Namespace("$".into())],
        source: "svelte/internal/client".into(),
    }));

    // In dev mode, add ComponentName[$.FILENAME] = 'filename.svelte'
    // Reference: transform-client.js line 544-551
    if options.dev
        && let Some(ref filename) = options.filename
    {
        let fname = filename.replace('\\', "/");
        let relative_filename = if let Some(ref root_dir) = options.root_dir {
            let rd = root_dir.replace('\\', "/");
            if fname.starts_with(&rd) {
                fname[rd.len()..].trim_start_matches('/').to_string()
            } else {
                fname
            }
        } else {
            fname
        };
        body.push(b::stmt(b::assign(
            b::member_computed(b::id(&analysis.name), b::member(b::id("$"), "FILENAME")),
            b::string(relative_filename),
        )));
    }

    // Process module script content - extract imports separately from other content
    // This is needed because module_level_snippets must come after imports but before exports
    // Reference: transform-client.js line 513: body = [...imports, ...state.module_level_snippets, ...body];
    let module_script_non_imports: Option<String> = if let Some(ref module_content) =
        analysis.module_script_content
    {
        // Strip TypeScript syntax before processing
        let raw =
            crate::compiler::phases::phase2_analyze::types::strip_typescript(&module_content.raw);
        let (module_imports, rest) = extract_imports(&raw);
        // Add module script imports first
        for import_line in module_imports {
            body.push(JsStatement::Raw(import_line.trim().into()));
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
            body.push(JsStatement::Raw(import_line.trim().into()));
        }
    }

    // Add legacy reactive imports (after all imports, before other declarations)
    // Reference: transform-client.js line 211: module.body.unshift(...state.legacy_reactive_imports)
    body.extend(legacy_reactive_imports);

    // Add module-level snippets (after imports, before module script exports)
    // This ensures `const foo = ...` comes before `export { foo }`
    body.extend(module_level_snippets);

    // Add module script non-import content (exports, declarations, etc.)
    // This comes after module_level_snippets so that `export { foo }` can reference `const foo`
    // Transform class fields first (before rune transforms strip the rune names)
    // Then transform remaining rune calls ($state, $derived, etc.) in module-level script
    if let Some(non_imports) = module_script_non_imports {
        let class_transformed = transform_class_fields_client(&non_imports);
        let transformed = transform_module_script_runes(&class_transformed, analysis);
        body.push(JsStatement::Raw(transformed.into()));
    }

    // Add hoisted statements (template declarations, etc.)
    body.extend(hoisted_statements);

    // Add CSS declaration if needed
    if analysis.css.has_css && analysis.inject_styles {
        let hash = b::string(analysis.css.hash.clone());
        // Render the actual scoped CSS code
        let css_code = super::css::render_stylesheet(analysis, source, options)
            .map(|output| output.code)
            .unwrap_or_default();
        let code = b::string(css_code);
        body.push(b::const_decl(
            "$$css",
            b::object(vec![
                super::js_ast::nodes::JsObjectMember::Property(super::js_ast::nodes::JsProperty {
                    key: super::js_ast::nodes::JsPropertyKey::Identifier("hash".into()),
                    value: Box::new(hash),
                    kind: super::js_ast::nodes::JsPropertyKind::Init,
                    shorthand: false,
                    method: false,
                    computed: false,
                }),
                super::js_ast::nodes::JsObjectMember::Property(super::js_ast::nodes::JsProperty {
                    key: super::js_ast::nodes::JsPropertyKey::Identifier("code".into()),
                    value: Box::new(code),
                    kind: super::js_ast::nodes::JsPropertyKind::Init,
                    shorthand: false,
                    method: false,
                    computed: false,
                }),
            ]),
        ));
    }

    // Export default component function (with optional HMR wrapping)
    if options.hmr {
        // HMR mode: emit `function Component(...)` (not exported)
        body.push(JsStatement::FunctionDeclaration(component_fn));

        // Add HMR wrapping:
        //   if (import.meta.hot) {
        //     Component = $.hmr(Component);
        //     import.meta.hot.accept((module) => {
        //       Component[$.HMR].update(module.default);
        //     });
        //   }
        body.push(JsStatement::Raw(
            format!(
                "if (import.meta.hot) {{\n\t{} = $.hmr({});\n\n\timport.meta.hot.accept((module) => {{\n\t\t{}[$.HMR].update(module.default);\n\t}});\n}}",
                analysis.name, analysis.name, analysis.name
            ).into(),
        ));

        // export default Component;
        body.push(JsStatement::Raw(
            format!("export default {};", analysis.name).into(),
        ));
    } else {
        body.push(JsStatement::ExportDefault(JsExportDefault {
            declaration: JsExportDefaultDeclaration::Function(component_fn),
        }));
    }

    // Add event delegation if there are delegated events
    if !events.is_empty() {
        let event_literals: Vec<super::js_ast::nodes::JsExpr> =
            events.iter().map(|name| b::string(name.clone())).collect();
        body.push(b::stmt(b::call(
            b::member_path("$.delegate"),
            vec![b::array(event_literals)],
        )));
    }

    // Add customElements.define() for custom element components
    // Reference: transform-client.js lines 596-677
    if let Some(ref ce) = analysis.custom_element {
        // Build props config
        let props_str = b::object(vec![]); // TODO: populate from ce.props if needed

        // Build slots array
        let slots_str = b::array(
            analysis
                .slot_names
                .keys()
                .map(|name| b::string(name.clone()))
                .collect(),
        );

        // Build accessors array
        let accessors_str = b::array(
            analysis
                .exports
                .iter()
                .map(|e| b::string(e.alias.as_deref().unwrap_or(&e.name).to_string()))
                .collect(),
        );

        // Build shadow root init
        let shadow_mode = ce.shadow.as_deref().unwrap_or("open");
        let shadow_root_init = if shadow_mode == "none" {
            None
        } else {
            Some(b::object(vec![b::prop("mode", b::string(shadow_mode))]))
        };

        // $.create_custom_element(Component, props, slots, accessors, shadowRootInit)
        let mut create_ce_args = vec![b::id(&analysis.name), props_str, slots_str, accessors_str];
        if let Some(init) = shadow_root_init {
            create_ce_args.push(init);
        }
        let create_ce = b::call(b::member_path("$.create_custom_element"), create_ce_args);

        // If tag name is provided, call customElements.define
        if let Some(ref tag) = ce.tag {
            body.push(b::stmt(b::call(
                b::member_path("customElements.define"),
                vec![b::string(tag.clone()), create_ce],
            )));
        } else {
            body.push(b::stmt(create_ce));
        }
    }

    // Create the program
    let program = JsProgram { body };

    // Generate JavaScript code from the program with source map data
    generate_with_sourcemap(&program, source).map_err(TransformError::CodeGen)
}

// ============================================================================
// Script Transformation Functions
// ============================================================================

/// Extract import statements from script content.
/// Returns (imports, rest_of_script).
///
/// Handles multi-line imports like:
/// ```js
/// import {
///   foo,
///   bar,
/// } from './module';
/// ```
pub(crate) fn extract_imports(script: &str) -> (Vec<String>, String) {
    let mut imports = Vec::new();
    let mut rest = Vec::new();
    let mut current_import: Option<Vec<String>> = None;

    for line in script.lines() {
        if let Some(ref mut import_lines) = current_import {
            // We're inside a multi-line import, accumulate lines
            import_lines.push(line.to_string());
            // Check if the import statement is complete (has a semicolon or closing quote/backtick followed by end)
            let trimmed = line.trim();
            if trimmed.contains(';')
                || trimmed.ends_with('\'')
                || trimmed.ends_with('"')
                || trimmed.ends_with('`')
            {
                imports.push(import_lines.join("\n"));
                current_import = None;
            }
        } else {
            let trimmed = line.trim();
            if trimmed.starts_with("import ") || trimmed.starts_with("import{") {
                // Check if this import is complete on one line
                if trimmed.contains(';')
                    || (trimmed.contains(" from ")
                        && (trimmed.ends_with('\'')
                            || trimmed.ends_with('"')
                            || trimmed.ends_with('`')))
                {
                    imports.push(line.to_string());
                } else {
                    // Multi-line import starts here
                    current_import = Some(vec![line.to_string()]);
                }
            } else {
                rest.push(line.to_string());
            }
        }
    }

    // If we ended inside an import (shouldn't happen with valid code), add remaining as import
    if let Some(import_lines) = current_import {
        imports.push(import_lines.join("\n"));
    }

    (imports, rest.join("\n"))
}

/// Extract variable names from top-level (non-nested) declarations that are NOT
/// $state()/$derived()/$state.raw() calls. This helps detect cases where a name
/// has a regular declaration at the top level but is shadowed by a $state() declaration
/// inside a nested function. The text-based transform can't distinguish scopes, so
/// such names should NOT be wrapped with $.get().
///
/// For example:
/// ```js
/// function createArray(initial) { let array = $state(initial); ... }
/// const array = createArray(['x']); // top-level, NOT $state
/// ```
/// Returns {"array"} because `array` has a non-$state top-level declaration.
/// Detect variable names that have BOTH:
/// 1. A top-level (non-nested) declaration WITHOUT $state/$derived
/// 2. An inner-scope (nested) declaration WITH $state/$derived
///
/// These names indicate a shadowing issue where the text-based transform
/// would incorrectly apply $.get()/$.set() to the outer variable.
///
/// For example:
/// ```js
/// function createArray(initial) { let array = $state(initial); ... }
/// const array = createArray(['x']); // top-level, NOT $state
/// ```
/// Returns {"array"} because `array` has shadowing between inner $state and outer non-$state.
fn extract_shadowed_state_names(script: &str) -> std::collections::HashSet<String> {
    let mut top_level_non_state: std::collections::HashSet<String> =
        std::collections::HashSet::new();
    let mut inner_state: std::collections::HashSet<String> = std::collections::HashSet::new();
    let mut brace_depth: i32 = 0;

    for line in script.lines() {
        let trimmed = line.trim();

        // Check if this line is at the top level BEFORE counting braces in this line
        let line_starts_at_top = brace_depth == 0;

        // Track brace depth (simple heuristic - doesn't handle strings/comments)
        for ch in trimmed.chars() {
            match ch {
                '{' => brace_depth += 1,
                '}' => brace_depth -= 1,
                _ => {}
            }
        }

        // Check if this is a let/const/var declaration
        let has_decl = trimmed.starts_with("let ")
            || trimmed.starts_with("const ")
            || trimmed.starts_with("var ");

        if !has_decl {
            continue;
        }

        let has_rune = trimmed.contains("$state(")
            || trimmed.contains("$state.raw(")
            || trimmed.contains("$state.frozen(")
            || trimmed.contains("$derived(")
            || trimmed.contains("$derived.by(");

        // Extract variable name from: let/const/var name = expr
        let after_keyword = if let Some(rest) = trimmed.strip_prefix("let ") {
            rest
        } else if let Some(rest) = trimmed.strip_prefix("const ") {
            rest
        } else if let Some(rest) = trimmed.strip_prefix("var ") {
            rest
        } else {
            trimmed
        };

        let before_eq = if let Some(eq_pos) = after_keyword.find('=') {
            &after_keyword[..eq_pos]
        } else if let Some(semi_pos) = after_keyword.find(';') {
            &after_keyword[..semi_pos]
        } else {
            after_keyword
        };

        let var_name: String = before_eq
            .trim()
            .chars()
            .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$')
            .collect();

        if var_name.is_empty() {
            continue;
        }

        if line_starts_at_top && !has_rune {
            top_level_non_state.insert(var_name);
        } else if !line_starts_at_top && has_rune {
            inner_state.insert(var_name);
        }
    }

    // Return the intersection: names that appear in BOTH sets
    top_level_non_state
        .intersection(&inner_state)
        .cloned()
        .collect()
}

/// Extract local reactive variable names from script content.
/// These are variables declared with $state() or $derived() inside functions
/// (like inside $effect callbacks) that aren't tracked in analysis.root.bindings.
/// Returns Vec of (name, is_const, is_state) where is_state=true for $state vars,
/// false for $derived vars.
fn extract_local_reactive_vars(script: &str) -> Vec<(String, bool, bool)> {
    let mut vars = Vec::new();

    // Pattern: (let|const|var) varname = $state(...) or (let|const|var) varname = $derived(...)
    // Uses cached regex for performance
    // Group 1 = declaration keyword, Group 2 = variable name
    for cap in REGEX_STATE_DERIVED_VAR.captures_iter(script) {
        if let Some(name) = cap.get(2) {
            // Determine which rune was matched ($state or $derived)
            let full_match = cap.get(0).unwrap().as_str();
            let is_state = full_match.contains("$state");
            let rune_name = if is_state { "$state" } else { "$derived" };

            // Check if this match is inside a function that has the rune name as a parameter.
            // If so, the rune name is shadowed and this isn't a real rune declaration.
            let match_pos = cap.get(0).unwrap().start();
            if is_inside_function_with_param(script, match_pos, rune_name) {
                continue;
            }

            let decl_keyword = cap.get(1).map(|m| m.as_str()).unwrap_or("let");
            let is_const = decl_keyword == "const";
            vars.push((name.as_str().to_string(), is_const, is_state));
        }
    }

    vars
}

/// Check if a position in the script is inside a function body where `param_name` is a parameter.
/// This handles cases like `function bar($derived, $effect) { const x = $derived(foo + 1); }`
/// where `$derived` inside the function body is a function parameter, not a rune.
fn is_inside_function_with_param(script: &str, pos: usize, param_name: &str) -> bool {
    // Scan backwards from `pos` to find enclosing function declarations.
    // Track brace depth to determine which function we're inside.
    let bytes = script.as_bytes();

    // Find all function declarations with their opening brace positions
    let mut search_from = 0;
    while search_from < pos {
        // Find "function " or "function("
        let func_keyword = "function";
        if let Some(func_pos) = script[search_from..].find(func_keyword) {
            let abs_func_pos = search_from + func_pos;
            if abs_func_pos >= pos {
                break;
            }

            // Find the parameter list opening paren
            let after_keyword = &script[abs_func_pos + func_keyword.len()..];
            if let Some(paren_offset) = after_keyword.find('(') {
                let abs_paren_pos = abs_func_pos + func_keyword.len() + paren_offset;

                // Find closing paren of parameters
                if let Some(close_paren_len) = find_matching_paren(&script[abs_paren_pos + 1..]) {
                    let params_str =
                        &script[abs_paren_pos + 1..abs_paren_pos + 1 + close_paren_len];

                    // Check if param_name is one of the parameters
                    let has_param = params_str.split(',').any(|p| {
                        let trimmed = p.trim();
                        let name = trimmed.split('=').next().unwrap_or(trimmed).trim();
                        name == param_name
                    });

                    if has_param {
                        // Find the opening brace of the function body
                        let after_params = abs_paren_pos + 1 + close_paren_len + 1;
                        if let Some(brace_offset) = script[after_params..].find('{') {
                            let abs_brace_pos = after_params + brace_offset;

                            // Check if `pos` is inside this function body
                            // by counting brace depth from the opening brace
                            if abs_brace_pos < pos {
                                let mut depth = 1;
                                let mut i = abs_brace_pos + 1;
                                while i < bytes.len() && depth > 0 {
                                    if bytes[i] == b'{' {
                                        depth += 1;
                                    } else if bytes[i] == b'}' {
                                        depth -= 1;
                                    }
                                    if depth > 0 {
                                        i += 1;
                                    }
                                }
                                // i now points to the closing brace (or end of string)
                                if pos > abs_brace_pos && pos < i {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }

            search_from = abs_func_pos + func_keyword.len();
        } else {
            break;
        }
    }

    false
}

/// Extract variable names that are initialized with $state() containing an object or array.
/// These variables will be transformed to $.proxy() and should NOT have $.get() wrapping
/// when accessing their properties.
fn extract_proxy_vars(script: &str) -> Vec<String> {
    let mut proxy_vars = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();

        // Look for patterns like: let/const/var varname = $state({ ... }) or $state([ ... ])
        if let Some(state_pos) = trimmed.find("$state(") {
            // Check if this is a declaration
            if trimmed.starts_with("let ")
                || trimmed.starts_with("const ")
                || trimmed.starts_with("var ")
            {
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
/// Module-level $state() and $derived() variables get the same $.state(), $.get(), $.set()
/// transforms as instance-level variables. The official Svelte compiler AST-walks the module
/// script with the same visitors as the instance script, applying transforms to all scopes.
///
/// The key distinction: if a module-level $state() variable is NOT reassigned (is_state_source
/// returns false), it only gets $.proxy() wrapping (no $.state()), and reads don't need $.get().
pub(crate) fn transform_module_script_runes(script: &str, analysis: &ComponentAnalysis) -> String {
    let mut result = script.to_string();

    // Extract local reactive variable names from the module script
    // These are variables declared with $state() or $derived() inside functions
    let module_state_vars_with_const = extract_local_reactive_vars(script);
    let module_state_vars: Vec<String> = module_state_vars_with_const
        .iter()
        .map(|(name, _, _)| name.clone())
        .collect();

    // Extract non-reactive module state vars: $state() variables that are NOT reassigned.
    // In runes mode (immutable=true), non-reassigned $state vars don't need $.state() or $.get().
    // They only get $.proxy() for objects/arrays. This mirrors the instance-level is_state_source logic.
    let mut module_non_reactive_vars: Vec<String> = if analysis.immutable {
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| {
                // Module-level bindings are at scope 0
                b.scope_index == 0
                    && matches!(b.kind, BindingKind::State | BindingKind::RawState)
                    && !b.reassigned
                    && !analysis.accessors
            })
            .map(|b| b.name.clone())
            .collect()
    } else {
        Vec::new()
    };

    // Also include `const` $state variables from any scope as non-reactive.
    // `const` variables can never be reassigned, so they don't need $.state()/$.get() wrapping.
    // This is especially important for module files where $state is used inside functions.
    // NOTE: Only $state vars (is_state=true) qualify. $derived vars always need $.get() wrapping.
    if analysis.immutable {
        for (name, is_const, is_state) in &module_state_vars_with_const {
            if *is_const && *is_state && !module_non_reactive_vars.contains(name) {
                module_non_reactive_vars.push(name.clone());
            }
        }
    }

    // Extract module proxy vars for non-reactive vars
    let module_proxy_vars = extract_proxy_vars(script);

    // Reactive module state vars = those that need $.get()/$.set()
    // (i.e. all module state vars except non-reactive ones)
    let reactive_module_state_vars: Vec<String> = module_state_vars
        .iter()
        .filter(|v| !module_non_reactive_vars.contains(v))
        .cloned()
        .collect();

    // Transform $state.snapshot(x) to $.snapshot(x)
    // Module scripts don't need dev-mode handling for state_snapshot_uncloneable
    if result.contains("$state.snapshot(") {
        result = result.replace("$state.snapshot(", "$.snapshot(");
    }

    // Transform $state.raw(x) / $state.frozen(x).
    // Like $state(), whether we wrap in $.state() depends on whether the variable
    // is reassigned.  $state.raw/$state.frozen never use $.proxy(), just the raw value
    // when non-reactive, or $.state(value) when reassigned.
    for rune_call in &["$state.raw(", "$state.frozen("] {
        while let Some(pos) = result.find(rune_call) {
            let call_start = pos + rune_call.len(); // position after opening paren
            if let Some(content_end) = find_matching_paren(&result[call_start..]) {
                let content = result[call_start..call_start + content_end].to_string();
                let trimmed_content = content.trim();

                // Extract variable name
                let var_name = {
                    let before = &result[..pos];
                    let mut name = String::new();
                    if before.contains("let ")
                        || before.contains("const ")
                        || before.contains("var ")
                    {
                        let decl_pattern = if before.contains("let ") {
                            "let "
                        } else if before.contains("const ") {
                            "const "
                        } else {
                            "var "
                        };
                        if let Some(decl_pos) = before.rfind(decl_pattern) {
                            let after_keyword = &before[decl_pos + decl_pattern.len()..];
                            let before_eq = if let Some(eq_pos) = after_keyword.find('=') {
                                &after_keyword[..eq_pos]
                            } else {
                                after_keyword
                            };
                            name = before_eq
                                .trim()
                                .chars()
                                .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$')
                                .collect::<String>();
                        }
                    }
                    name
                };

                let is_non_reactive = module_non_reactive_vars.contains(&var_name);
                let value = if trimmed_content.is_empty() {
                    "void 0".to_string()
                } else {
                    content.clone()
                };

                if is_non_reactive {
                    // Non-reassigned: just use the raw value, no $.state() wrapper
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        value,
                        &result[call_start + content_end + 1..]
                    );
                } else {
                    // Reassigned: wrap in $.state()
                    result = format!(
                        "{}$.state({}){}",
                        &result[..pos],
                        value,
                        &result[call_start + content_end + 1..]
                    );
                }
            } else {
                break;
            }
        }
    }

    // Transform $state(x) - handling both reassigned and non-reassigned cases.
    // Non-reassigned vars get $.proxy() only, reassigned vars get $.state($.proxy()).
    while let Some(pos) = result.find("$state(") {
        // Make sure this is not $state.something
        if pos + 7 < result.len() && result.as_bytes()[pos + 6] != b'(' {
            break;
        }

        // Extract variable name for this declaration
        let var_name = {
            let before_state = &result[..pos];
            let mut name = String::new();
            if before_state.contains("let ")
                || before_state.contains("const ")
                || before_state.contains("var ")
            {
                let decl_pattern = if before_state.contains("let ") {
                    "let "
                } else if before_state.contains("const ") {
                    "const "
                } else {
                    "var "
                };
                if let Some(decl_pos) = before_state.rfind(decl_pattern) {
                    let after_keyword = &before_state[decl_pos + decl_pattern.len()..];
                    let before_eq = if let Some(eq_pos) = after_keyword.find('=') {
                        &after_keyword[..eq_pos]
                    } else {
                        after_keyword
                    };
                    name = before_eq
                        .trim()
                        .chars()
                        .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$')
                        .collect::<String>();
                }
            }
            name
        };

        let is_non_reactive = module_non_reactive_vars.contains(&var_name);

        let state_start = pos + 7; // after "$state("
        if let Some(content_end) = find_matching_paren(&result[state_start..]) {
            let content = result[state_start..state_start + content_end].to_string();
            let trimmed_content = content.trim();
            let is_object_or_array =
                trimmed_content.starts_with('{') || trimmed_content.starts_with('[');
            let needs_proxy = is_object_or_array || expression_needs_proxy(trimmed_content);

            // Collapse multi-line content to a single line if it would fit
            // (matching esrap's behavior of keeping objects on one line when <= 60 chars)
            let collapsed_content = collapse_to_single_line(&content);

            if is_non_reactive {
                // Non-reassigned: no $.state() wrapper needed
                if needs_proxy {
                    result = format!(
                        "{}$.proxy({}){}",
                        &result[..pos],
                        collapsed_content,
                        &result[state_start + content_end + 1..]
                    );
                } else if trimmed_content.is_empty() {
                    let extracted_value = "void 0";
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        extracted_value,
                        &result[state_start + content_end + 1..]
                    );
                } else {
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        collapsed_content,
                        &result[state_start + content_end + 1..]
                    );
                }
            } else if needs_proxy {
                // Reassigned: objects/arrays need $.state($.proxy(...))
                result = format!(
                    "{}$.state($.proxy({})){}",
                    &result[..pos],
                    collapsed_content,
                    &result[state_start + content_end + 1..]
                );
            } else if trimmed_content.is_empty() {
                // Empty $state() -> $.state(void 0)
                result = format!(
                    "{}$.state(void 0){}",
                    &result[..pos],
                    &result[state_start + content_end + 1..]
                );
            } else {
                // Primitives - $.state(value)
                result = format!(
                    "{}$.state({}){}",
                    &result[..pos],
                    collapsed_content,
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

    // Transform $derived() to $.derived(() => expr) or $.async_derived() for async
    // Need to wrap state variable references inside the expression with $.get()
    while let Some(pos) = result.find("$derived(") {
        if result[..pos].ends_with('$') {
            // Already transformed to $.derived() - skip
            break;
        }
        let derived_start = pos + 9; // after "$derived("
        if let Some(content_end) = find_matching_paren(&result[derived_start..]) {
            let content = &result[derived_start..derived_start + content_end];
            // Wrap state variables inside the expression with $.get()
            let wrapped_content = wrap_state_vars_in_expr(
                content,
                &reactive_module_state_vars,
                &module_non_reactive_vars,
                &module_proxy_vars,
            );
            let trimmed_content = content.trim();
            let contains_await = contains_direct_await_in_expression(trimmed_content);

            if contains_await {
                // For async derived in module scripts: await $.async_derived(async () => expr)
                // Apply $.save() wrapping for non-final await expressions.
                // Module-level $derived may be inside nested functions where $.save() is needed.
                let saved_content = wrap_await_with_save_in_async_derived(wrapped_content.trim());
                let inner_expr = strip_top_level_await_from_expr(&saved_content);
                let inner_has_nested_await = contains_direct_await_in_expression(&inner_expr);

                let new_derived = if inner_has_nested_await {
                    let is_object = saved_content.trim().starts_with('{');
                    if is_object {
                        format!("await $.async_derived(async () => ({}))", saved_content)
                    } else {
                        format!("await $.async_derived(async () => {})", saved_content)
                    }
                } else {
                    let inner_trimmed = inner_expr.trim();
                    let inner_is_object = inner_trimmed.starts_with('{');
                    if inner_is_object {
                        format!("await $.async_derived(() => ({}))", inner_expr)
                    } else {
                        let thunk_arg = unthunk_string(&inner_expr);
                        format!("await $.async_derived({})", thunk_arg)
                    }
                };
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    new_derived,
                    &result[derived_start + content_end + 1..]
                );
            } else {
                result = format!(
                    "{}$.derived(() => {}){}",
                    &result[..pos],
                    wrapped_content,
                    &result[derived_start + content_end + 1..]
                );
            }
        } else {
            break;
        }
    }

    // Apply $.set() for assignments and $.get() for reads of state variables
    // This handles references to $state/$derived variables throughout the module script.
    //
    // We process line by line for assignment transforms because the global
    // `transform_state_assignments` function has a guard that skips ALL assignments
    // if any declaration (let/const/var) for the variable exists in the text.
    // In module scripts, declarations and assignments coexist, so we need to
    // process non-declaration lines separately.
    if !reactive_module_state_vars.is_empty() {
        let empty_raw: Vec<String> = Vec::new();

        // Process line by line for assignment transforms
        let lines: Vec<&str> = result.lines().collect();
        let mut transformed_lines: Vec<String> = Vec::with_capacity(lines.len());
        for line in &lines {
            let trimmed = line.trim();
            // Skip declaration lines - they've already been transformed
            let is_declaration = reactive_module_state_vars.iter().any(|var| {
                trimmed.contains(&format!("let {} = ", var))
                    || trimmed.contains(&format!("const {} = ", var))
                    || trimmed.contains(&format!("var {} = ", var))
            });
            if is_declaration {
                transformed_lines.push(line.to_string());
            } else {
                let transformed = transform_state_assignments(
                    line,
                    &reactive_module_state_vars,
                    &module_non_reactive_vars,
                    &module_proxy_vars,
                    &empty_raw,
                    analysis.runes,
                    &[],
                );
                transformed_lines.push(transformed);
            }
        }
        result = transformed_lines.join("\n");

        // Wrap state variable reads in $.get() (only for reactive vars, not non-reactive)
        result = wrap_state_vars_in_expr(
            &result,
            &reactive_module_state_vars,
            &module_non_reactive_vars,
            &module_proxy_vars,
        );
    }

    // Transform $effect.root(), $effect.pre(), $effect.tracking(), $effect()
    // These rune calls can appear in module scripts (e.g., inside class constructors)
    result = apply_effect_rune_transforms(result);

    result
}

/// Transform destructured array assignments where the LHS contains state variables.
///
/// Converts `[a, b] = expr;` where `a` or `b` are reactive state variables into:
/// ```js
/// ((array) => {
///     var $$array = $.to_array(array, 2);
///     $.set(a, $$array[0], true);
///     $.set(b, $$array[1], true);
/// })(expr);
/// ```
///
/// Non-state variables in the pattern are assigned normally: `c = $$array[N];`
fn transform_destructured_state_assignments(
    script: &str,
    reactive_state_vars: &[String],
) -> String {
    if reactive_state_vars.is_empty() {
        return script.to_string();
    }

    let mut result = String::new();
    for line in script.lines() {
        let trimmed = line.trim();
        // Look for lines like `[a, b] = expr;` or `[a, b] = expr`
        if trimmed.starts_with('[') {
            // Find the matching `]`
            let mut depth = 0;
            let mut bracket_end = None;
            for (i, c) in trimmed.char_indices() {
                match c {
                    '[' => depth += 1,
                    ']' => {
                        depth -= 1;
                        if depth == 0 {
                            bracket_end = Some(i);
                            break;
                        }
                    }
                    _ => {}
                }
            }
            if let Some(bracket_end) = bracket_end {
                let pattern = &trimmed[..bracket_end + 1]; // e.g., "[a, b]"
                let after_pattern = trimmed[bracket_end + 1..].trim();
                // Must be followed by `= expr` or `= expr;`
                if let Some(rhs) = after_pattern.strip_prefix('=') {
                    let rhs = rhs.trim().trim_end_matches(';').trim();
                    let inner = &pattern[1..pattern.len() - 1]; // strip [ ]
                    let parts: Vec<&str> = inner.split(',').map(|s| s.trim()).collect();
                    // Check if any parts are reactive state vars
                    let has_state_var = parts
                        .iter()
                        .any(|p| reactive_state_vars.iter().any(|v| v == p));
                    if has_state_var {
                        // Build the IIFE
                        let indent: String =
                            line.chars().take_while(|c| c.is_whitespace()).collect();
                        let inner_indent = format!("{}\t", indent);
                        let n = parts.len();
                        let mut body_lines = Vec::new();
                        body_lines.push(format!(
                            "{}var $$array = $.to_array(array, {});",
                            inner_indent, n
                        ));
                        body_lines.push(String::new()); // blank line after var
                        for (idx, part) in parts.iter().enumerate() {
                            if reactive_state_vars.iter().any(|v| v == *part) {
                                body_lines.push(format!(
                                    "{}$.set({}, $$array[{}], true);",
                                    inner_indent, part, idx
                                ));
                            } else {
                                body_lines
                                    .push(format!("{}{} = $$array[{}];", inner_indent, part, idx));
                            }
                        }
                        result.push_str(&format!(
                            "{}((array) => {{\n{}\n{}}})({});\n",
                            indent,
                            body_lines.join("\n"),
                            indent,
                            rhs
                        ));
                        // Add blank line after the IIFE
                        result.push('\n');
                        continue;
                    }
                }
            }
        }
        result.push_str(line);
        result.push('\n');
    }
    // Remove trailing newline to match original
    if result.ends_with('\n') && !script.ends_with('\n') {
        result.pop();
    }
    result
}

/// Transform instance script content for the visitor-based code generation.
/// Handles $state, $derived, $effect, $props transformations.
fn transform_instance_script_for_visitors(
    script: &str,
    analysis: &ComponentAnalysis,
    dev: bool,
    reactive_import_names: &[String],
) -> String {
    if script.is_empty() {
        return String::new();
    }

    // Reset the $$array counters for this component
    // This ensures unique names across multiple $derived destructuring patterns
    DERIVED_ARRAY_COUNTER.with(|c| c.set(0));
    ARRAY_LOOKUP_COUNTER.with(|c| c.set(0));
    // Reset the tmp counter for $state destructuring
    STATE_TMP_COUNTER.with(|c| c.set(0));
    // Reset the destructure assignment array counter
    DESTRUCTURE_ARRAY_COUNTER.with(|c| c.set(0));

    // The official Svelte compiler (via esrap) preserves comments in output.
    // However, our text-based store transforms can break when comments contain
    // braces/parens (e.g., `$value = { ... } // { ... }`). So we only strip
    // comments in legacy mode (non-runes) where store transforms are applied.
    // In runes mode, comments are safe to preserve since rune transforms don't
    // match across comment boundaries.
    let script = if analysis.runes {
        script.to_string()
    } else {
        strip_js_single_line_comments(script)
    };

    // First, transform class fields with $state and $derived
    let script = transform_class_fields_client(&script);

    // Extract imports from script (they will be hoisted separately)
    let (_script_imports, script_rest) = extract_imports(&script);

    // Collect state variables from analysis for $.get() wrapping
    // LegacyReactive bindings (from `$: x = expr`) also need $.get()/$.set() transforms
    //
    // Collect state variables from analysis bindings.
    // NOTE: Due to a known analysis issue where inner-scope $state() declarations can
    // overwrite the BindingKind of same-named outer-scope bindings (via scope conflation),
    // some bindings here may be incorrectly marked as State. For the text-based script
    // transform this is actually OK - the inner function's $state variable references DO
    // need $.get()/$.set() wrapping, and outer-scope declaration LHS references are
    // automatically skipped by transform_state_in_expr. The AST-based template transform
    // is corrected separately (see transform_client_with_visitors where shadowed names
    // are removed from context.state.transform).
    // Use the root scope's declarations map to determine which names are reactive.
    // The declarations map uses or_insert during scope merging, so outer-scope bindings
    // take precedence over inner ones with the same name. This prevents cases like:
    //   const multiplier = () => { let multiplier = $state(2); ... }
    // from incorrectly wrapping the outer `multiplier` with $.get().
    let mut state_vars: Vec<String> = analysis
        .root
        .scope
        .declarations
        .iter()
        .filter_map(|(name, &binding_idx)| {
            if let Some(b) = analysis.root.bindings.get(binding_idx)
                && matches!(
                    b.kind,
                    BindingKind::State
                        | BindingKind::RawState
                        | BindingKind::Derived
                        | BindingKind::LegacyReactive
                )
            {
                return Some(name.clone());
            }
            None
        })
        .collect();

    // Ensure reactive import names are included in state_vars for $.get()/$.mutate() wrapping.
    // The post-processing step will convert these to $$_import_X() patterns.
    // This is needed because not all reactive import bindings are promoted to State
    // (e.g., imports that are only mutated but not referenced in template/$: declarations).
    for name in reactive_import_names {
        if !state_vars.contains(name) {
            state_vars.push(name.clone());
        }
    }

    // Collect var-declared state/derived vars that need $.safe_get() instead of $.get()
    // var declarations are hoisted, so they can be read before initialization.
    // $.safe_get() handles this by returning undefined if the value is not yet initialized.
    // Reference: declarations.js line 26:
    //   binding.declaration_kind === 'var' ? (node) => b.call('$.safe_get', node) : get_value
    let var_state_vars: Vec<String> = analysis
        .root
        .scope
        .declarations
        .iter()
        .filter_map(|(name, &binding_idx)| {
            if let Some(b) = analysis.root.bindings.get(binding_idx)
                && b.declaration_kind
                    == crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Var
                && matches!(
                    b.kind,
                    BindingKind::State
                        | BindingKind::RawState
                        | BindingKind::Derived
                        | BindingKind::LegacyReactive
                )
            {
                return Some(name.clone());
            }
            None
        })
        .collect();

    // Set the thread-local so transform_state_in_expr can use $.safe_get() for var-declared vars
    VAR_STATE_VARS.with(|v| {
        *v.borrow_mut() = var_state_vars;
    });

    // Also scan for local $state and $derived declarations in the script
    // These are variables declared inside functions (like inside $effect callbacks)
    // that aren't tracked in analysis.root.bindings.
    // However, skip names that already exist as top-level bindings, since those
    // top-level bindings take precedence for scope-level transforms. For example,
    // if there's a top-level `const multiplier = () => { let multiplier = $state(2); ... }`,
    // the inner `multiplier` should NOT cause the outer `multiplier` to be wrapped with $.get().
    let local_reactive_vars = extract_local_reactive_vars(&script_rest);
    let top_level_binding_names: std::collections::HashSet<&str> = analysis
        .root
        .bindings
        .iter()
        .map(|b| b.name.as_str())
        .collect();
    let mut shadowed_local_reactive_vars: Vec<String> = Vec::new();
    for (var, is_const, is_state) in &local_reactive_vars {
        // Check if this is a non-reactive const $state in runes mode
        // $derived vars are never non-reactive (they always need $.get())
        let is_non_reactive = if analysis.immutable && *is_const && *is_state {
            let state_pattern = format!("const {}", var);
            script_rest.contains(&format!("{} = $state(", state_pattern))
                || script_rest.contains(&format!("{} = $state.raw(", state_pattern))
                || script_rest.contains(&format!("{} = $state.frozen(", state_pattern))
        } else {
            false
        };
        if is_non_reactive {
            continue;
        }
        if !top_level_binding_names.contains(var.as_str()) {
            state_vars.push(var.clone());
        } else {
            // This local reactive var shadows a top-level binding.
            // It can't be added to the global state_vars (would incorrectly wrap
            // top-level references), so we'll handle it via scope-aware post-processing.
            shadowed_local_reactive_vars.push(var.clone());
        }
    }

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
    // Non-reactive state variables: $state() and $state.raw() bindings that are NOT
    // reassigned.  These don't need $.state() wrapping or $.get()/$.set() transforms.
    //
    // This matches the official Svelte compiler's is_state_source logic:
    // (binding.kind === 'state' || binding.kind === 'raw_state') &&
    // (!analysis.immutable || binding.reassigned || analysis.accessors)
    // When immutable=true (runes mode) and the binding is NOT reassigned,
    // is_state_source returns false, meaning no $.state() and no transforms.
    let mut non_reactive_state_vars: Vec<String> = if analysis.immutable {
        analysis
            .root
            .scope
            .declarations
            .iter()
            .filter_map(|(name, &binding_idx)| {
                if let Some(b) = analysis.root.bindings.get(binding_idx)
                    && matches!(b.kind, BindingKind::State | BindingKind::RawState)
                    && !b.reassigned
                    && !analysis.accessors
                {
                    return Some(name.clone());
                }
                None
            })
            .collect()
    } else {
        Vec::new()
    };

    // Also add local const $state() vars to non_reactive_state_vars in runes mode
    // These are variables declared inside function bodies (like derived callbacks)
    // that are const and thus never reassigned.
    // Note: We do NOT filter by top_level_binding_names here because the variable name
    // may shadow a top-level binding (e.g., `const value = $state(0)` inside a derived callback
    // where the outer `value` is also a binding). The non_reactive list is used for $state()
    // unwrapping which operates on the local scope.
    if analysis.immutable {
        for (var, is_const, is_state) in &local_reactive_vars {
            // Only $state vars can be non-reactive; $derived always needs $.get()
            if *is_const && *is_state {
                let state_pattern = format!("const {}", var);
                let is_state_decl = script_rest.contains(&format!("{} = $state(", state_pattern))
                    || script_rest.contains(&format!("{} = $state.raw(", state_pattern))
                    || script_rest.contains(&format!("{} = $state.frozen(", state_pattern));
                if is_state_decl && !non_reactive_state_vars.contains(var) {
                    non_reactive_state_vars.push(var.clone());
                }
            }
        }
    }

    // Collect $state.raw() variables - these never need proxy wrapping
    let raw_state_vars: Vec<String> = analysis
        .root
        .scope
        .declarations
        .iter()
        .filter_map(|(name, &binding_idx)| {
            if let Some(b) = analysis.root.bindings.get(binding_idx)
                && matches!(b.kind, BindingKind::RawState)
            {
                return Some(name.clone());
            }
            None
        })
        .collect();

    // Collect store subscription variable names ($count, $store, etc.)
    let store_sub_vars: Vec<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| matches!(b.kind, BindingKind::StoreSub))
        .map(|b| b.name.clone())
        .collect();

    // Collect ALL import binding names in the instance scope.
    // These are needed for legacy_pre_effect dependency tracking: the official compiler
    // includes import bindings as bare identifiers in the dependency list when they
    // appear in reactive statement bodies.
    // Reference: LabeledStatement.js line 37 - `if (binding.kind === 'normal' && binding.declaration_kind !== 'import') continue;`
    let import_names: Vec<String> = if !analysis.runes {
        let instance_scope_index = analysis.root.instance_scope_index;
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| {
                b.declaration_kind == DeclarationKind::Import
                    && b.scope_index == instance_scope_index
            })
            .map(|b| b.name.clone())
            .collect()
    } else {
        Vec::new()
    };

    // Check for legacy mode (export let or export { x })
    // Also detect `export { x }` patterns which create BindableProp bindings
    let has_legacy_export_let = script_rest.lines().any(|line| {
        let trimmed = line.trim();
        trimmed.starts_with("export let ") || trimmed.starts_with("export let\t")
    }) || analysis
        .root
        .bindings
        .iter()
        .any(|b| matches!(b.kind, BindingKind::BindableProp));

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
    let read_only_props: Vec<(String, String)> = if analysis.runes {
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
            .map(|b| {
                let prop_name = b.prop_alias.as_deref().unwrap_or(&b.name).to_string();
                (b.name.clone(), prop_name)
            })
            .collect()
    } else {
        Vec::new()
    };

    // Collect legacy state variables (in non-runes mode, State bindings are promoted
    // from Normal bindings that are updated and referenced in template)
    // These need $.mutable_source() wrapping
    // Exclude reactive import bindings - they use $.reactive_import() not $.mutable_source()
    let legacy_state_vars: Vec<(String, Option<String>, DeclarationKind)> = if !analysis.runes {
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| {
                matches!(b.kind, BindingKind::State) && !reactive_import_names.contains(&b.name)
            })
            .map(|b| (b.name.clone(), b.initial.clone(), b.declaration_kind))
            .collect()
    } else {
        Vec::new()
    };

    // Collect prop variable info for ownership mutation validation (dev mode only).
    // Maps prop variable name to its prop alias (the public prop name).
    let prop_mutation_vars: Vec<(String, String)> = if dev && analysis.runes {
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp))
            .map(|b| {
                let alias = b.prop_alias.as_deref().unwrap_or(&b.name).to_string();
                (b.name.clone(), alias)
            })
            .collect()
    } else {
        Vec::new()
    };

    let mut result = String::new();

    // Collect reactive statements to append at end (mirroring official compiler behavior
    // which appends all $: reactive statements AFTER the rest of instance body code).
    // Each entry is (assigned_vars, dependency_vars, transformed_code).
    // After collection, these are topologically sorted by dependencies before emission.
    let mut pending_reactive_statements: Vec<(Vec<String>, Vec<String>, String)> = Vec::new();

    // Track if we're inside a multi-line export block
    let mut in_export_block = false;

    // Accumulator for multi-line statements
    let mut accumulated_lines: Vec<String> = Vec::new();

    // Helper closure to process accumulated lines as a complete statement
    #[allow(clippy::too_many_arguments)]
    let process_accumulated = |accumulated: &[String],
                               result: &mut String,
                               pending_reactive: &mut Vec<(Vec<String>, Vec<String>, String)>,
                               state_vars: &[String],
                               non_reactive_state_vars: &[String],
                               proxy_vars: &[String],
                               raw_state_vars: &[String],
                               store_sub_vars: &[String],
                               prop_source_vars: &[String],
                               prop_assignment_transform_vars: &[String],
                               exported_names: &[String],
                               rest_prop_vars: &[String],
                               read_only_props: &[(String, String)],
                               legacy_state_vars: &[(
        String,
        Option<String>,
        DeclarationKind,
    )],
                               import_names: &[String],
                               analysis: &ComponentAnalysis,
                               dev: bool,
                               has_legacy_export_let: bool| {
        if accumulated.is_empty() {
            return;
        }

        // Compute variables whose initial values are known primitives (non-proxyable).
        // This mirrors the official Svelte compiler's should_proxy() which resolves
        // identifiers to their binding's initial values.
        let non_proxy_vars: Vec<String> = analysis
            .root
            .bindings
            .iter()
            .filter(|b| {
                !b.reassigned
                    && b.initial.is_some()
                    && !matches!(
                        b.kind,
                        BindingKind::State
                            | BindingKind::RawState
                            | BindingKind::Derived
                            | BindingKind::Prop
                            | BindingKind::BindableProp
                            | BindingKind::StoreSub
                    )
            })
            .map(|b| b.name.clone())
            .collect();

        // Join all accumulated lines into a single statement
        let statement = accumulated.join("\n");
        let first_line_trimmed = accumulated[0].trim();

        // Handle $: reactive statements in legacy (non-runes) mode
        // Transform `$: c = a + b;` to `$.legacy_pre_effect(() => (...deps), () => { c(a() + b()); })`
        if !analysis.runes && first_line_trimmed.starts_with("$:") {
            // Extract assignment targets and dependencies from the raw statement
            // for topological sorting (matching official compiler's order_reactive_statements)
            let (assigned_vars, dep_vars) = extract_reactive_statement_deps(
                &statement,
                state_vars,
                prop_assignment_transform_vars,
                store_sub_vars,
            );

            let transformed = transform_reactive_statement(
                &statement,
                state_vars,
                non_reactive_state_vars,
                proxy_vars,
                prop_assignment_transform_vars,
                store_sub_vars,
                import_names,
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
                &non_proxy_vars,
            );
            // Collect reactive statements to append at end (matching official compiler behavior
            // which appends all reactive statements after the rest of instance body code)
            let mut reactive_code = transformed;
            reactive_code.push('\n');
            pending_reactive.push((assigned_vars, dep_vars, reactive_code));
            return;
        }

        // Handle legacy export let declarations
        if has_legacy_export_let && first_line_trimmed.starts_with("export let ") {
            // Check if this is a destructured export let pattern
            let after_export_let = first_line_trimmed[11..].trim();
            if after_export_let.starts_with('{') || after_export_let.starts_with('[') {
                // Destructured export let: flatten using extract_paths pattern
                if let Some(flattened) = transform_destructured_export_let(&statement, analysis) {
                    let flattened = wrap_state_vars_in_expr(
                        &flattened,
                        state_vars,
                        non_reactive_state_vars,
                        proxy_vars,
                    );
                    result.push_str(&flattened);
                    result.push('\n');
                    return;
                }
            }
            // Use the full statement for multi-line export declarations
            let transformed = transform_export_let(&statement, analysis);
            // After converting to $.prop(), apply prop read wrapping to the DEFAULT VALUE
            // inside $.prop() calls. wrap_prop_source_reads skips lines containing $.prop(),
            // so we need to apply it only to the interior of the default value expression.
            // This handles cases like: export let click_1 = () => { logs.push('click_1'); }
            // where `logs` is a prop and should become `logs()` inside the default value.
            let transformed = if !prop_assignment_transform_vars.is_empty() {
                apply_prop_reads_in_prop_default_values(
                    &transformed,
                    prop_assignment_transform_vars,
                )
            } else {
                transformed
            };
            // Apply state variable assignment transforms ($.set) to the full export let statement.
            // This handles cases where state variables are assigned inside nested callbacks
            // within the default value expression, e.g.:
            //   export let promise = new Promise((resolve) => { setTimeout(() => { answer = 42; }, 0); })
            // The `answer = 42` inside the callback needs to become `$.set(answer, 42)`.
            let transformed = transform_state_assignments(
                &transformed,
                state_vars,
                non_reactive_state_vars,
                proxy_vars,
                raw_state_vars,
                analysis.runes,
                &non_proxy_vars,
            );
            // Also wrap state variable reads in $.get() within the export let statement.
            let transformed = wrap_state_vars_in_expr(
                &transformed,
                state_vars,
                non_reactive_state_vars,
                proxy_vars,
            );
            result.push_str(&transformed);
            result.push('\n');
            return;
        }

        // Strip `export { ... }` specifier statements entirely.
        // In client-side compilation, exports are exposed via the $$exports object,
        // not ES module export syntax. `export { a, b as c }` statements are only
        // used by the analysis phase to mark bindings as BindableProp/exports.
        // The actual declarations (let a, let b) remain and get transformed to $.prop() calls.
        if first_line_trimmed.starts_with("export {") {
            return;
        }

        // Handle `let` declarations that contain variables exported via `export { ... }`.
        // When we have `let a, b, c, d;` and `export { a, c }`, the variables `a` and `c`
        // are marked as BindableProp and need to become `$.prop()` calls.
        // We need to split the multi-declarator `let` statement and transform each declarator.
        if !analysis.runes && has_legacy_export_let && first_line_trimmed.starts_with("let ") {
            // Check if any of the declarators are BindableProp
            if let Some(transformed) = transform_let_with_reexported_props(&statement, analysis) {
                result.push_str(&transformed);
                result.push('\n');
                return;
            }
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
        let mut transformed = transform_client_runes_with_skip_and_state(
            &statement,
            non_reactive_state_vars,
            state_vars,
            non_reactive_state_vars,
            prop_source_vars,
            exported_names,
            proxy_vars,
            dev,
            analysis,
            store_sub_vars,
            read_only_props,
        );

        // In dev mode, if the previous output line has a svelte-ignore state_snapshot_uncloneable
        // comment, add `true` as second argument to $.snapshot() calls to suppress warning
        if dev && transformed.contains("$.snapshot(") {
            let prev_has_ignore = {
                let mut found = false;
                for line in result.lines().rev() {
                    let trimmed = line.trim();
                    if trimmed.is_empty() {
                        continue;
                    }
                    if trimmed.contains("svelte-ignore")
                        && trimmed.contains("state_snapshot_uncloneable")
                    {
                        found = true;
                    }
                    break;
                }
                found
            };
            if prev_has_ignore {
                let mut new_transformed = String::new();
                let mut remaining = transformed.as_str();
                while let Some(pos) = remaining.find("$.snapshot(") {
                    new_transformed.push_str(&remaining[..pos]);
                    let call_start = pos + "$.snapshot(".len();
                    if let Some(content_end) = find_matching_paren(&remaining[call_start..]) {
                        let content = &remaining[call_start..call_start + content_end];
                        new_transformed.push_str(&format!("$.snapshot({}, true)", content));
                        remaining = &remaining[call_start + content_end + 1..];
                    } else {
                        new_transformed.push_str("$.snapshot(");
                        remaining = &remaining[call_start..];
                    }
                }
                new_transformed.push_str(remaining);
                transformed = new_transformed;
            }
        }

        // Skip empty transformations (e.g., read-only $props() with no defaults)
        // In async mode, emit a placeholder so that async_body.rs generates
        // an empty thunk `() => {}` matching the official compiler
        if transformed.trim().is_empty() {
            if analysis.experimental_async {
                // Extract variable names from the original statement for hoisting
                // e.g., "const { name } = $props()" -> "name"
                let orig = accumulated.join("\n");
                let vars = extract_destructured_prop_names(&orig);
                if vars.is_empty() {
                    result.push_str("/* $$async_noop */;\n");
                } else {
                    result.push_str(&format!("/* $$async_noop:{} */;\n", vars.join(",")));
                }
            }
            return;
        }

        // Transform destructure assignments targeting reactive variables into IIFE patterns.
        // This must run BEFORE transform_state_assignments and transform_member_mutations
        // because it decomposes destructure patterns into individual assignments that those
        // transforms can then process.
        // Corresponds to visit_assignment_expression in shared/assignments.js.
        let transformed =
            transform_destructure_assignments(&transformed, state_vars, store_sub_vars);

        // Transform state variable assignments to $.set()
        let transformed = transform_state_assignments(
            &transformed,
            state_vars,
            non_reactive_state_vars,
            proxy_vars,
            raw_state_vars,
            analysis.runes,
            &non_proxy_vars,
        );

        // Wrap $.set() calls with $.store_unsub() for state variables that have
        // corresponding store subscriptions. This must run right after
        // transform_state_assignments so the $.set() calls are already generated.
        let transformed = wrap_store_unsub_for_state_sets(&transformed, state_vars, store_sub_vars);

        // Transform member mutations to $.mutate() calls (only in legacy/non-runes mode).
        // This handles patterns like `obj.self = obj` → `$.mutate(obj, obj.self = obj)`.
        // Must run AFTER transform_state_assignments (which handles direct assignments like `x = v`)
        // and BEFORE wrap_state_vars_in_expr (which will apply $.get() inside the $.mutate()).
        let transformed = if !analysis.runes && !state_vars.is_empty() {
            transform_member_mutations(
                &transformed,
                state_vars,
                non_reactive_state_vars,
                raw_state_vars,
            )
        } else {
            transformed
        };

        // Transform prop update expressions like `x++` to `$.update_prop(x)` FIRST,
        // before transform_prop_assignments runs (which would incorrectly turn `x++` into `x(x() + 1)`)
        // and before wrap_prop_source_reads (which would turn `count` → `count()`, causing `count()++`)
        let transformed = if !prop_assignment_transform_vars.is_empty() {
            transform_prop_update_expressions(&transformed, prop_assignment_transform_vars)
        } else {
            transformed
        };

        // Transform prop source variable reads to prop() calls BEFORE prop assignments.
        // This handles props used as function calls: `callback(args)` → `callback()(args)`.
        // Must come BEFORE transform_prop_assignments so that `callback = value` (assignment)
        // doesn't get incorrectly double-wrapped as `callback()(value)`.
        // The is_assignment_target check in wrap_prop_source_reads correctly skips assignments.
        let transformed = if !prop_assignment_transform_vars.is_empty() {
            wrap_prop_source_reads(&transformed, prop_assignment_transform_vars)
        } else {
            transformed
        };

        // Transform prop assignments to prop(prop() + value) syntax
        // This handles props declared with `export let` in legacy mode
        // Note: We use prop_assignment_transform_vars which excludes RestProp bindings
        // because rest_props use $.rest_props() which returns a plain object, not getter/setter
        let transformed = transform_prop_assignments(&transformed, prop_assignment_transform_vars);

        // Filter out store_sub_vars that appear as function parameters in this statement.
        // Function parameters like `function bar($derived, $effect)` shadow the store
        // subscription within the function body, so we must NOT transform those.
        let effective_store_sub_vars: Vec<String> = if store_sub_vars
            .iter()
            .any(|s| transformed.contains(s.as_str()))
        {
            store_sub_vars
                .iter()
                .filter(|s| !is_function_parameter_in_statement(&transformed, s))
                .cloned()
                .collect()
        } else {
            store_sub_vars.to_vec()
        };

        // Transform store subscription assignments to $.store_set()
        let transformed = transform_store_assignments_client(
            &transformed,
            &effective_store_sub_vars,
            prop_assignment_transform_vars,
            state_vars,
            non_reactive_state_vars,
        );

        // Pre-transform store sub names that are used as function calls with arguments.
        // This handles cases like `$state(0)` -> `$state()(0)` where $state is a store sub
        // (not a rune) and the parens contain arguments. We need to insert the getter call
        // `()` before the argument parens.
        // This must happen BEFORE transform_store_reads_client, which will then see
        // `$state()` and skip adding another `()` (due to is_already_call check).
        let transformed = transform_store_sub_calls(&transformed, &effective_store_sub_vars);

        // Transform store subscription reads to $store()
        // e.g., `const answer = $foo` -> `const answer = $foo()`
        let transformed = transform_store_reads_client(&transformed, &effective_store_sub_vars);

        // Expand legacy destructuring declarations with state variables into tmp-based
        // individual declarations BEFORE mutable_source wrapping.
        // e.g., `let { foo, bar } = expr` -> `let tmp = expr, foo = $.mutable_source(tmp.foo), bar = tmp.bar`
        // Reference: create_state_declarators in VariableDeclaration.js
        let transformed = if !analysis.runes && !legacy_state_vars.is_empty() {
            let state_var_names: Vec<String> = legacy_state_vars
                .iter()
                .map(|(name, _, _)| name.clone())
                .collect();
            transform_legacy_destructure_declarations(
                &transformed,
                &state_var_names,
                analysis.immutable,
            )
        } else {
            transformed
        };

        // Transform legacy state declarations to $.mutable_source() BEFORE wrapping reads.
        // This must come before wrap_state_vars_in_expr because multi-variable declarations
        // like `let a, b;` have secondary declarators (b) that are NOT preceded by `let `,
        // causing wrap_state_vars_in_expr to incorrectly wrap them as `$.get(b)`.
        // By transforming declarations first, `let a, b;` becomes:
        //   `let a = $.mutable_source();\nlet b = $.mutable_source();`
        // and then wrap_state_vars_in_expr correctly skips them since each starts with `let `.
        let transformed = if !analysis.runes && !legacy_state_vars.is_empty() {
            transform_legacy_state_declarations(&transformed, legacy_state_vars, analysis.immutable)
        } else {
            transformed
        };

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

        // Wrap prop member expression mutations with $$ownership_validator.mutation()
        // Reference: validate_mutation() in shared/utils.js
        let transformed = if !prop_mutation_vars.is_empty() {
            wrap_prop_mutation_validation(&transformed, &prop_mutation_vars, &analysis.source)
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
            && (trimmed.starts_with("let ")
                || trimmed.starts_with("const ")
                || trimmed.starts_with("var "))
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
                    &mut pending_reactive_statements,
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
                    &import_names,
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
            &mut pending_reactive_statements,
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
            &import_names,
            analysis,
            dev,
            has_legacy_export_let,
        );
    }

    // Append reactive statements at the end, mirroring the official Svelte compiler which
    // appends all $: reactive statements AFTER the rest of the instance body code.
    // See: svelte/packages/svelte/src/compiler/phases/3-transform/client/transform-client.js
    // which does: `for (const [node] of analysis.reactive_statements) { instance.body.push(...) }`
    //
    // The official compiler topologically sorts reactive statements in Phase 2
    // (order_reactive_statements in 2-analyze/index.js) and then iterates them
    // in that sorted order. We perform the topological sort here at emission time.
    if !pending_reactive_statements.is_empty() {
        let sorted = sort_reactive_statements(pending_reactive_statements);
        for (_, _, reactive_stmt) in &sorted {
            result.push_str(reactive_stmt);
        }
    }

    // Post-processing: transform shadowed local reactive vars within their enclosing function bodies.
    if !shadowed_local_reactive_vars.is_empty() {
        result = transform_shadowed_local_state_vars(&result, &shadowed_local_reactive_vars);
    }

    result
}

/// Transform shadowed local reactive variables within their enclosing function bodies.
///
/// When a `$state()` or `$derived()` variable inside a nested function has the same name
/// as a top-level binding, the global text-based transform cannot handle it. This function
/// finds each function body containing such a declaration and applies `$.get()`, `$.set()`,
/// `$.update()` transforms only within that scope.
fn transform_shadowed_local_state_vars(script: &str, shadowed_vars: &[String]) -> String {
    let mut result = script.to_string();

    for var in shadowed_vars {
        // Find `let VAR = $.state(` or `let VAR = $.derived(` patterns
        // in the already-transformed output
        let state_patterns = [
            format!("let {} = $.state(", var),
            format!("let {} = $.derived(", var),
            format!("var {} = $.state(", var),
            format!("var {} = $.derived(", var),
            format!("const {} = $.state(", var),
            format!("const {} = $.derived(", var),
            format!("let {} = $.state.raw(", var),
            format!("let {} = $.derived.by(", var),
            format!("var {} = $.state.raw(", var),
            format!("var {} = $.derived.by(", var),
            format!("const {} = $.state.raw(", var),
            format!("const {} = $.derived.by(", var),
        ];

        for pattern in &state_patterns {
            if let Some(decl_pos) = result.find(pattern.as_str()) {
                // Find the enclosing function body
                if let Some((func_start, func_end)) =
                    find_enclosing_function_body(&result, decl_pos)
                {
                    let func_body = &result[func_start..func_end];
                    let is_state = pattern.contains("$.state(") || pattern.contains("$.state.raw(");
                    let transformed_body = apply_local_state_transforms(func_body, var, is_state);

                    if transformed_body != func_body {
                        result = format!(
                            "{}{}{}",
                            &result[..func_start],
                            transformed_body,
                            &result[func_end..]
                        );
                    }
                }
            }
        }
    }

    result
}

/// Find the enclosing function body (from `{` to matching `}`) that contains `pos`.
fn find_enclosing_function_body(script: &str, pos: usize) -> Option<(usize, usize)> {
    let bytes = script.as_bytes();

    // Scan backwards from pos to find the opening `{` of the enclosing function
    let mut brace_depth = 0i32;
    let mut func_open = None;
    let mut i = pos;
    while i > 0 {
        i -= 1;
        match bytes[i] {
            b'}' => brace_depth += 1,
            b'{' => {
                if brace_depth == 0 {
                    func_open = Some(i);
                    break;
                }
                brace_depth -= 1;
            }
            _ => {}
        }
    }
    let func_start = func_open?;

    // Find the matching closing `}` by scanning forward
    let mut brace_depth = 0i32;
    let mut func_end = None;
    for (j, &byte) in bytes.iter().enumerate().take(script.len()).skip(func_start) {
        match byte {
            b'{' => brace_depth += 1,
            b'}' => {
                brace_depth -= 1;
                if brace_depth == 0 {
                    func_end = Some(j + 1);
                    break;
                }
            }
            _ => {}
        }
    }
    Some((func_start, func_end?))
}

/// Apply `$.get()`, `$.set()`, `$.update()` transforms for a variable within a function body.
fn apply_local_state_transforms(func_body: &str, var_name: &str, is_state: bool) -> String {
    let mut result = func_body.to_string();

    // Apply $.get() wrapping for reads using the existing transform function
    result = transform_state_in_expr(&result, &[var_name.to_string()], &[], &[]);

    // Apply $.update() for `var++`, `var--`, `++var`, `--var` patterns
    // These must be applied BEFORE $.set() transforms since `x++` should become `$.update(x)`
    // not `$.set(x, $.get(x)++, true)`
    let update_patterns = [
        (format!("{}++", var_name), format!("$.update({})", var_name)),
        (
            format!("{}--", var_name),
            format!("$.update({}, -1)", var_name),
        ),
        (format!("++{}", var_name), format!("$.update({})", var_name)),
        (
            format!("--{}", var_name),
            format!("$.update({}, -1)", var_name),
        ),
    ];

    for (from, to) in &update_patterns {
        result = replace_standalone_pattern(&result, from, to);
    }

    // Apply $.set() for direct assignments (only for $state, not $derived)
    if is_state {
        result = apply_local_set_transforms(&result, var_name);
    }

    result
}

/// Replace a pattern only when it appears as a standalone expression.
fn replace_standalone_pattern(text: &str, from: &str, to: &str) -> String {
    let mut result = String::new();
    let mut search_from = 0;

    while let Some(pos) = text[search_from..].find(from) {
        let abs_pos = search_from + pos;
        let before_ok = abs_pos == 0 || {
            let b = text.as_bytes()[abs_pos - 1];
            !b.is_ascii_alphanumeric() && b != b'_' && b != b'$' && b != b'.'
        };
        let after_pos = abs_pos + from.len();
        let after_ok = after_pos >= text.len() || {
            let b = text.as_bytes()[after_pos];
            !b.is_ascii_alphanumeric() && b != b'_'
        };

        if before_ok && after_ok {
            result.push_str(&text[search_from..abs_pos]);
            result.push_str(to);
            search_from = after_pos;
        } else {
            result.push_str(&text[search_from..abs_pos + 1]);
            search_from = abs_pos + 1;
        }
    }
    result.push_str(&text[search_from..]);
    result
}

/// Apply `$.set(var, expr, true)` transforms for assignment expressions within a function body.
fn apply_local_set_transforms(func_body: &str, var_name: &str) -> String {
    let mut lines: Vec<String> = Vec::new();

    for line in func_body.lines() {
        let trimmed = line.trim();

        // Skip declaration lines
        if trimmed.contains(&format!("let {} = $.state(", var_name))
            || trimmed.contains(&format!("var {} = $.state(", var_name))
            || trimmed.contains(&format!("let {} = $.derived(", var_name))
            || trimmed.contains(&format!("var {} = $.derived(", var_name))
        {
            lines.push(line.to_string());
            continue;
        }

        let transformed = transform_local_assignment(line, var_name);
        lines.push(transformed);
    }

    lines.join("\n")
}

/// Transform `varName = expr` to `$.set(varName, expr, true)` in a line.
fn transform_local_assignment(line: &str, var_name: &str) -> String {
    let assignment_pattern = format!("{} = ", var_name);

    // Skip if already transformed
    if line.contains(&format!("$.set({},", var_name))
        || line.contains(&format!("$.set({} ,", var_name))
    {
        return line.to_string();
    }

    if let Some(pos) = line.find(&assignment_pattern) {
        let before_ok = pos == 0 || {
            let b = line.as_bytes()[pos - 1];
            !b.is_ascii_alphanumeric() && b != b'_' && b != b'$' && b != b'.'
        };
        let after_name_pos = pos + var_name.len();
        let is_direct_assign =
            after_name_pos < line.len() && line.as_bytes()[after_name_pos] == b' ';

        if before_ok && is_direct_assign {
            let rhs_start = pos + assignment_pattern.len();
            let rhs = line[rhs_start..].trim_end_matches([';', ',']);
            let trailing = &line[rhs_start + rhs.len()..];
            let prefix = &line[..pos];
            return format!(
                "{}$.set({}, {}, true){}",
                prefix,
                var_name,
                rhs.trim(),
                trailing
            );
        }
    }

    line.to_string()
}

// ============================================================================
// Rune Transformation Functions
// ============================================================================

/// Find the position of `$state(` in the string, but skip occurrences that are
/// already transformed (i.e., preceded by `.` as in `$.state(`).
fn find_unescaped_state_call(s: &str) -> Option<usize> {
    let mut search_from = 0;
    while let Some(pos) = s[search_from..].find("$state(") {
        let abs_pos = search_from + pos;
        if abs_pos > 0 && s.as_bytes()[abs_pos - 1] == b'.' {
            search_from = abs_pos + 7;
            continue;
        }
        return Some(abs_pos);
    }
    None
}

/// Find the position of `$derived.by(` in the string, skipping already-transformed occurrences.
fn find_unescaped_derived_by_call(s: &str) -> Option<usize> {
    let mut search_from = 0;
    while let Some(pos) = s[search_from..].find("$derived.by(") {
        let abs_pos = search_from + pos;
        if abs_pos > 0 && s.as_bytes()[abs_pos - 1] == b'.' {
            search_from = abs_pos + 12;
            continue;
        }
        return Some(abs_pos);
    }
    None
}

/// Find the position of `$derived(` in the string, skipping already-transformed occurrences.
fn find_unescaped_derived_call(s: &str) -> Option<usize> {
    let mut search_from = 0;
    while let Some(pos) = s[search_from..].find("$derived(") {
        let abs_pos = search_from + pos;
        if abs_pos > 0 && s.as_bytes()[abs_pos - 1] == b'.' {
            search_from = abs_pos + 9;
            continue;
        }
        if s[abs_pos..].starts_with("$derived.by(") {
            search_from = abs_pos + 12;
            continue;
        }
        return Some(abs_pos);
    }
    None
}

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
    store_sub_vars: &[String],
    read_only_props: &[(String, String)],
) -> String {
    let mut result = line.to_string();

    // Check which rune names are actually store subscriptions.
    // When $state or $effect is imported from a store (not a real rune),
    // we must NOT transform $state(x) to $.state(x) or $effect(x) to $.user_effect(x).
    let state_is_store_sub = store_sub_vars.contains(&"$state".to_string());
    let effect_is_store_sub = store_sub_vars.contains(&"$effect".to_string());
    let derived_is_store_sub = store_sub_vars.contains(&"$derived".to_string());

    // Also check if rune names appear as function parameters in this statement.
    // When a function declares `function bar($derived, $effect)`, those names shadow
    // the runes within the function body, so rune transforms should be skipped.
    // Note: This applies to the entire statement because the statement is the whole
    // function body including the parameter list.
    let state_is_func_param = is_function_parameter_in_statement(line, "$state");
    let effect_is_func_param = is_function_parameter_in_statement(line, "$effect");
    let derived_is_func_param = is_function_parameter_in_statement(line, "$derived");

    // Skip all $state rune transforms if $state is actually a store subscription or function param
    if !state_is_store_sub && !state_is_func_param {
        // Handle destructuring patterns with $state/$state.raw BEFORE other $state transforms.
        // e.g. `let { num } = $state(setup())` -> `let tmp = setup(), num = $.state($.proxy(tmp.num))`
        if let Some(state_pos) = result
            .find("$state(")
            .or_else(|| result.find("$state.raw("))
        {
            let before_state = &result[..state_pos];
            if (before_state.contains("let ")
                || before_state.contains("const ")
                || before_state.contains("var "))
                && (before_state.contains('{') || before_state.contains('['))
            {
                let is_raw = result[state_pos..].starts_with("$state.raw(");
                if let Some(transformed) = transform_state_destructuring(
                    &result,
                    is_raw,
                    skip_state_vars,
                    state_vars,
                    non_reactive_vars,
                    proxy_vars,
                ) {
                    return apply_effect_rune_transforms(transformed);
                }
            }
        }

        // Transform $state.snapshot(x) to $.snapshot(x)
        // In dev mode, if preceded by svelte-ignore state_snapshot_uncloneable comment,
        // add `true` as second argument to suppress runtime warning
        if result.contains("$state.snapshot(") {
            result = result.replace("$state.snapshot(", "$.snapshot(");
        }

        // Transform $state.raw(x) / $state.frozen(x).
        // Like $state(), whether we wrap in $.state() depends on whether the
        // variable is reassigned (is_state_source logic).
        for rune_call in &["$state.raw(", "$state.frozen("] {
            while let Some(pos) = result.find(rune_call) {
                let call_start = pos + rune_call.len();
                if let Some(content_end) = find_matching_paren(&result[call_start..]) {
                    let content = result[call_start..call_start + content_end].to_string();
                    let trimmed_content = content.trim();

                    // Extract variable name
                    let var_name = {
                        let before = &result[..pos];
                        let mut name = String::new();
                        if before.contains("let ")
                            || before.contains("const ")
                            || before.contains("var ")
                        {
                            let decl_pattern = if before.contains("let ") {
                                "let "
                            } else if before.contains("const ") {
                                "const "
                            } else {
                                "var "
                            };
                            if let Some(decl_pos) = before.rfind(decl_pattern) {
                                let after_keyword = &before[decl_pos + decl_pattern.len()..];
                                let before_eq = if let Some(eq_pos) = after_keyword.find('=') {
                                    &after_keyword[..eq_pos]
                                } else {
                                    after_keyword
                                };
                                name = before_eq
                                    .trim()
                                    .chars()
                                    .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$')
                                    .collect::<String>();
                            }
                        }
                        name
                    };

                    let is_non_reactive = non_reactive_vars.contains(&var_name);
                    let value = if trimmed_content.is_empty() {
                        "void 0".to_string()
                    } else {
                        content.clone()
                    };

                    if is_non_reactive {
                        // Non-reassigned: just use the raw value
                        result = format!(
                            "{}{}{}",
                            &result[..pos],
                            value,
                            &result[call_start + content_end + 1..]
                        );
                    } else {
                        // Reassigned: wrap in $.state()
                        result = format!(
                            "{}$.state({}){}",
                            &result[..pos],
                            value,
                            &result[call_start + content_end + 1..]
                        );
                    }
                } else {
                    break;
                }
            }
        }

        // Transform $state(x) to $.state(x) for primitives or $.proxy(x) for objects
        // Loop to handle multiple $state() calls in a single statement
        // (e.g., inside a function body with multiple state declarations)
        while let Some(pos) = find_unescaped_state_call(&result) {
            // Check if this is a declaration
            if !(result[..pos].contains("let ")
                || result[..pos].contains("const ")
                || result[..pos].contains("var "))
            {
                break;
            }

            // Extract variable name by finding identifier after let/const/var keyword
            let decl_pattern = if result[..pos].contains("let ") {
                // Find the closest declaration keyword before this $state call
                let let_pos = result[..pos].rfind("let ");
                let const_pos = result[..pos].rfind("const ");
                let var_pos = result[..pos].rfind("var ");
                let max_pos = [let_pos, const_pos, var_pos]
                    .iter()
                    .filter_map(|p| *p)
                    .max();
                if max_pos == let_pos {
                    "let "
                } else if max_pos == const_pos {
                    "const "
                } else {
                    "var "
                }
            } else if result[..pos].contains("const ") {
                let const_pos = result[..pos].rfind("const ");
                let var_pos = result[..pos].rfind("var ");
                if var_pos.is_some() && var_pos > const_pos {
                    "var "
                } else {
                    "const "
                }
            } else {
                "var "
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
                let content = result[state_start..state_start + content_end].to_string();
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
                            "void 0".to_string()
                        } else if trimmed_content == "undefined" {
                            // Explicit undefined should also become void 0
                            "void 0".to_string()
                        } else {
                            content.to_string()
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
                    result = format!(
                        "{}$.state({}){}",
                        &result[..pos],
                        content,
                        &result[state_start + content_end + 1..]
                    );
                }
            } else {
                // Fallback for unparseable content
                result = format!("{}$.state({}", &result[..pos], &result[pos + 7..]);
                break;
            }
        }
    } // end if !state_is_store_sub

    // Skip all $derived rune transforms if $derived is actually a store subscription or function param
    if !derived_is_store_sub && !derived_is_func_param {
        // Transform $derived.by() to $.derived() - must be processed BEFORE $derived()
        // $derived.by() already has a callback, so pass it directly
        // But we need to wrap state variable references inside the callback with $.get()
        // Loop to handle multiple $derived.by() calls in a single statement
        while let Some(pos) = find_unescaped_derived_by_call(&result) {
            // Check if this is a destructuring pattern: let { a, b } = $derived.by(expr)
            let before_derived_by = result[..pos].trim();
            let has_destructuring_by = (before_derived_by.contains("let ")
                || before_derived_by.contains("const ")
                || before_derived_by.contains("var "))
                && (before_derived_by.contains('{') || before_derived_by.contains('['));

            if has_destructuring_by {
                // Handle destructuring pattern for $derived.by()
                // $derived.by() always creates a $$d temp (unlike $derived(identifier) which skips it)
                if let Some(transformed) = transform_derived_by_destructuring(
                    &result,
                    state_vars,
                    non_reactive_vars,
                    proxy_vars,
                ) {
                    return apply_effect_rune_transforms(transformed);
                }
            }

            let derived_start = pos + 12; // after "$derived.by("
            if let Some(content_end) = find_matching_paren(&result[derived_start..]) {
                let content = &result[derived_start..derived_start + content_end];

                // Extract local const $state() declarations from the callback body.
                // In runes mode, const $state() vars are non-reactive (never reassigned),
                // so they should not be wrapped with $.get() inside the callback.
                let local_callback_vars = extract_local_reactive_vars(content);
                let mut effective_non_reactive = non_reactive_vars.to_vec();
                if analysis.runes {
                    for (var, is_const, is_state) in &local_callback_vars {
                        // Only $state vars can be non-reactive; $derived always needs $.get()
                        if *is_const && *is_state {
                            let state_check = format!("const {} = $state(", var);
                            let raw_check = format!("const {} = $state.raw(", var);
                            if (content.contains(&state_check) || content.contains(&raw_check))
                                && !effective_non_reactive.contains(var)
                            {
                                effective_non_reactive.push(var.clone());
                            }
                        }
                    }
                }

                // Wrap state variables inside the callback with $.get()
                let wrapped_content = wrap_state_vars_in_expr(
                    content,
                    state_vars,
                    &effective_non_reactive,
                    proxy_vars,
                );
                let new_derived = format!("$.derived({})", wrapped_content);
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    new_derived,
                    &result[derived_start + content_end + 1..]
                );
            } else {
                result = format!("{}$.derived({}", &result[..pos], &result[pos + 12..]);
                break;
            }
        }

        // Transform $derived(x) to $.derived(() => x) or $.async_derived() for async
        // Handle destructuring patterns specially
        // Loop to handle multiple $derived() calls in a single statement
        // (e.g., inside a function body with multiple derived declarations)
        while let Some(pos) = find_unescaped_derived_call(&result) {
            if !(result[..pos].contains("let ")
                || result[..pos].contains("const ")
                || result[..pos].contains("var "))
            {
                break;
            }

            // Check if this is a destructuring pattern
            let before_derived = result[..pos].trim();
            let has_destructuring = before_derived.contains('{') || before_derived.contains('[');

            if has_destructuring {
                // Handle destructuring pattern for $derived
                if let Some(transformed) = transform_derived_destructuring(
                    &result,
                    state_vars,
                    non_reactive_vars,
                    proxy_vars,
                ) {
                    return apply_effect_rune_transforms(transformed);
                }
            }

            // Find the content inside $derived(...)
            let derived_start = pos + 9; // after "$derived("
            if let Some(content_end) = find_matching_paren(&result[derived_start..]) {
                let content = &result[derived_start..derived_start + content_end];
                // Wrap in arrow function if not already a function
                let trimmed_content = content.trim();
                if !trimmed_content.starts_with("()") && !trimmed_content.starts_with("function") {
                    // Check if the derived expression contains await (async derived)
                    // Note: We need to check for await NOT inside an inner async function
                    let contains_direct_await =
                        contains_direct_await_in_expression(trimmed_content);

                    // Wrap state variables inside the derived expression with $.get()
                    let wrapped_content =
                        wrap_state_vars_in_expr(content, state_vars, non_reactive_vars, proxy_vars);

                    // Check if the content is an object literal - if so, wrap in parentheses
                    // to disambiguate from a block statement
                    let wrapped_trimmed = wrapped_content.trim();
                    let is_object_literal = wrapped_trimmed.starts_with('{');

                    let new_derived = if contains_direct_await {
                        // For async derived in instance script:
                        // Strip the top-level `await` and check if there are remaining awaits.
                        // No $.save wrapping (that's only for nested contexts).
                        let inner_expr = strip_top_level_await_from_expr(wrapped_trimmed);
                        let inner_has_nested_await =
                            contains_direct_await_in_expression(&inner_expr);

                        if inner_has_nested_await {
                            // Still has await after stripping → use async thunk
                            let is_obj = wrapped_trimmed.starts_with('{');
                            if is_obj {
                                format!("await $.async_derived(async () => ({}))", wrapped_trimmed)
                            } else {
                                format!("await $.async_derived(async () => {})", wrapped_trimmed)
                            }
                        } else {
                            // No more await → use sync thunk
                            let inner_trimmed = inner_expr.trim();
                            let inner_is_object = inner_trimmed.starts_with('{');
                            if inner_is_object {
                                format!("await $.async_derived(() => ({}))", inner_expr)
                            } else {
                                let thunk_arg = unthunk_string(&inner_expr);
                                format!("await $.async_derived({})", thunk_arg)
                            }
                        }
                    } else if is_object_literal {
                        format!("$.derived(() => ({}))", wrapped_content)
                    } else {
                        // Check if the content is a store subscription variable (e.g., $store1).
                        // Store subs are already getter functions, so they can be passed directly
                        // to $.derived() without wrapping: $.derived($store1) instead of
                        // $.derived(() => $store1())
                        let trimmed_wrapped = wrapped_content.trim();
                        if store_sub_vars.contains(&trimmed_wrapped.to_string()) {
                            format!("$.derived({})", trimmed_wrapped)
                        } else {
                            // Apply unthunk optimization: $.derived(() => name()) -> $.derived(name)
                            // This matches the official compiler's b.thunk() + unthunk() behavior
                            let derived_arg = unthunk_string(&wrapped_content);
                            format!("$.derived({})", derived_arg)
                        }
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
                    if trimmed_content.starts_with("async ") {
                        // Wrap: $.derived(() => async () => {...})
                        let wrapped_content = wrap_state_vars_in_expr(
                            content,
                            state_vars,
                            non_reactive_vars,
                            proxy_vars,
                        );
                        let new_derived = format!("$.derived(() => {})", wrapped_content);
                        result = format!(
                            "{}{}{}",
                            &result[..pos],
                            new_derived,
                            &result[derived_start + content_end + 1..]
                        );
                    } else {
                        result = format!("{}$.derived({}", &result[..pos], &result[pos + 9..]);
                    }
                }
            } else {
                result = format!("{}$.derived({}", &result[..pos], &result[pos + 9..]);
                break;
            }
        }
    } // end if !derived_is_store_sub

    // Transform $state.eager(x) to $.eager(() => x) - thunk wrapping
    if !state_is_store_sub
        && !state_is_func_param
        && let Some(pos) = result.find("$state.eager(")
    {
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
    } // end state.eager guard

    // Skip all $effect rune transforms if $effect is actually a store subscription or function param
    if !effect_is_store_sub && !effect_is_func_param {
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
    } // end if !effect_is_store_sub

    // Transform $props.id() to $.props_id()
    if result.contains("$props.id()") {
        result = result.replace("$props.id()", "$.props_id()");
    }

    // Transform $inspect.trace(...) - in non-dev mode, remove the entire statement
    // In dev mode, transform the enclosing block body to wrap remaining statements in $.trace()
    while let Some(pos) = result.find("$inspect.trace(") {
        let trace_start = pos + 15; // after "$inspect.trace("
        if let Some(content_end) = find_matching_paren(&result[trace_start..]) {
            let trace_arg = result[trace_start..trace_start + content_end]
                .trim()
                .to_string();
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
                && (result.as_bytes()[start - 1] == b' ' || result.as_bytes()[start - 1] == b'\t')
            {
                start -= 1;
            }

            if !dev {
                // In non-dev mode, just remove the $inspect.trace() statement
                result = format!("{}{}", &result[..start], &result[end..]);
            } else {
                // In dev mode, transform the enclosing function body:
                // Remove $inspect.trace(...); and wrap remaining body in:
                //   return $.trace(() => arg, () => { ...remaining... });
                //
                // The $inspect.trace() is always the first statement in a block body.
                // We need to find the enclosing block's closing brace to wrap everything.

                // Remove the $inspect.trace line first
                let before_trace = &result[..start];
                let after_trace = &result[end..];

                // Find the opening brace of the enclosing block before $inspect.trace
                // This is the `{` after the arrow/function that contains $inspect.trace
                let mut brace_pos = None;
                let before_bytes = before_trace.as_bytes();
                let mut i = before_bytes.len();
                while i > 0 {
                    i -= 1;
                    if before_bytes[i] == b'{' {
                        brace_pos = Some(i);
                        break;
                    }
                    // Skip whitespace and newlines
                    if before_bytes[i] != b' '
                        && before_bytes[i] != b'\t'
                        && before_bytes[i] != b'\n'
                        && before_bytes[i] != b'\r'
                    {
                        break;
                    }
                }

                if let Some(brace_idx) = brace_pos {
                    // Find the matching closing brace for this block
                    let body_start = brace_idx + 1;
                    let combined = format!("{}{}", before_trace, after_trace);
                    let body_content = &combined[body_start..];

                    if let Some(close_brace) = find_matching_brace(body_content) {
                        // Extract the remaining body (everything between { and } after removing $inspect.trace)
                        let remaining_body = combined[body_start..body_start + close_brace].trim();
                        // Skip past the closing brace itself
                        let after_block = &combined[body_start + close_brace + 1..];

                        // Build the trace argument thunk
                        let trace_thunk = if trace_arg.is_empty() {
                            // No argument - extract function name from context for default label
                            // Look for `function NAME(` pattern before the block
                            let before_block = &combined[..brace_idx];
                            let default_label =
                                extract_enclosing_function_name(before_block).unwrap_or("trace");
                            // In dev mode, include source location (filename:line:column)
                            // Find the location of the enclosing function in the original source
                            let fn_name_for_loc = default_label;
                            let trace_source_pos = {
                                // Find the function declaration position in the source
                                // Look for `function <name>` in the source
                                let search_pattern = format!("function {}", fn_name_for_loc);
                                if let Some(fn_pos) = analysis.source.find(&search_pattern) {
                                    let before_pos = &analysis.source[..fn_pos];
                                    let line = before_pos.matches('\n').count() + 1;
                                    let last_nl =
                                        before_pos.rfind('\n').map(|p| p + 1).unwrap_or(0);
                                    let col = fn_pos - last_nl;
                                    Some((line, col))
                                } else {
                                    None
                                }
                            };
                            if let Some((line, col)) = trace_source_pos {
                                format!(
                                    "() => '{} ({}:{}:{})'",
                                    default_label, analysis.filename, line, col
                                )
                            } else {
                                format!("() => '{}'", default_label)
                            }
                        } else {
                            format!("() => {}", trace_arg)
                        };

                        // Build: { return $.trace(thunk, () => { remaining_body }); }
                        result = format!(
                            "{}{{return $.trace({}, () => {{\n{}\n}});\n}}{}",
                            &combined[..brace_idx],
                            trace_thunk,
                            remaining_body,
                            after_block
                        );
                    } else {
                        // Couldn't find matching brace, just remove the trace call
                        result = format!("{}{}", before_trace, after_trace);
                    }
                } else {
                    // No enclosing brace found, just remove the trace call
                    result = format!("{}{}", before_trace, after_trace);
                }
            }
        } else {
            break;
        }
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

                        // Build: $.inspect(() => [args], (...$$args) => (callback)(...$$args))
                        // Note: No third argument for $inspect().with
                        // The callback must be wrapped in parens so arrow functions are valid call targets
                        result = format!(
                            "{}$.inspect(() => [{}], (...$$args) => ({})(...$$args)){}",
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
        && let Some(transformed) = transform_props_destructuring(
            &result,
            prop_source_vars,
            exported_names,
            analysis,
            read_only_props,
        )
    {
        return transformed;
    }

    // In dev mode, wrap $.state() and $.derived() declarations with $.tag() for debugging
    // This allows $inspect.trace() to show variable names in the output.
    // Pattern: `let name = $.state(...)` -> `let name = $.tag($.state(...), 'name')`
    // Also handles $.derived(), $.state($.proxy(...))
    if dev {
        result = wrap_state_derived_with_tag(&result);
    }

    result
}

/// Wrap `$.state(...)`, `$.derived(...)`, and `$.proxy(...)` declarations with `$.tag()`/`$.tag_proxy()` in dev mode.
/// This tags signals with their variable names for better debugging with `$inspect.trace()`.
///
/// Transforms:
/// - `let name = $.state(...)` -> `let name = $.tag($.state(...), 'name')`
/// - `let name = $.derived(...)` -> `let name = $.tag($.derived(...), 'name')`
/// - `let name = $.state($.proxy(...))` -> `let name = $.tag($.state($.proxy(...)), 'name')`
/// - `let name = $.proxy(...)` -> `let name = $.tag_proxy($.proxy(...), 'name')`
fn wrap_state_derived_with_tag(input: &str) -> String {
    let mut result = input.to_string();

    // Patterns to check and their prefix lengths
    // (pattern, prefix_len, tag_fn)
    let patterns: &[(&str, usize, &str)] = &[
        ("$.state(", 8, "$.tag"),
        ("$.derived(", 10, "$.tag"),
        ("$.proxy(", 8, "$.tag_proxy"),
    ];

    // Process each declaration keyword
    for keyword in &["let ", "const ", "var "] {
        let mut search_from = 0;
        loop {
            let rest = &result[search_from..];
            let Some(kw_pos) = rest.find(keyword) else {
                break;
            };
            let abs_kw_pos = search_from + kw_pos;
            let after_kw = &result[abs_kw_pos + keyword.len()..];

            // Extract variable name (simple identifier before `=`)
            let var_name: String = after_kw
                .chars()
                .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$')
                .collect();

            if var_name.is_empty() {
                search_from = abs_kw_pos + keyword.len();
                continue;
            }

            // Find ` = ` after variable name
            let after_name = &after_kw[var_name.len()..];
            let trimmed = after_name.trim_start();
            if !trimmed.starts_with('=') {
                search_from = abs_kw_pos + keyword.len();
                continue;
            }
            let eq_offset = after_name.len() - trimmed.len();
            let rhs_start_in_result = abs_kw_pos + keyword.len() + var_name.len() + eq_offset + 1;
            let rhs = result[rhs_start_in_result..].trim_start();
            let rhs_trim_offset = result[rhs_start_in_result..].len() - rhs.len();
            let rhs_abs_start = rhs_start_in_result + rhs_trim_offset;

            // Check which pattern matches
            let mut matched = false;
            for &(pattern, prefix_len, tag_fn) in patterns {
                if !rhs.starts_with(pattern) {
                    continue;
                }

                // Skip $.proxy if it's already inside $.state (e.g., $.state($.proxy(...)))
                // Those are handled by the $.state match
                if pattern == "$.proxy(" {
                    // Check if this $.proxy is already tagged (inside $.tag or $.tag_proxy)
                    let before = &result[..rhs_abs_start];
                    if before.ends_with("$.tag(") || before.ends_with("$.tag_proxy(") {
                        break;
                    }
                }

                let inner_start = rhs_abs_start + prefix_len;
                if let Some(close_paren) = find_matching_paren(&result[inner_start..]) {
                    let call_end = inner_start + close_paren + 1;
                    let call_expr = &result[rhs_abs_start..call_end];

                    let tagged = format!("{}({}, '{}')", tag_fn, call_expr, var_name);
                    result = format!(
                        "{}{}{}",
                        &result[..rhs_abs_start],
                        tagged,
                        &result[call_end..]
                    );
                    search_from = rhs_abs_start + tagged.len();
                    matched = true;
                }
                break;
            }

            if !matched {
                search_from = abs_kw_pos + keyword.len();
            }
        }
    }

    // Also handle `this.#field = $.state(...)` or `this.field = $.state(...)` in class constructors
    // Transform to `this.#field = $.tag($.state(...), 'ClassName.#field')` or similar
    {
        let mut search_from = 0;
        loop {
            let rest = &result[search_from..];
            let Some(this_pos) = rest.find("this.") else {
                break;
            };
            let abs_this_pos = search_from + this_pos;
            let after_this = &result[abs_this_pos + 5..]; // after "this."

            // Extract field name (possibly starting with #)
            let field_name: String = after_this
                .chars()
                .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$' || *c == '#')
                .collect();

            if field_name.is_empty() {
                search_from = abs_this_pos + 5;
                continue;
            }

            // Find ` = ` after field name
            let after_name = &after_this[field_name.len()..];
            let trimmed = after_name.trim_start();
            if !trimmed.starts_with('=') || trimmed.starts_with("==") {
                search_from = abs_this_pos + 5;
                continue;
            }
            let eq_offset = after_name.len() - trimmed.len();
            let rhs_start = abs_this_pos + 5 + field_name.len() + eq_offset + 1;
            let rhs = result[rhs_start..].trim_start();
            let rhs_trim_offset = result[rhs_start..].len() - rhs.len();
            let rhs_abs_start = rhs_start + rhs_trim_offset;

            // Check if the RHS is $.state( or $.derived( (already transformed from class field)
            let mut matched = false;
            for &(pattern, prefix_len, tag_fn) in patterns {
                if !rhs.starts_with(pattern) {
                    continue;
                }

                // Already tagged?
                let before = &result[..rhs_abs_start];
                if before.ends_with("$.tag(") || before.ends_with("$.tag_proxy(") {
                    break;
                }

                let inner_start = rhs_abs_start + prefix_len;
                if let Some(close_paren) = find_matching_paren(&result[inner_start..]) {
                    let call_end = inner_start + close_paren + 1;
                    let call_expr = &result[rhs_abs_start..call_end];

                    // Extract class name from context (look for `class NAME {` before this position)
                    let before_text = &result[..abs_this_pos];
                    let class_name = extract_enclosing_class_name(before_text).unwrap_or("Unknown");

                    // Build tag label: ClassName.#field or ClassName.field
                    let label = format!("{}.{}", class_name, field_name);
                    let tagged = format!("{}({}, '{}')", tag_fn, call_expr, label);
                    result = format!(
                        "{}{}{}",
                        &result[..rhs_abs_start],
                        tagged,
                        &result[call_end..]
                    );
                    search_from = rhs_abs_start + tagged.len();
                    matched = true;
                }
                break;
            }

            if !matched {
                search_from = abs_this_pos + 5;
            }
        }
    }

    result
}

/// Extract the enclosing class name from the text before a given position.
/// Looks for `class NAME` pattern.
fn extract_enclosing_class_name(before: &str) -> Option<&str> {
    // Find the last `class ` before the position
    let class_pos = before.rfind("class ")?;
    let after_class = &before[class_pos + 6..];
    // Extract the class name
    let name_end = after_class.find(|c: char| !c.is_alphanumeric() && c != '_' && c != '$')?;
    if name_end == 0 {
        return None;
    }
    Some(&after_class[..name_end])
}

/// Apply $effect-related rune transforms to a string.
/// This is used to ensure that early returns from `transform_client_runes_with_skip_and_state`
/// still get $effect transforms applied.
fn apply_effect_rune_transforms(mut result: String) -> String {
    // Transform $effect.pending() to $.eager($.pending)
    if result.contains("$effect.pending()") {
        result = result.replace("$effect.pending()", "$.eager($.pending)");
    }
    // Transform $effect.pre(x) to $.user_pre_effect(x)
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
    } else if trimmed.starts_with("var ") {
        "var"
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
    let contains_await = contains_direct_await_in_expression(source);
    let base_expr = if source_is_identifier {
        wrapped_source.clone()
    } else if contains_await {
        // Async derived destructuring: use $.async_derived()
        // Apply $.save() wrapping for non-final await expressions
        let saved_content = wrap_await_with_save_in_async_derived(wrapped_source.trim());
        let inner_expr = strip_top_level_await_from_expr(&saved_content);
        let inner_has_nested_await = contains_direct_await_in_expression(&inner_expr);

        if inner_has_nested_await {
            let is_object = saved_content.trim().starts_with('{');
            if is_object {
                declarations.push(format!(
                    "$$d = await $.async_derived(async () => ({}))",
                    saved_content
                ));
            } else {
                declarations.push(format!(
                    "$$d = await $.async_derived(async () => {})",
                    saved_content
                ));
            }
        } else {
            let inner_trimmed = inner_expr.trim();
            let inner_is_object = inner_trimmed.starts_with('{');
            if inner_is_object {
                declarations.push(format!(
                    "$$d = await $.async_derived(() => ({}))",
                    inner_expr
                ));
            } else {
                let thunk_arg = unthunk_string(&inner_expr);
                declarations.push(format!("$$d = await $.async_derived({})", thunk_arg));
            }
        }
        "$.get($$d)".to_string()
    } else {
        // When the source is an object literal (starts with {), we must wrap it in
        // parentheses to avoid the arrow function body being parsed as a block:
        // () => ({a, b}) instead of () => {a, b}
        if wrapped_source.trim_start().starts_with('{') {
            declarations.push(format!("$$d = $.derived(() => ({}))", wrapped_source));
        } else {
            // Apply unthunk optimization: $.derived(() => name()) -> $.derived(name)
            let derived_arg = unthunk_string(&wrapped_source);
            declarations.push(format!("$$d = $.derived({})", derived_arg));
        }
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

/// Transform `$derived.by()` with destructuring patterns.
///
/// Unlike `$derived(identifier)` which can skip the temp variable,
/// `$derived.by()` always creates a `$$d` temp variable because the
/// callback is already provided and needs to be called through `$.derived()`.
///
/// Transforms:
///   `let { a, b } = $derived.by(fn)` -> `let $$d = $.derived(fn), a = $.derived(() => $.get($$d).a), b = $.derived(() => $.get($$d).b)`
fn transform_derived_by_destructuring(
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
    } else if trimmed.starts_with("var ") {
        "var"
    } else {
        return None;
    };
    let derived_pos = trimmed.find("$derived.by(")?;
    let pattern_start = decl_keyword.len() + 1;
    let eq_pos = trimmed[..derived_pos].rfind('=')?;
    let pattern = trimmed[pattern_start..eq_pos].trim();
    let source_start = derived_pos + 12; // after "$derived.by("
    let source_end = find_matching_paren(&trimmed[source_start..])?;
    let source = trimmed[source_start..source_start + source_end].trim();
    let mut declarations = Vec::new();
    let mut array_counter = 0;
    let wrapped_source = wrap_state_vars_in_expr(source, state_vars, non_reactive_vars, proxy_vars);
    // $derived.by() always creates a $$d temp - the callback is passed directly to $.derived()
    declarations.push(format!("$$d = $.derived({})", wrapped_source));
    let base_expr = "$.get($$d)".to_string();
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

/// Transform `$state()` or `$state.raw()` with destructuring patterns.
///
/// Transforms:
///   `let { a, b } = $state(expr)` -> `let tmp = expr, a = $.state($.proxy(tmp.a)), b = $.state($.proxy(tmp.b))`
///   `let { a, b } = $state.raw(expr)` -> `let tmp = expr, a = $.state(tmp.a), b = $.state(tmp.b)`
///
/// When a variable is not reassigned (in skip_state_vars), the $.state() wrapper is omitted:
///   `let { foo } = $state(data)` -> `let tmp = data, foo = $.proxy(tmp.foo)`
///
/// Corresponds to the official Svelte compiler's VariableDeclaration.js handling of
/// ObjectPattern/ArrayPattern with $state/$state.raw init.
fn transform_state_destructuring(
    line: &str,
    is_raw: bool,
    skip_state_vars: &[String],
    state_vars: &[String],
    non_reactive_vars: &[String],
    proxy_vars: &[String],
) -> Option<String> {
    let trimmed = line.trim();

    // Determine declaration keyword
    let decl_keyword = if trimmed.starts_with("let ") {
        "let"
    } else if trimmed.starts_with("const ") {
        "const"
    } else if trimmed.starts_with("var ") {
        "var"
    } else {
        return None;
    };

    // Find the $state( or $state.raw( position
    let rune_str = if is_raw { "$state.raw(" } else { "$state(" };
    let rune_pos = trimmed.find(rune_str)?;
    let rune_len = rune_str.len();

    // Extract the destructuring pattern between the keyword and the = sign
    let eq_pos = trimmed[..rune_pos].rfind('=')?;
    let pattern_start = decl_keyword.len() + 1; // skip "let "/"const "/"var "
    let pattern = trimmed[pattern_start..eq_pos].trim();

    // Must be a destructuring pattern
    if !pattern.starts_with('{') && !pattern.starts_with('[') {
        return None;
    }

    // Extract the source expression inside $state(...) or $state.raw(...)
    let source_start = rune_pos + rune_len;
    let source_end = find_matching_paren(&trimmed[source_start..])?;
    let source = trimmed[source_start..source_start + source_end].trim();

    // Wrap state variables in the source expression with $.get()
    let wrapped_source = wrap_state_vars_in_expr(source, state_vars, non_reactive_vars, proxy_vars);

    // Generate a unique tmp variable name: tmp, tmp_1, tmp_2, ...
    let tmp_idx = STATE_TMP_COUNTER.with(|c| {
        let current = c.get();
        c.set(current + 1);
        current
    });
    let tmp_name = if tmp_idx == 0 {
        "tmp".to_string()
    } else {
        format!("tmp_{}", tmp_idx)
    };

    // Build declarations
    let mut declarations = Vec::new();

    // First declaration: tmp = <source expression>
    declarations.push(format!("{} = {}", tmp_name, wrapped_source));

    // Process the destructuring pattern
    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        process_state_object_pattern(inner, &tmp_name, is_raw, skip_state_vars, &mut declarations)?;
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        process_state_array_pattern(
            inner,
            &tmp_name,
            is_raw,
            skip_state_vars,
            state_vars,
            non_reactive_vars,
            proxy_vars,
            &mut declarations,
        )?;
    } else {
        return None;
    }

    if declarations.len() <= 1 {
        // Only the tmp declaration, no actual properties
        return None;
    }

    // Check for trailing semicolon
    let trailing = if trimmed.ends_with(';') { "" } else { ";" };

    Some(format!(
        "{} {}{}",
        decl_keyword,
        declarations.join(", "),
        trailing
    ))
}

/// Process object destructuring pattern for $state()/$state.raw().
///
/// For `{ a, b: c, d = defaultVal }`, generates:
///   `a = $.state($.proxy(tmp.a)), c = $.state($.proxy(tmp.b)), d = $.state($.proxy(tmp.d))`
fn process_state_object_pattern(
    inner: &str,
    tmp_name: &str,
    is_raw: bool,
    skip_state_vars: &[String],
    declarations: &mut Vec<String>,
) -> Option<()> {
    let properties = split_derived_object_properties(inner);

    for prop in &properties {
        let prop = prop.trim();
        if prop.is_empty() {
            continue;
        }

        if let Some(rest_name) = prop.strip_prefix("...") {
            // Rest element: ...rest
            let rest_name = rest_name.trim();
            // Rest elements get the remaining properties
            // For now, generate a simple spread
            let is_skip = skip_state_vars.contains(&rest_name.to_string());
            let value = if is_raw {
                format!("{}.{}", tmp_name, rest_name)
            } else if is_skip {
                format!("$.proxy({}.{})", tmp_name, rest_name)
            } else {
                format!("$.state($.proxy({}.{}))", tmp_name, rest_name)
            };
            declarations.push(format!("{} = {}", rest_name, value));
            continue;
        }

        if let Some(colon_pos) = find_derived_property_colon(prop) {
            // Renamed property: key: value or key: value = default
            let key = prop[..colon_pos].trim();
            let value_part = prop[colon_pos + 1..].trim();

            // Check for default value: key: varname = defaultVal
            let (var_name, _default_expr) = if let Some(eq_pos) = value_part.find('=') {
                let vn = value_part[..eq_pos].trim();
                let de = value_part[eq_pos + 1..].trim();
                (vn, Some(de))
            } else {
                (value_part, None)
            };

            let is_skip = skip_state_vars.contains(&var_name.to_string());
            let member_access = format!("{}.{}", tmp_name, key);
            let wrapped = wrap_state_value(&member_access, is_raw, is_skip);
            declarations.push(format!("{} = {}", var_name, wrapped));
        } else {
            // Shorthand property: name or name = defaultVal
            let (var_name, _default_expr) = if let Some(eq_pos) = prop.find('=') {
                let vn = prop[..eq_pos].trim();
                let de = prop[eq_pos + 1..].trim();
                (vn, Some(de))
            } else {
                (prop, None)
            };

            let is_skip = skip_state_vars.contains(&var_name.to_string());
            let member_access = format!("{}.{}", tmp_name, var_name);
            let wrapped = wrap_state_value(&member_access, is_raw, is_skip);
            declarations.push(format!("{} = {}", var_name, wrapped));
        }
    }

    Some(())
}

/// Process array destructuring pattern for $state()/$state.raw().
///
/// For `[a, b]`, generates:
///   `$$array = $.derived(() => $.to_array(tmp, 2))`
///   `a = $.state($.proxy($.get($$array)[0]))`
///   `b = $.state($.proxy($.get($$array)[1]))`
#[allow(clippy::too_many_arguments)]
fn process_state_array_pattern(
    inner: &str,
    tmp_name: &str,
    is_raw: bool,
    skip_state_vars: &[String],
    state_vars: &[String],
    non_reactive_vars: &[String],
    proxy_vars: &[String],
    declarations: &mut Vec<String>,
) -> Option<()> {
    let elements = split_derived_array_elements(inner);

    // For array destructuring, we need an intermediate $$array derived
    // to handle iterables (like the official compiler's extract_paths does)
    let has_rest = elements.iter().any(|e| e.trim().starts_with("..."));
    let element_count = elements.len();

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

    // Create the $$array derived declaration
    let to_array_args = if has_rest {
        format!("$.to_array({})", tmp_name)
    } else {
        format!("$.to_array({}, {})", tmp_name, element_count)
    };

    let wrapped_to_array =
        wrap_state_vars_in_expr(&to_array_args, state_vars, non_reactive_vars, proxy_vars);
    declarations.push(format!(
        "{} = $.derived(() => {})",
        array_var, wrapped_to_array
    ));

    for (index, element) in elements.iter().enumerate() {
        let element = element.trim();
        if element.is_empty() {
            continue;
        }

        if let Some(rest_name) = element.strip_prefix("...") {
            let rest_name = rest_name.trim();
            let is_skip = skip_state_vars.contains(&rest_name.to_string());
            let access = format!("$.get({}).slice({})", array_var, index);
            let wrapped = wrap_state_value(&access, is_raw, is_skip);
            declarations.push(format!("{} = {}", rest_name, wrapped));
            continue;
        }

        let is_skip = skip_state_vars.contains(&element.to_string());
        let element_access = format!("$.get({})[{}]", array_var, index);
        let wrapped = wrap_state_value(&element_access, is_raw, is_skip);
        declarations.push(format!("{} = {}", element, wrapped));
    }

    Some(())
}

/// Wrap a member access expression for $state destructuring.
///
/// - `$state` (not raw) + is_state_source (not in skip_state_vars) -> `$.state($.proxy(expr))`
/// - `$state` (not raw) + not is_state_source (in skip_state_vars) -> `$.proxy(expr)`
/// - `$state.raw` + is_state_source -> `$.state(expr)`
/// - `$state.raw` + not is_state_source -> just `expr`
fn wrap_state_value(member_access: &str, is_raw: bool, is_skip: bool) -> String {
    if is_raw {
        if is_skip {
            member_access.to_string()
        } else {
            format!("$.state({})", member_access)
        }
    } else if is_skip {
        format!("$.proxy({})", member_access)
    } else {
        format!("$.state($.proxy({}))", member_access)
    }
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

    // Collect all non-rest property keys for $.exclude_from_object
    let excluded_keys: Vec<String> = properties
        .iter()
        .filter_map(|prop| {
            let prop = prop.trim();
            if prop.is_empty() || prop.starts_with("...") {
                return None;
            }
            // Extract the key name (before colon if present, otherwise the whole thing)
            let key = if let Some(colon_pos) = find_derived_property_colon(prop) {
                prop[..colon_pos].trim()
            } else {
                prop.trim()
            };
            // Handle computed keys and quoted keys
            if key.starts_with('[') {
                None // computed keys can't be excluded statically
            } else {
                Some(format!("\"{}\"", key))
            }
        })
        .collect();

    // Second pass: process all properties in source order
    for prop in &properties {
        let prop = prop.trim();
        if prop.is_empty() {
            continue;
        }
        if let Some(rest_name) = prop.strip_prefix("...") {
            let rest_name = rest_name.trim();
            let keys_str = excluded_keys.join(", ");
            declarations.push(format!(
                "{} = $.derived(() => $.exclude_from_object({}, [{}]))",
                rest_name, base_expr, keys_str
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

        // Collect all non-rest property keys for $.exclude_from_object
        let excluded_keys: Vec<String> = properties
            .iter()
            .filter_map(|prop| {
                let prop = prop.trim();
                if prop.is_empty() || prop.starts_with("...") {
                    return None;
                }
                let key = if let Some(colon_pos) = find_derived_property_colon(prop) {
                    prop[..colon_pos].trim()
                } else {
                    prop.trim()
                };
                if key.starts_with('[') {
                    None
                } else {
                    Some(format!("\"{}\"", key))
                }
            })
            .collect();

        for prop in &properties {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }
            if let Some(rest_name) = prop.strip_prefix("...") {
                let rest_name = rest_name.trim();
                let keys_str = excluded_keys.join(", ");
                declarations.push(format!(
                    "{} = $.derived(() => $.exclude_from_object({}, [{}]))",
                    rest_name, base_expr, keys_str
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

/// Extract assigned variable names and dependency variable names from a raw `$:` reactive statement.
///
/// This is used for topological sorting of reactive statements.
/// Returns (assigned_vars, dependency_vars).
///
/// For `$: c = a + b;`, returns (["c"], ["a", "b"])
/// For `$: console.log(x);`, returns ([], ["console", "x"])
fn extract_reactive_statement_deps(
    statement: &str,
    state_vars: &[String],
    prop_vars: &[String],
    store_sub_vars: &[String],
) -> (Vec<String>, Vec<String>) {
    let trimmed = statement.trim();

    // Extract the body after `$:`
    let body = if let Some(stripped) = trimmed.strip_prefix("$:") {
        stripped.trim()
    } else {
        return (vec![], vec![]);
    };

    let body = body.trim_end_matches(';').trim();
    if body.is_empty() {
        return (vec![], vec![]);
    }

    // All known reactive variable names (state vars + prop vars + store subs)
    // These are the variables that participate in the reactive dependency graph
    let all_reactive_vars: Vec<&str> = state_vars
        .iter()
        .chain(prop_vars.iter())
        .chain(store_sub_vars.iter())
        .map(|s| s.as_str())
        .collect();

    let mut assigned_vars = Vec::new();
    let mut dep_vars = Vec::new();

    // Check if this is an assignment statement
    if let Some(eq_pos) = find_assignment_position(body) {
        let lhs = body[..eq_pos].trim();
        let rhs = body[eq_pos + 1..].trim();

        // Extract assigned variable from LHS
        // Simple identifier: `c = ...`
        if is_simple_identifier(lhs) {
            assigned_vars.push(lhs.to_string());
        } else {
            // Could be a member expression like `obj.prop = ...`
            // Extract the base identifier
            if let Some(base) = extract_member_expression_base(lhs) {
                assigned_vars.push(base.to_string());
            }
        }

        // Extract dependencies from RHS
        for var_name in &all_reactive_vars {
            if body_references_identifier(rhs, var_name) {
                // Only add as dependency if it's not also being assigned
                if !assigned_vars.contains(&var_name.to_string()) {
                    dep_vars.push(var_name.to_string());
                }
            }
        }
    } else {
        // Not a simple assignment - expression statement like `console.log(x)` or `if (...) { x++ }`
        // All referenced reactive vars are dependencies
        for var_name in &all_reactive_vars {
            if body_references_identifier(body, var_name) {
                dep_vars.push(var_name.to_string());
            }
        }
    }

    // Also scan the entire body for assignments to reactive vars inside nested blocks.
    // This catches patterns like `$: if (cond) { count++ }` where `count` is assigned
    // inside an if block but the top-level is not an assignment expression.
    // We look for `var =`, `var++`, `var--`, `++var`, `--var` patterns.
    for var_name in &all_reactive_vars {
        if assigned_vars.contains(&var_name.to_string()) {
            continue; // Already detected as assigned
        }
        if is_assigned_anywhere_in_body(body, var_name)
            && !assigned_vars.contains(&var_name.to_string())
        {
            assigned_vars.push(var_name.to_string());
        }
    }

    (assigned_vars, dep_vars)
}

/// Check if a variable is assigned anywhere in a code body (including nested blocks).
/// Detects `var = ...`, `var += ...`, `var++`, `var--`, `++var`, `--var` patterns.
fn is_assigned_anywhere_in_body(body: &str, var_name: &str) -> bool {
    // Check for update expressions: `var++`, `var--`, `++var`, `--var`
    let pp = format!("{}++", var_name);
    let mm = format!("{}--", var_name);
    let pp2 = format!("++{}", var_name);
    let mm2 = format!("--{}", var_name);

    for pattern in &[&pp, &mm, &pp2, &mm2] {
        if let Some(pos) = body.find(pattern.as_str()) {
            // Verify it's at a word boundary
            let before = if pos > 0 {
                body.as_bytes()[pos - 1]
            } else {
                b' '
            };
            let after_pos = pos + pattern.len();
            let after = if after_pos < body.len() {
                body.as_bytes()[after_pos]
            } else {
                b' '
            };
            let before_ok = !before.is_ascii_alphanumeric() && before != b'_' && before != b'$';
            let after_ok = !after.is_ascii_alphanumeric() && after != b'_' && after != b'$';
            if before_ok && after_ok {
                return true;
            }
        }
    }

    // Check for assignment operators: `var = ...`, `var += ...`, `var -= ...`, etc.
    let assign_patterns = [
        " = ", " += ", " -= ", " *= ", " /= ", " %= ", " **= ", " &= ", " |= ", " ^= ", " <<= ",
        " >>= ", " >>>= ", " ??= ", " &&= ", " ||= ",
    ];
    for assign_op in &assign_patterns {
        let pattern = format!("{}{}", var_name, assign_op);
        if let Some(pos) = body.find(&pattern) {
            // Verify the variable name is at a word boundary (not part of a longer name)
            let before = if pos > 0 {
                body.as_bytes()[pos - 1]
            } else {
                b' '
            };
            let before_ok = !before.is_ascii_alphanumeric() && before != b'_' && before != b'$';
            if before_ok {
                // Also make sure it's not `==` or `=>`
                let after_eq = pos + var_name.len() + assign_op.len();
                if assign_op == &" = " && after_eq < body.len() {
                    let next = body.as_bytes()[after_eq - 1]; // the char after '='
                    if next == b'=' || next == b'>' {
                        continue;
                    }
                }
                return true;
            }
        }
    }

    false
}

/// Topologically sort reactive statements based on their dependencies.
///
/// Corresponds to `order_reactive_statements()` in Svelte's `2-analyze/index.js`.
///
/// Each entry is (assigned_vars, dependency_vars, transformed_code).
/// Returns the same entries in topologically sorted order.
fn sort_reactive_statements(
    statements: Vec<(Vec<String>, Vec<String>, String)>,
) -> Vec<(Vec<String>, Vec<String>, String)> {
    if statements.len() <= 1 {
        return statements;
    }

    let n = statements.len();

    // Build a lookup: variable name -> indices of statements that assign to it
    let mut assign_lookup: std::collections::HashMap<&str, Vec<usize>> =
        std::collections::HashMap::new();
    for (i, (assigned, _, _)) in statements.iter().enumerate() {
        for var_name in assigned {
            assign_lookup.entry(var_name.as_str()).or_default().push(i);
        }
    }

    // For each statement, find which other statements it depends on
    let mut dep_indices: Vec<Vec<usize>> = vec![Vec::new(); n];
    for (i, (assigned, deps, _)) in statements.iter().enumerate() {
        for dep_name in deps {
            // Skip self-dependencies (assigned vars that are also deps)
            if assigned.contains(dep_name) {
                continue;
            }
            if let Some(assigner_indices) = assign_lookup.get(dep_name.as_str()) {
                for &j in assigner_indices {
                    if j != i {
                        dep_indices[i].push(j);
                    }
                }
            }
        }
    }

    // Topological sort (DFS-based, matching the official implementation's add_declaration function)
    let mut sorted_indices: Vec<usize> = Vec::with_capacity(n);
    let mut visited = vec![false; n];

    fn visit(
        idx: usize,
        dep_indices: &[Vec<usize>],
        visited: &mut Vec<bool>,
        sorted: &mut Vec<usize>,
    ) {
        if visited[idx] {
            return;
        }
        visited[idx] = true;

        // Visit dependencies first
        for &dep in &dep_indices[idx] {
            visit(dep, dep_indices, visited, sorted);
        }

        sorted.push(idx);
    }

    for i in 0..n {
        visit(i, &dep_indices, &mut visited, &mut sorted_indices);
    }

    // Reconstruct the result in sorted order
    #[allow(clippy::type_complexity)]
    let mut statements_opt: Vec<Option<(Vec<String>, Vec<String>, String)>> =
        statements.into_iter().map(Some).collect();
    let mut result = Vec::with_capacity(n);

    for &idx in &sorted_indices {
        if let Some(entry) = statements_opt[idx].take() {
            result.push(entry);
        }
    }

    result
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
    store_sub_vars: &[String],
    import_names: &[String],
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

    // Extract locally-declared variables from the body (e.g., `for (let i = 0; ...)`)
    // and treat them as non-reactive so they won't be wrapped in $.get()/$.update() etc.
    let local_vars = extract_locally_declared_vars(body);
    let mut augmented_non_reactive: Vec<String> = non_reactive_state_vars.to_vec();
    for lv in &local_vars {
        if state_vars.contains(lv) && !augmented_non_reactive.contains(lv) {
            augmented_non_reactive.push(lv.clone());
        }
    }
    let non_reactive_state_vars = &augmented_non_reactive;

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
    // Dependencies are variables that need tracking in the dependency thunk.
    // We track whether each dependency is a prop or a state var, because they
    // are serialized differently:
    // - Props (bindable_prop): $.deep_read_state(name()) - deep read with function call
    // - State vars (mutable_source): $.get(name) - simple get without function call
    let mut prop_dependencies: Vec<String> = Vec::new();
    let mut state_dependencies: Vec<String> = Vec::new();

    // Props are dependencies that need tracking
    for prop_name in prop_assignment_transform_vars {
        // Check if this prop is referenced in the body (but not on the left side of assignment)
        if body_references_identifier(body, prop_name) {
            prop_dependencies.push(prop_name.clone());
        }
    }

    // $$props and $$restProps are also treated as prop dependencies in the official compiler.
    // They are wrapped in $.deep_read_state() just like regular props, BUT without the ()
    // function call (they are accessed directly, not via getter functions).
    // Reference: LabeledStatement.js line 44: `if (name === '$$props' || name === '$$restProps' ...)`
    // Note: In our code, $$props is later replaced by $$sanitized_props in post-processing.
    let mut special_prop_dependencies: Vec<String> = Vec::new();
    for special_prop in &["$$props", "$$restProps"] {
        if body_references_identifier(body, special_prop) {
            special_prop_dependencies.push(special_prop.to_string());
        }
    }

    // State vars are also dependencies, but only if they are READ in the body
    // (not just assigned). In the official compiler, reactive_statement.dependencies
    // only includes bindings that are read, not those that are only assigned.
    for state_var in state_vars {
        if !non_reactive_state_vars.contains(state_var)
            && body_references_identifier(body, state_var)
            && !is_only_assignment_target(body, state_var)
        {
            state_dependencies.push(state_var.clone());
        }
    }

    // Store subscription vars are also dependencies
    // e.g., `$: bar = $foo` - `$foo` is a store subscription and should be tracked as a dep.
    // Store subs appear as `$foo()` calls in the dependency thunk.
    let mut store_sub_dependencies: Vec<String> = Vec::new();
    for store_sub in store_sub_vars {
        // Check if the store subscription is referenced on the RHS of the assignment
        // (not as the LHS itself, since `$: $foo = ...` would be a store assignment, not a dep)
        if body_references_identifier(body, store_sub) {
            // Only add as dependency if it appears on the RHS (not as the target of assignment)
            // Check if the body is an assignment and `store_sub` is NOT the LHS
            let is_assignment_target = if let Some(eq_pos) = find_assignment_position(body) {
                let lhs = body[..eq_pos].trim();
                lhs == store_sub.as_str()
            } else {
                false
            };
            if !is_assignment_target {
                store_sub_dependencies.push(store_sub.clone());
            }
        }
    }

    // Import identifiers referenced in the body are also dependencies.
    // In the official compiler, import bindings with `declaration_kind === 'import'`
    // are included as bare identifiers in the dependency list.
    // This handles cases like `$: selected() ? component = Sub : component = banana`
    // where `Sub` is an imported component that should appear in the deps.
    let mut import_dependencies: Vec<String> = Vec::new();
    for import_name in import_names {
        if body_references_identifier(body, import_name) {
            // Don't add if it's already a state var or prop (would be double-counted)
            if !state_vars.contains(import_name)
                && !prop_assignment_transform_vars.contains(import_name)
                && !store_sub_vars.contains(import_name)
            {
                import_dependencies.push(import_name.clone());
            }
        }
    }

    // Transform the body - apply prop transformations
    // For `$: c = a + b;`, the body should become `c(a() + b());`
    // This involves:
    // 1. Transform prop reads to prop() calls
    // 2. Transform prop assignments to prop(value) calls
    let transformed_body;

    // First, check if this is an assignment statement: `c = expr`
    // We must guard against ternary expressions like `a ? b = x : b = y` where
    // find_assignment_position returns a position inside the ternary branch. In that
    // case the LHS would contain `?` which is not a valid assignment target.
    if let Some(eq_pos) = find_assignment_position(body) {
        let lhs = body[..eq_pos].trim();
        let rhs = body[eq_pos + 1..].trim();
        // If the LHS contains `?` it means the `=` was found inside a ternary branch;
        // fall through to the non-assignment (else) path instead.
        // Also check if the LHS starts with a control-flow keyword like `if`, `for`,
        // `while`, etc. -- these indicate the `=` is inside a nested statement, not
        // a top-level assignment.
        if lhs.contains('?') || lhs_starts_with_keyword(lhs) {
            // Treat as non-assignment expression
            let temp = transform_prop_assignments(body, prop_assignment_transform_vars);
            let temp = transform_prop_update_expressions(&temp, prop_assignment_transform_vars);
            let temp =
                transform_state_update_expressions(&temp, state_vars, non_reactive_state_vars);
            let temp = transform_prop_reads_in_expr(&temp, prop_assignment_transform_vars);
            let temp = transform_state_set_in_reactive(&temp, state_vars, non_reactive_state_vars);
            transformed_body =
                wrap_state_vars_in_expr(&temp, state_vars, non_reactive_state_vars, proxy_vars);
        } else if (lhs.starts_with('[') || lhs.starts_with('{')) && {
            // Check if the LHS contains reactive targets that need destructure expansion
            let targets = extract_destructure_targets(lhs);
            targets
                .iter()
                .any(|t| state_vars.contains(t) || store_sub_vars.contains(t))
        } {
            // Destructure assignment with reactive targets - expand to IIFE
            // Pass prop_assignment_transform_vars so that if the RHS is a prop variable
            // (will be transformed to a function call), the IIFE form is used instead
            // of the comma form. This matches the official compiler's behavior where
            // context.visit(node.right) transforms the RHS before checking should_cache.
            let body = &transform_destructure_assignments_with_props(
                body,
                state_vars,
                store_sub_vars,
                prop_assignment_transform_vars,
            );
            let body = body.as_str();
            let temp = transform_prop_update_expressions(body, prop_assignment_transform_vars);
            let temp =
                transform_state_update_expressions(&temp, state_vars, non_reactive_state_vars);
            let temp = transform_prop_reads_in_expr(&temp, prop_assignment_transform_vars);
            let temp = transform_prop_assignments(&temp, prop_assignment_transform_vars);
            let temp = transform_state_member_mutations(&temp, state_vars, non_reactive_state_vars);
            let temp = transform_state_set_in_reactive(&temp, state_vars, non_reactive_state_vars);
            transformed_body =
                wrap_state_vars_in_expr(&temp, state_vars, non_reactive_state_vars, proxy_vars);
        } else {
            // If the LHS is a prop variable, transform to prop(value) call
            if prop_assignment_transform_vars.contains(&lhs.to_string()) {
                // Transform the RHS - wrap prop references in prop() calls
                let transformed_rhs =
                    transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
                // Also wrap state vars in $.get() calls
                let transformed_rhs = wrap_state_vars_in_expr(
                    &transformed_rhs,
                    state_vars,
                    non_reactive_state_vars,
                    proxy_vars,
                );

                transformed_body = format!("{}({})", lhs, transformed_rhs);
            } else if state_vars.contains(&lhs.to_string())
                && !non_reactive_state_vars.contains(&lhs.to_string())
            {
                // State var assignment → $.set(lhs, rhs)
                let transformed_rhs =
                    transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
                let transformed_rhs = wrap_state_vars_in_expr(
                    &transformed_rhs,
                    state_vars,
                    non_reactive_state_vars,
                    proxy_vars,
                );
                let set_expr = format!("$.set({}, {})", lhs, transformed_rhs);
                // If the LHS has a store subscription, wrap in $.store_unsub()
                // to clean up the old subscription when the variable is reassigned.
                // e.g., `$: z = u.id` where $z is a store subscription →
                // `$.store_unsub($.set(z, ...), '$z', $$stores)`
                let store_sub_name = format!("${}", lhs);
                if store_sub_vars.contains(&store_sub_name) {
                    transformed_body = format!(
                        "$.store_unsub({}, '{}', $$stores)",
                        set_expr, store_sub_name
                    );
                } else {
                    transformed_body = set_expr;
                }
            } else {
                // Check if LHS is a member expression with a state var base
                // e.g., `b.foo = a.foo` → `$.mutate(b, $.get(b).foo = $.get(a).foo)`
                let base = extract_member_expression_base(lhs);
                if let Some(base) = base
                    && state_vars.contains(&base.to_string())
                    && !non_reactive_state_vars.contains(&base.to_string())
                {
                    // Mutation of state var member
                    let member_part = &lhs[base.len()..]; // ".foo" or "[idx]"
                    let transformed_rhs =
                        transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
                    let transformed_rhs = wrap_state_vars_in_expr(
                        &transformed_rhs,
                        state_vars,
                        non_reactive_state_vars,
                        proxy_vars,
                    );
                    // Build $.mutate(base, $.get(base).member = rhs)
                    // The first arg of $.mutate() is protected by in_mutate_first_arg check
                    // in wrap_state_vars_in_expr, so `base` won't be double-wrapped.
                    transformed_body = format!(
                        "$.mutate({}, $.get({}){} = {})",
                        base, base, member_part, transformed_rhs
                    );
                } else if store_sub_vars.contains(&lhs.to_string()) {
                    // Store subscription assignment → $.store_set(store_name, rhs)
                    // e.g., `$: $a = $b` → body becomes `$.store_set(a, $b())`
                    let store_name = lhs.strip_prefix('$').unwrap_or(lhs);

                    // Check if the underlying store variable needs special access:
                    // - prop vars: use store_name() (getter function call)
                    // - state vars: use $.get(store_name)
                    // - regular: use store_name directly
                    let store_access =
                        if prop_assignment_transform_vars.contains(&store_name.to_string()) {
                            format!("{}()", store_name)
                        } else if state_vars.contains(&store_name.to_string())
                            && !non_reactive_state_vars.contains(&store_name.to_string())
                        {
                            format!("$.get({})", store_name)
                        } else {
                            store_name.to_string()
                        };

                    let transformed_rhs =
                        transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
                    let transformed_rhs = wrap_state_vars_in_expr(
                        &transformed_rhs,
                        state_vars,
                        non_reactive_state_vars,
                        proxy_vars,
                    );
                    transformed_body =
                        format!("$.store_set({}, {})", store_access, transformed_rhs);
                } else {
                    // Regular assignment - still transform prop reads on RHS
                    let transformed_rhs =
                        transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
                    let transformed_rhs = wrap_state_vars_in_expr(
                        &transformed_rhs,
                        state_vars,
                        non_reactive_state_vars,
                        proxy_vars,
                    );
                    transformed_body = format!("{} = {}", lhs, transformed_rhs);
                }
            }
        } // close the `else` branch of `if lhs.contains('?')`
    } else {
        // Not a simple assignment - handle compound assignments (+=, -=, etc.),
        // update expressions (++/--), and reads.
        // First, expand destructure assignments (e.g., `({foo1} = $store)` or `[foo2] = $store`)
        // into IIFE patterns before other transforms run. This ensures that state var targets
        // get proper `$.set()` treatment inside the IIFE body.
        let body = &transform_destructure_assignments_with_props(
            body,
            state_vars,
            store_sub_vars,
            prop_assignment_transform_vars,
        );
        let body = body.as_str();
        // Transform prop update expressions like `x++` to `$.update_prop(x)` FIRST,
        // before transform_prop_assignments runs (which would incorrectly turn `x++` into `x(x() + 1)`)
        let temp = transform_prop_update_expressions(body, prop_assignment_transform_vars);
        // Also transform state update expressions before compound assignments
        let temp = transform_state_update_expressions(&temp, state_vars, non_reactive_state_vars);
        // Transform prop reads BEFORE prop assignments, so that function calls like
        // `callback(args)` become `callback()(args)` (double-invoke for prop getters).
        // This must happen before transform_prop_assignments to avoid double-wrapping
        // assignment-generated calls like `callback = value` → `callback(value)`.
        let temp = transform_prop_reads_in_expr(&temp, prop_assignment_transform_vars);
        // Then transform prop compound assignments (e.g., `count += 1` → `count(count() + 1)`)
        let temp = transform_prop_assignments(&temp, prop_assignment_transform_vars);
        // Transform state member-expression mutations (e.g., `object[key] = []`)
        // to `$.mutate(object, $.get(object)[key] = [])`. Must run before wrap_state_vars_in_expr
        // so identifiers are still in their original form.
        let temp = transform_state_member_mutations(&temp, state_vars, non_reactive_state_vars);
        // Transform state var assignments to $.set() before wrapping reads in $.get()
        let temp = transform_state_set_in_reactive(&temp, state_vars, non_reactive_state_vars);
        transformed_body =
            wrap_state_vars_in_expr(&temp, state_vars, non_reactive_state_vars, proxy_vars);
    }

    // Apply store subscription reads transformation to body.
    // This converts `$foo` to `$foo()` in the reactive statement body,
    // so `$.set(bar, $foo)` becomes `$.set(bar, $foo())`.
    let transformed_body = if !store_sub_vars.is_empty() {
        transform_store_reads_client(&transformed_body, store_sub_vars)
    } else {
        transformed_body
    };

    // Build the dependency thunk
    // Props become $.deep_read_state(prop()) - deep read because props could be fine-grained
    // $state from a runes-component, where mutations don't trigger an update on the prop as a whole.
    // State vars become $.get(var) - simple get since they are mutable_source variables.
    // Reference: LabeledStatement.js in the official compiler
    //
    // Dependencies are sorted by their first occurrence in the body (left-to-right order),
    // matching the official Svelte compiler's Phase 2 dependency ordering.
    let has_deps = !prop_dependencies.is_empty()
        || !state_dependencies.is_empty()
        || !store_sub_dependencies.is_empty()
        || !import_dependencies.is_empty()
        || !special_prop_dependencies.is_empty();
    let deps_expr = if !has_deps {
        "".to_string()
    } else {
        // Find the first occurrence position of an identifier in the body text.
        let find_pos = |name: &str| -> usize {
            let escaped = regex::escape(name);
            let pattern = if name.starts_with('$') {
                // `$` is not a word char; use alternation to simulate word boundary
                format!(r"(^|[^a-zA-Z0-9_$]){}([^a-zA-Z0-9_$]|$)", escaped)
            } else {
                format!(r"\b{}\b", escaped)
            };
            if let Some(re) = get_or_compile_regex(&pattern) {
                if let Some(m) = re.find(body) {
                    // If name starts with `$`, the match may include one leading non-ident char;
                    // return the position where the identifier actually starts.
                    let start = m.start();
                    if name.starts_with('$') && start < body.len() {
                        let first_char = body[start..].chars().next().unwrap_or('$');
                        if first_char != '$' {
                            start + first_char.len_utf8()
                        } else {
                            start
                        }
                    } else {
                        start
                    }
                } else {
                    usize::MAX
                }
            } else {
                usize::MAX
            }
        };
        // Build unified dep list: (position, expression_string)
        let mut unified_deps: Vec<(usize, String)> = Vec::new();
        for dep in &prop_dependencies {
            let pos = find_pos(dep);
            unified_deps.push((pos, format!("$.deep_read_state({}())", dep)));
        }
        for dep in &state_dependencies {
            let pos = find_pos(dep);
            unified_deps.push((pos, format!("$.get({})", dep)));
        }
        // Store subscription vars: `$foo()` - call the getter to track dependency
        for dep in &store_sub_dependencies {
            let pos = find_pos(dep);
            unified_deps.push((pos, format!("{}()", dep)));
        }
        // Import identifiers: appear as bare identifiers in the dependency list.
        // In the official compiler, import bindings pass through build_getter()
        // which returns them unchanged (no transform registered).
        for dep in &import_dependencies {
            let pos = find_pos(dep);
            unified_deps.push((pos, dep.clone()));
        }
        // $$props and $$restProps: wrapped in $.deep_read_state() without function call.
        // Unlike regular props which are accessed via getter functions (prop_name()),
        // $$props/$$restProps are accessed directly.
        for dep in &special_prop_dependencies {
            let pos = find_pos(dep);
            unified_deps.push((pos, format!("$.deep_read_state({})", dep)));
        }
        // Sort by first occurrence in body so deps match official compiler output order
        unified_deps.sort_by_key(|&(pos, _)| pos);
        unified_deps
            .into_iter()
            .map(|(_, expr)| expr)
            .collect::<Vec<_>>()
            .join(", ")
    };

    // Replace `break $;` with `return;` since the reactive block becomes a function callback.
    // Also transform labeled break in the form `break $` (without semicolon at the end of block).
    let transformed_body = transformed_body
        .replace("break $;", "return;")
        .replace("break $\n", "return;\n");

    // Unwrap block statements: if the body is `{ ... }`, extract the inner content
    // to put it directly in the callback (avoiding double-block wrapping).
    let (inner_body, is_block) = unwrap_block_statement_owned(&transformed_body);

    // Build the $.legacy_pre_effect() call
    // The dependency expression is always wrapped in parentheses to support:
    // 1. Multiple deps: () => (dep1, dep2) - sequence expression
    // 2. Single dep: () => (dep) - keeps consistent formatting with expected output
    let deps_thunk = if deps_expr.is_empty() {
        "() => {}".to_string()
    } else {
        format!("() => ({})", deps_expr)
    };

    if is_block {
        // Body was a block statement; inner_body has dedented content
        // The inner content lines should be indented one level for the callback body
        let indented = inner_body
            .lines()
            .map(|line| {
                if line.trim().is_empty() {
                    String::new()
                } else {
                    format!("\t{}", line)
                }
            })
            .collect::<Vec<_>>()
            .join("\n");
        format!(
            "$.legacy_pre_effect({}, () => {{\n{}\n}});",
            deps_thunk, indented
        )
    } else {
        // Don't add trailing semicolon if the body already ends with '}' (block/if statement)
        // or if the body is a block statement itself
        let body_needs_semicolon = !inner_body.trim_end().ends_with('}');
        let semi = if body_needs_semicolon { ";" } else { "" };
        format!(
            "$.legacy_pre_effect({}, () => {{\n\t{}{}\n}});",
            deps_thunk, inner_body, semi
        )
    }
}

/// Unwrap a block statement `{ ... }` and return (inner_content, is_block).
/// If the body is a block statement, returns the dedented inner content with is_block=true.
/// Otherwise returns (body, false).
fn unwrap_block_statement_owned(body: &str) -> (String, bool) {
    let trimmed = body.trim();
    if !trimmed.starts_with('{') || !trimmed.ends_with('}') {
        return (body.to_string(), false);
    }

    // Find the matching closing brace of the outermost block
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut in_line_comment = false;
    let mut in_block_comment = false;
    let chars_vec: Vec<(usize, char)> = trimmed.char_indices().collect();
    let len = chars_vec.len();
    let mut idx = 0;

    while idx < len {
        let (i, c) = chars_vec[idx];

        // Handle line comments: skip until newline
        if in_line_comment {
            if c == '\n' {
                in_line_comment = false;
            }
            idx += 1;
            continue;
        }

        // Handle block comments: skip until */
        if in_block_comment {
            if c == '*' && idx + 1 < len && chars_vec[idx + 1].1 == '/' {
                in_block_comment = false;
                idx += 2;
            } else {
                idx += 1;
            }
            continue;
        }

        if in_string {
            if c == '\\' {
                idx += 2; // Skip escaped char
                continue;
            } else if c == string_char {
                in_string = false;
            }
        } else {
            // Detect comment start (before checking string/brace chars)
            if c == '/' && idx + 1 < len {
                if chars_vec[idx + 1].1 == '/' {
                    in_line_comment = true;
                    idx += 2;
                    continue;
                } else if chars_vec[idx + 1].1 == '*' {
                    in_block_comment = true;
                    idx += 2;
                    continue;
                }
            }

            match c {
                '"' | '\'' | '`' => {
                    in_string = true;
                    string_char = c;
                }
                '{' => depth += 1,
                '}' => {
                    depth -= 1;
                    if depth == 0 {
                        if i == trimmed.len() - 1 {
                            // This is the outermost block - extract inner content
                            let inner = &trimmed[1..i];
                            // Trim the leading newline if present
                            let inner = inner.strip_prefix('\n').unwrap_or(inner);
                            let inner = inner.strip_suffix('\n').unwrap_or(inner);
                            // Remove one level of tab indentation from all non-empty lines
                            let dedented = inner
                                .lines()
                                .map(|line| line.strip_prefix('\t').unwrap_or(line).to_string())
                                .collect::<Vec<_>>()
                                .join("\n");
                            return (dedented, true);
                        } else {
                            // There's more content after the }, not a simple block
                            return (body.to_string(), false);
                        }
                    }
                }
                _ => {}
            }
        }
        idx += 1;
    }

    (body.to_string(), false)
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

/// Extract variable names declared locally within a reactive statement body.
///
/// This catches `let`/`const`/`var` declarations including those in `for` loop
/// init clauses (e.g., `for (let i = 0; ...)`). These locally-declared variables
/// should NOT be treated as reactive state variables even if they share a name
/// with a component-level state variable.
fn extract_locally_declared_vars(body: &str) -> Vec<String> {
    let mut vars = Vec::new();
    // Match patterns like: `let x`, `const x`, `var x`, including inside `for (let x`
    // We scan for declaration keywords followed by an identifier.
    let re = match get_or_compile_regex(
        r"(?:^|[^a-zA-Z0-9_$])(let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)",
    ) {
        Some(re) => re,
        None => return vars,
    };
    for cap in re.captures_iter(body) {
        if let Some(m) = cap.get(2) {
            vars.push(m.as_str().to_string());
        }
    }
    vars
}

/// Transform simple assignments to state variables into $.set() calls within reactive statements.
/// `x = expr` -> `$.set(x, expr)` for state variables.
/// This handles assignments inside compound statements (if blocks, etc.).
/// Does NOT transform compound assignments (+=, -=, etc.) or declarations.
fn transform_state_set_in_reactive(
    expr: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> String {
    let mut result = expr.to_string();
    for var in state_vars {
        if non_reactive_vars.contains(var) {
            continue;
        }
        // Transform `var = expr` into `$.set(var, expr)`
        // Search for `var` followed by optional whitespace and `=`
        // Manual scanning approach (Rust regex doesn't support lookbehind)
        let assignment_pattern = format!("{} = ", var);
        let mut new_result = String::new();
        let mut last_end = 0;
        let mut search_start = 0;

        while let Some(relative_pos) = result[search_start..].find(&assignment_pattern) {
            let pos = search_start + relative_pos;
            let eq_pos = pos + var.len() + 1; // position of '='

            // Check word boundary before var name
            if pos > 0 {
                let prev_char = result.as_bytes()[pos - 1] as char;
                if prev_char.is_alphanumeric()
                    || prev_char == '_'
                    || prev_char == '$'
                    || prev_char == '.'
                {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }
            }

            // Check it's not ==, ===
            let after_eq = &result[eq_pos + 1..];
            if after_eq.starts_with('=') {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            // Check it's not a declaration (let, const, var)
            let before = result[..pos].trim_end();
            if before.ends_with("let") || before.ends_with("const") || before.ends_with("var") {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            // Check if already wrapped in $.set()
            if before.ends_with("$.set(") {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            // Find the extent of the RHS expression
            let rhs_start = pos + assignment_pattern.len();
            let remaining = &result[rhs_start..];
            // Find the end of the RHS - look for `;`, `}`, or `:` (ternary separator) at depth 0
            // Use char_indices() to get BYTE positions, not char positions, to handle UTF-8 correctly.
            let mut depth = 0;
            let mut rhs_end = result.len();
            let mut in_string: Option<char> = None;
            let mut prev_ch = '\0';
            let remaining_chars: Vec<(usize, char)> = remaining.char_indices().collect();
            let len = remaining_chars.len();
            for (idx, (byte_off, ch)) in remaining_chars.iter().enumerate() {
                let ci = *byte_off; // byte offset into `remaining`
                if in_string.is_some() {
                    if Some(*ch) == in_string && prev_ch != '\\' {
                        in_string = None;
                    }
                    prev_ch = *ch;
                    continue;
                }
                match ch {
                    '\'' | '"' | '`' => in_string = Some(*ch),
                    '(' | '[' | '{' => depth += 1,
                    ')' | ']' | '}' => {
                        if depth == 0 {
                            rhs_end = rhs_start + ci;
                            break;
                        }
                        depth -= 1;
                    }
                    ';' if depth == 0 => {
                        rhs_end = rhs_start + ci;
                        break;
                    }
                    // Newline at depth 0 acts as implicit semicolon (JavaScript ASI)
                    // e.g., `array = []\narray[0] = ...` - the `[]` ends at `\n`
                    '\n' if depth == 0 => {
                        rhs_end = rhs_start + ci;
                        break;
                    }
                    // `:` at depth 0 that is NOT `::` is a ternary separator - stop the RHS here
                    ':' if depth == 0 => {
                        let next = if idx + 1 < len {
                            remaining_chars[idx + 1].1
                        } else {
                            '\0'
                        };
                        if next != ':' {
                            rhs_end = rhs_start + ci;
                            break;
                        }
                    }
                    _ => {}
                }
                prev_ch = *ch;
            }

            let rhs = result[rhs_start..rhs_end].trim();
            if rhs.is_empty() {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            new_result.push_str(&result[last_end..pos]);
            new_result.push_str(&format!("$.set({}, {})", var, rhs));
            last_end = rhs_end;
            search_start = rhs_end;
        }

        if last_end > 0 {
            new_result.push_str(&result[last_end..]);
            result = new_result;
        }
    }
    result
}

/// Transform member-expression assignments of state variables to `$.mutate()` calls.
///
/// Converts patterns like:
///   `state_var[expr] = rhs` → `$.mutate(state_var, $.get(state_var)[expr] = rhs)`
///   `state_var.prop = rhs` → `$.mutate(state_var, $.get(state_var).prop = rhs)`
///
/// This handles nested cases (inside callbacks, if blocks, etc.) where the assignment
/// is not at the top level of the reactive statement.
///
/// This must run BEFORE `wrap_state_vars_in_expr` to operate on the original
/// identifier names before they are rewritten to `$.get(state_var)`.
fn transform_state_member_mutations(
    expr: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> String {
    let mut result = expr.to_string();

    for var in state_vars {
        if non_reactive_vars.contains(var) {
            continue;
        }

        let var_chars: Vec<char> = var.chars().collect();
        let var_len = var_chars.len();

        let mut new_result = String::new();
        let chars: Vec<char> = result.chars().collect();
        let mut i = 0;
        let mut in_string: Option<char> = None;
        let mut in_line_comment = false;
        let mut in_block_comment = false;

        while i < chars.len() {
            let c = chars[i];

            // Handle line comments
            if in_line_comment {
                new_result.push(c);
                if c == '\n' {
                    in_line_comment = false;
                }
                i += 1;
                continue;
            }
            // Handle block comments
            if in_block_comment {
                new_result.push(c);
                if c == '*' && i + 1 < chars.len() && chars[i + 1] == '/' {
                    new_result.push('/');
                    i += 2;
                    in_block_comment = false;
                } else {
                    i += 1;
                }
                continue;
            }
            // Detect comment start
            if in_string.is_none() && c == '/' && i + 1 < chars.len() {
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

            // Handle string boundaries
            if in_string.is_none() {
                if c == '\'' || c == '"' || c == '`' {
                    in_string = Some(c);
                    new_result.push(c);
                    i += 1;
                    continue;
                }
            } else if Some(c) == in_string {
                // Check for escape
                let escaped = i > 0 && {
                    let mut backslash_count = 0;
                    let mut j = i - 1;
                    while chars[j] == '\\' {
                        backslash_count += 1;
                        if j == 0 {
                            break;
                        }
                        j -= 1;
                    }
                    backslash_count % 2 == 1
                };
                if !escaped {
                    in_string = None;
                }
                new_result.push(c);
                i += 1;
                continue;
            }
            if in_string.is_some() {
                new_result.push(c);
                i += 1;
                continue;
            }

            // Try to match the state var at position i
            if i + var_len <= chars.len() {
                let potential: String = chars[i..i + var_len].iter().collect();
                if potential == *var {
                    let before_ok = i == 0 || !is_identifier_char(chars[i - 1]);
                    let after_ok = i + var_len < chars.len()
                        && (chars[i + var_len] == '[' || chars[i + var_len] == '.');
                    // Also check it's not already after `$.get(` or `$.mutate(` or $.set(
                    let already_wrapped = {
                        let prefix_len = "$.get(".len();
                        i >= prefix_len && {
                            let prefix: String = chars[i - prefix_len..i].iter().collect();
                            prefix == "$.get("
                        }
                    } || {
                        let prefix_len = "$.mutate(".len();
                        i >= prefix_len && {
                            let prefix: String = chars[i - prefix_len..i].iter().collect();
                            prefix == "$.mutate("
                        }
                    } || {
                        // Check if preceded by dot (member access of something else)
                        i > 0 && chars[i - 1] == '.'
                    };

                    if before_ok && after_ok && !already_wrapped {
                        // Scan forward to find the full member expression LHS and the `=` sign
                        // The LHS is `var` followed by member accesses (`.prop` or `[expr]`)
                        // We need to find the position of `=` (but not `==`, `!=`, `<=`, `>=`)
                        let member_start = i + var_len; // position of `[` or `.`
                        let mut j = member_start;
                        let mut depth = 0i32; // bracket/paren depth
                        let mut eq_pos = None;
                        let mut scan_in_string: Option<char> = None;

                        while j < chars.len() {
                            let ch = chars[j];

                            // Handle strings inside the member expression
                            if let Some(s) = scan_in_string {
                                if ch == s {
                                    scan_in_string = None;
                                }
                                j += 1;
                                continue;
                            }
                            if ch == '\'' || ch == '"' || ch == '`' {
                                scan_in_string = Some(ch);
                                j += 1;
                                continue;
                            }

                            match ch {
                                '[' | '(' => {
                                    depth += 1;
                                    j += 1;
                                }
                                ']' | ')' => {
                                    if depth == 0 {
                                        break; // Left the outer bracket context
                                    }
                                    depth -= 1;
                                    j += 1;
                                }
                                '{' => {
                                    // Object literal or block inside member expr - stop here
                                    // unless we're already inside brackets
                                    if depth == 0 {
                                        break;
                                    }
                                    depth += 1;
                                    j += 1;
                                }
                                '}' => {
                                    if depth == 0 {
                                        break;
                                    }
                                    depth -= 1;
                                    j += 1;
                                }
                                '=' if depth == 0 => {
                                    // Check it's not `==`, `!=`, `<=`, `>=`
                                    let is_double_eq = j + 1 < chars.len() && chars[j + 1] == '=';
                                    let is_comparison =
                                        j > 0 && matches!(chars[j - 1], '!' | '<' | '>' | '=');
                                    if !is_double_eq && !is_comparison {
                                        // Accept both simple = and compound +=, -=, etc.
                                        eq_pos = Some(j);
                                    }
                                    break;
                                }
                                // Semicolons at depth 0 are statement boundaries
                                // - stop scanning for `=` signs.
                                // Without this, `items.slice();\nclone[0].value += "x"`
                                // would incorrectly match `+=` from a different statement.
                                ';' if depth == 0 => {
                                    break;
                                }
                                _ => {
                                    j += 1;
                                }
                            }
                        }

                        if let Some(eq_idx) = eq_pos {
                            // Determine the full assignment operator
                            // eq_idx points to '=' in chars; check chars before it for compound
                            let prev_char = if eq_idx > member_start {
                                Some(chars[eq_idx - 1])
                            } else {
                                None
                            };
                            let (assign_op, op_start) = match prev_char {
                                Some('+') => ("+=", eq_idx - 1),
                                Some('-') => ("-=", eq_idx - 1),
                                Some('*') => {
                                    if eq_idx >= member_start + 2 && chars[eq_idx - 2] == '*' {
                                        ("**=", eq_idx - 2)
                                    } else {
                                        ("*=", eq_idx - 1)
                                    }
                                }
                                Some('/') => ("/=", eq_idx - 1),
                                Some('%') => ("%=", eq_idx - 1),
                                Some('&') => {
                                    if eq_idx >= member_start + 2 && chars[eq_idx - 2] == '&' {
                                        ("&&=", eq_idx - 2)
                                    } else {
                                        ("&=", eq_idx - 1)
                                    }
                                }
                                Some('|') => {
                                    if eq_idx >= member_start + 2 && chars[eq_idx - 2] == '|' {
                                        ("||=", eq_idx - 2)
                                    } else {
                                        ("|=", eq_idx - 1)
                                    }
                                }
                                Some('^') => ("^=", eq_idx - 1),
                                Some('?') => {
                                    if eq_idx >= member_start + 2 && chars[eq_idx - 2] == '?' {
                                        ("??=", eq_idx - 2)
                                    } else {
                                        ("=", eq_idx)
                                    }
                                }
                                _ => ("=", eq_idx),
                            };

                            // Extract member part (between var and the operator start)
                            let member_part: String =
                                chars[member_start..op_start].iter().collect();
                            let member_part = member_part.trim_end();

                            // Skip whitespace after `=`
                            let rhs_start = eq_idx + 1;
                            // Find end of RHS (until `;` or `}` or `,` at depth 0)
                            let mut rhs_end = chars.len();
                            let mut rhs_j = rhs_start;
                            let mut rhs_depth = 0i32;
                            let mut rhs_in_string: Option<char> = None;
                            while rhs_j < chars.len() {
                                let rc = chars[rhs_j];
                                if let Some(s) = rhs_in_string {
                                    if rc == s {
                                        rhs_in_string = None;
                                    }
                                    rhs_j += 1;
                                    continue;
                                }
                                match rc {
                                    '\'' | '"' | '`' => {
                                        rhs_in_string = Some(rc);
                                        rhs_j += 1;
                                    }
                                    '(' | '[' | '{' => {
                                        rhs_depth += 1;
                                        rhs_j += 1;
                                    }
                                    ')' | ']' | '}' => {
                                        if rhs_depth == 0 {
                                            rhs_end = rhs_j;
                                            break;
                                        }
                                        rhs_depth -= 1;
                                        rhs_j += 1;
                                    }
                                    ';' if rhs_depth == 0 => {
                                        rhs_end = rhs_j;
                                        break;
                                    }
                                    _ => {
                                        rhs_j += 1;
                                    }
                                }
                            }

                            let rhs: String = chars[rhs_start..rhs_end].iter().collect();
                            let rhs = rhs.trim();

                            if !rhs.is_empty() {
                                // Generate: $.mutate(var, $.get(var)<member_part> OP rhs)
                                let mutate_expr = format!(
                                    "$.mutate({}, $.get({}){} {} {})",
                                    var, var, member_part, assign_op, rhs
                                );
                                new_result.push_str(&mutate_expr);
                                i = rhs_end;
                                continue;
                            }
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

/// Check if a variable is ONLY used as an assignment target in the body (never read).
///
/// Returns true if every occurrence of the identifier is immediately followed by an
/// assignment operator (`=`, `+=`, `-=`, etc.) - meaning it's only written to, not read.
/// Returns false if the identifier is read anywhere in the body.
///
/// This is used to exclude state variables that are only assigned (not read) from
/// the `$.legacy_pre_effect()` dependency list, matching the official compiler's behavior
/// where `reactive_statement.dependencies` only includes bindings that are read.
///
/// Examples:
/// - `component = Sub` → `component` is only assigned, returns true
/// - `count = count + 1` → `count` is read on RHS, returns false
/// - `if (x) component = Sub; else component = Banana` → returns true (only assignments)
fn is_only_assignment_target(body: &str, identifier: &str) -> bool {
    let escaped = regex::escape(identifier);
    let pattern = format!(r"(^|[^a-zA-Z0-9_$\.]){}([^a-zA-Z0-9_$]|$)", escaped);
    let re = match get_or_compile_regex(&pattern) {
        Some(re) => re,
        None => return false,
    };

    let stripped_body = strip_string_literal_text(body);

    // Find all occurrences of the identifier
    let mut search_start = 0;
    let mut found_any = false;
    while search_start < stripped_body.len() {
        let search_slice = &stripped_body[search_start..];
        if let Some(m) = re.find(search_slice) {
            found_any = true;
            // Determine the actual start of the identifier within the match
            let abs_start = search_start + m.start();
            let match_str = &stripped_body[abs_start..search_start + m.end()];
            // The identifier may be preceded by a non-ident char
            let ident_start = if match_str.starts_with(identifier) {
                abs_start
            } else {
                abs_start + match_str.find(identifier).unwrap_or(0)
            };
            let ident_end = ident_start + identifier.len();

            // Check what follows the identifier (skipping whitespace)
            let after = stripped_body[ident_end..].trim_start();
            // Check if followed by assignment operator
            let is_assignment = after.starts_with("= ")
                || after.starts_with("=\t")
                || after.starts_with("=\n")
                || after.starts_with("=;")
                || after.starts_with(";\n")
                || after.starts_with("+=")
                || after.starts_with("-=")
                || after.starts_with("*=")
                || after.starts_with("/=")
                || after.starts_with("%=")
                || after.starts_with("**=")
                || after.starts_with("<<=")
                || after.starts_with(">>=")
                || after.starts_with(">>>=")
                || after.starts_with("&=")
                || after.starts_with("|=")
                || after.starts_with("^=")
                || after.starts_with("&&=")
                || after.starts_with("||=")
                || after.starts_with("??=");
            // Also handle end-of-line assignment: `identifier =\n`
            let is_assignment = is_assignment
                || (!after.is_empty() && after.starts_with('=') && !after.starts_with("=="));

            if !is_assignment {
                // This occurrence is a read, not an assignment target
                return false;
            }

            // Move past this match to find more occurrences
            search_start += m.end();
            // The regex match might end with a boundary char; back up one
            // so the next match can use it as a preceding boundary
            search_start = search_start.saturating_sub(1);
        } else {
            break;
        }
    }

    // If we found the identifier and all occurrences were assignments, return true
    found_any
}

/// Check if a body references an identifier as a read (not only as an assignment target).
///
/// This is used to determine dependencies for `$.legacy_pre_effect()` calls.
/// A variable is a dependency if it's READ in the body, not if it's only written to.
///
/// For simple assignments like `c = a + b`, `c` is not a dependency, but `a` and `b` are.
/// For self-referential assignments like `count = count + 1`, `count` IS a dependency
/// because it appears on the RHS.
/// For block bodies like `{ c = a + b; count = count + 1; }`, we check each statement
/// within the block.
fn body_references_identifier(body: &str, identifier: &str) -> bool {
    // The Rust regex crate does NOT support lookbehind assertions.
    // We use alternation-based boundary matching instead:
    //   (^|[^a-zA-Z0-9_$])identifier([^a-zA-Z0-9_$]|$)
    //
    // This handles two important cases:
    // 1. `$foo` (store subscriptions) - `\b` doesn't work because `$` is not a word char.
    //    e.g., "bar = $foo" must match `$foo` but NOT "bar = $foobar"
    // 2. For plain identifiers like `count`, we must NOT match `count` inside `$count`.
    //    e.g., `$count * 2` - `count` should NOT be considered a dependency here
    //    because `$count` already tracks the store subscription.
    let escaped = regex::escape(identifier);
    // Use alternation boundary for ALL identifiers (both `$foo` and `count`)
    // to correctly handle the `$`-prefixed store subscription case.
    // Also exclude `.` from valid preceding characters to avoid matching property
    // accesses like `obj.prop` when checking for standalone `prop` references.
    let pattern = format!(r"(^|[^a-zA-Z0-9_$\.]){}([^a-zA-Z0-9_$]|$)", escaped);
    let re = match get_or_compile_regex(&pattern) {
        Some(re) => re,
        None => return false,
    };

    // Before checking, strip out function/arrow bodies that shadow the identifier
    // as a parameter. This prevents false positives where a function parameter
    // with the same name as an outer variable causes incorrect dependency tracking.
    // e.g., `(function (a) { return a; })(x)` - `a` is a parameter, not an outer var.
    let stripped_body = strip_function_scopes_that_shadow(body, identifier);

    // Strip string and template literal TEXT content to avoid false positives.
    // Template literals like `<circle cx="${width}">` contain text that might match
    // identifier names (e.g., `circle` in the HTML tag name). We keep the `${...}`
    // expression parts but blank out the literal text.
    let stripped_body = strip_string_literal_text(&stripped_body);

    // Strip non-shorthand, non-computed object property keys to avoid false positives.
    // In `{ details: null }`, `details` is a property key, NOT a variable reference.
    // But in `{ details }` (shorthand), `details` IS a variable reference.
    let stripped_body = strip_object_property_keys(&stripped_body);

    // Check if identifier appears in the stripped body at all
    if !re.is_match(&stripped_body) {
        return false;
    }

    // Use the recursive check that handles if/else, blocks, and compound statements
    body_references_identifier_recursive(stripped_body.trim(), identifier, &re)
}

/// Strip text content from string literals and template literals, keeping expression parts.
///
/// Replaces:
/// - Single-quoted strings: `'text'` -> `'    '`
/// - Double-quoted strings: `"text"` -> `"    "`
/// - Template literal text: `` `text ${expr} text` `` -> `` `     ${expr}     ` ``
///
/// This prevents false identifier matches inside literal text, e.g., `<circle>` in
/// a template literal won't match the variable name `circle`.
fn strip_string_literal_text(code: &str) -> String {
    let chars: Vec<char> = code.chars().collect();
    let mut result = chars.clone();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        match chars[i] {
            // Handle single/double-quoted strings
            '\'' | '"' => {
                let quote = chars[i];
                i += 1; // skip opening quote
                while i < len && chars[i] != quote {
                    if chars[i] == '\\' && i + 1 < len {
                        result[i] = ' ';
                        result[i + 1] = ' ';
                        i += 2;
                    } else {
                        result[i] = ' ';
                        i += 1;
                    }
                }
                if i < len {
                    i += 1; // skip closing quote
                }
            }
            // Handle template literals
            '`' => {
                i += 1; // skip opening backtick
                while i < len && chars[i] != '`' {
                    if chars[i] == '\\' && i + 1 < len {
                        result[i] = ' ';
                        result[i + 1] = ' ';
                        i += 2;
                    } else if chars[i] == '$' && i + 1 < len && chars[i + 1] == '{' {
                        // Keep `${` and skip to the expression inside
                        i += 2; // skip `${`
                        // Find matching `}` - track depth
                        let mut depth = 1;
                        while i < len && depth > 0 {
                            match chars[i] {
                                '{' => depth += 1,
                                '}' => {
                                    depth -= 1;
                                    if depth == 0 {
                                        i += 1; // skip closing `}`
                                        break;
                                    }
                                }
                                // Handle nested template literals
                                '`' => {
                                    i += 1;
                                    // Skip nested template literal
                                    let mut nested_depth = 0;
                                    while i < len && (chars[i] != '`' || nested_depth > 0) {
                                        if chars[i] == '$' && i + 1 < len && chars[i + 1] == '{' {
                                            nested_depth += 1;
                                            i += 2;
                                        } else if chars[i] == '}' && nested_depth > 0 {
                                            nested_depth -= 1;
                                            i += 1;
                                        } else if chars[i] == '\\' && i + 1 < len {
                                            i += 2;
                                        } else {
                                            i += 1;
                                        }
                                    }
                                    if i < len {
                                        i += 1; // skip closing backtick
                                    }
                                    continue;
                                }
                                '\'' | '"' => {
                                    // Strip string content inside expression
                                    let quote = chars[i];
                                    i += 1;
                                    while i < len && chars[i] != quote {
                                        if chars[i] == '\\' && i + 1 < len {
                                            result[i] = ' ';
                                            result[i + 1] = ' ';
                                            i += 2;
                                        } else {
                                            result[i] = ' ';
                                            i += 1;
                                        }
                                    }
                                    if i < len {
                                        i += 1;
                                    }
                                    continue;
                                }
                                _ => {}
                            }
                            i += 1;
                        }
                    } else {
                        // Regular text in template literal - blank it out
                        result[i] = ' ';
                        i += 1;
                    }
                }
                if i < len {
                    i += 1; // skip closing backtick
                }
            }
            // Skip escaped characters outside strings
            '\\' if i + 1 < len => {
                i += 2;
            }
            _ => {
                i += 1;
            }
        }
    }

    result.into_iter().collect()
}

/// Strip non-shorthand, non-computed object property keys from code.
///
/// In `{ details: null }`, `details` is a property key and not a variable reference.
/// In `{ details }` (shorthand), `details` IS a variable reference.
///
/// This function replaces property key identifiers with spaces to avoid false positive
/// dependency detection. It handles:
/// - `{ key: value }` -> `{     value }` (non-shorthand key blanked)
/// - `{ key }` -> `{ key }` (shorthand preserved)
/// - `{ [expr]: value }` -> `{ [expr]: value }` (computed preserved)
fn strip_object_property_keys(code: &str) -> String {
    let chars: Vec<char> = code.chars().collect();
    let len = chars.len();
    let mut result: Vec<char> = chars.clone();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = '"';

    while i < len {
        let c = chars[i];

        // Handle string literals
        if !in_string && (c == '\'' || c == '"' || c == '`') {
            in_string = true;
            string_char = c;
            i += 1;
            continue;
        }
        if in_string {
            if c == '\\' {
                i += 2;
                continue;
            }
            if c == string_char {
                in_string = false;
            }
            i += 1;
            continue;
        }

        // Look for patterns like: identifier followed by `:` followed by non-`:` (not shorthand)
        // This matches `key: value` in object literals but NOT `key` in shorthand properties.
        // We need to be careful not to match ternary operators or labels.
        if c.is_alphabetic() || c == '_' || c == '$' {
            let id_start = i;
            // Read the identifier
            while i < len && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$') {
                i += 1;
            }
            let id_end = i;

            // Skip whitespace
            let mut j = i;
            while j < len && chars[j].is_whitespace() {
                j += 1;
            }

            // Check if followed by `:` but NOT `::` (not a label in a switch, not ternary)
            if j < len && chars[j] == ':' && (j + 1 >= len || chars[j + 1] != ':') {
                // Check what comes BEFORE the identifier to see if this is in an object context.
                // We look for `{`, `,`, or newline before the identifier (skipping whitespace).
                let mut k = id_start;
                while k > 0 && chars[k - 1].is_whitespace() {
                    k -= 1;
                }
                let in_object_context = k == 0
                    || (k > 0
                        && (chars[k - 1] == '{' || chars[k - 1] == ',' || chars[k - 1] == '\n'));

                if in_object_context {
                    // This looks like a property key - blank it out
                    for ch in result.iter_mut().take(id_end).skip(id_start) {
                        *ch = ' ';
                    }
                }
            }
            continue;
        }

        i += 1;
    }

    result.into_iter().collect()
}

/// Strip out function/arrow expression bodies where the identifier is declared as a parameter.
/// This replaces the function body (including the function itself) with empty space,
/// leaving only the parts of the code that don't shadow the identifier.
///
/// Handles patterns like:
/// - `function (a) { ... }` -> `                   `
/// - `(a) => { ... }` -> `              `
/// - `(a) => expr` -> `            `
fn strip_function_scopes_that_shadow(body: &str, identifier: &str) -> String {
    let mut result = body.to_string();

    // Pattern: `function identifier(params) { body }` or `function (params) { body }`
    // where params contain our identifier
    let fn_patterns = [
        format!("function ({}", identifier),
        format!("function({}", identifier),
    ];

    for pat in &fn_patterns {
        while let Some(pos) = result.find(pat.as_str()) {
            // Verify the identifier is actually a parameter (followed by `,` or `)`)
            let after_ident = pos + pat.len();
            if after_ident < result.len() {
                let next_char = result.as_bytes()[after_ident] as char;
                if next_char != ',' && next_char != ')' && next_char != ' ' {
                    // Not a word boundary - the pattern is a prefix of a longer name
                    // Replace just this occurrence to prevent infinite loop
                    result.replace_range(pos..pos + 1, " ");
                    continue;
                }
            }

            // Find the opening brace of the function body
            let after_pat = &result[after_ident..];
            let mut found_paren_close = false;
            let mut brace_start = None;
            let mut depth = 1; // We're inside the opening (
            for (i, ch) in after_pat.char_indices() {
                if !found_paren_close {
                    match ch {
                        '(' => depth += 1,
                        ')' => {
                            depth -= 1;
                            if depth == 0 {
                                found_paren_close = true;
                            }
                        }
                        _ => {}
                    }
                } else if ch == '{' {
                    brace_start = Some(after_ident + i);
                    break;
                } else if !ch.is_whitespace() {
                    break;
                }
            }

            if let Some(brace_pos) = brace_start {
                // Find matching closing brace
                let mut brace_depth = 1;
                let mut in_string = false;
                let mut string_char = ' ';
                let mut end_pos = brace_pos + 1;
                for (i, ch) in result[brace_pos + 1..].char_indices() {
                    if in_string {
                        if ch == '\\' {
                            // Skip next char
                            continue;
                        }
                        if ch == string_char {
                            in_string = false;
                        }
                    } else {
                        match ch {
                            '"' | '\'' | '`' => {
                                in_string = true;
                                string_char = ch;
                            }
                            '{' => brace_depth += 1,
                            '}' => {
                                brace_depth -= 1;
                                if brace_depth == 0 {
                                    end_pos = brace_pos + 1 + i + 1;
                                    break;
                                }
                            }
                            _ => {}
                        }
                    }
                }

                // Replace the entire function (from `function` keyword to closing brace) with spaces
                let spaces = " ".repeat(end_pos - pos);
                result.replace_range(pos..end_pos, &spaces);
            } else {
                // No brace found - just break to prevent infinite loop
                break;
            }
        }
    }

    // Also handle arrow functions: `(identifier) => { ... }` or `(identifier, ...) => { ... }`
    // and `identifier => { ... }` or `identifier => expr`
    // This is more complex, so we handle the common patterns
    let arrow_param_patterns = [
        format!("({}", identifier),
        // Simple single-param arrow: `identifier =>`
    ];

    for pat in &arrow_param_patterns {
        let mut search_from = 0;
        while let Some(p) = result[search_from..].find(pat.as_str()) {
            let pos = search_from + p;

            // For `(identifier` pattern, verify it's a parameter
            let after_ident = pos + pat.len();
            if after_ident >= result.len() {
                break;
            }
            let next_char = result.as_bytes()[after_ident] as char;
            if next_char != ',' && next_char != ')' && next_char != ' ' {
                search_from = pos + 1;
                continue;
            }

            // Check if preceded by `function` keyword - already handled above
            let before = result[..pos].trim_end();
            if before.ends_with("function") {
                search_from = pos + 1;
                continue;
            }

            // Find `) =>`  after the params
            let after_params = &result[after_ident..];
            let mut paren_depth = 1;
            let mut paren_close_idx = None;
            for (i, ch) in after_params.char_indices() {
                match ch {
                    '(' => paren_depth += 1,
                    ')' => {
                        paren_depth -= 1;
                        if paren_depth == 0 {
                            paren_close_idx = Some(after_ident + i);
                            break;
                        }
                    }
                    _ => {}
                }
            }

            if let Some(paren_close) = paren_close_idx {
                // Look for `=>` after `)`
                let after_paren = result[paren_close + 1..].trim_start();
                if after_paren.starts_with("=>") {
                    let arrow_pos = result[paren_close + 1..].find("=>").unwrap() + paren_close + 1;
                    let body_start = arrow_pos + 2;
                    let body_text = result[body_start..].trim_start();
                    let body_offset = body_start + (result[body_start..].len() - body_text.len());

                    if body_text.starts_with('{') {
                        // Block body arrow - find matching brace
                        let mut brace_depth = 1;
                        let mut in_string = false;
                        let mut string_char = ' ';
                        let mut end_pos = body_offset + 1;
                        for (i, ch) in result[body_offset + 1..].char_indices() {
                            if in_string {
                                if ch == '\\' {
                                    continue;
                                }
                                if ch == string_char {
                                    in_string = false;
                                }
                            } else {
                                match ch {
                                    '"' | '\'' | '`' => {
                                        in_string = true;
                                        string_char = ch;
                                    }
                                    '{' => brace_depth += 1,
                                    '}' => {
                                        brace_depth -= 1;
                                        if brace_depth == 0 {
                                            end_pos = body_offset + 1 + i + 1;
                                            break;
                                        }
                                    }
                                    _ => {}
                                }
                            }
                        }
                        let spaces = " ".repeat(end_pos - pos);
                        result.replace_range(pos..end_pos, &spaces);
                    } else {
                        // Expression body arrow - harder to determine end
                        // Just skip for now, expression arrows are less common in $: statements
                        search_from = body_offset;
                    }
                } else {
                    search_from = paren_close + 1;
                }
            } else {
                search_from = pos + 1;
            }
        }
    }

    result
}

/// Recursively check if an identifier is read (not just assigned to) in a body of code.
/// Handles block statements, if/else blocks, and compound statements.
fn body_references_identifier_recursive(body: &str, identifier: &str, re: &regex::Regex) -> bool {
    let trimmed = body.trim();

    if !re.is_match(trimmed) {
        return false;
    }

    // Handle block statements: strip outer braces and process inner content
    if trimmed.starts_with('{') && trimmed.ends_with('}') {
        let inner = &trimmed[1..trimmed.len() - 1];
        return body_references_identifier_in_statements(inner, identifier, re);
    }

    // Handle if/else statements: check the condition AND body blocks recursively
    if let Some(stripped) = trimmed.strip_prefix("if") {
        let after_if = stripped.trim();
        if after_if.starts_with('(') {
            // Find matching closing paren for the condition
            let mut depth = 0i32;
            let mut cond_end = None;
            for (i, ch) in after_if.char_indices() {
                match ch {
                    '(' => depth += 1,
                    ')' => {
                        depth -= 1;
                        if depth == 0 {
                            cond_end = Some(i);
                            break;
                        }
                    }
                    _ => {}
                }
            }
            if let Some(cond_end_idx) = cond_end {
                let condition = &after_if[1..cond_end_idx];
                let after_cond = after_if[cond_end_idx + 1..].trim();

                // Check if identifier is in the condition (always a read)
                if re.is_match(condition) {
                    return true;
                }

                // Extract the if-block body and check recursively
                if after_cond.starts_with('{') {
                    // Block body
                    let mut brace_depth = 0i32;
                    let mut block_end = None;
                    for (i, ch) in after_cond.char_indices() {
                        match ch {
                            '{' => brace_depth += 1,
                            '}' => {
                                brace_depth -= 1;
                                if brace_depth == 0 {
                                    block_end = Some(i);
                                    break;
                                }
                            }
                            _ => {}
                        }
                    }
                    if let Some(block_end_idx) = block_end {
                        let if_body = &after_cond[..block_end_idx + 1];
                        if body_references_identifier_recursive(if_body, identifier, re) {
                            return true;
                        }
                        // Check else branch if present
                        let remainder = after_cond[block_end_idx + 1..].trim();
                        if let Some(else_part) = remainder.strip_prefix("else") {
                            return body_references_identifier_recursive(
                                else_part.trim(),
                                identifier,
                                re,
                            );
                        }
                    }
                } else {
                    // Single-statement if body (no braces)
                    // In this case, just check the statement
                    return check_identifier_in_statement(after_cond, identifier, re);
                }

                return false;
            }
        }
    }

    // For simple (non-block, non-if) bodies, check for assignment pattern
    check_identifier_in_statement(trimmed, identifier, re)
}

/// Check if an identifier is referenced as a read across multiple statements.
fn body_references_identifier_in_statements(
    content: &str,
    identifier: &str,
    re: &regex::Regex,
) -> bool {
    // Split by semicolons and newlines, but be careful with nested blocks
    // Simple approach: scan for statements at depth 0
    let mut depth = 0;
    let mut start = 0;
    let chars: Vec<char> = content.chars().collect();

    for i in 0..chars.len() {
        match chars[i] {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => {
                if depth > 0 {
                    depth -= 1;
                }
            }
            ';' | '\n' if depth == 0 => {
                let stmt = content[start..i].trim();
                if !stmt.is_empty() && check_identifier_in_statement(stmt, identifier, re) {
                    return true;
                }
                start = i + 1;
            }
            _ => {}
        }
    }

    // Check the last statement
    let stmt = content[start..].trim();
    if !stmt.is_empty() && check_identifier_in_statement(stmt, identifier, re) {
        return true;
    }

    false
}

/// Check if an identifier appears as a read (not just assignment target) in a single statement.
fn check_identifier_in_statement(stmt: &str, identifier: &str, re: &regex::Regex) -> bool {
    if !re.is_match(stmt) {
        return false;
    }

    // Check for simple assignment pattern: `identifier = expr`
    if let Some(eq_pos) = find_assignment_position(stmt) {
        let lhs = &stmt[..eq_pos];
        let rhs = &stmt[eq_pos + 1..];

        // If the LHS contains `?`, this is likely a ternary expression where the
        // first `=` was found inside a ternary branch (e.g., `cond ? x = a : x = b`).
        // In this case, don't treat it as a simple assignment. Instead, analyze the
        // ternary condition and branches separately.
        if lhs.contains('?') {
            // Find the `?` position to extract the condition
            if let Some(q_pos) = lhs.find('?') {
                let condition = lhs[..q_pos].trim();
                // Check if identifier is read in the condition
                if re.is_match(condition) {
                    return true;
                }
                // The rest is the true-branch assignment and the false-branch (in rhs after `:`)
                let true_branch_lhs = lhs[q_pos + 1..].trim();
                // `rhs` is something like `Sub : component = banana`
                // Check if identifier is the assignment target in both branches
                // True branch: `true_branch_lhs = <rhs_before_colon>`
                // False branch: `<rhs_after_colon_lhs> = <rhs_after_colon_rhs>`
                if let Some(colon_pos) = find_colon_at_depth0(rhs) {
                    let true_rhs = rhs[..colon_pos].trim();
                    let false_branch = rhs[colon_pos + 1..].trim();

                    // Check if identifier appears in true branch RHS (a read)
                    if re.is_match(true_rhs) {
                        return true;
                    }

                    // Parse false branch as an assignment
                    if let Some(false_eq_pos) = find_assignment_position(false_branch) {
                        let false_lhs = false_branch[..false_eq_pos].trim();
                        let false_rhs = false_branch[false_eq_pos + 1..].trim();

                        // Check if identifier appears in false branch RHS (a read)
                        if re.is_match(false_rhs) {
                            return true;
                        }

                        // If identifier is the assignment target in both branches, it's not a read
                        if true_branch_lhs == identifier && false_lhs == identifier {
                            return false;
                        }
                    }
                }

                // Fall through to default: treat as read
                return true;
            }
        }

        // If identifier appears on the RHS, it's definitely a read/dependency
        if re.is_match(rhs) {
            return true;
        }

        // Also check for spread syntax: `...identifier` in the RHS.
        // The regex excludes `.` as a valid preceding character (to avoid matching
        // property accesses like `obj.prop`), but `...` is a spread operator, not
        // a property access. Check for `...identifier` patterns explicitly.
        {
            let spread_pattern = format!("...{}", identifier);
            if rhs.contains(&spread_pattern) {
                // Verify the char after identifier is a word boundary
                let after_pos = rhs.find(&spread_pattern).unwrap() + spread_pattern.len();
                if after_pos >= rhs.len()
                    || !rhs[after_pos..]
                        .starts_with(|c: char| c.is_alphanumeric() || c == '_' || c == '$')
                {
                    return true;
                }
            }
        }

        // If identifier is the entire LHS (sole assignment target), it's NOT a read
        if lhs.trim() == identifier {
            return false;
        }

        // If identifier appears on the LHS but is not the whole LHS (e.g., `foo.bar = x`
        // and identifier is `foo`), check whether it's ONLY being mutated (base of member
        // expression) or also read somewhere.
        // A mutation target like `foo` in `foo.bar = x` is NOT a dependency UNLESS
        // `foo` also appears on the RHS.
        if re.is_match(lhs) {
            // Check if the identifier is the base of a member expression on the LHS.
            // i.e., lhs starts with `identifier.` or `identifier[`
            let lhs_trimmed = lhs.trim();
            let is_mutation_base = lhs_trimmed.starts_with(&format!("{}.", identifier))
                || lhs_trimmed.starts_with(&format!("{}[", identifier));
            if is_mutation_base {
                // Only a mutation - not a dependency unless also used on RHS
                // (RHS check was done above and returned false if found there)
                return false;
            }
            // Otherwise (e.g., nested member expression like `obj.foo.bar = x` and identifier
            // is `foo`), treat as a read
            return true;
        }

        return false;
    }

    // No simple assignment found - the identifier is used in some other context
    // (function call, condition, etc.) - treat as a read
    true
}

/// Check if a string starts with a JavaScript control-flow keyword.
///
/// When `find_assignment_position` returns a position, the text to the left is
/// the "LHS". If that LHS begins with a keyword such as `if`, `for`, `while`,
/// `do`, `switch`, or `try`, then the `=` is actually inside a nested
/// statement and not a top-level assignment.
fn lhs_starts_with_keyword(lhs: &str) -> bool {
    let lhs = lhs.trim();
    for keyword in &[
        "if ", "if(", "for ", "for(", "while ", "while(", "do ", "do{", "switch ", "switch(",
        "try ", "try{",
    ] {
        if lhs.starts_with(keyword) {
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

/// Find the position of a `:` at depth 0 in an expression.
/// This is used to split ternary expressions like `true_rhs : false_branch`.
fn find_colon_at_depth0(expr: &str) -> Option<usize> {
    let chars: Vec<char> = expr.chars().collect();
    let mut depth = 0;
    let mut i = 0;

    while i < chars.len() {
        match chars[i] {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            ':' if depth == 0 => return Some(i),
            '\'' | '"' => {
                // Skip string literals
                let quote = chars[i];
                i += 1;
                while i < chars.len() && chars[i] != quote {
                    if chars[i] == '\\' && i + 1 < chars.len() {
                        i += 1;
                    }
                    i += 1;
                }
            }
            '`' => {
                // Skip template literals
                i += 1;
                while i < chars.len() && chars[i] != '`' {
                    if chars[i] == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
                        depth += 1;
                        i += 1;
                    } else if chars[i] == '}' && depth > 0 {
                        depth -= 1;
                    } else if chars[i] == '\\' && i + 1 < chars.len() {
                        i += 1;
                    }
                    i += 1;
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Extract the base identifier from a member expression like `obj.foo` or `arr[idx]`.
///
/// Returns the base identifier name if the input starts with a valid identifier followed
/// by `.` or `[`. Returns `None` if the input is not a simple member expression.
///
/// # Examples
///
/// - `"obj.foo"` → `Some("obj")`
/// - `"arr[idx]"` → `Some("arr")`
/// - `"obj"` → `None` (no member separator)
/// - `".foo"` → `None` (empty base)
fn extract_member_expression_base(lhs: &str) -> Option<&str> {
    let lhs = lhs.trim();
    let sep_pos = lhs.find('.').or_else(|| lhs.find('['));
    if let Some(pos) = sep_pos {
        let base = &lhs[..pos];
        // Must be a valid identifier (alphanumeric, underscore, dollar sign)
        // and non-empty
        if !base.is_empty()
            && base
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
            && base
                .chars()
                .next()
                .map(|c| !c.is_ascii_digit())
                .unwrap_or(false)
        {
            Some(base)
        } else {
            None
        }
    } else {
        None
    }
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

        // Track whether we're inside a string literal to avoid transforming
        // identifiers that happen to appear inside strings (e.g., 'paths updated')
        let mut in_string: Option<char> = None; // None or Some('\'') or Some('"') or Some('`')
        let mut template_brace_depth: Vec<i32> = Vec::new();

        while i < chars.len() {
            let c = chars[i];

            // Track string literal state
            if let Some(quote) = in_string {
                new_result.push(c);
                if c == '\\' && i + 1 < chars.len() {
                    // Skip escaped character
                    i += 1;
                    new_result.push(chars[i]);
                    i += 1;
                    continue;
                }
                if quote == '`' && c == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
                    // Enter template literal interpolation
                    new_result.push(chars[i + 1]);
                    template_brace_depth.push(0);
                    in_string = None;
                    i += 2;
                    continue;
                }
                if c == quote {
                    in_string = None;
                }
                i += 1;
                continue;
            }

            // Track template literal brace depth
            if !template_brace_depth.is_empty() {
                if c == '{' {
                    if let Some(depth) = template_brace_depth.last_mut() {
                        *depth += 1;
                    }
                } else if c == '}' {
                    let should_pop = template_brace_depth
                        .last()
                        .map(|d| *d == 0)
                        .unwrap_or(false);
                    if should_pop {
                        template_brace_depth.pop();
                        in_string = Some('`');
                        new_result.push(c);
                        i += 1;
                        continue;
                    } else if let Some(depth) = template_brace_depth.last_mut() {
                        *depth -= 1;
                    }
                }
            }

            // Check for string literal start
            if c == '\'' || c == '"' || c == '`' {
                in_string = Some(c);
                new_result.push(c);
                i += 1;
                continue;
            }

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
                    // Dot means property access (e.g., items.filter) - don't transform
                    // But allow spread operator (...filter)
                    if prev_char == '.' {
                        // Check if it's a spread operator (...)
                        i >= 3 && chars[i - 3..i].iter().collect::<String>() == "..."
                    } else {
                        !prev_char.is_alphanumeric() && prev_char != '_' && prev_char != '$'
                    }
                };

                // Check character after (must be non-identifier char)
                let after_idx = i + prop_name.len();
                let after_ok = if after_idx >= chars.len() {
                    true
                } else {
                    let next_char = chars[after_idx];
                    !next_char.is_alphanumeric() && next_char != '_' && next_char != '$'
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

                // Check if this identifier is shadowed by a function parameter
                let is_shadowed = is_shadowed_by_function_param(&chars, i, prop_name);

                if before_ok
                    && after_ok
                    && !is_update_target
                    && !is_assignment_target
                    && !is_inside_update_call
                    && !is_shadowed
                {
                    // Check if this is a shorthand property in an object literal.
                    // e.g., `{ value }` should become `{ value: value() }` not `{ value() }`
                    // because `{ value() }` is a method definition, not a property.
                    let is_shorthand = is_shorthand_object_property(&chars, i, prop_name.len());

                    if is_shorthand {
                        // Expand shorthand: { foo } -> { foo: foo() }
                        new_result.push_str(prop_name);
                        new_result.push_str(": ");
                        new_result.push_str(prop_name);
                        new_result.push_str("()");
                    } else {
                        // Replace with prop_name()
                        new_result.push_str(prop_name);
                        new_result.push_str("()");
                    }
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
    // Skip lines that are prop declarations (contain $.prop() or $.rest_props())
    // These are generated by transform_props_destructuring and should not be modified
    if expr.contains("$.prop(") || expr.contains("$.prop_source(") || expr.contains("$.rest_props(")
    {
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

                        // Check if object property key (not ternary operator)
                        // A property key follows `{`, `,`, or starts a line.
                        // The ternary colon `:` should not be confused with property colon.
                        let is_property_key = {
                            let after_idx2 = i + var_chars.len();
                            let mut k = after_idx2;
                            while k < chars.len() && chars[k].is_whitespace() {
                                k += 1;
                            }
                            let has_colon_after = k < chars.len() && chars[k] == ':';
                            if has_colon_after {
                                // Check if this is in an object literal context by looking
                                // at what precedes the identifier (skip whitespace).
                                let mut j = i;
                                while j > 0 && chars[j - 1].is_whitespace() {
                                    j -= 1;
                                }
                                let prev_char = if j > 0 { Some(chars[j - 1]) } else { None };
                                // Property keys follow `{`, `,`, or `\n` (for multi-line objects)
                                matches!(prev_char, Some('{') | Some(','))
                            } else {
                                false
                            }
                        };

                        // Check if shorthand property
                        let is_shorthand_property =
                            is_shorthand_object_property(&chars, i, var_chars.len());

                        // Check if shadowed (by function param, for loop var, or local var decl)
                        let is_shadowed = is_shadowed_by_function_param(&chars, i, var)
                            || is_shadowed_by_local_var_decl(&chars, i, var);

                        // Check if this identifier is the argument to $.update_prop() or
                        // $.update_pre_prop(). After transform_prop_update_expressions runs,
                        // `count++` becomes `$.update_prop(count)` and we must NOT convert
                        // the `count` argument to `count()` here.
                        let is_inside_update_call = new_result.ends_with("$.update_prop(")
                            || new_result.ends_with("$.update_pre_prop(");

                        // Check if this variable is the base of a member expression being
                        // assigned to, e.g., `foo[bar] = 1` or `foo.prop = value`.
                        // In that case, skip the read transform here and let
                        // transform_prop_assignments handle the full mutation wrapping
                        // (e.g., `foo(foo()[bar] = 1, true)`).
                        let is_member_mutation =
                            is_base_of_assigned_member(&chars, i, var_chars.len());

                        if !preceded_by_dot
                            && !in_param_position
                            && !is_assignment_target
                            && !is_getter_setter_name
                            && !is_property_key
                            && !is_shadowed
                            && !is_inside_update_call
                            && !is_member_mutation
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

/// Transform a `let` declaration that contains variables re-exported via `export { ... }`.
///
/// For example: `let a, b, c, d;` with `export { a, c }` becomes:
/// ```
/// let a = $.prop($$props, 'a', 8);
/// let b;
/// let c = $.prop($$props, 'c', 8);
/// let d;
/// ```
///
/// Returns `Some(transformed)` if the declaration contains any BindableProp vars,
/// or `None` if no transformation is needed.
fn transform_let_with_reexported_props(line: &str, analysis: &ComponentAnalysis) -> Option<String> {
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    let trimmed = line.trim();

    // Only handle `let` declarations (not `const`, `var`, etc.)
    if !trimmed.starts_with("let ") {
        return None;
    }

    let rest = trimmed[4..].trim();
    let rest = rest.trim_end_matches(';').trim();

    // Split by commas (respecting nesting)
    let declarators = split_declarators(rest);

    // Check if any declarator is a BindableProp (including destructured patterns)
    let has_any_prop = declarators.iter().any(|decl| {
        let decl = decl.trim();
        if decl.starts_with('{') || decl.starts_with('[') {
            // Destructured pattern - check if any extracted name is a BindableProp
            let names = extract_destructured_prop_names(decl);
            names.iter().any(|name| {
                analysis
                    .root
                    .find_binding_any_scope(name)
                    .and_then(|idx| analysis.root.bindings.get(idx))
                    .is_some_and(|b| b.kind == BindingKind::BindableProp)
            })
        } else {
            let name = if let Some(eq_pos) = decl.find('=') {
                decl[..eq_pos].trim()
            } else {
                decl
            };
            analysis
                .root
                .find_binding_any_scope(name)
                .and_then(|idx| analysis.root.bindings.get(idx))
                .is_some_and(|b| b.kind == BindingKind::BindableProp)
        }
    });

    if !has_any_prop {
        return None;
    }

    let mut results = Vec::new();

    for decl in declarators {
        let decl = decl.trim();
        if decl.is_empty() {
            continue;
        }

        // Handle destructured patterns: let { a, b, c } = { ... }
        if decl.starts_with('{') || decl.starts_with('[') {
            if let Some(pattern_end) = find_destructuring_pattern_end(decl) {
                let pattern = decl[..pattern_end].trim();
                let rhs_part = decl[pattern_end..].trim();
                if let Some(rhs) = rhs_part.strip_prefix('=') {
                    let rhs = rhs.trim().trim_end_matches(';').trim();
                    // Create a tmp variable and flatten the destructuring
                    results.push(format!("let tmp = {};", rhs));
                    if let Some(flattened) =
                        flatten_destructured_let_with_reexported_props(pattern, "tmp", analysis)
                    {
                        results.push(flattened);
                    } else {
                        // Fallback: keep original
                        results.push(format!("let {} = {};", pattern, rhs));
                    }
                    continue;
                }
            }
            // Fallback
            results.push(format!("let {};", decl));
            continue;
        }

        // Parse: name = value or just name
        let (name, value) = if let Some(eq_pos) = decl.find('=') {
            let n = decl[..eq_pos].trim();
            let v = decl[eq_pos + 1..].trim();
            // Remove trailing line comment if present
            let v = if let Some(comment_pos) = find_line_comment_position(v) {
                v[..comment_pos].trim()
            } else {
                v
            };
            let v = v.trim_end_matches(';').trim();
            (n, Some(v))
        } else {
            (decl, None)
        };

        // Check if this variable is a BindableProp
        let is_prop = analysis
            .root
            .find_binding_any_scope(name)
            .and_then(|idx| analysis.root.bindings.get(idx))
            .is_some_and(|b| b.kind == BindingKind::BindableProp);

        if is_prop {
            // Get the prop alias if any
            let prop_alias = analysis
                .root
                .find_binding_any_scope(name)
                .and_then(|idx| analysis.root.bindings.get(idx))
                .and_then(|b| b.prop_alias.as_deref());
            let prop_name = prop_alias.unwrap_or(name);

            if let Some(val) = value {
                // Check if the value is simple.
                // An identifier is NOT simple if it refers to another prop/state variable
                // because after transforms it would become a function call (e.g., v2 -> v2()).
                // The official compiler checks is_simple_expression on the VISITED (transformed)
                // expression, where prop identifiers become CallExpressions.
                let mut is_simple = is_simple_expression_str(val);
                // Track if the identifier refers to a prop (it will be a no-arg call after transform,
                // and the official compiler unwraps no-arg calls to just the callee)
                let mut is_prop_ref = false;
                if is_simple
                    && is_identifier_str(val)
                    && analysis
                        .root
                        .find_binding_any_scope(val)
                        .and_then(|idx| analysis.root.bindings.get(idx))
                        .is_some_and(|b| {
                            matches!(
                                b.kind,
                                BindingKind::BindableProp
                                    | BindingKind::Prop
                                    | BindingKind::State
                                    | BindingKind::RawState
                                    | BindingKind::Derived
                            )
                        })
                {
                    is_simple = false;
                    is_prop_ref = true;
                }
                let flags = calculate_prop_flags(name, analysis, !is_simple);
                if is_simple {
                    results.push(format!(
                        "let {} = $.prop($$props, '{}', {}, {});",
                        name, prop_name, flags, val
                    ));
                } else if is_prop_ref {
                    // Prop/state identifier: after transform it becomes val() (no-arg call).
                    // The official compiler unwraps no-arg calls to just the callee,
                    // so we pass the identifier directly.
                    results.push(format!(
                        "let {} = $.prop($$props, '{}', {}, {});",
                        name, prop_name, flags, val
                    ));
                } else {
                    let lazy_arg = make_lazy_prop_arg(val);
                    results.push(format!(
                        "let {} = $.prop($$props, '{}', {}, {});",
                        name, prop_name, flags, lazy_arg
                    ));
                }
            } else {
                let flags = calculate_prop_flags(name, analysis, false);
                results.push(format!(
                    "let {} = $.prop($$props, '{}', {});",
                    name, prop_name, flags
                ));
            }
        } else {
            // Non-exported variable, keep as-is
            if let Some(val) = value {
                results.push(format!("let {} = {};", name, val));
            } else {
                results.push(format!("let {};", name));
            }
        }
    }

    Some(results.join("\n"))
}

/// Apply prop source read transformations inside the default value of $.prop() calls.
///
/// `wrap_prop_source_reads` skips lines containing `$.prop(`, so this function specifically
/// handles the default value expressions inside `$.prop($$props, 'name', flags, DEFAULT)`.
/// This is needed when export-let default values contain references to other props,
/// e.g.: `export let click_1 = () => { logs.push('click_1'); }`
/// where `logs` is a prop and should become `logs()` inside the default value.
fn apply_prop_reads_in_prop_default_values(line: &str, prop_vars: &[String]) -> String {
    // Split $.prop() calls into prefix + default-value + suffix, transform the default value only.
    // The pattern is: $.prop($$props, 'name', N, DEFAULT)
    // We find each $.prop( and extract the 4th argument.
    let mut result = String::new();
    let mut search_from = 0;

    while let Some(prop_pos) = line[search_from..].find("$.prop(") {
        let abs_pos = search_from + prop_pos;

        // Copy everything before this $.prop( unchanged
        result.push_str(&line[search_from..abs_pos]);

        // Parse the $.prop(...) call to find the 4th argument
        let after_prop = &line[abs_pos + 7..]; // after "$.prop("
        let chars: Vec<char> = after_prop.chars().collect();
        let mut i = 0;
        let mut depth = 1i32;
        let mut arg_count = 0;
        let mut fourth_arg_start: Option<usize> = None;
        let mut fourth_arg_end: Option<usize> = None;
        let mut in_string: Option<char> = None;
        let mut char_byte_positions: Vec<usize> = Vec::new();

        // Build char→byte mapping
        {
            let mut byte_pos = 0;
            for ch in after_prop.chars() {
                char_byte_positions.push(byte_pos);
                byte_pos += ch.len_utf8();
            }
            char_byte_positions.push(byte_pos);
        }

        while i < chars.len() {
            let c = chars[i];

            // Handle strings
            if let Some(quote) = in_string {
                if c == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if c == quote {
                    in_string = None;
                }
                i += 1;
                continue;
            }

            match c {
                '"' | '\'' | '`' => {
                    in_string = Some(c);
                }
                '(' | '[' | '{' => depth += 1,
                ')' | ']' | '}' => {
                    depth -= 1;
                    if depth == 0 {
                        // End of $.prop() call
                        if fourth_arg_start.is_some() {
                            fourth_arg_end = Some(i);
                        }
                        break;
                    }
                }
                ',' if depth == 1 => {
                    arg_count += 1;
                    if arg_count == 3 {
                        // The 4th argument starts after this comma
                        // Skip any whitespace
                        let mut j = i + 1;
                        while j < chars.len() && chars[j].is_whitespace() {
                            j += 1;
                        }
                        fourth_arg_start = Some(j);
                    }
                }
                _ => {}
            }
            i += 1;
        }

        // Now reconstruct the $.prop() call with transformed 4th arg
        if let (Some(start_char), Some(end_char)) = (fourth_arg_start, fourth_arg_end) {
            let start_byte = char_byte_positions[start_char];
            let end_byte = char_byte_positions[end_char];
            let before_default = &after_prop[..start_byte];
            let default_val = &after_prop[start_byte..end_byte];
            let _after_default = &after_prop[end_byte..];

            let transformed_default = wrap_prop_source_reads(default_val, prop_vars);
            result.push_str("$.prop(");
            result.push_str(before_default);
            result.push_str(&transformed_default);
            // Continue parsing from after the closing paren
            let close_byte = char_byte_positions[end_char + 1];
            result.push_str(&after_prop[end_byte..close_byte]);
            search_from = abs_pos + 7 + close_byte;
        } else {
            // No 4th arg found, copy $.prop(...) as-is
            result.push_str("$.prop(");
            // Find where the $.prop() call ends
            if let Some(end_char) = {
                let mut ec = None;
                let mut d = 1i32;
                let mut s: Option<char> = None;
                for (ci, ch) in chars.iter().enumerate() {
                    if let Some(q) = s {
                        if *ch == q {
                            s = None;
                        }
                        continue;
                    }
                    match ch {
                        '"' | '\'' | '`' => s = Some(*ch),
                        '(' | '[' | '{' => d += 1,
                        ')' | ']' | '}' => {
                            d -= 1;
                            if d == 0 {
                                ec = Some(ci);
                                break;
                            }
                        }
                        _ => {}
                    }
                }
                ec
            } {
                let end_byte = char_byte_positions[end_char + 1];
                result.push_str(&after_prop[..end_byte]);
                search_from = abs_pos + 7 + end_byte;
            } else {
                result.push_str(after_prop);
                search_from = line.len();
            }
        }
    }

    // Copy remaining
    result.push_str(&line[search_from..]);
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

            // Check if the value is a store accessor (e.g., $foo)
            // Store accessors like $foo become $foo() calls after transformation.
            // The official compiler handles this by passing the store getter function
            // directly with PROPS_IS_LAZY_INITIAL set (same as no-arg call expressions).
            let is_store_accessor = value.starts_with('$')
                && value.len() > 1
                && value[1..].chars().all(|c| c.is_alphanumeric() || c == '_')
                && analysis
                    .root
                    .bindings
                    .iter()
                    .any(|b| b.name == value && matches!(b.kind, BindingKind::StoreSub));

            if is_store_accessor {
                // Store accessor: pass the getter function directly with PROPS_IS_LAZY_INITIAL
                let flags = calculate_prop_flags(name, analysis, true);
                results.push(format!(
                    "let {} = $.prop($$props, '{}', {}, {});",
                    name, name, flags, value
                ));
            } else {
                // Check if the value is a "simple expression" that can be passed directly
                // Non-simple expressions need to be wrapped in a thunk and use PROPS_IS_LAZY_INITIAL
                let mut is_simple = is_simple_expression_str(value);
                // An identifier is NOT simple if it refers to another prop/state variable
                // because after transforms it would become a function call (e.g., v2 -> v2()).
                let mut is_prop_ref = false;
                if is_simple
                    && is_identifier_str(value)
                    && analysis
                        .root
                        .find_binding_any_scope(value)
                        .and_then(|idx| analysis.root.bindings.get(idx))
                        .is_some_and(|b| {
                            matches!(
                                b.kind,
                                BindingKind::BindableProp
                                    | BindingKind::Prop
                                    | BindingKind::State
                                    | BindingKind::RawState
                                    | BindingKind::Derived
                            )
                        })
                {
                    is_simple = false;
                    is_prop_ref = true;
                }

                // Calculate flags: PROPS_IS_BINDABLE + PROPS_IS_UPDATED + PROPS_IS_LAZY_INITIAL
                let flags = calculate_prop_flags(name, analysis, !is_simple);

                if is_simple {
                    results.push(format!(
                        "let {} = $.prop($$props, '{}', {}, {});",
                        name, name, flags, value
                    ));
                } else if is_prop_ref {
                    // Prop/state identifier: pass directly (official compiler unwraps no-arg calls)
                    results.push(format!(
                        "let {} = $.prop($$props, '{}', {}, {});",
                        name, name, flags, value
                    ));
                } else {
                    // Wrap non-simple values in a thunk: () => value
                    // When value starts with '{', wrap in parens to prevent
                    // OXC from parsing `() => {...}` as arrow with block body
                    // instead of arrow returning object literal
                    let lazy_arg = make_lazy_prop_arg(value);
                    results.push(format!(
                        "let {} = $.prop($$props, '{}', {}, {});",
                        name, name, flags, lazy_arg
                    ));
                }
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

/// Transform destructured `export let { ... } = expr` patterns into flattened
/// `$.prop()` calls with path-based accessors.
///
/// Corresponds to the official Svelte compiler's `extract_paths` pattern used in
/// `VariableDeclaration.js` to flatten destructuring.
///
/// Example:
///   `export let { a, b: { c }, e: [e_one], g = default_g } = THING`
/// becomes:
///   `let tmp = THING,
///       $$array = $.derived(() => $.to_array(tmp.e, 1)),
///       a = $.prop($$props, 'a', 24, () => tmp.a),
///       c = $.prop($$props, 'c', 24, () => tmp.b.c),
///       e_one = $.prop($$props, 'e_one', 24, () => $.get($$array)[0]),
///       g = $.prop($$props, 'g', 24, () => $.fallback(tmp.g, default_g));`
fn transform_destructured_export_let(
    statement: &str,
    analysis: &ComponentAnalysis,
) -> Option<String> {
    let trimmed = statement.trim();
    let rest = trimmed.strip_prefix("export let ")?.trim();

    // Find the `= RHS` assignment
    // We need to find the `=` that separates the pattern from the RHS value
    // The pattern can contain `=` for default values, so we need to find the
    // `=` that is at the top level outside the pattern
    let pattern_end = find_destructuring_pattern_end(rest)?;
    let pattern = rest[..pattern_end].trim();
    let rhs_part = rest[pattern_end..].trim();
    let rhs = rhs_part.strip_prefix('=')?.trim();
    let rhs = rhs.trim_end_matches(';').trim();

    let mut declarations = Vec::new();
    let mut array_counter = 0;

    // First declaration: tmp = RHS
    declarations.push(format!("tmp = {}", rhs));

    // Process the destructuring pattern
    extract_destructured_export_paths(
        pattern,
        "tmp",
        &mut declarations,
        &mut array_counter,
        analysis,
    )?;

    Some(format!("let {};", declarations.join(",\n\t")))
}

/// Find the end position of a destructuring pattern in `{ ... } = RHS` or `[ ... ] = RHS`.
/// Returns the position after the closing `}` or `]`.
fn find_destructuring_pattern_end(s: &str) -> Option<usize> {
    let s = s.trim();
    let first = s.chars().next()?;
    if first != '{' && first != '[' {
        return None;
    }

    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        if in_string {
            if chars[i] == '\\' {
                i += 2;
                continue;
            }
            if chars[i] == string_char {
                in_string = false;
            }
            i += 1;
            continue;
        }

        if chars[i] == '\'' || chars[i] == '"' || chars[i] == '`' {
            in_string = true;
            string_char = chars[i];
            i += 1;
            continue;
        }

        if chars[i] == '{' || chars[i] == '[' {
            depth += 1;
        } else if chars[i] == '}' || chars[i] == ']' {
            depth -= 1;
            if depth == 0 {
                return Some(i + 1);
            }
        }

        i += 1;
    }
    None
}

/// Recursively extract paths from a destructuring pattern for `export let` props.
fn extract_destructured_export_paths(
    pattern: &str,
    base_path: &str,
    declarations: &mut Vec<String>,
    array_counter: &mut usize,
    analysis: &ComponentAnalysis,
) -> Option<()> {
    let pattern = pattern.trim();

    if pattern.starts_with('{') && pattern.ends_with('}') {
        // Object destructuring
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_destructuring_properties(inner);

        for prop in properties {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }

            // Handle rest element: ...rest
            if let Some(rest_name) = prop.strip_prefix("...") {
                let rest_name = rest_name.trim();
                let flags = calculate_prop_flags(rest_name, analysis, true);
                // Rest elements need special handling
                let body = format!(
                    "const {{ {} }} = {}; return {};",
                    rest_name, base_path, rest_name
                );
                declarations.push(format!(
                    "{} = $.prop($$props, '{}', {}, () => {{ {} }})",
                    rest_name, rest_name, flags, body
                ));
                continue;
            }

            // Check for default value: name = default
            // Check for rename: key: value
            if let Some((key, value_pattern)) = split_property_key_value(prop) {
                // Renamed property: key: value_pattern
                let new_path = format!("{}.{}", base_path, key);

                if value_pattern.starts_with('{') || value_pattern.starts_with('[') {
                    // Nested destructuring: b: { c, d: [...] }
                    extract_destructured_export_paths(
                        value_pattern,
                        &new_path,
                        declarations,
                        array_counter,
                        analysis,
                    )?;
                } else {
                    // Simple rename: b: c  or  b: c = default
                    let (binding_name, default_value) = split_binding_name_default(value_pattern);
                    let flags = calculate_prop_flags(binding_name, analysis, true);
                    if let Some(default_val) = default_value {
                        declarations.push(format!(
                            "{} = $.prop($$props, '{}', {}, () => $.fallback({}, {}))",
                            binding_name, binding_name, flags, new_path, default_val
                        ));
                    } else {
                        declarations.push(format!(
                            "{} = $.prop($$props, '{}', {}, () => {})",
                            binding_name, binding_name, flags, new_path
                        ));
                    }
                }
            } else {
                // Simple property: a  or  a = default
                let (binding_name, default_value) = split_binding_name_default(prop);
                let new_path = format!("{}.{}", base_path, binding_name);
                let flags = calculate_prop_flags(binding_name, analysis, true);
                if let Some(default_val) = default_value {
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => $.fallback({}, {}))",
                        binding_name, binding_name, flags, new_path, default_val
                    ));
                } else {
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => {})",
                        binding_name, binding_name, flags, new_path
                    ));
                }
            }
        }
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        // Array destructuring
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_destructuring_properties(inner);
        let _non_empty_count = elements.iter().filter(|e| !e.trim().is_empty()).count();
        let total_count = elements.len(); // include holes for array length

        // Create an $$array derived for array conversion
        let array_var = if *array_counter == 0 {
            "$$array".to_string()
        } else {
            format!("$$array_{}", array_counter)
        };
        *array_counter += 1;

        declarations.push(format!(
            "{} = $.derived(() => $.to_array({}, {}))",
            array_var, base_path, total_count
        ));

        for (idx, elem) in elements.iter().enumerate() {
            let elem = elem.trim();
            if elem.is_empty() {
                continue; // Skip holes
            }

            // Handle rest element: ...rest
            if let Some(rest_pattern) = elem.strip_prefix("...") {
                let rest_pattern = rest_pattern.trim();
                if rest_pattern.starts_with('{') || rest_pattern.starts_with('[') {
                    // Rest with nested destructuring
                    let slice_path = format!("$.get({}).slice({})", array_var, idx);
                    extract_destructured_export_paths(
                        rest_pattern,
                        &slice_path,
                        declarations,
                        array_counter,
                        analysis,
                    )?;
                } else {
                    let flags = calculate_prop_flags(rest_pattern, analysis, true);
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => $.get({}).slice({}))",
                        rest_pattern, rest_pattern, flags, array_var, idx
                    ));
                }
                continue;
            }

            let element_path = format!("$.get({})[{}]", array_var, idx);

            if elem.starts_with('{') || elem.starts_with('[') {
                // Nested destructuring in array
                extract_destructured_export_paths(
                    elem,
                    &element_path,
                    declarations,
                    array_counter,
                    analysis,
                )?;
            } else {
                // Simple element or with default
                let (binding_name, default_value) = split_binding_name_default(elem);
                let flags = calculate_prop_flags(binding_name, analysis, true);
                if let Some(default_val) = default_value {
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => $.fallback({}, {}))",
                        binding_name, binding_name, flags, element_path, default_val
                    ));
                } else {
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => {})",
                        binding_name, binding_name, flags, element_path
                    ));
                }
            }
        }
    } else {
        return None;
    }

    Some(())
}

/// Flatten a destructured `let { ... }` pattern where some bindings are re-exported.
/// Non-exported bindings become `name = tmp.prop`, exported bindings become `$.prop()` calls.
fn flatten_destructured_let_with_reexported_props(
    pattern: &str,
    base_path: &str,
    analysis: &ComponentAnalysis,
) -> Option<String> {
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    let pattern = pattern.trim();
    let mut declarations = Vec::new();

    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_destructuring_properties(inner);

        for prop in properties {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }

            if let Some((key, value_pattern)) = split_property_key_value(prop) {
                let new_path = format!("{}.{}", base_path, key);

                if value_pattern.starts_with('{') || value_pattern.starts_with('[') {
                    // Nested destructuring - recurse
                    if let Some(nested) = flatten_destructured_let_with_reexported_props(
                        value_pattern,
                        &new_path,
                        analysis,
                    ) {
                        declarations.push(nested);
                    }
                } else {
                    let (binding_name, default_value) = split_binding_name_default(value_pattern);
                    let is_prop = analysis
                        .root
                        .find_binding_any_scope(binding_name)
                        .and_then(|idx| analysis.root.bindings.get(idx))
                        .is_some_and(|b| b.kind == BindingKind::BindableProp);

                    if is_prop {
                        let flags = calculate_prop_flags(binding_name, analysis, true);
                        if let Some(default_val) = default_value {
                            declarations.push(format!(
                                "let {} = $.prop($$props, '{}', {}, () => $.fallback({}, {}));",
                                binding_name, binding_name, flags, new_path, default_val
                            ));
                        } else {
                            declarations.push(format!(
                                "let {} = $.prop($$props, '{}', {}, () => {});",
                                binding_name, binding_name, flags, new_path
                            ));
                        }
                    } else if let Some(default_val) = default_value {
                        declarations.push(format!(
                            "let {} = {} !== undefined ? {} : {};",
                            binding_name, new_path, new_path, default_val
                        ));
                    } else {
                        declarations.push(format!("let {} = {};", binding_name, new_path));
                    }
                }
            } else {
                let (binding_name, default_value) = split_binding_name_default(prop);
                let new_path = format!("{}.{}", base_path, binding_name);
                let is_prop = analysis
                    .root
                    .find_binding_any_scope(binding_name)
                    .and_then(|idx| analysis.root.bindings.get(idx))
                    .is_some_and(|b| b.kind == BindingKind::BindableProp);

                if is_prop {
                    let flags = calculate_prop_flags(binding_name, analysis, true);
                    if let Some(default_val) = default_value {
                        declarations.push(format!(
                            "let {} = $.prop($$props, '{}', {}, () => $.fallback({}, {}));",
                            binding_name, binding_name, flags, new_path, default_val
                        ));
                    } else {
                        declarations.push(format!(
                            "let {} = $.prop($$props, '{}', {}, () => {});",
                            binding_name, binding_name, flags, new_path
                        ));
                    }
                } else if let Some(default_val) = default_value {
                    declarations.push(format!(
                        "let {} = {} !== undefined ? {} : {};",
                        binding_name, new_path, new_path, default_val
                    ));
                } else {
                    declarations.push(format!("let {} = {};", binding_name, new_path));
                }
            }
        }
    } else {
        return None;
    }

    Some(declarations.join("\n"))
}

/// Split a property pattern into key and value parts around `:`.
/// Returns None if there's no `:` (simple property like `a` or `a = default`).
/// Handles nested patterns so `b: { c }` splits into `("b", "{ c }")`.
fn split_property_key_value(prop: &str) -> Option<(&str, &str)> {
    let chars: Vec<char> = prop.chars().collect();
    let mut depth = 0;
    for (i, &ch) in chars.iter().enumerate() {
        match ch {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ':' if depth == 0 => {
                return Some((prop[..i].trim(), prop[i + 1..].trim()));
            }
            _ => {}
        }
    }
    None
}

/// Split a binding name from its default value.
/// `name = default` -> `("name", Some("default"))`
/// `name` -> `("name", None)`
fn split_binding_name_default(s: &str) -> (&str, Option<&str>) {
    let s = s.trim();
    if let Some(eq_pos) = s.find('=') {
        // Make sure this isn't == or =>
        let after = s.get(eq_pos + 1..eq_pos + 2).unwrap_or("");
        if after == "=" || after == ">" {
            return (s, None);
        }
        (s[..eq_pos].trim(), Some(s[eq_pos + 1..].trim()))
    } else {
        (s, None)
    }
}

/// Split destructuring properties/elements by comma, respecting nesting depth.
fn split_destructuring_properties(s: &str) -> Vec<&str> {
    let chars: Vec<char> = s.chars().collect();
    let mut result = Vec::new();
    let mut depth = 0;
    let mut start = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &ch) in chars.iter().enumerate() {
        if in_string {
            if ch == '\\' {
                continue;
            }
            if ch == string_char {
                in_string = false;
            }
            continue;
        }
        if ch == '\'' || ch == '"' || ch == '`' {
            in_string = true;
            string_char = ch;
            continue;
        }
        match ch {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ',' if depth == 0 => {
                result.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    result.push(&s[start..]);
    result
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

/// Check if a string is a valid JavaScript identifier.
fn is_identifier_str(s: &str) -> bool {
    let trimmed = s.trim();
    let mut chars = trimmed.chars();
    match chars.next() {
        Some(first) if first.is_ascii_alphabetic() || first == '_' || first == '$' => {
            chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
        }
        _ => false,
    }
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
/// - Template literals: `hello`, `${x}` (TemplateLiteral != Literal in AST)
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

    // Template literals are NOT simple (even without expressions like `red`)
    // The official Svelte compiler only considers Literal, Identifier,
    // ArrowFunctionExpression, and FunctionExpression as simple.
    // TemplateLiteral is a different AST node type from Literal.
    if trimmed.starts_with('`') {
        return false;
    }

    // new expressions are NOT simple
    if trimmed.starts_with("new ") {
        return false;
    }

    // typeof expressions are NOT simple
    if trimmed.starts_with("typeof ") {
        return false;
    }

    // Member expressions (containing dots) are NOT simple
    if !trimmed.starts_with("function")
        && !trimmed.contains("=>")
        && !trimmed.starts_with('"')
        && !trimmed.starts_with('\'')
        && !trimmed.starts_with('`')
        && trimmed.contains('.')
        && trimmed.parse::<f64>().is_err()
    {
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
    // - Binary/logical expressions: a + b, a && b
    // - Conditional expressions: a ? b : c
    true
}

/// Create the argument for a lazy prop initializer.
fn make_lazy_prop_arg(value: &str) -> String {
    let trimmed = value.trim();
    if let Some(callee) = trimmed.strip_suffix("()") {
        let callee = callee.trim();
        if !callee.is_empty()
            && callee
                .chars()
                .next()
                .map(|c| c.is_alphabetic() || c == '_' || c == '$')
                .unwrap_or(false)
            && callee
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        {
            return callee.to_string();
        }
    }
    if trimmed.starts_with('{') {
        format!("() => ({})", trimmed)
    } else {
        format!("() => {}", trimmed)
    }
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
    read_only_props: &[(String, String)],
) -> Option<String> {
    let trimmed = line.trim();

    // Determine the original declaration keyword (let or const) to preserve it
    let decl_keyword = if trimmed.starts_with("let ") {
        "let"
    } else if trimmed.starts_with("const ") {
        "const"
    } else if trimmed.starts_with("var ") {
        "var"
    } else {
        return None;
    };

    // Check for identifier pattern: let/const/var props = $props()
    // Reference: VariableDeclaration.js lines 51-60
    // When $props() is assigned to a plain identifier (not destructured),
    // it always generates $.rest_props() with the standard exclusion list.
    if !trimmed.contains('{') && trimmed.contains("= $props()") {
        // Pattern: let props = $props()
        let decl_start = decl_keyword.len() + 1;
        let eq_pos = trimmed.find('=')?;
        let var_name = trimmed[decl_start..eq_pos].trim();

        let mut seen = vec!["'$$slots'", "'$$events'", "'$$legacy'"];
        if analysis.custom_element.is_some() {
            seen.push("'$$host'");
        }

        // Always generate $.rest_props() for identifier pattern (no is_prop_source check)
        return Some(format!(
            "{} {} = $.rest_props($$props, [{}]);\n",
            decl_keyword,
            var_name,
            seen.join(", ")
        ));
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

    // Track "seen" prop names for $.rest_props() exclusion list.
    // Reference: VariableDeclaration.js lines 45-46
    // Starts with internal prop names that should always be excluded.
    let mut seen: Vec<String> = vec![
        "$$slots".to_string(),
        "$$events".to_string(),
        "$$legacy".to_string(),
    ];
    if analysis.custom_element.is_some() {
        seen.push("$$host".to_string());
    }

    for prop_part in split_declarators(props_str) {
        let prop_part = prop_part.trim();
        if prop_part.is_empty() {
            continue;
        }

        // Handle rest element: ...rest
        // Reference: VariableDeclaration.js lines 96-107
        if let Some(rest_name) = prop_part.strip_prefix("...") {
            let rest_name = rest_name.trim();
            // Generate: rest_name = $.rest_props($$props, ['$$slots', '$$events', '$$legacy', ...seen_props])
            let seen_literals: Vec<String> = seen.iter().map(|s| format!("'{}'", s)).collect();
            declarators.push(format!(
                "{} = $.rest_props($$props, [{}])",
                rest_name,
                seen_literals.join(", ")
            ));
            continue;
        }

        // Handle: name = default_value (always generate for props with defaults)
        if let Some(eq_pos) = prop_part.find('=') {
            let name_part = prop_part[..eq_pos].trim();
            let raw_default_value = prop_part[eq_pos + 1..].trim();

            // Handle rename pattern: `originalProp: localVar = default`
            // In destructuring, `disabled: disabledProp = false` means:
            //   prop_name = "disabled" (the actual prop)
            //   local_name = "disabledProp" (the local variable)
            let (prop_name, local_name) = if let Some(colon_pos) = name_part.find(':') {
                let pn = name_part[..colon_pos].trim();
                // Strip surrounding quotes from prop name (e.g., 'weird-name': localVar)
                let pn = pn
                    .strip_prefix('\'')
                    .and_then(|s| s.strip_suffix('\''))
                    .or_else(|| pn.strip_prefix('"').and_then(|s| s.strip_suffix('"')))
                    .unwrap_or(pn);
                let ln = name_part[colon_pos + 1..].trim();
                (pn, ln)
            } else {
                (name_part, name_part)
            };

            // Strip $bindable() wrapper: $bindable(value) -> value
            // Reference: VariableDeclaration.js - unwrap_bindable()
            let was_bindable =
                raw_default_value.starts_with("$bindable(") && raw_default_value.ends_with(')');
            let default_value = if was_bindable {
                let inner = &raw_default_value[10..raw_default_value.len() - 1];
                if inner.is_empty() {
                    // $bindable() with no args - no default value
                    // Still need to generate $.prop() but without a default
                    seen.push(prop_name.to_string());
                    let flags = calculate_prop_flags(local_name, analysis, false);
                    declarators.push(format!(
                        "{} = $.prop($$props, '{}', {})",
                        local_name, prop_name, flags
                    ));
                    continue;
                }
                inner
            } else {
                raw_default_value
            };

            // Add this prop name to the "seen" list for rest_props exclusion
            seen.push(prop_name.to_string());

            // Transform default value: apply read-only prop substitutions
            let default_value = {
                let mut dv = default_value.to_string();
                if !read_only_props.is_empty() {
                    dv = transform_read_only_props(&dv, read_only_props);
                }
                if !prop_source_vars.is_empty() {
                    dv = wrap_prop_source_reads(&dv, prop_source_vars);
                }
                dv
            };
            let default_value = default_value.as_str();

            // Check if the TRANSFORMED default value is a simple expression
            let is_simple = is_simple_expression_str(default_value);

            // Calculate flags using the official logic
            let flags = calculate_prop_flags(local_name, analysis, !is_simple);

            // Check if the value needs $.proxy() wrapping.
            // Only $bindable() defaults get proxy-wrapped (similar to $state).
            // Regular prop defaults are not proxied.
            let needs_proxy = was_bindable
                && (default_value.trim().starts_with('[')
                    || default_value.trim().starts_with('{')
                    || default_value.trim().starts_with("new "));
            let proxy_wrapped = if needs_proxy {
                format!("$.proxy({})", default_value)
            } else {
                default_value.to_string()
            };

            if is_simple {
                declarators.push(format!(
                    "{} = $.prop($$props, '{}', {}, {})",
                    local_name, prop_name, flags, proxy_wrapped
                ));
            } else {
                // Wrap non-simple values in a thunk: () => value
                // When value starts with '{', wrap in parens to prevent
                // OXC from parsing `() => {...}` as arrow with block body
                let lazy_arg = make_lazy_prop_arg(&proxy_wrapped);
                declarators.push(format!(
                    "{} = $.prop($$props, '{}', {}, {})",
                    local_name, prop_name, flags, lazy_arg
                ));
            }
        } else {
            // No default value - handle rename pattern: `originalProp: localVar`
            let (prop_name, local_name) = if let Some(colon_pos) = prop_part.find(':') {
                let pn = prop_part[..colon_pos].trim();
                // Strip surrounding quotes from prop name
                let pn = pn
                    .strip_prefix('\'')
                    .and_then(|s| s.strip_suffix('\''))
                    .or_else(|| pn.strip_prefix('"').and_then(|s| s.strip_suffix('"')))
                    .unwrap_or(pn);
                let ln = prop_part[colon_pos + 1..].trim();
                (pn, ln)
            } else {
                (prop_part, prop_part)
            };

            // Add to seen list for rest_props exclusion
            seen.push(prop_name.to_string());

            // Only generate $.prop() if this is a source prop or exported
            let is_exported = exported_names.contains(&local_name.to_string());
            if prop_source_vars.contains(&local_name.to_string()) || is_exported {
                // Calculate flags using the official logic (no lazy initial for props without defaults)
                let flags = calculate_prop_flags(local_name, analysis, false);

                declarators.push(format!(
                    "{} = $.prop($$props, '{}', {})",
                    local_name, prop_name, flags
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
        let re = match get_or_compile_regex(&pattern) {
            Some(r) => r,
            None => continue,
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
fn is_valid_js_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    let first = chars.next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Wrap prop member expression mutations with `$$ownership_validator.mutation()`.
///
/// After `transform_prop_assignments` has already converted:
///   `item.name = value` → `item(item().name = value, true)`
/// This function detects that pattern and replaces it with:
///   `$$ownership_validator.mutation('item', ['item', 'name'], item().name = value, line, col)`
///
/// Reference: validate_mutation() in shared/utils.js
fn wrap_prop_mutation_validation(
    stmt: &str,
    prop_vars: &[(String, String)], // (var_name, prop_alias)
    source: &str,
) -> String {
    let _trimmed = stmt.trim();

    let mut result = stmt.to_string();

    for (var_name, prop_alias) in prop_vars {
        // Pattern: `prop(prop().member_chain = value, true)`
        let wrapper_start = format!("{}({}().", var_name, var_name);
        let mut search_from = 0;

        while let Some(start_idx) = result[search_from..].find(&wrapper_start) {
            let abs_start = search_from + start_idx;

            // Check this is a standalone identifier (not part of a longer name)
            if abs_start > 0 {
                let prev_char = result.as_bytes()[abs_start - 1] as char;
                if prev_char.is_alphanumeric() || prev_char == '_' || prev_char == '$' {
                    search_from = abs_start + wrapper_start.len();
                    continue;
                }
            }

            // Find the inner assignment: after `prop(` find the matching `, true)`
            let inner_start = abs_start + var_name.len() + 1; // skip `prop(`

            // Find `, true)` that closes this specific prop() call
            // We need to find the matching closing paren, accounting for nesting
            let rest = &result[inner_start..];
            let mut depth = 1i32; // we're inside prop(
            let mut close_pos = None;
            let rest_chars: Vec<char> = rest.chars().collect();
            let mut in_str: Option<char> = None;
            let mut ci = 0;
            let mut byte_i = 0;
            while ci < rest_chars.len() {
                let c = rest_chars[ci];
                if let Some(quote) = in_str {
                    if c == quote && (ci == 0 || rest_chars[ci - 1] != '\\') {
                        in_str = None;
                    }
                    if c == '`'
                        && quote == '`'
                        && ci + 1 < rest_chars.len()
                        && rest_chars[ci + 1] == '{'
                    {
                        // Template literal interpolation - not handling deeply, just skip
                    }
                } else {
                    match c {
                        '\'' | '"' | '`' => in_str = Some(c),
                        '(' | '[' | '{' => depth += 1,
                        ')' | ']' | '}' => {
                            depth -= 1;
                            if depth == 0 {
                                close_pos = Some(byte_i);
                                break;
                            }
                        }
                        _ => {}
                    }
                }
                byte_i += c.len_utf8();
                ci += 1;
            }

            let Some(close_byte_pos) = close_pos else {
                search_from = abs_start + wrapper_start.len();
                continue;
            };

            // The content inside prop(...) is rest[..close_byte_pos]
            let inner_content = &rest[..close_byte_pos];

            // Check if it ends with `, true`
            let inner_trimmed = inner_content.trim_end();
            if !inner_trimmed.ends_with(", true") {
                search_from = abs_start + wrapper_start.len();
                continue;
            }

            // Extract the assignment expression (without `, true`)
            let assignment_expr = inner_trimmed[..inner_trimmed.len() - ", true".len()].trim();

            // Parse the member chain from `prop().member_chain`
            let prop_call = format!("{}().", var_name);
            if !assignment_expr.starts_with(&prop_call) {
                search_from = abs_start + wrapper_start.len();
                continue;
            }

            let after_prop_call = &assignment_expr[prop_call.len()..];

            // Parse member identifiers until we hit a non-member character
            let mut path_parts: Vec<String> = vec![format!("'{}'", prop_alias)];
            let chars: Vec<char> = after_prop_call.chars().collect();
            let mut pos = 0;

            // Read the first member
            let ident_start = pos;
            while pos < chars.len()
                && (chars[pos].is_alphanumeric() || chars[pos] == '_' || chars[pos] == '$')
            {
                pos += 1;
            }
            if pos > ident_start {
                let ident: String = chars[ident_start..pos].iter().collect();
                path_parts.push(format!("'{}'", ident));
            }

            // Read additional dot-members
            while pos < chars.len() && chars[pos] == '.' {
                pos += 1;
                let ident_start = pos;
                while pos < chars.len()
                    && (chars[pos].is_alphanumeric() || chars[pos] == '_' || chars[pos] == '$')
                {
                    pos += 1;
                }
                if pos > ident_start {
                    let ident: String = chars[ident_start..pos].iter().collect();
                    path_parts.push(format!("'{}'", ident));
                }
            }

            if path_parts.len() < 2 {
                search_from = abs_start + wrapper_start.len();
                continue;
            }

            // Find the original source location
            let (line_num, col_num) = find_prop_mutation_location(source, var_name);

            // Build the path array
            let path_array = format!("[{}]", path_parts.join(", "));

            // Build the replacement
            let mut replacement = format!(
                "$$ownership_validator.mutation('{}', {}, {}",
                prop_alias, path_array, assignment_expr,
            );
            if line_num > 0 {
                replacement.push_str(&format!(", {}, {}", line_num, col_num));
            }
            replacement.push(')');

            // Replace: the original span is from abs_start to inner_start + close_byte_pos + 1
            let end_pos = inner_start + close_byte_pos + 1; // +1 for closing paren
            result = format!(
                "{}{}{}",
                &result[..abs_start],
                replacement,
                &result[end_pos..]
            );
            search_from = abs_start + replacement.len();
        }
    }

    result
}

/// Find the line/column in the original source for a prop mutation.
/// Searches for the original assignment pattern like `item.name =` in the source.
fn find_prop_mutation_location(source: &str, var_name: &str) -> (usize, usize) {
    // Look for `var_name.` in the source (before text transforms added `()`)
    let pattern = format!("{}.", var_name);
    // Search for the pattern after the script tag
    let search_source = if let Some(script_idx) = source.find("<script") {
        &source[script_idx..]
    } else {
        source
    };

    if let Some(relative_offset) = search_source.find(&pattern) {
        let offset = if let Some(script_idx) = source.find("<script") {
            script_idx + relative_offset
        } else {
            relative_offset
        };
        // Compute line/column from byte offset
        let mut line = 1usize;
        let mut col = 0usize;
        for (i, ch) in source.char_indices() {
            if i >= offset {
                break;
            }
            if ch == '\n' {
                line += 1;
                col = 0;
            } else {
                col += 1;
            }
        }
        (line, col)
    } else {
        (0, 0)
    }
}

fn transform_read_only_props(line: &str, read_only_props: &[(String, String)]) -> String {
    let mut result = line.to_string();

    for (local_name, prop_name) in read_only_props {
        // Create a regex pattern that matches the prop name as a complete identifier
        // Rust regex doesn't support lookbehind, so we match with word boundaries
        // and handle the prefix check manually
        let pattern = format!(r"\b{}\b", regex::escape(local_name));
        let re = match get_or_compile_regex(&pattern) {
            Some(r) => r,
            None => continue,
        };

        let mut new_result = String::new();
        let mut last_end = 0;

        for mat in re.find_iter(&result.clone()) {
            // Check if preceded by . (property access) or $ (dollar identifier)
            if mat.start() > 0 {
                let prev_byte = result.as_bytes().get(mat.start() - 1).copied();
                if prev_byte == Some(b'.') || prev_byte == Some(b'$') {
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

            // Skip if this is part of a let/const/var declaration or destructuring pattern.
            // Note: We check for `{` only when it follows a declaration keyword (e.g., `let {`).
            // A bare `{` could be a function body (e.g., `() => { prop(...)`) which should
            // NOT be skipped.
            let is_destructuring_brace = trimmed_before.ends_with('{') && {
                let before_brace = trimmed_before[..trimmed_before.len() - 1].trim_end();
                before_brace.ends_with("let")
                    || before_brace.ends_with("const")
                    || before_brace.ends_with("var")
                    || before_brace.ends_with(',')
                    || before_brace.ends_with(':')
                    || before_brace.strip_suffix('(').is_some_and(|stripped| {
                        // Only treat as destructuring if this is a function definition
                        // parameter, NOT a function call argument.
                        // e.g., `function({` is destructuring, `resolve({` is NOT
                        let before_paren = stripped.trim_end();
                        !before_paren
                            .chars()
                            .last()
                            .map(|c| c.is_alphanumeric() || c == '_' || c == '$' || c == '.')
                            .unwrap_or(false)
                    })
            };
            // Check if comma is in a variable declaration context (e.g., `let a, b`)
            // but NOT in a function call argument (e.g., `foo(a, b)`)
            let is_declaration_comma = trimmed_before.ends_with(',') && {
                // Walk back past any previous declarators to find if there's a let/const/var
                // This handles: `let a, b` where trimmed_before for `b` is `let a,`
                let before_comma = trimmed_before[..trimmed_before.len() - 1].trim_end();
                // Find the start of this statement by looking for the declaration keyword
                // We need to check if this comma is part of a `let/const/var` multi-declarator
                // or a destructuring pattern, not a function call argument
                is_in_variable_declaration_list(before_comma)
            };
            if trimmed_before.ends_with("let")
                || trimmed_before.ends_with("const")
                || trimmed_before.ends_with("var")
                || is_declaration_comma
                || is_destructuring_brace
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

            // Check if this is a function parameter or inside a function body where
            // a parameter shadows this prop name (e.g., `function render(state) { return state }`)
            if is_in_function_param_or_shadowed(&result, mat.start(), Some(local_name)) {
                new_result.push_str(&result[last_end..mat.end()]);
                last_end = mat.end();
                continue;
            }

            // Check if this is a shorthand property in an object literal
            // e.g., `{ environment }` should become `{ environment: $$props.environment }`
            // not `{ $$props.environment }` (which would be invalid)
            let is_shorthand = {
                let before = result[..mat.start()].trim_end();
                let after = result[mat.end()..].trim_start();
                let prev_char = before.chars().last();
                let next_char = after.chars().next();
                // Check that `{` is not preceded by `$` (template literal `${...}`)
                let is_template_literal = prev_char == Some('{') && {
                    let before_trimmed = before.trim_end();
                    before_trimmed.len() >= 2
                        && before_trimmed.as_bytes()[before_trimmed.len() - 2] == b'$'
                };
                matches!(prev_char, Some('{') | Some(','))
                    && matches!(next_char, Some('}') | Some(','))
                    && !is_template_literal
            };

            // Replace with $$props.propName or $$props['propName']
            new_result.push_str(&result[last_end..mat.start()]);
            let use_bracket = !is_valid_js_identifier(prop_name);
            if is_shorthand {
                new_result.push_str(local_name);
                if use_bracket {
                    new_result.push_str(": $$props['");
                    new_result.push_str(prop_name);
                    new_result.push_str("']");
                } else {
                    new_result.push_str(": $$props.");
                    new_result.push_str(prop_name);
                }
            } else if use_bracket {
                new_result.push_str("$$props['");
                new_result.push_str(prop_name);
                new_result.push_str("']");
            } else {
                new_result.push_str("$$props.");
                new_result.push_str(prop_name);
            }
            last_end = mat.end();
        }

        new_result.push_str(&result[last_end..]);
        result = new_result;
    }

    result
}

/// Check if text before a comma represents a variable declaration list.
/// Returns true for patterns like `let a` (from `let a, b`) but false for
/// function call arguments like `foo('str'` (from `foo('str', arg)`).
fn is_in_variable_declaration_list(before_comma: &str) -> bool {
    // Simple heuristic: scan backwards past identifiers, assignments, and values
    // to find if there's a let/const/var keyword at the top level (not inside parens/brackets).
    // We need to handle: `let a = 1, b` -> before_comma for b is `let a = 1`
    // But NOT: `console.log('str'` -> not a declaration
    let trimmed = before_comma.trim();

    // Quick checks for common declaration patterns
    if trimmed.starts_with("let ") || trimmed.starts_with("const ") || trimmed.starts_with("var ") {
        // Make sure we're at the top level (not inside nested parens/braces)
        // Count unmatched parens and braces
        let mut paren_depth: i32 = 0;
        let mut brace_depth: i32 = 0;
        let mut bracket_depth: i32 = 0;
        let mut in_string = false;
        let mut string_char = ' ';

        for c in trimmed.chars() {
            if in_string {
                if c == '\\' {
                    continue;
                }
                if c == string_char {
                    in_string = false;
                }
                continue;
            }
            match c {
                '"' | '\'' | '`' => {
                    in_string = true;
                    string_char = c;
                }
                '(' => paren_depth += 1,
                ')' => paren_depth -= 1,
                '{' => brace_depth += 1,
                '}' => brace_depth -= 1,
                '[' => bracket_depth += 1,
                ']' => bracket_depth -= 1,
                _ => {}
            }
        }

        // If we're at the top level (all brackets balanced), this is a declaration list
        paren_depth == 0 && brace_depth == 0 && bracket_depth == 0
    } else {
        false
    }
}

/// Check if a position is inside a function parameter list, or inside a function body
/// where a parameter with the given `name` shadows the identifier.
fn is_in_function_param_or_shadowed(code: &str, pos: usize, name: Option<&str>) -> bool {
    let bytes = code.as_bytes();

    // Track brace depth to determine function scope boundaries.
    // We scan backwards from pos to find enclosing function scopes.
    // For each enclosing function scope, check if the parameter list
    // contains the identifier name.

    let mut brace_depth: i32 = 0;

    let mut i = pos;
    while i > 0 {
        i -= 1;
        match bytes[i] {
            b'}' => brace_depth += 1,
            b'{' => {
                if brace_depth == 0 {
                    // We've found an enclosing `{` at the same level.
                    // Check if this is a function body by looking for `)` before `{`.
                    let before_brace = code[..i].trim_end();
                    if before_brace.ends_with(')') {
                        // Find the matching `(`
                        let close_paren = before_brace.len() - 1;
                        let mut pd: i32 = 0;
                        let mut open_paren = None;
                        let bb = before_brace.as_bytes();
                        let mut j = close_paren + 1;
                        while j > 0 {
                            j -= 1;
                            match bb[j] {
                                b')' => pd += 1,
                                b'(' => {
                                    pd -= 1;
                                    if pd == 0 {
                                        open_paren = Some(j);
                                        break;
                                    }
                                }
                                _ => {}
                            }
                        }
                        if let Some(op) = open_paren {
                            let before_paren = before_brace[..op].trim_end();
                            // Check if preceded by function keyword
                            let is_func = before_paren.ends_with("function")
                                || before_paren.ends_with("function*")
                                || {
                                    // function name(...)
                                    let stripped = before_paren.trim_end_matches(|c: char| {
                                        c.is_alphanumeric() || c == '_' || c == '$'
                                    });
                                    let stripped = stripped.trim_end();
                                    stripped.ends_with("function")
                                        || stripped.ends_with("function*")
                                        || stripped.ends_with("async function")
                                };
                            let is_arrow = {
                                // Check after `)` for `=>`
                                let after_close = before_brace[close_paren + 1..].trim_start();
                                after_close.starts_with("=>")
                            };
                            if is_func || is_arrow {
                                // Extract param list text
                                let param_text = &before_brace[op + 1..close_paren];
                                if let Some(name) = name {
                                    // Check if the param list contains this identifier
                                    let pattern = format!(r"\b{}\b", regex::escape(name));
                                    if let Some(re) = get_or_compile_regex(&pattern)
                                        && re.is_match(param_text)
                                    {
                                        return true;
                                    }
                                } else {
                                    // No name specified - we're checking if pos is IN the param list
                                    // This is the case when pos is between op and close_paren
                                    if pos > op && pos < close_paren + i + 1 {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    // Also check for `=>` after `{` (already inside arrow body)
                    // Continue scanning upward for more enclosing scopes
                } else {
                    brace_depth -= 1;
                }
            }
            _ => {}
        }
    }

    // Also check direct parameter list containment (pos is inside `(...)`)
    let before = &code[..pos];
    let mut paren_depth: i32 = 0;
    let mut last_open_paren = None;
    let mut k = before.len();
    while k > 0 {
        k -= 1;
        match bytes[k] {
            b')' => paren_depth += 1,
            b'(' => {
                if paren_depth == 0 {
                    last_open_paren = Some(k);
                    break;
                }
                paren_depth -= 1;
            }
            _ => {}
        }
    }

    if let Some(open_idx) = last_open_paren {
        let before_paren = code[..open_idx].trim_end();
        let is_func_param =
            before_paren.ends_with("function") || before_paren.ends_with("function*") || {
                let stripped = before_paren
                    .trim_end_matches(|c: char| c.is_alphanumeric() || c == '_' || c == '$');
                let stripped = stripped.trim_end();
                stripped.ends_with("function")
                    || stripped.ends_with("function*")
                    || stripped.ends_with("async function")
            };

        if is_func_param {
            return true;
        }

        // Check if closing `)` is followed by `=>` or `{`
        let mut paren_depth2: i32 = 0;
        let mut close_idx = None;
        for (j, &b) in code.as_bytes()[open_idx..].iter().enumerate() {
            match b {
                b'(' => paren_depth2 += 1,
                b')' => {
                    paren_depth2 -= 1;
                    if paren_depth2 == 0 {
                        close_idx = Some(open_idx + j);
                        break;
                    }
                }
                _ => {}
            }
        }
        if let Some(ci) = close_idx {
            let after_close = code[ci + 1..].trim_start();
            if after_close.starts_with("=>") {
                return true;
            }
        }
    }

    false
}

/// Check if a position is inside a destructuring pattern.
/// Destructuring patterns appear on the LEFT side of an assignment,
/// not the right side (which would be an object literal).
fn is_in_destructuring_pattern(code: &str, pos: usize) -> bool {
    let before = &code[..pos];

    // Count unmatched braces to see if we're inside { }
    let mut brace_depth = 0;
    let mut last_open_brace = None;

    for (byte_idx, c) in before.char_indices() {
        match c {
            '{' => {
                brace_depth += 1;
                last_open_brace = Some(byte_idx);
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

        // Function parameter destructuring: `function({ prop })` or `({ prop }) =>`
        // But NOT function call arguments: `resolve({ prop })`, `foo({ prop })`
        // And NOT arrow function object returns: `() => ({ prop })` where `({` is an object literal
        if let Some(stripped) = before_brace.strip_suffix('(') {
            let before_paren = stripped.trim_end();
            // Arrow function returning parenthesized object: `=> ({...})`
            // This is NOT destructuring.
            let is_arrow_return = before_paren.ends_with("=>");
            let is_function_call = before_paren
                .chars()
                .last()
                .map(|c| c.is_alphanumeric() || c == '_' || c == '$' || c == '.')
                .unwrap_or(false);
            if !is_function_call && !is_arrow_return {
                return true;
            }
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
/// Handles template literal interpolations: `foo ${bar} baz` - bar is NOT inside a string.
fn is_inside_string_literal(code: &str, pos: usize) -> bool {
    let before = &code[..pos];
    let mut in_string = false;
    let mut string_char = ' ';
    // Track template literal interpolation depth.
    // When inside a backtick string and we see `${`, we push to this stack.
    // The value represents the brace depth within the interpolation.
    let mut template_interp_depth: Vec<usize> = Vec::new();
    let mut chars = before.chars().peekable();

    while let Some(c) = chars.next() {
        if in_string {
            if c == '\\' {
                // Skip escaped character
                chars.next();
                continue;
            }
            // Inside a template literal, handle `${` as interpolation start
            if string_char == '`' && c == '$' && chars.peek() == Some(&'{') {
                chars.next(); // consume '{'
                in_string = false;
                template_interp_depth.push(0);
                continue;
            }
            if c == string_char {
                in_string = false;
            }
        } else if !template_interp_depth.is_empty() {
            // Inside a template literal interpolation - track braces
            if c == '{' {
                if let Some(depth) = template_interp_depth.last_mut() {
                    *depth += 1;
                }
            } else if c == '}' {
                let should_pop = template_interp_depth
                    .last()
                    .is_some_and(|depth| *depth == 0);
                if should_pop {
                    template_interp_depth.pop();
                    // We're back inside the template literal string
                    in_string = true;
                    string_char = '`';
                } else if let Some(depth) = template_interp_depth.last_mut() {
                    *depth -= 1;
                }
            } else if c == '"' || c == '\'' || c == '`' {
                in_string = true;
                string_char = c;
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
    non_proxy_vars: &[String],
) -> String {
    let mut result = line.to_string();

    for var in state_vars {
        // Transform ++varname to $.update_pre(varname)
        let pre_inc_pattern = format!("++{}", var);
        result = replace_with_word_boundary_scoped(
            &result,
            &pre_inc_pattern,
            &format!("$.update_pre({})", var),
            true,
            Some(var),
        );

        // Transform --varname to $.update_pre(varname, -1)
        let pre_dec_pattern = format!("--{}", var);
        result = replace_with_word_boundary_scoped(
            &result,
            &pre_dec_pattern,
            &format!("$.update_pre({}, -1)", var),
            true,
            Some(var),
        );

        // Transform varname++ to $.update(varname)
        let post_inc_pattern = format!("{}++", var);
        result = replace_with_word_boundary_scoped(
            &result,
            &post_inc_pattern,
            &format!("$.update({})", var),
            false,
            Some(var),
        );

        // Transform varname-- to $.update(varname, -1)
        let post_dec_pattern = format!("{}--", var);
        result = replace_with_word_boundary_scoped(
            &result,
            &post_dec_pattern,
            &format!("$.update({}, -1)", var),
            false,
            Some(var),
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

                    // Skip if preceded by an identifier character or '#' (private field)
                    if !before.is_empty()
                        && (is_identifier_char(before.chars().last().unwrap())
                            || before.ends_with('#'))
                    {
                        continue;
                    }

                    // Skip if inside a for-loop scope with the same variable
                    {
                        let chars: Vec<char> = result.chars().collect();
                        let char_pos = byte_pos_to_char_index(&result, pos);
                        if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                            continue;
                        }
                    }

                    let after = &result[pos + pattern.len()..];
                    // Find the expression (until ; or end, respecting nested braces)
                    let expr_end = find_statement_end_client(after);
                    let expr = after[..expr_end].trim();
                    // Don't wrap here - let the later wrap_state_vars_in_expr call handle it
                    // so it can properly detect function parameter shadowing
                    //
                    // Only add parens around expr when needed for precedence.
                    // Simple expressions (literals, identifiers, function calls) don't
                    // need parens since they have higher precedence than any binary op.
                    let expr_str = if needs_compound_assignment_parens(expr, op_char) {
                        format!("({})", expr)
                    } else {
                        expr.to_string()
                    };
                    let replacement =
                        format!("$.set({}, $.get({}) {} {})", var, var, op_char, expr_str);
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

                // Skip if preceded by an identifier character or '#' (private field)
                if !before.is_empty()
                    && (is_identifier_char(before.chars().last().unwrap()) || before.ends_with('#'))
                {
                    continue;
                }

                // Skip if inside a for-loop scope with the same variable
                {
                    let chars: Vec<char> = result.chars().collect();
                    let char_pos = byte_pos_to_char_index(&result, pos);
                    if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                        continue;
                    }
                }

                let after = &result[pos + pattern.len()..];
                // Find the expression (until ; or end, respecting nested braces)
                let expr_end = find_statement_end_client(after);
                let expr = after[..expr_end].trim();
                // Don't wrap here - let the later wrap_state_vars_in_expr call handle it
                // so it can properly detect function parameter shadowing
                let expr_str = if needs_compound_assignment_parens(expr, op_without_eq) {
                    format!("({})", expr)
                } else {
                    expr.to_string()
                };
                let replacement = format!(
                    "$.set({}, $.get({}) {} {})",
                    var, var, op_without_eq, expr_str
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
        // Check if a declaration of this variable exists in the statement.
        // If yes, we need per-occurrence checks (not a blanket skip) because
        // the declaration and reassignment may be on different lines within the same
        // multi-line statement (e.g., inside a derived callback).
        let has_declaration = is_variable_declaration(&result, var);
        while let Some(relative_pos) = result[search_start..].find(&assignment_pattern) {
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
            // Also skip if preceded by '#' (private class field like #y)
            if !before.is_empty()
                && (is_identifier_char(before.chars().last().unwrap()) || before.ends_with('#'))
            {
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

            // Skip if the variable is shadowed by a for-loop's let/const declaration
            {
                let chars: Vec<char> = result.chars().collect();
                let char_pos = byte_pos_to_char_index(&result, pos);
                if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }
            }

            // If a declaration of this variable exists in the statement, check
            // whether THIS specific occurrence is part of a declaration by examining
            // the text on the same line (or immediately preceding this position).
            if has_declaration {
                let last_newline = before.rfind('\n').map(|p| p + 1).unwrap_or(0);
                let line_text = result[last_newline..pos].trim_start();
                // Check if this line starts with a declaration keyword
                if line_text.starts_with("let ")
                    || line_text.starts_with("const ")
                    || line_text.starts_with("var ")
                {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }
                // Also check for multi-declarator pattern (comma-separated in a declaration)
                let before_trimmed = before.trim_end();
                if before_trimmed.ends_with(',')
                    && (result.trim().starts_with("let ")
                        || result.trim().starts_with("const ")
                        || result.trim().starts_with("var "))
                {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }
            }

            let after = &result[pos + assignment_pattern.len()..];
            // Find the expression (until ; or end of line, respecting nested braces)
            // If this assignment is inside a ternary expression, also stop at `:`
            let before_for_ternary = &result[..pos];
            let in_ternary = is_inside_ternary_expression(before_for_ternary);
            let expr_end = find_assignment_expr_end(after, in_ternary);
            let expr = after[..expr_end].trim();

            // Skip incomplete expressions (e.g., multi-line arrow functions
            // where only the first line is processed)
            if is_incomplete_expression(expr) {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            // Check it's not already wrapped in a $.set() call
            // Note: We must NOT skip expressions that start with $.
            // because legitimate RHS values like $.effect_tracking(), $.get(x),
            // $.proxy(x) etc. should still be wrapped in $.set().
            // The "already wrapped" check ($.set(var, ...)) is done above at the
            // `before` prefix check.
            if !expr.starts_with("$.set(") {
                // DON'T wrap state variables here - let the later wrap_state_vars_in_expr
                // call handle it, since that call has the full statement context and can
                // properly detect function parameter shadowing.
                // The later call in process_accumulated will handle $.get() wrapping
                // after we've created the $.set() call.

                // Check if the value needs proxying (could be an object/array)
                // $state.raw() variables never need proxy wrapping
                // Proxy flag is only added in runes mode
                let is_raw_state = raw_state_vars.contains(var);
                let needs_proxy = is_runes
                    && !is_raw_state
                    && expression_needs_proxy_with_scope(expr.trim(), non_proxy_vars);

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
        }
    }

    result
}

/// Wrap `$.set(var, ...)` calls with `$.store_unsub()` when the state variable has
/// a corresponding store subscription (`$var`).
///
/// This is needed because when a store variable like `foo = writable(42)` is reassigned,
/// the store subscription needs to be unsubscribed and resubscribed.
///
/// Transforms:
/// - `$.set(foo, writable(42))` → `$.store_unsub($.set(foo, writable(42)), '$foo', $$stores)`
///
/// Reference: declarations.js `add_state_transformers` → `assign_value_with_store`
fn wrap_store_unsub_for_state_sets(
    line: &str,
    state_vars: &[String],
    store_sub_vars: &[String],
) -> String {
    if state_vars.is_empty() || store_sub_vars.is_empty() {
        return line.to_string();
    }

    let mut result = line.to_string();

    for state_var in state_vars {
        // Check if this state variable has a corresponding store subscription
        let store_sub_name = format!("${}", state_var);
        if !store_sub_vars.contains(&store_sub_name) {
            continue;
        }

        // Find `$.set(var, ...)` patterns and wrap with $.store_unsub()
        // We need to handle patterns like:
        //   $.set(foo, writable(42))
        //   $.set(foo, writable(42), true)
        let set_pattern = format!("$.set({}, ", state_var);
        let mut search_start = 0;

        while let Some(relative_pos) = result[search_start..].find(&set_pattern) {
            let pos = search_start + relative_pos;

            // Check we're not already wrapped in $.store_unsub
            let before = &result[..pos];
            if before.ends_with("$.store_unsub(") {
                search_start = pos + set_pattern.len();
                continue;
            }

            // Find the matching closing paren for $.set(...)
            let set_start = pos;
            let args_start = pos + set_pattern.len();
            let mut paren_depth = 1i32;
            let mut i = args_start;
            let chars: Vec<char> = result.chars().collect();
            let mut in_string: Option<char> = None;
            let mut in_template = false;
            let mut template_depth = 0i32;

            while i < chars.len() && paren_depth > 0 {
                let c = chars[i];

                // Handle string context
                if let Some(quote) = in_string {
                    if c == '\\' {
                        i += 1; // skip escaped char
                    } else if c == quote && !in_template {
                        in_string = None;
                    }
                    i += 1;
                    continue;
                }

                if in_template {
                    if c == '`' {
                        in_template = false;
                    } else if c == '\\' {
                        i += 1; // skip escaped char
                    } else if c == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
                        template_depth += 1;
                        i += 1;
                    } else if c == '}' && template_depth > 0 {
                        template_depth -= 1;
                    }
                    i += 1;
                    continue;
                }

                match c {
                    '\'' | '"' => {
                        in_string = Some(c);
                    }
                    '`' => {
                        in_template = true;
                    }
                    '(' => paren_depth += 1,
                    ')' => {
                        paren_depth -= 1;
                        if paren_depth == 0 {
                            // Found the closing paren
                            let set_end = i + 1;
                            let set_call: String = chars[set_start..set_end].iter().collect();

                            // Wrap in $.store_unsub(set_call, '$var', $$stores)
                            let wrapped = format!(
                                "$.store_unsub({}, '{}', $$stores)",
                                set_call, store_sub_name
                            );

                            let before_str: String = chars[..set_start].iter().collect();
                            let after_str: String = chars[set_end..].iter().collect();
                            result = format!("{}{}{}", before_str, wrapped, after_str);
                            // Move past the wrapped content
                            search_start = before_str.len() + wrapped.len();
                            break;
                        }
                    }
                    _ => {}
                }
                i += 1;
            }

            if paren_depth > 0 {
                // Didn't find matching paren, move past
                search_start = pos + set_pattern.len();
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
///
/// Note: Update expressions (x++, --x, etc.) are handled by transform_prop_update_expressions
/// which must be called BEFORE this function.
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
        // Note: x++ / x-- / ++x / --x are handled by transform_prop_update_expressions
        // which runs BEFORE this function. By the time we get here, update expressions
        // have already been converted to $.update_prop(x) / $.update_pre_prop(x).

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
        // Also handle varname().prop when prop reads have already been applied (e.g. in else branch
        // of reactive statement transform where transform_prop_reads_in_expr runs before this).
        for dot_suffix in &["().", "."] {
            let member_pattern = format!("{}{}", var, dot_suffix);
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
                        // For compound assignments (+=, -=, etc.), we still want to
                        // capture the position so we can generate the wrapped mutation.
                        eq_pos = Some(i);
                        break;
                    }
                }

                // If we found an assignment (including compound operators)
                if let Some(eq_idx) = eq_pos {
                    // Check if this is already wrapped
                    if before.ends_with(&format!("{}({}().", var, var)) {
                        member_search_start = pos + member_pattern.len();
                        continue;
                    }

                    // Detect the full assignment operator (=, +=, -=, *=, etc.)
                    // eq_idx points to '=' in after_member, but we need to check the
                    // character before '=' for compound operators
                    let char_before_eq = if eq_idx > 0 {
                        after_member.as_bytes().get(eq_idx - 1).map(|&b| b as char)
                    } else {
                        None
                    };
                    let (assign_op, op_start_offset) = match char_before_eq {
                        Some('+') => ("+=", 1),
                        Some('-') => ("-=", 1),
                        Some('*') => {
                            // Check for **=
                            if eq_idx >= 2
                                && after_member.as_bytes().get(eq_idx - 2).map(|&b| b as char)
                                    == Some('*')
                            {
                                ("**=", 2)
                            } else {
                                ("*=", 1)
                            }
                        }
                        Some('/') => ("/=", 1),
                        Some('%') => ("%=", 1),
                        Some('&') => {
                            if eq_idx >= 2
                                && after_member.as_bytes().get(eq_idx - 2).map(|&b| b as char)
                                    == Some('&')
                            {
                                ("&&=", 2)
                            } else {
                                ("&=", 1)
                            }
                        }
                        Some('|') => {
                            if eq_idx >= 2
                                && after_member.as_bytes().get(eq_idx - 2).map(|&b| b as char)
                                    == Some('|')
                            {
                                ("||=", 2)
                            } else {
                                ("|=", 1)
                            }
                        }
                        Some('^') => ("^=", 1),
                        Some('?') => {
                            if eq_idx >= 2
                                && after_member.as_bytes().get(eq_idx - 2).map(|&b| b as char)
                                    == Some('?')
                            {
                                ("??=", 2)
                            } else {
                                ("=", 0) // single ? before = is unexpected, treat as =
                            }
                        }
                        _ => ("=", 0),
                    };

                    let prop_name = after_member[..eq_idx - op_start_offset].trim_end();
                    let after_eq_raw = &after_member[eq_idx + 1..];
                    let leading_whitespace = after_eq_raw.len() - after_eq_raw.trim_start().len();
                    let after_eq = after_eq_raw.trim_start();

                    // Find the value expression end
                    let value_end = find_statement_end_client(after_eq);
                    let value = after_eq[..value_end].trim();

                    // Wrap with prop(prop().prop OP value, true)
                    let replacement = format!(
                        "{}({}().{} {} {}, true)",
                        var, var, prop_name, assign_op, value
                    );

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
        } // end for dot_suffix

        // Transform bracket-notation member mutations: varname[expr] = value to varname(varname()[expr] = value, true)
        // This is needed for bindable props when the member access uses bracket notation
        // e.g., `rows[row] = ''` -> `rows(rows()[row] = '', true)`
        //
        // Also handle the case where prop reads have already been transformed:
        // e.g., `foo()[bar()] = true` -> `foo(foo()[bar()] = true, true)`
        // The pattern `{var}()[` matches when transform_prop_reads_in_expr has already
        // converted `foo` to `foo()` before this function runs.
        //
        // We try both patterns: `{var}()[` first (already read-transformed), then `{var}[` (original).
        for bracket_suffix in &["()[", "["] {
            let bracket_pattern = format!("{}{}", var, bracket_suffix);
            let mut bracket_search_start = 0;

            while let Some(relative_pos) = result[bracket_search_start..].find(&bracket_pattern) {
                let pos = bracket_search_start + relative_pos;

                // Check that this is a word boundary (not part of another identifier)
                let before = &result[..pos];
                if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                    bracket_search_start = pos + bracket_pattern.len();
                    continue;
                }

                // Check if this is already wrapped (e.g., varname(varname()[...)
                // This catches both the full pattern `var(var()[` and the case where
                // we're inside an already-generated mutation wrapper `var(var()[...]...)`
                // where `before` is just `var(`.
                let already_wrapped_pattern = format!("{}({}()", var, var);
                let short_wrapped_pattern = format!("{}(", var);
                if before.ends_with(&already_wrapped_pattern) {
                    bracket_search_start = pos + bracket_pattern.len();
                    continue;
                }
                // Also check the shorter pattern: if `before` ends with `var(` at a word boundary,
                // then the current `var()[` is inside an existing mutation wrapper.
                // For example: `items(items()[2] = ...)` - inner `items()` at position 6
                // has before = `items(`. Verify it's at a word boundary by checking the
                // character before `var(`.
                if before.ends_with(&short_wrapped_pattern) {
                    let prefix_before = &before[..before.len() - short_wrapped_pattern.len()];
                    if prefix_before.is_empty()
                        || !is_identifier_char(prefix_before.chars().last().unwrap())
                    {
                        bracket_search_start = pos + bracket_pattern.len();
                        continue;
                    }
                }

                // Find the matching closing bracket
                let after_bracket = &result[pos + bracket_pattern.len()..];
                let mut bracket_depth = 1i32;
                let mut close_bracket_pos = None;
                for (i, c) in after_bracket.char_indices() {
                    match c {
                        '[' => bracket_depth += 1,
                        ']' => {
                            bracket_depth -= 1;
                            if bracket_depth == 0 {
                                close_bracket_pos = Some(i);
                                break;
                            }
                        }
                        _ => {}
                    }
                }

                let Some(close_pos) = close_bracket_pos else {
                    bracket_search_start = pos + bracket_pattern.len();
                    continue;
                };

                // After the closing bracket, look for an assignment operator
                let after_close = &after_bracket[close_pos + 1..];
                let trimmed_after = after_close.trim_start();
                let whitespace_len = after_close.len() - trimmed_after.len();

                // Check for assignment operator (simple `=` or compound `+=`, `-=`, `*=`, etc.)
                // but not ==, ===, =>, etc.
                let (assign_op, assign_op_len) = detect_assignment_operator(trimmed_after);

                if let Some(op) = assign_op {
                    let op_len = assign_op_len;
                    let after_eq = &trimmed_after[op_len..];
                    let after_eq_trimmed = after_eq.trim_start();
                    let eq_whitespace = after_eq.len() - after_eq_trimmed.len();

                    // Find the value expression end
                    let value_end = find_statement_end_client(after_eq_trimmed);
                    let value = after_eq_trimmed[..value_end].trim();

                    let bracket_content = &after_bracket[..close_pos];

                    // Build: varname(varname()[bracket_content] OP value, true)
                    // The inner varname() is always with () for the read getter.
                    let replacement = format!(
                        "{}({}()[{}] {} {}, true)",
                        var, var, bracket_content, op, value
                    );

                    // Calculate original length from the start of varname to end of value
                    let original_len = bracket_pattern.len()
                        + close_pos
                        + 1
                        + whitespace_len
                        + op_len
                        + eq_whitespace
                        + value_end;

                    let new_result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + original_len..]
                    );
                    bracket_search_start = pos + replacement.len();
                    result = new_result;
                } else {
                    bracket_search_start = pos + bracket_pattern.len();
                }
            }
        }
    }

    result
}

/// Detect an assignment operator at the start of a string.
///
/// Returns `(Some(operator_str), operator_byte_len)` if an assignment operator is found,
/// or `(None, 0)` if no assignment operator is at the start.
///
/// Handles: `=`, `+=`, `-=`, `*=`, `/=`, `%=`, `**=`, `&=`, `|=`, `^=`, `&&=`, `||=`, `??=`,
/// `<<=`, `>>=`, `>>>=`.
/// Excludes: `==`, `===`, `=>`.
fn detect_assignment_operator(s: &str) -> (Option<&'static str>, usize) {
    let bytes = s.as_bytes();
    if bytes.is_empty() {
        return (None, 0);
    }

    // Check for 4-char operators first
    if bytes.len() >= 4 {
        let four = &s[..4];
        if four == ">>>=" {
            return (Some(">>>="), 4);
        }
    }

    // Check for 3-char operators
    if bytes.len() >= 3 {
        let three = &s[..3];
        match three {
            "**=" => return (Some("**="), 3),
            "&&=" => return (Some("&&="), 3),
            "||=" => return (Some("||="), 3),
            "??=" => return (Some("??="), 3),
            "<<=" => return (Some("<<="), 3),
            ">>=" => {
                // Make sure it's not >>>=
                if bytes.len() < 4 || bytes[3] != b'=' {
                    return (Some(">>="), 3);
                }
            }
            _ => {}
        }
    }

    // Check for 2-char operators
    if bytes.len() >= 2 {
        let two = &s[..2];
        match two {
            "+=" => return (Some("+="), 2),
            "-=" => return (Some("-="), 2),
            "*=" => return (Some("*="), 2),
            "/=" => return (Some("/="), 2),
            "%=" => return (Some("%="), 2),
            "&=" => return (Some("&="), 2),
            "|=" => return (Some("|="), 2),
            "^=" => return (Some("^="), 2),
            // Exclude ==, =>
            "==" | "=>" => return (None, 0),
            _ => {}
        }
    }

    // Check for simple = (but not ==, =>)
    if bytes[0] == b'=' {
        if bytes.len() >= 2 && (bytes[1] == b'=' || bytes[1] == b'>') {
            return (None, 0);
        }
        return (Some("="), 1);
    }

    (None, 0)
}

/// Split a multi-declarator variable statement into individual declarations.
///
/// Converts `let a = 1, b = 2, c = 3;` into `["let a = 1;", "let b = 2;", "let c = 3;"]`
/// while handling nested structures like arrays and objects correctly.
///
/// If the line is not a multi-declarator statement, returns None.
fn split_multi_declarator(line: &str) -> Option<Vec<String>> {
    // Check if this is a variable declaration
    let trimmed = line.trim();
    let (keyword, rest) = if let Some(r) = trimmed.strip_prefix("let ") {
        ("let", r)
    } else if let Some(r) = trimmed.strip_prefix("const ") {
        ("const", r)
    } else if let Some(r) = trimmed.strip_prefix("var ") {
        ("var", r)
    } else {
        return None;
    };

    // Check if there's a comma at depth 0 (indicating multiple declarators)
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut has_top_level_comma = false;
    let chars: Vec<char> = rest.chars().collect();

    for (i, &c) in chars.iter().enumerate() {
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
            ',' if depth == 0 => {
                has_top_level_comma = true;
                break;
            }
            _ => {}
        }
    }

    if !has_top_level_comma {
        return None;
    }

    // Split into declarators at top-level commas
    let mut declarators: Vec<String> = Vec::new();
    let mut current = String::new();
    depth = 0;
    in_string = false;
    string_char = ' ';

    for (i, &c) in chars.iter().enumerate() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            current.push(c);
            continue;
        }
        if in_string {
            current.push(c);
            continue;
        }
        match c {
            '(' | '[' | '{' => {
                depth += 1;
                current.push(c);
            }
            ')' | ']' | '}' => {
                if depth > 0 {
                    depth -= 1;
                }
                current.push(c);
            }
            ',' if depth == 0 => {
                // End of current declarator
                declarators.push(current.trim().trim_end_matches(';').trim().to_string());
                current = String::new();
            }
            ';' if depth == 0 => {
                // End of statement
                if !current.trim().is_empty() {
                    declarators.push(current.trim().to_string());
                }
                current = String::new();
                break;
            }
            _ => {
                current.push(c);
            }
        }
    }
    if !current.trim().is_empty() {
        declarators.push(current.trim().trim_end_matches(';').trim().to_string());
    }

    if declarators.len() <= 1 {
        return None;
    }

    // Get leading whitespace from original line
    let leading_ws: String = line.chars().take_while(|c| c.is_whitespace()).collect();

    // Convert to individual declarations
    let result: Vec<String> = declarators
        .iter()
        .map(|d| format!("{}{} {};", leading_ws, keyword, d))
        .collect();

    Some(result)
}

/// Transform legacy destructuring declarations into tmp-based individual declarations.
///
/// In legacy mode, when a destructuring declaration contains state variables,
/// the official Svelte compiler expands it using `extract_paths` (in `create_state_declarators`).
///
/// Transforms:
///   `let { foo, bar } = expr` (where foo is state) ->
///   `let tmp = expr, foo = $.mutable_source(tmp.foo), bar = tmp.bar;`
///
/// Reference: `create_state_declarators` in VariableDeclaration.js
fn transform_legacy_destructure_declarations(
    statement: &str,
    legacy_state_var_names: &[String],
    immutable: bool,
) -> String {
    // Only look at the first line to determine if this is a destructuring declaration
    let first_line = statement.lines().next().unwrap_or("");
    let trimmed = first_line.trim();

    // Determine declaration keyword
    let (keyword, rest_start) = if let Some(r) = trimmed.strip_prefix("let ") {
        ("let", r)
    } else if let Some(r) = trimmed.strip_prefix("const ") {
        ("const", r)
    } else if let Some(r) = trimmed.strip_prefix("var ") {
        ("var", r)
    } else {
        return statement.to_string();
    };

    let rest_start = rest_start.trim();

    // Check if this is a destructuring pattern (starts with { or [)
    if !rest_start.starts_with('{') && !rest_start.starts_with('[') {
        return statement.to_string();
    }

    // For the full pattern matching, we need the complete statement (multi-line)
    let full_trimmed = statement.trim();
    let keyword_len = keyword.len() + 1; // +1 for space
    let rest = full_trimmed[keyword_len..].trim();

    let is_object = rest.starts_with('{');
    let close_bracket = if is_object { '}' } else { ']' };

    // Find the matching close bracket in the PATTERN (not the expression)
    let mut depth = 0i32;
    let mut pattern_end = None;
    let mut in_string: Option<char> = None;
    for (i, c) in rest.chars().enumerate() {
        if let Some(quote) = in_string {
            if c == quote && (i == 0 || rest.as_bytes().get(i - 1) != Some(&b'\\')) {
                in_string = None;
            }
            continue;
        }
        if c == '\'' || c == '"' || c == '`' {
            in_string = Some(c);
            continue;
        }
        if c == '{' || c == '[' || c == '(' {
            depth += 1;
        } else if c == '}' || c == ']' || c == ')' {
            depth -= 1;
            if depth == 0 && c == close_bracket {
                pattern_end = Some(i);
                break;
            }
        }
    }

    let pattern_end = match pattern_end {
        Some(e) => e,
        None => return statement.to_string(),
    };

    let pattern_str = &rest[..=pattern_end];
    let after_pattern = rest[pattern_end + 1..].trim();

    // Must have `= expr` after the pattern
    if !after_pattern.starts_with('=') {
        return statement.to_string();
    }

    let expr = after_pattern[1..].trim().trim_end_matches(';').trim();

    // Extract variable names from the pattern
    let var_names = extract_legacy_destructure_var_names(pattern_str);

    // Check if any destructured variable is a state variable
    let has_state = var_names
        .iter()
        .any(|name| legacy_state_var_names.contains(name));

    if !has_state {
        return statement.to_string();
    }

    // Generate tmp variable name
    let tmp_idx = STATE_TMP_COUNTER.with(|c| {
        let current = c.get();
        c.set(current + 1);
        current
    });
    let tmp_name = if tmp_idx == 0 {
        "tmp".to_string()
    } else {
        format!("tmp_{}", tmp_idx)
    };

    let immutable_arg = if immutable { ", true" } else { "" };

    if is_object {
        // Object destructuring: { a, b: c, d = default, ...rest }
        let inner = &pattern_str[1..pattern_str.len() - 1];
        let props = split_derived_object_properties(inner);
        let mut parts = vec![format!("{} = {}", tmp_name, expr)];

        for prop in &props {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }

            if let Some(rest_name) = prop.strip_prefix("...") {
                let rest_name = rest_name.trim();
                parts.push(format!("{} = {}.{}", rest_name, tmp_name, rest_name));
                continue;
            }

            if let Some(colon_pos) = find_derived_property_colon(prop) {
                let key = prop[..colon_pos].trim();
                let value_part = prop[colon_pos + 1..].trim();
                let var_name = if let Some(eq_pos) = value_part.find('=') {
                    value_part[..eq_pos].trim()
                } else {
                    value_part
                };

                let is_state = legacy_state_var_names.contains(&var_name.to_string());
                let member = format!("{}.{}", tmp_name, key);
                if is_state {
                    parts.push(format!(
                        "{} = $.mutable_source({}{})",
                        var_name, member, immutable_arg
                    ));
                } else {
                    parts.push(format!("{} = {}", var_name, member));
                }
            } else {
                let var_name = if let Some(eq_pos) = prop.find('=') {
                    prop[..eq_pos].trim()
                } else {
                    prop
                };

                let is_state = legacy_state_var_names.contains(&var_name.to_string());
                let member = format!("{}.{}", tmp_name, var_name);
                if is_state {
                    parts.push(format!(
                        "{} = $.mutable_source({}{})",
                        var_name, member, immutable_arg
                    ));
                } else {
                    parts.push(format!("{} = {}", var_name, member));
                }
            }
        }

        let trailing = if full_trimmed.ends_with(';') { ";" } else { "" };
        format!("{} {}{}", keyword, parts.join(", "), trailing)
    } else {
        // Array destructuring: [a, b, ...rest]
        let inner = &pattern_str[1..pattern_str.len() - 1];
        let elements = split_derived_array_elements(inner);

        let has_rest = elements.iter().any(|e| e.trim().starts_with("..."));
        let element_count = elements.len();

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

        let to_array_args = if has_rest {
            format!("$.to_array({})", tmp_name)
        } else {
            format!("$.to_array({}, {})", tmp_name, element_count)
        };

        let mut parts = vec![
            format!("{} = {}", tmp_name, expr),
            format!("{} = $.derived(() => {})", array_var, to_array_args),
        ];

        for (i, element) in elements.iter().enumerate() {
            let element = element.trim();
            if element.is_empty() {
                continue;
            }

            if let Some(rest_name) = element.strip_prefix("...") {
                let rest_name = rest_name.trim();
                let access = format!("$.get({}).slice({})", array_var, i);
                let is_state = legacy_state_var_names.contains(&rest_name.to_string());
                if is_state {
                    parts.push(format!(
                        "{} = $.mutable_source({}{})",
                        rest_name, access, immutable_arg
                    ));
                } else {
                    parts.push(format!("{} = {}", rest_name, access));
                }
                continue;
            }

            let access = format!("$.get({})[{}]", array_var, i);
            let is_state = legacy_state_var_names.contains(&element.to_string());
            if is_state {
                parts.push(format!(
                    "{} = $.mutable_source({}{})",
                    element, access, immutable_arg
                ));
            } else {
                parts.push(format!("{} = {}", element, access));
            }
        }

        let trailing = if full_trimmed.ends_with(';') { ";" } else { "" };
        format!("{} {}{}", keyword, parts.join(", "), trailing)
    }
}

/// Extract variable names from a destructuring pattern.
fn extract_legacy_destructure_var_names(pattern: &str) -> Vec<String> {
    let mut names = Vec::new();
    let pattern = pattern.trim();

    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let props = split_derived_object_properties(inner);
        for prop in &props {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }
            if let Some(rest_name) = prop.strip_prefix("...") {
                names.push(rest_name.trim().to_string());
            } else if let Some(colon_pos) = find_derived_property_colon(prop) {
                let value_part = prop[colon_pos + 1..].trim();
                let var_name = if let Some(eq_pos) = value_part.find('=') {
                    value_part[..eq_pos].trim()
                } else {
                    value_part
                };
                names.push(var_name.to_string());
            } else {
                let var_name = if let Some(eq_pos) = prop.find('=') {
                    prop[..eq_pos].trim()
                } else {
                    prop
                };
                names.push(var_name.to_string());
            }
        }
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_derived_array_elements(inner);
        for el in &elements {
            let el = el.trim();
            if el.is_empty() {
                continue;
            }
            if let Some(rest_name) = el.strip_prefix("...") {
                names.push(rest_name.trim().to_string());
            } else {
                names.push(el.to_string());
            }
        }
    }

    names
}

/// Transform legacy state declarations to $.mutable_source() calls.
///
/// In legacy (non-runes) mode, variables that are promoted to State kind
/// (updated and referenced in template/$:/StyleDirective) need to be wrapped
/// in $.mutable_source() for reactivity.
///
/// Transforms:
/// - `let state = 'foo'` → `let state = $.mutable_source('foo')`
/// - `let count = 0` → `let count = $.mutable_source(0)`
/// - `const arr = [1, 2]` → `const arr = $.mutable_source([1, 2])`
fn transform_legacy_state_declarations(
    line: &str,
    legacy_state_vars: &[(String, Option<String>, DeclarationKind)],
    immutable: bool,
) -> String {
    if legacy_state_vars.is_empty() {
        return line.to_string();
    }

    // Handle multi-declarator statements like `let a = 1, b = 2, c = 3;`
    // Split into individual declarations first to handle each one separately
    if let Some(split_lines) = split_multi_declarator(line) {
        let transformed_lines: Vec<String> = split_lines
            .iter()
            .map(|l| transform_legacy_state_declarations(l, legacy_state_vars, immutable))
            .collect();
        return transformed_lines.join("\n");
    }

    let mut result = line.to_string();

    for (var, _initial, decl_kind) in legacy_state_vars {
        // Determine the keyword(s) to look for based on declaration kind
        let keywords: Vec<&str> = match decl_kind {
            DeclarationKind::Let => vec!["let"],
            DeclarationKind::Const => vec!["const"],
            DeclarationKind::Var => vec!["var"],
            _ => vec!["let", "const", "var"],
        };

        let mut matched = false;

        for keyword in &keywords {
            if matched {
                break;
            }

            // First, try to match `keyword varname = value` pattern
            let pattern_with_init = format!("{} {} = ", keyword, var);
            // Use a loop to find the first match that is NOT inside a for-loop header.
            // For example, in `function foo() { for (let x = 0; ...) {} }`, the `let x = 0`
            // inside the for-loop should be skipped - it's a loop variable, not a state variable.
            {
                let mut search_offset = 0;
                while let Some(rel_pos) = result[search_offset..].find(&pattern_with_init) {
                    let pos = search_offset + rel_pos;

                    // Check if already wrapped
                    if result[pos + pattern_with_init.len()..].starts_with("$.mutable_source(")
                        || result[pos + pattern_with_init.len()..].starts_with("$.prop(")
                    {
                        matched = true;
                        break;
                    }

                    // Check if this declaration is inside a for-loop header.
                    // Scan backwards from `pos` to see if we find `for (` with unmatched parens.
                    let chars: Vec<char> = result.chars().collect();
                    let char_pos = byte_pos_to_char_index(&result, pos + keyword.len() + 1);
                    if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                        // This `let x = ...` is inside a for-loop header, skip it
                        search_offset = pos + pattern_with_init.len();
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
                        format!("{} {} = $.mutable_source({}, true)", keyword, var, expr)
                    } else {
                        format!("{} {} = $.mutable_source({})", keyword, var, expr)
                    };

                    // Replace the declaration
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern_with_init.len() + expr_end..]
                    );
                    matched = true;
                    break;
                }
                if matched {
                    continue;
                }
            }

            // Then, try to match `keyword varname;` pattern (declaration without initializer)
            let pattern_no_init = format!("{} {};", keyword, var);
            {
                let mut search_offset = 0;
                while let Some(rel_pos) = result[search_offset..].find(&pattern_no_init) {
                    let pos = search_offset + rel_pos;

                    // Check if this declaration is inside a for-loop header
                    let chars: Vec<char> = result.chars().collect();
                    let char_pos = byte_pos_to_char_index(&result, pos + keyword.len() + 1);
                    if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                        search_offset = pos + pattern_no_init.len();
                        continue;
                    }

                    // Build the replacement - no initial value, so pass nothing to $.mutable_source()
                    let replacement = if immutable {
                        format!("{} {} = $.mutable_source(undefined, true);", keyword, var)
                    } else {
                        format!("{} {} = $.mutable_source();", keyword, var)
                    };

                    // Replace the declaration
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern_no_init.len()..]
                    );
                    matched = true;
                    break;
                }
                if matched {
                    continue;
                }
            }

            // Also try to match `keyword varname` without semicolon
            let pattern_no_semi = format!("{} {}", keyword, var);
            {
                let mut search_offset = 0;
                while let Some(rel_pos) = result[search_offset..].find(&pattern_no_semi) {
                    let pos = search_offset + rel_pos;
                    let after_pos = pos + pattern_no_semi.len();
                    let is_end = after_pos >= result.len()
                        || result[after_pos..]
                            .starts_with(|c: char| c.is_whitespace() || c == '\n' || c == '\r');
                    if !is_end {
                        search_offset = pos + pattern_no_semi.len();
                        continue;
                    }

                    // Check if this declaration is inside a for-loop header
                    let chars: Vec<char> = result.chars().collect();
                    let char_pos = byte_pos_to_char_index(&result, pos + keyword.len() + 1);
                    if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                        search_offset = pos + pattern_no_semi.len();
                        continue;
                    }

                    if after_pos < result.len()
                        && result[after_pos..]
                            .trim_start()
                            .starts_with("= $.mutable_source(")
                    {
                        matched = true;
                        break;
                    }
                    let replacement = if immutable {
                        format!("{} {} = $.mutable_source(undefined, true)", keyword, var)
                    } else {
                        format!("{} {} = $.mutable_source()", keyword, var)
                    };
                    result = format!("{}{}{}", &result[..pos], replacement, &result[after_pos..]);
                    matched = true;
                    break;
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
/// - `$count++` → `$.update_store(count, $count())`
/// - `++$count` → `$.update_pre_store(count, $count())`
/// - `$count--` → `$.update_store(count, $count(), -1)`
/// - `--$count` → `$.update_pre_store(count, $count(), -1)`
///
/// When the underlying store variable is a prop, use `store_name()` instead of `store_name`.
/// When it's a state variable, use `$.get(store_name)` instead of `store_name`.
fn transform_store_assignments_client(
    line: &str,
    store_sub_vars: &[String],
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
) -> String {
    if store_sub_vars.is_empty() {
        return line.to_string();
    }

    let mut result = line.to_string();

    for store_sub in store_sub_vars {
        // store_sub is like "$count", store_name is "count"
        let store_name = &store_sub[1..];

        // Determine the access pattern for the underlying store variable
        let store_access = if prop_vars.contains(&store_name.to_string()) {
            format!("{}()", store_name) // prop getter
        } else if state_vars.contains(&store_name.to_string())
            && !non_reactive_state_vars.contains(&store_name.to_string())
        {
            format!("$.get({})", store_name) // reactive state getter
        } else {
            store_name.to_string() // regular variable
        };

        // Transform prefix increment: ++$count -> $.update_pre_store(count, $count())
        let pre_inc_pattern = format!("++{}", store_sub);
        if result.contains(&pre_inc_pattern) {
            let replacement = format!("$.update_pre_store({}, {}())", store_access, store_sub);
            result = result.replace(&pre_inc_pattern, &replacement);
        }

        // Transform prefix decrement: --$count -> $.update_pre_store(count, $count(), -1)
        let pre_dec_pattern = format!("--{}", store_sub);
        if result.contains(&pre_dec_pattern) {
            let replacement = format!("$.update_pre_store({}, {}(), -1)", store_access, store_sub);
            result = result.replace(&pre_dec_pattern, &replacement);
        }

        // Transform postfix increment: $count++ -> $.update_store(count, $count())
        let post_inc_pattern = format!("{}++", store_sub);
        if result.contains(&post_inc_pattern) {
            let replacement = format!("$.update_store({}, {}())", store_access, store_sub);
            result = result.replace(&post_inc_pattern, &replacement);
        }

        // Transform postfix decrement: $count-- -> $.update_store(count, $count(), -1)
        let post_dec_pattern = format!("{}--", store_sub);
        if result.contains(&post_dec_pattern) {
            let replacement = format!("$.update_store({}, {}(), -1)", store_access, store_sub);
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
                    store_access, store_sub, op_char, expr
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
        // Must handle ALL occurrences, not just the first one.
        // Uses a search offset to avoid re-processing already-transformed text.
        let assignment_pattern = format!("{} = ", store_sub);
        let mut search_offset = 0;
        loop {
            let search_region = &result[search_offset..];
            let Some(rel_pos) = search_region.find(&assignment_pattern) else {
                break;
            };
            let pos = search_offset + rel_pos;

            // Check that it's not part of a comparison (==, ===) or a member access (obj.$value)
            let before = &result[..pos];
            if before.ends_with('=') || before.ends_with('!') {
                // This is == or != comparison, not an assignment - advance past it
                search_offset = pos + assignment_pattern.len();
                continue;
            }
            if before.ends_with('.') {
                // This is a property access like `obj.$value = expr`, not a store assignment
                search_offset = pos + assignment_pattern.len();
                continue;
            }
            // Check that the char before $store is a valid boundary (not part of an identifier)
            if let Some(ch) = before.chars().last()
                && (ch.is_alphanumeric() || ch == '_' || ch == '$')
            {
                search_offset = pos + assignment_pattern.len();
                continue;
            }

            let after = &result[pos + assignment_pattern.len()..];
            // Find the expression (until ; or end of line)
            let expr_end = find_statement_end_client(after);
            let expr = after[..expr_end].trim();
            let prefix = format!("$.store_set({}, ", store_access);
            let replacement = format!("{}{})", prefix, expr);
            let new_result = format!(
                "{}{}{}",
                &result[..pos],
                replacement,
                &result[pos + assignment_pattern.len() + expr_end..]
            );
            // Only advance past the prefix, so we can find nested assignments in the RHS
            search_offset = pos + prefix.len();
            result = new_result;
        }

        // Transform member expression mutations: $store.prop.value++ or $store[0].value++
        // These need $.store_mutate(store, $.untrack($store).prop.value++, $.untrack($store))
        result = transform_store_member_mutations(&result, store_sub, &store_access);
    }

    result
}

/// Check if a store subscription name appears as a function parameter in a statement.
/// This detects patterns like `function bar($derived, $effect)` where the store sub name
/// is actually a function parameter, not a store reference.
fn is_function_parameter_in_statement(statement: &str, store_sub: &str) -> bool {
    // Look for function declarations or arrow functions with the store sub as a parameter
    // Patterns: `function name($store` or `($store` in arrow functions
    // We search for the pattern: `(` ... store_sub ... `,` or `)` without intervening `(`
    let mut search_from = 0;
    while let Some(func_pos) = statement[search_from..].find("function ") {
        let abs_func_pos = search_from + func_pos;
        // Find the opening paren of the function params
        if let Some(paren_pos) = statement[abs_func_pos..].find('(') {
            let abs_paren_pos = abs_func_pos + paren_pos;
            // Find the closing paren
            if let Some(close_paren_pos) = find_matching_paren(&statement[abs_paren_pos + 1..]) {
                let params = &statement[abs_paren_pos + 1..abs_paren_pos + 1 + close_paren_pos];
                // Check if the store_sub appears as a parameter (word boundary)
                for param in params.split(',') {
                    let trimmed = param.trim();
                    // Handle destructuring and default values
                    let param_name = trimmed.split('=').next().unwrap_or(trimmed).trim();
                    if param_name == store_sub {
                        return true;
                    }
                }
            }
        }
        search_from = abs_func_pos + 9;
    }

    // Also check for arrow function parameters.
    // Pattern 1: `$store =>` (unparenthesized single arrow param)
    //   e.g., `derived(count, $count => $count * 2)`
    let store_sub_len = store_sub.len();
    let mut pos = 0;
    while pos + store_sub_len <= statement.len() {
        if let Some(found) = statement[pos..].find(store_sub) {
            let abs_found = pos + found;
            // Check word boundary before
            let before_ok = if abs_found == 0 {
                true
            } else {
                let prev = statement.as_bytes()[abs_found - 1] as char;
                !prev.is_alphanumeric() && prev != '_' && prev != '$'
            };
            // Check word boundary after
            let after_pos = abs_found + store_sub_len;
            let after_ok = if after_pos >= statement.len() {
                true
            } else {
                let next = statement.as_bytes()[after_pos] as char;
                !next.is_alphanumeric() && next != '_' && next != '$'
            };

            if before_ok && after_ok {
                // Check if followed by `=>` (with optional whitespace) = simple arrow param
                let rest = statement[after_pos..].trim_start();
                if rest.starts_with("=>") {
                    return true;
                }

                // Check if preceded by `(` (possibly with other params) and the paren
                // group is followed by `=>` = parenthesized arrow param
                // Look backwards for an opening paren that contains this store_sub as a param
                if abs_found > 0 {
                    // Check if we're inside a parenthesized arrow param list
                    // by looking back for `(` and checking if the `)` after is followed by `=>`
                    let prefix = &statement[..abs_found];
                    if let Some(open_paren) = prefix.rfind('(') {
                        let _params_str = &statement[open_paren + 1..abs_found];
                        // Check that params_str doesn't contain a sub-expression that would
                        // indicate this is NOT a simple param list (e.g., no `=>` before ours)
                        // Find the matching close paren
                        let from_open = &statement[open_paren + 1..];
                        if let Some(close_offset) = find_matching_paren(from_open) {
                            let close_paren = open_paren + 1 + close_offset;
                            // Check that the close paren is followed by `=>` (arrow function)
                            // close_paren points to `)`, so skip past it to check what follows
                            let after_close = statement[close_paren + 1..].trim_start();
                            if after_close.starts_with("=>") {
                                // Verify store_sub is indeed a parameter in this list
                                let params_content = &statement[open_paren + 1..close_paren];
                                for param in params_content.split(',') {
                                    let trimmed = param.trim();
                                    let param_name =
                                        trimmed.split('=').next().unwrap_or(trimmed).trim();
                                    if param_name == store_sub {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            pos = abs_found + store_sub_len;
        } else {
            break;
        }
    }

    false
}

/// Pre-transform store sub names that are used as function calls with arguments.
///
/// Handles cases like:
/// - `$state(0)` -> `$state()(0)` where `$state` is a store sub, not a rune
/// - `$effect(() => {...})` -> `$effect()(() => {...})` where `$effect` is a store sub
///
/// This inserts the getter call `()` between the store sub name and the argument parens.
/// It's called BEFORE `transform_store_reads_client` so that the `is_already_call` check
/// in that function will see `$state()` and correctly skip adding another `()`.
fn transform_store_sub_calls(line: &str, store_sub_vars: &[String]) -> String {
    if store_sub_vars.is_empty() {
        return line.to_string();
    }

    let mut result = line.to_string();

    for store_sub in store_sub_vars {
        // Find pattern: $name( where $name is a store sub and is followed by `(`
        // but NOT by `()` (which would be the getter call itself, already inserted).
        // Also skip when preceded by `const $name = ` (store getter declaration).
        // Also skip when $name appears as a function parameter.
        let pattern = format!("{}(", store_sub);
        let mut new_result = String::new();
        let mut search_start = 0;

        while let Some(pos) = result[search_start..].find(&pattern) {
            let abs_pos = search_start + pos;

            // Check if this is a word boundary (not part of a larger identifier)
            let before_ok = if abs_pos == 0 {
                true
            } else {
                let prev_byte = result.as_bytes()[abs_pos - 1];
                let prev_char = prev_byte as char;
                !prev_char.is_alphanumeric() && prev_char != '_' && prev_char != '$'
            };

            if !before_ok {
                // Not a word boundary, skip
                new_result.push_str(&result[search_start..abs_pos + store_sub.len()]);
                search_start = abs_pos + store_sub.len();
                continue;
            }

            // Check if it's followed by `)` immediately (i.e., `$name()` - already a getter call)
            let paren_pos = abs_pos + store_sub.len(); // position of `(`
            let after_paren = paren_pos + 1;
            if after_paren < result.len() && result.as_bytes()[after_paren] == b')' {
                // This is `$name()` - already a getter call, skip
                new_result.push_str(&result[search_start..paren_pos]);
                search_start = paren_pos;
                continue;
            }

            // Check if this is inside a function parameter declaration
            // e.g., `function bar($state, $effect)` - skip these
            let before_text = &result[..abs_pos];
            let is_in_func_params = {
                // Look back for "function xxx(" pattern where our position is inside the parens
                let mut in_params = false;
                if let Some(last_func) = before_text.rfind("function ") {
                    let after_func = &result[last_func..abs_pos];
                    // Count parens to see if we're inside function params
                    let open_count = after_func.chars().filter(|c| *c == '(').count();
                    let close_count = after_func.chars().filter(|c| *c == ')').count();
                    if open_count > close_count {
                        in_params = true;
                    }
                }
                in_params
            };

            if is_in_func_params {
                // Inside function parameters, skip
                new_result.push_str(&result[search_start..paren_pos]);
                search_start = paren_pos;
                continue;
            }

            // Check if this is a store getter declaration: `const $name = () => $.store_get(...)`
            // We should skip this
            let trimmed_before = before_text.trim();
            if trimmed_before.ends_with(&format!("const {} =", store_sub))
                || trimmed_before.ends_with(&format!("let {} =", store_sub))
                || trimmed_before.ends_with(&format!("var {} =", store_sub))
            {
                // This is the getter declaration, skip
                new_result.push_str(&result[search_start..paren_pos]);
                search_start = paren_pos;
                continue;
            }

            // This is a store sub being called with arguments - insert `()` before the `(`
            // e.g., `$state(0)` -> `$state()(0)`
            new_result.push_str(&result[search_start..abs_pos]);
            new_result.push_str(store_sub);
            new_result.push_str("()");
            search_start = paren_pos; // continue from the `(` which will be kept
        }

        // Append remaining
        new_result.push_str(&result[search_start..]);
        result = new_result;
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
                // Also exclude `.` - a dot before means this is a property access like `obj.$value`
                let before_ok = if i == 0 {
                    true
                } else {
                    let prev_char = chars[i - 1];
                    !prev_char.is_alphanumeric()
                        && prev_char != '_'
                        && prev_char != '$'
                        && prev_char != '.'
                };

                // Check character after (must be non-identifier char)
                let after_idx = i + store_sub.len();
                let after_ok = if after_idx >= chars.len() {
                    true
                } else {
                    let next_char = chars[after_idx];
                    !next_char.is_alphanumeric() && next_char != '_' && next_char != '$'
                };

                // Check if this reference is already followed by `()` (getter call)
                // If so, skip adding () to avoid double-calling: $x() is already correct
                let is_already_call = after_idx < chars.len() && chars[after_idx] == '(';

                // Check if this is inside $.untrack() or $.derived() - don't transform there
                // $.untrack expects a getter function, so $store should remain $store
                // $.derived($store) passes the store getter directly as the derivation function
                let is_inside_getter_context = {
                    // Look back for patterns that expect a getter function reference
                    let prefix = &new_result;
                    let trimmed_prefix = prefix.trim_end();
                    trimmed_prefix.ends_with("$.untrack(") || trimmed_prefix.ends_with("$.derived(")
                };

                // Check if this is an object property key (e.g., `{ $userName4: 'user4' }`)
                // In that case, `$userName4:` - the `:` following is a property separator, not a getter
                let is_property_key = {
                    let after_idx2 = i + store_sub.len();
                    let mut k = after_idx2;
                    // Skip whitespace
                    while k < chars.len() && chars[k].is_whitespace() {
                        k += 1;
                    }
                    // Check for `:` (property key separator) but not `::`
                    k < chars.len()
                        && chars[k] == ':'
                        && (k + 1 >= chars.len() || chars[k + 1] != ':')
                };

                // Check if this is inside a string literal (e.g., '$foo' in $.store_unsub(..., '$foo', ...))
                let is_inside_string = if i > 0 {
                    let prev_char = chars[i - 1];
                    prev_char == '\'' || prev_char == '"'
                } else {
                    false
                };

                if before_ok && after_ok {
                    if is_inside_string {
                        // Inside a string literal - don't transform
                        new_result.push_str(store_sub);
                        i += store_sub.len();
                        continue;
                    } else if is_property_key {
                        // Don't transform property keys like `{ $userName4: value }`
                        new_result.push_str(store_sub);
                        i += store_sub.len();
                        continue;
                    } else if is_inside_getter_context {
                        // Inside $.untrack() or $.derived(), keep as $store (don't add parentheses)
                        new_result.push_str(store_sub);
                        i += store_sub.len();
                        continue;
                    } else if is_already_call {
                        // Already followed by `(` - don't add another `()`
                        // This handles cases like `$x()` or `$.update_store(x, $x())`
                        // where the `()` was already generated by store assignment transforms
                        new_result.push_str(store_sub);
                        i += store_sub.len();
                        continue;
                    } else {
                        // Bare store reference - add () to call the getter
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

/// Collapse a multi-line expression to a single line, matching esrap's behavior.
///
/// For object/array literals that span multiple lines but would fit on one line
/// (with padding spaces for objects), this collapses them. Respects the 60-char
/// threshold: if the collapsed form exceeds 60 chars, keeps the original multi-line.
fn collapse_to_single_line(content: &str) -> String {
    // Only attempt to collapse if multi-line
    if !content.contains('\n') {
        return content.to_string();
    }

    let trimmed = content.trim();
    // Check if this is an object or array literal
    let (is_object, open, close) = if trimmed.starts_with('{') && trimmed.ends_with('}') {
        (true, '{', '}')
    } else if trimmed.starts_with('[') && trimmed.ends_with(']') {
        (false, '[', ']')
    } else {
        return content.to_string();
    };

    // Extract inner content (between braces/brackets)
    let inner = &trimmed[1..trimmed.len() - 1];

    // Collapse whitespace: replace newlines and leading whitespace with single space
    let collapsed_inner: String = inner
        .split('\n')
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join(" ");

    // Build the collapsed form
    let collapsed = if is_object {
        format!("{} {} {}", open, collapsed_inner, close)
    } else {
        format!("{}{}{}", open, collapsed_inner, close)
    };

    // Only use collapsed form if it fits within the 60-char threshold
    if collapsed.len() <= 60 {
        collapsed
    } else {
        content.to_string()
    }
}

/// Determine if an expression needs parentheses when used on the right side
/// of a compound assignment expansion (e.g., `count += expr` -> `$.get(count) + expr`).
///
/// Parens are needed when the expression contains top-level operators that would
/// change semantics without grouping. Simple expressions like literals, identifiers,
/// function calls, member accesses, and template literals don't need parens.
///
/// This matches the behavior of the official Svelte compiler, which uses AST-based
/// code generation where esrap handles precedence naturally.
fn needs_compound_assignment_parens(expr: &str, _op: &str) -> bool {
    // Track nesting depth for parens/brackets/braces
    let mut depth = 0i32;
    let chars: Vec<char> = expr.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut has_top_level_operator = false;

    while i < len {
        let c = chars[i];
        match c {
            // Skip string/template literals
            '\'' | '"' | '`' => {
                let quote = c;
                i += 1;
                while i < len {
                    if chars[i] == '\\' {
                        i += 2;
                        continue;
                    }
                    if chars[i] == quote {
                        break;
                    }
                    i += 1;
                }
                i += 1;
                continue;
            }
            '(' | '[' | '{' => {
                depth += 1;
            }
            ')' | ']' | '}' => {
                depth -= 1;
            }
            _ => {
                if depth == 0 {
                    // Check for top-level binary/ternary/comma operators
                    // These indicate the expression needs grouping
                    match c {
                        '+' | '-' => {
                            // Check it's not a unary operator (at start or after operator)
                            if i > 0 {
                                // Look back to see if this is binary (preceded by value)
                                let prev = chars[i - 1];
                                if prev != '('
                                    && prev != ','
                                    && prev != '['
                                    && prev != '{'
                                    && prev != '?'
                                    && prev != ':'
                                    && prev != '='
                                    && prev != '<'
                                    && prev != '>'
                                    && prev != '!'
                                    && prev != '~'
                                    && prev != '+'
                                    && prev != '-'
                                    && prev != '*'
                                    && prev != '/'
                                    && prev != '%'
                                    && prev != '&'
                                    && prev != '|'
                                    && prev != '^'
                                    && !prev.is_whitespace()
                                {
                                    has_top_level_operator = true;
                                }
                            }
                        }
                        '*' | '/' | '%' | '&' | '|' | '^' => {
                            // These are always binary operators at top level
                            // (unary * doesn't exist in JS, and & | ^ as unary are very rare)
                            if i > 0 {
                                has_top_level_operator = true;
                            }
                        }
                        '?' | ',' => {
                            has_top_level_operator = true;
                        }
                        '<' | '>' => {
                            // Could be comparison or shift operator
                            if i > 0 {
                                has_top_level_operator = true;
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
        i += 1;
    }

    has_top_level_operator
}

/// Find the end of a statement value for client-side transformations.
fn find_statement_end_client(s: &str) -> usize {
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut prev_char = '\0';

    // Use char_indices() to get BYTE positions (not char positions),
    // so the returned index can be used directly for byte-level string slicing.
    // Using char-position indices with multibyte UTF-8 strings causes off-by-one bugs
    // for strings containing characters like 'é', '中', etc.
    for (byte_pos, c) in s.char_indices() {
        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && prev_char != '\\' {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            prev_char = c;
            continue;
        }

        if in_string {
            prev_char = c;
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
                    return byte_pos;
                }
            }
            ';' if depth == 0 => return byte_pos,
            // Newline at depth 0 ends the statement (JavaScript ASI)
            '\n' if depth == 0 => return byte_pos,
            _ => {}
        }
        prev_char = c;
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
    let char_indices: Vec<(usize, char)> = before.char_indices().collect();

    // First, find the position of the last block start (unmatched `{`)
    let mut block_start_byte = 0;
    let mut temp_depth = 0;
    let mut temp_in_string = false;
    let mut temp_string_char = ' ';

    for (i, &(byte_off, c)) in char_indices.iter().enumerate() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || char_indices[i - 1].1 != '\\') {
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
                // Remember the byte position after this `{`
                block_start_byte = byte_off + 1;
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
    let context = if block_start_byte > 0 && block_start_byte < before.len() {
        &before[block_start_byte..]
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
    let mut in_string = false;
    let mut string_char = ' ';
    let mut nested_ternary_depth = 0;
    let mut prev_char = None;

    for (byte_idx, c) in s.char_indices() {
        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && prev_char != Some('\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            prev_char = Some(c);
            continue;
        }

        if in_string {
            prev_char = Some(c);
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => {
                if depth > 0 {
                    depth -= 1;
                } else {
                    // At depth 0, a closing brace/bracket/paren ends the expression
                    return byte_idx;
                }
            }
            ';' if depth == 0 => return byte_idx,
            '\n' if depth == 0 => return byte_idx,
            // Stop at ',' at depth 0 (e.g., inside object literal: {id: eid = expr, name: ...})
            ',' if depth == 0 => return byte_idx,
            // Track nested ternaries
            '?' if depth == 0 => {
                // Check it's not optional chaining (?.)
                let next_byte = byte_idx + c.len_utf8();
                if next_byte < s.len() && s.as_bytes()[next_byte] != b'.' {
                    nested_ternary_depth += 1;
                }
            }
            // Stop at `:` when in a ternary and not in a nested ternary
            ':' if depth == 0 && in_ternary && nested_ternary_depth == 0 => {
                return byte_idx;
            }
            ':' if depth == 0 && nested_ternary_depth > 0 => {
                nested_ternary_depth -= 1;
            }
            _ => {}
        }
        prev_char = Some(c);
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
    if paren_depth != 0 || bracket_depth != 0 || brace_depth != 0 || in_block_comment {
        return true;
    }

    // Check for trailing comma in variable declarations (multi-declarator continuation)
    // e.g., `let x = 'x',` should be considered incomplete because more declarators follow
    let trimmed = expr.trim();
    if trimmed.ends_with(',') {
        // Check if this looks like a variable declaration
        let first_line = trimmed.lines().next().unwrap_or("");
        let first_trimmed = first_line.trim();
        if first_trimmed.starts_with("let ")
            || first_trimmed.starts_with("const ")
            || first_trimmed.starts_with("var ")
        {
            return true;
        }
    }

    false
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
        // It's `==` or `===` (comparison operator, not assignment)
        // e.g., `b = c === 'a'` - `c` is NOT a function parameter here
        if k + 1 < chars.len() && chars[k + 1] == '=' {
            // It's `==` or `===` comparison - this variable is not a parameter
            // Fall through to return false
        } else {
            // It's `param = default`, likely a default parameter
            // Need to check if we're inside param parens
            // For now, trust context
            return true;
        }
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

    // Handle `}` - the variable might be the last element in a destructuring parameter.
    // For example, `function foo(node, {tag, opt})` - when checking `opt`,
    // the next char after `opt` is `}` (closing the destructuring pattern).
    // We need to skip through `}`, then possibly `]`, then `)` and check if `) {` or `) =>` follows.
    if next_char == '}' || next_char == ']' {
        let mut m = k;
        // Skip closing braces/brackets to find the closing paren of the parameter list
        while m < chars.len() && (chars[m] == '}' || chars[m] == ']') {
            m += 1;
        }
        // Skip whitespace
        while m < chars.len() && chars[m].is_whitespace() {
            m += 1;
        }
        if m < chars.len() && chars[m] == ')' {
            // Found the closing paren, skip it and whitespace
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
        // Also could be followed by `,` in a multi-param destructuring
        if m < chars.len() && chars[m] == ',' {
            // Same logic as the ',' case above
            let mut depth = 1;
            m += 1;
            while m < chars.len() && depth > 0 {
                if chars[m] == '(' {
                    depth += 1;
                } else if chars[m] == ')' {
                    depth -= 1;
                    if depth == 0 {
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
/// Check if a variable reference at `var_start` is inside a `for (let/const <same_var> ...)` scope.
///
/// In JavaScript, `for (let x = 0; x < 10; x++)` creates a block scope where `x` refers
/// to the loop variable, not any outer variable with the same name. This function detects
/// when a variable reference is inside such a for-loop scope and should NOT be transformed.
///
/// Strategy: scan backwards from var_start tracking brace depth. At each scope boundary
/// (opening `{`), look for a `for (let <var>` or `for (const <var>` pattern that would
/// indicate this scope is a for-loop body with the variable declared in the init.
/// Convert a byte position in a string to a character index.
/// Returns the character index for the given byte offset.
fn byte_pos_to_char_index(s: &str, byte_pos: usize) -> usize {
    s[..byte_pos].chars().count()
}

/// Also check if we're directly inside the for-loop header (between the `for (` and `)`).
fn is_shadowed_by_for_loop_var(chars: &[char], var_start: usize, var_name: &str) -> bool {
    // First, check if we're inside a for-loop HEADER (init, test, or update section)
    // where the variable is declared as `let`/`const` in the init.
    // Scan backwards to find an unmatched `(` that might be a for-loop's opening paren.
    let mut paren_depth: i32 = 0;
    let mut i = var_start;
    while i > 0 {
        i -= 1;
        let c = chars[i];
        if c == ')' {
            paren_depth += 1;
        } else if c == '(' {
            if paren_depth == 0 {
                // Found an unmatched opening paren at position `i`.
                // Check if it's preceded by `for` keyword.
                let mut j = i;
                while j > 0 && chars[j - 1].is_whitespace() {
                    j -= 1;
                }
                if j >= 3 {
                    let prefix: String = chars[j - 3..j].iter().collect();
                    if prefix == "for" && (j == 3 || !is_identifier_char(chars[j - 4])) {
                        // We're inside a `for (...)` header.
                        // Check if there's a `let <var>` or `const <var>` declaration inside.
                        // Scan forward from `(` to find `let <var>` or `const <var>`.
                        let header_start = i + 1;
                        let header: String = chars[header_start..var_start].iter().collect();
                        let let_pattern = format!("let {} ", var_name);
                        let const_pattern = format!("const {} ", var_name);
                        let let_pattern2 = format!("let {}=", var_name);
                        let const_pattern2 = format!("const {}=", var_name);
                        if header.contains(&let_pattern)
                            || header.contains(&const_pattern)
                            || header.contains(&let_pattern2)
                            || header.contains(&const_pattern2)
                        {
                            return true;
                        }
                        // Also check if var_start IS the declared variable itself:
                        // e.g., `for (let x = 0; ...)` where var_start points to `x` in `let x`.
                        // In this case, the header text before var_start ends with `let ` or `const `.
                        let header_trimmed = header.trim_end();
                        if header_trimmed == "let"
                            || header_trimmed == "const"
                            || header_trimmed == "var"
                        {
                            return true;
                        }
                    }
                }
                break; // Stop scanning - we've left the innermost paren group
            }
            paren_depth -= 1;
        }
    }

    // Second, check if we're inside a for-loop BODY where the variable is declared in the header.
    // Track brace depth as we scan backwards.
    let mut brace_depth: i32 = 0;
    let mut j = var_start;
    while j > 0 {
        j -= 1;
        let c = chars[j];

        if c == '}' {
            brace_depth += 1;
        } else if c == '{' {
            if brace_depth > 0 {
                brace_depth -= 1;
            } else {
                // Found an opening brace at our scope level.
                // Check if this is a for-loop body by looking backward for `for (...) {`
                let mut k = j;
                while k > 0 && chars[k - 1].is_whitespace() {
                    k -= 1;
                }
                // Should find `)` before the `{`
                if k > 0 && chars[k - 1] == ')' {
                    k -= 1;
                    // Find the matching `(`
                    let mut p_depth: i32 = 0;
                    let mut open_paren = None;
                    let mut m = k;
                    while m > 0 {
                        m -= 1;
                        if chars[m] == ')' {
                            p_depth += 1;
                        } else if chars[m] == '(' {
                            if p_depth == 0 {
                                open_paren = Some(m);
                                break;
                            }
                            p_depth -= 1;
                        }
                    }
                    if let Some(op) = open_paren {
                        // Check if preceded by `for` keyword
                        let mut n = op;
                        while n > 0 && chars[n - 1].is_whitespace() {
                            n -= 1;
                        }
                        if n >= 3 {
                            let prefix: String = chars[n - 3..n].iter().collect();
                            if prefix == "for" && (n == 3 || !is_identifier_char(chars[n - 4])) {
                                // Found `for (...)`. Check if the header contains `let <var>` or `const <var>`.
                                let header_start = op + 1;
                                let header_end = k; // the matching `)` position
                                if header_end > header_start {
                                    let header: String =
                                        chars[header_start..header_end].iter().collect();
                                    // Check for `let var` or `const var` as a word boundary match
                                    for keyword in &["let ", "const "] {
                                        let pattern = format!("{}{}", keyword, var_name);
                                        if let Some(pos) = header.find(&pattern) {
                                            let after = pos + pattern.len();
                                            // Ensure it's a word boundary (next char is not alphanumeric/underscore)
                                            if after >= header.len()
                                                || !is_identifier_char(
                                                    header[after..].chars().next().unwrap_or(' '),
                                                )
                                            {
                                                return true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // Whether or not it was a for-loop, we've left a scope boundary -
                // don't look further up since function scopes are handled elsewhere.
                // But we DO need to continue looking for outer for-loops, so don't break.
                // Actually, in JS, a for-loop's `let` only scopes to that for-loop.
                // If we've exited the for-loop body `{...}`, the var is no longer shadowed.
                // We should only look at the INNERMOST enclosing `{...}` scope for for-loops.
                // Actually, we need to check multiple levels for nested for-loops, BUT
                // each opening `{` at our level is a potential for-loop body.
                // For simplicity, just check each opening `{` at our brace level.
                // Continue scanning backwards to handle nested scoping.
            }
        }
    }

    false
}

/// Check if a variable at position `var_start` is shadowed by a local variable declaration
/// (`const`, `let`, or `var`) inside an enclosing function/arrow scope.
///
/// This handles cases like:
/// ```js
/// let foo = $.mutable_source(tmp.foo);  // outer `foo` is a state variable
/// let result = (() => {
///     const foo = writable(false);      // inner `foo` is a local const
///     return { foo };                    // this `foo` should NOT be $.get(foo)
/// })();
/// ```
fn is_shadowed_by_local_var_decl(chars: &[char], var_start: usize, var_name: &str) -> bool {
    let var_len = var_name.len();
    let mut brace_depth: i32 = 0;
    let mut i = var_start;
    while i > 0 {
        i -= 1;
        let c = chars[i];

        if c == '}' {
            brace_depth += 1;
        } else if c == '{' {
            // Skip template literal interpolation `${`
            if i > 0 && chars[i - 1] == '$' {
                if brace_depth > 0 {
                    brace_depth -= 1;
                }
                continue;
            }
            if brace_depth > 0 {
                brace_depth -= 1;
            } else {
                // We've entered an enclosing scope. Check if this is a function/arrow body.
                let mut j = i;
                while j > 0 && chars[j - 1].is_whitespace() {
                    j -= 1;
                }

                // Check for arrow function body: `) => {` or `param => {`
                let is_arrow = j >= 2 && chars[j - 2] == '=' && chars[j - 1] == '>';

                // Check for function body: `) {` preceded by `function` or identifier
                let is_function_body = if j > 0 && chars[j - 1] == ')' {
                    // Find matching (
                    let mut pd = 0;
                    let mut k = j - 1;
                    let mut found_open = false;
                    while k > 0 {
                        k -= 1;
                        if chars[k] == ')' {
                            pd += 1;
                        } else if chars[k] == '(' {
                            if pd == 0 {
                                found_open = true;
                                break;
                            }
                            pd -= 1;
                        }
                    }
                    if found_open {
                        // Check for `function` keyword before (
                        let mut m = k;
                        while m > 0 && chars[m - 1].is_whitespace() {
                            m -= 1;
                        }
                        // Skip optional function name
                        while m > 0 && is_identifier_char(chars[m - 1]) {
                            m -= 1;
                        }
                        while m > 0 && chars[m - 1].is_whitespace() {
                            m -= 1;
                        }
                        if m >= 8 {
                            let prefix: String = chars[m - 8..m].iter().collect();
                            prefix == "function"
                        } else {
                            false
                        }
                    } else {
                        false
                    }
                } else {
                    false
                };

                if is_arrow || is_function_body {
                    // We're inside a function/arrow body. Now scan forward from `i+1`
                    // to find local `const/let/var varname` declarations at depth 0 within
                    // this function body, before our variable reference.
                    let mut scan = i + 1;
                    let mut inner_depth: i32 = 0;
                    let mut in_str: Option<char> = None;
                    let mut tmpl_stack: Vec<i32> = Vec::new();
                    let mut in_line_comment = false;
                    let mut in_block_comment = false;
                    let mut found_decl = false;
                    // Track how many nested function scopes we're inside.
                    // A "function scope" is a {} body that follows =>, function keyword,
                    // or a method/getter/setter definition.
                    let mut func_scope_depth: i32 = 0;
                    // Stack to track which brace depths correspond to function scopes
                    let mut func_scope_brace_depths: Vec<i32> = Vec::new();

                    while scan < var_start {
                        let sc = chars[scan];

                        // Handle comments
                        if in_line_comment {
                            if sc == '\n' {
                                in_line_comment = false;
                            }
                            scan += 1;
                            continue;
                        }
                        if in_block_comment {
                            if sc == '*' && scan + 1 < chars.len() && chars[scan + 1] == '/' {
                                in_block_comment = false;
                                scan += 2;
                                continue;
                            }
                            scan += 1;
                            continue;
                        }

                        // Handle template literal depth tracking
                        if !tmpl_stack.is_empty() && in_str.is_none() {
                            if sc == '{' {
                                if let Some(d) = tmpl_stack.last_mut() {
                                    *d += 1;
                                }
                            } else if sc == '}' {
                                let should_pop = if let Some(d) = tmpl_stack.last_mut() {
                                    *d -= 1;
                                    *d < 0
                                } else {
                                    false
                                };
                                if should_pop {
                                    tmpl_stack.pop();
                                    in_str = Some('`');
                                    scan += 1;
                                    continue;
                                }
                            }
                        }

                        // Handle string boundaries
                        if in_str.is_none() {
                            if sc == '/' && scan + 1 < chars.len() {
                                if chars[scan + 1] == '/' {
                                    in_line_comment = true;
                                    scan += 1;
                                    continue;
                                } else if chars[scan + 1] == '*' {
                                    in_block_comment = true;
                                    scan += 1;
                                    continue;
                                }
                            }
                            if sc == '\'' || sc == '"' || sc == '`' {
                                in_str = Some(sc);
                                scan += 1;
                                continue;
                            }
                        } else if in_str == Some('`')
                            && sc == '$'
                            && scan + 1 < chars.len()
                            && chars[scan + 1] == '{'
                        {
                            in_str = None;
                            tmpl_stack.push(0);
                            scan += 2;
                            continue;
                        } else if Some(sc) == in_str {
                            // Check for escape
                            let escaped = if scan > 0 && chars[scan - 1] == '\\' {
                                let mut bc = 0;
                                let mut bk = scan - 1;
                                while bk > 0 && chars[bk] == '\\' {
                                    bc += 1;
                                    bk -= 1;
                                }
                                bc % 2 == 1
                            } else {
                                false
                            };
                            if !escaped {
                                in_str = None;
                            }
                            scan += 1;
                            continue;
                        }

                        if in_str.is_some() {
                            scan += 1;
                            continue;
                        }

                        // Track brace depth within the function body
                        if sc == '{' {
                            inner_depth += 1;
                            // Check if this `{` opens a function scope by looking
                            // at what precedes it (arrow `=>`, function keyword,
                            // getter/setter/method pattern)
                            let mut bk = scan;
                            while bk > 0 && chars[bk - 1].is_whitespace() {
                                bk -= 1;
                            }
                            let opens_func_scope =
                                if bk >= 2 && chars[bk - 2] == '=' && chars[bk - 1] == '>' {
                                    true // arrow function
                                } else if bk > 0 && chars[bk - 1] == ')' {
                                    // Could be function/method/getter/setter: check for `)` pattern
                                    // Simple heuristic: any `) {` that isn't a control structure
                                    // (if/for/while/switch) is likely a function scope
                                    let mut pd = 0;
                                    let mut pk = bk - 1;
                                    let mut found_open = false;
                                    while pk > 0 {
                                        pk -= 1;
                                        if chars[pk] == ')' {
                                            pd += 1;
                                        } else if chars[pk] == '(' {
                                            if pd == 0 {
                                                found_open = true;
                                                break;
                                            }
                                            pd -= 1;
                                        }
                                    }
                                    if found_open {
                                        let mut mk = pk;
                                        while mk > 0 && chars[mk - 1].is_whitespace() {
                                            mk -= 1;
                                        }
                                        // Check for get/set/function/identifier before (
                                        let word_end = mk;
                                        while mk > 0 && is_identifier_char(chars[mk - 1]) {
                                            mk -= 1;
                                        }
                                        let word: String = chars[mk..word_end].iter().collect();
                                        // If it's a control structure keyword, it's NOT a function scope
                                        !matches!(
                                            word.as_str(),
                                            "if" | "for" | "while" | "switch" | "catch"
                                        )
                                    } else {
                                        false
                                    }
                                } else {
                                    false
                                };
                            if opens_func_scope {
                                func_scope_depth += 1;
                                func_scope_brace_depths.push(inner_depth);
                            }
                        } else if sc == '}' {
                            if func_scope_brace_depths.last() == Some(&inner_depth) {
                                func_scope_brace_depths.pop();
                                func_scope_depth -= 1;
                            }
                            inner_depth -= 1;
                        }

                        // Look at declarations at any depth within this function.
                        // `const`/`let` declarations are block-scoped: they shadow within their
                        // enclosing block and all nested blocks. Since we're scanning forward
                        // from the function body start to `var_start`, any declaration we find
                        // is in scope at `var_start` as long as we haven't exited the block.
                        if func_scope_depth == 0 {
                            // Check for `const varname` or `let varname` or `var varname`
                            for keyword in &["const ", "let ", "var "] {
                                let kw_len = keyword.len();
                                if scan + kw_len + var_len <= var_start {
                                    let potential_kw: String =
                                        chars[scan..scan + kw_len].iter().collect();
                                    if potential_kw == *keyword {
                                        // Make sure it's a standalone keyword
                                        let before_ok =
                                            scan == i + 1 || !is_identifier_char(chars[scan - 1]);
                                        if before_ok {
                                            // Now check if var_name follows (possibly after whitespace)
                                            let mut vp = scan + kw_len;
                                            // Skip optional destructuring or whitespace
                                            while vp < var_start && chars[vp].is_whitespace() {
                                                vp += 1;
                                            }
                                            if vp + var_len <= var_start {
                                                let potential_var: String =
                                                    chars[vp..vp + var_len].iter().collect();
                                                if potential_var == var_name {
                                                    let after_ok = vp + var_len >= chars.len()
                                                        || !is_identifier_char(chars[vp + var_len]);
                                                    if after_ok {
                                                        found_decl = true;
                                                    }
                                                }
                                            }
                                            // Check destructuring patterns: const { varname, ... } = ...
                                            // or const [ varname, ... ] = ...
                                            if !found_decl
                                                && vp < var_start
                                                && (chars[vp] == '{' || chars[vp] == '[')
                                            {
                                                let close_char =
                                                    if chars[vp] == '{' { '}' } else { ']' };
                                                // Find the closing brace/bracket
                                                let mut dp = vp + 1;
                                                let mut d_depth = 1i32;
                                                while dp < var_start && d_depth > 0 {
                                                    if chars[dp] == chars[vp] {
                                                        d_depth += 1;
                                                    } else if chars[dp] == close_char {
                                                        d_depth -= 1;
                                                    }
                                                    if d_depth > 0 {
                                                        dp += 1;
                                                    }
                                                }
                                                // Check if var_name appears in the destructuring pattern
                                                if d_depth == 0 {
                                                    let destr_text: String =
                                                        chars[vp + 1..dp].iter().collect();
                                                    // Check for the variable name as a standalone identifier
                                                    if let Some(name_pos) =
                                                        destr_text.find(var_name)
                                                    {
                                                        let before_ok2 = name_pos == 0
                                                            || !is_identifier_char(
                                                                destr_text.as_bytes()[name_pos - 1]
                                                                    as char,
                                                            );
                                                        let after_pos = name_pos + var_len;
                                                        let after_ok2 = after_pos
                                                            >= destr_text.len()
                                                            || !is_identifier_char(
                                                                destr_text.as_bytes()[after_pos]
                                                                    as char,
                                                            );
                                                        if before_ok2 && after_ok2 {
                                                            found_decl = true;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        scan += 1;
                    }

                    // Only report as shadowed if the declaration was found AND the
                    // variable reference is NOT inside a nested function scope
                    // (getter, method, inner function, arrow, etc.). If the reference
                    // is inside a nested function, it accesses the declaration via closure,
                    // not via shadowing.
                    if found_decl && func_scope_depth == 0 {
                        return true;
                    }
                    // If we found this is a function scope but didn't find the var declaration,
                    // or the reference is in a nested function scope, continue scanning backwards.
                }
            }
        }
    }

    false
}

fn is_shadowed_by_function_param(chars: &[char], var_start: usize, var_name: &str) -> bool {
    // Strategy: scan backwards from var_start to find the nearest enclosing function scope.
    // If we find a function with this variable as a parameter, it's shadowed.
    // We need to track brace depth to understand scope nesting.

    let var_len = var_name.len();

    // Check for concise arrow functions: (a, b) => expr or (a, b) => (expr)
    // Scan backwards from var_start to find `=>`, tracking paren depth, then check params.
    {
        let mut paren_depth = 0i32;
        let mut j = var_start;
        let mut found_arrow_at: Option<usize> = None;
        while j > 0 {
            j -= 1;
            let c = chars[j];
            if c == ')' {
                paren_depth += 1;
            } else if c == '(' {
                if paren_depth == 0 {
                    // Before breaking, check if `=>` is just before this `(`
                    // This handles: (a, b) => (expr) where we're inside the parens of (expr)
                    let mut k2 = j;
                    while k2 > 0 && chars[k2 - 1].is_whitespace() {
                        k2 -= 1;
                    }
                    if k2 >= 2 && chars[k2 - 1] == '>' && chars[k2 - 2] == '=' {
                        // Found `=> (` - treat this as an arrow body in parens
                        found_arrow_at = Some(k2 - 1);
                    }
                    break;
                }
                paren_depth -= 1;
            } else if c == '{' || c == '}' {
                break; // Hit a block boundary
            } else if c == '>' && j > 0 && chars[j - 1] == '=' && paren_depth == 0 {
                found_arrow_at = Some(j);
                break;
            }
        }

        if let Some(arrow_j) = found_arrow_at {
            // `arrow_j` points to the `>` of `=>`
            // Check if preceded by (params) containing our variable
            let mut k = arrow_j - 1; // at '='
            // Skip whitespace before =>
            while k > 0 && chars[k - 1].is_whitespace() {
                k -= 1;
            }
            if k > 0 && chars[k - 1] == ')' {
                // Find matching (
                let close_idx = k - 1;
                let mut pd = 0;
                let mut m = close_idx;
                let mut open_idx = None;
                while m > 0 {
                    m -= 1;
                    if chars[m] == ')' {
                        pd += 1;
                    } else if chars[m] == '(' {
                        if pd == 0 {
                            open_idx = Some(m);
                            break;
                        }
                        pd -= 1;
                    }
                }
                if let Some(open) = open_idx {
                    // Check if var_name is in the parameter list
                    let param_text: String = chars[open + 1..close_idx].iter().collect();
                    let param_chars: Vec<char> = param_text.chars().collect();
                    let mut pi = 0;
                    while pi < param_chars.len() {
                        while pi < param_chars.len() && param_chars[pi].is_whitespace() {
                            pi += 1;
                        }
                        if pi + var_len <= param_chars.len() {
                            let potential: String = param_chars[pi..pi + var_len].iter().collect();
                            if potential == var_name {
                                let before_ok = pi == 0 || !is_identifier_char(param_chars[pi - 1]);
                                let after_ok = pi + var_len >= param_chars.len()
                                    || !is_identifier_char(param_chars[pi + var_len]);
                                if before_ok && after_ok {
                                    return true;
                                }
                            }
                        }
                        pi += 1;
                    }
                }
            } else if k > 0 && is_identifier_char(chars[k - 1]) {
                // Single param arrow: `x => expr`
                let end = k;
                let mut start = k;
                while start > 0 && is_identifier_char(chars[start - 1]) {
                    start -= 1;
                }
                let param: String = chars[start..end].iter().collect();
                if param == var_name {
                    return true;
                }
            }
        }
    }

    // Track brace depth as we scan backwards
    let mut brace_depth = 0;
    let mut i = var_start;

    while i > 0 {
        i -= 1;
        let c = chars[i];

        if c == '}' {
            brace_depth += 1;
        } else if c == '{' {
            // Skip template literal interpolation `${` - not a scope boundary.
            // When scanning backwards, the `}` that closes this interpolation was already
            // encountered and incremented brace_depth. We need to undo that by decrementing
            // brace_depth here, and then skip this `{` entirely.
            if i > 0 && chars[i - 1] == '$' {
                if brace_depth > 0 {
                    brace_depth -= 1;
                }
                continue;
            }
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

                // Handle arrow functions with parenthesized body: (params) => ({...})
                // In this case, the { is preceded by ( which is preceded by =>
                if j > 0 && chars[j - 1] == '(' {
                    let mut k = j - 1;
                    while k > 0 && chars[k - 1].is_whitespace() {
                        k -= 1;
                    }
                    if k >= 2 && chars[k - 2] == '=' && chars[k - 1] == '>' {
                        // This is `=> ({` pattern - treat as arrow function body
                        j = k - 2;
                        while j > 0 && chars[j - 1].is_whitespace() {
                            j -= 1;
                        }
                    }
                }

                // Also skip => for arrow functions: (params) => {
                if j >= 2 && chars[j - 2] == '=' && chars[j - 1] == '>' {
                    j -= 2;
                    // Skip whitespace after the )
                    while j > 0 && chars[j - 1].is_whitespace() {
                        j -= 1;
                    }
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

/// Check if chars at position `end` are preceded by the given pattern string.
/// Compares chars[end - pattern.len() .. end] against the ASCII pattern.
#[inline]
fn chars_match(chars: &[char], end: usize, pattern: &str) -> bool {
    let pat_bytes = pattern.as_bytes();
    let pat_len = pat_bytes.len();
    if end < pat_len {
        return false;
    }
    let start = end - pat_len;
    for (j, &b) in pat_bytes.iter().enumerate() {
        if chars[start + j] != b as char {
            return false;
        }
    }
    true
}

/// Check if a character can start a JavaScript identifier (not a digit).
#[inline]
fn is_identifier_start_char(c: char) -> bool {
    c.is_alphabetic() || c == '_' || c == '$'
}

/// Transform state variable references to $.get() calls.
/// All state variables (including those initialized with objects/arrays) need $.get() wrapping
/// when reading their values, including when accessing properties.
///
/// Optimized: single-pass multi-variable matching with FxHashSet lookup and
/// zero-allocation prefix checks via chars_match.
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

    if effective_state_vars.is_empty() {
        return expr.to_string();
    }

    // Build a HashSet for O(1) variable lookup
    let var_set: FxHashSet<&str> = effective_state_vars.iter().map(|v| v.as_str()).collect();

    let chars: Vec<char> = expr.chars().collect();
    let mut new_result = String::with_capacity(expr.len() + expr.len() / 4);
    let mut i = 0;

    // Track whether we're inside a string literal
    let mut in_string: Option<char> = None; // None or Some('\'') or Some('"') or Some('`')
    // Stack for template literal nesting: tracks brace depth inside `${...}` interpolations.
    let mut template_literal_depth_stack: Vec<i32> = Vec::new();
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

        // Handle template literal interpolation brace tracking
        if !template_literal_depth_stack.is_empty() && in_string.is_none() {
            if c == '{' {
                if let Some(depth) = template_literal_depth_stack.last_mut() {
                    *depth += 1;
                }
            } else if c == '}' {
                let should_pop = if let Some(depth) = template_literal_depth_stack.last_mut() {
                    *depth -= 1;
                    *depth < 0
                } else {
                    false
                };
                if should_pop {
                    template_literal_depth_stack.pop();
                    // Re-enter template literal string mode
                    in_string = Some('`');
                    new_result.push(c);
                    i += 1;
                    continue;
                }
            }
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
        } else if in_string == Some('`') && c == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
            // Template literal interpolation: `...${expr}...`
            // Temporarily exit string mode to process the expression
            in_string = None;
            template_literal_depth_stack.push(0);
            new_result.push(c);
            new_result.push('{');
            i += 2;
            continue;
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

        // Skip replacements inside string literals (but NOT template literal interpolations)
        if in_string.is_some() {
            new_result.push(c);
            i += 1;
            continue;
        }

        // At potential identifier start position
        if is_identifier_start_char(c) {
            // Extract full identifier
            let id_start = i;
            while i < chars.len() && is_identifier_char(chars[i]) {
                i += 1;
            }
            let id_end = i;
            let var_len = id_end - id_start;

            // Check word boundary before (digits are handled by is_identifier_start_char)
            let before_ok = id_start == 0 || !is_identifier_char(chars[id_start - 1]);

            // Build identifier string and check if it's a state variable
            let identifier: String = chars[id_start..id_end].iter().collect();

            if before_ok && var_set.contains(identifier.as_str()) {
                // Apply all the same context checks, using id_start as position
                let pos = id_start;

                // Check if preceded by dot, but NOT if it's a spread operator (...)
                let preceded_by_dot =
                    pos > 0 && chars[pos - 1] == '.' && !chars_match(&chars, pos, "...");
                // Check if preceded by `#` (private field access like this.#y)
                let preceded_by_hash = pos > 0 && chars[pos - 1] == '#';
                let already_wrapped =
                    chars_match(&chars, pos, "$.safe_get(") || chars_match(&chars, pos, "$.get(");
                let in_set_first_arg = chars_match(&chars, pos, "$.set(");
                let in_update_arg = chars_match(&chars, pos, "$.update(");
                let in_update_pre_arg = chars_match(&chars, pos, "$.update_pre(");
                let in_mutate_first_arg = chars_match(&chars, pos, "$.mutate(");

                // Check if this variable is in a function parameter position
                let in_param_position = is_in_function_param_position(&chars, pos, pos + var_len);

                // Check if this variable is on the left side of an assignment
                let is_assignment_target = is_on_left_side_of_assignment(&chars, pos, var_len);

                // Check if this is a getter/setter method name
                let is_getter_setter_name = {
                    let after_idx = pos + var_len;
                    let mut k = after_idx;
                    while k < chars.len() && chars[k].is_whitespace() {
                        k += 1;
                    }
                    let has_paren_after = k < chars.len() && chars[k] == '(';
                    let has_get_before = chars_match(&chars, pos, "get ");
                    let has_set_before = chars_match(&chars, pos, "set ");
                    has_paren_after && (has_get_before || has_set_before)
                };

                // Check if this is an object property key
                let is_property_key = {
                    let after_idx = pos + var_len;
                    let mut k = after_idx;
                    while k < chars.len() && chars[k].is_whitespace() {
                        k += 1;
                    }
                    let has_colon_after = k < chars.len() && chars[k] == ':';
                    if has_colon_after {
                        let mut is_ternary = false;
                        let mut depth_paren = 0i32;
                        let mut depth_brace = 0i32;
                        let mut depth_bracket = 0i32;
                        let mut scan = pos;
                        while scan > 0 {
                            scan -= 1;
                            let sc = chars[scan];
                            match sc {
                                ')' => depth_paren += 1,
                                '(' => {
                                    depth_paren -= 1;
                                    if depth_paren < 0 {
                                        break;
                                    }
                                }
                                '}' => depth_brace += 1,
                                '{' => {
                                    depth_brace -= 1;
                                    if depth_brace < 0 {
                                        break;
                                    }
                                }
                                ']' => depth_bracket += 1,
                                '[' => {
                                    depth_bracket -= 1;
                                    if depth_bracket < 0 {
                                        break;
                                    }
                                }
                                '?' if depth_paren == 0
                                    && depth_brace == 0
                                    && depth_bracket == 0 =>
                                {
                                    if scan + 1 < chars.len() && chars[scan + 1] == '.' {
                                        continue;
                                    }
                                    is_ternary = true;
                                    break;
                                }
                                ';' | ',' => {
                                    if depth_paren == 0 && depth_brace == 0 && depth_bracket == 0 {
                                        break;
                                    }
                                }
                                _ => {}
                            }
                        }
                        !is_ternary
                    } else {
                        false
                    }
                };

                // Check if this is a shorthand property in an object literal
                let is_shorthand_property = is_shorthand_object_property(&chars, pos, var_len);

                // Check if this variable is shadowed
                let is_shadowed = is_shadowed_by_function_param(&chars, pos, &identifier)
                    || is_shadowed_by_for_loop_var(&chars, pos, &identifier)
                    || is_shadowed_by_local_var_decl(&chars, pos, &identifier);

                // Check if this variable is the target of an update expression
                let is_update_target = {
                    let after_idx = pos + var_len;
                    let has_postfix_update = after_idx + 1 < chars.len()
                        && ((chars[after_idx] == '+' && chars[after_idx + 1] == '+')
                            || (chars[after_idx] == '-' && chars[after_idx + 1] == '-'));
                    let has_prefix_update = pos >= 2
                        && ((chars[pos - 2] == '+' && chars[pos - 1] == '+')
                            || (chars[pos - 2] == '-' && chars[pos - 1] == '-'));
                    has_postfix_update || has_prefix_update
                };

                // Check if this is a method shorthand name in an object literal
                let is_method_shorthand_name = is_object_method_shorthand(&chars, pos, var_len);

                if !already_wrapped
                    && !preceded_by_dot
                    && !preceded_by_hash
                    && !in_set_first_arg
                    && !in_update_arg
                    && !in_update_pre_arg
                    && !in_mutate_first_arg
                    && !in_param_position
                    && !is_assignment_target
                    && !is_getter_setter_name
                    && !is_property_key
                    && !is_shadowed
                    && !is_update_target
                    && !is_method_shorthand_name
                {
                    // Check if this is a var-declared state variable that needs $.safe_get()
                    let use_safe_get = VAR_STATE_VARS.with(|v| v.borrow().contains(&identifier));
                    let getter = if use_safe_get { "$.safe_get" } else { "$.get" };
                    if is_shorthand_property {
                        // Expand shorthand property: { foo } -> { foo: $.get(foo) }
                        new_result.push_str(&identifier);
                        new_result.push_str(": ");
                        new_result.push_str(getter);
                        new_result.push('(');
                        new_result.push_str(&identifier);
                        new_result.push(')');
                    } else {
                        new_result.push_str(getter);
                        new_result.push('(');
                        new_result.push_str(&identifier);
                        new_result.push(')');
                    }
                    continue;
                }

                // Not a state var match or excluded by checks - emit as-is
                new_result.push_str(&identifier);
            } else {
                // Not a state variable - emit the identifier as-is
                new_result.push_str(&identifier);
            }
            continue;
        }

        new_result.push(c);
        i += 1;
    }

    new_result
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
                // `{` at the very start of the expression string.
                // In the contexts where wrap_state_vars_in_expr is called (e.g.,
                // inside $derived() arguments), the expression starts with `{`
                // which means it IS an object literal (not a block statement,
                // since we're in an expression context).
                // We already confirmed the variable is followed by `,` or `}`,
                // so this is a shorthand property.
                return true;
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

        // If preceded by `,`, we need to distinguish array context from object context.
        // Scan backwards to find the enclosing unmatched `[` or `{`.
        // If the enclosing bracket is `[`, this is an array element, not a shorthand property.
        // If the enclosing bracket is `{`, this is likely a shorthand object property.
        let mut depth_brace = 0i32; // { }
        let mut depth_bracket = 0i32; // [ ]
        let mut depth_paren = 0i32; // ( )
        let mut scan = j - 1; // start from the `,` position
        loop {
            if scan == 0 {
                // Reached beginning without finding enclosing bracket - not an object
                return false;
            }
            scan -= 1;
            match chars[scan] {
                '}' => depth_brace += 1,
                '{' => {
                    if depth_brace == 0 {
                        // Found the enclosing `{` - this is an object context
                        return true;
                    }
                    depth_brace -= 1;
                }
                ']' => depth_bracket += 1,
                '[' => {
                    if depth_bracket == 0 {
                        // Found the enclosing `[` - this is an array context
                        return false;
                    }
                    depth_bracket -= 1;
                }
                ')' => depth_paren += 1,
                '(' => {
                    if depth_paren == 0 {
                        // Found the enclosing `(` - this is a function call/grouping, not object
                        return false;
                    }
                    depth_paren -= 1;
                }
                _ => {}
            }
        }
    }

    false
}

/// Check if a variable at the given position is a method shorthand name in an object literal.
/// This detects patterns like:
/// - `{ increment() { ... } }` - method shorthand
/// - `{ foo() { ... }, bar() { ... } }` - multiple method shorthands
///
/// A method shorthand has the identifier followed by `(` (with optional whitespace)
/// AND is preceded by `{` or `,` (with optional whitespace), indicating an object literal context.
fn is_object_method_shorthand(chars: &[char], var_start: usize, var_len: usize) -> bool {
    let var_end = var_start + var_len;

    // Check what comes after the variable: should be `(` for method shorthand
    let mut k = var_end;
    while k < chars.len() && chars[k].is_whitespace() {
        k += 1;
    }

    if k >= chars.len() || chars[k] != '(' {
        return false;
    }

    // Now check what comes before: should be `{` or `,` (with optional whitespace)
    // indicating we're inside an object literal
    let mut j = var_start;
    while j > 0 && chars[j - 1].is_whitespace() {
        j -= 1;
    }

    if j == 0 {
        return false;
    }

    let prev_char = chars[j - 1];

    if prev_char == '{' || prev_char == ',' {
        // For `{`, verify it's an object literal context (not a block statement)
        if prev_char == '{' {
            let mut m = j - 1;
            while m > 0 && chars[m - 1].is_whitespace() {
                m -= 1;
            }

            if m == 0 {
                // `{` at start - in expression context, this is an object literal
                return true;
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

        // Preceded by `,` inside an object literal
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
                        // BUT first check if the `[` is a computed property access (NOT destructuring).
                        // A computed property access is `obj[key]` where `[` is preceded by
                        // an identifier char, `)`, `]`, or `}` (expression-continuation tokens).
                        // In that case, the variable inside `[...]` is NOT a destructuring target.
                        let is_computed_property = if k > 0 {
                            let prev_char = chars[k - 1];
                            is_identifier_char(prev_char)
                                || prev_char == ')'
                                || prev_char == ']'
                                || prev_char == '}'
                        } else {
                            false
                        };

                        if !is_computed_property {
                            // Find the matching closing `]` and check if `=` follows
                            if is_destructuring_assignment_at(chars, j, '[', ']') {
                                found = true;
                            }
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

/// Check if a variable is the base of a member expression that is being assigned to.
///
/// For example, in `foo[bar] = 1` or `foo.prop = value`, `foo` is the base of the
/// member expression `foo[bar]` or `foo.prop`, and these are on the LHS of an assignment.
///
/// This is used by `wrap_prop_source_reads` to skip the read transform (`foo` -> `foo()`)
/// when the variable is a prop that's being mutated via a member expression.
/// In that case, `transform_prop_assignments` will handle the full mutation wrapping
/// (e.g., `foo(foo()[bar] = 1, true)`).
fn is_base_of_assigned_member(chars: &[char], var_start: usize, var_len: usize) -> bool {
    let var_end = var_start + var_len;
    if var_end >= chars.len() {
        return false;
    }

    let next_char = chars[var_end];
    // Only applies when the variable is followed by `.` or `[` (member access)
    if next_char != '.' && next_char != '[' {
        return false;
    }

    // Scan forward past the member expression chain to find an assignment operator.
    // Handle chains like `foo.a.b[c].d = value` or `foo[bar] = 1`.
    let mut j = var_end;
    let mut depth = 0i32;

    while j < chars.len() {
        let c = chars[j];

        match c {
            // Handle bracket member access: skip to matching ]
            '[' => {
                depth += 1;
                j += 1;
            }
            ']' => {
                depth -= 1;
                j += 1;
            }
            '(' => {
                depth += 1;
                j += 1;
            }
            ')' => {
                depth -= 1;
                j += 1;
            }
            // Dot member access: continue scanning
            '.' if depth == 0 => {
                j += 1;
            }
            // Identifier characters: continue scanning (property names)
            c if depth == 0 && is_identifier_char(c) => {
                j += 1;
            }
            // Whitespace at depth 0: skip
            c if depth == 0 && c.is_whitespace() => {
                j += 1;
            }
            // At depth 0, check for assignment operators
            _ if depth == 0 => {
                // Check for assignment operators: = += -= *= /= %= **= ||= &&= ??= etc.
                if c == '=' {
                    // Check it's not == or ===
                    if j + 1 < chars.len() && chars[j + 1] == '=' {
                        return false;
                    }
                    // Check it's not => (arrow)
                    if j + 1 < chars.len() && chars[j + 1] == '>' {
                        return false;
                    }
                    // Check it's not != or <= or >=
                    if j > 0 && matches!(chars[j - 1], '!' | '<' | '>') {
                        return false;
                    }
                    return true;
                }
                // Compound assignments: +=, -=, *=, /=, %=
                if matches!(c, '+' | '-' | '*' | '/' | '%' | '^')
                    && j + 1 < chars.len()
                    && chars[j + 1] == '='
                {
                    // Make sure it's not **= for just * (check for **)
                    if c == '*' && j + 2 < chars.len() && chars[j + 2] == '=' {
                        // Could be **= - still an assignment
                        return true;
                    }
                    if j + 2 < chars.len() && chars[j + 2] == '=' {
                        return false; // e.g., !== - not an assignment
                    }
                    return true;
                }
                // ||= &&= ??=
                if matches!(c, '|' | '&' | '?')
                    && j + 2 < chars.len()
                    && chars[j + 1] == c
                    && chars[j + 2] == '='
                {
                    return true;
                }
                // Not an assignment - reached some other token
                return false;
            }
            _ => {
                j += 1;
            }
        }
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
    replace_with_word_boundary_scoped(input, pattern, replacement, check_before, None)
}

fn replace_with_word_boundary_scoped(
    input: &str,
    pattern: &str,
    replacement: &str,
    check_before: bool,
    var_name: Option<&str>,
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

                // Check if this variable is inside a for-loop scope with shadowing
                let is_for_shadowed = if let Some(vn) = var_name {
                    is_shadowed_by_for_loop_var(&chars, i, vn)
                } else {
                    false
                };

                if before_ok && after_ok && !is_for_shadowed {
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

/// Check if a variable name appears as a declarator in the given statement text.
///
/// This detects:
/// - Direct declarations: `let foo = ...`, `const foo = ...`, `var foo = ...`
/// - Multi-declarator declarations: `let $$array = ..., foo = ...` where `foo` appears
///   after a comma in a `let`/`const`/`var` statement
///
/// This is needed because `transform_state_assignments` must not convert `foo = $.derived(...)`
/// to `$.set(foo, $.derived(...))` when it's part of a multi-declarator `let` statement.
fn is_variable_declaration(result: &str, var: &str) -> bool {
    // Direct check: `let foo = `, `const foo = `, `var foo = `
    if result.contains(&format!("let {} = ", var))
        || result.contains(&format!("const {} = ", var))
        || result.contains(&format!("var {} = ", var))
    {
        return true;
    }

    // Multi-declarator check: The statement starts with let/const/var and the variable
    // appears as a comma-separated declarator (`, foo = ` or `,\n\tfoo = `, etc.)
    let trimmed = result.trim();
    if trimmed.starts_with("let ") || trimmed.starts_with("const ") || trimmed.starts_with("var ") {
        // Look for the pattern: comma, optional whitespace, var, space, equals
        // We need to check that `var` appears after a comma at the declarator level
        // (not inside a nested expression)
        let pattern = format!("{} = ", var);
        let mut search_from = 0;
        while let Some(pos) = result[search_from..].find(&pattern) {
            let abs_pos = search_from + pos;
            // Check that `var` is at a word boundary
            if abs_pos > 0 && is_identifier_char(result.as_bytes()[abs_pos - 1] as char) {
                search_from = abs_pos + pattern.len();
                continue;
            }
            // Check what precedes this occurrence (skip whitespace to find comma or keyword)
            let before = result[..abs_pos].trim_end();
            if before.ends_with(',') {
                return true;
            }
            search_from = abs_pos + pattern.len();
        }
    }

    false
}

/// Check if a character can be part of a JavaScript identifier.
fn is_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// Find the position of the matching closing parenthesis.
pub(crate) fn find_matching_paren(s: &str) -> Option<usize> {
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

/// Extract the name of the enclosing function from the text before a block opening.
/// Looks for patterns like `function NAME(` just before `{`.
/// Returns None if no named function is found.
fn extract_enclosing_function_name(before_block: &str) -> Option<&str> {
    let trimmed = before_block.trim_end();
    // Look for `function NAME(...)` pattern
    // The pattern should end with `)` just before the `{`
    if let Some(paren_close) = trimmed.rfind(')') {
        let before_paren = &trimmed[..paren_close];
        if let Some(paren_open) = before_paren.rfind('(') {
            let before_params = trimmed[..paren_open].trim_end();
            // Check if this is `function NAME`
            if let Some(fn_pos) = before_params.rfind("function ") {
                let name_part = before_params[fn_pos + 9..].trim();
                if !name_part.is_empty()
                    && name_part
                        .chars()
                        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
                {
                    return Some(name_part);
                }
            }
        }
    }
    None
}

/// Find the position of the matching closing brace `}` for a string that starts
/// right after the opening `{`. Returns the index of the `}` within the string.
/// Handles nested braces, strings, and comments.
fn find_matching_brace(s: &str) -> Option<usize> {
    let mut depth = 1i32;
    let bytes = s.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'{' => depth += 1,
            b'}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            // Skip string literals
            b'\'' | b'"' | b'`' => {
                let quote = bytes[i];
                i += 1;
                while i < bytes.len() {
                    if bytes[i] == b'\\' {
                        i += 1; // skip escaped char
                    } else if bytes[i] == quote {
                        break;
                    }
                    i += 1;
                }
            }
            // Skip single-line comments
            b'/' if i + 1 < bytes.len() && bytes[i + 1] == b'/' => {
                i += 2;
                while i < bytes.len() && bytes[i] != b'\n' {
                    i += 1;
                }
            }
            // Skip multi-line comments
            b'/' if i + 1 < bytes.len() && bytes[i + 1] == b'*' => {
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i += 1; // skip past */
            }
            _ => {}
        }
        i += 1;
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

    // `await expr` needs proxy because the resolved value could be an object/array.
    // In the official Svelte compiler, AwaitExpression is not in the list of types
    // that return false from should_proxy, so it always returns true.
    if trimmed.starts_with("await ") {
        return true;
    }

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
    // could be objects/arrays passed as arguments, so they need proxy.
    // Note: NaN and Infinity are Identifiers in ESTree (not Literals), so the
    // official Svelte compiler's should_proxy() returns true for them. We must
    // NOT exclude them here.
    if is_simple_identifier(trimmed) && !matches!(trimmed, "undefined" | "null" | "true" | "false")
    {
        return true;
    }

    // Member expressions (foo.bar, foo.bar.baz, foo[key]) could return objects/arrays
    // They need proxy because the returned value type is unknown
    if is_member_expression(trimmed) {
        return true;
    }

    // Computed member expressions (obj[key], arr[0]) also need proxy
    // These are identifiers followed by bracket notation
    if is_computed_member_expression(trimmed) {
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

/// Scope-aware proxy check: returns false for identifiers that are known to be
/// non-proxyable (e.g., `const min = 2` - `min` is a literal, doesn't need proxy).
/// Falls back to `expression_needs_proxy` for everything else.
fn expression_needs_proxy_with_scope(expr: &str, non_proxy_vars: &[String]) -> bool {
    let trimmed = expr.trim();
    // If this is a simple identifier that we know resolves to a primitive/literal,
    // it doesn't need proxy wrapping.
    if is_simple_identifier(trimmed) && non_proxy_vars.iter().any(|v| v == trimmed) {
        return false;
    }
    expression_needs_proxy(trimmed)
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

/// Check if an expression is a computed member expression (e.g., obj[key], arr[0]).
/// Matches identifier followed by `[...]` bracket notation.
fn is_computed_member_expression(expr: &str) -> bool {
    let trimmed = expr.trim();
    if trimmed.is_empty() {
        return false;
    }

    // Must start with an identifier character
    let first_char = trimmed.chars().next().unwrap();
    if !first_char.is_alphabetic() && first_char != '_' && first_char != '$' {
        return false;
    }

    // Must NOT end with ')' (would be a function call)
    if trimmed.ends_with(')') {
        return false;
    }

    // Must end with ']' (bracket access)
    if !trimmed.ends_with(']') {
        return false;
    }

    // Find the opening bracket that matches the closing bracket
    // The identifier part before it must be a valid identifier or member expression
    let mut depth = 0;
    for (i, c) in trimmed.char_indices().rev() {
        match c {
            ']' => depth += 1,
            '[' => {
                depth -= 1;
                if depth == 0 {
                    // Everything before the bracket must be a valid identifier or member expression
                    let before = &trimmed[..i];
                    if before.is_empty() {
                        return false;
                    }
                    // Check it starts with an identifier character and contains only valid chars
                    let first = before.chars().next().unwrap();
                    if !first.is_alphabetic() && first != '_' && first != '$' {
                        return false;
                    }
                    return before
                        .chars()
                        .all(|c| c.is_alphanumeric() || c == '_' || c == '$' || c == '.');
                }
            }
            _ => {}
        }
    }

    false
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

/// Strip the top-level `await` keyword from the beginning of an expression string.
///
/// For example:
///   "await Promise.resolve(5)" -> "Promise.resolve(5)"
///   "await fetch(url)" -> "fetch(url)"
///   "await (x + y)" -> "(x + y)"
///
/// If the expression does not start with `await`, returns the original string.
fn strip_top_level_await_from_expr(expr: &str) -> String {
    let trimmed = expr.trim();
    if let Some(rest) = trimmed.strip_prefix("await ") {
        rest.trim_start().to_string()
    } else if let Some(rest) = trimmed.strip_prefix("await\n") {
        rest.trim_start().to_string()
    } else if let Some(rest) = trimmed.strip_prefix("await\t") {
        rest.trim_start().to_string()
    } else if let Some(rest) = trimmed.strip_prefix("await(") {
        // `await(expr)` - keep the opening paren
        format!("({}", rest)
    } else {
        trimmed.to_string()
    }
}

/// Wrap non-final `await expr` in async derived expressions with `$.save()`.
///
/// In the official Svelte compiler, `await` expressions that precede other reactive
/// reads inside `$derived` / async_derived are wrapped with `$.save()` to preserve
/// reactive context across the await boundary.
///
/// Example: `(await get_promise()) * get_num()`
///   becomes: `(await $.save(get_promise()))() * get_num()`
///
/// The rule: if the `await expr` is not the entirety of the expression (i.e., there's
/// more code after it), wrap with `$.save()` and add `()` invocation after the await.
fn wrap_await_with_save_in_async_derived(expr: &str) -> String {
    let trimmed = expr.trim();
    let chars: Vec<char> = trimmed.chars().collect();
    let len = chars.len();
    let mut result = String::with_capacity(len + 20);
    let mut i = 0;

    while i < len {
        // Skip strings
        if chars[i] == '\'' || chars[i] == '"' || chars[i] == '`' {
            let quote = chars[i];
            result.push(chars[i]);
            i += 1;
            while i < len && chars[i] != quote {
                if chars[i] == '\\' {
                    result.push(chars[i]);
                    i += 1;
                    if i < len {
                        result.push(chars[i]);
                        i += 1;
                    }
                } else if quote == '`' && chars[i] == '$' && i + 1 < len && chars[i + 1] == '{' {
                    // Template literal interpolation - recurse
                    result.push(chars[i]);
                    result.push(chars[i + 1]);
                    i += 2;
                    let mut depth = 1;
                    let start = i;
                    while i < len && depth > 0 {
                        if chars[i] == '{' {
                            depth += 1;
                        } else if chars[i] == '}' {
                            depth -= 1;
                        }
                        if depth > 0 {
                            i += 1;
                        }
                    }
                    let inner: String = chars[start..i].iter().collect();
                    result.push_str(&wrap_await_with_save_in_async_derived(&inner));
                    if i < len {
                        result.push(chars[i]); // closing }
                        i += 1;
                    }
                } else {
                    result.push(chars[i]);
                    i += 1;
                }
            }
            if i < len {
                result.push(chars[i]); // closing quote
                i += 1;
            }
            continue;
        }

        // Skip async arrow functions - don't transform await inside them
        if i + 5 < len {
            let word: String = chars[i..i + 5].iter().collect();
            if word == "async" {
                // Check if followed by space/paren and then arrow function
                let rest: String = chars[i..].iter().collect();
                if rest.starts_with("async (") || rest.starts_with("async()") {
                    // This is an async arrow function or async function - skip to end
                    result.push_str(&rest);
                    return result;
                }
            }
        }

        // Check for 'await' keyword
        if i + 5 <= len {
            let word: String = chars[i..i + 5].iter().collect();
            if word == "await"
                && (i == 0 || !chars[i - 1].is_alphanumeric() && chars[i - 1] != '_')
                && (i + 5 >= len || !chars[i + 5].is_alphanumeric() && chars[i + 5] != '_')
            {
                // Found an `await` keyword.
                // Check if there's more expression content after the await + its argument.
                // We need to find the end of the await argument to check if there's more.
                let after_await = i + 5;
                let mut arg_start = after_await;
                // Skip whitespace after 'await'
                while arg_start < len && chars[arg_start].is_whitespace() {
                    arg_start += 1;
                }

                // Find the extent of the await argument
                // It goes until we hit a binary operator (+, *, -, /, %, etc.) at the same depth,
                // or end of expression
                let mut j = arg_start;
                let mut paren_depth = 0;
                let mut bracket_depth = 0;
                let mut brace_depth = 0;

                while j < len {
                    match chars[j] {
                        '(' => paren_depth += 1,
                        ')' => {
                            if paren_depth == 0 {
                                break;
                            }
                            paren_depth -= 1;
                        }
                        '[' => bracket_depth += 1,
                        ']' => {
                            if bracket_depth == 0 {
                                break;
                            }
                            bracket_depth -= 1;
                        }
                        '{' => brace_depth += 1,
                        '}' => {
                            if brace_depth == 0 {
                                break;
                            }
                            brace_depth -= 1;
                        }
                        '*' | '+' | '-' | '/' | '%' | '&' | '|' | '^' | '<' | '>'
                            if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 =>
                        {
                            // Binary operator at top level - this is where the await arg ends
                            break;
                        }
                        ',' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => break,
                        '?' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => break,
                        ':' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => break,
                        _ => {}
                    }
                    j += 1;
                }

                // The await argument is chars[arg_start..j]
                let await_arg: String = chars[arg_start..j].iter().collect();
                let await_arg_trimmed = await_arg.trim();

                // Check if there's more expression after this await+arg
                let remaining: String = chars[j..].iter().collect();
                let remaining_trimmed = remaining.trim();
                let has_more_after = !remaining_trimmed.is_empty()
                    && remaining_trimmed != ")"
                    && remaining_trimmed != "))"
                    && remaining_trimmed != ";";

                if has_more_after {
                    // Wrap with $.save: `await expr` -> `(await $.save(expr))()`
                    result.push_str(&format!("(await $.save({}))()", await_arg_trimmed));
                    i = j;
                } else {
                    // Last expression - keep as is
                    result.push_str("await ");
                    result.push_str(await_arg_trimmed);
                    i = j;
                }
                continue;
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
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
    /// Whether this field was declared in the constructor
    constructor_declared: bool,
}

/// Helper to parse rune fields from a section of class body lines.
/// Returns (fields, non_rune_lines).
/// Handles multi-line field declarations (e.g., $derived.by(() => { ... })).
#[allow(dead_code)]
fn parse_rune_fields_from_section(section: &str) -> (Vec<ClassStateField>, Vec<String>) {
    let mut fields = Vec::new();
    let mut non_rune_lines = Vec::new();

    let lines: Vec<&str> = section.lines().collect();
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();
        if trimmed.is_empty() {
            i += 1;
            continue;
        }

        // Try to parse as a single-line rune field first
        let rune_types = [
            ("$state.raw", true),
            ("$state.frozen", true),
            ("$state", false),
            ("$derived.by", true),
            ("$derived", false),
        ];

        let mut parsed = false;
        for &(rune_type, _is_compound) in &rune_types {
            let pattern = format!("= {}(", rune_type);
            let pattern_no_space = format!("={}(", rune_type);

            let has_pattern = trimmed.contains(&pattern) || trimmed.contains(&pattern_no_space);
            if !has_pattern {
                continue;
            }

            // Skip if checking $state but it's actually $state.raw or $state.frozen
            if rune_type == "$state"
                && (trimmed.contains("$state.raw(")
                    || trimmed.contains("$state.frozen(")
                    || trimmed.contains("$state.frozen("))
            {
                continue;
            }
            // Skip if checking $derived but it's actually $derived.by
            if rune_type == "$derived"
                && (trimmed.contains("$derived.by(") || trimmed.contains("$derived.by("))
            {
                continue;
            }

            // Try single-line parse
            if let Some(field) = parse_state_field(trimmed, rune_type) {
                fields.push(field);
                parsed = true;
                break;
            }

            // Single-line parse failed - might be a multi-line expression
            // Accumulate lines until parens are balanced
            let mut accumulated = trimmed.to_string();
            let mut j = i + 1;
            while j < lines.len() {
                accumulated.push('\n');
                accumulated.push_str(lines[j].trim());
                // Try parsing the accumulated content
                if let Some(field) = parse_state_field(&accumulated, rune_type) {
                    fields.push(field);
                    parsed = true;
                    i = j; // Skip all accumulated lines
                    break;
                }
                j += 1;
            }
            if parsed {
                break;
            }
        }

        if !parsed {
            non_rune_lines.push(line.to_string());
        }
        i += 1;
    }

    (fields, non_rune_lines)
}

/// Emit a transformed class field definition with optional getter/setter.
fn emit_class_field(field: &ClassStateField, all_fields: &[ClassStateField]) -> String {
    let mut output = String::new();
    let private_name = format!("#{}", field.private_backing_name);

    if field.constructor_declared {
        output.push_str(&format!("\t\t{};\n", private_name));
        if !field.is_private {
            let is_derived = field.rune_type == "$derived" || field.rune_type == "$derived.by";
            let is_raw = field.rune_type == "$state.raw" || field.rune_type == "$state.frozen";
            output.push('\n');
            output.push_str(&format!(
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                field.name, private_name
            ));
            output.push('\n');
            if is_derived || is_raw {
                output.push_str(&format!(
                    "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}\n",
                    field.name, private_name
                ));
            } else {
                output.push_str(&format!(
                    "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value, true);\n\t\t}}\n",
                    field.name, private_name
                ));
            }
        }
    } else if field.rune_type == "$state" {
        let value_trimmed = field.value.trim();
        let needs_proxy = !value_trimmed.is_empty() && expression_needs_proxy(value_trimmed);
        let wrapped_value = if needs_proxy {
            format!("$.proxy({})", field.value)
        } else {
            field.value.clone()
        };
        output.push_str(&format!(
            "\t\t{} = $.state({});\n",
            private_name, wrapped_value
        ));
        if !field.is_private {
            let getter_name = format_getter_name(&field.name);
            output.push('\n');
            output.push_str(&format!(
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                getter_name, private_name
            ));
            output.push('\n');
            output.push_str(&format!(
                "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value, true);\n\t\t}}\n",
                getter_name, private_name
            ));
        }
    } else if field.rune_type == "$state.raw" || field.rune_type == "$state.frozen" {
        output.push_str(&format!(
            "\t\t{} = $.state({});\n",
            private_name, field.value
        ));
        if !field.is_private {
            let getter_name = format_getter_name(&field.name);
            output.push('\n');
            output.push_str(&format!(
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                getter_name, private_name
            ));
            output.push('\n');
            output.push_str(&format!(
                "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}\n",
                getter_name, private_name
            ));
        }
    } else if field.rune_type == "$derived" {
        // Transform private field accesses inside the derived expression
        let mut derived_expr = field.value.clone();
        for f in all_fields {
            if f.is_private {
                let private_ref = format!("this.#{}", f.private_backing_name);
                if derived_expr.contains(&private_ref) {
                    let getter = format!("$.get(this.#{})", f.private_backing_name);
                    derived_expr = derived_expr.replace(&private_ref, &getter);
                }
            }
        }
        let wrapped_value = if derived_expr.trim_start().starts_with('{') {
            format!("() => ({})", derived_expr)
        } else {
            format!("() => {}", derived_expr)
        };
        output.push_str(&format!(
            "\t\t{} = $.derived({});\n",
            private_name, wrapped_value
        ));
        if !field.is_private {
            let getter_name = format_getter_name(&field.name);
            output.push('\n');
            output.push_str(&format!(
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                getter_name, private_name
            ));
            output.push('\n');
            output.push_str(&format!(
                "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}\n",
                getter_name, private_name
            ));
        }
    } else if field.rune_type == "$derived.by" {
        let mut derived_expr = field.value.clone();
        for f in all_fields {
            if f.is_private {
                let private_ref = format!("this.#{}", f.private_backing_name);
                if derived_expr.contains(&private_ref) {
                    let getter = format!("$.get(this.#{})", f.private_backing_name);
                    derived_expr = derived_expr.replace(&private_ref, &getter);
                }
            }
        }
        output.push_str(&format!(
            "\t\t{} = $.derived({});\n",
            private_name, derived_expr
        ));
        if !field.is_private {
            let getter_name = format_getter_name(&field.name);
            output.push('\n');
            output.push_str(&format!(
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                getter_name, private_name
            ));
            output.push('\n');
            output.push_str(&format!(
                "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}\n",
                getter_name, private_name
            ));
        }
    }

    output
}

/// Extract a private identifier name from a line that may have a keyword prefix.
fn extract_private_id_from_line(trimmed: &str) -> Option<String> {
    if let Some(rest) = trimmed.strip_prefix('#') {
        if let Some(end) = rest.find(['=', ';', '(', ' ']) {
            let name = rest[..end].trim();
            if !name.is_empty() {
                return Some(name.to_string());
            }
        }
        return None;
    }
    let prefixes = ["async ", "get ", "set ", "static ", "* "];
    for prefix in &prefixes {
        if let Some(rest) = trimmed.strip_prefix(prefix) {
            let rest = rest.trim_start();
            if let Some(rest) = rest.strip_prefix('#')
                && let Some(end) = rest.find(['=', ';', '(', ' '])
            {
                let name = rest[..end].trim();
                if !name.is_empty() {
                    return Some(name.to_string());
                }
            }
        }
    }
    if let Some(rest) = trimmed.strip_prefix("async") {
        let rest = rest.trim_start();
        if let Some(rest) = rest.strip_prefix('*') {
            let rest = rest.trim_start();
            if let Some(rest) = rest.strip_prefix('#')
                && let Some(end) = rest.find(['=', ';', '(', ' '])
            {
                let name = rest[..end].trim();
                if !name.is_empty() {
                    return Some(name.to_string());
                }
            }
        }
    }
    None
}

/// Transform private field reads in constructor body.
fn transform_constructor_private_reads(content: &str, fields: &[ClassStateField]) -> String {
    let mut result = content.to_string();

    for field in fields {
        if !field.is_private {
            continue;
        }

        let private_ref = format!("this.#{}", field.private_backing_name);

        if field.rune_type == "$state"
            || field.rune_type == "$state.raw"
            || field.rune_type == "$state.frozen"
        {
            let mut search_from = 0;
            let mut new_result = String::new();
            let mut last_end = 0;

            while let Some(pos) = result[search_from..].find(&private_ref) {
                let abs_pos = search_from + pos;
                let after_pos = abs_pos + private_ref.len();

                let before = &result[..abs_pos];
                if before.ends_with("$.set(")
                    || before.ends_with("$.get(")
                    || before.ends_with("$.state(")
                    || before.ends_with("$.update(")
                    || before.ends_with("$.update_pre(")
                {
                    search_from = after_pos;
                    continue;
                }

                let next_char = if after_pos < result.len() {
                    Some(result.as_bytes()[after_pos] as char)
                } else {
                    None
                };

                match next_char {
                    Some(' ') => {
                        if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'='
                        {
                            if after_pos + 2 < result.len()
                                && result.as_bytes()[after_pos + 2] == b'='
                            {
                                // == comparison -> use .v
                            } else {
                                search_from = after_pos;
                                continue;
                            }
                        }
                    }
                    Some('=') => {
                        if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'='
                        {
                            // == comparison -> use .v
                        } else {
                            search_from = after_pos;
                            continue;
                        }
                    }
                    Some('.') => {
                        search_from = after_pos;
                        continue;
                    }
                    Some(c) if c.is_alphanumeric() || c == '_' => {
                        search_from = after_pos;
                        continue;
                    }
                    _ => {}
                }

                new_result.push_str(&result[last_end..after_pos]);
                new_result.push_str(".v");
                last_end = after_pos;
                search_from = after_pos;
            }

            if last_end > 0 {
                new_result.push_str(&result[last_end..]);
                result = new_result;
            }
        } else if field.rune_type == "$derived" || field.rune_type == "$derived.by" {
            let mut search_from = 0;
            let mut new_result = String::new();
            let mut last_end = 0;

            while let Some(pos) = result[search_from..].find(&private_ref) {
                let abs_pos = search_from + pos;
                let after_pos = abs_pos + private_ref.len();

                let before = &result[..abs_pos];
                if before.ends_with("$.set(")
                    || before.ends_with("$.get(")
                    || before.ends_with("$.state(")
                    || before.ends_with("$.derived(")
                    || before.ends_with("$.update(")
                    || before.ends_with("$.update_pre(")
                {
                    search_from = after_pos;
                    continue;
                }

                let next_char = if after_pos < result.len() {
                    Some(result.as_bytes()[after_pos] as char)
                } else {
                    None
                };

                match next_char {
                    Some(' ') => {
                        if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'='
                        {
                            if after_pos + 2 < result.len()
                                && result.as_bytes()[after_pos + 2] == b'='
                            {
                                // comparison
                            } else {
                                search_from = after_pos;
                                continue;
                            }
                        }
                    }
                    Some('=') => {
                        if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'='
                        {
                            // comparison
                        } else {
                            search_from = after_pos;
                            continue;
                        }
                    }
                    Some(c) if c.is_alphanumeric() || c == '_' => {
                        search_from = after_pos;
                        continue;
                    }
                    _ => {}
                }

                new_result.push_str(&result[last_end..abs_pos]);
                new_result.push_str(&format!("$.get({})", private_ref));
                last_end = after_pos;
                search_from = after_pos;
            }

            if last_end > 0 {
                new_result.push_str(&result[last_end..]);
                result = new_result;
            }
        }
    }

    result
}

/// Transform class fields with $state and $derived runes for client-side.
pub(crate) fn transform_class_fields_client(script: &str) -> String {
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

    // Parse constructor info
    let mut constructor_content = String::new();
    let mut constructor_params = String::new();
    let mut constructor_start: Option<usize> = None;
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

        if let Some(brace_pos_inner) = after_ctor.find('{') {
            let ctor_body_start = ctor_pos + brace_pos_inner + 1;
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
            constructor_end = Some(ctor_body_end + 1);
        }
    }

    // Collect existing private identifiers to avoid conflicts
    let mut existing_private_ids: Vec<String> = Vec::new();
    for line in class_body.lines() {
        let trimmed = line.trim();
        if let Some(name) = extract_private_id_from_line(trimmed)
            && !existing_private_ids.contains(&name)
        {
            existing_private_ids.push(name);
        }
    }

    // Parse the entire class body into ordered members.
    // Each member is either a rune field, a non-rune member block, or the constructor.
    #[derive(Debug)]
    enum ClassMember {
        RuneField(usize), // index into fields vec
        NonRune(String),  // raw text of the non-rune member(s)
        Constructor,      // placeholder for the constructor position
    }

    let mut fields: Vec<ClassStateField> = Vec::new();
    let mut members: Vec<ClassMember> = Vec::new();
    // Track non-rune lines that might be plain field declarations for constructor fields
    let mut non_rune_plain_field_names: Vec<(usize, String)> = Vec::new(); // (member_idx, field_name)

    // Split class body into before-constructor and after-constructor sections
    let before_ctor_section = if let Some(ctor_start) = constructor_start {
        &class_body[..ctor_start]
    } else {
        class_body
    };
    let after_ctor_section = if let Some(ctor_end) = constructor_end {
        &class_body[ctor_end..]
    } else {
        ""
    };

    // Parse members from a section of the class body (before or after constructor)
    // Returns ordered list of members and appends fields to the fields vec
    let parse_section_members =
        |section: &str,
         fields: &mut Vec<ClassStateField>,
         members: &mut Vec<ClassMember>,
         non_rune_plain_field_names: &mut Vec<(usize, String)>| {
            let section_lines: Vec<&str> = section.lines().collect();
            let mut si = 0;
            let mut pending_non_rune: Vec<String> = Vec::new();

            while si < section_lines.len() {
                let line = section_lines[si];
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    si += 1;
                    continue;
                }

                // Try to parse as a rune field
                let rune_types_list = [
                    ("$state.raw", true),
                    ("$state.frozen", true),
                    ("$state", false),
                    ("$derived.by", true),
                    ("$derived", false),
                ];

                let mut parsed_as_rune = false;
                for &(rune_type, _) in &rune_types_list {
                    let pattern_eq = format!("= {}(", rune_type);
                    let pattern_nospace = format!("={}(", rune_type);
                    let has_pattern =
                        trimmed.contains(&pattern_eq) || trimmed.contains(&pattern_nospace);
                    if !has_pattern {
                        continue;
                    }
                    if rune_type == "$state"
                        && (trimmed.contains("$state.raw(") || trimmed.contains("$state.frozen("))
                    {
                        continue;
                    }
                    if rune_type == "$derived" && trimmed.contains("$derived.by(") {
                        continue;
                    }

                    // Try single-line parse
                    if let Some(field) = parse_state_field(trimmed, rune_type) {
                        // Flush pending non-rune lines
                        if !pending_non_rune.is_empty() {
                            let content = pending_non_rune.join("\n");
                            members.push(ClassMember::NonRune(content));
                            pending_non_rune.clear();
                        }
                        let field_idx = fields.len();
                        fields.push(field);
                        members.push(ClassMember::RuneField(field_idx));
                        parsed_as_rune = true;
                        break;
                    }

                    // Multi-line parse
                    let mut accumulated = trimmed.to_string();
                    let mut j = si + 1;
                    while j < section_lines.len() {
                        accumulated.push('\n');
                        accumulated.push_str(section_lines[j].trim());
                        if let Some(field) = parse_state_field(&accumulated, rune_type) {
                            // Flush pending non-rune lines
                            if !pending_non_rune.is_empty() {
                                let content = pending_non_rune.join("\n");
                                members.push(ClassMember::NonRune(content));
                                pending_non_rune.clear();
                            }
                            let field_idx = fields.len();
                            fields.push(field);
                            members.push(ClassMember::RuneField(field_idx));
                            parsed_as_rune = true;
                            si = j; // Skip accumulated lines
                            break;
                        }
                        j += 1;
                    }
                    if parsed_as_rune {
                        break;
                    }
                }

                if !parsed_as_rune {
                    // Track plain field declarations for later removal by constructor fields
                    let field_trimmed = trimmed.trim_end_matches(';').trim();
                    if !field_trimmed.contains('(')
                        && !field_trimmed.contains('{')
                        && !field_trimmed.starts_with("//")
                        && !field_trimmed.starts_with("/*")
                    {
                        // Flush current pending + this line, remember its member index
                        if !pending_non_rune.is_empty() {
                            let content = pending_non_rune.join("\n");
                            members.push(ClassMember::NonRune(content));
                            pending_non_rune.clear();
                        }
                        let member_idx = members.len();
                        let name = field_trimmed.trim_start_matches('#').trim().to_string();
                        if !name.is_empty()
                            && name
                                .chars()
                                .next()
                                .is_some_and(|c| c.is_alphabetic() || c == '_' || c == '$')
                        {
                            non_rune_plain_field_names.push((member_idx, name));
                        }
                        members.push(ClassMember::NonRune(line.to_string()));
                    } else {
                        pending_non_rune.push(line.to_string());
                    }
                }
                si += 1;
            }

            // Flush any remaining non-rune lines
            if !pending_non_rune.is_empty() {
                let content = pending_non_rune.join("\n");
                members.push(ClassMember::NonRune(content));
            }
        };

    // Parse before-constructor members
    parse_section_members(
        before_ctor_section,
        &mut fields,
        &mut members,
        &mut non_rune_plain_field_names,
    );

    // Add constructor marker
    if constructor_start.is_some() {
        members.push(ClassMember::Constructor);
    }

    // Parse after-constructor members
    parse_section_members(
        after_ctor_section,
        &mut fields,
        &mut members,
        &mut non_rune_plain_field_names,
    );

    // Scan constructor body for constructor-declared state/derived assignments
    if !constructor_content.is_empty() {
        for line in constructor_content.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }
            if let Some(field) = parse_constructor_state_assignment(trimmed, &fields) {
                let field_name = field.name.clone();
                // Remove plain field declarations from members that match this constructor field
                let mut indices_to_remove: Vec<usize> = Vec::new();
                for &(member_idx, ref name) in &non_rune_plain_field_names {
                    if *name == field_name {
                        indices_to_remove.push(member_idx);
                    }
                }
                // Also check for # prefixed plain declarations
                for (mi, m) in members.iter().enumerate() {
                    if let ClassMember::NonRune(text) = m {
                        let t = text.trim().trim_end_matches(';').trim();
                        let t_no_hash = t.trim_start_matches('#').trim();
                        if t_no_hash == field_name && !indices_to_remove.contains(&mi) {
                            indices_to_remove.push(mi);
                        }
                    }
                }
                // Remove matching plain declarations (replace with empty NonRune)
                // Also remove preceding JSDoc/comment blocks
                for idx in &indices_to_remove {
                    if *idx < members.len() {
                        members[*idx] = ClassMember::NonRune(String::new());
                        // Remove preceding comment/JSDoc member if it exists
                        if *idx > 0
                            && let ClassMember::NonRune(prev_text) = &members[*idx - 1]
                        {
                            let prev_trimmed = prev_text.trim();
                            if prev_trimmed.starts_with("/*")
                                || prev_trimmed.starts_with("//")
                                || prev_trimmed.starts_with("/**")
                            {
                                members[*idx - 1] = ClassMember::NonRune(String::new());
                            }
                        }
                    }
                }
                fields.push(field);
            }
        }
    }

    if fields.is_empty() {
        return script.to_string();
    }

    // Deconflict private backing names for public fields
    for field in &mut fields {
        if !field.is_private {
            let mut deconflicted = field.private_backing_name.clone();
            while existing_private_ids.contains(&deconflicted) {
                deconflicted = format!("_{}", deconflicted);
            }
            existing_private_ids.push(deconflicted.clone());
            field.private_backing_name = deconflicted;
        }
    }

    // Build transformed class body preserving original member order
    let mut new_class_body = String::new();

    // 1. Emit constructor-declared PUBLIC fields at the top of the class
    // (with getter/setter). Private backing fields come later, just before the constructor.
    // This matches the official Svelte compiler output order.
    for field in &fields {
        if field.constructor_declared && !field.is_private {
            new_class_body.push_str(&emit_class_field(field, &fields));
        }
    }

    // 2. Emit members in original order
    for member in &members {
        match member {
            ClassMember::RuneField(field_idx) => {
                let field = &fields[*field_idx];
                new_class_body.push_str(&emit_class_field(field, &fields));
            }
            ClassMember::NonRune(text) => {
                if text.trim().is_empty() {
                    continue;
                }
                let transformed = transform_class_methods(text, &fields);
                for line in transformed.lines() {
                    new_class_body.push_str(line);
                    new_class_body.push('\n');
                }
            }
            ClassMember::Constructor => {
                // Emit constructor-declared private fields just before the constructor
                for field in &fields {
                    if field.constructor_declared && field.is_private {
                        new_class_body.push_str(&emit_class_field(field, &fields));
                    }
                }
                new_class_body.push('\n');
                new_class_body.push_str(&format!("\t\tconstructor({}) {{\n", constructor_params));

                let mut ctor_body = String::new();
                for line in constructor_content.lines() {
                    let trimmed = line.trim();
                    if trimmed.is_empty() {
                        continue;
                    }

                    let transformed_line = transform_constructor_assignment(trimmed, &fields);
                    ctor_body.push_str(&format!("\t\t\t{}\n", transformed_line));
                }

                let ctor_transformed = transform_class_methods_non_this(&ctor_body, &fields);
                let ctor_transformed =
                    transform_constructor_private_reads(&ctor_transformed, &fields);
                new_class_body.push_str(&ctor_transformed);

                new_class_body.push_str("\t\t}\n");
            }
        }
    }

    // Build the final result
    let before_class = &script[..class_pos];
    let after_class_body = &script[class_body_end + 1..]; // Skip closing brace

    // Recursively process remaining classes in the script
    let after_class_transformed = transform_class_fields_client(after_class_body);

    // Check if this is a `new class ...` expression that needs wrapping
    // `new class Foo { ... }` -> `new (class Foo { ... })()`
    let before_trimmed = before_class.trim_end();
    let is_new_class = before_trimmed.ends_with("new");

    if is_new_class {
        // Trim "new" from before_class and wrap the class in (...)()
        let new_pos = before_class.rfind("new").unwrap();
        let before_new = &before_class[..new_pos];
        format!(
            "{}new ({}\n{}\t}})(){}",
            before_new, class_header, new_class_body, after_class_transformed
        )
    } else {
        format!(
            "{}{}\n{}\t}}{}",
            before_class, class_header, new_class_body, after_class_transformed
        )
    }
}

/// Sanitize a name to be a valid JavaScript identifier.
/// Replaces invalid identifier characters with underscores.
/// For example, "0" becomes "_", "1foo" becomes "_foo".
fn sanitize_identifier(name: &str) -> String {
    REGEX_INVALID_IDENTIFIER_CHARS
        .replace_all(name, "_")
        .to_string()
}

/// Format a getter/setter name for class fields.
/// For names that are valid JS identifiers, returns the name as-is.
/// For names that need quoting (contain special chars like hyphens, or are string literals),
/// returns them in quotes. For numeric names, returns them unquoted.
fn format_getter_name(name: &str) -> String {
    // If the name is already quoted (starts and ends with quotes), return as-is
    if (name.starts_with('"') && name.ends_with('"'))
        || (name.starts_with('\'') && name.ends_with('\''))
    {
        return name.to_string();
    }
    // If it's a valid identifier as-is, return it
    // Valid identifiers start with a letter, underscore, or $, followed by alphanumerics, _, or $
    if !name.is_empty() {
        let first = name.chars().next().unwrap();
        if (first.is_alphabetic() || first == '_' || first == '$')
            && name
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        {
            return name.to_string();
        }
    }
    // Numeric names are valid property names in JS without quoting
    if name.chars().all(|c| c.is_ascii_digit()) {
        return name.to_string();
    }
    // Otherwise, quote the name
    format!("\"{}\"", name)
}

/// Strip surrounding quotes from a field name if present.
/// For example, `"aria-pressed"` becomes `aria-pressed`.
fn strip_field_quotes(name: &str) -> String {
    if (name.starts_with('"') && name.ends_with('"'))
        || (name.starts_with('\'') && name.ends_with('\''))
    {
        name[1..name.len() - 1].to_string()
    } else {
        name.to_string()
    }
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

    // Strip quotes from name for private backing name generation
    // e.g., "aria-pressed" -> aria-pressed -> aria_pressed
    let unquoted_name = strip_field_quotes(&name);
    let private_backing_name = sanitize_identifier(&unquoted_name);

    Some(ClassStateField {
        name: name.clone(),
        is_private,
        rune_type: rune_type.to_string(),
        value,
        private_backing_name, // Sanitized to be a valid identifier
        constructor_declared: false,
    })
}

/// Parse a constructor state assignment like `this.name = $state(...)` or `this[n] = $state(...)`.
fn parse_constructor_state_assignment(
    line: &str,
    existing_fields: &[ClassStateField],
) -> Option<ClassStateField> {
    let trimmed = line.trim().trim_end_matches(';');

    let (is_private, name) = if trimmed.starts_with("this.") {
        // Handle `this.name = $state(...)` or `this.#name = $state(...)`
        let eq_pos = trimmed.find(" = ")?;
        let field_part = &trimmed[5..eq_pos];
        let is_priv = field_part.starts_with('#');
        let n = field_part.trim_start_matches('#').to_string();
        (is_priv, n)
    } else if trimmed.starts_with("this[") {
        // Handle `this[n] = $state(...)` (bracket notation)
        let bracket_end = trimmed.find(']')?;
        let key = trimmed[5..bracket_end].trim();
        // For bracket notation, the key becomes a quoted property name in getter/setter
        // e.g., this[1] -> get '1'() { ... }
        let unquoted_key = if (key.starts_with('\'') && key.ends_with('\''))
            || (key.starts_with('"') && key.ends_with('"'))
        {
            key[1..key.len() - 1].to_string()
        } else {
            key.to_string()
        };
        // For getter/setter, wrap numeric keys in quotes
        let name = if unquoted_key.chars().all(|c| c.is_ascii_digit()) {
            format!("'{}'", unquoted_key)
        } else {
            unquoted_key
        };
        (false, name)
    } else {
        return None;
    };

    let eq_pos = trimmed.find(" = ")?;
    let rhs = trimmed[eq_pos + 3..].trim();

    let already_exists = existing_fields.iter().any(|f| f.name == name);
    if already_exists {
        return None;
    }
    let (rune_type, value) = if let Some(rest) = rhs.strip_prefix("$state.raw(") {
        let end = find_matching_paren(rest)?;
        ("$state.raw", rest[..end].to_string())
    } else if let Some(rest) = rhs.strip_prefix("$state.frozen(") {
        let end = find_matching_paren(rest)?;
        ("$state.frozen", rest[..end].to_string())
    } else if let Some(rest) = rhs.strip_prefix("$state(") {
        let end = find_matching_paren(rest)?;
        ("$state", rest[..end].to_string())
    } else if let Some(rest) = rhs.strip_prefix("$derived.by(") {
        let end = find_matching_paren(rest)?;
        ("$derived.by", rest[..end].to_string())
    } else if let Some(rest) = rhs.strip_prefix("$derived(") {
        let end = find_matching_paren(rest)?;
        ("$derived", rest[..end].to_string())
    } else {
        return None;
    };
    // Strip quotes from name for private backing name generation
    // e.g., "'1'" -> "1" -> "_" (sanitized)
    let unquoted_name = strip_field_quotes(&name);
    let private_backing_name = sanitize_identifier(&unquoted_name);
    Some(ClassStateField {
        name,
        is_private,
        rune_type: rune_type.to_string(),
        value,
        private_backing_name,
        constructor_declared: true,
    })
}

/// Find all variable prefixes used with a private field in content.
/// For example, for field name "count", finds "this", "self", "instance" etc.
/// from patterns like `this.#count`, `self.#count`, `instance.#count`.
fn find_private_field_prefixes(content: &str, field_name: &str) -> Vec<String> {
    let mut prefixes = Vec::new();
    let hash_pattern = format!(".#{}", field_name);

    let mut search_from = 0;
    while let Some(pos) = content[search_from..].find(&hash_pattern) {
        let abs_pos = search_from + pos;
        // Check the character after the field name to ensure it's a word boundary
        let after_pos = abs_pos + hash_pattern.len();
        if after_pos < content.len() {
            let next_char = content.as_bytes()[after_pos] as char;
            if next_char.is_alphanumeric() || next_char == '_' {
                search_from = abs_pos + 1;
                continue;
            }
        }

        // Walk backwards to find the identifier prefix
        if abs_pos > 0 {
            let before = &content[..abs_pos];
            let prefix_end = before.len();
            let mut prefix_start = prefix_end;
            for (i, c) in before.char_indices().rev() {
                if c.is_alphanumeric() || c == '_' || c == '$' {
                    prefix_start = i;
                } else {
                    break;
                }
            }
            if prefix_start < prefix_end {
                let prefix = &before[prefix_start..prefix_end];
                if !prefix.is_empty() && !prefixes.contains(&prefix.to_string()) {
                    prefixes.push(prefix.to_string());
                }
            }
        }
        search_from = abs_pos + 1;
    }

    // Always include "this" if not already present
    if !prefixes.contains(&"this".to_string()) {
        prefixes.push("this".to_string());
    }

    prefixes
}

/// Transform class methods to use $.get() for state field accesses.
///
/// For private state fields (those initialized with $state or $derived),
/// we need to wrap accesses with $.get() and mutations with $.set().
/// Handles any variable prefix (this, self, instance, etc.) not just `this`.
fn transform_class_methods(content: &str, fields: &[ClassStateField]) -> String {
    if content.trim().is_empty() || fields.is_empty() {
        return content.to_string();
    }

    let mut result = content.to_string();

    // For each private field, find all prefixes and apply transforms
    for field in fields {
        let prefixes = find_private_field_prefixes(&result, &field.private_backing_name);

        for prefix in &prefixes {
            let qualified = format!("{}.#{}", prefix, field.private_backing_name);

            // First handle assignments (must be done before reads to avoid conflicts)

            // Handle compound assignment operators: +=, -=, *=, /=, %=, **=
            let compound_ops: &[(&str, &str)] = &[
                ("**=", "**"),
                ("+=", "+"),
                ("-=", "-"),
                ("*=", "*"),
                ("/=", "/"),
                ("%=", "%"),
            ];
            for (assign_op, binary_op) in compound_ops {
                let pattern = format!("{} {} ", qualified, assign_op);
                while let Some(pos) = result.find(&pattern) {
                    let value_start = pos + pattern.len();
                    let rest = &result[value_start..];
                    let value_end = rest.find(';').unwrap_or(rest.len());
                    let value = rest[..value_end].trim();
                    let needs_proxy = field.rune_type == "$state" && expression_needs_proxy(value);
                    let replacement = if needs_proxy {
                        format!(
                            "$.set({}, $.get({}) {} {}, true)",
                            qualified, qualified, binary_op, value
                        )
                    } else {
                        format!(
                            "$.set({}, $.get({}) {} {})",
                            qualified, qualified, binary_op, value
                        )
                    };
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[value_start + value_end..]
                    );
                }
            }

            // Handle direct assignment: prefix.#name = value -> $.set(prefix.#name, value)
            let assign_pattern = format!("{} = ", qualified);
            while let Some(pos) = result.find(&assign_pattern) {
                // Check if already inside a $.set() or $.get() call
                let before = &result[..pos];
                if before.ends_with("$.set(") || before.ends_with("$.get(") {
                    break;
                }
                let value_start = pos + assign_pattern.len();
                let rest = &result[value_start..];
                let value_end = rest.find(';').unwrap_or(rest.len());
                let value = rest[..value_end].trim();
                let needs_proxy = field.rune_type == "$state" && expression_needs_proxy(value);
                let replacement = if needs_proxy {
                    format!("$.set({}, {}, true)", qualified, value)
                } else {
                    format!("$.set({}, {})", qualified, value)
                };
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[value_start + value_end..]
                );
            }

            // Handle increment: prefix.#name++ or ++prefix.#name
            let post_inc = format!("{}++", qualified);
            while result.contains(&post_inc) {
                let replacement = format!("$.update({})", qualified);
                result = result.replacen(&post_inc, &replacement, 1);
            }
            let pre_inc = format!("++{}", qualified);
            while result.contains(&pre_inc) {
                let replacement = format!("$.update_pre({})", qualified);
                result = result.replacen(&pre_inc, &replacement, 1);
            }

            // Handle decrement: prefix.#name-- or --prefix.#name
            let post_dec = format!("{}--", qualified);
            while result.contains(&post_dec) {
                let replacement = format!("$.update({}, -1)", qualified);
                result = result.replacen(&post_dec, &replacement, 1);
            }
            let pre_dec = format!("--{}", qualified);
            while result.contains(&pre_dec) {
                let replacement = format!("$.update_pre({}, -1)", qualified);
                result = result.replacen(&pre_dec, &replacement, 1);
            }

            // Now handle reads: property access, optional chaining, standalone reads

            // Replace property access patterns: prefix.#name. -> $.get(prefix.#name).
            let property_access_pattern = format!("{}.", qualified);
            let getter_wrapped = format!("$.get({}).", qualified);
            result = result.replace(&property_access_pattern, &getter_wrapped);

            // Replace optional chaining patterns: prefix.#name?. -> $.get(prefix.#name)?.
            let optional_access_pattern = format!("{}?.", qualified);
            let optional_getter_wrapped = format!("$.get({})?.?.", qualified);
            result = result.replace(&optional_access_pattern, &optional_getter_wrapped);

            // Wrap standalone reads of prefix.#name that aren't already wrapped
            // This handles: return prefix.#name; and other standalone uses
            result = wrap_standalone_private_reads(&result, &qualified);
        }
    }

    // Clean up any double wrapping that might have occurred
    result = result.replace("$.get($.get(", "$.get(");
    // Fix optional chaining that got double-wrapped
    result = result.replace("?.?.", "?.");

    result
}

/// Wrap standalone reads of a qualified private field (e.g., `this.#count`)
/// with `$.get()`. Handles patterns like:
/// - `return this.#count;`
/// - `return this.#count`  (without semicolon)
/// - `... this.#count)` (in expressions)
/// - `this.#count,` (in argument lists)
/// - arrow function bodies: `() => this.#count + 1`
fn wrap_standalone_private_reads(content: &str, qualified: &str) -> String {
    let mut result = content.to_string();

    // Find all occurrences of the qualified name that aren't already wrapped
    let mut search_from = 0;
    while let Some(pos) = result[search_from..].find(qualified) {
        let abs_pos = search_from + pos;
        let after_pos = abs_pos + qualified.len();

        // Check what comes after - if it's already handled (assignment, increment, property access)
        // or already inside $.get(), $.set(), $.update(), $.update_pre(), skip it
        let before = &result[..abs_pos];
        if before.ends_with("$.get(")
            || before.ends_with("$.set(")
            || before.ends_with("$.update(")
            || before.ends_with("$.update_pre(")
        {
            search_from = after_pos;
            continue;
        }

        // Check character after
        let next_char = if after_pos < result.len() {
            Some(result.as_bytes()[after_pos] as char)
        } else {
            None
        };

        // If followed by = (assignment), ++ or -- (increment/decrement), . (property access),
        // ? (optional chain), or alphanumeric (part of longer name), skip
        match next_char {
            Some('.') | Some('?') | Some('+') | Some('-') => {
                search_from = after_pos;
                continue;
            }
            Some('=') => {
                // Check if it's == (comparison) vs = (assignment)
                if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'=' {
                    // It's == or ===, this is a read - wrap it
                } else {
                    // It's an assignment, skip
                    search_from = after_pos;
                    continue;
                }
            }
            Some(c) if c.is_alphanumeric() || c == '_' => {
                search_from = after_pos;
                continue;
            }
            _ => {}
        }

        // This is a standalone read - wrap with $.get()
        let wrapped = format!("$.get({})", qualified);
        result = format!("{}{}{}", &result[..abs_pos], wrapped, &result[after_pos..]);
        search_from = abs_pos + wrapped.len();
    }

    result
}

/// Like `transform_class_methods` but only transforms non-`this` prefixes.
/// Used for constructor bodies where `this.#name` is already handled by
/// `transform_constructor_assignment`, but other prefixes like `instance.#name`
/// or `self.#name` still need to be wrapped with $.get()/$.set().
fn transform_class_methods_non_this(content: &str, fields: &[ClassStateField]) -> String {
    if content.trim().is_empty() || fields.is_empty() {
        return content.to_string();
    }

    let mut result = content.to_string();

    for field in fields {
        let prefixes = find_private_field_prefixes(&result, &field.private_backing_name);

        for prefix in &prefixes {
            // Skip "this" - it's already handled by transform_constructor_assignment
            if prefix == "this" {
                continue;
            }

            let qualified = format!("{}.#{}", prefix, field.private_backing_name);

            // Handle compound assignments
            let compound_ops: &[(&str, &str)] = &[
                ("**=", "**"),
                ("+=", "+"),
                ("-=", "-"),
                ("*=", "*"),
                ("/=", "/"),
                ("%=", "%"),
            ];
            for (assign_op, binary_op) in compound_ops {
                let pattern = format!("{} {} ", qualified, assign_op);
                while let Some(pos) = result.find(&pattern) {
                    let value_start = pos + pattern.len();
                    let rest = &result[value_start..];
                    let value_end = rest.find(';').unwrap_or(rest.len());
                    let value = rest[..value_end].trim();
                    let replacement = format!(
                        "$.set({}, $.get({}) {} {})",
                        qualified, qualified, binary_op, value
                    );
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[value_start + value_end..]
                    );
                }
            }

            // Handle direct assignment
            let assign_pattern = format!("{} = ", qualified);
            while let Some(pos) = result.find(&assign_pattern) {
                let before = &result[..pos];
                if before.ends_with("$.set(") || before.ends_with("$.get(") {
                    break;
                }
                let value_start = pos + assign_pattern.len();
                let rest = &result[value_start..];
                let value_end = rest.find(';').unwrap_or(rest.len());
                let value = rest[..value_end].trim();
                let replacement = format!("$.set({}, {})", qualified, value);
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[value_start + value_end..]
                );
            }

            // Handle increment/decrement
            let post_inc = format!("{}++", qualified);
            while result.contains(&post_inc) {
                result = result.replacen(&post_inc, &format!("$.update({})", qualified), 1);
            }
            let pre_inc = format!("++{}", qualified);
            while result.contains(&pre_inc) {
                result = result.replacen(&pre_inc, &format!("$.update_pre({})", qualified), 1);
            }
            let post_dec = format!("{}--", qualified);
            while result.contains(&post_dec) {
                result = result.replacen(&post_dec, &format!("$.update({}, -1)", qualified), 1);
            }
            let pre_dec = format!("--{}", qualified);
            while result.contains(&pre_dec) {
                result = result.replacen(&pre_dec, &format!("$.update_pre({}, -1)", qualified), 1);
            }

            // Handle reads
            let property_access_pattern = format!("{}.", qualified);
            let getter_wrapped = format!("$.get({}).", qualified);
            result = result.replace(&property_access_pattern, &getter_wrapped);

            let optional_access_pattern = format!("{}?.", qualified);
            let optional_getter_wrapped = format!("$.get({})?.?.", qualified);
            result = result.replace(&optional_access_pattern, &optional_getter_wrapped);

            result = wrap_standalone_private_reads(&result, &qualified);
        }
    }

    // Clean up
    result = result.replace("$.get($.get(", "$.get(");
    result = result.replace("?.?.", "?.");

    result
}

/// Transform constructor assignments for private state fields and rune calls.
fn transform_constructor_assignment(line: &str, fields: &[ClassStateField]) -> String {
    let mut result = line.trim().to_string();

    // Handle constructor-declared rune calls
    for field in fields {
        if !field.constructor_declared {
            continue;
        }
        // Build possible this-prefix patterns
        // For regular names: this.name or this.#name
        // For bracket notation (quoted numeric names): this[n]
        let unquoted_name = strip_field_quotes(&field.name);
        let this_prefixes: Vec<String> = if field.is_private {
            vec![format!("this.#{}", field.name)]
        } else if field.name.starts_with('\'') || field.name.starts_with('"') {
            // Quoted name from bracket notation
            vec![
                format!("this[{}]", unquoted_name),
                format!("this['{}']", unquoted_name),
                format!("this[{}]", &field.name),
            ]
        } else {
            vec![format!("this.{}", field.name)]
        };
        let rune_patterns: &[(&str, &str)] = &[
            ("$state.raw(", "$state.raw"),
            ("$state.frozen(", "$state.frozen"),
            ("$state(", "$state"),
            ("$derived.by(", "$derived.by"),
            ("$derived(", "$derived"),
        ];
        for (pattern, rune_type) in rune_patterns {
            let mut matched = false;
            for this_prefix in &this_prefixes {
                let assign_pattern = format!("{} = {}", this_prefix, pattern);
                if result.starts_with(&assign_pattern)
                    || result.trim_end_matches(';').starts_with(&assign_pattern)
                {
                    matched = true;
                    break;
                }
            }
            if matched && let Some(rune_call_start) = result.find(pattern) {
                let value_start = rune_call_start + pattern.len();
                let after_paren = &result[value_start..];
                if let Some(value_end) = find_matching_paren(after_paren) {
                    let value = after_paren[..value_end].to_string();
                    let private_name = format!("this.#{}", field.private_backing_name);
                    let transformed_rhs = match *rune_type {
                        "$state" => {
                            let needs_proxy =
                                !value.trim().is_empty() && expression_needs_proxy(value.trim());
                            if needs_proxy {
                                format!("$.state($.proxy({}))", value)
                            } else {
                                format!("$.state({})", value)
                            }
                        }
                        "$state.raw" | "$state.frozen" => format!("$.state({})", value),
                        "$derived" => {
                            let mut tv = value.clone();
                            for of in fields {
                                let tp = format!("this.#{}", of.private_backing_name);
                                if tv.contains(&tp) {
                                    let getter =
                                        format!("$.get(this.#{})", of.private_backing_name);
                                    tv = tv.replace(&tp, &getter);
                                }
                            }
                            if tv.trim_start().starts_with('{') {
                                format!("$.derived(() => ({}))", tv)
                            } else {
                                format!("$.derived(() => {})", tv)
                            }
                        }
                        "$derived.by" => format!("$.derived({})", value),
                        _ => format!("$.state({})", value),
                    };
                    return format!("{} = {};", private_name, transformed_rhs);
                }
            }
        }
    }

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

                // Handle compound assignment operators: +=, -=, *=, /=, %=, **=
                // this.#count *= 2 -> $.set(this.#count, $.get(this.#count) * 2);
                let compound_ops: &[(&str, &str)] = &[
                    ("**=", "**"),
                    ("+=", "+"),
                    ("-=", "-"),
                    ("*=", "*"),
                    ("/=", "/"),
                    ("%=", "%"),
                ];
                for (assign_op, binary_op) in compound_ops {
                    let pattern = format!("this.#{} {} ", field.name, assign_op);
                    let pattern_nospace = format!("this.#{}{}", field.name, assign_op);

                    if result.starts_with(&pattern) || result.starts_with(&pattern_nospace) {
                        let op_pos = result.find(assign_op).unwrap();
                        let value = result[op_pos + assign_op.len()..]
                            .trim()
                            .trim_end_matches(';');
                        return format!(
                            "$.set(this.#{}, $.get(this.#{}) {} {});",
                            field.private_backing_name,
                            field.private_backing_name,
                            binary_op,
                            value
                        );
                    }
                }

                // Handle increment/decrement with $.update()
                let post_inc = format!("this.#{}++", field.name);
                if result.starts_with(&post_inc) {
                    return format!("$.update(this.#{});", field.private_backing_name);
                }
                let pre_inc = format!("++this.#{}", field.name);
                if result.starts_with(&pre_inc) {
                    return format!("$.update_pre(this.#{});", field.private_backing_name);
                }
                let post_dec = format!("this.#{}--", field.name);
                if result.starts_with(&post_dec) {
                    return format!("$.update(this.#{}, -1);", field.private_backing_name);
                }
                let pre_dec = format!("--this.#{}", field.name);
                if result.starts_with(&pre_dec) {
                    return format!("$.update_pre(this.#{}, -1);", field.private_backing_name);
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

    // Check if the expression is a simple call: identifier() or $.method()
    // IMPORTANT: Only plain identifiers and `$.xxx` member expressions are unthunked.
    // This matches the official Svelte compiler's unthunk() which checks
    // `expression.body.callee.type === 'Identifier'` (not arbitrary MemberExpression).
    // The `$.xxx` exception is for Svelte runtime functions (e.g., `$.effect_tracking()`).
    // e.g., `() => foo()` -> `foo`, `() => $.get(x)` -> `$.get(x)` (kept as call)
    // but `() => value.toString()` stays as `() => value.toString()`
    if let Some(callee) = trimmed.strip_suffix("()") {
        let is_plain_identifier = !callee.is_empty()
            && callee
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$');
        let is_dollar_member = callee.starts_with("$.")
            && callee[2..].chars().all(|c| c.is_alphanumeric() || c == '_');
        if is_plain_identifier || is_dollar_member {
            return callee.to_string();
        }
    }

    // No optimization possible, wrap in arrow
    format!("() => {}", expr)
}

/// Transform destructuring assignment expressions targeting reactive variables
/// into IIFE patterns.
///
/// Handles:
/// - Array destructure: `[a, b] = [expr1, expr2]` -> IIFE with `$.to_array()`
/// - Object destructure: `({a, b} = obj)` -> IIFE with individual assignments
///
/// The generated IIFE decomposes the destructure into individual assignments
/// which are then processed by `transform_state_assignments` (for `$.set()`)
/// and `transform_member_mutations` (for `$.mutate()`).
///
/// This runs BEFORE other assignment transforms in the pipeline.
///
/// Corresponds to `visit_assignment_expression` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/shared/assignments.js`.
fn transform_destructure_assignments(
    statement: &str,
    state_vars: &[String],
    store_sub_vars: &[String],
) -> String {
    transform_destructure_assignments_with_props(statement, state_vars, store_sub_vars, &[])
}

/// Transform destructure assignments, with knowledge of prop variables.
///
/// `prop_vars` are variable names that will be transformed to function calls
/// (e.g., `numbers` → `numbers()` for prop getters). When the RHS of a
/// destructuring is a prop variable, we must use the IIFE form (with `$$value`
/// caching) because the official compiler visits the RHS first, transforming it
/// to a CallExpression, and then checks `should_cache = value.type !== 'Identifier'`.
fn transform_destructure_assignments_with_props(
    statement: &str,
    state_vars: &[String],
    store_sub_vars: &[String],
    prop_vars: &[String],
) -> String {
    let mut result = statement.to_string();

    // Process the statement, looking for destructure assignments.
    // We scan for patterns and replace them with IIFEs.
    while let Some(transformed) =
        find_and_transform_one_destructure(&result, state_vars, store_sub_vars, prop_vars)
    {
        result = transformed;
    }

    result
}

// Counter for generating unique $$array names in the string-based pipeline.
// Uses thread-local storage since the transform functions are called in sequence.
thread_local! {
    static DESTRUCTURE_ARRAY_COUNTER: Cell<usize> = const { Cell::new(0) };
}

/// Find and transform one destructure assignment in the statement.
/// Returns `Some(transformed)` if a destructure was found and transformed,
/// or `None` if no more destructures to transform.
fn find_and_transform_one_destructure(
    statement: &str,
    state_vars: &[String],
    store_sub_vars: &[String],
    prop_vars: &[String],
) -> Option<String> {
    let chars: Vec<char> = statement.chars().collect();
    let len = chars.len();

    // Scan for `] =` or `} =` patterns that indicate destructure assignments.
    // We need to be careful to avoid:
    // - Already-transformed IIFE patterns ($.to_array, $.set, etc.)
    // - Regular object/array literals on the RHS of assignments
    // - Patterns inside strings or comments

    let mut i = 0;
    let mut in_string: Option<char> = None;

    while i < len {
        let c = chars[i];

        // Track string boundaries
        if in_string.is_none() {
            if c == '\'' || c == '"' || c == '`' {
                in_string = Some(c);
                i += 1;
                continue;
            }
        } else if Some(c) == in_string && (i == 0 || chars[i - 1] != '\\') {
            in_string = None;
            i += 1;
            continue;
        }

        if in_string.is_some() {
            i += 1;
            continue;
        }

        // Look for `] =` or `} =` (possibly with spaces)
        // But NOT `]= ` or `]=` (without space before =, which could be another pattern)
        if (c == ']' || c == '}') && i + 1 < len {
            // Find the `=` after the bracket (skipping any whitespace including newlines)
            let mut j = i + 1;
            while j < len && chars[j].is_whitespace() {
                j += 1;
            }
            if j < len && chars[j] == '=' && (j + 1 >= len || chars[j + 1] != '=') {
                // Found a potential destructure assignment
                // Find the matching opening bracket
                let close_bracket = c;
                let open_bracket = if c == ']' { '[' } else { '{' };

                // Walk backwards from position `i` to find the matching open bracket
                if let Some(pattern_start) =
                    find_matching_open_bracket(statement, i, open_bracket, close_bracket)
                {
                    // Check if this is a destructure we should transform
                    let pattern_str = &statement[pattern_start..=i];
                    let rhs_start = j + 1; // after the `=`

                    // For array patterns `[...]`, check if the `[` is a member access rather than a
                    // destructure pattern. If the char before `[` is an identifier char, `)`, or `]`,
                    // this is a member expression like `arr[idx] = value`, not `[target] = rhs`.
                    if open_bracket == '[' && pattern_start > 0 {
                        let before_char = chars[pattern_start - 1];
                        if before_char.is_ascii_alphanumeric()
                            || before_char == '_'
                            || before_char == '$'
                            || before_char == ')'
                            || before_char == ']'
                        {
                            i = j + 1;
                            continue;
                        }
                    }

                    // Skip if the pattern starts after a `let`, `const`, `var` keyword
                    // (those are declaration destructures, not assignment destructures)
                    let before_pattern = statement[..pattern_start].trim_end();
                    if before_pattern.ends_with("let")
                        || before_pattern.ends_with("const")
                        || before_pattern.ends_with("var")
                    {
                        i = j + 1;
                        continue;
                    }

                    // Skip if this is inside a $.to_array (already transformed pattern)
                    if before_pattern.ends_with("$.to_array(") {
                        i = j + 1;
                        continue;
                    }

                    // Extract target identifiers from the pattern
                    let targets = extract_destructure_targets(pattern_str);

                    // Check if any target is a reactive variable
                    let has_reactive_target = targets
                        .iter()
                        .any(|t| state_vars.contains(t) || store_sub_vars.contains(t));

                    if !has_reactive_target {
                        i = j + 1;
                        continue;
                    }

                    // Find the end of the RHS expression
                    let rhs_end = find_destructure_rhs_end(statement, rhs_start);
                    let rhs_str = statement[rhs_start..rhs_end].trim();

                    if rhs_str.is_empty() {
                        i = j + 1;
                        continue;
                    }

                    // Check for surrounding parentheses: `(pattern = rhs)` or `(pattern = rhs);`
                    // We need to handle the wrapping parens from `({x} = obj)` syntax
                    let mut actual_start = pattern_start;
                    let mut actual_end = rhs_end;

                    let before = statement[..pattern_start].trim_end();
                    if before.ends_with('(') {
                        let paren_pos = statement[..pattern_start].rfind('(').unwrap();
                        // Check if there's a matching `)` after the RHS
                        let after_rhs = &statement[rhs_end..];
                        if let Some(close_paren_offset) = after_rhs.find(')') {
                            actual_start = paren_pos;
                            actual_end = rhs_end + close_paren_offset + 1;
                        }
                    }

                    // Determine if this destructure is a standalone statement
                    // (like `({a, b} = obj);`) vs part of a larger expression
                    // (like `() => ({a, b} = obj)`).
                    // The official compiler checks: `context.path.at(-1).type.endsWith('Statement')`
                    // In our string-based approach, we check if the text before the actual_start
                    // is only whitespace and the text after actual_end is `;` or whitespace.
                    let before_text = statement[..actual_start].trim_end();
                    let after_text = statement[actual_end..].trim_start();
                    let is_standalone = (before_text.is_empty()
                        || before_text.ends_with(';')
                        || before_text.ends_with('{')
                        || before_text.ends_with('\n'))
                        && (after_text.is_empty()
                            || after_text.starts_with(';')
                            || after_text.starts_with('\n'));

                    // Check if the RHS is a variable that will be transformed to a
                    // function call (prop getter or store subscription). If so, force the
                    // IIFE ($$value caching) form. This matches the official compiler:
                    // context.visit(node.right) transforms the RHS first, then
                    // should_cache = value.type !== 'Identifier'.
                    let rhs_trimmed = rhs_str.trim();
                    let rhs_will_be_call = prop_vars.iter().any(|p| p == rhs_trimmed)
                        || store_sub_vars.iter().any(|s| s == rhs_trimmed);

                    // Generate the IIFE replacement
                    let iife = generate_destructure_iife(
                        close_bracket,
                        pattern_str,
                        rhs_str,
                        is_standalone,
                        store_sub_vars,
                        rhs_will_be_call,
                    );

                    // Replace the destructure expression with the IIFE
                    let mut new_statement = String::new();
                    new_statement.push_str(&statement[..actual_start]);
                    new_statement.push_str(&iife);
                    new_statement.push_str(&statement[actual_end..]);

                    return Some(new_statement);
                }
            }
        }

        i += 1;
    }

    None
}

/// Find the matching opening bracket, respecting nesting and strings.
fn find_matching_open_bracket(
    s: &str,
    close_pos: usize,
    open_bracket: char,
    close_bracket: char,
) -> Option<usize> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 1;
    let mut i = close_pos;

    // Walk backwards
    while i > 0 {
        i -= 1;
        let c = chars[i];

        if c == close_bracket {
            depth += 1;
        } else if c == open_bracket {
            depth -= 1;
            if depth == 0 {
                return Some(i);
            }
        }
    }

    None
}

/// Extract root identifier names from a destructure pattern string.
/// For `[a, b[0], c.prop]`, returns `["a", "b", "c"]`.
/// For `{x, y: z, w}`, returns `["x", "z", "w"]`.
fn extract_destructure_targets(pattern: &str) -> Vec<String> {
    let mut targets = Vec::new();
    let trimmed = pattern.trim();

    // Remove outer brackets
    let inner = if (trimmed.starts_with('[') && trimmed.ends_with(']'))
        || (trimmed.starts_with('{') && trimmed.ends_with('}'))
    {
        &trimmed[1..trimmed.len() - 1]
    } else {
        trimmed
    };

    // Split on commas (respecting nested brackets)
    let parts = split_on_commas(inner);

    for part in &parts {
        let part = part.trim();
        if part.is_empty() || part == "..." {
            continue;
        }

        // Handle rest element: ...rest
        let part = if let Some(rest) = part.strip_prefix("...") {
            rest.trim()
        } else {
            part
        };

        // Handle default value BEFORE colon check: target = default
        // This is critical because a default value may contain a ternary expression
        // with a colon (e.g., `j = "19" ? 10 : await Promise.resolve(11)`).
        // If we checked colon first, we'd mistake the ternary `:` for a key:value separator.
        // In valid destructuring syntax, `key: target = default` always has `:` before `=`,
        // so if `=` appears first, any `:` is part of the default expression.
        let part = if let Some(eq_pos) = find_top_level_equals(part) {
            part[..eq_pos].trim()
        } else {
            part
        };

        // Handle object property with rename: key: value
        let part = if let Some(colon_pos) = find_top_level_colon(part) {
            part[colon_pos + 1..].trim()
        } else {
            part
        };

        // Extract root identifier from the target
        // For `a`, returns `a`
        // For `a[0]`, returns `a`
        // For `a.prop`, returns `a`
        if let Some(root) = extract_root_identifier(part) {
            targets.push(root);
        }

        // Also recurse into nested patterns
        if part.starts_with('[') || part.starts_with('{') {
            let nested = extract_destructure_targets(part);
            targets.extend(nested);
        }
    }

    targets
}

/// Split a string on top-level commas (not inside brackets, parens, or strings).
fn split_on_commas(s: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut depth = 0;
    let mut in_string: Option<char> = None;

    for c in s.chars() {
        if in_string.is_some() {
            current.push(c);
            if Some(c) == in_string {
                in_string = None;
            }
            continue;
        }

        match c {
            '\'' | '"' | '`' => {
                in_string = Some(c);
                current.push(c);
            }
            '(' | '[' | '{' => {
                depth += 1;
                current.push(c);
            }
            ')' | ']' | '}' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                parts.push(current.clone());
                current.clear();
            }
            _ => {
                current.push(c);
            }
        }
    }

    if !current.is_empty() {
        parts.push(current);
    }

    parts
}

/// Find the position of a top-level colon in a string (not inside brackets or strings).
fn find_top_level_colon(s: &str) -> Option<usize> {
    let mut depth = 0;
    let mut in_string: Option<char> = None;

    for (i, c) in s.char_indices() {
        if in_string.is_some() {
            if Some(c) == in_string {
                in_string = None;
            }
            continue;
        }

        match c {
            '\'' | '"' | '`' => in_string = Some(c),
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            ':' if depth == 0 => return Some(i),
            _ => {}
        }
    }

    None
}

/// Find the position of a top-level `=` in a string (not `==` or `===`).
fn find_top_level_equals(s: &str) -> Option<usize> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut in_string: Option<char> = None;

    for (i, &c) in chars.iter().enumerate() {
        if in_string.is_some() {
            if Some(c) == in_string {
                in_string = None;
            }
            continue;
        }

        match c {
            '\'' | '"' | '`' => in_string = Some(c),
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '=' if depth == 0 => {
                // Make sure it's not == or ===
                if i + 1 < chars.len() && chars[i + 1] == '=' {
                    continue;
                }
                // Make sure it's not != or <=, >=
                if i > 0 && matches!(chars[i - 1], '!' | '<' | '>') {
                    continue;
                }
                return Some(i);
            }
            _ => {}
        }
    }

    None
}

/// Extract the root identifier from a string like `a`, `a[0]`, `a.prop`.
fn extract_root_identifier(s: &str) -> Option<String> {
    let s = s.trim();
    if s.is_empty() {
        return None;
    }

    // Check if it starts with an identifier character
    let first = s.chars().next()?;
    if !first.is_ascii_alphabetic() && first != '_' && first != '$' {
        return None;
    }

    let mut end = 0;
    for c in s.chars() {
        if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
            end += c.len_utf8();
        } else {
            break;
        }
    }

    if end > 0 {
        Some(s[..end].to_string())
    } else {
        None
    }
}

/// Find the end of the RHS expression in a destructure assignment.
/// Handles balanced brackets, parentheses, and semicolons.
fn find_destructure_rhs_end(statement: &str, start: usize) -> usize {
    let chars: Vec<char> = statement.chars().collect();
    let len = chars.len();
    let mut i = start;
    let mut depth = 0;
    let mut in_string: Option<char> = None;

    // Skip leading whitespace
    while i < len && chars[i].is_whitespace() {
        i += 1;
    }

    let expr_start = i;

    while i < len {
        let c = chars[i];

        if in_string.is_some() {
            if Some(c) == in_string && (i == 0 || chars[i - 1] != '\\') {
                in_string = None;
            }
            i += 1;
            continue;
        }

        match c {
            '\'' | '"' | '`' => {
                in_string = Some(c);
                i += 1;
            }
            '(' | '[' | '{' => {
                depth += 1;
                i += 1;
            }
            ')' => {
                if depth == 0 {
                    // This closing paren belongs to an outer context
                    return i;
                }
                depth -= 1;
                i += 1;
                // After closing `)` at depth 0, check if followed by `(` (function call)
                // or `[` (member access). If so, continue parsing as the expression
                // is not finished yet. E.g., `(async (...) => {...})(args)`.
                if depth == 0 {
                    // Skip whitespace
                    let mut j = i;
                    while j < len && chars[j].is_whitespace() {
                        j += 1;
                    }
                    if j < len && (chars[j] == '(' || chars[j] == '[' || chars[j] == '.') {
                        // This is a function call, member access, or property access
                        // Continue parsing
                    } else {
                        // Expression ends here
                        // But don't return - let the next iteration handle it
                    }
                }
            }
            ']' | '}' => {
                if depth == 0 {
                    return i;
                }
                depth -= 1;
                i += 1;
            }
            ';' if depth == 0 => {
                return i;
            }
            ',' if depth == 0 => {
                // Could be end of expression in sequence
                return i;
            }
            _ => {
                i += 1;
            }
        }
    }

    // If we didn't find a terminator, include everything to the end
    // but trim trailing whitespace and newlines
    let mut end = len;
    while end > expr_start && chars[end - 1].is_whitespace() {
        end -= 1;
    }
    end
}

/// Generate a member access expression for a destructuring key.
/// For computed keys like `[expr]`, generates `obj[expr]` (bracket notation).
/// For static keys like `prop`, generates `obj.prop` (dot notation).
fn member_access(obj: &str, key: &str) -> String {
    if key.starts_with('[') && key.ends_with(']') {
        // Computed property key: obj[expr]
        // Strip the outer brackets to get the expression
        let expr = &key[1..key.len() - 1];
        format!("{}[{}]", obj, expr)
    } else {
        // Static property key: obj.prop
        format!("{}.{}", obj, key)
    }
}

/// Check if a generated code string contains `await` as a keyword (not inside string literals).
///
/// This is used to determine if a destructuring IIFE needs to be async.
/// The check is simplified since the input is compiler-generated code where
/// `await` only appears as actual await expressions.
fn code_contains_await(code: &str) -> bool {
    let bytes = code.as_bytes();
    let len = bytes.len();
    let await_bytes = b"await";
    let await_len = await_bytes.len();

    if len < await_len {
        return false;
    }

    let mut i = 0;
    // Track string context: None = not in string, Some(quote) = in string
    let mut in_string: Option<u8> = None;
    // Stack for template literal interpolation depth tracking.
    // When we encounter `${` inside a template literal, we push the brace depth.
    // When the matching `}` is found, we pop back into the template literal.
    let mut template_depth_stack: Vec<u32> = Vec::new();
    let mut brace_depth: u32 = 0;

    while i < len {
        let c = bytes[i];

        if let Some(quote) = in_string {
            if quote == b'`' {
                // Inside template literal - check for `${` interpolation
                if c == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                    // Enter interpolation expression - push current state
                    template_depth_stack.push(brace_depth);
                    brace_depth = 0;
                    in_string = None;
                    i += 2; // skip `${`
                    continue;
                }
                // Check for end of template literal
                if c == b'`' && (i == 0 || bytes[i - 1] != b'\\') {
                    in_string = None;
                    i += 1;
                    continue;
                }
            } else {
                // Inside single or double quoted string
                if c == quote && (i == 0 || bytes[i - 1] != b'\\') {
                    in_string = None;
                    i += 1;
                    continue;
                }
            }
            // Skip content inside strings
            i += 1;
            continue;
        }

        // Not inside a string - check for string openings
        if c == b'\'' || c == b'"' || c == b'`' {
            in_string = Some(c);
            i += 1;
            continue;
        }

        // Track brace depth for template literal interpolation
        if c == b'{' {
            brace_depth += 1;
        } else if c == b'}' {
            if brace_depth == 0 && !template_depth_stack.is_empty() {
                // Closing `}` of a template interpolation - back to template literal
                brace_depth = template_depth_stack.pop().unwrap();
                in_string = Some(b'`');
                i += 1;
                continue;
            }
            brace_depth = brace_depth.saturating_sub(1);
        }

        // Check for "await" keyword with word boundaries
        if i + await_len <= len && &bytes[i..i + await_len] == await_bytes {
            // Check that it's not part of a larger identifier
            let before_ok = i == 0 || !bytes[i - 1].is_ascii_alphanumeric() && bytes[i - 1] != b'_';
            let after_ok = i + await_len >= len
                || !bytes[i + await_len].is_ascii_alphanumeric() && bytes[i + await_len] != b'_';
            if before_ok && after_ok {
                return true;
            }
        }

        i += 1;
    }

    false
}

/// Check if a string expression contains `await` as a keyword (not inside strings).
/// This is a simplified check that looks for `await` preceded by a non-identifier char
/// and followed by a non-identifier char.
fn string_expr_has_await(s: &str) -> bool {
    string_expr_has_toplevel_await(s)
}

/// Check if a string expression has a top-level `await` keyword.
///
/// This mirrors the official compiler's `is_expression_async` which does NOT
/// recurse into nested `async` function/arrow bodies. So `(async (x) => await x)(arg)`
/// returns `false` because the `await` is inside the async arrow, not at the top level.
fn string_expr_has_toplevel_await(s: &str) -> bool {
    let bytes = s.as_bytes();
    let len = bytes.len();
    if len < 5 {
        return false;
    }

    // We track nested depth (parens, braces, brackets combined) and maintain
    // a "min safe depth" - the depth at/below which `await` counts as top-level.
    // When we encounter an `async` keyword, we record the current depth as an
    // "async scope entry" - any `await` found at a deeper depth within that
    // async's body should be ignored.
    //
    // Strategy: when we see `async`, skip ahead past the entire async
    // function/arrow body so we never even see its internal `await` keywords.
    let mut i = 0;
    while i < len {
        // Skip string literals
        if i < len && (bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`') {
            let quote = bytes[i];
            i += 1;
            while i < len {
                if bytes[i] == b'\\' {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for `async` keyword - if found, skip past the async body
        if i + 5 <= len && &bytes[i..i + 5] == b"async" {
            let before_ok = i == 0
                || !bytes[i - 1].is_ascii_alphanumeric()
                    && bytes[i - 1] != b'_'
                    && bytes[i - 1] != b'$';
            let after_ok = i + 5 >= len
                || !bytes[i + 5].is_ascii_alphanumeric()
                    && bytes[i + 5] != b'_'
                    && bytes[i + 5] != b'$';
            if before_ok && after_ok {
                // Skip past the entire async function/arrow body
                if let Some(end) = skip_async_body(bytes, i + 5) {
                    i = end;
                    continue;
                }
            }
        }

        // Check for `await` keyword (only reached if not inside an async body)
        if i + 5 <= len && &bytes[i..i + 5] == b"await" {
            let before_ok = i == 0
                || !bytes[i - 1].is_ascii_alphanumeric()
                    && bytes[i - 1] != b'_'
                    && bytes[i - 1] != b'$';
            let after_ok = i + 5 >= len
                || !bytes[i + 5].is_ascii_alphanumeric()
                    && bytes[i + 5] != b'_'
                    && bytes[i + 5] != b'$';
            if before_ok && after_ok {
                return true;
            }
        }

        i += 1;
    }
    false
}

/// Skip past an async function/arrow body starting from the position right after `async`.
/// Returns the position after the body ends, or None if this isn't a recognizable pattern.
fn skip_async_body(bytes: &[u8], start: usize) -> Option<usize> {
    let len = bytes.len();
    let mut i = start;

    // Skip whitespace
    while i < len && bytes[i].is_ascii_whitespace() {
        i += 1;
    }

    if i >= len {
        return None;
    }

    // Case 1: `async function ...` - skip to end of function body
    if i + 8 <= len && &bytes[i..i + 8] == b"function" {
        // Skip to the function body `{...}`
        // Find the opening `{`
        while i < len && bytes[i] != b'{' {
            i += 1;
        }
        if i >= len {
            return None;
        }
        // Skip the `{...}` block
        return Some(skip_balanced_braces(bytes, i));
    }

    // Case 2: `async (params) => body` or `async name => body`
    if bytes[i] == b'(' {
        // Skip the params `(...)`
        i = skip_balanced(bytes, i, b'(', b')');
    } else if bytes[i].is_ascii_alphabetic() || bytes[i] == b'_' || bytes[i] == b'$' {
        // Single param: `async x => ...`
        while i < len && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'_' || bytes[i] == b'$')
        {
            i += 1;
        }
    } else {
        return None;
    }

    // Skip whitespace
    while i < len && bytes[i].is_ascii_whitespace() {
        i += 1;
    }

    // Expect `=>`
    if i + 2 <= len && &bytes[i..i + 2] == b"=>" {
        i += 2;
    } else {
        return None;
    }

    // Skip whitespace
    while i < len && bytes[i].is_ascii_whitespace() {
        i += 1;
    }

    if i >= len {
        return Some(i);
    }

    // Arrow body: either `{...}` block or expression
    if bytes[i] == b'{' {
        return Some(skip_balanced_braces(bytes, i));
    }

    // Expression body: skip to end of expression (up to a comma/paren/bracket at depth 0)
    Some(skip_expression(bytes, i))
}

/// Skip a balanced `{...}` block, returning position after closing `}`.
fn skip_balanced_braces(bytes: &[u8], start: usize) -> usize {
    skip_balanced(bytes, start, b'{', b'}')
}

/// Skip balanced brackets from start (which should be the opening bracket).
/// Returns position after the closing bracket.
fn skip_balanced(bytes: &[u8], start: usize, open: u8, close: u8) -> usize {
    let len = bytes.len();
    let mut depth = 0;
    let mut i = start;
    let mut in_string: Option<u8> = None;

    while i < len {
        if let Some(q) = in_string {
            if bytes[i] == b'\\' {
                i += 2;
                continue;
            }
            if bytes[i] == q {
                in_string = None;
            }
            i += 1;
            continue;
        }
        if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
            in_string = Some(bytes[i]);
            i += 1;
            continue;
        }
        if bytes[i] == open {
            depth += 1;
        } else if bytes[i] == close {
            depth -= 1;
            if depth == 0 {
                return i + 1;
            }
        }
        i += 1;
    }
    len
}

/// Skip an expression (arrow body without braces). Ends at a `,`, `)`, `]`, or `}`
/// at depth 0, or at end of input.
fn skip_expression(bytes: &[u8], start: usize) -> usize {
    let len = bytes.len();
    let mut depth = 0usize;
    let mut i = start;
    let mut in_string: Option<u8> = None;

    while i < len {
        if let Some(q) = in_string {
            if bytes[i] == b'\\' {
                i += 2;
                continue;
            }
            if bytes[i] == q {
                in_string = None;
            }
            i += 1;
            continue;
        }
        if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
            in_string = Some(bytes[i]);
            i += 1;
            continue;
        }
        match bytes[i] {
            b'(' | b'[' | b'{' => {
                depth += 1;
            }
            b')' | b']' | b'}' => {
                if depth == 0 {
                    return i;
                }
                depth -= 1;
            }
            b',' if depth == 0 => {
                return i;
            }
            _ => {}
        }
        i += 1;
    }
    len
}

/// Check if a string expression is a "simple" expression that doesn't need thunk wrapping.
///
/// Simple expressions: identifiers, literals (numbers, strings, booleans),
/// arrow functions, function expressions. Does NOT include call expressions,
/// member expressions, etc.
fn string_is_simple_expression(s: &str) -> bool {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        return false;
    }

    // Identifiers: purely alphanumeric + _ + $
    if trimmed
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
    {
        return true;
    }

    // Numeric literals
    if trimmed.parse::<f64>().is_ok() {
        return true;
    }

    // String literals
    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
    {
        return true;
    }

    // Boolean/null literals
    if trimmed == "true" || trimmed == "false" || trimmed == "null" || trimmed == "undefined" {
        return true;
    }

    // Arrow functions and function expressions
    if trimmed.starts_with("() =>") || trimmed.starts_with("function") {
        return true;
    }

    false
}

/// Build a `$.fallback(expression, default)` string, applying async thunk wrapping
/// when the default value contains `await`.
///
/// Mirrors the official Svelte compiler's `build_fallback()` from `utils/ast.js`:
/// 1. Simple expression (no await): `$.fallback(access, default)`
/// 2. Simple `await simple_expr`: `await $.fallback(access, simple_expr)` (unwrap await)
/// 3. Non-simple with await: `await $.fallback(access, async () => default, true)`
/// 4. Non-simple, no await: `$.fallback(access, () => default, true)`
fn build_fallback_string(access: &str, default_val: &str) -> String {
    let trimmed = default_val.trim();

    // Case 1: Simple expression without await
    if string_is_simple_expression(trimmed) {
        return format!("$.fallback({}, {})", access, default_val);
    }

    // Case 2: `await simple_expr` - unwrap await and pass inner directly
    if let Some(inner) = trimmed.strip_prefix("await ") {
        let inner = inner.trim();
        if string_is_simple_expression(inner) {
            return format!("await $.fallback({}, {})", access, inner);
        }
    }

    // Case 3: Expression contains await -> async thunk (with unthunk optimization)
    if string_expr_has_await(trimmed) {
        // Unthunk optimization: `async () => await expr` → `() => expr`
        // when expr itself has no nested await.
        // This mirrors the official compiler's `unthunk()` function.
        if let Some(inner) = trimmed.strip_prefix("await ") {
            let inner = inner.trim();
            if !string_expr_has_await(inner) {
                // Optimized: sync thunk wrapping the non-await inner expression
                return format!("await $.fallback({}, () => {}, true)", access, inner);
            }
        }
        return format!(
            "await $.fallback({}, async () => {}, true)",
            access, default_val
        );
    }

    // Case 4: Non-simple, no await -> sync thunk
    format!("$.fallback({}, () => {}, true)", access, default_val)
}

/// Generate an IIFE for a destructure assignment.
///
/// For array patterns: `(($$value) => { var $$array = $.to_array($$value, N); target1 = $$array[0]; ... })(rhs)`
/// For object patterns: `(($$value) => { target1 = $$value.key1; ... })(rhs)`
///
/// When `is_standalone` is false (the destructure is part of a larger expression),
/// `return $$value;` is appended so the IIFE returns the value.
fn generate_destructure_iife(
    pattern_type: char, // ']' for array, '}' for object
    pattern_str: &str,
    rhs_str: &str,
    is_standalone: bool,
    store_sub_vars: &[String],
    force_cache_rhs: bool,
) -> String {
    let trimmed = pattern_str.trim();

    // Remove outer brackets (both array `[...]` and object `{...}`)
    let inner = &trimmed[1..trimmed.len() - 1];

    let parts = split_on_commas(inner);

    if pattern_type == ']' {
        // Array destructure
        let array_name = DESTRUCTURE_ARRAY_COUNTER.with(|c| {
            let count = c.get();
            let name = if count == 0 {
                "$$array".to_string()
            } else {
                format!("$$array_{}", count)
            };
            c.set(count + 1);
            name
        });

        // Check if last element is a rest element
        let has_rest = parts
            .last()
            .map(|p| p.trim().starts_with("..."))
            .unwrap_or(false);

        let to_array_args = if has_rest {
            "$.to_array($$value)".to_string()
        } else {
            format!("$.to_array($$value, {})", parts.len())
        };

        let mut body_lines = Vec::new();
        body_lines.push(format!("\tvar {} = {};", array_name, to_array_args));
        body_lines.push(String::new()); // blank line

        for (idx, part) in parts.iter().enumerate() {
            let part = part.trim();
            if part.is_empty() {
                continue; // Skip holes
            }

            if let Some(rest_target) = part.strip_prefix("...") {
                let rest_target = rest_target.trim();
                if rest_target.starts_with('{') && rest_target.ends_with('}') {
                    // Rest with object destructure pattern: ...{ z = 26 }
                    // Generate inline property access from .slice() result
                    let slice_expr = format!("{}.slice({})", array_name, idx);
                    let obj_inner = &rest_target[1..rest_target.len() - 1];
                    let obj_parts = split_on_commas(obj_inner);
                    for obj_part in &obj_parts {
                        let obj_part = obj_part.trim();
                        if obj_part.is_empty() {
                            continue;
                        }
                        if let Some(eq_pos) = find_top_level_equals(obj_part) {
                            let prop_name = obj_part[..eq_pos].trim();
                            let default_val = obj_part[eq_pos + 1..].trim();
                            let access = format!("{}.{}", slice_expr, prop_name);
                            let fallback = build_fallback_string(&access, default_val);
                            body_lines.push(format!("\t{} = {};", prop_name, fallback));
                        } else {
                            body_lines
                                .push(format!("\t{} = {}.{};", obj_part, slice_expr, obj_part));
                        }
                    }
                } else {
                    body_lines.push(format!(
                        "\t{} = {}.slice({});",
                        rest_target, array_name, idx
                    ));
                }
            } else {
                // Handle default value: `target = default`
                let (target, default_val) = if let Some(eq_pos) = find_top_level_equals(part) {
                    let t = part[..eq_pos].trim();
                    let d = part[eq_pos + 1..].trim();
                    (t, Some(d))
                } else {
                    (part, None)
                };

                if let Some(default_val) = default_val {
                    let access = format!("{}[{}]", array_name, idx);
                    let fallback = build_fallback_string(&access, default_val);
                    body_lines.push(format!("\t{} = {};", target, fallback));
                } else {
                    body_lines.push(format!("\t{} = {}[{}];", target, array_name, idx));
                }
            }
        }

        if !is_standalone {
            body_lines.push(String::new()); // blank line before return
            body_lines.push("\treturn $$value;".to_string());
        }

        let body = body_lines.join("\n");
        // When the IIFE body or RHS contains `await`, the arrow must be async
        // and the whole call must be `await`ed. This matches the official Svelte
        // compiler which generates `await (async ($$value) => { ... })(rhs)`.
        if code_contains_await(&body) || code_contains_await(rhs_str) {
            format!("await (async ($$value) => {{\n{}\n}})({})", body, rhs_str)
        } else {
            format!("(($$value) => {{\n{}\n}})({})", body, rhs_str)
        }
    } else {
        // Object destructure
        //
        // Optimization: when the RHS is a simple identifier and the pattern has only
        // simple targets (no defaults, no nested patterns, no rest elements), we can
        // generate a comma/sequence expression instead of an IIFE.
        // This matches the official Svelte compiler output:
        //   `({$a, $b} = obj)` → `($.store_set(a, obj.$a), $.store_set(b, obj.$b));`
        // instead of:
        //   `(($$value) => { ... })(obj);`
        let rhs_is_simple_identifier = rhs_str
            .trim()
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '$');
        // Check if all parts are "simple enough" to use direct property access instead of IIFE.
        // Allow defaults (= sign) since we can use $.fallback() with direct access.
        let all_parts_simple = !parts.is_empty()
            && parts.iter().all(|p| {
                let p = p.trim();
                if p.is_empty() {
                    return true;
                }
                // No rest elements
                if p.starts_with("...") {
                    return false;
                }
                // If key-value, target must be simple identifier (no nested patterns)
                if let Some(colon_pos) = find_top_level_colon(p) {
                    let target = p[colon_pos + 1..].trim();
                    // Check for default value in key-value pair
                    let target_without_default = if let Some(eq_pos) = find_top_level_equals(target)
                    {
                        target[..eq_pos].trim()
                    } else {
                        target
                    };
                    // No nested array/object patterns
                    if target_without_default.starts_with('[')
                        || target_without_default.starts_with('{')
                    {
                        return false;
                    }
                } else {
                    // Shorthand with default: check the name part
                    if let Some(eq_pos) = find_top_level_equals(p) {
                        let name = p[..eq_pos].trim();
                        if name.starts_with('[') || name.starts_with('{') {
                            return false;
                        }
                    }
                }
                true
            });

        if rhs_is_simple_identifier && all_parts_simple && !force_cache_rhs {
            // Generate comma/sequence expression with individual assignments.
            // When the RHS is a simple identifier (and won't be transformed to a call),
            // there's no need for caching in $$value.
            // This matches the official Svelte compiler output:
            //   `({$a, $b} = obj)` -> `($.store_set(a, obj.$a), $.store_set(b, obj.$b));`
            //   `({store1, store2} = context)` -> `(store1 = context.store1, store2 = context.store2)`
            //
            // For store sub targets: generate $.store_set() directly
            // For state var targets: generate plain assignment (downstream transforms add $.set() etc.)
            //
            // Use a single line to avoid issues with downstream transforms that treat
            // newlines as statement boundaries (find_statement_end_client).
            let mut assignments: Vec<String> = Vec::new();
            for part in &parts {
                let part = part.trim();
                if part.is_empty() {
                    continue;
                }
                let (key, target_with_default) = if let Some(colon_pos) = find_top_level_colon(part)
                {
                    (
                        part[..colon_pos].trim().to_string(),
                        part[colon_pos + 1..].trim().to_string(),
                    )
                } else {
                    // Shorthand: {x} or {x = default} means key=x
                    let name = if let Some(eq_pos) = find_top_level_equals(part) {
                        part[..eq_pos].trim().to_string()
                    } else {
                        part.to_string()
                    };
                    (name.clone(), part.to_string())
                };

                // Split target from default value
                let (target, default_val) =
                    if let Some(eq_pos) = find_top_level_equals(&target_with_default) {
                        (
                            target_with_default[..eq_pos].trim().to_string(),
                            Some(target_with_default[eq_pos + 1..].trim().to_string()),
                        )
                    } else {
                        (target_with_default.clone(), None)
                    };

                let access = format!("{}.{}", rhs_str, key);

                // Check if the target is a store subscription variable ($storeName)
                if store_sub_vars.contains(&target) && target.starts_with('$') {
                    let store_name = &target[1..]; // Remove the $ prefix
                    if let Some(default_val) = &default_val {
                        let fallback = build_fallback_string(&access, default_val);
                        assignments.push(format!("$.store_set({}, {})", store_name, fallback));
                    } else {
                        assignments.push(format!("$.store_set({}, {})", store_name, access));
                    }
                } else if let Some(default_val) = &default_val {
                    let fallback = build_fallback_string(&access, default_val);
                    assignments.push(format!("{} = {}", target, fallback));
                } else {
                    assignments.push(format!("{} = {}", target, access));
                }
            }

            if !is_standalone {
                // Part of a larger expression - need the value at the end
                assignments.push(rhs_str.to_string());
            }

            if assignments.len() == 1 {
                return format!("({})", assignments[0]);
            } else {
                // Single-line comma expression format.
                // IMPORTANT: Must be single-line because downstream processing in
                // process_accumulated/find_statement_end_client treats newlines at depth 0
                // as statement boundaries, which would break multi-line expressions.
                return format!("({})", assignments.join(", "));
            }
        }

        let mut body_lines = Vec::new();
        let mut prepend_lines: Vec<String> = Vec::new();

        for part in &parts {
            let part = part.trim();
            if part.is_empty() {
                continue;
            }

            if let Some(rest_target) = part.strip_prefix("...") {
                // Rest element: ...rest = $.exclude_from_object($$value, [keys...])
                let rest_target = rest_target.trim();
                let keys: Vec<String> = parts
                    .iter()
                    .filter(|p| !p.trim().starts_with("..."))
                    .map(|p| {
                        let p = p.trim();
                        // Extract the key name
                        if let Some(colon_pos) = find_top_level_colon(p) {
                            let key = p[..colon_pos].trim();
                            format!("'{}'", key)
                        } else {
                            // Shorthand or just identifier with possible default
                            let name = if let Some(eq_pos) = find_top_level_equals(p) {
                                p[..eq_pos].trim()
                            } else {
                                p
                            };
                            format!("'{}'", name)
                        }
                    })
                    .collect();
                body_lines.push(format!(
                    "\t{} = $.exclude_from_object($$value, [{}]);",
                    rest_target,
                    keys.join(", ")
                ));
            } else if let Some(colon_pos) = find_top_level_colon(part) {
                // Key-value pair: key: target
                let key = part[..colon_pos].trim();
                let target = part[colon_pos + 1..].trim();

                // Handle default value
                // Use member_access to handle computed property keys like [expr]
                let value_access = member_access("$$value", key);
                if let Some(eq_pos) = find_top_level_equals(target) {
                    let actual_target = target[..eq_pos].trim();
                    let default_val = target[eq_pos + 1..].trim();
                    let fallback = build_fallback_string(&value_access, default_val);
                    body_lines.push(format!("\t{} = {};", actual_target, fallback));
                } else if target.starts_with('[') && target.ends_with(']') {
                    // Nested array pattern: key: [a, b, c]
                    // Inline the array destructuring instead of creating a nested IIFE
                    let inner_parts = split_on_commas(&target[1..target.len() - 1]);
                    let array_name = DESTRUCTURE_ARRAY_COUNTER.with(|c| {
                        let count = c.get();
                        let name = if count == 0 {
                            "$$array".to_string()
                        } else {
                            format!("$$array_{}", count)
                        };
                        c.set(count + 1);
                        name
                    });
                    // Insert the to_array call at the beginning of body_lines
                    // We use a marker to insert it at the right place later
                    let has_rest = inner_parts
                        .last()
                        .map(|p| p.trim().starts_with("..."))
                        .unwrap_or(false);
                    let to_array_args = if has_rest {
                        format!("$.to_array({})", value_access)
                    } else {
                        format!("$.to_array({}, {})", value_access, inner_parts.len())
                    };
                    // We need to insert the var declaration before the assignments
                    // Store it as a "prepend" item
                    prepend_lines.push(format!("\tvar {} = {};", array_name, to_array_args));

                    for (idx, inner_part) in inner_parts.iter().enumerate() {
                        let inner_part = inner_part.trim();
                        if inner_part.is_empty() {
                            continue;
                        }
                        if let Some(rest_target) = inner_part.strip_prefix("...") {
                            body_lines.push(format!(
                                "\t{} = {}.slice({});",
                                rest_target.trim(),
                                array_name,
                                idx
                            ));
                        } else if let Some(eq_pos) = find_top_level_equals(inner_part) {
                            let actual_target = inner_part[..eq_pos].trim();
                            let default_val = inner_part[eq_pos + 1..].trim();
                            let access = format!("{}[{}]", array_name, idx);
                            let fallback = build_fallback_string(&access, default_val);
                            body_lines.push(format!("\t{} = {};", actual_target, fallback));
                        } else {
                            body_lines.push(format!("\t{} = {}[{}];", inner_part, array_name, idx));
                        }
                    }
                } else {
                    body_lines.push(format!("\t{} = {};", target, value_access));
                }
            } else {
                // Shorthand: {x} means key=x, target=x
                let name = if let Some(eq_pos) = find_top_level_equals(part) {
                    let actual_name = part[..eq_pos].trim();
                    let default_val = part[eq_pos + 1..].trim();
                    let access = format!("$$value.{}", actual_name);
                    let fallback = build_fallback_string(&access, default_val);
                    body_lines.push(format!("\t{} = {};", actual_name, fallback));
                    continue;
                } else {
                    part
                };

                body_lines.push(format!("\t{} = $$value.{};", name, name));
            }
        }

        // Prepend array destructure declarations before assignments
        if !prepend_lines.is_empty() {
            prepend_lines.push(String::new()); // blank line after declarations
            let mut all_lines = prepend_lines;
            all_lines.extend(body_lines);
            body_lines = all_lines;
        }

        if !is_standalone {
            body_lines.push(String::new()); // blank line before return
            body_lines.push("\treturn $$value;".to_string());
        }

        let body = body_lines.join("\n");
        // When the IIFE body or RHS contains `await`, the arrow must be async
        // and the whole call must be `await`ed.
        if code_contains_await(&body) || code_contains_await(rhs_str) {
            format!("await (async ($$value) => {{\n{}\n}})({})", body, rhs_str)
        } else {
            format!("(($$value) => {{\n{}\n}})({})", body, rhs_str)
        }
    }
}

/// Transform member expression assignments to `$.mutate()` calls in legacy mode.
///
/// Detects patterns at any nesting level (including inside function bodies) like:
/// - `var.prop = expr` -> `$.mutate(var, var.prop = expr)`
/// - `var[idx] = expr` -> `$.mutate(var, var[idx] = expr)`
///
/// Only applies when the base of the member expression is a state variable in
/// non-runes (legacy) mode.
///
/// The subsequent `wrap_state_vars_in_expr` call will handle `$.get()` wrapping
/// inside the mutation expression (the `in_mutate_first_arg` guard in that
/// function ensures the first argument of `$.mutate()` is NOT double-wrapped).
fn transform_member_mutations(
    line: &str,
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    raw_state_vars: &[String],
) -> String {
    // Use the character-scanning approach from transform_state_member_mutations
    // to find member mutations at any nesting level (including inside function bodies).
    let mut result = line.to_string();

    for var in state_vars {
        // Skip non-reactive and raw state vars
        if non_reactive_state_vars.contains(var) || raw_state_vars.contains(var) {
            continue;
        }

        let var_chars: Vec<char> = var.chars().collect();
        let var_len = var_chars.len();

        let mut new_result = String::new();
        let chars: Vec<char> = result.chars().collect();
        let mut i = 0;
        let mut in_string: Option<char> = None;
        let mut in_line_comment = false;
        let mut in_block_comment = false;

        while i < chars.len() {
            let c = chars[i];

            // Handle line comments
            if in_line_comment {
                new_result.push(c);
                if c == '\n' {
                    in_line_comment = false;
                }
                i += 1;
                continue;
            }
            // Handle block comments
            if in_block_comment {
                new_result.push(c);
                if c == '*' && i + 1 < chars.len() && chars[i + 1] == '/' {
                    new_result.push('/');
                    i += 2;
                    in_block_comment = false;
                } else {
                    i += 1;
                }
                continue;
            }
            // Detect comment start
            if in_string.is_none() && c == '/' && i + 1 < chars.len() {
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

            // Handle string boundaries
            if in_string.is_none() {
                if c == '\'' || c == '"' || c == '`' {
                    in_string = Some(c);
                    new_result.push(c);
                    i += 1;
                    continue;
                }
            } else if Some(c) == in_string {
                // Check for escape
                let escaped = i > 0 && {
                    let mut backslash_count = 0;
                    let mut j = i - 1;
                    while chars[j] == '\\' {
                        backslash_count += 1;
                        if j == 0 {
                            break;
                        }
                        j -= 1;
                    }
                    backslash_count % 2 == 1
                };
                if !escaped {
                    in_string = None;
                }
                new_result.push(c);
                i += 1;
                continue;
            }
            if in_string.is_some() {
                new_result.push(c);
                i += 1;
                continue;
            }

            // Try to match the state var at position i
            if i + var_len <= chars.len() {
                let potential: String = chars[i..i + var_len].iter().collect();
                if potential == *var {
                    let before_ok = i == 0 || !is_identifier_char(chars[i - 1]);
                    let after_ok = i + var_len < chars.len()
                        && (chars[i + var_len] == '[' || chars[i + var_len] == '.');
                    // Check it's not already after `$.get(` or `$.mutate(` or $.set(
                    let already_wrapped = {
                        let prefix_len = "$.get(".len();
                        i >= prefix_len && {
                            let prefix: String = chars[i - prefix_len..i].iter().collect();
                            prefix == "$.get("
                        }
                    } || {
                        let prefix_len = "$.mutate(".len();
                        i >= prefix_len && {
                            let prefix: String = chars[i - prefix_len..i].iter().collect();
                            prefix == "$.mutate("
                        }
                    } || {
                        // Check if preceded by dot (member access of something else)
                        i > 0 && chars[i - 1] == '.'
                    };

                    if before_ok && after_ok && !already_wrapped {
                        // Scan forward to find the full member expression LHS and the `=` sign
                        let member_start = i + var_len;
                        let mut j = member_start;
                        let mut depth = 0i32;
                        let mut eq_pos = None;
                        let mut scan_in_string: Option<char> = None;

                        while j < chars.len() {
                            let ch = chars[j];

                            // Handle strings inside the member expression
                            if let Some(s) = scan_in_string {
                                if ch == s {
                                    scan_in_string = None;
                                }
                                j += 1;
                                continue;
                            }
                            if ch == '\'' || ch == '"' || ch == '`' {
                                scan_in_string = Some(ch);
                                j += 1;
                                continue;
                            }

                            match ch {
                                '[' | '(' => {
                                    depth += 1;
                                    j += 1;
                                }
                                ']' | ')' => {
                                    if depth == 0 {
                                        break;
                                    }
                                    depth -= 1;
                                    j += 1;
                                }
                                '{' => {
                                    if depth == 0 {
                                        break;
                                    }
                                    depth += 1;
                                    j += 1;
                                }
                                '}' => {
                                    if depth == 0 {
                                        break;
                                    }
                                    depth -= 1;
                                    j += 1;
                                }
                                // Semicolons at depth 0 are statement boundaries
                                // - stop scanning for `=` signs.
                                ';' if depth == 0 => {
                                    break;
                                }
                                '=' if depth == 0 => {
                                    let is_double_eq = j + 1 < chars.len() && chars[j + 1] == '=';
                                    let is_comparison =
                                        j > 0 && matches!(chars[j - 1], '!' | '<' | '>' | '=');
                                    if !is_double_eq && !is_comparison {
                                        eq_pos = Some(j);
                                    }
                                    break;
                                }
                                _ => {
                                    j += 1;
                                }
                            }
                        }

                        if let Some(eq_idx) = eq_pos {
                            // Determine the full assignment operator
                            let prev_char = if eq_idx > member_start {
                                Some(chars[eq_idx - 1])
                            } else {
                                None
                            };
                            let (assign_op, op_start) = match prev_char {
                                Some('+') => ("+=", eq_idx - 1),
                                Some('-') => ("-=", eq_idx - 1),
                                Some('*') => {
                                    if eq_idx >= member_start + 2 && chars[eq_idx - 2] == '*' {
                                        ("**=", eq_idx - 2)
                                    } else {
                                        ("*=", eq_idx - 1)
                                    }
                                }
                                Some('/') => ("/=", eq_idx - 1),
                                Some('%') => ("%=", eq_idx - 1),
                                Some('&') => {
                                    if eq_idx >= member_start + 2 && chars[eq_idx - 2] == '&' {
                                        ("&&=", eq_idx - 2)
                                    } else {
                                        ("&=", eq_idx - 1)
                                    }
                                }
                                Some('|') => {
                                    if eq_idx >= member_start + 2 && chars[eq_idx - 2] == '|' {
                                        ("||=", eq_idx - 2)
                                    } else {
                                        ("|=", eq_idx - 1)
                                    }
                                }
                                Some('^') => ("^=", eq_idx - 1),
                                Some('?') => {
                                    if eq_idx >= member_start + 2 && chars[eq_idx - 2] == '?' {
                                        ("??=", eq_idx - 2)
                                    } else {
                                        ("=", eq_idx)
                                    }
                                }
                                _ => ("=", eq_idx),
                            };

                            let member_part: String =
                                chars[member_start..op_start].iter().collect();
                            let member_part = member_part.trim_end();

                            // Find end of RHS
                            let rhs_start = eq_idx + 1;
                            let mut rhs_end = chars.len();
                            let mut rhs_j = rhs_start;
                            let mut rhs_depth = 0i32;
                            let mut rhs_in_string: Option<char> = None;
                            while rhs_j < chars.len() {
                                let rc = chars[rhs_j];
                                if let Some(s) = rhs_in_string {
                                    if rc == s {
                                        rhs_in_string = None;
                                    }
                                    rhs_j += 1;
                                    continue;
                                }
                                match rc {
                                    '\'' | '"' | '`' => {
                                        rhs_in_string = Some(rc);
                                        rhs_j += 1;
                                    }
                                    '(' | '[' | '{' => {
                                        rhs_depth += 1;
                                        rhs_j += 1;
                                    }
                                    ')' | ']' | '}' => {
                                        if rhs_depth == 0 {
                                            rhs_end = rhs_j;
                                            break;
                                        }
                                        rhs_depth -= 1;
                                        rhs_j += 1;
                                    }
                                    ';' if rhs_depth == 0 => {
                                        rhs_end = rhs_j;
                                        break;
                                    }
                                    _ => {
                                        rhs_j += 1;
                                    }
                                }
                            }

                            let rhs: String = chars[rhs_start..rhs_end].iter().collect();
                            let rhs = rhs.trim();

                            if !rhs.is_empty() {
                                let mutate_expr = format!(
                                    "$.mutate({}, {}{} {} {})",
                                    var, var, member_part, assign_op, rhs
                                );
                                new_result.push_str(&mutate_expr);
                                i = rhs_end;
                                continue;
                            }
                        }
                    }
                }
            }

            new_result.push(c);
            i += 1;
        }

        result = new_result;
    }

    result
}

/// Replace state variable patterns with reactive import patterns in a transformed script.
///
/// After the text-based transform produces `$.get(name)`, `$.set(name, ...)`, `$.mutate(name, ...)`,
/// this function replaces those patterns with the reactive import equivalents:
/// - `$.get(name)` -> `import_id()`
/// - `$.mutate(name, EXPR)` -> `import_id(EXPR)`
/// - `$.set(name, EXPR)` -> `import_id(EXPR)`
/// - bare `name` (as identifier) -> `import_id()`
///
/// This is used for legacy mode where mutated imports are wrapped with `$.reactive_import()`.
fn replace_state_with_reactive_import(script: &str, name: &str, import_id: &str) -> String {
    let mut result = script.to_string();

    // 1. Replace $.get(name) -> import_id()
    let get_pattern = format!("$.get({})", name);
    let get_replacement = format!("{}()", import_id);
    result = result.replace(&get_pattern, &get_replacement);

    // 2. Replace $.mutate(name, EXPR) -> import_id(EXPR)
    // We need to find the matching closing paren for $.mutate(name, ...)
    let mutate_prefix = format!("$.mutate({}, ", name);
    while let Some(start) = result.find(&mutate_prefix) {
        let after_prefix = start + mutate_prefix.len();
        // Find the matching closing paren
        if let Some(end) = find_matching_close_paren(&result[after_prefix..]) {
            let inner = &result[after_prefix..after_prefix + end];
            let replacement = format!("{}({})", import_id, inner);
            result = format!(
                "{}{}{}",
                &result[..start],
                replacement,
                &result[after_prefix + end + 1..] // +1 to skip the closing ')'
            );
        } else {
            break;
        }
    }

    // 3. Replace $.set(name, EXPR) -> import_id(EXPR) (in case assignments are generated)
    let set_prefix = format!("$.set({}, ", name);
    while let Some(start) = result.find(&set_prefix) {
        let after_prefix = start + set_prefix.len();
        if let Some(end) = find_matching_close_paren(&result[after_prefix..]) {
            let inner = &result[after_prefix..after_prefix + end];
            let replacement = format!("{}({})", import_id, inner);
            result = format!(
                "{}{}{}",
                &result[..start],
                replacement,
                &result[after_prefix + end + 1..]
            );
        } else {
            break;
        }
    }

    // 4. Replace remaining bare identifier references.
    // After steps 1-3, any remaining bare `name` identifiers should become `import_id()`.
    // We need to be careful to only replace whole-word occurrences that aren't:
    // - Part of the import_id itself ($$_import_name)
    // - Part of another identifier
    // - On the LHS of a declaration
    let chars: Vec<char> = result.chars().collect();
    let name_chars: Vec<char> = name.chars().collect();
    let name_len = name_chars.len();
    let import_id_len = import_id.len();
    let mut new_result = String::with_capacity(result.len());
    let mut i = 0;

    while i < chars.len() {
        // Check if the next chars match the import_id (skip it to avoid infinite recursion)
        if i + import_id_len <= chars.len() {
            let candidate: String = chars[i..i + import_id_len].iter().collect();
            if candidate == import_id {
                new_result.push_str(import_id);
                i += import_id_len;
                continue;
            }
        }

        // Check if current position matches the bare name
        if i + name_len <= chars.len() {
            let candidate: String = chars[i..i + name_len].iter().collect();
            if candidate == name {
                // Check word boundary before
                let before_ok = if i == 0 {
                    true
                } else {
                    let prev = chars[i - 1];
                    !prev.is_alphanumeric() && prev != '_' && prev != '$'
                };
                // Check word boundary after
                let after_ok = if i + name_len >= chars.len() {
                    true
                } else {
                    let next = chars[i + name_len];
                    !next.is_alphanumeric() && next != '_' && next != '$'
                };

                if before_ok && after_ok {
                    // Replace with import_id()
                    new_result.push_str(&format!("{}()", import_id));
                    i += name_len;
                    continue;
                }
            }
        }

        new_result.push(chars[i]);
        i += 1;
    }

    new_result
}

/// Find the position of the matching close parenthesis in a string.
/// The string starts AFTER the opening context (e.g., after "$.mutate(name, ").
/// Returns the index of the closing ')' relative to the start of the string,
/// or None if not found.
fn find_matching_close_paren(s: &str) -> Option<usize> {
    let mut depth = 1; // We're already inside one paren level
    let chars: Vec<char> = s.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = '"';

    while i < chars.len() {
        let c = chars[i];

        if in_string {
            if c == string_char && (i == 0 || chars[i - 1] != '\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }

        match c {
            '"' | '\'' | '`' => {
                in_string = true;
                string_char = c;
            }
            '(' => depth += 1,
            ')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
        i += 1;
    }

    None
}

/// Strip single-line `//` comments from JavaScript source code.
///
/// This is needed because our text-based transforms (e.g., wrapping store assignments
/// in `$.store_set(...)`) can create invalid JS when comments containing braces
/// appear mid-expression. The official Svelte compiler avoids this because it uses
/// an AST-based approach where comments are naturally excluded from the output.
///
/// The function preserves:
/// - `//` inside string literals (`'`, `"`, `` ` ``)
/// - The line structure (newlines are preserved)
///
/// It also handles `/* ... */` block comments.
fn strip_js_single_line_comments(source: &str) -> String {
    let mut result = String::with_capacity(source.len());
    let chars: Vec<char> = source.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = '"';

    while i < len {
        let c = chars[i];

        // Handle string literals
        if !in_string && (c == '\'' || c == '"' || c == '`') {
            in_string = true;
            string_char = c;
            result.push(c);
            i += 1;
            continue;
        }

        if in_string {
            result.push(c);
            if c == '\\' && i + 1 < len {
                // Push the escaped character too
                result.push(chars[i + 1]);
                i += 2;
                continue;
            }
            if c == string_char {
                in_string = false;
            }
            // Handle template literal expressions: `${...}`
            if string_char == '`' && c == '$' && i + 1 < len && chars[i + 1] == '{' {
                // Don't exit string mode for template expression - the backtick
                // string continues after the closing }
            }
            i += 1;
            continue;
        }

        // Detect // single-line comments
        if c == '/' && i + 1 < len && chars[i + 1] == '/' {
            // Collect the comment text to check if it's a svelte-ignore comment
            let comment_start = i;
            i += 2;
            while i < len && chars[i] != '\n' {
                i += 1;
            }
            // Preserve svelte-ignore comments as they affect subsequent code generation
            let comment_text: String = chars[comment_start..i].iter().collect();
            if comment_text.contains("svelte-ignore") {
                result.push_str(&comment_text);
            }
            // The newline will be pushed in the next iteration
            continue;
        }

        // Detect /* block comments */
        if c == '/' && i + 1 < len && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < len && !(chars[i] == '*' && chars[i + 1] == '/') {
                // Preserve newlines inside block comments to maintain line structure
                if chars[i] == '\n' {
                    result.push('\n');
                }
                i += 1;
            }
            if i + 1 < len {
                i += 2; // Skip */
            }
            continue;
        }

        result.push(c);
        i += 1;
    }

    result
}

/// Strip `/* $$async_noop... */;` placeholders from script output.
/// Used when async body transform returns None (no top-level await).
fn strip_async_noop_placeholders(s: &str) -> String {
    s.lines()
        .filter(|line| !line.trim().contains("$$async_noop"))
        .collect::<Vec<_>>()
        .join("\n")
}

/// Extract variable names from a $props() destructuring pattern.
/// e.g., "const { name, age } = $props()" -> ["name", "age"]
/// e.g., "let { a: b, c = 1 } = $props()" -> ["b", "c"]
fn extract_destructured_prop_names(statement: &str) -> Vec<String> {
    let trimmed = statement.trim();

    // Look for pattern: (const|let|var) { ... } = $props(...)
    let brace_start = match trimmed.find('{') {
        Some(pos) => pos,
        None => return vec![],
    };

    let brace_end = match trimmed.find('}') {
        Some(pos) => pos,
        None => return vec![],
    };

    if brace_start >= brace_end {
        return vec![];
    }

    let inner = &trimmed[brace_start + 1..brace_end];
    let mut names = Vec::new();

    for part in inner.split(',') {
        let part = part.trim();
        if part.is_empty() {
            continue;
        }

        // Handle "...rest" pattern
        if let Some(rest) = part.strip_prefix("...") {
            names.push(rest.trim().to_string());
            continue;
        }

        // Handle "key: alias" or "key: alias = default" pattern
        if let Some(colon_pos) = part.find(':') {
            let after_colon = part[colon_pos + 1..].trim();
            // May have default: "alias = default"
            let alias = if let Some(eq_pos) = after_colon.find('=') {
                after_colon[..eq_pos].trim()
            } else {
                after_colon
            };
            names.push(alias.to_string());
            continue;
        }

        // Handle "name = default" pattern
        if let Some(eq_pos) = part.find('=') {
            names.push(part[..eq_pos].trim().to_string());
            continue;
        }

        // Simple name
        names.push(part.to_string());
    }

    names
}

/// Normalize raw JavaScript formatting using OXC parser and codegen.
///
/// Parses the input as JavaScript, then reprints it with OXC's codegen to normalize:
/// - Spacing around operators (e.g., `let x=0` → `let x = 0`)
/// - Spacing before braces (e.g., `function f(){` → `function f() {`)
/// - Consistent semicolons and whitespace
///
/// If parsing fails, returns the original input unchanged.
/// The output uses single quotes, tab indentation, and strips comments
/// (matching esrap/Svelte compiler behavior).
fn normalize_js_with_oxc(js: &str, indent_level: usize) -> String {
    use oxc_allocator::Allocator;
    use oxc_codegen::{Codegen, CodegenOptions, CommentOptions, LegalComment};
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    let allocator = Allocator::default();
    let source_type = SourceType::mjs();
    let parsed = Parser::new(&allocator, js, source_type).parse();

    if !parsed.errors.is_empty() {
        return js.to_string();
    }

    let options = CodegenOptions {
        single_quote: true,
        // Preserve comments - esrap/Svelte keeps them in the output
        comments: CommentOptions {
            normal: true,
            jsdoc: true,
            annotation: true,
            legal: LegalComment::Inline,
        },
        ..CodegenOptions::default()
    };

    let result = Codegen::new().with_options(options).build(&parsed.program);

    // OXC adds a trailing newline; trim to match esrap behavior.
    let code = result.code.trim_end();

    // OXC breaks arrays with >2 elements into multiple lines. Join them back to
    // single lines to match esrap behavior (esrap keeps short arrays inline).
    let code_joined = join_oxc_multiline_arrays(code);

    // Add blank lines between different statement types to match esrap behavior.
    let code = add_esrap_blank_lines(&code_joined);

    // Remove blank lines before closing braces that OXC adds (e.g., after return statements).
    // Esrap doesn't add these extra blank lines inside function bodies.
    let code = remove_blank_lines_before_closing_braces(&code);

    if indent_level == 0 {
        return code;
    }

    // The raw statement goes inside a function body. The codegen's emit_statement
    // adds self.indent() before the FIRST line only. Subsequent lines in the Raw block
    // don't get automatic indentation. We need to re-add the original source-level
    // indentation to non-first lines so the output matches the expected format.
    let mut result_lines = Vec::new();
    let indent_str: String = "\t".repeat(indent_level);
    for (i, line) in code.lines().enumerate() {
        if i == 0 {
            // First line gets indent from emit_statement's self.indent()
            result_lines.push(line.to_string());
        } else if line.is_empty() {
            result_lines.push(String::new());
        } else {
            // Subsequent lines need the source-level indentation prefix
            result_lines.push(format!("{}{}", indent_str, line));
        }
    }
    result_lines.join("\n")
}

/// Join multi-line arrays that OXC broke into multiple lines back to single lines.
///
/// OXC's codegen breaks arrays with more than 2 elements into multiple lines,
/// but esrap keeps short arrays (like `['a', 'b', 'c']`) on a single line.
/// This function only joins arrays whose elements are simple (no nested brackets/braces).
fn join_oxc_multiline_arrays(code: &str) -> String {
    let lines: Vec<&str> = code.lines().collect();
    let mut result: Vec<String> = Vec::with_capacity(lines.len());
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i];

        // Check if a line ends with `[` (start of multi-line array)
        // but NOT lines that are just `[` (those are intentional block arrays)
        if line.trim_end().ends_with('[') && line.trim() != "[" {
            // Collect all lines until we find the closing `]`
            let mut array_lines: Vec<&str> = vec![line];
            let mut j = i + 1;
            let mut found_close = false;
            let mut has_nested = false;

            while j < lines.len() {
                let next = lines[j];
                let trimmed = next.trim();
                array_lines.push(next);

                // Check if this line starts with `]` (closing the array)
                if trimmed.starts_with(']') {
                    found_close = true;
                    j += 1;
                    break;
                }

                // Check for nested brackets/braces/parens that make joining unsafe
                if trimmed.contains('{')
                    || trimmed.contains('}')
                    || trimmed.contains('[')
                    || trimmed.contains(']')
                    || trimmed.contains('(')
                    || trimmed.contains(')')
                {
                    has_nested = true;
                    break;
                }

                j += 1;
            }

            if found_close && !has_nested && array_lines.len() <= 10 {
                // All elements are simple (no nested brackets/braces)
                let prefix_end = line.rfind('[').unwrap();
                let prefix = &line[..=prefix_end];

                // Collect simple element values from intermediate lines
                let mut elements: Vec<String> = Vec::new();
                let last_idx = array_lines.len() - 1;
                for array_line in &array_lines[1..last_idx] {
                    let elem = array_line.trim();
                    let elem = elem.strip_suffix(',').unwrap_or(elem).trim();
                    if !elem.is_empty() {
                        elements.push(elem.to_string());
                    }
                }

                // Get the suffix after `]` from the last array line
                let last_line = array_lines[last_idx].trim();
                let suffix = last_line.strip_prefix(']').unwrap_or("");

                let joined = format!("{}{}]{}", prefix, elements.join(", "), suffix);

                // Only join if the result is reasonably short
                if joined.len() <= 120 {
                    result.push(joined);
                    i = j;
                    continue;
                }
            }
        }

        result.push(line.to_string());
        i += 1;
    }

    result.join("\n")
}

/// Add blank lines between different statement types in OXC output to match esrap behavior.
///
/// Esrap inserts a blank line between consecutive statements/members when:
/// - The statement types differ (e.g., VariableDeclaration followed by FunctionDeclaration)
/// - Either statement is multiline
///
/// This applies at every nesting level (top-level, inside functions, inside classes).
fn add_esrap_blank_lines(code: &str) -> String {
    let lines: Vec<&str> = code.lines().collect();
    if lines.is_empty() {
        return code.to_string();
    }

    // Track the previous statement type and multiline status at each indent level.
    let mut prev_type_at_indent: std::collections::HashMap<usize, &str> =
        std::collections::HashMap::new();
    let mut prev_multiline_at_indent: std::collections::HashMap<usize, bool> =
        std::collections::HashMap::new();
    // Track indent levels that have a pending leading comment for the next statement
    let mut comment_at_indent: std::collections::HashSet<usize> = std::collections::HashSet::new();

    let mut result: Vec<&str> = Vec::with_capacity(lines.len() + 20);

    // Track template literal state
    let mut in_template_literal = false;
    // Track bracket depth to avoid inserting blank lines inside arrays
    let mut bracket_depth: i32 = 0;

    let mut i = 0;
    while i < lines.len() {
        let line = lines[i];

        // Track template literal state
        if in_template_literal {
            result.push(line);
            let backtick_count = line.chars().filter(|&c| c == '`').count();
            if backtick_count % 2 == 1 {
                in_template_literal = false;
            }
            i += 1;
            continue;
        }

        let backtick_count = line.chars().filter(|&c| c == '`').count();
        if backtick_count % 2 == 1 {
            in_template_literal = true;
        }

        // Skip ALL existing blank lines - we add them ourselves based on esrap rules.
        // The source may have blank lines that don't match esrap's behavior.
        if line.trim().is_empty() {
            i += 1;
            continue;
        }

        // Save bracket depth before processing this line for blank line decisions
        let bracket_depth_before = bracket_depth;

        let indent_level = line.bytes().take_while(|&b| b == b'\t').count();
        let trimmed = line.trim_start_matches('\t');

        // Lines that are just closing braces/brackets end a multiline statement
        if trimmed.starts_with('}') || trimmed.starts_with(']') || trimmed.starts_with(')') {
            prev_multiline_at_indent.insert(indent_level, true);
            // Reset inner indent state when entering a new block (e.g. `} else {`)
            if trimmed.ends_with('{') {
                prev_type_at_indent.remove(&(indent_level + 1));
                prev_multiline_at_indent.remove(&(indent_level + 1));
            }
            // Update bracket depth for closing brackets
            if !in_template_literal {
                for ch in trimmed.chars() {
                    match ch {
                        '[' => bracket_depth += 1,
                        ']' => bracket_depth -= 1,
                        _ => {}
                    }
                }
            }
            result.push(line);
            i += 1;
            continue;
        }

        // Reset inner indent state when opening a new block
        if trimmed.ends_with('{') {
            prev_type_at_indent.remove(&(indent_level + 1));
            prev_multiline_at_indent.remove(&(indent_level + 1));
        }

        let stmt_type = classify_js_statement(trimmed);

        // Comments are "transparent" - they attach to the following node (as leading
        // comments in esrap). They don't trigger blank lines or update type tracking.
        // However, they make the following statement multiline (since comment + statement
        // spans multiple lines).
        if stmt_type == "Comment" {
            // Mark that the next statement at this indent level has a leading comment
            comment_at_indent.insert(indent_level);
            result.push(line);
            i += 1;
            continue;
        }

        // Check if this statement is multiline
        // A leading comment makes the statement multiline
        let has_leading_comment = comment_at_indent.remove(&indent_level);
        let is_multiline =
            has_leading_comment || is_stmt_multiline_at_indent(&lines, i, indent_level);

        // Add blank line if needed (only for statement context, not inside arrays)
        // Inside arrays (bracket_depth > 0), blank line rules are different:
        // esrap only adds blank lines between two multiline items (both must be multiline).
        if bracket_depth_before > 0 {
            // Array context: only add blank line when both previous and current are multiline
            if prev_type_at_indent.contains_key(&indent_level) {
                let prev_ml = prev_multiline_at_indent
                    .get(&indent_level)
                    .copied()
                    .unwrap_or(false);
                if is_multiline
                    && prev_ml
                    && !result.is_empty()
                    && !result.last().is_some_and(|l| l.trim().is_empty())
                {
                    result.push("");
                }
            }
        } else if let Some(prev_type) = prev_type_at_indent.get(&indent_level) {
            let prev_ml = prev_multiline_at_indent
                .get(&indent_level)
                .copied()
                .unwrap_or(false);
            if (stmt_type != *prev_type || is_multiline || prev_ml)
                && !result.is_empty()
                && !result.last().is_some_and(|l| l.trim().is_empty())
            {
                result.push("");
            }
        }

        prev_type_at_indent.insert(indent_level, stmt_type);
        prev_multiline_at_indent.insert(indent_level, is_multiline);
        result.push(line);

        // Track bracket depth AFTER processing blank line logic.
        // This ensures the line that opens/closes a bracket is evaluated
        // in the correct context (before entering/leaving the array).
        if !in_template_literal {
            for ch in line.trim().chars() {
                match ch {
                    '[' => bracket_depth += 1,
                    ']' => bracket_depth -= 1,
                    _ => {}
                }
            }
        }

        i += 1;
    }

    // Remove trailing empty lines
    while result.last().is_some_and(|l| l.trim().is_empty()) {
        result.pop();
    }

    result.join("\n")
}

/// Check if a statement starting at `start` spans multiple lines at the given indent level.
fn is_stmt_multiline_at_indent(lines: &[&str], start: usize, indent_level: usize) -> bool {
    if start + 1 >= lines.len() {
        return false;
    }

    let trimmed = lines[start].trim_start_matches('\t');
    // Opening a block is always multiline
    if trimmed.ends_with('{') || trimmed.ends_with("=> {") {
        return true;
    }

    // Check if next non-empty line is at deeper indent (continuation)
    for next in &lines[(start + 1)..] {
        let next = *next;
        if next.trim().is_empty() {
            continue;
        }
        let next_indent = next.bytes().take_while(|&b| b == b'\t').count();
        if next_indent > indent_level {
            return true;
        }
        break;
    }

    false
}

/// Classify a JavaScript statement or class member for blank line logic (matching esrap's behavior).
fn classify_js_statement(line: &str) -> &'static str {
    if line.starts_with("var ") || line.starts_with("let ") || line.starts_with("const ") {
        "VariableDeclaration"
    } else if line.starts_with("function ") || line.starts_with("async function ") {
        "FunctionDeclaration"
    } else if line.starts_with("class ") {
        "ClassDeclaration"
    } else if line.starts_with("if ") || line.starts_with("if(") {
        "IfStatement"
    } else if line.starts_with("for ") || line.starts_with("for(") {
        "ForStatement"
    } else if line.starts_with("while ") || line.starts_with("while(") {
        "WhileStatement"
    } else if line.starts_with("return ") || line.starts_with("return;") || line == "return" {
        "ReturnStatement"
    } else if line.starts_with("export ") {
        "ExportDeclaration"
    } else if line.starts_with("import ") {
        "ImportDeclaration"
    } else if line.starts_with("get ") {
        "MethodDefinition_get"
    } else if line.starts_with("set ") {
        "MethodDefinition_set"
    } else if line.starts_with("constructor(") || line.starts_with("constructor (") {
        "MethodDefinition_constructor"
    } else if line.starts_with('#') {
        "PropertyDefinition"
    } else if line.starts_with("//") || line.starts_with("/*") {
        "Comment"
    } else {
        "ExpressionStatement"
    }
}

/// Detect the common indentation level (in tabs) of the first non-empty line
/// in the original script content.
#[allow(dead_code)]
fn detect_indent_level(js: &str) -> usize {
    for line in js.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        // Count leading tabs
        let tabs = line.chars().take_while(|c| *c == '\t').count();
        return tabs;
    }
    0
}

/// Remove blank lines that appear immediately before a closing brace `}`.
///
/// OXC sometimes inserts blank lines before `}` in function bodies
/// (e.g., after return statements), but esrap does not.
fn remove_blank_lines_before_closing_braces(code: &str) -> String {
    let lines: Vec<&str> = code.lines().collect();
    let mut result: Vec<&str> = Vec::with_capacity(lines.len());

    for (i, line) in lines.iter().enumerate() {
        // Skip blank lines that are immediately followed by a line containing only `}`
        if line.trim().is_empty() {
            // Look ahead to find next non-empty line
            let next_non_empty = lines[(i + 1)..].iter().find(|l| !l.trim().is_empty());
            if let Some(next) = next_non_empty
                && next.trim() == "}"
            {
                continue; // Skip this blank line
            }
        }
        result.push(line);
    }

    result.join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_js_with_oxc() {
        let input = "let count1=0;\nlet count2=0;\n\nfunction text1(){\n\treturn count1;\n}\n\nfunction text2(){\n\treturn count2;\n}";
        let result = normalize_js_with_oxc(input, 1);
        println!("OXC output:\n{}", result);
        // Check basic formatting
        assert!(
            result.contains("let count1 = 0;"),
            "Should have spaces around = : {}",
            result
        );
        assert!(
            result.contains("function text1() {"),
            "Should have space before brace: {}",
            result
        );
    }

    #[test]
    fn test_normalize_js_array_on_one_line() {
        let input = "let props = $.rest_props($$props, ['$$slots', '$$events', '$$legacy']);";
        let result = normalize_js_with_oxc(input, 1);
        println!("OXC array output:\n{}", result);
        assert!(
            result.contains("['$$slots', '$$events', '$$legacy']"),
            "Array should stay on one line: {}",
            result
        );
    }

    #[test]
    fn test_normalize_js_arrow_expression_body() {
        let input = "$.template_effect(() => $.set_text(text_3, $.get(item)));";
        let result = normalize_js_with_oxc(input, 1);
        println!("OXC arrow output:\n{}", result);
        assert!(
            result.contains("() => $.set_text(text_3, $.get(item))"),
            "Arrow expression body should be preserved: {}",
            result
        );
    }

    #[test]
    fn test_detect_indent_level() {
        assert_eq!(detect_indent_level("\n\tlet x = 1;"), 1);
        assert_eq!(detect_indent_level("\tlet x = 1;"), 1);
        assert_eq!(detect_indent_level("let x = 1;"), 0);
        assert_eq!(detect_indent_level("\n\n\t\tlet x = 1;"), 2);
    }

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
            &[], // store_sub_vars
            &[], // read_only_props
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

        // Function calls with prop names should still get the getter wrapper.
        // `a()` in source means "call the prop getter, then call the result".
        // So `a()` -> `a()()` is correct (getter + original call).
        let result2 = transform_prop_reads_in_expr("a() + b()", &prop_vars);
        println!("Input: 'a() + b()'");
        println!("Result: '{}'", result2);
        assert_eq!(
            result2, "a()() + b()()",
            "Should wrap prop name reads even when followed by ()"
        );

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
        &[], // store_sub_vars
        &[], // read_only_props
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
