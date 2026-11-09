use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript::scope::Semantic;
use rsvelte_typescript::semantic::reference_tracker::{global_references, property_references};
use rsvelte_typescript::syntax_tree::Control;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::nodes::{span, walk};
use super::runes::is_svelte_file;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-svelte-reactivity",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(PreferSvelteReactivity))
}

#[derive(Debug)]
struct PreferSvelteReactivity;

/// The built-in classes whose constructions the rule checks.
const CLASSES: &[&str] = &["Date", "Map", "Set", "URL", "URLSearchParams"];

/// The methods that change each class's instances.
const MUTATING_CALLS: &[(&str, &[&str])] = &[
    (
        "Date",
        &[
            "setDate",
            "setFullYear",
            "setHours",
            "setMilliseconds",
            "setMinutes",
            "setMonth",
            "setSeconds",
            "setTime",
            "setUTCDate",
            "setUTCFullYear",
            "setUTCHours",
            "setUTCMilliseconds",
            "setUTCMinutes",
            "setUTCMonth",
            "setUTCSeconds",
            "setYear",
        ],
    ),
    ("Map", &["clear", "delete", "set"]),
    ("Set", &["add", "clear", "delete"]),
    ("URLSearchParams", &["append", "delete", "set", "sort"]),
];

/// The properties whose assignment changes a `URL`.
const URL_PROPERTIES: &[&str] = &[
    "hash", "host", "hostname", "href", "password", "pathname", "port", "protocol", "search",
    "username",
];

impl SvelteRule for PreferSvelteReactivity {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !is_svelte_file(file) {
            return;
        }
        let tree = file.javascript();
        let sem = file.semantic();
        let parents = file.parents();
        let exported = if file.is_component() {
            FxHashMap::default()
        } else {
            exported_declarations(file, tree, sem, parents)
        };
        let source = file.source();
        let parent = |node: NodeIdentifier| parents[node.index()].opt();
        for reference in global_references(tree, sem, parents, source, CLASSES) {
            let Some(node) = reference
                .call
                .filter(|&call| matches!(tree.kind(call), Kind::New { .. }))
            else {
                continue;
            };
            let class = reference.name;
            let message = format!(
                "Found a mutable instance of the built-in {class} class. Use Svelte{class} instead."
            );
            let message_id = match class {
                "Date" => "mutableDateUsed",
                "Map" => "mutableMapUsed",
                "Set" => "mutableSetUsed",
                "URL" => "mutableURLUsed",
                _ => "mutableURLSearchParamsUsed",
            };
            // Upstream reports once for each export the construction is in.
            let mut at = Some(node);
            while let Some(current) = at {
                for _ in 0..exported.get(&current).copied().unwrap_or(0) {
                    reporter.report(
                        Report::range(message.clone(), span(tree, node)).message_id(message_id),
                    );
                }
                at = parent(current);
            }
            let mutated = if class == "URL" {
                property_references(tree, sem, parents, source, node, &[], URL_PROPERTIES)
                    .iter()
                    .any(|found| {
                        parent(found.node).is_some_and(|parent| {
                            matches!(tree.kind(parent), Kind::Assign(_, left, _) if left == found.node)
                        })
                    })
            } else {
                let (_, calls) = MUTATING_CALLS
                    .iter()
                    .find(|(name, _)| *name == class)
                    .expect("every traced class has its mutating calls");
                property_references(tree, sem, parents, source, node, &[], calls)
                    .iter()
                    .any(|found| {
                        found
                            .call
                            .is_some_and(|call| matches!(tree.kind(call), Kind::Call { .. }))
                    })
            };
            if mutated {
                reporter.report(Report::range(message, span(tree, node)).message_id(message_id));
            }
        }
    }
}

/// What a `.svelte.js` module exports, declarations and the definitions of exported names, with
/// how many times each is exported.
fn exported_declarations(
    file: &File<'_>,
    tree: &SyntaxTree,
    sem: &Semantic,
    parents: &[NodeIdentifier],
) -> FxHashMap<NodeIdentifier, usize> {
    let definition = |identifier: NodeIdentifier| {
        let binding = &sem.bindings[sem.binding_of(identifier)?];
        binding
            .declaration
            .or_else(|| parents[binding.node.index()].opt())
    };
    let mut exported = FxHashMap::default();
    let mut export = |declaration: Option<NodeIdentifier>| {
        if let Some(declaration) = declaration {
            *exported.entry(declaration).or_default() += 1;
        }
    };
    walk(file, |node| match tree.kind(node) {
        Kind::ExportNamed(declaration) => export(Some(declaration)),
        Kind::ExportDefault(declaration) => {
            if tree.is_identifier(declaration) {
                export(definition(declaration));
            } else {
                export(Some(declaration));
            }
        }
        Kind::Control(Control::ExportSpecifier { local, .. }) if tree.is_identifier(local) => {
            export(definition(local));
        }
        _ => {}
    });
    exported
}
