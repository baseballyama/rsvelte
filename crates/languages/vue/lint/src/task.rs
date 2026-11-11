use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::source::document::Document;
use rsvelte_vue_semantic::Resolved;
use rsvelte_vue_syntax::Parsed;

pub static PLUGIN: Plugin = Plugin {
    identifier: "vue.lint",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "vue.semantic",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_vue_semantic::register(registry);
    registry.task(Lint);
}

#[derive(Debug)]
pub struct Lint;

impl Task for Lint {
    fn identifier(&self) -> &'static str {
        "vue.lint/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_vue_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let c = match context.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        let res = context
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        let rule_context = crate::lint::RuleContext {
            c,
            source_text: context.source_text(),
            path: &context.document.path,
            res,
        };
        let findings = match crate::lint::lint(&rule_context) {
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
                crate::lint::rule_identifiers(),
                &findings,
            ),
        );
    }
}
