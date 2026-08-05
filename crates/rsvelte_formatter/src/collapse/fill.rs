use super::*;

/// Whether `node` may sit inside a fragment-level inline prose run that the run
/// fill reflows. Text, mustaches/html-tags, and ONE-LINE inline elements
/// (`<input/>`, `<br/>`, an empty `<span/>`, or `<code>foo</code>` whose whole
/// rendering is currently on one line) qualify. A one-line inline element is safe
/// to fold into the run's single edit because recursing into it produces no edit
/// (its content already fits), so the two edits can't overlap. Block elements,
/// comments, components, and multi-line elements are run boundaries.
pub(super) fn is_run_member(out: &str, node: &TemplateNode) -> bool {
    match node {
        TemplateNode::Text(_) | TemplateNode::ExpressionTag(_) | TemplateNode::HtmlTag(_) => true,
        TemplateNode::RegularElement(e) => {
            if is_block_display(e.name.as_str()) || is_whitespace_preserving(e.name.as_str()) {
                return false;
            }
            // A multi-line span has already broken (attrs / content) — leave it as
            // a boundary so we don't try to re-inline it (and so recursion, which
            // may still edit it, owns its layout).
            out.get(node_start(node) as usize..node_end(node) as usize)
                .is_some_and(|span| !span.contains('\n'))
        }
        // `<slot>` is parsed as SlotElement (not RegularElement). It is not a
        // block or whitespace-preserving element, so it participates in inline
        // runs like any other inline non-block element: a single-line slot is a
        // run member, a multi-line one is not.
        TemplateNode::SlotElement(_) => out
            .get(node_start(node) as usize..node_end(node) as usize)
            .is_some_and(|span| !span.contains('\n')),
        TemplateNode::Component(_) => {
            // Single-line components (self-closing or with short inline content)
            // participate in inline prose runs — e.g. `text <Icon /> more text`.
            // A multi-line component has already had its open tag wrapped and is
            // left as a run boundary so its own layout owns it.
            // A component that stands ALONE on its line (only whitespace both
            // before AND after it on that line) is laid out block-like — it must
            // NOT join a prose run, because the run-fill pass treats it as a flat
            // atom and marks it "consumed", preventing the element-level hug/fill
            // passes from reformatting it (e.g. a top-level `<Heading>…</Heading>`).
            // But a self-closing inline component immediately followed by text on
            // the same line (`<Icon />Add new user`) is genuine inline prose and
            // stays a run member so the trailing text fill-wraps with it.
            let s = node_start(node) as usize;
            let e = node_end(node) as usize;
            let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
            let before = &out[line_start..s];
            if before.bytes().all(|b| b == b' ' || b == b'\t') {
                let line_end = out[e..].find('\n').map_or(out.len(), |i| e + i);
                let after = &out[e..line_end];
                if after.bytes().all(|b| b == b' ' || b == b'\t') {
                    // Alone on its line — not an inline run member.
                    return false;
                }
            }
            out.get(s..e).is_some_and(|span| !span.contains('\n'))
        }
        _ => false,
    }
}

