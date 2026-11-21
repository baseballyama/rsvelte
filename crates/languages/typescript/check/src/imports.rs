//! The modules a script names, which the checker resolves.

use oxc_ast::ast::{
    ExportAllDeclaration, ExportFromDeclaration, Expression, ImportDeclaration, ImportExpression,
    Program, StringLiteral,
};
use oxc_ast_visit::{Visit, walk};
use rsvelte_kernel::source::positions::Span;

use crate::Import;

/// Each module specifier `program` imports, re-exports from or loads with `import()`, by its
/// string literal, with the names a static import binds.
#[must_use]
pub fn imports(program: &Program<'_>) -> Vec<Import> {
    let mut found = Specifiers(Vec::new());
    found.visit_program(program);
    found.0
}

struct Specifiers(Vec<Import>);

impl Specifiers {
    fn push(&mut self, source: &StringLiteral<'_>, names: Vec<String>) {
        // A specifier with a lone surrogate names no file.
        if let Some(specifier) = source.value.as_str() {
            self.0.push(Import {
                at: Span::new(source.span.start, source.span.end),
                specifier: specifier.to_owned(),
                names,
            });
        }
    }
}

impl<'a> Visit<'a> for Specifiers {
    fn visit_import_declaration(&mut self, it: &ImportDeclaration<'a>) {
        let names = (it.specifiers.iter().flatten())
            .map(|specifier| specifier.local().name.as_str().to_owned())
            .collect();
        self.push(&it.source, names);
    }

    fn visit_export_from_declaration(&mut self, it: &ExportFromDeclaration<'a>) {
        self.push(&it.source, Vec::new());
    }

    fn visit_export_all_declaration(&mut self, it: &ExportAllDeclaration<'a>) {
        self.push(&it.source, Vec::new());
    }

    fn visit_import_expression(&mut self, it: &ImportExpression<'a>) {
        if let Expression::StringLiteral(source) = &it.source {
            self.push(source, Vec::new());
        }
        walk::walk_import_expression(self, it);
    }
}
