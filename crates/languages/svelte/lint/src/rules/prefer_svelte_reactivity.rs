use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_semantic::reference_tracker::{global_references, property_references};
use oxc_ast::AstKind;
use oxc_ast::ast::{ExportDefaultDeclarationKind, IdentifierReference, ModuleExportName};
use oxc_semantic::NodeId;
use oxc_span::GetSpan;
use rsvelte_typescript_semantic::semantic::Semantic;
use rustc_hash::FxHashMap;

use super::javascript::{span, walk};
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
        let semantic = file.semantic();
        let nodes = semantic.nodes();
        let exported = if file.is_component() {
            FxHashMap::default()
        } else {
            exported_declarations(file, semantic)
        };
        for reference in global_references(semantic, CLASSES) {
            let Some(node) = reference
                .call
                .filter(|&call| matches!(nodes.kind(call), AstKind::NewExpression(_)))
            else {
                continue;
            };
            let at = span(nodes.kind(node).span());
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
            let mut current = node;
            loop {
                for _ in 0..exported.get(&current).copied().unwrap_or(0) {
                    reporter.report(Report::range(message.clone(), at).message_id(message_id));
                }
                let parent = nodes.parent_id(current);
                if parent == current {
                    break;
                }
                current = parent;
            }
            let mutated = if class == "URL" {
                property_references(semantic, node, &[], URL_PROPERTIES)
                    .iter()
                    .any(|found| {
                        let parent = nodes.parent_id(found.node);
                        matches!(
                            nodes.kind(parent),
                            AstKind::AssignmentExpression(assignment)
                                if parent != found.node && assignment.left.node_id() == found.node
                        )
                    })
            } else {
                let (_, calls) = MUTATING_CALLS
                    .iter()
                    .find(|(name, _)| *name == class)
                    .expect("every traced class has its mutating calls");
                property_references(semantic, node, &[], calls)
                    .iter()
                    .any(|found| {
                        found.call.is_some_and(|call| {
                            matches!(nodes.kind(call), AstKind::CallExpression(_))
                        })
                    })
            };
            if mutated {
                reporter.report(Report::range(message, at).message_id(message_id));
            }
        }
    }
}

/// What a `.svelte.js` module exports, declarations and the definitions of exported names, with
/// how many times each is exported.
fn exported_declarations(file: &File<'_>, semantic: &Semantic) -> FxHashMap<NodeId, usize> {
    let scoping = semantic.scoping();
    let definition = |identifier: &IdentifierReference<'_>| {
        let reference = identifier.reference_id.get()?;
        let symbol = scoping.get_reference(reference).symbol_id()?;
        Some(scoping.symbol_declaration(symbol))
    };
    let mut exported = FxHashMap::default();
    let mut export = |declaration: Option<NodeId>| {
        if let Some(declaration) = declaration {
            *exported.entry(declaration).or_default() += 1;
        }
    };
    walk(file, |node| match node.kind() {
        AstKind::ExportDeclaration(declaration) => export(Some(declaration.declaration.node_id())),
        AstKind::ExportDefaultDeclaration(declaration) => match &declaration.declaration {
            ExportDefaultDeclarationKind::Identifier(identifier) => {
                export(definition(identifier));
            }
            declaration => export(Some(declaration.node_id())),
        },
        AstKind::ExportSpecifier(specifier) if !specifier.export_kind.is_type() => {
            // `export type { … }` declares no value.
            let type_only = matches!(
                semantic.nodes().parent_kind(node.id()),
                AstKind::ExportNamedDeclaration(list) if list.export_kind.is_type()
            );
            if let (false, ModuleExportName::IdentifierReference(local)) =
                (type_only, &specifier.local)
            {
                export(definition(local));
            }
        }
        _ => {}
    });
    exported
}
