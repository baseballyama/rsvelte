//! `svelte/no-useless-mustaches` — flag a mustache interpolation whose value is
//! a plain string literal (`{'foo'}`) or a zero-interpolation template literal
//! (`{`foo`}`), which can be written as plain text / attribute text instead.
//! Port of the eslint-plugin-svelte rule.
//!
//! Fires in two contexts (mirroring upstream's single `SvelteMustacheTag`
//! visitor, which the rsvelte visitor splits into two hooks):
//!   - text position — `check_expression_tag` (`{'foo'}` between tags), and
//!   - attribute / `style:` directive values — `check_attribute`
//!     (`<div data-text={'a'} />`, `<div data-text="a{'b c'}d" />`).
//!
//! Detection mirrors upstream `verify()`:
//!   - the expression must be a string `Literal` or a `TemplateLiteral` with no
//!     `${…}` interpolation (and, for templates, no newline in the raw text);
//!   - a raw value containing `{` is skipped;
//!   - `ignoreIncludesComment` skips mustaches whose interior holds a comment;
//!   - `ignoreStringEscape` skips mustaches whose raw value carries a "useful"
//!     escape (`\n \r \v \t \b \f \u \x`).
//!
//! Autofix mirrors upstream `fix()` exactly: it is suppressed when the mustache
//! holds a comment or a useful escape, or when the stripped text contains a
//! newline / leading-or-trailing whitespace. In attribute context the
//! replacement HTML-escapes the surrounding quote (`"` → `&quot;`, `'` → `&apos;`),
//! wrapping the whole value in `"` when the attribute was unquoted; in text
//! context `<`/`>` become `&lt;`/`&gt;`.

use rsvelte_core::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, ExpressionTag, StyleDirective,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-useless-mustaches",
    category: RuleCategory::Style,
    fixable: Fixable::Code,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow unnecessary mustache interpolations",
    options_schema: Some(
        r#"{"type":"object","properties":{"ignoreIncludesComment":{"type":"boolean"},"ignoreStringEscape":{"type":"boolean"}},"additionalProperties":false}"#,
    ),
};

const MESSAGE: &str = "Unexpected mustache interpolation with a string literal value.";

/// The classification of a mustache's expression for this rule.
struct Analyzed {
    /// Whether the raw value carries a "useful" escape (`\n`, `\r`, …).
    has_escape: bool,
    /// Whether the mustache interior contains a `//` or `/*` comment.
    has_comment: bool,
}

/// Analyze a mustache, returning `Some` when it is a "useless" string-valued
/// mustache that should be reported (subject to the option gates), or `None`.
///
/// `tag_slice` is the full mustache source (`{ … }`); `expr_slice` is the source
/// of the expression node only (the literal text including its delimiters).
fn analyze(
    expr_type: Option<&str>,
    expr_slice: &str,
    tag_slice: &str,
    ignore_includes_comment: bool,
    ignore_string_escape: bool,
) -> Option<Analyzed> {
    let raw_value = match expr_type {
        Some("Literal") => {
            // String literals only — a number/regex/bigint literal is not a
            // string. Detect via the opening delimiter of the expression text.
            let bytes = expr_slice.as_bytes();
            let first = *bytes.first()?;
            if first != b'\'' && first != b'"' {
                return None;
            }
            strip_delimiters(expr_slice)?.to_string()
        }
        Some("TemplateLiteral") => {
            // Skip interpolated templates (`{`a${b}`}`).
            if has_interpolation(expr_slice) {
                return None;
            }
            let inner = strip_delimiters(expr_slice)?;
            // Skip templates whose raw text spans multiple lines.
            if inner.contains('\n') || inner.contains('\r') {
                return None;
            }
            inner.to_string()
        }
        _ => return None,
    };

    let has_comment = slice_has_comment(tag_slice);
    if ignore_includes_comment && has_comment {
        return None;
    }

    // A raw value containing `{` is ambiguous with mustache syntax; skip it.
    if raw_value.contains('{') {
        return None;
    }

    let has_escape = raw_value_has_useful_escape(&raw_value);
    if ignore_string_escape && has_escape {
        return None;
    }

    Some(Analyzed {
        has_escape,
        has_comment,
    })
}