/// Reflow a fragment's inline prose runs (text words interspersed with one-line
/// inline elements) that overflow — e.g. a top-level `<input/> °C =\n<input/> °F`
/// run between a comment and `<style>`, or `<p>` body text with inline `<code>`
/// atoms. Only fires for a PROPER sub-run (the fragment also has non-inline
/// siblings); a whole-element inline body is handled by `try_fill_mixed` at the
/// element level instead. Each run that gets an edit also pushes its covered byte
/// span into `consumed` so `collect` skips recursing into the elements inside it
/// (their layout is now owned by the run edit — recursing would risk an
/// overlapping edit).
pub(super) fn fill_inline_runs(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    is_block_body: bool,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
    consumed: &mut Vec<(u32, u32)>,
) {
    let nodes = &fragment.nodes;
    // When all nodes are run members (text + inline elements only), the fragment
    // IS one big prose run. For block bodies ({#if}/{#each}/…) there is no
    // parent element-level fill to handle it — the indent pass may have broken
    // things onto separate lines that should be reflowed here. For element
    // children the element-level fill (`try_fill_mixed`) handles the whole
    // fragment before recursing, but if it returned None (e.g., the element is
    // already well-laid-out) we still try reflowing as one run so broken
    // sub-runs (e.g., `<strong>x</strong>\n  {y}` split by the indent pass
    // inside an `{#if}` block body) can collapse back to `<strong>x</strong> {y}`.
    //
    // `allow_elem_expr_collapse` controls whether a ws-only single-newline
    // separator after a phrasing-content inline element can be treated as a
    // soft break (Doc::Line) so `<strong>x</strong>\n{y}` collapses to one
    // line when it fits.  This is only permitted for FLOW BLOCK bodies
    // ({#if}/{#each}/…) whose run covers all non-whitespace content — NOT for
    // element bodies (`<P>`) where prettier preserves the line break regardless.
    let has_non_run_block_siblings = nodes.iter().any(|n| {
        !is_run_member(out, n)
            && !matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref()))
    });
    let allow_elem_expr_collapse = is_block_body && !has_non_run_block_siblings;

    let mut i = 0;
    while i < nodes.len() {
        // A `<!-- prettier-ignore -->`d node must never join a run (it — and its
        // whole subtree — stays verbatim): treat it as a run boundary so it's
        // skipped here and left for `collect`'s own per-node guard. The one
        // exception is an ignore comment glued to an inline node mid-prose: that
        // pair joins the run as a single verbatim atom.
        if inline_ignore_atom(out, nodes, i).is_none()
            && (crate::prettier_ignore::preceded_by_prettier_ignore(nodes, i)
                || !is_run_member(out, &nodes[i]))
        {
            i += 1;
            continue;
        }
        let mut j = i;
        while j < nodes.len() {
            if inline_ignore_atom(out, nodes, j).is_some() {
                j += 2;
                continue;
            }
            if !is_run_member(out, &nodes[j])
                || crate::prettier_ignore::preceded_by_prettier_ignore(nodes, j)
            {
                break;
            }
            j += 1;
        }
        if let Some(edit) = try_fill_run(
            out,
            &nodes[i..j],
            line_width,
            allow_elem_expr_collapse,
            options,
        ) {
            consumed.push((edit.0, edit.1));
            edits.push(edit);
        }
        i = j;
    }
}

