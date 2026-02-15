//! Store subscription detection.
//!
//! Detects store subscriptions (`$store`) in the component and creates
//! synthetic `StoreSub` bindings for them.
//!
//! Corresponds to the store subscription logic in Svelte's `2-analyze/index.js` L348-444.

use super::AnalysisError;
use super::RESERVED;
use super::errors;
use super::scope::{Binding, BindingKind, DeclarationKind};
use super::types::ComponentAnalysis;
use super::visitors::shared::function::is_rune;
use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, AwaitBlock, EachBlock, Fragment, IfBlock,
    KeyBlock, RegularElement, Root, Script, SnippetBlock, TemplateNode,
};
use rustc_hash::FxHashSet;

/// A store reference with location context
#[derive(Debug, Clone)]
#[allow(dead_code)]
struct StoreRef {
    /// The full name including $ (e.g., "$store")
    name: String,
    /// Position in source
    position: usize,
    /// Whether this is in a module script (vs instance or template)
    in_module: bool,
}

/// Detect store subscriptions and create synthetic bindings.
///
/// This function scans the AST for identifiers starting with `$` and checks if
/// a corresponding binding (without the `$` prefix) exists. If so, it creates
/// a `StoreSub` binding for the `$name` identifier.
///
/// It also validates that `$` and `$$` prefixed names are valid, returning
/// `global_reference_invalid` errors for invalid references like bare `$` or
/// lowercase `$xxx` names that don't have corresponding bindings.
///
/// # Arguments
///
/// * `ast` - The parsed AST
/// * `analysis` - The component analysis to update
///
/// # Returns
///
/// Returns `Ok(())` on success, or an error if invalid $ references are found.
pub fn detect_store_subscriptions(
    ast: &Root,
    analysis: &mut ComponentAnalysis,
    options_runes: Option<bool>,
) -> Result<(), AnalysisError> {
    // Collect all $xxx references from the AST with context
    let mut store_refs: Vec<StoreRef> = Vec::new();
    let mut unique_names: FxHashSet<String> = FxHashSet::default();

    // Scan scripts for $xxx identifiers
    if let Some(ref instance) = ast.instance {
        collect_dollar_refs_from_script_with_context(
            instance,
            &analysis.source,
            &mut store_refs,
            false,
        );
    }

    if let Some(ref module) = ast.module {
        collect_dollar_refs_from_script_with_context(
            module,
            &analysis.source,
            &mut store_refs,
            true,
        );
    }

    // Scan template for $xxx identifiers
    collect_dollar_refs_from_fragment(&ast.fragment, &analysis.source, &mut unique_names);
    // Convert unique names from template to StoreRef (not in module)
    for name in &unique_names {
        if !store_refs.iter().any(|r| &r.name == name) {
            store_refs.push(StoreRef {
                name: name.clone(),
                position: 0,
                in_module: false,
            });
        }
    }

    // For each $xxx reference, check if xxx binding exists and create StoreSub binding
    for store_ref in &store_refs {
        let ref_name = &store_ref.name;

        // Skip reserved names ($$props, $$restProps, $$slots)
        if RESERVED.contains(&ref_name.as_str()) {
            continue;
        }

        // Check for invalid $$ references ($$xxx is illegal)
        // Corresponds to Svelte's L266-269 and L351-352 in 2-analyze/index.js
        // Note: bare $ detection is handled in Identifier visitor via proper AST analysis
        if ref_name.starts_with("$$") {
            return Err(errors::global_reference_invalid(ref_name));
        }

        // Skip names that don't start with $ or bare $
        if !ref_name.starts_with('$') || ref_name == "$" {
            continue;
        }

        // Get the store name (without $)
        let store_name = &ref_name[1..];

        // Skip if empty after removing $
        if store_name.is_empty() {
            continue;
        }

        // Skip rune names ($state, $derived, $props, etc.).
        // In runes mode, the $ prefix always refers to the rune, not a store subscription.
        // In legacy mode, skip unless there's a TOP-LEVEL binding for the store name
        // (e.g., `let state = writable(...)` at the top level makes `$state` a store sub).
        //
        // IMPORTANT: We must also skip rune names when runes mode hasn't been auto-detected
        // yet (options.runes is None). This is because detect_store_subscriptions runs
        // BEFORE runes auto-detection, and code like `const state = $state(...)` inside a
        // function would create a nested binding for `state`, triggering a false positive
        // store_invalid_scoped_subscription error. The official Svelte compiler's
        // create_scopes phase handles this correctly by never creating store subscriptions
        // for rune names when the binding is in a nested scope.
        if is_rune(ref_name) {
            if analysis.runes {
                // Definitely runes mode - always skip rune names
                continue;
            }
            // Check if there's a top-level binding for the store name
            // Only treat it as a store subscription if the binding is at the top level
            // We need to check all scopes (module + instance) since the binding might
            // be in the instance scope (e.g., reactive declarations like `$: z = ...`)
            if let Some(binding_idx) = analysis.root.find_binding_any_scope(store_name) {
                let binding = &analysis.root.bindings[binding_idx];
                if binding.scope_index > 1 {
                    // The only binding for this name is in a nested scope.
                    // This is likely a rune usage (e.g., `const state = $state(...)` inside
                    // a function), not a store subscription. Skip it.
                    continue;
                }
            } else {
                // No binding at all for the store name - skip rune names
                continue;
            }
        }

        // Check if a binding exists for the store name (xxx) and where it's declared
        // We search all scopes (module + instance) since bindings from reactive
        // declarations ($: z = ...) are in the instance scope, not root scope
        if let Some(binding_idx) = analysis.root.find_binding_any_scope(store_name) {
            let binding = &analysis.root.bindings[binding_idx];

            // Check if the binding is in a nested scope (not module or instance scope)
            // This catches cases like {#each items as item} ... {$item} ... {/each}
            // where `item` is declared in the each block scope, not at top level
            //
            // In our scope structure:
            // - Scope 0 = module scope (always exists)
            // - Scope 1 = instance script scope (when there's an instance script)
            // - Scope 2+ = nested scopes (each blocks, snippets, etc.)
            //
            // Store subscriptions are only valid when the store binding is in
            // the module scope (0) or instance scope (1).
            if binding.scope_index > 1 {
                // This is a scoped subscription - the store is not at top level
                return Err(errors::store_invalid_scoped_subscription());
            }

            // Check for bindings that represent local variables (EachItem, SnippetParam, etc.)
            // These are inherently scoped even if scope_index might be 0 due to how
            // declarations are collected into root scope
            if matches!(
                binding.kind,
                BindingKind::EachItem
                    | BindingKind::EachIndex
                    | BindingKind::SnippetParam
                    | BindingKind::AwaitThen
                    | BindingKind::AwaitCatch
            ) {
                return Err(errors::store_invalid_scoped_subscription());
            }

            // NOTE: We previously had a check here that errored if the store name was
            // shadowed in ANY nested scope. This was too aggressive - it would error even
            // when the $store reference itself was at the top level (e.g., in template).
            //
            // The proper context-aware shadowing check is done in walk_js_expression()
            // in visitors/shared/utils.rs, which tracks function_depth and only errors
            // when a $store reference is actually INSIDE a scope where the variable is shadowed.
            //
            // Example where this matters:
            //   let store = writable({action: (node, text) => { ... }});
            //   let text = writable('hello');
            //   <div use:$store.action={$text}>  <!-- $text here is valid! -->
            //
            // The arrow function parameter `text` should NOT cause an error for template
            // references to $text.

            // Check if the reference is inside a module script
            // Store subscriptions are not allowed in module scripts
            // Corresponds to Svelte's L410-420 in 2-analyze/index.js
            if store_ref.in_module {
                return Err(errors::store_invalid_subscription());
            }

            // Check if we already have a binding for $xxx
            if analysis.root.find_binding_any_scope(ref_name).is_some() {
                continue;
            }

            // Create a synthetic StoreSub binding
            let new_binding_idx = analysis.root.bindings.len();
            let new_binding = Binding::with_declaration_kind(
                ref_name.clone(),
                BindingKind::StoreSub,
                DeclarationKind::Synthetic,
                0, // Root scope
            );
            analysis.root.bindings.push(new_binding);
            analysis
                .root
                .scope
                .declarations
                .insert(ref_name.clone(), new_binding_idx);
        } else if options_runes != Some(false) {
            // When options.runes is not explicitly false (i.e., undefined/auto or true),
            // if no binding exists for a lowercase $xxx name, it's an invalid global reference.
            // This matches Svelte's behavior: `if (options.runes !== false) { ... }`
            // Corresponds to Svelte's L398-400 in 2-analyze/index.js
            if !store_name.is_empty() && store_name.chars().next().is_some_and(|c| c.is_lowercase())
            {
                return Err(errors::global_reference_invalid(ref_name));
            }
        }
    }

    Ok(())
}