/// Strip a matching leading/trailing `'`, `"` or backtick delimiter, mirroring
/// upstream `stripQuotes`. Returns `None` when the text is not so delimited.
fn strip_delimiters(text: &str) -> Option<&str> {
    let bytes = text.as_bytes();
    if bytes.len() < 2 {
        return None;
    }
    let first = bytes[0];
    let last = bytes[bytes.len() - 1];
    if (first == b'\'' || first == b'"' || first == b'`') && first == last {
        Some(&text[1..text.len() - 1])
    } else {
        None
    }
}

/// Whether a template-literal source (`` `…` ``) contains an `${…}`
/// interpolation. An escaped `\${` is not an interpolation.
fn has_interpolation(template_slice: &str) -> bool {
    let bytes = template_slice.as_bytes();
    let n = bytes.len();
    let mut i = 0;
    while i + 1 < n {
        match bytes[i] {
            b'\\' => {
                i += 2;
                continue;
            }
            b'$' if bytes[i + 1] == b'{' => return true,
            _ => {}
        }
        i += 1;
    }
    false
}

/// Whether the raw value carries a "useful" escape: a backslash followed by one
/// of `n r v t b f u x`. Mirrors upstream's escape scan (which only runs when
/// `rawValue !== strValue`; here we scan unconditionally — equivalent, because a
/// value with no backslash has no escape to find).
fn raw_value_has_useful_escape(raw_value: &str) -> bool {
    let chars: Vec<char> = raw_value.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        if chars[i] == '\\' {
            // Look at the escaped character.
            match chars.get(i + 1) {
                None => return true, // trailing backslash, upstream `c == null`
                Some(c) if "nrvtbfux".contains(*c) => return true,
                Some(_) => {
                    // Ignore "\\", '\"', "\'", "\`" and "\$": skip both chars.
                    i += 2;
                    continue;
                }
            }
        }
        i += 1;
    }
    false
}

/// Whether a mustache source slice contains a `//` or `/*` comment, ignoring
/// `/` characters inside string / template literals.
fn slice_has_comment(s: &str) -> bool {
    let bytes = s.as_bytes();
    let n = bytes.len();
    let mut i = 0;
    while i < n {
        match bytes[i] {
            b'"' | b'\'' | b'`' => {
                i = skip_string(bytes, i);
                continue;
            }
            b'/' if i + 1 < n && (bytes[i + 1] == b'/' || bytes[i + 1] == b'*') => return true,
            _ => {}
        }
        i += 1;
    }
    false
}

/// Skip a string/template literal beginning at the opening quote `bytes[i]`,
/// returning the index just past the closing (unescaped) quote.
fn skip_string(bytes: &[u8], mut i: usize) -> usize {
    let n = bytes.len();
    let quote = bytes[i];
    i += 1;
    while i < n {
        let c = bytes[i];
        if c == b'\\' && i + 1 < n {
            i += 2;
            continue;
        }
        i += 1;
        if c == quote {
            break;
        }
    }
    i
}

/// Apply `/\\([\s\S])/g -> $1`: drop every escaping backslash, keeping the
/// escaped character. Mirrors upstream's `unescaped` computation.
fn unescape(text: &str) -> String {
    let chars: Vec<char> = text.chars().collect();
    let mut out = String::with_capacity(text.len());
    let mut i = 0;
    while i < chars.len() {
        if chars[i] == '\\' && i + 1 < chars.len() {
            out.push(chars[i + 1]);
            i += 2;
        } else {
            out.push(chars[i]);
            i += 1;
        }
    }
    out
}

/// Build the autofix text replacement for the mustache, in **text** context.
/// Returns `None` when no fix should be produced.
fn text_fix(tag: &ExpressionTag, expr_slice: &str, a: &Analyzed) -> Option<Fix> {
    let unescaped = prepare_unescaped(expr_slice, a)?;
    let replacement = unescaped.replace('<', "&lt;").replace('>', "&gt;");
    Some(Fix {
        message: MESSAGE.to_string(),
        edits: vec![TextEdit {
            start: tag.start,
            end: tag.end,
            new_text: replacement,
        }],
    })
}

