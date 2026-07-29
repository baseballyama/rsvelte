//! Script processing for svelte2tsx.
//!
//! Handles `<script>` and `<script context="module">` blocks in Svelte components.
//! Extracts exported names, component events, and prop declarations to generate
//! proper TypeScript type information.
//!
//! Script AST is parsed once with OXC and retained across every processing pass.

mod ast_utils;
mod component_events;
mod export_decl;
mod exported_names;
mod hoistable_types;
mod parse;
mod props_rune;
mod reactive;
mod runes;
mod stores;
#[cfg(test)]
mod test_support;
mod type_assertion;

use std::collections::{HashMap, HashSet};

use oxc_ast::ast as oxc;
use oxc_span::GetSpan;

use crate::ast::template::Script;

use super::magic_string::MagicString;
use super::svelte2tsx::slice_src;

pub use component_events::ComponentEvents;
pub use exported_names::{ExportedNameInfo, ExportedNames};
pub use stores::collect_module_import_store_declarations;

use ast_utils::{
    binding_pattern_simple_name, collect_top_level_declared_names, declarator_has_boolean_init,
    extract_all_names_from_binding_pattern,
};
use component_events::detect_create_event_dispatcher;
use export_decl::{handle_export_named_decl, leading_jsdoc_comment};
use exported_names::PossibleExport;
use hoistable_types::{
    HoistCandidate, hoist_dollar_generic_referenced_types, is_ident_char_for_str,
    is_special_type_name, resolve_hoistable_type_decls, rewrite_interface_to_type_dts,
};
use parse::with_parsed_script;
pub(crate) use parse::{ParsedScript, ParsedScripts};
use props_rune::{
    PropsRuneInfo, apply_props_typedef, collect_props_rune_info, detect_props_rune_oxc,
};
use reactive::handle_reactive_statement;
use runes::{
    detect_rune_in_class_body, detect_rune_in_expr, detect_rune_in_nested_body, detect_runes_call,
    detect_runes_expr_stmt, scope_with_params,
};
use stores::{
    collect_loose_dollar_names_from_script, inject_store_subscriptions_vars_only_with_program,
    inject_store_subscriptions_with_program,
};
use type_assertion::{disambiguate_arrow_type_params, rewrite_type_assertions_with_program};

/// Classify a Svelte component basename for SvelteKit autotype injection.
///
/// Returns:
/// - `Some(true)` if the file is a SvelteKit `+layout.svelte` (uses
///   `LayoutData` / `LayoutProps`).
/// - `Some(false)` if it's `+page.svelte` (uses `PageData` / `ActionData` /
///   `PageProps`).
/// - `None` otherwise.
pub fn classify_kit_route_file(basename: &str) -> Option<bool> {
    // Strip `@anchor` then strip extension. `kitPageFiles` are:
    // `+page`, `+layout`, `+page.server`, `+layout.server`, `+server`.
    // Only `+page` and `+layout` produce `.svelte` route files in practice.
    let trimmed = if let Some(at_pos) = basename.find('@') {
        &basename[..at_pos]
    } else if let Some(dot_pos) = basename.rfind('.') {
        &basename[..dot_pos]
    } else {
        basename
    };
    match trimmed {
        "+page" => Some(false),
        "+layout" => Some(true),
        _ => None,
    }
}

