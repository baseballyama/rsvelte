use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript::syntax_tree::TypeScriptKind;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::javascript::{span, walk};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-add-event-listener",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoAddEventListener))
}

#[derive(Debug)]
struct NoAddEventListener;

impl SvelteRule for NoAddEventListener {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let javascript = file.javascript();
        let source = file.source();
        let named = |node| {
            javascript.atom(node).map(|atom| javascript.atoms.get(atom)) == Some("addEventListener")
        };
        walk(file, |call| {
            let Kind::Call { callee, .. } = javascript.kind(call) else {
                return;
            };
            let target = match javascript.kind(callee) {
                Kind::Member {
                    object, property, ..
                } if named(property) => typed_span(javascript, object).text(source),
                Kind::Identifier(_) if named(callee) => "window",
                _ => return,
            };
            // A cast callee is a `TSAsExpression`, which is neither a member nor a name.
            if typed_span(javascript, callee) != span(javascript, callee) {
                return;
            }
            let callee_span = span(javascript, callee);
            let mut report = Report::range(
                "Do not use `addEventListener`. Use the `on` function from `svelte/events` \
                 instead.",
                span(javascript, call),
            )
            .message_id("unexpected");
            if let Some(open) = next_token(file, callee_span.end_offset) {
                let mut fix = Fix::replace(callee_span, "on");
                fix.push(
                    Span::new(open.end_offset, open.end_offset),
                    format!("{target}, "),
                );
                report = report.suggest(Suggestion {
                    message_id: None,
                    message: "Use `on` from `svelte/events` instead".to_owned(),
                    fix,
                });
            }
            reporter.report(report);
        });
    }
}

/// The span of `node` with the type syntax that wraps it (`e as T`, `e!`, `<T>e`), as `ESTree`'s
/// node for the cast spans it.
fn typed_span(javascript: &SyntaxTree, node: NodeIdentifier) -> Span {
    let mut out = span(javascript, node);
    for syntax in javascript
        .typescript
        .iter()
        .filter(|syntax| syntax.node == node)
    {
        match syntax.kind {
            TypeScriptKind::As | TypeScriptKind::Satisfies | TypeScriptKind::NonNull => {
                out.end_offset = out.end_offset.max(syntax.span.end_offset);
            }
            TypeScriptKind::Assertion => {
                out.start_offset = out.start_offset.min(syntax.span.start_offset);
            }
            _ => {}
        }
    }
    out
}

/// The first token, not a comment, at or after `offset`.
fn next_token(file: &File<'_>, offset: u32) -> Option<Span> {
    let javascript = file.javascript();
    let tokens = &javascript.tokens;
    tokens.after(offset).map(|token| tokens.get(token).span)
}
