//! ExportNamedDeclaration visitor.
//!
//! Analyzes export named declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExportNamedDeclaration.js`.

use super::VisitorContext;
use crate::ast::arena::ParseArena;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::errors;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase2_analyze::types::Export;

/// Mark identifiers from a pattern as bindable props (for legacy `export let`).
fn mark_identifiers_as_bindable_props(
    pattern: &JsNode,
    arena: &ParseArena,
    context: &mut VisitorContext,
) {
    for name in super::shared::utils::extract_identifiers_node(pattern, arena) {
        if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name.as_str())
            && let Some(binding) = context.analysis.root.bindings.get_mut(binding_idx)
        {
            binding.kind = BindingKind::BindableProp;
        }
    }
}

/// Extract identifiers from a pattern and add them to exports.
fn extract_identifiers_and_add_exports(
    pattern: &JsNode,
    arena: &ParseArena,
    context: &mut VisitorContext,
) {
    for name in super::shared::utils::extract_identifiers_node(pattern, arena) {
        context.analysis.exports.push(Export { name, alias: None });
    }
}

/// Check export bindings for invalid derived or reassigned state exports.
/// This applies to both instance and module scripts.
fn check_export_bindings(
    pattern: &JsNode,
    arena: &ParseArena,
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    for name in super::shared::utils::extract_identifiers_node(pattern, arena) {
        if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name.as_str()) {
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
    }

    Ok(())
}

/// Typed visitor for ExportNamedDeclaration.
///
/// Handles both specifiers and declarations using typed pattern matching.
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

        let decl_node = declaration.map(|decl_id| arena.get_js_node(decl_id));

        // In runes mode, handle export declarations - only for instance script
        if context.analysis.runes
            && context.ast_type == super::AstType::Instance
            && let Some(decl) = decl_node
        {
            match decl {
                JsNode::FunctionDeclaration { id, .. } | JsNode::ClassDeclaration { id, .. } => {
                    if let Some(id) = id
                        && let JsNode::Identifier { name, .. } = arena.get_js_node(*id)
                    {
                        context.analysis.exports.push(Export {
                            name: name.to_string(),
                            alias: None,
                        });
                    }
                }
                JsNode::VariableDeclaration {
                    kind, declarations, ..
                } => {
                    if kind == "let" {
                        return Err(errors::legacy_export_invalid());
                    }

                    if kind == "const" {
                        for declarator in arena.get_js_children(*declarations) {
                            if let JsNode::VariableDeclarator { id, .. } = declarator {
                                extract_identifiers_and_add_exports(
                                    arena.get_js_node(*id),
                                    arena,
                                    context,
                                );
                            }
                        }
                    }
                }
                _ => {}
            }
        }

        // In legacy mode, `export let` creates bindable props
        if !context.analysis.runes
            && context.ast_type == super::AstType::Instance
            && let Some(JsNode::VariableDeclaration {
                kind, declarations, ..
            }) = decl_node
            && kind == "let"
        {
            for declarator in arena.get_js_children(*declarations) {
                if let JsNode::VariableDeclarator { id, .. } = declarator {
                    mark_identifiers_as_bindable_props(arena.get_js_node(*id), arena, context);
                }
            }
            context.analysis.needs_props = true;
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
        if let Some(decl) = decl_node {
            super::script::walk_js_node_typed(decl, context)?;
        }

        // Check for invalid state/derived exports in VariableDeclarations.
        // Runs AFTER walking the declaration — upstream's ExportNamedDeclaration.js
        // calls `context.next()` first, so errors raised while visiting children
        // (e.g. `experimental_async` for `export const a = $derived(await ...)`)
        // take precedence over `derived_invalid_export` / `state_invalid_export`.
        if let Some(JsNode::VariableDeclaration { declarations, .. }) = decl_node {
            for declarator in arena.get_js_children(*declarations) {
                if let JsNode::VariableDeclarator { id, .. } = declarator {
                    check_export_bindings(arena.get_js_node(*id), arena, context)?;
                }
            }
        }
    }

    Ok(())
}
