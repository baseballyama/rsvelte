//! Faithful port of prettier-plugin-svelte's `printChildren` child-layout
//! algorithm (milestone 1 of `docs/fmt-layout-port-plan.md`).
//!
//! This module is the **algorithm core**, decoupled from rsvelte's AST: callers
//! (the markup printer, milestone 2) classify each child into [`Child`] and
//! supply its already-built [`Doc`]; [`print_children`] reproduces
//! prettier-plugin-svelte's whitespace handling (text → `fill`, inline-element
//! hug, block-element softlines, `forceBreakContent`) over that sequence. Keeping
//! it free of AST plumbing lets it be unit-tested against prettier's exact output.
//!
//! Mirrors `node_modules/prettier-plugin-svelte/plugin.js`:
//! `printChildren` (≈1873), `splitTextToDocs` (≈2016), the text-node whitespace
//! predicates (≈725–760), and the `blockElements` list (≈77). Whitespace is the
//! HTML "collapse" set `[\t\n\f\r ]`; `htmlWhitespaceSensitivity` is the corpus
//! oracle default `'css'` (so an element is block iff its name is in the list).

use crate::doc::Doc;

/// Whether `name` is an HTML block-level element (prettier-plugin-svelte's
/// `blockElements` list — the 33 names) under the default
/// `htmlWhitespaceSensitivity: 'css'`. Delegates to the single canonical list in
/// [`crate::markup::is_html_block_display_element`] so there is one source of
/// truth (the markup open-tag layout uses the same set).
pub(crate) fn is_block_element_name(name: &str) -> bool {
    crate::markup::is_html_block_display_element(name)
}

// ── HTML-collapse-whitespace text predicates (port of the `*_RE` helpers) ──

fn is_html_ws(c: char) -> bool {
    matches!(c, '\t' | '\n' | '\u{0C}' | '\r' | ' ')
}

/// `getUnencodedText === ''` — a truly-empty text node (dropped by
/// `prepareChildren`), as opposed to a whitespace-only one.
fn is_empty_raw(text: &str) -> bool {
    text.is_empty()
}

/// `isOnlyHtmlCollapseWhitespace` — only collapse-whitespace (or empty).
fn is_only_ws(text: &str) -> bool {
    text.chars().all(is_html_ws)
}

fn starts_with_ws(text: &str) -> bool {
    text.starts_with(is_html_ws)
}

fn ends_with_ws(text: &str) -> bool {
    text.ends_with(is_html_ws)
}

/// `startsWithLinebreak(text, n)` — `^([\t\f\r ]*\n){n}`: `n` newlines, each
/// optionally preceded by non-newline horizontal whitespace, at the very start.
fn starts_with_linebreak(text: &str, n: usize) -> bool {
    let mut rest = text;
    for _ in 0..n {
        let after_h = rest.trim_start_matches(['\t', '\u{0C}', '\r', ' ']);
        match after_h.strip_prefix('\n') {
            Some(r) => rest = r,
            None => return false,
        }
    }
    true
}

/// `endsWithLinebreak(text, n)` — `(\n[\t\f\r ]*){n}$`.
fn ends_with_linebreak(text: &str, n: usize) -> bool {
    let mut rest = text;
    for _ in 0..n {
        let before_h = rest.trim_end_matches(['\t', '\u{0C}', '\r', ' ']);
        match before_h.strip_suffix('\n') {
            Some(r) => rest = r,
            None => return false,
        }
    }
    true
}

fn trim_left(text: &str) -> &str {
    text.trim_start_matches(is_html_ws)
}

fn trim_right(text: &str) -> &str {
    text.trim_end_matches(is_html_ws)
}

// ── splitTextToDocs ────────────────────────────────────────────────────────

