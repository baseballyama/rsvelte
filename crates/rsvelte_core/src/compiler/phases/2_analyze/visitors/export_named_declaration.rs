//! ExportNamedDeclaration visitor.
//!
//! Analyzes export named declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExportNamedDeclaration.js`.

use super::VisitorContext;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::errors;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase2_analyze::types::Export;
use serde_json::Value;

/// Visit an export named declaration.
///
/// Checks for `export { x as default }` pattern which is not allowed in components.
/// Also tracks exported bindings.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Get source info to check if this is a re-export (e.g., export { x } from 'y')
    let has_source = node.get("source").is_some_and(|s| !s.is_null());

    // Check for `export { ... as default }` pattern
    // This is always an error in Svelte component scripts
    if let Some(specifiers) = node.get("specifiers").and_then(|s| s.as_array()) {
        for specifier in specifiers {
            // Check if exported name is "default"
            if let Some(exported) = specifier.get("exported") {
                let is_default =
                    if exported.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
                        exported.get("name").and_then(|n| n.as_str()) == Some("default")
                    } else {
                        // Literal (for string exports)
                        exported.get("value").and_then(|v| v.as_str()) == Some("default")
                    };

                if is_default && !context.analysis.is_module_file {
                    return Err(errors::module_illegal_default_export());
                }
            }

            // Check for export_undefined in module script
            // Only check if this is not a re-export (no source)
            // Skip type-only exports (exportKind: "type" on the node or specifier)
            if context.ast_type == super::AstType::Module
                && !has_source
                && let Some(local) = specifier.get("local")
                && local.get("type").and_then(|t| t.as_str()) == Some("Identifier")
            {
                // Skip type-only exports: check both node-level and specifier-level exportKind
                let is_type_export = node.get("exportKind").and_then(|v| v.as_str())
                    == Some("type")
                    || specifier.get("exportKind").and_then(|v| v.as_str()) == Some("type");

                if !is_type_export {
                    let local_name = local.get("name").and_then(|n| n.as_str()).unwrap_or("");
                    if !local_name.is_empty() {
                        // Check if the binding exists in the module scope
                        let binding_exists = context
                            .analysis
                            .root
                            .scope
                            .declarations
                            .contains_key(local_name);
                        if !binding_exists {
                            return Err(errors::export_undefined(local_name));
                        }
                    }
                }
            }

            // Validate export bindings for state/derived in non-instance scripts
            // (module scripts and module files).
            // Corresponds to ExportSpecifier.js: else { validate_export(...) }
            if context.ast_type != super::AstType::Instance
                && let Some(local) = specifier.get("local")
                && let Some(local_name) = local.get("name").and_then(|n| n.as_str())
                && let Some(binding_idx) =
                    context.analysis.root.get_binding(local_name, context.scope)
            {
                let binding = &context.analysis.root.bindings[binding_idx];
                if binding.kind == BindingKind::Derived {
                    return Err(errors::derived_invalid_export());
                }
                if matches!(binding.kind, BindingKind::State | BindingKind::RawState)
                    && binding.reassigned
                {
                    return Err(errors::state_invalid_export());
                }
            }

            // Track the exported binding - only for instance script in runes mode
            // Module script exports are handled differently (they're emitted directly)
            // Reference: ExportSpecifier.js - exports are only tracked in runes mode
            if context.analysis.runes
                && context.ast_type == super::AstType::Instance
                && let Some(local) = specifier.get("local")
            {
                let local_name = local.get("name").and_then(|n| n.as_str()).unwrap_or("");
                let exported_name = specifier
                    .get("exported")
                    .and_then(|e| e.get("name"))
                    .and_then(|n| n.as_str())
                    .unwrap_or(local_name);

                if !local_name.is_empty() {
                    let export = Export {
                        name: local_name.to_string(),
                        alias: if exported_name != local_name {
                            Some(exported_name.to_string())
                        } else {
                            None
                        },
                    };
                    context.analysis.exports.push(export);

                    // Mark binding as reassigned for PROPS_IS_UPDATED flag
                    // Reference: ExportSpecifier.js: if (binding) binding.reassigned = true;
                    if let Some(binding_idx) =
                        context.analysis.root.find_binding_any_scope(local_name)
                        && let Some(binding) = context.analysis.root.bindings.get_mut(binding_idx)
                    {
                        binding.reassigned = true;
                    }
                }
            }
        }
    }

    // In runes mode, handle export declarations - only for instance script
    if context.analysis.runes
        && context.ast_type == super::AstType::Instance
        && let Some(declaration) = node.get("declaration")
    {
        let decl_type = declaration.get("type").and_then(|t| t.as_str());

        match decl_type {
            // export function foo() { ... }
            Some("FunctionDeclaration") => {
                if let Some(id) = declaration.get("id")
                    && let Some(name) = id.get("name").and_then(|n| n.as_str())
                {
                    context.analysis.exports.push(Export {
                        name: name.to_string(),
                        alias: None,
                    });
                }
            }
            // export class Foo { ... }
            Some("ClassDeclaration") => {
                if let Some(id) = declaration.get("id")
                    && let Some(name) = id.get("name").and_then(|n| n.as_str())
                {
                    context.analysis.exports.push(Export {
                        name: name.to_string(),
                        alias: None,
                    });
                }
            }
            // export const x = ...; or export let x = ...;
            Some("VariableDeclaration") => {
                let kind = declaration.get("kind").and_then(|k| k.as_str());

                // export let is forbidden in runes mode
                if kind == Some("let") {
                    return Err(errors::legacy_export_invalid());
                }

                // Only export const in runes mode
                if kind == Some("const")
                    && let Some(declarators) =
                        declaration.get("declarations").and_then(|d| d.as_array())
                {
                    for declarator in declarators {
                        // Extract identifiers from the pattern
                        extract_identifiers_and_add_exports(declarator.get("id"), context);
                    }
                }
            }
            _ => {}
        }
    }

    // In legacy mode, `export let` creates bindable props
    // This is handled separately from runes mode
    if !context.analysis.runes
        && context.ast_type == super::AstType::Instance
        && let Some(declaration) = node.get("declaration")
    {
        let decl_type = declaration.get("type").and_then(|t| t.as_str());

        if decl_type == Some("VariableDeclaration") {
            let kind = declaration.get("kind").and_then(|k| k.as_str());
            // In legacy mode, export let creates bindable props
            if kind == Some("let")
                && let Some(declarators) =
                    declaration.get("declarations").and_then(|d| d.as_array())
            {
                for declarator in declarators {
                    // Extract identifiers and mark them as bindable props
                    mark_identifiers_as_bindable_props(declarator.get("id"), context);
                }
                // Set needs_props since we're using $.prop()
                context.analysis.needs_props = true;
            }
        }
    }

    // Also handle `export { x }` specifiers in legacy mode
    // These re-exports should also make the binding a bindable prop
    if !context.analysis.runes
        && context.ast_type == super::AstType::Instance
        && let Some(specifiers) = node.get("specifiers").and_then(|s| s.as_array())
    {
        for specifier in specifiers {
            if let Some(local) = specifier.get("local")
                && let Some(local_name) = local.get("name").and_then(|n| n.as_str())
            {
                // Find and mark the binding as bindable_prop. The binding is
                // declared by `export let foo` in the INSTANCE scope, not the
                // module/root scope, so look it up across scopes — the previous
                // `root.scope.declarations.get(...)` only checked the root scope
                // and silently missed every `export { foo as bar }` rename,
                // leaving `prop_alias` unset (so `$.prop($$props, 'foo', …)` used
                // the local name instead of the exported `'bar'`).
                if let Some(binding_idx) = context.analysis.root.find_binding_any_scope(local_name)
                    && let Some(binding) = context.analysis.root.bindings.get_mut(binding_idx)
                    // Only mark let/var declarations as bindable props
                    && matches!(
                        binding.declaration_kind,
                        crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Let
                            | crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Var
                    )
                {
                    binding.kind = BindingKind::BindableProp;

                    // Set prop_alias if exported with a different name
                    if let Some(exported) = specifier.get("exported")
                        && let Some(exported_name) = exported.get("name").and_then(|n| n.as_str())
                        && exported_name != local_name
                    {
                        binding.prop_alias = Some(exported_name.to_string());
                    }
                }
                // Set needs_props since we're using $.prop()
                context.analysis.needs_props = true;
            }
        }
    }

    // Walk into the declaration so that expressions within it (e.g., function calls
    // in `export let foo = get()`) are visited. Without this, CallExpression/MemberExpression/
    // NewExpression visitors won't be triggered, and needs_context won't be set properly.
    // Reference: The official Svelte compiler's visitor calls context.next() which walks children.
    if let Some(declaration) = node.get("declaration") {
        super::script::walk_js_node(declaration, context)?;
    }

    // Check for invalid state/derived exports in VariableDeclarations.
    // This applies to BOTH instance and module scripts.
    // Runs AFTER walking the declaration — upstream's ExportNamedDeclaration.js
    // calls `context.next()` first, so errors raised while visiting children
    // (e.g. `experimental_async` for `export const a = $derived(await ...)`)
    // take precedence over `derived_invalid_export` / `state_invalid_export`.
    if let Some(declaration) = node.get("declaration")
        && declaration.get("type").and_then(|t| t.as_str()) == Some("VariableDeclaration")
        && let Some(declarators) = declaration.get("declarations").and_then(|d| d.as_array())
    {
        for declarator in declarators {
            // Extract identifiers from the pattern and check bindings
            check_export_bindings(declarator.get("id"), context)?;
        }
    }

    Ok(())
}

