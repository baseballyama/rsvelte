use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_semantic::scope::DeclarationKind;
use rsvelte_typescript_syntax::operators::AssignmentOperator;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};

use super::nodes::{is_named, span, text, walk};
use super::runes::runes_or_undetermined;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-writable-derived",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(PreferWritableDerived))
}

#[derive(Debug)]
struct PreferWritableDerived;

impl SvelteRule for PreferWritableDerived {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !runes_or_undetermined(file) {
            return;
        }
        let tree = file.javascript();
        let source = file.source();
        let sem = file.semantic();
        walk(file, |call| {
            let Some((target, value)) = effect_assignment(tree, call) else {
                return;
            };
            let Some(binding) = sem.binding_of(target).map(|b| &sem.bindings[b]) else {
                return;
            };
            if !matches!(
                binding.kind,
                DeclarationKind::Variable | DeclarationKind::Let | DeclarationKind::Const
            ) {
                return;
            }
            let Some(declarator) = binding.declaration else {
                return;
            };
            let Kind::Declarator {
                initializer: Some(initializer),
                ..
            } = tree.kind(declarator)
            else {
                return;
            };
            let Kind::Call { callee, .. } = tree.kind(initializer) else {
                return;
            };
            if !is_named(tree, callee, "$state") {
                return;
            }
            let mut fix = Fix::replace(
                span(tree, initializer),
                format!("$derived({})", text(tree, value, source)),
            );
            fix.push(span(tree, call), "");
            reporter.report(
                Report::range(
                    "Prefer using writable $derived instead of $state and $effect",
                    span(tree, declarator),
                )
                .message_id("unexpected")
                .suggest(Suggestion {
                    message_id: Some("suggestRewrite".into()),
                    message: "Rewrite $state and $effect to $derived".to_owned(),
                    fix,
                }),
            );
        });
    }
}

/// `$effect(() => { target = value; })` or `$effect.pre(…)` → (`target`, `value`).
fn effect_assignment(
    tree: &SyntaxTree,
    call: NodeIdentifier,
) -> Option<(NodeIdentifier, NodeIdentifier)> {
    let Kind::Call {
        callee,
        arguments: &[argument],
        ..
    } = tree.kind(call)
    else {
        return None;
    };
    let is_effect = match tree.kind(callee) {
        Kind::Identifier(_) => is_named(tree, callee, "$effect"),
        Kind::Member {
            object, property, ..
        } => is_named(tree, object, "$effect") && is_named(tree, property, "pre"),
        _ => false,
    };
    if !is_effect {
        return None;
    }
    let (Kind::Arrow {
        parameters: [],
        body,
        expression_body: false,
        ..
    }
    | Kind::Function {
        parameters: [],
        body,
        declaration: false,
        ..
    }) = tree.kind(argument)
    else {
        return None;
    };
    let Kind::Block(&[statement]) = tree.kind(body) else {
        return None;
    };
    let Kind::ExpressionStatement(expression) = tree.kind(statement) else {
        return None;
    };
    match tree.kind(expression) {
        Kind::Assign(AssignmentOperator::Assign, target, value) if tree.is_identifier(target) => {
            Some((target, value))
        }
        _ => None,
    }
}
