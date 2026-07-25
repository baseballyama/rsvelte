//! Template processing for svelte2tsx.
//!
//! Converts Svelte template AST nodes into TSX expressions for type checking
//! by modifying the source in-place using MagicString.
//!
//! Each template node type has a corresponding handler that overwrites the
//! original source range with the appropriate TypeScript/TSX code.

mod attributes;
mod collect;
mod ctx;
mod segs;
mod utils;

use crate::ast::template::{
    AttachTag, Attribute, AttributeNode, AttributeValue, AttributeValuePart, AwaitBlock,
    BindDirective, ClassDirective, Comment, Component, ConstTag, DebugTag, EachBlock,
    ExpressionTag, Fragment, HtmlTag, IfBlock, KeyBlock, LetDirective, OnDirective, RegularElement,
    RenderTag, SlotElement, SnippetBlock, SpreadAttribute, StyleDirective, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement, TemplateNode, Text, TitleElement, TransitionDirective,
    UseDirective,
};
use std::fmt::Write as _;

use indexmap::IndexMap;

use super::magic_string::MagicString;
use super::svelte2tsx::{Svelte2TsxOptions, SvelteVersion, slice_src};
use attributes::svg::is_svg_attribute;
use ctx::{Counter, ELEMENT_OPENER_COMMENTS, TemplateNodeExt};
use segs::{
    Seg, bake_out_of_order_src, emit_segmented_overwrite, segs_is_empty, segs_push_lit,
    segs_push_src, segs_to_string, segs_trim_start,
};
use utils::expr::{
    extend_expr_end_with_ts_postfix, get_binding_lhs_text, get_expression_end_stripping_ts,
    get_expression_range, get_expression_text, get_set_binding_ranges,
};
use utils::names::{reversed_component_instance_name, reversed_component_name};
use utils::source::{
    closing_tag_name_matches, count_tag_to_attr_spaces, find_closing_tag_start,
    find_opening_tag_end,
};

pub(crate) use ctx::{clear_element_opener_comments, set_element_opener_comments};

// =============================================================================
// Template context for collecting slot/event information
// =============================================================================

/// Information collected during template processing.
#[derive(Debug, Default)]
pub struct TemplateInfo {
    /// Slots used in the component: slot_name -> list of prop strings.
    /// e.g., "default" -> ["a:b", "c:d"]
    pub slots: IndexMap<String, Vec<String>>,
    /// Events forwarded from elements / components (on:event without handler),
    /// in template-walk order. Each entry carries the kind so the assembly can
    /// mirror the official `EventHandler` bubbled-events `Map` semantics: an
    /// `Element` forward does a plain `set` (overwrite), a `Component` forward
    /// concats into the existing entry (`unionType`).
    /// e.g., "click" -> "__sveltets_2_mapElementEvent('click')"
    pub element_events: Vec<(String, String, ForwardedEventKind)>,
}

/// How a forwarded event (`on:event` with no handler) combines with an existing
/// entry for the same event name, mirroring the official
/// `event-handler.ts` `EventHandler` map.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ForwardedEventKind {
    /// Element / `svelte:window` / `svelte:body` / `svelte:element` etc. —
    /// official `bubbledEvents.set(name, expr)` (plain overwrite).
    Element,
    /// Component / `svelte:component` — official `handleEventHandlerBubble`
    /// concats into the existing entry.
    Component,
}

// =============================================================================
// Main entry point
// =============================================================================

/// Process the template fragment by modifying the MagicString in-place.
///
/// Walks the fragment's nodes and overwrites template node ranges with TSX
/// equivalents. The MagicString is modified directly.
///
/// Returns `TemplateInfo` containing collected slot/event information for
/// use in the return statement.
pub fn process_template_inplace(
    fragment: &Fragment,
    source: &str,
    _options: &Svelte2TsxOptions,
    str: &mut MagicString,
) {
    let mut counter = Counter::new();
    // depth 0 = root fragment; elements and components increment it for their children
    process_fragment_inplace(fragment, source, _options, str, &mut counter, 0);

    // NOTE: trailing whitespace after the last template node is left untouched.
    // Official svelte2tsx keeps it (the source `\n` ends up between the template
    // output and the appended async wrapper `};`); oxfmt normalises it away for
    // valid output, but a top-level-await component is emitted raw, where
    // blanking the trailing newline diverged from official.
}

/// Collect slot and event information from the template AST.
///
/// This is a pre-pass that walks the AST to collect:
/// - Slot elements with their props (for the return statement `slots: {...}`)
/// - Forwarded events (for the return statement `events: {...}`)
pub fn collect_template_info(fragment: &Fragment, source: &str) -> TemplateInfo {
    let mut info = TemplateInfo::default();
    // `scope` maps an in-scope template binding name (e.g. an `{#each}` context
    // variable) to the expression that types it at the top level — for an each
    // block, `__sveltets_2_unwrapArr(<collection>)`. Slot props referencing
    // such a binding emit that expression instead of the bare name, so the
    // `slots: { … }` return reflects the element type. Mirrors official
    // `SlotHandler.getResolveExpressionStr` (EachBlock → unwrapArr).
    let mut scope: Vec<(String, String)> = Vec::new();
    collect::collect_info_from_fragment(fragment, source, &mut info, &mut scope, None);
    info
}

/// Hoist `{#snippet}` blocks to the top of their containing block/element.
///
/// Mirrors `hoistSnippetBlock` in the JS reference
/// (`htmlxtojsx_v2/nodes/SnippetBlock.ts`): each non-leading snippet child is
/// moved to `targetPosition`, the position of the first non-snippet,
/// non-empty-text child. This lets later content reference a snippet defined
/// further down in source (the generated `const foo = ...` declaration is
/// emitted before the `{const}` / `{let}` declaration tags and elements that
/// follow it).
///
/// Snippets that are already first (`targetPosition` still `None`) or already
/// at the target position are left untouched, matching the JS reference's
/// early-`continue` guards. Component / boundary containers are excluded by
/// their callers (they treat snippets as implicit props instead), so this is
/// only invoked for block and plain-element fragments.
fn hoist_snippet_blocks(fragment: &Fragment, source: &str, str: &mut MagicString) {
    let mut target_position: Option<u32> = None;
    for node in &fragment.nodes {
        if !matches!(node, TemplateNode::SnippetBlock(_)) {
            if target_position.is_none() {
                let is_empty_text = match node {
                    TemplateNode::Text(t) => source
                        .get(t.start as usize..t.end as usize)
                        .map(|s| s.trim().is_empty())
                        .unwrap_or(true),
                    _ => false,
                };
                if !is_empty_text {
                    // JS reference: `node.type === 'Text' ? node.end : node.start`
                    target_position = Some(match node {
                        TemplateNode::Text(t) => t.end,
                        _ => node.start(),
                    });
                }
            }
            continue;
        }

        // It's a snippet block.
        let Some(tp) = target_position else {
            // Already the first meaningful child — nothing to move.
            continue;
        };
        let s = node.start();
        if s == tp {
            continue;
        }
        str.move_range(s, node.end(), tp);
    }
}

/// Process a fragment's child nodes in-place.
///
/// `depth` is the current nesting depth: how many ancestor element / component
/// nodes surround this fragment.  Blocks (if/each/await/key/snippet) do NOT
/// increment the depth; only `RegularElement` and component nodes do.
fn process_fragment_inplace(
    fragment: &Fragment,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    for node in &fragment.nodes {
        process_node_inplace(node, source, options, str, counter, depth);
    }
}

/// Dispatch a template node to its in-place handler.
fn process_node_inplace(
    node: &TemplateNode,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    match node {
        TemplateNode::Text(text) => handle_text(text, source, str),
        TemplateNode::Comment(comment) => handle_comment(comment, str),
        TemplateNode::ExpressionTag(expr) => handle_expression_tag(expr, source, str),
        TemplateNode::HtmlTag(html) => handle_html_tag(html, source, str),
        TemplateNode::ConstTag(tag) => handle_const_tag(tag, source, str),
        TemplateNode::DeclarationTag(tag) => handle_declaration_tag(tag, source, str),
        TemplateNode::DebugTag(tag) => handle_debug_tag(tag, source, str),
        TemplateNode::RenderTag(tag) => handle_render_tag(tag, source, str),
        TemplateNode::AttachTag(tag) => handle_attach_tag(tag, str),
        // Control-flow blocks do NOT increment depth (mirrors official computeDepth which
        // only counts ancestor Element/InlineComponent nodes, not block nodes or root).
        TemplateNode::IfBlock(block) => {
            handle_if_block(block, source, options, str, counter, depth)
        }
        TemplateNode::EachBlock(block) => {
            handle_each_block(block, source, options, str, counter, depth)
        }
        TemplateNode::AwaitBlock(block) => {
            handle_await_block(block, source, options, str, counter, depth)
        }
        TemplateNode::KeyBlock(block) => {
            handle_key_block(block, source, options, str, counter, depth)
        }
        TemplateNode::SnippetBlock(block) => {
            handle_snippet_block(block, source, options, str, counter, depth)
        }
        // Elements and components DO increment depth for their children.
        TemplateNode::RegularElement(el) => {
            handle_regular_element(el, source, options, str, counter, depth)
        }
        TemplateNode::Component(comp) => {
            handle_component(comp, source, options, str, counter, depth)
        }
        TemplateNode::SvelteComponent(comp) => {
            handle_svelte_component(comp, source, options, str, counter, depth)
        }
        TemplateNode::SvelteElement(el) => {
            handle_svelte_dynamic_element(el, source, options, str, counter, depth)
        }
        TemplateNode::TitleElement(el) => {
            handle_title_element(el, source, options, str, counter, depth)
        }
        TemplateNode::SlotElement(el) => {
            handle_slot_element(el, source, options, str, counter, depth)
        }
        TemplateNode::SvelteSelf(el) => {
            handle_svelte_self(el, source, options, str, counter, depth)
        }
        TemplateNode::SvelteOptions(el)
        | TemplateNode::SvelteBody(el)
        | TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteWindow(el) => {
            handle_svelte_special_element(el, source, options, str, counter, depth)
        }
    }
}

// =============================================================================
// Text and Comments
// =============================================================================

/// Handle a text node.
///
/// Text nodes in svelte2tsx have their non-whitespace characters removed
/// (replaced with empty). Whitespace characters are kept as-is.
/// If the result is empty but the original text had content, at least 1
/// space is preserved (to prevent hover artifacts in the language server).
fn handle_text(text: &Text, _source: &str, str: &mut MagicString) {
    if text.start >= text.end {
        return;
    }
    // Mirror JS reference (`htmlxtojsx_v2/nodes/Text.ts`) exactly: it inspects
    // `node.data` — the *decoded* inner text (HTML entities resolved, e.g.
    // `&nbsp;` → U+00A0) — and emits `node.data.replace(/\S/g, '')`, i.e. it
    // strips every non-whitespace character and keeps the whitespace as-is.
    // If nothing survives but the data was non-empty, a single space is kept
    // (so hovering over text doesn't surface the containing tag's info).
    //
    // Using `node.data` rather than the raw source range is essential: the raw
    // range for `&nbsp;` is the literal `&nbsp;`, which is invalid JS and made
    // oxfmt reject the whole output. The decoded U+00A0 is a JS whitespace
    // character, so it formats away cleanly like any other whitespace.
    if text.data.is_empty() {
        return;
    }
    let mut replacement: String = text.data.chars().filter(|c| c.is_whitespace()).collect();
    if replacement.is_empty() {
        replacement = " ".to_string();
    }
    str.overwrite(text.start, text.end, &replacement);
}

/// Handle an HTML comment node.
///
/// Comments are blanked out in the TSX output.
fn handle_comment(comment: &Comment, str: &mut MagicString) {
    if comment.start >= comment.end {
        return;
    }
    str.overwrite(comment.start, comment.end, "");
}

// =============================================================================
// Expression Tags
// =============================================================================

/// Handle an expression tag: `{expression}`.
///
/// Overwrites `{` with empty and `}` with `;` so the expression is preserved
/// as a statement: `{count}` → `count;`
/// Comments (from the per-compile set) whose source range lies fully within
/// `[start, end)`, sorted by start. Used to preserve `{/* c */ expr}` comments.
fn comments_in_opener_range(start: u32, end: u32) -> Vec<(u32, u32)> {
    if start >= end {
        return Vec::new();
    }
    ELEMENT_OPENER_COMMENTS.with(|c| {
        let mut v: Vec<(u32, u32)> = c
            .borrow()
            .iter()
            .copied()
            .filter(|&(s, e)| s >= start && e <= end)
            .collect();
        v.sort_by_key(|&(s, _)| s);
        v
    })
}

fn handle_expression_tag(expr: &ExpressionTag, source: &str, str: &mut MagicString) {
    if expr.start >= expr.end {
        return;
    }

    if let Some((expr_start, expr_end)) = get_expression_range(&expr.expression) {
        // Leading: keep any `{/* c */ expr}` comments between the `{` and the
        // expression (official preserves them, stripping only the `{` and a
        // wrapping `(`). Strip from `{` up to the first such comment.
        let lead_keep = comments_in_opener_range(expr.start, expr_start)
            .first()
            .map(|&(cs, _)| cs)
            .unwrap_or(expr_start);
        if expr.start < lead_keep {
            str.overwrite(expr.start, lead_keep, "");
        }
        // The parser narrows the expression span past a trailing TS postfix —
        // `name as string`, `x satisfies T`, `x!`. Those must be PRESERVED
        // (official keeps them), unlike wrapping parens (`(foo)`) which the
        // narrowing strips symmetrically and which must stay stripped. So if the
        // text between `expr_end` and the closing `}` is a TS postfix, keep it
        // (overwrite only the `}`); otherwise overwrite from `expr_end` (which
        // drops a trailing `)` to match the stripped leading `(`).
        let close = {
            let bytes = source.as_bytes();
            let mut c = expr.end as usize;
            while c > expr_end as usize && bytes[c - 1] != b'}' {
                c -= 1;
            }
            c
        };
        let tail = source
            .get(expr_end as usize..close.saturating_sub(1))
            .unwrap_or("")
            .trim_start();
        let is_ts_postfix =
            tail.starts_with("as ") || tail.starts_with("satisfies ") || tail.starts_with('!');
        if is_ts_postfix && close > expr_end as usize {
            str.overwrite((close - 1) as u32, expr.end, ";");
        } else {
            // Trailing: keep any `{expr /* c */}` comments between the expression
            // and `}` (emit `;` right after the expression, strip a wrapping `)`
            // and the `}`).
            let trailing = comments_in_opener_range(expr_end, close.saturating_sub(1) as u32);
            match (trailing.first(), trailing.last()) {
                (Some(&(first_cs, _)), Some(&(_, last_ce))) => {
                    if expr_end < first_cs {
                        str.overwrite(expr_end, first_cs, "; ");
                    }
                    if last_ce < expr.end {
                        str.overwrite(last_ce, expr.end, "");
                    }
                }
                _ if expr_end < expr.end => {
                    str.overwrite(expr_end, expr.end, ";");
                }
                _ => {}
            }
        }
    } else {
        // Fallback: overwrite the whole thing with a space
        str.overwrite(expr.start, expr.end, " ");
    }
}

/// Handle an HTML tag: `{@html expression}`.
///
/// The expression needs type checking even though it's raw HTML.
fn handle_html_tag(html: &HtmlTag, _source: &str, str: &mut MagicString) {
    if html.start >= html.end {
        return;
    }

    if let Some((expr_start, expr_end)) = get_expression_range(&html.expression) {
        // Overwrite `{@html ` prefix
        if html.start < expr_start {
            str.overwrite(html.start, expr_start, "");
        }
        // Overwrite closing `}` with `;`
        if expr_end < html.end {
            str.overwrite(expr_end, html.end, ";");
        }
    } else {
        str.overwrite(html.start, html.end, " ");
    }
}

/// Handle a const tag: `{@const declaration}`.
///
/// The const declaration is emitted as a regular `const` statement.
fn handle_const_tag(tag: &ConstTag, source: &str, str: &mut MagicString) {
    if tag.start >= tag.end {
        return;
    }

    // Mirror upstream svelte2tsx `handleConstTag`: overwrite `{@const ` →
    // `const ` up to `constTag.expression.start` (the pattern id) and the
    // closing `}` → `;` from `constTag.expression.end` (the initializer end).
    // The declaration's AST offsets are unreliable here — the template-expression
    // arena isn't resolved in the svelte2tsx parse path (so `as_json()` has no
    // declarator children), and since Svelte 5.56.4 the `VariableDeclaration`
    // `start` points at the `const` keyword (part of `@const`), which would
    // duplicate it (`const const area = …`). Derive the id start and initializer
    // end from the source text instead.
    if let Some((id_start, init_end)) = const_tag_spans(source, tag.start, tag.end) {
        // Overwrite `{@const ` prefix with `const `
        if tag.start < id_start {
            str.overwrite(tag.start, id_start, "const ");
        }
        // Overwrite trailing `}` (and any whitespace before it) with `;`
        if init_end < tag.end {
            str.overwrite(init_end, tag.end, ";");
        }
    } else {
        str.overwrite(tag.start, tag.end, " ");
    }
}

/// Byte offsets of a `{@const …}` tag's pattern id start and initializer end,
/// derived from the source between `tag_start` (`{`) and `tag_end` (past `}`).
/// The id start is the first non-whitespace byte after the `@const` keyword; the
/// initializer end is the last non-whitespace byte before the closing `}`.
fn const_tag_spans(source: &str, tag_start: u32, tag_end: u32) -> Option<(u32, u32)> {
    let bytes = source.as_bytes();
    let (lo, hi) = (tag_start as usize, tag_end as usize);
    if hi > bytes.len() || lo >= hi {
        return None;
    }
    // Skip `{`, `@`, the `const` keyword, then any whitespace → pattern id start.
    let inner = &source[lo..hi];
    let at = inner.find("@const")? + "@const".len();
    let mut i = lo + at;
    while i < hi && bytes[i].is_ascii_whitespace() {
        i += 1;
    }
    let id_start = i;
    // Scan back from the closing `}` over whitespace → initializer end.
    let mut j = hi.saturating_sub(1); // the `}` (tag_end is one past it)
    while j > id_start && bytes[j] != b'}' {
        j -= 1;
    }
    // j is now at `}`; step back over whitespace to the initializer's last byte.
    let mut end = j;
    while end > id_start && bytes[end - 1].is_ascii_whitespace() {
        end -= 1;
    }
    if id_start >= end {
        return None;
    }
    Some((id_start as u32, end as u32))
}

/// Handle a declaration tag: `{let x = expr}` / `{const x = expr}`
/// (Svelte 5.56.0 #18282).
///
/// In TSX output the declaration is emitted as a regular `let` / `const`
/// statement, mirroring `{@const}` handling. The leading `{` becomes the
/// declaration kind keyword and a trailing space, and the closing `}` becomes
/// `;` so the resulting code is parseable TS at the spot where the user wrote
/// the tag.
fn handle_declaration_tag(
    tag: &crate::ast::template::DeclarationTag,
    _source: &str,
    str: &mut MagicString,
) {
    if tag.start >= tag.end {
        return;
    }
    if let Some((decl_start, decl_end)) = get_expression_range(&tag.declaration) {
        // Overwrite the opening `{` (and any whitespace before the kind
        // keyword) with no leading prefix — the source already contains the
        // `let ` / `const ` keyword. Just drop the `{`.
        if tag.start < decl_start {
            str.overwrite(tag.start, decl_start, "");
        }
        // Overwrite closing `}` with `;`.
        if decl_end < tag.end {
            str.overwrite(decl_end, tag.end, ";");
        }
    } else {
        str.overwrite(tag.start, tag.end, " ");
    }
}

/// Handle a debug tag: `{@debug identifiers}`.
///
/// `{@debug myfile}` → `;myfile;`
/// `{@debug a, b}` → `;a;b;`
///
/// Each identifier is left as an unchanged source chunk (with `;`
/// inserted before and after) so per-character source-map segments
/// resolve diagnostics to the user's identifier position, not the
/// `{@debug` anchor.
fn handle_debug_tag(tag: &DebugTag, source: &str, str: &mut MagicString) {
    if tag.start >= tag.end {
        return;
    }
    let mut idents: Vec<(u32, u32)> = Vec::with_capacity(tag.identifiers.len());
    for ident in &tag.identifiers {
        if let Some(range) = get_expression_range(ident) {
            idents.push(range);
        }
    }
    // Fall back to the previous one-shot rewrite when no identifiers
    // expose a usable span — keeps the synthesised path identical.
    if idents.is_empty() {
        let mut replacement = String::new();
        replacement.push(';');
        for ident in &tag.identifiers {
            let text = get_expression_text(ident, source);
            replacement.push_str(text);
            replacement.push(';');
        }
        str.overwrite(tag.start, tag.end, &replacement);
        return;
    }
    // Replace `{@debug ` with `;`, then between every identifier replace
    // the source separator (`,` plus optional whitespace) with `;`, then
    // replace the trailing `}` with `;`.
    let first_start = idents[0].0;
    str.overwrite(tag.start, first_start, ";");
    for window in idents.windows(2) {
        let prev_end = window[0].1;
        let next_start = window[1].0;
        if prev_end < next_start {
            str.overwrite(prev_end, next_start, ";");
        }
    }
    let last_end = idents.last().unwrap().1;
    if last_end < tag.end {
        str.overwrite(last_end, tag.end, ";");
    }
}

/// Handle a render tag: `{@render snippet(args)}`.
///
/// `{@render foo(1)}` → `;__sveltets_2_ensureSnippet(foo(1));`
///
/// The wrapper is split into a prefix `;__sveltets_2_ensureSnippet(`
/// and a suffix `);` so the inner expression stays as an unchanged
/// source chunk in MagicString. That preserves per-character source-map
/// segments inside the snippet expression — a TS diagnostic at e.g.
/// `foo(1)`'s `1` resolves to its exact `.svelte` column instead of
/// snapping to the `{@render` anchor.
fn handle_render_tag(tag: &RenderTag, _source: &str, str: &mut MagicString) {
    if tag.start >= tag.end {
        return;
    }

    if let Some((expr_start, expr_end)) = get_expression_range(&tag.expression) {
        str.overwrite(tag.start, expr_start, ";__sveltets_2_ensureSnippet(");
        str.overwrite(expr_end, tag.end, ");");
    } else {
        str.overwrite(tag.start, tag.end, " ");
    }
}

/// Handle an attach tag: `{@attach expression}`.
fn handle_attach_tag(tag: &AttachTag, str: &mut MagicString) {
    if tag.start >= tag.end {
        return;
    }
    // Attach tags are removed in TSX output
    str.overwrite(tag.start, tag.end, "");
}

// =============================================================================
// Block Nodes
// =============================================================================

/// Handle an if block: `{#if condition}...{:else if}...{:else}...{/if}`.
///
/// Generates: `if(show){...} else {...}`
fn handle_if_block(
    block: &IfBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if block.start >= block.end {
        return;
    }

    let test_text = get_expression_text(&block.test, source);

    // Find the start of the consequent content. When the consequent is empty
    // (`{#if x}{:else …}` / `{#if x}{/if}`), the body still opens right after
    // the `}` that closes the `{#if EXPR}` (or `{:else if EXPR}`) tag — this
    // mirrors official `handleIf`, which always places the `){` body opener at
    // `indexOf('}', expressionEnd) + 1`. Using `block.end` here (the position
    // after `{/if}`) made the header overwrite swallow the entire `{:else …}`
    // / `{/if}` tail, corrupting the output.
    let consequent_start = if !block.consequent.nodes.is_empty() {
        block.consequent.nodes[0].start()
    } else {
        let test_end = get_expression_range(&block.test)
            .map(|(_, e)| e)
            .unwrap_or(block.start);
        let bytes = source.as_bytes();
        let mut p = test_end as usize;
        while p < bytes.len() && bytes[p] != b'}' {
            p += 1;
        }
        ((p + 1).min(bytes.len())) as u32
    };

    // Mirror `htmlxtojsx_v2/nodes/IfElseBlock.ts::handleIf`: an IfBlock that
    // is the elseif branch of an outer IfBlock starts at the `{` of
    // `{:else if EXPR}` (with `expression.start` *before* `block.start` —
    // svelte 5 records the test expression at its source-level position).
    // Overwrite `{:else if ` → `} else if (` and the trailing `}` → `){`,
    // exactly as the JS reference does.
    if block.elseif {
        let (test_start, test_end) = get_expression_range(&block.test).unwrap_or((0, 0));
        let bytes = source.as_bytes();
        let mut brace_open = test_start as usize;
        while brace_open > 0 && bytes[brace_open - 1] != b'{' {
            brace_open -= 1;
        }
        brace_open = brace_open.saturating_sub(1);
        str.overwrite(brace_open as u32, test_start, "} else if (");

        let mut close_brace = test_end as usize;
        while close_brace < bytes.len() && bytes[close_brace] != b'}' {
            close_brace += 1;
        }
        if close_brace < bytes.len() {
            str.overwrite(test_end, (close_brace + 1) as u32, "){");
        }
    } else {
        // Split the `{#if EXPR}` rewrite so the test expression stays as
        // an unchanged source chunk in MagicString — preserves
        // per-character source-map segments for TS diagnostics inside
        // the condition. Falls back to the bulk `overwrite` when the
        // expression has no concrete source range (e.g. synthesised).
        if let Some((test_start, test_end)) = get_expression_range(&block.test)
            && test_start >= block.start
            && test_end <= consequent_start
        {
            str.overwrite(block.start, test_start, "if(");
            // [test_start, test_end) left untouched.
            if test_end < consequent_start {
                str.overwrite(test_end, consequent_start, ")");
            } else {
                str.append_left(consequent_start, ")");
            }
        } else {
            str.overwrite(block.start, consequent_start, &format!("if({})", test_text));
        }
        // Insert opening brace
        str.append_left(consequent_start, "{");
    }

    // Hoist inner snippets above sibling `{@const}`/`{let}` / elements that
    // reference them (a `{@const xx = test}` before its `{#snippet test}` in the
    // same block needs `test` declared first), as in the each-body path.
    hoist_snippet_blocks(&block.consequent, source, str);

    // Process children (blocks don't increment depth)
    process_fragment_inplace(&block.consequent, source, options, str, counter, depth);

    // Handle alternate
    if let Some(ref alternate) = block.alternate {
        hoist_snippet_blocks(alternate, source, str);
        // Find the {:else} or {:else if} tag position
        // The alternate fragment starts after the {:else} tag
        let alternate_start = if !alternate.nodes.is_empty() {
            alternate.nodes[0].start()
        } else {
            block.end
        };

        // Check if the alternate is an elseif
        let has_elseif =
            alternate.nodes.len() == 1 && matches!(alternate.nodes[0], TemplateNode::IfBlock(_));

        if has_elseif {
            // Don't insert anything between consequent end and the nested
            // IfBlock — the nested IfBlock with `block.elseif == true`
            // owns the `} else if (EXPR){` rewrite (see branch above).
            // Process the elseif block (which will handle its own
            // `} else if(...) {` rewrite).
            process_fragment_inplace(alternate, source, options, str, counter, depth);

            // No closing `}` needed since the inner if block handles `{/if}`
        } else {
            // Find where the consequent content ends. For an empty consequent
            // this is the body-open position (right after `{#if EXPR}`), NOT
            // `block.start` — otherwise the `} else {` overwrite would clobber
            // the `if(EXPR){` header we just emitted.
            let consequent_end = if !block.consequent.nodes.is_empty() {
                block.consequent.nodes.last().unwrap().end()
            } else {
                consequent_start
            };

            // For an empty `{:else}` body, the else block opens right after the
            // `}` that closes the `{:else}` tag — NOT at `block.end` (after
            // `{/if}`), which would make the `} else {` overwrite swallow the
            // `{/if}` and leave the else body unclosed.
            let alternate_start = if !alternate.nodes.is_empty() {
                alternate_start
            } else {
                let bytes = source.as_bytes();
                let mut p = consequent_end as usize;
                while p < bytes.len() && bytes[p] != b'}' {
                    p += 1;
                }
                ((p + 1).min(bytes.len())) as u32
            };

            // Overwrite {:else} with `} else {`
            str.overwrite(consequent_end, alternate_start, "} else {");

            // Hoist alternate-branch snippets above sibling declarations too.
            hoist_snippet_blocks(alternate, source, str);
            // Process alternate children
            process_fragment_inplace(alternate, source, options, str, counter, depth);

            // Overwrite `{/if}` with `}`
            let alternate_end = if !alternate.nodes.is_empty() {
                alternate.nodes.last().unwrap().end()
            } else {
                alternate_start
            };
            if alternate_end < block.end {
                str.overwrite(alternate_end, block.end, "}");
            }
        }
    } else {
        // No alternate - just close with `}`
        let consequent_end = if !block.consequent.nodes.is_empty() {
            block.consequent.nodes.last().unwrap().end()
        } else {
            consequent_start
        };
        if consequent_end < block.end {
            str.overwrite(consequent_end, block.end, "}");
        }
    }
}

