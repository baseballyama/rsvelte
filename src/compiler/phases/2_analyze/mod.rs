//! Phase 2: Analyze
//!
//! Semantic analysis of the parsed AST.
//!
//! This phase is responsible for:
//! - Creating scopes and tracking variable bindings
//! - Validating identifiers and imports
//! - Analyzing reactive declarations and dependencies
//! - Checking directives and their usage
//! - Pruning unused CSS
//! - Generating scope maps for code generation
//!
//! The analyzer produces a `ComponentAnalysis` structure that contains
//! all the semantic information needed for code generation.
//!
//! Corresponds to Svelte's `2-analyze/` directory.

pub mod binding_properties;
pub mod blockers;
pub mod control_flow;
pub mod css;
mod css_scoping;
pub mod errors;
pub mod scope;
mod scope_builder;
mod store_subscriptions;
pub mod types;
pub mod utils;
pub mod visitors;
pub mod warnings;

pub use scope::{
    Binding, BindingKind, BindingReference, BlockerExpression, DeclarationKind, Mutation,
    MutationKind, Scope, ScopeRoot,
};
pub use types::{
    AsyncStatement, AwaitedDeclaration, ComponentAnalysis, CssAnalysis, InstanceBody, JsAnalysis,
    ReactiveStatement, ScriptContent, TemplateAnalysis,
};
pub use visitors::AstType;

use crate::ast::template::Root;
use crate::ast::typed_expr::JsNode;
use crate::compiler::CompileOptions;

/// Analyze a parsed Svelte component.
///
/// This is the entry point for Phase 2 of the compiler.
///
/// Corresponds to `analyze_component` in Svelte's `2-analyze/index.js`.
///
/// # Arguments
///
/// * `ast` - The parsed AST from Phase 1
/// * `source` - The original source code
/// * `options` - Compile options
///
/// # Returns
///
/// Returns a `ComponentAnalysis` containing all semantic information.
pub fn analyze_component(
    ast: &mut Root,
    source: &str,
    options: &CompileOptions,
) -> Result<ComponentAnalysis, AnalysisError> {
    // Ensure deferred script parsing is completed before analysis.
    // During parse(), script content is stored as raw text for performance.
    // Here we invoke OXC to produce the full AST into the Root's arena.
    let line_offsets = crate::compiler::phases::phase1_parse::compute_line_offsets(source, false);
    // Resolve deferred lazy expressions in template AST
    // If any expression has a parse error, return it immediately
    if let Some(parse_err) =
        crate::compiler::phases::phase1_parse::resolve_lazy::resolve_lazy_expressions(ast, source)
    {
        return Err(parse_err.into());
    }

    if let Some(ref mut instance) = ast.instance {
        crate::compiler::phases::phase1_parse::read::script::ensure_script_parsed(
            &ast.arena,
            instance,
            source,
            &line_offsets,
        );
    }
    if let Some(ref mut module) = ast.module {
        crate::compiler::phases::phase1_parse::read::script::ensure_script_parsed(
            &ast.arena,
            module,
            source,
            &line_offsets,
        );
    }

    let mut analysis = ComponentAnalysis::new(source, options);

    // Forward parser-level warnings to the analysis warnings.
    // These include warnings like `element_implicitly_closed` that are
    // emitted during parsing when elements are auto-closed.
    for pw in &ast.parse_warnings {
        analysis.warnings.push(warnings::AnalysisWarning::new(
            pw.code.clone(),
            pw.message.clone(),
        ));
    }

    // Merge svelte:options from the parsed AST into the analysis
    // This handles cases like <svelte:options runes /> that set runes mode
    if let Some(ref svelte_options) = ast.options {
        if let Some(runes) = svelte_options.runes {
            analysis.runes = runes;
        }
        // Handle <svelte:options accessors />
        if let Some(accessors) = svelte_options.accessors {
            analysis.accessors = accessors;
        }
        // Handle <svelte:options immutable />
        if let Some(immutable) = svelte_options.immutable {
            analysis.immutable = immutable;
        }
        // Handle <svelte:options css="injected" />
        if svelte_options.css == Some(crate::ast::template::CssOption::Injected) {
            analysis.inject_styles = true;
        }
        // Handle <svelte:options namespace="svg" /> or <svelte:options namespace="mathml" />
        if let Some(namespace) = svelte_options.namespace {
            analysis.component_namespace_is_svg = namespace == crate::ast::template::Namespace::Svg;
            analysis.component_namespace_is_mathml =
                namespace == crate::ast::template::Namespace::Mathml;
        }
    }

    // Populate analysis.custom_element from svelte:options
    if let Some(ref svelte_options) = ast.options
        && let Some(ref ce_opts) = svelte_options.custom_element
    {
        analysis.custom_element = Some(types::CustomElementConfig {
            tag: ce_opts.tag.as_ref().map(|t| t.to_string()),
            shadow: ce_opts.shadow.map(|s| match s {
                crate::ast::template::ShadowMode::Open => "open".to_string(),
                crate::ast::template::ShadowMode::None => "none".to_string(),
            }),
            props: ce_opts.props.clone(),
        });
        // Custom elements always inject styles (into shadow DOM)
        // Reference: analyze/index.js line 527: inject_styles: options.css === 'injected' || is_custom_element
        analysis.inject_styles = true;
    }

    // Check for options_missing_custom_element warning
    // If svelte:options has customElement but the compile options don't have customElement: true
    if let Some(ref svelte_options) = ast.options
        && svelte_options.custom_element.is_some()
        && !options.custom_element
    {
        analysis
            .warnings
            .push(warnings::options_missing_custom_element());
    }

    // Extract script content for Phase 3 (avoids re-parsing)
    analysis.extract_scripts(ast);

    // Create scopes for the component
    analysis.create_scopes(ast, &ast.arena)?;

    // Detect store subscriptions and create synthetic bindings
    // This must happen after scopes are created but before template analysis
    // Corresponds to Svelte's store subscription logic in 2-analyze/index.js L348-444
    let is_module_file = options
        .filename
        .as_ref()
        .map(|f| f.ends_with(".svelte.js") || f.ends_with(".svelte.ts"))
        .unwrap_or(false);
    store_subscriptions::detect_store_subscriptions(
        ast,
        &mut analysis,
        options.runes,
        is_module_file,
    )?;

    // Detect await expressions and rune references in template and scripts.
    // This is needed for:
    // 1. Auto-detecting runes mode (await or rune references imply runes)
    // 2. Marking the component as needing async function wrapper
    //
    // When runes mode is already explicitly set (options.runes == Some(true) or
    // <svelte:options runes />), we only need to detect await expressions, not
    // rune references. This avoids expensive JSON walks for rune detection.
    let needs_rune_detection = options.runes.is_none() && !analysis.runes;

    // We collect store subscription names to exclude them from rune detection.
    // Store auto-subscriptions ($store) look like rune references (dollar prefix)
    // but are NOT runes. If we don't exclude them, a component with $store in the
    // template would be incorrectly detected as being in runes mode, which would
    // then reject `export let` with `legacy_export_invalid` error.
    let store_sub_names: rustc_hash::FxHashSet<&str> = if needs_rune_detection {
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::StoreSub))
            .map(|b| b.name.as_str())
            .collect()
    } else {
        rustc_hash::FxHashSet::default()
    };

    // Check the template fragment for both await expressions and rune references
    // in a single traversal (previously done as two separate walks).
    let fragment_results = fragment_check_features(&ast.fragment, &store_sub_names);

    // Check the instance script for both await expressions and rune references
    // in a single traversal (previously done as two separate walks).
    // For script checks, we use an empty set for store_subs (scripts can have both
    // runes and stores, but store_subs are created from template/instance references
    // after scope building, so they are not relevant for script-level rune detection).
    // TODO: migrate json_check_features to JsNode walker
    let (instance_has_await, instance_has_rune_reference) = ast
        .instance
        .as_ref()
        .map(|inst| {
            let val = inst.content.as_json();
            let empty_subs: rustc_hash::FxHashSet<&str> = rustc_hash::FxHashSet::default();
            let r = json_check_features(val, &empty_subs);
            (r.has_await, r.has_rune_reference)
        })
        .unwrap_or((false, false));

    // Check the module script for rune references (module scripts don't need await check
    // since the original code only checked instance script for await).
    // TODO: migrate json_check_features to JsNode walker
    let module_has_rune_reference = if needs_rune_detection {
        ast.module
            .as_ref()
            .map(|module| {
                let val = module.content.as_json();
                let empty_subs: rustc_hash::FxHashSet<&str> = rustc_hash::FxHashSet::default();
                json_check_features(val, &empty_subs).has_rune_reference
            })
            .unwrap_or(false)
    } else {
        false
    };

    let fragment_has_await = fragment_results.has_await;

    // Track whether the component has await (needed for async function wrapper)
    if fragment_has_await || instance_has_await {
        analysis.has_await = true;
    }

    // Auto-detect runes mode if not explicitly set.
    // This MUST happen BEFORE the visitor walks because the AwaitExpression visitor
    // checks analysis.runes to validate top-level await.
    // In the official Svelte compiler, runes detection happens at L449-451 in 2-analyze/index.js,
    // before the walk_module/walk_instance visitors run.
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/index.js L449-451
    // const runes = options.runes ?? (has_await || instance.has_await ||
    //     Array.from(module.scope.references.keys()).some(is_rune));
    if needs_rune_detection {
        let has_rune_references = instance_has_rune_reference
            || module_has_rune_reference
            || fragment_results.has_rune_reference;
        if fragment_has_await || instance_has_await || has_rune_references {
            analysis.runes = true;
        }
    }

    // In runes mode, immutable is always true and accessors is always false
    // (unless it's a custom element). This overrides any options passed by the user.
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/index.js
    if analysis.runes {
        analysis.immutable = true;
        if analysis.custom_element.is_none() {
            analysis.accessors = false;
        }
    }

    // Handle legacy mode exports
    // In non-runes mode, every exported `let` or `var` becomes a prop (bindable_prop),
    // and everything else becomes an export
    // This MUST happen BEFORE the script visitor walk so that is_safe_identifier
    // correctly identifies bindable_prop bindings and sets needs_context = true
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/index.js L562-616
    if !analysis.runes {
        process_legacy_exports(ast, &mut analysis);
    }

    // Validate and analyze scripts (JavaScript AST)
    // In Svelte's implementation, the scope function_depth works as follows:
    // - Module scope: function_depth = 0
    // - Instance scope: function_depth = 1 (child of module scope, not porous)
    // - Functions inside instance: function_depth = 2, etc.
    // We mirror this by setting the initial function_depth based on ast_type.
    //
    // Order matches official Svelte: module first, then instance, then template.
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/index.js L706-726
    if let Some(ref module) = ast.module {
        // Validate script attributes - warn for unknown attributes
        validate_script_attributes(&module.attributes, &mut analysis);

        // In runes mode, warn if `context="module"` syntax is used instead of `module` attribute
        // We detect this by checking if context is Module but there's no "module" attribute
        // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/Script.js
        if analysis.runes
            && module.context == crate::ast::template::ScriptContext::Module
            && !module
                .attributes
                .iter()
                .any(|attr| attr.name.as_str() == "module")
            && !is_module_file
        {
            analysis
                .warnings
                .push(warnings::script_context_deprecated());
        }

        // Use typed dispatch for script visiting - avoids JSON Map construction
        // for the Program node when content is Typed(JsNode::Program)
        let mut context = visitors::VisitorContext::new(&mut analysis, &ast.arena);
        context.ast_type = visitors::AstType::Module;
        // Module script stays at function_depth 0
        context.function_depth = 0;
        visitors::visit_script_expr(&module.content, &mut context)?;
    }

    // Snapshot module scope declarations (imports) for conflict detection during instance
    // script analysis. Scope data is populated during Phase 1 scope building, so we can
    // do this before analyzing the instance script.
    // Reference: ensure_no_module_import_conflict checks module.scope.get(id.name)?.declaration_kind === 'import'
    {
        let module_decls: rustc_hash::FxHashMap<String, usize> = analysis
            .root
            .scope
            .declarations
            .iter()
            .filter(|&(_, idx)| {
                analysis.root.bindings.get(*idx).is_some_and(|b| {
                    b.declaration_kind
                        == crate::compiler::phases::phase2_analyze::DeclarationKind::Import
                })
            })
            .map(|(name, idx)| (name.clone(), *idx))
            .collect();
        analysis.module_scope_declarations = module_decls;
    }

    if let Some(ref instance) = ast.instance {
        // Validate script attributes - warn for unknown attributes
        validate_script_attributes(&instance.attributes, &mut analysis);

        // Use typed dispatch for script visiting - avoids JSON Map construction
        // for the Program node when content is Typed(JsNode::Program)
        let mut context = visitors::VisitorContext::new(&mut analysis, &ast.arena);
        context.ast_type = visitors::AstType::Instance;
        // Instance script starts at function_depth 1 (like Svelte's scope system)
        context.function_depth = 1;
        visitors::visit_script_expr(&instance.content, &mut context)?;
    }

    // Check for cyclical reactive statement dependencies ($: a = b + 1; $: b = a + 1;)
    // This must run after instance script analysis.
    // Corresponds to: svelte/packages/svelte/src/compiler/phases/2-analyze/index.js L810
    if !analysis.runes {
        check_reactive_declaration_cycles(ast, &analysis)?;
    }

    // Populate legacy_dependencies for LegacyReactive bindings.
    // This must happen BEFORE analyze_template because the EachBlock visitor needs
    // legacy_dependencies to correctly follow transitive dependency chains.
    // Corresponds to Svelte's LabeledStatement.js lines 81-87 where
    // `binding.legacy_dependencies = Array.from(reactive_statement.dependencies)` is set.
    if !analysis.runes {
        populate_legacy_dependencies(ast, &mut analysis);
    }

    // Analyze the template using visitors.
    // Take a pointer to the arena to avoid borrow conflict with &mut ast.
    let arena_ptr = &ast.arena as *const crate::ast::arena::ParseArena;
    let arena_ref = unsafe { &*arena_ptr };
    visitors::analyze_template(ast, &mut analysis, arena_ref)?;

    // Post-analysis check: validate module script export specifiers.
    // This mirrors the official Svelte compiler's index.js post-walk checks.
    // Must run AFTER analyze_template so that analysis.template.snippets is populated.
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/index.js
    // TODO: migrate post-analysis module export checks to JsNode
    if let Some(ref module) = ast.module {
        let module_json = module.content.as_json();
        if let Some(body) = module_json.get("body").and_then(|b| b.as_array()) {
            for node in body {
                let node_type = node.get("type").and_then(|t| t.as_str());
                if node_type != Some("ExportNamedDeclaration") {
                    continue;
                }
                // Only check `export { x, y }` (specifiers), not `export function f() {}` (declaration)
                let has_declaration = node.get("declaration").is_some_and(|d| !d.is_null());
                if has_declaration {
                    continue;
                }
                // Skip re-exports: `export { x } from 'module'`
                if node.get("source").is_some_and(|s| !s.is_null()) {
                    continue;
                }
                let Some(specifiers) = node.get("specifiers").and_then(|s| s.as_array()) else {
                    continue;
                };
                for specifier in specifiers {
                    let Some(local) = specifier.get("local") else {
                        continue;
                    };
                    if local.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
                        continue;
                    }
                    let Some(name) = local.get("name").and_then(|n| n.as_str()) else {
                        continue;
                    };
                    if name.is_empty() {
                        continue;
                    }
                    // Check if the binding exists in the module scope.
                    // This matches the official compiler's check:
                    //   const binding = analysis.module.scope.get(name);
                    //   if (!binding) { ... }
                    //
                    // Note: analysis.root.scope.declarations contains ALL bindings
                    // from ALL scopes (merged by the scope builder), so we cannot
                    // simply check if the name exists there. Instead, we check:
                    // 1. The binding's scope_index is 0 (truly in module scope), OR
                    // 2. The name is a snippet that was explicitly hoisted to module scope.
                    let is_in_module_scope =
                        if let Some(&binding_idx) = analysis.root.scope.declarations.get(name) {
                            let binding = &analysis.root.bindings[binding_idx];
                            // scope_index 0 = module scope (truly module-level)
                            binding.scope_index == 0
                                // Also allow hoisted snippets (they have non-zero scope_index
                                // but were explicitly promoted to module scope)
                                || analysis.template.hoisted_snippets.contains(name)
                        } else {
                            false
                        };

                    if !is_in_module_scope {
                        // Not in module scope - check if it's a snippet
                        if analysis.template.snippets.contains(name) {
                            return Err(errors::snippet_invalid_export());
                        }
                        // If not a snippet and not in any scope at all, export_undefined
                        // is already raised by the export_named_declaration visitor.
                        // We only need to handle the snippet case here.
                    }
                }
            }
        }
    }

    // Compute maybe_runes: if we are not in runes mode but we have no reserved references
    // ($$props, $$restProps) and no `export let` or `$:` reactive statements, we might be in
    // a wannabe runes component that is using runes in an external module...we need to fallback
    // to the runic behavior.
    // Corresponds to Svelte's 2-analyze/index.js L488-510
    //
    // In the official compiler, `options.runes` at this point is the merged value from both
    // compile options and <svelte:options runes={...} />. We check both here.
    let merged_runes_false = options.runes == Some(false)
        || ast
            .options
            .as_ref()
            .and_then(|o| o.runes)
            .is_some_and(|r| !r);
    if !analysis.runes
        && !merged_runes_false
        && !analysis.uses_props
        && !analysis.uses_rest_props
        && !instance_has_legacy_patterns(ast)
    {
        analysis.maybe_runes = true;
    }

    // Legacy state promotion: In legacy mode (non-runes), if a binding is:
    // 1. kind === 'normal' with declaration_kind === 'let'
    // 2. updated (reassigned or mutated)
    // 3. referenced in the template (Fragment)
    // Then promote it to kind === 'state'
    // This enables reactive updates via $.mutable_source() in the transform phase.
    // Corresponds to Svelte's 2-analyze/index.js L618-636
    if !analysis.runes {
        promote_legacy_state_bindings(&mut analysis);
        // Additionally promote store underlying variables to 'state' if they are
        // reassigned in legacy mode. This corresponds to Svelte's 2-analyze/index.js L427-437:
        //   if (declaration.kind === 'normal' && declaration.declaration_kind === 'let' && declaration.reassigned) {
        //       declaration.kind = 'state';
        //   }
        promote_reassigned_store_variables(&mut analysis);
    }

    // More legacy nonsense: if an `each` binding is reassigned/mutated,
    // treat the expression as being mutated as well.
    // This promotes bindings referenced in the each expression to 'state'.
    // Corresponds to Svelte's 2-analyze/index.js L638-674
    //
    // We use two complementary approaches:
    // 1. scope_builder collected `each_block_collection_infos` with per-scope EachItem info.
    //    This correctly handles shadowing (e.g., `{#each a as { a }}`).
    // 2. The `promote_each_expression_bindings` fallback handles cases where the EachItem
    //    binding name doesn't shadow the collection name.
    if !analysis.runes {
        promote_each_collection_from_scope_info(&mut analysis);
        promote_each_expression_bindings(&ast.fragment, &mut analysis);
    }

    // Mark EachBlocks that contain bind:group directives referencing their items.
    // This sets contains_group_binding = true and assigns unique index names ($$index_1, etc.)
    // for any EachBlock whose item variable is bound via bind:group.
    // Corresponds to: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/BindDirective.js
    // lines 232-242 (setting parent.metadata.contains_group_binding = true).
    {
        let mut index_counter = 0usize;
        mark_each_block_group_bindings(&mut ast.fragment, &mut index_counter, &mut analysis);
    }

    // Build sibling relationships for CSS analysis
    // This must happen after template analysis builds the DOM structure
    control_flow::build_sibling_relationships(&mut analysis.css.dom_structure, &ast.fragment);

    // In runes mode, warn on any nonstate declarations that are:
    // a) reassigned and b) referenced in the template
    // Corresponds to Svelte's 2-analyze/index.js L728-768
    if analysis.runes {
        let instance_scope = analysis.root.instance_scope_index;
        let binding_count = analysis.root.bindings.len();
        for i in 0..binding_count {
            let binding = &analysis.root.bindings[i];
            // Only check module scope (0) and instance scope bindings
            if binding.scope_index != 0 && binding.scope_index != instance_scope {
                continue;
            }
            // Only check 'normal' bindings (not state, derived, prop, etc.)
            if !matches!(binding.kind, BindingKind::Normal) {
                continue;
            }
            // Must be reassigned
            if !binding.reassigned {
                continue;
            }
            // Must be referenced directly in the template (not just inside event handlers)
            // Corresponds to official check: walks reference paths and skips those inside functions
            if binding.has_direct_template_read {
                // Check if the binding has a svelte-ignore comment for this warning
                if !binding
                    .ignore_codes
                    .contains(&"non_reactive_update".to_string())
                {
                    let name = binding.name.clone();
                    analysis.warnings.push(warnings::non_reactive_update(&name));
                }
            }
        }
    }

    // Check for unused export let bindings in instance scope.
    // Corresponds to Svelte's 2-analyze/index.js L796-808:
    //   for (const [name, binding] of instance.scope.declarations) {
    //     if ((binding.kind === 'prop' || binding.kind === 'bindable_prop') && binding.node.name !== '$$props') {
    //       const references = binding.references.filter(r => r.node !== binding.node && r.path.at(-1)?.type !== 'ExportSpecifier');
    //       if (!references.length && !instance.scope.declarations.has(`$${name}`)) {
    //         w.export_let_unused(binding.node, name);
    //       }
    //     }
    //   }
    if !analysis.runes {
        let instance_scope_idx = analysis.root.instance_scope_index;
        let binding_count = analysis.root.bindings.len();
        for i in 0..binding_count {
            let binding = &analysis.root.bindings[i];
            // Only check instance scope bindings
            if binding.scope_index != instance_scope_idx {
                continue;
            }
            // Only check prop bindings (export let)
            if !matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp) {
                continue;
            }
            // Skip $$props
            if binding.name == "$$props" {
                continue;
            }
            // Check if the binding has references other than the declaration and ExportSpecifier.
            // Corresponds to the official filter:
            //   binding.references.filter(r => r.node !== binding.node && r.path.at(-1)?.type !== 'ExportSpecifier')
            // In our implementation, the first reference is typically the self-declaration
            // (from visiting the VariableDeclarator's id pattern). We count references
            // that are not ExportSpecifier references and check if there are more than 1
            // (the self-declaration).
            let non_export_specifier_refs = binding
                .references
                .iter()
                .filter(|r| !r.is_export_specifier)
                .count();
            // More than 1 means there are references beyond the self-declaration
            let has_external_reference = non_export_specifier_refs > 1;
            // Also check if there's a store subscription with the same name ($name).
            // The official Svelte compiler checks: instance.scope.declarations.has(`$${name}`)
            // In our implementation, $name bindings may not be created as declarations,
            // so we check all scopes and also look for $name in the source.
            let store_name = format!("${}", binding.name);
            let has_store = analysis.root.scope.declarations.contains_key(&store_name) || {
                // Fallback: check if $name appears in the source (for cases where
                // we don't create $name bindings but the source uses them)
                source.contains(&store_name)
            };
            if !has_external_reference && !has_store {
                // Check if the binding has a svelte-ignore comment for this warning
                if !binding
                    .ignore_codes
                    .contains(&"export_let_unused".to_string())
                {
                    let name = binding.name.clone();
                    analysis.warnings.push(warnings::export_let_unused(&name));
                }
            }
        }
    }

    // Check for mixing slot and render tag syntax
    // Corresponds to Svelte's 2-analyze/index.js check for slot_snippet_conflict
    // The official compiler checks: uses_slots || (!custom_element && slot_names.size > 0)
    // uses_slots is set when $$slots is referenced in JS; slot_names tracks <slot> elements
    if analysis.uses_render_tags
        && (analysis.uses_slots
            || (analysis.custom_element.is_none() && !analysis.slot_names.is_empty()))
    {
        return Err(errors::slot_snippet_conflict());
    }

    // Analyze CSS if present
    if let Some(ref stylesheet) = ast.css {
        analysis.analyze_css(stylesheet, options)?;

        // Run CSS analysis and validation
        css::analyze_css(stylesheet, &mut analysis)?;

        // Extract CSS selector information for per-element scoping
        css::extract_css_selector_info(stylesheet, &mut analysis);

        // Prune unused selectors
        css::prune_css(stylesheet, &analysis);

        // Mark elements as scoped based on CSS selector matching.
        // Extract CSS selectors and match them against template elements,
        // properly considering combinators (>, space, +, ~).
        if !analysis.css.hash.is_empty() {
            let css_selectors = css_scoping::extract_css_selectors(stylesheet);
            css_scoping::mark_elements_scoped(&mut ast.fragment, &css_selectors);

            // When @keyframes rules exist, scope ALL elements in the component.
            // This matches the official Svelte compiler behavior: keyframe names are
            // prefixed with the component hash, and since any element could potentially
            // use that animation (e.g., via JS), all elements need the hash class.
            if !analysis.css.keyframes.is_empty() {
                css_scoping::mark_all_elements_scoped(&mut ast.fragment);
            }
        }
    }

    // Post-analysis: synthesize empty class/style attributes for elements that have
    // class/style directives but no corresponding attribute. This matches the official
    // Svelte compiler's behavior at 2-analyze/index.js L875-930.
    //
    // NOTE: We only synthesize for elements with class/style directives, NOT for
    // all scoped elements. Scoped elements without class directives get their CSS hash
    // applied directly in the transform phase (e.g., via class="svelte-hash" in the template).
    // Synthesizing for all scoped elements causes regressions because RegularElement already
    // handles CSS hash injection in its transform visitor.
    synthesize_class_style_attributes(&mut ast.fragment, &analysis);

    // Deconflict component name with existing declarations and references.
    // This mirrors the official Svelte compiler's `module.scope.generate(component_name)`
    // which ensures the exported function name doesn't shadow imported identifiers or
    // other declarations/references. For example, if a component uses `<Countdown .../>`
    // (self-reference) and the filename is also `Countdown.svelte`, the function name
    // should be `Countdown_1`.
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/index.js L468
    {
        // Collect all names that are used across all scopes (declarations + references)
        // Use &str references to avoid String allocations.
        // The root scope (analysis.root.scope) already has all declarations from all
        // child scopes merged, so we only need to iterate it once for declarations.
        // We still need to iterate all_scopes for references (those are not merged).
        let mut used_names: rustc_hash::FxHashSet<&str> = rustc_hash::FxHashSet::default();
        // Root scope has all declarations merged from all scopes
        for key in analysis.root.scope.declarations.keys() {
            used_names.insert(key.as_str());
        }
        // Collect references from all scopes (including root)
        for scope in &analysis.root.all_scopes {
            for r in &scope.references {
                used_names.insert(r.name.as_str());
            }
        }
        // Also collect component names from template AST since they're identifiers
        // that need deconfliction but may not be in scope references
        collect_template_component_names(&ast.fragment.nodes, &mut used_names);

        // Walk script JSON to collect all identifier names that appear as references.
        // This mirrors the official Svelte compiler's `scope.root.conflicts` set, which
        // gets populated when a top-level identifier reference doesn't resolve to a
        // declared binding (i.e., it's a global like `JSON`, `Math`, etc.).
        // We only add identifiers that are NOT already declared, to approximate
        // "unbound references at the top level".
        let mut global_names: rustc_hash::FxHashSet<String> = rustc_hash::FxHashSet::default();
        if let Some(script) = ast.instance.as_ref() {
            collect_identifier_names_from_expression(&script.content, &mut global_names);
        }
        if let Some(script) = ast.module.as_ref() {
            collect_identifier_names_from_expression(&script.content, &mut global_names);
        }
        // Filter to only those NOT already declared (true globals/unbound).
        global_names.retain(|n| !used_names.contains(n.as_str()));

        let mut name = analysis.name.clone();
        let base = name.clone();
        let mut counter = 1u32;
        while used_names.contains(name.as_str()) || global_names.contains(&name) {
            name = format!("{}_{}", base, counter);
            counter += 1;
        }
        analysis.name = name;
    }

    Ok(analysis)
}

