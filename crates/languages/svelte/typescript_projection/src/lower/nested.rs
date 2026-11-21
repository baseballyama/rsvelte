//! svelte2tsx walks every node of the instance script: it moves each import and removes each
//! `export` it finds, at any depth.

use oxc_ast::ast::{Declaration, Statement};
use oxc_ast_visit::{Visit, walk};
use oxc_span::GetSpan;
use rsvelte_typescript_tree::document_span;

use super::Span;

/// The imports svelte2tsx moves and the exports it removes, in source order.
#[derive(Default)]
pub(super) struct Nested {
    pub(super) imports: Vec<Span>,
    pub(super) removed: Vec<Span>,
}

impl Nested {
    /// Those inside `statement`, not `statement` itself.
    pub(super) fn inside(statement: &Statement<'_>) -> Self {
        let mut found = Self::default();
        walk::walk_statement(&mut found, statement);
        found
    }
}

impl<'a> Visit<'a> for Nested {
    fn visit_statement(&mut self, it: &Statement<'a>) {
        if let Statement::ImportDeclaration(import) = it {
            self.imports.push(document_span(import.span));
        }
        self.removed.extend(removed_export(it));
        walk::walk_statement(self, it);
    }
}

/// The export list, or the `export` of a variable, function or class, that svelte2tsx removes
/// from `statement`.
fn removed_export(statement: &Statement<'_>) -> Option<Span> {
    match statement {
        Statement::ExportNamedDeclaration(named) => Some(document_span(named.span)),
        Statement::ExportFromDeclaration(from) => Some(document_span(from.span)),
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
