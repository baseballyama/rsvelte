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
use rsvelte_core::ast::template::{Fragment, IfBlock, TemplateNode};

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
    collect_indent_edits_inner(source, fragment, child_depth, false, options, edits)
}

/// `force` makes the fragment re-indent its children even when it holds only
/// text — used for block bodies (`{#if}` / `{:else}` / `{#each}` / …), which
/// always render their content on its own line(s). Element children instead pass
/// `force = false`: a pure-text element collapses to one line and is handled
/// elsewhere, not re-indented here.
fn collect_indent_edits_inner(
    source: &str,
    fragment: &Fragment,
    child_depth: usize,
    force: bool,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let has_block_children = force || fragment.nodes.iter().any(is_indent_provoking);

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
            let TemplateNode::Text(t) = node else {
                continue;
            };
            if is_whitespace_only(t.data.as_str()) {
                if !t.data.contains('\n') {
                    // Inline spacing (no line break in the source). Between inline
                    // content like `{a} {b}` it is whitespace-sensitive — keep it
                    // on one line, collapsed to a single space. But leading /
                    // trailing inline whitespace at the document root (e.g. a
                    // markdown code block's indentation before a root element) is
                    // insignificant and is removed.
                    let replacement = if child_depth == 0 && (i == 0 || i == last) {
                        ""
                    } else {
                        " "
                    };
                    if t.data.as_str() != replacement {
                        edits.push((t.start, t.end, replacement.to_string()));
                    }
                    continue;
                }
                // Keep a single blank line where prettier-plugin-svelte / oxfmt
                // would: between siblings, and at the document root where the
                // whitespace abuts a sibling `<script>` / `<style>`. Leading and
                // trailing blanks inside an element are collapsed away.
                // A blank line is kept where there already is one (between
                // siblings, or before a sibling `<script>` / `<style>` at the
                // root — see `blank_line_allowed`), and is *forced* — even from
                // a single newline — right after a closing `</script>` /
                // `</style>`, because prettier / oxfmt always separate such a
                // block from the markup that follows with one blank line. A
                // blank is NOT forced *before* an opening `<script>` / `<style>`:
                // a leading `<!--@component-->` doc comment stays glued to it.
                let keep_blank = (child_depth == 0 && section_close_before(source, t.start))
                    || (t.data.matches('\n').count() >= 2
                        && blank_line_allowed(source, t.start, t.end, i, last, child_depth));
                let lead = if keep_blank { "\n" } else { "" };
                let replacement = if i == last {
                    format!("{lead}\n{parent_indent}")
                } else {
                    format!("{lead}\n{child_indent}")
                };
                edits.push((t.start, t.end, replacement));
            } else if t.data.contains('\n') {
                // Mixed text (text alongside tags/elements) that stays on its
                // own line(s): normalize the per-line leading indentation to the
                // children's depth, keeping the text content. Inline text (no
                // newline) is left untouched. The node's trailing indentation is
                // the next node's lead — children depth, or the parent's depth
                // when this is the fragment's last node (it abuts the close tag).
                let trailing_indent = if i == last {
                    &parent_indent
                } else {
                    &child_indent
                };
                let reindented =
                    reindent_text_lines(t.data.as_str(), &child_indent, trailing_indent);
                if reindented != t.data.as_str() {
                    edits.push((t.start, t.end, reindented));
                }
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
            // Walk the `{#if} / {:else if} / {:else}` chain at one consistent
            // depth. svelte desugars `{:else if}` into an alternate fragment
            // whose sole child is another IfBlock (`elseif = true`); prettier
            // keeps every chained branch at the same indent as the opening
            // `{#if}`, so follow the chain here rather than recursing (which
            // would add one level per `{:else if}`).
            let mut current: &IfBlock = blk;
            loop {
                collect_indent_edits_inner(
                    source,
                    &current.consequent,
                    next_depth,
                    true,
                    options,
                    edits,
                )?;
                match &current.alternate {
                    Some(alt) => match else_if_branch(alt) {
                        Some(chained) => current = chained,
                        None => {
                            collect_indent_edits_inner(
                                source, alt, next_depth, true, options, edits,
                            )?;
                            break;
                        }
                    },
                    None => break,
                }
            }
        }
        TemplateNode::EachBlock(blk) => {
            collect_indent_edits_inner(source, &blk.body, next_depth, true, options, edits)?;
            if let Some(fb) = &blk.fallback {
                collect_indent_edits_inner(source, fb, next_depth, true, options, edits)?;
            }
        }
        TemplateNode::AwaitBlock(blk) => {
            if let Some(frag) = &blk.pending {
                collect_indent_edits_inner(source, frag, next_depth, true, options, edits)?;
            }
            if let Some(frag) = &blk.then {
                collect_indent_edits_inner(source, frag, next_depth, true, options, edits)?;
            }
            if let Some(frag) = &blk.catch {
                collect_indent_edits_inner(source, frag, next_depth, true, options, edits)?;
            }
        }
        TemplateNode::KeyBlock(blk) => {
            collect_indent_edits_inner(source, &blk.fragment, next_depth, true, options, edits)?;
        }
        TemplateNode::SnippetBlock(blk) => {
            collect_indent_edits_inner(source, &blk.body, next_depth, true, options, edits)?;
        }
        _ => {}
    }
    Ok(())
}

