use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use oxc_ast_visit::VisitMut;
use oxc_span::Span;
use rsvelte_typescript_compile::original_text::OriginalText;
use rsvelte_typescript_compile::prologue::{is_external_module, keep_module};
use rsvelte_typescript_compile::strip::{ErasedComments, ModuleErasure};

/// Removes from a `.svelte.ts` module what TypeScript's emit, which upstream reads instead of the
/// module, does not keep, and writes its numbers as that emit does, which is what the module's
/// checks then read. When `record` is true, it returns the spans of what it removed. The lowered
/// module is emitted later.
pub(super) fn erase<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    record: bool,
) -> Vec<Span> {
    let module = is_external_module(program);
    let erased = ErasedComments::new(program);
    let kept: Vec<_> = erased.kept(program).map(|comment| comment.span).collect();
    program.comments.retain(|comment| {
        kept.binary_search_by_key(&comment.span.start, |s| s.start)
            .is_ok()
    });
    let mut erasure = if record {
        ModuleErasure::recording(allocator)
    } else {
        ModuleErasure::new(allocator)
    };
    erasure.visit_program(program);
    OriginalText::new(allocator).visit_program(program);
    keep_module(allocator, program, module);
    erasure.erased()
}
