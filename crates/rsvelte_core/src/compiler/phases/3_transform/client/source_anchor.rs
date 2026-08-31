//! Original-source coordinates for the client's comment cursor.
//!
//! Upstream prints the whole client output against one esrap cursor over the
//! `.svelte` file (`transform-client.js`: `component_block.loc = instance.loc`,
//! *"trick esrap into including comments"*), so where a comment written inside a
//! template expression lands is decided by the source line and column of the
//! nodes printed around it — not by anything in the generated code. rsvelte's
//! client comment space is the generated script text instead, which is why a
//! template expression had no channel into it at all.
//!
//! This builds one locally: a [`JsSourceAnchor`] carries a verbatim slice of the
//! source into the comment buffer and claims a position inside it, so the
//! distances esrap measures are the ones the source really has. No global
//! coordinate space is needed — only the region the comment and its neighbours
//! share.

use super::types::ComponentClientTransformState;
use crate::ast::template::ExpressionTag;
use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;
use crate::compiler::phases::phase3_transform::js_ast::nodes::{
    JsExpr, JsPattern, JsSourceAnchor, JsSourcePatternAnchor,
};
use crate::compiler::phases::phase3_transform::shared::js_scan;
use compact_str::CompactString;

/// One `{ … }` region and the comments written in it.
pub struct CommentRegion {
    start: u32,
    end: u32,
    text: CompactString,
    comments: Vec<(u32, u32, bool)>,
}

impl CommentRegion {
    /// The comments inside `tag`'s braces, plus the source slice running from
    /// `from` (an earlier offset the anchors also claim, e.g. an element's tag
    /// name) to the end of the tag. `None` when the braces hold no comment.
    pub fn of(
        state: &ComponentClientTransformState<'_>,
        tag: &ExpressionTag<'_>,
        from: u32,
    ) -> Option<Self> {
        Self::between(state, tag.start + 1, tag.end.saturating_sub(1), from)
    }

    /// Comments in an arbitrary source region containing a template
    /// expression. Block/directive visitors use this for regions whose opener
    /// is longer than `{` (for example `{#each ` and `{@html `).
    pub fn between(
        state: &ComponentClientTransformState<'_>,
        inner_start: u32,
        inner_end: u32,
        from: u32,
    ) -> Option<Self> {
        let source: &str = &state.options.source;
        if inner_end <= inner_start || inner_end as usize > source.len() || from > inner_start {
            return None;
        }
        let inner = source.get(inner_start as usize..inner_end as usize)?;
        if !inner.contains("//") && !inner.contains("/*") {
            return None;
        }
        let allocator = oxc_allocator::Allocator::default();
        let wrapped = format!("({inner})");
        let ret = oxc_parser::Parser::new(
            &allocator,
            &wrapped,
            oxc_span::SourceType::mjs().with_typescript(true),
        )
        .parse();
        // A caller may deliberately span template punctuation between two
        // source nodes (for example an each header and a following `{@const}`).
        // Preserve whatever comments the parser reaches, then supplement them
        // below when that punctuation stops parsing early.
        let mut comments: Vec<_> = ret
            .program
            .comments
            .iter()
            .map(|comment| {
                // The `(` wrapper shifts every offset by one.
                (
                    comment.span.start + inner_start - 1,
                    comment.span.end + inner_start - 1,
                    comment.is_line(),
                )
            })
            .collect();
        // Some callers deliberately include Svelte template punctuation or a
        // declaration such as `const c = ...`. Such a slice is not a valid
        // parenthesized expression, and the parser can stop before lexing a
        // later comment. Supplement its results with the shared opaque-aware
        // scanner. Keeping both matters for comments inside `${...}`, which
        // the parser sees while the scanner treats the template as opaque.
        for (relative_start, relative_end) in js_scan::comment_ranges(inner.as_bytes()) {
            let line = inner.as_bytes()[relative_start + 1] == b'/';
            let start = relative_start as u32 + inner_start;
            let end = relative_end as u32 + inner_start;
            if comments.iter().any(|&(comment_start, comment_end, _)| {
                comment_start == start && comment_end == end
            }) {
                continue;
            }
            comments.push((start, end, line));
        }
        if comments.is_empty() {
            return None;
        }
        comments.sort_unstable_by_key(|&(start, _, _)| start);
        Some(Self {
            start: from,
            end: inner_end,
            text: source.get(from as usize..inner_end as usize)?.into(),
            comments,
        })
    }

