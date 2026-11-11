//! The constant JavaScript the compiler adds to components, parsed once per thread.
//!
//! A translated script holds a marker where a prelude goes, so the document's scope analysis
//! does not walk the prelude; the emitter puts the prelude's statements where the marker is.

use std::cell::RefCell;

use oxc_allocator::{Allocator, CloneIn, GetAllocator};
use oxc_ast::ast::{Expression, Statement};
use oxc_ast_visit::VisitMut;
use oxc_span::{SPAN, SourceType};
use rsvelte_typescript_compile::build::Builder;
use rustc_hash::FxHashMap;

thread_local! {
    // Never freed: each thread parses each prelude once, and they are a few kilobytes in all.
    static ARENA: &'static Allocator = Box::leak(Box::default());
    static PARSED: RefCell<FxHashMap<usize, &'static [Statement<'static>]>> =
        RefCell::new(FxHashMap::default());
}

/// Clears every span: a span into a prelude's source would name text of the document.
struct Unplaced;

impl VisitMut<'_> for Unplaced {
    fn visit_span(&mut self, it: &mut oxc_span::Span) {
        *it = SPAN;
    }
}

/// The statements of `source`, parsed at most once on this thread, without positions.
///
/// # Panics
///
/// If the source does not parse, which the unit tests rule out.
fn parsed(source: &'static str) -> &'static [Statement<'static>] {
    let key = source.as_ptr() as usize;
    if let Some(found) = PARSED.with_borrow(|parsed| parsed.get(&key).copied()) {
        return found;
    }
    let allocator = ARENA.with(|arena| *arena);
    let mut parsed = oxc_parser::Parser::new(allocator, source, SourceType::mjs()).parse();
    assert!(parsed.diagnostics.is_empty(), "helper sources parse");
    Unplaced.visit_program(&mut parsed.program);
    let statements: &'static [Statement<'static>] = allocator.alloc(parsed.program.body);
    PARSED.with_borrow_mut(|parsed| parsed.insert(key, statements));
    statements
}

/// A copy of `source`'s statements in `b`'s arena.
pub(crate) fn statements<'t>(b: &Builder<'t>, source: &'static str) -> Vec<Statement<'t>> {
    let allocator = b.allocator();
    parsed(source)
        .iter()
        .map(|s| s.clone_in(allocator))
        .collect()
}

/// A statement that stands for `source` in a translated script, which [`expand`] reads back.
pub(crate) fn marker<'t>(b: &Builder<'t>, source: &'static str) -> Statement<'t> {
    parsed(source);
    b.statement(Expression::new_string_literal(SPAN, source, None, b))
}

/// The prelude `statement` stands for, or `None` for any other statement.
pub(crate) fn expand(statement: &Statement<'_>) -> Option<&'static [Statement<'static>]> {
    let Statement::ExpressionStatement(s) = statement else {
        return None;
    };
    let Expression::StringLiteral(literal) = &s.expression else {
        return None;
    };
    if s.span != SPAN || literal.span != SPAN {
        return None;
    }
    let key = literal.value.as_str()?.as_ptr() as usize;
    PARSED.with_borrow(|parsed| parsed.get(&key).copied())
}

/// `statements` with each marker replaced by the prelude it stands for.
pub(crate) fn expanded<'s, 'a: 's>(
    statements: &'s [Statement<'a>],
) -> impl Iterator<Item = &'s Statement<'a>> {
    statements
        .iter()
        .flat_map(|s| expand(s).unwrap_or_else(|| std::slice::from_ref(s)))
}

#[cfg(test)]
mod tests;
