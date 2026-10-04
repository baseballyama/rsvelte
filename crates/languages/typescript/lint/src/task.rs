use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_typescript::{Parsed, Resolved};

use crate::lint;
const UNUSED_VARIABLES_RULE: &str = "@typescript-eslint/no-unused-vars";

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
        let facts = lint::JavaScriptFacts {
            syntax_tree: &program.syntax_tree,
            sem,
            parents: &parents,
        };
        let mut findings = Vec::new();
        lint::no_unused_variables(&facts, UNUSED_VARIABLES_RULE, |_| true, &mut findings);
        out.file(
            "lint.json",
            rsvelte_lint::output::render_json(
                context.line_index(),
                &[UNUSED_VARIABLES_RULE],
                &findings,
            ),
        );
    }
}