/// Process an instance script block (`<script>`).
///
/// Extracts:
/// - Exported variables (props in Svelte 4, or named exports)
/// - `$props()` usage (Svelte 5 runes)
/// - Event dispatcher declarations
/// - Store subscriptions
pub fn process_instance_script(
    script: &Script,
    parsed: &ParsedScript<'_>,
    module_program: Option<&oxc::Program<'_>>,
    source: &str,
    str: &mut MagicString,
    exported_names: &mut ExportedNames,
    _events: &mut ComponentEvents,
    is_ts: bool,
    basename: &str,
    emit_jsdoc: bool,
    is_dts_mode: bool,
    script_generic_names: &HashSet<String>,
) {
    let offset = script.content_offset;
    with_parsed_script(parsed, |program, raw_content| {
        // Pass 1: collect top-level declared names and possible exports
        let mut possible_exports: HashMap<String, PossibleExport> = HashMap::new();
        // Pre-populate with ALL top-level declared names so rune-vs-store
        // disambiguation (`$state` rune vs `$`-prefixed store of a declared
        // `state`) sees the complete scope — incl. a name declared by the very
        // statement whose initializer we're checking. See
        // collect_top_level_declared_names.
        let declared_names: HashSet<String> = collect_top_level_declared_names(&program.body);
        // Top-level `type` / `interface` declarations that may be hoistable
        // out of `function $$render()`. Resolved (with `instance_value_names`
        // and `module_*_names`) into `hoistable_type_ranges` after Pass 1.
        let mut candidates: Vec<HoistCandidate> = Vec::new();

        // Also collect $props() rune info for typedef generation
        // Usually one `$props()`; a duplicate `$props()` (a compiler error, but
        // svelte2tsx still compiles it) gets the inline `$$ComponentProps`
        // typedef on EACH destructure, so collect all of them.
        let mut props_rune_infos: Vec<PropsRuneInfo> = Vec::new();

        for (stmt_index, stmt) in program.body.iter().enumerate() {
            match stmt {
                oxc::Statement::VariableDeclaration(var_decl) => {
                    // Mirror official `isLet = flags === NodeFlags.Let`: only a
                    // `let` binding is a reactive prop. `var`/`const` are exports
                    // (`export var x` / `export { v }` where `v` is var/const go
                    // into the `exports:` return, not `props:`).
                    let is_let = matches!(var_decl.kind, oxc::VariableDeclarationKind::Let);
                    for declarator in var_decl.declarations.iter() {
                        detect_runes_call(declarator, exported_names, &declared_names);
                        detect_props_rune_oxc(declarator, exported_names, raw_content);
                        // Detect createEventDispatcher<Type>() calls
                        detect_create_event_dispatcher(declarator, raw_content, _events, offset);
                        // Collect $props() info for typedef generation (one per
                        // `$props()` destructure).
                        if let Some(info) = collect_props_rune_info(
                            var_decl,
                            declarator,
                            raw_content,
                            program,
                            stmt_index,
                        ) {
                            props_rune_infos.push(info);
                        }
                        if let oxc::BindingPattern::BindingIdentifier(id) = &declarator.id {
                            let name = id.name.to_string();
                            let ta_text = declarator.type_annotation.as_ref().and_then(|ta| {
                                let ts_type = &ta.type_annotation;
                                let start = ts_type.span().start as usize;
                                let end = ts_type.span().end as usize;
                                if start < end && end <= raw_content.len() {
                                    Some(raw_content[start..end].to_string())
                                } else {
                                    None
                                }
                            });
                            possible_exports.insert(
                                name,
                                PossibleExport {
                                    is_let,
                                    has_init: declarator.init.is_some(),
                                    has_type_annotation: declarator.type_annotation.is_some(),
                                    has_boolean_init: declarator_has_boolean_init(declarator),
                                    decl_end: declarator.span.end,
                                    type_annotation_text: ta_text,
                                    doc: leading_jsdoc_comment(
                                        raw_content,
                                        var_decl.span.start as usize,
                                    ),
                                },
                            );
                        } else {
                            // Destructured bindings (`let { a, c } = …`) are not a
                            // single simple name, but each name can still be
                            // re-exported via `export { a, c }`. Record them as
                            // possible exports so the specifier handler resolves
                            // the correct `is_let` (a `let` destructure → prop).
                            for name in extract_all_names_from_binding_pattern(&declarator.id) {
                                possible_exports.insert(
                                    name,
                                    PossibleExport {
                                        is_let,
                                        has_init: declarator.init.is_some(),
                                        has_type_annotation: false,
                                        has_boolean_init: false,
                                        decl_end: declarator.span.end,
                                        type_annotation_text: None,
                                        doc: None,
                                    },
                                );
                            }
                        }
                    }
                }
                oxc::Statement::ImportDeclaration(import) => {
                    if let Some(ref specifiers) = import.specifiers {
                        for spec in specifiers.iter() {
                            let name = match spec {
                                oxc::ImportDeclarationSpecifier::ImportDefaultSpecifier(s) => {
                                    s.local.name.to_string()
                                }
                                oxc::ImportDeclarationSpecifier::ImportNamespaceSpecifier(s) => {
                                    s.local.name.to_string()
                                }
                                oxc::ImportDeclarationSpecifier::ImportSpecifier(s) => {
                                    s.local.name.to_string()
                                }
                            };
                            exported_names.instance_import_names.insert(name);
                        }
                    }
                }
                oxc::Statement::FunctionDeclaration(func) => {
                    // Detect rune calls nested inside the function body.
                    // The official svelte2tsx `checkGlobalsForRunes` walks the
                    // entire TypeScript AST (including function bodies) and flags
                    // any undeclared `$state`/`$derived`/`$effect` reference.
                    // Mirror that here by recursively scanning the body.
                    // Reference: ExportedNames.ts `checkGlobalsForRunes`.
                    if let Some(ref body) = func.body {
                        // Add the function's params to the scope so a rune name
                        // shadowed by a param (`function bar($derived){ … }`) is
                        // treated as that param, not a rune.
                        let scope = scope_with_params(&declared_names, &func.params);
                        if detect_rune_in_nested_body(&body.statements, &scope) {
                            exported_names.set_uses_runes(true);
                        }
                    }
                }
                oxc::Statement::ClassDeclaration(class) => {
                    // Detect rune calls nested inside class method bodies.
                    if class.body.body.iter().any(|member| match member {
                        oxc::ClassElement::MethodDefinition(method) => {
                            method.value.body.as_ref().is_some_and(|body| {
                                detect_rune_in_nested_body(&body.statements, &declared_names)
                            })
                        }
                        oxc::ClassElement::PropertyDefinition(prop) => prop
                            .value
                            .as_ref()
                            .is_some_and(|e| detect_rune_in_expr(e, &declared_names)),
                        _ => false,
                    }) {
                        exported_names.set_uses_runes(true);
                    }
                }
                oxc::Statement::ExportNamedDeclaration(export) => {
                    // Also check exports for declared names
                    if let Some(ref decl) = export.declaration {
                        match decl {
                            oxc::Declaration::VariableDeclaration(var_decl) => {
                                // Only `let` is a reactive prop; `var`/`const` are
                                // exports (mirror official isLet === NodeFlags.Let).
                                let is_let =
                                    matches!(var_decl.kind, oxc::VariableDeclarationKind::Let);
                                for declarator in var_decl.declarations.iter() {
                                    if let Some(name) = binding_pattern_simple_name(&declarator.id)
                                    {
                                        let ta_text =
                                            declarator.type_annotation.as_ref().and_then(|ta| {
                                                let ts_type = &ta.type_annotation;
                                                let start = ts_type.span().start as usize;
                                                let end = ts_type.span().end as usize;
                                                if start < end && end <= raw_content.len() {
                                                    Some(raw_content[start..end].to_string())
                                                } else {
                                                    None
                                                }
                                            });
                                        possible_exports.insert(
                                            name,
                                            PossibleExport {
                                                is_let,
                                                has_init: declarator.init.is_some(),
                                                has_type_annotation: declarator
                                                    .type_annotation
                                                    .is_some(),
                                                has_boolean_init: declarator_has_boolean_init(
                                                    declarator,
                                                ),
                                                decl_end: declarator.span.end,
                                                type_annotation_text: ta_text,
                                                doc: leading_jsdoc_comment(
                                                    raw_content,
                                                    var_decl.span.start as usize,
                                                ),
                                            },
                                        );
                                    }
                                }
                            }
                            oxc::Declaration::FunctionDeclaration(func) => {
                                // Runes inside an exported function body still
                                // put the component in runes mode.
                                if let Some(ref body) = func.body {
                                    let scope = scope_with_params(&declared_names, &func.params);
                                    if detect_rune_in_nested_body(&body.statements, &scope) {
                                        exported_names.set_uses_runes(true);
                                    }
                                }
                            }
                            oxc::Declaration::ClassDeclaration(class) => {
                                // `export class C { x = $state(0) }` → runes mode.
                                if detect_rune_in_class_body(class, &declared_names) {
                                    exported_names.set_uses_runes(true);
                                }
                            }
                            // `export type X = ...` / `export interface X { ... }`.
                            //
                            // In TypeScript these are still TypeAliasDeclaration /
                            // InterfaceDeclaration nodes (the `export` is just a
                            // modifier), so official svelte2tsx
                            // (`HoistableInterfaces.analyzeInstanceScriptNode`)
                            // treats them exactly like their non-exported forms —
                            // they become hoist candidates and `instance_type_names`
                            // entries. OXC instead wraps them in an
                            // `ExportNamedDeclaration`, so we have to unwrap and
                            // register the inner declaration here. Without this an
                            // exported type that another (hoisted) interface depends
                            // on stays trapped inside `$$render()` and goes out of
                            // scope (#963).
                            //
                            // The candidate span starts at the `export` keyword so
                            // the modifier travels with the declaration when it is
                            // moved above `$$render()`, preserving the component's
                            // public type surface.
                            oxc::Declaration::TSTypeAliasDeclaration(type_alias) => {
                                let name = type_alias.id.name.to_string();
                                exported_names.instance_type_names.insert(name.clone());
                                if !is_special_type_name(&name) {
                                    candidates.push(HoistCandidate {
                                        name,
                                        rel_start: export.span.start,
                                        rel_end: type_alias.span.end,
                                    });
                                }
                            }
                            oxc::Declaration::TSInterfaceDeclaration(iface) => {
                                let name = iface.id.name.to_string();
                                exported_names.instance_type_names.insert(name.clone());
                                if !is_special_type_name(&name) {
                                    candidates.push(HoistCandidate {
                                        name,
                                        rel_start: export.span.start,
                                        rel_end: iface.span.end,
                                    });
                                }
                                if is_dts_mode {
                                    rewrite_interface_to_type_dts(iface, raw_content, offset, str);
                                }
                            }
                            _ => {}
                        }
                    }
                }
                // Detect $$Slots and $$Events type/interface declarations
                oxc::Statement::TSInterfaceDeclaration(iface) => {
                    let name = iface.id.name.to_string();
                    if name == "$$Slots" {
                        exported_names.has_slots_type = true;
                    } else if name == "$$Events" {
                        exported_names.has_events_type = true;
                        if exported_names.events_type_decl_pos.is_none() {
                            exported_names.events_type_decl_pos = Some(offset + iface.span.start);
                        }
                    } else if name == "$$Props" {
                        exported_names.uses_dollar_props_type = true;
                    }
                    exported_names.instance_type_names.insert(name.clone());
                    if !is_special_type_name(&name) {
                        candidates.push(HoistCandidate {
                            name,
                            rel_start: iface.span.start,
                            rel_end: iface.span.end,
                        });
                    }

                    // dts mode: rewrite `interface X { ... }` (and any `extends`
                    // clauses) into `type X = ... & { ... }` because indirectly
                    // using interfaces inside the return type of a function
                    // breaks .d.ts generation. Mirrors
                    // `processInstanceScriptContent.ts::transformInterfacesToTypes`.
                    if is_dts_mode {
                        rewrite_interface_to_type_dts(iface, raw_content, offset, str);
                    }
                }
                oxc::Statement::TSTypeAliasDeclaration(type_alias) => {
                    let name = type_alias.id.name.to_string();
                    if name == "$$Slots" {
                        exported_names.has_slots_type = true;
                    } else if name == "$$Events" {
                        exported_names.has_events_type = true;
                        if exported_names.events_type_decl_pos.is_none() {
                            exported_names.events_type_decl_pos =
                                Some(offset + type_alias.span.start);
                        }
                    } else if name == "$$Props" {
                        exported_names.uses_dollar_props_type = true;
                    }
                    exported_names.instance_type_names.insert(name.clone());
                    if !is_special_type_name(&name) {
                        candidates.push(HoistCandidate {
                            name,
                            rel_start: type_alias.span.start,
                            rel_end: type_alias.span.end,
                        });
                    }
                    // Detect `type X = $$Generic;` or `type X = $$Generic<constraint>;`
                    let type_text = &raw_content[type_alias.type_annotation.span().start as usize
                        ..type_alias.type_annotation.span().end as usize];
                    if type_text == "$$Generic" || type_text.starts_with("$$Generic<") {
                        let name = type_alias.id.name.to_string();
                        let constraint = if type_text.starts_with("$$Generic<") {
                            // Extract the constraint from $$Generic<constraint>
                            let inner = &type_text[10..type_text.len() - 1]; // skip "$$Generic<" and ">"
                            Some(inner.to_string())
                        } else {
                            None
                        };
                        exported_names.dollar_generics.push((name, constraint));
                        // Record the position to blank out later
                        exported_names
                            .dollar_generic_positions
                            .push((type_alias.span.start, type_alias.span.end));
                    }
                }
                // Detect rune globals used as standalone expression statements,
                // e.g. `$effect(() => { ... })` or `$effect.pre(() => { ... })`.
                // These are missed by `detect_runes_call` which only visits
                // VariableDeclarator inits.
                // Reference: svelte2tsx ExportedNames.ts `hasRunesGlobals` check.
                oxc::Statement::ExpressionStatement(es) => {
                    detect_runes_expr_stmt(es, exported_names, &declared_names);
                }
                _ => {}
            }
        }

        // Also collect names declared by reactive statements to avoid
        // treating previously-reactive-declared variables as undeclared.
        // This handles cases like `$: b = 7; $: c = b + 1;` where c is
        // new but b was declared by the first reactive statement.
        let mut reactive_declared_names: HashSet<String> = HashSet::new();

        // Pass 2: handle exports
        for stmt in program.body.iter() {
            if let oxc::Statement::ExportNamedDeclaration(export) = stmt {
                handle_export_named_decl(
                    export,
                    offset,
                    str,
                    exported_names,
                    true,
                    &possible_exports,
                    raw_content,
                    is_ts,
                    basename,
                    emit_jsdoc,
                );
            } else if let oxc::Statement::ExportDefaultDeclaration(export) = stmt {
                // Instance scripts can't have `export default` (svelte rejects
                // it). Official svelte2tsx blanks just the `export` keyword for a
                // default-exported FUNCTION or CLASS declaration, leaving
                // `default function …`/`default class …` (invalid TSX → oxfmt
                // skips → raw output). A default-exported EXPRESSION
                // (`export default 42`) is kept verbatim. Mirror that.
                let is_decl = matches!(
                    export.declaration,
                    oxc::ExportDefaultDeclarationKind::FunctionDeclaration(_)
                        | oxc::ExportDefaultDeclarationKind::ClassDeclaration(_)
                );
                if is_decl {
                    let start = export.span.start + offset;
                    str.overwrite(start, start + 6, "");
                }
            }
        }

        // Blank out $$Generic type alias declarations
        for &(start, end) in &exported_names.dollar_generic_positions {
            str.overwrite(start + offset, end + offset, "");
        }

        // Pass 2.5: Split multi-declarator let statements when variables are
        // exported via specifiers (e.g., `let a = 1, b;` with `export { a, b }`)
        for stmt in program.body.iter() {
            if let oxc::Statement::VariableDeclaration(var_decl) = stmt {
                let is_let = matches!(
                    var_decl.kind,
                    oxc::VariableDeclarationKind::Let | oxc::VariableDeclarationKind::Var
                );
                let num_declarators = var_decl.declarations.len();
                if is_let && num_declarators > 1 {
                    // Check if any declarator in this statement is exported
                    let any_exported = var_decl.declarations.iter().any(|d| {
                        if let Some(name) = binding_pattern_simple_name(&d.id) {
                            // Match through aliases: `export { v1 as a1 }` keys
                            // the entry by `a1`, so `has(v1)` is false — check
                            // the local name too.
                            exported_names.has(&name) || exported_names.has_local(&name)
                        } else {
                            false
                        }
                    });
                    if any_exported {
                        for decl_idx in 0..num_declarators - 1 {
                            let decl_end_rel = var_decl.declarations[decl_idx].span.end;
                            // Find the comma after the declarator end and overwrite just it
                            let comma_pos = raw_content[decl_end_rel as usize..]
                                .find(',')
                                .map(|p| decl_end_rel + p as u32)
                                .unwrap_or(decl_end_rel);
                            str.overwrite(comma_pos + offset, comma_pos + 1 + offset, ";let ");
                        }
                        // Mirror official `propTypeAssertToUserDefined`, which is
                        // invoked on the *whole* declaration list when any of its
                        // bindings is exported by reference and wraps EVERY
                        // widening-eligible declarator — including siblings that
                        // are not themselves exported. The exported declarators
                        // are already wrapped in the export-specifier handling
                        // (Case 2), so here we only cover the non-exported
                        // siblings to avoid double-wrapping.
                        for d in var_decl.declarations.iter() {
                            let Some(name) = binding_pattern_simple_name(&d.id) else {
                                continue;
                            };
                            if exported_names.has(&name) || exported_names.has_local(&name) {
                                continue;
                            }
                            // Match handleTypeAssertion's widening condition:
                            // no initializer, OR a boolean-literal initializer
                            // (TS narrows `let x = false` to `false`), OR a type
                            // annotation.
                            let widen = d.init.is_none()
                                || matches!(d.init, Some(oxc::Expression::BooleanLiteral(_)))
                                || d.type_annotation.is_some();
                            if widen {
                                let inject = format!(
                                    "/*\u{03A9}ignore_start\u{03A9}*/;{name} = __sveltets_2_any({name});/*\u{03A9}ignore_end\u{03A9}*/"
                                );
                                str.append_left(d.span.end + offset, &inject);
                            }
                        }
                    }
                }
            }
        }

        // Pass 3: handle reactive statements ($: ...)
        let content_start = script.content_offset as usize;
        let script_source = slice_src(source, script.start as usize, script.end as usize);
        let close_tag_offset = script_source
            .rfind("</script>")
            .or_else(|| script_source.rfind("</Script>"))
            .unwrap_or(script_source.len());
        let content_end = script.start as usize + close_tag_offset;
        let raw_content = &source[content_start..content_end];

        for stmt in program.body.iter() {
            if let oxc::Statement::LabeledStatement(labeled) = stmt
                && labeled.label.name == "$"
            {
                handle_reactive_statement(
                    labeled,
                    offset,
                    str,
                    raw_content,
                    &declared_names,
                    &mut reactive_declared_names,
                );
            }
        }

        // Snapshot instance-script value declarations so callers (in particular
        // the force-inside-render heuristic for `$$ComponentProps`) can detect
        // when the props type references an instance-scope binding.
        exported_names.instance_value_names = declared_names;

        // Collect loose `$name` references from the instance script WITHOUT the
        // rune-exclusion filter.  The official JS svelte2tsx's `is_rune` check is
        // broken at runtime (TypeScript parent pointers are not set) so ALL `$X`
        // identifiers — including `$props`, `$bindable`, `$state` etc. — end up in
        // `accessedStores`.  Their base names are then added to `disallowed_values`
        // via `addDisallowed(implicitStoreValues.getAccessedStores())`, which causes
        // snippets that reference `props` / `bindable` / etc. as plain identifiers
        // (e.g. from a nested `{#snippet child({ props })}`) to be treated as
        // non-hoistable.  Mirroring that behaviour here.
        for name in collect_loose_dollar_names_from_script(raw_content) {
            exported_names
                .instance_script_loose_dollar_names
                .insert(name);
        }

        // Unconditionally hoist instance-script type/interface declarations whose
        // names appear as `$$Generic<X>` constraints. Mirrors the JS reference's
        // `nodesToMove = interfacesAndTypes.getNodesWithNames(generics.getTypeReferences())`
        // path in `processInstanceScriptContent`, which moves these regardless of
        // whether the component uses the `$props()` rune.
        hoist_dollar_generic_referenced_types(&candidates, raw_content, offset, exported_names);

        // Resolve which instance-script type/interface declarations are
        // hoistable above `function $$render()`. Mirrors
        // `HoistableInterfaces.moveHoistableInterfaces` in the JS reference,
        // including the early-exit `if (!this.props_interface.name) return;`
        // — without a `$props()` typed annotation there's nothing for the
        // hoisted types to feed, so we leave them in place.
        if let Some(info) = props_rune_infos.first() {
            // Determine the props-interface for gating. Mirrors official
            // `HoistableInterfaces.analyze$propsRune` / `moveHoistableInterfaces`:
            // when the `$props()` annotation is a bare named reference
            // (`: Props`), that interface IS the props interface; otherwise the
            // synthetic `$$ComponentProps` (built from the inline annotation) is.
            // Either way, NOTHING is hoisted unless the props interface itself is
            // hoistable — see `resolve_hoistable_type_decls`.
            // Determine the effective type source: type-arg form takes priority over
            // annotation form (mirrors upstream `typeArguments?.[0] || node.type`).
            let effective_is_named_ref = if info.has_type_arg && !info.has_type_annotation {
                info.type_arg_is_named_ref
            } else {
                info.is_named_type_reference
            };
            let effective_type_text: Option<&str> =
                if info.has_type_arg && !info.has_type_annotation {
                    info.type_arg_text.as_deref()
                } else {
                    info.type_text.as_deref()
                };
            let effective_has_type = info.has_type_annotation || info.has_type_arg;

            let props_named_ref: Option<String> = if effective_is_named_ref {
                effective_type_text.map(|t| {
                    // `Props` or `Props<T>` → root name `Props`.
                    t.split(|ch: char| !is_ident_char_for_str(ch))
                        .find(|s| !s.is_empty())
                        .unwrap_or("")
                        .to_string()
                })
            } else {
                None
            };
            let props_inline_type: Option<&str> = if effective_is_named_ref || !effective_has_type {
                None
            } else {
                effective_type_text
            };
            resolve_hoistable_type_decls(
                &candidates,
                raw_content,
                offset,
                exported_names,
                script_generic_names,
                props_named_ref.as_deref(),
                props_inline_type,
            );
        }

        // Pass 4: Apply $props() $$ComponentProps typedef transformations. With a
        // duplicate `$props()` each destructure gets its own inline typedef
        // (matches official, which re-emits `@typedef … $$ComponentProps` per
        // call); the single-valued `ExportedNames` fields used by the return are
        // idempotent across calls.
        for info in &props_rune_infos {
            apply_props_typedef(
                info,
                offset,
                str,
                exported_names,
                raw_content,
                is_ts,
                basename,
            );
        }

        // Pass 5: store subscriptions. Reuses the already-parsed program
        // so we don't re-parse the instance script content with OXC.
        inject_store_subscriptions_with_program(program, module_program, offset, source, str);

        // Pass 6: disambiguate generic arrow type-parameter lists for the
        // `.tsx` overlay (`<T>` → `<T,>`) so they aren't misparsed as JSX.
        disambiguate_arrow_type_params(program, offset, raw_content, str);

        // Pass 7: rewrite TS angle-bracket type assertions (`<X>e` → `e as X`)
        // anywhere in the instance script — TSX cannot parse the `<X>e` form.
        // Mirrors official `handleTypeAssertion`, applied during the same walk.
        rewrite_type_assertions_with_program(program, offset as usize, str);
    });
}
/// Process a module script block (`<script context="module">`).
///
/// Module scripts contain top-level exports that are accessible from outside
/// the component. These exports are not props.
///
/// Also injects store subscription declarations for variables declared in the
/// module script that are accessed as stores (`$name`) elsewhere in the source.
///
/// # Arguments
///
/// * `script` - The parsed Script AST node
/// * `source` - The original source code
/// * `str` - The MagicString for source manipulation
/// * `exported_names` - Accumulator for exported names
pub fn process_module_script(
    script: &Script,
    parsed: &ParsedScript<'_>,
    source: &str,
    str: &mut MagicString,
    exported_names: &mut ExportedNames,
) {
    // Module script exports are kept as-is (with the export keyword).
    // They are not component props and do not go into the return statement.
    //
    // Previously the module script was parsed up to three times (var-only
    // store-subscription injection, type-assertion rewrite, name snapshot).
    // Parse once and share the program across all three passes.
    let offset = script.content_offset;
    with_parsed_script(parsed, |program, raw_content| {
        // Inject store subscriptions for module-level variable declarations
        // only. Import-based store subscriptions are NOT injected here
        // because they need to go inside the $$render function body.
        inject_store_subscriptions_vars_only_with_program(program, offset, source, str);

        // Rewrite TypeScript angle-bracket type assertions (`<X>e`) into
        // the `e as X` form. Inside the module script the rewrite is
        // required because the generated `.tsx` parses the module-script
        // body at top level, where `<X>e` would be lexed as JSX.
        rewrite_type_assertions_with_program(program, offset as usize, str);

        // Disambiguate generic arrow type-parameter lists (`<T>` → `<T,>`) so
        // the module-script body, parsed at the top level of the `.tsx`
        // overlay, doesn't lex a single-parameter arrow generic as JSX.
        disambiguate_arrow_type_params(program, offset, raw_content, str);

        // Snapshot top-level module-script names for the snippet hoist analysis.
        for stmt in program.body.iter() {
            match stmt {
                oxc::Statement::ImportDeclaration(import) => {
                    if let Some(ref specifiers) = import.specifiers {
                        for spec in specifiers.iter() {
                            let name = match spec {
                                oxc::ImportDeclarationSpecifier::ImportDefaultSpecifier(s) => {
                                    s.local.name.to_string()
                                }
                                oxc::ImportDeclarationSpecifier::ImportNamespaceSpecifier(s) => {
                                    s.local.name.to_string()
                                }
                                oxc::ImportDeclarationSpecifier::ImportSpecifier(s) => {
                                    s.local.name.to_string()
                                }
                            };
                            exported_names.module_import_names.insert(name.clone());
                            exported_names.module_value_names.insert(name);
                        }
                    }
                }
                oxc::Statement::VariableDeclaration(var_decl) => {
                    for declarator in var_decl.declarations.iter() {
                        for n in extract_all_names_from_binding_pattern(&declarator.id) {
                            exported_names.module_value_names.insert(n);
                        }
                    }
                }
                oxc::Statement::FunctionDeclaration(func) => {
                    if let Some(ref id) = func.id {
                        exported_names
                            .module_value_names
                            .insert(id.name.to_string());
                    }
                }
                oxc::Statement::ClassDeclaration(class) => {
                    if let Some(ref id) = class.id {
                        exported_names
                            .module_value_names
                            .insert(id.name.to_string());
                    }
                }
                oxc::Statement::ExportNamedDeclaration(export) => {
                    if let Some(ref decl) = export.declaration {
                        match decl {
                            oxc::Declaration::VariableDeclaration(var_decl) => {
                                for declarator in var_decl.declarations.iter() {
                                    for n in extract_all_names_from_binding_pattern(&declarator.id)
                                    {
                                        exported_names.module_value_names.insert(n);
                                    }
                                }
                            }
                            oxc::Declaration::FunctionDeclaration(func) => {
                                if let Some(ref id) = func.id {
                                    exported_names
                                        .module_value_names
                                        .insert(id.name.to_string());
                                }
                            }
                            oxc::Declaration::ClassDeclaration(class) => {
                                if let Some(ref id) = class.id {
                                    exported_names
                                        .module_value_names
                                        .insert(id.name.to_string());
                                }
                            }
                            oxc::Declaration::TSTypeAliasDeclaration(t) => {
                                exported_names
                                    .module_type_names
                                    .insert(t.id.name.to_string());
                            }
                            oxc::Declaration::TSInterfaceDeclaration(iface) => {
                                exported_names
                                    .module_type_names
                                    .insert(iface.id.name.to_string());
                            }
                            _ => {}
                        }
                    }
                }
                oxc::Statement::TSTypeAliasDeclaration(t) => {
                    exported_names
                        .module_type_names
                        .insert(t.id.name.to_string());
                }
                oxc::Statement::TSInterfaceDeclaration(iface) => {
                    exported_names
                        .module_type_names
                        .insert(iface.id.name.to_string());
                }
                // Module-level `namespace X { ... }` and `enum X { ... }`
                // contribute both a value and a type binding, so an
                // instance-script `interface X` would shadow the module
                // declaration once hoisted.
                oxc::Statement::TSModuleDeclaration(module_decl) => {
                    if let oxc_ast::ast::TSModuleDeclarationName::Identifier(id) = &module_decl.id {
                        exported_names
                            .module_value_names
                            .insert(id.name.to_string());
                        exported_names.module_type_names.insert(id.name.to_string());
                    }
                }
                oxc::Statement::TSEnumDeclaration(enum_decl) => {
                    exported_names
                        .module_value_names
                        .insert(enum_decl.id.name.to_string());
                    exported_names
                        .module_type_names
                        .insert(enum_decl.id.name.to_string());
                }
                _ => {}
            }
        }
    });
}

