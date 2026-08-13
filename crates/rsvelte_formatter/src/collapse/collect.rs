use std::fmt::Write as _;

use super::{
    ChildrenPortResult, FormatOptions, Fragment, IndentUnit, TemplateNode, VisualWidth,
    build_open_attr_doc, current_column, fill, fill_inline_runs, fragment_has_prose_word,
    indent_config, is_block_display, is_component_tag, is_whitespace_preserving, tab_width,
    text_end, text_start, trims_edge_whitespace, try_break_block_multiline_content,
    try_break_block_overflow, try_break_content_tag_block, try_break_pre_content_tag,
    try_break_pre_own_attrs, try_children_port, try_fill_mixed, try_fix_pre_child_open_tags,
    try_hug_block_inline_body, try_hug_mixed, try_strip_trailing_slot_space,
};

/// Pass 1.6: targeted `try_collapse` sweep on inline/component pure-text
/// elements. Runs after pass 1 so that block restructuring (e.g.
/// `try_break_block_multiline_content` on `<li>`) exposes inline children
/// (`<a>`, `<A>`) that need their multi-line open tags hugged.
/// Only visits non-block elements; block elements were already handled in
/// pass 1 and their layout must not be disturbed.
pub(super) fn collect_try_collapse_only(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for (i, node) in fragment.nodes.iter().enumerate() {
        // A `<!-- prettier-ignore -->`d node and its whole subtree stay verbatim.
        if crate::prettier_ignore::preceded_by_prettier_ignore(&fragment.nodes, i) {
            continue;
        }
        match node {
            TemplateNode::RegularElement(elem) => {
                if is_whitespace_preserving(elem.name.as_str()) {
                    continue;
                }
                // Apply try_collapse to non-block elements only.
                if !is_block_display(elem.name.as_str())
                    && let Some(edit) = try_collapse(
                        out,
                        elem.name.as_str(),
                        elem.start,
                        elem.end,
                        &elem.fragment,
                        line_width,
                        options,
                        Some(node),
                    )
                {
                    edits.push(edit);
                    continue; // edit owns this element, don't recurse
                }
                collect_try_collapse_only(out, &elem.fragment, line_width, options, edits);
            }
            TemplateNode::Component(c) => {
                if let Some(edit) = try_collapse(
                    out,
                    c.name.as_str(),
                    c.start,
                    c.end,
                    &c.fragment,
                    line_width,
                    options,
                    None,
                ) {
                    edits.push(edit);
                    continue;
                }
                collect_try_collapse_only(out, &c.fragment, line_width, options, edits);
            }
            TemplateNode::TitleElement(t) => {
                collect_try_collapse_only(out, &t.fragment, line_width, options, edits);
            }
            TemplateNode::SvelteBody(s)
            | TemplateNode::SvelteDocument(s)
            | TemplateNode::SvelteFragment(s)
            | TemplateNode::SvelteBoundary(s)
            | TemplateNode::SvelteHead(s)
            | TemplateNode::SvelteOptions(s)
            | TemplateNode::SvelteSelf(s)
            | TemplateNode::SvelteWindow(s) => {
                collect_try_collapse_only(out, &s.fragment, line_width, options, edits);
            }
            TemplateNode::SvelteComponent(c) => {
                collect_try_collapse_only(out, &c.fragment, line_width, options, edits);
            }
            TemplateNode::SvelteElement(e) => {
                collect_try_collapse_only(out, &e.fragment, line_width, options, edits);
            }
            TemplateNode::IfBlock(blk) => {
                collect_try_collapse_only(out, &blk.consequent, line_width, options, edits);
                if let Some(alt) = &blk.alternate {
                    collect_try_collapse_only(out, alt, line_width, options, edits);
                }
            }
            TemplateNode::EachBlock(blk) => {
                collect_try_collapse_only(out, &blk.body, line_width, options, edits);
                if let Some(fb) = &blk.fallback {
                    collect_try_collapse_only(out, fb, line_width, options, edits);
                }
            }
            TemplateNode::AwaitBlock(blk) => {
                if let Some(f) = &blk.pending {
                    collect_try_collapse_only(out, f, line_width, options, edits);
                }
                if let Some(f) = &blk.then {
                    collect_try_collapse_only(out, f, line_width, options, edits);
                }
                if let Some(f) = &blk.catch {
                    collect_try_collapse_only(out, f, line_width, options, edits);
                }
            }
            TemplateNode::KeyBlock(blk) => {
                collect_try_collapse_only(out, &blk.fragment, line_width, options, edits);
            }
            TemplateNode::SnippetBlock(blk) => {
                collect_try_collapse_only(out, &blk.body, line_width, options, edits);
            }
            TemplateNode::SlotElement(s) => {
                collect_try_collapse_only(out, &s.fragment, line_width, options, edits);
            }
            _ => {}
        }
    }
}

