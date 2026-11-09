use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript::scope::Semantic;
use rsvelte_typescript::semantic::globals::global;
use rsvelte_typescript::syntax_tree::Control;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::nodes::{span, walk};
use super::reference_tracker::{Access, Found, ReferenceTracker, Trace};
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

static CLASSES: Trace<'static> = Trace::properties(&[
    ("Date", Trace::CONSTRUCT),
    ("Map", Trace::CONSTRUCT),
    ("Set", Trace::CONSTRUCT),
    ("URL", Trace::CONSTRUCT),
    ("URLSearchParams", Trace::CONSTRUCT),
]);

/// The methods that change each class's instances.
static MUTATING_CALLS: &[(&str, Trace<'static>)] = &[
    (
        "Date",
        Trace::properties(&[
            ("setDate", Trace::CALL),
            ("setFullYear", Trace::CALL),
            ("setHours", Trace::CALL),
            ("setMilliseconds", Trace::CALL),
            ("setMinutes", Trace::CALL),
            ("setMonth", Trace::CALL),
            ("setSeconds", Trace::CALL),
            ("setTime", Trace::CALL),
            ("setUTCDate", Trace::CALL),
            ("setUTCFullYear", Trace::CALL),
            ("setUTCHours", Trace::CALL),
            ("setUTCMilliseconds", Trace::CALL),
            ("setUTCMinutes", Trace::CALL),
            ("setUTCMonth", Trace::CALL),
            ("setUTCSeconds", Trace::CALL),
            ("setYear", Trace::CALL),
        ]),
    ),
    (
        "Map",
        Trace::properties(&[
            ("clear", Trace::CALL),
            ("delete", Trace::CALL),
            ("set", Trace::CALL),
        ]),
    ),
    (
        "Set",
        Trace::properties(&[
            ("add", Trace::CALL),
            ("clear", Trace::CALL),
            ("delete", Trace::CALL),
        ]),
    ),
    (
        "URLSearchParams",
        Trace::properties(&[
            ("append", Trace::CALL),
            ("delete", Trace::CALL),
            ("set", Trace::CALL),
            ("sort", Trace::CALL),
        ]),
    ),
];

/// The properties whose assignment changes a `URL`.
static URL_PROPERTIES: Trace<'static> = Trace::properties(&[
    ("hash", Trace::READ),
    ("host", Trace::READ),
    ("hostname", Trace::READ),
    ("href", Trace::READ),
    ("password", Trace::READ),
    ("pathname", Trace::READ),
    ("port", Trace::READ),
    ("protocol", Trace::READ),
    ("search", Trace::READ),
    ("username", Trace::READ),
]);

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
        let mut tracker = ReferenceTracker::new(tree, sem, parents, file.source());
        let mut constructions = Vec::new();
        tracker.global_references(
            &CLASSES,
            &["global", "globalThis", "self", "window"],
            |name| global(name).is_some(),
            &mut constructions,
        );
        let mut uses = Vec::new();
        for Found { node, path, .. } in constructions {
            let class = path[0];
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
                at = parents[current.index()].opt();
            }
            uses.clear();
            let mutated = if class == "URL" {
                tracker.property_references(node, &[], &URL_PROPERTIES, &mut uses);
                uses.iter().any(|found| {
                    found.access == Access::Read
                        && tracker.parent(found.node).is_some_and(|parent| {
                            matches!(tree.kind(parent), Kind::Assign(_, left, _) if left == found.node)
                        })
                })
            } else {
                let (_, calls) = MUTATING_CALLS
                    .iter()
                    .find(|(name, _)| *name == class)
                    .expect("every traced class has its mutating calls");
                tracker.property_references(node, &[], calls, &mut uses);
                !uses.is_empty()
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
