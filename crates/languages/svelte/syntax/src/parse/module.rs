use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::Tree;

use super::{ACORN_UNCHECKED_TYPESCRIPT_RULES, ParseResult, acorn_position, javascript_failure};

/// A `.svelte.js` module as upstream's `compileModule` parses it: with acorn, which reads it as it
/// reads a component's script. `erase` removes what upstream never sees of it.
///
/// # Errors
///
/// The first syntax error, as [`parse`](super::parse) reports one in a script.
pub fn parse_module(
    source_text: &str,
    source_type: SourceType,
    erase: impl for<'a> FnOnce(&'a Allocator, &mut Program<'a>),
) -> ParseResult<(Tree, rsvelte_typescript_tree::ProgramIdentifier)> {
    Tree::build(source_text, |builder| {
        builder.leave_unchecked(&ACORN_UNCHECKED_TYPESCRIPT_RULES);
        builder.read_as_acorn();
        let range = Span::new(0, builder.source_text().len() as u32);
        let program = (builder.program(range, source_type))
            .map_err(|e| acorn_position(javascript_failure(e)))?;
        builder.rewrite_program(program, erase);
        Ok(program)
    })
}
