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
use super::warnings;
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
    // Convert unique names from template to StoreRef (not in module).
    // Sort by first occurrence position in source to match the official Svelte compiler's
    // AST traversal order (it uses scope.declarations which is a JS Map maintaining insertion order).
    let mut template_names: Vec<String> = unique_names.into_iter().collect();
    template_names.sort_by_key(|name| analysis.source.find(name).unwrap_or(usize::MAX));
    for name in &template_names {
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

        // Skip rune names ($state, $derived, $props, etc.) UNLESS there's a declaration
        // for the unprefixed name in the INSTANCE scope that is NOT itself a rune initialization.
        //
        // This mirrors the official Svelte compiler logic (2-analyze/index.js L356-374):
        //   const declaration = instance.scope.get(store_name);
        //   const init = declaration?.initial;
        //   if (
        //     options.runes === false ||
        //     !is_rune(name) ||
        //     (declaration !== null &&
        //       (get_rune(init, instance.scope) === null || ...))
        //   )
        //
        // IMPORTANT: The official compiler looks up `store_name` in instance.scope, NOT
        // module.scope. A variable named `state` in the module scope should NOT cause
        // `$state` to be treated as a store subscription.
        //
        // For example, `import { state } from './store.js'` in the instance script creates
        // a binding for `state`, which is NOT a rune initialization, so `$state` should be
        // treated as a store subscription.
        //
        // But `let state = $state(0)` creates a State binding, so `$state` is a rune.
        if is_rune(ref_name) {
            // Look for a binding in the instance scope.
            // Use instance_scope_index which may be > 1 if module script has nested scopes.
            let instance_scope = analysis.root.instance_scope_index;
            let instance_binding = analysis
                .root
                .bindings
                .iter()
                .find(|b| b.name == store_name && b.scope_index == instance_scope);

            if let Some(binding) = instance_binding {
                // Check if the binding's initialization is itself a rune call.
                // If the binding kind is State, RawState, or Derived, it was initialized
                // with $state(), $state.raw(), or $derived() - so $name IS a rune, not a store.
                // If the binding is an import or normal let/const without rune init,
                // then $name should be a store subscription.
                let is_rune_init = matches!(
                    binding.kind,
                    BindingKind::State | BindingKind::RawState | BindingKind::Derived
                );

                if is_rune_init {
                    // The binding IS a rune initialization - skip, $name is a rune
                    continue;
                }

                // Special case from official compiler (2-analyze/index.js L366-368):
                // "rune-like names received as props are valid too (but we have to protect
                //  against $props as store)"
                //
                // When `let props = $props()` is used (Identifier pattern), the `props`
                // binding has kind RestProp. In this case `$props` must NOT be treated as
                // a store subscription - it is still the $props rune.
                //
                // However, if someone writes `let state = $props()`, the `state` binding
                // also has kind Prop/RestProp, but `$state` references elsewhere SHOULD
                // still be treated as store subscriptions (per official compiler logic):
                //   get_rune(init) === '$props' && store_name === 'props'  -> skip (rune)
                //   get_rune(init) === '$props' && store_name !== 'props'  -> create store
                //
                // We replicate this by checking binding kind is Prop/RestProp/BindableProp
                // (i.e., init was $props()) AND store_name == "props".
                let is_props_rune_init = matches!(
                    binding.kind,
                    BindingKind::Prop | BindingKind::RestProp | BindingKind::BindableProp
                ) && store_name == "props";

                if is_props_rune_init {
                    // The binding is `let props = $props()` - $props is the rune, not a store
                    continue;
                }

                // Special case from official compiler (2-analyze/index.js L370-374):
                // Allow `import { derived } from 'svelte/store'` in the same file as
                // `const x = $derived(..)` because one is not a subscription to the other.
                // When `$derived` is used and `derived` is imported from 'svelte/store',
                // treat $derived as the rune, not a store subscription.
                if ref_name == "$derived"
                    && binding.declaration_kind == DeclarationKind::Import
                    && is_import_from_svelte_store(store_name, &analysis.source)
                {
                    continue;
                }

                // The binding exists in instance scope and is NOT a rune init -
                // fall through to create store sub.
                // Emit store_rune_conflict warning if options.runes is not explicitly false
                // and the reference is used as a CallExpression (i.e., $state() looks like a rune call)
                // Corresponds to Svelte's 2-analyze/index.js L398-407
                //
                // The official compiler iterates over references for this name and checks
                // `path.at(-1)?.type === 'CallExpression'` - we approximate by checking if
                // this specific reference position is followed by `(` in the source.
                if options_runes != Some(false) {
                    let pos = store_ref.position + ref_name.len();
                    let source_bytes = analysis.source.as_bytes();
                    // Skip whitespace after the identifier
                    let mut check_pos = pos;
                    while check_pos < source_bytes.len()
                        && (source_bytes[check_pos] == b' '
                            || source_bytes[check_pos] == b'\t'
                            || source_bytes[check_pos] == b'\n'
                            || source_bytes[check_pos] == b'\r')
                    {
                        check_pos += 1;
                    }
                    if check_pos < source_bytes.len() && source_bytes[check_pos] == b'(' {
                        analysis
                            .warnings
                            .push(warnings::store_rune_conflict(store_name));
                    }
                }
            } else {
                // No binding in instance scope - skip rune names (it's a real rune)
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
            let instance_scope = analysis.root.instance_scope_index;
            if binding.scope_index != 0 && binding.scope_index != instance_scope {
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

            // Check if we already have a binding for $xxx in the top-level scopes.
            // We only check bindings in scope 0 (module) or scope 1 (instance),
            // not nested scopes. A function parameter like `function bar($derived, $effect)`
            // creates a binding for `$effect` in a nested scope, but should NOT prevent
            // creating a StoreSub for the top-level `$effect` store subscription.
            if let Some(binding_idx) = analysis.root.find_binding_any_scope(ref_name) {
                let binding = &analysis.root.bindings[binding_idx];
                let instance_scope2 = analysis.root.instance_scope_index;
                if binding.scope_index == 0 || binding.scope_index == instance_scope2 {
                    continue;
                }
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

/// Check if a `$xxx` identifier at position `ident_end` in `chars` is being
/// used as a function parameter declaration.
///
/// Returns true if:
/// - It's immediately followed by `=>` (arrow function: `$x => ...`)
/// - It's preceded (ignoring whitespace) by `(` or `,` AND followed by `)` or `,` or `=>`
///
/// This is a heuristic to avoid creating StoreSub bindings for function parameters
/// like `($count) => $count * 2` in `derived(store, $count => ...)`.
fn is_dollar_ident_parameter(chars: &[char], ident_start: usize, ident_end: usize) -> bool {
    let len = chars.len();

    // Check what comes after the identifier (skip whitespace)
    let mut j = ident_end;
    while j < len && (chars[j] == ' ' || chars[j] == '\t') {
        j += 1;
    }

    // Case 1: `$x => ...` - direct arrow function parameter
    if j + 1 < len && chars[j] == '=' && chars[j + 1] == '>' {
        return true;
    }

    // Case 2: `($x)`, `($x, ...)`, `(..., $x)` - parenthesized parameter
    // Check if preceded by '(' or ',' (ignoring whitespace)
    if ident_start > 0 {
        let mut k = ident_start as isize - 1;
        while k >= 0 && (chars[k as usize] == ' ' || chars[k as usize] == '\t') {
            k -= 1;
        }
        if k >= 0 && (chars[k as usize] == '(' || chars[k as usize] == ',') {
            // Also check what follows: should be `)`, `,`, or `=>`
            // (avoid false positives in function calls like `derived(store, $count)`)
            if j < len && (chars[j] == ')' || chars[j] == ',') {
                // Look ahead more to check if this is indeed a function parameter list
                // followed by `=>` rather than just a function call argument
                let mut paren_depth = 0i32;
                let mut m = j;
                while m < len {
                    match chars[m] {
                        '(' => paren_depth += 1,
                        ')' => {
                            if paren_depth == 0 {
                                // Found the closing paren - check if followed by =>
                                let mut n = m + 1;
                                while n < len && (chars[n] == ' ' || chars[n] == '\t') {
                                    n += 1;
                                }
                                if n + 1 < len && chars[n] == '=' && chars[n + 1] == '>' {
                                    return true;
                                }
                                break;
                            }
                            paren_depth -= 1;
                        }
                        _ => {}
                    }
                    m += 1;
                }
            }
        }
    }

    false
}

/// Check if a `$xxx` identifier at position `ident_start` is being declared as a
/// variable (let/const/var $xxx) rather than being a store subscription reference.
///
/// Returns true if `$xxx` is preceded (ignoring whitespace) by `let`, `const`, or `var`.
fn is_dollar_ident_variable_declaration(chars: &[char], ident_start: usize) -> bool {
    if ident_start == 0 {
        return false;
    }
    // Skip backwards over whitespace
    let mut k = ident_start as isize - 1;
    while k >= 0 && (chars[k as usize] == ' ' || chars[k as usize] == '\t') {
        k -= 1;
    }
    if k < 0 {
        return false;
    }
    // Check for `let`, `const`, `var` keywords ending at position k
    let pos = k as usize;
    if pos >= 2 && &chars[pos - 2..=pos].iter().collect::<String>() == "let" {
        // Make sure not part of a longer word
        let before = if pos >= 3 { chars[pos - 3] } else { ' ' };
        if !before.is_alphanumeric() && before != '_' && before != '$' {
            return true;
        }
    }
    if pos >= 4 && &chars[pos - 4..=pos].iter().collect::<String>() == "const" {
        let before = if pos >= 5 { chars[pos - 5] } else { ' ' };
        if !before.is_alphanumeric() && before != '_' && before != '$' {
            return true;
        }
    }
    if pos >= 2 && &chars[pos - 2..=pos].iter().collect::<String>() == "var" {
        let before = if pos >= 3 { chars[pos - 3] } else { ' ' };
        if !before.is_alphanumeric() && before != '_' && before != '$' {
            return true;
        }
    }
    false
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
    let mut in_string: Option<char> = None; // track if inside a string literal
    let mut in_line_comment = false; // track // comments
    let mut in_block_comment = false; // track /* */ comments

    while i < len {
        let c = chars[i];

        // Handle line comment end
        if in_line_comment {
            if c == '\n' {
                in_line_comment = false;
            }
            i += 1;
            continue;
        }

        // Handle block comment end
        if in_block_comment {
            if c == '*' && i + 1 < len && chars[i + 1] == '/' {
                in_block_comment = false;
                i += 2;
            } else {
                i += 1;
            }
            continue;
        }

        // Handle string content
        if let Some(quote) = in_string {
            if c == '\\' {
                // Escape sequence - skip next char
                i += 2;
                continue;
            } else if c == quote {
                in_string = None;
            }
            i += 1;
            continue;
        }

        // Check for comment starts
        if c == '/' && i + 1 < len {
            if chars[i + 1] == '/' {
                in_line_comment = true;
                i += 2;
                continue;
            } else if chars[i + 1] == '*' {
                in_block_comment = true;
                i += 2;
                continue;
            }
        }

        // Check for string starts
        if c == '"' || c == '\'' || c == '`' {
            in_string = Some(c);
            i += 1;
            continue;
        }

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
                    // Skip if this dollar identifier is used as a function parameter
                    // (e.g., `$count => $count * 2` or `($count) => ...`)
                    // Such uses are NOT store subscriptions - they're local parameter names.
                    // Also skip if this is a variable declaration (let/const/var $xxx).
                    if !is_dollar_ident_parameter(&chars, ident_start, i)
                        && !is_dollar_ident_variable_declaration(&chars, ident_start)
                    {
                        refs.push(StoreRef {
                            name: ident,
                            position: base_offset + ident_start,
                            in_module,
                        });
                    }
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

/// Check if a given name is imported from 'svelte/store' in the source code.
/// This checks for patterns like:
///   import { derived } from 'svelte/store'
///   import { derived } from "svelte/store"
///   import { writable, derived } from 'svelte/store'
fn is_import_from_svelte_store(name: &str, source: &str) -> bool {
    // Look for import statements containing the name from 'svelte/store'
    for line in source.lines() {
        let trimmed = line.trim();
        if !trimmed.starts_with("import ") {
            continue;
        }
        // Check if this import line includes the name and 'svelte/store'
        if (trimmed.contains("'svelte/store'") || trimmed.contains("\"svelte/store\""))
            && trimmed.contains(name)
        {
            return true;
        }
    }
    false
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
            // Use the context-aware variant that filters out function parameters and
            // variable declarations (let/const/var $xxx) to avoid false positives.
            let mut context_refs: Vec<StoreRef> = Vec::new();
            collect_dollar_identifiers_from_js_with_context(
                &source[start..end],
                start,
                &mut context_refs,
                false,
            );
            for r in context_refs {
                refs.insert(r.name);
            }
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
