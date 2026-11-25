use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::{Tree, TypeScriptReader};

use super::{ACORN_UNCHECKED_TYPESCRIPT_RULES, ParseResult, acorn_position, javascript_failure};

/// A `.svelte.js` module as upstream's `compileModule` parses it: with acorn, which reads it as it
/// reads a component's script. `erase` removes what upstream never sees of it, and returns the
/// spans it removed.
///
/// A bundler erases a `.svelte.ts` module's types before acorn reads it, so no TypeScript rule of
/// acorn-typescript's is checked, and an error in what the erasure removes is not reported.
///
/// # Errors
///
/// The first syntax error, as [`parse`](super::parse) reports one in a script.
pub fn parse_module(
    source_text: &str,
    source_type: SourceType,
    erase: impl for<'a> FnOnce(&'a Allocator, &mut Program<'a>) -> Vec<oxc_span::Span>,
) -> ParseResult<(Tree, rsvelte_typescript_tree::ProgramIdentifier)> {
    Tree::build(source_text, |builder| {
        builder.leave_unchecked(&ACORN_UNCHECKED_TYPESCRIPT_RULES);
        builder.read_as_acorn(TypeScriptReader::Erasing);
        let range = Span::new(0, builder.source_text().len() as u32);
        (builder.erased_program(range, source_type, erase))
            .map_err(|e| acorn_position(javascript_failure(e)))
    })
}
