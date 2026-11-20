//! Upstream `module_illegal_default_export`.

use oxc_ast::ast::{ExportDefaultDeclarationKind, Statement};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::warnings::{Raised, Section};
use rsvelte_typescript_tree::node_span;

use super::raised_in_walk_of;
use crate::input::CompileInput;
use crate::lower::error;

/// Upstream `module_illegal_default_export`, which its walk of either script raises at an
/// `export default` or an `export { … as default }`.
pub(super) fn default_exports(
    input: &CompileInput<'_>,
) -> impl Iterator<Item = (Raised, Diagnostic)> {
    let component = input.component;
    [
        (Section::Module, component.module),
        (Section::Instance, component.instance),
    ]
    .into_iter()
    .filter_map(|(section, program)| Some((section, program?)))
    .flat_map(move |(section, program)| {
        let body = &component.javascript.get_program(program).body;
        body.iter()
            .enumerate()
            .filter(|(_, statement)| match statement {
                Statement::ExportDefaultDeclaration(_) => true,
                Statement::ExportNamedDeclaration(export) => export
                    .specifiers
                    .iter()
                    .any(|specifier| specifier.exported.name() == "default"),
                _ => false,
            })
            .map(move |(index, statement)| {
                let mut span = node_span(statement);
                // acorn-typescript reads a decorated class after `default` as an expression,
                // whose statement takes the `;` that follows.
                if let Statement::ExportDefaultDeclaration(export) = statement
                    && let ExportDefaultDeclarationKind::ClassDeclaration(class) =
                        &export.declaration
                    && class
                        .decorators
                        .first()
                        .is_some_and(|d| d.span.start > export.span.start)
                    && let Some(Statement::EmptyStatement(semicolon)) = body.get(index + 1)
                {
                    span.end_offset = semicolon.span.end;
                }
                let raised = raised_in_walk_of(section, span.start_offset);
                let message = "A component cannot have a default export";
                (
                    raised,
                    error("module_illegal_default_export", message, span),
                )
            })
    })
}
