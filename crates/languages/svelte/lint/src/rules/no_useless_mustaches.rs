use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::Component;
use rsvelte_typescript::Kind;
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
            fix(component, source, mustache, text)
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
fn fix(component: &Component, source: &str, mustache: Mustache<'_>, text: &str) -> Option<Fix> {
    let text = strip_quotes(text)?;
    // Another rule (indentation, trailing spaces) may change spaces at either end.
    if text.contains('\n') || text.starts_with(is_space) || text.ends_with(is_space) {
        return None;
    }
    let unescaped = unescape(text);
    let attribute = match mustache.holder {
        Holder::Attribute(attribute) | Holder::Style(attribute) => attribute,
        Holder::Text | Holder::Raw => {
            return Some(Fix::replace(
                mustache.span,
                unescaped.replace('<', "&lt;").replace('>', "&gt;"),
            ));
        }
    };
    Some(match quote(component, source, attribute) {
        Some("'") => Fix::replace(mustache.span, unescaped.replace('\'', "&apos;")),
        Some(_) => Fix::replace(mustache.span, unescaped.replace('"', "&quot;")),
        None => {
            let value = parts(component, attribute);
            let start = part_span(value.first()?).start_offset;
            let end = part_span(value.last()?).end_offset;
            let mut fix = Fix::insert(start, "\"");
            fix.push(mustache.span, unescaped.replace('"', "&quot;"));
            fix.push(Span::new(end, end), "\"");
            fix
        }
    })
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

/// JavaScript's `\s`.
const fn is_space(c: char) -> bool {
    c.is_whitespace() || c == '\u{feff}'
}
