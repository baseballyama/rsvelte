//! `svelte/no-trailing-spaces` — disallow trailing whitespace at the end of
//! lines.
//!
//! Extension of the core ESLint `no-trailing-spaces` rule, taught about Svelte
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
use crate::line_index::LineIndex;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

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
            {
                let s = li.line(start as u32);
                let e = li.line(end as u32);
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
        let programs: Vec<Value> = with_serialize_arena(&root.arena, || {
            let mut out = Vec::new();
            if let Some(s) = root.instance.as_ref() {
                out.push(s.content.as_json().clone());
            }
            if let Some(s) = root.module.as_ref() {
                out.push(s.content.as_json().clone());
            }
            out
        });
        for program in &programs {
            collect_template_elements(program, &li, &mut ignore_lines);
        }

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

        // Scan every physical line. We split on `\n` and treat a trailing `\r`
        // as part of the line terminator (so CRLF files behave like ESLint's
        // `sourceCode.lines`).
        let mut line_start_byte: usize = 0;
        let bytes = source.as_bytes();
        let mut line_number: u32 = 1;
        let mut i = 0usize;
        // Iterate line by line including a final line with no trailing newline.
        loop {
            // Find the end of this line (exclusive of the `\n`).
            let nl = source[i..].find('\n').map(|off| i + off);
            let raw_end = nl.unwrap_or(source.len());
            // Strip a trailing `\r` from the logical line content.
            let mut content_end = raw_end;
            if content_end > line_start_byte && bytes[content_end - 1] == b'\r' {
                content_end -= 1;
            }
            let line = &source[line_start_byte..content_end];

            self.check_line(
                ctx,
                line,
                line_start_byte as u32,
                line_number,
                skip_blank_lines,
                &ignore_lines,
            );

            match nl {
                Some(pos) => {
                    line_start_byte = pos + 1;
                    i = pos + 1;
                    line_number += 1;
                    if i > source.len() {
                        break;
                    }
                }
                None => break,
            }
        }
    }
}

impl NoTrailingSpaces {
    fn check_line(
        &self,
        ctx: &mut LintContext,
        line: &str,
        line_start_byte: u32,
        line_number: u32,
        skip_blank_lines: bool,
        ignore_lines: &HashSet<u32>,
    ) {
        if skip_blank_lines && line.trim().is_empty() {
            return;
        }
        if ignore_lines.contains(&line_number) {
            return;
        }
        let trimmed = line.trim_end();
        if trimmed.len() == line.len() {
            return;
        }
        // Byte offset where the trailing whitespace run starts / ends.
        let trim_byte = line_start_byte + trimmed.len() as u32;
        let line_end_byte = line_start_byte + line.len() as u32;
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
