//! `svelte/indent` — enforce consistent indentation in Svelte templates.
//!
//! Checks that every token-start line inside the Svelte template is indented by
//! a multiple of the configured indent unit. Each block construct
//! (`{#if}`, `{#each}`, `{#await}`, `{#key}`, `{#snippet}`, `{@render}`,
//! `{@html}`, `{@const}`, `{@debug}`, elements, and their children) increases
//! the expected indentation by one unit. Branch / close keywords
//! (`{:else}`, `{:then}`, `{:catch}`, `{/if}`, `{/each}`, …) are expected at
//! the same level as the opening keyword.
//!
//! This is a **whole-source** rule implemented via `check_root`: we build a
//! `HashMap<u32, u32>` from line → expected-indent-count by walking the AST,
//! then scan the source for mismatches.
//!
//! Options (`options[0]`, object):
//! - `indent` (integer ≥ 1 | `"tab"`): unit size. Default `2` spaces.
//! - `indentScript` (boolean): whether to apply the rule inside `<script>`.
//!   Default `true`.
//!
//! Port of `eslint-plugin-svelte/src/rules/indent.ts`.

use std::collections::HashMap;

use rsvelte_core::ast::template::{
    Attribute, AwaitBlock, EachBlock, Fragment, IfBlock, KeyBlock, SnippetBlock, TemplateNode,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::line_index::LineIndex;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/indent",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce consistent indentation in Svelte templates",
    options_schema: Some(
        r#"[{"type":"object","properties":{"indent":{"oneOf":[{"type":"integer","minimum":1},{"type":"string","enum":["tab"]}]},"indentScript":{"type":"boolean"}},"additionalProperties":false}]"#,
    ),
};

/// How indentation is expressed.
#[derive(Clone, Copy)]
enum IndentUnit {
    /// N spaces per level.
    Spaces(u32),
    /// One tab per level.
    Tab,
}

impl IndentUnit {
    fn is_tab(self) -> bool {
        matches!(self, IndentUnit::Tab)
    }

    /// Number of raw characters per indent level.
    fn chars_per_level(self) -> u32 {
        match self {
            IndentUnit::Spaces(n) => n,
            IndentUnit::Tab => 1,
        }
    }
}

#[derive(Default)]
pub struct Indent;

impl Rule for Indent {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &rsvelte_core::ast::template::Root) {
        let source = ctx.source();
        let li = LineIndex::new(source);

        // Parse options.
        let unit = parse_indent_unit(ctx);
        let indent_script = ctx.option_bool("indentScript", true);

        // Map: 1-based line number → expected indent level (not raw chars).
        // A level of N means N * chars_per_level characters of the indent char.
        let mut expected: HashMap<u32, u32> = HashMap::new();

        // Walk the template fragment.
        walk_nodes(&root.fragment.nodes, 0, source, &li, &mut expected);

        // Handle <script> body.
        if let Some(script) = root.instance.as_ref() {
            let script_start_line = li.line(script.start);
            let script_end_line = li.line(script.end);
            for line in (script_start_line + 1)..script_end_line {
                if indent_script {
                    expected.entry(line).or_insert(1);
                } else {
                    // indentScript=false: override to 0 (no indent).
                    expected.insert(line, 0);
                }
            }
        }
        if let Some(script) = root.module.as_ref() {
            let script_start_line = li.line(script.start);
            let script_end_line = li.line(script.end);
            for line in (script_start_line + 1)..script_end_line {
                if indent_script {
                    expected.entry(line).or_insert(1);
                } else {
                    expected.insert(line, 0);
                }
            }
        }