/// Synthesize empty class/style attributes for elements that need them.
///
/// This walks the entire template AST and adds synthetic `class=""` or `style=""`
/// attributes to elements that:
/// - Have class directives but no class attribute (need empty class for `$.set_class`)
/// - Are scoped (CSS hash applied) but have no class attribute (need empty class for hash)
/// - Have style directives but no style attribute (need empty style for `$.set_style`)
///
/// This corresponds to the official Svelte compiler's post-analysis loop at
/// `2-analyze/index.js` lines 875-930.
#[allow(clippy::only_used_in_recursion)]
fn synthesize_class_style_attributes(
    fragment: &mut crate::ast::template::Fragment,
    analysis: &ComponentAnalysis,
) {
    use crate::ast::template::TemplateNode;

    for node in &mut fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                synthesize_for_element_attrs(&mut el.attributes, el.metadata.scoped);
                synthesize_class_style_attributes(&mut el.fragment, analysis);
            }
            TemplateNode::SvelteElement(el) => {
                // Use the scoped flag set during CSS scoping pass
                synthesize_for_element_attrs(&mut el.attributes, el.metadata.scoped);
                synthesize_class_style_attributes(&mut el.fragment, analysis);
            }
            TemplateNode::Component(comp) => {
                synthesize_class_style_attributes(&mut comp.fragment, analysis);
            }
            TemplateNode::IfBlock(if_block) => {
                synthesize_class_style_attributes(&mut if_block.consequent, analysis);
                if let Some(ref mut alt) = if_block.alternate {
                    synthesize_class_style_attributes(alt, analysis);
                }
            }
            TemplateNode::EachBlock(each) => {
                synthesize_class_style_attributes(&mut each.body, analysis);
                if let Some(ref mut fallback) = each.fallback {
                    synthesize_class_style_attributes(fallback, analysis);
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref mut pending) = await_block.pending {
                    synthesize_class_style_attributes(pending, analysis);
                }
                if let Some(ref mut then) = await_block.then {
                    synthesize_class_style_attributes(then, analysis);
                }
                if let Some(ref mut catch) = await_block.catch {
                    synthesize_class_style_attributes(catch, analysis);
                }
            }
            TemplateNode::KeyBlock(key) => {
                synthesize_class_style_attributes(&mut key.fragment, analysis);
            }
            TemplateNode::SnippetBlock(snippet) => {
                synthesize_class_style_attributes(&mut snippet.body, analysis);
            }
            TemplateNode::SvelteHead(head) => {
                synthesize_class_style_attributes(&mut head.fragment, analysis);
            }
            TemplateNode::SlotElement(slot) => {
                synthesize_class_style_attributes(&mut slot.fragment, analysis);
            }
            TemplateNode::TitleElement(title) => {
                synthesize_class_style_attributes(&mut title.fragment, analysis);
            }
            _ => {}
        }
    }
}