/// Split `text` into a `fill`-ready doc sequence: non-whitespace words joined by
/// soft [`Doc::Line`], collapsing each whitespace run to one separator. Leading
/// or trailing linebreaks become a hard break (and a blank line — two
/// linebreaks — is preserved as an extra [`Doc::Hardline`]). Port of
/// `splitTextToDocs`.
pub(crate) fn split_text_to_docs(text: &str) -> Vec<Doc> {
    // JS `text.split(/[\t\n\f\r ]+/)` keeps empty leading/trailing/segment words.
    let words = split_on_ws_runs(text);
    // `join(line, words).filter(d => d !== '')`: interleave Line, drop empty words.
    let mut docs: Vec<Doc> = Vec::new();
    for (i, w) in words.iter().enumerate() {
        if i > 0 {
            docs.push(Doc::Line);
        }
        if !w.is_empty() {
            docs.push(Doc::Text((*w).to_string()));
        }
    }
    if docs.is_empty() {
        return docs;
    }
    if starts_with_linebreak(text, 1) {
        docs[0] = Doc::Hardline;
    }
    if starts_with_linebreak(text, 2) {
        docs.insert(0, Doc::Hardline);
    }
    let last = docs.len() - 1;
    if ends_with_linebreak(text, 1) {
        docs[last] = Doc::Hardline;
    }
    if ends_with_linebreak(text, 2) {
        docs.push(Doc::Hardline);
    }
    docs
}

/// JS `String.prototype.split(/[\t\n\f\r ]+/)` semantics: split on maximal
/// whitespace runs, preserving empty strings for leading/trailing whitespace.
fn split_on_ws_runs(text: &str) -> Vec<&str> {
    let mut out = Vec::new();
    let mut start = 0usize;
    let mut i = 0usize;
    let bytes = text.as_bytes();
    while i < bytes.len() {
        // is this byte the start of a ws run? (ws chars here are all ASCII)
        if is_html_ws(bytes[i] as char) {
            out.push(&text[start..i]);
            // consume the run
            while i < bytes.len() && is_html_ws(bytes[i] as char) {
                i += 1;
            }
            start = i;
        } else {
            i += 1;
        }
    }
    out.push(&text[start..]);
    out
}

// ── printChildren ──────────────────────────────────────────────────────────

/// A classified child for [`print_children`]. `Block`/`Inline`/`Other` carry the
/// child's already-built [`Doc`]; `Text` carries its raw (unencoded) text, which
/// `print_children` trims and splits via [`split_text_to_docs`].
#[derive(Clone)]
pub(crate) enum Child {
    Text(String),
    Block(Doc),
    Inline(Doc),
    Other(Doc),
}

impl Child {
    fn is_text(&self) -> bool {
        matches!(self, Child::Text(_))
    }
    fn is_block(&self) -> bool {
        matches!(self, Child::Block(_))
    }
    fn is_inline(&self) -> bool {
        matches!(self, Child::Inline(_))
    }
    fn text(&self) -> Option<&str> {
        match self {
            Child::Text(s) => Some(s.as_str()),
            _ => None,
        }
    }
}

/// Build the child-layout doc sequence for a fragment's children, reproducing
/// prettier-plugin-svelte's `printChildren`. The first/last child's outer
/// whitespace trimming is the *parent element*'s responsibility (milestone 2),
/// so it is not done here. Returns the `childDocs` array (to be wrapped in the
/// caller's `fill`/`group`).
pub(crate) fn print_children(children: Vec<Child>) -> Vec<Doc> {
    // prepareChildren: drop truly-empty (raw === '') text nodes; keep
    // whitespace-only ones.
    let mut prepared: Vec<Child> = children
        .into_iter()
        .filter(|c| !matches!(c.text(), Some(t) if is_empty_raw(t)))
        .collect();
    if prepared.is_empty() {
        return Vec::new();
    }

    let n = prepared.len();
    let has_block = n > 1 && prepared.iter().any(Child::is_block);

    let mut out: Vec<Doc> = Vec::new();
    let mut handle_ws_of_prev_text = false;

    for idx in 0..n {
        if prepared[idx].is_text() {
            handle_text_child(idx, n, &mut prepared, &mut out, &mut handle_ws_of_prev_text);
        } else if prepared[idx].is_block() {
            handle_block_child(idx, n, &prepared, &mut out, &mut handle_ws_of_prev_text);
        } else if prepared[idx].is_inline() {
            handle_inline_child(idx, &prepared, &mut out, &mut handle_ws_of_prev_text);
        } else {
            out.push(child_doc(&prepared[idx]));
            handle_ws_of_prev_text = false;
        }
    }

    // forceBreakContent: ≥1 block element and >1 node → force the parent to break.
    if has_block {
        out.push(Doc::BreakParent);
    }
    out
}

