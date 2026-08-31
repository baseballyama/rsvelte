use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::{Attribute, Fragment, IfBlock, SvelteOptions, TemplateNode};

use crate::error::FormatError;
use crate::indent::else_if_branch;
use crate::options::FormatOptions;

use super::close_tag::{find_close_tag_span, push_close_tag};
use super::elements::is_block_element;
use super::open_tag::push_open_tag;

fn collect_if_open_tag_edits(
    source: &str,
    block: &IfBlock,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let mut current = block;
    loop {
        collect_open_tag_edits(source, &current.consequent, depth + 1, options, edits)?;
        match &current.alternate {
            Some(alternate) => {
                if let Some(chained) = else_if_branch(alternate) {
                    current = chained;
                } else {
                    collect_open_tag_edits(source, alternate, depth + 1, options, edits)?;
                    return Ok(());
                }
            }
            None => return Ok(()),
        }
    }
}

fn collect_optional_fragments<'a>(
    source: &str,
    fragments: impl IntoIterator<Item = Option<&'a Fragment<'a>>>,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    for fragment in fragments.into_iter().flatten() {
        collect_open_tag_edits(source, fragment, depth + 1, options, edits)?;
    }
    Ok(())
}

fn collect_each_open_tag_edits(
    source: &str,
    block: &rsvelte_core::ast::template::EachBlock,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    collect_open_tag_edits(source, &block.body, depth + 1, options, edits)?;
    collect_optional_fragments(source, [block.fallback.as_ref()], depth, options, edits)
}

fn collect_single_fragment_open_tag_edits(
    source: &str,
    fragment: &Fragment,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    collect_open_tag_edits(source, fragment, depth + 1, options, edits)
}

fn collect_svelte_window_open_tag_edits(
    source: &str,
    window: &rsvelte_core::ast::template::SvelteElement,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let empty = is_empty_fragment(&window.fragment);
    if !empty {
        return handle_element(
            source,
            window.start,
            window.end,
            window.name.as_str(),
            &window.attributes,
            None,
            &window.fragment,
            depth,
            false,
            options,
            edits,
        );
    }
    push_open_tag(
        source,
        window.start,
        window.name.as_str(),
        &window.attributes,
        None,
        depth,
        true,
        false,
        false,
        0,
        options,
        edits,
    )?;
    if let Some((close_start, close_end)) =
        find_close_tag_span(source, window.end, window.name.as_str())
    {
        edits.push((close_start, close_end, String::new()));
    }
    collect_open_tag_edits(source, &window.fragment, depth + 1, options, edits)
}

fn collect_element_open_tag_edits(
    source: &str,
    start: u32,
    end: u32,
    name: &str,
    attributes: &[Attribute],
    expression: Option<&Expression>,
    fragment: &Fragment,
    depth: usize,
    regular_element: bool,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    handle_element(
        source,
        start,
        end,
        name,
        attributes,
        expression,
        fragment,
        depth,
        regular_element,
        options,
        edits,
    )
}

