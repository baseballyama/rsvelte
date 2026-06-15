//! `svelte/html-quotes` — enforce the quote style of HTML attribute values.
//!
//! Option (`options[0]`, an object):
//! - `prefer`: `"double"` (default) | `"single"` — the quote style for static
//!   attribute values.
//! - `dynamic.quoted`: `bool` (default `false`) — when `true`, dynamic values
//!   (`{...}` mustache / directive expressions) are expected to be wrapped in
//!   `prefer` quotes; when `false`, dynamic values are expected to be unquoted.
//! - `dynamic.avoidInvalidUnquotedInHTML`: `bool` (default `false`) — when the
//!   dynamic value's source text contains characters that would be invalid
//!   unquoted in HTML (`[\s"'<=>`]`), force `prefer` quotes regardless of
//!   `dynamic.quoted`.
//!
//! For each attribute/directive value the rule reconstructs upstream's
//! `QuoteAndRange` (the byte range of the value plus whether it is `unquoted` /
//! `double` / `single`) by scanning the source, then compares it against the
//! expected quote, reporting + fixing mismatches. Escapes are avoided: a fix is
//! suppressed when applying the preferred quote would require escaping an inner
//! quote character.
//!
//! Port of `eslint-plugin-svelte/src/rules/html-quotes.ts`.
//! Upstream: `meta.fixable = 'code'`, `type: 'layout'`.

use rsvelte_core::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, BindDirective, ClassDirective,
    OnDirective, StyleDirective, TransitionDirective,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/html-quotes",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce quotes style of HTML attributes",
    options_schema: Some(
        r#"[{"type":"object","properties":{"prefer":{"enum":["double","single"]},"dynamic":{"type":"object","properties":{"quoted":{"type":"boolean"},"avoidInvalidUnquotedInHTML":{"type":"boolean"}},"additionalProperties":false}},"additionalProperties":false}]"#,
    ),
};

#[derive(Clone, Copy, PartialEq, Eq)]
enum Quote {
    Unquoted,
    Double,
    Single,
}

impl Quote {
    fn ch(self) -> &'static str {
        match self {
            Quote::Double => "\"",
            Quote::Single => "'",
            Quote::Unquoted => "",
        }
    }
    fn name(self) -> &'static str {
        match self {
            Quote::Double => "double quotes",
            Quote::Single => "single quotes",
            Quote::Unquoted => "unquoted",
        }
    }
}

/// Mirrors upstream's `QuoteAndRange`: the byte range of the value (including
/// surrounding quotes when present) and the detected quote kind.
struct QuoteAndRange {
    quote: Quote,
    start: u32,
    end: u32,
}

/// Whether the given text can be left unquoted in HTML (`!/[\s"'<=>`]/u`).
fn can_be_unquoted_in_html(text: &str) -> bool {
    !text
        .chars()
        .any(|c| c.is_whitespace() || matches!(c, '"' | '\'' | '<' | '=' | '>' | '`'))
}

/// Find the byte offset just after the attribute *key* (the `=` if present, or
/// scanning past the `prefix:name`). We scan from `node_start` to the first
/// `=` or whitespace, then skip whitespace to the `=`.
fn find_eq(src: &[u8], node_start: u32, node_end: u32) -> Option<u32> {
    let end = node_end as usize;
    let mut pos = node_start as usize;
    // skip key
    while pos < end {
        let b = src[pos];
        if b == b'=' || b.is_ascii_whitespace() {
            break;
        }
        pos += 1;
    }
    // skip whitespace to `=`
    while pos < end && src[pos].is_ascii_whitespace() {
        pos += 1;
    }
    if pos < end && src[pos] == b'=' {
        Some(pos as u32)
    } else {
        None
    }
}