/// Header lead-in for the each-block when CTX is relocated. Mirrors the
/// simple-case ` for(let ` prefix; the trailing space lets the moved CTX
/// chunk slot in cleanly.
fn prefix_with_for(prefix: &str) -> String {
    format!("{}for(let ", prefix)
}

/// Build the text emitted after EXPR (and the relocated CTX) in the
/// structured-bake each-block header. Mirrors the non-relocated
/// `header_after_expr`: `))` closes `__sveltets_2_ensureArray(EXPR)` and
/// the `for(...)` argument list; `{` opens the for body; the idx / key
/// bindings still travel as plain text — only CTX is source-preserved.
fn build_each_after_ctx_tail(block: &EachBlock, source: &str) -> String {
    let suffix = if block.context.is_some() {
        ""
    } else {
        "$$each_item;"
    };
    // `))` closes `__sveltets_2_ensureArray(EXPR)` + the `for(...)`
    // argument list; `{` opens the for body.
    let mut s = format!(")){{{}", suffix);
    if let Some(ref index) = block.index {
        let _ = write!(s, "let {} = 1;", index);
    }
    if let Some(ref key) = block.key {
        let key_text = get_expression_text(key, source);
        s.push_str(key_text);
        s.push(';');
    }
    s
}

/// Handle an each block: `{#each items as item, i (key)}...{:else}...{/each}`.
///
/// Generates: `for(let item of __sveltets_2_ensureArray(items)){let i = 1;key;...}`
/// Find the byte offset of the last whitespace-bounded `as` keyword in `s`.
fn rfind_as_keyword(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut found = None;
    let mut j = 0usize;
    while j + 1 < bytes.len() {
        if bytes[j] == b'a' && bytes[j + 1] == b's' {
            let before_ok = j == 0 || bytes[j - 1].is_ascii_whitespace();
            let after_ok = bytes.get(j + 2).is_none_or(|c| c.is_ascii_whitespace());
            if before_ok && after_ok {
                found = Some(j);
            }
        }
        j += 1;
    }
    found
}

/// Extend the each-collection expression's end past a trailing TypeScript
/// postfix (`as const`, `as T`, `satisfies T`, `!`) that `remove_typescript_nodes`
/// stripped from `block.expression`'s span. The collection is everything in the
/// source before the each binding's ` as ` keyword (the one immediately preceding
/// `block.context`); the parser's narrowed `expr_end` drops a trailing postfix,
/// which official svelte2tsx keeps (e.g. `{#each link.sections! as s}` →
/// `__sveltets_2_ensureArray(link.sections!)`). Only applies when there is a
/// context binding (`as X`); index/key-only forms keep the narrowed end.
fn each_collection_extended_end(block: &EachBlock, source: &str, expr_end: u32) -> u32 {
    let Some(ctx) = block.context.as_ref() else {
        return expr_end;
    };
    let Some((ctx_start, _)) = get_expression_range(ctx) else {
        return expr_end;
    };
    if ctx_start <= expr_end || ctx_start as usize > source.len() {
        return expr_end;
    }
    let region = slice_src(source, expr_end as usize, ctx_start as usize);
    // The each separator is the LAST whitespace-bounded `as` before the context;
    // everything before it (after expr_end) is the TS postfix, if any.
    let Some(as_off) = rfind_as_keyword(region) else {
        return expr_end;
    };
    let postfix = region[..as_off].trim_end();
    // Only extend for a genuine TS postfix (`as …`, `satisfies …`, `!`). A bare
    // `)` here is the closing paren of a `(expr)` whose wrapping parens the
    // parser stripped symmetrically (`{#each (c) as x}`) — that must stay
    // dropped, like the expression-tag handler. (Mirrors `handle_expression_tag`.)
    let pf = postfix.trim_start();
    let is_ts_postfix =
        pf.starts_with("as ") || pf.starts_with("satisfies ") || pf.starts_with('!');
    if !is_ts_postfix {
        return expr_end;
    }
    expr_end + postfix.len() as u32
}

fn handle_each_block(
    block: &EachBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if block.start >= block.end {
        return;
    }

    // Expression range, extended to include a trailing TS postfix the parser
    // narrowed away (`x!`, `x as const`).
    let expr_range = get_expression_range(&block.expression)
        .map(|(s, e)| (s, each_collection_extended_end(block, source, e)));
    let expr_text = match expr_range {
        Some((s, e)) => source.get(s as usize..e as usize).unwrap_or(""),
        None => "",
    };
    let has_context = block.context.is_some();
    let context_text = block
        .context
        .as_ref()
        .map(|c| get_expression_text(c, source).to_string())
        .unwrap_or_else(|| "$$each_item".to_string());

    let body_start = if !block.body.nodes.is_empty() {
        block.body.nodes[0].start()
    } else {
        block.end
    };

    // Build the for loop header.
    // The `{#` prefix of `{#each` is replaced with spaces to preserve
    // source positions (matching JS svelte2tsx behavior).
    //
    // When the loop variable shadows the collection variable (e.g., `{#each items as items}`),
    // a temporary variable is used to avoid the shadowing issue:
    //   `{ const $$_each = __sveltets_2_ensureArray(items); for(let items of $$_each){`
    // Match the JS reference's prefix-spacing for `{#each ... }` headers.
    // The JS port uses MagicString.transform() with per-position chunk moves
    // and appendLefts; the surviving leading whitespace ends up being:
    //   - 1 space when there's no context binding (no `as item`)
    //   - 2 spaces when there's a context binding (`as item`)
    //   - 3 spaces when there's a context + index binding (`as item, i`)
    //   - 4 spaces when there's a context + index + key binding
    //     (`as item, i (key)`)
    // Replicate that spacing here so the column-position assertions in the
    // language-tools fixtures match.
    let needs_temp_var = context_text == expr_text;
    let prefix_spaces = 1
        + (has_context as usize)
        + (block.index.is_some() as usize)
        + (block.key.is_some() as usize);
    let prefix = " ".repeat(prefix_spaces);

    // Build the wrapper around the expression chunk so MagicString can
    // preserve the expression's per-character mapping back to the
    // original source. Context/index/key bindings come AFTER the
    // expression in source but appear earlier (or later) in the for-loop
    // header — bake them as ordinary text. Their column mapping is lost
    // but they're rarely the target of type errors.
    let (header_before_expr, header_after_expr) = if needs_temp_var {
        (
            format!("{}{{ const $$_each = __sveltets_2_ensureArray(", prefix),
            {
                let mut s = format!("); for(let {} of $$_each){{", context_text);
                if let Some(ref index) = block.index {
                    let _ = write!(s, "let {} = 1;", index);
                }
                if let Some(ref key) = block.key {
                    let key_text = get_expression_text(key, source);
                    s.push_str(key_text);
                    s.push(';');
                }
                s
            },
        )
    } else {
        let suffix = if has_context { "" } else { "$$each_item;" };
        (
            format!(
                "{}for(let {} of __sveltets_2_ensureArray(",
                prefix, context_text
            ),
            {
                let mut s = format!(")){{{}", suffix);
                if let Some(ref index) = block.index {
                    let _ = write!(s, "let {} = 1;", index);
                }
                if let Some(ref key) = block.key {
                    let key_text = get_expression_text(key, source);
                    s.push_str(key_text);
                    s.push(';');
                }
                s
            },
        )
    };

    if let Some((expr_start, expr_end)) = expr_range {
        // Try to also preserve the context binding's source range so a
        // diagnostic on a destructuring pattern like `{ name, age }` keeps
        // its exact column. The relocation pattern mirrors the
        // await-with-pending case (`MagicString::move_range` + surrounding
        // overwrites).
        //
        // Bails to the simpler EXPR-only preservation when:
        //   - the context isn't an identifier or pattern with a stable
        //     source range,
        //   - the expression and context source ranges overlap (parser
        //     edge case),
        //   - the variable name collides with the expression text
        //     (`{#each items as items}`) — the `needs_temp_var` branch
        //     above rebakes the wrapper around the expression and would
        //     repeat the context text twice.
        let context_range = block.context.as_ref().and_then(get_expression_range);
        if let (Some((ctx_s, ctx_e)), false) = (context_range, needs_temp_var)
            && ctx_s > expr_end
            && ctx_e <= body_start
        {
            // Generated header rewritten to flow as:
            //   "  for(let " + CTX + " of __sveltets_2_ensureArray(" + EXPR + "){...rest..."
            //
            // We move CTX in the chunk list to before EXPR, then overwrite
            // each surrounding gap. Idx / key bindings stay baked into
            // the "after-expr" tail as plain text — preserving their
            // columns would require additional relocations and offers
            // little user value for trivial identifiers.
            str.move_range(ctx_s, ctx_e, expr_start);
            str.overwrite(block.start, expr_start, &prefix_with_for(&prefix));
            str.prepend_right(expr_start, " of __sveltets_2_ensureArray(");
            // " as " (or whitespace) between EXPR and CTX → "){...tail".
            // Then the trailing characters between CTX and body get
            // emitted/cleared.
            let tail = build_each_after_ctx_tail(block, source);
            if expr_end < ctx_s {
                str.overwrite(expr_end, ctx_s, &tail);
            } else {
                str.append_left(ctx_s, &tail);
            }
            if ctx_e < body_start {
                str.overwrite(ctx_e, body_start, "");
            }
        } else {
            str.overwrite(block.start, expr_start, &header_before_expr);
            if expr_end < body_start {
                str.overwrite(expr_end, body_start, &header_after_expr);
            } else {
                // expr_end >= body_start (no space between expr and body opener).
                // Append the suffix immediately after the expression chunk so
                // MagicString anchors it at the right boundary.
                str.append_left(expr_end, &header_after_expr);
            }
        }
    } else {
        // Parser produced no span for the expression — fall back to the
        // monolithic bake (original behaviour).
        let header = format!("{}{}{}", header_before_expr, expr_text, header_after_expr);
        str.overwrite(block.start, body_start, &header);
    }

    // Hoist inner snippets to the top of the each body before processing, so
    // their generated `const foo = ...` declarations precede the `{const}` /
    // `{let}` declaration tags and elements that reference them.
    hoist_snippet_blocks(&block.body, source, str);

    // Process body children (each blocks don't increment depth)
    process_fragment_inplace(&block.body, source, options, str, counter, depth);

    // Handle fallback ({:else}...{/each})
    let body_end = if !block.body.nodes.is_empty() {
        block.body.nodes.last().unwrap().end()
    } else {
        body_start
    };

    if let Some(ref fallback) = block.fallback {
        let fallback_start = if !fallback.nodes.is_empty() {
            fallback.nodes[0].start()
        } else {
            block.end
        };

        // Overwrite {:else} with `}`
        str.overwrite(body_end, fallback_start, "}");

        // Process fallback
        process_fragment_inplace(fallback, source, options, str, counter, depth);

        let fallback_end = if !fallback.nodes.is_empty() {
            fallback.nodes.last().unwrap().end()
        } else {
            fallback_start
        };

        if fallback_end < block.end {
            str.overwrite(fallback_end, block.end, "");
        }
    } else {
        // Close the for loop
        let closing = if needs_temp_var { "}}" } else { "}" };
        if body_end < block.end {
            str.overwrite(body_end, block.end, closing);
        } else {
            // Empty each body (`{#each x as i}{/each}`): body_end == block.end,
            // so there is no source region left to overwrite with the closing
            // brace (the opening-tag remainder + `{/each}` were already cleared
            // by the header handling). Append it so the `for(...){` opened by
            // the header is balanced — otherwise the unclosed brace cascades up
            // and leaves `$$render` itself unterminated.
            str.append_left(block.end, closing);
        }
    }
}

/// Handle an await block: `{#await promise}...{:then value}...{:catch error}...{/await}`.
///
/// Generates patterns like:
/// - `{#await promise}pending{:then value}resolved{/await}`
///   → `{  { const $$_value = await (promise);{ const value = $$_value; resolved}}}`
/// - `{#await promise then value}resolved{/await}`
///   → `{  { const $$_value = await (promise);{ const value = $$_value; resolved}}`
/// - `{#await promise catch error}rejected{/await}`
///   → `{  { try { const $$_value = await (promise);} catch(error) { rejected}}`
fn handle_await_block(
    block: &AwaitBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if block.start >= block.end {
        return;
    }

    let expr_text = get_expression_text(&block.expression, source);

    // Determine the structure of the await block:
    // 1. `{#await promise}` pending `{:then value}` then `{/await}` (has pending, then)
    // 2. `{#await promise then value}` then `{/await}` (no pending, immediate then)
    // 3. `{#await promise catch error}` catch `{/await}` (no pending, immediate catch)
    // 4. `{#await promise}` pending `{:then value}` then `{:catch error}` catch `{/await}`

    let has_pending = block.pending.as_ref().is_some_and(|p| !p.nodes.is_empty());
    let has_then = block.then.is_some();
    let has_catch = block.catch.is_some();

    let value_text = block
        .value
        .as_ref()
        .map(|v| get_expression_text(v, source).to_string())
        .unwrap_or_default();

    let error_text = block
        .error
        .as_ref()
        .map(|e| get_expression_text(e, source).to_string())
        .unwrap_or_default();

    if has_pending {
        // Pattern: {#await promise} pending {:then value} then {:catch error} catch {/await}
        let pending = block.pending.as_ref().unwrap();
        let pending_start = if !pending.nodes.is_empty() {
            pending.nodes[0].start()
        } else {
            block.end
        };

        // Handle then
        if let Some(ref then) = block.then {
            let then_start = if !then.nodes.is_empty() {
                then.nodes[0].start()
            } else {
                block.end
            };

            let prev_end = if !pending.nodes.is_empty() {
                pending.nodes.last().unwrap().end()
            } else {
                pending_start
            };

            // The PROMISE expression source-wise lives inside the
            // `{#await PROMISE}` opener but generated-wise belongs at the
            // `{:then VALUE}` boundary. `move_range` relocates the
            // expression chunk past the pending fragment so its
            // per-character source map survives intact; the `const
            // $$_value = await (…); { const VALUE = $$_value; ` wrapper
            // is attached as the relocated chunk's intro / outro so it
            // travels with the expression.
            if let Some((expr_start, expr_end)) = get_expression_range(&block.expression) {
                str.move_range(expr_start, expr_end, prev_end);
                str.overwrite(block.start, expr_start, "   { ");
                if expr_end < pending_start {
                    str.overwrite(expr_end, pending_start, "");
                }
                // When a `catch` (or error variable) is present, the await
                // must be wrapped in a `try {` so the later `} catch(...) {`
                // is balanced. Mirrors upstream `handleAwait` emitting
                // `try { ` whenever `error || !catch.skip`.
                // `const $$_value = ` and the `{ const VALUE = $$_value; ` inner
                // block are emitted ONLY when there's a `{:then value}` binding
                // (mirrors official `handleAwait`, which gates both on
                // `awaitBlock.value`). A bare `{:then}` is just `await (…);` with
                // the then-body inline.
                str.prepend_right(
                    expr_start,
                    match (has_catch, value_text.is_empty()) {
                        (true, false) => "try { const $$_value = await (",
                        (true, true) => "try { await (",
                        (false, false) => "const $$_value = await (",
                        (false, true) => "await (",
                    },
                );
                let suffix = if !value_text.is_empty() {
                    format!(");{{ const {} = $$_value; ", value_text)
                } else {
                    ");".to_string()
                };
                str.append_left(expr_end, &suffix);
                if prev_end < then_start {
                    str.overwrite(prev_end, then_start, "");
                }
                process_fragment_inplace(pending, source, options, str, counter, depth);
            } else {
                // Parser couldn't span the expression — fall back to
                // the original monolithic bake.
                str.overwrite(block.start, pending_start, "   { ");
                process_fragment_inplace(pending, source, options, str, counter, depth);
                // `try { ` wrapper when a catch/error is present (see above).
                let try_prefix = if has_catch { "try { " } else { "" };
                if !value_text.is_empty() {
                    str.overwrite(
                        prev_end,
                        then_start,
                        &format!(
                            "{}const $$_value = await ({});{{ const {} = $$_value; ",
                            try_prefix, expr_text, value_text
                        ),
                    );
                } else {
                    str.overwrite(
                        prev_end,
                        then_start,
                        &format!("{}const $$_value = await ({});{{ ", try_prefix, expr_text),
                    );
                }
            }

            process_fragment_inplace(then, source, options, str, counter, depth);

            // Handle catch after then
            if let Some(ref catch) = block.catch {
                let catch_start = if !catch.nodes.is_empty() {
                    catch.nodes[0].start()
                } else {
                    block.end
                };

                let then_end = if !then.nodes.is_empty() {
                    then.nodes.last().unwrap().end()
                } else {
                    then_start
                };

                // Close the `try` (always) plus the value block (only when a
                // `{:then value}` binding opened one), then open the catch.
                let close_before_catch = if value_text.is_empty() { "}" } else { "}}" };
                if !error_text.is_empty() {
                    str.overwrite(
                        then_end,
                        catch_start,
                        &format!(
                            "{} catch($$_e) {{ const {} = __sveltets_2_any();",
                            close_before_catch, error_text
                        ),
                    );
                } else {
                    str.overwrite(
                        then_end,
                        catch_start,
                        &format!("{} catch($$_e) {{ ", close_before_catch),
                    );
                }

                process_fragment_inplace(catch, source, options, str, counter, depth);

                let catch_end = if !catch.nodes.is_empty() {
                    catch.nodes.last().unwrap().end()
                } else {
                    catch_start
                };

                if catch_end < block.end {
                    str.overwrite(catch_end, block.end, "}}");
                }
            } else {
                // No catch: close the value block (if any) + the outer await
                // block. A bare `{:then}` opened only the outer block.
                let then_end = if !then.nodes.is_empty() {
                    then.nodes.last().unwrap().end()
                } else {
                    then_start
                };
                if then_end < block.end {
                    let close = if value_text.is_empty() { "}" } else { "}}" };
                    str.overwrite(then_end, block.end, close);
                }
            }
        } else {
            // No `:then` after the pending block. Covers
            // `{#await p}pending{/await}` (pending only) and
            // `{#await p}pending{:catch e}…{/await}` (pending + catch, no then).
            // Previously this branch emitted only a trailing `}` — it never
            // opened the block, dropped the `await(promise)` entirely, and
            // ignored the catch, producing brace-unbalanced / invalid TSX.
            // Mirror upstream `handleAwait`: `{ <pending> [try {] await(p);
            // [} catch($$_e) { … }] }`.
            let pending_end = if !pending.nodes.is_empty() {
                pending.nodes.last().unwrap().end()
            } else {
                pending_start
            };

            // Opening `{ ` — consume the `{#await PROMISE}` opener (PROMISE is
            // re-emitted as `await(...)` after the pending body).
            str.overwrite(block.start, pending_start, "   { ");
            process_fragment_inplace(pending, source, options, str, counter, depth);

            if let Some(ref catch) = block.catch {
                let catch_start = if !catch.nodes.is_empty() {
                    catch.nodes[0].start()
                } else {
                    block.end
                };
                let header = if !error_text.is_empty() {
                    format!(
                        "try {{ await ({});}} catch($$_e) {{ const {} = __sveltets_2_any();",
                        expr_text, error_text
                    )
                } else {
                    format!("try {{ await ({});}} catch($$_e) {{ ", expr_text)
                };
                if pending_end < catch_start {
                    str.overwrite(pending_end, catch_start, &header);
                } else {
                    str.append_left(pending_end, &header);
                }
                process_fragment_inplace(catch, source, options, str, counter, depth);
                let catch_end = if !catch.nodes.is_empty() {
                    catch.nodes.last().unwrap().end()
                } else {
                    catch_start
                };
                if catch_end < block.end {
                    str.overwrite(catch_end, block.end, "}}");
                }
            } else if pending_end < block.end {
                str.overwrite(pending_end, block.end, &format!("await ({});}}", expr_text));
            }
        }
    } else if has_then {
        // Pattern: {#await promise then value} then {/await} (no pending)
        // Or:      {#await promise then value} then {:catch error} catch {/await}
        let then = block.then.as_ref().unwrap();
        let then_start = if !then.nodes.is_empty() {
            then.nodes[0].start()
        } else {
            block.end
        };

        // In source order, `{#await PROMISE then VALUE}` is followed
        // directly by the then-body. The generated wrapper also places
        // the expression before VALUE (and VALUE before the body), so
        // we can preserve PROMISE's chunk in place by splitting the
        // header overwrite into a prefix / suffix pair around the
        // expression range.
        // `const $$_value = ` and the `{ const VALUE = $$_value; … }` scope are
        // emitted only for a `{:then value}` binding (mirrors official
        // `handleAwait`, which gates both on `awaitBlock.value`). A bare
        // `{#await … then}` is just `await (…);` with the body inline (the body
        // elements provide their own block). `value_close` is the matching `}`
        // for the value scope, emitted by the close logic below.
        let value_close = if value_text.is_empty() { "" } else { "}" };
        let (header_prefix, header_suffix) = if has_catch {
            (
                if value_text.is_empty() {
                    "   { try { await ("
                } else {
                    "   { try { const $$_value = await ("
                },
                if !value_text.is_empty() {
                    format!(");{{ const {} = $$_value; ", value_text)
                } else {
                    ");".to_string()
                },
            )
        } else {
            (
                if value_text.is_empty() {
                    "   { await ("
                } else {
                    "   { const $$_value = await ("
                },
                if !value_text.is_empty() {
                    format!(");{{ const {} = $$_value; ", value_text)
                } else {
                    ");".to_string()
                },
            )
        };

        if let Some((expr_start, expr_end)) = get_expression_range(&block.expression) {
            str.overwrite(block.start, expr_start, header_prefix);
            if expr_end < then_start {
                str.overwrite(expr_end, then_start, &header_suffix);
            } else {
                str.append_left(expr_end, &header_suffix);
            }
        } else {
            str.overwrite(
                block.start,
                then_start,
                &format!("{}{}{}", header_prefix, expr_text, header_suffix),
            );
        }

        process_fragment_inplace(then, source, options, str, counter, depth);

        let then_end = if !then.nodes.is_empty() {
            then.nodes.last().unwrap().end()
        } else {
            then_start
        };

        if has_catch {
            // Handle catch after then
            let catch = block.catch.as_ref().unwrap();
            let catch_start = if !catch.nodes.is_empty() {
                catch.nodes[0].start()
            } else {
                block.end
            };

            if !error_text.is_empty() {
                str.overwrite(
                    then_end,
                    catch_start,
                    &format!(
                        "{}}} catch($$_e) {{ const {} = __sveltets_2_any();",
                        value_close, error_text
                    ),
                );
            } else {
                // Close the value block (only when there's a `{:then value}`
                // binding) + `try`, then open the catch. Always emit `($$_e)`.
                str.overwrite(
                    then_end,
                    catch_start,
                    &format!("{}}} catch($$_e) {{ ", value_close),
                );
            }

            process_fragment_inplace(catch, source, options, str, counter, depth);

            let catch_end = if !catch.nodes.is_empty() {
                catch.nodes.last().unwrap().end()
            } else {
                catch_start
            };

            if catch_end < block.end {
                str.overwrite(catch_end, block.end, "}}");
            }
        } else {
            // Close the value block (if any) + the outer await block. This
            // handles both the normal case (then_end < block.end: the then
            // body ends before {/await}, so we overwrite the gap) and the
            // empty-then-body case (then_end == block.end: the overwrite from
            // expr_end to block.end already consumed that region, so we must
            // append rather than overwrite a zero-length range).
            let close = format!("{}}}", value_close);
            if then_end < block.end {
                str.overwrite(then_end, block.end, &close);
            } else {
                str.append_left(block.end, &close);
            }
        }
    } else if has_catch {
        // Pattern: {#await promise catch error} catch {/await} (no pending, no then)
        let catch = block.catch.as_ref().unwrap();
        let catch_start = if !catch.nodes.is_empty() {
            catch.nodes[0].start()
        } else {
            block.end
        };

        let (header_prefix, header_suffix) = (
            "   { try { await (",
            if !error_text.is_empty() {
                format!(
                    ");}} catch($$_e) {{ const {} = __sveltets_2_any();",
                    error_text
                )
            } else {
                ");} catch($$_e) { ".to_string()
            },
        );
        if let Some((expr_start, expr_end)) = get_expression_range(&block.expression) {
            str.overwrite(block.start, expr_start, header_prefix);
            if expr_end < catch_start {
                str.overwrite(expr_end, catch_start, &header_suffix);
            } else {
                str.append_left(expr_end, &header_suffix);
            }
        } else if !error_text.is_empty() {
            str.overwrite(
                block.start,
                catch_start,
                &format!(
                    "   {{ try {{ await ({});}} catch($$_e) {{ const {} = __sveltets_2_any();",
                    expr_text, error_text
                ),
            );
        } else {
            str.overwrite(
                block.start,
                catch_start,
                &format!("   {{ try {{ await ({});}} catch($$_e) {{ ", expr_text),
            );
        }

        process_fragment_inplace(catch, source, options, str, counter, depth);

        let catch_end = if !catch.nodes.is_empty() {
            catch.nodes.last().unwrap().end()
        } else {
            catch_start
        };

        if catch_end < block.end {
            str.overwrite(catch_end, block.end, "}}");
        }
    } else {
        // Bare await block `{#await promise}{/await}` (no pending/then/catch).
        // Official `handleAwait` emits `{ await (EXPR);}` — the promise is
        // always awaited, so the `await` keyword must be present (it was
        // previously dropped, emitting `{EXPR;}`).
        if let Some((expr_start, expr_end)) = get_expression_range(&block.expression) {
            str.overwrite(block.start, expr_start, "{ await (");
            if expr_end < block.end {
                str.overwrite(expr_end, block.end, ");}");
            } else {
                str.append_left(expr_end, ");}");
            }
        } else {
            str.overwrite(
                block.start,
                block.end,
                &format!("{{ await ({});}}", expr_text),
            );
        }
    }
}

/// Handle a key block: `{#key expression}...{/key}`.
fn handle_key_block(
    block: &KeyBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if block.start >= block.end {
        return;
    }

    let expr_text = get_expression_text(&block.expression, source);

    // For an empty `{#key EXPR}{/key}` body, the block scope opens right after
    // the `}` that closes the `{#key EXPR}` tag — NOT at `block.end` (after
    // `{/key}`), which would make the header rewrite swallow `{/key}` and leave
    // the `{` unbalanced.
    let content_start = if !block.fragment.nodes.is_empty() {
        block.fragment.nodes[0].start()
    } else {
        let expr_end = get_expression_range(&block.expression)
            .map(|(_, e)| e)
            .unwrap_or(block.start);
        let bytes = source.as_bytes();
        let mut p = expr_end as usize;
        while p < bytes.len() && bytes[p] != b'}' {
            p += 1;
        }
        ((p + 1).min(bytes.len())) as u32
    };

    // Preserve the expression chunk in place so its per-character mapping
    // survives. Official emits the key expression as a bare statement followed
    // by a block scope for the body — `{#key value}…{/key}` → `value; { … }`
    // (NOT `{ value; … }`). So drop the `{#key ` prefix and turn the closing
    // `}` of the opening tag into `; {`. Mirrors KeyBlock handling in upstream
    // htmlxtojsx_v2.
    if let Some((expr_start, expr_end)) = get_expression_range(&block.expression) {
        str.overwrite(block.start, expr_start, "");
        if expr_end < content_start {
            str.overwrite(expr_end, content_start, "; {");
        } else {
            str.append_left(expr_end, "; {");
        }
    } else {
        str.overwrite(block.start, content_start, &format!("{expr_text}; {{"));
    }

    // Process children
    process_fragment_inplace(&block.fragment, source, options, str, counter, depth);

    let content_end = if !block.fragment.nodes.is_empty() {
        block.fragment.nodes.last().unwrap().end()
    } else {
        content_start
    };

    if content_end < block.end {
        str.overwrite(content_end, block.end, "}");
    }
}

