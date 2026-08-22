//! `svelte/no-trailing-spaces` — disallow trailing whitespace at the end of
//! lines.
//!
//! Extension of the core `ESLint` `no-trailing-spaces` rule, taught about Svelte
//! template HTML comments. This is a **whole-source** rule: it scans every
//! physical line of `ctx.source()` and reports each line whose end carries
//! trailing whitespace (space / tab / form-feed / vertical-tab — anything the
//! JS `String.prototype.trimEnd` strips except that we only target the trailing
//! run).
//!
//! Options (`options[0]`, object):
//! - `skipBlankLines` (default `false`) — don't report lines that are entirely
//!   whitespace.
//! - `ignoreComments` (default `false`) — don't report lines that fall inside a
//!   comment. Mirrors upstream exactly: JS line comments ignore
//!   `[start.line, end.line]`, JS block comments and Svelte HTML comments
//!   ignore `[start.line, end.line - 1]` (the comment's final line is still
//!   checked). Template-literal interior lines are always ignored
//!   (`[start.line, end.line - 1]`), matching upstream's `TemplateElement`
//!   collector.
//!
//! Port of `eslint-plugin-svelte/src/rules/no-trailing-spaces.ts`.
//! Upstream: `meta.fixable = 'whitespace'`, `type: 'layout'`.

use std::collections::HashSet;

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::{JsCommentKind, Root, TemplateNode};
use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::engine::{SourceKind, classify_source};
use crate::line_index::LineIndex;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::js_whitespace::{js_trim, js_trim_end};
use crate::script::{ProgramView, ScriptKind, ScriptRule};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-trailing-spaces",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow trailing whitespace at the end of lines",
    options_schema: Some(
        r#"[{"type":"object","properties":{"skipBlankLines":{"type":"boolean"},"ignoreComments":{"type":"boolean"}},"additionalProperties":false}]"#,
    ),
};

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("source offsets are represented as u32")
}

fn json_offset(value: u64) -> Option<u32> {
    u32::try_from(value).ok()
}

#[derive(Default)]
pub struct NoTrailingSpaces;

/// Push every line in `[start_line, end_line]` (1-based, inclusive) into `set`.
fn collect_range(set: &mut HashSet<u32>, start_line: u32, end_line: u32) {
    let mut i = start_line;
    while i <= end_line {
        set.insert(i);
        i += 1;
    }
}

/// Recursively gather Svelte HTML comment line ranges (`[start, end - 1]`).
fn collect_html_comments(nodes: &[TemplateNode], li: &LineIndex, set: &mut HashSet<u32>) {
    for node in nodes {
        match node {
            TemplateNode::Comment(c) => {
                let start = li.line(c.start);
                let end = li.line(c.end);
                if end >= 1 {
                    collect_range(set, start, end - 1);
                }
            }
            TemplateNode::RegularElement(el) => collect_html_comments(&el.fragment.nodes, li, set),
            TemplateNode::Component(c) => collect_html_comments(&c.fragment.nodes, li, set),
            TemplateNode::IfBlock(b) => {
                collect_html_comments(&b.consequent.nodes, li, set);
                if let Some(alt) = &b.alternate {
                    collect_html_comments(&alt.nodes, li, set);
                }
            }
            TemplateNode::EachBlock(b) => {
                collect_html_comments(&b.body.nodes, li, set);
                if let Some(f) = &b.fallback {
                    collect_html_comments(&f.nodes, li, set);
                }
            }
            TemplateNode::AwaitBlock(b) => {
                for f in [&b.pending, &b.then, &b.catch].into_iter().flatten() {
                    collect_html_comments(&f.nodes, li, set);
                }
            }
            TemplateNode::KeyBlock(b) => collect_html_comments(&b.fragment.nodes, li, set),
            TemplateNode::SnippetBlock(b) => collect_html_comments(&b.body.nodes, li, set),
            TemplateNode::TitleElement(e) => collect_html_comments(&e.fragment.nodes, li, set),
            TemplateNode::SlotElement(e) => collect_html_comments(&e.fragment.nodes, li, set),
            TemplateNode::SvelteComponent(c) => collect_html_comments(&c.fragment.nodes, li, set),
            TemplateNode::SvelteElement(e) => collect_html_comments(&e.fragment.nodes, li, set),
            TemplateNode::SvelteBody(e)
            | TemplateNode::SvelteDocument(e)
            | TemplateNode::SvelteFragment(e)
            | TemplateNode::SvelteBoundary(e)
            | TemplateNode::SvelteHead(e)
            | TemplateNode::SvelteOptions(e)
            | TemplateNode::SvelteSelf(e)
            | TemplateNode::SvelteWindow(e) => collect_html_comments(&e.fragment.nodes, li, set),
            _ => {}
        }
    }
}