/// Build a [`QuoteAndRange`] given the inner value span `[inner_start,
/// inner_end)` (the value tokens, e.g. the `{...}` for an expression/directive,
/// or the text-content span for a static value). Scans the source between the
/// `=` and the value for an opening quote and matches it after the value.
fn quote_and_range(
    ctx: &LintContext,
    node_start: u32,
    node_end: u32,
    inner_start: u32,
    inner_end: u32,
) -> Option<QuoteAndRange> {
    let src = ctx.source().as_bytes();
    let eq = find_eq(src, node_start, node_end)?;
    if inner_start < eq + 1 {
        return None;
    }
    // Inspect the bytes between `=` and the value start.
    let between = &src[(eq + 1) as usize..inner_start as usize];
    if between.iter().all(|b| b.is_ascii_whitespace()) {
        // No quotes: unquoted.
        return Some(QuoteAndRange {
            quote: Quote::Unquoted,
            start: inner_start,
            end: inner_end,
        });
    }
    // There must be exactly one quote char (after optional whitespace) and
    // nothing else.
    let mut quote_pos: Option<usize> = None;
    for (i, &b) in between.iter().enumerate() {
        if b.is_ascii_whitespace() {
            // whitespace only allowed before the quote
            if quote_pos.is_some() {
                return None;
            }
            continue;
        }
        if (b == b'"' || b == b'\'') && quote_pos.is_none() {
            quote_pos = Some((eq + 1) as usize + i);
        } else {
            return None;
        }
    }
    let open = quote_pos?;
    // Only allow whitespace between the quote and the value start.
    if !src[open + 1..inner_start as usize]
        .iter()
        .all(|b| b.is_ascii_whitespace())
    {
        return None;
    }
    let open_ch = src[open];
    // The closing quote must immediately follow the value end.
    let close = inner_end as usize;
    if close >= src.len() || src[close] != open_ch {
        return None;
    }
    Some(QuoteAndRange {
        quote: if open_ch == b'"' {
            Quote::Double
        } else {
            Quote::Single
        },
        start: open as u32,
        end: (close + 1) as u32,
    })
}

struct Options {
    prefer: Quote,
    dynamic_quote: Quote,
    avoid_invalid_unquoted: bool,
}

