//! `svelte/max-lines-per-block` — enforce a maximum number of lines in a
//! component's `<script>`, template, and `<style>` blocks. Port of the
//! eslint-plugin-svelte rule.
//!
//! A template rule (`check_root`). Script / style block spans come from
//! `Root.instance` / `Root.module` / `Root.css`; the template count is every
//! source line not occupied by a script/style block. The `skipBlankLines` and
//! `skipComments` options drop blank lines and *full-line* comments (JS `//` /
//! `/* */` for scripts, CSS `/* */` for styles, `<!-- -->` for the template),
//! mirroring upstream's per-line counting.

use std::collections::HashSet;

use rsvelte_core::ast::template::Root;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/max-lines-per-block",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce a maximum number of lines in component blocks",
    options_schema: Some(
        r#"{ "type": "object", "properties": {
            "script": { "type": "integer", "minimum": 1 },
            "template": { "type": "integer", "minimum": 1 },
            "style": { "type": "integer", "minimum": 1 },
            "skipBlankLines": { "type": "boolean" },
            "skipComments": { "type": "boolean" }
        }, "additionalProperties": false }"#,
    ),
};

/// Comment-scanning mode for `skipComments` full-line detection.
#[derive(Clone, Copy, PartialEq)]
enum Mode {
    Js,
    Css,
    Html,
}

/// Lines (1-based) within `[start_line+1, end_line-1]` that are *full-line*
/// comments — every non-whitespace char on the line belongs to a comment.
/// `start_line == 0` means "scan all lines" (template / html mode).
fn full_line_comment_lines(
    lines: &[&str],
    start_line: usize,
    end_line: usize,
    mode: Mode,
) -> HashSet<usize> {
    let mut out = HashSet::new();
    let (lo, hi) = if start_line == 0 {
        (1, lines.len())
    } else {
        (start_line + 1, end_line.saturating_sub(1))
    };
    let mut in_block = false; // /* */ or <!-- -->
    let mut in_template = false; // JS `...`
    // State must carry across the *whole* document for block/template/html so
    // multi-line comments are tracked; scan every line but only record in range.
    for (idx, raw) in lines.iter().enumerate() {
        let line_no = idx + 1;
        let chars: Vec<char> = raw.chars().collect();
        let mut i = 0;
        let mut has_comment = false;
        let mut has_code = false;
        while i < chars.len() {
            let c = chars[i];
            let next = chars.get(i + 1).copied();
            if in_block {
                has_comment = true;
                let close = if mode == Mode::Html {
                    c == '-' && next == Some('-') && chars.get(i + 2) == Some(&'>')
                } else {
                    c == '*' && next == Some('/')
                };
                if close {
                    i += if mode == Mode::Html { 3 } else { 2 };
                    in_block = false;
                } else {
                    i += 1;
                }
                continue;
            }
            if in_template {
                if c == '\\' {
                    has_code = true;
                    i += 2;
                    continue;
                }
                if c == '`' {
                    in_template = false;
                }
                if !c.is_whitespace() {
                    has_code = true;
                }
                i += 1;
                continue;
            }
            match mode {
                Mode::Js => {
                    if c == '`' {
                        in_template = true;
                        has_code = true;
                        i += 1;
                        continue;
                    }
                    if c == '\'' || c == '"' {
                        has_code = true;
                        i += 1;
                        while i < chars.len() && chars[i] != c {
                            i += if chars[i] == '\\' { 2 } else { 1 };
                        }
                        i += 1;
                        continue;
                    }
                    if c == '/' && next == Some('/') {
                        has_comment = true;
                        break; // rest of line is comment
                    }
                    if c == '/' && next == Some('*') {
                        in_block = true;
                        has_comment = true;
                        i += 2;
                        continue;
                    }
                }
                Mode::Css => {
                    if c == '\'' || c == '"' {
                        has_code = true;
                        i += 1;
                        while i < chars.len() && chars[i] != c {
                            i += if chars[i] == '\\' { 2 } else { 1 };
                        }
                        i += 1;
                        continue;
                    }
                    if c == '/' && next == Some('*') {
                        in_block = true;
                        has_comment = true;
                        i += 2;
                        continue;
                    }
                }
                Mode::Html => {
                    if c == '<'
                        && next == Some('!')
                        && chars.get(i + 2) == Some(&'-')
                        && chars.get(i + 3) == Some(&'-')
                    {
                        in_block = true;
                        has_comment = true;
                        i += 4;
                        continue;
                    }
                }
            }
            if !c.is_whitespace() {
                has_code = true;
            }
            i += 1;
        }
        if line_no >= lo && line_no <= hi && has_comment && !has_code {
            out.insert(line_no);
        }
    }
    out
}

/// Inner content lines of a block `[start_line, end_line]`, minus blanks /
/// comments per the options.
fn count_block_lines(
    lines: &[&str],
    start_line: usize,
    end_line: usize,
    skip_blank: bool,
    comment_lines: &HashSet<usize>,
) -> usize {
    if end_line <= start_line + 1 {
        return 0;
    }
    let mut count = 0;
    for i in (start_line + 1)..end_line {
        let line = lines.get(i - 1).copied().unwrap_or("");
        if skip_blank && line.trim().is_empty() {
            continue;
        }
        if comment_lines.contains(&i) {
            continue;
        }
        count += 1;
    }
    count
}

