use std::sync::Arc;

use rsvelte_lint_runner::rule::Reporter;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::kit_route::route_file;
use crate::LintSettings;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-export-load-in-svelte-module-in-kit-pages",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoExportLoad {
        settings: Arc::clone(options.settings),
    }))
}

#[derive(Debug)]
struct NoExportLoad {
    settings: Arc<LintSettings>,
}

impl SvelteRule for NoExportLoad {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let Some(module) = &component.module else {
            return;
        };
        if route_file(&self.settings, file, reporter).is_none() {
            return;
        }
        let tree = &component.javascript;
        let Kind::Program(statements) = tree.kind(module.program) else {
            return;
        };
        for &statement in statements {
            let Kind::ExportNamed(declaration) = tree.kind(statement) else {
                continue;
            };
            match tree.kind(declaration) {
                Kind::Function {
                    name: Some(name),
                    declaration: true,
                    ..
                } => report_load(tree, name, reporter),
                Kind::VariableDeclaration { declarations, .. } => {
                    for &declarator in declarations {
                        if let Kind::Declarator { identifier, .. } = tree.kind(declarator) {
                            report_load(tree, identifier, reporter);
                        }
                    }
                }
                _ => {}
            }
        }
    }
}

fn report_load(tree: &SyntaxTree, identifier: NodeIdentifier, reporter: &mut Reporter<'_>) {
    if tree
        .atom(identifier)
        .is_some_and(|atom| tree.atoms.get(atom) == "load")
    {
        reporter.range(
            "disallow exporting load functions in `*.svelte` module in SvelteKit page components.",
            tree.source_location(identifier)
                .span()
                .expect("a source node has a span"),
        );
    }
}
