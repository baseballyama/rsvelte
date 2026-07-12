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
    is_module_file: bool,
) -> Result<(), AnalysisError> {
    // Collect all $xxx references from the AST with context
    let mut store_refs: Vec<StoreRef> = Vec::new();
    let mut template_refs: Vec<StoreRef> = Vec::new();

    // Scan scripts for $xxx identifiers
    if let Some(ref instance) = ast.instance {
        collect_dollar_refs_from_script_with_context(
            instance,
            &analysis.source,
            &mut store_refs,
            false,
            analysis.is_typescript,
        );
    }

    if let Some(ref module) = ast.module {
        collect_dollar_refs_from_script_with_context(
            module,
            &analysis.source,
            &mut store_refs,
            true,
            analysis.is_typescript,
        );
    }

    // Scan template for $xxx identifiers. The recursive collector visits nodes in
    // document order, so `template_refs` arrives in AST-traversal order — the same
    // order the official compiler inserts store bindings into `scope.declarations`
    // (a JS Map keyed by first reference). We must NOT sort by a textual position:
    // a substring search would place `$x` at the offset of `$xGet`/`$xScale` and
    // `$y` inside `$yGet`/`$yRange`, reordering the emitted getters (issue #1229).
    collect_dollar_refs_from_fragment(&ast.fragment, &analysis.source, &mut template_refs);
    // Append template references in first-occurrence order, skipping any name already
    // seen in the instance/module scripts (which are visited before the template).
    let mut seen_template: FxHashSet<&str> = FxHashSet::default();
    for store_ref in &template_refs {
        if store_refs.iter().any(|r| r.name == store_ref.name) {
            continue;
        }
        if seen_template.insert(store_ref.name.as_str()) {
            store_refs.push(store_ref.clone());
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
        //
        // For .svelte.js module files, rune names are always valid and should never
        // create store subscriptions. The official compiler's analyze_module() simply
        // checks: if (binding !== null && !is_rune(name)) { error }
        if is_rune(ref_name) && is_module_file {
            continue;
        }
        if is_rune(ref_name) {
            // Look for a binding in the instance scope AND module scope (scope 0).
            // The official Svelte compiler uses `instance.scope.get(store_name)` which
            // traverses the scope chain: instance -> module -> root.
            // So if `state` is declared in the module scope but `$state` is used in instance,
            // the lookup should find it.
            //
            // IMPORTANT: We must only check the instance scope and module scope (scope 0),
            // NOT nested scopes. A function parameter named `state` inside a nested function
            // should NOT cause `$state` to be treated as a store subscription.
            //
            // We only search the module scope when the reference is NOT from the module
            // script itself. When a rune-named reference like `$state` appears in the
            // module script, it's most likely being used as a rune call (e.g., `$state({...})`),
            // not as a store subscription. The official compiler handles this via
            // `get_rune(path.at(-1), module.scope)` check, but we approximate by
            // not searching the module scope for module-level references.
            let instance_scope = analysis.root.instance_scope_index;
            let instance_binding = analysis
                .root
                .bindings
                .iter()
                .find(|b| b.name == store_name && b.scope_index == instance_scope)
                .or_else(|| {
                    // Also check module scope (scope 0), but only for non-module references.
                    // Module-level rune references (e.g., `const data = $state({...})`) should
                    // NOT trigger a store subscription lookup via the module scope.
                    if instance_scope != 0 {
                        analysis
                            .root
                            .bindings
                            .iter()
                            .find(|b| b.name == store_name && b.scope_index == 0)
                    } else {
                        None
                    }
                });

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
                // Also detect the `let { props } = $props()` case. Prop binding kinds are
                // assigned during the later visitor walk, which runs AFTER store subscription
                // detection, so at this point the binding kind may still be the default
                // (Normal). As a fallback, scan the instance script source for any
                // `= $props(` initializer — if one exists and `store_name == "props"`, then
                // `$props` refers to the rune (not a store subscription).
                let instance_has_props_rune_init = ast
                    .instance
                    .as_ref()
                    .and_then(|inst| {
                        let s = inst.content.start().unwrap_or(0) as usize;
                        let e = inst.content.end().unwrap_or(0) as usize;
                        if e > s && e <= analysis.source.len() {
                            Some(&analysis.source[s..e])
                        } else {
                            None
                        }
                    })
                    .map(|src| src.contains("$props(") || src.contains("$props.bindable("))
                    .unwrap_or(false);
                let is_props_rune_init = (matches!(
                    binding.kind,
                    BindingKind::Prop | BindingKind::RestProp | BindingKind::BindableProp
                ) || instance_has_props_rune_init)
                    && store_name == "props";

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

        // Check if a binding exists for the store name (xxx) in the instance or module scope.
        // We look up using the instance scope chain (instance -> module -> root) which is
        // the proper way to find bindings, matching the official Svelte's
        // `instance.scope.get(store_name)`.
        let instance_scope = analysis.root.instance_scope_index;
        let binding_from_instance = if instance_scope > 0 {
            analysis.root.get_binding(store_name, instance_scope)
        } else {
            // No instance scope - check root scope
            analysis.root.scope.declarations.get(store_name).copied()
        };

        // Also check module scope (scope 0) if not found in instance
        let binding_idx = binding_from_instance
            .or_else(|| analysis.root.scope.declarations.get(store_name).copied());

        if let Some(binding_idx) = binding_idx {
            let binding = &analysis.root.bindings[binding_idx];

            // Check if the binding is in a nested scope (not module or instance scope)
            // This catches cases like {#each items as item} ... {$item} ... {/each}
            // where `item` is declared in the each block scope, not at top level
            //
            // Store subscriptions are only valid when the store binding is in
            // the module scope (0) or instance scope.
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
                // For rune names ($state, $effect, etc.) used as rune calls in module context,
                // don't error - just let it fall through to create the store sub.
                // The official Svelte compiler checks get_rune(path.at(-1), module.scope) !== null.
                // We approximate by checking if the reference is followed by '(' (i.e., a call).
                if is_rune(ref_name) {
                    let pos = store_ref.position + ref_name.len();
                    let source_bytes = analysis.source.as_bytes();
                    let mut check_pos = pos;
                    while check_pos < source_bytes.len()
                        && matches!(source_bytes[check_pos], b' ' | b'\t' | b'\n' | b'\r')
                    {
                        check_pos += 1;
                    }
                    let is_call = check_pos < source_bytes.len() && source_bytes[check_pos] == b'(';
                    if is_call {
                        // It's a rune call like $state({...}) - don't error, but still
                        // create the store sub (the official compiler does this)
                    } else {
                        // Rune name used as a non-call reference in module context
                        // This would be invalid, but since it's a rune name, just skip
                        continue;
                    }
                } else {
                    // Non-rune store reference in module context
                    // For .svelte.js module files, don't error here - let
                    // check_module_store_subscriptions() handle it with the correct
                    // store_invalid_subscription_module error code.
                    // For <script module> in .svelte files, error with store_invalid_subscription.
                    if !is_module_file {
                        return Err(errors::store_invalid_subscription());
                    }
                }
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
            let new_binding = Binding::with_declaration_kind(
                ref_name.clone(),
                BindingKind::StoreSub,
                DeclarationKind::Synthetic,
                0, // Root scope
            );
            let new_binding_idx = analysis.root.push_binding(new_binding);
            analysis
                .root
                .scope
                .declarations
                .insert(ref_name.clone(), new_binding_idx);
            // Also add to all_scopes[0] so get_binding() can find it via scope chain traversal.
            // self.scope is a clone of all_scopes[0], so we need to keep both in sync.
            if let Some(root_scope) = analysis.root.all_scopes.first_mut() {
                root_scope
                    .declarations
                    .insert(ref_name.clone(), new_binding_idx);
            }
        } else if options_runes != Some(false) {
            // When options.runes is not explicitly false (i.e., undefined/auto or true),
            // if no binding exists for a lowercase $xxx name, it's an invalid global reference.
            // This matches Svelte's behavior: `if (options.runes !== false) { ... }`
            // Corresponds to Svelte's L398-400 in 2-analyze/index.js
            if !store_name.is_empty() && store_name.chars().next().is_some_and(|c| c.is_lowercase())
            {
                // Before erroring, check whether `$name` is itself a real declared
                // binding — e.g. a destructured callback parameter
                // `derived([box_d], ([$box]) => $box.width)`, where `$box` is the
                // array-pattern param, not a store ref. The lexical `declared`
                // scan in `collect_dollar_identifiers_*` only recognises `($x)` /
                // `let $x` forms and misses array/object destructuring, so it
                // collected `$box` as a ref. Upstream resolves it through the scope
                // chain to the local binding; mirror that here. This guard lives at
                // the error path (not the loop top) so a genuine store whose name
                // also appears as a nested callback param — e.g. `page` used both as
                // `$page` in the template and as `($page) => …` in `.subscribe()` —
                // still creates its StoreSub (it never reaches this branch because
                // the unprefixed `page` binding exists).
                if analysis.root.bindings.iter().any(|b| {
                    &b.name == ref_name && b.declaration_kind != DeclarationKind::Synthetic
                }) {
                    continue;
                }
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
    is_typescript: bool,
) {
    let start = script.content.start().unwrap_or(0) as usize;
    let end = script.content.end().unwrap_or(0) as usize;

    if end <= start || end > source.len() {
        return;
    }

    let content = &source[start..end];

    // For TypeScript scripts, blank type-only syntax (interfaces, type aliases,
    // annotations) with spaces before the lexical scan: a type reference like
    // `let foo: $$Props['foo']` is NOT a JS variable reference in upstream's
    // scope analysis, so it must not produce a `$$Props` store ref (which would
    // trigger `global_reference_invalid`). Blanking preserves byte positions.
    if is_typescript {
        let blanked = super::types::blank_typescript(content);
        collect_dollar_identifiers_from_js_with_context(&blanked, start, refs, in_module);
        return;
    }

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
/// Char-index range `[start, end)` of an arrow body starting at char `from`
/// (the position just past `=>`). Handles both `{ … }` block bodies and
/// expression bodies, stopping at the first top-level `,` / `;` or closing
/// `)`/`]`/`}` (the delimiter that ends the arrow within its surrounding call).
fn arrow_body_range(chars: &[char], from: usize) -> (usize, usize) {
    let len = chars.len();
    let mut s = from;
    while s < len && (chars[s] == ' ' || chars[s] == '\t' || chars[s] == '\n' || chars[s] == '\r') {
        s += 1;
    }
    if s >= len {
        return (from, len);
    }
    let mut depth = 0i32;
    let mut m = s;
    while m < len {
        match chars[m] {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' if depth == 0 => break,
            ')' | ']' | '}' => depth -= 1,
            ',' | ';' if depth == 0 => break,
            _ => {}
        }
        m += 1;
    }
    (s, m)
}

/// If the `$xxx` ident at `[ident_start, ident_end)` is a function/arrow
/// parameter (including inside array/object destructuring), return the char-index
/// range `[start, end)` of that arrow's BODY — the lexical scope in which the
/// param shadows. Returns `None` otherwise. This is the scope-aware successor to
/// `is_dollar_ident_parameter`: a param only suppresses references inside its own
/// body, not globally.
fn dollar_param_body_range(
    chars: &[char],
    ident_start: usize,
    ident_end: usize,
) -> Option<(usize, usize)> {
    let len = chars.len();

    // Skip whitespace after the ident.
    let mut j = ident_end;
    while j < len && (chars[j] == ' ' || chars[j] == '\t') {
        j += 1;
    }

    // Case 1: `$x => …`
    if j + 1 < len && chars[j] == '=' && chars[j + 1] == '>' {
        return Some(arrow_body_range(chars, j + 2));
    }

    // Case 2: parenthesized / destructured param — `($x)`, `(.., $x, ..)`,
    // `([.., $x, ..]) =>`, `({ $x }) =>`. Preceded by one of `( , [ {`, followed
    // by one of `) , ] }`, and the enclosing `(...)` is followed by `=>`.
    if ident_start > 0 {
        let mut k = ident_start as isize - 1;
        while k >= 0 && (chars[k as usize] == ' ' || chars[k as usize] == '\t') {
            k -= 1;
        }
        let preceded_ok = k >= 0 && matches!(chars[k as usize], '(' | ',' | '[' | '{');
        let followed_ok = j < len && matches!(chars[j], ')' | ',' | ']' | '}');
        if preceded_ok && followed_ok {
            // Walk forward to the param-list closing `)`. Only `(`/`)` move the
            // param-list paren depth (the destructure `[`/`{` don't).
            let mut paren_depth = 0i32;
            let mut m = j;
            while m < len {
                match chars[m] {
                    '(' => paren_depth += 1,
                    ')' => {
                        if paren_depth == 0 {
                            let mut n = m + 1;
                            while n < len && (chars[n] == ' ' || chars[n] == '\t') {
                                n += 1;
                            }
                            if n + 1 < len && chars[n] == '=' && chars[n + 1] == '>' {
                                return Some(arrow_body_range(chars, n + 2));
                            }
                            return None;
                        }
                        paren_depth -= 1;
                    }
                    _ => {}
                }
                m += 1;
            }
        }
    }
    None
}

/// Check if a `$xxx` identifier at `ident_end` is being used as an object property key.
///
/// Returns true if `$xxx` is followed (ignoring whitespace) by `:` but NOT `::`.
/// This indicates it's being used as a property key in an object literal like
/// `{ $userName4: 'value' }` rather than as a store subscription reference.
///
/// A ternary consequent (`cond ? $x : y`) is also `$x` followed by `:`, but `$x`
/// there is a real reference, not a property key. Such a `$x` is preceded
/// (ignoring whitespace) by `?`, which never precedes a property key in a runtime
/// object literal, so we exclude it (issue #1229).
fn is_dollar_ident_object_property_key(
    chars: &[char],
    ident_start: usize,
    ident_end: usize,
) -> bool {
    let len = chars.len();
    // Skip whitespace after the identifier
    let mut j = ident_end;
    while j < len && (chars[j] == ' ' || chars[j] == '\t') {
        j += 1;
    }
    // Check for `:` not followed by another `:`
    if j < len && chars[j] == ':' {
        // Make sure it's not `::` and not `:`  followed by nothing
        let next = if j + 1 < len { chars[j + 1] } else { '\0' };
        if next == ':' {
            return false;
        }
        // Exclude a ternary consequent: `cond ? $x : y`. Walk back over
        // whitespace (incl. newlines, for multi-line ternaries) from the
        // identifier; a leading `?` means this is the `then` branch of a
        // conditional expression, not a property key.
        let mut k = ident_start as isize - 1;
        while k >= 0 && chars[k as usize].is_whitespace() {
            k -= 1;
        }
        if k >= 0 && chars[k as usize] == '?' {
            return false;
        }
        return true;
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

/// Check if a `$$xxx` identifier is used in a TypeScript type declaration context
/// (e.g., `type $$Props = ...` or `interface $$Props { ... }`).
/// These are TypeScript-only constructs that should not be treated as store references.
fn is_dollar_ident_type_declaration(chars: &[char], ident_start: usize) -> bool {
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
    let pos = k as usize;
    // Check for `type` keyword ending at position k
    if pos >= 3 && &chars[pos - 3..=pos].iter().collect::<String>() == "type" {
        let before = if pos >= 4 { chars[pos - 4] } else { ' ' };
        if !before.is_alphanumeric() && before != '_' && before != '$' {
            return true;
        }
    }
    // Check for `interface` keyword ending at position k
    if pos >= 8 && &chars[pos - 8..=pos].iter().collect::<String>() == "interface" {
        let before = if pos >= 9 { chars[pos - 9] } else { ' ' };
        if !before.is_alphanumeric() && before != '_' && before != '$' {
            return true;
        }
    }
    false
}

/// Collect $xxx identifiers from a JavaScript string with context.
///
/// Two passes: the first records every `$name` that is *declared* locally
/// (function parameter, `let/const/var`), the second collects references
/// while skipping names from that declared set. Mirrors upstream's
/// scope-accurate behaviour where e.g. `page.subscribe(($page) => $page.url)`
/// resolves `$page` to the callback param, never reaching module scope —
/// so it is not a store subscription (`analyze_module` only walks
/// `scope.references`, i.e. unresolved module-level references).
fn collect_dollar_identifiers_from_js_with_context(
    js: &str,
    base_offset: usize,
    refs: &mut Vec<StoreRef>,
    in_module: bool,
) {
    // Scope-ranged declarations: `(name, scope_start, scope_end)` in char-index
    // space. A param `$x` only suppresses references inside its own arrow body
    // `[start, end)`; a `let/const/var $x` declaration spans the whole script.
    let mut declared: Vec<(String, usize, usize)> = Vec::new();
    collect_dollar_identifiers_pass(js, base_offset, refs, in_module, true, &mut declared);
    collect_dollar_identifiers_pass(js, base_offset, refs, in_module, false, &mut declared);
}

/// One scan over `js`. With `collect_declared` set, only fills `declared`
/// with parameter/variable-declaration `$names`; otherwise pushes refs,
/// skipping declared names.
fn collect_dollar_identifiers_pass(
    js: &str,
    base_offset: usize,
    refs: &mut Vec<StoreRef>,
    in_module: bool,
    collect_declared: bool,
    declared: &mut Vec<(String, usize, usize)>,
) {
    let chars: Vec<char> = js.chars().collect();
    // Byte offset of each character, so a `StoreRef.position` (consumed
    // downstream as a byte index into the source) stays correct when multi-byte
    // characters precede the reference (M-005).
    let char_byte_offsets: Vec<usize> = js.char_indices().map(|(b, _)| b).collect();
    let len = chars.len();
    let mut i = 0;
    let mut in_string: Option<char> = None; // track if inside a string literal
    let mut in_line_comment = false; // track // comments
    let mut in_block_comment = false; // track /* */ comments
    // Stack of template literal nesting levels. For each active template literal,
    // we track the brace depth at which the template literal was entered. A `${`
    // inside a template literal starts a JS expression context where we should
    // resume scanning for identifiers; when the matching `}` is reached, we go
    // back into the template literal.
    // Entry in `template_stack` is the brace depth at which the template literal
    // started; when we see `${`, we push the current brace depth; when we see `}`
    // and brace depth matches, we pop back into template literal mode.
    let mut template_stack: Vec<usize> = Vec::new();
    let mut brace_depth: usize = 0;

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
                i += 1;
                continue;
            } else if quote == '`' && c == '$' && i + 1 < len && chars[i + 1] == '{' {
                // Enter interpolation expression context — push current brace depth
                // and exit template literal string mode.
                template_stack.push(brace_depth);
                brace_depth += 1;
                in_string = None;
                i += 2;
                continue;
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

        // Track brace depth for template literal interpolations
        if c == '{' {
            brace_depth += 1;
            i += 1;
            continue;
        }
        if c == '}' {
            brace_depth = brace_depth.saturating_sub(1);
            // If we just closed a template interpolation, go back into template
            // literal string mode.
            if let Some(&enter_depth) = template_stack.last()
                && brace_depth == enter_depth
            {
                template_stack.pop();
                in_string = Some('`');
            }
            i += 1;
            continue;
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
            // Also skip $ preceded by '.' (member access like `obj.$set`) — but a `$`
            // preceded by the third dot of a spread (`...$store`) is a real reference,
            // not a member access, so only treat a *single* leading dot as member access.
            let prev_is_ident_char = if i > 0 {
                if is_identifier_char(chars[i - 1]) {
                    true
                } else if chars[i - 1] == '.' {
                    // `...$x` (spread) has a second dot immediately before; `obj.$x`
                    // (member access) does not. Skip only the member-access form.
                    !(i >= 2 && chars[i - 2] == '.')
                } else {
                    false
                }
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
                    let param_range = dollar_param_body_range(&chars, ident_start, i);
                    let is_var_decl = is_dollar_ident_variable_declaration(&chars, ident_start);
                    let is_declaration = param_range.is_some() || is_var_decl;
                    if collect_declared {
                        if let Some((bs, be)) = param_range {
                            // A param shadows only inside its own arrow body.
                            declared.push((ident, bs, be));
                        } else if is_var_decl {
                            // `let/const/var $x` is a real variable for the whole script.
                            declared.push((ident, 0, len));
                        }
                    } else if !is_declaration
                        // References to a locally-declared `$name` resolve to that
                        // binding upstream (never a store) — but ONLY within the
                        // declaring scope's char range (mirrors scope resolution).
                        && !declared
                            .iter()
                            .any(|(n, s, e)| n == &ident && ident_start >= *s && ident_start < *e)
                        && !is_dollar_ident_object_property_key(&chars, ident_start, i)
                        && !is_dollar_ident_type_declaration(&chars, ident_start)
                    {
                        refs.push(StoreRef {
                            name: ident,
                            position: base_offset
                                + char_byte_offsets
                                    .get(ident_start)
                                    .copied()
                                    .unwrap_or(js.len()),
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
        if (memchr::memmem::find(trimmed.as_bytes(), b"'svelte/store'").is_some()
            || memchr::memmem::find(trimmed.as_bytes(), b"\"svelte/store\"").is_some())
            && trimmed.contains(name)
        {
            return true;
        }
    }
    false
}

/// Collect $xxx identifiers from a template fragment.
fn collect_dollar_refs_from_fragment(fragment: &Fragment, source: &str, refs: &mut Vec<StoreRef>) {
    for node in &fragment.nodes {
        collect_dollar_refs_from_node(node, source, refs);
    }
}

/// Collect $xxx identifiers from a template node.
fn collect_dollar_refs_from_node(node: &TemplateNode, source: &str, refs: &mut Vec<StoreRef>) {
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
        TemplateNode::DeclarationTag(tag) => {
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
        TemplateNode::SvelteBoundary(boundary) => {
            collect_dollar_refs_from_attributes(&boundary.attributes, source, refs);
            collect_dollar_refs_from_fragment(&boundary.fragment, source, refs);
        }
        TemplateNode::SvelteOptions(_)
        | TemplateNode::Text(_)
        | TemplateNode::Comment(_)
        | TemplateNode::AttachTag(_) => {}
    }
}

/// Collect $xxx identifiers from an element.
fn collect_dollar_refs_from_element(
    element: &RegularElement,
    source: &str,
    refs: &mut Vec<StoreRef>,
) {
    collect_dollar_refs_from_attributes(&element.attributes, source, refs);
    collect_dollar_refs_from_fragment(&element.fragment, source, refs);
}

/// Collect $xxx identifiers from attributes.
fn collect_dollar_refs_from_attributes(
    attributes: &[Attribute],
    source: &str,
    refs: &mut Vec<StoreRef>,
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
                        refs.push(StoreRef {
                            name: store_name.to_string(),
                            position: use_dir.start as usize,
                            in_module: false,
                        });
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
    refs: &mut Vec<StoreRef>,
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
            collect_dollar_identifiers_from_js_with_context(
                &source[start..end],
                start,
                refs,
                false,
            );
        }
    }
}

/// Collect $xxx identifiers from an if block.
fn collect_dollar_refs_from_if_block(block: &IfBlock, source: &str, refs: &mut Vec<StoreRef>) {
    collect_dollar_refs_from_expression(&block.test, source, refs);
    collect_dollar_refs_from_fragment(&block.consequent, source, refs);
    if let Some(ref alternate) = block.alternate {
        collect_dollar_refs_from_fragment(alternate, source, refs);
    }
}

/// Collect $xxx identifiers from an each block.
fn collect_dollar_refs_from_each_block(block: &EachBlock, source: &str, refs: &mut Vec<StoreRef>) {
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
    refs: &mut Vec<StoreRef>,
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
fn collect_dollar_refs_from_key_block(block: &KeyBlock, source: &str, refs: &mut Vec<StoreRef>) {
    collect_dollar_refs_from_expression(&block.expression, source, refs);
    collect_dollar_refs_from_fragment(&block.fragment, source, refs);
}

/// Collect $xxx identifiers from a snippet block.
fn collect_dollar_refs_from_snippet_block(
    block: &SnippetBlock,
    source: &str,
    refs: &mut Vec<StoreRef>,
) {
    collect_dollar_refs_from_fragment(&block.body, source, refs);
}

#[cfg(test)]
mod tests {
    use super::*;

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
        use crate::ast::arena::{clear_serialize_arena, set_serialize_arena};
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
        let mut ast = parse(source, parse_opts).unwrap();
        let options = CompileOptions::default();
        // SAFETY: `ast` (and thus `ast.arena`) outlives the `analyze_component`
        // call; `clear_serialize_arena()` runs before `ast` is dropped, so the
        // installed pointer never dangles.
        unsafe { set_serialize_arena(&ast.arena as *const _) };
        let analysis = analyze_component(&mut ast, source, &options).unwrap();
        clear_serialize_arena();

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
        let mut ast2 = parse(source2, parse_opts).unwrap();
        // SAFETY: `ast2` (and thus `ast2.arena`) outlives the `analyze_component`
        // call; `clear_serialize_arena()` runs before `ast2` is dropped, so the
        // installed pointer never dangles.
        unsafe { set_serialize_arena(&ast2.arena as *const _) };
        let analysis2 = analyze_component(&mut ast2, source2, &options).unwrap();
        clear_serialize_arena();

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
        // SAFETY: `ast3` (and thus `ast3.arena`) outlives the `analyze_component`
        // call; `clear_serialize_arena()` runs before `ast3` is dropped, so the
        // installed pointer never dangles.
        unsafe { set_serialize_arena(&ast3.arena as *const _) };
        let analysis3 = analyze_component(&mut ast3, source3, &options).unwrap();
        clear_serialize_arena();

        // Should have a StoreSub binding for $items
        let has_items_store = analysis3
            .root
            .bindings
            .iter()
            .any(|b| b.name == "$items" && matches!(b.kind, BindingKind::StoreSub));
        assert!(has_items_store, "Should have a StoreSub binding for $items");
    }

    /// Collect the `StoreSub` binding names in declaration order — this is the
    /// order the client/server codegen emits the `const $x = () => $.store_get(…)`
    /// getters, so it must match the official compiler's first-reference order.
    fn store_sub_order(source: &str) -> Vec<String> {
        use crate::ast::arena::{clear_serialize_arena, set_serialize_arena};
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase1_parse::{ParseOptions, parse};
        use crate::compiler::phases::phase2_analyze::analyze_component;

        let mut ast = parse(source, ParseOptions::default()).unwrap();
        let options = CompileOptions::default();
        // SAFETY: `ast` outlives the analyze call; `clear_serialize_arena()` runs
        // before `ast` is dropped, so the installed pointer never dangles.
        unsafe { set_serialize_arena(&ast.arena as *const _) };
        let analysis = analyze_component(&mut ast, source, &options).unwrap();
        clear_serialize_arena();
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::StoreSub))
            .map(|b| b.name.to_string())
            .collect()
    }

    /// Issue #1229: a store referenced ONLY through a spread (`...$store`) must
    /// still be detected. The `$` is preceded by the third `.` of `...`, which the
    /// member-access guard previously mistook for `obj.$store` and skipped.
    #[test]
    fn test_spread_store_subscription_detected() {
        let source = r#"<script>
    import { getContext } from 'svelte';
    const { xRange } = getContext('X');
    let left = $derived(Math.max(...$xRange));
</script>
<p>{left}</p>
"#;
        assert!(
            store_sub_order(source).contains(&"$xRange".to_string()),
            "spread `...$xRange` should be detected as a store subscription"
        );
    }

    /// Issue #1229: a store in the consequent of a ternary (`cond ? $store : y`)
    /// must be detected. `$store :` previously looked like an object property key
    /// (`{ $store: … }`) to the heuristic and was dropped.
    #[test]
    fn test_ternary_consequent_store_subscription_detected() {
        let source = r#"<script>
    import { getContext } from 'svelte';
    const { xGet, yGet } = getContext('X');
    let g = $derived(true ? $xGet : $yGet);
</script>
<p>{g}</p>
"#;
        let order = store_sub_order(source);
        assert!(
            order.contains(&"$xGet".to_string()),
            "ternary consequent `? $xGet :` should be detected: got {order:?}"
        );
        assert!(order.contains(&"$yGet".to_string()));
    }

    /// Issue #1229: store getters must be emitted in first-reference (AST
    /// traversal) order. A substring `source.find` previously placed `$x` at the
    /// offset of `$xGet` and `$y` inside `$yGet`, reordering the getters.
    #[test]
    fn test_store_getter_first_reference_order() {
        let source = r#"<script>
    import { getContext } from 'svelte';
    const { x, y, xGet, yGet } = getContext('X');
    let a = $derived($xGet + $yGet);
</script>
<g>
    {#each [1] as d}
        {@const c = $y}
        <rect data-range={$x}></rect>
    {/each}
</g>
"#;
        // Script deriveds reference $xGet then $yGet; the template then references
        // $y (in the @const) before $x (in the attribute). The buggy substring
        // sort emitted $x/$y at the $xGet/$yGet offsets, ahead of their real use.
        assert_eq!(
            store_sub_order(source),
            vec![
                "$xGet".to_string(),
                "$yGet".to_string(),
                "$y".to_string(),
                "$x".to_string(),
            ],
        );
    }

    /// Regression test for #1225: a function declaration in
    /// `<script context="module">` pushes its own function scope, which shifts
    /// the instance scope index past 1. The scoped-subscription guard must
    /// compare against the real `instance_scope_index` (mirroring upstream's
    /// `owner !== instance.scope` check), not a hardcoded `1`, otherwise an
    /// instance-scope store referenced inside a template arrow function is
    /// wrongly rejected with `store_invalid_scoped_subscription`.
    #[test]
    fn test_module_function_does_not_cause_false_scoped_subscription() {
        use crate::ast::arena::{clear_serialize_arena, set_serialize_arena};
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase1_parse::{ParseOptions, parse};
        use crate::compiler::phases::phase2_analyze::analyze_component;

        let options = CompileOptions::default();

        let analyze = |source: &str| {
            let mut ast = parse(source, ParseOptions::default()).unwrap();
            // SAFETY: `ast` (and thus `ast.arena`) outlives the
            // `analyze_component` call; `clear_serialize_arena()` runs before
            // `ast` is dropped, so the installed pointer never dangles.
            unsafe { set_serialize_arena(&ast.arena as *const _) };
            let result = analyze_component(&mut ast, source, &options).map(|_| ());
            clear_serialize_arena();
            result
        };

        // Valid: the module script declares a function (which shifts the
        // instance scope index), and `$opts` (an instance-scope import) is
        // referenced inside a template arrow. Official Svelte accepts this.
        let valid = r#"<script context="module">
    export function f() {}
</script>
<script>
    import { opts } from './store';
</script>
<button on:click={() => ($opts = false)}>x</button>
"#;
        assert!(
            analyze(valid).is_ok(),
            "module-script function must not trigger a false-positive store_invalid_scoped_subscription"
        );

        // Still invalid: an arrow PARAMETER shadows the store, so the `$store`
        // reference is a genuinely scoped subscription — must keep erroring even
        // when a module-script function shifts the instance scope index.
        let invalid = r#"<script context="module">
    export function g() {}
</script>
<script>
    import { writable } from 'svelte/store';
    const store = writable();
</script>
<button on:click={(store) => { $store = Math.random(); }} />
"#;
        assert!(
            analyze(invalid).is_err(),
            "a store shadowed by an arrow parameter must still error even with a module-script function"
        );
    }
}