/// Shared fix preamble: strip quotes, bail on newline / surrounding whitespace,
/// and unescape. Mirrors upstream's `stripQuotes` + the indent/eol guard +
/// `unescaped`.
fn prepare_unescaped(expr_slice: &str, a: &Analyzed) -> Option<String> {
    if a.has_comment || a.has_escape {
        return None;
    }
    let text = strip_delimiters(expr_slice)?;
    if text.contains('\n')
        || text.starts_with(|c: char| c.is_whitespace())
        || text.ends_with(|c: char| c.is_whitespace())
    {
        return None;
    }
    Some(unescape(text))
}

#[derive(Default)]
pub struct NoUselessMustaches;

impl NoUselessMustaches {
    /// Report (and maybe fix) a text-position mustache.
    fn check_text_tag(&self, ctx: &mut LintContext, tag: &ExpressionTag) {
        let Some(expr_slice) = expr_slice(ctx, tag) else {
            return;
        };
        let tag_slice = ctx.slice(tag.start, tag.end);
        let ignore_includes_comment = ctx.option_bool("ignoreIncludesComment", false);
        let ignore_string_escape = ctx.option_bool("ignoreStringEscape", false);
        let Some(a) = analyze(
            tag.expression.node_type(),
            expr_slice,
            tag_slice,
            ignore_includes_comment,
            ignore_string_escape,
        ) else {
            return;
        };
        // `expr_slice` borrows the file source (lifetime `'a`), not `ctx`, so it
        // stays valid across the mutable `ctx.report*` call below.
        match text_fix(tag, expr_slice, &a) {
            Some(fix) => ctx.report_with_fix(tag.start, tag.end, MESSAGE, fix),
            None => ctx.report(tag.start, tag.end, MESSAGE),
        }
    }

