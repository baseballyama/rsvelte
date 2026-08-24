//! Layout decision for `{#await}` blocks, mirroring prettier-plugin-svelte's
//! `case 'AwaitBlock'` printer.
//!
//! The oracle decides the whole shape from three booleans — whether the
//! pending / then / catch fragments hold anything that is not blank text — and
//! prints only the clauses those booleans keep. rsvelte is an edit-based
//! formatter, so the same decision is expressed here as "which header form to
//! re-print" plus "which source regions to erase", and the per-clause edit path
//! is skipped for whatever this plan drops.

use rsvelte_core::ast::template::{AwaitBlock, Fragment, TemplateNode};

use crate::collapse::template_node_span;

/// Which header the oracle prints for this block.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(crate) enum AwaitHeaderForm {
    /// `{#await expr}`
    Bare,
    /// `{#await expr then value}`
    Then,
    /// `{#await expr catch error}`
    Catch,
}

pub(crate) struct AwaitPlan {
    /// The header the output must carry.
    pub form: AwaitHeaderForm,
    /// When `Some(end)`, replace `blk.start..end` with a freshly rendered
    /// header. `None` means the source header already has the right shape and
    /// the per-edit path formats it in place (which keeps its width-aware
    /// expression breaking).
    pub rewrite_end: Option<u32>,
    /// Source regions erased wholesale — a dropped separator plus its body.
    pub deletions: Vec<(u32, u32)>,
    pub keep_pending: bool,
    pub keep_then: bool,
    pub keep_catch: bool,
}

impl AwaitPlan {
    /// The plan that changes nothing — used whenever the source anchors cannot
    /// be resolved, so an unparseable shape keeps today's per-edit behaviour.
    fn identity() -> Self {
        Self {
            form: AwaitHeaderForm::Bare,
            rewrite_end: None,
            deletions: Vec::new(),
            keep_pending: true,
            keep_then: true,
            keep_catch: true,
        }
    }
}

/// prettier's `hasPendingBlock` / `hasThenBlock` / `hasCatchBlock`: at least one
/// child that is not a whitespace-only text node.
fn fragment_has_content(frag: Option<&Fragment>) -> bool {
    frag.is_some_and(|f| {
        f.nodes
            .iter()
            .any(|n| !matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())))
    })
}

/// Offset just past the first `}` at or after `from`.
fn close_brace_after(source: &str, from: u32) -> Option<u32> {
    source
        .get(from as usize..)
        .and_then(|s| s.find('}'))
        .map(|rel| crate::source_offset(from as usize + rel + 1))
}

/// Offset of the `{` opening the separator `{:<keyword> …}` that starts at the
/// first non-whitespace byte at or after `from`.
fn separator_open_at(source: &str, from: u32, keyword: &str) -> Option<u32> {
    let rest = source.get(from as usize..)?;
    let after_ws = rest.trim_start_matches([' ', '\t', '\n', '\r']);
    let open = from as usize + (rest.len() - after_ws.len());
    let inner = after_ws.strip_prefix('{')?;
    let inner = inner.trim_start_matches([' ', '\t', '\n', '\r']);
    let inner = inner.strip_prefix(':')?;
    let inner = inner.trim_start_matches([' ', '\t', '\n', '\r']);
    inner.strip_prefix(keyword)?;
    Some(crate::source_offset(open))
}

fn last_node_end(frag: Option<&Fragment>) -> Option<u32> {
    frag?.nodes.last().map(|n| template_node_span(n).1)
}

/// The source anchors of an await block's headers, all resolved from the AST
/// spans rather than by counting braces across the body.
struct AwaitAnchors {
    /// Just past the `}` of `{#await …}`.
    header_end: u32,
    /// `(open, close)` of `{:then …}`, when the source spells one.
    then_sep: Option<(u32, u32)>,
    /// `(open, close)` of `{:catch …}`, when the source spells one.
    catch_sep: Option<(u32, u32)>,
    /// The `{` of `{/await}`.
    close_open: u32,
}

