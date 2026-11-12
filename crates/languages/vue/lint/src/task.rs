use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineBreaks;
use rsvelte_vue_semantic::Resolved;
use rsvelte_vue_syntax::Parsed;

use crate::lint::Enabled;

pub static PLUGIN: Plugin = Plugin {
    identifier: "vue.lint",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "vue.semantic",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

/// Turns on `vue.lint/default` with every rule.
pub fn register(registry: &mut Registry) {
    register_with(registry, crate::lint::every_rule());
}

pub(crate) fn register_with(registry: &mut Registry, rules: Vec<Enabled>) {
    registry.plugin(&PLUGIN);
    rsvelte_vue_semantic::register(registry);
    registry.task(Lint { rules });
}

#[derive(Debug)]
pub struct Lint {
    rules: Vec<Enabled>,
}

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
        let findings = match crate::lint::lint(&rule_context, &self.rules) {
            Ok(findings) => findings,
            Err(error) => {
                out.diagnostics.push(error);
                return;
            }
        };
        rsvelte_lint_runner::output::report(
            out,
            context.lines(LineBreaks::Ecmascript),
            self.rules.iter().map(|rule| rule.rule.identifier()),
            findings,
        );
    }
}
