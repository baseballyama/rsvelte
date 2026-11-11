use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::source::document::Document;
use rsvelte_lint_runner::findings::Findings;
use rsvelte_lint_runner::rule::{Reporter, Rule};
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::Parsed;

use crate::lint;

#[derive(Debug)]
struct NoUnusedVariables;

impl Rule<Semantic> for NoUnusedVariables {
    fn identifier(&self) -> &'static str {
        "@typescript-eslint/no-unused-vars"
    }

    fn check(&self, context: &Semantic, reporter: &mut Reporter<'_>) {
        lint::no_unused_variables(context, |_| true, |_| &[], reporter);
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "typescript.lint",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript.tree",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript_tree::register(registry);
    registry.task(Lint);
}

#[derive(Debug)]
pub struct Lint;

impl Task for Lint {
    fn identifier(&self) -> &'static str {
        "ts.lint/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_typescript_tree::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let program = match context.get::<Parsed>() {
            Ok(program) => program,
            Err(error) => {
                out.diagnostics.push(error.clone());
                return;
            }
        };
        // This task is the only one that analyzes a standalone file's scopes.
        let semantic = Semantic::program(program.tree.clone(), program.root);
        let mut findings = Findings::new();
        findings.run([&NoUnusedVariables], &semantic);
        let findings = match findings.finish() {
            Ok(findings) => findings,
            Err(error) => {
                out.diagnostics.push(error);
                return;
            }
        };
        out.file(
            "lint.json",
            rsvelte_lint_runner::output::render_json(
                context.ecmascript_line_index(),
                [NoUnusedVariables.identifier()],
                &findings,
            ),
        );
    }
}
