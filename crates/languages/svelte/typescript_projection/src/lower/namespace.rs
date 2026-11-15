//! A TypeScript namespace in the instance script, whose imports and exports svelte2tsx handles as
//! the top level's.

use oxc_ast::ast::{Declaration, Statement, TSNamespaceDeclarationBody};
use oxc_span::GetSpan;

use super::{Span, span};

/// The statements of the namespace that `statement` declares, inside its dotted names.
pub(super) fn namespace_body<'s>(statement: &'s Statement<'s>) -> Option<&'s [Statement<'s>]> {
    let namespace = match statement {
        Statement::TSNamespaceDeclaration(namespace) => namespace,
        Statement::ExportDeclaration(export) => match &export.declaration {
            Declaration::TSNamespaceDeclaration(namespace) => namespace,
            _ => return None,
        },
        _ => return None,
    };
    let mut body = &namespace.body;
    while let TSNamespaceDeclarationBody::TSNamespaceDeclaration(inner) = body {
        body = &inner.body;
    }
    match body {
        TSNamespaceDeclarationBody::TSModuleBlock(block) => Some(&block.body),
        TSNamespaceDeclarationBody::TSNamespaceDeclaration(_) => None,
    }
}

/// The export list, or the `export` of a variable, function or class, that svelte2tsx removes
/// from `statement`.
pub(super) fn removed_export(statement: &Statement<'_>) -> Option<Span> {
    match statement {
        Statement::ExportNamedDeclaration(named) => Some(span(named.span)),
        Statement::ExportFromDeclaration(from) => Some(span(from.span)),
        Statement::ExportDeclaration(export)
            if matches!(
                export.declaration,
                Declaration::VariableDeclaration(_)
                    | Declaration::FunctionDeclaration(_)
                    | Declaration::ClassDeclaration(_)
            ) =>
        {
            Some(Span::new(
                export.span.start,
                export.declaration.span().start,
            ))
        }
        _ => None,
    }
}

/// [`removed_export`] inside the namespace that `statement` declares, as svelte2tsx removes it at
/// the top level.
pub(super) fn namespace_exports(statement: &Statement<'_>, removed: &mut impl FnMut(Span)) {
    for nested in namespace_body(statement).unwrap_or_default() {
        if let Some(at) = removed_export(nested) {
            removed(at);
        }
        namespace_exports(nested, removed);
    }
}

/// The imports inside the namespace that `statement` declares, in source order.
pub(super) fn nested_imports(statement: &Statement<'_>, imports: &mut Vec<Span>) {
    for nested in namespace_body(statement).unwrap_or_default() {
        if let Statement::ImportDeclaration(import) = nested {
            imports.push(span(import.span));
        }
        nested_imports(nested, imports);
    }
}
