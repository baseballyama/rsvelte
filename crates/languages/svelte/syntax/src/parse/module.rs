use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::Tree;

use super::{ACORN_UNCHECKED_TYPESCRIPT_RULES, ParseResult, acorn_position, javascript_failure};

/// A `.svelte.js` module as upstream's `compileModule` parses it: with acorn, which reads it as it
/// reads a component's script. `emit` is what reads the module before upstream does.
///
/// # Errors
///
/// A [`Diagnostic`] at the first syntax error, as [`parse`] reports one in a script, or the error
/// of `emit`.
pub fn parse_module(
    source_text: &str,
    source_type: SourceType,
    emit: impl for<'a> FnOnce(&'a Allocator, &mut Program<'a>) -> ParseResult<()>,
) -> ParseResult<(Tree, rsvelte_typescript_tree::ProgramIdentifier)> {
    Tree::build(source_text, |builder| {
        builder.leave_unchecked(&ACORN_UNCHECKED_TYPESCRIPT_RULES);
        builder.read_as_acorn();
        let range = Span::new(0, builder.source_text().len() as u32);
        let program = (builder.program(range, source_type))
            .map_err(|e| acorn_position(javascript_failure(e)))?;
        builder.rewrite_program(program, emit)?;
        Ok(program)
    })
}