pub(super) fn collect(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    is_block_body: bool,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    let mut consumed: Vec<(u32, u32)> = Vec::new();
    fill_inline_runs(
        out,
        fragment,
        line_width,
        is_block_body,
        options,
        edits,
        &mut consumed,
    );
    let in_consumed_run =
        |start: u32, end: u32| consumed.iter().any(|&(s, e)| s <= start && end <= e);
    for (node_idx, node) in fragment.nodes.iter().enumerate() {
        // A `<!-- prettier-ignore -->`d node and its whole subtree stay verbatim.
        if crate::prettier_ignore::preceded_by_prettier_ignore(&fragment.nodes, node_idx) {
            continue;
        }
        match node {
            TemplateNode::RegularElement(elem) => {
                if is_whitespace_preserving(elem.name.as_str()) {
                    // `<pre>` / `<textarea>` preserve whitespace, so collapse never
                    // reflows their text.  Three targeted sub-passes handle the
                    // overflow cases that markup/format-time width checks miss:
                    //
                    // 1. `try_break_pre_content_tag` — a sole expression-tag child
                    //    whose expression overflows needs its content broken (the
                    //    glued `<pre>{` prefix makes the shared width check
                    //    under-count).
                    // 2. `try_break_pre_own_attrs` — the `<pre>` open tag itself
                    //    has attributes that need breaking when the whole one-line
                    //    element overflows (open tag fits alone but open+content
                    //    doesn't).
                    // 3. `try_fix_pre_child_open_tags` — child elements (e.g.
                    //    `<code>` inside `<pre>`) whose open-tag `>` placement
                    //    needs fixing (either the `>` should be hugged to the last
                    //    attr, or `>` needs to drop to a new line for overflow).
                    //
                    // Cases 1 and 2 both rewrite the whole `<pre>` span and are
                    // mutually exclusive — only the first that fires is used.
                    // Case 3 targets child sub-spans and is skipped when case 1 or
                    // 2 fires (to avoid overlapping edits).
                    if matches!(elem.name.as_str(), "pre" | "textarea") {
                        if let Some(edit) = try_break_pre_content_tag(
                            out,
                            elem.start,
                            elem.end,
                            &elem.fragment,
                            line_width,
                            options,
                        ) {
                            edits.push(edit);
                        } else if let Some(edit) = try_break_pre_own_attrs(
                            out,
                            elem.start,
                            elem.end,
                            &elem.fragment,
                            line_width,
                            options,
                        ) {
                            edits.push(edit);
                        } else {
                            for edit in try_fix_pre_child_open_tags(
                                out,
                                elem.start,
                                &elem.fragment,
                                line_width,
                                options,
                            ) {
                                edits.push(edit);
                            }
                        }
                    }
                    continue;
                }
                // A run fill already reflowed this element inline — its layout is
                // owned by that edit, so recursing would risk an overlapping edit.
                if in_consumed_run(elem.start, elem.end) {
                    continue;
                }
                if let Some(edit) = try_collapse(
                    out,
                    elem.name.as_str(),
                    elem.start,
                    elem.end,
                    &elem.fragment,
                    line_width,
                    options,
                    Some(node),
                ) {
                    edits.push(edit);
                } else if let ChildrenPortResult::Claimed(maybe_edit) =
                    try_children_port(out, node, line_width, options)
                {
                    // Claimed by the children port (cut-1 shape) — apply its edit if
                    // any; a noop still suppresses the legacy passes below.
                    if let Some(edit) = maybe_edit {
                        edits.push(edit);
                    }
                } else if let Some(edit) = try_fill_mixed(
                    out,
                    elem.name.as_str(),
                    elem.start,
                    elem.end,
                    &elem.fragment,
                    line_width,
                    options,
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_hug_mixed(
                    out,
                    elem.name.as_str(),
                    elem.start,
                    elem.end,
                    &elem.fragment,
                    line_width,
                    options,
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_break_content_tag_block(
                    out,
                    elem.name.as_str(),
                    elem.start,
                    elem.end,
                    &elem.fragment,
                    line_width,
                    options,
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_break_block_overflow(
                    out,
                    elem.name.as_str(),
                    elem.start,
                    elem.end,
                    &elem.fragment,
                    line_width,
                    options,
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_break_block_multiline_content(
                    out,
                    elem.name.as_str(),
                    elem.start,
                    elem.end,
                    &elem.fragment,
                    options,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &elem.fragment, line_width, false, options, edits);
                }
            }
            TemplateNode::Component(c) => {
                // A run fill already reflowed this component inline — its layout
                // is owned by that edit, so recursing would risk an overlapping edit.
                if in_consumed_run(c.start, c.end) {
                    continue;
                }
                if let Some(edit) = try_collapse(
                    out,
                    c.name.as_str(),
                    c.start,
                    c.end,
                    &c.fragment,
                    line_width,
                    options,
                    None,
                ) {
                    edits.push(edit);
                } else if fragment_has_prose_word(&c.fragment)
                    && let Some(edit) = try_fill_mixed(
                        out,
                        c.name.as_str(),
                        c.start,
                        c.end,
                        &c.fragment,
                        line_width,
                        options,
                    )
                {
                    // A component whose body is prose text interspersed with inline
                    // children (`<P>… <em>…</em> …</P>`) is word-filled like a block
                    // element. Gate on an actual text word so components that merely
                    // hold element children separated by whitespace
                    // (`<Trigger><span/> <span/></Trigger>`) keep their per-child
                    // layout (recursion below) instead of being inlined.
                    edits.push(edit);
                } else if let Some(edit) = try_hug_mixed(
                    out,
                    c.name.as_str(),
                    c.start,
                    c.end,
                    &c.fragment,
                    line_width,
                    options,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &c.fragment, line_width, false, options, edits);
                }
            }
            TemplateNode::TitleElement(t) => {
                if let Some(edit) = try_collapse(
                    out,
                    t.name.as_str(),
                    t.start,
                    t.end,
                    &t.fragment,
                    line_width,
                    options,
                    None,
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_hug_mixed(
                    out,
                    t.name.as_str(),
                    t.start,
                    t.end,
                    &t.fragment,
                    line_width,
                    options,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &t.fragment, line_width, false, options, edits);
                }
            }
            TemplateNode::SlotElement(s) => {
                // A run fill already reflowed this slot inline — its layout is
                // owned by that edit, so recursing would risk an overlapping edit.
                if in_consumed_run(s.start, s.end) {
                    continue;
                }
                if let Some(edit) = try_collapse(
                    out,
                    s.name.as_str(),
                    s.start,
                    s.end,
                    &s.fragment,
                    line_width,
                    options,
                    None,
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_hug_mixed(
                    out,
                    s.name.as_str(),
                    s.start,
                    s.end,
                    &s.fragment,
                    line_width,
                    options,
                ) {
                    edits.push(edit);
                } else if let Some(edit) =
                    try_strip_trailing_slot_space(out, s.start, s.end, &s.fragment)
                {
                    edits.push(edit);
                } else {
                    collect(out, &s.fragment, line_width, false, options, edits);
                }
            }
            TemplateNode::SvelteBoundary(s) => {
                if let Some(edit) = try_collapse(
                    out,
                    s.name.as_str(),
                    s.start,
                    s.end,
                    &s.fragment,
                    line_width,
                    options,
                    None,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &s.fragment, line_width, false, options, edits);
                }
            }
            TemplateNode::SvelteHead(s)
            | TemplateNode::SvelteBody(s)
            | TemplateNode::SvelteDocument(s)
            | TemplateNode::SvelteOptions(s)
            | TemplateNode::SvelteWindow(s) => {
                collect(out, &s.fragment, line_width, false, options, edits);
            }
            TemplateNode::SvelteFragment(s) | TemplateNode::SvelteSelf(s) => {
                if let Some(edit) = try_collapse(
                    out,
                    s.name.as_str(),
                    s.start,
                    s.end,
                    &s.fragment,
                    line_width,
                    options,
                    None,
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_hug_mixed(
                    out,
                    s.name.as_str(),
                    s.start,
                    s.end,
                    &s.fragment,
                    line_width,
                    options,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &s.fragment, line_width, false, options, edits);
                }
            }
            TemplateNode::SvelteComponent(c) => {
                if let Some(edit) = try_collapse(
                    out,
                    c.name.as_str(),
                    c.start,
                    c.end,
                    &c.fragment,
                    line_width,
                    options,
                    None,
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_hug_mixed(
                    out,
                    c.name.as_str(),
                    c.start,
                    c.end,
                    &c.fragment,
                    line_width,
                    options,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &c.fragment, line_width, false, options, edits);
                }
            }
            TemplateNode::SvelteElement(e) => {
                if let Some(edit) = try_collapse(
                    out,
                    e.name.as_str(),
                    e.start,
                    e.end,
                    &e.fragment,
                    line_width,
                    options,
                    None,
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_hug_mixed(
                    out,
                    e.name.as_str(),
                    e.start,
                    e.end,
                    &e.fragment,
                    line_width,
                    options,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &e.fragment, line_width, false, options, edits);
                }
            }
            TemplateNode::IfBlock(blk) => {
                collect(out, &blk.consequent, line_width, true, options, edits);
                if let Some(alt) = &blk.alternate {
                    collect(out, alt, line_width, true, options, edits);
                }
            }
            TemplateNode::EachBlock(blk) => {
                if let Some(edit) = try_hug_block_inline_body(
                    out, blk.start, blk.end, &blk.body, line_width, options,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &blk.body, line_width, true, options, edits);
                }
                if let Some(fb) = &blk.fallback {
                    collect(out, fb, line_width, true, options, edits);
                }
            }
            TemplateNode::AwaitBlock(blk) => {
                if let Some(f) = &blk.pending {
                    collect(out, f, line_width, true, options, edits);
                }
                if let Some(f) = &blk.then {
                    collect(out, f, line_width, true, options, edits);
                }
                if let Some(f) = &blk.catch {
                    collect(out, f, line_width, true, options, edits);
                }
            }
            TemplateNode::KeyBlock(blk) => {
                if let Some(edit) = try_hug_block_inline_body(
                    out,
                    blk.start,
                    blk.end,
                    &blk.fragment,
                    line_width,
                    options,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &blk.fragment, line_width, true, options, edits);
                }
            }
            TemplateNode::SnippetBlock(blk) => {
                // Snippet bodies are NOT treated as inline-collapse block bodies —
                // prettier keeps `<span>...</span>\n{value}` on separate lines in
                // snippet bodies even when they fit on one line. Use false here.
                collect(out, &blk.body, line_width, false, options, edits);
            }
            _ => {}
        }
    }
}

