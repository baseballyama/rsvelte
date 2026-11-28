//! The `"use strict"` prologue TypeScript's emit gives a file that is not a module.

use oxc_allocator::Allocator;
use oxc_ast::ast::{Directive, ImportMeta, Program, Statement, StringLiteral, TSModuleReference};
use oxc_ast::builder::AstBuilder;
use oxc_ast_visit::Visit;
use oxc_span::{FileExtension, SPAN};

/// Adds the prologue as TypeScript's `visitSourceFile` does (6.0.3 at 050880ce59,
/// `src/compiler/transformers/ts.ts:838-847`).
///
/// `alwaysStrict` holds, as TypeScript 6 turns it on unless it is set to `false` and ts.compile
/// never sets it. So a file gets the prologue unless it is an external module (the emit's module
/// kind is an ES module) or it already has one. TypeScript's `CommonJS` emit of a `.cts` file adds
/// it in a transform ts.compile does not have.
pub fn ensure_use_strict<'a>(allocator: &'a Allocator, program: &mut Program<'a>) {
    if is_external_module(program) || has_use_strict(program) {
        return;
    }
    let b = AstBuilder::new(allocator);
    let text = "use strict";
    let expression = StringLiteral::new(SPAN, text, None, &b);
    program
        .directives
        .insert(0, Directive::new(SPAN, expression, text, &b));
}

/// TypeScript's `findUseStrictPrologue`, which reads a directive's value, so an escape in its text
/// still counts.
fn has_use_strict(program: &Program<'_>) -> bool {
    (program.directives.iter()).any(|directive| directive.expression.value == "use strict")
}

/// TypeScript's `isExternalModule` under the default `moduleDetection` (`auto`) and no `jsx`
/// option.
///
/// That is a top-level import or export or an `import.meta` anywhere
/// (`isFileProbablyExternalModule`, `src/compiler/parser.ts:469-482`), or an extension that makes
/// the file a module (`isFileForcedToBeModuleByFormat`, `src/compiler/utilities.ts:8973-8978`).
/// `export as namespace` is not one.
#[must_use]
pub fn is_external_module(program: &Program<'_>) -> bool {
    let forced = matches!(
        program.source_type.extension(),
        Some(FileExtension::Mjs | FileExtension::Mts | FileExtension::Cjs | FileExtension::Cts)
    );
    forced || program.body.iter().any(is_module_indicator) || {
        let mut finder = ImportMetaFinder(false);
        finder.visit_program(program);
        finder.0
    }
}

fn is_module_indicator(statement: &Statement<'_>) -> bool {
    match statement {
        Statement::TSNamespaceExportDeclaration(_) => false,
        Statement::TSImportEqualsDeclaration(import) => matches!(
            import.module_reference,
            TSModuleReference::ExternalModuleReference(_)
        ),
        _ => statement.is_module_declaration(),
    }
}

struct ImportMetaFinder(bool);

impl Visit<'_> for ImportMetaFinder {
    fn visit_import_meta(&mut self, _: &ImportMeta) {
        self.0 = true;
    }
}
