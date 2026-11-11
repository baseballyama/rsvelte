use oxc_ast::ast::BindingPattern;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::nodes::span;
use super::svelte_store::{Function, Scopes, rename, store_calls};
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
        let calls = store_calls(file, &["readable", "writable"]);
        if calls.is_empty() {
            return;
        }
        let scopes = Scopes::new(file);
        for (call, _) in calls {
            let Some(function) = call
                .arguments
                .get(1)
                .and_then(|argument| argument.as_expression())
                .and_then(Function::of)
            else {
                continue;
            };
            let parameters = function.parameters;
            let parameter = match parameters.items.first() {
                Some(parameter) => match &parameter.pattern {
                    // A default value makes the parameter a pattern, not a name.
                    BindingPattern::BindingIdentifier(identifier)
                        if parameter.initializer.is_none() && identifier.name != "set" =>
                    {
                        Some(identifier)
                    }
                    _ => continue,
                },
                None if parameters.rest.is_some() => continue,
                None => None,
            };
            let name = parameter.map(|identifier| identifier.name.as_str());
            let mut report = Report::range(
                "Store callbacks must use `set` param.",
                span(&function.span),
            )
            .message_id("unexpected");
            if let Ok(symbol) = scopes.replaceable(file, function, name, "set") {
                if let (Some(parameter), Some(name)) = (parameter, name) {
                    report = report.suggest(Suggestion {
                        message_id: Some("updateParam".into()),
                        message: format!("Rename parameter from {name} to `set`."),
                        fix: rename(file, span(parameter.as_ref()), symbol, "set"),
                    });
                } else if let Some(open) =
                    open_parenthesis_before(file.source(), parameters.span.start, function.body)
                {
                    report = report.suggest(Suggestion {
                        message_id: Some("addParam".into()),
                        message: "Add a `set` parameter.".to_owned(),
                        fix: Fix::insert(open + 1, "set"),
                    });
                }
            }
            reporter.report(report);
        }
    }
}

/// The offset of the last `(` from `start` to `end`, outside comments and strings.
fn open_parenthesis_before(source: &str, start: u32, end: u32) -> Option<u32> {
    let text = source.get(start as usize..end as usize)?.as_bytes();
    let mut last = None;
    let mut at = 0;
    while at < text.len() {
        match text[at] {
            b'(' => last = Some(at),
            b'/' if text.get(at + 1) == Some(&b'/') => {
                while at < text.len() && text[at] != b'\n' {
                    at += 1;
                }
            }
            b'/' if text.get(at + 1) == Some(&b'*') => {
                at += 2;
                while at + 1 < text.len() && !(text[at] == b'*' && text[at + 1] == b'/') {
                    at += 1;
                }
                at += 1;
            }
            quote @ (b'"' | b'\'' | b'`') => {
                at += 1;
                while at < text.len() && text[at] != quote {
                    at += if text[at] == b'\\' { 2 } else { 1 };
                }
            }
            _ => {}
        }
        at += 1;
    }
    last.map(|at| start + u32::try_from(at).expect("a component is shorter than 4 GiB"))
}
