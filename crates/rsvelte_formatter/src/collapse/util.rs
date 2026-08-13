use super::{FormatOptions, Fragment, ParseOptions, TemplateNode, VisualWidth, parse};

/// Derive the indent unit string and indent width from `FormatOptions`.
/// Used to convert leading-whitespace column counts to indent levels and to
/// pass the correct unit string to `crate::doc::print`.
pub(super) fn indent_config(options: &FormatOptions) -> (String, usize) {
    let width = options.js.indent_width.value() as usize;
    let width = if width == 0 { 1 } else { width };
    let unit = if options.js.indent_style.is_tab() {
        "\t".to_string()
    } else {
        " ".repeat(width)
    };
    (unit, width)
}

/// Re-parse formatter output the way `crate::format` parses its input. A
/// non-CSS `<style lang>` body is not CSS, and TS emitted into a plain
/// `<script>` needs the same force-TS retry the main parse uses — without both,
/// the parse fails and the caller silently skips its whole pass.
pub(super) fn parse_formatted(formatted: &str) -> Option<rsvelte_core::ast::template::Root<'_>> {
    let opts = ParseOptions {
        skip_non_css_lang_style: true,
        ..ParseOptions::default()
    };
    parse(formatted, &rsvelte_core::Allocator::default(), opts)
        .ok()
        .or_else(|| {
            parse(
                formatted,
                &rsvelte_core::Allocator::default(),
                ParseOptions {
                    force_typescript: true,
                    ..opts
                },
            )
            .ok()
        })
}

/// Every element-like container (HTML element, component, `<slot>`, `<title>`,
/// and every `<svelte:*>` element), paired with whether it carries any
/// attribute. Blocks, tags, text and comments are not element containers.
pub(super) fn element_container<'b, 'a>(
    n: &'b TemplateNode<'a>,
) -> Option<(&'b Fragment<'a>, bool)> {
    match n {
        TemplateNode::RegularElement(e) => Some((&e.fragment, !e.attributes.is_empty())),
        TemplateNode::Component(c) => Some((&c.fragment, !c.attributes.is_empty())),
        TemplateNode::SlotElement(e) => Some((&e.fragment, !e.attributes.is_empty())),
        TemplateNode::TitleElement(t) => Some((&t.fragment, !t.attributes.is_empty())),
        TemplateNode::SvelteComponent(c) => Some((&c.fragment, !c.attributes.is_empty())),
        TemplateNode::SvelteElement(e) => Some((&e.fragment, !e.attributes.is_empty())),
        TemplateNode::SvelteBody(e)
        | TemplateNode::SvelteDocument(e)
        | TemplateNode::SvelteFragment(e)
        | TemplateNode::SvelteBoundary(e)
        | TemplateNode::SvelteHead(e)
        | TemplateNode::SvelteOptions(e)
        | TemplateNode::SvelteSelf(e)
        | TemplateNode::SvelteWindow(e) => Some((&e.fragment, !e.attributes.is_empty())),
        _ => None,
    }
}

pub(super) fn apply_edits(src: &str, mut edits: Vec<(u32, u32, String)>) -> String {
    edits.sort_by_key(|(start, _, _)| std::cmp::Reverse(*start));
    let mut result = src.to_string();
    // Guard against overlapping range edits: applying a second edit that
    // intersects an already-applied one would `replace_range` over shifted
    // bytes, corrupting the output or panicking on a non-boundary index. Edits
    // are processed high→low, so the first (higher-start) edit for any overlap
    // wins and the overlapping one is skipped. Callers avoid emitting overlaps
    // in the first place; this is a safety net.
    let mut last_start = u32::MAX;
    for (start, end, text) in edits {
        if end > last_start {
            continue;
        }
        result.replace_range(start as usize..end as usize, &text);
        last_start = start;
    }
    result
}

