//! Client-side code generation.
//!
//! Generates JavaScript code for browser execution using the visitor pattern.
//!
//! This module mirrors the official Svelte compiler structure at
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/`.

pub(crate) use super::shared::ast_rewrite;
use std::borrow::Cow;
use std::fmt::Write as _;
mod assign_dev_ast;
mod ast;
mod ast_state_transform;
mod await_reactivity_loss_ast;
mod class_body_ast;
mod class_transforms;
mod console_dev_ast;
mod console_wrap;
mod derived_by_ast;
mod destructure_transforms;
mod effect_rune_ast;
mod expression_utils;
mod formatting;
mod inspect_rune_ast;
mod instance_dev_tail_ast;
mod legacy_state_member_mutate_ast;
mod local_assign_ast;
mod module_dev_tail_ast;
mod module_state_runes_ast;
mod private_class_assign_ast;
mod private_field_assign_ast;
mod private_member_mutate_root_ast;
mod private_member_read_wrap_ast;
mod private_read_wrap_ast;
mod private_v_suffix_ast;
mod prop_assign_ast;
mod prop_member_mutate_ast;
mod prop_source_reads_ast;
mod props_transforms;
mod reactive_transforms;
mod reactive_update_ast;
mod read_only_props_ast;
mod rest_prop_member_access_ast;
mod rune_transforms;
mod scan_index;
mod scope_analysis;
mod state_assigns_combined_ast;
mod state_call_ast;
mod state_member_mutate_ast;
mod state_pipeline_ast;
mod state_raw_frozen_ast;
mod state_reads_ast;
mod state_set_reactive_ast;
mod state_snapshot_ast;
mod state_transforms;
mod store_assign_ast;
mod store_member_mutate_ast;
mod store_transforms;
mod store_unsub_wrap_ast;
mod store_update_ast;
mod strict_equals_ast;
mod strip_rune_generics_ast;
mod tag_class_field_ast;
mod tag_declarator_ast;
pub mod transform_template;
pub mod types;
pub mod utils;
pub mod visitors;

// Re-export all extracted module functions so they remain accessible by their original names.
// Some imports may appear unused in mod.rs but are needed for test access via `use super::*;`.
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
pub(crate) use formatting::normalize_js_with_oxc;

use std::cell::{Cell, RefCell};
use std::rc::Rc;
use std::sync::LazyLock;

use memchr::memmem;
// rustc_hash is used by submodules via their own imports

use regex::Regex;

use super::TransformError;
use super::js_ast::{
    builders::{self as b},
    codegen::{CodegenResult, SourceMapping, generate, generate_with_sourcemap},
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
use crate::compiler::phases::phase2_analyze::types::{CopiedSourceChunk, ScriptProjection};

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
    // Matches `let|const|var <name> [: type] = $state[.raw|.frozen]<T>(...)`
    // or `$derived[.by]<T>(...)`. The `.raw` / `.frozen` variants must be
    // tracked too — without them, reassigned `$state.raw(x)` vars get the
    // `$.state(...)` declaration wrapper at module level but their reads
    // (`x[key]`) and writes (`x = next`) are never rewritten through
    // `$.get`/`$.set`, so consumers see the raw source object instead of
    // the value (see baseballyama/rsvelte#143).
    // `$` is a JS identifier character, so names like `delay$` must be captured too.
    Regex::new(r"(let|const|var)\s+([\w$]+)(?:\s*:[^=\n]*)?\s*=\s*\$(?:state(?:\.raw|\.frozen)?|derived(?:\.by)?)(?:<[^(]*>)?\s*\(").unwrap()
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
    // Counter for generating unique $$d variable names for $derived/$derived.by destructuring.
    // Generates $$d, $$d_1, $$d_2, etc. Matches official compiler's scope.generate('$$d').
    pub(super) static DERIVED_TMP_COUNTER: Cell<usize> = const { Cell::new(0) };
    // Var-declared state/derived vars that need $.safe_get() instead of $.get()
    // var declarations are hoisted, so they can be read before initialization.
    // $.safe_get() handles this by returning undefined if not yet initialized.
    // Reference: declarations.js line 26
    pub(super) static VAR_STATE_VARS: RefCell<Vec<String>> = const { RefCell::new(Vec::new()) };
}

struct AstStateCounterSnapshot {
    script_array: usize,
    array_lookup: usize,
    state_tmp: usize,
    derived_tmp: usize,
}

impl AstStateCounterSnapshot {
    fn capture() -> Self {
        Self {
            script_array: SCRIPT_ARRAY_COUNTER.with(Cell::get),
            array_lookup: ARRAY_LOOKUP_COUNTER.with(Cell::get),
            state_tmp: STATE_TMP_COUNTER.with(Cell::get),
            derived_tmp: DERIVED_TMP_COUNTER.with(Cell::get),
        }
    }

    fn restore(&self) {
        SCRIPT_ARRAY_COUNTER.with(|counter| counter.set(self.script_array));
        ARRAY_LOOKUP_COUNTER.with(|counter| counter.set(self.array_lookup));
        STATE_TMP_COUNTER.with(|counter| counter.set(self.state_tmp));
        DERIVED_TMP_COUNTER.with(|counter| counter.set(self.derived_tmp));
    }
}

// Thread-local cache for dynamically-constructed regex patterns to avoid recompilation.
// `Arc<Regex>` keeps the cache lookup cheap: cloning the Arc is a single
// refcount bump rather than copying the (multi-KB) compiled NFA.
thread_local! {
    static REGEX_CACHE: RefCell<rustc_hash::FxHashMap<String, std::sync::Arc<Regex>>> =
        RefCell::new(rustc_hash::FxHashMap::default());
}

pub(super) fn get_or_compile_regex(pattern: &str) -> Option<std::sync::Arc<Regex>> {
    REGEX_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        if let Some(re) = cache.get(pattern) {
            return Some(re.clone());
        }
        match Regex::new(pattern) {
            Ok(re) => {
                let arc = std::sync::Arc::new(re);
                cache.insert(pattern.to_string(), arc.clone());
                Some(arc)
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
pub(crate) fn transform_client(
    analysis: &ComponentAnalysis,
    ast: &Root,
    source: &str,
    options: &CompileOptions,
    retained_scripts: Option<&crate::ast::oxc_program::RetainedScripts<'_>>,
) -> Result<CodegenResult, TransformError> {
    if ast::oracle::enabled() {
        // Run both pipelines and score the AST one against the text one, which
        // is the specification here (it passes every fixture). The text result
        // is what we return, so turning the oracle on cannot change output.
        let oracle =
            transform_client_with_visitors(analysis, ast, source, options, retained_scripts)?;
        ast::oracle::record(
            match ast::transform_client_ast(analysis, ast, source, options) {
                None => ast::oracle::Verdict::FellBack,
                Some(candidate) if candidate.code == oracle.code => ast::oracle::Verdict::Matched,
                Some(_) => ast::oracle::Verdict::Mismatched,
            },
        );
        return Ok(oracle);
    }

    if *ast::CLIENT_AST
        && let Some(result) = ast::transform_client_ast(analysis, ast, source, options)
    {
        return Ok(result);
    }

    transform_client_with_visitors(analysis, ast, source, options, retained_scripts)
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
    let mut body: Vec<JsStatement> = Vec::new();

    // Leading comment: /* filename generated by Svelte vX */
    let basename = options
        .filename
        .as_ref()
        .and_then(|f| f.rsplit('/').next().or_else(|| f.rsplit('\\').next()))
        .unwrap_or("input.svelte.js");
    let header = format!(
        "/* {} generated by Svelte v{} */",
        basename,
        option_env!("SVELTE_VERSION").unwrap_or("VERSION")
    );

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

    // Transform destructured assignments whose LHS contains state variables into
    // IIFE / sequence form (mirrors upstream `visit_assignment_expression` in
    // `shared/assignments.js`), e.g.
    //   `({ issues: raw = [], result } = rhs)` becomes
    //   `(($$value) => { $.set(raw, $.fallback($$value.issues, () => [], true), true);
    //                    $.set(result, $$value.result, true); })(rhs)`.
    // This MUST run on the RAW (pre-read-wrap) source — the same ordering the
    // instance-script pipeline uses (`transform_instance_script_for_visitors`)
    // — because it decomposes the destructure pattern into individual `$.set`
    // targets before `transform_module_script_runes` wraps state *reads* in
    // `$.get(...)`. Running it afterwards would see the pattern's LHS
    // identifiers already wrapped (`$.get(raw) = []`), which is invalid.
    // Handles object / array / rest patterns robustly; the previous
    // line-based `[a, b] = …` handler only matched array destructures at the
    // start of a line and left object patterns (and mid-line array patterns)
    // untransformed. See issue #1438.
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
    let class_transformed = if reactive_state_vars.is_empty() {
        class_transformed
    } else {
        // Reset the per-compile `$$array` counter (as the instance-script path
        // does) so `$.to_array(...)` temp names start at `$$array` and are
        // deterministic across compiles that reuse this thread.
        SCRIPT_ARRAY_COUNTER.with(|c| c.set(0));
        destructure_transforms::transform_destructure_assignments(
            &class_transformed,
            &reactive_state_vars,
            &[],
        )
    };

    let transformed = transform_module_script_runes(&class_transformed, analysis, options.dev);

    // The transformed source includes everything (imports + body).
    // We need to split imports from body to avoid duplicate svelte import.
    let (script_imports, script_rest) = extract_imports(&transformed);

    // Add non-svelte imports
    for import_line in &script_imports {
        let trimmed = import_line.trim();
        // Skip svelte internal imports since we already added them
        if memmem::find(trimmed.as_bytes(), b"svelte/internal/").is_none() {
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

    print_module_program(body, &header)
}

/// Print a `.svelte.(js|ts)` module body the way upstream's `client_module` /
/// `server_module` do: a builder-made `Program` with no `loc`, which parks
/// esrap's comment cursor past the end so only comments inside a located nested
/// body survive.
pub(crate) fn print_module_program(
    body: Vec<JsStatement>,
    header: &str,
) -> Result<String, TransformError> {
    use super::js_ast::codegen::generate;

    let program = super::js_ast::nodes::JsProgram { body };
    let arena = super::js_ast::arena::JsArena::new();
    let alloc = oxc_allocator::Allocator::default();
    if let Some(code) =
        super::js_ast::to_oxc::program_to_oxc(&program, &arena, &alloc).map(|converted| {
            let print_opts = rsvelte_esrap::PrintOptions::default()
                .with_empty_statements(true)
                .with_unlocated_program(true);
            match &converted.comment_source {
                Some(cs) => {
                    rsvelte_esrap::print_split(
                        &converted.program,
                        cs,
                        converted.loc_base,
                        None,
                        &converted.loc_map,
                        &print_opts,
                    )
                    .code
                }
                None => rsvelte_esrap::print_with(&converted.program, "", &print_opts),
            }
        })
    {
        return Ok(format!("{header}\n{code}"));
    }
    generate(&program, &arena)
        .map(|code| format!("{header}\n{code}"))
        .map_err(TransformError::CodeGen)
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
///
/// `#[inline(never)]` keeps this large function out of `transform_client`'s
/// inlined frame: the function is called once per component (not in a hot
/// loop) and inlining it bloats binary size without any per-component
/// throughput gain.
#[inline(never)]
fn transform_client_with_visitors(
    analysis: &ComponentAnalysis,
    ast: &Root,
    source: &str,
    options: &CompileOptions,
    retained_scripts: Option<&crate::ast::oxc_program::RetainedScripts<'_>>,
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
        &ast.arena,
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

    // Visit the program to set up transforms for props, store subscriptions, etc.
    // This handles state, legacy props, and store subscriptions.
    use crate::compiler::phases::phase3_transform::client::visitors::program::visit_program;
    let _vp_start = super::profile::timer_start();
    visit_program(&mut context);
    super::profile::record_visit_program(super::profile::timer_elapsed(_vp_start));

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

    // Module-scope `var rest_excludes = new Set([...])` hoists lifted out of the
    // instance script's `$.rest_props($$props, [...])` calls. Emitted as real
    // statements at module-body assembly (below) rather than spliced into the
    // final printed output.
    let mut rest_excludes_hoists: Vec<(String, String)> = Vec::new();

    // Transform the instance script once with the real reactive_import_names.
    // This also determines how many $$array names it consumes (for template generation)
    // and is used for blocker_map computation and the final output.
    let mut instance_script_imports = Vec::new();
    let mut pre_transformed_script = if let Some(instance_script) =
        &analysis.instance_script_content
    {
        let retained_instance = retained_scripts.and_then(|scripts| scripts.instance.as_ref());
        let needs_projection = analysis.runes
            && retained_instance.is_some()
            && instance_script.source_projection.is_some();
        let can_borrow_projection = needs_projection
            && memmem::find(instance_script.raw.as_bytes(), b"import").is_none()
            && !instance_script.raw.as_bytes().contains(&b'\r');
        let (imports, script_body, body_chunks) = if can_borrow_projection {
            (
                Vec::new(),
                instance_script
                    .raw
                    .strip_suffix('\n')
                    .unwrap_or(&instance_script.raw)
                    .to_string(),
                Vec::new(),
            )
        } else if needs_projection {
            extract_imports_with_projection(&instance_script.raw)
        } else {
            let (imports, script_body) = extract_imports(&instance_script.raw);
            (imports, script_body, Vec::new())
        };
        let composed_body_projection = (needs_projection && !can_borrow_projection).then(|| {
            compose_script_projection(
                instance_script.source_projection.as_ref().unwrap(),
                &body_chunks,
                script_body.len(),
            )
        });
        let body_projection = if can_borrow_projection {
            instance_script.source_projection.as_ref()
        } else {
            composed_body_projection.as_ref()
        };
        instance_script_imports = imports;
        let split_top_level_declarations =
            instance_has_top_level_multi_declarator(ast, &instance_script.raw);
        let _script_start = super::profile::timer_start();
        let _parent_scope = super::profile::ParentScope::new();
        let mut transformed = transform_instance_script_for_visitors(
            &script_body,
            analysis,
            options.dev,
            &reactive_import_names,
            split_top_level_declarations,
            retained_instance,
            body_projection,
        );
        rest_excludes_hoists = extract_rest_excludes_hoists(&mut transformed);
        super::profile::record_script_text(super::profile::timer_elapsed(_script_start));
        super::profile::record_parent_site(false);
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
                    memmem::find(raw_script.raw.as_bytes(), b"await "),
                    memmem::find(raw_script.raw.as_bytes(), b"$props()"),
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
            // Track per-slot primary binding NAMES so the Fragment visitor can
            // mirror upstream's dedup-by-Expression behavior for
            // template_effect blockers arrays.
            let primary_names =
                super::shared::async_body::compute_blocker_primary_names(transformed);
            if !primary_names.is_empty() {
                *context.state.blocker_map_primary_names.borrow_mut() = primary_names;
            }
        } else {
            let pre_blocker_map = super::shared::async_body::compute_blocker_map(transformed);
            if !pre_blocker_map.is_empty() {
                *context.state.blocker_map.borrow_mut() = pre_blocker_map;
            }
            let primary_names =
                super::shared::async_body::compute_blocker_primary_names(transformed);
            if !primary_names.is_empty() {
                *context.state.blocker_map_primary_names.borrow_mut() = primary_names;
            }
        }
    }

    // Call the fragment visitor to transform the template
    // This is the root fragment of the component, so is_root_fragment=true
    let _fragment_start = super::profile::timer_start();
    let template_body = fragment(&ast.fragment, &mut context, true);
    super::profile::record_template_fragment(super::profile::timer_elapsed(_fragment_start));

    // Propagate any error that was recorded during template traversal (e.g. "Not implemented:
    // LetDirective" from visit_svelte_element when a SvelteElement carries a let: directive).
    if let Some(msg) = context.state.pending_error.take() {
        return Err(TransformError::CodeGen(msg));
    }

    let _assembly_start = super::profile::timer_start();

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
        let is_prop_kind = |b: &crate::compiler::phases::phase2_analyze::scope::Binding| {
            matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp)
        };
        for b in &analysis.root.bindings {
            if let Some(existing) = map.get(b.name.as_str()) {
                // Prefer a `prop` / `bindable_prop` binding over a shadowing local
                // or function parameter of the same name. Top-level prop / store
                // resolution must bind to the prop, not an inner
                // `function f(prop) {…}` parameter that Phase-2 may register at
                // the instance scope index. Among same prop-ness, prefer instance
                // scope (the original heuristic).
                let replace = if is_prop_kind(b) != is_prop_kind(existing) {
                    is_prop_kind(b)
                } else {
                    b.scope_index == instance_scope_index
                        && existing.scope_index != instance_scope_index
                };
                if replace {
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
            b::call(&context.arena, b::id(store_name), vec![])
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
                    object: context.arena.alloc_expr(b::id("$$props")),
                    property: JsMemberProperty::Expression(
                        context.arena.alloc_expr(b::string(alias)),
                    ),
                    computed: true,
                    optional: false,
                })
            } else {
                // $$props.store for non-aliased props
                b::member_path(&context.arena, &format!("$$props.{}", store_name))
            }
        } else if is_reactive_import {
            b::call(
                &context.arena,
                b::id(format!("$$_import_{}", store_name)),
                vec![],
            )
        } else if is_derived_or_state {
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.get"),
                vec![b::id(store_name)],
            )
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
                    &context.arena,
                    b::member_path(&context.arena, "$.validate_store"),
                    vec![store_access_clone, b::string(store_name)],
                ),
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.store_get"),
                    vec![store_access, b::string(*store_sub_name), b::id("$$stores")],
                ),
            ])
        } else {
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.store_get"),
                vec![store_access, b::string(*store_sub_name), b::id("$$stores")],
            )
        };
        store_getters.push(b::const_decl(
            &context.arena,
            *store_sub_name,
            b::thunk(&context.arena, store_get_expr),
        ));
    }

    // Build store_setup: getters first, then setup_stores call
    let mut store_setup: Vec<JsStatement> = Vec::with_capacity(store_getters.len() + 1);
    store_setup.append(&mut store_getters);
    if needs_store_cleanup {
        // const [$$stores, $$cleanup] = $.setup_stores();
        store_setup.push(b::var_decl_pattern(
            &context.arena,
            JsVariableKind::Const,
            b::array_pattern(vec![
                Some(b::id_pattern("$$stores")),
                Some(b::id_pattern("$$cleanup")),
            ]),
            Some(b::call(
                &context.arena,
                b::member_path(&context.arena, "$.setup_stores"),
                vec![],
            )),
        ));
    }

    // Detect reactive statements ($:) in the instance script
    // Since analysis.reactive_statements is not populated yet, we scan the script directly.
    // A `$:` is reactive only at the TOP LEVEL of the instance script (brace depth 0);
    // a `$:` inside a function/block body is a plain labeled statement (upstream only
    // treats top-level `$:` as reactive). We approximate nesting with a brace counter.
    let has_reactive_statements = if let Some(ref content) = analysis.instance_script_content {
        let mut depth: i32 = 0;
        let mut found = false;
        for line in content.raw.lines() {
            let trimmed = line.trim();
            if depth <= 0
                && trimmed.starts_with("$:")
                && (trimmed.len() == 2 || !trimmed.chars().nth(2).unwrap_or(' ').is_alphanumeric())
            {
                found = true;
                break;
            }
            for c in line.chars() {
                match c {
                    '{' => depth += 1,
                    '}' => depth -= 1,
                    _ => {}
                }
            }
        }
        found
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
            .filter(|b| {
                matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp)
                    && !b.name.starts_with("$$")
            })
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
        // The synthetic `$$props` / `$$restProps` bindings (declared in legacy
        // mode so `$$props.x` references are recorded) are RestProp but must NOT
        // themselves force a `$$props` parameter — mirrors upstream's
        // `binding.node.name !== '$$props'` guards.
        && b.name != "$$props"
        && b.name != "$$restProps"
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
    let mut component_body: Vec<JsStatement> = Vec::new();

    // Add the componentApi: 4 new.target check / the dev `$.check_target` guard.
    // Reference: transform-client.js lines 559-574. Upstream unshifts this AFTER
    // the `$$slots` / `$$sanitized_props` / `$$restProps` unshifts, so it lands
    // ahead of all of them — only `props_id` (unshifted last) precedes it.
    if options.compatibility.component_api == crate::compiler::ComponentApi::V4 {
        // if (new.target) return $$_createClassComponent({ component: ComponentName, ...$$anchor });
        component_body.push(JsStatement::If(super::js_ast::nodes::JsIfStatement {
            test: context.arena.alloc_expr(b::id("new.target")),
            consequent: context.arena.alloc_stmt(JsStatement::Return(
                super::js_ast::nodes::JsReturnStatement {
                    argument: Some(context.arena.alloc_expr(b::call(
                        &context.arena,
                        b::id("$$_createClassComponent"),
                        vec![b::object(vec![
                            b::prop(&context.arena, "component", b::id(&analysis.name)),
                            b::spread(&context.arena, b::id("$$anchor")),
                        ])],
                    ))),
                },
            )),
            alternate: None,
        }));
    } else if options.dev {
        component_body.push(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.check_target"),
                vec![b::id("new.target")],
            ),
        ));
    }

    // Add legacy $$sanitized_props / $$restProps / $$slots declarations at the top.
    // These must come BEFORE $.push().
    // Reference: transform-client.js lines 458-497. Upstream `unshift`s in the
    // order restProps → sanitized_props → slots, so the final order is
    // `$$slots`, `$$sanitized_props`, `$$restProps` — emit `$$slots` first.
    //
    // $$slots: when uses_slots (applies in both runes and legacy mode)
    if analysis.uses_slots {
        component_body.push(b::const_decl(
            &context.arena,
            "$$slots",
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.sanitize_slots"),
                vec![b::id("$$props")],
            ),
        ));
    }

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
                &context.arena,
                "$$sanitized_props",
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.legacy_rest_props"),
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
                &context.arena,
                "$$restProps",
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.legacy_rest_props"),
                    vec![b::id("$$sanitized_props"), b::array(named_props)],
                ),
            ));
        }
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
        component_body.push(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.push"),
                push_args,
            ),
        ));
    }

    // Everything unshifted upstream lands above this point, so it anchors the
    // `$$ownership_validator` insertion below without restating those conditions.
    let preamble_end = component_body.len();

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
                    &context.arena,
                    &*binding.name,
                    b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.mutable_source"),
                        args,
                    ),
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
            component_body.push(b::const_decl(&context.arena, group_name, b::empty_array()));
        }
    }

    // (props_id is inserted at the very front of the component body at the end
    // of assembly — see below. Upstream unshifts it last so it becomes the
    // first line of the component, before `$.push`.)

    // `$.append_styles` is unshifted upstream (transform-client.js lines
    // 412-421) *after* the `$$ownership_validator` unshift (lines 379-383),
    // so it lands closer to the front. See the insertion below, anchored at
    // `preamble_end` alongside `$$ownership_validator`, which reproduces
    // that call order instead of pushing here out of position.

    // Add instance-level snippets
    component_body.extend(instance_level_snippets);

    // Add instance script content (transformed runes)
    // This includes $state, $derived, $effect, $props transformations
    // Reuse the pre_transformed_script from above (already has reactive_import_names).
    if let Some(ref content) = analysis.instance_script_content {
        let mut transformed_script = pre_transformed_script.take().unwrap_or_default();

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
                if memmem::find(line.as_bytes(), b"$.prop(").is_some()
                    || memmem::find(line.as_bytes(), b"$.bind_prop(").is_some()
                    || memmem::find(line.as_bytes(), b"$.legacy_rest_props(").is_some()
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
        if memmem::find(
            transformed_script.as_bytes(),
            b"$$ownership_validator.mutation",
        )
        .is_some()
        {
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
        // `content.start` is the byte right after `<script>`, which resolves to a
        // column past the end of that line; anchor the chunk at its first token.
        let script_source_offset = source
            .get(content.start as usize..content.end as usize)
            .map_or(content.start, |text| {
                content.start + (text.len() - text.trim_start().len()) as u32
            });
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
        component_body.push(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.legacy_pre_effect_reset"),
                vec![],
            ),
        ));
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
                            &context.arena,
                            alias,
                            vec![JsStatement::Return(
                                super::js_ast::nodes::JsReturnStatement {
                                    argument: Some(context.arena.alloc_expr(b::id(name))),
                                },
                            )],
                        ));
                        exports_members.push(b::setter(
                            &context.arena,
                            alias,
                            "$$value",
                            vec![b::stmt(
                                &context.arena,
                                b::assign(&context.arena, b::id(name), b::id("$$value")),
                            )],
                        ));
                    } else if !options.dev {
                        // const/function/class in non-dev: simple init property
                        if alias == name {
                            exports_members.push(b::prop_shorthand(&context.arena, name));
                        } else {
                            exports_members.push(b::prop(&context.arena, alias, b::id(name)));
                        }
                    } else {
                        // dev mode: getter only
                        exports_members.push(b::getter(
                            &context.arena,
                            alias,
                            vec![JsStatement::Return(
                                super::js_ast::nodes::JsReturnStatement {
                                    argument: Some(context.arena.alloc_expr(b::id(name))),
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
                                &context.arena,
                                alias,
                                vec![JsStatement::Return(
                                    super::js_ast::nodes::JsReturnStatement {
                                        argument: Some(context.arena.alloc_expr(b::call(
                                            &context.arena,
                                            b::id(name),
                                            vec![],
                                        ))),
                                    },
                                )],
                            ));
                            exports_members.push(b::setter(
                                &context.arena,
                                alias,
                                "$$value",
                                vec![b::stmt(
                                    &context.arena,
                                    b::call(&context.arena, b::id(name), vec![b::id("$$value")]),
                                )],
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
                            &context.arena,
                            alias,
                            vec![JsStatement::Return(
                                super::js_ast::nodes::JsReturnStatement {
                                    argument: Some(context.arena.alloc_expr(b::call(
                                        &context.arena,
                                        b::member_path(&context.arena, "$.get"),
                                        vec![b::id(name)],
                                    ))),
                                },
                            )],
                        ));
                        exports_members.push(b::setter(
                            &context.arena,
                            alias,
                            "$$value",
                            vec![b::stmt(
                                &context.arena,
                                b::call(
                                    &context.arena,
                                    b::member_path(&context.arena, "$.set"),
                                    vec![
                                        b::id(name),
                                        b::call(
                                            &context.arena,
                                            b::member_path(&context.arena, "$.proxy"),
                                            vec![b::id("$$value")],
                                        ),
                                    ],
                                ),
                            )],
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
                            &context.arena,
                            alias,
                            vec![JsStatement::Return(
                                super::js_ast::nodes::JsReturnStatement {
                                    argument: Some(context.arena.alloc_expr(b::call(
                                        &context.arena,
                                        b::member_path(&context.arena, "$.get"),
                                        vec![b::id(name)],
                                    ))),
                                },
                            )],
                        ));
                        exports_members.push(b::setter(
                            &context.arena,
                            alias,
                            "$$value",
                            vec![b::stmt(
                                &context.arena,
                                b::call(
                                    &context.arena,
                                    b::member_path(&context.arena, "$.set"),
                                    vec![b::id(name), b::id("$$value")],
                                ),
                            )],
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
                            &context.arena,
                            alias,
                            vec![JsStatement::Return(
                                super::js_ast::nodes::JsReturnStatement {
                                    argument: Some(context.arena.alloc_expr(b::call(
                                        &context.arena,
                                        b::member_path(&context.arena, "$.get"),
                                        vec![b::id(name)],
                                    ))),
                                },
                            )],
                        ));
                    }
                    _ => {}
                }
            } else if alias == name {
                exports_members.push(b::prop_shorthand(&context.arena, name));
            } else {
                exports_members.push(b::prop(&context.arena, alias, b::id(name)));
            }
        }

        // Add bindable props with getter/setter when accessors is enabled
        if analysis.accessors {
            for binding in &analysis.root.bindings {
                let binding_prop_name = binding.prop_alias.as_deref().unwrap_or(&binding.name);
                if matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp)
                    && !binding.name.starts_with("$$")
                    && !analysis.exports.iter().any(|e| {
                        let export_alias = e.alias.as_deref().unwrap_or(&e.name);
                        e.name == binding.name || export_alias == binding_prop_name
                    })
                {
                    let name = &binding.name;
                    let alias = binding.prop_alias.as_deref().unwrap_or(name);
                    exports_members.push(b::getter(
                        &context.arena,
                        alias,
                        vec![JsStatement::Return(
                            super::js_ast::nodes::JsReturnStatement {
                                argument: Some(context.arena.alloc_expr(b::call(
                                    &context.arena,
                                    b::id(name),
                                    vec![],
                                ))),
                            },
                        )],
                    ));
                    let setter_body = vec![
                        b::stmt(
                            &context.arena,
                            b::call(&context.arena, b::id(name), vec![b::id("$$value")]),
                        ),
                        b::stmt(
                            &context.arena,
                            b::call(
                                &context.arena,
                                b::member_path(&context.arena, "$.flush"),
                                vec![],
                            ),
                        ),
                    ];
                    // In runes mode with an initial value, turn `set foo($$value)`
                    // into `set foo($$value = <initial>)`.
                    // Reference: transform-client.js lines 315-323
                    if analysis.runes && binding.initial.is_some() {
                        let initial = binding.initial.clone().unwrap();
                        exports_members.push(b::setter_with_default(
                            &context.arena,
                            alias,
                            "$$value",
                            b::raw(initial),
                            setter_body,
                        ));
                    } else {
                        exports_members.push(b::setter(
                            &context.arena,
                            alias,
                            "$$value",
                            setter_body,
                        ));
                    }
                }
            }
        }

        // Add legacy API compatibility members
        // Reference: transform-client.js lines 338-356
        if options.compatibility.component_api == crate::compiler::ComponentApi::V4 {
            // $set: $.update_legacy_props
            exports_members.push(b::prop(
                &context.arena,
                "$set",
                b::member_path(&context.arena, "$.update_legacy_props"),
            ));
            // $on: ($$event_name, $$event_cb) => $.add_legacy_event_listener($$props, $$event_name, $$event_cb)
            exports_members.push(b::prop(
                &context.arena,
                "$on",
                b::arrow(
                    &context.arena,
                    vec![
                        JsPattern::Identifier("$$event_name".into()),
                        JsPattern::Identifier("$$event_cb".into()),
                    ],
                    b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.add_legacy_event_listener"),
                        vec![b::id("$$props"), b::id("$$event_name"), b::id("$$event_cb")],
                    ),
                ),
            ));
        } else if options.dev {
            // Upstream `unshift`s this one (transform-client.js:345) while the
            // componentApi: 4 members above are pushed, so it leads the object.
            exports_members.insert(
                0,
                b::spread(
                    &context.arena,
                    b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.legacy_api"),
                        vec![],
                    ),
                ),
            );
        }

        if !exports_members.is_empty() {
            // $$exports comes AFTER instance body (user script code)
            // This matches the official Svelte compiler ordering
            component_body.push(b::var_decl(
                &context.arena,
                "$$exports",
                Some(b::object(exports_members)),
            ));
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
        component_body.push(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.init"),
                init_args,
            ),
        ));
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
            &context.arena,
            "$$ownership_validator",
            Some(b::call(
                &context.arena,
                b::member_path(&context.arena, "$.create_ownership_validator"),
                vec![b::id("$$props")],
            )),
        );
        // Upstream unshifts this before `$.push` is unshifted, so it ends up
        // directly after the preamble.
        component_body.insert(preamble_end, ownership_decl);
    }

    // Add $.append_styles($$anchor, $$css) if needed
    // Reference: transform-client.js lines 412-421
    // Upstream unshifts this at the *same* front position as
    // `$$ownership_validator` above, but its unshift call happens after
    // (line 412 vs line 379), so it ends up ahead of `$$ownership_validator`
    // once both land at `preamble_end` — inserting here, after the
    // ownership-validator insert, reproduces that call order exactly.
    if analysis.css.has_css && analysis.inject_styles {
        component_body.insert(
            preamble_end,
            b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.append_styles"),
                    vec![b::id("$$anchor"), b::id("$$css")],
                ),
            ),
        );
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
                    read_fn(
                        &context.arena,
                        JsExpr::Identifier(export.name.clone().into()),
                    )
                } else {
                    b::id(&export.name)
                }
            } else {
                b::id(&export.name)
            };
            component_body.push(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.bind_prop"),
                    vec![b::id("$$props"), b::string(alias), getter_expr],
                ),
            ));
        }
    }

    // Add $.pop at the end if injecting context
    // Reference: transform-client.js lines 433-454
    if should_inject_context {
        if needs_exports {
            if needs_store_cleanup {
                // var $$pop = $.pop($$exports);
                component_body.push(b::var_decl(
                    &context.arena,
                    "$$pop",
                    Some(b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.pop"),
                        vec![b::id("$$exports")],
                    )),
                ));
            } else {
                // return $.pop($$exports)
                component_body.push(JsStatement::Return(
                    super::js_ast::nodes::JsReturnStatement {
                        argument: Some(context.arena.alloc_expr(b::call(
                            &context.arena,
                            b::member_path(&context.arena, "$.pop"),
                            vec![b::id("$$exports")],
                        ))),
                    },
                ));
            }
        } else {
            component_body.push(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.pop"),
                    vec![],
                ),
            ));
        }
    }

    // Add $$cleanup() at the very end if store subscriptions exist
    // Reference: transform-client.js lines 448-454
    if needs_store_cleanup {
        component_body.push(b::stmt(
            &context.arena,
            b::call(&context.arena, b::id("$$cleanup"), vec![]),
        ));

        if needs_exports {
            // return $$pop;
            component_body.push(JsStatement::Return(
                super::js_ast::nodes::JsReturnStatement {
                    argument: Some(context.arena.alloc_expr(b::id("$$pop"))),
                },
            ));
        }
    }

    // Add $props.id() declaration at the very front of the component body.
    // Reference: transform-client.js lines 577-580 — upstream unshifts this last,
    // so it must be the first line of the component (needed for hydration), i.e.
    // BEFORE `$.push(...)`.
    if let Some(ref props_id_name) = analysis.props_id {
        component_body.insert(
            0,
            b::const_decl(
                &context.arena,
                props_id_name,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.props_id"),
                    vec![],
                ),
            ),
        );
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
    let mut body: Vec<JsStatement> = Vec::new();

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

    // Add disclose-version import (first), unless the public `disclose_version`
    // option opts out of it (H-087). Defaults to true.
    if options.disclose_version {
        body.push(JsStatement::Import(JsImportDeclaration {
            specifiers: vec![],
            source: "svelte/internal/disclose-version".into(),
        }));
    }

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
        body.push(b::stmt(
            &context.arena,
            b::assign(
                &context.arena,
                b::member_computed(
                    &context.arena,
                    b::id(&analysis.name),
                    b::member(&context.arena, b::id("$"), "FILENAME"),
                ),
                b::string(relative_filename),
            ),
        ));
    }

    // Process module script content - extract imports separately from other content
    // This is needed because module_level_snippets must come after imports but before exports
    // Reference: transform-client.js line 513: body = [...imports, ...state.module_level_snippets, ...body];
    let module_script_non_imports: Option<(String, Option<String>)> =
        if let Some(ref module_content) = analysis.module_script_content {
            // Strip TypeScript syntax before processing
            let raw = crate::compiler::phases::phase2_analyze::types::strip_typescript(
                &module_content.raw,
            );
            let (module_imports, rest) = extract_imports(&raw);
            let retained_comment_stripped = if !analysis.is_typescript {
                retained_scripts
                    .and_then(|scripts| scripts.module.as_ref())
                    .filter(|retained| retained.program().source_text == raw)
                    .map(|retained| {
                        let stripped =
                            strip_module_toplevel_comments_from_program(&raw, retained.program());
                        extract_imports(&stripped).1.trim().to_string()
                    })
            } else {
                None
            };
            // Add module script imports first (from module.body in official compiler)
            for import_line in module_imports {
                let cleaned = cleanup_import_line(&import_line);
                if cleaned.is_empty() {
                    continue;
                }
                let trimmed = cleaned.trim();
                // Ensure import statements end with semicolons, matching esrap behavior.
                let with_semi = if !trimmed.ends_with(';') {
                    format!("{};", trimmed)
                } else {
                    trimmed.to_string()
                };
                body.push(JsStatement::Raw(with_semi.into()));
            }
            let rest_trimmed = rest.trim();
            // A module `<script module>` whose only non-import content is comments
            // (and whitespace) carries no statements. Upstream parses it into an
            // empty Program and esrap emits nothing — the dangling comments are
            // dropped (they have no node to anchor to). Mirror that: emit nothing,
            // rather than hoisting the bare comments to module top level.
            if rest_trimmed.is_empty() || is_js_comments_and_whitespace_only(rest_trimmed) {
                None
            } else {
                Some((rest_trimmed.to_string(), retained_comment_stripped))
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
    if analysis.instance_script_content.is_some() {
        for import_line in instance_script_imports {
            let cleaned = cleanup_import_line(&import_line);
            if cleaned.is_empty() {
                continue;
            }
            let trimmed = cleaned.trim();
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
    if let Some((non_imports, retained_comment_stripped)) = module_script_non_imports {
        let class_transformed = transform_class_fields_client(&non_imports);
        let transformed = transform_module_script_runes(&class_transformed, analysis, options.dev);
        // Drop module-level comments esrap's no-`loc` top-level Program omits
        // (leading JSDoc before a kept `export const`, per-field JSDoc that
        // `strip_typescript` re-emits from a removed `export type`/`interface`).
        let transformed = if transformed == non_imports {
            retained_comment_stripped
                .unwrap_or_else(|| strip_module_toplevel_comments(&transformed))
        } else {
            strip_module_toplevel_comments(&transformed)
        };
        body.push(JsStatement::Raw(transformed.into()));
    }

    // Add hoisted statements (template declarations, etc.)
    body.extend(hoisted_statements);

    // Add CSS declaration if needed
    if analysis.css.has_css && analysis.inject_styles {
        let hash = b::string(analysis.css.hash.clone());
        // Render the actual scoped CSS code.
        // Injected styles are minified unless in dev mode, matching upstream's
        // `minify: analysis.inject_styles && !options.dev` (3-transform/css/index.js:36).
        let mut css_code = String::new();
        let css_render_result = if !options.dev {
            super::css::render_stylesheet_minified(analysis, ast.css.as_deref(), source, options)
        } else {
            super::css::render_stylesheet(analysis, ast.css.as_deref(), source, options)
        };
        if let Ok(css_output) = css_render_result {
            css_code = css_output.code;
            // `if (dev && analysis.inject_styles && css.code)` (`css/index.js`),
            // which a custom element satisfies too — its `$$css.code` carries
            // the map like any other injected stylesheet.
            if options.dev
                && !css_code.is_empty()
                && let Some(mut css_map_json) = css_output.map
            {
                // Remap through preprocessor map if present
                if let Some(ref pp_map) = options.sourcemap {
                    css_map_json = super::remap_css_sourcemap(&css_map_json, pp_map, options);
                }
                // Encode as base64 data URI
                let b64 = super::base64_encode(css_map_json.as_bytes());
                let _ = write!(
                    css_code,
                    "\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,{} */",
                    b64
                );
            }
        }
        let code = b::string(css_code);
        body.push(b::const_decl(
            &context.arena,
            "$$css",
            b::object(vec![
                super::js_ast::nodes::JsObjectMember::Property(super::js_ast::nodes::JsProperty {
                    key: super::js_ast::nodes::JsPropertyKey::Identifier("hash".into()),
                    value: context.arena.alloc_expr(hash),
                    kind: super::js_ast::nodes::JsPropertyKind::Init,
                    shorthand: false,
                    method: false,
                    computed: false,
                }),
                super::js_ast::nodes::JsObjectMember::Property(super::js_ast::nodes::JsProperty {
                    key: super::js_ast::nodes::JsPropertyKey::Identifier("code".into()),
                    value: context.arena.alloc_expr(code),
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
        body.push(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.delegate"),
                vec![b::array(event_literals)],
            ),
        ));
    }

    // Add customElements.define() for custom element components
    // Reference: transform-client.js lines 596-677
    if let Some(ref ce) = analysis.custom_element {
        // Build props config.
        // Reference: transform-client.js lines 590-626: entries from
        // `<svelte:options customElement={{ props: {...} }}>` come first, then
        // every prop/bindable_prop binding (not already covered) as `name: {}`.
        // `ce.props` is the ObjectExpression AST of the `props` option; convert
        // it to (name, prop_def) entries in source order.
        let ce_props: Vec<(String, serde_json::Map<String, serde_json::Value>)> = ce
            .props
            .as_ref()
            .and_then(|p| p.get("properties"))
            .and_then(|p| p.as_array())
            .map(|props| {
                props
                    .iter()
                    .filter_map(|prop| {
                        let key = prop.get("key")?;
                        let name = key
                            .get("name")
                            .and_then(|n| n.as_str())
                            .or_else(|| key.get("value").and_then(|v| v.as_str()))?
                            .to_string();
                        let mut def = serde_json::Map::new();
                        if let Some(value_props) = prop
                            .get("value")
                            .and_then(|v| v.get("properties"))
                            .and_then(|p| p.as_array())
                        {
                            for vp in value_props {
                                let vkey = vp.get("key").and_then(|k| {
                                    k.get("name")
                                        .and_then(|n| n.as_str())
                                        .or_else(|| k.get("value").and_then(|v| v.as_str()))
                                });
                                if let (Some(vkey), Some(vval)) =
                                    (vkey, vp.get("value").and_then(|v| v.get("value")))
                                {
                                    def.insert(vkey.to_string(), vval.clone());
                                }
                            }
                        }
                        Some((name, def))
                    })
                    .collect()
            })
            .unwrap_or_default();

        let mut props_entries: Vec<super::js_ast::nodes::JsObjectMember> = Vec::new();
        let mut ce_prop_keys: Vec<String> = Vec::new();
        {
            for (name, prop_def) in &ce_props {
                let binding = analysis.root.bindings.iter().find(|b| &b.name == name);
                let key = binding
                    .and_then(|b| b.prop_alias.clone())
                    .unwrap_or_else(|| name.clone());

                let mut prop_type = prop_def
                    .get("type")
                    .and_then(|t| t.as_str())
                    .map(|s| s.to_string());
                // If no explicit type and the binding's initial value is a boolean
                // literal, infer type: 'Boolean' (transform-client.js lines 600-607)
                if prop_type.is_none()
                    && let Some(b) = binding
                    && b.initial_node_type.as_deref() == Some("Literal")
                    && matches!(b.initial.as_deref(), Some("true") | Some("false"))
                {
                    prop_type = Some("Boolean".to_string());
                }

                let mut value_props: Vec<super::js_ast::nodes::JsObjectMember> = Vec::new();
                if let Some(attribute) = prop_def.get("attribute").and_then(|a| a.as_str()) {
                    value_props.push(b::prop(&context.arena, "attribute", b::string(attribute)));
                }
                if prop_def
                    .get("reflect")
                    .and_then(|r| r.as_bool())
                    .unwrap_or(false)
                {
                    value_props.push(b::prop(&context.arena, "reflect", b::true_literal()));
                }
                if let Some(t) = &prop_type {
                    value_props.push(b::prop(&context.arena, "type", b::string(t.clone())));
                }

                ce_prop_keys.push(key.clone());
                props_entries.push(b::prop(&context.arena, &key, b::object(value_props)));
            }
        }
        for binding in &analysis.root.bindings {
            if !matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp)
                || binding.name.starts_with("$$")
            {
                continue;
            }
            let key = binding
                .prop_alias
                .clone()
                .unwrap_or_else(|| binding.name.clone());
            // Upstream checks `if (ce_props[key]) continue;` — i.e. the original
            // option-object keys, not the emitted (aliased) keys.
            if ce_props.iter().any(|(name, _)| name == &key) {
                continue;
            }
            props_entries.push(b::prop(&context.arena, &key, b::object(vec![])));
        }
        let props_str = b::object(props_entries);

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

        // Build shadow root init.
        // Reference: transform-client.js lines 634-642: 'open'/undefined →
        // `{ mode: 'open' }`, 'none' → omitted, ShadowRootInit object → verbatim.
        let shadow_mode = ce.shadow.as_deref().unwrap_or("open");
        let shadow_root_init = if let Some(src) = &ce.shadow_object_source {
            Some(b::raw(src.clone()))
        } else if shadow_mode == "none" {
            None
        } else {
            Some(b::object(vec![b::prop(
                &context.arena,
                "mode",
                b::string(shadow_mode),
            )]))
        };

        // $.create_custom_element(Component, props, slots, accessors, shadowRootInit, extend)
        // Missing middle arguments become `void 0` (upstream b.call, builders.js
        // lines 121-130), and trailing missing arguments are dropped.
        let mut create_ce_args = vec![b::id(&analysis.name), props_str, slots_str, accessors_str];
        if let Some(init) = shadow_root_init {
            create_ce_args.push(init);
        } else if ce.extend.is_some() {
            create_ce_args.push(b::raw("void 0"));
        }
        if let Some(extend) = &ce.extend {
            create_ce_args.push(b::raw(extend.clone()));
        }
        let create_ce = b::call(
            &context.arena,
            b::member_path(&context.arena, "$.create_custom_element"),
            create_ce_args,
        );

        // If tag name is provided, call customElements.define
        if let Some(ref tag) = ce.tag {
            body.push(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "customElements.define"),
                    vec![b::string(tag.clone()), create_ce],
                ),
            ));
        } else {
            body.push(b::stmt(&context.arena, create_ce));
        }
    }

    // Insert module-scope `var rest_excludes = new Set([...])` hoists lifted from
    // the instance script's `$.rest_props(...)` calls: immediately before the first
    // template-factory declaration, or before `export default` when none exists.
    if !rest_excludes_hoists.is_empty() {
        let insert_idx = body
            .iter()
            .position(|s| is_client_template_factory(&context.arena, s))
            .or_else(|| body.iter().position(is_export_default_stmt))
            .unwrap_or(body.len());
        for (offset, (id, init)) in rest_excludes_hoists.iter().enumerate() {
            body.insert(
                insert_idx + offset,
                JsStatement::Raw(format!("var {} = {};", id, init).into()),
            );
        }
    }

    // Create the program
    let program = JsProgram { body };

    // Generate JavaScript code from the program, optionally with source map data
    super::profile::record_assembly_after_fragment(super::profile::timer_elapsed(_assembly_start));
    let _codegen_start = super::profile::timer_start();

    // Scriptless components use the faster handwritten printer. Scripts need
    // OXC/esrap for official formatting and coordinate-aware comment placement.
    if *CLIENT_USE_OXC || ast.instance.is_some() || ast.module.is_some() {
        let converted = CLIENT_TO_OXC_ALLOCATOR.with(|cell| {
            let mut alloc = cell.borrow_mut();
            alloc.reset();
            super::js_ast::to_oxc::program_to_oxc(&program, &context.arena, &alloc).map(
                |converted| {
                    // Keep `;` empty statements: the parsed-`Raw` `;;` are real
                    // EmptyStatement nodes the official compiler output preserves.
                    let print_opts =
                        rsvelte_esrap::PrintOptions::default().with_empty_statements(true);
                    let oxc_prog = &converted.program;
                    match &converted.comment_source {
                        // The program carries comments, so it prints in the
                        // unified comment coordinate space `to_oxc` built.
                        Some(comment_source) => {
                            let map_source = options.enable_sourcemap.then_some(source);
                            let _t = super::profile::timer_start();
                            let pm = rsvelte_esrap::print_split(
                                oxc_prog,
                                comment_source,
                                converted.loc_base,
                                map_source,
                                &converted.loc_map,
                                &print_opts,
                            );
                            super::profile::record_esrap_client_split(
                                super::profile::timer_elapsed(_t),
                            );
                            (pm.code, esrap_mappings_to_source_mappings(&pm.mappings))
                        }
                        None if options.enable_sourcemap => {
                            let _t = super::profile::timer_start();
                            let pm = rsvelte_esrap::print_with_map(oxc_prog, source, &print_opts);
                            super::profile::record_esrap_client_map(super::profile::timer_elapsed(
                                _t,
                            ));
                            (pm.code, esrap_mappings_to_source_mappings(&pm.mappings))
                        }
                        None => {
                            let _t = super::profile::timer_start();
                            let code = rsvelte_esrap::print_with(oxc_prog, "", &print_opts);
                            super::profile::record_esrap_client_plain(
                                super::profile::timer_elapsed(_t),
                            );
                            (code, Vec::new())
                        }
                    }
                },
            )
        });
        if let Some((code, mappings)) = converted {
            super::profile::record_codegen(super::profile::timer_elapsed(_codegen_start));
            return Ok(CodegenResult { code, mappings });
        } else if *CLIENT_TO_OXC_DEBUG {
            // Corpus workers share one stderr and a multi-part write interleaves,
            // gluing records together; emit the whole line in one call.
            let line = format!(
                "CLIENT_TO_OXC_FALLBACK {} {}\n",
                super::js_ast::to_oxc::take_fallback_reason(),
                options.filename.as_deref().unwrap_or("?")
            );
            let _ = std::io::Write::write_all(&mut std::io::stderr().lock(), line.as_bytes());
        }
    }

    if options.enable_sourcemap {
        let r = generate_with_sourcemap(&program, source, &context.arena)
            .map_err(TransformError::CodeGen);
        super::profile::record_codegen(super::profile::timer_elapsed(_codegen_start));
        r
    } else {
        let code = generate(&program, &context.arena).map_err(TransformError::CodeGen)?;
        super::profile::record_codegen(super::profile::timer_elapsed(_codegen_start));
        Ok(CodegenResult {
            code,
            mappings: vec![],
        })
    }
}

/// Convert esrap's flat, generated-order mapping list into the
/// [`SourceMapping`] list the downstream VLQ encoder (`encode_vlq_mappings`)
/// consumes.
fn esrap_mappings_to_source_mappings(mappings: &[rsvelte_esrap::Mapping]) -> Vec<SourceMapping> {
    mappings
        .iter()
        .map(|m| SourceMapping {
            gen_line: m.gen_line,
            gen_col: m.gen_column,
            // esrap only ever maps a single source.
            source: 0,
            orig_line: m.source_line,
            orig_col: m.source_column,
            name: None,
        })
        .collect()
}

// Thread-local OXC allocator for the client `to_oxc` direct-AST print path.
// Mirrors the SSR script
// allocator pattern in `server/build.rs`: reset-and-reuse per compile so the
// buffer is retained across calls without per-call allocation.
thread_local! {
    static CLIENT_TO_OXC_ALLOCATOR: std::cell::RefCell<oxc_allocator::Allocator> =
        std::cell::RefCell::new(oxc_allocator::Allocator::default());
}

static CLIENT_USE_OXC: LazyLock<bool> =
    LazyLock::new(|| std::env::var_os("RSVELTE_CLIENT_TO_OXC").is_some());
static CLIENT_TO_OXC_DEBUG: LazyLock<bool> =
    LazyLock::new(|| std::env::var_os("RSVELTE_CLIENT_TO_OXC_DEBUG").is_some());

fn is_ascii_ident_byte(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
}

/// Rewrite `$.rest_props($$props, [<array>])` occurrences in the instance-script
/// text to `$.rest_props($$props, <id>)`, returning the module-scope hoists as
/// `(<id>, "new Set([<array>])")` pairs to emit as `var <id> = new Set([...]);`.
///
/// The `transform_props_destructuring` text helper emits the `$.rest_props(...)`
/// call inline, so the exclude array is lifted here — before codegen — and the
/// module-scope `var <id> = new Set([...])` declaration is inserted as a real
/// statement (see the insertion in `transform_client_with_visitors`) rather than
/// spliced into the final printed output. Mirrors Svelte 5.56.0 #18252. Legacy
/// `$.legacy_rest_props($$sanitized_props, [...])` calls are intentionally left
/// untouched — that runtime mutates the exclude list in its `deleteProperty` trap
/// and so cannot share a hoisted Set across instances (the upstream carve-out).
/// #18252. Legacy `$.legacy_rest_props(...)` is intentionally untouched (its
/// runtime mutates the exclude list per instance and cannot share a hoisted Set).
fn extract_rest_excludes_hoists(code: &mut String) -> Vec<(String, String)> {
    let needle = "$.rest_props($$props, [";
    if !code.contains(needle) {
        return Vec::new();
    }

    let mut hoists: Vec<(String, String)> = Vec::new();
    let mut replacements: Vec<(usize, usize, String)> = Vec::new();
    let mut search_start = 0usize;
    let mut counter: usize = 0;
    // Pre-seed conflicts with any existing `rest_excludes` identifier so we don't
    // collide with user code or a second emission site.
    let mut taken: rustc_hash::FxHashSet<String> = rustc_hash::FxHashSet::default();
    {
        let bytes = code.as_bytes();
        let mut i = 0usize;
        while let Some(pos) = code[i..].find("rest_excludes") {
            let abs = i + pos;
            let after = abs + "rest_excludes".len();
            let mut end = after;
            if end < bytes.len() && bytes[end] == b'_' {
                end += 1;
                while end < bytes.len() && bytes[end].is_ascii_digit() {
                    end += 1;
                }
            }
            let prev_ok = abs == 0 || !is_ascii_ident_byte(bytes[abs - 1]);
            if prev_ok {
                taken.insert(code[abs..end].to_string());
            }
            i = end;
        }
    }

    while let Some(rel) = code[search_start..].find(needle) {
        let call_start = search_start + rel;
        let array_open = call_start + needle.len() - 1; // points at '['
        let Some(array_close_rel) = code[array_open + 1..].find(']') else {
            break;
        };
        let array_close = array_open + 1 + array_close_rel;
        // The array must be the whole second argument: what follows `]` is either
        // the end of the call or the comma before the dev-only name argument.
        if !matches!(
            code.as_bytes().get(array_close + 1).copied(),
            Some(b')') | Some(b',')
        ) {
            search_start = array_close + 1;
            continue;
        }
        let array_text = code[array_open..=array_close].to_string(); // includes [ ... ]

        let id = loop {
            let candidate = if counter == 0 {
                "rest_excludes".to_string()
            } else {
                format!("rest_excludes_{}", counter)
            };
            counter += 1;
            if !taken.contains(&candidate) {
                taken.insert(candidate.clone());
                break candidate;
            }
        };

        hoists.push((id.clone(), format!("new Set({})", array_text)));
        replacements.push((array_open, array_close + 1, id));
        search_start = array_close + 1; // skip past `]`
    }

    // Apply replacements right-to-left to preserve byte offsets.
    for (start, end, id) in replacements.into_iter().rev() {
        code.replace_range(start..end, &id);
    }

    hoists
}

/// True when a module-scope statement is a client template-factory declaration —
/// a `var X = $.from_html(...)` / `$.from_svg(...)` / `$.from_mathml(...)` /
/// `$.from_tree(...)` / `$.with_script(...)`. The `rest_excludes` hoist is
/// inserted immediately before the first such statement so it lands right after
/// the imports / module-script preamble, matching upstream's `state.hoisted`
/// ordering. In dev the factory is wrapped in `$.add_locations(...)`, so the
/// match looks through that wrapper to the factory call it carries.
fn is_client_template_factory(arena: &super::js_ast::JsArena, stmt: &JsStatement) -> bool {
    fn callee_name<'a>(
        arena: &'a super::js_ast::JsArena,
        expr: &'a JsExpr,
    ) -> Option<(&'a str, &'a super::js_ast::nodes::JsCallExpression)> {
        let JsExpr::Call(call) = expr else {
            return None;
        };
        let JsExpr::Member(m) = arena.get_expr(call.callee) else {
            return None;
        };
        if !matches!(arena.get_expr(m.object), JsExpr::Identifier(o) if o == "$") {
            return None;
        }
        match &m.property {
            super::js_ast::nodes::JsMemberProperty::Identifier(p) => Some((p.as_str(), call)),
            _ => None,
        }
    }
    fn callee_is_factory(arena: &super::js_ast::JsArena, expr: &JsExpr) -> bool {
        let Some((name, call)) = callee_name(arena, expr) else {
            return false;
        };
        match name {
            "from_html" | "from_svg" | "from_mathml" | "from_tree" | "with_script" => true,
            "add_locations" => call
                .arguments
                .first()
                .is_some_and(|a| callee_is_factory(arena, a)),
            _ => false,
        }
    }
    match stmt {
        JsStatement::VariableDeclaration(vd) => vd
            .declarations
            .first()
            .and_then(|d| d.init)
            .is_some_and(|id| callee_is_factory(arena, arena.get_expr(id))),
        JsStatement::Raw(s) => stmt_text_has_factory(s),
        JsStatement::RawMapped { code, .. } => stmt_text_has_factory(code),
        _ => false,
    }
}

fn stmt_text_has_factory(s: &str) -> bool {
    const NEEDLES: &[&str] = &[
        "= $.from_html(",
        "= $.from_svg(",
        "= $.from_mathml(",
        "= $.from_tree(",
        "= $.with_script(",
        "= $.add_locations(",
    ];
    NEEDLES.iter().any(|n| s.contains(n))
}

/// True when a module-scope statement is the `export default` component. Used as
/// the fall-through insertion anchor for the `rest_excludes` hoist when no
/// template factory exists.
fn is_export_default_stmt(stmt: &JsStatement) -> bool {
    match stmt {
        JsStatement::ExportDefault(_) => true,
        JsStatement::Raw(s) => s.trim_start().starts_with("export default "),
        _ => false,
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
/// Drop module-`<script>`-level comments that the official compiler's esrap
/// output omits.
///
/// The client program's top-level `Program` node is synthetic (no `loc`), so
/// esrap's `reset_comment_index` fast-forwards the comment cursor past every
/// comment before the module body is printed. A module comment is therefore
/// only re-emitted if it is nested inside a `loc`-bearing block that esrap
/// re-enters via `body()` — i.e. a function or class body. Every other module
/// comment is dropped: a leading JSDoc before a surviving `export const`, and
/// the per-field JSDoc that `strip_typescript` re-emits when it removes an
/// `export type` / `interface` body (that re-emission is correct for the
/// instance script, whose statements keep their `loc` inside the component
/// block, but wrong for the module).
///
/// Mirror that here for the module non-import content: keep only comments that
/// fall inside a function/class body span; splice the rest out. Leftover blank
/// lines are absorbed by downstream normalization. Returns the input unchanged
/// on a parse failure or when there is nothing to drop.
pub(crate) fn strip_module_toplevel_comments(src: &str) -> String {
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    #[cfg(test)]
    MODULE_COMMENT_REPARSES.with(|count| count.set(count.get() + 1));
    let allocator = Allocator::default();
    let _pt = super::profile::timer_start();
    let ret = Parser::new(&allocator, src, SourceType::mjs()).parse();
    super::profile::record_direct_parse(super::profile::timer_elapsed(_pt), src.len());
    if !ret.diagnostics.is_empty() {
        return src.to_string();
    }
    strip_module_toplevel_comments_from_program(src, &ret.program)
}

#[cfg(test)]
thread_local! {
    static MODULE_COMMENT_REPARSES: std::cell::Cell<usize> = const { std::cell::Cell::new(0) };
    static AST_STATE_REPARSES: std::cell::Cell<usize> = const { std::cell::Cell::new(0) };
    static AST_STATE_RETAINED_USES: std::cell::Cell<usize> = const { std::cell::Cell::new(0) };
}

fn strip_module_toplevel_comments_from_program(
    src: &str,
    program: &oxc_ast::ast::Program<'_>,
) -> String {
    use oxc_ast::ast::{ClassBody, FunctionBody};
    use oxc_ast_visit::{Visit, walk};

    struct BodyCollector {
        spans: Vec<(u32, u32)>,
    }
    impl<'a> Visit<'a> for BodyCollector {
        fn visit_function_body(&mut self, it: &FunctionBody<'a>) {
            self.spans.push((it.span.start, it.span.end));
            walk::walk_function_body(self, it);
        }
        fn visit_class_body(&mut self, it: &ClassBody<'a>) {
            self.spans.push((it.span.start, it.span.end));
            walk::walk_class_body(self, it);
        }
    }

    debug_assert_eq!(program.source_text, src);
    if program.comments.is_empty() {
        return src.to_string();
    }

    let mut collector = BodyCollector { spans: Vec::new() };
    collector.visit_program(program);

    let mut removals: Vec<(usize, usize)> = Vec::new();
    for c in &program.comments {
        let (cs, ce) = (c.span.start, c.span.end);
        let inside = collector
            .spans
            .iter()
            .any(|(bs, be)| cs >= *bs && ce <= *be);
        if !inside {
            removals.push((cs as usize, ce as usize));
        }
    }
    if removals.is_empty() {
        return src.to_string();
    }
    removals.sort_by_key(|r| r.0);

    let mut out = String::with_capacity(src.len());
    let mut pos = 0usize;
    for (s, e) in removals {
        if s > pos {
            out.push_str(&src[pos..s]);
        }
        pos = pos.max(e);
    }
    if pos < src.len() {
        out.push_str(&src[pos..]);
    }
    out
}

/// True when `src` contains only line/block comments and whitespace — i.e. no
/// JS statements. Used to detect a comment-only module `<script module>` body,
/// which upstream parses to an empty Program and prints as nothing. The scan
/// errs toward `false` (keep the content): a string literal containing `//`
/// leaves its opening quote behind, so real code never reads as comments-only.
pub(crate) fn is_js_comments_and_whitespace_only(src: &str) -> bool {
    let bytes = src.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    while i < len {
        match bytes[i] {
            b' ' | b'\t' | b'\r' | b'\n' => i += 1,
            b'/' if i + 1 < len && bytes[i + 1] == b'/' => {
                i += 2;
                while i < len && bytes[i] != b'\n' {
                    i += 1;
                }
            }
            b'/' if i + 1 < len && bytes[i + 1] == b'*' => {
                i += 2;
                while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(len);
            }
            _ => return false,
        }
    }
    true
}

/// Cross-line string / template-literal / block-comment tracker for the
/// line-based `extract_imports`. A line is only import-eligible when it *begins*
/// in pure-code state — so an `import …` line living inside a backtick template
/// literal (e.g. a code-sample string) is not mis-hoisted as a real import.
#[derive(Default, Clone)]
struct ScanState {
    /// One entry per open template literal. `0` = in template text; `>=1` =
    /// inside a `${ }` hole, value is the brace-nesting depth.
    template_brace_depth: Vec<i32>,
    in_block_comment: bool,
}

impl ScanState {
    /// True when the start of the next line is plain code (import-eligible).
    fn in_code(&self) -> bool {
        self.template_brace_depth.is_empty() && !self.in_block_comment
    }

    /// Advance the carried state across one line. Single/double-quoted strings
    /// and `//` comments cannot cross a newline, so only template literals and
    /// block comments persist between lines.
    fn advance(&mut self, line: &str) {
        let b = line.as_bytes();
        let n = b.len();
        let mut i = 0;
        let (mut in_squote, mut in_dquote) = (false, false);
        while i < n {
            let c = b[i];
            if self.in_block_comment {
                if c == b'*' && i + 1 < n && b[i + 1] == b'/' {
                    self.in_block_comment = false;
                    i += 2;
                    continue;
                }
                i += 1;
                continue;
            }
            if in_squote {
                if c == b'\\' {
                    i += 2;
                    continue;
                }
                if c == b'\'' {
                    in_squote = false;
                }
                i += 1;
                continue;
            }
            if in_dquote {
                if c == b'\\' {
                    i += 2;
                    continue;
                }
                if c == b'"' {
                    in_dquote = false;
                }
                i += 1;
                continue;
            }
            // Inside a template literal's TEXT (top of stack == 0)?
            if matches!(self.template_brace_depth.last(), Some(0)) {
                if c == b'\\' {
                    i += 2;
                    continue;
                }
                if c == b'`' {
                    self.template_brace_depth.pop();
                    i += 1;
                    continue;
                }
                if c == b'$' && i + 1 < n && b[i + 1] == b'{' {
                    *self.template_brace_depth.last_mut().unwrap() = 1; // enter ${ } hole
                    i += 2;
                    continue;
                }
                i += 1;
                continue;
            }
            // Code mode (top level, or inside a ${ } hole).
            match c {
                b'/' if i + 1 < n && b[i + 1] == b'/' => break, // line comment to EOL
                b'/' if i + 1 < n && b[i + 1] == b'*' => {
                    self.in_block_comment = true;
                    i += 2;
                }
                b'\'' => {
                    in_squote = true;
                    i += 1;
                }
                b'"' => {
                    in_dquote = true;
                    i += 1;
                }
                b'`' => {
                    self.template_brace_depth.push(0);
                    i += 1;
                }
                b'{' => {
                    if let Some(d) = self.template_brace_depth.last_mut() {
                        *d += 1;
                    }
                    i += 1;
                }
                b'}' => {
                    if let Some(d) = self.template_brace_depth.last_mut() {
                        if *d == 1 {
                            *d = 0;
                        } else if *d > 1 {
                            *d -= 1;
                        }
                    }
                    i += 1;
                }
                _ => i += 1,
            }
        }
    }
}

pub(crate) fn extract_imports(script: &str) -> (Vec<String>, String) {
    let mut imports = Vec::new();
    let mut rest = Vec::new();
    let mut current_import: Option<Vec<String>> = None;
    let mut scan = ScanState::default();

    for line in script.lines() {
        let line_starts_in_code = scan.in_code();
        scan.advance(line);
        let scan = line_starts_in_code; // shadow for the decision below
        if let Some(ref mut import_lines) = current_import {
            let trimmed = line.trim();
            let closes = trimmed.contains(';')
                || trimmed.ends_with('\'')
                || trimmed.ends_with('"')
                || trimmed.ends_with('`');
            if closes {
                if let Some(end) = import_statement_end(trimmed)
                    && end < trimmed.len()
                    && !trimmed[end..].trim().is_empty()
                {
                    import_lines.push(trimmed[..end].to_string());
                    imports.push(import_lines.join("\n"));
                    current_import = None;
                    // The remainder may itself begin with further imports packed
                    // on the same line; peel them all before routing the rest.
                    let remainder = peel_leading_imports(&trimmed[end..], &mut imports);
                    if !remainder.trim().is_empty() {
                        rest.push(remainder);
                    }
                } else {
                    import_lines.push(line.to_string());
                    imports.push(import_lines.join("\n"));
                    current_import = None;
                }
            } else {
                import_lines.push(line.to_string());
            }
        } else {
            let trimmed = line.trim();
            if scan && (trimmed.starts_with("import ") || trimmed.starts_with("import{")) {
                // Check if this import is complete on one line
                if trimmed.contains(';')
                    || is_complete_side_effect_import(trimmed)
                    || (memmem::find(trimmed.as_bytes(), b" from ").is_some()
                        && (trimmed.ends_with('\'')
                            || trimmed.ends_with('"')
                            || trimmed.ends_with('`')))
                {
                    // The line begins with a *complete* import statement but may
                    // carry additional imports and/or statements on the same
                    // physical line (`import a from 'x';import b from 'y';` or
                    // `import x from 'm'; const a = 1;`). Peel every packed import
                    // so each is hoisted, then route any trailing non-import code
                    // through `rest` so it is transformed normally instead of
                    // being swallowed into the import string.
                    let remainder = peel_leading_imports(trimmed, &mut imports);
                    if !remainder.trim().is_empty() {
                        rest.push(remainder);
                    }
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

struct ExtractedSourcePart {
    text: String,
    source: std::ops::Range<u32>,
}

fn extract_imports_with_projection(script: &str) -> (Vec<String>, String, Vec<CopiedSourceChunk>) {
    let mut imports = Vec::new();
    let mut rest: Vec<ExtractedSourcePart> = Vec::new();
    let mut current_import: Option<Vec<String>> = None;
    let mut scan = ScanState::default();
    let mut line_start = 0usize;

    for physical_line in script.split_inclusive('\n') {
        let line = if let Some(line_without_lf) = physical_line.strip_suffix('\n') {
            line_without_lf
                .strip_suffix('\r')
                .unwrap_or(line_without_lf)
        } else {
            physical_line
        };
        let line_starts_in_code = scan.in_code();
        scan.advance(line);
        let scan = line_starts_in_code;
        if let Some(ref mut import_lines) = current_import {
            let trimmed = line.trim();
            let closes = trimmed.contains(';')
                || trimmed.ends_with('\'')
                || trimmed.ends_with('"')
                || trimmed.ends_with('`');
            if closes {
                if let Some(end) = import_statement_end(trimmed)
                    && end < trimmed.len()
                    && !trimmed[end..].trim().is_empty()
                {
                    import_lines.push(trimmed[..end].to_string());
                    imports.push(import_lines.join("\n"));
                    current_import = None;
                    let trimmed_start = line.len() - line.trim_start().len();
                    let remainder_source_start = trimmed_start + end;
                    let (remainder, remainder_offset) =
                        peel_leading_imports_ref(&trimmed[end..], &mut imports);
                    if !remainder.trim().is_empty() {
                        rest.push(ExtractedSourcePart {
                            text: remainder.to_string(),
                            source: (line_start + remainder_source_start + remainder_offset) as u32
                                ..(line_start
                                    + remainder_source_start
                                    + remainder_offset
                                    + remainder.len()) as u32,
                        });
                    }
                } else {
                    import_lines.push(line.to_string());
                    imports.push(import_lines.join("\n"));
                    current_import = None;
                }
            } else {
                import_lines.push(line.to_string());
            }
        } else {
            let trimmed = line.trim();
            if scan && (trimmed.starts_with("import ") || trimmed.starts_with("import{")) {
                if trimmed.contains(';')
                    || is_complete_side_effect_import(trimmed)
                    || (memmem::find(trimmed.as_bytes(), b" from ").is_some()
                        && (trimmed.ends_with('\'')
                            || trimmed.ends_with('"')
                            || trimmed.ends_with('`')))
                {
                    let trimmed_start = line.len() - line.trim_start().len();
                    let (remainder, remainder_offset) =
                        peel_leading_imports_ref(trimmed, &mut imports);
                    if !remainder.trim().is_empty() {
                        rest.push(ExtractedSourcePart {
                            text: remainder.to_string(),
                            source: (line_start + trimmed_start + remainder_offset) as u32
                                ..(line_start + trimmed_start + remainder_offset + remainder.len())
                                    as u32,
                        });
                    }
                } else {
                    current_import = Some(vec![line.to_string()]);
                }
            } else {
                rest.push(ExtractedSourcePart {
                    text: line.to_string(),
                    source: line_start as u32..(line_start + line.len()) as u32,
                });
            }
        }
        line_start += physical_line.len();
    }

    if let Some(import_lines) = current_import {
        imports.push(import_lines.join("\n"));
    }

    let mut output = String::new();
    let mut copied_chunks = Vec::with_capacity(rest.len().saturating_mul(2));
    for (index, part) in rest.iter().enumerate() {
        if index != 0 {
            let output_start = output.len() as u32;
            output.push('\n');
            let previous = &rest[index - 1];
            if previous.source.end + 1 == part.source.start
                && script.as_bytes().get(previous.source.end as usize) == Some(&b'\n')
            {
                push_projection_chunk(
                    &mut copied_chunks,
                    previous.source.end..part.source.start,
                    output_start..output.len() as u32,
                );
            }
        }

        let output_start = output.len() as u32;
        output.push_str(&part.text);
        push_projection_chunk(
            &mut copied_chunks,
            part.source.clone(),
            output_start..output.len() as u32,
        );
    }

    (imports, output, copied_chunks)
}

fn push_projection_chunk(
    chunks: &mut Vec<CopiedSourceChunk>,
    source: std::ops::Range<u32>,
    output: std::ops::Range<u32>,
) {
    if source.is_empty() {
        return;
    }
    debug_assert_eq!(source.end - source.start, output.end - output.start);
    if let Some(previous) = chunks.last_mut()
        && previous.source.end == source.start
        && previous.output.end == output.start
    {
        previous.source.end = source.end;
        previous.output.end = output.end;
    } else {
        chunks.push(CopiedSourceChunk { source, output });
    }
}

fn compose_script_projection(
    source_projection: &ScriptProjection,
    raw_to_body: &[CopiedSourceChunk],
    body_len: usize,
) -> ScriptProjection {
    let mut copied_chunks = Vec::new();
    let mut source_index = 0usize;
    for body_chunk in raw_to_body {
        while source_index < source_projection.copied_chunks.len()
            && source_projection.copied_chunks[source_index].output.end <= body_chunk.source.start
        {
            source_index += 1;
        }

        for source_chunk in &source_projection.copied_chunks[source_index..] {
            if source_chunk.output.start >= body_chunk.source.end {
                break;
            }
            let intersection_start = source_chunk.output.start.max(body_chunk.source.start);
            let intersection_end = source_chunk.output.end.min(body_chunk.source.end);
            if intersection_start >= intersection_end {
                continue;
            }
            let source_start =
                source_chunk.source.start + intersection_start - source_chunk.output.start;
            let output_start =
                body_chunk.output.start + intersection_start - body_chunk.source.start;
            push_projection_chunk(
                &mut copied_chunks,
                source_start..source_start + intersection_end - intersection_start,
                output_start..output_start + intersection_end - intersection_start,
            );
        }
    }

    ScriptProjection {
        copied_chunks,
        source_len: source_projection.source_len,
        output_len: body_len as u32,
    }
}

/// Check whether `trimmed` is a complete *side-effect* import statement —
/// `import "module"` or `import 'module'` with no `from` clause and no
/// terminating semicolon. ASI in real JavaScript allows this form to stand
/// alone on its own line, so it must not be merged with the following line
/// the way `extract_imports` accumulates incomplete multi-line imports.
///
/// The line is considered complete iff after `import` there is whitespace,
/// then a single string literal (single or double quoted), then optional
/// whitespace until end-of-line. Anything else (bindings, `from`, trailing
/// content, dynamic `import(...)` calls) returns `false`.
/// Find the byte index at which the leading import statement in `s` ends.
///
/// String literals (single/double quotes and template backticks) are skipped
/// honouring backslash escapes, so a `;` inside a module specifier is ignored.
/// If a top-level `;` is found it terminates the statement (index just past it).
/// Otherwise — ASI — the statement ends just past the last completed top-level
/// string literal (the module specifier). Returns `None` if neither is present.
fn import_statement_end(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut i = 0usize;
    let mut last_string_end: Option<usize> = None;
    while i < bytes.len() {
        match bytes[i] {
            b';' => return Some(i + 1),
            q @ (b'\'' | b'"' | b'`') => {
                i += 1;
                while i < bytes.len() {
                    if bytes[i] == b'\\' && i + 1 < bytes.len() {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == q {
                        i += 1;
                        break;
                    }
                    i += 1;
                }
                last_string_end = Some(i);
            }
            _ => i += 1,
        }
    }
    last_string_end
}

/// Peel every complete leading `import` statement off `s`, pushing each onto
/// `imports`, and return the remaining tail (front-trimmed).
///
/// Handles several imports packed onto one physical line, e.g.
/// `import a from 'x';import b from 'y';` → both hoisted, empty tail. Stops at
/// the first non-import token or an *incomplete* import (one that continues on a
/// following line) and returns it so the caller can route it.
fn peel_leading_imports(s: &str, imports: &mut Vec<String>) -> String {
    peel_leading_imports_ref(s, imports).0.to_string()
}

fn peel_leading_imports_ref<'a>(s: &'a str, imports: &mut Vec<String>) -> (&'a str, usize) {
    let mut offset = s.len() - s.trim_start().len();
    let mut cur = &s[offset..];
    while cur.starts_with("import ") || cur.starts_with("import{") {
        let Some(end) = import_statement_end(cur) else {
            break;
        };
        let (import_part, remainder) = cur.split_at(end);
        imports.push(import_part.trim().to_string());
        let whitespace = remainder.len() - remainder.trim_start().len();
        offset += end + whitespace;
        cur = &s[offset..];
    }
    (cur, offset)
}

fn is_complete_side_effect_import(trimmed: &str) -> bool {
    // Must start with `import ` (we already know this from the caller, but
    // re-check defensively to keep the helper standalone).
    let after_import = if let Some(rest) = trimmed.strip_prefix("import ") {
        rest.trim_start()
    } else {
        return false;
    };

    // Side-effect imports start directly with a string literal — `"…"` or `'…'`.
    let bytes = after_import.as_bytes();
    let quote = match bytes.first() {
        Some(&b'"') => b'"',
        Some(&b'\'') => b'\'',
        _ => return false,
    };

    // Walk the string literal, honouring escapes.
    let mut i = 1;
    let mut closed = false;
    while i < bytes.len() {
        match bytes[i] {
            b'\\' if i + 1 < bytes.len() => i += 2,
            c if c == quote => {
                closed = true;
                i += 1;
                break;
            }
            _ => i += 1,
        }
    }
    if !closed {
        return false;
    }

    // After the closing quote only optional whitespace is allowed for this to
    // be a *complete* side-effect import. Anything else (e.g. `from`, more
    // tokens) means we should not treat the line as complete here.
    after_import[i..].trim().is_empty()
}

/// True when `trimmed` begins an `export { ... }` specifier statement,
/// tolerating any whitespace between `export` and `{` — including none, since
/// `export{a}` is valid JavaScript (M-021). Guards against matching longer
/// identifiers (`exporter`) or other export forms (`export default`,
/// `export function`, `export const`).
fn starts_export_specifier(trimmed: &str) -> bool {
    let Some(rest) = trimmed.strip_prefix("export") else {
        return false;
    };
    match rest.chars().next() {
        Some('{') => true,
        Some(c) if c.is_whitespace() => rest.trim_start().starts_with('{'),
        _ => false,
    }
}

/// Clean up an import statement after TypeScript stripping.
/// Removes empty specifier slots (trailing commas, double commas) that result from
/// type-only specifier removal. Normalizes `import { A,  , C,  } from 'x'` to
/// `import { A, C } from 'x'`.
fn cleanup_import_line(import: &str) -> String {
    // Strip comments first. A multi-line `import { … }` may carry `//` / `/* */`
    // comments between specifiers (e.g. `ThemeSelect,\n// ThemeSwitch,\nTooltip`);
    // collapsing the import onto one line below would otherwise fold a `//`
    // comment inline and comment out the rest of the statement (including
    // `} from '…'`), emitting invalid JS. esrap drops these comments — mirror
    // that. String literals (the module specifier) are respected.
    let import = props_transforms::strip_js_comments(import);
    // Normalize whitespace (join multi-line imports into a single line)
    let single_line = import
        .lines()
        .map(|l| l.trim())
        .collect::<Vec<_>>()
        .join(" ");

    // Find the { ... } block
    if let Some(open) = single_line.find('{')
        && let Some(close_offset) = single_line[open..].find('}')
    {
        let close = open + close_offset;
        let before = &single_line[..open + 1]; // "import { " or "import Default, {"
        let specs_str = &single_line[open + 1..close];
        let after = &single_line[close..]; // "} from '...'"

        // Parse specifiers, filter out empty ones
        let specs: Vec<&str> = specs_str
            .split(',')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();

        if specs.is_empty() {
            // All specifiers were removed - check if there's a default import before the {
            let before_brace = single_line[..open].trim();
            if before_brace.starts_with("import ") {
                let after_import = before_brace.strip_prefix("import ").unwrap_or("").trim();
                if after_import.is_empty() || after_import == "," {
                    // No default import, remove entire statement
                    return String::new();
                }
                // Has a default import, remove the { } part
                let default_part = after_import.trim_end_matches(',').trim();
                let from_part = after[1..].trim(); // skip '}'
                return format!("import {} {}", default_part, from_part);
            }
        }

        return format!("{} {} {}", before.trim(), specs.join(", "), after.trim());
    }

    single_line
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
/// Collect the names declared as a local `let`/`const`/`var <name> = $state(`.
///
/// Single linear pass replacing per-name `script.contains("let <name> = $state(")`
/// scans. Byte-identical to those scans: an entry `M` is added exactly when the
/// literal `<kw> M = $state(` appears (`M` being the maximal identifier after the
/// keyword + space, immediately followed by ` = $state(`), so `set.contains(N)`
/// holds iff `<kw> N = $state(` occurs for some keyword. The keyword is matched as
/// a raw substring (no left word boundary), mirroring the original `contains`.
fn collect_local_state_decls(script: &str) -> rustc_hash::FxHashSet<&str> {
    // The only insert requires this exact suffix, so its absence settles the answer
    // without the three keyword scans below.
    if memmem::find(script.as_bytes(), b" = $state(").is_none() {
        return rustc_hash::FxHashSet::default();
    }
    let mut set: rustc_hash::FxHashSet<&str> = rustc_hash::FxHashSet::default();
    for kw in ["let ", "const ", "var "] {
        let mut from = 0;
        while let Some(rel) = script[from..].find(kw) {
            let after = from + rel + kw.len();
            let name_end = after
                + script[after..]
                    .find(|c: char| !(c.is_alphanumeric() || c == '_' || c == '$'))
                    .unwrap_or(script.len() - after);
            if name_end > after && script[name_end..].starts_with(" = $state(") {
                set.insert(&script[after..name_end]);
            }
            from = from + rel + 1;
        }
    }
    set
}

fn extract_shadowed_state_names(script: &str) -> rustc_hash::FxHashSet<String> {
    if memmem::find(script.as_bytes(), b"$state").is_none()
        && memmem::find(script.as_bytes(), b"$derived").is_none()
    {
        return rustc_hash::FxHashSet::default();
    }

    let mut top_level_non_state: rustc_hash::FxHashSet<String> = rustc_hash::FxHashSet::default();
    let mut inner_state: rustc_hash::FxHashSet<String> = rustc_hash::FxHashSet::default();
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

        let tb = trimmed.as_bytes();
        let has_rune = memmem::find(tb, b"$state(").is_some()
            || memmem::find(tb, b"$state.raw(").is_some()
            || memmem::find(tb, b"$state.frozen(").is_some()
            || memmem::find(tb, b"$derived(").is_some()
            || memmem::find(tb, b"$derived.by(").is_some();

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
/// Every identifier in `script` that is written to, found in one pass.
///
/// Replaces asking `is_variable_reassigned_in_text` once per variable, which
/// walked the whole script per variable. Both routes run the same
/// per-occurrence predicate, so the answers agree by construction.
fn index_reassigned_vars(script: &str) -> rustc_hash::FxHashSet<&str> {
    let bytes = script.as_bytes();
    let is_ident = |b: u8| b.is_ascii_alphanumeric() || b == b'_' || b == b'$';
    let mut found: rustc_hash::FxHashSet<&str> = rustc_hash::FxHashSet::default();
    let mut i = 0;
    while i < bytes.len() {
        if !is_ident(bytes[i]) || (i > 0 && is_ident(bytes[i - 1])) {
            i += 1;
            continue;
        }
        let start = i;
        while i < bytes.len() && is_ident(bytes[i]) {
            i += 1;
        }
        let name = &script[start..i];
        if !found.contains(name) && is_reassignment_at(script, start, i - start) {
            found.insert(name);
        }
    }
    found
}

/// Every identifier declared as `const <name> = $state(` (or `.raw(` /
/// `.frozen(`), found in one pass.
///
/// Matches the three `contains` calls it replaces byte for byte, including
/// their indifference to what precedes `const`: the caller's pattern was a
/// plain substring, so `aconst x = $state(` satisfied it and still does.
fn index_const_state_decls(script: &str) -> rustc_hash::FxHashSet<&str> {
    let bytes = script.as_bytes();
    let is_ident = |b: u8| b.is_ascii_alphanumeric() || b == b'_' || b == b'$';
    let mut found: rustc_hash::FxHashSet<&str> = rustc_hash::FxHashSet::default();
    for suffix in [" = $state(", " = $state.raw(", " = $state.frozen("] {
        let mut from = 0;
        while let Some(rel) = memmem::find(&bytes[from..], suffix.as_bytes()) {
            let at = from + rel;
            let mut name_start = at;
            while name_start > 0 && is_ident(bytes[name_start - 1]) {
                name_start -= 1;
            }
            if name_start < at && name_start >= 6 && &script[name_start - 6..name_start] == "const "
            {
                found.insert(&script[name_start..at]);
            }
            from = at + 1;
        }
    }
    found
}

/// Whether the identifier occupying `abs_pos .. abs_pos + var_len` is written
/// to rather than merely read.
///
/// Split out so the per-variable scan and the one-pass index below apply the
/// same predicate: an index that answered a slightly different question would
/// change the output, and the difference would be invisible in the counters.
fn is_reassignment_at(script: &str, abs_pos: usize, var_len: usize) -> bool {
    let bytes = script.as_bytes();
    let after_pos = abs_pos + var_len;
    // Check if this is a reassignment (not member mutation)
    // Look at what comes after the variable name (skip whitespace)
    let mut j = after_pos;
    while j < bytes.len() && bytes[j].is_ascii_whitespace() {
        j += 1;
    }

    if j < bytes.len() {
        let next_char = bytes[j];
        // Check for assignment operators: =, +=, -=, *=, /=, %=, etc.
        // But NOT == or => or =>{
        if next_char == b'=' {
            // Make sure it's not == or =>
            if j + 1 < bytes.len() && bytes[j + 1] != b'=' && bytes[j + 1] != b'>' {
                // Check that before the var, there's no `.` (which would mean member access)
                if abs_pos == 0 || bytes[abs_pos - 1] != b'.' {
                    // This is `x = ...` which is a declaration or reassignment.
                    // Check if it's the declaration itself (let x = $state(...))
                    // by looking backwards for `let `, `const `, or `var `
                    let before_text = &script[..abs_pos];
                    let trimmed_before = before_text.trim_end();
                    if trimmed_before.ends_with("let")
                        || trimmed_before.ends_with("const")
                        || trimmed_before.ends_with("var")
                    {
                        // This is the declaration, not a reassignment
                    } else {
                        return true;
                    }
                }
            }
        } else if (next_char == b'+'
            || next_char == b'-'
            || next_char == b'*'
            || next_char == b'/'
            || next_char == b'%'
            || next_char == b'&'
            || next_char == b'|'
            || next_char == b'^')
            && j + 1 < bytes.len()
            && bytes[j + 1] == b'='
        {
            // Compound assignment: +=, -=, *=, /=, %=, &=, |=, ^=
            if abs_pos == 0 || bytes[abs_pos - 1] != b'.' {
                return true;
            }
        } else if next_char == b'+' && j + 1 < bytes.len() && bytes[j + 1] == b'+' {
            // x++ postfix increment
            if abs_pos == 0 || bytes[abs_pos - 1] != b'.' {
                return true;
            }
        } else if next_char == b'-' && j + 1 < bytes.len() && bytes[j + 1] == b'-' {
            // x-- postfix decrement
            if abs_pos == 0 || bytes[abs_pos - 1] != b'.' {
                return true;
            }
        }
    }

    // Also check for prefix ++/-- before the variable
    if abs_pos >= 2 {
        let mut k = abs_pos - 1;
        while k > 0 && bytes[k].is_ascii_whitespace() {
            k -= 1;
        }
        if k > 0 && bytes[k] == b'+' && bytes[k - 1] == b'+' {
            return true;
        }
        if k > 0 && bytes[k] == b'-' && bytes[k - 1] == b'-' {
            return true;
        }
    }
    false
}

/// Extract local reactive variable names from script content.
/// These are variables declared with $state() or $derived() inside functions
/// (like inside $effect callbacks) that aren't tracked in analysis.root.bindings.
/// Returns Vec of (name, is_const, is_state) where is_state=true for $state vars,
/// false for $derived vars.
/// Check if a variable is reassigned (not just mutated) in the script text.
/// Reassignment: `x = expr`, `x += expr`, `x++`, `++x`, etc.
/// NOT reassignment: `x.foo = expr`, `x[0] = expr` (member mutation).
pub(super) fn is_variable_reassigned_in_text(script: &str, var_name: &str) -> bool {
    let bytes = script.as_bytes();
    let var_bytes = var_name.as_bytes();
    let var_len = var_bytes.len();

    let mut i = 0;
    while i + var_len <= bytes.len() {
        // Find occurrences of the variable name
        if let Some(pos) = memmem::find(&bytes[i..], var_bytes) {
            let abs_pos = i + pos;

            // Check word boundary before
            let before_ok = if abs_pos == 0 {
                true
            } else {
                let prev = bytes[abs_pos - 1];
                !prev.is_ascii_alphanumeric() && prev != b'_' && prev != b'$'
            };

            // Check word boundary after
            let after_pos = abs_pos + var_len;
            let after_ok = if after_pos >= bytes.len() {
                true
            } else {
                let next = bytes[after_pos];
                !next.is_ascii_alphanumeric() && next != b'_' && next != b'$'
            };

            if before_ok && after_ok && is_reassignment_at(script, abs_pos, var_len) {
                return true;
            }

            i = abs_pos + 1;
        } else {
            break;
        }
    }

    false
}

pub(super) fn extract_local_reactive_vars(script: &str) -> Vec<(String, bool, bool)> {
    if memmem::find(script.as_bytes(), b"$state").is_none()
        && memmem::find(script.as_bytes(), b"$derived").is_none()
    {
        return Vec::new();
    }

    let mut vars = Vec::new();

    // Pattern: (let|const|var) varname = $state(...) or (let|const|var) varname = $derived(...)
    // Uses cached regex for performance
    // Group 1 = declaration keyword, Group 2 = variable name
    for cap in REGEX_STATE_DERIVED_VAR.captures_iter(script) {
        if let Some(name) = cap.get(2) {
            // Determine which rune was matched ($state or $derived)
            let full_match = cap.get(0).unwrap().as_str();
            let is_state = memmem::find(full_match.as_bytes(), b"$state").is_some();
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
        let func_keyword = b"function";
        if let Some(func_pos) = memmem::find(&script.as_bytes()[search_from..], func_keyword) {
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
    // Nothing is pushed without a `$state(` on the line, so no token means no result.
    if memmem::find(script.as_bytes(), b"$state(").is_none() {
        return Vec::new();
    }
    let mut proxy_vars = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();

        // Look for patterns like: let/const/var varname = $state({ ... }) or $state([ ... ])
        if let Some(state_pos) = memmem::find(trimmed.as_bytes(), b"$state(") {
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
/// Node types for which upstream `should_proxy` returns false (→ the value is
/// NOT wrapped in `$.proxy(...)`). An Identifier whose binding resolves to one
/// of these initial node types is therefore non-proxyable.
fn is_non_proxy_node_type(nt: &str) -> bool {
    matches!(
        nt,
        "Literal"
            | "TemplateLiteral"
            | "ArrowFunctionExpression"
            | "FunctionExpression"
            | "UnaryExpression"
            | "BinaryExpression"
    )
}

pub(crate) fn transform_module_script_runes(
    script: &str,
    analysis: &ComponentAnalysis,
    dev: bool,
) -> String {
    let mut result = script.to_string();

    // Strip TypeScript generic parameters from $state<...>() and $derived<...>() calls.
    // These are type-only annotations that have no runtime meaning.
    // e.g., $state<ReturnType<typeof autoUpdate>>() → $state()
    //
    // AST-based rewrite via `strip_rune_generics_ast`. The text predecessor
    // tracked angle-bracket depth + string-literal context + the `=>` arrow
    // operator by hand to avoid mistaking `=>` for a closing `>`. The OXC
    // parser already knows about all of that, so the visitor just walks
    // CallExpressions and asks "is the callee `$state`/`$derived` with type
    // arguments?". Falls back to the original `result` when the source isn't
    // TS (generics aren't legal) or fails to parse.
    {
        let is_ts = analysis.filename.ends_with(".ts") || analysis.filename.ends_with(".svelte.ts");
        if let Some(rewritten) =
            strip_rune_generics_ast::strip_rune_generic_params_ast(&result, is_ts)
        {
            result = rewritten;
        }
    }

    // In non-dev mode, remove $inspect.trace(...) statements from module scripts.
    // Mirrors the same logic in rune_transforms.rs for instance scripts.
    if !dev {
        while let Some(pos) = memmem::find(result.as_bytes(), b"$inspect.trace(") {
            let trace_start = pos + b"$inspect.trace(".len();
            if let Some(content_end) = find_matching_paren(&result[trace_start..]) {
                let mut end = trace_start + content_end + 1;
                while end < result.len()
                    && matches!(result.as_bytes()[end], b';' | b' ' | b'\t' | b'\n' | b'\r')
                {
                    end += 1;
                }
                let mut start = pos;
                while start > 0 && matches!(result.as_bytes()[start - 1], b' ' | b'\t') {
                    start -= 1;
                }
                result = format!("{}{}", &result[..start], &result[end..]);
            } else {
                break;
            }
        }
    }

    // In non-dev mode, remove $inspect(...) and $inspect(...).with(...) calls from
    // module scripts. Mirrors CallExpression.js `transform_inspect_rune`: `if (!dev)
    // return b.empty`. The component-instance path handles this in rune_transforms.rs;
    // module scripts use this dedicated loop.
    if !dev {
        while let Some(pos) = memmem::find(result.as_bytes(), b"$inspect(") {
            let inspect_start = pos + b"$inspect(".len();
            if let Some(content_end) = find_matching_paren(&result[inspect_start..]) {
                let after_call = &result[inspect_start + content_end + 1..];
                let total_call_len = if after_call.trim_start().starts_with(".with(") {
                    let with_offset = memmem::find(after_call.as_bytes(), b".with(").unwrap();
                    let with_content_start =
                        inspect_start + content_end + 1 + with_offset + b".with(".len();
                    if let Some(with_end) = find_matching_paren(&result[with_content_start..]) {
                        with_content_start + with_end + 1 - pos
                    } else {
                        inspect_start + content_end + 1 - pos
                    }
                } else {
                    inspect_start + content_end + 1 - pos
                };
                // Remove leading whitespace on the same line
                let mut start = pos;
                while start > 0 && matches!(result.as_bytes()[start - 1], b' ' | b'\t') {
                    start -= 1;
                }
                // Consume optional trailing semicolon then newline
                let mut end = pos + total_call_len;
                while end < result.len() && result.as_bytes()[end] == b';' {
                    end += 1;
                }
                if end < result.len() && result.as_bytes()[end] == b'\n' {
                    end += 1;
                }
                result = format!("{}{}", &result[..start], &result[end..]);
            } else {
                break;
            }
        }
    }

    // Extract local reactive variable names from the module script
    // These are variables declared with $state() or $derived() inside functions
    let module_state_vars_with_const = extract_local_reactive_vars(&result);
    let module_state_vars: Vec<String> = module_state_vars_with_const
        .iter()
        .map(|(name, _, _)| name.clone())
        .collect();

    // Extract non-reactive module state vars: $state() variables that are NOT reassigned.
    // In runes mode (immutable=true), non-reassigned $state vars don't need $.state() or $.get().
    // They only get $.proxy() for objects/arrays. This mirrors the official compiler's
    // `is_state_source` (`3-transform/client/utils.js`), which gates purely on
    // `binding.reassigned` — it is applied at every scope during the visitor traversal, not
    // just the module's top-level scope. `Binding::reassigned` already reflects the true
    // reassignment analysis (not just "declared with `const`"), so this check covers both
    // top-level and function-local `let`/`const` `$state`/`$state.raw` locals alike (#2082).
    let module_non_reactive_vars: Vec<String> = if analysis.immutable {
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| {
                matches!(b.kind, BindingKind::State | BindingKind::RawState)
                    && !b.reassigned
                    && !analysis.accessors
            })
            .map(|b| b.name.clone())
            .collect()
    } else {
        Vec::new()
    };

    // `bindings` is flat across every scope, so same-named `$state` locals in
    // sibling functions collapse into one entry; such a name cannot classify
    // declarations, reads or writes by itself and must be resolved per binding.
    let ambiguous_state_names: Vec<String> = module_non_reactive_vars
        .iter()
        .filter(|name| {
            analysis.root.bindings.iter().any(|b| {
                matches!(b.kind, BindingKind::State | BindingKind::RawState)
                    && b.reassigned
                    && &b.name == *name
            })
        })
        .cloned()
        .collect();

    // Extract module proxy vars for non-reactive vars
    let module_proxy_vars = extract_proxy_vars(script);

    // Module-level bindings that must NOT be proxied when passed to `$state(x)`.
    // Mirrors upstream `should_proxy`: an Identifier resolves to its binding's
    // initial node and recurses — returning false (→ non-proxy) when the
    // initial is a function / literal / unary / binary etc. So
    // `const log_a = () => {}; let h = $state(log_a)` emits `$.state(log_a)`,
    // not `$.state($.proxy(log_a))`. `initial_is_function` (set by the scope
    // builder for arrow/function initials) and `initial_node_type` (set by the
    // Phase-2 variable_declarator visitor) together cover the cases.
    let module_non_proxy_vars: Vec<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| {
            !b.reassigned
                && b.import_source.is_none()
                && !matches!(
                    b.kind,
                    BindingKind::State
                        | BindingKind::RawState
                        | BindingKind::Derived
                        | BindingKind::Prop
                        | BindingKind::BindableProp
                        | BindingKind::StoreSub
                )
                && (b.initial_is_function
                    || b.initial_node_type
                        .as_deref()
                        .map(is_non_proxy_node_type)
                        .unwrap_or(false)
                    || (b.initial_node_type.as_deref() == Some("Identifier")
                        && b.initial_identifier_name.as_deref() == Some("undefined")))
        })
        .map(|b| b.name.clone())
        .collect();

    // Reactive module state vars = those that need $.get()/$.set()
    // (i.e. all module state vars except non-reactive ones)
    let reactive_module_state_vars: Vec<String> = module_state_vars
        .iter()
        .filter(|v| !module_non_reactive_vars.contains(v))
        .cloned()
        .collect();

    // Lower the module script's `$state*` runes in a single batched parse:
    //   * `$state.snapshot(x)` → `$.snapshot(x)`
    //   * `$state.raw(x)` / `$state.frozen(x)` → `$.state(x)` or raw value
    //   * bare `$state(x)`   → `$.state(...)` / `$.proxy(...)` / raw value
    // These three rewrites target lexically disjoint syntax, so one parse feeds
    // all three collectors instead of re-parsing the whole module script per
    // rune. Module scripts don't need dev-mode `state_snapshot_uncloneable`
    // handling. The AST visitors descend only into expression positions, so —
    // unlike the text predecessors — none of them can be tripped by the same
    // bytes inside a string / template / regex literal. On a parse failure the
    // batch is a no-op and the legacy `$state(` text loop below runs as a
    // fallback (and, on success, sees no remaining `$state(` and exits).
    {
        let is_ts = analysis.filename.ends_with(".ts") || analysis.filename.ends_with(".svelte.ts");
        if let Some(rewritten) = module_state_runes_ast::transform_module_state_runes_ast(
            &result,
            &module_non_reactive_vars,
            &ambiguous_state_names,
            &module_non_proxy_vars,
            is_ts,
        ) {
            result = rewritten;
        }
    }
    while let Some(pos) = memmem::find(result.as_bytes(), b"$state(") {
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

    // Transform $derived.by() to $.derived().
    //
    // AST-based rewrite via `derived_by_ast::transform_derived_by_ast`.
    // The text version was a bare `String::replace("$derived.by(",
    // "$.derived(")` — rewrites byte patterns regardless of lexical
    // context, so anything inside a string / template literal got
    // (incorrectly) rewritten too. The AST visitor descends only into
    // expression positions and can't make that mistake.
    {
        let is_ts = analysis.filename.ends_with(".ts") || analysis.filename.ends_with(".svelte.ts");
        if let Some(rewritten) = derived_by_ast::transform_derived_by_ast(&result, is_ts) {
            result = rewritten;
        }
    }

    // Transform $derived() to $.derived(() => expr) or $.async_derived() for async
    // Need to wrap state variable references inside the expression with $.get()
    while let Some(pos) = memmem::find(result.as_bytes(), b"$derived(") {
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
                // Apply unthunk optimization: `() => identifier()` -> `identifier`
                // This matches the official compiler's thunk() + unthunk() pattern
                let thunk_arg = crate::compiler::phases::phase3_transform::client::destructure_transforms::unthunk_string(&wrapped_content);
                result = format!(
                    "{}$.derived({}){}",
                    &result[..pos],
                    thunk_arg,
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
    if !reactive_module_state_vars.is_empty() || !ambiguous_state_names.is_empty() {
        // Collect no-proxy vars (these should NOT get proxy flag in $.set())
        // The official Svelte compiler skips the proxy flag for derived, raw_state,
        // prop, bindable_prop, and store_sub bindings (AssignmentExpression.js L136-141).
        // This includes: $derived vars (is_state=false) AND $state.raw vars (BindingKind::RawState).
        let mut derived_vars: Vec<String> = module_state_vars_with_const
            .iter()
            .filter(|(_, _, is_state)| !is_state) // is_state=false means $derived
            .map(|(name, _, _)| name.clone())
            .collect();
        // Also add $state.raw vars from bindings — they never use the proxy flag.
        for (name, &binding_idx) in &analysis.root.scope.declarations {
            if let Some(b) = analysis.root.bindings.get(binding_idx)
                && matches!(b.kind, BindingKind::RawState)
                && !derived_vars.contains(name)
            {
                derived_vars.push(name.clone());
            }
        }

        // Whole-script AST pass for assignment transforms. The
        // three helpers (simple / compound / update) visit
        // AssignmentExpression / UpdateExpression nodes throughout
        // the parsed program — VariableDeclarators are naturally
        // skipped, so we don't need a per-line declaration
        // heuristic. The symbol-identity match (PR #226) correctly
        // distinguishes the module-local state var from same-name
        // shadows.
        // Unified visitor handles simple + compound + update in
        // one parse + Semantic build per fixed-point iteration
        // (previously: three separate helpers, each doing its own
        // parse + SemanticBuilder, multiplied by up to 16 fixed-
        // point iterations apiece).
        // Combined pipeline: state-var ASSIGNMENT wraps + state-var
        // READ wraps in a single parse + SemanticBuilder. Replaces
        // the previous sequential `state_assigns_combined_ast` +
        // `wrap_state_vars_in_expr` which each did their own parse.
        // Ambiguous names must reach the visitor, which resolves each reference
        // to its own binding instead of trusting the name-keyed classification.
        let mut pipeline_state_vars = reactive_module_state_vars.clone();
        pipeline_state_vars.extend(
            ambiguous_state_names
                .iter()
                .filter(|name| module_state_vars.contains(name))
                .cloned(),
        );
        let pipeline_non_reactive_vars: Vec<String> = module_non_reactive_vars
            .iter()
            .filter(|name| !ambiguous_state_names.contains(name))
            .cloned()
            .collect();

        result = state_pipeline_ast::transform_state_pipeline_ast(
            &result,
            &pipeline_state_vars,
            &derived_vars,
            analysis.runes,
            &[],
            &pipeline_non_reactive_vars,
        )
        .unwrap_or(result);
    }

    // Lower the module script's `$effect` runes and, in dev mode, its
    // `===`/`!==` → `$.strict_equals(...)`, `console.METHOD(...)` →
    // `...$.log_if_contains_state(...)` wraps, `$.state`/`$.derived`/
    // `$.proxy` declarator `$.tag(...)` wraps, and `await X` →
    // `(await $.track_reactivity_loss(X))()` — all in a single batched
    // parse. These passes target lexically disjoint syntax (call callees /
    // binary operators / console calls / declarator inits / awaits), so one
    // parse feeds every collector instead of re-parsing the whole module
    // script per pass. The AST visitors descend only into expression
    // positions, so — unlike the text predecessors — none can be tripped by
    // the same bytes inside a string / template / regex literal. `dev` gates
    // the dev-only collectors exactly as the sequential call sites did.
    {
        let is_ts = analysis.filename.ends_with(".ts") || analysis.filename.ends_with(".svelte.ts");
        if let Some(rewritten) = module_dev_tail_ast::transform_module_dev_tail_ast(
            &result,
            dev,
            is_ts,
            analysis.runes,
            Some(analysis),
        ) {
            result = rewritten;
        }
    }

    // In dev mode, wrap class-field `$.state()`/`$.derived()`/`$.proxy()`
    // declarations with `$.tag()`/`$.tag_proxy()` (class `#field = ...` and
    // `this.field` / `this.#field` assignments, with an originally-public
    // label heuristic via paired setter detection), then a text fallback
    // for any remaining non-declarator shapes (a no-op in practice after
    // the AST passes for valid inputs). The declarator-level tag pass runs
    // in the batch above; these two cover the class-field / residual cases
    // that batch's `tag_declarator` collector intentionally skips.
    if dev {
        if let Some(rewritten) =
            tag_class_field_ast::wrap_state_derived_with_tag_class_fields_ast(&result)
        {
            result = rewritten;
        }
        result = wrap_state_derived_with_tag(&result);
    }

    result
}

/// Transform instance script content for the visitor-based code generation.
/// Handles $state, $derived, $effect, $props transformations.
/// Public wrapper around the instance-script rune-rewrite pipeline. Used by
/// the `DeclarationTag` template-tag visitor to lower a single inline
/// `{let x = $state(1)}` / `{const x = $derived(…)}` declaration through the
/// same `$state` / `$derived` / reactive-identifier rewrites the instance
/// script gets, so the synchronous form lands the same `$.state(...)` /
/// `$.derived(() => …)` / `$.get(...)` output upstream produces.
pub(crate) fn transform_instance_script_for_visitors_pub(
    script: &str,
    analysis: &ComponentAnalysis,
    dev: bool,
    reactive_import_names: &[String],
) -> String {
    // Timed like the main call site, so the script-text bucket stays the parent
    // of its five stage timers rather than missing this entry point's share.
    let _script_start = super::profile::timer_start();
    let _parent_scope = super::profile::ParentScope::new();
    let out = transform_instance_script_for_visitors(
        script,
        analysis,
        dev,
        reactive_import_names,
        might_have_comma_separated_declaration(script),
        None,
        None,
    );
    super::profile::record_script_text(super::profile::timer_elapsed(_script_start));
    super::profile::record_parent_site(true);
    out
}

/// True when a legacy-mode script contains a `$`-token that the fragile
/// text-based store / reactive-statement transforms might rewrite: `$ident`
/// (store subscription), `$:` (reactive statement label) or `$$props` /
/// `$$restProps`. A `$` followed by `{` is a template-literal interpolation
/// and never triggers those transforms.
fn legacy_script_has_dollar_token(script: &str) -> bool {
    let bytes = script.as_bytes();
    for (i, &b) in bytes.iter().enumerate() {
        if b != b'$' {
            continue;
        }
        match bytes.get(i + 1) {
            Some(&n) if n.is_ascii_alphanumeric() || n == b'_' || n == b'$' || n == b':' => {
                return true;
            }
            _ => {}
        }
    }
    false
}

fn might_have_comma_separated_declaration(script: &str) -> bool {
    let bytes = script.as_bytes();
    if memmem::find(bytes, b", ").is_none()
        && memmem::find(bytes, b",\n").is_none()
        && memmem::find(bytes, b",\t").is_none()
    {
        return false;
    }

    script.lines().any(|line| {
        let trimmed = line.trim_start();
        let declaration = trimmed
            .strip_prefix("export ")
            .map(str::trim_start)
            .unwrap_or(trimmed);
        declaration.starts_with("const ")
            || declaration.starts_with("let ")
            || declaration.starts_with("var ")
    })
}

fn instance_has_top_level_multi_declarator(ast: &Root, script: &str) -> bool {
    use crate::ast::typed_expr::JsNode;

    let Some(instance) = ast.instance.as_ref() else {
        return false;
    };
    let program = instance.content.as_node();
    let JsNode::Program { body, .. } = program.as_ref() else {
        return might_have_comma_separated_declaration(script);
    };

    ast.arena.get_js_children(*body).iter().any(|statement| {
        let declaration = match statement {
            JsNode::VariableDeclaration { declarations, .. } => Some(*declarations),
            JsNode::ExportNamedDeclaration {
                declaration: Some(declaration),
                ..
            } => match ast.arena.get_js_node(*declaration) {
                JsNode::VariableDeclaration { declarations, .. } => Some(*declarations),
                _ => None,
            },
            _ => None,
        };
        declaration.is_some_and(|declarations| ast.arena.get_js_children(declarations).len() > 1)
    })
}

/// A pass's answer read as "did it rewrite?". A borrowed result is the very
/// text the pass was handed, so the chain keeps the string it already owns
/// instead of taking a copy of it.
#[inline]
fn rewritten(out: Cow<'_, str>) -> Option<String> {
    match out {
        Cow::Borrowed(_) => None,
        Cow::Owned(text) => Some(text),
    }
}

/// Run one stage of the per-statement transform chain, so the split between a
/// stage that rewrote and one that handed its input through stays measurable.
#[inline]
fn stage<'a>(
    name: &'static str,
    input: Cow<'a, str>,
    f: impl FnOnce(Cow<'a, str>) -> Cow<'a, str>,
) -> Cow<'a, str> {
    #[cfg(feature = "measure-stmt-chain")]
    {
        let before = input.as_ptr();
        let out = f(input);
        crate::measure_stmt_chain::record(name, before, &out);
        out
    }
    #[cfg(not(feature = "measure-stmt-chain"))]
    {
        let _ = name;
        f(input)
    }
}

fn transform_instance_script_for_visitors(
    script: &str,
    analysis: &ComponentAnalysis,
    dev: bool,
    reactive_import_names: &[String],
    split_top_level_declarations: bool,
    retained_program: Option<&crate::ast::oxc_program::RetainedProgram<'_>>,
    source_projection: Option<&ScriptProjection>,
) -> String {
    super::profile::record_st_entry();
    let _entry_guard = super::profile::EntryGuard::new();
    if script.is_empty() {
        return String::new();
    }
    let original_script = script;

    // Instance imports are removed by the caller before this pipeline.
    let has_dollar = script.contains('$');
    let has_export = memmem::find(script.as_bytes(), b"export ").is_some();
    let has_comma_decl = split_top_level_declarations;
    if !has_dollar
        && !has_export
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
        return if has_comma_decl {
            crate::compiler::phases::phase3_transform::server::transform_script::split_comma_separated_declarations(
                script,
            )
        } else {
            script.to_string()
        };
    }

    let _stage = super::profile::timer_start();

    // Reset the $$array counters for this component
    // This ensures unique names across multiple $derived destructuring patterns
    SCRIPT_ARRAY_COUNTER.with(|c| c.set(0));
    ARRAY_LOOKUP_COUNTER.with(|c| c.set(0));
    // Reset the tmp counter for $state destructuring
    STATE_TMP_COUNTER.with(|c| c.set(0));
    // Reset the $$d counter for $derived destructuring
    DERIVED_TMP_COUNTER.with(|c| c.set(0));

    // Use Cow to avoid unnecessary String copies when no transformation is needed.
    // In runes mode, comments are safe to preserve (no store transforms that break on them).
    // In legacy mode, strip single-line comments to prevent braces in comments from
    // interfering with store transforms — but only when the script can actually
    // contain those transforms (store subscriptions `$x`, reactive statements `$:`,
    // `$$props` / `$$restProps` all start with `$` + identifier-char / `:`;
    // template-literal `${...}` interpolations do not count). Scripts without
    // such tokens keep their comments, matching upstream (esrap prints them
    // as leading trivia).
    // Upstream rebuilds every `$:` statement as a synthesized
    // `legacy_pre_effect(...)` call, so its comments have nothing left to
    // attach to. Everything else in the script keeps them.
    let script: std::borrow::Cow<str> = if analysis.runes || !legacy_script_has_dollar_token(script)
    {
        std::borrow::Cow::Borrowed(script)
    } else {
        std::borrow::Cow::Owned(strip_reactive_statement_comments(script))
    };

    // Transform class fields only if the script contains class definitions with runes
    let script: std::borrow::Cow<str> = if memmem::find(script.as_bytes(), b"class ").is_some()
        && (memmem::find(script.as_bytes(), b"$state").is_some()
            || memmem::find(script.as_bytes(), b"$derived").is_some())
    {
        std::borrow::Cow::Owned(transform_class_fields_client(&script))
    } else {
        script
    };

    // Split comma-separated variable declarations only if needed
    let class_transform_can_add_declarations = memmem::find(script.as_bytes(), b"class ").is_some()
        && (memmem::find(script.as_bytes(), b"$state").is_some()
            || memmem::find(script.as_bytes(), b"$derived").is_some());
    let script: std::borrow::Cow<str> = if split_top_level_declarations
        || (class_transform_can_add_declarations && might_have_comma_separated_declaration(&script))
    {
        std::borrow::Cow::Owned(crate::compiler::phases::phase3_transform::server::transform_script::split_comma_separated_declarations(&script))
    } else {
        script
    };

    let script_rest_raw = script.into_owned();

    // Strip unnecessary parentheses from arrow function expression bodies in the
    // ORIGINAL source text, before any transforms run. The official Svelte compiler
    // uses AST-based printing (esrap) which strips redundant parens automatically.
    // Our text-based transform preserves source parens, so we strip them here.
    // This must happen BEFORE transforms to avoid stripping parens from generated code
    // patterns like `() => ($.deep_read_state(...))` in $.legacy_pre_effect.
    let script_rest = if memmem::find(script_rest_raw.as_bytes(), b"=> (").is_some()
        || memmem::find(script_rest_raw.as_bytes(), b"=>(").is_some()
    {
        strip_unnecessary_arrow_body_parens(&script_rest_raw)
    } else {
        script_rest_raw
    };

    super::profile::record_st_prenormalize(super::profile::timer_elapsed(_stage));
    let _stage = super::profile::timer_start();

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
    // Uses O(text_len) identifier extraction instead of O(N*text_len) substring search.
    utils::text_retain_matching_identifiers(&script_rest, &mut state_vars);

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
    let top_level_binding_names: rustc_hash::FxHashSet<&str> = analysis
        .root
        .bindings
        .iter()
        .map(|b| b.name.as_str())
        .collect();
    let mut shadowed_local_reactive_vars: Vec<String> = Vec::new();
    // Collect non-reactive shadowed vars to add to non_reactive_state_vars later
    // (non_reactive_state_vars is declared after this loop).
    let mut non_reactive_shadowed_vars: Vec<String> = Vec::new();
    // A `const $state(...)` binding is normally non-reactive in runes mode (it can
    // never be locally reassigned, so `is_state_source` is false). But analysis
    // marks an *exported* binding as `reassigned` (upstream `ExportSpecifier`:
    // `binding.reassigned = true`), and `accessors` mode likewise forces a source
    // — in either case the binding IS a state source and must keep its
    // `$.state(...)` wrapper, so it must not be treated as non-reactive here.
    let is_reassigned_or_accessor_state = |name: &str| -> bool {
        analysis.accessors
            || analysis
                .root
                .scope
                .declarations
                .get(name)
                .and_then(|&idx| analysis.root.bindings.get(idx))
                .is_some_and(|b| b.reassigned)
    };
    // One pass each, shared by both loops below. Asking per variable walked
    // the whole script once per variable, which is where this stage's cost
    // grew faster than the script did.
    // Every read of either index happens while iterating `local_reactive_vars`, so
    // an empty list makes both whole-script passes unobservable.
    let (const_state_decls, reassigned_in_text) = if local_reactive_vars.is_empty() {
        Default::default()
    } else {
        (
            index_const_state_decls(&script_rest),
            index_reassigned_vars(&script_rest),
        )
    };
    if super::profile::index_oracle_enabled() {
        for (var, ..) in &local_reactive_vars {
            super::profile::record_index_oracle(
                reassigned_in_text.contains(var.as_str())
                    == is_variable_reassigned_in_text(&script_rest, var),
            );
            let pattern = format!("const {}", var);
            super::profile::record_index_oracle(
                const_state_decls.contains(var.as_str())
                    == (script_rest.contains(&format!("{} = $state(", pattern))
                        || script_rest.contains(&format!("{} = $state.raw(", pattern))
                        || script_rest.contains(&format!("{} = $state.frozen(", pattern))),
            );
        }
    }
    for (var, is_const, is_state) in &local_reactive_vars {
        // Skip top-level bindings - they are already handled by the analysis-based
        // state_vars and non_reactive_state_vars collections above. The text-based
        // reassignment check below only works for script-local code and misses
        // template-level reassignments (e.g., onclick={()=>count++}).
        if top_level_binding_names.contains(var.as_str()) {
            // This local reactive var shadows a top-level binding.
            // Check if the inner declaration is non-reactive (const $state, never reassigned).
            // If it is non-reactive, we should add it to non_reactive_state_vars so the
            // rune transform strips $state() to just the argument, and the AST-based
            // scope-aware transform will handle shadowing correctly.
            let is_non_reactive_shadowed = analysis.immutable
                && *is_state
                && *is_const
                && !is_reassigned_or_accessor_state(var);
            if is_non_reactive_shadowed {
                non_reactive_shadowed_vars.push(var.clone());
                // Don't add to shadowed_local_reactive_vars - the AST-based transform
                // handles the scope-aware shadowing, and the rune transform will strip
                // $state() to just the argument.
            } else {
                // It can't be added to the global state_vars (would incorrectly wrap
                // top-level references), so we'll handle it via scope-aware post-processing.
                shadowed_local_reactive_vars.push(var.clone());
            }
            continue;
        }

        // Check if this is a non-reactive $state in runes mode.
        // In runes mode (immutable=true), a $state variable is non-reactive when it's
        // not reassigned (mirrors is_state_source logic). For const vars, they can never
        // be reassigned. For let vars, check the script text for reassignment patterns.
        // $derived vars are never non-reactive (they always need $.get()).
        let is_non_reactive = if analysis.immutable && *is_state {
            if *is_const {
                !is_reassigned_or_accessor_state(var) && const_state_decls.contains(var.as_str())
            } else {
                // let/var $state: check if the variable is actually reassigned in the script.
                // Member mutations (x.foo = ...) do NOT count as reassignment.
                !reassigned_in_text.contains(var.as_str())
            }
        } else {
            false
        };
        if is_non_reactive {
            continue;
        }
        state_vars.push(var.clone());
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

    // Also add local non-reassigned $state() vars to non_reactive_state_vars in runes mode.
    // These are variables declared inside function bodies (like derived callbacks)
    // that are never reassigned (const vars, or let vars without reassignment).
    // Only apply to LOCAL vars (not in top_level_binding_names) because the text-based
    // reassignment check only sees script code, not template assignments.
    // Top-level vars are already correctly handled by the analysis-based collection above.
    if analysis.immutable {
        for (var, is_const, is_state) in &local_reactive_vars {
            // Skip top-level bindings - they're already handled above
            if top_level_binding_names.contains(var.as_str()) {
                continue;
            }
            // Only $state vars can be non-reactive; $derived always needs $.get()
            if *is_state {
                let is_not_reassigned = if *is_const {
                    // const vars are never reassigned
                    const_state_decls.contains(var.as_str())
                } else {
                    // let/var: check text for actual reassignment
                    !reassigned_in_text.contains(var.as_str())
                };
                if is_not_reassigned && !non_reactive_state_vars.contains(var) {
                    non_reactive_state_vars.push(var.clone());
                }
            }
        }
    }

    // Add non-reactive shadowed vars to non_reactive_state_vars.
    // These are inner-scope const $state() declarations that shadow a top-level
    // state/derived binding. They should be treated as non-reactive so the rune
    // transform strips $state() to just the argument value.
    for var in &non_reactive_shadowed_vars {
        if !non_reactive_state_vars.contains(var) {
            non_reactive_state_vars.push(var.clone());
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
        // Every import binding — used to decide which legacy `$:` dependency names
        // are emitted in the `$.legacy_pre_effect` deps thunk. Upstream
        // `LabeledStatement.js` includes a dependency whenever its binding is NOT
        // `kind === 'normal' && declaration_kind !== 'import'`, i.e. ALL imports
        // qualify regardless of which scope they were declared in. We must NOT
        // restrict to the instance scope: a TS component whose first imports are
        // assigned scope 0 (vs later imports at the instance scope) would
        // otherwise drop those imports from the deps thunk (e.g. an imported
        // helper `createScale(...)` called inside a `$:` block).
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| b.declaration_kind == DeclarationKind::Import)
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

    // For each prop binding that carries `legacy_indirect_bindings` (legacy
    // `<select bind:value={prop…}>` whose subtree references other variables),
    // precompute the `$.invalidate_inner_signals(() => { … })` body — the read
    // form of each indirect binding, one statement per line. This lets the
    // legacy prop-member-mutation transform wrap `prop(prop().x = v, true)` in a
    // sequence so those signals re-read, mirroring AssignmentExpression.js. Only
    // ever non-empty in legacy mode. The read form mirrors `build_getter`:
    // prop source → `name()`, store sub → `name()`, reactive state/derived →
    // `$.get(name)`, everything else → bare `name`.
    let prop_invalidate_bodies: rustc_hash::FxHashMap<String, String> = {
        use crate::compiler::phases::phase2_analyze::scope::BindingKind as BK;
        let read_form = |n: &str| -> String {
            match analysis
                .root
                .find_binding_any_scope(n)
                .and_then(|i| analysis.root.bindings.get(i))
            {
                Some(b)
                    if matches!(b.kind, BK::Prop | BK::BindableProp)
                        && utils::is_prop_source(b, analysis) =>
                {
                    format!("{}()", n)
                }
                Some(b) if matches!(b.kind, BK::StoreSub) => format!("{}()", n),
                Some(b)
                    if matches!(
                        b.kind,
                        BK::State | BK::RawState | BK::Derived | BK::LegacyReactive
                    ) =>
                {
                    format!("$.get({})", n)
                }
                _ => n.to_string(),
            }
        };
        analysis
            .root
            .bindings
            .iter()
            // Any binding (prop OR legacy state) that backs a
            // `<select bind:value>` with indirect references gets an invalidate
            // body. The prop path keys lookups by prop name; the legacy-state
            // member-mutation path (`$.mutate(options, …)`) keys by state name —
            // extra entries are simply unused by whichever path doesn't apply.
            .filter(|b| !b.legacy_indirect_bindings.is_empty())
            .map(|b| {
                let body = b
                    .legacy_indirect_bindings
                    .iter()
                    .map(|n| format!("{};", read_form(n)))
                    .collect::<Vec<_>>()
                    .join(" ");
                (b.name.clone(), body)
            })
            .collect()
    };

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

    // Name-only projections of `legacy_state_vars`, used once per top-level
    // statement by the per-statement loop below and invariant across it.
    let legacy_state_var_names: Vec<String> = legacy_state_vars
        .iter()
        .map(|(name, _, _)| name.clone())
        .collect();
    let legacy_var_state_var_names: Vec<String> = legacy_state_vars
        .iter()
        .filter(|(_, _, kind)| *kind == DeclarationKind::Var)
        .map(|(name, _, _)| name.clone())
        .collect();

    // Collect prop variable info for ownership mutation validation (dev mode only).
    // Maps prop variable name to its prop alias (the public prop name).
    let prop_mutation_vars: Vec<(String, Option<String>)> = if dev {
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp))
            .map(|b| {
                // Upstream only ever assigns `prop_alias` from a `$props()` destructuring key,
                // so legacy `export let` props report a `null` alias.
                let alias = analysis
                    .runes
                    .then(|| b.prop_alias.as_deref().unwrap_or(&b.name).to_string());
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
    let instance_scope_for_proxy = analysis.root.instance_scope_index;
    // First, collect names of bindings (state/derived/stores) that can be
    // reassigned via $.set(). If a non-proxy inner-scope binding shadows one of
    // these, treating it as non-proxy could wrongly strip the proxy flag from
    // an assignment to the reactive one (since the text-based transform can't
    // distinguish scopes). Note: Props with the same name as inner locals are
    // not a concern because Svelte disallows that naming collision.
    let reactive_mut_binding_names: rustc_hash::FxHashSet<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| {
            matches!(
                b.kind,
                BindingKind::State
                    | BindingKind::RawState
                    | BindingKind::Derived
                    | BindingKind::StoreSub
            )
        })
        .map(|b| b.name.clone())
        .collect();

    // For inner-scope bindings, we additionally require that no OTHER binding
    // with the same name exists. This prevents conflicts with function parameters
    // or other scoped bindings that the text-based transform cannot distinguish.
    let name_occurrences: rustc_hash::FxHashMap<String, usize> = {
        let mut map: rustc_hash::FxHashMap<String, usize> = rustc_hash::FxHashMap::default();
        for b in &analysis.root.bindings {
            *map.entry(b.name.clone()).or_insert(0) += 1;
        }
        map
    };

    // Names where EVERY binding of that name (across all inner scopes) has a
    // known non-proxyable initial type. This enables safe non-proxy treatment
    // even when the same local name is declared in multiple sibling scopes.
    // (`is_non_proxy_node_type` is now a module-level free fn so the module
    // transform path can share it.)
    let names_all_non_proxy: rustc_hash::FxHashSet<String> = {
        use rustc_hash::FxHashMap;
        let mut per_name: FxHashMap<String, (bool, usize)> = FxHashMap::default();
        for b in &analysis.root.bindings {
            // Only consider inner (non-top-level) non-reactive function-local bindings.
            let is_top_level = b.scope_index == 0 || b.scope_index == instance_scope_for_proxy;
            if is_top_level || b.reassigned {
                per_name.insert(b.name.clone(), (false, 0));
                continue;
            }
            if matches!(
                b.kind,
                BindingKind::State
                    | BindingKind::RawState
                    | BindingKind::Derived
                    | BindingKind::Prop
                    | BindingKind::BindableProp
                    | BindingKind::StoreSub
                    | BindingKind::Template
            ) {
                per_name.insert(b.name.clone(), (false, 0));
                continue;
            }
            if reactive_mut_binding_names.contains(&b.name) {
                per_name.insert(b.name.clone(), (false, 0));
                continue;
            }
            let ok = b
                .initial_node_type
                .as_deref()
                .map(is_non_proxy_node_type)
                .unwrap_or(false);
            let entry = per_name.entry(b.name.clone()).or_insert((true, 0));
            if !ok {
                entry.0 = false;
            }
            entry.1 += 1;
        }
        per_name
            .into_iter()
            .filter_map(|(n, (ok, cnt))| if ok && cnt > 0 { Some(n) } else { None })
            .collect()
    };

    let non_proxy_vars: Vec<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| {
            if b.reassigned {
                return false;
            }
            // Never mark a variable as non-proxy if another binding with the same
            // name is reactive (state/derived/store) — the text-based transform
            // can't distinguish between them.
            if reactive_mut_binding_names.contains(&b.name) {
                return false;
            }
            let is_top_level = b.scope_index == 0 || b.scope_index == instance_scope_for_proxy;
            // Regular non-reactive bindings with initial literal/primitive value.
            //
            // Mirror upstream `should_proxy(Identifier)`: it resolves the
            // binding's `initial` and recurses — `should_proxy(binding.initial)`.
            // That returns `false` (→ NON-proxy) ONLY when the initial is one of
            // the false-list types (literal / template literal / arrow / function
            // expression / unary / binary, or the `undefined` identifier). For any
            // other initial — CallExpression (e.g. a `$props()` call), object /
            // array literal, member access, `new`, etc. — `should_proxy` falls
            // through to `return true`, so the binding stays proxy-eligible.
            // (Marking a CallExpression-initialised binding as non-proxy wrongly
            // dropped the proxy on `let x = $state(propWithDefault)`.)
            // Gate on `initial_node_type` (the init NODE's presence) rather than
            // `b.initial` (a literal-string field that stays None for
            // BinaryExpression / ArrowFunctionExpression / UnaryExpression
            // initials). Upstream `should_proxy` resolves the binding's initial
            // *node* and recurses, returning false (→ non-proxy) for the
            // non-proxy node types regardless of whether the initial is a
            // literal. `let root = depth === 0` (BinaryExpression) and
            // `let f = () => {}` (ArrowFunctionExpression) must therefore be
            // treated as non-proxy even though their literal-string `initial`
            // is None.
            if is_top_level
                && !matches!(
                    b.kind,
                    BindingKind::State
                        | BindingKind::RawState
                        | BindingKind::Derived
                        | BindingKind::Prop
                        | BindingKind::BindableProp
                        | BindingKind::StoreSub
                )
                && b.import_source.is_none()
                && (b
                    .initial_node_type
                    .as_deref()
                    .map(is_non_proxy_node_type)
                    .unwrap_or(false)
                    || (b.initial_node_type.as_deref() == Some("Identifier")
                        && b.initial_identifier_name.as_deref() == Some("undefined")))
            {
                return true;
            }
            // Inner-scope non-reactive function-local bindings: include when the
            // name is unique across all bindings (so the text-based transform can
            // safely treat references to this name as non-proxy). Example:
            //   function onTouchStart() {
            //     const isHoverScrollbar = foo() !== undefined;
            //     stateVar = isHoverScrollbar; // -> $.set(stateVar, isHoverScrollbar)
            //   }
            if !is_top_level
                && !matches!(
                    b.kind,
                    BindingKind::State
                        | BindingKind::RawState
                        | BindingKind::Derived
                        | BindingKind::Prop
                        | BindingKind::BindableProp
                        | BindingKind::StoreSub
                        | BindingKind::Template // @const, each items, etc. handled below
                )
                && (name_occurrences.get(&b.name).copied().unwrap_or(0) == 1
                    || names_all_non_proxy.contains(&b.name))
                && let Some(ref node_type) = b.initial_node_type
            {
                match node_type.as_str() {
                    "Literal"
                    | "TemplateLiteral"
                    | "ArrowFunctionExpression"
                    | "FunctionExpression"
                    | "UnaryExpression"
                    | "BinaryExpression" => return true,
                    _ => {}
                }
            }

            // NOTE: props are intentionally NOT classified non-proxy here. Upstream
            // `should_proxy` resolves an Identifier to `binding.initial`, and for a
            // destructured prop (`let { x = 0 } = $props()`) that initial is the
            // `$props()` CallExpression — never the default value. A CallExpression
            // recurses to `return true`, so a prop reference is always proxy-eligible
            // regardless of its default's type. (Classifying props by their default
            // type wrongly dropped the proxy on `let count = $state(propWithDefault)`.)

            // Template bindings (@const declarations, let directive bindings) whose
            // initial value is a known non-proxyable primitive expression. Matches the
            // official compiler's should_proxy() tracing through template bindings.
            // Only include when the name is unique (or all same-named bindings are
            // also known non-proxyable) — otherwise the text-based transform can't
            // distinguish a template @const from a same-named function parameter.
            if matches!(b.kind, BindingKind::Template)
                && let Some(ref node_type) = b.initial_node_type
                && (name_occurrences.get(&b.name).copied().unwrap_or(0) == 1
                    || names_all_non_proxy.contains(&b.name))
            {
                match node_type.as_str() {
                    "Literal"
                    | "TemplateLiteral"
                    | "ArrowFunctionExpression"
                    | "FunctionExpression"
                    | "UnaryExpression"
                    | "BinaryExpression" => return true,
                    _ => {}
                }
            }
            false
        })
        .map(|b| b.name.clone())
        .collect();

    // Reassignment-only non-proxy list = `non_proxy_vars` PLUS props whose default
    // value is a non-proxy primitive. Upstream's `AssignmentExpression` proxy
    // decision resolves a prop Identifier to its `binding.initial` (the destructure
    // DEFAULT for `let { x = false } = $props()`), so `state = x` proxies only when
    // the default is proxy-eligible (object/array/no default), NOT for a primitive
    // default. This MUST stay separate from `non_proxy_vars`: the `$state(prop)`
    // INITIALIZER always proxies a prop read (its value is the getter call `prop()`,
    // a CallExpression), so a prop in the shared list would wrongly drop that proxy.
    let reassign_non_proxy_vars: Vec<String> = {
        let mut v = non_proxy_vars.clone();
        for b in &analysis.root.bindings {
            if b.reassigned || reactive_mut_binding_names.contains(&b.name) {
                continue;
            }
            let is_top_level = b.scope_index == 0 || b.scope_index == instance_scope_for_proxy;
            if is_top_level
                && matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp)
                && b.initial_node_type
                    .as_deref()
                    .map(is_non_proxy_node_type)
                    .unwrap_or(false)
            {
                v.push(b.name.clone());
            }
        }
        v
    };

    // Collect reactive statements to append at end (mirroring official compiler behavior
    // which appends all $: reactive statements AFTER the rest of instance body code).
    // Each entry is (assigned_vars, dependency_vars, transformed_code).
    // After collection, these are topologically sorted by dependencies before emission.
    let mut pending_reactive_statements: Vec<(Vec<String>, Vec<String>, String)> = Vec::new();
    // Source-ordinal counter for top-level `$:` statements, aligning each with its
    // Phase-2 `reactive_statement_dependencies` entry.
    let mut reactive_stmt_ordinal: usize = 0;

    // Track if we're inside a multi-line export block
    let mut in_export_block = false;

    // Accumulator for multi-line statements (borrows from script_lines, zero allocation)
    let mut accumulated_lines: Vec<&str> = Vec::new();

    // Helper closure to process accumulated lines as a complete statement
    let process_accumulated = |accumulated: &[&str],
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
                               has_legacy_export_let: bool,
                               reactive_ordinal: &mut usize| {
        if accumulated.is_empty() {
            return;
        }
        // Timed from here so the loop's own line scanning is what remains.
        let _stmt_start = super::profile::timer_start();
        let _guard = super::profile::ProcessAccumulatedGuard(_stmt_start);

        // Join all accumulated lines into a single statement
        let statement = accumulated.join("\n");
        let first_line_trimmed = accumulated[0].trim();

        // Handle $: reactive statements in legacy (non-runes) mode
        // Transform `$: c = a + b;` to `$.legacy_pre_effect(() => (...deps), () => { c(a() + b()); })`
        if !analysis.runes && first_line_trimmed.starts_with("$:") {
            let _reactive_start = super::profile::timer_start();
            let _reactive_guard = super::profile::ReactiveStmtGuard(_reactive_start);
            // Extract assignment targets and dependencies from the raw statement
            // for topological sorting (matching official compiler's order_reactive_statements)
            let _rs_deps_start = super::profile::timer_start();
            let (assigned_vars, dep_vars) = extract_reactive_statement_deps(
                &statement,
                state_vars,
                prop_assignment_transform_vars,
                store_sub_vars,
            );
            super::profile::record_rs_deps(super::profile::timer_elapsed(_rs_deps_start));

            // AST-derived ordered dependency names for THIS top-level `$:` statement
            // (Phase 2, source-ordinal aligned). Both phases count top-level `$:`
            // in source order, so the ordinal stays in sync.
            let dep_names: &[String] = analysis
                .reactive_statement_dependencies
                .get(*reactive_ordinal)
                .map(|v| v.as_slice())
                .unwrap_or(&[]);
            *reactive_ordinal += 1;
            let _rs_body_start = super::profile::timer_start();
            let transformed = transform_reactive_statement(
                &statement,
                state_vars,
                non_reactive_state_vars,
                proxy_vars,
                prop_assignment_transform_vars,
                store_sub_vars,
                import_names,
                &legacy_var_state_var_names,
                dep_names,
                analysis,
                &prop_invalidate_bodies,
            );
            super::profile::record_rs_body(super::profile::timer_elapsed(_rs_body_start));
            let _rs_assign_start = super::profile::timer_start();
            // Also apply state assignment transformations to the reactive statement body
            // This handles cases like: `$: selected ? component = Sub : component = banana`
            // where state variables are assigned inside conditional expressions.
            //
            // Unified AST pass — see Site 1 comment for rationale.
            let transformed = state_assigns_combined_ast::transform_state_assigns_ast(
                &transformed,
                state_vars,
                raw_state_vars,
                analysis.runes,
                &non_proxy_vars,
            )
            .unwrap_or(transformed);
            super::profile::record_rs_assigns(super::profile::timer_elapsed(_rs_assign_start));
            // Collect reactive statements to append at end (matching official compiler behavior
            // which appends all reactive statements after the rest of instance body code)
            let mut reactive_code = transformed;
            reactive_code.push('\n');
            pending_reactive.push((assigned_vars, dep_vars, reactive_code));
            return;
        }

        // Handle legacy export let declarations (and `export var`, which keeps
        // its `var` keyword while the initializer becomes `$.prop(...)`).
        // The first line may be a block-comment line (e.g. `/**` or `/*...*/
        // export let`), so we also check the statement text after stripping
        // any leading block comments.
        let effective_export_kw_line = {
            let mut s = first_line_trimmed;
            while s.starts_with("/*") {
                if let Some(end) = s.find("*/") {
                    s = s[end + 2..].trim_start();
                } else {
                    // Unclosed block comment — scan across accumulated lines
                    let full = statement.as_str();
                    let mut t: &str = full.trim();
                    while t.starts_with("/*") {
                        if let Some(e) = t.find("*/") {
                            t = t[e + 2..].trim_start();
                        } else {
                            t = "";
                            break;
                        }
                    }
                    s = t;
                    break;
                }
            }
            s
        };
        if has_legacy_export_let
            && (effective_export_kw_line.starts_with("export let ")
                || effective_export_kw_line.starts_with("export var "))
        {
            // Check if this is a destructured export let pattern
            let after_export_let = effective_export_kw_line[11..].trim();
            if after_export_let.starts_with('{') || after_export_let.starts_with('[') {
                // Destructured export let: flatten using extract_paths pattern
                if let Some(flattened) = transform_destructured_export_let(&statement, analysis) {
                    let flattened = if analysis.runes {
                        Cow::Owned(flattened) // AST transform handles state var wrapping
                    } else {
                        rewritten(wrap_state_vars_in_expr(
                            &flattened,
                            state_vars,
                            non_reactive_state_vars,
                            proxy_vars,
                        ))
                        .map_or(Cow::Owned(flattened), Cow::Owned)
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
                // Combined pipeline: assigns + reads in one parse.
                let _ = proxy_vars;
                state_pipeline_ast::transform_state_pipeline_ast(
                    &transformed,
                    state_vars,
                    raw_state_vars,
                    analysis.runes,
                    &non_proxy_vars,
                    non_reactive_state_vars,
                )
                .unwrap_or(transformed)
            };
            // Apply store subscription transformations to the default value expression
            // (e.g. `export let value = $page.params` becomes `$.prop(..., () => $page().params)`).
            // Only transform when the default value is wrapped in an arrow function — when
            // the default is a bare store identifier (e.g. `$foo`), it's passed as a getter
            // reference and must stay untransformed.
            let transformed = if !store_sub_vars.is_empty() && !analysis.runes {
                apply_store_reads_in_prop_default_values(&transformed, store_sub_vars)
            } else {
                transformed
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
        if starts_export_specifier(first_line_trimmed) {
            return;
        }

        // Handle `let` declarations that contain variables exported via `export { ... }`.
        // When we have `let a, b, c, d;` and `export { a, c }`, the variables `a` and `c`
        // are marked as BindableProp and need to become `$.prop()` calls.
        // We need to split the multi-declarator `let` statement and transform each declarator.
        if !analysis.runes
            && has_legacy_export_let
            && (first_line_trimmed.starts_with("let ") || first_line_trimmed.starts_with("var "))
        {
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
            if let Some(pos) = memmem::find(statement.as_bytes(), b"export ") {
                let mut s = String::with_capacity(statement.len() - 7);
                s.push_str(&statement[..pos]);
                s.push_str(&statement[pos + 7..]);
                s
            } else {
                statement
            }
        } else {
            statement
        };
        let _first_line_trimmed = first_line_trimmed
            .strip_prefix("export ")
            .unwrap_or(first_line_trimmed);

        // Transform runes ($state, $derived, $effect, $props)
        let _runes_start = super::profile::timer_start();
        let mut transformed = stage("runes", Cow::Borrowed(statement.as_str()), |t| {
            rewritten(transform_client_runes_with_skip_and_state(
                &t,
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
            ))
            .map(Cow::Owned)
            .unwrap_or(t)
        });
        super::profile::record_st_runes(super::profile::timer_elapsed(_runes_start));

        // In dev mode, if the previous output line carries a
        // `<!-- svelte-ignore state_snapshot_uncloneable -->` comment,
        // add `true` as the second argument to the `$state.snapshot()`
        // call to suppress the runtime warning. We scan the raw
        // `$state.snapshot(` shape (not the post-AST `$.snapshot(` shape)
        // because this per-statement handler runs *before*
        // `ast_state_transform::transform_state_vars_ast` renames the
        // callee — see the matching comment in
        // `rune_transforms::transform_client_runes_with_skip_and_state`
        // for the migration rationale.
        if dev && memmem::find(transformed.as_bytes(), b"$state.snapshot(").is_some() {
            let prev_has_ignore = {
                let mut found = false;
                for line in result.lines().rev() {
                    let trimmed = line.trim();
                    if trimmed.is_empty() {
                        continue;
                    }
                    if memmem::find(trimmed.as_bytes(), b"svelte-ignore").is_some()
                        && memmem::find(trimmed.as_bytes(), b"state_snapshot_uncloneable").is_some()
                    {
                        found = true;
                    }
                    break;
                }
                found
            };
            if prev_has_ignore {
                let mut new_transformed = String::new();
                let mut remaining: &str = &transformed;
                while let Some(pos) = memmem::find(remaining.as_bytes(), b"$state.snapshot(") {
                    new_transformed.push_str(&remaining[..pos]);
                    let call_start = pos + "$state.snapshot(".len();
                    if let Some(content_end) = find_matching_paren(&remaining[call_start..]) {
                        let content = &remaining[call_start..call_start + content_end];
                        let _ = write!(new_transformed, "$state.snapshot({}, true)", content);
                        remaining = &remaining[call_start + content_end + 1..];
                    } else {
                        new_transformed.push_str("$state.snapshot(");
                        remaining = &remaining[call_start..];
                    }
                }
                new_transformed.push_str(remaining);
                transformed = Cow::Owned(new_transformed);
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
                    let _ = writeln!(result, "/* $$async_noop:{} */;", vars.join(","));
                }
            }
            return;
        }

        // Transform destructure assignments targeting reactive variables into IIFE patterns.
        // This must run BEFORE transform_state_assignments and transform_member_mutations
        // because it decomposes destructure patterns into individual assignments that those
        // transforms can then process.
        // Corresponds to visit_assignment_expression in shared/assignments.js.
        // Skip if there is no reactive target (state / store / prop) to destructure against
        let transformed = stage("destructure_assignments", transformed, |t| {
            if state_vars.is_empty()
                && store_sub_vars.is_empty()
                && prop_assignment_transform_vars.is_empty()
            {
                t
            } else {
                rewritten(transform_destructure_assignments_with_props(
                    &t,
                    state_vars,
                    non_reactive_state_vars,
                    store_sub_vars,
                    prop_assignment_transform_vars,
                ))
                .map(Cow::Owned)
                .unwrap_or(t)
            }
        });

        // Transform state variable assignments to $.set()
        // In runes mode, deferred to AST-based transform after main loop.
        let transformed = if analysis.runes {
            transformed
        } else {
            // Unified AST pass — see Site 1 comment for rationale.
            let transformed = stage("state_assigns", transformed, |t| {
                state_assigns_combined_ast::transform_state_assigns_ast(
                    &t,
                    state_vars,
                    raw_state_vars,
                    analysis.runes,
                    &non_proxy_vars,
                )
                .map(Cow::Owned)
                .unwrap_or(t)
            });
            stage("store_unsub_for_state_sets", transformed, |t| {
                rewritten(wrap_store_unsub_for_state_sets(
                    &t,
                    state_vars,
                    store_sub_vars,
                ))
                .map(Cow::Owned)
                .unwrap_or(t)
            })
        };

        // Transform member mutations to $.mutate() calls (only in legacy/non-runes mode).
        // This handles patterns like `obj.self = obj` → `$.mutate(obj, obj.self = obj)`.
        // Must run AFTER transform_state_assignments (which handles direct assignments like `x = v`)
        // and BEFORE wrap_state_vars_in_expr (which will apply $.get() inside the $.mutate()).
        let transformed = stage("member_mutations", transformed, |t| {
            if !analysis.runes && !state_vars.is_empty() {
                rewritten(transform_member_mutations(
                    &t,
                    state_vars,
                    non_reactive_state_vars,
                    raw_state_vars,
                    &prop_invalidate_bodies,
                ))
                .map(Cow::Owned)
                .unwrap_or(t)
            } else {
                t
            }
        });

        // Transform prop update expressions like `x++` to `$.update_prop(x)` FIRST,
        // before transform_prop_assignments runs (which would incorrectly turn `x++` into `x(x() + 1)`)
        // and before wrap_prop_source_reads (which would turn `count` → `count()`, causing `count()++`)
        // In runes mode, deferred to AST-based transform after main loop.
        let transformed = stage("prop_update_expressions", transformed, |t| {
            if !prop_assignment_transform_vars.is_empty() && !analysis.runes {
                rewritten(transform_prop_update_expressions(
                    &t,
                    prop_assignment_transform_vars,
                ))
                .map(Cow::Owned)
                .unwrap_or(t)
            } else {
                t
            }
        });

        // Transform prop source variable reads to prop() calls BEFORE prop assignments.
        // This handles props used as function calls: `callback(args)` → `callback()(args)`.
        // Must come BEFORE transform_prop_assignments so that `callback = value` (assignment)
        // doesn't get incorrectly double-wrapped as `callback()(value)`.
        // In runes mode, deferred to AST-based transform after main loop.
        let transformed = stage("prop_source_reads", transformed, |t| {
            if !prop_assignment_transform_vars.is_empty() && !analysis.runes {
                prop_source_reads_ast::wrap_prop_source_reads_ast(
                    &t,
                    prop_assignment_transform_vars,
                    &non_bindable_prop_vars,
                )
                .map(Cow::Owned)
                .unwrap_or(t)
            } else {
                t
            }
        });

        // Transform prop assignments to prop(prop() + value) syntax
        // This handles props declared with `export let` in legacy mode
        // Note: We use prop_assignment_transform_vars which excludes RestProp bindings
        // because rest_props use $.rest_props() which returns a plain object, not getter/setter
        // In runes mode, deferred to AST-based transform after main loop.
        let transformed = stage("prop_assignments", transformed, |t| {
            if !analysis.runes {
                rewritten(transform_prop_assignments(
                    &t,
                    prop_assignment_transform_vars,
                    &non_bindable_prop_vars,
                    &prop_invalidate_bodies,
                ))
                .map(Cow::Owned)
                .unwrap_or(t)
            } else {
                t
            }
        });

        // Store transforms: skip entirely when there are no store subscriptions
        // In runes mode, deferred to AST-based transform after main loop.
        let transformed = if !store_sub_vars.is_empty()
            && !analysis.runes
            && store_sub_vars
                .iter()
                .any(|store| transformed.contains(store.as_str()))
        {
            // Filter out store_sub_vars that appear as function parameters in this statement.
            let mut filtered_store_sub_vars = Vec::new();
            let effective_store_sub_vars =
                if transformed.contains("=>") || transformed.contains("function") {
                    filtered_store_sub_vars.extend(
                        store_sub_vars
                            .iter()
                            .filter(|s| !is_function_parameter_in_statement(&transformed, s))
                            .cloned(),
                    );
                    filtered_store_sub_vars.as_slice()
                } else {
                    store_sub_vars
                };

            let transformed = stage("store_sub_calls", transformed, |t| {
                Cow::Owned(transform_store_sub_calls(&t, effective_store_sub_vars))
            });
            let transformed = stage("store_assignments", transformed, |t| {
                Cow::Owned(transform_store_assignments_client(
                    &t,
                    effective_store_sub_vars,
                    prop_assignment_transform_vars,
                    state_vars,
                    non_reactive_state_vars,
                ))
            });
            stage("store_reads", transformed, |t| {
                Cow::Owned(transform_store_reads_client(&t, effective_store_sub_vars))
            })
        } else {
            transformed
        };

        // Expand legacy destructuring declarations with state variables into tmp-based
        // individual declarations BEFORE mutable_source wrapping.
        // e.g., `let { foo, bar } = expr` -> `let tmp = expr, foo = $.mutable_source(tmp.foo), bar = tmp.bar`
        // Reference: create_state_declarators in VariableDeclaration.js
        let transformed = stage("legacy_destructure_declarations", transformed, |t| {
            if !analysis.runes && !legacy_state_vars.is_empty() {
                rewritten(transform_legacy_destructure_declarations(
                    &t,
                    &legacy_state_var_names,
                    analysis.immutable,
                    dev,
                ))
                .map(Cow::Owned)
                .unwrap_or(t)
            } else {
                t
            }
        });

        // Transform legacy state declarations to $.mutable_source() BEFORE wrapping reads.
        // This must come before wrap_state_vars_in_expr because multi-variable declarations
        // like `let a, b;` have secondary declarators (b) that are NOT preceded by `let `,
        // causing wrap_state_vars_in_expr to incorrectly wrap them as `$.get(b)`.
        // By transforming declarations first, `let a, b;` becomes:
        //   `let a = $.mutable_source();\nlet b = $.mutable_source();`
        // and then wrap_state_vars_in_expr correctly skips them since each starts with `let `.
        let transformed = stage("legacy_state_declarations", transformed, |t| {
            if !analysis.runes && !legacy_state_vars.is_empty() {
                rewritten(transform_legacy_state_declarations(
                    &t,
                    legacy_state_vars,
                    analysis.immutable,
                    dev,
                ))
                .map(Cow::Owned)
                .unwrap_or(t)
            } else {
                t
            }
        });

        // Wrap state variable reads in $.get() for ALL statements including declarations.
        // In runes mode, deferred to AST-based transform after main loop.
        let transformed = stage("state_reads", transformed, |t| {
            if analysis.runes {
                t
            } else {
                rewritten(wrap_state_vars_in_expr(
                    &t,
                    state_vars,
                    non_reactive_state_vars,
                    proxy_vars,
                ))
                .map(Cow::Owned)
                .unwrap_or(t)
            }
        });

        // Transform rest_prop member access to $$props (only in non-runes mode here;
        // in runes mode, deferred to AST-based transform after main loop)
        let transformed = stage("rest_prop_member_access", transformed, |t| {
            if !analysis.runes && !rest_prop_vars.is_empty() {
                Cow::Owned(transform_rest_prop_member_access(&t, rest_prop_vars))
            } else {
                t
            }
        });

        // Transform read-only props to $$props.propName (only in non-runes mode here;
        // in runes mode, deferred to AST-based transform after main loop).
        let transformed = stage("read_only_props", transformed, |t| {
            if !analysis.runes && !read_only_props.is_empty() {
                read_only_props_ast::transform_read_only_props_ast(&t, read_only_props)
                    .map(Cow::Owned)
                    .unwrap_or(t)
            } else {
                t
            }
        });

        // In dev mode, wrap console.METHOD() calls with $.log_if_contains_state
        // to detect when state proxies are logged directly.
        // Reference: CallExpression.js in the official Svelte compiler.
        //
        // Try the AST-based rewrite first (same helper as the module-script
        // path); fall back to the legacy text scanner only if the statement
        // fragment fails to parse standalone (rare — the parser is lenient
        // for any complete expression / statement). The AST path fixes the
        // quote-counting string-skip heuristic that the text version uses.
        let transformed = stage("console_dev", transformed, |t| {
            if dev {
                let is_ts =
                    analysis.filename.ends_with(".ts") || analysis.filename.ends_with(".svelte.ts");
                console_dev_ast::transform_console_calls_dev_fragment(&t, is_ts, Some(analysis))
                    .map(Cow::Owned)
                    .unwrap_or(t)
            } else {
                t
            }
        });

        result.push_str(&transformed);
        result.push('\n');
    };

    // Process script lines
    // Collect lines into a Vec so we can peek at the next line for continuation detection
    let script_lines: Vec<&str> = script_rest.lines().collect();
    let mut line_idx = 0;

    // Incremental depth tracking state - avoids O(n^2) re-scanning of accumulated text
    let mut depth_paren: i32 = 0;
    let mut depth_bracket: i32 = 0;
    let mut depth_brace: i32 = 0;
    let mut depth_in_string: Option<char> = None;
    let mut depth_in_block_comment: bool = false;
    let mut depth_template_interp_stack: Vec<i32> = Vec::new();

    // Pre-compute runes fast-path eligibility flags
    let runes_fastpath_eligible = analysis.runes && !dev && prop_mutation_vars.is_empty();

    super::profile::record_st_collect_vars(super::profile::timer_elapsed(_stage));
    let _stage = super::profile::timer_start();

    while line_idx < script_lines.len() {
        let line = script_lines[line_idx];
        let trimmed = line.trim();

        // Skip empty lines (but preserve them if we're accumulating)
        if trimmed.is_empty() {
            if !accumulated_lines.is_empty() {
                accumulated_lines.push(line);
                // Empty lines don't change depths (no significant chars)
            }
            line_idx += 1;
            continue;
        }

        // The statement-boundary skips below (imports, export specifiers,
        // `$props.id()` declarations) may only fire when we are NOT in the
        // middle of accumulating a multi-line statement. Otherwise a line that
        // merely *looks* like `import …` / `export { … }` while it actually
        // lives inside a multi-line template literal (e.g. a code-sample string
        // `const code = \`<script>import … from '…';</script>\``) would be
        // dropped mid-string. `accumulated_lines.is_empty()` is true only at a
        // clean statement boundary (the accumulator is cleared on completion).
        let at_statement_boundary = accumulated_lines.is_empty();

        // Skip import statements (already extracted)
        if at_statement_boundary && trimmed.starts_with("import ") {
            line_idx += 1;
            continue;
        }

        // Skip export { ... } statements (will be handled via $$exports object)
        if at_statement_boundary && starts_export_specifier(trimmed) {
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

        // Skip $props.id() declarations - they will be added as const declarations
        // in the component body. Match on the initializer being exactly
        // `$props.id()` / `$.props_id()` (whitespace-tolerant) rather than the
        // literal `= $props.id()` substring, so `let id=$props.id()` (no spaces)
        // is also skipped instead of surviving alongside the generated const. H-060.
        if at_statement_boundary
            && (trimmed.starts_with("let ")
                || trimmed.starts_with("const ")
                || trimmed.starts_with("var "))
            && trimmed
                .find('=')
                .map(|eq| trimmed[eq + 1..].trim().trim_end_matches(';').trim())
                .is_some_and(|rhs| rhs == "$props.id()" || rhs == "$.props_id()")
        {
            line_idx += 1;
            continue;
        }

        // Add line to accumulator (zero-copy borrow from script_lines)
        accumulated_lines.push(line);

        // Incrementally update depth counters (only scans this new line, not the whole buffer)
        update_expression_depths(
            line,
            &mut depth_paren,
            &mut depth_bracket,
            &mut depth_brace,
            &mut depth_in_string,
            &mut depth_in_block_comment,
            &mut depth_template_interp_stack,
        );

        // Check if we have a complete statement (balanced braces/parens)
        if !is_expression_incomplete(
            depth_paren,
            depth_bracket,
            depth_brace,
            &depth_in_string,
            depth_in_block_comment,
            &depth_template_interp_stack,
        ) {
            // Check for trailing comma in variable declarations (multi-declarator continuation)
            let first_trimmed_line = accumulated_lines[0].trim();
            let is_var_decl = first_trimmed_line.starts_with("let ")
                || first_trimmed_line.starts_with("const ")
                || first_trimmed_line.starts_with("var ");
            // The current line (trimmed) is always the last accumulated line,
            // so checking its trailing char is equivalent to checking the full text's trailing char.
            // Strip a trailing line comment first: its text can end in an
            // operator-looking char (e.g. `export let w = 768; // md+` ends in
            // `+`), which would otherwise be misread as a continuation operator
            // and merge the next statement. Comments are not always stripped
            // upstream (only when the legacy script carries a `$`-token), so this
            // path must be comment-robust on its own. Strings are respected.
            let trimmed = match props_transforms::find_line_comment_position(trimmed) {
                Some(pos) => trimmed[..pos].trim_end(),
                None => trimmed,
            };
            let trailing_comma = is_var_decl && trimmed.ends_with(',');

            // Check if the current trimmed line ends with a binary/assignment operator,
            // indicating the expression continues on the next line.
            // e.g., `$: overflow_has_selected_tab =\n\thandle_overflow_has_selected_tab(...)`
            // Only check the most unambiguous operators to avoid false positives
            // (e.g., `*/` ending a JSDoc comment, or `}` ending a block).
            let trailing_operator = {
                let t = trimmed.trim_end_matches(';');
                (t.ends_with('=')
                    && !t.ends_with("==")
                    && !t.ends_with("!=")
                    && !t.ends_with("<=")
                    && !t.ends_with(">="))
                    || t.ends_with("&&")
                    || t.ends_with("||")
                    // An arrow's body always follows, so `=>` never ends a statement.
                    || t.ends_with("=>")
                    // Ternary `?` (and nullish `??`, a superset) continuation:
                    // a line ending with a bare `?` is always a dangling ternary
                    // operator whose consequent follows on the next line. This
                    // happens when a `// comment` between `?` and the consequent
                    // is stripped (legacy mode), e.g.
                    //   ? // @ts-expect-error
                    //     isSame(date, selected.from ?? selected.to)
                    // becomes a line ending in `?`. Valid JS never ends a
                    // statement with a bare `?`, so this is safe.
                    || t.ends_with('?')
                    // Binary `+` continuation: line ends with `+ ` (i.e., `+` not as part of `++`)
                    || (t.ends_with('+') && !t.ends_with("++"))
            };

            // A brace-less control-flow header (`$: if (cond)`, `else`, `for(...)`,
            // `while(...)`, `do`) whose body is on the FOLLOWING line is not yet a
            // complete statement — its body statement must be accumulated with it.
            // Otherwise `$: if (cond)\n\tstmt` splits `stmt` off as a separate
            // top-level statement, dropping the guard and the reactive wrapper.
            let ends_with_control_header = {
                let mut acc = accumulated_lines[..accumulated_lines.len() - 1].join("\n");
                if !acc.is_empty() {
                    acc.push('\n');
                }
                acc.push_str(trimmed);
                expression_utils::ends_with_braceless_control_header(&acc)
            };

            if !trailing_comma && !trailing_operator && !ends_with_control_header {
                // Before processing, check if the next non-empty line starts with a
                // continuation token (`.` for method chains, `?`, `:`, `&&`, `||`,
                // `??` for ternary/logical continuation). Example:
                //   $: prev_obj =
                //       cond
                //           ? "a"
                //           : "b";
                // The `cond` line by itself looks balanced, but the next line starts
                // with `?`, so the expression continues.
                let mut next_continues = false;
                for future_line in script_lines.iter().skip(line_idx + 1) {
                    let future_trimmed = future_line.trim();
                    if future_trimmed.is_empty() {
                        continue;
                    }
                    let first_char = future_trimmed.chars().next().unwrap();
                    if matches!(first_char, '.' | '?' | ':')
                        || future_trimmed.starts_with("&&")
                        || future_trimmed.starts_with("||")
                        || future_trimmed.starts_with("??")
                    {
                        next_continues = true;
                    }
                    break;
                }

                if !next_continues {
                    // Runes fast-path: skip process_accumulated entirely when no transforms apply
                    if runes_fastpath_eligible {
                        let statement = accumulated_lines.join("\n");
                        let stmt_trimmed = statement.trim();
                        let needs_rune = statement.contains('$');
                        let needs_export = stmt_trimmed.starts_with("export ");
                        let needs_destructure = (statement.contains('[')
                            || statement.contains('{'))
                            && statement.contains('=')
                            && (!state_vars.is_empty() || !store_sub_vars.is_empty());

                        if !needs_rune && !needs_export && !needs_destructure {
                            result.push_str(&statement);
                            result.push('\n');
                            accumulated_lines.clear();
                            // Reset depth counters for next statement
                            depth_paren = 0;
                            depth_bracket = 0;
                            depth_brace = 0;
                            depth_in_string = None;
                            depth_in_block_comment = false;
                            depth_template_interp_stack.clear();
                            line_idx += 1;
                            continue;
                        }
                    }

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
                        &mut reactive_stmt_ordinal,
                    );
                    accumulated_lines.clear();
                    // Reset depth counters for next statement
                    depth_paren = 0;
                    depth_bracket = 0;
                    depth_brace = 0;
                    depth_in_string = None;
                    depth_in_block_comment = false;
                    depth_template_interp_stack.clear();
                }
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
            &mut reactive_stmt_ordinal,
        );
    }

    super::profile::record_st_line_loop(super::profile::timer_elapsed(_stage));
    let _stage = super::profile::timer_start();

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

    // AST-based transforms for runes mode.
    // Replaces text-based transform_state_assignments, wrap_state_vars_in_expr,
    // prop transforms, store transforms, read-only props, and rest-prop transforms
    // with a single OXC parse + AST walk, eliminating O(M*N) text scanning.
    if analysis.runes {
        // The AST pass also rewrites the `$effect` rune family and the
        // `$state(…)` / `$state.raw(…)` / `$state.frozen(…)` rune
        // declarators (all formerly handled by the text pipeline). A
        // component can use these runes without producing any *top-level*
        // state/prop/store binding — e.g. when every `$state(...)`
        // declaration is in a *nested* scope (function body) shadowing an
        // outer name. In that case `state_vars` collected from analysis
        // is empty even though the script contains runes that the AST
        // pass must rewrite. Probe the script bytes for `$effect` /
        // `$state` so we still enter the AST pass in those cases.
        let has_effect_calls = !store_sub_vars.iter().any(|v| v == "$effect")
            && memmem::find(result.as_bytes(), b"$effect").is_some();
        let has_state_calls = !store_sub_vars.iter().any(|v| v == "$state")
            && memmem::find(result.as_bytes(), b"$state").is_some();
        let has_derived_calls = !store_sub_vars.iter().any(|v| v == "$derived")
            && memmem::find(result.as_bytes(), b"$derived").is_some();
        let has_props_calls = !store_sub_vars.iter().any(|v| v == "$props")
            && memmem::find(result.as_bytes(), b"$props").is_some();
        let has_host_calls = !store_sub_vars.iter().any(|v| v == "$host")
            && memmem::find(result.as_bytes(), b"$host").is_some();
        // Dev-mode equality rewrite is now part of the AST pass
        // (replaces `transform_strict_equals` from rune_transforms.rs).
        let has_strict_equals = dev && strict_equals_ast::source_has_equality_op(&result);
        // Dev-mode `await X` → `(await $.track_reactivity_loss(X))()` rewrite.
        let has_await = dev && memmem::find(result.as_bytes(), b"await").is_some();
        // Dev-mode `$inspect(...)` → `$.inspect(...)`; see the matching probe in
        // `ast_state_transform`. This block already sits under `analysis.runes`.
        let has_inspect = dev && inspect_rune_ast::source_has_inspect_rune(&result);
        let has_transforms = !state_vars.is_empty()
            || !prop_assignment_transform_vars.is_empty()
            || !store_sub_vars.is_empty()
            || !read_only_props.is_empty()
            || !rest_prop_vars.is_empty()
            || has_effect_calls
            || has_state_calls
            || has_derived_calls
            || has_props_calls
            || has_host_calls
            || has_strict_equals
            || has_await
            || has_inspect;

        if has_transforms {
            // Collect $derived / $derived.by binding names so AST assignment transforms
            // can skip proxy wrapping on these (mirrors `binding.kind !== 'derived'` in JS).
            // Exclude any name that is re-declared as a local $state() somewhere in the
            // script — those inner shadowing declarations still need proxy on assignment.
            // Names re-declared as a local `let/const/var <name> = $state(...)`.
            // Precomputed in a single pass so the per-derived shadow check below is
            // an O(1) set lookup instead of three full-script `contains` scans per
            // binding — the latter was O(derived_count × script_len) and dominated
            // transform time on derived-heavy components.
            let shadowed_state = collect_local_state_decls(&script_rest);
            let derived_vars: Vec<String> = analysis
                .root
                .scope
                .declarations
                .iter()
                .filter_map(|(name, &binding_idx)| {
                    if let Some(b) = analysis.root.bindings.get(binding_idx)
                        && matches!(b.kind, BindingKind::Derived)
                    {
                        // Skip names shadowed by an inner local $state() declaration.
                        if shadowed_state.contains(name.as_str()) {
                            return None;
                        }
                        return Some(name.clone());
                    }
                    None
                })
                .collect();
            let ast_config = ast_state_transform::AstTransformConfig {
                state_vars: &state_vars,
                non_reactive_vars: &non_reactive_state_vars,
                raw_state_vars: &raw_state_vars,
                derived_vars: &derived_vars,
                non_proxy_vars: &non_proxy_vars,
                reassign_non_proxy_vars: &reassign_non_proxy_vars,
                is_runes: true,
                dev,
                analysis_source: Some(&analysis.source),
                filename: Some(analysis.filename.as_str()),
                prop_source_vars: &prop_source_vars,
                prop_assignment_transform_vars: &prop_assignment_transform_vars,
                non_bindable_prop_vars: &non_bindable_prop_vars,
                store_sub_vars: &store_sub_vars,
                read_only_props: &read_only_props,
                rest_prop_vars: &rest_prop_vars,
                analysis: Some(analysis),
                exported_names: &exported_names,
            };
            let mut used_retained = false;
            let ast_result = retained_program.and_then(|program| {
                let retained_core = original_script.trim();
                let result_core = result.trim();
                if retained_core != result_core {
                    return None;
                }
                let result_core_start = result.find(result_core).unwrap_or(0);
                let result_core_end = result_core_start + result_core.len();
                let prefix = &result[..result_core_start];
                let suffix = &result[result_core_end..];

                let transformed = if let Some(projection) = source_projection {
                    let projection_core_start =
                        original_script.len() - original_script.trim_start().len();
                    let projection_core_end = projection_core_start + original_script.trim().len();
                    let counters = AstStateCounterSnapshot::capture();
                    match ast_state_transform::transform_state_vars_ast_projected_from_program(
                        program.source(),
                        program.program(),
                        result_core,
                        projection,
                        projection_core_start..projection_core_end,
                        &ast_config,
                    ) {
                        Ok(Some(transformed)) => Some(transformed),
                        Ok(None) => {
                            counters.restore();
                            None
                        }
                        Err(()) => {
                            counters.restore();
                            return None;
                        }
                    }
                } else {
                    let mut retained_matches = program.source().match_indices(retained_core);
                    let (retained_core_start, _) = retained_matches.next()?;
                    if retained_matches.next().is_some() {
                        return None;
                    }
                    let retained_core_end = retained_core_start + retained_core.len();
                    ast_state_transform::transform_state_vars_ast_range_from_program(
                        program.source(),
                        program.program(),
                        result_core,
                        retained_core_start..retained_core_end,
                        &ast_config,
                    )
                };

                used_retained = true;
                #[cfg(test)]
                AST_STATE_RETAINED_USES.with(|count| count.set(count.get() + 1));
                transformed.map(|transformed| {
                    let mut output =
                        String::with_capacity(prefix.len() + transformed.len() + suffix.len());
                    output.push_str(prefix);
                    output.push_str(&transformed);
                    output.push_str(suffix);
                    output
                })
            });
            let ast_result = if used_retained {
                ast_result
            } else {
                #[cfg(test)]
                {
                    AST_STATE_REPARSES.with(|count| count.set(count.get() + 1));
                }
                ast_state_transform::transform_state_vars_ast(&result, &ast_config)
            };
            if let Some(ast_result) = ast_result {
                result = ast_result;
            }
            // Apply store_unsub wrapping after AST transform (searches for $.set patterns)
            if !store_sub_vars.is_empty()
                && let Some(wrapped) = rewritten(wrap_store_unsub_for_state_sets(
                    &result,
                    &state_vars,
                    &store_sub_vars,
                ))
            {
                result = wrapped;
            }
            // The post-AST `wrap_state_derived_with_tag(&result)` pass that
            // used to tag AST-emitted `$.state(...)` / `$.derived(...)`
            // declarations is no longer needed: the AST declarator handlers
            // (`try_rewrite_state_call_declarator`,
            // `try_rewrite_state_raw_or_frozen_declarator`,
            // `try_rewrite_derived_call_declarator`,
            // `try_rewrite_derived_by_declarator`) now fold the
            // `$.tag(...)` / `$.tag_proxy(...)` wrap into their own emit via
            // `maybe_tag_declarator`. The per-statement
            // `wrap_state_derived_with_tag` call in
            // `transform_client_runes_with_skip_and_state` still tags
            // declarations that come out of the *text* pipeline
            // (destructuring helpers, class-field rewrites, etc.).
        }
    }

    super::profile::record_st_ast_transforms(super::profile::timer_elapsed(_stage));
    let _stage = super::profile::timer_start();

    // Post-processing: transform shadowed local reactive vars within their enclosing function bodies.
    // These are state variables declared inside nested functions that share names with
    // top-level bindings. They're not in state_vars (to avoid incorrectly transforming
    // top-level references), so neither text-based nor AST-based transforms handle them.
    // This must run regardless of runes mode.
    if !shadowed_local_reactive_vars.is_empty() {
        result = transform_shadowed_local_state_vars(&result, &shadowed_local_reactive_vars);
    }

    // Must run after the runes AST pass: it matches the post-transform `prop()` getter
    // form, which does not exist yet while the per-statement pipeline is still running.
    // Reference: validate_mutation() in shared/utils.js
    if !prop_mutation_vars.is_empty() {
        result = wrap_prop_mutation_validation(&result, &prop_mutation_vars, &analysis.source);
    }

    // Dev-mode equality / `await` instrumentation for legacy components. Upstream
    // runs one visitor map over both modes; here the runes half rides inside the
    // `analysis.runes` AST pass above, so legacy needs its own entry point. It goes
    // last so the operands it copies are the settled, already-wrapped ones.
    if dev
        && !analysis.runes
        && let Some(instrumented) =
            instance_dev_tail_ast::transform_legacy_instance_dev_tail_ast(&result, Some(analysis))
    {
        result = instrumented;
    }

    if dev
        && let Some(instrumented) =
            instance_dev_tail_ast::transform_instance_dev_assign_tail(&result, analysis)
    {
        result = instrumented;
    }

    super::profile::record_st_post_passes(super::profile::timer_elapsed(_stage));

    result
}

/// Strip unnecessary parentheses from arrow function expression bodies.
///
/// Transforms `=> (expr)` to `=> expr` when `expr` is not an object literal `{...}`.
/// This matches the official Svelte compiler behavior where esrap strips redundant parens.
///
/// All non-ASCII (multibyte UTF-8) content is preserved verbatim via range slicing —
/// bytes are only used for ASCII pattern detection, never for character-by-character copying.
fn strip_unnecessary_arrow_body_parens(code: &str) -> String {
    let bytes = code.as_bytes();
    let mut result = String::with_capacity(code.len());
    let mut i = 0;

    while i < bytes.len() {
        // Skip string/template literals: their content must not be modified.
        // Arrow patterns inside template literal raw segments are string values, not JS code.
        // Use range slicing (&code[start..end]) so multibyte UTF-8 chars are copied intact.
        if bytes[i] == b'\'' || bytes[i] == b'"' {
            let quote = bytes[i];
            let lit_start = i;
            i += 1; // skip opening quote
            while i < bytes.len() {
                if bytes[i] == b'\\' {
                    i += 2; // skip escaped char (always ASCII in escape sequences)
                } else if bytes[i] == quote {
                    i += 1; // include closing quote
                    break;
                } else {
                    i += 1;
                }
            }
            result.push_str(&code[lit_start..i]);
            continue;
        }
        // Skip template literals completely (raw segments and ${} interpolations alike).
        // Arrow patterns inside a template literal are raw string data — not JS code — so
        // paren-stripping must not touch them.  ${} interpolations inside the template
        // are not processed by this pass either; they receive the correct generated form
        // from the upstream code-gen and do not need paren-stripping.
        if bytes[i] == b'`' {
            let lit_start = i;
            i += 1; // skip opening backtick
            let mut tpl_depth: u32 = 0; // nesting depth of ${} interpolations
            while i < bytes.len() {
                if bytes[i] == b'\\' {
                    i += 2; // skip escaped char
                    continue;
                }
                if bytes[i] == b'$' && i + 1 < bytes.len() && bytes[i + 1] == b'{' {
                    tpl_depth += 1;
                    i += 2;
                    continue;
                }
                if bytes[i] == b'}' && tpl_depth > 0 {
                    tpl_depth -= 1;
                    i += 1;
                    continue;
                }
                if bytes[i] == b'`' && tpl_depth == 0 {
                    i += 1; // include closing backtick
                    break;
                }
                i += 1;
            }
            result.push_str(&code[lit_start..i]);
            continue;
        }

        // Look for "=> (" or "=>(" patterns (with or without space)
        let (matched, paren_start, match_len) = if i + 4 <= bytes.len()
            && bytes[i] == b'='
            && bytes[i + 1] == b'>'
            && bytes[i + 2] == b' '
            && bytes[i + 3] == b'('
        {
            (true, i + 3, 4)
        } else if i + 3 <= bytes.len()
            && bytes[i] == b'='
            && bytes[i + 1] == b'>'
            && bytes[i + 2] == b'('
        {
            (true, i + 2, 3)
        } else {
            (false, 0, 0)
        };

        if matched {
            let after_paren = paren_start + 1;
            if after_paren < bytes.len() {
                let first_char = bytes[after_paren];
                // If the body starts with '{', it could be an object literal - keep parens
                // Also keep parens if the paren is immediately followed by ')' (empty parens)
                if first_char == b'{' || first_char == b')' {
                    result.push_str(&code[i..i + match_len]);
                    i += match_len;
                    continue;
                }

                // Find the matching closing paren
                if let Some(close_pos) = find_matching_paren_bytes(bytes, paren_start) {
                    // Verify the expression is complete at the close paren:
                    // After the `)`, the next non-whitespace should be something that
                    // terminates the arrow body (`,`, `;`, `}`, `)`, newline, or EOF)
                    let after_close = &code[close_pos + 1..];
                    let next_char = after_close.chars().next();
                    let is_end = match next_char {
                        None => true,
                        Some(c) => matches!(c, ',' | ';' | '}' | ')' | ']' | '\n' | '\r'),
                    };
                    // Check if the inner expression contains a top-level comma
                    // (sequence expression). If so, keep the parens because they
                    // are semantically required.
                    let inner = &code[after_paren..close_pos];
                    let has_top_level_comma = has_top_level_comma_in_expr(inner.as_bytes());
                    if is_end && !has_top_level_comma {
                        // Strip the parens: output "=> " + inner + skip the close paren
                        result.push_str("=> ");
                        result.push_str(inner);
                        i = close_pos + 1;
                        continue;
                    }
                }
            }
        }
        // Copy one byte (always ASCII at this point: multibyte chars are handled by the
        // string/template-literal branches above, and the pattern characters => ( are ASCII).
        // However, to be safe against any non-ASCII byte reaching here, use a char-aware copy.
        let ch_len = code[i..].chars().next().map_or(1, |c| c.len_utf8());
        result.push_str(&code[i..i + ch_len]);
        i += ch_len;
    }
    result
}

/// Check if an expression (as bytes) contains a top-level comma operator.
/// Top-level means not nested inside any `()`, `[]`, `{}`, or string/template literal.
fn has_top_level_comma_in_expr(bytes: &[u8]) -> bool {
    let mut depth = 0;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b',' if depth == 0 => return true,
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' if depth > 0 => {
                depth -= 1;
            }
            b'\'' => {
                i += 1;
                while i < bytes.len() && bytes[i] != b'\'' {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
            }
            b'"' => {
                i += 1;
                while i < bytes.len() && bytes[i] != b'"' {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
            }
            b'`' => {
                i += 1;
                let mut tpl_depth = 0;
                while i < bytes.len() {
                    if bytes[i] == b'\\' {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == b'$' && i + 1 < bytes.len() && bytes[i + 1] == b'{' {
                        tpl_depth += 1;
                        i += 2;
                        continue;
                    }
                    if bytes[i] == b'}' && tpl_depth > 0 {
                        tpl_depth -= 1;
                        i += 1;
                        continue;
                    }
                    if bytes[i] == b'`' && tpl_depth == 0 {
                        break;
                    }
                    i += 1;
                }
            }
            _ => {}
        }
        i += 1;
    }
    false
}

/// Find the matching closing parenthesis for an opening paren in a byte slice.
/// Returns the byte index of the closing ')' or None if not found.
/// Handles nested parens, brackets, braces, and string/template literals.
fn find_matching_paren_bytes(bytes: &[u8], open_pos: usize) -> Option<usize> {
    let mut depth = 1;
    let mut i = open_pos + 1;
    while i < bytes.len() && depth > 0 {
        match bytes[i] {
            b'(' | b'[' => depth += 1,
            b')' | b']' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            b'{' => depth += 1,
            b'}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i); // shouldn't happen for matching ()
                }
            }
            b'\'' => {
                i += 1;
                while i < bytes.len() && bytes[i] != b'\'' {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
            }
            b'"' => {
                i += 1;
                while i < bytes.len() && bytes[i] != b'"' {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
            }
            b'`' => {
                i += 1;
                let mut tpl_depth = 0;
                while i < bytes.len() {
                    if bytes[i] == b'\\' {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == b'$' && i + 1 < bytes.len() && bytes[i + 1] == b'{' {
                        tpl_depth += 1;
                        i += 2;
                        continue;
                    }
                    if bytes[i] == b'}' && tpl_depth > 0 {
                        tpl_depth -= 1;
                        i += 1;
                        continue;
                    }
                    if bytes[i] == b'`' && tpl_depth == 0 {
                        break;
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

/// Transform shadowed local reactive variables within their enclosing function bodies.
///
/// When a `$state()` or `$derived()` variable inside a nested function has the same name
/// as a top-level binding, the global text-based transform cannot handle it. This function
/// finds each function body containing such a declaration and applies `$.get()`, `$.set()`,
/// `$.update()` transforms only within that scope.
fn transform_shadowed_local_state_vars(script: &str, shadowed_vars: &[String]) -> String {
    let mut result = script.to_string();
    // Every top-level rune binding lands in `shadowed_vars`, so probing the
    // twelve declaration shapes with a `find` per variable ran
    // O(shadowed_count × script_len) and dominated transform time on rune-heavy
    // components. One indexing pass yields the same first-match offsets;
    // it is refreshed whenever a transform rewrites `result`.
    let mut decls = index_shadowed_decls(&result);

    for var in shadowed_vars {
        // Shapes are probed in order and each one searches the *current*
        // `result`, so the index is refreshed as soon as a rewrite lands.
        for shape in 0..SHADOWED_DECL_SHAPE_COUNT {
            let Some(decl_pos) = decls.get(var.as_str()).and_then(|found| found[shape]) else {
                continue;
            };
            // Find the enclosing function body
            let Some((func_start, func_end)) =
                find_enclosing_function_body(&result, decl_pos as usize)
            else {
                continue;
            };
            let func_body = &result[func_start..func_end];
            let is_state = shape % 2 == 0;
            let transformed_body = apply_local_state_transforms(func_body, var, is_state);

            if transformed_body != func_body {
                result = format!(
                    "{}{}{}",
                    &result[..func_start],
                    transformed_body,
                    &result[func_end..]
                );
                decls = index_shadowed_decls(&result);
            }
        }
    }

    result
}

/// The `$.…(` markers whose declarations [`transform_shadowed_local_state_vars`]
/// rewrites, crossed with [`SHADOWED_DECL_KEYWORDS`] to form the twelve shapes.
const SHADOWED_DECL_MARKERS: [&str; 4] =
    ["$.state(", "$.derived(", "$.state.raw(", "$.derived.by("];

const SHADOWED_DECL_KEYWORDS: [&str; 3] = ["let ", "var ", "const "];

/// In dev the label wrap sits between the `=` and the rune call, so every
/// declaration probe has to look through it.
const SHADOWED_DECL_TAG_WRAPPERS: [&str; 2] = ["$.tag(", "$.tag_proxy("];

const SHADOWED_DECL_SHAPE_COUNT: usize = SHADOWED_DECL_MARKERS.len() * SHADOWED_DECL_KEYWORDS.len();

/// First offset of each `<kw> N = $.…(` declaration shape, keyed by `N`.
///
/// The twelve shapes are `let` / `var` / `const` crossed with
/// [`SHADOWED_DECL_MARKERS`], optionally through a
/// [`SHADOWED_DECL_TAG_WRAPPERS`] wrap. `N` is the space-delimited token before
/// the `=` and the keyword is matched as a raw substring (no left word
/// boundary).
fn index_shadowed_decls(
    script: &str,
) -> rustc_hash::FxHashMap<String, [Option<u32>; SHADOWED_DECL_SHAPE_COUNT]> {
    let mut map: rustc_hash::FxHashMap<String, [Option<u32>; SHADOWED_DECL_SHAPE_COUNT]> =
        rustc_hash::FxHashMap::default();
    for (marker_idx, marker) in SHADOWED_DECL_MARKERS.iter().enumerate() {
        for pos in memmem::find_iter(script.as_bytes(), marker.as_bytes()) {
            let mut before = &script[..pos];
            for wrapper in SHADOWED_DECL_TAG_WRAPPERS {
                if let Some(stripped) = before.strip_suffix(wrapper) {
                    before = stripped;
                    break;
                }
            }
            let Some(before) = before.strip_suffix(" = ") else {
                continue;
            };
            let Some(space) = before.rfind(' ') else {
                continue;
            };
            let name_start = space + 1;
            if name_start == before.len() {
                continue;
            }
            let head = &script[..name_start];
            let Some(keyword) = SHADOWED_DECL_KEYWORDS
                .iter()
                .position(|kw| head.ends_with(kw))
            else {
                continue;
            };
            let shape = keyword * 2 + marker_idx % 2 + if marker_idx >= 2 { 6 } else { 0 };
            let pattern_start = (name_start - SHADOWED_DECL_KEYWORDS[keyword].len()) as u32;
            let entry = map
                .entry(before[name_start..].to_string())
                .or_insert([None; SHADOWED_DECL_SHAPE_COUNT]);
            if entry[shape].is_none_or(|first| pattern_start < first) {
                entry[shape] = Some(pattern_start);
            }
        }
    }
    map
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

    // Apply $.get() wrapping for reads (AST-based via state_reads_ast)
    result = state_reads_ast::transform_state_reads_ast(&result, &[var_name.to_string()], &[])
        .unwrap_or(result);

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
            let next = crate::compiler::utils::next_char_boundary(text, abs_pos);
            result.push_str(&text[search_from..next]);
            search_from = next;
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
        if declares_local_rune(trimmed, var_name) {
            lines.push(line.to_string());
            continue;
        }

        let transformed = transform_local_assignment(line, var_name);
        lines.push(transformed);
    }

    lines.join("\n")
}

/// Whether `line` is `var_name`'s own signal declaration, with or without the
/// dev label wrap around the rune call.
fn declares_local_rune(line: &str, var_name: &str) -> bool {
    ["let ", "var "].iter().any(|keyword| {
        let head = format!("{keyword}{var_name} = ");
        line.match_indices(head.as_str()).any(|(pos, _)| {
            let mut rest = &line[pos + head.len()..];
            for wrapper in SHADOWED_DECL_TAG_WRAPPERS {
                if let Some(stripped) = rest.strip_prefix(wrapper) {
                    rest = stripped;
                    break;
                }
            }
            rest.starts_with("$.state(") || rest.starts_with("$.derived(")
        })
    })
}

/// Transform `varName = expr` to `$.set(varName, expr, true)` in a line.
fn transform_local_assignment(line: &str, var_name: &str) -> String {
    // AST-based fast path: handles all the boundary checks (in-string,
    // member target, declaration, etc.) for free. Falls back to the
    // text loop when the AST helper bails (parse failure, no match).
    if let Some(out) = local_assign_ast::transform_local_assign_ast(line, var_name) {
        return out;
    }

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
mod tests;
