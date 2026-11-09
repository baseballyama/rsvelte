use std::sync::Arc;

use rsvelte_lint_runner::rule::Reporter;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::kit_route::{RouteFile, route_file};
use crate::LintSettings;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/valid-prop-names-in-kit-pages",
    files: Files::Components,
    configure,
};

const MESSAGE: &str = "disallow invalid props in SvelteKit route components.";
const PAGE: &[&str] = &["data", "form", "params", "snapshot"];
const LEGACY_PAGE: &[&str] = &["data", "form", "params", "snapshot", "errors"];
const LAYOUT: &[&str] = &["data", "form", "params", "snapshot", "children"];
const ERROR: &[&str] = &["error"];

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(ValidPropNames {
        settings: Arc::clone(options.settings),
    }))
}

#[derive(Debug)]
struct ValidPropNames {
    settings: Arc<LintSettings>,
}

impl SvelteRule for ValidPropNames {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let Some(instance) = &component.instance else {
            return;
        };
        let Some(route) = route_file(&self.settings, file, reporter) else {
            return;
        };
        let expected = match route {
            RouteFile::Page => PAGE,
            RouteFile::Layout => LAYOUT,
            RouteFile::Error => ERROR,
        };
        let tree = &component.javascript;
        let span = |node| {
            tree.source_location(node)
                .span()
                .expect("a source node has a span")
        };
        // `export let` props of the legacy syntax, in every route component.
        if let Kind::Program(statements) = tree.kind(instance.program) {
            for &statement in statements {
                let Kind::ExportNamed(declaration) = tree.kind(statement) else {
                    continue;
                };
                let Kind::VariableDeclaration { declarations, .. } = tree.kind(declaration) else {
                    continue;
                };
                for &declarator in declarations {
                    let Kind::Declarator { identifier, .. } = tree.kind(declarator) else {
                        continue;
                    };
                    match tree.kind(identifier) {
                        Kind::Identifier(name) => {
                            if !LEGACY_PAGE.contains(&tree.atoms.get(name)) {
                                reporter.range(MESSAGE, span(declarator));
                            }
                        }
                        _ => check_pattern(tree, identifier, LEGACY_PAGE, reporter),
                    }
                }
            }
        }
        // `let { … } = $props()` anywhere in the instance script.
        let mut pending = vec![instance.program];
        while let Some(node) = pending.pop() {
            if let Kind::Declarator {
                identifier,
                initializer: Some(initializer),
            } = tree.kind(node)
                && let Kind::Call { callee, .. } = tree.kind(initializer)
                && tree
                    .atom(callee)
                    .is_some_and(|name| tree.atoms.get(name) == "$props")
            {
                check_pattern(tree, identifier, expected, reporter);
            }
            tree.for_each_child(node, |child| pending.push(child));
        }
    }
}

/// Reports each key of an object pattern that is not an expected prop.
fn check_pattern(
    tree: &SyntaxTree,
    pattern: NodeIdentifier,
    expected: &[&str],
    reporter: &mut Reporter<'_>,
) {
    let Kind::ObjectPattern(properties) = tree.kind(pattern) else {
        return;
    };
    for &property in properties {
        let Kind::Property {
            key,
            computed: false,
            ..
        } = tree.kind(property)
        else {
            continue;
        };
        if let Some(name) = tree.atom(key)
            && !expected.contains(&tree.atoms.get(name))
        {
            reporter.range(
                MESSAGE,
                tree.source_location(key)
                    .span()
                    .expect("a source node has a span"),
            );
        }
    }
}
