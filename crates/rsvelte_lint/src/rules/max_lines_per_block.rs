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
    default_severity: Severity::Off,
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

fn source_offset(value: u64) -> Option<u32> {
    u32::try_from(value).ok()
}

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
    let mut state = ScanState::default();
    // State must carry across the *whole* document for block/template/html so
    // multi-line comments are tracked; scan every line but only record in range.
    for (idx, raw) in lines.iter().enumerate() {
        let line_no = idx + 1;
        let chars: Vec<char> = raw.chars().collect();
        let (has_comment, has_code) = scan_comment_line(&chars, mode, &mut state);
        if line_no >= lo && line_no <= hi && has_comment && !has_code {
            out.insert(line_no);
        }
    }
    out
}

/// Scanner state carried across lines: whether we are inside a `/* */` /
/// `<!-- -->` block, inside a JS template literal, and the last significant
/// character seen — which is what decides whether a `/` opens a regex literal
/// or is a division operator.
#[derive(Default)]
struct ScanState {
    in_block: bool,
    in_template: bool,
    prev: Option<char>,
    prev_word: String,
    in_word: bool,
}

fn is_word_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

impl ScanState {
    /// Record one significant character of code.
    fn push_char(&mut self, c: char) {
        if is_word_char(c) {
            if !self.in_word {
                self.prev_word.clear();
            }
            self.prev_word.push(c);
            self.in_word = true;
        } else {
            self.prev_word.clear();
            self.in_word = false;
        }
        self.prev = Some(c);
    }

    /// Record that a whole token (string / template / regex literal) ended with
    /// `c`, which is never part of a word.
    fn end_token(&mut self, c: char) {
        self.prev = Some(c);
        self.prev_word.clear();
        self.in_word = false;
    }
}

/// Keywords after which a `/` starts a regular expression rather than dividing.
const REGEX_PRECEDING_KEYWORDS: &[&str] = &[
    "return",
    "typeof",
    "instanceof",
    "in",
    "of",
    "new",
    "delete",
    "void",
    "throw",
    "case",
    "do",
    "else",
    "yield",
    "await",
];

/// Whether a `/` at this point opens a regex literal. A regex cannot follow a
/// value, so an identifier / number / closing bracket / string end means
/// division — unless the identifier is a keyword that must be followed by an
/// expression.
fn regex_can_start(state: &ScanState) -> bool {
    match state.prev {
        None => true,
        Some(c) if is_word_char(c) => REGEX_PRECEDING_KEYWORDS.contains(&state.prev_word.as_str()),
        Some(c) => !matches!(c, ')' | ']' | '}' | '\'' | '"' | '`' | '/'),
    }
}

/// Consume a regex literal starting at the opening `/`, returning the index
/// just past the closing `/` (flags are left to the identifier scan).
fn skip_regex(chars: &[char], mut index: usize) -> usize {
    index += 1;
    let mut in_class = false;
    while index < chars.len() {
        match chars[index] {
            '\\' => index += 1,
            '[' => in_class = true,
            ']' => in_class = false,
            '/' if !in_class => return index + 1,
            _ => {}
        }
        index += 1;
    }
    index
}