/// Mark identifiers from a pattern as bindable props (for legacy `export let`).
fn mark_identifiers_as_bindable_props(pattern: Option<&Value>, context: &mut VisitorContext) {
    let pattern = match pattern {
        Some(p) => p,
        None => return,
    };

    let pattern_type = pattern.get("type").and_then(|t| t.as_str());

    match pattern_type {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                // Find and update the binding to be a bindable prop
                if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name)
                    && let Some(binding) = context.analysis.root.bindings.get_mut(binding_idx)
                {
                    binding.kind = BindingKind::BindableProp;
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for prop in properties {
                    let prop_type = prop.get("type").and_then(|t| t.as_str());
                    if prop_type == Some("Property") {
                        mark_identifiers_as_bindable_props(prop.get("value"), context);
                    } else if prop_type == Some("RestElement") {
                        mark_identifiers_as_bindable_props(prop.get("argument"), context);
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        mark_identifiers_as_bindable_props(Some(elem), context);
                    }
                }
            }
        }
        Some("RestElement") => {
            mark_identifiers_as_bindable_props(pattern.get("argument"), context);
        }
        Some("AssignmentPattern") => {
            mark_identifiers_as_bindable_props(pattern.get("left"), context);
        }
        _ => {}
    }
}

/// Extract identifiers from a pattern (Identifier, ObjectPattern, ArrayPattern)
/// and add them to exports.
fn extract_identifiers_and_add_exports(pattern: Option<&Value>, context: &mut VisitorContext) {
    let pattern = match pattern {
        Some(p) => p,
        None => return,
    };

    let pattern_type = pattern.get("type").and_then(|t| t.as_str());

    match pattern_type {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                context.analysis.exports.push(Export {
                    name: name.to_string(),
                    alias: None,
                });
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for prop in properties {
                    let prop_type = prop.get("type").and_then(|t| t.as_str());
                    if prop_type == Some("Property") {
                        extract_identifiers_and_add_exports(prop.get("value"), context);
                    } else if prop_type == Some("RestElement") {
                        extract_identifiers_and_add_exports(prop.get("argument"), context);
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        extract_identifiers_and_add_exports(Some(elem), context);
                    }
                }
            }
        }
        Some("RestElement") => {
            extract_identifiers_and_add_exports(pattern.get("argument"), context);
        }
        Some("AssignmentPattern") => {
            extract_identifiers_and_add_exports(pattern.get("left"), context);
        }
        _ => {}
    }
}