/// The pre-built doc for a non-text child (`Block`/`Inline`/`Other`).
fn child_doc(c: &Child) -> Doc {
    match c {
        Child::Block(d) | Child::Inline(d) | Child::Other(d) => d.clone(),
        Child::Text(_) => unreachable!("child_doc on a Text child"),
    }
}

/// `fill(splitTextToDocs(node))` for a text child.
fn text_doc(text: &str) -> Doc {
    Doc::Fill(split_text_to_docs(text))
}

fn handle_inline_child(
    idx: usize,
    prepared: &[Child],
    out: &mut Vec<Doc>,
    handle_ws_of_prev_text: &mut bool,
) {
    let doc = child_doc(&prepared[idx]);
    if *handle_ws_of_prev_text {
        out.push(Doc::Group(vec![Doc::Line, doc]));
    } else {
        out.push(doc);
    }
    *handle_ws_of_prev_text = false;
}

fn handle_block_child(
    idx: usize,
    n: usize,
    prepared: &[Child],
    out: &mut Vec<Doc>,
    handle_ws_of_prev_text: &mut bool,
) {
    let prev = if idx > 0 {
        Some(&prepared[idx - 1])
    } else {
        None
    };
    // softline before, unless the previous sibling already provides the break.
    if let Some(prev) = prev {
        let prev_handled = !prev.is_block()
            && (!prev.is_text()
                || *handle_ws_of_prev_text
                || !prev.text().is_some_and(ends_with_ws));
        if prev_handled {
            out.push(Doc::Softline);
        }
    }
    out.push(child_doc(&prepared[idx]));
    // softline after, depending on the next sibling.
    let next = prepared.get(idx + 1);
    if let Some(next) = next {
        let push_after = if !next.is_text() {
            true
        } else {
            let next_text = next.text().unwrap();
            let non_empty_or_inline_after =
                !is_only_ws(next_text) || prepared.get(idx + 2).is_some_and(|c2| c2.is_inline());
            non_empty_or_inline_after && !starts_with_linebreak(next_text, 1)
        };
        if push_after {
            out.push(Doc::Softline);
        }
    }
    let _ = n;
    *handle_ws_of_prev_text = false;
}

