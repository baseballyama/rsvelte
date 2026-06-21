//! Collapse pure-text elements onto one line when they fit.
//!
//! prettier-plugin-svelte reflows an element whose content is only text onto a
//! single line if the result fits within `printWidth` — e.g. a `<button>` or
//! `<p>` whose body sits on its own indented line in the source collapses to
//! `<button> click me! </button>` / `<p>hello</p>`. Whether the leading/trailing
//! whitespace survives as a single space depends on the element's CSS display:
//! block / list-item elements trim it, everything else (inline, inline-block,
//! table-cell, …) keeps one space.
//!
//! This runs as a post-pass over the already-formatted output (re-parsed so node
//! offsets and widths are exact). Elements with tag/expression/block children
//! are left to the whitespace-sensitive indent pass — only pure-text content is
//! reflowed here. Long text that would overflow stays multi-line (fill wrapping
//! is handled upstream by leaving the source breaks).

use rsvelte_core::ast::template::{Fragment, TemplateNode};
use rsvelte_core::{ParseOptions, parse};
use unicode_width::UnicodeWidthStr;

use crate::error::FormatError;
use crate::options::FormatOptions;

pub(crate) fn collapse_pure_text_elements(
    out: &str,
    options: &FormatOptions,
) -> Result<String, FormatError> {
    // Collapse is a best-effort post-pass over the already-formatted output. If
    // that output can't be re-parsed, skip collapse and return it as-is rather
    // than failing the whole format — the JS formatter can legitimately emit
    // markup that rsvelte's (Svelte-faithful) parser rejects but the oxfmt oracle
    // accepts, e.g. stripping the parens off `{(/regex/).test(x)}` to a `{/…}`
    // expression that looks like a block close.
    // Re-parse the formatted output in the same dialect the document was formatted
    // in. A TS document (incl. one that reached TS via the formatter's force-TS
    // fallback) emits TS, so a JS-only re-parse would fail and silently skip
    // collapse; forcing TS here keeps collapse working for those files.
    let parse_opts = ParseOptions {
        force_typescript: options.typescript,
        ..ParseOptions::default()
    };
    let Ok(root0) = parse(out, parse_opts) else {
        return Ok(out.to_string());
    };
    let line_width = options.js.line_width.value() as usize;

    // Pass 0: convert `\n\t+>` to `\n{n*iw}>` inside `<pre>`/`<textarea>` elements
    // that have no block content (code-viewer pattern). prettier-plugin-svelte
    // converts source tab-indented `>` markers to space-indented form. Running this
    // BEFORE the collapse passes ensures subsequent passes (fill-mixed, hug, etc.)
    // see the final space layout and can apply line-width-aware wrapping.
    let (result0_str, tree0) =
        if (out.contains("<pre") || out.contains("<textarea")) && out.contains('\t') {
            let iw = options.js.indent_width.value() as usize;
            let mut edits0: Vec<(u32, u32, String)> = Vec::new();
            collect_pre_tab_gt_conversions(out, &root0.fragment, iw, &mut edits0);
            if !edits0.is_empty() {
                let s = apply_edits(out, edits0);
                match parse(&s, parse_opts) {
                    Ok(t) => (s, t),
                    Err(_) => (out.to_string(), root0),
                }
            } else {
                (out.to_string(), root0)
            }
        } else {
            (out.to_string(), root0)
        };
    // Pass 0.5: wrap overflowing lines inside `<pre>`/`<textarea>` that have no
    // block content but have space-indented `>` lines after pass 0. This handles
    // the case where a source line like `\t\t\t\t\t\t><span>long content</span>,</span`
    // becomes > 80 chars after tab→space conversion. We wrap at the rightmost tag
    // `>` position that keeps the first part within `line_width`.
    let (result05_str, tree05) =
        if result0_str.contains("<pre") || result0_str.contains("<textarea") {
            let mut edits05: Vec<(u32, u32, String)> = Vec::new();
            collect_pre_space_gt_wraps(&result0_str, &tree0.fragment, line_width, &mut edits05);
            if !edits05.is_empty() {
                let s = apply_edits(&result0_str, edits05);
                match parse(&s, parse_opts) {
                    Ok(t) => (s, t),
                    Err(_) => (result0_str, tree0),
                }
            } else {
                (result0_str, tree0)
            }
        } else {
            (result0_str, tree0)
        };
    // Pass 0.75: collapse pure-text elements inside `<pre>`/`<textarea>` with
    // space-indented `>` lines. After pass 0.5 wraps overflowing lines, some
    // short `<span>` elements may be split across two lines (e.g. `<span\n>)</span>`);
    // collapse them to a single line if they fit.
    let (result075_str, tree075) =
        if result05_str.contains("<pre") || result05_str.contains("<textarea") {
            let mut edits075: Vec<(u32, u32, String)> = Vec::new();
            collect_pre_space_gt_pure_text_collapses(
                &result05_str,
                &tree05.fragment,
                line_width,
                &mut edits075,
            );
            if !edits075.is_empty() {
                let s = apply_edits(&result05_str, edits075);
                match parse(&s, parse_opts) {
                    Ok(t) => (s, t),
                    Err(_) => (result05_str, tree05),
                }
            } else {
                (result05_str, tree05)
            }
        } else {
            (result05_str, tree05)
        };
    let result075: &str = &result075_str;

    // `tree` always reflects `result`. Each pass re-parses ONLY after it actually
    // edits the text — a pass that makes no edits leaves the string (and thus its
    // AST) unchanged, so the next pass reuses the same tree instead of paying for
    // a redundant full re-parse. The re-parse is the dominant cost of this whole
    // post-pass, so skipping the no-op ones keeps the common case to a single
    // extra parse (or zero, when nothing collapses).
    let mut edits: Vec<(u32, u32, String)> = Vec::new();
    collect(
        result075,
        &tree075.fragment,
        line_width,
        false,
        options,
        &mut edits,
    );
    let mut result = result075_str;
    let mut tree = tree075;
    if !edits.is_empty() {
        result = apply_edits(&result, edits);
        let Ok(t) = parse(&result, parse_opts) else {
            return Ok(result);
        };
        tree = t;
    }

    // 1.5-th pass: run a targeted `try_fill_mixed` sweep on block elements whose
    // mixed inline children were just collapsed by the first pass. Example: a
    // `<div>` containing `A\n  B\n  <span>\n  C\n  </span>\n  E\n  F` could not
    // be prose-reflowed in pass 1 because the `<span>` was still multi-line at
    // that point. After the span's collapse edit the div's content is now
    // single-line elements surrounded by multi-line text, so a targeted second
    // fill-mixed sweep can reflow it to `A B\n  <span> C D </span>\n  E F`.
    // This pass intentionally skips try_collapse / try_hug_mixed so it doesn't
    // disturb elements that were already correctly hugged by pass 1.
    let mut edits1b: Vec<(u32, u32, String)> = Vec::new();
    collect_fill_mixed_only(&result, &tree.fragment, line_width, options, &mut edits1b);
    if !edits1b.is_empty() {
        result = apply_edits(&result, edits1b);
        let Ok(t) = parse(&result, parse_opts) else {
            return Ok(result);
        };
        tree = t;
    }

    // 1.6-th pass: run a targeted `try_collapse` sweep on inline pure-text
    // elements that were revealed by pass 1's block restructuring. Example: a
    // `<li><a href="…"\n  class="…">text</a\n></li>` whose `<a>` was not visited
    // in pass 1 because `try_break_block_multiline_content` owned the `<li>` edit.
    // After the `<li>` is re-broken, the `<a>` may need its multi-line open tag
    // hugged (`>text</a\n>` → `\n  >text</a\n>`).
    let mut edits1c: Vec<(u32, u32, String)> = Vec::new();
    collect_try_collapse_only(&result, &tree.fragment, line_width, &mut edits1c);
    if !edits1c.is_empty() {
        result = apply_edits(&result, edits1c);
        let Ok(t) = parse(&result, parse_opts) else {
            return Ok(result);
        };
        tree = t;
    }

    // 1.7-th pass: targeted `try_hug_mixed` sweep for elements whose `indent`
    // now ends with `>` (non-ws prefix). Pass 1 may have hugged a container
    // element (e.g. `<defs\n    >`), causing a child element (e.g. `<clipPath>`)
    // to gain a `    >` prefix. That child's hug was blocked by the parent-edit
    // ownership in pass 1; this targeted pass applies it without re-running the
    // full layout suite (which would disturb already-correct prose wrapping).
    let mut edits1d: Vec<(u32, u32, String)> = Vec::new();
    collect_hug_mixed_non_ws_prefix(&result, &tree.fragment, line_width, &mut edits1d);
    if !edits1d.is_empty() {
        result = apply_edits(&result, edits1d);
        let Ok(t) = parse(&result, parse_opts) else {
            return Ok(result);
        };
        tree = t;
    }

    // 1.8-th pass: break block-display elements that land at a non-ws `>` prefix.
    // Pass 1 may produce a Component hug like `<Component\n  ><div>…</div>…`
    // where the `<div>` is now at a `  >` prefix and overflows the line width.
    // `try_break_block_overflow` normally requires a pure-whitespace indent, so
    // this targeted sweep extracts the ws portion from `  >` and re-applies the
    // block-break logic.
    let mut edits1e: Vec<(u32, u32, String)> = Vec::new();
    collect_break_block_non_ws_prefix(&result, &tree.fragment, line_width, &mut edits1e);
    if !edits1e.is_empty() {
        result = apply_edits(&result, edits1e);
        let Ok(t) = parse(&result, parse_opts) else {
            return Ok(result);
        };
        tree = t;
    }

    // 1.9-th pass: break the open tag of inline/component elements that appear on
    // an overflowing line with non-whitespace text before them. Example:
    //   `      Explore … of <span class="font-medium …">`  (>80 cols)
    // → `      Explore … of <span\n        class="font-medium …"\n      >`
    // Only fires for elements whose open tag is currently single-line and whose
    // content has leading whitespace (hug_start=false), to avoid disturbing the
    // already-correct hug layouts from earlier passes.
    let mut edits1f: Vec<(u32, u32, String)> = Vec::new();
    collect_break_inline_open_tag(&result, &tree.fragment, line_width, &mut edits1f);
    if !edits1f.is_empty() {
        result = apply_edits(&result, edits1f);
        let Ok(t) = parse(&result, parse_opts) else {
            return Ok(result);
        };
        tree = t;
    }

    // 1.95-th pass: re-collapse broken open tags whose single-line form now fits
    // at their current column. Undoes incorrect pass-1 breaks that were caused
    // by a long preceding line; after pass 1.9 has broken inline elements to
    // shorten those lines, the previously-broken sibling open tag may now fit.
    let mut edits1g: Vec<(u32, u32, String)> = Vec::new();
    collect_recollapse_open_tag(&result, &tree.fragment, line_width, &mut edits1g);
    if !edits1g.is_empty() {
        result = apply_edits(&result, edits1g);
        let Ok(t) = parse(&result, parse_opts) else {
            return Ok(result);
        };
        tree = t;
    }

    // Second pass: the hug/break edits above may leave a long expression mustache
    // on an overflowing line (a hugged element's trailing `{a.b().c()}`).
    // Member-chain-break those in place — this can't run in the first pass
    // because the hug edit that creates the overflowing line owns the element and
    // suppresses recursion into it.
    let mut edits2: Vec<(u32, u32, String)> = Vec::new();
    collect_content_tag_breaks(&result, &tree.fragment, line_width, options, &mut edits2);
    if !edits2.is_empty() {
        result = apply_edits(&result, edits2);
    }

    // Third pass: `<pre>` / `<textarea>` whose content contains a block. rsvelte
    // otherwise leaves their whole subtree verbatim, but oxfmt formats the block
    // bodies (space-indented) + embedded JS while keeping element-direct
    // whitespace as raw tabs. Re-format those subtrees with that hybrid rule.
    // This pass only ever touches `<pre>`/`<textarea>`, so skip its re-parse
    // entirely unless one is present in the output.
    if (result.contains("<pre") || result.contains("<textarea"))
        && let Ok(root3) = parse(&result, parse_opts)
    {
        let mut edits3: Vec<(u32, u32, String)> = Vec::new();
        collect_pre_block_reformats(&result, &root3.fragment, 0, options, &mut edits3);
        if !edits3.is_empty() {
            result = apply_edits(&result, edits3);
        }
    }

    Ok(result)
}

/// Whether a fragment (recursively) contains a control-flow block — the trigger
/// for the `<pre>` hybrid reformat (a `<pre>` of only raw text is left verbatim).
fn fragment_has_block(fragment: &Fragment) -> bool {
    fragment.nodes.iter().any(|n| {
        matches!(
            n,
            TemplateNode::IfBlock(_)
                | TemplateNode::EachBlock(_)
                | TemplateNode::AwaitBlock(_)
                | TemplateNode::KeyBlock(_)
                | TemplateNode::SnippetBlock(_)
        ) || child_fragments(n).iter().any(|f| fragment_has_block(f))
    })
}

/// Recursively collect collapse edits for pure-text elements within
/// `<pre>` content that uses deep-tab mixed indentation (the "V3" case).
/// Unlike `try_collapse`, this handles elements whose open tags are still
/// multi-line (the source form) by computing the collapsed one-liner from
/// scratch: `<tag attrs>text content</tag>`.
fn collect_pre_pure_text_collapses(
    raw_inner: &str,
    fragment: &Fragment,
    line_width: usize,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(e) => {
                // Only collapse elements with pure text content.
                let is_pure_text = !e.fragment.nodes.is_empty()
                    && e.fragment
                        .nodes
                        .iter()
                        .all(|n| matches!(n, TemplateNode::Text(_)));
                if is_pure_text
                    && let Some(edit) = try_collapse_pre_verbatim(
                        raw_inner,
                        e.name.as_str(),
                        e.start,
                        e.end,
                        &e.fragment,
                        line_width,
                    )
                {
                    edits.push(edit);
                    continue; // edit owns this element; don't recurse
                }
                // Recurse into children — may have collapsible descendants.
                collect_pre_pure_text_collapses(raw_inner, &e.fragment, line_width, edits);
            }
            _ => {
                for child in child_fragments(node) {
                    collect_pre_pure_text_collapses(raw_inner, child, line_width, edits);
                }
            }
        }
    }
}

/// Like `try_collapse` but works on elements whose open tags are still in the
/// original (potentially multi-line) source form inside a `<pre>` verbatim
/// block.  Instead of using the open tag text from `raw_inner`, it builds a
/// minimal single-line open tag `<tag attrs>` by scanning for the first `>`
/// that closes the open tag, then checks whether the one-liner fits on the
/// real column.
fn try_collapse_pre_verbatim(
    raw_inner: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    let (s, e) = (start as usize, end as usize);
    let whole = raw_inner.get(s..e)?;
    // Already single-line — nothing to collapse (but return None so the
    // caller can still recurse if needed).
    if !whole.contains('\n') {
        return None;
    }
    // Pure text only.
    let first = fragment.nodes.first()?;
    let last = fragment.nodes.last()?;
    let content_start = text_start(first)? as usize;
    let content_end = text_end(last)? as usize;
    // The raw open tag including the closing `>` runs from `s` to `content_start`.
    let raw_open = raw_inner.get(s..content_start)?;
    // Find the position of the `>` that ends the open tag.
    let gt_rel = raw_open.rfind('>')?;
    // Everything before the `>` (trimmed) should be the open-tag markup.
    // Build a minimal single-line open tag by: taking the source open tag up to
    // (but not including) `>`, collapsing all whitespace runs to single spaces,
    // then appending `>`.
    let before_gt = raw_open[..gt_rel].trim_end_matches(|c: char| c.is_ascii_whitespace());
    // Collapse any leading whitespace lines (multi-line open tags have \n +
    // spaces before `>`).
    let one_line_open: String = before_gt.split_whitespace().collect::<Vec<_>>().join(" ");
    let one_line_open = format!("{one_line_open}>");
    // Text content.
    let raw_text = raw_inner.get(content_start..content_end);
    let raw_text = raw_text?;
    let collapsed_text: String = raw_text.split_whitespace().collect::<Vec<_>>().join(" ");
    // Close tag: always emit `</tag>` (collapsing any `</tag\n{indent}>` form).
    let raw_close = format!("</{tag}>");
    // Build the candidate one-liner.
    let one_liner = format!("{one_line_open}{collapsed_text}{raw_close}");
    // Column of the element's start in raw_inner.
    let col = current_column(raw_inner, start);
    // Use html_display_width so that entities like `&nbsp;` count as 1 column
    // rather than 6, matching prettier's measurement.
    let display_width = html_display_width(&one_liner);
    if col + display_width > line_width {
        return None; // doesn't fit
    }
    // Additional guard: after collapsing, any content on the same line as `end`
    // (the deferred `>` position) that follows immediately would be merged onto the
    // same line as `one_liner`. Check that the merged literal line would not overflow.
    // We use LITERAL lengths here (not display widths) because the oracle measures
    // HTML source line lengths including entity text like `&quot;` as 6 chars.
    let after_end = raw_inner.get(e..)?;
    let after_end_on_same_line = after_end.lines().next().unwrap_or("");
    // `after_end` starts with the deferred `>` (already included in `one_liner` via
    // `raw_close`), so skip the first char only if it's `>`.
    let following = after_end_on_same_line
        .strip_prefix('>')
        .unwrap_or(after_end_on_same_line);
    if !following.is_empty() {
        // Use literal lengths: `col` (literal column) + one_liner literal length + following literal length.
        if col + one_liner.len() + following.len() > line_width {
            return None; // merged literal line would overflow
        }
    }
    (one_liner != whole).then_some((start, end, one_liner))
}

/// Walk the tree (tracking nesting depth) and, for each `<pre>`/`<textarea>` whose
/// content contains a block (Svelte control flow), push an edit re-formatting its
/// inner content with the pre hybrid rule (see [`reformat_pre_inner`]).
/// Pure-HTML `<pre>` elements (no blocks) are handled by pass-0 (tab→space) and
/// pass-0.5 (overflow-line wrapping) instead of this sub-format path.
fn collect_pre_block_reformats(
    out: &str,
    fragment: &Fragment,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        if let TemplateNode::RegularElement(e) = node
            && matches!(e.name.as_str(), "pre" | "textarea")
            && fragment_has_block(&e.fragment)
        {
            if let Some(edit) = reformat_pre_inner(out, e, depth + 1, options) {
                edits.push(edit);
            }
            continue; // its subtree is owned by this edit
        }
        for child in child_fragments(node) {
            collect_pre_block_reformats(out, child, depth + 1, options, edits);
        }
    }
}

/// Returns `true` if the `<pre>`/`<textarea>` element's inner content (in the
/// current formatted output `out`) has deep space-indented `\n{4+ spaces}>`
/// lines. This is the signature of pass-0 tab→space conversion having run,
/// indicating the element needs `reformat_pre_inner` for proper line wrapping.
fn pre_has_space_gt_content(out: &str, elem: &rsvelte_core::ast::template::RegularElement) -> bool {
    let Some(whole) = out.get(elem.start as usize..elem.end as usize) else {
        return false;
    };
    let Some(open_rel) = whole.find('>') else {
        return false;
    };
    let inner_start = elem.start as usize + open_rel + 1;
    let Some(close_rel) = whole.rfind("</") else {
        return false;
    };
    let inner_end = elem.start as usize + close_rel;
    if inner_end <= inner_start {
        return false;
    }
    let Some(raw_inner) = out.get(inner_start..inner_end) else {
        return false;
    };
    raw_inner.lines().any(|l| {
        let spaces = l.bytes().take_while(|&b| b == b' ').count();
        spaces >= 4 && l.as_bytes().get(spaces) == Some(&b'>')
    })
}

/// Walk the tree and, for each `<pre>`/`<textarea>` that has NO block content
/// (i.e. `fragment_has_block` is false) but whose inner content uses deep-tab
/// `\n\t+>` indentation (code-viewer pattern), convert each leading tab sequence
/// before `>` to spaces (`n_tabs * iw` spaces per tab). This matches the oracle
/// behavior: prettier-plugin-svelte converts the source's tab-indented `>` markers
/// to space-indented form but does NOT sub-format the content (there are no blocks).
fn collect_pre_tab_gt_conversions(
    out: &str,
    fragment: &Fragment,
    iw: usize,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        if let TemplateNode::RegularElement(e) = node
            && matches!(e.name.as_str(), "pre" | "textarea")
            && !fragment_has_block(&e.fragment)
        {
            if let Some(edit) = try_pre_tab_gt_to_spaces(out, e, iw) {
                edits.push(edit);
            }
            // Do NOT recurse into the <pre> subtree — the edit owns it.
            continue;
        }
        for child in child_fragments(node) {
            collect_pre_tab_gt_conversions(out, child, iw, edits);
        }
    }
}

/// Convert `\n(\t+)>` patterns inside a `<pre>` element's content to
/// `\n{n * iw spaces}>`. Returns `None` if no conversion is needed.
fn try_pre_tab_gt_to_spaces(
    out: &str,
    elem: &rsvelte_core::ast::template::RegularElement,
    iw: usize,
) -> Option<(u32, u32, String)> {
    let whole = out.get(elem.start as usize..elem.end as usize)?;
    // Find the inner content: after the first `>` of the open tag, before `</`.
    let open_rel = whole.find('>')? + 1;
    let close_rel = whole.rfind("</")?;
    if close_rel <= open_rel {
        return None;
    }
    let inner_start = elem.start as usize + open_rel;
    let inner_end = elem.start as usize + close_rel;
    let raw_inner = out.get(inner_start..inner_end)?;

    // Check if there are any `\n\t+>` patterns (newline then tabs then `>`).
    // At least 4 leading tabs — avoid false-positives on shallow nesting.
    let has_deep_tab_gt = raw_inner.lines().any(|l| {
        let tabs = l.bytes().take_while(|&b| b == b'\t').count();
        tabs >= 4 && l.as_bytes().get(tabs) == Some(&b'>')
    });
    if !has_deep_tab_gt {
        return None;
    }

    // Convert each line that starts with tabs-then-`>` to spaces-then-`>`.
    let mut new_inner = String::with_capacity(raw_inner.len());
    for line in raw_inner.split('\n') {
        let tabs = line.bytes().take_while(|&b| b == b'\t').count();
        if tabs >= 4 && line.as_bytes().get(tabs) == Some(&b'>') {
            // Replace leading tabs with spaces.
            new_inner.push_str(&" ".repeat(tabs * iw));
            new_inner.push_str(&line[tabs..]);
        } else {
            new_inner.push_str(line);
        }
        new_inner.push('\n');
    }
    // Remove the trailing `\n` we added after the last line (split doesn't
    // produce a trailing element for a trailing newline).
    if !raw_inner.ends_with('\n') && new_inner.ends_with('\n') {
        new_inner.pop();
    }

    if new_inner == raw_inner {
        return None;
    }
    Some((inner_start as u32, inner_end as u32, new_inner))
}

/// Walk the tree and, for each `<pre>`/`<textarea>` that has no block content
/// but has space-indented `\n{spaces}>` lines (produced by pass 0), check for
/// lines that overflow `line_width` and wrap them at tag `>` boundaries.
fn collect_pre_space_gt_wraps(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        if let TemplateNode::RegularElement(e) = node
            && matches!(e.name.as_str(), "pre" | "textarea")
            && !fragment_has_block(&e.fragment)
            && pre_has_space_gt_content(out, e)
        {
            if let Some(edit) = wrap_pre_inner_overflow_lines(out, e, line_width) {
                edits.push(edit);
            }
            continue;
        }
        for child in child_fragments(node) {
            collect_pre_space_gt_wraps(out, child, line_width, edits);
        }
    }
}