/// Reflow one inline-prose run (a node slice) in place when it overflows.
///
/// `allow_elem_expr_collapse` — when true, a whitespace-only single-newline
/// separator that immediately follows a content inline element (e.g.
/// `<strong>x</strong>\n  {y}`) is treated as a soft break (Doc::Line) so the
/// run can collapse to one line in flat mode.  Pass `true` when the run
/// covers ALL non-whitespace content of its parent fragment (no block siblings
/// like `{#if}`/`{#each}` outside the run).
pub(super) fn try_fill_run(
    out: &str,
    run: &[TemplateNode],
    line_width: usize,
    allow_elem_expr_collapse: bool,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let tw = tab_width(options);
    let (indent_unit, indent_width) = indent_config(options);
    // Trim whitespace-only edge text nodes — the surrounding layout owns them.
    let mut lo = 0;
    let mut hi = run.len();
    while lo < hi
        && matches!(&run[lo], TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref()))
    {
        lo += 1;
    }
    while hi > lo
        && matches!(&run[hi - 1], TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref()))
    {
        hi -= 1;
    }
    let run = &run[lo..hi];
    // Need prose: at least one text word (a Text node with non-whitespace content)
    // or an element with content combined with at least one other non-whitespace
    // node (so a two-node run like `<strong>x</strong> {y}` is reflowed but a
    // single standalone element is left to the element-level pass).
    //
    // A run may be a pure-text paragraph (`<p>` body text up to a multi-line
    // `<svg>` sibling), text interspersed with childless inline elements, or
    // an inline element followed by expression tags
    // (`<strong>x</strong> {y}` — the indent pass may break the space before
    // `{y}` to a newline, which the fill should restore when it fits).
    let has_text_word = run
        .iter()
        .any(|n| matches!(n, TemplateNode::Text(t) if t.data.split_whitespace().next().is_some()));
    // Count non-whitespace-only nodes in the run.
    let non_ws_count = run
        .iter()
        .filter(|n| !matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())))
        .count();
    let has_element_content = non_ws_count > 1
        && run.iter().any(|n| match n {
            TemplateNode::RegularElement(e) => !e.fragment.nodes.is_empty(),
            TemplateNode::Component(c) => !c.fragment.nodes.is_empty(),
            TemplateNode::SlotElement(s) => !s.fragment.nodes.is_empty(),
            _ => false,
        });
    if !has_text_word && !has_element_content {
        return None;
    }
    let first = run.first()?;
    let last = run.last()?;
    // The edit covers content only; an edge text node's leading/trailing
    // whitespace is the separator to the surrounding (non-run) siblings and must
    // survive (e.g. the blank line before a following `<style>`).
    //
    // Detect if the first text node has leading whitespace (before the current `s`
    // trimming). This is used below to produce prettier's "inverted" fill structure
    // ([Line/Hardline, word, Line, word, ...]) which gives "last-word overflow
    // tolerance" — the final word in a pair stays on the current line as text
    // even when the pair would overflow, matching prettier-plugin-svelte's
    // `splitTextToDocs` output which always starts with a separator when the text
    // begins with whitespace.
    let first_text_orig_start = match first {
        TemplateNode::Text(t) => Some(t.start as usize),
        _ => None,
    };
    let mut s = node_start(first) as usize;
    let first_text_leading_ws_kind: Option<bool> = if let TemplateNode::Text(t) = first {
        let d = out.get(t.start as usize..t.end as usize)?;
        let leading_len = d.len() - d.trim_start().len();
        if leading_len > 0 {
            // true  = starts with SINGLE newline + indent, e.g. "\n    word"
            //         (Case B: prettier does NOT trim → inverted fill with hardline prefix)
            // false = starts with spaces only, e.g. " word"
            //         (Case A: inverted fill with line prefix)
            // None  = starts with double newline "\n\n..." — prettier uses double
            //         hardline prefix which falls back to normal fill; skip both cases.
            s += leading_len;
            if d.starts_with("\n\n") {
                // Double-newline: prettier prepends two hardlines making the fill
                // normal word-first after the hardlines — don't apply inverted logic.
                None
            } else {
                Some(d.starts_with('\n'))
            }
        } else {
            None
        }
    } else {
        None
    };
    // For Case A (space-only leading whitespace): include the leading space in the
    // edit region by moving s back by 1. This ensures the fill output (which starts
    // with a space from the inverted leading Line) replaces the space rather than
    // doubling it. Only include ONE space (the char immediately before s).
    if matches!(first_text_leading_ws_kind, Some(false)) {
        // Move s back by 1 to include the single leading space in the edit range.
        // This keeps the indent computation correct (the space is already counted
        // in indent_cols since s was advanced past it).
        if s > 0 && out.as_bytes().get(s - 1) == Some(&b' ') {
            s -= 1;
        }
    }

    let mut e = node_end(last) as usize;
    if let TemplateNode::Text(t) = last {
        let d = out.get(t.start as usize..t.end as usize)?;
        e -= d.len() - d.trim_end().len();
    }
    let whole = out.get(s..e)?;

    // The run must start at the beginning of its line so its column = that line's
    // indentation (all whitespace); otherwise we can't safely reflow it (a
    // non-whitespace prefix means the run is mid-line and we can't compute
    // base_level for multi-line reflow).
    //
    // Exception 1: when the prefix ends with `>` (text immediately follows a close
    // tag on the same line with no space), we allow flat-form collapse. If the whole
    // run fits on one line the edit is safe regardless of what precedes it.
    //
    // Exception 2: when the prefix ends with `> ` (close tag + trailing space), e.g.
    // `  </Span> tools, so…` or `    > for Flowbite…`. In this case we can derive
    // `base_level` from the leading-whitespace portion of the indent (before the `>`),
    // and the visual column where the text begins is `indent_cols`. This allows both
    // flat-form collapse AND multi-line reflow for text that follows a close tag.
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    let non_ws_prefix = !indent.is_empty() && !indent.bytes().all(|b| b == b' ' || b == b'\t');
    // A "close-tag prefix" ends with `>` or `> ` — we can safely derive base_level
    // from the leading whitespace (everything before the `>` or `</tag>` tail).
    let is_close_tag_prefix = non_ws_prefix && (indent.ends_with('>') || indent.ends_with("> "));
    if non_ws_prefix && !is_close_tag_prefix {
        return None;
    }
    let indent_cols = indent.visual_width(tw);
    // For close-tag prefixes, derive base_level from just the whitespace bytes
    // before the `>` or `> ` tail, not from indent_cols (which includes the tag
    // characters). This ensures continuation lines align with the parent element's
    // indentation rather than the visual column of the close tag.
    let base_level = if is_close_tag_prefix {
        let ws_len = indent
            .bytes()
            .take_while(|&b| b == b' ' || b == b'\t')
            .count();
        if options.js.indent_style.is_tab() {
            ws_len
        } else {
            ws_len / indent_width
        }
    } else if options.js.indent_style.is_tab() {
        indent
            .bytes()
            .take_while(|&b| b == b' ' || b == b'\t')
            .count()
    } else {
        indent_cols / indent_width
    };
    // Use word-first fill format only when the source `whole` is already
    // multi-line (contains a newline). For single-line sources the
    // separator-first format is correct: prettier's fill keeps the last word
    // on the same line via the `ps.len()==2` path even if it slightly
    // overflows (last-word overflow tolerance). For multi-line sources the
    // separator-first format can place words at incorrect break points (e.g.
    // `<strong>Root-cause analysis</strong> for production issues with
    // deployment context.` where separator-first keeps "deployment" on the
    // overflowing line instead of breaking before it). Word-first format
    // correctly breaks at the first word that doesn't fit, so multi-line
    // sources get the right reflowed layout.
    let use_word_first = whole.contains('\n');
    let content_doc =
        build_children_doc_nodes(out, run, allow_elem_expr_collapse, use_word_first, None)?;
    // Prepend a leading Line/Hardline to the fill doc to produce prettier's
    // "inverted" fill structure when the first text node had leading whitespace.
    // This matches prettier-plugin-svelte's `splitTextToDocs` which places a `line`
    // (or `hardline`) before the first word when the text starts with whitespace,
    // giving "last-word overflow tolerance": when a pair [Line, word] doesn't fit
    // but Line alone fits, the word stays on the current line as text (it is the
    // whitespace item in Break mode, which for Doc::Text still prints inline).
    //
    // Case A (starts with spaces only): prepend Doc::Line to get prettier's
    // "inverted" fill structure `[Line, word, Line, word, ...]`.
    //
    // Case B (starts with newline, single-line content): prepend Doc::Hardline.
    // This mirrors `splitTextToDocs` when the text is NOT trimmed by prettier
    // (e.g., text between two block siblings like `<h3>` + text + `<span>`).
    // When the text is single-line (no `\n` in `whole`), prettier's fill
    // does not trim and uses the inverted structure with hardline prefix.
    // When the text is multi-line (`use_word_first=true`), prettier HAS trimmed
    // the leading whitespace (first-child path) and uses normal fill — do not
    // prepend.
    // Case B: only applies when the text node is preceded by a CLOSE TAG
    // (e.g. `</h3>\n    text`). In this situation prettier's `handleTextChild`
    // does NOT call `trimTextNodeLeft` (because the text starts with a linebreak)
    // so `splitTextToDocs` sees the raw text and produces the inverted structure
    // `[hardline, word, line, word, ...]`. When the text is the FIRST child of its
    // parent element, the element printer DOES call `trimTextNodeLeft`, resulting in
    // a normal fill structure — so Case B must NOT apply there.
    let first_text_follows_close_tag =
        first_text_orig_start.is_some_and(|ts| text_preceded_by_close_tag(out, ts));
    let content_doc = match first_text_leading_ws_kind {
        Some(false) => prepend_leading_to_fill(content_doc, crate::doc::Doc::Line),
        Some(true) if first_text_follows_close_tag => {
            prepend_leading_to_fill(content_doc, crate::doc::Doc::Hardline)
        }
        _ => content_doc,
    };
    // Flat width (a hardline forces multi-line).
    let flat = crate::doc::print_flat(
        &content_doc,
        1_000_000,
        IndentUnit::new(indent_unit.as_str(), tw),
        base_level,
        0,
    );
    if !flat.contains('\n') && indent_cols + flat.visual_width(tw) <= line_width {
        // Fits on one line — collapse to the flat form. The input run may itself
        // be multi-line (e.g. root-level prose written one word per line), and
        // prettier reflows prose that fits onto a single line, so we must emit the
        // flat text rather than leaving the broken input untouched.
        return (flat != whole).then_some((s as u32, e as u32, flat));
    }
    // If the prefix was non-whitespace and NOT a recognized close-tag prefix
    // (`>` or `> `), we cannot safely compute base_level for multi-line reflow.
    if non_ws_prefix && !is_close_tag_prefix {
        return None;
    }
    let printed_raw = crate::doc::print(
        &content_doc,
        line_width,
        IndentUnit::new(indent_unit.as_str(), tw),
        base_level,
        indent_cols,
    );
    // For Case B (hardline-prefixed inverted fill), the printed output begins with
    // "\n<indent>" from the Hardline. Strip this prefix so the edit replaces only
    // the word content starting at `s` (the existing "\n<indent>" before `s` in the
    // source stays in place).
    let printed = if matches!(first_text_leading_ws_kind, Some(true))
        && first_text_follows_close_tag
        && printed_raw.starts_with('\n')
    {
        let indent_str = indent_unit.repeat(base_level);
        printed_raw
            .strip_prefix('\n')
            .and_then(|r| r.strip_prefix(indent_str.as_str()))
            .unwrap_or(&printed_raw)
            .to_string()
    } else {
        printed_raw
    };
    // If the doc had no break points (e.g. two adjacent inline-block elements
    // like `<button>A</button><button>B</button>` with no text between them),
    // `print` produces the same flat single-line string regardless of
    // `line_width`. Guard against returning an edit that merges overflow onto
    // one line — if the printed form contains no newline and still overflows,
    // the collapse has no useful layout to offer; return None so the
    // element-level passes (try_collapse / try_hug_mixed) own the elements
    // individually.
    if !printed.contains('\n') && indent_cols + printed.visual_width(tw) > line_width {
        return None;
    }
    (printed != whole).then_some((s as u32, e as u32, printed))
}

