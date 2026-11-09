use std::borrow::Cow;

use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{Component, TokenType, decode_attribute, decode_text};
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};
use serde::Deserialize;

use super::expressions::Expressions;
use super::markup::{Holder, Mustache, for_each_mustache, has_comment, part_span, parts, quote};
use super::node_span;
use super::string_escape::has_useful_escape;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-useless-mustaches",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Options {
    #[serde(default)]
    ignore_includes_comment: bool,
    #[serde(default)]
    ignore_string_escape: bool,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(NoUselessMustaches {
        ignore_includes_comment: options.ignore_includes_comment,
        ignore_string_escape: options.ignore_string_escape,
    }))
}

#[derive(Debug)]
struct NoUselessMustaches {
    ignore_includes_comment: bool,
    ignore_string_escape: bool,
}

impl SvelteRule for NoUselessMustaches {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let expressions = Expressions::new(&component.javascript, source);
        for_each_mustache(component, source, |mustache| {
            // `{'a' as string}` is not a literal to ESTree.
            if !expressions.asserted(mustache.expression) {
                self.verify(component, source, mustache, reporter);
            }
        });
    }
}

impl NoUselessMustaches {
    fn verify(
        &self,
        component: &Component,
        source: &str,
        mustache: Mustache<'_>,
        reporter: &mut Reporter<'_>,
    ) {
        let javascript = &component.javascript;
        let expression = mustache.expression;
        // The literal as written, quotes included.
        let text = node_span(javascript, expression).text(source);
        let raw = match javascript.kind(expression) {
            _ if matches!(mustache.holder, Holder::Raw) => return,
            Kind::String => &text[1..text.len() - 1],
            Kind::Template {
                quasis: &[quasi],
                expressions: &[],
            } => {
                let raw = javascript.str_value(quasi, source);
                if raw.contains(['\n', '\r']) {
                    return;
                }
                raw
            }
            _ => return,
        };
        let comment = has_comment(javascript, mustache.span);
        if self.ignore_includes_comment && comment {
            return;
        }
        if raw.contains('{') {
            return;
        }
        let escape = has_useful_escape(raw);
        if self.ignore_string_escape && escape {
            return;
        }
        let fix = if comment || escape {
            None
        } else {
            literal_value(javascript, source, expression)
                .and_then(|value| fix(component, source, mustache, text, &value))
        };
        let report = Report::range(
            "Unexpected mustache interpolation with a string literal value.",
            mustache.span,
        )
        .message_id("unexpected");
        reporter.report(match fix {
            Some(fix) => report.fix(fix),
            None => report,
        });
    }
}

/// The mustache as text: escaped for markup, and quoted when it becomes an attribute's value.
/// `None` when the markup would not decode to the literal's value.
fn fix(
    component: &Component,
    source: &str,
    mustache: Mustache<'_>,
    text: &str,
    value: &str,
) -> Option<Fix> {
    let text = strip_quotes(text)?;
    // Another rule (indentation, trailing spaces) may change spaces at either end.
    if text.contains('\n') || text.starts_with(is_space) || text.ends_with(is_space) {
        return None;
    }
    let unescaped = unescape(text);
    // `\0` is not `0`.
    if unescaped != value {
        return None;
    }
    let attribute = match mustache.holder {
        Holder::Attribute(attribute) | Holder::Style(attribute) => attribute,
        Holder::Text | Holder::Raw => {
            let replacement = unescaped.replace('<', "&lt;").replace('>', "&gt;");
            return decodes_to(
                component,
                source,
                mustache.span,
                &replacement,
                value,
                decode_text,
            )
            .then(|| Fix::replace(mustache.span, replacement));
        }
    };
    let quote = quote(component, source, attribute);
    let replacement = if quote == Some("'") {
        unescaped.replace('\'', "&apos;")
    } else {
        unescaped.replace('"', "&quot;")
    };
    if !decodes_to(
        component,
        source,
        mustache.span,
        &replacement,
        value,
        decode_attribute,
    ) {
        return None;
    }
    if quote.is_some() {
        return Some(Fix::replace(mustache.span, replacement));
    }
    let value = parts(component, attribute);
    let start = part_span(value.first()?).start_offset;
    let end = part_span(value.last()?).end_offset;
    let mut fix = Fix::insert(start, "\"");
    fix.push(mustache.span, replacement);
    fix.push(Span::new(end, end), "\"");
    Some(fix)
}

/// Whether `replacement` in place of the mustache at `span` decodes to `value` together with the
/// markup text next to it: `&amp;` is `&`, and `&am{'p;'}` is not `&amp;`. A character reference
/// that the next mustache could complete counts as not decoding.
fn decodes_to(
    component: &Component,
    source: &str,
    span: Span,
    replacement: &str,
    value: &str,
    decode: fn(&str) -> Cow<'_, str>,
) -> bool {
    let tokens = &component.tokens;
    let is_text = |kind| matches!(kind, TokenType::Text | TokenType::AttributeText);
    let before = tokens
        .within(Span::new(0, span.start_offset))
        .last()
        .filter(|t| t.span.end_offset == span.start_offset && is_text(t.kind))
        .map_or("", |t| t.span.text(source));
    let next = tokens
        .within(Span::new(span.end_offset, span.end_offset + 1))
        .first()
        .filter(|t| t.span.start_offset == span.end_offset);
    if replacement.contains('&') && next.is_some_and(|t| t.kind == TokenType::MustacheOpen) {
        return false;
    }
    let after = next
        .filter(|t| is_text(t.kind))
        .map_or("", |t| t.span.text(source));
    let joined = format!("{before}{replacement}{after}");
    decode(&joined) == format!("{}{value}{}", decode(before), decode(after))
}

/// The text between matching quotes or backticks.
fn strip_quotes(text: &str) -> Option<&str> {
    let first = text.chars().next()?;
    (matches!(first, '"' | '\'' | '`') && text.len() >= 2 && text.ends_with(first))
        .then(|| &text[1..text.len() - 1])
}

/// `\x` → `x`.
fn unescape(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut chars = text.chars();
    while let Some(c) = chars.next() {
        if c == '\\'
            && let Some(escaped) = chars.next()
        {
            out.push(escaped);
            continue;
        }
        out.push(c);
    }
    out
}

/// The string a string or template literal holds.
fn literal_value(javascript: &SyntaxTree, source: &str, literal: NodeIdentifier) -> Option<String> {
    match javascript.kind(literal) {
        Kind::String => Some(javascript.str_value(literal, source).to_owned()),
        Kind::Template {
            quasis: &[quasi], ..
        } => {
            let raw = javascript.str_value(quasi, source);
            Some(
                rsvelte_typescript_syntax::lexer::decode_string(raw)
                    .unwrap_or_else(|| raw.to_owned()),
            )
        }
        _ => None,
    }
}

/// JavaScript's `\s`.
const fn is_space(c: char) -> bool {
    c.is_whitespace() || c == '\u{feff}'
}