fn opt_usize(opts: Option<&Value>, key: &str) -> Option<usize> {
    opts.and_then(|o| o.get(key))
        .and_then(Value::as_u64)
        .map(|v| v as usize)
}

fn opt_bool(opts: Option<&Value>, key: &str) -> bool {
    opts.and_then(|o| o.get(key))
        .and_then(Value::as_bool)
        .unwrap_or(false)
}

#[derive(Default)]
pub struct MaxLinesPerBlock;

impl MaxLinesPerBlock {
    #[allow(clippy::too_many_arguments)]
    fn check_block(
        &self,
        ctx: &mut LintContext,
        lines: &[&str],
        line_of: &dyn Fn(u32) -> usize,
        start: u32,
        end: u32,
        max: usize,
        block: &str,
        mode: Mode,
        skip_blank: bool,
        skip_comments: bool,
    ) {
        let sl = line_of(start);
        let el = line_of(end);
        let comment_lines = if skip_comments {
            full_line_comment_lines(lines, sl, el, mode)
        } else {
            HashSet::new()
        };
        let n = count_block_lines(lines, sl, el, skip_blank, &comment_lines);
        if n > max {
            ctx.report(
                start,
                end,
                format!("{block} block has too many lines ({n}). Maximum allowed is {max}."),
            );
        }
    }
}

impl Rule for MaxLinesPerBlock {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let opts = ctx.option0();
        let script_max = opt_usize(opts, "script");
        let template_max = opt_usize(opts, "template");
        let style_max = opt_usize(opts, "style");
        if script_max.is_none() && template_max.is_none() && style_max.is_none() {
            return;
        }
        let skip_blank = opt_bool(opts, "skipBlankLines");
        let skip_comments = opt_bool(opts, "skipComments");

        let Some(json) = serialize_root(root) else {
            return;
        };
        let span = |key: &str| -> Option<(u32, u32)> {
            let n = json.get(key).filter(|v| !v.is_null())?;
            Some((
                n.get("start").and_then(Value::as_u64)? as u32,
                n.get("end").and_then(Value::as_u64)? as u32,
            ))
        };

        let source = ctx.source().to_string();
        let lines: Vec<&str> = source.split('\n').collect();
        // 1-based line number for a byte offset.
        let line_of = |offset: u32| -> usize {
            source.as_bytes()[..(offset as usize).min(source.len())]
                .iter()
                .filter(|&&b| b == b'\n')
                .count()
                + 1
        };

        // `<script>` blocks (instance + module).
        if let Some(max) = script_max {
            for key in ["instance", "module"] {
                if let Some((s, e)) = span(key) {
                    self.check_block(
                        ctx,
                        &lines,
                        &line_of,
                        s,
                        e,
                        max,
                        "<script>",
                        Mode::Js,
                        skip_blank,
                        skip_comments,
                    );
                }
            }
        }

        // `<style>` block.
        if let Some(max) = style_max
            && let Some((s, e)) = span("css")
        {
            self.check_block(
                ctx,
                &lines,
                &line_of,
                s,
                e,
                max,
                "<style>",
                Mode::Css,
                skip_blank,
                skip_comments,
            );
        }

        // Template — every line not occupied by a script/style block.
        if let Some(max) = template_max {
            let mut excluded: HashSet<usize> = HashSet::new();
            for key in ["instance", "module", "css"] {
                if let Some((s, e)) = span(key) {
                    for i in line_of(s)..=line_of(e) {
                        excluded.insert(i);
                    }
                }
            }
            let comment_lines = if skip_comments {
                full_line_comment_lines(&lines, 0, 0, Mode::Html)
            } else {
                HashSet::new()
            };
            let mut count = 0;
            for i in 1..=lines.len() {
                if excluded.contains(&i) {
                    continue;
                }
                if skip_blank && lines[i - 1].trim().is_empty() {
                    continue;
                }
                if comment_lines.contains(&i) {
                    continue;
                }
                count += 1;
            }
            if count > max
                && let Some((s, e)) = first_template_node(&json)
            {
                ctx.report(
                    s,
                    e,
                    format!(
                        "template block has too many lines ({count}). Maximum allowed is {max}."
                    ),
                );
            }
        }
    }
}

/// First non-`svelte:options` template node `(start, end)`.
fn first_template_node(json: &Value) -> Option<(u32, u32)> {
    let nodes = json.get("fragment")?.get("nodes")?.as_array()?;
    for n in nodes {
        if n.get("type").and_then(Value::as_str) == Some("SvelteOptions") {
            continue;
        }
        if let (Some(s), Some(e)) = (
            n.get("start").and_then(Value::as_u64),
            n.get("end").and_then(Value::as_u64),
        ) {
            return Some((s as u32, e as u32));
        }
    }
    None
}

fn serialize_root(root: &Root) -> Option<Value> {
    rsvelte_core::ast::arena::with_serialize_arena(&root.arena, || serde_json::to_value(root).ok())
}
