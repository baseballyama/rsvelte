use std::sync::Arc;

use rsvelte_lint_runner::rule::Reporter;
use oxc_ast::ast::{BindingIdentifier, BindingPattern, Declaration, Statement};

use super::nodes::span;
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
        let program = component.javascript.get_program(module.program);
        for statement in &program.body {
            let Statement::ExportDeclaration(export) = statement else {
                continue;
            };
            match &export.declaration {
                Declaration::FunctionDeclaration(function) => {
                    if let Some(name) = &function.id {
                        report_load(name, reporter);
                    }
                }
                Declaration::VariableDeclaration(declaration) => {
                    for declarator in &declaration.declarations {
                        if let BindingPattern::BindingIdentifier(name) = &declarator.id {
                            report_load(name, reporter);
                        }
                    }
                }
                _ => {}
            }
        }
    }
}

fn report_load(identifier: &BindingIdentifier<'_>, reporter: &mut Reporter<'_>) {
    if identifier.name == "load" {
        reporter.range(
            "disallow exporting load functions in `*.svelte` module in SvelteKit page components.",
            span(identifier),
        );
    }
}