/// Handle a snippet block: `{#snippet name(params)}...{/snippet}`.
///
/// Generates:
/// ```text
/// const name = (params): ReturnType<import('svelte').Snippet> => { async () => {
///   ...
/// };return __sveltets_2_any(0)};
/// ```
fn handle_snippet_block(
    block: &SnippetBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    handle_snippet_block_inner(block, source, options, str, counter, false, depth);
}

/// Transform a `{#snippet name(params)}` block that is a direct child of a
/// component into an **implicit prop**: `name:(params) => { async () => { …body…
/// };return __sveltets_2_any(0)},`. Unlike the standalone form there is no
/// leading `const`, no `: ReturnType<…>` annotation, and the closing ends in a
/// `,` so the result drops straight into the component's `props: { … }` object
/// literal (the caller relocates the range there via `move_range`). This mirrors
/// upstream svelte2tsx `addImplicitSnippetProp`, and lets TypeScript
/// contextually type the snippet's parameters from the prop's `Snippet<[T]>`
/// type while satisfying required snippet props (#780).
fn handle_snippet_block_as_component_prop(
    block: &SnippetBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    handle_snippet_block_inner(block, source, options, str, counter, true, depth);
}

fn handle_snippet_block_inner(
    block: &SnippetBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    as_component_prop: bool,
    // Snippet bodies always start at depth 0 (official resets `element` on
    // entry), so the inherited depth is intentionally unused.
    _depth: u32,
) {
    if block.start >= block.end {
        return;
    }

    let name_text = get_expression_text(&block.expression, source);

    // Build parameters string
    let params_text = if !block.parameters.is_empty() {
        block
            .parameters
            .iter()
            .map(|p| get_expression_text(p, source))
            .collect::<Vec<_>>()
            .join(", ")
    } else {
        String::new()
    };

    let has_body_nodes = !block.body.nodes.is_empty();
    let body_start = if has_body_nodes {
        block.body.nodes[0].start()
    } else {
        block.end
    };

    // Overwrite `{#snippet name(params)}` with function declaration.
    // Position markers are added to help the language server:
    // - `/*Ωignore_positionΩ*/` after the name and after `async ()`
    // - Return type wrapped in `/*Ωignore_startΩ*/.../*Ωignore_endΩ*/`
    //
    // Two emission modes match the JS reference (`SnippetBlock.ts`):
    // - TS syntax (TS file or non-JSDoc emit): `: ReturnType<...>` after the
    //   parameter list, with `<typeParams>` if the snippet declared generics
    // - JSDoc syntax (JS file + JSDoc emit): `/** @returns {ReturnType<...>} */`
    //   before the `(params)` arrow, no generic-params syntax
    let use_ts_syntax = options.is_ts_file || !options.emit_jsdoc;
    let type_params_str = match (use_ts_syntax, block.type_params.as_ref()) {
        (true, Some(tp)) => format!("<{}>", tp),
        _ => String::new(),
    };
    // Implicit-prop form (`name:(params) => …`) vs standalone declaration
    // (`const name = (params): ReturnType<…> => …`). The implicit form omits the
    // leading `const`, the return-type annotation, and the generic `<typeParams>`
    // — mirroring upstream's `addImplicitSnippetProp` transforms — and closes
    // with a trailing `,` so it slots into the component `props` object literal.
    let header = if as_component_prop {
        format!(
            "{}:({}) => {{ async ()/*\u{03A9}ignore_position\u{03A9}*/ => {{",
            name_text, params_text
        )
    } else if use_ts_syntax {
        // Single leading space (the overwrite replaces `{#snippet ` whose leading
        // `{` becomes the space) — matches official; oxfmt normalises it for
        // valid output, but a top-level-await component is emitted raw.
        format!(
            " const {}/*\u{03A9}ignore_position\u{03A9}*/ = {}({})/*\u{03A9}ignore_start\u{03A9}*/: ReturnType<import('svelte').Snippet>/*\u{03A9}ignore_end\u{03A9}*/ => {{ async ()/*\u{03A9}ignore_position\u{03A9}*/ => {{",
            name_text, type_params_str, params_text
        )
    } else {
        // JSDoc emission uses one fewer leading space (the `/** @returns */`
        // marker takes the visual slot otherwise occupied by the TS `:` and
        // its surrounding `/*Ωignore*/` comments).
        format!(
            " const {}/*\u{03A9}ignore_position\u{03A9}*/ = /** @returns {{ReturnType<import('svelte').Snippet>}} */ ({}) => {{ async ()/*\u{03A9}ignore_position\u{03A9}*/ => {{",
            name_text, params_text
        )
    };
    let closing = if as_component_prop {
        "};return __sveltets_2_any(0)},"
    } else {
        "};return __sveltets_2_any(0)};"
    };
    if has_body_nodes {
        str.overwrite(block.start, body_start, &header);
        // Process body at depth 0: official resets `element = undefined` when
        // entering a SnippetBlock, so element/component names inside a snippet
        // body always count depth from the snippet (e.g. `<Child>` directly in
        // a snippet is `$$_…C0C`), regardless of how deeply the snippet itself
        // is nested in elements / `<svelte:boundary>`.
        process_fragment_inplace(&block.body, source, options, str, counter, 0);

        let body_end = block.body.nodes.last().unwrap().end();
        if body_end < block.end {
            // Overwrite `{/snippet}` with closing
            str.overwrite(body_end, block.end, closing);
        }
    } else {
        // Empty body: collapse the whole `{#snippet name(params)}{/snippet}`
        // into a single declaration. Without this branch the closing
        // `};return __sveltets_2_any(0)};` was never emitted because both the
        // body-start overwrite and the would-be closing overwrite landed at
        // the same offset.
        let combined = format!("{}{}", header, closing);
        str.overwrite(block.start, block.end, &combined);
    }
}

// =============================================================================
// Element Nodes
// =============================================================================

/// Handle a regular HTML element.
///
/// Generates `{ svelteHTML.createElement("tagName", { ...attributes }); children }`.
///
/// The opening tag `<h1 class="foo">` is overwritten with
/// `{ svelteHTML.createElement("h1", {"class":\`foo\`,});`
/// and the closing tag `</h1>` is overwritten with ` }`.
fn handle_regular_element(
    el: &RegularElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    // A nested `<style>` element is removed entirely from the output,
    // mirroring official svelte2tsx's `handleStyleTag` (the `case 'Style'`
    // arm), which does `str.remove(node.start, node.end)` for every verbatim
    // style node at any nesting depth. (A top-level `<style>` becomes
    // `root.css` and never reaches this fragment walk, so any `style`
    // RegularElement here is necessarily nested.) Note: nested `<script>`
    // elements are NOT removed — official emits `createElement("script", {})`
    // for them (only the JS content is blanked, which `handle_text` already
    // does), so they fall through to the normal element path.
    if el.name == "style" {
        str.remove(el.start, el.end);
        return;
    }

    // Official svelte2tsx switches the opener on the *tag name*, not the AST node
    // type: any element named `slot` emits `__sveltets_createSlot(...)`. The parser
    // only produces a `SlotElement` for `<slot>` outside a `<template
    // shadowrootmode>`; inside one it is a `RegularElement` (mirroring upstream's
    // `parent_is_shadowroot_template` check), yet svelte2tsx still lowers it to a
    // slot. Route those through the same slot handler.
    if el.name == "slot" {
        let slot = SlotElement {
            start: el.start,
            end: el.end,
            name: el.name.clone(),
            name_loc: el.name_loc,
            attributes: el.attributes.clone(),
            fragment: el.fragment.clone(),
        };
        handle_slot_element(&slot, source, options, str, counter, depth);
        return;
    }

    // Named-slot routing: when processing a component's children (possibly deep
    // inside `{#each}`/`{#if}`/etc. control-flow blocks), an element targeting a
    // named slot is lowered to the `$$slot_def[...]` form referencing the
    // enclosing component instance. Take the context first so this element's OWN
    // children do NOT inherit it (a nested element owns its own slot scope);
    // restore it afterwards for the following siblings.
    let saved_slot = counter.slot_inst.take();
    if let Some(ref inst) = saved_slot
        && get_slot_attr_value(&el.attributes, source).is_some()
    {
        handle_named_slot_element(el, inst, source, options, str, counter, depth);
        counter.slot_inst = saved_slot;
        return;
    }

    // Find the end of the opening tag (after the `>`)
    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);

    // Build attribute segments. Source-bearing expressions become
    // `Seg::Src` so the resulting overwrite leaves them as unedited
    // MagicString chunks — which `generate_mappings` then maps
    // per-character back to the original `.svelte` columns. Element-
    // opener attribute expressions previously baked into a single
    // edited chunk and collapsed to a single source-map segment.
    // `saved_slot` (taken from `counter.slot_inst` above) is Some when this
    // element is a slot-context child of a component — then `let:` is a slot-let,
    // not a regular attribute.
    // The opener content (where attributes + comments live) starts right after
    // `<tagname`, so leading comments before the first attribute are recovered.
    let opener_content_start = el.start + 1 + el.name.len() as u32;
    let mut attr_segs = build_attribute_segments(
        &el.attributes,
        source,
        &el.name,
        saved_slot.is_some(),
        Some(opener_content_start),
    );

    // Official always emits exactly ONE inherent space after the `{` of the
    // attribute object, regardless of the source whitespace between the tag name
    // and the first attribute (verified: `<button onclick>`, `<button  onclick>`,
    // `<button\n\tonclick>` all → `{ "onclick":… }`). oxfmt normalises this away
    // for valid output, but a raw top-level-await component keeps it exact.
    let attrs_empty_before_pad = segs_is_empty(&attr_segs);
    if !el.attributes.is_empty() && !attrs_empty_before_pad {
        segs_trim_start(&mut attr_segs);
        let mut padded: Vec<Seg> = Vec::with_capacity(attr_segs.len() + 1);
        padded.push(Seg::Lit(" ".to_string()));
        padded.extend(attr_segs);
        attr_segs = padded;
    }

    // V4-style action / transition / animate directive emission. Action
    // becomes `const $$action_N = __sveltets_2_ensureAction(…);` BEFORE
    // the createElement; transition / animate become
    // `__sveltets_2_ensureTransition(…);` appended AFTER it. The
    // createElement's second argument also needs to wrap any actions
    // with `__sveltets_2_union(...)`. Mirrors
    // `htmlxtojsx_v2/nodes/{Action,Transition,Animation}.ts`.
    // Only the action PREFIX (`const $$action_N = …`) and the action count are
    // taken here; the transition/animate suffix is emitted in source order by
    // `build_element_directive_suffix_segments` below.
    let (directive_prefix, _directive_suffix, action_count) =
        build_directive_prefix_suffix(&el.attributes, source, &el.name);
    let actions_arg = if action_count > 0 {
        let mut args = String::from(", __sveltets_2_union(");
        for i in 0..action_count {
            if i > 0 {
                args.push(',');
            }
            let _ = write!(args, "$$action_{}", i);
        }
        args.push(')');
        args
    } else {
        String::new()
    };

    // `bind:` directives generate a suffix appended right after the
    // createElement call. Mirrors `htmlxtojsx_v2/nodes/Binding.ts::handleBinding`.
    // For `bind:this` and one-way bindings on the element (`offsetHeight`,
    // …) we also need a `const $$_xxx = …` declaration so the assignment
    // can reference the element value.
    let needs_element_var = any_bind_needs_element_var(&el.attributes, source);
    let element_var = if needs_element_var {
        // The `$$_<tag><N>` index is the element's nesting DEPTH (matching
        // upstream Element.ts `computeDepth()`), not a per-tag counter — same
        // rule as component instance names.
        let sanitized = sanitize_tag_for_var(&el.name);
        Some(format!("$$_{}{}", sanitized, depth))
    } else {
        None
    };
    // All post-`createElement` directive statements — `class:` / `style:`
    // (segmented), `transition:` / `in:` / `out:` / `animate:`, and `bind:` —
    // are built in a SINGLE source-order pass so they interleave exactly like
    // official's `appendToStartEnd` walk (e.g. a `style:` after a `bind:this`
    // stays after it instead of grouping with earlier `class:` directives).
    let suffix_segs = build_element_directive_suffix_segments(
        &el.attributes,
        source,
        element_var.as_deref(),
        &el.name,
        options.is_ts_file,
        &el.name,
    );

    // When all surviving props are empty but a `bind:` / `class:` / `style:`
    // directive was stripped, JS reference still leaves whitespace inside
    // `{ }`. Add a single space so `createElement("div", { })` matches.
    if segs_is_empty(&attr_segs) && !segs_is_empty(&suffix_segs) {
        attr_segs.push(Seg::Lit(" ".into()));
    }

    // Build the opener as a `Vec<Seg>` (header lit + attr segs + trailer
    // lit) and apply via `emit_segmented_overwrite`. Action declarations
    // (if any) are emitted *before* the inner `{ … createElement(…); … }`
    // block so they're in scope for `__sveltets_2_union(...)`. The inner
    // `{` opens a separate block scope.
    let element_var_decl = if let Some(ref var) = element_var {
        format!("const {} = ", var)
    } else {
        String::new()
    };
    let header_lit = if !directive_prefix.is_empty() {
        format!(
            " {{{}{{ {}svelteHTML.createElement(\"{}\"{}, {{",
            directive_prefix, element_var_decl, el.name, actions_arg,
        )
    } else {
        format!(
            " {{ {}svelteHTML.createElement(\"{}\"{}, {{",
            element_var_decl, el.name, actions_arg,
        )
    };
    // The trailer closes the props object + createElement call (`}});`), then
    // appends the `class:` / `style:` directive statements (segmented, so their
    // expression chunks keep their source mapping), then the transition/animate
    // (`directive_suffix`) and `bind:` (`bind_suffix`) suffixes.
    let mut opener_segs: Vec<Seg> = Vec::with_capacity(attr_segs.len() + suffix_segs.len() + 3);
    opener_segs.push(Seg::Lit(header_lit));
    opener_segs.extend(attr_segs);
    // Close the props object + createElement call: `});` (one `}` for the
    // props brace, then `)` + `;`). The outer block `{` is closed after the
    // children by the closing-tag overwrite.
    opener_segs.push(Seg::Lit("});".to_string()));
    // The post-`createElement` suffix statements are already assembled in
    // source-attribute order by `build_element_directive_suffix_segments`.
    opener_segs.extend(suffix_segs);
    let opener_segs = bake_out_of_order_src(opener_segs, source);
    emit_segmented_overwrite(str, el.start, opening_tag_end, &opener_segs);

    // Process children at depth+1: this element is now an ancestor.
    // Mirrors official computeDepth which counts all ancestor element/component nodes.
    // Hoist snippet blocks to the top of the element's children first, mirroring
    // hoistSnippetBlock in the JS reference (pendingSnippetHoistCheck walk).
    hoist_snippet_blocks(&el.fragment, source, str);
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

    // Find and overwrite the closing tag.
    // HTML void elements (`<input>`, `<br>`, …) and source-level self-closing
    // tags (`<x />`) have no `</tag>` in the source, so we must NOT call
    // `find_closing_tag_start` on them — it scans backwards for `</` and would
    // wrongly match a preceding sibling's closing tag, blanking it (and the
    // void element itself) on overwrite. Mirrors the JS reference's
    // `prependLeft(node.end, '}')` for void/self-closing tags.
    //
    // When `directive_prefix` opened an extra outer block for the action
    // declarations, emit a matching extra `}` to close it.
    let extra_close = if directive_prefix.is_empty() { "" } else { "}" };
    let is_self_closing_source = slice_src(source, el.start as usize, el.end as usize)
        .trim_end()
        .ends_with("/>");
    let is_void = crate::compiler::utils::is_void_element(&el.name);
    if is_void || is_self_closing_source {
        str.append_left(el.end, &format!("}}{}", extra_close));
    } else {
        let closing_tag_start = find_closing_tag_start(source, el.end);
        // An auto-closed element (`<p><p>`, `<li><li>`, …) has NO `</name>` at
        // `el.end`; `find_closing_tag_start` then wrongly matches the last
        // child's `</…>`. Only overwrite when the found tag actually closes
        // THIS element; otherwise append `}` at `el.end` like a void element
        // (matching official's `prependLeft(node.end, '}')` for such cases).
        if closing_tag_start < el.end
            && closing_tag_name_matches(source, closing_tag_start, &el.name)
        {
            // Non-self-closing: preserve space before closing brace
            str.overwrite(closing_tag_start, el.end, &format!(" }}{}", extra_close));
        } else {
            str.append_left(el.end, &format!("}}{}", extra_close));
        }
    }
    // Restore the slot context for following siblings (this element's own
    // children were processed with it cleared, via the `take()` above).
    counter.slot_inst = saved_slot;
}

/// Handle a Svelte component: `<Component ...>`.
///
/// Supports:
/// - `on:` directives → instance variable + `.$on()` calls
/// - `let:` directives → instance variable + `$$slot_def` destructuring
/// - Svelte 5 `children` prop when component has children
/// - Named slots via `slot="name"` on children
/// - Component name in closing tag for non-self-closing components
fn handle_component(
    comp: &Component,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if comp.start >= comp.end {
        return;
    }

    // This component's children get their own slot scope (official sets `parent`
    // to the nearest enclosing component): clear any inherited slot context so a
    // `slot="…"` inside this component's body routes to THIS component (set up
    // again by `process_component_children_with_slots` below), not an outer one.
    // Restored at the end for following siblings.
    let saved_outer_slot = counter.slot_inst.take();

    // Nested named-slot routing: a static `slot="x"` component reached through a
    // parent component's default-slot body (e.g. inside `{#if}` / `{#each}`) is
    // wrapped in the parent's `$$slot_def["x"]` block — same as the direct-child
    // path, mirroring how `handle_regular_element` routes nested slotted elements.
    // The `named_slot_component_close` guard avoids re-entering when we are
    // already the routed inner `handle_component` call.
    if !counter.named_slot_component_close
        && let Some(ref inst) = saved_outer_slot
        && get_slot_attr_value(&comp.attributes, source).is_some()
    {
        let inst = inst.clone();
        handle_named_slot_component(comp, &inst, source, options, str, counter, depth);
        counter.slot_inst = saved_outer_slot;
        return;
    }

    // When processed as a named-slot child, suppress the component-name
    // reference at the close (the caller emits it outside this component's block).
    let named_slot_close = std::mem::take(&mut counter.named_slot_component_close);

    // Use depth (ancestor element/component count) as the variable index, matching
    // the official `computeDepth()` in `htmlxtojsx_v2/nodes/InlineComponent.ts`.
    // Two sibling `<A/>` at the same depth both get `$$_A<depth>C`, which is correct —
    // the official tool reuses the same name for components at the same depth.
    let ctor_var = reversed_component_name(&comp.name, depth);

    // Find the end of the opening tag
    let opening_tag_end = find_opening_tag_end(source, comp.start, comp.end);

    // Collect on: directives and let: directives
    let on_directives = get_on_directives(&comp.attributes);
    let has_events = !on_directives.is_empty();
    // When this component is itself a named-slot child, its `let:` directives are
    // consumed by the parent's `$$slot_def["x"]` destructure, so don't re-emit
    // them here as the component's own default-slot let block.
    let suppress_lets = std::mem::take(&mut counter.suppress_component_lets);
    let let_directives = if suppress_lets {
        Vec::new()
    } else {
        get_let_directives(&comp.attributes)
    };
    let has_lets = !let_directives.is_empty();

    // Check if component has meaningful children
    let has_children = has_component_slot_children(&comp.fragment, source);

    // Check if any children have named slots with let: directives
    let children_have_named_slots = has_named_slot_children(&comp.fragment, source);

    // A default-slot child carrying `let:` directives (e.g.
    // `<svelte:fragment let:a={x}>…`) destructures from
    // `inst.$$slot_def.default`, which references the component instance — so
    // it likewise needs the `const $$_inst = new …` form. Mirrors official's
    // `Element.addSlotLet` → `performTransformation` referencing
    // `this.parent.name`.
    let children_have_default_slot_lets = has_default_slot_let_children(&comp.fragment, source);

    // Named `{#snippet}` blocks that are direct children of a component are
    // passed as *implicit props* (`props: { name: (params) => … }`), not as
    // standalone `const name = …` declarations, so that TypeScript both
    // satisfies required snippet props and contextually types the snippet's
    // parameters from the prop's `Snippet<[T]>` type (#780). This relocation is
    // only wired through the simple-children path; when the component also uses
    // `let:` / named slots the children go through `process_component_children_with_slots`,
    // which owns its own block scoping, so the snippets stay standalone there.
    let use_snippet_props =
        !(has_lets || children_have_named_slots || children_have_default_slot_lets)
            && comp
                .fragment
                .nodes
                .iter()
                .any(|n| matches!(n, TemplateNode::SnippetBlock(_)));

    // An instance variable is needed when:
    // - there are on: directives
    // - there are let: directives on the component
    // - there are children with slot="name" that have let: directives
    // - a named `{#snippet}` child is passed as an implicit prop: official
    //   svelte2tsx assigns the component instance to a const and then
    //   destructures the snippet from `inst.$$prop_def` to anchor the snippet's
    //   parameter types. Without that anchor a snippet on a component whose type
    //   comes from a value (e.g. Storybook's `const { Story } = defineMeta(…)`)
    //   does not pick up its contextual `Snippet<[Args]>` type and the snippet
    //   parameter falls back to implicit `any` (#796).
    // `bind:this` / `bind:foo` on a component reference the instance variable
    // (`expr = $$_inst;` / `$$_inst.$$bindings = 'foo';`), so the instance const
    // must be emitted — mirrors upstream `addNameConstDeclaration` for bound
    // components. Without this a `bind:this`-only component dropped both the
    // `const $$_inst = new …` and the binding assignment.
    let has_bindings = comp
        .attributes
        .iter()
        .any(|a| matches!(a, Attribute::BindDirective(_)));
    let needs_instance = has_events
        || has_lets
        || children_have_named_slots
        || children_have_default_slot_lets
        || use_snippet_props
        || has_bindings;

    // Check if Svelte 5 children prop is needed
    let is_svelte5 = matches!(options.version, SvelteVersion::V5);

    // Build attribute/props segments (excluding on: and let: directives).
    // When this component is named-slot-routed (`named_slot_close`), its static
    // `slot="…"` attribute is consumed by the `$$slot_def[…]` wrapper, so drop it
    // from the props object; otherwise (root, or dynamic `slot={…}`) keep it.
    let mut attr_segs = build_component_props_segments(&comp.attributes, source, named_slot_close);

    // Add extra whitespace to match JS svelte2tsx position-preserving behavior
    let attrs_empty_before_pad = segs_is_empty(&attr_segs);
    if !comp.attributes.is_empty() && !attrs_empty_before_pad {
        let extra_spaces = count_tag_to_attr_spaces(&comp.name, comp.start, source);
        if extra_spaces >= 1 {
            let total_spaces = extra_spaces + 1;
            segs_trim_start(&mut attr_segs);
            let mut padded: Vec<Seg> = Vec::with_capacity(attr_segs.len() + 1);
            padded.push(Seg::Lit(" ".repeat(total_spaces)));
            padded.extend(attr_segs);
            attr_segs = padded;
        }
    }

    // Add children prop for Svelte 5 if component has children. Inserted
    // at the beginning of the props object, AFTER any leading whitespace
    // from the attribute spacing (when applicable).
    if is_svelte5 && has_children {
        let children_text = "children:() => { return __sveltets_2_any(0); },";
        if segs_is_empty(&attr_segs) {
            attr_segs = vec![Seg::Lit(children_text.to_string())];
        } else if has_lets || children_have_named_slots {
            // Slot let-forwarding owns the leading whitespace already.
            segs_trim_start(&mut attr_segs);
            let mut prefixed: Vec<Seg> = Vec::with_capacity(attr_segs.len() + 1);
            prefixed.push(Seg::Lit(children_text.to_string()));
            prefixed.extend(attr_segs);
            attr_segs = prefixed;
        } else {
            // Has other attrs: insert children between the leading whitespace
            // `Lit` and the first attribute.
            let mut leading_ws = String::new();
            if let Some(Seg::Lit(first)) = attr_segs.first_mut() {
                let trimmed = first.trim_start_matches(|c: char| c.is_whitespace());
                leading_ws.push_str(&first[..first.len() - trimmed.len()]);
                *first = trimmed.to_string();
                if first.is_empty() {
                    attr_segs.remove(0);
                }
            }
            let mut prefixed: Vec<Seg> = Vec::with_capacity(attr_segs.len() + 2);
            prefixed.push(Seg::Lit(format!("{}{}", leading_ws, children_text)));
            prefixed.extend(attr_segs);
            attr_segs = prefixed;
        }
    }

    // Build the replacement for the opening tag.
    let inst_var = reversed_component_instance_name(&comp.name, depth);
    // Component-side `bind:` suffix: type-widener + `$$bindings` marker.
    // Mirrors the JS reference's component branch in
    // `htmlxtojsx_v2/nodes/Binding.ts::handleBinding`:
    //   `() => expr = __sveltets_2_any(null); inst.$$bindings = 'name';`
    // is appended (as ignore-wrapped statements) for every non-`bind:this`
    // binding on a component.
    let component_bind_suffix = {
        let mut out = String::new();
        for attr in &comp.attributes {
            if let Attribute::BindDirective(bind) = attr {
                if bind.name == "this" {
                    // `bind:this={getFn, setFn}` (Svelte 5 function binding) calls
                    // the setter with the instance: `(setFn)(inst);` (mirrors
                    // Binding.ts). Plain `bind:this={x}` → `x = inst;`.
                    if let Some((_, (ss, se))) = get_set_binding_ranges(&bind.expression, source) {
                        let _ = write!(
                            out,
                            "({})({});",
                            slice_src(source, ss as usize, se as usize),
                            inst_var
                        );
                    } else {
                        // The assignment LHS strips a trailing TS assertion
                        // (`getEnd`); a `bind:this={consolePane as Pane}` postfix
                        // moves onto the RHS instance var:
                        // `consolePane = $$_inst as Pane;` — same as the element
                        // `bind:this` path (mirrors Binding.ts appending
                        // `[getEnd, expression.end]` after the assignment).
                        let expr_text = get_binding_lhs_text(&bind.expression, source);
                        let postfix = get_expression_range(&bind.expression)
                            .map(|(_, e)| {
                                let ge = get_expression_end_stripping_ts(&bind.expression, source)
                                    .unwrap_or(e);
                                let ee = extend_expr_end_with_ts_postfix(source, e, bind.end);
                                slice_src(source, ge as usize, ee as usize)
                            })
                            .unwrap_or("");
                        let _ = write!(out, "{} = {}{};", expr_text, inst_var, postfix);
                    }
                    continue;
                }
                if get_set_binding_ranges(&bind.expression, source).is_some() {
                    // Function binding `bind:foo={getFn, setFn}`: the get/set
                    // pair is already type-checked via
                    // `__sveltets_2_get_set_binding(...)` in the props literal,
                    // so the `() => expr = __sveltets_2_any(null)` type-widener
                    // is skipped (mirrors the `if (!isGetSetBinding)` guard in
                    // upstream `handleBinding`). Only the `$$bindings` marker
                    // is emitted.
                    let _ = write!(out, "{}.$$bindings = '{}';", inst_var, bind.name);
                    continue;
                }
                // Setter type-widener: LHS strips a trailing TS assertion.
                let expr_text = get_binding_lhs_text(&bind.expression, source);
                let _ = write!(
                    out,
                    "/*\u{03A9}ignore_start\u{03A9}*/() => {} = __sveltets_2_any(null);/*\u{03A9}ignore_end\u{03A9}*/{}.$$bindings = '{}';",
                    expr_text, inst_var, bind.name
                );
            }
        }
        out
    };
    let (header_lit, trailer_lit) = if needs_instance {
        let on_calls = if has_events {
            build_on_calls(&inst_var, &on_directives, source)
        } else {
            String::new()
        };
        (
            format!(
                " {{ const {} = __sveltets_2_ensureComponent({}); const {} = new {}({{ target: __sveltets_2_any(), props: {{",
                ctor_var, comp.name, inst_var, ctor_var,
            ),
            format!("}}}});{}{}", component_bind_suffix, on_calls),
        )
    } else {
        (
            format!(
                " {{ const {} = __sveltets_2_ensureComponent({}); new {}({{ target: __sveltets_2_any(), props: {{",
                ctor_var, comp.name, ctor_var,
            ),
            "}});".to_string(),
        )
    };
    let mut opener_segs: Vec<Seg> = Vec::with_capacity(attr_segs.len() + 2);
    opener_segs.push(Seg::Lit(header_lit));
    opener_segs.extend(attr_segs);
    if !use_snippet_props {
        // The snippet-prop path leaves the `props: { … ` object literal open so
        // the relocated `{#snippet}` props can be appended inside it; the trailer
        // (which closes the object) is emitted after the moves (see below).
        opener_segs.push(Seg::Lit(trailer_lit.clone()));
        // `style:`/`class:` directives on a component aren't props — official
        // still type-checks their values via lowered statements appended after
        // the `new …({...})` call (e.g. `__sveltets_2_ensureType(String, Number, …)`).
        opener_segs.extend(build_class_style_directive_suffix_segments(
            &comp.attributes,
            source,
        ));
        // transition:/in:/out:/animate: on a component lower to
        // `__sveltets_2_ensure{Transition,Animation}(name(undefined.mapElementTag("undefined")…))`.
        opener_segs.extend(build_component_directive_suffix(&comp.attributes, source));
    }
    let opener_segs = bake_out_of_order_src(opener_segs, source);
    emit_segmented_overwrite(str, comp.start, opening_tag_end, &opener_segs);

    // Handle closing tag
    let closing_tag_start = find_closing_tag_start(source, comp.end);
    let is_self_closing = closing_tag_start >= comp.end;

    // Handle children with slot awareness
    if has_lets || children_have_named_slots || children_have_default_slot_lets {
        // Process children with slot scoping
        process_component_children_with_slots(
            comp,
            &inst_var,
            &let_directives,
            source,
            options,
            str,
            counter,
            depth + 1,
        );
    } else if use_snippet_props {
        // Process children, turning each direct `{#snippet}` child into an
        // implicit prop relocated into the still-open `props: { … }` object.
        //
        // `move_range(s.start, s.end, anchor)` detaches the transformed snippet
        // chunk and re-links it immediately before the chunk that *starts* at
        // `anchor`. Moving snippets in source order to a fixed `anchor` preserves
        // their order (each new one lands right before the anchor chunk, i.e.
        // after the previously moved one). A leading run of snippets that sit
        // natively at the anchor (no intervening whitespace) is already in the
        // right place — moving them would be a no-op self-move (which the API
        // forbids) — so we just advance the anchor past them. The trailer that
        // closes the props object is appended after the final snippet.
        let mut anchor = opening_tag_end;
        let mut last_snippet_end: Option<u32> = None;
        let mut snippet_names: Vec<String> = Vec::new();
        for node in &comp.fragment.nodes {
            if let TemplateNode::SnippetBlock(s) = node {
                if s.start >= s.end {
                    continue;
                }
                snippet_names.push(get_expression_text(&s.expression, source).to_string());
                // This snippet is a child of the component, so its body is at depth+1
                // (the component is now an ancestor), consistent with the simple-children path.
                handle_snippet_block_as_component_prop(s, source, options, str, counter, depth + 1);
                if s.start == anchor {
                    anchor = s.end;
                } else {
                    str.move_range(s.start, s.end, anchor);
                }
                last_snippet_end = Some(s.end);
            } else {
                // Children of a component are at depth+1 (this component is the ancestor)
                process_node_inplace(node, source, options, str, counter, depth + 1);
            }
        }
        // After closing the `new Component({ props: { … } })` statement,
        // destructure each relocated snippet from the instance's `$$prop_def`
        // (wrapped in ignore-markers so it never surfaces as a diagnostic). This
        // mirrors official svelte2tsx and anchors the snippet props' types — in
        // particular the snippet's `Snippet<[Args]>` parameter type — so the
        // snippet's parameters are inferred even when the component's type comes
        // from a value rather than an imported `.svelte` module (#796).
        let prop_def_suffix = if snippet_names.is_empty() {
            String::new()
        } else {
            format!(
                "/*\u{03A9}ignore_start\u{03A9}*/const {{{}}} = {}.$$prop_def;/*\u{03A9}ignore_end\u{03A9}*/",
                snippet_names.join(", "),
                inst_var
            )
        };
        let closing = format!("{trailer_lit}{prop_def_suffix}");
        // Close the props object right after the last relocated snippet.
        match last_snippet_end {
            Some(end) => {
                str.append_left(end, &closing);
            }
            None => {
                // No usable snippet after all (e.g. only empty-named blocks);
                // close the props object at the opening-tag boundary.
                str.prepend_right(opening_tag_end, &closing);
            }
        }
    } else {
        // Simple children processing: this component is now an ancestor → depth+1.
        process_fragment_inplace(&comp.fragment, source, options, str, counter, depth + 1);
    }

    // For components with `let:` but NO children (in either bracketed
    // or self-closing form) emit the let-forwarding block as an inline
    // open+close. Mirrors `defaultSlotLetTransformation` for the
    // self-closing branch in the JS reference's `InlineComponent`.
    let has_children_for_block = comp
        .fragment
        .nodes
        .iter()
        .any(|n| !matches!(n, TemplateNode::Text(t) if t.start >= t.end));
    let needs_inline_block = has_lets && !has_children_for_block;
    let inline_block = if needs_inline_block {
        format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;}}",
            build_let_destructure_string(&let_directives, source),
            inst_var
        )
    } else {
        String::new()
    };

    if !is_self_closing {
        if needs_inline_block {
            // No children but bracketed (e.g. `<C let:x></C>`) — append
            // the slot-def block before the closing tag so the `let`
            // bindings have a scope.
            str.append_left(closing_tag_start, &inline_block);
        }
        if named_slot_close {
            // Close just this component's block; the named-slot caller emits
            // the component-name reference + the named-slot-block close after.
            str.overwrite(closing_tag_start, comp.end, " }");
        } else {
            str.overwrite(closing_tag_start, comp.end, &format!(" {}}}", comp.name));
        }
    } else if needs_inline_block {
        str.append_left(comp.end, &format!("{}{}}}", inline_block, comp.name));
    } else {
        str.append_left(comp.end, "}");
    }
    // Restore the slot context for following siblings.
    counter.slot_inst = saved_outer_slot;
}