/// Collect $xxx identifiers from a script block with context.
fn collect_dollar_refs_from_script_with_context(
    script: &Script,
    source: &str,
    refs: &mut Vec<StoreRef>,
    in_module: bool,
) {
    let start = script.content.start().unwrap_or(0) as usize;
    let end = script.content.end().unwrap_or(0) as usize;

    if end <= start || end > source.len() {
        return;
    }

    let content = &source[start..end];
    collect_dollar_identifiers_from_js_with_context(content, start, refs, in_module);
}

/// Collect $xxx identifiers from a JavaScript string with context.
fn collect_dollar_identifiers_from_js_with_context(
    js: &str,
    base_offset: usize,
    refs: &mut Vec<StoreRef>,
    in_module: bool,
) {
    // Simple regex-like scanning for $xxx identifiers
    // We look for $ followed by valid identifier characters
    let chars: Vec<char> = js.chars().collect();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        // Check for $ that could start an identifier
        if chars[i] == '$' {
            // Check if this is a valid identifier start (not part of a larger identifier)
            // Also skip $ preceded by '.' (member access like `obj.$set`)
            let prev_is_ident_char = if i > 0 {
                is_identifier_char(chars[i - 1]) || chars[i - 1] == '.'
            } else {
                false
            };

            if !prev_is_ident_char {
                let ident_start = i;
                // Collect the identifier
                let mut ident = String::from("$");
                i += 1;

                // Allow for $$ prefix
                if i < len && chars[i] == '$' {
                    ident.push('$');
                    i += 1;
                }

                // Collect identifier characters
                while i < len && is_identifier_char(chars[i]) {
                    ident.push(chars[i]);
                    i += 1;
                }

                // Only add if we have more than just $
                // (bare $ detection is handled separately via proper AST analysis)
                if ident.len() > 1 {
                    refs.push(StoreRef {
                        name: ident,
                        position: base_offset + ident_start,
                        in_module,
                    });
                }
                continue;
            }
        }
        i += 1;
    }
}