/// Wrap overflowing lines inside `<pre>`/`<textarea>` inner content that has
/// space-indented `>` lines (produced by pass 0 tab→space conversion). For each
/// line longer than `line_width`, finds the rightmost tag-`>` position within
/// `line_width` characters and splits there, placing `>` and the remainder on
/// the next line with 2 extra spaces of indentation.
fn wrap_pre_inner_overflow_lines(
    out: &str,
    elem: &rsvelte_core::ast::template::RegularElement,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    let whole = out.get(elem.start as usize..elem.end as usize)?;
    let open_rel = whole.find('>')? + 1;
    let close_rel = whole.rfind("</")?;
    if close_rel <= open_rel {
        return None;
    }
    let inner_start = elem.start as usize + open_rel;
    let inner_end = elem.start as usize + close_rel;
    let raw_inner = out.get(inner_start..inner_end)?;

    let new_inner = wrap_lines_at_tag_gt(raw_inner, line_width);
    if new_inner == raw_inner {
        return None;
    }
    Some((inner_start as u32, inner_end as u32, new_inner))
}

/// Walk the tree and, for each `<pre>`/`<textarea>` that has no block content
/// but has space-indented `>` lines (produced by pass 0), run a pure-text-element
/// collapse pass on the inner content. This collapses `<span>` elements whose
/// content is pure text and whose collapsed form fits on one line (e.g., the
/// `<span>)</span>` element split across two source lines in the code-viewer pattern).
fn collect_pre_space_gt_pure_text_collapses(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        if let TemplateNode::RegularElement(e) = node
            && matches!(e.name.as_str(), "pre" | "textarea")
            && !fragment_has_block(&e.fragment)
            && pre_has_space_gt_content(out, e)
        {
            if let Some(edit) = collapse_pre_inner_pure_text(out, e, line_width) {
                edits.push(edit);
            }
            continue;
        }
        for child in child_fragments(node) {
            collect_pre_space_gt_pure_text_collapses(out, child, line_width, edits);
        }
    }
}

/// Collapse pure-text elements inside a `<pre>` inner content that has
/// space-indented `>` lines. Re-parses the inner content and applies
/// `collect_pre_pure_text_collapses`. Returns `None` if no collapse was needed.
fn collapse_pre_inner_pure_text(
    out: &str,
    elem: &rsvelte_core::ast::template::RegularElement,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    let whole = out.get(elem.start as usize..elem.end as usize)?;
    let open_rel = whole.find('>')? + 1;
    let close_rel = whole.rfind("</")?;
    if close_rel <= open_rel {
        return None;
    }
    let inner_start = elem.start as usize + open_rel;
    let inner_end = elem.start as usize + close_rel;
    let raw_inner = out.get(inner_start..inner_end)?;

    let Ok(sub_root) = parse(raw_inner, ParseOptions::default()) else {
        return None;
    };
    let mut collapse_edits: Vec<(u32, u32, String)> = Vec::new();
    collect_pre_pure_text_collapses(
        raw_inner,
        &sub_root.fragment,
        line_width,
        &mut collapse_edits,
    );
    if collapse_edits.is_empty() {
        return None;
    }
    let new_raw = apply_edits(raw_inner, collapse_edits);
    (new_raw != raw_inner).then_some((inner_start as u32, inner_end as u32, new_raw))
}

/// Wrap lines that exceed `line_width` at the rightmost tag-`>` character that
/// keeps the first part within the limit. Returns the modified string, or the
/// original string unchanged if no wrapping was needed.
///
/// Special handling for "dangling partial open tags": when an overflowing line
/// ends with `<tag` (a partial open tag with no closing `>`), splitting at the
/// rightmost `>` before the `<tag` leaves `<tag` at the end of the second part.
/// This is problematic because it severs the tag from its closing `>` on the next
/// line. Instead, we strip `<tag` from the second part and inject it into the
/// next source line immediately after the first `>` character. This preserves the
/// HTML element integrity and, combined with the pass-0.75 collapse, produces the
/// oracle's layout where the element is collapsed inline at the next `>` position.
fn wrap_lines_at_tag_gt(text: &str, line_width: usize) -> String {
    let mut result = String::with_capacity(text.len() + 64);
    let mut changed = false;
    // A partial open tag `<tag` stripped from the end of a wrapped second part.
    // It will be injected into the NEXT line before its first `>` character.
    let mut pending_tag: Option<String> = None;
    // When the second part (after stripping pending_tag) ends with `>` (a deferred
    // close-tag `>`), that `>` must lead the injection line. We store the base
    // indentation to use for the injection line (the outer element's indentation),
    // so the deferred `>` is placed at the correct column.
    let mut pending_close_gt_indent: Option<String> = None;

    for line in text.split('\n') {
        // Apply any pending tag injection.
        let owned_line;
        let line: &str = if let Some(ref ptag) = pending_tag {
            if let Some(gt_pos) = line.find('>') {
                if let Some(ref close_indent) = pending_close_gt_indent {
                    // We have a deferred close-tag `>` that should lead this output
                    // line at the outer element's indentation. The `>` on this source
                    // line closes the pending open tag `<tag`, and `<tag>` goes right
                    // after the deferred `>`.
                    // e.g. close_indent="            ", ptag="<span", line="              >)\span"
                    // → "            ><span>)\span"
                    owned_line = format!("{close_indent}>{ptag}{}", &line[gt_pos..]);
                } else {
                    // No deferred close `>`. Inject `<tag` immediately BEFORE the `>`
                    // on this line, so `<tag>` is formed using this line's `>`.
                    // e.g. ptag="<span", line="              >)\span"
                    // → "              <span>)\span"
                    owned_line = format!("{}{ptag}{}", &line[..gt_pos], &line[gt_pos..]);
                }
                changed = true;
            } else {
                // No `>` on this line — just prepend the tag.
                owned_line = format!("{ptag}{line}");
                changed = true;
            }
            &owned_line
        } else {
            line
        };
        pending_tag = None;
        pending_close_gt_indent = None;

        if line.len() <= line_width {
            result.push_str(line);
            result.push('\n');
            continue;
        }
        // Line overflows: find the rightmost tag `>` at position p ≤ line_width.
        // We exclude `>` characters inside attribute values (quoted strings).
        let split_pos = find_tag_gt_split(line, line_width);
        if let Some(p) = split_pos {
            // Count leading spaces for the current line's indentation.
            let indent = line.bytes().take_while(|&b| b == b' ').count();
            let new_indent = " ".repeat(indent + 2);
            // First part: everything before the `>` at position p.
            // Second part: `{new_indent}>` + rest of line after position p.
            let first = &line[..p];
            let rest = &line[p + 1..]; // skip the `>` itself
            // Check if the second part ends with a partial open tag `<tag` (no `>`).
            // Such a tag should NOT be kept on the second part — instead, strip it
            // and inject it into the NEXT source line after that line's first `>`.
            let second_content = format!("{new_indent}>{rest}");
            let (second_line_raw, stripped_tag) = strip_trailing_partial_tag(&second_content);
            if let Some(stag) = stripped_tag {
                pending_tag = Some(stag);
                // If the second line (after stripping the pending open tag) ends with
                // a `>` that would close a close-tag (e.g. `>,</span>`), that `>` is
                // the deferred close-tag `>` for the outer element. We strip it from
                // the second line and record the outer element's indentation so the
                // NEXT source line's injection can produce `{indent}>{pending_tag}...`.
                let (second_line, deferred_close_gt) = if second_line_raw.ends_with('>') {
                    let trimmed = &second_line_raw[..second_line_raw.len() - 1];
                    // The outer element's indentation is the current line's leading spaces.
                    (trimmed.to_string(), true)
                } else {
                    (second_line_raw, false)
                };
                if deferred_close_gt {
                    // Store the outer indentation (current line's leading spaces) so the
                    // next line's injection starts with `{indent}>`.
                    pending_close_gt_indent = Some(" ".repeat(indent));
                }
                // The second line no longer has the dangling tag.
                result.push_str(first);
                result.push('\n');
                let wrapped_second = wrap_lines_at_tag_gt(&second_line, line_width);
                result.push_str(&wrapped_second);
                result.push('\n');
            } else {
                let second_line = second_line_raw;
                // The second part may also overflow — wrap it recursively.
                result.push_str(first);
                result.push('\n');
                let wrapped_second = wrap_lines_at_tag_gt(&second_line, line_width);
                result.push_str(&wrapped_second);
                // The recursive call returns WITHOUT a trailing newline (since
                // `second_line` itself has no trailing newline). Always add one so
                // the next outer-loop iteration starts on a fresh line.
                result.push('\n');
            }
            changed = true;
        } else {
            // No good split point — keep as-is.
            result.push_str(line);
            result.push('\n');
        }
    }

    // Remove the trailing `\n` added after the last line if the original didn't
    // have a trailing newline (split('\n') always produces at least one element,
    // and we push `\n` after each — the last one is excess if the input had none).
    if !text.ends_with('\n') && result.ends_with('\n') {
        result.pop();
    }

    if !changed { text.to_string() } else { result }
}

/// If `line` ends with a partial open tag (`<[a-zA-Z][a-zA-Z0-9-]*` with no
/// closing `>`), strip it and return `(stripped_line, Some(tag))`.
/// Otherwise return `(line.to_string(), None)`.
fn strip_trailing_partial_tag(line: &str) -> (String, Option<String>) {
    // A partial open tag at end: matches `<` followed by letters/digits/hyphen,
    // no `>` after it on this line. Use rfind to find the last `<`.
    if let Some(lt_pos) = line.rfind('<') {
        let after_lt = &line[lt_pos + 1..];
        // Must be letters/digits/hyphens only (no spaces, no `>`, no `/`).
        if !after_lt.is_empty()
            && after_lt
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || b == b'-')
        {
            let stripped = line[..lt_pos].to_string();
            let tag = format!("<{after_lt}");
            return (stripped, Some(tag));
        }
    }
    (line.to_string(), None)
}

/// Find the rightmost `>` in `line` that is a tag delimiter (not inside an
/// attribute value or HTML entity), at position p where p ≤ line_width.
/// Returns the byte position of that `>`, or `None` if no such position exists.
fn find_tag_gt_split(line: &str, line_width: usize) -> Option<usize> {
    let bytes = line.as_bytes();
    let mut in_quote: Option<u8> = None;
    let mut best: Option<usize> = None;

    for (i, &b) in bytes.iter().enumerate() {
        if i > line_width {
            break; // Only look at positions within line_width
        }
        if let Some(q) = in_quote {
            if b == q {
                in_quote = None;
            }
        } else if b == b'"' || b == b'\'' {
            in_quote = Some(b);
        } else if b == b'>' {
            best = Some(i);
        }
    }
    best
}

/// Re-format the inner content of a `<pre>`/`<textarea>` that contains a block.
/// `content_depth` is the nesting depth of the element's children. The content is
/// formatted standalone at a width narrowed by `content_depth` levels (so embedded
/// JS / blocks break exactly as they would at their real column), then every line
/// is re-indented out to its real depth — using TABS for whitespace that is the
/// direct child of an element (oxfmt preserves it) and SPACES for block bodies and
/// formatted internals (attributes, JS, wrapped open tags).
fn reformat_pre_inner(
    out: &str,
    elem: &rsvelte_core::ast::template::RegularElement,
    content_depth: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    use std::collections::HashSet;
    // The inner-content span runs from the end of the open tag `>` to the start of
    // the close tag `</pre>`.
    let whole = out.get(elem.start as usize..elem.end as usize)?;
    let open_rel = whole.find('>')? + 1;
    let close_rel = whole.rfind("</")?;
    if close_rel <= open_rel {
        return None;
    }
    let inner_start = elem.start as usize + open_rel;
    let inner_end = elem.start as usize + close_rel;
    let raw_inner = out.get(inner_start..inner_end)?;

    // Guard: if raw_inner already uses deep tab indentation for elements inside
    // block bodies (e.g., a `{prefix}-foreground` span at 6+ tabs inside
    // `{#each}`), the content is already correctly formatted by the initial
    // format passes and the oracle preserves it verbatim. Sub-formatting would
    // re-normalise to spaces and lose the original indentation characters. In
    // that case skip the sub-format entirely — returning None here leaves the
    // raw_inner unchanged, which matches the oracle.
    let has_deep_tab_indented_block_child = raw_inner.lines().any(|l| {
        // A line starting with 6+ consecutive tab characters indicates an element
        // inside a block body (e.g. `{#each}`) was tab-indented in the original
        // source and must be preserved as-is.
        l.starts_with("\t\t\t\t\t\t")
    });
    if has_deep_tab_indented_block_child {
        // The content uses deep mixed tab/space indentation from the source — do
        // NOT run the sub-format pipeline (it would normalise indentation and lose
        // the original tab characters). Instead, apply a targeted pure-text-element
        // collapse pass: any `<span>` whose children are all Text nodes and whose
        // collapsed form fits on one real line should be collapsed to a single line,
        // matching oracle behaviour (e.g. `<span>--radius: 0.5rem;</span>`).
        let Ok(sub_root) = parse(raw_inner, ParseOptions::default()) else {
            return None;
        };
        let line_width = options.js.line_width.value() as usize;
        let mut collapse_edits: Vec<(u32, u32, String)> = Vec::new();
        collect_pre_pure_text_collapses(
            raw_inner,
            &sub_root.fragment,
            line_width,
            &mut collapse_edits,
        );
        if collapse_edits.is_empty() {
            return None;
        }
        let new_raw = apply_edits(raw_inner, collapse_edits);
        let current = out.get(inner_start..inner_end)?;
        return (new_raw != current).then_some((inner_start as u32, inner_end as u32, new_raw));
    }

    let iw = options.js.indent_width.value() as usize;
    let full_width = options.js.line_width.value() as usize;
    // Format the children standalone, but narrowed so a depth-0 layout matches the
    // breaks at the real `content_depth`.
    //
    // Element-direct children of `<pre>` are re-indented with TABS (1 char each)
    // rather than spaces (`iw` chars each).  The sub-format sees space indentation,
    // so a line at sub-depth D appears as `D*iw` chars, but in the final output the
    // tab-indented prefix uses only `D + content_depth` chars (one per tab level).
    // Using `content_depth * iw` as the narrowing over-narrows for tab lines,
    // causing hug-overflow on elements that would fit when tab-indented.
    //
    // The saving per sub-depth level is `iw - 1` chars (tab = 1 vs space = iw).
    // We add one level's saving (`iw - 1`) to account for the typical case where
    // grandchildren at sub-depth 1 (e.g. `<span>` inside `<code>` inside `<pre>`)
    // are tab-lines in the final output.
    let narrowed = full_width
        .saturating_sub(content_depth)
        .saturating_add(iw - 1)
        .max(20);
    let mut sub_opts = options.clone();
    sub_opts.js.line_width = oxc_formatter_core::LineWidth::try_from(narrowed as u16).ok()?;
    let formatted = crate::format(raw_inner.trim_matches(['\n', '\r']), &sub_opts).ok()?;
    let formatted = formatted.trim_end_matches('\n');
    if formatted.is_empty() {
        return None;
    }

    // After the recursive format, child elements (Components like `<Button>`)
    // whose open tags are multi-line may have `>` on its own line because the
    // formatter doesn't know they're inside `<pre>` (no `isPreTagContent` hug).
    // Fix those: move `>` back to hug the last attribute line (Sub-case B only
    // — overflow-breaking Sub-case A doesn't apply here since we're at narrowed
    // width and the outer re-indent will shift everything anyway).
    let formatted = {
        let sub_root_pre = parse(formatted, ParseOptions::default()).ok()?;
        let pre_fix_edits = fix_pre_child_hug_only(formatted, &sub_root_pre.fragment);
        if pre_fix_edits.is_empty() {
            formatted.to_string()
        } else {
            apply_edits(formatted, pre_fix_edits)
        }
    };
    let formatted = formatted.trim_end_matches('\n');

    // Post-pass: when a self-closing Component `<Comp attrs />` appears inline
    // at the end of a line and the NEXT line has following sibling content at
    // the same indent level, AND merging them would overflow the real width
    // (after re-indentation), break the component's attributes and pull the
    // following content onto the same line as `/>`.  This reproduces prettier's
    // behavior of breaking inside a group before breaking at the fill boundary.
    let formatted_owned: String;
    let formatted = {
        let reorg = reorg_inline_component_attrs(formatted, content_depth, iw, full_width);
        if let Some(s) = reorg {
            formatted_owned = s;
            formatted_owned.trim_end_matches('\n')
        } else {
            formatted
        }
    };

    // Whether the original content was hugged directly after `>` (no leading
    // whitespace). When hugged, the first line stays inline (no leading `\n`)
    // and subsequent lines are re-indented normally.
    let hugged = !raw_inner.starts_with(|c: char| c.is_ascii_whitespace());

    // Hugged first-line overflow fix: the sub-format doesn't know the actual
    // column of the first inline line (it equals `prefix_col`, the column of the
    // `>` that closes the `<pre>` open tag).  An inline element at sub-column
    // `col` has actual column `prefix_col + col`.  When the element overflows at
    // the actual column, apply a hug-break in `formatted` so re-indentation
    // produces the correct prettier `hugStart && hugEnd` layout.
    let first_line_fixed: Option<String> = if hugged {
        let gt_pos = inner_start - 1; // position of the closing `>` of the open tag
        let gt_line_start = out[..gt_pos].rfind('\n').map_or(0, |i| i + 1);
        let prefix_col = gt_pos - gt_line_start + 1; // columns before first inner char
        fix_pre_hugged_first_line(formatted, prefix_col, full_width, iw)
    } else {
        None
    };
    let formatted: &str = if let Some(ref fixed) = first_line_fixed {
        fixed.trim_end_matches('\n')
    } else {
        formatted
    };

    // Determine which line-starts in `formatted` are element-direct whitespace
    // (→ tabs). Everything else stays spaces.
    // Exception: when the `<pre>` has no block content (pure HTML hierarchy, no
    // Svelte `{#if}`/`{#each}` etc.), the oracle uses spaces throughout — no
    // element-direct tabs. In that case, skip `collect_pre_tab_lines` so all
    // lines re-indent with spaces.
    let spaces_only = !fragment_has_block(&elem.fragment);
    let sub_root = parse(formatted, ParseOptions::default()).ok()?;
    let mut tab_lines: HashSet<usize> = HashSet::new();
    if !spaces_only {
        collect_pre_tab_lines(formatted, &sub_root.fragment, true, &mut tab_lines);
    }

    // Re-indent every line: shift by `content_depth` levels; tab-marked lines use
    // tabs, the rest use spaces.
    let mut result = String::new();
    let mut offset = 0usize;
    let mut first_line = true;
    for line in formatted.split('\n') {
        if first_line && hugged {
            // Inline: emit the content directly (no leading \n, no indent
            // — the caller's `>` is already on the line).
            result.push_str(line.trim_start_matches(' '));
            first_line = false;
        } else {
            result.push('\n');
            let trimmed = line.trim_start_matches(' ');
            if !trimmed.is_empty() {
                let spaces = line.len() - trimmed.len();
                let real_depth = spaces / iw + content_depth;
                if tab_lines.contains(&offset) {
                    for _ in 0..real_depth {
                        result.push('\t');
                    }
                } else {
                    for _ in 0..real_depth * iw {
                        result.push(' ');
                    }
                }
                result.push_str(trimmed);
            }
        }
        offset += line.len() + 1; // +1 for the '\n' split removed
    }
    // The close tag's own line: pre-direct trailing whitespace → tabs at the
    // element's depth (one less than its content) when using tabs, or spaces when
    // using spaces-only mode. In the hugged case, the content starts inline (no
    // leading `\n`) and the close tag immediately follows on the same line — no
    // trailing `\n<indent>` needed.
    if !hugged {
        result.push('\n');
        if spaces_only {
            for _ in 0..(content_depth.saturating_sub(1)) * iw {
                result.push(' ');
            }
        } else {
            for _ in 0..content_depth.saturating_sub(1) {
                result.push('\t');
            }
        }
    }

    let replacement = result;
    let current = out.get(inner_start..inner_end)?;
    (replacement != current).then_some((inner_start as u32, inner_end as u32, replacement))
}

/// Collect the line-start byte offsets in `formatted` whose indentation is
/// element-direct whitespace (preserved as tabs by oxfmt inside `<pre>`): a node
/// whose parent fragment belongs to a regular element, plus every element's own
/// closing-tag line. Block bodies (parent is a block) keep spaces.
fn collect_pre_tab_lines(
    formatted: &str,
    fragment: &Fragment,
    parent_is_element: bool,
    set: &mut std::collections::HashSet<usize>,
) {
    for node in &fragment.nodes {
        let ns = node_start(node) as usize;
        let line_start = formatted[..ns].rfind('\n').map_or(0, |i| i + 1);
        if parent_is_element
            && formatted[line_start..ns]
                .bytes()
                .all(|b| b == b' ' || b == b'\t')
        {
            set.insert(line_start);
        }
        // An element's (or component's) own close tag is element-direct
        // trailing whitespace — use tabs.
        let (child_frag, child_end_pos) = match node {
            TemplateNode::RegularElement(e) => (Some(&e.fragment), Some(node_end(node) as usize)),
            TemplateNode::Component(c) => (Some(&c.fragment), Some(node_end(node) as usize)),
            _ => (None, None),
        };
        if let (Some(frag), Some(ne)) = (child_frag, child_end_pos) {
            collect_pre_tab_lines(formatted, frag, true, set);
            let close_ls = formatted[..ne.saturating_sub(1)]
                .rfind('\n')
                .map_or(0, |i| i + 1);
            if close_ls != line_start
                && formatted[close_ls..]
                    .trim_start_matches([' ', '\t'])
                    .starts_with("</")
            {
                set.insert(close_ls);
            }
        } else {
            for child in child_fragments(node) {
                collect_pre_tab_lines(formatted, child, false, set);
            }
        }
    }
}

fn apply_edits(src: &str, mut edits: Vec<(u32, u32, String)>) -> String {
    edits.sort_by_key(|(start, _, _)| std::cmp::Reverse(*start));
    let mut result = src.to_string();
    for (start, end, text) in edits {
        result.replace_range(start as usize..end as usize, &text);
    }
    result
}

/// For a `<pre>` whose content is hugged (starts inline after `>`), the
/// sub-format doesn't know the actual column of the first line.  An inline
/// element at sub-column `col` has actual column `prefix_col + col` in the
/// final output.  When such an element overflows `full_width`, apply a hug-break
/// so re-indentation produces the correct prettier layout.
///
/// Only applies to attribute-free inline `RegularElement`s whose content is
/// directly adjacent (shouldHugStart && shouldHugEnd) and fits on a single line
/// in the sub-format.  Elements with attributes are already handled by the
/// existing markup/collapse passes.
///
/// Returns `Some(modified_formatted)` if a break was applied, `None` otherwise.
fn fix_pre_hugged_first_line(
    formatted: &str,
    prefix_col: usize,
    full_width: usize,
    iw: usize,
) -> Option<String> {
    // Quick exit: if the first line is short enough, no overflow is possible.
    let first_line_end = formatted.find('\n').unwrap_or(formatted.len());
    if prefix_col.saturating_add(first_line_end) <= full_width {
        return None;
    }
    let Ok(sub_root) = parse(formatted, ParseOptions::default()) else {
        return None;
    };
    let mut edits: Vec<(usize, usize, String)> = Vec::new();
    collect_pre_first_line_hug_breaks(
        formatted,
        &sub_root.fragment,
        prefix_col,
        full_width,
        iw,
        0,
        &mut edits,
    );
    if edits.is_empty() {
        return None;
    }
    // Apply edits right-to-left so earlier offsets stay valid.
    edits.sort_by_key(|(s, _, _)| std::cmp::Reverse(*s));
    let mut result = formatted.to_string();
    for (s, e, rep) in edits {
        result.replace_range(s..e, &rep);
    }
    Some(result)
}

