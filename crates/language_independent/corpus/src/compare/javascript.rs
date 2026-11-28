//! JavaScript compared as a syntax tree, with the meaning of `tools/oracle/canonical.ts`:
//! positions, comments and the spelling of literals are ignored; `@__PURE__` marks on calls are
//! not.

use oxc_allocator::Allocator;
use oxc_ast::ast::{ArrowFunctionExpression, Function, Program};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::{ContentEq, SourceType};
use oxc_syntax::scope::ScopeFlags;

/// The side that does not parse, with the parser's message.
#[derive(Debug, PartialEq, Eq)]
pub(crate) enum Unparsed {
    Expected(String),
    Actual(String),
}

/// Whether the parentheses a text writes are part of its tree.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(crate) enum Parentheses {
    /// As in `ESTree`, which acorn, the canonical tree's parser, makes: no node for them.
    Dropped,
    /// Each pair is a node: for an oracle that keeps the pairs of its source, as TypeScript's
    /// emit does.
    Kept,
}

/// Whether the two texts parse to the same tree.
pub(crate) fn same_tree(
    expected: &str,
    actual: &str,
    parentheses: Parentheses,
) -> Result<bool, Unparsed> {
    let allocator = Allocator::default();
    let mut expected = parse(&allocator, expected, parentheses).map_err(Unparsed::Expected)?;
    let mut actual = parse(&allocator, actual, parentheses).map_err(Unparsed::Actual)?;
    Canonical.visit_program(&mut expected);
    Canonical.visit_program(&mut actual);
    Ok(expected.content_eq(&actual))
}

/// Clears what `ContentEq` compares but the canonical tree (`ESTree`) does not have.
struct Canonical;

impl<'a> VisitMut<'a> for Canonical {
    fn visit_function(&mut self, it: &mut Function<'a>, flags: ScopeFlags) {
        it.pure = false;
        it.pife = false;
        walk_mut::walk_function(self, it, flags);
    }

    fn visit_arrow_function_expression(&mut self, it: &mut ArrowFunctionExpression<'a>) {
        it.pure = false;
        it.pife = false;
        walk_mut::walk_arrow_function_expression(self, it);
    }
}

fn parse<'a>(
    allocator: &'a Allocator,
    text: &'a str,
    parentheses: Parentheses,
) -> Result<Program<'a>, String> {
    let options = ParseOptions {
        preserve_parens: parentheses == Parentheses::Kept,
        ..ParseOptions::default()
    };
    let parsed = Parser::new(allocator, text, SourceType::mjs())
        .with_options(options)
        .parse();
    match parsed.diagnostics.first() {
        Some(d) => Err(d.to_string()),
        None if parsed.fatal_error => Err("the parser stopped".to_owned()),
        None => Ok(parsed.program),
    }
}

#[cfg(test)]
mod tests;
