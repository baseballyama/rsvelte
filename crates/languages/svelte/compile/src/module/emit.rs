use std::path::Path;

use oxc_allocator::Allocator;
use oxc_ast::ast::{Expression, ImportOrExportKind, Program, Statement};
use oxc_ast::builder::AstBuilder;
use oxc_ast_visit::VisitMut;
use oxc_semantic::SemanticBuilder;
use oxc_span::{SPAN, SourceType};
use oxc_transformer::{TransformOptions, Transformer};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_compile::strip::{ErasedComments, ModuleEmit, is_erased_module_syntax};
use rsvelte_typescript_tree::document_span;

/// TypeScript's emit of a `.svelte.ts` module, which upstream reads instead of the module: oxc's
/// transform erases the types as `verbatimModuleSyntax` does and lowers parameter properties
/// and enums, and a script is strict.
pub(super) fn typescript_emit<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    filename: &str,
) -> Result<(), Diagnostic> {
    let module =
        (program.body.iter()).any(|s| s.is_module_declaration() || is_erased_module_syntax(s));
    let span = document_span(program.span);
    let erased = ErasedComments::new(program);
    let kept: Vec<_> = erased.kept(program).map(|comment| comment.span).collect();
    program.comments.retain(|comment| {
        kept.binary_search_by_key(&comment.span.start, |s| s.start)
            .is_ok()
    });
    ModuleEmit::new(allocator).visit_program(program);
    let scoping = (SemanticBuilder::new()
        .with_build_jsdoc(false)
        .with_enum_eval(true))
    .build(program)
    .semantic
    .into_scoping();
    let mut options = TransformOptions::default();
    options.typescript.only_remove_type_imports = true;
    let transformed = Transformer::new(allocator, Path::new(filename), &options)
        .build_with_scoping(scoping, program);
    program.source_type = SourceType::mjs();
    if let Some(error) = transformed.diagnostics.first() {
        // oxc's transform labels the node it cannot emit.
        let span = error.labels.first().map_or(span, |label| {
            Span::new(label.offset(), label.offset() + label.len())
        });
        return Err(Diagnostic::error(
            "typescript_transform",
            error.message.to_string(),
            span,
        ));
    }
    // TypeScript keeps a script strict, and a module that its emit leaves without an import or an
    // export a module.
    let b = AstBuilder::new(allocator);
    if !module {
        let strict = Expression::new_string_literal(SPAN, "use strict", None, &b);
        (program.body).insert(0, Statement::new_expression_statement(SPAN, strict, &b));
    } else if !program.body.iter().any(Statement::is_module_declaration) {
        let nothing = Statement::new_export_named_declaration(
            SPAN,
            oxc_allocator::Vec::new_in(&allocator),
            ImportOrExportKind::Value,
            &b,
        );
        program.body.push(nothing);
    }
    Ok(())
}
