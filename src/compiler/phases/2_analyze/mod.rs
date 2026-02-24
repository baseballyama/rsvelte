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
    let mut analysis = ComponentAnalysis::new(source, options);

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

    // Extract script content for Phase 3 (avoids re-parsing)
    analysis.extract_scripts(ast);

    // Create scopes for the component
    analysis.create_scopes(ast)?;

    // Detect store subscriptions and create synthetic bindings
    // This must happen after scopes are created but before template analysis
    // Corresponds to Svelte's store subscription logic in 2-analyze/index.js L348-444
    store_subscriptions::detect_store_subscriptions(ast, &mut analysis, options.runes)?;

    // Detect await expressions in template and instance script.
    // This is needed for:
    // 1. Auto-detecting runes mode (await implies runes)
    // 2. Marking the component as needing async function wrapper
    let fragment_has_await = fragment_has_await_expression(&ast.fragment);
    let instance_has_await = ast
        .instance
        .as_ref()
        .map(|inst| {
            let crate::ast::js::Expression::Value(ref val) = inst.content;
            json_has_await_expression(val)
        })
        .unwrap_or(false);

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
    if options.runes.is_none() && !analysis.runes {
        let has_rune_bindings = analysis.root.bindings.iter().any(|b| b.is_rune());
        // Check for rune references in instance and module scripts
        // This catches cases like standalone $effect(...) or $inspect(...) calls
        // that don't create bindings but indicate runes mode
        // Collect store subscription names to exclude them from rune detection.
        // Store auto-subscriptions ($store) look like rune references (dollar prefix)
        // but are NOT runes. If we don't exclude them, a component with $store in the
        // template would be incorrectly detected as being in runes mode, which would
        // then reject `export let` with `legacy_export_invalid` error.
        let store_sub_names: rustc_hash::FxHashSet<&str> = analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::StoreSub))
            .map(|b| b.name.as_str())
            .collect();
        // For script checks, we use an empty set (scripts can have both runes and stores,
        // but store_subs are created from template/instance references after scope building,
        // so they are not relevant for script-level rune detection).
        let empty_store_subs: rustc_hash::FxHashSet<&str> = rustc_hash::FxHashSet::default();
        let has_rune_references = ast
            .instance
            .as_ref()
            .map(|inst| {
                let crate::ast::js::Expression::Value(ref val) = inst.content;
                json_has_rune_reference(val, &empty_store_subs)
            })
            .unwrap_or(false)
            || ast
                .module
                .as_ref()
                .map(|module| {
                    let crate::ast::js::Expression::Value(ref val) = module.content;
                    json_has_rune_reference(val, &empty_store_subs)
                })
                .unwrap_or(false);
        // Also check the template fragment for rune references.
        // This is needed for template-only components (no script tags) that use
        // rune references like {$effect.tracking()}.
        // In the official Svelte compiler, unresolved references bubble up through
        // the scope chain to the module scope, which is checked for rune names.
        // Our scope model doesn't do this bubbling, so we explicitly check the
        // template fragment here.
        let template_has_rune_references =
            fragment_has_rune_reference(&ast.fragment, &store_sub_names);
        if has_rune_bindings
            || fragment_has_await
            || instance_has_await
            || has_rune_references
            || template_has_rune_references
        {
            analysis.runes = true;
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
        {
            analysis
                .warnings
                .push(warnings::script_context_deprecated());
        }

        let script_ast = module.content.as_json();
        let mut context = visitors::VisitorContext::new(&mut analysis);
        context.ast_type = visitors::AstType::Module;
        // Module script stays at function_depth 0
        context.function_depth = 0;
        visitors::visit_script(script_ast, &mut context)?;
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

        let script_ast = instance.content.as_json();
        let mut context = visitors::VisitorContext::new(&mut analysis);
        context.ast_type = visitors::AstType::Instance;
        // Instance script starts at function_depth 1 (like Svelte's scope system)
        context.function_depth = 1;
        visitors::visit_script(script_ast, &mut context)?;
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

    // Analyze the template using visitors
    visitors::analyze_template(ast, &mut analysis)?;

    // Post-analysis check: validate module script export specifiers.
    // This mirrors the official Svelte compiler's index.js post-walk checks.
    // Must run AFTER analyze_template so that analysis.template.snippets is populated.
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/index.js
    if let Some(ref module) = ast.module {
        let crate::ast::js::Expression::Value(ref module_json) = module.content;
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
                    // Check if binding is in the module scope (scope_index == 0).
                    // If the binding exists but is NOT in the module scope, it might be
                    // a snippet or instance-scoped binding that can't be exported.
                    let module_scope_binding = analysis
                        .root
                        .scope
                        .declarations
                        .get(name)
                        .and_then(|&idx| analysis.root.bindings.get(idx))
                        .filter(|b| b.scope_index == 0);

                    if module_scope_binding.is_none() {
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

    // Check for mixing slot and render tag syntax
    // Corresponds to Svelte's 2-analyze/index.js check for slot_snippet_conflict
    if analysis.uses_render_tags && analysis.uses_slots {
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
        // Only elements that could potentially match a CSS selector get the
        // scoped hash class. This is a simplified version of the official
        // compiler's css-prune.js per-element marking.
        if !analysis.css.hash.is_empty() {
            mark_elements_scoped(&mut ast.fragment, &analysis);
        }
    }

    Ok(analysis)
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
    let mut edges: Vec<(String, String)> = Vec::new();
    for (assignments, dependencies) in &reactive_stmts {
        for assignment in assignments {
            for dependency in dependencies {
                edges.push((assignment.clone(), dependency.clone()));
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
                && !out.contains(&name.to_string())
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
                && !out.contains(&name.to_string())
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
    // The instance scope index: bindings declared at scope >= instance_scope_index
    // are in the instance script (or nested functions within it). Module-scope
    // bindings (scope 0, when a <script module> block exists) should NOT be promoted
    // because they are plain JavaScript variables, not reactive signals.
    // In the official Svelte compiler, only instance-scope bindings are considered.
    let instance_scope_index = analysis.root.instance_scope_index;

    // If there's no instance script, no bindings should be promoted.
    // This handles the case where there's only a <script module> tag.
    // Module-level bindings are plain JavaScript, not reactive signals.
    if analysis.instance_script_content.is_none() {
        return;
    }

    // Iterate over all bindings in the root scope (instance scope)
    for binding in &mut analysis.root.bindings {
        // Only consider 'normal' bindings (not already state, derived, prop, etc.)
        if binding.kind != BindingKind::Normal {
            continue;
        }

        // Skip module-scope bindings (declared in <script module> at scope 0).
        // These are plain JS variables that should not become reactive signals.
        // Only instance-scope bindings (scope_index >= instance_scope_index) are promoted.
        // When instance_scope_index == 0 there is no module script, so all bindings qualify.
        if instance_scope_index > 0 && binding.scope_index < instance_scope_index {
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
        binding.kind = BindingKind::State;
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
                    let context_json = context_expr.as_json();
                    let mut names = Vec::new();
                    extract_each_pattern_identifiers(context_json, &mut names);
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

    let crate::ast::js::Expression::Value(ref program) = instance.content;

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
    let node_type = match node.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return,
    };

    match node_type {
        "Identifier" => {
            if let Some(name) = node.get("name").and_then(|n| n.as_str())
                && !names.contains(&name.to_string())
            {
                names.push(name.to_string());
            }
        }
        "MemberExpression" => {
            // Only walk the object, not the property (unless computed)
            if let Some(obj) = node.get("object") {
                collect_identifiers_from_expr(obj, names);
            }
            if node
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false)
                && let Some(prop) = node.get("property")
            {
                collect_identifiers_from_expr(prop, names);
            }
        }
        _ => {
            // Recursively walk all value fields
            if let Some(obj) = node.as_object() {
                for (key, val) in obj {
                    if key == "type" || key == "start" || key == "end" || key == "loc" {
                        continue;
                    }
                    if val.is_object() {
                        collect_identifiers_from_expr(val, names);
                    } else if val.is_array()
                        && let Some(arr) = val.as_array()
                    {
                        for item in arr {
                            if item.is_object() {
                                collect_identifiers_from_expr(item, names);
                            }
                        }
                    }
                }
            }
        }
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

/// Mark RegularElement nodes in the fragment as scoped based on CSS selector matching.
/// Only elements that could potentially match a CSS selector get the scoped hash.
///
/// This is a simplified version of the official compiler's css-prune.js per-element
/// marking. It checks if an element could match based on tag name, class attributes,
/// or other properties.
fn mark_elements_scoped(
    fragment: &mut crate::ast::template::Fragment,
    analysis: &ComponentAnalysis,
) {
    use crate::ast::template::TemplateNode;

    for node in &mut fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                // Check if this element could potentially match any CSS selector
                el.metadata.scoped = element_could_match_css(el, analysis);
                mark_elements_scoped(&mut el.fragment, analysis);
            }
            TemplateNode::Component(comp) => {
                mark_elements_scoped(&mut comp.fragment, analysis);
            }
            TemplateNode::IfBlock(if_block) => {
                mark_elements_scoped(&mut if_block.consequent, analysis);
                if let Some(ref mut alt) = if_block.alternate {
                    mark_elements_scoped(alt, analysis);
                }
            }
            TemplateNode::EachBlock(each) => {
                mark_elements_scoped(&mut each.body, analysis);
                if let Some(ref mut fallback) = each.fallback {
                    mark_elements_scoped(fallback, analysis);
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref mut pending) = await_block.pending {
                    mark_elements_scoped(pending, analysis);
                }
                if let Some(ref mut then) = await_block.then {
                    mark_elements_scoped(then, analysis);
                }
                if let Some(ref mut catch) = await_block.catch {
                    mark_elements_scoped(catch, analysis);
                }
            }
            TemplateNode::KeyBlock(key) => {
                mark_elements_scoped(&mut key.fragment, analysis);
            }
            TemplateNode::SnippetBlock(snippet) => {
                mark_elements_scoped(&mut snippet.body, analysis);
            }
            TemplateNode::SvelteHead(head) => {
                mark_elements_scoped(&mut head.fragment, analysis);
            }
            TemplateNode::SvelteElement(el) => {
                mark_elements_scoped(&mut el.fragment, analysis);
            }
            TemplateNode::SlotElement(slot) => {
                mark_elements_scoped(&mut slot.fragment, analysis);
            }
            TemplateNode::TitleElement(title) => {
                mark_elements_scoped(&mut title.fragment, analysis);
            }
            _ => {}
        }
    }
}

/// Check if an element could potentially match any CSS selector.
///
/// This is a simplified version of the official compiler's per-element CSS pruning.
/// An element is considered potentially matching if:
/// 1. CSS has a universal selector (*), OR
/// 2. The element's tag name matches a CSS type selector, OR
/// 3. The element has class-related attributes/directives and CSS has class selectors, OR
/// 4. The element has an id attribute and CSS has id selectors, OR
/// 5. The element has a spread attribute (could add any class dynamically)
///
/// If CSS has ONLY class selectors (no tag selectors, no universal), elements without
/// class-related attributes won't be scoped.
fn element_could_match_css(
    el: &crate::ast::template::RegularElement,
    analysis: &ComponentAnalysis,
) -> bool {
    let css = &analysis.css;

    // If there's a universal selector, all elements match
    if css.has_universal_selector {
        return true;
    }

    // Check if the element's tag name matches a CSS type selector
    if css.selector_tag_names.contains(el.name.as_str()) {
        return true;
    }

    // Check if element has any class-related attribute, class directive, or spread
    // that could potentially match a CSS class selector
    if !css.selector_class_names.is_empty() {
        use crate::ast::template::Attribute;

        let has_class_related = el.attributes.iter().any(|attr| match attr {
            Attribute::Attribute(a) => a.name == "class",
            Attribute::ClassDirective(_) => true,
            Attribute::SpreadAttribute(_) => true,
            _ => false,
        });

        if has_class_related {
            return true;
        }
    }

    // Check if element has an id attribute that could match a CSS id selector
    if !css.selector_id_names.is_empty() {
        use crate::ast::template::Attribute;
        let has_id = el
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "id"));
        if has_id {
            return true;
        }
    }

    // Check if element has a spread attribute (could add any class or id dynamically)
    {
        use crate::ast::template::Attribute;
        let has_spread = el
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));
        if has_spread && (!css.selector_class_names.is_empty() || !css.selector_id_names.is_empty())
        {
            return true;
        }
    }

    // If CSS has no specific selectors at all (only pseudo/attribute selectors),
    // be conservative and mark as scoped
    if css.selector_tag_names.is_empty()
        && css.selector_class_names.is_empty()
        && css.selector_id_names.is_empty()
    {
        return true;
    }

    false
}

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
fn fragment_has_await_expression(fragment: &crate::ast::template::Fragment) -> bool {
    for node in &fragment.nodes {
        if node_has_await_expression(node) {
            return true;
        }
    }
    false
}