/// Collect $xxx identifiers from a script block.
#[allow(dead_code)]
fn collect_dollar_refs_from_script(script: &Script, source: &str, refs: &mut FxHashSet<String>) {
    let start = script.content.start().unwrap_or(0) as usize;
    let end = script.content.end().unwrap_or(0) as usize;

    if end <= start || end > source.len() {
        return;
    }

    let content = &source[start..end];
    collect_dollar_identifiers_from_js(content, refs);
}

/// Collect $xxx identifiers from a JavaScript string.
fn collect_dollar_identifiers_from_js(js: &str, refs: &mut FxHashSet<String>) {
    // Simple regex-like scanning for $xxx identifiers
    // We look for $ followed by valid identifier characters
    let chars: Vec<char> = js.chars().collect();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        // Check for $ that could start an identifier
        if chars[i] == '$' {
            // Check if this is a valid identifier start (not part of a larger identifier)
            // Also skip $ preceded by '.' (member access like `obj.$set`)
            let prev_is_ident_char = if i > 0 {
                is_identifier_char(chars[i - 1]) || chars[i - 1] == '.'
            } else {
                false
            };

            if !prev_is_ident_char {
                // Collect the identifier
                let mut ident = String::from("$");
                i += 1;

                // Allow for $$ prefix
                if i < len && chars[i] == '$' {
                    ident.push('$');
                    i += 1;
                }

                // Collect identifier characters
                while i < len && is_identifier_char(chars[i]) {
                    ident.push(chars[i]);
                    i += 1;
                }

                // Only add if we have more than just $
                // (bare $ detection is handled separately via proper AST analysis)
                if ident.len() > 1 {
                    refs.insert(ident);
                }
                continue;
            }
        }
        i += 1;
    }
}