    /// Report (and maybe fix) a mustache that is one part of an attribute / style
    /// directive value. `node_start` is the start of the owning attribute /
    /// directive (used to find the `key=` divider). `(first_start, last_end)`
    /// bound the whole value (for the unquoted-wrap insertion points).
    fn check_value_tag(
        &self,
        ctx: &mut LintContext,
        tag: &ExpressionTag,
        node_start: u32,
        first_start: u32,
        last_end: u32,
    ) {
        let Some(expr_slice) = expr_slice(ctx, tag) else {
            return;
        };
        let tag_slice = ctx.slice(tag.start, tag.end);
        let ignore_includes_comment = ctx.option_bool("ignoreIncludesComment", false);
        let ignore_string_escape = ctx.option_bool("ignoreStringEscape", false);
        let Some(a) = analyze(
            tag.expression.node_type(),
            expr_slice,
            tag_slice,
            ignore_includes_comment,
            ignore_string_escape,
        ) else {
            return;
        };

        // Determine the divider between the attribute key and the value start:
        // the source from the assignment `=` up to the first value part.
        // Both `expr_slice` and `head` borrow the file source, not `ctx`.
        let head = ctx.slice(node_start, first_start);
        let quote_kind = match head.rfind('=') {
            Some(eq) => {
                let div = &head[eq..];
                if div.ends_with('"') {
                    QuoteKind::Double
                } else if div.ends_with('\'') {
                    QuoteKind::Single
                } else {
                    QuoteKind::None
                }
            }
            None => QuoteKind::None,
        };

        let fix = build_value_fix(tag, expr_slice, &a, quote_kind, first_start, last_end);
        match fix {
            Some(fix) => ctx.report_with_fix(tag.start, tag.end, MESSAGE, fix),
            None => ctx.report(tag.start, tag.end, MESSAGE),
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum QuoteKind {
    Double,
    Single,
    None,
}

/// Build the autofix for an attribute / style-directive value mustache.
fn build_value_fix(
    tag: &ExpressionTag,
    expr_slice: &str,
    a: &Analyzed,
    quote_kind: QuoteKind,
    first_start: u32,
    last_end: u32,
) -> Option<Fix> {
    let unescaped = prepare_unescaped(expr_slice, a)?;
    let edits = match quote_kind {
        QuoteKind::Double => vec![TextEdit {
            start: tag.start,
            end: tag.end,
            new_text: unescaped.replace('"', "&quot;"),
        }],
        QuoteKind::Single => vec![TextEdit {
            start: tag.start,
            end: tag.end,
            new_text: unescaped.replace('\'', "&apos;"),
        }],
        QuoteKind::None => {
            // Wrap the whole value in double quotes. Upstream emits three
            // separate edits (insert `"` before the first value part, replace
            // the tag, insert `"` after the last value part). When the tag is
            // itself the first / last value part the insert position coincides
            // with the replace boundary; the naive `Fix::apply` would corrupt
            // such same-offset edits, so fold the boundary quote(s) directly
            // into the replacement text and only keep separate inserts for the
            // non-coincident ends.
            let mut new_text = unescaped.replace('"', "&quot;");
            let mut edits = Vec::with_capacity(3);
            if first_start == tag.start {
                new_text.insert(0, '"');
            } else {
                edits.push(TextEdit {
                    start: first_start,
                    end: first_start,
                    new_text: "\"".to_string(),
                });
            }
            if last_end == tag.end {
                new_text.push('"');
            } else {
                edits.push(TextEdit {
                    start: last_end,
                    end: last_end,
                    new_text: "\"".to_string(),
                });
            }
            edits.push(TextEdit {
                start: tag.start,
                end: tag.end,
                new_text,
            });
            edits
        }
    };
    Some(Fix {
        message: MESSAGE.to_string(),
        edits,
    })
}

/// The exact source text of a mustache's expression node, or `None` when the
/// expression has no recorded span. The returned slice borrows the file source
/// (lifetime `'a`), not the `ctx` handle, so the caller may still mutate `ctx`.
fn expr_slice<'a>(ctx: &LintContext<'a>, tag: &ExpressionTag) -> Option<&'a str> {
    let start = tag.expression.start()?;
    let end = tag.expression.end()?;
    Some(ctx.slice(start, end))
}

/// The `(first_part_start, last_part_end)` byte span of an attribute value.
fn value_bounds(value: &AttributeValue) -> Option<(u32, u32)> {
    match value {
        AttributeValue::Expression(tag) => Some((tag.start, tag.end)),
        AttributeValue::Sequence(parts) => {
            let first = parts.first()?;
            let last = parts.last()?;
            Some((part_start(first), part_end(last)))
        }
        AttributeValue::True(_) => None,
    }
}

fn part_start(part: &AttributeValuePart) -> u32 {
    match part {
        AttributeValuePart::Text(t) => t.start,
        AttributeValuePart::ExpressionTag(t) => t.start,
    }
}

fn part_end(part: &AttributeValuePart) -> u32 {
    match part {
        AttributeValuePart::Text(t) => t.end,
        AttributeValuePart::ExpressionTag(t) => t.end,
    }
}

impl NoUselessMustaches {
    fn check_attr_value(&self, ctx: &mut LintContext, node_start: u32, value: &AttributeValue) {
        let Some((first_start, last_end)) = value_bounds(value) else {
            return;
        };
        match value {
            AttributeValue::Expression(tag) => {
                let tag = tag.clone();
                self.check_value_tag(ctx, &tag, node_start, first_start, last_end);
            }
            AttributeValue::Sequence(parts) => {
                // Clone the tags up front so the borrow of `value` doesn't
                // conflict with `&mut ctx` inside the loop.
                let tags: Vec<ExpressionTag> = parts
                    .iter()
                    .filter_map(|p| match p {
                        AttributeValuePart::ExpressionTag(t) => Some(t.clone()),
                        AttributeValuePart::Text(_) => None,
                    })
                    .collect();
                for tag in &tags {
                    self.check_value_tag(ctx, tag, node_start, first_start, last_end);
                }
            }
            AttributeValue::True(_) => {}
        }
    }
}

impl Rule for NoUselessMustaches {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_expression_tag(&self, ctx: &mut LintContext, tag: &ExpressionTag) {
        self.check_text_tag(ctx, tag);
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        match attr {
            Attribute::Attribute(node) => {
                let AttributeNode { start, value, .. } = node;
                self.check_attr_value(ctx, *start, value);
            }
            Attribute::StyleDirective(dir) => {
                let StyleDirective { start, value, .. } = dir;
                self.check_attr_value(ctx, *start, value);
            }
            _ => {}
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strip_delimiters_basic() {
        assert_eq!(strip_delimiters("'foo'"), Some("foo"));
        assert_eq!(strip_delimiters("\"foo\""), Some("foo"));
        assert_eq!(strip_delimiters("`foo`"), Some("foo"));
        // Mismatched / undelimited.
        assert_eq!(strip_delimiters("foo"), None);
        assert_eq!(strip_delimiters("'foo\""), None);
        assert_eq!(strip_delimiters("'"), None);
    }

    #[test]
    fn interpolation_detection() {
        assert!(has_interpolation("`foo${bar}`"));
        assert!(!has_interpolation("`foo`"));
        // Escaped `\${` is not an interpolation.
        assert!(!has_interpolation("`foo\\${bar}`"));
    }

    #[test]
    fn useful_escape_detection() {
        assert!(raw_value_has_useful_escape("\\n"));
        assert!(raw_value_has_useful_escape("\\r"));
        assert!(raw_value_has_useful_escape("\\u0041"));
        // `\\` (escaped backslash) and `\'` etc. are not "useful".
        assert!(!raw_value_has_useful_escape("\\\\"));
        assert!(!raw_value_has_useful_escape("\\\\r"));
        assert!(!raw_value_has_useful_escape("plain"));
        assert!(!raw_value_has_useful_escape("a b"));
    }

    #[test]
    fn comment_detection_is_quote_aware() {
        assert!(slice_has_comment("{/* c */ 'x'}"));
        assert!(slice_has_comment("{// c\n 'x'}"));
        // A `//` inside a string is not a comment.
        assert!(!slice_has_comment("{'a // b'}"));
        assert!(!slice_has_comment("{'a'}"));
    }

    #[test]
    fn unescape_drops_backslashes() {
        assert_eq!(unescape("\\\\"), "\\"); // \\  -> \
        assert_eq!(unescape("\\\\r"), "\\r"); // \\r -> \r (literal backslash + r)
        assert_eq!(unescape("\\\\"), "\\");
        assert_eq!(unescape("a b"), "a b");
        assert_eq!(unescape("\\'\""), "'\""); // \'"  -> '"
    }

    #[test]
    fn analyze_skips_brace_in_raw_value() {
        let a = analyze(Some("Literal"), "'{foo'", "{'{foo'}", false, false);
        assert!(a.is_none());
    }

    #[test]
    fn analyze_reports_plain_string() {
        let a = analyze(Some("Literal"), "'foo'", "{'foo'}", false, false).unwrap();
        assert!(!a.has_escape);
        assert!(!a.has_comment);
    }

    #[test]
    fn analyze_skips_number_literal() {
        assert!(analyze(Some("Literal"), "1", "{1}", false, false).is_none());
    }

    #[test]
    fn analyze_template_with_interpolation_skipped() {
        assert!(
            analyze(
                Some("TemplateLiteral"),
                "`a${b}`",
                "{`a${b}`}",
                false,
                false
            )
            .is_none()
        );
    }

    #[test]
    fn analyze_template_with_newline_skipped() {
        assert!(analyze(Some("TemplateLiteral"), "`a\nb`", "{`a\nb`}", false, false).is_none());
    }

    #[test]
    fn analyze_ignore_comment_option() {
        // Without the option, a commented mustache is still reported.
        assert!(analyze(Some("Literal"), "'x'", "{/* c */ 'x'}", false, false).is_some());
        // With the option it is skipped.
        assert!(analyze(Some("Literal"), "'x'", "{/* c */ 'x'}", true, false).is_none());
    }

    #[test]
    fn analyze_ignore_escape_option() {
        assert!(analyze(Some("Literal"), "'\\n'", "{'\\n'}", false, false).is_some());
        assert!(analyze(Some("Literal"), "'\\n'", "{'\\n'}", false, true).is_none());
    }
}