fn options(ctx: &LintContext) -> Options {
    let opt = ctx.option0();
    let prefer = if opt.and_then(|v| v.get("prefer")).and_then(|v| v.as_str()) == Some("single") {
        Quote::Single
    } else {
        Quote::Double
    };
    let dynamic = opt.and_then(|v| v.get("dynamic"));
    let quoted = dynamic
        .and_then(|d| d.get("quoted"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    let dynamic_quote = if quoted { prefer } else { Quote::Unquoted };
    let avoid_invalid_unquoted = dynamic
        .and_then(|d| d.get("avoidInvalidUnquotedInHTML"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    Options {
        prefer,
        dynamic_quote,
        avoid_invalid_unquoted,
    }
}

#[derive(Default)]
pub struct HtmlQuotes;

impl HtmlQuotes {
    fn verify(&self, ctx: &mut LintContext, prefer: Quote, qr: QuoteAndRange) {
        if qr.quote == prefer {
            return;
        }
        let src = ctx.source();

        let mut expected = prefer;
        let message: &str;
        if qr.quote != Quote::Unquoted {
            if expected == Quote::Unquoted {
                message = "Unexpected to be enclosed by any quotes.";
            } else {
                let content = ctx.slice(qr.start + 1, qr.end - 1);
                if content.contains(expected.ch()) {
                    // avoid escape
                    return;
                }
                message = "Expected to be enclosed by {{kind}}.";
            }
        } else {
            let content = &src[qr.start as usize..qr.end as usize];
            let need_double = content.contains('"');
            let need_single = content.contains('\'');
            if need_double && need_single {
                return; // avoid escape
            }
            if need_double && expected == Quote::Double {
                expected = Quote::Single;
                message = "Expected to be enclosed by quotes.";
            } else if need_single && expected == Quote::Single {
                expected = Quote::Double;
                message = "Expected to be enclosed by quotes.";
            } else {
                message = "Expected to be enclosed by {{kind}}.";
            }
        }

        let final_message = message.replace("{{kind}}", expected.name());

        // Build two non-overlapping edits (open side / close side) that
        // reproduce upstream's net effect (insert/remove/replace) without
        // relying on overlapping-edit ordering.
        let had_quote = qr.quote != Quote::Unquoted;
        let want = expected != Quote::Unquoted;
        let mut edits = Vec::new();
        let open_end = if had_quote { qr.start + 1 } else { qr.start };
        edits.push(TextEdit {
            start: qr.start,
            end: open_end,
            new_text: if want {
                expected.ch().to_string()
            } else {
                String::new()
            },
        });
        let close_start = if had_quote { qr.end - 1 } else { qr.end };
        edits.push(TextEdit {
            start: close_start,
            end: qr.end,
            new_text: if want {
                expected.ch().to_string()
            } else {
                String::new()
            },
        });

        ctx.report_with_fix(
            qr.start,
            qr.end,
            final_message,
            Fix {
                message: "Fix quote style".to_string(),
                edits,
            },
        );
    }

    /// Verify a static attribute value (text / mixed content). The value span
    /// runs from the first part's start to the last part's end.
    fn verify_values(
        &self,
        ctx: &mut LintContext,
        node: &AttributeNode,
        parts: &[AttributeValuePart],
    ) {
        let Some(first) = parts.first() else {
            return;
        };
        let last = parts.last().unwrap();
        let inner_start = part_start(first);
        let inner_end = part_end(last);
        let opts = options(ctx);
        if let Some(qr) = quote_and_range(ctx, node.start, node.end, inner_start, inner_end) {
            self.verify(ctx, opts.prefer, qr);
        }
    }

    /// Verify a dynamic single-mustache attribute value (`name={...}` or
    /// `name="{...}"`). The inner span is the `{...}` tag.
    fn verify_dynamic(
        &self,
        ctx: &mut LintContext,
        node: &AttributeNode,
        inner_start: u32,
        inner_end: u32,
    ) {
        let opts = options(ctx);
        if let Some(qr) = quote_and_range(ctx, node.start, node.end, inner_start, inner_end) {
            let text = ctx.slice(inner_start, inner_end).to_string();
            let prefer = if opts.avoid_invalid_unquoted && !can_be_unquoted_in_html(&text) {
                opts.prefer
            } else {
                opts.dynamic_quote
            };
            self.verify(ctx, prefer, qr);
        }
    }

    /// Verify a directive whose value is an optional expression: skip when there
    /// is no expression, or when it is the shorthand form (no explicit `={...}`).
    fn verify_directive_expr(
        &self,
        ctx: &mut LintContext,
        node_start: u32,
        node_end: u32,
        expression: Option<&rsvelte_core::ast::js::Expression>,
    ) {
        if let Some(expr) = expression
            && let (Some(es), Some(ee)) = (expr.start(), expr.end())
            && !is_shorthand_directive(ctx, node_start, es, ee)
        {
            self.verify_directive(ctx, node_start, node_end, es, ee);
        }
    }

    /// Verify a directive value (`name={...}`). We locate the `{...}` braces by
    /// scanning out from the expression span to the enclosing `{` / `}`.
    fn verify_directive(
        &self,
        ctx: &mut LintContext,
        node_start: u32,
        node_end: u32,
        expr_start: u32,
        expr_end: u32,
    ) {
        let src = ctx.source().as_bytes();
        // Find the enclosing `{` scanning back from expr_start.
        let mut i = expr_start as usize;
        let lo = node_start as usize;
        let mut open_brace = None;
        while i > lo {
            i -= 1;
            let b = src[i];
            if b == b'{' {
                open_brace = Some(i as u32);
                break;
            }
            if !b.is_ascii_whitespace() && b != b'"' && b != b'\'' && b != b'(' {
                break;
            }
        }
        let Some(brace_start) = open_brace else {
            return;
        };
        // Find the enclosing `}` scanning forward from expr_end.
        let mut j = expr_end as usize;
        let hi = node_end as usize;
        let mut close_brace = None;
        while j < hi {
            let b = src[j];
            if b == b'}' {
                close_brace = Some((j + 1) as u32);
                break;
            }
            if !b.is_ascii_whitespace() && b != b'"' && b != b'\'' && b != b')' {
                break;
            }
            j += 1;
        }
        let Some(brace_end) = close_brace else {
            return;
        };

        let opts = options(ctx);
        if let Some(qr) = quote_and_range(ctx, node_start, node_end, brace_start, brace_end) {
            let text = ctx.slice(brace_start, brace_end).to_string();
            let prefer = if opts.avoid_invalid_unquoted && !can_be_unquoted_in_html(&text) {
                opts.prefer
            } else {
                opts.dynamic_quote
            };
            self.verify(ctx, prefer, qr);
        }
    }
}

fn part_start(p: &AttributeValuePart) -> u32 {
    match p {
        AttributeValuePart::Text(t) => t.start,
        AttributeValuePart::ExpressionTag(e) => e.start,
    }
}

fn part_end(p: &AttributeValuePart) -> u32 {
    match p {
        AttributeValuePart::Text(t) => t.end,
        AttributeValuePart::ExpressionTag(e) => e.end,
    }
}

impl Rule for HtmlQuotes {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        match attr {
            Attribute::Attribute(node) => match &node.value {
                AttributeValue::Expression(tag) => {
                    // `name={...}` — dynamic single mustache.
                    self.verify_dynamic(ctx, node, tag.start, tag.end);
                }
                AttributeValue::Sequence(parts) => {
                    if parts.len() == 1
                        && let AttributeValuePart::ExpressionTag(tag) = &parts[0]
                    {
                        // `name="{...}"` — dynamic single mustache.
                        self.verify_dynamic(ctx, node, tag.start, tag.end);
                        return;
                    }
                    if !parts.is_empty() {
                        self.verify_values(ctx, node, parts);
                    }
                }
                AttributeValue::True(_) => {}
            },
            // Directives carry an expression; verify the `{...}` value quoting.
            Attribute::BindDirective(BindDirective {
                start,
                end,
                expression,
                ..
            }) => self.verify_directive_expr(ctx, *start, *end, Some(expression)),
            Attribute::ClassDirective(ClassDirective {
                start,
                end,
                expression,
                ..
            }) => self.verify_directive_expr(ctx, *start, *end, Some(expression)),
            Attribute::OnDirective(OnDirective {
                start,
                end,
                expression: Some(expression),
                ..
            }) => self.verify_directive_expr(ctx, *start, *end, Some(expression)),
            Attribute::TransitionDirective(TransitionDirective {
                start,
                end,
                expression: Some(expression),
                ..
            }) => self.verify_directive_expr(ctx, *start, *end, Some(expression)),
            Attribute::AnimateDirective(d) => {
                self.verify_directive_expr(ctx, d.start, d.end, d.expression.as_ref())
            }
            Attribute::UseDirective(d) => {
                self.verify_directive_expr(ctx, d.start, d.end, d.expression.as_ref())
            }
            Attribute::LetDirective(d) => {
                self.verify_directive_expr(ctx, d.start, d.end, d.expression.as_ref())
            }
            // StyleDirective behaves like a standard attribute (text / mustache
            // sequence value).
            Attribute::StyleDirective(StyleDirective {
                start, end, value, ..
            }) => match value {
                AttributeValue::Expression(tag) => {
                    self.verify_dynamic_span(ctx, *start, *end, tag.start, tag.end);
                }
                AttributeValue::Sequence(parts) => {
                    if parts.len() == 1
                        && let AttributeValuePart::ExpressionTag(tag) = &parts[0]
                    {
                        self.verify_dynamic_span(ctx, *start, *end, tag.start, tag.end);
                        return;
                    }
                    if let (Some(first), Some(last)) = (parts.first(), parts.last()) {
                        let opts = options(ctx);
                        if let Some(qr) =
                            quote_and_range(ctx, *start, *end, part_start(first), part_end(last))
                        {
                            self.verify(ctx, opts.prefer, qr);
                        }
                    }
                }
                AttributeValue::True(_) => {}
            },
            Attribute::SpreadAttribute(_) | Attribute::AttachTag(_) => {}
            // `on:`/`transition:` etc. without an expression (e.g. `on:click`
            // shorthand-less, or `transition:fade` with no value) — nothing to
            // quote.
            Attribute::OnDirective(_) | Attribute::TransitionDirective(_) => {}
        }
    }
}

impl HtmlQuotes {
    /// `verify_dynamic` for non-`AttributeNode` carriers (StyleDirective).
    fn verify_dynamic_span(
        &self,
        ctx: &mut LintContext,
        node_start: u32,
        node_end: u32,
        inner_start: u32,
        inner_end: u32,
    ) {
        let opts = options(ctx);
        if let Some(qr) = quote_and_range(ctx, node_start, node_end, inner_start, inner_end) {
            let text = ctx.slice(inner_start, inner_end).to_string();
            let prefer = if opts.avoid_invalid_unquoted && !can_be_unquoted_in_html(&text) {
                opts.prefer
            } else {
                opts.dynamic_quote
            };
            self.verify(ctx, prefer, qr);
        }
    }
}

/// A directive is "shorthand" (`bind:value`, `class:foo`) when the parsed
/// expression range is contained within the key span — i.e. there is no
/// explicit `={...}`. We detect it by checking for an `=` between the key and
/// the expression.
fn is_shorthand_directive(
    ctx: &LintContext,
    node_start: u32,
    expr_start: u32,
    _expr_end: u32,
) -> bool {
    let src = ctx.source().as_bytes();
    let from = node_start as usize;
    let to = (expr_start as usize).min(src.len());
    if from >= to {
        return true;
    }
    !src[from..to].contains(&b'=')
}