/// Check if a template node contains an AwaitExpression.
#[allow(dead_code)]
fn node_has_await_expression(node: &crate::ast::template::TemplateNode) -> bool {
    use crate::ast::template::TemplateNode;

    match node {
        TemplateNode::ExpressionTag(tag) => expression_has_await(&tag.expression),
        TemplateNode::RegularElement(elem) => {
            for attr in &elem.attributes {
                if attribute_has_await(attr) {
                    return true;
                }
            }
            fragment_has_await_expression(&elem.fragment)
        }
        TemplateNode::Component(comp) => {
            for attr in &comp.attributes {
                if attribute_has_await(attr) {
                    return true;
                }
            }
            fragment_has_await_expression(&comp.fragment)
        }
        TemplateNode::IfBlock(block) => {
            if expression_has_await(&block.test) {
                return true;
            }
            if fragment_has_await_expression(&block.consequent) {
                return true;
            }
            if let Some(ref alternate) = block.alternate
                && fragment_has_await_expression(alternate)
            {
                return true;
            }
            false
        }
        TemplateNode::EachBlock(block) => {
            if expression_has_await(&block.expression) {
                return true;
            }
            if fragment_has_await_expression(&block.body) {
                return true;
            }
            if let Some(ref fallback) = block.fallback
                && fragment_has_await_expression(fallback)
            {
                return true;
            }
            false
        }
        TemplateNode::KeyBlock(block) => {
            if expression_has_await(&block.expression) {
                return true;
            }
            fragment_has_await_expression(&block.fragment)
        }
        TemplateNode::AwaitBlock(block) => {
            if expression_has_await(&block.expression) {
                return true;
            }
            if let Some(ref pending) = block.pending
                && fragment_has_await_expression(pending)
            {
                return true;
            }
            if let Some(ref then) = block.then
                && fragment_has_await_expression(then)
            {
                return true;
            }
            if let Some(ref catch) = block.catch
                && fragment_has_await_expression(catch)
            {
                return true;
            }
            false
        }
        TemplateNode::SnippetBlock(_block) => false,
        TemplateNode::SvelteBoundary(elem)
        | TemplateNode::SvelteBody(elem)
        | TemplateNode::SvelteDocument(elem)
        | TemplateNode::SvelteFragment(elem)
        | TemplateNode::SvelteHead(elem)
        | TemplateNode::SvelteOptions(elem)
        | TemplateNode::SvelteWindow(elem) => {
            for attr in &elem.attributes {
                if attribute_has_await(attr) {
                    return true;
                }
            }
            fragment_has_await_expression(&elem.fragment)
        }
        TemplateNode::SvelteSelf(elem) => {
            for attr in &elem.attributes {
                if attribute_has_await(attr) {
                    return true;
                }
            }
            fragment_has_await_expression(&elem.fragment)
        }
        TemplateNode::SvelteComponent(elem) => {
            for attr in &elem.attributes {
                if attribute_has_await(attr) {
                    return true;
                }
            }
            fragment_has_await_expression(&elem.fragment)
        }
        TemplateNode::SvelteElement(elem) => {
            for attr in &elem.attributes {
                if attribute_has_await(attr) {
                    return true;
                }
            }
            fragment_has_await_expression(&elem.fragment)
        }
        TemplateNode::TitleElement(elem) => {
            for attr in &elem.attributes {
                if attribute_has_await(attr) {
                    return true;
                }
            }
            fragment_has_await_expression(&elem.fragment)
        }
        TemplateNode::SlotElement(elem) => {
            for attr in &elem.attributes {
                if attribute_has_await(attr) {
                    return true;
                }
            }
            fragment_has_await_expression(&elem.fragment)
        }
        TemplateNode::RenderTag(tag) => expression_has_await(&tag.expression),
        TemplateNode::HtmlTag(tag) => expression_has_await(&tag.expression),
        TemplateNode::ConstTag(tag) => expression_has_await(&tag.declaration),
        _ => false,
    }
}

