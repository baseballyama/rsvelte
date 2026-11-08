use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::source::document::Document;
use rsvelte_lint_runner::findings::Findings;
use rsvelte_lint_runner::rule::{Reporter, Rule};
use rsvelte_typescript::{Parsed, Resolved};

use crate::lint::{self, JavaScriptFacts};

#[derive(Debug)]
struct NoUnusedVariables;

impl Rule<JavaScriptFacts<'_>> for NoUnusedVariables {
    fn identifier(&self) -> &'static str {
        "@typescript-eslint/no-unused-vars"
    }

    fn check(&self, context: &JavaScriptFacts<'_>, reporter: &mut Reporter<'_>) {
        lint::no_unused_variables(context, |_| true, reporter);
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "typescript.lint",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript::register(registry);
    registry.task(Lint);
}

#[derive(Debug)]
pub struct Lint;

impl Task for Lint {
    fn identifier(&self) -> &'static str {
        "ts.lint/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_typescript::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let program = match context.get::<Parsed>() {
            Ok(program) => program,
            Err(error) => {
                out.diagnostics.push(error.clone());
                return;
            }
        };
        let sem = context
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed program is resolved");
        let parents = program.syntax_tree.parents();
        let facts = JavaScriptFacts {
            syntax_tree: &program.syntax_tree,
            sem,
            parents: &parents,
        };
        let mut findings = Findings::new();
        findings.run([&NoUnusedVariables], &facts);
        out.file(
            "lint.json",
            rsvelte_lint_runner::output::render_json(
                context.line_index(),
                [NoUnusedVariables.identifier()],
                &findings.finish(),
            ),
        );
    }
}
