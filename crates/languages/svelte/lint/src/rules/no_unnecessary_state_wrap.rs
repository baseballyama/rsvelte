use oxc_ast::AstKind;
use oxc_ast::ast::{BindingPattern, Expression};
use oxc_semantic::{AstNodes, NodeId, SymbolId};
use oxc_span::GetSpan;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_semantic::reference_tracker::import_references;
use serde::Deserialize;

use super::javascript::{span, walk};
use super::nodes::is_named;
use super::runes::runes_or_undetermined;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-unnecessary-state-wrap",
    files: Files::All,
    configure,
};

/// The classes of `svelte/reactivity`, called or constructed.
const REACTIVE_CLASSES: &[&str] = &[
    "SvelteSet",
    "SvelteMap",
    "SvelteURL",
    "SvelteURLSearchParams",
    "SvelteDate",
    "MediaQuery",
];

#[derive(Default, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Options {
    #[serde(default)]
    additional_reactive_classes: Vec<String>,
    #[serde(default)]
    allow_reassign: bool,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(NoUnnecessaryStateWrap(options)))
}

#[derive(Debug)]
struct NoUnnecessaryStateWrap(Options);

impl SvelteRule for NoUnnecessaryStateWrap {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !runes_or_undetermined(file) {
            return;
        }
        let source = file.source();
        let semantic = file.semantic();
        let scoping = semantic.scoping();
        let nodes = semantic.nodes();
        let report = |reporter: &mut Reporter<'_>,
                      call: oxc_span::Span,
                      argument: oxc_span::Span,
                      class: &str,
                      variable: SymbolId| {
            let reassigned = self.0.allow_reassign
                && scoping
                    .get_resolved_references(variable)
                    .any(oxc_semantic::Reference::is_write);
            if reassigned {
                return;
            }
            reporter.report(
                Report::range(
                    format!("{class} is already reactive, $state wrapping is unnecessary."),
                    span(argument),
                )
                .message_id("unnecessaryStateWrap")
                .suggest(Suggestion {
                    message_id: Some("suggestRemoveStateWrap".into()),
                    message: "Remove unnecessary $state wrapping".to_owned(),
                    fix: Fix::replace(span(call), span(argument).text(source)),
                }),
            );
        };
        walk(file, |node| {
            let AstKind::CallExpression(call) = node.kind() else {
                return;
            };
            if !is_named(&call.callee, "$state") {
                return;
            }
            for argument in &call.arguments {
                let callee = match argument.as_expression() {
                    Some(Expression::NewExpression(construction)) => &construction.callee,
                    Some(Expression::CallExpression(construction)) => &construction.callee,
                    _ => continue,
                };
                let Expression::Identifier(class) = callee else {
                    continue;
                };
                let class = class.name.as_str();
                if self
                    .0
                    .additional_reactive_classes
                    .iter()
                    .any(|c| c == class)
                    && let Some(variable) = declared_symbol(nodes, node.id())
                {
                    report(reporter, call.span, argument.span(), class, variable);
                }
            }
        });
        let found = import_references(
            semantic,
            &file.programs(),
            "svelte/reactivity",
            REACTIVE_CLASSES,
        );
        for reference in found {
            let Some(construction) = reference.call else {
                continue;
            };
            let call = nodes.parent_id(construction);
            let AstKind::CallExpression(state) = nodes.kind(call) else {
                continue;
            };
            if !is_named(&state.callee, "$state") {
                continue;
            }
            if let Some(variable) = declared_symbol(nodes, call) {
                report(
                    reporter,
                    state.span,
                    nodes.kind(construction).span(),
                    reference.name,
                    variable,
                );
            }
        }
    }
}

/// The symbol the parent of `node` declares, when it is a declarator of one name.
fn declared_symbol(nodes: &AstNodes<'_>, node: NodeId) -> Option<SymbolId> {
    let parent = nodes.parent_id(node);
    match nodes.kind(parent) {
        AstKind::VariableDeclarator(declarator) if parent != node => match &declarator.id {
            BindingPattern::BindingIdentifier(identifier) => identifier.symbol_id.get(),
            _ => None,
        },
        _ => None,
    }
}
