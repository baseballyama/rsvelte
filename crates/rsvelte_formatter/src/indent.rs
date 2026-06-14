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
                    // the next node is a RegularElement (inline HTML), in
                    // which case the prose stays on one line (e.g.
                    // `{field} <input />` or `{a} <br />`).
                    //
                    // The "broken" criterion differs by context:
                    // - Element children (not block body): broken whenever the
                    //   fragment has any whitespace-text-with-newline sibling.
                    // - Block bodies (`{#if}` / `{#snippet}` / etc.): broken
                    //   only when there is a non-ExpressionTag indent-provoking
                    //   sibling (ConstTag, HtmlTag, Comment, elements, …).
                    //   A block body of only `{a} {b}` stays inline because
                    //   prettier treats it as prose in that context.
                    //
                    // Leading/trailing inline whitespace at the document root
                    // is insignificant and is removed.
                    let prev_provoking = i > 0 && is_indent_provoking(&fragment.nodes[i - 1]);
                    let next_not_regular = i < last
                        && !matches!(&fragment.nodes[i + 1], TemplateNode::RegularElement(_));
                    let next_provoking = i < last && is_indent_provoking(&fragment.nodes[i + 1]);
                    let effectively_broken = if is_block_body {
                        has_non_expression_block_child
                    } else {
                        fragment_is_broken
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
                let reindented = reindent_text_lines(text, &child_indent, trailing_indent);
                if reindented != text {
                    edits.push((t.start, t.end, reindented));
                }
            }
        }

        // An HTML comment always sits on its own line. When it abuts a sibling
        // node directly (no whitespace text node between them, e.g.
        // `<!-- c --><h1>`), insert a line break so the comment and its
        // neighbour land on separate lines (prettier / oxfmt behaviour).
        for w in fragment.nodes.windows(2) {
            let (a, b) = (&w[0], &w[1]);
            if matches!(a, TemplateNode::Text(_)) || matches!(b, TemplateNode::Text(_)) {
                continue;
            }
            let is_comment =
                matches!(a, TemplateNode::Comment(_)) || matches!(b, TemplateNode::Comment(_));
            if !is_comment {
                continue;
            }
            let boundary = crate::collapse::template_node_span(a).1;
            if boundary == crate::collapse::template_node_span(b).0 {
                edits.push((boundary, boundary, format!("\n{child_indent}")));
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
            if !pending_collapsed && let Some(frag) = &blk.pending {
                collect_indent_edits_inner(source, frag, next_depth, true, true, options, edits)?;
            }
            if let Some(frag) = &blk.then {
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
/// Note: `<textarea>` is intentionally NOT listed here. While its text
/// content is collapsed to a single line by the collapse pass, its interior
/// indentation is still normalized (tabs → spaces) by the indent pass.
fn is_whitespace_preserving(tag_name: &str) -> bool {
    matches!(tag_name, "pre")
}

fn indent_for_level(level: usize, opts: &JsFormatOptions) -> String {
    if opts.indent_style.is_tab() {
        "\t".repeat(level)
    } else {
        " ".repeat(level * opts.indent_width.value() as usize)
    }
}