/// True if `attributes` contains a `slot` attribute whose value is anything
/// other than the static string `"default"` — i.e. a *non-default* slot target.
///
/// Mirrors official `handleImplicitChildren`'s skip condition:
/// `a.name === 'slot' && a.value[0]?.data !== 'default'`. A dynamic
/// `slot={foo}` (no static `.data`) counts as non-default, as does any static
/// `slot="name"` except `slot="default"`.
fn has_non_default_slot_attr(attributes: &[Attribute], _source: &str) -> bool {
    for attr in attributes {
        if let Attribute::Attribute(node) = attr
            && node.name == "slot"
        {
            // Read the static text data of the first value part, if any.
            let value0_data: Option<String> = match &node.value {
                AttributeValue::Sequence(parts) => match parts.first() {
                    Some(AttributeValuePart::Text(text)) => Some(text.raw.to_string()),
                    _ => None,
                },
                _ => None,
            };
            return value0_data.as_deref() != Some("default");
        }
    }
    false
}

/// Check if a component's fragment has meaningful children for slot purposes.
///
/// Returns true if the component has any non-text children, or text children
/// with non-whitespace content.
fn has_component_slot_children(fragment: &Fragment, source: &str) -> bool {
    for node in &fragment.nodes {
        match node {
            TemplateNode::Text(text) => {
                // Use the DECODED `text.data` (HTML entities resolved), not the
                // raw source: `&nbsp;` decodes to U+00A0 which IS whitespace, so
                // `<Component>&nbsp;</Component>` has no meaningful default-slot
                // content and must not get a synthetic `children` prop. Mirrors
                // upstream `handleImplicitChildren`'s `node.data` check.
                if text.data.chars().any(|c| !c.is_whitespace()) {
                    return true;
                }
            }
            // `{#snippet}` blocks are passed as implicit *props*, not as
            // default-slot content, so they must not trigger the synthetic
            // `children` prop (which would otherwise produce a false
            // `'children' does not exist in type '$$ComponentProps'`).
            // Comments are likewise ignorable. Mirrors upstream
            // `handleImplicitChildren`, which skips `SnippetBlock` / `Comment`
            // and only fakes a `children` prop for a real default-slot child.
            TemplateNode::SnippetBlock(_) | TemplateNode::Comment(_) => {}
            // A `<slot>` child never contributes default-slot content — official
            // `handleImplicitChildren` skips every `child.type === 'Slot'`
            // unconditionally (it forwards a slot, it isn't slotted content).
            TemplateNode::SlotElement(_) => {}
            // Non-default-slot children (`<el slot="name">`, `slot={dynamic}`,
            // `<svelte:fragment slot="name">`, etc.) populate their slot, NOT
            // the default `children` prop, so they must not trigger the
            // synthetic `children`. Only default-slot content (no `slot=`, or
            // `slot="default"`) counts. Mirrors upstream `handleImplicitChildren`
            // which skips any child whose `slot` value isn't `"default"`.
            TemplateNode::RegularElement(el)
                if has_non_default_slot_attr(&el.attributes, source) => {}
            TemplateNode::Component(c) if has_non_default_slot_attr(&c.attributes, source) => {}
            TemplateNode::SvelteFragment(f) if has_non_default_slot_attr(&f.attributes, source) => {
            }
            TemplateNode::SvelteElement(e) if has_non_default_slot_attr(&e.attributes, source) => {}
            TemplateNode::SvelteSelf(s) if has_non_default_slot_attr(&s.attributes, source) => {}
            TemplateNode::SvelteComponent(sc)
                if has_non_default_slot_attr(&sc.attributes, source) => {}
            _ => return true,
        }
    }
    false
}

/// Check if any *direct* child carries `let:` directives that destructure from
/// THIS component's `$$slot_def` — i.e. a default-slot let receiver that is an
/// *element* such as `<svelte:fragment let:a={x}>`, `<div let:foo>` or
/// `<svelte:element let:foo>`. Such an element child references the parent
/// component (`Element.addSlotLet` → `this.parent.name`), so the parent needs
/// the `const $$_inst = new …` form.
///
/// Component-kind children (`<Child let:foo>`, `<svelte:component let:foo>`,
/// `<svelte:self let:foo>`) are excluded: their `let:` belongs to their OWN
/// slot (`InlineComponent.addSlotLet` → `this.name`), so they do NOT force the
/// parent's instance const. `let:` directives are only meaningful on direct
/// children of a component, so this does not recurse.
fn has_default_slot_let_children(fragment: &Fragment, _source: &str) -> bool {
    fragment.nodes.iter().any(|node| {
        // Only NON-component default-slot children forward their `let:` bindings
        // to the enclosing component's `$$slot_def.default`. A component child
        // (`<Child let:x>` / `<svelte:component let:x>` / `<svelte:self let:x>`)
        // binds `let:x` from its OWN `$$slot_def.default` — its own
        // `handle_component` emits that destructure — so it must not mark the
        // parent as needing an instance var. Mirrors official svelte2tsx, where
        // only `Element`/`SlotElement`/`InlineComponent` *slot content* (not the
        // inline component's own lets) routes through the parent slot.
        let attrs = match node {
            TemplateNode::RegularElement(el) => &el.attributes,
            TemplateNode::SvelteFragment(f) => &f.attributes,
            TemplateNode::SvelteElement(e) => &e.attributes,
            _ => return false,
        };
        !get_let_directives(attrs).is_empty()
    })
}

/// Check if any children have `slot="name"` attributes (named slots).
fn has_named_slot_children(fragment: &Fragment, source: &str) -> bool {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(el)
                if get_slot_attr_value(&el.attributes, source).is_some() =>
            {
                return true;
            }
            TemplateNode::Component(comp)
                if get_slot_attr_value(&comp.attributes, source).is_some() =>
            {
                return true;
            }
            // `<svelte:fragment slot="name" let:foo>` is the Svelte 4 idiom
            // for distributing children into a named slot — it shows up here
            // as `SvelteFragment`. Treat it like the others.
            TemplateNode::SvelteFragment(el)
                if get_slot_attr_value(&el.attributes, source).is_some() =>
            {
                return true;
            }
            // `<slot slot="name">` forwards a `<slot>` into the parent
            // component's named slot.
            TemplateNode::SlotElement(el)
                if get_slot_attr_value(&el.attributes, source).is_some() =>
            {
                return true;
            }
            // `<svelte:element this={tag} slot="name">` targets a named slot.
            TemplateNode::SvelteElement(el)
                if get_slot_attr_value(&el.attributes, source).is_some() =>
            {
                return true;
            }
            // Control-flow blocks are transparent to slot distribution: a
            // `<div slot="foo">` nested inside `{#if}` / `{#each}` / `{#await}`
            // / `{#key}` still targets the component's named slot (official
            // svelte2tsx keeps `parent` pointing at the enclosing component
            // across blocks). Recurse into their fragments — but NOT into
            // nested elements/components (which own their own slot scope) or
            // `{#snippet}` bodies (snippet props, not slots).
            TemplateNode::IfBlock(block)
                if has_named_slot_children(&block.consequent, source)
                    || block
                        .alternate
                        .as_ref()
                        .is_some_and(|alt| has_named_slot_children(alt, source)) =>
            {
                return true;
            }
            TemplateNode::EachBlock(block)
                if has_named_slot_children(&block.body, source)
                    || block
                        .fallback
                        .as_ref()
                        .is_some_and(|fb| has_named_slot_children(fb, source)) =>
            {
                return true;
            }
            TemplateNode::AwaitBlock(block)
                if block
                    .pending
                    .as_ref()
                    .is_some_and(|p| has_named_slot_children(p, source))
                    || block
                        .then
                        .as_ref()
                        .is_some_and(|t| has_named_slot_children(t, source))
                    || block
                        .catch
                        .as_ref()
                        .is_some_and(|c| has_named_slot_children(c, source)) =>
            {
                return true;
            }
            TemplateNode::KeyBlock(block) if has_named_slot_children(&block.fragment, source) => {
                return true;
            }
            _ => {}
        }
    }
    false
}

/// Process component children with slot awareness.
///
/// This handles:
/// - Default slot wrapping with `let:` destructuring
/// - Named slot wrapping with `slot="name"` children
fn process_component_children_with_slots(
    comp: &Component,
    inst_var: &str,
    let_directives: &[&LetDirective],
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    let has_lets = !let_directives.is_empty();

    // Build the default slot destructuring if needed
    let let_destructure = build_let_destructure_string(let_directives, source);

    // Group children into default slot and named slots
    // For each child, determine if it belongs to a named slot or the default slot
    // Named slot children get their own $$slot_def blocks
    // Default slot children are wrapped in a single block with the component's let: destructuring

    // We need to track which children are named slots and process them specially.
    // The approach: iterate over children, and for each named-slot child, emit
    // a separate $$slot_def block. Non-named-slot children are part of the default slot.
    //
    // The default slot block is opened before the first default slot child and closed
    // after the last one (or before the first named slot child).

    let mut default_slot_opened = false;
    let mut prev_end: Option<u32> = None;

    // If there are let: directives, we need to open the default slot block
    // before any children (including text nodes).
    if has_lets {
        // We'll open the default slot block at the position of the first child
        // or immediately after the opening tag
        let block_open = format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
            let_destructure, inst_var
        );

        // Find where to insert the block open
        if let Some(first_node) = comp.fragment.nodes.first() {
            let first_start = first_node.start();
            // Insert the block opening before the first child
            str.append_left(first_start, &block_open);
        }
        default_slot_opened = true;
    }

    for (i, node) in comp.fragment.nodes.iter().enumerate() {
        let is_named_slot = match node {
            TemplateNode::RegularElement(el) => {
                get_slot_attr_value(&el.attributes, source).is_some()
            }
            TemplateNode::Component(child_comp) => {
                get_slot_attr_value(&child_comp.attributes, source).is_some()
            }
            TemplateNode::SvelteFragment(el) => {
                get_slot_attr_value(&el.attributes, source).is_some()
            }
            _ => false,
        };

        if is_named_slot {
            // The default slot's `$$slot_def.default` block stays open
            // through all children. Each named slot child carries its
            // own inner `$$slot_def["..."]` block (handled by the
            // dedicated handlers below); they're nested inside the
            // outer default block.

            // Process the named slot child (children of the parent component are at depth+1)
            match node {
                TemplateNode::RegularElement(el) => {
                    handle_named_slot_element(el, inst_var, source, options, str, counter, depth);
                }
                TemplateNode::Component(child_comp) => {
                    handle_named_slot_component(
                        child_comp, inst_var, source, options, str, counter, depth,
                    );
                }
                TemplateNode::SvelteFragment(el) => {
                    handle_named_slot_svelte_fragment(
                        el, inst_var, source, options, str, counter, depth,
                    );
                }
                _ => {
                    process_node_inplace(node, source, options, str, counter, depth);
                }
            }

            // Re-open default slot block after this named slot child if needed
            if has_lets {
                // Check if there are more non-named-slot children after this
                let _has_more_default = comp.fragment.nodes[i + 1..].iter().any(|n| match n {
                    TemplateNode::RegularElement(el) => {
                        get_slot_attr_value(&el.attributes, source).is_none()
                    }
                    TemplateNode::Component(c) => {
                        get_slot_attr_value(&c.attributes, source).is_none()
                    }
                    TemplateNode::SvelteFragment(el) => {
                        get_slot_attr_value(&el.attributes, source).is_none()
                    }
                    TemplateNode::Text(_) => true,
                    _ => true,
                });

                // Don't re-open if there are no more default slot children
                // Actually, we should re-open for any remaining children
                // We'll handle this below
            }
        } else {
            // Default slot child - process normally
            // If the default slot block was closed for a named slot, re-open it
            if has_lets && !default_slot_opened {
                let block_open = format!(
                    "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
                    let_destructure, inst_var
                );
                str.append_left(node.start(), &block_open);
                default_slot_opened = true;
            }
            // A default-slot child (`<svelte:fragment let:foo>`, `<div let:foo>`)
            // with no `slot=` but its OWN `let:` directives needs a
            // `$$slot_def.default` destructure block referencing the ENCLOSING
            // component — JS reference's Element.performTransformation emits one
            // whenever the default-slot child has `let:` directives. Wrap the
            // child so the `let:` bindings are scoped to its body.
            //
            // A COMPONENT child (`<Child let:foo>`) is excluded: its `let:foo`
            // binds from `Child`'s OWN `$$slot_def.default`, which its own
            // `handle_component` already emits. Routing it through the parent
            // here would wrongly duplicate the destructure onto the parent
            // instance (#1232).
            let fragment_lets: Option<Vec<&LetDirective>> = match node {
                TemplateNode::SvelteFragment(el) => {
                    let lets = get_let_directives(&el.attributes);
                    if lets.is_empty() { None } else { Some(lets) }
                }
                TemplateNode::RegularElement(el) => {
                    let lets = get_let_directives(&el.attributes);
                    if lets.is_empty() { None } else { Some(lets) }
                }
                _ => None,
            };
            let fragment_block_open = if let Some(ref lets) = fragment_lets {
                let destructure = build_let_destructure_string(lets, source);
                let block = format!(
                    "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
                    destructure, inst_var
                );
                str.append_left(node.start(), &block);
                true
            } else {
                false
            };
            // Mark the component slot context so a `slot="…"` element nested
            // inside this default-slot child's control-flow blocks (`{#if}` /
            // `{#each}` / …) is lowered to the named-slot form referencing this
            // component instance. A nested element/component clears it (each
            // owns its own slot scope) via `handle_regular_element`'s `take()`.
            let prev_slot = counter.slot_inst.replace(inst_var.to_string());
            process_node_inplace(node, source, options, str, counter, depth);
            counter.slot_inst = prev_slot;
            if fragment_block_open {
                str.append_left(node.end(), "}");
            }
        }

        prev_end = Some(node.end());
    }

    // Close the default slot block if still open
    if default_slot_opened && has_lets {
        // Find the position to close: after the last node, before the closing tag
        if let Some(end) = prev_end {
            let closing_tag_start = find_closing_tag_start(source, comp.end);
            if closing_tag_start < comp.end {
                str.append_left(closing_tag_start, "}");
            } else {
                str.append_left(end, "}");
            }
        }
    }
}

/// Handle a regular element child with `slot="name"` attribute inside a component.
///
/// Wraps the element in a `$$slot_def["name"]` destructuring block.
fn handle_named_slot_element(
    el: &RegularElement,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    let slot_name = get_slot_attr_value(&el.attributes, source).unwrap_or_default();
    let let_directives = get_let_directives(&el.attributes);
    let let_destructure = build_let_destructure_string(&let_directives.to_vec(), source);

    // Build the slot def block opener
    let block_open = format!(
        "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    // Build attributes string excluding `slot` and `let:` directives
    let attrs_str = build_named_slot_element_attrs(&el.attributes, source);

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);

    // class:/style: directives lower to statements after createElement
    // (`class:bar` → ` bar;`), same as a regular element. The `let:` binding
    // itself is consumed by the `$$slot_def[…]` destructure above (and any use
    // in the body emits its own reference), so it is NOT re-emitted here.
    let class_style_suffix = segs_to_string(
        &build_class_style_directive_suffix_segments(&el.attributes, source),
        source,
    );

    // NOTE: the `let:foo={bar}` binding is reflected purely via the slot-def
    // destructure (`{ …, foo: bar } = …$$slot_def["…"]`); official emits NO
    // separate `bar;` reflection statement (that would duplicate the `{bar}`
    // content expression).
    let opener = format!(
        "{}{{ svelteHTML.createElement(\"{}\", {{{}}});{}",
        block_open, el.name, attrs_str, class_style_suffix
    );
    str.overwrite(el.start, opening_tag_end, &opener);

    // This named-slot element is a RegularElement — its children are at depth+1.
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

    // Void elements (`<input slot="x">`) and source-self-closing tags have no
    // `</tag>`; calling `find_closing_tag_start` would scan backward and match
    // an unrelated earlier `</…>` (e.g. `</script>`), overwriting everything in
    // between. Append the closing braces at `el.end` instead. Mirrors
    // `handle_regular_element`.
    let is_self_closing_source = slice_src(source, el.start as usize, el.end as usize)
        .trim_end()
        .ends_with("/>");
    let is_void = crate::compiler::utils::is_void_element(&el.name);
    if is_void || is_self_closing_source {
        str.append_left(el.end, " }}");
    } else {
        let closing_tag_start = find_closing_tag_start(source, el.end);
        if closing_tag_start < el.end {
            str.overwrite(closing_tag_start, el.end, " }}");
        } else {
            str.append_left(el.end, " }}");
        }
    }
}

/// Handle a `<svelte:fragment slot="name" let:foo>` child inside a parent
/// component. `<svelte:fragment>` itself doesn't render to HTML — it's a
/// virtual element used to distribute children into a named slot. The JS
/// reference still emits a `svelteHTML.createElement("svelte:fragment", { })`
/// (with `slot` and `let:` attributes stripped), wrapped in the slot let
/// destructure block.
fn handle_named_slot_svelte_fragment(
    el: &SvelteElement,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    let slot_name = get_slot_attr_value(&el.attributes, source).unwrap_or_default();
    let let_directives = get_let_directives(&el.attributes);
    let let_destructure = build_let_destructure_string(&let_directives.to_vec(), source);

    // Leading ` ` matches the JS reference, which produces
    // `\t {const ... ;{ svelteHTML.createElement(...)` after the tab indent
    // is preserved.
    let block_open = format!(
        " {{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
    let closing_tag_start = find_closing_tag_start(source, el.end);
    let has_closing_tag = closing_tag_start < el.end;

    // Emit the slot-def block + a `svelteHTML.createElement("svelte:fragment", {  })`
    // with the `slot` / `let:` attributes stripped. The JS reference's
    // position-preserving emission leaves one space per stripped attribute
    // visible inside the empty `{}` (so `slot="x" let:y` → 2 spaces,
    // `slot="x" let:y let:z` → 3 spaces, etc.).
    let attrs_str = build_named_slot_element_attrs(&el.attributes, source);
    let inner = if attrs_str.is_empty() {
        let stripped_count = el
            .attributes
            .iter()
            .filter(|a| {
                matches!(
                    a,
                    Attribute::Attribute(node)
                        if node.name == "slot"
                ) || matches!(a, Attribute::LetDirective(_))
            })
            .count();
        " ".repeat(stripped_count.max(1))
    } else {
        attrs_str
    };
    let opener = format!(
        "{}{{ svelteHTML.createElement(\"svelte:fragment\", {{{}}});",
        block_open, inner
    );

    if !has_closing_tag {
        // Self-closing `<svelte:fragment slot="x" />` — body has no nodes.
        let combined = format!("{} }}}}", opener);
        str.overwrite(el.start, el.end, &combined);
        return;
    }

    str.overwrite(el.start, opening_tag_end, &opener);
    // `<svelte:fragment slot=…>` emits its own `createElement("svelte:fragment")`,
    // so it is an element nesting level — children (their `$$_<name><depth>`
    // instance vars) are at depth + 1.
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);
    str.overwrite(closing_tag_start, el.end, " }}");
}

/// Handle a component child with `slot="name"` attribute inside a parent component.
fn handle_named_slot_component(
    comp: &Component,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    let slot_name = get_slot_attr_value(&comp.attributes, source).unwrap_or_default();
    let let_directives = get_let_directives(&comp.attributes);
    let let_destructure = build_let_destructure_string(&let_directives.to_vec(), source);

    // Build the slot def block opener
    let block_open = format!(
        "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    // Insert the block opener before the component
    str.append_left(comp.start, &block_open);

    // Process the component normally. Suppress its component-name reference at
    // the close so we can emit it *outside* the component's own block (matching
    // official `endTransformation` order: component-block `}`, then `Name`, then
    // the named-slot-block `}`).
    counter.named_slot_component_close = true;
    counter.suppress_component_lets = true;
    handle_component(comp, source, options, str, counter, depth);

    // Emit the component-name reference (non-self-closing only — official maps
    // `</Name>` to `Name`; self-closing components have no name reference) and
    // close the named-slot block.
    let closing_tag_start = find_closing_tag_start(source, comp.end);
    if closing_tag_start < comp.end {
        str.append_left(comp.end, &format!(" {}}}", comp.name));
    } else {
        str.append_left(comp.end, "}");
    }
}

/// Build attribute string for a named slot element, excluding `slot` and `let:` directives.
fn build_named_slot_element_attrs(attributes: &[Attribute], source: &str) -> String {
    let mut parts: Vec<String> = Vec::new();

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                if node.name == "slot" {
                    continue;
                }
                // Named-slot elements become `svelteHTML.createElement(…)` calls,
                // so they are real DOM elements — apply data-* wrapping.
                if let Some(s) = format_attribute_node(node, source, true) {
                    parts.push(s);
                }
            }
            Attribute::SpreadAttribute(spread) => {
                if let Some(s) = format_spread_attribute(spread, source) {
                    parts.push(s);
                }
            }
            Attribute::BindDirective(bind) => {
                parts.push(format_bind_directive(bind, source));
            }
            Attribute::OnDirective(on) => {
                parts.push(format_on_directive(on, source));
            }
            Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => {
                // class:/style: are not props — they lower to statements after
                // createElement (see the suffix in handle_named_slot_element).
            }
            Attribute::TransitionDirective(transition) => {
                if let Some(s) = format_transition_directive(transition, source) {
                    parts.push(s);
                }
            }
            Attribute::UseDirective(use_dir) => {
                if let Some(s) = format_use_directive(use_dir, source) {
                    parts.push(s);
                }
            }
            // Skip let: directives and animate
            Attribute::AnimateDirective(_) | Attribute::LetDirective(_) => {}
            Attribute::AttachTag(_) => {}
        }
    }

    let result = parts.join("");
    if result.is_empty() {
        result
    } else {
        format!(" {}", result)
    }
}

