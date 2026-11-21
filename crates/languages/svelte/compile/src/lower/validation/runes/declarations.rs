//! Upstream's runes-mode checks of an import and of the declarator a `$props()` call binds.

use oxc_ast::ast::{
    BindingPattern, BindingProperty, ImportDeclaration, ImportDeclarationSpecifier,
    ModuleExportName, PropertyKey, VariableDeclarator,
};
use rsvelte_typescript_tree::node_span;

use crate::lower::Diagnostic;

/// Upstream's `ImportDeclaration` checks in runes mode.
pub(super) fn imports(import: &ImportDeclaration<'_>) -> Result<(), Diagnostic> {
    let is_value = |s: &&ImportDeclarationSpecifier<'_>| match s {
        ImportDeclarationSpecifier::ImportSpecifier(s) => !s.import_kind.is_type(),
        _ => true,
    };
    // Upstream erases a type-only import, and one whose specifiers are all types, first.
    let mut values = import
        .specifiers
        .iter()
        .flatten()
        .filter(is_value)
        .peekable();
    if import.import_kind.is_type()
        || (import.specifiers.as_ref().is_some_and(|s| !s.is_empty()) && values.peek().is_none())
    {
        return Ok(());
    }
    let source = &import.source.value;
    if source.starts_with("svelte/internal") {
        return crate::lower::invalid(
            "import_svelte_internal_forbidden",
            "Imports of `svelte/internal/*` are forbidden. It contains private runtime code which \
                is subject to change without notice. If you're importing from `svelte/internal/*` \
                to work around a limitation of Svelte, please open an issue at \
                https://github.com/sveltejs/svelte and explain your use case",
            node_span(import),
        );
    }
    if *source != "svelte" {
        return Ok(());
    }
    for specifier in values {
        if let ImportDeclarationSpecifier::ImportSpecifier(specifier) = specifier
            && let ModuleExportName::IdentifierName(imported) = &specifier.imported
            && matches!(imported.name.as_str(), "beforeUpdate" | "afterUpdate")
        {
            return crate::lower::invalid(
                "runes_mode_invalid_import",
                format!("{} cannot be used in runes mode", imported.name),
                node_span(&**specifier),
            );
        }
    }
    Ok(())
}

/// Upstream `VariableDeclarator`: `$props()` binds a name or flat object pattern, checked before
/// the call and its `$bindable` defaults.
pub(super) fn check_props_pattern(declarator: &VariableDeclarator<'_>) -> Result<(), Diagnostic> {
    let properties = match &declarator.id {
        BindingPattern::BindingIdentifier(_) => return Ok(()),
        BindingPattern::ObjectPattern(pattern) => &pattern.properties,
        _ => {
            return crate::lower::invalid(
                "props_invalid_identifier",
                "`$props()` can only be used with an object destructuring pattern",
                node_span(declarator),
            );
        }
    };
    let invalid_pattern = |property: &BindingProperty<'_>| {
        crate::lower::invalid(
            "props_invalid_pattern",
            "`$props()` assignment must not contain nested properties or computed keys",
            node_span(property),
        )
    };
    for property in properties {
        if property.computed {
            return invalid_pattern(property);
        }
        if let PropertyKey::StaticIdentifier(key) = &property.key
            && key.name.starts_with("$$")
        {
            return crate::lower::invalid(
                "props_illegal_name",
                "Declaring or accessing a prop starting with `$$` is illegal (they are reserved \
                    for Svelte internals)",
                node_span(property),
            );
        }
        let value = match &property.value {
            BindingPattern::AssignmentPattern(p) => &p.left,
            value => value,
        };
        if !matches!(value, BindingPattern::BindingIdentifier(_)) {
            return invalid_pattern(property);
        }
    }
    Ok(())
}