/// Check if a character is a valid JavaScript identifier character.
fn is_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// Collect $xxx identifiers from a template fragment.
fn collect_dollar_refs_from_fragment(
    fragment: &Fragment,
    source: &str,
    refs: &mut FxHashSet<String>,
) {
    for node in &fragment.nodes {
        collect_dollar_refs_from_node(node, source, refs);
    }
}

/// Collect $xxx identifiers from a template node.
fn collect_dollar_refs_from_node(node: &TemplateNode, source: &str, refs: &mut FxHashSet<String>) {
    match node {
        TemplateNode::ExpressionTag(tag) => {
            collect_dollar_refs_from_expression(&tag.expression, source, refs);
        }
        TemplateNode::RegularElement(element) => {
            collect_dollar_refs_from_element(element, source, refs);
        }
        TemplateNode::Component(component) => {
            collect_dollar_refs_from_attributes(&component.attributes, source, refs);
            collect_dollar_refs_from_fragment(&component.fragment, source, refs);
        }
        TemplateNode::SvelteComponent(component) => {
            collect_dollar_refs_from_expression(&component.expression, source, refs);
            collect_dollar_refs_from_attributes(&component.attributes, source, refs);
            collect_dollar_refs_from_fragment(&component.fragment, source, refs);
        }
        TemplateNode::SvelteElement(element) => {
            // svelte:element has a dynamic tag expression
            collect_dollar_refs_from_expression(&element.tag, source, refs);
            collect_dollar_refs_from_attributes(&element.attributes, source, refs);
            collect_dollar_refs_from_fragment(&element.fragment, source, refs);
        }
        TemplateNode::SlotElement(slot) => {
            collect_dollar_refs_from_attributes(&slot.attributes, source, refs);
            collect_dollar_refs_from_fragment(&slot.fragment, source, refs);
        }
        TemplateNode::TitleElement(title) => {
            collect_dollar_refs_from_attributes(&title.attributes, source, refs);
            collect_dollar_refs_from_fragment(&title.fragment, source, refs);
        }
        TemplateNode::RenderTag(tag) => {
            // RenderTag's expression is the full call expression like `snippet(arg1, arg2)`
            // The arguments are in the metadata for analysis purposes
            collect_dollar_refs_from_expression(&tag.expression, source, refs);
        }
        TemplateNode::IfBlock(block) => {
            collect_dollar_refs_from_if_block(block, source, refs);
        }
        TemplateNode::EachBlock(block) => {
            collect_dollar_refs_from_each_block(block, source, refs);
        }
        TemplateNode::AwaitBlock(block) => {
            collect_dollar_refs_from_await_block(block, source, refs);
        }
        TemplateNode::KeyBlock(block) => {
            collect_dollar_refs_from_key_block(block, source, refs);
        }
        TemplateNode::SnippetBlock(block) => {
            collect_dollar_refs_from_snippet_block(block, source, refs);
        }
        TemplateNode::ConstTag(tag) => {
            collect_dollar_refs_from_expression(&tag.declaration, source, refs);
        }
        TemplateNode::DebugTag(tag) => {
            for ident in &tag.identifiers {
                collect_dollar_refs_from_expression(ident, source, refs);
            }
        }
        TemplateNode::HtmlTag(tag) => {
            collect_dollar_refs_from_expression(&tag.expression, source, refs);
        }
        TemplateNode::SvelteSelf(self_component) => {
            collect_dollar_refs_from_attributes(&self_component.attributes, source, refs);
            collect_dollar_refs_from_fragment(&self_component.fragment, source, refs);
        }
        TemplateNode::SvelteDocument(doc) => {
            collect_dollar_refs_from_attributes(&doc.attributes, source, refs);
            collect_dollar_refs_from_fragment(&doc.fragment, source, refs);
        }
        TemplateNode::SvelteWindow(window) => {
            collect_dollar_refs_from_attributes(&window.attributes, source, refs);
            collect_dollar_refs_from_fragment(&window.fragment, source, refs);
        }
        TemplateNode::SvelteBody(body) => {
            collect_dollar_refs_from_attributes(&body.attributes, source, refs);
            collect_dollar_refs_from_fragment(&body.fragment, source, refs);
        }
        TemplateNode::SvelteHead(head) => {
            collect_dollar_refs_from_attributes(&head.attributes, source, refs);
            collect_dollar_refs_from_fragment(&head.fragment, source, refs);
        }
        TemplateNode::SvelteFragment(frag) => {
            collect_dollar_refs_from_attributes(&frag.attributes, source, refs);
            collect_dollar_refs_from_fragment(&frag.fragment, source, refs);
        }
        TemplateNode::SvelteOptions(_)
        | TemplateNode::SvelteBoundary(_)
        | TemplateNode::Text(_)
        | TemplateNode::Comment(_)
        | TemplateNode::AttachTag(_) => {}
    }
}