/// Handle `<svelte:component this={expr}>`.
fn handle_svelte_component(
    comp: &SvelteComponentElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if comp.start >= comp.end {
        return;
    }

    // This component's children own their own slot scope: clear any inherited
    // slot context (restored at the end for following siblings).
    let saved_outer_slot = counter.slot_inst.take();

    let expr_text = get_expression_text(&comp.expression, source);
    // Use "svelte:component" as the name for variable naming, with ':' replaced by '_'
    let scomp_name = "svelte:component".replace(':', "_");

    let opening_tag_end = find_opening_tag_end(source, comp.start, comp.end);

    // Collect on: directives
    let on_directives = get_on_directives(&comp.attributes);
    let has_events = !on_directives.is_empty();

    // Build attribute/props string (excluding on: directives)
    let mut attrs_str = build_component_props_string(&comp.attributes, source);

    // Add extra whitespace to match JS svelte2tsx position-preserving behavior
    if !comp.attributes.is_empty() && !attrs_str.is_empty() {
        let extra_spaces = count_tag_to_attr_spaces("svelte:component", comp.start, source);
        if extra_spaces >= 1 {
            let total_spaces = extra_spaces + 1;
            let mut padded = " ".repeat(total_spaces);
            padded.push_str(attrs_str.trim_start());
            attrs_str = padded;
        }
    }

    // Check if component has meaningful children for Svelte 5 children prop
    let has_children = has_component_slot_children(&comp.fragment, source);
    let is_svelte5 = matches!(options.version, SvelteVersion::V5);
    let let_directives_scomp = get_let_directives(&comp.attributes);
    let has_lets_scomp = !let_directives_scomp.is_empty();
    // Emit the synthetic `children` prop whenever there is default-slot content,
    // even alongside `let:` directives — matching handle_component (which has no
    // such guard). The `let:` destructure is emitted independently below.
    if is_svelte5 && has_children {
        let children_text = "children:() => { return __sveltets_2_any(0); },";
        let trimmed = attrs_str.trim_start();
        if trimmed.is_empty() {
            attrs_str = children_text.to_string();
        } else {
            let leading_ws: String = attrs_str
                .chars()
                .take_while(|c| c.is_whitespace())
                .collect();
            attrs_str = format!("{}{}{}", leading_ws, children_text, trimmed);
        }
    }

    let ctor_var = reversed_component_name(&scomp_name, depth);
    let inst_var = reversed_component_instance_name(&scomp_name, depth);
    // A `bind:` directive on the component needs the instance variable too: it
    // emits a `inst.$$bindings = 'name'` marker (and a type-widener) after the
    // `new` statement, mirroring `handle_component`.
    let has_binds = comp
        .attributes
        .iter()
        .any(|a| matches!(a, Attribute::BindDirective(_)));
    // Build the bind suffix (same shape as `handle_component`'s
    // `component_bind_suffix`).
    let component_bind_suffix = {
        let mut out = String::new();
        for attr in &comp.attributes {
            if let Attribute::BindDirective(bind) = attr {
                if bind.name == "this" {
                    // LHS strips a trailing TS assertion; a postfix moves onto the
                    // RHS instance var (mirrors Binding.ts / the element path).
                    let bexpr = get_binding_lhs_text(&bind.expression, source);
                    let postfix = get_expression_range(&bind.expression)
                        .map(|(_, e)| {
                            let ge = get_expression_end_stripping_ts(&bind.expression, source)
                                .unwrap_or(e);
                            let ee = extend_expr_end_with_ts_postfix(source, e, bind.end);
                            slice_src(source, ge as usize, ee as usize)
                        })
                        .unwrap_or("");
                    let _ = write!(out, "{} = {}{};", bexpr, inst_var, postfix);
                    continue;
                }
                if get_set_binding_ranges(&bind.expression, source).is_some() {
                    let _ = write!(out, "{}.$$bindings = '{}';", inst_var, bind.name);
                    continue;
                }
                // Setter type-widener: LHS strips a trailing TS assertion.
                let bexpr = get_binding_lhs_text(&bind.expression, source);
                let _ = write!(
                    out,
                    "/*\u{03A9}ignore_start\u{03A9}*/() => {} = __sveltets_2_any(null);/*\u{03A9}ignore_end\u{03A9}*/{}.$$bindings = '{}';",
                    bexpr, inst_var, bind.name
                );
            }
        }
        out
    };
    // Need an instance variable when there are `on:` events, `let:` directives,
    // `bind:` directives, or children that reference the instance's slot defs
    // (named-slot children anywhere in blocks, or default-slot `let:` receivers).
    let children_have_named_slots = has_named_slot_children(&comp.fragment, source);
    let children_have_default_slot_lets = has_default_slot_let_children(&comp.fragment, source);
    let needs_inst = has_events
        || has_lets_scomp
        || has_binds
        || children_have_named_slots
        || children_have_default_slot_lets;
    let mut opener = if needs_inst {
        let on_calls = if has_events {
            build_on_calls(&inst_var, &on_directives, source)
        } else {
            String::new()
        };
        format!(
            " {{ const {} = __sveltets_2_ensureComponent({}); const {} = new {}({{ target: __sveltets_2_any(), props: {{{}}}}});{}{}",
            ctor_var, expr_text, inst_var, ctor_var, attrs_str, component_bind_suffix, on_calls
        )
    } else {
        format!(
            " {{ const {} = __sveltets_2_ensureComponent({}); new {}({{ target: __sveltets_2_any(), props: {{{}}}}});",
            ctor_var, expr_text, ctor_var, attrs_str
        )
    };

    // Slot let-forwarding: `{const { $$_$$, prop, } = inst.$$slot_def.default; $$_$$;`
    // Mirrors `defaultSlotLetTransformation` in the JS reference's
    // `htmlxtojsx_v2/nodes/InlineComponent.ts`.
    if has_lets_scomp {
        let destructure = build_let_destructure_string(&let_directives_scomp, source);
        let _ = write!(
            opener,
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
            destructure, inst_var
        );
    }

    str.overwrite(comp.start, opening_tag_end, &opener);

    // Children of svelte:component are at depth+1 (this component is now an
    // ancestor). Mark the slot context so `slot="x"` children (incl. those
    // nested in control-flow blocks) lower to `inst.$$slot_def["x"]`.
    let prev_slot = counter.slot_inst.replace(inst_var.clone());
    process_fragment_inplace(&comp.fragment, source, options, str, counter, depth + 1);
    counter.slot_inst = prev_slot;

    let closing_tag_start = find_closing_tag_start(source, comp.end);
    let closing_text = if has_lets_scomp { "}}" } else { "}" };
    if closing_tag_start < comp.end {
        str.overwrite(closing_tag_start, comp.end, closing_text);
    } else {
        str.append_left(comp.end, closing_text);
    }

    // Restore the slot context for following siblings.
    counter.slot_inst = saved_outer_slot;
}

/// Handle `<svelte:element this={tag}>`.
fn handle_svelte_dynamic_element(
    el: &SvelteDynamicElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    // Named-slot routing: `<svelte:element … slot="x">` inside a component's
    // children targets the parent component's named slot. Wrap the whole
    // `createElement(...)` in a `$$slot_def["x"]` block and drop the `slot`
    // attribute. Take the context so the element's own children don't inherit
    // it; restore it for following siblings.
    let saved_slot = counter.slot_inst.take();
    let named_slot: Option<(String, String)> = saved_slot.as_ref().and_then(|inst| {
        get_slot_attr_value(&el.attributes, source).map(|name| (inst.clone(), name))
    });
    if let Some((ref inst, ref target_slot)) = named_slot {
        let lets = get_let_directives(&el.attributes);
        let let_destructure = build_let_destructure_string(&lets, source);
        let block_open = format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
            let_destructure, inst, target_slot
        );
        str.prepend_left(el.start, &block_open);
    }

    let raw_tag_text = get_expression_text(&el.tag, source);
    // If the `this` attribute value is a plain string literal (this="tag"),
    // the parser stores just the text without quotes. We need to wrap it
    // in quotes to produce valid JavaScript: createElement("tag", ...).
    let tag_text = if let Some((start, _end)) = get_expression_range(&el.tag) {
        let before = if start > 0 {
            source.as_bytes()[(start - 1) as usize]
        } else {
            b'{'
        };
        if before == b'"' || before == b'\'' {
            // String literal: wrap in quotes
            format!("\"{}\"", raw_tag_text)
        } else {
            raw_tag_text.to_string()
        }
    } else {
        raw_tag_text.to_string()
    };
    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
    // In a named-slot context the `slot` attribute is consumed by the wrapper
    // block, so build the attributes without it.
    let attrs_str = if named_slot.is_some() {
        build_named_slot_element_attrs(&el.attributes, source)
    } else {
        build_attributes_string(&el.attributes, source, saved_slot.is_some())
    };

    // `use:` / `transition:` / `animate:` directives, same V4 emission as on a
    // regular element. The action's `mapElementTag` uses the literal element
    // name (`svelte:element`); the `createElement` first arg stays the dynamic
    // tag expression.
    let (directive_prefix, directive_suffix, action_count) =
        build_directive_prefix_suffix(&el.attributes, source, &el.name);
    let actions_arg = if action_count > 0 {
        let mut args = String::from(", __sveltets_2_union(");
        for i in 0..action_count {
            if i > 0 {
                args.push(',');
            }
            let _ = write!(args, "$$action_{}", i);
        }
        args.push(')');
        args
    } else {
        String::new()
    };
    // Only the action `directive_prefix` (the `const $$action_N = …;`
    // declarations) needs an extra inner block scope; a transition/animate-only
    // suffix is just appended after the createElement, no extra braces.
    let needs_inner_block = !directive_prefix.is_empty();

    // Check if this is a self-closing element (no separate closing tag).
    // Also covers HTML void elements like `<input>`, `<br>`, `<img>` which have
    // no closing tag in the source — `is_void_element` keeps the opener and
    // closing brace on a single line, mirroring the JS reference's behaviour
    // for void tags.
    let is_self_closing = el.fragment.nodes.is_empty()
        && (slice_src(source, el.start as usize, el.end as usize)
            .trim_end()
            .ends_with("/>")
            || crate::compiler::utils::is_void_element(&el.name));

    let attrs_self = if attrs_str.is_empty() {
        "  "
    } else {
        &attrs_str
    };
    let attrs_open = if attrs_str.is_empty() {
        " "
    } else {
        &attrs_str
    };
    // With directives an extra inner block scope wraps the createElement so the
    // action declarations (in `directive_prefix`) are in scope: ` {<prefix>{ … }}`.
    let inner_open = if needs_inner_block { "{" } else { "" };
    let inner_close = if needs_inner_block { "}" } else { "" };
    // `bind:this` / one-way bindings on `<svelte:element>` need the
    // `const $$_svelteelement<depth> = createElement(...)` form so the binding
    // assignment can reference it. Mirrors regular-element / Element.ts lowering.
    let needs_element_var = any_bind_needs_element_var(&el.attributes, source);
    let element_var = if needs_element_var {
        Some(format!("$$_{}{}", element_var_base_name(&el.name), depth))
    } else {
        None
    };
    let bind_suffix = build_bind_directive_suffix(
        &el.attributes,
        source,
        element_var.as_deref(),
        &el.name,
        options.is_ts_file,
    );
    let element_var_decl = element_var
        .as_ref()
        .map(|v| format!("const {} = ", v))
        .unwrap_or_default();
    // `class:`/`style:` directives lower to statements after the createElement
    // (`class:active={x}` → ` x;`), same as a regular element.
    let class_style_suffix = segs_to_string(
        &build_class_style_directive_suffix_segments(&el.attributes, source),
        source,
    );
    // ` <var=>svelteHTML.createElement(tag<actions_arg>, {attrs});<suffix>` — no
    // leading `{`; the block brace comes from the outer ` {` (and `inner_open`
    // when directives add an extra scope).
    // The post-`createElement` suffix statements — `class:`/`style:`, transition/animate
    // (`directive_suffix`), and `bind:` (`bind_suffix`) — are emitted in SOURCE-ATTRIBUTE
    // ORDER, mirroring the regular-element handler's sort logic.
    let first_bind_pos_se = el
        .attributes
        .iter()
        .filter_map(|a| match a {
            Attribute::BindDirective(b) => Some(b.start),
            _ => None,
        })
        .min();
    let first_directive_pos_se = el
        .attributes
        .iter()
        .filter_map(|a| match a {
            Attribute::TransitionDirective(t) => Some(t.start),
            Attribute::AnimateDirective(an) => Some(an.start),
            _ => None,
        })
        .min();
    let first_class_style_pos_se = el
        .attributes
        .iter()
        .filter_map(|a| match a {
            Attribute::ClassDirective(c) => Some(c.start),
            Attribute::StyleDirective(s) => Some(s.start),
            _ => None,
        })
        .min();
    let sorted_suffix = {
        let mut pieces: Vec<(u32, &str)> = Vec::new();
        if !directive_suffix.is_empty() {
            pieces.push((
                first_directive_pos_se.unwrap_or(u32::MAX),
                &directive_suffix,
            ));
        }
        if !class_style_suffix.is_empty() {
            pieces.push((
                first_class_style_pos_se.unwrap_or(u32::MAX),
                &class_style_suffix,
            ));
        }
        if !bind_suffix.is_empty() {
            pieces.push((first_bind_pos_se.unwrap_or(u32::MAX), &bind_suffix));
        }
        pieces.sort_by_key(|(pos, _)| *pos);
        pieces.into_iter().map(|(_, s)| s).collect::<String>()
    };
    let create = |attrs: &str| {
        format!(
            " {}svelteHTML.createElement({}{}, {{{}}});{}",
            element_var_decl, tag_text, actions_arg, attrs, sorted_suffix
        )
    };
    if is_self_closing {
        // Self-closing: outer block, optional inner directive block, close both.
        let opener = format!(
            " {{{}{}{}{}}}",
            directive_prefix,
            inner_open,
            create(attrs_self),
            inner_close
        );
        str.overwrite(el.start, el.end, &opener);
    } else {
        let opener = format!(
            " {{{}{}{}",
            directive_prefix,
            inner_open,
            create(attrs_open)
        );
        str.overwrite(el.start, opening_tag_end, &opener);

        // svelte:element is an element node → children at depth+1.
        process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

        let closing_tag_start = find_closing_tag_start(source, el.end);
        let close = format!(" }}{}", inner_close);
        if closing_tag_start < el.end {
            str.overwrite(closing_tag_start, el.end, &close);
        } else {
            str.append_left(el.end, &close);
        }
    }

    // Close the named-slot `$$slot_def[...]` wrapper block; restore context.
    if named_slot.is_some() {
        str.append_left(el.end, "}");
    }
    counter.slot_inst = saved_slot;
}

/// Handle `<title>` element.
fn handle_title_element(
    el: &TitleElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
    let attrs_str = build_attributes_string(&el.attributes, source, counter.slot_inst.is_some());

    let opener = format!(
        " {{ svelteHTML.createElement(\"title\", {{{}}});",
        attrs_str
    );
    str.overwrite(el.start, opening_tag_end, &opener);

    // title is an element → children at depth+1.
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        str.overwrite(closing_tag_start, el.end, " }");
    } else {
        str.append_left(el.end, " }");
    }
}

/// Handle `<slot>` element.
///
/// Generates `{ __sveltets_createSlot("name", { attrs }); fallback_children }`.
///
/// The slot name is determined by the `name` attribute (default: "default").
/// Other attributes become slot props. `bind:this` gets special handling.
fn handle_slot_element(
    el: &SlotElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    // Named-slot forwarding: `<slot slot="x">` inside a component's children
    // distributes into the parent component's named slot `x`. Wrap the whole
    // `__sveltets_createSlot(...)` in a `$$slot_def["x"]` destructure block
    // referencing the enclosing component instance. Take the context so the
    // slot's own fallback children don't inherit it; restore it for siblings.
    let saved_slot = counter.slot_inst.take();
    let named_slot: Option<(String, String)> = saved_slot.as_ref().and_then(|inst| {
        get_slot_attr_value(&el.attributes, source).map(|name| (inst.clone(), name))
    });
    if let Some((ref inst, ref target_slot)) = named_slot {
        let lets = get_let_directives(&el.attributes);
        let let_destructure = build_let_destructure_string(&lets, source);
        let block_open = format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
            let_destructure, inst, target_slot
        );
        str.prepend_left(el.start, &block_open);
    }

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);

    // Extract the slot name from attributes (default: "default")
    let slot_name = get_slot_name(&el.attributes, source);

    // Check for bind:this directive
    let bind_this_expr = get_bind_this_expr(&el.attributes, source);

    // Build slot props string (excluding `name` attribute and `bind:this`).
    // Official emits a leading space inside a non-empty props object
    // (`{ "message":… }`); empty stays `{}`. oxfmt normalises this for valid
    // output, but a top-level-await slot is emitted raw, where the space matters.
    // Note: `build_slot_props_string` already prepends a space to non-empty
    // results, so we must NOT add another space here in the format string.
    let slot_props = build_slot_props_string(&el.attributes, source);
    let slot_props_obj = if slot_props.is_empty() {
        "{}".to_string()
    } else {
        format!("{{{}}}", slot_props)
    };

    // Build the slot call
    let opener = if bind_this_expr.is_some() {
        format!(
            " {{ const $$_slot{} = __sveltets_createSlot(\"{}\", {});",
            counter.next_for("slot"),
            slot_name,
            slot_props_obj
        )
    } else {
        format!(
            " {{ __sveltets_createSlot(\"{}\", {});",
            slot_name, slot_props_obj
        )
    };
    str.overwrite(el.start, opening_tag_end, &opener);

    // Process fallback children: slot is an element → children at depth+1.
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

    // Handle closing tag
    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        if let Some(ref bind_expr) = bind_this_expr {
            // For bind:this, assign the slot variable: `s = $$_slot0;}
            str.overwrite(
                closing_tag_start,
                el.end,
                &format!(
                    "{} = $$_slot{};}}",
                    bind_expr,
                    counter
                        .counters
                        .get("slot")
                        .copied()
                        .unwrap_or(0)
                        .saturating_sub(1)
                ),
            );
        } else {
            str.overwrite(closing_tag_start, el.end, " }");
        }
    } else {
        // Self-closing slot
        if let Some(ref bind_expr) = bind_this_expr {
            let slot_idx = counter
                .counters
                .get("slot")
                .copied()
                .unwrap_or(0)
                .saturating_sub(1);
            str.overwrite(
                el.end - 2, // rewrite the `/>` portion
                el.end,
                &format!("{} = $$_slot{};}}", bind_expr, slot_idx),
            );
        } else {
            // Self-closing without bind:this - just close the block
            // The `/>` is part of the opening tag which was already overwritten
            str.append_left(el.end, "}");
        }
    }

    // Close the named-slot `$$slot_def[...]` wrapper block, then restore the
    // slot context for following siblings.
    if named_slot.is_some() {
        str.append_left(el.end, "}");
    }
    counter.slot_inst = saved_slot;
}

/// Handle `<svelte:self>` element.
///
/// `<svelte:self>` becomes `__sveltets_2_createComponentAny({props})`.
/// When there are event directives, a variable is created for `$on()` calls.
fn handle_svelte_self(
    el: &SvelteElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
    let closing_tag_start = find_closing_tag_start(source, el.end);
    let has_closing_tag = closing_tag_start < el.end;

    // Separate on: + let: directives from regular attributes
    let mut has_on_directives = false;
    let mut on_directives = Vec::new();
    let let_directives = get_let_directives(&el.attributes);
    let mut prop_parts = Vec::new();

    for attr in &el.attributes {
        match attr {
            Attribute::OnDirective(on) => {
                has_on_directives = true;
                on_directives.push(on);
            }
            Attribute::LetDirective(_) => {
                // Handled below via `let_directives` — not emitted as a prop.
            }
            _ => match attr {
                Attribute::Attribute(node) => {
                    // `<svelte:self>` is component-like (`__sveltets_2_createComponentAny`),
                    // so apply --* CSS-prop wrapping, not data-* element wrapping.
                    if let Some(s) = format_attribute_node(node, source, false) {
                        prop_parts.push(s);
                    }
                }
                Attribute::SpreadAttribute(spread) => {
                    if let Some(s) = format_spread_attribute(spread, source) {
                        prop_parts.push(s);
                    }
                }
                Attribute::BindDirective(bind) => {
                    prop_parts.push(format_bind_directive(bind, source));
                }
                _ => {}
            },
        }
    }

    // `<svelte:self>` is an InlineComponent in official svelte2tsx, so the
    // implicit-children rule applies: in Svelte 5, default-slot content
    // (non-named-slot children) adds a synthetic `children` prop. Mirrors
    // `handleImplicitChildren` (gated on `options.svelte5Plus`). Inserted at the
    // front of the props, before any real attributes.
    if matches!(options.version, SvelteVersion::V5)
        && has_component_slot_children(&el.fragment, source)
    {
        prop_parts.insert(
            0,
            "children:() => { return __sveltets_2_any(0); },".to_string(),
        );
    }

    let props_inner = if prop_parts.is_empty() {
        " ".to_string()
    } else {
        let extra_spaces = count_tag_to_attr_spaces(&el.name, el.start, source);
        if extra_spaces >= 1 {
            format!("{}{}", " ".repeat(extra_spaces + 1), prop_parts.join(""))
        } else {
            format!(" {}", prop_parts.join(""))
        }
    };

    let needs_inst_var = has_on_directives || !let_directives.is_empty();
    // Use depth as the instance variable index, mirroring official InlineComponent.ts
    // `this._name = '$$_svelteself' + this.computeDepth()`.
    let var_name = if needs_inst_var {
        Some(format!("$$_svelteself{}", depth))
    } else {
        None
    };

    let create_call = if let Some(ref name) = var_name {
        format!(
            " {{ const {} = __sveltets_2_createComponentAny({{{}}});",
            name, props_inner
        )
    } else {
        format!(" {{ __sveltets_2_createComponentAny({{{}}});", props_inner)
    };

    let mut opener = create_call;

    // Inline `$on()` registration immediately after the const declaration.
    if let Some(ref name) = var_name {
        for on in &on_directives {
            if let Some(ref expr) = on.expression {
                let expr_text = get_expression_text(expr, source);
                let _ = write!(opener, "{}.$on(\"{}\", {}); ", name, on.name, expr_text);
            } else {
                let _ = write!(opener, "{}.$on(\"{}\", () => {{}}); ", name, on.name);
            }
        }
    }

    // `let:` directives become a `{const { $$_$$, name, ... } = inst.$$slot_def.default; $$_$$;`
    // block right after the create call, with a matching `}` at the end.
    // Mirrors the JS reference's `defaultSlotLetTransformation` in
    // `htmlxtojsx_v2/nodes/InlineComponent.ts`.
    let has_lets = !let_directives.is_empty();
    if has_lets {
        let destructure = build_let_destructure_string(&let_directives, source);
        let inst_name = var_name
            .as_ref()
            .expect("let: directive requires an instance variable name");
        let _ = write!(
            opener,
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
            destructure, inst_name
        );
    }

    if !has_closing_tag {
        // Self-closing `<svelte:self ... />` — no body to process; the
        // opener's `{` needs a closing `}` immediately, plus another `}` if
        // there's a let-forward block to close.
        let trailing = if has_lets { "}}" } else { "}" };
        let combined = format!("{}{}", opener, trailing);
        str.overwrite(el.start, el.end, &combined);
        return;
    }

    str.overwrite(el.start, opening_tag_end, &opener);
    // svelte:self is a component → children at depth+1.
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);
    let trailing = if has_lets { "}}" } else { "}" };
    str.overwrite(closing_tag_start, el.end, trailing);
}