/// The child fragments of a container node (for a generic recursive walk).
pub(super) fn child_fragments<'b, 'a>(node: &'b TemplateNode<'a>) -> Vec<&'b Fragment<'a>> {
    match node {
        TemplateNode::RegularElement(e) => vec![&e.fragment],
        TemplateNode::Component(c) => vec![&c.fragment],
        TemplateNode::TitleElement(t) => vec![&t.fragment],
        TemplateNode::SlotElement(e) => vec![&e.fragment],
        TemplateNode::SvelteComponent(c) => vec![&c.fragment],
        TemplateNode::SvelteElement(e) => vec![&e.fragment],
        TemplateNode::SvelteBoundary(b) => vec![&b.fragment],
        // Every `<svelte:*>` container that carries a child fragment. Omitting any
        // makes this generic walk (and the collapse passes built on it) silently
        // skip content nested under it.
        TemplateNode::SvelteBody(e)
        | TemplateNode::SvelteDocument(e)
        | TemplateNode::SvelteFragment(e)
        | TemplateNode::SvelteHead(e)
        | TemplateNode::SvelteOptions(e)
        | TemplateNode::SvelteSelf(e)
        | TemplateNode::SvelteWindow(e) => vec![&e.fragment],
        TemplateNode::IfBlock(b) => {
            let mut v = vec![&b.consequent];
            if let Some(a) = &b.alternate {
                v.push(a);
            }
            v
        }
        TemplateNode::EachBlock(b) => {
            let mut v = vec![&b.body];
            if let Some(f) = &b.fallback {
                v.push(f);
            }
            v
        }
        TemplateNode::AwaitBlock(b) => {
            let mut v = Vec::new();
            if let Some(f) = &b.pending {
                v.push(f);
            }
            if let Some(f) = &b.then {
                v.push(f);
            }
            if let Some(f) = &b.catch {
                v.push(f);
            }
            v
        }
        TemplateNode::KeyBlock(b) => vec![&b.fragment],
        TemplateNode::SnippetBlock(b) => vec![&b.body],
        _ => Vec::new(),
    }
}

pub(super) const fn text_start(node: &TemplateNode) -> Option<u32> {
    match node {
        TemplateNode::Text(t) => Some(t.start),
        _ => None,
    }
}

pub(super) const fn text_end(node: &TemplateNode) -> Option<u32> {
    match node {
        TemplateNode::Text(t) => Some(t.end),
        _ => None,
    }
}

/// Visual column where `pos` sits (width of its line's prefix).
pub(super) fn current_column(out: &str, pos: u32, tab_width: usize) -> usize {
    let pos = pos as usize;
    let line_start = out[..pos].rfind('\n').map_or(0, |i| i + 1);
    out[line_start..pos].visual_width(tab_width)
}

/// Elements whose default CSS display is block / list-item — prettier trims the
/// leading/trailing whitespace of their text content. Everything else keeps a
/// single edge space. Mirrors prettier's `CSS_DISPLAY_DEFAULTS`.
pub(super) fn is_block_display(tag: &str) -> bool {
    // Delegates to the canonical shared list in markup.rs.
    // `script` / `style` are intentionally excluded here — they are handled
    // by `is_whitespace_preserving` in this pass instead.
    crate::markup::is_html_block_display_element(tag)
}

pub(super) fn is_whitespace_preserving(tag: &str) -> bool {
    // `pre` / `textarea` preserve whitespace; `script` / `style` carry raw
    // JS/CSS already formatted by their dedicated passes (oxfmt). None of these
    // may have their text content reflowed as prose by the collapse pass.
    matches!(tag, "pre" | "textarea" | "script" | "style")
}

/// Tags whose text content has its leading/trailing whitespace trimmed when
/// collapsed onto one line: block / list-item elements (`CSS_DISPLAY_DEFAULTS`),
/// plus the `display:contents` elements `<slot>` / `<svelte:boundary>`, which
/// prettier / oxfmt also edge-trim (`<slot> x </slot>` → `<slot>x</slot>`).
/// Everything else (inline, inline-block, table-cell, …) keeps one edge space.
///
/// Note: `<svelte:element>` is NOT listed here — it is a non-block dynamic
/// element that prettier treats like an inline/component element for hugging
/// purposes (shouldHugStart/End return true when content is directly adjacent).
/// Its edge whitespace is still trimmed via `is_component_tag` in the `trims_edge`
/// computation, so one-line edge spaces are suppressed without blocking hug.
pub(super) fn trims_edge_whitespace(tag: &str) -> bool {
    is_block_display(tag) || matches!(tag, "slot" | "title" | "svelte:boundary")
}

/// Whether `tag` names a Svelte component (or component-like element) rather
/// than a plain HTML element: a capitalized name (`Button`), a member access
/// (`Foo.Bar`), or a `svelte:*` special element. prettier treats these as not
/// whitespace-sensitive, so their child boundary whitespace is dropped (no edge
/// space) — unlike unknown lowercase custom elements (`<my-widget>`).
pub(super) fn is_component_tag(tag: &str) -> bool {
    // A `svelte:*` special element, or a name whose first segment is capitalized:
    // a plain component (`Button`) or a member-access component (`Foo.Bar`) both
    // start with an uppercase letter. A lowercase dotted name (`foo.bar`) is not a
    // component, so don't match on `.` alone.
    tag.starts_with("svelte:") || tag.chars().next().is_some_and(|c| c.is_ascii_uppercase())
}

