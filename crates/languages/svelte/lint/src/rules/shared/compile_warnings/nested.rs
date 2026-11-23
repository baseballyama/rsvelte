//! The JavaScript nodes that a `svelte-ignore` comment leads below a statement or inside a
//! template expression, whose comments Svelte 5 reads too, and the comments it does not read
//! because the compiler attaches them to the node before.

use oxc_ast::AstKind;
use oxc_parser::Kind;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::Tokens;
use rsvelte_svelte_syntax::syntax_tree::TokenType;
use rsvelte_typescript_tree::node_span;
use rustc_hash::{FxHashMap, FxHashSet};

use super::{Ignores, contains};
use crate::rule::File;

/// A node led by `svelte-ignore` comments, nearest last.
struct Region {
    span: Span,
    comments: Vec<Span>,
    /// The region that holds this one.
    parent: Option<usize>,
}

/// The nodes that JavaScript `svelte-ignore` comments lead, and the comments that lead none.
#[derive(Default)]
pub(super) struct Nested {
    /// By start, the outer of two that start together first.
    regions: Vec<Region>,
    trailing: FxHashSet<Span>,
}

impl Nested {
    pub(super) fn new(file: &File<'_>, ignores: &Ignores) -> Self {
        let Some(component) = file.component() else {
            return Self::default();
        };
        let tokens = &component.tokens;
        let mut comments: Vec<Span> = ignores
            .items
            .iter()
            .map(|item| item.comment)
            .filter(|&comment| {
                tokens
                    .at(comment.start_offset)
                    .is_some_and(|t| tokens.get(t).kind == TokenType::JavaScriptComment)
            })
            .collect();
        comments.dedup();
        if comments.is_empty() {
            return Self::default();
        }
        let led: Vec<(Span, Vec<u32>)> = comments
            .iter()
            .map(|&comment| (comment, led_starts(tokens, comment)))
            .collect();
        let wanted: FxHashSet<u32> = led.iter().flat_map(|(_, s)| s.iter().copied()).collect();
        let (ends, widest) = node_extents(file, &wanted);
        let trailing: FxHashSet<Span> = comments
            .iter()
            .copied()
            .filter(|&comment| is_trailing(tokens, file.source(), &ends, comment))
            .collect();
        let mut by_span: FxHashMap<Span, Vec<Span>> = FxHashMap::default();
        for (comment, starts) in led {
            if trailing.contains(&comment) {
                continue;
            }
            let node = starts
                .iter()
                .filter_map(|start| widest.get(start).map(|&end| Span::new(*start, end)))
                .max_by_key(|span| span.end_offset);
            if let Some(node) = node {
                by_span.entry(node).or_default().push(comment);
            }
        }
        let mut regions: Vec<Region> = by_span
            .into_iter()
            .map(|(span, mut comments)| {
                comments.sort_by_key(|c| c.start_offset);
                Region {
                    span,
                    comments,
                    parent: None,
                }
            })
            .collect();
        regions.sort_by_key(|r| (r.span.start_offset, std::cmp::Reverse(r.span.end_offset)));
        // Node spans nest or are apart, so the open regions form a stack.
        let mut open: Vec<usize> = Vec::new();
        for i in 0..regions.len() {
            let start = regions[i].span.start_offset;
            while open
                .last()
                .is_some_and(|&o| regions[o].span.end_offset <= start)
            {
                open.pop();
            }
            regions[i].parent = open.last().copied();
            open.push(i);
        }
        Self { regions, trailing }
    }

    /// Whether the compiler reads `comment` as trailing the node before it, so it ignores
    /// nothing after it.
    pub(super) fn is_trailing(&self, comment: Span) -> bool {
        self.trailing.contains(&comment)
    }

    /// The comments that lead each region holding `at`, innermost first.
    pub(super) fn leading(&self, at: u32) -> impl Iterator<Item = &[Span]> {
        let last = self
            .regions
            .partition_point(|r| r.span.start_offset <= at)
            .checked_sub(1);
        let mut here = last;
        while let Some(i) = here
            && !contains(self.regions[i].span, at)
        {
            here = self.regions[i].parent;
        }
        std::iter::successors(here, |&i| self.regions[i].parent)
            .map(|i| self.regions[i].comments.as_slice())
    }
}

/// Where the nodes that `comment` leads start: past the comments, whitespace and `(` after it.
/// `None` of them when the next token is not JavaScript.
fn led_starts(tokens: &Tokens<TokenType>, comment: Span) -> Vec<u32> {
    let mut starts = Vec::new();
    for token in tokens.from_offset(comment.end_offset) {
        match token.kind {
            TokenType::Whitespace | TokenType::JavaScriptComment => {}
            TokenType::JavaScript(Kind::LParen) => starts.push(token.span.start_offset),
            TokenType::JavaScript(_) => {
                starts.push(token.span.start_offset);
                return starts;
            }
            _ => break,
        }
    }
    Vec::new()
}

/// Every JavaScript node's end, and for each start in `wanted` the end of the widest node there
/// that is not a statement of a script's top level.
fn node_extents(file: &File<'_>, wanted: &FxHashSet<u32>) -> (FxHashSet<u32>, FxHashMap<u32, u32>) {
    let nodes = file.nodes();
    let mut ends = FxHashSet::default();
    let mut widest: FxHashMap<u32, u32> = FxHashMap::default();
    for node in nodes.iter() {
        let kind = node.kind();
        let span = node_span(&kind);
        ends.insert(span.end_offset);
        if !wanted.contains(&span.start_offset) || matches!(kind, AstKind::Program(_)) {
            continue;
        }
        // A template expression is no statement even when its parent is a script's program.
        let top_level = match nodes.kind(nodes.parent_id(node.id())) {
            AstKind::Program(program) => contains(node_span(program), span.start_offset),
            _ => false,
        };
        if !top_level {
            let end = widest.entry(span.start_offset).or_default();
            *end = (*end).max(span.end_offset);
        }
    }
    (ends, widest)
}

/// The compiler's test for a trailing comment: back over tabs, spaces, `)` and `,` on its line,
/// a node ends there.
fn is_trailing(
    tokens: &Tokens<TokenType>,
    source: &str,
    ends: &FxHashSet<u32>,
    comment: Span,
) -> bool {
    for token in tokens.until_offset(comment.start_offset).iter().rev() {
        let skipped = match token.kind {
            TokenType::Whitespace => token
                .span
                .text(source)
                .chars()
                .all(|c| matches!(c, ' ' | '\t')),
            TokenType::JavaScript(Kind::RParen | Kind::Comma) => true,
            _ => false,
        };
        if ends.contains(&token.span.end_offset) {
            return true;
        }
        if !skipped {
            return false;
        }
    }
    false
}