/// Synthesize class/style attributes for a single element's attribute list.
fn synthesize_for_element_attrs(
    attributes: &mut Vec<crate::ast::template::Attribute>,
    _is_scoped: bool,
) {
    use crate::ast::template::{
        Attribute, AttributeNode, AttributeValue, AttributeValuePart, Text,
    };

    let mut has_class = false;
    let mut has_style = false;
    let mut has_spread = false;
    let mut has_class_directive = false;
    let mut has_style_directive = false;

    for attr in attributes.iter() {
        match attr {
            Attribute::SpreadAttribute(_) => {
                has_spread = true;
                break;
            }
            Attribute::Attribute(a) => {
                has_class = has_class || a.name.eq_ignore_ascii_case("class");
                has_style = has_style || a.name.eq_ignore_ascii_case("style");
            }
            Attribute::ClassDirective(_) => {
                has_class_directive = true;
            }
            Attribute::StyleDirective(_) => {
                has_style_directive = true;
            }
            _ => {}
        }
    }

    // We need an empty class to generate the set_class() correctly when class directives exist.
    // NOTE: We do NOT synthesize for scoped-only elements (no class directives) because
    // the transform phase handles CSS hash injection for those elements directly.
    if !has_spread && !has_class && has_class_directive {
        attributes.push(Attribute::Attribute(AttributeNode {
            start: u32::MAX, // synthetic marker (uses -1 in JS, we use u32::MAX)
            end: u32::MAX,
            name: "class".into(),
            name_loc: None,
            value: AttributeValue::Sequence(vec![AttributeValuePart::Text(Text {
                start: u32::MAX,
                end: u32::MAX,
                raw: "".into(),
                data: "".into(),
            })]),
        }));
    }

    // We need an empty style to generate the set_style() correctly
    if !has_spread && !has_style && has_style_directive {
        attributes.push(Attribute::Attribute(AttributeNode {
            start: u32::MAX,
            end: u32::MAX,
            name: "style".into(),
            name_loc: None,
            value: AttributeValue::Sequence(vec![AttributeValuePart::Text(Text {
                start: u32::MAX,
                end: u32::MAX,
                raw: "".into(),
                data: "".into(),
            })]),
        }));
    }
}

/// Validate script attributes and emit warnings for unknown ones.
fn validate_script_attributes(
    attributes: &[crate::ast::template::AttributeNode],
    analysis: &mut ComponentAnalysis,
) {
    // Known script attributes: lang, generics, module, context
    const KNOWN_ATTRS: &[&str] = &["lang", "generics", "module", "context"];

    for attr in attributes {
        if !KNOWN_ATTRS.contains(&attr.name.as_str()) {
            analysis.warnings.push(warnings::script_unknown_attribute());
        }
    }
}

/// Check if the instance script body has legacy patterns (`$:` or `export let`).
///
/// Corresponds to the `instance.ast.body.some(...)` check in Svelte's
/// 2-analyze/index.js L498-510
fn instance_has_legacy_patterns(ast: &Root) -> bool {
    let Some(ref instance) = ast.instance else {
        return false;
    };

    // TODO: migrate instance_has_legacy_patterns to JsNode
    let script_ast = instance.content.as_json();
    let Some(body) = script_ast.get("body").and_then(|v| v.as_array()) else {
        return false;
    };

    for node in body {
        match node.get("type").and_then(|v| v.as_str()) {
            Some("LabeledStatement") => return true,
            Some("ExportNamedDeclaration") => {
                // Check: export let x = ...
                if let Some(decl) = node.get("declaration").filter(|d| !d.is_null())
                    && decl.get("type").and_then(|v| v.as_str()) == Some("VariableDeclaration")
                    && decl.get("kind").and_then(|v| v.as_str()) == Some("let")
                {
                    return true;
                }
                // Check: export { x } where x is declared with let
                if let Some(specifiers) = node.get("specifiers").and_then(|v| v.as_array()) {
                    for spec in specifiers {
                        if let Some(name) = spec
                            .get("local")
                            .filter(|l| {
                                l.get("type").and_then(|v| v.as_str()) == Some("Identifier")
                            })
                            .and_then(|l| l.get("name"))
                            .and_then(|v| v.as_str())
                            && body_has_let_declaration(body, name)
                        {
                            return true;
                        }
                    }
                }
            }
            _ => {}
        }
    }

    false
}

/// Check if the body contains a `let` declaration for the given name.
fn body_has_let_declaration(body: &[serde_json::Value], name: &str) -> bool {
    for node in body {
        if node.get("type").and_then(|v| v.as_str()) != Some("VariableDeclaration") {
            continue;
        }
        if node.get("kind").and_then(|v| v.as_str()) != Some("let") {
            continue;
        }
        if let Some(decls) = node.get("declarations").and_then(|v| v.as_array()) {
            for decl in decls {
                if decl
                    .get("id")
                    .and_then(|id| id.get("name"))
                    .and_then(|v| v.as_str())
                    == Some(name)
                {
                    return true;
                }
            }
        }
    }
    false
}

/// Check for cyclical dependencies in reactive `$:` statements.
///
/// Extracts assignment targets and dependency references from each `$:` statement
/// in the instance script, then checks for cycles using the graph cycle detection.
///
/// Corresponds to the `order_reactive_statements()` call in Svelte's 2-analyze/index.js L810.
fn check_reactive_declaration_cycles(
    ast: &Root,
    analysis: &ComponentAnalysis,
) -> Result<(), AnalysisError> {
    let Some(ref instance) = ast.instance else {
        return Ok(());
    };

    // TODO: migrate check_reactive_declaration_cycles to JsNode
    let script_ast = instance.content.as_json();
    let Some(body) = script_ast.get("body").and_then(|v| v.as_array()) else {
        return Ok(());
    };

    // Collect reactive statements and their assignments/dependencies
    // Each entry: (assignments: Vec<String>, dependencies: Vec<String>)
    let mut reactive_stmts: Vec<(Vec<String>, Vec<String>)> = Vec::new();

    for node in body {
        if node.get("type").and_then(|v| v.as_str()) != Some("LabeledStatement") {
            continue;
        }
        let label_name = node
            .get("label")
            .and_then(|l| l.get("name"))
            .and_then(|n| n.as_str());
        if label_name != Some("$") {
            continue;
        }

        let Some(body_node) = node.get("body") else {
            continue;
        };

        // Extract assigned variable names and dependency variable names
        let mut assignments: Vec<String> = Vec::new();
        let mut dependencies: Vec<String> = Vec::new();

        // Check if body is ExpressionStatement with AssignmentExpression
        if body_node.get("type").and_then(|v| v.as_str()) == Some("ExpressionStatement") {
            if let Some(expr) = body_node.get("expression") {
                if expr.get("type").and_then(|v| v.as_str()) == Some("AssignmentExpression") {
                    // LHS: extract assigned identifiers
                    if let Some(left) = expr.get("left") {
                        cycle_extract_pattern_ids(left, &mut assignments);
                    }
                    // RHS: extract dependency identifiers
                    if let Some(right) = expr.get("right") {
                        cycle_collect_js_ids(right, &mut dependencies);
                    }
                } else {
                    // Not an assignment - all identifiers are dependencies
                    cycle_collect_js_ids(expr, &mut dependencies);
                }
            }
        } else {
            // Block statement or other - collect all identifiers as dependencies
            cycle_collect_js_ids(body_node, &mut dependencies);
        }

        // Filter: only include variables that are declared in the instance scope
        // (not global variables like console, Math, etc.)
        let instance_scope_idx = analysis.root.instance_scope_index;
        assignments.retain(|name| {
            analysis
                .root
                .get_binding(name, instance_scope_idx)
                .is_some()
                || analysis.root.scope.declarations.contains_key(name)
        });
        dependencies.retain(|name| {
            analysis
                .root
                .get_binding(name, instance_scope_idx)
                .is_some()
                || analysis.root.scope.declarations.contains_key(name)
        });

        // Remove self-dependencies (assigned variables that also appear as dependencies)
        dependencies.retain(|dep| !assignments.contains(dep));

        if !assignments.is_empty() {
            reactive_stmts.push((assignments, dependencies));
        }
    }

    // Build edges for cycle detection: (assignment_name, dependency_name)
    // Use &str references to avoid String allocations
    let mut edges: Vec<(&str, &str)> = Vec::new();
    for (assignments, dependencies) in &reactive_stmts {
        for assignment in assignments {
            for dependency in dependencies {
                edges.push((assignment.as_str(), dependency.as_str()));
            }
        }
    }

    // Check for cycles
    if let Some(cycle) = utils::check_graph_for_cycles(&edges) {
        let cycle_str = cycle.join(" \u{2192} "); // → character
        return Err(errors::reactive_declaration_cycle(&cycle_str));
    }

    Ok(())
}