/// Inline-block elements (prettier `CSS_DISPLAY_DEFAULTS`) — display:inline-block.
/// They are not huggable: on overflow they block-break rather than hug.
pub(super) fn is_inline_block(tag: &str) -> bool {
    matches!(
        tag,
        "input" | "button" | "select" | "object" | "video" | "audio"
    )
}

/// Whether a fragment's direct children contain at least one prose text word —
/// a `Text` node with a non-whitespace run. Used to gate the component prose
/// fill: only a component whose body interleaves real text with inline children
/// (`<P>… <em>…</em> …</P>`) is word-filled; one that merely holds element
/// children separated by whitespace keeps its per-child layout.
pub(super) fn fragment_has_prose_word(fragment: &Fragment) -> bool {
    fragment
        .nodes
        .iter()
        .any(|n| matches!(n, TemplateNode::Text(t) if t.data.split_whitespace().next().is_some()))
}

/// Source span of an attribute, mirroring `markup::attribute_span`.
pub(super) const fn attribute_span(attr: &rsvelte_core::ast::template::Attribute) -> (u32, u32) {
    use rsvelte_core::ast::template::Attribute;
    match attr {
        Attribute::Attribute(n) => (n.start, n.end),
        Attribute::SpreadAttribute(s) => (s.start, s.end),
        Attribute::AttachTag(a) => (a.start, a.end),
        Attribute::BindDirective(d) => (d.start, d.end),
        Attribute::OnDirective(d) => (d.start, d.end),
        Attribute::ClassDirective(d) => (d.start, d.end),
        Attribute::StyleDirective(d) => (d.start, d.end),
        Attribute::TransitionDirective(d) => (d.start, d.end),
        Attribute::AnimateDirective(d) => (d.start, d.end),
        Attribute::UseDirective(d) => (d.start, d.end),
        Attribute::LetDirective(d) => (d.start, d.end),
    }
}

/// Whether `node` is an inline-display regular element (gets the hug treatment).
pub(super) fn is_inline_regular_element(node: &TemplateNode) -> bool {
    // `<slot>` is parsed as SlotElement but behaves as an inline non-block
    // element in prose runs — it should be treated the same as a RegularElement.
    matches!(node, TemplateNode::SlotElement(_))
        || matches!(node, TemplateNode::RegularElement(e)
            if !is_block_display(e.name.as_str()) && !is_whitespace_preserving(e.name.as_str()))
}

/// Number of newlines in the leading whitespace run (capped at 2).
pub(super) fn leading_linebreaks(s: &str) -> usize {
    s.chars()
        .take_while(|c| c.is_whitespace())
        .filter(|c| *c == '\n')
        .take(2)
        .count()
}

/// Number of newlines in the trailing whitespace run (capped at 2).
pub(super) fn trailing_linebreaks(s: &str) -> usize {
    s.chars()
        .rev()
        .take_while(|c| c.is_whitespace())
        .filter(|c| *c == '\n')
        .take(2)
        .count()
}

pub(super) fn ends_with_space_no_break(s: &str) -> bool {
    s.ends_with(|c: char| c.is_whitespace()) && trailing_linebreaks(s) == 0
}

pub(super) fn starts_with_space_no_break(s: &str) -> bool {
    s.starts_with(|c: char| c.is_whitespace()) && leading_linebreaks(s) == 0
}

pub(super) fn is_inline_node(node: &TemplateNode) -> bool {
    match node {
        TemplateNode::Text(_)
        | TemplateNode::ExpressionTag(_)
        | TemplateNode::HtmlTag(_)
        | TemplateNode::AttachTag(_)
        | TemplateNode::DebugTag(_)
        | TemplateNode::RenderTag(_)
        | TemplateNode::ConstTag(_)
        | TemplateNode::DeclarationTag(_)
        | TemplateNode::Comment(_)
        // `<slot>` is a `display:contents` element — prettier treats it as inline
        // for hug/layout purposes (like a component), so a `<slot>` child does not
        // disqualify its parent from the inline hug path.
        | TemplateNode::SlotElement(_)
        | TemplateNode::Component(_) => true,
        TemplateNode::RegularElement(e) => !is_block_display(e.name.as_str()),
        _ => false,
    }
}

pub(super) fn node_start(node: &TemplateNode) -> u32 {
    template_node_span(node).0
}

pub(super) fn node_end(node: &TemplateNode) -> u32 {
    template_node_span(node).1
}

