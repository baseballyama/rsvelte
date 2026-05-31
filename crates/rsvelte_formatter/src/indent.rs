//! Whitespace-only Text node re-indentation.
//!
//! Walks the template AST with depth tracking. For every fragment that
//! contains at least one element or block child, each whitespace-only
//! Text node in the fragment is replaced with `\n + INDENT`:
//!
//! - Every whitespace node before a sibling (i.e. not the last in the
//!   fragment) → uses the children's depth.
//! - The last whitespace node (sits before the parent's close tag) →
//!   uses `children's depth - 1`. For the document root that becomes
//!   an empty string (just a bare newline).
//!
//! Non-whitespace text is left alone, so `<p>hello world</p>` and
//! `<p>hello <em>world</em></p>` round-trip unchanged. Blocks
//! (`{#if}` / `{#each}` / ...) add one indent level to their bodies.

use oxc_formatter::JsFormatOptions;
use rsvelte_core::ast::template::{Fragment, TemplateNode};

use crate::error::FormatError;
use crate::options::FormatOptions;

/// `child_depth` is the indent level at which this fragment's children
/// render. The root call uses `0`. Recursing into an element's
/// children adds one level.
pub(crate) fn collect_indent_edits(
    source: &str,
    fragment: &Fragment,
    child_depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let has_block_children = fragment.nodes.iter().any(is_indent_provoking);

    if has_block_children {
        let child_indent = indent_for_level(child_depth, &options.js);
        // The last whitespace returns to the *parent's* depth — one
        // less than the children's. The root has no enclosing parent,
        // so use an empty indent (just a newline).
        let parent_indent = if child_depth == 0 {
            String::new()
        } else {
            indent_for_level(child_depth - 1, &options.js)
        };
        let last = fragment.nodes.len().saturating_sub(1);

        for (i, node) in fragment.nodes.iter().enumerate() {
            if let TemplateNode::Text(t) = node
                && is_whitespace_only(t.data.as_str())
            {
                let replacement = if i == last {
                    format!("\n{parent_indent}")
                } else {
                    format!("\n{child_indent}")
                };
                edits.push((t.start, t.end, replacement));
            }
        }
    }

    for node in &fragment.nodes {
        recurse_into_children(source, node, child_depth, options, edits)?;
    }

    Ok(())
}

fn recurse_into_children(
    source: &str,
    node: &TemplateNode,
    enclosing_depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let next_depth = enclosing_depth + 1;
    match node {
        TemplateNode::RegularElement(elem) => {
            // `<pre>` and `<textarea>` preserve whitespace; don't recurse
            // so no Text edits are pushed for their subtree. Open and
            // close tags of the element itself are still normalized by
            // `markup.rs` and expressions inside are still formatted by
            // `expression.rs`.
            if is_whitespace_preserving(elem.name.as_str()) {
                return Ok(());
            }
            collect_indent_edits(source, &elem.fragment, next_depth, options, edits)?;
        }
        TemplateNode::Component(c) => {
            collect_indent_edits(source, &c.fragment, next_depth, options, edits)?;
        }
        TemplateNode::TitleElement(t) => {
            collect_indent_edits(source, &t.fragment, next_depth, options, edits)?;
        }
        TemplateNode::SlotElement(s) => {
            collect_indent_edits(source, &s.fragment, next_depth, options, edits)?;
        }
        TemplateNode::SvelteHead(s)
        | TemplateNode::SvelteBody(s)
        | TemplateNode::SvelteDocument(s)
        | TemplateNode::SvelteFragment(s)
        | TemplateNode::SvelteBoundary(s)
        | TemplateNode::SvelteOptions(s)
        | TemplateNode::SvelteSelf(s)
        | TemplateNode::SvelteWindow(s) => {
            collect_indent_edits(source, &s.fragment, next_depth, options, edits)?;
        }
        TemplateNode::SvelteComponent(c) => {
            collect_indent_edits(source, &c.fragment, next_depth, options, edits)?;
        }
        TemplateNode::SvelteElement(e) => {
            collect_indent_edits(source, &e.fragment, next_depth, options, edits)?;
        }
        TemplateNode::IfBlock(blk) => {
            collect_indent_edits(source, &blk.consequent, next_depth, options, edits)?;
            if let Some(alt) = &blk.alternate {
                collect_indent_edits(source, alt, next_depth, options, edits)?;
            }
        }
        TemplateNode::EachBlock(blk) => {
            collect_indent_edits(source, &blk.body, next_depth, options, edits)?;
            if let Some(fb) = &blk.fallback {
                collect_indent_edits(source, fb, next_depth, options, edits)?;
            }
        }
        TemplateNode::AwaitBlock(blk) => {
            if let Some(frag) = &blk.pending {
                collect_indent_edits(source, frag, next_depth, options, edits)?;
            }
            if let Some(frag) = &blk.then {
                collect_indent_edits(source, frag, next_depth, options, edits)?;
            }
            if let Some(frag) = &blk.catch {
                collect_indent_edits(source, frag, next_depth, options, edits)?;
            }
        }
        TemplateNode::KeyBlock(blk) => {
            collect_indent_edits(source, &blk.fragment, next_depth, options, edits)?;
        }
        TemplateNode::SnippetBlock(blk) => {
            collect_indent_edits(source, &blk.body, next_depth, options, edits)?;
        }
        _ => {}
    }
    Ok(())
}

fn is_indent_provoking(node: &TemplateNode) -> bool {
    matches!(
        node,
        TemplateNode::RegularElement(_)
            | TemplateNode::Component(_)
            | TemplateNode::TitleElement(_)
            | TemplateNode::SlotElement(_)
            | TemplateNode::SvelteHead(_)
            | TemplateNode::SvelteBody(_)
            | TemplateNode::SvelteDocument(_)
            | TemplateNode::SvelteFragment(_)
            | TemplateNode::SvelteBoundary(_)
            | TemplateNode::SvelteOptions(_)
            | TemplateNode::SvelteSelf(_)
            | TemplateNode::SvelteWindow(_)
            | TemplateNode::SvelteComponent(_)
            | TemplateNode::SvelteElement(_)
            | TemplateNode::IfBlock(_)
            | TemplateNode::EachBlock(_)
            | TemplateNode::AwaitBlock(_)
            | TemplateNode::KeyBlock(_)
            | TemplateNode::SnippetBlock(_)
    )
}

fn is_whitespace_only(s: &str) -> bool {
    !s.is_empty() && s.chars().all(|c| c.is_whitespace())
}

/// Elements whose interior whitespace is meaningful and must survive
/// verbatim. Matches prettier-plugin-svelte's `whitespaceSensitive`
/// list for the common cases.
fn is_whitespace_preserving(tag_name: &str) -> bool {
    matches!(tag_name, "pre" | "textarea")
}

fn indent_for_level(level: usize, opts: &JsFormatOptions) -> String {
    if opts.indent_style.is_tab() {
        "\t".repeat(level)
    } else {
        " ".repeat(level * opts.indent_width.value() as usize)
    }
}