/// Handle Svelte special elements (svelte:body, svelte:window, etc.).
///
/// `svelte:boundary` is special: like `InlineComponent` in the upstream
/// svelte2tsx, any `{#snippet}` blocks that are **direct children** of
/// `<svelte:boundary>` become **implicit properties** of the element's
/// `createElement` attributes object instead of standalone `const` declarations.
/// This mirrors upstream `SnippetBlock.ts::hoistSnippetBlock` which returns
/// early for `SvelteBoundary` (treating it exactly like `InlineComponent`),
/// and `Element.ts::addAttribute` which the upstream `handleSnippet` calls to
/// insert the snippet body as an attr-value transform.
///
/// For all other special elements the snippet children remain standalone
/// declarations (the default behaviour for elements/blocks).
fn handle_svelte_special_element(
    el: &SvelteElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
    let mut attrs_str =
        build_attributes_string(&el.attributes, source, counter.slot_inst.is_some());

    // Add extra whitespace to match JS svelte2tsx position-preserving behavior
    if !el.attributes.is_empty() && !attrs_str.is_empty() {
        let extra_spaces = count_tag_to_attr_spaces(&el.name, el.start, source);
        if extra_spaces >= 1 {
            let total_spaces = extra_spaces + 1;
            let mut padded = " ".repeat(total_spaces);
            padded.push_str(attrs_str.trim_start());
            attrs_str = padded;
        }
    }

    // `svelte:boundary` treats direct {#snippet} children as implicit props on
    // the `createElement` attrs object — exactly like InlineComponent in the
    // upstream. Check whether any direct children are snippet blocks.
    let has_snippet_children = el.name == "svelte:boundary"
        && el
            .fragment
            .nodes
            .iter()
            .any(|n| matches!(n, TemplateNode::SnippetBlock(s) if s.start < s.end));

    if has_snippet_children {
        // Emit the opener with the attrs object left OPEN so we can append the
        // implicit snippet props into it before closing. Any regular element
        // attributes (e.g. `onerror`) come first as normal.
        //
        // Result shape:
        //   { svelteHTML.createElement("svelte:boundary", { <regular-attrs>
        //     <snippet-name>: (params) => { … return __sveltets_2_any(0) },
        //   });
        //   <non-snippet children>
        // }
        let opener = format!(
            " {{ svelteHTML.createElement(\"{}\", {{{}",
            el.name, attrs_str
        );
        str.overwrite(el.start, opening_tag_end, &opener);

        // Process each direct child: transform snippet blocks as implicit props
        // and move them to anchor (just after the opening tag), then process
        // non-snippet children in-place (they will appear after the `});`).
        // Mirrors the `use_snippet_props` branch in `handle_component`.
        let mut anchor = opening_tag_end;
        let mut last_snippet_end: Option<u32> = None;

        for node in &el.fragment.nodes {
            if let TemplateNode::SnippetBlock(s) = node {
                if s.start >= s.end {
                    continue;
                }
                // Transform the snippet as an implicit attr prop of this
                // element (same form as a component implicit snippet prop):
                //   name: (params) => { … return __sveltets_2_any(0) },
                handle_snippet_block_as_component_prop(s, source, options, str, counter, depth + 1);
                if s.start == anchor {
                    anchor = s.end;
                } else {
                    str.move_range(s.start, s.end, anchor);
                }
                last_snippet_end = Some(s.end);
            } else {
                // Non-snippet children live AFTER the createElement call;
                // svelte:boundary is an ancestor element → depth+1.
                process_node_inplace(node, source, options, str, counter, depth + 1);
            }
        }

        // Close the attrs object and the `createElement(...)` call right
        // after the last relocated snippet prop.
        let close_create_element = "});";
        match last_snippet_end {
            Some(end) => {
                str.append_left(end, close_create_element);
            }
            None => {
                // No usable snippet found (shouldn't happen given the guard
                // above, but guard defensively): close immediately.
                str.prepend_right(opening_tag_end, close_create_element);
            }
        }

        // Close the outer `{ … }` block.
        let closing_tag_start = find_closing_tag_start(source, el.end);
        if closing_tag_start < el.end {
            str.overwrite(closing_tag_start, el.end, " }");
        } else {
            str.append_left(el.end, "}");
        }
    } else {
        // `bind:` directives on a special element use the same lowering as a
        // regular element: `bind:this` and one-way bindings (`clientWidth`, …)
        // need a `const $$_<name><depth> = createElement(...)` so the binding
        // assignment (`foo = $$_<name><depth>.clientWidth;` / `target =
        // $$_<name><depth>;`) can reference it; other two-way bindings get the
        // generic `() => expr = __sveltets_2_any(null)` widener. Mirrors
        // upstream Element.ts + Binding.ts.
        let needs_element_var = any_bind_needs_element_var(&el.attributes, source);
        let element_var = if needs_element_var {
            Some(format!("$$_{}{}", element_var_base_name(&el.name), depth))
        } else {
            None
        };
        let bind_suffix = build_bind_directive_suffix(
            &el.attributes,
            source,
            element_var.as_deref(),
            &el.name,
            options.is_ts_file,
        );
        let element_var_decl = element_var
            .as_ref()
            .map(|v| format!("const {} = ", v))
            .unwrap_or_default();
        // `use:` / `transition:` / `animate:` directives on a special element
        // (e.g. `<svelte:body use:tooltip={…}>`) become the same V4-style
        // action/transition emission as on a regular element: an
        // `const $$action_N = __sveltets_2_ensureAction(…);` prefix, a
        // `__sveltets_2_union($$action_N)` second argument to `createElement`,
        // and transition/animate suffixes. The action's `mapElementTag` uses the
        // mapped tag name (`svelte:body` → `body`, per official Element.ts).
        let action_tag = if el.name == "svelte:body" {
            "body"
        } else {
            el.name.as_str()
        };
        let (directive_prefix, directive_suffix, action_count) =
            build_directive_prefix_suffix(&el.attributes, source, action_tag);
        let actions_arg = if action_count > 0 {
            let mut args = String::from(", __sveltets_2_union(");
            for i in 0..action_count {
                if i > 0 {
                    args.push(',');
                }
                let _ = write!(args, "$$action_{}", i);
            }
            args.push(')');
            args
        } else {
            String::new()
        };

        // Default path: all children (including any snippets) are processed
        // as standalone declarations inside the block. When `directive_prefix`
        // is present it opens an extra outer block scope (for the action
        // declarations), closed by a matching extra `}` after the children.
        let opener = if directive_prefix.is_empty() {
            format!(
                " {{ {}svelteHTML.createElement(\"{}\", {{{}}});{}{}",
                element_var_decl, el.name, attrs_str, bind_suffix, directive_suffix
            )
        } else {
            format!(
                " {{{}{{ {}svelteHTML.createElement(\"{}\"{}, {{{}}});{}{}",
                directive_prefix,
                element_var_decl,
                el.name,
                actions_arg,
                attrs_str,
                bind_suffix,
                directive_suffix
            )
        };
        str.overwrite(el.start, opening_tag_end, &opener);

        // Special svelte elements (svelte:head, svelte:body, etc.) are element
        // nodes → children at depth+1, consistent with RegularElement treatment.
        process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

        let extra_close = if directive_prefix.is_empty() { "" } else { "}" };
        let closing_tag_start = find_closing_tag_start(source, el.end);
        if closing_tag_start < el.end {
            str.overwrite(closing_tag_start, el.end, &format!(" }}{}", extra_close));
        } else {
            str.append_left(el.end, &format!("}}{}", extra_close));
        }
    }
}

// =============================================================================
// Attribute Handling
// =============================================================================

/// Build the attributes string for TSX output.
///
/// Returns the inner content for `{ ... }` in createElement or component props.
fn build_attributes_string(
    attributes: &[Attribute],
    source: &str,
    in_slot_context: bool,
) -> String {
    build_attributes_string_with_tag(attributes, source, "", in_slot_context)
}

fn build_attributes_string_with_tag(
    attributes: &[Attribute],
    source: &str,
    parent_tag: &str,
    in_slot_context: bool,
) -> String {
    let segs = build_attribute_segments(attributes, source, parent_tag, in_slot_context, None);
    segs_to_string(&segs, source)
}

/// Structured-bake counterpart of `build_attributes_string_with_tag`.
///
/// Emits the inner content of `{ ... }` in `createElement(name, { ... })`
/// as a list of `Seg`s. Source-bearing expressions (regular attribute
/// values, `on:` / `class:` / `style:` handlers, spreads, `@attach`
/// expressions) become `Seg::Src` so their column mapping survives the
/// element-opener overwrite. `bind:` directives stay as literals — their
/// expression also appears in `build_bind_directive_suffix` where the
/// column mapping is already exact.
fn build_attribute_segments(
    attributes: &[Attribute],
    source: &str,
    parent_tag: &str,
    in_slot_context: bool,
    opener_content_start: Option<u32>,
) -> Vec<Seg> {
    let mut segs: Vec<Seg> = Vec::new();
    let mut any_pushed = false;
    // Position immediately after the previous attribute (or after the tag name
    // for the first attribute). Used to recover a comment that precedes a
    // `data-*` attribute in the element opener.
    let mut prev_end = opener_content_start;

    let push_with_separator = |segs: &mut Vec<Seg>, inner: Vec<Seg>| {
        if inner.is_empty() {
            return;
        }
        for s in inner {
            match s {
                Seg::Lit(t) => segs_push_lit(segs, &t),
                Seg::Src(a, b) => segs_push_src(segs, a, b),
            }
        }
    };

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                // A comment in the opener between the previous attribute and this
                // one (`<div data-one="1" // c\n data-two="2">`) is preserved
                // inside this attribute's `__sveltets_2_empty({ … })` wrapper.
                let leading = match prev_end {
                    Some(pe) if pe <= node.start => {
                        let slice = source.get(pe as usize..node.start as usize).unwrap_or("");
                        if slice.contains("/*") || slice.contains("//") {
                            slice
                        } else {
                            ""
                        }
                    }
                    _ => "",
                };
                if let Some(part) =
                    format_attribute_node_segments(node, source, true, parent_tag, leading)
                {
                    push_with_separator(&mut segs, part);
                    any_pushed = true;
                }
                prev_end = Some(node.end);
            }
            Attribute::SpreadAttribute(spread) => {
                if let Some(part) = format_spread_attribute_segments(spread, source) {
                    push_with_separator(&mut segs, part);
                    any_pushed = true;
                }
            }
            Attribute::BindDirective(bind) => {
                // A get/set binding stays a `"bind:…": __sveltets_2_get_set_binding(…)`
                // prop even on one-way binding attributes (`clientWidth`), since
                // official's one-way lowering only applies to non-get/set bindings.
                let is_get_set = get_set_binding_ranges(&bind.expression, source).is_some();
                // `bind:this` (even as get/set) is never a prop — it's lowered to
                // an element-var assignment. The get/set exception only keeps
                // one-way binding *attributes* (clientWidth, …) as props.
                if (is_get_set && bind.name != "this")
                    || !bind_is_filtered_from_props(&bind.name, parent_tag)
                {
                    let part = format_bind_directive_segments(bind, source);
                    push_with_separator(&mut segs, part);
                    any_pushed = true;
                }
            }
            Attribute::OnDirective(on) => {
                let part = format_on_directive_segments(on, source);
                push_with_separator(&mut segs, part);
                any_pushed = true;
            }
            Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => {
                // `class:`/`style:` are directives, not attributes — they must
                // NOT be emitted as `HTMLProps` keys (the props object is
                // type-checked against `HTMLProps<tag, …>`, which has no
                // `class:NAME` / `style:PROP` keys, so they would trip the
                // excess-property check). They are lowered to statements
                // appended *after* the `createElement(...)` call by
                // `build_class_style_directive_suffix_segments`, mirroring
                // upstream `htmlxtojsx_v2/nodes/{Class,StyleDirective}.ts`.
            }
            Attribute::TransitionDirective(_)
            | Attribute::UseDirective(_)
            | Attribute::AnimateDirective(_) => {
                // Emitted by `build_directive_prefix_suffix` outside the
                // props object. No props contribution here.
            }
            Attribute::LetDirective(let_dir) => {
                // A `let:` directive on an element that is NOT a slot receiver
                // (not a direct/through-block child of a component — `slot_inst`
                // is unset) is a regular, deprecated attribute: `"let:x": true`
                // (or the expression). In a slot context it is consumed by the
                // `$$slot_def` destructure, so emit nothing. Mirrors official
                // `Let.ts` `handleLet`'s else branch.
                if !in_slot_context {
                    let mut part: Vec<Seg> = Vec::new();
                    if let Some(ref expr) = let_dir.expression {
                        segs_push_lit(&mut part, &format!("\"let:{}\":", let_dir.name));
                        if let Some((s, e)) = get_expression_range(expr) {
                            segs_push_src(&mut part, s, e);
                        } else {
                            segs_push_lit(&mut part, get_expression_text(expr, source));
                        }
                        segs_push_lit(&mut part, ",");
                    } else {
                        segs_push_lit(&mut part, &format!("\"let:{}\":true,", let_dir.name));
                    }
                    push_with_separator(&mut segs, part);
                    any_pushed = true;
                }
            }
            Attribute::AttachTag(attach) => {
                let part = format_attach_tag_segments(attach, source);
                push_with_separator(&mut segs, part);
                any_pushed = true;
            }
        }
    }

    if any_pushed && !segs_is_empty(&segs) {
        // Leading single space: `{ "attr":val,}` (not `{"attr":val,}`).
        // Inserted as a fresh first Lit so callers can replace/pad it
        // without disturbing the inner segments.
        let mut padded: Vec<Seg> = Vec::with_capacity(segs.len() + 1);
        padded.push(Seg::Lit(" ".to_string()));
        padded.extend(segs);
        padded
    } else {
        segs
    }
}

/// Build the attributes/props string for a component, excluding `on:` directives.
///
/// `on:` directives on components become `.$on()` calls instead of props,
/// so they are filtered out here.
///
/// When `on:` directives are present but filtered out, a space is added inside
/// the empty braces to match the JS svelte2tsx output: `props: { }`.
fn build_component_props_string(attributes: &[Attribute], source: &str) -> String {
    let mut parts: Vec<String> = Vec::new();
    let mut has_on_directives = false;
    let mut let_count = 0u32;

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                // Skip the `slot` attribute on components (it's for named slot targeting)
                if node.name == "slot" {
                    continue;
                }
                // is_element=false: --* attrs are wrapped with __sveltets_2_cssProp
                // inside format_attribute_node (mirrors Attribute.ts `addProp`).
                if let Some(s) = format_attribute_node(node, source, false) {
                    parts.push(s);
                }
            }
            Attribute::SpreadAttribute(spread) => {
                if let Some(s) = format_spread_attribute(spread, source) {
                    parts.push(s);
                }
            }
            Attribute::BindDirective(bind) => {
                // `bind:foo={expr}` on a component becomes a regular prop
                // `foo:expr,` (no `bind:` prefix) — mirrors the JS reference
                // for InlineComponent. `bind:this` is filtered out; the
                // ensureBindings() helper is added at the call site.
                if bind.name == "this" {
                    continue;
                }
                // Shorthand `bind:value` (expression right after `bind:`) →
                // shorthand prop `value`; explicit `bind:foo={expr}` → `foo:expr`.
                let expr_range = get_expression_range(&bind.expression);
                let is_shorthand = get_set_binding_ranges(&bind.expression, source).is_none()
                    && expr_range.is_some_and(|(s, _)| s == bind.start + "bind:".len() as u32);
                if is_shorthand {
                    let (s, e) = expr_range.unwrap();
                    parts.push(format!("{},", slice_src(source, s as usize, e as usize)));
                } else {
                    // Preserve a trailing TS postfix (`bind:value={value as string}`) —
                    // the parser narrows it out of the expression span so we must extend
                    // manually (mirrors upstream Binding.ts using `attr.expression.end`
                    // which includes the full TSAsExpression span).
                    let expr_text = if let Some((s, e)) = get_expression_range(&bind.expression) {
                        let extended = extend_expr_end_with_ts_postfix(source, e, bind.end);
                        slice_src(source, s as usize, extended as usize)
                    } else {
                        get_expression_text(&bind.expression, source)
                    };
                    parts.push(format!("{}:{},", bind.name, expr_text));
                }
            }
            Attribute::OnDirective(_) => {
                // Excluded from component props - handled as $on() calls
                has_on_directives = true;
            }
            Attribute::ClassDirective(class) => {
                parts.push(format_class_directive(class, source));
            }
            Attribute::StyleDirective(style) => {
                parts.push(format_style_directive(style, source));
            }
            Attribute::TransitionDirective(transition) => {
                if let Some(s) = format_transition_directive(transition, source) {
                    parts.push(s);
                }
            }
            Attribute::UseDirective(use_dir) => {
                if let Some(s) = format_use_directive(use_dir, source) {
                    parts.push(s);
                }
            }
            Attribute::LetDirective(_) => {
                // Let directives don't produce props but add a space to match
                // JS svelte2tsx whitespace behavior
                let_count += 1;
            }
            Attribute::AnimateDirective(_) => {
                // Animate directives don't produce TSX output
            }
            Attribute::AttachTag(attach) => {
                // `{@attach expr}` becomes `[Symbol("@attach")]:expr,`
                // — same prop-key form as on regular elements.
                let expr_text = get_expression_text(&attach.expression, source);
                parts.push(format!("[Symbol(\"@attach\")]:{},", expr_text));
            }
        }
    }

    let result = parts.join("");
    let let_spaces = " ".repeat(let_count as usize);
    if result.is_empty() {
        if has_on_directives && let_count == 0 {
            // When only on: directives were filtered out, add a space inside the
            // empty braces to match JS svelte2tsx output: `props: { }`
            " ".to_string()
        } else if let_count > 0 {
            // Each let: directive adds a space to match JS svelte2tsx whitespace
            let_spaces
        } else {
            result
        }
    } else {
        // Add let: directive spaces before the regular props
        format!(" {}{}", let_spaces, result)
    }
}

/// Structured-bake variant of [`build_component_props_string`]. Same
/// shape — single value-or-empty leading space, `let:` spacers — but
/// surfaces every expression as a `Seg::Src` so the eventual
/// `emit_segmented_overwrite` keeps the per-character source map.
fn build_component_props_segments(
    attributes: &[Attribute],
    source: &str,
    drop_slot: bool,
) -> Vec<Seg> {
    let mut inner: Vec<Seg> = Vec::new();
    let mut has_on_directives = false;
    let mut let_count = 0u32;

    let extend_segs = |dst: &mut Vec<Seg>, src: Vec<Seg>| {
        for s in src {
            match s {
                Seg::Lit(t) => segs_push_lit(dst, &t),
                Seg::Src(a, b) => segs_push_src(dst, a, b),
            }
        }
    };

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                // `slot="foo"` stays a normal `slot` prop on the component
                // EXCEPT when the component is being named-slot-routed by its
                // parent (static `slot=` inside a parent component), where the
                // attribute is consumed by the `$$slot_def[...]` wrapper.
                if node.name == "slot" && drop_slot {
                    continue;
                }
                // is_element=false: --* attrs get __sveltets_2_cssProp wrapping
                // inside format_attribute_node_segments (mirrors Attribute.ts).
                // Components preserve attribute-name case, so the tag is unused.
                if let Some(part) = format_attribute_node_segments(node, source, false, "", "") {
                    extend_segs(&mut inner, part);
                }
            }
            Attribute::SpreadAttribute(spread) => {
                if let Some(part) = format_spread_attribute_segments(spread, source) {
                    extend_segs(&mut inner, part);
                }
            }
            Attribute::BindDirective(bind) => {
                if bind.name == "this" {
                    continue;
                }
                // Mirror official Binding.ts: a *shorthand* component binding
                // (`bind:value`, no `={…}`) becomes a shorthand object property
                // — just the bound expression (`value`), not `value:value`. The
                // shorthand test is whether the expression starts immediately
                // after `bind:`. Explicit `bind:foo={expr}` stays `foo:expr,`.
                let expr_range = get_expression_range(&bind.expression);
                let is_shorthand = get_set_binding_ranges(&bind.expression, source).is_none()
                    && expr_range.is_some_and(|(s, _)| s == bind.start + "bind:".len() as u32);
                if is_shorthand {
                    let (s, e) = expr_range.unwrap();
                    segs_push_src(&mut inner, s, e);
                    segs_push_lit(&mut inner, ",");
                    continue;
                }
                // Component-side bind:foo={expr} → foo:expr, (no quotes,
                // no `bind:` prefix). Mirrors the JS reference.
                segs_push_lit(&mut inner, &format!("{}:", bind.name));
                if let Some(((gs, ge), (ss, se))) = get_set_binding_ranges(&bind.expression, source)
                {
                    // Svelte 5 function binding `bind:foo={getFn, setFn}` →
                    // `foo:__sveltets_2_get_set_binding(getFn, setFn),` so both
                    // callables are type-checked against the bindable prop type
                    // (mirrors `handleBinding`'s `isGetSetBinding` branch in
                    // `htmlxtojsx_v2/nodes/Binding.ts`). Splicing the raw
                    // `getFn, setFn` tuple into the props literal would produce
                    // invalid TSX (issue #726).
                    segs_push_lit(&mut inner, "__sveltets_2_get_set_binding(");
                    segs_push_src(&mut inner, gs, ge);
                    segs_push_lit(&mut inner, ",");
                    segs_push_src(&mut inner, ss, se);
                    segs_push_lit(&mut inner, ")");
                } else if let Some((s, e)) = get_expression_range(&bind.expression) {
                    // Preserve a trailing TS postfix (`bind:value={value as string}`)
                    // the parser narrowed out of the expression span.
                    let extended = extend_expr_end_with_ts_postfix(source, e, bind.end);
                    segs_push_src(&mut inner, s, extended);
                } else {
                    segs_push_lit(&mut inner, get_expression_text(&bind.expression, source));
                }
                segs_push_lit(&mut inner, ",");
            }
            Attribute::OnDirective(_) => {
                has_on_directives = true;
            }
            Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => {
                // `class:`/`style:` directives are element-only. Official
                // `htmlxtojsx_v2` calls the Class/StyleDirective handlers solely
                // for Elements (never InlineComponents), so on a component they
                // contribute nothing — not even a lowered statement.
            }
            Attribute::TransitionDirective(_) | Attribute::UseDirective(_) => {
                // transition:/in:/out:/use: on a component are not props — they
                // lower to `__sveltets_2_ensureTransition(...)` statements after
                // the `new …({...})` call (see build_component_directive_suffix).
            }
            Attribute::LetDirective(_) => {
                let_count += 1;
            }
            Attribute::AnimateDirective(_) => {
                // animate: lowers to an ensureAnimation suffix, not a prop.
            }
            Attribute::AttachTag(attach) => {
                let part = format_attach_tag_segments(attach, source);
                extend_segs(&mut inner, part);
            }
        }
    }

    let let_spaces = " ".repeat(let_count as usize);
    if segs_is_empty(&inner) {
        if has_on_directives && let_count == 0 {
            vec![Seg::Lit(" ".to_string())]
        } else if let_count > 0 {
            vec![Seg::Lit(let_spaces)]
        } else {
            Vec::new()
        }
    } else {
        let mut out: Vec<Seg> = Vec::with_capacity(inner.len() + 1);
        out.push(Seg::Lit(format!(" {}", let_spaces)));
        out.extend(inner);
        out
    }
}

/// Collect references to all `on:` directives from an attribute list.
fn get_on_directives<'a>(attributes: &'a [Attribute<'a>]) -> Vec<&'a OnDirective<'a>> {
    attributes
        .iter()
        .filter_map(|attr| match attr {
            Attribute::OnDirective(on) => Some(on),
            _ => None,
        })
        .collect()
}

/// Build `.$on()` call strings for a set of on directives.
///
/// Each directive becomes `inst.$on("eventName", handler);`
/// If no handler expression, uses `() => {}`.
fn build_on_calls(inst_var: &str, on_directives: &[&OnDirective], source: &str) -> String {
    let mut calls = String::new();
    for on in on_directives {
        let handler = if let Some(ref expr) = on.expression {
            get_expression_text(expr, source).to_string()
        } else {
            "() => {}".to_string()
        };
        let _ = write!(calls, "{}.$on(\"{}\", {});", inst_var, on.name, handler);
    }
    calls
}

/// Format a regular attribute: `name="value"` → `"name":\`value\`,`
///
/// Shorthand attributes like `{propB}` (where name equals expression text)
/// produce `propB,` instead of `"propB":propB,`.
///
/// Wrapping rules (mirrors `htmlxtojsx_v2/nodes/Attribute.ts` `addAttribute`):
/// - `is_element` && name starts with `data-` (but NOT `data-sveltekit-`):
///   `...__sveltets_2_empty({ "data-foo": value })` — boolean/no-value → `__sveltets_2_any()`.
/// - `!is_element` && name starts with `--`:
///   `...__sveltets_2_cssProp({ "--x": value })` — boolean/no-value → `""`.
fn format_attribute_node(node: &AttributeNode, source: &str, is_element: bool) -> Option<String> {
    let name = &node.name;

    // Determine wrapping: data-* on elements, --* on components.
    let is_data_attr =
        is_element && name.starts_with("data-") && !name.starts_with("data-sveltekit-");
    let is_css_prop = !is_element && name.starts_with("--");

    /// Wrap the inner `"name":value` (without trailing comma) in the
    /// appropriate helper and re-attach the comma.
    fn wrap(inner: &str, is_data: bool, is_css: bool) -> String {
        if is_data {
            format!("...__sveltets_2_empty({{{}}}),", inner)
        } else if is_css {
            format!("...__sveltets_2_cssProp({{{}}}),", inner)
        } else {
            format!("{},", inner)
        }
    }

    match &node.value {
        AttributeValue::True(_) => {
            // Boolean attribute: `disabled` → `"disabled":true,`
            // For data-* on elements the boolean value is still `true` — official
            // wraps it as `...__sveltets_2_empty({ "data-foo": true })`. (The
            // `__sveltets_2_any()` fallback in upstream `Attribute.ts` only applies
            // when the attribute has no value at all, which never happens for a
            // boolean attribute.)
            // For --* on components: boolean means no value → ""
            if is_data_attr {
                Some(format!("...__sveltets_2_empty({{\"{}\":true}}),", name))
            } else if is_css_prop {
                Some(format!("...__sveltets_2_cssProp({{\"{}\":\"\"}}),", name))
            } else {
                Some(format!("\"{}\":true,", name))
            }
        }
        AttributeValue::Expression(expr) => {
            // Expression value: `name={expr}` → `"name":expr,`
            let expr_text = get_expression_text(&expr.expression, source);
            // Shorthand iff the source was written `{name}`. The parser sets the
            // value ExpressionTag's start to `node.start + 1` (right after `{`)
            // for shorthand; an explicit `name={expr}` puts it past `name=`.
            // Mirrors official's `AttributeShorthand` type check — explicit
            // `name={name}` must stay `"name":name`, not collapse to `name`.
            // Shorthand names are plain identifiers so they cannot start with
            // `data-` or `--`; skip wrapping for them.
            if expr.start == node.start + 1 {
                Some(format!("{},", name))
            } else {
                let inner = format!("\"{}\":{}", name, expr_text);
                Some(wrap(&inner, is_data_attr, is_css_prop))
            }
        }
        AttributeValue::Sequence(parts) => {
            // Special case: if the sequence is a single expression like `e="{b}"`,
            // output `"e":b,` (just the expression value) instead of `"e":\`${b}\`,`
            if parts.len() == 1
                && let AttributeValuePart::ExpressionTag(expr) = &parts[0]
            {
                let expr_text = get_expression_text(&expr.expression, source);
                let inner = format!("\"{}\":{}", name, expr_text);
                return Some(wrap(&inner, is_data_attr, is_css_prop));
            }

            // Pure-static empty value (`class=""`): emit the quoted empty
            // string, matching official (not an empty template literal).
            let has_expr = parts
                .iter()
                .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));
            let text_is_empty = parts.iter().all(|p| match p {
                AttributeValuePart::Text(t) => t.raw.is_empty(),
                AttributeValuePart::ExpressionTag(_) => false,
            });
            if !has_expr && text_is_empty {
                return Some(wrap(
                    &format!("\"{}\":\"\"", name),
                    is_data_attr,
                    is_css_prop,
                ));
            }

            // Text or mixed content: `name="text {expr} text"` → `"name":\`text ${expr} text\`,`
            let mut value_parts = Vec::new();
            for part in parts {
                match part {
                    AttributeValuePart::Text(text) => {
                        // Escape backslash first (so a Windows path like
                        // `C:\new\test` doesn't turn `\n` / `\t` into control
                        // characters inside the template literal), then backtick
                        // and `$`. H-091.
                        let escaped = text
                            .raw
                            .replace('\\', "\\\\")
                            .replace('`', "\\`")
                            .replace('$', "\\$");
                        value_parts.push(escaped);
                    }
                    AttributeValuePart::ExpressionTag(expr) => {
                        let expr_text = get_expression_text(&expr.expression, source);
                        value_parts.push(format!("${{{}}}", expr_text));
                    }
                }
            }
            let inner = format!("\"{}\":`{}`", name, value_parts.join(""));
            Some(wrap(&inner, is_data_attr, is_css_prop))
        }
    }
}

/// Structured-bake variant of [`format_attribute_node`]. Wraps every
/// expression site in `Seg::Src` so the resulting MagicString chunks
/// retain per-character source-map fidelity.
/// HTML attributes whose `svelte/elements` type is `number | undefined | null`
/// (no `string`). A static string value (`tabindex="-1"`) must be lowered to a
/// bare number to type-check. List mirrors svelte2tsx's `numberOnlyAttributes`
/// (`htmlxtojsx_v2/nodes/Attribute.ts`), itself derived from `elements.d.ts`.
fn is_number_only_attribute(name: &str) -> bool {
    const NUMBER_ONLY: &[&str] = &[
        "aria-colcount",
        "aria-colindex",
        "aria-colspan",
        "aria-level",
        "aria-posinset",
        "aria-rowcount",
        "aria-rowindex",
        "aria-rowspan",
        "aria-setsize",
        "aria-valuemax",
        "aria-valuemin",
        "aria-valuenow",
        "results",
        "span",
        "marginheight",
        "marginwidth",
        "maxlength",
        "minlength",
        "currenttime",
        "defaultplaybackrate",
        "volume",
        "high",
        "low",
        "optimum",
        "start",
        "size",
        "border",
        "cols",
        "rows",
        "colspan",
        "rowspan",
        "tabindex",
    ];
    let lower = name.to_ascii_lowercase();
    NUMBER_ONLY.contains(&lower.as_str())
}

/// Mirror JS `!isNaN(Number(s))` for the number-conversion check: an attribute
/// value coerces to a number. Covers the realistic forms (`-1`, `2`, `1e3`,
/// `0x1f`) and the JS quirk that an all-whitespace value is `0` (not NaN).
fn is_js_numeric(data: &str) -> bool {
    let t = data.trim();
    if t.is_empty() {
        return true; // JS: Number("") === 0
    }
    let lower = t.to_ascii_lowercase();
    // `0x` / `0o` / `0b` integer literals coerce via Number().
    if let Some(rest) = lower.strip_prefix("0x") {
        return !rest.is_empty() && rest.bytes().all(|b| b.is_ascii_hexdigit());
    }
    if let Some(rest) = lower.strip_prefix("0o") {
        return !rest.is_empty() && rest.bytes().all(|b| (b'0'..=b'7').contains(&b));
    }
    if let Some(rest) = lower.strip_prefix("0b") {
        return !rest.is_empty() && rest.bytes().all(|b| matches!(b, b'0' | b'1'));
    }
    // Rust's f64 parser also accepts `inf`/`nan`, which JS `Number` treats as
    // NaN (only `Infinity` coerces). Disambiguate those keyword spellings.
    if matches!(
        lower.as_str(),
        "inf" | "+inf" | "-inf" | "infinity" | "+infinity" | "-infinity" | "nan"
    ) {
        return lower.contains("infinity");
    }
    t.parse::<f64>().is_ok()
}