pub fn template_node_span(node: &TemplateNode) -> (u32, u32) {
    match node {
        TemplateNode::Text(n) => (n.start, n.end),
        TemplateNode::Comment(n) => (n.start, n.end),
        TemplateNode::TitleElement(n) => (n.start, n.end),
        TemplateNode::SlotElement(n) => (n.start, n.end),
        TemplateNode::SvelteBody(n)
        | TemplateNode::SvelteDocument(n)
        | TemplateNode::SvelteFragment(n)
        | TemplateNode::SvelteBoundary(n)
        | TemplateNode::SvelteHead(n)
        | TemplateNode::SvelteOptions(n)
        | TemplateNode::SvelteSelf(n)
        | TemplateNode::SvelteWindow(n) => (n.start, n.end),
        TemplateNode::ExpressionTag(n) => (n.start, n.end),
        TemplateNode::HtmlTag(n) => (n.start, n.end),
        TemplateNode::ConstTag(n) => (n.start, n.end),
        TemplateNode::DeclarationTag(n) => (n.start, n.end),
        TemplateNode::DebugTag(n) => (n.start, n.end),
        TemplateNode::RenderTag(n) => (n.start, n.end),
        TemplateNode::AttachTag(n) => (n.start, n.end),
        TemplateNode::IfBlock(n) => (n.start, n.end),
        TemplateNode::EachBlock(n) => (n.start, n.end),
        TemplateNode::AwaitBlock(n) => (n.start, n.end),
        TemplateNode::KeyBlock(n) => (n.start, n.end),
        TemplateNode::SnippetBlock(n) => (n.start, n.end),
        TemplateNode::RegularElement(n) => (n.start, n.end),
        TemplateNode::Component(n) => (n.start, n.end),
        TemplateNode::SvelteComponent(n) => (n.start, n.end),
        TemplateNode::SvelteElement(n) => (n.start, n.end),
    }
}

/// prettier's `didSelfClose`: the element's own source closed the tag, so
/// `<div />` stays self-closed instead of becoming `<div></div>`.
pub(super) fn did_self_close(out: &str, end: u32) -> bool {
    end >= 2 && out.as_bytes().get(end as usize - 2) == Some(&b'/')
}

/// Whether the element `<name …>…</name>` (spanning `el_start..` with children
/// `nodes`) should be treated as having no body when hugging under
/// `bracketSameLine` — i.e. its only children are whitespace-only wrap artifacts,
/// not deliberate source whitespace like `<span> </span>`.
///
/// prettier keys the empty-element `body` on the ORIGINAL AST child count, but an
/// earlier collapse pass inserts a whitespace-only artifact child when the open
/// tag wraps across lines. The two are told apart by the open tag: a single-line
/// open tag never receives a wrap artifact, so any whitespace child there is
/// genuine source content and the element keeps its non-hug body; only a wrapped
/// (multi-line) open tag can carry the artifact that must be dropped so the
/// element hugs (matching prettier's source-empty `<span class="long"></span>`).
pub(super) fn element_source_empty(out: &str, nodes: &[TemplateNode], el_start: u32) -> bool {
    let all_ws = nodes.iter().all(|n| {
        matches!(n, TemplateNode::Text(t)
            if out.get(t.start as usize..t.end as usize)
                .is_some_and(|s| s.split_whitespace().next().is_none()))
    });
    if !all_ws {
        return false;
    }
    let Some(first) = nodes.first() else {
        return true; // no children at all — genuinely source-empty
    };
    // A single-line open tag never receives a wrap artifact, so a whitespace child
    // there is deliberate source content (`<span> </span>`) and must be kept.
    out.get(el_start as usize..node_start(first) as usize)
        .is_some_and(|open| open.contains('\n'))
}

/// The structural half of prettier-plugin-svelte's
/// `canOmitSoftlineBeforeClosingTag`, read from the text right after the
/// element's close tag: `!hugsStartOfNextNode(node) ||
/// isLastChildWithinParentBlockElement(path)`.
///
/// - `hugsStartOfNextNode` is false when the element is followed by HTML-collapse
///   whitespace or the end of the document — the softline may be omitted.
/// - otherwise a node abuts the close tag; the softline may still be omitted only
///   when that node is the parent's close tag (`</name>`) of a block element,
///   i.e. this element is that block's last child.
pub(super) fn omit_softline_allowed(out: &str, end: u32) -> bool {
    let rest = &out[end as usize..];
    match rest.chars().next() {
        None | Some(' ' | '\t' | '\n' | '\u{0C}' | '\r') => true,
        Some(_) => rest.strip_prefix("</").is_some_and(|after| {
            let name: String = after
                .chars()
                .take_while(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == ':')
                .collect();
            is_block_display(&name)
        }),
    }
}

/// HTML void elements — elements that can never have children and always use
/// the self-closing `/>` form. Their output cursor after printing is
/// well-defined regardless of attribute wrapping, unlike content elements
/// (e.g. `<code>`) whose hugged close tag may end up on an indented line.
pub(super) fn is_html_void_element(tag: &str) -> bool {
    matches!(
        tag,
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}
