use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::{Attribute, Fragment, IfBlock, SvelteOptions, TemplateNode};

use crate::error::FormatError;
use crate::indent::else_if_branch;
use crate::options::FormatOptions;

use super::close_tag::{find_close_tag_span, push_close_tag};
use super::elements::is_block_element;
use super::open_tag::push_open_tag;

/// Walk a `Fragment` recursively and append open-tag rewrite edits for
/// every element with attributes. `depth` is the indent level at which
/// this fragment's elements render (the root call passes `0`).
pub(crate) fn collect_open_tag_edits(
    source: &str,
    fragment: &Fragment,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    for (i, node) in fragment.nodes.iter().enumerate() {
        if crate::prettier_ignore::preceded_by_prettier_ignore(&fragment.nodes, i) {
            continue;
        }
        collect_node_open_tag_edits(source, node, depth, options, edits)?;
    }
    Ok(())
}

/// Format the top-level `<svelte:options …>` open tag. It is hoisted out of the
/// fragment into `root.options`, so the normal fragment walk never sees it —
/// without this its attributes keep their source indentation (tabs) and its
/// attribute-value expressions stay unformatted.
pub(crate) fn collect_options_open_tag_edit(
    source: &str,
    opts: &SvelteOptions,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    if opts.attributes.is_empty() {
        return Ok(());
    }
    let attrs: Vec<Attribute> = opts
        .attributes
        .iter()
        .cloned()
        .map(Attribute::Attribute)
        .collect();
    push_open_tag(
        source,
        opts.start,
        "svelte:options",
        &attrs,
        None,
        0,
        false,
        false,
        options,
        edits,
    )?;
    Ok(())
}

/// Whether a fragment has no rendered content — empty or whitespace-only text.
fn is_empty_fragment(fragment: &Fragment) -> bool {
    fragment
        .nodes
        .iter()
        .all(|n| matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())))
}

/// Whether an (empty) fragment carries a whitespace-only text body — the
/// `<span> </span>` shape — as opposed to a truly source-empty `<span></span>`.
/// prettier keys `shouldHugStart`/`shouldHugEnd` on this: an inline element with
/// a whitespace body does NOT hug (its body prints as a `line`), whereas a
/// source-empty inline element hugs (`></span>`).
fn fragment_has_whitespace_body(fragment: &Fragment) -> bool {
    fragment.nodes.iter().any(|n| {
        matches!(n, TemplateNode::Text(t)
            if t.data.chars().next().is_some_and(|c| c.is_ascii_whitespace()))
    })
}

/// An inline element whose only body is whitespace (`<span> </span>`) — the shape
/// this targets. It is NOT `shouldHugStart && shouldHugEnd` (the whitespace body
/// blocks hugging), so prettier prints `group([...openingTag, '>', line, '</tag>'])`:
/// under a wrapping open tag the `>` glues to the last attribute line (under
/// `bracketSameLine`, else dedents), and the whitespace body prints as a `line`
/// that breaks, dropping the close tag to its own line. Without this the non-port
/// path keeps the raw whitespace glued (`> </span>`), which both diverges from the
/// oracle and is non-idempotent (multi-space collapses on a re-format).
///
/// Restricted to inline elements. A source-empty inline element (`<span></span>`)
/// hugs (`></span>`) and is already correct. Block-display elements (and
/// `script` / `style`, which prettier's `blockElements` excludes) are left to their
/// existing layout: their empty body is subject to the collapse pass's own
/// restructuring, which this edit-based path must not fight.
fn is_empty_nonhug_element(name: &str, fragment: &Fragment) -> bool {
    !is_block_element(name) && is_empty_fragment(fragment) && fragment_has_whitespace_body(fragment)
}

/// Emit the open-tag + close-tag rewrite edits for one attribute-bearing
/// element and recurse into its fragment. `this_expression` is the reactive
/// `this={X}` slot carried by `<svelte:component>` / `<svelte:element>`; `None`
/// for every other element.
#[allow(clippy::too_many_arguments)]
fn handle_element(
    source: &str,
    start: u32,
    end: u32,
    name: &str,
    attributes: &[Attribute],
    this_expression: Option<&Expression>,
    fragment: &Fragment,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let is_empty = is_empty_fragment(fragment);
    let empty_nonhug = is_empty_nonhug_element(name, fragment);
    let wrapped = push_open_tag(
        source,
        start,
        name,
        attributes,
        this_expression,
        depth,
        is_empty,
        empty_nonhug,
        options,
        edits,
    )?;
    push_close_tag(
        source,
        end,
        name,
        wrapped,
        depth,
        is_empty,
        empty_nonhug,
        options,
        edits,
    );
    collect_open_tag_edits(source, fragment, depth + 1, options, edits)?;
    Ok(())
}

