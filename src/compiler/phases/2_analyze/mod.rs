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

    // Analyze the template using visitors
    visitors::analyze_template(ast, &mut analysis)?;

    // Auto-detect runes mode if not explicitly set
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/index.js L449-451
    // const runes = options.runes ?? (has_await || instance.has_await ||
    //     Array.from(module.scope.references.keys()).some(is_rune));
    //
    // If options.runes is not explicitly set (None), we detect runes mode by checking:
    // 1. If any bindings are rune-based ($state, $derived, etc.)
    // 2. If the template or instance has await expressions
    // 3. If the instance or module scripts contain rune references ($effect, $inspect, etc.)
    //    This matches the official compiler's check for rune references in scope.references.
    // This must happen after scope/binding analysis but before legacy state promotion.
    if options.runes.is_none() && !analysis.runes {
        let has_rune_bindings = analysis.root.bindings.iter().any(|b| b.is_rune());
        let has_await = fragment_has_await_expression(&ast.fragment);
        let instance_has_await = ast
            .instance
            .as_ref()
            .map(|inst| {
                let crate::ast::js::Expression::Value(ref val) = inst.content;
                json_has_await_expression(val)
            })
            .unwrap_or(false);
        // Check for rune references in instance and module scripts
        // This catches cases like standalone $effect(...) or $inspect(...) calls
        // that don't create bindings but indicate runes mode
        let has_rune_references = ast
            .instance
            .as_ref()
            .map(|inst| {
                let crate::ast::js::Expression::Value(ref val) = inst.content;
                json_has_rune_reference(val)
            })
            .unwrap_or(false)
            || ast
                .module
                .as_ref()
                .map(|module| {
                    let crate::ast::js::Expression::Value(ref val) = module.content;
                    json_has_rune_reference(val)
                })
                .unwrap_or(false);
        if has_rune_bindings || has_await || instance_has_await || has_rune_references {
            analysis.runes = true;
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
    }

    // More legacy nonsense: if an `each` binding is reassigned/mutated,
    // treat the expression as being mutated as well.
    // This promotes bindings referenced in the each expression to 'state'.
    // Corresponds to Svelte's 2-analyze/index.js L638-674
    if !analysis.runes {
        promote_each_expression_bindings(&ast.fragment, &mut analysis);
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

        // Prune unused selectors
        css::prune_css(stylesheet, &analysis);

        // Mark all elements as scoped if CSS hash is present
        // This is a simplified approach - the official compiler marks only
        // elements that match CSS selectors as scoped
        if !analysis.css.hash.is_empty() {
            mark_elements_scoped(&mut ast.fragment);
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
    // Iterate over all bindings in the root scope (instance scope)
    for binding in &mut analysis.root.bindings {
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
        binding.kind = BindingKind::State;
    }
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
                        if let Some(binding_idx) = analysis.root.find_binding_any_scope(name) {
                            let binding = &analysis.root.bindings[binding_idx];
                            binding.reassigned || binding.mutated
                        } else {
                            false
                        }
                    })
                } else {
                    false
                };

                if has_updated_binding {
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

/// Mark all RegularElement nodes in the fragment as scoped.
/// This is called when CSS is present in the component.
fn mark_elements_scoped(fragment: &mut crate::ast::template::Fragment) {
    use crate::ast::template::TemplateNode;

    for node in &mut fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                el.metadata.scoped = true;
                mark_elements_scoped(&mut el.fragment);
            }
            TemplateNode::Component(comp) => {
                mark_elements_scoped(&mut comp.fragment);
            }
            TemplateNode::IfBlock(if_block) => {
                mark_elements_scoped(&mut if_block.consequent);
                if let Some(ref mut alt) = if_block.alternate {
                    mark_elements_scoped(alt);
                }
            }
            TemplateNode::EachBlock(each) => {
                mark_elements_scoped(&mut each.body);
                if let Some(ref mut fallback) = each.fallback {
                    mark_elements_scoped(fallback);
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref mut pending) = await_block.pending {
                    mark_elements_scoped(pending);
                }
                if let Some(ref mut then) = await_block.then {
                    mark_elements_scoped(then);
                }
                if let Some(ref mut catch) = await_block.catch {
                    mark_elements_scoped(catch);
                }
            }
            TemplateNode::KeyBlock(key) => {
                mark_elements_scoped(&mut key.fragment);
            }
            TemplateNode::SnippetBlock(snippet) => {
                mark_elements_scoped(&mut snippet.body);
            }
            TemplateNode::SvelteHead(head) => {
                mark_elements_scoped(&mut head.fragment);
            }
            TemplateNode::SvelteElement(el) => {
                mark_elements_scoped(&mut el.fragment);
            }
            TemplateNode::SlotElement(slot) => {
                mark_elements_scoped(&mut slot.fragment);
            }
            TemplateNode::TitleElement(title) => {
                mark_elements_scoped(&mut title.fragment);
            }
            _ => {}
        }
    }
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
fn json_has_rune_reference(node: &serde_json::Value) -> bool {
    let node_type = node.get("type").and_then(|t| t.as_str());

    // Check if this is an Identifier with a rune name
    if node_type == Some("Identifier")
        && let Some(name) = node.get("name").and_then(|n| n.as_str())
        && is_rune_name(name)
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
                if json_has_rune_reference(val) {
                    return true;
                }
            }
        }
        serde_json::Value::Array(arr) => {
            for val in arr {
                if json_has_rune_reference(val) {
                    return true;
                }
            }
        }
        _ => {}
    }

    false
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