    /// Like [`Self::between`], but only asks OXC's lexer for comments. This is
    /// used for block headers whose full spelling is not a JavaScript
    /// expression (`promise /* c */ then value`, snippet parameter lists).
    pub fn lexical_between(
        state: &ComponentClientTransformState<'_>,
        inner_start: u32,
        inner_end: u32,
        from: u32,
    ) -> Option<Self> {
        let source: &str = &state.options.source;
        if inner_end <= inner_start || inner_end as usize > source.len() || from > inner_start {
            return None;
        }
        let inner = source.get(inner_start as usize..inner_end as usize)?;
        if !inner.contains("//") && !inner.contains("/*") {
            return None;
        }
        let allocator = oxc_allocator::Allocator::default();
        let ret = oxc_parser::Parser::new(
            &allocator,
            inner,
            oxc_span::SourceType::mjs().with_typescript(true),
        )
        .parse();
        if ret.program.comments.is_empty() {
            return None;
        }
        let comments = ret
            .program
            .comments
            .iter()
            .map(|comment| {
                (
                    comment.span.start + inner_start,
                    comment.span.end + inner_start,
                    comment.is_line(),
                )
            })
            .collect();
        Some(Self {
            start: from,
            end: inner_end,
            text: source.get(from as usize..inner_end as usize)?.into(),
            comments,
        })
    }

    /// Wrap `expr` so it claims `[at, at_end)` inside this region.
    pub fn anchor(&self, arena: &JsArena, expr: JsExpr, at: u32, at_end: u32) -> JsExpr {
        if at < self.start || at_end > self.end {
            return expr;
        }
        JsExpr::SourceAnchored(Box::new(JsSourceAnchor {
            inner: arena.alloc_expr(expr),
            region_start: self.start,
            region: self.text.clone(),
            comments: self.comments.clone(),
            at,
            at_end,
            preserve_inner_spans: false,
            claim_only: false,
        }))
    }

    /// As [`Self::anchor`], but the region's comments are claimed and not
    /// placed: this anchor stands in for a builder-made wrapper upstream's
    /// cursor never reaches, so a copy emitted here would be a second one.
    pub fn anchor_claim_only(&self, arena: &JsArena, expr: JsExpr, at: u32, at_end: u32) -> JsExpr {
        if at < self.start || at_end > self.end {
            return expr;
        }
        JsExpr::SourceAnchored(Box::new(JsSourceAnchor {
            inner: arena.alloc_expr(expr),
            region_start: self.start,
            region: self.text.clone(),
            comments: self.comments.clone(),
            at,
            at_end,
            preserve_inner_spans: false,
            claim_only: true,
        }))
    }

    /// As [`Self::anchor`], but retain source spans on descendants of a
    /// generated wrapper. This is needed when upstream's cursor reaches an
    /// original identifier inside a rebuilt array/call before it reaches the
    /// wrapper itself.
    pub fn anchor_inner(&self, arena: &JsArena, expr: JsExpr, at: u32, at_end: u32) -> JsExpr {
        if at < self.start || at_end > self.end {
            return expr;
        }
        JsExpr::SourceAnchored(Box::new(JsSourceAnchor {
            inner: arena.alloc_expr(expr),
            region_start: self.start,
            region: self.text.clone(),
            comments: self.comments.clone(),
            at,
            at_end,
            preserve_inner_spans: true,
            claim_only: false,
        }))
    }

    /// Wrap a generated binding pattern at its upstream source location.
    pub fn anchor_pattern(&self, pattern: JsPattern, at: u32, at_end: u32) -> JsPattern {
        if at < self.start || at_end > self.end {
            return pattern;
        }
        JsPattern::SourceAnchored(Box::new(JsSourcePatternAnchor {
            inner: Box::new(pattern),
            region_start: self.start,
            region: self.text.clone(),
            comments: self.comments.clone(),
            at,
            at_end,
        }))
    }
}
