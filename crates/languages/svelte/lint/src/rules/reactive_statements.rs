//! What the rules on Svelte 4's `$:` statements share.

use oxc_ast::ast::Statement;
use rsvelte_kernel::index::TypedIndex;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::{Token, TokenIdentifier, Tokens};
use rsvelte_svelte_semantic::legacy::reactive_body;
use rsvelte_svelte_syntax::syntax_tree::{Component, TokenType};
use rsvelte_typescript_tree::ProgramIdentifier;

use super::runes::runes_mode;
use crate::rule::File;

/// The scripts' programs, the module script's first.
fn programs(component: &Component) -> impl Iterator<Item = ProgramIdentifier> + '_ {
    component
        .module
        .iter()
        .chain(&component.instance)
        .map(|script| script.program)
}

/// The top-level `$:` statements with their bodies, in source order; none in runes mode, where
/// upstream's rules on them do not run.
pub(super) fn reactive_statements<'a>(
    file: &File<'_>,
    component: &'a Component,
) -> impl Iterator<Item = (&'a Statement<'a>, &'a Statement<'a>)> + 'a {
    let javascript = &component.javascript;
    let mut statements = programs(component)
        .flat_map(move |program| &javascript.get_program(program).body)
        .filter_map(|statement| reactive_body(statement).map(|body| (statement, body)))
        .peekable();
    // Deciding the mode reads `svelte.config.js` and walks every name, so only `$:` asks.
    let runes = statements.peek().is_some() && runes_mode(file, component);
    statements.filter(move |_| !runes)
}

/// The `items`, keyed by start offset, grouped by the statement each starts in, for statements
/// in source order that do not overlap.
pub(super) fn by_statement<T>(statements: &[Span], mut items: Vec<(u32, T)>) -> Vec<Vec<T>> {
    items.sort_by_key(|&(start, _)| start);
    let mut items = items.into_iter().peekable();
    statements
        .iter()
        .map(|statement| {
            while items
                .next_if(|&(start, _)| start < statement.start_offset)
                .is_some()
            {}
            let mut group = Vec::new();
            while let Some((_, item)) = items.next_if(|&(start, _)| start < statement.end_offset) {
                group.push(item);
            }
            group
        })
        .collect()
}

/// The tokens, trivia included, from the one at `start` to those that end by `end`.
pub(super) fn between(
    tokens: &Tokens<TokenType>,
    start: u32,
    end: u32,
) -> impl Iterator<Item = &Token<TokenType>> {
    let first = tokens.at(start).map_or(tokens.len(), TypedIndex::index);
    (first..tokens.len())
        .map(|i| tokens.get(TokenIdentifier::new(i)))
        .take_while(move |token| token.span.end_offset <= end)
}