fn collect_plain_element_open_tag_edits(
    source: &str,
    node: &TemplateNode,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<bool, FormatError> {
    let handled = match node {
        TemplateNode::RegularElement(element) => {
            collect_element_open_tag_edits(
                source,
                element.start,
                element.end,
                element.name.as_str(),
                &element.attributes,
                None,
                &element.fragment,
                depth,
                true,
                options,
                edits,
            )?;
            true
        }
        TemplateNode::Component(element) => {
            collect_element_open_tag_edits(
                source,
                element.start,
                element.end,
                element.name.as_str(),
                &element.attributes,
                None,
                &element.fragment,
                depth,
                false,
                options,
                edits,
            )?;
            true
        }
        TemplateNode::TitleElement(element) => {
            collect_element_open_tag_edits(
                source,
                element.start,
                element.end,
                element.name.as_str(),
                &element.attributes,
                None,
                &element.fragment,
                depth,
                false,
                options,
                edits,
            )?;
            true
        }
        TemplateNode::SlotElement(element) => {
            collect_element_open_tag_edits(
                source,
                element.start,
                element.end,
                element.name.as_str(),
                &element.attributes,
                None,
                &element.fragment,
                depth,
                false,
                options,
                edits,
            )?;
            true
        }
        TemplateNode::SvelteHead(element)
        | TemplateNode::SvelteBody(element)
        | TemplateNode::SvelteDocument(element)
        | TemplateNode::SvelteFragment(element)
        | TemplateNode::SvelteBoundary(element)
        | TemplateNode::SvelteOptions(element)
        | TemplateNode::SvelteSelf(element) => {
            collect_element_open_tag_edits(
                source,
                element.start,
                element.end,
                element.name.as_str(),
                &element.attributes,
                None,
                &element.fragment,
                depth,
                false,
                options,
                edits,
            )?;
            true
        }
        _ => false,
    };
    Ok(handled)
}

/// Walk a `Fragment` recursively and append open-tag rewrite edits for
/// every element with attributes. `depth` is the indent level at which
/// this fragment's elements render (the root call passes `0`).
pub fn collect_open_tag_edits(
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
pub fn collect_options_open_tag_edit(
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
        false,
        0,
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

/// Columns consumed by the enclosing block closing tags (`{/if}`, `{/each}`, …)
/// that glue directly to this element's end.
///
/// An element's own close tag lies inside its span and is measured with it; a
/// block's does not, so an element that is a block's whole one-line body was
/// judged against the width without the `{/…}` after it and stayed flat by
/// exactly the closers' width. Only a closer glued with no whitespace counts:
/// anything else offers a break opportunity of its own.
fn trailing_tag_width(source: &str, start: u32, end: u32) -> usize {
    // Only when the element itself renders on one line: otherwise the closers sit
    // on the CLOSE tag's line (`</td>{/each}`), not on the open tag's, and adding
    // them there breaks an open tag that fits.
    if source
        .get(start as usize..end as usize)
        .is_none_or(|whole| whole.contains('\n'))
    {
        return 0;
    }
    let Some(mut rest) = source.get(end as usize..) else {
        return 0;
    };
    let mut width = 0;
    // Any tag, not only a closer: a block ARM (`{:else}`) and the arm's own
    // expression tags sit on this line too. Stop at the first thing that is not
    // a tag — an element carries its own break decision, so counting it would
    // break an open tag that fits.
    while rest.starts_with('{') {
        let Some(close) = rest.find('}') else { break };
        width += close + 1;
        rest = &rest[close + 1..];
    }
    width
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
    regular_element: bool,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let is_empty = is_empty_fragment(fragment);
    let empty_nonhug = is_empty_nonhug_element(name, fragment);
    let last_child_ends_here = fragment
        .nodes
        .iter()
        .rev()
        .find(|n| !matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())))
        .is_some_and(|n| {
            !matches!(n, TemplateNode::Text(_)) && crate::collapse::template_node_span(n).1 == end
        });
    let wrapped = push_open_tag(
        source,
        start,
        name,
        attributes,
        this_expression,
        depth,
        is_empty,
        empty_nonhug,
        regular_element,
        trailing_tag_width(source, start, end),
        options,
        edits,
    )?;
    // Children first: an element and its last descendant can both close
    // implicitly at the same offset (`<tr><td>a<td>b</tr>`), and coincident
    // inserts emit in push order, so the inner close tag has to be pushed first.
    collect_open_tag_edits(source, fragment, depth + 1, options, edits)?;
    push_close_tag(
        source,
        end,
        name,
        wrapped,
        depth,
        is_empty,
        empty_nonhug,
        last_child_ends_here,
        options,
        edits,
    );
    Ok(())
}

fn collect_node_open_tag_edits(
    source: &str,
    node: &TemplateNode,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    if collect_plain_element_open_tag_edits(source, node, depth, options, edits)? {
        return Ok(());
    }
    match node {
        TemplateNode::SvelteWindow(window) => {
            collect_svelte_window_open_tag_edits(source, window, depth, options, edits)?;
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
            false,
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
            false,
            options,
            edits,
        )?,
        // Blocks have child fragments but no attributes themselves.
        // Their bodies are conceptually one level deeper than the block.
        TemplateNode::IfBlock(block) => {
            collect_if_open_tag_edits(source, block, depth, options, edits)?;
        }
        TemplateNode::EachBlock(block) => {
            collect_each_open_tag_edits(source, block, depth, options, edits)?;
        }
        TemplateNode::AwaitBlock(block) => collect_optional_fragments(
            source,
            [&block.pending, &block.then, &block.catch]
                .into_iter()
                .map(Option::as_ref),
            depth,
            options,
            edits,
        )?,
        TemplateNode::KeyBlock(block) => {
            collect_single_fragment_open_tag_edits(source, &block.fragment, depth, options, edits)?;
        }
        TemplateNode::SnippetBlock(block) => {
            collect_single_fragment_open_tag_edits(source, &block.body, depth, options, edits)?;
        }
        _ => {}
    }
    Ok(())
}