fn collect_node_open_tag_edits(
    source: &str,
    node: &TemplateNode,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    match node {
        TemplateNode::RegularElement(elem) => handle_element(
            source,
            elem.start,
            elem.end,
            elem.name.as_str(),
            &elem.attributes,
            None,
            &elem.fragment,
            depth,
            options,
            edits,
        )?,
        TemplateNode::Component(c) => handle_element(
            source,
            c.start,
            c.end,
            c.name.as_str(),
            &c.attributes,
            None,
            &c.fragment,
            depth,
            options,
            edits,
        )?,
        TemplateNode::TitleElement(t) => handle_element(
            source,
            t.start,
            t.end,
            t.name.as_str(),
            &t.attributes,
            None,
            &t.fragment,
            depth,
            options,
            edits,
        )?,
        TemplateNode::SlotElement(s) => handle_element(
            source,
            s.start,
            s.end,
            s.name.as_str(),
            &s.attributes,
            None,
            &s.fragment,
            depth,
            options,
            edits,
        )?,
        TemplateNode::SvelteHead(s)
        | TemplateNode::SvelteBody(s)
        | TemplateNode::SvelteDocument(s)
        | TemplateNode::SvelteFragment(s)
        | TemplateNode::SvelteBoundary(s)
        | TemplateNode::SvelteOptions(s)
        | TemplateNode::SvelteSelf(s) => handle_element(
            source,
            s.start,
            s.end,
            s.name.as_str(),
            &s.attributes,
            None,
            &s.fragment,
            depth,
            options,
            edits,
        )?,
        // prettier-plugin-svelte always emits `<svelte:window />` as self-closing
        // (even when the source uses the paired `<svelte:window></svelte:window>` form).
        // When empty, delete the close tag too; when non-empty (a compiler error),
        // fall through to the normal paired rendering.
        TemplateNode::SvelteWindow(s) => {
            let empty = is_empty_fragment(&s.fragment);
            if empty {
                push_open_tag(
                    source,
                    s.start,
                    s.name.as_str(),
                    &s.attributes,
                    None,
                    depth,
                    empty,
                    // `<svelte:window>` is always self-closing when empty, so the
                    // non-hug empty layout never applies.
                    false,
                    options,
                    edits,
                )?;
                // Delete the close tag (replace it with nothing) so that the
                // self-closing `/>` open tag isn't followed by `</svelte:window>`.
                if let Some((close_start, close_end)) =
                    find_close_tag_span(source, s.end, s.name.as_str())
                {
                    edits.push((close_start, close_end, String::new()));
                }
                collect_open_tag_edits(source, &s.fragment, depth + 1, options, edits)?;
            } else {
                handle_element(
                    source,
                    s.start,
                    s.end,
                    s.name.as_str(),
                    &s.attributes,
                    None,
                    &s.fragment,
                    depth,
                    options,
                    edits,
                )?;
            }
        }
        TemplateNode::SvelteComponent(c) => handle_element(
            source,
            c.start,
            c.end,
            c.name.as_str(),
            &c.attributes,
            Some(&c.expression),
            &c.fragment,
            depth,
            options,
            edits,
        )?,
        TemplateNode::SvelteElement(e) => handle_element(
            source,
            e.start,
            e.end,
            e.name.as_str(),
            &e.attributes,
            Some(&e.tag),
            &e.fragment,
            depth,
            options,
            edits,
        )?,
        // Blocks have child fragments but no attributes themselves.
        // Their bodies are conceptually one level deeper than the block.
        TemplateNode::IfBlock(blk) => {
            // `{:else if}` chains stay at the same depth as the opening `{#if}`
            // (svelte nests them as `elseif` IfBlocks in the alternate); follow
            // the chain instead of recursing so attributes don't gain an extra
            // indent level per branch. See `indent.rs::else_if_branch`.
            let mut current: &IfBlock = blk;
            loop {
                collect_open_tag_edits(source, &current.consequent, depth + 1, options, edits)?;
                match &current.alternate {
                    Some(alt) => match else_if_branch(alt) {
                        Some(chained) => current = chained,
                        None => {
                            collect_open_tag_edits(source, alt, depth + 1, options, edits)?;
                            break;
                        }
                    },
                    None => break,
                }
            }
        }
        TemplateNode::EachBlock(blk) => {
            collect_open_tag_edits(source, &blk.body, depth + 1, options, edits)?;
            if let Some(fb) = &blk.fallback {
                collect_open_tag_edits(source, fb, depth + 1, options, edits)?;
            }
        }
        TemplateNode::AwaitBlock(blk) => {
            if let Some(frag) = &blk.pending {
                collect_open_tag_edits(source, frag, depth + 1, options, edits)?;
            }
            if let Some(frag) = &blk.then {
                collect_open_tag_edits(source, frag, depth + 1, options, edits)?;
            }
            if let Some(frag) = &blk.catch {
                collect_open_tag_edits(source, frag, depth + 1, options, edits)?;
            }
        }
        TemplateNode::KeyBlock(blk) => {
            collect_open_tag_edits(source, &blk.fragment, depth + 1, options, edits)?;
        }
        TemplateNode::SnippetBlock(blk) => {
            collect_open_tag_edits(source, &blk.body, depth + 1, options, edits)?;
        }
        _ => {}
    }
    Ok(())
}