/// Collect $xxx identifiers from an element.
fn collect_dollar_refs_from_element(
    element: &RegularElement,
    source: &str,
    refs: &mut FxHashSet<String>,
) {
    collect_dollar_refs_from_attributes(&element.attributes, source, refs);
    collect_dollar_refs_from_fragment(&element.fragment, source, refs);
}

/// Collect $xxx identifiers from attributes.
fn collect_dollar_refs_from_attributes(
    attributes: &[Attribute],
    source: &str,
    refs: &mut FxHashSet<String>,
) {
    for attr in attributes {
        match attr {
            Attribute::Attribute(attr_node) => match &attr_node.value {
                AttributeValue::Expression(expr) => {
                    collect_dollar_refs_from_expression(&expr.expression, source, refs);
                }
                AttributeValue::Sequence(parts) => {
                    for part in parts {
                        if let AttributeValuePart::ExpressionTag(expr_tag) = part {
                            collect_dollar_refs_from_expression(&expr_tag.expression, source, refs);
                        }
                    }
                }
                _ => {}
            },
            Attribute::SpreadAttribute(spread) => {
                collect_dollar_refs_from_expression(&spread.expression, source, refs);
            }
            Attribute::OnDirective(on_dir) => {
                if let Some(ref expr) = on_dir.expression {
                    collect_dollar_refs_from_expression(expr, source, refs);
                }
            }
            Attribute::BindDirective(bind_dir) => {
                collect_dollar_refs_from_expression(&bind_dir.expression, source, refs);
            }
            Attribute::ClassDirective(class_dir) => {
                collect_dollar_refs_from_expression(&class_dir.expression, source, refs);
            }
            Attribute::StyleDirective(style_dir) => {
                // StyleDirective.value is AttributeValue (not Option)
                match &style_dir.value {
                    AttributeValue::Expression(expr_tag) => {
                        collect_dollar_refs_from_expression(&expr_tag.expression, source, refs);
                    }
                    AttributeValue::Sequence(parts) => {
                        for part in parts {
                            if let AttributeValuePart::ExpressionTag(expr_tag) = part {
                                collect_dollar_refs_from_expression(
                                    &expr_tag.expression,
                                    source,
                                    refs,
                                );
                            }
                        }
                    }
                    _ => {}
                }
            }
            Attribute::UseDirective(use_dir) => {
                // Check if the directive name contains a store reference
                // e.g., use:$store.action should create a subscription for $store
                if use_dir.name.starts_with('$') {
                    // Extract the store name (before the first . if present)
                    let store_name = if let Some(dot_pos) = use_dir.name.find('.') {
                        &use_dir.name[..dot_pos]
                    } else {
                        use_dir.name.as_str()
                    };
                    if store_name.len() > 1 {
                        refs.insert(store_name.to_string());
                    }
                }
                if let Some(ref expr) = use_dir.expression {
                    collect_dollar_refs_from_expression(expr, source, refs);
                }
            }
            Attribute::TransitionDirective(trans_dir) => {
                if let Some(ref expr) = trans_dir.expression {
                    collect_dollar_refs_from_expression(expr, source, refs);
                }
            }
            Attribute::AnimateDirective(anim_dir) => {
                if let Some(ref expr) = anim_dir.expression {
                    collect_dollar_refs_from_expression(expr, source, refs);
                }
            }
            Attribute::LetDirective(_) => {
                // let: directives don't contain expressions to scan
            }
            Attribute::AttachTag(attach) => {
                collect_dollar_refs_from_expression(&attach.expression, source, refs);
            }
        }
    }
}

