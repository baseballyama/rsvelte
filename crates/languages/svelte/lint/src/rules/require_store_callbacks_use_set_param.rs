use rsvelte_kernel::index::TypedIndex;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::TokenIdentifier;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript::Kind;
use rsvelte_typescript::lexer::T;

use super::javascript::span;
use super::svelte_store::{Scopes, rename, store_calls};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/require-store-callbacks-use-set-param",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(RequireStoreCallbacksUseSetParam))
}

#[derive(Debug)]
struct RequireStoreCallbacksUseSetParam;

impl SvelteRule for RequireStoreCallbacksUseSetParam {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let javascript = file.javascript();
        let calls = store_calls(file, &["readable", "writable"]);
        if calls.is_empty() {
            return;
        }
        let scopes = Scopes::new(file);
        for (call, _) in calls {
            let Kind::Call { arguments, .. } = javascript.kind(call) else {
                continue;
            };
            let Some(&function) = arguments.get(1) else {
                continue;
            };
            let (Kind::Function {
                parameters, body, ..
            }
            | Kind::Arrow {
                parameters, body, ..
            }) = javascript.kind(function)
            else {
                continue;
            };
            let parameter = parameters.first().copied();
            let name = match parameter {
                None => None,
                Some(parameter) => match javascript.atom(parameter) {
                    Some(atom) if javascript.atoms.get(atom) != "set" => {
                        Some(javascript.atoms.get(atom))
                    }
                    _ => continue,
                },
            };
            let mut report = Report::range(
                "Store callbacks must use `set` param.",
                span(javascript, function),
            )
            .message_id("unexpected");
            if let Ok(binding) = scopes.replaceable(file, function, name, "set") {
                if let (Some(parameter), Some(name)) = (parameter, name) {
                    report = report.suggest(Suggestion {
                        message_id: Some("updateParam".into()),
                        message: format!("Rename parameter from {name} to `set`."),
                        fix: rename(file, parameter, binding, "set"),
                    });
                } else if let Some(open) = open_parenthesis_before(file, span(javascript, body)) {
                    report = report.suggest(Suggestion {
                        message_id: Some("addParam".into()),
                        message: "Add a `set` parameter.".to_owned(),
                        fix: Fix::insert(open.end_offset, "set"),
                    });
                }
            }
            reporter.report(report);
        }
    }
}

/// The last `(` before `body`.
fn open_parenthesis_before(file: &File<'_>, body: Span) -> Option<Span> {
    let tokens = &file.javascript().tokens;
    let last = tokens.before(body.start_offset)?;
    (0..=last.index())
        .rev()
        .map(|i| tokens.get(TokenIdentifier::new(i)))
        .find(|token| token.kind == T::LParen)
        .map(|token| token.span)
}