/// Recursively find inline RegularElements (no attributes) on line 0 of
/// `formatted` that overflow at `prefix_col + col_in_formatted` and collect
/// hug-break edits.  `block_depth` counts the number of flow-block bodies
/// that enclose this fragment at the first line.
fn collect_pre_first_line_hug_breaks(
    formatted: &str,
    fragment: &Fragment,
    prefix_col: usize,
    full_width: usize,
    iw: usize,
    block_depth: usize,
    edits: &mut Vec<(usize, usize, String)>,
) {
    for node in &fragment.nodes {
        let s = node_start(node) as usize;
        // Skip nodes that start on a later line.
        if formatted[..s].contains('\n') {
            continue;
        }
        match node {
            TemplateNode::RegularElement(e) => {
                let e_start = e.start as usize;
                let e_end = e.end as usize;
                let tag = e.name.as_str();
                // Only attribute-free inline elements (attributes are handled by the
                // existing multi-line open-tag hug paths in the collapse pass).
                if !e.attributes.is_empty()
                    || is_block_display(tag)
                    || is_whitespace_preserving(tag)
                {
                    continue;
                }
                // Skip if the element itself already spans multiple lines.
                let elem_text = match formatted.get(e_start..e_end) {
                    Some(t) => t,
                    None => continue,
                };
                if elem_text.contains('\n') {
                    continue;
                }
                // Open tag must end with `>` directly after tag name (no attrs).
                let open_end_rel = match elem_text.find('>') {
                    Some(i) => i + 1,
                    None => continue,
                };
                let open_end = e_start + open_end_rel;
                let close_start = match elem_text.rfind("</") {
                    Some(i) => e_start + i,
                    None => continue,
                };
                if close_start <= open_end {
                    continue;
                }
                let content = match formatted.get(open_end..close_start) {
                    Some(c) => c,
                    None => continue,
                };
                // Require directly adjacent content (shouldHugStart && shouldHugEnd).
                if content.is_empty()
                    || content.starts_with([' ', '\t', '\r', '\n'])
                    || content.ends_with([' ', '\t', '\r', '\n'])
                    || content.contains('\n')
                {
                    continue;
                }
                // Compute actual column of this element.
                let line_start_of_elem = formatted[..e_start].rfind('\n').map_or(0, |i| i + 1);
                let col_in_fmt = e_start - line_start_of_elem;
                let actual_col = prefix_col + col_in_fmt;
                let elem_len = e_end - e_start; // byte length ≈ display width for ASCII
                if actual_col + elem_len <= full_width {
                    continue; // fits — no break needed
                }
                // Build the hug-break replacement.
                // `inner_indent`: the `>` that opens the content sits at
                //   `(block_depth + 1) * iw` spaces (one extra level for the hug).
                // `ws_indent`: the closing `>` of `</tag>` sits at
                //   `block_depth * iw` spaces (back to the element's block level).
                let inner_indent = " ".repeat((block_depth + 1) * iw);
                let ws_indent = " ".repeat(block_depth * iw);
                let open_no_bracket = match formatted.get(e_start..open_end - 1) {
                    Some(s) => s,
                    None => continue,
                };
                let rep =
                    format!("{open_no_bracket}\n{inner_indent}>{content}</{tag}\n{ws_indent}>");
                edits.push((e_start, e_end, rep));
            }
            TemplateNode::IfBlock(blk) => {
                // Consequent body is one level deeper.
                collect_pre_first_line_hug_breaks(
                    formatted,
                    &blk.consequent,
                    prefix_col,
                    full_width,
                    iw,
                    block_depth + 1,
                    edits,
                );
                // Alternate (`{:else}`) is at the same block_depth as the if.
                if let Some(alt) = &blk.alternate {
                    collect_pre_first_line_hug_breaks(
                        formatted,
                        alt,
                        prefix_col,
                        full_width,
                        iw,
                        block_depth,
                        edits,
                    );
                }
            }
            other => {
                // EachBlock, AwaitBlock, KeyBlock, SnippetBlock — recurse with + 1.
                for child in child_fragments(other) {
                    collect_pre_first_line_hug_breaks(
                        formatted,
                        child,
                        prefix_col,
                        full_width,
                        iw,
                        block_depth + 1,
                        edits,
                    );
                }
            }
        }
    }
}

/// Recursively visit every expression mustache and member-chain-break any that
/// sits on an overflowing line (see [`try_break_inline_content_tag`]).
fn collect_content_tag_breaks(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        if let TemplateNode::ExpressionTag(_) = node
            && let Some(edit) = try_break_inline_content_tag(out, node, line_width, options)
        {
            edits.push(edit);
        }
        for child in child_fragments(node) {
            collect_content_tag_breaks(out, child, line_width, options, edits);
        }
    }
}

/// The child fragments of a container node (for a generic recursive walk).
fn child_fragments(node: &TemplateNode) -> Vec<&Fragment> {
    match node {
        TemplateNode::RegularElement(e) => vec![&e.fragment],
        TemplateNode::Component(c) => vec![&c.fragment],
        TemplateNode::TitleElement(t) => vec![&t.fragment],
        TemplateNode::SvelteElement(e) => vec![&e.fragment],
        TemplateNode::SvelteBoundary(b) => vec![&b.fragment],
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

/// Whether `node` may sit inside a fragment-level inline prose run that the run
/// fill reflows. Text, mustaches/html-tags, and ONE-LINE inline elements
/// (`<input/>`, `<br/>`, an empty `<span/>`, or `<code>foo</code>` whose whole
/// rendering is currently on one line) qualify. A one-line inline element is safe
/// to fold into the run's single edit because recursing into it produces no edit
/// (its content already fits), so the two edits can't overlap. Block elements,
/// comments, components, and multi-line elements are run boundaries.
fn is_run_member(out: &str, node: &TemplateNode) -> bool {
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
fn fill_inline_runs(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    is_block_body: bool,
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
        !is_run_member(out, n) && !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty())
    });
    let allow_elem_expr_collapse = is_block_body && !has_non_run_block_siblings;

    let mut i = 0;
    while i < nodes.len() {
        if !is_run_member(out, &nodes[i]) {
            i += 1;
            continue;
        }
        let mut j = i;
        while j < nodes.len() && is_run_member(out, &nodes[j]) {
            j += 1;
        }
        if let Some(edit) = try_fill_run(out, &nodes[i..j], line_width, allow_elem_expr_collapse) {
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
fn try_fill_run(
    out: &str,
    run: &[TemplateNode],
    line_width: usize,
    allow_elem_expr_collapse: bool,
) -> Option<(u32, u32, String)> {
    // Trim whitespace-only edge text nodes — the surrounding layout owns them.
    let mut lo = 0;
    let mut hi = run.len();
    while lo < hi && matches!(&run[lo], TemplateNode::Text(t) if t.data.trim().is_empty()) {
        lo += 1;
    }
    while hi > lo && matches!(&run[hi - 1], TemplateNode::Text(t) if t.data.trim().is_empty()) {
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
        .filter(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))
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
                let starts_with_newline = d.starts_with('\n');
                Some(starts_with_newline)
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
    let s_before_case_a_adjust = s;
    if matches!(first_text_leading_ws_kind, Some(false)) {
        // Move s back by 1 to include the single leading space in the edit range.
        // This keeps the indent computation correct (the space is already counted
        // in indent_cols since s was advanced past it).
        if s > 0 && out.as_bytes().get(s - 1) == Some(&b' ') {
            s -= 1;
        }
    }
    let _ = s_before_case_a_adjust; // suppress unused-variable warning

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
    let indent_cols = indent.width();
    // For close-tag prefixes, derive base_level from just the whitespace bytes
    // before the `>` or `> ` tail, not from indent_cols (which includes the tag
    // characters). This ensures continuation lines align with the parent element's
    // indentation rather than the visual column of the close tag.
    let base_level = if is_close_tag_prefix {
        let ws_len = indent
            .bytes()
            .take_while(|&b| b == b' ' || b == b'\t')
            .count();
        ws_len / 2
    } else {
        indent_cols / 2
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
    let content_doc = build_children_doc_nodes(out, run, allow_elem_expr_collapse, use_word_first)?;
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
    let flat = crate::doc::print(
        crate::doc::Doc::Group(vec![content_doc.clone()]),
        1_000_000,
        "  ",
        base_level,
        0,
    );
    if !flat.contains('\n') && indent_cols + flat.width() <= line_width {
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
    // A pure-text run (no inline elements) that is already on a single line
    // (no `\n` in `whole`) should not be broken — prettier does not aggressively
    // re-wrap prose that the indent pass placed on one line, even when it slightly
    // overflows (e.g. a `<strong>Code suggestions</strong> validated … before you
    // merge.` run that reaches 86 cols). Only reflow pure-text single-node runs
    // that are already single-line; multi-node runs (with inline elements) that
    // span multiple lines in the formatted output are still reflowed normally.
    // Note: `run` was rebound above to `run[lo..hi]` (whitespace-only edges trimmed).
    if run.len() == 1 && matches!(run[0], TemplateNode::Text(_)) && !whole.contains('\n') {
        return None;
    }
    let printed_raw = crate::doc::print(content_doc, line_width, "  ", base_level, indent_cols);
    // For Case B (hardline-prefixed inverted fill), the printed output begins with
    // "\n<indent>" from the Hardline. Strip this prefix so the edit replaces only
    // the word content starting at `s` (the existing "\n<indent>" before `s` in the
    // source stays in place).
    let printed = if matches!(first_text_leading_ws_kind, Some(true))
        && first_text_follows_close_tag
        && printed_raw.starts_with('\n')
    {
        let indent_str = "  ".repeat(base_level);
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
    if !printed.contains('\n') && indent_cols + printed.width() > line_width {
        return None;
    }
    (printed != whole).then_some((s as u32, e as u32, printed))
}

/// Targeted second-pass: only try `try_fill_mixed` on block elements whose
/// mixed inline children were just collapsed by pass 1. Skips `try_collapse`,
/// `try_hug_mixed`, and `try_break_content_tag_block` so it does not disturb
/// elements already correctly laid out by pass 1 (e.g. hugged inline elements
/// or single-content-tag blocks).
fn collect_fill_mixed_only(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(elem) => {
                // `<pre>` / `<textarea>` preserve their content verbatim — never
                // reflow them or recurse into their (whitespace-significant)
                // descendants.
                if is_whitespace_preserving(elem.name.as_str()) {
                    continue;
                }
                // Only apply fill-mixed to block-display elements — inline
                // elements were already handled (or correctly skipped) by pass 1.
                if is_block_display(elem.name.as_str())
                    && let Some(edit) = try_fill_mixed(
                        out,
                        elem.name.as_str(),
                        elem.start,
                        elem.end,
                        &elem.fragment,
                        line_width,
                        options,
                    )
                {
                    edits.push(edit);
                    continue; // edit owns this element, don't recurse
                }
                collect_fill_mixed_only(out, &elem.fragment, line_width, options, edits);
            }
            TemplateNode::Component(c) => {
                collect_fill_mixed_only(out, &c.fragment, line_width, options, edits);
            }
            TemplateNode::TitleElement(t) => {
                collect_fill_mixed_only(out, &t.fragment, line_width, options, edits);
            }
            TemplateNode::SvelteBody(s)
            | TemplateNode::SvelteDocument(s)
            | TemplateNode::SvelteFragment(s)
            | TemplateNode::SvelteBoundary(s)
            | TemplateNode::SvelteHead(s)
            | TemplateNode::SvelteOptions(s)
            | TemplateNode::SvelteSelf(s)
            | TemplateNode::SvelteWindow(s) => {
                collect_fill_mixed_only(out, &s.fragment, line_width, options, edits);
            }
            TemplateNode::SvelteComponent(c) => {
                collect_fill_mixed_only(out, &c.fragment, line_width, options, edits);
            }
            TemplateNode::SvelteElement(e) => {
                collect_fill_mixed_only(out, &e.fragment, line_width, options, edits);
            }
            TemplateNode::IfBlock(blk) => {
                collect_fill_mixed_only(out, &blk.consequent, line_width, options, edits);
                if let Some(alt) = &blk.alternate {
                    collect_fill_mixed_only(out, alt, line_width, options, edits);
                }
            }
            TemplateNode::EachBlock(blk) => {
                collect_fill_mixed_only(out, &blk.body, line_width, options, edits);
                if let Some(fb) = &blk.fallback {
                    collect_fill_mixed_only(out, fb, line_width, options, edits);
                }
            }
            TemplateNode::AwaitBlock(blk) => {
                if let Some(f) = &blk.pending {
                    collect_fill_mixed_only(out, f, line_width, options, edits);
                }
                if let Some(f) = &blk.then {
                    collect_fill_mixed_only(out, f, line_width, options, edits);
                }
                if let Some(f) = &blk.catch {
                    collect_fill_mixed_only(out, f, line_width, options, edits);
                }
            }
            TemplateNode::KeyBlock(blk) => {
                collect_fill_mixed_only(out, &blk.fragment, line_width, options, edits);
            }
            TemplateNode::SnippetBlock(blk) => {
                collect_fill_mixed_only(out, &blk.body, line_width, options, edits);
            }
            TemplateNode::SlotElement(s) => {
                collect_fill_mixed_only(out, &s.fragment, line_width, options, edits);
            }
            _ => {}
        }
    }
}

/// Pass 1.7: targeted `try_hug_mixed` sweep for elements that have a
/// non-whitespace prefix (indent ending with `>`). This can occur when pass 1
/// hugs a container element — e.g. `<defs>` becomes `<defs\n    >` — so a
/// child element (`<clipPath>`) that was previously at a whitespace indent now
/// immediately follows the parent's closing `>` on the same line. Pass 1 did
/// not process the child independently (the parent edit owned the range), so
/// this pass applies the hug-mixed transform specifically for those cases.
fn collect_hug_mixed_non_ws_prefix(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        let (start, end, children) = match node {
            TemplateNode::RegularElement(e) => {
                if is_whitespace_preserving(e.name.as_str()) {
                    continue;
                }
                // Check if this element has a non-ws-prefix indent that is exactly
                // `{spaces}>` — a parent's hugged closing `>` immediately before this
                // element.  We intentionally reject longer non-ws indents (e.g. the
                // element follows a sibling's close-tag `</span>`) because those
                // produce incorrect `ws_indent` values in `try_hug_mixed`.
                let s = e.start as usize;
                let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
                let indent = out.get(line_start..s).unwrap_or("");
                let non_ws = !indent.bytes().all(|b| b == b' ' || b == b'\t');
                let is_simple_gt_prefix = non_ws && indent.trim_start_matches([' ', '\t']) == ">";
                if is_simple_gt_prefix
                    && let Some(edit) = try_hug_mixed(
                        out,
                        e.name.as_str(),
                        e.start,
                        e.end,
                        &e.fragment,
                        line_width,
                    )
                {
                    edits.push(edit);
                    continue; // edit owns this element, don't recurse
                }
                (e.start, e.end, vec![&e.fragment])
            }
            TemplateNode::Component(c) => {
                let s = c.start as usize;
                let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
                let indent = out.get(line_start..s).unwrap_or("");
                let non_ws = !indent.bytes().all(|b| b == b' ' || b == b'\t');
                let is_simple_gt_prefix = non_ws && indent.trim_start_matches([' ', '\t']) == ">";
                if is_simple_gt_prefix
                    && let Some(edit) = try_hug_mixed(
                        out,
                        c.name.as_str(),
                        c.start,
                        c.end,
                        &c.fragment,
                        line_width,
                    )
                {
                    edits.push(edit);
                    continue;
                }
                (c.start, c.end, vec![&c.fragment])
            }
            TemplateNode::SlotElement(s) => {
                let ss = s.start as usize;
                let line_start = out[..ss].rfind('\n').map_or(0, |i| i + 1);
                let indent = out.get(line_start..ss).unwrap_or("");
                let non_ws = !indent.bytes().all(|b| b == b' ' || b == b'\t');
                let is_simple_gt_prefix = non_ws && indent.trim_start_matches([' ', '\t']) == ">";
                if is_simple_gt_prefix
                    && let Some(edit) = try_hug_mixed(
                        out,
                        s.name.as_str(),
                        s.start,
                        s.end,
                        &s.fragment,
                        line_width,
                    )
                {
                    edits.push(edit);
                    continue;
                }
                (s.start, s.end, vec![&s.fragment])
            }
            _ => {
                for child in child_fragments(node) {
                    collect_hug_mixed_non_ws_prefix(out, child, line_width, edits);
                }
                continue;
            }
        };
        let _ = (start, end); // suppress unused warnings
        for child in children {
            collect_hug_mixed_non_ws_prefix(out, child, line_width, edits);
        }
    }
}

/// Pass 1.8: break block-display elements that land at a non-ws `>` prefix.
///
/// When pass 1 hugs a Component (`<Component\n  ><div>…</div></Component\n>`),
/// the `<div>` is placed immediately after the hugged `>` — its "indent" is
/// `  >` (non-whitespace).  `try_break_block_overflow` normally requires a
/// pure-whitespace indent, so pass 1 can't handle this.  This targeted pass
/// extracts the whitespace portion (`  `) from the `  >` prefix and applies
/// the block-break logic manually.
fn collect_break_block_non_ws_prefix(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(e) => {
                if is_whitespace_preserving(e.name.as_str()) {
                    continue;
                }
                let s = e.start as usize;
                let end = e.end as usize;
                let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
                let indent = out.get(line_start..s).unwrap_or("");
                let non_ws = !indent.bytes().all(|b| b == b' ' || b == b'\t');
                if non_ws && indent.ends_with('>') && is_block_display(e.name.as_str()) {
                    // Extract the whitespace-only portion of the prefix.
                    let ws_indent: &str = {
                        let trim_pos = indent.rfind([' ', '\t']).map_or(0, |i| i + 1);
                        &indent[..trim_pos]
                    };
                    // Only act when the whole element is on one line and overflows.
                    let whole = out.get(s..end).unwrap_or("");
                    let column = indent.width() + 1; // +1 for the `>` char
                    if !whole.contains('\n') && column + whole.width() > line_width {
                        // Find first and last non-whitespace children.
                        if let (Some(first_child), Some(last_child)) = (
                            e.fragment.nodes.iter().find(
                                |n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()),
                            ),
                            e.fragment.nodes.iter().rfind(
                                |n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()),
                            ),
                        ) {
                            let first_start = node_start(first_child) as usize;
                            let last_end = node_end(last_child) as usize;
                            let open = out.get(s..first_start).unwrap_or("");
                            let close = out.get(last_end..end).unwrap_or("");
                            let content = out.get(first_start..last_end).unwrap_or("");
                            if open.ends_with('>') && !content.is_empty() {
                                let inner_indent = format!("{ws_indent}  ");
                                let broken =
                                    format!("{open}\n{inner_indent}{content}\n{ws_indent}{close}");
                                if broken != whole {
                                    edits.push((e.start, e.end, broken));
                                    continue; // edit owns this element
                                }
                            }
                        }
                    }
                }
                collect_break_block_non_ws_prefix(out, &e.fragment, line_width, edits);
            }
            _ => {
                for child in child_fragments(node) {
                    collect_break_block_non_ws_prefix(out, child, line_width, edits);
                }
            }
        }
    }
}

/// Pass 1.9: break the open tag of inline/component elements that land on an
/// overflowing line with non-whitespace text before them.
///
/// Pattern:
///   `      Explore … of <span class="font-medium …">`  (>80 cols)
/// becomes:
///   `      Explore … of <span\n        class="font-medium …"\n      >`
///
/// Only fires when:
/// - The element has at least one attribute.
/// - The element's open tag is currently single-line.
/// - The line containing the element's open `<` overflows the print width.
/// - There is non-whitespace text before the element on the same line.
/// - The element's content starts with whitespace (`hug_start=false`).
///
/// The broken form uses the line's leading-whitespace as `indent` and
/// `indent + "  "` as `inner_indent` for attributes.
fn collect_break_inline_open_tag(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(e) => {
                // For block/whitespace-preserving elements that are EMPTY (no
                // children, no attributes), break the open tag when the whole
                // line overflows and there is inline content after the element.
                // Example: `  <script></script>{@html ...}` (86 chars) →
                //          `  <script\n  ></script>{@html ...}`.
                let elem_fragment_empty = e
                    .fragment
                    .nodes
                    .iter()
                    .all(|n| matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()));
                if (is_block_display(e.name.as_str()) || is_whitespace_preserving(e.name.as_str()))
                    && e.attributes.is_empty()
                    && elem_fragment_empty
                    && let Some(edit) = try_break_empty_block_open_tag(
                        out,
                        e.name.as_str(),
                        e.start,
                        e.end,
                        line_width,
                    )
                {
                    edits.push(edit);
                    continue;
                }
                if is_whitespace_preserving(e.name.as_str()) {
                    continue;
                }
                // Only inline (non-block) regular elements.
                if !is_block_display(e.name.as_str())
                    && let Some(edit) = try_break_inline_open_tag(
                        out,
                        e.name.as_str(),
                        &e.attributes,
                        e.start,
                        e.end,
                        &e.fragment,
                        line_width,
                    )
                {
                    edits.push(edit);
                    // Don't skip recursion: children at higher positions are safe
                    // because apply_edits processes edits from high→low position.
                }
                collect_break_inline_open_tag(out, &e.fragment, line_width, edits);
            }
            TemplateNode::Component(c) => {
                if let Some(edit) = try_break_inline_open_tag(
                    out,
                    c.name.as_str(),
                    &c.attributes,
                    c.start,
                    c.end,
                    &c.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                }
                collect_break_inline_open_tag(out, &c.fragment, line_width, edits);
            }
            _ => {
                for child in child_fragments(node) {
                    collect_break_inline_open_tag(out, child, line_width, edits);
                }
            }
        }
    }
}

/// Try to break the open tag of an inline/component element whose line overflows
/// and has non-whitespace text before it. Returns `None` when the conditions
/// are not met or the element is already correctly broken.
fn try_break_inline_open_tag(
    out: &str,
    tag: &str,
    attrs: &[rsvelte_core::ast::template::Attribute],
    elem_start: u32,
    elem_end: u32,
    fragment: &Fragment,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    // Must have attributes to break. Zero-attribute elements in hug_start=true
    // contexts can't be broken safely without tree-level indent information.
    if attrs.is_empty() {
        return None;
    }
    // Must have at least one child so we can locate the end of the open tag
    // (the `>` is immediately followed by the first child's start position).
    let first = fragment.nodes.first()?;
    let open_tag_end = node_start(first) as usize;

    // Get the open tag text (from `<` to just after `>`).
    let open_tag = out.get(elem_start as usize..open_tag_end)?;

    // Open tag must be single-line (not already broken) and end with `>`.
    if open_tag.contains('\n') || !open_tag.ends_with('>') {
        return None;
    }

    // Check the line containing the element's opening `<`.
    let elem_start_usize = elem_start as usize;
    let line_start = out[..elem_start_usize].rfind('\n').map_or(0, |i| i + 1);
    // Line end: find the next `\n` starting from after the open tag.
    let line_end = out[open_tag_end..]
        .find('\n')
        .map_or(out.len(), |i| open_tag_end + i);
    let line = out.get(line_start..line_end)?;

    // Line must overflow.
    if line.width() <= line_width {
        return None;
    }

    // There must be non-whitespace text before the element on this line.
    let before = out.get(line_start..elem_start_usize)?;
    if before.is_empty() || before.bytes().all(|b| b == b' ' || b == b'\t') {
        return None; // element is at line start — not our target
    }

    // Extract leading whitespace of the line as the base indent for the tag.
    let ws_end = before
        .char_indices()
        .find(|(_, c)| !c.is_whitespace())
        .map_or(before.len(), |(i, _)| i);
    let indent = &before[..ws_end];
    let inner_indent = format!("{indent}  ");

    // Collect attribute texts; bail on any multi-line attribute.
    let mut attr_texts: Vec<&str> = Vec::with_capacity(attrs.len());
    for attr in attrs {
        let (as_, ae) = attribute_span(attr);
        let atext = out.get(as_ as usize..ae as usize)?;
        if atext.contains('\n') {
            return None;
        }
        attr_texts.push(atext);
    }

    // Check whether content starts with whitespace (hug_start=false) or directly
    // after `>` (hug_start=true).
    let first_child_text = out.get(open_tag_end..node_end(first) as usize)?;
    let hug_start = !first_child_text.starts_with([' ', '\t', '\r', '\n']);

    if !hug_start {
        // hug_start=false: build broken open tag with `>` on its own line.
        //   <tag
        //     attr1
        //     attr2
        //   >
        let mut broken = format!("<{tag}");
        for atext in &attr_texts {
            broken.push('\n');
            broken.push_str(&inner_indent);
            broken.push_str(atext);
        }
        broken.push('\n');
        broken.push_str(indent);
        broken.push('>');

        // Only emit if different from the current open tag.
        (broken != open_tag).then_some((elem_start, open_tag_end as u32, broken))
    } else {
        // hug_start=true: the element's content starts directly after `>` with no
        // whitespace. We need to break the open tag so that `>content</tag` stays
        // glued, and the close tag's `>` goes on its own line at the base indent.
        //
        // Only apply when the element has at least 2 attributes. Single-attribute
        // elements are left inline even if the line overflows, matching prettier's
        // behavior of not breaking short inline elements that can't be meaningfully
        // split without disrupting reading flow.
        if attr_texts.len() < 2 {
            return None;
        }

        // The whole element text: `<tag attrs>content</tag>`
        // We replace it with one of two patterns depending on whether
        // `{before}<tag attrs_without_close_angle` fits in line_width:
        //
        // Option A (attrs need full break):
        //   <tag
        //     attr1
        //     attrN>content</tag
        //   >
        //
        // Option B (only close-angle needs to break):
        //   <tag attr1 attrN
        //     >content</tag
        //   >

        let elem_end_usize = elem_end as usize;
        // The whole element text must be single-line (no internal newlines except
        // possibly in content — skip if element is already multi-line).
        let whole = out.get(elem_start_usize..elem_end_usize)?;
        if whole.contains('\n') {
            return None;
        }

        // Find the close tag: `</tag>` is the suffix.
        // We locate `</tag` working backwards from elem_end.
        let close_pat = format!("</{tag}");
        let close_rel = whole.rfind(close_pat.as_str())?;
        let content = whole.get(open_tag.len()..close_rel)?; // text between open `>` and `</tag`
        // The close tag `>` is the last character.
        if !whole.ends_with('>') {
            return None;
        }
        // close_tag_text = `</tag>` (everything from close_rel to end)
        let close_tag_text = whole.get(close_rel..)?;
        // Strip trailing `>` to get `</tag`, then we'll append `\n{indent}>`.
        let close_tag_without_angle = close_tag_text.strip_suffix('>')?;

        // Check if Option B fits: `{before}<tag attr1 attrN` (no `>`) ≤ line_width.
        // We use the open_tag minus the trailing `>` character.
        let open_tag_without_angle = open_tag.strip_suffix('>')?;
        let option_b_prefix_len = before.width() + open_tag_without_angle.width();

        let broken = if option_b_prefix_len <= line_width {
            // Option B: keep `<tag attrs` on the current line, break at `>`.
            //   <tag attr1 attrN
            //     >content</tag
            //   >
            format!(
                "{open_tag_without_angle}\n{inner_indent}>{content}{close_tag_without_angle}\n{indent}>"
            )
        } else {
            // Option A: break each attr onto its own line.
            //   <tag
            //     attr1
            //     attrN>content</tag
            //   >
            let mut broken = format!("<{tag}");
            for (i, atext) in attr_texts.iter().enumerate() {
                broken.push('\n');
                broken.push_str(&inner_indent);
                broken.push_str(atext);
                // Last attr: close angle `>` and content stay on the same line.
                if i == attr_texts.len() - 1 {
                    broken.push('>');
                    broken.push_str(content);
                    broken.push_str(close_tag_without_angle);
                    broken.push('\n');
                    broken.push_str(indent);
                    broken.push('>');
                }
            }
            broken
        };

        if broken == whole {
            return None;
        }
        Some((elem_start, elem_end, broken))
    }
}