#[cfg(test)]
mod tests {
    use super::test_support::{run_svelte2tsx, run_svelte2tsx_ts};
    use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

    #[test]
    fn svelte2tsx_does_not_panic_on_cjk_jsdoc() {
        // End-to-end guard for #719: a `<script lang="ts">` whose JSDoc
        // comments contain CJK characters used to abort the whole svelte2tsx
        // run with a char-boundary panic during overlay generation.
        let source = "<script lang=\"ts\">\n\
            \u{20}\u{20}interface Props {\n\
            \u{20}\u{20}\u{20}\u{20}/** \u{30A2}\u{30D0}\u{30BF}\u{30FC}\u{306E}\u{30B3}\u{30F3}\u{30C6}\u{30F3}\u{30C4} */\n\
            \u{20}\u{20}\u{20}\u{20}content: 'image' | 'initial' | 'count';\n\
            \u{20}\u{20}\u{20}\u{20}/** \u{753B}\u{50CF}\u{306E}\u{30BD}\u{30FC}\u{30B9} (content='image' \u{306E}\u{5834}\u{5408}\u{306B}\u{5FC5}\u{9808}) */\n\
            \u{20}\u{20}\u{20}\u{20}imageSrc?: string;\n\
            \u{20}\u{20}}\n\
            \u{20}\u{20}const { content, imageSrc }: Props = $props();\n\
            </script>\n\
            <p>{content}{imageSrc}</p>\n";
        let out = svelte2tsx(source, Svelte2TsxOptions::default()).expect("svelte2tsx ok");
        // Smoke check: the prop identifiers survived into the overlay.
        assert!(out.code.contains("imageSrc"));
    }