/// Collect $xxx identifiers from an expression.
fn collect_dollar_refs_from_expression(
    expr: &crate::ast::js::Expression,
    source: &str,
    refs: &mut FxHashSet<String>,
) {
    // Extract source range and collect identifiers from the expression source
    if let Some(start) = expr.start()
        && let Some(end) = expr.end()
    {
        let start = start as usize;
        let end = end as usize;
        if end <= source.len() && start < end {
            let expr_source = &source[start..end];
            collect_dollar_identifiers_from_js(expr_source, refs);
        }
    }
}

/// Collect $xxx identifiers from an if block.
fn collect_dollar_refs_from_if_block(block: &IfBlock, source: &str, refs: &mut FxHashSet<String>) {
    collect_dollar_refs_from_expression(&block.test, source, refs);
    collect_dollar_refs_from_fragment(&block.consequent, source, refs);
    if let Some(ref alternate) = block.alternate {
        collect_dollar_refs_from_fragment(alternate, source, refs);
    }
}

/// Collect $xxx identifiers from an each block.
fn collect_dollar_refs_from_each_block(
    block: &EachBlock,
    source: &str,
    refs: &mut FxHashSet<String>,
) {
    collect_dollar_refs_from_expression(&block.expression, source, refs);
    if let Some(ref key) = block.key {
        collect_dollar_refs_from_expression(key, source, refs);
    }
    collect_dollar_refs_from_fragment(&block.body, source, refs);
    if let Some(ref fallback) = block.fallback {
        collect_dollar_refs_from_fragment(fallback, source, refs);
    }
}

/// Collect $xxx identifiers from an await block.
fn collect_dollar_refs_from_await_block(
    block: &AwaitBlock,
    source: &str,
    refs: &mut FxHashSet<String>,
) {
    collect_dollar_refs_from_expression(&block.expression, source, refs);
    if let Some(ref pending) = block.pending {
        collect_dollar_refs_from_fragment(pending, source, refs);
    }
    if let Some(ref then) = block.then {
        collect_dollar_refs_from_fragment(then, source, refs);
    }
    if let Some(ref catch) = block.catch {
        collect_dollar_refs_from_fragment(catch, source, refs);
    }
}

/// Collect $xxx identifiers from a key block.
fn collect_dollar_refs_from_key_block(
    block: &KeyBlock,
    source: &str,
    refs: &mut FxHashSet<String>,
) {
    collect_dollar_refs_from_expression(&block.expression, source, refs);
    collect_dollar_refs_from_fragment(&block.fragment, source, refs);
}