/// Try to break the open tag of an EMPTY block/whitespace-preserving element
/// (no attributes, no children) that sits at line-start on a line that overflows
/// because of following inline content.
///
/// Example (`html-tag-script-2`):
///   `  <script></script>{@html `...`}` (86 chars, overflows 80)
/// → `  <script\n  ></script>{@html `...`}`
///
/// Prettier-plugin-svelte breaks the `<tagname>` open tag to `<tagname\n{indent}>`
/// when the full line (element + following sibling content) would overflow. This
/// gives prettier a break point even though the element itself has nothing to split.
fn try_break_empty_block_open_tag(
    out: &str,
    tag: &str,
    elem_start: u32,
    elem_end: u32,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    let s = elem_start as usize;

    // The expected open tag is `<tagname>` with no attributes.
    let expected_open = format!("<{tag}>");
    let open_len = expected_open.len();
    let open_tag = out.get(s..s + open_len)?;
    if open_tag != expected_open {
        return None; // has attributes or not this form
    }
    let open_tag_end = s + open_len;

    // Check the line containing the element.
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let line_end = out[elem_end as usize..]
        .find('\n')
        .map_or(out.len(), |i| elem_end as usize + i);
    let line = out.get(line_start..line_end)?;

    // Line must overflow.
    if line.width() <= line_width {
        return None;
    }

    // There must be non-whitespace content AFTER the element's close tag on this
    // line. If the element itself is the only thing on the line, this pass is not
    // needed (another pass handles that case).
    let after_elem = out.get(elem_end as usize..line_end)?;
    if after_elem.bytes().all(|b| b.is_ascii_whitespace()) {
        return None;
    }

    // The element must start at a pure-whitespace line prefix (it's at the indent
    // column, not following other inline content on the same line).
    let before = out.get(line_start..s)?;
    if !before.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let indent = before;

    // Break: `<tagname\n{indent}>`
    let broken = format!("<{tag}\n{indent}>");
    Some((elem_start, open_tag_end as u32, broken))
}

/// Pass 1.95: re-collapse broken open tags whose single-line form now fits at
/// their current column. This undoes incorrect breaks from pass 1 that were
/// caused by a long preceding line; after pass 1.9 has broken inline elements
/// to shorten those lines, the previously-broken element may now sit at a
/// shorter column and fit on one line.
///
/// Example (TextDecoration.svelte): pass 1 broke the red `<Span>` open tag
/// because it was on the same 199-char line as the green `<Span>`. After pass
/// 1.9 broke the green `<Span>`, the red `<Span>` moved to a line starting
/// with `  >, ` (column 5). Its single-line form (74 chars) now fits: 5+74=79.
fn collect_recollapse_open_tag(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(e) => {
                if is_whitespace_preserving(e.name.as_str()) {
                    continue;
                }
                if let Some(edit) = try_recollapse_open_tag(
                    out,
                    e.name.as_str(),
                    &e.attributes,
                    e.start,
                    &e.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                }
                collect_recollapse_open_tag(out, &e.fragment, line_width, edits);
            }
            TemplateNode::Component(c) => {
                if let Some(edit) = try_recollapse_open_tag(
                    out,
                    c.name.as_str(),
                    &c.attributes,
                    c.start,
                    &c.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                }
                collect_recollapse_open_tag(out, &c.fragment, line_width, edits);
            }
            _ => {
                for child in child_fragments(node) {
                    collect_recollapse_open_tag(out, child, line_width, edits);
                }
            }
        }
    }
}

fn try_recollapse_open_tag(
    out: &str,
    tag: &str,
    attrs: &[rsvelte_core::ast::template::Attribute],
    elem_start: u32,
    fragment: &Fragment,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    if attrs.is_empty() {
        return None;
    }
    let first = fragment.nodes.first()?;
    let open_tag_end = node_start(first) as usize;
    let open_tag = out.get(elem_start as usize..open_tag_end)?;

    // Open tag must be multi-line (contains `\n`) to be worth recollapsing.
    if !open_tag.contains('\n') {
        return None;
    }
    // Open tag must end with `>`.
    if !open_tag.ends_with('>') {
        return None;
    }

    // The element must have non-whitespace text before it on the same line.
    // Elements at line start were broken by pass 1 for their own reasons (e.g.,
    // a long attribute list) — we only recollapse elements that were broken
    // because of the long PRECEDING CONTEXT, which is reflected by having
    // non-whitespace content before them on the same line.
    let elem_start_usize = elem_start as usize;
    let line_start = out[..elem_start_usize].rfind('\n').map_or(0, |i| i + 1);
    let before = out.get(line_start..elem_start_usize)?;
    if before.is_empty() || before.bytes().all(|b| b == b' ' || b == b'\t') {
        return None; // element is at line start — don't recollapse
    }

    // Only recollapse when the content after `>` starts with whitespace
    // (hug_start=false). For hug_start=true elements, the multi-line open tag
    // is part of the hug break pattern and must not be collapsed back to a
    // single-line form — collapsing would inline the content and break the
    // close-tag `>` structure.
    let first_child_text = out.get(open_tag_end..node_end(first) as usize)?;
    if !first_child_text.starts_with([' ', '\t', '\r', '\n']) {
        return None; // hug_start=true — don't recollapse
    }

    // Build the single-line form: `<tag attr1 attr2>`.
    let mut single_line = format!("<{tag}");
    for attr in attrs {
        let (as_, ae) = attribute_span(attr);
        let atext = out.get(as_ as usize..ae as usize)?;
        // If any attribute is multi-line, can't collapse to single line.
        if atext.contains('\n') {
            return None;
        }
        single_line.push(' ');
        single_line.push_str(atext);
    }
    single_line.push('>');

    // Check if single-line form fits at the element's current column.
    let col = before.width();
    if col + single_line.width() > line_width {
        return None;
    }

    // Only emit if the forms differ.
    (single_line != open_tag).then_some((elem_start, open_tag_end as u32, single_line))
}

/// Pass 1.6: targeted `try_collapse` sweep on inline/component pure-text
/// elements. Runs after pass 1 so that block restructuring (e.g.
/// `try_break_block_multiline_content` on `<li>`) exposes inline children
/// (`<a>`, `<A>`) that need their multi-line open tags hugged.
/// Only visits non-block elements; block elements were already handled in
/// pass 1 and their layout must not be disturbed.
fn collect_try_collapse_only(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
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
                        Some(node),
                    )
                {
                    edits.push(edit);
                    continue; // edit owns this element, don't recurse
                }
                collect_try_collapse_only(out, &elem.fragment, line_width, edits);
            }
            TemplateNode::Component(c) => {
                if let Some(edit) = try_collapse(
                    out,
                    c.name.as_str(),
                    c.start,
                    c.end,
                    &c.fragment,
                    line_width,
                    None,
                ) {
                    edits.push(edit);
                    continue;
                }
                collect_try_collapse_only(out, &c.fragment, line_width, edits);
            }
            TemplateNode::TitleElement(t) => {
                collect_try_collapse_only(out, &t.fragment, line_width, edits);
            }
            TemplateNode::SvelteBody(s)
            | TemplateNode::SvelteDocument(s)
            | TemplateNode::SvelteFragment(s)
            | TemplateNode::SvelteBoundary(s)
            | TemplateNode::SvelteHead(s)
            | TemplateNode::SvelteOptions(s)
            | TemplateNode::SvelteSelf(s)
            | TemplateNode::SvelteWindow(s) => {
                collect_try_collapse_only(out, &s.fragment, line_width, edits);
            }
            TemplateNode::SvelteComponent(c) => {
                collect_try_collapse_only(out, &c.fragment, line_width, edits);
            }
            TemplateNode::SvelteElement(e) => {
                collect_try_collapse_only(out, &e.fragment, line_width, edits);
            }
            TemplateNode::IfBlock(blk) => {
                collect_try_collapse_only(out, &blk.consequent, line_width, edits);
                if let Some(alt) = &blk.alternate {
                    collect_try_collapse_only(out, alt, line_width, edits);
                }
            }
            TemplateNode::EachBlock(blk) => {
                collect_try_collapse_only(out, &blk.body, line_width, edits);
                if let Some(fb) = &blk.fallback {
                    collect_try_collapse_only(out, fb, line_width, edits);
                }
            }
            TemplateNode::AwaitBlock(blk) => {
                if let Some(f) = &blk.pending {
                    collect_try_collapse_only(out, f, line_width, edits);
                }
                if let Some(f) = &blk.then {
                    collect_try_collapse_only(out, f, line_width, edits);
                }
                if let Some(f) = &blk.catch {
                    collect_try_collapse_only(out, f, line_width, edits);
                }
            }
            TemplateNode::KeyBlock(blk) => {
                collect_try_collapse_only(out, &blk.fragment, line_width, edits);
            }
            TemplateNode::SnippetBlock(blk) => {
                collect_try_collapse_only(out, &blk.body, line_width, edits);
            }
            TemplateNode::SlotElement(s) => {
                collect_try_collapse_only(out, &s.fragment, line_width, edits);
            }
            _ => {}
        }
    }
}

fn collect(
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
        edits,
        &mut consumed,
    );
    let in_consumed_run =
        |start: u32, end: u32| consumed.iter().any(|&(s, e)| s <= start && end <= e);
    for node in &fragment.nodes {
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
                    Some(node),
                ) {
                    edits.push(edit);
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
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_break_block_multiline_content(
                    out,
                    elem.name.as_str(),
                    elem.start,
                    elem.end,
                    &elem.fragment,
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
                collect(out, &s.fragment, line_width, false, options, edits)
            }
            TemplateNode::SvelteFragment(s) | TemplateNode::SvelteSelf(s) => {
                if let Some(edit) = try_collapse(
                    out,
                    s.name.as_str(),
                    s.start,
                    s.end,
                    &s.fragment,
                    line_width,
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
                if let Some(edit) =
                    try_hug_block_inline_body(out, blk.start, blk.end, &blk.body, line_width)
                {
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
                if let Some(edit) =
                    try_hug_block_inline_body(out, blk.start, blk.end, &blk.fragment, line_width)
                {
                    edits.push(edit);
                } else {
                    collect(out, &blk.fragment, line_width, true, options, edits);
                }
            }
            TemplateNode::SnippetBlock(blk) => {
                // Snippet bodies are NOT treated as inline-collapse block bodies —
                // prettier keeps `<span>...</span>\n{value}` on separate lines in
                // snippet bodies even when they fit on one line. Use false here.
                collect(out, &blk.body, line_width, false, options, edits)
            }
            _ => {}
        }
    }
}