fn scan_comment_line(chars: &[char], mode: Mode, state: &mut ScanState) -> (bool, bool) {
    let mut index = 0;
    let mut has_comment = false;
    let mut has_code = false;
    while index < chars.len() {
        let c = chars[index];
        let next = chars.get(index + 1).copied();
        if state.in_block {
            has_comment = true;
            let close = if mode == Mode::Html {
                c == '-' && next == Some('-') && chars.get(index + 2) == Some(&'>')
            } else {
                c == '*' && next == Some('/')
            };
            if close {
                index += if mode == Mode::Html { 3 } else { 2 };
                state.in_block = false;
            } else {
                index += 1;
            }
            continue;
        }
        if state.in_template {
            if c == '\\' {
                has_code = true;
                index += 2;
                continue;
            }
            if c == '`' {
                state.in_template = false;
                state.end_token('`');
            }
            if !c.is_whitespace() {
                has_code = true;
            }
            index += 1;
            continue;
        }
        match mode {
            Mode::Js => {
                if c == '`' {
                    state.in_template = true;
                    has_code = true;
                    index += 1;
                    continue;
                }
                if c == '\'' || c == '"' {
                    has_code = true;
                    index += 1;
                    while index < chars.len() && chars[index] != c {
                        index += if chars[index] == '\\' { 2 } else { 1 };
                    }
                    index += 1;
                    state.end_token(c);
                    continue;
                }
                if c == '/' {
                    if next == Some('/') {
                        has_comment = true;
                        break;
                    }
                    if next == Some('*') {
                        state.in_block = true;
                        has_comment = true;
                        index += 2;
                        continue;
                    }
                    // A `/` that opens a regex swallows any `/*` inside it, so
                    // this test has to come before the comment scan sees one.
                    if regex_can_start(state) {
                        has_code = true;
                        index = skip_regex(chars, index);
                        state.end_token('/');
                        continue;
                    }
                }
            }
            Mode::Css => {
                if c == '\'' || c == '"' {
                    has_code = true;
                    index += 1;
                    while index < chars.len() && chars[index] != c {
                        index += if chars[index] == '\\' { 2 } else { 1 };
                    }
                    index += 1;
                    continue;
                }
                if c == '/' && next == Some('*') {
                    state.in_block = true;
                    has_comment = true;
                    index += 2;
                    continue;
                }
            }
            Mode::Html
                if c == '<'
                    && next == Some('!')
                    && chars.get(index + 2) == Some(&'-')
                    && chars.get(index + 3) == Some(&'-') =>
            {
                state.in_block = true;
                has_comment = true;
                index += 4;
                continue;
            }
            Mode::Html => {}
        }
        if c.is_whitespace() {
            state.in_word = false;
        } else {
            has_code = true;
            state.push_char(c);
        }
        index += 1;
    }
    state.in_word = false;
    (has_comment, has_code)
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
        .and_then(|value| usize::try_from(value).ok())
}

fn opt_bool(opts: Option<&Value>, key: &str) -> bool {
    opts.and_then(|o| o.get(key))
        .and_then(Value::as_bool)
        .unwrap_or(false)
}

#[derive(Default)]
pub struct MaxLinesPerBlock;

impl MaxLinesPerBlock {
    fn check_block(
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

        // Shared with the other rules that walk the template (serializing the
        // whole root is one of the most expensive things a lint pass does).
        let json = ctx.root_json(root);
        if json.is_null() {
            return;
        }
        let span = |key: &str| -> Option<(u32, u32)> {
            let n = json.get(key).filter(|v| !v.is_null())?;
            Some((
                source_offset(n.get("start").and_then(Value::as_u64)?)?,
                source_offset(n.get("end").and_then(Value::as_u64)?)?,
            ))
        };

        let source = ctx.source().to_string();
        let lines: Vec<&str> = source.split('\n').collect();
        // 1-based line number for a byte offset.
        let line_of = |offset: u32| -> usize {
            bytecount::count(
                &source.as_bytes()[..(offset as usize).min(source.len())],
                b'\n',
            ) + 1
        };

        // `<script>` blocks (instance + module).
        if let Some(max) = script_max {
            for key in ["instance", "module"] {
                if let Some((s, e)) = span(key) {
                    Self::check_block(
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
            Self::check_block(
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

        if let Some(max) = template_max {
            let count = template_line_count(
                &lines,
                &line_of,
                skip_blank,
                skip_comments,
                &span,
                // `<svelte:options>` is lifted out of the fragment into
                // `Root.options`, so it has no node in the template tree.
                root.options.as_ref().map(|o| (o.start, o.end)).as_slice(),
            );
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

fn template_line_count(
    lines: &[&str],
    line_of: &dyn Fn(u32) -> usize,
    skip_blank: bool,
    skip_comments: bool,
    span: &dyn Fn(&str) -> Option<(u32, u32)>,
    options_spans: &[(u32, u32)],
) -> usize {
    let mut excluded = HashSet::new();
    for key in ["instance", "module", "css"] {
        if let Some((start, end)) = span(key) {
            excluded.extend(line_of(start)..=line_of(end));
        }
    }
    // Upstream excludes `<svelte:options>` from the template alongside the
    // script and style blocks.
    for &(start, end) in options_spans {
        excluded.extend(line_of(start)..=line_of(end));
    }
    let comment_lines = if skip_comments {
        full_line_comment_lines(lines, 0, 0, Mode::Html)
    } else {
        HashSet::default()
    };
    (1..=lines.len())
        .filter(|line| !excluded.contains(line))
        .filter(|line| !skip_blank || !lines[line - 1].trim().is_empty())
        .filter(|line| !comment_lines.contains(line))
        .count()
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
            return Some((source_offset(s)?, source_offset(e)?));
        }
    }
    None
}