/// If `alt` is the desugared body of an `{:else if}` — a fragment whose sole
/// child is an `elseif` IfBlock — return that IfBlock so the caller can keep it
/// at the same depth. A plain `{:else}` whose body merely starts with an
/// `{#if}` carries surrounding whitespace text nodes (and `elseif == false`),
/// so it won't match and is indented as a normal nested block.
pub(crate) fn else_if_branch(alt: &Fragment) -> Option<&IfBlock> {
    match alt.nodes.as_slice() {
        [TemplateNode::IfBlock(b)] if b.elseif => Some(b.as_ref()),
        _ => None,
    }
}

fn is_indent_provoking(node: &TemplateNode) -> bool {
    matches!(
        node,
        // Mustache tags and comments sit on their own line just like elements
        // and blocks, so a fragment containing one needs its whitespace-only
        // Text nodes re-indented to the configured unit (prettier-plugin-svelte
        // keeps a standalone `{expr}` / `{@render …}` / `<!-- … -->` on its own
        // line at the children's depth).
        TemplateNode::ExpressionTag(_)
            | TemplateNode::HtmlTag(_)
            | TemplateNode::ConstTag(_)
            | TemplateNode::DeclarationTag(_)
            | TemplateNode::DebugTag(_)
            | TemplateNode::RenderTag(_)
            | TemplateNode::AttachTag(_)
            | TemplateNode::Comment(_)
            | TemplateNode::RegularElement(_)
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

/// Re-indent the per-line leading whitespace of a mixed text node (text that
/// sits alongside tag/element siblings and stays multi-line). The first segment
/// — the run before the first newline, i.e. content continuing the open-tag line
/// — is kept verbatim. Content lines get `child_indent`. The final segment is
/// the indentation that leads into the following node (or the close tag), so a
/// whitespace-only last line is rewritten to `trailing_indent`. Genuinely blank
/// interior lines collapse to a bare newline (no trailing space).
fn reindent_text_lines(data: &str, child_indent: &str, trailing_indent: &str) -> String {
    let lines: Vec<&str> = data.split('\n').collect();
    let n = lines.len();
    let mut out = String::with_capacity(data.len());
    for (i, line) in lines.iter().enumerate() {
        if i == 0 {
            out.push_str(line);
            continue;
        }
        out.push('\n');
        let content = line.trim_start_matches([' ', '\t']);
        if content.is_empty() {
            // The last line's whitespace leads into the next node / close tag.
            if i == n - 1 {
                out.push_str(trailing_indent);
            }
            // Interior blank line → bare newline.
        } else {
            out.push_str(child_indent);
            out.push_str(content);
        }
    }
    out
}

/// Whether a blank line may survive at this whitespace position, matching
/// prettier-plugin-svelte / oxfmt:
///
/// - Between two siblings (neither first nor last in the fragment): kept.
/// - Inside a nested element, the first/last whitespace (against the open or
///   close tag) is stripped.
/// - In the document root, the first/last whitespace is kept only when it
///   abuts a sibling `<script>` / `<style>` block — i.e. the blank line a
///   component conventionally has between `</script>` and the markup.
fn blank_line_allowed(
    source: &str,
    start: u32,
    end: u32,
    i: usize,
    last: usize,
    child_depth: usize,
) -> bool {
    if i != 0 && i != last {
        return true;
    }
    if child_depth != 0 {
        return false;
    }
    if i == 0 {
        // A blank that abuts a hoisted `<script>` / `<style>` on either side is
        // kept: after a closing tag (the conventional blank under `</script>`),
        // or before an opening tag (e.g. `<svelte:options>` then a blank then
        // `<script>`, where `<svelte:options>` is hoisted so this is node 0).
        let before = source[..start as usize].trim_end();
        let after = source[end as usize..].trim_start();
        before.ends_with("</script>")
            || before.ends_with("</style>")
            || after.starts_with("<script")
            || after.starts_with("<style")
    } else {
        let after = source[end as usize..].trim_start();
        after.starts_with("<style") || after.starts_with("<script")
    }
}

/// Whether a document-root whitespace node immediately follows a closing
/// `</script>` / `</style>`. These blocks are hoisted out of the fragment, so
/// the following whitespace text node abuts them in the source. prettier /
/// oxfmt always separate such a block from the markup that follows with exactly
/// one blank line, so the blank is forced here regardless of how many newlines
/// the source had.
fn section_close_before(source: &str, start: u32) -> bool {
    let before = source[..start as usize].trim_end();
    before.ends_with("</script>") || before.ends_with("</style>")
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