/// Check export bindings for invalid derived or reassigned state exports.
/// This applies to both instance and module scripts.
fn check_export_bindings(
    pattern: Option<&Value>,
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    let pattern = match pattern {
        Some(p) => p,
        None => return Ok(()),
    };

    let pattern_type = pattern.get("type").and_then(|t| t.as_str());

    match pattern_type {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                // Look up the binding
                if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name) {
                    let binding = &context.analysis.root.bindings[binding_idx];

                    // Cannot export derived state
                    if binding.kind == BindingKind::Derived {
                        return Err(errors::derived_invalid_export());
                    }

                    // Cannot export reassigned state
                    if matches!(binding.kind, BindingKind::State | BindingKind::RawState)
                        && binding.reassigned
                    {
                        return Err(errors::state_invalid_export());
                    }
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for prop in properties {
                    let prop_type = prop.get("type").and_then(|t| t.as_str());
                    if prop_type == Some("Property") {
                        check_export_bindings(prop.get("value"), context)?;
                    } else if prop_type == Some("RestElement") {
                        check_export_bindings(prop.get("argument"), context)?;
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        check_export_bindings(Some(elem), context)?;
                    }
                }
            }
        }
        Some("RestElement") => {
            check_export_bindings(pattern.get("argument"), context)?;
        }
        Some("AssignmentPattern") => {
            check_export_bindings(pattern.get("left"), context)?;
        }
        _ => {}
    }

    Ok(())
}

