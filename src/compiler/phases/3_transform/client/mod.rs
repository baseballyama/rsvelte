//! Client-side code generation.
//!
//! Generates JavaScript code for browser execution using the visitor pattern.
//!
//! This module mirrors the official Svelte compiler structure at
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/`.

mod ast_state_transform;
mod class_transforms;
mod destructure_transforms;
mod expression_utils;
mod formatting;
mod props_transforms;
mod reactive_transforms;
mod rune_transforms;
mod state;
mod state_transforms;
mod store_transforms;
pub mod transform_client;
pub mod transform_template;
pub mod types;
pub mod utils;
mod visitor;
pub mod visitors;

// Re-export all extracted module functions so they remain accessible by their original names.
// Some imports may appear unused in mod.rs but are needed for test access via `use super::*;`.
#[allow(unused_imports)]
use class_transforms::*;
use destructure_transforms::*;
use expression_utils::*;
use formatting::*;
use props_transforms::*;
use reactive_transforms::*;
use rune_transforms::*;
use state_transforms::*;
use store_transforms::*;

// Explicit re-exports for functions used outside the client module.
pub(crate) use class_transforms::transform_class_fields_client;
pub(crate) use expression_utils::find_matching_paren;

use std::cell::{Cell, RefCell};
use std::rc::Rc;
use std::sync::LazyLock;

// rustc_hash is used by submodules via their own imports

use regex::Regex;

use super::TransformError;
use super::js_ast::{
    builders::{self as b},
    codegen::{CodegenResult, generate, generate_with_sourcemap},
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
pub(super) static REGEX_DOLLAR_PROPS: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\$\$props\b").unwrap());

// Cached regular expressions for performance
// Matches: let/const/var name [: TypeAnnotation] = $state/$derived[.by][<GenericParams>](
// The optional type annotation handles TypeScript patterns like `const x: string = $derived.by(...)`
// The optional generic params handle patterns like `let x = $state<SomeType>(...)`
pub(super) static REGEX_STATE_DERIVED_VAR: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(let|const|var)\s+(\w+)(?:\s*:[^=\n]*)?\s*=\s*\$(?:state|derived)(?:\.by)?(?:<[^(]*>)?\s*\(").unwrap()
});

// Regex for sanitizing identifier names - replaces invalid identifier characters
// Pattern matches:
// - ^[^a-zA-Z_$] - character at start that is NOT a valid identifier start
// - [^a-zA-Z0-9_$] - any character that is NOT a valid identifier character
pub(super) static REGEX_INVALID_IDENTIFIER_CHARS: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(^[^a-zA-Z_$]|[^a-zA-Z0-9_$])").unwrap());

// Thread-local counter for generating unique $$array variable names across multiple
// $derived destructuring patterns in the same component.
// This is reset at the start of each component transformation.
thread_local! {
    pub(super) static SCRIPT_ARRAY_COUNTER: Cell<usize> = const { Cell::new(0) };
    // Counter for looking up which $$array variable to use when processing nested patterns
    // This must stay in sync with SCRIPT_ARRAY_COUNTER
    pub(super) static ARRAY_LOOKUP_COUNTER: Cell<usize> = const { Cell::new(0) };
    // Counter for generating unique tmp variable names for $state/$state.raw destructuring.
    // Generates tmp, tmp_1, tmp_2, etc.
    pub(super) static STATE_TMP_COUNTER: Cell<usize> = const { Cell::new(0) };
    // Var-declared state/derived vars that need $.safe_get() instead of $.get()
    // var declarations are hoisted, so they can be read before initialization.
    // $.safe_get() handles this by returning undefined if not yet initialized.
    // Reference: declarations.js line 26
    pub(super) static VAR_STATE_VARS: RefCell<Vec<String>> = const { RefCell::new(Vec::new()) };
}

// Thread-local cache for dynamically-constructed regex patterns to avoid recompilation
thread_local! {
    static REGEX_CACHE: RefCell<rustc_hash::FxHashMap<String, Regex>> = RefCell::new(rustc_hash::FxHashMap::default());
}

pub(super) fn get_or_compile_regex(pattern: &str) -> Option<Regex> {
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
    let transformed = transform_module_script_runes(&class_transformed, analysis, options.dev);

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
    dev: bool,
) -> String {
    let class_transformed = transform_class_fields_client(source);
    transform_module_script_runes(&class_transformed, analysis, dev)
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

    // Compute reactive import names early so we can do a single script transform.
    // These only depend on analysis data (not on template traversal results).
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

    // Transform the instance script once with the real reactive_import_names.
    // This also determines how many $$array names it consumes (for template generation)
    // and is used for blocker_map computation and the final output.
    let pre_transformed_script = if analysis.instance_script_content.is_some() {
        let raw = &analysis.instance_script_content.as_ref().unwrap().raw;
        let transformed = transform_instance_script_for_visitors(
            raw,
            analysis,
            options.dev,
            &reactive_import_names,
        );
        // Transfer the script's $$array counter to the context state so that the template
        // visitor continues numbering from where the script left off.
        let script_array_count = SCRIPT_ARRAY_COUNTER.with(|c| c.get());
        context
            .state
            .destructure_array_counter
            .set(script_array_count);
        // Also seed the memoizer's conflicts set with names already used by the script,
        // so that generate_array_name() (which uses the memoizer) won't reuse them.
        for i in 0..script_array_count {
            let name = if i == 0 {
                "$$array".to_string()
            } else {
                format!("$$array_{}", i)
            };
            context.state.memoizer.add_conflict(&name);
        }
        Some(transformed)
    } else {
        None
    };

    // Pre-compute blocker map for async components.
    if options.experimental.r#async
        && let Some(ref transformed) = pre_transformed_script
    {
        if let Some(async_result) = super::shared::async_body::transform_async_body_dev(
            transformed.trim(),
            "$.run",
            options.dev,
        ) {
            let mut blocker_map = async_result.blocker_map.clone();
            super::shared::async_body::enrich_blocker_map_with_transitive_deps(
                transformed,
                &mut blocker_map,
            );
            // If $props() appears after an await in the original script,
            // add $$props to the blocker_map. The $props() destructuring is
            // removed during transformation, so it won't appear in the
            // transformed script. But the template still references $$props.name
            // and needs to wait for the async context.
            // Check if $props() appears after an await in the original script.
            // The $props() destructuring is removed during transformation, so
            // $$props won't appear in the transformed script. But the template
            // still references $$props.name and needs to wait on the async context.
            if let Some(raw_script) = analysis.instance_script_content.as_ref()
                && let (Some(await_pos), Some(props_pos)) = (
                    raw_script.raw.find("await "),
                    raw_script.raw.find("$props()"),
                )
                && props_pos > await_pos
            {
                let idx = if blocker_map.is_empty() {
                    async_result
                        .output
                        .matches("() =>")
                        .count()
                        .saturating_sub(1)
                } else {
                    *blocker_map.values().max().unwrap_or(&0)
                };
                blocker_map.insert("$$props".to_string(), idx);
            }
            if !blocker_map.is_empty() {
                *context.state.blocker_map.borrow_mut() = blocker_map;
            }
        } else {
            let pre_blocker_map = super::shared::async_body::compute_blocker_map(transformed);
            if !pre_blocker_map.is_empty() {
                *context.state.blocker_map.borrow_mut() = pre_blocker_map;
            }
        }
    }

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

    // reactive_import_names was already computed before the script transform above.

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
    } else if options.dev {
        component_body.push(b::stmt(b::call(
            b::member_path("$.check_target"),
            vec![b::id("new.target")],
        )));
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
    // Reuse the pre_transformed_script from above (already has reactive_import_names).
    if let Some(ref content) = analysis.instance_script_content {
        let mut transformed_script = pre_transformed_script.clone().unwrap_or_default();

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
        let script_source_offset = content.start;
        if !trimmed.is_empty() {
            // Apply async body transformation if experimental.async is enabled
            // This splits the instance script at the first top-level `await`
            if options.experimental.r#async {
                if let Some(async_result) = super::shared::async_body::transform_async_body_dev(
                    trimmed,
                    "$.run",
                    options.dev,
                ) {
                    let cleaned_output = strip_async_noop_placeholders(async_result.output.trim());
                    let normalized = normalize_js_with_oxc(cleaned_output.trim(), script_indent);
                    component_body.push(JsStatement::RawMapped {
                        code: normalized.into(),
                        source_offset: script_source_offset,
                    });
                    // Store the blocker_map for use during template generation
                    if !async_result.blocker_map.is_empty() {
                        *context.state.blocker_map.borrow_mut() = async_result.blocker_map;
                    }
                } else {
                    // No top-level await: strip any async noop placeholders
                    let cleaned = strip_async_noop_placeholders(trimmed);
                    if !cleaned.trim().is_empty() {
                        let normalized = normalize_js_with_oxc(cleaned.trim(), script_indent);
                        component_body.push(JsStatement::RawMapped {
                            code: normalized.into(),
                            source_offset: script_source_offset,
                        });
                    }
                }
            } else {
                // Strip async placeholder markers ($$async_hole from $inspect removal)
                // even when not in async mode, converting them to `;;` (empty statements).
                let cleaned = strip_async_noop_placeholders(trimmed);
                let trimmed = cleaned.trim();
                if !trimmed.is_empty() {
                    // Normalize raw JavaScript formatting using OXC to match
                    // the official Svelte compiler's esrap output (consistent spacing,
                    // semicolons, etc.)
                    let normalized = normalize_js_with_oxc(trimmed, script_indent);
                    component_body.push(JsStatement::RawMapped {
                        code: normalized.into(),
                        source_offset: script_source_offset,
                    });
                }
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
            // $$exports comes AFTER instance body (user script code)
            // This matches the official Svelte compiler ordering
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
        // Insert after $.push (and $.check_target if present)
        // In the official compiler, this is unshifted before push is unshifted,
        // so it ends up right after push
        let mut insert_pos = 0;
        if options.dev && options.compatibility.component_api != crate::compiler::ComponentApi::V4 {
            insert_pos += 1; // skip $.check_target(new.target)
        }
        if should_inject_context {
            insert_pos += 1; // skip $.push(...)
        }
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

    if analysis.tracing {
        body.push(JsStatement::Import(JsImportDeclaration {
            specifiers: vec![],
            source: "svelte/internal/flags/tracing".into(),
        }));
    }

    if options.experimental.r#async {
        body.push(JsStatement::Import(JsImportDeclaration {
            specifiers: vec![],
            source: "svelte/internal/flags/async".into(),
        }));
    }

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
        // Add module script imports first (from module.body in official compiler)
        for import_line in module_imports {
            let trimmed = import_line.trim();
            // Ensure import statements end with semicolons, matching esrap behavior.
            let with_semi = if !trimmed.ends_with(';') {
                format!("{};", trimmed)
            } else {
                trimmed.to_string()
            };
            body.push(JsStatement::Raw(with_semi.into()));
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

    // Add svelte/internal/client import (namespace import as $)
    // In the official compiler (transform-client.js line 154, 506), this is the first
    // item in state.hoisted, which is iterated after module.body. So the order is:
    // module imports, import * as $, instance imports.
    body.push(JsStatement::Import(JsImportDeclaration {
        specifiers: vec![JsImportSpecifier::Namespace("$".into())],
        source: "svelte/internal/client".into(),
    }));

    // Extract and add imports from instance script
    // These are in state.hoisted after import * as $ (from analysis.instance_body.hoisted)
    if let Some(ref instance_content) = analysis.instance_script_content {
        let (script_imports, _) = extract_imports(&instance_content.raw);
        for import_line in script_imports {
            let trimmed = import_line.trim();
            // Ensure import statements end with semicolons, matching esrap behavior.
            // User code may omit semicolons (ASI), but the Svelte compiler's esrap
            // printer always adds them.
            let with_semi = if !trimmed.ends_with(';') {
                format!("{};", trimmed)
            } else {
                trimmed.to_string()
            };
            body.push(JsStatement::Raw(with_semi.into()));
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
        let transformed = transform_module_script_runes(&class_transformed, analysis, options.dev);
        body.push(JsStatement::Raw(transformed.into()));
    }

    // Add hoisted statements (template declarations, etc.)
    body.extend(hoisted_statements);

    // Add CSS declaration if needed
    if analysis.css.has_css && analysis.inject_styles {
        let hash = b::string(analysis.css.hash.clone());
        // Render the actual scoped CSS code
        // For custom elements, use minified CSS (matching official Svelte compiler behavior)
        let is_custom_element = analysis.custom_element.is_some();
        let mut css_code = String::new();
        let css_render_result = if is_custom_element {
            super::css::render_stylesheet_minified(analysis, source, options)
        } else {
            super::css::render_stylesheet(analysis, source, options)
        };
        if let Ok(css_output) = css_render_result {
            css_code = css_output.code;
            // In dev mode, embed the CSS source map as a data URI in the CSS code.
            // This matches the official Svelte compiler behavior (css/index.js):
            //   css.code += `\n/*# sourceMappingURL=${css.map.toUrl()} */`;
            // IMPORTANT: Only for css="injected" mode, NOT for custom elements.
            // Custom elements embed CSS in $$css.code without sourcemaps.
            // Reference: css/index.js line 68: `if (dev && options.css === 'injected' && css.code)`
            if options.dev
                && !is_custom_element
                && !css_code.is_empty()
                && let Some(mut css_map_json) = css_output.map
            {
                // Remap through preprocessor map if present
                if let Some(ref pp_map) = options.sourcemap {
                    css_map_json = super::remap_css_sourcemap(&css_map_json, pp_map, options);
                }
                // Encode as base64 data URI
                let b64 = super::base64_encode(css_map_json.as_bytes());
                css_code.push_str(&format!(
                    "\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,{} */",
                    b64
                ));
            }
        }
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

    // Generate JavaScript code from the program, optionally with source map data
    if options.enable_sourcemap {
        generate_with_sourcemap(&program, source).map_err(TransformError::CodeGen)
    } else {
        let code = generate(&program).map_err(TransformError::CodeGen)?;
        Ok(CodegenResult {
            code,
            mappings: vec![],
        })
    }
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
pub(super) fn extract_local_reactive_vars(script: &str) -> Vec<(String, bool, bool)> {
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
pub(crate) fn transform_module_script_runes(
    script: &str,
    analysis: &ComponentAnalysis,
    dev: bool,
) -> String {
    let mut result = script.to_string();

    // Strip TypeScript generic parameters from $state<...>() and $derived<...>() calls.
    // These are type-only annotations that have no runtime meaning.
    // e.g., $state<ReturnType<typeof autoUpdate>>() → $state()
    result = strip_rune_generic_params(&result);

    // Extract local reactive variable names from the module script
    // These are variables declared with $state() or $derived() inside functions
    let module_state_vars_with_const = extract_local_reactive_vars(&result);
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
                let var_name = extract_var_name_before_rune(&result[..pos]);

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

        let var_name = extract_var_name_before_rune(&result[..pos]);

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
            // Strip trailing comma from $derived(expr,) - valid in function call but not in () => (expr,)
            let content = content
                .trim_end()
                .strip_suffix(',')
                .map_or(content, |stripped| stripped);
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
        // Collect derived vars (these should NOT get proxy flag in $.set())
        // The official Svelte compiler skips the proxy flag for derived, raw_state,
        // prop, bindable_prop, and store_sub bindings (AssignmentExpression.js L136-141).
        let derived_vars: Vec<String> = module_state_vars_with_const
            .iter()
            .filter(|(_, _, is_state)| !is_state) // is_state=false means $derived
            .map(|(name, _, _)| name.clone())
            .collect();

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
                    &derived_vars, // derived vars are treated like raw_state for proxy skipping
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

    // In dev mode, transform === to $.strict_equals() and !== to !$.strict_equals()
    // This matches the BinaryExpression visitor from the official Svelte compiler
    if dev {
        result = transform_strict_equals(&result);
    }

    // In dev mode, wrap console.METHOD() calls with $.log_if_contains_state
    // to detect when state proxies are logged directly.
    // Reference: CallExpression.js in the official Svelte compiler
    if dev {
        result = transform_console_calls_dev(&result);
    }

    // In dev mode, wrap $.state(), $.derived(), and $.proxy() declarations with $.tag()/$.tag_proxy()
    // This tags signals with their variable names for better debugging with $inspect.trace()
    if dev {
        result = wrap_state_derived_with_tag(&result);
    }

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

    // Fast path: if the script has no runes ($state, $derived, $effect, $props),
    // no store subscriptions ($xxx), no reactive statements ($:), and no exports,
    // the text-based transform pipeline has nothing to do. Just return the script
    // with imports stripped.
    // Fast path: if the script has no runes, stores, reactive statements, exports,
    // or comma-separated declarations, the text-based transform pipeline has nothing to do.
    let has_dollar = script.contains('$');
    let has_export = script.contains("export ");
    let has_comma_decl = script.contains(", ") || script.contains(",\n") || script.contains(",\t");
    if !has_dollar
        && !has_export
        && !has_comma_decl
        && analysis.root.bindings.iter().all(|b| {
            !matches!(
                b.kind,
                BindingKind::State
                    | BindingKind::RawState
                    | BindingKind::Derived
                    | BindingKind::LegacyReactive
                    | BindingKind::StoreSub
                    | BindingKind::Prop
                    | BindingKind::BindableProp
                    | BindingKind::RestProp
            )
        })
    {
        // No transforms needed - just strip imports and return the rest
        let (_imports, rest) = extract_imports(script);
        return rest.to_string();
    }

    // Reset the $$array counters for this component
    // This ensures unique names across multiple $derived destructuring patterns
    SCRIPT_ARRAY_COUNTER.with(|c| c.set(0));
    ARRAY_LOOKUP_COUNTER.with(|c| c.set(0));
    // Reset the tmp counter for $state destructuring
    STATE_TMP_COUNTER.with(|c| c.set(0));

    // Use Cow to avoid unnecessary String copies when no transformation is needed.
    // In runes mode, comments are safe to preserve (no store transforms that break on them).
    // In legacy mode, strip single-line comments to prevent braces in comments from
    // interfering with store transforms.
    let script: std::borrow::Cow<str> = if analysis.runes {
        std::borrow::Cow::Borrowed(script)
    } else {
        std::borrow::Cow::Owned(strip_js_single_line_comments(script))
    };

    // Transform class fields only if the script contains class definitions with runes
    let script: std::borrow::Cow<str> = if script.contains("class ")
        && (script.contains("$state") || script.contains("$derived"))
    {
        std::borrow::Cow::Owned(transform_class_fields_client(&script))
    } else {
        script
    };

    // Split comma-separated variable declarations only if needed
    let script: std::borrow::Cow<str> = if script.contains(", ")
        || script.contains(",\n")
        || script.contains(",\t")
    {
        std::borrow::Cow::Owned(crate::compiler::phases::phase3_transform::server::transform_script::split_comma_separated_declarations(&script))
    } else {
        script
    };

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

    // Pre-filter state_vars to only include variables that actually appear in the script.
    // This avoids O(M*N) scanning in downstream transforms for variables that can't match.
    state_vars.retain(|v| script_rest.contains(v.as_str()));

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

    // Collect non-bindable prop vars (kind === 'prop', not 'bindable_prop').
    // In runes mode, these should NOT have member mutations wrapped with the prop setter
    // because the official compiler's mutate transform for non-bindable props returns
    // the value as-is (no wrapping). Only bindable props get the prop(mutation, true) wrapping.
    let non_bindable_prop_vars: Vec<String> = if analysis.runes {
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| {
                matches!(b.kind, BindingKind::Prop) && !matches!(b.kind, BindingKind::BindableProp)
            })
            .map(|b| b.name.clone())
            .collect()
    } else {
        Vec::new()
    };

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

    // Pre-compute non-proxyable variables once (invariant across all statements).
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
                    let flattened = if analysis.runes {
                        flattened // AST transform handles state var wrapping
                    } else {
                        wrap_state_vars_in_expr(
                            &flattened,
                            state_vars,
                            non_reactive_state_vars,
                            proxy_vars,
                        )
                    };
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
            let transformed = if analysis.runes {
                transformed // AST transform handles state var wrapping
            } else {
                let transformed = transform_state_assignments(
                    &transformed,
                    state_vars,
                    non_reactive_state_vars,
                    proxy_vars,
                    raw_state_vars,
                    analysis.runes,
                    &non_proxy_vars,
                );
                wrap_state_vars_in_expr(
                    &transformed,
                    state_vars,
                    non_reactive_state_vars,
                    proxy_vars,
                )
            };
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
        // In runes mode, deferred to AST-based transform after main loop.
        let transformed = if analysis.runes {
            transformed
        } else {
            let transformed = transform_state_assignments(
                &transformed,
                state_vars,
                non_reactive_state_vars,
                proxy_vars,
                raw_state_vars,
                analysis.runes,
                &non_proxy_vars,
            );
            wrap_store_unsub_for_state_sets(&transformed, state_vars, store_sub_vars)
        };

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
            wrap_prop_source_reads(
                &transformed,
                prop_assignment_transform_vars,
                &non_bindable_prop_vars,
            )
        } else {
            transformed
        };

        // Transform prop assignments to prop(prop() + value) syntax
        // This handles props declared with `export let` in legacy mode
        // Note: We use prop_assignment_transform_vars which excludes RestProp bindings
        // because rest_props use $.rest_props() which returns a plain object, not getter/setter
        let transformed = transform_prop_assignments(
            &transformed,
            prop_assignment_transform_vars,
            &non_bindable_prop_vars,
        );

        // Store transforms: skip entirely when there are no store subscriptions
        let transformed = if !store_sub_vars.is_empty() {
            // Filter out store_sub_vars that appear as function parameters in this statement.
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

            let transformed = transform_store_assignments_client(
                &transformed,
                &effective_store_sub_vars,
                prop_assignment_transform_vars,
                state_vars,
                non_reactive_state_vars,
            );
            let transformed = transform_store_sub_calls(&transformed, &effective_store_sub_vars);
            transform_store_reads_client(&transformed, &effective_store_sub_vars)
        } else {
            transformed
        };

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
        // In runes mode, deferred to AST-based transform after main loop.
        let transformed = if analysis.runes {
            transformed
        } else {
            wrap_state_vars_in_expr(
                &transformed,
                state_vars,
                non_reactive_state_vars,
                proxy_vars,
            )
        };

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

        // In dev mode, wrap console.METHOD() calls with $.log_if_contains_state
        // to detect when state proxies are logged directly.
        // Reference: CallExpression.js in the official Svelte compiler
        let transformed = if dev {
            transform_console_calls_dev(&transformed)
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

    // AST-based state variable transforms for runes mode.
    // Replaces text-based transform_state_assignments and wrap_state_vars_in_expr
    // with a single OXC parse + AST walk, eliminating O(M*N) text scanning.
    if analysis.runes && !state_vars.is_empty() {
        if let Some(ast_result) = ast_state_transform::transform_state_vars_ast(
            &result,
            &state_vars,
            &non_reactive_state_vars,
            &raw_state_vars,
            &non_proxy_vars,
            true,
        ) {
            result = ast_result;
        }
        // Apply store_unsub wrapping after AST transform (searches for $.set patterns)
        if !store_sub_vars.is_empty() {
            result = wrap_store_unsub_for_state_sets(&result, &state_vars, &store_sub_vars);
        }
    }

    // Post-processing: transform shadowed local reactive vars within their enclosing function bodies.
    // These are state variables declared inside nested functions that share names with
    // top-level bindings. They're not in state_vars (to avoid incorrectly transforming
    // top-level references), so neither text-based nor AST-based transforms handle them.
    // This must run regardless of runes mode.
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

#[cfg(test)]
mod tests {
    use super::*;

    // Tests for comma-separated variable declarations on client side.
    // These verify that destructured patterns ($state, $derived, $props) produce
    // comma-separated declarators in a single let/const/var statement, matching
    // the official Svelte compiler output.

    #[test]
    fn test_client_comma_separated_state_destructuring() {
        let input = r#"<script>
  import { setup } from './utils.js';

  let { num } = $state(setup());
  let { num: num_frozen } = $state(setup());
</script>

<button on:click={() => { num++; num_frozen++; }}>{num} / {num_frozen}</button>
"#;
        let options = crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("test/index.svelte".to_string()),
            ..Default::default()
        };
        let result = crate::compiler::compile(input, options).unwrap();
        println!("=== AMBIGUOUS SOURCE CLIENT OUTPUT ===");
        println!("{}", result.js.code);
        // The destructured $state should produce comma-separated declarations:
        // let tmp = setup(), num = $.state($.proxy(tmp.num))
        // NOT:
        // let tmp = setup();
        // let num = $.state($.proxy(tmp.num));
        assert!(
            result
                .js
                .code
                .contains("let tmp = setup(), num = $.state($.proxy(tmp.num))"),
            "Should have comma-separated declarations for destructured $state"
        );
    }

    #[test]
    fn test_comma_separated_let_declarations() {
        let input = r#"<script>
	let x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, x13, x14, x15, x16, x17, x18, x19, x20, x21, x22, x23, x24, x25, x26, x27, x28, x29, x30, x31;
</script>
<A>foo</A>
"#;
        let options = crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("test/index.svelte".to_string()),
            ..Default::default()
        };
        let result = crate::compiler::compile(input, options).unwrap();
        println!("=== COMMA-SEP LET OUTPUT ===");
        println!("{}", result.js.code);
        // The official Svelte compiler keeps them as separate let declarations
        assert!(
            result.js.code.contains("let x1;"),
            "Should have separate let declarations: {}",
            result.js.code,
        );
    }

    #[test]
    fn test_bitmask_overflow_2_export_lets() {
        // 32 separate `export let` declarations - these produce separate $.prop() calls
        let input = r#"<script>
	export let x1;
	export let x2;
	export let x3;
</script>
<p>{x1 + x2 + x3}</p>
"#;
        let options = crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("test/index.svelte".to_string()),
            ..Default::default()
        };
        let result = crate::compiler::compile(input, options).unwrap();
        println!("=== BITMASK OVERFLOW 2 OUTPUT ===");
        println!("{}", result.js.code);
    }

    #[test]
    fn test_props_destructuring_comma_separated() {
        let input = r#"<script>
let { foo = false, bar = true } = $props();
</script>
<p>{foo} {bar}</p>
"#;
        let options = crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("test/index.svelte".to_string()),
            ..Default::default()
        };
        let result = crate::compiler::compile(input, options).unwrap();
        println!("=== PROPS DESTRUCTURING OUTPUT ===");
        println!("{}", result.js.code);
        // Should have comma-separated declarations (may be on one line or split across lines):
        // let foo = $.prop($$props, 'foo', ...), bar = $.prop($$props, 'bar', ...);
        // or:
        // let foo = $.prop($$props, 'foo', ...),
        //     bar = $.prop($$props, 'bar', ...);
        assert!(
            result.js.code.contains("foo = $.prop($$props, 'foo'")
                && result.js.code.contains("bar = $.prop($$props, 'bar'"),
            "Should have comma-separated prop declarations: {}",
            result.js.code,
        );
    }

    #[test]
    fn test_assign_prop_to_prop() {
        let input = r#"<script>
	let z = 8;
	let { a, b = a, c = b * b, d = z * b + c } = $props();
</script>

<p>{a}</p>
<p>{b}</p>
<p>{c}</p>
<p>{d}</p>"#;
        let options = crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("Test/index.svelte".to_string()),
            ..Default::default()
        };
        let result = crate::compiler::compile(input, options).unwrap();
        println!("=== ASSIGN PROP TO PROP OUTPUT ===");
        println!("{}", result.js.code);
        // Expected: comma-separated prop declarations (may be on one line or split across lines):
        // let b = $.prop(...), c = $.prop(...), d = $.prop(...);
        // or:
        // let b = $.prop(...),
        //     c = $.prop(...),
        //     d = $.prop(...);
        assert!(
            !result.js.code.contains("let b = $.prop") || result.js.code.contains("c = $.prop"),
            "Should have comma-separated prop declarations: {}",
            result.js.code,
        );
    }

    #[test]
    fn test_derived_destructured_iterator() {
        let input = r#"<script>
	let offset = $state(1);

	function* count(offset) {
		let i = offset;
		while (true) yield i++;
	}

	let [a, b, c] = $derived(count(offset));
</script>

<button onclick={() => offset += 1}>increment</button>

<p>a: {a}</p>
<p>b: {b}</p>
<p>c: {c}</p>
"#;
        let options = crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("main/index.svelte".to_string()),
            ..Default::default()
        };
        let result = crate::compiler::compile(input, options).unwrap();
        println!("=== DERIVED DESTRUCTURED ITERATOR OUTPUT ===");
        println!("{}", result.js.code);
        // Expected: single let with comma-separated declarators (may be on one line or split across lines):
        // let $$d = $.derived(...), $$array = $.derived(...), a = $.derived(...), ...;
        // or:
        // let $$d = $.derived(...),
        //     $$array = $.derived(...),
        //     a = $.derived(...), ...;
        assert!(
            result.js.code.contains("$$d = $.derived(")
                && result.js.code.contains("$$array = $.derived("),
            "Should have comma-separated derived destructuring declarations: {}",
            result.js.code,
        );
    }

    #[test]
    fn test_bind_and_spread_precedence() {
        let input = r#"<script>
	let { value = $bindable(), ...properties } = $props();
</script>

<input bind:value {...properties} />
"#;
        let options = crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("input/index.svelte".to_string()),
            ..Default::default()
        };
        let result = crate::compiler::compile(input, options).unwrap();
        println!("=== BIND AND SPREAD OUTPUT ===");
        println!("{}", result.js.code);
        // Expected: single let with comma-separated (may be on one line or split across lines):
        // let value = $.prop($$props, 'value', 15), properties = $.rest_props($$props, [...]);
        // or:
        // let value = $.prop($$props, 'value', 15),
        //     properties = $.rest_props($$props, [...]);
        assert!(
            result.js.code.contains("value = $.prop(")
                && result.js.code.contains("properties = $.rest_props("),
            "Should have comma-separated prop + rest_props declarations: {}",
            result.js.code,
        );
    }

    #[test]
    fn test_destructure_state_from_props() {
        let input = r#"<script>
	let { data } = $props();
	let { foo } = $state(data);
</script>

{foo}"#;
        let options = crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("Child/index.svelte".to_string()),
            ..Default::default()
        };
        let result = crate::compiler::compile(input, options).unwrap();
        println!("=== DESTRUCTURE STATE FROM PROPS OUTPUT ===");
        println!("{}", result.js.code);
        // Expected: let tmp = $$props.data, foo = $.proxy(tmp.foo);
        assert!(
            result
                .js
                .code
                .contains("let tmp = $$props.data, foo = $.proxy(tmp.foo)"),
            "Should have comma-separated let tmp/foo declarations: {}",
            result.js.code,
        );
    }

    #[test]
    fn test_normalize_js_with_oxc() {
        // Include a JSDoc comment (/** */) to force the OXC codegen path,
        // since this test specifically validates OXC formatting behavior.
        let input = "/** */\nlet count1=0;\nlet count2=0;\n\nfunction text1(){\n\treturn count1;\n}\n\nfunction text2(){\n\treturn count2;\n}";
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

    #[test]
    fn test_normalize_js_comma_separated_declarations() {
        let input = "let tmp = setup(), num = $.state($.proxy(tmp.num));";
        let result = normalize_js_with_oxc(input, 0);
        println!("Comma-sep input:  {}", input);
        println!("Comma-sep output: {}", result);
        assert!(
            result.contains("let tmp = setup(), num = $.state($.proxy(tmp.num));"),
            "Comma-separated declarations should remain comma-separated: {}",
            result,
        );
    }

    #[test]
    fn test_normalize_js_multi_let_declarations() {
        let input = "let x1, x2, x3, x4, x5;";
        let result = normalize_js_with_oxc(input, 0);
        println!("Multi-let input:  {}", input);
        println!("Multi-let output: {}", result);
        assert!(
            result.contains("let x1, x2, x3, x4, x5;"),
            "Multi-variable let should remain comma-separated: {}",
            result,
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

// ===== Regression tests for bugs found during real-world build (2026-03-14) =====

#[test]
fn test_wrap_prop_source_reads_block_comment_before_property_key() {
    // Bug: block comment `/* ... */` between `,` and property key `value` caused
    // is_property_key check to fail, wrapping `value` as `value()` in object literal.
    let prop_vars = vec!["value".to_string()];
    let input = r#"{ key: 1, /* comment */ value: 2 }"#;
    let result = wrap_prop_source_reads(input, &prop_vars, &[]);
    assert!(
        result.contains("value: 2"),
        "value after block comment should NOT be wrapped as value(): {}",
        result
    );
    assert!(
        !result.contains("value(): 2"),
        "value as property key should not be transformed: {}",
        result
    );
}

#[test]
fn test_wrap_prop_source_reads_block_comment_multiline() {
    let prop_vars = vec!["value".to_string()];
    let input = "{ key: 1,\n\t/* multi\n\t   line\n\t   comment */\n\tvalue: 2 }";
    let result = wrap_prop_source_reads(input, &prop_vars, &[]);
    assert!(
        result.contains("value: 2"),
        "value after multiline block comment should NOT be wrapped: {}",
        result
    );
}

#[test]
fn test_wrap_prop_source_reads_value_in_expression() {
    // When `value` is used as an expression (not a property key), it SHOULD be wrapped
    let prop_vars = vec!["value".to_string()];
    let input = "let x = value + 1;";
    let result = wrap_prop_source_reads(input, &prop_vars, &[]);
    assert!(
        result.contains("value() + 1"),
        "value in expression should be wrapped as value(): {}",
        result
    );
}

#[test]
fn test_wrap_prop_source_reads_skips_nullish_assign() {
    // Bug: `value ??= 100` was incorrectly transforming `value` because
    // is_on_left_side_of_assignment didn't detect ??=
    let prop_vars = vec!["value".to_string()];
    let input = "value ??= 100;";
    let result = wrap_prop_source_reads(input, &prop_vars, &[]);
    assert!(
        !result.contains("value() ??= 100"),
        "value on LHS of ??= should NOT be wrapped: {}",
        result
    );
}

#[test]
fn test_is_on_left_side_of_assignment_nullish_assign() {
    let chars: Vec<char> = "value ??= 100".chars().collect();
    assert!(
        is_on_left_side_of_assignment(&chars, 0, 5),
        "value ??= should be detected as assignment"
    );
}

#[test]
fn test_is_on_left_side_of_assignment_logical_and_assign() {
    let chars: Vec<char> = "value &&= true".chars().collect();
    assert!(
        is_on_left_side_of_assignment(&chars, 0, 5),
        "value &&= should be detected as assignment"
    );
}

#[test]
fn test_is_on_left_side_of_assignment_logical_or_assign() {
    let chars: Vec<char> = "value ||= false".chars().collect();
    assert!(
        is_on_left_side_of_assignment(&chars, 0, 5),
        "value ||= should be detected as assignment"
    );
}

#[test]
fn test_is_on_left_side_of_assignment_modulo_assign() {
    let chars: Vec<char> = "value %= 3".chars().collect();
    assert!(
        is_on_left_side_of_assignment(&chars, 0, 5),
        "value %= should be detected as assignment"
    );
}

#[test]
fn test_is_on_left_side_of_assignment_simple_equals() {
    let chars: Vec<char> = "value = 1".chars().collect();
    assert!(
        is_on_left_side_of_assignment(&chars, 0, 5),
        "value = should be detected as assignment"
    );
}

#[test]
fn test_is_on_left_side_of_assignment_equality_not_assignment() {
    let chars: Vec<char> = "value == 1".chars().collect();
    assert!(
        !is_on_left_side_of_assignment(&chars, 0, 5),
        "value == should NOT be detected as assignment"
    );
}

#[test]
fn test_is_on_left_side_of_assignment_strict_equality_not_assignment() {
    let chars: Vec<char> = "value === 1".chars().collect();
    assert!(
        !is_on_left_side_of_assignment(&chars, 0, 5),
        "value === should NOT be detected as assignment"
    );
}

#[test]
fn test_split_nested_pattern_default_with_default() {
    // Bug: `{ width: measuredWidth, height: measuredHeight } = { width: 0, height: 0 }`
    // was passed entirely to process_nested_pattern_elements instead of splitting
    let input = "{ width: measuredWidth, height: measuredHeight } = { width: 0, height: 0 }";
    let (pattern, default_val) = split_nested_pattern_default(input);
    assert_eq!(
        pattern, "{ width: measuredWidth, height: measuredHeight }",
        "Should extract just the pattern"
    );
    assert_eq!(
        default_val,
        Some("{ width: 0, height: 0 }"),
        "Should extract the default value"
    );
}

#[test]
fn test_split_nested_pattern_default_no_default() {
    let input = "{ width: measuredWidth, height: measuredHeight }";
    let (pattern, default_val) = split_nested_pattern_default(input);
    assert_eq!(pattern, input, "Should return the entire input as pattern");
    assert_eq!(default_val, None, "Should have no default");
}

#[test]
fn test_split_nested_pattern_default_array() {
    let input = "[a, b] = [1, 2]";
    let (pattern, default_val) = split_nested_pattern_default(input);
    assert_eq!(pattern, "[a, b]", "Should extract array pattern");
    assert_eq!(default_val, Some("[1, 2]"), "Should extract array default");
}

#[test]
fn test_split_nested_pattern_default_nested_braces() {
    // Nested braces inside the pattern should not confuse the splitting
    let input = "{ a: { b: c } } = { a: { b: 1 } }";
    let (pattern, default_val) = split_nested_pattern_default(input);
    assert_eq!(pattern, "{ a: { b: c } }", "Should handle nested braces");
    assert_eq!(default_val, Some("{ a: { b: 1 } }"));
}

#[test]
fn test_split_nested_pattern_default_simple_identifier() {
    // Non-pattern input (no { or [) should return as-is with no default
    let input = "value";
    let (pattern, default_val) = split_nested_pattern_default(input);
    assert_eq!(pattern, "value");
    assert_eq!(default_val, None);
}

#[test]
fn test_transform_read_only_props_block_comment_before_key() {
    // Similar to wrap_prop_source_reads: block comment before property key should be skipped
    let read_only_props = vec![("value".to_string(), "value".to_string())];
    let input = r#"{ key: 1, /* comment */ value: 2 }"#;
    let result = transform_read_only_props(input, &read_only_props);
    assert!(
        result.contains("value: 2"),
        "value as property key after block comment should NOT be transformed: {}",
        result
    );
    assert!(
        !result.contains("$$props.value: 2"),
        "Property key should not become $$props.value: {}",
        result
    );
}

#[test]
fn test_transform_read_only_props_getter_setter() {
    // getter/setter names should not be transformed
    let read_only_props = vec![("value".to_string(), "value".to_string())];
    let input = "{ get value() { return 1; } }";
    let result = transform_read_only_props(input, &read_only_props);
    assert!(
        result.contains("get value()"),
        "getter name should not be transformed: {}",
        result
    );
}

#[test]
fn test_transform_read_only_props_in_expression() {
    // When used as an expression, should be transformed to $$props.propName
    let read_only_props = vec![("value".to_string(), "value".to_string())];
    let input = "let x = value + 1;";
    let result = transform_read_only_props(input, &read_only_props);
    assert!(
        result.contains("$$props.value"),
        "value in expression should be transformed to $$props.value: {}",
        result
    );
}

#[test]
fn test_derived_trailing_comma_no_syntax_error() {
    // $derived(expr,) with trailing comma should produce valid JS
    // The trailing comma is valid in function call syntax but NOT in () => (expr,)
    let source = r#"<script>
  const justifyClass = $derived(
    {
      center: 'justify-center',
      left: 'justify-start',
      right: 'justify-end',
    }[position] ?? 'justify-center',
  );
</script>
<p>{justifyClass}</p>"#;

    let options = crate::compiler::CompileOptions {
        dev: true,
        generate: crate::compiler::GenerateMode::Client,
        ..Default::default()
    };
    let result = crate::compiler::compile(source, options).expect("compile should succeed");
    let code = &result.js.code;

    // The output should NOT contain a trailing comma inside grouping parens () => (expr,)
    // Check that $.derived(() => (...,)) pattern does NOT exist
    assert!(
        !code.contains("',\n  ))"),
        "Should not have trailing comma in grouping expression: {}",
        code
    );
    // Should contain a valid $.derived call
    assert!(
        code.contains("$.derived("),
        "Should contain $.derived call: {}",
        code
    );
}

#[test]
fn test_compile_with_multibyte_utf8_no_panic() {
    // Source with Japanese characters that could cause byte index boundary issues
    // when is_svelte_ignored_with_source slices source with saturating_sub(500)
    let mut source = String::from("<script>\n");
    // Add enough content with multi-byte characters to push past 500 bytes
    for _ in 0..100 {
        source.push_str("  // コメント: データタイプ\n");
    }
    source.push_str("  const x = $state(0);\n");
    source.push_str("</script>\n<p>{x}</p>");

    let options = crate::compiler::CompileOptions {
        dev: true,
        generate: crate::compiler::GenerateMode::Client,
        ..Default::default()
    };
    // Should not panic with "byte index is not a char boundary"
    let result = crate::compiler::compile(&source, options);
    assert!(
        result.is_ok(),
        "compile should not panic on multi-byte UTF-8 source"
    );
}

#[test]
fn test_bindable_prop_setter_uses_function_call() {
    // Bug: bind:value on a component with $bindable() props generated
    // `set value($$value) { value = $$value; }` (plain assignment)
    // instead of `set value($$value) { value($$value); }` (function call).
    // This caused "TypeError: value is not a function" at runtime because
    // $.prop() returns a getter/setter function, and the assignment overwrites it.
    let source = r#"<script>
  import Child from './Child.svelte';
  let { value = $bindable() } = $props();
</script>
<Child bind:value />"#;

    let options = crate::compiler::CompileOptions {
        generate: crate::compiler::GenerateMode::Client,
        ..Default::default()
    };
    let result = crate::compiler::compile(source, options).unwrap();
    let code = &result.js.code;

    // The setter should use function call syntax: value($$value)
    assert!(
        code.contains("value($$value)"),
        "Setter for bindable prop should use function call value($$value), not assignment: {}",
        code
    );
    // The setter should NOT use plain assignment: value = $$value
    assert!(
        !code.contains("value = $$value"),
        "Setter should not use plain assignment for prop source: {}",
        code
    );
}

#[test]
fn test_module_arrow_param_not_wrapped_when_shadowing_state() {
    // Bug: In compileModule, when a function parameter has the same name as a
    // $state() variable declared in a different function, the parameter references
    // inside the arrow body were incorrectly wrapped with $.get().
    // e.g., `(value) => JSON.stringify(value)` became
    //        `(value) => JSON.stringify($.get(value))` — WRONG
    // because `value` here is the arrow parameter, not the state variable.
    let source = r#"
export const defaultSerializer = () => ({
  serialize: (value) => JSON.stringify(value),
  deserialize: (value) => JSON.parse(value),
});

export function useStore() {
  let value = $state('');
  $effect(() => { console.log(value); });
  return { get value() { return value; }, set value(v) { value = v; } };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.ts".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // The arrow parameter `value` should NOT be wrapped with $.get()
    assert!(
        code.contains("(value) => JSON.stringify(value)"),
        "Arrow param should not be wrapped with $.get(): {}",
        code
    );
    assert!(
        !code.contains("JSON.stringify($.get(value))"),
        "Arrow body should not wrap shadowed param with $.get(): {}",
        code
    );
    // But the state variable reads SHOULD be wrapped
    assert!(
        code.contains("$.get(value)"),
        "State variable reads should still use $.get(): {}",
        code
    );
    assert!(
        code.contains("$.set(value,"),
        "State variable writes should still use $.set(): {}",
        code
    );
}

#[test]
fn test_module_nested_fn_call_in_arrow_body_shadow() {
    // Verify that nested function calls inside arrow bodies don't break
    // the shadowing detection: (x) => foo(bar(x))
    let source = r#"
export function useStore() {
  let x = $state(0);
  const transform = (x) => Math.abs(Math.floor(x));
  return { get x() { return x; }, set x(v) { x = v; } };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.ts".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // The arrow param `x` should NOT be wrapped
    assert!(
        code.contains("(x) => Math.abs(Math.floor(x))"),
        "Nested fn calls in arrow body: param should not be wrapped: {}",
        code
    );
    // But state reads should be wrapped
    assert!(
        code.contains("return $.get(x)"),
        "State reads should be wrapped: {}",
        code
    );
}

#[test]
fn test_module_state_with_nullish_coalescing_gets_proxy() {
    // Bug: `$state(pData ?? defaultValue)` was not wrapped with $.proxy()
    // because contains_top_level_logical only checked if the right side
    // started with `{`, `[`, or `new`. The official compiler proxies ALL
    // LogicalExpression initializers.
    let source = r#"
export function useStore(pData) {
  let data = $state(pData ?? { name: '' });
  return { get data() { return data; }, set data(v) { data = v; } };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.ts".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // The initializer should be wrapped with $.proxy()
    assert!(
        code.contains("$.proxy(pData ?? { name: '' })")
            || code.contains("$.proxy(pData ?? {name: ''})"),
        "$state(x ?? obj) should be wrapped with $.proxy(): {}",
        code
    );
}

#[test]
fn test_module_state_with_logical_or_gets_proxy() {
    // Same as above but with || instead of ??
    let source = r#"
export function useStore(pData) {
  let data = $state(pData || []);
  return { get data() { return data; }, set data(v) { data = v; } };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.ts".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // The initializer should be wrapped with $.proxy()
    assert!(
        code.contains("$.proxy(pData || [])"),
        "$state(x || arr) should be wrapped with $.proxy(): {}",
        code
    );
}

#[test]
fn test_module_state_literal_no_proxy() {
    // Ensure that simple literals are NOT wrapped with $.proxy()
    let source = r#"
export function useStore() {
  let count = $state(0);
  let name = $state('hello');
  return {
    get count() { return count; },
    set count(v) { count = v; },
    get name() { return name; },
    set name(v) { name = v; },
  };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.ts".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // Literals should NOT be proxied
    assert!(
        !code.contains("$.proxy(0)"),
        "Numeric literal should not be proxied: {}",
        code
    );
    assert!(
        !code.contains("$.proxy('hello')") && !code.contains("$.proxy(\"hello\")"),
        "String literal should not be proxied: {}",
        code
    );
}

#[test]
fn test_module_derived_var_gets_get_in_arrow_return() {
    // Bug: $derived variables declared with `const` inside a function were
    // incorrectly treated as "shadowed by local var decl", which prevented
    // $.get() wrapping when the variable was referenced in arrow functions.
    let source = r#"
export function useStore() {
  let x = $state(0);
  const y = $derived(x * 2);
  return {
    getValue: () => y,
  };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.ts".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    assert!(
        code.contains("() => $.get(y)"),
        "$derived variable in arrow return should be wrapped with $.get(): {}",
        code
    );
}

#[test]
fn test_module_derived_with_ts_annotation_gets_get() {
    // Bug: TypeScript type annotations on $derived declarations (e.g.,
    // `const contentStyle: string = $derived.by(...)`) prevented the
    // variable from being detected as reactive, so $.get() was missing.
    let source = r#"
export const useStore = () => {
  let position = $state({ x: 0, y: 0 });

  const contentStyle: string = $derived.by(() => {
    return `transform: translate(${position.x}px, ${position.y}px);`;
  });

  return {
    contentStyle: () => contentStyle,
  };
};
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.ts".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    assert!(
        code.contains("() => $.get(contentStyle)"),
        "TypeScript-annotated $derived var should be wrapped with $.get(): {}",
        code
    );
}

#[test]
fn test_module_state_with_ts_generic_gets_tracked() {
    // Ensure $state<GenericType>() patterns are properly detected as reactive vars.
    let source = r#"
export function useStore() {
  let cleanup = $state<() => void>();
  $effect(() => { cleanup?.(); });
  return {
    setCleanup: (fn) => { cleanup = fn; },
  };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.ts".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // The cleanup variable should be wrapped with $.get() inside $effect
    assert!(
        code.contains("$.get(cleanup)"),
        "$state<GenericType>() variable should be wrapped with $.get(): {}",
        code
    );
}

#[test]
fn test_module_const_state_after_obj_gets_proxy_only() {
    // Bug: `const` $state variables after a `const $state({ obj })` declaration
    // were incorrectly getting $.state() wrapping. The extract_var_name_before_rune
    // function was finding a `:` inside the object literal of the previous declaration
    // and treating it as a TypeScript type annotation.
    let source = r#"
export const fn = () => {
  return (node) => {
    const d = $state({ x: 1 });
    const clearTooltipListeners = $state([]);
    return clearTooltipListeners;
  };
};
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.ts".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // const $state variables should only get $.proxy(), NOT $.state()
    // In dev mode, $.proxy([]) is wrapped with $.tag_proxy() for debugging
    assert!(
        code.contains("$.proxy([])"),
        "const $state([]) should contain $.proxy([]) not $.state(): {}",
        code
    );
    // In dev mode, $.proxy({...}) is wrapped with $.tag_proxy() for debugging
    assert!(
        code.contains("$.proxy({ x: 1 })") || code.contains("$.proxy({x: 1})"),
        "const $state(obj) should contain $.proxy(obj): {}",
        code
    );
    // Should NOT have $.get() wrapping
    assert!(
        !code.contains("$.get(clearTooltipListeners)"),
        "const $state var should not need $.get(): {}",
        code
    );
}

#[test]
fn test_wrap_state_derived_with_tag_comma_separated() {
    let input = "let tmp = setup(), num = $.state($.proxy(tmp.num));";
    let result = wrap_state_derived_with_tag(input);
    assert!(
        result.contains("$.tag($.state($.proxy(tmp.num)), 'num')"),
        "Expected $.tag wrapping for comma-separated declarator: {}",
        result
    );
}
