use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_syntax::syntax_tree::TypeScriptKind;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

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
        let mut typed: Option<FxHashMap<NodeIdentifier, Span>> = None;
        walk(file, |call| {
            let Kind::Call { callee, .. } = javascript.kind(call) else {
                return;
            };
            let object = match javascript.kind(callee) {
                Kind::Member {
                    object, property, ..
                } if named(property) => Some(object),
                Kind::Identifier(_) if named(callee) => None,
                _ => return,
            };
            let typed = typed.get_or_insert_with(|| typed_spans(javascript));
            let typed_span = |node| {
                typed
                    .get(&node)
                    .copied()
                    .unwrap_or_else(|| span(javascript, node))
            };
            let target = object.map_or("window", |object| typed_span(object).text(source));
            // A cast callee is a `TSAsExpression`, which is neither a member nor a name.
            if typed_span(callee) != span(javascript, callee) {
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

/// The span of each node that type syntax wraps (`e as T`, `e!`, `<T>e`), with that syntax, as
/// `ESTree`'s node for the cast spans it.
fn typed_spans(javascript: &SyntaxTree) -> FxHashMap<NodeIdentifier, Span> {
    let mut out: FxHashMap<NodeIdentifier, Span> = FxHashMap::default();
    for syntax in &javascript.typescript {
        let wraps_end = match syntax.kind {
            TypeScriptKind::As | TypeScriptKind::Satisfies | TypeScriptKind::NonNull => true,
            TypeScriptKind::Assertion => false,
            _ => continue,
        };
        let at = out
            .entry(syntax.node)
            .or_insert_with(|| span(javascript, syntax.node));
        if wraps_end {
            at.end_offset = at.end_offset.max(syntax.span.end_offset);
        } else {
            at.start_offset = at.start_offset.min(syntax.span.start_offset);
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
