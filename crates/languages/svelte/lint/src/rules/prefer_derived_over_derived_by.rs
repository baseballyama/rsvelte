use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_syntax::syntax_tree::flag;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};

use super::nodes::{span, text, walk};
use super::runes::runes_or_undetermined;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-derived-over-derived-by",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(PreferDerivedOverDerivedBy))
}

#[derive(Debug)]
struct PreferDerivedOverDerivedBy;

impl SvelteRule for PreferDerivedOverDerivedBy {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !runes_or_undetermined(file) {
            return;
        }
        let tree = file.javascript();
        let source = file.source();
        walk(file, |node| {
            let Some(expression) = derived_by_expression(tree, node) else {
                return;
            };
            let replacement = format!("$derived({})", text(tree, expression, source));
            reporter.report(
                Report::range(
                    "Unnecessary use of `$derived.by()`. Use `$derived()` directly for simple expressions.",
                    span(tree, node),
                )
                .message_id("unnecessary")
                .fix(Fix::replace(span(tree, node), replacement)),
            );
        });
    }
}

/// The expression a `$derived.by(() => expression)` call returns, when it could be `$derived`.
fn derived_by_expression(tree: &SyntaxTree, call: NodeIdentifier) -> Option<NodeIdentifier> {
    let Kind::Call {
        callee,
        arguments: &[argument],
        ..
    } = tree.kind(call)
    else {
        return None;
    };
    let Kind::Member {
        object,
        property,
        computed: false,
        ..
    } = tree.kind(callee)
    else {
        return None;
    };
    if tree.atom(object).map(|a| tree.atoms.get(a)) != Some("$derived")
        || tree.atom(property).map(|a| tree.atoms.get(a)) != Some("by")
    {
        return None;
    }
    let body = match tree.kind(argument) {
        Kind::Arrow {
            parameters: [],
            body,
            is_async: false,
            expression_body,
        } => {
            if expression_body {
                return Some(body);
            }
            body
        }
        Kind::Function {
            parameters: [],
            body,
            is_async: false,
            declaration: false,
            ..
        } if tree.flags(argument) & flag::GENERATOR == 0 => body,
        _ => return None,
    };
    match tree.kind(body) {
        Kind::Block(&[statement]) => match tree.kind(statement) {
            Kind::Return(argument) => argument,
            _ => None,
        },
        _ => None,
    }
}