fn handle_text_child(
    idx: usize,
    n: usize,
    prepared: &mut [Child],
    out: &mut Vec<Doc>,
    handle_ws_of_prev_text: &mut bool,
) {
    *handle_ws_of_prev_text = false;
    // First/last text: outer-whitespace handling is the parent's job.
    if idx == 0 || idx == n - 1 {
        let t = prepared[idx].text().unwrap().to_string();
        out.push(text_doc(&t));
        return;
    }

    let prev_is_inline = prepared[idx - 1].is_inline();
    let prev_is_block = prepared[idx - 1].is_block();
    let prev_is_block_for_flag = prepared[idx - 1].is_block();
    let next_is_inline = prepared[idx + 1].is_inline();
    let next_is_block = prepared[idx + 1].is_block();

    let text = prepared[idx].text().unwrap().to_string();

    if starts_with_ws(&text) && !is_only_ws(&text) {
        if prev_is_inline && !starts_with_linebreak(&text, 1) {
            // Trim left; the previous inline doc absorbs the space via a group line.
            let trimmed = trim_left(&text).to_string();
            set_text(&mut prepared[idx], trimmed);
            if let Some(last) = out.pop() {
                out.push(Doc::Group(vec![last, Doc::Line]));
            }
        }
        if prev_is_block && !starts_with_linebreak(&text, 1) {
            let trimmed = trim_left(prepared[idx].text().unwrap()).to_string();
            set_text(&mut prepared[idx], trimmed);
        }
    }

    let text = prepared[idx].text().unwrap().to_string();
    if ends_with_ws(&text) {
        if next_is_inline && !ends_with_linebreak(&text, 1) {
            *handle_ws_of_prev_text = !prev_is_block_for_flag;
            let trimmed = trim_right(&text).to_string();
            set_text(&mut prepared[idx], trimmed);
        }
        if next_is_block && !ends_with_linebreak(prepared[idx].text().unwrap(), 2) {
            *handle_ws_of_prev_text = !prev_is_block_for_flag;
            let trimmed = trim_right(prepared[idx].text().unwrap()).to_string();
            set_text(&mut prepared[idx], trimmed);
        }
    }

    let t = prepared[idx].text().unwrap().to_string();
    out.push(text_doc(&t));
}

fn set_text(c: &mut Child, s: String) {
    if let Child::Text(t) = c {
        *t = s;
    }
}

// ── element 4-case assembly (the element case of `print`) ──────────────────

/// Inputs for [`build_element_doc`] — a `RegularElement` whose open tag and
/// children have already been converted to Docs by the caller.
pub(crate) struct ElementLayout {
    /// Tag name (`div`, `a`, …).
    pub name: String,
    /// The attribute-list doc placed inside `<name …>` — prettier's
    /// `group([possibleThisBinding, ...attributes])`. Empty `Doc::Text("")` when
    /// there are no attributes.
    pub attrs: Doc,
    /// Raw children (before `prepareChildren`); used to decide hugging and the
    /// non-hug separators. `print_children` re-prepares them internally.
    pub children: Vec<Child>,
    /// `isInlineElement(node)` — a `RegularElement` whose name is not block.
    pub is_inline: bool,
}