/// Lowercase an element attribute name so it matches the intrinsic-elements
/// typings, mirroring official `transformAttributeCase`. Preserves the name for
/// SVG attributes, custom elements (tag contains `-`), and svelte-5 `on*` event
/// attributes; non-element (component/slot) attributes are never transformed.
fn transform_attribute_case(name: &str, tag: &str, is_element: bool) -> String {
    let is_custom_element = tag.contains('-');
    if is_element && !is_svg_attribute(name) && !is_custom_element && !name.starts_with("on") {
        name.to_lowercase()
    } else {
        name.to_string()
    }
}

/// Build the leading-comment prefix segs for an attribute starting at
/// `attr_start`: any comments immediately before it (only whitespace between)
/// become `[\n]?<comment-source>…\n` (mirrors official getLeadingComment +
/// getLeadingCommentTransformation). Empty when there are none.
fn leading_attr_comment_segs(attr_start: u32, source: &str) -> Vec<Seg> {
    ELEMENT_OPENER_COMMENTS.with(|c| {
        let comments = c.borrow();
        if comments.is_empty() {
            return Vec::new();
        }
        let mut leading: Vec<(u32, u32)> = Vec::new();
        let mut search_end = attr_start;
        loop {
            let cand = comments
                .iter()
                .copied()
                .filter(|&(_, e)| {
                    e <= search_end
                        && source
                            .get(e as usize..search_end as usize)
                            .is_some_and(|s| s.chars().all(|ch| ch.is_whitespace()))
                })
                .max_by_key(|&(_, e)| e);
            match cand {
                Some((cs, ce)) => {
                    leading.push((cs, ce));
                    search_end = cs;
                }
                None => break,
            }
        }
        if leading.is_empty() {
            return Vec::new();
        }
        leading.reverse();
        let mut out = Vec::new();
        for (cs, ce) in &leading {
            let region = slice_src(source, cs.saturating_sub(100) as usize, *cs as usize);
            if region.trim_end_matches([' ', '\t']).ends_with('\n') {
                segs_push_lit(&mut out, "\n");
            }
            segs_push_src(&mut out, *cs, *ce);
        }
        segs_push_lit(&mut out, "\n");
        out
    })
}

/// Structured-bake variant of [`format_attribute_node`]. Wraps every
/// expression site in `Seg::Src` so the resulting MagicString chunks
/// retain per-character source-map fidelity.
///
/// Applies the same wrapping rules as `format_attribute_node`:
/// - `is_element` && `data-*` (not `data-sveltekit-*`) → `__sveltets_2_empty({…})`
/// - `!is_element` && `--*` → `__sveltets_2_cssProp({…})`
///
/// (Mirrors `htmlxtojsx_v2/nodes/Attribute.ts` `addAttribute`.)
fn format_attribute_node_segments(
    node: &AttributeNode,
    source: &str,
    is_element: bool,
    tag: &str,
    leading_comment: &str,
) -> Option<Vec<Seg>> {
    let leading = leading_attr_comment_segs(node.start, source);
    let is_data_attr =
        is_element && node.name.starts_with("data-") && !node.name.starts_with("data-sveltekit-");
    let is_css_prop = !is_element && node.name.starts_with("--");
    // Element attribute names are lowercased to match intrinsic typings
    // (`defaultValue` → `defaultvalue`); component/slot names are preserved.
    let name_owned = transform_attribute_case(&node.name, tag, is_element);
    let name = name_owned.as_str();

    // Helper: prepend/append the wrapper literals around a segment list that
    // already represents the `"name":value` content (no trailing comma).
    // Returns the final list with the trailing comma appended.
    // Leading comments go INSIDE the data-*/css-prop wrapper (right after `{`),
    // or directly before the `name:value` for a plain attribute — mirroring
    // official `getLeadingCommentTransformation` placement on the attribute.
    let wrap_segs = |mut inner: Vec<Seg>| -> Vec<Seg> {
        if is_data_attr {
            let mut out = Vec::with_capacity(inner.len() + leading.len() + 2);
            segs_push_lit(&mut out, "...__sveltets_2_empty({");
            out.extend(leading.iter().cloned());
            out.append(&mut inner);
            segs_push_lit(&mut out, "}),");
            out
        } else if is_css_prop {
            let mut out = Vec::with_capacity(inner.len() + leading.len() + 2);
            segs_push_lit(&mut out, "...__sveltets_2_cssProp({");
            out.extend(leading.iter().cloned());
            out.append(&mut inner);
            segs_push_lit(&mut out, "}),");
            out
        } else {
            let mut out = leading.clone();
            out.append(&mut inner);
            segs_push_lit(&mut out, ",");
            out
        }
    };

    let mut out: Vec<Seg> = leading.clone();

    match &node.value {
        AttributeValue::True(_) => {
            // Boolean / valueless attribute.
            // data-* on elements: the boolean value is `true` (official wraps it
            //   as `...__sveltets_2_empty({ "data-foo": true })`; the
            //   `__sveltets_2_any()` fallback only applies to a genuinely
            //   value-less attribute, which a boolean attribute is not).
            // --* on components: no-value → ""
            // Others: true
            if is_data_attr {
                segs_push_lit(
                    &mut out,
                    &format!(
                        "...__sveltets_2_empty({{{leading_comment}\"{}\":true}}),",
                        name
                    ),
                );
            } else if is_css_prop {
                segs_push_lit(
                    &mut out,
                    &format!("...__sveltets_2_cssProp({{\"{}\":\"\"}}),", name),
                );
            } else {
                segs_push_lit(&mut out, &format!("\"{}\":true,", name));
            }
            Some(out)
        }
        AttributeValue::Expression(expr) => {
            let expr_range = get_expression_range(&expr.expression);
            let expr_text = get_expression_text(&expr.expression, source);
            // Shorthand iff written `{name}`: the value ExpressionTag starts at
            // `node.start + 1` (right after `{`). Explicit `name={name}` keeps
            // the full `"name":name` form (mirrors `AttributeShorthand`).
            let is_shorthand = expr.start == node.start + 1;

            // Shorthand identifiers can't start with `data-` or `--` — no wrap.
            if let Some((s, e)) = expr_range {
                if is_shorthand {
                    segs_push_src(&mut out, s, e);
                    segs_push_lit(&mut out, ",");
                } else {
                    // Preserve a trailing TS postfix the parser narrowed out of
                    // the expression span (`attr={false as true}` → keep
                    // `false as true`, not `false`), same as expression tags.
                    let bytes = source.as_bytes();
                    let mut c = node.end as usize;
                    while c > e as usize && bytes[c - 1] != b'}' {
                        c -= 1;
                    }
                    let close = c.saturating_sub(1);
                    let tail = source.get(e as usize..close).unwrap_or("").trim_start();
                    let (s, e) = if close > e as usize
                        && (tail.starts_with("as ")
                            || tail.starts_with("satisfies ")
                            || tail.starts_with('!'))
                    {
                        (s, close as u32)
                    } else if close > e as usize && tail.starts_with(')') && {
                        let after = tail[1..].trim_start();
                        after.starts_with("as ")
                            || after.starts_with("satisfies ")
                            || after.starts_with('!')
                    } {
                        // A redundant-paren-wrapped expression carrying a TS
                        // postfix (`attr={((e) => {…}) satisfies T}`): the parser
                        // narrows the span to the inner expression, so widen back
                        // to the wrapping `(` and forward past the `) satisfies T`
                        // tail to keep the whole (balanced) cast.
                        let mut ps = s as usize;
                        while ps > 0 && bytes[ps - 1].is_ascii_whitespace() {
                            ps -= 1;
                        }
                        if ps > 0 && bytes[ps - 1] == b'(' {
                            ((ps - 1) as u32, close as u32)
                        } else {
                            (s, e)
                        }
                    } else {
                        (s, e)
                    };
                    let mut inner: Vec<Seg> = Vec::new();
                    segs_push_lit(&mut inner, &format!("\"{}\":", name));
                    segs_push_src(&mut inner, s, e);
                    return Some(wrap_segs(inner));
                }
            } else if is_shorthand {
                segs_push_lit(&mut out, &format!("{},", name));
            } else {
                let mut inner: Vec<Seg> = Vec::new();
                segs_push_lit(&mut inner, &format!("\"{}\":{}", name, expr_text));
                return Some(wrap_segs(inner));
            }
            Some(out)
        }
        AttributeValue::Sequence(parts) => {
            // Single-expression sequence stays as a bare expression — same
            // shape as the `Expression` arm.
            if parts.len() == 1
                && let AttributeValuePart::ExpressionTag(expr) = &parts[0]
            {
                let range = get_expression_range(&expr.expression);
                let mut inner: Vec<Seg> = Vec::new();
                segs_push_lit(&mut inner, &format!("\"{}\":", name));
                if let Some((s, e)) = range {
                    segs_push_src(&mut inner, s, e);
                } else {
                    segs_push_lit(&mut inner, get_expression_text(&expr.expression, source));
                }
                return Some(wrap_segs(inner));
            }

            // Numeric DOM attribute written as a string literal (`tabindex="-1"`,
            // `colspan="2"`, …). `svelte/elements` types these as `number`, so a
            // backtick string fails to type-check; emit the value as a bare
            // number instead — but only on a real element (component props keep
            // the author's string), only for the `numberOnlyAttributes` set, and
            // only when the value actually coerces to a number (#939). Mirrors
            // svelte2tsx's `needsNumberConversion` in `Attribute.ts`.
            // Note: number-only attributes (tabindex, colspan, etc.) cannot start
            // with `data-` or `--`, so no extra wrap is needed here.
            if is_element
                && parts.len() == 1
                && let AttributeValuePart::Text(text) = &parts[0]
                && is_number_only_attribute(name)
                && !text.data.trim().is_empty()
                && is_js_numeric(&text.data)
            {
                segs_push_lit(&mut out, &format!("\"{}\":", name));
                segs_push_src(&mut out, text.start, text.end);
                segs_push_lit(&mut out, ",");
                return Some(out);
            }

            // Pure-static empty value (`class=""`, `href=""`): official emits
            // the source's quoted empty string (`""`), not an empty template
            // literal (` `` `), and oxfmt preserves the difference. Emit `""`.
            let has_expr = parts
                .iter()
                .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));
            let text_is_empty = parts.iter().all(|p| match p {
                AttributeValuePart::Text(t) => t.raw.is_empty(),
                AttributeValuePart::ExpressionTag(_) => false,
            });
            if !has_expr && text_is_empty {
                let mut inner: Vec<Seg> = Vec::new();
                segs_push_lit(&mut inner, &format!("\"{}\":\"\"", name));
                return Some(wrap_segs(inner));
            }

            // Single static Text value: mirror official Attribute.ts. The quote
            // is a backtick UNLESS the DECODED value contains a backtick, in which
            // case the source quote (`"`/`'`) is used. The value is the raw source
            // range unless it contains `\` (or a newline in the non-template case),
            // when it is JSON-escaped — so `title="`${x}\n`"` → `"`${x}\\n`"`.
            if !has_expr
                && parts.len() == 1
                && let AttributeValuePart::Text(text) = &parts[0]
            {
                let data = text.data.as_ref();
                let has_backtick = data.contains('`');
                let quote = if !has_backtick {
                    '`'
                } else {
                    match text
                        .start
                        .checked_sub(1)
                        .map(|i| source.as_bytes()[i as usize])
                    {
                        Some(b'\'') => '\'',
                        _ => '"',
                    }
                };
                let needs_escape = data.contains('\\') || (has_backtick && data.contains('\n'));
                let mut inner: Vec<Seg> = Vec::new();
                segs_push_lit(&mut inner, &format!("\"{}\":{}", name, quote));
                if needs_escape {
                    let json =
                        serde_json::to_string(data).unwrap_or_else(|_| format!("\"{}\"", data));
                    segs_push_lit(&mut inner, &json[1..json.len() - 1]);
                } else {
                    segs_push_src(&mut inner, text.start, text.end);
                }
                segs_push_lit(&mut inner, &quote.to_string());
                return Some(wrap_segs(inner));
            }

            // Mixed text + expression sequence → template literal. Each
            // `${EXPR}` slot still preserves the expression chunk.
            let mut inner: Vec<Seg> = Vec::new();
            segs_push_lit(&mut inner, &format!("\"{}\":`", name));
            for part in parts {
                match part {
                    AttributeValuePart::Text(text) => {
                        // Official slices the raw source verbatim into the
                        // template literal (Attribute.ts), so a backslash stays
                        // single (`back\slash`); only the template-literal
                        // delimiters (`` ` `` / `${`) need escaping.
                        let escaped = text.raw.replace('`', "\\`").replace("${", "\\${");
                        segs_push_lit(&mut inner, &escaped);
                    }
                    AttributeValuePart::ExpressionTag(expr) => {
                        let range = get_expression_range(&expr.expression);
                        segs_push_lit(&mut inner, "${");
                        if let Some((s, e)) = range {
                            segs_push_src(&mut inner, s, e);
                        } else {
                            segs_push_lit(
                                &mut inner,
                                get_expression_text(&expr.expression, source),
                            );
                        }
                        segs_push_lit(&mut inner, "}");
                    }
                }
            }
            segs_push_lit(&mut inner, "`");
            Some(wrap_segs(inner))
        }
    }
}

/// Structured-bake variant of [`format_spread_attribute`].
/// When a trailing TS postfix is present the spread operand is parenthesised:
/// `{...expr as T}` → `...(expr as T),` (mirrors upstream Spread.ts + paren rule).
fn format_spread_attribute_segments(spread: &SpreadAttribute, source: &str) -> Option<Vec<Seg>> {
    let mut out = Vec::new();
    if let Some((s, e)) = get_expression_range(&spread.expression) {
        let extended = extend_expr_end_with_ts_postfix(source, e, spread.end);
        if extended > e {
            // Has TS postfix — wrap in parens.
            segs_push_lit(&mut out, "...(");
            segs_push_src(&mut out, s, e);
            // The postfix text (e.g. " as T") is a literal because it's outside
            // the expression's AST span; include it then close the paren.
            segs_push_lit(&mut out, slice_src(source, e as usize, extended as usize));
            segs_push_lit(&mut out, "),");
        } else {
            segs_push_lit(&mut out, "...");
            segs_push_src(&mut out, s, e);
            segs_push_lit(&mut out, ",");
        }
    } else {
        segs_push_lit(&mut out, "...");
        segs_push_lit(&mut out, get_expression_text(&spread.expression, source));
        segs_push_lit(&mut out, ",");
    }
    Some(out)
}

/// Structured-bake variant of [`format_bind_directive`].
fn format_bind_directive_segments(bind: &BindDirective, source: &str) -> Vec<Seg> {
    let mut out = Vec::new();
    segs_push_lit(&mut out, &format!("\"bind:{}\":", bind.name));
    if let Some(((gs, ge), (ss, se))) = get_set_binding_ranges(&bind.expression, source) {
        // Svelte 5 function binding on an element: `bind:value={getFn, setFn}`
        // → `"bind:value":__sveltets_2_get_set_binding(getFn, setFn),`
        // (mirrors the `isGetSetBinding` branch in upstream Binding.ts).
        segs_push_lit(&mut out, "__sveltets_2_get_set_binding(");
        segs_push_src(&mut out, gs, ge);
        segs_push_lit(&mut out, ",");
        segs_push_src(&mut out, ss, se);
        segs_push_lit(&mut out, ")");
    } else if let Some((s, e)) = get_expression_range(&bind.expression) {
        // Keep a trailing TS postfix (`bind:value={binding!}` → `binding!`,
        // `… as number}` → `… as number`) that the parser narrowed off.
        let e = extend_expr_end_with_ts_postfix(source, e, bind.end);
        segs_push_src(&mut out, s, e);
    } else {
        segs_push_lit(&mut out, get_expression_text(&bind.expression, source));
    }
    segs_push_lit(&mut out, ",");
    out
}

/// Structured-bake variant of [`format_on_directive`].
fn format_on_directive_segments(on: &OnDirective, source: &str) -> Vec<Seg> {
    let mut out = Vec::new();
    if let Some(ref expr) = on.expression {
        segs_push_lit(&mut out, &format!("\"on:{}\":", on.name));
        if let Some((s, e)) = get_expression_range(expr) {
            segs_push_src(&mut out, s, e);
        } else {
            segs_push_lit(&mut out, get_expression_text(expr, source));
        }
        segs_push_lit(&mut out, ",");
    } else {
        // Event forwarding has no expression to preserve.
        segs_push_lit(&mut out, &format!("\"on:{}\":undefined,", on.name));
    }
    out
}

/// Lower `class:` / `style:` directives as statements appended *after* the
/// element's `svelteHTML.createElement(...)` call, instead of as keys in the
/// (typed) props object. Mirrors upstream `htmlxtojsx_v2/nodes/Class.ts`
/// (`class:xx={yyy}` → `yyy;`) and `StyleDirective.ts`
/// (`style:xx={yy}` → `__sveltets_2_ensureType(String, Number, yy);`). The
/// expression chunks are preserved as `Seg::Src` so type errors map back to
/// the original column.
fn build_class_style_directive_suffix_segments(attributes: &[Attribute], source: &str) -> Vec<Seg> {
    let mut out: Vec<Seg> = Vec::new();
    for attr in attributes {
        if let Some(segs) = class_style_directive_seg(attr, source) {
            out.extend(segs);
        }
    }
    out
}

/// Per-attribute variant of [`build_class_style_directive_suffix_segments`]:
/// returns the suffix segments for a single `class:` / `style:` directive (or
/// `None` for any other attribute). Used both by the grouped builder above and
/// by the source-order unified element-suffix builder so each directive can be
/// interleaved with `transition:` / `bind:` statements at its own position.
fn class_style_directive_seg(attr: &Attribute, source: &str) -> Option<Vec<Seg>> {
    let mut out: Vec<Seg> = Vec::new();
    match attr {
        Attribute::ClassDirective(class) => {
            // `class:xx={expr}` → ` expr;` — type-check the toggle
            // expression as a standalone statement.
            segs_push_lit(&mut out, " ");
            if let Some((s, e)) = get_expression_range(&class.expression) {
                segs_push_src(&mut out, s, e);
            } else {
                segs_push_lit(&mut out, get_expression_text(&class.expression, source));
            }
            segs_push_lit(&mut out, ";");
        }
        Attribute::StyleDirective(style) => {
            // `style:xx={expr}` → ` __sveltets_2_ensureType(String, Number, expr);`
            segs_push_lit(&mut out, " __sveltets_2_ensureType(String, Number, ");
            match &style.value {
                AttributeValue::True(_) => {
                    // Shorthand `style:color` → `…, color);` (implicit
                    // reference to the `color` binding; synthesised from
                    // the directive name, so no source range to pin).
                    segs_push_lit(&mut out, &style.name);
                }
                AttributeValue::Expression(expr) => {
                    if let Some((s, e)) = get_expression_range(&expr.expression) {
                        segs_push_src(&mut out, s, e);
                    } else {
                        segs_push_lit(&mut out, get_expression_text(&expr.expression, source));
                    }
                }
                // Mirrors upstream StyleDirective.ts. svelte2tsx moves the
                // value range into the element's attrs object, so the
                // ensureType reference is left with the BLANKED text — every
                // static text run collapses to a single space. Hence:
                //   `style:x="red"`  → `, " ");`            (single text → " ")
                //   `style:x={y}`    → `, y);`              (single expr → bare)
                //   `style:x="a{b}"` → `, ` ${b}`);`        (text→space, expr kept)
                // Empty value (`style:--c=""`): official emits the empty
                // string `""` (single-Text branch with a zero-length text
                // range), not an empty template literal.
                AttributeValue::Sequence(parts) if parts.is_empty() => {
                    segs_push_lit(&mut out, "\"\"");
                }
                AttributeValue::Sequence(parts) if parts.len() == 1 => match &parts[0] {
                    AttributeValuePart::Text(_) => {
                        segs_push_lit(&mut out, "\" \"");
                    }
                    AttributeValuePart::ExpressionTag(expr) => {
                        if let Some((s, e)) = get_expression_range(&expr.expression) {
                            segs_push_src(&mut out, s, e);
                        } else {
                            segs_push_lit(&mut out, get_expression_text(&expr.expression, source));
                        }
                    }
                },
                AttributeValue::Sequence(parts) => {
                    // Multi-part: a template literal. Official blanks each
                    // static text run to ONLY its whitespace chars (the
                    // element processing overwrites the non-whitespace), so
                    // `rgb({c}, 0, 0)` → `` ` ${c}  ` `` (", 0, 0)" keeps its
                    // two spaces). A run with no whitespace collapses to a
                    // single space.
                    segs_push_lit(&mut out, "`");
                    for part in parts {
                        match part {
                            AttributeValuePart::Text(t) => {
                                let ws: String =
                                    t.data.chars().filter(|c| c.is_whitespace()).collect();
                                segs_push_lit(&mut out, if ws.is_empty() { " " } else { &ws });
                            }
                            AttributeValuePart::ExpressionTag(expr) => {
                                segs_push_lit(&mut out, "${");
                                if let Some((s, e)) = get_expression_range(&expr.expression) {
                                    segs_push_src(&mut out, s, e);
                                } else {
                                    segs_push_lit(
                                        &mut out,
                                        get_expression_text(&expr.expression, source),
                                    );
                                }
                                segs_push_lit(&mut out, "}");
                            }
                        }
                    }
                    segs_push_lit(&mut out, "`");
                }
            }
            segs_push_lit(&mut out, ");");
        }
        _ => return None,
    }
    Some(out)
}

/// Structured-bake variant of the `@attach` tag's inline emission.
fn format_attach_tag_segments(attach: &AttachTag, source: &str) -> Vec<Seg> {
    let mut out = Vec::new();
    segs_push_lit(&mut out, "[Symbol(\"@attach\")]:");
    if let Some((s, e)) = get_expression_range(&attach.expression) {
        segs_push_src(&mut out, s, e);
    } else {
        segs_push_lit(&mut out, get_expression_text(&attach.expression, source));
    }
    segs_push_lit(&mut out, ",");
    out
}

/// Format a spread attribute: `{...expr}` → `...expr,`, or `{...expr as T}` → `...(expr as T),`.
/// When a trailing TS postfix (`as T`, `satisfies T`, `!`) is present the
/// spread operand must be parenthesised — `...expr as T` is a parse error in
/// TSX, but `...(expr as T)` is valid (mirrors upstream Spread.ts slicing
/// `[node.start+1, node.end-1]` and Element/InlineComponent context).
fn format_spread_attribute(spread: &SpreadAttribute, source: &str) -> Option<String> {
    if let Some((s, e)) = get_expression_range(&spread.expression) {
        let extended = extend_expr_end_with_ts_postfix(source, e, spread.end);
        if extended > e {
            // Has TS postfix — wrap in parens so `...expr as T` becomes `...(expr as T)`.
            let postfix = slice_src(source, e as usize, extended as usize);
            let expr_text = slice_src(source, s as usize, e as usize);
            return Some(format!("...({}{postfix}),", expr_text));
        }
        let expr_text = slice_src(source, s as usize, e as usize);
        return Some(format!("...{},", expr_text));
    }
    let expr_text = get_expression_text(&spread.expression, source);
    Some(format!("...{},", expr_text))
}

/// Format a bind directive: `bind:name={expr}` → `"bind:name":expr,`. A Svelte
/// 5 function binding `bind:name={getFn, setFn}` becomes
/// `"bind:name":__sveltets_2_get_set_binding(getFn, setFn),`.
fn format_bind_directive(bind: &BindDirective, source: &str) -> String {
    if let Some(((gs, ge), (ss, se))) = get_set_binding_ranges(&bind.expression, source) {
        return format!(
            "\"bind:{}\":__sveltets_2_get_set_binding({},{}),",
            bind.name,
            slice_src(source, gs as usize, ge as usize),
            slice_src(source, ss as usize, se as usize),
        );
    }
    let expr_text = get_expression_text(&bind.expression, source);
    format!("\"bind:{}\":{},", bind.name, expr_text)
}

/// One-way HTML element bindings whose value reflects an element property
/// (`clientWidth`, etc.). Mirrors the JS reference's `oneWayBindingAttributes`
/// in `htmlxtojsx_v2/nodes/Binding.ts`.
fn is_one_way_binding_attribute(name: &str) -> bool {
    matches!(
        name,
        "clientWidth"
            | "clientHeight"
            | "offsetWidth"
            | "offsetHeight"
            | "duration"
            | "seeking"
            | "ended"
            | "readyState"
            | "naturalWidth"
            | "naturalHeight"
    )
}

/// One-way bindings whose property is *not* on the element directly — they
/// expose values like `DOMRectReadOnly` that need a typed null assignment.
/// Mirrors `oneWayBindingAttributesNotOnElement` in Binding.ts.
fn one_way_binding_not_on_element_type(name: &str) -> Option<&'static str> {
    Some(match name {
        "contentRect" => "DOMRectReadOnly",
        "contentBoxSize" => "ResizeObserverSize[]",
        "borderBoxSize" => "ResizeObserverSize[]",
        "devicePixelContentBoxSize" => "ResizeObserverSize[]",
        "buffered" => "import('svelte/elements').SvelteMediaTimeRange[]",
        "played" => "import('svelte/elements').SvelteMediaTimeRange[]",
        "seekable" => "import('svelte/elements').SvelteMediaTimeRange[]",
        _ => return None,
    })
}

fn is_one_way_bind(name: &str) -> bool {
    is_one_way_binding_attribute(name) || one_way_binding_not_on_element_type(name).is_some()
}

/// Whether a `bind:` directive should be filtered out of the createElement
/// props (because it gets emitted via a typed assignment after createElement).
fn bind_is_filtered_from_props(name: &str, parent_tag: &str) -> bool {
    name == "this" || is_one_way_bind(name) || (name == "group" && parent_tag == "input")
}

/// Whether a `bind:` directive forces declaration of an element variable
/// (`const $$_div0 = svelteHTML.createElement(...)`) so the assignment can
/// reference it. Mirrors the JS reference's `referencedName` flag in
/// `htmlxtojsx_v2/nodes/Element.ts`.
fn bind_needs_element_var(name: &str) -> bool {
    name == "this" || is_one_way_binding_attribute(name)
}

/// Build the suffix appended right after the `svelteHTML.createElement(...)`
/// call for all `bind:` directives on a regular HTML element. Mirrors the
/// branches of `htmlxtojsx_v2/nodes/Binding.ts::handleBinding`:
///
/// - `bind:this`               → `<expr> = <element_var>;`
/// - one-way (clientWidth, …)  → `<expr>= <element_var>.<attr>;`
/// - one-way-not-on-element    → `<expr>= /** @type {T} */ (null);` (typed null)
/// - any other `bind:foo`      → keeps the prop, then appends an
///   ignored-comments-wrapped `() => <expr> = __sveltets_2_any(null);` so TS
///   widens the type.
fn build_bind_directive_suffix(
    attributes: &[Attribute],
    source: &str,
    element_var: Option<&str>,
    parent_tag: &str,
    is_ts_file: bool,
) -> String {
    let mut out = String::new();
    for attr in attributes {
        let Attribute::BindDirective(bind) = attr else {
            continue;
        };
        out.push_str(&bind_directive_suffix_seg(
            bind,
            source,
            element_var,
            parent_tag,
            is_ts_file,
        ));
    }
    out
}

