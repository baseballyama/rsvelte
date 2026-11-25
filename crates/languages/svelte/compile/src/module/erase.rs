use oxc_allocator::Allocator;
use oxc_ast::ast::{ImportOrExportKind, Program, Statement};
use oxc_ast::builder::AstBuilder;
use oxc_ast_visit::VisitMut;
use oxc_span::SPAN;
use rsvelte_typescript_compile::strip::{ErasedComments, ModuleErasure, is_erased_module_syntax};

/// Removes from a `.svelte.ts` module what TypeScript's emit, which upstream reads instead of the
/// module, does not keep. The lowered module is emitted later.
pub(super) fn erase<'a>(allocator: &'a Allocator, program: &mut Program<'a>) {
    let module =
        (program.body.iter()).any(|s| s.is_module_declaration() || is_erased_module_syntax(s));
    let erased = ErasedComments::new(program);
    let kept: Vec<_> = erased.kept(program).map(|comment| comment.span).collect();
    program.comments.retain(|comment| {
        kept.binary_search_by_key(&comment.span.start, |s| s.start)
            .is_ok()
    });
    ModuleErasure::new(allocator).visit_program(program);
    // A module left without an import or an export stays one.
    if module && !program.body.iter().any(Statement::is_module_declaration) {
        let b = AstBuilder::new(allocator);
        let nothing = Statement::new_export_named_declaration(
            SPAN,
            oxc_allocator::Vec::new_in(&allocator),
            ImportOrExportKind::Value,
            &b,
        );
        program.body.push(nothing);
    }
}