fn locate(source: &str, blk: &AwaitBlock) -> Option<AwaitAnchors> {
    // The header carries the binding only in the shorthand form; otherwise the
    // promise expression is the last thing before its `}`.
    let header_anchor = if blk.pending.is_none() {
        blk.value
            .as_ref()
            .and_then(|v| v.end())
            .or_else(|| blk.error.as_ref().and_then(|e| e.end()))
            .or_else(|| blk.expression.end())
    } else {
        blk.expression.end()
    }?;
    let header_end = close_brace_after(source, header_anchor)?;

    let close_open = {
        let head = source.get(..blk.end as usize)?;
        let idx = crate::source_offset(head.rfind('{')?);
        if idx < header_end {
            return None;
        }
        let after = source.get(idx as usize + 1..blk.end as usize)?;
        if !after.trim_start().starts_with('/') {
            return None;
        }
        idx
    };

    // A `{:then …}` separator exists exactly when the header was not the
    // shorthand `{#await … then …}` and a then fragment was parsed.
    let then_sep = if blk.pending.is_some() && blk.then.is_some() {
        let anchor = last_node_end(blk.pending.as_ref()).unwrap_or(header_end);
        let open = separator_open_at(source, anchor, "then")?;
        let close = match blk.value.as_ref().and_then(|v| v.end()) {
            Some(end) if end > open => close_brace_after(source, end)?,
            _ => close_brace_after(source, open + 1)?,
        };
        Some((open, close))
    } else {
        None
    };

    let catch_sep = if blk.catch.is_some() && (blk.pending.is_some() || blk.then.is_some()) {
        let anchor = if blk.then.is_some() {
            last_node_end(blk.then.as_ref())
                .unwrap_or_else(|| then_sep.map_or(header_end, |(_, close)| close))
        } else {
            last_node_end(blk.pending.as_ref()).unwrap_or(header_end)
        };
        let open = separator_open_at(source, anchor, "catch")?;
        let close = match blk.error.as_ref().and_then(|e| e.end()) {
            Some(end) if end > open => close_brace_after(source, end)?,
            _ => close_brace_after(source, open + 1)?,
        };
        Some((open, close))
    } else {
        None
    };

    Some(AwaitAnchors {
        header_end,
        then_sep,
        catch_sep,
        close_open,
    })
}

/// Decide the block's layout the way prettier-plugin-svelte's `AwaitBlock`
/// printer does.
pub(crate) fn plan(source: &str, blk: &AwaitBlock) -> AwaitPlan {
    let Some(anchors) = locate(source, blk) else {
        return AwaitPlan::identity();
    };

    let has_pending = fragment_has_content(blk.pending.as_ref());
    let has_then = fragment_has_content(blk.then.as_ref());
    let has_catch = fragment_has_content(blk.catch.as_ref());

    let source_form = if blk.pending.is_some() {
        AwaitHeaderForm::Bare
    } else if blk.value.is_some() {
        AwaitHeaderForm::Then
    } else if blk.error.is_some() {
        AwaitHeaderForm::Catch
    } else {
        AwaitHeaderForm::Bare
    };

    let then_body_start = anchors.then_sep.map_or(anchors.header_end, |(_, c)| c);
    let catch_body_start = anchors.catch_sep.map_or(anchors.header_end, |(_, c)| c);
    let then_region_start = anchors.then_sep.map_or(then_body_start, |(o, _)| o);
    let catch_region_start = anchors.catch_sep.map_or(catch_body_start, |(o, _)| o);

    let (form, first_kept, keep_pending, keep_then, keep_catch) = if !has_pending && has_then {
        (
            AwaitHeaderForm::Then,
            then_body_start,
            false,
            true,
            has_catch,
        )
    } else if !has_pending && has_catch {
        (AwaitHeaderForm::Catch, catch_body_start, false, false, true)
    } else if has_pending {
        (
            AwaitHeaderForm::Bare,
            anchors.header_end,
            true,
            has_then,
            has_catch,
        )
    } else {
        // Nothing survives: `{#await expr}{/await}`.
        (
            AwaitHeaderForm::Bare,
            anchors.close_open,
            false,
            false,
            false,
        )
    };

    let mut deletions = Vec::new();
    let mut rewrite_end = None;
    if form == source_form {
        // The header already has the right shape, so only the dropped clauses
        // need erasing. Everything ahead of the first kept region goes.
        if first_kept > anchors.header_end {
            deletions.push((anchors.header_end, first_kept));
        }
    } else {
        rewrite_end = Some(first_kept);
    }

    // A dropped clause that sits after a kept one needs its own erasure; the
    // `first_kept` span above only covers the clauses ahead of the first
    // survivor.
    if keep_pending && !keep_then && blk.then.is_some() {
        let end = if keep_catch {
            catch_region_start
        } else {
            anchors.close_open
        };
        if end > then_region_start {
            deletions.push((then_region_start, end));
        }
    } else if (keep_pending || keep_then)
        && !keep_catch
        && blk.catch.is_some()
        && anchors.close_open > catch_region_start
    {
        deletions.push((catch_region_start, anchors.close_open));
    }

    AwaitPlan {
        form,
        rewrite_end,
        deletions,
        keep_pending,
        keep_then,
        keep_catch,
    }
}