        // Now scan source line by line and report mismatches.
        let source_lines: Vec<&str> = source.split('\n').collect();
        for (idx, raw_line) in source_lines.iter().enumerate() {
            let line_num = (idx + 1) as u32;
            let line = raw_line.trim_end_matches('\r');

            // Skip blank lines.
            if line.trim().is_empty() {
                continue;
            }

            let Some(&expected_level) = expected.get(&line_num) else {
                continue;
            };

            // Count how many leading characters of the expected kind.
            let expected_raw = expected_level * unit.chars_per_level();

            let (_, actual_kind) = count_leading_indent(line);

            // Check if the indentation is correct.
            let correct = match actual_kind {
                IndentKind::None => expected_raw == 0,
                IndentKind::Space(count) => !unit.is_tab() && count == expected_raw,
                IndentKind::Tab(count) => unit.is_tab() && count == expected_level,
                IndentKind::Mixed(_) => false,
            };

            if correct {
                continue;
            }

            // Compute byte offset of the start of this line.
            let line_start: u32 = source_lines[..idx].iter().map(|l| l.len() as u32 + 1).sum();

            // The actual leading-whitespace run spans [line_start, line_start + leading_len).
            let leading_len: u32 = match &actual_kind {
                IndentKind::None => 0,
                IndentKind::Space(n) | IndentKind::Tab(n) | IndentKind::Mixed(n) => *n,
            };
            let indent_end = line_start + leading_len;

            // Build the correct replacement indent string.
            let correct_indent = if unit.is_tab() {
                "\t".repeat(expected_level as usize)
            } else {
                " ".repeat(expected_raw as usize)
            };

            let message = format_message(expected_level, &actual_kind, unit);
            ctx.report_with_fix(
                line_start,
                indent_end,
                message,
                Fix {
                    message: "Fix indentation".to_string(),
                    edits: vec![TextEdit {
                        start: line_start,
                        end: indent_end,
                        new_text: correct_indent,
                    }],
                },
            );
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
enum IndentKind {
    /// No leading whitespace.
    None,
    /// Leading spaces only, count.
    Space(u32),
    /// Leading tabs only, count.
    Tab(u32),
    /// Mixed: some count.
    Mixed(u32),
}

fn count_leading_indent(line: &str) -> (u32, IndentKind) {
    let mut spaces = 0u32;
    let mut tabs = 0u32;
    for ch in line.chars() {
        match ch {
            ' ' => spaces += 1,
            '\t' => tabs += 1,
            _ => break,
        }
    }
    if spaces > 0 && tabs > 0 {
        return (spaces + tabs, IndentKind::Mixed(spaces + tabs));
    }
    if spaces > 0 {
        (spaces, IndentKind::Space(spaces))
    } else if tabs > 0 {
        (tabs, IndentKind::Tab(tabs))
    } else {
        (0, IndentKind::None)
    }
}

/// Parse the indent unit from options.
fn parse_indent_unit(ctx: &LintContext) -> IndentUnit {
    let opt0 = ctx.option0();
    if let Some(obj) = opt0
        && let Some(indent_val) = obj.get("indent")
    {
        if indent_val.as_str() == Some("tab") {
            return IndentUnit::Tab;
        }
        if let Some(n) = indent_val.as_u64() {
            return IndentUnit::Spaces(n as u32);
        }
    }
    IndentUnit::Spaces(2)
}

/// Format the diagnostic message to match eslint-plugin-svelte exactly.
fn format_message(expected_level: u32, actual: &IndentKind, unit: IndentUnit) -> String {
    match unit {
        IndentUnit::Tab => {
            let exp = expected_level;
            let exp_str = if exp == 1 {
                "1 tab".to_string()
            } else {
                format!("{exp} tabs")
            };
            match actual {
                IndentKind::Tab(n) => {
                    // Found wrong number of tabs.
                    let found = *n;
                    format!("Expected indentation of {exp_str} but found {found} tabs.")
                }
                IndentKind::None => {
                    format!("Expected indentation of {exp_str} but found 0 tabs.")
                }
                IndentKind::Space(n) | IndentKind::Mixed(n) => {
                    // Found spaces where tabs are expected — report as "whitespaces".
                    let ws = *n;
                    format!("Expected indentation of {exp_str} but found {ws} whitespaces.")
                }
            }
        }
        IndentUnit::Spaces(n) => {
            let expected_spaces = expected_level * n;
            match actual {
                IndentKind::Tab(count) => {
                    // Found tabs, expected spaces — report as "whitespace".
                    let w = *count;
                    if w == 1 {
                        format!(
                            "Expected indentation of {expected_spaces} spaces but found 1 whitespace."
                        )
                    } else {
                        format!(
                            "Expected indentation of {expected_spaces} spaces but found {w} whitespace."
                        )
                    }
                }
                IndentKind::None => {
                    format!("Expected indentation of {expected_spaces} spaces but found 0 spaces.")
                }
                IndentKind::Space(found) => {
                    format!(
                        "Expected indentation of {expected_spaces} spaces but found {found} spaces."
                    )
                }
                IndentKind::Mixed(found) => {
                    format!(
                        "Expected indentation of {expected_spaces} spaces but found {found} spaces."
                    )
                }
            }
        }
    }
}

/// Walk the template nodes at the given base indent level, recording expected
/// indentation for each relevant line.
fn walk_nodes(
    nodes: &[TemplateNode],
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
) {
    for node in nodes {
        walk_node(node, base, source, li, expected);
    }
}

fn walk_node(
    node: &TemplateNode,
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
) {
    match node {
        TemplateNode::IfBlock(b) => walk_if_block(b, base, source, li, expected),
        TemplateNode::EachBlock(b) => walk_each_block(b, base, source, li, expected),
        TemplateNode::AwaitBlock(b) => walk_await_block(b, base, source, li, expected),
        TemplateNode::KeyBlock(b) => walk_key_block(b, base, source, li, expected),
        TemplateNode::SnippetBlock(b) => walk_snippet_block(b, base, source, li, expected),
        TemplateNode::RegularElement(el) => {
            // Inline `<style>` and `<script>` elements (nested inside other
            // elements, as opposed to the top-level Svelte `<style>` / `<script>`
            // special blocks) contain raw CSS / JS text that follows its own
            // indentation conventions.  Skip their children to avoid false
            // positives, matching eslint-plugin-svelte's own behaviour.
            let skip_children = matches!(el.name.as_str(), "style" | "script");
            walk_element_maybe_skip_children(
                el.start,
                el.end,
                &el.attributes,
                &el.fragment,
                base,
                source,
                li,
                expected,
                skip_children,
            )
        }
        TemplateNode::Component(c) => walk_element(
            c.start,
            c.end,
            &c.attributes,
            &c.fragment,
            base,
            source,
            li,
            expected,
        ),
        TemplateNode::TitleElement(e) => walk_element(
            e.start,
            e.end,
            &e.attributes,
            &e.fragment,
            base,
            source,
            li,
            expected,
        ),
        TemplateNode::SlotElement(e) => walk_element(
            e.start,
            e.end,
            &e.attributes,
            &e.fragment,
            base,
            source,
            li,
            expected,
        ),
        TemplateNode::SvelteBody(e)
        | TemplateNode::SvelteDocument(e)
        | TemplateNode::SvelteFragment(e)
        | TemplateNode::SvelteBoundary(e)
        | TemplateNode::SvelteHead(e)
        | TemplateNode::SvelteOptions(e)
        | TemplateNode::SvelteSelf(e)
        | TemplateNode::SvelteWindow(e) => walk_element(
            e.start,
            e.end,
            &e.attributes,
            &e.fragment,
            base,
            source,
            li,
            expected,
        ),
        TemplateNode::SvelteComponent(c) => walk_element(
            c.start,
            c.end,
            &c.attributes,
            &c.fragment,
            base,
            source,
            li,
            expected,
        ),
        TemplateNode::SvelteElement(e) => walk_element(
            e.start,
            e.end,
            &e.attributes,
            &e.fragment,
            base,
            source,
            li,
            expected,
        ),
        TemplateNode::ExpressionTag(tag) => {
            walk_mustache_block(tag.start, tag.end, base, source, li, expected);
        }
        TemplateNode::HtmlTag(tag) => {
            walk_mustache_block(tag.start, tag.end, base, source, li, expected);
        }
        TemplateNode::ConstTag(tag) => {
            walk_mustache_block(tag.start, tag.end, base, source, li, expected);
        }
        TemplateNode::DeclarationTag(tag) => {
            walk_mustache_block(tag.start, tag.end, base, source, li, expected);
        }
        TemplateNode::DebugTag(tag) => {
            walk_mustache_block(tag.start, tag.end, base, source, li, expected);
        }
        TemplateNode::RenderTag(tag) => {
            walk_mustache_block(tag.start, tag.end, base, source, li, expected);
        }
        TemplateNode::AttachTag(tag) => {
            walk_mustache_block(tag.start, tag.end, base, source, li, expected);
        }
        TemplateNode::Text(text) => {
            walk_text_node(text.start, text.end, base, source, li, expected);
        }
        TemplateNode::Comment(c) => {
            // HTML comments (`<!-- ... -->`) are indented at the same level as
            // sibling nodes — they must be at `base` on their opening line.
            walk_text_node(c.start, c.end, base, source, li, expected);
        }
    }
}

/// Walk a `{#if}...{:else if}...{:else}...{/if}` block.
fn walk_if_block(
    block: &IfBlock,
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
) {
    // The opening `{#if ...}` — possibly multi-line. Walk from block.start to
    // matching closing `}`.
    let open_end = find_matching_brace_end(block.start, source);
    walk_mustache_block(block.start, open_end, base, source, li, expected);

    // Consequent body at base+1.
    walk_nodes(&block.consequent.nodes, base + 1, source, li, expected);

    if let Some(alt) = &block.alternate {
        if let [TemplateNode::IfBlock(else_if)] = alt.nodes.as_slice()
            && else_if.elseif
        {
            // `{:else if ...}` — the else_if.start points to `{:else if`.
            let elseif_start = else_if.start;
            let elseif_open_end = find_matching_brace_end(elseif_start, source);
            walk_mustache_block(elseif_start, elseif_open_end, base, source, li, expected);
            // Recurse into the else-if block.
            walk_nodes(&else_if.consequent.nodes, base + 1, source, li, expected);
            if let Some(else_alt) = &else_if.alternate {
                walk_if_alternate(else_if, else_alt, block.end, base, source, li, expected);
            }
        } else {
            // `{:else}` — search for it in source between consequent end and block end.
            let else_pos = find_else_in_range(
                last_node_end(
                    &block.consequent.nodes,
                    find_matching_brace_end(block.start, source),
                ),
                block.end,
                source,
            );
            if let Some(epos) = else_pos {
                let else_open_end = find_matching_brace_end(epos, source);
                walk_mustache_block(epos, else_open_end, base, source, li, expected);
            }
            walk_nodes(&alt.nodes, base + 1, source, li, expected);
        }
    }

    // `{/if}` closing tag.
    let close_pos = find_close_tag(block.end, source);
    walk_mustache_block(close_pos, block.end, base, source, li, expected);
}

/// Walk the tail of an `{:else if}...{:else}` chain.
fn walk_if_alternate(
    parent_if: &IfBlock,
    alt: &Fragment,
    block_end: u32,
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
) {
    if let [TemplateNode::IfBlock(else_if)] = alt.nodes.as_slice()
        && else_if.elseif
    {
        let elseif_start = else_if.start;
        let elseif_open_end = find_matching_brace_end(elseif_start, source);
        walk_mustache_block(elseif_start, elseif_open_end, base, source, li, expected);
        walk_nodes(&else_if.consequent.nodes, base + 1, source, li, expected);
        if let Some(else_alt) = &else_if.alternate {
            walk_if_alternate(else_if, else_alt, block_end, base, source, li, expected);
        }
    } else {
        // `{:else}` after an else-if chain.
        let else_pos = find_else_in_range(
            last_node_end(&parent_if.consequent.nodes, parent_if.start),
            block_end,
            source,
        );
        if let Some(epos) = else_pos {
            let else_open_end = find_matching_brace_end(epos, source);
            walk_mustache_block(epos, else_open_end, base, source, li, expected);
        }
        walk_nodes(&alt.nodes, base + 1, source, li, expected);
    }
}

/// Walk a `{#each}...{:else}...{/each}` block.
fn walk_each_block(
    block: &EachBlock,
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
) {
    let open_end = find_matching_brace_end(block.start, source);
    walk_mustache_block(block.start, open_end, base, source, li, expected);

    walk_nodes(&block.body.nodes, base + 1, source, li, expected);

    if let Some(fallback) = &block.fallback {
        let else_pos = find_else_in_range(
            last_node_end(&block.body.nodes, open_end),
            block.end,
            source,
        );
        if let Some(epos) = else_pos {
            let else_open_end = find_matching_brace_end(epos, source);
            walk_mustache_block(epos, else_open_end, base, source, li, expected);
        }
        walk_nodes(&fallback.nodes, base + 1, source, li, expected);
    }

    let close_pos = find_close_tag(block.end, source);
    walk_mustache_block(close_pos, block.end, base, source, li, expected);
}

/// Walk a `{#await}...{:then}...{:catch}...{/await}` block.
fn walk_await_block(
    block: &AwaitBlock,
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
) {
    let open_end = find_matching_brace_end(block.start, source);
    walk_mustache_block(block.start, open_end, base, source, li, expected);

    if let Some(pending) = &block.pending {
        walk_nodes(&pending.nodes, base + 1, source, li, expected);
    }

    // {:then} keyword (only if there's a separate pending block).
    if block.pending.is_some() && block.then.is_some() {
        let search_from = block
            .pending
            .as_ref()
            .and_then(|f| f.nodes.last())
            .map(node_end)
            .unwrap_or(open_end);
        if let Some(then_pos) = find_keyword_in_range(search_from, block.end, source, ":then") {
            let then_open_end = find_matching_brace_end(then_pos, source);
            walk_mustache_block(then_pos, then_open_end, base, source, li, expected);
        }
    }

    if let Some(then_frag) = &block.then {
        walk_nodes(&then_frag.nodes, base + 1, source, li, expected);
    }

    // {:catch} keyword.
    if block.catch.is_some() {
        let search_from = block
            .then
            .as_ref()
            .and_then(|f| f.nodes.last())
            .map(node_end)
            .or_else(|| {
                block
                    .pending
                    .as_ref()
                    .and_then(|f| f.nodes.last())
                    .map(node_end)
            })
            .unwrap_or(open_end);
        if let Some(catch_pos) = find_keyword_in_range(search_from, block.end, source, ":catch") {
            let catch_open_end = find_matching_brace_end(catch_pos, source);
            walk_mustache_block(catch_pos, catch_open_end, base, source, li, expected);
        }
        if let Some(catch_frag) = &block.catch {
            walk_nodes(&catch_frag.nodes, base + 1, source, li, expected);
        }
    }

    let close_pos = find_close_tag(block.end, source);
    walk_mustache_block(close_pos, block.end, base, source, li, expected);
}

/// Walk a `{#key}...{/key}` block.
fn walk_key_block(
    block: &KeyBlock,
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
) {
    let open_end = find_matching_brace_end(block.start, source);
    walk_mustache_block(block.start, open_end, base, source, li, expected);
    walk_nodes(&block.fragment.nodes, base + 1, source, li, expected);
    let close_pos = find_close_tag(block.end, source);
    walk_mustache_block(close_pos, block.end, base, source, li, expected);
}

/// Walk a `{#snippet}...{/snippet}` block.
fn walk_snippet_block(
    block: &SnippetBlock,
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
) {
    let open_end = find_matching_brace_end(block.start, source);
    walk_mustache_block(block.start, open_end, base, source, li, expected);
    walk_nodes(&block.body.nodes, base + 1, source, li, expected);
    let close_pos = find_close_tag(block.end, source);
    walk_mustache_block(close_pos, block.end, base, source, li, expected);
}

/// Walk a mustache token spanning [start, end).
///
/// Indentation rules (matching upstream eslint-plugin-svelte):
/// - The `{` opening line: at `base` (if first nonws on its line).
/// - First content line at depth=1 (the keyword like `#if`, `#each`, `:else`, `@html`): `base + 1`.
/// - Subsequent content lines at depth=1 (the expression arguments after the keyword): `base + 2`.
/// - Certain depth-1 "sub-keywords" stay at `base + 1`:
///   - `if` after `:else` (the `{:else if}` compound keyword).
///   - `then` and `catch` inside an `{#await}` open tag.
/// - Content at depth=N (N >= 2): `base + N`.
/// - Lines whose first nonws char is a closing bracket (`}`, `)`, `]`):
///   level = same as the level of the line where the matching opening bracket appeared.
///   The stack tracks the "expected level" at each nesting level.
fn walk_mustache_block(
    start: u32,
    end: u32,
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
) {
    if start >= end || end as usize > source.len() {
        return;
    }

    let start_line = li.line(start);

    // Only mark the start line if the `{` is the first non-whitespace on the line.
    if is_first_nonws_on_line(start, source) {
        mark_line_once(start_line, base, expected);
    }

    let end_line = li.line(end.saturating_sub(1));
    if start_line == end_line {
        return; // single-line, done
    }

    // Multi-line mustache: scan character-by-character.
    let text = &source[start as usize..end as usize];

    // Determine the tag kind for the `{` block we're scanning.
    // Peek at the first non-`{` non-whitespace character after `{`.
    let first_inner_char = text
        .as_bytes()
        .iter()
        .skip(1)
        .find(|&&b| b != b' ' && b != b'\t' && b != b'\r' && b != b'\n')
        .copied();
    let is_block_or_branch = matches!(first_inner_char, Some(b'#') | Some(b':'));

    // Determine: is the primary keyword `#await`? (`{#await …}` open tag)
    // We need this to handle `then`/`catch` as sub-keywords at base+1.
    // Similarly, is it `{:else}` so `if` is a sub-keyword?
    // Read the first "word" at depth=1 in the tag.
    let primary_keyword = extract_primary_keyword(text);
    let is_await_open = primary_keyword == "#await";
    let is_else_branch = primary_keyword == ":else";

    // `depth`: brace/paren/bracket nesting depth (starts at 0, goes to 1 at the outer `{`).
    let mut depth: i32 = 0;
    // State for depth=1 token tracking.
    // `d1_words` counts how many words/tokens we've seen at depth=1.
    // `d1_in_expr` is true once we've started seeing expression tokens (after keywords).
    // `d1_after_then_catch` is true once we've seen `then`/`catch` as a sub-keyword.
    let mut d1_words: u32 = 0; // number of "words" (on-own-line tokens) seen at depth=1
    let mut d1_in_expr = false; // entered expression mode
    let mut d1_after_then_catch = false; // after a then/catch sub-keyword
    // Stack tracking the indent level for each nesting level.
    // `level_stack[depth]` = the expected level for a closing bracket that returns to depth.
    let mut level_stack: Vec<u32> = vec![base]; // level_stack[0] = base (outer `{` level)
    // Level of the current/last non-blank line (used for bracket stack push).
    let mut current_line_level: u32 = base;
    // Is the current position the first nonws char on its line?
    let mut first_on_line = false;
    let mut cur_line = start_line;

    for (i, ch) in text.char_indices() {
        let byte_pos = start + i as u32;
        let line = li.line(byte_pos);

        // Update first-on-line tracking.
        if line != cur_line {
            // Just entered a new line.
            first_on_line = true;
            cur_line = line;
        }

        let is_ws = ch == ' ' || ch == '\t' || ch == '\r' || ch == '\n';
        if first_on_line && !is_ws {
            // This is the first non-whitespace on the line.
            let is_closing = ch == '}' || ch == ')' || ch == ']';

            let level = if is_closing {
                // Closing bracket: use the level stored when this depth was opened.
                let close_depth = depth.max(0) as usize;
                level_stack.get(close_depth).copied().unwrap_or(base)
            } else if depth <= 0 {
                base
            } else if depth == 1 {
                if !is_block_or_branch {
                    // Inline tags ({expr}, {@html ...}, {/close}): all content at base+1.
                    base + 1
                } else {
                    // Block/branch tags: keyword at base+1, expression at base+2.
                    // Sub-keywords (e.g. `if` after `:else`, `then`/`catch` in `#await`) at base+1.
                    let word_at_pos = peek_word_at(source, byte_pos);
                    let is_sub_keyword = if is_await_open && d1_in_expr {
                        // After the primary `#await` and its expression,
                        // `then` or `catch` resets to keyword level.
                        word_at_pos == "then" || word_at_pos == "catch"
                    } else if is_else_branch && d1_words == 1 && !d1_in_expr {
                        // Second word after `:else` in `{:else if}` is `if`.
                        word_at_pos == "if"
                    } else {
                        false
                    };

                    if !d1_in_expr || is_sub_keyword || d1_after_then_catch {
                        // Still in keyword phase, or this IS a sub-keyword, or right
                        // after `then`/`catch` where the value begins (but then/catch
                        // have already reset d1_after_then_catch for the NEXT line).
                        if d1_words == 0 {
                            // This is the primary keyword line: base+1.
                            base + 1
                        } else if is_sub_keyword {
                            // Sub-keyword (`if` after `:else`, `then`/`catch`): base+1.
                            base + 1
                        } else if d1_after_then_catch {
                            // The value token right after `then`/`catch`: base+2.
                            base + 2
                        } else {
                            // The primary keyword is always base+1 (handled above via d1_words==0).
                            // If we get here, keyword_line_passed is false but d1_words>0 —
                            // this shouldn't happen for well-structured tags, but treat as base+1.
                            base + 1
                        }
                    } else {
                        // Expression mode: base+2.
                        base + 2
                    }
                }
            } else {
                // depth >= 2: simple nesting
                base + depth as u32
            };

            if is_first_nonws_on_line(byte_pos, source) {
                mark_line_once(line, level, expected);
            }

            // Update depth-1 state tracking after we've computed the level.
            if depth == 1 && !is_closing && is_block_or_branch {
                let word_at_pos = peek_word_at(source, byte_pos);
                let is_sub_keyword = if is_await_open && d1_in_expr {
                    word_at_pos == "then" || word_at_pos == "catch"
                } else if is_else_branch && d1_words == 1 && !d1_in_expr {
                    word_at_pos == "if"
                } else {
                    false
                };

                if d1_after_then_catch {
                    // The line right after then/catch is the value — enter expr mode.
                    d1_after_then_catch = false;
                    d1_in_expr = true;
                } else if is_sub_keyword {
                    // `then`/`catch` or `if` after `:else` resets to keyword mode.
                    d1_in_expr = false;
                    d1_after_then_catch = true; // next depth-1 line is the value
                } else if d1_words == 0 {
                    // Primary keyword line: next depth-1 line will be expression.
                    // BUT for `:else if`, the next line might be `if` (sub-keyword).
                    d1_in_expr = true;
                    // Exception: if this IS the `else` keyword in `{:else if}`,
                    // the next line might be `if` — handled by is_sub_keyword check above.
                    if is_else_branch {
                        // Don't mark in_expr yet — let the `if` sub-keyword check handle it.
                        d1_in_expr = false;
                    }
                } else {
                    // Already in expression mode or after keyword.
                    d1_in_expr = true;
                }
                d1_words += 1;
            }

            current_line_level = level;
            first_on_line = false;
        }

        // Update depth and stack.
        match ch {
            '{' | '(' | '[' => {
                // When this bracket opens (becomes depth+1), the matching close
                // should return to the level of this bracket's line.
                let open_level = current_line_level;
                depth += 1;
                // Store the level for the closing bracket.
                if depth as usize >= level_stack.len() {
                    level_stack.resize(depth as usize + 1, open_level);
                } else {
                    level_stack[depth as usize] = open_level;
                }
                // Opening a bracket in depth=1 means we've entered expression territory.
                if depth == 2 && is_block_or_branch {
                    d1_in_expr = true;
                    d1_after_then_catch = false;
                }
            }
            '}' | ')' | ']' => {
                depth -= 1;
                if depth < 0 {
                    depth = 0;
                }
            }
            _ => {}
        }
    }
}

/// Extract the primary keyword from a `{...}` tag text (e.g. `#await`, `:else`, `#if`).
/// Returns empty string if not a block/branch tag.
fn extract_primary_keyword(text: &str) -> &str {
    let bytes = text.as_bytes();
    // Skip the leading `{` and whitespace.
    let mut i = 1;
    while i < bytes.len()
        && (bytes[i] == b' ' || bytes[i] == b'\t' || bytes[i] == b'\r' || bytes[i] == b'\n')
    {
        i += 1;
    }
    if i >= bytes.len() {
        return "";
    }
    // Must start with `#` or `:`.
    if bytes[i] != b'#' && bytes[i] != b':' {
        return "";
    }
    let kw_start = i;
    // Read until whitespace or end.
    while i < bytes.len()
        && bytes[i] != b' '
        && bytes[i] != b'\t'
        && bytes[i] != b'\r'
        && bytes[i] != b'\n'
        && bytes[i] != b'}'
    {
        i += 1;
    }
    &text[kw_start..i]
}

/// Peek at the word starting at `pos` in source (read alphanumeric/identifier characters).
fn peek_word_at(source: &str, pos: u32) -> &str {
    let pos = pos as usize;
    if pos >= source.len() {
        return "";
    }
    let bytes = source.as_bytes();
    let start = pos;
    let mut end = pos;
    while end < bytes.len()
        && (bytes[end].is_ascii_alphanumeric()
            || bytes[end] == b'_'
            || bytes[end] == b'#'
            || bytes[end] == b':'
            || bytes[end] == b'/')
    {
        end += 1;
    }
    &source[start..end]
}

/// Walk a text node — mark lines that start with the text as `base` indented.
///
/// A line is marked only when the FIRST non-whitespace character on that line
/// falls inside the text-node span `[start, end)`.  This prevents the
/// trailing-whitespace portion of a text node (e.g. the `\n      ` that
/// immediately precedes a close tag) from claiming the close-tag line.
fn walk_text_node(
    start: u32,
    end: u32,
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
) {
    if start >= end || end as usize > source.len() {
        return;
    }
    let text = &source[start as usize..end as usize];
    let start_line = li.line(start);

    // Helper: find the byte offset of the first nonws char on the line that
    // contains `pos`.  Returns `None` if the line is all-whitespace.
    let first_nonws_on_same_line = |pos: u32| -> Option<u32> {
        let line_start = source[..pos as usize]
            .rfind('\n')
            .map(|i| i + 1)
            .unwrap_or(0);
        let line_content = &source[line_start..];
        line_content
            .find(|c: char| c != ' ' && c != '\t' && c != '\r' && c != '\n')
            .map(|rel| line_start as u32 + rel as u32)
    };

    // First line of the text node — mark only if the first nonws of that line
    // is `start` itself (i.e. the text node begins a fresh line).
    if is_first_nonws_on_line(start, source) {
        mark_line_once(start_line, base, expected);
    }

    // For each newline inside the text node, decide whether to mark the next line.
    let mut byte_offset = start;
    for ch in text.chars() {
        if ch == '\n' {
            let new_line_first_byte = byte_offset + 1; // first byte of the next line
            let new_line = li.line(new_line_first_byte);

            // Find the first nonws char on that line.
            if let Some(first_nonws) = first_nonws_on_same_line(new_line_first_byte) {
                // Only mark if that first nonws is inside *this* text node.
                if first_nonws >= start && first_nonws < end {
                    mark_line_once(new_line, base, expected);
                }
            }
        }
        byte_offset += ch.len_utf8() as u32;
    }
}

/// Walk a regular element: its opening tag tokens and children.
#[allow(clippy::too_many_arguments)]
fn walk_element(
    start: u32,
    end: u32,
    attributes: &[Attribute],
    fragment: &Fragment,
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
) {
    walk_element_maybe_skip_children(
        start, end, attributes, fragment, base, source, li, expected, false,
    );
}

/// Like `walk_element` but with an optional flag to skip walking the children.
/// Used for inline `<style>`/`<script>` elements whose content follows its own
/// indentation rules that the template-level indent rule should not enforce.
#[allow(clippy::too_many_arguments)]
fn walk_element_maybe_skip_children(
    start: u32,
    end: u32,
    attributes: &[Attribute],
    fragment: &Fragment,
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
    skip_children: bool,
) {
    let start_line = li.line(start);

    // Opening `<tag` line is at base.
    if is_first_nonws_on_line(start, source) {
        mark_line_once(start_line, base, expected);
    }

    // Find the end of the opening tag.
    let open_tag_end = find_open_tag_end(start, source);
    let open_tag_end_line = li.line(open_tag_end.saturating_sub(1));

    // Attributes: each on its own line gets base+1.
    for attr in attributes {
        let (attr_start, attr_end) = attr_span(attr);
        walk_attribute_lines(attr_start, attr_end, base + 1, source, li, expected);
    }

    // The closing `>` (or `/>`) of the opening tag, if on its own line.
    // We find the first non-whitespace character on `open_tag_end_line` and
    // check if it's `/` or `>` (indicating the line is a dedicated `>` or `/>` line).
    if open_tag_end_line > start_line {
        // Find the first nonws on open_tag_end_line.
        let line_start_byte = source[..open_tag_end.saturating_sub(1) as usize]
            .rfind('\n')
            .map(|i| i + 1)
            .unwrap_or(0);
        let first_nonws_byte = source[line_start_byte..]
            .find(|c: char| !c.is_ascii_whitespace())
            .map(|rel| line_start_byte + rel);
        if let Some(fnb) = first_nonws_byte {
            let first_ch = source.as_bytes().get(fnb).copied().unwrap_or(0);
            if first_ch == b'>' || first_ch == b'/' {
                // The line starts with `>` or `/>` — it's the dedicated closing line.
                mark_line_once(open_tag_end_line, base, expected);
            }
        }
    }

    // Walk children at base + 1 (unless skip_children is set).
    if !skip_children {
        walk_nodes(&fragment.nodes, base + 1, source, li, expected);
    }

    // Close tag: the `</` line gets base, and the `>` closing line gets base.
    let end_line = li.line(end.saturating_sub(1));
    if end_line > open_tag_end_line {
        // Find `</` in the range after open_tag_end.
        if let Some(close_tag_pos) = find_close_tag_start(open_tag_end, end, source) {
            let close_tag_line = li.line(close_tag_pos);
            if is_first_nonws_on_line(close_tag_pos, source) {
                mark_line_once(close_tag_line, base, expected);
            }
            // The final `>` of the close tag.
            let final_gt = end.saturating_sub(1);
            let final_gt_line = li.line(final_gt);
            if final_gt_line > close_tag_line && is_first_nonws_on_line(final_gt, source) {
                mark_line_once(final_gt_line, base, expected);
            }
        }
    }
}

/// Walk an attribute span [start, end), marking inner lines.
///
/// Indentation rules:
/// - Attribute name line: `base` (handled by caller marking it).
/// - After `=` (value separator), the following lines are at `base + 1`.
/// - Content inside `{...}` expressions: `base + 1 + depth`.
/// - Content inside string literals `"..."` or `'...'`: `base + 1 + 1 = base + 2`.
/// - Content inside `{...}` expressions inside strings: `base + 1 + 1 + depth`.
/// - Closing brackets and closing quotes: at the same level as their opener's line.
fn walk_attribute_lines(
    start: u32,
    end: u32,
    base: u32,
    source: &str,
    li: &LineIndex,
    expected: &mut HashMap<u32, u32>,
) {
    if start >= end || end as usize > source.len() {
        return;
    }

    let start_line = li.line(start);

    // First line at base (if it starts on its own line).
    if is_first_nonws_on_line(start, source) {
        mark_line_once(start_line, base, expected);
    }

    let end_line = li.line(end.saturating_sub(1));
    if start_line == end_line {
        return;
    }

    // Multi-line attribute: track state for inner lines.
    let text = &source[start as usize..end as usize];
    let mut cur_line = start_line;
    // Current expected level for lines at the "current depth/context".
    // Starts at `base` (the attribute name level).
    let mut cur_level: u32 = base;
    // The level assigned to the CURRENT line (tracks what level we marked the most
    // recent non-whitespace character at, so strings can inherit it).
    let mut current_line_level: u32 = base;
    // Stack: when we open a bracket or string, push current_line_level so we can restore on close.
    let mut level_stack: Vec<u32> = vec![base];
    // Whether we're inside a string literal.
    let mut in_string: Option<char> = None;
    // Whether we've seen the `=` sign (enabling +1 for value).
    let mut past_equals = false;

    for (i, ch) in text.char_indices() {
        let byte_pos = start + i as u32;
        let line = li.line(byte_pos);

        if line != cur_line {
            // New line: mark it when we reach the first nonws char on it.
            // We'll do the marking in the first-nonws detection below.
            cur_line = line;
        }

        // Check for first nonws on line.
        let is_ws_ch = ch == ' ' || ch == '\t' || ch == '\r' || ch == '\n';
        if !is_ws_ch && is_first_nonws_on_line(byte_pos, source) && line != start_line {
            // Determine level for this line.
            let level = if ch == '}' || ch == ')' || ch == ']' {
                // Closing bracket (inside or outside string): use level from when bracket opened.
                level_stack.last().copied().unwrap_or(base)
            } else if in_string.is_some() && Some(ch) == in_string {
                // Closing quote: restore to the level of the line that opened the string.
                level_stack.last().copied().unwrap_or(base)
            } else if ch == '=' && !past_equals && in_string.is_none() {
                // The `=` separator itself on its own line: at base + 1.
                base + 1
            } else {
                cur_level
            };
            mark_line_once(line, level, expected);
            current_line_level = level;
        }

        // Update state based on character.
        if let Some(q) = in_string {
            if ch == q {
                // Closing the string: restore level to what it was before the string opened.
                in_string = None;
                cur_level = level_stack.pop().unwrap_or(base);
            }
            // Inside string, track `{` / `}` for expression nesting inside strings.
            match ch {
                '{' => {
                    level_stack.push(cur_level);
                    cur_level += 1;
                }
                '}' => {
                    cur_level = level_stack.pop().unwrap_or(base);
                }
                _ => {}
            }
        } else {
            match ch {
                '"' | '\'' => {
                    // Opening a string literal.
                    // String content is ONE level deeper than the line where `"` opened.
                    // The closing `"` should return to the level of the line where `"` appeared.
                    // We push `current_line_level` (the level of the current line) so the
                    // closing `"` lands there, and set cur_level = current_line_level + 1
                    // for the string content.
                    in_string = Some(ch);
                    level_stack.push(current_line_level);
                    cur_level = current_line_level + 1;
                }
                '{' | '(' | '[' => {
                    // Use current_line_level (the indent of the current line's first nonws)
                    // rather than cur_level.  This means `on:click={` on an attribute
                    // line at level N puts the `{` body at N+1 (not N+2 which cur_level
                    // would give after the `=` has already bumped it).
                    level_stack.push(current_line_level);
                    cur_level = current_line_level + 1;
                }
                '}' | ')' | ']' => {
                    cur_level = level_stack.pop().unwrap_or(base);
                }
                '=' if !past_equals => {
                    // Attribute value separator: following content is one level deeper.
                    past_equals = true;
                    level_stack.push(base); // Push base so after value, we'd close back to base.
                    cur_level = base + 1;
                }
                _ => {}
            }
        }
    }
}

// ============================================================================
// Helpers
// ============================================================================

/// Get the `(start, end)` byte span of an attribute.
fn attr_span(attr: &Attribute) -> (u32, u32) {
    match attr {
        Attribute::Attribute(a) => (a.start, a.end),
        Attribute::SpreadAttribute(s) => (s.start, s.end),
        Attribute::AttachTag(t) => (t.start, t.end),
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

/// Find the byte offset just after the closing `>` of the opening tag
/// (handles `>` and `/>` and skips string values).
fn find_open_tag_end(start: u32, source: &str) -> u32 {
    if start as usize >= source.len() {
        return start;
    }
    let src = &source[start as usize..];
    let mut depth = 0i32;
    let mut in_string: Option<char> = None;
    let bytes = src.as_bytes();
    let mut i = 0usize;

    while i < bytes.len() {
        let b = bytes[i] as char;
        if let Some(delim) = in_string {
            if b == delim {
                in_string = None;
            }
            i += 1;
            continue;
        }
        match b {
            '"' | '\'' => in_string = Some(b),
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth < 0 {
                    depth = 0;
                }
            }
            '>' if depth == 0 => {
                return start + i as u32 + 1;
            }
            _ => {}
        }
        i += 1;
    }
    start + src.len() as u32
}

/// Find the position of `</` (close tag start) in source[from..to].
fn find_close_tag_start(from: u32, to: u32, source: &str) -> Option<u32> {
    if from as usize >= to as usize || to as usize > source.len() {
        return None;
    }
    let range = &source[from as usize..to as usize];
    range.rfind("</").map(|rel| from + rel as u32)
}

/// Find the end of the matching `}` for `{` at `start`.
fn find_matching_brace_end(start: u32, source: &str) -> u32 {
    if start as usize >= source.len() {
        return start;
    }
    let src = &source[start as usize..];
    let mut depth = 0i32;
    let mut in_string: Option<char> = None;
    let bytes = src.as_bytes();
    let mut i = 0usize;

    while i < bytes.len() {
        let b = bytes[i] as char;
        if let Some(delim) = in_string {
            if b == delim {
                in_string = None;
            }
            i += 1;
            continue;
        }
        match b {
            '"' | '\'' | '`' => in_string = Some(b),
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    return start + i as u32 + 1;
                }
            }
            _ => {}
        }
        i += 1;
    }
    start
}

/// Find the `{` of the closing tag (`{/if}`, `{/each}`, etc.)
/// by searching backward from `block_end`.
///
/// Handles multi-line close tags like `{\n/each\n}`.
fn find_close_tag(block_end: u32, source: &str) -> u32 {
    let to = (block_end as usize).min(source.len());
    // Search backwards from block_end for the last `{` that is
    // followed (possibly after whitespace/newlines) by `/`.
    let src = &source[..to];
    let bytes = src.as_bytes();
    let mut i = bytes.len();
    while i > 0 {
        i -= 1;
        if bytes[i] == b'{' {
            // Check if the next non-whitespace byte is `/`.
            let mut j = i + 1;
            while j < bytes.len()
                && (bytes[j] == b' ' || bytes[j] == b'\t' || bytes[j] == b'\r' || bytes[j] == b'\n')
            {
                j += 1;
            }
            if j < bytes.len() && bytes[j] == b'/' {
                return i as u32;
            }
        }
    }
    block_end.saturating_sub(1)
}

/// Find the `{:else` position in source[from..to].
/// Handles both compact `{:else` and multi-line `{\n:else` forms.
fn find_else_in_range(from: u32, to: u32, source: &str) -> Option<u32> {
    if from as usize >= to as usize || to as usize > source.len() {
        return None;
    }
    find_branch_keyword_in_range(from, to, source, "else", true)
}

/// Find `{:keyword` (e.g. `{:then`, `{:catch`) in source[from..to].
/// Handles both compact `{:keyword` and multi-line `{\n:keyword` forms.
fn find_keyword_in_range(from: u32, to: u32, source: &str, keyword: &str) -> Option<u32> {
    if from as usize >= to as usize || to as usize > source.len() {
        return None;
    }
    let keyword_no_colon = keyword.strip_prefix(':').unwrap_or(keyword);
    find_branch_keyword_in_range(from, to, source, keyword_no_colon, false)
}

/// Helper: search [from..to) for the last (if `find_last`) or first occurrence of
/// `{` followed by optional whitespace, then `:keyword`.
fn find_branch_keyword_in_range(
    from: u32,
    to: u32,
    source: &str,
    keyword: &str,
    find_last: bool,
) -> Option<u32> {
    let bytes = source.as_bytes();
    let from = from as usize;
    let to = (to as usize).min(source.len());
    let mut result: Option<u32> = None;

    let mut i = from;
    while i < to {
        if bytes[i] == b'{' {
            // Skip whitespace after `{`
            let mut j = i + 1;
            while j < to
                && (bytes[j] == b' ' || bytes[j] == b'\t' || bytes[j] == b'\r' || bytes[j] == b'\n')
            {
                j += 1;
            }
            // Check for `:keyword`
            if j < to && bytes[j] == b':' {
                let kw_start = j + 1;
                let kw_end = kw_start + keyword.len();
                if kw_end <= to && &source[kw_start..kw_end] == keyword {
                    // Check the character after keyword is not alphanumeric (to avoid partial match)
                    let after = if kw_end < to { bytes[kw_end] } else { 0 };
                    if !after.is_ascii_alphanumeric() && after != b'_' {
                        if find_last {
                            result = Some(i as u32);
                        } else {
                            return Some(i as u32);
                        }
                    }
                }
            }
        }
        i += 1;
    }
    result
}

/// Get the end byte position of the last node in a list, or `default` if empty.
fn last_node_end(nodes: &[TemplateNode], default: u32) -> u32 {
    nodes.last().map(node_end).unwrap_or(default)
}

/// Get the end byte position of a template node.
fn node_end(node: &TemplateNode) -> u32 {
    match node {
        TemplateNode::Text(t) => t.end,
        TemplateNode::Comment(c) => c.end,
        TemplateNode::ExpressionTag(t) => t.end,
        TemplateNode::HtmlTag(t) => t.end,
        TemplateNode::ConstTag(t) => t.end,
        TemplateNode::DeclarationTag(t) => t.end,
        TemplateNode::DebugTag(t) => t.end,
        TemplateNode::RenderTag(t) => t.end,
        TemplateNode::AttachTag(t) => t.end,
        TemplateNode::IfBlock(b) => b.end,
        TemplateNode::EachBlock(b) => b.end,
        TemplateNode::AwaitBlock(b) => b.end,
        TemplateNode::KeyBlock(b) => b.end,
        TemplateNode::SnippetBlock(b) => b.end,
        TemplateNode::RegularElement(e) => e.end,
        TemplateNode::Component(c) => c.end,
        TemplateNode::TitleElement(e) => e.end,
        TemplateNode::SlotElement(e) => e.end,
        TemplateNode::SvelteBody(e)
        | TemplateNode::SvelteDocument(e)
        | TemplateNode::SvelteFragment(e)
        | TemplateNode::SvelteBoundary(e)
        | TemplateNode::SvelteHead(e)
        | TemplateNode::SvelteOptions(e)
        | TemplateNode::SvelteSelf(e)
        | TemplateNode::SvelteWindow(e) => e.end,
        TemplateNode::SvelteComponent(c) => c.end,
        TemplateNode::SvelteElement(e) => e.end,
    }
}

/// Returns true if `pos` is the first non-whitespace character on its line.
/// I.e., everything from the start of the line to `pos` is whitespace.
fn is_first_nonws_on_line(pos: u32, source: &str) -> bool {
    let pos = pos as usize;
    if pos > source.len() {
        return false;
    }
    let line_start = source[..pos].rfind('\n').map(|i| i + 1).unwrap_or(0);
    source[line_start..pos]
        .chars()
        .all(|c| c == ' ' || c == '\t')
}

/// Mark `line` as expecting `level` units of indentation (first write wins).
fn mark_line_once(line: u32, level: u32, expected: &mut HashMap<u32, u32>) {
    expected.entry(line).or_insert(level);
}