/// Collect $xxx identifiers from a snippet block.
fn collect_dollar_refs_from_snippet_block(
    block: &SnippetBlock,
    source: &str,
    refs: &mut FxHashSet<String>,
) {
    collect_dollar_refs_from_fragment(&block.body, source, refs);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_collect_dollar_identifiers() {
        let mut refs = FxHashSet::default();

        // Simple store reference
        collect_dollar_identifiers_from_js("$store", &mut refs);
        assert!(refs.contains("$store"));

        // Multiple references
        refs.clear();
        collect_dollar_identifiers_from_js("$a + $b", &mut refs);
        assert!(refs.contains("$a"));
        assert!(refs.contains("$b"));

        // $$ prefix (internal variables)
        refs.clear();
        collect_dollar_identifiers_from_js("$$props", &mut refs);
        assert!(refs.contains("$$props"));

        // Just $
        refs.clear();
        collect_dollar_identifiers_from_js("$ + 1", &mut refs);
        assert!(!refs.contains("$"));

        // $ in string literal (would be collected, but that's OK since we validate later)
        refs.clear();
        collect_dollar_identifiers_from_js("'$store'", &mut refs);
        assert!(refs.contains("$store"));

        // Rune-like names
        refs.clear();
        collect_dollar_identifiers_from_js("$state(0)", &mut refs);
        assert!(refs.contains("$state"));

        // Property access on store
        refs.clear();
        collect_dollar_identifiers_from_js("$store.value", &mut refs);
        assert!(refs.contains("$store"));
    }

    #[test]
    fn test_is_identifier_char() {
        assert!(is_identifier_char('a'));
        assert!(is_identifier_char('Z'));
        assert!(is_identifier_char('0'));
        assert!(is_identifier_char('_'));
        assert!(is_identifier_char('$'));
        assert!(!is_identifier_char(' '));
        assert!(!is_identifier_char('.'));
        assert!(!is_identifier_char('+'));
    }

    #[test]
    fn test_detect_store_subscriptions_integration() {
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase1_parse::{ParseOptions, parse};
        use crate::compiler::phases::phase2_analyze::analyze_component;

        let parse_opts = ParseOptions::default();

        // Test case 1: Simple store subscription
        let source = r#"<script>
    import { writable } from 'svelte/store';
    const count = writable(0);
</script>

<p>{$count}</p>
"#;
        let mut ast = parse(source, parse_opts.clone()).unwrap();
        let options = CompileOptions::default();
        let analysis = analyze_component(&mut ast, source, &options).unwrap();

        // Should have a StoreSub binding for $count
        let has_store_sub = analysis
            .root
            .bindings
            .iter()
            .any(|b| b.name == "$count" && matches!(b.kind, BindingKind::StoreSub));
        assert!(has_store_sub, "Should have a StoreSub binding for $count");

        // Test case 2: Rune without corresponding binding (should NOT create StoreSub)
        let source2 = r#"<script>
    let value = $state(0);
</script>

<p>{value}</p>
"#;
        let mut ast2 = parse(source2, parse_opts.clone()).unwrap();
        let analysis2 = analyze_component(&mut ast2, source2, &options).unwrap();

        // Should NOT have a StoreSub binding for $state (it's a rune)
        let has_state_store = analysis2
            .root
            .bindings
            .iter()
            .any(|b| b.name == "$state" && matches!(b.kind, BindingKind::StoreSub));
        assert!(
            !has_state_store,
            "Should NOT have a StoreSub binding for $state (it's a rune)"
        );

        // Test case 3: Store in event handler
        let source3 = r#"<script>
    import { writable } from 'svelte/store';
    const items = writable([]);
</script>

<button onclick={() => $items.push('new')}>Add</button>
"#;
        let mut ast3 = parse(source3, parse_opts).unwrap();
        let analysis3 = analyze_component(&mut ast3, source3, &options).unwrap();

        // Should have a StoreSub binding for $items
        let has_items_store = analysis3
            .root
            .bindings
            .iter()
            .any(|b| b.name == "$items" && matches!(b.kind, BindingKind::StoreSub));
        assert!(has_items_store, "Should have a StoreSub binding for $items");
    }
}