/// Recursively gather `TemplateElement` byte spans from a serialized program.
fn collect_template_elements(node: &Value, li: &LineIndex, set: &mut HashSet<u32>) {
    match node {
        Value::Object(map) => {
            if map.get("type").and_then(Value::as_str) == Some("TemplateElement")
                && let (Some(start), Some(end)) = (
                    map.get("start").and_then(Value::as_u64),
                    map.get("end").and_then(Value::as_u64),
                )
                && let (Some(start), Some(end)) = (json_offset(start), json_offset(end))
            {
                let s = li.line(start);
                let e = li.line(end);
                if e >= 1 {
                    collect_range(set, s, e - 1);
                }
            }
            for v in map.values() {
                collect_template_elements(v, li, set);
            }
        }
        Value::Array(arr) => {
            for v in arr {
                collect_template_elements(v, li, set);
            }
        }
        _ => {}
    }
}

impl Rule for NoTrailingSpaces {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let skip_blank_lines = ctx.option_bool("skipBlankLines", false);
        let ignore_comments = ctx.option_bool("ignoreComments", false);

        let source = ctx.source();
        let li = LineIndex::new(source);

        // Lines to skip. Template-literal interior lines are always ignored
        // (upstream collects `TemplateElement` unconditionally); comment lines
        // only when `ignoreComments`.
        let mut ignore_lines: HashSet<u32> = HashSet::new();

        // Template-literal interior lines from instance/module scripts.
        // Borrowed from each program's own JSON cache — copying them out would
        // deep-clone a whole ESTree tree per file just to scan for line numbers.
        let programs: Vec<&Value> = with_serialize_arena(&root.arena, || {
            let mut out = Vec::new();
            if let Some(s) = root.instance.as_ref() {
                out.push(s.content.as_json());
            }
            if let Some(s) = root.module.as_ref() {
                out.push(s.content.as_json());
            }
            out
        });
        for program in programs {
            collect_template_elements(program, &li, &mut ignore_lines);
        }
        // Template literals inside markup mustaches are TemplateElements to the
        // oracle as well — walk the serialized template fragment for them.
        let fragment_json = ctx.template_fragment_json();
        collect_template_elements(&fragment_json, &li, &mut ignore_lines);

        if ignore_comments {
            // JS comments captured during parsing (script blocks + `{...}`).
            for c in &root.comments {
                let start = li.line(c.start);
                let end = li.line(c.end);
                let end_line = match c.kind {
                    JsCommentKind::Block => end.saturating_sub(1),
                    JsCommentKind::Line => end,
                };
                if end_line >= start {
                    collect_range(&mut ignore_lines, start, end_line);
                }
            }
            // Svelte HTML comments.
            collect_html_comments(&root.fragment.nodes, &li, &mut ignore_lines);
        }

        Self::scan_lines(ctx, source, skip_blank_lines, &ignore_lines);
    }
}

impl ScriptRule for NoTrailingSpaces {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    /// Upstream's `Program:exit` runs for every file the plugin lints, and a
    /// standalone `.svelte.(js|ts)` module never reaches [`Rule::check_root`].
    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        let SourceKind::Module { ts } = classify_source(ctx.filename()) else {
            return;
        };
        let skip_blank_lines = ctx.option_bool("skipBlankLines", false);
        let ignore_comments = ctx.option_bool("ignoreComments", false);