    // -- Empty / no script --

    #[test]
    fn test_empty_script() {
        let source = "<script>\n</script>";
        let result = run_svelte2tsx(source);
        assert!(result.exported_names.is_empty());
    }

    #[test]
    fn test_no_script() {
        let source = "<h1>Hello</h1>";
        let result = run_svelte2tsx(source);
        assert!(result.exported_names.is_empty());
    }

    // -- Module script --

    #[test]
    fn test_module_script_export_const() {
        let source = "<script context=\"module\">\nexport const CONSTANT = 42;\n</script>";
        let result = run_svelte2tsx(source);
        assert!(!result.exported_names.has("CONSTANT"));
    }

    #[test]
    fn test_module_script_export_function() {
        let source = "<script context=\"module\">\nexport function helper() {}\n</script>";
        let result = run_svelte2tsx(source);
        assert!(!result.exported_names.has("helper"));
    }

    #[test]
    fn test_module_script_export_let_not_prop() {
        let source = "<script context=\"module\">\nexport let shared = 0;\n</script>";
        let result = run_svelte2tsx(source);
        assert!(!result.exported_names.has("shared"));
    }

    // -- Mixed instance and module scripts --

    #[test]
    fn test_both_scripts() {
        let source = "<script context=\"module\">\nexport const VERSION = \"1.0\";\n</script>\n\n<script>\nexport let name;\n</script>";
        let result = run_svelte2tsx(source);
        assert!(!result.exported_names.has("VERSION"));
        assert!(result.exported_names.has("name"));
        assert!(result.exported_names.get("name").unwrap().is_prop);
        assert_eq!(result.exported_names.get_prop_names(), vec!["name"]);
    }

