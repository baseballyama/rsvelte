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
    collect_indent_edits_inner(source, fragment, child_depth, false, false, options, edits)
}

/// `force` makes the fragment re-indent its children even when it holds only
/// text — used for block bodies (`{#if}` / `{:else}` / `{#each}` / …), which
/// always render their content on its own line(s). Element children instead pass
/// `force = false`: a pure-text element collapses to one line and is handled
/// elsewhere, not re-indented here.
///
/// `is_block_body` is `true` only for control-flow block bodies
/// (`{#if}` / `{:else}` / `{#each}` / `{#snippet}` / …). It is `false` for
/// element children (even when `force=true` from a multiline open tag). The flag
/// controls whether an inline whitespace separator between two mustache siblings
/// becomes a newline: element children always split when the fragment is broken;
/// block bodies only split when a non-ExpressionTag sibling is present.
fn collect_indent_edits_inner(
    source: &str,
    fragment: &Fragment,
    child_depth: usize,
    force: bool,
    is_block_body: bool,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    // A forced block body (`{#snippet}` / `{#if}` / `{#each}` / …) whose entire
    // content is a single one-line text node breaks onto its own line ONLY when
    // that text has leading/trailing whitespace — prettier's
    // checkWhitespaceAtStart/EndOfSvelteBlock: `{#snippet name()} P. Sherman
    // {/snippet}` (space-bounded) breaks, but `{#snippet x()}...{/snippet}`
    // (content flush against the delimiters) stays inline. The generic loop below
    // only re-indents whitespace-only / already-multi-line text, so handle the
    // single-line case here.
    if force
        && fragment.nodes.len() == 1
        && let TemplateNode::Text(t) = &fragment.nodes[0]
    {
        // Use the RAW source: the parser's decoded `data` turns `&nbsp;` into
        // U+00A0, which `char::is_whitespace` (and entity preservation) would
        // mishandle. prettier's block-whitespace check is ASCII space/tab.
        let data = source.get(t.start as usize..t.end as usize).unwrap_or("");
        let bounded = data.starts_with([' ', '\t']) || data.ends_with([' ', '\t']);
        if !data.trim().is_empty() && !data.contains('\n') && bounded {
            let child_indent = indent_for_level(child_depth, &options.js);
            let parent_indent = if child_depth == 0 {
                String::new()
            } else {
                indent_for_level(child_depth - 1, &options.js)
            };
            let collapsed = data.split_whitespace().collect::<Vec<_>>().join(" ");
            edits.push((
                t.start,
                t.end,
                format!("\n{child_indent}{collapsed}\n{parent_indent}"),
            ));
            return Ok(());
        }
    }

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

        // Whether the fragment has at least one whitespace-only text node
        // that contains a newline. When true the fragment is "broken" —
        // its children are laid out on separate lines. For element children
        // (not block bodies), this is sufficient to split inline mustache
        // separators. For block bodies the fragment is always broken (has
        // surrounding whitespace newlines), so a stricter check is used.
        let fragment_is_broken = fragment.nodes.iter().any(|n| {
            matches!(n, TemplateNode::Text(t) if t.data.contains('\n') && is_whitespace_only(t.data.as_str()))
        });

        // Whether the fragment has at least one indent-provoking child that
        // is NOT an ExpressionTag (i.e., a "real" block child: ConstTag,
        // HtmlTag, Comment, RegularElement, Component, IfBlock, etc.).
        // Used for block bodies: only split inline spaces when such a sibling
        // is present. Without one (fragment is only ExpressionTags + ws),
        // the space is prose-sensitive and stays on one line.
        let has_non_expression_block_child = fragment
            .nodes
            .iter()
            .any(|n| is_indent_provoking(n) && !matches!(n, TemplateNode::ExpressionTag(_)));

        // prettier-plugin-svelte's `forceBreakContent`: when any child is a
        // block-display HTML element AND there are multiple non-whitespace
        // children, all children must be on their own lines. This mirrors
        // prettier's `childDocs.push(breakParent)` triggered by `isBlockElement`.
        let non_ws_count = fragment
            .nodes
            .iter()
            .filter(|n| !matches!(n, TemplateNode::Text(t) if is_whitespace_only(t.data.as_str())))
            .count();
        let has_block_html_child = fragment
            .nodes
            .iter()
            .any(|n| matches!(n, TemplateNode::RegularElement(e) if is_prettier_block_element(e.name.as_str())));
        let force_break_content = non_ws_count > 1 && has_block_html_child;

        for (i, node) in fragment.nodes.iter().enumerate() {
            let TemplateNode::Text(t) = node else {
                continue;
            };
            if is_whitespace_only(t.data.as_str()) {
                if !t.data.contains('\n') {
                    // Inline spacing (no line break in the source).
                    //
                    // In a broken fragment, whitespace-only text between two
                    // indent-provoking siblings (e.g. `{a} {b}`) becomes a
                    // newline so each mustache lands on its own line — UNLESS
                    // the next node is a non-block RegularElement (inline HTML),
                    // in which case the prose stays on one line (e.g.
                    // `{field} <input />` or `{a} <br />`). When force_break_content
                    // is active all children break regardless.
                    //
                    // The "broken" criterion differs by context:
                    // - Element children (not block body): broken whenever the
                    //   fragment has any whitespace-text-with-newline sibling,
                    //   or when force_break_content is active (any block HTML child).
                    // - Block bodies (`{#if}` / `{#snippet}` / etc.): broken
                    //   only when there is a non-ExpressionTag indent-provoking
                    //   sibling (ConstTag, HtmlTag, Comment, elements, …).
                    //   A block body of only `{a} {b}` stays inline because
                    //   prettier treats it as prose in that context.
                    //
                    // Leading/trailing inline whitespace at the document root
                    // is insignificant and is removed.
                    let prev_provoking = i > 0 && is_indent_provoking(&fragment.nodes[i - 1]);
                    // A space between two provoking nodes breaks to a newline
                    // when the fragment is broken — UNLESS the next node is a
                    // non-block RegularElement (inline HTML) whose prose stays
                    // glued to the preceding text. When force_break_content is
                    // active and the next node is a block-display HTML element,
                    // override the inline-element guard and force a newline.
                    let next_is_block_html = i < last
                        && matches!(&fragment.nodes[i + 1],
                            TemplateNode::RegularElement(e) if is_prettier_block_element(e.name.as_str()));
                    let prev_is_block_html = i > 0
                        && matches!(&fragment.nodes[i - 1],
                            TemplateNode::RegularElement(e) if is_prettier_block_element(e.name.as_str()));
                    // When either adjacent sibling is a block HTML element, the
                    // space must become a newline regardless of the inline-element
                    // guard (`next_not_regular`).
                    // A space *after* a phrasing-content RegularElement (inline
                    // HTML like `<strong>`, `<em>`, `<a>`, `<span>` — non-block,
                    // non-inline-block elements with actual content children) is
                    // prose-level glue — prettier keeps
                    // `<strong>x</strong> {endText}` on one line just as it keeps
                    // `<strong>x</strong> <em>y</em>` on one line.  Suppress the
                    // space→newline conversion in this case.  Void / self-closing
                    // elements (`<input>`, `<br>`) and inline-block form elements
                    // (`<button>`, `<select>`) are NOT prose carriers; the space
                    // after them does convert to a newline (oracle behaviour).
                    let prev_is_inline_html = i > 0
                        && matches!(&fragment.nodes[i - 1],
                            TemplateNode::RegularElement(e)
                            if !is_prettier_block_element(e.name.as_str())
                                && !is_inline_block_element(e.name.as_str())
                                && !e.fragment.nodes.is_empty());
                    let next_not_regular = next_is_block_html
                        || prev_is_block_html
                        || i >= last
                        || (!matches!(&fragment.nodes[i + 1], TemplateNode::RegularElement(_))
                            && !prev_is_inline_html);
                    let next_provoking = i < last && is_indent_provoking(&fragment.nodes[i + 1]);
                    // For element-children contexts (not block bodies), the fragment
                    // is "broken" — meaning spaces between block-level nodes become
                    // newlines — when any whitespace-text child has a newline OR
                    // when force_break_content is active and either adjacent sibling
                    // is a block HTML element. The second criterion ensures that
                    // `<Component />   <div>` collapses the spaces to a newline
                    // even when the source has no explicit newline in the fragment.
                    let effectively_broken = if is_block_body {
                        has_non_expression_block_child
                    } else {
                        fragment_is_broken
                            || (force_break_content && (next_is_block_html || prev_is_block_html))
                    };
                    let replacement = if effectively_broken
                        && prev_provoking
                        && next_provoking
                        && next_not_regular
                    {
                        // Between two block-level nodes in an already-broken
                        // fragment: convert the space to a line-break.
                        if i == last {
                            format!("\n{parent_indent}")
                        } else {
                            format!("\n{child_indent}")
                        }
                    } else if is_block_body && effectively_broken && i == 0 && next_provoking {
                        // Leading edge whitespace in a block body that contains a
                        // block-level child: the opening delimiter's `}` is
                        // followed by a space (e.g. `{#each … } <div>`).  In a
                        // broken block body this space should become a newline so
                        // `<div>` lands on its own indented line.  The middle case
                        // above handles inter-sibling spaces (prev_provoking &&
                        // next_provoking), but the very first whitespace text in a
                        // block body has no provoking predecessor — handle it here.
                        format!("\n{child_indent}")
                    } else if is_block_body && effectively_broken && i == last && prev_provoking {
                        // Trailing edge whitespace in a block body that contains a
                        // block-level child: the closing delimiter is preceded by a
                        // space (e.g. `</div> {/each}`).  Same rationale as above,
                        // but for the trailing edge.
                        format!("\n{parent_indent}")
                    } else if child_depth == 0 && (i == 0 || i == last) {
                        String::new()
                    } else {
                        " ".to_string()
                    };
                    if t.data.as_str() != replacement {
                        edits.push((t.start, t.end, replacement));
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
                // A forced block body (`{#snippet}` / `{#if}` / `{#each}` / …)
                // whose ONLY content is whitespace (an "empty" block) always
                // keeps exactly one blank line — even when the source has just
                // a single newline. prettier-plugin-svelte / oxfmt: an empty
                // `{#snippet x()}\n{/snippet}` expands to
                // `{#snippet x()}\n\n{/snippet}`. This does NOT apply when the
                // block is on one line (`{#if true} {/if}` — no newline in the
                // body text) since that case is handled by the `!contains('\n')`
                // branch above and stays inline.
                let empty_forced_body = is_block_body && i == 0 && i == last;
                let keep_blank = empty_forced_body
                    || (child_depth == 0 && section_close_before(source, t.start))
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
                // Reindent the RAW source slice when the text carries an HTML
                // entity (`&ndash;`, `&#123;`, `&amp;`, …) — emitting the
                // parser's decoded `data` would replace it with the decoded
                // character. That both diverges from prettier/oxfmt (which keep
                // source entities verbatim) AND can produce invalid Svelte when
                // the decoded char is syntactically significant (`&#123;` → `{`
                // opens a mustache), breaking the collapse re-parse. For
                // entity-free text keep using `data` (its existing tested
                // behaviour — raw and data can otherwise differ in whitespace).
                let raw = source.get(t.start as usize..t.end as usize).unwrap_or("");
                let text = if raw.contains('&') {
                    raw
                } else {
                    t.data.as_str()
                };
                let mut reindented = reindent_text_lines(text, &child_indent, trailing_indent);
                // When the text node is sandwiched between two block-display
                // elements (both prev and next siblings are block), prettier
                // strips any trailing spaces from the last content line so the
                // text sits cleanly on its own line.  Example: `</p>\nlocal <p>`
                // → the `local ` trailing space is stripped and a newline
                // separator is added before the next `<p>` by the adjacent-block
                // loop below.  This does NOT apply when only the next sibling is
                // a block element (no preceding block) — prettier keeps inline
                // text glued to the following block in that position.
                let prev_is_block = i > 0
                    && matches!(&fragment.nodes[i - 1],
                        TemplateNode::RegularElement(e) if is_prettier_block_element(e.name.as_str()));
                let next_is_block = i < last
                    && matches!(&fragment.nodes[i + 1],
                        TemplateNode::RegularElement(e) if is_prettier_block_element(e.name.as_str()));
                if prev_is_block && next_is_block {
                    let mut stripped = false;
                    if let Some(last_nl) = reindented.rfind('\n') {
                        let last_line = &reindented[last_nl + 1..];
                        if !last_line.is_empty() && last_line != trailing_indent {
                            // Content line (not purely indentation): trim trailing spaces.
                            let trimmed_end =
                                last_nl + 1 + last_line.trim_end_matches([' ', '\t']).len();
                            reindented.truncate(trimmed_end);
                            stripped = true;
                        }
                    }
                    // After stripping, the text no longer ends with the
                    // `trailing_indent` that would lead into the next block
                    // element — insert `\n{child_indent}` at the text boundary
                    // so the block element lands on its own indented line.
                    if stripped {
                        edits.push((t.end, t.end, format!("\n{child_indent}")));
                    }
                }
                if reindented != text {
                    edits.push((t.start, t.end, reindented));
                }
            }
        }

        // When two adjacent non-text siblings require a line break between them
        // (no whitespace text node separating them in the source), insert one:
        // - An HTML comment always sits on its own line.
        // - A block-display HTML element (`<div>`, `<p>`, `<hr>`, …) always sits
        //   on its own line and forces the sibling onto its own line too.
        // This mirrors prettier's `softline` added around block children and the
        // `breakParent` from `forceBreakContent` (which activates those softlines
        // as hardlines when any block element is present).
        for w in fragment.nodes.windows(2) {
            let (a, b) = (&w[0], &w[1]);
            if matches!(a, TemplateNode::Text(_)) || matches!(b, TemplateNode::Text(_)) {
                continue;
            }
            let is_comment =
                matches!(a, TemplateNode::Comment(_)) || matches!(b, TemplateNode::Comment(_));
            let a_is_block = matches!(a, TemplateNode::RegularElement(e) if is_prettier_block_element(e.name.as_str()));
            let b_is_block = matches!(b, TemplateNode::RegularElement(e) if is_prettier_block_element(e.name.as_str()));
            if !is_comment && !a_is_block && !b_is_block {
                continue;
            }
            // Adjacent comments that are already inline (no newline in the fragment's
            // whitespace text nodes) stay on the same line — prettier preserves the
            // inline layout. Only break them when the surrounding fragment is already
            // broken (has whitespace-with-newline text nodes). Block-display elements
            // (`<div>`, `<p>`, etc.) are always broken regardless.
            if is_comment && !a_is_block && !b_is_block && !fragment_is_broken {
                continue;
            }
            let boundary = crate::collapse::template_node_span(a).1;
            if boundary == crate::collapse::template_node_span(b).0 {
                edits.push((boundary, boundary, format!("\n{child_indent}")));
            }
        }

        // When a block-display element is directly adjacent (no whitespace
        // separator, no newline) to a non-whitespace text node, the text must
        // be pushed onto its own line.  For example `<p>text</p>.` — the
        // trailing `.` follows the `</p>` close tag with no separator at all;
        // prettier puts it on a new line.
        //
        // Only fire when the Text node starts with a non-whitespace character
        // (the adjacent text abuts the block element with no newline in between)
        // because when a `\n` is already present the existing indent-pass
        // whitespace-text rewrite handles the indentation.
        for w in fragment.nodes.windows(2) {
            let (a, b) = (&w[0], &w[1]);
            let a_is_block = matches!(a, TemplateNode::RegularElement(e) if is_prettier_block_element(e.name.as_str()));
            // Only handle block + Text adjacency with a non-whitespace, non-newline
            // leading character in the text — the earlier loop already handles
            // block + non-Text adjacency.
            if !a_is_block {
                continue;
            }
            let b_is_nonempty_text = matches!(b, TemplateNode::Text(t)
                if !is_whitespace_only(t.data.as_str()) && !t.data.starts_with('\n'));
            if !b_is_nonempty_text {
                continue;
            }
            let boundary = crate::collapse::template_node_span(a).1;
            if boundary == crate::collapse::template_node_span(b).0 {
                edits.push((boundary, boundary, format!("\n{child_indent}")));
            }
        }

        // When force_break_content is active, the fragment's first and last
        // non-whitespace, non-text nodes also need edge newlines when there's no
        // leading / trailing whitespace text node. This mirrors prettier's outer
        // `hardline` wrapping around block element groups.
        // NOTE: we only insert edge newlines when the edge child is NOT a text
        // node — text content that abuts an element's open tag stays inline
        // (e.g. `<Nested>\n  Hello\n\n  <p>` keeps "Hello" at its position).
        if force_break_content {
            // First non-whitespace child: needs a leading newline if no ws text
            // AND the first non-ws child is a non-text node.
            let first_non_ws = fragment.nodes.iter().find(
                |n| !matches!(n, TemplateNode::Text(t) if is_whitespace_only(t.data.as_str())),
            );
            if let Some(first) = first_non_ws
                && !matches!(first, TemplateNode::Text(_))
            {
                let first_idx = fragment
                    .nodes
                    .iter()
                    .position(|n| std::ptr::eq(n, first))
                    .unwrap_or(0);
                let has_leading_ws = first_idx > 0
                    && matches!(&fragment.nodes[first_idx - 1],
                        TemplateNode::Text(t) if is_whitespace_only(t.data.as_str()));
                if !has_leading_ws {
                    let first_start = crate::collapse::template_node_span(first).0;
                    edits.push((first_start, first_start, format!("\n{child_indent}")));
                }
            }
            // Last non-whitespace child: needs a trailing newline if no ws text
            // AND the last non-ws child is a non-text node.
            let last_non_ws = fragment.nodes.iter().rev().find(
                |n| !matches!(n, TemplateNode::Text(t) if is_whitespace_only(t.data.as_str())),
            );
            if let Some(last) = last_non_ws
                && !matches!(last, TemplateNode::Text(_))
            {
                let last_idx = fragment
                    .nodes
                    .iter()
                    .rposition(|n| std::ptr::eq(n, last))
                    .unwrap_or(0);
                let has_trailing_ws = last_idx + 1 < fragment.nodes.len()
                    && matches!(&fragment.nodes[last_idx + 1],
                        TemplateNode::Text(t) if is_whitespace_only(t.data.as_str()));
                if !has_trailing_ws {
                    let last_end = crate::collapse::template_node_span(last).1;
                    // The `\n{parent_indent}` insert and any synthetic close
                    // tag for an empty implicitly-closed element are both
                    // zero-length inserts at `last_end`. We push the newline
                    // FIRST so it ends up earlier in the vec; the close tag is
                    // pushed second. When applied in descending-start order the
                    // close tag insert fires last and lands at the same position
                    // as the newline (now the position of the newly-inserted
                    // `\n`), placing `</tag>` BEFORE the `\n`:
                    //   `<duiv>\n</duiv>\n</div>` — correct layout.
                    // Note: non-empty implicitly-closed elements (e.g. `<li>a`)
                    // are handled by `push_close_tag` case 4 in markup.rs
                    // (replaces trailing whitespace span with `</tag>`), so we
                    // only insert `</tag>` here for EMPTY elements.
                    edits.push((last_end, last_end, format!("\n{parent_indent}")));
                    // Implicitly-closed RegularElement with EMPTY content: insert
                    // synthetic </tag> (pushed second so it lands before the \n).
                    if let TemplateNode::RegularElement(e) = last {
                        let is_implicitly_closed =
                            source.as_bytes().get(e.end as usize - 1).copied() != Some(b'>');
                        let is_empty_content = e.fragment.nodes.iter().all(
                            |n| matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()),
                        );
                        if is_implicitly_closed && is_empty_content {
                            edits.push((last_end, last_end, format!("</{}>", e.name.as_str())));
                        }
                    }
                }
            }
        }

        // When force_break_content is NOT active (sole non-ws child case) and
        // that sole child is a non-empty implicitly-closed RegularElement whose
        // trailing whitespace was consumed by markup.rs case 4, the parent's
        // close tag immediately follows with no preceding newline. Insert one
        // here so the parent's close tag lands on its own line.
        // Example: `<main>\n\t<div>...\n</main>` — case 4 replaces `\n` with
        // `\n  </div>`, then `</main>` needs its own preceding `\n`.
        if !force_break_content {
            let last_non_ws = fragment.nodes.iter().rev().find(
                |n| !matches!(n, TemplateNode::Text(t) if is_whitespace_only(t.data.as_str())),
            );
            if let Some(last_node) = last_non_ws
                && let TemplateNode::RegularElement(e) = last_node
            {
                let last_idx = fragment
                    .nodes
                    .iter()
                    .rposition(|n| std::ptr::eq(n, last_node))
                    .unwrap_or(0);
                let has_trailing_ws = last_idx + 1 < fragment.nodes.len()
                    && matches!(&fragment.nodes[last_idx + 1],
                        TemplateNode::Text(t) if is_whitespace_only(t.data.as_str()));
                if !has_trailing_ws {
                    let is_implicitly_closed =
                        source.as_bytes().get(e.end as usize - 1).copied() != Some(b'>');
                    let is_nonempty =
                        !e.fragment.nodes.iter().all(
                            |n| matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()),
                        );
                    let parent_close_follows = source.as_bytes().get(e.end as usize).copied()
                        == Some(b'<')
                        && source.as_bytes().get(e.end as usize + 1).copied() == Some(b'/');
                    if is_implicitly_closed && is_nonempty && parent_close_follows {
                        // Zero-length insert at `e.end` adds `\n{parent_indent}` before
                        // the parent's close tag. This restores the newline consumed by
                        // markup.rs case 4 when it replaced the element's trailing `\n`
                        // with `\n{child_indent}</tag>`.
                        edits.push((e.end, e.end, format!("\n{parent_indent}")));
                    }
                }
            }
        }
    }

    for (i, node) in fragment.nodes.iter().enumerate() {
        if crate::prettier_ignore::preceded_by_prettier_ignore(&fragment.nodes, i) {
            continue;
        }
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
            // When the open tag spans multiple lines (its attributes wrapped),
            // the element can't collapse onto one line, so its content renders
            // on its own line(s) and the pure-text case must be re-indented here
            // — the collapse pass only reindents text under a single-line open
            // tag. (When the content *does* still fit one line, the collapse
            // pass overrides this, so forcing is safe.)
            let force = open_tag_is_multiline(source, elem.start, &elem.fragment);
            collect_indent_edits_inner(
                source,
                &elem.fragment,
                next_depth,
                force,
                false, // element fragment, not a block body
                options,
                edits,
            )?;
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
                    true, // if/else body is a block body
                    options,
                    edits,
                )?;
                match &current.alternate {
                    Some(alt) => match else_if_branch(alt) {
                        Some(chained) => current = chained,
                        None => {
                            collect_indent_edits_inner(
                                source, alt, next_depth, true, true, options, edits,
                            )?;
                            break;
                        }
                    },
                    None => break,
                }
            }
        }
        TemplateNode::EachBlock(blk) => {
            collect_indent_edits_inner(source, &blk.body, next_depth, true, true, options, edits)?;
            if let Some(fb) = &blk.fallback {
                collect_indent_edits_inner(source, fb, next_depth, true, true, options, edits)?;
            }
        }
        TemplateNode::AwaitBlock(blk) => {
            // When the pending block is whitespace-only AND there is a then/catch
            // binding, the expression pass collapses the two headers into one
            // (`{#await expr then value}`). Skip the pending fragment here so we
            // don't emit a spurious blank-line edit inside the collapsed region.
            // `await_pending_is_empty` returns false when pending is None (shorthand form)
            // and true only when pending is Some but whitespace-only (expanded form to collapse).
            // Mirror `try_collapse_await_header`'s collapse condition exactly so the
            // two passes always agree on whether the pending block was collapsed.
            let pending_collapsed = crate::expression::await_pending_is_empty(blk.pending.as_ref())
                && ((blk.then.is_some() && blk.value.is_some())
                    || (blk.catch.is_some() && blk.error.is_some()));
            // When the pending block has real content but the `then` body is empty
            // (and there's no catch), the expression pass strips the `{:then …}`
            // separator entirely. Skip the then-body indent pass so we don't emit
            // a spurious blank-line edit (`\n\n`) inside the erased region.
            // Mirror `try_strip_await_then_separator`'s condition exactly.
            let separator_stripped = !pending_collapsed
                && blk.pending.is_some()
                && blk.value.is_some()
                && blk.catch.is_none()
                && blk.then.as_ref().is_some_and(|f| {
                    f.nodes.iter().all(|n| {
                        matches!(n, rsvelte_core::ast::template::TemplateNode::Text(t)
                            if t.data.trim().is_empty())
                    })
                });
            if !pending_collapsed && let Some(frag) = &blk.pending {
                collect_indent_edits_inner(source, frag, next_depth, true, true, options, edits)?;
            }
            if !separator_stripped && let Some(frag) = &blk.then {
                collect_indent_edits_inner(source, frag, next_depth, true, true, options, edits)?;
            }
            if let Some(frag) = &blk.catch {
                collect_indent_edits_inner(source, frag, next_depth, true, true, options, edits)?;
            }
        }
        TemplateNode::KeyBlock(blk) => {
            collect_indent_edits_inner(
                source,
                &blk.fragment,
                next_depth,
                true,
                true,
                options,
                edits,
            )?;
        }
        TemplateNode::SnippetBlock(blk) => {
            collect_indent_edits_inner(source, &blk.body, next_depth, true, true, options, edits)?;
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

/// Whether the element's open tag spans more than one line — i.e. there is a
/// newline between the element start and the start of its first child (the open
/// tag's `>`). Such an element keeps its content on its own line(s).
fn open_tag_is_multiline(source: &str, elem_start: u32, fragment: &Fragment) -> bool {
    let Some(first) = fragment.nodes.first() else {
        return false;
    };
    let first_start = crate::collapse::template_node_span(first).0;
    source
        .get(elem_start as usize..first_start as usize)
        .is_some_and(|s| s.contains('\n'))
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
    // Only ASCII whitespace (' ', '\t', '\n', '\r') counts as "whitespace only".
    // U+00A0 (non-breaking space, decoded from `&nbsp;`) must NOT be treated as
    // whitespace here — it is significant content that prettier preserves.
    // `char::is_whitespace()` returns true for U+00A0, so we use an explicit
    // ASCII-only check instead.
    !s.is_empty() && s.chars().all(|c| matches!(c, ' ' | '\t' | '\n' | '\r'))
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
///
/// `<textarea>` is whitespace-sensitive too: oxfmt 0.56 treats its content as
/// verbatim raw text (matching the browser, where a textarea's text is literal),
/// so its interior indentation must survive unchanged rather than being
/// normalized by the indent pass.
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

/// Block-display HTML elements as defined by prettier-plugin-svelte's
/// `blockElements` array. These are the elements whose presence in a
/// fragment triggers `forceBreakContent` — when any child is one of these,
/// all siblings are rendered on their own lines (prettier's `breakParent`).
///
/// Note: this list matches prettier-plugin-svelte exactly (not the
/// CSS display defaults used by the collapse pass — those are a superset
/// that also include inline-block elements like `<button>`).
fn is_prettier_block_element(tag: &str) -> bool {
    matches!(
        tag,
        "address"
            | "article"
            | "aside"
            | "blockquote"
            | "details"
            | "dialog"
            | "dd"
            | "div"
            | "dl"
            | "dt"
            | "fieldset"
            | "figcaption"
            | "figure"
            | "footer"
            | "form"
            | "h1"
            | "h2"
            | "h3"
            | "h4"
            | "h5"
            | "h6"
            | "header"
            | "hgroup"
            | "hr"
            | "li"
            | "main"
            | "nav"
            | "ol"
            | "p"
            | "pre"
            | "section"
            | "table"
            | "ul"
    )
}

/// Elements that render as `inline-block` / replaced content — they take up
/// block space even though they are not block-display.  A space after one of
/// these should not be treated as prose glue (it converts to a newline on its
/// own line in a broken fragment, just like a block element).
fn is_inline_block_element(tag: &str) -> bool {
    matches!(
        tag,
        "input" | "button" | "select" | "object" | "video" | "audio"
    )
}