        let source = ctx.source();
        let li = LineIndex::new(source);
        let mut ignore_lines: HashSet<u32> = HashSet::new();
        collect_template_elements(program.value(), &li, &mut ignore_lines);
        if ignore_comments {
            collect_module_comments(source, ts, &li, &mut ignore_lines);
        }
        Self::scan_lines(ctx, source, skip_blank_lines, &ignore_lines);
    }
}

/// Gather the ignorable line range of every JS comment in a standalone module.
///
/// The module program is serialized without its comment list, so they are
/// re-derived from a parse rather than scanned for (a `//` inside a regex
/// literal or a string is not a comment).
fn collect_module_comments(source: &str, ts: bool, li: &LineIndex, set: &mut HashSet<u32>) {
    use oxc_span::SourceType;
    let allocator = oxc_allocator::Allocator::default();
    let source_type = if ts {
        SourceType::ts()
    } else {
        SourceType::mjs()
    };
    let parsed = oxc_parser::Parser::new(&allocator, source, source_type).parse();
    for comment in &parsed.program.comments {
        let start = li.line(comment.span.start);
        let end = li.line(comment.span.end);
        let end_line = if comment.is_line() {
            end
        } else {
            end.saturating_sub(1)
        };
        if end_line >= start {
            collect_range(set, start, end_line);
        }
    }
}

impl NoTrailingSpaces {
    /// Scan every physical line. This rule reads `sourceCode.lines`, so it uses
    /// ESLint's terminator set — `\r\n`, lone `\r`, `\n`, and also U+2028 /
    /// U+2029, which are line terminators to JavaScript. (Rules that report an
    /// AST node's `loc` instead get the parser's CR/LF-only lines; see
    /// `uses_eslint_line_table`.)
    fn scan_lines(
        ctx: &mut LintContext,
        source: &str,
        skip_blank_lines: bool,
        ignore_lines: &HashSet<u32>,
    ) {
        let bytes = source.as_bytes();
        // ESLint removes a leading BOM before a rule ever sees the text, so it
        // is not part of line 1. A BOM *is* JS whitespace, so leaving it in
        // makes a BOM-only line look like trailing space — and the autofix
        // would then delete the BOM.
        let mut line_start_byte: usize = usize::from(source.starts_with('\u{FEFF}')) * 3;
        let mut line_number: u32 = 1;
        loop {
            let terminator = (line_start_byte..bytes.len()).find(|&i| {
                bytes[i] == b'\n'
                    || bytes[i] == b'\r'
                    || (bytes[i] == 0xE2
                        && bytes.get(i + 1) == Some(&0x80)
                        && matches!(bytes.get(i + 2), Some(0xA8 | 0xA9)))
            });
            let content_end = terminator.unwrap_or(source.len());
            let line = &source[line_start_byte..content_end];

            Self::check_line(
                ctx,
                line,
                source_offset(line_start_byte),
                line_number,
                skip_blank_lines,
                ignore_lines,
            );

            match terminator {
                Some(pos) => {
                    let width = if bytes[pos] == b'\r' && bytes.get(pos + 1) == Some(&b'\n') {
                        2
                    } else if bytes[pos] == 0xE2 {
                        3
                    } else {
                        1
                    };
                    line_start_byte = pos + width;
                    line_number += 1;
                }
                None => break,
            }
        }
    }

    fn check_line(
        ctx: &mut LintContext,
        line: &str,
        line_start_byte: u32,
        line_number: u32,
        skip_blank_lines: bool,
        ignore_lines: &HashSet<u32>,
    ) {
        if skip_blank_lines && js_trim(line).is_empty() {
            return;
        }
        if ignore_lines.contains(&line_number) {
            return;
        }
        let trimmed = js_trim_end(line);
        if trimmed.len() == line.len() {
            return;
        }
        // Byte offset where the trailing whitespace run starts / ends.
        let trim_byte = line_start_byte + source_offset(trimmed.len());
        let line_end_byte = line_start_byte + source_offset(line.len());
        ctx.report_with_fix(
            trim_byte,
            line_end_byte,
            "Trailing spaces not allowed.",
            Fix {
                message: "Remove trailing spaces".to_string(),
                edits: vec![TextEdit {
                    start: trim_byte,
                    end: line_end_byte,
                    new_text: String::new(),
                }],
            },
        );
    }
}