    #[test]
    fn top_level_binding_inventory_covers_every_prepass_declaration() {
        let source = r#"<script lang="ts">
import default_import, { named as aliased_import } from "pkg";
import * as namespace_import from "other";
var plain_var;
let plain_let = 1;
const plain_const = 2;
function plain_function() {}
class PlainClass {}
namespace PlainNamespace {}
enum PlainEnum { Value }
export let exported_var = 3;
export function exported_function() {}
export class ExportedClass {}
</script>"#;
        let result = run_svelte2tsx_ts(source);
        let expected = [
            "default_import",
            "aliased_import",
            "namespace_import",
            "plain_var",
            "plain_let",
            "plain_const",
            "plain_function",
            "PlainClass",
            "PlainNamespace",
            "PlainEnum",
            "exported_var",
            "exported_function",
            "ExportedClass",
        ]
        .into_iter()
        .map(str::to_string)
        .collect();

        assert_eq!(result.exported_names.instance_value_names, expected);
    }

    #[test]
    fn top_level_binding_inventory_flattens_deep_destructuring_and_rest() {
        let source = r#"<script lang="ts">
let {
    direct,
    nested: { assigned = 1, ...object_rest },
    list: [array_first, , { deep }, ...array_rest],
    ...outer_rest
} = {} as any;
</script>"#;
        let result = run_svelte2tsx_ts(source);
        let expected = [
            "direct",
            "assigned",
            "object_rest",
            "array_first",
            "deep",
            "array_rest",
            "outer_rest",
        ]
        .into_iter()
        .map(str::to_string)
        .collect();

        assert_eq!(result.exported_names.instance_value_names, expected);
    }