/// Re-lay-out a pure-text element: render it on one line when it fits, else
/// break the content onto its own indented line(s) (word-fill). Returns the edit
/// when the ideal layout differs from the element's current rendering in `out`.
fn try_collapse(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    node: Option<&TemplateNode>,
) -> Option<(u32, u32, String)> {
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
        // Case 1: block/component — collapse completely.
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

    let column = current_column(out, start);
    if !one_line.contains('\n') && column + one_line.width() <= line_width {
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
            let close_indent = if let Some(nl) = close.rfind('\n') {
                &close[nl + 1..close.len().saturating_sub(1)]
            } else {
                ""
            };
            // Attribute-level indent: element indent + 2 spaces (same as the
            // single-line hug path). We derive it from `close_indent` rather
            // than the last open-tag line because the last line could be a
            // continuation of a multi-line attribute value (e.g. the RHS of an
            // `onclick={() =>\n  expr}` attribute), not the attribute keyword.
            let inner_indent = format!("{close_indent}  ");
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
                    let result = format!("{open}{collapsed}\n{elem_indent}</{tag}>");
                    if result != whole {
                        return Some((start, end, result));
                    }
                }
                return None;
            }
            let last_line_width = last_open_line.width() + collapsed.width() + 2 + tag.width();
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
            let hug_width = inner_indent.width() + 1 + collapsed.width() + 2 + tag.width();
            if hug_width <= line_width {
                let hug = format!("{prefix}\n{inner_indent}>{collapsed}</{tag}\n{close_indent}>");
                return (hug != whole).then_some((start, end, hug));
            }
            // Content is too long for a single hug line — fill-wrap the text
            // across multiple lines at the inner indent level.
            // First line: `  >word1 word2…` (1 char for `>` reduces avail)
            // Continuation lines: `  word3 word4…`
            let first_avail = line_width.saturating_sub(inner_indent.width() + 1).max(1);
            let cont_avail = line_width.saturating_sub(inner_indent.width()).max(1);
            let mut fill_lines: Vec<String> = Vec::new();
            let mut cur = String::new();
            let avail_for = |n: usize| if n == 0 { first_avail } else { cont_avail };
            for word in collapsed.split_whitespace() {
                if cur.is_empty() {
                    cur.push_str(word);
                } else if cur.width() + 1 + word.width() <= avail_for(fill_lines.len()) {
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
            use std::fmt::Write as _;
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
        let inner_indent = format!("{indent}  ");
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
        let trailing_edge_extra = if had_trail && !trims_edge_whitespace(tag) {
            1
        } else {
            0
        };
        let same_line_width =
            column + open.width() + collapsed.width() + 2 + tag.width() + trailing_edge_extra;
        if same_line_width <= line_width {
            let result = format!("{open}{collapsed}</{tag}\n{indent}>");
            return (result != whole).then_some((start, end, result));
        }
        // Inner-indent hug: open tag wraps so `>` moves to the next indented line
        // and content glues directly to it: `<a\n  href="…"\n  >text</a\n>`.
        let hug_width = inner_indent.width() + 1 + collapsed.width() + 2 + tag.width();
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
                    let base_level = indent.width() / 2;
                    let printed = crate::doc::print(elem_doc, line_width, "  ", base_level, column);
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
    let inner_indent = format!("{indent}  ");
    let avail = line_width.saturating_sub(inner_indent.width()).max(1);

    let mut broken = String::with_capacity(whole.len() + 8);
    broken.push_str(open);
    for line in fill(&collapsed, avail) {
        broken.push('\n');
        broken.push_str(&inner_indent);
        broken.push_str(&line);
    }
    broken.push('\n');
    broken.push_str(indent);
    broken.push_str(close);

    (broken != whole).then_some((start, end, broken))
}

/// Greedy word-wrap `text` into lines no wider than `width` (each line keeps at
/// least one word). Mirrors prettier's fill for inline text content.
fn fill(text: &str, width: usize) -> Vec<String> {
    let mut lines = Vec::new();
    let mut cur = String::new();
    for word in text.split(' ').filter(|w| !w.is_empty()) {
        if cur.is_empty() {
            cur.push_str(word);
        } else if cur.width() + 1 + word.width() <= width {
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

fn text_start(node: &TemplateNode) -> Option<u32> {
    match node {
        TemplateNode::Text(t) => Some(t.start),
        _ => None,
    }
}

fn text_end(node: &TemplateNode) -> Option<u32> {
    match node {
        TemplateNode::Text(t) => Some(t.end),
        _ => None,
    }
}

/// Visual column where `pos` sits (width of its line's prefix).
fn current_column(out: &str, pos: u32) -> usize {
    let pos = pos as usize;
    let line_start = out[..pos].rfind('\n').map_or(0, |i| i + 1);
    out[line_start..pos].width()
}

/// Display width of a string that may contain HTML entities.
///
/// Each `&name;` or `&#N;` entity counts as 1 character (the width of its
/// decoded code-point), not as the raw byte-length of the `&…;` sequence.
/// This matches prettier's behaviour, which measures HTML text after entity
/// substitution so that `&nbsp;` (6 bytes) contributes 1 column, not 6.
fn html_display_width(s: &str) -> usize {
    let mut width = 0usize;
    let mut rest = s;
    while let Some(amp) = rest.find('&') {
        // Count the literal part before the `&`.
        width += rest[..amp].width();
        let after_amp = &rest[amp + 1..];
        if let Some(semi) = after_amp.find(';') {
            // Treat the entire `&…;` as 1 display character.
            width += 1;
            rest = &after_amp[semi + 1..];
        } else {
            // No closing `;` — count the remaining `&…` literally.
            width += rest[amp..].width();
            return width;
        }
    }
    // No more `&` — count the tail.
    width += rest.width();
    width
}

/// Elements whose default CSS display is block / list-item — prettier trims the
/// leading/trailing whitespace of their text content. Everything else keeps a
/// single edge space. Mirrors prettier's `CSS_DISPLAY_DEFAULTS`.
fn is_block_display(tag: &str) -> bool {
    // Delegates to the canonical shared list in markup.rs.
    // `script` / `style` are intentionally excluded here — they are handled
    // by `is_whitespace_preserving` in this pass instead.
    crate::markup::is_html_block_display_element(tag)
}

fn is_whitespace_preserving(tag: &str) -> bool {
    // `pre` / `textarea` preserve whitespace; `script` / `style` carry raw
    // JS/CSS already formatted by their dedicated passes (oxfmt). None of these
    // may have their text content reflowed as prose by the collapse pass.
    matches!(tag, "pre" | "textarea" | "script" | "style")
}

/// Tags whose text content has its leading/trailing whitespace trimmed when
/// collapsed onto one line: block / list-item elements (CSS_DISPLAY_DEFAULTS),
/// plus the `display:contents` elements `<slot>` / `<svelte:boundary>`, which
/// prettier / oxfmt also edge-trim (`<slot> x </slot>` → `<slot>x</slot>`).
/// Everything else (inline, inline-block, table-cell, …) keeps one edge space.
///
/// Note: `<svelte:element>` is NOT listed here — it is a non-block dynamic
/// element that prettier treats like an inline/component element for hugging
/// purposes (shouldHugStart/End return true when content is directly adjacent).
/// Its edge whitespace is still trimmed via `is_component_tag` in the `trims_edge`
/// computation, so one-line edge spaces are suppressed without blocking hug.
fn trims_edge_whitespace(tag: &str) -> bool {
    is_block_display(tag) || matches!(tag, "slot" | "svelte:boundary")
}

/// Whether `tag` names a Svelte component (or component-like element) rather
/// than a plain HTML element: a capitalized name (`Button`), a member access
/// (`Foo.Bar`), or a `svelte:*` special element. prettier treats these as not
/// whitespace-sensitive, so their child boundary whitespace is dropped (no edge
/// space) — unlike unknown lowercase custom elements (`<my-widget>`).
fn is_component_tag(tag: &str) -> bool {
    // A `svelte:*` special element, or a name whose first segment is capitalized:
    // a plain component (`Button`) or a member-access component (`Foo.Bar`) both
    // start with an uppercase letter. A lowercase dotted name (`foo.bar`) is not a
    // component, so don't match on `.` alone.
    tag.starts_with("svelte:") || tag.chars().next().is_some_and(|c| c.is_ascii_uppercase())
}

/// If `node` is a huggable display:inline element — single line, simple text
/// content (no nested element tags), an open tag ending in `>` — return its
/// `(open_without_bracket, inner_content, tag)` for the hug break.
fn element_hug_parts(out: &str, node: &TemplateNode) -> Option<(String, String, String)> {
    // Extract tag name, attributes, fragment start/end for both RegularElement
    // and Component variants (Components like `<A href="/">text</A>` appear in
    // inline prose runs and need the same hug treatment).
    let (tag, attrs, frag, elem_start, elem_end) = match node {
        TemplateNode::RegularElement(e) => {
            let tag = e.name.as_str();
            if is_block_display(tag) || is_inline_block(tag) || trims_edge_whitespace(tag) {
                return None;
            }
            (tag, &e.attributes, &e.fragment, e.start, e.end)
        }
        TemplateNode::Component(c) => (c.name.as_str(), &c.attributes, &c.fragment, c.start, c.end),
        _ => return None,
    };
    let first = frag.nodes.first()?;
    let last = frag.nodes.last()?;
    let content_start = node_start(first) as usize;
    let content_end = node_end(last) as usize;
    let open = out.get(elem_start as usize..content_start)?;
    let content = out.get(content_start..content_end)?;
    let close = out.get(content_end..elem_end as usize)?;
    // Simple text content, an open tag closed by `>`, a real close tag.
    if content.contains('\n')
        || content.contains('<')
        || content.is_empty()
        || !open.ends_with('>')
        || !close.starts_with("</")
    {
        return None;
    }
    // prettier's shouldHugStart / shouldHugEnd: hug only when content is directly
    // adjacent to the open/close tag (no leading/trailing whitespace). Content that
    // starts or ends with whitespace gets block-break treatment (content on its own
    // indented line with `>` and `</tag>` each on their own lines), not hug.
    if content.starts_with([' ', '\t', '\r', '\n']) || content.ends_with([' ', '\t', '\r', '\n']) {
        return None;
    }
    // The open tag is usually single-line, but the markup pass may have already
    // wrapped its attributes (`<a\n  href="…"\n  class="…">`) when it overflowed.
    // In that case `element_doc` rebuilds the open tag as a wrappable attribute
    // group from the AST (see `build_open_attr_doc`), so the verbatim
    // `open_no_bracket` is only a fallback — reconstruct a flat single-line form
    // from the AST attributes so it (and the doc's flat-print guard) stays valid.
    // Each attribute must itself be single-line for the flat reconstruction.
    let open_no_bracket = if open.contains('\n') {
        let mut flat = format!("<{tag}");
        for attr in attrs {
            let (as_, ae) = attribute_span(attr);
            let atext = out.get(as_ as usize..ae as usize)?;
            if atext.contains('\n') {
                return None; // a multi-line attribute can't sit in a flat open tag
            }
            flat.push(' ');
            flat.push_str(atext);
        }
        flat
    } else {
        open[..open.len() - 1].to_string()
    };
    Some((open_no_bracket, content.to_string(), tag.to_string()))
}

/// Break the member chain / binary of an inline expression mustache that sits on
/// an overflowing line, in place. Used for a mustache glued into a hugged inline
/// element's mixed body (`<td\n  >\u{a}\u{emoji.charCodeAt(1).toString(16)}</td`)
/// where the open tag already broke but the long trailing expression kept its
/// chain on one line. Reformats just the `{…}` span, leaving the surrounding
/// text/expressions untouched.
fn try_break_inline_content_tag(
    out: &str,
    node: &TemplateNode,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let es = node_start(node) as usize;
    let ee = node_end(node) as usize;
    let span = out.get(es..ee)?; // `{expr}`
    if !span.starts_with('{') || !span.ends_with('}') || span.contains('\n') || span.len() <= 2 {
        return None;
    }
    let line_start = out[..es].rfind('\n').map_or(0, |i| i + 1);
    let line_end = out[ee..].find('\n').map_or(out.len(), |i| ee + i);
    let line = out.get(line_start..line_end)?;
    if line.width() <= line_width {
        return None; // line fits — nothing to break
    }
    // Break only the RIGHTMOST mustache on the overflowing line: breaking it pulls
    // everything after its first member down, which resolves the overflow. An
    // earlier mustache (another `{…}` still follows on the line) is left flat —
    // prettier breaks only the chain straddling the edge (`\u{a}\u{b.c().d()}`
    // breaks just `{b…}`).
    if out.get(ee..line_end)?.contains('{') {
        return None;
    }
    // If the rightmost `{…}` is followed by a space (indicating prose fill words
    // continue on the same line), this expression is in a fill run that the fill
    // algorithm already broke at the word boundary. Breaking the expression here
    // would split it unnecessarily. Leave it for the fill.
    // Note: a suffix glued directly to the `}` (like `px)` in `{getPixels(...)}px)`)
    // is NOT a fill-run word separator — it's a unit suffix, so we still break it.
    if out
        .get(ee..line_end)
        .is_some_and(|rest| rest.starts_with(' ') || rest.starts_with('\t'))
    {
        return None;
    }
    let _start_col = current_column(out, es as u32);
    // Continuation lands at the line's own indent + one level.
    let indent = &out[line_start..es];
    let lead_ws: String = indent.chars().take_while(|c| c.is_whitespace()).collect();
    let cont_cols = lead_ws.width();
    let inner = span.get(1..span.len() - 1)?.trim();
    // Force OXC to break the expression at the MINIMUM narrowing: use
    // `width = single_line_len - 1` (one char narrower than the flat form).
    // This forces exactly the outermost break (e.g. a call expression breaks its
    // argument list) while giving inner content the widest possible budget —
    // avoiding deep over-breaking when the expression is inside a long line.
    // Previously we computed `width = line_width - inner_start_col - 1 - trailing`,
    // which used the expression's column in the file. For a mustache that sits
    // deep on the line (e.g. at column 65 in an 80-col file), this gave a width
    // as small as 13, causing `df.format(date.end.toDate(getLocalTimeZone()))`
    // to break all the way down to `toDate(\n  getLocalTimeZone(),\n)` instead
    // of the expected `df.format(\n  date.end.toDate(getLocalTimeZone()),\n)`.
    let single_line_len = UnicodeWidthStr::width(inner);
    let width = single_line_len.saturating_sub(1).max(1);
    let wrapped =
        crate::expression::reformat_content_at_width(inner, options, width, cont_cols).ok()?;
    if !wrapped.contains('\n') {
        return None; // didn't break — leave it
    }
    let broken = format!("{{{wrapped}}}");
    (broken != span).then_some((es as u32, ee as u32, broken))
}

/// Wrap the sole content-tag child of a whitespace-preserving element
/// (`<pre>{expr}</pre>`) when its one-line rendering overflows. Unlike a block
/// element, the tags stay glued to the content (no surrounding newlines — the
/// element preserves whitespace), so only the expression breaks internally with
/// its continuation lines pushed out two levels past the element's indent:
///   <pre>{part.value.name +
///       "\n" +
///       part.value.stack.replace(/^\n+/, "")}</pre>
fn try_break_pre_content_tag(
    out: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    // Exactly one child, an expression tag (the only content-tag kind that
    // appears glued inside `<pre>` / `<textarea>` in practice).
    if fragment.nodes.len() != 1 {
        return None;
    }
    let node = &fragment.nodes[0];
    let TemplateNode::ExpressionTag(_) = node else {
        return None;
    };
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    let cs = node_start(node) as usize;
    let ce = node_end(node) as usize;
    let open = out.get(s..cs)?; // `<pre>`
    let close = out.get(ce..e)?; // `</pre>`
    let span = out.get(cs..ce)?; // `{expr}`
    // Only an as-yet-unbroken, overflowing element (a multi-line span was already
    // wrapped at format time — leave it).
    if open.contains('\n') || span.contains('\n') || span.len() <= 2 {
        return None;
    }
    let column = current_column(out, start);
    if column + open.width() + span.width() + close.width() <= line_width {
        return None; // fits on one line
    }
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    // Continuation lines sit one indent level past the element; the expression
    // formatter adds its own level for the broken binary on top of that.
    let iw = options.js.indent_width.value() as usize;
    let cont_cols = indent.width() + iw;
    let inner = span.get(1..span.len() - 1)?.trim(); // strip the `{` … `}`
    // Force the top-level expression to break: the last line carries `}</pre>`,
    // which oxc can't see, so narrow the width by that glued suffix.
    let suffix = 1 + close.width(); // `}` + `</tag>`
    let width = line_width.saturating_sub(cont_cols + suffix).max(1);
    let wrapped =
        crate::expression::reformat_content_at_width(inner, options, width, cont_cols).ok()?;
    if !wrapped.contains('\n') {
        return None; // didn't actually break
    }
    let broken = format!("{open}{{{wrapped}}}{close}");
    (broken != whole).then_some((start, end, broken))
}

/// Split an attribute string (`attr1 attr2="val" attr3={expr}`) into individual
/// attribute tokens, respecting quoted values so spaces inside quotes don't split.
fn split_open_tag_attrs(attrs: &str) -> Vec<&str> {
    let mut result = Vec::new();
    let mut start = 0;
    let mut in_quote = false;
    let mut quote_char = b'"';
    let bytes = attrs.as_bytes();
    for (i, &b) in bytes.iter().enumerate() {
        if in_quote {
            if b == quote_char {
                in_quote = false;
            }
        } else if b == b'"' || b == b'\'' {
            in_quote = true;
            quote_char = b;
        } else if b == b' ' {
            let attr = attrs[start..i].trim();
            if !attr.is_empty() {
                result.push(attr);
            }
            start = i + 1;
        }
    }
    let last = attrs[start..].trim();
    if !last.is_empty() {
        result.push(last);
    }
    result
}

/// Break a `<pre>` (or `<textarea>`) element's own open-tag attributes when the
/// whole element is on one line but overflows `line_width`.
///
/// Example: `<pre class="language-svelte !-mt-2 mb-0">{processedCode}</pre>` at
/// column 10 (85 chars total) →
/// ```text
///   <pre
///     class="language-svelte !-mt-2 mb-0">{processedCode}</pre>
/// ```
///
/// This covers the case where the open tag alone fits but `open + content +
/// close` overflows, and the content expression is too simple to break (so
/// `try_break_pre_content_tag` returns None).
fn try_break_pre_own_attrs(
    out: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    // Only single-line elements.
    if whole.contains('\n') {
        return None;
    }
    // Only elements that overflow.
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let column = indent.width();
    if column + whole.width() <= line_width {
        return None;
    }
    // Find the open tag end (position right after `>` of the opening tag).
    let open_end = if let Some(first) = fragment.nodes.first() {
        node_start(first) as usize
    } else {
        return None;
    };
    let open = out.get(s..open_end)?;
    // Must be a single-line open tag with at least one attribute.
    if open.contains('\n') || !open.contains(' ') || !open.ends_with('>') {
        return None;
    }
    // Parse: `<tagname attr1 attr2 ...>`
    let inner = open.get(1..open.len() - 1)?; // strip `<` and `>`
    let sp = inner.find(' ')?;
    let tag_name = &inner[..sp];
    let attrs_str = inner[sp + 1..].trim();
    let attrs = split_open_tag_attrs(attrs_str);
    if attrs.is_empty() {
        return None;
    }
    let iw = options.js.indent_width.value() as usize;
    let inner_indent = " ".repeat(column + iw);
    let mut new_open = format!("<{tag_name}");
    for attr in &attrs {
        new_open.push('\n');
        new_open.push_str(&inner_indent);
        new_open.push_str(attr);
    }
    // `<pre>` always hugs: `>` stays on the last attribute line.
    new_open.push('>');
    let rest = out.get(open_end..e)?;
    let result = format!("{new_open}{rest}");
    (result != whole).then_some((s as u32, e as u32, result))
}

/// Reorganize inline Component self-closing tags followed by sibling text.
///
/// prettier's fill algorithm prefers to break INSIDE a group (Component open-tag
/// attributes) before breaking at the fill-run sibling boundary.  Our formatter
/// does the opposite: it keeps `<Comp attrs />` on one line but breaks the
/// following `{text}` to the next line.
///
/// When:
///   - A line ends with `<ComponentName attrs... />`
///   - The next line at the same indent has `{text}...;` content
///   - Merging them would overflow `full_width` after real re-indentation
///
/// Transform:
///   `  >&nbsp;...prefix: <Comp attr={x} />`
///   `  {text};`
/// →
///   `  >&nbsp;...prefix: <Comp`
///   `    attr={x}`
///   `  /> {text};`
///
/// Returns `Some(modified)` if any transformation was made, `None` otherwise.
fn reorg_inline_component_attrs(
    formatted: &str,
    content_depth: usize,
    iw: usize,
    full_width: usize,
) -> Option<String> {
    let lines: Vec<&str> = formatted.split('\n').collect();
    let mut result: Vec<String> = Vec::with_capacity(lines.len() + 4);
    let mut changed = false;

    let mut i = 0;
    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim_end();

        // Find an inline self-closing Component `<ComponentName attrs />` in this line.
        // The Component might:
        //   (A) appear at the end of the line: `...prefix: <Comp attr /> `
        //       with the following sibling content on the NEXT line.
        //   (B) appear in the middle of the line: `...prefix: <Comp attr /> suffix;`
        //       (e.g. `/>` followed by more text and close tags on the same line).
        // In both cases we check if the real-width line overflows, and if so,
        // break the component attributes and keep `/>` with the following content.
        let leading_spaces = trimmed.len() - trimmed.trim_start_matches(' ').len();
        let real_depth = leading_spaces / iw + content_depth;
        let real_prefix = real_depth * iw;

        // Find `<ComponentName` (uppercase) followed eventually by `/>` in this line.
        let Some((comp_start, comp_end, suffix_on_line)) = find_inline_selfclose_component(trimmed)
        else {
            result.push(line.to_string());
            i += 1;
            continue;
        };

        // The "suffix" is content after `/>` on the SAME line.
        // The "next_content" is content on the NEXT line (if suffix is empty).
        let (suffix, lines_to_consume) = if !suffix_on_line.trim().is_empty() {
            // Case B: content after `/>` on same line.
            // Guard: if the suffix has unbalanced brackets (`[` or `{` with more
            // opens than closes), the expression continues on the NEXT line and
            // we cannot reorganize this case — the suffix is incomplete.
            let (mut sq, mut cb) = (0i32, 0i32);
            for b in suffix_on_line.bytes() {
                match b {
                    b'[' => sq += 1,
                    b']' => sq -= 1,
                    b'{' => cb += 1,
                    b'}' => cb -= 1,
                    _ => {}
                }
            }
            if sq > 0 || cb > 0 {
                result.push(line.to_string());
                i += 1;
                continue;
            }
            (suffix_on_line.trim(), 1usize)
        } else {
            // Case A: check next line for content at same indent.
            if let Some(next_line) = lines.get(i + 1) {
                let next_trimmed_content = next_line.trim_start_matches(' ');
                let next_spaces = next_line.len() - next_trimmed_content.len();
                if next_spaces == leading_spaces && !next_trimmed_content.is_empty() {
                    (next_trimmed_content, 2usize)
                } else {
                    result.push(line.to_string());
                    i += 1;
                    continue;
                }
            } else {
                result.push(line.to_string());
                i += 1;
                continue;
            }
        };

        // Compute what the merged real-width line would look like.
        let prefix_before_comp = &trimmed[..comp_start];
        let comp_tag = &trimmed[comp_start..comp_end]; // e.g. `<ColorIndicator color={value} />`
        let trimmed_no_leading = trimmed.trim_start_matches(' ');
        // Content from start of line (no leading spaces) to end of `/>` + suffix.
        let content_before_slash = trimmed_no_leading[..comp_end - leading_spaces]
            .trim_end_matches("/>")
            .trim_end();
        let merged_content_len =
            real_prefix + content_before_slash.len() + " /> ".len() + suffix.len();

        if merged_content_len <= full_width {
            // Merged form fits — no need to reorganize.
            result.push(line.to_string());
            i += 1;
            continue;
        }

        // Merged overflows. Break the Component's attributes.
        let Some((tag_name, attrs_str)) = parse_selfclose_comp_tag(comp_tag) else {
            result.push(line.to_string());
            i += 1;
            continue;
        };

        let open_line = format!("{prefix_before_comp}<{tag_name}");
        let close_line = format!("{}{}/> {suffix}", " ".repeat(leading_spaces), "");

        if attrs_str.is_empty() {
            result.push(open_line);
            result.push(close_line);
        } else {
            let attr_indent = leading_spaces + iw;
            let attrs: Vec<&str> = split_component_attrs(attrs_str);
            result.push(open_line);
            for attr in &attrs {
                result.push(format!("{}{attr}", " ".repeat(attr_indent)));
            }
            result.push(close_line);
        }
        i += lines_to_consume;
        changed = true;
    }

    changed.then(|| result.join("\n"))
}

/// Find an inline self-closing Component in the line.
/// Returns `(comp_start, comp_end, suffix_after_close)` where:
/// - `comp_start` = byte offset of `<` in `line`
/// - `comp_end` = byte offset just past `/>` in `line`
/// - `suffix_after_close` = the text after `/>` on the same line (may be empty)
///
/// Only matches when the Component name starts with uppercase and has attributes
/// (a bare `<Comp />` without attributes is not reorganized — it wouldn't help).
/// The component must appear after some non-whitespace prefix (to distinguish
/// from element-direct children at the start of a line).
fn find_inline_selfclose_component(line: &str) -> Option<(usize, usize, &str)> {
    let bytes = line.as_bytes();
    let len = bytes.len();
    // Scan for `<[A-Z]`
    let mut i = 0;
    while i + 1 < len {
        if bytes[i] == b'<' && bytes[i + 1].is_ascii_uppercase() {
            // Found a potential Component start.
            // Verify there's non-whitespace before it (not at start of line content).
            let before = &line[..i].trim_start_matches(' ');
            if before.is_empty() {
                i += 1;
                continue; // starts the line — skip (handled by fix_pre_child_hug_only)
            }
            // Find the matching `/>` close.
            // Scan forward, tracking brace depth.
            let mut j = i + 1;
            let mut brace_depth = 0usize;
            while j < len {
                match bytes[j] {
                    b'{' => brace_depth += 1,
                    b'}' => {
                        brace_depth = brace_depth.saturating_sub(1);
                    }
                    b'/' if brace_depth == 0 && j + 1 < len && bytes[j + 1] == b'>' => {
                        let comp_end = j + 2;
                        let suffix = &line[comp_end..];
                        return Some((i, comp_end, suffix));
                    }
                    _ => {}
                }
                j += 1;
            }
            // No `/>` found after this `<Component` start — not a self-closing comp.
        }
        i += 1;
    }
    None
}

/// Parse a self-closing Component tag like `<Comp attr1={x} attr2="y" />`
/// Returns `(tag_name, attrs_str)` where `attrs_str` is the raw attribute string.
fn parse_selfclose_comp_tag(tag: &str) -> Option<(&str, &str)> {
    // tag starts with `<` and ends with `/>` or `/ >` after trim
    let inner = tag
        .strip_prefix('<')?
        .trim_end_matches('>')
        .trim_end_matches('/')
        .trim();
    // Split tag name from attrs
    let first_space = inner.find([' ', '\t', '\n']);
    if let Some(sp) = first_space {
        let name = &inner[..sp];
        let attrs = inner[sp..].trim();
        Some((name, attrs))
    } else {
        // No attrs
        Some((inner, ""))
    }
}

/// Split a component attributes string into individual attributes.
/// Handles `{expr}` blocks that may contain spaces.
fn split_component_attrs(attrs: &str) -> Vec<&str> {
    let mut result = Vec::new();
    let mut start = 0;
    let mut depth = 0usize;
    let bytes = attrs.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'{' => depth += 1,
            b'}' => {
                depth = depth.saturating_sub(1);
            }
            b' ' | b'\t' if depth == 0 => {
                let attr = attrs[start..i].trim();
                if !attr.is_empty() {
                    result.push(&attrs[start..i]);
                }
                start = i + 1;
            }
            _ => {}
        }
        i += 1;
    }
    let last = attrs[start..].trim();
    if !last.is_empty() {
        result.push(&attrs[start..]);
    }
    result
}

/// Fix the `>` placement for direct children of a `<pre>` inner-content
/// fragment that was re-formatted via [`reformat_pre_inner`].  Only applies
/// Sub-case B (hug `>` to last attribute line): elements whose open tags are
/// multi-line and end with `\n{spaces}>` should have `>` moved to hug the
/// last attr, matching prettier's `isPreTagContent` behavior. Sub-case A
/// (overflow-breaking) is deliberately omitted here — the content is already
/// at a narrowed width and the outer re-indent will handle real column layout.
fn fix_pre_child_hug_only(out: &str, fragment: &Fragment) -> Vec<(u32, u32, String)> {
    let mut edits = Vec::new();
    for node in &fragment.nodes {
        let (child_start, child_end, child_fragment) = match node {
            TemplateNode::RegularElement(e) => (e.start, e.end, &e.fragment),
            TemplateNode::Component(c) => (c.start, c.end, &c.fragment),
            _ => continue,
        };
        let cs = child_start as usize;
        let ce = child_end as usize;
        let Some(whole) = out.get(cs..ce) else {
            continue;
        };
        // Only act on multi-line open tags.
        // Find the first child node and the leading whitespace.
        // The first child node may be a whitespace Text node whose content is
        // the `\n  ` between the `>` and the first real child element.
        // In that case `node_start(first_child) == position_after_gt` and
        // `open[..open_tag_only.len()] == "..."` ends with `>` with no trailing
        // whitespace in `open`.  We need to include the whitespace text in the
        // "trailing_ws" computation.
        let Some(first_child_node) = child_fragment.nodes.first() else {
            continue;
        };
        let open_end = node_start(first_child_node) as usize;
        let Some(open) = out.get(cs..open_end) else {
            continue;
        };
        if !open.contains('\n') {
            continue;
        }
        // Strip trailing whitespace to find the actual `>` of the open tag.
        let open_tag_only = open.trim_end_matches(|c: char| c.is_ascii_whitespace());
        if !open_tag_only.ends_with('>') {
            continue;
        }
        let Some(last_nl) = open_tag_only.rfind('\n') else {
            continue;
        };
        let after_last_nl = &open_tag_only[last_nl + 1..];
        // The line immediately before `>` must consist only of spaces (the
        // non-hug `>` placement). `open_tag_only` ends with `>`, so strip it.
        let Some(before_gt) = after_last_nl.strip_suffix('>') else {
            continue;
        };
        if !before_gt.bytes().all(|b| b == b' ') {
            continue;
        }
        // Compute the trailing whitespace between `>` and the first child.
        // If the first child is a pure-whitespace Text node, its content is
        // the separator; otherwise `open[open_tag_only.len()..]` is the separator.
        let trailing_ws_from_open = &open[open_tag_only.len()..];
        let (trailing_ws, content_start) = if trailing_ws_from_open.is_empty() {
            // The first child might be a leading-whitespace Text node.
            // Find where the whitespace text ends and real content begins.
            match first_child_node {
                TemplateNode::Text(t) => {
                    let text_start = t.start as usize;
                    let text_end = t.end as usize;
                    if let Some(text_content) = out.get(text_start..text_end) {
                        if text_content
                            .bytes()
                            .all(|b| b == b' ' || b == b'\n' || b == b'\t' || b == b'\r')
                        {
                            // Pure whitespace text node — use it as trailing_ws
                            // and start content from the NEXT node.
                            let next_start = if let Some(second) = child_fragment.nodes.get(1) {
                                node_start(second) as usize
                            } else {
                                // No second child — nothing to hug.
                                continue;
                            };
                            (text_content, next_start)
                        } else {
                            // Inline content (the element is already hugged) — skip.
                            continue;
                        }
                    } else {
                        continue;
                    }
                }
                _ => {
                    // The first child is an element/component — trailing_ws must
                    // have been empty meaning content is already inline. Skip.
                    continue;
                }
            }
        } else {
            // trailing_ws_from_open has the whitespace.
            // If empty, the content starts inline (already hugged) — skip.
            if trailing_ws_from_open.trim().is_empty() && trailing_ws_from_open.contains('\n') {
                (trailing_ws_from_open, open_end)
            } else if trailing_ws_from_open.is_empty() {
                continue;
            } else {
                // Non-empty, non-whitespace: content is already inline.
                continue;
            }
        };
        let new_open = format!("{}>", &open_tag_only[..last_nl]);
        let result = format!("{new_open}{trailing_ws}{}", &out[content_start..ce]);
        if result != whole {
            edits.push((child_start, child_end, result));
        }
    }
    edits
}

/// Fix open-tag `>` placement for direct child elements of `<pre>` (or
/// `<textarea>`).  Two sub-cases:
///
/// **A — one-liner overflows**: `<code id="x">long content` → insert
/// `\n{gt_indent}` before the `>` of the open tag:
/// ```text
///     <pre><code id="x"
///             >long content
/// ```
///
/// **B — multi-line attrs, non-hug `>`**: the markup formatter placed `>` on
/// its own line (the default for non-block elements whose content starts with
/// whitespace). Inside `<pre>` that is wrong — a newline before the content
/// would inject significant whitespace. Convert to hug form:
/// ```text
///     <pre><code
///         id="x"
///         class="y">raw content
/// ```
fn try_fix_pre_child_open_tags(
    out: &str,
    pre_start: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Vec<(u32, u32, String)> {
    let mut edits = Vec::new();
    // Determine the `<pre>` element's leading indent column.
    let pre_s = pre_start as usize;
    let pre_line_start = out[..pre_s].rfind('\n').map_or(0, |i| i + 1);
    let pre_leading = &out[pre_line_start..pre_s];
    let pre_indent_col = if pre_leading.bytes().all(|b| b == b' ' || b == b'\t') {
        pre_leading.width()
    } else {
        // `<pre>` does not start at the beginning of its line (e.g. it directly
        // follows another element). Use its actual column.
        current_column(out, pre_start)
    };
    let iw = options.js.indent_width.value() as usize;

    for node in &fragment.nodes {
        // Handle both RegularElement and Component — both can appear as direct
        // children of `<pre>` and need the same open-tag `>` placement fix.
        let (child_start, child_end, child_fragment) = match node {
            TemplateNode::RegularElement(e) => (e.start, e.end, &e.fragment),
            TemplateNode::Component(c) => (c.start, c.end, &c.fragment),
            _ => continue,
        };
        let cs = child_start as usize;
        let ce = child_end as usize;
        let Some(whole) = out.get(cs..ce) else {
            continue;
        };
        // Find where the child's open tag ends (position right after `>`).
        let open_end = if let Some(first_child_node) = child_fragment.nodes.first() {
            node_start(first_child_node) as usize
        } else {
            continue; // empty element – nothing to fix
        };
        let Some(open) = out.get(cs..open_end) else {
            continue;
        };

        // Sub-case A: single-line open tag whose line overflows.
        // The child element may have newlines in its content (text with `\n`,
        // a closing `</code>` on its own line, etc.) — we only need the OPEN
        // TAG to be a single line, and that line to overflow.
        if !open.contains('\n') {
            if !open.ends_with('>') {
                continue;
            }
            // Has no attributes — nothing to break.
            if !open.contains(' ') {
                continue;
            }
            let line_start = out[..cs].rfind('\n').map_or(0, |i| i + 1);
            // Measure the full line (from start through the first `\n` after
            // the open-tag `>`, i.e. including the content that follows `>`).
            let line_nl = out[open_end..]
                .find('\n')
                .map_or(out.len(), |i| open_end + i);
            let line = &out[line_start..line_nl];
            if line.width() <= line_width {
                continue; // fits on one line — no action needed
            }
            // Drop `>` to a new indented line.  The indent sits two levels
            // deeper than `<pre>`'s own indent (one for the child element, one
            // for the inner "attr" indent) so it aligns under the child's attrs
            // in the standard multi-line open-tag shape.
            let gt_indent = " ".repeat(pre_indent_col + 2 * iw);
            let result = format!(
                "{}\n{}>{}",
                &out[cs..open_end - 1],
                gt_indent,
                &out[open_end..ce],
            );
            if result != whole {
                edits.push((child_start, child_end, result));
            }
        }
        // Sub-case B: multi-line open tag with `>` dropped to its own line.
        // Only fires when the `>` is NOT at the oracle's expected indent for
        // a wrapped child element (`pre_indent_col + 2 * iw` spaces). When the
        // `>` IS at the correct position (e.g. after pass 0 converted tabs),
        // it means markup.rs placed it correctly and hugging would be wrong.
        else if open.contains('\n') {
            // `open` runs from the child's start up to the first child's AST
            // start, so it may include whitespace / tabs that follow the `>`
            // (element-direct whitespace before the first child node). Strip
            // trailing whitespace to find where the actual `>` is.
            let open_tag_only = open.trim_end_matches(|c: char| c.is_ascii_whitespace());
            // The open tag (stripped) must end with `\n{spaces}>` (non-hug form).
            if open_tag_only.ends_with('>')
                && let Some(last_nl) = open_tag_only.rfind('\n')
            {
                let after_last_nl = &open_tag_only[last_nl + 1..];
                // The line before `>` must consist entirely of spaces (the
                // indent for the non-hug `>` placement). `open_tag_only` ends
                // with `>` (guarded above), so strip it.
                if let Some(before_gt) = after_last_nl.strip_suffix('>')
                    && before_gt.bytes().all(|b| b == b' ')
                {
                    // If `>` is already at the oracle's correct indent position
                    // (pre_indent_col + 2 * iw spaces), it was placed correctly
                    // (e.g., by markup.rs or by pass 0 tab→space conversion)
                    // and should NOT be hugged. Only hug when `>` is at a
                    // different (wrong) indent level.
                    let correct_indent = pre_indent_col + 2 * iw;
                    if before_gt.len() != correct_indent {
                        // Move `>` to hug the last attribute line (remove the
                        // `\n{spaces}` before `>`). Keep the whitespace between
                        // `>` and the first child intact (it's element-direct
                        // whitespace, e.g. tabs).
                        let trailing_ws = &open[open_tag_only.len()..];
                        let new_open = format!("{}>", &open_tag_only[..last_nl]);
                        let result = format!("{new_open}{trailing_ws}{}", &out[open_end..ce]);
                        if result != whole {
                            edits.push((child_start, child_end, result));
                        }
                    }
                }
            }
        }
    }
    edits
}

/// Hug-break the single inline-element body of a block (`{#each …}<span>…</span>{/each}`)
/// when the whole one-line block overflows. prettier keeps the body inline-adjacent
/// to the block tags (no whitespace in source) and, on overflow, hugs the element:
/// the close `>` drops to its own indented line with the block close tag glued
/// after it —
///   {#each group.breadcrumbs as breadcrumb}<span>{breadcrumb}</span
///     >{/each}
/// Returns the edit when the block currently renders all on one line and overflows.
fn try_hug_block_inline_body(
    out: &str,
    start: u32,
    end: u32,
    body: &Fragment,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    // Only a block that currently renders entirely on one line.
    if whole.contains('\n') {
        return None;
    }
    // Body must be exactly one huggable inline element (directly adjacent to both
    // block tags — guaranteed single-line by `whole` having no newline).
    if body.nodes.len() != 1 {
        return None;
    }
    let elem = &body.nodes[0];
    let (open_nb, content, tag) = element_hug_parts(out, elem)?;
    let elem_start = node_start(elem) as usize;
    let elem_end = node_end(elem) as usize;
    // The block's close tag must glue directly to the element (no whitespace).
    let close = out.get(elem_end..e)?;
    if !close.starts_with("{/") {
        return None;
    }
    // The block must sit at the start of its line (indent = whitespace prefix).
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    if indent.width() + whole.width() <= line_width {
        return None; // fits on one line
    }
    let prefix = out.get(s..elem_start)?; // block open tag (+ no leading ws)
    let hug = format!("{prefix}{open_nb}>{content}</{tag}\n{indent}  >{close}");
    (hug != whole).then_some((start, end, hug))
}

/// Inline-block elements (prettier `CSS_DISPLAY_DEFAULTS`) — display:inline-block.
/// They are not huggable: on overflow they block-break rather than hug.
fn is_inline_block(tag: &str) -> bool {
    matches!(
        tag,
        "input" | "button" | "select" | "object" | "video" | "audio"
    )
}

/// Break a BLOCK element whose only child is a single content tag (`{expr}` /
/// `{@html …}` / `{@render …}`) onto its own line and wrap that tag's expression
/// at the resulting column when the element overflows:
///   <h1>
///     {@html foo(
///       …
///     )}
///   </h1>
/// Restricted to a single content-tag child so it can't disturb prose / multi-
/// child content (which the fill / hug paths own).
fn try_break_content_tag_block(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    if !is_block_display(tag) {
        return None;
    }
    // Exactly one non-whitespace child, and it must be a content tag.
    let mut child: Option<&TemplateNode> = None;
    for n in &fragment.nodes {
        if matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()) {
            continue;
        }
        if child.is_some() {
            return None;
        }
        child = Some(n);
    }
    let node = child?;
    // `(lead, trail)` = the wrapper columns around the expression: `{@html ` / `}`.
    let (kw_lead, kw_trail) = match node {
        TemplateNode::HtmlTag(_) => (7usize, 1usize), // `{@html ` … `}`
        TemplateNode::RenderTag(_) => (9, 1),         // `{@render ` … `}`
        TemplateNode::ExpressionTag(_) => (1, 1),     // `{` … `}`
        _ => return None,
    };

    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    let cs = node_start(node) as usize;
    let ce = node_end(node) as usize;
    let open = out.get(s..cs)?;
    let close = out.get(ce..e)?;
    let span = out.get(cs..ce)?; // the content tag, e.g. `{@html …}`
    if span.contains('\n') || span.len() <= kw_lead + kw_trail {
        return None;
    }

    // When the open tag is multi-line (attributes wrapped), the content tag
    // should break to its own indented line — prettier puts `>` on its own
    // line at the element's indent level, then the content at child indent,
    // then the close tag at the element's indent. This handles:
    //   <p
    //     transition:foo
    //   >{thing}</p>  →  <p\n    transition:foo\n  >\n    {thing}\n  </p>
    if open.contains('\n') {
        if !open.ends_with('>') {
            return None;
        }
        // Determine the element's indent by finding the line start of `start`.
        let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
        let indent = out.get(line_start..s)?;
        if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
            return None;
        }
        let inner_indent = format!("{indent}  ");
        // The last line of `open` ends with `>`, e.g. `    >`.
        // When the `>` is already on its own line (the last line of `open` is
        // purely whitespace + `>`), prettier's block-element behaviour always
        // breaks the content onto its own indented line rather than gluing it to
        // the `>` — matching how prettier formats `<p\n  attr\n>{expr}</p>`.
        // Only skip breaking when the `>` is glued to the last attribute (hug_open
        // form), where the last line contains more than just `>`.
        let open_last_line = open.rsplit('\n').next().unwrap_or(open);
        let gt_on_own_line = open_last_line.trim_start_matches([' ', '\t']) == ">";
        if !gt_on_own_line {
            let glued_width = open_last_line.width() + span.width() + close.width();
            if glued_width <= line_width {
                return None; // fits on the attr+`>` line — leave as-is
            }
        }
        // Break: remove the trailing `>` from the open, put `>` on a new line,
        // then the content, then close.
        // Use `trim_end()` (not just spaces/tabs) so that the trailing `\n    `
        // before the `>` is also removed — otherwise the format string's `\n`
        // prefix would produce a double-newline (blank line) between the last
        // attribute and the `>`.
        let open_without_gt = open[..open.len() - 1].trim_end();
        let inner = span.get(kw_lead..span.len() - kw_trail)?.trim();
        let width = line_width.saturating_sub(inner_indent.width() + kw_lead + kw_trail);
        let wrapped = crate::expression::reformat_content_at_width(
            inner,
            options,
            width,
            inner_indent.width(),
        )
        .ok()?;
        let kw_prefix = &span[..kw_lead];
        let new_tag = format!("{kw_prefix}{wrapped}}}");
        let broken =
            format!("{open_without_gt}\n{indent}>\n{inner_indent}{new_tag}\n{indent}{close}");
        return (broken != whole).then_some((start, end, broken));
    }

    let column = current_column(out, start);
    if column + open.width() + span.width() + close.width() <= line_width {
        return None; // fits on one line
    }

    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let inner_indent = format!("{indent}  ");

    let inner = span.get(kw_lead..span.len() - kw_trail)?.trim();
    let width = line_width.saturating_sub(inner_indent.width() + kw_lead + kw_trail);
    let wrapped =
        crate::expression::reformat_content_at_width(inner, options, width, inner_indent.width())
            .ok()?;
    let kw_prefix = &span[..kw_lead]; // `{@html ` / `{`
    let new_tag = format!("{kw_prefix}{wrapped}}}");
    let broken = format!("{open}\n{inner_indent}{new_tag}\n{indent}{close}");
    (broken != whole).then_some((start, end, broken))
}

