use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_semantic::reference_tracker::import_references;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};
use serde::Deserialize;

use super::nodes::{is_named, roots, span, text, walk};
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
        let tree = file.javascript();
        let source = file.source();
        let sem = file.semantic();
        let parents = file.parents();
        let parent = |node: NodeIdentifier| parents[node.index()].opt();
        let report = |reporter: &mut Reporter<'_>, call, argument, class: &str, variable| {
            let reassigned = self.0.allow_reassign
                && sem.binding_of(variable).is_some_and(|binding| {
                    sem.references_to(binding)
                        .any(|reference| reference.write && reference.node != variable)
                });
            if reassigned {
                return;
            }
            reporter.report(
                Report::range(
                    format!("{class} is already reactive, $state wrapping is unnecessary."),
                    span(tree, argument),
                )
                .message_id("unnecessaryStateWrap")
                .suggest(Suggestion {
                    message_id: Some("suggestRemoveStateWrap".into()),
                    message: "Remove unnecessary $state wrapping".to_owned(),
                    fix: Fix::replace(span(tree, call), text(tree, argument, source)),
                }),
            );
        };
        walk(file, |call| {
            let Kind::Call {
                callee, arguments, ..
            } = tree.kind(call)
            else {
                return;
            };
            if !is_named(tree, callee, "$state") {
                return;
            }
            for &argument in arguments {
                let (Kind::New { callee, .. } | Kind::Call { callee, .. }) = tree.kind(argument)
                else {
                    continue;
                };
                let Some(atom) = tree.atom(callee) else {
                    continue;
                };
                let class = tree.atoms.get(atom);
                if self
                    .0
                    .additional_reactive_classes
                    .iter()
                    .any(|c| c == class)
                    && let Some(variable) = declared_identifier(tree, parent(call))
                {
                    report(reporter, call, argument, class, variable);
                }
            }
        });
        let programs: Vec<NodeIdentifier> = roots(file)
            .into_iter()
            .filter(|&root| matches!(tree.kind(root), Kind::Program(_)))
            .collect();
        let found = import_references(
            tree,
            sem,
            parents,
            source,
            &programs,
            "svelte/reactivity",
            REACTIVE_CLASSES,
        );
        for reference in found {
            let Some(construction) = reference.call else {
                continue;
            };
            let Some(call) = parent(construction) else {
                continue;
            };
            let Kind::Call { callee, .. } = tree.kind(call) else {
                continue;
            };
            if !is_named(tree, callee, "$state") {
                continue;
            }
            if let Some(variable) = declared_identifier(tree, parent(call)) {
                report(reporter, call, construction, reference.name, variable);
            }
        }
    }
}

/// The identifier `node` declares, when it is a declarator of one name.
fn declared_identifier(tree: &SyntaxTree, node: Option<NodeIdentifier>) -> Option<NodeIdentifier> {
    match tree.kind(node?) {
        Kind::Declarator { identifier, .. } if tree.is_identifier(identifier) => Some(identifier),
        _ => None,
    }
}
