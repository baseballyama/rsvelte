use oxc_ast::AstKind;
use oxc_ast::ast::Expression;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::shared::nodes::span;
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-add-event-listener",
    files: Files::All,
    category: Category::Pedantic,
    configure: without_options::<NoAddEventListener>,
};

#[derive(Debug, Default)]
struct NoAddEventListener;

impl SvelteRule for NoAddEventListener {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let source = file.source();
        for node in file.nodes().iter() {
            let AstKind::CallExpression(call) = node.kind() else {
                continue;
            };
            // A cast callee is a `TSAsExpression`, which is neither a member nor a name.
            let object = match &call.callee {
                Expression::StaticMemberExpression(member)
                    if member.property.name == "addEventListener" =>
                {
                    Some(&member.object)
                }
                // `property.name` is also an identifier's name inside brackets.
                Expression::ComputedMemberExpression(member)
                    if matches!(&member.expression, Expression::Identifier(property)
                        if property.name == "addEventListener") =>
                {
                    Some(&member.object)
                }
                Expression::Identifier(callee) if callee.name == "addEventListener" => None,
                _ => continue,
            };
            let target = object.map_or("window", |object| span(object).text(source));
            let callee = span(&call.callee);
            let mut report = Report::range(
                "Do not use `addEventListener`. Use the `on` function from `svelte/events` \
                 instead.",
                span(call),
            );
            if let Some(open) = next_token(source, callee.end_offset) {
                let mut fix = Fix::replace(callee, "on");
                fix.push(
                    Span::new(open.end_offset, open.end_offset),
                    format!("{target}, "),
                );
                report = report.suggest(Suggestion {
                    message: "Use `on` from `svelte/events` instead".to_owned(),
                    fix,
                });
            }
            reporter.report(report);
        }
    }
}

/// The token after a callee, past whitespace and comments: `(`, `?.` or the `<` of type
/// arguments.
fn next_token(source: &str, offset: u32) -> Option<Span> {
    let rest = source.get(offset as usize..)?;
    let mut at = 0;
    loop {
        let text = &rest[at..];
        let trimmed = text.trim_start();
        at += text.len() - trimmed.len();
        if trimmed.starts_with("//") {
            at += trimmed.find('\n')?;
        } else if let Some(comment) = trimmed.strip_prefix("/*") {
            at += 2 + comment.find("*/")? + 2;
        } else {
            let length = if trimmed.starts_with("?.") {
                2
            } else {
                trimmed.chars().next()?.len_utf8()
            };
            let start = offset + u32::try_from(at).ok()?;
            return Some(Span::new(start, start + u32::try_from(length).ok()?));
        }
    }
}