/// Break a block-display element whose ENTIRE content (any combination of
/// expression tags, text, block nodes) is currently inline (the span has no
/// newline) but the whole line overflows 80 cols.
///
/// prettier-plugin-svelte's fill/group layout always breaks a block element's
/// content to its own indented line when the one-line form overflows:
///
///   <p>{_0}{_1}…{_40}</p>  →  <p>\n    {_0}{_1}…{_40}\n  </p>
///   <div>{#each …}{/each}</div>  →  <div>\n  {#each …}{/each}\n</div>
///
/// This is the last-resort break: only fires when `try_collapse`, `try_fill_mixed`,
/// `try_hug_mixed`, and `try_break_content_tag_block` all declined.
fn try_break_block_overflow(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    if !is_block_display(tag) {
        return None;
    }

    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;

    // Only act on elements that are currently all inline.
    if whole.contains('\n') {
        return None;
    }

    // prettier-plugin-svelte's `forceBreakContent`: a block-display element whose
    // fragment contains any control-flow block child (IfBlock, EachBlock, AwaitBlock,
    // KeyBlock, SnippetBlock) ALWAYS breaks its content onto a new indented line —
    // even when the whole element fits in 80 columns. This mirrors prettier's
    // `breakParent` / `forceBreakContent` mechanism where Svelte flow-control
    // blocks generate `hardline` separators that force the enclosing group to break.
    let has_flow_block_child = fragment.nodes.iter().any(|n| {
        matches!(
            n,
            TemplateNode::IfBlock(_)
                | TemplateNode::EachBlock(_)
                | TemplateNode::AwaitBlock(_)
                | TemplateNode::KeyBlock(_)
                | TemplateNode::SnippetBlock(_)
        )
    });

    if !has_flow_block_child {
        // Must overflow.
        let column = current_column(out, start);
        if column + whole.width() <= line_width {
            return None;
        }
    }

    // Need at least one non-whitespace child.
    let first_child = fragment
        .nodes
        .iter()
        .find(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))?;
    let last_child = fragment
        .nodes
        .iter()
        .rfind(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))?;

    let first_start = node_start(first_child) as usize;
    let last_end = node_end(last_child) as usize;

    // open tag = element start up to first meaningful child.
    let open = out.get(s..first_start)?;
    // close tag = last meaningful child end to element end.
    let close = out.get(last_end..e)?;
    // content = everything from first to last meaningful child (inclusive).
    let content = out.get(first_start..last_end)?;

    if open.is_empty() || close.is_empty() || content.is_empty() {
        return None;
    }
    // The open tag must end with `>` (no multi-line open).
    if !open.ends_with('>') {
        return None;
    }
    // Content must be fully inline (no newlines).
    if content.contains('\n') {
        return None;
    }

    // Derive element indent from the text before `start` on the same line.
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let inner_indent = format!("{indent}  ");

    let broken = format!("{open}\n{inner_indent}{content}\n{indent}{close}");
    (broken != whole).then_some((start, end, broken))
}

/// Break a block-display element whose content is multi-line but the content
/// is still "glued" to the open and/or close tag (i.e., no newline immediately
/// after `>` or before `</tag>`). This happens when an ExpressionTag or child
/// element had its content reformatted to span multiple lines AFTER the indent
/// pass already ran — so the element's outer `>content</tag>` boundary was
/// never re-laid out.
///
/// Example:
///   `<p>{x1 +\n    x2 + ... x32}</p>`
/// becomes:
///   `<p>\n  {x1 +\n    x2 + ... x32}\n</p>`
///
/// Only fires when:
/// - The element is block-display.
/// - The whole element is multi-line.
/// - The open tag is single-line (no newline before `>`).
/// - The content starts on the same line as `>` (no `\n` right after `>`).
/// - The close tag is on the same line as the last content character.
fn try_break_block_multiline_content(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
) -> Option<(u32, u32, String)> {
    if !is_block_display(tag) {
        return None;
    }

    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;

    // Only act on elements that already have newlines (multi-line content).
    if !whole.contains('\n') {
        return None;
    }

    // Need at least one non-whitespace child.
    let first_child = fragment
        .nodes
        .iter()
        .find(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))?;
    let last_child = fragment
        .nodes
        .iter()
        .rfind(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))?;

    let first_start = node_start(first_child) as usize;
    let last_end = node_end(last_child) as usize;

    // open tag = element start up to first meaningful child.
    let open = out.get(s..first_start)?;
    // close tag = last meaningful child end to element end.
    let close = out.get(last_end..e)?;
    // content = everything from first to last meaningful child (inclusive).
    let content = out.get(first_start..last_end)?;

    if open.is_empty() || close.is_empty() || content.is_empty() {
        return None;
    }
    // Open tag must end with `>`.
    if !open.ends_with('>') {
        return None;
    }

    let open_multiline = open.contains('\n');

    if open_multiline {
        // Multi-line open tag (attributes wrapped): the content must be
        // single-line and must start immediately after the `>` (no newline).
        // If content is already on its own line, nothing to do.
        if content.contains('\n') {
            return None;
        }
        // Content must start on the same line as `>`.
        if out.as_bytes().get(first_start) == Some(&b'\n') {
            return None;
        }
        // Close tag must start on the same line as the last content char.
        if out.as_bytes().get(last_end) == Some(&b'\n') {
            return None;
        }

        // Derive indent from the last line of the open tag (the `>` line).
        let last_nl = open.rfind('\n').unwrap();
        let last_open_line = &open[last_nl + 1..]; // e.g. "    >"
        let ws_len = last_open_line
            .len()
            .saturating_sub(last_open_line.trim_start().len());
        let indent = &last_open_line[..ws_len];
        if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
            return None;
        }
        let inner_indent = format!("{indent}  ");

        let broken = format!("{open}\n{inner_indent}{content}\n{indent}{close}");
        return (broken != whole).then_some((start, end, broken));
    }

    // Single-line open tag path.
    // Content must be multi-line (otherwise try_break_block_overflow handles it).
    if !content.contains('\n') {
        return None;
    }
    // The content must start on the SAME line as `>` (otherwise it's already broken).
    // Check: the char immediately after `>` is NOT a newline.
    if out.as_bytes().get(first_start) == Some(&b'\n') {
        return None;
    }
    // The close tag must start on the SAME line as the last content char.
    if out.as_bytes().get(last_end) == Some(&b'\n') {
        return None;
    }

    // Derive element indent from the text before `start` on the same line.
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let inner_indent = format!("{indent}  ");

    let broken = format!("{open}\n{inner_indent}{content}\n{indent}{close}");
    (broken != whole).then_some((start, end, broken))
}

/// Strip trailing whitespace from a `<slot>` element's inline content.
/// prettier-plugin-svelte trims trailing edge whitespace for component-like elements:
///   `<slot><!-- placeholder--> </slot>` → `<slot><!-- placeholder--></slot>`
///   `<slot><!-- note--> foobar </slot>` → `<slot><!-- note--> foobar</slot>`
fn try_strip_trailing_slot_space(
    out: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
) -> Option<(u32, u32, String)> {
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    if whole.contains('\n') {
        return None; // only collapse inline slots
    }
    // The last child must be a Text node (possibly whitespace-only, possibly with content).
    let last = fragment.nodes.last()?;
    let TemplateNode::Text(t) = last else {
        return None;
    };
    if t.data.is_empty() {
        return None;
    }
    // The rendered text in `out` for this node's span.
    let ts = node_start(last) as usize;
    let te = node_end(last) as usize;
    let rendered = out.get(ts..te)?;
    if rendered.is_empty() {
        return None;
    }
    let trimmed = rendered.trim_end();
    // Only act if there actually IS trailing whitespace to remove.
    if trimmed.len() == rendered.len() {
        return None;
    }
    // Build replacement: open..content_before_trailing_ws + trimmed_text + close_tag.
    let close = out.get(te..e)?;
    let replacement = format!("{}{}{}", &out[s..ts], trimmed, close);
    (replacement != whole).then_some((start, end, replacement))
}