/// Build the Doc for a regular element, porting the element case of
/// prettier-plugin-svelte's `print` (the `shouldHugStart`/`shouldHugEnd`
/// four-case assembly). Assumes the corpus oracle config: a supported language,
/// not `<pre>`-content, and `bracketSameLine = false` (so
/// `canOmitSoftlineBeforeClosingTag` is always false and the open-tag trailing
/// separator is `dedent(softline)`).
pub(crate) fn build_element_doc(el: ElementLayout) -> Doc {
    let ElementLayout {
        name,
        attrs,
        children,
        is_inline,
    } = el;

    let is_empty = children
        .iter()
        .all(|c| matches!(c.text(), Some(t) if is_empty_raw(t)));
    let hug_start = should_hug_start(is_inline, &children);
    let hug_end = should_hug_end(is_inline, &children);

    let close = format!("</{name}>");
    let close_no_bracket = format!("</{name}");

    // openingTag = ['<', name, indent(group([attrs, hugStart && !isEmpty ? '' : dedent(softline)]))]
    let opener_trailing = if hug_start && !is_empty {
        Doc::Text(String::new())
    } else {
        Doc::Dedent(vec![Doc::Softline])
    };
    let opening_tag = vec![
        Doc::Text(format!("<{name}")),
        Doc::Indent(vec![Doc::Group(vec![attrs, opener_trailing])]),
    ];

    if is_empty {
        // body for an empty element: a `line` only for an inline element whose
        // (raw) first child is a whitespace text; otherwise '' (bracketSameLine
        // is false so never `softline` here).
        let body = if is_inline
            && children
                .first()
                .and_then(Child::text)
                .is_some_and(starts_with_ws)
        {
            Doc::Line
        } else {
            Doc::Text(String::new())
        };
        if hug_start && hug_end {
            // group([...opening, group([softline, group(['>', body, '</name'])]), '', '>'])
            let hugged = Doc::Group(vec![
                Doc::Softline,
                Doc::Group(vec![
                    Doc::Text(">".into()),
                    body,
                    Doc::Text(close_no_bracket),
                ]),
            ]);
            return group_concat(opening_tag, vec![hugged, Doc::Text(">".into())]);
        }
        // isEmpty non-hug: group([...opening, '>', body, '</name>'])
        return group_concat(
            opening_tag,
            vec![Doc::Text(">".into()), body, Doc::Text(close)],
        );
    }

    // body = printChildren(children) — a concat the assembly wraps.
    let mut children = children;
    // No-hug separators + first/last text trimming (the `else` branch of the
    // element print case). `bracketSameLine`/pre are fixed, so no early outs.
    let (no_hug_start, no_hug_end) =
        compute_no_hug_separators(is_inline, hug_start, hug_end, &mut children);
    let body = || Doc::Concat(print_children(children.clone()));

    if hug_start && hug_end {
        // omitSoftlineBeforeClosingTag = (isEmpty && !bracketSameLine) || canOmit
        //                              = false || false  (isEmpty == false here)
        let hugged = Doc::Indent(vec![Doc::Group(vec![
            Doc::Softline,
            Doc::Group(vec![
                Doc::Text(">".into()),
                body(),
                Doc::Text(close_no_bracket),
            ]),
        ])]);
        return group_concat(
            opening_tag,
            vec![hugged, Doc::Softline, Doc::Text(">".into())],
        );
    }
    if hug_start {
        // group([...opening, indent([softline, group(['>', body])]), noHugEnd, '</name>'])
        let mid = Doc::Indent(vec![
            Doc::Softline,
            Doc::Group(vec![Doc::Text(">".into()), body()]),
        ]);
        return group_concat(opening_tag, vec![mid, no_hug_end, Doc::Text(close)]);
    }
    if hug_end {
        // group([...opening, '>', indent([noHugStart, group([body, '</name'])]), softline, '>'])
        let mid = Doc::Indent(vec![
            no_hug_start,
            Doc::Group(vec![body(), Doc::Text(close_no_bracket)]),
        ]);
        return group_concat(
            opening_tag,
            vec![
                Doc::Text(">".into()),
                mid,
                Doc::Softline,
                Doc::Text(">".into()),
            ],
        );
    }
    // neither: group([...opening, '>', indent([noHugStart, body]), noHugEnd, '</name>'])
    let mid = Doc::Indent(vec![no_hug_start, body()]);
    group_concat(
        opening_tag,
        vec![Doc::Text(">".into()), mid, no_hug_end, Doc::Text(close)],
    )
}

/// `group([...opening, ...rest])`.
fn group_concat(opening: Vec<Doc>, rest: Vec<Doc>) -> Doc {
    let mut parts = opening;
    parts.extend(rest);
    Doc::Group(parts)
}

/// `shouldHugStart` for the corpus config (supported lang, not pre, not
/// SvelteBoundary): false for block elements; for inline, hug unless the first
/// child is a text node starting with whitespace.
fn should_hug_start(is_inline: bool, children: &[Child]) -> bool {
    if !is_inline {
        return false;
    }
    match children.first() {
        None => true,
        Some(first) => !first.text().is_some_and(starts_with_ws),
    }
}

fn should_hug_end(is_inline: bool, children: &[Child]) -> bool {
    if !is_inline {
        return false;
    }
    match children.last() {
        None => true,
        Some(last) => !last.text().is_some_and(ends_with_ws),
    }
}