/// Re-lay-out a pure-text element: render it on one line when it fits, else
/// break the content onto its own indented line(s) (word-fill). Returns the edit
/// when the ideal layout differs from the element's current rendering in `out`.
pub(super) fn try_collapse(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
    node: Option<&TemplateNode>,
) -> Option<(u32, u32, String)> {
    let tw = tab_width(options);
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    // Pure text: every child is a Text node.
    if fragment.nodes.is_empty()
        || !fragment
            .nodes
            .iter()
            .all(|n| matches!(n, TemplateNode::Text(_)))
    {
        return None;
    }

    // Content runs from the end of the open tag to the start of the close tag.
    let first = fragment.nodes.first()?;
    let last = fragment.nodes.last()?;
    let (content_start, content_end) = (text_start(first)?, text_end(last)?);
    let open = out.get(s..content_start as usize)?;
    let close = out.get(content_end as usize..e)?;

    let raw = out.get(content_start as usize..content_end as usize)?;
    let had_lead = raw.starts_with([' ', '\t', '\n', '\r']);
    let had_trail = raw.ends_with([' ', '\t', '\n', '\r']);
    let collapsed = raw.split_whitespace().collect::<Vec<_>>().join(" ");

    // Components (`<Button>`, `<Foo.Bar>`, `<svelte:*>`) and block-display
    // elements are NOT whitespace-sensitive: boundary whitespace between the tag
    // and text is dropped entirely (`<Button> hi </Button>` → `<Button>hi</Button>`).
    // Known inline elements and unknown custom elements (`<span>`, `<my-widget>`)
    // keep a single edge space (the CSS whitespace model). Mirrors
    // prettier-plugin-svelte's inline-vs-block child whitespace handling.
    let trims_edge = trims_edge_whitespace(tag) || is_component_tag(tag);

    // Empty element (whitespace-only body): normalize whitespace between tags.
    //
    // Three distinct cases:
    //
    // 1. Block/component/slot (`trims_edge = true`): collapse to `<tag></tag>`
    //    regardless of whether the open tag wraps. These are not whitespace-
    //    sensitive so the body whitespace is dropped entirely.
    //      `<div>\n</div>` → `<div></div>`
    //      `<div\n  class="…"\n></div>` → `<div\n  class="…"\n></div>`
    //
    // 2. Non-block elements with an **inline** (non-wrapped) open tag: keep
    //    one edge space so the close tag doesn't touch the `>`.
    //      `<span>\n</span>` → `<span> </span>`
    //      `<button>\n</button>` → `<button> </button>`
    //      `<svg>\n</svg>` → `<svg> </svg>`
    //    oracle treats these as whitespace-sensitive — one space represents the
    //    boundary whitespace.
    //
    // 3. Non-block elements with a **wrapped** open tag: keep `>` and `</tag>`
    //    on separate lines. Return None so the already-formatted layout is used.
    //      `<button\n  onclick={…}\n>\n</button>` — stays as-is.
    if collapsed.is_empty() {
        if !trims_edge {
            if open.contains('\n') {
                // Case 3: wrapped open tag — leave as-is.
                return None;
            }
            // Case 2: inline open tag — insert one space between `>` and `</tag>`.
            let result = format!("{open} {close}");
            return (result != whole).then_some((start, end, result));
        }
        // Case 1: block/component/slot. When a wrapped open tag glued its `>` to
        // the last attribute line (`bracketSameLine` on a block-display element,
        // #1721), the close tag drops to its own line at the element indent
        // (`<div`\n`  …">`\n`</div>`) — so the inserted break must be preserved,
        // not collapsed away. The `>` is glued exactly when the open tag's last
        // line is not the dedented lone `>` (`…"`\n`></div>`, the default
        // `bracketSameLine: false` form) — in every other case (inline open tag,
        // or a wrapped open tag whose `>` dedented) the body whitespace is
        // dropped entirely.
        let bracket_glued = open.contains('\n')
            && open
                .rsplit('\n')
                .next()
                .is_some_and(|last| last.trim() != ">");
        if bracket_glued {
            let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
            let indent: String = out[line_start..s]
                .chars()
                .take_while(|c| *c == ' ' || *c == '\t')
                .collect();
            let result = format!("{open}\n{indent}{close}");
            return (result != whole).then_some((start, end, result));
        }
        let result = format!("{open}{close}");
        return (result != whole).then_some((start, end, result));
    }

    // One-line form.
    let mut one_line = String::with_capacity(whole.len());
    one_line.push_str(open);
    if !collapsed.is_empty() {
        let edge = !trims_edge; // inline-ish keeps an edge space
        if edge && had_lead {
            one_line.push(' ');
        }
        one_line.push_str(&collapsed);
        if edge && had_trail {
            one_line.push(' ');
        }
    }
    one_line.push_str(close);

    let column = current_column(out, start, tw);
    if !one_line.contains('\n') && column + one_line.visual_width(tw) <= line_width {
        return (one_line != whole).then_some((start, end, one_line));
    }

    // Doesn't fit on one line — break the content onto its own indented line(s).
    // Only when the element sits at the start of its line (so the indent prefix
    // is whitespace we can reuse) and has non-empty content.
    if collapsed.is_empty() {
        return None;
    }

    // A pure-inline element (CSS display `inline`: `<a>`, `<span>`, … — not
    // inline-block like `<button>`, not block) is whitespace-sensitive, so it
    // can't put its text on its own line. prettier instead uses the "hug" break:
    //   <a href="…"
    //     >content</a
    //   >
    // — the `>` glues to the content so no whitespace is injected. The open tag
    // must fit on one line and the `>content</tag` line must fit; otherwise this
    // needs attribute-wrapping / content fill we don't do here.
    //
    // The hug only applies when the content is directly adjacent to the open tag
    // (prettier's `shouldHugStart`: hug iff the first child does NOT start with
    // whitespace, i.e. `!had_lead`). `shouldHugEnd` is independent — trailing
    // whitespace on the content is harmless because `collapsed` already strips it.
    // When the content is separated from the open tag by whitespace
    // (`<button>\n  click me\n</button>`), prettier block-breaks instead, so fall
    // through to the block-break path below.
    // Hug eligibility is about whitespace-injection when the open tag wraps, not
    // about the one-line edge space: components hug like inline elements
    // (`<Message kind="info"\n  >text</Message\n>`), so use the inline predicate
    // here, not the component-inclusive `trims_edge`.
    if !trims_edge_whitespace(tag) && !had_lead {
        if !open.ends_with('>') {
            return None;
        }
        if open.contains('\n') {
            // Multi-line open tag (attributes wrapped): the open tag was produced
            // by `render_multi_line` with `hug_open=true`, so the `>` is already
            // glued to the last attribute line.  Check whether the last attribute
            // line + `>` + content + `</tag` fits within the print width.
            //
            // We find the last line of the open tag by locating the last `\n` in
            // `open`; that line starts right after the `\n`.
            //
            // For inline elements embedded in flowing text (e.g. `some text <A\n
            // href="…"\n class="…">word</A\n>`), we can't use the normal
            // line-start indent because the element is not at the start of its
            // line. Instead, derive `indent` from `close` (the whitespace before
            // the final `>` on the last line of the close tag) and `inner_indent`
            // from the attribute indent in `open`.
            let last_line_start = open.rfind('\n').map_or(0, |i| i + 1);
            let last_open_line = &open[last_line_start..]; // includes trailing `>`
            // Close-tag indent: whitespace between the last `\n` in close and the
            // final `>`.  For `</A\n    >` this is `    ` (4 spaces).
            let close_indent = close
                .rfind('\n')
                .map_or("", |nl| &close[nl + 1..close.len().saturating_sub(1)]);
            // Attribute-level indent: element indent + 2 spaces (same as the
            // single-line hug path). We derive it from `close_indent` rather
            // than the last open-tag line because the last line could be a
            // continuation of a multi-line attribute value (e.g. the RHS of an
            // `onclick={() =>\n  expr}` attribute), not the attribute keyword.
            let (indent_unit_tc, _) = indent_config(options);
            let inner_indent = format!("{close_indent}{indent_unit_tc}");
            // When `had_trail=true` (shouldHugEnd=false), the close tag should
            // stay on its own line (`\n{element_indent}</tag>`) rather than be
            // glued to the content as `</tag\n{close_indent}>`.  Skip both the
            // same-line and inner-indent hug paths in this branch and fall
            // through to the `shouldHugEnd=false` handling below.
            if had_trail {
                // `shouldHugEnd=false`: the close tag belongs on its own line at
                // the element indent level.  Preserve the current form or produce
                // `{open}{collapsed}\n{elem_indent}</{tag}>` without touching it.
                let line_start_inner = out[..s].rfind('\n').map_or(0, |i| i + 1);
                let elem_indent = out.get(line_start_inner..s).unwrap_or("");
                if elem_indent.bytes().all(|b| b == b' ' || b == b'\t') {
                    // shouldHugStart (we are in the `!had_lead` block) + multi-line
                    // open tag: the open `>` hugs the content on its own indented
                    // line (at the attribute indent), and the close tag
                    // (shouldHugEnd=false) sits on its own line at the element
                    // indent. This mirrors `build_element_doc`'s hug_start case
                    // (`indent([softline, group(['>', body])])`), whose softline
                    // breaks once the open tag wrapped. Previously the `>` was left
                    // glued to the last attribute (`disabled>Disabled button`).
                    let attr_indent = format!("{elem_indent}{indent_unit_tc}");
                    let onb = open[..open.len() - 1].trim_end();
                    let result = format!("{onb}\n{attr_indent}>{collapsed}\n{elem_indent}</{tag}>");
                    if result != whole {
                        return Some((start, end, result));
                    }
                }
                return None;
            }
            let last_line_width = last_open_line.visual_width(tw)
                + collapsed.visual_width(tw)
                + 2
                + tag.visual_width(tw);
            if last_line_width <= line_width {
                // Fits: keep the `>` glued to the last attribute line.
                let result = format!("{open}{collapsed}</{tag}\n{close_indent}>");
                return (result != whole).then_some((start, end, result));
            }
            // Doesn't fit on the last-attribute line: move `>` to a new line
            // at the attribute indent so the content starts on an indented line.
            // `open_no_bracket` may already end with `\n{inner_indent}` if the
            // markup pass placed `>` on its own line (`<P class="…"\n  >`). In
            // that case, just append `>` + content without adding another newline.
            let open_no_bracket = &open[..open.len() - 1];
            let already_indented = open_no_bracket.ends_with(&format!("\n{inner_indent}"));
            let prefix = if already_indented {
                // Trim the trailing `\n{inner_indent}` so we can reassemble cleanly.
                &open_no_bracket[..open_no_bracket.len() - 1 - inner_indent.len()]
            } else {
                open_no_bracket
            };
            let hug_width = inner_indent.visual_width(tw)
                + 1
                + collapsed.visual_width(tw)
                + 2
                + tag.visual_width(tw);
            if hug_width <= line_width {
                let hug = format!("{prefix}\n{inner_indent}>{collapsed}</{tag}\n{close_indent}>");
                return (hug != whole).then_some((start, end, hug));
            }
            // Content is too long for a single hug line — fill-wrap the text
            // across multiple lines at the inner indent level.
            // First line: `  >word1 word2…` (1 char for `>` reduces avail)
            // Continuation lines: `  word3 word4…`
            let first_avail = line_width
                .saturating_sub(inner_indent.visual_width(tw) + 1)
                .max(1);
            let cont_avail = line_width
                .saturating_sub(inner_indent.visual_width(tw))
                .max(1);
            let mut fill_lines: Vec<String> = Vec::new();
            let mut cur = String::new();
            let avail_for = |n: usize| if n == 0 { first_avail } else { cont_avail };
            for word in collapsed.split_whitespace() {
                if cur.is_empty() {
                    cur.push_str(word);
                } else if cur.visual_width(tw) + 1 + word.visual_width(tw)
                    <= avail_for(fill_lines.len())
                {
                    cur.push(' ');
                    cur.push_str(word);
                } else {
                    fill_lines.push(std::mem::take(&mut cur));
                    cur.push_str(word);
                }
            }
            if !cur.is_empty() {
                fill_lines.push(cur);
            }
            if fill_lines.is_empty() {
                return None;
            }
            let mut result = format!("{prefix}\n{inner_indent}>{}", fill_lines[0]);
            for line in &fill_lines[1..] {
                result.push('\n');
                result.push_str(&inner_indent);
                result.push_str(line);
            }
            let _ = write!(result, "</{tag}\n{close_indent}>");
            return (result != whole).then_some((start, end, result));
        }
        // Same-line hug for single-line open tags: only when the element is at
        // the start of its line (so `indent` / `inner_indent` are well-defined).
        let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
        let indent = out.get(line_start..s)?;
        if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
            // Element is inline inside text — single-line open tags with no
            // wrapping are handled by the outer formatter; nothing to fix here.
            return None;
        }
        let (indent_unit_tc, _) = indent_config(options);
        let inner_indent = format!("{indent}{indent_unit_tc}");
        // Same-line hug: `<a href="…">text</a\n>` — content stays on the open
        // tag's line. Try this first; only fall through to the inner-indent form
        // when the same-line layout overflows the print width.
        // `column` is the number of columns before the element (the indent), and
        // `open` does NOT include that leading indent — so the total line width
        // is `column + open.width() + collapsed.width() + 2 + tag.width()`.
        //
        // When the original content had trailing whitespace (`had_trail=true`),
        // prettier's group-fit check measures the content including that trailing
        // space (since `shouldHugEnd=false` means a space is injected before the
        // close tag). Add 1 extra column to match prettier's fit check so that
        // elements that just barely fit (e.g. 80 cols) without the space are
        // correctly detected as overflowing and use the inner-indent hug form.
        let trailing_edge_extra = usize::from(had_trail && !trims_edge_whitespace(tag));
        let same_line_width = column
            + open.visual_width(tw)
            + collapsed.visual_width(tw)
            + 2
            + tag.visual_width(tw)
            + trailing_edge_extra;
        if same_line_width <= line_width {
            let result = format!("{open}{collapsed}</{tag}\n{indent}>");
            return (result != whole).then_some((start, end, result));
        }
        // Inner-indent hug: open tag wraps so `>` moves to the next indented line
        // and content glues directly to it: `<a\n  href="…"\n  >text</a\n>`.
        let hug_width = inner_indent.visual_width(tw)
            + 1
            + collapsed.visual_width(tw)
            + 2
            + tag.visual_width(tw);
        if hug_width > line_width {
            // Content is too long even for the hug path (no single line fits).
            // Use Doc IR to express prettier's `hugStart && hugEnd` with a `Fill`
            // body — break the collapsed text across multiple lines at the inner
            // indent, keeping the `>` glued to the first content word and
            // `</tag\n>` glued to the last.
            //
            //   <Component attr="…"
            //     >word1 word2 long
            //     text word3</Component
            //   >
            if open.ends_with('>') && !open.contains('\n') {
                use crate::doc::Doc;
                let open_no_bracket = &open[..open.len() - 1];
                let open_doc = node
                    .and_then(|n| build_open_attr_doc(out, n, tag, true))
                    .unwrap_or_else(|| Doc::Text(open_no_bracket.to_string()));
                let words: Vec<&str> = collapsed.split_whitespace().collect();
                if !words.is_empty() {
                    // Build Fill([word1, Line, word2, Line, …, wordN])
                    let mut fill_parts: Vec<Doc> = Vec::with_capacity(words.len() * 2 - 1);
                    for (i, word) in words.iter().enumerate() {
                        if i > 0 {
                            fill_parts.push(Doc::Line);
                        }
                        fill_parts.push(Doc::Text(word.to_string()));
                    }
                    // prettier's `hugStart && hugEnd` doc shape:
                    //   group([
                    //     open_doc,
                    //     group(indent([softline, group([">", fill([…words…]), "</tag"])])),
                    //     softline,
                    //     ">",
                    //   ])
                    let inner = Doc::Group(vec![Doc::Concat(vec![
                        Doc::Text(">".to_string()),
                        Doc::Fill(fill_parts),
                        Doc::Text(format!("</{tag}")),
                    ])]);
                    let hugged = Doc::Group(vec![Doc::Indent(vec![Doc::Softline, inner])]);
                    let elem_doc = Doc::Group(vec![
                        open_doc,
                        hugged,
                        Doc::Softline,
                        Doc::Text(">".to_string()),
                    ]);
                    let (indent_unit, indent_width) = indent_config(options);
                    let base_level = if options.js.indent_style.is_tab() {
                        indent
                            .bytes()
                            .take_while(|&b| b == b' ' || b == b'\t')
                            .count()
                    } else {
                        indent.visual_width(tw) / indent_width
                    };
                    let printed = crate::doc::print(
                        &elem_doc,
                        line_width,
                        IndentUnit::new(indent_unit.as_str(), tw),
                        base_level,
                        column,
                    );
                    return (printed != whole).then_some((start, end, printed));
                }
            }
            return None;
        }
        let open_no_bracket = &open[..open.len() - 1];
        // When the original content had trailing whitespace (`had_trail=true`),
        // prettier uses `shouldHugEnd=false`: the close tag goes on its own line
        // at the element indent level (`\n{indent}</tag>`), not glued as
        // `</tag\n{indent}>`.  When `!had_trail` (`shouldHugEnd=true`), the close
        // tag is split across two lines: `</tag\n{indent}>`.
        let hug = if had_trail {
            format!("{open_no_bracket}\n{inner_indent}>{collapsed}\n{indent}</{tag}>")
        } else {
            format!("{open_no_bracket}\n{inner_indent}>{collapsed}</{tag}\n{indent}>")
        };
        return (hug != whole).then_some((start, end, hug));
    }

    // Block / inline-block: break the content onto its own line(s). Only when the
    // boundary whitespace is insignificant (content separated from the tags, or
    // a block/list-item element) so hugged inline text stays hugged (#798).
    if !((had_lead && had_trail) || trims_edge_whitespace(tag)) {
        return None;
    }
    // Element must be at the start of its line for the block-break to work.
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let (indent_unit_tc, _) = indent_config(options);
    let inner_indent = format!("{indent}{indent_unit_tc}");
    let avail = line_width
        .saturating_sub(inner_indent.visual_width(tw))
        .max(1);

    let mut broken = String::with_capacity(whole.len() + 8);
    broken.push_str(open);
    for line in fill(&collapsed, avail, tw) {
        broken.push('\n');
        broken.push_str(&inner_indent);
        broken.push_str(&line);
    }
    broken.push('\n');
    broken.push_str(indent);
    broken.push_str(close);

    (broken != whole).then_some((start, end, broken))
}