/// Per-attribute variant of [`build_bind_directive_suffix`]: returns the
/// suffix string for a single `bind:` directive. Used both by the grouped
/// builder above and by the source-order unified element-suffix builder.
fn bind_directive_suffix_seg(
    bind: &BindDirective,
    source: &str,
    element_var: Option<&str>,
    parent_tag: &str,
    is_ts_file: bool,
) -> String {
    let mut out = String::new();
    {
        // Svelte 5 function binding `bind:foo={getFn, setFn}`: the get/set
        // pair is checked via `__sveltets_2_get_set_binding(...)` in the
        // attribute list, so the one-way / group / generic type-widener
        // suffixes (all guarded by `if (!isGetSetBinding)` upstream) are
        // skipped. `bind:this={getFn, setFn}` instead invokes the setter
        // with the element instance: `(setFn)(var);` (mirrors Binding.ts).
        if let Some((_, (ss, se))) = get_set_binding_ranges(&bind.expression, source) {
            if bind.name == "this"
                && let Some(var) = element_var
            {
                let _ = write!(
                    out,
                    "({})({});",
                    slice_src(source, ss as usize, se as usize),
                    var
                );
            }
            return out;
        }
        // Every branch here emits `expr` as an assignment LHS, so a trailing TS
        // assertion must be stripped (mirrors upstream `getEnd(attr.expression)`).
        let expr_text = get_binding_lhs_text(&bind.expression, source);
        if bind.name == "this" {
            if let Some(var) = element_var {
                // A trailing TS postfix on the bind expression
                // (`bind:this={el as HTMLElement}`) moves onto the RHS var:
                // `el = $$_var as HTMLElement;` (mirrors Binding.ts appending
                // `[getEnd, expression.end]` after the assignment).
                let postfix = get_expression_range(&bind.expression)
                    .map(|(_, e)| {
                        let ge =
                            get_expression_end_stripping_ts(&bind.expression, source).unwrap_or(e);
                        let ee = extend_expr_end_with_ts_postfix(source, e, bind.end);
                        slice_src(source, ge as usize, ee as usize)
                    })
                    .unwrap_or("");
                let _ = write!(out, "{} = {}{};", expr_text, var, postfix);
            }
        } else if bind.name == "group" && parent_tag == "input" {
            // `bind:group` on `<input>` only gets a type-widening
            // assignment; mirrors the dedicated branch in
            // `htmlxtojsx_v2/nodes/Binding.ts::handleBinding`.
            let _ = write!(out, "{} = __sveltets_2_any(null);", expr_text);
        } else if let Some(ty) = one_way_binding_not_on_element_type(&bind.name) {
            // Official uses `null as Type` whenever `isTsFile || !emitJsDoc`;
            // `emitJsDoc` defaults to false, so the TS-syntax form is used even
            // in a plain `<script>` component (the JSDoc form would only appear
            // under an explicit emitJsDoc run, which the corpus does not use).
            let _ = is_ts_file;
            let value = format!("null as {}", ty);
            let _ = write!(
                out,
                "{}= /*\u{03A9}ignore_start\u{03A9}*/{}/*\u{03A9}ignore_end\u{03A9}*/;",
                expr_text, value
            );
        } else if is_one_way_binding_attribute(&bind.name) {
            if let Some(var) = element_var {
                let _ = write!(out, "{}= {}.{};", expr_text, var, bind.name);
            }
        } else {
            // Generic two-way binding: type-widener so TS doesn't infer
            // an overly-narrow type.
            let _ = write!(
                out,
                "/*\u{03A9}ignore_start\u{03A9}*/() => {} = __sveltets_2_any(null);/*\u{03A9}ignore_end\u{03A9}*/",
                expr_text
            );
        }
    }
    out
}

/// Build the post-`createElement(...)` suffix statements for an element's
/// `class:` / `style:` / `transition:` / `in:` / `out:` / `animate:` / `bind:`
/// directives in a SINGLE source-order pass over the attributes.
///
/// Official (`htmlxtojsx_v2/nodes/Element.ts`) appends every such directive's
/// statement onto `startEndTransformation` as the htmlx walker visits the
/// attributes, so they emit strictly in source order — a `style:` after a
/// `transition:`/`bind:this` stays after it, rather than being grouped with
/// earlier `class:` directives. `el.attributes` is already in source order, so
/// a single dispatch loop reproduces that interleaving exactly. (`use:` actions
/// are NOT here — they are emitted as a `const $$action_N = …` PREFIX before the
/// createElement call.)
fn build_element_directive_suffix_segments(
    attributes: &[Attribute],
    source: &str,
    element_var: Option<&str>,
    parent_tag: &str,
    is_ts_file: bool,
    tag: &str,
) -> Vec<Seg> {
    let mut out: Vec<Seg> = Vec::new();
    for attr in attributes {
        match attr {
            Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => {
                if let Some(segs) = class_style_directive_seg(attr, source) {
                    out.extend(segs);
                }
            }
            Attribute::TransitionDirective(t) => {
                // Preserve a trailing TS postfix on the param expression
                // (`transition:fade={params as ParamsType}`), as Transition.ts does.
                let expr = t.expression.as_ref().map(|e| {
                    if let Some((s, ex)) = get_expression_range(e) {
                        let extended = extend_expr_end_with_ts_postfix(source, ex, t.end);
                        slice_src(source, s as usize, extended as usize)
                    } else {
                        get_expression_text(e, source)
                    }
                });
                segs_push_lit(
                    &mut out,
                    &format_transition_directive_v4(&t.name, expr, tag),
                );
            }
            Attribute::AnimateDirective(a) => {
                let expr = a.expression.as_ref().map(|e| {
                    if let Some((s, ex)) = get_expression_range(e) {
                        let extended = extend_expr_end_with_ts_postfix(source, ex, a.end);
                        slice_src(source, s as usize, extended as usize)
                    } else {
                        get_expression_text(e, source)
                    }
                });
                segs_push_lit(&mut out, &format_animate_directive_v4(&a.name, expr, tag));
            }
            Attribute::BindDirective(bind) => {
                let s =
                    bind_directive_suffix_seg(bind, source, element_var, parent_tag, is_ts_file);
                if !s.is_empty() {
                    segs_push_lit(&mut out, &s);
                }
            }
            _ => {}
        }
    }
    out
}

/// Whether any `bind:` directive on this element forces a `const $$_xxx = …`
/// declaration of the createElement value.
fn any_bind_needs_element_var(attributes: &[Attribute], source: &str) -> bool {
    attributes.iter().any(|attr| {
        matches!(attr, Attribute::BindDirective(b)
            if bind_needs_element_var(&b.name)
                // A get/set binding on a one-way binding *attribute*
                // (`bind:clientWidth={get, set}`) is kept as a
                // `"bind:…": __sveltets_2_get_set_binding(…)` prop, so it needs
                // no element var. `bind:this` always needs the element var
                // (even as get/set — it's applied as `(setter)(elementVar)`).
                && (b.name == "this"
                    || get_set_binding_ranges(&b.expression, source).is_none()))
    })
}

/// The `$$_<base><depth>` element-variable base for a tag, mirroring official
/// `Element.ts`'s constructor: the colon-bearing special elements
/// (`svelte:window` → `sveltewindow`, …) drop the colon; `svelte:element` →
/// `svelteelement`; `slot` → `slot`; everything else (including `svelte:document`)
/// goes through `sanitizePropName` (so `svelte:document` → `svelte_document`).
fn element_var_base_name(name: &str) -> String {
    match name {
        "svelte:options" | "svelte:head" | "svelte:window" | "svelte:body" | "svelte:fragment" => {
            format!("svelte{}", &name["svelte:".len()..])
        }
        "svelte:element" => "svelteelement".to_string(),
        "slot" => "slot".to_string(),
        _ => sanitize_tag_for_var(name),
    }
}

/// Sanitize an HTML/SVG tag name for use as a JavaScript identifier:
/// replaces any non-`[A-Za-z0-9_$]` byte with `_`. Mirrors
/// `sanitizePropName` in the JS reference (sanitization rules are
/// equivalent for the tag-name use case here).
fn sanitize_tag_for_var(name: &str) -> String {
    name.chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
                c
            } else {
                '_'
            }
        })
        .collect()
}

/// Format an on directive: `on:click={handler}` → `"on:click":handler,`
fn format_on_directive(on: &OnDirective, source: &str) -> String {
    if let Some(ref expr) = on.expression {
        let expr_text = get_expression_text(expr, source);
        format!("\"on:{}\":{},", on.name, expr_text)
    } else {
        // Event forwarding: `on:click` → `"on:click":undefined,`
        format!("\"on:{}\":undefined,", on.name)
    }
}

/// Format a class directive: `class:active={expr}` → `"class:active":expr,`
fn format_class_directive(class: &ClassDirective, source: &str) -> String {
    let expr_text = get_expression_text(&class.expression, source);
    format!("\"class:{}\":{},", class.name, expr_text)
}

/// Format a style directive: `style:color={expr}` → `"style:color":expr,`
fn format_style_directive(style: &StyleDirective, source: &str) -> String {
    match &style.value {
        AttributeValue::True(_) => {
            // Shorthand: `style:color` → `"style:color":color,`
            format!("\"style:{}\":{},", style.name, style.name)
        }
        AttributeValue::Expression(expr) => {
            let expr_text = get_expression_text(&expr.expression, source);
            format!("\"style:{}\":{},", style.name, expr_text)
        }
        AttributeValue::Sequence(parts) => {
            let mut value_parts = Vec::new();
            for part in parts {
                match part {
                    AttributeValuePart::Text(text) => {
                        // Escape backslash first so `\n` / `\t` in raw text
                        // (e.g. a Windows path) stay literal. H-091.
                        let escaped = text
                            .raw
                            .replace('\\', "\\\\")
                            .replace('`', "\\`")
                            .replace('$', "\\$");
                        value_parts.push(escaped);
                    }
                    AttributeValuePart::ExpressionTag(expr) => {
                        let expr_text = get_expression_text(&expr.expression, source);
                        value_parts.push(format!("${{{}}}", expr_text));
                    }
                }
            }
            format!("\"style:{}\":`{}`,", style.name, value_parts.join(""))
        }
    }
}

/// Format a transition directive in the JS reference's element-suffix form:
/// `transition:fade={params}` → `__sveltets_2_ensureTransition(fade(svelteHTML.mapElementTag('<tag>'),(params)));`
/// (mirrors `htmlxtojsx_v2/nodes/Transition.ts`). Used as a *suffix*
/// appended after `svelteHTML.createElement(…)`, not as a createElement
/// prop. Expressions like `in:`, `out:`, and `animate:` use the same shape.
fn format_transition_directive_v4(name: &str, expr: Option<&str>, tag: &str) -> String {
    if let Some(expr_text) = expr {
        format!(
            "__sveltets_2_ensureTransition({}(svelteHTML.mapElementTag('{}'),({})));",
            name, tag, expr_text
        )
    } else {
        format!(
            "__sveltets_2_ensureTransition({}(svelteHTML.mapElementTag('{}')));",
            name, tag
        )
    }
}

/// Like `format_transition_directive_v4` but uses
/// `__sveltets_2_ensureAnimation(...)` and adds the
/// `__sveltets_2_AnimationMove` placeholder argument the JS reference
/// passes for `animate:` directives.
fn format_animate_directive_v4(name: &str, expr: Option<&str>, tag: &str) -> String {
    if let Some(expr_text) = expr {
        format!(
            "__sveltets_2_ensureAnimation({}(svelteHTML.mapElementTag('{}'),__sveltets_2_AnimationMove,({})));",
            name, tag, expr_text
        )
    } else {
        format!(
            "__sveltets_2_ensureAnimation({}(svelteHTML.mapElementTag('{}'),__sveltets_2_AnimationMove));",
            name, tag
        )
    }
}

/// Build the directive prefix (action declarations) and suffix
/// (transition / animate calls) that wrap `svelteHTML.createElement(...)`
/// for an HTML element. Mirrors the JS reference's
/// `htmlxtojsx_v2/nodes/{Action,Transition,Animation}.ts`.
///
/// Returns `(prefix, suffix, action_count)`. `prefix` is the sequence of
/// `const $$action_N = __sveltets_2_ensureAction(…);` statements that
/// must be emitted *before* the createElement call; `suffix` collects
/// the transition / animate calls that go *after* it. `action_count`
/// is the number of actions — the createElement's second argument
/// becomes `__sveltets_2_union($$action_0[, $$action_1, …])` when this
/// is non-zero.
fn build_directive_prefix_suffix(
    attributes: &[Attribute],
    source: &str,
    tag: &str,
) -> (String, String, usize) {
    let mut prefix = String::new();
    let mut suffix = String::new();
    let mut action_count = 0usize;

    for attr in attributes {
        match attr {
            Attribute::UseDirective(use_dir) => {
                // Preserve trailing TS postfix on param expression
                // (`use:action={params as ParamsType}` mirrors Transition.ts / Action.ts).
                let expr = use_dir.expression.as_ref().map(|e| {
                    if let Some((s, ex)) = get_expression_range(e) {
                        let extended = extend_expr_end_with_ts_postfix(source, ex, use_dir.end);
                        slice_src(source, s as usize, extended as usize)
                    } else {
                        get_expression_text(e, source)
                    }
                });
                let id = format!("$$action_{}", action_count);
                action_count += 1;
                if let Some(expr_text) = expr {
                    let _ = write!(
                        prefix,
                        "const {} = __sveltets_2_ensureAction({}(svelteHTML.mapElementTag('{}'),({})));",
                        id, use_dir.name, tag, expr_text
                    );
                } else {
                    let _ = write!(
                        prefix,
                        "const {} = __sveltets_2_ensureAction({}(svelteHTML.mapElementTag('{}')));",
                        id, use_dir.name, tag
                    );
                }
            }
            Attribute::TransitionDirective(t) => {
                // Preserve trailing TS postfix on param expression
                // (`transition:fade={params as ParamsType}` mirrors Transition.ts).
                let expr = t.expression.as_ref().map(|e| {
                    if let Some((s, ex)) = get_expression_range(e) {
                        let extended = extend_expr_end_with_ts_postfix(source, ex, t.end);
                        slice_src(source, s as usize, extended as usize)
                    } else {
                        get_expression_text(e, source)
                    }
                });
                suffix.push_str(&format_transition_directive_v4(&t.name, expr, tag));
            }
            Attribute::AnimateDirective(a) => {
                // Preserve trailing TS postfix on param expression.
                let expr = a.expression.as_ref().map(|e| {
                    if let Some((s, ex)) = get_expression_range(e) {
                        let extended = extend_expr_end_with_ts_postfix(source, ex, a.end);
                        slice_src(source, s as usize, extended as usize)
                    } else {
                        get_expression_text(e, source)
                    }
                });
                suffix.push_str(&format_animate_directive_v4(&a.name, expr, tag));
            }
            _ => {}
        }
    }

    (prefix, suffix, action_count)
}

/// Legacy V5-style transition formatter — kept for non-Element callers
/// (svelte:dynamic-element handlers) that haven't been ported to the V4
/// suffix form yet.
fn format_transition_directive(transition: &TransitionDirective, source: &str) -> Option<String> {
    if let Some(ref expr) = transition.expression {
        let expr_text = get_expression_text(expr, source);
        Some(format!(
            "__sveltets_2_ensureTransition({})(svelteHTML.mapElementTag('{}'), {}),",
            transition.name, "", expr_text
        ))
    } else {
        Some(format!(
            "__sveltets_2_ensureTransition({})(svelteHTML.mapElementTag('{}'), {{}}),",
            transition.name, ""
        ))
    }
}

/// Lower `transition:`/`in:`/`out:`/`animate:` directives on a COMPONENT to
/// the suffix statements official emits after `new …({...})`. There is no real
/// element, so the element-tag expression is `undefined.mapElementTag("undefined")`
/// (mirrors upstream Element wrapping a component). `use:` is intentionally not
/// emitted — it is a compile error on a component.
fn build_component_directive_suffix(attributes: &[Attribute], source: &str) -> Vec<Seg> {
    let map_tag = "undefined.mapElementTag(\"undefined\")";
    let mut out: Vec<Seg> = Vec::new();
    for attr in attributes {
        match attr {
            Attribute::TransitionDirective(t) => {
                let s = match t
                    .expression
                    .as_ref()
                    .map(|e| get_expression_text(e, source))
                {
                    Some(expr) => format!(
                        "__sveltets_2_ensureTransition({}({},({})));",
                        t.name, map_tag, expr
                    ),
                    None => format!("__sveltets_2_ensureTransition({}({}));", t.name, map_tag),
                };
                segs_push_lit(&mut out, &s);
            }
            Attribute::AnimateDirective(a) => {
                let s = match a
                    .expression
                    .as_ref()
                    .map(|e| get_expression_text(e, source))
                {
                    Some(expr) => format!(
                        "__sveltets_2_ensureAnimation({}({},__sveltets_2_AnimationMove,({})));",
                        a.name, map_tag, expr
                    ),
                    None => format!(
                        "__sveltets_2_ensureAnimation({}({},__sveltets_2_AnimationMove));",
                        a.name, map_tag
                    ),
                };
                segs_push_lit(&mut out, &s);
            }
            _ => {}
        }
    }
    out
}

/// Legacy V5-style use formatter — see `format_transition_directive`.
fn format_use_directive(use_dir: &UseDirective, source: &str) -> Option<String> {
    if let Some(ref expr) = use_dir.expression {
        let expr_text = get_expression_text(expr, source);
        Some(format!(
            "__sveltets_2_ensureAction({})(svelteHTML.mapElementTag('{}'), {}),",
            use_dir.name, "", expr_text
        ))
    } else {
        Some(format!(
            "__sveltets_2_ensureAction({})(svelteHTML.mapElementTag('{}'), {{}}),",
            use_dir.name, ""
        ))
    }
}

// =============================================================================
// Slot Helpers
// =============================================================================

/// Extract the slot name from a `<slot>` element's attributes.
/// Returns "default" if no `name` attribute is present.
/// Slot name used as the **type** key in the component's `slots: { … }` return.
/// A static `name="header"` yields `header`; a missing name yields `default`; a
/// dynamic `name="{foo}"` (or `name={foo}`) yields the literal `undefined`
/// (official emits `slots: { undefined: {} }` for a non-static slot name).
pub(super) fn slot_name_for_type(attributes: &[Attribute]) -> String {
    for attr in attributes {
        if let Attribute::Attribute(node) = attr
            && node.name == "name"
        {
            match &node.value {
                AttributeValue::Sequence(parts) => {
                    // Dynamic if any part is an expression tag.
                    if parts
                        .iter()
                        .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)))
                    {
                        return "undefined".to_string();
                    }
                    let mut name = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            name.push_str(&text.raw);
                        }
                    }
                    if !name.is_empty() {
                        return name;
                    }
                }
                AttributeValue::Expression(_) => return "undefined".to_string(),
                _ => {}
            }
        }
    }
    "default".to_string()
}

fn get_slot_name(attributes: &[Attribute], source: &str) -> String {
    for attr in attributes {
        if let Attribute::Attribute(node) = attr
            && node.name == "name"
        {
            match &node.value {
                AttributeValue::Sequence(parts) => {
                    // name="header" → parts is a single Text
                    let mut name = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            name.push_str(&text.raw);
                        }
                    }
                    if !name.is_empty() {
                        return name;
                    }
                    // Quoted mustache value, e.g. `name='{foo}'`: official uses
                    // the raw source text of the value verbatim as the slot-name
                    // string (`__sveltets_createSlot("{foo}", …)`). Slice from the
                    // first to the last value part.
                    if let (Some(first), Some(last)) = (parts.first(), parts.last()) {
                        let start = match first {
                            AttributeValuePart::Text(t) => t.start,
                            AttributeValuePart::ExpressionTag(e) => e.start,
                        } as usize;
                        let end = match last {
                            AttributeValuePart::Text(t) => t.end,
                            AttributeValuePart::ExpressionTag(e) => e.end,
                        } as usize;
                        if start < end && end <= source.len() {
                            return source[start..end].to_string();
                        }
                    }
                }
                AttributeValue::Expression(expr) => {
                    // name={expr} - use the expression text
                    return get_expression_text(&expr.expression, source).to_string();
                }
                _ => {}
            }
        }
    }
    "default".to_string()
}

/// Get the `bind:this` expression text from a slot element's attributes.
fn get_bind_this_expr<'a>(attributes: &'a [Attribute], source: &'a str) -> Option<String> {
    for attr in attributes {
        if let Attribute::BindDirective(bind) = attr
            && bind.name == "this"
        {
            return Some(get_expression_text(&bind.expression, source).to_string());
        }
    }
    None
}

/// Build the props string for a `<slot>` element.
///
/// Excludes the `name` attribute and `bind:this` directive.
/// Format matches `__sveltets_createSlot("name", { props })`.
fn build_slot_props_string(attributes: &[Attribute], source: &str) -> String {
    let mut parts: Vec<String> = Vec::new();

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                // Skip the `name` attribute - it determines the slot name, not a prop.
                // Skip `slot` too — on a `<slot slot="x">` forward it targets the
                // enclosing component's named slot (consumed by the
                // `$$slot_def["x"]` wrapper), it is not a slot prop.
                if node.name == "name" || node.name == "slot" {
                    continue;
                }
                // Slot props are neither DOM-element props nor component props;
                // use is_element=false (no data-* wrapping; --* wrapping if present).
                if let Some(s) = format_attribute_node(node, source, false) {
                    parts.push(s);
                }
            }
            Attribute::SpreadAttribute(spread) => {
                if let Some(s) = format_spread_attribute(spread, source) {
                    parts.push(s);
                }
            }
            Attribute::BindDirective(bind) => {
                // Skip bind:this on slot elements
                if bind.name == "this" {
                    continue;
                }
                parts.push(format_bind_directive(bind, source));
            }
            _ => {
                // Other directives are not typical on slot elements
            }
        }
    }

    let result = parts.join("");
    if result.is_empty() {
        // Empty props: `{}` (no space)
        String::new()
    } else {
        // Slot props go inside `{<props>}`. Official preserves the source
        // whitespace between `<slot` and the first attribute (always at least
        // one space) as a leading space after `{`, e.g. `{ "message":… }`.
        format!(" {result}")
    }
}

/// Collect `let:` directives from an attribute list.
pub(super) fn get_let_directives<'a>(attributes: &'a [Attribute<'a>]) -> Vec<&'a LetDirective<'a>> {
    attributes
        .iter()
        .filter_map(|attr| match attr {
            Attribute::LetDirective(let_dir) => Some(let_dir),
            _ => None,
        })
        .collect()
}

/// Build the `let:` destructuring string for slot definitions.
///
/// Given `let:name={n} let:thing let:whatever={{ bla }}`, produces:
/// `name:n,thing,whatever:{ bla },`
fn build_let_destructure_string(let_directives: &[&LetDirective], source: &str) -> String {
    let mut parts = Vec::new();
    for let_dir in let_directives {
        if let Some(ref expr) = let_dir.expression {
            let expr_text = get_expression_text(expr, source);
            parts.push(format!("{}:{},", let_dir.name, expr_text));
        } else {
            // Shorthand: `let:thing` → `thing,`
            parts.push(format!("{},", let_dir.name));
        }
    }
    parts.join("")
}

/// Get the static `slot="name"` attribute value from an element's attributes.
/// Returns None if no `slot` attribute is present, or if its value is a dynamic
/// expression (`slot={foo}`).
///
/// Official svelte2tsx only treats a `slot` attribute as a named-slot marker
/// when its value is static `Text` (`attributeValueIsOfType(attr.value, 'Text')`
/// in `htmlxtojsx_v2/nodes/Attribute.ts`). A dynamic `slot={foo}` is emitted as
/// an ordinary attribute (`{ slot: foo }`) and does NOT trigger the
/// `$$slot_def[...]` lowering or the component-instance const.
pub(super) fn get_slot_attr_value(attributes: &[Attribute], _source: &str) -> Option<String> {
    for attr in attributes {
        if let Attribute::Attribute(node) = attr
            && node.name == "slot"
        {
            match &node.value {
                AttributeValue::Sequence(parts) => {
                    let mut name = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            name.push_str(&text.raw);
                        }
                    }
                    if !name.is_empty() {
                        return Some(name);
                    }
                }
                // Dynamic `slot={foo}` is a regular attribute, not a named slot.
                AttributeValue::Expression(_) => {}
                _ => {}
            }
        }
    }
    None
}

// =============================================================================
// Legacy string-based API (kept for backward compatibility during migration)
// =============================================================================

/// Process a template fragment and generate TSX output (string-based, legacy).
///
/// This is kept temporarily for backward compatibility. New code should use
/// `process_template_inplace`.
pub fn process_template(fragment: &Fragment, source: &str, options: &Svelte2TsxOptions) -> String {
    let mut str = MagicString::new(source);
    process_template_inplace(fragment, source, options, &mut str);
    str.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ast::template::Fragment;

    #[test]
    fn test_process_empty_template() {
        let fragment = Fragment::default();
        let options = Svelte2TsxOptions::default();
        let mut str = MagicString::new("");
        process_template_inplace(&fragment, "", &options, &mut str);
        assert_eq!(str.to_string(), "");
    }

    // Tests for data-* and --* attribute wrapping rules.
    // Mirrors `htmlxtojsx_v2/nodes/Attribute.ts` `addAttribute` / `addProp`.

    use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

    fn compile_template(src: &str) -> String {
        svelte2tsx(src, Svelte2TsxOptions::default()).unwrap().code
    }

    #[test]
    fn test_data_attr_on_element_is_wrapped_with_empty() {
        // `data-foo="foobarbaz"` on a DOM element must become
        // `...__sveltets_2_empty({"data-foo":\`foobarbaz\`})`.
        let src = "<p data-foo=\"foobarbaz\">hello</p>";
        let out = compile_template(src);
        assert!(
            out.contains("...__sveltets_2_empty({\"data-foo\":`foobarbaz`})"),
            "expected __sveltets_2_empty wrap, got:\n{out}"
        );
    }

    #[test]
    fn test_data_sveltekit_attr_not_wrapped() {
        // `data-sveltekit-*` must NOT be wrapped — it is valid in `svelte/elements`.
        let src = "<a data-sveltekit-preload-data=\"hover\">link</a>";
        let out = compile_template(src);
        assert!(
            !out.contains("__sveltets_2_empty"),
            "data-sveltekit-* should not be wrapped, got:\n{out}"
        );
        assert!(
            out.contains("\"data-sveltekit-preload-data\""),
            "data-sveltekit-preload-data should be a plain prop, got:\n{out}"
        );
    }

    #[test]
    fn test_data_attr_boolean_on_element_uses_true() {
        // Boolean `data-foo` (no value) on a DOM element → `true` (official wraps
        // it as `...__sveltets_2_empty({ "data-foo": true })`).
        let src = "<p data-foo>hello</p>";
        let out = compile_template(src);
        assert!(
            out.contains("...__sveltets_2_empty({\"data-foo\":true})"),
            "boolean data-* should use true, got:\n{out}"
        );
    }

    #[test]
    fn test_css_prop_on_component_is_wrapped_with_cssprop() {
        // `--my-var={x}` on a component must become
        // `...__sveltets_2_cssProp({"--my-var":x})`.
        let src = "<script>import Comp from \"./Comp.svelte\"; let x = 5;</script>\
                   <Comp --my-var={x} />";
        let out = compile_template(src);
        assert!(
            out.contains("...__sveltets_2_cssProp({\"--my-var\":x})"),
            "expected __sveltets_2_cssProp wrap, got:\n{out}"
        );
    }

    #[test]
    fn test_normal_attr_not_wrapped() {
        // Regular attributes (no data-* or --*) must remain unwrapped.
        let src = "<p class=\"foo\" id=\"bar\">hello</p>";
        let out = compile_template(src);
        assert!(
            !out.contains("__sveltets_2_empty"),
            "regular attrs should not be wrapped, got:\n{out}"
        );
        assert!(
            out.contains("\"class\":`foo`"),
            "class attr should be plain prop, got:\n{out}"
        );
    }
}