/// The non-hug separator computation + first/last text trimming, ported from the
/// `else` branch of the element print case (corpus config: not pre).
fn compute_no_hug_separators(
    is_inline: bool,
    hug_start: bool,
    hug_end: bool,
    children: &mut [Child],
) -> (Doc, Doc) {
    let mut start = Doc::Softline;
    let mut end = Doc::Softline;
    let last_idx = children.len().saturating_sub(1);
    let mut did_set_end = false;

    if !hug_start && let Some(Child::Text(t)) = children.first() {
        let t = t.clone();
        if starts_with_linebreak(&t, 1)
            && children.len() > 1
            && (!is_inline
                || children
                    .last()
                    .and_then(Child::text)
                    .is_some_and(ends_with_ws))
        {
            start = Doc::Hardline;
            end = Doc::Hardline;
            did_set_end = true;
        } else if is_inline {
            start = Doc::Line;
        }
        let trimmed = trim_left(&t).to_string();
        set_text(&mut children[0], trimmed);
    }
    if !hug_end && let Some(Child::Text(t)) = children.last() {
        let t = t.clone();
        if is_inline && !did_set_end {
            end = Doc::Line;
        }
        let trimmed = trim_right(&t).to_string();
        set_text(&mut children[last_idx], trimmed);
    }
    (start, end)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::doc::{Doc, print, propagate_breaks};

    /// A single text node's `splitTextToDocs` output is its own `fill`.
    fn render_fill(docs: Vec<Doc>, width: usize) -> String {
        print(propagate_breaks(Doc::Fill(docs)), width, "  ", 0, 0)
    }

    /// `print_children` returns the parent element body — a concat the element's
    /// `group` wraps (NOT a fill); text children are fills inside it.
    fn render_children(docs: Vec<Doc>, width: usize) -> String {
        print(propagate_breaks(Doc::Group(docs)), width, "  ", 0, 0)
    }

    #[test]
    fn block_classification_matches_canonical_list() {
        assert!(is_block_element_name("div"));
        assert!(is_block_element_name("p"));
        assert!(is_block_element_name("ul"));
        assert!(!is_block_element_name("span"));
        assert!(!is_block_element_name("a"));
        assert!(!is_block_element_name("strong"));
    }

    #[test]
    fn split_text_words_join_with_line() {
        // "a b c" → [a, Line, b, Line, c] → fills to one line when it fits.
        let docs = split_text_to_docs("a b c");
        assert_eq!(render_fill(docs, 80), "a b c");
    }

    #[test]
    fn split_text_collapses_whitespace_runs() {
        let docs = split_text_to_docs("a   b\t\tc");
        assert_eq!(render_fill(docs, 80), "a b c");
    }

    #[test]
    fn split_text_leading_linebreak_is_hardline() {
        // A single leading newline → the leading separator becomes a hardline.
        let docs = split_text_to_docs("\nhello world");
        assert_eq!(render_fill(docs, 80), "\nhello world");
    }

    #[test]
    fn split_text_double_trailing_linebreak_keeps_blank_line() {
        let docs = split_text_to_docs("hi\n\n");
        assert_eq!(render_fill(docs, 80), "hi\n\n");
    }

    #[test]
    fn split_text_fills_at_width() {
        // Narrow width breaks each soft Line.
        let docs = split_text_to_docs("alpha beta gamma");
        assert_eq!(render_fill(docs, 8), "alpha\nbeta\ngamma");
    }

    #[test]
    fn prepare_drops_empty_text_keeps_whitespace() {
        // Empty raw text is dropped; a lone whitespace text survives.
        let out = print_children(vec![Child::Text(String::new()), Child::Text(" ".into())]);
        // single whitespace-only text node at idx 0 (== last) prints via fill.
        assert_eq!(render_children(out, 80), " ");
    }

    #[test]
    fn block_child_forces_break_among_siblings() {
        // text + block div → forceBreakContent inserts a BreakParent, and the
        // block gets surrounding softlines that then break.
        let out = print_children(vec![
            Child::Text("before".into()),
            Child::Block(Doc::Text("<div>x</div>".into())),
            Child::Text("after".into()),
        ]);
        assert_eq!(render_children(out, 80), "before\n<div>x</div>\nafter");
    }

    fn render_el(doc: Doc, width: usize) -> String {
        print(propagate_breaks(doc), width, "  ", 0, 0)
    }

    fn el(name: &str, children: Vec<Child>, is_inline: bool) -> Doc {
        build_element_doc(ElementLayout {
            name: name.to_string(),
            attrs: Doc::Text(String::new()),
            children,
            is_inline,
        })
    }

    #[test]
    fn inline_element_hugs_text_on_one_line() {
        // <a>here</a> — inline, no surrounding whitespace → hug both.
        let doc = el("a", vec![Child::Text("here".into())], true);
        assert_eq!(render_el(doc, 80), "<a>here</a>");
    }

    #[test]
    fn empty_inline_element() {
        let doc = el("a", vec![], true);
        assert_eq!(render_el(doc, 80), "<a></a>");
    }

    #[test]
    fn block_element_single_text_fits_flat() {
        // <div>x</div> — block, fits on one line at wide width.
        let doc = el("div", vec![Child::Text("x".into())], false);
        assert_eq!(render_el(doc, 80), "<div>x</div>");
    }

    #[test]
    fn block_element_breaks_children_when_narrow() {
        // A block whose content overflows breaks: children on their own line,
        // indented one level, with the close tag back at the outer column.
        let doc = el(
            "div",
            vec![Child::Text("alpha beta gamma delta".into())],
            false,
        );
        assert_eq!(
            render_el(doc, 12),
            "<div>\n  alpha beta\n  gamma\n  delta\n</div>"
        );
    }

    #[test]
    fn inline_child_stays_on_line_when_it_fits() {
        // text <a>..</a> text stays on one line under a wide width.
        let out = print_children(vec![
            Child::Text("see ".into()),
            Child::Inline(Doc::Text("<a>here</a>".into())),
            Child::Text(" now".into()),
        ]);
        assert_eq!(render_children(out, 80), "see <a>here</a> now");
    }

    #[test]
    fn geojson_label_void_then_prose_matches_oracle() {
        // The canonical "break-after" maplibre case:
        //   <label class="rounded p-1"><input … /> Only show states starting with 'T'</label>
        // Oracle (oxfmt = prettier-plugin-svelte) keeps the open `>` on its own
        // indented line, hugs `<input/>`, and wraps the prose such that "starting"
        // stays on the input line (overflowing to col 82) and "with 'T'" wraps,
        // with the close `>` deferred. This validates the faithful children.rs port
        // reproduces prettier's printChildren/fill for void-element + prose content.
        let input = "<input type=\"checkbox\" bind:checked={filterStates} />";
        let doc = build_element_doc(ElementLayout {
            name: "label".into(),
            attrs: Doc::Concat(vec![Doc::Line, Doc::Text("class=\"rounded p-1\"".into())]),
            children: vec![
                Child::Inline(Doc::Text(input.into())),
                Child::Text(" Only show states starting with 'T'".into()),
            ],
            is_inline: true,
        });
        let expected = "<label class=\"rounded p-1\"\n  ><input type=\"checkbox\" bind:checked={filterStates} /> Only show states starting\n  with 'T'</label\n>";
        assert_eq!(render_el(doc, 80), expected);
    }

    #[test]
    fn powertable_block_div_br_prose_nested() {
        // <div slot="noResults">This is a custom text that<br /> will be shown
        //   when there are<br /> no rows to display</div>  (block element)
        // Nested one level (div at indent 2 → content indent 4): the oracle keeps
        // "to" on line 1 (overflow to col 82) and wraps "display".
        let doc = build_element_doc(ElementLayout {
            name: "div".into(),
            attrs: Doc::Concat(vec![Doc::Line, Doc::Text("slot=\"noResults\"".into())]),
            children: vec![
                Child::Text("This is a custom text that".into()),
                Child::Inline(Doc::Text("<br />".into())),
                Child::Text(" will be shown when there are".into()),
                Child::Inline(Doc::Text("<br />".into())),
                Child::Text(" no rows to display".into()),
            ],
            is_inline: false,
        });
        let printed = print(propagate_breaks(doc), 80, "  ", 1, 2);
        let expected = "<div slot=\"noResults\">\n    This is a custom text that<br /> will be shown when there are<br /> no rows to\n    display\n  </div>";
        assert_eq!(printed, expected);
    }

    #[test]
    fn strong_with_inline_a_keeps_a_flat() {
        // <strong>Notice for <a href="…" target="_blank">Sapper</a> user:</strong>
        // at indent 2. Oracle keeps the <a> WHOLE (content line overflows to 93)
        // and only the strong's open/close `>` defer:
        //   <strong
        //     >Notice for <a href="…" target="_blank">Sapper</a> user:</strong
        //   >  (then the sibling text continues — not modeled here)
        let a = build_element_doc(ElementLayout {
            name: "a".into(),
            attrs: Doc::Concat(vec![
                Doc::Line,
                Doc::Text("href=\"https://sapper.svelte.dev/\"".into()),
                Doc::Line,
                Doc::Text("target=\"_blank\"".into()),
            ]),
            children: vec![Child::Text("Sapper".into())],
            is_inline: true,
        });
        let strong = build_element_doc(ElementLayout {
            name: "strong".into(),
            attrs: Doc::Text(String::new()),
            children: vec![
                Child::Text("Notice for ".into()),
                Child::Inline(a),
                Child::Text(" user:".into()),
            ],
            is_inline: true,
        });
        let printed = print(propagate_breaks(strong), 80, "  ", 1, 2);
        let expected = "<strong\n    >Notice for <a href=\"https://sapper.svelte.dev/\" target=\"_blank\">Sapper</a> user:</strong\n  >";
        assert_eq!(printed, expected);
    }

    #[test]
    fn div_with_strong_and_sibling_keeps_a_flat() {
        // <div class="…"><strong>Notice for <a …>Sapper</a> user:</strong> You may
        //   need to install the component as a devDependency:</div>
        // The sibling text after </strong> must NOT cause the <a> inside the strong
        // to over-break (the oracle keeps the <a> whole on a 93-char line).
        let a = build_element_doc(ElementLayout {
            name: "a".into(),
            attrs: Doc::Concat(vec![
                Doc::Line,
                Doc::Text("href=\"https://sapper.svelte.dev/\"".into()),
                Doc::Line,
                Doc::Text("target=\"_blank\"".into()),
            ]),
            children: vec![Child::Text("Sapper".into())],
            is_inline: true,
        });
        let strong = build_element_doc(ElementLayout {
            name: "strong".into(),
            attrs: Doc::Text(String::new()),
            children: vec![
                Child::Text("Notice for ".into()),
                Child::Inline(a),
                Child::Text(" user:".into()),
            ],
            is_inline: true,
        });
        let div = build_element_doc(ElementLayout {
            name: "div".into(),
            attrs: Doc::Concat(vec![
                Doc::Line,
                Doc::Text("class=\"shadow-sm p-3 mb-3 rounded\"".into()),
            ]),
            children: vec![
                Child::Inline(strong),
                Child::Text(" You may need to install the component as a devDependency:".into()),
            ],
            is_inline: false,
        });
        let printed = print(propagate_breaks(div), 80, "  ", 0, 0);
        let expected = "<div class=\"shadow-sm p-3 mb-3 rounded\">\n  <strong\n    >Notice for <a href=\"https://sapper.svelte.dev/\" target=\"_blank\">Sapper</a> user:</strong\n  > You may need to install the component as a devDependency:\n</div>";
        assert_eq!(printed, expected);
    }
}