/// Hug-break an inline element whose mixed inline content (expression tags /
/// text / inline elements, directly adjacent to the tags) overflows one line.
/// prettier's `shouldHugStart` / `shouldHugEnd` are true for an inline element
/// whose first/last child is not a text node starting/ending with whitespace, so
/// the open `>` and the close `</tag` glue to the content and only the final `>`
/// sits on its own line:
///   <title
///     >{a} / {b}</title
///   >
/// This mirrors `try_collapse`'s pure-text hug branch, but the content is the
/// rendered mixed-content doc instead of a collapsed text run.
fn try_hug_mixed(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    // Inline elements hug (prettier's `blockElements` excludes button/input/…),
    // so only true block elements and raw-text elements are ineligible.
    if is_block_display(tag) || is_whitespace_preserving(tag) {
        return None;
    }
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;

    // Must be mixed (≥1 non-text child). Comments are always line boundaries.
    // Flow-block children (IfBlock/EachBlock/…) are not inline nodes but are
    // allowed here: when a non-block element contains a flow block, prettier
    // force-breaks it with the hug form even when it would fit on one line
    // (prettier's `forceBreakContent` / `breakParent` for flow blocks).
    let mut has_non_text = false;
    let mut has_flow_block = false;
    for n in &fragment.nodes {
        if !matches!(n, TemplateNode::Text(_)) {
            has_non_text = true;
            if matches!(n, TemplateNode::Comment(_)) {
                return None;
            }
            let is_flow = matches!(
                n,
                TemplateNode::IfBlock(_)
                    | TemplateNode::EachBlock(_)
                    | TemplateNode::AwaitBlock(_)
                    | TemplateNode::KeyBlock(_)
                    | TemplateNode::SnippetBlock(_)
            );
            if is_flow {
                has_flow_block = true;
            } else if !is_inline_node(n) {
                // For Components, also allow block-display RegularElement children
                // (e.g. `<Component><div>…</div></Component>`). Components have
                // block-level semantics so their block children can be hugged.
                let is_block_child_of_component = is_component_tag(tag)
                    && matches!(
                        n,
                        TemplateNode::RegularElement(_) | TemplateNode::Component(_)
                    );
                if !is_block_child_of_component {
                    return None;
                }
            }
        }
    }
    if !has_non_text {
        return None; // pure text → try_collapse
    }

    let content_start = node_start(fragment.nodes.first()?) as usize;
    let content_end = node_end(fragment.nodes.last()?) as usize;
    let open = out.get(s..content_start)?;
    let close = out.get(content_end..e)?;
    if !open.ends_with('>') || !close.starts_with("</") {
        return None;
    }
    let raw = out.get(content_start..content_end)?;
    // Hug only when content is directly adjacent to BOTH tags (shouldHugStart /
    // shouldHugEnd). Whitespace-separated content is `try_fill_mixed`'s job.
    // Exception: for Components (`<Kbd.Group>`, etc.), the trailing edge may have
    // whitespace (newline + indent before `</Tag>`) without affecting the hug — the
    // trailing whitespace is just formatting, not injected CSS whitespace. We allow
    // the hug when only the trailing edge has whitespace, for components only.
    let raw_trail_ws_only = is_component_tag(tag)
        && !raw.starts_with([' ', '\t', '\r', '\n'])
        && raw.ends_with([' ', '\t', '\r', '\n']);
    // Extra exception for Components whose open tag was formatted with `hug_open=true`
    // by markup.rs (the `>` is glued to the last attribute, not on its own line):
    //   `<Component\n  attr>` (hug_open=true) vs `<Component\n  attr\n>` (false).
    // When `hug_open=true`, `open` ends with a non-`\n` char before `>`, and `raw`
    // starts with `\n{inner_indent}` (the child content is on the next indented line).
    // We strip that leading `\n{inner_indent}` from `raw` to produce `adj_raw` so the
    // `open.contains('\n')` path below can apply the correct hug transform.
    // Detect whether markup.rs used `hug_open=true` for this component: the `>`
    // is glued to the last attribute line (not on its own indented line).  In that
    // case the text between the last `\n` in `open` and the trailing `>` is the
    // last attribute content (non-whitespace), whereas `hug_open=false` leaves only
    // whitespace (the outer indent) between the last `\n` and `>`.
    let open_hug_form = if let Some(nl_pos) = open.rfind('\n') {
        // `after_last_nl` = text between last newline and trailing `>`.
        let after_last_nl = &open[nl_pos + 1..open.len().saturating_sub(1)];
        !after_last_nl.bytes().all(|b| b == b' ' || b == b'\t')
    } else {
        false
    };
    let adj_raw: Option<&str> = if is_component_tag(tag)
        && open_hug_form // `>` glued to last attribute (hug_open=true from markup)
        && raw.starts_with('\n')
    {
        // Compute outer indent of the component.
        let line_start_a = out[..s].rfind('\n').map_or(0, |i| i + 1);
        let outer_ind_a = out.get(line_start_a..s).unwrap_or("");
        if outer_ind_a.bytes().all(|b| b == b' ' || b == b'\t') {
            let inner_ind_a = format!("{outer_ind_a}  ");
            let prefix_a = format!("\n{inner_ind_a}");
            if raw.starts_with(prefix_a.as_str()) && !raw[prefix_a.len()..].starts_with([' ', '\t'])
            {
                Some(&raw[prefix_a.len()..])
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    // When we have an adjusted raw (hug_open form), skip the standard early-return
    // for leading whitespace and jump directly to the `open.contains('\n')` handler.
    if adj_raw.is_none()
        && (raw.starts_with([' ', '\t', '\r', '\n'])
            || (raw.ends_with([' ', '\t', '\r', '\n']) && !raw_trail_ws_only))
    {
        return None;
    }
    let column = current_column(out, start);

    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    // Allow a non-whitespace prefix only when it ends with `>` — this happens
    // when an element is immediately preceded by a parent's closing `>` on the
    // same line (e.g. `    ><clipPath …>` inside a `<defs\n    >`). In that
    // case the pure-whitespace part of the prefix is used for inner indentation
    // and the closing `>` position.
    let non_ws_prefix = !indent.bytes().all(|b| b == b' ' || b == b'\t');
    if non_ws_prefix && !indent.ends_with('>') {
        return None;
    }
    // Extract the pure-whitespace portion of the prefix (everything up to and
    // not including a trailing non-whitespace `>`) for use in indented output.
    let ws_indent: &str = if non_ws_prefix {
        let trim_end_pos = indent.rfind([' ', '\t']).map_or(0, |i| i + 1);
        &indent[..trim_end_pos]
    } else {
        indent
    };

    // When the content is already multi-line (e.g. a child element whose
    // attributes wrapped), prettier still applies the hug form: `>` glues
    // to the content's first character and the closing `</tag` sits before
    // the final `>`. Since the content is multi-line the element obviously
    // doesn't fit on one line, so we skip straight to the hug transform.
    // Only handle single-line open tags here; multi-line open tags are
    // handled by the `open.contains('\n')` branch below.
    if raw.contains('\n') && !open.contains('\n') {
        let inner_indent = format!("{ws_indent}  ");
        let open_no_bracket = &open[..open.len() - 1];
        // When raw ends with whitespace (component with trailing newline+indent before
        // `</Tag>`), the trailing whitespace provides the correct indentation, so just
        // use `</{tag}>` directly instead of adding `\n{ws_indent}>`.
        let result = if raw_trail_ws_only {
            format!("{open_no_bracket}\n{inner_indent}>{raw}</{tag}>")
        } else {
            format!("{open_no_bracket}\n{inner_indent}>{raw}</{tag}\n{ws_indent}>")
        };
        return (result != whole).then_some((start, end, result));
    }

    // When an adjusted raw is available (the markup pass used hug_open=true and
    // glued `>` to the last attribute), use adj_raw instead of raw for the
    // `open.contains('\n')` block.  adj_raw has the leading `\n{inner_indent}`
    // stripped so the content is directly adjacent to `>`.
    let raw = adj_raw.unwrap_or(raw);
    // Recompute raw_trail_ws_only with the possibly-updated `raw` (adj_raw may end
    // with whitespace even though the original `raw` started with whitespace).
    let raw_trail_ws_only = is_component_tag(tag)
        && !raw.starts_with([' ', '\t', '\r', '\n'])
        && raw.ends_with([' ', '\t', '\r', '\n']);

    // A multi-line open tag means markup already attribute-wrapped it. prettier's
    // hugged-content group glues `>{content}</tag` to the last attribute line (with
    // the final `>` on its own line) when it fits after the last attr, otherwise
    // it drops the content to its own indented line. Markup can't decide this (no
    // content awareness) — and may have dropped the open `>` to its own line — so
    // finish the decision here, re-gluing to the real last attribute line.
    if open.contains('\n') {
        // Strip the open `>` and any whitespace markup left before a dropped `>`,
        // exposing the real last attribute line.
        let onb = open[..open.len() - 1].trim_end();
        let last_line = onb.rsplit('\n').next().unwrap_or(onb);
        let inner_indent = format!("{ws_indent}  ");
        // When the element is preceded by non-whitespace on the same line (e.g.
        // it follows a sibling's close-tag `>`), `last_line` is just the tag
        // name and does not reflect the true start column. Use `column` (the
        // element's real start column) in that case so we don't incorrectly
        // collapse elements whose merged line would exceed `line_width`.
        let glued = if non_ws_prefix {
            column + 1 + raw.width() + 2 + tag.width()
        } else {
            last_line.width() + 1 + raw.width() + 2 + tag.width()
        };
        if glued <= line_width {
            let result = format!("{onb}>{raw}</{tag}\n{ws_indent}>");
            return (result != whole).then_some((start, end, result));
        }
        // The content is too long to fit even on the inner-indent line. Try to
        // break the content's inner components' attributes using the Doc IR. This
        // handles cases like `<Button\n  >text<Icon class="…"/></Button\n>` where
        // the Icon's attributes need to wrap.
        // For Components where raw ends with whitespace (trailing newline before
        // `</Tag>`), the trailing whitespace provides the natural line break — use
        // `</{tag}>` directly without an additional `\n{ws_indent}>`.  This matches
        // the `raw_trail_ws_only` logic in the single-line-open path.
        let close_form = if raw_trail_ws_only {
            format!("</{tag}>")
        } else {
            format!("</{tag}\n{ws_indent}>")
        };
        let simple = format!("{onb}\n{inner_indent}>{raw}{close_form}");
        if simple != whole {
            return Some((start, end, simple));
        }
        // `simple == whole` — already in the hug form but content still overflows.
        // Use the Doc IR to reformat the inner content, allowing component attributes
        // to break.
        let body_opt = build_children_doc(out, fragment);
        if let Some(body) = body_opt {
            let inner_col = inner_indent.width() + 1; // column after the `>`
            let base_level = inner_indent.width() / 2;
            let printed = crate::doc::print(body, line_width, "  ", base_level, inner_col);
            if printed != raw {
                let result2 = format!("{onb}\n{inner_indent}>{printed}{close_form}");
                if result2 != whole {
                    return Some((start, end, result2));
                }
            }
        }
        // Last-resort: defer the trailing `>` of the last element's close tag to the
        // next line so the combined `  >{content}</{tag}` line fits.  This matches
        // prettier's "shouldHugEnd" close-tag deferral when the content is adjacent
        // (shouldHugStart) and the full inner line would overflow the print width.
        // Concretely: `<Component\n  >{a}</button></Component\n>` overflows as one
        // line; deferring produces `<Component\n  >{a}</button\n  ></Component\n>`.
        // Only fire when:
        //   - The raw content (all on one line) ends with `>`.
        //   - Removing the trailing `>` makes the inner line fit.
        //   - The result differs from the current form.
        let full_inner = inner_indent.width() + 1 + raw.width() + 2 + tag.width();
        if full_inner > line_width && !raw.contains('\n') && raw.ends_with('>') {
            let raw_deferred = &raw[..raw.len() - 1]; // trim the trailing `>`
            let deferred_inner = inner_indent.width() + 1 + raw_deferred.width();
            if deferred_inner <= line_width {
                let result3 = format!(
                    "{onb}\n{inner_indent}>{raw_deferred}\n{inner_indent}></{tag}\n{ws_indent}>"
                );
                if result3 != whole {
                    return Some((start, end, result3));
                }
            }
        }
        return None;
    }

    let element_one_line = column + open.width() + raw.width() + close.width();
    if element_one_line <= line_width && !has_flow_block {
        return None; // fits as-is (and no forced break needed)
    }

    // When a flow block child forces a break and the open tag is single-line,
    // apply the hug form directly. The content (including flow blocks like
    // `{#if}`) stays verbatim on the inner-indent line — the Doc IR path below
    // can't handle flow block children (build_children_doc returns None for them),
    // so this is the only path that produces the correct hug form.
    // Limit this to cases where the content fits on the inner-indent line so we
    // don't produce overflowing output.
    if has_flow_block && !open.contains('\n') {
        let inner_indent = format!("{ws_indent}  ");
        let open_no_bracket = &open[..open.len() - 1];
        let result = format!("{open_no_bracket}\n{inner_indent}>{raw}</{tag}\n{ws_indent}>");
        return (result != whole).then_some((start, end, result));
    }

    // Build prettier's `hugStart && hugEnd` element doc and let the printer make
    // the two independent break decisions:
    //   group([
    //     '<tag …attrs',                                    // open (no `>`)
    //     group(indent([softline, group(['>', body, '</tag'])])),  // hugged
    //     softline,
    //     '>',
    //   ])
    // The inner hugged group keeps `>{body}</tag` glued to the open tag when it
    // fits (only the outer `>` drops to its own line, e.g. `<text …>…</text`\n`>`)
    // and otherwise moves `>{body}</tag` to its own indented line (e.g. `<title`\n
    // `  >…</title`\n`>`).
    use crate::doc::Doc;
    let body_opt = build_children_doc(out, fragment);
    let body = body_opt?;
    let open_no_bracket = open[..open.len() - 1].to_string();
    let inner = Doc::Group(vec![Doc::Concat(vec![
        Doc::Text(">".to_string()),
        body,
        Doc::Text(format!("</{tag}")),
    ])]);
    let hugged = Doc::Group(vec![Doc::Indent(vec![Doc::Softline, inner])]);
    let elem_doc = Doc::Group(vec![
        Doc::Text(open_no_bracket),
        hugged,
        Doc::Softline,
        Doc::Text(">".to_string()),
    ]);
    let level = ws_indent.width() / 2;
    let printed = crate::doc::print(elem_doc, line_width, "  ", level, column);
    (printed != whole).then_some((start, end, printed))
}

/// Narrow mixed-inline fill: when an element with inline content (text +
/// expression tags / inline elements) is currently on ONE line but overflows
/// printWidth, break its content onto its own indented line(s), greedily packed
/// (prettier fill). Currently-multiline mixed content is left to the
/// whitespace-sensitive indent pass — only the clearly-failing one-line overflow
/// is touched, so passing layouts aren't disturbed.
fn try_fill_mixed(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    // Must be mixed (at least one non-text child) and entirely inline.
    let mut has_non_text = false;
    for n in &fragment.nodes {
        if !matches!(n, TemplateNode::Text(_)) {
            has_non_text = true;
            // A comment always sits on its own line(s) — never fill it inline
            // with the surrounding prose. Leave the whole fragment to the
            // indent pass (which keeps the comment on its own line).
            if matches!(n, TemplateNode::Comment(_)) || !is_inline_node(n) {
                return None;
            }
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
    let inner_indent = format!("{indent}  ");

    // Build the prettier content doc (a Concat of per-text-node fills with the
    // inline elements as hug groups in between — a port of prettier-plugin-svelte's
    // `printChildren`) and print it. This reproduces the prose fill + in-place
    // inline-element hug-break exactly.
    let content_doc = build_children_doc(out, fragment)?;
    let base_level = inner_indent.width() / 2;

    // Decide flat-vs-break from the element's *flat* width, not the laid-out
    // result — the content carries bare `line` separators (between mustaches /
    // atoms) that would always break when printed in break mode. Render the
    // content all-flat (a huge width) to measure: a `hardline` (a source blank
    // line) still forces a newline, so flat content with a `\n` is inherently
    // multi-line and must break.
    let flat = crate::doc::print(
        crate::doc::Doc::Group(vec![content_doc.clone()]),
        1_000_000,
        "  ",
        base_level,
        0,
    );
    let column = current_column(out, start);

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
    if !has_text_word && !flat.contains('\n') {
        // For block-display elements that are ALREADY on one source line but have
        // leading/trailing SPACE (not newline) boundary whitespace, collapse to
        // one line and strip the boundary whitespace — prettier's block element
        // trimming behavior.
        // E.g. `<p> {@html raw1} {@html raw2} </p>` → `<p>{@html raw1} {@html raw2}</p>`.
        // Multi-line source (boundary whitespace is newline + indent) is left alone —
        // the indent pass owns those elements.
        if is_block_display(tag) && (had_lead || had_trail) && !raw.contains('\n') {
            let element_one_line = column + open.width() + flat.width() + close.width();
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
            .filter(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))
            .count();
        let element_one_line = column + open.width() + flat.width() + close.width();
        if is_block_display(tag) && non_ws_child_count > 1 && element_one_line > line_width {
            // Fall through to the doc-print break path below.
        } else {
            return None;
        }
    }

    if !flat.contains('\n') {
        let element_one_line = column + open.width() + flat.width() + close.width();
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
        content_doc,
        line_width,
        "  ",
        base_level,
        inner_indent.width(),
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
        let mcol = inner_indent.width() + printed.width().saturating_sub(mspan.width());
        // Only a call / member chain (not an object / array / arrow literal) wraps
        // by breaking its own internals; leave those to other paths.
        let wrappable =
            !inner.is_empty() && !inner.contains("=>") && !inner.starts_with(['{', '[']);
        if glued_after_nonspace && wrappable && mcol + mspan.width() > line_width {
            let w = line_width.saturating_sub(mcol + 2); // `{` + `}`
            if let Ok(wrapped) = crate::expression::reformat_content_at_width(
                inner,
                options,
                w,
                inner_indent.width(),
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

/// Port of prettier-plugin-svelte's `printChildren` for inline (prose) content:
/// a `Concat` of each text node's `fill(splitTextToDocs)` and each inline
/// Prepend `leading` (a `Doc::Line` or `Doc::Hardline`) to the outermost
/// `Doc::Fill` within `doc`. This produces prettier's "inverted" fill
/// structure `[Line/Hardline, word, Line, word, ...]` for text nodes that
/// started with whitespace, giving "last-word overflow tolerance".
fn prepend_leading_to_fill(doc: crate::doc::Doc, leading: crate::doc::Doc) -> crate::doc::Doc {
    use crate::doc::Doc;
    match doc {
        Doc::Concat(mut items) => {
            if let Some(Doc::Fill(parts)) = items.first_mut() {
                parts.insert(0, leading);
            }
            Doc::Concat(items)
        }
        Doc::Fill(mut parts) => {
            parts.insert(0, leading);
            Doc::Fill(parts)
        }
        other => other,
    }
}

/// Returns `true` when the character immediately before `text_start` in `out`
/// is the `>` of a **close tag** (e.g. `</h3>`) rather than an open tag.
/// Used to decide whether a newline-leading text node was trimmed by prettier's
/// `trimTextNodeLeft` (first-child path → open tag before it) or not (between
/// block siblings → close tag before it).
fn text_preceded_by_close_tag(out: &str, text_start: usize) -> bool {
    if text_start == 0 {
        return false;
    }
    // The character immediately before the text node must be `>`.
    let before = &out[..text_start];
    if !before.ends_with('>') {
        return false;
    }
    // Search backwards (at most 512 bytes) for the matching `<`.
    // Ensure search_start is on a valid UTF-8 char boundary.
    let mut search_start = before.len().saturating_sub(512);
    while search_start < before.len() && !before.is_char_boundary(search_start) {
        search_start += 1;
    }
    let search = &before[search_start..];
    let rel_pos = match search.rfind('<') {
        Some(p) => p,
        None => return false,
    };
    // If the char after `<` is `/`, it's a close tag.
    search.as_bytes().get(rel_pos + 1) == Some(&b'/')
}

/// element's hug `Group`. Boundary whitespace is handled so an element can hug in
/// place (the preceding text fill's trailing `line` stays flat) or move to a
/// fresh line (a `hardline`). The first child's leading and last child's trailing
/// whitespace are dropped (the element wrapper owns that newline).
fn build_children_doc(out: &str, fragment: &Fragment) -> Option<crate::doc::Doc> {
    build_children_doc_nodes(out, &fragment.nodes, false, false)
}

// `use_word_first`: when true, a trailing text node that follows a non-void
// inline element and starts with a space is converted to word-first format.
// Only pass `true` from `try_fill_run` where the element fits flat in context.
fn build_children_doc_nodes(
    out: &str,
    nodes: &[TemplateNode],
    allow_elem_expr_collapse: bool,
    use_word_first: bool,
) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    let n = nodes.len();
    let mut docs: Vec<Doc> = Vec::new();
    // Whether the previous text node ended with a (trimmed) space, so the next
    // inline element carries a leading `line` (prettier's
    // `handleWhitespaceOfPrevTextNode`).
    let mut ws_prev = false;

    for (i, node) in nodes.iter().enumerate() {
        match node {
            TemplateNode::Text(t) => {
                ws_prev = false;
                let txt = out.get(t.start as usize..t.end as usize)?;
                let trim_left = i == 0;
                let trim_right = i == n - 1;
                let prev_inline = i > 0 && is_inline_regular_element(&nodes[i - 1]);
                let next_inline = i + 1 < n && is_inline_regular_element(&nodes[i + 1]);
                let mut tl = trim_left;
                let mut tr = trim_right;
                // prettier's `handleTextChild` returns early for the first/last
                // child (no trim, no flag) — the wrapper owns that boundary — so
                // the boundary handling below only applies to middle text nodes.
                let ws_only = txt.split_whitespace().next().is_none();
                //
                // Leading space after an inline element: trim it from this fill
                // and append a `line` to the previous element's doc so the
                // element and the following space break together (the element
                // can then sit at the end of a line with the next word wrapping).
                //
                // For the LAST text node after a VOID inline element (empty fragment,
                // e.g. `<input>`, `<br>`), use a unified Fill([elem, Line, w1, Line, w2, …]).
                // This lets the fill algorithm decide whether elem+first_word fits
                // (and break before the first word when it doesn't) rather than
                // having the old Fill([Line, words…]) structure, where Line acts as
                // a 1-char content atom that always "fits", causing the first word
                // to overflow on the same line as the element.
                //
                // For content elements (non-empty fragment, e.g. `<code>`, `<strong>`),
                // keep the old Fill([Line, words…]) structure: the Line acts as a
                // 1-char content atom that fits after the element's closing `>`,
                // keeping text glued to the closing `>` even when the element itself
                // was forced multi-line by its attributes.
                // A TRUE void HTML element (`<input>`, `<br>`, `<img>`, `<hr>`, …)
                // always ends with `/>` and has no closing tag. Its cursor
                // position after printing is well-defined even when its attributes
                // wrap, so a unified Fill correctly models the line-break decision.
                // Empty non-void elements (`<span></span>`, `<span class="…"></span>`)
                // also have `e.fragment.nodes.is_empty()` but their hug-doc may
                // place the close tag on an indented line — merging those into a
                // unified Fill breaks the `></tag> text` glue. Restrict the unified
                // path to HTML void elements only.
                let prev_is_void_inline = i > 0
                    && matches!(&nodes[i - 1], TemplateNode::RegularElement(e)
                        if is_html_void_element(e.name.as_str()));
                if !trim_left && prev_inline && starts_with_space_no_break(txt) && !ws_only {
                    // Count text words to decide whether to merge into a unified Fill.
                    // With only ONE word (e.g. "°F"), the old Fill([Line, word]) structure
                    // correctly tolerates slight overflow — prettier keeps a lone final word
                    // on the same line as the element even if it overflows by a char or two.
                    // With TWO or more words, the unified Fill correctly breaks before the
                    // first word when it doesn't fit after the element.
                    let text_word_count = txt.split_whitespace().count();
                    if trim_right && prev_is_void_inline && text_word_count >= 2 {
                        // Last text node (≥2 words) after a void inline element: unified Fill.
                        if let Some(prev) = docs.pop() {
                            let text_parts = split_text_to_docs(txt, true, true);
                            let mut fill_parts = vec![prev, Doc::Line];
                            fill_parts.extend(text_parts);
                            docs.push(Doc::Fill(fill_parts));
                            continue;
                        }
                        // No prev element to merge; fall through to normal handling.
                    } else if !trim_right {
                        // Middle text node: old Group([prev, Line]) + Fill([words]).
                        if let Some(prev) = docs.pop() {
                            docs.push(Doc::Group(vec![prev, Doc::Line]));
                        }
                        tl = true;
                    } else if use_word_first && !prev_is_void_inline && n == 2 {
                        // Last text node after a non-void inline element when the
                        // caller requested word-first format (i.e. `try_fill_run`),
                        // and the run has exactly 2 nodes (element + text).
                        // Wrap the element in Group([prev, Line]) so the fill starts
                        // with a word; the fill algorithm then correctly breaks at
                        // the right boundary instead of placing an overflowing word
                        // on the current line via the separator-first pair-fits check.
                        // Only safe when the element is known to fit flat (guaranteed
                        // by try_fill_run's non-ws-prefix guard and indentation check).
                        // Void elements (input, br, img) keep the old behavior since
                        // their text content (e.g. " °F") should stay glued to them.
                        // Restrict to n==2 (single element + text): longer runs have
                        // middle nodes handled by the `!trim_right` branch already;
                        // applying Group([elem, Line]) to the tail element of a 5-node
                        // run shifts the fill structure in a way that breaks the
                        // intermediate word-wrap boundaries.
                        if let Some(prev) = docs.pop() {
                            docs.push(Doc::Group(vec![prev, Doc::Line]));
                        }
                        tl = true;
                    }
                    // trim_right && (prev_is_void_inline || !use_word_first): old behavior.
                }
                // Trailing space before an inline element: trim it from this fill
                // and flag the element to carry the leading `line` (hug in place):
                // a first text node instead keeps its trailing `line` inside the
                // fill (prints as a flat space) and the inline element stays bare,
                // so it hug-breaks in place rather than breaking onto its own line.
                //
                // Special case: a whitespace-only text node between two inline
                // elements (e.g. `<kbd>…</kbd> <kbd>K</kbd>` with Text(" ")
                // in the middle) fires BOTH the prev-inline and next-inline checks.
                // The prev-inline check already appended a trailing `Line` to the
                // preceding element's doc; adding a leading `Line` via `ws_prev`
                // would produce two spaces in flat mode. Skip `ws_prev` when the
                // separator was already placed by `tl`.
                if !trim_left
                    && !trim_right
                    && next_inline
                    && ends_with_space_no_break(txt)
                    && !(ws_only && tl)
                {
                    tr = true;
                    ws_prev = true;
                }
                // Special case: when `allow_elem_expr_collapse` is true (the run
                // covers all non-whitespace content of the parent fragment, meaning
                // there are no block siblings like `{#if}`/`{#each}` outside the
                // run), a whitespace-only single-newline separator that immediately
                // follows a content inline element (prev_inline) can be a soft break
                // (Doc::Line) instead of a hard break. This lets the enclosing group
                // collapse the run to one line in flat mode when it fits.
                //
                // Example: `<strong>{x}</strong>\n    {feature.endText}` inside an
                // `{#if}` body — the `\n    ` should be Doc::Line so the two nodes
                // collapse to `<strong>{x}</strong> {feature.endText}` when the line
                // fits. This does NOT fire when there are block siblings (e.g.
                // `<strong>{title}</strong>` before a `{#if}` block) because
                // `allow_elem_expr_collapse` is false in that case.
                // A "phrasing content" inline element is one that acts as a
                // prose carrier (e.g. `<strong>`, `<em>`, `<a>`, `<span>`):
                // not block-display, not inline-block (button/select/input),
                // not whitespace-preserving, and has actual content children
                // (non-void). This mirrors the `prev_is_inline_html` logic
                // in indent.rs that suppresses space-to-newline conversion
                // after such elements.
                let prev_is_phrasing_inline = i > 0
                    && matches!(&nodes[i - 1], TemplateNode::RegularElement(e)
                        if !is_block_display(e.name.as_str())
                            && !is_inline_block(e.name.as_str())
                            && !is_whitespace_preserving(e.name.as_str())
                            && !e.fragment.nodes.is_empty());
                // The following node must NOT be another inline element —
                // two sibling elements (`<a>home</a>\n<a>about</a>`) stay on
                // separate lines.  Only collapse when the next node is an
                // ExpressionTag / HtmlTag / etc. (a non-element inline atom).
                let next_is_not_element = i + 1 < n
                    && !matches!(
                        &nodes[i + 1],
                        TemplateNode::RegularElement(_)
                            | TemplateNode::Component(_)
                            | TemplateNode::SlotElement(_)
                    );
                let use_soft_break = allow_elem_expr_collapse
                    && ws_only
                    && !trim_left
                    && !trim_right
                    && prev_is_phrasing_inline
                    && next_is_not_element
                    && txt.chars().filter(|&c| c == '\n').count() == 1;
                if use_soft_break {
                    docs.push(Doc::Line);
                } else {
                    let parts = split_text_to_docs(txt, tl, tr);
                    if ws_only {
                        // Whitespace-only separator (between mustaches / atoms): emit
                        // the bare `line`(s) so they break with the surrounding
                        // element group (prettier's `splitTextToDocs` returns a bare
                        // line here, governed by the parent group's break mode) rather
                        // than a lone `Fill` that always prints flat.
                        //
                        docs.extend(parts);
                    } else {
                        docs.push(Doc::Fill(parts));
                    }
                }
            }
            other if is_inline_regular_element(other) => {
                let elem = element_doc(out, other)?;
                if ws_prev {
                    docs.push(Doc::Group(vec![Doc::Line, elem]));
                } else {
                    docs.push(elem);
                }
                ws_prev = false;
            }
            other => {
                // Expression tag / html tag / component / … : verbatim atom.
                // For Components with text content (`<A href="/">text</A>`), try
                // the same hug-doc treatment as RegularElement so the open tag can
                // break its attributes when the prose line overflows (Increment 6).
                // For self-closing Components with attributes, try to build a
                // wrappable doc so a long `<Icon class="…" />` inside a fill
                // can break its attributes (Increment 5).
                let span = out.get(node_start(other) as usize..node_end(other) as usize)?;
                if span.contains('\n') {
                    return None;
                }
                let elem = if matches!(other, TemplateNode::Component(c) if c.fragment.nodes.is_empty())
                {
                    // Self-closing Component (`<Icon class="…" />`): build a breakable
                    // attribute-wrapping doc first; fall back to element_doc (for the
                    // hug-start path, though rare for self-closing) or plain text.
                    build_self_closing_component_doc(out, other)
                        .or_else(|| element_doc(out, other))
                        .unwrap_or_else(|| Doc::Text(span.to_string()))
                } else if matches!(other, TemplateNode::Component(_)) {
                    // Non-self-closing Component (`<A href="/">text</A>`): hug doc first.
                    element_doc(out, other).unwrap_or_else(|| Doc::Text(span.to_string()))
                } else {
                    build_self_closing_component_doc(out, other)
                        .unwrap_or_else(|| Doc::Text(span.to_string()))
                };
                if ws_prev {
                    docs.push(Doc::Group(vec![Doc::Line, elem]));
                } else {
                    docs.push(elem);
                }
                ws_prev = false;
            }
        }
    }
    if docs.is_empty() {
        return None;
    }
    Some(Doc::Concat(docs))
}

/// Build a wrappable open-tag doc (`<tag` + an attribute group) for a regular
/// element, so a long open tag can break its attributes onto their own lines.
///
/// When `hug_start` is `true` (prettier's `shouldHugStart && !isEmpty`), the `>`
/// belongs to the hugged content so no trailing `dedent(softline)` is emitted:
///   `['<', name, indent(group([line, attr1, line, attr2, …]))]`
///
/// When `hug_start` is `false` (non-hugging element, or empty element), a
/// `Dedent(Softline)` is appended inside the attribute group so the closing `>`
/// lands at the outer (un-indented) column when the group breaks:
///   `['<', name, indent(group([line, attr1, …, dedent(softline)]))]`
///
/// Returns `None` (caller keeps the atomic open string) when there are no
/// attributes or any attribute is multi-line in the formatted output.
fn build_open_attr_doc(
    out: &str,
    node: &TemplateNode,
    tag: &str,
    hug_start: bool,
) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    // Support both RegularElement and Component (the latter appears in inline
    // prose runs as `<A href="/">text</A>` etc.).
    let attrs: &[_] = match node {
        TemplateNode::RegularElement(e) => &e.attributes,
        TemplateNode::Component(c) => &c.attributes,
        TemplateNode::SlotElement(s) => &s.attributes,
        _ => return None,
    };
    if attrs.is_empty() {
        return None;
    }
    let mut group_parts: Vec<Doc> = Vec::with_capacity(attrs.len() * 2 + 1);
    for attr in attrs {
        let (as_, ae) = attribute_span(attr);
        let atext = out.get(as_ as usize..ae as usize)?;
        if atext.contains('\n') {
            return None; // a multi-line attribute can't sit in this flat group
        }
        group_parts.push(Doc::Line);
        group_parts.push(Doc::Text(atext.to_string()));
    }
    // When not hugging start, add dedent(softline) so the trailing `>` drops back
    // to the outer column on break — mirrors prettier's openingTag assembly:
    // `indent(group([…attrs, hugStart && !isEmpty ? '' : dedent(softline)]))`.
    if !hug_start {
        group_parts.push(Doc::Dedent(vec![Doc::Softline]));
    }
    Some(Doc::Concat(vec![
        Doc::Text(format!("<{tag}")),
        Doc::Indent(vec![Doc::Group(group_parts)]),
    ]))
}

/// Whether a fragment's direct children contain at least one prose text word —
/// a `Text` node with a non-whitespace run. Used to gate the component prose
/// fill: only a component whose body interleaves real text with inline children
/// (`<P>… <em>…</em> …</P>`) is word-filled; one that merely holds element
/// children separated by whitespace keeps its per-child layout.
fn fragment_has_prose_word(fragment: &Fragment) -> bool {
    fragment
        .nodes
        .iter()
        .any(|n| matches!(n, TemplateNode::Text(t) if t.data.split_whitespace().next().is_some()))
}

/// Source span of an attribute, mirroring `markup::attribute_span`.
fn attribute_span(attr: &rsvelte_core::ast::template::Attribute) -> (u32, u32) {
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
fn is_inline_regular_element(node: &TemplateNode) -> bool {
    // `<slot>` is parsed as SlotElement but behaves as an inline non-block
    // element in prose runs — it should be treated the same as a RegularElement.
    matches!(node, TemplateNode::SlotElement(_))
        || matches!(node, TemplateNode::RegularElement(e)
            if !is_block_display(e.name.as_str()) && !is_whitespace_preserving(e.name.as_str()))
}

/// Build a wrappable doc for a self-closing `Component` with attributes, so that
/// a long `<Icon class="…" />` inside an inline fill can break its attributes
/// onto their own lines (dedenting `/>` back to the outer column).
///
/// Returns `None` if the component is not self-closing, has no attributes, has
/// multi-line attributes, or if the flat print would not match the verbatim span.
///
/// Mirrors prettier-plugin-svelte's self-closing-tag assembly (~1126-1135):
///   `group(['<', name, indent(group([line, attr1, …, dedent(line)])), '/>'])`
///
/// `dedent(line)` is the key: in flat mode `line` = space so `/>` is adjacent to
/// the last attribute (`<Name attr />`); in break mode `line` emits a newline at
/// `indent-1` (the outer column) so `/>` lands un-indented (`<Name\n  attr\n/>`).
/// `bracketSameLine` is always false for components (no `>` hugging), so the
/// `' '` before `/>` does NOT appear in the closing text.
fn build_self_closing_component_doc(out: &str, node: &TemplateNode) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    let TemplateNode::Component(c) = node else {
        return None;
    };
    // Only for self-closing (empty fragment) components with attributes.
    if c.attributes.is_empty() || !c.fragment.nodes.is_empty() {
        return None;
    }
    let span = out.get(c.start as usize..c.end as usize)?;
    // Must be a single-line self-closing component ending with ` />`
    // (space before `/>`; without a space it would be a different source shape).
    if span.contains('\n') || !span.ends_with(" />") {
        return None;
    }
    let name = c.name.as_str();
    let mut group_parts: Vec<Doc> = Vec::with_capacity(c.attributes.len() * 2 + 1);
    for attr in &c.attributes {
        let (as_, ae) = attribute_span(attr);
        let atext = out.get(as_ as usize..ae as usize)?;
        if atext.contains('\n') {
            return None;
        }
        group_parts.push(Doc::Line);
        group_parts.push(Doc::Text(atext.to_string()));
    }
    // `dedent(line)`: flat → " " (space before `</>`), break → newline at indent-1.
    // This is the spec's `!bracketSameLine ? dedent(line) : ''` — since
    // bracketSameLine is always false for components, `dedent(line)` is always used.
    group_parts.push(Doc::Dedent(vec![Doc::Line]));
    let doc = Doc::Group(vec![
        Doc::Text(format!("<{name}")),
        Doc::Indent(vec![Doc::Group(group_parts)]),
        Doc::Text("/>".to_string()), // no leading space: the `dedent(line)` provides it
    ]);
    // Guard: the flat print must match the verbatim span (trimmed).
    let flat = crate::doc::print(doc.clone(), 999999, "  ", 0, 0);
    if flat.trim() != span.trim() {
        return None;
    }
    Some(doc)
}

/// The doc for one inline element: a hug `Group` for a huggable display:inline
/// element, otherwise the verbatim single-line span.
fn element_doc(out: &str, node: &TemplateNode) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    if let Some((open_no_bracket, content, tag)) = element_hug_parts(out, node) {
        // The open tag is normally atomic, but when it has attributes build it as
        // a wrappable attribute group so a long open tag inside prose can break
        // its attributes onto their own lines (`<a`\n`  href="…">text</a`\n`>`).
        // hug_start=true: content hugs the open tag, so no dedent(softline) inside
        // the attribute group — the `>` belongs to the hugged content assembly.
        let open_doc =
            build_open_attr_doc(out, node, &tag, true).unwrap_or(Doc::Text(open_no_bracket));
        // prettier's `hugStart && hugEnd` doc: the hugged content lives in its
        // OWN group so `>{content}</tag` stays glued to the open tag when it fits
        // (only the trailing `>` drops to its own line), independent of whether
        // the outer element group breaks.
        return Some(Doc::Group(vec![
            open_doc,
            Doc::Group(vec![Doc::Indent(vec![
                Doc::Softline,
                Doc::Group(vec![Doc::Text(format!(">{content}</{tag}"))]),
            ])]),
            Doc::Softline,
            Doc::Text(">".to_string()),
        ]));
    }
    // Empty inline element with attributes (`<span class=… aria-label=…></span>`):
    // wrap the attributes and drop `></tag>` to its own line at the base indent
    // when the open tag overflows.
    if let TemplateNode::RegularElement(e) = node {
        let tag = e.name.as_str();
        if e.fragment.nodes.is_empty()
            && !e.attributes.is_empty()
            && !is_block_display(tag)
            && !is_whitespace_preserving(tag)
        {
            let span = out.get(node_start(node) as usize..node_end(node) as usize)?;
            // Only the `<tag …attrs></tag>` shape (not self-closing, no content).
            if !span.contains('\n')
                && span.ends_with(&format!("></{tag}>"))
                // hug_start=false: empty element (isEmpty=true) → add dedent(softline)
                // so the trailing `>` lands at the outer column on break.
                && let Some(open_doc) = build_open_attr_doc(out, node, tag, false)
            {
                return Some(Doc::Group(vec![open_doc, Doc::Text(format!("></{tag}>"))]));
            }
        }
    }
    // Inline-block elements with simple text content (`<button onclick=…>text</button>`):
    // build a hug doc so the open tag can break its attributes when the element
    // chain overflows.  `element_hug_parts` excludes `is_inline_block` tags (they
    // aren't whitespace-sensitive for standalone hug purposes) but in an inline fill
    // run we still need a breakable doc so adjacent elements can reflow rather than
    // merging onto one overflowing line.  Only for non-empty, text-only content
    // directly adjacent (no leading/trailing space — shouldHugStart && shouldHugEnd).
    if let TemplateNode::RegularElement(e) = node {
        let tag = e.name.as_str();
        if is_inline_block(tag) && !e.attributes.is_empty() && !e.fragment.nodes.is_empty() {
            let span = out.get(node_start(node) as usize..node_end(node) as usize)?;
            if span.contains('\n') {
                return None;
            }
            let first = e.fragment.nodes.first();
            let last = e.fragment.nodes.last();
            if let (Some(first), Some(last)) = (first, last) {
                let content_start = node_start(first) as usize;
                let content_end = node_end(last) as usize;
                let open_text = out.get(node_start(node) as usize..content_start)?;
                let content = out.get(content_start..content_end)?;
                let close = out.get(content_end..node_end(node) as usize)?;
                if !content.contains('\n')
                    && !content.contains('<')
                    && !content.is_empty()
                    && open_text.ends_with('>')
                    && close.starts_with("</")
                    && !content.starts_with([' ', '\t', '\r', '\n'])
                    && !content.ends_with([' ', '\t', '\r', '\n'])
                {
                    let open_doc = build_open_attr_doc(out, node, tag, true)
                        .unwrap_or(Doc::Text(open_text[..open_text.len() - 1].to_string()));
                    // Build a fill doc for the content so mixed text+expr content
                    // (e.g. `count {await delay(count)} | …`) can fill-wrap when
                    // the element is inside a multi-element run and overflows.
                    // Fall back to a flat text atom when the content has no fill
                    // break points (e.g. a pure text "resolve" that fits inline).
                    let inner_content_doc = build_children_doc(out, &e.fragment)
                        .map(|body| {
                            Doc::Group(vec![Doc::Concat(vec![
                                Doc::Text(">".to_string()),
                                body,
                                Doc::Text(format!("</{tag}")),
                            ])])
                        })
                        .unwrap_or_else(|| {
                            Doc::Group(vec![Doc::Text(format!(">{content}</{tag}"))])
                        });
                    return Some(Doc::Group(vec![
                        open_doc,
                        Doc::Group(vec![Doc::Indent(vec![Doc::Softline, inner_content_doc])]),
                        Doc::Softline,
                        Doc::Text(">".to_string()),
                    ]));
                }
            }
        }
    }
    // Non-block RegularElement with element content (content.contains('<')) that is
    // fully inline (no `\n`): prettier hugs start/end when the content is directly
    // adjacent (no leading/trailing whitespace), even when the content contains
    // nested HTML tags. This handles table-section elements like `<tbody>`, `<tr>`,
    // SVG container elements, and any non-block inline element containing child HTML.
    // Build the same hug group as `element_hug_parts` but without the `contains('<')` guard.
    if let TemplateNode::RegularElement(e) = node {
        let tag = e.name.as_str();
        if !is_block_display(tag) && !is_inline_block(tag) && !is_whitespace_preserving(tag) {
            let elem_start = e.start as usize;
            let elem_end = e.end as usize;
            if let (Some(first), Some(last)) =
                (e.fragment.nodes.first(), e.fragment.nodes.last())
                && let (Some(open), Some(content), Some(close)) = (
                    out.get(elem_start..node_start(first) as usize),
                    out.get(node_start(first) as usize..node_end(last) as usize),
                    out.get(node_end(last) as usize..elem_end),
                )
                && !open.contains('\n')
                && !content.contains('\n')
                && content.contains('<') // only this path (text-only handled by element_hug_parts)
                && !content.is_empty()
                && open.ends_with('>')
                && close.starts_with("</")
                && !content.starts_with([' ', '\t', '\r', '\n'])
                && !content.ends_with([' ', '\t', '\r', '\n'])
            {
                let open_no_bracket = &open[..open.len() - 1]; // strip trailing `>`
                let inner_text = format!(">{content}</{tag}");
                let open_doc = build_open_attr_doc(out, node, tag, true)
                    .unwrap_or_else(|| Doc::Text(open_no_bracket.to_string()));
                return Some(Doc::Group(vec![
                    open_doc,
                    Doc::Group(vec![Doc::Indent(vec![
                        Doc::Softline,
                        Doc::Group(vec![Doc::Text(inner_text)]),
                    ])]),
                    Doc::Softline,
                    Doc::Text(">".to_string()),
                ]));
            }
        }
    }
    // `<slot>` with non-empty content that is fully inline (no `\n`):
    // prettier hugs start/end when the content is directly adjacent (no leading/
    // trailing whitespace), even when the content contains nested HTML. Build the
    // same hug group as `element_hug_parts` but without the `contains('<')` guard.
    if let TemplateNode::SlotElement(e) = node {
        let tag = e.name.as_str();
        let elem_start = e.start as usize;
        let elem_end = e.end as usize;
        if let (Some(first), Some(last)) = (e.fragment.nodes.first(), e.fragment.nodes.last())
            && let (Some(open), Some(content), Some(close)) = (
                out.get(elem_start..node_start(first) as usize),
                out.get(node_start(first) as usize..node_end(last) as usize),
                out.get(node_end(last) as usize..elem_end),
            )
            && !open.contains('\n')
            && !content.contains('\n')
            && !content.is_empty()
            && open.ends_with('>')
            && close.starts_with("</")
            && !content.starts_with([' ', '\t', '\r', '\n'])
            && !content.ends_with([' ', '\t', '\r', '\n'])
        {
            let open_no_bracket = &open[..open.len() - 1]; // strip trailing `>`
            let inner_text = format!(">{content}</{tag}");
            let open_doc = build_open_attr_doc(out, node, tag, true)
                .unwrap_or_else(|| Doc::Text(open_no_bracket.to_string()));
            return Some(Doc::Group(vec![
                open_doc,
                Doc::Group(vec![Doc::Indent(vec![
                    Doc::Softline,
                    Doc::Group(vec![Doc::Text(inner_text)]),
                ])]),
                Doc::Softline,
                Doc::Text(">".to_string()),
            ]));
        }
    }
    // Inline-block element WITHOUT attributes but WITH simple text content:
    // produce a hug doc where the CLOSE `>` can defer to the next line when
    // the combined line (element + following content) overflows the print width.
    // This handles e.g. `<button>Hello, this is a test</button>` inside a
    // Component's hug body where the Component's close tag tips the line over 80.
    // The doc is:
    //   Group(["<button>Hello...</button", Softline, ">"])
    // Flat: `<button>Hello...</button>` (Softline = nothing in flat mode) ✓
    // Break: `<button>Hello...</button\n  >` (close `>` deferred to next indent line)
    // Gate: only inline-block without attributes, text-only single-line content.
    if let TemplateNode::RegularElement(e) = node
        && is_inline_block(e.name.as_str())
        && e.attributes.is_empty()
        && !e.fragment.nodes.is_empty()
        && e.fragment
            .nodes
            .iter()
            .all(|n| matches!(n, TemplateNode::Text(_)))
        && let (Some(first), Some(last)) = (e.fragment.nodes.first(), e.fragment.nodes.last())
    {
        let elem_start = e.start as usize;
        let elem_end = e.end as usize;
        let content_start = node_start(first) as usize;
        let content_end = node_end(last) as usize;
        if let (Some(open), Some(content), Some(close_tag)) = (
            out.get(elem_start..content_start),
            out.get(content_start..content_end),
            out.get(content_end..elem_end),
        ) {
            // Only simple single-line hugged content (no whitespace edges).
            if !open.contains('\n')
                && !content.contains('\n')
                && open.ends_with('>')
                && close_tag.starts_with("</")
                && close_tag.ends_with('>')
                && !content.starts_with([' ', '\t', '\r', '\n'])
                && !content.ends_with([' ', '\t', '\r', '\n'])
            {
                // Everything except the final `>` of the close tag.
                let without_final_gt =
                    format!("{open}{content}{}", &close_tag[..close_tag.len() - 1]);
                return Some(Doc::Group(vec![
                    Doc::Text(without_final_gt),
                    Doc::Softline,
                    Doc::Text(">".to_string()),
                ]));
            }
        }
    }
    let span = out.get(node_start(node) as usize..node_end(node) as usize)?;
    if span.contains('\n') {
        return None;
    }
    Some(Doc::Text(span.to_string()))
}

/// Port of prettier's `splitTextToDocs`: words joined by soft `line` breaks, a
/// leading/trailing `line` kept when the text starts/ends with whitespace, and a
/// `hardline` substituted when that boundary whitespace contains a line break
/// (doubled for a blank line). `trim_left`/`trim_right` drop the leading/trailing
/// separator entirely (owned by the element wrapper).
fn split_text_to_docs(text: &str, trim_left: bool, trim_right: bool) -> Vec<crate::doc::Doc> {
    use crate::doc::Doc;
    let starts_ws = text.starts_with(|c: char| c.is_whitespace());
    let ends_ws = text.ends_with(|c: char| c.is_whitespace());
    let words: Vec<&str> = text.split_whitespace().collect();
    let lead_break = leading_linebreaks(text);
    let trail_break = trailing_linebreaks(text);

    let mut docs: Vec<Doc> = Vec::new();
    if words.is_empty() {
        // Whitespace-only text node between two siblings: a single separator
        // (or a blank line when the source had ≥2 newlines).
        if !trim_left && !trim_right {
            match lead_break {
                0 => docs.push(Doc::Line),
                1 => docs.push(Doc::Hardline),
                _ => {
                    docs.push(Doc::Hardline);
                    docs.push(Doc::Hardline);
                }
            }
        }
        return docs;
    }
    if starts_ws && !trim_left {
        match lead_break {
            0 => docs.push(Doc::Line),
            1 => docs.push(Doc::Hardline),
            _ => {
                docs.push(Doc::Hardline);
                docs.push(Doc::Hardline);
            }
        }
    }
    for (i, w) in words.iter().enumerate() {
        if i > 0 {
            docs.push(Doc::Line);
        }
        docs.push(Doc::Text((*w).to_string()));
    }
    if ends_ws && !trim_right {
        match trail_break {
            0 => docs.push(Doc::Line),
            1 => docs.push(Doc::Hardline),
            _ => {
                docs.push(Doc::Hardline);
                docs.push(Doc::Hardline);
            }
        }
    }
    docs
}

/// Number of newlines in the leading whitespace run (capped at 2).
fn leading_linebreaks(s: &str) -> usize {
    s.chars()
        .take_while(|c| c.is_whitespace())
        .filter(|c| *c == '\n')
        .take(2)
        .count()
}

/// Number of newlines in the trailing whitespace run (capped at 2).
fn trailing_linebreaks(s: &str) -> usize {
    s.chars()
        .rev()
        .take_while(|c| c.is_whitespace())
        .filter(|c| *c == '\n')
        .take(2)
        .count()
}

fn ends_with_space_no_break(s: &str) -> bool {
    s.ends_with(|c: char| c.is_whitespace()) && trailing_linebreaks(s) == 0
}

fn starts_with_space_no_break(s: &str) -> bool {
    s.starts_with(|c: char| c.is_whitespace()) && leading_linebreaks(s) == 0
}

fn is_inline_node(node: &TemplateNode) -> bool {
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
        | TemplateNode::Component(_) => true,
        TemplateNode::RegularElement(e) => !is_block_display(e.name.as_str()),
        _ => false,
    }
}

fn node_start(node: &TemplateNode) -> u32 {
    template_node_span(node).0
}

fn node_end(node: &TemplateNode) -> u32 {
    template_node_span(node).1
}

pub(crate) fn template_node_span(node: &TemplateNode) -> (u32, u32) {
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

/// HTML void elements — elements that can never have children and always use
/// the self-closing `/>` form. Their output cursor after printing is
/// well-defined regardless of attribute wrapping, unlike content elements
/// (e.g. `<code>`) whose hugged close tag may end up on an indented line.
fn is_html_void_element(tag: &str) -> bool {
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

#[cfg(test)]
mod tests {
    use super::*;
    use rsvelte_core::ast::template::{FragmentMetadata, FragmentType, Text};

    fn make_fragment_with_text(data: &str) -> Fragment {
        Fragment {
            node_type: FragmentType::Fragment,
            nodes: vec![TemplateNode::Text(Text {
                start: 0,
                end: data.len() as u32,
                raw: data.into(),
                data: data.into(),
            })],
            metadata: FragmentMetadata::default(),
        }
    }

    fn make_empty_fragment() -> Fragment {
        Fragment {
            node_type: FragmentType::Fragment,
            nodes: vec![],
            metadata: FragmentMetadata::default(),
        }
    }

    #[test]
    fn fragment_has_prose_word_with_text() {
        let fragment = make_fragment_with_text("hello world");
        assert!(fragment_has_prose_word(&fragment));
    }

    #[test]
    fn fragment_has_prose_word_empty_text() {
        // Whitespace-only text node has no prose word
        let fragment = make_fragment_with_text("   ");
        assert!(!fragment_has_prose_word(&fragment));
    }

    #[test]
    fn fragment_has_prose_word_empty_fragment() {
        let fragment = make_empty_fragment();
        assert!(!fragment_has_prose_word(&fragment));
    }

    #[test]
    fn is_block_display_standard_elements() {
        assert!(is_block_display("div"));
        assert!(is_block_display("p"));
        assert!(is_block_display("ul"));
        assert!(is_block_display("h1"));
        assert!(is_block_display("section"));
    }

    #[test]
    fn is_block_display_excludes_script_style() {
        // script/style are whitespace-preserving in collapse pass, not block-display
        assert!(!is_block_display("script"));
        assert!(!is_block_display("style"));
    }

    #[test]
    fn is_block_display_excludes_inline_elements() {
        assert!(!is_block_display("span"));
        assert!(!is_block_display("a"));
        assert!(!is_block_display("strong"));
    }
}