/// Check if an expression (stored as JSON) contains an AwaitExpression.
#[allow(dead_code)]
fn expression_has_await(expr: &crate::ast::js::Expression) -> bool {
    let crate::ast::js::Expression::Value(value) = expr;
    json_has_await_expression(value)
}

/// Recursively check a JSON AST node for AwaitExpression.
/// Stops at function boundaries (FunctionExpression, ArrowFunctionExpression, FunctionDeclaration).
#[allow(dead_code)]
fn json_has_await_expression(node: &serde_json::Value) -> bool {
    let node_type = node.get("type").and_then(|t| t.as_str());

    match node_type {
        Some("AwaitExpression") => return true,
        Some("FunctionExpression" | "ArrowFunctionExpression" | "FunctionDeclaration") => {
            return false;
        }
        _ => {}
    }

    match node {
        serde_json::Value::Object(map) => {
            for (key, val) in map {
                if key == "type" || key == "start" || key == "end" || key == "loc" {
                    continue;
                }
                if json_has_await_expression(val) {
                    return true;
                }
            }
        }
        serde_json::Value::Array(arr) => {
            for val in arr {
                if json_has_await_expression(val) {
                    return true;
                }
            }
        }
        _ => {}
    }

    false
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

/// Recursively check a JSON AST node for rune identifier references.
///
/// This walks the JSON AST looking for Identifier nodes whose name matches
/// a rune name ($state, $derived, $effect, $inspect, $props, $bindable, $host).
///
/// Unlike the await check, this does NOT stop at function boundaries because
/// rune references inside functions (e.g., `$effect(...)` in a callback) still
/// indicate runes mode. This matches the official compiler's behavior where
/// unresolved references bubble up through the scope chain.
///
/// Corresponds to the check `Array.from(module.scope.references.keys()).some(is_rune)`
/// in Svelte's `2-analyze/index.js`.
fn json_has_rune_reference(
    node: &serde_json::Value,
    store_subs: &rustc_hash::FxHashSet<&str>,
) -> bool {
    let node_type = node.get("type").and_then(|t| t.as_str());

    // Check if this is an Identifier with a rune name
    if node_type == Some("Identifier")
        && let Some(name) = node.get("name").and_then(|n| n.as_str())
        && is_rune_name(name)
        && !store_subs.contains(name)
    {
        return true;
    }

    match node {
        serde_json::Value::Object(map) => {
            for (key, val) in map {
                if key == "type" || key == "start" || key == "end" || key == "loc" {
                    continue;
                }
                // Skip the "label" property of LabeledStatement nodes.
                // Labels like `$effect:` contain Identifiers with rune names but
                // they are NOT rune references - they are just label declarations.
                // Without this check, `$effect: if (obj) x++` would falsely trigger
                // runes mode detection, causing `export let` to be rejected.
                if key == "label" && node_type == Some("LabeledStatement") {
                    continue;
                }
                // Skip property keys in non-computed MemberExpressions and Properties.
                // `foo.$state` should not be treated as a rune reference.
                if key == "property"
                    && node_type == Some("MemberExpression")
                    && !node
                        .get("computed")
                        .and_then(|c| c.as_bool())
                        .unwrap_or(false)
                {
                    continue;
                }
                // Skip the "key" field of non-computed Property nodes.
                // { $state: value } should not be treated as a rune reference.
                if key == "key"
                    && node_type == Some("Property")
                    && !node
                        .get("computed")
                        .and_then(|c| c.as_bool())
                        .unwrap_or(false)
                {
                    continue;
                }
                if json_has_rune_reference(val, store_subs) {
                    return true;
                }
            }
        }
        serde_json::Value::Array(arr) => {
            for val in arr {
                if json_has_rune_reference(val, store_subs) {
                    return true;
                }
            }
        }
        _ => {}
    }

    false
}

/// Check if a template fragment contains rune references.
///
/// This is needed for template-only components (no script tags) that use rune
/// references like `{$effect.tracking()}`. The official Svelte compiler detects
/// these because unresolved references bubble up through the scope chain to the
/// module scope, which is checked for rune references. Our scope model doesn't
/// do this bubbling, so we need to explicitly check the template fragment.
fn fragment_has_rune_reference(
    fragment: &crate::ast::template::Fragment,
    store_subs: &rustc_hash::FxHashSet<&str>,
) -> bool {
    for node in &fragment.nodes {
        if node_has_rune_reference(node, store_subs) {
            return true;
        }
    }
    false
}

/// Check if a template node contains a rune reference.
fn node_has_rune_reference(
    node: &crate::ast::template::TemplateNode,
    store_subs: &rustc_hash::FxHashSet<&str>,
) -> bool {
    use crate::ast::template::TemplateNode;

    match node {
        TemplateNode::ExpressionTag(tag) => {
            expression_has_rune_reference(&tag.expression, store_subs)
        }
        TemplateNode::RegularElement(elem) => {
            for attr in &elem.attributes {
                if attribute_has_rune_reference(attr, store_subs) {
                    return true;
                }
            }
            fragment_has_rune_reference(&elem.fragment, store_subs)
        }
        TemplateNode::Component(comp) => {
            for attr in &comp.attributes {
                if attribute_has_rune_reference(attr, store_subs) {
                    return true;
                }
            }
            fragment_has_rune_reference(&comp.fragment, store_subs)
        }
        TemplateNode::IfBlock(block) => {
            if expression_has_rune_reference(&block.test, store_subs) {
                return true;
            }
            if fragment_has_rune_reference(&block.consequent, store_subs) {
                return true;
            }
            if let Some(ref alternate) = block.alternate
                && fragment_has_rune_reference(alternate, store_subs)
            {
                return true;
            }
            false
        }
        TemplateNode::EachBlock(block) => {
            if expression_has_rune_reference(&block.expression, store_subs) {
                return true;
            }
            if fragment_has_rune_reference(&block.body, store_subs) {
                return true;
            }
            if let Some(ref fallback) = block.fallback
                && fragment_has_rune_reference(fallback, store_subs)
            {
                return true;
            }
            false
        }
        TemplateNode::KeyBlock(block) => {
            if expression_has_rune_reference(&block.expression, store_subs) {
                return true;
            }
            fragment_has_rune_reference(&block.fragment, store_subs)
        }
        TemplateNode::AwaitBlock(block) => {
            if expression_has_rune_reference(&block.expression, store_subs) {
                return true;
            }
            if let Some(ref pending) = block.pending
                && fragment_has_rune_reference(pending, store_subs)
            {
                return true;
            }
            if let Some(ref then) = block.then
                && fragment_has_rune_reference(then, store_subs)
            {
                return true;
            }
            if let Some(ref catch) = block.catch
                && fragment_has_rune_reference(catch, store_subs)
            {
                return true;
            }
            false
        }
        TemplateNode::SnippetBlock(block) => fragment_has_rune_reference(&block.body, store_subs),
        TemplateNode::SvelteBoundary(elem)
        | TemplateNode::SvelteBody(elem)
        | TemplateNode::SvelteDocument(elem)
        | TemplateNode::SvelteFragment(elem)
        | TemplateNode::SvelteHead(elem)
        | TemplateNode::SvelteOptions(elem)
        | TemplateNode::SvelteWindow(elem) => {
            for attr in &elem.attributes {
                if attribute_has_rune_reference(attr, store_subs) {
                    return true;
                }
            }
            fragment_has_rune_reference(&elem.fragment, store_subs)
        }
        TemplateNode::SvelteSelf(elem) => {
            for attr in &elem.attributes {
                if attribute_has_rune_reference(attr, store_subs) {
                    return true;
                }
            }
            fragment_has_rune_reference(&elem.fragment, store_subs)
        }
        TemplateNode::SvelteComponent(elem) => {
            for attr in &elem.attributes {
                if attribute_has_rune_reference(attr, store_subs) {
                    return true;
                }
            }
            fragment_has_rune_reference(&elem.fragment, store_subs)
        }
        TemplateNode::SvelteElement(elem) => {
            for attr in &elem.attributes {
                if attribute_has_rune_reference(attr, store_subs) {
                    return true;
                }
            }
            fragment_has_rune_reference(&elem.fragment, store_subs)
        }
        TemplateNode::TitleElement(elem) => {
            for attr in &elem.attributes {
                if attribute_has_rune_reference(attr, store_subs) {
                    return true;
                }
            }
            fragment_has_rune_reference(&elem.fragment, store_subs)
        }
        TemplateNode::SlotElement(elem) => {
            for attr in &elem.attributes {
                if attribute_has_rune_reference(attr, store_subs) {
                    return true;
                }
            }
            fragment_has_rune_reference(&elem.fragment, store_subs)
        }
        TemplateNode::RenderTag(tag) => expression_has_rune_reference(&tag.expression, store_subs),
        TemplateNode::HtmlTag(tag) => expression_has_rune_reference(&tag.expression, store_subs),
        TemplateNode::ConstTag(tag) => expression_has_rune_reference(&tag.declaration, store_subs),
        _ => false,
    }
}

/// Check if an expression (stored as JSON) contains a rune reference.
fn expression_has_rune_reference(
    expr: &crate::ast::js::Expression,
    store_subs: &rustc_hash::FxHashSet<&str>,
) -> bool {
    let crate::ast::js::Expression::Value(value) = expr;
    json_has_rune_reference(value, store_subs)
}

/// Check if an attribute contains a rune reference.
fn attribute_has_rune_reference(
    attr: &crate::ast::template::Attribute,
    store_subs: &rustc_hash::FxHashSet<&str>,
) -> bool {
    use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart};

    match attr {
        Attribute::Attribute(attr_node) => match &attr_node.value {
            AttributeValue::Expression(expr_tag) => {
                expression_has_rune_reference(&expr_tag.expression, store_subs)
            }
            AttributeValue::Sequence(parts) => parts.iter().any(|part| {
                if let AttributeValuePart::ExpressionTag(expr_tag) = part {
                    expression_has_rune_reference(&expr_tag.expression, store_subs)
                } else {
                    false
                }
            }),
            _ => false,
        },
        Attribute::OnDirective(dir) => dir
            .expression
            .as_ref()
            .is_some_and(|e| expression_has_rune_reference(e, store_subs)),
        Attribute::BindDirective(dir) => expression_has_rune_reference(&dir.expression, store_subs),
        _ => false,
    }
}

