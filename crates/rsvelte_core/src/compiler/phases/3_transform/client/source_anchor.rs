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
use crate::compiler::phases::phase3_transform::js_ast::nodes::{JsExpr, JsSourceAnchor};
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
        let source: &str = &state.options.source;
        let (inner_start, inner_end) = (tag.start + 1, tag.end.saturating_sub(1));
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
        if !ret.diagnostics.is_empty() || ret.program.comments.is_empty() {
            return None;
        }
        let comments = ret
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
        }))
    }
}