/// Greedy word-wrap `text` into lines no wider than `width` (each line keeps at
/// least one word). Mirrors prettier's fill for inline text content.
pub(super) fn fill(text: &str, width: usize, tw: usize) -> Vec<String> {
    let mut lines = Vec::new();
    let mut cur = String::new();
    for word in text.split(' ').filter(|w| !w.is_empty()) {
        if cur.is_empty() {
            cur.push_str(word);
        } else if cur.visual_width(tw) + 1 + word.visual_width(tw) <= width {
            cur.push(' ');
            cur.push_str(word);
        } else {
            lines.push(std::mem::take(&mut cur));
            cur.push_str(word);
        }
    }
    if !cur.is_empty() {
        lines.push(cur);
    }
    if lines.is_empty() {
        lines.push(String::new());
    }
    lines
}

/// Narrow mixed-inline fill: when an element with inline content (text +
/// expression tags / inline elements) is currently on ONE line but overflows
/// printWidth, break its content onto its own indented line(s), greedily packed
/// (prettier fill). Currently-multiline mixed content is left to the
/// whitespace-sensitive indent pass — only the clearly-failing one-line overflow
/// is touched, so passing layouts aren't disturbed.
pub(super) fn try_fill_mixed(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let tw = tab_width(options);
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    // Must be mixed (at least one non-text child) and entirely inline.
    let mut has_non_text = false;
    let mut ignored_idx = None;
    for (i, n) in fragment.nodes.iter().enumerate() {
        if matches!(n, TemplateNode::Text(_)) {
            continue;
        }
        has_non_text = true;
        // An ignore comment glued to an inline node is one verbatim atom of the
        // prose, so the fill flows across it; any OTHER comment sits on its own
        // line(s) — never fill it inline with the surrounding prose, leave the
        // whole fragment to the indent pass (which keeps it on its own line).
        if inline_ignore_atom(out, &fragment.nodes, i).is_some() {
            ignored_idx = Some(i + 1);
            continue;
        }
        if ignored_idx == Some(i) {
            continue;
        }
        if matches!(n, TemplateNode::Comment(_)) || !is_inline_node(n) {
            return None;
        }
    }
    if !has_non_text {
        return None; // pure text is handled by try_collapse
    }
    let content_start = node_start(fragment.nodes.first()?) as usize;
    let content_end = node_end(fragment.nodes.last()?) as usize;
    let open = out.get(s..content_start)?;
    let close = out.get(content_end..e)?;
    if open.contains('\n') {
        return None;
    }
    let raw = out.get(content_start..content_end)?;
    let had_lead = raw.starts_with([' ', '\t', '\r', '\n']);
    let had_trail = raw.ends_with([' ', '\t', '\r', '\n']);
    // Break only when the boundary whitespace is insignificant (content
    // separated from the tags, or a block/list-item element) so hugged inline
    // content stays hugged.
    if !((had_lead && had_trail) || is_block_display(tag)) {
        return None;
    }

    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let (indent_unit, indent_width) = indent_config(options);
    let inner_indent = format!("{indent}{indent_unit}");

    // Build the prettier content doc (a Concat of per-text-node fills with the
    // inline elements as hug groups in between — a port of prettier-plugin-svelte's
    // `printChildren`) and print it. This reproduces the prose fill + in-place
    // inline-element hug-break exactly. Options are threaded so a breakable
    // content/render tag (`{call(…)}`) participates in the fill as a
    // `group([RawExpr])` and glues the following word to its closing `)}`.
    let content_doc = build_children_doc_nodes(out, &fragment.nodes, false, false, Some(options))?;
    let base_level = if options.js.indent_style.is_tab() {
        inner_indent
            .bytes()
            .take_while(|&b| b == b' ' || b == b'\t')
            .count()
    } else {
        inner_indent.visual_width(tw) / indent_width
    };

    // Decide flat-vs-break from the element's *flat* width, not the laid-out
    // result — the content carries bare `line` separators (between mustaches /
    // atoms) that would always break when printed in break mode. Render the
    // content all-flat (a huge width) to measure: a `hardline` (a source blank
    // line) still forces a newline, so flat content with a `\n` is inherently
    // multi-line and must break.
    let flat = crate::doc::print_flat(
        &content_doc,
        1_000_000,
        IndentUnit::new(indent_unit.as_str(), tw),
        base_level,
        0,
    );
    let column = current_column(out, start, tw);

    // A non-text child that is already multi-line in the output forces the content
    // to break: the fill cannot keep that child on one line, so its surrounding
    // separators must break too (e.g. layercake AxisY's `<input … /> <span>…</span>`
    // where the `<input>`'s attributes wrapped). Treat this like a surviving
    // hardline in the flat render so the break path runs instead of bailing.
    let has_multiline_child = fragment.nodes.iter().any(|n| {
        !matches!(n, TemplateNode::Text(_))
            && out
                .get(node_start(n) as usize..node_end(n) as usize)
                .is_some_and(|s| s.contains('\n'))
    });

    // Prose content (text words interspersed with tags/elements) is always
    // re-flowed. Content made of only elements / expressions is re-flowed ONLY
    // when the source forces a break (a `hardline` survives the flat render — a
    // source blank line or a newline between two non-text nodes). Otherwise such
    // content stays on one line / is hugged, so leave it to the hug / indent
    // passes (prettier doesn't prose-fill space-separated mustaches that fit).
    let has_text_word = fragment
        .nodes
        .iter()
        .any(|n| matches!(n, TemplateNode::Text(t) if t.data.split_whitespace().next().is_some()));
    if !has_text_word && !flat.contains('\n') && !has_multiline_child {
        // For block-display elements that are ALREADY on one source line but have
        // leading/trailing SPACE (not newline) boundary whitespace, collapse to
        // one line and strip the boundary whitespace — prettier's block element
        // trimming behavior.
        // E.g. `<p> {@html raw1} {@html raw2} </p>` → `<p>{@html raw1} {@html raw2}</p>`.
        // Multi-line source (boundary whitespace is newline + indent) is left alone —
        // the indent pass owns those elements.
        if is_block_display(tag) && (had_lead || had_trail) && !raw.contains('\n') {
            let element_one_line =
                column + open.visual_width(tw) + flat.visual_width(tw) + close.visual_width(tw);
            if element_one_line <= line_width {
                let one_line = format!("{open}{flat}{close}");
                return (one_line != whole).then_some((start, end, one_line));
            }
        }
        // For a block-display element with multiple inline children (expression
        // tags separated by space text nodes, e.g. `<p>{a} {b} {c}…</p>`) that
        // overflows 80 cols: fall through to the doc-print break path so each
        // child lands on its own indented line. A single child is handled more
        // precisely by `try_break_content_tag_block` (which also reformats the
        // inner expression), so gate on >1 meaningful child.
        let non_ws_child_count = fragment
            .nodes
            .iter()
            .filter(
                |n| !matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())),
            )
            .count();
        let element_one_line =
            column + open.visual_width(tw) + flat.visual_width(tw) + close.visual_width(tw);
        if is_block_display(tag) && non_ws_child_count > 1 && element_one_line > line_width {
            // Fall through to the doc-print break path below.
        } else {
            return None;
        }
    }

    if !flat.contains('\n') && !has_multiline_child {
        let element_one_line =
            column + open.visual_width(tw) + flat.visual_width(tw) + close.visual_width(tw);
        // A block element (or overflowing component with prose content) puts its
        // content on its own line; an inline HTML element would instead hug, so
        // leave those. Components with block-like (newline-bounded) content that
        // overflow are also reflowed here — they are gated above by
        // `fragment_has_prose_word` and `had_lead && had_trail`.
        if element_one_line <= line_width || (!is_block_display(tag) && !is_component_tag(tag)) {
            // Even when the element fits on one line, if it's a block-display
            // element with leading/trailing space boundary whitespace (but NOT
            // newline-separated — that's indented multi-line content), collapse
            // to the space-trimmed one-line form.
            // E.g. `<p> {a} {b} : {c} : </p>` → `<p>{a} {b} : {c} :</p>`.
            if is_block_display(tag)
                && (had_lead || had_trail)
                && !raw.contains('\n')
                && element_one_line <= line_width
            {
                let one_line = format!("{open}{flat}{close}");
                return (one_line != whole).then_some((start, end, one_line));
            }
            return None;
        }
    }
    let mut printed = crate::doc::print(
        &content_doc,
        line_width,
        IndentUnit::new(indent_unit.as_str(), tw),
        base_level,
        inner_indent.visual_width(tw),
    );

    // Post-pass: a trailing content mustache `{call(...)}` that is glued to the
    // preceding content (no break point before it, e.g. `…:{pad(x)}`) can't move
    // to its own line, so when it overflows it must wrap its own call args. The
    // doc fill treats it as one atom, so re-format it here at its actual column.
    if printed.lines().count() <= 1
        && let Some(last) = fragment.nodes.last()
        && matches!(last, TemplateNode::ExpressionTag(_))
    {
        let mspan = out.get(node_start(last) as usize..node_end(last) as usize)?;
        let glued_after_nonspace = printed
            .strip_suffix(mspan)
            .and_then(|p| p.chars().next_back())
            .is_some_and(|c| !c.is_whitespace());
        let inner = mspan
            .strip_prefix('{')
            .and_then(|s| s.strip_suffix('}'))
            .map(str::trim)
            .unwrap_or("");
        let mcol = inner_indent.visual_width(tw)
            + printed
                .visual_width(tw)
                .saturating_sub(mspan.visual_width(tw));
        // Only a call / member chain (not an object / array / arrow literal) wraps
        // by breaking its own internals; leave those to other paths.
        let wrappable =
            !inner.is_empty() && !inner.contains("=>") && !inner.starts_with(['{', '[']);
        if glued_after_nonspace && wrappable && mcol + mspan.visual_width(tw) > line_width {
            let w = line_width.saturating_sub(mcol + 2); // `{` + `}`
            if let Ok(wrapped) = crate::expression::reformat_content_at_width(
                inner,
                options,
                w,
                inner_indent.visual_width(tw),
            ) && wrapped.contains('\n')
            {
                let head = &printed[..printed.len() - mspan.len()];
                printed = format!("{head}{{{wrapped}}}");
            }
        }
    }

    let broken = format!("{open}\n{inner_indent}{printed}\n{indent}{close}");
    (broken != whole).then_some((start, end, broken))
}