/// Check if an attribute contains an await expression.
#[allow(dead_code)]
fn attribute_has_await(attr: &crate::ast::template::Attribute) -> bool {
    use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart};

    match attr {
        Attribute::Attribute(attr_node) => match &attr_node.value {
            AttributeValue::Expression(expr_tag) => expression_has_await(&expr_tag.expression),
            AttributeValue::Sequence(parts) => parts.iter().any(|part| {
                if let AttributeValuePart::ExpressionTag(expr_tag) = part {
                    expression_has_await(&expr_tag.expression)
                } else {
                    false
                }
            }),
            _ => false,
        },
        Attribute::OnDirective(dir) => dir.expression.as_ref().is_some_and(expression_has_await),
        Attribute::BindDirective(dir) => expression_has_await(&dir.expression),
        _ => false,
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
            let each_ptr: *mut crate::ast::template::EachBlock = each as *mut _;
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
                    extract_all_identifiers_from_expr(bind.expression.as_json(), &mut ids);

                    // Compute the keypath for this expression (used as binding group key).
                    // This mirrors the official compiler's keypath from extract_all_identifiers_from_expression.
                    // Example: `$order.scoops` → "$order.scoops", `list[key]` → "list.[key]"
                    let keypath = build_binding_keypath(bind.expression.as_json());

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
                            extract_each_pattern_identifiers(ctx.as_json(), &mut declared);
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
                            extract_all_identifiers_from_expr(
                                each.expression.as_json(),
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
            mark_group_bindings_in_fragment(&mut comp.fragment, ancestor_stack, analysis);
        }
        TemplateNode::SvelteComponent(comp) => {
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
