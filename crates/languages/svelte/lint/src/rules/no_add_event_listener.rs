use oxc_ast::AstKind;
use oxc_ast::ast::Expression;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_tree::node_span;

use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-add-event-listener",
    files: Files::All,
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
            let target = object.map_or("window", |object| node_span(object).text(source));
            let callee = node_span(&call.callee);
            let mut report = Report::range(
                "Do not use `addEventListener`. Use the `on` function from `svelte/events` \
                 instead.",
                node_span(call),
            );
            if let Some(open) = next_token(file, callee.end_offset) {
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
fn next_token(file: &File<'_>, mut at: u32) -> Option<Span> {
    let source = file.source();
    let comments = file.comments();
    let mut comment = comments.partition_point(|c| c.span.start_offset < at);
    loop {
        let rest = source.get(at as usize..)?;
        let trimmed = rest.trim_start_matches(is_ecmascript_whitespace);
        at += u32::try_from(rest.len() - trimmed.len()).ok()?;
        match comments.get(comment) {
            Some(c) if c.span.start_offset == at => {
                at = c.span.end_offset;
                comment += 1;
            }
            _ => {
                let length = if trimmed.starts_with("?.") {
                    2
                } else {
                    trimmed.chars().next()?.len_utf8()
                };
                return Some(Span::new(at, at + u32::try_from(length).ok()?));
            }
        }
    }
}