/// Typed visitor for ExportNamedDeclaration.
///
/// Handles specifiers using typed pattern matching (specifiers are always properly typed).
/// For declaration-based operations, resolves the declaration node and handles both typed
/// variants and Raw(Value) fallbacks (since the parser wraps declarations as Raw).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::ExportNamedDeclaration {
        declaration,
        specifiers,
        source,
        export_kind,
        ..
    } = node
    {
        let arena = context.parse_arena;
        let has_source = source.is_some();

        // Check for `export { ... as default }` pattern and other specifier checks
        // Specifiers are always properly typed (ExportSpecifier with Identifier children)
        let specifier_nodes = arena.get_js_children(*specifiers);
        for specifier in specifier_nodes {
            if let JsNode::ExportSpecifier {
                local: local_id,
                exported: exported_id,
                export_kind: spec_export_kind,
                ..
            } = specifier
            {
                let exported_node = arena.get_js_node(*exported_id);

                // Check if exported name is "default"
                let is_default = match exported_node {
                    JsNode::Identifier { name, .. } => name.as_str() == "default",
                    JsNode::Literal {
                        value: crate::ast::typed_expr::LiteralValue::String(s),
                        ..
                    } => s.as_str() == "default",
                    _ => false,
                };

                if is_default && !context.analysis.is_module_file {
                    return Err(errors::module_illegal_default_export());
                }

                // Check for export_undefined in module script
                if context.ast_type == super::AstType::Module
                    && !has_source
                    && let JsNode::Identifier {
                        name: local_name, ..
                    } = arena.get_js_node(*local_id)
                {
                    // Skip type-only exports
                    let is_type_export = export_kind.as_deref() == Some("type")
                        || spec_export_kind.as_deref() == Some("type");

                    if !is_type_export && !local_name.is_empty() {
                        let binding_exists = context
                            .analysis
                            .root
                            .scope
                            .declarations
                            .contains_key(local_name.as_str());
                        if !binding_exists {
                            return Err(errors::export_undefined(local_name.as_str()));
                        }
                    }
                }

                // Validate export bindings for state/derived in non-instance scripts
                if context.ast_type != super::AstType::Instance
                    && let JsNode::Identifier {
                        name: local_name, ..
                    } = arena.get_js_node(*local_id)
                    && let Some(binding_idx) = context
                        .analysis
                        .root
                        .get_binding(local_name.as_str(), context.scope)
                {
                    let binding = &context.analysis.root.bindings[binding_idx];
                    if binding.kind == BindingKind::Derived {
                        return Err(errors::derived_invalid_export());
                    }
                    if matches!(binding.kind, BindingKind::State | BindingKind::RawState)
                        && binding.reassigned
                    {
                        return Err(errors::state_invalid_export());
                    }
                }

                // Track the exported binding - only for instance script in runes mode
                if context.analysis.runes
                    && context.ast_type == super::AstType::Instance
                    && let JsNode::Identifier {
                        name: local_name, ..
                    } = arena.get_js_node(*local_id)
                {
                    let exported_name_str = match exported_node {
                        JsNode::Identifier { name, .. } => name.as_str(),
                        _ => local_name.as_str(),
                    };

                    if !local_name.is_empty() {
                        let export = Export {
                            name: local_name.to_string(),
                            alias: if exported_name_str != local_name.as_str() {
                                Some(exported_name_str.to_string())
                            } else {
                                None
                            },
                        };
                        context.analysis.exports.push(export);

                        // Mark binding as reassigned for PROPS_IS_UPDATED flag
                        if let Some(binding_idx) = context
                            .analysis
                            .root
                            .find_binding_any_scope(local_name.as_str())
                            && let Some(binding) =
                                context.analysis.root.bindings.get_mut(binding_idx)
                        {
                            binding.reassigned = true;
                        }
                    }
                }
            }
        }

        // For declaration-based operations, the parser stores declarations as
        // Raw(Value). Borrow the existing Value via `Cow::Borrowed` to avoid
        // a deep `.clone()` per export (measured: 1960 of 1960 declarations
        // are Raw across the runtime fixture set; the to_value() arm is dead
        // in practice but kept defensively for any future typed paths).
        let decl_value: Option<std::borrow::Cow<'_, Value>> = declaration.map(|decl_id| {
            let decl_node = arena.get_js_node(decl_id);
            match decl_node {
                JsNode::Raw(v) => std::borrow::Cow::Borrowed(v),
                other => std::borrow::Cow::Owned(other.to_value()),
            }
        });

        // In runes mode, handle export declarations - only for instance script
        if context.analysis.runes
            && context.ast_type == super::AstType::Instance
            && let Some(ref declaration_val) = decl_value
        {
            let decl_type = declaration_val.get("type").and_then(|t| t.as_str());

            match decl_type {
                Some("FunctionDeclaration") => {
                    if let Some(id) = declaration_val.get("id")
                        && let Some(name) = id.get("name").and_then(|n| n.as_str())
                    {
                        context.analysis.exports.push(Export {
                            name: name.to_string(),
                            alias: None,
                        });
                    }
                }
                Some("ClassDeclaration") => {
                    if let Some(id) = declaration_val.get("id")
                        && let Some(name) = id.get("name").and_then(|n| n.as_str())
                    {
                        context.analysis.exports.push(Export {
                            name: name.to_string(),
                            alias: None,
                        });
                    }
                }
                Some("VariableDeclaration") => {
                    let kind = declaration_val.get("kind").and_then(|k| k.as_str());

                    if kind == Some("let") {
                        return Err(errors::legacy_export_invalid());
                    }

                    if kind == Some("const")
                        && let Some(declarators) = declaration_val
                            .get("declarations")
                            .and_then(|d| d.as_array())
                    {
                        for declarator in declarators {
                            extract_identifiers_and_add_exports(declarator.get("id"), context);
                        }
                    }
                }
                _ => {}
            }
        }

        // In legacy mode, `export let` creates bindable props
        if !context.analysis.runes
            && context.ast_type == super::AstType::Instance
            && let Some(ref declaration_val) = decl_value
        {
            let decl_type = declaration_val.get("type").and_then(|t| t.as_str());

            if decl_type == Some("VariableDeclaration") {
                let kind = declaration_val.get("kind").and_then(|k| k.as_str());
                if kind == Some("let")
                    && let Some(declarators) = declaration_val
                        .get("declarations")
                        .and_then(|d| d.as_array())
                {
                    for declarator in declarators {
                        mark_identifiers_as_bindable_props(declarator.get("id"), context);
                    }
                    context.analysis.needs_props = true;
                }
            }
        }

        // Also handle `export { x }` specifiers in legacy mode
        if !context.analysis.runes && context.ast_type == super::AstType::Instance {
            for specifier in specifier_nodes {
                if let JsNode::ExportSpecifier {
                    local: local_id,
                    exported: exported_id,
                    ..
                } = specifier
                    && let JsNode::Identifier {
                        name: local_name, ..
                    } = arena.get_js_node(*local_id)
                {
                    // Look up across scopes — `export let foo` declares the
                    // binding in the INSTANCE scope, not the root scope, so the
                    // old root-only `scope.declarations.get(...)` missed the
                    // rename and left `prop_alias` unset.
                    if let Some(binding_idx) =
                        context.analysis.root.find_binding_any_scope(local_name.as_str())
                        && let Some(binding) = context.analysis.root.bindings.get_mut(binding_idx)
                        && matches!(
                            binding.declaration_kind,
                            crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Let
                                | crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Var
                        )
                    {
                        binding.kind = BindingKind::BindableProp;

                        if let JsNode::Identifier { name: exported_name, .. } =
                            arena.get_js_node(*exported_id)
                            && exported_name.as_str() != local_name.as_str()
                        {
                            binding.prop_alias = Some(exported_name.to_string());
                        }
                    }
                    context.analysis.needs_props = true;
                }
            }
        }

        // Walk into the declaration
        if let Some(decl_id) = declaration {
            let decl_node = arena.get_js_node(*decl_id);
            super::script::walk_js_node_typed(decl_node, context)?;
        }

        // Check for invalid state/derived exports in VariableDeclarations.
        // Runs AFTER walking the declaration — upstream's ExportNamedDeclaration.js
        // calls `context.next()` first, so errors raised while visiting children
        // (e.g. `experimental_async` for `export const a = $derived(await ...)`)
        // take precedence over `derived_invalid_export` / `state_invalid_export`.
        if let Some(ref declaration_val) = decl_value
            && declaration_val.get("type").and_then(|t| t.as_str()) == Some("VariableDeclaration")
            && let Some(declarators) = declaration_val
                .get("declarations")
                .and_then(|d| d.as_array())
        {
            for declarator in declarators {
                check_export_bindings(declarator.get("id"), context)?;
            }
        }
    }

    Ok(())
}