    #[test]
    fn late_same_name_binding_keeps_earlier_dollar_call_out_of_runes_mode() {
        let source = r#"<script>
let answer = $state(0);
let state;
</script>"#;
        let result = run_svelte2tsx(source);

        assert!(!result.exported_names.is_runes_mode());
        assert!(
            result.code.contains("bindings: \"\""),
            "legacy bindings marker missing:\n{}",
            result.code
        );
    }

    #[test]
    fn binding_inventory_does_not_affect_output_or_source_maps() {
        let source = r#"<script lang="ts">
import { readable as mapped_import } from "svelte/store";
let { nested: { mapped_binding }, ...mapped_rest } = {} as any;
export { mapped_binding };
</script>
<p>{mapped_binding}{mapped_rest}{mapped_import}</p>"#;
        let first = run_svelte2tsx_ts(source);
        let second = run_svelte2tsx_ts(source);

        assert_eq!(first.code, second.code);
        assert_eq!(first.map, second.map);
        assert_eq!(first.forward_map, second.forward_map);

        let binding_offset = source.find("mapped_binding").unwrap() as u32;
        let generated_offset = first
            .map_offset_forward(binding_offset)
            .expect("binding declaration should remain forward-mapped")
            as usize;
        assert_eq!(
            &first.code[generated_offset..generated_offset + "mapped_binding".len()],
            "mapped_binding"
        );

        let raw_map = first.map.as_deref().expect("source map");
        let map = sourcemap::SourceMap::from_slice(raw_map.as_bytes()).expect("valid source map");
        assert_eq!(map.get_source(0), Some("Component.svelte"));
        assert!(map.tokens().next().is_some());
    }
}