/// Extract identifier names from a pattern (LHS of assignment) for reactive cycle detection.
fn cycle_extract_pattern_ids(node: &serde_json::Value, out: &mut Vec<String>) {
    match node.get("type").and_then(|v| v.as_str()) {
        Some("Identifier") => {
            if let Some(name) = node.get("name").and_then(|v| v.as_str())
                && !out.iter().any(|s| s == name)
            {
                out.push(name.to_string());
            }
        }
        Some("MemberExpression") => {
            // For member expressions like `obj.prop`, extract the root object identifier
            if let Some(obj) = node.get("object") {
                cycle_extract_pattern_ids(obj, out);
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = node.get("elements").and_then(|v| v.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        cycle_extract_pattern_ids(elem, out);
                    }
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = node.get("properties").and_then(|v| v.as_array()) {
                for prop in props {
                    if let Some(value) = prop.get("value") {
                        cycle_extract_pattern_ids(value, out);
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = node.get("left") {
                cycle_extract_pattern_ids(left, out);
            }
        }
        Some("RestElement") => {
            if let Some(argument) = node.get("argument") {
                cycle_extract_pattern_ids(argument, out);
            }
        }
        _ => {}
    }
}

/// Recursively collect all identifier references from a JS AST node for reactive cycle detection.
fn cycle_collect_js_ids(node: &serde_json::Value, out: &mut Vec<String>) {
    if let Some(node_type) = node.get("type").and_then(|v| v.as_str()) {
        if node_type == "Identifier" {
            if let Some(name) = node.get("name").and_then(|v| v.as_str())
                && !out.iter().any(|s| s == name)
            {
                out.push(name.to_string());
            }
            return;
        }
        // Skip function bodies - they create their own scope
        if matches!(
            node_type,
            "FunctionExpression" | "ArrowFunctionExpression" | "FunctionDeclaration"
        ) {
            return;
        }
        // For Property nodes, only recurse into value (not key, unless computed)
        // This avoids treating object literal property names like `{ details: null }`
        // as identifier references to variables named `details`.
        if node_type == "Property" {
            let is_computed = node
                .get("computed")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            if is_computed && let Some(key) = node.get("key") {
                cycle_collect_js_ids(key, out);
            }
            if let Some(value) = node.get("value") {
                cycle_collect_js_ids(value, out);
            }
            return;
        }
        // For MemberExpression, only recurse into object (not property, unless computed)
        // `obj.prop` should only reference `obj`, not `prop`.
        if node_type == "MemberExpression" {
            if let Some(object) = node.get("object") {
                cycle_collect_js_ids(object, out);
            }
            let is_computed = node
                .get("computed")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            if is_computed && let Some(property) = node.get("property") {
                cycle_collect_js_ids(property, out);
            }
            return;
        }
    }
    // Recurse into all object/array children
    if let Some(obj) = node.as_object() {
        for (key, value) in obj {
            // Skip metadata keys
            if key == "type" || key == "start" || key == "end" || key == "loc" {
                continue;
            }
            if value.is_object() {
                cycle_collect_js_ids(value, out);
            } else if let Some(arr) = value.as_array() {
                for item in arr {
                    if item.is_object() {
                        cycle_collect_js_ids(item, out);
                    }
                }
            }
        }
    }
}

/// Process legacy mode exports.
///
/// In non-runes mode, every exported `let` or `var` becomes a prop (bindable_prop),
/// and everything else (const, function, class) becomes an export.
///
/// This must happen after script analysis but before template analysis.
///
/// Corresponds to Svelte's 2-analyze/index.js L562-616
fn process_legacy_exports(ast: &Root, analysis: &mut ComponentAnalysis) {
    let Some(ref instance) = ast.instance else {
        return;
    };

    // TODO: migrate process_legacy_exports to JsNode
    let script_ast = instance.content.as_json();

    // Get the body array from the Program node
    let Some(body) = script_ast.get("body").and_then(|v| v.as_array()) else {
        return;
    };

    for node in body {
        // Check if this is an ExportNamedDeclaration
        let node_type = node.get("type").and_then(|v| v.as_str());
        if node_type != Some("ExportNamedDeclaration") {
            continue;
        }

        analysis.needs_props = true;

        // Check if there's a declaration
        if let Some(declaration) = node.get("declaration") {
            if declaration.is_null() {
                // Handle export specifiers (export { a, b as c })
                if let Some(specifiers) = node.get("specifiers").and_then(|v| v.as_array()) {
                    for specifier in specifiers {
                        let local_name = specifier
                            .get("local")
                            .and_then(|v| v.get("name"))
                            .and_then(|v| v.as_str());
                        let exported_name = specifier
                            .get("exported")
                            .and_then(|v| v.get("name"))
                            .and_then(|v| v.as_str());

                        let (Some(local), Some(exported)) = (local_name, exported_name) else {
                            continue;
                        };

                        // Find the binding for this local name
                        if let Some(binding_idx) = analysis.root.find_binding_any_scope(local) {
                            let binding = &mut analysis.root.bindings[binding_idx];

                            // If it's a var or let declaration, make it a bindable prop
                            if binding.declaration_kind == DeclarationKind::Var
                                || binding.declaration_kind == DeclarationKind::Let
                            {
                                binding.kind = BindingKind::BindableProp;

                                // If exported with a different name, set the alias
                                if exported != local {
                                    binding.prop_alias = Some(exported.to_string());
                                }
                            } else {
                                // For const/function/class, add to exports
                                analysis.exports.push(types::Export {
                                    name: local.to_string(),
                                    alias: if exported != local {
                                        Some(exported.to_string())
                                    } else {
                                        None
                                    },
                                });
                            }
                        } else {
                            // Binding not found, treat as an export
                            analysis.exports.push(types::Export {
                                name: local.to_string(),
                                alias: if exported != local {
                                    Some(exported.to_string())
                                } else {
                                    None
                                },
                            });
                        }
                    }
                }
                continue;
            }

            let decl_type = declaration.get("type").and_then(|v| v.as_str());

            match decl_type {
                Some("FunctionDeclaration") | Some("ClassDeclaration") => {
                    // export function foo() {} or export class Foo {}
                    if let Some(name) = declaration
                        .get("id")
                        .and_then(|v| v.get("name"))
                        .and_then(|v| v.as_str())
                    {
                        analysis.exports.push(types::Export {
                            name: name.to_string(),
                            alias: None,
                        });
                    }
                }
                Some("VariableDeclaration") => {
                    let kind = declaration.get("kind").and_then(|v| v.as_str());

                    if let Some(declarations) =
                        declaration.get("declarations").and_then(|v| v.as_array())
                    {
                        for declarator in declarations {
                            // Extract all identifiers from the pattern (handles destructuring)
                            let identifiers =
                                extract_identifiers_from_pattern(declarator.get("id"));

                            if kind == Some("const") {
                                // export const x = 1 -> add to exports
                                for name in identifiers {
                                    analysis.exports.push(types::Export { name, alias: None });
                                }
                            } else {
                                // export let x = 1 or export var x = 1 -> make bindable prop
                                for name in identifiers {
                                    if let Some(binding_idx) =
                                        analysis.root.find_binding_any_scope(&name)
                                    {
                                        analysis.root.bindings[binding_idx].kind =
                                            BindingKind::BindableProp;
                                    }
                                }
                            }
                        }
                    }
                }
                _ => {}
            }
        }
    }
}

/// Extract identifier names from a pattern (handles destructuring).
fn extract_identifiers_from_pattern(pattern: Option<&serde_json::Value>) -> Vec<String> {
    let Some(pattern) = pattern else {
        return Vec::new();
    };

    let mut identifiers = Vec::new();

    match pattern.get("type").and_then(|v| v.as_str()) {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|v| v.as_str()) {
                identifiers.push(name.to_string());
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|v| v.as_array()) {
                for prop in properties {
                    // Handle RestElement in object pattern
                    if prop.get("type").and_then(|v| v.as_str()) == Some("RestElement") {
                        identifiers.extend(extract_identifiers_from_pattern(prop.get("argument")));
                    } else {
                        identifiers.extend(extract_identifiers_from_pattern(prop.get("value")));
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|v| v.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        identifiers.extend(extract_identifiers_from_pattern(Some(elem)));
                    }
                }
            }
        }
        Some("RestElement") => {
            identifiers.extend(extract_identifiers_from_pattern(pattern.get("argument")));
        }
        Some("AssignmentPattern") => {
            identifiers.extend(extract_identifiers_from_pattern(pattern.get("left")));
        }
        _ => {}
    }

    identifiers
}

/// Promote store underlying variables to 'state' if reassigned in legacy mode.
///
/// When a store subscription `$foo` exists and the underlying variable `foo`
/// is `let` declared, `normal` kind, and reassigned, it should be promoted to `state`.
/// This ensures the store variable gets wrapped in `$.mutable_source()` so that
/// reassignments are reactive.
///
/// Corresponds to Svelte's 2-analyze/index.js L427-437.
fn promote_reassigned_store_variables(analysis: &mut ComponentAnalysis) {
    // Collect store sub names first
    let store_sub_names: Vec<String> = analysis
        .root
        .bindings
        .iter()
        .filter(|b| matches!(b.kind, BindingKind::StoreSub))
        .map(|b| b.name.clone())
        .collect();

    // For each store sub, check if the underlying variable should be promoted
    for store_sub_name in &store_sub_names {
        let store_name = &store_sub_name[1..]; // Remove leading $
        if let Some(binding_idx) = analysis
            .root
            .bindings
            .iter()
            .position(|b| b.name == store_name)
        {
            let binding = &analysis.root.bindings[binding_idx];
            if binding.kind == BindingKind::Normal
                && binding.declaration_kind == DeclarationKind::Let
                && binding.reassigned
            {
                analysis.root.bindings[binding_idx].kind = BindingKind::State;
            }
        }
    }
}

/// Promote bindings to 'state' kind in legacy (non-runes) mode.
///
/// In legacy mode, if a binding:
/// - Has kind 'normal' and declaration_kind 'let'
/// - Is updated (reassigned or mutated)
/// - Is referenced in the template (Fragment)
///
/// Then it needs to be promoted to 'state' kind so that:
/// - It gets wrapped in $.mutable_source() in the transform phase
/// - Template references use $.get() to read the value
/// - Assignments use $.set() to update the value
///
/// This enables reactive updates for variables that are modified
/// and displayed in the template.
///
/// Corresponds to Svelte's 2-analyze/index.js L618-636
fn promote_legacy_state_bindings(analysis: &mut ComponentAnalysis) {
    let instance_scope_index = analysis.root.instance_scope_index;

    // If there's no instance script, no bindings should be promoted.
    if analysis.instance_script_content.is_none() {
        return;
    }

    // Collect binding indices from the instance scope's declarations map.
    // This mirrors the official Svelte compiler which iterates over
    // `instance.scope.declarations.values()` - only bindings declared directly
    // at the instance scope level, NOT bindings from nested functions.
    let binding_indices: Vec<usize> = analysis.root.all_scopes[instance_scope_index]
        .declarations
        .values()
        .copied()
        .collect();

    for binding_idx in binding_indices {
        let binding = &analysis.root.bindings[binding_idx];

        // Only consider 'normal' bindings (not already state, derived, prop, etc.)
        if binding.kind != BindingKind::Normal {
            continue;
        }

        // Check if the binding is updated (reassigned or mutated)
        if !binding.is_updated() {
            continue;
        }

        // Check if the binding has references in qualifying locations:
        // - Template (Fragment) references
        // - StyleDirective references
        // - $: reactive declaration references
        // This matches the official Svelte compiler's logic at 2-analyze/index.js L623-633:
        //   path[path.length - 1].type === 'StyleDirective' ||
        //   path.some((node) => node.type === 'Fragment') ||
        //   (path[1].type === 'LabeledStatement' && path[1].label.name === '$')
        let has_qualifying_reference = binding.references.iter().any(|r| {
            r.is_template_reference
                || r.is_style_directive_reference
                || r.is_reactive_declaration_reference
        });
        if !has_qualifying_reference {
            continue;
        }

        // Promote to 'state' kind
        analysis.root.bindings[binding_idx].kind = BindingKind::State;
    }
}

/// Promote collection bindings to State using per-scope information from scope_builder.
///
/// This correctly handles cases where the each block context pattern shadows the collection
/// variable (e.g., `{#each a as { a }}`). In such cases, `find_binding_any_scope("a")`
/// would find the OUTER `a` (not the EachItem `a`), so the existing
/// `promote_each_expression_bindings` fails to detect the mutation.
///
/// `each_block_collection_infos` stores (parent_scope_idx, each_scope_idx, collection_names)
/// with updates already applied, so we can correctly check EachItem binding update status.
///
/// Mirrors official Svelte compiler index.js L638-674.
fn promote_each_collection_from_scope_info(analysis: &mut ComponentAnalysis) {
    let each_infos = std::mem::take(&mut analysis.root.each_block_collection_infos);
    for (parent_scope, _each_scope, collection_names) in &each_infos {
        // The each_block_collection_infos was already filtered to only include entries
        // where at least one EachItem binding is updated (done in scope_builder build()).
        // So any entry here should trigger promotion.
        let to_promote: Vec<usize> = collection_names
            .iter()
            .filter_map(|name| {
                analysis.root.all_scopes[*parent_scope]
                    .declarations
                    .get(name.as_str())
                    .copied()
            })
            .collect();
        for idx in to_promote {
            if idx < analysis.root.bindings.len() {
                let binding = &mut analysis.root.bindings[idx];
                if binding.kind == BindingKind::Normal
                    && !matches!(
                        binding.declaration_kind,
                        DeclarationKind::Import | DeclarationKind::Function
                    )
                {
                    binding.kind = BindingKind::State;
                    binding.mutated = true;
                }
            }
        }
    }
    // Restore (in case something reads it later, though currently nothing does)
    analysis.root.each_block_collection_infos = each_infos;
}

/// If an `each` binding is reassigned/mutated, treat the expression as being mutated as well.
/// This promotes bindings referenced in the each expression to 'state'.
///
/// Corresponds to Svelte's 2-analyze/index.js L638-674
fn promote_each_expression_bindings(
    fragment: &crate::ast::template::Fragment,
    analysis: &mut ComponentAnalysis,
) {
    let mut promotions: Vec<usize> = Vec::new();
    collect_each_block_promotions(fragment, analysis, &mut promotions);
    for binding_idx in promotions {
        if binding_idx < analysis.root.bindings.len() {
            analysis.root.bindings[binding_idx].kind = BindingKind::State;
            analysis.root.bindings[binding_idx].mutated = true;
        }
    }
}

/// Recursively walk the fragment to find EachBlock nodes and collect binding promotions.
fn collect_each_block_promotions(
    fragment: &crate::ast::template::Fragment,
    analysis: &ComponentAnalysis,
    promotions: &mut Vec<usize>,
) {
    use crate::ast::template::TemplateNode;

    for node in &fragment.nodes {
        match node {
            TemplateNode::EachBlock(each) => {
                let has_updated_binding = if let Some(ref context_expr) = each.context {
                    let context_node = context_expr.as_node();
                    let mut names = Vec::new();
                    extract_each_pattern_identifiers_node(&context_node, &mut names);
                    names.iter().any(|name| {
                        // Check ALL bindings with this name, not just the first one.
                        // The each block's item binding (EachItem kind) may be shadowed by
                        // callback parameters with the same name in earlier scopes.
                        // We need to find the EachItem binding specifically.
                        analysis.root.bindings.iter().any(|binding| {
                            binding.name == *name && (binding.reassigned || binding.mutated)
                        })
                    })
                } else {
                    false
                };

                if has_updated_binding {
                    // Use transitive_deps which follows LegacyReactive dependency chains.
                    // This matches the official compiler's EachBlock.js lines 64-75:
                    //   for (const binding of node.metadata.transitive_deps) {
                    //     if (binding.kind === 'normal' && ...) binding.kind = 'state';
                    //   }
                    for &dep_idx in &each.metadata.transitive_deps {
                        if dep_idx < analysis.root.bindings.len() {
                            let binding = &analysis.root.bindings[dep_idx];
                            if binding.kind == BindingKind::Normal
                                && matches!(
                                    binding.declaration_kind,
                                    DeclarationKind::Const
                                        | DeclarationKind::Let
                                        | DeclarationKind::Var
                                )
                            {
                                promotions.push(dep_idx);
                            }
                        }
                    }
                    // Also check expression.dependencies for direct Normal bindings
                    // (fallback for cases where transitive_deps might be empty)
                    if each.metadata.transitive_deps.is_empty() {
                        for &dep_idx in &each.metadata.expression.dependencies {
                            if dep_idx < analysis.root.bindings.len() {
                                let binding = &analysis.root.bindings[dep_idx];
                                if binding.kind == BindingKind::Normal
                                    && !matches!(
                                        binding.declaration_kind,
                                        DeclarationKind::Import | DeclarationKind::Function
                                    )
                                {
                                    promotions.push(dep_idx);
                                }
                            }
                        }
                    }
                }

                collect_each_block_promotions(&each.body, analysis, promotions);
                if let Some(ref fallback) = each.fallback {
                    collect_each_block_promotions(fallback, analysis, promotions);
                }
            }
            TemplateNode::RegularElement(el) => {
                collect_each_block_promotions(&el.fragment, analysis, promotions);
            }
            TemplateNode::Component(comp) => {
                collect_each_block_promotions(&comp.fragment, analysis, promotions);
            }
            TemplateNode::SvelteComponent(comp) => {
                collect_each_block_promotions(&comp.fragment, analysis, promotions);
            }
            TemplateNode::SvelteElement(el) => {
                collect_each_block_promotions(&el.fragment, analysis, promotions);
            }
            TemplateNode::SvelteSelf(s) => {
                collect_each_block_promotions(&s.fragment, analysis, promotions);
            }
            TemplateNode::IfBlock(if_block) => {
                collect_each_block_promotions(&if_block.consequent, analysis, promotions);
                if let Some(ref alt) = if_block.alternate {
                    collect_each_block_promotions(alt, analysis, promotions);
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref pending) = await_block.pending {
                    collect_each_block_promotions(pending, analysis, promotions);
                }
                if let Some(ref then) = await_block.then {
                    collect_each_block_promotions(then, analysis, promotions);
                }
                if let Some(ref catch) = await_block.catch {
                    collect_each_block_promotions(catch, analysis, promotions);
                }
            }
            TemplateNode::KeyBlock(key) => {
                collect_each_block_promotions(&key.fragment, analysis, promotions);
            }
            TemplateNode::SnippetBlock(snippet) => {
                collect_each_block_promotions(&snippet.body, analysis, promotions);
            }
            TemplateNode::SvelteHead(head) => {
                collect_each_block_promotions(&head.fragment, analysis, promotions);
            }
            TemplateNode::SlotElement(slot) => {
                collect_each_block_promotions(&slot.fragment, analysis, promotions);
            }
            _ => {}
        }
    }
}

/// Populate `legacy_dependencies` for `LegacyReactive` bindings.
///
/// In legacy mode, `$:` reactive declarations create `LegacyReactive` bindings.
/// Each such binding needs to track which other bindings it depends on (the
/// bindings referenced on the RHS of `$: x = <rhs>`).
///
/// This is needed by `collect_transitive_dependencies` in the EachBlock visitor
/// to correctly follow dependency chains and promote collection bindings to `State`.
///
/// Corresponds to Svelte's LabeledStatement.js lines 81-87 where
/// `binding.legacy_dependencies = Array.from(reactive_statement.dependencies)` is set.
fn populate_legacy_dependencies(ast: &Root, analysis: &mut ComponentAnalysis) {
    let instance = match ast.instance {
        Some(ref inst) => inst,
        None => return,
    };

    // TODO: migrate populate_legacy_dependencies to JsNode
    let program = instance.content.as_json();

    // Walk the program body to find labeled statements with label "$"
    let body = match program.get("body").and_then(|b| b.as_array()) {
        Some(body) => body,
        None => return,
    };

    for stmt in body {
        let stmt_type = stmt.get("type").and_then(|t| t.as_str());
        if stmt_type != Some("LabeledStatement") {
            continue;
        }

        let label_name = stmt
            .get("label")
            .and_then(|l| l.get("name"))
            .and_then(|n| n.as_str());
        if label_name != Some("$") {
            continue;
        }

        // Check if the body is an ExpressionStatement with an AssignmentExpression
        let body = match stmt.get("body") {
            Some(body) => body,
            None => continue,
        };

        if body.get("type").and_then(|t| t.as_str()) != Some("ExpressionStatement") {
            continue;
        }

        let expr = match body.get("expression") {
            Some(expr) => expr,
            None => continue,
        };

        if expr.get("type").and_then(|t| t.as_str()) != Some("AssignmentExpression") {
            continue;
        }

        // Extract the assigned identifier(s) from the LHS
        let left = match expr.get("left") {
            Some(left) => left,
            None => continue,
        };

        let mut assigned_names = Vec::new();
        if left.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
            // For member expressions like `a.b = ...`, use the root object
            if let Some(name) = extract_object_root(left) {
                assigned_names.push(name);
            }
        } else {
            extract_each_pattern_identifiers(left, &mut assigned_names);
        }

        // Find which of these are LegacyReactive bindings
        let legacy_reactive_indices: Vec<usize> = assigned_names
            .iter()
            .filter_map(|name| {
                analysis
                    .root
                    .bindings
                    .iter()
                    .position(|b| b.name == *name && b.kind == BindingKind::LegacyReactive)
            })
            .collect();

        if legacy_reactive_indices.is_empty() {
            continue;
        }

        // Walk the RHS to find all referenced identifiers
        let right = match expr.get("right") {
            Some(right) => right,
            None => continue,
        };

        let mut dep_names = Vec::new();
        collect_identifiers_from_expr(right, &mut dep_names);

        // Also collect identifiers from the LHS that are NOT the assigned variables
        // (e.g., in `$: x = y + z`, y and z are deps but x is not)
        // The official compiler collects ALL scope references except LHS of assignments.
        // For simplicity, we collect from the entire RHS.

        // Remove assigned names from deps (they shouldn't depend on themselves)
        let assigned_set: rustc_hash::FxHashSet<&str> =
            assigned_names.iter().map(|n| n.as_str()).collect();
        dep_names.retain(|n| !assigned_set.contains(n.as_str()));

        // Look up binding indices for the dependency names
        let dep_indices: Vec<usize> = dep_names
            .iter()
            .filter_map(|name| {
                // Look up in instance scope (binding index)
                analysis.root.bindings.iter().position(|b| b.name == *name)
            })
            .collect();

        // Set legacy_dependencies on the LegacyReactive bindings
        for &binding_idx in &legacy_reactive_indices {
            analysis.root.bindings[binding_idx].legacy_dependencies = dep_indices.clone();
        }
    }
}

/// Extract the root object identifier from a MemberExpression chain.
/// E.g., `a.b.c` returns "a".
fn extract_object_root(node: &serde_json::Value) -> Option<String> {
    match node.get("type").and_then(|t| t.as_str()) {
        Some("MemberExpression") => node.get("object").and_then(extract_object_root),
        Some("Identifier") => node
            .get("name")
            .and_then(|n| n.as_str())
            .map(|s| s.to_string()),
        _ => None,
    }
}

/// Collect all identifier names from a JavaScript expression (recursively).
/// This is used to find dependencies in the RHS of reactive declarations.
fn collect_identifiers_from_expr(node: &serde_json::Value, names: &mut Vec<String>) {
    collect_identifiers_from_expr_with_locals(node, names, &Vec::new());
}

/// Collect identifiers from an expression, excluding locally-scoped identifiers.
///
/// This function properly handles function scoping: parameters of arrow functions
/// and function expressions create local bindings that shadow outer bindings.
/// These local parameter names should NOT be treated as dependencies of the
/// reactive statement.
///
/// For example, in `$: done = items.filter(item => item.done)`:
/// - `items` is a dependency (from outer scope)
/// - `item` is NOT a dependency (it's a callback parameter)
fn collect_identifiers_from_expr_with_locals(
    node: &serde_json::Value,
    names: &mut Vec<String>,
    locals: &Vec<String>,
) {
    let node_type = match node.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return,
    };

    match node_type {
        "Identifier" => {
            if let Some(name) = node.get("name").and_then(|n| n.as_str())
                && !names.contains(&name.to_string())
                && !locals.contains(&name.to_string())
            {
                names.push(name.to_string());
            }
        }
        "MemberExpression" => {
            // Only walk the object, not the property (unless computed)
            if let Some(obj) = node.get("object") {
                collect_identifiers_from_expr_with_locals(obj, names, locals);
            }
            if node
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false)
                && let Some(prop) = node.get("property")
            {
                collect_identifiers_from_expr_with_locals(prop, names, locals);
            }
        }
        "ArrowFunctionExpression" | "FunctionExpression" | "FunctionDeclaration" => {
            // Extract parameter names to create a new local scope
            let mut new_locals = locals.clone();
            if let Some(params) = node.get("params").and_then(|p| p.as_array()) {
                for param in params {
                    extract_param_names(param, &mut new_locals);
                }
            }
            // Walk the body with the extended locals list
            if let Some(body) = node.get("body") {
                collect_identifiers_from_expr_with_locals(body, names, &new_locals);
            }
        }
        "Property" | "MethodDefinition" => {
            // For object properties like `{ value: 'hello' }`, the `key` is an Identifier
            // but it's a property name, NOT a variable reference. Only walk the key if it's
            // computed (e.g., `{ [expr]: 'hello' }`).
            if node
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false)
                && let Some(key) = node.get("key")
            {
                collect_identifiers_from_expr_with_locals(key, names, locals);
            }
            // Always walk the value/body
            if let Some(value) = node.get("value") {
                collect_identifiers_from_expr_with_locals(value, names, locals);
            }
        }
        _ => {
            // For known expression types, walk fields in AST-semantic order
            // to ensure consistent identifier ordering (serde_json::Map uses
            // BTreeMap which iterates alphabetically, giving wrong order).
            let ordered_fields: Option<&[&str]> = match node_type {
                "ConditionalExpression" => Some(&["test", "consequent", "alternate"]),
                "BinaryExpression" | "LogicalExpression" => Some(&["left", "right"]),
                "AssignmentExpression" | "AssignmentPattern" => Some(&["left", "right"]),
                "UnaryExpression" | "UpdateExpression" => Some(&["argument"]),
                "CallExpression" | "NewExpression" => Some(&["callee", "arguments"]),
                "SequenceExpression" => Some(&["expressions"]),
                "ArrayExpression" => Some(&["elements"]),
                "ObjectExpression" => Some(&["properties"]),
                "SpreadElement" => Some(&["argument"]),
                "TemplateLiteral" => Some(&["expressions", "quasis"]),
                "TaggedTemplateExpression" => Some(&["tag", "quasi"]),
                "YieldExpression" | "AwaitExpression" => Some(&["argument"]),
                "ChainExpression" => Some(&["expression"]),
                _ => None,
            };

            if let Some(fields) = ordered_fields {
                // Walk fields in specified order
                for field in fields {
                    if let Some(val) = node.get(*field) {
                        if val.is_object() {
                            collect_identifiers_from_expr_with_locals(val, names, locals);
                        } else if let Some(arr) = val.as_array() {
                            for item in arr {
                                if item.is_object() {
                                    collect_identifiers_from_expr_with_locals(item, names, locals);
                                }
                            }
                        }
                    }
                }
            } else {
                // Fallback: walk all value fields (alphabetical order from BTreeMap)
                if let Some(obj) = node.as_object() {
                    for (key, val) in obj {
                        if key == "type" || key == "start" || key == "end" || key == "loc" {
                            continue;
                        }
                        if val.is_object() {
                            collect_identifiers_from_expr_with_locals(val, names, locals);
                        } else if val.is_array()
                            && let Some(arr) = val.as_array()
                        {
                            for item in arr {
                                if item.is_object() {
                                    collect_identifiers_from_expr_with_locals(item, names, locals);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/// Extract parameter names from a function parameter node.
///
/// Handles simple identifiers, destructured patterns, default values, and rest elements.
fn extract_param_names(param: &serde_json::Value, names: &mut Vec<String>) {
    let param_type = param.get("type").and_then(|t| t.as_str());
    match param_type {
        Some("Identifier") => {
            if let Some(name) = param.get("name").and_then(|n| n.as_str())
                && !names.contains(&name.to_string())
            {
                names.push(name.to_string());
            }
        }
        Some("AssignmentPattern") => {
            // Default parameter: `param = default`
            if let Some(left) = param.get("left") {
                extract_param_names(left, names);
            }
        }
        Some("RestElement") => {
            if let Some(arg) = param.get("argument") {
                extract_param_names(arg, names);
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = param.get("properties").and_then(|p| p.as_array()) {
                for prop in props {
                    let prop_type = prop.get("type").and_then(|t| t.as_str());
                    if prop_type == Some("RestElement") {
                        if let Some(arg) = prop.get("argument") {
                            extract_param_names(arg, names);
                        }
                    } else if let Some(value) = prop.get("value") {
                        extract_param_names(value, names);
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = param.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        extract_param_names(elem, names);
                    }
                }
            }
        }
        _ => {}
    }
}

/// Extract identifier names from a destructuring pattern.
fn extract_each_pattern_identifiers(node: &serde_json::Value, names: &mut Vec<String>) {
    let node_type = node.get("type").and_then(|t| t.as_str());
    match node_type {
        Some("Identifier") => {
            if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
                names.push(name.to_string());
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = node.get("properties").and_then(|p| p.as_array()) {
                for prop in props {
                    let prop_type = prop.get("type").and_then(|t| t.as_str());
                    if prop_type == Some("RestElement") {
                        if let Some(arg) = prop.get("argument") {
                            extract_each_pattern_identifiers(arg, names);
                        }
                    } else if let Some(value) = prop.get("value") {
                        extract_each_pattern_identifiers(value, names);
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        extract_each_pattern_identifiers(elem, names);
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = node.get("left") {
                extract_each_pattern_identifiers(left, names);
            }
        }
        Some("RestElement") => {
            if let Some(arg) = node.get("argument") {
                extract_each_pattern_identifiers(arg, names);
            }
        }
        _ => {}
    }
}

/// Extract identifier names from a destructuring pattern (JsNode version).
/// Uses JSON fallback for arena-dependent fields to avoid threading ParseArena.
fn extract_each_pattern_identifiers_node(node: &JsNode, names: &mut Vec<String>) {
    match node {
        JsNode::Identifier { name, .. } => {
            names.push(name.to_string());
        }
        // For complex patterns with arena-dependent fields, fall back to JSON
        JsNode::ObjectPattern { .. }
        | JsNode::ArrayPattern { .. }
        | JsNode::AssignmentPattern { .. }
        | JsNode::RestElement { .. } => {
            let json = node.to_value();
            extract_each_pattern_identifiers(&json, names);
        }
        // Raw fallback
        JsNode::Raw(v) => {
            extract_each_pattern_identifiers(v, names);
        }
        _ => {}
    }
}

// CSS scoping functions moved to css_scoping.rs module.

/// Analyze a Svelte module (context="module" script).
///
/// Corresponds to `analyze_module` in Svelte's `2-analyze/index.js`.
///
/// # Arguments
///
/// * `source` - The module source code
/// * `options` - Compile options
///
/// # Returns
///
/// Returns a `ModuleAnalysis` containing semantic information.
pub fn analyze_module(
    _source: &str,
    options: &CompileOptions,
) -> Result<ModuleAnalysis, AnalysisError> {
    let analysis = ModuleAnalysis {
        name: options.filename.clone(),
        runes: true,
        immutable: true,
    };

    Ok(analysis)
}

/// Module analysis result.
#[derive(Debug)]
pub struct ModuleAnalysis {
    /// Module name
    pub name: Option<String>,
    /// Whether the module uses runes
    pub runes: bool,
    /// Whether the module uses immutable mode
    pub immutable: bool,
}

/// Error type for analysis failures.
#[derive(Debug)]
pub enum AnalysisError {
    /// Scope-related error
    Scope(String),
    /// Validation error (generic, legacy)
    Validation(String),
    /// CSS analysis error
    Css(String),
    /// Validation error with error code (Svelte-compatible format)
    /// The code is the Svelte error code (e.g., "attribute_duplicate")
    ValidationWithCode { code: String, message: String },
}

impl AnalysisError {
    /// Create a validation error with code
    pub fn validation(code: &str, message: impl Into<String>) -> Self {
        AnalysisError::ValidationWithCode {
            code: code.to_string(),
            message: message.into(),
        }
    }
}

impl std::fmt::Display for AnalysisError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AnalysisError::Scope(msg) => write!(f, "Scope error: {}", msg),
            AnalysisError::Validation(msg) => write!(f, "Validation error: {}", msg),
            AnalysisError::Css(msg) => write!(f, "CSS error: {}", msg),
            AnalysisError::ValidationWithCode { code, message } => {
                write!(f, "{}: {}", code, message)
            }
        }
    }
}

impl std::error::Error for AnalysisError {}

impl From<crate::error::ParseError> for AnalysisError {
    fn from(err: crate::error::ParseError) -> Self {
        match err {
            crate::error::ParseError::SvelteError { code, message, .. } => {
                AnalysisError::ValidationWithCode { code, message }
            }
            crate::error::ParseError::TypeScriptInvalidFeature { feature, .. } => {
                AnalysisError::ValidationWithCode {
                    code: "typescript_invalid_feature".to_string(),
                    message: format!(
                        "TypeScript language features like {} are not natively supported",
                        feature
                    ),
                }
            }
            other => AnalysisError::Validation(format!("{}", other)),
        }
    }
}

/// Reserved identifiers that cannot be declared.
pub const RESERVED: &[&str] = &["$$props", "$$restProps", "$$slots"];

/// Get the component name from a filename.
///
/// Matches Svelte's `get_component_name()` in `2-analyze/index.js`.
pub fn get_component_name(filename: &str) -> String {
    let parts: Vec<&str> = filename.split(['/', '\\']).collect();
    let basename = parts.last().unwrap_or(&"Component");
    let last_dir = if parts.len() > 1 {
        parts.get(parts.len() - 2).copied()
    } else {
        None
    };

    let mut name = basename.replace(".svelte", "");

    // If name is "index" and there's a parent dir (not "src"), use the parent dir name
    if name == "index"
        && let Some(dir) = last_dir
        && dir != "src"
        && !dir.is_empty()
    {
        name = dir.to_string();
    }

    // Capitalize first letter
    let mut chars = name.chars();
    match chars.next() {
        None => "Component".to_string(),
        Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
    }
}

/// Order reactive statements ($: statements) based on their dependencies.
///
/// This performs a topological sort of reactive statements to ensure they execute
/// in the correct order. It also detects circular dependencies.
///
/// Corresponds to `order_reactive_statements()` in Svelte's `2-analyze/index.js`.
///
/// # Arguments
///
/// * `unsorted_reactive_declarations` - Unordered map of reactive statements
///
/// # Returns
///
/// Returns an ordered vector of (statement_key, ReactiveStatement) tuples sorted by dependencies.
/// The order is preserved using insertion order.
///
/// # Errors
///
/// Returns an error if a circular dependency is detected.
pub fn order_reactive_statements(
    unsorted_reactive_declarations: rustc_hash::FxHashMap<String, ReactiveStatement>,
) -> Result<Vec<(String, ReactiveStatement)>, AnalysisError> {
    use rustc_hash::{FxHashMap, FxHashSet};

    // Build a lookup map: binding_index -> list of (statement_key, ReactiveStatement)
    let mut lookup: FxHashMap<usize, Vec<(String, ReactiveStatement)>> = FxHashMap::default();

    for (key, declaration) in &unsorted_reactive_declarations {
        for &assignment_idx in &declaration.assignments {
            lookup
                .entry(assignment_idx)
                .or_default()
                .push((key.clone(), declaration.clone()));
        }
    }

    // Build dependency edges for cycle detection
    // Edge: (assignment_binding_index, dependency_binding_index)
    let mut edges: Vec<(usize, usize)> = Vec::new();

    for declaration in unsorted_reactive_declarations.values() {
        for &assignment in &declaration.assignments {
            for &dependency in &declaration.dependencies {
                // Only add edge if dependency is not also an assignment
                // (self-assignments are allowed)
                if !declaration.assignments.contains(&dependency) {
                    edges.push((assignment, dependency));
                }
            }
        }
    }

    // Check for cycles using depth-first search
    if let Some(cycle) = utils::check_graph_for_cycles(&edges) {
        // The cycle contains binding indices
        // Format them as "idx1 → idx2 → idx3 → idx1"
        let cycle_str = cycle
            .iter()
            .map(|idx| idx.to_string())
            .collect::<Vec<_>>()
            .join(" → ");
        return Err(errors::reactive_declaration_cycle(&cycle_str));
    }

    // Build the ordered list using dependency ordering
    let mut reactive_declarations: Vec<(String, ReactiveStatement)> = Vec::new();
    let mut added_declarations: FxHashSet<String> = FxHashSet::default();

    // Recursive function to add a declaration and its dependencies
    fn add_declaration(
        key: &str,
        declaration: &ReactiveStatement,
        reactive_declarations: &mut Vec<(String, ReactiveStatement)>,
        added_declarations: &mut FxHashSet<String>,
        lookup: &FxHashMap<usize, Vec<(String, ReactiveStatement)>>,
    ) {
        // If already added, skip
        if added_declarations.contains(key) {
            return;
        }

        // First, add all dependencies (that are not also assignments in this declaration)
        for &dependency_idx in &declaration.dependencies {
            if declaration.assignments.contains(&dependency_idx) {
                continue;
            }

            // Find all statements that assign to this dependency and add them first
            if let Some(earlier_statements) = lookup.get(&dependency_idx) {
                for (earlier_key, earlier_decl) in earlier_statements {
                    add_declaration(
                        earlier_key,
                        earlier_decl,
                        reactive_declarations,
                        added_declarations,
                        lookup,
                    );
                }
            }
        }

        // Now add this declaration
        reactive_declarations.push((key.to_string(), declaration.clone()));
        added_declarations.insert(key.to_string());
    }

    // Add all declarations in dependency order
    for (key, declaration) in &unsorted_reactive_declarations {
        add_declaration(
            key,
            declaration,
            &mut reactive_declarations,
            &mut added_declarations,
            &lookup,
        );
    }

    Ok(reactive_declarations)
}

/// Check if a template fragment contains top-level AwaitExpression nodes.
///
/// This walks the template AST looking for AwaitExpression in expression positions
/// (e.g., `{await expr}` in ExpressionTag), NOT `{#await}` block syntax.
///
/// Corresponds to `has_await` from `create_scopes()` in the official Svelte compiler,
/// which tracks AwaitExpression nodes not nested inside function bodies.
#[allow(dead_code)]
/// Results from a combined fragment AST check for both await expressions and rune references.
/// This allows a single traversal of the template AST to detect both features simultaneously.
#[derive(Default)]
struct FragmentCheckResults {
    has_await: bool,
    has_rune_reference: bool,
}

impl FragmentCheckResults {
    fn all_found(&self) -> bool {
        self.has_await && self.has_rune_reference
    }

    fn merge(&mut self, other: &FragmentCheckResults) {
        self.has_await = self.has_await || other.has_await;
        self.has_rune_reference = self.has_rune_reference || other.has_rune_reference;
    }

    fn merge_json(&mut self, other: &JsonCheckResults) {
        self.has_await = self.has_await || other.has_await;
        self.has_rune_reference = self.has_rune_reference || other.has_rune_reference;
    }
}

/// Check a template fragment for both await expressions and rune references in a single walk.
fn fragment_check_features(
    fragment: &crate::ast::template::Fragment,
    store_subs: &rustc_hash::FxHashSet<&str>,
) -> FragmentCheckResults {
    let mut results = FragmentCheckResults::default();
    for node in &fragment.nodes {
        let node_results = node_check_features(node, store_subs);
        results.merge(&node_results);
        if results.all_found() {
            return results;
        }
    }
    results
}

/// Check if a template node contains an AwaitExpression and/or rune references in a single walk.
///
/// Key semantic differences between await and rune checks:
/// - SnippetBlock: await check returns false (awaits in snippets don't affect parent),
///   but rune check walks the body (rune references anywhere indicate runes mode).
fn node_check_features(
    node: &crate::ast::template::TemplateNode,
    store_subs: &rustc_hash::FxHashSet<&str>,
) -> FragmentCheckResults {
    use crate::ast::template::TemplateNode;

    match node {
        TemplateNode::ExpressionTag(tag) => {
            let json_results = expression_check_features(&tag.expression, store_subs);
            FragmentCheckResults {
                has_await: json_results.has_await,
                has_rune_reference: json_results.has_rune_reference,
            }
        }
        TemplateNode::RegularElement(elem) => {
            let mut results = FragmentCheckResults::default();
            for attr in &elem.attributes {
                let attr_results = attribute_check_features(attr, store_subs);
                results.merge(&attr_results);
                if results.all_found() {
                    return results;
                }
            }
            let frag_results = fragment_check_features(&elem.fragment, store_subs);
            results.merge(&frag_results);
            results
        }
        TemplateNode::Component(comp) => {
            let mut results = FragmentCheckResults::default();
            for attr in &comp.attributes {
                let attr_results = attribute_check_features(attr, store_subs);
                results.merge(&attr_results);
                if results.all_found() {
                    return results;
                }
            }
            let frag_results = fragment_check_features(&comp.fragment, store_subs);
            results.merge(&frag_results);
            results
        }
        TemplateNode::IfBlock(block) => {
            let mut results = FragmentCheckResults::default();
            let expr_results = expression_check_features(&block.test, store_subs);
            results.merge_json(&expr_results);
            if results.all_found() {
                return results;
            }
            let cons_results = fragment_check_features(&block.consequent, store_subs);
            results.merge(&cons_results);
            if results.all_found() {
                return results;
            }
            if let Some(ref alternate) = block.alternate {
                let alt_results = fragment_check_features(alternate, store_subs);
                results.merge(&alt_results);
            }
            results
        }
        TemplateNode::EachBlock(block) => {
            let mut results = FragmentCheckResults::default();
            let expr_results = expression_check_features(&block.expression, store_subs);
            results.merge_json(&expr_results);
            if results.all_found() {
                return results;
            }
            let body_results = fragment_check_features(&block.body, store_subs);
            results.merge(&body_results);
            if results.all_found() {
                return results;
            }
            if let Some(ref fallback) = block.fallback {
                let fb_results = fragment_check_features(fallback, store_subs);
                results.merge(&fb_results);
            }
            results
        }
        TemplateNode::KeyBlock(block) => {
            let mut results = FragmentCheckResults::default();
            let expr_results = expression_check_features(&block.expression, store_subs);
            results.merge_json(&expr_results);
            if results.all_found() {
                return results;
            }
            let frag_results = fragment_check_features(&block.fragment, store_subs);
            results.merge(&frag_results);
            results
        }
        TemplateNode::AwaitBlock(block) => {
            let mut results = FragmentCheckResults::default();
            let expr_results = expression_check_features(&block.expression, store_subs);
            results.merge_json(&expr_results);
            if results.all_found() {
                return results;
            }
            if let Some(ref pending) = block.pending {
                let p_results = fragment_check_features(pending, store_subs);
                results.merge(&p_results);
                if results.all_found() {
                    return results;
                }
            }
            if let Some(ref then) = block.then {
                let t_results = fragment_check_features(then, store_subs);
                results.merge(&t_results);
                if results.all_found() {
                    return results;
                }
            }
            if let Some(ref catch) = block.catch {
                let c_results = fragment_check_features(catch, store_subs);
                results.merge(&c_results);
            }
            results
        }
        TemplateNode::SnippetBlock(block) => {
            // SnippetBlock: await check returns false (awaits in snippets don't affect parent),
            // but rune check walks the body (rune references anywhere indicate runes mode).
            let body_results = fragment_check_features(&block.body, store_subs);
            FragmentCheckResults {
                has_await: false,
                has_rune_reference: body_results.has_rune_reference,
            }
        }
        TemplateNode::SvelteBoundary(elem)
        | TemplateNode::SvelteBody(elem)
        | TemplateNode::SvelteDocument(elem)
        | TemplateNode::SvelteFragment(elem)
        | TemplateNode::SvelteHead(elem)
        | TemplateNode::SvelteOptions(elem)
        | TemplateNode::SvelteWindow(elem) => {
            let mut results = FragmentCheckResults::default();
            for attr in &elem.attributes {
                let attr_results = attribute_check_features(attr, store_subs);
                results.merge(&attr_results);
                if results.all_found() {
                    return results;
                }
            }
            let frag_results = fragment_check_features(&elem.fragment, store_subs);
            results.merge(&frag_results);
            results
        }
        TemplateNode::SvelteSelf(elem) => {
            let mut results = FragmentCheckResults::default();
            for attr in &elem.attributes {
                let attr_results = attribute_check_features(attr, store_subs);
                results.merge(&attr_results);
                if results.all_found() {
                    return results;
                }
            }
            let frag_results = fragment_check_features(&elem.fragment, store_subs);
            results.merge(&frag_results);
            results
        }
        TemplateNode::SvelteComponent(elem) => {
            let mut results = FragmentCheckResults::default();
            for attr in &elem.attributes {
                let attr_results = attribute_check_features(attr, store_subs);
                results.merge(&attr_results);
                if results.all_found() {
                    return results;
                }
            }
            let frag_results = fragment_check_features(&elem.fragment, store_subs);
            results.merge(&frag_results);
            results
        }
        TemplateNode::SvelteElement(elem) => {
            let mut results = FragmentCheckResults::default();
            for attr in &elem.attributes {
                let attr_results = attribute_check_features(attr, store_subs);
                results.merge(&attr_results);
                if results.all_found() {
                    return results;
                }
            }
            let frag_results = fragment_check_features(&elem.fragment, store_subs);
            results.merge(&frag_results);
            results
        }
        TemplateNode::TitleElement(elem) => {
            let mut results = FragmentCheckResults::default();
            for attr in &elem.attributes {
                let attr_results = attribute_check_features(attr, store_subs);
                results.merge(&attr_results);
                if results.all_found() {
                    return results;
                }
            }
            let frag_results = fragment_check_features(&elem.fragment, store_subs);
            results.merge(&frag_results);
            results
        }
        TemplateNode::SlotElement(elem) => {
            let mut results = FragmentCheckResults::default();
            for attr in &elem.attributes {
                let attr_results = attribute_check_features(attr, store_subs);
                results.merge(&attr_results);
                if results.all_found() {
                    return results;
                }
            }
            let frag_results = fragment_check_features(&elem.fragment, store_subs);
            results.merge(&frag_results);
            results
        }
        TemplateNode::RenderTag(tag) => {
            let json_results = expression_check_features(&tag.expression, store_subs);
            FragmentCheckResults {
                has_await: json_results.has_await,
                has_rune_reference: json_results.has_rune_reference,
            }
        }
        TemplateNode::HtmlTag(tag) => {
            let json_results = expression_check_features(&tag.expression, store_subs);
            FragmentCheckResults {
                has_await: json_results.has_await,
                has_rune_reference: json_results.has_rune_reference,
            }
        }
        TemplateNode::ConstTag(tag) => {
            let json_results = expression_check_features(&tag.declaration, store_subs);
            FragmentCheckResults {
                has_await: json_results.has_await,
                has_rune_reference: json_results.has_rune_reference,
            }
        }
        _ => FragmentCheckResults::default(),
    }
}

/// Results from a combined JSON AST check for both await expressions and rune references.
/// This allows a single traversal of the JSON AST to detect both features simultaneously.
#[derive(Default)]
struct JsonCheckResults {
    has_await: bool,
    has_rune_reference: bool,
}

impl JsonCheckResults {
    fn all_found(&self) -> bool {
        self.has_await && self.has_rune_reference
    }

    fn merge(&mut self, other: &JsonCheckResults) {
        self.has_await = self.has_await || other.has_await;
        self.has_rune_reference = self.has_rune_reference || other.has_rune_reference;
    }
}

/// Check if an expression (stored as JSON) contains an AwaitExpression and/or rune references
/// in a single traversal.
fn expression_check_features(
    expr: &crate::ast::js::Expression,
    store_subs: &rustc_hash::FxHashSet<&str>,
) -> JsonCheckResults {
    // TODO: migrate json_check_features to JsNode walker
    let value = expr.as_json();
    json_check_features(value, store_subs)
}

/// Check if a name is a rune identifier.
///
/// Corresponds to the `is_rune()` function in Svelte's `utils.js`.
/// This checks the base identifier name (e.g., `$state`, `$effect`, `$inspect`).
fn is_rune_name(name: &str) -> bool {
    matches!(
        name,
        "$state" | "$derived" | "$props" | "$bindable" | "$effect" | "$inspect" | "$host"
    )
}

/// Recursively check a JSON AST node for both AwaitExpression and rune identifier references
/// in a single pass.
///
/// For await detection:
/// - Stops at function boundaries (FunctionExpression, ArrowFunctionExpression, FunctionDeclaration)
///   but continues checking for rune references past those boundaries.
///
/// For rune detection:
/// - Does NOT stop at function boundaries because rune references inside functions still
///   indicate runes mode.
/// - Skips label properties of LabeledStatement, non-computed property keys in
///   MemberExpressions, and non-computed keys in Property nodes.
///
/// The `inside_function` parameter tracks whether we are inside a function boundary,
/// which suppresses await detection while still allowing rune detection.
fn json_check_features(
    node: &serde_json::Value,
    store_subs: &rustc_hash::FxHashSet<&str>,
) -> JsonCheckResults {
    json_check_features_inner(node, store_subs, false)
}

fn json_check_features_inner(
    node: &serde_json::Value,
    store_subs: &rustc_hash::FxHashSet<&str>,
    inside_function: bool,
) -> JsonCheckResults {
    let mut results = JsonCheckResults::default();
    let node_type = node.get("type").and_then(|t| t.as_str());

    // Check for AwaitExpression (only if not inside a function boundary)
    if !inside_function && node_type == Some("AwaitExpression") {
        results.has_await = true;
        // Don't return early - still need to check children for rune references
    }

    // Check if this is an Identifier with a rune name
    if node_type == Some("Identifier")
        && let Some(name) = node.get("name").and_then(|n| n.as_str())
        && is_rune_name(name)
        && !store_subs.contains(name)
    {
        results.has_rune_reference = true;
    }

    // Early exit if both features found
    if results.all_found() {
        return results;
    }

    // Determine if we're entering a function boundary
    let is_function_boundary = matches!(
        node_type,
        Some("FunctionExpression" | "ArrowFunctionExpression" | "FunctionDeclaration")
    );
    let child_inside_function = inside_function || is_function_boundary;

    match node {
        serde_json::Value::Object(map) => {
            for (key, val) in map {
                if key == "type" || key == "start" || key == "end" || key == "loc" {
                    continue;
                }
                // Skip the "label" property of LabeledStatement nodes for rune check.
                // Labels like `$effect:` contain Identifiers with rune names but
                // they are NOT rune references - they are just label declarations.
                // Without this check, `$effect: if (obj) x++` would falsely trigger
                // runes mode detection, causing `export let` to be rejected.
                //
                // For the await check, labels can't contain AwaitExpression, so skipping is safe.
                if key == "label" && node_type == Some("LabeledStatement") {
                    continue;
                }
                // Skip property keys in non-computed MemberExpressions and Properties for rune check.
                // `foo.$state` should not be treated as a rune reference.
                //
                // For the await check, property keys can't contain AwaitExpression, so skipping is safe.
                if key == "property"
                    && node_type == Some("MemberExpression")
                    && !node
                        .get("computed")
                        .and_then(|c| c.as_bool())
                        .unwrap_or(false)
                {
                    continue;
                }
                // Skip the "key" field of non-computed Property nodes for rune check.
                // { $state: value } should not be treated as a rune reference.
                //
                // For the await check, non-computed keys can't contain AwaitExpression, so skipping is safe.
                if key == "key"
                    && node_type == Some("Property")
                    && !node
                        .get("computed")
                        .and_then(|c| c.as_bool())
                        .unwrap_or(false)
                {
                    continue;
                }
                let child_results =
                    json_check_features_inner(val, store_subs, child_inside_function);
                results.merge(&child_results);
                if results.all_found() {
                    return results;
                }
            }
        }
        serde_json::Value::Array(arr) => {
            for val in arr {
                let child_results =
                    json_check_features_inner(val, store_subs, child_inside_function);
                results.merge(&child_results);
                if results.all_found() {
                    return results;
                }
            }
        }
        _ => {}
    }

    results
}

/// Check if an attribute contains both await expressions and rune references in a single walk.
///
/// This combines the checks previously done by `attribute_has_await` and `attribute_has_rune_reference`.
/// Note: The await check covers more attribute types (ClassDirective, StyleDirective, SpreadAttribute)
/// than the rune check (which only checks Attribute, OnDirective, BindDirective).
fn attribute_check_features(
    attr: &crate::ast::template::Attribute,
    store_subs: &rustc_hash::FxHashSet<&str>,
) -> FragmentCheckResults {
    use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart};

    match attr {
        Attribute::Attribute(attr_node) => match &attr_node.value {
            AttributeValue::Expression(expr_tag) => {
                let r = expression_check_features(&expr_tag.expression, store_subs);
                FragmentCheckResults {
                    has_await: r.has_await,
                    has_rune_reference: r.has_rune_reference,
                }
            }
            AttributeValue::Sequence(parts) => {
                let mut results = FragmentCheckResults::default();
                for part in parts {
                    if let AttributeValuePart::ExpressionTag(expr_tag) = part {
                        let r = expression_check_features(&expr_tag.expression, store_subs);
                        results.merge_json(&r);
                        if results.all_found() {
                            return results;
                        }
                    }
                }
                results
            }
            _ => FragmentCheckResults::default(),
        },
        Attribute::OnDirective(dir) => {
            if let Some(ref expr) = dir.expression {
                let r = expression_check_features(expr, store_subs);
                FragmentCheckResults {
                    has_await: r.has_await,
                    has_rune_reference: r.has_rune_reference,
                }
            } else {
                FragmentCheckResults::default()
            }
        }
        Attribute::BindDirective(dir) => {
            let r = expression_check_features(&dir.expression, store_subs);
            FragmentCheckResults {
                has_await: r.has_await,
                has_rune_reference: r.has_rune_reference,
            }
        }
        Attribute::ClassDirective(dir) => {
            // Only await check applies here (rune check originally skipped this)
            let r = expression_check_features(&dir.expression, store_subs);
            FragmentCheckResults {
                has_await: r.has_await,
                has_rune_reference: false,
            }
        }
        Attribute::StyleDirective(dir) => {
            // Only await check applies here (rune check originally skipped this)
            match &dir.value {
                crate::ast::template::AttributeValue::Expression(expr_tag) => {
                    let r = expression_check_features(&expr_tag.expression, store_subs);
                    FragmentCheckResults {
                        has_await: r.has_await,
                        has_rune_reference: false,
                    }
                }
                crate::ast::template::AttributeValue::Sequence(parts) => {
                    let mut results = FragmentCheckResults::default();
                    for part in parts {
                        if let crate::ast::template::AttributeValuePart::ExpressionTag(expr_tag) =
                            part
                        {
                            let r = expression_check_features(&expr_tag.expression, store_subs);
                            results.has_await = results.has_await || r.has_await;
                            if results.has_await {
                                return results;
                            }
                        }
                    }
                    results
                }
                _ => FragmentCheckResults::default(),
            }
        }
        Attribute::SpreadAttribute(spread) => {
            // Only await check applies here (rune check originally skipped this)
            let r = expression_check_features(&spread.expression, store_subs);
            FragmentCheckResults {
                has_await: r.has_await,
                has_rune_reference: false,
            }
        }
        _ => FragmentCheckResults::default(),
    }
}

/// Mark EachBlocks that contain bind:group directives referencing their items.
///
/// This post-analysis pass walks the template recursively, maintaining a stack of
/// ancestor EachBlocks. When a bind:group directive is found, it extracts the
/// identifier from the binding expression and marks any ancestor EachBlock that
/// declares that identifier with `contains_group_binding = true`.
///
/// It also assigns unique index names ($$index, $$index_1, etc.) to these EachBlocks,
/// which are used by the transform phase to generate the correct `indexes` array
/// for `$.bind_group()` calls.
///
/// Corresponds to: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/BindDirective.js
/// lines 229-242 (the `parent.metadata.contains_group_binding = true` logic).
fn mark_each_block_group_bindings(
    fragment: &mut crate::ast::template::Fragment,
    index_counter: &mut usize,
    analysis: &mut ComponentAnalysis,
) {
    // Step 1: Assign unique metadata.index to ALL each blocks in POST-ORDER traversal.
    // This matches the official Svelte compiler's create_scopes phase which assigns
    // scope.root.unique('$$index') to each EachBlock in post-order (children before parents).
    assign_each_block_indices_in_fragment(fragment, index_counter);

    // Step 2: Mark contains_group_binding for each blocks that contain bind:group directives.
    // Also assigns unique binding_group_name to each marked EachBlock.
    // Walk with a mutable stack of ancestor EachBlocks (raw pointers for mutation)
    let mut ancestor_stack: Vec<*mut crate::ast::template::EachBlock> = Vec::new();
    mark_group_bindings_in_fragment(fragment, &mut ancestor_stack, analysis);
}

/// Phase 1: Assign unique $$index_N names to ALL each blocks in post-order traversal.
/// This ensures consistent numbering that matches the official compiler.
fn assign_each_block_indices_in_fragment(
    fragment: &mut crate::ast::template::Fragment,
    index_counter: &mut usize,
) {
    for node in &mut fragment.nodes {
        assign_each_block_indices_in_node(node, index_counter);
    }
}

fn assign_each_block_indices_in_node(
    node: &mut crate::ast::template::TemplateNode,
    index_counter: &mut usize,
) {
    use crate::ast::template::TemplateNode;
    match node {
        TemplateNode::EachBlock(each) => {
            // Post-order: visit children FIRST
            assign_each_block_indices_in_fragment(&mut each.body, index_counter);
            if let Some(ref mut fallback) = each.fallback {
                assign_each_block_indices_in_fragment(fallback, index_counter);
            }
            // Then assign index to this each block
            // Naming: $$index (first), $$index_1, $$index_2, ...
            let idx_name = if *index_counter == 0 {
                "$$index".to_string()
            } else {
                format!("$$index_{}", index_counter)
            };
            *index_counter += 1;
            each.metadata.index = Some(idx_name);
        }
        TemplateNode::RegularElement(el) => {
            assign_each_block_indices_in_fragment(&mut el.fragment, index_counter);
        }
        TemplateNode::Component(comp) => {
            assign_each_block_indices_in_fragment(&mut comp.fragment, index_counter);
        }
        TemplateNode::SvelteComponent(comp) => {
            assign_each_block_indices_in_fragment(&mut comp.fragment, index_counter);
        }
        TemplateNode::SvelteElement(el) => {
            assign_each_block_indices_in_fragment(&mut el.fragment, index_counter);
        }
        TemplateNode::SvelteSelf(s) => {
            assign_each_block_indices_in_fragment(&mut s.fragment, index_counter);
        }
        TemplateNode::IfBlock(if_block) => {
            assign_each_block_indices_in_fragment(&mut if_block.consequent, index_counter);
            if let Some(ref mut alt) = if_block.alternate {
                assign_each_block_indices_in_fragment(alt, index_counter);
            }
        }
        TemplateNode::AwaitBlock(await_block) => {
            if let Some(ref mut pending) = await_block.pending {
                assign_each_block_indices_in_fragment(pending, index_counter);
            }
            if let Some(ref mut then) = await_block.then {
                assign_each_block_indices_in_fragment(then, index_counter);
            }
            if let Some(ref mut catch) = await_block.catch {
                assign_each_block_indices_in_fragment(catch, index_counter);
            }
        }
        TemplateNode::KeyBlock(key) => {
            assign_each_block_indices_in_fragment(&mut key.fragment, index_counter);
        }
        TemplateNode::SnippetBlock(snippet) => {
            assign_each_block_indices_in_fragment(&mut snippet.body, index_counter);
        }
        TemplateNode::SvelteHead(head) => {
            assign_each_block_indices_in_fragment(&mut head.fragment, index_counter);
        }
        TemplateNode::SlotElement(slot) => {
            assign_each_block_indices_in_fragment(&mut slot.fragment, index_counter);
        }
        TemplateNode::SvelteBoundary(boundary) => {
            assign_each_block_indices_in_fragment(&mut boundary.fragment, index_counter);
        }
        TemplateNode::SvelteBody(el) => {
            assign_each_block_indices_in_fragment(&mut el.fragment, index_counter);
        }
        TemplateNode::SvelteWindow(el) => {
            assign_each_block_indices_in_fragment(&mut el.fragment, index_counter);
        }
        TemplateNode::SvelteDocument(el) => {
            assign_each_block_indices_in_fragment(&mut el.fragment, index_counter);
        }
        TemplateNode::TitleElement(el) => {
            assign_each_block_indices_in_fragment(&mut el.fragment, index_counter);
        }
        _ => {}
    }
}

fn mark_group_bindings_in_fragment(
    fragment: &mut crate::ast::template::Fragment,
    ancestor_stack: &mut Vec<*mut crate::ast::template::EachBlock>,
    analysis: &mut ComponentAnalysis,
) {
    for node in &mut fragment.nodes {
        mark_group_bindings_in_node(node, ancestor_stack, analysis);
    }
}

fn mark_group_bindings_in_node(
    node: &mut crate::ast::template::TemplateNode,
    ancestor_stack: &mut Vec<*mut crate::ast::template::EachBlock>,
    analysis: &mut ComponentAnalysis,
) {
    use crate::ast::template::{Attribute, TemplateNode};

    match node {
        TemplateNode::EachBlock(each) => {
            // Push this each block onto the ancestor stack
            let each_ptr: *mut crate::ast::template::EachBlock = &mut **each as *mut _;
            ancestor_stack.push(each_ptr);

            // Visit body (and fallback)
            mark_group_bindings_in_fragment(&mut each.body, ancestor_stack, analysis);
            if let Some(ref mut fallback) = each.fallback {
                mark_group_bindings_in_fragment(fallback, ancestor_stack, analysis);
            }

            // Pop from ancestor stack
            ancestor_stack.pop();
        }
        TemplateNode::RegularElement(el) => {
            // Check attributes for bind:group directives
            for attr in &el.attributes {
                if let Attribute::BindDirective(bind) = attr
                    && bind.name == "group"
                {
                    // Extract ALL identifier names from the binding expression.
                    // For `bind:group={selected_array[index]}`, this gives [selected_array, index].
                    // This mirrors the official compiler's extract_all_identifiers_from_expression().
                    let mut ids: Vec<String> = Vec::new();
                    let bind_node = bind.expression.as_node();
                    extract_all_identifiers_from_node(&bind_node, &mut ids);

                    // Compute the keypath for this expression (used as binding group key).
                    // This mirrors the official compiler's keypath from extract_all_identifiers_from_expression.
                    // Example: `$order.scoops` → "$order.scoops", `list[key]` → "list.[key]"
                    let keypath = build_binding_keypath_node(&bind_node);

                    // Walk ancestor each blocks from innermost to outermost.
                    // For each each block, check if any of the current `ids` are declared by it.
                    // If so, mark it as contains_group_binding.
                    // This mirrors: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/BindDirective.js L227-242
                    //
                    // KEY INVARIANT: One bind:group expression = ONE binding group.
                    // All ancestor EachBlocks matched for the same bind:group expression share the same group name.
                    // We first collect ALL matched each blocks, then assign ONE group name to all of them.
                    let mut matched_each_ptrs: Vec<*mut crate::ast::template::EachBlock> =
                        Vec::new();
                    let mut ids_for_matching = ids.clone();
                    for each_ptr in ancestor_stack.iter().rev() {
                        // SAFETY: We're the only one with access to this node while
                        // processing. The raw pointer is valid for the duration of the
                        // parent call since it came from a mutable reference.
                        let each = unsafe { &**each_ptr };

                        // Collect all identifiers declared by this each block
                        // (both the context pattern and the index variable)
                        let mut declared: Vec<String> = Vec::new();
                        if let Some(ref ctx) = each.context {
                            let ctx_node = ctx.as_node();
                            extract_each_pattern_identifiers_node(&ctx_node, &mut declared);
                        }
                        if let Some(ref idx) = each.index {
                            declared.push(idx.to_string());
                        }

                        // Check if any of the current binding expression identifiers
                        // are declared by this each block
                        let references: Vec<String> = ids_for_matching
                            .iter()
                            .filter(|id| declared.contains(id))
                            .cloned()
                            .collect();

                        if !references.is_empty() {
                            matched_each_ptrs.push(*each_ptr);
                            // Remove matched ids.
                            ids_for_matching.retain(|id| !references.contains(id));
                            // Always add the each block's expression identifiers for transitive
                            // dependency tracking. This ensures that when an inner each block
                            // matches (e.g., `data as item` matching `item`), we also check
                            // the outer each blocks that declare the inner each's expression
                            // variable (e.g., `list as { id, data }` declaring `data`).
                            // This mirrors the official Svelte compiler's parent_each_blocks logic.
                            let each_expr_node = each.expression.as_node();
                            extract_all_identifiers_from_node(
                                &each_expr_node,
                                &mut ids_for_matching,
                            );
                        }
                    }

                    let any_each_block_matched = !matched_each_ptrs.is_empty();

                    if any_each_block_matched {
                        // Determine the single group name for this bind:group expression.
                        // Each bind:group expression gets ONE group name, shared by ALL
                        // ancestor EachBlocks that are matched.
                        //
                        // We use a composite key = keypath + ":" + sorted each block starts
                        // to uniquely identify this bind:group expression. This differentiates:
                        // - Two bind:group expressions with same keypath but different each blocks (test 4)
                        // - One bind:group expression that spans multiple ancestor each blocks (test 5)
                        let starts: Vec<String> = matched_each_ptrs
                            .iter()
                            .map(|p| {
                                let e = unsafe { &**p };
                                e.start.to_string()
                            })
                            .collect();
                        let composite_key = format!("{}:{}", keypath, starts.join(","));

                        let group_name =
                            if let Some(existing) = analysis.binding_groups.get(&composite_key) {
                                existing.clone()
                            } else {
                                // New unique group: assign a fresh group name
                                let group_count = analysis.binding_groups.len();
                                let name = if group_count == 0 {
                                    "binding_group".to_string()
                                } else {
                                    format!("binding_group_{}", group_count)
                                };
                                analysis
                                    .binding_groups
                                    .insert(composite_key.clone(), name.clone());
                                name
                            };

                        // Assign the SAME group name to ALL matched ancestor EachBlocks
                        for each_ptr in &matched_each_ptrs {
                            let each = unsafe { &mut **each_ptr };
                            each.metadata.contains_group_binding = true;
                            // Only set if not already set (in case multiple bind:group expressions
                            // share ancestor each blocks with different group names - each block
                            // uses its first-assigned group name)
                            if each.metadata.binding_group_name.is_none() {
                                each.metadata.binding_group_name = Some(group_name.clone());
                            }
                        }
                    }

                    // If no ancestor EachBlock declared any of the binding expression identifiers,
                    // this is a "standalone" bind:group (like bind:group={current} or bind:group={$order.scoops}).
                    // Register it in analysis.binding_groups using the keypath as key.
                    if !any_each_block_matched && !analysis.binding_groups.contains_key(&keypath) {
                        let group_count = analysis.binding_groups.len();
                        let group_name = if group_count == 0 {
                            "binding_group".to_string()
                        } else {
                            format!("binding_group_{}", group_count)
                        };
                        analysis.binding_groups.insert(keypath, group_name);
                    }
                }
            }

            // Visit child elements
            mark_group_bindings_in_fragment(&mut el.fragment, ancestor_stack, analysis);
        }
        TemplateNode::Component(comp) => {
            // Components can also have bind:group, e.g. `<RadioButton bind:group={x} />`.
            // The official Svelte compiler treats these the same as element bind:group
            // and registers them in `analysis.binding_groups` so a `binding_group = []`
            // declaration is emitted in the component output.
            for attr in &comp.attributes {
                if let Attribute::BindDirective(bind) = attr
                    && bind.name == "group"
                {
                    register_standalone_bind_group(bind, analysis);
                }
            }
            mark_group_bindings_in_fragment(&mut comp.fragment, ancestor_stack, analysis);
        }
        TemplateNode::SvelteComponent(comp) => {
            for attr in &comp.attributes {
                if let Attribute::BindDirective(bind) = attr
                    && bind.name == "group"
                {
                    register_standalone_bind_group(bind, analysis);
                }
            }
            mark_group_bindings_in_fragment(&mut comp.fragment, ancestor_stack, analysis);
        }
        TemplateNode::SvelteElement(el) => {
            mark_group_bindings_in_fragment(&mut el.fragment, ancestor_stack, analysis);
        }
        TemplateNode::SvelteSelf(s) => {
            mark_group_bindings_in_fragment(&mut s.fragment, ancestor_stack, analysis);
        }
        TemplateNode::IfBlock(if_block) => {
            mark_group_bindings_in_fragment(&mut if_block.consequent, ancestor_stack, analysis);
            if let Some(ref mut alt) = if_block.alternate {
                mark_group_bindings_in_fragment(alt, ancestor_stack, analysis);
            }
        }
        TemplateNode::AwaitBlock(await_block) => {
            if let Some(ref mut pending) = await_block.pending {
                mark_group_bindings_in_fragment(pending, ancestor_stack, analysis);
            }
            if let Some(ref mut then) = await_block.then {
                mark_group_bindings_in_fragment(then, ancestor_stack, analysis);
            }
            if let Some(ref mut catch) = await_block.catch {
                mark_group_bindings_in_fragment(catch, ancestor_stack, analysis);
            }
        }
        TemplateNode::KeyBlock(key) => {
            mark_group_bindings_in_fragment(&mut key.fragment, ancestor_stack, analysis);
        }
        TemplateNode::SnippetBlock(snippet) => {
            mark_group_bindings_in_fragment(&mut snippet.body, ancestor_stack, analysis);
        }
        TemplateNode::SvelteHead(head) => {
            mark_group_bindings_in_fragment(&mut head.fragment, ancestor_stack, analysis);
        }
        TemplateNode::SlotElement(slot) => {
            mark_group_bindings_in_fragment(&mut slot.fragment, ancestor_stack, analysis);
        }
        _ => {}
    }
}

/// Extract ALL identifier names from an expression.
/// For `selected_array[index]`, returns `["selected_array", "index"]`.
/// Mirrors `extract_all_identifiers_from_expression` in the official compiler.
fn extract_all_identifiers_from_expr(expr: &serde_json::Value, ids: &mut Vec<String>) {
    let obj = match expr.as_object() {
        Some(o) => o,
        None => return,
    };
    let expr_type = match obj.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return,
    };
    match expr_type {
        "Identifier" => {
            if let Some(name) = obj.get("name").and_then(|n| n.as_str())
                && !ids.contains(&name.to_string())
            {
                ids.push(name.to_string());
            }
        }
        "MemberExpression" => {
            if let Some(object) = obj.get("object") {
                extract_all_identifiers_from_expr(object, ids);
            }
            // Only extract computed property identifiers (e.g., [index] in arr[index])
            if obj.get("computed").and_then(|c| c.as_bool()) == Some(true)
                && let Some(property) = obj.get("property")
            {
                extract_all_identifiers_from_expr(property, ids);
            }
        }
        "CallExpression" => {
            if let Some(callee) = obj.get("callee") {
                extract_all_identifiers_from_expr(callee, ids);
            }
            if let Some(args) = obj.get("arguments").and_then(|a| a.as_array()) {
                for arg in args {
                    extract_all_identifiers_from_expr(arg, ids);
                }
            }
        }
        "BinaryExpression" | "LogicalExpression" => {
            if let Some(left) = obj.get("left") {
                extract_all_identifiers_from_expr(left, ids);
            }
            if let Some(right) = obj.get("right") {
                extract_all_identifiers_from_expr(right, ids);
            }
        }
        "ConditionalExpression" => {
            if let Some(test) = obj.get("test") {
                extract_all_identifiers_from_expr(test, ids);
            }
            if let Some(consequent) = obj.get("consequent") {
                extract_all_identifiers_from_expr(consequent, ids);
            }
            if let Some(alternate) = obj.get("alternate") {
                extract_all_identifiers_from_expr(alternate, ids);
            }
        }
        _ => {}
    }
}

/// Extract ALL identifier names from a JsNode expression.
/// JsNode version of `extract_all_identifiers_from_expr`.
/// Uses JSON fallback for complex nodes with arena-dependent fields.
fn extract_all_identifiers_from_node(node: &JsNode, ids: &mut Vec<String>) {
    match node {
        JsNode::Identifier { name, .. } => {
            let name_str = name.to_string();
            if !ids.contains(&name_str) {
                ids.push(name_str);
            }
        }
        // For nodes with JsNodeId/IdRange children, fall back to JSON
        JsNode::MemberExpression { .. }
        | JsNode::CallExpression { .. }
        | JsNode::BinaryExpression { .. }
        | JsNode::LogicalExpression { .. }
        | JsNode::ConditionalExpression { .. } => {
            let json = node.to_value();
            extract_all_identifiers_from_expr(&json, ids);
        }
        // Raw fallback
        JsNode::Raw(v) => {
            extract_all_identifiers_from_expr(v, ids);
        }
        _ => {}
    }
}

/// Build a keypath string from a binding expression.
/// This mirrors the `extract_all_identifiers_from_expression` function in the official Svelte
/// compiler (utils/ast.js), which builds a keypath string for use as a binding group key.
///
/// Examples:
/// - `selected` → `"selected"`
/// - `$order.scoops` → `"$order.scoops"`
/// - `list[key]` → `"list.[key]"`
/// - `arr[i][j]` → `"arr.[i].[j]"`
fn build_binding_keypath(expr: &serde_json::Value) -> String {
    let mut parts: Vec<String> = Vec::new();
    build_keypath_parts(expr, &mut parts);
    parts.join(".")
}

fn build_keypath_parts(expr: &serde_json::Value, parts: &mut Vec<String>) {
    let obj = match expr.as_object() {
        Some(o) => o,
        None => return,
    };
    let expr_type = match obj.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return,
    };
    match expr_type {
        "Identifier" => {
            if let Some(name) = obj.get("name").and_then(|n| n.as_str()) {
                parts.push(name.to_string());
            }
        }
        "MemberExpression" => {
            // Walk the object part
            if let Some(object) = obj.get("object") {
                build_keypath_parts(object, parts);
            }
            // Handle the property part
            let computed = obj
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);
            if computed {
                // Computed property: arr[idx] → push "[idx]"
                if let Some(property) = obj.get("property") {
                    let prop_str = build_binding_keypath(property);
                    parts.push(format!("[{}]", prop_str));
                }
            } else if let Some(property) = obj.get("property")
                && let Some(name) = property.get("name").and_then(|n| n.as_str())
            {
                // Static property: obj.prop → push "prop"
                parts.push(name.to_string());
            }
        }
        _ => {
            // For other expression types (CallExpression, etc.), fall back to a
            // representation that includes all identifiers
            let mut ids: Vec<String> = Vec::new();
            extract_all_identifiers_from_expr(expr, &mut ids);
            parts.extend(ids);
        }
    }
}

/// Build a keypath string from a JsNode binding expression.
/// JsNode version of `build_binding_keypath`.
fn build_binding_keypath_node(node: &JsNode) -> String {
    let mut parts: Vec<String> = Vec::new();
    build_keypath_parts_node(node, &mut parts);
    parts.join(".")
}

fn build_keypath_parts_node(node: &JsNode, parts: &mut Vec<String>) {
    match node {
        JsNode::Identifier { name, .. } => {
            parts.push(name.to_string());
        }
        // For MemberExpression and other complex nodes, fall back to JSON
        // to avoid arena dependency in this helper
        JsNode::MemberExpression { .. } => {
            let json = node.to_value();
            build_keypath_parts(&json, parts);
        }
        // Raw fallback
        JsNode::Raw(v) => {
            build_keypath_parts(v, parts);
        }
        _ => {
            // For other expression types (CallExpression, etc.), fall back to a
            // representation that includes all identifiers
            let mut ids: Vec<String> = Vec::new();
            extract_all_identifiers_from_node(node, &mut ids);
            parts.extend(ids);
        }
    }
}

/// Recursively collect component names from template AST nodes.
/// These names represent identifiers that are referenced in the template and need to be
/// considered during component name deconfliction.
fn collect_template_component_names<'a>(
    nodes: &'a [crate::ast::template::TemplateNode],
    names: &mut rustc_hash::FxHashSet<&'a str>,
) {
    use crate::ast::template::TemplateNode;
    for node in nodes {
        match node {
            TemplateNode::Component(c) => {
                names.insert(c.name.as_str());
                collect_template_component_names(&c.fragment.nodes, names);
            }
            TemplateNode::RegularElement(e) => {
                collect_template_component_names(&e.fragment.nodes, names);
            }
            TemplateNode::IfBlock(b) => {
                collect_template_component_names(&b.consequent.nodes, names);
                if let Some(alt) = &b.alternate {
                    collect_template_component_names(&alt.nodes, names);
                }
            }
            TemplateNode::EachBlock(b) => {
                collect_template_component_names(&b.body.nodes, names);
                if let Some(fallback) = &b.fallback {
                    collect_template_component_names(&fallback.nodes, names);
                }
            }
            TemplateNode::AwaitBlock(b) => {
                if let Some(pending) = &b.pending {
                    collect_template_component_names(&pending.nodes, names);
                }
                if let Some(then) = &b.then {
                    collect_template_component_names(&then.nodes, names);
                }
                if let Some(catch) = &b.catch {
                    collect_template_component_names(&catch.nodes, names);
                }
            }
            TemplateNode::KeyBlock(b) => {
                collect_template_component_names(&b.fragment.nodes, names);
            }
            TemplateNode::SnippetBlock(b) => {
                collect_template_component_names(&b.body.nodes, names);
            }
            TemplateNode::SlotElement(s) => {
                collect_template_component_names(&s.fragment.nodes, names);
            }
            TemplateNode::SvelteElement(e) => {
                collect_template_component_names(&e.fragment.nodes, names);
            }
            TemplateNode::SvelteComponent(c) => {
                collect_template_component_names(&c.fragment.nodes, names);
            }
            TemplateNode::SvelteHead(h) => {
                collect_template_component_names(&h.fragment.nodes, names);
            }
            TemplateNode::SvelteBoundary(b) => {
                collect_template_component_names(&b.fragment.nodes, names);
            }
            TemplateNode::SvelteSelf(_) => {
                // svelte:self doesn't introduce a new name reference
            }
            TemplateNode::SvelteFragment(f) => {
                collect_template_component_names(&f.fragment.nodes, names);
            }
            TemplateNode::TitleElement(t) => {
                collect_template_component_names(&t.fragment.nodes, names);
            }
            _ => {}
        }
    }
}

/// Register a standalone bind:group directive (one not inside any matching each block)
/// in `analysis.binding_groups`. This mirrors the standalone-registration branch of
/// `mark_group_bindings_in_fragment` for RegularElement, but for Component-style hosts.
fn register_standalone_bind_group(
    bind: &crate::ast::template::BindDirective,
    analysis: &mut ComponentAnalysis,
) {
    let bind_node = bind.expression.as_node();
    let keypath = build_binding_keypath_node(&bind_node);
    if !analysis.binding_groups.contains_key(&keypath) {
        let group_count = analysis.binding_groups.len();
        let group_name = if group_count == 0 {
            "binding_group".to_string()
        } else {
            format!("binding_group_{}", group_count)
        };
        analysis.binding_groups.insert(keypath, group_name);
    }
}

/// Walk a script Expression (program) and collect all `Identifier.name` strings.
/// Used to populate the `conflicts` set for component name deconfliction.
/// We collect ALL identifier names rather than only unbound references because
/// (a) declared bindings are already in `used_names`, and (b) extracting only
/// unbound references would require a full scope walk.
fn collect_identifier_names_from_expression(
    expr: &crate::ast::js::Expression,
    out: &mut rustc_hash::FxHashSet<String>,
) {
    let json = expr.as_json();
    collect_identifier_names_in_json(json, out);
}

fn collect_identifier_names_in_json(
    value: &serde_json::Value,
    out: &mut rustc_hash::FxHashSet<String>,
) {
    use serde_json::Value;
    match value {
        Value::Object(obj) => {
            let node_type = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");

            // If this is an Identifier node, collect its name.
            if node_type == "Identifier"
                && let Some(Value::String(name)) = obj.get("name")
            {
                out.insert(name.clone());
            }

            // Skip fields that are not references (matching official Svelte's
            // `scope.reference()` semantics, which only registers actual
            // identifier *uses*, not name slots like `imported` of an import
            // specifier or `key` of a non-computed object property).
            for (k, v) in obj.iter() {
                let skip = match node_type {
                    "ImportSpecifier" | "ExportSpecifier" => k == "imported" || k == "exported",
                    "MemberExpression" => {
                        // For non-computed member expressions, the property is a name slot, not a ref
                        k == "property"
                            && obj.get("computed").and_then(|c| c.as_bool()) != Some(true)
                    }
                    "Property" | "MethodDefinition" | "PropertyDefinition" => {
                        // Non-computed object/class property keys are name slots, not refs
                        k == "key" && obj.get("computed").and_then(|c| c.as_bool()) != Some(true)
                    }
                    "FunctionDeclaration"
                    | "FunctionExpression"
                    | "ArrowFunctionExpression"
                    | "ClassDeclaration"
                    | "ClassExpression" => {
                        // The function/class id is a declaration name, not a ref
                        k == "id"
                    }
                    "VariableDeclarator" => {
                        // The id of a variable declarator is a declaration pattern
                        k == "id"
                    }
                    "LabeledStatement" | "BreakStatement" | "ContinueStatement" => {
                        // Labels are not identifier references
                        k == "label"
                    }
                    _ => false,
                };
                if !skip {
                    collect_identifier_names_in_json(v, out);
                }
            }
        }
        Value::Array(arr) => {
            for item in arr {
                collect_identifier_names_in_json(item, out);
            }
        }
        _ => {}
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rustc_hash::{FxHashMap, FxHashSet};

    #[test]
    fn test_order_reactive_statements_simple() {
        // Test case: $: b = a + 1; $: a = 1;
        // Expected order: a first, then b
        let mut statements = FxHashMap::default();

        // Statement 1: assigns to binding 1 (b), depends on binding 0 (a)
        statements.insert(
            "stmt_1".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([1usize]),
                dependencies: vec![0],
            },
        );

        // Statement 2: assigns to binding 0 (a), no dependencies
        statements.insert(
            "stmt_2".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([0usize]),
                dependencies: vec![],
            },
        );

        let ordered = order_reactive_statements(statements).unwrap();
        assert_eq!(ordered.len(), 2);

        // stmt_2 (a) should come before stmt_1 (b)
        assert_eq!(ordered[0].0, "stmt_2");
        assert_eq!(ordered[1].0, "stmt_1");
    }

    #[test]
    fn test_order_reactive_statements_chain() {
        // Test case: $: c = b + 1; $: b = a + 1; $: a = 1;
        // Expected order: a, b, c
        let mut statements = FxHashMap::default();

        statements.insert(
            "stmt_c".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([2usize]),
                dependencies: vec![1],
            },
        );

        statements.insert(
            "stmt_b".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([1usize]),
                dependencies: vec![0],
            },
        );

        statements.insert(
            "stmt_a".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([0usize]),
                dependencies: vec![],
            },
        );

        let ordered = order_reactive_statements(statements).unwrap();
        assert_eq!(ordered.len(), 3);

        assert_eq!(ordered[0].0, "stmt_a");
        assert_eq!(ordered[1].0, "stmt_b");
        assert_eq!(ordered[2].0, "stmt_c");
    }

    #[test]
    fn test_order_reactive_statements_cycle() {
        // Test case: $: a = b + 1; $: b = a + 1;
        // This creates a circular dependency
        let mut statements = FxHashMap::default();

        statements.insert(
            "stmt_a".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([0usize]),
                dependencies: vec![1],
            },
        );

        statements.insert(
            "stmt_b".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([1usize]),
                dependencies: vec![0],
            },
        );

        let result = order_reactive_statements(statements);
        assert!(result.is_err());
    }

    #[test]
    fn test_order_reactive_statements_self_assignment() {
        // Test case: $: a = a + 1;
        // Self-assignment should not create a cycle
        let mut statements = FxHashMap::default();

        statements.insert(
            "stmt_a".to_string(),
            ReactiveStatement {
                assignments: FxHashSet::from_iter([0usize]),
                dependencies: vec![0],
            },
        );

        let ordered = order_reactive_statements(statements).unwrap();
        assert_eq!(ordered.len(), 1);
        assert_eq!(ordered[0].0, "stmt_a");
    }
}
